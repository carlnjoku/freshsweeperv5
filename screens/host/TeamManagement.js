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
//   TextInput,
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import { MaterialIcons } from '@expo/vector-icons';
// import * as Haptics from 'expo-haptics';
// import { AuthContext } from '../../context/AuthContext';
// import userService from '../../services/connection/userService';
// import COLORS from '../../constants/colors';
// import { formatDistanceToNow } from 'date-fns';

// export default function TeamManagement() {
//   const { currentUserId } = useContext(AuthContext);
//   const [invites, setInvites] = useState([]);
//   const [filteredInvites, setFilteredInvites] = useState([]);
//   const [properties, setProperties] = useState([]);
//   const [selectedProperty, setSelectedProperty] = useState('all');
//   const [selectedStatus, setSelectedStatus] = useState('all');
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [processingId, setProcessingId] = useState(null);

//   const fetchInvites = async () => {
//     try {
//       const response = await userService.getHostInvites();
//       const data = response.data || [];
//       setInvites(data);
//       applyFilters(data, selectedProperty, selectedStatus);
      
//       // Extract unique properties for filter dropdown
//       const props = [...new Set(data.map(i => i.property_id))].map(pid => ({
//         id: pid,
//         name: data.find(i => i.property_id === pid)?.property_name || pid
//       }));
//       setProperties([{ id: 'all', name: 'All Properties' }, ...props]);
//     } catch (error) {
//       console.error('Failed to fetch invites:', error);
//       Alert.alert('Error', 'Could not load team invitations');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     fetchInvites();
//   }, []);

//   const applyFilters = (data, propId, stat) => {
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
//     applyFilters(invites, selectedProperty, selectedStatus);
//   }, [selectedProperty, selectedStatus, invites]);

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchInvites();
//   };

//   const handleResend = async (invite) => {
//     if (invite.type !== 'email') return;
//     Alert.alert(
//       'Resend Invitation',
//       `Resend invitation to ${invite.email}?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Resend',
//           onPress: async () => {
//             setProcessingId(invite._id);
//             try {
//               await userService.resendInvite({ inviteId: invite._id });
//               Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//               Alert.alert('Success', 'Invitation resent');
//             } catch (err) {
//               console.error(err);
//               Alert.alert('Error', 'Failed to resend invitation');
//             } finally {
//               setProcessingId(null);
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleCancel = async (invite) => {
//     Alert.alert(
//       'Cancel Invitation',
//       `Are you sure you want to cancel this invitation to ${invite.type === 'platform' ? invite.cleaner_name : invite.email}?`,
//       [
//         { text: 'No', style: 'cancel' },
//         {
//           text: 'Yes, Cancel',
//           style: 'destructive',
//           onPress: async () => {
//             setProcessingId(invite._id);
//             try {
//               await userService.cancelInvite(invite._id);
//               Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
//               // Remove from list
//               setInvites(prev => prev.filter(i => i._id !== invite._id));
//             } catch (err) {
//               console.error(err);
//               Alert.alert('Error', 'Failed to cancel invitation');
//             } finally {
//               setProcessingId(null);
//             }
//           },
//         },
//       ]
//     );
//   };

//   const renderInvite = ({ item }) => {
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
//             <Text style={styles.expiry}>Expires {expiresIn}</Text>
//           )}
//           <View style={styles.actions}>
//             {item.status === 'pending' && item.type === 'email' && (
//               <TouchableOpacity
//                 style={[styles.actionBtn, styles.resendBtn, isProcessing && styles.disabled]}
//                 onPress={() => handleResend(item)}
//                 disabled={isProcessing}
//               >
//                 <MaterialIcons name="refresh" size={16} color={COLORS.primary} />
//                 <Text style={styles.resendText}>Resend</Text>
//               </TouchableOpacity>
//             )}
//             {item.status === 'pending' && (
//               <TouchableOpacity
//                 style={[styles.actionBtn, styles.cancelBtn, isProcessing && styles.disabled]}
//                 onPress={() => handleCancel(item)}
//                 disabled={isProcessing}
//               >
//                 <MaterialIcons name="close" size={16} color={COLORS.error} />
//                 <Text style={styles.cancelText}>Cancel</Text>
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

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.filters}>
//         <Picker
//           selectedValue={selectedProperty}
//           onValueChange={setSelectedProperty}
//           style={styles.picker}
//         >
//           {properties.map(p => (
//             <Picker.Item key={p.id} label={p.name} value={p.id} />
//           ))}
//         </Picker>
//         <Picker
//           selectedValue={selectedStatus}
//           onValueChange={setSelectedStatus}
//           style={styles.picker}
//         >
//           <Picker.Item label="All Status" value="all" />
//           <Picker.Item label="Pending" value="pending" />
//           <Picker.Item label="Accepted" value="accepted" />
//           <Picker.Item label="Declined" value="declined" />
//           <Picker.Item label="Expired" value="expired" />
//         </Picker>
//       </View>

//       {filteredInvites.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <MaterialIcons name="people-outline" size={64} color={COLORS.gray} />
//           <Text style={styles.emptyText}>No team invitations yet</Text>
//           <Text style={styles.emptySubText}>Invite cleaners to your properties and they'll appear here.</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={filteredInvites}
//           keyExtractor={(item) => item._id}
//           renderItem={renderInvite}
//           contentContainerStyle={styles.list}
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F5F7FA' },
//   centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   filters: {
//     flexDirection: 'row',
//     padding: 12,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   picker: {
//     flex: 1,
//     height: 40,
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
// });

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
// import { Picker } from '@react-native-picker/picker';
// import { MaterialIcons } from '@expo/vector-icons';
// import * as Haptics from 'expo-haptics';
// import { AuthContext } from '../../context/AuthContext';
// import userService from '../../services/connection/userService';
// import COLORS from '../../constants/colors';
// import { formatDistanceToNow, format } from 'date-fns';
// import FloatingLabelPickerSelect from '../../components/shared/FloatingLabelPicker';

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

