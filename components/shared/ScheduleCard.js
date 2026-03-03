import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import COLORS from '../../constants/colors';
import { TouchableRipple } from 'react-native-paper';
import CircleIconNoLabel from './CirecleIconNoLabel';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import moment from 'moment';

const ScheduleCard = ({ item, selectedProperty, regular_cleaning, extra, cleaning_date, cleaning_time, cleaning_end_time, onPress, borderColor = '#3498db'  }) => {

    console.log(item)
    const date = moment(cleaning_date).format('DD'); // Extracts "20"
    const day = moment(cleaning_date).format('ddd'); // Extracts "Thu" (Thursday)

    const startTime = moment(cleaning_time, "HH:mm:ss").format("h:mm A");
    const endTime = moment(cleaning_end_time, "HH:mm:ss").format("h:mm A");
  return (

    // <Text>Hello</Text>
    
      <TouchableOpacity
        style={[
          styles.card,
          selectedProperty?._id === item._id && styles.selectedCard
        ]}
        onPress={onPress}
      >
        <Feather name="home" size={24} color={COLORS.primary} />
        <Text style={styles.cardTitle}>{item.apt_name}</Text>
        <Text style={styles.cardSubtitle}>
          {item.type} • {item.beds} beds • {item.baths} baths
        </Text>
                 <View style={styles.container}>
             {/* Left Section (10%) */}
             <View style={styles.leftSection}>
                 <Text style={styles.date}>{date}</Text>
                 <Text style={styles.leftText}>{day}</Text>
             </View>

             {/* Right Section (80%) */}
             <View style={styles.rightSection}>
                 <Text style={styles.rightText}>
                     {/* {item.schedule.regular_cleaning.length > 0 && item.schedule.extra.length > 0 ? "Regular + Extra Cleaning": "Regular Cleaning" } */}
                 </Text>
                 {/* <Text style={styles.rightTime}><MaterialCommunityIcons name="calendar" size={12} color={COLORS.gray} />{startTime} - {endTime} </Text> */}
             </View>

             {/* Right Section (80%) */}
             <View style={styles.arrowSection}>
                
                 <CircleIconNoLabel 
                     iconName="chevron-right"
                     buttonSize={30}
                     radiusSise={15}
                     iconSize={16}
                      // onPress={() => navigation.navigate(ROUTES.host_apt_dashboard, { propertyId: property._id, hostId:currentUserId, property:property })}
                 />
             </View>
         </View>
        {selectedProperty?._id === item._id && (
          <View style={styles.checkBadge}>
            <Feather name="check" size={16} color="white" />
          </View>
        )}
    </TouchableOpacity> 
   
  );
};

const styles = StyleSheet.create({
  // card: {
  //   backgroundColor: 'white',
  //   borderLeftWidth: 3, // Left border width
  //   borderRadius: 8, // Rounded corners
  //   borderLeftColor: COLORS.primary_light, 
  //   padding: 15,
  //   marginVertical: 10,
  //   shadowColor: '#000', // Shadow color
  //   shadowOffset: { width: 0, height: 2 }, // Shadow position
  //   shadowOpacity: 0.1, // Shadow transparency
  //   shadowRadius: 4, // Blur radius
  //   elevation: 4, // Elevation for Android
  // },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  container: {
    flexDirection: 'row', // Horizontal layout
    height: 50, // Adjust height as neede
  },
  leftSection: {
    width: '15%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth:1,
    borderColor:COLORS.light_gray
  },
  rightSection: {
    width: '65%',
    alignItems: 'flex-start',
    marginLeft:10,
    marginTop:4
  },
  arrowSection:{
    width: '10%',
    marginTop:10
  },
  date:{
    fontWeight:'600',
    fontSize:20
  },
  leftText: {
    color: COLORS.light_gray,
    fontWeight: 'bold',
    fontSize:12
  },
  rightText: {
    color: COLORS.gray,
    fontWeight: '500',
  },
  rightTime:{
    color:COLORS.light_gray,
    marginTop:8,
    fontSize:12
  },


  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  checkBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ScheduleCard;