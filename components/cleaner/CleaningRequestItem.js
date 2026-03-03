// import React from 'react';
// import { View, Text, StyleSheet,TouchableOpacity, FlatList, Image } from 'react-native';
// import COLORS from '../../constants/colors';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import moment from 'moment';
// import ROUTES from '../../constants/routes';
// import { useNavigation } from '@react-navigation/native';
// import { Badge } from 'react-native-paper';

// const CleaninRequestItemtItem = ({item, status, currency }) => {


//   console.log("Iteeeeeeeeeeeeeeeeeeeeeeeem")
//   // console.log(item.item?.sender_expo_push_token)
//   // console.log(item.item?.schedule.schedule)
//   // console.log(item.item?.chatroomId)
//   // console.log(JSON.stringify(item, null, 2))
//   console.log("Iteeeeeeeeeeeeeeeeeeeeeeeem")

//   //Rename item to "selected_schedule"
//   const schedule = item
//   console.log("Scheduleee", schedule)
//   const selected_schedule = schedule.item.schedule

//   const navigation = useNavigation();
//   // console.log("my request", JSON.stringify(item.item.schedule, null, 2))
//   return (
   

//     // <View>
//     //   <View style={styles.container}>
//     //         <View style={styles.date_time}>
//     //         {item.item.hostInfo.avatar ? 
//     //                     <Image 
//     //                         source={{uri:item.avatar}}
//     //                         style={{height:50, width:50, borderRadius:25, borderWidth:2, borderColor:COLORS.light_gray_1, marginBottom:10}} 
//     //                     />
//     //                     :

//     //                     <Avatar.Image
//     //                         size={50}
//     //                         source={require('../../assets/default_avatar.png')}
//     //                         style={{ backgroundColor: COLORS.gray }}
//     //                     />
//     //                 }
//     //         </View>
            
            
            
            
//     //         <View style={styles.task_details}>
//     //             <Text style={styles.task}>{item.item.hostInfo.firstname} {item.item.hostInfo.lastname}</Text>
//     //             {/* <Text style={styles.task}>{item.schedule.apartment_name}</Text> */}
//     //             <Text style={styles.apartment}>{item.item.schedule.address} </Text>
                
//     //             <Text style={styles.date}>{moment(item.item.schedule.cleaning_date, 'ddd MMM DD YYYY').format('ddd MMM DD')}</Text>
//     //             <Text style={styles.time}>{item.item.schedule.cleaning_time}</Text>
                
//     //             <View style={styles.action}>
//     //             { item.item.status ==='in_progress' ? 
//     //             <TouchableOpacity 
//     //               onPress={() => navigation.navigate(ROUTES.cleaner_schedule_details, {
//     //                 'item':item
//     //               })}
//     //             >
//     //               <Text style={styles.details}>DETAILS</Text>
//     //             </TouchableOpacity>

//     //             :

//     //             <TouchableOpacity 
//     //               onPress={() => navigation.navigate(ROUTES.cleaner_schedule_details, {
//     //                 'item':item
//     //               })}
//     //             >
//     //                 <Text style={styles.clockin}>CLOCK-IN</Text>
//     //             </TouchableOpacity>
//     //           }
//     //             </View>
//     //         </View> 
//     //   </View>
//     // </View>

//     <View>
//       {/* <TouchableOpacity style={styles.categoryBtn} 
//           onPress={() => navigation.navigate(ROUTES.cleaner_schedule_review, {
//           item: {selected_schedule},
//           host_expo_push_token : item.item?.sender_expo_push_token,
//           chatroomId: item.item.chatroomId
//           })}
//         >
    
    
//         <View style={{flexDirection: 'row', paddingVertical:5}}>
//             <View style={{flex: 0.15}}>
               
//                 {item.item.hostInfo?.avatar ? 
//                         <Image 
//                             source={{uri:item.item.hostInfo.avatar}}
//                             style={{height:40, width:40, borderRadius:20, borderWidth:2, borderColor:COLORS.light_gray_1, marginBottom:10}} 
//                         />
//                         :

//                         <Avatar.Image
//                             size={40}
//                             source={require('../../assets/default_avatar.png')}
//                             style={{ backgroundColor: COLORS.gray }}
//                         />
//                     }
            