//   // Prepare items for property picker (including "All Properties")
// const propertyItems = properties.map(p => ({ label: p.name, value: p.id }));

// // Status items with "All Status" as a regular item (value 'all')
// const statusItems = [
//   { label: 'All Status', value: 'all' },
//   { label: 'Pending', value: 'pending' },
//   { label: 'Accepted', value: 'accepted' },
//   { label: 'Declined', value: 'declined' },
//   { label: 'Expired', value: 'expired' },
// ];

//   const fetchAllData = async () => {
//     try {
//       const [invitesRes, linkedRes] = await Promise.all([
//         userService.getHostInvites(userToken),
//         userService.getLinkedCleaners(userToken),
//       ]);
//       const invitesData = invitesRes.data || [];
//       const linkedData = linkedRes.data || [];
      
//       setInvites(invitesData);
//       applyInviteFilters(invitesData, selectedProperty, selectedStatus);
      
//       // Extract unique properties for invite filter
//       const props = [...new Set(invitesData.map(i => i.property_id))].map(pid => ({
//         id: pid,
//         name: invitesData.find(i => i.property_id === pid)?.property_name || pid
//       }));
//       setProperties([{ id: 'all', name: 'All Properties' }, ...props]);
      
//       setLinkedData(linkedData);
//     } catch (error) {
//       console.error('Failed to fetch team data:', error);
//       Alert.alert('Error', 'Could not load team information');
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

//   // Pending invites filtering
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

//   // Linked cleaners filtering
//   const filteredLinked = selectedLinkedProperty === 'all'
//     ? linkedData
//     : linkedData.filter(p => p.property_id === selectedLinkedProperty);

//   // Pending invite actions (resend, cancel) – same as before
//   const handleResend = async (invite) => {
//     if (invite.type !== 'email') return;
//     Alert.alert(
//       'Resend Invitation',
//       `Resend invitation to ${invite.email}?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Resend',
//           onPress: async () => {
//             setProcessingId(invite._id);
//             try {
//               await userService.resendInvite({ inviteId: invite._id });
//               Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//               Alert.alert('Success', 'Invitation resent');
//             } catch (err) {
//               console.error(err);
//               Alert.alert('Error', 'Failed to resend invitation');
//             } finally {
//               setProcessingId(null);
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleCancel = async (invite) => {
//     Alert.alert(
//       'Cancel Invitation',
//       `Cancel invitation to ${invite.type === 'platform' ? invite.cleaner_name : invite.email}?`,
//       [
//         { text: 'No', style: 'cancel' },
//         {
//           text: 'Yes, Cancel',
//           style: 'destructive',
//           onPress: async () => {
//             setProcessingId(invite._id);
//             try {
//               await userService.cancelInvite(invite._id);
//               Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
//               setInvites(prev => prev.filter(i => i._id !== invite._id));
//             } catch (err) {
//               console.error(err);
//               Alert.alert('Error', 'Failed to cancel invitation');
//             } finally {
//               setProcessingId(null);
//             }
//           },
//         },
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

//   // Render pending invite item (same as before)
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
//             <Text style={styles.expiry}>Expires {expiresIn}</Text>
//           )}
//           <View style={styles.actions}>
//             {item.status === 'pending' && item.type === 'email' && (
//               <TouchableOpacity
//                 style={[styles.actionBtn, styles.resendBtn, isProcessing && styles.disabled]}
//                 onPress={() => handleResend(item)}
//                 disabled={isProcessing}
//               >
//                 <MaterialIcons name="refresh" size={16} color={COLORS.primary} />
//                 <Text style={styles.resendText}>Resend</Text>
//               </TouchableOpacity>
//             )}
//             {item.status === 'pending' && (
//               <TouchableOpacity
//                 style={[styles.actionBtn, styles.cancelBtn, isProcessing && styles.disabled]}
//                 onPress={() => handleCancel(item)}
//                 disabled={isProcessing}
//               >
//                 <MaterialIcons name="close" size={16} color={COLORS.error} />
//                 <Text style={styles.cancelText}>Cancel</Text>
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

//   // Render linked cleaner item (grouped by property)
//   const renderLinkedProperty = ({ item }) => (
//     <View style={styles.propertyGroup}>
//       <Text style={styles.propertyGroupTitle}>{item.property_name}</Text>
//       {item.cleaners.length === 0 ? (
//         <Text style={styles.emptySubText}>No linked cleaners</Text>
//       ) : (
//         item.cleaners.map(cleaner => (
//           <View key={cleaner.cleaner_id} style={styles.cleanerCard}>
//             <Image
//               source={{ uri: cleaner.avatar || 'https://via.placeholder.com/40' }}
//               style={styles.cleanerAvatar}
//             />
//             <View style={styles.cleanerInfo}>
//               <Text style={styles.cleanerName}>
//                 {cleaner.firstname} {cleaner.lastname}
//               </Text>
//               <Text style={styles.cleanerContact}>{cleaner.email}</Text>
//               {cleaner.phone && <Text style={styles.cleanerContact}>{cleaner.phone}</Text>}
//             </View>
//             <View style={styles.cleanerMeta}>
//               <Text style={styles.cleanerType}>{cleaner.type}</Text>
//               {cleaner.linked_at && (
//                 <Text style={styles.linkedDate}>
//                   Linked {format(new Date(cleaner.linked_at), 'MMM d, yyyy')}
//                 </Text>
//               )}
//             </View>
//           </View>
//         ))
//       )}
//     </View>
//   );

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
//             Pending Invites
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'linked' && styles.activeTab]}
//           onPress={() => setActiveTab('linked')}
//         >
//           <Text style={[styles.tabText, activeTab === 'linked' && styles.activeTabText]}>
//             Linked Cleaners
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Filters (only for pending tab) */}
//       {activeTab === 'pending' && (
//         // <View style={styles.filters}>
//         //   <Picker
//         //     selectedValue={selectedProperty}
//         //     onValueChange={setSelectedProperty}
//         //     style={styles.picker}
//         //   >
//         //     {properties.map(p => (
//         //       <Picker.Item key={p.id} label={p.name} value={p.id} />
//         //     ))}
//         //   </Picker>
//         //   <Picker
//         //     selectedValue={selectedStatus}
//         //     onValueChange={setSelectedStatus}
//         //     style={styles.picker}
//         //   >
//         //     <Picker.Item label="All Status" value="all" />
//         //     <Picker.Item label="Pending" value="pending" />
//         //     <Picker.Item label="Accepted" value="accepted" />
//         //     <Picker.Item label="Declined" value="declined" />
//         //     <Picker.Item label="Expired" value="expired" />
//         //   </Picker>
//         // </View>
//         <View style={styles.filters}>
//             <View style={styles.pickerWrapper}>
//                 <FloatingLabelPickerSelect
//                 label="Property"
//                 items={propertyItems}
//                 value={selectedProperty}
//                 onValueChange={setSelectedProperty}
//                 placeholder={{ label: 'Select Property', value: null }} // not used when 'all' is in items
//                 styleOverrides={{
//                     inputIOS: { fontSize: 14, paddingVertical: 12 },
//                     inputAndroid: { fontSize: 14, paddingVertical: 12 },
//                 }}
//                 />
//             </View>
//             <View style={styles.pickerWrapper}>
//                 <FloatingLabelPickerSelect
//                 label="Status"
//                 items={statusItems}
//                 value={selectedStatus}
//                 onValueChange={setSelectedStatus}
//                 placeholder={{ label: 'Select Status', value: null }} // not used because 'all' is in items
//                 styleOverrides={{
//                     inputIOS: { fontSize: 14, paddingVertical: 12 },
//                     inputAndroid: { fontSize: 14, paddingVertical: 12 },
//                 }}
//                 />
//             </View>
//         </View>
//       )}

