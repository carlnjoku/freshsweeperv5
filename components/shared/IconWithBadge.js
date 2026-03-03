import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons'; // or any other icon library

const IconWithBadge = ({ icon, badgeCount, color, size }) => {
  return (
    <View style={{ width: 24, height: 24, margin: 5 }}>
      <Ionicons name={icon} size={size} color={color} />
      {badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: 'red',
    borderRadius: 6,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default IconWithBadge;
