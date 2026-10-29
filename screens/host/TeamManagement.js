// import React, { useState, useEffect, useContext } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   RefreshControl,
//   Image,
// } from 'react-native';
// import { MaterialIcons } from '@expo/vector-icons';
// import * as Haptics from 'expo-haptics';
// import { AuthContext } from '../../context/AuthContext';
// import userService from '../../services/connection/userService';
// import COLORS from '../../constants/colors';
// import { formatDistanceToNow, format } from 'date-fns';
// import FloatingLabelPickerSelect from '../../components/shared/FloatingLabelPicker';
// import { tSafe } from '../../utils/tSafe'; // added import

// export default function TeamManagement() {
//   const { currentUserId, userToken } = useContext(AuthContext);
//   const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'linked'
  
//   // Pending invites state
//   const [invites, setInvites] = useState([]);
//   const [filteredInvites, setFilteredInvites] = useState([]);
//   const [properties, setProperties] = useState([]);
//   const [selectedProperty, setSelectedProperty] = useState('all');
//   const [selectedStatus, setSelectedStatus] = useState('all');
  
//   // Linked cleaners states
//   const [linkedData, setLinkedData] = useState([]);
//   const [selectedLinkedProperty, setSelectedLinkedProperty] = useState('all');
  
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [processingId, setProcessingId] = useState(null);
//   const [unlinkingId, setUnlinkingId] = useState(null);

//   const propertyItems = properties.map(p => ({ label: p.name, value: p.id }));

//   const statusItems = [
//     { label: tSafe('all_status', 'All Status'), value: 'all' },
//     { label: tSafe('status_pending', 'Pending'), value: 'pending' },
//     { label: tSafe('status_accepted', 'Accepted'), value: 'accepted' },
//     { label: tSafe('status_declined', 'Declined'), value: 'declined' },
//     { label: tSafe('status_expired', 'Expired'), value: 'expired' },
//   ];

//   const fetchAllData = async () => {
//     try {
//       const [invitesRes, linkedRes] = await Promise.all([
//         userService.getHostInvites(userToken, currentUserId),
//         userService.getLinkedCleaners(userToken, currentUserId),
//       ]);
//       const invitesData = invitesRes.data || [];
//       const linkedData = linkedRes.data || [];
//       console.log("Invitee", invitesData)
//       setInvites(invitesData);
//       applyInviteFilters(invitesData, selectedProperty, selectedStatus);
      
//       const props = [...new Set(invitesData.map(i => i.property_id))].map(pid => ({
//         id: pid,
//         name: invitesData.find(i => i.property_id === pid)?.property_name || pid
//       }));
//       setProperties([{ id: 'all', name: tSafe('all_properties', 'All Properties') }, ...props]);
      
//       setLinkedData(linkedData);
//     } catch (error) {
//       console.error('Failed to fetch team data:', error);
//       Alert.alert(tSafe('error_title', 'Error'), tSafe('could_not_load_team', 'Could not load team information'));
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchAllData();
//   };

//   const applyInviteFilters = (data, propId, stat) => {
//     let filtered = data;
//     if (propId !== 'all') {
//       filtered = filtered.filter(i => i.property_id === propId);
//     }
//     if (stat !== 'all') {
//       filtered = filtered.filter(i => i.status === stat);
//     }
//     setFilteredInvites(filtered);
//   };

//   useEffect(() => {
//     applyInviteFilters(invites, selectedProperty, selectedStatus);
//   }, [selectedProperty, selectedStatus, invites]);

//   // Deduplicate linked properties (by property_id)
//   const filteredRaw = selectedLinkedProperty === 'all'
//     ? linkedData
//     : linkedData.filter(p => p.property_id === selectedLinkedProperty);

//   const filteredLinked = [];
//   const seenPropertyIds = new Set();
//   filteredRaw.forEach(prop => {
//     if (!seenPropertyIds.has(prop.property_id)) {
//       seenPropertyIds.add(prop.property_id);
//       filteredLinked.push(prop);
//     } else {
//       console.warn('Duplicate property ID:', prop.property_id);
//     }
//   });



//   const handleResend = async (invite) => {
//     console.log(invite)
//     if (invite.type === 'email') {
//       Alert.alert(
//         tSafe('resend_invitation_title', 'Resend Invitation'),
//         tSafe('resend_invite_email', 'Resend invitation to {email}?', { email: invite.email }),
//         [
//           { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
//           {
//             text: tSafe('resend', 'Resend'),
//             onPress: async () => {
//               setProcessingId(invite.id);
//               const payload = {inviteId: invite.id, hostId:currentUserId}
//               try {
//                 await userService.resendInvite(payload);
//                 Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//                 Alert.alert(tSafe('success_title', 'Success'), tSafe('invitation_resent', 'Invitation resent'));
//               } catch (err) {
//                 console.error(err);
//                 Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_resend', 'Failed to resend invitation'));
//               } finally {
//                 setProcessingId(null);
//               }
//             },
//           },
//         ]
//       );
//     } else if (invite.type === 'platform') {
//       Alert.alert(
//         tSafe('resend_invitation_title', 'Resend Invitation'),
//         tSafe('resend_invite_platform', 'Send a new notification to {name}?', { name: invite.cleaner_name }),
//         [
//           { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
//           {
//             text: tSafe('resend', 'Resend'),
//             onPress: async () => {
//               setProcessingId(invite.id);
//               const payload = {inviteId: invite.id, hostId:currentUserId}
//               try {
//                 await userService.resendPlatformInvite(payload);
//                 Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//                 Alert.alert(tSafe('success_title', 'Success'), tSafe('notification_resent', 'Notification resent'));
//               } catch (err) {
//                 console.error(err);
//                 Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_resend', 'Failed to resend invitation'));
//               } finally {
//                 setProcessingId(null);
//               }
//             },
//           },
//         ]
//       );
//     }
//   };

  

//   const handleCancel = async (invite) => {
//     Alert.alert(
//       tSafe('cancel_invitation_title', 'Cancel Invitation'),
//       tSafe('cancel_invite_message', 'Cancel invitation to {name}?', { name: invite.type === 'platform' ? invite.cleaner_name : invite.email }),
//       [
//         { text: tSafe('no', 'No'), style: 'cancel' },
//         {
//           text: tSafe('yes_cancel', 'Yes, Cancel'),
//           style: 'destructive',
//           onPress: async () => {
//             setProcessingId(invite.id);
//             const payload = {inviteId: invite.id, hostId:currentUserId}
            
