// import React, { useState, useEffect } from 'react';
// import {
//   StyleSheet,
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
//   Modal,
//   Dimensions,
// } from 'react-native';
// import { Card, ProgressBar } from 'react-native-paper';
// import { LinearGradient } from 'expo-linear-gradient';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import * as Location from 'expo-location';
// import moment from 'moment';
// import COLORS from '../../../constants/colors';
// import ROUTES from '../../../constants/routes';
// import { useNavigation } from '@react-navigation/native';
// import userService from '../../../services/connection/userService';
// import { tSafe } from '../../../utils/tSafe'; // added import

// const { width } = Dimensions.get('window');

// const ClockIn = ({ route }) => {
//   const { schedule, cleaner } = route.params;
//   const navigation = useNavigation();

//   const [location, setLocation] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [hostPushToken, setHostPushToken] = useState('');

//   // Helper to format distance (miles if >100m, else meters)
//   const formatDistance = (distanceKm) => {
//     if (distanceKm === null) return '...';
//     const meters = distanceKm * 1000;
//     if (meters <= 100) {
//       return tSafe('distance_meters', '{meters} meters', { meters: Math.round(meters) });
//     } else {
//       const miles = distanceKm * 0.621371;
//       return tSafe('distance_miles', '{miles} miles', { miles: miles.toFixed(1) });
//     }
//   };

//   // const formatDistance = (distanceKm) => {
//   //   if (distanceKm === null) return null;
  
//   //   const meters = distanceKm * 1000;
  
//   //   if (meters <= 100) {
//   //     return Math.round(meters); // e.g. 85
//   //   } else {
//   //     const miles = distanceKm * 0.621371;
//   //     return Number(miles.toFixed(1)); // e.g. 1.2
//   //   }
//   // };

  

