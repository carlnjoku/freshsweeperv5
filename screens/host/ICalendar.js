// import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
// import {
//   ScrollView,
//   RefreshControl,
//   StyleSheet,
//   Text,
//   Alert,
//   View,
//   TouchableOpacity,
//   ActivityIndicator,
//   Image,
//   Switch,
// } from 'react-native';
// import { IconButton, Avatar, Divider } from 'react-native-paper';
// import { MaterialCommunityIcons, AntDesign, MaterialIcons } from '@expo/vector-icons';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import * as Animatable from 'react-native-animatable';

// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';
// import CircleIcon from '../../components/shared/CircleIcon';
// import AddICalModal from '../../components/host/AddICalModal';
// import userService from '../../services/connection/userService';
// import { tSafe } from '../../utils/tSafe'; // added import

// export default function ICalendar({ route }) {
//   const { property, linkedCleaners } = route.params;
//   const navigation = useNavigation();

//   const [refreshing, setRefreshing] = useState(false);
//   const [syncedCalendars, setSyncedCalendars] = useState([]);
//   const [cleaners, setCleaners] = useState([]);
//   const [checklists, setChecklists] = useState([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedPlatform, setSelectedPlatform] = useState(null);
//   const [selectedCalendar, setSelectedCalendar] = useState(null);

//   // Room details
//   const bedroomCount = property?.roomDetails?.find(r => r.type === "Bedroom")?.number || 0;
//   const bathroomCount = property?.roomDetails?.find(r => r.type === "Bathroom")?.number || 0;
//   const kitchen = property?.roomDetails?.find(r => r.type === "Kitchen")?.number || 0;
//   const livingroomCount = property?.roomDetails?.find(r => r.type === "Livingroom")?.number || 0;
//   const bedroomSize = property?.roomDetails?.find(r => r.type === "Bedroom")?.size || 0;
//   const bathroomSize = property?.roomDetails?.find(r => r.type === "Bathroom")?.size || 0;
//   const kitchenSize = property?.roomDetails?.find(r => r.type === "Kitchen")?.size || 0;
//   const livingroomSize = property?.roomDetails?.find(r => r.type === "Livingroom")?.size || 0;

//   // Booking platforms
//   const bookingPlatforms = [
//     {
//       id: 'airbnb',
//       name: tSafe('airbnb', 'Airbnb'),
//       color: '#FF5A5F',
//       description: tSafe('airbnb_desc', 'Sync your Airbnb calendar to automatically update availability'),
//       icon: require('../../assets/images/airbnb_logo.png'),
//     },
//     {
//       id: 'booking',
//       name: tSafe('booking_com', 'Booking.com'),
//       color: '#003580',
//       description: tSafe('booking_desc', 'Connect your Booking.com account to manage reservations'),
//       icon: require('../../assets/images/booking_logo.png'),
//     },
//     {
//       id: 'vrbo',
//       name: tSafe('vrbo', 'Vrbo'),
//       color: '#00A699',
//       description: tSafe('vrbo_desc', 'Link your Vrbo property to sync bookings and availability'),
//       icon: require('../../assets/images/vrbo_logo.png'),
//     },
//     {
//       id: 'ical',
//       name: tSafe('other_calendar', 'Other Calendar'),
//       color: '#6200EE',
//       description: tSafe('ical_desc', 'Sync using a generic iCal URL'),
//       icon: null,
//     },
//   ];

//   // Helper functions
//   const isPlatformConnected = (platformId) => {
//     return syncedCalendars.some(cal => cal.platform === platformId);
//   };

//   const getCalendarForPlatform = (platformId) => {
//     return syncedCalendars.find(cal => cal.platform === platformId);
//   };

//   // Fetch data
//   const fetchChecklists = async () => {
//     if (!property.checklists?.length) return;
//     try {
//       const response = await userService.getCustomChecklistsByProperty(property.checklists);
//       setChecklists(response.data.data || []);
//     } catch (error) {
//       console.error('Error fetching checklists:', error);
//     }
//   };

//   const fetchSyncedCals = async () => {
//     try {
//       const response = await userService.getSyncedCalsByApartmentIds(property._id);
//       if (!response.data || response.data.length === 0) {
//         setSyncedCalendars([]);
//         return;
//       }
//       const calId = response.data[0]._id;
//       const calendars = response.data[0].calendars
//         ? response.data[0].calendars.map(calendar => ({
//             ...calendar,
//             propertyId: property._id,
//             calId,
//           }))
//         : [];
//       setSyncedCalendars(calendars);
//     } catch (error) {
//       console.error('Error fetching synced calendars:', error);
//       setSyncedCalendars([]);
//     }
//   };

//   const fetchCleaners = async () => {
//     try {
//       // const response = await userService.getAllCleaners();
//       console.log(property?.preferredCleaners)
//       setCleaners(property?.preferredCleaners);
//     } catch (error) {
//       console.error('Error fetching cleaners:', error);
//       Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_load_cleaners', 'Failed to load cleaners'));
//     }
//   };

//   const fetchAll = async () => {
//     await Promise.all([fetchSyncedCals(), fetchChecklists(), fetchCleaners()]);
//   };

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await fetchAll();
//     setRefreshing(false);
//   };

//   useEffect(() => {
//     fetchAll();
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       handleRefresh();
//     }, [property._id])
//   );

