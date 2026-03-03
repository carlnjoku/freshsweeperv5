// import React from 'react'
// // import Text from '../Text';
// import { View, Text,StyleSheet,TouchableOpacity, FlatList, Image } from 'react-native';
// import { Avatar} from 'react-native-paper';
// import COLORS from '../../constants/colors';
// import { MaterialCommunityIcons, FontAwesome, AntDesign } from '@expo/vector-icons';
// import ChipWithBackground from '../shared/ChipWithBackground';
// import { useNavigation } from '@react-navigation/native';
// import ROUTES from '../../constants/routes';
// import moment from 'moment';
// import CircleIconNoLabel from '../shared/CirecleIconNoLabel';


// export default function OngoingWorkListItem({item}) {

//   const navigation = useNavigation();
//     console.log("iteee1....................m")
//     // console.log(JSON.stringify(item, null, 2))
//     console.log("iteee...................m")
//   return (
//     <View>
      
//           <TouchableOpacity 
//             onPress={() =>navigation.navigate(ROUTES.host_task_progress,{
//               scheduleId:item._id,
//               schedule:item
//             })}
//           >
//               <View style={{flexDirection: 'row', paddingVertical:5}}>
//                 <View style={{flex: 0.1}}>
//                 {item.assignedTo ? 
                          
//                             <Avatar.Image 
//                                 source={{uri:item.assignedTo.avatar}}
//                                 size={36}
//                                 style={{height:36, width:36, borderRadius:18, marginLeft: -1, borderWidth:1, borderColor:COLORS.light_gray_1, backgroundColor:COLORS.light_gray, marginBottom:10}} 
//                             />
//                             :
      
//                             <Avatar.Image
//                               size={40}
//                               source={require('../../assets/images/default_avatar.png')}
//                               style={{ backgroundColor: COLORS.gray }}
//                             />
                        
//                       }
//                 </View>
//                 <View style={{flex: 0.8}}>
//                     <View style={{flexDirection:'row', justifyContent:'space-between'}}>
//                         <Text bold  style={{marginLeft:5, fontSize:15, color:COLORS.gray}}> 
//                           {item.schedule.apartment_name} 
//                          </Text>
                        
//                       </View>
//                     {/* <Text style={{marginLeft:10, fontSize:13, color:COLORS.gray}}>{item.location.city}, {item.location.region}</Text> */}
                    
                   

//                     <View style={{flexDirection:'column', justifyContent:'space-between', alignItems:'flex-start', marginTop:2}}> 
                      
//                       <View style={styles.schedule}>
//                         <Text style={{fontSize:12, marginRight:10}}>{moment(item.schedule.cleaning_date, 'ddd MMM DD YYYY').format('ddd MMM DD')}</Text>
//                         <Text style={{fontSize:12, color:COLORS.gray}}>{moment(item.schedule.cleaning_time, 'h:mm:ss A').format('h:mm A')}</Text>
//                       </View>
                      
//                     </View>
//                     <View style={{width:"50%"}}>
//                       <ChipWithBackground label="Track progress" backgroundColor={COLORS.primary_light_1} color={COLORS.gray}  /> 
//                     </View>
//                     <View style={{flexDirection:'row', justifyContent:'space-between', marginTop:3}}>
                      
//                       <View style={{flexDirection:'row', flex: 0.15, marginLeft:20}}>
                      
                      
//                     </View>
                    
//                 </View>

                
                    
