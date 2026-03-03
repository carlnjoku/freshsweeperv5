// import React, {useContext} from 'react';
// import { View,Text, StyleSheet,TouchableOpacity, FlatList } from 'react-native';
// import COLORS from '../../constants/colors';
// import moment from 'moment';
// import ROUTES from '../../constants/routes';
// import { useNavigation } from '@react-navigation/native';
// import ButtonPrimary from './ButtonPrimary';
// import { AuthContext } from '../../context/AuthContext';

// const UpcomingScheduleItem = ({item }) => {
//   const {currentUserId} = useContext(AuthContext)
//   const navigation = useNavigation();

//   const assignedToForCleaner = item.assignedTo?.find(
//     (cleaner) => cleaner.cleanerId === currentUserId
//   );

//   // console.log(assignedToForCleaner)
//   return (
   

// <View>
   
//       <View style={styles.container}>
//             <View style={styles.date_time}>
//               <Text style={styles.date}>{moment(item.schedule.cleaning_date).format('ddd MMM DD')}</Text>
//               <Text style={styles.time}>{moment(item.schedule.cleaning_time, 'h:mm:ss A').format('h:mm A')}</Text>
//             </View>
            
//             <View style={styles.dotline}>
//               <View style={styles.dot} />
//               <View style={styles.line} />
//             </View>
            
            
//             <View style={styles.task_details}>
//                 <Text bold style={styles.task}>{item.schedule.apartment_name}</Text>
//                 {/* <Text style={styles.task}>{item.schedule.apartment_name}</Text> */}
//                 <Text style={styles.apartment}>{item.schedule.address} </Text>
//                 <View style={styles.action}>

//                 <ButtonPrimary 
//                   title="Clock-In"
//                   onPress = {()=>navigation.navigate(ROUTES.cleaner_clock_in,{
//                     scheduleId:item._id,
//                     schedule:item,
//                     cleaner:assignedToForCleaner
//                   })}

//                 />
//                 </View>
//             </View>
            
//       </View>
//     </View>
        
      

//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     marginBottom: 0,
//     marginTop:5
//   },
//   dotline:{
//     flex: 0.05,
//     height:'100%',
//     alignItems: 'flex-start'
//   },
//   line: {
//     borderLeftWidth: 0.7, // Adjust the thickness of the line as needed
//     borderLeftColor: COLORS.light_gray, // Change the color of the line as needed
//     // borderStyle: 'dotted', // Set the line style to dotted
//     minHeight: 78, // Make the line extend the full height of the container
//     // marginRight: 10, // Adjust the spacing between the text and the line as needed
//     marginHorizontal:5,
//     marginVertical: 0 // Adjust vertical spacing as needed
//   },
//   date_time:{
//     flex: 0.25,
//     alignItems:'flex-end',
//     marginRight:5
//   },
//   task: {
//     fontWeight:'500'
//   },
//   apartment:{
//     color:COLORS.gray,
//     fontSize:13,
//   },
//   date:{
//     marginTop:-4,
//     fontSize:14,
//     fontWeight:'500'
//     // color:COLORS.gray
//   },
//   time:{
//     marginTop:4,
//     fontSize:12,
//     // color:COLORS.gray
//   },
//   assignee:{
//     fontSize:12,
//     color:COLORS.gray
//   },
//   task_details:{
//     flex: 0.7,
//     alignItems: 'flex-start',
//     width:'100%',
//     marginTop:-5
//   },
//   status:{
//     textTransform:'capitalize',
//     color:COLORS.light_gray
//   },
  
//   dot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: COLORS.primary,
//     marginBottom: 5, // Adjust this to control the space between the dot and the line
//   },
//   details:{
//     fontSize:14,
//     color:COLORS.primary,
//     // fontWeight:'bold'
//   },
//   clockin:{
//     fontSize:12,
//     marginLeft:20,
//     color:COLORS.primary,
//     fontWeight:'bold'
//   },
//   action:{
//     flexDirection:'row',
//     justifyContent:'space-evenly',
//     marginTop:-5,
//     marginBottom: 5,
//   }
// });