//   // Header edit button
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerRight: () => (
//         <IconButton
//           icon="pencil"
//           size={20}
//           color={COLORS.primary}
//           onPress={() => navigation.navigate(ROUTES.host_edit_apt, { propertyId: property._id })}
//         />
//       ),
//     });
//   }, [navigation, property]);

//   // Handlers
//   const handlePlatformPress = (platformId) => {
//     const calendar = getCalendarForPlatform(platformId);
//     if (calendar) {
//       setSelectedCalendar(calendar);
//     } else {
//       setSelectedCalendar(null);
//     }
//     setSelectedPlatform(platformId);
//     setModalVisible(true);
//   };

//   const handleSaveSync = async (data) => {
//     try {
//       if (selectedCalendar) {
//         await userService.updateCalendar(data);
//       } else {
//         await userService.createSyncCalendar({
//           aptId: data.aptId,
//           calendar: data.calendar,
//           selectedChecklist: data.selectedChecklist,
//         });
//       }
//       await fetchSyncedCals();
//       Alert.alert(tSafe('success_title', 'Success'), tSafe('calendar_sync_saved', 'Calendar sync saved successfully'));
//     } catch (error) {
//       console.error('Error saving calendar sync:', error);
//       Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_save_calendar', 'Failed to save calendar sync'));
//     }
//   };

//   const toggleSync = async (calendar) => {
//     try {
//       await userService.updateSyncCalendar(calendar._id, { enabled: !calendar.enabled });
//       await fetchSyncedCals();
//     } catch (error) {
//       console.error('Error toggling sync:', error);
//       Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_update_sync', 'Failed to update sync status'));
//     }
//   };

//   const getPlatformName = (platformId) => {
//     const map = {
//       airbnb: tSafe('airbnb', 'Airbnb'),
//       booking: tSafe('booking_com', 'Booking.com'),
//       vrbo: tSafe('vrbo', 'Vrbo'),
//       ical: tSafe('other_calendar', 'Other Calendar'),
//     };
//     return map[platformId] || platformId;
//   };

//   // Render components
//   const renderPlatformCard = (platform) => {
//     const calendar = getCalendarForPlatform(platform.id);
//     const connected = !!calendar;
//     return (
//       <Animatable.View key={platform.id} animation="fadeInUp" duration={400} style={[styles.platformCard, { borderLeftColor: platform.color }]}>
//         <TouchableOpacity onPress={() => handlePlatformPress(platform.id)} activeOpacity={0.8}>
//           <View style={styles.platformCardContent}>
//             <View style={styles.platformIconContainer}>
//               {platform.icon ? (
//                 <Image source={platform.icon} style={styles.platformIcon} />
//               ) : (
//                 <MaterialCommunityIcons name="calendar-sync" size={28} color={platform.color} />
//               )}
//             </View>
//             <View style={styles.platformInfo}>
//               <Text style={styles.platformName}>{platform.name}</Text>
//               <Text style={styles.platformDescription}>{platform.description}</Text>
//               {connected && calendar && (
//                 <View style={styles.connectionDetails}>
//                   <Text style={styles.detailText} numberOfLines={1}>
//                     {tSafe('url_label', 'URL:')} {calendar.ical_url || calendar.calendar_url || tSafe('no_url_provided', 'No URL provided')}
//                   </Text>
//                   {calendar.last_synced && (
//                     <Text style={styles.detailText}>
//                       {tSafe('last_synced', 'Last synced:')} {new Date(calendar.last_synced).toLocaleDateString()}
//                     </Text>
//                   )}
//                   {calendar.assigned_cleaners?.length > 0 && (
//                     <View style={styles.cleanerChips}>
//                       {calendar.assigned_cleaners.map(cid => {
//                         const cleaner = cleaners.find(c => c._id === cid);
//                         return cleaner ? (
//                           <View key={cid} style={styles.cleanerChip}>
//                             <Avatar.Image size={20} source={{ uri: cleaner.avatarUrl }} />
//                             <Text style={styles.cleanerChipText}>{cleaner.firstname}</Text>
//                           </View>
//                         ) : null;
//                       })}
//                     </View>
//                   )}
//                 </View>
//               )}
//             </View>
//             <View style={styles.platformStatus}>
//               {connected ? (
//                 <>
//                   <View style={styles.connectedBadge}>
//                     <MaterialIcons name="check-circle" size={16} color={COLORS.success} />
//                     <Text style={styles.connectedText}>{tSafe('linked', 'Linked')}</Text>
//                   </View>
//                   <Switch
//                     value={calendar.enabled !== false}
//                     onValueChange={() => toggleSync(calendar)}
//                     trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
//                     thumbColor={COLORS.white}
//                     style={styles.syncSwitch}
//                   />
//                 </>
//               ) : (
//                 <View style={styles.connectButton}>
//                   <Text style={styles.connectButtonText}>{tSafe('connect', 'Connect')}</Text>
//                   <MaterialIcons name="chevron-right" size={20} color={COLORS.primary} />
//                 </View>
//               )}
//             </View>
//           </View>
//         </TouchableOpacity>
//       </Animatable.View>
//     );
//   };

//   const renderSyncedCalendarItem = (calendar) => {
//     const platformName = getPlatformName(calendar.platform);
//     return (
//       <Animatable.View key={calendar._id} animation="fadeInUp" duration={400} style={styles.syncedCard}>
//         <View style={styles.syncedCardContent}>
//           <View style={styles.syncedIcon}>
//             <MaterialCommunityIcons name="calendar-sync" size={24} color={COLORS.primary} />
//           </View>
//           <View style={styles.syncedInfo}>
//             <Text style={styles.syncedName}>{platformName}</Text>
//             <Text style={styles.syncedUrl} numberOfLines={1}>
//               {calendar.ical_url || calendar.calendar_url || tSafe('no_url', 'No URL')}
//             </Text>
//             {calendar.last_synced && (
//               <Text style={styles.syncedDate}>
//                 {tSafe('last_synced', 'Last synced:')} {new Date(calendar.last_synced).toLocaleDateString()}
//               </Text>
//             )}
//           </View>
//           <Switch
//             value={calendar.enabled !== false}
//             onValueChange={() => toggleSync(calendar)}
//             trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
//             thumbColor={COLORS.white}
//           />
//         </View>
//       </Animatable.View>
//     );
//   };

//   return (
//     <ScrollView
//       style={styles.container}
//       contentContainerStyle={styles.contentContainer}
//       refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
//     >
//       {/* Property Header Card */}
//       <Animatable.View animation="fadeInUp" duration={500} style={styles.propertyCard}>
//         <View style={styles.propertyHeader}>
//           <Text style={styles.propertyName}>{property.apt_name}</Text>
//           <View style={styles.addressRow}>
//             <MaterialCommunityIcons name="map-marker-outline" size={16} color={COLORS.gray} />
//             <Text style={styles.propertyAddress}>{property.address}</Text>
//           </View>
//           <View style={styles.roomStats}>
//             <CircleIcon
//               iconName="bed-empty"
//               buttonSize={26}
//               radiusSise={13}
//               iconSize={16}
//               title={bedroomCount}
//               roomSize={bedroomSize}
//               type={tSafe('bedrooms', 'Bedrooms')}
//             />
//             <CircleIcon
//               iconName="shower-head"
//               buttonSize={26}
//               radiusSise={13}
//               iconSize={16}
//               title={bathroomCount}
//               roomSize={bathroomSize}
//               type={tSafe('bathrooms', 'Bathrooms')}
//             />
//             <CircleIcon
//               iconName="silverware-fork-knife"
//               buttonSize={26}
//               radiusSise={13}
//               iconSize={16}
//               title={kitchen}
//               roomSize={kitchenSize}
//               type={tSafe('kitchen', 'Kitchen')}
//             />
//             <CircleIcon
//               iconName="seat-legroom-extra"
//               buttonSize={26}
//               radiusSise={13}
//               iconSize={16}
//               title={livingroomCount}
//               roomSize={livingroomSize}
//               type={tSafe('livingroom', 'Livingroom')}
//             />
//           </View>
//         </View>
//       </Animatable.View>

//       {/* Connect Calendars Section */}
//       <Animatable.View animation="fadeInUp" delay={100} style={styles.section}>
//         <Text style={styles.sectionTitle}>{tSafe('connect_calendars_title', 'Connect Your Calendars')}</Text>
//         <Text style={styles.sectionSubtitle}>
//           {tSafe('connect_calendars_subtitle', 'Sync with booking platforms to automatically update your availability')}
//         </Text>
//         <View style={styles.platformsContainer}>
//           {bookingPlatforms.map(renderPlatformCard)}
//         </View>
//       </Animatable.View>

//       {/* Synced Calendars List */}
//       {syncedCalendars.length > 0 && (
//         <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
//           <Text style={styles.sectionTitle}>{tSafe('connected_calendars_title', 'Your Connected Calendars')}</Text>
//           {syncedCalendars.map(renderSyncedCalendarItem)}
//         </Animatable.View>
//       )}

//       {/* Benefits Section */}
//       <Animatable.View animation="fadeInUp" delay={300} style={styles.benefitsSection}>
//         <Text style={styles.sectionTitle}>{tSafe('why_connect_calendars', 'Why Connect Calendars?')}</Text>
//         <View style={styles.benefitsGrid}>
//           <View style={styles.benefitCard}>
//             <MaterialIcons name="autorenew" size={24} color={COLORS.primary} />
//             <Text style={styles.benefitTitle}>{tSafe('auto_sync', 'Auto-Sync')}</Text>
//             <Text style={styles.benefitText}>{tSafe('auto_sync_desc', 'Availability updates in real-time')}</Text>
//           </View>
//           <View style={styles.benefitCard}>
//             <MaterialIcons name="block" size={24} color={COLORS.primary} />
//             <Text style={styles.benefitTitle}>{tSafe('no_overbooking', 'No Overbooking')}</Text>
//             <Text style={styles.benefitText}>{tSafe('no_overbooking_desc', 'Prevent double bookings')}</Text>
//           </View>
//           <View style={styles.benefitCard}>
//             <MaterialIcons name="schedule" size={24} color={COLORS.primary} />
//             <Text style={styles.benefitTitle}>{tSafe('save_time', 'Save Time')}</Text>
//             <Text style={styles.benefitText}>{tSafe('save_time_desc', 'No manual calendar updates')}</Text>
//           </View>
//           <View style={styles.benefitCard}>
//             <MaterialIcons name="trending-up" size={24} color={COLORS.primary} />
//             <Text style={styles.benefitTitle}>{tSafe('maximize_revenue', 'Maximize Revenue')}</Text>
//             <Text style={styles.benefitText}>{tSafe('maximize_revenue_desc', 'Optimize your booking rates')}</Text>
//           </View>
//         </View>
//       </Animatable.View>

//       <AddICalModal
//         visible={modalVisible}
//         onClose={() => {
//           setModalVisible(false);
//           setSelectedPlatform(null);
//           setSelectedCalendar(null);
//         }}
//         onSave={handleSaveSync}
//         cleaners={linkedCleaners}
//         aptId={property._id}
//         preselectedPlatform={selectedPlatform}
//         existingCalendar={selectedCalendar}
//         checklists={checklists}
//         property={property}
//       />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8F9FC',
//   },
//   contentContainer: {
//     padding: 16,
//     paddingBottom: 40,
//   },
//   propertyCard: {
//     backgroundColor: '#fff',
//     borderRadius: 24,
//     padding: 20,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.05,
//     shadowRadius: 12,
//     elevation: 4,
//   },
//   propertyHeader: {
//     marginBottom: 8,
//   },
//   propertyName: {
//     fontSize: 24,
//     fontWeight: '800',
//     color: '#1E1E2F',
//     marginBottom: 8,
//   },
//   addressRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   propertyAddress: {
//     fontSize: 14,
//     color: '#6C6C80',
//     marginLeft: 6,
//   },
//   roomStats: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 8,
//   },
//   section: {
//     marginBottom: 24,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1E1E2F',
//     marginBottom: 8,
//   },
//   sectionSubtitle: {
//     fontSize: 14,
//     color: '#6C6C80',
//     marginBottom: 16,
//     lineHeight: 20,
//   },
//   platformsContainer: {
//     gap: 12,
//   },
//   platformCard: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     borderLeftWidth: 4,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   platformCardContent: {
//     flexDirection: 'row',
//     padding: 16,
//   },
//   platformIconContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#F5F5F5',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   platformIcon: {
//     width: 32,
//     height: 32,
//     resizeMode: 'contain',
//   },
//   platformInfo: {
//     flex: 1,
//   },
//   platformName: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#1E1E2F',
//     marginBottom: 4,
//   },
//   platformDescription: {
//     fontSize: 12,
//     color: '#6C6C80',
//     lineHeight: 16,
//   },
//   connectionDetails: {
//     marginTop: 8,
//     paddingTop: 8,
//     borderTopWidth: 1,
//     borderTopColor: '#F0F0F5',
//   },
//   detailText: {
//     fontSize: 11,
//     color: '#8E8E93',
//     marginTop: 4,
//   },
//   cleanerChips: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginTop: 8,
//   },
//   cleanerChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F5F5F5',
//     borderRadius: 20,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     marginRight: 6,
//     marginBottom: 4,
//   },
//   cleanerChipText: {
//     fontSize: 10,
//     color: '#333',
//     marginLeft: 4,
//   },
//   platformStatus: {
//     alignItems: 'flex-end',
//     justifyContent: 'center',
//     marginLeft: 8,
//   },
//   connectedBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#E8F5E9',
//     borderRadius: 20,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     marginBottom: 8,
//   },
//   connectedText: {
//     fontSize: 11,
//     fontWeight: '600',
//     color: COLORS.success,
//     marginLeft: 4,
//   },
//   syncSwitch: {
//     transform: [{ scale: 0.9 }],
//   },
//   connectButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F0F5FF',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   connectButtonText: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginRight: 4,
//   },
//   syncedCard: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 12,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   syncedCardContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   syncedIcon: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: '#F0F5FF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   syncedInfo: {
//     flex: 1,
//   },
//   syncedName: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 2,
//   },
//   syncedUrl: {
//     fontSize: 12,
//     color: '#6C6C80',
//     marginBottom: 2,
//   },
//   syncedDate: {
//     fontSize: 11,
//     color: '#8E8E93',
//   },
//   benefitsSection: {
//     backgroundColor: '#fff',
//     borderRadius: 24,
//     padding: 20,
//     marginTop: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   benefitsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   benefitCard: {
//     width: '48%',
//     backgroundColor: '#F9F9FC',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     alignItems: 'center',
//   },
//   benefitTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1E1E2F',
//     marginTop: 8,
//     marginBottom: 4,
//     textAlign: 'center',
//   },
//   benefitText: {
//     fontSize: 12,
//     color: '#6C6C80',
//     textAlign: 'center',
//     lineHeight: 16,
//   },
// });




// import React, {
//   useState,
//   useEffect,
//   useLayoutEffect,
//   useCallback,
//   useMemo,
// } from 'react';

// import {
//   ScrollView,
//   RefreshControl,
//   StyleSheet,
//   Text,
//   Alert,
//   View,
//   TouchableOpacity,
//   ActivityIndicator,
//   Image,
//   Switch,
//   StatusBar,
// } from 'react-native';

// import { IconButton, Avatar } from 'react-native-paper';

// import {
//   MaterialCommunityIcons,
//   MaterialIcons,
// } from '@expo/vector-icons';

// import {
//   useNavigation,
//   useFocusEffect,
// } from '@react-navigation/native';

// import * as Animatable from 'react-native-animatable';

// import ROUTES from '../../constants/routes';
// import CircleIcon from '../../components/shared/CircleIcon';
// import AddICalModal from '../../components/host/AddICalModal';
// import userService from '../../services/connection/userService';
// import { tSafe } from '../../utils/tSafe';
// import { useTheme } from '../../theme/ThemeProvider';

// export default function ICalendar({ route }) {
//   const { property, linkedCleaners = [] } = route.params || {};
//   const navigation = useNavigation();

//   const { theme, isDark } = useTheme();

//   const [refreshing, setRefreshing] = useState(false);
//   const [initialLoading, setInitialLoading] = useState(true);
//   const [syncingCalendarIds, setSyncingCalendarIds] = useState([]);

//   const [syncedCalendars, setSyncedCalendars] = useState([]);
//   const [cleaners, setCleaners] = useState([]);
//   const [checklists, setChecklists] = useState([]);

//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedPlatform, setSelectedPlatform] = useState(null);
//   const [selectedCalendar, setSelectedCalendar] = useState(null);

//   const styles = useMemo(
//     () => createStyles(theme, isDark),
//     [theme, isDark]
//   );

//   const propertyId = property?._id;

//   // ---------------------------------------------------------
//   // Property room details
//   // ---------------------------------------------------------

//   const getRoomDetail = useCallback(
//     (roomType, field = 'number') => {
//       const room = property?.roomDetails?.find(
//         item =>
//           item.type?.toLowerCase() === roomType.toLowerCase()
//       );

//       return room?.[field] ?? 0;
//     },
//     [property]
//   );

//   const bedroomCount = getRoomDetail('Bedroom');
//   const bathroomCount = getRoomDetail('Bathroom');
//   const kitchenCount = getRoomDetail('Kitchen');
//   const livingroomCount = getRoomDetail('Livingroom');

//   const bedroomSize = getRoomDetail('Bedroom', 'size');
//   const bathroomSize = getRoomDetail('Bathroom', 'size');
//   const kitchenSize = getRoomDetail('Kitchen', 'size');
//   const livingroomSize = getRoomDetail('Livingroom', 'size');

//   // ---------------------------------------------------------
//   // Booking platforms
//   // ---------------------------------------------------------

//   const bookingPlatforms = useMemo(
//     () => [
//       {
//         id: 'airbnb',
//         name: tSafe('airbnb', 'Airbnb'),
//         color: '#FF5A5F',
//         description: tSafe(
//           'airbnb_desc',
//           'Sync your Airbnb calendar to automatically update availability'
//         ),
//         icon: require('../../assets/images/airbnb_logo.png'),
//       },
//       {
//         id: 'booking',
//         name: tSafe('booking_com', 'Booking.com'),
//         color: '#003580',
//         description: tSafe(
//           'booking_desc',
//           'Connect your Booking.com account to manage reservations'
//         ),
//         icon: require('../../assets/images/booking_logo.png'),
//       },
//       {
//         id: 'vrbo',
//         name: tSafe('vrbo', 'Vrbo'),
//         color: '#00A699',
//         description: tSafe(
//           'vrbo_desc',
//           'Link your Vrbo property to sync bookings and availability'
//         ),
//         icon: require('../../assets/images/vrbo_logo.png'),
//       },
//       {
//         id: 'ical',
//         name: tSafe('other_calendar', 'Other Calendar'),
//         color: theme.brand.primary,
//         description: tSafe(
//           'ical_desc',
//           'Sync using a generic iCal URL'
//         ),
//         icon: null,
//       },
//     ],
//     [theme.brand.primary]
//   );

//   // ---------------------------------------------------------
//   // Calendar helpers
//   // ---------------------------------------------------------

//   const isPlatformConnected = useCallback(
//     platformId =>
//       syncedCalendars.some(
//         calendar => calendar.platform === platformId
//       ),
//     [syncedCalendars]
//   );

//   const getCalendarForPlatform = useCallback(
//     platformId =>
//       syncedCalendars.find(
//         calendar => calendar.platform === platformId
//       ),
//     [syncedCalendars]
//   );

//   const getPlatformName = useCallback(
//     platformId => {
//       const platformNames = {
//         airbnb: tSafe('airbnb', 'Airbnb'),
//         booking: tSafe('booking_com', 'Booking.com'),
//         vrbo: tSafe('vrbo', 'Vrbo'),
//         ical: tSafe('other_calendar', 'Other Calendar'),
//       };

//       return platformNames[platformId] || platformId || '';
//     },
//     []
//   );

//   const getCalendarUrl = useCallback(
//     calendar =>
//       calendar?.ical_url ||
//       calendar?.calendar_url ||
//       tSafe('no_url_provided', 'No URL provided'),
//     []
//   );

//   const getFormattedDate = useCallback(date => {
//     if (!date) return '';

//     const parsedDate = new Date(date);

//     if (Number.isNaN(parsedDate.getTime())) {
//       return '';
//     }

//     return parsedDate.toLocaleDateString();
//   }, []);

//   // ---------------------------------------------------------
//   // Fetch checklists
//   // ---------------------------------------------------------

//   const fetchChecklists = useCallback(async () => {
//     if (!property?.checklists?.length) {
//       setChecklists([]);
//       return;
//     }

//     try {
//       const response =
//         await userService.getCustomChecklistsByProperty(
//           property.checklists
//         );

//       const checklistData =
//         response?.data?.data ??
//         response?.data ??
//         [];

//       setChecklists(
//         Array.isArray(checklistData)
//           ? checklistData
//           : []
//       );
//     } catch (error) {
//       console.error('Error fetching checklists:', error);
//       setChecklists([]);
//     }
//   }, [property]);

//   // ---------------------------------------------------------
//   // Fetch synchronized calendars
//   // ---------------------------------------------------------

//   const fetchSyncedCals = useCallback(async () => {
//     if (!propertyId) {
//       setSyncedCalendars([]);
//       return;
//     }

//     try {
//       const response =
//         await userService.getSyncedCalsByApartmentIds(
//           propertyId
//         );

//       const records = Array.isArray(response?.data)
//         ? response.data
//         : [];

//       if (records.length === 0) {
//         setSyncedCalendars([]);
//         return;
//       }

//       const calendarRecord = records[0];
//       const calendarId = calendarRecord?._id;

//       const calendars = Array.isArray(
//         calendarRecord?.calendars
//       )
//         ? calendarRecord.calendars.map(calendar => ({
//             ...calendar,
//             propertyId,
//             calId: calendarId,
//           }))
//         : [];

//       setSyncedCalendars(calendars);
//     } catch (error) {
//       console.error(
//         'Error fetching synchronized calendars:',
//         error
//       );

//       setSyncedCalendars([]);

//       throw error;
//     }
//   }, [propertyId]);

//   // ---------------------------------------------------------
//   // Fetch cleaners
//   // ---------------------------------------------------------

//   const fetchCleaners = useCallback(async () => {
//     try {
//       const preferredCleaners = Array.isArray(
//         property?.preferredCleaners
//       )
//         ? property.preferredCleaners
//         : [];

//       setCleaners(preferredCleaners);
//     } catch (error) {
//       console.error('Error fetching cleaners:', error);
//       setCleaners([]);
//     }
//   }, [property]);

//   // ---------------------------------------------------------
//   // Fetch screen data
//   // ---------------------------------------------------------

//   const fetchAll = useCallback(async () => {
//     const results = await Promise.allSettled([
//       fetchSyncedCals(),
//       fetchChecklists(),
//       fetchCleaners(),
//     ]);

//     const calendarResult = results[0];

//     if (calendarResult.status === 'rejected') {
//       console.error(
//         'Failed to refresh synchronized calendars:',
//         calendarResult.reason
//       );
//     }
//   }, [
//     fetchSyncedCals,
//     fetchChecklists,
//     fetchCleaners,
//   ]);

//   const handleRefresh = useCallback(async () => {
//     if (!propertyId) return;

//     setRefreshing(true);

//     try {
//       await fetchAll();
//     } catch (error) {
//       console.error('Error refreshing calendar screen:', error);

//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe(
//           'refresh_failed',
//           'Unable to refresh calendar information. Please try again.'
//         )
//       );
//     } finally {
//       setRefreshing(false);
//     }
//   }, [fetchAll, propertyId]);

//   // Initial load
//   useEffect(() => {
//     let isMounted = true;

//     const load = async () => {
//       setInitialLoading(true);

//       try {
//         await fetchAll();
//       } catch (error) {
//         console.error('Error loading calendar screen:', error);
//       } finally {
//         if (isMounted) {
//           setInitialLoading(false);
//         }
//       }
//     };

//     load();

//     return () => {
//       isMounted = false;
//     };
//   }, [fetchAll]);

//   // Refresh when screen regains focus.
//   useFocusEffect(
//     useCallback(() => {
//       if (!propertyId) return undefined;

//       let active = true;

//       const refreshOnFocus = async () => {
//         setRefreshing(true);

//         try {
//           await fetchAll();
//         } catch (error) {
//           console.error(
//             'Error refreshing calendar data on focus:',
//             error
//           );
//         } finally {
//           if (active) {
//             setRefreshing(false);
//           }
//         }
//       };

//       refreshOnFocus();

//       return () => {
//         active = false;
//       };
//     }, [fetchAll, propertyId])
//   );

//   // ---------------------------------------------------------
//   // Header edit button
//   // ---------------------------------------------------------

//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerRight: () => (
//         <IconButton
//           icon="pencil-outline"
//           size={21}
//           iconColor={theme.brand.primary}
//           onPress={() =>
//             navigation.navigate(
//               ROUTES.host_edit_apt,
//               { propertyId }
//             )
//           }
//           accessibilityLabel={tSafe(
//             'edit_property',
//             'Edit property'
//           )}
//         />
//       ),
//     });
//   }, [navigation, propertyId, theme.brand.primary]);

//   // ---------------------------------------------------------
//   // Calendar modal handlers
//   // ---------------------------------------------------------

//   const handlePlatformPress = useCallback(
//     platformId => {
//       const calendar = getCalendarForPlatform(platformId);

//       setSelectedCalendar(calendar || null);
//       setSelectedPlatform(platformId);
//       setModalVisible(true);
//     },
//     [getCalendarForPlatform]
//   );

//   const closeCalendarModal = useCallback(() => {
//     setModalVisible(false);
//     setSelectedPlatform(null);
//     setSelectedCalendar(null);
//   }, []);

//   const handleSaveSync = useCallback(
//     async data => {
//       try {
//         if (selectedCalendar) {
//           await userService.updateCalendar(data);
//         } else {
//           await userService.createSyncCalendar({
//             aptId: data.aptId,
//             calendar: data.calendar,
//             selectedChecklist: data.selectedChecklist,
//           });
//         }

//         await fetchSyncedCals();

//         closeCalendarModal();

//         Alert.alert(
//           tSafe('success_title', 'Success'),
//           tSafe(
//             'calendar_sync_saved',
//             'Calendar sync saved successfully'
//           )
//         );
//       } catch (error) {
//         console.error(
//           'Error saving calendar synchronization:',
//           error
//         );

//         Alert.alert(
//           tSafe('error_title', 'Error'),
//           tSafe(
//             'failed_save_calendar',
//             'Failed to save calendar sync'
//           )
//         );
//       }
//     },
//     [
//       selectedCalendar,
//       fetchSyncedCals,
//       closeCalendarModal,
//     ]
//   );

//   // ---------------------------------------------------------
//   // Enable / disable calendar synchronization
//   // ---------------------------------------------------------

//   const toggleSync = useCallback(
//     async calendar => {
//       if (!calendar?._id) {
//         Alert.alert(
//           tSafe('error_title', 'Error'),
//           tSafe(
//             'calendar_id_missing',
//             'Unable to update this calendar because its ID is missing.'
//           )
//         );
//         return;
//       }

//       const calendarId = calendar._id;
//       const nextEnabled = calendar.enabled === false;

//       setSyncingCalendarIds(previous =>
//         previous.includes(calendarId)
//           ? previous
//           : [...previous, calendarId]
//       );

//       try {
//         await userService.updateSyncCalendar(
//           calendarId,
//           { enabled: nextEnabled }
//         );

//         // Update local state immediately.
//         setSyncedCalendars(previous =>
//           previous.map(item =>
//             item._id === calendarId
//               ? { ...item, enabled: nextEnabled }
//               : item
//           )
//         );

//         // Refresh from the server to ensure the saved state is current.
//         await fetchSyncedCals();
//       } catch (error) {
//         console.error(
//           'Error updating calendar synchronization:',
//           error
//         );

//         Alert.alert(
//           tSafe('error_title', 'Error'),
//           tSafe(
//             'failed_update_sync',
//             'Failed to update sync status'
//           )
//         );

//         // Restore the server's current state if possible.
//         try {
//           await fetchSyncedCals();
//         } catch (refreshError) {
//           console.error(
//             'Could not restore calendar state:',
//             refreshError
//           );
//         }
//       } finally {
//         setSyncingCalendarIds(previous =>
//           previous.filter(id => id !== calendarId)
//         );
//       }
//     },
//     [fetchSyncedCals]
//   );

//   // ---------------------------------------------------------
//   // Render booking platform card
//   // ---------------------------------------------------------

//   const renderPlatformCard = useCallback(
//     platform => {
//       const calendar = getCalendarForPlatform(platform.id);
//       const connected = Boolean(calendar);

//       const isSyncing = calendar?._id
//         ? syncingCalendarIds.includes(calendar._id)
//         : false;

//       return (
//         <Animatable.View
//           key={platform.id}
//           animation="fadeInUp"
//           duration={400}
//           style={[
//             styles.platformCard,
//             { borderLeftColor: platform.color },
//           ]}
//         >
//           <TouchableOpacity
//             onPress={() => handlePlatformPress(platform.id)}
//             activeOpacity={0.8}
//             accessibilityRole="button"
//             accessibilityLabel={
//               connected
//                 ? tSafe(
//                     'manage_calendar',
//                     `Manage ${platform.name} calendar`
//                   )
//                 : tSafe(
//                     'connect_calendar',
//                     `Connect ${platform.name} calendar`
//                   )
//             }
//           >
//             <View style={styles.platformCardContent}>
//               <View
//                 style={[
//                   styles.platformIconContainer,
//                   {
//                     backgroundColor:
//                       theme.surface.elevated,
//                   },
//                 ]}
//               >
//                 {platform.icon ? (
//                   <Image
//                     source={platform.icon}
//                     style={styles.platformIcon}
//                     resizeMode="contain"
//                   />
//                 ) : (
//                   <MaterialCommunityIcons
//                     name="calendar-sync"
//                     size={27}
//                     color={platform.color}
//                   />
//                 )}
//               </View>

//               <View style={styles.platformInfo}>
//                 <Text style={styles.platformName}>
//                   {platform.name}
//                 </Text>

//                 <Text style={styles.platformDescription}>
//                   {platform.description}
//                 </Text>

//                 {connected && calendar && (
//                   <View style={styles.connectionDetails}>
//                     <Text
//                       style={styles.detailText}
//                       numberOfLines={1}
//                     >
//                       {tSafe('url_label', 'URL:')}{' '}
//                       {getCalendarUrl(calendar)}
//                     </Text>

//                     {calendar.last_synced && (
//                       <Text style={styles.detailText}>
//                         {tSafe('last_synced', 'Last synced:')}{' '}
//                         {getFormattedDate(calendar.last_synced)}
//                       </Text>
//                     )}

//                     {Array.isArray(
//                       calendar.assigned_cleaners
//                     ) &&
//                       calendar.assigned_cleaners.length > 0 && (
//                         <View style={styles.cleanerChips}>
//                           {calendar.assigned_cleaners.map(
//                             cleanerId => {
//                               const cleaner = cleaners.find(
//                                 item =>
//                                   item._id === cleanerId ||
//                                   item._id ===
//                                     cleanerId?.toString()
//                               );

//                               if (!cleaner) return null;

//                               return (
//                                 <View
//                                   key={String(cleanerId)}
//                                   style={styles.cleanerChip}
//                                 >
//                                   {cleaner.avatarUrl ? (
//                                     <Avatar.Image
//                                       size={22}
//                                       source={{
//                                         uri: cleaner.avatarUrl,
//                                       }}
//                                     />
//                                   ) : (
//                                     <Avatar.Text
//                                       size={22}
//                                       label={(
//                                         cleaner.firstname || 'C'
//                                       )
//                                         .charAt(0)
//                                         .toUpperCase()}
//                                       style={styles.cleanerAvatar}
//                                       labelStyle={
//                                         styles.cleanerAvatarLabel
//                                       }
//                                     />
//                                   )}

//                                   <Text
//                                     style={styles.cleanerChipText}
//                                     numberOfLines={1}
//                                   >
//                                     {cleaner.firstname ||
//                                       tSafe('cleaner', 'Cleaner')}
//                                   </Text>
//                                 </View>
//                               );
//                             }
//                           )}
//                         </View>
//                       )}
//                   </View>
//                 )}
//               </View>

//               <View style={styles.platformStatus}>
//                 {connected ? (
//                   <>
//                     <View style={styles.connectedBadge}>
//                       <MaterialIcons
//                         name="check-circle"
//                         size={15}
//                         color={theme.status.success}
//                       />

//                       <Text style={styles.connectedText}>
//                         {tSafe('linked', 'Linked')}
//                       </Text>
//                     </View>

//                     {isSyncing ? (
//                       <ActivityIndicator
//                         size="small"
//                         color={theme.brand.primary}
//                         style={styles.syncLoader}
//                       />
//                     ) : (
//                       <Switch
//                         value={calendar.enabled !== false}
//                         onValueChange={() =>
//                           toggleSync(calendar)
//                         }
//                         trackColor={{
//                           false: theme.border.default,
//                           true: theme.brand.primary,
//                         }}
//                         thumbColor={
//                           theme.button.primaryText
//                         }
//                         disabled={isSyncing}
//                         style={styles.syncSwitch}
//                         accessibilityLabel={tSafe(
//                           'toggle_calendar_sync',
//                           'Toggle calendar synchronization'
//                         )}
//                       />
//                     )}
//                   </>
//                 ) : (
//                   <View style={styles.connectButton}>
//                     <Text style={styles.connectButtonText}>
//                       {tSafe('connect', 'Connect')}
//                     </Text>

//                     <MaterialIcons
//                       name="chevron-right"
//                       size={20}
//                       color={theme.brand.primary}
//                     />
//                   </View>
//                 )}
//               </View>
//             </View>
//           </TouchableOpacity>
//         </Animatable.View>
//       );
//     },
//     [
//       getCalendarForPlatform,
//       syncingCalendarIds,
//       styles,
//       theme,
//       cleaners,
//       getCalendarUrl,
//       getFormattedDate,
//       handlePlatformPress,
//       toggleSync,
//     ]
//   );

//   // ---------------------------------------------------------
//   // Render connected calendar item
//   // ---------------------------------------------------------

//   const renderSyncedCalendarItem = useCallback(
//     calendar => {
//       const platformName = getPlatformName(
//         calendar.platform
//       );

//       const isSyncing = syncingCalendarIds.includes(
//         calendar._id
//       );

//       return (
//         <Animatable.View
//           key={calendar._id || calendar.platform}
//           animation="fadeInUp"
//           duration={400}
//           style={styles.syncedCard}
//         >
//           <View style={styles.syncedCardContent}>
//             <View style={styles.syncedIcon}>
//               <MaterialCommunityIcons
//                 name="calendar-sync"
//                 size={23}
//                 color={theme.brand.primary}
//               />
//             </View>

//             <View style={styles.syncedInfo}>
//               <Text style={styles.syncedName}>
//                 {platformName}
//               </Text>

//               <Text
//                 style={styles.syncedUrl}
//                 numberOfLines={1}
//               >
//                 {getCalendarUrl(calendar)}
//               </Text>

//               {calendar.last_synced && (
//                 <Text style={styles.syncedDate}>
//                   {tSafe('last_synced', 'Last synced:')}{' '}
//                   {getFormattedDate(calendar.last_synced)}
//                 </Text>
//               )}

//               <View
//                 style={[
//                   styles.syncStatusRow,
//                   {
//                     backgroundColor:
//                       calendar.enabled === false
//                         ? theme.status.warningBackground
//                         : theme.status.successBackground,
//                   },
//                 ]}
//               >
//                 <View
//                   style={[
//                     styles.syncStatusDot,
//                     {
//                       backgroundColor:
//                         calendar.enabled === false
//                           ? theme.status.warning
//                           : theme.status.success,
//                     },
//                   ]}
//                 />

//                 <Text
//                   style={[
//                     styles.syncStatusText,
//                     {
//                       color:
//                         calendar.enabled === false
//                           ? theme.status.warning
//                           : theme.status.success,
//                     },
//                   ]}
//                 >
//                   {calendar.enabled === false
//                     ? tSafe('sync_disabled', 'Sync disabled')
//                     : tSafe('sync_enabled', 'Sync enabled')}
//                 </Text>
//               </View>
//             </View>

//             {isSyncing ? (
//               <ActivityIndicator
//                 size="small"
//                 color={theme.brand.primary}
//               />
//             ) : (
//               <Switch
//                 value={calendar.enabled !== false}
//                 onValueChange={() => toggleSync(calendar)}
//                 trackColor={{
//                   false: theme.border.default,
//                   true: theme.brand.primary,
//                 }}
//                 thumbColor={theme.button.primaryText}
//                 disabled={isSyncing}
//                 accessibilityLabel={tSafe(
//                   'toggle_calendar_sync',
//                   'Toggle calendar synchronization'
//                 )}
//               />
//             )}
//           </View>
//         </Animatable.View>
//       );
//     },
//     [
//       getPlatformName,
//       getCalendarUrl,
//       getFormattedDate,
//       syncingCalendarIds,
//       styles,
//       theme,
//       toggleSync,
//     ]
//   );

//   // ---------------------------------------------------------
//   // Benefits data
//   // ---------------------------------------------------------

//   const benefits = useMemo(
//     () => [
//       {
//         key: 'auto_sync',
//         title: tSafe('auto_sync', 'Auto-Sync'),
//         description: tSafe(
//           'auto_sync_desc',
//           'Availability updates automatically'
//         ),
//         icon: 'autorenew',
//       },
//       {
//         key: 'no_overbooking',
//         title: tSafe('no_overbooking', 'No Overbooking'),
//         description: tSafe(
//           'no_overbooking_desc',
//           'Help prevent double bookings'
//         ),
//         icon: 'block',
//       },
//       {
//         key: 'save_time',
//         title: tSafe('save_time', 'Save Time'),
//         description: tSafe(
//           'save_time_desc',
//           'Reduce manual calendar updates'
//         ),
//         icon: 'schedule',
//       },
//       {
//         key: 'maximize_revenue',
//         title: tSafe(
//           'maximize_revenue',
//           'Maximize Revenue'
//         ),
//         description: tSafe(
//           'maximize_revenue_desc',
//           'Make better use of your booking calendar'
//         ),
//         icon: 'trending-up',
//       },
//     ],
//     []
//   );

//   // ---------------------------------------------------------
//   // Missing property safeguard
//   // ---------------------------------------------------------

//   if (!property || !propertyId) {
//     return (
//       <View style={styles.errorContainer}>
//         <View style={styles.errorIconContainer}>
//           <MaterialCommunityIcons
//             name="home-alert-outline"
//             size={38}
//             color={theme.status.error}
//           />
//         </View>

//         <Text style={styles.errorTitle}>
//           {tSafe('property_not_found', 'Property not found')}
//         </Text>

//         <Text style={styles.errorDescription}>
//           {tSafe(
//             'property_not_found_desc',
//             'We could not load this property. Please return and select a property again.'
//           )}
//         </Text>

//         <TouchableOpacity
//           style={styles.primaryButton}
//           onPress={() => navigation.goBack()}
//           activeOpacity={0.8}
//         >
//           <Text style={styles.primaryButtonText}>
//             {tSafe('go_back', 'Go Back')}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   // ---------------------------------------------------------
//   // Main screen
//   // ---------------------------------------------------------

//   return (
//     <View style={styles.screen}>
//       <StatusBar
//         backgroundColor={theme.background.default}
//         barStyle={isDark ? 'light-content' : 'dark-content'}
//       />

//       <ScrollView
//         style={styles.container}
//         contentContainerStyle={styles.contentContainer}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={handleRefresh}
//             tintColor={theme.brand.primary}
//             colors={[theme.brand.primary]}
//             progressBackgroundColor={theme.surface.default}
//           />
//         }
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Property header */}
//         <Animatable.View
//           animation="fadeInUp"
//           duration={500}
//           style={styles.propertyCard}
//         >
//           <View style={styles.propertyTopRow}>
//             <View style={styles.propertyIconContainer}>
//               <MaterialCommunityIcons
//                 name="home-city-outline"
//                 size={25}
//                 color={theme.brand.primary}
//               />
//             </View>