//             try {
//               await userService.cancelInvite(payload);
//               Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
//               setInvites(prev => prev.filter(i => i.id !== invite.id));
//               Alert.alert(tSafe('success_title', 'Success'), tSafe('invitation_cancelled', 'Invitation cancelled'));
//             } catch (err) {
//               console.error(err);
//               Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_cancel', 'Failed to cancel invitation'));
//             } finally {
//               setProcessingId(null);
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleUnlinkCleaner = (propertyId, cleanerId) => {
//     Alert.alert(
//       tSafe('unlink_cleaner_title', 'Unlink Cleaner'),
//       tSafe('unlink_cleaner_message', 'Are you sure you want to remove this cleaner from your property?'),
//       [
//         { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
//         {
//           text: tSafe('unlink', 'Unlink'),
//           style: 'destructive',
//           onPress: async () => {
//             setUnlinkingId(cleanerId);
//             const payload = { 
//               property_id:propertyId, 
//               cleaner_id:cleanerId 
//             } 
            
//             try {
//               await userService.unlinkCleaner(payload, userToken );
//               Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
//               setLinkedData(prev => prev.map(prop => {
//                 if (prop.property_id === propertyId) {
//                   return {
//                     ...prop,
//                     cleaners: prop.cleaners.filter(c => c.cleaner_id !== cleanerId)
//                   };
//                 }
//                 return prop;
//               }));
//               Alert.alert(tSafe('success_title', 'Success'), tSafe('cleaner_unlinked', 'Cleaner unlinked successfully'));
//             } catch (err) {
//               console.error(err);
//               Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_unlink', 'Failed to unlink cleaner'));
//             } finally {
//               setUnlinkingId(null);
//             }
//           }
//         }
//       ]
//     );
//   };

//   const getStatusStyle = (status) => {
//     switch (status) {
//       case 'pending': return { backgroundColor: '#FFF3E0', borderColor: '#FFB74D' };
//       case 'accepted': return { backgroundColor: '#E8F5E9', borderColor: '#66BB6A' };
//       case 'declined': return { backgroundColor: '#FFEBEE', borderColor: '#EF5350' };
//       case 'expired': return { backgroundColor: '#EEEEEE', borderColor: '#9E9E9E' };
//       case 'cancelled': return { backgroundColor: '#EEEEEE', borderColor: '#9E9E9E' };
//       default: return { backgroundColor: '#F5F5F5', borderColor: '#CCC' };
//     }
//   };

//   const renderInviteItem = ({ item }) => {
//     const isProcessing = processingId === item._id;
//     const expiresIn = item.status === 'pending' 
//       ? formatDistanceToNow(new Date(item.expires_at), { addSuffix: true })
//       : '';

//     return (
//       <View style={styles.card}>
//         <View style={styles.cardHeader}>
//           {item.type === 'platform' ? (
//             <Image
//               source={{ uri: item.cleaner_avatar || 'https://via.placeholder.com/40' }}
//               style={styles.avatar}
//             />
//           ) : (
//             <View style={[styles.avatar, styles.emailAvatar]}>
//               <MaterialIcons name="email" size={20} color="#fff" />
//             </View>
//           )}
//           <View style={styles.headerText}>
//             <Text style={styles.primaryName}>
//               {item.type === 'platform' ? item.cleaner_name : item.email}
//             </Text>
//             <Text style={styles.propertyName}>{item.property_name}</Text>
//           </View>
//           <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
//             <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
//           </View>
//         </View>

//         <View style={styles.cardFooter}>
//           {item.status === 'pending' && (
//             <Text style={styles.expiry}>{tSafe('expires', 'Expires')} {expiresIn}</Text>
//           )}
//           <View style={styles.actions}>
//             {item.status === 'pending' && item.type === 'email' && (
//               <TouchableOpacity
//                 style={[styles.actionBtn, styles.resendBtn, isProcessing && styles.disabled]}
//                 onPress={() => handleResend(item)}
//                 disabled={isProcessing}
//               >
//                 <MaterialIcons name="refresh" size={16} color={COLORS.primary} />
//                 <Text style={styles.resendText}>{tSafe('resend', 'Resend')}</Text>
//               </TouchableOpacity>
//             )}
//             {item.status === 'pending' && (
//               <TouchableOpacity
//                 style={[styles.actionBtn, styles.cancelBtn, isProcessing && styles.disabled]}
//                 onPress={() => handleCancel(item)}
//                 disabled={isProcessing}
//               >
//                 <MaterialIcons name="close" size={16} color={COLORS.error} />
//                 <Text style={styles.cancelText}>{tSafe('cancel', 'Cancel')}</Text>
//               </TouchableOpacity>
//             )}
//             {isProcessing && <ActivityIndicator size="small" color={COLORS.gray} />}
//           </View>
//         </View>

//         {item.type === 'email' && item.email && (
//           <View style={styles.contactRow}>
//             <MaterialIcons name="email" size={14} color={COLORS.gray} />
//             <Text style={styles.contactText}>{item.email}</Text>
//           </View>
//         )}
//         {item.type === 'platform' && item.cleaner_phone && (
//           <View style={styles.contactRow}>
//             <MaterialIcons name="phone" size={14} color={COLORS.gray} />
//             <Text style={styles.contactText}>{item.cleaner_phone}</Text>
//           </View>
//         )}
//       </View>
//     );
//   };

//   const renderLinkedProperty = ({ item }) => {
//     // Deduplicate cleaners within this property
//     const uniqueCleaners = [];
//     const seenCleanerIds = new Set();
//     item.cleaners.forEach(cleaner => {
//       if (!seenCleanerIds.has(cleaner.cleaner_id)) {
//         seenCleanerIds.add(cleaner.cleaner_id);
//         uniqueCleaners.push(cleaner);
//       } else {
//         console.warn('Duplicate cleaner ID:', cleaner.cleaner_id);
//       }
//     });

//     return (
//       <View style={styles.propertyGroup}>
//         <Text style={styles.propertyGroupTitle}>{item.property_name}</Text>
//         {uniqueCleaners.length === 0 ? (
//           <Text style={styles.emptySubText}>{tSafe('no_linked_cleaners', 'No linked cleaners')}</Text>
//         ) : (
//           uniqueCleaners.map(cleaner => (
//             <View key={cleaner.cleaner_id} style={styles.cleanerCard}>
//               <Image
//                 source={{ uri: cleaner.avatar || 'https://via.placeholder.com/40' }}
//                 style={styles.cleanerAvatar}
//               />
//               <View style={styles.cleanerInfo}>
//                 <Text style={styles.cleanerName}>
//                   {cleaner.firstname} {cleaner.lastname}
//                 </Text>
//                 <Text style={styles.cleanerContact}>{cleaner.email}</Text>
//                 {cleaner.phone && <Text style={styles.cleanerContact}>{cleaner.phone}</Text>}
//               </View>
//               <View style={styles.cleanerMeta}>
//                 <Text style={styles.cleanerType}>{cleaner.type}</Text>
//                 {cleaner.linked_at && (
//                   <Text style={styles.linkedDate}>
//                     {tSafe('linked', 'Linked')} {format(new Date(cleaner.linked_at), 'MMM d, yyyy')}
//                   </Text>
//                 )}
//                 {unlinkingId === cleaner.cleaner_id ? (
//                   <ActivityIndicator size="small" color={COLORS.error} style={styles.unlinkLoader} />
//                 ) : (
//                   <TouchableOpacity
//                     style={styles.unlinkButton}
//                     onPress={() => handleUnlinkCleaner(item.property_id, cleaner.cleaner_id)}
//                   >
//                     <MaterialIcons name="link-off" size={16} color={COLORS.error} />
//                     <Text style={styles.unlinkText}>{tSafe('unlink', 'Unlink')}</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             </View>
//           ))
//         )}
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Tabs */}
//       <View style={styles.tabBar}>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
//           onPress={() => setActiveTab('pending')}
//         >
//           <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
//             {tSafe('pending_invites', 'Pending Invites')}
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'linked' && styles.activeTab]}
//           onPress={() => setActiveTab('linked')}
//         >
//           <Text style={[styles.tabText, activeTab === 'linked' && styles.activeTabText]}>
//             {tSafe('linked_cleaners', 'Linked Cleaners')}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Filters for pending tab */}
//       {activeTab === 'pending' && (
//         <View style={styles.filters}>
//           <View style={styles.pickerWrapper}>
//             <FloatingLabelPickerSelect
//               label={tSafe('property', 'Property')}
//               items={propertyItems}
//               value={selectedProperty}
//               onValueChange={setSelectedProperty}
//               placeholder={{ label: tSafe('select_property', 'Select Property'), value: null }}
//               styleOverrides={{
//                 inputIOS: { fontSize: 14, paddingVertical: 12 },
//                 inputAndroid: { fontSize: 14, paddingVertical: 12 },
//               }}
//             />
//           </View>
//           <View style={styles.pickerWrapper}>
//             <FloatingLabelPickerSelect
//               label={tSafe('status', 'Status')}
//               items={statusItems}
//               value={selectedStatus}
//               onValueChange={setSelectedStatus}
//               placeholder={{ label: tSafe('select_status', 'Select Status'), value: null }}
//               styleOverrides={{
//                 inputIOS: { fontSize: 14, paddingVertical: 12 },
//                 inputAndroid: { fontSize: 14, paddingVertical: 12 },
//               }}
//             />
//           </View>
//         </View>
//       )}