// export default UpcomingScheduleItem;



// import React, {useContext} from 'react';
// import { View,Text, StyleSheet,TouchableOpacity, FlatList } from 'react-native';
// import COLORS from '../../constants/colors';
// import moment from 'moment';
// import ROUTES from '../../constants/routes';
// import { useNavigation } from '@react-navigation/native';
// import ButtonPrimary from './ButtonPrimary';
// import { AuthContext } from '../../context/AuthContext';

// const UpcomingScheduleItem = ({ item, canClockIn = false, clockInStatus = {} }) => {
//   const {currentUserId} = useContext(AuthContext)
//   const navigation = useNavigation();

//   const assignedToForCleaner = item.assignedTo?.find(
//     (cleaner) => cleaner.cleanerId === currentUserId
//   );

//   // Format countdown message for display
//   const getCountdownMessage = () => {
//     if (clockInStatus.status === 'within_1_hour') {
//       return clockInStatus.message;
//     } else if (clockInStatus.status === 'future') {
//       const cleaningStart = new Date(`${item.schedule.cleaning_date}T${item.schedule.cleaning_time}`);
//       const now = new Date();
//       const timeDiff = cleaningStart.getTime() - now.getTime();
//       const hoursLeft = Math.floor(timeDiff / (60 * 60 * 1000));
//       const minutesLeft = Math.floor((timeDiff % (60 * 60 * 1000)) / (60 * 1000));
      
//       if (hoursLeft > 0) {
//         return `Clock in available in ${hoursLeft}h ${minutesLeft}m`;
//       } else {
//         return `Clock in available in ${minutesLeft}m`;
//       }
//     }
//     return null;
//   };

//   const countdownMessage = getCountdownMessage();

//   return (
//     <View>
//       <View style={styles.container}>
//         <View style={styles.date_time}>
//           <Text style={styles.date}>{moment(item.schedule.cleaning_date).format('ddd MMM DD')}</Text>
//           <Text style={styles.time}>{moment(item.schedule.cleaning_time, 'h:mm:ss A').format('h:mm A')}</Text>
//         </View>
        
//         <View style={styles.dotline}>
//           <View style={[
//             styles.dot, 
//             canClockIn ? styles.dotActive : styles.dotUpcoming
//           ]} />
//           <View style={styles.line} />
//         </View>
        
//         <View style={styles.task_details}>
//           <Text bold style={styles.task}>{item.schedule.apartment_name}</Text>
//           <Text style={styles.apartment}>{item.schedule.address} </Text>
          
//           {/* Clock-In Button - Only shown when canClockIn is true */}
//           {canClockIn && (
//             <View style={styles.action}>
//               <ButtonPrimary 
//                 title="Clock-In"
//                 onPress={() => navigation.navigate(ROUTES.cleaner_clock_in, {
//                   scheduleId: item._id,
//                   schedule: item,
//                   cleaner: assignedToForCleaner
//                 })}
//               />
//             </View>
//           )}
          
//           {/* Countdown Message - Shown when clock-in is not yet available */}
//           {!canClockIn && countdownMessage && (
//             <View style={styles.countdownContainer}>
//               <Text style={styles.countdownText}>{countdownMessage}</Text>
//             </View>
//           )}
          
