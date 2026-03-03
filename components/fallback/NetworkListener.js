// components/NetworkListener.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useError } from '../../context/ErrorContext';


const NetworkListener = ({ children }) => {
  const [isOffline, setIsOffline] = useState(false);
  const { setError } = useError();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = !state.isConnected;
      setIsOffline(offline);
      
      if (offline) {
        setError({
          type: 'NETWORK_ERROR',
          message: 'No internet connection. Please check your network settings.',
          recoverable: true,
        });
      }
    });

    return () => unsubscribe();
  }, [setError]);

  if (isOffline) {
    return (
      <View style={styles.offlineContainer}>
        <Text style={styles.offlineTitle}>⚠️ No Internet Connection</Text>
        <Text style={styles.offlineMessage}>
          Please check your Wi-Fi or mobile data and try again.
        </Text>
      </View>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  offlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  offlineTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  offlineMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default NetworkListener;