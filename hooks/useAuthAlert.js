// hooks/useAuthAlerts.js
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ROUTES from '../constants/routes';
import { CommonActions } from '@react-navigation/native';

export const useAuthAlerts = () => {
  const navigation = useNavigation();

  const showGoogleAccountAlert = (email, routes = {}) => {
    console.log('📱 GoogleAccountAlert called with email:', email);
    console.log('🧭 Available routes in navigation:', navigation.getState()?.routeNames);
    
    Alert.alert(
      'Account Created with Google',
      'This account was created using Google. How would you like to proceed?',
      [
        // {
        //   text: 'Continue with Google',
        //   onPress: () => {
        //     console.log('🎯 User tapped "Continue with Googles"');
        //     console.log('🚀 Navigating to:', ROUTES.auto_google_signin);
            
        //     // Try with a fallback
        //     try {
        //       const routeToUse = ROUTES.auto_google_signin || 'AutoGoogleSignIn';
        //       console.log('📍 Using route:', routeToUse);
              
        //       // navigation.navigate(routeToUse, { 
        //       //   email: email 
        //       // });
        //       navigation.navigate('NavigationTest', { email });
              
        //       console.log('✅ Navigation called successfully');
        //     } catch (navError) {
        //       console.error('❌ Navigation error:', navError);
              
        //       // Fallback to GettingStarted if AutoGoogleSignIn doesn't exist
        //       Alert.alert(
        //         'Navigation Error',
        //         `Could not navigate to auto sign-in. Error: ${navError.message}`,
        //         [
        //           {
        //             text: 'Use Manual Google Sign-In',
        //             onPress: () => {
        //               navigation.navigate(
        //                 routes.googleLogin || ROUTES.getting_started, 
        //                 { prefillEmail: email }
        //               );
        //             }
        //           },
        //           {
        //             text: 'Cancel',
        //             style: 'cancel'
        //           }
        //         ]
        //       );
        //     }
        //   }
        // },

        {
          text: 'Continue with Google',
          onPress: () => {
            // Use dispatch for more reliable navigation
            navigation.dispatch(
              CommonActions.navigate({
                name: ROUTES.auto_google_signin,
                params: { email },
              })
            );
          }
        },
        {
          text: 'Set Password Instead',
          onPress: () => {
            console.log('🎯 User tapped "Set Password Instead"');
            navigation.navigate(
              routes.setPassword || ROUTES.set_password, 
              { email }
            );
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const showNoPasswordAlert = (email, routes = {}) => {
    Alert.alert(
      'Password Required',
      'You need to set a password for your account first.',
      [
        {
          text: 'Set Password',
          onPress: () => {
            navigation.navigate(
              routes.setPassword || ROUTES.set_password, 
              { email }
            );
          }
        },
        {
          text: 'Use Google Instead',
          onPress: () => {
            navigation.navigate(
              ROUTES.auto_google_signin || 'AutoGoogleSignIn',
              { email }
            );
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  return {
    showGoogleAccountAlert,
    showNoPasswordAlert
  };
};