// context/ErrorContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert } from 'react-native';

const ErrorContext = createContext();

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within ErrorProvider');
  }
  return context;
};

export const ErrorProvider = ({ 
  children, 
  onError,
  showAlerts = true 
}) => {
  const [error, setErrorState] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const setError = useCallback((errorData) => {
    const appError = {
      ...errorData,
      timestamp: new Date(),
    };
    
    setErrorState(appError);
    setShowErrorModal(true);
    
    console.error('App Error:', appError);
    
    onError?.(appError);
    
    if (showAlerts && !errorData.recoverable) {
      Alert.alert(
        'Error',
        errorData.message,
        [{ text: 'OK', onPress: () => setShowErrorModal(false) }]
      );
    }
  }, [onError, showAlerts]);

  const clearError = useCallback(() => {
    setErrorState(null);
    setShowErrorModal(false);
  }, []);

  const handleError = useCallback((err, type = 'UNKNOWN_ERROR') => {
    let message = 'An unexpected error occurred';
    let recoverable = true;
    let metadata = {};

    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'string') {
      message = err;
    } else if (err?.message) {
      message = err.message;
    }

    switch (type) {
      case 'NETWORK_ERROR':
        message = message || 'Network connection failed';
        recoverable = true;
        break;
      case 'AUTH_ERROR':
        message = message || 'Authentication failed';
        recoverable = false;
        break;
      case 'API_ERROR':
        message = `API Error: ${message}`;
        recoverable = true;
        metadata = { statusCode: err.statusCode, endpoint: err.endpoint };
        break;
    }

    setError({ type, message, recoverable, metadata });
  }, [setError]);

  return (
    <ErrorContext.Provider
      value={{
        error,
        setError,
        clearError,
        showErrorModal,
        setShowErrorModal,
        handleError,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
};