//       {/* Property filter for linked cleaners */}
//       {activeTab === 'linked' && (
//         <View style={styles.filters}>
//             <View style={styles.pickerWrapper}>
//             <FloatingLabelPickerSelect
//                 label="Property"
//                 items={[
//                 { label: 'All Properties', value: 'all' },
//                 ...linkedData.map(p => ({ label: p.property_name, value: p.property_id }))
//                 ]}
//                 value={selectedLinkedProperty}
//                 onValueChange={setSelectedLinkedProperty}
//                 placeholder={{ label: '', value: null }} // no placeholder needed
//                 styleOverrides={{
//                     inputIOS: { fontSize: 14, paddingVertical: 12 },
//                     inputAndroid: { fontSize: 14, paddingVertical: 12 },
//                 }}
//             />
//             </View>
//         </View>
//         )}

//       {/* Content */}
//       {activeTab === 'pending' ? (
//         filteredInvites.length === 0 ? (
//           <View style={styles.emptyContainer}>
//             <MaterialIcons name="mail-outline" size={64} color={COLORS.light_gray} />
//             <Text style={styles.emptyText}>No pending invites</Text>
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
//             <Text style={styles.emptyText}>No linked cleaners yet</Text>
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
//     zIndex: 10,                // bring entire filter bar forward
//     elevation: 5,               // Android shadow + elevation
//   },
//   pickerWrapper: {
//     flex: 1,
//     marginHorizontal: 4,
//   },
//   picker: {
//     flex: 1,
//     height: 40,
//     marginHorizontal: 4,
//     backgroundColor: '#fff',    // ensure background
//     zIndex: 20,                  // higher than filters container
//     elevation: 6,                 // Android
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
//   },
// });



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
//     { label: 'All Status', value: 'all' },
//     { label: 'Pending', value: 'pending' },
//     { label: 'Accepted', value: 'accepted' },
//     { label: 'Declined', value: 'declined' },
//     { label: 'Expired', value: 'expired' },
//   ];

//   const fetchAllData = async () => {
//     try {
//       const [invitesRes, linkedRes] = await Promise.all([
//         userService.getHostInvites(userToken),
//         userService.getLinkedCleaners(userToken),
//       ]);
//       const invitesData = invitesRes.data || [];
//       const linkedData = linkedRes.data || [];
      
//       setInvites(invitesData);
//       applyInviteFilters(invitesData, selectedProperty, selectedStatus);
      
//       const props = [...new Set(invitesData.map(i => i.property_id))].map(pid => ({
//         id: pid,
//         name: invitesData.find(i => i.property_id === pid)?.property_name || pid
//       }));
//       setProperties([{ id: 'all', name: 'All Properties' }, ...props]);
      
//       setLinkedData(linkedData);
//     } catch (error) {
//       console.error('Failed to fetch team data:', error);
//       Alert.alert('Error', 'Could not load team information');
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

//   const filteredLinked = selectedLinkedProperty === 'all'
//     ? linkedData
//     : linkedData.filter(p => p.property_id === selectedLinkedProperty);

