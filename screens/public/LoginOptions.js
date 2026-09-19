// import React, { useState, useEffect, useContext } from 'react';
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
// import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
// import fetchIPGeolocation from '../../services/geolocation';
// import { db } from '../../services/firebase/config';
// import { ref, get, set } from 'firebase/database';
// import { useNotification } from '../../hooks/useNotification';
// import { AuthContext } from '../../context/AuthContext';
// import { navigationRef } from '../../utils/navigationRef';
// import { auth } from '../../services/firebase/config';


// const GOOGLE_CLIENT_ID ="283581670255-i89tij454i1l0705lovhrthq7n761b5a.apps.googleusercontent.com";


// // Initialize WebBrowser for auth
// WebBrowser.maybeCompleteAuthSession();

// const LoginOptions = () => {
//   const navigation = useNavigation();
//   const [appleLoading, setAppleLoading] = useState(false);
//   const [googleLoading, setGoogleLoading] = useState(false);
//   const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
//   const [fbCurrentUser, setFBCurrentUser] = useState({});
//   const [geolocationData, setGeolocationData] = useState({});

  
//   // Use the hook only once and get all values
//   const { expoPushToken, registerForPushNotificationsAsync, handleNotificationResponse } = useNotification();
//   const { login, loginWithEmailPassword } = useContext(AuthContext);

//   // Google Auth Configuration - Replace with your actual IDs
//   // const [request, response, promptAsync] = Google.useAuthRequest({
//   //   // For Expo Go development
//   //   expoClientId: '283581670255-bg5umkf8vnai35ur0hp1i6cepv5fko1v.apps.googleusercontent.com', // Web client ID
    
//   //   // For standalone apps (optional but recommended)
//   //   iosClientId: Platform.OS === 'ios' ? '283581670255-i89tij454i1l0705lovhrthq7n761b5a.apps.googleusercontent.com' : undefined,
//   //   androidClientId: Platform.OS === 'android' ? '283581670255-ikalnp6e8d90un2dfsmbqmvektqdj38m.apps.googleusercontent.com' : undefined,
    
    
//   //   // Scopes for permissions
//   //   scopes: ['profile', 'email', 'openid'],
//   // });

//     // ----------------------------
//     // GOOGLE AUTH (FIXED)
//     // ----------------------------
//     const [request, response, promptAsync] = Google.useAuthRequest({
//       iosClientId: GOOGLE_CLIENT_ID,
//       androidClientId: GOOGLE_CLIENT_ID,
//       webClientId: GOOGLE_CLIENT_ID,
//     });

//   const fetchGeolocation = async () => {
//     try {
//       const data = await fetchIPGeolocation();
//       setGeolocationData(data);
//     } catch (error) {
//       console.error("Error fetching geolocation:", error);
//     }
//   };

//   useEffect(() => {
//     if (response?.type === 'success') {
//       handleGoogleAuthResponse(response);
//     }
//   }, [response]);

//   useEffect(() => {
//     const getGeoData = async () => {
//       await fetchGeolocation();
//     };
  
//     getGeoData();
//   }, []);

//   // Check if Apple Authentication is available
//   useEffect(() => {
//     checkAppleAuthAvailability();
    
//   }, []);


//   const handleGoogleAuthResponse = async (response) => {
//     try {
//       setGoogleLoading(true);
  
//       const { authentication } = response;
  
//       const accessToken = authentication?.accessToken;
//       const idToken = authentication?.idToken;
  
//       if (!accessToken || !idToken) {
//         Alert.alert('Error', 'Google login failed: missing tokens');
//         return;
//       }
  
//       // 1. GET USER INFO FROM GOOGLE
//       const userInfoResponse = await fetch(
//         'https://www.googleapis.com/oauth2/v2/userinfo',
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       );
  
//       if (!userInfoResponse.ok) {
//         throw new Error('Failed to fetch user info from Google');
//       }
  
//       const googleUser = await userInfoResponse.json();
  
//       // attach tokens
//       googleUser.accessToken = accessToken;
//       googleUser.idToken = idToken;
//       googleUser.provider = 'google';
  
//       console.log('Google User:', googleUser.email);
  
//       // 2. FIREBASE AUTH (ONLY HERE — NOT IN USEEFFECT)
//       const credential = GoogleAuthProvider.credential(idToken);
//       const firebaseResult = await signInWithCredential(auth, credential);
  
//       const firebaseUser = firebaseResult.user;
  
//       console.log("Firebase user:", firebaseUser.email);
  
//       // 3. SEND TO YOUR BACKEND
//       await handleGoogleBackendLogin(googleUser);
  
//     } catch (error) {
//       console.log('Google sign-in error:', error);
//       Alert.alert(
//         'Google Sign-In Error',
//         'Unable to sign in with Google. Please try another method'
//       );
//     } finally {
//       setGoogleLoading(false);
//     }
//   };

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

//   const handleGoogleBackendLogin = async (googleUser) => {
//     try {
//       // Use your actual backend endpoint
//       // Replace localhost with your actual server IP/domain
//       const baseUrl = 'https://www.freshsweeper.com'; // or your server address
//       const endpoint = `${baseUrl}/api/auth/google_auth`;
      
//       console.log('Sending Google token to backend:', {
//         endpoint: endpoint,
//         token: googleUser.idToken ? 'Token present' : 'NO TOKEN',
//         tokenLength: googleUser.idToken?.length || 0,
//         userType: "host"
//       });
      
//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json',
//         },
//         body: JSON.stringify({
//           token: googleUser.idToken,
//           userType: "host" // or "cleaner" - you might need to get this from user
//         }),
//       });
  
//       console.log('Response status:', response.status);
//       console.log('Response headers:', Object.fromEntries([...response.headers]));
  
//       // Check if response is OK
//       if (!response.ok) {
//         let errorData;
//         try {
//           errorData = await response.json();
//         } catch (e) {
//           // If not JSON, try to get text
//           const text = await response.text();
//           errorData = { message: text || `HTTP ${response.status}` };
//         }
        
//         throw new Error(
//           `HTTP ${response.status}: ${errorData.message || errorData.detail || 'Unknown error'}`
//         );
//       }
  
//       // Try to parse successful response
//       let data;
//       try {
//         data = await response.json();
//       } catch (e) {
//         throw new Error('Invalid JSON response from server');
//       }
  
//       console.log('Backend response data:', JSON.stringify(data, null, 2));
  
//       if (data.status === 'success' && data.data) {
//         const userData = data.data;
//         console.log("Registering push notifications for userId:", userData._id);
        
//         // Register push notifications
//         registerForPushNotificationsAsync(userData._id);
        
//         // Fetch Firebase user data and update AuthContext
//         await fetchUserFirebaseData(userData._id, userData);

        
//         if (navigationRef.current) {
//           navigationRef.current.reset({
//             index: 0,
//             routes: [{ name: userData.userType === 'host' ? 'Host' : 'Cleaner' }],
//           });
//         } else {
//           console.error('❌ Navigation ref not available');
//         }
//       } else {
//         throw new Error(
//           data.message || 
//           data.error || 
//           data.detail || 
//           'Authentication failed'
//         );
//       }
//     } catch (error) {
//       console.error('Backend Google login error details:');
//       console.error('- Error message:', error.message);
//       console.error('- Error name:', error.name);
//       console.error('- Error stack:', error.stack);
      
//       // Check for specific error types
//       if (error.message.includes('Network request failed')) {
//         Alert.alert(
//           'Network Error',
//           'Please check your internet connection and try again.'
//         );
//       } else if (error.message.includes('Failed to fetch')) {
//         Alert.alert(
//           'Connection Failed',
//           'Unable to connect to the server. Please try again later.'
//         );
//       } else if (error.message.includes('Invalid JSON')) {
//         Alert.alert(
//           'Server Error',
//           'Invalid response from server. Please try again.'
//         );
//       } else {
//         Alert.alert(
//           'Authentication Error',
//           error.message || 'Unable to process Google Sign-In. Please try again.'
//         );
//       }
//     } finally {
//       setGoogleLoading(false);
//     }
//   };

  

//   const fetchUserFirebaseData = async(uid, response) => {
//     try {
//         const mySnapshot = await get(ref(db, `users/${uid}`))
//         setFBCurrentUser(mySnapshot.val())

//         const data_to_send = {
//             resp: response,
//             fbUser: mySnapshot.val(),
//             expo_push_token: expoPushToken
//         }
        
//         console.log("Firebase User collected:",data_to_send.fbUser)

//         login(data_to_send)

  
//     } catch (error) {
//         console.error("Error fetching Firebase data:", error);
//         // Even if Firebase fails, still login the user
//         const data_to_send = {
//             resp: response,
//             fbUser: null,
//             expo_push_token: expoPushToken
//         }
//         login(data_to_send);
//     }
// }

//   const handleEmailLogin = () => {
//     navigation.navigate(ROUTES.signin, { loginMethod: 'email' });
//   };

//   const handleGoogleLogin = async () => {
//     try {
//       await promptAsync();
//     } catch (error) {
//       console.error('Google prompt error:', error);
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
//         console.error('Apple Sign-In Error:');
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
  
//       console.log("Apple credential:", credential);
  
//       const response = await fetch(
//         'https://www.freshsweeper.com/api/auth/apple_auth',
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
  
//           body: JSON.stringify({
//             identityToken: credential.identityToken,
//             authorizationCode: credential.authorizationCode,
  
//             user: {
//               id: credential.user,
  
//               email: credential.email,
  
//               firstname:
//                 credential.fullName?.givenName || null,
  
//               lastname:
//                 credential.fullName?.familyName || null,
  
//               fullname:
//                 `${credential.fullName?.givenName || ''} ${credential.fullName?.familyName || ''}`.trim(),
//             },
//           }),
//         }
//       );
  
//       const data = await response.json();
  
//       if (response.ok) {
  
//         const userData = data.data;
  
//         console.log("Apple return data:", userData);
  
//         registerForPushNotificationsAsync(userData._id);
  
//         await fetchUserFirebaseData(
//           userData._id,
//           userData
//         );
  
//         if (navigationRef.current) {
//           navigationRef.current.reset({
//             index: 0,
//             routes: [
//               {
//                 name:
//                   userData.userType === 'host'
//                     ? 'Host'
//                     : 'Cleaner',
//               },
//             ],
//           });
//         }
  
//       } else {
//         throw new Error(
//           data.detail || 'Apple Sign-In failed'
//         );
//       }
  
//     } catch (error) {
//       console.error(
//         'Apple credential error:',
//         error
//       );
  
//       Alert.alert(
//         'Error',
//         'Unable to process Apple Sign-In.'
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

//           {/* Google Login Option */}
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
//                     Continue with Google
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






// import React, { useState, useEffect, useContext } from 'react';
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
// import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
// import fetchIPGeolocation from '../../services/geolocation';
// import { useNotification } from '../../hooks/useNotification';
// import { AuthContext } from '../../context/AuthContext';
// import { navigationRef } from '../../utils/navigationRef';
// import { auth } from '../../services/firebase/config';

// const GOOGLE_CLIENT_ID = "283581670255-i89tij454i1l0705lovhrthq7n761b5a.apps.googleusercontent.com";

// WebBrowser.maybeCompleteAuthSession();

// const LoginOptions = () => {
//   const navigation = useNavigation();
//   const [appleLoading, setAppleLoading] = useState(false);
//   const [googleLoading, setGoogleLoading] = useState(false);
//   const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
//   const [geolocationData, setGeolocationData] = useState({});

