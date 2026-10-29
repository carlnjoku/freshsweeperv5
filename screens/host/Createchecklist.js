

// import React, { useState, useEffect, useContext } from 'react';
// import {
//   View,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
//   Modal,
// } from 'react-native';
// import { Text, Button } from 'react-native-paper';
// import { useNavigation } from '@react-navigation/native';
// import { AuthContext } from '../../context/AuthContext';
// import COLORS from '../../constants/colors';
// import RoomAssignmentPicker from './CreateBookingContents/RoomAssignmentPicker';
// import userService from '../../services/connection/userService';
// import Toast from 'react-native-toast-message';
// import FloatingLabelPickerSelect from '../../components/shared/FloatingLabelPicker';
// import { useBookingContext } from '../../context/BookingContext';
// import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
// import ROUTES from '../../constants/routes';
// import { tSafe } from '../../utils/tSafe'; // added import

// export default function CreateChecklist({ route }) {
//   const { currentUserId, currency, userToken } = useContext(AuthContext);
//   const {
//     source,
//     propertyId,
//     apartmentName,
//     onChecklistCreated,
//   } = route.params || {};

//   const {
//     setFormData,
//   } = useBookingContext();

//   const navigation = useNavigation();

//   const [expectedCleaners] = useState(2);
//   const [taskGroups, setTaskGroups] = useState([]);
//   const [selectedApartment, setSelectedApartment] = useState(null);
//   const [groupSummary, setGroupSummary] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);

//   const [showTooltip, setShowTooltip] = useState(false);
//   const [totalFee, setTotalFee] = useState(0);
//   const [totalTime, setTotalTime] = useState(0);
//   // const [checklistName, setChecklistName] = useState(
//   //   tSafe('default_checklist_name', 'Cleaning Checklist - {property}', { property: apartmentName || tSafe('property', 'Property') })
//   // );
//   const [checklistName, setChecklistName] = useState(
//     `Cleaning Checklist - ${apartmentName || tSafe('property', 'Property')}`
//   );

//   const [selectedPropertyId, setSelectedPropertyId] = useState(propertyId || '');
//   const [selectedPropertyName, setSelectedPropertyName] = useState('');
//   const [properties, setProperties] = useState([]);

//   /* ---------------- FETCH PROPERTIES ---------------- */
//   useEffect(() => {
//     fetchProperties();
//   }, []);

//   const fetchProperties = async () => {
//     try {
//       const res = await userService.getApartment(currentUserId);
//       setProperties(res.data || []);

//       // ✅ DEFAULT SELECTION
//       if (propertyId) {
//         const found = res.data.find(p => p._id === propertyId);
//         if (found) {
//           setSelectedPropertyId(found._id);
//           setSelectedPropertyName(found.apt_name);
//         }
//       } else if (res.data.length > 0) {
//         setSelectedPropertyId(res.data[0]._id);
//         setSelectedPropertyName(res.data[0].apt_name);
//       }
//     } catch (err) {
//       console.error(err);
//       Toast.show({
//         type: 'error',
//         text1: tSafe('failed_load_properties', 'Failed to load properties'),
//       });
//     }
//   };

//   /* ---------------- FETCH APARTMENT DETAILS ---------------- */
//   useEffect(() => {
//     if (!selectedPropertyId) return;

//     const fetchApartmentDetails = async () => {
//       setIsLoading(true);
//       try {
//         const res = await userService.getApartmentById(selectedPropertyId);
//         setSelectedApartment(res.data);

//         const groups = Array.from({ length: expectedCleaners }, (_, i) => ({
//           groupId: `group_${i + 1}`,
//           rooms: [],
//           pricing: null,
//         }));
//         setTaskGroups(groups);
//       } catch (err) {
//         Toast.show({
//           type: 'error',
//           text1: tSafe('failed_load_property', 'Failed to load property'),
//         });
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchApartmentDetails();
//   }, [selectedPropertyId]);

//   /* ---------------- UPDATE FORM DATA ---------------- */
//   useEffect(() => {
//     if (!selectedApartment?._id) return;

//     setFormData(prev => ({
//       ...prev,
//       aptId: selectedApartment._id,
//     }));
//   }, [selectedApartment]);

//   /* ---------------- SAVE ---------------- */
//   const handleSaveChecklist = async () => {
//     if (!selectedPropertyId || !groupSummary || !checklistName.trim()) {
//       Toast.show({
//         type: 'error',
//         text1: tSafe('missing_data', 'Missing required data'),
//       });
//       return;
//     }

//     const payload = {
//       propertyId: selectedPropertyId,
//       hostId: currentUserId,
//       checklistName: checklistName.trim(),
//       apt_name: selectedPropertyName,
//       checklist: groupSummary,
//       totalFee,
//       totalTime,
//       isDefault: true,
//     };

//     setIsSaving(true);
//     try {
//       const res = await userService.saveChecklist(payload, {
//         headers: { Authorization: `Bearer ${userToken}` },
//       });

//       if (res.status === 200) {

//         // Callback to refresh parent component
//         if (onChecklistCreated) {
//           onChecklistCreated();
//         }
//         // navigation.replace(ROUTES.host_apt_dashboard, { selectedPropertyId });
//         navigation.navigate(ROUTES.host_checklist,{
//           mode:"delete",
//           status:"success",
//           message:tSafe('checklist_created_success', 'Checklist successfully created')
//         })
//         // Toast.show({
//         //   type: 'success',
//         //   text1: 'Checklist saved successfully',
//         // });
//       }
//     } catch (err) {
//       Toast.show({
//         type: 'error',
//         text1: tSafe('failed_save_checklist', 'Failed to save checklist'),
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text>{tSafe('loading_property_details', 'Loading property details...')}</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//           <MaterialCommunityIcons name="arrow-left" size={24} />
//           <Text style={styles.backText}>{tSafe('back', 'Back')}</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>{tSafe('create_checklist_title', 'Create Checklist')}</Text>
//         <View style={{ width: 60 }} />
//       </View>