//             <View style={styles.propertyHeading}>
//               <Text style={styles.eyebrow}>
//                 {tSafe('your_property', 'YOUR PROPERTY')}
//               </Text>

//               <Text style={styles.propertyName}>
//                 {property.apt_name ||
//                   tSafe('unnamed_property', 'Unnamed property')}
//               </Text>
//             </View>

//             <TouchableOpacity
//               style={styles.editPropertyButton}
//               onPress={() =>
//                 navigation.navigate(
//                   ROUTES.host_edit_apt,
//                   { propertyId }
//                 )
//               }
//               activeOpacity={0.8}
//               accessibilityRole="button"
//               accessibilityLabel={tSafe(
//                 'edit_property',
//                 'Edit property'
//               )}
//             >
//               <MaterialCommunityIcons
//                 name="pencil-outline"
//                 size={19}
//                 color={theme.brand.primary}
//               />
//             </TouchableOpacity>
//           </View>

//           <View style={styles.addressRow}>
//             <MaterialCommunityIcons
//               name="map-marker-outline"
//               size={18}
//               color={theme.text.secondary}
//             />

//             <Text style={styles.propertyAddress}>
//               {property.address ||
//                 tSafe('address_not_available', 'Address not available')}
//             </Text>
//           </View>

//           <View style={styles.propertyDivider} />

