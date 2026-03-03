// import React, { useState, useEffect, useContext } from 'react';
// import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
// import { Text, Button } from 'react-native-paper';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { AntDesign } from '@expo/vector-icons';
// import { AuthContext } from '../../context/AuthContext';
// import COLORS from '../../constants/colors';
// import RoomAssignmentPicker from './CreateBookingContents/RoomAssignmentPicker';
// import userService from '../../services/connection/userService';
// import Toast from 'react-native-toast-message';
// import FloatingLabelPickerSelect from '../../components/shared/FloatingLabelPicker';

// export default function EditChecklist() {
//   const { currentUserId, currency, userToken } = useContext(AuthContext);
//   const { checklistId } = useRoute().params;
//   const navigation = useNavigation();

//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);
//   const [checklistName, setChecklistName] = useState('');
//   const [selectedPropertyId, setSelectedPropertyId] = useState('');
//   const [selectedApartment, setSelectedApartment] = useState(null);
//   const [taskGroups, setTaskGroups] = useState([]);
//   const [groupSummary, setGroupSummary] = useState(null);
//   const [properties, setProperties] = useState([]);
//   const [totalFee, setTotalFee] = useState(0);
//   const [totalTime, setTotalTime] = useState(0);
//   const [showTooltip, setShowTooltip] = useState(false);

//   // 🔹 Fetch existing checklist data
//   useEffect(() => {
//     const fetchChecklist = async () => {
//       try {
//         setIsLoading(true);
//         const res = await userService.getChecklistById(checklistId);
//         const checklistData = res.data;
//         setChecklistName(checklistData.checklistName);
//         setGroupSummary(checklistData.checklist);
//         setTotalFee(checklistData.totalFee);
//         setTotalTime(checklistData.totalTime);
//         setSelectedPropertyId(checklistData.propertyId);
//       } catch (err) {
//         console.error('Failed to fetch checklist:', err);
//         Toast.show({
//           type: 'error',
//           text1: 'Error loading checklist',
//           text2: 'Please try again later.',
//         });
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchChecklist();
//   }, [checklistId]);

//   // 🔹 Fetch apartments for property selector
//   useEffect(() => {
//     const fetchProperties = async () => {
//       try {
//         const response = await userService.getApartment(currentUserId);
//         setProperties(response.data);
//       } catch (e) {
//         console.error("Failed to fetch properties", e);
//       }
//     };
//     fetchProperties();
//   }, []);

//   // 🔹 Fetch selected apartment details
//   useEffect(() => {
//     const fetchApartment = async () => {
//       if (!selectedPropertyId) return;
//       try {
//         const res = await userService.getApartmentById(selectedPropertyId);
//         setSelectedApartment(res.data);
//       } catch (err) {
//         console.error('Error fetching apartment:', err);
//       }
//     };
//     fetchApartment();
//   }, [selectedPropertyId]);

//   const handleUpdateChecklist = async () => {
//     if (!checklistName.trim()) {
//       Toast.show({
//         type: 'error',
//         text1: 'Checklist Name Required',
//         text2: 'Please enter a name for this checklist.',
//       });
//       return;
//     }

//     const payload = {
//       checklistName: checklistName.trim(),
//       checklist: groupSummary,
//       totalFee,
//       totalTime,
//       propertyId: selectedPropertyId,
//     };

//     setIsSaving(true);
//     try {
//       const res = await userService.updateChecklist(checklistId, payload, {
//         headers: {
//           Authorization: `Bearer ${userToken}`,
//         },
//       });

//       if (res.status === 200) {
//         Toast.show({
//           type: 'success',
//           text1: 'Checklist updated successfully',
//         });
//         navigation.goBack();
//       }
//     } catch (err) {
//       console.error('Checklist update failed', err);
//       Toast.show({
//         type: 'error',
//         text1: 'Failed to update checklist',
//         text2: 'Please try again later',
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text>Loading checklist details...</Text>
//       </View>
//     );
//   }

//   if (!selectedApartment) {
//     return (
//       <View style={styles.centered}>
//         <Text>No property selected</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
//       <View style={styles.container}>
//         <Text variant="titleLarge" style={styles.heading}>
//           Edit Cleaning Checklist {checklistName}
//         </Text>
//         <Text style={styles.subheading}>
//           Modify assigned rooms or task groups, then save your changes.
//         </Text>

//         <View style={{ marginBottom: 1 }}>
//           <FloatingLabelPickerSelect
//             label="Select a property"
//             items={properties.map((prop) => ({
//               label: prop.apt_name,
//               value: prop._id,
//             }))}
//             value={selectedPropertyId}
//             onValueChange={(value) => setSelectedPropertyId(value)}
//           />
//         </View>

//         <RoomAssignmentPicker
//           key={selectedPropertyId}
//           selectedApartment={selectedApartment}
//           taskGroups={taskGroups}
//           onGroupSummaryChange={setGroupSummary}
//           onTotalFeeChange={setTotalFee}
//           onTotalTimeChange={setTotalTime}
//           checklistName={checklistName}
//           setChecklistName={setChecklistName}
//           onInfoPress={() => setShowTooltip(true)}
//           existingSummary={groupSummary}
//         />

//         <Button
//           mode="contained"
//           onPress={handleUpdateChecklist}
//           disabled={!groupSummary || isSaving || !checklistName.trim()}
//           loading={isSaving}
//           style={styles.saveButton}
//         >
//           Update Checklist ({currency}{(totalFee ?? 0).toFixed(2)})
//         </Button>
//       </View>

//       {showTooltip && (
//         <Modal transparent animationType="fade">
//           <View style={styles.tooltipOverlay}>
//             <View style={styles.tooltipBox}>
//               <Text style={styles.tooltipText}>
//                 You can adjust how rooms and tasks are grouped here.{"\n\n"}
//                 Each group represents a cleaner or team handling specific tasks.
//               </Text>
//               <TouchableOpacity onPress={() => setShowTooltip(false)}>
//                 <Text style={styles.tooltipClose}>Got it</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   scrollContainer: { flex: 1, backgroundColor: '#fff' },
//   container: { padding: 20 },
//   heading: { fontSize: 22, fontWeight: 'bold' },
//   subheading: { fontSize: 14, color: COLORS.gray, marginBottom: 20 },
//   saveButton: { marginTop: 30, borderRadius: 6, paddingVertical: 6 },
//   centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   tooltipOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   tooltipBox: { backgroundColor: '#fff', padding: 20, borderRadius: 12, maxWidth: 300, elevation: 5 },
//   tooltipText: { fontSize: 14, color: '#333', marginBottom: 10 },
//   tooltipClose: { fontWeight: 'bold', color: COLORS.primary, textAlign: 'right', fontSize: 14 },
// });












// import React, { useState, useEffect, useContext } from 'react';
// import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
// import { Text, Button } from 'react-native-paper';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { AntDesign } from '@expo/vector-icons';
// import { AuthContext } from '../../context/AuthContext';
// import COLORS from '../../constants/colors';
// import RoomAssignmentPicker from './CreateBookingContents/RoomAssignmentPicker';
// import userService from '../../services/connection/userService';
// import Toast from 'react-native-toast-message';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import FloatingLabelPickerSelect from '../../components/shared/FloatingLabelPicker';

// export default function EditChecklist() {
//   const { currentUserId, currency, userToken } = useContext(AuthContext);
//   const { checklistId, propertyId: routePropertyId } = useRoute().params || {};
//   const navigation = useNavigation();

//   const [expectedCleaners, setExpectedCleaners] = useState(2);
//   const [taskGroups, setTaskGroups] = useState([]);
//   const [selectedApartment, setSelectedApartment] = useState(null);
//   const [groupSummary, setGroupSummary] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);
//   const [originalChecklist, setOriginalChecklist] = useState(null);

//   const [showTooltip, setShowTooltip] = useState(false);
//   const [totalFee, setTotalFee] = useState(0);
//   const [totalTime, setTotalTime] = useState(0);
//   const [checklistName, setChecklistName] = useState('');
//   const [selectedPropertyId, setSelectedPropertyId] = useState(routePropertyId || '');
//   const [properties, setProperties] = useState([]);


//   const [initialRoomAssignments, setInitialRoomAssignments] = useState(null);
// const [initialExtraAssignments, setInitialExtraAssignments] = useState(null);
// const [initialRoomNotes, setInitialRoomNotes] = useState(null);
// const [initialExpectedCleaners, setInitialExpectedCleaners] = useState(1);

//   // Fetch checklist data when component mounts
//   useEffect(() => {
//     if (checklistId) {
//       fetchChecklistData();
//     } else {
//       Toast.show({
//         type: 'error',
//         text1: 'Error',
//         text2: 'No checklist ID provided',
//       });
//       navigation.goBack();
//     }
//   }, [checklistId]);

// //   const fetchChecklistData = async () => {
// //     setIsLoading(true);
// //     try {
// //       // Fetch checklist details
// //       const checklistRes = await userService.getChecklistById(checklistId, {
// //         headers: {
// //           Authorization: `Bearer ${userToken}`,
// //         },
// //       });
      
// //       const checklistData = checklistRes.data;
// //       setOriginalChecklist(checklistData);
      
// //       // Set form values from existing checklist
// //       setChecklistName(checklistData.checklistName);
// //       setTotalFee(checklistData.totalFee);
// //       setTotalTime(checklistData.totalTime);
// //       setSelectedPropertyId(checklistData.propertyId);
      
// //       // Fetch property details
// //       const propertyRes = await userService.getApartmentById(checklistData.propertyId);
// //       setSelectedApartment(propertyRes.data);
      
// //       // Set task groups from existing checklist
// //       if (checklistData.checklist && checklistData.checklist.groups) {
// //         setTaskGroups(checklistData.checklist.groups);
// //         setExpectedCleaners(checklistData.checklist.groups.length);
// //         setGroupSummary(checklistData.checklist);
// //       }
      
// //     } catch (err) {
// //       console.error('Error fetching checklist data:', err);
// //       Toast.show({
// //         type: 'error',
// //         text1: 'Failed to load checklist',
// //         text2: 'Please try again later',
// //       });
// //       navigation.goBack();
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };


// const fetchChecklistData = async () => {
//     setIsLoading(true);
//     try {
//       const checklistRes = await userService.getChecklistById(checklistId, {
//         headers: {
//           Authorization: `Bearer ${userToken}`,
//         },
//       });
      
//       const checklistData = checklistRes.data;

//       console.log("editables",checklistData)
//       setOriginalChecklist(checklistData);
      
//       // Set basic form values
//       setChecklistName(checklistData.checklistName);
//       setTotalFee(checklistData.totalFee);
//       setTotalTime(checklistData.totalTime);
//       setSelectedPropertyId(checklistData.propertyId);
      
//       // Extract data for RoomAssignmentPicker
//       if (checklistData.checklist && checklistData.checklist.groups) {
//         const groups = checklistData.checklist.groups;
//         const groupKeys = Object.keys(groups);
//         const groupCount = groupKeys.length;
        
//         setExpectedCleaners(groupCount);
        
//         // Generate task groups
//         const taskGroups = Array.from({ length: groupCount }, (_, i) => ({
//           groupId: String.fromCharCode(97 + i), // 'a', 'b', 'c', etc.
//           rooms: [],
//           pricing: null,
//         }));
//         setTaskGroups(taskGroups);
        
//         // Extract room assignments, notes, and extra assignments
//         const roomAssignments = {};
//         const roomNotes = {};
//         const extraAssignments = {};
        
//         groupKeys.forEach(groupId => {
//           const groupData = groups[groupId];
          
//           // Room assignments
//           if (groupData.rooms && Array.isArray(groupData.rooms)) {
//             groupData.rooms.forEach(roomId => {
//               roomAssignments[roomId] = groupId;
//             });
//           }
          
//           // Room notes and details
//           if (groupData.details) {
//             Object.entries(groupData.details).forEach(([key, detail]) => {
//               if (key !== 'Extra' && detail.notes && detail.notes.text) {
//                 roomNotes[key] = detail.notes.text;
//               }
//             });
//           }
          
