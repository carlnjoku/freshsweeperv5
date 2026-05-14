// import { 
//     StyleSheet, 
//     Text, 
//     View, 
//     TouchableOpacity, 
//     StatusBar, 
//     Alert,
//     ActivityIndicator,
//     Platform 
//   } from 'react-native';
//   import React, { useState, useEffect, useContext } from 'react';
//   import ROUTES from '../../constants/routes';
//   import COLORS from '../../constants/colors';
//   import { AuthContext } from '../../context/AuthContext';
//   import * as Animatable from 'react-native-animatable';
//   import RoleSelection from '../../components/shared/RoleSelection';
//   import { useNavigation } from '@react-navigation/native';
//   import * as AppleAuthentication from 'expo-apple-authentication';
//   import { MaterialCommunityIcons } from '@expo/vector-icons';
//   import fetchIPGeolocation from '../../services/geolocation';

//   import AsyncStorage from '@react-native-async-storage/async-storage';
//   import { auth, db } from '../../services/firebase/config';
//   import {getDatabase, ref, set } from 'firebase/database';
//   import { useNotification } from '../../hooks/useNotification';
//   import { navigationRef } from '../../App';

//   import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";

//   import * as Google from "expo-auth-session/providers/google";
//   import * as WebBrowser from "expo-web-browser";


//   import {GoogleSignin} from '@react-native-google-signin/google-signin';
  


  
//   // Initialize WebBrowser for auth
// //   WebBrowser.maybeCompleteAuthSession();
  
//   const GetStarted = () => {
//       const navigation = useNavigation();
//       const { signupWithGoogle, signupWithApple, login, logout } = useContext(AuthContext);
//       const [selectedRole, setSelectedRole] = useState(null);
//       const [googleLoading, setGoogleLoading] = useState(false);
//       const [appleLoading, setAppleLoading] = useState(false);
//       const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
//       const [geolocationData, setGeolocationData] = useState(null);
//       const [fetchingLocation, setFetchingLocation] = useState(false);
  
  
//       const { expoPushToken, registerForPushNotificationsAsync, handleNotificationResponse } = useNotification();
  
//     //   // Google Auth Configuration
      

//     //   const [request, response, promptAsync] = Google.useIdTokenAuthRequest({

//     //     clientId: "283581670255-msuq25nmqsthnmqi4f9n1r13eap58ed6.apps.googleusercontent.com",
//     //     iosClientId: "283581670255-i89tij454i1l0705lovhrthq7n761b5a.apps.googleusercontent.com",
//     //     androidClientId: "283581670255-msuq25nmqsthnmqi4f9n1r13eap58ed6.apps.googleusercontent.com",
      
//     //   });

// //     const [request, response, promptAsync] =

// //   Google.useIdTokenAuthRequest({

// //     clientId:

// //       "283581670255-msuq25nmqsthnmqi4f9n1r13eap58ed6.apps.googleusercontent.com",

// //     redirectUri:

// //       "https://fresh-sweeper.firebaseapp.com/__/auth/handler",

// //   });

// // const [request, response, promptAsync] =

// //   Google.useIdTokenAuthRequest({

// //     androidClientId:

// //       "283581670255-d8sg2cdb5k6hacrectncl1dob0e3cak8.apps.googleusercontent.com",

// //     iosClientId:

// //       "283581670255-i89tij454i1l0705lovhrthq7n761b5a.apps.googleusercontent.com",

// //   });




//   useEffect(() => {

//     GoogleSignin.configure({
  
//       webClientId:
  
//         '283581670255-msuq25nmqsthnmqi4f9n1r13eap58ed6.apps.googleusercontent.com',
  
//       offlineAccess: true,
  
//     });
  
//   }, []);
  
      
//   const handleGoogleSignIn = async () => {

//     try {
  
//       await GoogleSignin.hasPlayServices();
  
//       const userInfo = await GoogleSignin.signIn();
  
//       console.log("GOOGLE USER:", userInfo);
  
//       const idToken = userInfo.data?.idToken;
  
//       if (!idToken) {
//         Alert.alert("No idToken returned");
//         return;
//       }
  
//       const googleCredential =
//         GoogleAuthProvider.credential(idToken);
  
//       const userCredential =
//         await signInWithCredential(auth, googleCredential);
  
//       console.log(
//         "FIREBASE USER:",
//         userCredential.user
//       );
  
//       Alert.alert(
//         "SUCCESS",
//         userCredential.user.email
//       );
  
//     } catch (error) {
  
//       console.log("GOOGLE ERROR:", error);
  
//       if (error.code === statusCodes.SIGN_IN_CANCELLED) {
  
//         Alert.alert("Cancelled");
  