//       <ScrollView style={styles.content}>
//         {!propertyId && (
//           <FloatingLabelPickerSelect
//             label={tSafe('choose_property', 'Choose a property')}
//             items={properties.map(p => ({
//               label: p.apt_name,
//               value: p._id,
//             }))}
//             value={selectedPropertyId}
//             onValueChange={(value) => {
//               setSelectedPropertyId(value);
//               const prop = properties.find(p => p._id === value);
//               setSelectedPropertyName(prop?.apt_name || '');
//             }}
//           />
//         )}

//         {selectedApartment && (
//           <RoomAssignmentPicker
//             key={selectedPropertyId}
//             selectedApartment={selectedApartment}
//             taskGroups={taskGroups}
//             onGroupSummaryChange={setGroupSummary}
//             onTotalFeeChange={setTotalFee}
//             onTotalTimeChange={setTotalTime}
//             checklistName={checklistName}
//             setChecklistName={setChecklistName}
//             onInfoPress={() => setShowTooltip(true)}
//           />
//         )}

//         <Button
//           mode="contained"
//           onPress={handleSaveChecklist}
//           loading={isSaving}
//           disabled={!groupSummary}
//           style={{ marginTop: 24, marginBottom:20, backgroundColor:COLORS.dark }}
//         >
//           {tSafe('save_checklist', 'Save Checklist')} ({currency}{totalFee.toFixed(2)})
//         </Button>
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
//               <Text style={styles.modalTitle}>{tSafe('checklist_information', 'Checklist Information')}</Text>
//             </View>
            
//             <Text style={styles.modalText}>
//               {tSafe('checklist_tooltip_text', 'This helps us understand how many cleaners will work on the apartment.\n\nIf it\'s just one cleaner, we\'ll assign all tasks to one team. If it\'s two or more, you\'ll be able to split tasks across teams for faster cleaning.\n\nEditing Mode: You can modify existing task assignments, add new tasks, or adjust pricing.')}
//             </Text>
            
//             <TouchableOpacity
//               style={styles.modalCloseButton}
//               onPress={() => setShowTooltip(false)}
//             >
//               <Text style={styles.modalCloseText}>{tSafe('got_it', 'Got it')}</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// /* ---------------- STYLES ---------------- */
// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, backgroundColor: '#fff',
//     marginBottom:50 
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
    
//   },
//   backButton: { 
//     flexDirection: 'row', 
//     alignItems: 'center' 
//   },
//   backText: { 
//     marginLeft: 4 
//   },
//   headerTitle: { 
//     flex: 1, 
//     textAlign: 'center', 
//     fontWeight: 'bold' 
//   },
//   content: { 
//     padding: 20 
//   },
//   centered: { 
//     flex: 1, 
//     justifyContent: 'center', 
//     alignItems: 'center' 
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
//   Modal,
// } from 'react-native';
// import { Text, Button } from 'react-native-paper';
// import { useNavigation } from '@react-navigation/native';
// import { AuthContext } from '../../context/AuthContext';
// import COLORS from '../../constants/colors';
// import RoomAssignmentPicker from './CreateBookingContents/RoomAssignmentPicker';
// import userService from '../../services/connection/userService';
// import Toast from 'react-native-toast-message';
// import FloatingLabelPickerSelect from '../../components/shared/FloatingLabelPicker';
// import { useBookingContext } from '../../context/BookingContext';
// import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
// import ROUTES from '../../constants/routes';
// import { tSafe } from '../../utils/tSafe';

// export default function CreateChecklist({ route }) {
//   const { currentUserId, currency, userToken } = useContext(AuthContext);
//   const {
//     source,                     // ← 'PropertyDetails' or 'Checklist'
//     propertyId,
//     apartmentName,
//     onChecklistCreated,         // callback from parent to refresh
//   } = route.params || {};

//   const { setFormData } = useBookingContext();
//   const navigation = useNavigation();

//   const [expectedCleaners] = useState(2);
//   const [taskGroups, setTaskGroups] = useState([]);
//   const [selectedApartment, setSelectedApartment] = useState(null);
//   const [groupSummary, setGroupSummary] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);

//   const [showTooltip, setShowTooltip] = useState(false);
//   const [totalFee, setTotalFee] = useState(0);
//   const [totalTime, setTotalTime] = useState(0);
//   const [checklistName, setChecklistName] = useState(
//     `Cleaning Checklist - ${apartmentName || tSafe('property', 'Property')}`
//   );

//   const [selectedPropertyId, setSelectedPropertyId] = useState(propertyId || '');
//   const [selectedPropertyName, setSelectedPropertyName] = useState('');
//   const [properties, setProperties] = useState([]);

//   /* ---------------- FETCH PROPERTIES ---------------- */
//   useEffect(() => {
//     fetchProperties();
//   }, []);

//   const fetchProperties = async () => {
//     try {
//       const res = await userService.getApartment(currentUserId);
//       setProperties(res.data || []);

//       if (propertyId) {
//         const found = res.data.find(p => p._id === propertyId);
//         if (found) {
//           setSelectedPropertyId(found._id);
//           setSelectedPropertyName(found.apt_name);
//         }
//       } else if (res.data.length > 0) {
//         setSelectedPropertyId(res.data[0]._id);
//         setSelectedPropertyName(res.data[0].apt_name);
//       }
//     } catch (err) {
//       console.error(err);
//       Toast.show({
//         type: 'error',
//         text1: tSafe('failed_load_properties', 'Failed to load properties'),
//       });
//     }
//   };