//                 </View>
//                 <View style={{flex: 0.1}}>
//                   <View style={styles.rightContainer}>
//                     <CircleIconNoLabel
//                       iconName="chevron-right"
//                       buttonSize={30}
//                       radiusSise={15}
//                       iconSize={16}
//                       onPress={() =>navigation.navigate(ROUTES.host_task_progress,{
//                         scheduleId:item._id,
//                         schedule:item
//                       })}
//                     />
//                   </View>
//                 </View>
//             </View>
//           </TouchableOpacity>
              
  
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//     container: {
//       flexDirection: 'row',
//       marginBottom: 0,
//       marginTop:5
//     },
//     dotline:{
//       flex: 0.05,
//       height:'100%',
//       alignItems: 'flex-start'
//     },
//     line: {
//       borderLeftWidth: 0.7, // Adjust the thickness of the line as needed
//       borderLeftColor: COLORS.light_gray, // Change the color of the line as needed
//       // borderStyle: 'dotted', // Set the line style to dotted
//       minHeight: 78, // Make the line extend the full height of the container
//       // marginRight: 10, // Adjust the spacing between the text and the line as needed
//       marginHorizontal:5,
//       marginVertical: 0 // Adjust vertical spacing as needed
//     },
//     date_time:{
//       flex: 0.25,
//       alignItems:'flex-end',
//       marginRight:5
//     },
//     task: {
//       fontWeight:'500'
//     },
//     apartment:{
//       color:COLORS.gray,
//       fontSize:13,
//     },
//     date:{
//       marginTop:-4,
//       fontSize:14,
//       fontWeight:'500'
//       // color:COLORS.gray
//     },
//     time:{
//       marginTop:4,
//       fontSize:12,
//       // color:COLORS.gray
//     },
//     schedule:{
//       flexDirection: 'row',
//       justifyContent:'space-between',
//       alignItems:'center',
//       marginLeft:5,
//     },
//     assignee:{
//       fontSize:12,
//       color:COLORS.gray
//     },
//     task_details:{
//       flex: 0.7,
//       alignItems: 'flex-start',
//       width:'100%',
//       marginTop:10
//     },
//     status:{
//       textTransform:'capitalize',
//       color:COLORS.light_gray
//     },
    
//     dot: {
//       width: 10,
//       height: 10,
//       borderRadius: 5,
//       backgroundColor: COLORS.primary,
//       marginBottom: 5, // Adjust this to control the space between the dot and the line
//     },
//     details:{
//       fontSize:12,
//       color:COLORS.primary,
//       // textDecorationLine:'underline',
//       fontWeight:'bold'
//     },
//     clockin:{
//       fontSize:12,
//       marginLeft:20,
//       color:COLORS.primary,
//       // textDecorationLine:'underline',
//       fontWeight:'bold'
//     },
//     action:{
//       flexDirection:'row',
//       justifyContent:'space-evenly',
//       marginTop:5,
//       marginBottom: 5,
//     },
//     rightContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'flex-end',
//       paddingLeft: 10,
//       marginRight:0
//     },
//   });
  








 
// import React from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   TouchableOpacity, 
//   Image 
// } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// import { useNavigation } from '@react-navigation/native';
// import ROUTES from '../../constants/routes';
// import moment from 'moment';

// export default function OngoingWorkListItem({ item }) {
//   const navigation = useNavigation();

//   const getStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'completed':
//         return COLORS.success;
//       case 'in_progress':
//         return COLORS.warning;
//       case 'pending':
//         return COLORS.gray;
//       default:
//         return COLORS.primary;
//     }
//   };

//   const getStatusText = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'completed':
//         return 'Completed';
//       case 'in_progress':
//         return 'In Progress';
//       case 'pending':
//         return 'Pending';
//       default:
//         return 'Scheduled';
//     }
//   };

//   return (
//     <TouchableOpacity 
//       style={styles.cardContainer}
//       onPress={() => navigation.navigate(ROUTES.host_task_progress, {
//         scheduleId: item._id,
//         schedule: item
//       })}
//       activeOpacity={0.7}
//     >
//       {/* Header Section */}
//       <View style={styles.header}>
//         <View style={styles.propertyInfo}>
//           <Text style={styles.propertyName} numberOfLines={1}>
//             {item.schedule?.apartment_name || 'Unknown Property'}
//           </Text>
//           <View style={styles.statusBadge}>
//             <View 
//               style={[
//                 styles.statusDot, 
//                 { backgroundColor: getStatusColor(item.status) }
//               ]} 
//             />
//             <Text style={styles.statusText}>
//               {getStatusText(item.status)}
//             </Text>
//           </View>
//         </View>
        
//         <View style={styles.avatarContainer}>
//           {item.assignedTo?.avatar ? (
//             <Image 
//               source={{ uri: item.assignedTo.avatar }}
//               style={styles.avatar}
//             />
//           ) : (
//             <View style={styles.defaultAvatar}>
//               <MaterialCommunityIcons 
//                 name="account" 
//                 size={16} 
//                 color={COLORS.gray} 
//               />
//             </View>
//           )}
//         </View>
//       </View>

