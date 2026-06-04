// import React, { useState, useEffect, useLayoutEffect, useContext, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   RefreshControl,
//   TouchableOpacity,
//   Image,
//   Alert,
//   FlatList,
//   ActivityIndicator,
//   Switch,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { IconButton, Avatar, Divider, Chip } from 'react-native-paper';
// import { MaterialCommunityIcons, AntDesign, MaterialIcons } from '@expo/vector-icons';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import * as Animatable from 'react-native-animatable';
// import moment from 'moment';

// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';
// import CircleIcon from '../../components/shared/CircleIcon';
// import AddICalModal from '../../components/host/AddICalModal';
// import CleanerManagementModal from '../../components/cleaner/CleanerManagementModal';

// import userService from '../../services/connection/userService';
// import { AuthContext } from '../../context/AuthContext';
// import { tSafe } from '../../utils/tSafe';
// const FreshSweeperLogo = require('../../assets/notification_icon.png');

// export default function PropertyDashboard({ route }) {
//   const { property } = route.params;
//   const { currentUserId } = useContext(AuthContext);
//   const navigation = useNavigation();

//   const [refreshing, setRefreshing] = useState(false);
//   const [linkedCleaners, setLinkedCleaners] = useState([]);
//   const [checklists, setChecklists] = useState([]);
//   const [syncedCalendars, setSyncedCalendars] = useState([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedCalendar, setSelectedCalendar] = useState(null);
//   const [selectedPlatform, setSelectedPlatform] = useState(null);
//   const [loadingCleaners, setLoadingCleaners] = useState(false);
//   const [loadingChecklists, setLoadingChecklists] = useState(false);
//   const [loadingInvites, setLoadingInvites] = useState(false);

//   // State for cleaner management modal
//   const [cleanerModalVisible, setCleanerModalVisible] = useState(false);
//   const [platformCleaners, setPlatformCleaners] = useState([]);
//   const [preferredCleaners, setPreferredCleaners] = useState([]);
//   const [invitedCleaners, setInvitedCleaners] = useState([]);

//   // State for pending invites (from cleaner_invites_collection)
//   const [pendingInvites, setPendingInvites] = useState([]);

//   // Room details
//   const bedroomCount = property?.roomDetails?.find(r => r.type === "Bedroom")?.number || 0;
//   const bathroomCount = property?.roomDetails?.find(r => r.type === "Bathroom")?.number || 0;
//   const kitchen = property?.roomDetails?.find(r => r.type === "Kitchen")?.number || 0;
//   const livingroomCount = property?.roomDetails?.find(r => r.type === "Livingroom")?.number || 0;
//   const bedroomSize = property?.roomDetails?.find(r => r.type === "Bedroom")?.size || 0;
//   const bathroomSize = property?.roomDetails?.find(r => r.type === "Bathroom")?.size || 0;
//   const kitchenSize = property?.roomDetails?.find(r => r.type === "Kitchen")?.size || 0;
//   const livingroomSize = property?.roomDetails?.find(r => r.type === "Livingroom")?.size || 0;

//   // Fetch pending invites for this property (from invites collection)
//   const fetchPendingInvites = async () => {
//     setLoadingInvites(true);
//     try {
//       const response = await userService.getPropertyInvites(property._id);
//       console.log('Pending invites response:', response);
      
//       if (response.data?.data?.invites) {
//         const invites = response.data.data.invites;
//         const pending = invites.filter(invite => invite.status === 'pending');
//         setPendingInvites(pending);
//         console.log('Pending invites count:', pending.length);
//       } else {
//         setPendingInvites([]);
//       }
//     } catch (error) {
//       console.error('Error fetching pending invites:', error);
//       setPendingInvites([]);
//     } finally {
//       setLoadingInvites(false);
//     }
//   };

//   // Fetch linked cleaners from property.preferredCleaners (existing method)
//   const fetchLinkedCleaners = async () => {
//     if (!property.preferredCleaners?.length) {
//       setLinkedCleaners([]);
//       return;
//     }
//     setLoadingCleaners(true);
//     try {
//       const cleanerIds = property.preferredCleaners.map(pc => pc.id);
//       const users = await Promise.all(
//         cleanerIds.map(id => userService.getUser(id).catch(() => null))
//       );
//       const validCleaners = users
//         .map(res => res?.data)
//         .filter(c => c && c._id);
//       setLinkedCleaners(validCleaners);
//     } catch (error) {
//       console.error('Error fetching linked cleaners:', error);
//     } finally {
//       setLoadingCleaners(false);
//     }
//   };

//   // Fetch checklists
//   const fetchChecklists = async () => {
//     if (!property.checklists?.length) {
//       setChecklists([]);
//       return;
//     }
//     setLoadingChecklists(true);
//     try {
//       const response = await userService.getCustomChecklistsByProperty(property.checklists);
//       setChecklists(response.data.data || []);
//     } catch (error) {
//       console.error('Error fetching checklists:', error);
//     } finally {
//       setLoadingChecklists(false);
//     }
//   };

//   // Fetch synced calendars
//   const fetchSyncedCalendars = async () => {
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

//   // Fetch platform cleaners near the property
//   const fetchPlatformCleanersNearby = async () => {
//     if (!property.latitude || !property.longitude) return;
//     try {
//       const response = await userService.getPlatformCleaners({
//         latitude: property.latitude,
//         longitude: property.longitude,
//         radius: 100,
//       });
//       setPlatformCleaners(response.data || []);
//     } catch (error) {
//       console.error('Error fetching platform cleaners:', error);
//     }
//   };

//   // Initialize local cleaner state from property
//   const initCleanerState = () => {
//     setPreferredCleaners(property.preferredCleaners || []);
//     setInvitedCleaners(property.invitedCleaners || []);
//   };

//   // Save changes to property cleaners
//   const saveCleanersToProperty = async () => {
//     try {
//       await userService.updatePropertyCleaners(property._id, {
//         preferredCleaners,
//         invitedCleaners,
//       });
//       const updatedProperty = await userService.getApartment(property._id);
//       await fetchLinkedCleaners();
//       Alert.alert(tSafe('success_title', 'Success'), tSafe('cleaners_updated', 'Cleaners updated successfully'));
//     } catch (error) {
//       console.error('Error updating property cleaners:', error);
//       Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_update_cleaners', 'Failed to update cleaners'));
//     }
//   };

//   const fetchAll = async () => {
//     await Promise.all([
//       fetchLinkedCleaners(),
//       fetchPendingInvites(),
//       fetchChecklists(),
//       fetchSyncedCalendars(),
//       fetchPlatformCleanersNearby(),
//     ]);
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchAll();
//     initCleanerState();
//     setRefreshing(false);
//   };

//   useEffect(() => {
//     fetchAll();
//     initCleanerState();
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       // Always refresh when the screen comes into focus
//       fetchAll();
//       initCleanerState();
     
//       // Clear any refresh params
//       if (route.params?.refresh) {
//         navigation.setParams({ refresh: undefined, propertyId: undefined, timestamp: undefined });
//       }
//     }, [property._id])
//   );

//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerRight: () => null,
//     });
//   }, [navigation]);

//   // Handlers
//   const handleEditProperty = () => {
//     navigation.navigate(ROUTES.host_edit_apt, { propertyId: property._id });
//   };

//   const handleAddCleaner = () => {
//     navigation.navigate(ROUTES.host_invite_cleaners, { 
//       property,
//       hostId: currentUserId,
//     });
//   };

//   const handleAddChecklist = () => {
//     navigation.navigate(ROUTES.host_create_checklist, { propertyId: property._id });
//   };

//   const handleLinkCalendar = () => {
//     navigation.navigate(ROUTES.host_link_icalendar, { 
//       property,
//       hostId: currentUserId,
//     });
//   };

//   const handleAddCalendar = () => {
//     setSelectedCalendar(null);
//     setSelectedPlatform(null);
//     setModalVisible(true);
//   };

//   const handleEditCalendar = (calendar) => {
//     setSelectedCalendar(calendar);
//     setSelectedPlatform(calendar.platform);
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
//       await fetchSyncedCalendars();
//       Alert.alert(tSafe('success_title', 'Success'), tSafe('calendar_sync_saved', 'Calendar sync saved successfully'));
//     } catch (error) {
//       console.error('Error saving calendar sync:', error);
//       Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_save_calendar', 'Failed to save calendar sync'));
//     }
//   };