//   const { expoPushToken, registerForPushNotificationsAsync } = useNotification();
//   const { login } = useContext(AuthContext);

//   // Google Auth
//   const [request, response, promptAsync] = Google.useAuthRequest({
//     iosClientId: GOOGLE_CLIENT_ID,
//     androidClientId: GOOGLE_CLIENT_ID,
//     webClientId: GOOGLE_CLIENT_ID,
//   });

//   const [isChecking, setIsChecking] = useState(true);
//   useEffect(() => {
//     const checkNewUser = async () => {
//       try {
//         const token = await AsyncStorage.getItem('@auth_token');
//         const hasAccount = await AsyncStorage.getItem('@has_account');
  
//         console.log('🔍 LoginOptions:');
//         console.log('   - token:', token ? 'exists' : 'null');
//         console.log('   - hasAccount:', hasAccount);
  
//         // 🔥 If token exists → user is logged in → go to dashboard
//         if (token) {
//           const userType = await AsyncStorage.getItem('@user_type');
//           const target = userType === 'host' ? 'Host' : 'Cleaner';
//           navigation.replace(target);
//           return;
//         }
  
//         // Otherwise, use hasAccount to decide
//         if (!hasAccount || hasAccount !== 'true') {
//           navigation.replace(ROUTES.onboarding);
//         }
//       } catch (error) {
//         navigation.replace(ROUTES.onboarding);
//       } finally {
//         setIsChecking(false);
//       }
//     };
//     checkNewUser();
//   }, []);

  

//   // ---- Fetch geolocation ----
//   const fetchGeolocation = async () => {
//     try {
//       const data = await fetchIPGeolocation();
//       setGeolocationData(data);
//     } catch (error) {
//       console.error("Error fetching geolocation:", error);
//     }
//   };

//   useEffect(() => {
//     if (response?.type === 'success') {
//       handleGoogleAuthResponse(response);
//     }
//   }, [response]);

//   useEffect(() => {
//     fetchGeolocation();
//     checkAppleAuthAvailability();
//   }, []);

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

//   // ---- Google Auth Response ----
//   const handleGoogleAuthResponse = async (response) => {
//     try {
//       setGoogleLoading(true);
//       const { authentication } = response;
//       const accessToken = authentication?.accessToken;
//       const idToken = authentication?.idToken;

//       if (!accessToken || !idToken) {
//         Alert.alert('Error', 'Google login failed: missing tokens');
//         return;
//       }

//       const userInfoResponse = await fetch(
//         'https://www.googleapis.com/oauth2/v2/userinfo',
//         {
//           headers: { Authorization: `Bearer ${accessToken}` },
//         }
//       );

//       if (!userInfoResponse.ok) {
//         throw new Error('Failed to fetch user info from Google');
//       }

//       const googleUser = await userInfoResponse.json();
//       googleUser.accessToken = accessToken;
//       googleUser.idToken = idToken;
//       googleUser.provider = 'google';

//       console.log('Google User:', googleUser.email);

//       // Firebase Auth (optional, used only for some internal features)
//       const credential = GoogleAuthProvider.credential(idToken);
//       await signInWithCredential(auth, credential);

//       // Backend login
//       await handleGoogleBackendLogin(googleUser);
//     } catch (error) {
//       console.log('Google sign-in error:', error);
//       Alert.alert('Google Sign-In Error', 'Unable to sign in with Google. Please try another method');
//     } finally {
//       setGoogleLoading(false);
//     }
//   };

//   // ---- Google Backend Login ----
//   const handleGoogleBackendLogin = async (googleUser) => {
//     const baseUrl = 'https://www.freshsweeper.com';
//     const endpoint = `${baseUrl}/api/auth/google_auth`;

//     try {
//       console.log('📤 Sending Google token to backend...');
//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json',
//         },
//         body: JSON.stringify({
//           token: googleUser.idToken,
//           userType: "host", // not used for login, backend infers from existing account
//         }),
//       });

//       const data = await response.json();

//       if (response.status === 403 && data.detail?.toLowerCase().includes('deactivated')) {
//         Alert.alert(
//           'Account Deactivated',
//           'Your account has been deactivated. If you think this is a mistake, please contact our support team for assistance.',
//           [{ text: 'OK', style: 'default' }]
//         );
//         return;
//       }

//       if (!response.ok) {
//         throw new Error(data.message || data.detail || `HTTP ${response.status}`);
//       }

//       if (data.status === 'success' && data.data) {
//         const userData = data.data;

//         // 1. Register push notifications
//         await registerForPushNotificationsAsync(userData._id);

//         // 2. Check if user has phone
//         const hasPhone = !!(userData.phone && userData.phone.trim().length > 0);
//         console.log('📱 Has phone?', hasPhone);

//         // 3. Determine if user is new (needs onboarding)
//         const isNewUser = !userData.account_verification ||
//                           (userData.userType === 'cleaner' && !userData.onboarding_completed);

//         const navData = {
//           userId: userData._id,
//           userType: userData.userType,
//           email: userData.email || googleUser.email,
//           firstname: userData.firstname || googleUser.given_name,
//           lastname: userData.lastname || googleUser.family_name,
//           token: userData.token,
//           googleUser: googleUser,
//           userData: userData,
//           geolocation: geolocationData,
//         };

//         // Store token if present
//         if (userData.token) {
//           await AsyncStorage.setItem('@auth_token', userData.token);
//           await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
//         }

//         // ---- CONDITIONAL NAVIGATION ----
//         if (isNewUser) {
//           await AsyncStorage.setItem('@has_account', 'true');
//           console.log('🔄 New user detected...');
//           if (hasPhone) {
//             console.log('📱 New user with phone → onboarding');
//             const onboardingRoute = userData.userType === 'cleaner'
//               ? ROUTES.cleaner_onboarding
//               : ROUTES.host_onboarding;
//             navigation.navigate(onboardingRoute, navData);
//           } else {
//             console.log('📱 New user without phone → phone capture');
//             navigation.navigate(ROUTES.phone_capture, navData);
//           }
//         } else {
//           console.log('🏠 Existing user...');
//           // ✅ For existing users, just call login and navigate to the main app
//           await login({
//             resp: userData,
//             fbUser: null,
//             expo_push_token: expoPushToken,
//           });
//           if (navigationRef.current) {
//             navigationRef.current.reset({
//               index: 0,
//               routes: [{ name: userData.userType === 'host' ? 'Host' : 'Cleaner' }],
//             });
//           } else {
//             console.error('❌ Navigation ref not available');
//           }
//         }
//       } else {
//         throw new Error(data.message || data.detail || 'Authentication failed');
//       }
//     } catch (error) {
//       console.error('Google backend login error:', error);
//       Alert.alert('Authentication Error', error.message || 'Unable to process Google Sign-In.');
//     } finally {
//       setGoogleLoading(false);
//     }
//   };

//   // ---- Apple Sign-In ----
//   const handleAppleLogin = async () => {
//     try {
//       setAppleLoading(true);
//       Alert.alert(
//         'Select Account Type',
//         'Are you signing up as a Host or a Cleaner?',
//         [
//           { text: 'Host', onPress: () => performAppleSignIn('host') },
//           { text: 'Cleaner', onPress: () => performAppleSignIn('cleaner') },
//           { text: 'Cancel', style: 'cancel', onPress: () => setAppleLoading(false) },
//         ],
//         { cancelable: false }
//       );
//     } catch (error) {
//       console.error('Apple Sign-In Error:', error);
//       Alert.alert('Apple Sign-In Error', 'Unable to sign in with Apple.');
//       setAppleLoading(false);
//     }
//   };

//   const performAppleSignIn = async (selectedUserType) => {
//     try {
//       const credential = await AppleAuthentication.signInAsync({
//         requestedScopes: [
//           AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
//           AppleAuthentication.AppleAuthenticationScope.EMAIL,
//         ],
//       });
//       await handleAppleCredential(credential, selectedUserType);
//     } catch (error) {
//       if (error.code === 'ERR_CANCELED') {
//         console.log('Apple Sign-In was cancelled');
//       } else {
//         console.error('Apple Sign-In Error:', error);
//         Alert.alert('Apple Sign-In Error', 'Unable to sign in with Apple.');
//       }
//       setAppleLoading(false);
//     }
//   };

  

//   const handleAppleCredential = async (credential, userType) => {
//     try {
//       setAppleLoading(true);
//       const response = await fetch('https://www.freshsweeper.com/api/auth/apple_auth', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           identityToken: credential.identityToken,
//           authorizationCode: credential.authorizationCode,
//           userType: userType,
//           user: {
//             id: credential.user,
//             email: credential.email,
//             firstname: credential.fullName?.givenName || null,
//             lastname: credential.fullName?.familyName || null,
//             fullname: `${credential.fullName?.givenName || ''} ${credential.fullName?.familyName || ''}`.trim(),
//           },
//         }),
//       });
  
//       const data = await response.json();
  
//       // Check for deactivated account
//       if (response.status === 403 && data.detail?.toLowerCase().includes('deactivated')) {
//         Alert.alert(
//           'Account Deactivated',
//           'Your account has been deactivated. If you think this is a mistake, please contact our support team for assistance.',
//           [{ text: 'OK', style: 'default' }]
//         );
//         return;
//       }
  
//       if (!response.ok) {
//         throw new Error(data.detail || data.message || `HTTP ${response.status}`);
//       }
  
//       if (response.ok && data.status === 'success') {
//         const userData = data.data;
//         console.log("Apple return data:", userData);
  
//         await registerForPushNotificationsAsync(userData._id);
  
//         const hasPhone = !!(userData.phone && userData.phone.trim().length > 0);
//         console.log('📱 Has phone?', hasPhone);
  
//         const isNewUser = !userData.account_verification ||
//                           (userData.userType === 'cleaner' && !userData.onboarding_completed);
  
//         const navData = {
//           userId: userData._id,
//           userType: userData.userType,
//           email: userData.email || credential.email,
//           firstname: userData.firstname || credential.fullName?.givenName,
//           lastname: userData.lastname || credential.fullName?.familyName,
//           token: userData.token,
//           appleCredential: credential,
//           userData: userData,
//           geolocation: geolocationData,
//         };
  
//         if (userData.token) {
//           await AsyncStorage.setItem('@auth_token', userData.token);
//           await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
//         }
  
//         // ---- CONDITIONAL NAVIGATION ----
//         if (isNewUser) {
//           console.log('🔄 New user detected...');
//           // ✅ Set flag for new users
//           await AsyncStorage.setItem('@has_account', 'true');
//           console.log('✅ @has_account set for new user');
  
//           if (hasPhone) {
//             console.log('📱 New user with phone → onboarding');
//             const onboardingRoute = userData.userType === 'cleaner'
//               ? ROUTES.cleaner_onboarding
//               : ROUTES.host_onboarding;
//             navigation.navigate(onboardingRoute, navData);
//           } else {
//             console.log('📱 New user without phone → phone capture');
//             navigation.navigate(ROUTES.phone_capture, navData);
//           }
//         } else {
//           console.log('🏠 Existing user...');
  
//           // ✅ EXTRA SAFETY: Set flag BEFORE login
//           await AsyncStorage.setItem('@has_account', 'true');
//           console.log('✅ @has_account set before login');
  