//   const handleResend = async (invite) => {
//     if (invite.type !== 'email') return;
//     Alert.alert(
//       'Resend Invitation',
//       `Resend invitation to ${invite.email}?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Resend',
//           onPress: async () => {
//             setProcessingId(invite._id);
//             try {
//               await userService.resendInvite({ inviteId: invite._id });
//               Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//               Alert.alert('Success', 'Invitation resent');
//             } catch (err) {
//               console.error(err);
//               Alert.alert('Error', 'Failed to resend invitation');
//             } finally {
//               setProcessingId(null);
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleCancel = async (invite) => {
//     Alert.alert(
//       'Cancel Invitation',
//       `Cancel invitation to ${invite.type === 'platform' ? invite.cleaner_name : invite.email}?`,
//       [
//         { text: 'No', style: 'cancel' },
//         {
//           text: 'Yes, Cancel',
//           style: 'destructive',
//           onPress: async () => {
//             setProcessingId(invite._id);
//             try {
//               await userService.cancelInvite(invite._id);
//               Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
//               setInvites(prev => prev.filter(i => i._id !== invite._id));
//             } catch (err) {
//               console.error(err);
//               Alert.alert('Error', 'Failed to cancel invitation');
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
//       'Unlink Cleaner',
//       'Are you sure you want to remove this cleaner from your property?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Unlink',
//           style: 'destructive',
//           onPress: async () => {
//             setUnlinkingId(cleanerId);
//             const payload = { 
//               propert_id:propertyId, 
//               cleaner_id:cleanerId 
//             } 

//             console.log({ propertyId, cleanerId })
//             try {
//               await userService.unlinkCleaner(payload, userToken);
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
//               Alert.alert('Success', 'Cleaner unlinked successfully');
//             } catch (err) {
//               console.error(err);
//               Alert.alert('Error', 'Failed to unlink cleaner');
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
//             <Text style={styles.expiry}>Expires {expiresIn}</Text>
//           )}
//           <View style={styles.actions}>
//             {item.status === 'pending' && item.type === 'email' && (
//               <TouchableOpacity
//                 style={[styles.actionBtn, styles.resendBtn, isProcessing && styles.disabled]}
//                 onPress={() => handleResend(item)}
//                 disabled={isProcessing}
//               >
//                 <MaterialIcons name="refresh" size={16} color={COLORS.primary} />
//                 <Text style={styles.resendText}>Resend</Text>
//               </TouchableOpacity>
//             )}
//             {item.status === 'pending' && (
//               <TouchableOpacity
//                 style={[styles.actionBtn, styles.cancelBtn, isProcessing && styles.disabled]}
//                 onPress={() => handleCancel(item)}
//                 disabled={isProcessing}
//               >
//                 <MaterialIcons name="close" size={16} color={COLORS.error} />
//                 <Text style={styles.cancelText}>Cancel</Text>
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

//   const renderLinkedProperty = ({ item }) => (
//     <View style={styles.propertyGroup}>
//       <Text style={styles.propertyGroupTitle}>{item.property_name}</Text>
//       {item.cleaners.length === 0 ? (
//         <Text style={styles.emptySubText}>No linked cleaners</Text>
//       ) : (
//         item.cleaners.map(cleaner => (
//           <View key={cleaner.cleaner_id} style={styles.cleanerCard}>
//             <Image
//               source={{ uri: cleaner.avatar || 'https://via.placeholder.com/40' }}
//               style={styles.cleanerAvatar}
//             />
//             <View style={styles.cleanerInfo}>
//               <Text style={styles.cleanerName}>
//                 {cleaner.firstname} {cleaner.lastname}
//               </Text>
//               <Text style={styles.cleanerContact}>{cleaner.email}</Text>
//               {cleaner.phone && <Text style={styles.cleanerContact}>{cleaner.phone}</Text>}
//             </View>
//             <View style={styles.cleanerMeta}>
//               <Text style={styles.cleanerType}>{cleaner.type}</Text>
//               {cleaner.linked_at && (
//                 <Text style={styles.linkedDate}>
//                   Linked {format(new Date(cleaner.linked_at), 'MMM d, yyyy')}
//                 </Text>
//               )}
//               {unlinkingId === cleaner.cleaner_id ? (
//                 <ActivityIndicator size="small" color={COLORS.error} style={styles.unlinkLoader} />
//               ) : (
//                 <TouchableOpacity
//                   style={styles.unlinkButton}
//                   onPress={() => handleUnlinkCleaner(item.property_id, cleaner.cleaner_id)}
//                 >
//                   <MaterialIcons name="link-off" size={16} color={COLORS.error} />
//                   <Text style={styles.unlinkText}>Unlink</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>
//         ))
//       )}
//     </View>
//   );

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
//             Pending Invites
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'linked' && styles.activeTab]}
//           onPress={() => setActiveTab('linked')}
//         >
//           <Text style={[styles.tabText, activeTab === 'linked' && styles.activeTabText]}>
//             Linked Cleaners
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Filters for pending tab */}
//       {activeTab === 'pending' && (
//         <View style={styles.filters}>
//           <View style={styles.pickerWrapper}>
//             <FloatingLabelPickerSelect
//               label="Property"
//               items={propertyItems}
//               value={selectedProperty}
//               onValueChange={setSelectedProperty}
//               placeholder={{ label: 'Select Property', value: null }}
//               styleOverrides={{
//                 inputIOS: { fontSize: 14, paddingVertical: 12 },
//                 inputAndroid: { fontSize: 14, paddingVertical: 12 },
//               }}
//             />
//           </View>
//           <View style={styles.pickerWrapper}>
//             <FloatingLabelPickerSelect
//               label="Status"
//               items={statusItems}
//               value={selectedStatus}
//               onValueChange={setSelectedStatus}
//               placeholder={{ label: 'Select Status', value: null }}
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
//               label="Property"
//               items={[
//                 { label: 'All Properties', value: 'all' },
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
//             <Text style={styles.emptyText}>No pending invites</Text>
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
//             <Text style={styles.emptyText}>No linked cleaners yet</Text>
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
//     { label: 'All Status', value: 'all' },
//     { label: 'Pending', value: 'pending' },
//     { label: 'Accepted', value: 'accepted' },
//     { label: 'Declined', value: 'declined' },
//     { label: 'Expired', value: 'expired' },
//   ];

