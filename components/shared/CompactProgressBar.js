import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';

const CompactProgressBar = ({ progress, height = 6, showPercentage = false }) => {
  const { completedTasks = 0, totalTasks = 0, percentage = 0 } = progress || {};
  console.log(progress.completedTasks)
  const progressWidth = Math.max(0, Math.min(100, percentage));

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return COLORS.lime_green;
    if (percentage >= 70) return COLORS.primary;
    if (percentage >= 40) return COLORS.warning;
    return COLORS.error;
  };

  return (
    <View style={styles.compactContainer}>
      <View style={[styles.compactProgressBar, { height }]}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${progressWidth}%`,
              backgroundColor: getProgressColor(progressWidth)
            }
          ]} 
        />
      </View>
      <Text style={styles.compactText}>
        {showPercentage ? `${progressWidth}%` : `${completedTasks}/${totalTasks}`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 8,
  },
  compactProgressBar: {
    flex: 1,
    backgroundColor: COLORS.light_gray_1,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  compactText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.dark,
    minWidth: 40,
    textAlign: 'right',
  },
});

export default CompactProgressBar;