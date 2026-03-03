// components/AppText.js
import React from 'react';
import { Text, StyleSheet } from 'react-native';
// import { COLORS } from '../constants/theme'; // Adjust path as needed
import COLORS from '../../constants/colors';

const AppText = ({
  children,
  size = 14,
  color = COLORS.text, // Default color
  weight = 'normal',
  style,
  align = 'left',
  ...props
}) => {
  return (
    <Text
      style={[
        styles.text,
        {
          fontSize: size,
          color: color,
          fontWeight: weight,
          textAlign: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: 'System', // Change if you're using custom fonts
  },
});

export default AppText;