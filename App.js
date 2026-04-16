import React, {useState, useContext, useEffect} from 'react';
import { DeviceEventEmitter, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNav from './navigation/public/AppNav';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CleanerSelectionProvider } from './context/CleanerSelectionContext';
// import { STRIPE_PUBLIC_SECRET_KEY } from './secret';
import { StripeProvider } from '@stripe/stripe-react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { BookingProvider } from './context/BookingContext';
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
import i18n, { loadTranslations } from './i18n';
import userService from './services/connection/userService';
import { WebSocketProvider } from './context/WebsocketContext';


import AsyncStorage from '@react-native-async-storage/async-storage';



export default function App() {

  const STRIPE_PUBLIC_SECRET_KEY = process.env.STRIPE_PUBLIC_SECRET_KEY;
  
  const [showTestUI, setShowTestUI] = useState(false);
  const [ready, setReady] = useState(false); // ✅ ADD THIS

  useEffect(() => {
    fetchTranslations();
  }, []);


//   const clearAllTokens = async () => {
//     await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
//     console.log('Tokens cleared');
//   };

// useEffect(() => {
//   AsyncStorage.clear().then(() => console.log('Storage cleared'));
//   clearAllTokens()
// }, []);


  // const fetchTranslations = async () => {
  //   try {
  //     const res = await userService.getFullCopies(0, 500); // limit
  //     const data = res.data;
  
  //     console.log("My copies", data);
  
  //     loadTranslations(data);
  
  //     // 🔥 force UI refresh
  //     i18n.reloadResources();
  //     i18n.changeLanguage(i18n.language);
  
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const fetchTranslations = async () => {
    try {
      const res = await userService.getFullCopies();
      const data = res.data;

      if (!data || !data.length) {
        console.warn("No translations loaded");
        setReady(true); // ⚠️ IMPORTANT so app doesn't hang
        return;
      }

      console.log("My copies", data);

      loadTranslations(data); // 🔥 inject into i18n

      setReady(true); // ✅ IMPORTANT
    } catch (err) {
      console.error(err);
      // fallback to local translations
      loadTranslations([]);
      setReady(true); // still allow app to load
    }
  };

  // ✅ BLOCK APP UNTIL TRANSLATIONS ARE READY
  if (!ready) {
    return <Text>Loading translations...</Text>;
  }
   
   return (
   
    <SafeAreaProvider>
      <AuthProvider>
        <ErrorProvider>
         <ErrorBoundary>
          <LanguageProvider>
            
            <WebSocketProvider>
              <StripeProvider publishableKey={STRIPE_PUBLIC_SECRET_KEY}>
              <BookingProvider>
                <PaperProvider>
                  <CleanerSelectionProvider>
                    <AppNavigationWrapper />
                    <GlobalErrorModal />
                  </CleanerSelectionProvider>
                </PaperProvider>
              </BookingProvider>
              </StripeProvider>
              </WebSocketProvider>
         
          </LanguageProvider>
        </ErrorBoundary>
      </ErrorProvider>
      </AuthProvider> 
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