//           await login({
//             resp: userData,
//             fbUser: null,
//             expo_push_token: expoPushToken,
//           });
  
//           // ✅ Verify flag after login
//           const hasAccountAfter = await AsyncStorage.getItem('@has_account');
//           console.log('✅ @has_account after login:', hasAccountAfter);
  
//           // ✅ Navigate to main app
//           if (navigationRef.current) {
//             navigationRef.current.reset({
//               index: 0,
//               routes: [{ name: userData.userType === 'host' ? 'Host' : 'Cleaner' }],
//             });
//           } else {
//             console.error('❌ Navigation ref not available');
//           }
//         }
//       } else {
//         throw new Error(data.detail || 'Apple Sign-In failed');
//       }
//     } catch (error) {
//       console.error('Apple credential error:', error);
//       Alert.alert('Error', error.message || 'Unable to process Apple Sign-In.');
//     } finally {
//       setAppleLoading(false);
//     }
//   };

//   // ---- UI Handlers ----
//   const handleEmailLogin = () => {
//     navigation.navigate(ROUTES.signin, { loginMethod: 'email' });
//   };

//   const handleGoogleLogin = async () => {
//     try {
//       await promptAsync();
//     } catch (error) {
//       console.error('Google prompt error:', error);
//       setGoogleLoading(false);
//     }
//   };

//   if (isChecking) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       </View>
//     );
//   }

//   <Text>dsuyd</Text>
//   // ---- Render ----
//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      

//       <Animatable.View animation="fadeInUp" duration={600} style={styles.content}>
//         <View style={styles.header}>
//           <Text style={styles.title}>Welcome Back!</Text>
//           <Text style={styles.subtitle}>Choose how you'd like to login to your account</Text>
//         </View>

//         <View style={styles.optionsContainer}>
//           {Platform.OS === 'ios' && appleAuthAvailable && (
//             <Animatable.View animation="slideInRight" duration={800} delay={100}>
//               <TouchableOpacity
//                 style={[styles.optionCard, styles.appleCard]}
//                 onPress={handleAppleLogin}
//                 activeOpacity={0.8}
//                 disabled={appleLoading || googleLoading}
//               >
//                 <View style={styles.optionContent}>
//                   <View style={[styles.iconContainer, styles.appleIconContainer]}>
//                     <MaterialCommunityIcons name="apple" size={32} color="#000" />
//                   </View>
//                   <View style={styles.textContainer}>
//                     <Text style={styles.optionTitle}>Continue with Apple</Text>
//                     <Text style={styles.optionDescription}>Securely sign in with your Apple ID</Text>
//                   </View>
//                   {appleLoading && <ActivityIndicator size="small" color="#000" style={styles.loadingIndicator} />}
//                 </View>
//                 {!appleLoading && <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />}
//               </TouchableOpacity>
//             </Animatable.View>
//           )}

//           <Animatable.View animation="slideInRight" duration={800} delay={200}>
//             <TouchableOpacity
//               style={[styles.optionCard, styles.googleCard]}
//               onPress={handleGoogleLogin}
//               activeOpacity={0.8}
//               disabled={!request || googleLoading || appleLoading}
//             >
//               <View style={styles.optionContent}>
//                 <View style={[styles.iconContainer, styles.googleIconContainer]}>
//                   <MaterialCommunityIcons name="google" size={32} color="#DB4437" />
//                 </View>
//                 <View style={styles.textContainer}>
//                   <Text style={styles.optionTitle}>Continue with Google</Text>
//                   <Text style={styles.optionDescription}>Quick login with your Google account</Text>
//                 </View>
//                 {googleLoading && <ActivityIndicator size="small" color="#DB4437" style={styles.loadingIndicator} />}
//               </View>
//               {!googleLoading && <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />}
//             </TouchableOpacity>
//           </Animatable.View>

//           <Animatable.View animation="slideInRight" duration={800} delay={300}>
//             <TouchableOpacity
//               style={[styles.optionCard, styles.emailCard]}
//               onPress={handleEmailLogin}
//               activeOpacity={0.8}
//               disabled={appleLoading || googleLoading}
//             >
//               <View style={styles.optionContent}>
//                 <View style={[styles.iconContainer, styles.emailIconContainer]}>
//                   <MaterialCommunityIcons name="email-outline" size={32} color={COLORS.primary} />
//                 </View>
//                 <View style={styles.textContainer}>
//                   <Text style={styles.optionTitle}>Continue with Email</Text>
//                   <Text style={styles.optionDescription}>Login with your email and password</Text>
//                 </View>
//               </View>
//               <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
//             </TouchableOpacity>
//           </Animatable.View>
//         </View>

//         <View style={styles.divider}>
//           <View style={styles.dividerLine} />
//           <Text style={styles.dividerText}>OR</Text>
//           <View style={styles.dividerLine} />
//         </View>

//         <Animatable.View animation="fadeIn" duration={600} delay={400} style={styles.signupContainer}>
//           <Text style={styles.signupText}>Don't have an account? </Text>
//           <TouchableOpacity onPress={() => navigation.navigate(ROUTES.getting_started)} disabled={appleLoading || googleLoading}>
//             <Text style={styles.signupLink}>Sign Up</Text>
//           </TouchableOpacity>
//         </Animatable.View>
//       </Animatable.View>
//     </SafeAreaView>
//   );
// };

// // Styles (unchanged)
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff' },
//   content: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingHorizontal: 20,
//   },
//   header: { alignItems: 'center', marginBottom: 40 },
//   title: { fontSize: 28, fontWeight: 'bold', color: COLORS.dark, marginBottom: 10 },
//   subtitle: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 22 },
//   optionsContainer: { marginBottom: 30 },
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
//   appleCard: { borderColor: '#f0f0f0' },
//   googleCard: { borderColor: '#f0f0f0' },
//   emailCard: { borderColor: '#f0f0f0' },
//   optionContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
//   iconContainer: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
//   appleIconContainer: { backgroundColor: '#f8f8f8' },
//   googleIconContainer: { backgroundColor: '#f8f8f8' },
//   emailIconContainer: { backgroundColor: '#f8f8f8' },
//   textContainer: { flex: 1 },
//   optionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.dark, marginBottom: 4 },
//   optionDescription: { fontSize: 14, color: '#666' },
//   loadingIndicator: { marginLeft: 10 },
//   divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
//   dividerLine: { flex: 1, height: 1, backgroundColor: '#eee' },
//   dividerText: { marginHorizontal: 15, color: '#999', fontSize: 14 },
//   signupContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
//   signupText: { fontSize: 14, color: '#666' },
//   signupLink: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
// });

// export default LoginOptions;




// screens/public/LoginOptions.js
// LoginOptions.js
// import React, { useState, useEffect, useContext } from 'react';
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
//   Linking,
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
// import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
// import fetchIPGeolocation from '../../services/geolocation';
// import { db } from '../../services/firebase/config';
// import { ref, get, set } from 'firebase/database';
// import { useNotification } from '../../hooks/useNotification';
// import { AuthContext } from '../../context/AuthContext';
// import { navigationRef } from '../../utils/navigationRef';
// import { auth } from '../../services/firebase/config';

// const GOOGLE_CLIENT_ID =
//   '283581670255-i89tij454i1l0705lovhrthq7n761b5a.apps.googleusercontent.com';

// WebBrowser.maybeCompleteAuthSession();

// const LoginOptions = () => {
//   const navigation = useNavigation();
//   const [appleLoading, setAppleLoading] = useState(false);
//   const [googleLoading, setGoogleLoading] = useState(false);
//   const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
//   const [fbCurrentUser, setFBCurrentUser] = useState({});
//   const [geolocationData, setGeolocationData] = useState({});

//   const {
//     expoPushToken,
//     registerForPushNotificationsAsync,
//     handleNotificationResponse,
//   } = useNotification();
//   const { login, loginWithEmailPassword } = useContext(AuthContext);

//   const [request, response, promptAsync] = Google.useAuthRequest({
//     iosClientId: GOOGLE_CLIENT_ID,
//     androidClientId: GOOGLE_CLIENT_ID,
//     webClientId: GOOGLE_CLIENT_ID,
//   });

//   const fetchGeolocation = async () => {
//     try {
//       const data = await fetchIPGeolocation();
//       setGeolocationData(data);
//     } catch (error) {
//       console.error('Error fetching geolocation:', error);
//     }
//   };

//   useEffect(() => {
//     if (response?.type === 'success') {
//       handleGoogleAuthResponse(response);
//     }
//   }, [response]);

//   useEffect(() => {
//     fetchGeolocation();
//     checkAppleAuthAvailability();
//   }, []);

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

//   const handleGoogleAuthResponse = async (response) => {
//     try {
//       setGoogleLoading(true);

//       const { authentication } = response;

//       const accessToken = authentication?.accessToken;
//       const idToken = authentication?.idToken;

//       if (!accessToken || !idToken) {
//         Alert.alert('Error', 'Google login failed: missing tokens');
//         return;
//       }

//       // 1. GET USER INFO FROM GOOGLE
//       const userInfoResponse = await fetch(
//         'https://www.googleapis.com/oauth2/v2/userinfo',
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       );

//       if (!userInfoResponse.ok) {
//         throw new Error('Failed to fetch user info from Google');
//       }

//       const googleUser = await userInfoResponse.json();

//       googleUser.accessToken = accessToken;
//       googleUser.idToken = idToken;
//       googleUser.provider = 'google';

//       console.log('Google User:', googleUser.email);

//       // 2. FIREBASE AUTH
//       const credential = GoogleAuthProvider.credential(idToken);
//       const firebaseResult = await signInWithCredential(auth, credential);

//       const firebaseUser = firebaseResult.user;

//       console.log('Firebase user:', firebaseUser.email);

//       // 3. SEND TO YOUR BACKEND
//       await handleGoogleBackendLogin(googleUser);
//     } catch (error) {
//       console.log('Google sign-in error:', error);
//       Alert.alert(
//         'Google Sign-In Error',
//         'Unable to sign in with Google. Please try another method'
//       );
//     } finally {
//       setGoogleLoading(false);
//     }
//   };

//   const handleGoogleBackendLogin = async (googleUser) => {
//     try {
//       const baseUrl = 'https://www.freshsweeper.com';
//       const endpoint = `${baseUrl}/api/auth/google_auth`;

//       console.log('Sending Google token to backend:', {
//         endpoint: endpoint,
//         token: googleUser.idToken ? 'Token present' : 'NO TOKEN',
//         tokenLength: googleUser.idToken?.length || 0,
//         userType: 'host',
//       });

//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Accept: 'application/json',
//         },
//         body: JSON.stringify({
//           token: googleUser.idToken,
//           userType: 'host', // or "cleaner" – you may need to get this from user
//         }),
//       });

//       console.log('Response status:', response.status);

//       if (!response.ok) {
//         let errorData;
//         try {
//           errorData = await response.json();
//         } catch (e) {
//           const text = await response.text();
//           errorData = { message: text || `HTTP ${response.status}` };
//         }

//         throw new Error(
//           `HTTP ${response.status}: ${errorData.message || errorData.detail || 'Unknown error'}`
//         );
//       }

//       let data;
//       try {
//         data = await response.json();
//       } catch (e) {
//         throw new Error('Invalid JSON response from server');
//       }

//       console.log('Backend response data:', JSON.stringify(data, null, 2));