//       {/* Schedule Details */}
//       <View style={styles.detailsContainer}>
//         <View style={styles.scheduleRow}>
//           <View style={styles.scheduleItem}>
//             <MaterialCommunityIcons 
//               name="calendar-blank-outline" 
//               size={16} 
//               color={COLORS.gray} 
//             />
//             <Text style={styles.scheduleText}>
//               {moment(item.schedule?.cleaning_date).format('MMM DD, YYYY')}
//             </Text>
//           </View>
          
//           <View style={styles.scheduleItem}>
//             <MaterialCommunityIcons 
//               name="clock-outline" 
//               size={16} 
//               color={COLORS.gray} 
//             />
//             <Text style={styles.scheduleText}>
//               {moment(item.schedule?.cleaning_time, 'h:mm:ss A').format('h:mm A')}
//             </Text>
//           </View>
//         </View>

//         {/* Cleaner Info */}
//         {item.assignedTo && (
//           <View style={styles.cleanerInfo}>
//             <MaterialCommunityIcons 
//               name="account-outline" 
//               size={14} 
//               color={COLORS.gray} 
//             />
//             <Text style={styles.cleanerText} numberOfLines={1}>
//               {item.assignedTo.firstname} {item.assignedTo.lastname}
//             </Text>
//           </View>
//         )}
//       </View>

//       {/* Footer with Action */}
//       <View style={styles.footer}>
//         <TouchableOpacity 
//           style={styles.trackButton}
//           onPress={() => navigation.navigate(ROUTES.host_task_progress, {
//             scheduleId: item._id,
//             schedule: item
//           })}
//         >
//           <MaterialCommunityIcons 
//             name="progress-clock" 
//             size={16} 
//             color={COLORS.primary} 
//           />
//           <Text style={styles.trackButtonText}>Track Progress</Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity style={styles.arrowButton}>
//           <MaterialCommunityIcons 
//             name="chevron-right" 
//             size={20} 
//             color={COLORS.gray} 
//           />
//         </TouchableOpacity>
//       </View>
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   cardContainer: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 16,
//     marginVertical: 6,
//     marginHorizontal: 16,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     elevation: 5,
//     borderWidth: 1,
//     borderColor: COLORS.light_gray_1,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 12,
//   },
//   propertyInfo: {
//     flex: 1,
//     marginRight: 12,
//   },
//   propertyName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 8,
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     alignSelf: 'flex-start',
//     backgroundColor: COLORS.light_gray_1,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },
//   statusDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     marginRight: 6,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: COLORS.dark,
//     textTransform: 'capitalize',
//   },
//   avatarContainer: {
//     alignItems: 'center',
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     borderWidth: 2,
//     borderColor: COLORS.light_gray_1,
//   },
//   defaultAvatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: COLORS.light_gray_1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: COLORS.light_gray,
//   },
//   detailsContainer: {
//     marginBottom: 16,
//   },
//   scheduleRow: {
//     flexDirection: 'row',
//     marginBottom: 8,
//     gap: 16,
//   },
//   scheduleItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.light_gray_1,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 8,
//     flex: 1,
//   },
//   scheduleText: {
//     fontSize: 13,
//     color: COLORS.dark,
//     marginLeft: 6,
//     fontWeight: '500',
//   },
//   cleanerInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.light_gray_1,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 8,
//     alignSelf: 'flex-start',
//   },
//   cleanerText: {
//     fontSize: 13,
//     color: COLORS.gray,
//     marginLeft: 6,
//     fontWeight: '500',
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderTopWidth: 1,
//     borderTopColor: COLORS.light_gray_1,
//     paddingTop: 12,
//   },
//   trackButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary_light_1,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 8,
//     flex: 1,
//     marginRight: 12,
//   },
//   trackButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginLeft: 6,
//   },
//   arrowButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: COLORS.light_gray_1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });




// import React from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   TouchableOpacity, 
//   Image 
// } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// import { useNavigation } from '@react-navigation/native';
// import ROUTES from '../../constants/routes';
// import moment from 'moment';


