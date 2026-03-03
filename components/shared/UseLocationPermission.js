// components/LocationPermission.js
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

const useLocationPermission = () => {
  const [hasPermission, setHasPermission] = useState(null);

  // Single method to handle both check and request
  const handleLocationPermission = async (requestIfNeeded = false) => {
    try {
      // First check current status
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setHasPermission(true);
        return true;
      }

      if (requestIfNeeded) {
        // Request permission if needed
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        setHasPermission(newStatus === 'granted');
        return newStatus === 'granted';
      }

      return false;
    } catch (error) {
      Alert.alert(
        'Permission Error', 
        'Failed to access location services'
      );
      return false;
    }
  };

  useEffect(() => {
    // Initial check on component mount
    handleLocationPermission();
  }, []);

  return { 
    hasPermission,
    requestPermission: () => handleLocationPermission(true) 
  };
};

export default useLocationPermission;