//       if (data.status === 'success' && data.data) {
//         const userData = data.data;
//         console.log('Registering push notifications for userId:', userData._id);

//         // Store token and user data (including userType)
//         await AsyncStorage.setItem('@auth_token', userData.token);
//         await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
//         await AsyncStorage.setItem('@user_type', userData.userType);
//         await AsyncStorage.setItem('@user_id', userData._id);

//         // Register push notifications
//         registerForPushNotificationsAsync(userData._id);

//         // Fetch Firebase user data and update AuthContext
//         await fetchUserFirebaseData(userData._id, userData);

//         if (navigationRef.current) {
//           navigationRef.current.reset({
//             index: 0,
//             routes: [{ name: userData.userType === 'host' ? 'Host' : 'Cleaner' }],
//           });
//         } else {
//           console.error('❌ Navigation ref not available');
//         }
//       } else {
//         throw new Error(
//           data.message || data.error || data.detail || 'Authentication failed'
//         );
//       }
//     } catch (error) {
//       console.error('Backend Google login error details:');
//       console.error('- Error message:', error.message);
//       console.error('- Error name:', error.name);
//       console.error('- Error stack:', error.stack);

//       if (error.message.includes('Network request failed')) {
//         Alert.alert(
//           'Network Error',
//           'Please check your internet connection and try again.'
//         );
//       } else if (error.message.includes('Failed to fetch')) {
//         Alert.alert(
//           'Connection Failed',
//           'Unable to connect to the server. Please try again later.'
//         );
//       } else if (error.message.includes('Invalid JSON')) {
//         Alert.alert(
//           'Server Error',
//           'Invalid response from server. Please try again.'
//         );
//       } else {
//         Alert.alert(
//           'Authentication Error',
//           error.message || 'Unable to process Google Sign-In. Please try again.'
//         );
//       }
//     } finally {
//       setGoogleLoading(false);
//     }
//   };

//   const fetchUserFirebaseData = async (uid, response) => {
//     try {
//       const mySnapshot = await get(ref(db, `users/${uid}`));
//       setFBCurrentUser(mySnapshot.val());

//       const data_to_send = {
//         resp: response,
//         fbUser: mySnapshot.val(),
//         expo_push_token: expoPushToken,
//       };

//       console.log('Firebase User collected:', data_to_send.fbUser);

//       login(data_to_send);
//     } catch (error) {
//       console.error('Error fetching Firebase data:', error);
//       // Even if Firebase fails, still login the user
//       const data_to_send = {
//         resp: response,
//         fbUser: null,
//         expo_push_token: expoPushToken,
//       };
//       login(data_to_send);
//     }
//   };

//   const handleEmailLogin = () => {
//     navigation.navigate(ROUTES.signin, { loginMethod: 'email' });
//   };

//   const handleGoogleLogin = async () => {
//     try {
//       await promptAsync();
//     } catch (error) {
//       console.error('Google prompt error:', error);
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
//         console.log('Apple Sign-In was cancelled');
//       } else {
//         console.error('Apple Sign-In Error:');
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
//       console.log('Apple credential:', credential);

//       const response = await fetch(
//         'https://www.freshsweeper.com/api/auth/apple_auth',
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             identityToken: credential.identityToken,
//             authorizationCode: credential.authorizationCode,
//             user: {
//               id: credential.user,
//               email: credential.email,
//               firstname: credential.fullName?.givenName || null,
//               lastname: credential.fullName?.familyName || null,
//               fullname:
//                 `${credential.fullName?.givenName || ''} ${credential.fullName?.familyName || ''}`.trim(),
//             },
//           }),
//         }
//       );

//       const data = await response.json();

//       if (response.ok) {
//         const userData = data.data;
//         console.log('Apple return data:', userData);

//         // Store token and user data (including userType)
//         await AsyncStorage.setItem('@auth_token', userData.token);
//         await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
//         await AsyncStorage.setItem('@user_type', userData.userType);
//         await AsyncStorage.setItem('@user_id', userData._id);

//         registerForPushNotificationsAsync(userData._id);
//         await fetchUserFirebaseData(userData._id, userData);

//         if (navigationRef.current) {
//           navigationRef.current.reset({
//             index: 0,
//             routes: [
//               {
//                 name: userData.userType === 'host' ? 'Host' : 'Cleaner',
//               },
//             ],
//           });
//         }
//       } else {
//         throw new Error(data.detail || 'Apple Sign-In failed');
//       }
//     } catch (error) {
//       console.error('Apple credential error:', error);
//       Alert.alert('Error', 'Unable to process Apple Sign-In.');
//     } finally {
//       setAppleLoading(false);
//     }
//   };

//   // Check if we can go back
//   const canGoBack = navigation.canGoBack();

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />

//       {/* Conditionally show back button if there's a previous screen */}
//       {canGoBack && (
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//         >
//           <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
//         </TouchableOpacity>
//       )}

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
//                     <ActivityIndicator
//                       size="small"
//                       color="#000"
//                       style={styles.loadingIndicator}
//                     />
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

//           {/* Google Login Option */}
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
//                   <Text style={styles.optionTitle}>Continue with Google</Text>
//                   <Text style={styles.optionDescription}>
//                     Quick login with your Google account
//                   </Text>
//                 </View>
//                 {googleLoading && (
//                   <ActivityIndicator
//                     size="small"
//                     color="#DB4437"
//                     style={styles.loadingIndicator}
//                   />
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

//         {/* Privacy Policy Link */}
//         <TouchableOpacity
//           style={styles.privacyLinkContainer}
//           onPress={() => Linking.openURL('https://your-privacy-policy-url.com')}
//         >
//           <Text style={styles.privacyLinkText}>Privacy Policy</Text>
//         </TouchableOpacity>
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
//   privacyLinkContainer: {
//     marginTop: 20,
//     alignItems: 'center',
//   },
//   privacyLinkText: {
//     fontSize: 14,
//     color: COLORS.primary,
//     textDecorationLine: 'underline',
//   },
// });

// export default LoginOptions;







// import React, { useState, useEffect, useContext } from 'react';
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
//   Linking,
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
// import fetchIPGeolocation from '../../services/geolocation';
// import { useNotification } from '../../hooks/useNotification';
// import { AuthContext } from '../../context/AuthContext';
// import { navigationRef } from '../../utils/navigationRef';
// import { db } from '../../services/firebase/config';
// import { ref, get } from 'firebase/database';

// const GOOGLE_CLIENT_ID =
//   '283581670255-i89tij454i1l0705lovhrthq7n761b5a.apps.googleusercontent.com';

// WebBrowser.maybeCompleteAuthSession();

// const LoginOptions = () => {
//   const navigation = useNavigation();
//   const [appleLoading, setAppleLoading] = useState(false);
//   const [googleLoading, setGoogleLoading] = useState(false);
//   const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
//   const [geolocationData, setGeolocationData] = useState({});

//   const { expoPushToken, registerForPushNotificationsAsync } = useNotification();
//   const { login } = useContext(AuthContext);

//   const [request, response, promptAsync] = Google.useAuthRequest({
//     iosClientId: GOOGLE_CLIENT_ID,
//     androidClientId: GOOGLE_CLIENT_ID,
//     webClientId: GOOGLE_CLIENT_ID,
//   });

//   const fetchGeolocation = async () => {
//     try {
//       const data = await fetchIPGeolocation();
//       setGeolocationData(data);
//     } catch (error) {
//       console.error('Error fetching geolocation:', error);
//     }
//   };

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

//   useEffect(() => {
//     fetchGeolocation();
//     checkAppleAuthAvailability();
//   }, []);

//   // ------------------------------------------------------------------
//   // GOOGLE SIGN-IN
//   // ------------------------------------------------------------------
//   useEffect(() => {
//     if (response?.type === 'success') {
//       const { authentication } = response;
//       if (authentication?.accessToken) {
//         // Fetch user info from Google
//         fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
//           headers: { Authorization: `Bearer ${authentication.accessToken}` },
//         })
//           .then((res) => res.json())
//           .then(async (googleUser) => {
//             console.log('🔵 Google User Info:', googleUser);
//             // Try to log in without userType
//             const loggedIn = await handleGoogleLoginAttempt(googleUser, authentication.idToken);
//             if (!loggedIn) {
//               console.log('🆕 User not found, navigating to GettingStarted');
//               navigation.navigate(ROUTES.getting_started, {
//                 googleUser: googleUser,
//                 idToken: authentication.idToken,
//                 accessToken: authentication.accessToken,
//               });
//             } else {
//               console.log('✅ User logged in successfully');
//             }
//           })
//           .catch((error) => {
//             console.error('Error fetching Google user info:', error);
//             Alert.alert('Error', 'Could not fetch Google user info.');
//           })
//           .finally(() => setGoogleLoading(false));
//       } else {
//         setGoogleLoading(false);
//       }
//     }
//   }, [response]);

//   const handleGoogleLoginAttempt = async (googleUser, idToken) => {
//     try {
//       const baseUrl = 'https://www.freshsweeper.com';
//       const endpoint = `${baseUrl}/api/auth/google_auth`;

//       console.log('📤 Attempting Google login without userType');
//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Accept: 'application/json',
//         },
//         body: JSON.stringify({
//           token: idToken,
//           // No userType
//         }),
//       });

//       const data = await response.json();
//       console.log('📥 Google login response:', {
//         status: response.status,
//         ok: response.ok,
//         data: data,
//       });

//       if (response.ok && data.status === 'success') {
//         // User exists – log them in
//         const userData = data.data;
//         await completeLogin(userData);
//         return true;
//       } else if (response.status === 400 && data.detail?.includes('userType is required')) {
//         // User not found – return false
//         console.log('👤 User not found, will redirect to GettingStarted');
//         return false;
//       } else {
//         // Some other error – show alert and return false
//         const errorMsg = data.detail || data.message || 'Google Sign-In failed';
//         console.error('❌ Google login error:', errorMsg);
//         Alert.alert('Error', errorMsg);
//         return false;
//       }
//     } catch (error) {
//       console.error('❌ Google login attempt error:', error);
//       Alert.alert('Error', 'Unable to process Google Sign-In.');
//       return false;
//     }
//   };

//   // ------------------------------------------------------------------
//   // APPLE SIGN-IN
//   // ------------------------------------------------------------------
//   const handleAppleLogin = async () => {
//     try {
//       setAppleLoading(true);
//       const credential = await AppleAuthentication.signInAsync({
//         requestedScopes: [
//           AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
//           AppleAuthentication.AppleAuthenticationScope.EMAIL,
//         ],
//       });

//       console.log('🍎 Apple credential:', credential);
//       const loggedIn = await handleAppleLoginAttempt(credential);
//       if (!loggedIn) {
//         console.log('🆕 User not found, navigating to GettingStarted');
//         navigation.navigate(ROUTES.getting_started, {
//           appleCredential: credential,
//         });
//       } else {
//         console.log('✅ User logged in successfully');
//       }
//     } catch (error) {
//       if (error.code !== 'ERR_CANCELED') {
//         console.error('🍎 Apple Sign-In error:', error);
//         Alert.alert('Error', 'Apple Sign-In failed');
//       }
//     } finally {
//       setAppleLoading(false);
//     }
//   };

//   const handleAppleLoginAttempt = async (credential) => {
//     try {
//       const baseUrl = 'https://www.freshsweeper.com';
//       const endpoint = `${baseUrl}/api/auth/apple_auth`;

