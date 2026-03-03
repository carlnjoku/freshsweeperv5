// screens/auth/AutoGoogleSignIn.js
import React, { useEffect, useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import COLORS from '../../constants/colors';
import { MaterialIcons } from '@expo/vector-icons';

const AutoGoogleSignIn = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { signupWithGoogle } = useContext(AuthContext);
  
  const email = route.params?.email;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Automatically trigger Google sign-in when component mounts
  useEffect(() => {
    if (email) {
      console.log('🚀 AutoGoogleSignIn mounted with email:', email);
      handleAutoGoogleSignIn();
    } else {
      console.log('❌ No email provided for AutoGoogleSignIn');
      setError('No email provided. Please try again from Signin.');
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    console.log('📍 AutoGoogleSignIn mounted');
    
    const unsubscribeFocus = navigation.addListener('focus', () => {
      console.log('🎯 AutoGoogleSignIn screen focused');
    });
    
    const unsubscribeBlur = navigation.addListener('blur', () => {
      console.log('👋 AutoGoogleSignIn screen blurred');
      console.log('🚪 Navigating away from AutoGoogleSignIn');
      
      // Check current route after a delay
      setTimeout(() => {
        const state = navigation.getState();
        console.log('📊 Current navigation state:', state);
        if (state) {
          const currentRoute = state.routes[state.index];
          console.log('📍 Now on route:', currentRoute.name);
          console.log('📦 Route params:', currentRoute.params);
        }
      }, 100);
    });
    
    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation]);
  const handleAutoGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Starting automatic Google sign-in for:', email);
      
      // Call Google sign-in WITHOUT userType (backend will determine if it's sign-in or sign-up)
      const result = await signupWithGoogle(null, email);
      
      console.log('📊 Google sign-in result:', result);
      
      if (result.success) {
        console.log('✅ Auto Google sign-in successful');
        // AuthContext will handle navigation via login() function
        // DO NOT NAVIGATE HERE - stay on this screen until AuthContext updates
        
        // Show success message briefly
        setTimeout(() => {
          if (navigation.isFocused()) {
            // Still on this screen? Something went wrong
            console.log('⚠️ Still on AutoGoogleSignIn after successful sign-in');
            setError('Sign-in successful but navigation failed. Please restart the app.');
            setLoading(false);
          }
        }, 3000);
        
      } else {
        console.log('❌ Auto Google sign-in failed:', result.error);
        setError(result.error || 'Google sign-in failed. Please try manually.');
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ Auto Google sign-in error:', err);
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleManualRetry = () => {
    setRetryCount(prev => prev + 1);
    handleAutoGoogleSignIn();
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Check if we should show manual options (after error)
  const showManualOptions = error && !loading;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* Animated Google Icon */}
        <View style={styles.googleIconContainer}>
          <View style={styles.googleIconCircle}>
            <MaterialIcons name="google" size={60} color="#4285F4" />
          </View>
        </View>
        
        {/* Status Message */}
        <Text style={styles.title}>
          {loading ? 'Signing you in...' : error ? 'Sign-in Failed' : 'Success!'}
        </Text>
        
        <Text style={styles.subtitle}>
          {loading 
            ? `Using Google to sign in as ${email}`
            : error
            ? error
            : 'Google sign-in successful! Redirecting...'
          }
        </Text>
        
        {/* Loading Indicator */}
        {loading && (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        )}
        
        {/* Manual Options (only shown on error) */}
        {showManualOptions && (
          <View style={styles.buttonContainer}>
            <Text style={styles.retryText}>
              {retryCount > 0 ? `Attempt ${retryCount + 1}` : 'Try again'}
            </Text>
            
            <View style={styles.buttonRow}>
              <MaterialIcons.Button
                name="refresh"
                backgroundColor="#4285F4"
                onPress={handleManualRetry}
                style={styles.retryButton}
              >
                <Text style={styles.buttonText}>Retry Google Sign-In</Text>
              </MaterialIcons.Button>
              
              <MaterialIcons.Button
                name="arrow-back"
                backgroundColor="#666"
                onPress={handleGoBack}
                style={styles.backButton}
              >
                <Text style={styles.buttonText}>Back to Sign In</Text>
              </MaterialIcons.Button>
            </View>
            
            <Text style={styles.note}>
              Note: You can also set a password for this account to use email login.
            </Text>
          </View>
        )}
        
        {/* Info Message */}
        {loading && (
          <View style={styles.infoBox}>
            <MaterialIcons name="info-outline" size={16} color={COLORS.primary} />
            <Text style={styles.infoText}>
              You'll be redirected to Google for sign-in confirmation...
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  googleIconContainer: {
    marginBottom: 30,
  },
  googleIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EAEAEA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
    maxWidth: '90%',
  },
  loader: {
    marginVertical: 30,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  retryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  retryButton: {
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
    height: 50,
  },
  backButton: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
    height: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 30,
    width: '100%',
  },
  infoText: {
    fontSize: 12,
    color: '#0369A1',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
});

export default AutoGoogleSignIn;