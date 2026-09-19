// components/shared/CustomMenuButton.js
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const CustomMenuButton = ({ tintColor }) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.toggleDrawer()}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={{ marginLeft: 12 }}
    >
      <Ionicons name="menu-outline" size={28} color={tintColor || '#333'} />
    </TouchableOpacity>
  );
};

export default CustomMenuButton;