//       const payload = {
//         identityToken: credential.identityToken,
//         authorizationCode: credential.authorizationCode,
//         user: {
//           id: credential.user,
//           email: credential.email || null,
//           firstname: credential.fullName?.givenName || '',
//           lastname: credential.fullName?.familyName || '',
//         },
//         // No userType
//       };
//       console.log('📤 Attempting Apple login without userType', payload);

//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();
//       console.log('📥 Apple login response:', {
//         status: response.status,
//         ok: response.ok,
//         data: data,
//       });

//       if (response.ok && data.status === 'success') {
//         const userData = data.data;
//         await completeLogin(userData);
//         return true;
//       } else if (response.status === 400 && data.detail?.includes('userType is required')) {
//         console.log('👤 User not found, will redirect to GettingStarted');
//         return false;
//       } else {
//         const errorMsg = data.detail || data.message || 'Apple Sign-In failed';
//         console.error('❌ Apple login error:', errorMsg);
//         Alert.alert('Error', errorMsg);
//         return false;
//       }
//     } catch (error) {
//       console.error('❌ Apple login attempt error:', error);
//       Alert.alert('Error', 'Unable to process Apple Sign-In.');
//       return false;
//     }
//   };

//   // ------------------------------------------------------------------
//   // Complete login (store tokens, navigate to main app)
//   // ------------------------------------------------------------------
//   const completeLogin = async (userData) => {
//     try {
//       console.log('🔐 Completing login for user:', userData._id);

//       // Store tokens and user data
//       await AsyncStorage.setItem('@auth_token', userData.token);
//       await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
//       await AsyncStorage.setItem('@user_type', userData.userType);
//       await AsyncStorage.setItem('@user_id', userData._id);
//       await AsyncStorage.setItem('@app_onboarding_shown', 'true');

//       console.log('✅ Tokens stored');

//       // Register push notifications
//       await registerForPushNotificationsAsync(userData._id);

//       // Fetch Firebase user and update AuthContext
//       await fetchUserFirebaseData(userData._id, userData);

//       // Navigate to main app
//       if (navigationRef.current) {
//         console.log('🚀 Resetting navigation to main app');
//         navigationRef.current.reset({
//           index: 0,
//           routes: [{ name: userData.userType === 'host' ? 'Host' : 'Cleaner' }],
//         });
//       } else {
//         console.warn('⚠️ navigationRef not available, using local navigation');
//         navigation.reset({
//           index: 0,
//           routes: [{ name: userData.userType === 'host' ? 'Host' : 'Cleaner' }],
//         });
//       }
//     } catch (error) {
//       console.error('❌ Error completing login:', error);
//       Alert.alert('Error', 'Login failed. Please try again.');
//     }
//   };

//   // ------------------------------------------------------------------
//   // Helper: fetch Firebase user data and update AuthContext
//   // ------------------------------------------------------------------
//   const fetchUserFirebaseData = async (uid, response) => {
//     try {
//       const mySnapshot = await get(ref(db, `users/${uid}`));
//       const data_to_send = {
//         resp: response,
//         fbUser: mySnapshot.val(),
//         expo_push_token: expoPushToken,
//       };
//       console.log('🔥 AuthContext login with Firebase data');
//       login(data_to_send);
//     } catch (error) {
//       console.error('Error fetching Firebase data:', error);
//       // Even if Firebase fails, still login the user
//       const data_to_send = {
//         resp: response,
//         fbUser: null,
//         expo_push_token: expoPushToken,
//       };
//       login(data_to_send);
//     }
//   };

//   // ------------------------------------------------------------------
//   // EMAIL LOGIN
//   // ------------------------------------------------------------------
//   const handleEmailLogin = () => {
//     navigation.navigate(ROUTES.signin, { loginMethod: 'email' });
//   };

//   const canGoBack = navigation.canGoBack();

//   // UI (unchanged)
//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />

//       {canGoBack && (
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//         >
//           <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
//         </TouchableOpacity>
//       )}

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
//           {Platform.OS === 'ios' && appleAuthAvailable && (
//             <Animatable.View animation="slideInRight" duration={800} delay={100}>
//               <TouchableOpacity
//                 style={[styles.optionCard, styles.appleCard]}
//                 onPress={handleAppleLogin}
//                 activeOpacity={0.8}
//                 disabled={appleLoading || googleLoading}
//               >
//                 <View style={styles.optionContent}>
//                   <View style={[styles.iconContainer, styles.appleIconContainer]}>
//                     <MaterialCommunityIcons name="apple" size={32} color="#000" />
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
//                   <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
//                 )}
//               </TouchableOpacity>
//             </Animatable.View>
//           )}

//           <Animatable.View animation="slideInRight" duration={800} delay={200}>
//             <TouchableOpacity
//               style={[styles.optionCard, styles.googleCard]}
//               onPress={() => {
//                 if (!request) {
//                   Alert.alert('Error', 'Google Auth not ready');
//                   return;
//                 }
//                 setGoogleLoading(true);
//                 promptAsync();
//               }}
//               activeOpacity={0.8}
//               disabled={!request || googleLoading || appleLoading}
//             >
//               <View style={styles.optionContent}>
//                 <View style={[styles.iconContainer, styles.googleIconContainer]}>
//                   <MaterialCommunityIcons name="google" size={32} color="#DB4437" />
//                 </View>
//                 <View style={styles.textContainer}>
//                   <Text style={styles.optionTitle}>Continue with Google</Text>
//                   <Text style={styles.optionDescription}>
//                     Quick login with your Google account
//                   </Text>
//                 </View>
//                 {googleLoading && (
//                   <ActivityIndicator size="small" color="#DB4437" style={styles.loadingIndicator} />
//                 )}
//               </View>
//               {!googleLoading && (
//                 <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
//               )}
//             </TouchableOpacity>
//           </Animatable.View>

//           <Animatable.View animation="slideInRight" duration={800} delay={300}>
//             <TouchableOpacity
//               style={[styles.optionCard, styles.emailCard]}
//               onPress={handleEmailLogin}
//               activeOpacity={0.8}
//               disabled={appleLoading || googleLoading}
//             >
//               <View style={styles.optionContent}>
//                 <View style={[styles.iconContainer, styles.emailIconContainer]}>
//                   <MaterialCommunityIcons name="email-outline" size={32} color={COLORS.primary} />
//                 </View>
//                 <View style={styles.textContainer}>
//                   <Text style={styles.optionTitle}>Continue with Email</Text>
//                   <Text style={styles.optionDescription}>
//                     Login with your email and password
//                   </Text>
//                 </View>
//               </View>
//               <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
//             </TouchableOpacity>
//           </Animatable.View>
//         </View>

//         <View style={styles.divider}>
//           <View style={styles.dividerLine} />
//           <Text style={styles.dividerText}>OR</Text>
//           <View style={styles.dividerLine} />
//         </View>

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

//         <TouchableOpacity
//           style={styles.privacyLinkContainer}
//           onPress={() => Linking.openURL('https://your-privacy-policy-url.com')}
//         >
//           <Text style={styles.privacyLinkText}>Privacy Policy</Text>
//         </TouchableOpacity>
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
//   privacyLinkContainer: {
//     marginTop: 20,
//     alignItems: 'center',
//   },
//   privacyLinkText: {
//     fontSize: 14,
//     color: COLORS.primary,
//     textDecorationLine: 'underline',
//   },
// });

// export default LoginOptions;




// import React, { useState, useEffect, useContext } from 'react';
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
//   Linking,
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
// import fetchIPGeolocation from '../../services/geolocation';
// import { useNotification } from '../../hooks/useNotification';
// import { AuthContext } from '../../context/AuthContext';
// import { navigationRef } from '../../utils/navigationRef';
// import { db } from '../../services/firebase/config';
// import { ref, get } from 'firebase/database';

// // Use your actual Google client IDs – you may need separate ones for iOS/Android/Web
// // For now, we use the same for simplicity; but you should configure multiple if needed.
// const GOOGLE_CLIENT_ID =
//   '283581670255-i89tij454i1l0705lovhrthq7n761b5a.apps.googleusercontent.com';

// WebBrowser.maybeCompleteAuthSession();

// const LoginOptions = () => {
//   const navigation = useNavigation();
//   const [appleLoading, setAppleLoading] = useState(false);
//   const [googleLoading, setGoogleLoading] = useState(false);
//   const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
//   const [geolocationData, setGeolocationData] = useState({});

//   const { expoPushToken, registerForPushNotificationsAsync } = useNotification();
//   const { login } = useContext(AuthContext);

//   // ========== GOOGLE AUTH – NOW WITH idToken: true ==========
//   const [request, response, promptAsync] = Google.useAuthRequest({
//     iosClientId: GOOGLE_CLIENT_ID,
//     androidClientId: GOOGLE_CLIENT_ID,
//     webClientId: GOOGLE_CLIENT_ID,
//     idToken: true, // <-- critical: ensures we get an idToken
//   });

//   const fetchGeolocation = async () => {
//     try {
//       const data = await fetchIPGeolocation();
//       setGeolocationData(data);
//     } catch (error) {
//       console.error('Error fetching geolocation:', error);
//     }
//   };

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

//   useEffect(() => {
//     fetchGeolocation();
//     checkAppleAuthAvailability();
//   }, []);

//   // ========== GOOGLE RESPONSE HANDLER (with logging) ==========
//   useEffect(() => {
//     if (response?.type === 'success') {
//       const { authentication } = response;
//       console.log('🔵 Google authentication response:', { authentication });

//       if (!authentication?.accessToken) {
//         console.warn('⚠️ No access token received');
//         Alert.alert('Error', 'Google authentication failed – no access token.');
//         setGoogleLoading(false);
//         return;
//       }

//       // If idToken is missing, we may need to get it differently; but with idToken:true it should be present
//       if (!authentication.idToken) {
//         console.warn('⚠️ No idToken received – trying to proceed without it?');
//         // Some flows may not return idToken; we can still try with accessToken, but backend needs idToken.
//         // We'll show an alert and abort.
//         Alert.alert('Error', 'Google authentication failed – no ID token.');
//         setGoogleLoading(false);
//         return;
//       }

//       // Fetch user info from Google
//       fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
//         headers: { Authorization: `Bearer ${authentication.accessToken}` },
//       })
//         .then((res) => {
//           console.log('🔵 User info response status:', res.status);
//           return res.json();
//         })
//         .then(async (googleUser) => {
//           console.log('🔵 Google User Info:', googleUser);

//           // Try to log in without userType
//           const loggedIn = await handleGoogleLoginAttempt(googleUser, authentication.idToken);
//           if (!loggedIn) {
//             console.log('🆕 User not found, navigating to GettingStarted');
//             navigation.navigate(ROUTES.getting_started, {
//               googleUser: googleUser,
//               idToken: authentication.idToken,
//               accessToken: authentication.accessToken,
//             });
//           } else {
//             console.log('✅ User logged in successfully');
//           }
//         })
//         .catch((error) => {
//           console.error('❌ Error fetching Google user info:', error);
//           Alert.alert('Error', 'Could not fetch Google user info. Please try again.');
//         })
//         .finally(() => setGoogleLoading(false));
//     } else if (response?.type === 'error') {
//       console.error('❌ Google auth error:', response.error);
//       Alert.alert('Error', 'Google authentication failed: ' + (response.error?.message || ''));
//       setGoogleLoading(false);
//     }
//   }, [response]);

