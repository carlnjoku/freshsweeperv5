// import React, { useEffect, useState, useContext } from 'react';
// import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
// import { Text, Card, ActivityIndicator, FAB } from 'react-native-paper';
// import { useNavigation } from '@react-navigation/native';
// import { MaterialIcons } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// import userService from '../../services/connection/userService';
// import { AuthContext } from '../../context/AuthContext';
// import ROUTES from '../../constants/routes';

// export default function Checklist() {
//     const { currentUserId } = useContext(AuthContext);
//     const navigation = useNavigation();
//     const [checklists, setChecklists] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [refreshing, setRefreshing] = useState(false);
  
//     const fetchChecklists = async () => {
//       setLoading(true);
//       try {
//         const res = await userService.getChecklists(currentUserId);
//         console.log("Checklistttttttt", res.data)
//         setChecklists(res.data || []);
//       } catch (err) {
//         console.error('Failed to fetch checklists:', err);
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     useEffect(() => {
//       fetchChecklists();
//     }, []);
  
//     const onRefresh = async () => {
//       setRefreshing(true);
//       await fetchChecklists();
//       setRefreshing(false);
//     };
  
//     const renderChecklist = ({ item }) => (
//       <TouchableOpacity
//         onPress={() => navigation.navigate('ChecklistDetails', { checklistId: item._id })}
//       >
//         <Card style={styles.card}>
//           <Card.Title
//             title={item.checklistName || 'Unnamed Checklist'}
//             subtitle={`Property: ${item.propertyName || 'N/A'}`}
//             left={() => (
//               <MaterialIcons
//                 name="checklist"
//                 size={28}
//                 color={COLORS.primary}
//                 style={{ marginLeft: 4 }}
//               />
//             )}
//           />
//           <Card.Content>
//             <Text variant="bodySmall">Groups: {Object.keys(item.checklist || {}).length}</Text>
//             <Text variant="bodySmall">Created: {new Date(item.createdAt).toLocaleDateString()}</Text>
//           </Card.Content>
//         </Card>
//       </TouchableOpacity>
//     );
  
//     if (loading) {
//       return (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text>Loading checklists...</Text>
//         </View>
//       );
//     }
  
//     return (
//       <View style={styles.container}>
//         <FlatList
//           data={checklists}
//           keyExtractor={(item) => item._id}
//           renderItem={renderChecklist}
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//           ListEmptyComponent={<Text style={styles.emptyText}>No checklists found.</Text>}
//         />
//         <FAB
//           icon="plus"
//           label="New Checklist"
//           style={styles.fab}
//           onPress={() => navigation.navigate(ROUTES.host_create_checklist)}
//         />
//       </View>
//     );
// }


// const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: '#fff',
//       padding: 10,
//     },
//     card: {
//       marginBottom: 12,
//       backgroundColor: '#fafafa',
//     },
//     loadingContainer: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//     fab: {
//       position: 'absolute',
//       right: 16,
//       bottom: 16,
//       backgroundColor: COLORS.primary,
//     },
//     emptyText: {
//       textAlign: 'center',
//       marginTop: 40,
//       fontSize: 16,
//       color: COLORS.gray,
//     },
//   });
  


// import React, { useEffect, useState, useContext } from 'react';
// import { 
//   View, 
//   FlatList, 
//   StyleSheet, 
//   TouchableOpacity, 
//   RefreshControl, 
//   Dimensions,
//   ImageBackground
// } from 'react-native';
// import { Text, Card, ActivityIndicator, FAB } from 'react-native-paper';
// import { useNavigation } from '@react-navigation/native';
// import { MaterialIcons } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// import userService from '../../services/connection/userService';
// import { AuthContext } from '../../context/AuthContext';
// import ROUTES from '../../constants/routes';

// const { width } = Dimensions.get('window');
// const CARD_WIDTH = width - 40;

// export default function Checklist() {
//   const { currentUserId } = useContext(AuthContext);
//   const navigation = useNavigation();
//   const [checklists, setChecklists] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const fetchChecklists = async () => {
//     setLoading(true);
//     try {
//       const res = await userService.getChecklists(currentUserId);
//       setChecklists(res.data || []);
//     } catch (err) {
//       console.error('Failed to fetch checklists:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchChecklists();
//   }, []);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchChecklists();
//     setRefreshing(false);
//   };

//   const renderChecklist = ({ item }) => (
//     <TouchableOpacity
//       onPress={() => navigation.navigate(ROUTES.host_edit_checklist, { checklistId: item._id })}
//       activeOpacity={0.9}
//     >
//       <Card style={styles.card}>
//         <Card.Content style={styles.cardContent}>
//           <View style={styles.cardHeader}>
//             <View style={styles.iconContainer}>
//               <MaterialIcons
//                 name="checklist"
//                 size={24}
//                 color={COLORS.primary}
//               />
//             </View>
//             <View style={styles.titleContainer}>
//               <Text variant="titleMedium" style={styles.cardTitle}>
//                 {item.checklistName || 'Unnamed Checklist'}
//               </Text>
//               <Text variant="bodySmall" style={styles.propertyText}>
//                 {item.propertyName || 'N/A'}
//               </Text>
//             </View>
//           </View>
          
//           <View style={styles.detailsContainer}>
//             <View style={styles.detailPill}>
//               <Text variant="labelSmall" style={styles.detailLabel}>GROUPS</Text>
//               <Text variant="bodyMedium" style={styles.detailValue}>
//                 {Object.keys(item.checklist || {}).length}
//               </Text>
//             </View>
            
//             <View style={styles.divider} />
            
//             <View style={styles.detailPill}>
//               <Text variant="labelSmall" style={styles.detailLabel}>CREATED</Text>
//               <Text variant="bodyMedium" style={styles.detailValue}>
//                 {new Date(item.createdAt).toLocaleDateString()}
//               </Text>
//             </View>
//           </View>
//         </Card.Content>
//       </Card>
//     </TouchableOpacity>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>Loading your checklists</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
     
//       {checklists.length > 0 ? (
//         <FlatList
//           data={checklists}
//           keyExtractor={(item) => item._id}
//           renderItem={renderChecklist}
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//           contentContainerStyle={styles.listContainer}
//           showsVerticalScrollIndicator={false}
//         />
//       ) : (
//         <View style={styles.emptyContainer}>
//           <MaterialIcons name="checklist" size={60} color="#e0e0e0" />
//           <Text style={styles.emptyTitle}>No Checklists Yet</Text>
//           <Text style={styles.emptySubtitle}>Create your first checklist to get started</Text>
//         </View>
//       )}
      
//       <FAB
//         icon="plus"
//         label="New Checklist"
//         style={styles.fab}
//         onPress={() => navigation.navigate(ROUTES.host_create_checklist)}
//         color="white"
//         uppercase={false}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8faff',
//     paddingHorizontal: 0,
//   },
//   listContainer: {
//     padding: 20,
//     paddingBottom: 100,
//   },
//   card: {
//     marginBottom: 16,
//     borderRadius: 16,
//     overflow: 'hidden',
//     backgroundColor: '#fff',
//     elevation: 3,
//     shadowColor: '#3d5afe',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//   },
//   cardContent: {
//     padding: 16,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   iconContainer: {
//     backgroundColor: '#eef4ff',
//     borderRadius: 12,
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   titleContainer: {
//     flex: 1,
//   },
//   cardTitle: {
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 4,
//     fontSize: 16,
//   },
//   propertyText: {
//     color: '#6c757d',
//     fontSize: 13,
//   },
//   detailsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f8f9fe',
//     borderRadius: 12,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//   },
//   detailPill: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   detailLabel: {
//     color: '#6c757d',
//     marginBottom: 2,
//     fontWeight: '500',
//     letterSpacing: 0.5,
//     fontSize: 12,
//   },
//   detailValue: {
//     fontWeight: '600',
//     color: COLORS.dark,
//     fontSize: 14,
//   },
//   divider: {
//     width: 1,
//     height: 30,
//     backgroundColor: '#e0e7ff',
//     marginHorizontal: 8,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f8faff',
//   },
//   loadingText: {
//     marginTop: 20,
//     color: COLORS.gray,
//     fontSize: 16,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 40,
//     backgroundColor: '#f8faff',
//   },
//   emptyTitle: {
//     fontSize: 22,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginTop: 20,
//     marginBottom: 8,
//   },
//   emptySubtitle: {
//     fontSize: 16,
//     color: COLORS.gray,
//     textAlign: 'center',
//     maxWidth: 300,
//   },
//   fab: {
//     position: 'absolute',
//     right: 24,
//     bottom: 24,
//     backgroundColor: COLORS.primary,
//     borderRadius: 16,
//     paddingHorizontal: 20,
//     height: 56,
//   },
// });
 
  

// import React, { useEffect, useState, useContext } from 'react';
// import { 
//   View, 
//   FlatList, 
//   StyleSheet, 
//   TouchableOpacity, 
//   RefreshControl, 
//   Dimensions,
//   Alert,
//   Modal
// } from 'react-native';
// import { 
//   Text, 
//   Card, 
//   ActivityIndicator, 
//   FAB, 
//   Divider, 
//   Menu,
//   Button
// } from 'react-native-paper';
// import { useNavigation } from '@react-navigation/native';
// import { MaterialIcons, MaterialCommunityIcons, Feather, AntDesign } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// import userService from '../../services/connection/userService';
// import { AuthContext } from '../../context/AuthContext';
// import ROUTES from '../../constants/routes';
// import Toast from 'react-native-toast-message';

// const { width } = Dimensions.get('window');

// export default function Checklist() {
//   const { currentUserId, userToken } = useContext(AuthContext);
//   const navigation = useNavigation();
//   const [checklists, setChecklists] = useState([]);
//   const [groupedChecklists, setGroupedChecklists] = useState([]);
//   const [expandedSections, setExpandedSections] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [menuVisible, setMenuVisible] = useState(null);
//   const [deleteModalVisible, setDeleteModalVisible] = useState(false);
//   const [selectedChecklist, setSelectedChecklist] = useState(null);

//   // Group checklists by property
//   const groupChecklistsByProperty = (checklistsData) => {
//     const grouped = {};
    
//     checklistsData.forEach(checklist => {
//       if (!checklist) return;
      
//       const key = checklist.propertyId || checklist.propertyName || 'unknown';
//       const propertyName = checklist.propertyName || 'Unknown Property';
      
//       if (!grouped[key]) {
//         grouped[key] = {
//           propertyId: key,
//           propertyName: propertyName,
//           checklists: []
//         };
//       }
      
//       grouped[key].checklists.push(checklist);
//     });
    
//     return Object.values(grouped);
//   };

//   const fetchChecklists = async () => {
//     setLoading(true);
//     try {
//       const res = await userService.getChecklists(currentUserId);
//       const checklistsData = res?.data || [];
//       setChecklists(checklistsData);
//       console.log(JSON.stringify(checklistsData, null, 2))
//       const grouped = groupChecklistsByProperty(checklistsData);
//       setGroupedChecklists(grouped);
      
//       // Initialize all sections as expanded
//       const initialExpanded = {};
//       grouped.forEach(group => {
//         initialExpanded[group.propertyId] = true;
//       });
//       setExpandedSections(initialExpanded);
//     } catch (err) {
//       console.error('Failed to fetch checklists:', err);
//       Toast.show({
//         type: 'error',
//         text1: 'Failed to load checklists',
//         text2: 'Please try again',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchChecklists();
//   }, []);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchChecklists();
//     setRefreshing(false);
//   };

//   const toggleSection = (propertyId) => {
//     setExpandedSections(prev => ({
//       ...prev,
//       [propertyId]: !prev[propertyId]
//     }));
//   };

//   const handleEditChecklist = (checklist) => {
//     navigation.navigate(ROUTES.host_edit_checklist, { 
//       checklistId: checklist._id,
//       onChecklistUpdated: fetchChecklists
//     });
//   };

//   const handleViewChecklist = (checklist) => {
//     navigation.navigate(ROUTES.host_view_checklist, { 
//       checklistId: checklist._id 
//     });
//   };

//   const handleDuplicateChecklist = async (checklist) => {
//     try {
//       const duplicateData = {
//         ...checklist,
//         checklistName: `${checklist.checklistName} (Copy)`,
//         hostId: currentUserId
//       };
      
//       delete duplicateData._id;
//       delete duplicateData.createdAt;
//       delete duplicateData.updatedAt;
      
//       const res = await userService.saveChecklist(duplicateData, {
//         headers: { Authorization: `Bearer ${userToken}` }
//       });
      
//       if (res.status === 200) {
//         Toast.show({
//           type: 'success',
//           text1: 'Checklist duplicated',
//           text2: 'A copy has been created',
//         });
//         fetchChecklists();
//       }
//     } catch (err) {
//       console.error('Failed to duplicate checklist:', err);
//       Toast.show({
//         type: 'error',
//         text1: 'Failed to duplicate checklist',
//       });
//     }
//   };

//   const confirmDeleteChecklist = (checklist) => {
//     setSelectedChecklist(checklist);
//     setDeleteModalVisible(true);
//   };

//   const handleDeleteChecklist = async () => {
//     if (!selectedChecklist) return;
    
//     try {
//       const res = await userService.deleteChecklist(selectedChecklist._id, {
//         headers: { Authorization: `Bearer ${userToken}` }
//       });
      
//       if (res.status === 200) {
//         Toast.show({
//           type: 'success',
//           text1: 'Checklist deleted',
//           text2: 'The checklist has been removed',
//         });
//         fetchChecklists();
//         setDeleteModalVisible(false);
//         setSelectedChecklist(null);
//       }
//     } catch (err) {
//       console.error('Failed to delete checklist:', err);
//       Toast.show({
//         type: 'error',
//         text1: 'Failed to delete checklist',
//         text2: 'Please try again',
//       });
//     }
//   };

//   const renderChecklistItem = (checklist) => {
//     const checklistData = checklist?.checklist || {};
//     const groupsCount = Object.keys(checklistData).length;
    
//     return (
//       <Card style={styles.card}>
//         <TouchableOpacity
//           onPress={() => handleViewChecklist(checklist)}
//           activeOpacity={0.7}
//           style={styles.cardTouchable}
//         >
//           <Card.Content style={styles.cardContent}>
//             <View style={styles.cardHeader}>
//               <View style={styles.iconContainer}>
//                 <MaterialIcons
//                   name="checklist"
//                   size={22}
//                   color={COLORS.primary}
//                 />
//               </View>
//               <View style={styles.titleContainer}>
//                 <Text style={styles.cardTitle}>
//                   {checklist?.checklistName || 'Unnamed Checklist'}
//                 </Text>
//                 <Text style={styles.propertyText}>
//                   {checklist?.propertyName || 'N/A'}
//                 </Text>
//               </View>
//               <Menu
//                 visible={menuVisible === checklist._id}
//                 onDismiss={() => setMenuVisible(null)}
//                 anchor={
//                   <TouchableOpacity
//                     style={styles.menuButton}
//                     onPress={() => setMenuVisible(checklist._id)}
//                   >
//                     <Feather name="more-vertical" size={20} color={COLORS.gray} />
//                   </TouchableOpacity>
//                 }
//                 style={styles.menu}
//               >
//                 <Menu.Item
//                   onPress={() => {
//                     setMenuVisible(null);
//                     handleEditChecklist(checklist);
//                   }}
//                   title="Edit"
//                   leadingIcon="pencil"
//                 />
//                 <Menu.Item
//                   onPress={() => {
//                     setMenuVisible(null);
//                     handleDuplicateChecklist(checklist);
//                   }}
//                   title="Duplicate"
//                   leadingIcon="content-copy"
//                 />
//                 <Divider />
//                 <Menu.Item
//                   onPress={() => {
//                     setMenuVisible(null);
//                     confirmDeleteChecklist(checklist);
//                   }}
//                   title="Delete"
//                   titleStyle={{ color: '#FF6B6B' }}
//                   leadingIcon="delete"
//                   iconColor="#FF6B6B"
//                 />
//               </Menu>
//             </View>
            
//             <View style={styles.detailsContainer}>
//               <View style={styles.detailPill}>
//                 <Text style={styles.detailLabel}>GROUPS</Text>
//                 <Text style={styles.detailValue}>
//                   {groupsCount}
//                 </Text>
//               </View>
              
//               <View style={styles.divider} />
              
//               <View style={styles.detailPill}>
//                 <Text style={styles.detailLabel}>CREATED</Text>
//                 <Text style={styles.detailValue}>
//                   {checklist?.createdAt ? new Date(checklist.createdAt).toLocaleDateString() : 'N/A'}
//                 </Text>
//               </View>
//             </View>
            
//             <View style={styles.actionButtons}>
//               <TouchableOpacity
//                 style={styles.viewButton}
//                 onPress={() => handleViewChecklist(checklist)}
//               >
//                 <Feather name="eye" size={16} color={COLORS.primary} />
//                 <Text style={styles.viewButtonText}>View</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 style={styles.editButton}
//                 onPress={() => handleEditChecklist(checklist)}
//               >
//                 <Feather name="edit-2" size={16} color="#fff" />
//                 <Text style={styles.editButtonText}>Edit</Text>
//               </TouchableOpacity>
//             </View>
//           </Card.Content>
//         </TouchableOpacity>
//       </Card>
//     );
//   };

//   const renderPropertySection = ({ item: propertyGroup }) => {
//     const isExpanded = expandedSections[propertyGroup.propertyId] !== false;
    
//     return (
//       <View style={styles.propertySection}>
//         <TouchableOpacity
//           style={styles.sectionHeader}
//           onPress={() => toggleSection(propertyGroup.propertyId)}
//           activeOpacity={0.7}
//         >
//           <View style={styles.sectionHeaderContent}>
//             <View style={styles.sectionTitleContainer}>
//               <MaterialCommunityIcons 
//                 name="office-building" 
//                 size={22} 
//                 color={COLORS.primary} 
//                 style={styles.sectionIcon}
//               />
//               <Text style={styles.sectionTitle}>{propertyGroup.propertyName}</Text>
//               <View style={styles.countBadge}>
//                 <Text style={styles.countText}>{propertyGroup.checklists.length}</Text>
//               </View>
//             </View>
//             <AntDesign
//               name={isExpanded ? 'down' : 'right'}
//               size={18}
//               color={COLORS.gray}
//             />
//           </View>
//           <Divider style={styles.sectionDivider} />
//         </TouchableOpacity>
        
//         {isExpanded && (
//           <View style={styles.checklistsContainer}>
//             {propertyGroup.checklists.map((checklist) => (
//               <View key={checklist._id} style={styles.checklistItem}>
//                 {renderChecklistItem(checklist)}
//               </View>
//             ))}
//           </View>
//         )}
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>Loading your checklists</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Checklists</Text>
//         <Text style={styles.headerSubtitle}>
//           Manage your cleaning checklists ({checklists.length} total)
//         </Text>
//       </View>
     
//       {checklists.length > 0 ? (
//         <FlatList
//           data={groupedChecklists}
//           keyExtractor={(item) => item.propertyId}
//           renderItem={renderPropertySection}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//           }
//           contentContainerStyle={styles.listContainer}
//           showsVerticalScrollIndicator={false}
//         />
//       ) : (
//         <View style={styles.emptyContainer}>
//           <MaterialIcons name="checklist" size={60} color="#e0e0e0" />
//           <Text style={styles.emptyTitle}>No Checklists Yet</Text>
//           <Text style={styles.emptySubtitle}>
//             Create your first checklist to get started
//           </Text>
//           <TouchableOpacity
//             style={styles.createFirstButton}
//             onPress={() => navigation.navigate(ROUTES.host_create_checklist)}
//           >
//             <Text style={styles.createFirstButtonText}>Create First Checklist</Text>
//           </TouchableOpacity>
//         </View>
//       )}
      
//       <FAB
//         icon="plus"
//         label="New Checklist"
//         style={styles.fab}
//         onPress={() => navigation.navigate(ROUTES.host_create_checklist)}
//         color="white"
//         uppercase={false}
//       />

//       {/* Delete Confirmation Modal */}
//       <Modal
//         visible={deleteModalVisible}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setDeleteModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeader}>
//               <MaterialIcons name="warning" size={24} color="#FF6B6B" />
//               <Text style={styles.modalTitle}>Delete Checklist</Text>
//             </View>
            
//             <Text style={styles.modalText}>
//               Are you sure you want to delete "{selectedChecklist?.checklistName}"?
//               This action cannot be undone.
//             </Text>
            
//             <View style={styles.modalButtons}>
//               <TouchableOpacity
//                 style={[styles.modalButton, styles.cancelButton]}
//                 onPress={() => {
//                   setDeleteModalVisible(false);
//                   setSelectedChecklist(null);
//                 }}
//               >
//                 <Text style={styles.cancelButtonText}>Cancel</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 style={[styles.modalButton, styles.deleteButton]}
//                 onPress={handleDeleteChecklist}
//               >
//                 <Text style={styles.deleteButtonText}>Delete</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8faff',
//   },
//   header: {
//     paddingHorizontal: 20,
//     paddingTop: 20,
//     paddingBottom: 15,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eef2ff',
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: COLORS.dark,
//     marginBottom: 4,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: COLORS.gray,
//   },
//   listContainer: {
//     paddingBottom: 100,
//   },
//   propertySection: {
//     marginBottom: 16,
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     marginHorizontal: 16,
//     marginTop: 8,
//     overflow: 'hidden',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   sectionHeader: {
//     backgroundColor: '#fff',
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//   },
//   sectionHeaderContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   sectionTitleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   sectionIcon: {
//     marginRight: 10,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     flex: 1,
//   },
//   countBadge: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 12,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     marginLeft: 10,
//   },
//   countText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   sectionDivider: {
//     backgroundColor: '#eef2ff',
//     height: 1,
//     marginTop: 12,
//   },
//   checklistsContainer: {
//     padding: 8,
//   },
//   checklistItem: {
//     marginBottom: 12,
//   },
//   card: {
//     borderRadius: 12,
//     backgroundColor: '#fff',
//     elevation: 1,
//   },
//   cardTouchable: {
//     borderRadius: 12,
//   },
//   cardContent: {
//     padding: 16,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   iconContainer: {
//     backgroundColor: '#eef4ff',
//     borderRadius: 10,
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   titleContainer: {
//     flex: 1,
//   },
//   cardTitle: {
//     fontWeight: '600',
//     color: COLORS.dark,
//     fontSize: 16,
//     marginBottom: 2,
//   },
//   propertyText: {
//     color: '#6c757d',
//     fontSize: 13,
//   },
//   menuButton: {
//     padding: 8,
//     marginLeft: 8,
//   },
//   menu: {
//     marginTop: 40,
//     marginRight: 10,
//   },
//   detailsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f8f9fe',
//     borderRadius: 8,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     marginBottom: 12,
//   },
//   detailPill: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   detailLabel: {
//     color: '#6c757d',
//     marginBottom: 2,
//     fontWeight: '500',
//     letterSpacing: 0.5,
//     fontSize: 11,
//   },
//   detailValue: {
//     fontWeight: '600',
//     color: COLORS.dark,
//     fontSize: 13,
//   },
//   divider: {
//     width: 1,
//     height: 24,
//     backgroundColor: '#e0e7ff',
//     marginHorizontal: 8,
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   viewButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     backgroundColor: '#f0f9ff',
//     borderRadius: 6,
//   },
//   viewButtonText: {
//     color: COLORS.primary,
//     fontWeight: '600',
//     fontSize: 14,
//     marginLeft: 6,
//   },
//   editButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 20,
//     backgroundColor: COLORS.primary,
//     borderRadius: 6,
//   },
//   editButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 14,
//     marginLeft: 6,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f8faff',
//   },
//   loadingText: {
//     marginTop: 20,
//     color: COLORS.gray,
//     fontSize: 16,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 40,
//     backgroundColor: '#f8faff',
//   },
//   emptyTitle: {
//     fontSize: 22,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginTop: 20,
//     marginBottom: 8,
//   },
//   emptySubtitle: {
//     fontSize: 16,
//     color: COLORS.gray,
//     textAlign: 'center',
//     maxWidth: 300,
//     marginBottom: 30,
//   },
//   createFirstButton: {
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   createFirstButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   fab: {
//     position: 'absolute',
//     right: 24,
//     bottom: 24,
//     backgroundColor: COLORS.primary,
//     borderRadius: 16,
//     paddingHorizontal: 20,
//     height: 56,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   modalContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 24,
//     width: '100%',
//     maxWidth: 400,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.dark,
//     marginLeft: 12,
//   },
//   modalText: {
//     fontSize: 16,
//     color: COLORS.gray,
//     lineHeight: 22,
//     marginBottom: 24,
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     gap: 12,
//   },
//   modalButton: {
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     minWidth: 100,
//     alignItems: 'center',
//   },
//   cancelButton: {
//     backgroundColor: '#f8f9fa',
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//   },
//   cancelButtonText: {
//     color: COLORS.gray,
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   deleteButton: {
//     backgroundColor: '#FF6B6B',
//   },
//   deleteButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 14,
//   },
// });




import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  RefreshControl, 
  Dimensions,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { 
  Text, 
  Card, 
  ActivityIndicator, 
  FAB, 
  Divider, 
  Menu,
  Avatar,
} from 'react-native-paper';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { 
  MaterialIcons, 
  MaterialCommunityIcons, 
  Feather, 
  AntDesign,
  Ionicons,
  FontAwesome5 
} from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import userService from '../../services/connection/userService';
import { AuthContext } from '../../context/AuthContext';
import ROUTES from '../../constants/routes';
import Toast from 'react-native-toast-message';


const { width } = Dimensions.get('window');


export default function Checklist() {
  const { currentUserId, currentUser, userToken, logout } = useContext(AuthContext);
  const navigation = useNavigation();
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Add this to your state variables in the Checklist component
  const [selectedChecklistForModal, setSelectedChecklistForModal] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const alertShownRef = useRef(false);


  const route = useRoute();

// useFocusEffect(
//   useCallback(() => {
//     const { status, message } = route.params || {};
//     // alert(message)
//     if (status === 'success' && message) {
//       Toast.show({
//         type: 'success',
//         text1: 'Success',
//         text2: message,
//       });

//       // 🔑 Clear params so it doesn't show again
//       navigation.setParams({
//         status: undefined,
//         mode: undefined,
//         message: undefined,
//       });
//     }
//   }, [route.params?.status, route.params?.message])
// );


useFocusEffect(
  useCallback(() => {
    const { status, message } = route.params || {};

    if (status === 'success' && message && !alertShownRef.current) {
      alertShownRef.current = true;

      Alert.alert(
        'Delete Checklist',
        message,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.setParams({
                status: undefined,
                mode: undefined,
                message: undefined,
              });

              // 🔓 allow future alerts
              alertShownRef.current = false;
            },
          },
        ],
        { cancelable: true }
      );
    }

    return () => {
      // reset when screen fully loses focus
      alertShownRef.current = false;
    };
  }, [route.params, navigation])
);


  // Add these functions in your Checklist component
const openChecklistModal = (checklist) => {
  setSelectedChecklistForModal(checklist);
  setModalVisible(true);
};

const closeModal = () => {
  setModalVisible(false);
  setSelectedChecklistForModal(null);
};

// Format room counts helper
const formatRoomCounts = (rooms) => {
  if (!rooms || !Array.isArray(rooms)) return '0 rooms';
  
  const roomCounts = {};
  rooms.forEach(room => {
    const roomType = room.split('_')[0];
    roomCounts[roomType] = (roomCounts[roomType] || 0) + 1;
  });
  
  return Object.entries(roomCounts)
    .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
    .join(', ');
};

// Format room label helper
const formatRoomLabel = (roomKey) => {
  if (!roomKey) return 'Room';
  const parts = roomKey.split('_');
  const roomType = parts[0] || 'Room';
  const roomNumber = parts[1] || '';
  
  // Capitalize first letter of room type
  const formattedType = roomType.charAt(0).toUpperCase() + roomType.slice(1);
  
  return roomNumber ? `${formattedType} ${parseInt(roomNumber) + 1}` : formattedType;
};


// Render tasks for a room
const renderRoomTasks = (roomData, roomKey) => {
  if (!roomData?.tasks || !Array.isArray(roomData.tasks)) {
    return (
      <Text style={styles.noTasksText}>No tasks assigned</Text>
    );
  }

  return (
    <View style={styles.tasksGrid}>
      {roomData.tasks.map((task, index) => (
        <View key={`task-${roomKey}-${index}`} style={styles.taskItem}>
          <View style={styles.taskIconContainer}>
            <Feather 
              name={task.value ? "check-circle" : "circle"} 
              size={16} 
              color={task.value ? "#10B981" : "#9CA3AF"} 
            />
          </View>
          <Text style={styles.taskText} numberOfLines={2}>
            {task.label || task.name || `Task ${index + 1}`}
          </Text>
        </View>
      ))}
    </View>
  );
};


  // Helper function to calculate duration
  const formatDuration = (minutes) => {
    if (minutes == null || isNaN(minutes)) return '0h : 00m';
  
    const totalMinutes = Math.round(minutes); // 🔑 normalize
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
  
    return `${hours}h : ${String(mins).padStart(2, '0')}m`;
  };
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // const fetchChecklists = async () => {
  //   setLoading(true);
  //   try {
  //     console.log("Fetching checklists for user:", currentUserId);
  //     const res = await userService.getChecklists(currentUserId);
      
  //     console.log("API Response structure:", Object.keys(res));
  //     console.log("Response has data property:", 'data' in res);
  //     console.log("res.data is array:", Array.isArray(res.data));
      
  //     // SIMPLE AND DIRECT DATA EXTRACTION
  //     let checklistsData = [];
      
  //     if (res && res.data) {
  //       if (Array.isArray(res.data)) {
  //         checklistsData = res.data;
  //       } else if (Array.isArray(res)) {
  //         checklistsData = res;
  //       }
  //     }
      
  //     console.log("Checklists data extracted:", checklistsData.length);
      
  //     // Log each checklist to verify structure
  //     checklistsData.forEach((item, index) => {
  //       console.log(`Checklist ${index}:`, {
  //         id: item._id,
  //         name: item.checklistName,
  //         hasPropertyId: !!item.propertyId,
  //         propertyId: item.propertyId
  //       });
  //     });
      
  //     setChecklists(checklistsData);
      
  //   } catch (err) {
  //     console.error('Failed to fetch checklists:', err);
  //     console.error('Error details:', err.response || err.message);
      
  //     Toast.show({
  //       type: 'error',
  //       text1: 'Failed to load checklists',
  //       text2: err.response?.data?.message || err.message || 'Please try again',
  //     });
      
  //     setChecklists([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchChecklists = async () => {
    setLoading(true);
    try {
      console.log("Fetching checklists for user:", currentUserId);
      const res = await userService.getChecklists(currentUserId);
  
      console.log("API Response structure:", Object.keys(res));
      console.log("Response has data property:", 'data' in res);
      console.log("res.data is array:", Array.isArray(res.data));
  
      // -------------------------------
      // 1️⃣ Extract data safely
      // -------------------------------
      let checklistsData = [];
  
      if (res && res.data) {
        if (Array.isArray(res.data)) {
          checklistsData = res.data;
        } else if (Array.isArray(res)) {
          checklistsData = res;
        }
      }
  
      console.log("Checklists data extracted:", checklistsData.length);
  
      // -------------------------------
      // 2️⃣ SORT: latest on top
      // -------------------------------
      const sortedChecklists = [...checklistsData].sort((a, b) => {
        // Preferred: createdAt
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
  
        // Fallback: MongoDB ObjectId timestamp
        return a._id < b._id ? 1 : -1;
      });
  
      // -------------------------------
      // 3️⃣ Debug structure
      // -------------------------------
      sortedChecklists.forEach((item, index) => {
        console.log(`Checklist ${index}:`, {
          id: item._id,
          name: item.checklistName,
          createdAt: item.createdAt,
          hasPropertyId: !!item.propertyId,
          propertyId: item.propertyId,
        });
      });
  
      // -------------------------------
      // 4️⃣ Save to state
      // -------------------------------
      setChecklists(sortedChecklists);
  
    } catch (err) {
      console.error('Failed to fetch checklists:', err);
      console.error('Error details:', err.response || err.message);
  
      Toast.show({
        type: 'error',
        text1: 'Failed to load checklists',
        text2: err.response?.data?.message || err.message || 'Please try again',
      });
  
      setChecklists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklists();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChecklists();
    setRefreshing(false);
  };

  const handleEditChecklist = (checklist) => {
    navigation.navigate(ROUTES.host_edit_checklist, { 
      checklistId: checklist._id,
      onChecklistUpdated: fetchChecklists
    });
  };
  const handleCreateChecklist = () => {
    navigation.navigate(ROUTES.host_create_checklist, { 
      // checklistId: checklist?._id,
      onChecklistCreated: fetchChecklists
    });
  };

  // const handleViewChecklist = (checklist) => {
  //   navigation.navigate(ROUTES.host_view_checklist, { 
  //     checklistId: checklist._id 
  //   });
  // };

  // const handleDuplicateChecklist = async (checklist) => {
  //   try {
  //     const duplicateData = {
  //       ...checklist,
  //       checklistName: `${checklist.checklistName} (Copy)`,
  //       apt_name: checklist.apartment_name,
  //       hostId: currentUserId
  //     };
      
  //     delete duplicateData._id;
  //     delete duplicateData.createdAt;
  //     delete duplicateData.updatedAt;
      
  //     const res = await userService.saveChecklist(duplicateData, {
  //       headers: { Authorization: `Bearer ${userToken}` }
  //     });
      
  //     if (res.status === 200) {
  //       Toast.show({
  //         type: 'success',
  //         text1: 'Checklist duplicated',
  //         text2: 'A copy has been created',
  //       });
  //       fetchChecklists();
  //     }
  //   } catch (err) {
  //     console.error('Failed to duplicate checklist:', err);
  //     Toast.show({
  //       type: 'error',
  //       text1: 'Failed to duplicate checklist',
  //     });
  //   }
  // };

  const handleDuplicateChecklist = async (checklist) => {
    try {
      const duplicateData = {
        ...checklist,
        checklistName: `${checklist.checklistName} (Copy)`,
        apt_name: checklist.apartment_name,
        hostId: currentUserId,
      };
  
      // Remove fields that must not be duplicated
      delete duplicateData._id;
      delete duplicateData.createdAt;
      delete duplicateData.updatedAt;
  
      const res = await userService.saveChecklist(duplicateData, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
  
      if (res.status === 200) {
        Alert.alert(
          'Checklist duplicated',
          'A copy has been created',
          [
            {
              text: 'OK',
              onPress: () => {
                fetchChecklists(); // Refresh list after user confirms
              },
            },
          ],
          { cancelable: true }
        );
      }
    } catch (err) {
      console.error('Failed to duplicate checklist:', err);
  
      Alert.alert(
        'Duplicate failed',
        'Unable to duplicate this checklist. Please try again.',
        [{ text: 'OK' }],
        { cancelable: true }
      );
    }
  };

  const confirmDeleteChecklist = (checklist) => {
    setSelectedChecklist(checklist);
    setDeleteModalVisible(true);
  };

  const showToast = (type, text1, text2) => {
    console.log(`Showing toast: ${type} - ${text1} - ${text2}`);
    Toast.show({
      type,
      text1,
      text2,
      position: 'top',
      visibilityTime: 8000,
      autoHide: true,
      topOffset: Platform.OS === 'ios' ? 50 : 30,
      bottomOffset: 40,
    });
  };

  

  const handleUnauthorized = () => {
    Alert.alert(
      'Session Expired',
      'Please log in again.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Clear local storage and context
            logout();
  
            // Reset navigation and navigate to Signin
            navigation.reset({
              index: 0,
              routes: [{ name: ROUTES.signin }],
            });
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleDeleteChecklist = (checklist_name, selectedChecklistId) => {
    // alert(selectedChecklistId)
    Alert.alert(
      'Delete Checklist',
      `Are you sure you want to delete "${checklist_name|| 'Unnamed Checklist'}}"? !This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log(`🗑️ Deleting checklis`);
              
              // Get token
             
         
              if (!userToken) {
                handleUnauthorized();
                return;
              }
            
              console.log('Using token for delete');
              
              // Make the delete request with proper headers
              const res = await userService.deleteChecklist(selectedChecklistId, userToken);
              
              console.log('Delete response:', res);
              
              if (res.status === 200 || res.data?.status === 'success') {
                Alert.alert(
                  'Success',
                  'Checklist has been removed successfully.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        fetchChecklists();
                      },
                    },
                  ],
                  { cancelable: true }
                );
              } else {
                throw new Error(`Server returned status: ${res.status}`);
              }
            } catch (err) {
              console.error('❌ Delete error:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
              });
              
              if (err.response?.status === 401) {
                handleUnauthorized();
              } else {
                let errorMessage = 'Please try again';
                
                if (err.response) {
                  const { status, data } = err.response;
                  
                  if (status === 404) {
                    errorMessage = 'Checklist not found. It may have already been deleted.';
                  } else if (status === 403) {
                    errorMessage = 'You are not authorized to delete this checklist.';
                  } else if (data?.detail) {
                    errorMessage = data.detail;
                  } else if (data?.message) {
                    errorMessage = data.message;
                  }
                } else if (err.request) {
                  errorMessage = 'Network error. Please check your connection.';
                } else {
                  errorMessage = err.message || 'Unknown error occurred.';
                }
                
                showToast('error', 'Failed to delete checklist', errorMessage);
              }
            }
          },
        },
      ]
    );
  };


  // const handleDeleteChecklist = async () => {
  //   if (!selectedChecklist) return;
    
  //   try {
  //     const res = await userService.deleteChecklist(selectedChecklist._id, {
  //       headers: { Authorization: `Bearer ${userToken}` }
  //     });
      
  //     if (res.status === 200) {
  //       Toast.show({
  //         type: 'success',
  //         text1: 'Checklist deleted',
  //         text2: 'The checklist has been removed',
  //       });
  //       fetchChecklists();
  //       setDeleteModalVisible(false);
  //       setSelectedChecklist(null);
  //     }
  //   } catch (err) {
  //     console.error('Failed to delete checklist:', err);
  //     Toast.show({
  //       type: 'error',
  //       text1: 'Failed to delete checklist',
  //       text2: 'Please try again',
  //     });
  //   }
  // };

  const getChecklistStats = (checklist) => {
    const checklistData = checklist?.checklist || {};
    const groups = Object.keys(checklistData);
    let totalTasks = 0;
    let totalTime = checklist.totalTime || 0;
    let totalFee = checklist.totalFee || 0;

    groups.forEach(groupKey => {
      const group = checklistData[groupKey];
      if (group && group.details) {
        const roomTypes = Object.keys(group.details);
        roomTypes.forEach(roomType => {
          const room = group.details[roomType];
          if (room && room.tasks && Array.isArray(room.tasks)) {
            totalTasks += room.tasks.length;
          }
        });
      }
    });

    return { 
      groups: groups.length, 
      totalTasks, 
      totalTime, 
      totalFee 
    };
  };

  // const formatDuration = (minutes) => {
  //   if (!minutes) return '0m';
  //   const hours = Math.floor(minutes / 60);
  //   const mins = minutes % 60;
  //   if (hours > 0) {
  //     return `${hours}h ${mins}m`;
  //   }
  //   return `${mins}m`;
  // };

  

  // Filter checklists based on search
  const filteredChecklists = searchQuery.trim() === '' 
    ? checklists 
    : checklists.filter(checklist =>
        checklist.checklistName?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const renderChecklistItem = ({ item: checklist }) => {
    const stats = getChecklistStats(checklist);
    
    return (
      <TouchableOpacity
      // onPress={(e) => {
      //   e.stopPropagation();
      //   handleEditChecklist(checklist);
      // }}
        activeOpacity={0.7}
        style={styles.cardWrapper}
      >
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.checklistIconContainer}>
                <MaterialIcons
                  name="checklist-rtl"
                  size={24}
                  color="#FFF"
                />
              </View>
              <View style={styles.checklistInfo}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {checklist.checklistName || 'Unnamed Checklist'}
                </Text>
                <View style={styles.propertyBadge}>
                  <Ionicons name="business-outline" size={12} color="#6B7280" />
                  <Text style={styles.propertyText} numberOfLines={1}>
                    {checklist.propertyId ? `${checklist.apartment_name}` : 'No Property'}
                  </Text>
                </View>
              </View>
              {/* <Menu
                visible={menuVisible === checklist._id}
                onDismiss={() => setMenuVisible(null)}
                anchor={
                  <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setMenuVisible(checklist._id)}
                  >
                    <Feather name="more-vertical" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                }
                style={styles.menu}
              >
                <Menu.Item
                  onPress={() => {
                    setMenuVisible(null);
                    handleEditChecklist(checklist);
                  }}
                  title="Edit"
                  leadingIcon="pencil"
                />
                <Menu.Item
                  onPress={() => {
                    setMenuVisible(null);
                    handleDuplicateChecklist(checklist);
                  }}
                  title="Duplicate"
                  leadingIcon="content-copy"
                />
                <Divider />
                <Menu.Item
                  onPress={() => {
                    setMenuVisible(null);
                    confirmDeleteChecklist(checklist);
                  }}
                  title="Delete"
                  titleStyle={{ color: '#EF4444' }}
                  leadingIcon="delete"
                  iconColor="#EF4444"
                />
              </Menu> */}
              <View style={styles.menuContainer}>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => setMenuVisible(checklist._id)}
                  activeOpacity={0.7}
                >
                  <Feather name="more-vertical" size={22} color="#6B7280" />
                </TouchableOpacity>

                {menuVisible === checklist._id && (
                  <>
                    {/* Backdrop */}
                    <TouchableOpacity
                      style={styles.menuBackdrop}
                      activeOpacity={1}
                      onPress={() => setMenuVisible(null)}
                    />
                    
                    {/* Menu Card */}
                    <Animated.View 
                      style={styles.menuCard}
                      entering={FadeIn.duration(150)}
                      exiting={FadeOut.duration(150)}
                    >
                      {/* <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                          setMenuVisible(null);
                          handleEditChecklist(checklist);
                        }}
                        activeOpacity={0.6}
                      >
                        <View style={[styles.menuIconContainer, { backgroundColor: '#EFF6FF' }]}>
                          <Feather name="edit-2" size={16} color="#3B82F6" />
                        </View>
                        <Text style={[styles.menuText, { color: '#111827' }]}>Edit</Text>
                        <Feather name="chevron-right" size={16} color="#9CA3AF" />
                      </TouchableOpacity> */}

                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                          setMenuVisible(null);
                          handleDuplicateChecklist(checklist);
                        }}
                        activeOpacity={0.6}
                      >
                        <View style={[styles.menuIconContainer, { backgroundColor: '#F0F9FF' }]}>
                          <Feather name="copy" size={16} color="#0EA5E9" />
                        </View>
                        <Text style={[styles.menuText, { color: '#111827' }]}>Duplicate</Text>
                        <Feather name="chevron-right" size={16} color="#9CA3AF" />
                      </TouchableOpacity>

                      <View style={styles.menuDivider} />

                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                          handleDeleteChecklist(checklist.checklistName, checklist._id)
                          // setMenuVisible(null);
                          // confirmDeleteChecklist(checklist);
                        }}
                        activeOpacity={0.6}
                      >
                        <View style={[styles.menuIconContainer, { backgroundColor: '#FEF2F2' }]}>
                          <Feather name="trash-2" size={16} color="#EF4444" />
                        </View>
                        <Text style={[styles.menuText, { color: '#EF4444' }]}>Delete</Text>
                        <Feather name="chevron-right" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </Animated.View>
                  </>
                )}
              </View>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.groups}</Text>
                <Text style={styles.statLabel}>Groups</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalTasks}</Text>
                <Text style={styles.statLabel}>Tasks</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatDuration(stats.totalTime)}</Text>
                <Text style={styles.statLabel}>Time</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>${stats.totalFee.toFixed(0)}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
            
            <View style={styles.footer}>
              <View style={styles.dateContainer}>
                <Feather name="calendar" size={14} color="#9CA3AF" />
                <Text style={styles.dateText}>
                  {formatDate(checklist.createdAt)}
                </Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.viewButton}
                  // onPress={(e) => {
                  //   e.stopPropagation();
                  //   handleEditChecklist(checklist);
                  // }}

                  onPress={(e) => {
                    e.stopPropagation();
                    openChecklistModal(checklist); // Changed from handleViewChecklist(checklist)
                  }}
                >
                  <Feather name="eye" size={16} color="#3B82F6" />
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editButton1}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleEditChecklist(checklist);
                  }}
                >
                  <Feather name="edit-2" size={16} color="#FFF" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.headerTitle}>Checklists</Text>
          <Text style={styles.headerSubtitle}>
            Manage cleaning protocols
          </Text>
        </View>
        <Avatar.Image 
          size={44}
          source={{ uri: currentUser.avatar }}
          style={styles.avatar}
        />
      </View>
      
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search checklists..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.statsBar}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{checklists.length}</Text>
          <Text style={styles.statLabel}>Total Checklists</Text>
        </View>
        <View style={styles.statDividerVertical} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {checklists.reduce((total, checklist) => {
              const stats = getChecklistStats(checklist);
              return total + stats.totalTasks;
            }, 0)}
          </Text>
          <Text style={styles.statLabel}>Total Tasks</Text>
        </View>
        <View style={styles.statDividerVertical} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            ${checklists.reduce((total, checklist) => {
              return total + (checklist.totalFee || 0);
            }, 0).toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your checklists</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
     
      {checklists.length > 0 ? (
        <FlatList
          data={filteredChecklists}
          keyExtractor={(item) => item._id}
          renderItem={renderChecklistItem}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 100 }} />}
          ListEmptyComponent={
            <View style={styles.emptySearchContainer}>
              <MaterialCommunityIcons 
                name="magnify"
                size={60}
                color="#E5E7EB"
              />
              <Text style={styles.emptyTitle}>No checklists found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIllustration}>
            <MaterialCommunityIcons 
              name="clipboard-list-outline"
              size={80}
              color="#E5E7EB"
            />
          </View>
          <Text style={styles.emptyTitle}>No checklists yet</Text>
          <Text style={styles.emptySubtitle}>
            Create your first checklist to streamline your cleaning operations
          </Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => navigation.navigate(ROUTES.host_create_checklist)}
          >
            <Feather name="plus" size={18} color="#FFF" />
            <Text style={styles.createFirstButtonText}>Create First Checklist</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <FAB
        icon="plus"
        style={styles.fab}
        
        onPress={(e) => {
          e.stopPropagation();
          handleCreateChecklist();
        }}
        color="#FFF"
        size="medium"
        animated
      />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <MaterialIcons name="delete-outline" size={48} color="#EF4444" />
            </View>
            
            <Text style={styles.modalTitle}>Delete Checklist</Text>
            
            <Text style={styles.modalText}>
              Are you sure you want to delete "{selectedChecklist?.checklistName}"? 
              This action cannot be undone.
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setSelectedChecklist(null);
                }}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDelete]}
                // onPress={handleDeleteChecklist}
              >
                <Feather name="trash-2" size={16} color="#FFF" />
                <Text style={styles.modalButtonDeleteText}>Delete2</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Checklist Details Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedChecklistForModal && (
              <>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderLeft}>
                    <View style={styles.modalChecklistIcon}>
                      <MaterialIcons
                        name="checklist-rtl"
                        size={24}
                        color="#FFF"
                      />
                    </View>
                    <View>
                      <Text style={styles.modalTitle} numberOfLines={1}>
                        {selectedChecklistForModal.checklistName}
                      </Text>
                      <Text style={styles.modalSubtitle}>
                        {selectedChecklistForModal.apartment_name || 'General Checklist'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={closeModal}
                  >
                    <MaterialIcons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                
                {/* Modal Content */}
                <ScrollView 
                  style={styles.modalContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Overview Section */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Overview</Text>
                    <View style={styles.infoGrid}>
                      <View style={styles.infoCard}>
                        <Feather name="calendar" size={20} color="#6B7280" />
                        <Text style={styles.infoLabel}>Created</Text>
                        <Text style={styles.infoValue}>
                          {formatDate(selectedChecklistForModal.createdAt)}
                        </Text>
                      </View>
                      
                      <View style={styles.infoCard}>
                        <Feather name="clock" size={20} color="#6B7280" />
                        <Text style={styles.infoLabel}>Total Time</Text>
                        <Text style={styles.infoValue}>
                          {formatDuration(selectedChecklistForModal.totalTime)}
                        </Text>
                      </View>
                      
                      <View style={styles.infoCard}>
                        <Feather name="dollar-sign" size={20} color="#6B7280" />
                        <Text style={styles.infoLabel}>Total Fee</Text>
                        <Text style={[styles.infoValue, styles.totalFee]}>
                          ${selectedChecklistForModal.totalFee?.toFixed(2) || '0.00'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Groups Section */}
                  {selectedChecklistForModal.checklist && Object.keys(selectedChecklistForModal.checklist).length > 0 && (
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>Cleaning Groups</Text>
                      
                      {Object.entries(selectedChecklistForModal.checklist).map(([groupId, group], index) => {
                        // Extract group number (e.g., "1" from "group_1")
                        const groupNumber = groupId.replace('group_', '').replace('group', '') || (index + 1);
                        const stats = getChecklistStats(selectedChecklistForModal);
                        
                        return (
                          <View key={groupId} style={styles.groupCard}>
                            {/* Group Header */}
                            <View style={styles.groupHeader}>
                              <View style={styles.groupTitleContainer}>
                                <View style={styles.groupIcon}>
                                  <Text style={styles.groupIconText}>
                                    {groupNumber}
                                  </Text>
                                </View>
                                <View>
                                  <Text style={styles.groupName}>Group {groupNumber}</Text>
                                  <Text style={styles.groupSubtitle}>
                                    {group.rooms?.length || 0} rooms • {stats.totalTasks || 0} tasks
                                  </Text>
                                </View>
                              </View>
                              
                              <View style={styles.groupStats}>
                                <View style={styles.statBadge}>
                                  <Feather name="clock" size={12} color="#6B7280" />
                                  <Text style={styles.statText}>
                                    {formatDuration(group.totalTime)}
                                  </Text>
                                </View>
                                <View style={[styles.statBadge, styles.priceBadge]}>
                                  <Feather name="dollar-sign" size={12} color="#FFF" />
                                  <Text style={[styles.statText, styles.priceText]}>
                                    ${group.price?.toFixed(2) || '0.00'}
                                  </Text>
                                </View>
                              </View>
                            </View>
                            
                            {/* Group Details */}
                            <View style={styles.groupDetails}>
                              {/* Rooms */}
                              {group.rooms && group.rooms.length > 0 && (
                                <View style={styles.roomsSection}>
                                  <Text style={styles.detailTitle}>Rooms Included</Text>
                                  <View style={styles.roomsGrid}>
                                    {group.rooms.map((room, idx) => (
                                      <View key={`${room}-${idx}`} style={styles.roomChip}>
                                        <Text style={styles.roomChipText}>
                                          {formatRoomLabel(room)}
                                        </Text>
                                      </View>
                                    ))}
                                  </View>
                                </View>
                              )}
                              
                              {/* Tasks by Room */}
                              {group.details && Object.keys(group.details).length > 0 && (
                                <View style={styles.tasksSection}>
                                  <Text style={styles.detailTitle}>Tasks by Room</Text>
                                  
                                  {Object.entries(group.details).map(([roomKey, roomData]) => {
                                    if (!roomData.tasks || !Array.isArray(roomData.tasks) || roomData.tasks.length === 0) {
                                      return null;
                                    }
                                    
                                    // Split tasks into two columns
                                    const mid = Math.ceil(roomData.tasks.length / 2);
                                    const leftColumnTasks = roomData.tasks.slice(0, mid);
                                    const rightColumnTasks = roomData.tasks.slice(mid);
                                    
                                    return (
                                      <View key={`${groupId}-${roomKey}`} style={styles.roomTasksContainer}>
                                        <View style={styles.roomHeader}>
                                          <Feather name="square" size={16} color="#3B82F6" />
                                          <Text style={styles.roomName}>
                                            {formatRoomLabel(roomKey)}
                                          </Text>
                                          <Text style={styles.taskCount}>
                                            {roomData.tasks.length} tasks
                                          </Text>
                                        </View>
                                        
                                        {/* Two Column Layout */}
                                        <View style={styles.twoColumnGrid}>
                                          {/* Left Column */}
                                          <View style={styles.column}>
                                            {leftColumnTasks.map((task, taskIndex) => (
                                              <View key={`task-left-${taskIndex}`} style={styles.taskItem}>
                                                <Feather 
                                                  name={task.value ? "check-square" : "square"} 
                                                  size={14} 
                                                  color={task.value ? "#10B981" : "#6B7280"} 
                                                  style={styles.taskIcon}
                                                />
                                                <Text style={styles.taskLabel} numberOfLines={2}>
                                                  {task.label || task.name || `Task ${taskIndex + 1}`}
                                                </Text>
                                              </View>
                                            ))}
                                          </View>
                                          
                                          {/* Right Column */}
                                          <View style={styles.column}>
                                            {rightColumnTasks.map((task, taskIndex) => (
                                              <View key={`task-right-${mid + taskIndex}`} style={styles.taskItem}>
                                                <Feather 
                                                  name={task.value ? "check-square" : "square"} 
                                                  size={14} 
                                                  color={task.value ? "#10B981" : "#6B7280"} 
                                                  style={styles.taskIcon}
                                                />
                                                <Text style={styles.taskLabel} numberOfLines={2}>
                                                  {task.label || task.name || `Task ${mid + taskIndex + 1}`}
                                                </Text>
                                              </View>
                                            ))}
                                          </View>
                                        </View>
                                      </View>
                                    );
                                  })}
                                </View>
                              )}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                  
                  {/* Notes Section (if available) */}
                  {selectedChecklistForModal.notes && (
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>Notes</Text>
                      <View style={styles.notesCard}>
                        <Text style={styles.notesText}>
                          {selectedChecklistForModal.notes}
                        </Text>
                      </View>
                    </View>
                  )}
                </ScrollView>
                
                {/* Modal Footer */}
                <View style={styles.modalFooter}>
                  
                  
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.editButton]}
                    onPress={() => {
                      closeModal();
                      handleEditChecklist(selectedChecklistForModal);
                    }}
                  >
                    <Feather name="edit-2" size={18} color="#FFF" />
                    <Text style={[styles.modalActionText, styles.editButtonText]}>Edit Checklist</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
  },
  avatar: {
    backgroundColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    padding: 0,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDividerVertical: {
    width: 1,
    height: 30,
    backgroundColor: '#D1E9FF',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checklistIconContainer: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checklistInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  propertyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  propertyText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
    flex: 1,
  },
  menuButton: {
    padding: 8,
  },
  menu: {
    marginTop: 40,
    marginRight: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },

 
  viewButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  editButton1: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptySearchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIllustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 8,
    borderColor: '#F3F4F6',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  modalButtonCancel: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalButtonCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalButtonDelete: {
    backgroundColor: '#EF4444',
  },
  modalButtonDeleteText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },










    menuContainer: {
      position: 'relative',
      zIndex: 1,
    },
    menuButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: '#F9FAFB',
    },
    menuBackdrop: {
      position: 'absolute',
      top: -200,
      left: -200,
      right: -200,
      bottom: -200,
      backgroundColor: 'rgba(0, 0, 0, 0.0)',
      zIndex: 9,
    },
    menuCard: {
      position: 'absolute',
      top: 30,
      right: 0,
      backgroundColor: '#FFF',
      borderRadius: 16,
      paddingVertical: 8,
      minWidth: 180,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
      zIndex: 10,
      borderWidth: 1,
      borderColor: '#F3F4F6',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    menuIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '500',
    },
    menuDivider: {
      height: 1,
      backgroundColor: '#F3F4F6',
      marginVertical: 4,
    },

  





    // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  modalChecklistIcon: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  totalFee: {
    fontSize: 16,
    color: COLORS.primary,
  },
  groupCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  groupIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0369A1',
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  groupSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  groupStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  priceBadge: {
    backgroundColor: COLORS.primary,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  priceText: {
    color: '#FFF',
  },
  groupDetails: {
    gap: 16,
  },
  roomsSection: {
    gap: 8,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  roomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roomChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  roomChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3B82F6',
  },
  tasksSection: {
    gap: 16,
  },
  roomTasksContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  roomName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  taskCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  tasksList: {
    gap: 10,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  taskIcon: {
    width: 20,
  },
  taskLabel: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  notesCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
  },
  notesText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  modalActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
  },
  editButtonText: {
    color: '#FFF',
  },




  twoColumnGrid: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  column: {
    flex: 1,
    gap: 10,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  taskLabel: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },

});