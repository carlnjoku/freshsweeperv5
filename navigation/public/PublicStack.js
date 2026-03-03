import { StyleSheet, TouchableOpacity, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Onboarding from '../../screens/public/Onboarding';
import GetStarted from '../../screens/public/GetStarted';
import Signin from '../../screens/public/Signin';
import Signup from '../../screens/public/Signup';
// import ForgotPassword from '../../screens/public/Signup';

import ROUTES from '../../constants/routes';
import COLORS from '../../constants/colors';
import LoginOptions from '../../screens/public/LoginOptions';
import PhoneCapture from '../../screens/public/PhoneCapture';
import AutoGoogleSignIn from '../../screens/public/AutoGoogleSignIn';
import NavigationTest from '../../screens/public/NavigationTest';
import InviteGate from '../../screens/public/IniteGate';

// import ResetPassword from '../../screens/public/ResetPassword';

// import IdentityRedirect from '../../screens/cleaner/AccountVerification/IdentityRedirect';
// import AccountVerificationGate from '../../screens/cleaner/AccountVerification/AccountVerificationGate';
// import VerificationList from '../../screens/cleaner/AccountVerification/VerificationList';
// import PaymentOnboarding from '../../screens/cleaner/AccountVerification/PaymentOnboarding';




const Stack = createStackNavigator();

const PublicStack = () => {
  return (
    <Stack.Navigator 
        screenOptions={{
            // headerTintColor:COLORS.white,
            // headerBackTitleVisible:false,
            // headerStyle:{
            //     backgroundColor:COLORS.primary
            // }
            headerShown:false
        }} 
        initialRouteName={ROUTES.onboarding}
        
    >
      
      <Stack.Screen 
        name={ROUTES.onboarding} 
        component={Onboarding} 
        options={({route}) => ({
          headerShown:false,
          headerTintColor: COLORS.white,
          headerBackTitleVisible: false,
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          title: route.params?.userId,
          headerTintColor:COLORS.white,
          headerBackTitleVisible:false,
          headerStyle:{
              backgroundColor:COLORS.primary
          }
        })}
      />

<Stack.Screen 
        name={ROUTES.getting_started} 
        component={GetStarted} 
        options={({route}) => ({
          headerShown:false,
          headerTintColor: COLORS.gray,
          headerBackTitleVisible: false,
          headerStyle: {
            backgroundColor: '#fff', // Background color of the header
            elevation: 5, // Adds elevation for Android
            shadowColor: '#000', // Shadow color for iOS
            shadowOpacity: 0.3, // Shadow opacity for iOS
            shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
            shadowRadius: 3, // Shadow radius for iOS
          },
          title: route.params?.userId,
          
        })}
      />

      <Stack.Screen 
        name={ROUTES.login_options} 
        component={LoginOptions} 
        options={({route}) => ({
          headerShown:false,
          headerTintColor: COLORS.gray,
          headerBackTitleVisible: false,
          headerStyle: {
            backgroundColor: '#fff', // Background color of the header
            elevation: 5, // Adds elevation for Android
            shadowColor: '#000', // Shadow color for iOS
            shadowOpacity: 0.3, // Shadow opacity for iOS
            shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
            shadowRadius: 3, // Shadow radius for iOS
          },
          title: route.params?.userId,
          
        })}
      />
      <Stack.Screen 
        name={ROUTES.phone_capture} 
        component={PhoneCapture} 
        options={({route}) => ({
          headerShown:false,
          headerTintColor: COLORS.gray,
          headerBackTitleVisible: false,
          headerStyle: {
            backgroundColor: '#fff', // Background color of the header
            elevation: 5, // Adds elevation for Android
            shadowColor: '#000', // Shadow color for iOS
            shadowOpacity: 0.3, // Shadow opacity for iOS
            shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
            shadowRadius: 3, // Shadow radius for iOS
          },
          title: route.params?.userId,
          
        })}
      />

      <Stack.Screen 
        name={ROUTES.signin}
        component={Signin} 
        
        options={({route}) => ({
            headerShown:false,
            headerBackTitle: '',
            headerStyle: {
              borderBottomWidth: 0,
              // borderBottomColor: '#E5E5EA',
            },
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              //   hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={24}
                  color="#333"
                />
              </TouchableOpacity>
            ),
            title: route.params?.userId,
            headerTintColor:COLORS.gray,
            headerBackTitleVisible:false,
          
          })}
      />

    <Stack.Screen 
      name={ROUTES.auto_google_signin}
      component={AutoGoogleSignIn}
      options={{
        headerShown: false,
        gestureEnabled: false, // Prevent going back during auto sign-in
      }}
    />
      <Stack.Screen 
        name={ROUTES.invite_gate}
        component={InviteGate}
        options={{
          headerShown: false,
          gestureEnabled: false, // Prevent going back during auto sign-in
        }}
      />
      <Stack.Screen 
        name={ROUTES.signup} 
        component={Signup} 
        options={({route}) => ({
            headerShown:true,
            title: route.params?.userId,
            headerTintColor:COLORS.gray,
            headerBackTitleVisible:false,
            headerStyle: {
              backgroundColor: '#fff', // Background color of the header
              elevation: 5, // Adds elevation for Android
              shadowColor: '#000', // Shadow color for iOS
              shadowOpacity: 0.3, // Shadow opacity for iOS
              shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
              shadowRadius: 3, // Shadow radius for iOS
            },
          })}
      />


    <Stack.Screen name="NavigationTest" component={NavigationTest} />
    <Stack.Screen name={ROUTES.set_password}  component={NavigationTest} />

      {/* 
      <Stack.Screen 
        name={ROUTES.forgot_password}
        component={ForgotPassword} 
        options={({route}) => ({
            headerShown:false,
          })}
      />
      <Stack.Screen 
        name={ROUTES.reset_password}
        component={ResetPassword} 
        options={({route}) => ({
            headerShown:false,
          })}
      />

      <Stack.Screen 
        name={"AccountVerificationGate"}
        component={AccountVerificationGate} 
        options={({route}) => ({
            headerShown:false,
          })}
      />
      

      <Stack.Screen 
        name={ROUTES.cleaner_verification} 
        component={VerificationList} 
        options={{
            title:"Account Verification",
            headerTintColor:COLORS.white,
            headerBackTitleVisible:false,
            headerStyle:{
                backgroundColor:COLORS.primary
            },
            
            headerTitleStyle: {
              fontWeight: '600',
              fontSize:16,
              color:COLORS.white,
            },
            
        }}
      /> */}
      
      
      


      
    </Stack.Navigator>
  )
}

export default PublicStack

const styles = StyleSheet.create({
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
})