//   // ========== GOOGLE LOGIN ATTEMPT (existing user check) ==========
//   const handleGoogleLoginAttempt = async (googleUser, idToken) => {
//     try {
//       const baseUrl = 'https://www.freshsweeper.com';
//       const endpoint = `${baseUrl}/api/auth/google_auth`;

//       console.log('📤 Attempting Google login without userType');
//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Accept: 'application/json',
//         },
//         body: JSON.stringify({
//           token: idToken,
//         }),
//       });

//       const data = await response.json();
//       console.log('📥 Google login response:', {
//         status: response.status,
//         ok: response.ok,
//         data,
//       });

//       if (response.ok && data.status === 'success') {
//         // User exists – log them in
//         const userData = data.data;
//         await completeLogin(userData);
//         return true;
//       } else if (response.status === 400 && data.detail?.includes('userType is required')) {
//         // User not found – return false
//         console.log('👤 User not found, will redirect to GettingStarted');
//         return false;
//       } else {
//         // Some other error – show alert and return false
//         const errorMsg = data.detail || data.message || 'Google Sign-In failed';
//         console.error('❌ Google login error:', errorMsg);
//         Alert.alert('Error', errorMsg);
//         return false;
//       }
//     } catch (error) {
//       console.error('❌ Google login attempt error:', error);
//       Alert.alert('Error', 'Unable to process Google Sign-In.');
//       return false;
//     }
//   };

//   // ========== APPLE SIGN-IN (unchanged but with logs) ==========
//   const handleAppleLogin = async () => {
//     try {
//       setAppleLoading(true);
//       const credential = await AppleAuthentication.signInAsync({
//         requestedScopes: [
//           AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
//           AppleAuthentication.AppleAuthenticationScope.EMAIL,
//         ],
//       });

//       console.log('🍎 Apple credential received:', credential);
//       const loggedIn = await handleAppleLoginAttempt(credential);
//       if (!loggedIn) {
//         console.log('🆕 Apple user not found, navigating to GettingStarted');
//         navigation.navigate(ROUTES.getting_started, {
//           appleCredential: credential,
//         });
//       } else {
//         console.log('✅ Apple user logged in successfully');
//       }
//     } catch (error) {
//       if (error.code !== 'ERR_CANCELED') {
//         console.error('🍎 Apple Sign-In error:', error);
//         Alert.alert('Error', 'Apple Sign-In failed');
//       }
//     } finally {
//       setAppleLoading(false);
//     }
//   };

//   const handleAppleLoginAttempt = async (credential) => {
//     try {
//       const baseUrl = 'https://www.freshsweeper.com';
//       const endpoint = `${baseUrl}/api/auth/apple_auth`;

//       const payload = {
//         identityToken: credential.identityToken,
//         authorizationCode: credential.authorizationCode,
//         user: {
//           id: credential.user,
//           email: credential.email || null,
//           firstname: credential.fullName?.givenName || '',
//           lastname: credential.fullName?.familyName || '',
//         },
//       };
//       console.log('📤 Attempting Apple login without userType', payload);

//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();
//       console.log('📥 Apple login response:', {
//         status: response.status,
//         ok: response.ok,
//         data,
//       });

//       if (response.ok && data.status === 'success') {
//         const userData = data.data;
//         await completeLogin(userData);
//         return true;
//       } else if (response.status === 400 && data.detail?.includes('userType is required')) {
//         console.log('👤 Apple user not found, will redirect to GettingStarted');
//         return false;
//       } else {
//         const errorMsg = data.detail || data.message || 'Apple Sign-In failed';
//         console.error('❌ Apple login error:', errorMsg);
//         Alert.alert('Error', errorMsg);
//         return false;
//       }
//     } catch (error) {
//       console.error('❌ Apple login attempt error:', error);
//       Alert.alert('Error', 'Unable to process Apple Sign-In.');
//       return false;
//     }
//   };

//   // ========== COMPLETE LOGIN (store tokens, navigate) ==========
//   const completeLogin = async (userData) => {
//     try {
//       console.log('🔐 Completing login for user:', userData._id);

//       await AsyncStorage.setItem('@auth_token', userData.token);
//       await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
//       await AsyncStorage.setItem('@user_type', userData.userType);
//       await AsyncStorage.setItem('@user_id', userData._id);
//       await AsyncStorage.setItem('@app_onboarding_shown', 'true');

//       console.log('✅ Tokens stored');

//       await registerForPushNotificationsAsync(userData._id);
//       await fetchUserFirebaseData(userData._id, userData);

//       if (navigationRef.current) {
//         console.log('🚀 Resetting navigation to main app');
//         navigationRef.current.reset({
//           index: 0,
//           routes: [{ name: userData.userType === 'host' ? 'Host' : 'Cleaner' }],
//         });
//       } else {
//         console.warn('⚠️ navigationRef not available, using local navigation');
//         navigation.reset({
//           index: 0,
//           routes: [{ name: userData.userType === 'host' ? 'Host' : 'Cleaner' }],
//         });
//       }
//     } catch (error) {
//       console.error('❌ Error completing login:', error);
//       Alert.alert('Error', 'Login failed. Please try again.');
//     }
//   };

//   const fetchUserFirebaseData = async (uid, response) => {
//     try {
//       const mySnapshot = await get(ref(db, `users/${uid}`));
//       const data_to_send = {
//         resp: response,
//         fbUser: mySnapshot.val(),
//         expo_push_token: expoPushToken,
//       };
//       login(data_to_send);
//     } catch (error) {
//       console.error('Error fetching Firebase data:', error);
//       const data_to_send = {
//         resp: response,
//         fbUser: null,
//         expo_push_token: expoPushToken,
//       };
//       login(data_to_send);
//     }
//   };

//   const handleEmailLogin = () => {
//     navigation.navigate(ROUTES.signin, { loginMethod: 'email' });
//   };

//   const canGoBack = navigation.canGoBack();

//   // UI remains unchanged
//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />

//       {canGoBack && (
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//         >
//           <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
//         </TouchableOpacity>
//       )}

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
//           {Platform.OS === 'ios' && appleAuthAvailable && (
//             <Animatable.View animation="slideInRight" duration={800} delay={100}>
//               <TouchableOpacity
//                 style={[styles.optionCard, styles.appleCard]}
//                 onPress={handleAppleLogin}
//                 activeOpacity={0.8}
//                 disabled={appleLoading || googleLoading}
//               >
//                 <View style={styles.optionContent}>
//                   <View style={[styles.iconContainer, styles.appleIconContainer]}>
//                     <MaterialCommunityIcons name="apple" size={32} color="#000" />
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
//                   <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
//                 )}
//               </TouchableOpacity>
//             </Animatable.View>
//           )}

//           <Animatable.View animation="slideInRight" duration={800} delay={200}>
//             <TouchableOpacity
//               style={[styles.optionCard, styles.googleCard]}
//               onPress={() => {
//                 if (!request) {
//                   Alert.alert('Error', 'Google Auth not ready');
//                   return;
//                 }
//                 setGoogleLoading(true);
//                 promptAsync();
//               }}
//               activeOpacity={0.8}
//               disabled={!request || googleLoading || appleLoading}
//             >
//               <View style={styles.optionContent}>
//                 <View style={[styles.iconContainer, styles.googleIconContainer]}>
//                   <MaterialCommunityIcons name="google" size={32} color="#DB4437" />
//                 </View>
//                 <View style={styles.textContainer}>
//                   <Text style={styles.optionTitle}>Continue with Google</Text>
//                   <Text style={styles.optionDescription}>
//                     Quick login with your Google account
//                   </Text>
//                 </View>
//                 {googleLoading && (
//                   <ActivityIndicator size="small" color="#DB4437" style={styles.loadingIndicator} />
//                 )}
//               </View>
//               {!googleLoading && (
//                 <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
//               )}
//             </TouchableOpacity>
//           </Animatable.View>

//           <Animatable.View animation="slideInRight" duration={800} delay={300}>
//             <TouchableOpacity
//               style={[styles.optionCard, styles.emailCard]}
//               onPress={handleEmailLogin}
//               activeOpacity={0.8}
//               disabled={appleLoading || googleLoading}
//             >
//               <View style={styles.optionContent}>
//                 <View style={[styles.iconContainer, styles.emailIconContainer]}>
//                   <MaterialCommunityIcons name="email-outline" size={32} color={COLORS.primary} />
//                 </View>
//                 <View style={styles.textContainer}>
//                   <Text style={styles.optionTitle}>Continue with Email</Text>
//                   <Text style={styles.optionDescription}>
//                     Login with your email and password
//                   </Text>
//                 </View>
//               </View>
//               <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
//             </TouchableOpacity>
//           </Animatable.View>
//         </View>

//         <View style={styles.divider}>
//           <View style={styles.dividerLine} />
//           <Text style={styles.dividerText}>OR</Text>
//           <View style={styles.dividerLine} />
//         </View>

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

//         <TouchableOpacity
//           style={styles.privacyLinkContainer}
//           onPress={() => Linking.openURL('https://your-privacy-policy-url.com')}
//         >
//           <Text style={styles.privacyLinkText}>Privacy Policy</Text>
//         </TouchableOpacity>
//       </Animatable.View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   // ... (same as before)
//   container: { flex: 1, backgroundColor: '#fff' },
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
//   content: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
//   header: { alignItems: 'center', marginBottom: 40 },
//   title: { fontSize: 28, fontWeight: 'bold', color: COLORS.dark, marginBottom: 10 },
//   subtitle: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 22 },
//   optionsContainer: { marginBottom: 30 },
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
//   appleCard: { borderColor: '#f0f0f0' },
//   googleCard: { borderColor: '#f0f0f0' },
//   emailCard: { borderColor: '#f0f0f0' },
//   optionContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
//   iconContainer: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 16,
//   },
//   appleIconContainer: { backgroundColor: '#f8f8f8' },
//   googleIconContainer: { backgroundColor: '#f8f8f8' },
//   emailIconContainer: { backgroundColor: '#f8f8f8' },
//   textContainer: { flex: 1 },
//   optionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.dark, marginBottom: 4 },
//   optionDescription: { fontSize: 14, color: '#666' },
//   loadingIndicator: { marginLeft: 10 },
//   divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
//   dividerLine: { flex: 1, height: 1, backgroundColor: '#eee' },
//   dividerText: { marginHorizontal: 15, color: '#999', fontSize: 14 },
//   signupContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
//   signupText: { fontSize: 14, color: '#666' },
//   signupLink: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
//   privacyLinkContainer: { marginTop: 20, alignItems: 'center' },
//   privacyLinkText: { fontSize: 14, color: COLORS.primary, textDecorationLine: 'underline' },
// });

// export default LoginOptions;



// import React, { useState, useEffect, useContext } from 'react';
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
//   Linking,
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
// import fetchIPGeolocation from '../../services/geolocation';
// import { useNotification } from '../../hooks/useNotification';
// import { AuthContext } from '../../context/AuthContext';
// import { navigationRef } from '../../utils/navigationRef';
// import { WebView } from "react-native-webview";
// import { db } from '../../services/firebase/config';
// import { ref, get } from 'firebase/database';

// const GOOGLE_CLIENT_ID =
//   '283581670255-i89tij454i1l0705lovhrthq7n761b5a.apps.googleusercontent.com';

// WebBrowser.maybeCompleteAuthSession();