//   const toggleSync = async (calendar) => {
//     try {
//       await userService.updateSyncCalendar(calendar._id, { enabled: !calendar.enabled });
//       await fetchSyncedCalendars();
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

//   // Renderers
//   const renderCleaner = ({ item }) => (
//     <View style={styles.cleanerItem}>
//       <Avatar.Image
//         size={40}
//         source={{ uri: item.avatar || 'https://via.placeholder.com/40' }}
//       />
//       <View style={styles.cleanerInfo}>
//         <Text style={styles.cleanerName}>{item.firstname} {item.lastname}</Text>
//         <Text style={styles.cleanerContact}>{item.email}</Text>
//       </View>
//       <TouchableOpacity
//         style={styles.unlinkButton}
//         onPress={() => {
//           Alert.alert(
//             tSafe('unlink_cleaner_title', 'Unlink Cleaner'),
//             tSafe('unlink_cleaner_confirm', 'Remove {name} from this property?', { name: item.firstname }),
//             [
//               { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
//               {
//                 text: tSafe('unlink', 'Unlink'),
//                 style: 'destructive',
//                 onPress: async () => {
//                   try {
//                     await userService.unlinkCleaner({ propertyId: property._id, cleanerId: item._id });
//                     await fetchLinkedCleaners();
//                     setPreferredCleaners(prev => prev.filter(pc => pc.id !== item._id));
//                   } catch (err) {
//                     Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_unlink', 'Failed to unlink cleaner'));
//                   }
//                 },
//               },
//             ]
//           );
//         }}
//       >
//         <MaterialIcons name="link-off" size={20} color={COLORS.error} />
//       </TouchableOpacity>
//     </View>
//   );

//   const renderChecklist = ({ item }) => (
//     <TouchableOpacity
//       style={styles.checklistItem}
//       onPress={() => navigation.navigate(ROUTES.host_create_checklist, { checklist: item })}
//     >
//       <View style={styles.checklistHeader}>
//         <MaterialCommunityIcons name="clipboard-list-outline" size={24} color={COLORS.primary} />
//         <Text style={styles.checklistName} numberOfLines={1}>
//           {item.checklistName || tSafe('cleaning_checklist', 'Cleaning Checklist')}
//         </Text>
//       </View>
//       <View style={styles.checklistMeta}>
//         <Text style={styles.checklistMetaText}>⏱️ {item.totalTime} {tSafe('minutes_abbr', 'min')}</Text>
//         <Text style={styles.checklistMetaText}>💰 ${item.totalFee?.toFixed(2)}</Text>
//       </View>
//       <MaterialIcons name="chevron-right" size={20} color={COLORS.gray} style={styles.checklistArrow} />
//     </TouchableOpacity>
//   );