//   /* ---------------- FETCH APARTMENT DETAILS ---------------- */
//   useEffect(() => {
//     if (!selectedPropertyId) return;

//     const fetchApartmentDetails = async () => {
//       setIsLoading(true);
//       try {
//         const res = await userService.getApartmentById(selectedPropertyId);
//         setSelectedApartment(res.data);

//         const groups = Array.from({ length: expectedCleaners }, (_, i) => ({
//           groupId: `group_${i + 1}`,
//           rooms: [],
//           pricing: null,
//         }));
//         setTaskGroups(groups);
//       } catch (err) {
//         Toast.show({
//           type: 'error',
//           text1: tSafe('failed_load_property', 'Failed to load property'),
//         });
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchApartmentDetails();
//   }, [selectedPropertyId]);

//   /* ---------------- UPDATE FORM DATA ---------------- */
//   useEffect(() => {
//     if (!selectedApartment?._id) return;
//     setFormData(prev => ({
//       ...prev,
//       aptId: selectedApartment._id,
//     }));
//   }, [selectedApartment]);

//   /* ---------------- SAVE CHECKLIST ---------------- */
//   const handleSaveChecklist = async () => {
//     if (!selectedPropertyId || !groupSummary || !checklistName.trim()) {
//       Toast.show({
//         type: 'error',
//         text1: tSafe('missing_data', 'Missing required data'),
//       });
//       return;
//     }

//     const payload = {
//       propertyId: selectedPropertyId,
//       hostId: currentUserId,
//       checklistName: checklistName.trim(),
//       apt_name: selectedPropertyName,
//       checklist: groupSummary,
//       totalFee,
//       totalTime,
//       isDefault: true,
//     };

//     setIsSaving(true);
//     try {
//       const res = await userService.saveChecklist(payload, {
//         headers: { Authorization: `Bearer ${userToken}` },
//       });

//       if (res.status === 200) {
//         // ─── SUCCESS TOAST ──────────────────────────────────────────
//         Toast.show({
//           type: 'success',
//           text1: tSafe('checklist_created_success', 'Checklist successfully created'),
//         });

//         // ─── CALL PARENT CALLBACK (if provided) ──────────────────
//         if (onChecklistCreated) {
//           onChecklistCreated();
//         }

//         // ─── NAVIGATE BACK BASED ON SOURCE ──────────────────────
//         if (source === 'PropertyDetails') {
//           // Go back to property details with a refresh flag
//           navigation.navigate(ROUTES.host_property_details, {
//             propertyId: selectedPropertyId,
//             refresh: true,
//           });
//         } else if (source === 'Checklist') {
//           // Go back to the checklist list with a refresh flag
//           navigation.navigate(ROUTES.host_checklist, {
//             refresh: true,
//           });
//         } else {
//           // Fallback: just go back
//           navigation.goBack();
//         }
//       }
//     } catch (err) {
//       Toast.show({
//         type: 'error',
//         text1: tSafe('failed_save_checklist', 'Failed to save checklist'),
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text>{tSafe('loading_property_details', 'Loading property details...')}</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//           <MaterialCommunityIcons name="arrow-left" size={24} />
//           <Text style={styles.backText}>{tSafe('back', 'Back')}</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>{tSafe('create_checklist_title', 'Create Checklist')}</Text>
//         <View style={{ width: 60 }} />
//       </View>

//       <ScrollView style={styles.content}>
//         {!propertyId && (
//           <FloatingLabelPickerSelect
//             label={tSafe('choose_property', 'Choose a property')}
//             items={properties.map(p => ({
//               label: p.apt_name,
//               value: p._id,
//             }))}
//             value={selectedPropertyId}
//             onValueChange={(value) => {
//               setSelectedPropertyId(value);
//               const prop = properties.find(p => p._id === value);
//               setSelectedPropertyName(prop?.apt_name || '');
//             }}
//           />
//         )}

//         {selectedApartment && (
//           <RoomAssignmentPicker
//             key={selectedPropertyId}
//             selectedApartment={selectedApartment}
//             taskGroups={taskGroups}
//             onGroupSummaryChange={setGroupSummary}
//             onTotalFeeChange={setTotalFee}
//             onTotalTimeChange={setTotalTime}
//             checklistName={checklistName}
//             setChecklistName={setChecklistName}
//             onInfoPress={() => setShowTooltip(true)}
//           />
//         )}

//         <Button
//           mode="contained"
//           onPress={handleSaveChecklist}
//           loading={isSaving}
//           disabled={!groupSummary}
//           style={{ marginTop: 24, marginBottom: 20, backgroundColor: COLORS.dark }}
//         >
//           {tSafe('save_checklist', 'Save Checklist')} ({currency}{totalFee.toFixed(2)})
//         </Button>
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
//               <Text style={styles.modalTitle}>{tSafe('checklist_information', 'Checklist Information')}</Text>
//             </View>
            
//             <Text style={styles.modalText}>
//               {tSafe('checklist_tooltip_text', 'This helps us understand how many cleaners will work on the apartment.\n\nIf it\'s just one cleaner, we\'ll assign all tasks to one team. If it\'s two or more, you\'ll be able to split tasks across teams for faster cleaning.\n\nEditing Mode: You can modify existing task assignments, add new tasks, or adjust pricing.')}
//             </Text>
            