//             </View>
//             <View style={{flex: 0.7}}>
//                 <Text bold style={styles.apart_name}>{item.item.schedule.hostInfo?.firstname} {item.item.schedule.hostInfo?.lastname}</Text>
//                 <Text style={styles.apartment}>{item.item.schedule.schedule?.address} </Text>

                
//             </View>
        
           
//             <View style={{flex: 0.3, alignItems: 'flex-end'}}>
//               <Text style={styles.date}>{moment(item.item.schedule.schedule?.cleaning_date, 'ddd MMM DD YYYY').format('ddd MMM DD')}</Text>
//               <Text style={styles.time}>{item.item.schedule.schedule?.cleaning_time}</Text>
              
//             </View>
//         </View>
          
//         </TouchableOpacity> */}






//         <TouchableOpacity
          
//         >
//               <View style={styles.requestCard}>
               
//               <View style={{ flex: 0.7, alignItems: 'flex-start' }}>
//                 <Text bold style={styles.apart_name}>
//                   {item.item.schedule.hostInfo?.firstname} {item.item.schedule.hostInfo?.lastname}
//                 </Text>
//                 <Text style={styles.apart_name}>
//                   {item.item.schedule.schedule.apartment_name}
//                 </Text>
//                 <Text style={styles.apartment}>
//                   {item.item.schedule.schedule?.address}
//                 </Text>
//                 <View style={{flexDirection:'row', alignItems:'center'}}>
                    

//                     {status === "pending_payment" && (
//                       <Badge
//                         style={[styles.statusApproveBadgeP, { alignSelf: 'flex-start' }]} // Add alignSelf
//                       >
//                         Pending Confirmation
//                       </Badge>
//                     )}
//                 </View>
//               </View>

                
//                 <View style={{flex: 0.3, alignItems: 'flex-end'}}>
//                   <Text style={styles.date}>{moment(item.item.schedule.schedule?.cleaning_date).format('ddd MMM D')}</Text>
//                   <Text style={styles.time}>{moment(item.item.schedule.schedule?.cleaning_time, 'h:mm:ss A').format('h:mm A')}</Text>
//                   {/* <Ionicons name="chevron-forward-outline" color={COLORS.secondary} size={16}></Ionicons> */}
//                   <Text style={styles.price}>
//                     {currency}{item.item.schedule.schedule.total_cleaning_fee}
//                   </Text>
                  

//                   {item.item.status ==="pending_acceptance" &&
//                   <Badge 
//                     style={styles.statusApproveBadge}
//                     onPress={() => navigation.navigate(ROUTES.cleaner_schedule_review, {
//                       item: {selected_schedule},
//                       requestId: item.item.requestId,
//                       scheduleId:item.item.schedule._id,
//                       hostId:item.item.schedule.hostInfo._id
//                     })}
//                   >
//                       Accept Request
//                     </Badge>
//                   }

                  
//                 </View>
                
//                 {/* <Text style={styles.requestDate}>{request.dateRequested}</Text>
//                 <Text style={styles.requestDetails}>{request.details}</Text> */}

                
//               </View>
//               </TouchableOpacity>
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
//   statusApproveBadge: {
//     backgroundColor: COLORS.deepBlue,
//     color: '#fff',
//     paddingHorizontal:7,
//     marginTop:20
//   },
//   statusApproveBadgeP: {
//     backgroundColor: COLORS.light_gray,
//     color: '#fff',
//     paddingHorizontal:7,
//     marginTop:10,
//     justifyContent:'flex-start',
//     alignItems:'flex-start'
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
//   apart_name: {
//     fontWeight:'500'
//   },
//   apartment:{
//     color:COLORS.gray,
//     fontSize:13,
//   },
//   date:{
//     marginTop:-4,
//     fontSize:12,
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
//     marginTop:10
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
//     fontSize:12,
//     color:COLORS.primary,
//     // textDecorationLine:'underline',
//     fontWeight:'bold'
//   },
//   clockin:{
//     fontSize:12,
//     marginLeft:20,
//     color:COLORS.primary,
//     // textDecorationLine:'underline',
//     fontWeight:'bold'
//   },
//   action:{
//     flexDirection:'row',
//     justifyContent:'space-evenly',
//     marginTop:5,
//     marginBottom: 5,
//   },
//   section: { marginBottom: 20 },
//   requestCard: { 
//     flexDirection:'row',
//     padding: 15, 
//     borderRadius: 12, 
//     backgroundColor: '#e9f5ff', 
//     marginVertical: 5,
//     alignItems:'flex-start'
//   },
//   title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
//   price:{
//     fontSize:18,
//     color:COLORS.deepBlue,
//     fontWeight:'700',
//     marginTop:25
//   }
// });

