import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';

const ButtonPrimary = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.deepBlue, // Primary color (blue)
    paddingVertical: 9,
    paddingHorizontal: 20,
    marginTop:20,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF', // White text color
    fontSize: 16,
    fontWeight: '400',
  },
});

export default ButtonPrimary;