//   useEffect(() => {
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert(
//           tSafe('permission_required', 'Permission required'),
//           tSafe('location_permission_needed', 'Location access is needed to clock in.')
//         );
//         return;
//       }
//       const userLocation = await Location.getCurrentPositionAsync({});
//       setLocation(userLocation);
//       if (schedule.schedule.apartment_latitude && schedule.schedule.apartment_longitude) {
//         const dist = calculateDistance(
//           userLocation.coords.latitude,
//           userLocation.coords.longitude,
//           schedule.schedule.apartment_latitude,
//           schedule.schedule.apartment_longitude
//         );
//         setDistance(dist);
//       }
//     })();
//     fetchHostPushTokens();
//   }, []);

//   const fetchHostPushTokens = async () => {
//     try {
//       const response = await userService.getUserPushTokens(schedule.hostInfo.userId);
//       setHostPushToken(response.data.tokens);
//     } catch (error) {
//       console.error('Error fetching host push tokens:', error);
//     }
//   };

//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371;
//     const dLat = ((lat2 - lat1) * Math.PI) / 180;
//     const dLon = ((lon2 - lon1) * Math.PI) / 180;
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos((lat1 * Math.PI) / 180) *
//         Math.cos((lat2 * Math.PI) / 180) *
//         Math.sin(dLon / 2) *
//         Math.sin(dLon / 2);
//     return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   };

//   const handleClockIn = async () => {
//     setLoading(true);
//     try {
//       const userLocation = await Location.getCurrentPositionAsync({});
//       const dist = calculateDistance(
//         userLocation.coords.latitude,
//         userLocation.coords.longitude,
//         schedule.schedule.apartment_latitude,
//         schedule.schedule.apartment_longitude
//       );

//       if (dist > 0.05) {
//         Alert.alert(
//           tSafe('clock_in_failed', 'Clock‑In Failed'),
//           tSafe(
//             'clock_in_distance_fail',
//             'You are {distance} away. You must be within 50 meters (0.03 miles) to clock in.',
//             { distance: formatDistance(dist) }
//           ),
//           [{ text: tSafe('ok', 'OK') }]
//         );
//         setLoading(false);
//         return;
//       }

//       const data = { cleanerId: cleaner?.cleanerId, scheduleId: schedule._id };
//       await userService.clockIn(data);

//       if (hostPushToken) {
//         sendPushNotifications(
//           hostPushToken,
//           tSafe('cleaner_clocked_in_title', 'Cleaner Clocked In'),
//           tSafe('cleaner_clocked_in_message', '{name} has started cleaning.', {
//             name: `${cleaner?.firstname} ${cleaner?.lastname}`,
//           }),
//           {
//             screen: ROUTES.host_task_progress,
//             params: { scheduleId: schedule._id },
//           }
//         );
//       }

//       navigation.replace(ROUTES.cleaner_attach_task_photos, {
//         scheduleId: schedule._id,
//         hostId: schedule.hostInfo.userId,
//       });
//     } catch (error) {
//       console.error('Clock‑in error:', error);
//       Alert.alert(tSafe('error', 'Error'), tSafe('failed_to_clock_in', 'Failed to clock in. Please try again.'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startTime = schedule.schedule.cleaning_time;
//   const duration = schedule?.schedule?.total_cleaning_time || 0;
//   const endTime = moment(startTime, 'hh:mm A').add(duration, 'minutes').format('hh:mm A');

//   const isWithinRange = distance !== null && distance <= 0.05;
//   const distanceDisplay = formatDistance(distance);
//   const distanceMessage = isWithinRange
//     ? tSafe('within_range_message', 'You are within range ({distance}) – ready to clock in.', {
//         distance: distanceDisplay,
//       })
//     : distance !== null
//     ? tSafe('out_of_range_message', 'You are {distance} away. Please move within 50 meters (0.03 miles).', {
//         distance: distanceDisplay,
//       })
//     : tSafe('calculating_distance', 'Calculating distance...');

//   const progress = distance !== null ? Math.min(distance / 0.05, 1) : 0;

//   return (
//     <View style={styles.container}>
//       <Modal transparent visible={loading}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <ActivityIndicator size="large" color={COLORS.primary} />
//             <Text style={styles.modalText}>{tSafe('clocking_in', 'Clocking in...')}</Text>
//           </View>
//         </View>
//       </Modal>

//       <LinearGradient
//         colors={[COLORS.primary, COLORS.primaryDark || COLORS.primary]}
//         style={styles.headerGradient}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 0 }}
//       >
//         <View style={styles.headerContent}>
//           <MaterialIcons name="timer" size={32} color="#fff" />
//           <Text style={styles.headerTitle}>{tSafe('clock_in', 'Clock In')}</Text>
//         </View>
//       </LinearGradient>

//       <Card style={styles.card}>
//         <View style={styles.cleanerInfo}>
//           <Image source={{ uri: cleaner?.avatar }} style={styles.avatar} />
//           <View>
//             <Text style={styles.cleanerName}>
//               {cleaner?.firstname} {cleaner?.lastname}
//             </Text>
//             <Text style={styles.cleanerRole}>{tSafe('cleaner', 'Cleaner')}</Text>
//           </View>
//         </View>
//       </Card>

//       <Card style={styles.card}>
//         <View style={styles.sectionRow}>
//           <MaterialIcons name="location-on" size={20} color={COLORS.gray} />
//           <Text style={styles.sectionTitle}>{tSafe('property_address', 'Property Address')}</Text>
//         </View>
//         <Text style={styles.address}>{schedule.schedule.address}</Text>

//         <View style={styles.divider} />

//         <View style={styles.sectionRow}>
//           <MaterialIcons name="schedule" size={20} color={COLORS.gray} />
//           <Text style={styles.sectionTitle}>{tSafe('schedule', 'Schedule')}</Text>
//         </View>
//         <View style={styles.timeRow}>
//           <View>
//             <Text style={styles.timeLabel}>{tSafe('start', 'Start')}</Text>
//             <Text style={styles.timeValue}>{moment(startTime, 'hh:mm A').format('h:mm A')}</Text>
//           </View>
//           <View>
//             <Text style={styles.timeLabel}>{tSafe('end', 'End')}</Text>
//             <Text style={styles.timeValue}>{endTime}</Text>
//           </View>
//         </View>
//         <Text style={styles.date}>{moment(schedule.schedule.cleaning_date).format('dddd, MMM D, YYYY')}</Text>
//       </Card>

//       <Card style={styles.card}>
//         <View style={styles.sectionRow}>
//           <MaterialIcons name="gps-fixed" size={20} color={COLORS.gray} />
//           <Text style={styles.sectionTitle}>{tSafe('location_check', 'Location Check')}</Text>
//         </View>
//         <View style={styles.distanceContainer}>
//           <Text style={styles.distanceText}>{distanceMessage}</Text>
//           {distance !== null && (
//             <>
//               <ProgressBar
//                 progress={progress}
//                 color={isWithinRange ? COLORS.success : COLORS.warning}
//                 style={styles.progressBar}
//               />
//               <Text style={styles.progressLabel}>
//                 {tSafe('progress_percent', '{percent}% of required range', {
//                   percent: Math.min(progress * 100, 100).toFixed(0),
//                 })}
//               </Text>
//             </>
//           )}
//         </View>
//       </Card>

//       <TouchableOpacity
//         style={[styles.clockInButton, !isWithinRange && styles.clockInButtonDisabled]}
//         onPress={handleClockIn}
//         disabled={loading || !isWithinRange}
//       >
//         <MaterialIcons name="login" size={24} color="#fff" />
//         <Text style={styles.clockInText}>{tSafe('clock_in', 'Clock In')}</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F7FA',
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 24,
//     alignItems: 'center',
//     width: width * 0.7,
//   },
//   modalText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: '#333',
//   },
//   headerGradient: {
//     paddingTop: 40,
//     paddingBottom: 24,
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#fff',
//     marginLeft: 12,
//   },
//   card: {
//     marginHorizontal: 20,
//     marginTop: 20,
//     padding: 20,
//     borderRadius: 24,
//     backgroundColor: '#fff',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//   },
//   cleanerInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatar: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     marginRight: 16,
//     borderWidth: 2,
//     borderColor: COLORS.primary,
//   },
//   cleanerName: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#1F2937',
//   },
//   cleanerRole: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginTop: 4,
//   },
//   sectionRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 2,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1F2937',
//     marginLeft: 8,
//   },
//   address: {
//     fontSize: 15,
//     color: '#4B5563',
//     lineHeight: 22,
//     marginBottom: 16,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#E5E7EB',
//     marginVertical: 16,
//   },
//   timeRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   timeLabel: {
//     fontSize: 13,
//     color: '#9CA3AF',
//     marginBottom: 4,
//   },
//   timeValue: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#1F2937',
//   },
//   date: {
//     fontSize: 14,
//     color: '#6B7280',
//     textAlign: 'center',
//     marginTop: 8,
//   },
//   distanceContainer: {
//     marginTop: 8,
//   },
//   distanceText: {
//     fontSize: 14,
//     color: '#4B5563',
//     marginBottom: 12,
//   },
//   progressBar: {
//     height: 6,
//     borderRadius: 3,
//   },
//   progressLabel: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginTop: 6,
//     textAlign: 'center',
//   },
//   clockInButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     marginHorizontal: 20,
//     marginTop: 32,
//     marginBottom: 32,
//     paddingVertical: 16,
//     borderRadius: 48,
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   clockInButtonDisabled: {
//     backgroundColor: '#9CA3AF',
//     shadowOpacity: 0,
//     elevation: 0,
//   },
//   clockInText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#fff',
//     marginLeft: 12,
//   },
// });

// export default ClockIn;



// import React, { useState, useEffect } from 'react';
// import {
//   StyleSheet,
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
//   Modal,
//   Dimensions,
//   ScrollView,  // ✅ added ScrollView
// } from 'react-native';
// import { Card, ProgressBar } from 'react-native-paper';
// import { LinearGradient } from 'expo-linear-gradient';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import * as Location from 'expo-location';
// import moment from 'moment';
// import COLORS from '../../../constants/colors';
// import ROUTES from '../../../constants/routes';
// import { useNavigation } from '@react-navigation/native';
// import userService from '../../../services/connection/userService';
// import { tSafe } from '../../../utils/tSafe';

// const { width } = Dimensions.get('window');

// const ClockIn = ({ route }) => {
//   const { schedule, cleaner } = route.params;
//   const navigation = useNavigation();

//   const [location, setLocation] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [hostPushToken, setHostPushToken] = useState('');

//   const formatDistance = (distanceKm) => {
//     if (distanceKm === null) return '...';
//     const meters = distanceKm * 1000;
//     if (meters <= 100) {
//       return tSafe('distance_meters', '{meters} meters', { meters: Math.round(meters) });
//     } else {
//       const miles = distanceKm * 0.621371;
//       return tSafe('distance_miles', '{miles} miles', { miles: miles.toFixed(1) });
//     }
//   };

//   useEffect(() => {
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert(
//           tSafe('permission_required', 'Permission required'),
//           tSafe('location_permission_needed', 'Location access is needed to clock in.')
//         );
//         return;
//       }
//       const userLocation = await Location.getCurrentPositionAsync({});
//       setLocation(userLocation);
//       if (schedule.schedule.apartment_latitude && schedule.schedule.apartment_longitude) {
//         const dist = calculateDistance(
//           userLocation.coords.latitude,
//           userLocation.coords.longitude,
//           schedule.schedule.apartment_latitude,
//           schedule.schedule.apartment_longitude
//         );
//         alert(dist)
//         setDistance(dist);
//       }
//     })();
//     fetchHostPushTokens();
//   }, []);

//   const fetchHostPushTokens = async () => {
//     try {
//       const response = await userService.getUserPushTokens(schedule.hostInfo.userId);
//       setHostPushToken(response.data.tokens);
//     } catch (error) {
//       console.error('Error fetching host push tokens:', error);
//     }
//   };

//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371;
//     const dLat = ((lat2 - lat1) * Math.PI) / 180;
//     const dLon = ((lon2 - lon1) * Math.PI) / 180;
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos((lat1 * Math.PI) / 180) *
//         Math.cos((lat2 * Math.PI) / 180) *
//         Math.sin(dLon / 2) *
//         Math.sin(dLon / 2);
//     return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   };

//   const handleClockIn = async () => {
//     setLoading(true);
//     try {
//       const userLocation = await Location.getCurrentPositionAsync({});
//       const dist = calculateDistance(
//         userLocation.coords.latitude,
//         userLocation.coords.longitude,
//         schedule.schedule.apartment_latitude,
//         schedule.schedule.apartment_longitude
//       );

//       if (dist > 0.05) {
//         Alert.alert(
//           tSafe('clock_in_failed', 'Clock‑In Failed'),
//           tSafe(
//             'clock_in_distance_fail',
//             'You are {distance} away. You must be within 50 meters (0.03 miles) to clock in.',
//             { distance: formatDistance(dist) }
//           ),
//           [{ text: tSafe('ok', 'OK') }]
//         );
//         setLoading(false);
//         return;
//       }

//       const data = { cleanerId: cleaner?.cleanerId, scheduleId: schedule._id };
//       await userService.clockIn(data);

//       if (hostPushToken) {
//         sendPushNotifications(
//           hostPushToken,
//           tSafe('cleaner_clocked_in_title', 'Cleaner Clocked In'),
//           tSafe('cleaner_clocked_in_message', '{name} has started cleaning.', {
//             name: `${cleaner?.firstname} ${cleaner?.lastname}`,
//           }),
//           {
//             screen: ROUTES.host_task_progress,
//             params: { scheduleId: schedule._id },
//           }
//         );
//       }

//       navigation.replace(ROUTES.cleaner_attach_task_photos, {
//         scheduleId: schedule._id,
//         hostId: schedule.hostInfo.userId,
//       });
//     } catch (error) {
//       console.error('Clock‑in error:', error);
//       Alert.alert(tSafe('error', 'Error'), tSafe('failed_to_clock_in', 'Failed to clock in. Please try again.'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startTime = schedule.schedule.cleaning_time;
//   const duration = schedule?.schedule?.total_cleaning_time || 0;
//   const endTime = moment(startTime, 'hh:mm A').add(duration, 'minutes').format('hh:mm A');

//   const isWithinRange = distance !== null && distance <= 0.05;
//   const distanceDisplay = formatDistance(distance);
//   const distanceMessage = isWithinRange
//     ? tSafe('within_range_message', 'You are within range ({distance}) – ready to clock in.', {
//         distance: distanceDisplay,
//       })
//     : distance !== null
//     ? tSafe('out_of_range_message', 'You are {distance} away. Please move within 50 meters (0.03 miles).', {
//         distance: distanceDisplay,
//       })
//     : tSafe('calculating_distance', 'Calculating distance...');

//   const progress = distance !== null ? Math.min(distance / 0.05, 1) : 0;

//   return (
//     <View style={styles.container}>
//       <Modal transparent visible={loading}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <ActivityIndicator size="large" color={COLORS.primary} />
//             <Text style={styles.modalText}>{tSafe('clocking_in', 'Clocking in...')}</Text>
//           </View>
//         </View>
//       </Modal>

//       <LinearGradient
//         colors={[COLORS.primary, COLORS.primaryDark || COLORS.primary]}
//         style={styles.headerGradient}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 0 }}
//       >
//         <View style={styles.headerContent}>
//           <MaterialIcons name="timer" size={32} color="#fff" />
//           <Text style={styles.headerTitle}>{tSafe('clock_in', 'Clock In')}</Text>
//         </View>
//       </LinearGradient>

//       {/* ✅ Wrap all scrollable content in a ScrollView */}
//       <ScrollView
//         style={styles.scrollView}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         <Card style={styles.card}>
//           <View style={styles.cleanerInfo}>
//             <Image source={{ uri: cleaner?.avatar }} style={styles.avatar} />
//             <View>
//               <Text style={styles.cleanerName}>
//                 {cleaner?.firstname} {cleaner?.lastname}
//               </Text>
//               <Text style={styles.cleanerRole}>{tSafe('cleaner', 'Cleaner')}</Text>
//             </View>
//           </View>
//         </Card>

//         <Card style={styles.card}>
//           <View style={styles.sectionRow}>
//             <MaterialIcons name="location-on" size={20} color={COLORS.gray} />
//             <Text style={styles.sectionTitle}>{tSafe('property_address', 'Property Address')}</Text>
//           </View>
//           <Text style={styles.address}>{schedule.schedule.address}</Text>

//           <View style={styles.divider} />

//           <View style={styles.sectionRow}>
//             <MaterialIcons name="schedule" size={20} color={COLORS.gray} />
//             <Text style={styles.sectionTitle}>{tSafe('schedule', 'Schedule')}</Text>
//           </View>
//           <View style={styles.timeRow}>
//             <View>
//               <Text style={styles.timeLabel}>{tSafe('start', 'Start')}</Text>
//               <Text style={styles.timeValue}>{moment(startTime, 'hh:mm A').format('h:mm A')}</Text>
//             </View>
//             <View>
//               <Text style={styles.timeLabel}>{tSafe('end', 'End')}</Text>
//               <Text style={styles.timeValue}>{endTime}</Text>
//             </View>
//           </View>
//           <Text style={styles.date}>{moment(schedule.schedule.cleaning_date).format('dddd, MMM D, YYYY')}</Text>
//         </Card>

//         <Card style={styles.card}>
//           <View style={styles.sectionRow}>
//             <MaterialIcons name="gps-fixed" size={20} color={COLORS.gray} />
//             <Text style={styles.sectionTitle}>{tSafe('location_check', 'Location Check')}</Text>
//           </View>
//           <View style={styles.distanceContainer}>
//             <Text style={styles.distanceText}>{distanceMessage}</Text>
//             {distance !== null && (
//               <>
//                 <ProgressBar
//                   progress={progress}
//                   color={isWithinRange ? COLORS.success : COLORS.warning}
//                   style={styles.progressBar}
//                 />
//                 <Text style={styles.progressLabel}>
//                   {tSafe('progress_percent', '{percent}% of required range', {
//                     percent: Math.min(progress * 100, 100).toFixed(0),
//                   })}
//                 </Text>
//               </>
//             )}
//           </View>
//         </Card>

//         {/* Button inside ScrollView so it can be reached by scrolling */}
//         <TouchableOpacity
//           style={[styles.clockInButton, !isWithinRange && styles.clockInButtonDisabled]}
//           onPress={handleClockIn}
//           disabled={loading || !isWithinRange}
//         >
//           <MaterialIcons name="login" size={24} color="#fff" />
//           <Text style={styles.clockInText}>{tSafe('clock_in', 'Clock In')}</Text>
//         </TouchableOpacity>

//         {/* Add extra bottom space for comfortable scrolling */}
//         <View style={styles.bottomSpacer} />
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F7FA',
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 24,
//     alignItems: 'center',
//     width: width * 0.7,
//   },
//   modalText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: '#333',
//   },
//   headerGradient: {
//     paddingTop: 40,
//     paddingBottom: 24,
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#fff',
//     marginLeft: 12,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingHorizontal: 20,
//     paddingTop: 20,
//     paddingBottom: 40,
//   },
//   card: {
//     padding: 20,
//     borderRadius: 24,
//     backgroundColor: '#fff',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     marginBottom: 20,
//   },
//   cleanerInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatar: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     marginRight: 16,
//     borderWidth: 2,
//     borderColor: COLORS.primary,
//   },
//   cleanerName: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#1F2937',
//   },
//   cleanerRole: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginTop: 4,
//   },
//   sectionRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 2,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1F2937',
//     marginLeft: 8,
//   },
//   address: {
//     fontSize: 15,
//     color: '#4B5563',
//     lineHeight: 22,
//     marginBottom: 16,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#E5E7EB',
//     marginVertical: 16,
//   },
//   timeRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   timeLabel: {
//     fontSize: 13,
//     color: '#9CA3AF',
//     marginBottom: 4,
//   },
//   timeValue: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#1F2937',
//   },
//   date: {
//     fontSize: 14,
//     color: '#6B7280',
//     textAlign: 'center',
//     marginTop: 8,
//   },
//   distanceContainer: {
//     marginTop: 8,
//   },
//   distanceText: {
//     fontSize: 14,
//     color: '#4B5563',
//     marginBottom: 12,
//   },
//   progressBar: {
//     height: 6,
//     borderRadius: 3,
//   },
//   progressLabel: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginTop: 6,
//     textAlign: 'center',
//   },
//   clockInButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     paddingVertical: 16,
//     borderRadius: 48,
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 5,
//     marginTop: 12,
//   },
//   clockInButtonDisabled: {
//     backgroundColor: '#9CA3AF',
//     shadowOpacity: 0,
//     elevation: 0,
//   },
//   clockInText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#fff',
//     marginLeft: 12,
//   },
//   bottomSpacer: {
//     height: 20,
//   },
// });

// export default ClockIn;





import * as Location from 'expo-location';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Card, ProgressBar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import COLORS from '../../../constants/colors';
import ROUTES from '../../../constants/routes';
import { useNavigation } from '@react-navigation/native';
import userService from '../../../services/connection/userService';
import { tSafe } from '../../../utils/tSafe';

const { width } = Dimensions.get('window');

// ⚙️ Configurable distance threshold (in km) – 0.1 km = 100 meters
const DISTANCE_THRESHOLD_KM = 0.1;

const ClockIn = ({ route }) => {
  const { schedule, cleaner } = route.params;
  const navigation = useNavigation();

  const [location, setLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hostPushToken, setHostPushToken] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  // Format distance for display
  const formatDistance = (distanceKm) => {
    if (distanceKm === null || distanceKm === undefined) return '...';
    const meters = distanceKm * 1000;
    if (meters <= 100) {
      return tSafe('distance_meters', '{meters} meters', { meters: Math.round(meters) });
    } else {
      const miles = distanceKm * 0.621371;
      return tSafe('distance_miles', '{miles} miles', { miles: miles.toFixed(1) });
    }
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Fetch host push tokens
  const fetchHostPushTokens = async () => {
    try {
      const response = await userService.getUserPushTokens(schedule.hostInfo.userId);
      setHostPushToken(response.data.tokens);
    } catch (error) {
      console.error('Error fetching host push tokens:', error);
    }
  };

  // Initial location fetch and distance calculation
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Location permission denied');
          Alert.alert(
            tSafe('permission_required', 'Permission required'),
            tSafe('location_permission_needed', 'Location access is needed to clock in.')
          );
          return;
        }

        // Use high accuracy
        const userLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
        });
        setLocation(userLocation);

        const aptLat = schedule.schedule.apartment_latitude;
        const aptLng = schedule.schedule.apartment_longitude;

        console.log(`🧭 User location: ${userLocation.coords.latitude}, ${userLocation.coords.longitude}`);
        console.log(`🏢 Apartment location: ${aptLat}, ${aptLng}`);

        if (aptLat && aptLng) {
          const dist = calculateDistance(
            userLocation.coords.latitude,
            userLocation.coords.longitude,
            aptLat,
            aptLng
          );
          console.log(`📏 Distance: ${dist} km (${(dist * 1000).toFixed(0)} meters)`);
          setDistance(dist);
        } else {
          setErrorMsg('Apartment coordinates missing');
          Alert.alert(
            tSafe('error', 'Error'),
            tSafe('apartment_coordinates_missing', 'Apartment coordinates are missing. Please contact support.')
          );
        }
      } catch (error) {
        console.error('Location error:', error);
        setErrorMsg(error.message);
        Alert.alert(tSafe('error', 'Error'), tSafe('failed_get_location', 'Failed to get your location. Please try again.'));
      }
    })();

    fetchHostPushTokens();
  }, []);

  // Handle clock‑in
  const handleClockIn = async () => {
    setLoading(true);
    try {
      // Refresh location before clock‑in
      const userLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const dist = calculateDistance(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        schedule.schedule.apartment_latitude,
        schedule.schedule.apartment_longitude
      );

      // Check distance again
      if (dist > DISTANCE_THRESHOLD_KM) {
        Alert.alert(
          tSafe('clock_in_failed', 'Clock‑In Failed'),
          tSafe(
            'clock_in_distance_fail',
            'You are {distance} away. You must be within {threshold} meters to clock in.',
            {
              distance: formatDistance(dist),
              threshold: Math.round(DISTANCE_THRESHOLD_KM * 1000),
            }
          ),
          [{ text: tSafe('ok', 'OK') }]
        );
        setLoading(false);
        return;
      }

      // Proceed with clock‑in
      const data = { cleanerId: cleaner?.cleanerId, scheduleId: schedule._id };
      await userService.clockIn(data);

      
      // Navigate to attach photos screen
      navigation.replace(ROUTES.cleaner_attach_task_photos, {
        scheduleId: schedule._id,
        hostId: schedule.hostInfo.userId,
      });
    } catch (error) {
      console.error('Clock‑in error:', error);
      Alert.alert(tSafe('error', 'Error'), tSafe('failed_to_clock_in', 'Failed to clock in. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Compute display values
  const isWithinRange = distance !== null && distance <= DISTANCE_THRESHOLD_KM;
  const distanceDisplay = formatDistance(distance);
  const distanceMessage = isWithinRange
    ? tSafe('within_range_message', 'You are within range ({distance}) – ready to clock in.', {
        distance: distanceDisplay,
      })
    : distance !== null
    ? tSafe('out_of_range_message', 'You are {distance} away. Please move within {threshold} meters.', {
        distance: distanceDisplay,
        threshold: Math.round(DISTANCE_THRESHOLD_KM * 1000),
      })
    : tSafe('calculating_distance', 'Calculating distance...');

  const progress = distance !== null ? Math.min(distance / DISTANCE_THRESHOLD_KM, 1) : 0;

  // Time display
  const startTime = schedule.schedule.cleaning_time;
  const duration = schedule?.schedule?.total_cleaning_time || 0;
  const endTime = moment(startTime, 'hh:mm A').add(duration, 'minutes').format('hh:mm A');

  return (
    <View style={styles.container}>
      <Modal transparent visible={loading}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.modalText}>{tSafe('clocking_in', 'Clocking in...')}</Text>
          </View>
        </View>
      </Modal>

      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark || COLORS.primary]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <MaterialIcons name="timer" size={32} color="#fff" />
          <Text style={styles.headerTitle}>{tSafe('clock_in', 'Clock In')}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.card}>
          <View style={styles.cleanerInfo}>
            <Image source={{ uri: cleaner?.avatar }} style={styles.avatar} />
            <View>
              <Text style={styles.cleanerName}>
                {cleaner?.firstname} {cleaner?.lastname}
              </Text>
              <Text style={styles.cleanerRole}>{tSafe('cleaner', 'Cleaner')}</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.sectionRow}>
            <MaterialIcons name="location-on" size={20} color={COLORS.gray} />
            <Text style={styles.sectionTitle}>{tSafe('property_address', 'Property Address')}</Text>
          </View>
          <Text style={styles.address}>{schedule.schedule.address}</Text>

          <View style={styles.divider} />

          <View style={styles.sectionRow}>
            <MaterialIcons name="schedule" size={20} color={COLORS.gray} />
            <Text style={styles.sectionTitle}>{tSafe('schedule', 'Schedule')}</Text>
          </View>
          <View style={styles.timeRow}>
            <View>
              <Text style={styles.timeLabel}>{tSafe('start', 'Start')}</Text>
              <Text style={styles.timeValue}>{moment(startTime, 'hh:mm A').format('h:mm A')}</Text>
            </View>
            <View>
              <Text style={styles.timeLabel}>{tSafe('end', 'End')}</Text>
              <Text style={styles.timeValue}>{endTime}</Text>
            </View>
          </View>
          <Text style={styles.date}>{moment(schedule.schedule.cleaning_date).format('dddd, MMM D, YYYY')}</Text>
        </Card>

        <Card style={styles.card}>
          <View style={styles.sectionRow}>
            <MaterialIcons name="gps-fixed" size={20} color={COLORS.gray} />
            <Text style={styles.sectionTitle}>{tSafe('location_check', 'Location Check')}</Text>
          </View>
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}>{distanceMessage}</Text>
            {distance !== null && (
              <>
                <ProgressBar
                  progress={progress}
                  color={isWithinRange ? COLORS.success : COLORS.warning}
                  style={styles.progressBar}
                />
                <Text style={styles.progressLabel}>
                  {tSafe('progress_percent', '{percent}% of required range', {
                    percent: Math.min(progress * 100, 100).toFixed(0),
                  })}
                </Text>
              </>
            )}
          </View>
        </Card>

        <TouchableOpacity
          style={[styles.clockInButton, (!isWithinRange || loading) && styles.clockInButtonDisabled]}
          onPress={handleClockIn}
          disabled={loading || !isWithinRange}
        >
          <MaterialIcons name="login" size={24} color="#fff" />
          <Text style={styles.clockInText}>{tSafe('clock_in', 'Clock In')}</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: width * 0.7,
  },
  modalText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  card: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    marginBottom: 20,
  },
  cleanerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  cleanerName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  cleanerRole: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  address: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  distanceContainer: {
    marginTop: 8,
  },
  distanceText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
    textAlign: 'center',
  },
  clockInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 48,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 12,
  },
  clockInButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  clockInText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 12,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default ClockIn;