//           // Extra tasks
//           if (groupData.details && groupData.details.Extra && groupData.details.Extra.tasks) {
//             groupData.details.Extra.tasks.forEach(task => {
//               if (task.value) {
//                 extraAssignments[task.id] = {
//                   label: task.label,
//                   time: task.time || 5,
//                   price: task.price || 5,
//                   group: groupId,
//                   selected: true,
//                 };
//               }
//             });
//           }
//         });
        
//         // Store these for passing to RoomAssignmentPicker
//         setGroupSummary(checklistData.checklist);
        
//         // Set the initial data states
//         setInitialRoomAssignments(roomAssignments);
//         setInitialExtraAssignments(extraAssignments);
//         setInitialRoomNotes(roomNotes);
//         setInitialExpectedCleaners(groupCount);
//       }
      
//       // Fetch property details
//       const propertyRes = await userService.getApartmentById(checklistData.propertyId);
//       setSelectedApartment(propertyRes.data);
      
//     } catch (err) {
//       console.error('Error fetching checklist data:', err);
//       Toast.show({
//         type: 'error',
//         text1: 'Failed to load checklist',
//         text2: 'Please try again later',
//       });
//       navigation.goBack();
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   //Fetch apartments for property selector
//   useEffect(() => {
//     const fetchProperties = async () => {
//       try {
//         const response = await userService.getApartment(currentUserId);
//         setProperties(response.data);
//       } catch (e) {
//         console.error("Failed to fetch properties", e);
//       }
//     };
//     fetchProperties();
//   }, []);

//   // Add this useEffect to fetch apartment when selectedPropertyId changes
//   useEffect(() => {
//     const fetchApartment = async () => {
//       if (!selectedPropertyId) return;
      
//       setIsLoading(true);
//       try {
//         const res = await userService.getApartmentById(selectedPropertyId);
//         setSelectedApartment(res.data);
        
//         // Only reset room assignments if property changes (not initial load)
//         if (!originalChecklist || originalChecklist.propertyId !== selectedPropertyId) {
//           const generatedGroups = Array.from({ length: expectedCleaners }, (_, i) => ({
//             groupId: `group_${i + 1}`,
//             rooms: [],
//             pricing: null,
//           }));
//           setTaskGroups(generatedGroups);
//         }
//       } catch (err) {
//         console.error('Error fetching apartment:', err);
//       } finally {
//         setIsLoading(false);
//       }
//     };
  
//     fetchApartment();
//   }, [selectedPropertyId]);

//   const handleUpdateChecklist = async () => {
//     if (!selectedPropertyId) {
//       alert("Please select a property");
//       return;
//     }
    
//     if (!groupSummary || !selectedPropertyId) return;

//     if (!checklistName.trim()) {
//       Toast.show({
//         type: 'error',
//         text1: 'Checklist Name Required',
//         text2: 'Please enter a name for this checklist.',
//       });
//       return;
//     }

//     const payload = {
//       checklistId: checklistId,
//       propertyId: selectedPropertyId,
//       hostId: currentUserId,
//       checklistName: checklistName.trim(),
//       checklist: groupSummary,
//       totalFee,
//       totalTime,
//     };

//     console.log("Update Payload", payload);
//     setIsSaving(true);
//     try {
//       const res = await userService.updateChecklist(payload, {
//         headers: {
//           Authorization: `Bearer ${userToken}`,
//         },
//       });

