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
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../../constants/colors';
import ROUTES from '../../../constants/routes';
import { tSafe } from '../../../utils/tSafe';
import userService from '../../../services/connection/userService';

const ALL_WORK_TYPES = ['Plumbing', 'Electrical', 'Handyman', 'HVAC', 'Painting', 'Carpentry', 'Gardening', 'Cleaning', 'Pest Control', 'Supplier', 'Contractor', 'Other'];

const TeamList = ({ navigation }) => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await userService.getTeamMembers();
      setMembers(res.data || []);
      setFilteredMembers(res.data || []);
    } catch (error) {
      console.error('Failed to fetch team members:', error);
      Alert.alert('Error', 'Could not load team members');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  useMemo(() => {
    let filtered = members;
    if (selectedWorkType) {
      filtered = filtered.filter(member =>
        member.workTypes.includes(selectedWorkType)
      );
    }
    if (searchText.trim()) {
      const lower = searchText.toLowerCase().trim();
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(lower) ||
        member.phone.includes(lower) ||
        (member.email && member.email.toLowerCase().includes(lower))
      );
    }
    setFilteredMembers(filtered);
  }, [members, searchText, selectedWorkType]);

  const clearFilters = () => {
    setSearchText('');
    setSelectedWorkType(null);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate(ROUTES.host_team_form, {
          mode: 'edit',
          memberId: item._id,
          memberData: item,
        })
      }
    >
      <View style={styles.cardContent}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.phone}>{item.phone}</Text>
          <View style={styles.workTypes}>
            {item.workTypes.slice(0, 2).map((type, idx) => (
              <View key={idx} style={styles.workTypeChip}>
                <Text style={styles.workTypeText}>{type}</Text>
              </View>
            ))}
            {item.workTypes.length > 2 && (
              <Text style={styles.more}>+{item.workTypes.length - 2}</Text>
            )}
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ---- NEW INFO CARD ---- */}
      <View style={styles.infoCard}>
        <View style={styles.infoCardHeader}>
          <MaterialCommunityIcons name="account-group" size={28} color={COLORS.primary} />
          <Text style={styles.infoCardTitle}>{tSafe('team_vendors_title', 'Your Team & Vendors')}</Text>
        </View>
        <Text style={styles.infoCardBody}>
          {tSafe(
            'team_vendors_description',
            'Store and manage your network of external professionals – plumbers, electricians, handymen, suppliers, and more. Add their contact details, work types, and quickly notify them when an issue arises at any of your properties.'
          )}
        </Text>
        <View style={styles.infoCardFooter}>
          <MaterialCommunityIcons name="bell-outline" size={16} color={COLORS.primary} />
          <Text style={styles.infoCardFooterText}>
            {tSafe('team_vendors_footer', 'Tap a member to edit, or use the + button to add someone new.')}
          </Text>
        </View>
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.filterContainer}>
        <View style={styles.searchWrapper}>
          <MaterialCommunityIcons name="magnify" size={24} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder={tSafe('search_team', 'Search by name, phone or email...')}
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            clearButtonMode="while-editing"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.workTypeScroll}
          contentContainerStyle={styles.workTypeScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              !selectedWorkType && styles.filterChipActive,
            ]}
            onPress={() => setSelectedWorkType(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                !selectedWorkType && styles.filterChipTextActive,
              ]}
            >
              {tSafe('all', 'All')}
            </Text>
          </TouchableOpacity>

          {ALL_WORK_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterChip,
                selectedWorkType === type && styles.filterChipActive,
              ]}
              onPress={() =>
                setSelectedWorkType(selectedWorkType === type ? null : type)
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedWorkType === type && styles.filterChipTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {(searchText || selectedWorkType) && (
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>{tSafe('clear', 'Clear')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="account-group-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchText || selectedWorkType
                ? tSafe('no_matching_members', 'No matching team members')
                : tSafe('no_team_members', 'No team members yet')}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchText || selectedWorkType
                ? tSafe('try_different_filter', 'Try a different filter')
                : tSafe('add_member_hint', 'Tap + to add your first team member')}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate(ROUTES.host_team_form, {
            mode: 'create',
          })
        }
      >
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fe',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ---- Info Card Styles (popping) ----
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1E2F',
    marginLeft: 12,
  },
  infoCardBody: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 14,
  },
  infoCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '12',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  infoCardFooterText: {
    fontSize: 13,
    color: '#444',
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },
  // ---- rest unchanged ----
  filterContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9e9e9',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    marginLeft: 8,
    color: '#1E1E2F',
  },
  workTypeScroll: {
    marginBottom: 4,
  },
  workTypeScrollContent: {
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary + '20',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: '#555',
  },
  filterChipTextActive: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  clearButton: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.primary,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1E2F',
  },
  phone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  workTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  workTypeChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 4,
  },
  workTypeText: {
    fontSize: 11,
    color: '#555',
  },
  more: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});

export default TeamList;