//           <View style={styles.roomStats}>
//             <CircleIcon
//               iconName="bed-empty"
//               buttonSize={26}
//               radiusSise={13}
//               iconSize={16}
//               title={bedroomCount}
//               roomSize={bedroomSize}
//               type={tSafe('bedrooms', 'Bedrooms')}
//             />

//             <CircleIcon
//               iconName="shower-head"
//               buttonSize={26}
//               radiusSise={13}
//               iconSize={16}
//               title={bathroomCount}
//               roomSize={bathroomSize}
//               type={tSafe('bathrooms', 'Bathrooms')}
//             />

//             <CircleIcon
//               iconName="silverware-fork-knife"
//               buttonSize={26}
//               radiusSise={13}
//               iconSize={16}
//               title={kitchenCount}
//               roomSize={kitchenSize}
//               type={tSafe('kitchen', 'Kitchen')}
//             />

//             <CircleIcon
//               iconName="seat-legroom-extra"
//               buttonSize={26}
//               radiusSise={13}
//               iconSize={16}
//               title={livingroomCount}
//               roomSize={livingroomSize}
//               type={tSafe('livingroom', 'Livingroom')}
//             />
//           </View>
//         </Animatable.View>

//         {/* Calendar connection section */}
//         <Animatable.View
//           animation="fadeInUp"
//           delay={100}
//           style={styles.section}
//         >
//           <View style={styles.sectionHeadingRow}>
//             <View style={styles.sectionHeadingIcon}>
//               <MaterialCommunityIcons
//                 name="calendar-sync"
//                 size={23}
//                 color={theme.brand.primary}
//               />
//             </View>

//             <View style={styles.sectionHeadingText}>
//               <Text style={styles.sectionTitle}>
//                 {tSafe(
//                   'connect_calendars_title',
//                   'Connect Your Calendars'
//                 )}
//               </Text>

//               <Text style={styles.sectionSubtitle}>
//                 {tSafe(
//                   'connect_calendars_subtitle',
//                   'Sync with booking platforms to keep your availability up to date.'
//                 )}
//               </Text>
//             </View>
//           </View>

//           <View style={styles.platformsContainer}>
//             {bookingPlatforms.map(renderPlatformCard)}
//           </View>
//         </Animatable.View>

//         {/* Connected calendars */}
//         {syncedCalendars.length > 0 && (
//           <Animatable.View
//             animation="fadeInUp"
//             delay={200}
//             style={styles.section}
//           >
//             <View style={styles.sectionHeadingRow}>
//               <View style={styles.sectionHeadingIcon}>
//                 <MaterialCommunityIcons
//                   name="calendar-check-outline"
//                   size={23}
//                   color={theme.brand.primary}
//                 />
//               </View>

//               <View style={styles.sectionHeadingText}>
//                 <Text style={styles.sectionTitle}>
//                   {tSafe(
//                     'connected_calendars_title',
//                     'Your Connected Calendars'
//                   )}
//                 </Text>

//                 <Text style={styles.sectionSubtitle}>
//                   {tSafe(
//                     'connected_calendars_subtitle',
//                     'Manage the calendars linked to this property.'
//                   )}
//                 </Text>
//               </View>
//             </View>

//             {syncedCalendars.map(renderSyncedCalendarItem)}
//           </Animatable.View>
//         )}

//         {/* Benefits */}
//         <Animatable.View
//           animation="fadeInUp"
//           delay={300}
//           style={styles.benefitsSection}
//         >
//           <View style={styles.sectionHeadingRow}>
//             <View style={styles.sectionHeadingIcon}>
//               <MaterialCommunityIcons
//                 name="lightbulb-outline"
//                 size={23}
//                 color={theme.brand.primary}
//               />
//             </View>

//             <View style={styles.sectionHeadingText}>
//               <Text style={styles.sectionTitle}>
//                 {tSafe(
//                   'why_connect_calendars',
//                   'Why Connect Calendars?'
//                 )}
//               </Text>

