import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { useTheme } from '../../theme';

const StepsIndicator = ({ step, onClose }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View>
      {/* Steps Indicator */}
      <View style={styles.stepContainer}>
        {[1, 2, 3, 4].map((stepNumber) => {
          const isActive = step === stepNumber;
          const isCompleted = step > stepNumber;

          return (
            <View
              key={stepNumber}
              style={styles.stepItem}
            >
              <View
                style={[
                  styles.stepCircle,
                  isActive &&
                    styles.activeStepCircle,
                  isCompleted &&
                    styles.completedStepCircle,
                  !isActive &&
                    !isCompleted &&
                    styles.upcomingStepCircle,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    isActive &&
                      styles.activeStepNumber,
                    isCompleted &&
                      styles.completedStepNumber,
                    !isActive &&
                      !isCompleted &&
                      styles.upcomingStepNumber,
                  ]}
                >
                  {stepNumber}
                </Text>
              </View>

              {stepNumber < 4 && (
                <View
                  style={styles.stepLineContainer}
                >
                  <View
                    style={[
                      styles.stepLine,
                      isCompleted &&
                        styles.completedStepLine,
                    ]}
                  />
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
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

    // Current step
    activeStepCircle: {
      borderColor: theme.brand.primary,
      backgroundColor: theme.surface.elevated,
    },

    activeStepNumber: {
      color: theme.brand.primary,
      fontWeight: '700',
    },

    // Completed steps
    completedStepCircle: {
      borderColor: theme.brand.primary,
      backgroundColor: theme.brand.primary,
    },

    completedStepNumber: {
      color: theme.text.inverse,
      fontWeight: '700',
    },

    // Upcoming steps
    upcomingStepCircle: {
      borderColor: theme.border.strong,
      backgroundColor: theme.surface.elevated,
    },

    upcomingStepNumber: {
      color: theme.text.muted,
      fontWeight: '500',
    },

    stepNumber: {
      fontSize: 16,
    },

    stepLineContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },

    stepLine: {
      width: 72,
      height: 1.4,
      backgroundColor: theme.border.default,
      marginHorizontal: 5,
    },

    completedStepLine: {
      backgroundColor: theme.brand.primary,
    },
  });

export default StepsIndicator;