//   const fetchAllData = async () => {
//     try {
//       const [invitesRes, linkedRes] = await Promise.all([
//         userService.getHostInvites(userToken),
//         userService.getLinkedCleaners(userToken),
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
//       setProperties([{ id: 'all', name: 'All Properties' }, ...props]);
      
//       setLinkedData(linkedData);
//     } catch (error) {
//       console.error('Failed to fetch team data:', error);
//       Alert.alert('Error', 'Could not load team information');
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
//         'Resend Invitation',
//         `Resend invitation to ${invite.email}?`,
//         [
//           { text: 'Cancel', style: 'cancel' },
//           {
//             text: 'Resend',
//             onPress: async () => {
//               setProcessingId(invite.id);
//               const payload = {inviteId: invite.id, hostId:currentUserId}
//               try {
//                 await userService.resendInvite(payload);
//                 Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//                 Alert.alert('Success', 'Invitation resent');
//               } catch (err) {
//                 console.error(err);
//                 Alert.alert('Error', 'Failed to resend invitation');
//               } finally {
//                 setProcessingId(null);
//               }
//             },
//           },
//         ]
//       );
//     } else if (invite.type === 'platform') {
//       Alert.alert(
//         'Resend Invitation',
//         `Send a new notification to ${invite.cleaner_name}?`,
//         [
//           { text: 'Cancel', style: 'cancel' },
//           {
//             text: 'Resend',
//             onPress: async () => {
//               setProcessingId(invite.id);
//               const payload = {inviteId: invite.id, hostId:currentUserId}
//               try {
//                 await userService.resendPlatformInvite(payload);
//                 Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//                 Alert.alert('Success', 'Notification resent');
//               } catch (err) {
//                 console.error(err);
//                 Alert.alert('Error', 'Failed to resend invitation');
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
//       'Cancel Invitation',
//       `Cancel invitation to ${invite.type === 'platform' ? invite.cleaner_name : invite.email}?`,
//       [
//         { text: 'No', style: 'cancel' },
//         {
//           text: 'Yes, Cancel',
//           style: 'destructive',
//           onPress: async () => {
//             setProcessingId(invite.id);
//             const payload = {inviteId: invite.id, hostId:currentUserId}
            
//             try {
//               await userService.cancelInvite(payload);
//               Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
//               setInvites(prev => prev.filter(i => i.id !== invite.id));
//               Alert.alert('Success', 'Invitation cancelled');
//             } catch (err) {
//               console.error(err);
//               Alert.alert('Error', 'Failed to cancel invitation');
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
//       'Unlink Cleaner',
//       'Are you sure you want to remove this cleaner from your property?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Unlink',
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
//               Alert.alert('Success', 'Cleaner unlinked successfully');
//             } catch (err) {
//               console.error(err);
//               Alert.alert('Error', 'Failed to unlink cleaner');
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
//             <Text style={styles.expiry}>Expires {expiresIn}</Text>
//           )}
//           <View style={styles.actions}>
//             {item.status === 'pending' && item.type === 'email' && (
//               <TouchableOpacity
//                 style={[styles.actionBtn, styles.resendBtn, isProcessing && styles.disabled]}
//                 onPress={() => handleResend(item)}
//                 disabled={isProcessing}
//               >
//                 <MaterialIcons name="refresh" size={16} color={COLORS.primary} />
//                 <Text style={styles.resendText}>Resend</Text>
//               </TouchableOpacity>
//             )}
//             {item.status === 'pending' && (
//               <TouchableOpacity
//                 style={[styles.actionBtn, styles.cancelBtn, isProcessing && styles.disabled]}
//                 onPress={() => handleCancel(item)}
//                 disabled={isProcessing}
//               >
//                 <MaterialIcons name="close" size={16} color={COLORS.error} />
//                 <Text style={styles.cancelText}>Cancel</Text>
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
//           <Text style={styles.emptySubText}>No linked cleaners</Text>
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
//                     Linked {format(new Date(cleaner.linked_at), 'MMM d, yyyy')}
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
//                     <Text style={styles.unlinkText}>Unlink</Text>
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
//             Pending Invites
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'linked' && styles.activeTab]}
//           onPress={() => setActiveTab('linked')}
//         >
//           <Text style={[styles.tabText, activeTab === 'linked' && styles.activeTabText]}>
//             Linked Cleaners
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Filters for pending tab */}
//       {activeTab === 'pending' && (
//         <View style={styles.filters}>
//           <View style={styles.pickerWrapper}>
//             <FloatingLabelPickerSelect
//               label="Property"
//               items={propertyItems}
//               value={selectedProperty}
//               onValueChange={setSelectedProperty}
//               placeholder={{ label: 'Select Property', value: null }}
//               styleOverrides={{
//                 inputIOS: { fontSize: 14, paddingVertical: 12 },
//                 inputAndroid: { fontSize: 14, paddingVertical: 12 },
//               }}
//             />
//           </View>
//           <View style={styles.pickerWrapper}>
//             <FloatingLabelPickerSelect
//               label="Status"
//               items={statusItems}
//               value={selectedStatus}
//               onValueChange={setSelectedStatus}
//               placeholder={{ label: 'Select Status', value: null }}
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
//               label="Property"
//               items={[
//                 { label: 'All Properties', value: 'all' },
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
//             <Text style={styles.emptyText}>No pending invites</Text>
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
//             <Text style={styles.emptyText}>No linked cleaners yet</Text>
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