// export default CleaninRequestItemtItem;


// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
// import COLORS from '../../constants/colors';
// import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
// import moment from 'moment';
// import ROUTES from '../../constants/routes';
// import { useNavigation } from '@react-navigation/native';
// import { Badge } from 'react-native-paper';

// const CleaningRequestItem = ({ item, status, currency }) => {
//   const navigation = useNavigation();
//   const schedule = item;
//   const selected_schedule = schedule.item.schedule;

 
//   // Determine footer action based on status
//   const getFooterAction = () => {
//     if (item.item.status === "pending_acceptance") {
//       return {
//         label: "Accept Request",
//         onPress: () => navigation.navigate(ROUTES.cleaner_schedule_review, {
//           item: { selected_schedule },
//           requestId: item.item.requestId,
//           scheduleId: item.item.schedule._id,
//           hostId: item.item.schedule.hostInfo._id
//         }),
//         color: COLORS.deepBlue
//       };
//     } else {
//       return {
//         label: "View Details",
//         onPress: () => navigation.navigate(ROUTES.cleaner_schedule_details, {
//           item: item
//         }),
//         color: COLORS.primary
//       };
//     }
//   };

//   const footerAction = getFooterAction();

//   return (
//     <View style={styles.cardContainer}>
//       {/* Card Content */}
//       <View style={styles.cardContent}>
//         <View style={styles.avatarContainer}>
//           {item.item.hostInfo?.avatar ? 
//             <Image 
//               source={{uri: item.item.hostInfo.avatar}}
//               style={styles.avatar} 
//             />
//             :
//             <View style={styles.defaultAvatar}>
//               <AntDesign 
//                 name="home" 
//                 size={24} 
//                 color={COLORS.gray} 
//               />
//             </View>
//           }
//         </View>

//         <View style={styles.detailsContainer}>
          
//           <Text style={styles.apartmentName}>
//             {item.item.schedule.schedule?.apartment_name}
//           </Text>
//           <Text style={styles.address} numberOfLines={1}>
//             {item.item.schedule.schedule?.address}
//           </Text>
          
//           <View style={styles.dateTimeContainer}>
//             <MaterialCommunityIcons 
//               name="calendar" 
//               size={14} 
//               color={COLORS.gray} 
//             />
//             <Text style={styles.date}>
//               {moment(item.item.schedule.schedule?.cleaning_date).format('ddd MMM D')}
//             </Text>
            
//             <MaterialCommunityIcons 
//               name="clock-outline" 
//               size={14} 
//               color={COLORS.gray} 
//               style={styles.timeIcon}
//             />
//             <Text style={styles.time}>
//               {moment(item.item.schedule.schedule?.cleaning_time, 'h:mm:ss A').format('h:mm A')}
//             </Text>
//           </View>
//         </View>

//         {status === "pending_payment" && (
//           <Badge style={styles.pendingBadge}>
//             Pending Confirmation
//           </Badge>
//         )}
//       </View>

