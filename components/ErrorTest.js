// components/fallback/ErrorTest.js
import React from 'react';
import { View, Button, StyleSheet, Alert } from 'react-native';
import { useError } from '../context/ErrorContext';


const ErrorTest = () => {
  const { setError } = useError();

  const testRenderError = () => {
    // This will be caught by ErrorBoundary
    throw new Error('Test React render error!');
  };

  const testGlobalError = () => {
    // This will be caught by GlobalErrorModal
    setError({
      type: 'TEST_ERROR',
      message: 'This is a test global error for error handling system',
      metadata: { 
        code: 500, 
        timestamp: new Date().toISOString(),
        debugInfo: 'User initiated test error'
      },
      recoverable: true,
    });
  };

  const testNetworkError = () => {
    setError({
      type: 'NETWORK_ERROR',
      message: 'Network connection lost. Please check your internet connection.',
      metadata: { url: 'https://api.example.com/data', status: 0 },
      recoverable: true,
    });
  };

  const testAuthError = () => {
    setError({
      type: 'AUTH_ERROR',
      message: 'Your session has expired. Please log in again.',
      metadata: { code: 401, action: 'RELOGIN' },
      recoverable: false,
    });
  };

  const testUnhandledPromise = () => {
    // Simulate an unhandled promise rejection
    Promise.reject(new Error('Unhandled Promise Rejection Test'));
  };

  const testNestedError = () => {
    // Test ErrorBoundary catching errors in children
    const BuggyComponent = () => {
      throw new Error('Nested component error!');
    };
    
    return <BuggyComponent />;
  };

  return (
    <View style={styles.container}>
      <Button title="Test Render Error (ErrorBoundary)" onPress={testRenderError} />
      <Button title="Test Global Error Modal" onPress={testGlobalError} />
      <Button title="Test Network Error" onPress={testNetworkError} />
      <Button title="Test Auth Error" onPress={testAuthError} />
      <Button title="Test Unhandled Promise" onPress={testUnhandledPromise} />
      <Button 
        title="Test Nested Component Error" 
        onPress={() => Alert.alert('Error would show on next render')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 8,
  },
});

export default ErrorTest;