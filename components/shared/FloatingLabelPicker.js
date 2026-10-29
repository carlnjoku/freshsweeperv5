import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../theme';

const FloatingLabelPickerSelect = ({
  label,
  items,
  value,
  onValueChange,
  placeholder = {
    label: '',
    value: null,
  },
  styleOverrides = {},
}) => {
  const { theme } = useTheme();

  const styles = createStyles(theme);
  const pickerStyles = createPickerStyles(theme);

  const [isFocused, setIsFocused] =
    useState(false);

  const isActive =
    isFocused ||
    value !== null &&
    value !== undefined &&
    value !== '';

  return (
    <View style={styles.container}>
      {isActive ? (
        <Text style={styles.floatingLabel}>
          {label}
        </Text>
      ) : (
        <Text style={styles.placeholderLabel}>
          {label}
        </Text>
      )}

      <RNPickerSelect
        onValueChange={(val) => {
          onValueChange(val);
          setIsFocused(
            val !== null &&
              val !== undefined &&
              val !== ''
          );
        }}
        items={items}
        value={value}
        placeholder={placeholder}
        useNativeAndroidPickerStyle={false}
        style={{
          ...pickerStyles,
          ...styleOverrides,
        }}
        Icon={() => (
          <Ionicons
            name="chevron-down"
            size={20}
            color={theme.icon.muted}
          />
        )}
      />
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      borderWidth: 1,
      borderColor: theme.input.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      marginTop: 15,
      backgroundColor:
        theme.input.background,
    },

    floatingLabel: {
      position: 'absolute',
      top: -10,
      left: 10,
      backgroundColor:
        theme.input.background,
      paddingHorizontal: 4,
      fontSize: 12,
      color: theme.text.secondary,
      zIndex: 1,
    },

    placeholderLabel: {
      position: 'absolute',
      top:
        Platform.OS === 'ios'
          ? 12
          : 14,
      left: 10,
      fontSize: 16,
      color: theme.input.placeholder,
      zIndex: 1,
    },
  });

const createPickerStyles = (theme) =>
  StyleSheet.create({
    inputIOS: {
      height: 45,
      fontSize: 14,
      paddingTop: 0,
      paddingRight: 32,
      color: theme.input.text,
      backgroundColor:
        'transparent',
    },

    inputAndroid: {
      height: 45,
      fontSize: 16,
      paddingRight: 32,
      color: theme.input.text,
      backgroundColor:
        'transparent',
    },

    iconContainer: {
      top:
        Platform.OS === 'ios'
          ? 12
          : 10,
      right: 10,
    },

    placeholder: {
      color: theme.input.placeholder,
    },
  });

export default FloatingLabelPickerSelect;

// import React, { useState } from 'react';
// import { View, Text, StyleSheet, Platform } from 'react-native';
// import RNPickerSelect from 'react-native-picker-select';
// import { Ionicons } from '@expo/vector-icons'; // Optional for dropdown icon

// const FloatingLabelPickerSelect = ({
//   label,
//   items,
//   value,
//   onValueChange,
//   placeholder = { label: '', value: null },
//   styleOverrides = {},
// }) => {
//   const [isFocused, setIsFocused] = useState(false);

//   const isActive = isFocused || value;

//   return (
//     <View style={styles.container}>
//       {isActive && <Text style={styles.floatingLabel}>{label}</Text>}
//       {!isActive && (
//         <Text style={styles.placeholderLabel}>{label}</Text>
//       )}
//       <RNPickerSelect
//         onValueChange={(val) => {
//           onValueChange(val);
//           setIsFocused(!!val);
//         }}
//         items={items}
//         value={value}
//         placeholder={placeholder}
//         useNativeAndroidPickerStyle={false}
//         style={{
//           ...pickerSelectStyles,
//           ...styleOverrides,
//         }}
//         Icon={() => (
//           <Ionicons name="chevron-down" size={20} color="gray" />
//         )}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     paddingHorizontal: 10,
//     marginTop: 15,
//     backgroundColor: '#fff',
//   },
//   floatingLabel: {
//     position: 'absolute',
//     top: -10,
//     left: 10,
//     backgroundColor: '#fff',
//     paddingHorizontal: 4,
//     fontSize: 12,
//     color: '#333',
//     zIndex: 1,
//   },
//   placeholderLabel: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 12 : 14,
//     left: 10,
//     fontSize: 16,
//     color: '#999',
//     zIndex: 1,
//   },
// });

// const pickerSelectStyles = StyleSheet.create({
//   inputIOS: {
//     height: 45,
//     fontSize: 14,
//     paddingTop: 0,
//     color: '#333',
//   },
//   inputAndroid: {
//     height: 45,
//     fontSize: 16,
//     color: '#333',
//   },
//   iconContainer: {
//     top: Platform.OS === 'ios' ? 12 : 10,
//     right: 10,
//   },
// });

// export default FloatingLabelPickerSelect;

