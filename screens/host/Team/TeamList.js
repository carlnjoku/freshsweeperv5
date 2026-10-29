// import React, { useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   RefreshControl,
// } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../../constants/colors';
// import ROUTES from '../../../constants/routes';
// import { tSafe } from '../../../utils/tSafe';
// // import { tSafe } from '../../utils/tSafe';
// // import { dummyTeamMembers } from '../../dummyData'; // adjust path
// import { dummyTeamMembers } from '../../../utils/dummyteam';

// const TeamList = ({ navigation }) => {
//   const [members, setMembers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const loadData = () => {
//     // Simulate network delay
//     setLoading(true);
//     setTimeout(() => {
//       setMembers(dummyTeamMembers);
//       setLoading(false);
//       setRefreshing(false);
//     }, 500);
//   };

//   useFocusEffect(
//     useCallback(() => {
//       loadData();
//     }, [])
//   );

//   const handleRefresh = () => {
//     setRefreshing(true);
//     loadData();
//   };

//   const renderItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.card}
//       onPress={() =>
//         navigation.navigate(ROUTES.host_team_form, {
//           mode: 'edit',
//           memberId: item._id,
//           memberData: item, // pass dummy data directly
//         })
//       }
//     >
//       <View style={styles.cardContent}>
//         <View style={styles.avatar}>
//           <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
//         </View>
//         <View style={styles.info}>
//           <Text style={styles.name}>{item.name}</Text>
//           <Text style={styles.phone}>{item.phone}</Text>
//           <View style={styles.workTypes}>
//             {item.workTypes.slice(0, 2).map((type, idx) => (
//               <View key={idx} style={styles.workTypeChip}>
//                 <Text style={styles.workTypeText}>{type}</Text>
//               </View>
//             ))}
//             {item.workTypes.length > 2 && (
//               <Text style={styles.more}>+{item.workTypes.length - 2}</Text>
//             )}
//           </View>
//         </View>
//         <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
//       </View>
//     </TouchableOpacity>
//   );

//   if (loading && !refreshing) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={members}
//         keyExtractor={(item) => item._id}
//         renderItem={renderItem}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
//         }
//         ListEmptyComponent={
//           <View style={styles.empty}>
//             <MaterialCommunityIcons name="account-group-outline" size={48} color="#ccc" />
//             <Text style={styles.emptyText}>{tSafe('no_team_members', 'No team members yet')}</Text>
//             <Text style={styles.emptySubtext}>
//               {tSafe('add_member_hint', 'Tap + to add your first team member')}
//             </Text>
//           </View>
//         }
//       />
//       <TouchableOpacity
//         style={styles.fab}
//         onPress={() =>
//           navigation.navigate(ROUTES.host_team_form, {
//             mode: 'create',
//           })
//         }
//       >
//         <MaterialCommunityIcons name="plus" size={28} color="#fff" />
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#f8f9fe' },
//     centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//     card: {
//       backgroundColor: '#fff',
//       marginHorizontal: 16,
//       marginTop: 12,
//       padding: 16,
//       borderRadius: 12,
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 1 },
//       shadowOpacity: 0.05,
//       shadowRadius: 4,
//       elevation: 2,
//     },
//     cardContent: { flexDirection: 'row', alignItems: 'center' },
//     avatar: {
//       width: 48,
//       height: 48,
//       borderRadius: 24,
//       backgroundColor: COLORS.primary + '20',
//       justifyContent: 'center',
//       alignItems: 'center',
//       marginRight: 12,
//     },
//     avatarText: { fontSize: 20, fontWeight: '600', color: COLORS.primary },
//     info: { flex: 1 },
//     name: { fontSize: 16, fontWeight: '600', color: '#1E1E2F' },
//     phone: { fontSize: 14, color: '#666', marginTop: 2 },
//     workTypes: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
//     workTypeChip: {
//       backgroundColor: '#f0f0f0',
//       paddingHorizontal: 8,
//       paddingVertical: 2,
//       borderRadius: 12,
//       marginRight: 4,
//     },
//     workTypeText: { fontSize: 11, color: '#555' },
//     more: { fontSize: 12, color: '#999', marginLeft: 4 },
//     empty: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//       paddingVertical: 60,
//     },
//     emptyText: { fontSize: 18, fontWeight: '500', color: '#666', marginTop: 12 },
//     emptySubtext: { fontSize: 14, color: '#999', marginTop: 4 },
//     fab: {
//       position: 'absolute',
//       bottom: 30,
//       right: 30,
//       backgroundColor: COLORS.primary,
//       width: 56,
//       height: 56,
//       borderRadius: 28,
//       justifyContent: 'center',
//       alignItems: 'center',
//       elevation: 6,
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 3 },
//       shadowOpacity: 0.2,
//       shadowRadius: 6,
//     },
//   });
  
//   export default TeamList;



// // screens/host/TeamListScreen.js
// import React, { useState, useCallback, useMemo } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   RefreshControl,
//   TextInput,
//   ScrollView,
// } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../../constants/colors';
// import ROUTES from '../../../constants/routes';
// import { tSafe } from '../../../utils/tSafe';
// import { dummyTeamMembers } from '../../../utils/dummyteam';
// import userService from '../../../services/connection/userService';

// // Get unique work types from dummy data (or you can define a static list)
// const ALL_WORK_TYPES = [...new Set(dummyTeamMembers.flatMap(m => m.workTypes))];

// const TeamList = ({ navigation }) => {
//   const [members, setMembers] = useState([]);
//   const [filteredMembers, setFilteredMembers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [searchText, setSearchText] = useState('');
//   const [selectedWorkType, setSelectedWorkType] = useState(null);

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       const res = await userService.getTeamMembers();
//       setMembers(res.data || []);
//       setFilteredMembers(res.data || []);
//     } catch (error) {
//       console.error('Failed to fetch team members:', error);
//       Alert.alert('Error', 'Could not load team members');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       loadData();
//     }, [])
//   );

//   const handleRefresh = () => {
//     setRefreshing(true);
//     loadData();
//   };

//   // Apply filters whenever search text or selected work type changes
//   useMemo(() => {
//     let filtered = members;

//     // Filter by work type
//     if (selectedWorkType) {
//       filtered = filtered.filter(member =>
//         member.workTypes.includes(selectedWorkType)
//       );
//     }

//     // Filter by search text (name, phone, email)
//     if (searchText.trim()) {
//       const lower = searchText.toLowerCase().trim();
//       filtered = filtered.filter(member =>
//         member.name.toLowerCase().includes(lower) ||
//         member.phone.includes(lower) ||
//         (member.email && member.email.toLowerCase().includes(lower))
//       );
//     }

//     setFilteredMembers(filtered);
//   }, [members, searchText, selectedWorkType]);

//   const clearFilters = () => {
//     setSearchText('');
//     setSelectedWorkType(null);
//   };

//   const renderItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.card}
//       onPress={() =>
//         navigation.navigate(ROUTES.host_team_form, {
//           mode: 'edit',
//           memberId: item._id,
//           memberData: item,
//         })
//       }
//     >
//       <View style={styles.cardContent}>
//         <View style={styles.avatar}>
//           <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
//         </View>
//         <View style={styles.info}>
//           <Text style={styles.name}>{item.name}</Text>
//           <Text style={styles.phone}>{item.phone}</Text>
//           <View style={styles.workTypes}>
//             {item.workTypes.slice(0, 2).map((type, idx) => (
//               <View key={idx} style={styles.workTypeChip}>
//                 <Text style={styles.workTypeText}>{type}</Text>
//               </View>
//             ))}
//             {item.workTypes.length > 2 && (
//               <Text style={styles.more}>+{item.workTypes.length - 2}</Text>
//             )}
//           </View>
//         </View>
//         <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
//       </View>
//     </TouchableOpacity>
//   );