// export default function OngoingWorkListItem({ item }) {
//   const navigation = useNavigation();
//   console.log(item.assignedTo)
//   // Sample progress data - replace with your actual data
//   const progressData = item.progress || {
//     completedTasks: 5,
//     totalTasks: 39,
//     percentage: 40
//   };

//   // / Determine current status for timeline
//   // const getCurrentStatus = () => {
//   //   if (item.status === 'completed') return 'completed';
//   //   if (item.assignedTo) return 'accepted';
//   //   return 'published';
//   // };

 

//   const getStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'completed':
//         return COLORS.success;
//       case 'in_progress':
//         return COLORS.warning;
//       case 'pending':
//         return COLORS.gray;
//       default:
//         return COLORS.primary;
//     }
//   };

//   const getStatusText = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'completed':
//         return 'Completed';
//       case 'in_progress':
//         return 'In Progress';
//       case 'pending':
//         return 'Pending';
//       default:
//         return 'Scheduled';
//     }
//   };

//   return (
//     <TouchableOpacity 
//       style={styles.cardContainer}
//       onPress={() => navigation.navigate(ROUTES.host_task_progress, {
//         scheduleId: item._id,
//         schedule: item
//       })}
//       activeOpacity={0.7}
//     >
//       {/* Header Section */}
//       <View style={styles.header}>
//         <View style={styles.propertyInfo}>
//           <Text style={styles.propertyName} numberOfLines={1}>
//             {item.schedule?.apartment_name || 'Unknown Property'}
//           </Text>
//           <View style={styles.statusBadge}>
//             <View 
//               style={[
//                 styles.statusDot, 
//                 { backgroundColor: getStatusColor(item.status) }
//               ]} 
//             />
//             <Text style={styles.statusText}>
//               {getStatusText(item.status)}
//             </Text>
//           </View>
//         </View>
        
//         <View style={styles.avatarContainer}>
//           {item.assignedTo?.avatar ? (
//             <Image 
//               source={{ uri: item.assignedTo.avatar }}
//               style={styles.avatar}
//             />
//           ) : (
//             <View style={styles.defaultAvatar}>
//               <MaterialCommunityIcons 
//                 name="account" 
//                 size={16} 
//                 color={COLORS.gray} 
//               />
//             </View>
//           )}
//         </View>
//       </View>

//       {/* Schedule Details */}
//       <View style={styles.detailsContainer}>
//         <View style={styles.scheduleRow}>
//           <View style={styles.scheduleItem}>
//             <MaterialCommunityIcons 
//               name="calendar-blank-outline" 
//               size={16} 
//               color={COLORS.gray} 
//             />
//             <Text style={styles.scheduleText}>
//               {moment(item.schedule?.cleaning_date).format('MMM DD, YYYY')}
//             </Text>
//           </View>
          
//           <View style={styles.scheduleItem}>
//             <MaterialCommunityIcons 
//               name="clock-outline" 
//               size={16} 
//               color={COLORS.gray} 
//             />
//             <Text style={styles.scheduleText}>
//               {moment(item.schedule?.cleaning_time, 'h:mm:ss A').format('h:mm A')}
//             </Text>
//           </View>
//         </View>

//         {/* Cleaner Info */}
//         {item.assignedTo && (
//           <View style={styles.cleanerInfo}>
//             <MaterialCommunityIcons 
//               name="account-outline" 
//               size={14} 
//               color={COLORS.gray} 
//             />
//             <Text style={styles.cleanerText} numberOfLines={1}>
//               {item.assignedTo.firstname} {item.assignedTo.lastname}
//             </Text>
//           </View>
//         )}
//       </View>

//       {/* Progress Bar Section */}
//       {/* <ProgressBar progress={progressData} />
//       <CompactProgressBar progress={progressData} /> */}

 
   

