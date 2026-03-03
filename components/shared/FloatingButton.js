import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons'; // or any other icon library you prefer
import COLORS from '../../constants/colors';

const FloatingButton = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <MaterialCommunityIcons name="plus" size={24} color="white" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 10,
    right: 16,
    backgroundColor: "green",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // for Android shadow
  },
});

export default FloatingButton;