// const LoginOptions = () => {
//   const navigation = useNavigation();
//   const [appleLoading, setAppleLoading] = useState(false);
//   const [googleLoading, setGoogleLoading] = useState(false);
//   const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
//   const [geolocationData, setGeolocationData] = useState({});

//   const { expoPushToken, registerForPushNotificationsAsync } = useNotification();
//   const { login } = useContext(AuthContext);

//   // ========== GOOGLE AUTH – WITH SCOPES AND idToken ==========
//   const [request, response, promptAsync] = Google.useAuthRequest({
//     iosClientId: GOOGLE_CLIENT_ID,
//     androidClientId: GOOGLE_CLIENT_ID,
//     webClientId: GOOGLE_CLIENT_ID,
//     scopes: ['profile', 'email', 'openid'], // <-- ensures idToken is returned
//     idToken: true,
//   });

//   const fetchGeolocation = async () => {
//     try {
//       const data = await fetchIPGeolocation();
//       setGeolocationData(data);
//     } catch (error) {
//       console.error('Error fetching geolocation:', error);
//     }
//   };

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

//   useEffect(() => {
//     fetchGeolocation();
//     checkAppleAuthAvailability();
//   }, []);

//   // ========== GOOGLE RESPONSE HANDLER ==========
//   useEffect(() => {
//     if (response?.type === 'success') {
//       const { authentication } = response;
//       console.log('🔵 Google authentication response:', { authentication });

//       if (!authentication?.accessToken) {
//         Alert.alert('Error', 'Google authentication failed – no access token.');
//         setGoogleLoading(false);
//         return;
//       }

//       if (!authentication.idToken) {
//         console.warn('⚠️ No idToken received – check scopes in Google config.');
//         Alert.alert('Error', 'Google authentication failed – no ID token. Please try again.');
//         setGoogleLoading(false);
//         return;
//       }

//       // Fetch user info
//       fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
//         headers: { Authorization: `Bearer ${authentication.accessToken}` },
//       })
//         .then((res) => res.json())
//         .then(async (googleUser) => {
//           console.log('🔵 Google User Info:', googleUser);

//           const loggedIn = await handleGoogleLoginAttempt(googleUser, authentication.idToken);
//           if (!loggedIn) {
//             console.log('🆕 User not found, navigating to GettingStarted');
//             navigation.navigate(ROUTES.getting_started, {
//               googleUser: googleUser,
//               idToken: authentication.idToken,
//               accessToken: authentication.accessToken,
//             });
//           } else {
//             console.log('✅ User logged in successfully');
//           }
//         })
//         .catch((error) => {
//           console.error('❌ Error fetching Google user info:', error);
//           Alert.alert('Error', 'Could not fetch Google user info. Please try again.');
//         })
//         .finally(() => setGoogleLoading(false));
//     } else if (response?.type === 'error') {
//       console.error('❌ Google auth error:', response.error);
//       Alert.alert('Error', 'Google authentication failed.');
//       setGoogleLoading(false);
//     }
//   }, [response]);

//   // ========== CHECK EXISTING USER ==========
//   const handleGoogleLoginAttempt = async (googleUser, idToken) => {
//     try {
//       const baseUrl = 'https://www.freshsweeper.com';
//       const endpoint = `${baseUrl}/api/auth/google_auth`;

//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
//         body: JSON.stringify({ token: idToken }),
//       });

//       const data = await response.json();
//       console.log('📥 Google login check response:', data);

//       if (response.ok && data.status === 'success') {
//         const userData = data.data;
//         await completeLogin(userData);
//         return true;
//       } else if (response.status === 400 && data.detail?.includes('userType is required')) {
//         return false;
//       } else {
//         const errorMsg = data.detail || data.message || 'Google Sign-In failed';
//         Alert.alert('Error', errorMsg);
//         return false;
//       }
//     } catch (error) {
//       console.error('❌ Google login attempt error:', error);
//       Alert.alert('Error', 'Unable to process Google Sign-In.');
//       return false;
//     }
//   };

//   // ========== APPLE SIGN-IN ==========
//   const handleAppleLogin = async () => {
//     try {
//       setAppleLoading(true);
//       const credential = await AppleAuthentication.signInAsync({
//         requestedScopes: [
//           AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
//           AppleAuthentication.AppleAuthenticationScope.EMAIL,
//         ],
//       });

//       console.log('🍎 Apple credential:', credential);
//       const loggedIn = await handleAppleLoginAttempt(credential);
//       if (!loggedIn) {
//         navigation.navigate(ROUTES.getting_started, { appleCredential: credential });
//       }
//     } catch (error) {
//       if (error.code !== 'ERR_CANCELED') {
//         console.error('🍎 Apple error:', error);
//         Alert.alert('Error', 'Apple Sign-In failed');
//       }
//     } finally {
//       setAppleLoading(false);
//     }
//   };

//   const handleAppleLoginAttempt = async (credential) => {
//     try {
//       const baseUrl = 'https://www.freshsweeper.com';
//       const endpoint = `${baseUrl}/api/auth/apple_auth`;

//       const payload = {
//         identityToken: credential.identityToken,
//         authorizationCode: credential.authorizationCode,
//         user: {
//           id: credential.user,
//           email: credential.email || null,
//           firstname: credential.fullName?.givenName || '',
//           lastname: credential.fullName?.familyName || '',
//         },
//       };

//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();
//       if (response.ok && data.status === 'success') {
//         await completeLogin(data.data);
//         return true;
//       } else if (response.status === 400 && data.detail?.includes('userType is required')) {
//         return false;
//       } else {
//         Alert.alert('Error', data.detail || 'Apple Sign-In failed');
//         return false;
//       }
//     } catch (error) {
//       console.error('❌ Apple login attempt error:', error);
//       Alert.alert('Error', 'Unable to process Apple Sign-In.');
//       return false;
//     }
//   };

//   // ========== COMPLETE LOGIN ==========
//   const completeLogin = async (userData) => {
//     try {
//       await AsyncStorage.setItem('@auth_token', userData.token);
//       await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
//       await AsyncStorage.setItem('@user_type', userData.userType);
//       await AsyncStorage.setItem('@user_id', userData._id);
//       await AsyncStorage.setItem('@app_onboarding_shown', 'true');

//       await registerForPushNotificationsAsync(userData._id);
//       await fetchUserFirebaseData(userData._id, userData);

//       if (navigationRef.current) {
//         navigationRef.current.reset({
//           index: 0,
//           routes: [{ name: userData.userType === 'host' ? 'Host' : 'Cleaner' }],
//         });
//       } else {
//         navigation.reset({
//           index: 0,
//           routes: [{ name: userData.userType === 'host' ? 'Host' : 'Cleaner' }],
//         });
//       }
//     } catch (error) {
//       console.error('❌ Complete login error:', error);
//       Alert.alert('Error', 'Login failed. Please try again.');
//     }
//   };

//   const fetchUserFirebaseData = async (uid, response) => {
//     try {
//       const mySnapshot = await get(ref(db, `users/${uid}`));
//       const data_to_send = { resp: response, fbUser: mySnapshot.val(), expo_push_token: expoPushToken };
//       login(data_to_send);
//     } catch (error) {
//       const data_to_send = { resp: response, fbUser: null, expo_push_token: expoPushToken };
//       login(data_to_send);
//     }
//   };

//   const handleEmailLogin = () => navigation.navigate(ROUTES.signin, { loginMethod: 'email' });

//   const canGoBack = navigation.canGoBack();

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
//       {canGoBack && (
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
//         </TouchableOpacity>
//       )}

//       <Animatable.View animation="fadeInUp" duration={600} style={styles.content}>
//         <View style={styles.header}>
//           <Text style={styles.title}>Welcome Back!</Text>
//           <Text style={styles.subtitle}>Choose how you'd like to login to your account</Text>
//         </View>

//         <View style={styles.optionsContainer}>
//           {Platform.OS === 'ios' && appleAuthAvailable && (
//             <TouchableOpacity
//               style={[styles.optionCard, styles.appleCard]}
//               onPress={handleAppleLogin}
//               disabled={appleLoading || googleLoading}
//             >
//               <View style={styles.optionContent}>
//                 <View style={[styles.iconContainer, styles.appleIconContainer]}>
//                   <MaterialCommunityIcons name="apple" size={32} color="#000" />
//                 </View>
//                 <View style={styles.textContainer}>
//                   <Text style={styles.optionTitle}>Continue with Apple</Text>
//                   <Text style={styles.optionDescription}>Securely sign in with your Apple ID</Text>
//                 </View>
//                 {appleLoading && <ActivityIndicator size="small" color="#000" style={styles.loadingIndicator} />}
//               </View>
//               {!appleLoading && <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />}
//             </TouchableOpacity>
//           )}

//           <TouchableOpacity
//             style={[styles.optionCard, styles.googleCard]}
//             onPress={() => {
//               if (!request) { Alert.alert('Error', 'Google Auth not ready'); return; }
//               setGoogleLoading(true);
//               promptAsync();
//             }}
//             disabled={!request || googleLoading || appleLoading}
//           >
//             <View style={styles.optionContent}>
//               <View style={[styles.iconContainer, styles.googleIconContainer]}>
//                 <MaterialCommunityIcons name="google" size={32} color="#DB4437" />
//               </View>
//               <View style={styles.textContainer}>
//                 <Text style={styles.optionTitle}>Continue with Google</Text>
//                 <Text style={styles.optionDescription}>Quick login with your Google account</Text>
//               </View>
//               {googleLoading && <ActivityIndicator size="small" color="#DB4437" style={styles.loadingIndicator} />}
//             </View>
//             {!googleLoading && <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />}
//           </TouchableOpacity>

//           <TouchableOpacity style={[styles.optionCard, styles.emailCard]} onPress={handleEmailLogin} disabled={appleLoading || googleLoading}>
//             <View style={styles.optionContent}>
//               <View style={[styles.iconContainer, styles.emailIconContainer]}>
//                 <MaterialCommunityIcons name="email-outline" size={32} color={COLORS.primary} />
//               </View>
//               <View style={styles.textContainer}>
//                 <Text style={styles.optionTitle}>Continue with Email</Text>
//                 <Text style={styles.optionDescription}>Login with your email and password</Text>
//               </View>
//             </View>
//             <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.divider}>
//           <View style={styles.dividerLine} /><Text style={styles.dividerText}>OR</Text><View style={styles.dividerLine} />
//         </View>

//         <View style={styles.signupContainer}>
//           <Text style={styles.signupText}>Don't have an account? </Text>
//           <TouchableOpacity onPress={() => navigation.navigate(ROUTES.getting_started)}>
//             <Text style={styles.signupLink}>Sign Up</Text>
//           </TouchableOpacity>
//         </View>

//         <TouchableOpacity style={styles.privacyLinkContainer} onPress={() => Linking.openURL('https://your-privacy-policy-url.com')}>
//           <Text style={styles.privacyLinkText}>Privacy Policy</Text>
//         </TouchableOpacity>
//       </Animatable.View>
//     </SafeAreaView>
//   );
// };

