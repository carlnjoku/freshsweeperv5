import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ROUTES from '../../constants/routes';
import COLORS from '../../constants/colors';
import * as Animatable from 'react-native-animatable';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import fetchIPGeolocation from '../../services/geolocation';
import { db } from '../../services/firebase/config';
import { ref, get, set } from 'firebase/database';
import { useNotification } from '../../hooks/useNotification';
import { AuthContext } from '../../context/AuthContext';
import { navigationRef } from '../../App';


// Initialize WebBrowser for auth
WebBrowser.maybeCompleteAuthSession();

const LoginOptions = () => {
  const navigation = useNavigation();
  const [appleLoading, setAppleLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
  const [fbCurrentUser, setFBCurrentUser] = useState({});
  const [geolocationData, setGeolocationData] = useState({});

  // Use the hook only once and get all values
  const { expoPushToken, registerForPushNotificationsAsync, handleNotificationResponse } = useNotification();
  const { login, loginWithEmailPassword } = useContext(AuthContext);

  // Google Auth Configuration - Replace with your actual IDs
  const [request, response, promptAsync] = Google.useAuthRequest({
    // For Expo Go development
    expoClientId: '283581670255-bg5umkf8vnai35ur0hp1i6cepv5fko1v.apps.googleusercontent.com', // Web client ID
    
    // For standalone apps (optional but recommended)
    iosClientId: Platform.OS === 'ios' ? '283581670255-i89tij454i1l0705lovhrthq7n761b5a.apps.googleusercontent.com' : undefined,
    androidClientId: Platform.OS === 'android' ? '283581670255-ikalnp6e8d90un2dfsmbqmvektqdj38m.apps.googleusercontent.com' : undefined,
    
    
    // Scopes for permissions
    scopes: ['profile', 'email', 'openid'],
  });

  const fetchGeolocation = async () => {
    try {
      const data = await fetchIPGeolocation();
      setGeolocationData(data);
    } catch (error) {
      console.error("Error fetching geolocation:", error);
    }
  };

  useEffect(() => {
    const getGeoData = async () => {
      await fetchGeolocation();
    };
  
    getGeoData();
  }, []);

  // Check if Apple Authentication is available
  useEffect(() => {
    checkAppleAuthAvailability();
    
  }, []);

  // Handle Google auth response
  useEffect(() => {
    handleGoogleAuthResponse();
  }, [response]);

  const checkAppleAuthAvailability = async () => {
    try {
      if (Platform.OS === 'ios') {
        const isAvailable = await AppleAuthentication.isAvailableAsync();
        setAppleAuthAvailable(isAvailable);
      }
    } catch (error) {
      console.error('Error checking Apple Auth:', error);
      setAppleAuthAvailable(false);
    }
  };

  // Handle Google Auth Response
  const handleGoogleAuthResponse = async () => {
    
    if (response?.type === 'success') {
      const { authentication } = response;
      
      setGoogleLoading(true);
      try {
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
        
        // Store user data locally
        await AsyncStorage.setItem('@google_user', JSON.stringify(user));
        
        // Send to your backend for verification/token exchange
        await handleGoogleBackendLogin(user);
        
      } catch (error) {
        console.error('Google sign-in error:', error);
        Alert.alert(
          'Google Sign-In Error',
          error.message || 'Unable to sign in with Google. Please try again.'
        );
        setGoogleLoading(false);
      }
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

        
        
        // Update expo push token if different
        // if(response.expo_push_token !== expoPushToken){
        //     const userTokenData = {
        //         userId: uid,
        //         expo_push_token: expoPushToken
        //     }
        //     userService.updateExpoPushToken(userTokenData)
        // }
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

// Handle sending Google credentials to your backend
// const handleGoogleBackendLogin = async (googleUser) => {
//     try {
//       // Use your actual backend endpoint
//       // Replace localhost with your actual server IP/domain
//       const baseUrl = 'https://www.freshsweeper.com'; // or your server address
//       const endpoint = `${baseUrl}/api/auth/google_auth`;
     
//       console.log('Sending Google token to backend:', {
//         endpoint: endpoint,
//         token: googleUser.idToken
//       });
      
//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           token: googleUser.idToken,
//           userType: "host" // or "cleaner" - you might need to get this from user
//         }),
//       });
  
//       const data = await response.json();
//       console.log('Backend response:', data);
  
//       if (response.ok && data.status === 'success') {

        
//         // // Store backend tokens
//         // if (data.data?.token) {
//         //   await AsyncStorage.setItem('@auth_token', data.data.token);
          
//         //   // Store user data for future use
//         //   await AsyncStorage.setItem('@user_data', JSON.stringify(data.data));
//         // }
  
//         // // Check if user needs onboarding
//         // const needsOnboarding = data.data?.onboarding_completed === false || 
//         //                         data.data?.account_verification === false;
        
//         // // For cleaners, check if Stripe onboarding is needed
//         // if (data.data?.userType === "cleaner") {
//         //   const cleanerNeedsOnboarding = 
//         //     !data.data.onboarding_completed || 
//         //     !data.data.identity_verified ||
//         //     !data.data.stripe_account_id;
            
//         //   if (cleanerNeedsOnboarding) {
//         //     navigation.navigate(ROUTES.cleaner_dashboard, {
//         //       fromGoogle: true,
//         //       userData: data.data,
//         //     });
//         //   } else {
//         //     navigation.navigate(ROUTES.host_home_tab, {
//         //       user: data.data,
//         //     });
//         //   }
//         // } 
       
//         // // For hosts
//         // else if (data.data?.userType === "host") {
//         //   if (!data.data?.account_verification) {
//         //     navigation.navigate(ROUTES.host_home_tab, {
//         //       fromGoogle: true,
//         //       userData: data.data,
//         //     });
//         //   } else {
//         //     navigation.navigate(ROUTES.account_verification_gate, {
//         //       user: data.data,
//         //     });
//         //   }
//         // }

//         const userData = data.data
//         console.log("Registering push notifications for userId:", userData._id);
//         registerForPushNotificationsAsync(userData._id);
        
//         // Fetch Firebase user data and update AuthContext
//         await fetchUserFirebaseData(userData._id, userData);
                
//       } else {
//         throw new Error(data.message || 'Google Sign-In failed');
//       }
//     } catch (error) {
//       console.error('Backend Google login error:', error);
//       Alert.alert(
//         'Error',
//         error.message || 'Unable to process Google Sign-In. Please try again.'
//       );
//     } finally {
//       setGoogleLoading(false);
//     }
//   };



const handleGoogleBackendLogin = async (googleUser) => {
    try {
      // Use your actual backend endpoint
      // Replace localhost with your actual server IP/domain
      const baseUrl = 'https://www.freshsweeper.com'; // or your server address
      const endpoint = `${baseUrl}/api/auth/google_auth`;
      
      console.log('Sending Google token to backend:', {
        endpoint: endpoint,
        token: googleUser.idToken ? 'Token present' : 'NO TOKEN',
        tokenLength: googleUser.idToken?.length || 0,
        userType: "host"
      });
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          token: googleUser.idToken,
          userType: "host" // or "cleaner" - you might need to get this from user
        }),
      });
  
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries([...response.headers]));
  
      // Check if response is OK
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // If not JSON, try to get text
          const text = await response.text();
          errorData = { message: text || `HTTP ${response.status}` };
        }
        
        throw new Error(
          `HTTP ${response.status}: ${errorData.message || errorData.detail || 'Unknown error'}`
        );
      }
  
      // Try to parse successful response
      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Invalid JSON response from server');
      }
  
      console.log('Backend response data:', JSON.stringify(data, null, 2));
  
      if (data.status === 'success' && data.data) {
        const userData = data.data;
        console.log("Registering push notifications for userId:", userData._id);
        
        // Register push notifications
        registerForPushNotificationsAsync(userData._id);
        
        // Fetch Firebase user data and update AuthContext
        await fetchUserFirebaseData(userData._id, userData);
        if (navigationRef.current) {
          navigationRef.current.reset({
            index: 0,
            routes: [{ name: userData.userType === 'host' ? 'Host' : 'Cleaner' }],
          });
        } else {
          console.error('❌ Navigation ref not available');
        }
      } else {
        throw new Error(
          data.message || 
          data.error || 
          data.detail || 
          'Authentication failed'
        );
      }
    } catch (error) {
      console.error('Backend Google login error details:');
      console.error('- Error message:', error.message);
      console.error('- Error name:', error.name);
      console.error('- Error stack:', error.stack);
      
      // Check for specific error types
      if (error.message.includes('Network request failed')) {
        Alert.alert(
          'Network Error',
          'Please check your internet connection and try again.'
        );
      } else if (error.message.includes('Failed to fetch')) {
        Alert.alert(
          'Connection Failed',
          'Unable to connect to the server. Please try again later.'
        );
      } else if (error.message.includes('Invalid JSON')) {
        Alert.alert(
          'Server Error',
          'Invalid response from server. Please try again.'
        );
      } else {
        Alert.alert(
          'Authentication Error',
          error.message || 'Unable to process Google Sign-In. Please try again.'
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailLogin = () => {
    navigation.navigate(ROUTES.signin, { loginMethod: 'email' });
  };

  const handleGoogleLogin = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error('Google prompt error:', error);
      setGoogleLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setAppleLoading(true);
      
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('Apple Sign-In Success:', {
        user: credential.user,
        email: credential.email,
        fullName: credential.fullName,
      });

      // Send Apple credential to your backend
      await handleAppleCredential(credential);
      
    } catch (error) {
      if (error.code === 'ERR_CANCELED') {
        // User cancelled Apple Sign-In
        console.log('Apple Sign-In was cancelled');
      } else {
        console.error('Apple Sign-In Error:', error);
        Alert.alert(
          'Apple Sign-In Error',
          'Unable to sign in with Apple. Please try another method.'
        );
      }
      setAppleLoading(false);
    }
  };

  const handleAppleCredential = async (credential) => {
    try {
      // Send to your FastAPI backend
    //   const baseUrl = 'https://www.freshsweeper.com/api/auth/google_auth'; // or your server address
    //   const endpoint = `${baseUrl}/api/auth/google_auth`;

      const response = await fetch('https://www.freshsweeper.com/api/auth/apple_auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identityToken: credential.identityToken,
          authorizationCode: credential.authorizationCode,
          user: {
            id: credential.user,
            email: credential.email,
            name: credential.fullName,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store backend tokens if provided
        // if (data.access_token) {
        //   await AsyncStorage.setItem('@auth_token', data.access_token);
        //   await AsyncStorage.setItem('@refresh_token', data.refresh_token || '');
        // }

        // // Success - navigate based on user status
        // if (data.is_new_user) {
        //   navigation.navigate(ROUTES.getting_started, {
        //     fromApple: true,
        //     appleData: data,
        //   });
        // } else {
        //   navigation.navigate(ROUTES.dashboard);
        // }

        const userData = data.data
        console.log("Apple return data:", userData)
        console.log("Registering push notifications for userId:", userData._id);
        registerForPushNotificationsAsync(userData._id);
        
        // Fetch Firebase user data and update AuthContext
        await fetchUserFirebaseData(userData._id, userData);
        
        if (navigationRef.current) {
          navigationRef.current.reset({
            index: 0,
            routes: [{ name: userData.userType === 'host' ? 'Host' : 'Cleaner' }],
          });
        } else {
          console.error('❌ Navigation ref not available');
        }
      } else {
        throw new Error(data.detail || 'Apple Sign-In failed');
      }
    } catch (error) {
      console.error('Apple credential error:', error);
      Alert.alert(
        'Error',
        'Unable to process Apple Sign-In. Please try another method.'
      );
    } finally {
      setAppleLoading(false);
    }
  };

  

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
      </TouchableOpacity>

      <Animatable.View 
        animation="fadeInUp"
        duration={600}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>
            Choose how you'd like to login to your account
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {/* Apple Sign-In (iOS only) */}
          {Platform.OS === 'ios' && appleAuthAvailable && (
            <Animatable.View 
              animation="slideInRight"
              duration={800}
              delay={100}
            >
              <TouchableOpacity
                style={[styles.optionCard, styles.appleCard]}
                onPress={handleAppleLogin}
                activeOpacity={0.8}
                disabled={appleLoading || googleLoading}
              >
                <View style={styles.optionContent}>
                  <View style={[styles.iconContainer, styles.appleIconContainer]}>
                    <MaterialCommunityIcons 
                      name="apple" 
                      size={32} 
                      color="#000" 
                    />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.optionTitle}>Continue with Apple</Text>
                    <Text style={styles.optionDescription}>
                      Securely sign in with your Apple ID
                    </Text>
                  </View>
                  {appleLoading && (
                    <ActivityIndicator size="small" color="#000" style={styles.loadingIndicator} />
                  )}
                </View>
                {!appleLoading && (
                  <MaterialCommunityIcons 
                    name="chevron-right" 
                    size={24} 
                    color="#999" 
                  />
                )}
              </TouchableOpacity>
            </Animatable.View>
          )}

          {/* Google Login Option */}
          <Animatable.View 
            animation="slideInRight"
            duration={800}
            delay={200}
          >
            <TouchableOpacity
              style={[styles.optionCard, styles.googleCard]}
              onPress={handleGoogleLogin}
              activeOpacity={0.8}
              disabled={!request || googleLoading || appleLoading}
            >
              <View style={styles.optionContent}>
                <View style={[styles.iconContainer, styles.googleIconContainer]}>
                  <MaterialCommunityIcons 
                    name="google" 
                    size={32} 
                    color="#DB4437" 
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.optionTitle}>
                    Continue with Google
                  </Text>
                  <Text style={styles.optionDescription}>
                    Quick login with your Google account
                  </Text>
                </View>
                {googleLoading && (
                  <ActivityIndicator size="small" color="#DB4437" style={styles.loadingIndicator} />
                )}
              </View>
              {!googleLoading && (
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={24} 
                  color="#999" 
                />
              )}
            </TouchableOpacity>
          </Animatable.View>

          {/* Email Login Option */}
          <Animatable.View 
            animation="slideInRight"
            duration={800}
            delay={300}
          >
            <TouchableOpacity
              style={[styles.optionCard, styles.emailCard]}
              onPress={handleEmailLogin}
              activeOpacity={0.8}
              disabled={appleLoading || googleLoading}
            >
              <View style={styles.optionContent}>
                <View style={[styles.iconContainer, styles.emailIconContainer]}>
                  <MaterialCommunityIcons 
                    name="email-outline" 
                    size={32} 
                    color={COLORS.primary} 
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.optionTitle}>Continue with Email</Text>
                  <Text style={styles.optionDescription}>
                    Login with your email and password
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={24} 
                color="#999" 
              />
            </TouchableOpacity>
          </Animatable.View>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Create Account Link */}
        <Animatable.View 
          animation="fadeIn"
          duration={600}
          delay={400}
          style={styles.signupContainer}
        >
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate(ROUTES.getting_started)}
            disabled={appleLoading || googleLoading}
          >
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </Animatable.View>
      </Animatable.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  appleCard: {
    borderColor: '#f0f0f0',
  },
  googleCard: {
    borderColor: '#f0f0f0',
  },
  emailCard: {
    borderColor: '#f0f0f0',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  appleIconContainer: {
    backgroundColor: '#f8f8f8',
  },
  googleIconContainer: {
    backgroundColor: '#f8f8f8',
  },
  emailIconContainer: {
    backgroundColor: '#f8f8f8',
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  loadingIndicator: {
    marginLeft: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#999',
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    fontSize: 14,
    color: '#666',
  },
  signupLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default LoginOptions;




// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   SafeAreaView,
//   StatusBar,
//   Platform,
//   ActivityIndicator,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import * as AppleAuthentication from 'expo-apple-authentication';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import ROUTES from '../../constants/routes';
// import COLORS from '../../constants/colors';
// import * as Animatable from 'react-native-animatable';
// import * as WebBrowser from 'expo-web-browser';
// import * as Google from 'expo-auth-session/providers/google';

// // Initialize WebBrowser for auth
// WebBrowser.maybeCompleteAuthSession();

// const LoginOptions = () => {
//   const navigation = useNavigation();
//   const [appleLoading, setAppleLoading] = useState(false);
//   const [googleLoading, setGoogleLoading] = useState(false);
//   const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);

//   // 🔴 FIXED: Updated Google Auth Configuration
//   const [request, response, promptAsync] = Google.useAuthRequest({
//     // ⚠️ REPLACE WITH YOUR ACTUAL WEB CLIENT ID FROM GOOGLE CLOUD CONSOLE
//     // This should be the "Web Application" Client ID, NOT iOS/Android
//     expoClientId: '71969730539-4cum30gqpmvm4metu6e64n8h6ri4ov1b.apps.googleusercontent.com', // e.g., 1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
    
//     // ⚠️ ADD THIS LINE - This fixes the 401 error
//     redirectUri: 'https://auth.expo.io/@anonymous/freshsweeperv5',
    
//     // ⚠️ COMMENT OUT OR REMOVE THESE FOR NOW (add back later)
//     iosClientId: '71969730539-dglvkpjqmfgllbs91ma8qm63gb78rq2o.apps.googleusercontent.com',
//     // androidClientId: 'YOUR_ANDROID_CLIENT_ID',
//     // webClientId: 'YOUR_WEB_CLIENT_ID',
    
//     scopes: ['profile', 'email'],
//   });

//   // Check if Apple Authentication is available
//   useEffect(() => {
//     checkAppleAuthAvailability();
//   }, []);

//   // Handle Google auth response
//   useEffect(() => {
//     handleGoogleAuthResponse();
//   }, [response]);

//   // 🔴 ADD THIS: Debug logging to see what's happening
//   useEffect(() => {
//     if (response) {
//       console.log('🔍 Google Auth Response:', response);
//       if (response.type === 'error') {
//         console.log('🔍 Error details:', response.error);
//         console.log('🔍 Request was:', request);
//       }
//     }
//   }, [response]);

//   const checkAppleAuthAvailability = async () => {
//     try {
//       if (Platform.OS === 'ios') {
//         const isAvailable = await AppleAuthentication.isAvailableAsync();
//         setAppleAuthAvailable(isAvailable);
//       }
//     } catch (error) {
//       console.error('Error checking Apple Auth:', error);
//       setAppleAuthAvailable(false);
//     }
//   };

//   // Handle Google Auth Response
//   const handleGoogleAuthResponse = async () => {
//     if (response?.type === 'success') {
//       const { authentication } = response;
      
//       setGoogleLoading(true);
//       try {
//         // Get user info from Google
//         const userInfoResponse = await fetch(
//           'https://www.googleapis.com/oauth2/v2/userinfo',
//           {
//             headers: { Authorization: `Bearer ${authentication.accessToken}` },
//           }
//         );

//         if (!userInfoResponse.ok) {
//           throw new Error('Failed to fetch user info from Google');
//         }

//         const user = await userInfoResponse.json();
        
//         // Add token to user object
//         user.accessToken = authentication.accessToken;
//         user.idToken = authentication.idToken;
//         user.provider = 'google';
        
//         console.log('✅ Google Sign-In Success:', user.email);
        
//         // Store user data locally
//         await AsyncStorage.setItem('@google_user', JSON.stringify(user));
        
//         Alert.alert('Success', `Welcome ${user.name}!`);
        
//         // Navigate to dashboard or appropriate screen
//         navigation.navigate(ROUTES.dashboard, { user });
        
//       } catch (error) {
//         console.error('❌ Google sign-in error:', error);
//         Alert.alert(
//           'Google Sign-In Error',
//           error.message || 'Unable to sign in with Google. Please try again.'
//         );
//         setGoogleLoading(false);
//       }
//     } else if (response?.type === 'error') {
//       // Don't show alert for user cancellation
//       if (response.error?.code !== 'ERR_REQUEST_CANCELED') {
//         console.error('❌ Google auth error:', response.error);
        
//         // Show helpful error message based on error code
//         let errorMessage = 'An error occurred during Google sign-in';
        
//         if (response.error?.code === '401') {
//           errorMessage = 'Invalid Client ID configuration. Please check:\n\n1. You\'re using a Web Application Client ID\n2. Redirect URI is: https://auth.expo.io/@anonymous/freshsweeperv5\n3. This URI is added in Google Cloud Console';
//         } else if (response.error?.code === 'redirect_uri_mismatch') {
//           errorMessage = 'Redirect URI mismatch. Please add this to Google Cloud Console:\n\nhttps://auth.expo.io/@anonymous/freshsweeperv5';
//         }
        
//         Alert.alert('Authentication Failed', errorMessage);
//       }
//       setGoogleLoading(false);
//     }
//   };

//   const handleEmailLogin = () => {
//     navigation.navigate(ROUTES.signin, { loginMethod: 'email' });
//   };

//   const handleGoogleLogin = async () => {
//     try {
//       console.log('🔄 Starting Google Sign-In...');
//       await promptAsync();
//     } catch (error) {
//       console.error('❌ Google prompt error:', error);
//       setGoogleLoading(false);
//     }
//   };

//   const handleAppleLogin = async () => {
//     try {
//       setAppleLoading(true);
      
//       const credential = await AppleAuthentication.signInAsync({
//         requestedScopes: [
//           AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
//           AppleAuthentication.AppleAuthenticationScope.EMAIL,
//         ],
//       });

//       console.log('Apple Sign-In Success:', {
//         user: credential.user,
//         email: credential.email,
//         fullName: credential.fullName,
//       });

//       // Send Apple credential to your backend
//       await handleAppleCredential(credential);
      
//     } catch (error) {
//       if (error.code === 'ERR_CANCELED') {
//         // User cancelled Apple Sign-In
//         console.log('Apple Sign-In was cancelled');
//       } else {
//         console.error('Apple Sign-In Error:', error);
//         Alert.alert(
//           'Apple Sign-In Error',
//           'Unable to sign in with Apple. Please try another method.'
//         );
//       }
//       setAppleLoading(false);
//     }
//   };

//   const handleAppleCredential = async (credential) => {
//     try {
//       // Send to your FastAPI backend
//       const response = await fetch('http://your-api.com/api/auth/oauth/apple', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           identityToken: credential.identityToken,
//           authorizationCode: credential.authorizationCode,
//           user: {
//             id: credential.user,
//             email: credential.email,
//             name: credential.fullName,
//           },
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         // Store backend tokens if provided
//         if (data.access_token) {
//           await AsyncStorage.setItem('@auth_token', data.access_token);
//           await AsyncStorage.setItem('@refresh_token', data.refresh_token || '');
//         }

//         // Success - navigate based on user status
//         if (data.is_new_user) {
//           navigation.navigate(ROUTES.getting_started, {
//             fromApple: true,
//             appleData: data,
//           });
//         } else {
//           navigation.navigate(ROUTES.dashboard);
//         }
//       } else {
//         throw new Error(data.detail || 'Apple Sign-In failed');
//       }
//     } catch (error) {
//       console.error('Apple credential error:', error);
//       Alert.alert(
//         'Error',
//         'Unable to process Apple Sign-In. Please try another method.'
//       );
//     } finally {
//       setAppleLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
//       {/* Back Button */}
//       <TouchableOpacity
//         style={styles.backButton}
//         onPress={() => navigation.goBack()}
//       >
//         <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
//       </TouchableOpacity>

//       <Animatable.View 
//         animation="fadeInUp"
//         duration={600}
//         style={styles.content}
//       >
//         <View style={styles.header}>
//           <Text style={styles.title}>Welcome Back!</Text>
//           <Text style={styles.subtitle}>
//             Choose how you'd like to login to your account
//           </Text>
//         </View>

//         <View style={styles.optionsContainer}>
//           {/* Apple Sign-In (iOS only) */}
//           {Platform.OS === 'ios' && appleAuthAvailable && (
//             <Animatable.View 
//               animation="slideInRight"
//               duration={800}
//               delay={100}
//             >
//               <TouchableOpacity
//                 style={[styles.optionCard, styles.appleCard]}
//                 onPress={handleAppleLogin}
//                 activeOpacity={0.8}
//                 disabled={appleLoading || googleLoading}
//               >
//                 <View style={styles.optionContent}>
//                   <View style={[styles.iconContainer, styles.appleIconContainer]}>
//                     <MaterialCommunityIcons 
//                       name="apple" 
//                       size={32} 
//                       color="#000" 
//                     />
//                   </View>
//                   <View style={styles.textContainer}>
//                     <Text style={styles.optionTitle}>Continue with Apple</Text>
//                     <Text style={styles.optionDescription}>
//                       Securely sign in with your Apple ID
//                     </Text>
//                   </View>
//                   {appleLoading && (
//                     <ActivityIndicator size="small" color="#000" style={styles.loadingIndicator} />
//                   )}
//                 </View>
//                 {!appleLoading && (
//                   <MaterialCommunityIcons 
//                     name="chevron-right" 
//                     size={24} 
//                     color="#999" 
//                   />
//                 )}
//               </TouchableOpacity>
//             </Animatable.View>
//           )}

//           {/* Google Login Option - UPDATED */}
//           <Animatable.View 
//             animation="slideInRight"
//             duration={800}
//             delay={200}
//           >
//             <TouchableOpacity
//               style={[styles.optionCard, styles.googleCard]}
//               onPress={handleGoogleLogin}
//               activeOpacity={0.8}
//               disabled={!request || googleLoading || appleLoading}
//             >
//               <View style={styles.optionContent}>
//                 <View style={[styles.iconContainer, styles.googleIconContainer]}>
//                   <MaterialCommunityIcons 
//                     name="google" 
//                     size={32} 
//                     color="#DB4437" 
//                   />
//                 </View>
//                 <View style={styles.textContainer}>
//                   <Text style={styles.optionTitle}>
//                     {googleLoading ? 'Signing in...' : 'Continue with Google'}
//                   </Text>
//                   <Text style={styles.optionDescription}>
//                     Quick login with your Google account
//                   </Text>
//                 </View>
//                 {googleLoading && (
//                   <ActivityIndicator size="small" color="#DB4437" style={styles.loadingIndicator} />
//                 )}
//               </View>
//               {!googleLoading && (
//                 <MaterialCommunityIcons 
//                   name="chevron-right" 
//                   size={24} 
//                   color="#999" 
//                 />
//               )}
//             </TouchableOpacity>
//           </Animatable.View>

//           {/* Email Login Option */}
//           <Animatable.View 
//             animation="slideInRight"
//             duration={800}
//             delay={300}
//           >
//             <TouchableOpacity
//               style={[styles.optionCard, styles.emailCard]}
//               onPress={handleEmailLogin}
//               activeOpacity={0.8}
//               disabled={appleLoading || googleLoading}
//             >
//               <View style={styles.optionContent}>
//                 <View style={[styles.iconContainer, styles.emailIconContainer]}>
//                   <MaterialCommunityIcons 
//                     name="email-outline" 
//                     size={32} 
//                     color={COLORS.primary} 
//                   />
//                 </View>
//                 <View style={styles.textContainer}>
//                   <Text style={styles.optionTitle}>Continue with Email</Text>
//                   <Text style={styles.optionDescription}>
//                     Login with your email and password
//                   </Text>
//                 </View>
//               </View>
//               <MaterialCommunityIcons 
//                 name="chevron-right" 
//                 size={24} 
//                 color="#999" 
//               />
//             </TouchableOpacity>
//           </Animatable.View>
//         </View>

//         {/* Divider */}
//         <View style={styles.divider}>
//           <View style={styles.dividerLine} />
//           <Text style={styles.dividerText}>OR</Text>
//           <View style={styles.dividerLine} />
//         </View>

//         {/* Create Account Link */}
//         <Animatable.View 
//           animation="fadeIn"
//           duration={600}
//           delay={400}
//           style={styles.signupContainer}
//         >
//           <Text style={styles.signupText}>Don't have an account? </Text>
//           <TouchableOpacity 
//             onPress={() => navigation.navigate(ROUTES.getting_started)}
//             disabled={appleLoading || googleLoading}
//           >
//             <Text style={styles.signupLink}>Sign Up</Text>
//           </TouchableOpacity>
//         </Animatable.View>
//       </Animatable.View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   backButton: {
//     position: 'absolute',
//     top: 50,
//     left: 20,
//     zIndex: 10,
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: '#f5f5f5',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   content: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingHorizontal: 20,
//   },
//   header: {
//     alignItems: 'center',
//     marginBottom: 40,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: COLORS.dark,
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     lineHeight: 22,
//   },
//   optionsContainer: {
//     marginBottom: 30,
//   },
//   optionCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#eee',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   appleCard: {
//     borderColor: '#f0f0f0',
//   },
//   googleCard: {
//     borderColor: '#f0f0f0',
//   },
//   emailCard: {
//     borderColor: '#f0f0f0',
//   },
//   optionContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   iconContainer: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 16,
//   },
//   appleIconContainer: {
//     backgroundColor: '#f8f8f8',
//   },
//   googleIconContainer: {
//     backgroundColor: '#f8f8f8',
//   },
//   emailIconContainer: {
//     backgroundColor: '#f8f8f8',
//   },
//   textContainer: {
//     flex: 1,
//   },
//   optionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 4,
//   },
//   optionDescription: {
//     fontSize: 14,
//     color: '#666',
//   },
//   loadingIndicator: {
//     marginLeft: 10,
//   },
//   divider: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 30,
//   },
//   dividerLine: {
//     flex: 1,
//     height: 1,
//     backgroundColor: '#eee',
//   },
//   dividerText: {
//     marginHorizontal: 15,
//     color: '#999',
//     fontSize: 14,
//   },
//   signupContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   signupText: {
//     fontSize: 14,
//     color: '#666',
//   },
//   signupLink: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontWeight: '600',
//   },
// });

// export default LoginOptions;