//   if (loading && !refreshing) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Search and Filter Bar */}
//       <View style={styles.filterContainer}>
//         <View style={styles.searchWrapper}>
//           <MaterialCommunityIcons name="magnify" size={24} color="#999" />
//           <TextInput
//             style={styles.searchInput}
//             placeholder={tSafe('search_team', 'Search by name, phone or email...')}
//             placeholderTextColor="#999"
//             value={searchText}
//             onChangeText={setSearchText}
//             clearButtonMode="while-editing"
//           />
//           {searchText.length > 0 && (
//             <TouchableOpacity onPress={() => setSearchText('')}>
//               <MaterialCommunityIcons name="close-circle" size={20} color="#999" />
//             </TouchableOpacity>
//           )}
//         </View>

//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           style={styles.workTypeScroll}
//           contentContainerStyle={styles.workTypeScrollContent}
//         >
//           <TouchableOpacity
//             style={[
//               styles.filterChip,
//               !selectedWorkType && styles.filterChipActive,
//             ]}
//             onPress={() => setSelectedWorkType(null)}
//           >
//             <Text
//               style={[
//                 styles.filterChipText,
//                 !selectedWorkType && styles.filterChipTextActive,
//               ]}
//             >
//               {tSafe('all', 'All')}
//             </Text>
//           </TouchableOpacity>

//           {ALL_WORK_TYPES.map((type) => (
//             <TouchableOpacity
//               key={type}
//               style={[
//                 styles.filterChip,
//                 selectedWorkType === type && styles.filterChipActive,
//               ]}
//               onPress={() =>
//                 setSelectedWorkType(selectedWorkType === type ? null : type)
//               }
//             >
//               <Text
//                 style={[
//                   styles.filterChipText,
//                   selectedWorkType === type && styles.filterChipTextActive,
//                 ]}
//               >
//                 {type}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>

//         {(searchText || selectedWorkType) && (
//           <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
//             <Text style={styles.clearButtonText}>{tSafe('clear', 'Clear')}</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       <FlatList
//         data={filteredMembers}
//         keyExtractor={(item) => item._id}
//         renderItem={renderItem}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
//         }
//         ListEmptyComponent={
//           <View style={styles.empty}>
//             <MaterialCommunityIcons name="account-group-outline" size={48} color="#ccc" />
//             <Text style={styles.emptyText}>
//               {searchText || selectedWorkType
//                 ? tSafe('no_matching_members', 'No matching team members')
//                 : tSafe('no_team_members', 'No team members yet')}
//             </Text>
//             <Text style={styles.emptySubtext}>
//               {searchText || selectedWorkType
//                 ? tSafe('try_different_filter', 'Try a different filter')
//                 : tSafe('add_member_hint', 'Tap + to add your first team member')}
//             </Text>
//           </View>
//         }
//       />

//       <TouchableOpacity
//         style={styles.fab}
//         onPress={() =>
//           navigation.navigate(ROUTES.host_team_form, {
//             mode: 'create',
//           })
//         }
//       >
//         <MaterialCommunityIcons name="plus" size={28} color="#fff" />
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fe',
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   filterContainer: {
//     backgroundColor: '#fff',
//     paddingHorizontal: 16,
//     paddingTop: 12,
//     paddingBottom: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e9e9e9',
//   },
//   searchWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f0f0f0',
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     marginBottom: 10,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     paddingVertical: 8,
//     marginLeft: 8,
//     color: '#1E1E2F',
//   },
//   workTypeScroll: {
//     marginBottom: 4,
//   },
//   workTypeScrollContent: {
//     paddingVertical: 4,
//   },
//   filterChip: {
//     paddingHorizontal: 16,
//     paddingVertical: 6,
//     borderRadius: 20,
//     backgroundColor: '#f0f0f0',
//     marginRight: 8,
//   },
//   filterChipActive: {
//     backgroundColor: COLORS.primary + '20',
//     borderWidth: 1,
//     borderColor: COLORS.primary,
//   },
//   filterChipText: {
//     fontSize: 14,
//     color: '#555',
//   },
//   filterChipTextActive: {
//     color: COLORS.primary,
//     fontWeight: '500',
//   },
//   clearButton: {
//     alignSelf: 'flex-end',
//     paddingVertical: 4,
//     paddingHorizontal: 12,
//   },
//   clearButtonText: {
//     fontSize: 12,
//     color: COLORS.primary,
//     fontWeight: '500',
//   },
//   card: {
//     backgroundColor: '#fff',
//     marginHorizontal: 16,
//     marginTop: 12,
//     padding: 16,
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   cardContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatar: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: COLORS.primary + '20',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   avatarText: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },
//   info: {
//     flex: 1,
//   },
//   name: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1E1E2F',
//   },
//   phone: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 2,
//   },
//   workTypes: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginTop: 4,
//   },
//   workTypeChip: {
//     backgroundColor: '#f0f0f0',
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 12,
//     marginRight: 4,
//   },
//   workTypeText: {
//     fontSize: 11,
//     color: '#555',
//   },
//   more: {
//     fontSize: 12,
//     color: '#999',
//     marginLeft: 4,
//   },
//   empty: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 60,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: '500',
//     color: '#666',
//     marginTop: 12,
//   },
//   emptySubtext: {
//     fontSize: 14,
//     color: '#999',
//     marginTop: 4,
//   },
//   fab: {
//     position: 'absolute',
//     bottom: 30,
//     right: 30,
//     backgroundColor: COLORS.primary,
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 6,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//   },
// });

// export default TeamList;




// screens/host/TeamList.js
// import React, { useState, useCallback, useMemo } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   RefreshControl,
//   TextInput,
//   ScrollView,
//   Alert,
// } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../../constants/colors';
// import ROUTES from '../../../constants/routes';
// import { tSafe } from '../../../utils/tSafe';
// import userService from '../../../services/connection/userService';

// const ALL_WORK_TYPES = ['Plumbing', 'Electrical', 'Handyman', 'HVAC', 'Painting', 'Carpentry', 'Gardening', 'Cleaning', 'Pest Control', 'Supplier', 'Contractor', 'Other'];

// const TeamList = ({ navigation }) => {
//   const [members, setMembers] = useState([]);
//   const [filteredMembers, setFilteredMembers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [searchText, setSearchText] = useState('');
//   const [selectedWorkType, setSelectedWorkType] = useState(null);

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       const res = await userService.getTeamMembers();
//       setMembers(res.data || []);
//       setFilteredMembers(res.data || []);
//     } catch (error) {
//       console.error('Failed to fetch team members:', error);
//       Alert.alert('Error', 'Could not load team members');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       loadData();
//     }, [])
//   );

//   const handleRefresh = () => {
//     setRefreshing(true);
//     loadData();
//   };

//   useMemo(() => {
//     let filtered = members;
//     if (selectedWorkType) {
//       filtered = filtered.filter(member =>
//         member.workTypes.includes(selectedWorkType)
//       );
//     }
//     if (searchText.trim()) {
//       const lower = searchText.toLowerCase().trim();
//       filtered = filtered.filter(member =>
//         member.name.toLowerCase().includes(lower) ||
//         member.phone.includes(lower) ||
//         (member.email && member.email.toLowerCase().includes(lower))
//       );
//     }
//     setFilteredMembers(filtered);
//   }, [members, searchText, selectedWorkType]);

//   const clearFilters = () => {
//     setSearchText('');
//     setSelectedWorkType(null);
//   };

