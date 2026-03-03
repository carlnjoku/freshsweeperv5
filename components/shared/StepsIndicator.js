import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';


const StepsIndicator = ({ step, onClose }) => {
  return (
    <View>
      

      {/* Steps Indicator */}
      <View style={styles.stepContainer}>
        {[1, 2, 3, 4].map((stepNumber) => (
          <View key={stepNumber} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                step === stepNumber
                  ? styles.activeStepCircle // Current step: outlined
                  : step > stepNumber
                  ? styles.completedStepCircle // Previous steps: filled
                  : styles.upcomingStepCircle, // Upcoming steps: outlined only
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  step === stepNumber
                    ? styles.activeStepNumber // Current step: green text
                    : step > stepNumber
                    ? styles.completedStepNumber // Completed steps: white text
                    : styles.upcomingStepNumber, // Upcoming steps: gray text
                ]}
              >
                {stepNumber}
              </Text>
            </View>
            {stepNumber < 4 && (
              <View style={styles.stepLineContainer}>
                <View style={styles.stepLine} />
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    alignSelf: 'flex-end',
    marginRight: 10,
    marginTop: 10,
    zIndex: 1,
  },
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 20,
    marginTop: 30,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStepCircle: {
    borderColor: COLORS.primary, // Current step: outlined
    backgroundColor: '#fff', // Not filled for the current step
  },
  completedStepCircle: {
    borderColor: COLORS.primary, // Completed steps: outlined
    backgroundColor: COLORS.primary, // Filled for previous steps
  },
  upcomingStepCircle: {
    borderColor: '#ddd', // Upcoming steps: outlined in gray
    backgroundColor: '#fff', // Not filled for upcoming steps
  },
  stepNumber: {
    fontSize: 16,
  },
  activeStepNumber: {
    color: COLORS.primary, // Current step number: green text
  },
  completedStepNumber: {
    color: '#fff', // Previous step number: white text
  },
  upcomingStepNumber: {
    color: '#aaa', // Upcoming step number: gray text
  },
  stepLine: {
    width: 72,
    height: 1.4,
    backgroundColor: '#ddd', // Line color between steps
    marginHorizontal: 5,
  },
});

export default StepsIndicator;