import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AuthContext } from '../../context/AuthContext';
import userService from '../../services/connection/userService';
import COLORS from '../../constants/colors';
import { formatDistanceToNow, format } from 'date-fns';
import FloatingLabelPickerSelect from '../../components/shared/FloatingLabelPicker';
import { tSafe } from '../../utils/tSafe'; // added import

export default function TeamManagement() {
  const { currentUserId, userToken } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'linked'
  
  // Pending invites state
  const [invites, setInvites] = useState([]);
  const [filteredInvites, setFilteredInvites] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Linked cleaners states
  const [linkedData, setLinkedData] = useState([]);
  const [selectedLinkedProperty, setSelectedLinkedProperty] = useState('all');
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [unlinkingId, setUnlinkingId] = useState(null);

  const propertyItems = properties.map(p => ({ label: p.name, value: p.id }));

  const statusItems = [
    { label: tSafe('all_status', 'All Status'), value: 'all' },
    { label: tSafe('status_pending', 'Pending'), value: 'pending' },
    { label: tSafe('status_accepted', 'Accepted'), value: 'accepted' },
    { label: tSafe('status_declined', 'Declined'), value: 'declined' },
    { label: tSafe('status_expired', 'Expired'), value: 'expired' },
  ];

  const fetchAllData = async () => {
    try {
      const [invitesRes, linkedRes] = await Promise.all([
        userService.getHostInvites(userToken),
        userService.getLinkedCleaners(userToken),
      ]);
      const invitesData = invitesRes.data || [];
      const linkedData = linkedRes.data || [];
      console.log("Invitee", invitesData)
      setInvites(invitesData);
      applyInviteFilters(invitesData, selectedProperty, selectedStatus);
      
      const props = [...new Set(invitesData.map(i => i.property_id))].map(pid => ({
        id: pid,
        name: invitesData.find(i => i.property_id === pid)?.property_name || pid
      }));
      setProperties([{ id: 'all', name: tSafe('all_properties', 'All Properties') }, ...props]);
      
      setLinkedData(linkedData);
    } catch (error) {
      console.error('Failed to fetch team data:', error);
      Alert.alert(tSafe('error_title', 'Error'), tSafe('could_not_load_team', 'Could not load team information'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  const applyInviteFilters = (data, propId, stat) => {
    let filtered = data;
    if (propId !== 'all') {
      filtered = filtered.filter(i => i.property_id === propId);
    }
    if (stat !== 'all') {
      filtered = filtered.filter(i => i.status === stat);
    }
    setFilteredInvites(filtered);
  };

  useEffect(() => {
    applyInviteFilters(invites, selectedProperty, selectedStatus);
  }, [selectedProperty, selectedStatus, invites]);

  // Deduplicate linked properties (by property_id)
  const filteredRaw = selectedLinkedProperty === 'all'
    ? linkedData
    : linkedData.filter(p => p.property_id === selectedLinkedProperty);

  const filteredLinked = [];
  const seenPropertyIds = new Set();
  filteredRaw.forEach(prop => {
    if (!seenPropertyIds.has(prop.property_id)) {
      seenPropertyIds.add(prop.property_id);
      filteredLinked.push(prop);
    } else {
      console.warn('Duplicate property ID:', prop.property_id);
    }
  });



  const handleResend = async (invite) => {
    console.log(invite)
    if (invite.type === 'email') {
      Alert.alert(
        tSafe('resend_invitation_title', 'Resend Invitation'),
        tSafe('resend_invite_email', 'Resend invitation to {email}?', { email: invite.email }),
        [
          { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
          {
            text: tSafe('resend', 'Resend'),
            onPress: async () => {
              setProcessingId(invite.id);
              const payload = {inviteId: invite.id, hostId:currentUserId}
              try {
                await userService.resendInvite(payload);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(tSafe('success_title', 'Success'), tSafe('invitation_resent', 'Invitation resent'));
              } catch (err) {
                console.error(err);
                Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_resend', 'Failed to resend invitation'));
              } finally {
                setProcessingId(null);
              }
            },
          },
        ]
      );
    } else if (invite.type === 'platform') {
      Alert.alert(
        tSafe('resend_invitation_title', 'Resend Invitation'),
        tSafe('resend_invite_platform', 'Send a new notification to {name}?', { name: invite.cleaner_name }),
        [
          { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
          {
            text: tSafe('resend', 'Resend'),
            onPress: async () => {
              setProcessingId(invite.id);
              const payload = {inviteId: invite.id, hostId:currentUserId}
              try {
                await userService.resendPlatformInvite(payload);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(tSafe('success_title', 'Success'), tSafe('notification_resent', 'Notification resent'));
              } catch (err) {
                console.error(err);
                Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_resend', 'Failed to resend invitation'));
              } finally {
                setProcessingId(null);
              }
            },
          },
        ]
      );
    }
  };

  

  const handleCancel = async (invite) => {
    Alert.alert(
      tSafe('cancel_invitation_title', 'Cancel Invitation'),
      tSafe('cancel_invite_message', 'Cancel invitation to {name}?', { name: invite.type === 'platform' ? invite.cleaner_name : invite.email }),
      [
        { text: tSafe('no', 'No'), style: 'cancel' },
        {
          text: tSafe('yes_cancel', 'Yes, Cancel'),
          style: 'destructive',
          onPress: async () => {
            setProcessingId(invite.id);
            const payload = {inviteId: invite.id, hostId:currentUserId}
            
            try {
              await userService.cancelInvite(payload);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              setInvites(prev => prev.filter(i => i.id !== invite.id));
              Alert.alert(tSafe('success_title', 'Success'), tSafe('invitation_cancelled', 'Invitation cancelled'));
            } catch (err) {
              console.error(err);
              Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_cancel', 'Failed to cancel invitation'));
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleUnlinkCleaner = (propertyId, cleanerId) => {
    Alert.alert(
      tSafe('unlink_cleaner_title', 'Unlink Cleaner'),
      tSafe('unlink_cleaner_message', 'Are you sure you want to remove this cleaner from your property?'),
      [
        { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
        {
          text: tSafe('unlink', 'Unlink'),
          style: 'destructive',
          onPress: async () => {
            setUnlinkingId(cleanerId);
            const payload = { 
              property_id:propertyId, 
              cleaner_id:cleanerId 
            } 
            
            try {
              await userService.unlinkCleaner(payload, userToken );
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              setLinkedData(prev => prev.map(prop => {
                if (prop.property_id === propertyId) {
                  return {
                    ...prop,
                    cleaners: prop.cleaners.filter(c => c.cleaner_id !== cleanerId)
                  };
                }
                return prop;
              }));
              Alert.alert(tSafe('success_title', 'Success'), tSafe('cleaner_unlinked', 'Cleaner unlinked successfully'));
            } catch (err) {
              console.error(err);
              Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_unlink', 'Failed to unlink cleaner'));
            } finally {
              setUnlinkingId(null);
            }
          }
        }
      ]
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return { backgroundColor: '#FFF3E0', borderColor: '#FFB74D' };
      case 'accepted': return { backgroundColor: '#E8F5E9', borderColor: '#66BB6A' };
      case 'declined': return { backgroundColor: '#FFEBEE', borderColor: '#EF5350' };
      case 'expired': return { backgroundColor: '#EEEEEE', borderColor: '#9E9E9E' };
      case 'cancelled': return { backgroundColor: '#EEEEEE', borderColor: '#9E9E9E' };
      default: return { backgroundColor: '#F5F5F5', borderColor: '#CCC' };
    }
  };

  const renderInviteItem = ({ item }) => {
    const isProcessing = processingId === item._id;
    const expiresIn = item.status === 'pending' 
      ? formatDistanceToNow(new Date(item.expires_at), { addSuffix: true })
      : '';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          {item.type === 'platform' ? (
            <Image
              source={{ uri: item.cleaner_avatar || 'https://via.placeholder.com/40' }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.emailAvatar]}>
              <MaterialIcons name="email" size={20} color="#fff" />
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={styles.primaryName}>
              {item.type === 'platform' ? item.cleaner_name : item.email}
            </Text>
            <Text style={styles.propertyName}>{item.property_name}</Text>
          </View>
          <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          {item.status === 'pending' && (
            <Text style={styles.expiry}>{tSafe('expires', 'Expires')} {expiresIn}</Text>
          )}
          <View style={styles.actions}>
            {item.status === 'pending' && item.type === 'email' && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.resendBtn, isProcessing && styles.disabled]}
                onPress={() => handleResend(item)}
                disabled={isProcessing}
              >
                <MaterialIcons name="refresh" size={16} color={COLORS.primary} />
                <Text style={styles.resendText}>{tSafe('resend', 'Resend')}</Text>
              </TouchableOpacity>
            )}
            {item.status === 'pending' && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn, isProcessing && styles.disabled]}
                onPress={() => handleCancel(item)}
                disabled={isProcessing}
              >
                <MaterialIcons name="close" size={16} color={COLORS.error} />
                <Text style={styles.cancelText}>{tSafe('cancel', 'Cancel')}</Text>
              </TouchableOpacity>
            )}
            {isProcessing && <ActivityIndicator size="small" color={COLORS.gray} />}
          </View>
        </View>

        {item.type === 'email' && item.email && (
          <View style={styles.contactRow}>
            <MaterialIcons name="email" size={14} color={COLORS.gray} />
            <Text style={styles.contactText}>{item.email}</Text>
          </View>
        )}
        {item.type === 'platform' && item.cleaner_phone && (
          <View style={styles.contactRow}>
            <MaterialIcons name="phone" size={14} color={COLORS.gray} />
            <Text style={styles.contactText}>{item.cleaner_phone}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderLinkedProperty = ({ item }) => {
    // Deduplicate cleaners within this property
    const uniqueCleaners = [];
    const seenCleanerIds = new Set();
    item.cleaners.forEach(cleaner => {
      if (!seenCleanerIds.has(cleaner.cleaner_id)) {
        seenCleanerIds.add(cleaner.cleaner_id);
        uniqueCleaners.push(cleaner);
      } else {
        console.warn('Duplicate cleaner ID:', cleaner.cleaner_id);
      }
    });

    return (
      <View style={styles.propertyGroup}>
        <Text style={styles.propertyGroupTitle}>{item.property_name}</Text>
        {uniqueCleaners.length === 0 ? (
          <Text style={styles.emptySubText}>{tSafe('no_linked_cleaners', 'No linked cleaners')}</Text>
        ) : (
          uniqueCleaners.map(cleaner => (
            <View key={cleaner.cleaner_id} style={styles.cleanerCard}>
              <Image
                source={{ uri: cleaner.avatar || 'https://via.placeholder.com/40' }}
                style={styles.cleanerAvatar}
              />
              <View style={styles.cleanerInfo}>
                <Text style={styles.cleanerName}>
                  {cleaner.firstname} {cleaner.lastname}
                </Text>
                <Text style={styles.cleanerContact}>{cleaner.email}</Text>
                {cleaner.phone && <Text style={styles.cleanerContact}>{cleaner.phone}</Text>}
              </View>
              <View style={styles.cleanerMeta}>
                <Text style={styles.cleanerType}>{cleaner.type}</Text>
                {cleaner.linked_at && (
                  <Text style={styles.linkedDate}>
                    {tSafe('linked', 'Linked')} {format(new Date(cleaner.linked_at), 'MMM d, yyyy')}
                  </Text>
                )}
                {unlinkingId === cleaner.cleaner_id ? (
                  <ActivityIndicator size="small" color={COLORS.error} style={styles.unlinkLoader} />
                ) : (
                  <TouchableOpacity
                    style={styles.unlinkButton}
                    onPress={() => handleUnlinkCleaner(item.property_id, cleaner.cleaner_id)}
                  >
                    <MaterialIcons name="link-off" size={16} color={COLORS.error} />
                    <Text style={styles.unlinkText}>{tSafe('unlink', 'Unlink')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            {tSafe('pending_invites', 'Pending Invites')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'linked' && styles.activeTab]}
          onPress={() => setActiveTab('linked')}
        >
          <Text style={[styles.tabText, activeTab === 'linked' && styles.activeTabText]}>
            {tSafe('linked_cleaners', 'Linked Cleaners')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters for pending tab */}
      {activeTab === 'pending' && (
        <View style={styles.filters}>
          <View style={styles.pickerWrapper}>
            <FloatingLabelPickerSelect
              label={tSafe('property', 'Property')}
              items={propertyItems}
              value={selectedProperty}
              onValueChange={setSelectedProperty}
              placeholder={{ label: tSafe('select_property', 'Select Property'), value: null }}
              styleOverrides={{
                inputIOS: { fontSize: 14, paddingVertical: 12 },
                inputAndroid: { fontSize: 14, paddingVertical: 12 },
              }}
            />
          </View>
          <View style={styles.pickerWrapper}>
            <FloatingLabelPickerSelect
              label={tSafe('status', 'Status')}
              items={statusItems}
              value={selectedStatus}
              onValueChange={setSelectedStatus}
              placeholder={{ label: tSafe('select_status', 'Select Status'), value: null }}
              styleOverrides={{
                inputIOS: { fontSize: 14, paddingVertical: 12 },
                inputAndroid: { fontSize: 14, paddingVertical: 12 },
              }}
            />
          </View>
        </View>
      )}

      {/* Property filter for linked cleaners */}
      {activeTab === 'linked' && (
        <View style={styles.filters}>
          <View style={styles.pickerWrapper}>
            <FloatingLabelPickerSelect
              label={tSafe('property', 'Property')}
              items={[
                { label: tSafe('all_properties', 'All Properties'), value: 'all' },
                ...linkedData.map(p => ({ label: p.property_name, value: p.property_id }))
              ]}
              value={selectedLinkedProperty}
              onValueChange={setSelectedLinkedProperty}
              placeholder={{ label: '', value: null }}
              styleOverrides={{
                inputIOS: { fontSize: 14, paddingVertical: 12 },
                inputAndroid: { fontSize: 14, paddingVertical: 12 },
              }}
            />
          </View>
        </View>
      )}

      {/* Content */}
      {activeTab === 'pending' ? (
        filteredInvites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="mail-outline" size={64} color={COLORS.light_gray} />
            <Text style={styles.emptyText}>{tSafe('no_pending_invites', 'No pending invites')}</Text>
          </View>
        ) : (
          <FlatList
            data={filteredInvites}
            keyExtractor={(item) => item._id}
            renderItem={renderInviteItem}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )
      ) : (
        filteredLinked.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="people-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>{tSafe('no_linked_cleaners', 'No linked cleaners yet')}</Text>
          </View>
        ) : (
          <FlatList
            data={filteredLinked}
            keyExtractor={(item) => item.property_id}
            renderItem={renderLinkedProperty}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#888',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  filters: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 10,
    elevation: 5,
  },
  pickerWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  list: { padding: 16, paddingBottom: 30 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    marginRight: 12,
  },
  emailAvatar: {
    backgroundColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: { flex: 1 },
  primaryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  propertyName: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  expiry: {
    fontSize: 12,
    color: '#888',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginLeft: 8,
  },
  resendBtn: {
    borderColor: COLORS.primary,
  },
  resendText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  cancelBtn: {
    borderColor: COLORS.error,
  },
  cancelText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  disabled: { opacity: 0.5 },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  contactText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
  propertyGroup: {
    marginBottom: 20,
  },
  propertyGroupTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  cleanerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
  },
  cleanerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: COLORS.gray,
  },
  cleanerInfo: {
    flex: 1,
  },
  cleanerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cleanerContact: {
    fontSize: 12,
    color: '#666',
  },
  cleanerMeta: {
    alignItems: 'flex-end',
  },
  cleanerType: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primary,
    backgroundColor: '#F0F5FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 4,
  },
  linkedDate: {
    fontSize: 10,
    color: '#888',
    marginBottom: 4,
  },
  unlinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  unlinkText: {
    fontSize: 12,
    color: COLORS.error,
    marginLeft: 4,
  },
  unlinkLoader: {
    marginTop: 4,
    alignSelf: 'flex-end',
  },
});