//   const renderItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.card}
//       onPress={() =>
//         navigation.navigate(ROUTES.host_team_form, {
//           mode: 'edit',
//           memberId: item._id,
//           memberData: item,
//         })
//       }
//     >
//       <View style={styles.cardContent}>
//         <View style={styles.avatar}>
//           <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
//         </View>
//         <View style={styles.info}>
//           <Text style={styles.name}>{item.name}</Text>
//           <Text style={styles.phone}>{item.phone}</Text>
//           <View style={styles.workTypes}>
//             {item.workTypes.slice(0, 2).map((type, idx) => (
//               <View key={idx} style={styles.workTypeChip}>
//                 <Text style={styles.workTypeText}>{type}</Text>
//               </View>
//             ))}
//             {item.workTypes.length > 2 && (
//               <Text style={styles.more}>+{item.workTypes.length - 2}</Text>
//             )}
//           </View>
//         </View>
//         <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
//       </View>
//     </TouchableOpacity>
//   );

//   if (loading && !refreshing) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* ---- NEW INFO CARD ---- */}
//       <View style={styles.infoCard}>
//         <View style={styles.infoCardHeader}>
//           <MaterialCommunityIcons name="account-group" size={28} color={COLORS.primary} />
//           <Text style={styles.infoCardTitle}>{tSafe('team_vendors_title_', 'Your Trusted Vendors')}</Text>
//         </View>
//         <Text style={styles.infoCardBody}>
//           {tSafe(
//             'team_vendors_description',
//             'Store and manage your network of external professionals – plumbers, electricians, handymen, suppliers, and more. Add their contact details, work types, and quickly notify them when an issue arises at any of your properties.'
//           )}
//         </Text>
//         <View style={styles.infoCardFooter}>
//           <MaterialCommunityIcons name="bell-outline" size={16} color={COLORS.primary} />
//           <Text style={styles.infoCardFooterText}>
//             {tSafe('team_vendors_footer', 'Tap a member to edit, or use the + button to add someone new.')}
//           </Text>
//         </View>
//       </View>

//       {/* Search and Filter Bar */}
//       <View style={styles.filterContainer}>
//         <View style={styles.searchWrapper}>
//           <MaterialCommunityIcons name="magnify" size={24} color="#999" />
//           <TextInput
//             style={styles.searchInput}
//             placeholder={tSafe('search_team', 'Search by name, phone or email...')}
//             placeholderTextColor="#999"
//             value={searchText}
//             onChangeText={setSearchText}
//             clearButtonMode="while-editing"
//           />
//           {searchText.length > 0 && (
//             <TouchableOpacity onPress={() => setSearchText('')}>
//               <MaterialCommunityIcons name="close-circle" size={20} color="#999" />
//             </TouchableOpacity>
//           )}
//         </View>

//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           style={styles.workTypeScroll}
//           contentContainerStyle={styles.workTypeScrollContent}
//         >
//           <TouchableOpacity
//             style={[
//               styles.filterChip,
//               !selectedWorkType && styles.filterChipActive,
//             ]}
//             onPress={() => setSelectedWorkType(null)}
//           >
//             <Text
//               style={[
//                 styles.filterChipText,
//                 !selectedWorkType && styles.filterChipTextActive,
//               ]}
//             >
//               {tSafe('all', 'All')}
//             </Text>
//           </TouchableOpacity>

//           {ALL_WORK_TYPES.map((type) => (
//             <TouchableOpacity
//               key={type}
//               style={[
//                 styles.filterChip,
//                 selectedWorkType === type && styles.filterChipActive,
//               ]}
//               onPress={() =>
//                 setSelectedWorkType(selectedWorkType === type ? null : type)
//               }
//             >
//               <Text
//                 style={[
//                   styles.filterChipText,
//                   selectedWorkType === type && styles.filterChipTextActive,
//                 ]}
//               >
//                 {type}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>

//         {(searchText || selectedWorkType) && (
//           <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
//             <Text style={styles.clearButtonText}>{tSafe('clear', 'Clear')}</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       <FlatList
//         data={filteredMembers}
//         keyExtractor={(item) => item._id}
//         renderItem={renderItem}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
//         }
//         ListEmptyComponent={
//           <View style={styles.empty}>
//             <MaterialCommunityIcons name="account-group-outline" size={48} color="#ccc" />
//             <Text style={styles.emptyText}>
//               {searchText || selectedWorkType
//                 ? tSafe('no_matching_members', 'No matching team members')
//                 : tSafe('no_team_members', 'No team members yet')}
//             </Text>
//             <Text style={styles.emptySubtext}>
//               {searchText || selectedWorkType
//                 ? tSafe('try_different_filter', 'Try a different filter')
//                 : tSafe('add_member_hint', 'Tap + to add your first team member')}
//             </Text>
//           </View>
//         }
//       />

//       <TouchableOpacity
//         style={styles.fab}
//         onPress={() =>
//           navigation.navigate(ROUTES.host_team_form, {
//             mode: 'create',
//           })
//         }
//       >
//         <MaterialCommunityIcons name="plus" size={28} color="#fff" />
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fe',
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   // ---- New Info Card Styles ----
//   infoCard: {
//     backgroundColor: '#fff',
//     marginHorizontal: 16,
//     marginTop: 16,
//     padding: 16,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#e9e9e9',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.04,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   infoCardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   infoCardTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1E1E2F',
//     marginLeft: 10,
//   },
//   infoCardBody: {
//     fontSize: 14,
//     color: '#666',
//     lineHeight: 20,
//     marginBottom: 12,
//   },
//   infoCardFooter: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary + '10',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 8,
//   },
//   infoCardFooterText: {
//     fontSize: 13,
//     color: '#555',
//     marginLeft: 8,
//     flex: 1,
//   },
//   // ... rest unchanged
//   filterContainer: {
//     backgroundColor: '#fff',
//     paddingHorizontal: 16,
//     paddingTop: 12,
//     paddingBottom: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e9e9e9',
//   },
//   searchWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f0f0f0',
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     marginBottom: 10,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     paddingVertical: 8,
//     marginLeft: 8,
//     color: '#1E1E2F',
//   },
//   workTypeScroll: {
//     marginBottom: 4,
//   },
//   workTypeScrollContent: {
//     paddingVertical: 4,
//   },
//   filterChip: {
//     paddingHorizontal: 16,
//     paddingVertical: 6,
//     borderRadius: 20,
//     backgroundColor: '#f0f0f0',
//     marginRight: 8,
//   },
//   filterChipActive: {
//     backgroundColor: COLORS.primary + '20',
//     borderWidth: 1,
//     borderColor: COLORS.primary,
//   },
//   filterChipText: {
//     fontSize: 14,
//     color: '#555',
//   },
//   filterChipTextActive: {
//     color: COLORS.primary,
//     fontWeight: '500',
//   },
//   clearButton: {
//     alignSelf: 'flex-end',
//     paddingVertical: 4,
//     paddingHorizontal: 12,
//   },
//   clearButtonText: {
//     fontSize: 12,
//     color: COLORS.primary,
//     fontWeight: '500',
//   },
//   card: {
//     backgroundColor: '#fff',
//     marginHorizontal: 16,
//     marginTop: 12,
//     padding: 16,
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   cardContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatar: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: COLORS.primary + '20',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   avatarText: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },
//   info: {
//     flex: 1,
//   },
//   name: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1E1E2F',
//   },
//   phone: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 2,
//   },
//   workTypes: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginTop: 4,
//   },
//   workTypeChip: {
//     backgroundColor: '#f0f0f0',
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 12,
//     marginRight: 4,
//   },
//   workTypeText: {
//     fontSize: 11,
//     color: '#555',
//   },
//   more: {
//     fontSize: 12,
//     color: '#999',
//     marginLeft: 4,
//   },
//   empty: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 60,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: '500',
//     color: '#666',
//     marginTop: 12,
//   },
//   emptySubtext: {
//     fontSize: 14,
//     color: '#999',
//     marginTop: 4,
//   },
//   fab: {
//     position: 'absolute',
//     bottom: 30,
//     right: 30,
//     backgroundColor: COLORS.primary,
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 6,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//   },
// });