//       {/* Footer with Action */}
//       <View style={styles.footer}>
//         <TouchableOpacity 
//           style={styles.trackButton}
//           onPress={() => navigation.navigate(ROUTES.host_task_progress, {
//             scheduleId: item._id,
//             schedule: item
//           })}
//         >
//           <MaterialCommunityIcons 
//             name="progress-clock" 
//             size={16} 
//             color={COLORS.primary} 
//           />
//           <Text style={styles.trackButtonText}>Track Progress</Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity style={styles.arrowButton}>
//           <MaterialCommunityIcons 
//             name="chevron-right" 
//             size={20} 
//             color={COLORS.gray} 
//           />
//         </TouchableOpacity>
//       </View>
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   cardContainer: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 16,
//     marginVertical: 6,
//     marginHorizontal: 16,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     elevation: 5,
//     borderWidth: 1,
//     borderColor: COLORS.light_gray_1,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 12,
//   },
//   propertyInfo: {
//     flex: 1,
//     marginRight: 12,
//   },
//   propertyName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 8,
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     alignSelf: 'flex-start',
//     backgroundColor: COLORS.light_gray_1,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },
//   statusDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     marginRight: 6,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: COLORS.dark,
//     textTransform: 'capitalize',
//   },
//   avatarContainer: {
//     alignItems: 'center',
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     borderWidth: 2,
//     borderColor: COLORS.light_gray_1,
//   },
//   defaultAvatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: COLORS.light_gray_1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: COLORS.light_gray,
//   },
//   detailsContainer: {
//     marginBottom: 16,
//   },
//   scheduleRow: {
//     flexDirection: 'row',
//     marginBottom: 8,
//     gap: 16,
//   },
//   scheduleItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.light_gray_1,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 8,
//     flex: 1,
//   },
//   scheduleText: {
//     fontSize: 13,
//     color: COLORS.dark,
//     marginLeft: 6,
//     fontWeight: '500',
//   },
//   cleanerInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.light_gray_1,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 8,
//     alignSelf: 'flex-start',
//   },
//   cleanerText: {
//     fontSize: 13,
//     color: COLORS.gray,
//     marginLeft: 6,
//     fontWeight: '500',
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderTopWidth: 1,
//     borderTopColor: COLORS.light_gray_1,
//     paddingTop: 12,
//   },
//   trackButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary_light_1,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 8,
//     flex: 1,
//     marginRight: 12,
//   },
//   trackButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginLeft: 6,
//   },
//   arrowButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: COLORS.light_gray_1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });






// import React from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   TouchableOpacity, 
//   Image 
// } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// import { useNavigation } from '@react-navigation/native';
// import ROUTES from '../../constants/routes';
// import moment from 'moment';
// // import CompactProgressBar from './CompactProgressBar';
// import CompactProgressBar from '../shared/CompactProgressBar';

// export default function OngoingWorkListItem({ item }) {
//   const navigation = useNavigation();
  

//   const getStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'completed':
//         return COLORS.success;
//       case 'in_progress':
//         return COLORS.warning;
//       case 'pending':
//         return COLORS.gray;
//       default:
//         return COLORS.primary;
//     }
//   };

//   const getStatusText = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'completed':
//         return 'Completed';
//       case 'in_progress':
//         return 'In Progress';
//       case 'pending':
//         return 'Pending';
//       default:
//         return 'Scheduled';
//     }
//   };

//   // Calculate total progress across all groups
//   const calculateTotalProgress = () => {
//     if (!item.assignedTo || !Array.isArray(item.assignedTo)) {
//       return { completedTasks: 0, totalTasks: 0, percentage: 0 };
//     }

//     let totalCompleted = 0;
//     let totalTasks = 0;

//     item.assignedTo.forEach(group => {
//       if (group.progress) {
//         totalCompleted += group.progress.completedTasks || 0;
//         totalTasks += group.progress.totalTasks || 0;
//       }
//     });

//     const percentage = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

//     return {
//       completedTasks: totalCompleted,
//       totalTasks: totalTasks,
//       percentage: percentage
//     };
//   };

//   const totalProgress = calculateTotalProgress();

