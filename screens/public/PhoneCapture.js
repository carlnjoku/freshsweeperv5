// screens/auth/PhoneCapture.js
import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ROUTES from '../../constants/routes';
import COLORS from '../../constants/colors';
import * as Animatable from 'react-native-animatable';
import { TextInput } from 'react-native-paper';
import { LanguageContext } from '../../context/LanguageContext';
import FloatingLabelPickerSelect from '../../components/shared/FloatingLabelPicker';
import { languages } from '../../data';
import i18n from '../../i18n';
import { AuthContext } from '../../context/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getDatabase, 
  ref,
  get,
  onValue, 
  set } from 'firebase/database';
  import { db } from '../../services/firebase/config';
  import userService from '../../services/connection/userService';
  import { navigationRef } from '../../App';

const PhoneCapture = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { 
    userId, 
    userType, 
    email, 
    firstName, 
    lastName, 
    token,
    googleUser,
    geolocation 
  } = route.params;


  
  
  const { login } = useContext(AuthContext);
  const { language, changeLanguage } = useContext(LanguageContext);
  // Use the hook only once and get all values
  const { expoPushToken, registerForPushNotificationsAsync, handleNotificationResponse } = useNotification();


  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [device_name, setDeviceName] = React.useState("");
  const [os_type, setOsType] = React.useState("false");
  const [fbCurrentUser, setFBCurrentUser] = React.useState({});

  const phoneInputRef = useRef(null);
  
  const formatPhoneNumber = (input) => {
    const cleaned = ('' + input).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return input;
  };

  // Setup notification handlers
  useEffect(() => {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });

    const responseListener = 
    Notifications.addNotificationReceivedListener(
        handleNotificationResponse
    )
    
    return () => {
        if(responseListener){
            Notifications.removeNotificationSubscription(responseListener)
        }
    }
}, []);

const getDeviceInfo = async () => {
    const deviceName = Device.deviceName;
    const osFull = Device.osName || '';
    const osVersion = Device.osVersion;
    let osType = 'Unknown OS';
    setDeviceName(deviceName)
    setOsType(Device.os_type)
    
    if (osFull.toLowerCase().includes('android')) {
        osType = 'Android';
    } else if (osFull.toLowerCase().includes('ios')) {
        osType = 'iOS';
    }

    console.log(`Device Name: ${deviceName}`);
    console.log(`OS Type: ${osType}`);
    console.log(`OS Version: ${osVersion}`);
};

useEffect(() => {
    // Remove this alert - it's disruptive
    // alert(expoPushToken)
    
    if (expoPushToken) {
        console.log('Expo Push Token:', expoPushToken);
    }

    getDeviceInfo();
}, [expoPushToken]);