// export default TeamList;




// screens/host/TeamList.js
// import React, { useState, useCallback, useMemo } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   RefreshControl,
//   TextInput,
//   ScrollView,
//   Alert,
// } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../../constants/colors';
// import ROUTES from '../../../constants/routes';
// import { tSafe } from '../../../utils/tSafe';
// import userService from '../../../services/connection/userService';

// const ALL_WORK_TYPES = ['Plumbing', 'Electrical', 'Handyman', 'HVAC', 'Painting', 'Carpentry', 'Gardening', 'Cleaning', 'Pest Control', 'Supplier', 'Contractor', 'Other'];

// const TeamList = ({ navigation }) => {
//   const [members, setMembers] = useState([]);
//   const [filteredMembers, setFilteredMembers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [searchText, setSearchText] = useState('');
//   const [selectedWorkType, setSelectedWorkType] = useState(null);

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       const res = await userService.getTeamMembers();
//       setMembers(res.data || []);
//       setFilteredMembers(res.data || []);
//     } catch (error) {
//       console.error('Failed to fetch team members:', error);
//       Alert.alert('Error', 'Could not load team members');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       loadData();
//     }, [])
//   );

//   const handleRefresh = () => {
//     setRefreshing(true);
//     loadData();
//   };

//   useMemo(() => {
//     let filtered = members;
//     if (selectedWorkType) {
//       filtered = filtered.filter(member =>
//         member.workTypes.includes(selectedWorkType)
//       );
//     }
//     if (searchText.trim()) {
//       const lower = searchText.toLowerCase().trim();
//       filtered = filtered.filter(member =>
//         member.name.toLowerCase().includes(lower) ||
//         member.phone.includes(lower) ||
//         (member.email && member.email.toLowerCase().includes(lower))
//       );
//     }
//     setFilteredMembers(filtered);
//   }, [members, searchText, selectedWorkType]);

//   const clearFilters = () => {
//     setSearchText('');
//     setSelectedWorkType(null);
//   };

//   const renderItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.card}
//       onPress={() =>
//         navigation.navigate(ROUTES.host_team_form, {
//           mode: 'edit',
//           memberId: item._id,
//           memberData: item,
//         })
//       }
//     >
//       <View style={styles.cardContent}>
//         <View style={styles.avatar}>
//           <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
//         </View>
//         <View style={styles.info}>
//           <Text style={styles.name}>{item.name}</Text>
//           <Text style={styles.phone}>{item.phone}</Text>
//           <View style={styles.workTypes}>
//             {item.workTypes.slice(0, 2).map((type, idx) => (
//               <View key={idx} style={styles.workTypeChip}>
//                 <Text style={styles.workTypeText}>{type}</Text>
//               </View>
//             ))}
//             {item.workTypes.length > 2 && (
//               <Text style={styles.more}>+{item.workTypes.length - 2}</Text>
//             )}
//           </View>
//         </View>
//         <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
//       </View>
//     </TouchableOpacity>
//   );

//   if (loading && !refreshing) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* ---- NEW INFO CARD ---- */}
//       <View style={styles.infoCard}>
//         <View style={styles.infoCardHeader}>
//           <MaterialCommunityIcons name="account-group" size={28} color={COLORS.primary} />
//           <Text style={styles.infoCardTitle}>{tSafe('team_vendors_title', 'Your Team & Vendors')}</Text>
//         </View>
//         <Text style={styles.infoCardBody}>
//           {tSafe(
//             'team_vendors_description',
//             'Store and manage your network of external professionals – plumbers, electricians, handymen, suppliers, and more. Add their contact details, work types, and quickly notify them when an issue arises at any of your properties.'
//           )}
//         </Text>
//         <View style={styles.infoCardFooter}>
//           <MaterialCommunityIcons name="bell-outline" size={16} color={COLORS.primary} />
//           <Text style={styles.infoCardFooterText}>
//             {tSafe('team_vendors_footer', 'Tap a member to edit, or use the + button to add someone new.')}
//           </Text>
//         </View>
//       </View>

//       {/* Search and Filter Bar */}
//       <View style={styles.filterContainer}>
//         <View style={styles.searchWrapper}>
//           <MaterialCommunityIcons name="magnify" size={24} color="#999" />
//           <TextInput
//             style={styles.searchInput}
//             placeholder={tSafe('search_team', 'Search by name, phone or email...')}
//             placeholderTextColor="#999"
//             value={searchText}
//             onChangeText={setSearchText}
//             clearButtonMode="while-editing"
//           />
//           {searchText.length > 0 && (
//             <TouchableOpacity onPress={() => setSearchText('')}>
//               <MaterialCommunityIcons name="close-circle" size={20} color="#999" />
//             </TouchableOpacity>
//           )}
//         </View>

//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           style={styles.workTypeScroll}
//           contentContainerStyle={styles.workTypeScrollContent}
//         >
//           <TouchableOpacity
//             style={[
//               styles.filterChip,
//               !selectedWorkType && styles.filterChipActive,
//             ]}
//             onPress={() => setSelectedWorkType(null)}
//           >
//             <Text
//               style={[
//                 styles.filterChipText,
//                 !selectedWorkType && styles.filterChipTextActive,
//               ]}
//             >
//               {tSafe('all', 'All')}
//             </Text>
//           </TouchableOpacity>

//           {ALL_WORK_TYPES.map((type) => (
//             <TouchableOpacity
//               key={type}
//               style={[
//                 styles.filterChip,
//                 selectedWorkType === type && styles.filterChipActive,
//               ]}
//               onPress={() =>
//                 setSelectedWorkType(selectedWorkType === type ? null : type)
//               }
//             >
//               <Text
//                 style={[
//                   styles.filterChipText,
//                   selectedWorkType === type && styles.filterChipTextActive,
//                 ]}
//               >
//                 {type}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>

//         {(searchText || selectedWorkType) && (
//           <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
//             <Text style={styles.clearButtonText}>{tSafe('clear', 'Clear')}</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       <FlatList
//         data={filteredMembers}
//         keyExtractor={(item) => item._id}
//         renderItem={renderItem}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
//         }
//         ListEmptyComponent={
//           <View style={styles.empty}>
//             <MaterialCommunityIcons name="account-group-outline" size={48} color="#ccc" />
//             <Text style={styles.emptyText}>
//               {searchText || selectedWorkType
//                 ? tSafe('no_matching_members', 'No matching team members')
//                 : tSafe('no_team_members', 'No team members yet')}
//             </Text>
//             <Text style={styles.emptySubtext}>
//               {searchText || selectedWorkType
//                 ? tSafe('try_different_filter', 'Try a different filter')
//                 : tSafe('add_member_hint', 'Tap + to add your first team member')}
//             </Text>
//           </View>
//         }
//       />

