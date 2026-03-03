import React, {useContext, useState} from 'react';
import { View, Text, StyleSheet,TouchableOpacity, FlatList } from 'react-native';
import COLORS from '../../constants/colors';
import { Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import ROUTES from '../../constants/routes';
import { useNavigation } from '@react-navigation/native';
import { useBookingContext } from '../../context/BookingContext';
import { AuthContext } from '../../context/AuthContext';

const UpcomingScheduleListItem = ({item, currency }) => {

  console.log("Scheduleeeeeeeeeeeeeeeeees")
  // console.log(item)
  console.log("Scheduleeeeeeeeeeeeeeeeees")
  const navigation = useNavigation();
  const {userType} = useContext(AuthContext)



  const {handleEdit}  = useBookingContext();

  return (
   

    <View>

          <View style={styles.container}>
            <View style={styles.date_time}>
              <Text style={styles.date}>{moment(item.schedule.cleaning_date).format('ddd MMM DD')}</Text>
              <Text style={styles.time}>{moment(item.schedule.cleaning_time, 'h:mm:ss A').format('h:mm A')}</Text>
            </View>
            
            <View style={styles.dotline}>
              <View style={styles.dot} />
              <View style={styles.line} />
            </View>
            
            
              <View style={styles.task_details}>
                <Text bold style={styles.task}>{item.schedule.apartment_name}</Text>
                {/* <Text style={styles.task}>{item.schedule.apartment_name}</Text> */}
                <Text style={styles.apartment}>{item.schedule.address} </Text>


                
                <Chip
                  mode="flat"
                  style={styles.activeChip}
                  textStyle={styles.text}
                  label={item.total_cleaning_fee}
                >
                  {currency}{item.schedule.total_cleaning_fee || 0.0}
                </Chip>

                {userType==="host" ? 
                <View style={styles.action}>
                  {item.status === "open" ?  
                  <View style={{flexDirection:'row', width:'85%', justifyContent:'space-between', alignItems:'center'}}>
                    
                    <TouchableOpacity 
                      onPress={() => navigation.navigate(ROUTES.host_schedule_details, {
                        scheduleId:item._id
                      })}
                    >
                      <Text style={styles.details}>View schedule</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleEdit(true, item)} // Pass item to handleEdit
                    >
                      
                      <Text style={styles.details}> Edit schedule</Text>
                    </TouchableOpacity>
                  </View>
                :
                <TouchableOpacity 
                  onPress={() => navigation.navigate(ROUTES.host_schedule_details, {
                    scheduleId:item._id
                  })}
                >
                  <Text style={styles.details}>View schedule</Text>
                </TouchableOpacity>
                }
              </View>


                :

              <View style={styles.action}>
                  { item.status ==='open' ? 
                  <TouchableOpacity 
                    onPress={() => navigation.navigate(ROUTES.cleaner_schedule_details, {
                      'item':item.item
                    })}
                  >
                    <Text style={styles.details}>DETAILS</Text>
                  </TouchableOpacity>

                  :

                  <TouchableOpacity 
                    onPress={() => navigation.navigate(ROUTES.cleaner_schedule_details, {
                      'item':item.item
                    })}
                  >
                      <Text style={styles.clockin}>CLOCK-IN</Text>
                  </TouchableOpacity>
                }
                  </View> 

                }
              </View>
            </View>
          </View>
        
      

  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 10,
    marginTop:15
  },
  dotline:{
    flex: 0.05,
    height:'100%',
    alignItems: 'flex-start'
  },
  line: {
    borderLeftWidth: 0.7, // Adjust the thickness of the line as needed
    borderLeftColor: COLORS.light_gray, // Change the color of the line as needed
    // borderStyle: 'dotted', // Set the line style to dotted
    minHeight: 78, // Make the line extend the full height of the container
    // marginRight: 10, // Adjust the spacing between the text and the line as needed
    marginHorizontal:5,
    marginVertical: 0 // Adjust vertical spacing as needed
  },
  date_time:{
    flex: 0.25,
    alignItems:'flex-end',
    marginRight:5
  },
  task: {
    fontWeight:'500'
  },
  apartment:{
    color:COLORS.gray,
    fontSize:13,
    marginBottom:5
  },
  date:{
    marginTop:-4,
    fontSize:14,
    fontWeight:'500'
    // color:COLORS.gray
  },
  time:{
    marginTop:4,
    fontSize:12,
    // color:COLORS.gray
  },
  assignee:{
    fontSize:12,
    color:COLORS.gray
  },
  task_details:{
    flex: 0.7,
    alignItems: 'flex-start',
    width:'100%',
    marginTop:-5
  },
  status:{
    textTransform:'capitalize',
    color:COLORS.light_gray
  },
  
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginBottom: 5, // Adjust this to control the space between the dot and the line
  },
  details:{
    fontSize:14,
    color:COLORS.primary,
    textDecorationLine: "underline"
    // fontWeight:'bold'
  },
  clockin:{
    fontSize:12,
    marginLeft:20,
    color:COLORS.primary,
    fontWeight:'bold'
  },
  action:{
    flexDirection:'row',
    justifyContent:'space-evenly',
    marginTop:5,
    marginBottom: 5,
  },
  chip: {
    backgroundColor: COLORS.light_gray_1,
    // borderColor:COLORS.primary
    borderRadius:50
  },
  activeChip: {
    backgroundColor: COLORS.primary_light_1,
    borderRadius:50
    // borderColor:COLORS.black,
  },
  text:{
    fontWeight:'400'
  }
});

export default UpcomingScheduleListItem;

