// PublicStack.js
// import React, { useState, useEffect } from 'react';
// import {
//   StyleSheet,
//   TouchableOpacity,
//   View,
//   ActivityIndicator,
// } from 'react-native';
// import { createStackNavigator } from '@react-navigation/stack';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// import Onboarding from '../../screens/public/Onboarding';
// import GetStarted from '../../screens/public/GetStarted';
// import Signin from '../../screens/public/Signin';
// import Signup from '../../screens/public/Signup';
// import LoginOptions from '../../screens/public/LoginOptions';
// import PhoneCapture from '../../screens/public/PhoneCapture';
// import AutoGoogleSignIn from '../../screens/public/AutoGoogleSignIn';
// import NavigationTest from '../../screens/public/NavigationTest';
// import InviteGate from '../../screens/public/IniteGate';
// import ForgotPassword from '../../screens/public/ForgotPassword';
// import ResetPassword from '../../screens/public/ResetPassword';

// import ROUTES from '../../constants/routes';
// import COLORS from '../../constants/colors';

// const Stack = createStackNavigator();

// const PublicStack = () => {
//   const [initialRoute, setInitialRoute] = useState(null);
  

//   useEffect(() => {
//     const checkOnboarding = async () => {
//       try {
//         const shown = await AsyncStorage.getItem('@onboarding_shown');
//         // If flag is 'true', skip onboarding and go to login options
//         setInitialRoute(shown === 'true' ? ROUTES.login_options : ROUTES.onboarding);
//       } catch (error) {
//         console.error('Error reading onboarding flag:', error);
//         setInitialRoute(ROUTES.login_options); // fallback
//       }
//     };
//     checkOnboarding();
//   }, []);

//   // Show loading indicator while reading AsyncStorage
//   if (!initialRoute) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       </View>
//     );
//   }

//   return (
//     <Stack.Navigator
//       screenOptions={{ headerShown: false }}
//       initialRouteName={initialRoute}
//     >
//       {/* Onboarding – only shown on first launch */}
//       <Stack.Screen
//         name={ROUTES.onboarding}
//         component={Onboarding}
//         options={({ route }) => ({
//           headerShown: false,
//           headerTintColor: COLORS.white,
//           headerBackTitleVisible: false,
//           headerStyle: {
//             backgroundColor: COLORS.primary,
//           },
//           title: route.params?.userId,
//         })}
//       />

//       {/* Login Options – shown after onboarding is dismissed */}
//       <Stack.Screen
//         name={ROUTES.login_options}
//         component={LoginOptions}
//         options={({ route }) => ({
//           headerShown: false,
//           headerTintColor: COLORS.gray,
//           headerBackTitleVisible: false,
//           headerStyle: {
//             backgroundColor: '#fff',
//             elevation: 5,
//             shadowColor: '#000',
//             shadowOpacity: 0.3,
//             shadowOffset: { width: 0, height: 2 },
//             shadowRadius: 3,
//           },
//           title: route.params?.userId,
//         })}
//       />

//       <Stack.Screen
//         name={ROUTES.getting_started}
//         component={GetStarted}
//         options={({ route }) => ({
//           headerShown: false,
//           headerTintColor: COLORS.gray,
//           headerBackTitleVisible: false,
//           headerStyle: {
//             backgroundColor: '#fff',
//             elevation: 5,
//             shadowColor: '#000',
//             shadowOpacity: 0.3,
//             shadowOffset: { width: 0, height: 2 },
//             shadowRadius: 3,
//           },
//           title: route.params?.userId,
//         })}
//       />

//       <Stack.Screen
//         name={ROUTES.phone_capture}
//         component={PhoneCapture}
//         options={({ route }) => ({
//           headerShown: false,
//           headerTintColor: COLORS.gray,
//           headerBackTitleVisible: false,
//           headerStyle: {
//             backgroundColor: '#fff',
//             elevation: 5,
//             shadowColor: '#000',
//             shadowOpacity: 0.3,
//             shadowOffset: { width: 0, height: 2 },
//             shadowRadius: 3,
//           },
//           title: route.params?.userId,
//         })}
//       />

//       <Stack.Screen
//         name={ROUTES.signin}
//         component={Signin}
//         options={({ route }) => ({
//           headerShown: false,
//           headerBackTitle: '',
//           headerStyle: {
//             borderBottomWidth: 0,
//           },
//           headerLeft: () => (
//             <TouchableOpacity
//               onPress={() => navigation.goBack()}
//               style={styles.backButton}
//             >
//               <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
//             </TouchableOpacity>
//           ),
//           title: route.params?.userId,
//           headerTintColor: COLORS.gray,
//           headerBackTitleVisible: false,
//         })}
//       />

//       <Stack.Screen
//         name={ROUTES.auto_google_signin}
//         component={AutoGoogleSignIn}
//         options={{
//           headerShown: false,
//           gestureEnabled: false,
//         }}
//       />

//       <Stack.Screen
//         name={ROUTES.invite_gate}
//         component={InviteGate}
//         options={{
//           headerShown: false,
//           gestureEnabled: false,
//         }}
//       />