//   const renderCalendar = ({ item }) => {
//     const platformName = getPlatformName(item.platform);
//     return (
//       <View style={styles.calendarItem}>
//         <View style={styles.calendarInfo}>
//           <Text style={styles.calendarName}>{platformName}</Text>
//           <Text style={styles.calendarUrl} numberOfLines={1}>
//             {item.ical_url || item.calendar_url || tSafe('no_url_provided', 'No URL provided')}
//           </Text>
//           {item.last_synced && (
//             <Text style={styles.calendarDate}>
//               {tSafe('last_synced', 'Last synced:')} {new Date(item.last_synced).toLocaleDateString()}
//             </Text>
//           )}
//         </View>
//         <Switch
//           value={item.enabled !== false}
//           onValueChange={() => toggleSync(item)}
//           trackColor={{ false: COLORS.light_gray_1, true: COLORS.primary }}
//           thumbColor={COLORS.white}
//         />
//         <TouchableOpacity onPress={() => handleEditCalendar(item)} style={styles.editCalendarButton}>
//           <MaterialIcons name="edit" size={20} color={COLORS.gray} />
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   return (
//     <>
//       <ScrollView
//         style={styles.container}
//         contentContainerStyle={styles.contentContainer}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//       >
//         {/* Property Card */}
//         <Animatable.View animation="fadeInUp" duration={500} style={styles.card}>
//           <View style={styles.cardHeader}>
//             <Text style={styles.cardTitle}>{tSafe('property_details', 'Property Details')}</Text>
//             <TouchableOpacity onPress={handleEditProperty} style={styles.cardButton}>
//               <MaterialIcons name="edit" size={20} color={COLORS.primary} />
//             </TouchableOpacity>
//           </View>
//           <Divider style={styles.divider} />
//           <View style={styles.propertyContent}>
//             <Text style={styles.propertyName}>{property.apt_name}</Text>
//             <View style={styles.addressRow}>
//               <MaterialCommunityIcons name="map-marker-outline" size={16} color={COLORS.gray} />
//               <Text style={styles.propertyAddress}>{property.address}</Text>
//             </View>
//             <View style={styles.roomStats}>
//               <CircleIcon
//                 iconName="bed-empty"
//                 buttonSize={26}
//                 radiusSise={13}
//                 iconSize={16}
//                 title={bedroomCount}
//                 roomSize={bedroomSize}
//                 type={tSafe('bedrooms', 'Bedrooms')}
//               />
//               <CircleIcon
//                 iconName="shower-head"
//                 buttonSize={26}
//                 radiusSise={13}
//                 iconSize={16}
//                 title={bathroomCount}
//                 roomSize={bathroomSize}
//                 type={tSafe('bathrooms', 'Bathrooms')}
//               />
//               <CircleIcon
//                 iconName="silverware-fork-knife"
//                 buttonSize={26}
//                 radiusSise={13}
//                 iconSize={16}
//                 title={kitchen}
//                 roomSize={kitchenSize}
//                 type={tSafe('kitchen', 'Kitchen')}
//               />
//               <CircleIcon
//                 iconName="seat-legroom-extra"
//                 buttonSize={26}
//                 radiusSise={13}
//                 iconSize={16}
//                 title={livingroomCount}
//                 roomSize={livingroomSize}
//                 type={tSafe('livingroom', 'Livingroom')}
//               />
//             </View>
//           </View>
//         </Animatable.View>

//         {/* Pending Invites Section */}
//         {loadingInvites ? (
//           <Animatable.View animation="fadeInUp" delay={100} style={styles.card}>
//             <ActivityIndicator size="small" color={COLORS.primary} />
//           </Animatable.View>
//         ) : pendingInvites.length > 0 ? (
//           <Animatable.View animation="fadeInUp" delay={100} style={styles.card}>
//             <View style={styles.cardHeader}>
//               <MaterialCommunityIcons name="clock-outline" size={22} color={COLORS.warning} />
//               <Text style={styles.cardTitle}>{tSafe('pending_cleaner_invites', 'Pending Cleaner Invites')}</Text>
//               <Text style={styles.pendingCount}>{pendingInvites.length}</Text>
//             </View>
//             <View style={styles.pendingSubtitleContainer}>
//               <Text style={styles.pendingSubtitle}>
//                 {tSafe('pending_invites_subtitle_short', 'Awaiting response from invited cleaners. They will appear in "Linked Cleaners" once they accept.')}
//               </Text>
//             </View>
//             <Divider style={styles.divider} />
//             {pendingInvites.map((invite, index) => {
//               // Calculate expiration
//               const expiresAt = moment(invite.expires_at);
//               const now = moment();
//               const isExpired = now.isAfter(expiresAt);
//               const daysLeft = expiresAt.diff(now, 'days');
//               const hoursLeft = expiresAt.diff(now, 'hours');
              
//               let expiryText = '';
//               let expiryColor = COLORS.warning;
              
//               if (isExpired) {
//                 expiryText = tSafe('expired', 'Expired');
//                 expiryColor = COLORS.error;
//               } else if (daysLeft > 0) {
//                 const daysWord = daysLeft === 1 ? tSafe('day', 'day') : tSafe('days', 'days');
//                 expiryText = `${tSafe('expires_in', 'Expires in')} ${daysLeft} ${daysWord}`;
//                 expiryColor = daysLeft <= 3 ? COLORS.warning : COLORS.gray;
//               } else if (hoursLeft > 0) {
//                 const hoursWord = hoursLeft === 1 ? tSafe('hour', 'hour') : tSafe('hours', 'hours');
//                 expiryText = `${tSafe('expires_in', 'Expires in')} ${hoursLeft} ${hoursWord}`;
//                 expiryColor = COLORS.warning;
//               } else {
//                 expiryText = tSafe('expires_soon', 'Expires soon');
//                 expiryColor = COLORS.error;
//               }
              
//               // Determine icon based on invite type
//               const isPlatformInvite = invite.type === 'platform';
//               const iconName = isPlatformInvite ? "account-circle" : "email-outline";
//               const iconColor = isPlatformInvite ? COLORS.primary : COLORS.warning;
              
//               return (
//                 <View key={invite._id} style={styles.pendingInviteItem}>
                  
//                   <View style={styles.pendingInviteAvatar}>
//                     {isPlatformInvite ? (
//                       <Avatar.Image
//                         size={30}
//                         source={FreshSweeperLogo}
//                         style={{ backgroundColor: COLORS.warning, marginLeft: 5 }}
//                       />
//                     ) : invite.type === 'phone' ? (
//                       <Avatar.Icon
//                         size={40}
//                         icon="phone-outline"
//                         style={{ backgroundColor: COLORS.warning + '20' }}
//                         color={COLORS.warning}
//                       />
//                     ) : (
//                       <Avatar.Icon
//                         size={40}
//                         icon="email-outline"
//                         style={{ backgroundColor: COLORS.warning + '20' }}
//                         color={COLORS.warning}
//                       />
//                     )}
//                   </View>
//                   <View style={styles.pendingInviteInfo}>
//                     <Text style={styles.pendingInviteName}>
//                     {isPlatformInvite
//                       ? invite.firstname && invite.lastname
//                         ? `${invite.firstname} ${invite.lastname.charAt(0)}.`
//                         : tSafe('platform_cleaner', 'Platform Cleaner')
//                       : invite.type === 'phone'
//                         ? invite.phone || tSafe('invited_cleaner', 'Invited Cleaner')
//                         : invite.email || tSafe('invited_cleaner', 'Invited Cleaner')
//                     }
//                     </Text>
//                     <Text style={styles.pendingInviteDetail}>
//                       {/* {tSafe('invited_via', 'Invited via')} {isPlatformInvite ? tSafe('platform', 'Platform') : tSafe('email', 'Email')} */}
//                       {tSafe('invited_via', 'Invited via')}{' '}
//                         {isPlatformInvite
//                           ? tSafe('platform', 'Platform')
//                           : invite.type === 'phone'
//                             ? tSafe('phone', 'Phone')
//                             : tSafe('email', 'Email')}
//                     </Text>
                    
//                     <View style={styles.pendingStatusRow}>
//                       <View style={styles.pendingStatusBadge}>
//                         <MaterialCommunityIcons name="clock-outline" size={13} color="orange" />
//                         <Text style={styles.pendingStatusBadgeText}>
//                           {tSafe('pending', 'Pending')}
//                         </Text>
//                       </View>
//                       <View style={[styles.expiryContainer, isExpired && styles.expiredContainer]}>
//                         <MaterialCommunityIcons 
//                           name={isExpired ? "alert-circle-outline" : "timer-outline"} 
//                           size={12} 
//                           color={expiryColor} 
//                         />
//                         <Text style={[styles.expiryText, { color: expiryColor }]}>
//                           {expiryText}
//                         </Text>
//                       </View>
                      
//                     </View>
//                   </View>
//                   <View style={styles.pendingInviteRight}>
//                     <Text style={styles.pendingInviteDate}>
//                       {moment(invite.created_at).fromNow()}
//                     </Text>
//                   </View>
//                 </View>
//               );
//             })}
//           </Animatable.View>
//         ) : null}

//         {/* Linked Cleaners Card - Segmented Banner */}
//         <Animatable.View animation="fadeInUp" delay={200} style={styles.card}>
//           <View style={styles.cardHeader}>
//             <Text style={styles.cardTitle}>{tSafe('linked_cleaners', 'Linked Cleaners')}</Text>
//             <TouchableOpacity onPress={handleAddCleaner} style={styles.cardButton}>
//               <MaterialIcons name="add" size={20} color={COLORS.primary} />
//             </TouchableOpacity>
//           </View>
//           <Divider style={styles.divider} />
//           {loadingCleaners ? (
//             <ActivityIndicator style={styles.loader} size="small" color={COLORS.primary} />
//           ) : linkedCleaners.length === 0 ? (
//             <TouchableOpacity onPress={handleAddCleaner} activeOpacity={0.95}>
//               <View style={styles.segmentedBanner}>
//                 <View style={styles.segmentedColors}>
//                   <View style={[styles.colorSegment, { backgroundColor: '#FF6B6B' }]} />
//                   <View style={[styles.colorSegment, { backgroundColor: '#4ECDC4' }]} />
//                   <View style={[styles.colorSegment, { backgroundColor: '#45B7D1' }]} />
//                   <View style={[styles.colorSegment, { backgroundColor: '#96CEB4' }]} />
//                   <View style={[styles.colorSegment, { backgroundColor: '#FFEAA7' }]} />
//                 </View>
//                 <View style={styles.segmentedContent}>
//                   <MaterialCommunityIcons name="account-plus" size={50} color="#FF6B6B" />
//                   <Text style={styles.segmentedTitle}>
//                     {tSafe('invite_your_trusted_cleaners', 'Invite Your Trusted Cleaners')}
//                   </Text>
//                   <Text style={styles.segmentedText}>
//                     {tSafe('keep_working_with_cleaners', 'Keep working with cleaners you already know and trust')}
//                   </Text>
//                   <View style={styles.segmentedButton}>
//                     <Text style={styles.segmentedButtonText}>{tSafe('invite_cleaners', 'Invite Cleaners')}</Text>
//                   </View>
//                 </View>
//               </View>
//             </TouchableOpacity>
//           ) : (
//             <FlatList
//               data={linkedCleaners}
//               keyExtractor={(item) => item._id}
//               renderItem={renderCleaner}
//               scrollEnabled={false}
//             />
//           )}
//         </Animatable.View>

//         {/* Checklists Card - Gradient Banner */}
//         <Animatable.View animation="fadeInUp" delay={300} style={styles.card}>
//           <View style={styles.cardHeader}>
//             <Text style={styles.cardTitle}>{tSafe('cleaning_checklists', 'Cleaning Checklists')}</Text>
//             <TouchableOpacity onPress={handleAddChecklist} style={styles.cardButton}>
//               <MaterialIcons name="add" size={20} color={COLORS.primary} />
//             </TouchableOpacity>
//           </View>
//           <Divider style={styles.divider} />
//           {loadingChecklists ? (
//             <ActivityIndicator style={styles.loader} size="small" color={COLORS.primary} />
//           ) : checklists.length === 0 ? (
//             <TouchableOpacity onPress={handleAddChecklist} activeOpacity={0.95}>
//               <LinearGradient
//                 colors={['#8E2DE2', '#4A00E0']}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 1 }}
//                 style={styles.gradientBanner}
//               >
//                 <View style={styles.gradientBannerContent}>
//                   <View style={styles.gradientIconContainer}>
//                     <MaterialCommunityIcons name="clipboard-check-multiple" size={32} color="white" />
//                   </View>
//                   <Text style={styles.gradientTitle}>
//                     {tSafe('no_checklists_yet', 'No Checklists Yet')}
//                   </Text>
//                   <Text style={styles.gradientText}>
//                     {tSafe('checklist_encouragement', 'Create your first cleaning checklist to ensure nothing gets missed. Customize tasks for each room type.')}
//                   </Text>
//                   <View style={styles.gradientButton}>
//                     <Text style={styles.gradientButtonText}>{tSafe('create_checklist', 'Create Checklist')}</Text>
//                     <MaterialIcons name="arrow-forward" size={18} color="white" />
//                   </View>
//                 </View>
//               </LinearGradient>
//             </TouchableOpacity>
//           ) : (
//             <FlatList
//               data={checklists}
//               keyExtractor={(item) => item._id}
//               renderItem={renderChecklist}
//               scrollEnabled={false}
//             />
//           )}
//         </Animatable.View>

//         {/* Calendar Connections Card - Soft Blue Banner */}
//         <Animatable.View animation="fadeInUp" delay={400} style={styles.card}>
//           <View style={styles.cardHeader}>
//             <Text style={styles.cardTitle}>{tSafe('calendar_connections', 'Calendar Connections')}</Text>
//             <TouchableOpacity onPress={handleLinkCalendar} style={styles.cardButton}>
//               <MaterialIcons name="add" size={20} color={COLORS.primary} />
//             </TouchableOpacity>
//           </View>
//           <Divider style={styles.divider} />
//           {syncedCalendars.length === 0 ? (
//             <TouchableOpacity onPress={handleLinkCalendar} activeOpacity={0.95}>
//               <View style={styles.softBlueBanner}>
//                 <MaterialIcons name="calendar-today" size={44} color="#3182CE" />
//                 <Text style={styles.softBlueTitle}>
//                   {tSafe('sync_booking_calendars', 'Sync Your Booking Calendars')}
//                 </Text>
//                 <Text style={styles.softBlueText}>
//                   {tSafe('calendar_sync_description', 'Connect Airbnb, Booking.com, Vrbo, iCal, or Google Calendar to automatically sync bookings and notify cleaners of new reservations')}
//                 </Text>
                
//                 <View style={styles.platformIcons}>
//                   <View style={styles.platformIconCircle}>
//                     <MaterialCommunityIcons name="home" size={20} color="#FF5A5F" />
//                   </View>
//                   <View style={styles.platformIconCircle}>
//                     <MaterialCommunityIcons name="web" size={20} color="#003580" />
//                   </View>
//                   <View style={styles.platformIconCircle}>
//                     <MaterialCommunityIcons name="home-variant" size={20} color="#1E6F5C" />
//                   </View>
//                   <View style={styles.platformIconCircle}>
//                     <MaterialCommunityIcons name="calendar" size={20} color="#4285F4" />
//                   </View>
//                   <View style={styles.platformIconCircle}>
//                     <MaterialCommunityIcons name="google" size={20} color="#34A853" />
//                   </View>
//                 </View>

//                 <View style={styles.softBlueButton}>
//                   <Text style={styles.softBlueButtonText}>{tSafe('connect_calendar', 'Connect Calendar')}</Text>
//                   <MaterialIcons name="arrow-forward" size={18} color="#3182CE" />
//                 </View>
//               </View>
//             </TouchableOpacity>
//           ) : (
//             <FlatList
//               data={syncedCalendars}
//               keyExtractor={(item) => item._id}
//               renderItem={renderCalendar}
//               scrollEnabled={false}
//             />
//           )}
//         </Animatable.View>

//         {/* Inventory Management Card */}
//         <Animatable.View animation="fadeInUp" delay={350} style={styles.card}>
//           <TouchableOpacity
//             activeOpacity={0.7}
//             onPress={() => navigation.navigate(ROUTES.host_inventory, { propertyId: property._id })}
//           >
//             <View style={styles.cardHeader}>
//               <MaterialCommunityIcons name="package-variant" size={24} color={COLORS.primary} />
//               <Text style={styles.cardTitle}>{tSafe('inventory_management', 'Inventory Management')}</Text>
//               <MaterialIcons name="chevron-right" size={24} color={COLORS.gray} />
//             </View>
//             <Divider style={styles.divider} />
//             <View style={styles.inventoryPreview}>
//               <MaterialCommunityIcons name="clipboard-text" size={32} color={COLORS.primaryLight} />
//               <Text style={styles.inventoryPreviewText}>
//                 {tSafe('inventory_preview', 'Track supplies, set reorder levels, and manage stock for this property.')}
//               </Text>
//             </View>
//           </TouchableOpacity>
//         </Animatable.View>

//         <AddICalModal
//           visible={modalVisible}
//           onClose={() => {
//             setModalVisible(false);
//             setSelectedCalendar(null);
//             setSelectedPlatform(null);
//           }}
//           onSave={handleSaveSync}
//           cleaners={[]}
//           aptId={property._id}
//           preselectedPlatform={selectedPlatform}
//           existingCalendar={selectedCalendar}
//           checklists={checklists}
//         />
//       </ScrollView>

//       <CleanerManagementModal
//         visible={cleanerModalVisible}
//         onClose={() => {
//           setCleanerModalVisible(false);
//           saveCleanersToProperty();
//         }}
//         platformCleaners={platformCleaners}
//         preferredCleaners={preferredCleaners}
//         setPreferredCleaners={setPreferredCleaners}
//         invitedCleaners={invitedCleaners}
//         setInvitedCleaners={setInvitedCleaners}
//       />
//     </>
//   );
// }

// // Keep all existing styles from your older version
// const styles = StyleSheet.create({
//   // ... (keep all your existing styles from the older version)
//   container: {
//     backgroundColor: '#F8F9FC',
//   },
//   contentContainer: {
//     padding: 16,
//     paddingBottom: 40,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1E1E2F',
//   },
//   cardButton: {
//     padding: 4,
//   },
//   divider: {
//     backgroundColor: '#E6E9F0',
//     marginBottom: 16,
//   },
//   propertyContent: {
//     marginTop: 4,
//   },
//   propertyName: {
//     fontSize: 20,
//     fontWeight: '700',
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
//   cleanerItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   cleanerInfo: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   cleanerName: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 2,
//   },
//   cleanerContact: {
//     fontSize: 12,
//     color: '#6C6C80',
//   },
//   unlinkButton: {
//     padding: 8,
//   },
//   pendingCount: {
//     backgroundColor: COLORS.warning + '20',
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 12,
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.warning,
//   },
//   pendingInviteItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//     padding: 8,
//     backgroundColor: '#FFF8E1',
//     borderRadius: 12,
//   },
//   pendingInviteAvatar: {
//     marginRight: 12,
//   },
//   pendingInviteInfo: {
//     flex: 1,
//   },
//   pendingInviteName: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#1E1E2F',
//     marginBottom: 2,
//   },
//   pendingInviteDetail: {
//     fontSize: 12,
//     color: '#6C6C80',
//     marginBottom: 4,
//   },
//   pendingStatusChip: {
//     backgroundColor: COLORS.warning + '20',
//     height: 22,
//     alignSelf: 'flex-start',
//   },
//   pendingStatusText: {
//     fontSize: 10,
//     color: COLORS.warning,
//   },
//   pendingInviteDate: {
//     fontSize: 11,
//     color: '#6C6C80',
//   },
//   checklistItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//     padding: 8,
//     backgroundColor: '#F9F9FC',
//     borderRadius: 12,
//   },
//   checklistHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   checklistName: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//     marginLeft: 8,
//     flex: 1,
//   },
//   checklistMeta: {
//     flexDirection: 'row',
//     marginRight: 8,
//   },
//   checklistMetaText: {
//     fontSize: 12,
//     color: '#6C6C80',
//     marginLeft: 12,
//   },
//   checklistArrow: {
//     marginLeft: 8,
//   },
//   calendarItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   calendarInfo: {
//     flex: 1,
//   },
//   calendarName: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 2,
//   },
//   calendarUrl: {
//     fontSize: 12,
//     color: '#6C6C80',
//     marginBottom: 2,
//     marginRight: 10,
//   },
//   calendarDate: {
//     fontSize: 11,
//     color: '#8E8E93',
//   },
//   editCalendarButton: {
//     padding: 8,
//     marginLeft: 8,
//   },
//   loader: {
//     marginVertical: 20,
//   },
//   segmentedBanner: {
//     backgroundColor: 'white',
//     borderRadius: 20,
//     marginVertical: 8,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   segmentedColors: {
//     flexDirection: 'row',
//     height: 8,
//   },
//   colorSegment: {
//     flex: 1,
//   },
//   segmentedContent: {
//     padding: 24,
//     alignItems: 'center',
//   },
//   segmentedTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1E1E2F',
//     marginTop: 12,
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   segmentedText: {
//     fontSize: 14,
//     color: '#6C6C80',
//     textAlign: 'center',
//     marginBottom: 20,
//     lineHeight: 20,
//   },
//   segmentedButton: {
//     backgroundColor: '#4ECDC4',
//     paddingHorizontal: 24,
//     paddingVertical: 10,
//     borderRadius: 25,
//   },
//   segmentedButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: 'white',
//   },
//   gradientBanner: {
//     borderRadius: 20,
//     marginVertical: 8,
//     overflow: 'hidden',
//   },
//   gradientBannerContent: {
//     padding: 24,
//     alignItems: 'center',
//   },
//   gradientIconContainer: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   gradientTitle: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: 'white',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   gradientText: {
//     fontSize: 14,
//     color: 'rgba(255,255,255,0.9)',
//     textAlign: 'center',
//     marginBottom: 20,
//     lineHeight: 20,
//   },
//   gradientButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 25,
//     gap: 8,
//   },
//   gradientButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: 'white',
//   },
//   softBlueBanner: {
//     backgroundColor: '#EBF8FF',
//     borderRadius: 20,
//     marginVertical: 8,
//     padding: 24,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#BEE3F8',
//   },
//   softBlueTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#2B6CB0',
//     marginTop: 12,
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   softBlueText: {
//     fontSize: 14,
//     color: '#4A5568',
//     textAlign: 'center',
//     marginBottom: 16,
//     lineHeight: 20,
//     paddingHorizontal: 8,
//   },
//   softBlueButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 25,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   softBlueButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#3182CE',
//     marginRight: 4,
//   },
//   platformIcons: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 12,
//     marginBottom: 20,
//     flexWrap: 'wrap',
//   },
//   platformIconCircle: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'white',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   pendingSubtitleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary_light_2,
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 16,
//     borderLeftWidth: 3,
//     borderLeftColor: COLORS.primary_light,
//   },
//   pendingSubtitleIcon: {
//     marginRight: 8,
//   },
//   pendingSubtitle: {
//     flex: 1,
//     fontSize: 13,
//     color: COLORS.gray,
//     lineHeight: 18,
//   },
//   pendingStatusRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 4,
//     gap: 8,
//     flexWrap: 'wrap',
//   },
//   expiryContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF3E0',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     gap: 4,
//   },
//   expiredContainer: {
//     backgroundColor: '#FFEBEE',
//   },
//   expiryText: {
//     fontSize: 10,
//     fontWeight: '500',
//   },
//   pendingInviteRight: {
//     alignItems: 'flex-end',
//     justifyContent: 'center',
//   },

//   pendingStatusRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 6,
//     gap: 8,
//     flexWrap: 'wrap',
//   },
//   pendingStatusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.warning + '20',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 13,
//     gap: 4,
//     height: 26,
//     alignSelf: 'center',
//   },
//   pendingStatusBadgeText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: "orange",
//   },
//   expiryContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF3E0',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 13,
//     gap: 4,
//     height: 26,
//     alignSelf: 'center',
//   },
//   expiredContainer: {
//     backgroundColor: '#FFEBEE',
//   },
//   expiryText: {
//     fontSize: 11,
//     fontWeight: '500',
//   },
//   inventoryPreview: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//     gap: 12,
//   },
//   inventoryPreviewText: {
//     flex: 1,
//     fontSize: 14,
//     color: '#6C6C80',
//     lineHeight: 20,
//   },
  
// });


import React, { useState, useEffect, useLayoutEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconButton, Avatar, Divider, Chip } from 'react-native-paper';
import { MaterialCommunityIcons, AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import moment from 'moment';

import COLORS from '../../constants/colors';
import ROUTES from '../../constants/routes';
import CircleIcon from '../../components/shared/CircleIcon';
import AddICalModal from '../../components/host/AddICalModal';
import CleanerManagementModal from '../../components/cleaner/CleanerManagementModal';

import userService from '../../services/connection/userService';
import { AuthContext } from '../../context/AuthContext';
import { tSafe } from '../../utils/tSafe';
const FreshSweeperLogo = require('../../assets/notification_icon.png');

export default function PropertyDashboard({ route }) {
  const { property: passedProperty, propertyId: paramPropertyId } = route.params || {};
  const { currentUserId } = useContext(AuthContext);
  const navigation = useNavigation();

  const [property, setProperty] = useState(passedProperty || null);
  const [loadingProperty, setLoadingProperty] = useState(!passedProperty && !!paramPropertyId);
  const [refreshing, setRefreshing] = useState(false);
  const [linkedCleaners, setLinkedCleaners] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [syncedCalendars, setSyncedCalendars] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [loadingCleaners, setLoadingCleaners] = useState(false);
  const [loadingChecklists, setLoadingChecklists] = useState(false);
  const [loadingInvites, setLoadingInvites] = useState(false);

  // State for cleaner management modal
  const [cleanerModalVisible, setCleanerModalVisible] = useState(false);
  const [platformCleaners, setPlatformCleaners] = useState([]);
  const [preferredCleaners, setPreferredCleaners] = useState([]);
  const [invitedCleaners, setInvitedCleaners] = useState([]);

  // State for pending invites (from cleaner_invites_collection)
  const [pendingInvites, setPendingInvites] = useState([]);

  // Fetch property if only ID was provided (e.g., from notification)
  useEffect(() => {
    const fetchProperty = async () => {
      if (passedProperty) {
        setProperty(passedProperty);
        setLoadingProperty(false);
        return;
      }
      if (paramPropertyId) {
        try {
          const res = await userService.getApartmentById(paramPropertyId);
          setProperty(res.data);
        } catch (error) {
          console.error('Error fetching property:', error);
          Alert.alert('Error', 'Could not load property details');
        } finally {
          setLoadingProperty(false);
        }
      }
    };
    fetchProperty();
  }, [passedProperty, paramPropertyId]);

  // Room details (computed from property state)
  const bedroomCount = property?.roomDetails?.find(r => r.type === "Bedroom")?.number || 0;
  const bathroomCount = property?.roomDetails?.find(r => r.type === "Bathroom")?.number || 0;
  const kitchen = property?.roomDetails?.find(r => r.type === "Kitchen")?.number || 0;
  const livingroomCount = property?.roomDetails?.find(r => r.type === "Livingroom")?.number || 0;
  const bedroomSize = property?.roomDetails?.find(r => r.type === "Bedroom")?.size || 0;
  const bathroomSize = property?.roomDetails?.find(r => r.type === "Bathroom")?.size || 0;
  const kitchenSize = property?.roomDetails?.find(r => r.type === "Kitchen")?.size || 0;
  const livingroomSize = property?.roomDetails?.find(r => r.type === "Livingroom")?.size || 0;

  // Fetch pending invites for this property
  const fetchPendingInvites = async () => {
    if (!property?._id) return;
    setLoadingInvites(true);
    try {
      const response = await userService.getPropertyInvites(property._id);
      if (response.data?.data?.invites) {
        const invites = response.data.data.invites;
        const pending = invites.filter(invite => invite.status === 'pending');
        setPendingInvites(pending);
      } else {
        setPendingInvites([]);
      }
    } catch (error) {
      console.error('Error fetching pending invites:', error);
      setPendingInvites([]);
    } finally {
      setLoadingInvites(false);
    }
  };

  // Fetch linked cleaners from property.preferredCleaners
  const fetchLinkedCleaners = async () => {
    if (!property?.preferredCleaners?.length) {
      setLinkedCleaners([]);
      return;
    }
    setLoadingCleaners(true);
    try {
      const cleanerIds = property.preferredCleaners.map(pc => pc.id);
      const users = await Promise.all(
        cleanerIds.map(id => userService.getUser(id).catch(() => null))
      );
      const validCleaners = users
        .map(res => res?.data)
        .filter(c => c && c._id);
      setLinkedCleaners(validCleaners);
    } catch (error) {
      console.error('Error fetching linked cleaners:', error);
    } finally {
      setLoadingCleaners(false);
    }
  };

  // Fetch checklists
  const fetchChecklists = async () => {
    if (!property?.checklists?.length) {
      setChecklists([]);
      return;
    }
    setLoadingChecklists(true);
    try {
      const response = await userService.getCustomChecklistsByProperty(property.checklists);
      setChecklists(response.data.data || []);
    } catch (error) {
      console.error('Error fetching checklists:', error);
    } finally {
      setLoadingChecklists(false);
    }
  };

  // Fetch synced calendars
  const fetchSyncedCalendars = async () => {
    if (!property?._id) return;
    try {
      const response = await userService.getSyncedCalsByApartmentIds(property._id);
      if (!response.data || response.data.length === 0) {
        setSyncedCalendars([]);
        return;
      }
      const calId = response.data[0]._id;
      const calendars = response.data[0].calendars
        ? response.data[0].calendars.map(calendar => ({
            ...calendar,
            propertyId: property._id,
            calId,
          }))
        : [];
      setSyncedCalendars(calendars);
    } catch (error) {
      console.error('Error fetching synced calendars:', error);
      setSyncedCalendars([]);
    }
  };

  // Fetch platform cleaners near the property
  const fetchPlatformCleanersNearby = async () => {
    if (!property?.latitude || !property?.longitude) return;
    try {
      const response = await userService.getPlatformCleaners({
        latitude: property.latitude,
        longitude: property.longitude,
        radius: 100,
      });
      setPlatformCleaners(response.data || []);
    } catch (error) {
      console.error('Error fetching platform cleaners:', error);
    }
  };

  // Initialize local cleaner state from property
  const initCleanerState = () => {
    setPreferredCleaners(property?.preferredCleaners || []);
    setInvitedCleaners(property?.invitedCleaners || []);
  };

  // Save changes to property cleaners
  const saveCleanersToProperty = async () => {
    try {
      await userService.updatePropertyCleaners(property._id, {
        preferredCleaners,
        invitedCleaners,
      });
      await fetchLinkedCleaners();
      Alert.alert(tSafe('success_title', 'Success'), tSafe('cleaners_updated', 'Cleaners updated successfully'));
    } catch (error) {
      console.error('Error updating property cleaners:', error);
      Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_update_cleaners', 'Failed to update cleaners'));
    }
  };

  const fetchAll = async () => {
    if (!property?._id) return;
    await Promise.all([
      fetchLinkedCleaners(),
      fetchPendingInvites(),
      fetchChecklists(),
      fetchSyncedCalendars(),
      fetchPlatformCleanersNearby(),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (property?._id) {
      await fetchAll();
      initCleanerState();
    } else if (paramPropertyId) {
      // Try to reload property
      try {
        const res = await userService.getApartmentById(paramPropertyId);
        setProperty(res.data);
      } catch (error) {
        console.error('Error refreshing property:', error);
      }
    }
    setRefreshing(false);
  };

  useEffect(() => {
    if (property?._id) {
      fetchAll();
      initCleanerState();
    }
  }, [property]);

  useFocusEffect(
    useCallback(() => {
      if (property?._id) {
        fetchAll();
        initCleanerState();
      }
      // Clear any refresh params
      if (route.params?.refresh) {
        navigation.setParams({ refresh: undefined, propertyId: undefined, timestamp: undefined });
      }
    }, [property?._id])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => null,
    });
  }, [navigation]);

  // Handlers
  const handleEditProperty = () => {
    navigation.navigate(ROUTES.host_edit_apt, { propertyId: property._id });
  };

  const handleAddCleaner = () => {
    navigation.navigate(ROUTES.host_invite_cleaners, { 
      property,
      hostId: currentUserId,
    });
  };

  const handleAddChecklist = () => {
    navigation.navigate(ROUTES.host_create_checklist, { propertyId: property._id });
  };

  const handleLinkCalendar = () => {
    navigation.navigate(ROUTES.host_link_icalendar, { 
      property,
      hostId: currentUserId,
    });
  };

  const handleAddCalendar = () => {
    setSelectedCalendar(null);
    setSelectedPlatform(null);
    setModalVisible(true);
  };

  const handleEditCalendar = (calendar) => {
    setSelectedCalendar(calendar);
    setSelectedPlatform(calendar.platform);
    setModalVisible(true);
  };

  const handleSaveSync = async (data) => {
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
      await fetchSyncedCalendars();
      Alert.alert(tSafe('success_title', 'Success'), tSafe('calendar_sync_saved', 'Calendar sync saved successfully'));
    } catch (error) {
      console.error('Error saving calendar sync:', error);
      Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_save_calendar', 'Failed to save calendar sync'));
    }
  };

  const toggleSync = async (calendar) => {
    try {
      await userService.updateSyncCalendar(calendar._id, { enabled: !calendar.enabled });
      await fetchSyncedCalendars();
    } catch (error) {
      console.error('Error toggling sync:', error);
      Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_update_sync', 'Failed to update sync status'));
    }
  };

  const getPlatformName = (platformId) => {
    const map = {
      airbnb: tSafe('airbnb', 'Airbnb'),
      booking: tSafe('booking_com', 'Booking.com'),
      vrbo: tSafe('vrbo', 'Vrbo'),
      ical: tSafe('other_calendar', 'Other Calendar'),
    };
    return map[platformId] || platformId;
  };

  // Renderers
  const renderCleaner = ({ item }) => (
    <View style={styles.cleanerItem}>
      <Avatar.Image
        size={40}
        source={{ uri: item.avatar || 'https://via.placeholder.com/40' }}
      />
      <View style={styles.cleanerInfo}>
        <Text style={styles.cleanerName}>{item.firstname} {item.lastname}</Text>
        <Text style={styles.cleanerContact}>{item.email}</Text>
      </View>
      <TouchableOpacity
        style={styles.unlinkButton}
        onPress={() => {
          Alert.alert(
            tSafe('unlink_cleaner_title', 'Unlink Cleaner'),
            tSafe('unlink_cleaner_confirm', 'Remove {name} from this property?', { name: item.firstname }),
            [
              { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
              {
                text: tSafe('unlink', 'Unlink'),
                style: 'destructive',
                onPress: async () => {
                  try {
                    await userService.unlinkCleaner({ propertyId: property._id, cleanerId: item._id });
                    await fetchLinkedCleaners();
                    setPreferredCleaners(prev => prev.filter(pc => pc.id !== item._id));
                  } catch (err) {
                    Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_unlink', 'Failed to unlink cleaner'));
                  }
                },
              },
            ]
          );
        }}
      >
        <MaterialIcons name="link-off" size={20} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  const renderChecklist = ({ item }) => (
    <TouchableOpacity
      style={styles.checklistItem}
      onPress={() => navigation.navigate(ROUTES.host_create_checklist, { checklist: item })}
    >
      <View style={styles.checklistHeader}>
        <MaterialCommunityIcons name="clipboard-list-outline" size={24} color={COLORS.primary} />
        <Text style={styles.checklistName} numberOfLines={1}>
          {item.checklistName || tSafe('cleaning_checklist', 'Cleaning Checklist')}
        </Text>
      </View>
      <View style={styles.checklistMeta}>
        <Text style={styles.checklistMetaText}>⏱️ {item.totalTime} {tSafe('minutes_abbr', 'min')}</Text>
        <Text style={styles.checklistMetaText}>💰 ${item.totalFee?.toFixed(2)}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color={COLORS.gray} style={styles.checklistArrow} />
    </TouchableOpacity>
  );

  const renderCalendar = ({ item }) => {
    const platformName = getPlatformName(item.platform);
    return (
      <View style={styles.calendarItem}>
        <View style={styles.calendarInfo}>
          <Text style={styles.calendarName}>{platformName}</Text>
          <Text style={styles.calendarUrl} numberOfLines={1}>
            {item.ical_url || item.calendar_url || tSafe('no_url_provided', 'No URL provided')}
          </Text>
          {item.last_synced && (
            <Text style={styles.calendarDate}>
              {tSafe('last_synced', 'Last synced:')} {new Date(item.last_synced).toLocaleDateString()}
            </Text>
          )}
        </View>
        <Switch
          value={item.enabled !== false}
          onValueChange={() => toggleSync(item)}
          trackColor={{ false: COLORS.light_gray_1, true: COLORS.primary }}
          thumbColor={COLORS.white}
        />
        <TouchableOpacity onPress={() => handleEditCalendar(item)} style={styles.editCalendarButton}>
          <MaterialIcons name="edit" size={20} color={COLORS.gray} />
        </TouchableOpacity>
      </View>
    );
  };

  if (loadingProperty) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading property...</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Property not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.errorButton}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Property Card */}
        <Animatable.View animation="fadeInUp" duration={500} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{tSafe('property_details', 'Property Details')}</Text>
            <TouchableOpacity onPress={handleEditProperty} style={styles.cardButton}>
              <MaterialIcons name="edit" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.propertyContent}>
            <Text style={styles.propertyName}>{property.apt_name}</Text>
            <View style={styles.addressRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color={COLORS.gray} />
              <Text style={styles.propertyAddress}>{property.address}</Text>
            </View>
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
                title={kitchen}
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
          </View>
        </Animatable.View>

        {/* Checklists Card */}
        <Animatable.View animation="fadeInUp" delay={300} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{tSafe('cleaning_checklists', 'Cleaning Checklists')}</Text>
            <TouchableOpacity onPress={handleAddChecklist} style={styles.cardButton}>
              <MaterialIcons name="add" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <Divider style={styles.divider} />
          {loadingChecklists ? (
            <ActivityIndicator style={styles.loader} size="small" color={COLORS.primary} />
          ) : checklists.length === 0 ? (
            <TouchableOpacity onPress={handleAddChecklist} activeOpacity={0.95}>
              <LinearGradient colors={['#8E2DE2', '#4A00E0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientBanner}>
                <View style={styles.gradientBannerContent}>
                  <View style={styles.gradientIconContainer}>
                    <MaterialCommunityIcons name="clipboard-check-multiple" size={32} color="white" />
                  </View>
                  <Text style={styles.gradientTitle}>{tSafe('no_checklists_yet', 'No Checklists Yet')}</Text>
                  <Text style={styles.gradientText}>{tSafe('checklist_encouragement', 'Create your first cleaning checklist to ensure nothing gets missed. Customize tasks for each room type.')}</Text>
                  <View style={styles.gradientButton}>
                    <Text style={styles.gradientButtonText}>{tSafe('create_checklist', 'Create Checklist')}</Text>
                    <MaterialIcons name="arrow-forward" size={18} color="white" />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <FlatList data={checklists} keyExtractor={(item) => item._id} renderItem={renderChecklist} scrollEnabled={false} />
          )}
        </Animatable.View>

        {/* Pending Invites Section */}
        {loadingInvites ? (
          <Animatable.View animation="fadeInUp" delay={100} style={styles.card}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </Animatable.View>
        ) : pendingInvites.length > 0 ? (
          <Animatable.View animation="fadeInUp" delay={100} style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="clock-outline" size={22} color={COLORS.warning} />
              <Text style={styles.cardTitle}>{tSafe('pending_cleaner_invites', 'Pending Cleaner Invites')}</Text>
              <Text style={styles.pendingCount}>{pendingInvites.length}</Text>
            </View>
            <View style={styles.pendingSubtitleContainer}>
              <Text style={styles.pendingSubtitle}>
                {tSafe('pending_invites_subtitle_short', 'Awaiting response from invited cleaners. They will appear in "Linked Cleaners" once they accept.')}
              </Text>
            </View>
            <Divider style={styles.divider} />
            {pendingInvites.map((invite, index) => {
              // Expiration calculation
              const expiresAt = moment(invite.expires_at);
              const now = moment();
              const isExpired = now.isAfter(expiresAt);
              const daysLeft = expiresAt.diff(now, 'days');
              const hoursLeft = expiresAt.diff(now, 'hours');
              
              let expiryText = '';
              let expiryColor = COLORS.warning;
              
              if (isExpired) {
                expiryText = tSafe('expired', 'Expired');
                expiryColor = COLORS.error;
              } else if (daysLeft > 0) {
                const daysWord = daysLeft === 1 ? tSafe('day', 'day') : tSafe('days', 'days');
                expiryText = `${tSafe('expires_in', 'Expires in')} ${daysLeft} ${daysWord}`;
                expiryColor = daysLeft <= 3 ? COLORS.warning : COLORS.gray;
              } else if (hoursLeft > 0) {
                const hoursWord = hoursLeft === 1 ? tSafe('hour', 'hour') : tSafe('hours', 'hours');
                expiryText = `${tSafe('expires_in', 'Expires in')} ${hoursLeft} ${hoursWord}`;
                expiryColor = COLORS.warning;
              } else {
                expiryText = tSafe('expires_soon', 'Expires soon');
                expiryColor = COLORS.error;
              }
              
              const isPlatformInvite = invite.type === 'platform';
              return (
                <View key={invite._id} style={styles.pendingInviteItem}>
                  <View style={styles.pendingInviteAvatar}>
                    {isPlatformInvite ? (
                      <Avatar.Image size={30} source={FreshSweeperLogo} style={{ backgroundColor: COLORS.warning, marginLeft: 5 }} />
                    ) : invite.type === 'phone' ? (
                      <Avatar.Icon size={40} icon="phone-outline" style={{ backgroundColor: COLORS.warning + '20' }} color={COLORS.warning} />
                    ) : (
                      <Avatar.Icon size={40} icon="email-outline" style={{ backgroundColor: COLORS.warning + '20' }} color={COLORS.warning} />
                    )}
                  </View>
                  <View style={styles.pendingInviteInfo}>
                    <Text style={styles.pendingInviteName}>
                      {isPlatformInvite
                        ? invite.firstname && invite.lastname ? `${invite.firstname} ${invite.lastname.charAt(0)}.` : tSafe('platform_cleaner', 'Platform Cleaner')
                        : invite.type === 'phone' ? invite.phone || tSafe('invited_cleaner', 'Invited Cleaner') : invite.email || tSafe('invited_cleaner', 'Invited Cleaner')
                      }
                    </Text>
                    <Text style={styles.pendingInviteDetail}>
                      {tSafe('invited_via', 'Invited via')}{' '}
                      {isPlatformInvite ? tSafe('platform', 'Platform') : invite.type === 'phone' ? tSafe('phone', 'Phone') : tSafe('email', 'Email')}
                    </Text>
                    <View style={styles.pendingStatusRow}>
                      <View style={styles.pendingStatusBadge}>
                        <MaterialCommunityIcons name="clock-outline" size={13} color="orange" />
                        <Text style={styles.pendingStatusBadgeText}>{tSafe('pending', 'Pending')}</Text>
                      </View>
                      <View style={[styles.expiryContainer, isExpired && styles.expiredContainer]}>
                        <MaterialCommunityIcons name={isExpired ? "alert-circle-outline" : "timer-outline"} size={12} color={expiryColor} />
                        <Text style={[styles.expiryText, { color: expiryColor }]}>{expiryText}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.pendingInviteRight}>
                    <Text style={styles.pendingInviteDate}>{moment(invite.created_at).fromNow()}</Text>
                  </View>
                </View>
              );
            })}
          </Animatable.View>
        ) : null}

        {/* Linked Cleaners Card */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{tSafe('linked_cleaners', 'Linked Cleaners')}</Text>
            <TouchableOpacity onPress={handleAddCleaner} style={styles.cardButton}>
              <MaterialIcons name="add" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <Divider style={styles.divider} />
          {loadingCleaners ? (
            <ActivityIndicator style={styles.loader} size="small" color={COLORS.primary} />
          ) : linkedCleaners.length === 0 ? (
            <TouchableOpacity onPress={handleAddCleaner} activeOpacity={0.95}>
              <View style={styles.segmentedBanner}>
                <View style={styles.segmentedColors}>
                  <View style={[styles.colorSegment, { backgroundColor: '#FF6B6B' }]} />
                  <View style={[styles.colorSegment, { backgroundColor: '#4ECDC4' }]} />
                  <View style={[styles.colorSegment, { backgroundColor: '#45B7D1' }]} />
                  <View style={[styles.colorSegment, { backgroundColor: '#96CEB4' }]} />
                  <View style={[styles.colorSegment, { backgroundColor: '#FFEAA7' }]} />
                </View>
                <View style={styles.segmentedContent}>
                  <MaterialCommunityIcons name="account-plus" size={50} color="#FF6B6B" />
                  <Text style={styles.segmentedTitle}>{tSafe('invite_your_trusted_cleaners', 'Invite Your Trusted Cleaners')}</Text>
                  <Text style={styles.segmentedText}>{tSafe('keep_working_with_cleaners', 'Keep working with cleaners you already know and trust')}</Text>
                  <View style={styles.segmentedButton}>
                    <Text style={styles.segmentedButtonText}>{tSafe('invite_cleaners', 'Invite Cleaners')}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <FlatList data={linkedCleaners} keyExtractor={(item) => item._id} renderItem={renderCleaner} scrollEnabled={false} />
          )}
        </Animatable.View>

        

        {/* Calendar Connections Card */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{tSafe('calendar_connections', 'Calendar Connections')}</Text>
            <TouchableOpacity onPress={handleLinkCalendar} style={styles.cardButton}>
              <MaterialIcons name="add" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <Divider style={styles.divider} />
          {syncedCalendars.length === 0 ? (
            <TouchableOpacity onPress={handleLinkCalendar} activeOpacity={0.95}>
              <View style={styles.softBlueBanner}>
                <MaterialIcons name="calendar-today" size={44} color="#3182CE" />
                <Text style={styles.softBlueTitle}>{tSafe('sync_booking_calendars', 'Sync Your Booking Calendars')}</Text>
                <Text style={styles.softBlueText}>{tSafe('calendar_sync_description', 'Connect Airbnb, Booking.com, Vrbo, iCal, or Google Calendar to automatically sync bookings and notify cleaners of new reservations')}</Text>
                <View style={styles.platformIcons}>
                  <View style={styles.platformIconCircle}><MaterialCommunityIcons name="home" size={20} color="#FF5A5F" /></View>
                  <View style={styles.platformIconCircle}><MaterialCommunityIcons name="web" size={20} color="#003580" /></View>
                  <View style={styles.platformIconCircle}><MaterialCommunityIcons name="home-variant" size={20} color="#1E6F5C" /></View>
                  <View style={styles.platformIconCircle}><MaterialCommunityIcons name="calendar" size={20} color="#4285F4" /></View>
                  <View style={styles.platformIconCircle}><MaterialCommunityIcons name="google" size={20} color="#34A853" /></View>
                </View>
                <View style={styles.softBlueButton}>
                  <Text style={styles.softBlueButtonText}>{tSafe('connect_calendar', 'Connect Calendar')}</Text>
                  <MaterialIcons name="arrow-forward" size={18} color="#3182CE" />
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <FlatList data={syncedCalendars} keyExtractor={(item) => item._id} renderItem={renderCalendar} scrollEnabled={false} />
          )}
        </Animatable.View>

        {/* Inventory Management Card */}
        <Animatable.View animation="fadeInUp" delay={350} style={styles.card}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate(ROUTES.host_inventory, { propertyId: property._id })}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="package-variant" size={24} color={COLORS.primary} />
              <Text style={styles.cardTitle}>{tSafe('inventory_management', 'Inventory Management')}</Text>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.gray} />
            </View>
            <Divider style={styles.divider} />
            <View style={styles.inventoryPreview}>
              <MaterialCommunityIcons name="clipboard-text" size={32} color={COLORS.primaryLight} />
              <Text style={styles.inventoryPreviewText}>{tSafe('inventory_preview', 'Track supplies, set reorder levels, and manage stock for this property.')}</Text>
            </View>
          </TouchableOpacity>
        </Animatable.View>

        <AddICalModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedCalendar(null);
            setSelectedPlatform(null);
          }}
          onSave={handleSaveSync}
          cleaners={[]}
          aptId={property._id}
          preselectedPlatform={selectedPlatform}
          existingCalendar={selectedCalendar}
          checklists={checklists}
        />
      </ScrollView>

      <CleanerManagementModal
        visible={cleanerModalVisible}
        onClose={() => {
          setCleanerModalVisible(false);
          saveCleanersToProperty();
        }}
        platformCleaners={platformCleaners}
        preferredCleaners={preferredCleaners}
        setPreferredCleaners={setPreferredCleaners}
        invitedCleaners={invitedCleaners}
        setInvitedCleaners={setInvitedCleaners}
      />
    </>
  );
}