//       {/* Clickable Footer */}
//       <TouchableOpacity 
//         style={styles.cardFooter}
//         onPress={footerAction.onPress}
//         activeOpacity={0.7}
//       >
//         <View style={styles.footerContent}>
//           <Text style={styles.price}>
//             {currency}{item.item.schedule.schedule.total_cleaning_fee}
//           </Text>
//           <View style={[styles.actionButton, { backgroundColor: footerAction.color }]}>
//             <Text style={styles.actionText}>{footerAction.label}</Text>
//           </View>
//         </View>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   cardContainer: {
//     backgroundColor: "#f9f9f9",
//     borderRadius: 16, // More rounded corners
//     marginVertical: 10,
//     marginHorizontal: 10,
//     // Enhanced shadow for iOS
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 6 }, // Larger shadow offset
//     shadowOpacity: 0.15, // Slightly more opacity
//     shadowRadius: 10, // Softer shadow
//     // Enhanced shadow for Android
//     elevation: 8, // Higher elevation for Android
//     overflow: 'hidden', // Ensures content respects border radius
//   },
//   cardContent: {
//     flexDirection: 'row',
//     padding: 16,
//     alignItems: 'flex-start',
//   },
//   avatarContainer: {
//     marginRight: 12,
//   },
//   avatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     borderWidth: 2,
//     borderColor: COLORS.light_gray_1,
//   },
//   defaultAvatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: COLORS.light_gray_1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: COLORS.light_gray,
//   },
//   detailsContainer: {
//     flex: 1,
//   },
//   hostName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 4,
//   },
//   apartmentName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 2,
//   },
//   address: {
//     fontSize: 13,
//     color: COLORS.gray,
//     marginBottom: 8,
//   },
//   dateTimeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 4,
//   },
//   date: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginLeft: 4,
//     marginRight: 12,
//   },
//   timeIcon: {
//     marginLeft: 12,
//   },
//   time: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginLeft: 4,
//   },
//   pendingBadge: {
//     backgroundColor: COLORS.light_gray,
//     color: COLORS.dark,
//     paddingHorizontal: 8,
//     alignSelf: 'flex-start',
//   },
//   cardFooter: {
//     borderTopWidth: .5,
//     borderTopColor: COLORS.light_gray_1,
//     padding: 16,
//     backgroundColor: '#f8f9fa', // Light background for footer
//     borderBottomLeftRadius: 16, // Rounded bottom corners
//     borderBottomRightRadius: 16,
//   },
//   footerContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   price: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.deepBlue,
//   },
//   actionButton: {
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 20,
//     // Button shadow
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   actionText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 14,
//   },
// });

// export default CleaningRequestItem;


// import React, { useRef } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   TouchableOpacity, 
//   Image, 
//   Animated 
// } from 'react-native';
// import COLORS from '../../constants/colors';
// import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
// import moment from 'moment';
// import ROUTES from '../../constants/routes';
// import { useNavigation } from '@react-navigation/native';

// const CleaningRequestItem = ({ item, status, currency }) => {
//   const navigation = useNavigation();
  
//   // Handle both data structures: {item: data} or direct data
//   const scheduleData = item.item ? item.item : item;
//   const selected_schedule = scheduleData.schedule;
  
//   // Animation values
//   const scaleAnim = useRef(new Animated.Value(1)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   React.useEffect(() => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 400,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   const handlePressIn = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 0.98,
//       useNativeDriver: true,
//     }).start();
//   };

//   const handlePressOut = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 1,
//       useNativeDriver: true,
//     }).start();
//   };

//   // Safely access nested properties
//   const getScheduleProperty = (path, defaultValue = '') => {
//     try {
//       const value = path.split('.').reduce((obj, key) => obj?.[key], scheduleData);
//       return value || defaultValue;
//     } catch (error) {
//       return defaultValue;
//     }
//   };

//   // Determine footer action based on status
//   const getFooterAction = () => {
//     if (status === "pending_acceptance") {
//       return {
//         label: "Accept Request",
//         onPress: () => navigation.navigate(ROUTES.cleaner_schedule_review, {
//           item: { selected_schedule },
//           requestId: getScheduleProperty('requestId'),
//           scheduleId: getScheduleProperty('schedule._id'),
//           hostId: getScheduleProperty('schedule.hostInfo._id')
//         }),
//         backgroundColor: COLORS.primary,
//         textColor: COLORS.white
//       };
//     } else {
//       return {
//         label: "View Details",
//         onPress: () => navigation.navigate(ROUTES.cleaner_schedule_details, {
//           item: scheduleData
//         }),
//         backgroundColor: COLORS.secondary,
//         textColor: COLORS.white
//       };
//     }
//   };

//   const footerAction = getFooterAction();

//   // Status configuration
//   const getStatusConfig = () => {
//     switch (status) {
//       case "pending_payment":
//         return { 
//           label: "Pending Confirmation", 
//           color: COLORS.warning,
//           backgroundColor: COLORS.warning_light 
//         };
//       case "pending_acceptance":
//         return { 
//           label: "New Request", 
//           color: COLORS.primary,
//           backgroundColor: COLORS.primary_light_1 
//         };
//       case "confirmed":
//         return { 
//           label: "Confirmed", 
//           color: COLORS.success,
//           backgroundColor: COLORS.success_light 
//         };
//       default:
//         return { 
//           label: status, 
//           color: COLORS.gray,
//           backgroundColor: COLORS.light_gray_1 
//         };
//     }
//   };

//   const statusConfig = getStatusConfig();

