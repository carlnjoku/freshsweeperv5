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

//   // Get first name and last name initial
//   const getCleanerDisplayName = (cleaner) => {
//     if (cleaner.firstname && cleaner.lastname) {
//       return `${cleaner.firstname} ${cleaner.lastname.charAt(0)}.`;
//     }
//     if (cleaner.firstname) {
//       return cleaner.firstname;
//     }
//     if (cleaner.group) {
//       return cleaner.group.replace('_', ' ').toUpperCase();
//     }
//     return 'Cleaner';
//   };

//   return (
//     <TouchableOpacity 
//       style={styles.cardContainer}
//       onPress={() => navigation.navigate(ROUTES.host_task_progress, {
//         scheduleId: item._id,
//         schedule: item,
//         mode: "in_progress"
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
        
//         <View style={styles.dateTimeContainer}>
//           <View style={styles.dateTimeItem}>
//             <MaterialCommunityIcons 
//               name="calendar-blank-outline" 
//               size={14} 
//               color={COLORS.gray} 
//             />
//             <Text style={styles.dateTimeText}>
//               {moment(item.schedule?.cleaning_date).format('MMM DD')}
//             </Text>
//           </View>
          
//           <View style={styles.dateTimeItem}>
//             <MaterialCommunityIcons 
//               name="clock-outline" 
//               size={14} 
//               color={COLORS.gray} 
//             />
//             <Text style={styles.dateTimeText}>
//               {moment(item.schedule?.cleaning_time, 'h:mm:ss A').format('h:mm A')}
//             </Text>
//           </View>
//         </View>
//       </View>

//       {/* Cleaners List */}
//       {item.assignedTo && item.assignedTo.length > 0 ? (
//         <View style={styles.cleanersContainer}>
//           {item.assignedTo.map((cleaner, index) => {
//             const progress = cleaner.progress || { completedTasks: 0, totalTasks: 0, percentage: 0 };
            
//             return (
//               <View key={cleaner.group || index} style={styles.cleanerItem}>
                
//                 {/* Cleaner Avatar and Name */}
//                 <View style={styles.cleanerInfo}>
//                   <View style={styles.avatarContainer}>
//                     {cleaner.avatar ? (
//                       <Image 
//                         source={{ uri: cleaner.avatar }}
//                         style={styles.avatar}
//                       />
//                     ) : (
//                       <View style={styles.defaultAvatar}>
//                         <MaterialCommunityIcons 
//                           name="account" 
//                           size={16} 
//                           color={COLORS.gray} 
//                         />
//                       </View>
//                     )}
//                   </View>
//                   <Text style={styles.cleanerName} numberOfLines={1}>
//                     {getCleanerDisplayName(cleaner)}
//                   </Text>
//                 </View>

//                 {/* Progress Bar and Percentage */}
//                 <View style={styles.progressContainer}>
//                   <View style={styles.progressHeader}>
//                     <Text style={styles.progressPercentage}>
//                       {progress.percentage}%
//                     </Text>
//                   </View>
//                   <CompactProgressBar 
//                     progress={progress} 
//                     height={6}
//                     showPercentage={false}
//                   />
//                 </View>
//               </View>
//             );
//           })}
//         </View>
//       ) : (
//         <View style={styles.noCleanerContainer}>
//           <MaterialCommunityIcons 
//             name="account-search" 
//             size={24} 
//             color={COLORS.light_gray} 
//           />
//           <Text style={styles.noCleanerText}>No cleaners assigned</Text>
//         </View>
//       )}

