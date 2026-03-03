// import React, { useState, useEffect, useContext } from 'react';
// import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
// import { Text, Button } from 'react-native-paper';
// import { useNavigation } from '@react-navigation/native';
// import { AuthContext } from '../../context/AuthContext';
// import COLORS from '../../constants/colors';
// import RoomAssignmentPicker from './CreateBookingContents/RoomAssignmentPicker';
// import userService from '../../services/connection/userService';
// import Toast from 'react-native-toast-message';
// import FloatingLabelPickerSelect from '../../components/shared/FloatingLabelPicker';
// import ROUTES from '../../constants/routes';
// import { useBookingContext } from '../../context/BookingContext';

// export default function CreateChecklist({ route }) {
//   const { currentUserId, currency, userToken } = useContext(AuthContext);
//   const { source } = route.params || {};

//   const {
//     setSelectedChecklistId,
//     selectedChecklistId,
//     setFormData,
//     setScheduleStep,
//     setResumeAfterChecklist,
//     setModalVisible,
//   } = useBookingContext();

//   const { propertyId: routePropertyId } = route.params || {};
//   const navigation = useNavigation();
  
//   const [expectedCleaners, setExpectedCleaners] = useState(2);
//   const [taskGroups, setTaskGroups] = useState([]);
//   const [selectedApartment, setSelectedApartment] = useState(null);
//   const [groupSummary, setGroupSummary] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);

//   const [showTooltip, setShowTooltip] = useState(false);
//   const [totalFee, setTotalFee] = useState(0);
//   const [totalTime, setTotalTime] = useState(0);
//   const [checklistName, setChecklistName] = useState('');
//   const [selectedPropertyId, setSelectedPropertyId] = useState(routePropertyId || '');
//   const [properties, setProperties] = useState([]);

//   useEffect(() => {
//     alert(routePropertyId)
//     if (!routePropertyId) {
//       fetchProperties();
//     }
//   }, []);

//   useEffect(() => {
//     const fetchApartment = async () => {
//       if (!selectedPropertyId) return;

//       setIsLoading(true);
//       try {
//         const res = await userService.getApartmentById(selectedPropertyId);
//         setSelectedApartment(res.data);

//         const generatedGroups = Array.from({ length: expectedCleaners }, (_, i) => ({
//           groupId: `group_${i + 1}`,
//           rooms: [],
//           pricing: null,
//         }));
//         setTaskGroups(generatedGroups);

//       } catch (err) {
//         console.error('Error fetching apartment:', err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchApartment();
//   }, [selectedPropertyId]);

//   useEffect(() => {
//     if (!selectedApartment?._id) return;

//     setFormData(prev => ({
//       ...prev,
//       aptId: selectedApartment._id,
//     }));
//   }, [selectedApartment]);

//   const fetchProperties = async () => {
//     try {
//       const response = await userService.getApartment(currentUserId);
//       setProperties(response.data);

//       if (!routePropertyId && response.data.length > 0) {
//         setSelectedPropertyId(response.data[0]._id);
//       }
//     } catch (e) {
//       console.error("Failed to fetch properties", e);
//     }
//   };

//   const handleSuccess = (checklistId) => {
//     if (source === 'schedule') {
//       setSelectedChecklistId(checklistId);
//       setScheduleStep('cleaningTask');
//       setResumeAfterChecklist(true);

//       navigation.navigate(ROUTES.host_bookings, {
//         reopenModal: true,
//       });
//     } else {
//       navigation.goBack();
//     }
//   };

//   const handleSaveChecklist = async () => {
//     if (!selectedPropertyId) {
//       alert("Please select a property");
//       return;
//     }
//     if (!groupSummary) return;

//     if (!checklistName.trim()) {
//       Toast.show({
//         type: 'error',
//         text1: 'Checklist Name Required',
//         text2: 'Please enter a name for this checklist.',
//       });
//       return;
//     }

//     const payload = {
//       propertyId: selectedPropertyId,
//       hostId: currentUserId,
//       checklistName: checklistName.trim(),
//       checklist: groupSummary,
//       totalFee,
//       totalTime,
//     };

//     setIsSaving(true);
//     try {
//       const res = await userService.saveChecklist(payload, {
//         headers: {
//           Authorization: `Bearer ${userToken}`,
//         },
//       });