//   // Safe data access
//   const apartmentName = getScheduleProperty('schedule.schedule.apartment_name', 'Unknown Property');
//   const address = getScheduleProperty('schedule.schedule.address', 'Address not available');
//   const cleaningDate = getScheduleProperty('schedule.schedule.cleaning_date');
//   const cleaningTime = getScheduleProperty('schedule.schedule.cleaning_time');
//   const totalFee = getScheduleProperty('schedule.schedule.total_cleaning_fee', '0');
//   const hostInfo = getScheduleProperty('schedule.hostInfo', {});

//   if (!scheduleData || !scheduleData.schedule) {
//     return (
//       <View style={styles.cardContainer}>
//         <Text style={styles.errorText}>Invalid schedule data</Text>
//       </View>
//     );
//   }

//   return (
//     <Animated.View 
//       style={[
//         styles.cardContainer,
//         {
//           opacity: fadeAnim,
//           transform: [{ scale: scaleAnim }]
//         }
//       ]}
//     >
//       {/* Status Badge */}
//       <View style={[styles.statusBadge, { backgroundColor: statusConfig.backgroundColor }]}>
//         <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
//         <Text style={[styles.statusText, { color: statusConfig.color }]}>
//           {statusConfig.label}
//         </Text>
//       </View>

//       {/* Main Card Content */}
//       <TouchableOpacity 
//         onPress={footerAction.onPress}
//         onPressIn={handlePressIn}
//         onPressOut={handlePressOut}
//         activeOpacity={0.8}
//         style={styles.cardContent}
//       >
//         {/* Avatar Section */}
//         <View style={styles.avatarSection}>
//           <View style={styles.avatarContainer}>
//             {hostInfo?.avatar ? 
//               <Image 
//                 source={{uri: hostInfo.avatar}}
//                 style={styles.avatar} 
//               />
//               :
//               <View style={styles.defaultAvatar}>
//                 <AntDesign 
//                   name="home" 
//                   size={20} 
//                   color={COLORS.gray} 
//                 />
//               </View>
//             }
//           </View>
//         </View>

//         {/* Details Section */}
//         <View style={styles.detailsSection}>
//           <Text style={styles.apartmentName} numberOfLines={1}>
//             {apartmentName}
//           </Text>
          
//           <View style={styles.addressRow}>
//             <MaterialCommunityIcons 
//               name="map-marker-outline" 
//               size={14} 
//               color={COLORS.gray} 
//             />
//             <Text style={styles.address} numberOfLines={1}>
//               {address}
//             </Text>
//           </View>

//           {/* Date & Time Section */}
//           <View style={styles.infoSection}>
//             <View style={styles.infoRow}>
//               <View style={styles.infoItem}>
//                 <MaterialCommunityIcons 
//                   name="calendar-blank-outline" 
//                   size={16} 
//                   color={COLORS.dark} 
//                 />
//                 <Text style={styles.infoText}>
//                   {cleaningDate ? moment(cleaningDate).format('MMM D, YYYY') : 'Date not set'}
//                 </Text>
//               </View>
              
//               <View style={styles.infoItem}>
//                 <MaterialCommunityIcons 
//                   name="clock-outline" 
//                   size={16} 
//                   color={COLORS.dark} 
//                 />
//                 <Text style={styles.infoText}>
//                   {cleaningTime ? moment(cleaningTime, 'h:mm:ss A').format('h:mm A') : 'Time not set'}
//                 </Text>
//               </View>
//             </View>

//             {/* Price & Duration */}
//             <View style={styles.metaRow}>
//               <View style={styles.priceContainer}>
//                 <Text style={styles.priceLabel}>Total Fee</Text>
//                 <Text style={styles.price}>
//                   {currency}{totalFee}
//                 </Text>
//               </View>
              
//               <View style={styles.durationContainer}>
//                 <MaterialCommunityIcons 
//                   name="timer-sand" 
//                   size={14} 
//                   color={COLORS.gray} 
//                 />
//                 <Text style={styles.durationText}>
//                   {getScheduleProperty('schedule.schedule.estimated_duration', '2-3 hrs')}
//                 </Text>
//               </View>
//             </View>
//           </View>
//         </View>
//       </TouchableOpacity>

