// import React from 'react';
// import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
// import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
// import { Chip } from 'react-native-paper';
// import COLORS from '../../constants/colors'; // Replace with your app's color constants
// import CustomCard from './CustomCard';
// import CircleIcon from './CirecleIcon';

// const SingleApartmentItem = ({
//   apartment, // Apartment object
//   onSelectApartment, // Function to handle apartment selection
// }) => {

//   const ROOM_ICON_MAP = {
//     Bedroom: 'bed-empty',
//     Bathroom: 'shower-head',
//     Kitchen: 'silverware-fork-knife',
//     Livingroom: 'sofa',
//   };
//   console.log(apartment)
//   return (
//     <Pressable
//       style={styles.container}
//     //   onPress={() => {
//     //     onSelectApartment(apartment); // Pass the selected apartment to the parent
//     //   }}
//     >
      

//       {/* Property Header Card */}
     
//           <View> 
//             <View style={styles.centerContent}>
//               <AntDesign name="home" size={40} color={COLORS.gray}/> 
//               <Text style={styles.headerText}>{apartment?.apt_name}</Text>
//               <Text style={{color:COLORS.gray, marginBottom:5, marginLeft:-5}}> 
//                 <MaterialCommunityIcons name="map-marker" size={16} />{apartment.address}
//               </Text>
//             </View> 
  
//             <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:0, marginBottom:10}}>
              
//               {apartment.roomDetails.map((room, index) => (
//                 <CircleIcon 
//                   iconName={ROOM_ICON_MAP[room.type] || 'home-outline'}
//                   buttonSize={26}
//                   radiusSise={13}
//                   iconSize={16}
//                   title= {room.number}
//                   roomSize= {room.size}
//                   type={room.type}
//                 />
//         ))}
              
//             </View> 
//           </View>
//     </Pressable>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     padding: 16,
//     marginVertical: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   itemContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   itemText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: COLORS.black,
    
//   },
//   address: {
//     fontSize: 14,
//     color: COLORS.gray,
//     marginTop: 4,
//   },
//   roomTypeContainer: {
//     flexDirection: 'row',
//     marginTop: 10,
//     alignItems: 'center', 
//     paddingRight: 10,
//     flexWrap: 'wrap',
//     justifyContent: 'center'
//   },
//   chip: {
//     backgroundColor: COLORS.primary_light_1,
//     marginRight: 8,
//     borderRadius:50,
//     marginTop:5
//   },
//   chipText: {
//     color: COLORS.gray,
//     fontSize: 12,
//   },
//   centerContent: {
//     alignItems: 'center',
//     marginVertical: 0
//   },


  
// });

// export default SingleApartmentItem;



import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import {
  AntDesign,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import { useTheme } from '../../theme';
import CircleIcon from './CirecleIcon';

const SingleApartmentItem = ({
  apartment,
  onSelectApartment,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const ROOM_ICON_MAP = {
    Bedroom: 'bed-empty',
    Bathroom: 'shower-head',
    Kitchen: 'silverware-fork-knife',
    Livingroom: 'sofa',
  };

  return (
    <Pressable
      style={styles.container}
      // Keep selection behavior available for future use.
      // onPress={() => {
      //   onSelectApartment(apartment);
      // }}
    >
      {/* Property Header */}
      <View>
        <View style={styles.centerContent}>
          <AntDesign
            name="home"
            size={40}
            color={theme.icon.muted}
          />

          <Text style={styles.headerText}>
            {apartment?.apt_name}
          </Text>

          <View style={styles.addressContainer}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color={theme.icon.muted}
            />

            <Text style={styles.address}>
              {apartment?.address}
            </Text>
          </View>
        </View>

        {/* Room Details */}
        <View style={styles.roomsContainer}>
          {apartment?.roomDetails?.map((room, index) => (
            <CircleIcon
              key={`${room?.type || 'room'}-${room?.number || index}`}
              iconName={
                ROOM_ICON_MAP[room?.type] ||
                'home-outline'
              }
              buttonSize={26}
              radiusSise={13}
              iconSize={16}
              title={room?.number}
              roomSize={room?.size}
              type={room?.type}
            />
          ))}
        </View>
      </View>
    </Pressable>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.card.background,
      borderRadius: 18,
      padding: 16,
      marginVertical: 10,

      borderWidth: 1,
      borderColor: theme.card.border,

      shadowColor:
        theme.shadow?.color || '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity:
        theme.shadow?.opacity || 0.08,
      shadowRadius: 6,
      elevation: 2,
    },

    centerContent: {
      alignItems: 'center',
      marginVertical: 0,
    },

    headerText: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text.primary,
      marginTop: 6,
      textAlign: 'center',
    },

    addressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
      marginBottom: 5,
      paddingHorizontal: 8,
    },

    address: {
      fontSize: 14,
      color: theme.text.secondary,
      marginLeft: 4,
      textAlign: 'center',
      flexShrink: 1,
    },

    roomsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 0,
      marginBottom: 10,
      flexWrap: 'wrap',
    },
  });

export default SingleApartmentItem;