//       } else if (
//         error.code === statusCodes.IN_PROGRESS
//       ) {
  
//         Alert.alert("Already in progress");
  
//       } else if (
//         error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
//       ) {
  
//         Alert.alert("Google Play Services missing");
  
//       } else {
  
//         Alert.alert(
//           "Google Error",
//           JSON.stringify(error)
//         );
  
//       }
//     }
//   };
      
  
      
  
//       return (
//           <View style={styles.container}>
//               <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
              
              
//               <TouchableOpacity

// onPress={handleGoogleSignIn}

// >

// <Text>Google Login</Text>

// </TouchableOpacity>


                  
//           </View>
//       );
//   };
  
//   export default GetStarted;
  
//   const styles = StyleSheet.create({
//       container: {
//           flex: 1,
//           backgroundColor: '#fff',
//           justifyContent: 'center',
//           padding: 20
//       },
//       footer: {
//           flex: 1,
//           justifyContent: 'center',
//       },
//       locationStatus: {
//           flexDirection: 'row',
//           alignItems: 'center',
//           justifyContent: 'center',
//           backgroundColor: '#F8F9FA',
//           padding: 10,
//           borderRadius: 8,
//           marginBottom: 20,
//           borderWidth: 1,
//           borderColor: '#E9ECEF',
//       },
//       locationSuccess: {
//           backgroundColor: '#E8F5E9',
//           borderColor: '#C8E6C9',
//       },
//       locationText: {
//           marginLeft: 8,
//           color: '#495057',
//           fontSize: 12,
//           fontWeight: '500',
//       },
//       authButtons: {
//           marginTop: 40,
//       },
//       button: {
//           padding: 16,
//           borderRadius: 12,
//           alignItems: 'center',
//           marginBottom: 12,
//           flexDirection: 'row',
//           justifyContent: 'center',
//           shadowColor: '#000',
//           shadowOffset: { width: 0, height: 2 },
//           shadowOpacity: 0.1,
//           shadowRadius: 4,
//           elevation: 3,
//       },
//       emailButton: {
//           backgroundColor: COLORS.primary,
//       },
//       googleButton: {
//           backgroundColor: '#fff',
//           borderWidth: 1,
//           borderColor: '#ddd',
//       },
//       appleButton: {
//           backgroundColor: '#000',
//           borderWidth: 1,
//           borderColor: '#000',
//       },
//       buttonContent: {
//           flexDirection: 'row',
//           alignItems: 'center',
//       },
//       buttonIcon: {
//           marginRight: 12,
//       },
//       buttonText: {
//           fontSize: 16,
//           fontWeight: '600',
//           color: 'white',
//       },
//       googleButtonText: {
//           color: '#3c4043',
//           marginLeft: 12,
//       },
//       appleButtonText: {
//           color: '#fff',
//           marginLeft: 12,
//       },
//       divider: {
//           flexDirection: 'row',
//           alignItems: 'center',
//           marginVertical: 20,
//       },
//       dividerLine: {
//           flex: 1,
//           height: 1,
//           backgroundColor: '#ddd',
//       },
//       dividerText: {
//           marginHorizontal: 10,
//           color: '#666',
//           fontSize: 14,
//           fontWeight: '500',
//       },
//       loginLink: {
//           marginTop: 20,
//           alignItems: 'center',
//       },
//       loginText: {
//           color: '#666',
//           fontSize: 14,
//       },
//       loginLinkText: {
//           color: COLORS.primary,
//           fontWeight: '600',
//       },
//   });




// import React, { useEffect, useState, useContext } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';

// import * as WebBrowser from 'expo-web-browser';
// import * as Google from 'expo-auth-session/providers/google';

// import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
// import { auth } from '../../services/firebase/config';

// WebBrowser.maybeCompleteAuthSession();

// const GOOGLE_WEB_CLIENT_ID =
//   "283581670255-i89tij454i1l0705lovhrthq7n761b5a.apps.googleusercontent.com";

// const GetStarted = () => {
//   const [loading, setLoading] = useState(false);

//   // ✅ Google Auth Request
//   const [request, response, promptAsync] = Google.useAuthRequest({
//     iosClientId: GOOGLE_WEB_CLIENT_ID,
//     androidClientId: GOOGLE_WEB_CLIENT_ID,
//     webClientId: GOOGLE_WEB_CLIENT_ID,
//   });

//   // ✅ Handle Google Response → Firebase
//   useEffect(() => {
//     const signInWithGoogle = async () => {
//       if (response?.type !== 'success') return;

//       try {
//         setLoading(true);

//         const idToken = response.authentication?.idToken;