//       <TouchableOpacity
//         style={styles.fab}
//         onPress={() =>
//           navigation.navigate(ROUTES.host_team_form, {
//             mode: 'create',
//           })
//         }
//       >
//         <MaterialCommunityIcons name="plus" size={28} color="#fff" />
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fe',
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   // ---- Info Card Styles (popping) ----
//   infoCard: {
//     backgroundColor: '#fff',
//     marginHorizontal: 16,
//     marginTop: 16,
//     padding: 16,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: COLORS.primary + '30',
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.12,
//     shadowRadius: 12,
//     elevation: 6,
//   },
//   infoCardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   infoCardTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1E1E2F',
//     marginLeft: 12,
//   },
//   infoCardBody: {
//     fontSize: 14,
//     color: '#555',
//     lineHeight: 22,
//     marginBottom: 14,
//   },
//   infoCardFooter: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary + '12',
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: COLORS.primary + '20',
//   },
//   infoCardFooterText: {
//     fontSize: 13,
//     color: '#444',
//     marginLeft: 10,
//     flex: 1,
//     fontWeight: '500',
//   },
//   // ---- rest unchanged ----
//   filterContainer: {
//     backgroundColor: '#fff',
//     paddingHorizontal: 16,
//     paddingTop: 12,
//     paddingBottom: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e9e9e9',
//   },
//   searchWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f0f0f0',
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     marginBottom: 10,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     paddingVertical: 8,
//     marginLeft: 8,
//     color: '#1E1E2F',
//   },
//   workTypeScroll: {
//     marginBottom: 4,
//   },
//   workTypeScrollContent: {
//     paddingVertical: 4,
//   },
//   filterChip: {
//     paddingHorizontal: 16,
//     paddingVertical: 6,
//     borderRadius: 20,
//     backgroundColor: '#f0f0f0',
//     marginRight: 8,
//   },
//   filterChipActive: {
//     backgroundColor: COLORS.primary + '20',
//     borderWidth: 1,
//     borderColor: COLORS.primary,
//   },
//   filterChipText: {
//     fontSize: 14,
//     color: '#555',
//   },
//   filterChipTextActive: {
//     color: COLORS.primary,
//     fontWeight: '500',
//   },
//   clearButton: {
//     alignSelf: 'flex-end',
//     paddingVertical: 4,
//     paddingHorizontal: 12,
//   },
//   clearButtonText: {
//     fontSize: 12,
//     color: COLORS.primary,
//     fontWeight: '500',
//   },
//   card: {
//     backgroundColor: '#fff',
//     marginHorizontal: 16,
//     marginTop: 12,
//     padding: 16,
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   cardContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatar: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: COLORS.primary + '20',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   avatarText: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },
//   info: {
//     flex: 1,
//   },
//   name: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1E1E2F',
//   },
//   phone: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 2,
//   },
//   workTypes: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginTop: 4,
//   },
//   workTypeChip: {
//     backgroundColor: '#f0f0f0',
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 12,
//     marginRight: 4,
//   },
//   workTypeText: {
//     fontSize: 11,
//     color: '#555',
//   },
//   more: {
//     fontSize: 12,
//     color: '#999',
//     marginLeft: 4,
//   },
//   empty: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 60,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: '500',
//     color: '#666',
//     marginTop: 12,
//   },
//   emptySubtext: {
//     fontSize: 14,
//     color: '#999',
//     marginTop: 4,
//   },
//   fab: {
//     position: 'absolute',
//     bottom: 30,
//     right: 30,
//     backgroundColor: COLORS.primary,
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 6,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//   },
// });

// export default TeamList;



import React, {
  useState,
  useCallback,
  useMemo,
} from 'react';

import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';

import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import ROUTES from '../../../constants/routes';
import { tSafe } from '../../../utils/tSafe';
import userService from '../../../services/connection/userService';

import { useTheme } from '../../../theme';
import { AppText } from '../../../ui';

// =============================================================================
// CONFIGURATION
// =============================================================================

const ALL_WORK_TYPES = [
  'Plumbing',
  'Electrical',
  'Handyman',
  'HVAC',
  'Painting',
  'Carpentry',
  'Gardening',
  'Cleaning',
  'Pest Control',
  'Supplier',
  'Contractor',
  'Other',
];

const INITIALS_COLORS = [
  '#DDF4FF',
  '#E5F7E9',
  '#FCE8DD',
  '#EEE6FF',
  '#FFF2CC',
  '#FCE4EC',
];

const INITIALS_TEXT_COLORS = [
  '#006B8F',
  '#237A3B',
  '#9A4A1C',
  '#6842A0',
  '#856404',
  '#AD2858',
];

// =============================================================================
// HELPERS
// =============================================================================