//       {/* Action Footer */}
//       <View style={styles.cardFooter}>
//         <TouchableOpacity 
//           style={[styles.actionButton, { backgroundColor: footerAction.backgroundColor }]}
//           onPress={footerAction.onPress}
//           activeOpacity={0.7}
//         >
//           <Text style={[styles.actionText, { color: footerAction.textColor }]}>
//             {footerAction.label}
//           </Text>
//           <MaterialCommunityIcons 
//             name="arrow-right" 
//             size={16} 
//             color={footerAction.textColor} 
//           />
//         </TouchableOpacity>
//       </View>
//     </Animated.View>
//   );
// };

// const styles = StyleSheet.create({
//   cardContainer: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     marginVertical: 8,
//     marginHorizontal: 0,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     elevation: 5,
//     overflow: 'hidden',
//     borderWidth: 1,
//     borderColor: COLORS.light_gray_1,
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderTopLeftRadius: 12,
//     borderTopRightRadius: 12,
//   },
//   statusDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     marginRight: 8,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '600',
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   cardContent: {
//     flexDirection: 'row',
//     padding: 16,
//     paddingBottom: 12,
//   },
//   avatarSection: {
//     marginRight: 12,
//   },
//   avatarContainer: {
//     position: 'relative',
//   },
//   avatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     borderWidth: 2,
//     borderColor: COLORS.light_gray_1,
//   },
//   defaultAvatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: COLORS.light_gray_1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: COLORS.light_gray,
//   },
//   detailsSection: {
//     flex: 1,
//   },
//   apartmentName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 4,
//   },
//   addressRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   address: {
//     fontSize: 14,
//     color: COLORS.gray,
//     marginLeft: 6,
//     flex: 1,
//   },
//   infoSection: {
//     gap: 12,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     gap: 16,
//   },
//   infoItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.light_gray_1,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 8,
//   },
//   infoText: {
//     fontSize: 13,
//     fontWeight: '500',
//     color: COLORS.dark,
//     marginLeft: 6,
//   },
//   metaRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   priceContainer: {
//     alignItems: 'flex-start',
//   },
//   priceLabel: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginBottom: 2,
//     fontWeight: '500',
//   },
//   price: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },
//   durationContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.light_gray_1,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 8,
//   },
//   durationText: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginLeft: 4,
//     fontWeight: '500',
//   },
//   cardFooter: {
//     borderTopWidth: 1,
//     borderTopColor: COLORS.light_gray_1,
//     padding: 16,
//     paddingTop: 12,
//   },
//   actionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//   },
//   actionText: {
//     fontSize: 14,
//     fontWeight: '600',
//     marginRight: 8,
//   },
//   errorText: {
//     color: COLORS.error,
//     textAlign: 'center',
//     padding: 16,
//   },
// });

// export default CleaningRequestItem;





import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Animated
} from 'react-native';
import COLORS from '../../constants/colors';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import moment from 'moment';
import ROUTES from '../../constants/routes';
import { useNavigation } from '@react-navigation/native';
import { getCityState } from '../../utils/getAddressFromCoordinates';

