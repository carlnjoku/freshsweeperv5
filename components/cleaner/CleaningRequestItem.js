// // import React, { useRef, useState, useEffect } from 'react';
// // import { 
// //   View, 
// //   Text, 
// //   StyleSheet, 
// //   TouchableOpacity, 
// //   Image, 
// //   Animated
// // } from 'react-native';
// // import COLORS from '../../constants/colors';
// // import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
// // import moment from 'moment';
// // import ROUTES from '../../constants/routes';
// // import { useNavigation } from '@react-navigation/native';
// // import { getCityState } from '../../utils/getAddressFromCoordinates';
// // import { tSafe } from '../../utils/tSafe'; // added import

// // const CleaningRequestItem = ({ item, status, currency }) => {
// //   const navigation = useNavigation();
// //   console.log(item?.item?.request_created_at)
// //   const scheduleData = item.item ? item.item : item;
// //   const selected_schedule = scheduleData.schedule;

// //   // State for location data
// //   const [locationData, setLocationData] = useState({
// //     city: '',
// //     state: '',
// //     postalCode: '',
// //     country: ''
// //   });
  
// //   // Minimal animations
// //   const scaleAnim = useRef(new Animated.Value(1)).current;
// //   const fadeAnim = useRef(new Animated.Value(0)).current;

// //   React.useEffect(() => {
// //     Animated.timing(fadeAnim, {
// //       toValue: 1,
// //       duration: 300,
// //       useNativeDriver: true,
// //     }).start();
// //   }, []);

// //   // Fetch location data when component mounts
// //   useEffect(() => {
// //     const fetchLocationData = async () => {
// //       try {
// //         if (selected_schedule?.schedule?.apartment_latitude && 
// //             selected_schedule?.schedule?.apartment_longitude) {
          
// //           const coordinate = {
// //             latitude: selected_schedule.schedule.apartment_latitude,
// //             longitude: selected_schedule.schedule.apartment_longitude
// //           };

// //           const result = await getCityState(coordinate);
          
// //           setLocationData({
// //             city: result.city || '',
// //             state: result.state || '',
// //             postalCode: result.postalCode || '',
// //             country: result.country || ''
// //           });
// //         }
// //       } catch (error) {
// //         console.error('Error fetching location data:', error);
// //       }
// //     };

// //     fetchLocationData();
// //   }, [selected_schedule]);

// //   const handlePressIn = () => {
// //     Animated.spring(scaleAnim, {
// //       toValue: 0.98,
// //       useNativeDriver: true,
// //     }).start();
// //   };

// //   const handlePressOut = () => {
// //     Animated.spring(scaleAnim, {
// //       toValue: 1,
// //       useNativeDriver: true,
// //     }).start();
// //   };

// //   // Safely access nested properties
// //   const getScheduleProperty = (path, defaultValue = '') => {
// //     try {
// //       const value = path.split('.').reduce((obj, key) => obj?.[key], scheduleData);
// //       return value || defaultValue;
// //     } catch (error) {
// //       return defaultValue;
// //     }
// //   };

// //   // Determine footer action based on status
// //   const getFooterAction = () => {
// //     if (status === "pending_acceptance") {
// //       return {
// //         label: tSafe('view_request', 'View Request'),
// //         onPress: () => navigation.navigate(ROUTES.cleaner_schedule_review, {
// //           item: { selected_schedule },
// //           requestId: getScheduleProperty('requestId'),
// //           scheduleId: getScheduleProperty('schedule._id'),
// //           hostId: getScheduleProperty('schedule.hostInfo.userId'),
// //           request_created_at: item?.item?.request_created_at
// //         }),
// //         isPrimary: true
// //       };
// //     } else {
// //       return {
// //         label: tSafe('view_details', 'View Details'),
// //         onPress: () => navigation.navigate(ROUTES.cleaner_schedule_details, {
// //           item: scheduleData
// //         }),
// //         isPrimary: false
// //       };
// //     }
// //   };

