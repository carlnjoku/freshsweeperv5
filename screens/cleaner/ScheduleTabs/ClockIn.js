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

import ROUTES from '../../../constants/routes';
import { useNavigation } from '@react-navigation/native';
import userService from '../../../services/connection/userService';
import { tSafe } from '../../../utils/tSafe';

import { useTheme } from '../../../theme';
import AppText from '../../../ui/AppText';

const { width } = Dimensions.get('window');

// Maximum permitted distance from the property: 100 meters.
const DISTANCE_THRESHOLD_KM = 0.1;

const ClockIn = ({ route }) => {
  const { schedule, cleaner } = route.params;
  const navigation = useNavigation();

  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [location, setLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hostPushToken, setHostPushToken] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  // --------------------------------------------------
  // DISTANCE FORMATTING
  // --------------------------------------------------

  const formatDistance = (distanceKm) => {
    if (
      distanceKm === null ||
      distanceKm === undefined ||
      !Number.isFinite(distanceKm)
    ) {
      return '...';
    }

    const meters = distanceKm * 1000;

    if (meters <= 1000) {
      return tSafe(
        'distance_meters',
        '{meters} meters',
        {
          meters: Math.round(meters),
        }
      );
    }

    const miles = distanceKm * 0.621371;

    return tSafe(
      'distance_miles',
      '{miles} miles',
      {
        miles: miles.toFixed(1),
      }
    );
  };

  // --------------------------------------------------
  // DISTANCE CALCULATION
  // Haversine formula
  // --------------------------------------------------

  const calculateDistance = (
    lat1,
    lon1,
    lat2,
    lon2
  ) => {
    const coordinates = [lat1, lon1, lat2, lon2];

    if (
      coordinates.some(
        (coordinate) =>
          coordinate === null ||
          coordinate === undefined ||
          coordinate === '' ||
          !Number.isFinite(Number(coordinate))
      )
    ) {
      return null;
    }

    const latitude1 = Number(lat1);
    const longitude1 = Number(lon1);
    const latitude2 = Number(lat2);
    const longitude2 = Number(lon2);

    const toRadians = (degrees) =>
      (degrees * Math.PI) / 180;

    const dLat = toRadians(latitude2 - latitude1);
    const dLon = toRadians(longitude2 - longitude1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(latitude1)) *
        Math.cos(toRadians(latitude2)) *
        Math.sin(dLon / 2) ** 2;

    // Protect against floating-point rounding errors.
    const boundedA = Math.max(0, Math.min(1, a));

    const earthRadiusKm = 6371;

    return (
      earthRadiusKm *
      2 *
      Math.atan2(
        Math.sqrt(boundedA),
        Math.sqrt(1 - boundedA)
      )
    );
  };

  // --------------------------------------------------
  // LOCATION HELPERS
  // --------------------------------------------------

  const getApartmentCoordinates = () => {
    const apartment = schedule?.schedule;

    const latitude = apartment?.apartment_latitude;
    const longitude = apartment?.apartment_longitude;

    if (
      latitude === null ||
      latitude === undefined ||
      latitude === '' ||
      longitude === null ||
      longitude === undefined ||
      longitude === ''
    ) {
      return null;
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return null;
    }

    return {
      latitude: lat,
      longitude: lng,
    };
  };

  // --------------------------------------------------
  // FETCH HOST PUSH TOKENS
  // --------------------------------------------------

  const fetchHostPushTokens = async () => {
    try {
      const hostId = schedule?.hostInfo?.userId;

      if (!hostId) {
        console.warn(
          'Host user ID is missing.'
        );
        return;
      }

      const response =
        await userService.getUserPushTokens(hostId);

      setHostPushToken(response?.data?.tokens || '');
    } catch (error) {
      console.error(
        'Error fetching host push tokens:',
        error
      );
    }
  };

  // --------------------------------------------------
  // INITIAL LOCATION FETCH
  // --------------------------------------------------

  useEffect(() => {
    let isMounted = true;

    const initializeLocation = async () => {
      try {
        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (!isMounted) return;

        if (status !== 'granted') {
          setErrorMsg('Location permission denied');

          Alert.alert(
            tSafe(
              'permission_required',
              'Permission required'
            ),
            tSafe(
              'location_permission_needed',
              'Location access is needed to clock in.'
            )
          );

          return;
        }

        const apartmentCoordinates =
          getApartmentCoordinates();

        if (!apartmentCoordinates) {
          setErrorMsg(
            'Apartment coordinates missing'
          );

          Alert.alert(
            tSafe('error', 'Error'),
            tSafe(
              'apartment_coordinates_missing',
              'Apartment coordinates are missing. Please contact support.'
            )
          );

          return;
        }

        const userLocation =
          await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

        if (!isMounted) return;

        setLocation(userLocation);

        const userLatitude =
          userLocation.coords.latitude;

        const userLongitude =
          userLocation.coords.longitude;

        console.log(
          `🧭 User location: ${userLatitude}, ${userLongitude}`
        );

        console.log(
          `🏢 Apartment location: ${apartmentCoordinates.latitude}, ${apartmentCoordinates.longitude}`
        );

        const calculatedDistance =
          calculateDistance(
            userLatitude,
            userLongitude,
            apartmentCoordinates.latitude,
            apartmentCoordinates.longitude
          );

        if (calculatedDistance === null) {
          setErrorMsg(
            'Unable to calculate distance'
          );
          return;
        }

        console.log(
          `📏 Distance: ${calculatedDistance.toFixed(3)} km (${(
            calculatedDistance * 1000
          ).toFixed(0)} meters)`
        );

        setDistance(calculatedDistance);
        setErrorMsg(null);
      } catch (error) {
        console.error(
          'Location error:',
          error
        );

        if (!isMounted) return;

        setErrorMsg(
          error?.message || 'Location error'
        );

        Alert.alert(
          tSafe('error', 'Error'),
          tSafe(
            'failed_get_location',
            'Failed to get your location. Please try again.'
          )
        );
      }
    };

    initializeLocation();
    fetchHostPushTokens();

    return () => {
      isMounted = false;
    };
  }, []);

  // --------------------------------------------------
  // HANDLE CLOCK-IN
  // --------------------------------------------------

  const handleClockIn = async () => {
    if (loading) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const apartmentCoordinates =
        getApartmentCoordinates();

      if (!apartmentCoordinates) {
        Alert.alert(
          tSafe('error', 'Error'),
          tSafe(
            'apartment_coordinates_missing',
            'Apartment coordinates are missing. Please contact support.'
          )
        );

        return;
      }

      // Refresh the cleaner's location before clock-in.
      const userLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      setLocation(userLocation);

      const calculatedDistance =
        calculateDistance(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          apartmentCoordinates.latitude,
          apartmentCoordinates.longitude
        );

      if (calculatedDistance === null) {
        Alert.alert(
          tSafe('error', 'Error'),
          tSafe(
            'failed_get_location',
            'Unable to verify your distance from the property. Please try again.'
          )
        );

        return;
      }

      setDistance(calculatedDistance);

      console.log(
        `📏 Clock-in distance: ${(calculatedDistance * 1000).toFixed(0)} meters`
      );

      // Enforce the 100-meter restriction.
      if (
        calculatedDistance > DISTANCE_THRESHOLD_KM
      ) {
        Alert.alert(
          tSafe(
            'clock_in_failed',
            'Clock-In Failed'
          ),
          tSafe(
            'clock_in_distance_fail',
            'You are {distance} away. You must be within {threshold} meters to clock in.',
            {
              distance: formatDistance(calculatedDistance),
              threshold: Math.round(
                DISTANCE_THRESHOLD_KM * 1000
              ),
            }
          ),
          [
            {
              text: tSafe('ok', 'OK'),
            },
          ]
        );

        return;
      }

      // Submit the clock-in request.
      const data = {
        cleanerId: cleaner?.cleanerId,
        scheduleId: schedule?._id,
      };

      if (!data.cleanerId || !data.scheduleId) {
        Alert.alert(
          tSafe('error', 'Error'),
          tSafe(
            'missing_clock_in_details',
            'Required clock-in information is missing.'
          )
        );

        return;
      }

      await userService.clockIn(data);

      // Navigate to the task-photo screen.
      navigation.replace(
        ROUTES.cleaner_attach_task_photos,
        {
          scheduleId: schedule._id,
          hostId: schedule.hostInfo.userId,
        }
      );
    } catch (error) {
      console.error(
        'Clock-in error:',
        error
      );

      Alert.alert(
        tSafe('error', 'Error'),
        tSafe(
          'failed_to_clock_in',
          'Failed to clock in. Please try again.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // DISPLAY VALUES
  // --------------------------------------------------

  const isWithinRange =
    distance !== null &&
    distance <= DISTANCE_THRESHOLD_KM;

  const distanceDisplay = formatDistance(distance);

  const distanceMessage = isWithinRange
    ? tSafe(
        'within_range_message',
        'You are within range ({distance}) – ready to clock in.',
        {
          distance: distanceDisplay,
        }
      )
    : distance !== null
      ? tSafe(
          'out_of_range_message',
          'You are {distance} away. Please move within {threshold} meters.',
          {
            distance: distanceDisplay,
            threshold: Math.round(
              DISTANCE_THRESHOLD_KM * 1000
            ),
          }
        )
      : tSafe(
          'calculating_distance',
          'Calculating distance...'
        );

  const progress =
    distance !== null
      ? Math.min(
          distance / DISTANCE_THRESHOLD_KM,
          1
        )
      : 0;

  // --------------------------------------------------
  // SCHEDULE TIME
  // --------------------------------------------------

  const startTime =
    schedule?.schedule?.cleaning_time;

  const duration =
    Number(
      schedule?.schedule?.total_cleaning_time || 0
    );

  // Supports both 12-hour and 24-hour time formats.
  const parsedStartTime = moment(
    startTime,
    [
      'hh:mm A',
      'h:mm A',
      'HH:mm:ss',
      'HH:mm',
    ],
    true
  );

  const validStartTime = parsedStartTime.isValid();

  const formattedStartTime = validStartTime
    ? parsedStartTime.format('h:mm A')
    : startTime || '--';

  const endTime =
    validStartTime && Number.isFinite(duration)
      ? parsedStartTime
          .clone()
          .add(duration, 'minutes')
          .format('h:mm A')
      : '--';

  const cleaningDate =
    schedule?.schedule?.cleaning_date;

  const formattedCleaningDate = cleaningDate
    ? moment(cleaningDate).format(
        'dddd, MMM D, YYYY'
      )
    : '--';

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <View style={styles.container}>
      {/* Loading Modal */}
      <Modal
        transparent
        visible={loading}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator
              size="large"
              color={theme.brand.primary}
            />

            <AppText style={styles.modalText}>
              {tSafe(
                'clocking_in',
                'Clocking in...'
              )}
            </AppText>
          </View>
        </View>
      </Modal>

      {/* ==========================================
          PROFILE-STYLE GRADIENT HEADER
      =========================================== */}

      <LinearGradient
        colors={[
          theme.brand.primary,
          theme.brand.secondary || theme.brand.primary,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        {/* Decorative Circles */}
        <View
          pointerEvents="none"
          style={styles.headerDecorationLarge}
        />

        <View
          pointerEvents="none"
          style={styles.headerDecorationSmall}
        />

        {/* Header Content */}
        <View style={styles.headerContent}>
          <View style={styles.headerHeading}>
            <AppText style={styles.headerEyebrow}>
              FRESHSWEEPER
            </AppText>

            <AppText style={styles.headerTitle}>
              {tSafe('clock_in', 'Clock In')}
            </AppText>

            <AppText style={styles.headerSubtitle}>
              {tSafe(
                'clock_in_subtitle',
                'Verify your location to start your job'
              )}
            </AppText>
          </View>

          <View style={styles.headerIconContainer}>
            <MaterialIcons
              name="timer"
              size={30}
              color={theme.text.inverse}
            />
          </View>
        </View>

        {/* Live Location Status */}
        <View style={styles.headerStatus}>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor:
                  distance === null
                    ? '#E5E7EB'
                    : isWithinRange
                      ? '#86EFAC'
                      : '#FCD34D',
              },
            ]}
          />

          <AppText style={styles.headerStatusText}>
            {distance === null
              ? tSafe(
                  'checking_location',
                  'Checking your location...'
                )
              : isWithinRange
                ? tSafe(
                    'location_verified',
                    'You are within clock-in range'
                  )
                : tSafe(
                    'move_closer',
                    'Move closer to the property'
                  )}
          </AppText>
        </View>
      </LinearGradient>

      {/* ==========================================
          MAIN CONTENT
      =========================================== */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cleaner Information */}
        <Card style={styles.card}>
          <View style={styles.cleanerInfo}>
            {cleaner?.avatar ? (
              <Image
                source={{ uri: cleaner.avatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons
                  name="person"
                  size={32}
                  color={theme.brand.primary}
                />
              </View>
            )}

            <View style={styles.cleanerTextContainer}>
              <AppText style={styles.cleanerName}>
                {cleaner?.firstname || ''}{' '}
                {cleaner?.lastname || ''}
              </AppText>

              <AppText style={styles.cleanerRole}>
                {tSafe('cleaner', 'Cleaner')}
              </AppText>
            </View>
          </View>
        </Card>

        {/* Property and Schedule */}
        <Card style={styles.card}>
          {/* Property Address */}
          <View style={styles.sectionRow}>
            <MaterialIcons
              name="location-on"
              size={21}
              color={theme.icon.muted}
            />

            <AppText style={styles.sectionTitle}>
              {tSafe(
                'property_address',
                'Property Address'
              )}
            </AppText>
          </View>

          <AppText style={styles.address}>
            {schedule?.schedule?.address ||
              tSafe(
                'address_unavailable',
                'Address unavailable'
              )}
          </AppText>

          <View style={styles.divider} />

          {/* Schedule */}
          <View style={styles.sectionRow}>
            <MaterialIcons
              name="schedule"
              size={21}
              color={theme.icon.muted}
            />

            <AppText style={styles.sectionTitle}>
              {tSafe('schedule', 'Schedule')}
            </AppText>
          </View>

          <View style={styles.timeRow}>
            <View style={styles.timeColumn}>
              <AppText style={styles.timeLabel}>
                {tSafe('start', 'Start')}
              </AppText>

              <AppText style={styles.timeValue}>
                {formattedStartTime}
              </AppText>
            </View>

            <View style={styles.timeColumn}>
              <AppText style={styles.timeLabel}>
                {tSafe('end', 'End')}
              </AppText>

              <AppText style={styles.timeValue}>
                {endTime}
              </AppText>
            </View>
          </View>

          <View style={styles.dateContainer}>
            <MaterialIcons
              name="calendar-today"
              size={16}
              color={theme.brand.primary}
            />

            <AppText style={styles.date}>
              {formattedCleaningDate}
            </AppText>
          </View>
        </Card>

        {/* Location Verification */}
        <Card style={styles.card}>
          <View style={styles.sectionRow}>
            <MaterialIcons
              name="gps-fixed"
              size={21}
              color={theme.icon.muted}
            />

            <AppText style={styles.sectionTitle}>
              {tSafe(
                'location_check',
                'Location Check'
              )}
            </AppText>
          </View>

          <View style={styles.distanceContainer}>
            <View
              style={[
                styles.locationStatusBox,
                isWithinRange
                  ? styles.locationStatusSuccess
                  : distance !== null
                    ? styles.locationStatusWarning
                    : styles.locationStatusNeutral,
              ]}
            >
              <MaterialIcons
                name={
                  isWithinRange
                    ? 'check-circle'
                    : distance !== null
                      ? 'near-me'
                      : 'my-location'
                }
                size={20}
                color={
                  isWithinRange
                    ? theme.status.success
                    : distance !== null
                      ? theme.status.warning
                      : theme.text.secondary
                }
              />

              <AppText style={styles.distanceText}>
                {distanceMessage}
              </AppText>
            </View>

            {distance !== null && (
              <>
                <ProgressBar
                  progress={progress}
                  color={
                    isWithinRange
                      ? theme.status.success
                      : theme.status.warning
                  }
                  style={styles.progressBar}
                />

                <View style={styles.progressInfo}>
                  <AppText style={styles.progressLabel}>
                    {tSafe(
                      'progress_percent',
                      '{percent}% of required range',
                      {
                        percent: Math.min(
                          progress * 100,
                          100
                        ).toFixed(0),
                      }
                    )}
                  </AppText>

                  <AppText style={styles.progressLabel}>
                    {formatDistance(distance)}
                  </AppText>
                </View>
              </>
            )}

            {errorMsg && distance === null && (
              <AppText style={styles.errorText}>
                {errorMsg}
              </AppText>
            )}
          </View>
        </Card>

        {/* Clock-In Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.clockInButton,
            (!isWithinRange || loading) &&
              styles.clockInButtonDisabled,
          ]}
          onPress={handleClockIn}
          disabled={loading || !isWithinRange}
          accessibilityRole="button"
          accessibilityLabel={tSafe(
            'clock_in',
            'Clock In'
          )}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={theme.button.primaryText}
            />
          ) : (
            <MaterialIcons
              name="login"
              size={23}
              color={theme.button.primaryText}
            />
          )}

          <AppText style={styles.clockInText}>
            {loading
              ? tSafe(
                  'clocking_in',
                  'Clocking in...'
                )
              : tSafe('clock_in', 'Clock In')}
          </AppText>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

// ==================================================
// STYLES
// ==================================================

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    // ----------------------------------------------
    // Loading Modal
    // ----------------------------------------------

    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:
        theme.overlay || 'rgba(0,0,0,0.5)',
    },

    modalContent: {
      backgroundColor: theme.surface.elevated,
      borderRadius: 24,
      padding: 28,
      alignItems: 'center',
      width: width * 0.75,
      maxWidth: 320,
      borderWidth: 1,
      borderColor: theme.border.default,

      shadowColor: theme.shadow?.color || '#000000',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },

    modalText: {
      marginTop: 14,
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.primary,
    },

    // ----------------------------------------------
    // Profile-Style Gradient Header
    // ----------------------------------------------

    headerGradient: {
      position: 'relative',
      overflow: 'hidden',

      paddingTop: 32,
      paddingBottom: 24,
      paddingHorizontal: 24,

      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
    },

    headerDecorationLarge: {
      position: 'absolute',
      top: -75,
      right: -55,

      width: 230,
      height: 230,
      borderRadius: 115,

      backgroundColor: 'rgba(255,255,255,0.09)',
    },

    headerDecorationSmall: {
      position: 'absolute',
      bottom: 15,
      left: -35,

      width: 110,
      height: 110,
      borderRadius: 55,

      backgroundColor: 'rgba(255,255,255,0.07)',
    },

    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },

    headerHeading: {
      flex: 1,
      paddingRight: 12,
    },

    headerEyebrow: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      color: theme.hero.mutedForeground,
      marginBottom: 8,
    },

    headerTitle: {
      fontSize: 29,
      fontWeight: '800',
      lineHeight: 38,
      color: theme.text.inverse,
      letterSpacing: -0.5,
    },

    headerSubtitle: {
      fontSize: 13,
      lineHeight: 19,
      color: theme.hero.mutedForeground,
      marginTop: 6,
    },

    headerIconContainer: {
      width: 58,
      height: 58,
      borderRadius: 19,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor: 'rgba(255,255,255,0.14)',

      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.22)',
    },

    headerStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',

      maxWidth: '100%',

      paddingHorizontal: 13,
      paddingVertical: 9,

      borderRadius: 24,

      backgroundColor: 'rgba(255,255,255,0.13)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.16)',
    },

    statusIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 9,
    },

    headerStatusText: {
      flexShrink: 1,
      fontSize: 12,
      fontWeight: '600',
      lineHeight: 17,
      color: theme.text.inverse,
    },

    // ----------------------------------------------
    // Scroll Content
    // ----------------------------------------------

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 22,
      paddingBottom: 40,
    },

    // ----------------------------------------------
    // Cards
    // ----------------------------------------------

    card: {
      padding: 20,
      borderRadius: 24,

      backgroundColor: theme.card.background,

      borderWidth: 1,
      borderColor: theme.card.border,

      elevation: 2,

      shadowColor: theme.shadow?.color || '#000000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: theme.shadow?.opacity ?? 0.06,
      shadowRadius: 10,

      marginBottom: 18,
    },

    // ----------------------------------------------
    // Cleaner Information
    // ----------------------------------------------

    cleanerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    avatar: {
      width: 62,
      height: 62,
      borderRadius: 31,
      marginRight: 16,
      borderWidth: 2,
      borderColor: theme.brand.primary,
    },

    avatarPlaceholder: {
      width: 62,
      height: 62,
      borderRadius: 31,
      marginRight: 16,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor: theme.surface.selected,

      borderWidth: 2,
      borderColor: theme.brand.primary,
    },

    cleanerTextContainer: {
      flex: 1,
    },

    cleanerName: {
      fontSize: 19,
      lineHeight: 25,
      fontWeight: '700',
      color: theme.text.primary,
    },

    cleanerRole: {
      fontSize: 14,
      color: theme.text.secondary,
      marginTop: 5,
    },

    // ----------------------------------------------
    // Section Headers
    // ----------------------------------------------

    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
    },

    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text.primary,
      marginLeft: 9,
    },

    // ----------------------------------------------
    // Property Address
    // ----------------------------------------------

    address: {
      fontSize: 15,
      color: theme.text.secondary,
      lineHeight: 23,
      marginBottom: 4,
    },

    divider: {
      height: 1,
      backgroundColor: theme.divider,
      marginVertical: 18,
    },

    // ----------------------------------------------
    // Schedule Time
    // ----------------------------------------------

    timeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 18,
    },

    timeColumn: {
      flex: 1,
    },

    timeLabel: {
      fontSize: 13,
      color: theme.text.secondary,
      marginBottom: 6,
    },

    timeValue: {
      fontSize: 21,
      fontWeight: '700',
      color: theme.text.primary,
    },

    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',

      paddingVertical: 12,
      paddingHorizontal: 12,

      borderRadius: 14,
      backgroundColor: theme.surface.selected,
    },

    date: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text.primary,
      marginLeft: 8,
      flexShrink: 1,
    },

    // ----------------------------------------------
    // Location Verification
    // ----------------------------------------------

    distanceContainer: {
      marginTop: 2,
    },

    locationStatusBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',

      padding: 13,
      borderRadius: 14,
      marginBottom: 16,
    },

    locationStatusSuccess: {
      backgroundColor:
        theme.status.successBackground ||
        'rgba(34,197,94,0.10)',
    },

    locationStatusWarning: {
      backgroundColor:
        theme.status.warningBackground ||
        'rgba(245,158,11,0.10)',
    },

    locationStatusNeutral: {
      backgroundColor: theme.surface.selected,
    },

    distanceText: {
      flex: 1,
      flexShrink: 1,

      fontSize: 14,
      lineHeight: 21,
      color: theme.text.primary,

      marginLeft: 9,
    },

    progressBar: {
      height: 7,
      borderRadius: 4,
      backgroundColor: theme.background.sunken,
      overflow: 'hidden',
    },

    progressInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 9,
    },

    progressLabel: {
      fontSize: 12,
      color: theme.text.secondary,
    },

    errorText: {
      fontSize: 13,
      lineHeight: 19,
      color: theme.status.error,
      marginTop: 12,
    },

    // ----------------------------------------------
    // Clock-In Button
    // ----------------------------------------------

    clockInButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor: theme.button.primaryBackground,

      paddingVertical: 17,
      paddingHorizontal: 24,

      borderRadius: 48,

      shadowColor: theme.brand.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.25,
      shadowRadius: 9,

      elevation: 5,

      marginTop: 2,
    },

    clockInButtonDisabled: {
      backgroundColor: theme.button.disabledBackground,
      shadowOpacity: 0,
      elevation: 0,
    },

    clockInText: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.button.primaryText,
      marginLeft: 11,
    },

    bottomSpacer: {
      height: 20,
    },
  });

export default ClockIn;