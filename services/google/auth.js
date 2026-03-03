// src/config/auth.js
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';

// Google OAuth Configuration
export const GOOGLE_CONFIG = {
  clientId: Platform.select({
    ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 'YOUR_IOS_CLIENT_ID',
    android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 'YOUR_ANDROID_CLIENT_ID',
    web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'YOUR_WEB_CLIENT_ID',
  }),
  redirectUri: AuthSession.makeRedirectUri({
    scheme: 'exp', // Use 'exp' for Expo Go, change to your app scheme for production
    path: 'oauth/callback'
  }),
  scopes: ['openid', 'profile', 'email'],
  extraParams: {
    access_type: 'offline',
    prompt: 'consent',
  },
};

// Google OAuth discovery endpoints
export const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:8000/api', // Update with your IP
  endpoints: {
    googleOAuth: '/auth/oauth/google',
    emailSignup: '/users/signup/email',
    emailLogin: '/auth/login',
    verifyEmail: '/users/verify-email',
    userProfile: '/auth/me',
  }
};