//       if (res.status === 200) {
//         Toast.show({
//           type: 'success',
//           text1: 'Checklist saved successfully',
//         });
//         handleSuccess(res.data.checklistId);
//       }
//     } catch (err) {
//       console.error('Checklist save failed', err);
//       Toast.show({
//         type: 'error',
//         text1: 'Failed to save checklist',
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
//         <Text>Loading apartment details...</Text>
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
//           Create a Cleaning Checklist
//         </Text>
//         <Text style={styles.subheading}>
//           Distribute rooms and extra tasks among available groups to calculate estimated time and cost.
//         </Text>

//         {!routePropertyId && (
//           <View style={{ marginBottom: 1 }}>
//             <FloatingLabelPickerSelect
//               label="Choose a property"
//               items={properties.map((prop) => ({
//                 label: prop.apt_name,
//                 value: prop._id,
//               }))}
//               value={selectedPropertyId}
//               onValueChange={(value) => setSelectedPropertyId(value)}
//             />
//           </View>
//         )}

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
//         />

//         <Button
//           mode="contained"
//           onPress={handleSaveChecklist}
//           disabled={!groupSummary || isSaving || !checklistName.trim()}
//           loading={isSaving}
//           style={styles.saveButton}
//         >
//           Save Checklist ({currency}{(totalFee ?? 0).toFixed(2)})
//         </Button>
//       </View>

//       {showTooltip && (
//         <Modal transparent animationType="fade">
//           <View style={styles.tooltipOverlay}>
//             <View style={styles.tooltipBox}>
//               <Text style={styles.tooltipText}>
//                 This helps us understand how many cleaners will work on the apartment.
//                 {"\n\n"}
//                 If it’s just one cleaner, we’ll assign all tasks to one group.
//                 If it’s two or more, you’ll be able to split tasks across groups for faster cleaning.
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
//   tooltipBox: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 12,
//     maxWidth: 300,
//     elevation: 5,
//   },
//   tooltipText: { fontSize: 14, color: '#333', marginBottom: 10 },
//   tooltipClose: { fontWeight: 'bold', color: COLORS.primary, textAlign: 'right', fontSize: 14 },
// });




// import React, { useState, useEffect, useContext } from 'react';
// import { 
//   View, 
//   StyleSheet, 
//   ScrollView, 
//   ActivityIndicator, 
//   TouchableOpacity, 
//   Modal 
// } from 'react-native';
// import { Text, Button } from 'react-native-paper';
// import { useNavigation } from '@react-navigation/native';
// import { AuthContext } from '../../context/AuthContext';
// import COLORS from '../../constants/colors';
// import RoomAssignmentPicker from './CreateBookingContents/RoomAssignmentPicker';
// import userService from '../../services/connection/userService';
// import Toast from 'react-native-toast-message';
// import FloatingLabelPickerSelect from '../../components/shared/FloatingLabelPicker';
// import ROUTES from '../../constants/routes';
// import { useBookingContext } from '../../context/BookingContext';
// import { MaterialCommunityIcons } from '@expo/vector-icons';

// export default function CreateChecklist({ route }) {
//   const { currentUserId, currency, userToken } = useContext(AuthContext);
//   const { 
//     source, 
//     propertyId, 
//     apartmentName, 
//     onChecklistCreated 
//   } = route.params || {};

//   const {
//     setSelectedChecklistId,
//     selectedChecklistId,
//     setFormData,
//     setScheduleStep,
//     setResumeAfterChecklist,
//     setModalVisible,
//     handleCreateSchedule,
//   } = useBookingContext();

//   const navigation = useNavigation();
  
//   const [expectedCleaners, setExpectedCleaners] = useState(2);
//   const [taskGroups, setTaskGroups] = useState([]);
//   const [selectedApartment, setSelectedApartment] = useState(null);
//   const [groupSummary, setGroupSummary] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);

//   const [showTooltip, setShowTooltip] = useState(false);
//   const [totalFee, setTotalFee] = useState(0);
//   const [totalTime, setTotalTime] = useState(0);
//   const [checklistName, setChecklistName] = useState(`Cleaning Checklist - ${apartmentName || 'Property'}`);
//   const [selectedPropertyId, setSelectedPropertyId] = useState(propertyId || '');
//   const [selectedPropertyName, setSelectedPropertyName] = useState('');
//   const [properties, setProperties] = useState([]);