const getInitials = (name) => {
  if (!name || typeof name !== 'string') {
    return '?';
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
};

const normalizeWorkTypes = (workTypes) => {
  if (Array.isArray(workTypes)) {
    return workTypes.filter(
      (type) => typeof type === 'string' && type.trim()
    );
  }

  if (typeof workTypes === 'string' && workTypes.trim()) {
    return [workTypes.trim()];
  }

  return [];
};

const normalizeMember = (member, index = 0) => {
  const safeMember =
    member && typeof member === 'object' ? member : {};

  return {
    ...safeMember,
    _id: safeMember._id || safeMember.id || `member-${index}`,
    name:
      typeof safeMember.name === 'string' &&
      safeMember.name.trim()
        ? safeMember.name.trim()
        : tSafe('unnamed_member', 'Unnamed Member'),
    phone:
      typeof safeMember.phone === 'string'
        ? safeMember.phone
        : '',
    email:
      typeof safeMember.email === 'string'
        ? safeMember.email
        : '',
    workTypes: normalizeWorkTypes(safeMember.workTypes),
  };
};

const TeamList = ({ navigation }) => {
  const { theme, isDark } = useTheme();

  const styles = useMemo(
    () => createStyles(theme, isDark),
    [theme, isDark]
  );

  // ===========================================================================
  // STATE
  // ===========================================================================

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState(null);
  const [loadError, setLoadError] = useState(false);

  // ===========================================================================
  // LOAD TEAM MEMBERS
  // ===========================================================================

  const loadData = useCallback(async (options = {}) => {
    const { silent = false } = options;

    if (!silent) {
      setLoading(true);
    }

    setLoadError(false);

    try {
      const response = await userService.getTeamMembers();

      const rawMembers = Array.isArray(response?.data)
        ? response.data
        : [];

      const normalizedMembers = rawMembers.map(
        (member, index) => normalizeMember(member, index)
      );

      setMembers(normalizedMembers);
    } catch (error) {
      console.error(
        'Failed to fetch team members:',
        error
      );

      setLoadError(true);

      Alert.alert(
        tSafe('error', 'Error'),
        tSafe(
          'team_load_error',
          'Could not load team members. Please try again.'
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();

      return undefined;
    }, [loadData])
  );

  // ===========================================================================
  // REFRESH
  // ===========================================================================

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData({ silent: true });
  }, [loadData]);

  // ===========================================================================
  // SEARCH AND FILTERING
  // ===========================================================================

  const filteredMembers = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return members.filter((member) => {
      const matchesWorkType =
        !selectedWorkType ||
        member.workTypes.some(
          (type) =>
            type.toLowerCase() ===
            selectedWorkType.toLowerCase()
        );

      if (!matchesWorkType) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableValues = [
        member.name,
        member.phone,
        member.email,
        ...member.workTypes,
      ];

      return searchableValues.some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(query)
      );
    });
  }, [members, searchText, selectedWorkType]);

  const hasActiveFilters =
    Boolean(searchText.trim()) ||
    Boolean(selectedWorkType);

  const clearFilters = useCallback(() => {
    setSearchText('');
    setSelectedWorkType(null);
  }, []);

  // ===========================================================================
  // STATISTICS
  // ===========================================================================

  const statistics = useMemo(() => {
    const workTypeSet = new Set();

    members.forEach((member) => {
      member.workTypes.forEach((type) => {
        workTypeSet.add(type.toLowerCase());
      });
    });

    return {
      totalMembers: members.length,
      totalWorkTypes: workTypeSet.size,
      filteredMembers: filteredMembers.length,
    };
  }, [members, filteredMembers]);

  // ===========================================================================
  // NAVIGATION
  // ===========================================================================

  const openCreateForm = useCallback(() => {
    navigation.navigate(ROUTES.host_team_form, {
      mode: 'create',
    });
  }, [navigation]);

  const openEditForm = useCallback(
    (member) => {
      if (!member?._id || String(member._id).startsWith('member-')) {
        Alert.alert(
          tSafe('error', 'Error'),
          tSafe(
            'member_id_missing',
            'This member cannot be opened because their ID is missing.'
          )
        );

        return;
      }

      navigation.navigate(ROUTES.host_team_form, {
        mode: 'edit',
        memberId: member._id,
        memberData: member,
      });
    },
    [navigation]
  );

  // ===========================================================================
  // MEMBER CARD
  // ===========================================================================

  const renderMember = useCallback(
    ({ item, index }) => {
      const initials = getInitials(item.name);

      const colorIndex =
        index % INITIALS_COLORS.length;

      const visibleWorkTypes =
        item.workTypes.slice(0, 2);

      const remainingWorkTypes =
        Math.max(0, item.workTypes.length - 2);

      return (
        <TouchableOpacity
          style={styles.memberCard}
          onPress={() => openEditForm(item)}
          activeOpacity={0.78}
          accessibilityRole="button"
          accessibilityLabel={`${item.name}, ${tSafe(
            'edit_member',
            'Edit team member'
          )}`}
        >
          {/* Avatar */}

          <View
            style={[
              styles.memberAvatar,
              {
                backgroundColor:
                  INITIALS_COLORS[colorIndex],
              },
            ]}
          >
            <AppText
              variant="title"
              color={INITIALS_TEXT_COLORS[colorIndex]}
              weight="700"
              style={styles.avatarInitials}
            >
              {initials}
            </AppText>
          </View>

          {/* Member details */}

          <View style={styles.memberInfo}>
            <AppText
              variant="title"
              color={theme.text.primary}
              weight="700"
              numberOfLines={1}
              style={styles.memberName}
            >
              {item.name}
            </AppText>

            {item.phone ? (
              <View style={styles.memberDetailRow}>
                <MaterialCommunityIcons
                  name="phone-outline"
                  size={14}
                  color={theme.icon.muted}
                />

                <AppText
                  variant="caption"
                  color={theme.text.secondary}
                  numberOfLines={1}
                  style={styles.memberDetailText}
                >
                  {item.phone}
                </AppText>
              </View>
            ) : null}

            {item.email ? (
              <View style={styles.memberDetailRow}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={14}
                  color={theme.icon.muted}
                />

                <AppText
                  variant="caption"
                  color={theme.text.secondary}
                  numberOfLines={1}
                  style={styles.memberDetailText}
                >
                  {item.email}
                </AppText>
              </View>
            ) : null}

            {/* Work types */}

            {visibleWorkTypes.length > 0 ? (
              <View style={styles.workTypeList}>
                {visibleWorkTypes.map((type) => (
                  <View
                    key={type}
                    style={styles.memberWorkTypeChip}
                  >
                    <AppText
                      variant="caption"
                      color={theme.text.secondary}
                      weight="600"
                      numberOfLines={1}
                    >
                      {type}
                    </AppText>
                  </View>
                ))}

                {remainingWorkTypes > 0 ? (
                  <View style={styles.moreWorkTypesChip}>
                    <AppText
                      variant="caption"
                      color={theme.brand.primary}
                      weight="700"
                    >
                      +{remainingWorkTypes}
                    </AppText>
                  </View>
                ) : null}
              </View>
            ) : (
              <AppText
                variant="caption"
                color={theme.text.muted}
                style={styles.noWorkTypesText}
              >
                {tSafe(
                  'no_work_types',
                  'No work types specified'
                )}
              </AppText>
            )}
          </View>

          {/* Navigation affordance */}

          <View style={styles.memberArrow}>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={theme.icon.muted}
            />
          </View>
        </TouchableOpacity>
      );
    },
    [styles, theme, openEditForm]
  );

  // ===========================================================================
  // LOADING SCREEN
  // ===========================================================================

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingIconContainer}>
          <MaterialCommunityIcons
            name="account-group-outline"
            size={34}
            color={theme.brand.primary}
          />
        </View>

        <ActivityIndicator
          size="large"
          color={theme.brand.primary}
          style={styles.loadingIndicator}
        />

        <AppText
          variant="bodyMedium"
          color={theme.text.secondary}
          weight="600"
        >
          {tSafe(
            'loading_team_members',
            'Loading your team...'
          )}
        </AppText>
      </View>
    );
  }

  // ===========================================================================
  // EMPTY STATE
  // ===========================================================================

  const renderEmptyState = () => {
    if (loadError) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <MaterialCommunityIcons
              name="cloud-alert-outline"
              size={38}
              color={theme.status.error}
            />
          </View>

          <AppText
            variant="heading"
            color={theme.text.primary}
            align="center"
            style={styles.emptyTitle}
          >
            {tSafe(
              'team_load_failed_title',
              'Unable to load your team'
            )}
          </AppText>

          <AppText
            variant="body"
            color={theme.text.secondary}
            align="center"
            style={styles.emptyDescription}
          >
            {tSafe(
              'team_load_failed_description',
              'Check your connection and try loading your team again.'
            )}
          </AppText>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadData()}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="refresh"
              size={18}
              color={theme.button.primaryText}
            />

            <AppText
              variant="bodyMedium"
              color={theme.button.primaryText}
              weight="700"
              style={styles.retryButtonText}
            >
              {tSafe('retry', 'Try Again')}
            </AppText>
          </TouchableOpacity>
        </View>
      );
    }

    const hasFilters = hasActiveFilters;

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <MaterialCommunityIcons
            name={
              hasFilters
                ? 'filter-remove-outline'
                : 'account-group-outline'
            }
            size={42}
            color={theme.icon.muted}
          />
        </View>

        <AppText
          variant="heading"
          color={theme.text.primary}
          align="center"
          style={styles.emptyTitle}
        >
          {hasFilters
            ? tSafe(
                'no_matching_members',
                'No matching team members'
              )
            : tSafe(
                'no_team_members',
                'Your team starts here'
              )}
        </AppText>

        <AppText
          variant="body"
          color={theme.text.secondary}
          align="center"
          style={styles.emptyDescription}
        >
          {hasFilters
            ? tSafe(
                'try_different_filter',
                'Try another search or change your filters.'
              )
            : tSafe(
                'add_member_hint',
                'Add your first professional to keep important contacts organized.'
              )}
        </AppText>

        {hasFilters ? (
          <TouchableOpacity
            style={styles.secondaryActionButton}
            onPress={clearFilters}
            activeOpacity={0.8}
          >
            <AppText
              variant="bodyMedium"
              color={theme.brand.primary}
              weight="700"
            >
              {tSafe('clear_filters', 'Clear Filters')}
            </AppText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={openCreateForm}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="plus"
              size={19}
              color={theme.button.primaryText}
            />

            <AppText
              variant="bodyMedium"
              color={theme.button.primaryText}
              weight="700"
              style={styles.retryButtonText}
            >
              {tSafe(
                'add_team_member',
                'Add Team Member'
              )}
            </AppText>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ===========================================================================
  // MAIN SCREEN
  // ===========================================================================

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background.default}
      />

      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => String(item._id)}
        renderItem={renderMember}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          filteredMembers.length === 0 &&
            styles.listContentEmpty,
        ]}
        ItemSeparatorComponent={() => (
          <View style={styles.listSeparator} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.brand.primary}
            colors={[theme.brand.primary]}
            progressBackgroundColor={theme.surface.elevated}
          />
        }
        ListHeaderComponent={
          <View>
            {/* ============================================================
                HERO
            ============================================================= */}

            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroIconContainer}>
                  <MaterialCommunityIcons
                    name="toolbox-outline"
                    size={29}
                    color={theme.hero.foreground}
                  />
                </View>

                <View style={styles.heroBadge}>
                  <View style={styles.heroBadgeDot} />

                  <AppText
                    variant="caption"
                    color={theme.hero.foreground}
                    weight="700"
                  >
                    {tSafe('team_management', 'TEAM MANAGEMENT')}
                  </AppText>
                </View>
              </View>

              <AppText
                variant="display"
                color={theme.hero.foreground}
                style={styles.heroTitle}
              >
                {tSafe(
                  'team_vendors_title',
                  'Your Team & Vendors'
                )}
              </AppText>

              <AppText
                variant="body"
                color={theme.hero.mutedForeground}
                style={styles.heroDescription}
              >
                {tSafe(
                  'team_vendors_description',
                  'Keep your trusted professionals, contractors, and service providers organized in one place.'
                )}
              </AppText>

              <TouchableOpacity
                style={styles.heroAction}
                onPress={openCreateForm}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={tSafe(
                  'add_team_member',
                  'Add Team Member'
                )}
              >
                <MaterialCommunityIcons
                  name="plus"
                  size={19}
                  color={theme.button.primaryText}
                />

                <AppText
                  variant="bodyMedium"
                  color={theme.button.primaryText}
                  weight="700"
                  style={styles.heroActionText}
                >
                  {tSafe(
                    'add_team_member',
                    'Add Team Member'
                  )}
                </AppText>
              </TouchableOpacity>
            </View>

            {/* ============================================================
                STATISTICS
            ============================================================= */}

            <View style={styles.statisticsRow}>
              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconContainer,
                    {
                      backgroundColor:
                        theme.brand.primary + '18',
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="account-group-outline"
                    size={21}
                    color={theme.brand.primary}
                  />
                </View>

                <AppText
                  variant="heading"
                  color={theme.text.primary}
                  style={styles.statValue}
                >
                  {statistics.totalMembers}
                </AppText>

                <AppText
                  variant="caption"
                  color={theme.text.secondary}
                >
                  {tSafe('total_members', 'Team Members')}
                </AppText>
              </View>

              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconContainer,
                    {
                      backgroundColor:
                        theme.status.success + '18',
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="briefcase-check-outline"
                    size={21}
                    color={theme.status.success}
                  />
                </View>

                <AppText
                  variant="heading"
                  color={theme.text.primary}
                  style={styles.statValue}
                >
                  {statistics.totalWorkTypes}
                </AppText>

                <AppText
                  variant="caption"
                  color={theme.text.secondary}
                >
                  {tSafe('work_categories', 'Work Categories')}
                </AppText>
              </View>
            </View>

            {/* ============================================================
                SEARCH AND FILTERS
            ============================================================= */}

            <View style={styles.filterSection}>
              <View style={styles.sectionHeadingRow}>
                <View>
                  <AppText
                    variant="heading"
                    color={theme.text.primary}
                    style={styles.sectionHeading}
                  >
                    {tSafe(
                      'your_professionals',
                      'Your Professionals'
                    )}
                  </AppText>

                  <AppText
                    variant="caption"
                    color={theme.text.secondary}
                  >
                    {tSafe(
                      'professionals_count',
                      '{{count}} contacts',
                      {
                        count: statistics.totalMembers,
                      }
                    )}
                  </AppText>
                </View>

                {hasActiveFilters && (
                  <TouchableOpacity
                    onPress={clearFilters}
                    activeOpacity={0.7}
                  >
                    <AppText
                      variant="bodyMedium"
                      color={theme.brand.primary}
                      weight="700"
                    >
                      {tSafe('clear', 'Clear')}
                    </AppText>
                  </TouchableOpacity>
                )}
              </View>

              {/* Search input */}

              <View style={styles.searchWrapper}>
                <MaterialCommunityIcons
                  name="magnify"
                  size={22}
                  color={theme.icon.muted}
                />

                <TextInput
                  style={styles.searchInput}
                  placeholder={tSafe(
                    'search_team',
                    'Search name, phone, email or service...'
                  )}
                  placeholderTextColor={
                    theme.input.placeholder
                  }
                  value={searchText}
                  onChangeText={setSearchText}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                  accessibilityLabel={tSafe(
                    'search_team',
                    'Search team members'
                  )}
                />

                {searchText.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchText('')}
                    style={styles.clearSearchButton}
                    accessibilityRole="button"
                    accessibilityLabel={tSafe(
                      'clear_search',
                      'Clear search'
                    )}
                  >
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={20}
                      color={theme.icon.muted}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* Work-type filters */}

              <View style={styles.filterLabelRow}>
                <MaterialCommunityIcons
                  name="filter-variant"
                  size={17}
                  color={theme.icon.muted}
                />

                <AppText
                  variant="caption"
                  color={theme.text.secondary}
                  weight="600"
                  style={styles.filterLabel}
                >
                  {tSafe(
                    'filter_by_service',
                    'Filter by service'
                  )}
                </AppText>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.workTypeScrollContent}
              >
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    !selectedWorkType &&
                      styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedWorkType(null)}
                  activeOpacity={0.75}
                >
                  {!selectedWorkType && (
                    <MaterialCommunityIcons
                      name="check"
                      size={14}
                      color={theme.brand.primary}
                    />
                  )}

                  <AppText
                    variant="caption"
                    color={
                      !selectedWorkType
                        ? theme.brand.primary
                        : theme.text.secondary
                    }
                    weight={
                      !selectedWorkType ? '700' : '500'
                    }
                  >
                    {tSafe('all', 'All Services')}
                  </AppText>
                </TouchableOpacity>

                {ALL_WORK_TYPES.map((type) => {
                  const active =
                    selectedWorkType === type;

                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.filterChip,
                        active && styles.filterChipActive,
                      ]}
                      onPress={() =>
                        setSelectedWorkType(
                          active ? null : type
                        )
                      }
                      activeOpacity={0.75}
                    >
                      {active && (
                        <MaterialCommunityIcons
                          name="check"
                          size={14}
                          color={theme.brand.primary}
                        />
                      )}

                      <AppText
                        variant="caption"
                        color={
                          active
                            ? theme.brand.primary
                            : theme.text.secondary
                        }
                        weight={active ? '700' : '500'}
                      >
                        {type}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Results count */}

              {hasActiveFilters && (
                <View style={styles.resultsRow}>
                  <AppText
                    variant="caption"
                    color={theme.text.secondary}
                  >
                    {tSafe(
                      'filtered_results',
                      'Showing {{shown}} of {{total}} contacts',
                      {
                        shown: statistics.filteredMembers,
                        total: statistics.totalMembers,
                      }
                    )}
                  </AppText>
                </View>
              )}
            </View>

            {/* ============================================================
                RESULTS HEADER
            ============================================================= */}

            {filteredMembers.length > 0 && (
              <View style={styles.resultsHeading}>
                <AppText
                  variant="subtitle"
                  color={theme.text.primary}
                  weight="700"
                >
                  {hasActiveFilters
                    ? tSafe(
                        'matching_members',
                        'Matching Members'
                      )
                    : tSafe(
                        'all_team_members',
                        'All Team Members'
                      )}
                </AppText>

                <View style={styles.resultsCountBadge}>
                  <AppText
                    variant="caption"
                    color={theme.brand.primary}
                    weight="700"
                  >
                    {filteredMembers.length}
                  </AppText>
                </View>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={
          filteredMembers.length > 0 ? (
            <View style={styles.listFooter}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={16}
                color={theme.icon.muted}
              />

              <AppText
                variant="caption"
                color={theme.text.muted}
                style={styles.listFooterText}
              >
                {tSafe(
                  'team_contacts_footer',
                  'Your professional contacts, organized in one place.'
                )}
              </AppText>
            </View>
          ) : (
            <View style={styles.emptyFooterSpace} />
          )
        }
      />

      {/* =====================================================================
          FLOATING ACTION BUTTON
      ====================================================================== */}

      {members.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={openCreateForm}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={tSafe(
            'add_team_member',
            'Add Team Member'
          )}
          accessibilityHint={tSafe(
            'add_team_member_hint',
            'Opens the form to add a new professional'
          )}
        >
          <MaterialCommunityIcons
            name="plus"
            size={27}
            color={theme.button.primaryText}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

// =============================================================================
// THEME-AWARE STYLES
// =============================================================================

const createStyles = (theme, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    // -------------------------------------------------------------------------
    // LOADING
    // -------------------------------------------------------------------------

    loadingScreen: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background.default,
      padding: 24,
    },

    loadingIconContainer: {
      width: 76,
      height: 76,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.brand.primary + '18',
      marginBottom: 20,
    },

    loadingIndicator: {
      marginBottom: 15,
    },

    // -------------------------------------------------------------------------
    // LIST
    // -------------------------------------------------------------------------

    listContent: {
      paddingBottom: 110,
    },

    listContentEmpty: {
      flexGrow: 1,
    },

    listSeparator: {
      height: 0,
    },

    // -------------------------------------------------------------------------
    // HERO
    // -------------------------------------------------------------------------

    heroCard: {
      marginHorizontal: 16,
      marginTop: 16,
      padding: 21,
      borderRadius: 24,
      backgroundColor: theme.hero.background,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.brand.primary + '25',
    },

    heroTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 19,
      gap: 10,
    },

    heroIconContainer: {
      width: 52,
      height: 52,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.13)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.15)',
    },

    heroBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.10)',
    },

    heroBadgeDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: theme.hero.foreground,
    },

    heroTitle: {
      fontSize: 27,
      lineHeight: 34,
      marginBottom: 9,
    },

    heroDescription: {
      lineHeight: 22,
      marginBottom: 21,
    },

    heroAction: {
      minHeight: 47,
      paddingHorizontal: 17,
      borderRadius: 13,
      backgroundColor: theme.button.primaryBackground,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-start',
      gap: 8,
    },

    heroActionText: {
      fontSize: 14,
    },

    // -------------------------------------------------------------------------
    // STATISTICS
    // -------------------------------------------------------------------------

    statisticsRow: {
      flexDirection: 'row',
      marginHorizontal: 16,
      marginTop: 14,
      gap: 12,
    },

    statCard: {
      flex: 1,
      minWidth: 0,
      padding: 15,
      borderRadius: 19,
      backgroundColor: theme.card.background,
      borderWidth: 1,
      borderColor: theme.card.border,
    },

    statIconContainer: {
      width: 39,
      height: 39,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },

    statValue: {
      fontSize: 25,
      lineHeight: 31,
      marginBottom: 3,
    },

    // -------------------------------------------------------------------------
    // FILTER SECTION
    // -------------------------------------------------------------------------

    filterSection: {
      marginTop: 25,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
    },

    sectionHeadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 18,
      marginBottom: 15,
    },

    sectionHeading: {
      fontSize: 21,
      marginBottom: 4,
    },

    searchWrapper: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      paddingHorizontal: 14,
      borderRadius: 15,
      backgroundColor: theme.input.background,
      borderWidth: 1,
      borderColor: theme.input.border,
    },

    searchInput: {
      flex: 1,
      minWidth: 0,
      color: theme.input.text,
      fontSize: 14,
      paddingVertical: Platform.OS === 'ios' ? 14 : 10,
      marginLeft: 9,
    },

    clearSearchButton: {
      padding: 5,
    },

    filterLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 18,
      marginTop: 17,
      marginBottom: 9,
    },

    filterLabel: {
      marginLeft: 6,
    },

    workTypeScrollContent: {
      paddingHorizontal: 16,
      paddingVertical: 3,
      gap: 8,
    },

    filterChip: {
      minHeight: 36,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingHorizontal: 13,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: theme.surface.default,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    filterChipActive: {
      backgroundColor: theme.brand.primary + '15',
      borderColor: theme.brand.primary,
    },

    resultsRow: {
      marginTop: 11,
      marginHorizontal: 18,
    },

    // -------------------------------------------------------------------------
    // RESULTS HEADER
    // -------------------------------------------------------------------------

    resultsHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 19,
      marginBottom: 2,
      marginHorizontal: 18,
      gap: 9,
    },

    resultsCountBadge: {
      minWidth: 27,
      height: 27,
      paddingHorizontal: 7,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.brand.primary + '15',
    },

    // -------------------------------------------------------------------------
    // MEMBER CARD
    // -------------------------------------------------------------------------

    memberCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginHorizontal: 16,
      marginTop: 12,
      padding: 15,
      borderRadius: 19,
      backgroundColor: theme.card.background,
      borderWidth: 1,
      borderColor: theme.card.border,
      gap: 12,

      ...Platform.select({
        ios: {
          shadowColor: theme.shadow.color,
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowOpacity: isDark ? 0.12 : 0.035,
          shadowRadius: 8,
        },

        android: {
          elevation: isDark ? 1 : 2,
        },
      }),
    },

    memberAvatar: {
      width: 51,
      height: 51,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    avatarInitials: {
      fontSize: 17,
    },

    memberInfo: {
      flex: 1,
      minWidth: 0,
      paddingTop: 1,
    },

    memberName: {
      fontSize: 16,
      marginBottom: 7,
    },

    memberDetailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
      gap: 6,
    },

    memberDetailText: {
      flex: 1,
      minWidth: 0,
    },

    workTypeList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      marginTop: 6,
      gap: 6,
    },

    memberWorkTypeChip: {
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: theme.background.sunken,
      borderWidth: 1,
      borderColor: theme.border.default,
      maxWidth: '100%',
    },

    moreWorkTypesChip: {
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: theme.brand.primary + '15',
    },

    noWorkTypesText: {
      marginTop: 7,
    },

    memberArrow: {
      width: 29,
      height: 35,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 7,
    },

    // -------------------------------------------------------------------------
    // EMPTY STATES
    // -------------------------------------------------------------------------

    emptyContainer: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 30,
      paddingVertical: 45,
      minHeight: 290,
    },

    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 26,
      backgroundColor: theme.background.sunken,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 19,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    emptyTitle: {
      fontSize: 21,
      marginBottom: 9,
    },

    emptyDescription: {
      maxWidth: 310,
      lineHeight: 22,
      marginBottom: 20,
    },

    retryButton: {
      minHeight: 45,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
      borderRadius: 13,
      backgroundColor: theme.button.primaryBackground,
      gap: 8,
    },

    retryButtonText: {
      fontSize: 14,
    },

    secondaryActionButton: {
      minHeight: 42,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.brand.primary,
    },

    // -------------------------------------------------------------------------
    // FOOTER
    // -------------------------------------------------------------------------

    listFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 12,
      gap: 7,
    },

    listFooterText: {
      textAlign: 'center',
      flexShrink: 1,
    },

    emptyFooterSpace: {
      height: 35,
    },

    // -------------------------------------------------------------------------
    // FLOATING ACTION BUTTON
    // -------------------------------------------------------------------------

    fab: {
      position: 'absolute',
      right: 22,
      bottom: Platform.OS === 'ios' ? 27 : 22,
      width: 59,
      height: 59,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.button.primaryBackground,
      borderWidth: 1,
      borderColor: theme.brand.primary + '35',

      ...Platform.select({
        ios: {
          shadowColor: theme.shadow.color,
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: isDark ? 0.3 : 0.17,
          shadowRadius: 10,
        },

        android: {
          elevation: 7,
        },
      }),
    },
  });

export default TeamList;