// Ensure you also have the proper styles for any additional elements (they already exist in the original project)
const styles = StyleSheet.create({
  // ... (keep all your existing styles from the older version)
  container: {
    backgroundColor: '#F8F9FC',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1E2F',
  },
  cardButton: {
    padding: 4,
  },
  divider: {
    backgroundColor: '#E6E9F0',
    marginBottom: 16,
  },
  propertyContent: {
    marginTop: 4,
  },
  propertyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1E2F',
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  propertyAddress: {
    fontSize: 14,
    color: '#6C6C80',
    marginLeft: 6,
  },
  roomStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cleanerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cleanerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cleanerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  cleanerContact: {
    fontSize: 12,
    color: '#6C6C80',
  },
  unlinkButton: {
    padding: 8,
  },
  pendingCount: {
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.warning,
  },
  pendingInviteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
  },
  pendingInviteAvatar: {
    marginRight: 12,
  },
  pendingInviteInfo: {
    flex: 1,
  },
  pendingInviteName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E1E2F',
    marginBottom: 2,
  },
  pendingInviteDetail: {
    fontSize: 12,
    color: '#6C6C80',
    marginBottom: 4,
  },
  pendingStatusChip: {
    backgroundColor: COLORS.warning + '20',
    height: 22,
    alignSelf: 'flex-start',
  },
  pendingStatusText: {
    fontSize: 10,
    color: COLORS.warning,
  },
  pendingInviteDate: {
    fontSize: 11,
    color: '#6C6C80',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#F9F9FC',
    borderRadius: 12,
  },
  checklistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checklistName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  checklistMeta: {
    flexDirection: 'row',
    marginRight: 8,
  },
  checklistMetaText: {
    fontSize: 12,
    color: '#6C6C80',
    marginLeft: 12,
  },
  checklistArrow: {
    marginLeft: 8,
  },
  calendarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calendarInfo: {
    flex: 1,
  },
  calendarName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  calendarUrl: {
    fontSize: 12,
    color: '#6C6C80',
    marginBottom: 2,
    marginRight: 10,
  },
  calendarDate: {
    fontSize: 11,
    color: '#8E8E93',
  },
  editCalendarButton: {
    padding: 8,
    marginLeft: 8,
  },
  loader: {
    marginVertical: 20,
  },
  segmentedBanner: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  segmentedColors: {
    flexDirection: 'row',
    height: 8,
  },
  colorSegment: {
    flex: 1,
  },
  segmentedContent: {
    padding: 24,
    alignItems: 'center',
  },
  segmentedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1E2F',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  segmentedText: {
    fontSize: 14,
    color: '#6C6C80',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  segmentedButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 25,
  },
  segmentedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  gradientBanner: {
    borderRadius: 20,
    marginVertical: 8,
    overflow: 'hidden',
  },
  gradientBannerContent: {
    padding: 24,
    alignItems: 'center',
  },
  gradientIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  gradientTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  gradientText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  gradientButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  softBlueBanner: {
    backgroundColor: '#EBF8FF',
    borderRadius: 20,
    marginVertical: 8,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BEE3F8',
  },
  softBlueTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2B6CB0',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  softBlueText: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  softBlueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  softBlueButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3182CE',
    marginRight: 4,
  },
  platformIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  platformIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pendingSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary_light_2,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary_light,
  },
  pendingSubtitleIcon: {
    marginRight: 8,
  },
  pendingSubtitle: {
    flex: 1,
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
  },
  pendingStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
    flexWrap: 'wrap',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  expiredContainer: {
    backgroundColor: '#FFEBEE',
  },
  expiryText: {
    fontSize: 10,
    fontWeight: '500',
  },
  pendingInviteRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  pendingStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
    flexWrap: 'wrap',
  },
  pendingStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 13,
    gap: 4,
    height: 26,
    alignSelf: 'center',
  },
  pendingStatusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: "orange",
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 13,
    gap: 4,
    height: 26,
    alignSelf: 'center',
  },
  expiredContainer: {
    backgroundColor: '#FFEBEE',
  },
  expiryText: {
    fontSize: 11,
    fontWeight: '500',
  },
  inventoryPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  inventoryPreviewText: {
    flex: 1,
    fontSize: 14,
    color: '#6C6C80',
    lineHeight: 20,
  },
  
});