//       if (res.status === 200) {
//         Toast.show({
//           type: 'success',
//           text1: 'Checklist updated successfully',
//         });
//         navigation.goBack();
//       }
//     } catch (err) {
//       console.error('Checklist update failed', err);
//       Toast.show({
//         type: 'error',
//         text1: 'Failed to update checklist',
//         text2: 'Please try again later',
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleDeleteChecklist = async () => {
//     // Add confirmation dialog
//     Alert.alert(
//       "Delete Checklist",
//       "Are you sure you want to delete this checklist? This action cannot be undone.",
//       [
//         {
//           text: "Cancel",
//           style: "cancel"
//         },
//         { 
//           text: "Delete", 
//           style: "destructive",
//           onPress: async () => {
//             try {
//               const res = await userService.deleteChecklist(checklistId, {
//                 headers: {
//                   Authorization: `Bearer ${userToken}`,
//                 },
//               });
              
//               if (res.status === 200) {
//                 Toast.show({
//                   type: 'success',
//                   text1: 'Checklist deleted successfully',
//                 });
//                 navigation.goBack();
//               }
//             } catch (err) {
//               console.error('Checklist deletion failed', err);
//               Toast.show({
//                 type: 'error',
//                 text1: 'Failed to delete checklist',
//                 text2: 'Please try again later',
//               });
//             }
//           }
//         }
//       ]
//     );
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text>Loading checklist details...</Text>
//       </View>
//     );
//   }

//   if (!selectedApartment) {
//     return (
//       <View style={styles.centered}>
//         <Text>No property selected</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
//       <View style={styles.container}>
//         <Text variant="titleLarge" style={styles.heading}>
//           Edit Cleaning Checklist
//         </Text>
//         <Text style={styles.subheading}>
//           Modify room distribution and tasks among groups to update estimated time and cost.
//         </Text>

//         {!routePropertyId && (
//           <View style={{ marginBottom: 1 }}>
//             <FloatingLabelPickerSelect
//               label="Choose a property"
//               items={properties.map((prop) => ({
//                 label: prop.apt_name, 
//                 value: prop._id
//               }))}
//               value={selectedPropertyId}
//               onValueChange={(value) => setSelectedPropertyId(value)}
//             />
//           </View>
//         )}

//         <RoomAssignmentPicker
//             key={`${selectedPropertyId}_${checklistId}`} // Force re-render when property or checklist changes
//             selectedApartment={selectedApartment}
//             taskGroups={taskGroups}
//             onGroupSummaryChange={setGroupSummary}
//             onTotalFeeChange={setTotalFee}
//             onTotalTimeChange={setTotalTime}
//             checklistName={checklistName}
//             setChecklistName={setChecklistName}
//             onInfoPress={() => setShowTooltip(true)}
//             isEditMode={true}
//             initialRoomAssignments={initialRoomAssignments}
//             initialExtraAssignments={initialExtraAssignments}
//             initialRoomNotes={initialRoomNotes}
//             initialExpectedCleaners={initialExpectedCleaners}
//         />

//         <View style={styles.buttonContainer}>
//           <Button
//             mode="contained"
//             onPress={handleUpdateChecklist}
//             disabled={!groupSummary || isSaving || !checklistName.trim()}
//             loading={isSaving}
//             style={[styles.saveButton, styles.updateButton]}
//           >
//             Update Checklist ({currency}{(totalFee ?? 0).toFixed(2)})
//           </Button>
          
//           <Button
//             mode="outlined"
//             onPress={handleDeleteChecklist}
//             disabled={isSaving}
//             style={styles.deleteButton}
//             textColor={COLORS.error}
//           >
//             Delete Checklist
//           </Button>
//         </View>
//       </View>

//       {showTooltip && (
//         <Modal transparent animationType="fade">
//           <View style={styles.tooltipOverlay}>
//             <View style={styles.tooltipBox}>
//               <Text style={styles.tooltipText}>
//                 This helps us understand how many cleaners will work on the apartment.
//                 {"\n\n"}
//                 If it's just one cleaner, we'll assign all tasks to one group.
//                 If it's two or more, you'll be able to split tasks across groups for faster cleaning.
//               </Text>
//               <TouchableOpacity onPress={() => setShowTooltip(false)}>
//                 <Text style={styles.tooltipClose}>Got it</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   scrollContainer: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   container: {
//     padding: 20,
//   },
//   heading: {
//     fontSize: 22,
//     fontWeight: 'bold',
//   },
//   subheading: {
//     fontSize: 14,
//     color: COLORS.gray,
//     marginBottom: 20,
//   },
//   buttonContainer: {
//     marginTop: 30,
//     gap: 12,
//   },
//   saveButton: {
//     borderRadius: 6,
//     paddingVertical: 6,
//   },
//   updateButton: {
//     backgroundColor: COLORS.primary,
//   },
//   deleteButton: {
//     borderColor: COLORS.error,
//     borderRadius: 6,
//     paddingVertical: 6,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   tooltipOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   tooltipBox: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 12,
//     maxWidth: 300,
//     elevation: 5,
//   },
//   tooltipText: {
//     fontSize: 14,
//     color: '#333',
//     marginBottom: 10,
//   },
//   tooltipClose: {
//     fontWeight: 'bold',
//     color: COLORS.primary,
//     textAlign: 'right',
//     fontSize: 14,
//   },
// });



// import React, { useState, useEffect, useContext } from 'react';
// import {
//   View,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
//   Alert
// } from 'react-native';
// import { Text, Button, TextInput } from 'react-native-paper';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { AuthContext } from '../../context/AuthContext';
// import COLORS from '../../constants/colors';
// // import RoomAssignmentPicker from '../CreateBookingContents/RoomAssignmentPicker';
// import RoomAssignmentPicker from './CreateBookingContents/RoomAssignmentPicker';
// // import userService from '../../../services/connection/userService';
// import userService from '../../services/connection/userService';
// import Toast from 'react-native-toast-message';
// import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
// // import ROUTES from '../../../constants/routes';
// import ROUTES from '../../constants/routes';

// export default function EditChecklist() {
//   const { currentUserId, currency, userToken } = useContext(AuthContext);
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { checklistId, onChecklistUpdated } = route.params || {};

//   const [expectedCleaners, setExpectedCleaners] = useState(2);
//   const [taskGroups, setTaskGroups] = useState([]);
//   const [selectedApartment, setSelectedApartment] = useState(null);
//   const [groupSummary, setGroupSummary] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);
//   const [checklistName, setChecklistName] = useState('');
//   const [totalFee, setTotalFee] = useState(0);
//   const [totalTime, setTotalTime] = useState(0);
//   const [checklistData, setChecklistData] = useState(null);
//   const [showTooltip, setShowTooltip] = useState(false);

//   useEffect(() => {
//     if (checklistId) {
//       fetchChecklistData();
//     } else {
//       Toast.show({
//         type: 'error',
//         text1: 'No checklist selected',
//         text2: 'Please go back and select a checklist to edit',
//       });
//       navigation.goBack();
//     }
//   }, [checklistId]);

//   const fetchChecklistData = async () => {
//     setIsLoading(true);
//     try {
//       const res = await userService.getChecklistById(checklistId);
//       const data = res.data;
//       setChecklistData(data);
      
//       // Set checklist name
//       setChecklistName(data.checklistName || '');
      
//       // Fetch apartment details
//       if (data.propertyId) {
//         const apartmentRes = await userService.getApartmentById(data.propertyId);
//         setSelectedApartment(apartmentRes.data);
        
//         // Initialize task groups from checklist data
//         if (data.checklist) {
//           const groups = Object.keys(data.checklist).map((key, index) => ({
//             groupId: `group_${index + 1}`,
//             rooms: data.checklist[key]?.rooms || [],
//             pricing: data.checklist[key]?.pricing || null,
//           }));
//           setTaskGroups(groups);
//           setExpectedCleaners(groups.length);
//         }
        
//         // Set totals
//         setTotalFee(data.totalFee || 0);
//         setTotalTime(data.totalTime || 0);
//       }
//     } catch (err) {
//       console.error('Error fetching checklist:', err);
//       Toast.show({
//         type: 'error',
//         text1: 'Failed to load checklist',
//         text2: 'Please try again',
//       });
//       navigation.goBack();
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleUpdateChecklist = async () => {
//     if (!checklistName.trim()) {
//       Toast.show({
//         type: 'error',
//         text1: 'Checklist Name Required',
//         text2: 'Please enter a name for this checklist.',
//       });
//       return;
//     }

//     if (!groupSummary) {
//       Toast.show({
//         type: 'error',
//         text1: 'No Tasks',
//         text2: 'Please assign at least one task',
//       });
//       return;
//     }

//     const payload = {
//       checklistName: checklistName.trim(),
//       checklist: groupSummary,
//       totalFee,
//       totalTime,
//     };

//     setIsSaving(true);
//     try {
//       const res = await userService.updateChecklist(checklistId, payload, {
//         headers: {
//           Authorization: `Bearer ${userToken}`,
//         },
//       });

//       if (res.status === 200) {
//         Toast.show({
//           type: 'success',
//           text1: 'Checklist updated',
//           text2: 'Your changes have been saved',
//         });
        
//         // Call the update callback if provided
//         if (onChecklistUpdated) {
//           onChecklistUpdated();
//         }
        
//         navigation.goBack();
//       }
//     } catch (err) {
//       console.error('Checklist update failed', err);
//       Toast.show({
//         type: 'error',
//         text1: 'Failed to update checklist',
//         text2: 'Please try again later',
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleDeleteChecklist = () => {
//     Alert.alert(
//       'Delete Checklist',
//       `Are you sure you want to delete "${checklistName}"? This action cannot be undone.`,
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               const res = await userService.deleteChecklist(checklistId, {
//                 headers: { Authorization: `Bearer ${userToken}` }
//               });
              
//               if (res.status === 200) {
//                 Toast.show({
//                   type: 'success',
//                   text1: 'Checklist deleted',
//                   text2: 'The checklist has been removed',
//                 });
//                 navigation.goBack();
//               }
//             } catch (err) {
//               Toast.show({
//                 type: 'error',
//                 text1: 'Failed to delete checklist',
//                 text2: 'Please try again',
//               });
//             }
//           },
//         },
//       ]
//     );
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text>Loading checklist details...</Text>
//       </View>
//     );
//   }

//   if (!checklistData) {
//     return (
//       <View style={styles.errorContainer}>
//         <MaterialCommunityIcons name="alert-circle" size={48} color="#FF6B6B" />
//         <Text style={styles.errorText}>Checklist not found</Text>
//         <Button 
//           mode="contained" 
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}
//         >
//           Go Back
//         </Button>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton} 
//           onPress={() => navigation.goBack()}
//         >
//           <Feather name="arrow-left" size={24} color={COLORS.dark} />
//         </TouchableOpacity>
//         <View style={styles.headerTitleContainer}>
//           <Text style={styles.headerTitle}>Edit Checklist</Text>
//           <Text style={styles.headerSubtitle}>{selectedApartment?.apt_name || 'Property'}</Text>
//         </View>
//         <TouchableOpacity 
//           style={styles.deleteButton}
//           onPress={handleDeleteChecklist}
//         >
//           <Feather name="trash-2" size={20} color="#FF6B6B" />
//         </TouchableOpacity>
//       </View>

//       <ScrollView 
//         showsVerticalScrollIndicator={false} 
//         style={styles.scrollContainer}
//       >
//         <View style={styles.content}>
//           <View style={styles.inputContainer}>
//             <Text style={styles.label}>Checklist Name</Text>
//             <TextInput
//               mode="outlined"
//               value={checklistName}
//               onChangeText={setChecklistName}
//               placeholder="Enter checklist name"
//               style={styles.nameInput}
//               outlineColor="#e0e0e0"
//               activeOutlineColor={COLORS.primary}
//             />
//           </View>

//           {selectedApartment && (
//             <RoomAssignmentPicker
//               key={selectedApartment._id}
//               selectedApartment={selectedApartment}
//               taskGroups={taskGroups}
//               onGroupSummaryChange={setGroupSummary}
//               onTotalFeeChange={setTotalFee}
//               onTotalTimeChange={setTotalTime}
//               checklistName={checklistName}
//               setChecklistName={setChecklistName}
//               onInfoPress={() => setShowTooltip(true)}
//               isEditing={true}
//             />
//           )}

//           <View style={styles.summarySection}>
//             <Text style={styles.summaryTitle}>Summary</Text>
//             <View style={styles.summaryRow}>
//               <View style={styles.summaryItem}>
//                 <Text style={styles.summaryLabel}>Total Fee</Text>
//                 <Text style={styles.summaryValue}>{currency}{totalFee.toFixed(2)}</Text>
//               </View>
//               <View style={styles.summaryDivider} />
//               <View style={styles.summaryItem}>
//                 <Text style={styles.summaryLabel}>Total Time</Text>
//                 <Text style={styles.summaryValue}>{totalTime} mins</Text>
//               </View>
//             </View>
//           </View>

//           <View style={styles.buttonContainer}>
//             <Button
//               mode="outlined"
//               onPress={() => navigation.goBack()}
//               style={[styles.button, styles.cancelButton]}
//               contentStyle={styles.buttonContent}
//             >
//               Cancel
//             </Button>
            
//             <Button
//               mode="contained"
//               onPress={handleUpdateChecklist}
//               disabled={!groupSummary || isSaving || !checklistName.trim()}
//               loading={isSaving}
//               style={[styles.button, styles.saveButton]}
//               contentStyle={styles.buttonContent}
//             >
//               Save Changes
//             </Button>
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//     backgroundColor: '#fff',
//   },
//   backButton: {
//     padding: 8,
//   },
//   headerTitleContainer: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: COLORS.dark,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: COLORS.gray,
//     marginTop: 2,
//   },
//   deleteButton: {
//     padding: 8,
//   },
//   scrollContainer: {
//     flex: 1,
//   },
//   content: {
//     padding: 20,
//   },
//   inputContainer: {
//     marginBottom: 24,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 8,
//   },
//   nameInput: {
//     backgroundColor: '#fff',
//   },
//   summarySection: {
//     marginTop: 24,
//     padding: 16,
//     backgroundColor: '#f8f9fe',
//     borderRadius: 12,
//   },
//   summaryTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 12,
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   summaryItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   summaryLabel: {
//     fontSize: 14,
//     color: COLORS.gray,
//     marginBottom: 4,
//   },
//   summaryValue: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },
//   summaryDivider: {
//     width: 1,
//     height: 40,
//     backgroundColor: '#e0e7ff',
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 32,
//     gap: 12,
//   },
//   button: {
//     flex: 1,
//     borderRadius: 8,
//   },
//   cancelButton: {
//     borderColor: COLORS.gray,
//   },
//   saveButton: {
//     backgroundColor: COLORS.primary,
//   },
//   buttonContent: {
//     paddingVertical: 8,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     padding: 20,
//   },
//   errorText: {
//     fontSize: 18,
//     color: COLORS.dark,
//     marginTop: 16,
//     marginBottom: 24,
//   },
// });


// import React, { useState, useEffect, useContext } from 'react';
// import {
//   View,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
//   Alert,
//   Modal
// } from 'react-native';
// import { Text, Button, TextInput } from 'react-native-paper';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { AuthContext } from '../../context/AuthContext';
// import COLORS from '../../constants/colors';
// import RoomAssignmentPicker from './CreateBookingContents/RoomAssignmentPicker';
// import userService from '../../services/connection/userService';
// import Toast from 'react-native-toast-message';
// import { MaterialCommunityIcons, Feather, AntDesign } from '@expo/vector-icons';
// // import ROUTES from '../../../constants/routes';

// export default function EditChecklist() {
//   const { currentUserId, currency, userToken } = useContext(AuthContext);
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { checklistId, onChecklistUpdated } = route.params || {};

//   const [expectedCleaners, setExpectedCleaners] = useState(2);
//   const [taskGroups, setTaskGroups] = useState([]);
//   const [selectedApartment, setSelectedApartment] = useState(null);
//   const [groupSummary, setGroupSummary] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);
//   const [checklistName, setChecklistName] = useState('');
//   const [totalFee, setTotalFee] = useState(0);
//   const [totalTime, setTotalTime] = useState(0);
//   const [checklistData, setChecklistData] = useState(null);
//   const [showTooltip, setShowTooltip] = useState(false);
//   const [initialChecklistData, setInitialChecklistData] = useState(null);

//   useEffect(() => {
//     if (checklistId) {
//       fetchChecklistData();
//     } else {
//       Toast.show({
//         type: 'error',
//         text1: 'No checklist selected',
//         text2: 'Please go back and select a checklist to edit',
//       });
//       navigation.goBack();
//     }
//   }, [checklistId]);

//   const fetchChecklistData = async () => {
//     setIsLoading(true);
//     try {
//       // Fetch checklist data
//       const res = await userService.getChecklistById(checklistId);
//       const data = res.data;
//       setChecklistData(data);
//       console.log('Fetched checklist data:', data);
      
//       // Set checklist name
//       setChecklistName(data.checklistName || '');
      
//       // Set totals
//       setTotalFee(data.totalFee || 0);
//       setTotalTime(data.totalTime || 0);
      
//       // Fetch apartment details
//       if (data.propertyId) {
//         try {
//           const apartmentRes = await userService.getApartmentById(data.propertyId);
//           const apartmentData = apartmentRes.data;
//           console.log('Fetched apartment data:', apartmentData);
//           setSelectedApartment(apartmentData);
          
//           // Initialize task groups from checklist data
//           if (data.checklist && typeof data.checklist === 'object') {
//             // Convert checklist object to array format expected by RoomAssignmentPicker
//             const groups = [];
            
//             // Handle checklist data format
//             if (data.checklist.groups && Array.isArray(data.checklist.groups)) {
//               // If checklist has groups array
//               data.checklist.groups.forEach((group, index) => {
//                 groups.push({
//                   groupId: `group_${index + 1}`,
//                   rooms: group.rooms || [],
//                   pricing: group.pricing || null,
//                   tasks: group.tasks || []
//                 });
//               });
//             } else {
//               // If checklist is an object with group keys
//               const groupKeys = Object.keys(data.checklist);
//               groupKeys.forEach((key, index) => {
//                 const group = data.checklist[key];
//                 groups.push({
//                   groupId: key,
//                   rooms: group.rooms || [],
//                   pricing: group.pricing || null,
//                   tasks: group.tasks || []
//                 });
//               });
//             }
            
//             console.log('Initialized task groups:', groups);
//             setTaskGroups(groups);
//             setExpectedCleaners(groups.length || 2);
            
//             // Set initial group summary for RoomAssignmentPicker
//             setGroupSummary(data.checklist);
//             setInitialChecklistData(data.checklist);
//           } else {
//             // If no checklist data exists, create default groups
//             const defaultGroups = Array.from({ length: expectedCleaners }, (_, i) => ({
//               groupId: `group_${i + 1}`,
//               rooms: [],
//               pricing: null,
//               tasks: []
//             }));
//             setTaskGroups(defaultGroups);
//             console.log('Created default task groups:', defaultGroups);
//           }
//         } catch (apartmentError) {
//           console.error('Error fetching apartment:', apartmentError);
//           Toast.show({
//             type: 'error',
//             text1: 'Error loading property',
//             text2: 'Could not load property details',
//           });
//         }
//       }
//     } catch (err) {
//       console.error('Error fetching checklist:', err);
//       Toast.show({
//         type: 'error',
//         text1: 'Failed to load checklist',
//         text2: 'Please try again',
//       });
//       navigation.goBack();
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleUpdateChecklist = async () => {
//     if (!checklistName.trim()) {
//       Toast.show({
//         type: 'error',
//         text1: 'Checklist Name Required',
//         text2: 'Please enter a name for this checklist.',
//       });
//       return;
//     }

//     if (!groupSummary) {
//       Toast.show({
//         type: 'error',
//         text1: 'No Tasks',
//         text2: 'Please assign at least one task',
//       });
//       return;
//     }

//     const payload = {
//       checklistName: checklistName.trim(),
//       checklist: groupSummary,
//       totalFee,
//       totalTime,
//       propertyId: selectedApartment?._id || checklistData?.propertyId,
//       hostId: currentUserId,
//     };

//     console.log('Update payload:', payload);

//     setIsSaving(true);
//     try {
//       const res = await userService.updateChecklist(checklistId, payload, {
//         headers: {
//           Authorization: `Bearer ${userToken}`,
//         },
//       });

//       if (res.status === 200) {
//         Toast.show({
//           type: 'success',
//           text1: 'Checklist updated',
//           text2: 'Your changes have been saved',
//         });
        
//         // Call the update callback if provided
//         if (onChecklistUpdated) {
//           onChecklistUpdated();
//         }
        
//         navigation.goBack();
//       }
//     } catch (err) {
//       console.error('Checklist update failed', err);
//       Toast.show({
//         type: 'error',
//         text1: 'Failed to update checklist',
//         text2: err.response?.data?.message || 'Please try again later',
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleDeleteChecklist = () => {
//     Alert.alert(
//       'Delete Checklist',
//       `Are you sure you want to delete "${checklistName}"? This action cannot be undone.`,
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               const res = await userService.deleteChecklist(checklistId, {
//                 headers: { Authorization: `Bearer ${userToken}` }
//               });
              
//               if (res.status === 200) {
//                 Toast.show({
//                   type: 'success',
//                   text1: 'Checklist deleted',
//                   text2: 'The checklist has been removed',
//                 });
                
//                 // Call the update callback if provided
//                 if (onChecklistUpdated) {
//                   onChecklistUpdated();
//                 }
                
//                 navigation.goBack();
//               }
//             } catch (err) {
//               console.error('Delete error:', err);
//               Toast.show({
//                 type: 'error',
//                 text1: 'Failed to delete checklist',
//                 text2: err.response?.data?.message || 'Please try again',
//               });
//             }
//           },
//         },
//       ]
//     );
//   };

//   // Handle group summary change from RoomAssignmentPicker
//   const handleGroupSummaryChange = (summary) => {
//     console.log('Group summary updated:', summary);
//     setGroupSummary(summary);
//   };

//   // Handle task groups change
//   const handleTaskGroupsChange = (newTaskGroups) => {
//     console.log('Task groups updated:', newTaskGroups);
//     setTaskGroups(newTaskGroups);
//     setExpectedCleaners(newTaskGroups.length);
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>Loading checklist details...</Text>
//       </View>
//     );
//   }

//   if (!checklistData) {
//     return (
//       <View style={styles.errorContainer}>
//         <MaterialCommunityIcons name="alert-circle" size={48} color="#FF6B6B" />
//         <Text style={styles.errorText}>Checklist not found</Text>
//         <Button 
//           mode="contained" 
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}
//         >
//           Go Back
//         </Button>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton} 
//           onPress={() => navigation.goBack()}
//         >
//           <Feather name="arrow-left" size={24} color={COLORS.dark} />
//         </TouchableOpacity>
//         <View style={styles.headerTitleContainer}>
//           <Text style={styles.headerTitle}>Edit Checklist</Text>
//           <Text style={styles.headerSubtitle}>
//             {selectedApartment?.apt_name || checklistData?.propertyName || 'Property'}
//           </Text>
//         </View>
//         <TouchableOpacity 
//           style={styles.deleteButton}
//           onPress={handleDeleteChecklist}
//         >
//           <Feather name="trash-2" size={20} color="#FF6B6B" />
//         </TouchableOpacity>
//       </View>

//       <ScrollView 
//         showsVerticalScrollIndicator={false} 
//         style={styles.scrollContainer}
//       >
//         <View style={styles.content}>
//           <View style={styles.inputContainer}>
//             <Text style={styles.label}>Checklist Name</Text>
//             <TextInput
//               mode="outlined"
//               value={checklistName}
//               onChangeText={setChecklistName}
//               placeholder="Enter checklist name"
//               style={styles.nameInput}
//               outlineColor="#e0e0e0"
//               activeOutlineColor={COLORS.primary}
//             />
//           </View>

//           {selectedApartment && (
//             <RoomAssignmentPicker
//               key={`${selectedApartment._id}_${taskGroups.length}`} // Force re-render on data change
//               selectedApartment={selectedApartment}
//               taskGroups={taskGroups}
//               onGroupSummaryChange={handleGroupSummaryChange}
//               onTotalFeeChange={setTotalFee}
//               onTotalTimeChange={setTotalTime}
//               checklistName={checklistName}
//               setChecklistName={setChecklistName}
//               onInfoPress={() => setShowTooltip(true)}
//               isEditing={true}
//               initialData={initialChecklistData}
//               onTaskGroupsChange={handleTaskGroupsChange}
              
//             />
//           )}

//           <View style={styles.summarySection}>
//             <Text style={styles.summaryTitle}>Summary</Text>
//             <View style={styles.summaryRow}>
//               <View style={styles.summaryItem}>
//                 <Text style={styles.summaryLabel}>Total Fee</Text>
//                 <Text style={styles.summaryValue}>{currency}{totalFee.toFixed(2)}</Text>
//               </View>
//               <View style={styles.summaryDivider} />
//               <View style={styles.summaryItem}>
//                 <Text style={styles.summaryLabel}>Total Time</Text>
//                 <Text style={styles.summaryValue}>{totalTime} mins</Text>
//               </View>
//               <View style={styles.summaryDivider} />
//               <View style={styles.summaryItem}>
//                 <Text style={styles.summaryLabel}>Groups</Text>
//                 <Text style={styles.summaryValue}>{expectedCleaners}</Text>
//               </View>
//             </View>
//           </View>

//           <View style={styles.buttonContainer}>
//             <Button
//               mode="outlined"
//               onPress={() => navigation.goBack()}
//               style={[styles.button, styles.cancelButton]}
//               contentStyle={styles.buttonContent}
//             >
//               Cancel
//             </Button>
            
//             <Button
//               mode="contained"
//               onPress={handleUpdateChecklist}
//               disabled={!groupSummary || isSaving || !checklistName.trim()}
//               loading={isSaving}
//               style={[styles.button, styles.saveButton]}
//               contentStyle={styles.buttonContent}
//             >
//               Save Changes
//             </Button>
//           </View>
//         </View>
//       </ScrollView>

//       {/* Tooltip Modal */}
//       <Modal
//         visible={showTooltip}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowTooltip(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeader}>
//               <AntDesign name="infocirlce" size={24} color={COLORS.primary} />
//               <Text style={styles.modalTitle}>Checklist Information</Text>
//             </View>
            
//             <Text style={styles.modalText}>
//               This helps us understand how many cleaners will work on the apartment.
//               {"\n\n"}
//               If it's just one cleaner, we'll assign all tasks to one group.
//               If it's two or more, you'll be able to split tasks across groups for faster cleaning.
//               {"\n\n"}
//               <Text style={{ fontWeight: 'bold' }}>Editing Mode:</Text> You can modify existing task assignments, add new tasks, or adjust pricing.
//             </Text>
            
//             <TouchableOpacity
//               style={styles.modalCloseButton}
//               onPress={() => setShowTooltip(false)}
//             >
//               <Text style={styles.modalCloseText}>Got it</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//     backgroundColor: '#fff',
//   },
//   backButton: {
//     padding: 8,
//   },
//   headerTitleContainer: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: COLORS.dark,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: COLORS.gray,
//     marginTop: 2,
//   },
//   deleteButton: {
//     padding: 8,
//   },
//   scrollContainer: {
//     flex: 1,
//   },
//   content: {
//     padding: 20,
//   },
//   inputContainer: {
//     marginBottom: 24,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 8,
//   },
//   nameInput: {
//     backgroundColor: '#fff',
//   },
//   summarySection: {
//     marginTop: 24,
//     padding: 16,
//     backgroundColor: '#f8f9fe',
//     borderRadius: 12,
//   },
//   summaryTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 12,
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   summaryItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   summaryLabel: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginBottom: 4,
//   },
//   summaryValue: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },
//   summaryDivider: {
//     width: 1,
//     height: 40,
//     backgroundColor: '#e0e7ff',
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 32,
//     gap: 12,
//   },
//   button: {
//     flex: 1,
//     borderRadius: 8,
//   },
//   cancelButton: {
//     borderColor: COLORS.gray,
//   },
//   saveButton: {
//     backgroundColor: COLORS.primary,
//   },
//   buttonContent: {
//     paddingVertical: 8,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: COLORS.gray,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     padding: 20,
//   },
//   errorText: {
//     fontSize: 18,
//     color: COLORS.dark,
//     marginTop: 16,
//     marginBottom: 24,
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
//   modalCloseButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     alignSelf: 'flex-end',
//   },
//   modalCloseText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 14,
//   },
// });



// import React, { useState, useEffect, useContext } from 'react';
// import {
//   View,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
//   Alert,
//   Modal
// } from 'react-native';
// import { Text, Button, TextInput } from 'react-native-paper';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { AuthContext } from '../../context/AuthContext';
// import COLORS from '../../constants/colors';
// import RoomAssignmentPicker from './CreateBookingContents/RoomAssignmentPicker';
// import userService from '../../services/connection/userService';
// import Toast from 'react-native-toast-message';
// import { MaterialCommunityIcons, Feather, AntDesign } from '@expo/vector-icons';


// export default function EditChecklist() {
//   const { currentUserId, currency, userToken } = useContext(AuthContext);
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { checklistId, onChecklistUpdated } = route.params || {};

//   const [expectedCleaners, setExpectedCleaners] = useState(2);
//   const [taskGroups, setTaskGroups] = useState([]);
//   const [selectedApartment, setSelectedApartment] = useState(null);
//   const [groupSummary, setGroupSummary] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);
//   const [checklistName, setChecklistName] = useState('');
//   const [totalFee, setTotalFee] = useState(0);
//   const [totalTime, setTotalTime] = useState(0);
//   const [checklistData, setChecklistData] = useState(null);
//   const [showTooltip, setShowTooltip] = useState(false);
//   const [hasLoadedData, setHasLoadedData] = useState(false);

//   console.log('EditChecklist - Loading checklist:', checklistId);

//   useEffect(() => {
//     if (checklistId) {
//       fetchChecklistData();
//     } else {
//       Toast.show({
//         type: 'error',
//         text1: 'No checklist selected',
//         text2: 'Please go back and select a checklist to edit',
//       });
//       navigation.goBack();
//     }
//   }, [checklistId]);

//   console.log('Selected Apartment:', selectedApartment);
// console.log('Task Groups to pass to RoomAssignmentPicker:', taskGroups);
// console.log('Has loaded data?', hasLoadedData);

//   // const fetchChecklistData = async () => {
//   //   setIsLoading(true);
//   //   setHasLoadedData(false);
    
//   //   try {
//   //     console.log('Fetching checklist data for ID:', checklistId);
      
//   //     // Fetch checklist data
//   //     const res = await userService.getChecklistById(checklistId);
//   //     const data = res.data;
//   //     console.log('Fetched checklist data:', data);

//   //     console.log('API Response:', res);
//   //     console.log('Response data:', res.data);
//   //     console.log('Checklist property:', res.data?.checklist);
//   //     console.log('Checklist property type:', typeof res.data?.checklist);
      
//   //     if (!data) {
//   //       throw new Error('No checklist data found');
//   //     }
      
//   //     setChecklistData(data);
      
//   //     // Set checklist name
//   //     setChecklistName(data.checklistName || '');
      
//   //     // Set totals
//   //     setTotalFee(data.totalFee || 0);
//   //     setTotalTime(data.totalTime || 0);
      
//   //     // Fetch apartment details
//   //     if (data.propertyId) {
//   //       console.log('Fetching apartment data for propertyId:', data.propertyId);
        
//   //       try {
//   //         const apartmentRes = await userService.getApartmentById(data.propertyId);
//   //         const apartmentData = apartmentRes.data;
//   //         console.log('Fetched apartment data:', apartmentData);
          
//   //         if (!apartmentData) {
//   //           throw new Error('No apartment data found');
//   //         }
          
//   //         setSelectedApartment(apartmentData);
          
//   //         // Initialize task groups from checklist data
//   //         let groups = [];
          
//   //         if (data.checklist) {
//   //           console.log('Checklist data structure:', data.checklist);
            
//   //           // Handle different checklist data formats
//   //           if (Array.isArray(data.checklist)) {
//   //             // If checklist is an array
//   //             groups = data.checklist.map((group, index) => ({
//   //               groupId: group.groupId || `group_${index + 1}`,
//   //               rooms: group.rooms || [],
//   //               pricing: group.pricing || null,
//   //               tasks: group.tasks || []
//   //             }));
//   //           } else if (typeof data.checklist === 'object') {
//   //             // If checklist is an object with keys
//   //             const groupKeys = Object.keys(data.checklist);
              
//   //             groups = groupKeys.map((key, index) => {
//   //               const group = data.checklist[key];
//   //               return {
//   //                 groupId: key,
//   //                 rooms: Array.isArray(group.rooms) ? group.rooms : [],
//   //                 pricing: group.pricing || null,
//   //                 tasks: group.tasks || []
//   //               };
//   //             });
//   //           }
//   //         } else {
//   //           // Create default groups if no checklist data exists
//   //           console.log('No checklist data found, creating default groups');
//   //           groups = Array.from({ length: expectedCleaners }, (_, i) => ({
//   //             groupId: `group_${i + 1}`,
//   //             rooms: [],
//   //             pricing: null,
//   //             tasks: []
//   //           }));
//   //         }
          
//   //         console.log('Initialized task groups:', groups);
//   //         setTaskGroups(groups);
//   //         setExpectedCleaners(groups.length || 2);
          
//   //         // Set group summary
//   //         if (data.checklist) {
//   //           setGroupSummary(data.checklist);
//   //         }
          
//   //         setHasLoadedData(true);
          
//   //       } catch (apartmentError) {
//   //         console.error('Error fetching apartment:', apartmentError);
//   //         Toast.show({
//   //           type: 'error',
//   //           text1: 'Error loading property',
//   //           text2: 'Could not load property details',
//   //         });
          
//   //         // Even if apartment fails, still try to load the rest
//   //         setHasLoadedData(true);
//   //       }
//   //     } else {
//   //       console.log('No propertyId in checklist data');
//   //       setHasLoadedData(true);
//   //     }
//   //   } catch (err) {
//   //     console.error('Error fetching checklist:', err);
//   //     Toast.show({
//   //       type: 'error',
//   //       text1: 'Failed to load checklist',
//   //       text2: err.message || 'Please try again',
//   //     });
//   //     navigation.goBack();
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };

//   const fetchChecklistData = async () => {
//     setIsLoading(true);
//     setHasLoadedData(false);
    
//     try {
//       console.log('Fetching checklist data for ID:', checklistId);
      
//       // Fetch checklist data
//       const res = await userService.getChecklistById(checklistId, {
//         headers: {
//           Authorization: `Bearer ${userToken}`,
//         },
//       });
      
//       const data = res.data;
//       console.log('Fetched checklist data:', JSON.stringify(data, null, 2));
      
//       if (!data) {
//         throw new Error('No checklist data found');
//       }
      
//       setChecklistData(data);
//       setChecklistName(data.checklistName || '');
//       setTotalFee(data.totalFee || 0);
//       setTotalTime(data.totalTime || 0);
      
//       // Try to parse checklist data first, then fetch apartment
//       let parsedTaskGroups = [];
      
//       // Parse checklist data regardless of apartment availability
//       if (data.checklist) {
//         console.log('Parsing checklist data:', typeof data.checklist);
        
//         // Handle checklist data in different formats
//         if (Array.isArray(data.checklist)) {
//           parsedTaskGroups = data.checklist.map((group, index) => ({
//             groupId: group.groupId || `group_${index + 1}`,
//             rooms: group.rooms || [],
//             pricing: group.pricing || null,
//             tasks: group.tasks || []
//           }));
//         } else if (typeof data.checklist === 'object' && data.checklist !== null) {
//           // Handle object format
//           if (data.checklist.groups && Array.isArray(data.checklist.groups)) {
//             // If checklist has groups array
//             parsedTaskGroups = data.checklist.groups;
//           } else {
//             // If checklist is a plain object with group keys
//             const groupKeys = Object.keys(data.checklist);
//             parsedTaskGroups = groupKeys.map((key, index) => {
//               const group = data.checklist[key];
//               return {
//                 groupId: key,
//                 rooms: Array.isArray(group.rooms) ? group.rooms : [],
//                 pricing: group.pricing || null,
//                 tasks: Array.isArray(group.tasks) ? group.tasks : []
//               };
//             });
//           }
//         }
        
//         console.log('Parsed task groups:', parsedTaskGroups);
//       }
      
//       // Set task groups with parsed data or defaults
//       const finalTaskGroups = parsedTaskGroups.length > 0 
//         ? parsedTaskGroups 
//         : Array.from({ length: expectedCleaners }, (_, i) => ({
//             groupId: `group_${i + 1}`,
//             rooms: [],
//             pricing: null,
//             tasks: []
//           }));
      
//       setTaskGroups(finalTaskGroups);
//       setExpectedCleaners(finalTaskGroups.length);
      
//       // Set group summary
//       if (data.checklist) {
//         setGroupSummary(data.checklist);
//       }
      
//       // Now fetch apartment data
//       if (data.propertyId) {
//         console.log('Fetching apartment data for propertyId:', data.propertyId);
        
//         try {
//           const apartmentRes = await userService.getApartmentById(data.propertyId, {
//             headers: {
//               Authorization: `Bearer ${userToken}`,
//             },
//           });
          
//           const apartmentData = apartmentRes.data;
//           console.log('Fetched apartment data:', apartmentData);
          
//           if (apartmentData) {
//             setSelectedApartment(apartmentData);
//           } else {
//             console.warn('Apartment data was empty');
//             // Set a fallback apartment structure to allow editing
//             setSelectedApartment({
//               _id: data.propertyId,
//               apt_name: 'Unknown Property',
//               rooms: []
//             });
//           }
//         } catch (apartmentError) {
//           console.error('Error fetching apartment:', apartmentError);
//           // Create a fallback apartment to allow editing
//           setSelectedApartment({
//             _id: data.propertyId,
//             apt_name: data.propertyName || 'Property',
//             rooms: []
//           });
//         }
//       } else {
//         console.warn('No propertyId found in checklist data');
//         // Set a dummy apartment to allow editing
//         setSelectedApartment({
//           _id: 'temp_id',
//           apt_name: 'No Property Assigned',
//           rooms: []
//         });
//       }
      
//       setHasLoadedData(true);
      
//     } catch (err) {
//       console.error('Error fetching checklist:', err);
//       Toast.show({
//         type: 'error',
//         text1: 'Failed to load checklist',
//         text2: err.message || 'Please try again',
//       });
      
//       // Set minimal data to allow user to see the screen
//       setHasLoadedData(true);
//       setTaskGroups(Array.from({ length: expectedCleaners }, (_, i) => ({
//         groupId: `group_${i + 1}`,
//         rooms: [],
//         pricing: null,
//         tasks: []
//       })));
      
//       setSelectedApartment({
//         _id: 'error_id',
//         apt_name: 'Error Loading Property',
//         rooms: []
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleUpdateChecklist = async () => {
//     if (!checklistName.trim()) {
//       Toast.show({
//         type: 'error',
//         text1: 'Checklist Name Required',
//         text2: 'Please enter a name for this checklist.',
//       });
//       return;
//     }

//     if (!groupSummary) {
//       Toast.show({
//         type: 'error',
//         text1: 'No Tasks',
//         text2: 'Please assign at least one task',
//       });
//       return;
//     }

//     const payload = {
//       checklistName: checklistName.trim(),
//       checklist: groupSummary,
//       totalFee,
//       totalTime,
//       propertyId: selectedApartment?._id || checklistData?.propertyId,
//       hostId: currentUserId,
//     };

//     console.log('Update payload:', payload);

//     setIsSaving(true);
//     try {
//       const res = await userService.updateChecklist(checklistId, payload, {
//         headers: {
//           Authorization: `Bearer ${userToken}`,
//         },
//       });

//       if (res.status === 200) {
//         Toast.show({
//           type: 'success',
//           text1: 'Checklist updated',
//           text2: 'Your changes have been saved',
//         });
        
//         // Call the update callback if provided
//         if (onChecklistUpdated) {
//           onChecklistUpdated();
//         }
        
//         navigation.goBack();
//       }
//     } catch (err) {
//       console.error('Checklist update failed', err);
//       Toast.show({
//         type: 'error',
//         text1: 'Failed to update checklist',
//         text2: err.response?.data?.message || 'Please try again later',
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleDeleteChecklist = () => {
//     Alert.alert(
//       'Delete Checklist',
//       `Are you sure you want to delete "${checklistName}"? This action cannot be undone.`,
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               const res = await userService.deleteChecklist(checklistId, {
//                 headers: { Authorization: `Bearer ${userToken}` }
//               });
              
//               if (res.status === 200) {
//                 Toast.show({
//                   type: 'success',
//                   text1: 'Checklist deleted',
//                   text2: 'The checklist has been removed',
//                 });
                
//                 // Call the update callback if provided
//                 if (onChecklistUpdated) {
//                   onChecklistUpdated();
//                 }
                
//                 navigation.goBack();
//               }
//             } catch (err) {
//               console.error('Delete error:', err);
//               Toast.show({
//                 type: 'error',
//                 text1: 'Failed to delete checklist',
//                 text2: err.response?.data?.message || 'Please try again',
//               });
//             }
//           },
//         },
//       ]
//     );
//   };

//   // Handle group summary change from RoomAssignmentPicker
//   const handleGroupSummaryChange = (summary) => {
//     console.log('Group summary updated:', summary);
//     setGroupSummary(summary);
//   };

//   // Handle total fee change
//   const handleTotalFeeChange = (fee) => {
//     setTotalFee(fee);
//   };

//   // Handle total time change
//   const handleTotalTimeChange = (time) => {
//     setTotalTime(time);
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>Loading checklist details...</Text>
//       </View>
//     );
//   }

//   if (!checklistData) {
//     return (
//       <View style={styles.errorContainer}>
//         <MaterialCommunityIcons name="alert-circle" size={48} color="#FF6B6B" />
//         <Text style={styles.errorText}>Checklist not found</Text>
//         <Button 
//           mode="contained" 
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}
//         >
//           Go Back
//         </Button>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton} 
//           onPress={() => navigation.goBack()}
//         >
//           <Feather name="arrow-left" size={24} color={COLORS.dark} />
//         </TouchableOpacity>
//         <View style={styles.headerTitleContainer}>
//           <Text style={styles.headerTitle}>Edit Checklist</Text>
//           <Text style={styles.headerSubtitle}>
//             {selectedApartment?.apt_name || checklistData?.propertyName || 'Property'}
//           </Text>
//         </View>
//         <TouchableOpacity 
//           style={styles.deleteButton}
//           onPress={handleDeleteChecklist}
//         >
//           <Feather name="trash-2" size={20} color="#FF6B6B" />
//         </TouchableOpacity>
//       </View>

//       <ScrollView 
//         showsVerticalScrollIndicator={false} 
//         style={styles.scrollContainer}
//       >
//         <View style={styles.content}>
//           <View style={styles.inputContainer}>
//             <Text style={styles.label}>Checklist Name</Text>
//             <TextInput
//               mode="outlined"
//               value={checklistName}
//               onChangeText={setChecklistName}
//               placeholder="Enter checklist name"
//               style={styles.nameInput}
//               outlineColor="#e0e0e0"
//               activeOutlineColor={COLORS.primary}
//             />
//           </View>

//           {hasLoadedData && selectedApartment && (
//             <RoomAssignmentPicker
//               key={`edit_${checklistId}_${taskGroups.length}`}
//               selectedApartment={selectedApartment}
//               taskGroups={taskGroups}
//               onGroupSummaryChange={handleGroupSummaryChange}
//               onTotalFeeChange={handleTotalFeeChange}
//               onTotalTimeChange={handleTotalTimeChange}
//               checklistName={checklistName}
//               setChecklistName={setChecklistName}
//               onInfoPress={() => setShowTooltip(true)}
//               isEditing={true}
//               existingChecklistData={checklistData.checklist}
//             />
//           )}

//           <View style={styles.summarySection}>
//             <Text style={styles.summaryTitle}>Summary</Text>
//             <View style={styles.summaryRow}>
//               <View style={styles.summaryItem}>
//                 <Text style={styles.summaryLabel}>Total Fee</Text>
//                 <Text style={styles.summaryValue}>{currency}{totalFee.toFixed(2)}</Text>
//               </View>
//               <View style={styles.summaryDivider} />
//               <View style={styles.summaryItem}>
//                 <Text style={styles.summaryLabel}>Total Time</Text>
//                 <Text style={styles.summaryValue}>{totalTime} mins</Text>
//               </View>
//               <View style={styles.summaryDivider} />
//               <View style={styles.summaryItem}>
//                 <Text style={styles.summaryLabel}>Groups</Text>
//                 <Text style={styles.summaryValue}>{expectedCleaners}</Text>
//               </View>
//             </View>
//           </View>

//           <View style={styles.buttonContainer}>
//             <Button
//               mode="outlined"
//               onPress={() => navigation.goBack()}
//               style={[styles.button, styles.cancelButton]}
//               contentStyle={styles.buttonContent}
//             >
//               Cancel
//             </Button>
            
//             <Button
//               mode="contained"
//               onPress={handleUpdateChecklist}
//               disabled={!groupSummary || isSaving || !checklistName.trim()}
//               loading={isSaving}
//               style={[styles.button, styles.saveButton]}
//               contentStyle={styles.buttonContent}
//             >
//               Save Changes
//             </Button>
//           </View>
//         </View>
//       </ScrollView>

//       {/* Tooltip Modal */}
//       <Modal
//         visible={showTooltip}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowTooltip(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeader}>
//               <AntDesign name="infocirlce" size={24} color={COLORS.primary} />
//               <Text style={styles.modalTitle}>Checklist Information</Text>
//             </View>
            
//             <Text style={styles.modalText}>
//               This helps us understand how many cleaners will work on the apartment.
//               {"\n\n"}
//               If it's just one cleaner, we'll assign all tasks to one group.
//               If it's two or more, you'll be able to split tasks across groups for faster cleaning.
//               {"\n\n"}
//               <Text style={{ fontWeight: 'bold' }}>Editing Mode:</Text> You can modify existing task assignments, add new tasks, or adjust pricing.
//             </Text>
            
//             <TouchableOpacity
//               style={styles.modalCloseButton}
//               onPress={() => setShowTooltip(false)}
//             >
//               <Text style={styles.modalCloseText}>Got it</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//     backgroundColor: '#fff',
//   },
//   backButton: {
//     padding: 8,
//   },
//   headerTitleContainer: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: COLORS.dark,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: COLORS.gray,
//     marginTop: 2,
//   },
//   deleteButton: {
//     padding: 8,
//   },
//   scrollContainer: {
//     flex: 1,
//   },
//   content: {
//     padding: 20,
//   },
//   inputContainer: {
//     marginBottom: 24,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 8,
//   },
//   nameInput: {
//     backgroundColor: '#fff',
//   },
//   summarySection: {
//     marginTop: 24,
//     padding: 16,
//     backgroundColor: '#f8f9fe',
//     borderRadius: 12,
//   },
//   summaryTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 12,
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   summaryItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   summaryLabel: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginBottom: 4,
//   },
//   summaryValue: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },
//   summaryDivider: {
//     width: 1,
//     height: 40,
//     backgroundColor: '#e0e7ff',
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 32,
//     gap: 12,
//   },
//   button: {
//     flex: 1,
//     borderRadius: 8,
//   },
//   cancelButton: {
//     borderColor: COLORS.gray,
//   },
//   saveButton: {
//     backgroundColor: COLORS.primary,
//   },
//   buttonContent: {
//     paddingVertical: 8,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: COLORS.gray,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     padding: 20,
//   },
//   errorText: {
//     fontSize: 18,
//     color: COLORS.dark,
//     marginTop: 16,
//     marginBottom: 24,
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
//   modalCloseButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     alignSelf: 'flex-end',
//   },
//   modalCloseText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 14,
//   },
// });




// import React, { useState, useEffect, useContext, useRef } from 'react';
// import {
//   View,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
//   Alert,
//   Modal
// } from 'react-native';
// import { Text, Button, TextInput } from 'react-native-paper';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { AuthContext } from '../../context/AuthContext';
// import COLORS from '../../constants/colors';
// import RoomAssignmentPicker from './CreateBookingContents/RoomAssignmentPicker';
// import userService from '../../services/connection/userService';
// import Toast from 'react-native-toast-message';
// import { MaterialCommunityIcons, Feather, AntDesign } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function EditChecklist() {
//   const { currentUserId, currency, userToken } = useContext(AuthContext);
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { checklistId, onChecklistUpdated } = route.params || {};

//   const [selectedApartment, setSelectedApartment] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);
//   const [checklistName, setChecklistName] = useState('');
//   const [totalFee, setTotalFee] = useState(0);
//   const [totalTime, setTotalTime] = useState(0);
//   const [checklistData, setChecklistData] = useState(null);
//   const [showTooltip, setShowTooltip] = useState(false);
//   const [hasLoadedData, setHasLoadedData] = useState(false);
//   const [isInitialLoad, setIsInitialLoad] = useState(true);

//   // State for group summary
//   const [groupSummary, setGroupSummary] = useState(null);

//   // Refs to prevent loops
//   const hasFetchedData = useRef(false);
//   const isFetching = useRef(false);

//   console.log('EditChecklist - Loading checklist:', checklistId);

//   useEffect(() => {
//     // Only fetch data if we haven't already fetched it
//     if (checklistId && !hasFetchedData.current && !isFetching.current) {
//       fetchChecklistData();

//     }

//     return () => {
//       // Reset refs when component unmounts
//       hasFetchedData.current = false;
//       isFetching.current = false;
//     };
//   }, [checklistId]);

//   const getToken = async () => {
//     const stored = await AsyncStorage.getItem('@storage_Key');
//     if (!stored) return null;
  
//     const parsed = JSON.parse(stored);
//     return parsed?.resp?.token || null;
//   };

//   const fetchChecklistData = async () => {
//     // Prevent multiple simultaneous fetches
//     if (isFetching.current) {
//       console.log('Already fetching, skipping...');
//       return;
//     }

//     console.log('Starting fetch...');
//     isFetching.current = true;
//     setIsLoading(true);
//     setHasLoadedData(false);

//     try {
//       console.log('Fetching checklist data for ID:', checklistId);
      
//       // Fetch checklist data
//       const res = await userService.getChecklistById(checklistId, {
//         headers: {
//           Authorization: `Bearer ${userToken}`,
//         },
//       });
      
//       const data = res.data;
//       console.log('Fetched checklist data:', {
//         id: data._id,
//         name: data.checklistName,
//         checklist: data.checklist,
//         checklistType: typeof data.checklist,
//         isArray: Array.isArray(data.checklist),
//         keys: data.checklist ? Object.keys(data.checklist) : 'none'
//       });

//       if (!data) {
//         throw new Error('No checklist data found');
//       }
      
//       setChecklistData(data);
      
//       // Set checklist name
//       setChecklistName(data.checklistName || '');
      
//       // Set totals
//       setTotalFee(data.totalFee || 0);
//       setTotalTime(data.totalTime || 0);
      
//       // Set group summary
//       if (data.checklist) {
//         console.log('Setting group summary from fetched data');
//         setGroupSummary(data.checklist);
//       }
      
//       // Fetch apartment details
//       if (data.propertyId) {
//         console.log('Fetching apartment data for propertyId:', data.propertyId);
        
//         try {
//           const apartmentRes = await userService.getApartmentById(data.propertyId, {
//             headers: {
//               Authorization: `Bearer ${userToken}`,
//             },
//           });
//           const apartmentData = apartmentRes.data;
//           console.log('Fetched apartment data:', {
//             name: apartmentData?.apt_name,
//             roomDetails: apartmentData?.roomDetails,
//             hasRoomDetails: !!apartmentData?.roomDetails
//           });
          
//           if (apartmentData) {
//             setSelectedApartment(apartmentData);
//           } else {
//             console.warn('No apartment data returned');
//             // Create fallback apartment
//             setSelectedApartment({
//               _id: data.propertyId,
//               apt_name: 'Unknown Property',
//               rooms: [],
//               roomDetails: []
//             });
//           }
//         } catch (apartmentError) {
//           console.error('Error fetching apartment:', apartmentError);
//           // Create fallback apartment
//           setSelectedApartment({
//             _id: data.propertyId,
//             apt_name: data.propertyName || 'Property',
//             rooms: [],
//             roomDetails: []
//           });
//         }
//       } else {
//         console.log('No propertyId in checklist data');
//         // Create a minimal apartment object
//         setSelectedApartment({
//           _id: 'temp_id',
//           apt_name: 'No Property',
//           rooms: [],
//           roomDetails: []
//         });
//       }
      
//       hasFetchedData.current = true;
//       setHasLoadedData(true);
//       setIsInitialLoad(false);
      
//     } catch (err) {
//       console.error('Error fetching checklist:', err);
//       Toast.show({
//         type: 'error',
//         text1: 'Failed to load checklist',
//         text2: err.message || 'Please try again',
//       });
      
//       // Even on error, set loaded data to true so UI can render
//       setHasLoadedData(true);
//       setIsInitialLoad(false);
//     } finally {
//       setIsLoading(false);
//       isFetching.current = false;
//     }
//   };

//   const handleUpdateChecklist = async () => {
//     if (!checklistName.trim()) {
//       Toast.show({
//         type: 'error',
//         text1: 'Checklist Name Required',
//         text2: 'Please enter a name for this checklist.',
//       });
//       return;
//     }

//     if (!groupSummary) {
//       Toast.show({
//         type: 'error',
//         text1: 'No Tasks',
//         text2: 'Please assign at least one task',
//       });
//       return;
//     }

//     const payload = {
//       checklistName: checklistName.trim(),
//       checklist: groupSummary,
//       totalFee,
//       totalTime,
//       propertyId: selectedApartment?._id || checklistData?.propertyId,
//       hostId: currentUserId,
//     };

//     console.log('Update payload:', payload);

//     setIsSaving(true);
//     try {
//       const res = await userService.updateChecklist(checklistId, payload, {
//         headers: {
//           Authorization: `Bearer ${userToken}`,
//         },
//       });

//       if (res.status === 200) {
//         Toast.show({
//           type: 'success',
//           text1: 'Checklist updated',
//           text2: 'Your changes have been saved',
//         });
        
//         if (onChecklistUpdated) {
//           onChecklistUpdated();
//         }
        
//         navigation.goBack();
//       }
//     } catch (err) {
//       console.error('Checklist update failed', err);
//       Toast.show({
//         type: 'error',
//         text1: 'Failed to update checklist',
//         text2: err.response?.data?.message || 'Please try again later',
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // const handleDeleteChecklist = () => {
//   //   Alert.alert(
//   //     'Delete Checklist',
//   //     `Are you sure you want to delete "${checklistName}"? This action cannot be undone.`,
//   //     [
//   //       {
//   //         text: 'Cancel',
//   //         style: 'cancel',
//   //       },
//   //       {
//   //         text: 'Delete',
//   //         style: 'destructive',
//   //         onPress: async () => {
//   //           try {
//   //             const res = await userService.deleteChecklist(checklistId, {
//   //               headers: { Authorization: `Bearer ${userToken}` }
//   //             });
              
//   //             if (res.status === 200) {
//   //               Toast.show({
//   //                 type: 'success',
//   //                 text1: 'Checklist deleted',
//   //                 text2: 'The checklist has been removed',
//   //               });
                
//   //               if (onChecklistUpdated) {
//   //                 onChecklistUpdated();
//   //               }
                
//   //               navigation.goBack();
//   //             }
//   //           } catch (err) {
//   //             console.error('Delete error:', err);
//   //             Toast.show({
//   //               type: 'error',
//   //               text1: 'Failed to delete checklist',
//   //               text2: err.response?.data?.message || 'Please try again',
//   //             });
//   //           }
//   //         },
//   //       },
//   //     ]
//   //   );
//   // };

//   // In your React Native component
// // const handleDeleteChecklist = () => {
// //   Alert.alert(
// //     'Delete Checklist',
// //     `Are you sure you want to deletes "${checklistName}"? This action cannot be undone.`,
// //     [
// //       {
// //         text: 'Cancel',
// //         style: 'cancel',
// //       },
// //       {
// //         text: 'Delete',
// //         style: 'destructive',
// //         onPress: async () => {
// //           try {
// //             console.log(`Deleting checklist ${checklistId}...`);

// //             const userToken = await AsyncStorage.getItem('userToken');
            
// //             // Method 1: Using DELETE method
// //             const res = await userService.deleteChecklist(checklistId, userToken);
            
// //             // Method 2: If using POST method instead
// //             // const res = await userService.deleteChecklistPost(checklistId);
            
// //             console.log('Delete response:', res);
            
// //             if (res.status === 'success') {
// //               Toast.show({
// //                 type: 'success',
// //                 text1: 'Checklist deleted',
// //                 text2: 'The checklist has been removed',
// //                 visibilityTime: 3000,
// //               });
              
// //               // Callback to refresh parent component
// //               if (onChecklistUpdated) {
// //                 onChecklistUpdated();
// //               }
              
// //               // Navigate back
// //               navigation.goBack();
// //             }
// //           } catch (err) {
// //             console.error('Delete error details:', {
// //               message: err.message,
// //               response: err.response?.data,
// //               status: err.response?.status,
// //               checklistId: checklistId
// //             });
            
// //             let errorMessage = 'Please try again';
            
// //             if (err.response) {
// //               // Server responded with error
// //               const { status, data } = err.response;
              
// //               if (status === 404) {
// //                 errorMessage = 'Checklist not found. It may have already been deleted.';
// //               } else if (status === 403) {
// //                 errorMessage = 'You are not authorized to delete this checklist.';
// //               } else if (status === 401) {
// //                 errorMessage = 'Please log in again.';
// //               } else if (data?.detail) {
// //                 errorMessage = data.detail;
// //               } else if (data?.message) {
// //                 errorMessage = data.message;
// //               }
// //             } else if (err.request) {
// //               // Request made but no response
// //               errorMessage = 'Network error. Please check your connection.';
// //             } else {
// //               // Something else
// //               errorMessage = err.message || 'Unknown error occurred.';
// //             }
            
// //             Toast.show({
// //               type: 'error',
// //               text1: 'Failed to delete checklist',
// //               text2: errorMessage,
// //               visibilityTime: 4000,
// //             });
// //           }
// //         },
// //       },
// //     ]
// //   );
// // };

// const handleDeleteChecklist = () => {
//   Alert.alert(
//     'Delete Checklist',
//     `Are you sure you want to delete "${checklistName}"? This action cannot be undone.`,
//     [
//       {
//         text: 'Cancel',
//         style: 'cancel',
//       },
//       {
//         text: 'Delete',
//         style: 'destructive',
//         onPress: async () => {
//           try {
//             console.log(`🗑️ Deleting checklist ${checklistId}...`);
            
//             // Check if we have a token
//             const token = await getToken();
          
            
//             if (!token) {
//               Toast.show({
//                 type: 'error',
//                 text1: 'Authentication Error',
//                 text2: 'Please log in again.',
//               });
//               navigation.navigate('Login');
//               return;
//             }
            
//             // Log the token for debugging
//             console.log('🔐 Token being used:', token);
//             console.log('🔐 Token type:', token.includes('.') ? 'JWT' : 'ObjectId');
            
//             // Option 1: Use the service with interceptor
//             const res = await userService.deleteChecklist(checklistId, token);
            
//             // Option 2: Use explicit token (for debugging)
//             // const res = await userService.deleteChecklistWithToken(checklistId, token);
            
//             console.log('✅ Delete response:', res);
            
//             if (res.data?.status === 'success') {
//               Toast.show({
//                 type: 'success',
//                 text1: 'Checklist deleted',
//                 text2: 'The checklist has been removed',
//               });
              
//               Alert.alert('The checklist has been removed');
              
        
//               // Callback to refresh parent component
//               if (onChecklistUpdated) {
//                 onChecklistUpdated();
//               }
              
//               // Navigate back
//               navigation.goBack();
//             }
//           } catch (err) {
//             console.error('❌ Delete error details:', {
//               message: err.message,
//               // response: err.response?.data,
//               // status: err.response?.status,
//               // checklistId: checklistId
//             });
            
//             let errorMessage = 'Please try again';
            
//             if (err.response) {
//               // Server responded with error
//               const { status, data } = err.response;
              
//               if (status === 404) {
//                 errorMessage = 'Checklist not found. It may have already been deleted.';
//               } else if (status === 403) {
//                 errorMessage = 'You are not authorized to delete this checklist.';
//               } else if (status === 401) {
//                 errorMessage = 'Please log in again. Your session may have expired.';
//                 // Optionally redirect to login
//                 // navigation.navigate('Login');
//               } else if (data?.detail) {
//                 errorMessage = data.detail;
//               } else if (data?.message) {
//                 errorMessage = data.message;
//               }
//             } else if (err.request) {
//               // Request made but no response
//               errorMessage = 'Network error. Please check your connection.';
//             } else {
//               // Something else
//               errorMessage = err.message || 'Unknown error occurred.';
//             }

          
            
//             Toast.show({
//               type: 'error',
//               text1: 'Failed to delete checklist',
//               text2: errorMessage,
//               visibilityTime: 4000,
//             });

//             console.log("sdhjvhsjhssh")
//           }
//         },
//       },
//     ]
//   );
// };

//   // Handle group summary change from RoomAssignmentPicker
//   const handleGroupSummaryChange = (summary) => {
//     console.log('Group summary updated in parent:', {
//       keys: Object.keys(summary || {}),
//       summary
//     });
    
//     setGroupSummary(summary);
//   };

//   // Handle total fee change
//   const handleTotalFeeChange = (fee) => {
//     setTotalFee(fee);
//   };

//   // Handle total time change
//   const handleTotalTimeChange = (time) => {
//     setTotalTime(time);
//   };

//   // Calculate group count from groupSummary
//   const groupCount = groupSummary ? Object.keys(groupSummary).length : 0;

//   if (isLoading && isInitialLoad) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>Loading checklist details...</Text>
//       </View>
//     );
//   }

//   if (!checklistData && !isLoading) {
//     return (
//       <View style={styles.errorContainer}>
//         <MaterialCommunityIcons name="alert-circle" size={48} color="#FF6B6B" />
//         <Text style={styles.errorText}>Checklist not found</Text>
//         <Button 
//           mode="contained" 
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}
//         >
//           Go Back
//         </Button>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton} 
//           onPress={() => navigation.goBack()}
//         >
//           <Feather name="arrow-left" size={24} color={COLORS.dark} />
//         </TouchableOpacity>
//         <View style={styles.headerTitleContainer}>
//           <Text style={styles.headerTitle}>Edit Checklist</Text>
//           <Text style={styles.headerSubtitle}>
//             {selectedApartment?.apt_name || checklistData?.propertyName || 'Property'}
//           </Text>
//         </View>
//         <TouchableOpacity 
//           style={styles.deleteButton}
//           onPress={handleDeleteChecklist}
//         >
//           <Feather name="trash-2" size={20} color="#FF6B6B" />
//         </TouchableOpacity>
//       </View>

//       <ScrollView 
//         showsVerticalScrollIndicator={false} 
//         style={styles.scrollContainer}
//       >
//         <View style={styles.content}>
//           <View style={styles.inputContainer}>
//             <Text style={styles.label}>Checklist Name</Text>
//             <TextInput
//               mode="outlined"
//               value={checklistName}
//               onChangeText={setChecklistName}
//               placeholder="Enter checklist name"
//               style={styles.nameInput}
//               outlineColor="#e0e0e0"
//               activeOutlineColor={COLORS.primary}
//             />
//           </View>

//           {hasLoadedData && selectedApartment && (
//             <RoomAssignmentPicker
//               selectedApartment={selectedApartment}
//               onGroupSummaryChange={handleGroupSummaryChange}
//               onTotalFeeChange={handleTotalFeeChange}
//               onTotalTimeChange={handleTotalTimeChange}
//               checklistName={checklistName}
//               setChecklistName={setChecklistName}
//               onInfoPress={() => setShowTooltip(true)}
//               isEditing={true}
//               existingChecklistData={checklistData?.checklist || null}
//               key={`room-picker-${checklistId}-${hasLoadedData}`}
//             />
//           )}

//           {/* Show message if data isn't fully loaded */}
//           {hasLoadedData && !selectedApartment && (
//             <View style={styles.warningContainer}>
//               <MaterialCommunityIcons name="alert-outline" size={32} color="#FFA500" />
//               <Text style={styles.warningText}>
//                 Unable to load property data. Some features may be limited.
//               </Text>
//               <Button
//                 mode="outlined"
//                 onPress={fetchChecklistData}
//                 style={styles.retryButton}
//                 icon="refresh"
//               >
//                 Retry Loading
//               </Button>
//             </View>
//           )}

//           <View style={styles.summarySection}>
//             <Text style={styles.summaryTitle}>Summary</Text>
//             <View style={styles.summaryRow}>
//               <View style={styles.summaryItem}>
//                 <Text style={styles.summaryLabel}>Total Fee</Text>
//                 <Text style={styles.summaryValue}>{currency}{totalFee.toFixed(2)}</Text>
//               </View>
//               <View style={styles.summaryDivider} />
//               <View style={styles.summaryItem}>
//                 <Text style={styles.summaryLabel}>Total Time</Text>
//                 <Text style={styles.summaryValue}>{totalTime} mins</Text>
//               </View>
//               <View style={styles.summaryDivider} />
//               <View style={styles.summaryItem}>
//                 <Text style={styles.summaryLabel}>Groups</Text>
//                 <Text style={styles.summaryValue}>{groupCount}</Text>
//               </View>
//             </View>
//           </View>

//           <View style={styles.buttonContainer}>
//             <Button
//               mode="outlined"
//               onPress={() => navigation.goBack()}
//               style={[styles.button, styles.cancelButton]}
//               contentStyle={styles.buttonContent}
//             >
//               Cancel
//             </Button>
            
//             <Button
//               mode="contained"
//               onPress={handleUpdateChecklist}
//               disabled={!groupSummary || isSaving || !checklistName.trim()}
//               loading={isSaving}
//               style={[styles.button, styles.saveButton]}
//               contentStyle={styles.buttonContent}
//             >
//               Save Changes
//             </Button>
//           </View>
//         </View>
//       </ScrollView>

//       {/* Tooltip Modal */}
//       <Modal
//         visible={showTooltip}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowTooltip(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeader}>
//               <AntDesign name="infocirlce" size={24} color={COLORS.primary} />
//               <Text style={styles.modalTitle}>Checklist Information</Text>
//             </View>
            
//             <Text style={styles.modalText}>
//               This helps us understand how many cleaners will work on the apartment.
//               {"\n\n"}
//               If it's just one cleaner, we'll assign all tasks to one group.
//               If it's two or more, you'll be able to split tasks across groups for faster cleaning.
//               {"\n\n"}
//               <Text style={{ fontWeight: 'bold' }}>Editing Mode:</Text> You can modify existing task assignments, add new tasks, or adjust pricing.
//             </Text>
            
//             <TouchableOpacity
//               style={styles.modalCloseButton}
//               onPress={() => setShowTooltip(false)}
//             >
//               <Text style={styles.modalCloseText}>Got it</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//     backgroundColor: '#fff',
//   },
//   backButton: {
//     padding: 8,
//   },
//   headerTitleContainer: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: COLORS.dark,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: COLORS.gray,
//     marginTop: 2,
//   },
//   deleteButton: {
//     padding: 8,
//   },
//   scrollContainer: {
//     flex: 1,
//   },
//   content: {
//     padding: 20,
//   },
//   inputContainer: {
//     marginBottom: 24,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 8,
//   },
//   nameInput: {
//     backgroundColor: '#fff',
//   },
//   summarySection: {
//     marginTop: 24,
//     padding: 16,
//     backgroundColor: '#f8f9fe',
//     borderRadius: 12,
//   },
//   summaryTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 12,
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   summaryItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   summaryLabel: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginBottom: 4,
//   },
//   summaryValue: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },
//   summaryDivider: {
//     width: 1,
//     height: 40,
//     backgroundColor: '#e0e7ff',
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 32,
//     gap: 12,
//   },
//   button: {
//     flex: 1,
//     borderRadius: 8,
//   },
//   cancelButton: {
//     borderColor: COLORS.gray,
//   },
//   saveButton: {
//     backgroundColor: COLORS.primary,
//   },
//   buttonContent: {
//     paddingVertical: 8,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: COLORS.gray,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     padding: 20,
//   },
//   errorText: {
//     fontSize: 18,
//     color: COLORS.dark,
//     marginTop: 16,
//     marginBottom: 24,
//   },
//   warningContainer: {
//     padding: 16,
//     backgroundColor: '#FFF9E6',
//     borderRadius: 8,
//     alignItems: 'center',
//     marginVertical: 16,
//   },
//   warningText: {
//     fontSize: 14,
//     color: '#D48806',
//     textAlign: 'center',
//     marginVertical: 8,
//   },
//   retryButton: {
//     marginTop: 8,
//     borderColor: '#D48806',
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
//   modalCloseButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     alignSelf: 'flex-end',
//   },
//   modalCloseText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 14,
//   },
// });




import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  Platform
} from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import COLORS from '../../constants/colors';
import RoomAssignmentPicker from './CreateBookingContents/RoomAssignmentPicker';
import userService from '../../services/connection/userService';
import Toast from 'react-native-toast-message';
import { MaterialCommunityIcons, Feather, AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ROUTES from '../../constants/routes';

export default function EditChecklist() {
  const { currentUserId, currency, userToken, logout } = useContext(AuthContext); // Added logout
  const navigation = useNavigation();
  const route = useRoute();
  const { checklistId, onChecklistUpdated } = route.params || {};

  const [selectedApartment, setSelectedApartment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [checklistName, setChecklistName] = useState('');
  const [totalFee, setTotalFee] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [checklistData, setChecklistData] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // State for group summary
  const [groupSummary, setGroupSummary] = useState(null);

  // Refs to prevent loops
  const hasFetchedData = useRef(false);
  const isFetching = useRef(false);

  console.log('EditChecklist - Loading checklist:', checklistId);

  useEffect(() => {
    // Only fetch data if we haven't already fetched it
    if (checklistId && !hasFetchedData.current && !isFetching.current) {
      fetchChecklistData();
    }

    return () => {
      // Reset refs when component unmounts
      hasFetchedData.current = false;
      isFetching.current = false;
    };
  }, [checklistId]);

  const getToken = async () => {
    try {
      const stored = await AsyncStorage.getItem('@storage_Key');
      if (!stored) return null;
    
      const parsed = JSON.parse(stored);
      return parsed?.resp?.token || parsed?.token || null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  const showToast = (type, text1, text2) => {
    console.log(`Showing toast: ${type} - ${text1} - ${text2}`);
    Toast.show({
      type,
      text1,
      text2,
      position: 'top',
      visibilityTime: 6000,
      autoHide: true,
      topOffset: Platform.OS === 'ios' ? 50 : 30,
      bottomOffset: 40,
    });
  };

  const handleUnauthorized = () => {
    // showToast('error', 'Session Expired', 'Please log in again.');
    navigation.navigate(ROUTES.host_checklist,{
      mode:"delete",
      status:"success",
      message:"Session Expired', 'Please log in again."
    })
    
    // Clear local storage and context
    logout();
    
    // Reset navigation and navigate to Signin
    navigation.reset({
      index: 0,
      routes: [{ name: 'Signin' }],
    });
  };

  const fetchChecklistData = async () => {
    // Prevent multiple simultaneous fetches
    if (isFetching.current) {
      console.log('Already fetching, skipping...');
      return;
    }

    console.log('Starting fetch...');
    isFetching.current = true;
    setIsLoading(true);
    setHasLoadedData(false);

    try {
      console.log('Fetching checklist data for ID:', checklistId);
      
      // Get token for this request
      const token = await getToken();
      if (!token) {
        handleUnauthorized();
        return;
      }
      
      // Fetch checklist data
      const res = await userService.getChecklistById(checklistId, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!res || !res.data) {
        throw new Error('No data returned from server');
      }
      
      const data = res.data;
      console.log('Fetched checklist data successfully');
      
      if (!data) {
        throw new Error('No checklist data found');
      }
      
      setChecklistData(data);
      
      // Set checklist name
      setChecklistName(data.checklistName || '');
      
      // Set totals
      setTotalFee(data.totalFee || 0);
      setTotalTime(data.totalTime || 0);
      
      // Set group summary
      if (data.checklist) {
        console.log('Setting group summary from fetched data');
        setGroupSummary(data.checklist);
      }
      
      // Fetch apartment details
      if (data.propertyId) {
        console.log('Fetching apartment data for propertyId:', data.propertyId);
        
        try {
          const apartmentRes = await userService.getApartmentById(data.propertyId, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (!apartmentRes || !apartmentRes.data) {
            throw new Error('No apartment data returned');
          }
          
          const apartmentData = apartmentRes.data;
          
          if (apartmentData) {
            setSelectedApartment(apartmentData);
          } else {
            console.warn('No apartment data returned');
            // Create fallback apartment
            setSelectedApartment({
              _id: data.propertyId,
              apt_name: 'Unknown Property',
              rooms: [],
              roomDetails: []
            });
          }
        } catch (apartmentError) {
          console.error('Error fetching apartment:', apartmentError);
          // Create fallback apartment
          setSelectedApartment({
            _id: data.propertyId,
            apt_name: data.propertyName || 'Property',
            rooms: [],
            roomDetails: []
          });
        }
      } else {
        console.log('No propertyId in checklist data');
        // Create a minimal apartment object
        setSelectedApartment({
          _id: 'temp_id',
          apt_name: 'No Property',
          rooms: [],
          roomDetails: []
        });
      }
      
      hasFetchedData.current = true;
      setHasLoadedData(true);
      setIsInitialLoad(false);
      
    } catch (err) {
      console.error('Error fetching checklist:', err);
      
      if (err.response?.status === 401) {
        handleUnauthorized();
      } else {
        showToast('error', 'Failed to load checklist', err.message || 'Please try again');
      }
      
      // Even on error, set loaded data to true so UI can render
      setHasLoadedData(true);
      setIsInitialLoad(false);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  };

  const handleUpdateChecklist = async () => {
    if (!checklistName.trim()) {
      showToast('error', 'Checklist Name Required', 'Please enter a name for this checklist.');
      return;
    }

    if (!groupSummary) {
      showToast('error', 'No Tasks', 'Please assign at least one task');
      return;
    }

    const payload = {
      checklistName: checklistName.trim(),
      checklist: groupSummary,
      apt_name: selectedApartment?.apt_name || checklistData?.propertyName || 'Property',
      totalFee,
      totalTime,
      propertyId: selectedApartment?._id || checklistData?.propertyId,
      hostId: currentUserId,
    };

    

    // const payload = {
    //   propertyId: selectedPropertyId,
    //   hostId: currentUserId,
    //   checklistName: checklistName.trim(),
    //   apt_name: selectedPropertyName,
    //   checklist: groupSummary,
    //   totalFee,
    //   totalTime,
    //   isDefault: true // Make it default for this property
    // };

    console.log('Update payload:', payload);

    setIsSaving(true);
    try {
      const token = await getToken();
      if (!token) {
        handleUnauthorized();
        setIsSaving(false);
        return;
      }

      const res = await userService.editChecklist(checklistId, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.status === 200) {
        showToast('success', 'Checklist updated', 'Your changes have been saved');
        
        if (onChecklistUpdated) {
          onChecklistUpdated();
        }
        
        navigation.navigate(ROUTES.host_checklist,{
          mode:"edit",
          status:"success",
          message:"Checklist successfully updated"
        })
        // navigation.goBack();
      } else {
        throw new Error(`Server returned status: ${res.status}`);
      }
    } catch (err) {
      console.error('Checklist update failed', err);
      
      if (err.response?.status === 401) {
        handleUnauthorized();
      } else {
        showToast('error', 'Failed to update checklist', err.response?.data?.message || 'Please try again later');
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteChecklist = () => {
    Alert.alert(
      'Delete Checklist',
      `Are you sure you want to delete "${checklistName}"? This action cannot be undone.`,
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
              console.log(`🗑️ Deleting checklist ${checklistId}...`);
              
              // Get token
              const token = await getToken();
              
              if (!token) {
                handleUnauthorized();
                return;
              }
              
              console.log('Using token for delete');
              
              // Make the delete request with proper headers
              const res = await userService.deleteChecklist(checklistId, token);
              
              console.log('Delete response:', res);
              
              if (res.status === 200 || res.data?.status === 'success') {
                showToast('success', 'Checklist deleted', 'The checklist has been removed');
                
                // Callback to refresh parent component
                if (onChecklistUpdated) {
                  onChecklistUpdated();
                }
                navigation.navigate(ROUTES.host_checklist,{
                  mode:"delete",
                  status:"success",
                  message:"Checklist successfully removed"
                })
             
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

  // Handle group summary change from RoomAssignmentPicker
  const handleGroupSummaryChange = (summary) => {
    console.log('Group summary updated in parent:', {
      keys: Object.keys(summary || {}),
      summary
    });
    
    setGroupSummary(summary);
  };

  // Handle total fee change
  const handleTotalFeeChange = (fee) => {
    setTotalFee(fee);
  };

  // Handle total time change
  const handleTotalTimeChange = (time) => {
    setTotalTime(time);
  };

  // Calculate group count from groupSummary
  const groupCount = groupSummary ? Object.keys(groupSummary).length : 0;

  if (isLoading && isInitialLoad) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading checklist details...</Text>
      </View>
    );
  }

  if (!checklistData && !isLoading) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>Checklist not found</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Edit Checklist</Text>
          <Text style={styles.headerSubtitle}>
            {selectedApartment?.apt_name || checklistData?.propertyName || 'Property'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDeleteChecklist}
        >
          <Feather name="trash-2" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollContainer}
      >
        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Checklist Name</Text>
            <TextInput
              mode="outlined"
              value={checklistName}
              onChangeText={setChecklistName}
              placeholder="Enter checklist name"
              style={styles.nameInput}
              outlineColor="#e0e0e0"
              activeOutlineColor={COLORS.primary}
            />
          </View>

          {hasLoadedData && selectedApartment && (
            <RoomAssignmentPicker
              selectedApartment={selectedApartment}
              onGroupSummaryChange={handleGroupSummaryChange}
              onTotalFeeChange={handleTotalFeeChange}
              onTotalTimeChange={handleTotalTimeChange}
              checklistName={checklistName}
              setChecklistName={setChecklistName}
              onInfoPress={() => setShowTooltip(true)}
              isEditing={true}
              existingChecklistData={checklistData?.checklist || null}
              key={`room-picker-${checklistId}-${hasLoadedData}`}
            />
          )}

          {/* Show message if data isn't fully loaded */}
          {hasLoadedData && !selectedApartment && (
            <View style={styles.warningContainer}>
              <MaterialCommunityIcons name="alert-outline" size={32} color="#FFA500" />
              <Text style={styles.warningText}>
                Unable to load property data. Some features may be limited.
              </Text>
              <Button
                mode="outlined"
                onPress={fetchChecklistData}
                style={styles.retryButton}
                icon="refresh"
              >
                Retry Loading
              </Button>
            </View>
          )}

          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Fee</Text>
                <Text style={styles.summaryValue}>{currency}{totalFee.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Time</Text>
                <Text style={styles.summaryValue}>{totalTime} mins</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Groups</Text>
                <Text style={styles.summaryValue}>{groupCount}</Text>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={[styles.button, styles.cancelButton]}
              contentStyle={styles.buttonContent}
            >
              Cancel
            </Button>
            
            <Button
              mode="contained"
              onPress={handleUpdateChecklist}
              disabled={!groupSummary || isSaving || !checklistName.trim()}
              loading={isSaving}
              style={[styles.button, styles.saveButton]}
              contentStyle={styles.buttonContent}
            >
              Save Changes
            </Button>
          </View>
        </View>
      </ScrollView>

      {/* Tooltip Modal */}
      <Modal
        visible={showTooltip}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTooltip(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <AntDesign name="infocirlce" size={24} color={COLORS.primary} />
              <Text style={styles.modalTitle}>Checklist Information</Text>
            </View>
            
            <Text style={styles.modalText}>
              This helps us understand how many cleaners will work on the apartment.
              {"\n\n"}
              If it's just one cleaner, we'll assign all tasks to one group.
              If it's two or more, you'll be able to split tasks across groups for faster cleaning.
              {"\n\n"}
              <Text style={{ fontWeight: 'bold' }}>Editing Mode:</Text> You can modify existing task assignments, add new tasks, or adjust pricing.
            </Text>
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTooltip(false)}
            >
              <Text style={styles.modalCloseText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Toast Component must be rendered at root level */}
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  nameInput: {
    backgroundColor: '#fff',
  },
  summarySection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f8f9fe',
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e7ff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 8,
  },
  cancelButton: {
    borderColor: COLORS.gray,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 24,
  },
  warningContainer: {
    padding: 16,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  warningText: {
    fontSize: 14,
    color: '#D48806',
    textAlign: 'center',
    marginVertical: 8,
  },
  retryButton: {
    marginTop: 8,
    borderColor: '#D48806',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginLeft: 12,
  },
  modalText: {
    fontSize: 16,
    color: COLORS.gray,
    lineHeight: 22,
    marginBottom: 24,
  },
  modalCloseButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});