// //   const footerAction = getFooterAction();

// //   // Safe data access
// //   const apartmentName = getScheduleProperty('schedule.schedule.apartment_name', tSafe('unknown_property', 'Unknown Property'));
// //   const address = getScheduleProperty('schedule.schedule.address', tSafe('address_not_available', 'Address not available'));
// //   const cleaningDate = getScheduleProperty('schedule.schedule.cleaning_date');
// //   const cleaningTime = getScheduleProperty('schedule.schedule.cleaning_time');
// //   const totalFee = getScheduleProperty('schedule.schedule.total_cleaning_fee', '0');
// //   const hostInfo = getScheduleProperty('schedule.hostInfo', {});
// //   const duration = getScheduleProperty('schedule.schedule.estimated_duration', '2-3 hrs');

// //   // Use location data if available, otherwise fall back to original address
// //   const displayAddress = locationData.city && locationData.state 
// //     ? `${locationData.city}, ${locationData.state}`
// //     : address;

// //   if (!scheduleData || !scheduleData.schedule) {
// //     return (
// //       <View style={styles.cardContainer}>
// //         <Text style={styles.errorText}>{tSafe('invalid_schedule_data', 'Invalid schedule data')}</Text>
// //       </View>
// //     );
// //   }

// //   return (
// //     <Animated.View 
// //       style={[
// //         styles.cardContainer,
// //         {
// //           opacity: fadeAnim,
// //           transform: [{ scale: scaleAnim }]
// //         }
// //       ]}
// //     >
// //       <TouchableOpacity 
// //         onPress={footerAction.onPress}
// //         onPressIn={handlePressIn}
// //         onPressOut={handlePressOut}
// //         activeOpacity={0.95}
// //         style={styles.content}
// //       >
// //         {/* Header Row */}
// //         <View style={styles.headerRow}>
// //           <View style={styles.propertyInfo}>
// //             <Text style={styles.propertyName} numberOfLines={1}>
// //               {apartmentName}
// //             </Text>
// //             <View style={styles.addressRow}>
// //               <MaterialCommunityIcons 
// //                 name="map-marker-outline" 
// //                 size={14} 
// //                 color="#64748B" 
// //               />
// //               <Text style={styles.address} numberOfLines={1}>
// //                 {displayAddress}
// //               </Text>
// //             </View>
// //           </View>
          
// //           <View style={styles.priceChip}>
// //             <Text style={styles.priceText}>
// //               {currency}{totalFee}
// //             </Text>
// //           </View>
// //         </View>

// //         {/* Details Row */}
// //         <View style={styles.detailsRow}>
// //           <View style={styles.detailItem}>
// //             <MaterialCommunityIcons 
// //               name="calendar-outline" 
// //               size={16} 
// //               color="#64748B" 
// //             />
// //             <Text style={styles.detailText}>
// //               {cleaningDate ? moment(cleaningDate).format('MMM D') : tSafe('tbd', 'TBD')}
// //             </Text>
// //           </View>

// //           <View style={styles.detailItem}>
// //             <MaterialCommunityIcons 
// //               name="clock-outline" 
// //               size={16} 
// //               color="#64748B" 
// //             />
// //             <Text style={styles.detailText}>
// //               {cleaningTime ? moment(cleaningTime, 'h:mm:ss A').format('h:mm A') : tSafe('tbd', 'TBD')}
// //             </Text>
// //           </View>

// //           <View style={styles.detailItem}>
// //             <MaterialCommunityIcons 
// //               name="timer-outline" 
// //               size={16} 
// //               color="#64748B" 
// //             />
// //             <Text style={styles.detailText}>{duration}</Text>
// //           </View>
// //         </View>