//   return (
//     <TouchableOpacity 
//       style={styles.cardContainer}
//       onPress={() => navigation.navigate(ROUTES.host_task_progress, {
//         scheduleId: item._id,
//         schedule: item
//       })}
//       activeOpacity={0.7}
//     >
//       {/* Header Section */}
//       <View style={styles.header}>
//         <View style={styles.propertyInfo}>
//           <Text style={styles.propertyName} numberOfLines={1}>
//             {item.schedule?.apartment_name || 'Unknown Property'}
//           </Text>
//           <View style={styles.statusBadge}>
//             <View 
//               style={[
//                 styles.statusDot, 
//                 { backgroundColor: getStatusColor(item.status) }
//               ]} 
//             />
//             <Text style={styles.statusText}>
//               {getStatusText(item.status)}
//             </Text>
//           </View>
//         </View>
        
//         <View style={styles.cleanerCountContainer}>
//           <MaterialCommunityIcons 
//             name="account-group" 
//             size={16} 
//             color={COLORS.primary} 
//           />
//           <Text style={styles.cleanerCountText}>
//             {item.assignedTo?.length || 0} group{item.assignedTo?.length !== 1 ? 's' : ''}
//           </Text>
//         </View>
//       </View>

//       {/* Schedule Details */}
//       <View style={styles.detailsContainer}>
//         <View style={styles.scheduleRow}>
//           <View style={styles.scheduleItem}>
//             <MaterialCommunityIcons 
//               name="calendar-blank-outline" 
//               size={16} 
//               color={COLORS.gray} 
//             />
//             <Text style={styles.scheduleText}>
//               {moment(item.schedule?.cleaning_date).format('MMM DD, YYYY')}
//             </Text>
//           </View>
          
//           <View style={styles.scheduleItem}>
//             <MaterialCommunityIcons 
//               name="clock-outline" 
//               size={16} 
//               color={COLORS.gray} 
//             />
//             <Text style={styles.scheduleText}>
//               {moment(item.schedule?.cleaning_time, 'h:mm:ss A').format('h:mm A')}
//             </Text>
//           </View>
//         </View>
//       </View>

//       {/* Total Progress Bar */}
//       <View style={styles.totalProgressContainer}>
//         <View style={styles.totalProgressHeader}>
//           <Text style={styles.totalProgressTitle}>Overall Progress</Text>
//           <Text style={styles.totalProgressPercentage}>{totalProgress.percentage}%</Text>
//         </View>
//         <CompactProgressBar 
//           progress={totalProgress} 
//           height={8}
//           showPercentage={false}
//         />
//         <Text style={styles.totalProgressText}>
//           {totalProgress.completedTasks}/{totalProgress.totalTasks} tasks completed
//         </Text>
//       </View>

//       {/* Cleaner Groups Progress */}
//       {item.assignedTo && item.assignedTo.length > 0 && (
//         <View style={styles.groupsContainer}>
//           <Text style={styles.groupsTitle}>Cleaner Groups Progress</Text>
//           {item.assignedTo.map((group, index) => (
//             <View key={group.group || index} style={styles.groupItem}>
//               <View style={styles.groupHeader}>
//                 <View style={styles.groupInfo}>
//                   <MaterialCommunityIcons 
//                     name="account-group" 
//                     size={16} 
//                     color={COLORS.primary} 
//                   />
//                   <Text style={styles.groupName}>
//                     {group.group ? group.group.replace('_', ' ').toUpperCase() : `Group ${index + 1}`}
//                   </Text>
//                   <Text style={styles.groupStats}>
//                     {group.progress?.completedTasks || 0}/{group.progress?.totalTasks || 0} tasks
//                   </Text>
//                 </View>
//                 <Text style={styles.groupPercentage}>
//                   {group.progress?.percentage || 0}%
//                 </Text>
//               </View>
//               <CompactProgressBar 
//                 progress={group.progress || { completedTasks: 0, totalTasks: 0, percentage: 0 }} 
//                 height={6}
//                 showPercentage={false}
//               />
//               <View style={styles.groupDetails}>
//                 <Text style={styles.roomsText}>
//                   Rooms: {group.checklist?.rooms?.join(', ') || 'No rooms assigned'}
//                 </Text>
//                 {group.checklist?.extras && group.checklist.extras.length > 0 && (
//                   <Text style={styles.extrasText}>
//                     Extras: {group.checklist.extras.join(', ')}
//                   </Text>
//                 )}
//               </View>
//             </View>
//           ))}
//         </View>
//       )}

