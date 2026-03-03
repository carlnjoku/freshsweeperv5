// config/google.js

export const GOOGLE_CONFIG = {
    // Development - for Expo Go
    development: {
      expoClientId: 'YOUR_EXPO_CLIENT_ID',
    },
    
    // Production - for standalone apps
    production: {
      iosClientId: 'YOUR_IOS_CLIENT_ID',
      androidClientId: 'YOUR_ANDROID_CLIENT_ID',
      webClientId: 'YOUR_WEB_CLIENT_ID',
    },
    
    // Common settings
    scopes: ['profile', 'email', 'openid'],
    redirectUri: 'https://auth.expo.io/@your-username/your-app-slug',
  };
  
  // Helper function to get config based on environment
  export const getGoogleConfig = () => {
    const isProduction = process.env.NODE_ENV === 'production' || !__DEV__;
    
    const baseConfig = {
      expoClientId: GOOGLE_CONFIG.development.expoClientId,
      scopes: GOOGLE_CONFIG.scopes,
    };
    
    if (isProduction) {
      return {
        ...baseConfig,
        iosClientId: GOOGLE_CONFIG.production.iosClientId,
        androidClientId: GOOGLE_CONFIG.production.androidClientId,
        webClientId: GOOGLE_CONFIG.production.webClientId,
      };
    }
    
    return baseConfig;
  };