//           {/* Past cleaning time message */}
//           {clockInStatus.status === 'past' && (
//             <View style={styles.pastContainer}>
//               <Text style={styles.pastText}>Cleaning time has passed</Text>
//             </View>
//           )}
//         </View>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     marginBottom: 0,
//     marginTop: 5
//   },
//   dotline: {
//     flex: 0.05,
//     height: '100%',
//     alignItems: 'flex-start'
//   },
//   line: {
//     borderLeftWidth: 0.7,
//     borderLeftColor: COLORS.light_gray,
//     minHeight: 78,
//     marginHorizontal: 5,
//     marginVertical: 0
//   },
//   date_time: {
//     flex: 0.25,
//     alignItems: 'flex-end',
//     marginRight: 5
//   },
//   task: {
//     fontWeight: '500'
//   },
//   apartment: {
//     color: COLORS.gray,
//     fontSize: 13,
//   },
//   date: {
//     marginTop: -4,
//     fontSize: 14,
//     fontWeight: '500'
//   },
//   time: {
//     marginTop: 4,
//     fontSize: 12,
//   },
//   assignee: {
//     fontSize: 12,
//     color: COLORS.gray
//   },
//   task_details: {
//     flex: 0.7,
//     alignItems: 'flex-start',
//     width: '100%',
//     marginTop: -5
//   },
//   status: {
//     textTransform: 'capitalize',
//     color: COLORS.light_gray
//   },
//   dot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     marginBottom: 5,
//   },
//   dotActive: {
//     backgroundColor: '#4CAF50', // Green for active clock-in
//   },
//   dotUpcoming: {
//     backgroundColor: COLORS.primary, // Original color for upcoming
//   },
//   details: {
//     fontSize: 14,
//     color: COLORS.primary,
//   },
//   clockin: {
//     fontSize: 12,
//     marginLeft: 20,
//     color: COLORS.primary,
//     fontWeight: 'bold'
//   },
//   action: {
//     flexDirection: 'row',
//     justifyContent: 'space-evenly',
//     marginTop: -5,
//     marginBottom: 5,
//   },
//   countdownContainer: {
//     backgroundColor: '#FFF3CD', // Light yellow background
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 6,
//     marginTop: 8,
//     borderWidth: 1,
//     borderColor: '#FFEAA7',
//   },
//   countdownText: {
//     color: '#856404',
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   pastContainer: {
//     backgroundColor: '#F8D7DA', // Light red background
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 6,
//     marginTop: 8,
//     borderWidth: 1,
//     borderColor: '#F5C6CB',
//   },
//   pastText: {
//     color: '#721C24',
//     fontSize: 12,
//     fontWeight: '500',
//   }
// });

// export default UpcomingScheduleItem;





// import React, {useContext} from 'react';
// import { View,Text, StyleSheet,TouchableOpacity, FlatList } from 'react-native';
// import COLORS from '../../constants/colors';
// import moment from 'moment';
// import ROUTES from '../../constants/routes';
// import { useNavigation } from '@react-navigation/native';
// import ButtonPrimary from './ButtonPrimary';
// import { AuthContext } from '../../context/AuthContext';

// const UpcomingScheduleItem = ({ item, canClockIn = false, clockInStatus = {} }) => {
//   const {currentUserId} = useContext(AuthContext)
//   const navigation = useNavigation();

//   const assignedToForCleaner = item.assignedTo?.find(
//     (cleaner) => cleaner.cleanerId === currentUserId
//   );

//   // Check if schedule or cleaner assignment is cancelled
//   const isCancelled = item.status?.toLowerCase() === 'cancelled' || 
//                      assignedToForCleaner?.status?.toLowerCase() === 'cancelled';

//   // Format countdown message for display
//   const getCountdownMessage = () => {
//     if (isCancelled) {
//       return "This job has been cancelled";
//     }
    
//     if (clockInStatus.status === 'within_1_hour') {
//       return clockInStatus.message;
//     } else if (clockInStatus.status === 'future') {
//       const cleaningStart = new Date(`${item.schedule.cleaning_date}T${item.schedule.cleaning_time}`);
//       const now = new Date();
//       const timeDiff = cleaningStart.getTime() - now.getTime();
//       const hoursLeft = Math.floor(timeDiff / (60 * 60 * 1000));
//       const minutesLeft = Math.floor((timeDiff % (60 * 60 * 1000)) / (60 * 1000));
      
//       if (hoursLeft > 0) {
//         return `Clock in available in ${hoursLeft}h ${minutesLeft}m`;
//       } else {
//         return `Clock in available in ${minutesLeft}m`;
//       }
//     }
//     return null;
//   };

//   const countdownMessage = getCountdownMessage();

//   return (
//     <View>
//       <View style={styles.container}>
//         <View style={styles.date_time}>
//           <Text style={[
//             styles.date, 
//             isCancelled && styles.cancelledText
//           ]}>
//             {moment(item.schedule.cleaning_date).format('ddd MMM DD')}
//           </Text>
//           <Text style={[
//             styles.time,
//             isCancelled && styles.cancelledText
//           ]}>
//             {moment(item.schedule.cleaning_time, 'h:mm:ss A').format('h:mm A')}
//           </Text>
//         </View>
        
//         <View style={styles.dotline}>
//           <View style={[
//             styles.dot, 
//             isCancelled ? styles.dotCancelled :
//             canClockIn ? styles.dotActive : styles.dotUpcoming
//           ]} />
//           <View style={styles.line} />
//         </View>
        
//         <View style={styles.task_details}>
//           <Text style={[
//             styles.task,
//             isCancelled && styles.cancelledText
//           ]}>
//             {item.schedule.apartment_name}
//           </Text>
//           <Text style={[
//             styles.apartment,
//             isCancelled && styles.cancelledText
//           ]}>
//             {item.schedule.address}
//           </Text>
          
//           {/* Cancelled Message - Highest priority */}
//           {isCancelled && (
//             <View style={styles.cancelledContainer}>
//               <Text style={styles.cancelledText}>Job Cancelled</Text>
//             </View>
//           )}
          
//           {/* Clock-In Button - Only shown when canClockIn is true and NOT cancelled */}
//           {!isCancelled && canClockIn && (
//             <View style={styles.action}>
//               <ButtonPrimary 
//                 title="Clock-In"
//                 onPress={() => navigation.navigate(ROUTES.cleaner_clock_in, {
//                   scheduleId: item._id,
//                   schedule: item,
//                   cleaner: assignedToForCleaner
//                 })}
//               />
//             </View>
//           )}
          
//           {/* Countdown Message - Shown when clock-in is not yet available and NOT cancelled */}
//           {!isCancelled && !canClockIn && countdownMessage && (
//             <View style={styles.countdownContainer}>
//               <Text style={styles.countdownText}>{countdownMessage}</Text>
//             </View>
//           )}
          
//           {/* Past cleaning time message - Only if NOT cancelled */}
//           {!isCancelled && clockInStatus.status === 'past' && (
//             <View style={styles.pastContainer}>
//               <Text style={styles.pastText}>Cleaning time has passed</Text>
//             </View>
//           )}
//         </View>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     marginBottom: 0,
//     marginTop: 5
//   },
//   dotline: {
//     flex: 0.05,
//     height: '100%',
//     alignItems: 'flex-start'
//   },
//   line: {
//     borderLeftWidth: 0.7,
//     borderLeftColor: COLORS.light_gray,
//     minHeight: 78,
//     marginHorizontal: 5,
//     marginVertical: 0
//   },
//   date_time: {
//     flex: 0.25,
//     alignItems: 'flex-end',
//     marginRight: 5
//   },
//   task: {
//     fontWeight: '500'
//   },
//   apartment: {
//     color: COLORS.gray,
//     fontSize: 13,
//   },
//   date: {
//     marginTop: -4,
//     fontSize: 14,
//     fontWeight: '500'
//   },
//   time: {
//     marginTop: 4,
//     fontSize: 12,
//   },
//   assignee: {
//     fontSize: 12,
//     color: COLORS.gray
//   },
//   task_details: {
//     flex: 0.7,
//     alignItems: 'flex-start',
//     width: '100%',
//     marginTop: -5
//   },
//   status: {
//     textTransform: 'capitalize',
//     color: COLORS.light_gray
//   },
//   dot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     marginBottom: 5,
//   },
//   dotActive: {
//     backgroundColor: '#4CAF50', // Green for active clock-in
//   },
//   dotUpcoming: {
//     backgroundColor: COLORS.primary, // Original color for upcoming
//   },
//   dotCancelled: {
//     backgroundColor: '#6c757d', // Gray for cancelled
//   },
//   details: {
//     fontSize: 14,
//     color: COLORS.primary,
//   },
//   clockin: {
//     fontSize: 12,
//     marginLeft: 20,
//     color: COLORS.primary,
//     fontWeight: 'bold'
//   },
//   action: {
//     flexDirection: 'row',
//     justifyContent: 'space-evenly',
//     marginTop: -5,
//     marginBottom: 5,
//   },
//   // Cancelled styles
//   cancelledContainer: {
//     backgroundColor: '#f8d7da', // Light red background
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 6,
//     marginTop: 8,
//     borderWidth: 1,
//     borderColor: '#f5c6cb',
//   },
//   cancelledText: {
//     color: '#721c24', // Dark red text
//     textDecorationLine: 'line-through',
//   },
//   // Countdown styles
//   countdownContainer: {
//     backgroundColor: '#FFF3CD', // Light yellow background
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 6,
//     marginTop: 8,
//     borderWidth: 1,
//     borderColor: '#FFEAA7',
//   },
//   countdownText: {
//     color: '#856404',
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   // Past time styles
//   pastContainer: {
//     backgroundColor: '#F8D7DA', // Light red background
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 6,
//     marginTop: 8,
//     borderWidth: 1,
//     borderColor: '#F5C6CB',
//   },
//   pastText: {
//     color: '#721C24',
//     fontSize: 12,
//     fontWeight: '500',
//   }
// });

// export default UpcomingScheduleItem;


import React, {useContext} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';
import moment from 'moment';
import ROUTES from '../../constants/routes';
import { useNavigation } from '@react-navigation/native';
import ButtonPrimary from './ButtonPrimary';
import { AuthContext } from '../../context/AuthContext';

const UpcomingScheduleItem = ({ item, canClockIn = false, clockInStatus = {} }) => {
  const {currentUserId} = useContext(AuthContext)
  const navigation = useNavigation();

  const assignedToForCleaner = item.assignedTo?.find(
    (cleaner) => cleaner.cleanerId === currentUserId
  );

  // Check if schedule is cancelled OR current user's assignment is cancelled
  const isScheduleCancelled = item.status?.toLowerCase() === 'cancelled';
  const isUserAssignmentCancelled = assignedToForCleaner?.status?.toLowerCase() === 'cancelled';
  const isCancelled = isScheduleCancelled || isUserAssignmentCancelled;

  // Format countdown message for display
  const getCountdownMessage = () => {
    if (isCancelled) {
      if (isUserAssignmentCancelled) {
        return "Your assignment has been cancelled";
      } else if (isScheduleCancelled) {
        return "This job has been cancelled";
      }
    }
    
    if (clockInStatus.status === 'within_1_hour') {
      return clockInStatus.message;
    } else if (clockInStatus.status === 'future') {
      const cleaningStart = new Date(`${item.schedule.cleaning_date}T${item.schedule.cleaning_time}`);
      const now = new Date();
      const timeDiff = cleaningStart.getTime() - now.getTime();
      const hoursLeft = Math.floor(timeDiff / (60 * 60 * 1000));
      const minutesLeft = Math.floor((timeDiff % (60 * 60 * 1000)) / (60 * 1000));
      
      if (hoursLeft > 0) {
        return `ClockIn available in ${hoursLeft}h ${minutesLeft}m`;
      } else {
        return `ClockIn available in ${minutesLeft}m`;
      }
    }
    return null;
  };

  const countdownMessage = getCountdownMessage();

  // Show different message if user's assignment was cancelled
  const getUserCancelledMessage = () => {
    if (isUserAssignmentCancelled) {
      return "Your assignment was cancelled";
    }
    return null;
  };

  const userCancelledMessage = getUserCancelledMessage();

  return (
    <View>
      <View style={styles.container}>
        <View style={styles.date_time}>
          <Text style={[
            styles.date, 
            isCancelled && styles.cancelledText
          ]}>
            {moment(item.schedule.cleaning_date).format('ddd MMM DD')}
          </Text>
          <Text style={[
            styles.time,
            isCancelled && styles.cancelledText
          ]}>
            {moment(item.schedule.cleaning_time, 'h:mm:ss A').format('h:mm A')}
          </Text>
        </View>
        
        <View style={styles.dotline}>
          <View style={[
            styles.dot, 
            isCancelled ? styles.dotCancelled :
            canClockIn ? styles.dotActive : styles.dotUpcoming
          ]} />
          <View style={styles.line} />
        </View>
        
        <View style={styles.task_details}>
          <Text style={[
            styles.task,
            isCancelled && styles.cancelledText
          ]}>
            {item.schedule.apartment_name}
          </Text>
          <Text style={[
            styles.apartment,
            isCancelled && styles.cancelledText
          ]}>
            {item.schedule.address}
          </Text>
          
          {/* User-specific cancelled message */}
          {userCancelledMessage && (
            <View style={styles.userCancelledContainer}>
              <Text style={styles.userCancelledText}>{userCancelledMessage}</Text>
            </View>
          )}
          
          {/* General cancelled message */}
          {isScheduleCancelled && !isUserAssignmentCancelled && (
            <View style={styles.cancelledContainer}>
              <Text style={styles.cancelledText}>Job Cancelled</Text>
            </View>
          )}
          
          {/* Clock-In Button - Only shown when canClockIn is true and NOT cancelled */}
          {!isCancelled && canClockIn && (
            <View style={styles.action}>
              <ButtonPrimary 
                title="Clock-In"
                onPress={() => navigation.navigate(ROUTES.cleaner_clock_in, {
                  scheduleId: item._id,
                  schedule: item,
                  cleaner: assignedToForCleaner
                })}
              />
            </View>
          )}
          
          {/* Countdown Message - Shown when clock-in is not yet available and NOT cancelled */}
          {!isCancelled && !canClockIn && countdownMessage && (
            <>
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>{countdownMessage}</Text>
            </View>
            <View style={styles.action}>
              <ButtonPrimary 
                title="View Details"
                onPress={() => navigation.navigate(ROUTES.cleaner_schedule_details_view, {
                  item: item._id,
                  scheduleId: item._id
              })}
              />
            </View>
            </>
          )}
          
          {/* Past cleaning time message - Only if NOT cancelled */}
          {!isCancelled && clockInStatus.status === 'past' && (
            <View style={styles.pastContainer}>
              <Text style={styles.pastText}>Cleaning time has passed</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 0,
    marginTop: 5
  },
  dotline: {
    flex: 0.05,
    height: '100%',
    alignItems: 'flex-start'
  },
  line: {
    borderLeftWidth: 0.7,
    borderLeftColor: COLORS.light_gray,
    minHeight: 78,
    marginHorizontal: 5,
    marginVertical: 0
  },
  date_time: {
    flex: 0.25,
    alignItems: 'flex-end',
    marginRight: 5
  },
  task: {
    fontWeight: '500'
  },
  apartment: {
    color: COLORS.gray,
    fontSize: 13,
  },
  date: {
    marginTop: -4,
    fontSize: 14,
    fontWeight: '500'
  },
  time: {
    marginTop: 4,
    fontSize: 12,
  },
  task_details: {
    flex: 0.7,
    alignItems: 'flex-start',
    width: '100%',
    marginTop: -5
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  dotActive: {
    backgroundColor: '#4CAF50',
  },
  dotUpcoming: {
    backgroundColor: COLORS.primary,
  },
  dotCancelled: {
    backgroundColor: '#6c757d',
  },
  action: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: -5,
    marginBottom: 5,
  },
  // User-specific cancelled styles
  userCancelledContainer: {
    backgroundColor: '#fff3cd', // Yellow background for user-specific cancellation
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  userCancelledText: {
    color: '#856404', // Dark yellow text
    fontWeight: '500',
  },
  // General cancelled styles
  cancelledContainer: {
    backgroundColor: '#f8d7da',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  cancelledText: {
    color: '#721c24',
    textDecorationLine: 'line-through',
  },
  // Countdown styles
  countdownContainer: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  countdownText: {
    color: '#856404',
    fontSize: 12,
    fontWeight: '500',
  },
  // Past time styles
  pastContainer: {
    backgroundColor: '#F8D7DA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F5C6CB',
  },
  pastText: {
    color: '#721C24',
    fontSize: 12,
    fontWeight: '500',
  }
});

export default UpcomingScheduleItem;