// //         {/* Footer with Host and Action */}
// //         <View style={styles.footerRow}>
// //           <View style={styles.hostInfo}>
// //             {hostInfo?.avatar ? 
// //               <Image 
// //                 source={{uri: hostInfo.avatar}}
// //                 style={styles.avatar} 
// //               />
// //               :
// //               <View style={styles.defaultAvatar}>
// //                 <AntDesign 
// //                   name="user" 
// //                   size={14} 
// //                   color="#64748B" 
// //                 />
// //               </View>
// //             }
// //             <Text style={styles.hostName}>
// //               {hostInfo?.firstname || tSafe('host', 'Host')}
// //             </Text>
// //           </View>

// //           <TouchableOpacity 
// //             style={[
// //               styles.actionButton,
// //               footerAction.isPrimary && styles.primaryAction
// //             ]}
// //             onPress={footerAction.onPress}
// //             activeOpacity={0.8}
// //           >
// //             <Text style={[
// //               styles.actionText,
// //               footerAction.isPrimary && styles.primaryActionText
// //             ]}>
// //               {footerAction.label}
// //             </Text>
// //             <MaterialCommunityIcons 
// //               name="arrow-right" 
// //               size={16} 
// //               color={footerAction.isPrimary ? '#FFF' : COLORS.primary} 
// //             />
// //           </TouchableOpacity>
// //         </View>
// //       </TouchableOpacity>
// //     </Animated.View>
// //   );
// // };

// import React, { useRef, useState, useEffect } from 'react';
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
// import { getCityState } from '../../utils/getAddressFromCoordinates';
// import { tSafe } from '../../utils/tSafe';

// const CleaningRequestItem = ({ item, status, currency }) => {
//   const navigation = useNavigation();

  
  
//   // item is now the request object directly (see parent change)
//   const request = item;
//   const scheduleData = request.schedule || {};
//   const schedule = scheduleData.schedule || {};

//   console.log(request.item)

//   const [locationData, setLocationData] = useState({
//     city: '',
//     state: '',
//     postalCode: '',
//     country: ''
//   });
  
//   const scaleAnim = useRef(new Animated.Value(1)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 300,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   useEffect(() => {
//     const fetchLocationData = async () => {
//       try {
//         if (schedule?.apartment_latitude && schedule?.apartment_longitude) {
//           const coordinate = {
//             latitude: schedule.apartment_latitude,
//             longitude: schedule.apartment_longitude
//           };
//           const result = await getCityState(coordinate);
//           setLocationData({
//             city: result.city || '',
//             state: result.state || '',
//             postalCode: result.postalCode || '',
//             country: result.country || ''
//           });
//         }
//       } catch (error) {
//         console.error('Error fetching location data:', error);
//       }
//     };
//     fetchLocationData();
//   }, [schedule]);

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

//   // ✅ Fix: navigate using parent stack
//   // const navigateToReview = () => {
//   //   const params = {
//   //     requestId: request._id,
//   //     scheduleId: scheduleData._id,
//   //     hostId: scheduleData.hostInfo?.userId,
//   //     request_created_at: request.created_at,
//   //   };

//   //   console.log('Navigating to cleaner_schedule_review with params:', params);

//   //   // Get the parent navigator (stack) that contains the tab navigator
//   //   const parentNav = navigation.getParent();
//   //   if (parentNav) {
//   //     parentNav.push(ROUTES.cleaner_schedule_review, params);
//   //   } else {
//   //     // Fallback – if no parent, try directly
//   //     navigation.push(ROUTES.cleaner_schedule_review, params);
//   //   }
//   // };

//   const navigateToReview = () => {
//     const params = {
//       // Required identifiers
//       requestId: request._id,
//       scheduleId: scheduleData._id,
//       hostId: scheduleData.hostInfo?.userId,
//       request_created_at: request.created_at,
//       // Send the full objects for the review screen
//       schedule: scheduleData,   // full schedule document
//       request: request,         // full request document
//     };
  