//       {/* Footer with Action */}
//       <View style={styles.footer}>
//         <TouchableOpacity 
//           style={styles.trackButton}
//           onPress={() => navigation.navigate(ROUTES.host_task_progress, {
//             scheduleId: item._id,
//             schedule: item,
//             mode:"in_progress"
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
//     marginBottom: 16,
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
//   dateTimeContainer: {
//     alignItems: 'flex-end',
//   },
//   dateTimeItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   dateTimeText: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginLeft: 4,
//     fontWeight: '500',
//   },
//   cleanersContainer: {
//     marginBottom: 16,
//   },
//   cleanerItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.light_gray_1,
//   },
//   cleanerInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   avatarContainer: {
//     marginRight: 12,
//   },
//   avatar: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     borderWidth: 2,
//     borderColor: COLORS.light_gray_1,
//   },
//   defaultAvatar: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: COLORS.light_gray_1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: COLORS.light_gray,
//   },
//   cleanerName: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: COLORS.dark,
//     flex: 1,
//   },
//   progressContainer: {
//     width: 100,
//     alignItems: 'flex-end',
//   },
//   progressHeader: {
//     marginBottom: 6,
//   },
//   progressPercentage: {
//     fontSize: 13,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },
//   noCleanerContainer: {
//     alignItems: 'center',
//     paddingVertical: 20,
//     marginBottom: 16,
//   },
//   noCleanerText: {
//     fontSize: 14,
//     color: COLORS.gray,
//     marginTop: 8,
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderTopWidth: 0,
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
// import CompactProgressBar from '../shared/CompactProgressBar';
// import { tSafe } from '../../utils/tSafe'; // added import

// export default function OngoingWorkListItem({ item }) {
//   const navigation = useNavigation();

//   console.log("Ongoing Schedules", item.schedule)

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
//         return tSafe('status_completed', 'Completed');
//       case 'in_progress':
//         return tSafe('status_in_progress', 'In Progress');
//       case 'pending':
//         return tSafe('status_pending', 'Pending');
//       default:
//         return tSafe('status_scheduled', 'Scheduled');
//     }
//   };

//   // Get first name and last name initial
//   const getCleanerDisplayName = (cleaner) => {
//     if (cleaner.firstname && cleaner.lastname) {
//       return `${cleaner.firstname} ${cleaner.lastname.charAt(0)}.`;
//     }
//     if (cleaner.firstname) {
//       return cleaner.firstname;
//     }
//     if (cleaner.group) {
//       return cleaner.group.replace('_', ' ').toUpperCase();
//     }
//     return tSafe('cleaner', 'Cleaner');
//   };

//   return (
//     <TouchableOpacity 
//       style={styles.cardContainer}
//       onPress={() => navigation.navigate(ROUTES.host_task_progress, {
//         scheduleId: item._id,
//         schedule: item,
//         mode: "in_progress"
//       })}
//       activeOpacity={0.7}
//     >
//       {/* Header Section */}
//       <View style={styles.header}>
//         <View style={styles.propertyInfo}>
//           <Text style={styles.propertyName} numberOfLines={1}>
//             {item.schedule?.apartment_name || tSafe('unknown_property', 'Unknown Property')}
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
        
//         <View style={styles.dateTimeContainer}>
//           <View style={styles.dateTimeItem}>
//             <MaterialCommunityIcons 
//               name="calendar-blank-outline" 
//               size={14} 
//               color={COLORS.gray} 
//             />
//             <Text style={styles.dateTimeText}>
//               {moment(item.schedule?.cleaning_date).format('MMM DD')}
//             </Text>
//           </View>
          
//           <View style={styles.dateTimeItem}>
//             <MaterialCommunityIcons 
//               name="clock-outline" 
//               size={14} 
//               color={COLORS.gray} 
//             />
//             <Text style={styles.dateTimeText}>
//               {moment(item.schedule?.cleaning_time, 'h:mm:ss A').format('h:mm A')}
//             </Text>
//           </View>
//         </View>
//       </View>

//       {/* Cleaners List */}
//       {item.assignedTo && item.assignedTo.length > 0 ? (
//         <View style={styles.cleanersContainer}>
//           {item.assignedTo.map((cleaner, index) => {
//             const progress = cleaner.progress || { completedTasks: 0, totalTasks: 0, percentage: 0 };
            
