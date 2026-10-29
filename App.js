import React, {useState, useContext, useEffect} from 'react';
import { DeviceEventEmitter, Platform, StyleSheet, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNav from './navigation/public/AppNav';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CleanerSelectionProvider } from './context/CleanerSelectionContext';
// import { STRIPE_PUBLIC_SECRET_KEY } from './secret';
import { StripeProvider } from '@stripe/stripe-react-native';
import {
  Provider as PaperProvider,
  MD3DarkTheme,
  MD3LightTheme,
} from 'react-native-paper';
import { BookingProvider } from './context/BookingContext';
import { Text } from 'react-native';
// import * as Linking from 'expo-linking';
import { AuthContext } from './context/AuthContext';
// Import error handling components
import { ErrorProvider } from './context/ErrorContext';
import ErrorBoundary from './components/fallback/ErrorBoundary';
import GlobalErrorModal from './components/fallback/GlobalErrorModal';
// import NetworkListener from './components/fallback/NetworkListener';
import { navigationRef } from './utils/navigationRef';


import DevMenu from './components/fallback/DevMenu';
// import linking from './screens/sharedscreen/DeepLinking';

import { rootLinking } from './screens/sharedscreen/DeepLinking';
import i18n, { loadTranslations } from './i18n';
import userService from './services/connection/userService';
import { WebSocketProvider } from './context/WebsocketContext';
import { STRIPE_PUBLIC_SECRET_KEY } from './env';
import { useNotification } from './hooks/useNotification';
import COLORS from './constants/colors';
import { ThemeProvider } from './theme';
import { useTheme } from './theme';
import { StatusBar } from 'expo-status-bar';


import AsyncStorage from '@react-native-async-storage/async-storage';

function ThemedPaperProvider({ children }) {
  const { theme, isDark } = useTheme();

  const paperTheme = React.useMemo(() => {
    const baseTheme = isDark
      ? MD3DarkTheme
      : MD3LightTheme;

    return {
      ...baseTheme,

      dark: isDark,

      colors: {
        ...baseTheme.colors,

        primary:
          theme.brand?.primary ??
          baseTheme.colors.primary,

        onPrimary:
          isDark
            ? '#0B1220'
            : '#FFFFFF',

        background:
          theme.background?.default ??
          baseTheme.colors.background,

        onBackground:
          theme.text?.primary ??
          baseTheme.colors.onBackground,

        surface:
          theme.surface?.default ??
          theme.background?.default ??
          baseTheme.colors.surface,

        onSurface:
          theme.text?.primary ??
          baseTheme.colors.onSurface,

        surfaceVariant:
          theme.surface?.elevated ??
          baseTheme.colors.surfaceVariant,

        onSurfaceVariant:
          theme.text?.secondary ??
          baseTheme.colors.onSurfaceVariant,

        outline:
          theme.border?.default ??
          baseTheme.colors.outline,

        error:
          theme.status?.error ??
          baseTheme.colors.error,
      },
    };
  }, [theme, isDark]);

  return (
    <PaperProvider theme={paperTheme}>
      {children}
    </PaperProvider>
  );
}

export default function App() {

  const { registerForPushNotificationsAsync } = useNotification();
  
  const [showTestUI, setShowTestUI] = useState(false);
  const [ready, setReady] = useState(false); // ✅ ADD THIS

  
  
 
  useEffect(() => {
    fetchTranslations();
  }, []);

  

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
    return <Text></Text>;
  }
   
   return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <ErrorProvider>
            <ErrorBoundary>
              <LanguageProvider>
                <WebSocketProvider>
                  <StripeProvider publishableKey={STRIPE_PUBLIC_SECRET_KEY}>
                    <BookingProvider>
                      <ThemedPaperProvider>
                        <CleanerSelectionProvider>
                          <AppNavigationWrapper />
                          <GlobalErrorModal />
                        </CleanerSelectionProvider>
                      </ThemedPaperProvider>
                    </BookingProvider>
                  </StripeProvider>
                </WebSocketProvider>
              </LanguageProvider>
            </ErrorBoundary>
          </ErrorProvider>
        </AuthProvider> 
      </SafeAreaProvider>
    </ThemeProvider>
         
   );
 }
 