//       {/* Footer with Action */}
//       <View style={styles.footer}>
//         <TouchableOpacity 
//           style={styles.trackButton}
//           onPress={() => navigation.navigate(ROUTES.host_task_progress, {
//             scheduleId: item._id,
//             schedule: item
//           })}
//         >
//           <MaterialCommunityIcons 
//             name="progress-clock" 
//             size={16} 
//             color={COLORS.primary} 
//           />
//           <Text style={styles.trackButtonText}>Track Detailed Progress</Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity style={styles.arrowButton}>
//           <MaterialCommunityIcons 
//             name="chevron-right" 
//             size={20} 
//             color={COLORS.gray} 
//           />
//         </TouchableOpacity>
//       </View>
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   cardContainer: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 16,
//     marginVertical: 6,
//     marginHorizontal: 16,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     elevation: 5,
//     borderWidth: 1,
//     borderColor: COLORS.light_gray_1,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 12,
//   },
//   propertyInfo: {
//     flex: 1,
//     marginRight: 12,
//   },
//   propertyName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 8,
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     alignSelf: 'flex-start',
//     backgroundColor: COLORS.light_gray_1,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },
//   statusDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     marginRight: 6,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: COLORS.dark,
//     textTransform: 'capitalize',
//   },
//   cleanerCountContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary_light_1,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },
//   cleanerCountText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginLeft: 4,
//   },
//   detailsContainer: {
//     marginBottom: 16,
//   },
//   scheduleRow: {
//     flexDirection: 'row',
//     marginBottom: 8,
//     gap: 16,
//   },
//   scheduleItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.light_gray_1,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 8,
//     flex: 1,
//   },
//   scheduleText: {
//     fontSize: 13,
//     color: COLORS.dark,
//     marginLeft: 6,
//     fontWeight: '500',
//   },
//   totalProgressContainer: {
//     marginBottom: 16,
//     padding: 12,
//     backgroundColor: COLORS.light_gray_1 + '20',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: COLORS.light_gray_1,
//   },
//   totalProgressHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   totalProgressTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.dark,
//   },
//   totalProgressPercentage: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },
//   totalProgressText: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginTop: 6,
//     textAlign: 'center',
//   },
//   groupsContainer: {
//     marginBottom: 16,
//   },
//   groupsTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 12,
//   },
//   groupItem: {
//     backgroundColor: COLORS.white,
//     padding: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: COLORS.light_gray_1,
//     marginBottom: 8,
//   },
//   groupHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   groupInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   groupName: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginLeft: 6,
//     marginRight: 8,
//   },
//   groupStats: {
//     fontSize: 12,
//     color: COLORS.gray,
//   },
//   groupPercentage: {
//     fontSize: 13,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },
//   groupDetails: {
//     marginTop: 8,
//   },
//   roomsText: {
//     fontSize: 11,
//     color: COLORS.gray,
//     marginBottom: 2,
//   },
//   extrasText: {
//     fontSize: 11,
//     color: COLORS.gray,
//     fontStyle: 'italic',
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderTopWidth: 1,
//     borderTopColor: COLORS.light_gray_1,
//     paddingTop: 12,
//   },
//   trackButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary_light_1,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 8,
//     flex: 1,
//     marginRight: 12,
//   },
//   trackButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginLeft: 6,
//   },
//   arrowButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: COLORS.light_gray_1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });







import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../constants/routes';
import moment from 'moment';
import CompactProgressBar from '../shared/CompactProgressBar';