//             return (
//               <View key={cleaner.group || index} style={styles.cleanerItem}>
                
//                 {/* Cleaner Avatar and Name */}
//                 <View style={styles.cleanerInfo}>
//                   <View style={styles.avatarContainer}>
//                     {cleaner.avatar ? (
//                       <Image 
//                         source={{ uri: cleaner.avatar }}
//                         style={styles.avatar}
//                       />
//                     ) : (
//                       <View style={styles.defaultAvatar}>
//                         <MaterialCommunityIcons 
//                           name="account" 
//                           size={16} 
//                           color={COLORS.gray} 
//                         />
//                       </View>
//                     )}
//                   </View>
//                   <Text style={styles.cleanerName} numberOfLines={1}>
//                     {getCleanerDisplayName(cleaner)}
//                   </Text>
//                 </View>

//                 {/* Progress Bar and Percentage */}
//                 <View style={styles.progressContainer}>
//                   <View style={styles.progressHeader}>
//                     <Text style={styles.progressPercentage}>
//                       {progress.percentage}%
//                     </Text>
//                   </View>
//                   <CompactProgressBar 
//                     progress={progress} 
//                     height={6}
//                     showPercentage={false}
//                   />
//                 </View>
//               </View>
//             );
//           })}
//         </View>
//       ) : (
//         <View style={styles.noCleanerContainer}>
//           <MaterialCommunityIcons 
//             name="account-search" 
//             size={24} 
//             color={COLORS.light_gray} 
//           />
//           <Text style={styles.noCleanerText}>{tSafe('no_cleaners_assigned', 'No cleaners assigned')}</Text>
//         </View>
//       )}

//       {/* Footer with Action */}
//       <View style={styles.footer}>
//         <TouchableOpacity 
//           style={styles.trackButton}
//           onPress={() => navigation.navigate(ROUTES.host_task_progress, {
//             scheduleId: item._id,
//             schedule: item,
//             mode:"in_progress"
//           })}
//         >
//           <MaterialCommunityIcons 
//             name="progress-clock" 
//             size={16} 
//             color={COLORS.primary} 
//           />
//           <Text style={styles.trackButtonText}>{tSafe('track_progress', 'Track Progress')}</Text>
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
//     marginBottom: 16,
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
//   dateTimeContainer: {
//     alignItems: 'flex-end',
//   },
//   dateTimeItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   dateTimeText: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginLeft: 4,
//     fontWeight: '500',
//   },
//   cleanersContainer: {
//     marginBottom: 16,
//   },
//   cleanerItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.light_gray_1,
//   },
//   cleanerInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   avatarContainer: {
//     marginRight: 12,
//   },
//   avatar: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     borderWidth: 2,
//     borderColor: COLORS.light_gray_1,
//   },
//   defaultAvatar: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: COLORS.light_gray_1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: COLORS.light_gray,
//   },
//   cleanerName: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: COLORS.dark,
//     flex: 1,
//   },
//   progressContainer: {
//     width: 100,
//     alignItems: 'flex-end',
//   },
//   progressHeader: {
//     marginBottom: 6,
//   },
//   progressPercentage: {
//     fontSize: 13,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },
//   noCleanerContainer: {
//     alignItems: 'center',
//     paddingVertical: 20,
//     marginBottom: 16,
//   },
//   noCleanerText: {
//     fontSize: 14,
//     color: COLORS.gray,
//     marginTop: 8,
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderTopWidth: 0,
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


import React, { memo, useCallback, useMemo } from 'react';

import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';

import ROUTES from '../../constants/routes';
import CompactProgressBar from '../shared/CompactProgressBar';

import { useTheme } from '../../theme';
import { AppText } from '../../ui';
import { tSafe } from '../../utils/tSafe';

const AVATAR_SIZE = 42;