// // Styles (unchanged)
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff' },
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
//   content: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
//   header: { alignItems: 'center', marginBottom: 40 },
//   title: { fontSize: 28, fontWeight: 'bold', color: COLORS.dark, marginBottom: 10 },
//   subtitle: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 22 },
//   optionsContainer: { marginBottom: 30 },
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
//   optionContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
//   iconContainer: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
//   appleIconContainer: { backgroundColor: '#f8f8f8' },
//   googleIconContainer: { backgroundColor: '#f8f8f8' },
//   emailIconContainer: { backgroundColor: '#f8f8f8' },
//   textContainer: { flex: 1 },
//   optionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.dark, marginBottom: 4 },
//   optionDescription: { fontSize: 14, color: '#666' },
//   loadingIndicator: { marginLeft: 10 },
//   divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
//   dividerLine: { flex: 1, height: 1, backgroundColor: '#eee' },
//   dividerText: { marginHorizontal: 15, color: '#999', fontSize: 14 },
//   signupContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
//   signupText: { fontSize: 14, color: '#666' },
//   signupLink: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
//   privacyLinkContainer: { marginTop: 20, alignItems: 'center' },
//   privacyLinkText: { fontSize: 14, color: COLORS.primary, textDecorationLine: 'underline' },
// });

// export default LoginOptions;


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
  Modal,
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
import { useNotification } from '../../hooks/useNotification';
import { AuthContext } from '../../context/AuthContext';
import { navigationRef } from '../../utils/navigationRef';
import { db } from '../../services/firebase/config';
import { ref, get } from 'firebase/database';
import { WebView } from 'react-native-webview'; // <-- import WebView

const GOOGLE_CLIENT_ID =
  '283581670255-i89tij454i1l0705lovhrthq7n761b5a.apps.googleusercontent.com';

WebBrowser.maybeCompleteAuthSession();

const LoginOptions = () => {
  const navigation = useNavigation();
  const [appleLoading, setAppleLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
  const [geolocationData, setGeolocationData] = useState({});
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false); // <-- new
  const [webviewLoading, setWebviewLoading] = useState(true);
  const [webviewError, setWebviewError] = useState(false);

  const { expoPushToken, registerForPushNotificationsAsync } = useNotification();
  const { login } = useContext(AuthContext);

  // Google Auth with scopes
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_CLIENT_ID,
    webClientId: GOOGLE_CLIENT_ID,
    scopes: ['profile', 'email', 'openid'],
    idToken: true,
  });

  const fetchGeolocation = async () => {
    try {
      const data = await fetchIPGeolocation();
      setGeolocationData(data);
    } catch (error) {
      console.error('Error fetching geolocation:', error);
    }
  };

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

  useEffect(() => {
    fetchGeolocation();
    checkAppleAuthAvailability();
  }, []);

  // Google response handler (unchanged)
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (!authentication?.accessToken || !authentication.idToken) {
        Alert.alert('Error', 'Google authentication failed – missing tokens.');
        setGoogleLoading(false);
        return;
      }

      fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${authentication.accessToken}` },
      })
        .then((res) => res.json())
        .then(async (googleUser) => {
          const loggedIn = await handleGoogleLoginAttempt(googleUser, authentication.idToken);
          if (!loggedIn) {
            navigation.navigate(ROUTES.getting_started, {
              googleUser,
              idToken: authentication.idToken,
              accessToken: authentication.accessToken,
            });
          }
        })
        .catch((error) => {
          console.error('Error fetching Google user info:', error);
          Alert.alert('Error', 'Could not fetch Google user info.');
        })
        .finally(() => setGoogleLoading(false));
    } else if (response?.type === 'error') {
      console.error('Google auth error:', response.error);
      Alert.alert('Error', 'Google authentication failed.');
      setGoogleLoading(false);
    }
  }, [response]);

  // Existing user check (unchanged)
  const handleGoogleLoginAttempt = async (googleUser, idToken) => {
    try {
      const baseUrl = 'https://www.freshsweeper.com';
      const endpoint = `${baseUrl}/api/auth/google_auth`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ token: idToken }),
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        await completeLogin(data.data);
        return true;
      } else if (response.status === 400 && data.detail?.includes('userType is required')) {
        return false;
      } else {
        Alert.alert('Error', data.detail || 'Google Sign-In failed');
        return false;
      }
    } catch (error) {
      console.error('Google login attempt error:', error);
      Alert.alert('Error', 'Unable to process Google Sign-In.');
      return false;
    }
  };

  // Apple handlers (unchanged)
  const handleAppleLogin = async () => {
    try {
      setAppleLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const loggedIn = await handleAppleLoginAttempt(credential);
      if (!loggedIn) {
        navigation.navigate(ROUTES.getting_started, { appleCredential: credential });
      }
    } catch (error) {
      if (error.code !== 'ERR_CANCELED') {
        Alert.alert('Error', 'Apple Sign-In failed');
      }
    } finally {
      setAppleLoading(false);
    }
  };

  const handleAppleLoginAttempt = async (credential) => {
    try {
      const baseUrl = 'https://www.freshsweeper.com';
      const endpoint = `${baseUrl}/api/auth/apple_auth`;
      const payload = {
        identityToken: credential.identityToken,
        authorizationCode: credential.authorizationCode,
        user: {
          id: credential.user,
          email: credential.email || null,
          firstname: credential.fullName?.givenName || '',
          lastname: credential.fullName?.familyName || '',
        },
      };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        await completeLogin(data.data);
        return true;
      } else if (response.status === 400 && data.detail?.includes('userType is required')) {
        return false;
      } else {
        Alert.alert('Error', data.detail || 'Apple Sign-In failed');
        return false;
      }
    } catch (error) {
      console.error('Apple login attempt error:', error);
      Alert.alert('Error', 'Unable to process Apple Sign-In.');
      return false;
    }
  };

  // Complete login (unchanged)
  const completeLogin = async (userData) => {
    try {
      await AsyncStorage.setItem('@auth_token', userData.token);
      await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
      await AsyncStorage.setItem('@user_type', userData.userType);
      await AsyncStorage.setItem('@user_id', userData._id);
      await AsyncStorage.setItem('@app_onboarding_shown', 'true');

      await registerForPushNotificationsAsync(userData._id);
      await fetchUserFirebaseData(userData._id, userData);

      if (navigationRef.current) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: userData.userType === 'host' ? 'Host' : 'Cleaner' }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: userData.userType === 'host' ? 'Host' : 'Cleaner' }],
        });
      }
    } catch (error) {
      console.error('Complete login error:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    }
  };

  const fetchUserFirebaseData = async (uid, response) => {
    try {
      const mySnapshot = await get(ref(db, `users/${uid}`));
      login({ resp: response, fbUser: mySnapshot.val(), expo_push_token: expoPushToken });
    } catch (error) {
      login({ resp: response, fbUser: null, expo_push_token: expoPushToken });
    }
  };

  const handleEmailLogin = () => navigation.navigate(ROUTES.signin, { loginMethod: 'email' });

  const canGoBack = navigation.canGoBack();

  // Privacy policy URL (update with your actual URL)
  const PRIVACY_POLICY_URL = 'https://www.freshsweeper.com/privacyp';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {canGoBack && (
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
      )}

      <Animatable.View animation="fadeInUp" duration={600} style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Choose how you'd like to login to your account</Text>
        </View>

        <View style={styles.optionsContainer}>
          {Platform.OS === 'ios' && appleAuthAvailable && (
            <TouchableOpacity
              style={[styles.optionCard, styles.appleCard]}
              onPress={handleAppleLogin}
              disabled={appleLoading || googleLoading}
            >
              <View style={styles.optionContent}>
                <View style={[styles.iconContainer, styles.appleIconContainer]}>
                  <MaterialCommunityIcons name="apple" size={32} color="#000" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.optionTitle}>Continue with Apple</Text>
                  <Text style={styles.optionDescription}>Securely sign in with your Apple ID</Text>
                </View>
                {appleLoading && <ActivityIndicator size="small" color="#000" style={styles.loadingIndicator} />}
              </View>
              {!appleLoading && <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.optionCard, styles.googleCard]}
            onPress={() => {
              if (!request) { Alert.alert('Error', 'Google Auth not ready'); return; }
              setGoogleLoading(true);
              promptAsync();
            }}
            disabled={!request || googleLoading || appleLoading}
          >
            <View style={styles.optionContent}>
              <View style={[styles.iconContainer, styles.googleIconContainer]}>
                <MaterialCommunityIcons name="google" size={32} color="#DB4437" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.optionTitle}>Continue with Google</Text>
                <Text style={styles.optionDescription}>Quick login with your Google account</Text>
              </View>
              {googleLoading && <ActivityIndicator size="small" color="#DB4437" style={styles.loadingIndicator} />}
            </View>
            {!googleLoading && <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, styles.emailCard]}
            onPress={handleEmailLogin}
            disabled={appleLoading || googleLoading}
          >
            <View style={styles.optionContent}>
              <View style={[styles.iconContainer, styles.emailIconContainer]}>
                <MaterialCommunityIcons name="email-outline" size={32} color={COLORS.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.optionTitle}>Continue with Email</Text>
                <Text style={styles.optionDescription}>Login with your email and password</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} /><Text style={styles.dividerText}>OR</Text><View style={styles.dividerLine} />
        </View>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.getting_started)}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Policy – now opens WebView modal */}
        <TouchableOpacity
          style={styles.privacyLinkContainer}
          onPress={() => setShowPrivacyPolicy(true)}
        >
          <Text style={styles.privacyLinkText}>Privacy Policy</Text>
        </TouchableOpacity>
      </Animatable.View>

      {/* ========== WebView Modal ========== */}
      <Modal
        visible={showPrivacyPolicy}
        animationType="slide"
        onRequestClose={() => setShowPrivacyPolicy(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowPrivacyPolicy(false)}
              style={styles.closeButton}
            >
              <MaterialCommunityIcons name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <View style={{ width: 40 }} />
          </View>

          {webviewError ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={60} color="#ff6b6b" />
              <Text style={styles.errorText}>Failed to load privacy policy</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setWebviewError(false);
                  setWebviewLoading(true);
                }}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {webviewLoading && (
                <View style={styles.webviewLoader}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              )}
              <WebView
                source={{ uri: PRIVACY_POLICY_URL }}
                style={[styles.webview, { opacity: webviewLoading ? 0 : 1 }]}
                onLoadStart={() => setWebviewLoading(true)}
                onLoadEnd={() => setWebviewLoading(false)}
                onError={() => {
                  setWebviewLoading(false);
                  setWebviewError(true);
                }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={false}
              />
            </>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

// ========== Styles ==========
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.dark, marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 22 },
  optionsContainer: { marginBottom: 30 },
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
  optionContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  appleIconContainer: { backgroundColor: '#f8f8f8' },
  googleIconContainer: { backgroundColor: '#f8f8f8' },
  emailIconContainer: { backgroundColor: '#f8f8f8' },
  textContainer: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.dark, marginBottom: 4 },
  optionDescription: { fontSize: 14, color: '#666' },
  loadingIndicator: { marginLeft: 10 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#eee' },
  dividerText: { marginHorizontal: 15, color: '#999', fontSize: 14 },
  signupContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  signupText: { fontSize: 14, color: '#666' },
  signupLink: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  privacyLinkContainer: { marginTop: 20, alignItems: 'center' },
  privacyLinkText: { fontSize: 14, color: COLORS.primary, textDecorationLine: 'underline' },

  // Modal styles
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  closeButton: { padding: 4 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  webview: { flex: 1 },
  webviewLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  errorText: { fontSize: 16, color: '#666', marginTop: 16, textAlign: 'center' },
  retryButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default LoginOptions;