const CleaningRequestItem = ({ item, status, currency }) => {
  const navigation = useNavigation();
  console.log(item.item.request_created_at)
  const scheduleData = item.item ? item.item : item;
  const selected_schedule = scheduleData.schedule;

  // console.log(selected_schedule)
  
  // State for location data
  const [locationData, setLocationData] = useState({
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });
  
  // Minimal animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Fetch location data when component mounts
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        // Check if coordinates exist
        if (selected_schedule?.schedule?.apartment_latitude && 
            selected_schedule?.schedule?.apartment_longitude) {
          
          const coordinate = {
            latitude: selected_schedule.schedule.apartment_latitude,
            longitude: selected_schedule.schedule.apartment_longitude
          };

          const result = await getCityState(coordinate);
          
          setLocationData({
            city: result.city || '',
            state: result.state || '',
            postalCode: result.postalCode || '',
            country: result.country || ''
          });
        }
      } catch (error) {
        console.error('Error fetching location data:', error);
        // You can set default values or handle the error as needed
      }
    };

    fetchLocationData();
  }, [selected_schedule]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  // Safely access nested properties
  const getScheduleProperty = (path, defaultValue = '') => {
    try {
      const value = path.split('.').reduce((obj, key) => obj?.[key], scheduleData);
      return value || defaultValue;
    } catch (error) {
      return defaultValue;
    }
  };

  // Determine footer action based on status
  const getFooterAction = () => {
    if (status === "pending_acceptance") {
      return {
        label: "Accept Request",
        onPress: () => navigation.navigate(ROUTES.cleaner_schedule_review, {
          item: { selected_schedule },
          requestId: getScheduleProperty('requestId'),
          scheduleId: getScheduleProperty('schedule._id'),
          hostId: getScheduleProperty('schedule.hostInfo.userId'),
          request_created_at: item.item.request_created_at
        }),
        isPrimary: true
      };
    } else {
      return {
        label: "View Details",
        onPress: () => navigation.navigate(ROUTES.cleaner_schedule_details, {
          item: scheduleData
        }),
        isPrimary: false
      };
    }
  };

  const footerAction = getFooterAction();

  // Safe data access
  const apartmentName = getScheduleProperty('schedule.schedule.apartment_name', 'Unknown Property');
  const address = getScheduleProperty('schedule.schedule.address', 'Address not available');
  const cleaningDate = getScheduleProperty('schedule.schedule.cleaning_date');
  const cleaningTime = getScheduleProperty('schedule.schedule.cleaning_time');
  const totalFee = getScheduleProperty('schedule.schedule.total_cleaning_fee', '0');
  const hostInfo = getScheduleProperty('schedule.hostInfo', {});
  const duration = getScheduleProperty('schedule.schedule.estimated_duration', '2-3 hrs');

  // Use location data if available, otherwise fall back to original address
  const displayAddress = locationData.city && locationData.state 
    ? `${locationData.city}, ${locationData.state}`
    : address;

  if (!scheduleData || !scheduleData.schedule) {
    return (
      <View style={styles.cardContainer}>
        <Text style={styles.errorText}>Invalid schedule data</Text>
      </View>
    );
  }

  return (
    <Animated.View 
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      {/* Main Content - No Header Status */}
      <TouchableOpacity 
        onPress={footerAction.onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={styles.content}
      >
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyName} numberOfLines={1}>
              {apartmentName}
            </Text>
            <View style={styles.addressRow}>
              <MaterialCommunityIcons 
                name="map-marker-outline" 
                size={14} 
                color="#6B7280" 
              />
              <Text style={styles.address} numberOfLines={1}>
                {displayAddress}
              </Text>
            </View>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {currency}{totalFee}
            </Text>
          </View>
        </View>

        {/* Details Row */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons 
              name="calendar-outline" 
              size={16} 
              color="#6B7280" 
            />
            <Text style={styles.detailText}>
              {cleaningDate ? moment(cleaningDate).format('MMM D') : 'TBD'}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <MaterialCommunityIcons 
              name="clock-outline" 
              size={16} 
              color="#6B7280" 
            />
            <Text style={styles.detailText}>
              {cleaningTime ? moment(cleaningTime, 'h:mm:ss A').format('h:mm A') : 'TBD'}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <MaterialCommunityIcons 
              name="timer-outline" 
              size={16} 
              color="#6B7280" 
            />
            <Text style={styles.detailText}>{duration}</Text>
          </View>
        </View>

        {/* Host Info & Action */}
        <View style={styles.footerRow}>
          <View style={styles.hostInfo}>
            {hostInfo?.avatar ? 
              <Image 
                source={{uri: hostInfo.avatar}}
                style={styles.avatar} 
              />
              :
              <View style={styles.defaultAvatar}>
                <AntDesign 
                  name="user" 
                  size={14} 
                  color="#6B7280" 
                />
              </View>
            }
            <Text style={styles.hostName}>
              {hostInfo?.firstname || 'Host'}
            </Text>
          </View>

          <TouchableOpacity 
            style={[
              styles.actionButton,
              footerAction.isPrimary && styles.primaryAction
            ]}
            onPress={footerAction.onPress}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.actionText,
              footerAction.isPrimary && styles.primaryActionText
            ]}>
              {footerAction.label}
            </Text>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={16} 
              color={footerAction.isPrimary ? '#FFF' : COLORS.primary} 
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ... keep your existing styles the same ...
const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginVertical: 6,
    marginHorizontal: 0,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 1,
    // },
    // shadowOpacity: 0.05,
    // shadowRadius: 8,
    // elevation: 2,
    // borderWidth: 1,
    // borderColor: '#F3F4F6',
    // overflow: 'hidden',
  },
  content: {
    padding: 20,
  },
  headerRow: {
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
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  defaultAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  hostName: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  primaryAction: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 4,
  },
  primaryActionText: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    padding: 20,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default CleaningRequestItem;