//               <Text style={styles.sectionSubtitle}>
//                 {tSafe(
//                   'calendar_benefits_subtitle',
//                   'Keep your property bookings organized and reduce manual work.'
//                 )}
//               </Text>
//             </View>
//           </View>

//           <View style={styles.benefitsGrid}>
//             {benefits.map(benefit => (
//               <View
//                 key={benefit.key}
//                 style={styles.benefitCard}
//               >
//                 <View style={styles.benefitIconContainer}>
//                   <MaterialIcons
//                     name={benefit.icon}
//                     size={23}
//                     color={theme.brand.primary}
//                   />
//                 </View>

//                 <Text style={styles.benefitTitle}>
//                   {benefit.title}
//                 </Text>

//                 <Text style={styles.benefitText}>
//                   {benefit.description}
//                 </Text>
//               </View>
//             ))}
//           </View>
//         </Animatable.View>

//         {/* Initial loading indicator */}
//         {initialLoading && (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator
//               size="small"
//               color={theme.brand.primary}
//             />

//             <Text style={styles.loadingText}>
//               {tSafe(
//                 'loading_calendar_data',
//                 'Loading calendar information...'
//               )}
//             </Text>
//           </View>
//         )}

//         <View style={styles.bottomSpacing} />
//       </ScrollView>

//       {/* Add/edit calendar modal */}
//       <AddICalModal
//         visible={modalVisible}
//         onClose={closeCalendarModal}
//         onSave={handleSaveSync}
//         cleaners={linkedCleaners}
//         aptId={propertyId}
//         preselectedPlatform={selectedPlatform}
//         existingCalendar={selectedCalendar}
//         checklists={checklists}
//         property={property}
//       />
//     </View>
//   );
// }

// // =========================================================
// // Theme-aware styles
// // =========================================================

// const createStyles = (theme, isDark) =>
//   StyleSheet.create({
//     screen: {
//       flex: 1,
//       backgroundColor: theme.background.default,
//     },

//     container: {
//       flex: 1,
//       backgroundColor: theme.background.default,
//     },

//     contentContainer: {
//       paddingHorizontal: 16,
//       paddingTop: 16,
//       paddingBottom: 24,
//     },

//     // Property card
//     propertyCard: {
//       backgroundColor: theme.card.background,
//       borderRadius: 24,
//       padding: 20,
//       marginBottom: 28,
//       borderWidth: 1,
//       borderColor: theme.card.border,
//       shadowColor: theme.shadow.color,
//       shadowOffset: { width: 0, height: 4 },
//       shadowOpacity: theme.shadow.opacity,
//       shadowRadius: 12,
//       elevation: 3,
//     },

//     propertyTopRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },

//     propertyIconContainer: {
//       width: 50,
//       height: 50,
//       borderRadius: 16,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: theme.brand.primaryLight,
//       marginRight: 12,
//     },

//     propertyHeading: {
//       flex: 1,
//     },

//     eyebrow: {
//       fontSize: 10,
//       fontWeight: '800',
//       letterSpacing: 1.2,
//       color: theme.text.secondary,
//       marginBottom: 4,
//     },

//     propertyName: {
//       fontSize: 21,
//       fontWeight: '800',
//       color: theme.text.primary,
//       lineHeight: 27,
//     },

//     editPropertyButton: {
//       width: 40,
//       height: 40,
//       borderRadius: 14,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: theme.brand.primaryLight,
//       marginLeft: 8,
//     },

//     addressRow: {
//       flexDirection: 'row',
//       alignItems: 'flex-start',
//       marginTop: 16,
//       marginBottom: 18,
//     },

//     propertyAddress: {
//       flex: 1,
//       fontSize: 13,
//       color: theme.text.secondary,
//       marginLeft: 7,
//       lineHeight: 19,
//     },

//     propertyDivider: {
//       height: StyleSheet.hairlineWidth,
//       backgroundColor: theme.divider,
//       marginBottom: 18,
//     },

//     roomStats: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'flex-start',
//     },

//     // Sections
//     section: {
//       marginBottom: 28,
//     },

//     sectionHeadingRow: {
//       flexDirection: 'row',
//       alignItems: 'flex-start',
//       marginBottom: 16,
//     },

//     sectionHeadingIcon: {
//       width: 44,
//       height: 44,
//       borderRadius: 14,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: theme.brand.primaryLight,
//       marginRight: 12,
//     },

//     sectionHeadingText: {
//       flex: 1,
//       paddingTop: 1,
//     },

//     sectionTitle: {
//       fontSize: 19,
//       fontWeight: '800',
//       color: theme.text.primary,
//       marginBottom: 5,
//     },

//     sectionSubtitle: {
//       fontSize: 13,
//       color: theme.text.secondary,
//       lineHeight: 19,
//     },

//     // Booking platform cards
//     platformsContainer: {
//       gap: 12,
//     },

//     platformCard: {
//       backgroundColor: theme.card.background,
//       borderRadius: 20,
//       borderLeftWidth: 4,
//       overflow: 'hidden',
//       borderTopWidth: 1,
//       borderRightWidth: 1,
//       borderBottomWidth: 1,
//       borderTopColor: theme.card.border,
//       borderRightColor: theme.card.border,
//       borderBottomColor: theme.card.border,
//       shadowColor: theme.shadow.color,
//       shadowOffset: { width: 0, height: 3 },
//       shadowOpacity: theme.shadow.opacity,
//       shadowRadius: 8,
//       elevation: 2,
//     },

//     platformCardContent: {
//       flexDirection: 'row',
//       alignItems: 'flex-start',
//       padding: 14,
//     },

//     platformIconContainer: {
//       width: 46,
//       height: 46,
//       borderRadius: 15,
//       alignItems: 'center',
//       justifyContent: 'center',
//       marginRight: 11,
//     },

//     platformIcon: {
//       width: 30,
//       height: 30,
//     },

//     platformInfo: {
//       flex: 1,
//       minWidth: 0,
//     },

//     platformName: {
//       fontSize: 15,
//       fontWeight: '800',
//       color: theme.text.primary,
//       marginBottom: 5,
//     },

//     platformDescription: {
//       fontSize: 12,
//       color: theme.text.secondary,
//       lineHeight: 17,
//     },

//     connectionDetails: {
//       marginTop: 10,
//       paddingTop: 9,
//       borderTopWidth: StyleSheet.hairlineWidth,
//       borderTopColor: theme.divider,
//     },

//     detailText: {
//       fontSize: 10,
//       color: theme.text.muted,
//       marginTop: 4,
//       lineHeight: 15,
//     },

//     cleanerChips: {
//       flexDirection: 'row',
//       flexWrap: 'wrap',
//       marginTop: 8,
//     },

//     cleanerChip: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       backgroundColor: theme.surface.elevated,
//       borderRadius: 18,
//       paddingHorizontal: 7,
//       paddingVertical: 4,
//       marginRight: 6,
//       marginBottom: 5,
//       maxWidth: '100%',
//     },

//     cleanerAvatar: {
//       backgroundColor: theme.brand.primary,
//     },

//     cleanerAvatarLabel: {
//       fontSize: 10,
//       color: theme.button.primaryText,
//     },

//     cleanerChipText: {
//       fontSize: 10,
//       fontWeight: '600',
//       color: theme.text.primary,
//       marginLeft: 5,
//       maxWidth: 95,
//     },

//     platformStatus: {
//       alignItems: 'center',
//       justifyContent: 'center',
//       marginLeft: 7,
//       minWidth: 55,
//     },

//     connectedBadge: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: theme.status.successBackground,
//       borderRadius: 20,
//       paddingHorizontal: 7,
//       paddingVertical: 5,
//       marginBottom: 8,
//     },

//     connectedText: {
//       fontSize: 10,
//       fontWeight: '800',
//       color: theme.status.success,
//       marginLeft: 4,
//     },

//     syncSwitch: {
//       transform: [{ scale: 0.88 }],
//     },

//     syncLoader: {
//       marginVertical: 7,
//     },

//     connectButton: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: theme.brand.primaryLight,
//       paddingHorizontal: 9,
//       paddingVertical: 8,
//       borderRadius: 14,
//     },

//     connectButtonText: {
//       fontSize: 11,
//       fontWeight: '800',
//       color: theme.brand.primary,
//       marginRight: 2,
//     },

//     // Connected calendar list
//     syncedCard: {
//       backgroundColor: theme.card.background,
//       borderRadius: 18,
//       padding: 14,
//       marginBottom: 12,
//       borderWidth: 1,
//       borderColor: theme.card.border,
//       shadowColor: theme.shadow.color,
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: theme.shadow.opacity,
//       shadowRadius: 5,
//       elevation: 2,
//     },

//     syncedCardContent: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },

//     syncedIcon: {
//       width: 44,
//       height: 44,
//       borderRadius: 15,
//       backgroundColor: theme.brand.primaryLight,
//       alignItems: 'center',
//       justifyContent: 'center',
//       marginRight: 12,
//     },

//     syncedInfo: {
//       flex: 1,
//       minWidth: 0,
//       marginRight: 8,
//     },

//     syncedName: {
//       fontSize: 14,
//       fontWeight: '800',
//       color: theme.text.primary,
//       marginBottom: 4,
//     },

//     syncedUrl: {
//       fontSize: 11,
//       color: theme.text.secondary,
//       marginBottom: 4,
//     },

//     syncedDate: {
//       fontSize: 10,
//       color: theme.text.muted,
//       marginBottom: 7,
//     },

//     syncStatusRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       alignSelf: 'flex-start',
//       paddingHorizontal: 8,
//       paddingVertical: 4,
//       borderRadius: 12,
//       marginTop: 3,
//     },

//     syncStatusDot: {
//       width: 6,
//       height: 6,
//       borderRadius: 3,
//       marginRight: 6,
//     },

//     syncStatusText: {
//       fontSize: 10,
//       fontWeight: '700',
//     },

//     // Benefits section
//     benefitsSection: {
//       backgroundColor: theme.card.background,
//       borderRadius: 24,
//       padding: 18,
//       marginBottom: 12,
//       borderWidth: 1,
//       borderColor: theme.card.border,
//       shadowColor: theme.shadow.color,
//       shadowOffset: { width: 0, height: 3 },
//       shadowOpacity: theme.shadow.opacity,
//       shadowRadius: 8,
//       elevation: 2,
//     },

//     benefitsGrid: {
//       flexDirection: 'row',
//       flexWrap: 'wrap',
//       justifyContent: 'space-between',
//     },

//     benefitCard: {
//       width: '48%',
//       minHeight: 155,
//       backgroundColor: theme.surface.elevated,
//       borderRadius: 18,
//       paddingHorizontal: 12,
//       paddingVertical: 16,
//       marginBottom: 12,
//       alignItems: 'center',
//       justifyContent: 'flex-start',
//       borderWidth: 1,
//       borderColor: theme.card.border,
//     },

//     benefitIconContainer: {
//       width: 44,
//       height: 44,
//       borderRadius: 15,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: theme.brand.primaryLight,
//       marginBottom: 10,
//     },

//     benefitTitle: {
//       fontSize: 13,
//       fontWeight: '800',
//       color: theme.text.primary,
//       marginBottom: 5,
//       textAlign: 'center',
//     },

//     benefitText: {
//       fontSize: 11,
//       color: theme.text.secondary,
//       textAlign: 'center',
//       lineHeight: 16,
//     },

//     // Loading
//     loadingContainer: {
//       flexDirection: 'row',
//       justifyContent: 'center',
//       alignItems: 'center',
//       paddingVertical: 16,
//     },

//     loadingText: {
//       fontSize: 12,
//       color: theme.text.secondary,
//       marginLeft: 10,
//     },

//     bottomSpacing: {
//       height: 12,
//     },

//     // Missing property
//     errorContainer: {
//       flex: 1,
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: 28,
//       backgroundColor: theme.background.default,
//     },

//     errorIconContainer: {
//       width: 76,
//       height: 76,
//       borderRadius: 24,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: theme.status.errorBackground,
//       marginBottom: 18,
//     },

//     errorTitle: {
//       fontSize: 21,
//       fontWeight: '800',
//       color: theme.text.primary,
//       textAlign: 'center',
//       marginBottom: 8,
//     },

//     errorDescription: {
//       fontSize: 14,
//       lineHeight: 21,
//       color: theme.text.secondary,
//       textAlign: 'center',
//       marginBottom: 22,
//     },

//     primaryButton: {
//       paddingHorizontal: 24,
//       paddingVertical: 13,
//       borderRadius: 14,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: theme.button.primaryBackground,
//     },

//     primaryButtonText: {
//       fontSize: 14,
//       fontWeight: '800',
//       color: theme.button.primaryText,
//     },
//   });