const OngoingWorkListItem = ({ item }) => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();

  const styles = useMemo(
    () => createStyles(theme, isDark),
    [theme, isDark]
  );

  /**
   * Safely normalize a status value.
   */
  const normalizedStatus = useMemo(() => {
    return String(item?.status || 'scheduled')
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_');
  }, [item?.status]);

  /**
   * Resolve status appearance and translation.
   */
  const statusConfig = useMemo(() => {
    switch (normalizedStatus) {
      case 'completed':
      case 'reviewed':
        return {
          label: tSafe('status_completed', 'Completed'),
          color: theme.status.success,
          icon: 'check-circle-outline',
          backgroundColor: theme.status.success + '18',
        };

      case 'in_progress':
        return {
          label: tSafe('status_in_progress', 'In Progress'),
          color: theme.status.warning,
          icon: 'progress-clock',
          backgroundColor: theme.status.warning + '18',
        };

      case 'pending':
      case 'pending_payment':
      case 'pending_review':
        return {
          label: tSafe('status_pending', 'Pending'),
          color: theme.status.pending,
          icon: 'clock-outline',
          backgroundColor: theme.status.pending + '18',
        };

      case 'cancelled':
        return {
          label: tSafe('status_cancelled', 'Cancelled'),
          color: theme.status.error,
          icon: 'close-circle-outline',
          backgroundColor: theme.status.error + '18',
        };

      case 'accepted':
      case 'upcoming':
      case 'scheduled':
        return {
          label: tSafe('status_scheduled', 'Scheduled'),
          color: theme.status.info,
          icon: 'calendar-check-outline',
          backgroundColor: theme.status.info + '18',
        };

      default:
        return {
          label: tSafe('status_scheduled', 'Scheduled'),
          color: theme.brand.primary,
          icon: 'calendar-check-outline',
          backgroundColor: theme.brand.primary + '18',
        };
    }
  }, [normalizedStatus, theme]);

  /**
   * Navigate to task progress.
   */
  const handleOpenProgress = useCallback(() => {
    if (!item?._id) {
      return;
    }

    navigation.navigate(ROUTES.host_task_progress, {
      scheduleId: item._id,
      schedule: item,
      mode: 'in_progress',
    });
  }, [item, navigation]);

  /**
   * Resolve the schedule object.
   */
  const schedule = item?.schedule || {};

  /**
   * Format the cleaning date safely.
   *
   * The input may be an ISO date string or a date-time string.
   */
  const formattedDate = useMemo(() => {
    const rawDate = schedule?.cleaning_date;

    if (!rawDate) {
      return tSafe('date_not_available', 'Date unavailable');
    }

    const parsedDate = moment(rawDate);

    if (!parsedDate.isValid()) {
      return tSafe('date_not_available', 'Date unavailable');
    }

    return parsedDate.format('MMM D, YYYY');
  }, [schedule?.cleaning_date]);

  /**
   * Format the cleaning time.
   *
   * Handles common values such as:
   * 09:00:00
   * 9:00 AM
   * 14:30
   */
  const formattedTime = useMemo(() => {
    const rawTime = schedule?.cleaning_time;

    if (!rawTime) {
      return tSafe('time_not_available', 'Time unavailable');
    }

    const value = String(rawTime).trim();

    const formats = [
      'h:mm:ss A',
      'h:mm A',
      'hh:mm:ss A',
      'hh:mm A',
      'H:mm:ss',
      'HH:mm:ss',
      'H:mm',
      'HH:mm',
    ];

    const parsedTime = moment(value, formats, true);

    if (!parsedTime.isValid()) {
      return value;
    }

    return parsedTime.format('h:mm A');
  }, [schedule?.cleaning_time]);

  /**
   * Display a cleaner's name.
   */
  const getCleanerDisplayName = useCallback((cleaner) => {
    if (!cleaner || typeof cleaner !== 'object') {
      return tSafe('cleaner', 'Cleaner');
    }

    const firstName =
      cleaner.firstname ||
      cleaner.firstName ||
      cleaner.first_name ||
      '';

    const lastName =
      cleaner.lastname ||
      cleaner.lastName ||
      cleaner.last_name ||
      '';

    if (firstName && lastName) {
      return `${firstName} ${lastName.charAt(0).toUpperCase()}.`;
    }

    if (firstName) {
      return firstName;
    }

    if (cleaner.name) {
      return cleaner.name;
    }

    if (cleaner.group) {
      return String(cleaner.group)
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
    }

    return tSafe('cleaner', 'Cleaner');
  }, []);

  /**
   * Normalize the assigned cleaner list.
   */
  const cleaners = useMemo(() => {
    if (!Array.isArray(item?.assignedTo)) {
      return [];
    }

    return item.assignedTo.filter(
      (cleaner) => cleaner && typeof cleaner === 'object'
    );
  }, [item?.assignedTo]);

  /**
   * Calculate a safe progress percentage.
   */
  const getProgressPercentage = useCallback((progress) => {
    const rawPercentage = Number(progress?.percentage);

    if (Number.isFinite(rawPercentage)) {
      return Math.max(0, Math.min(100, Math.round(rawPercentage)));
    }

    const completedTasks = Math.max(
      0,
      Number(progress?.completedTasks) || 0
    );

    const totalTasks = Math.max(
      0,
      Number(progress?.totalTasks) || 0
    );

    if (totalTasks === 0) {
      return 0;
    }

    return Math.max(
      0,
      Math.min(100, Math.round((completedTasks / totalTasks) * 100))
    );
  }, []);

  /**
   * Use a cleaner's ID or group to create a stable list key.
   */
  const getCleanerKey = useCallback((cleaner, index) => {
    return String(
      cleaner.cleanerId ||
      cleaner.userId ||
      cleaner._id ||
      cleaner.group ||
      `cleaner-${index}`
    );
  }, []);

  const propertyName =
    schedule?.apartment_name ||
    schedule?.apartmentName ||
    tSafe('unknown_property', 'Unknown Property');

  const totalCleaners = cleaners.length;

  const totalCompleted = cleaners.reduce((count, cleaner) => {
    const progress = cleaner.progress || {};
    const percentage = getProgressPercentage(progress);

    return count + (percentage >= 100 ? 1 : 0);
  }, 0);

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={handleOpenProgress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`${propertyName}. ${statusConfig.label}. ${tSafe(
        'track_progress',
        'Track Progress'
      )}`}
      accessibilityHint={tSafe(
        'open_task_progress_hint',
        'Opens the cleaning task progress screen'
      )}
      disabled={!item?._id}
    >
      {/* =====================================================
          CARD HEADER
      ====================================================== */}

      <View style={styles.header}>
        <View style={styles.propertyInfo}>
          <View style={styles.propertyIconContainer}>
            <MaterialCommunityIcons
              name="home-outline"
              size={22}
              color={theme.brand.primary}
            />
          </View>

          <View style={styles.propertyTextContainer}>
            <AppText
              variant="caption"
              color={theme.text.muted}
              style={styles.propertyLabel}
            >
              {tSafe('cleaning_property', 'Cleaning Property')}
            </AppText>

            <AppText
              variant="title"
              color={theme.text.primary}
              numberOfLines={2}
              style={styles.propertyName}
            >
              {propertyName}
            </AppText>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusConfig.backgroundColor,
              borderColor: statusConfig.color + '35',
            },
          ]}
        >
          <MaterialCommunityIcons
            name={statusConfig.icon}
            size={14}
            color={statusConfig.color}
          />

          <AppText
            variant="caption"
            color={statusConfig.color}
            weight="700"
            numberOfLines={1}
            style={styles.statusText}
          >
            {statusConfig.label}
          </AppText>
        </View>
      </View>

      {/* =====================================================
          DATE AND TIME
      ====================================================== */}

      <View style={styles.scheduleInfoContainer}>
        <View style={styles.scheduleInfoItem}>
          <View style={styles.scheduleInfoIcon}>
            <MaterialCommunityIcons
              name="calendar-blank-outline"
              size={18}
              color={theme.icon.active}
            />
          </View>

          <View style={styles.scheduleInfoTextContainer}>
            <AppText
              variant="caption"
              color={theme.text.muted}
            >
              {tSafe('cleaning_date', 'Cleaning Date')}
            </AppText>

            <AppText
              variant="bodyMedium"
              color={theme.text.primary}
              weight="600"
              numberOfLines={1}
            >
              {formattedDate}
            </AppText>
          </View>
        </View>

        <View style={styles.scheduleInfoDivider} />

        <View style={styles.scheduleInfoItem}>
          <View style={styles.scheduleInfoIcon}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={18}
              color={theme.icon.active}
            />
          </View>

          <View style={styles.scheduleInfoTextContainer}>
            <AppText
              variant="caption"
              color={theme.text.muted}
            >
              {tSafe('cleaning_time', 'Cleaning Time')}
            </AppText>

            <AppText
              variant="bodyMedium"
              color={theme.text.primary}
              weight="600"
              numberOfLines={1}
            >
              {formattedTime}
            </AppText>
          </View>
        </View>
      </View>

      {/* =====================================================
          CLEANER TEAM SECTION
      ====================================================== */}

      <View style={styles.teamSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <MaterialCommunityIcons
              name="account-group-outline"
              size={19}
              color={theme.icon.default}
            />

            <AppText
              variant="subtitle"
              color={theme.text.primary}
              weight="700"
              style={styles.sectionTitle}
            >
              {tSafe('cleaning_team', 'Cleaning Team')}
            </AppText>
          </View>

          {totalCleaners > 0 && (
            <View style={styles.teamCountBadge}>
              <AppText
                variant="caption"
                color={theme.text.secondary}
                weight="700"
              >
                {totalCleaners}
              </AppText>
            </View>
          )}
        </View>

        {totalCleaners > 0 ? (
          <View style={styles.cleanersContainer}>
            {cleaners.map((cleaner, index) => {
              const progress = cleaner.progress || {
                completedTasks: 0,
                totalTasks: 0,
                percentage: 0,
              };

              const percentage = getProgressPercentage(progress);

              const completedTasks = Math.max(
                0,
                Number(progress.completedTasks) || 0
              );

              const totalTasks = Math.max(
                0,
                Number(progress.totalTasks) || 0
              );

              const cleanerName = getCleanerDisplayName(cleaner);

              const avatarUri =
                cleaner.avatar ||
                cleaner.avatarUrl ||
                cleaner.profileImage ||
                cleaner.profile_image ||
                null;

              return (
                <View
                  key={getCleanerKey(cleaner, index)}
                  style={[
                    styles.cleanerItem,
                    index === cleaners.length - 1 &&
                      styles.cleanerItemLast,
                  ]}
                >
                  {/* Cleaner identity */}

                  <View style={styles.cleanerInfo}>
                    <View style={styles.avatarContainer}>
                      {avatarUri ? (
                        <Image
                          source={{ uri: avatarUri }}
                          style={styles.avatar}
                          resizeMode="cover"
                          accessibilityLabel={`${cleanerName} profile photo`}
                        />
                      ) : (
                        <View style={styles.defaultAvatar}>
                          <MaterialCommunityIcons
                            name="account-outline"
                            size={21}
                            color={theme.icon.muted}
                          />
                        </View>
                      )}

                      {percentage >= 100 && (
                        <View style={styles.completedIndicator}>
                          <MaterialCommunityIcons
                            name="check"
                            size={10}
                            color={theme.text.inverse}
                          />
                        </View>
                      )}
                    </View>

                    <View style={styles.cleanerNameContainer}>
                      <AppText
                        variant="bodyMedium"
                        color={theme.text.primary}
                        weight="600"
                        numberOfLines={1}
                      >
                        {cleanerName}
                      </AppText>

                      <AppText
                        variant="caption"
                        color={theme.text.muted}
                        numberOfLines={1}
                      >
                        {totalTasks > 0
                          ? tSafe(
                              'tasks_completed_count',
                              '{{completed}} of {{total}} tasks completed',
                              {
                                completed: completedTasks,
                                total: totalTasks,
                              }
                            )
                          : tSafe(
                              'task_progress_pending',
                              'Task progress pending'
                            )}
                      </AppText>
                    </View>
                  </View>

                  {/* Cleaner progress */}

                  <View style={styles.progressContainer}>
                    <AppText
                      variant="bodyMedium"
                      color={
                        percentage >= 100
                          ? theme.status.success
                          : theme.brand.primary
                      }
                      weight="700"
                      style={styles.progressPercentage}
                    >
                      {percentage}%
                    </AppText>

                    <View style={styles.progressBarContainer}>
                      <CompactProgressBar
                        progress={{
                          ...progress,
                          percentage,
                        }}
                        height={6}
                        showPercentage={false}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.noCleanerContainer}>
            <View style={styles.noCleanerIconContainer}>
              <MaterialCommunityIcons
                name="account-search-outline"
                size={27}
                color={theme.icon.muted}
              />
            </View>

            <AppText
              variant="bodyMedium"
              color={theme.text.primary}
              weight="600"
              style={styles.noCleanerTitle}
            >
              {tSafe('no_cleaners_assigned', 'No cleaners assigned')}
            </AppText>

            <AppText
              variant="caption"
              color={theme.text.muted}
              align="center"
              style={styles.noCleanerDescription}
            >
              {tSafe(
                'no_cleaners_assigned_description',
                'Cleaner assignments will appear here when available.'
              )}
            </AppText>
          </View>
        )}
      </View>

      {/* =====================================================
          PROGRESS SUMMARY
      ====================================================== */}

      {totalCleaners > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryTextContainer}>
            <AppText
              variant="caption"
              color={theme.text.secondary}
              weight="600"
            >
              {tSafe('team_progress', 'Team Progress')}
            </AppText>

            <AppText
              variant="caption"
              color={theme.text.muted}
            >
              {tSafe(
                'cleaners_completed_count',
                '{{completed}} of {{total}} cleaners finished',
                {
                  completed: totalCompleted,
                  total: totalCleaners,
                }
              )}
            </AppText>
          </View>

          <View style={styles.summaryIndicator}>
            <MaterialCommunityIcons
              name={
                totalCompleted === totalCleaners
                  ? 'check-circle'
                  : 'account-check-outline'
              }
              size={18}
              color={
                totalCompleted === totalCleaners
                  ? theme.status.success
                  : theme.icon.active
              }
            />
          </View>
        </View>
      )}

      {/* =====================================================
          FOOTER ACTION
      ====================================================== */}

      <View style={styles.footer}>
        <View style={styles.trackButton}>
          <View style={styles.trackButtonIcon}>
            <MaterialCommunityIcons
              name="chart-box-outline"
              size={19}
              color={theme.button.primaryText}
            />
          </View>

          <AppText
            variant="bodyMedium"
            color={theme.button.primaryText}
            weight="700"
            style={styles.trackButtonText}
          >
            {tSafe('track_progress', 'Track Progress')}
          </AppText>

          <MaterialCommunityIcons
            name="arrow-right"
            size={18}
            color={theme.button.primaryText}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme, isDark) =>
  StyleSheet.create({
    cardContainer: {
      backgroundColor: theme.card.background,
      borderRadius: 22,
      padding: 18,
      marginVertical: 7,
      marginHorizontal: 16,
      borderWidth: 1,
      borderColor: theme.card.border,
      overflow: 'hidden',

      ...Platform.select({
        ios: {
          shadowColor: theme.shadow.color,
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: isDark ? 0.2 : 0.07,
          shadowRadius: 12,
        },
        android: {
          elevation: isDark ? 2 : 3,
        },
      }),
    },

    // Header

    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 18,
      gap: 10,
    },

    propertyInfo: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
    },

    propertyIconContainer: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor: theme.brand.primary + '16',
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },

    propertyTextContainer: {
      flex: 1,
      minWidth: 0,
    },

    propertyLabel: {
      marginBottom: 3,
      letterSpacing: 0.35,
      textTransform: 'uppercase',
      fontSize: 10,
    },

    propertyName: {
      lineHeight: 22,
    },

    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 7,
      borderRadius: 10,
      borderWidth: 1,
      flexShrink: 0,
      maxWidth: 130,
    },

    statusText: {
      fontSize: 10,
      letterSpacing: 0.1,
    },

    // Schedule information

    scheduleInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background.sunken,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 13,
      marginBottom: 21,
    },

    scheduleInfoItem: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
    },

    scheduleInfoIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: theme.surface.elevated,
      alignItems: 'center',
      justifyContent: 'center',
    },

    scheduleInfoTextContainer: {
      flex: 1,
      minWidth: 0,
      gap: 3,
    },

    scheduleInfoDivider: {
      width: 1,
      height: 34,
      backgroundColor: theme.divider,
      marginHorizontal: 10,
    },

    // Team section

    teamSection: {
      marginBottom: 4,
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 9,
    },

    sectionTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    sectionTitle: {
      fontSize: 15,
    },

    teamCountBadge: {
      minWidth: 27,
      height: 27,
      paddingHorizontal: 8,
      borderRadius: 10,
      backgroundColor: theme.background.sunken,
      alignItems: 'center',
      justifyContent: 'center',
    },

    cleanersContainer: {
      borderRadius: 15,
      borderWidth: 1,
      borderColor: theme.border.default,
      paddingHorizontal: 12,
      backgroundColor: theme.surface.default,
    },

    cleanerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 13,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.divider,
      gap: 10,
    },

    cleanerItemLast: {
      borderBottomWidth: 0,
    },

    cleanerInfo: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    avatarContainer: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      position: 'relative',
      flexShrink: 0,
    },

    avatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      backgroundColor: theme.background.sunken,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    defaultAvatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      backgroundColor: theme.background.sunken,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    completedIndicator: {
      position: 'absolute',
      right: -2,
      bottom: -1,
      width: 17,
      height: 17,
      borderRadius: 9,
      backgroundColor: theme.status.success,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.card.background,
    },

    cleanerNameContainer: {
      flex: 1,
      minWidth: 0,
      gap: 4,
    },

    progressContainer: {
      width: 91,
      alignItems: 'flex-end',
      justifyContent: 'center',
      flexShrink: 0,
    },

    progressPercentage: {
      marginBottom: 7,
      fontSize: 13,
    },

    progressBarContainer: {
      width: '100%',
    },

    // Empty team state

    noCleanerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
      paddingVertical: 24,
      borderRadius: 16,
      backgroundColor: theme.background.sunken,
      borderWidth: 1,
      borderColor: theme.border.default,
      borderStyle: 'dashed',
    },

    noCleanerIconContainer: {
      width: 52,
      height: 52,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.elevated,
      marginBottom: 11,
    },

    noCleanerTitle: {
      marginBottom: 5,
    },

    noCleanerDescription: {
      lineHeight: 19,
      maxWidth: 245,
    },

    // Summary

    summaryContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 15,
      paddingTop: 13,
      paddingHorizontal: 2,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },

    summaryTextContainer: {
      flex: 1,
      gap: 4,
    },

    summaryIndicator: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background.sunken,
      marginLeft: 12,
    },

    // Footer

    footer: {
      marginTop: 17,
    },

    trackButton: {
      minHeight: 48,
      borderRadius: 14,
      backgroundColor: theme.button.primaryBackground,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
      gap: 9,
    },

    trackButtonIcon: {
      alignItems: 'center',
      justifyContent: 'center',
    },

    trackButtonText: {
      flex: 1,
    },
  });

export default memo(OngoingWorkListItem);