//       {/* Property filter for linked cleaners */}
//       {activeTab === 'linked' && (
//         <View style={styles.filters}>
//           <View style={styles.pickerWrapper}>
//             <FloatingLabelPickerSelect
//               label={tSafe('property', 'Property')}
//               items={[
//                 { label: tSafe('all_properties', 'All Properties'), value: 'all' },
//                 ...linkedData.map(p => ({ label: p.property_name, value: p.property_id }))
//               ]}
//               value={selectedLinkedProperty}
//               onValueChange={setSelectedLinkedProperty}
//               placeholder={{ label: '', value: null }}
//               styleOverrides={{
//                 inputIOS: { fontSize: 14, paddingVertical: 12 },
//                 inputAndroid: { fontSize: 14, paddingVertical: 12 },
//               }}
//             />
//           </View>
//         </View>
//       )}

//       {/* Content */}
//       {activeTab === 'pending' ? (
//         filteredInvites.length === 0 ? (
//           <View style={styles.emptyContainer}>
//             <MaterialIcons name="mail-outline" size={64} color={COLORS.light_gray} />
//             <Text style={styles.emptyText}>{tSafe('no_pending_invites', 'No pending invites')}</Text>
//           </View>
//         ) : (
//           <FlatList
//             data={filteredInvites}
//             keyExtractor={(item) => item._id}
//             renderItem={renderInviteItem}
//             contentContainerStyle={styles.list}
//             refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//           />
//         )
//       ) : (
//         filteredLinked.length === 0 ? (
//           <View style={styles.emptyContainer}>
//             <MaterialIcons name="people-outline" size={64} color={COLORS.gray} />
//             <Text style={styles.emptyText}>{tSafe('no_linked_cleaners', 'No linked cleaners yet')}</Text>
//           </View>
//         ) : (
//           <FlatList
//             data={filteredLinked}
//             keyExtractor={(item) => item.property_id}
//             renderItem={renderLinkedProperty}
//             contentContainerStyle={styles.list}
//             refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//           />
//         )
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F5F7FA' },
//   centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   tabBar: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: 14,
//     alignItems: 'center',
//   },
//   activeTab: {
//     borderBottomWidth: 2,
//     borderBottomColor: COLORS.primary,
//   },
//   tabText: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#888',
//   },
//   activeTabText: {
//     color: COLORS.primary,
//     fontWeight: '600',
//   },
//   filters: {
//     flexDirection: 'row',
//     padding: 12,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     zIndex: 10,
//     elevation: 5,
//   },
//   pickerWrapper: {
//     flex: 1,
//     marginHorizontal: 4,
//   },
//   list: { padding: 16, paddingBottom: 30 },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   avatar: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: COLORS.primary,
//     marginRight: 12,
//   },
//   emailAvatar: {
//     backgroundColor: COLORS.gray,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerText: { flex: 1 },
//   primaryName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 4,
//   },
//   propertyName: {
//     fontSize: 14,
//     color: '#666',
//   },
//   statusBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     borderWidth: 1,
//   },
//   statusText: {
//     fontSize: 10,
//     fontWeight: 'bold',
//   },
//   cardFooter: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     borderTopWidth: 1,
//     borderTopColor: '#F0F0F0',
//     paddingTop: 12,
//   },
//   expiry: {
//     fontSize: 12,
//     color: '#888',
//   },
//   actions: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   actionBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     borderWidth: 1,
//     marginLeft: 8,
//   },
//   resendBtn: {
//     borderColor: COLORS.primary,
//   },
//   resendText: {
//     color: COLORS.primary,
//     fontSize: 12,
//     fontWeight: '600',
//     marginLeft: 4,
//   },
//   cancelBtn: {
//     borderColor: COLORS.error,
//   },
//   cancelText: {
//     color: COLORS.error,
//     fontSize: 12,
//     fontWeight: '600',
//     marginLeft: 4,
//   },
//   disabled: { opacity: 0.5 },
//   contactRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 8,
//     paddingTop: 8,
//     borderTopWidth: 1,
//     borderTopColor: '#F0F0F0',
//   },
//   contactText: {
//     fontSize: 12,
//     color: '#666',
//     marginLeft: 6,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333',
//     marginTop: 16,
//   },
//   emptySubText: {
//     fontSize: 14,
//     color: '#888',
//     textAlign: 'center',
//     marginTop: 8,
//   },
//   propertyGroup: {
//     marginBottom: 20,
//   },
//   propertyGroupTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 10,
//     paddingHorizontal: 4,
//   },
//   cleanerCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.03,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   cleanerAvatar: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     marginRight: 12,
//     backgroundColor: COLORS.gray,
//   },
//   cleanerInfo: {
//     flex: 1,
//   },
//   cleanerName: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 4,
//   },
//   cleanerContact: {
//     fontSize: 12,
//     color: '#666',
//   },
//   cleanerMeta: {
//     alignItems: 'flex-end',
//   },
//   cleanerType: {
//     fontSize: 10,
//     fontWeight: '600',
//     color: COLORS.primary,
//     backgroundColor: '#F0F5FF',
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 10,
//     overflow: 'hidden',
//     marginBottom: 4,
//   },
//   linkedDate: {
//     fontSize: 10,
//     color: '#888',
//     marginBottom: 4,
//   },
//   unlinkButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 4,
//   },
//   unlinkText: {
//     fontSize: 12,
//     color: COLORS.error,
//     marginLeft: 4,
//   },
//   unlinkLoader: {
//     marginTop: 4,
//     alignSelf: 'flex-end',
//   },
// });


import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from 'react';

import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
  StatusBar,
  Platform,
} from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { formatDistanceToNow, format, isValid } from 'date-fns';

import { AuthContext } from '../../context/AuthContext';
import userService from '../../services/connection/userService';

import { useTheme } from '../../theme';
import { AppText } from '../../ui';

import FloatingLabelPickerSelect from '../../components/shared/FloatingLabelPicker';
import { tSafe } from '../../utils/tSafe';

const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=Cleaner&background=E8F4FA&color=00416A';

const TAB_PENDING = 'pending';
const TAB_LINKED = 'linked';

const normalizeId = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
};

const getInviteId = (invite) =>
  normalizeId(invite?._id ?? invite?.id);

const getPropertyId = (property) =>
  normalizeId(property?.property_id ?? property?.propertyId ?? property?.id);

const getCleanerId = (cleaner) =>
  normalizeId(cleaner?.cleaner_id ?? cleaner?.cleanerId ?? cleaner?.id);

const getSafeDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return isValid(date) ? date : null;
};

const getDisplayName = (cleaner) => {
  const firstName = cleaner?.firstname || '';
  const lastName = cleaner?.lastname || '';

  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || cleaner?.name || cleaner?.email || 'Cleaner';
};

const getInitials = (value) => {
  if (!value) {
    return 'C';
  }

  const words = String(value)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return 'C';
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
};

