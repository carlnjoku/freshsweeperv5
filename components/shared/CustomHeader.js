import React, { useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../../theme';

const CustomHeader = ({
  navigation,
  currentStep,
  setCurrentStep,
}) => {
  const insets = useSafeAreaInsets();

  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(
        isDark ? 'light-content' : 'dark-content'
      );

      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(
          theme.background.default
        );
      }
    }, [isDark, theme.background.default])
  );

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  const stepTitles = {
    1: 'Select Property',
    2: 'Choose Schedule',
    3: 'Available Cleaners',
  };

  return (
    <View
      style={[
        styles.headerWrapper,
        { paddingTop: insets.top },
      ]}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather
            name="arrow-left"
            size={24}
            color={theme.icon.default}
          />
        </TouchableOpacity>

        <View style={styles.titleAndSteps}>
          <Text style={styles.titleText}>
            {stepTitles[currentStep] || 'Find Cleaners'}
          </Text>

          <View style={styles.stepIndicatorContainer}>
            {[1, 2, 3].map((step) => (
              <View
                key={step}
                style={[
                  styles.stepDot,
                  currentStep >= step && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Keeps the title centered */}
        <View style={styles.spacer} />
      </View>
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    headerWrapper: {
      backgroundColor: theme.background.default,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
    },

    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.background.default,
    },

    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor: theme.background.sunken,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    titleAndSteps: {
      flex: 1,
      alignItems: 'center',
    },

    titleText: {
      color: theme.text.primary,
      fontSize: 20,
      fontWeight: '700',
      letterSpacing: -0.3,
      marginBottom: 4,
    },

    stepIndicatorContainer: {
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    stepDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.border.default,
    },

    activeDot: {
      backgroundColor: theme.brand.primary,
      width: 20,
      borderRadius: 4,
    },

    spacer: {
      width: 40,
    },
  });

export default CustomHeader;


// import React, { useCallback } from 'react';
// import { View, TouchableOpacity, Text, StyleSheet, StatusBar, Platform } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { Feather } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// import { useFocusEffect } from '@react-navigation/native';

// const CustomHeader = ({ navigation, currentStep, setCurrentStep }) => {
//   const insets = useSafeAreaInsets();

//   useFocusEffect(
//     useCallback(() => {
//       StatusBar.setBarStyle('dark-content');
//       if (Platform.OS === 'android') {
//         StatusBar.setBackgroundColor(COLORS.white);
//       }
//     }, [])
//   );

//   const handleBack = () => {
//     if (currentStep > 1) {
//       setCurrentStep(prev => prev - 1);
//     } else {
//       navigation.goBack();
//     }
//   };

//   const stepTitles = {
//     1: 'Select Property',
//     2: 'Choose Schedule',
//     3: 'Available Cleaners',
//   };

//   return (
//     <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
//       <View style={styles.headerContainer}>
//         <TouchableOpacity onPress={handleBack} style={styles.backButton}>
//           <Feather name="arrow-left" size={24} color="#000" />
//         </TouchableOpacity>

//         <View style={styles.titleAndSteps}>
//           <Text style={styles.titleText}>{stepTitles[currentStep]}</Text>
//           <View style={styles.stepIndicatorContainer}>
//             {[1, 2, 3].map(step => (
//               <View
//                 key={step}
//                 style={[
//                   styles.stepDot,
//                   currentStep >= step && styles.activeDot,
//                 ]}
//               />
//             ))}
//           </View>
//         </View>

//         {/* Spacer to balance the layout */}
//         <View style={styles.spacer} />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   headerWrapper: {
//     backgroundColor: COLORS.white,
//   },
//   headerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     backgroundColor: COLORS.white,
//   },
//   backButton: {
//     padding: 4,
//   },
//   titleAndSteps: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   titleText: {
//     color: '#000',
//     fontSize: 20,
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   stepIndicatorContainer: {
//     marginTop:10,
//     flexDirection: 'row',
//     gap: 6,
//   },
//   stepDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: COLORS.primary_light,
//   },
//   activeDot: {
//     backgroundColor: COLORS.primary,
//   },
//   spacer: {
//     width: 40, // matches the back button width to keep title centered
//   },
// });

// export default CustomHeader;