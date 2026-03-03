import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // Import the Ionicons component
import COLORS from '../../constants/colors';

const CircularIcon = ({ onPress, iconName, borderColor, borderWidth }) => {
  return (
    <TouchableOpacity style={styles.circle} onPress={onPress}>
      <MaterialCommunityIcons name={iconName} size={24} color="white" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  circle: {
    width: 40, // Diameter of the circle
    height: 40, // Diameter of the circle
    borderRadius: 20, // Half the diameter to make it a circle
    backgroundColor: COLORS.primary, // Background color of the circle
    justifyContent: 'center', // Center the icon vertically
    alignItems: 'center', // Center the icon horizontally
    borderColor:COLORS.white,
    borderWidth:1,
    marginHorizontal:5

  },
});

export default CircularIcon;