import React, {useState,useContext} from 'react';
import { View, Text, StyleSheet,TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import { useBookingContext } from '../../context/BookingContext';
import { AuthContext } from '../../context/AuthContext';



const BoxWithIcon3 = ({item,columnWidth, iconName, price, onPress }) => {

  // const [isSelected, setIsSelected] = useState(false);
  // const { isSelected, setIsSelected } = useBookingContext();

  const { isSelectedList, toggleSelected } = useBookingContext();

  const {currency} = useContext(AuthContext)
  
  const handlePress = (value, label, price, icon) => {
    console.log(value)
    toggleSelected(item.value); 
    // setIsSelected(!isSelected); // Toggle the selected state
    onPress(value, label, price, icon); // Pass the value to the parent component
  };

  return (
    <View>
    <TouchableOpacity
      // onPress={(value, price) => handlePress(item.value, item.label, item.price, item.icon)}
      style={[styles.container,  { width: columnWidth }, isSelectedList[item.value] ? styles.selectedContainer : null ]}

    >
      
      <View style={styles.box}>
        <MaterialCommunityIcons name={iconName} size={28} color={COLORS.light_gray} />
        <Text style={styles.text}>{item.label}</Text>
        <Text style={styles.text}>{currency}{item.price}</Text>
      </View>
    </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor:COLORS.light_gray,
    borderRadius: 8,
    padding: 10,
    height: 100,
    marginVertical: 10,
    // marginHorizontal: 5,
    marginRight:10
  },
  // selectedContainer: {
  //   backgroundColor: COLORS.primary, // Change background color when selected
  // },
  box: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 5,
    fontSize:12
  },
  selectedContainer: {
    backgroundColor: COLORS.primary_light_1, // Change background color when selected
  },
  selectedText: {
    color: '#fff', // Change text color when selected
  },
});

export default BoxWithIcon3;












// import React, { useState } from 'react';
// import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import your icon library here
// // import COLORS from '../../constants/colors'; // Import your colors constant here

// const BoxWithIcon = ({ icon, text, value, onPress }) => {
//   const [isSelected, setIsSelected] = useState(false);

//   const handlePress = () => {
//     setIsSelected(!isSelected); // Toggle the isSelected state
//     onPress(value); // Send the value to the parent component
//   };

//   return (
//     <TouchableOpacity
//       onPress={handlePress}
//       style={[styles.container, { backgroundColor: isSelected ? COLORS.lightBlue : COLORS.white }]}
//     >
//       <View>
//         {icon}
//         <Text>{text}</Text>
//       </View>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 10,
//     margin: 5,
//     borderWidth: 1,
//     borderColor: COLORS.gray,
//     borderRadius: 5,
//   },
// });

// export default BoxWithIcon;