//  export const navigationRef = React.createRef();

//  function AppNavigationWrapper() {
//   // const { userType, isLoading } = useContext(AuthContext); // 'host' or 'cleaner'
//   const { userType, isLoading, userToken } = useContext(AuthContext);

//   // Wait until auth context is ready
//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>Loading...</Text>
//       </View>
//     );
//   }

//   // Fallback if no userType yet
//   // const linkingConfig = userType === 'host' ? hostLinking : cleanerLinking;

//   return (
//     <NavigationContainer
//       // linking={linkingConfig}
//       ref = {navigationRef}
//       linking={rootLinking}
      
//       fallback={<Text></Text>}
//       onReady={() => {
//         console.log('Navigation is ready!');
//       }}
//       onStateChange={state => {
//         console.log('🧭 Navigation state changed:', JSON.stringify(state, null, 2));
//       }}
      
//     >
//       <AppNav />
//     </NavigationContainer>
//   );
// }


// function AppNavigationWrapper() {
//   const { userType, isLoading, userToken } = useContext(AuthContext);

//   const { theme, mode, isDark } = useTheme();

//   console.log('🎨 THEME MODE:', mode);
//   console.log('🌙 IS DARK:', isDark);
//   console.log('🎨 BACKGROUND:', theme.background.default);

//   if (isLoading) {
//     return (
//       <View
//         style={[
//           styles.loadingContainer,
//           {
//             backgroundColor: theme.background.default,
//           },
//         ]}
//       >
//         <ActivityIndicator
//           size="large"
//           color={theme.brand.primary}
//         />

//         <Text
//           style={[
//             styles.loadingText,
//             {
//               color: theme.text.secondary,
//             },
//           ]}
//         >
//           Loading...
//         </Text>
//       </View>
//     );
//   }

//   return (
//     <NavigationContainer
//       ref={navigationRef}
//       linking={rootLinking}
//       fallback={<Text></Text>}
//       onReady={() => {
//         console.log('Navigation is ready!');
//       }}
//       onStateChange={state => {
//         console.log(
//           '🧭 Navigation state changed:',
//           JSON.stringify(state, null, 2)
//         );
//       }}
//     >
//       <AppNav />
//     </NavigationContainer>
//   );
// }



function AppNavigationWrapper() {
  const { isLoading } = useContext(AuthContext);
  const { theme, mode, isDark } = useTheme();

  console.log('THEME MODE:', mode);
  console.log('IS DARK:', isDark);
  console.log('STATUS BAR STYLE:', isDark ? 'light' : 'dark');
  console.log('BACKGROUND:', theme.background.default);

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {
            backgroundColor: theme.background.default,
          },
        ]}
      >
        <StatusBar style={isDark ? 'light' : 'dark'} />

        <ActivityIndicator
          size="large"
          color={theme.brand.primary}
        />

        <Text
          style={[
            styles.loadingText,
            {
              color: theme.text.secondary,
            },
          ]}
        >
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background.default,
      }}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <NavigationContainer
        ref={navigationRef}
        linking={rootLinking}
        theme={{
          dark: Boolean(isDark),
          colors: {
            primary: theme.brand.primary,
            background: theme.background.default,
            card: theme.surface.default,
            text: theme.text.primary,
            border: theme.border.default,
            notification: theme.status.error,
          },
          fonts: {
            regular: {
              fontFamily: 'System',
              fontWeight: '400',
            },
            medium: {
              fontFamily: 'System',
              fontWeight: '500',
            },
            bold: {
              fontFamily: 'System',
              fontWeight: '700',
            },
            heavy: {
              fontFamily: 'System',
              fontWeight: '900',
            },
          },
        }}
        fallback={<Text />}
        onReady={() => {
          console.log('Navigation is ready!');
        }}
        onStateChange={(state) => {
          console.log(
            '🧭 Navigation state changed:',
            JSON.stringify(state, null, 2)
          );
        }}
      >
        <AppNav />
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
});