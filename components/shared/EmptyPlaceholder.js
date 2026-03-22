// components/shared/EmptyPlaceholder.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';

export default function EmptyPlaceholder({ icon, message, size = 64 }) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={size} color={COLORS.light_gray} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  },
});