//     console.log('Navigating to cleaner_schedule_review with params:', params);
  
//     const parentNav = navigation.getParent();
//     if (parentNav) {
//       parentNav.push(ROUTES.cleaner_schedule_review, params);
//     } else {
//       navigation.push(ROUTES.cleaner_schedule_review, params);
//     }
//   };

//   const footerAction = {
//     label: status === "pending_acceptance" ? tSafe('view_request', 'View Request') : tSafe('view_details', 'View Details'),
//     onPress: navigateToReview,
//     isPrimary: status === "pending_acceptance",
//   };

//   const apartmentName = schedule.apartment_name || tSafe('unknown_property', 'Unknown Property');
//   const address = schedule.address || tSafe('address_not_available', 'Address not available');
//   const cleaningDate = schedule.cleaning_date;
//   const cleaningTime = schedule.cleaning_time;
//   const totalFee = schedule.total_cleaning_fee || '0';
//   const hostInfo = scheduleData.hostInfo || {};
//   const duration = schedule.estimated_duration || '2-3 hrs';

//   const displayAddress = locationData.city && locationData.state 
//     ? `${locationData.city}, ${locationData.state}`
//     : address;

//   if (!request || !scheduleData) {
//     return (
//       <View style={styles.cardContainer}>
//         <Text style={styles.errorText}>{tSafe('invalid_schedule_data', 'Invalid schedule data')}</Text>
//       </View>
//     );
//   }

//   return (
//     <Animated.View 
//       style={[
//         styles.cardContainer,
//         { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
//       ]}
//     >
//       <TouchableOpacity 
//         onPress={footerAction.onPress}
//         onPressIn={handlePressIn}
//         onPressOut={handlePressOut}
//         activeOpacity={0.95}
//         style={styles.content}
//       >
//         {/* Header Row */}
//         <View style={styles.headerRow}>
//           <View style={styles.propertyInfo}>
//             <Text style={styles.propertyName} numberOfLines={1}>
//               {apartmentName}
//             </Text>
//             <View style={styles.addressRow}>
//               <MaterialCommunityIcons 
//                 name="map-marker-outline" 
//                 size={14} 
//                 color="#64748B" 
//               />
//               <Text style={styles.address} numberOfLines={1}>
//                 {displayAddress}
//               </Text>
//             </View>
//           </View>
          
//           <View style={styles.priceChip}>
//             <Text style={styles.priceText}>
//               {currency}{totalFee}
//             </Text>
//           </View>
//         </View>

//         {/* Details Row */}
//         <View style={styles.detailsRow}>
//           <View style={styles.detailItem}>
//             <MaterialCommunityIcons 
//               name="calendar-outline" 
//               size={16} 
//               color="#64748B" 
//             />
//             <Text style={styles.detailText}>
//               {cleaningDate ? moment(cleaningDate).format('MMM D') : tSafe('tbd', 'TBD')}
//             </Text>
//           </View>

//           <View style={styles.detailItem}>
//             <MaterialCommunityIcons 
//               name="clock-outline" 
//               size={16} 
//               color="#64748B" 
//             />
//             <Text style={styles.detailText}>
//               {cleaningTime ? moment(cleaningTime, 'h:mm:ss A').format('h:mm A') : tSafe('tbd', 'TBD')}
//             </Text>
//           </View>

//           <View style={styles.detailItem}>
//             <MaterialCommunityIcons 
//               name="timer-outline" 
//               size={16} 
//               color="#64748B" 
//             />
//             <Text style={styles.detailText}>{duration}</Text>
//           </View>
//         </View>

//         {/* Footer with Host and Action */}
//         <View style={styles.footerRow}>
//           <View style={styles.hostInfo}>
//             {hostInfo?.avatar ? 
//               <Image 
//                 source={{uri: hostInfo.avatar}}
//                 style={styles.avatar} 
//               />
//               :
//               <View style={styles.defaultAvatar}>
//                 <AntDesign 
//                   name="user" 
//                   size={14} 
//                   color="#64748B" 
//                 />
//               </View>
//             }
//             <Text style={styles.hostName}>
//               {hostInfo?.firstname || tSafe('host', 'Host')}
//             </Text>
//           </View>