export default function TeamManagement() {
  const { currentUserId, userToken } = useContext(AuthContext);

  const { theme, isDark } = useTheme();

  const styles = useMemo(
    () => createStyles(theme, isDark),
    [theme, isDark]
  );

  const [activeTab, setActiveTab] = useState(TAB_PENDING);

  // Pending invitations.
  const [invites, setInvites] = useState([]);
  const [properties, setProperties] = useState([]);

  const [selectedProperty, setSelectedProperty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Linked cleaners.
  const [linkedData, setLinkedData] = useState([]);
  const [selectedLinkedProperty, setSelectedLinkedProperty] =
    useState('all');

  // Loading and action states.
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [processingId, setProcessingId] = useState(null);
  const [unlinkingId, setUnlinkingId] = useState(null);

  const [loadError, setLoadError] = useState(false);

  const statusItems = useMemo(
    () => [
      {
        label: tSafe('all_status', 'All Status'),
        value: 'all',
      },
      {
        label: tSafe('status_pending', 'Pending'),
        value: 'pending',
      },
      {
        label: tSafe('status_accepted', 'Accepted'),
        value: 'accepted',
      },
      {
        label: tSafe('status_declined', 'Declined'),
        value: 'declined',
      },
      {
        label: tSafe('status_expired', 'Expired'),
        value: 'expired',
      },
    ],
    []
  );

  const propertyItems = useMemo(() => {
    const uniqueProperties = new Map();

    properties.forEach((property) => {
      const id = normalizeId(property.id);

      if (!id || id === 'all') {
        return;
      }

      if (!uniqueProperties.has(id)) {
        uniqueProperties.set(id, {
          label: property.name || id,
          value: id,
        });
      }
    });

    return [
      {
        label: tSafe('all_properties', 'All Properties'),
        value: 'all',
      },
      ...Array.from(uniqueProperties.values()),
    ];
  }, [properties]);

  const linkedPropertyItems = useMemo(() => {
    const uniqueProperties = new Map();

    linkedData.forEach((property) => {
      const id = getPropertyId(property);

      if (!id || id === 'all') {
        return;
      }

      if (!uniqueProperties.has(id)) {
        uniqueProperties.set(id, {
          label: property.property_name || id,
          value: id,
        });
      }
    });

    return [
      {
        label: tSafe('all_properties', 'All Properties'),
        value: 'all',
      },
      ...Array.from(uniqueProperties.values()),
    ];
  }, [linkedData]);

  const filteredInvites = useMemo(() => {
    return invites.filter((invite) => {
      const propertyId = normalizeId(invite.property_id);

      const matchesProperty =
        selectedProperty === 'all' ||
        propertyId === normalizeId(selectedProperty);

      const matchesStatus =
        selectedStatus === 'all' ||
        String(invite.status || '').toLowerCase() ===
          String(selectedStatus).toLowerCase();

      return matchesProperty && matchesStatus;
    });
  }, [invites, selectedProperty, selectedStatus]);

  const filteredLinked = useMemo(() => {
    const filtered = linkedData.filter((property) => {
      return (
        selectedLinkedProperty === 'all' ||
        getPropertyId(property) ===
          normalizeId(selectedLinkedProperty)
      );
    });

    const uniqueProperties = new Map();

    filtered.forEach((property) => {
      const propertyId = getPropertyId(property);

      if (!propertyId) {
        return;
      }

      if (!uniqueProperties.has(propertyId)) {
        uniqueProperties.set(propertyId, {
          ...property,
          property_id: propertyId,
          cleaners: Array.isArray(property.cleaners)
            ? property.cleaners
            : [],
        });
      }
    });

    return Array.from(uniqueProperties.values());
  }, [linkedData, selectedLinkedProperty]);

  const fetchAllData = useCallback(
    async ({ showError = true } = {}) => {
      if (!currentUserId || !userToken) {
        setInvites([]);
        setProperties([]);
        setLinkedData([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        setLoadError(false);

        const [invitesRes, linkedRes] = await Promise.all([
          userService.getHostInvites(userToken, currentUserId),
          userService.getLinkedCleaners(userToken, currentUserId),
        ]);

        const invitesData = Array.isArray(invitesRes?.data)
          ? invitesRes.data
          : [];

        const linkedResponseData = Array.isArray(linkedRes?.data)
          ? linkedRes.data
          : [];

        setInvites(invitesData);

        // Build a unique property list from invitations.
        const propertyMap = new Map();

        invitesData.forEach((invite) => {
          const propertyId = normalizeId(invite.property_id);

          if (!propertyId || propertyId === 'all') {
            return;
          }

          if (!propertyMap.has(propertyId)) {
            propertyMap.set(propertyId, {
              id: propertyId,
              name: invite.property_name || propertyId,
            });
          }
        });

        setProperties(Array.from(propertyMap.values()));

        // Keep the selected filters valid after a refresh.
        const availableInvitePropertyIds = new Set(
          Array.from(propertyMap.keys())
        );

        if (
          selectedProperty !== 'all' &&
          !availableInvitePropertyIds.has(
            normalizeId(selectedProperty)
          )
        ) {
          setSelectedProperty('all');
        }

        const availableLinkedPropertyIds = new Set(
          linkedResponseData.map((property) =>
            getPropertyId(property)
          )
        );

        if (
          selectedLinkedProperty !== 'all' &&
          !availableLinkedPropertyIds.has(
            normalizeId(selectedLinkedProperty)
          )
        ) {
          setSelectedLinkedProperty('all');
        }

        // Normalize linked-property records without changing
        // the backend response or cleaner identifiers.
        const normalizedLinkedData = linkedResponseData.map(
          (property) => ({
            ...property,
            property_id: getPropertyId(property),
            cleaners: Array.isArray(property.cleaners)
              ? property.cleaners
              : [],
          })
        );

        setLinkedData(normalizedLinkedData);
      } catch (error) {
        console.error('Failed to fetch team data:', error);

        setLoadError(true);

        if (showError) {
          Alert.alert(
            tSafe('error_title', 'Error'),
            tSafe(
              'could_not_load_team',
              'Could not load team information'
            )
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      currentUserId,
      userToken,
      selectedProperty,
      selectedLinkedProperty,
    ]
  );

  useEffect(() => {
    fetchAllData();

    // Initial screen load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, userToken]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllData();
  }, [fetchAllData]);

  const triggerHaptic = useCallback(async (type) => {
    try {
      await Haptics.notificationAsync(type);
    } catch (error) {
      // Haptics may be unavailable on some devices.
    }
  }, []);

  const getStatusColors = useCallback(
    (status) => {
      switch (String(status || '').toLowerCase()) {
        case 'pending':
          return {
            background: isDark ? '#3A2C17' : '#FFF4DF',
            border: isDark ? '#8A6327' : '#F2C66D',
            text: isDark ? '#FFD58A' : '#80520A',
            icon: 'schedule',
          };

        case 'accepted':
          return {
            background: isDark ? '#163629' : '#E8F7EE',
            border: isDark ? '#2C7650' : '#A7DDBB',
            text: isDark ? '#8FE0AE' : '#216B42',
            icon: 'check-circle',
          };

        case 'declined':
          return {
            background: isDark ? '#3B2027' : '#FDECEF',
            border: isDark ? '#843B49' : '#F2B5C0',
            text: isDark ? '#FF9DAD' : '#A52940',
            icon: 'cancel',
          };

        case 'expired':
        case 'cancelled':
          return {
            background: theme.background.sunken,
            border: theme.border.default,
            text: theme.text.secondary,
            icon: 'history',
          };

        default:
          return {
            background: theme.surface.default,
            border: theme.border.default,
            text: theme.text.secondary,
            icon: 'info-outline',
          };
      }
    },
    [isDark, theme]
  );

  const handleResend = useCallback(
    (invite) => {
      const inviteId = getInviteId(invite);

      if (!inviteId) {
        Alert.alert(
          tSafe('error_title', 'Error'),
          tSafe(
            'invalid_invitation',
            'The invitation could not be identified.'
          )
        );
        return;
      }

      const isEmailInvite = invite.type === 'email';

      const recipient = isEmailInvite
        ? invite.email
        : invite.cleaner_name;

      Alert.alert(
        tSafe('resend_invitation_title', 'Resend Invitation'),
        isEmailInvite
          ? tSafe(
              'resend_invite_email',
              'Resend invitation to {email}?',
              { email: recipient || '' }
            )
          : tSafe(
              'resend_invite_platform',
              'Send a new notification to {name}?',
              { name: recipient || 'cleaner' }
            ),
        [
          {
            text: tSafe('cancel', 'Cancel'),
            style: 'cancel',
          },
          {
            text: tSafe('resend', 'Resend'),
            onPress: async () => {
              setProcessingId(inviteId);

              const payload = {
                inviteId,
                hostId: currentUserId,
              };

              try {
                if (isEmailInvite) {
                  await userService.resendInvite(payload);
                } else if (invite.type === 'platform') {
                  await userService.resendPlatformInvite(payload);
                } else {
                  throw new Error('Unsupported invitation type');
                }

                await triggerHaptic(
                  Haptics.NotificationFeedbackType.Success
                );

                Alert.alert(
                  tSafe('success_title', 'Success'),
                  isEmailInvite
                    ? tSafe(
                        'invitation_resent',
                        'Invitation resent'
                      )
                    : tSafe(
                        'notification_resent',
                        'Notification resent'
                      )
                );

                await fetchAllData({ showError: false });
              } catch (error) {
                console.error('Failed to resend invitation:', error);

                Alert.alert(
                  tSafe('error_title', 'Error'),
                  tSafe(
                    'failed_resend',
                    'Failed to resend invitation'
                  )
                );
              } finally {
                setProcessingId(null);
              }
            },
          },
        ]
      );
    },
    [currentUserId, fetchAllData, triggerHaptic]
  );

  const handleCancel = useCallback(
    (invite) => {
      const inviteId = getInviteId(invite);

      if (!inviteId) {
        Alert.alert(
          tSafe('error_title', 'Error'),
          tSafe(
            'invalid_invitation',
            'The invitation could not be identified.'
          )
        );
        return;
      }

      const recipient =
        invite.type === 'platform'
          ? invite.cleaner_name
          : invite.email;

      Alert.alert(
        tSafe('cancel_invitation_title', 'Cancel Invitation'),
        tSafe(
          'cancel_invite_message',
          'Cancel invitation to {name}?',
          { name: recipient || 'this recipient' }
        ),
        [
          {
            text: tSafe('no', 'No'),
            style: 'cancel',
          },
          {
            text: tSafe('yes_cancel', 'Yes, Cancel'),
            style: 'destructive',
            onPress: async () => {
              setProcessingId(inviteId);

              const payload = {
                inviteId,
                hostId: currentUserId,
              };

              try {
                await userService.cancelInvite(payload);

                await triggerHaptic(
                  Haptics.NotificationFeedbackType.Warning
                );

                setInvites((previous) =>
                  previous.filter(
                    (item) => getInviteId(item) !== inviteId
                  )
                );

                Alert.alert(
                  tSafe('success_title', 'Success'),
                  tSafe(
                    'invitation_cancelled',
                    'Invitation cancelled'
                  )
                );
              } catch (error) {
                console.error(
                  'Failed to cancel invitation:',
                  error
                );

                Alert.alert(
                  tSafe('error_title', 'Error'),
                  tSafe(
                    'failed_cancel',
                    'Failed to cancel invitation'
                  )
                );
              } finally {
                setProcessingId(null);
              }
            },
          },
        ]
      );
    },
    [currentUserId, triggerHaptic]
  );

  const handleUnlinkCleaner = useCallback(
    (propertyId, cleanerId) => {
      if (!propertyId || !cleanerId) {
        Alert.alert(
          tSafe('error_title', 'Error'),
          tSafe(
            'invalid_cleaner',
            'The cleaner or property could not be identified.'
          )
        );
        return;
      }

      Alert.alert(
        tSafe('unlink_cleaner_title', 'Unlink Cleaner'),
        tSafe(
          'unlink_cleaner_message',
          'Are you sure you want to remove this cleaner from your property?'
        ),
        [
          {
            text: tSafe('cancel', 'Cancel'),
            style: 'cancel',
          },
          {
            text: tSafe('unlink', 'Unlink'),
            style: 'destructive',
            onPress: async () => {
              setUnlinkingId(cleanerId);

              const payload = {
                property_id: propertyId,
                cleaner_id: cleanerId,
              };

              try {
                await userService.unlinkCleaner(
                  payload,
                  userToken
                );

                await triggerHaptic(
                  Haptics.NotificationFeedbackType.Warning
                );

                setLinkedData((previous) =>
                  previous.map((property) => {
                    if (
                      getPropertyId(property) !==
                      normalizeId(propertyId)
                    ) {
                      return property;
                    }

                    return {
                      ...property,
                      cleaners: (
                        Array.isArray(property.cleaners)
                          ? property.cleaners
                          : []
                      ).filter(
                        (cleaner) =>
                          getCleanerId(cleaner) !==
                          normalizeId(cleanerId)
                      ),
                    };
                  })
                );

                Alert.alert(
                  tSafe('success_title', 'Success'),
                  tSafe(
                    'cleaner_unlinked',
                    'Cleaner unlinked successfully'
                  )
                );
              } catch (error) {
                console.error('Failed to unlink cleaner:', error);

                Alert.alert(
                  tSafe('error_title', 'Error'),
                  tSafe(
                    'failed_unlink',
                    'Failed to unlink cleaner'
                  )
                );
              } finally {
                setUnlinkingId(null);
              }
            },
          },
        ]
      );
    },
    [userToken, triggerHaptic]
  );

  const renderStatusBadge = (status) => {
    const colors = getStatusColors(status);

    return (
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
      >
        <MaterialIcons
          name={colors.icon}
          size={12}
          color={colors.text}
        />

        <AppText
          variant="caption"
          weight="bold"
          color={colors.text}
          style={styles.statusText}
        >
          {String(status || 'unknown').toUpperCase()}
        </AppText>
      </View>
    );
  };

  const renderInviteItem = ({ item }) => {
    const inviteId = getInviteId(item);
    const isProcessing = processingId === inviteId;
    const isPending =
      String(item.status || '').toLowerCase() === 'pending';

    const isPlatformInvite = item.type === 'platform';

    const inviteName = isPlatformInvite
      ? item.cleaner_name || 'Cleaner'
      : item.email || 'Email invitation';

    const expiresAt = getSafeDate(item.expires_at);

    let expiresText = '';

    if (isPending && expiresAt) {
      try {
        expiresText = formatDistanceToNow(expiresAt, {
          addSuffix: true,
        });
      } catch (error) {
        expiresText = '';
      }
    }

    return (
      <View style={styles.inviteCard}>
        <View style={styles.cardHeader}>
          {isPlatformInvite ? (
            <Image
              source={{
                uri: item.cleaner_avatar || DEFAULT_AVATAR,
              }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.emailAvatar}>
              <MaterialIcons
                name="email"
                size={22}
                color={theme.icon.inverse}
              />
            </View>
          )}

          <View style={styles.headerText}>
            <AppText
              variant="subtitle"
              weight="semibold"
              color={theme.text.primary}
              numberOfLines={1}
            >
              {inviteName}
            </AppText>

            <AppText
              variant="body"
              color={theme.text.secondary}
              numberOfLines={1}
              style={styles.propertyName}
            >
              {item.property_name ||
                tSafe('unknown_property', 'Property')}
            </AppText>
          </View>

          {renderStatusBadge(item.status)}
        </View>

        {isPending && expiresText ? (
          <View style={styles.expiryRow}>
            <MaterialIcons
              name="schedule"
              size={15}
              color={theme.icon.muted}
            />

            <AppText
              variant="caption"
              color={theme.text.secondary}
              style={styles.expiryText}
            >
              {tSafe('expires', 'Expires')} {expiresText}
            </AppText>
          </View>
        ) : null}

        {item.type === 'email' && item.email ? (
          <View style={styles.contactRow}>
            <MaterialIcons
              name="email"
              size={15}
              color={theme.icon.muted}
            />

            <AppText
              variant="body"
              color={theme.text.secondary}
              numberOfLines={2}
              style={styles.contactText}
            >
              {item.email}
            </AppText>
          </View>
        ) : null}

        {isPlatformInvite && item.cleaner_phone ? (
          <View style={styles.contactRow}>
            <MaterialIcons
              name="phone"
              size={15}
              color={theme.icon.muted}
            />

            <AppText
              variant="body"
              color={theme.text.secondary}
              style={styles.contactText}
            >
              {item.cleaner_phone}
            </AppText>
          </View>
        ) : null}

        {isPending ? (
          <View style={styles.cardActions}>
            {item.type === 'email' ||
            item.type === 'platform' ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={tSafe(
                  'resend',
                  'Resend'
                )}
                style={[
                  styles.actionButton,
                  styles.resendButton,
                  isProcessing && styles.disabledButton,
                ]}
                onPress={() => handleResend(item)}
                disabled={isProcessing}
                activeOpacity={0.75}
              >
                <MaterialIcons
                  name="refresh"
                  size={17}
                  color={theme.brand.primary}
                />

                <AppText
                  variant="label"
                  color={theme.brand.primary}
                  style={styles.actionButtonText}
                >
                  {tSafe('resend', 'Resend')}
                </AppText>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={tSafe(
                'cancel',
                'Cancel'
              )}
              style={[
                styles.actionButton,
                styles.cancelButton,
                isProcessing && styles.disabledButton,
              ]}
              onPress={() => handleCancel(item)}
              disabled={isProcessing}
              activeOpacity={0.75}
            >
              <MaterialIcons
                name="close"
                size={17}
                color={theme.status.error}
              />

              <AppText
                variant="label"
                color={theme.status.error}
                style={styles.actionButtonText}
              >
                {tSafe('cancel', 'Cancel')}
              </AppText>
            </TouchableOpacity>

            {isProcessing ? (
              <ActivityIndicator
                size="small"
                color={theme.brand.primary}
                style={styles.actionLoader}
              />
            ) : null}
          </View>
        ) : null}
      </View>
    );
  };

  const renderLinkedProperty = ({ item }) => {
    const cleaners = Array.isArray(item.cleaners)
      ? item.cleaners
      : [];

    const uniqueCleaners = [];
    const seenCleanerIds = new Set();

    cleaners.forEach((cleaner, index) => {
      const cleanerId = getCleanerId(cleaner);

      // Preserve entries without an ID by assigning a local key.
      const key = cleanerId || `unknown-cleaner-${index}`;

      if (seenCleanerIds.has(key)) {
        return;
      }

      seenCleanerIds.add(key);

      uniqueCleaners.push({
        ...cleaner,
        cleaner_id: cleanerId || key,
      });
    });

    return (
      <View style={styles.propertyGroup}>
        <View style={styles.propertyHeader}>
          <View style={styles.propertyIcon}>
            <MaterialIcons
              name="home-work"
              size={21}
              color={theme.brand.primary}
            />
          </View>

          <View style={styles.propertyHeaderText}>
            <AppText
              variant="title"
              color={theme.text.primary}
              weight="semibold"
              numberOfLines={2}
            >
              {item.property_name ||
                tSafe('unknown_property', 'Property')}
            </AppText>

            <AppText
              variant="caption"
              color={theme.text.secondary}
              style={styles.propertyCount}
            >
              {uniqueCleaners.length}{' '}
              {uniqueCleaners.length === 1
                ? tSafe('cleaner', 'cleaner')
                : tSafe('cleaners', 'cleaners')}
            </AppText>
          </View>
        </View>

        {uniqueCleaners.length === 0 ? (
          <View style={styles.noCleanersBox}>
            <MaterialIcons
              name="person-off"
              size={23}
              color={theme.icon.muted}
            />

            <AppText
              variant="body"
              color={theme.text.secondary}
              style={styles.noCleanersText}
            >
              {tSafe(
                'no_linked_cleaners',
                'No linked cleaners'
              )}
            </AppText>
          </View>
        ) : (
          uniqueCleaners.map((cleaner, index) => {
            const cleanerId = getCleanerId(cleaner);
            const displayName = getDisplayName(cleaner);
            const isUnlinking =
              unlinkingId === cleanerId;

            const linkedDate = getSafeDate(
              cleaner.linked_at
            );

            return (
              <View
                key={
                  cleanerId ||
                  `${item.property_id}-cleaner-${index}`
                }
                style={styles.cleanerCard}
              >
                {cleaner.avatar ? (
                  <Image
                    source={{ uri: cleaner.avatar }}
                    style={styles.cleanerAvatar}
                  />
                ) : (
                  <View style={styles.initialsAvatar}>
                    <AppText
                      variant="subtitle"
                      weight="bold"
                      color={theme.brand.primary}
                    >
                      {getInitials(displayName)}
                    </AppText>
                  </View>
                )}

                <View style={styles.cleanerInfo}>
                  <AppText
                    variant="subtitle"
                    color={theme.text.primary}
                    weight="semibold"
                    numberOfLines={2}
                  >
                    {displayName}
                  </AppText>

                  {cleaner.email ? (
                    <AppText
                      variant="caption"
                      color={theme.text.secondary}
                      numberOfLines={2}
                      style={styles.cleanerContact}
                    >
                      {cleaner.email}
                    </AppText>
                  ) : null}

                  {cleaner.phone ? (
                    <AppText
                      variant="caption"
                      color={theme.text.secondary}
                      style={styles.cleanerContact}
                    >
                      {cleaner.phone}
                    </AppText>
                  ) : null}

                  {linkedDate ? (
                    <View style={styles.linkedDateRow}>
                      <MaterialIcons
                        name="calendar-today"
                        size={12}
                        color={theme.icon.muted}
                      />

                      <AppText
                        variant="caption"
                        color={theme.text.muted}
                        style={styles.linkedDate}
                      >
                        {tSafe('linked', 'Linked')}{' '}
                        {format(linkedDate, 'MMM d, yyyy')}
                      </AppText>
                    </View>
                  ) : null}
                </View>

                <View style={styles.cleanerMeta}>
                  {cleaner.type ? (
                    <View style={styles.cleanerTypeBadge}>
                      <AppText
                        variant="caption"
                        color={theme.brand.primary}
                        weight="semibold"
                        numberOfLines={1}
                      >
                        {String(cleaner.type)}
                      </AppText>
                    </View>
                  ) : null}

                  {isUnlinking ? (
                    <ActivityIndicator
                      size="small"
                      color={theme.status.error}
                      style={styles.unlinkLoader}
                    />
                  ) : (
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={tSafe(
                        'unlink_cleaner_accessibility',
                        'Unlink {name}',
                        { name: displayName }
                      )}
                      style={styles.unlinkButton}
                      onPress={() =>
                        handleUnlinkCleaner(
                          item.property_id,
                          cleanerId
                        )
                      }
                      disabled={!cleanerId}
                      activeOpacity={0.75}
                    >
                      <MaterialIcons
                        name="link-off"
                        size={16}
                        color={theme.status.error}
                      />

                      <AppText
                        variant="caption"
                        color={theme.status.error}
                        weight="semibold"
                        style={styles.unlinkText}
                      >
                        {tSafe('unlink', 'Unlink')}
                      </AppText>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>
    );
  };

  const renderEmptyState = ({
    icon,
    title,
    description,
    action,
  }) => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <MaterialIcons
          name={icon}
          size={38}
          color={theme.brand.primary}
        />
      </View>

      <AppText
        variant="title"
        color={theme.text.primary}
        weight="semibold"
        align="center"
        style={styles.emptyTitle}
      >
        {title}
      </AppText>

      <AppText
        variant="body"
        color={theme.text.secondary}
        align="center"
        style={styles.emptyDescription}
      >
        {description}
      </AppText>

      {action ? (
        <TouchableOpacity
          style={styles.emptyAction}
          onPress={action.onPress}
          activeOpacity={0.75}
        >
          <MaterialIcons
            name={action.icon || 'refresh'}
            size={17}
            color={theme.brand.primary}
          />

          <AppText
            variant="label"
            color={theme.brand.primary}
            style={styles.emptyActionText}
          >
            {action.label}
          </AppText>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background.default}
        />

        <ActivityIndicator
          size="large"
          color={theme.brand.primary}
        />

        <AppText
          variant="body"
          color={theme.text.secondary}
          style={styles.loadingText}
        >
          {tSafe('loading_team', 'Loading your team...')}
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background.default}
      />

      {/* Header */}
      <View style={styles.screenHeader}>
        <View style={styles.screenTitleRow}>
          <View style={styles.screenTitleIcon}>
            <MaterialIcons
              name="groups"
              size={25}
              color={theme.icon.inverse}
            />
          </View>

          <View style={styles.screenTitleContent}>
            <AppText
              variant="heading"
              color={theme.text.primary}
              weight="bold"
            >
              {tSafe('cleaner_management', 'Cleaner Management')}
            </AppText>

            <AppText
              variant="caption"
              color={theme.text.secondary}
              style={styles.screenSubtitle}
            >
              {tSafe(
                'team_management_subtitle',
                'Manage invitations and property cleaners'
              )}
            </AppText>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          accessibilityRole="tab"
          accessibilityState={{
            selected: activeTab === TAB_PENDING,
          }}
          style={[
            styles.tab,
            activeTab === TAB_PENDING && styles.activeTab,
          ]}
          onPress={() => setActiveTab(TAB_PENDING)}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="mail-outline"
            size={18}
            color={
              activeTab === TAB_PENDING
                ? theme.brand.primary
                : theme.icon.muted
            }
          />

          <AppText
            variant="label"
            color={
              activeTab === TAB_PENDING
                ? theme.brand.primary
                : theme.text.secondary
            }
            weight={
              activeTab === TAB_PENDING ? 'bold' : 'medium'
            }
            style={styles.tabText}
          >
            {tSafe('pending_invites', 'Pending Invites')}
          </AppText>

          {invites.filter(
            (invite) =>
              String(invite.status || '').toLowerCase() ===
              'pending'
          ).length > 0 ? (
            <View style={styles.tabCountBadge}>
              <AppText
                variant="caption"
                color={theme.button.primaryText}
                weight="bold"
              >
                {
                  invites.filter(
                    (invite) =>
                      String(
                        invite.status || ''
                      ).toLowerCase() === 'pending'
                  ).length
                }
              </AppText>
            </View>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="tab"
          accessibilityState={{
            selected: activeTab === TAB_LINKED,
          }}
          style={[
            styles.tab,
            activeTab === TAB_LINKED && styles.activeTab,
          ]}
          onPress={() => setActiveTab(TAB_LINKED)}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="people-outline"
            size={18}
            color={
              activeTab === TAB_LINKED
                ? theme.brand.primary
                : theme.icon.muted
            }
          />

          <AppText
            variant="label"
            color={
              activeTab === TAB_LINKED
                ? theme.brand.primary
                : theme.text.secondary
            }
            weight={
              activeTab === TAB_LINKED ? 'bold' : 'medium'
            }
            style={styles.tabText}
          >
            {tSafe('linked_cleaners', 'Linked Cleaners')}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Pending invitation filters */}
      {activeTab === TAB_PENDING ? (
        <View style={styles.filters}>
          <View style={styles.pickerWrapper}>
            <FloatingLabelPickerSelect
              label={tSafe('property', 'Property')}
              items={propertyItems}
              value={selectedProperty}
              onValueChange={setSelectedProperty}
              placeholder={{
                label: tSafe(
                  'select_property',
                  'Select Property'
                ),
                value: null,
              }}
              styleOverrides={{
                inputIOS: {
                  color: theme.input.text,
                  fontSize: 14,
                  paddingVertical: 12,
                },
                inputAndroid: {
                  color: theme.input.text,
                  fontSize: 14,
                  paddingVertical: 12,
                },
              }}
            />
          </View>

          <View style={styles.pickerWrapper}>
            <FloatingLabelPickerSelect
              label={tSafe('status', 'Status')}
              items={statusItems}
              value={selectedStatus}
              onValueChange={setSelectedStatus}
              placeholder={{
                label: tSafe(
                  'select_status',
                  'Select Status'
                ),
                value: null,
              }}
              styleOverrides={{
                inputIOS: {
                  color: theme.input.text,
                  fontSize: 14,
                  paddingVertical: 12,
                },
                inputAndroid: {
                  color: theme.input.text,
                  fontSize: 14,
                  paddingVertical: 12,
                },
              }}
            />
          </View>
        </View>
      ) : null}

      {/* Linked cleaner filters */}
      {activeTab === TAB_LINKED ? (
        <View style={styles.filters}>
          <View style={styles.linkedPickerWrapper}>
            <FloatingLabelPickerSelect
              label={tSafe('property', 'Property')}
              items={linkedPropertyItems}
              value={selectedLinkedProperty}
              onValueChange={setSelectedLinkedProperty}
              placeholder={{
                label: tSafe(
                  'select_property',
                  'Select Property'
                ),
                value: null,
              }}
              styleOverrides={{
                inputIOS: {
                  color: theme.input.text,
                  fontSize: 14,
                  paddingVertical: 12,
                },
                inputAndroid: {
                  color: theme.input.text,
                  fontSize: 14,
                  paddingVertical: 12,
                },
              }}
            />
          </View>
        </View>
      ) : null}

      {/* Data loading error */}
      {loadError ? (
        <View style={styles.errorBanner}>
          <MaterialIcons
            name="cloud-off"
            size={19}
            color={theme.status.error}
          />

          <AppText
            variant="body"
            color={theme.status.error}
            style={styles.errorBannerText}
          >
            {tSafe(
              'team_load_error',
              'Some team information could not be loaded.'
            )}
          </AppText>

          <TouchableOpacity
            onPress={() => fetchAllData()}
            style={styles.retryButton}
          >
            <AppText
              variant="label"
              color={theme.status.error}
            >
              {tSafe('retry', 'Retry')}
            </AppText>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Pending invitations */}
      {activeTab === TAB_PENDING ? (
        filteredInvites.length === 0 ? (
          <FlatList
            data={[]}
            renderItem={() => null}
            keyExtractor={(_, index) => String(index)}
            contentContainerStyle={styles.emptyListContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.brand.primary}
                colors={[theme.brand.primary]}
                progressBackgroundColor={
                  theme.surface.elevated
                }
              />
            }
            ListEmptyComponent={() =>
              renderEmptyState({
                icon: 'mark-email-read',
                title: tSafe(
                  'no_pending_invites',
                  'No invitations found'
                ),
                description:
                  selectedProperty !== 'all' ||
                  selectedStatus !== 'all'
                    ? tSafe(
                        'no_invites_matching_filters',
                        'Try changing your filters to see more invitations.'
                      )
                    : tSafe(
                        'no_invites_description',
                        'Invitations you send to cleaners will appear here.'
                      ),
              })
            }
          />
        ) : (
          <FlatList
            data={filteredInvites}
            keyExtractor={(item, index) =>
              getInviteId(item) || `invite-${index}`
            }
            renderItem={renderInviteItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.brand.primary}
                colors={[theme.brand.primary]}
                progressBackgroundColor={
                  theme.surface.elevated
                }
              />
            }
          />
        )
      ) : null}

      {/* Linked cleaners */}
      {activeTab === TAB_LINKED ? (
        filteredLinked.length === 0 ? (
          <FlatList
            data={[]}
            renderItem={() => null}
            keyExtractor={(_, index) => String(index)}
            contentContainerStyle={styles.emptyListContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.brand.primary}
                colors={[theme.brand.primary]}
                progressBackgroundColor={
                  theme.surface.elevated
                }
              />
            }
            ListEmptyComponent={() =>
              renderEmptyState({
                icon: 'people-outline',
                title: tSafe(
                  'no_linked_cleaners',
                  'No linked cleaners yet'
                ),
                description:
                  selectedLinkedProperty !== 'all'
                    ? tSafe(
                        'no_linked_cleaners_for_property',
                        'There are no linked cleaners for this property.'
                      )
                    : tSafe(
                        'no_linked_cleaners_description',
                        'Cleaners linked to your properties will appear here.'
                      ),
              })
            }
          />
        ) : (
          <FlatList
            data={filteredLinked}
            keyExtractor={(item, index) =>
              getPropertyId(item) || `property-${index}`
            }
            renderItem={renderLinkedProperty}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.brand.primary}
                colors={[theme.brand.primary]}
                progressBackgroundColor={
                  theme.surface.elevated
                }
              />
            }
          />
        )
      ) : null}
    </View>
  );
}

const createStyles = (theme, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background.default,
    },

    loadingText: {
      marginTop: 14,
    },

    screenHeader: {
      paddingHorizontal: 18,
      paddingTop: Platform.OS === 'ios' ? 12 : 16,
      paddingBottom: 17,
      backgroundColor: theme.background.default,
    },

    screenTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    screenTitleIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: theme.brand.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 13,
    },

    screenTitleContent: {
      flex: 1,
    },

    screenSubtitle: {
      marginTop: 3,
      lineHeight: 18,
    },

    tabBar: {
      flexDirection: 'row',
      backgroundColor: theme.surface.default,
      borderTopWidth: 1,
      borderTopColor: theme.border.default,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.default,
      paddingHorizontal: 8,
    },

    tab: {
      flex: 1,
      minHeight: 54,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
      paddingVertical: 12,
      borderBottomWidth: 3,
      borderBottomColor: 'transparent',
    },

    activeTab: {
      borderBottomColor: theme.brand.primary,
    },

    tabText: {
      marginLeft: 7,
      flexShrink: 1,
      textAlign: 'center',
    },

    tabCountBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      paddingHorizontal: 5,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.brand.primary,
      marginLeft: 6,
    },

    filters: {
      flexDirection: 'row',
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 12,
      backgroundColor: theme.surface.default,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.default,
      zIndex: 10,
      elevation: 2,
    },

    pickerWrapper: {
      flex: 1,
      minWidth: 0,
      marginHorizontal: 4,
    },

    linkedPickerWrapper: {
      flex: 1,
      marginHorizontal: 4,
    },

    list: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 34,
    },

    inviteCard: {
      backgroundColor: theme.card.background,
      borderRadius: 18,
      padding: 16,
      marginBottom: 13,
      borderWidth: 1,
      borderColor: theme.card.border,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDark ? 0.05 : theme.shadow.opacity,
      shadowRadius: 8,
      elevation: 2,
    },

    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.surface.selected,
      marginRight: 12,
    },

    emailAvatar: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: theme.brand.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },

    headerText: {
      flex: 1,
      minWidth: 0,
      marginRight: 8,
    },

    propertyName: {
      marginTop: 4,
    },

    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      borderRadius: 10,
      borderWidth: 1,
      paddingHorizontal: 8,
      paddingVertical: 5,
    },

    statusText: {
      marginLeft: 4,
      fontSize: 9,
      letterSpacing: 0.3,
    },

    expiryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 13,
    },

    expiryText: {
      marginLeft: 6,
    },

    contactRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 10,
    },

    contactText: {
      flex: 1,
      marginLeft: 8,
    },

    cardActions: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      borderTopWidth: 1,
      borderTopColor: theme.divider,
      paddingTop: 13,
      marginTop: 13,
    },

    actionButton: {
      minHeight: 36,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      marginRight: 8,
      marginBottom: 4,
    },

    resendButton: {
      borderColor: theme.brand.primary,
      backgroundColor: theme.surface.default,
    },

    cancelButton: {
      borderColor: theme.status.error,
      backgroundColor: theme.surface.default,
    },

    actionButtonText: {
      marginLeft: 6,
    },

    actionLoader: {
      marginLeft: 4,
    },

    disabledButton: {
      opacity: 0.45,
    },

    propertyGroup: {
      marginBottom: 22,
    },

    propertyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 3,
      paddingBottom: 12,
    },

    propertyIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
      marginRight: 12,
    },

    propertyHeaderText: {
      flex: 1,
    },

    propertyCount: {
      marginTop: 3,
    },

    cleanerCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.card.background,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.card.border,
      padding: 13,
      marginBottom: 9,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.03 : theme.shadow.opacity * 0.5,
      shadowRadius: 5,
      elevation: 1,
    },

    cleanerAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: 11,
      backgroundColor: theme.surface.selected,
    },

    initialsAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
      marginRight: 11,
    },

    cleanerInfo: {
      flex: 1,
      minWidth: 0,
      paddingTop: 1,
    },

    cleanerContact: {
      marginTop: 4,
    },

    cleanerMeta: {
      alignItems: 'flex-end',
      marginLeft: 7,
      maxWidth: 105,
    },

    cleanerTypeBadge: {
      alignSelf: 'flex-end',
      maxWidth: 105,
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: theme.surface.selected,
      marginBottom: 8,
    },

    linkedDateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 7,
    },

    linkedDate: {
      marginLeft: 5,
      flexShrink: 1,
    },

    unlinkButton: {
      minHeight: 30,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 7,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: isDark
        ? 'rgba(255, 90, 110, 0.09)'
        : 'rgba(211, 47, 66, 0.06)',
    },

    unlinkText: {
      marginLeft: 4,
    },

    unlinkLoader: {
      marginTop: 6,
    },

    noCleanersBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 18,
      backgroundColor: theme.surface.default,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border.default,
      borderStyle: 'dashed',
    },

    noCleanersText: {
      marginLeft: 9,
    },

    emptyListContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingVertical: 28,
    },

    emptyContainer: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 22,
      paddingVertical: 28,
    },

    emptyIconContainer: {
      width: 78,
      height: 78,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
      marginBottom: 18,
    },

    emptyTitle: {
      textAlign: 'center',
      marginBottom: 8,
    },

    emptyDescription: {
      maxWidth: 310,
      lineHeight: 21,
      textAlign: 'center',
    },

    emptyAction: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: theme.brand.primary,
      borderRadius: 12,
      marginTop: 18,
    },

    emptyActionText: {
      marginLeft: 7,
    },

    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 11,
      marginHorizontal: 14,
      marginTop: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.status.error,
      backgroundColor: isDark
        ? 'rgba(255, 90, 110, 0.08)'
        : 'rgba(211, 47, 66, 0.05)',
    },

    errorBannerText: {
      flex: 1,
      marginHorizontal: 8,
    },

    retryButton: {
      paddingVertical: 5,
      paddingHorizontal: 7,
    },
  });