export default function OngoingWorkListItem({ item }) {
  const navigation = useNavigation();

  
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return COLORS.success;
      case 'in_progress':
        return COLORS.warning;
      case 'pending':
        return COLORS.gray;
      default:
        return COLORS.primary;
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      default:
        return 'Scheduled';
    }
  };

  // Get first name and last name initial
  const getCleanerDisplayName = (cleaner) => {
    if (cleaner.firstname && cleaner.lastname) {
      return `${cleaner.firstname} ${cleaner.lastname.charAt(0)}.`;
    }
    if (cleaner.firstname) {
      return cleaner.firstname;
    }
    if (cleaner.group) {
      return cleaner.group.replace('_', ' ').toUpperCase();
    }
    return 'Cleaner';
  };

  return (
    <TouchableOpacity 
      style={styles.cardContainer}
      onPress={() => navigation.navigate(ROUTES.host_task_progress, {
        scheduleId: item._id,
        schedule: item,
        mode: "in_progress"
      })}
      activeOpacity={0.7}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyName} numberOfLines={1}>
            {item.schedule?.apartment_name || 'Unknown Property'}
          </Text>
          <View style={styles.statusBadge}>
            <View 
              style={[
                styles.statusDot, 
                { backgroundColor: getStatusColor(item.status) }
              ]} 
            />
            <Text style={styles.statusText}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
        
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeItem}>
            <MaterialCommunityIcons 
              name="calendar-blank-outline" 
              size={14} 
              color={COLORS.gray} 
            />
            <Text style={styles.dateTimeText}>
              {moment(item.schedule?.cleaning_date).format('MMM DD')}
            </Text>
          </View>
          
          <View style={styles.dateTimeItem}>
            <MaterialCommunityIcons 
              name="clock-outline" 
              size={14} 
              color={COLORS.gray} 
            />
            <Text style={styles.dateTimeText}>
              {moment(item.schedule?.cleaning_time, 'h:mm:ss A').format('h:mm A')}
            </Text>
          </View>
        </View>
      </View>

      {/* Cleaners List */}
      {item.assignedTo && item.assignedTo.length > 0 ? (
        <View style={styles.cleanersContainer}>
          {item.assignedTo.map((cleaner, index) => {
            const progress = cleaner.progress || { completedTasks: 0, totalTasks: 0, percentage: 0 };
            
            return (
              <View key={cleaner.group || index} style={styles.cleanerItem}>
                
                {/* Cleaner Avatar and Name */}
                <View style={styles.cleanerInfo}>
                  <View style={styles.avatarContainer}>
                    {cleaner.avatar ? (
                      <Image 
                        source={{ uri: cleaner.avatar }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={styles.defaultAvatar}>
                        <MaterialCommunityIcons 
                          name="account" 
                          size={16} 
                          color={COLORS.gray} 
                        />
                      </View>
                    )}
                  </View>
                  <Text style={styles.cleanerName} numberOfLines={1}>
                    {getCleanerDisplayName(cleaner)}
                  </Text>
                </View>

                {/* Progress Bar and Percentage */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressPercentage}>
                      {progress.percentage}%
                    </Text>
                  </View>
                  <CompactProgressBar 
                    progress={progress} 
                    height={6}
                    showPercentage={false}
                  />
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.noCleanerContainer}>
          <MaterialCommunityIcons 
            name="account-search" 
            size={24} 
            color={COLORS.light_gray} 
          />
          <Text style={styles.noCleanerText}>No cleaners assigned</Text>
        </View>
      )}

      {/* Footer with Action */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.trackButton}
          onPress={() => navigation.navigate(ROUTES.host_task_progress, {
            scheduleId: item._id,
            schedule: item,
            mode:"in_progress"
          })}
        >
          <MaterialCommunityIcons 
            name="progress-clock" 
            size={16} 
            color={COLORS.primary} 
          />
          <Text style={styles.trackButtonText}>Track Progress</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.arrowButton}>
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={20} 
            color={COLORS.gray} 
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.light_gray_1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  propertyInfo: {
    flex: 1,
    marginRight: 12,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.light_gray_1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.dark,
    textTransform: 'capitalize',
  },
  dateTimeContainer: {
    alignItems: 'flex-end',
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateTimeText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 4,
    fontWeight: '500',
  },
  cleanersContainer: {
    marginBottom: 16,
  },
  cleanerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light_gray_1,
  },
  cleanerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.light_gray_1,
  },
  defaultAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.light_gray_1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.light_gray,
  },
  cleanerName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.dark,
    flex: 1,
  },
  progressContainer: {
    width: 100,
    alignItems: 'flex-end',
  },
  progressHeader: {
    marginBottom: 6,
  },
  progressPercentage: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  noCleanerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 16,
  },
  noCleanerText: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0,
    borderTopColor: COLORS.light_gray_1,
    paddingTop: 12,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary_light_1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 12,
  },
  trackButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 6,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.light_gray_1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});