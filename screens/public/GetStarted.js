import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  StatusBar, 
  Alert,
  ActivityIndicator,
  Platform 
} from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import ROUTES from '../../constants/routes';
import COLORS from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import * as Animatable from 'react-native-animatable';
import RoleSelection from '../../components/shared/RoleSelection';
import { useNavigation } from '@react-navigation/native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import fetchIPGeolocation from '../../services/geolocation';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../services/firebase/config';
import {getDatabase, ref, set } from 'firebase/database';
import { useNotification } from '../../hooks/useNotification';
import { navigationRef } from '../../App';

// Initialize WebBrowser for auth
WebBrowser.maybeCompleteAuthSession();

const GetStarted = () => {
    const navigation = useNavigation();
    const { signupWithGoogle, signupWithApple, login, logout } = useContext(AuthContext);
    const [selectedRole, setSelectedRole] = useState(null);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [appleLoading, setAppleLoading] = useState(false);
    const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
    const [geolocationData, setGeolocationData] = useState(null);
    const [fetchingLocation, setFetchingLocation] = useState(false);


    const { expoPushToken, registerForPushNotificationsAsync, handleNotificationResponse } = useNotification();

    // Google Auth Configuration
    const [request, response, promptAsync] = Google.useAuthRequest({
        // For Expo Go development
        expoClientId: '283581670255-bg5umkf8vnai35ur0hp1i6cepv5fko1v.apps.googleusercontent.com',
        
        // For standalone apps
        iosClientId: Platform.OS === 'ios' ? '283581670255-i89tij454i1l0705lovhrthq7n761b5a.apps.googleusercontent.com' : undefined,
        androidClientId: Platform.OS === 'android' ? '283581670255-ikalnp6e8d90un2dfsmbqmvektqdj38m.apps.googleusercontent.com' : undefined,
        
        scopes: ['profile', 'email', 'openid'],
    });

    // Fetch geolocation on mount
    useEffect(() => {
        fetchGeolocation();
        checkAppleAuthAvailability();
    }, []);

    // Handle Google auth response
    useEffect(() => {
        if (response?.type === 'success') {
            handleGoogleAuthResponse(response);
        } else if (response?.type === 'error') {
            // Don't show alert for user cancellation
            if (response.error?.code !== 'ERR_REQUEST_CANCELED') {
                console.error('Google auth error:', response.error);
                Alert.alert(
                    'Authentication Failed',
                    response.error?.message || 'An error occurred during Google sign-in'
                );
            }
            setGoogleLoading(false);
        }
    }, [response]);

    const fetchGeolocation = async () => {
        try {
            setFetchingLocation(true);
            const data = await fetchIPGeolocation();
            setGeolocationData(data);
            console.log("📍 Location fetched:", data);
        } catch (error) {
            console.error("Failed to fetch location:", error);
        } finally {
            setFetchingLocation(false);
        }
    };

    const fetchUserFirebaseData = async(uid, response) => {
      try {
          const mySnapshot = await get(ref(db, `users/${uid}`))
          setFBCurrentUser(mySnapshot.val())
  
          const data_to_send = {
              resp: response,
              fbUser: mySnapshot.val(),
              expo_push_token: expoPushToken
          }
          
          console.log("Firebase User collected:",data_to_send.fbUser)
  
          login(data_to_send)
  
          
      } catch (error) {
          console.error("Error fetching Firebase data:", error);
          // Even if Firebase fails, still login the user
          const data_to_send = {
              resp: response,
              fbUser: null,
              expo_push_token: expoPushToken
          }
          login(data_to_send);
      }
  }

    const checkAppleAuthAvailability = async () => {
        if (Platform.OS === 'ios') {
            const isAvailable = await AppleAuthentication.isAvailableAsync();
            setAppleAuthAvailable(isAvailable);
        }
    };

    const handleRoleSelect = (role) => {
        console.log('Role selected:', role);
        setSelectedRole(role);
    };

    const handleEmailSignup = () => {
        if (!selectedRole) {
            Alert.alert('Select Role', 'Please select your role first');
            return;
        }
        console.log('Navigating to email signup with role:', selectedRole);
        navigation.navigate(ROUTES.signup, { 
            userType: selectedRole,
            geolocation: geolocationData
        });
    };

    const handleGoogleSignIn = async () => {
        if (!selectedRole) {
            Alert.alert('Select Role', 'Please select your role first');
            return;
        }

        if (fetchingLocation) {
            Alert.alert("Please wait", "Fetching your location...");
            return;
        }
        
        setGoogleLoading(true);
        try {
            console.log(request)
            console.log(response)
            await promptAsync();
        } catch (error) {
            console.error('Google prompt error:', error);
            setGoogleLoading(false);
        }
    };

    const writeUserData = (userData) => {
  
      try {
          // setDoc(doc(db, "userChats", userData._id), {});
          const userId = userData.userId;
          const firstname = userData.firstname;
          const lastname = userData.lastname;
          const email = userData.email;
          const avatar = ""
          const userRef = `users/${userId}`;
          const userDatabaseRef = ref(db, userRef);
          set(userDatabaseRef, {
            userId: userId,
            firstname:firstname,
            lastname:lastname,
            language:"en",
            email:email,
            avatar:avatar
          });
  
          const unreadMsgRef = `unreadMessages/${userId}`;
          const unreadMsgDatabaseRef = ref(db, unreadMsgRef);

          set(unreadMsgDatabaseRef, {
            
          })
          // alert("Data written successfully!");
      } catch (error) {
          console.error("Error writing data: ", error);
          // alert("An error occurred while writing data.");
      }
  
    };

    const updateUser = (udata)=> {
      console.log(udata)
    }

    const handleGoogleAuthResponse = async (response) => {
      
        try {
            const { authentication } = response;
            
            // Get user info from Google
            const userInfoResponse = await fetch(
                'https://www.googleapis.com/oauth2/v2/userinfo',
                {
                    headers: { Authorization: `Bearer ${authentication.accessToken}` },
                }
            );

            if (!userInfoResponse.ok) {
                throw new Error('Failed to fetch user info from Google');
            }

            const user = await userInfoResponse.json();
            
            // Add token to user object
            user.accessToken = authentication.accessToken;
            user.idToken = authentication.idToken;
            user.provider = 'google';
            
            console.log('Google Sign-In Success:', user.email);
            
            // Send to backend via AuthContext
            await handleGoogleBackendLogin(user);
            
        } catch (error) {
            console.error('Google sign-in error:', error);
            Alert.alert(
                'Google Sign-In Error',
                error.message || 'Unable to sign in with Google. Please try again.'
            );
            setGoogleLoading(false);
        }
    };

    
    const handleGoogleBackendLogin = async (googleUser) => {
      // Move baseUrl outside try block so it's accessible in catch
      const baseUrl = 'https://www.freshsweeper.com';
      const endpoint = `${baseUrl}/api/auth/google_auth`;
      
      try {
        const requestBody = {
          token: googleUser.idToken,
          userType: selectedRole
          // Note: Only send token and userType - backend gets email, name from Google token
        };
    
        // LOG REQUEST DETAILS
        console.log('📤 SENDING GOOGLE LOGIN REQUEST:');
        console.log('========================================');
        console.log('Endpoint:', endpoint);
        console.log('Method: POST');
        console.log('Headers:', {
          'Content-Type': 'application/json'
        });
        console.log('Request Body:', JSON.stringify(requestBody, null, 2));
        console.log('Google User Info:', {
          email: googleUser.email,
          name: googleUser.name,
          id: googleUser.id,
          verified: googleUser.verified_email,
          picture: googleUser.picture,
          accessTokenLength: googleUser.accessToken?.length,
          idTokenLength: googleUser.idToken?.length
        });
        console.log('Selected Role:', selectedRole);
        console.log('========================================');
        
        const startTime = Date.now();
        
        // Make the API call with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        let response;
        try {
          response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
          });
          console.log("Response status:", response.status);
        } catch (fetchError) {
          if (fetchError.name === 'AbortError') {
            throw new Error('Request timeout. Please check your connection and try again.');
          }
          throw fetchError;
        } finally {
          clearTimeout(timeoutId);
        }
        
        const responseTime = Date.now() - startTime;
        
        // LOG RESPONSE DETAILS
        console.log('📥 RECEIVED BACKEND RESPONSE:');
        console.log('========================================');
        console.log('Response Time:', `${responseTime}ms`);
        console.log('Status Code:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Response Headers:', Object.fromEntries([...response.headers.entries()]));
        
        let responseData;
        try {
          responseData = await response.json();
          console.log('Response Data:', JSON.stringify(responseData, null, 2));
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError);
          const textResponse = await response.text();
          console.log('Raw response:', textResponse);
          throw new Error(`Invalid server response: ${textResponse.substring(0, 100)}`);
        }
        
        // Check for specific error structures
        if (responseData.detail) {
          console.log('Error Detail:', responseData.detail);
        }
        if (responseData.message) {
          console.log('Message:', responseData.message);
        }
        console.log('========================================');
    
        if (response.ok) {
          // Handle both success and error responses from backend
          if (responseData.status === 'success') {
            // LOG SUCCESS DETAILS
            console.log('✅ GOOGLE SIGN-IN SUCCESSFUL:');
            console.log('User ID:', responseData.data?._id);
            console.log('User Type:', responseData.data?.userType);
            console.log('Token Present:', !!responseData.data?.token);
            console.log('Account Verification:', responseData.data?.account_verification);
            console.log('Onboarding Completed:', responseData.data?.onboarding_completed);
            console.log('Stripe Account ID:', responseData.data?.stripe_account_id);
            console.log('Phone Number:', responseData.data?.phone || 'Not set');
            console.log('========================================');
            
            // Store backend tokens and user data
            if (responseData.data?.token) {
              await AsyncStorage.setItem('@auth_token', responseData.data.token);
              await AsyncStorage.setItem('@user_data', JSON.stringify(responseData.data));
              
              // Also store in a more accessible way
              await AsyncStorage.setItem('@user_id', responseData.data._id);
              await AsyncStorage.setItem('@user_type', responseData.data.userType);
              await AsyncStorage.setItem('@user_email', responseData.data.email);
            }
    
            console.log("USER RESPONSE")
            console.log(responseData.data)
            console.log("USER RESPONSE")

            // Extract data for firebase 
            // Prepare navigation data
            const navDataFb = {
              userId: responseData.data._id,
              userType: responseData.data.userType,
              email: responseData.data.email || googleUser.email,
              firstname: responseData.data.firstname || googleUser.given_name,
              lastname: responseData.data.lastname || googleUser.family_name,
            };
            // Create firebase account
            writeUserData(navDataFb)
            // Check if user has phone number
            const hasPhone = responseData.data?.phone && responseData.data.phone.trim().length > 0;
            
            // Determine if user needs onboarding
            const isNewUser = !responseData.data?.account_verification || 
                             (responseData.data?.userType === 'cleaner' && 
                              !responseData.data?.onboarding_completed);
    
            if (isNewUser) {
              console.log('🔄 New user detected...');
              
              // Prepare navigation data
              const navData = {
                userId: responseData.data._id,
                userType: responseData.data.userType,
                email: responseData.data.email || googleUser.email,
                firstname: responseData.data.firstname || googleUser.given_name,
                lastname: responseData.data.lastname || googleUser.family_name,
                token: responseData.data.token,
                googleUser: googleUser,
                userData: responseData.data
              };
              
             
              // Add geolocation if available
              if (geolocationData) {
                navData.geolocation = geolocationData;
              }
    
              // Check if phone number is already set
              if (hasPhone) {
                console.log('📱 User already has phone number, navigating directly to onboarding...');
                
                // Update Firebase collection if needed
                // writeUserData(navData);
                
                // Navigate directly to appropriate onboarding
                const onboardingRoute = selectedRole === 'cleaner' 
                  ? ROUTES.cleaner_onboarding 
                  : ROUTES.host_onboarding;
                
                console.log('Navigating to:', onboardingRoute);
                console.log('With data:', navData);
                
                navigation.navigate(onboardingRoute, navData);
              } else {
                console.log('📱 Phone number missing, navigating to phone capture...');
                
                // Navigate to phone capture screen first
                navigation.navigate(ROUTES.phone_capture, navData);
              }
            } else {
              console.log('🏠 Existing user, checking if phone number is needed...');
              
              // Check if existing user has phone number
              if (!hasPhone) {
                console.log('📱 Existing user needs phone number, navigating to phone update...');
                
                
                // Navigate to phone update screen
                navigation.navigate(ROUTES.phone_capture, {
                  userId: responseData.data._id,
                  userType: responseData.data.userType,
                  email: responseData.data.email || googleUser.email,
                  firstName: responseData.data.firstname || googleUser.given_name,
                  lastName: responseData.data.lastname || googleUser.family_name,
                  token: responseData.data.token,
                  googleUser: googleUser,
                  userData: responseData.data,
                  geolocation: geolocationData,
                  isExistingUser: true // Flag to show different message
                });
              } else {
                console.log('🏠 Existing user has phone, navigating to dashboard...');
                
                // Store complete user data
                await AsyncStorage.setItem('@complete_user_data', JSON.stringify(responseData.data));
                
                const uid = responseData.data._id
                const resdata = responseData.data
                
                
                registerForPushNotificationsAsync(uid)

                fetchUserFirebaseData(uid, resdata)

                if (navigationRef.current) {
                    navigationRef.current.reset({
                      index: 0,
                      routes: [{ name: resdata.userType === 'host' ? 'Host' : 'Cleaner' }],
                    });
                  } else {
                    console.error('❌ Navigation ref not available');
                  }
              }
            }
          } else {
            // Backend returned ok but with error status
            console.error('❌ BACKEND RETURNED ERROR STATUS:');
            console.error('Error Message:', responseData.message);
            console.error('Full Response:', responseData);
            
            throw new Error(responseData.message || 'Google Sign-In failed on server');
          }
        } else {
          // HTTP error status (4xx or 5xx)
          console.error('❌ HTTP ERROR RESPONSE:');
          console.error('Status:', response.status);
          console.error('Error Data:', responseData);
          
          let errorMessage = responseData.message || responseData.detail || 'Google Sign-In failed';
          
          // Provide more specific error messages
          if (response.status === 401) {
            errorMessage = 'Invalid Google token. Please try signing in again.';
          } else if (response.status === 400) {
            errorMessage = responseData.detail || 'Invalid request. Please check your input.';
          } else if (response.status === 403) {
            errorMessage = 'Access denied. Please contact support.';
          } else if (response.status === 404) {
            errorMessage = 'Server endpoint not found. Please check the configuration.';
          } else if (response.status === 422) {
            errorMessage = 'Validation error. Please check your data.';
          } else if (response.status === 500) {
            errorMessage = `Server error: ${responseData.message || 'Please try again later.'}`;
          } else if (response.status === 502 || response.status === 503 || response.status === 504) {
            errorMessage = 'Service temporarily unavailable. Please try again later.';
          }
          
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error('🔥 GOOGLE SIGN-IN CATCH BLOCK ERROR:');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        
        // Check for specific error types
        if (error.message.includes('Network request failed') || 
            error.message.includes('Failed to fetch') ||
            error.message.includes('TypeError: Network request failed')) {
          console.error('🌐 NETWORK ERROR DETECTED');
          console.error('Endpoint attempted:', endpoint);
          console.error('Possible causes:');
          console.error('1. Server is not running');
          console.error('2. Wrong URL/endpoint');
          console.error('3. Firewall blocking connection');
          console.error('4. CORS issue');
          console.error('5. SSL certificate issue (for HTTPS)');
          
          Alert.alert(
            'Connection Error',
            `Cannot connect to server at ${baseUrl}. Please check:\n\n` +
            '1. Server is running\n' +
            '2. Correct URL/endpoint\n' +
            '3. Network connection\n' +
            '4. SSL certificate (for HTTPS)\n\n' +
            `Error: ${error.message}`
          );
        } else if (error.message.includes('timeout') || error.message.includes('AbortError')) {
          Alert.alert(
            'Timeout Error',
            'The request took too long to complete. Please check your internet connection and try again.'
          );
        } else if (error.message.includes('Invalid server response') || 
                   error.message.includes('JSON Parse error')) {
          Alert.alert(
            'Server Error',
            'The server returned an invalid response. Please contact support.'
          );
        } else {
          // Show user-friendly error message
          let userMessage = error.message;
          
          // Make Google token errors more user-friendly
          if (error.message.includes('Google token') || 
              error.message.includes('Invalid token') ||
              error.message.includes('audience')) {
            userMessage = 'Google sign-in failed. Please try signing in with Google again.';
          }
          
          Alert.alert(
            'Sign-In Error',
            userMessage || 'Unable to process Google Sign-In. Please try again.'
          );
        }
      } finally {
        setGoogleLoading(false);
        // Clear any stored temporary data
        await AsyncStorage.removeItem('@selected_user_type');
      }
    };




    const handleAppleSignIn = async () => {
      if (!selectedRole) {
          Alert.alert('Select Role', 'Please select your role first');
          return;
      }
  
      if (fetchingLocation) {
          Alert.alert("Please wait", "Fetching your location...");
          return;
      }
  
      setAppleLoading(true);
      try {
          const credential = await AppleAuthentication.signInAsync({
              requestedScopes: [
                  AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                  AppleAuthentication.AppleAuthenticationScope.EMAIL,
              ],
          });
  
          console.log("Apple credential received:", credential);
          
          // Send to backend
          await handleAppleBackendLogin(credential, selectedRole);
          
      } catch (error) {
          if (error.code === 'ERR_CANCELED') {
              console.log('Apple Sign-In was canceled by user');
          } else {
              console.error('Apple Sign-In Error:', error);
              Alert.alert('Error', 'Apple Sign-In failed');
          }
      } finally {
          setAppleLoading(false);
      }
  };
  
  // Add this function to handle backend communication
  const handleAppleBackendLogin = async (credential, userType) => {
      try {
          console.log("🍎 Sending Apple credential to backend...");
          
          const baseUrl = 'https://www.freshsweeper.com';
          const endpoint = `${baseUrl}/api/auth/apple_auth`;
          
          console.log("Endpoint:", endpoint);
          console.log("Apple credential:", {
              hasIdentityToken: !!credential.identityToken,
              hasAuthorizationCode: !!credential.authorizationCode,
              user: credential.user,
              fullName: credential.fullName,
              email: credential.email,
              realUserStatus: credential.realUserStatus
          });
          
          // Prepare the request body matching your backend schema
          const requestBody = {
              identityToken: credential.identityToken,
              authorizationCode: credential.authorizationCode,
              userType: userType,
              user: {
                  id: credential.user,
                  email: credential.email,
                  name: credential.fullName ? {
                      firstName: credential.fullName.givenName || "",
                      lastName: credential.fullName.familyName || ""
                  } : null
              }
          };
          
          console.log("Request body:", JSON.stringify(requestBody, null, 2));
          
          const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
              },
              body: JSON.stringify(requestBody),
          });
  
          const responseText = await response.text();
          console.log("Raw response:", responseText);
          
          let data;
          try {
              data = JSON.parse(responseText);
          } catch (parseError) {
              console.error("Failed to parse JSON response:", parseError);
              throw new Error(`Invalid server response: ${responseText.substring(0, 100)}`);
          }
          
          console.log("Parsed backend response:", data);
  
          if (response.ok && data.status === 'success') {
              const userData = data.data;
              
              console.log("✅ Apple sign-in successful via backend");
              console.log("User ID:", userData._id);
              console.log("User Type:", userData.userType);
              
              // Store backend tokens and user data
              if (userData.token) {
                  await AsyncStorage.setItem('@auth_token', userData.token);
                  await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
              }
  
              // Check if user has phone number
              const hasPhone = userData?.phone && userData.phone.trim().length > 0;
              
              // Determine if user needs onboarding
              const isNewUser = !userData?.account_verification || 
                               (userData?.userType === 'cleaner' && 
                                !userData?.onboarding_completed);
  
              if (isNewUser) {
                  console.log('🔄 New user detected...');
                  
                  // Prepare navigation data
                  const navData = {
                      userId: userData._id,
                      userType: userData.userType,
                      email: userData.email || credential.email,
                      firstName: userData.firstname || credential.fullName?.givenName,
                      lastName: userData.lastname || credential.fullName?.familyName,
                      token: userData.token,
                      appleCredential: credential,
                      userData: userData
                  };
                  
                  // Add geolocation if available
                  if (geolocationData) {
                      navData.geolocation = geolocationData;
                  }
  
                  // Check if phone number is already set
                  if (hasPhone) {
                      console.log('📱 User already has phone number, navigating directly to onboarding...');
                      
                      // Navigate directly to appropriate onboarding
                      const onboardingRoute = selectedRole === 'cleaner' 
                        ? ROUTES.cleaner_onboarding 
                        : ROUTES.host_onboarding;
                      
                      console.log('Navigating to:', onboardingRoute);
                      navigation.navigate(onboardingRoute, navData);
                  } else {
                      console.log('📱 Phone number missing, navigating to phone capture...');
                      
                      // Navigate to phone capture screen first
                      navigation.navigate(ROUTES.phone_capture, navData);
                  }
              } else {
                  console.log('🏠 Existing user, navigating to dashboard...');
                  
                  // Store complete user data
                  await AsyncStorage.setItem('@complete_user_data', JSON.stringify(userData));
                  
                  const uid = userData._id
                  const resdata = userData
                 
                  
                  registerForPushNotificationsAsync(uid)
                  fetchUserFirebaseData(uid, resdata)

                  if (navigationRef.current) {
                    navigationRef.current.reset({
                      index: 0,
                      routes: [{ name: resdata.userType === 'host' ? 'Host' : 'Cleaner' }],
                    });
                  } else {
                    console.error('❌ Navigation ref not available');
                  }
              }
          } else {
              let errorMessage = data.message || data.detail || 'Apple Sign-In failed';
              
              // Handle specific backend errors
              if (errorMessage.includes('Email is required')) {
                  errorMessage = 'Apple Sign-In requires email permission. Please grant email access and try again.';
              } else if (errorMessage.includes('userType is required')) {
                  errorMessage = 'Please select your role (host or cleaner).';
              }
              
              throw new Error(errorMessage);
          }
      } catch (error) {
          console.error('❌ Apple backend login error:', error);
          
          let errorMessage = error.message || 'Unable to process Apple Sign-In. Please try again.';
          
          // Handle network errors
          if (error.message.includes('Network request failed') || 
              error.message.includes('Failed to fetch')) {
              errorMessage = 'Network error. Please check your internet connection.';
          }
          
          Alert.alert(
              'Apple Sign-In Error',
              errorMessage
          );
      }
  };

    // Helper to show location status
    const renderLocationStatus = () => {
        if (fetchingLocation) {
            return (
                <View style={styles.locationStatus}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={styles.locationText}>Detecting your location...</Text>
                </View>
            );
        }
        
        if (geolocationData) {
            return (
                <View style={[styles.locationStatus, styles.locationSuccess]}>
                    <MaterialCommunityIcons 
                        name="check-circle" 
                        size={16} 
                        color="#4CAF50" 
                    />
                    <Text style={styles.locationText}>
                        Location: {geolocationData.city}, {geolocationData.country}
                    </Text>
                </View>
            );
        }
        
        return null;
    };

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
            
            <Animatable.View 
                animation="slideInRight"
                style={[styles.footer, {
                    backgroundColor: COLORS.white
                }]}
            >
                {/* Location status indicator */}
                {renderLocationStatus()}
                
                {/* RoleSelection with onRoleSelect prop */}
                <RoleSelection 
                    onRoleSelect={handleRoleSelect}
                    selectedRole={selectedRole}
                />



                {/* Authentication Buttons - Show immediately when role is selected */}
                {selectedRole && (
                    <Animatable.View 
                        animation="fadeInUp"
                        duration={500}
                        style={styles.authButtons}
                    >
                        <TouchableOpacity
                            style={[styles.button, styles.emailButton]}
                            onPress={handleEmailSignup}
                            disabled={fetchingLocation}
                        >
                            <MaterialCommunityIcons 
                                name="email-outline" 
                                size={24} 
                                color="#fff" 
                                style={styles.buttonIcon}
                            />
                            <Text style={styles.buttonText}>
                                Continue with Email
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Google Sign-In Button */}
                        <TouchableOpacity
                            style={[styles.button, styles.googleButton]}
                            onPress={handleGoogleSignIn}
                            disabled={!request || googleLoading || fetchingLocation}
                        >
                            <View style={styles.buttonContent}>
                                {googleLoading ? (
                                    <ActivityIndicator size="small" color="#4285F4" />
                                ) : (
                                    <MaterialCommunityIcons 
                                        name="google" 
                                        size={24} 
                                        color="#4285F4" 
                                    />
                                )}
                                <Text style={[styles.buttonText, styles.googleButtonText]}>
                                    {googleLoading ? 'Signing in...' : 'Continue with Google'}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Apple Sign-In Button (iOS only) */}
                        {Platform.OS === 'ios' && appleAuthAvailable && (
                            <TouchableOpacity
                                style={[styles.button, styles.appleButton]}
                                onPress={handleAppleSignIn}
                                disabled={appleLoading || fetchingLocation}
                            >
                                <View style={styles.buttonContent}>
                                    {appleLoading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <MaterialCommunityIcons 
                                            name="apple" 
                                            size={24} 
                                            color="#fff" 
                                        />
                                    )}
                                    <Text style={[styles.buttonText, styles.appleButtonText]}>
                                        {appleLoading ? 'Signing in...' : 'Continue with Apple'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.loginLink}
                            onPress={() => navigation.navigate(ROUTES.login_options)}
                        >
                            <Text style={styles.loginText}>
                                Already have an account?{' '}
                                <Text style={styles.loginLinkText}>Log In</Text>
                            </Text>
                        </TouchableOpacity>
                    </Animatable.View>
                )}
            </Animatable.View>
        </View>
    );
};

export default GetStarted;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        padding: 20
    },
    footer: {
        flex: 1,
        justifyContent: 'center',
    },
    locationStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F9FA',
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    locationSuccess: {
        backgroundColor: '#E8F5E9',
        borderColor: '#C8E6C9',
    },
    locationText: {
        marginLeft: 8,
        color: '#495057',
        fontSize: 12,
        fontWeight: '500',
    },
    authButtons: {
        marginTop: 40,
    },
    button: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    emailButton: {
        backgroundColor: COLORS.primary,
    },
    googleButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    appleButton: {
        backgroundColor: '#000',
        borderWidth: 1,
        borderColor: '#000',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonIcon: {
        marginRight: 12,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    googleButtonText: {
        color: '#3c4043',
        marginLeft: 12,
    },
    appleButtonText: {
        color: '#fff',
        marginLeft: 12,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    dividerText: {
        marginHorizontal: 10,
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },
    loginLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    loginText: {
        color: '#666',
        fontSize: 14,
    },
    loginLinkText: {
        color: COLORS.primary,
        fontWeight: '600',
    },
});