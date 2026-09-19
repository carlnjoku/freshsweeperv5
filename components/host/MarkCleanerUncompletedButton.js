// components/host/MarkCleanerUncompletedButton.js
import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import COLORS from '../../constants/colors';
import userService from '../../services/connection/userService';
import { tSafe } from '../../utils/tSafe';

const MarkCleanerUncompletedButton = ({ scheduleId, cleanerId, cleanerName, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handlePress = () => {
    Alert.alert(
      tSafe('mark_uncompleted_title', 'Mark as Uncompleted'),
      tSafe('mark_uncompleted_confirm', 'Are you sure you want to mark {name} as uncompleted? This action cannot be undone.', { name: cleanerName }),
      [
        { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
        {
          text: tSafe('mark_uncompleted', 'Mark Uncompleted'),
          style: 'destructive',
          onPress: handleMarkUncompleted,
        },
      ]
    );
  };

  const handleMarkUncompleted = async () => {
    setLoading(true);
    try {
      await userService.markCleanerUncompleted({
        scheduleId,
        cleanerId,
        reason: tSafe('did_not_complete', 'Did not complete cleaning'),
      });
      Alert.alert(tSafe('success', 'Success'), tSafe('cleaner_marked_uncompleted', 'Cleaner marked as uncompleted.'));
      if (onSuccess) onSuccess(); // Refresh parent data
    } catch (error) {
      Alert.alert(tSafe('error', 'Error'), error.response?.data?.detail || tSafe('something_went_wrong', 'Something went wrong.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, loading && styles.buttonDisabled]}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={styles.buttonText}>{tSafe('mark_uncompleted', 'Mark Uncompleted')}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.error || '#d32f2f',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default MarkCleanerUncompletedButton;