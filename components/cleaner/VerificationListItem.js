// components/cleaner/VerificationListItem.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import COLORS from '../../constants/colors';

const VerificationListItem = ({ 
  icon, 
  label, 
  description, 
  isEnabled, 
  isCompleted, 
  onPress,
  status 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        !isEnabled && styles.disabled,
        status === 'complete' && styles.completed
      ]}
      onPress={isEnabled ? onPress : null}
      disabled={!isEnabled}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons 
          name={icon} 
          size={24} 
          color={
            isCompleted ? COLORS.primary : 
            isEnabled ? COLORS.gray : COLORS.light_gray_1
          } 
        />
      </View>
      
      <View style={styles.textContainer}>
        <Text style={[
          styles.label,
          !isEnabled && styles.disabledText,
          isCompleted && styles.completedText
        ]}>
          {label}
        </Text>
        <Text style={[
          styles.description,
          !isEnabled && styles.disabledText
        ]}>
          {description}
        </Text>
      </View>
      
      <View style={styles.statusContainer}>
        {isCompleted && (
          <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.primary} />
        )}
        {!isCompleted && isEnabled && (
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.gray} />
        )}
        {!isCompleted && !isEnabled && (
          <MaterialCommunityIcons name="lock" size={20} color={COLORS.light_gray_1} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  disabled: {
    opacity: 0.6,
  },
  completed: {
    backgroundColor: '#f0f9ff',
    borderColor: COLORS.primary + '20',
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: COLORS.dark,
  },
  description: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 18,
  },
  disabledText: {
    color: COLORS.light_gray_1,
  },
  completedText: {
    color: COLORS.primary,
  },
  statusContainer: {
    marginLeft: 8,
  },
});

export default VerificationListItem;