//           <TouchableOpacity 
//             style={[
//               styles.actionButton,
//               footerAction.isPrimary && styles.primaryAction
//             ]}
//             onPress={footerAction.onPress}
//             activeOpacity={0.8}
//           >
//             <Text style={[
//               styles.actionText,
//               footerAction.isPrimary && styles.primaryActionText
//             ]}>
//               {footerAction.label}
//             </Text>
//             <MaterialCommunityIcons 
//               name="arrow-right" 
//               size={16} 
//               color={footerAction.isPrimary ? '#FFF' : COLORS.primary} 
//             />
//           </TouchableOpacity>
//         </View>
//       </TouchableOpacity>
//     </Animated.View>
//   );
// };

// // styles unchanged (keep as before)

// const styles = StyleSheet.create({
//   cardContainer: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 20,
//     marginVertical: 8,
//     marginHorizontal: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 1,
//     borderWidth: 1,
//     borderColor: "#c9c9c9",
//     overflow: 'hidden',
//   },
//   content: {
//     padding: 16,
//   },
//   headerRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   propertyInfo: {
//     flex: 1,
//     marginRight: 12,
//   },
//   propertyName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#0F172A',
//     marginBottom: 4,
//     letterSpacing: -0.3,
//   },
//   addressRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   address: {
//     fontSize: 14,
//     color: '#475569',
//     marginLeft: 6,
//     flex: 1,
//   },
//   priceChip: {
//     backgroundColor: '#F1F5F9',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 30,
//   },
//   priceText: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#0F172A',
//   },
//   detailsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//     backgroundColor: '#F8FAFC',
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderRadius: 12,
//   },
//   detailItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   detailText: {
//     fontSize: 13,
//     color: '#334155',
//     fontWeight: '500',
//     marginLeft: 6,
//   },
//   footerRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#F1F5F9',
//   },
//   hostInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatar: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     marginRight: 8,
//   },
//   defaultAvatar: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: '#F1F5F9',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 8,
//   },
//   hostName: {
//     fontSize: 14,
//     color: '#475569',
//     fontWeight: '500',
//   },
//   actionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F8FAFC',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 30,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//   },
//   primaryAction: {
//     backgroundColor: COLORS.primary,
//     borderColor: COLORS.primary,
//   },
//   actionText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginRight: 6,
//   },
//   primaryActionText: {
//     color: '#FFFFFF',
//   },
//   errorText: {
//     color: '#DC2626',
//     textAlign: 'center',
//     padding: 20,
//     fontSize: 14,
//     fontWeight: '500',
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
import { tSafe } from '../../utils/tSafe';

