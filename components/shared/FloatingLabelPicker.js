// import React, { useState } from 'react';
// import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import COLORS from '../../constants/colors';


// const FloatingLabelPicker = ({ label, selectedValue, onValueChange, title, options, labelKey = "label", valueKey = "value" }) => {
// //   const [isFocused, setIsFocused] = useState(false);
// //   const [selectedValue, setSelectedValue] = useState('');
//   const [isFocused, setIsFocused] = useState(false);

//   const isActive = isFocused || selectedValue !== '';

//   return (
//     <View style={[styles.container, isActive && styles.activeContainer]}>
//       <Text
//         style={[
//           styles.label,
//           {
//             top: isActive ? -10 : 15,
//             fontSize: isActive ? 12 : 16,
//             color: isActive ? COLORS.black : COLORS.gray,
//           },
//         ]}
//       >
//         {/* {label} */}
//         {title}
//       </Text>
//     <Picker
//         selectedValue={selectedValue}
//         onValueChange={(value) => {
//         onValueChange(value);
//         setIsFocused(!!value);
//         }}
//         style={styles.picker}
//     >
//         <Picker.Item label="" value="" />
//         {options.map((option, index) => (
//         // <Picker.Item key={option.abbreviation} label={option.name} value={option.abbreviation} />
//         <Picker.Item
//             key={index}
//             label={option[labelKey]}
//             value={option[valueKey]}
//         />
//         ))}
//     </Picker>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     position: 'relative',
//     borderWidth: 1,
//     borderColor: '#CCC',
//     borderRadius:5,
//     marginTop: 15,
//   },
//   label: {
//     position: 'absolute',
//     left: 10,
//     backgroundColor: '#FFF',
//     paddingHorizontal: 5,
//   },
//   picker: {
//      height: 50, width: '100%' 
//   },
// });

// export default FloatingLabelPicker;




import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons'; // Optional for dropdown icon

const FloatingLabelPickerSelect = ({
  label,
  items,
  value,
  onValueChange,
  placeholder = { label: '', value: null },
  styleOverrides = {},
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const isActive = isFocused || value;

  return (
    <View style={styles.container}>
      {isActive && <Text style={styles.floatingLabel}>{label}</Text>}
      {!isActive && (
        <Text style={styles.placeholderLabel}>{label}</Text>
      )}
      <RNPickerSelect
        onValueChange={(val) => {
          onValueChange(val);
          setIsFocused(!!val);
        }}
        items={items}
        value={value}
        placeholder={placeholder}
        useNativeAndroidPickerStyle={false}
        style={{
          ...pickerSelectStyles,
          ...styleOverrides,
        }}
        Icon={() => (
          <Ionicons name="chevron-down" size={20} color="gray" />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginTop: 15,
    backgroundColor: '#fff',
  },
  floatingLabel: {
    position: 'absolute',
    top: -10,
    left: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    fontSize: 12,
    color: '#333',
    zIndex: 1,
  },
  placeholderLabel: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 12 : 14,
    left: 10,
    fontSize: 16,
    color: '#999',
    zIndex: 1,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    height: 45,
    fontSize: 14,
    paddingTop: 0,
    color: '#333',
  },
  inputAndroid: {
    height: 45,
    fontSize: 16,
    color: '#333',
  },
  iconContainer: {
    top: Platform.OS === 'ios' ? 12 : 10,
    right: 10,
  },
});

export default FloatingLabelPickerSelect;




// import React, { useState } from 'react';
// import { View, StyleSheet, Platform, Text } from 'react-native';
// import RNPickerSelect from 'react-native-picker-select';
// import { Ionicons } from '@expo/vector-icons'; // or use any other icon lib

// const FloatingLabelPickerSelect = ({ label, items, value, onValueChange }) => {
//   const [isFocused, setIsFocused] = useState(false);
//   const isActive = isFocused || !!value;

//   return (
//     <View style={styles.container}>
//       {label && (
//         <Text
//           style={[
//             styles.label,
//             {
//               top: isActive ? -10 : 14,
//               fontSize: isActive ? 12 : 16,
//               color: isActive ? '#000' : '#999',
//             },
//           ]}
//         >
//           {label}
//         </Text>
//       )}
//       <RNPickerSelect
//         onValueChange={(val) => {
//           onValueChange(val);
//           setIsFocused(!!val);
//         }}
//         value={value}
//         items={items}
//         useNativeAndroidPickerStyle={false}
//         style={pickerSelectStyles}
//         Icon={() => {
//           return <Ionicons name="chevron-down" size={20} color="gray" />;
//         }}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     position: 'relative',
//     borderWidth: 1,
//     borderColor: '#CCC',
//     borderRadius: 5,
//     marginTop: 20,
//     paddingHorizontal: 10,
//     paddingTop: 16,
//   },
//   label: {
//     position: 'absolute',
//     left: 10,
//     backgroundColor: '#fff',
//     paddingHorizontal: 4,
//     zIndex: 10,
//   },
// });

// const pickerSelectStyles = StyleSheet.create({
//   inputIOS: {
//     height: 40,
//     fontSize: 16,
//     paddingVertical: 10,
//     paddingHorizontal: 10,
//     color: '#000',
//     paddingRight: 30, // To ensure the text doesn't overlap the icon
//   },
//   iconContainer: {
//     top: Platform.OS === 'ios' ? 12 : 10,
//     right: 10,
//   },
// });

// export default FloatingLabelPickerSelect;