//       <Stack.Screen
//         name={ROUTES.signup}
//         component={Signup}
//         options={({ route }) => ({
//           headerShown: true,
//           title: route.params?.userId,
//           headerTintColor: COLORS.gray,
//           headerBackTitleVisible: false,
//           headerStyle: {
//             backgroundColor: '#fff',
//             elevation: 5,
//             shadowColor: '#000',
//             shadowOpacity: 0.3,
//             shadowOffset: { width: 0, height: 2 },
//             shadowRadius: 3,
//           },
//         })}
//       />

//       <Stack.Screen
//         name={ROUTES.forgot_password}
//         component={ForgotPassword}
//         options={{ headerShown: false }}
//       />

//       <Stack.Screen
//         name={ROUTES.reset_password}
//         component={ResetPassword}
//         options={{ headerShown: false }}
//       />

//       <Stack.Screen name="NavigationTest" component={NavigationTest} />
//       <Stack.Screen name={ROUTES.set_password} component={NavigationTest} />
//     </Stack.Navigator>
//   );
// };

// export default PublicStack;

// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   backButton: {
//     position: 'absolute',
//     top: -5,
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
// });


import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import Onboarding from '../../screens/public/Onboarding';
import GetStarted from '../../screens/public/GetStarted';
import Signin from '../../screens/public/Signin';
import Signup from '../../screens/public/Signup';
import LoginOptions from '../../screens/public/LoginOptions';
import PhoneCapture from '../../screens/public/PhoneCapture';
import AutoGoogleSignIn from '../../screens/public/AutoGoogleSignIn';
import NavigationTest from '../../screens/public/NavigationTest';
import InviteGate from '../../screens/public/IniteGate';
import ForgotPassword from '../../screens/public/ForgotPassword';
import ResetPassword from '../../screens/public/ResetPassword';

import ROUTES from '../../constants/routes';
import COLORS from '../../constants/colors';

const Stack = createStackNavigator();

const PublicStack = () => {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const seen = await AsyncStorage.getItem('@app_onboarding_shown');
        // If flag is 'true', skip onboarding and go to login options
        setInitialRoute(seen === 'true' ? ROUTES.login_options : ROUTES.onboarding);
      } catch (error) {
        console.error('Error reading onboarding flag:', error);
        setInitialRoute(ROUTES.login_options); // fallback
      }
    };
    checkOnboarding();
  }, []);

  if (!initialRoute) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRoute}
    >
      {/* Onboarding – only shown on first launch */}
      <Stack.Screen
        name={ROUTES.onboarding}
        component={Onboarding}
        options={({ route }) => ({
          headerShown: false,
          headerTintColor: COLORS.white,
          headerBackTitleVisible: false,
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          title: route.params?.userId,
        })}
      />

      {/* Login Options – shown after onboarding is dismissed */}
      <Stack.Screen
        name={ROUTES.login_options}
        component={LoginOptions}
        options={({ route }) => ({
          headerShown: false,
          headerTintColor: COLORS.gray,
          headerBackTitleVisible: false,
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 5,
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 3,
          },
          title: route.params?.userId,
        })}
      />

      <Stack.Screen
        name={ROUTES.getting_started}
        component={GetStarted}
        options={({ route }) => ({
          headerShown: false,
          headerTintColor: COLORS.gray,
          headerBackTitleVisible: false,
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 5,
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 3,
          },
          title: route.params?.userId,
        })}
      />

      <Stack.Screen
        name={ROUTES.phone_capture}
        component={PhoneCapture}
        options={({ route }) => ({
          headerShown: false,
          headerTintColor: COLORS.gray,
          headerBackTitleVisible: false,
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 5,
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 3,
          },
          title: route.params?.userId,
        })}
      />

      <Stack.Screen
        name={ROUTES.signin}
        component={Signin}
        options={({ route }) => ({
          headerShown: false,
          headerBackTitle: '',
          headerStyle: {
            borderBottomWidth: 0,
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>
          ),
          title: route.params?.userId,
          headerTintColor: COLORS.gray,
          headerBackTitleVisible: false,
        })}
      />

      <Stack.Screen
        name={ROUTES.auto_google_signin}
        component={AutoGoogleSignIn}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name={ROUTES.invite_gate}
        component={InviteGate}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name={ROUTES.signup}
        component={Signup}
        options={({ route }) => ({
          headerShown: true,
          title: route.params?.userId,
          headerTintColor: COLORS.gray,
          headerBackTitleVisible: false,
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 5,
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 3,
          },
        })}
      />

      <Stack.Screen
        name={ROUTES.forgot_password}
        component={ForgotPassword}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name={ROUTES.reset_password}
        component={ResetPassword}
        options={{ headerShown: false }}
      />

      <Stack.Screen name="NavigationTest" component={NavigationTest} />
      <Stack.Screen name={ROUTES.set_password} component={NavigationTest} />
    </Stack.Navigator>
  );
};

export default PublicStack;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: -5,
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
});