import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
} from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Switch,
  StatusBar,
  Alert,
} from 'react-native';

import {
  IconButton,
  Avatar,
} from 'react-native-paper';

import {
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';

import {
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';

import * as Animatable from 'react-native-animatable';

import ROUTES from '../../constants/routes';
import CircleIcon from '../../components/shared/CircleIcon';
import AddICalModal from '../../components/host/AddICalModal';
import userService from '../../services/connection/userService';
import { tSafe } from '../../utils/tSafe';
import { useTheme } from '../../theme/ThemeProvider';

export default function ICalendar({ route }) {
  const { property, linkedCleaners = [] } = route.params || {};

  const navigation = useNavigation();
  const { theme, isDark } = useTheme();

  const styles = useMemo(
    () => createStyles(theme),
    [theme]
  );

  // --------------------------------------------------
  // State
  // --------------------------------------------------

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [syncedCalendars, setSyncedCalendars] = useState([]);
  const [cleaners, setCleaners] = useState([]);
  const [checklists, setChecklists] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedCalendar, setSelectedCalendar] = useState(null);

  const [syncingIds, setSyncingIds] = useState([]);
  const [expandedCalendarIds, setExpandedCalendarIds] = useState([]);

  const propertyId = property?._id;

  // --------------------------------------------------
  // Room details
  // --------------------------------------------------

  const getRoomDetail = useCallback(
    (type, field = 'number') => {
      const room = property?.roomDetails?.find(
        item =>
          item.type?.toLowerCase() === type.toLowerCase()
      );

      return room?.[field] ?? 0;
    },
    [property]
  );

  const bedroomCount = getRoomDetail('Bedroom');
  const bathroomCount = getRoomDetail('Bathroom');
  const kitchenCount = getRoomDetail('Kitchen');
  const livingroomCount = getRoomDetail('Livingroom');

  const bedroomSize = getRoomDetail('Bedroom', 'size');
  const bathroomSize = getRoomDetail('Bathroom', 'size');
  const kitchenSize = getRoomDetail('Kitchen', 'size');
  const livingroomSize = getRoomDetail('Livingroom', 'size');

  // --------------------------------------------------
  // Booking platforms
  // --------------------------------------------------

  const bookingPlatforms = useMemo(
    () => [
      {
        id: 'airbnb',
        name: tSafe('airbnb', 'Airbnb'),
        description: tSafe(
          'airbnb_desc',
          'Sync your Airbnb calendar to automatically update availability.'
        ),
        icon: require('../../assets/images/airbnb_logo.png'),
        color: '#FF5A5F',
      },
      {
        id: 'booking',
        name: tSafe('booking_com', 'Booking.com'),
        description: tSafe(
          'booking_desc',
          'Connect your Booking.com calendar to manage reservations.'
        ),
        icon: require('../../assets/images/booking_logo.png'),
        color: '#003580',
      },
      {
        id: 'vrbo',
        name: tSafe('vrbo', 'Vrbo'),
        description: tSafe(
          'vrbo_desc',
          'Link your Vrbo calendar to synchronize bookings.'
        ),
        icon: require('../../assets/images/vrbo_logo.png'),
        color: '#15356B',
      },
      {
        id: 'ical',
        name: tSafe('other_calendar', 'Other Calendar'),
        description: tSafe(
          'ical_desc',
          'Connect any supported calendar using an iCal URL.'
        ),
        icon: null,
        color: theme.brand.primary,
      },
    ],
    [theme.brand.primary]
  );

  // --------------------------------------------------
  // Calendar helpers
  // --------------------------------------------------

  const getCalendarForPlatform = useCallback(
    platformId =>
      syncedCalendars.find(
        calendar => calendar.platform === platformId
      ),
    [syncedCalendars]
  );

  const getCalendarUrl = useCallback(
    calendar =>
      calendar?.ical_url ||
      calendar?.calendar_url ||
      '',
    []
  );

  const getPlatformName = useCallback(
    platformId => {
      const names = {
        airbnb: tSafe('airbnb', 'Airbnb'),
        booking: tSafe('booking_com', 'Booking.com'),
        vrbo: tSafe('vrbo', 'Vrbo'),
        ical: tSafe('other_calendar', 'Other Calendar'),
      };

      return names[platformId] || platformId || '';
    },
    []
  );

  const formatDate = useCallback(date => {
    if (!date) return null;

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  const formatDateTime = useCallback(date => {
    if (!date) return null;

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }, []);

  const isCalendarExpanded = useCallback(
    calendarId =>
      expandedCalendarIds.includes(calendarId),
    [expandedCalendarIds]
  );

  const toggleCalendarDetails = useCallback(calendarId => {
    setExpandedCalendarIds(previous =>
      previous.includes(calendarId)
        ? previous.filter(id => id !== calendarId)
        : [...previous, calendarId]
    );
  }, []);

  // --------------------------------------------------
  // Fetch checklists
  // --------------------------------------------------

  const fetchChecklists = useCallback(async () => {
    if (!property?.checklists?.length) {
      setChecklists([]);
      return;
    }

    try {
      const response =
        await userService.getCustomChecklistsByProperty(
          property.checklists
        );

      const result =
        response?.data?.data ??
        response?.data ??
        [];

      setChecklists(
        Array.isArray(result) ? result : []
      );
    } catch (error) {
      console.error('Error fetching checklists:', error);
      setChecklists([]);
    }
  }, [property]);

  // --------------------------------------------------
  // Fetch synchronized calendars
  // --------------------------------------------------

  const fetchSyncedCals = useCallback(async () => {
    if (!propertyId) {
      setSyncedCalendars([]);
      return;
    }

    const response =
      await userService.getSyncedCalsByApartmentIds(
        propertyId
      );

    const records = Array.isArray(response?.data)
      ? response.data
      : [];

    if (records.length === 0) {
      setSyncedCalendars([]);
      return;
    }

    const calendarRecord = records[0];

    const calendars = Array.isArray(
      calendarRecord?.calendars
    )
      ? calendarRecord.calendars.map(calendar => ({
          ...calendar,
          propertyId,
          calId: calendarRecord._id,
        }))
      : [];

    setSyncedCalendars(calendars);
  }, [propertyId]);

  // --------------------------------------------------
  // Fetch cleaners
  // --------------------------------------------------

  const fetchCleaners = useCallback(async () => {
    const preferredCleaners = Array.isArray(
      property?.preferredCleaners
    )
      ? property.preferredCleaners
      : [];

    setCleaners(preferredCleaners);
  }, [property]);

  // --------------------------------------------------
  // Load screen data
  // --------------------------------------------------

  const fetchAll = useCallback(async () => {
    const results = await Promise.allSettled([
      fetchSyncedCals(),
      fetchChecklists(),
      fetchCleaners(),
    ]);

    const calendarResult = results[0];

    if (calendarResult.status === 'rejected') {
      console.error(
        'Error fetching calendars:',
        calendarResult.reason
      );

      throw calendarResult.reason;
    }
  }, [
    fetchSyncedCals,
    fetchChecklists,
    fetchCleaners,
  ]);

  const handleRefresh = useCallback(async () => {
    if (!propertyId) return;

    setRefreshing(true);

    try {
      await fetchAll();
    } catch (error) {
      console.error('Calendar refresh failed:', error);

      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe(
          'refresh_failed',
          'Unable to refresh calendar information.'
        )
      );
    } finally {
      setRefreshing(false);
    }
  }, [fetchAll, propertyId]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);

      try {
        await fetchAll();
      } catch (error) {
        console.error('Error loading calendars:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [fetchAll]);

  useFocusEffect(
    useCallback(() => {
      if (!propertyId) return undefined;

      let active = true;

      const refreshOnFocus = async () => {
        try {
          await fetchAll();
        } catch (error) {
          console.error(
            'Error refreshing calendar screen:',
            error
          );
        } finally {
          if (active) {
            setRefreshing(false);
          }
        }
      };

      refreshOnFocus();

      return () => {
        active = false;
      };
    }, [fetchAll, propertyId])
  );

  // --------------------------------------------------
  // Navigation header
  // --------------------------------------------------

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon="pencil-outline"
          size={21}
          iconColor={theme.brand.primary}
          onPress={() =>
            navigation.navigate(
              ROUTES.host_edit_apt,
              { propertyId }
            )
          }
          accessibilityLabel={tSafe(
            'edit_property',
            'Edit property'
          )}
        />
      ),
    });
  }, [navigation, propertyId, theme.brand.primary]);

  // --------------------------------------------------
  // Connect / edit calendar
  // --------------------------------------------------

  const handlePlatformPress = useCallback(
    platformId => {
      const calendar = getCalendarForPlatform(platformId);

      setSelectedPlatform(platformId);
      setSelectedCalendar(calendar || null);
      setModalVisible(true);
    },
    [getCalendarForPlatform]
  );

  const closeCalendarModal = useCallback(() => {
    setModalVisible(false);
    setSelectedPlatform(null);
    setSelectedCalendar(null);
  }, []);

  const handleSaveSync = useCallback(
    async data => {
      try {
        if (selectedCalendar) {
          await userService.updateCalendar(data);
        } else {
          await userService.createSyncCalendar({
            aptId: data.aptId,
            calendar: data.calendar,
            selectedChecklist: data.selectedChecklist,
          });
        }

        await fetchSyncedCals();
        closeCalendarModal();

        Alert.alert(
          tSafe('success_title', 'Success'),
          tSafe(
            'calendar_sync_saved',
            'Calendar sync saved successfully.'
          )
        );
      } catch (error) {
        console.error('Error saving calendar:', error);

        Alert.alert(
          tSafe('error_title', 'Error'),
          tSafe(
            'failed_save_calendar',
            'Failed to save calendar synchronization.'
          )
        );
      }
    },
    [
      selectedCalendar,
      fetchSyncedCals,
      closeCalendarModal,
    ]
  );

  // --------------------------------------------------
  // Toggle synchronization
  // --------------------------------------------------

  const toggleSync = useCallback(
    async calendar => {
      if (!calendar?._id) {
        Alert.alert(
          tSafe('error_title', 'Error'),
          tSafe(
            'calendar_id_missing',
            'The calendar ID is missing.'
          )
        );
        return;
      }

      const calendarId = calendar._id;
      const nextEnabled = calendar.enabled === false;

      setSyncingIds(previous =>
        previous.includes(calendarId)
          ? previous
          : [...previous, calendarId]
      );

      // Update the displayed switch optimistically.
      setSyncedCalendars(previous =>
        previous.map(item =>
          item._id === calendarId
            ? { ...item, enabled: nextEnabled }
            : item
        )
      );

      try {
        await userService.updateSyncCalendar(
          calendarId,
          { enabled: nextEnabled }
        );

        await fetchSyncedCals();
      } catch (error) {
        console.error(
          'Error updating calendar sync:',
          error
        );

        // Restore server state if the update fails.
        try {
          await fetchSyncedCals();
        } catch (refreshError) {
          console.error(
            'Unable to restore calendar state:',
            refreshError
          );
        }

        Alert.alert(
          tSafe('error_title', 'Error'),
          tSafe(
            'failed_update_sync',
            'Failed to update synchronization status.'
          )
        );
      } finally {
        setSyncingIds(previous =>
          previous.filter(id => id !== calendarId)
        );
      }
    },
    [fetchSyncedCals]
  );

  // --------------------------------------------------
  // Connected status summary
  // --------------------------------------------------

  const connectedCount = syncedCalendars.length;

  const enabledCount = syncedCalendars.filter(
    calendar => calendar.enabled !== false
  ).length;

  const hasConnectedCalendars = connectedCount > 0;

  // --------------------------------------------------
  // Render platform logo
  // --------------------------------------------------

  const renderPlatformIcon = (platform, size = 58) => {
    if (platform.icon) {
      return (
        <Image
          source={platform.icon}
          style={{
            width: size,
            height: size,
            borderRadius: 15,
          }}
          resizeMode="contain"
        />
      );
    }

    return (
      <View
        style={[
          styles.platformLogo,
          {
            width: size,
            height: size,
            backgroundColor: platform.color,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="calendar-sync"
          size={size * 0.52}
          color="#FFFFFF"
        />
      </View>
    );
  };

  // --------------------------------------------------
  // Render assigned cleaners
  // --------------------------------------------------

  const renderAssignedCleaners = calendar => {
    const assignedIds = Array.isArray(
      calendar.assigned_cleaners
    )
      ? calendar.assigned_cleaners
      : [];

    if (assignedIds.length === 0) {
      return (
        <Text style={styles.detailValueMuted}>
          {tSafe(
            'no_assigned_cleaners',
            'None assigned'
          )}
        </Text>
      );
    }

    const assigned = assignedIds
      .map(id =>
        cleaners.find(
          cleaner =>
            String(cleaner?._id) === String(id)
        )
      )
      .filter(Boolean);

    if (assigned.length === 0) {
      return (
        <Text style={styles.detailValue}>
          {assignedIds.length}{' '}
          {tSafe('cleaners', 'cleaners')}
        </Text>
      );
    }

    return (
      <View style={styles.cleanerAvatarRow}>
        {assigned.slice(0, 3).map((cleaner, index) => {
          const firstName = cleaner.firstname || 'C';

          return cleaner.avatarUrl ? (
            <Avatar.Image
              key={cleaner._id || index}
              size={30}
              source={{ uri: cleaner.avatarUrl }}
              style={styles.cleanerAvatar}
            />
          ) : (
            <Avatar.Text
              key={cleaner._id || index}
              size={30}
              label={firstName.charAt(0).toUpperCase()}
              style={[
                styles.cleanerAvatar,
                { backgroundColor: theme.brand.primary },
              ]}
              labelStyle={styles.cleanerAvatarLabel}
            />
          );
        })}

        {assigned.length > 3 && (
          <View style={styles.extraCleaners}>
            <Text style={styles.extraCleanersText}>
              +{assigned.length - 3}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // --------------------------------------------------
  // Render calendar details
  // --------------------------------------------------

  const renderCalendarDetails = calendar => {
    const checklistName =
      calendar.selectedChecklist?.name ||
      calendar.selectedChecklist?.title ||
      calendar.checklistName ||
      (typeof calendar.selectedChecklist === 'string'
        ? calendar.selectedChecklist
        : null);

    const lastSynced = formatDateTime(
      calendar.last_synced
    );

    return (
      <View style={styles.expandedDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            {tSafe('platform_label', 'Platform')}
          </Text>

          <Text style={styles.detailValue}>
            {getPlatformName(calendar.platform)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            {tSafe(
              'synchronization_label',
              'Synchronization'
            )}
          </Text>

          <View style={styles.detailStatus}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    calendar.enabled === false
                      ? theme.text.muted
                      : theme.status.success,
                },
              ]}
            />

            <Text
              style={[
                styles.detailValue,
                {
                  color:
                    calendar.enabled === false
                      ? theme.text.secondary
                      : theme.status.success,
                },
              ]}
            >
              {calendar.enabled === false
                ? tSafe('sync_paused', 'Paused')
                : tSafe('sync_enabled', 'Enabled')}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            {tSafe('calendar_url', 'Calendar URL')}
          </Text>

          <Text
            style={styles.urlValue}
            numberOfLines={2}
          >
            {getCalendarUrl(calendar) ||
              tSafe('no_url_provided', 'No URL provided')}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            {tSafe(
              'last_synchronized',
              'Last synchronized'
            )}
          </Text>

          <Text style={styles.detailValue}>
            {lastSynced ||
              tSafe(
                'sync_information_unavailable',
                'Not available'
              )}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            {tSafe(
              'assigned_cleaners',
              'Assigned cleaners'
            )}
          </Text>

          {renderAssignedCleaners(calendar)}
        </View>

        {checklistName && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {tSafe('checklist', 'Checklist')}
            </Text>

            <Text style={styles.detailValue}>
              {checklistName}
            </Text>
          </View>
        )}

        <View style={styles.expandedActions}>
          <TouchableOpacity
            style={styles.editConnectionButton}
            onPress={() =>
              handlePlatformPress(calendar.platform)
            }
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={17}
              color={theme.brand.primary}
            />

            <Text style={styles.editConnectionText}>
              {tSafe('edit_connection', 'Edit connection')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // --------------------------------------------------
  // Render one booking platform card
  // --------------------------------------------------

  const renderPlatformCard = (platform, index) => {
    const calendar = getCalendarForPlatform(platform.id);
    const connected = Boolean(calendar);

    const calendarId = calendar?._id;

    const isSyncing =
      calendarId && syncingIds.includes(calendarId);

    const expanded =
      calendarId &&
      isCalendarExpanded(calendarId);

    const lastSynced = formatDate(
      calendar?.last_synced
    );

    return (
      <Animatable.View
        key={platform.id}
        animation="fadeInUp"
        delay={index * 60}
        duration={350}
        style={styles.platformCard}
      >
        {/* Main platform row */}
        <View style={styles.platformMainRow}>
          <View style={styles.platformIconWrapper}>
            {renderPlatformIcon(platform)}
          </View>

          <View style={styles.platformMainInfo}>
            <Text style={styles.platformName}>
              {platform.name}
            </Text>

            <Text style={styles.platformDescription}>
              {platform.description}
            </Text>

            <View
              style={[
                styles.connectionBadge,
                connected
                  ? styles.connectedBadge
                  : styles.disconnectedBadge,
              ]}
            >
              <MaterialIcons
                name={
                  connected
                    ? 'check-circle'
                    : 'radio-button-unchecked'
                }
                size={15}
                color={
                  connected
                    ? theme.status.success
                    : theme.text.secondary
                }
              />

              <Text
                style={[
                  styles.connectionBadgeText,
                  {
                    color: connected
                      ? theme.status.success
                      : theme.text.secondary,
                  },
                ]}
              >
                {connected
                  ? tSafe('connected', 'Connected')
                  : tSafe('not_connected', 'Not connected')}
              </Text>
            </View>
          </View>

          <View style={styles.platformAction}>
            {connected ? (
              isSyncing ? (
                <ActivityIndicator
                  size="small"
                  color={theme.brand.primary}
                />
              ) : (
                <Switch
                  value={calendar.enabled !== false}
                  onValueChange={() => toggleSync(calendar)}
                  trackColor={{
                    false: theme.border.default,
                    true: theme.status.success,
                  }}
                  thumbColor={theme.button.primaryText}
                  accessibilityLabel={
                    calendar.enabled === false
                      ? tSafe(
                          'enable_calendar_sync',
                          `Enable ${platform.name} sync`
                        )
                      : tSafe(
                          'disable_calendar_sync',
                          `Disable ${platform.name} sync`
                        )
                  }
                />
              )
            ) : (
              <TouchableOpacity
                style={styles.connectButton}
                onPress={() =>
                  handlePlatformPress(platform.id)
                }
                activeOpacity={0.8}
              >
                <Text style={styles.connectButtonText}>
                  {tSafe('connect', 'Connect')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Connected calendar information */}
        {connected && (
          <>
            <View style={styles.platformDivider} />

            <View style={styles.platformMetadata}>
              <View style={styles.metadataItem}>
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={19}
                  color={theme.icon.default}
                />

                <View style={styles.metadataTextContainer}>
                  <Text style={styles.metadataLabel}>
                    {tSafe('last_synced', 'Last synced')}
                  </Text>

                  <Text style={styles.metadataValue}>
                    {lastSynced ||
                      tSafe('not_available', 'Not available')}
                  </Text>
                </View>
              </View>

              <View style={styles.metadataItem}>
                <MaterialCommunityIcons
                  name="account-group-outline"
                  size={19}
                  color={theme.icon.default}
                />

                <View style={styles.metadataTextContainer}>
                  <Text style={styles.metadataLabel}>
                    {tSafe(
                      'assigned_cleaners',
                      'Assigned cleaners'
                    )}
                  </Text>

                  <Text style={styles.metadataValue}>
                    {Array.isArray(
                      calendar.assigned_cleaners
                    )
                      ? calendar.assigned_cleaners.length
                      : 0}{' '}
                    {tSafe('cleaners', 'cleaners')}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.detailsToggle}
                onPress={() =>
                  toggleCalendarDetails(calendarId)
                }
                activeOpacity={0.7}
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name={
                    expanded
                      ? 'chevron-up'
                      : 'chevron-down'
                  }
                  size={23}
                  color={theme.brand.primary}
                />
              </TouchableOpacity>
            </View>

            {expanded &&
              renderCalendarDetails(calendar)}
          </>
        )}
      </Animatable.View>
    );
  };

  // --------------------------------------------------
  // Missing property safeguard
  // --------------------------------------------------

  if (!property || !propertyId) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="home-alert-outline"
          size={48}
          color={theme.text.secondary}
        />

        <Text style={styles.emptyTitle}>
          {tSafe('property_not_found', 'Property not found')}
        </Text>

        <Text style={styles.emptyDescription}>
          {tSafe(
            'property_not_found_desc',
            'We could not load this property.'
          )}
        </Text>

        <TouchableOpacity
          style={styles.connectButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.connectButtonText}>
            {tSafe('go_back', 'Go back')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --------------------------------------------------
  // Main mobile screen
  // --------------------------------------------------

  return (
    <View style={styles.screen}>
      <StatusBar
        backgroundColor={theme.background.default}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.brand.primary}
            colors={[theme.brand.primary]}
            progressBackgroundColor={theme.surface.default}
          />
        }
      >
        {/* =========================================
            1. PROPERTY SUMMARY
        ========================================= */}

        <Animatable.View
          animation="fadeInUp"
          duration={400}
          style={styles.propertyCard}
        >
          <View style={styles.propertyHeader}>
            <View style={styles.propertyIcon}>
              <MaterialCommunityIcons
                name="home-city-outline"
                size={25}
                color={theme.brand.primary}
              />
            </View>

            <View style={styles.propertyHeading}>
              <Text style={styles.eyebrow}>
                {tSafe('your_property', 'YOUR PROPERTY')}
              </Text>

              <Text
                style={styles.propertyName}
                numberOfLines={2}
              >
                {property.apt_name ||
                  tSafe(
                    'unnamed_property',
                    'Unnamed property'
                  )}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.editPropertyButton}
              onPress={() =>
                navigation.navigate(
                  ROUTES.host_edit_apt,
                  { propertyId }
                )
              }
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="pencil-outline"
                size={19}
                color={theme.brand.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.addressRow}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={17}
              color={theme.text.secondary}
            />

            <Text style={styles.propertyAddress}>
              {property.address ||
                tSafe(
                  'address_not_available',
                  'Address not available'
                )}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.roomStats}>
            <CircleIcon
              iconName="bed-empty"
              buttonSize={26}
              radiusSise={13}
              iconSize={16}
              title={bedroomCount}
              roomSize={bedroomSize}
              type={tSafe('bedrooms', 'Bedrooms')}
            />

            <CircleIcon
              iconName="shower-head"
              buttonSize={26}
              radiusSise={13}
              iconSize={16}
              title={bathroomCount}
              roomSize={bathroomSize}
              type={tSafe('bathrooms', 'Bathrooms')}
            />

            <CircleIcon
              iconName="silverware-fork-knife"
              buttonSize={26}
              radiusSise={13}
              iconSize={16}
              title={kitchenCount}
              roomSize={kitchenSize}
              type={tSafe('kitchen', 'Kitchen')}
            />

            <CircleIcon
              iconName="seat-legroom-extra"
              buttonSize={26}
              radiusSise={13}
              iconSize={16}
              title={livingroomCount}
              roomSize={livingroomSize}
              type={tSafe('livingroom', 'Livingroom')}
            />
          </View>
        </Animatable.View>

        {/* =========================================
            2. INFORMATION BANNER
        ========================================= */}

        <Animatable.View
          animation="fadeInUp"
          delay={60}
          style={styles.infoBanner}
        >
          <View style={styles.infoIcon}>
            <MaterialCommunityIcons
              name="calendar-sync"
              size={25}
              color={theme.brand.primary}
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              {tSafe(
                'keep_calendars_in_sync',
                'Keep your calendars in sync'
              )}
            </Text>

            <Text style={styles.infoDescription}>
              {tSafe(
                'calendar_sync_explanation',
                'Connect your booking calendars to help keep reservation availability up to date.'
              )}
            </Text>
          </View>
        </Animatable.View>

        {/* =========================================
            3. CONNECTION SUMMARY
        ========================================= */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryCheckIcon}>
              <MaterialCommunityIcons
                name={
                  hasConnectedCalendars
                    ? 'calendar-check'
                    : 'calendar-plus'
                }
                size={22}
                color={theme.brand.primary}
              />
            </View>

            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>
                {hasConnectedCalendars
                  ? tSafe(
                      'calendar_connections',
                      'Calendar connections'
                    )
                  : tSafe(
                      'no_calendars_connected',
                      'No calendars connected yet'
                    )}
              </Text>

              <Text style={styles.summarySubtitle}>
                {hasConnectedCalendars
                  ? `${connectedCount} ${tSafe(
                      'connected',
                      'connected'
                    ).toLowerCase()} · ${enabledCount} ${tSafe(
                      'enabled',
                      'enabled'
                    ).toLowerCase()}`
                  : tSafe(
                      'connect_first_calendar',
                      'Connect a calendar to get started.'
                    )}
              </Text>
            </View>
          </View>

          {hasConnectedCalendars && (
            <View style={styles.summaryPlatforms}>
              {syncedCalendars.map(calendar => {
                const platform = bookingPlatforms.find(
                  item => item.id === calendar.platform
                );

                if (!platform) return null;

                return (
                  <TouchableOpacity
                    key={calendar._id || calendar.platform}
                    style={styles.summaryPlatformRow}
                    onPress={() =>
                      calendar._id &&
                      toggleCalendarDetails(calendar._id)
                    }
                    activeOpacity={0.75}
                  >
                    <View
                      style={[
                        styles.summaryPlatformDot,
                        {
                          backgroundColor:
                            calendar.enabled === false
                              ? theme.text.muted
                              : theme.status.success,
                        },
                      ]}
                    />

                    <Text style={styles.summaryPlatformName}>
                      {platform.name}
                    </Text>

                    <Text
                      style={[
                        styles.summaryPlatformStatus,
                        {
                          color:
                            calendar.enabled === false
                              ? theme.text.secondary
                              : theme.status.success,
                        },
                      ]}
                    >
                      {calendar.enabled === false
                        ? tSafe('sync_paused', 'Paused')
                        : tSafe('sync_enabled', 'Enabled')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* =========================================
            4. BOOKING PLATFORM CARDS

            There is intentionally NO separate
            "Your Connected Calendars" section.
        ========================================= */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {tSafe(
              'connect_booking_platforms',
              'Connect Booking Platforms'
            )}
          </Text>

          <Text style={styles.sectionSubtitle}>
            {tSafe(
              'connect_booking_platforms_desc',
              'Link your calendars to help synchronize bookings and availability.'
            )}
          </Text>

          {loading && syncedCalendars.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="small"
                color={theme.brand.primary}
              />

              <Text style={styles.loadingText}>
                {tSafe(
                  'loading_calendar_data',
                  'Loading calendar information...'
                )}
              </Text>
            </View>
          ) : (
            bookingPlatforms.map(renderPlatformCard)
          )}
        </View>

        {/* =========================================
            5. BENEFITS
        ========================================= */}

        <View style={styles.benefitsCard}>
          <View style={styles.benefitsHeader}>
            <View style={styles.benefitsIcon}>
              <MaterialCommunityIcons
                name="lightbulb-outline"
                size={25}
                color={theme.brand.primary}
              />
            </View>

            <View style={styles.benefitsHeading}>
              <Text style={styles.benefitsTitle}>
                {tSafe(
                  'why_connect_calendars',
                  'Why connect your calendars?'
                )}
              </Text>

              <Text style={styles.benefitsDescription}>
                {tSafe(
                  'calendar_benefits_intro',
                  'Save time and keep your cleaning schedule organized.'
                )}
              </Text>
            </View>
          </View>

          <View style={styles.benefitRow}>
            <View style={styles.benefitIcon}>
              <MaterialCommunityIcons
                name="sync"
                size={21}
                color={theme.brand.primary}
              />
            </View>

            <View style={styles.benefitTextContainer}>
              <Text style={styles.benefitTitle}>
                {tSafe('auto_sync', 'Auto-Sync')}
              </Text>

              <Text style={styles.benefitDescription}>
                {tSafe(
                  'auto_sync_desc',
                  'Reduce manual calendar updates.'
                )}
              </Text>
            </View>
          </View>

          <View style={styles.benefitRow}>
            <View style={styles.benefitIcon}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={21}
                color={theme.brand.primary}
              />
            </View>

            <View style={styles.benefitTextContainer}>
              <Text style={styles.benefitTitle}>
                {tSafe(
                  'no_overbooking',
                  'Avoid scheduling conflicts'
                )}
              </Text>

              <Text style={styles.benefitDescription}>
                {tSafe(
                  'no_overbooking_desc',
                  'Help prevent overlapping bookings.'
                )}
              </Text>
            </View>
          </View>

          <View style={styles.benefitRow}>
            <View style={styles.benefitIcon}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={21}
                color={theme.brand.primary}
              />
            </View>

            <View style={styles.benefitTextContainer}>
              <Text style={styles.benefitTitle}>
                {tSafe('save_time', 'Save Time')}
              </Text>

              <Text style={styles.benefitDescription}>
                {tSafe(
                  'save_time_desc',
                  'Spend less time managing reservations.'
                )}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* =========================================
          EXISTING CALENDAR MODAL
      ========================================= */}

      <AddICalModal
        visible={modalVisible}
        onClose={closeCalendarModal}
        onSave={handleSaveSync}
        cleaners={linkedCleaners}
        aptId={propertyId}
        preselectedPlatform={selectedPlatform}
        existingCalendar={selectedCalendar}
        checklists={checklists}
        property={property}
      />
    </View>
  );
}

// ==================================================
// Theme-aware mobile styles
// Uses the existing Freshsweeper ThemeProvider.
// ==================================================

const createStyles = theme =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    container: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    contentContainer: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 28,
    },

    // Property summary

    propertyCard: {
      backgroundColor: theme.card.background,
      borderRadius: 22,
      padding: 17,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: theme.card.border,
      shadowColor: theme.shadow.color,
      shadowOpacity: theme.shadow.opacity,
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 9,
      elevation: 2,
    },

    propertyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    propertyIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor: theme.brand.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    propertyHeading: {
      flex: 1,
      minWidth: 0,
    },

    eyebrow: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
      color: theme.text.secondary,
      marginBottom: 4,
    },

    propertyName: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '800',
      color: theme.text.primary,
    },

    editPropertyButton: {
      width: 39,
      height: 39,
      borderRadius: 13,
      backgroundColor: theme.brand.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },

    addressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      marginBottom: 15,
    },

    propertyAddress: {
      flex: 1,
      fontSize: 13,
      lineHeight: 19,
      color: theme.text.secondary,
      marginLeft: 6,
    },

    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.divider,
      marginBottom: 16,
    },

    roomStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },

    // Information banner

    infoBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 15,
      borderRadius: 18,
      backgroundColor: theme.brand.primaryLight,
      marginBottom: 14,
    },

    infoIcon: {
      width: 43,
      height: 43,
      borderRadius: 15,
      backgroundColor: theme.surface.default,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    infoContent: {
      flex: 1,
    },

    infoTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.text.primary,
      marginBottom: 5,
    },

    infoDescription: {
      fontSize: 12,
      lineHeight: 18,
      color: theme.text.secondary,
    },

    // Connection summary

    summaryCard: {
      backgroundColor: theme.card.background,
      borderWidth: 1,
      borderColor: theme.card.border,
      borderRadius: 20,
      padding: 16,
      marginBottom: 25,
    },

    summaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    summaryCheckIcon: {
      width: 43,
      height: 43,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.brand.primaryLight,
      marginRight: 12,
    },

    summaryContent: {
      flex: 1,
    },

    summaryTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.text.primary,
      marginBottom: 4,
    },

    summarySubtitle: {
      fontSize: 12,
      lineHeight: 18,
      color: theme.text.secondary,
    },

    summaryPlatforms: {
      marginTop: 13,
      paddingTop: 9,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.divider,
    },

    summaryPlatformRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },

    summaryPlatformDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 9,
    },

    summaryPlatformName: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: theme.text.primary,
    },

    summaryPlatformStatus: {
      fontSize: 12,
      fontWeight: '700',
    },

    // Booking platforms

    section: {
      marginBottom: 25,
    },

    sectionTitle: {
      fontSize: 21,
      fontWeight: '800',
      color: theme.text.primary,
      marginBottom: 6,
    },

    sectionSubtitle: {
      fontSize: 13,
      lineHeight: 19,
      color: theme.text.secondary,
      marginBottom: 16,
    },

    platformCard: {
      backgroundColor: theme.card.background,
      borderRadius: 21,
      borderWidth: 1,
      borderColor: theme.card.border,
      padding: 14,
      marginBottom: 12,
      shadowColor: theme.shadow.color,
      shadowOpacity: theme.shadow.opacity,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
      elevation: 2,
    },

    platformMainRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },

    platformIconWrapper: {
      marginRight: 12,
    },

    platformLogo: {
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },

    platformMainInfo: {
      flex: 1,
      minWidth: 0,
    },

    platformName: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.text.primary,
      marginTop: 1,
      marginBottom: 5,
    },

    platformDescription: {
      fontSize: 12,
      lineHeight: 17,
      color: theme.text.secondary,
      marginBottom: 8,
    },

    connectionBadge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 12,
    },

    connectedBadge: {
      backgroundColor: theme.status.successBackground,
    },

    disconnectedBadge: {
      backgroundColor: theme.surface.elevated,
    },

    connectionBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      marginLeft: 5,
    },

    platformAction: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      marginLeft: 5,
      minWidth: 54,
      minHeight: 40,
    },

    connectButton: {
      backgroundColor: theme.button.primaryBackground,
      minWidth: 78,
      paddingHorizontal: 13,
      paddingVertical: 10,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },

    connectButtonText: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.button.primaryText,
    },

    platformDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.divider,
      marginTop: 14,
      marginBottom: 13,
    },

    platformMetadata: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    metadataItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      minWidth: 0,
      paddingRight: 5,
    },

    metadataTextContainer: {
      flex: 1,
      minWidth: 0,
      marginLeft: 7,
    },

    metadataLabel: {
      fontSize: 10,
      color: theme.text.secondary,
      marginBottom: 4,
    },

    metadataValue: {
      fontSize: 11,
      lineHeight: 15,
      fontWeight: '600',
      color: theme.text.primary,
    },

    detailsToggle: {
      width: 31,
      height: 34,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 3,
    },

    // Expanded connection details

    expandedDetails: {
      marginTop: 15,
      padding: 12,
      borderRadius: 15,
      backgroundColor: theme.surface.elevated,
    },

    detailRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 12,
    },

    detailLabel: {
      flex: 0.85,
      fontSize: 11,
      lineHeight: 17,
      color: theme.text.secondary,
      marginRight: 8,
    },

    detailValue: {
      flex: 1.15,
      fontSize: 11,
      lineHeight: 17,
      fontWeight: '600',
      color: theme.text.primary,
      textAlign: 'right',
    },

    detailValueMuted: {
      flex: 1.15,
      fontSize: 11,
      color: theme.text.secondary,
      textAlign: 'right',
    },

    urlValue: {
      flex: 1.15,
      fontSize: 10,
      lineHeight: 15,
      color: theme.brand.primary,
      textAlign: 'right',
    },

    detailStatus: {
      flex: 1.15,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },

    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      marginRight: 6,
    },

    cleanerAvatarRow: {
      flex: 1.15,
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },

    cleanerAvatar: {
      marginLeft: -4,
      borderWidth: 1,
      borderColor: theme.card.background,
    },

    cleanerAvatarLabel: {
      color: theme.button.primaryText,
      fontSize: 11,
    },

    extraCleaners: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.brand.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 3,
    },

    extraCleanersText: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.brand.primary,
    },

    expandedActions: {
      marginTop: 2,
      paddingTop: 11,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.divider,
    },

    editConnectionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.brand.primary,
      borderRadius: 12,
      paddingVertical: 11,
      paddingHorizontal: 12,
    },

    editConnectionText: {
      color: theme.brand.primary,
      fontSize: 12,
      fontWeight: '800',
      marginLeft: 7,
    },

    // Benefits

    benefitsCard: {
      backgroundColor: theme.card.background,
      borderRadius: 22,
      padding: 17,
      borderWidth: 1,
      borderColor: theme.card.border,
    },

    benefitsHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 17,
    },

    benefitsIcon: {
      width: 44,
      height: 44,
      borderRadius: 15,
      backgroundColor: theme.brand.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    benefitsHeading: {
      flex: 1,
    },

    benefitsTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.text.primary,
      marginBottom: 5,
    },

    benefitsDescription: {
      fontSize: 12,
      lineHeight: 18,
      color: theme.text.secondary,
    },

    benefitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.divider,
    },

    benefitIcon: {
      width: 39,
      height: 39,
      borderRadius: 13,
      backgroundColor: theme.brand.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    benefitTextContainer: {
      flex: 1,
    },

    benefitTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.text.primary,
      marginBottom: 3,
    },

    benefitDescription: {
      fontSize: 12,
      lineHeight: 17,
      color: theme.text.secondary,
    },

    // Loading

    loadingContainer: {
      paddingVertical: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },

    loadingText: {
      fontSize: 12,
      color: theme.text.secondary,
      marginTop: 10,
    },

    bottomSpacing: {
      height: 10,
    },

    // Missing property

    emptyContainer: {
      flex: 1,
      backgroundColor: theme.background.default,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 28,
    },

    emptyTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.text.primary,
      marginTop: 16,
      marginBottom: 8,
      textAlign: 'center',
    },

    emptyDescription: {
      fontSize: 13,
      lineHeight: 20,
      color: theme.text.secondary,
      textAlign: 'center',
      marginBottom: 22,
    },
  });