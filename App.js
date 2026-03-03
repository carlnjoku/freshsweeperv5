import React, {useState, useContext, useEffect} from 'react';
import { DeviceEventEmitter, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNav from './navigation/public/AppNav';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CleanerSelectionProvider } from './context/CleanerSelectionContext';
import { STRIPE_PUBLIC_SECRET_KEY } from './secret';
import { StripeProvider } from '@stripe/stripe-react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Text } from 'react-native';
// import * as Linking from 'expo-linking';
import { AuthContext } from './context/AuthContext';
// Import error handling components
import { ErrorProvider } from './context/ErrorContext';
import ErrorBoundary from './components/fallback/ErrorBoundary';
import GlobalErrorModal from './components/fallback/GlobalErrorModal';
// import NetworkListener from './components/fallback/NetworkListener';

import DevMenu from './components/fallback/DevMenu';
// import linking from './screens/sharedscreen/DeepLinking';

import { rootLinking } from './screens/sharedscreen/DeepLinking';





export default function App() {

  const [showTestUI, setShowTestUI] = useState(false);
   
   return (
   
    <SafeAreaProvider>
      <ErrorProvider>
        <ErrorBoundary>
          <LanguageProvider>
            <AuthProvider>
              <StripeProvider publishableKey={STRIPE_PUBLIC_SECRET_KEY}>
                <PaperProvider>
                  <CleanerSelectionProvider>
                    <AppNavigationWrapper />
                    <GlobalErrorModal />
                  </CleanerSelectionProvider>
                </PaperProvider>
              </StripeProvider>
            </AuthProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </ErrorProvider>
    </SafeAreaProvider>
         
   );
 }
 

 export const navigationRef = React.createRef();

 function AppNavigationWrapper() {
  const { userType, isLoading } = useContext(AuthContext); // 'host' or 'cleaner'

  // Wait until auth context is ready
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  // Fallback if no userType yet
  // const linkingConfig = userType === 'host' ? hostLinking : cleanerLinking;

  return (
    <NavigationContainer
      // linking={linkingConfig}
      ref = {navigationRef}
      linking={rootLinking}
      fallback={<Text>Loading navigation...</Text>}
      onReady={() => {
        console.log('Navigation is ready!');
      }}
      onStateChange={state => {
        console.log('🧭 Navigation state changed:', JSON.stringify(state, null, 2));
      }}
      
    >
      <AppNav />
    </NavigationContainer>
  );
}