//             <TouchableOpacity
//               style={styles.modalCloseButton}
//               onPress={() => setShowTooltip(false)}
//             >
//               <Text style={styles.modalCloseText}>{tSafe('got_it', 'Got it')}</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// /* ---------------- STYLES ---------------- */
// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, backgroundColor: '#fff',
//     marginBottom:50 
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   backButton: { 
//     flexDirection: 'row', 
//     alignItems: 'center' 
//   },
//   backText: { 
//     marginLeft: 4 
//   },
//   headerTitle: { 
//     flex: 1, 
//     textAlign: 'center', 
//     fontWeight: 'bold' 
//   },
//   content: { 
//     padding: 20 
//   },
//   centered: { 
//     flex: 1, 
//     justifyContent: 'center', 
//     alignItems: 'center' 
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
//   Modal,
//   Alert,
// } from 'react-native';
// import { Text, Button } from 'react-native-paper';
// import { useNavigation } from '@react-navigation/native';
// import { AuthContext } from '../../context/AuthContext';
// import COLORS from '../../constants/colors';
// import RoomAssignmentPicker from './CreateBookingContents/RoomAssignmentPicker';
// import userService from '../../services/connection/userService';
// import FloatingLabelPickerSelect from '../../components/shared/FloatingLabelPicker';
// import { useBookingContext } from '../../context/BookingContext';
// import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
// import ROUTES from '../../constants/routes';
// import { tSafe } from '../../utils/tSafe';

// export default function CreateChecklist({ route }) {
//   const { currentUserId, currency, userToken } = useContext(AuthContext);
//   const {
//     source,                     // 'PropertyDetails' or 'Checklist'
//     propertyId,
//     apartmentName,
//     onChecklistCreated,
//   } = route.params || {};

//   const { setFormData } = useBookingContext();
//   const navigation = useNavigation();

//   const [expectedCleaners] = useState(2);
//   const [taskGroups, setTaskGroups] = useState([]);
//   const [selectedApartment, setSelectedApartment] = useState(null);
//   const [groupSummary, setGroupSummary] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);

//   const [showTooltip, setShowTooltip] = useState(false);
//   const [totalFee, setTotalFee] = useState(0);
//   const [totalTime, setTotalTime] = useState(0);
//   const [checklistName, setChecklistName] = useState(
//     `Cleaning Checklist - ${apartmentName || tSafe('property', 'Property')}`
//   );

//   const [selectedPropertyId, setSelectedPropertyId] = useState(propertyId || '');
//   const [selectedPropertyName, setSelectedPropertyName] = useState('');
//   const [properties, setProperties] = useState([]);

//   /* ---------------- FETCH PROPERTIES ---------------- */
//   useEffect(() => {
//     fetchProperties();
//   }, []);

//   const fetchProperties = async () => {
//     try {
//       const res = await userService.getApartment(currentUserId);
//       setProperties(res.data || []);

//       if (propertyId) {
//         const found = res.data.find(p => p._id === propertyId);
//         if (found) {
//           setSelectedPropertyId(found._id);
//           setSelectedPropertyName(found.apt_name);
//         }
//       } else if (res.data.length > 0) {
//         setSelectedPropertyId(res.data[0]._id);
//         setSelectedPropertyName(res.data[0].apt_name);
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe('failed_load_properties', 'Failed to load properties')
//       );
//     }
//   };

//   /* ---------------- FETCH APARTMENT DETAILS ---------------- */
//   useEffect(() => {
//     if (!selectedPropertyId) return;

//     const fetchApartmentDetails = async () => {
//       setIsLoading(true);
//       try {
//         const res = await userService.getApartmentById(selectedPropertyId);
//         setSelectedApartment(res.data);

//         const groups = Array.from({ length: expectedCleaners }, (_, i) => ({
//           groupId: `group_${i + 1}`,
//           rooms: [],
//           pricing: null,
//         }));
//         setTaskGroups(groups);
//       } catch (err) {
//         Alert.alert(
//           tSafe('error_title', 'Error'),
//           tSafe('failed_load_property', 'Failed to load property')
//         );
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchApartmentDetails();
//   }, [selectedPropertyId]);

//   /* ---------------- UPDATE FORM DATA ---------------- */
//   useEffect(() => {
//     if (!selectedApartment?._id) return;
//     setFormData(prev => ({
//       ...prev,
//       aptId: selectedApartment._id,
//     }));
//   }, [selectedApartment]);

//   /* ---------------- SAVE CHECKLIST ---------------- */
//   const handleSaveChecklist = async () => {
//     if (!selectedPropertyId || !groupSummary || !checklistName.trim()) {
//       Alert.alert(
//         tSafe('missing_data', 'Missing Data'),
//         tSafe('please_fill_required_fields', 'Please fill in all required fields.')
//       );
//       return;
//     }

//     const payload = {
//       propertyId: selectedPropertyId,
//       hostId: currentUserId,
//       checklistName: checklistName.trim(),
//       apt_name: selectedPropertyName,
//       checklist: groupSummary,
//       totalFee,
//       totalTime,
//       isDefault: true,
//     };

//     setIsSaving(true);
//     try {
//       const res = await userService.saveChecklist(payload, {
//         headers: { Authorization: `Bearer ${userToken}` },
//       });

//       if (res.status === 200) {
//         // ─── SUCCESS ALERT ──────────────────────────────────────────
//         Alert.alert(
//           tSafe('success_title', 'Success'),
//           tSafe('checklist_created_success', 'Checklist successfully created.'),
//           [
//             {
//               text: tSafe('ok', 'OK'),
//               onPress: () => {
//                 // ─── CALL PARENT CALLBACK ──────────────────────────
//                 if (onChecklistCreated) {
//                   onChecklistCreated();
//                 }

//                 // ─── NAVIGATE BASED ON SOURCE ──────────────────────
//                 if (source === 'PropertyDetails') {
//                   navigation.navigate(ROUTES.host_apt_dashboard, {
//                     propertyId: selectedPropertyId,
//                     refresh: true,
//                   });
//                 } else if (source === 'Checklist') {
//                   navigation.navigate(ROUTES.host_checklist, {
//                     refresh: true,
//                   });
//                 } else {
//                   navigation.goBack();
//                 }
//               },
//             },
//           ],
//           { cancelable: false }
//         );
//       }
//     } catch (err) {
//       console.error('Save error:', err);
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         err.response?.data?.message || tSafe('failed_save_checklist', 'Failed to save checklist. Please try again.')
//       );
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text>{tSafe('loading_property_details', 'Loading property details...')}</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//           <MaterialCommunityIcons name="arrow-left" size={24} />
//           <Text style={styles.backText}>{tSafe('back', 'Back')}</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>{tSafe('create_checklist_title', 'Create Checklist')}</Text>
//         <View style={{ width: 60 }} />
//       </View>

//       <ScrollView style={styles.content}>
//         {!propertyId && (
//           <FloatingLabelPickerSelect
//             label={tSafe('choose_property', 'Choose a property')}
//             items={properties.map(p => ({
//               label: p.apt_name,
//               value: p._id,
//             }))}
//             value={selectedPropertyId}
//             onValueChange={(value) => {
//               setSelectedPropertyId(value);
//               const prop = properties.find(p => p._id === value);
//               setSelectedPropertyName(prop?.apt_name || '');
//             }}
//           />
//         )}

//         {selectedApartment && (
//           <RoomAssignmentPicker
//             key={selectedPropertyId}
//             selectedApartment={selectedApartment}
//             taskGroups={taskGroups}
//             onGroupSummaryChange={setGroupSummary}
//             onTotalFeeChange={setTotalFee}
//             onTotalTimeChange={setTotalTime}
//             checklistName={checklistName}
//             setChecklistName={setChecklistName}
//             onInfoPress={() => setShowTooltip(true)}
//           />
//         )}

//         <Button
//           mode="contained"
//           onPress={handleSaveChecklist}
//           loading={isSaving}
//           disabled={!groupSummary}
//           style={{ marginTop: 24, marginBottom: 20, backgroundColor: COLORS.dark }}
//         >
//           {tSafe('save_checklist', 'Save Checklist')} ({currency}{totalFee.toFixed(2)})
//         </Button>
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
//               <Text style={styles.modalTitle}>{tSafe('checklist_information', 'Checklist Information')}</Text>
//             </View>
            
//             <Text style={styles.modalText}>
//               {tSafe('checklist_tooltip_text', 'This helps us understand how many cleaners will work on the apartment.\n\nIf it\'s just one cleaner, we\'ll assign all tasks to one team. If it\'s two or more, you\'ll be able to split tasks across teams for faster cleaning.\n\nEditing Mode: You can modify existing task assignments, add new tasks, or adjust pricing.')}
//             </Text>
            
//             <TouchableOpacity
//               style={styles.modalCloseButton}
//               onPress={() => setShowTooltip(false)}
//             >
//               <Text style={styles.modalCloseText}>{tSafe('got_it', 'Got it')}</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// /* ---------------- STYLES ---------------- */
// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, backgroundColor: '#fff',
//     marginBottom:50 
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   backButton: { 
//     flexDirection: 'row', 
//     alignItems: 'center' 
//   },
//   backText: { 
//     marginLeft: 4 
//   },
//   headerTitle: { 
//     flex: 1, 
//     textAlign: 'center', 
//     fontWeight: 'bold' 
//   },
//   content: { 
//     padding: 20 
//   },
//   centered: { 
//     flex: 1, 
//     justifyContent: 'center', 
//     alignItems: 'center' 
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


import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
} from 'react';

import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Alert,
  SafeAreaView,
} from 'react-native';