//         if (!idToken) {
//           Alert.alert('Google Sign-In Failed', 'No ID token returned');
//           return;
//         }

//         const credential = GoogleAuthProvider.credential(idToken);

//         const userCredential = await signInWithCredential(auth, credential);

//         console.log('✅ Firebase User:', userCredential.user);

//         Alert.alert(
//           'Success',
//           `Welcome ${userCredential.user.email}`
//         );

//         // 👉 NEXT STEP: send to backend or navigate
//         // navigation.replace('Home');

//       } catch (error) {
//         console.log('❌ Firebase Error:', error);
//         Alert.alert('Login Error', error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     signInWithGoogle();
//   }, [response]);

//   // ✅ Trigger Google Login
//   const handleGoogleLogin = async () => {
//     try {
//       if (!request) {
//         Alert.alert('Error', 'Google Auth not ready');
//         return;
//       }

//       setLoading(true);
//       await promptAsync();
//     } catch (error) {
//       console.log('Prompt Error:', error);
//       Alert.alert('Error', 'Google sign-in failed');
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>

//       <Text style={styles.title}>Get Started</Text>

//       <TouchableOpacity
//         onPress={handleGoogleLogin}
//         disabled={loading}
//         style={styles.googleButton}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.buttonText}>
//             Continue with Google
//           </Text>
//         )}
//       </TouchableOpacity>

//     </View>
//   );
// };

// export default GetStarted;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '600',
//     marginBottom: 40,
//   },
//   googleButton: {
//     backgroundColor: '#000',
//     padding: 15,
//     borderRadius: 10,
//     width: '100%',
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });



import React, { useEffect, useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

import { auth } from '../../services/firebase/config';
import { AuthContext } from '../../context/AuthContext';

WebBrowser.maybeCompleteAuthSession();
const GOOGLE_CLIENT_ID ="283581670255-i89tij454i1l0705lovhrthq7n761b5a.apps.googleusercontent.com";


const GetStarted = () => {
  const { login } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // ----------------------------
  // GOOGLE AUTH (FIXED)
  // ----------------------------
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_CLIENT_ID,
    webClientId: GOOGLE_CLIENT_ID,
  });

  // ----------------------------
  // HANDLE GOOGLE RESPONSE
  // ----------------------------
  useEffect(() => {
    const handleGoogleLogin = async () => {
      if (response?.type !== 'success') return;

      try {
        setLoading(true);

        const idToken = response.authentication?.idToken;

        if (!idToken) {
          Alert.alert('Error', 'Google login failed: missing token');
          return;
        }

        // 1. Firebase login (WORKING FLOW)
        const credential = GoogleAuthProvider.credential(idToken);
        const firebaseResult = await signInWithCredential(auth, credential);

        const firebaseUser = firebaseResult.user;

        console.log("✅ Firebase user:", firebaseUser.email);

        // 2. Send to backend ONLY AFTER Firebase success
        await sendToBackend(firebaseUser, idToken);

      } catch (error) {
        console.log("Google login error:", error);
        Alert.alert("Login Failed", error.message);
      } finally {
        setLoading(false);
      }
    };

    handleGoogleLogin();
  }, [response]);

  // ----------------------------
  // SEND TO BACKEND
  // ----------------------------
  const sendToBackend = async (firebaseUser, idToken) => {
    try {
      const baseUrl = "https://www.freshsweeper.com";
      const endpoint = `${baseUrl}/api/auth/google_auth`;

      const payload = {
        token: idToken,
        userType: selectedRole || undefined, // ONLY send if selected
      };

      console.log("📤 Backend request:", payload);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      console.log("📥 Backend response:", data);

      if (!res.ok || data.status !== "success") {
        throw new Error(data.message || "Backend login failed");
      }

      // 3. LOGIN INTO APP CONTEXT
      login({
        resp: data.data,
        fbUser: firebaseUser,
        token: data.data.token,
      });

      console.log("✅ Login completed");

    } catch (error) {
      console.log("Backend error:", error);
      Alert.alert("Server Error", error.message);
    }
  };

  // ----------------------------
  // TRIGGER GOOGLE LOGIN
  // ----------------------------
  const handleGoogleLogin = async () => {
    try {
      if (!request) {
        Alert.alert("Error", "Google Auth not ready");
        return;
      }

      setLoading(true);
      await promptAsync();

    } catch (error) {
      console.log("Prompt error:", error);
      Alert.alert("Error", "Google sign-in failed");
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Get Started</Text>

      <TouchableOpacity
        onPress={handleGoogleLogin}
        disabled={loading}
        style={styles.googleButton}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            Continue with Google
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default GetStarted;

// ----------------------------
// STYLES
// ----------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 40,
  },
  googleButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});