const CleaningRequestItem = ({ item, status, currency }) => {
  const navigation = useNavigation();
  
  // Robust unwrapping: if item has an 'item' property, use that; otherwise use item directly.
  // Also handle if item is an array or has a different structure.
  const request = item?.item ? item.item : item;
  
  // Extract scheduleData: could be under request.schedule or request itself might be the schedule?
  // Based on your data, request likely has a 'schedule' field.
  const scheduleData = request?.schedule || {};
  const schedule = scheduleData?.schedule || {};

  // Log for debugging (remove in production)
  console.log('CleaningRequestItem - request:', request);
  console.log('CleaningRequestItem - scheduleData:', scheduleData);
  console.log('CleaningRequestItem - schedule:', schedule);

  // State for location data
  const [locationData, setLocationData] = useState({
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });
  
  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
        if (schedule?.apartment_latitude && schedule?.apartment_longitude) {
          const coordinate = {
            latitude: schedule.apartment_latitude,
            longitude: schedule.apartment_longitude
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
      }
    };

    fetchLocationData();
  }, [schedule]);

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

  // Navigation handler - sends full data
  const navigateToReview = () => {
    // Ensure we have the required data
    if (!request || !scheduleData) {
      console.error('Missing request or schedule data');
      return;
    }
    // alert(request.requestId)
    // console.log("T-----T", request)
    const params = {
      requestId: request.requestId,
      scheduleId: scheduleData._id,
      hostId: scheduleData.hostInfo?.userId,
      request_created_at: request.created_at,
      schedule: scheduleData,   // full schedule document
      request: request,         // full request document
    };

    console.log('Navigating with params:', params);

    // Attempt to navigate using parent stack (if nested in tabs)
    const parentNav = navigation.getParent();
    if (parentNav) {
      parentNav.push(ROUTES.cleaner_schedule_review, params);
    } else {
      navigation.push(ROUTES.cleaner_schedule_review, params);
    }
  };

  // Determine footer action based on status
  const getFooterAction = () => {
    // If status is pending_acceptance, show "View Request" as primary; else "View Details"
    const isPending = status === "pending_acceptance";
    return {
      label: isPending ? tSafe('view_request', 'View Request') : tSafe('view_details', 'View Details'),
      onPress: navigateToReview,
      isPrimary: isPending,
    };
  };

  const footerAction = getFooterAction();

  // Safe data access with fallbacks
  const apartmentName = schedule.apartment_name || tSafe('unknown_property', 'Unknown Property');
  const address = schedule.address || tSafe('address_not_available', 'Address not available');
  const cleaningDate = schedule.cleaning_date;
  const cleaningTime = schedule.cleaning_time;
  const totalFee = schedule.total_cleaning_fee || '0';
  const hostInfo = scheduleData.hostInfo || {};
  const duration = schedule.estimated_duration || '2-3 hrs';

  // Use location data if available, otherwise fall back to original address
  const displayAddress = locationData.city && locationData.state 
    ? `${locationData.city}, ${locationData.state}`
    : address;

  // If no request or scheduleData, show error state
  if (!request || !scheduleData) {
    return (
      <View style={styles.cardContainer}>
        <Text style={styles.errorText}>{tSafe('invalid_schedule_data', 'Invalid schedule data')}</Text>
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
      <TouchableOpacity 
        onPress={footerAction.onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
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
                color="#64748B" 
              />
              <Text style={styles.address} numberOfLines={1}>
                {displayAddress}
              </Text>
            </View>
          </View>
          
          <View style={styles.priceChip}>
            <Text style={styles.priceText}>
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
              color="#64748B" 
            />
            <Text style={styles.detailText}>
              {cleaningDate ? moment(cleaningDate).format('MMM D') : tSafe('tbd', 'TBD')}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <MaterialCommunityIcons 
              name="clock-outline" 
              size={16} 
              color="#64748B" 
            />
            <Text style={styles.detailText}>
              {cleaningTime ? moment(cleaningTime, 'h:mm:ss A').format('h:mm A') : tSafe('tbd', 'TBD')}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <MaterialCommunityIcons 
              name="timer-outline" 
              size={16} 
              color="#64748B" 
            />
            <Text style={styles.detailText}>{duration}</Text>
          </View>
        </View>

        {/* Footer with Host and Action */}
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
                  color="#64748B" 
                />
              </View>
            }
            <Text style={styles.hostName}>
              {hostInfo?.firstname || tSafe('host', 'Host')}
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
              name="arrow-right" 
              size={16} 
              color={footerAction.isPrimary ? '#FFF' : COLORS.primary} 
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginVertical: 8,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#c9c9c9",
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  propertyInfo: {
    flex: 1,
    marginRight: 12,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 6,
    flex: 1,
  },
  priceChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
    marginLeft: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  defaultAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  hostName: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
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
    marginRight: 6,
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