//   useEffect(() => {
//     if (propertyId) {
//       setSelectedPropertyId(propertyId);
//       fetchApartmentDetails();
//     } else {
//       fetchProperties();
//     }
//   }, []);

//   useEffect(() => {
//     if (selectedPropertyId) {
//       fetchApartmentDetails();
//     }
//   }, [selectedPropertyId]);

//   const fetchApartmentDetails = async () => {
//     if (!selectedPropertyId) return;

//     setIsLoading(true);
//     try {
//       const res = await userService.getApartmentById(selectedPropertyId);
//       setSelectedApartment(res.data);

//       const generatedGroups = Array.from({ length: expectedCleaners }, (_, i) => ({
//         groupId: `group_${i + 1}`,
//         rooms: [],
//         pricing: null,
//       }));
//       setTaskGroups(generatedGroups);

//     } catch (err) {
//       console.error('Error fetching apartment:', err);
//       Toast.show({
//         type: 'error',
//         text1: 'Failed to load property',
//         text2: 'Please try again',
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!selectedApartment?._id) return;

//     setFormData(prev => ({
//       ...prev,
//       aptId: selectedApartment._id,
//     }));
//   }, [selectedApartment]);

//   const fetchProperties = async () => {
//     try {
//       const response = await userService.getApartment(currentUserId);
//       setProperties(response.data);

//       if (!propertyId && response.data.length > 0) {
//         setSelectedPropertyId(response.data[0]._id);
//         // setSelectedPropertyName(response.data[0].apt_name)
       
//       }
//     } catch (e) {
//       console.error("Failed to fetch properties", e);
//       Toast.show({
//         type: 'error',
//         text1: 'Failed to load properties',
//       });
//     }
//   };

//   const handleSuccess = (checklistId, checklistData) => {
//     if (source === 'schedule') {
//       // If coming from schedule flow
//       if (onChecklistCreated) {
//         onChecklistCreated(checklistData);
//       }
      
//       // Navigate back to the NewBooking screen
//       navigation.goBack();
      
//       Toast.show({
//         type: 'success',
//         text1: 'Checklist created successfully',
//         text2: 'You can now continue scheduling',
//       });
//     } else {
//       // For standalone checklist creation
//       navigation.goBack();
//       Toast.show({
//         type: 'success',
//         text1: 'Checklist saved successfully',
//       });
//     }
//   };

//   const handleSaveChecklist = async () => {
//     if (!selectedPropertyId) {
//       Toast.show({
//         type: 'error',
//         text1: 'Property Required',
//         text2: 'Please select a property',
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

//     if (!checklistName.trim()) {
//       Toast.show({
//         type: 'error',
//         text1: 'Checklist Name Required',
//         text2: 'Please enter a name for this checklist.',
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
//       isDefault: true // Make it default for this property
//     };

//     setIsSaving(true);
//     try {
//       const res = await userService.saveChecklist(payload, {
//         headers: {
//           Authorization: `Bearer ${userToken}`,
//         },
//       });

