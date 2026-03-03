// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import COLORS from '../../constants/colors';

// const CustomHeader = ({ title, navigation }) => {
//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.headerContainer}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>

//         <Text style={styles.headerTitle}>{title}</Text>

//         {/* Spacer to balance layout */}
//         <View style={{ width: 24 }} />
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     backgroundColor: COLORS.primary,
//   },
//   headerContainer: {
//     height: 60,
//     backgroundColor: COLORS.primary,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//   },
//   headerTitle: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });

// export default CustomHeader;




// components/shared/CustomHeader.js
// components/shared/CustomHeader.js
import React, {useCallback} from 'react';
import { View, TouchableOpacity, Text, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import { useFocusEffect } from '@react-navigation/native';


const CustomHeader = ({ navigation, currentStep, setCurrentStep }) => {

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(COLORS.white);
      }
    }, [])
  );

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleBack}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.titleAndSteps}>
          <Text style={styles.titleText}>{stepTitles[currentStep]}</Text>
          <View style={styles.stepIndicatorContainer}>
            {[1, 2, 3].map(step => (
              <View
                key={step}
                style={[
                  styles.stepDot,
                  currentStep >= step && styles.activeDot
                ]}
              />
            ))}
          </View>
        </View>

        {/* Spacer to align arrow and steps */}
        <View style={{ width: 24 }} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.white,
    paddingBottom: Platform.OS === 'ios' ? 0 : 40,
  },
  headerContainer: {
    height: 30,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  titleAndSteps: {
    alignItems: 'center',
  },
  titleText: {
    color: '#000',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop:5
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary_light,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
  },
});

export default CustomHeader;