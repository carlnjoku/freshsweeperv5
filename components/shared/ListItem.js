import React, {useContext} from 'react';
import { View,Text, StyleSheet,TouchableOpacity, FlatList, Image } from 'react-native';
import COLORS from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import ROUTES from '../../constants/routes';
import { useNavigation } from '@react-navigation/native';
import ButtonPrimary from './ButtonPrimary';
import { AuthContext } from '../../context/AuthContext';


// const ListItem = ({item }) => {

//   const {currentUserId} = useContext(AuthContext)
//   const navigation = useNavigation();

  
//   const assignedToForCleaner = item?.assignedTo?.find(
//     (cleaner) => cleaner.cleanerId === currentUserId
//   );

//   console.log("My cleeeeeeaner")
//   console.log(assignedToForCleaner)
  
//   const targetDate = moment(`${item.schedule.cleaning_date} ${item.schedule.cleaning_time}`, 'YYYY-MM-DD HH:mm:ss')
//   // const targetDate = moment(`2024-12-26 11:00:00`, 'YYYY-MM-DD HH:mm:ss')
  
//   // Get the current date and time
//   const currentDate = moment();


//   return (
   
//     <View>
             
//         <View style={styles.centerContent}>
//               <Text bold style={styles.headerText}>{item.schedule.apartment_name}</Text>
//               <Text style={{color:COLORS.gray, marginBottom:10, marginLeft:-5}}> <MaterialCommunityIcons name="map-marker" size={16} />{item.schedule?.address} </Text>

//               <Text style={styles.date}>{moment(item.schedule?.cleaning_date).format('ddd MMM DD')}</Text>
//               <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
//               <Text style={styles.time}>{moment(item.schedule?.cleaning_time,'h:mm:ss A').format('h:mm A')}</Text>
//               <Text> - </Text>
//               <Text style={styles.time}> {moment(item.schedule?.cleaning_end_time,'h:mm:ss A').format('h:mm A')}</Text>
//               <Text>fsf{currentDate.isAfter(targetDate)}eeew</Text>
//               </View>
              

//               {currentDate.isAfter(targetDate) && assignedToForCleaner.status === 'in_progress' ? 
                
//                 <ButtonPrimary 
//                   title="Continue Working"
//                   onPress = {()=>navigation.navigate(ROUTES.cleaner_attach_task_photos,{
//                     scheduleId:item._id,
//                     schedule:item,
//                     hostId:item.hostInfo._id
//                   })}

//                 />
//                 :
//                 <ButtonPrimary 
//                   title="Clock-In"
//                   onPress = {()=>navigation.navigate(ROUTES.cleaner_clock_in,{
//                     scheduleId:item._id,
//                     cleaner : assignedToForCleaner,
//                     schedule:item
//                   })}

//                 />
                
                
//               }
//             </View>
//     </View>
        
      

//   );
// };

const ListItem = ({item }) => {
  const {currentUserId} = useContext(AuthContext)
  const navigation = useNavigation();

  const assignedToForCleaner = item?.assignedTo?.find(
    (cleaner) => cleaner.cleanerId === currentUserId
  );
  
  const targetDate = moment(`${item.schedule.cleaning_date} ${item.schedule.cleaning_time}`, 'YYYY-MM-DD HH:mm:ss')
  const currentDate = moment();

  // Calculate if we're within a reasonable time window (e.g., 15 minutes before)
  const canClockInEarly = currentDate.isAfter(targetDate.clone().subtract(15, 'minutes'));

  return (
    <View>
      <View style={styles.centerContent}>
        <Text bold style={styles.headerText}>{item.schedule.apartment_name}</Text>
        <Text style={{color:COLORS.gray, marginBottom:10, marginLeft:-5}}> 
          <MaterialCommunityIcons name="map-marker" size={16} />
          {item.schedule?.address} 
        </Text>

        <Text style={styles.date}>{moment(item.schedule?.cleaning_date).format('ddd MMM DD')}</Text>
        <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
          <Text style={styles.time}>{moment(item.schedule?.cleaning_time,'h:mm:ss A').format('h:mm A')}</Text>
          <Text> - </Text>
          <Text style={styles.time}>{moment(item.schedule?.cleaning_end_time,'h:mm:ss A').format('h:mm A')}</Text>
        </View>

        {/* Show appropriate action button with status info */}
        {assignedToForCleaner?.status === 'in_progress' || 'pending_completion_approval' ? (
          <View style={styles.inProgressContainer}>
            <Text style={styles.statusText}>Work in Progress</Text>
            <ButtonPrimary 
              title="Continue to Work"
              onPress={() => navigation.navigate(ROUTES.cleaner_attach_task_photos, {
                scheduleId: item._id,
                schedule: item,
                hostId: item.hostInfo._id
              })}
            />
          </View>
            ) : currentDate.isAfter(targetDate) || canClockInEarly ? (
              <ButtonPrimary 
                title="Clock-In"
                onPress={() => navigation.navigate(ROUTES.cleaner_clock_in, {
                  scheduleId: item._id,
                  cleaner: assignedToForCleaner,
                  schedule: item
                })}
              />
            ) : (
              <View style={styles.disabledContainer}>
                <Text style={styles.disabledText}>
                  Clock-in available at {moment(targetDate).subtract(15, 'minutes').format('h:mm A')}
                </Text>
                <Text style={styles.subText}>
                  Scheduled: {moment(item.schedule?.cleaning_time,'h:mm:ss A').format('h:mm A')}
                </Text>
              </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 0,
    marginTop:5
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
  apart_name: {
    fontWeight:'500'
  },
  apartment:{
    color:COLORS.gray,
    fontSize:13,
  },
  date:{
    marginTop:-4,
    fontSize:12,
    fontWeight:'500'
    // color:COLORS.gray
  },
  time:{
    marginTop:4,
    fontSize:12,
    // color:COLORS.gray
  },
  headerText:{
    fontSize:18
  },
  assignee:{
    fontSize:12,
    color:COLORS.gray
  },
  task_details:{
    flex: 0.7,
    alignItems: 'flex-start',
    width:'100%',
    marginTop:10
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
    fontSize:12,
    color:COLORS.primary,
    // textDecorationLine:'underline',
    fontWeight:'bold'
  },
  clockin:{
    fontSize:12,
    marginLeft:20,
    color:COLORS.primary,
    // textDecorationLine:'underline',
    fontWeight:'bold'
  },
  action:{
    flexDirection:'row',
    justifyContent:'space-evenly',
    marginTop:5,
    marginBottom: 5,
  },
  centerContent: {
    alignItems: 'center',  // Center content horizontally
    marginVertical:5
  },
  cardItem: {
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 40,
    padding: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 1,
    minHeight:200,
    justifyContent:'center',
    alignItems:'center'
 },



 inProgressContainer: {
  alignItems: 'center',
},
statusText: {
  color: COLORS.primary,
  fontSize: 12,
  marginBottom: 5,
  fontWeight: 'bold',
},
disabledContainer: {
  padding: 10,
  backgroundColor: '#f5f5f5',
  borderRadius: 5,
  marginTop: 10,
  alignItems: 'center',
},
disabledText: {
  color: COLORS.gray,
  fontSize: 12,
  textAlign: 'center',
  fontWeight: '500',
},
subText: {
  color: COLORS.light_gray,
  fontSize: 10,
  marginTop: 2,
},
  
});

export default ListItem;