const fetchUserFirebaseData = async(uid, response) => {
  console.log("RESPONSE#########", response)
  const mySnapshot = await get(ref(db, `users/${uid}`))
  setFBCurrentUser(mySnapshot.val())
   
  console.log("Snapshorts......", mySnapshot.val())

  const data_to_send = {
      resp: response,
      fbUser: mySnapshot.val(),
      expo_push_token: expoPushToken
  }
  console.log("LOGIN DATA.......", data_to_send)
  login(data_to_send)


  
  // Update expo push token if different
  if(response.expo_push_token !== expoPushToken){
      const userTokenData = {
          userId: uid,
          expo_push_token: expoPushToken
      }
  }
}

  const handleLanguageChange = (langCode) => {
   
    i18n.changeLanguage(langCode); // Optional: update app language right away
    changeLanguage(langCode);
  };

  // Handle phone input change with formatting
  const handlePhoneChange = (text) => {
    // Remove non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Format the phone number
    const formatted = formatPhoneNumber(cleaned);
    
    // Update state with formatted number
    setPhoneNumber(formatted);
  };

  

  const handleContinue = async () => {
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    
    if (cleanedPhone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
      if (phoneInputRef.current?.shake) {
        phoneInputRef.current.shake(500);
      }
      return;
    }
  
    // Prepare request body matching Option 3 backend structure
    const requestBody = {
      userId: userId,  // Required: userId at top level
      phone: cleanedPhone,
      location: geolocation,
      // Optionally include contact info if geolocation is available
      ...(geolocation ? {
        contact: {
          phone: cleanedPhone,
          cityLong: geolocation.city,
          stateLong: geolocation.region,
          countryLong: geolocation.country_name,
          postalCode: geolocation.postal
        }
      } : {})
    }
    console.log("Requests........", requestBody)
    setLoading(true);
    
    setTimeout(async () => {
      try {
        await userService.updatePhoneAndLocation(requestBody)
        .then(response => {
          if(response.status === 200){
            // IMPORTANT: Check the actual response structure
            console.log("📦 Full response:", JSON.stringify(response.data, null, 2));
            
            // The response structure might be: 
            // { status: "success", message: "...", data: { userObject } }
            // OR: { status: "success", message: "...", data: { data: userObject } }
            
            let res;
            if (response.data.data && response.data.data.data) {
              // If it's nested: data.data.data
              res = response.data.data.data;
            } else if (response.data.data) {
              // If it's: data.data
              res = response.data.data;
            } else {
              // If it's just the user object
              res = response.data;
            }
            
            console.log("👤 User data extracted:", res);


            
            
            // Register for push notifications with the user ID
            console.log("Registering push notifications for userId:", res._id);
            registerForPushNotificationsAsync(res._id);

            // Fetch Firebase user data and update AuthContext
            fetchUserFirebaseData(res._id, res);
            
            if (navigationRef.current) {
              navigationRef.current.reset({
                index: 0,
                routes: [{ name: res.userType === 'host' ? 'Host' : 'Cleaner' }],
              });
            } else {
              console.error('❌ Navigation ref not available');
            }
            
            
            // NO EXPLICIT NAVIGATION NEEDED HERE
            // The login() call in fetchUserFirebaseData will update AuthContext
            // which will trigger AppNav to switch from PublicStack to MainCleanerStack
            // automatically, just like in Signin
            
          } else {
            console.log("❌ Could not verify");
            Alert.alert('Error', "Could not save phone number. Please try again.");
          }  
        }).catch((err) => {
          console.log("❌ API error:", err);
          Alert.alert('Error', "Something went wrong, please try again");
        });
      } catch (error) {
        console.log("❌ General error:", error);
        Alert.alert('Error', "Something went wrong, please try again");
      } finally {
        setLoading(false);
      }
    }, 1000);
  };


  // const handleContinue = async () => {
  //   // Validate phone number
  //   const cleanedPhone = phoneNumber.replace(/\D/g, '');
    
  //   if (cleanedPhone.length < 10) {
  //     Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
  //     if (phoneInputRef.current?.shake) {
  //       phoneInputRef.current.shake(500);
  //     }
  //     return;
  //   }
    
  //   setLoading(true);
    
  //   try {
  //     // Prepare request body matching Option 3 backend structure
  //     const requestBody = {
  //       userId: userId,  // Required: userId at top level
  //       phone: cleanedPhone,
  //       location: geolocation,
  //       // Optionally include contact info if geolocation is available
  //       ...(geolocation ? {
  //         contact: {
  //           phone: cleanedPhone,
  //           cityLong: geolocation.city,
  //           stateLong: geolocation.region,
  //           countryLong: geolocation.country_name,
  //           postalCode: geolocation.postal
  //         }
  //       } : {})
  //     };
      
  //     console.log('📤 Sending phone update request:');
  //     console.log('Endpoint:', 'https://www.freshsweeper.com/api/users/update_phone_location');
  //     console.log('Method: PUT');
  //     console.log('Request Body:', JSON.stringify(requestBody, null, 2));
  //     console.log('User ID:', userId);
      
  //     // Remove Authorization header since Option 3 doesn't require token
  //     const response = await fetch('https://www.freshsweeper.com/api/users/update_phone_location', {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         // NO Authorization header for Option 3
  //       },
  //       body: JSON.stringify(requestBody)
  //     });
      
  //     console.log('📥 Phone update response:');
  //     console.log('Status:', response.status);
  //     console.log('Status Text:', response.statusText);
      
  //     let responseData;
  //     try {
  //       responseData = await response.json();
  //       console.log('📦 Full response data:', JSON.stringify(responseData, null, 2));
        
  //       // Debug: Check the structure
  //       console.log('🔍 Response keys:', Object.keys(responseData));
  //       if (responseData.data) {
  //         console.log('👤 User data keys:', Object.keys(responseData.data));
  //         console.log('✅ Verification fields:');
  //         console.log('  - identity_verified:', responseData.data.identity_verified);
  //         console.log('  - onboarding_completed:', responseData.data.onboarding_completed);
  //         console.log('  - avatar exists:', !!responseData.data.avatar);
  //       }
  //     } catch (parseError) {
  //       console.error('Failed to parse response:', parseError);
  //       const text = await response.text();
  //       console.log('Raw response:', text);
  //       responseData = { detail: text };
  //     }
      
  //     if (response.ok) {
  //       console.log('✅ Phone updated successfully');
        
  //       // Extract the updated user data from the response
  //       // Based on your backend, the structure is: {status: "success", data: {...userObject}}
  //       const updatedUserData = responseData.data;
        
  //       if (!updatedUserData) {
  //         console.error('❌ No user data in response');
  //         Alert.alert('Error', 'Server returned incomplete data. Please try again.');
  //         return;
  //       }
        
  //       console.log('📝 Updated user data from backend:', updatedUserData);
        
  //       // Get current storage data to preserve existing structure
  //       const storageData = await AsyncStorage.getItem('@storage_Key');
  //       if (storageData) {
  //         const parsedData = JSON.parse(storageData);
          
  //         // Create updated login response matching your AuthContext.login() structure
  //         const updatedLoginResp = {
  //           ...parsedData,
  //           resp: {
  //             ...parsedData.resp, // Preserve existing fields
  //             ...updatedUserData, // Override with updated fields from backend
  //             // Ensure critical fields are set
  //             _id: updatedUserData._id || parsedData.resp._id,
  //             phone: updatedUserData.phone || cleanedPhone,
  //             token: updatedUserData.token || parsedData.resp.token,
  //             // Map backend fields to expected fields
  //             firstname: updatedUserData.firstname || parsedData.resp.firstname,
  //             lastname: updatedUserData.lastname || parsedData.resp.lastname,
  //             email: updatedUserData.email || parsedData.resp.email,
  //             avatar: updatedUserData.avatar || parsedData.resp.avatar,
  //             location: updatedUserData.location || parsedData.resp.location,
  //             contact: updatedUserData.contact || parsedData.resp.contact,
  //             token: updatedUserData.token || parsedData.resp.token,
  //             // Include verification fields
  //             identity_verified: updatedUserData.identity_verified !== undefined 
  //               ? updatedUserData.identity_verified 
  //               : parsedData.resp.identity_verified,
  //             onboarding_completed: updatedUserData.onboarding_completed !== undefined 
  //               ? updatedUserData.onboarding_completed 
  //               : parsedData.resp.onboarding_completed
  //           }
  //         };
          
  //         console.log('🔄 Updated login response for AuthContext:', updatedLoginResp);
          
  //         // Update AuthContext by calling login with the updated data
  //         login(updatedLoginResp);
          
  //         console.log('✅ AuthContext updated with new user data');
          
  //         // Navigate based on user type
  //         if (userType === 'cleaner') {
  //           // Navigate to verification gate first
  //           navigation.navigate('MainCleanerStack', {
  //             screen: ROUTES.account_verification_gate,
  //             params: {
  //               userId: updatedUserData.resp._id || userId,
  //               userType: updatedUserData.resp.userType || userType,
  //               email: updatedUserData.resp.email || email,
  //               firstName: updatedUserData.resp.firstname || firstName, // Note: backend uses 'firstname'
  //               lastName: updatedUserData.resp.lastname || lastName,     // Note: backend uses 'lastname'
  //               phone: updatedUserData.resp.phone || cleanedPhone,
  //               token: updatedUserData.resp.token || token,
  //               googleUser,
  //               geolocation
  //             }
  //           });
  //         } else {
  //           // For host
  //           navigation.navigate('MainHostStack', {
  //             screen: ROUTES.host_home_tab,
  //             params: {
  //               userId: updatedUserData.resp._id || userId,
  //               userType: updatedUserData.resp.userType || userType,
  //               email: updatedUserData.resp.email || email,
  //               firstName: updatedUserData.resp.firstname || firstName,
  //               lastName: updatedUserData.resp.lastname || lastName,
  //               phone: updatedUserData.resp.phone || cleanedPhone,
  //               token: updatedUserData.resp.token || token,
  //               googleUser,
  //               geolocation
  //             }
  //           });
  //         }
  //       } else {
  //         // No existing storage data (edge case)
  //         console.log('⚠️ No existing storage data found');
          
  //         // Create a new login response from scratch
  //         const newLoginResp = {
  //           resp: updatedUserData,
  //           fbUser: null // You might need to get this from elsewhere
  //         };
          
  //         // Update AuthContext
  //         login(newLoginResp);
          
  //         // Navigate with the data we have
  //         if (userType === 'cleaner') {
  //           navigation.navigate('MainCleanerStack', {
  //             screen: ROUTES.account_verification_gate,
  //             params: {
  //               userId: updatedUserData.resp._id || userId,
  //               userType: updatedUserData.resp.userType || userType,
  //               email: updatedUserData.resp.email || email,
  //               firstName: updatedUserData.resp.firstname || firstName,
  //               lastName: updatedUserData.resp.lastname || lastName,
  //               phone: updatedUserData.resp.phone || cleanedPhone,
  //               token: updatedUserData.resp.token || token,
  //               googleUser,
  //               geolocation
  //             }
  //           });
  //         } else {
  //           navigation.navigate('MainHostStack', {
  //             screen: ROUTES.host_home_tab,
  //             params: {
  //               userId: updatedUserData.resp._id || userId,
  //               userType: updatedUserData.resp.userType || userType,
  //               email: updatedUserData.resp.email || email,
  //               firstName: updatedUserData.resp.firstname || firstName,
  //               lastName: updatedUserData.resp.lastname || lastName,
  //               phone: updatedUserData.resp.phone || cleanedPhone,
  //               token: updatedUserData.resp.token || token,
  //               googleUser,
  //               geolocation
  //             }
  //           });
  //         }
  //       }
  //     } else {
  //       console.error('❌ Phone update failed:', responseData);
        
  //       // Provide specific error messages
  //       let errorMessage = responseData.message || responseData.detail || 'Could not save phone number';
        
  //       if (response.status === 422) {
  //         errorMessage = 'Invalid data format. Please check your information.';
  //         if (responseData.detail) {
  //           errorMessage = responseData.detail;
  //         }
  //       } else if (response.status === 400) {
  //         errorMessage = responseData.detail || 'Bad request. Please check your information.';
  //       } else if (response.status === 404) {
  //         errorMessage = 'User not found.';
  //       }
        
  //       Alert.alert('Update Failed', errorMessage);
  //     }
  //   } catch (error) {
  //     console.error('Phone update error:', error);
  //     Alert.alert('Error', 'Network error. Please try again.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
  const handleSkipForNow = () => {
    Alert.alert(
      'Skip Phone Number?',
      'Phone number is required for account verification and contact. You can add it later in settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Skip', 
          style: 'destructive',
          onPress: () => {
            // Navigate without phone
            const onboardingRoute = userType === 'cleaner' 
              ? ROUTES.account_verification_gate 
              : ROUTES.host_home_tab;
            
            navigation.navigate(onboardingRoute, {
              userId,
              userType,
              email,
              firstName,
              lastName,
              token,
              googleUser,
              geolocation
            });
          }
        }
      ]
    );
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animatable.View 
          animation="fadeInUp"
          duration={600}
          style={styles.content}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              {googleUser?.picture ? (
                <Animatable.Image
                  animation="bounceIn"
                  duration={800}
                  source={{ uri: googleUser.picture }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <MaterialCommunityIcons 
                    name="account" 
                    size={40} 
                    color="#fff" 
                  />
                </View>
              )}
            </View>
            
            <Text style={styles.welcomeText}>
              Welcome, {firstName}!
            </Text>
            <Text style={styles.emailText}>
              {email}
            </Text>
          </View>
          
          {/* Progress Indicator */}
          {/* <View style={styles.progressContainer}>
            <View style={[styles.progressStep, styles.progressStepActive]}>
              <Text style={[styles.progressText, styles.progressTextActive]}>1</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <Text style={styles.progressText}>2</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <Text style={styles.progressText}>3</Text>
            </View>
          </View> */}
          
          {/* <Text style={styles.progressLabel}>
            Step 1 of 3: Add your phone
          </Text> */}
          
          {/* Phone Input */}
          <Animatable.View 
            ref={phoneInputRef}
            animation="slideInUp"
            delay={300}
            style={styles.inputContainer}
          >
            {/* <View style={styles.inputLabelRow}>
              <MaterialCommunityIcons 
                name="phone" 
                size={20} 
                color={COLORS.primary} 
                style={styles.inputIcon}
              />
              <Text style={styles.inputLabel}>
                Phone Number
              </Text>
            </View> */}

            <FloatingLabelPickerSelect
              label="Select Language"
              items={languages.map(lang => ({
                label: lang.label,
                value: lang.value,
              }))}
              value={language}
              onValueChange={handleLanguageChange}
            />
            
            <TextInput
              label="Mobile Phone"
              placeholder="(123) 456-7890"
              mode="outlined"
              outlineColor="#D8D8D8"
              activeOutlineColor={COLORS.primary}
              value={phoneNumber}
              left={<TextInput.Icon icon="phone-outline" style={{ marginTop: 10 }} />}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              style={styles.phoneInput}
              autoFocus
              maxLength={14} // (123) 456-7890 is 14 characters
              returnKeyType="done"
            />
            
            <Text style={styles.helperText}>
              We'll use this to verify your account and for important updates
            </Text>
          </Animatable.View>
          
          {/* Buttons */}
          <Animatable.View 
            animation="slideInUp"
            delay={500}
            style={styles.buttonContainer}
          >
            <TouchableOpacity
              style={[styles.continueButton, loading && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.continueButtonText}>
                  Continue to {userType === 'cleaner' ? 'Cleaner' : 'Host'} Setup
                </Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkipForNow}
              disabled={loading}
            >
              <Text style={styles.skipButtonText}>
                Skip for now
              </Text>
            </TouchableOpacity>
          </Animatable.View>
          
          {/* Why we ask */}
          <Animatable.View 
            animation="fadeIn"
            delay={700}
            style={styles.infoBox}
          >
            <MaterialCommunityIcons 
              name="shield-check" 
              size={20} 
              color="#4CAF50" 
              style={styles.infoIcon}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Why we need your phone
              </Text>
              <Text style={styles.infoText}>
                • Account verification{'\n'}
                • Important notifications{'\n'}
                • Booking confirmations{'\n'}
                • Emergency contact
              </Text>
            </View>
          </Animatable.View>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 40,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarFallback: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepActive: {
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  progressTextActive: {
    color: '#fff',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#eee',
    marginHorizontal: 4,
  },
  progressLabel: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  phoneInput: {
    marginBottom: 10,
    marginTop:10,
    fontSize: 14,
    width: '100%',
    backgroundColor: "#fff",
    height: 45,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    lineHeight: 16,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 14,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});

export default PhoneCapture;