import { Text, Button } from 'react-native-paper';

import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';

import { AuthContext } from '../../context/AuthContext';
import RoomAssignmentPicker from './CreateBookingContents/RoomAssignmentPicker';
import userService from '../../services/connection/userService';
import FloatingLabelPickerSelect from '../../components/shared/FloatingLabelPicker';
import { useBookingContext } from '../../context/BookingContext';
import ROUTES from '../../constants/routes';
import { tSafe } from '../../utils/tSafe';

// Existing shared Freshsweeper theme
import { useTheme } from '../../theme';

export default function CreateChecklist({ route }) {
  const { currentUserId, currency, userToken } = useContext(AuthContext);

  const {
    source,
    propertyId,
    apartmentName,
    onChecklistCreated,
  } = route.params || {};

  const { setFormData } = useBookingContext();
  const navigation = useNavigation();

  const { theme, isDark } = useTheme();

  const styles = useMemo(
    () => createStyles(theme, isDark),
    [theme, isDark]
  );

  // ---------------------------------------------------------
  // State
  // ---------------------------------------------------------

  const [expectedCleaners] = useState(2);
  const [taskGroups, setTaskGroups] = useState([]);

  const [selectedApartment, setSelectedApartment] = useState(null);
  const [groupSummary, setGroupSummary] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [showTooltip, setShowTooltip] = useState(false);

  const [totalFee, setTotalFee] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  const [checklistName, setChecklistName] = useState(
    `Cleaning Checklist - ${
      apartmentName || tSafe('property', 'Property')
    }`
  );

  const [selectedPropertyId, setSelectedPropertyId] = useState(
    propertyId || ''
  );

  const [selectedPropertyName, setSelectedPropertyName] = useState(
    apartmentName || ''
  );

  const [properties, setProperties] = useState([]);

  // ---------------------------------------------------------
  // Fetch properties
  // ---------------------------------------------------------

  useEffect(() => {
    let isMounted = true;

    const fetchProperties = async () => {
      try {
        const response = await userService.getApartment(currentUserId);

        if (!isMounted) return;

        const apartmentList = response.data || [];

        setProperties(apartmentList);

        if (propertyId) {
          const selectedProperty = apartmentList.find(
            (property) => property._id === propertyId
          );

          if (selectedProperty) {
            setSelectedPropertyId(selectedProperty._id);
            setSelectedPropertyName(selectedProperty.apt_name);
          }
        } else if (apartmentList.length > 0) {
          setSelectedPropertyId(apartmentList[0]._id);
          setSelectedPropertyName(apartmentList[0].apt_name);
        }
      } catch (error) {
        console.error('Failed to load properties:', error);

        if (isMounted) {
          Alert.alert(
            tSafe('error_title', 'Error'),
            tSafe(
              'failed_load_properties',
              'Failed to load properties'
            )
          );
        }
      }
    };

    fetchProperties();

    return () => {
      isMounted = false;
    };
  }, [currentUserId, propertyId]);

  // ---------------------------------------------------------
  // Fetch selected apartment details
  // ---------------------------------------------------------

  useEffect(() => {
    if (!selectedPropertyId) {
      setSelectedApartment(null);
      setTaskGroups([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchApartmentDetails = async () => {
      setIsLoading(true);

      try {
        const response = await userService.getApartmentById(
          selectedPropertyId
        );

        if (!isMounted) return;

        setSelectedApartment(response.data);

        const groups = Array.from(
          { length: expectedCleaners },
          (_, index) => ({
            groupId: `group_${index + 1}`,
            rooms: [],
            pricing: null,
          })
        );

        setTaskGroups(groups);
      } catch (error) {
        console.error('Failed to load apartment details:', error);

        if (isMounted) {
          Alert.alert(
            tSafe('error_title', 'Error'),
            tSafe(
              'failed_load_property',
              'Failed to load property'
            )
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchApartmentDetails();

    return () => {
      isMounted = false;
    };
  }, [selectedPropertyId, expectedCleaners]);

  // ---------------------------------------------------------
  // Update booking context
  // ---------------------------------------------------------

  useEffect(() => {
    if (!selectedApartment?._id) return;

    setFormData((previous) => ({
      ...previous,
      aptId: selectedApartment._id,
    }));
  }, [selectedApartment, setFormData]);

  // ---------------------------------------------------------
  // Handle property selection
  // ---------------------------------------------------------

  const handlePropertyChange = (value) => {
    setSelectedPropertyId(value);

    const selectedProperty = properties.find(
      (property) => property._id === value
    );

    setSelectedPropertyName(selectedProperty?.apt_name || '');

    setGroupSummary(null);
    setTotalFee(0);
    setTotalTime(0);
  };

  // ---------------------------------------------------------
  // Save checklist
  // ---------------------------------------------------------

  const handleSaveChecklist = async () => {
    if (
      !selectedPropertyId ||
      !groupSummary ||
      !checklistName.trim()
    ) {
      Alert.alert(
        tSafe('missing_data', 'Missing Data'),
        tSafe(
          'please_fill_required_fields',
          'Please fill in all required fields.'
        )
      );

      return;
    }

    const payload = {
      propertyId: selectedPropertyId,
      hostId: currentUserId,
      checklistName: checklistName.trim(),
      apt_name: selectedPropertyName,
      checklist: groupSummary,
      totalFee,
      totalTime,
      isDefault: true,
    };

    setIsSaving(true);

    try {
      const response = await userService.saveChecklist(payload, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert(
          tSafe('success_title', 'Success'),
          tSafe(
            'checklist_created_success',
            'Checklist successfully created.'
          ),
          [
            {
              text: tSafe('ok', 'OK'),
              onPress: () => {
                if (onChecklistCreated) {
                  onChecklistCreated();
                }

                if (source === 'PropertyDetails') {
                  navigation.navigate(
                    ROUTES.host_apt_dashboard,
                    {
                      propertyId: selectedPropertyId,
                      refresh: true,
                    }
                  );
                } else if (source === 'Checklist') {
                  navigation.navigate(
                    ROUTES.host_checklist,
                    {
                      refresh: true,
                    }
                  );
                } else {
                  navigation.goBack();
                }
              },
            },
          ],
          {
            cancelable: false,
          }
        );
      }
    } catch (error) {
      console.error('Save checklist error:', error);

      Alert.alert(
        tSafe('error_title', 'Error'),
        error.response?.data?.message ||
          tSafe(
            'failed_save_checklist',
            'Failed to save checklist. Please try again.'
          )
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ---------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <View style={styles.loadingCard}>
          <ActivityIndicator
            size="large"
            color={theme.brand.primary}
          />

          <Text style={styles.loadingTitle}>
            {tSafe(
              'loading_property_details',
              'Loading property details...'
            )}
          </Text>

          <Text style={styles.loadingSubtitle}>
            Preparing your cleaning checklist
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ---------------------------------------------------------
  // Main screen
  // ---------------------------------------------------------

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={tSafe('back', 'Back')}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={23}
            color={theme.icon.default}
          />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            {tSafe('create_checklist_title', 'Create Checklist')}
          </Text>

          <Text style={styles.headerSubtitle}>
            Customize your cleaning tasks and pricing
          </Text>
        </View>

        <View style={styles.headerIconContainer}>
          <MaterialCommunityIcons
            name="clipboard-list-outline"
            size={23}
            color={theme.brand.primary}
          />
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Introduction */}

        <View style={styles.introCard}>
          <View style={styles.introIconContainer}>
            <MaterialCommunityIcons
              name="clipboard-check-outline"
              size={27}
              color={theme.brand.primary}
            />
          </View>

          <View style={styles.introTextContainer}>
            <Text style={styles.introTitle}>
              Build your cleaning checklist
            </Text>

            <Text style={styles.introDescription}>
              Assign rooms, organize tasks, and calculate the
              cleaning cost for your property.
            </Text>
          </View>
        </View>

        {/* Property selection */}

        {!propertyId && (
          <View style={styles.propertySection}>
            <View style={styles.sectionHeading}>
              <View style={styles.sectionIconContainer}>
                <MaterialCommunityIcons
                  name="home-outline"
                  size={21}
                  color={theme.brand.primary}
                />
              </View>

              <View style={styles.sectionHeadingText}>
                <Text style={styles.sectionTitle}>
                  {tSafe('choose_property', 'Choose a property')}
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Select the property this checklist belongs to.
                </Text>
              </View>
            </View>

            <View style={styles.pickerContainer}>
              <FloatingLabelPickerSelect
                label={tSafe(
                  'choose_property',
                  'Choose a property'
                )}
                items={properties.map((property) => ({
                  label: property.apt_name,
                  value: property._id,
                }))}
                value={selectedPropertyId}
                onValueChange={handlePropertyChange}
              />
            </View>
          </View>
        )}

        {/* Room and task assignment */}

        {selectedApartment && (
          <View style={styles.assignmentSection}>
            <View style={styles.sectionHeading}>
              <View style={styles.sectionIconContainer}>
                <MaterialCommunityIcons
                  name="home-edit-outline"
                  size={21}
                  color={theme.brand.primary}
                />
              </View>

              <View style={styles.sectionHeadingText}>
                <Text style={styles.sectionTitle}>
                  Room & Task Assignment
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Configure your cleaning groups, tasks, and pricing.
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setShowTooltip(true)}
                style={styles.infoButton}
                accessibilityRole="button"
                accessibilityLabel="Checklist information"
              >
                <AntDesign
                  name="infocirlceo"
                  size={21}
                  color={theme.brand.primary}
                />
              </TouchableOpacity>
            </View>

            <RoomAssignmentPicker
              key={selectedPropertyId}
              selectedApartment={selectedApartment}
              taskGroups={taskGroups}
              onGroupSummaryChange={setGroupSummary}
              onTotalFeeChange={setTotalFee}
              onTotalTimeChange={setTotalTime}
              checklistName={checklistName}
              setChecklistName={setChecklistName}
              onInfoPress={() => setShowTooltip(true)}
            />
          </View>
        )}

        {/* Checklist summary */}

        {selectedApartment && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryIconContainer}>
                <MaterialCommunityIcons
                  name="calculator-variant-outline"
                  size={22}
                  color={theme.brand.primary}
                />
              </View>

              <View style={styles.summaryHeadingText}>
                <Text style={styles.summaryTitle}>
                  Checklist Summary
                </Text>

                <Text style={styles.summarySubtitle}>
                  Review the estimated cleaning cost and duration.
                </Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <View style={styles.summaryMetric}>
                <MaterialCommunityIcons
                  name="cash-multiple"
                  size={20}
                  color={theme.brand.primary}
                />

                <Text style={styles.summaryMetricLabel}>
                  Estimated fee
                </Text>
              </View>

              <Text style={styles.summaryFee}>
                {currency}
                {Number(totalFee || 0).toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryMetric}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={20}
                  color={theme.brand.primary}
                />

                <Text style={styles.summaryMetricLabel}>
                  Estimated duration
                </Text>
              </View>

              <Text style={styles.summaryValue}>
                {totalTime} min
              </Text>
            </View>
          </View>
        )}

        {/* Save button */}

        <Button
          mode="contained"
          onPress={handleSaveChecklist}
          loading={isSaving}
          disabled={
            isSaving ||
            !selectedPropertyId ||
            !selectedApartment ||
            !groupSummary ||
            !checklistName.trim()
          }
          icon="content-save-check-outline"
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
          labelStyle={styles.saveButtonLabel}
          buttonColor={theme.button.primaryBackground}
          textColor={theme.button.primaryText}
        >
          {tSafe('save_checklist', 'Save Checklist')} (
          {currency}
          {Number(totalFee || 0).toFixed(2)})
        </Button>

        <View style={styles.bottomNote}>
          <MaterialCommunityIcons
            name="shield-check-outline"
            size={17}
            color={theme.status.success}
          />

          <Text style={styles.bottomNoteText}>
            Your checklist settings will be saved to this property.
          </Text>
        </View>
      </ScrollView>

      {/* --------------------------------------------------- */}
      {/* Checklist information modal                        */}
      {/* --------------------------------------------------- */}

      <Modal
        visible={showTooltip}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowTooltip(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <AntDesign
                  name="infocirlce"
                  size={25}
                  color={theme.brand.primary}
                />
              </View>

              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>
                  {tSafe(
                    'checklist_information',
                    'Checklist Information'
                  )}
                </Text>

                <Text style={styles.modalSubtitle}>
                  Understand how task assignments work.
                </Text>
              </View>
            </View>

            <Text style={styles.modalText}>
              {tSafe(
                'checklist_tooltip_text',
                "This helps us understand how many cleaners will work on the apartment.\n\nIf it's just one cleaner, we'll assign all tasks to one team. If it's two or more, you'll be able to split tasks across teams for faster cleaning.\n\nEditing Mode: You can modify existing task assignments, add new tasks, or adjust pricing."
              )}
            </Text>

            <Button
              mode="contained"
              onPress={() => setShowTooltip(false)}
              style={styles.modalCloseButton}
              contentStyle={styles.modalCloseButtonContent}
              labelStyle={styles.modalCloseLabel}
              buttonColor={theme.button.primaryBackground}
              textColor={theme.button.primaryText}
            >
              {tSafe('got_it', 'Got it')}
            </Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// =============================================================
// THEME-AWARE STYLES
// Uses the shared Freshsweeper LIGHT_THEME / DARK_THEME.
// =============================================================

const createStyles = (theme, isDark) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    container: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    contentContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 40,
    },

    // Header

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 13,
      backgroundColor: theme.surface.default,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.default,
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background.elevated,
    },

    headerTitleContainer: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 8,
    },

    headerTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: theme.text.primary,
      textAlign: 'center',
    },

    headerSubtitle: {
      fontSize: 11,
      color: theme.text.secondary,
      marginTop: 3,
      textAlign: 'center',
    },

    headerIconContainer: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: theme.brand.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Loading screen

    loadingScreen: {
      flex: 1,
      backgroundColor: theme.background.default,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },

    loadingCard: {
      width: '100%',
      maxWidth: 320,
      backgroundColor: theme.surface.default,
      borderWidth: 1,
      borderColor: theme.card.border,
      borderRadius: 22,
      padding: 28,
      alignItems: 'center',
    },

    loadingTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text.primary,
      marginTop: 18,
      textAlign: 'center',
    },

    loadingSubtitle: {
      fontSize: 12,
      color: theme.text.secondary,
      marginTop: 6,
      textAlign: 'center',
    },

    // Introduction

    introCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.surface.selected,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.brand.primaryLight,
      padding: 17,
      marginBottom: 20,
    },

    introIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor: theme.surface.default,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 13,
    },

    introTextContainer: {
      flex: 1,
      paddingTop: 2,
    },

    introTitle: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '800',
      color: theme.text.primary,
    },

    introDescription: {
      fontSize: 13,
      lineHeight: 19,
      color: theme.text.secondary,
      marginTop: 5,
    },

    // Sections

    propertySection: {
      backgroundColor: theme.card.background,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.card.border,
      padding: 17,
      marginBottom: 18,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 8,
      elevation: isDark ? 1 : 2,
    },

    assignmentSection: {
      backgroundColor: theme.card.background,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.card.border,
      padding: 16,
      marginBottom: 18,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 8,
      elevation: isDark ? 1 : 2,
    },

    sectionHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 17,
    },

    sectionIconContainer: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: theme.brand.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },

    sectionHeadingText: {
      flex: 1,
    },

    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.text.primary,
      lineHeight: 22,
    },

    sectionSubtitle: {
      fontSize: 12,
      lineHeight: 18,
      color: theme.text.secondary,
      marginTop: 4,
    },

    pickerContainer: {
      backgroundColor: theme.input.background,
      borderRadius: 12,
    },

    infoButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: theme.brand.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },

    // Checklist summary

    summaryCard: {
      backgroundColor: theme.card.background,
      borderWidth: 1,
      borderColor: theme.card.border,
      borderRadius: 20,
      padding: 18,
      marginBottom: 18,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 8,
      elevation: isDark ? 1 : 2,
    },

    summaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    summaryIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: theme.brand.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },

    summaryHeadingText: {
      flex: 1,
    },

    summaryTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.text.primary,
    },

    summarySubtitle: {
      fontSize: 12,
      lineHeight: 18,
      color: theme.text.secondary,
      marginTop: 4,
    },

    summaryDivider: {
      height: 1,
      backgroundColor: theme.divider,
      marginVertical: 16,
    },

    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 15,
    },

    summaryMetric: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    summaryMetricLabel: {
      fontSize: 13,
      color: theme.text.secondary,
      marginLeft: 9,
    },

    summaryFee: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.brand.primary,
    },

    summaryValue: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text.primary,
    },

    // Save button

    saveButton: {
      borderRadius: 14,
      marginTop: 4,
      marginBottom: 16,
      elevation: 0,
    },

    saveButtonContent: {
      minHeight: 52,
      paddingVertical: 5,
    },

    saveButtonLabel: {
      fontSize: 14,
      fontWeight: '800',
    },

    bottomNote: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 10,
      marginBottom: 10,
    },

    bottomNoteText: {
      fontSize: 11,
      lineHeight: 17,
      color: theme.text.secondary,
      marginLeft: 7,
      flexShrink: 1,
      textAlign: 'center',
    },

    // Tooltip modal

    modalOverlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },

    modalContainer: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: theme.surface.default,
      borderRadius: 24,
      padding: 22,
      borderWidth: 1,
      borderColor: theme.border.default,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 14,
      elevation: 8,
    },

    modalHandle: {
      width: 42,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.border.strong,
      alignSelf: 'center',
      marginBottom: 20,
    },

    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 18,
    },

    modalIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor: theme.brand.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 13,
    },

    modalTitleContainer: {
      flex: 1,
    },

    modalTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: theme.text.primary,
    },

    modalSubtitle: {
      fontSize: 12,
      lineHeight: 17,
      color: theme.text.secondary,
      marginTop: 4,
    },

    modalText: {
      fontSize: 14,
      lineHeight: 23,
      color: theme.text.secondary,
      marginBottom: 22,
    },

    modalCloseButton: {
      borderRadius: 13,
    },

    modalCloseButtonContent: {
      minHeight: 48,
    },

    modalCloseLabel: {
      fontSize: 14,
      fontWeight: '800',
    },
  });