//       if (res.status === 200) {
//         handleSuccess(res.data.checklistId, {
//           checklistId: res.data.checklistId,
//           checklistName: checklistName.trim(),
//           checklistTasks: groupSummary.tasks || []
//         });
//       }
//     } catch (err) {
//       console.error('Checklist save failed', err);
//       Toast.show({
//         type: 'error',
//         text1: 'Failed to save checklist',
//         text2: 'Please try again later',
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleBack = () => {
//     if (source === 'schedule') {
//       // Warn user if they go back without creating checklist
//       Toast.show({
//         type: 'info',
//         text1: 'Checklist Required',
//         text2: 'You need a checklist to create a schedule',
//       });
//     }
//     navigation.goBack();
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text>Loading property details...</Text>
//       </View>
//     );
//   }

//   if (!selectedApartment && selectedPropertyId) {
//     return (
//       <View style={styles.centered}>
//         <Text>Property not found</Text>
//         <Button onPress={() => navigation.goBack()} mode="contained" style={{ marginTop: 20 }}>
//           Go Back
//         </Button>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Custom Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={handleBack} style={styles.backButton}>
//           <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.dark} />
//           <Text style={styles.backText}>Back</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Create Checklist</Text>
//         <View style={styles.headerRight} />
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
//         <View style={styles.content}>
//           <Text variant="titleLarge" style={styles.heading}>
//             Create a Cleaning Checklist
//           </Text>
          
//           {source === 'schedule' && (
//             <View style={styles.infoBanner}>
//               <MaterialCommunityIcons name="information" size={20} color={COLORS.primary} />
//               <Text style={styles.infoText}>
//                 You need a checklist to create a cleaning schedule. After saving, you'll return to schedule creation.
//               </Text>
//             </View>
//           )}
          
//           <Text style={styles.subheading}>
//             Distribute rooms and extra tasks among available groups to calculate estimated time and cost.
//           </Text>

//           {!propertyId && (
//             <View style={{ marginBottom: 16 }}>
//               {/* <FloatingLabelPickerSelect
//                 label="Choose a property"
//                 items={properties.map((prop) => ({
//                   label: prop.apt_name,
//                   value: prop._id,
//                 }))}
//                 value={selectedPropertyId}
//                 onValueChange={(value) => setSelectedPropertyId(value)}
//               /> */}

//               <FloatingLabelPickerSelect
//                 label="Choose a property"
//                 items={properties.map((prop) => ({
//                   label: prop.apt_name,
//                   value: prop._id,
//                 }))}
//                 value={selectedPropertyId}
//                 onValueChange={(value) => {
//                   setSelectedPropertyId(value);

//                   const selectedProp = properties.find(
//                     (prop) => prop._id === value
//                   );

//                   setSelectedPropertyName(selectedProp?.apt_name || '');
//                 }}
//               />
//             </View>
//           )}

//           {selectedApartment && (
//             <RoomAssignmentPicker
//               key={selectedPropertyId}
//               selectedApartment={selectedApartment}
//               taskGroups={taskGroups}
//               onGroupSummaryChange={setGroupSummary}
//               onTotalFeeChange={setTotalFee}
//               onTotalTimeChange={setTotalTime}
//               checklistName={checklistName}
//               setChecklistName={setChecklistName}
//               onInfoPress={() => setShowTooltip(true)}
//             />
//           )}

//           <Button
//             mode="contained"
//             onPress={handleSaveChecklist}
//             disabled={!groupSummary || isSaving || !checklistName.trim() || !selectedPropertyId}
//             loading={isSaving}
//             style={styles.saveButton}
//             contentStyle={styles.saveButtonContent}
//           >
//             Save Checklist ({currency}{(totalFee ?? 0).toFixed(2)})
//           </Button>
//         </View>
//       </ScrollView>

//       {showTooltip && (
//         <Modal transparent animationType="fade" visible={showTooltip}>
//           <View style={styles.tooltipOverlay}>
//             <View style={styles.tooltipBox}>
//               <Text style={styles.tooltipText}>
//                 This helps us understand how many cleaners will work on the apartment.
//                 {"\n\n"}
//                 If it's just one cleaner, we'll assign all tasks to one group.
//                 If it's two or more, you'll be able to split tasks across groups for faster cleaning.
//               </Text>
//               <TouchableOpacity onPress={() => setShowTooltip(false)} style={styles.tooltipCloseButton}>
//                 <Text style={styles.tooltipClose}>Got it</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//       )}
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
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//     backgroundColor: '#fff',
//   },
//   backButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   backText: {
//     marginLeft: 4,
//     fontSize: 16,
//     color: COLORS.dark,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: COLORS.dark,
//   },
//   headerRight: {
//     width: 60,
//   },
//   scrollContainer: { 
//     flex: 1 
//   },
//   content: { 
//     padding: 20 
//   },
//   heading: { 
//     fontSize: 22, 
//     fontWeight: 'bold',
//     marginBottom: 12 
//   },
//   infoBanner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#E8F4FD',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//   },
//   infoText: {
//     marginLeft: 8,
//     flex: 1,
//     color: COLORS.dark,
//     fontSize: 14,
//   },
//   subheading: { 
//     fontSize: 14, 
//     color: COLORS.gray, 
//     marginBottom: 20 
//   },
//   saveButton: { 
//     marginTop: 30, 
//     marginBottom: 20,
//     borderRadius: 8, 
//   },
//   saveButtonContent: {
//     paddingVertical: 8,
//   },
//   centered: { 
//     flex: 1, 
//     justifyContent: 'center', 
//     alignItems: 'center' 
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
//     marginBottom: 20 
//   },
//   tooltipCloseButton: {
//     alignItems: 'flex-end',
//   },
//   tooltipClose: { 
//     fontWeight: 'bold', 
//     color: COLORS.primary, 
//     fontSize: 14 
//   },
// });



import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import COLORS from '../../constants/colors';
import RoomAssignmentPicker from './CreateBookingContents/RoomAssignmentPicker';
import userService from '../../services/connection/userService';
import Toast from 'react-native-toast-message';
import FloatingLabelPickerSelect from '../../components/shared/FloatingLabelPicker';
import { useBookingContext } from '../../context/BookingContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ROUTES from '../../constants/routes';

export default function CreateChecklist({ route }) {
  const { currentUserId, currency, userToken } = useContext(AuthContext);
  const {
    source,
    propertyId,
    apartmentName,
    onChecklistCreated,
  } = route.params || {};


  const {
    setFormData,
  } = useBookingContext();

  const navigation = useNavigation();

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
    `Cleaning Checklist - ${apartmentName || 'Property'}`
  );

  const [selectedPropertyId, setSelectedPropertyId] = useState(propertyId || '');
  const [selectedPropertyName, setSelectedPropertyName] = useState('');
  const [properties, setProperties] = useState([]);

  /* ---------------- FETCH PROPERTIES ---------------- */
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await userService.getApartment(currentUserId);
      setProperties(res.data || []);

      // ✅ DEFAULT SELECTION
      if (propertyId) {
        const found = res.data.find(p => p._id === propertyId);
        if (found) {
          setSelectedPropertyId(found._id);
          setSelectedPropertyName(found.apt_name);
        }
      } else if (res.data.length > 0) {
        setSelectedPropertyId(res.data[0]._id);
        setSelectedPropertyName(res.data[0].apt_name);
      }
    } catch (err) {
      console.error(err);
      Toast.show({
        type: 'error',
        text1: 'Failed to load properties',
      });
    }
  };

  /* ---------------- FETCH APARTMENT DETAILS ---------------- */
  useEffect(() => {
    if (!selectedPropertyId) return;

    const fetchApartmentDetails = async () => {
      setIsLoading(true);
      try {
        const res = await userService.getApartmentById(selectedPropertyId);
        setSelectedApartment(res.data);

        const groups = Array.from({ length: expectedCleaners }, (_, i) => ({
          groupId: `group_${i + 1}`,
          rooms: [],
          pricing: null,
        }));
        setTaskGroups(groups);
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Failed to load property',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApartmentDetails();
  }, [selectedPropertyId]);

  /* ---------------- UPDATE FORM DATA ---------------- */
  useEffect(() => {
    if (!selectedApartment?._id) return;

    setFormData(prev => ({
      ...prev,
      aptId: selectedApartment._id,
    }));
  }, [selectedApartment]);

  /* ---------------- SAVE ---------------- */
  const handleSaveChecklist = async () => {
    if (!selectedPropertyId || !groupSummary || !checklistName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing required data',
      });
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
      const res = await userService.saveChecklist(payload, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (res.status === 200) {

        // Callback to refresh parent component
        if (onChecklistCreated) {
          onChecklistCreated();
        }
        navigation.navigate(ROUTES.host_checklist,{
          mode:"delete",
          status:"success",
          message:"Checklist successfully created"
        })
        // Toast.show({
        //   type: 'success',
        //   text1: 'Checklist saved successfully',
        // });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failed to save checklist',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Loading property details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Checklist</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        {!propertyId && (
          <FloatingLabelPickerSelect
            label="Choose a property"
            items={properties.map(p => ({
              label: p.apt_name,
              value: p._id,
            }))}
            value={selectedPropertyId}
            onValueChange={(value) => {
              setSelectedPropertyId(value);
              const prop = properties.find(p => p._id === value);
              setSelectedPropertyName(prop?.apt_name || '');
            }}
          />
        )}

        {selectedApartment && (
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
        )}

        <Button
          mode="contained"
          onPress={handleSaveChecklist}
          loading={isSaving}
          disabled={!groupSummary}
          style={{ marginTop: 24 }}
        >
          Save Checklist ({currency}{totalFee.toFixed(2)})
        </Button>
      </ScrollView>
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  backText: { 
    marginLeft: 4 
  },
  headerTitle: { 
    flex: 1, 
    textAlign: 'center', 
    fontWeight: 'bold' 
  },
  content: { 
    padding: 20 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});