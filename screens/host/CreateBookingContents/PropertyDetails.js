// import React, { useState, useEffect, useContext, useCallback } from 'react';
// import COLORS from '../../../constants/colors';
// import { View, StyleSheet, Text } from 'react-native';
// import { AuthContext } from '../../../context/AuthContext';
// import * as Animatable from 'react-native-animatable';
// import FloatingLabelPickerSelect from '../../../components/shared/FloatingLabelPicker';
// import SingleApartmentItem from '../../../components/shared/SingleApartmentItem';
// import userService from '../../../services/connection/userService';
// import { calculateRoomCleaningTime } from '../../../utils/calculateRoomCleaningTime';
// import { calculateCleaningPrice } from '../../../utils/calculateCleaningPrice';

// export default function PropertyDetails({ 
//   selectedProperty, 
//   formData, 
//   setFormData, 
//   validateForm,
//   onPropertyChange // 🔥 NEW: Add this prop
// }) {
//   const { currentUserId } = useContext(AuthContext);
//   const [ownerApartments, setOwnerApartments] = useState([]);

//   const validateCurrentStep = useCallback(() => {
//     return !!formData?.aptId;
//   }, [formData?.aptId]);

//   useEffect(() => {
//     const isFormValid = validateCurrentStep();
//     if (validateForm) {
//       validateForm(isFormValid);
//     }
//   }, [validateCurrentStep, validateForm]);

//   useEffect(() => {
//     fetchApartments();
//   }, []);

//   const fetchApartments = async () => {
//     try {
//       const response = await userService.getApartment(currentUserId);
//       setOwnerApartments(response.data);
//       console.log("My properties select", response.data);
//     } catch (error) {
//       console.error('Error fetching apartments:', error);
//     }
//   };

//   const handleApartmentChange = (apartment) => {
//     // Update selected apartment in formData
//     const cleaningFee = calculateCleaningPrice(apartment.roomDetails);
//     const cleaningTime = calculateRoomCleaningTime(apartment.roomDetails);

//     const updatedFormData = {
//       address: apartment.address,
//       aptId: apartment._id,
//       apartment_name: apartment.apt_name,
//       apartment_latitude: apartment.latitude,
//       apartment_longitude: apartment.longitude,
//       selected_apt_room_type_and_size: apartment.roomDetails,
//       regular_cleaning_fee: cleaningFee,
//       regular_cleaning_time: cleaningTime,
//       total_cleaning_fee: cleaningFee,
//       total_cleaning_time: cleaningTime,
//       expected_cleaners: 1,
//       group_task: false, 
//       checklists: apartment.checklists,
//       default_checklist: apartment.default_checklist
//     };
    
//     // Update form data
//     setFormData((prevFormData) => ({
//       ...prevFormData,
//       ...updatedFormData
//     }));
    
//     // 🔥 NEW: Notify parent that property changed
//     if (onPropertyChange) {
//       onPropertyChange(updatedFormData);
//     }
//   };

//   const selectedApartment = ownerApartments.find((apt) => apt._id === formData.aptId) || null;

//   return (
//     <View>
//       <Text bold style={{ fontSize: 24 }}>Choose Your Property</Text>
//       <Text style={{ fontSize: 14, marginBottom: 20, color: COLORS.gray }}>
//         Select the Apartment You Want to Schedule for Cleaning
//       </Text>

//       <FloatingLabelPickerSelect
//         label="Select Apartment"
//         value={formData?.aptId}
//         onValueChange={(value) => {
//           const selected = ownerApartments.find((apt) => apt._id === value);
//           if (selected) {
//             handleApartmentChange(selected);
//           }
//         }}
//         items={ownerApartments.map((apt) => ({
//           label: apt.apt_name,
//           value: apt._id,
//         }))}
//       />

//       {selectedApartment && (
//         <Animatable.View animation="slideInRight" duration={550}>
//           <SingleApartmentItem apartment={selectedApartment} />
//         </Animatable.View>
//       )}

//       <View style={{ marginVertical: 20 }}>
//         {/* Optional content */}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   address: {
//     marginVertical: 10,
//   },
//   address_text: {
//     fontSize: 16,
//   },
// });




// import React, { useState, useEffect, useContext, useCallback } from 'react';
// import COLORS from '../../../constants/colors';
// import { 
//   View, 
//   StyleSheet, 
//   Text, 
//   TouchableOpacity, 
//   Alert, 
//   ActivityIndicator 
// } from 'react-native';
// import { AuthContext } from '../../../context/AuthContext';
// import * as Animatable from 'react-native-animatable';
// import FloatingLabelPickerSelect from '../../../components/shared/FloatingLabelPicker';
// import SingleApartmentItem from '../../../components/shared/SingleApartmentItem';
// import userService from '../../../services/connection/userService';
// import { calculateRoomCleaningTime } from '../../../utils/calculateRoomCleaningTime';
// import { calculateCleaningPrice } from '../../../utils/calculateCleaningPrice';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import ROUTES from '../../../constants/routes';
// import { useBookingContext } from '../../../context/BookingContext'; // Import BookingContext

// export default function PropertyDetails({ 
//   selectedProperty, 
//   formData, 
//   setFormData, 
//   validateForm,
//   onPropertyChange,
//   navigation: navigationProp // Add navigation prop
// }) {
//   const { currentUserId } = useContext(AuthContext);
//   const { setModalVisible } = useBookingContext(); // Get setModalVisible from context
  
//   const [ownerApartments, setOwnerApartments] = useState([]);
//   const [checkingChecklist, setCheckingChecklist] = useState(false);
//   const [checklistStatus, setChecklistStatus] = useState({
//     hasChecklist: false,
//     checklistId: null,
//     checklistName: null,
//     checklistTasks: []
//   });

//   // Use either passed navigation or hook
//   const navFromHook = useNavigation();
//   const navigation = navigationProp || navFromHook;

//   const validateCurrentStep = useCallback(() => {
//     if (!formData?.aptId) {
//       return false;
//     }
    
//     // If apartment has no checklists, form is still invalid
//     if (formData?.aptId && !formData?.checklistId && formData?.checklists?.length === 0) {
//       return false;
//     }
    
//     return !!formData?.aptId && !!formData?.checklistId;
//   }, [formData?.aptId, formData?.checklistId, formData?.checklists]);

//   useEffect(() => {
//     const isFormValid = validateCurrentStep();
//     if (validateForm) {
//       validateForm(isFormValid);
//     }
//   }, [validateCurrentStep, validateForm]);

//   useEffect(() => {
//     fetchApartments();
//   }, []);

//   // Check for checklist when apartment changes
//   useEffect(() => {
//     if (formData?.aptId) {
//       checkApartmentChecklist(formData.aptId);
//     }
//   }, [formData?.aptId]);

//   const fetchApartments = async () => {
//     try {
//       const response = await userService.getApartment(currentUserId);
//       const apartments = response.data;
//       setOwnerApartments(apartments);
//       console.log("My properties select", apartments);
//     } catch (error) {
//       console.error('Error fetching apartments:', error);
//     }
//   };

//   const checkApartmentChecklist = async (apartmentId) => {
//     setCheckingChecklist(true);
//     try {
//       // Get apartment details including checklists
//       const apartmentResponse = await userService.getApartmentById(apartmentId);
//       const apartment = apartmentResponse.data;
      
//       // Check if apartment has checklists
//       if (apartment.checklists && apartment.checklists.length > 0) {
//         // Use default checklist if available, otherwise use first one
//         const checklist = apartment.default_checklist 
//           ? apartment.checklists.find(c => c._id === apartment.default_checklist)
//           : apartment.checklists[0];
        
//         if (checklist) {
//           setChecklistStatus({
//             hasChecklist: true,
//             checklistId: checklist._id,
//             checklistName: checklist.checklistName,
//             checklistTasks: checklist.checklist?.tasks || []
//           });
          
//           // Update formData with checklist info
//           setFormData(prev => ({
//             ...prev,
//             checklistId: checklist._id,
//             checklistName: checklist.checklistName,
//             checklistTasks: checklist.checklist?.tasks || [],
//             checklists: apartment.checklists,
//             default_checklist: apartment.default_checklist
//           }));
//         } else {
//           setChecklistStatus({
//             hasChecklist: false,
//             checklistId: null,
//             checklistName: null,
//             checklistTasks: []
//           });
//           setFormData(prev => ({
//             ...prev,
//             checklistId: null,
//             checklists: apartment.checklists,
//             default_checklist: null
//           }));
//         }
//       } else {
//         // No checklist found
//         setChecklistStatus({
//           hasChecklist: false,
//           checklistId: null,
//           checklistName: null,
//           checklistTasks: []
//         });
//         setFormData(prev => ({
//           ...prev,
//           checklistId: null,
//           checklists: [],
//           default_checklist: null
//         }));
//       }
//     } catch (error) {
//       console.error('Error checking checklist:', error);
//       setChecklistStatus({
//         hasChecklist: false,
//         checklistId: null,
//         checklistName: null,
//         checklistTasks: []
//       });
//     } finally {
//       setCheckingChecklist(false);
//     }
//   };

//   const handleApartmentChange = (apartment) => {
//     const cleaningFee = calculateCleaningPrice(apartment.roomDetails);
//     const cleaningTime = calculateRoomCleaningTime(apartment.roomDetails);

//     const updatedFormData = {
//       address: apartment.address,
//       aptId: apartment._id,
//       apartment_name: apartment.apt_name,
//       apartment_latitude: apartment.latitude,
//       apartment_longitude: apartment.longitude,
//       selected_apt_room_type_and_size: apartment.roomDetails,
//       regular_cleaning_fee: cleaningFee,
//       regular_cleaning_time: cleaningTime,
//       total_cleaning_fee: cleaningFee,
//       total_cleaning_time: cleaningTime,
//       expected_cleaners: 1,
//       group_task: false, 
//       checklists: apartment.checklists,
//       default_checklist: apartment.default_checklist,
//       checklistId: null, // Reset checklistId, will be set after check
//       checklistName: null,
//       checklistTasks: []
//     };
    
//     // Update form data
//     setFormData((prevFormData) => ({
//       ...prevFormData,
//       ...updatedFormData
//     }));
    
//     // Notify parent that property changed
//     if (onPropertyChange) {
//       onPropertyChange(updatedFormData);
//     }
//   };

//   // const handleCreateChecklist = () => {
//   //   if (!formData.aptId) {
//   //     Alert.alert('Error', 'Please select an apartment first');
//   //     return;
//   //   }
    
//   //   // Close the modal before navigating to checklist creation
//   //   setModalVisible(false);
    
//   //   // Navigate to checklist creation screen
//   //   navigation.navigate(ROUTES.host_create_checklist, {
//   //     propertyId: formData.aptId,
//   //     apartmentName: formData.apartment_name,
//   //     source: 'schedule',
//   //     onChecklistCreated: handleChecklistCreated
//   //   });
//   // };

//   const handleCreateChecklist = () => {
//     if (!formData.aptId) {
//       Alert.alert('Error', 'Please select an apartment first');
//       return;
//     }
    
//     // Store current apartment info before closing
//     const currentApartmentId = formData.aptId;
    
//     // Close the modal before navigating to checklist creation
//     setModalVisible(false);
    
//     // Navigate to checklist creation screen
//     navigation.navigate(ROUTES.host_create_checklist, {
//       propertyId: currentApartmentId,
//       apartmentName: formData.apartment_name,
//       source: 'schedule',
//       onChecklistCreated: handleChecklistCreated
//     });
//   };

//   const handleChecklistCreated = () => {
//     // Re-check checklist after creation
//     if (formData.aptId) {
//       checkApartmentChecklist(formData.aptId);
//     }
//   };

//   const selectedApartment = ownerApartments.find((apt) => apt._id === formData.aptId) || null;

//   return (
//     <View>
//       <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Choose Your Property</Text>
//       <Text style={{ fontSize: 14, marginBottom: 20, color: COLORS.gray }}>
//         Select the Apartment You Want to Schedule for Cleaning
//       </Text>

//       <FloatingLabelPickerSelect
//         label="Select Apartment"
//         value={formData?.aptId}
//         onValueChange={(value) => {
//           const selected = ownerApartments.find((apt) => apt._id === value);
//           if (selected) {
//             handleApartmentChange(selected);
//           }
//         }}
//         items={ownerApartments.map((apt) => ({
//           label: apt.apt_name,
//           value: apt._id,
//         }))}
//       />

//       {checkingChecklist && (
//         <View style={styles.checklistChecking}>
//           <ActivityIndicator size="small" color={COLORS.primary} />
//           <Text style={styles.checklistText}>Checking for checklist...</Text>
//         </View>
//       )}

//       {selectedApartment && (
//         <Animatable.View animation="slideInRight" duration={550}>
//           <SingleApartmentItem apartment={selectedApartment} />
//         </Animatable.View>
//       )}

//       {formData?.aptId && !checkingChecklist && (
//         <View style={styles.checklistStatus}>
//           {checklistStatus.hasChecklist ? (
//             <View style={styles.checklistAvailable}>
//               <MaterialCommunityIcons 
//                 name="checkbox-marked-circle-outline" 
//                 size={24} 
//                 color="#4CAF50" 
//               />
//               <View style={styles.checklistInfo}>
//                 <Text style={styles.checklistName}>
//                   Checklist: {checklistStatus.checklistName}
//                 </Text>
//                 <Text style={styles.checklistTasks}>
//                   {checklistStatus.checklistTasks?.length || 0} tasks configured
//                 </Text>
//               </View>
//             </View>
//           ) : (
//             <View style={styles.checklistMissing}>
//               <MaterialCommunityIcons 
//                 name="alert-circle-outline" 
//                 size={24} 
//                 color="#FF6B6B" 
//               />
//               <View style={styles.checklistInfo}>
//                 <Text style={styles.checklistWarning}>
//                   No checklist found for this property
//                 </Text>
//                 <Text style={styles.checklistInstruction}>
//                   You need to create a checklist before scheduling cleaning
//                 </Text>
//               </View>
//               <TouchableOpacity
//                 style={styles.createChecklistButton}
//                 onPress={handleCreateChecklist}
//               >
//                 <Text style={styles.createChecklistButtonText}>
//                   Create Checklist
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       )}

//       <View style={styles.note}>
//         <Text style={styles.noteText}>
//           Note: Each property must have a cleaning checklist before scheduling.
//         </Text>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   address: {
//     marginVertical: 10,
//   },
//   address_text: {
//     fontSize: 16,
//   },
//   checklistChecking: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF3CD',
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 16,
//     marginBottom: 16,
//   },
//   checklistText: {
//     marginLeft: 8,
//     color: '#856404',
//   },
//   checklistStatus: {
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   checklistAvailable: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#d4edda',
//     padding: 16,
//     borderRadius: 8,
//   },
//   checklistMissing: {
//     backgroundColor: '#f8d7da',
//     padding: 16,
//     borderRadius: 8,
//   },
//   checklistInfo: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   checklistName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#155724',
//   },
//   checklistTasks: {
//     fontSize: 14,
//     color: '#155724',
//     opacity: 0.8,
//   },
//   checklistWarning: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#721c24',
//   },
//   checklistInstruction: {
//     fontSize: 14,
//     color: '#721c24',
//     marginTop: 4,
//   },
//   createChecklistButton: {
//     backgroundColor: '#dc3545',
//     padding: 12,
//     borderRadius: 6,
//     marginTop: 12,
//     alignItems: 'center',
//   },
//   createChecklistButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   note: {
//     marginTop: 20,
//     padding: 12,
//     backgroundColor: '#E8F4FD',
//     borderRadius: 8,
//   },
//   noteText: {
//     color: COLORS.dark,
//     fontSize: 14,
//     fontStyle: 'italic',
//   },
// });




// import React, { useState, useEffect, useContext, useCallback } from 'react';
// import COLORS from '../../../constants/colors';
// import { 
//   View, 
//   StyleSheet, 
//   Text, 
//   TouchableOpacity, 
//   Alert, 
//   ActivityIndicator 
// } from 'react-native';
// import { AuthContext } from '../../../context/AuthContext';
// import * as Animatable from 'react-native-animatable';
// import FloatingLabelPickerSelect from '../../../components/shared/FloatingLabelPicker';
// import SingleApartmentItem from '../../../components/shared/SingleApartmentItem';
// import userService from '../../../services/connection/userService';
// import { calculateRoomCleaningTime } from '../../../utils/calculateRoomCleaningTime';
// import { calculateCleaningPrice } from '../../../utils/calculateCleaningPrice';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { useBookingContext } from '../../../context/BookingContext';
// import ROUTES from '../../../constants/routes';

// export default function PropertyDetails({ 
//   selectedProperty, 
//   formData, 
//   setFormData, 
//   validateForm,
//   onPropertyChange,
//   navigation,
//   onChecklistCreated // 🔥 NEW: Callback for checklist creation
// }) {
//   const { currentUserId } = useContext(AuthContext);
//   const { setModalVisible } = useBookingContext();
  
//   const [ownerApartments, setOwnerApartments] = useState([]);
//   const [checkingChecklist, setCheckingChecklist] = useState(false);
//   const [checklistStatus, setChecklistStatus] = useState({
//     hasChecklist: false,
//     checklistId: null,
//     checklistName: null,
//     checklistTasks: []
//   });

//   // Alternative simpler validation in PropertyDetails
// useEffect(() => {
//   // Only validate when these specific values change
//   const isFormValid = formData.aptId && (formData.checklistId || formData.checklists?.length > 0);
  
//   if (validateForm) {
//     validateForm(isFormValid);
//   }
// }, [formData.aptId, formData.checklistId, formData.checklists, validateForm]);

//   const validateCurrentStep = useCallback(() => {
//     if (!formData?.aptId) {
//       return false;
//     }
    
//     // If apartment has no checklists, form is still invalid
//     if (formData?.aptId && !formData?.checklistId && formData?.checklists?.length === 0) {
//       return false;
//     }
    
//     return !!formData?.aptId && !!formData?.checklistId;
//   }, [formData?.aptId, formData?.checklistId, formData?.checklists]);

//   useEffect(() => {
//     const isFormValid = validateCurrentStep();
//     console.log("[PropertyDetails] validateCurrentStep result:", isFormValid);
//     if (validateForm) {
//       validateForm(isFormValid);
//     }
//   }, [validateCurrentStep, validateForm]);

//   useEffect(() => {
//     fetchApartments();
//   }, []);

//   // Check for checklist when apartment changes
//   useEffect(() => {
//     if (formData?.aptId) {
//       checkApartmentChecklist(formData.aptId);
//     }
//   }, [formData?.aptId]);

//   const fetchApartments = async () => {
//     try {
//       const response = await userService.getApartment(currentUserId);
//       const apartments = response.data;
//       setOwnerApartments(apartments);
//       console.log("My properties select", apartments);
//     } catch (error) {
//       console.error('Error fetching apartments:', error);
//     }
//   };

//   const checkApartmentChecklist = async (apartmentId) => {
//     setCheckingChecklist(true);
//     try {
//       // Get apartment details including checklists
//       const apartmentResponse = await userService.getApartmentById(apartmentId);
//       const apartment = apartmentResponse.data;
      
//       console.log("[PropertyDetails] Apartment data:", {
//         id: apartment._id,
//         checklists: apartment.checklists,
//         default_checklist: apartment.default_checklist
//       });
      
//       // Check if apartment has checklists
//       if (apartment.checklists && apartment.checklists.length > 0) {
//         // Use default checklist if available, otherwise use first one
//         const checklist = apartment.default_checklist 
//           ? apartment.checklists.find(c => c._id === apartment.default_checklist)
//           : apartment.checklists[0];
        
//         if (checklist) {
//           console.log("[PropertyDetails] Found checklist:", checklist);
          
//           setChecklistStatus({
//             hasChecklist: true,
//             checklistId: checklist._id,
//             checklistName: checklist.checklistName,
//             checklistTasks: checklist.checklist?.tasks || []
//           });
          
//           // Update formData with checklist info
//           setFormData(prev => ({
//             ...prev,
//             checklistId: checklist._id,
//             checklistName: checklist.checklistName,
//             checklistTasks: checklist.checklist?.tasks || [],
//             checklists: apartment.checklists,
//             default_checklist: apartment.default_checklist
//           }));
//         } else {
//           console.log("[PropertyDetails] No valid checklist found in array");
//           setChecklistStatus({
//             hasChecklist: false,
//             checklistId: null,
//             checklistName: null,
//             checklistTasks: []
//           });
//           setFormData(prev => ({
//             ...prev,
//             checklistId: null,
//             checklists: apartment.checklists,
//             default_checklist: null
//           }));
//         }
//       } else {
//         // No checklist found
//         console.log("[PropertyDetails] No checklists found on apartment");
//         setChecklistStatus({
//           hasChecklist: false,
//           checklistId: null,
//           checklistName: null,
//           checklistTasks: []
//         });
//         setFormData(prev => ({
//           ...prev,
//           checklistId: null,
//           checklists: [],
//           default_checklist: null
//         }));
//       }
//     } catch (error) {
//       console.error('Error checking checklist:', error);
//       setChecklistStatus({
//         hasChecklist: false,
//         checklistId: null,
//         checklistName: null,
//         checklistTasks: []
//       });
//     } finally {
//       setCheckingChecklist(false);
//     }
//   };

//   const handleApartmentChange = (apartment) => {
//     const cleaningFee = calculateCleaningPrice(apartment.roomDetails);
//     const cleaningTime = calculateRoomCleaningTime(apartment.roomDetails);

//     const updatedFormData = {
//       address: apartment.address,
//       aptId: apartment._id,
//       apartment_name: apartment.apt_name,
//       apartment_latitude: apartment.latitude,
//       apartment_longitude: apartment.longitude,
//       selected_apt_room_type_and_size: apartment.roomDetails,
//       regular_cleaning_fee: cleaningFee,
//       regular_cleaning_time: cleaningTime,
//       total_cleaning_fee: cleaningFee,
//       total_cleaning_time: cleaningTime,
//       expected_cleaners: 1,
//       group_task: false, 
//       checklists: apartment.checklists,
//       default_checklist: apartment.default_checklist,
//       checklistId: null, // Reset checklistId, will be set after check
//       checklistName: null,
//       checklistTasks: []
//     };
    
//     // Update form data
//     setFormData((prevFormData) => ({
//       ...prevFormData,
//       ...updatedFormData
//     }));
    
//     // Notify parent that property changed
//     if (onPropertyChange) {
//       onPropertyChange(updatedFormData);
//     }
//   };

//   const handleCreateChecklist = () => {
//     if (!formData.aptId) {
//       Alert.alert('Error', 'Please select an apartment first');
//       return;
//     }
    
//     console.log("[PropertyDetails] Creating checklist for apartment:", formData.aptId);
    
//     // Navigate to checklist creation screen
//     navigation.navigate(ROUTES.host_create_checklist, {
//       propertyId: formData.aptId,
//       apartmentName: formData.apartment_name,
//       source: 'schedule',
//       onChecklistCreated: handleChecklistCreated
//     });
//   };

//   const handleChecklistCreated = (checklistData) => {
//     console.log("[PropertyDetails] Checklist created callback received:", checklistData);
    
//     // Call the parent callback if provided
//     if (onChecklistCreated) {
//       onChecklistCreated(checklistData);
//     }
    
//     // Re-check checklist after creation
//     if (formData.aptId) {
//       console.log("[PropertyDetails] Re-checking checklist for apartment:", formData.aptId);
//       checkApartmentChecklist(formData.aptId);
//     }
//   };

//   const selectedApartment = ownerApartments.find((apt) => apt._id === formData.aptId) || null;

//   return (
//     <View>
//       <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Choose Your Property</Text>
//       <Text style={{ fontSize: 14, marginBottom: 20, color: COLORS.gray }}>
//         Select the Apartment You Want to Schedule for Cleaning
//       </Text>

//       <FloatingLabelPickerSelect
//         label="Select Apartment"
//         value={formData?.aptId}
//         onValueChange={(value) => {
//           console.log("[PropertyDetails] Apartment selected:", value);
//           const selected = ownerApartments.find((apt) => apt._id === value);
//           if (selected) {
//             handleApartmentChange(selected);
//           }
//         }}
//         items={ownerApartments.map((apt) => ({
//           label: apt.apt_name,
//           value: apt._id,
//         }))}
//       />

//       {checkingChecklist && (
//         <View style={styles.checklistChecking}>
//           <ActivityIndicator size="small" color={COLORS.primary} />
//           <Text style={styles.checklistText}>Checking for checklist...</Text>
//         </View>
//       )}

//       {selectedApartment && (
//         <Animatable.View animation="slideInRight" duration={550}>
//           <SingleApartmentItem apartment={selectedApartment} />
//         </Animatable.View>
//       )}

//       {formData?.aptId && !checkingChecklist && (
//         <View style={styles.checklistStatus}>
//           {checklistStatus.hasChecklist ? (
//             <View style={styles.checklistAvailable}>
//               <MaterialCommunityIcons 
//                 name="checkbox-marked-circle-outline" 
//                 size={24} 
//                 color="#4CAF50" 
//               />
//               <View style={styles.checklistInfo}>
//                 <Text style={styles.checklistName}>
//                   Checklist: {checklistStatus.checklistName}
//                 </Text>
//                 <Text style={styles.checklistTasks}>
//                   {checklistStatus.checklistTasks?.length || 0} tasks configured
//                 </Text>
//               </View>
//             </View>
//           ) : (
//             <View style={styles.checklistMissing}>
//               <MaterialCommunityIcons 
//                 name="alert-circle-outline" 
//                 size={24} 
//                 color="#FF6B6B" 
//               />
//               <View style={styles.checklistInfo}>
//                 <Text style={styles.checklistWarning}>
//                   No checklist found for this property
//                 </Text>
//                 <Text style={styles.checklistInstruction}>
//                   You need to create a checklist before scheduling cleaning
//                 </Text>
//               </View>
//               <TouchableOpacity
//                 style={styles.createChecklistButton}
//                 onPress={handleCreateChecklist}
//               >
//                 <Text style={styles.createChecklistButtonText}>
//                   Create Checklist
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       )}

//       <View style={styles.note}>
//         <Text style={styles.noteText}>
//           Note: Each property must have a cleaning checklist before scheduling.
//         </Text>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   address: {
//     marginVertical: 10,
//   },
//   address_text: {
//     fontSize: 16,
//   },
//   checklistChecking: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF3CD',
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 16,
//     marginBottom: 16,
//   },
//   checklistText: {
//     marginLeft: 8,
//     color: '#856404',
//   },
//   checklistStatus: {
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   checklistAvailable: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#d4edda',
//     padding: 16,
//     borderRadius: 8,
//   },
//   checklistMissing: {
//     backgroundColor: '#f8d7da',
//     padding: 16,
//     borderRadius: 8,
//   },
//   checklistInfo: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   checklistName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#155724',
//   },
//   checklistTasks: {
//     fontSize: 14,
//     color: '#155724',
//     opacity: 0.8,
//   },
//   checklistWarning: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#721c24',
//   },
//   checklistInstruction: {
//     fontSize: 14,
//     color: '#721c24',
//     marginTop: 4,
//   },
//   createChecklistButton: {
//     backgroundColor: '#dc3545',
//     padding: 12,
//     borderRadius: 6,
//     marginTop: 12,
//     alignItems: 'center',
//   },
//   createChecklistButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   note: {
//     marginTop: 20,
//     padding: 12,
//     backgroundColor: '#E8F4FD',
//     borderRadius: 8,
//   },
//   noteText: {
//     color: COLORS.dark,
//     fontSize: 14,
//     fontStyle: 'italic',
//   },
// });



import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import COLORS from '../../../constants/colors';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import * as Animatable from 'react-native-animatable';
import FloatingLabelPickerSelect from '../../../components/shared/FloatingLabelPicker';
import SingleApartmentItem from '../../../components/shared/SingleApartmentItem';
import userService from '../../../services/connection/userService';
import { calculateRoomCleaningTime } from '../../../utils/calculateRoomCleaningTime';
import { calculateCleaningPrice } from '../../../utils/calculateCleaningPrice';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBookingContext } from '../../../context/BookingContext';
import ROUTES from '../../../constants/routes';

export default function PropertyDetails({ 
  selectedProperty, 
  formData, 
  setFormData, 
  validateForm,
  onPropertyChange,
  navigation,
  onChecklistCreated
}) {
  const { currentUserId } = useContext(AuthContext);
  const { setModalVisible, handleCreateSchedule } = useBookingContext();
  
  
  const [ownerApartments, setOwnerApartments] = useState([]);
  const [checkingChecklist, setCheckingChecklist] = useState(false);
  const [checklistStatus, setChecklistStatus] = useState({
    hasChecklist: false,
    checklistId: null,
    checklistName: null,
    checklistTasks: []
  });

  // Use refs to prevent infinite loops
  const initialLoadRef = useRef(true);
  const prevAptIdRef = useRef(null);

  // Single validation effect - simplified
  useEffect(() => {
    // Skip initial mount
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    const isFormValid = formData?.aptId && 
                      (formData?.checklistId || formData?.checklists?.length > 0);
    
    console.log("[PropertyDetails] Validation check:", {
      aptId: formData?.aptId,
      checklistId: formData?.checklistId,
      checklistsLength: formData?.checklists?.length,
      isValid: isFormValid
    });
    
    if (validateForm) {
      validateForm(isFormValid);
    }
  }, [formData?.aptId, formData?.checklistId, formData?.checklists]); // Remove validateForm from dependencies

  // Memoize validateForm callback to prevent unnecessary re-renders
  const memoizedValidateForm = useCallback(() => {
    if (!validateForm) return;
    
    const isFormValid = formData?.aptId && 
                      (formData?.checklistId || formData?.checklists?.length > 0);
    validateForm(isFormValid);
  }, [formData?.aptId, formData?.checklistId, formData?.checklists, validateForm]);

  // Fetch apartments on mount only
  useEffect(() => {
    fetchApartments();
  }, []); // Empty array - runs once on mount

  // Check for checklist when apartment changes - with debouncing logic
  useEffect(() => {
    if (!formData?.aptId || formData.aptId === prevAptIdRef.current) {
      return;
    }
    
    console.log("[PropertyDetails] Apartment changed, checking checklist for:", formData.aptId);
    prevAptIdRef.current = formData.aptId;
    
    const timer = setTimeout(() => {
      checkApartmentChecklist(formData.aptId);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [formData?.aptId]); // Only depend on aptId

  // Memoize fetchApartments function
  const fetchApartments = useCallback(async () => {
    try {
      const response = await userService.getApartment(currentUserId);
      const apartments = response.data;
      setOwnerApartments(apartments);
      console.log("My properties select", apartments);
    } catch (error) {
      console.error('Error fetching apartments:', error);
    }
  }, [currentUserId]);

  // Memoize checkApartmentChecklist function
  const checkApartmentChecklist = useCallback(async (apartmentId) => {
    if (!apartmentId) return;
    
    setCheckingChecklist(true);
    try {
      const apartmentResponse = await userService.getApartmentById(apartmentId);
      const apartment = apartmentResponse.data;
      
      console.log("[PropertyDetails] Apartment data:", {
        id: apartment._id,
        checklists: apartment.checklists,
        default_checklist: apartment.default_checklist
      });
      
      let newChecklistStatus = {
        hasChecklist: false,
        checklistId: null,
        checklistName: null,
        checklistTasks: []
      };
      
      let formDataUpdates = {
        checklists: apartment.checklists || [],
        default_checklist: apartment.default_checklist || null,
        checklistId: null,
        checklistName: null,
        checklistTasks: []
      };
      
      // Check if apartment has checklists
      if (apartment.checklists && apartment.checklists.length > 0) {
        const checklist = apartment.default_checklist 
          ? apartment.checklists.find(c => c._id === apartment.default_checklist)
          : apartment.checklists[0];
        
        if (checklist) {
          newChecklistStatus = {
            hasChecklist: true,
            checklistId: checklist._id,
            checklistName: checklist.checklistName,
            checklistTasks: checklist.checklist?.tasks || []
          };
          
          formDataUpdates = {
            ...formDataUpdates,
            checklistId: checklist._id,
            checklistName: checklist.checklistName,
            checklistTasks: checklist.checklist?.tasks || []
          };
        }
      }
      
      // Update checklist status
      setChecklistStatus(newChecklistStatus);
      
      // Update form data in a single batch
      setFormData(prev => ({
        ...prev,
        ...formDataUpdates
      }));
      
    } catch (error) {
      console.error('Error checking checklist:', error);
      setChecklistStatus({
        hasChecklist: false,
        checklistId: null,
        checklistName: null,
        checklistTasks: []
      });
    } finally {
      setCheckingChecklist(false);
    }
  }, []); // Empty dependency array since we don't use external dependencies

  // Memoize handleApartmentChange
  const handleApartmentChange = useCallback((apartment) => {
    if (!apartment) return;
    
    const cleaningFee = calculateCleaningPrice(apartment.roomDetails);
    const cleaningTime = calculateRoomCleaningTime(apartment.roomDetails);

    const updatedFormData = {
      address: apartment.address,
      aptId: apartment._id,
      apartment_name: apartment.apt_name,
      apartment_latitude: apartment.latitude,
      apartment_longitude: apartment.longitude,
      selected_apt_room_type_and_size: apartment.roomDetails,
      regular_cleaning_fee: cleaningFee,
      regular_cleaning_time: cleaningTime,
      total_cleaning_fee: cleaningFee,
      total_cleaning_time: cleaningTime,
      expected_cleaners: 1,
      group_task: false,
      checklists: apartment.checklists || [],
      default_checklist: apartment.default_checklist || null,
      checklistId: null,
      checklistName: null,
      checklistTasks: []
    };
    
    // Update form data
    setFormData(updatedFormData);
    
    // Notify parent that property changed
    if (onPropertyChange) {
      onPropertyChange(updatedFormData);
    }
  }, [setFormData, onPropertyChange]);

  const handleCreateChecklist = useCallback(() => {
    if (!formData.aptId) {
      Alert.alert('Error', 'Please select an apartment first');
      return;
    }
    
    console.log("[PropertyDetails] Creating checklist for apartment:", formData.aptId);
    
    navigation.navigate(ROUTES.host_create_checklist, {
      propertyId: formData.aptId,
      apartmentName: formData.apartment_name,
      source: 'schedule',
      onChecklistCreated: handleChecklistCreated
    });
    handleCreateSchedule(false)
  }, [formData.aptId, formData.apartment_name, navigation]);

  const handleChecklistCreated = useCallback((checklistData) => {
    console.log("[PropertyDetails] Checklist created callback received:", checklistData);
    
    if (onChecklistCreated) {
      onChecklistCreated(checklistData);
    }
    
    // Re-check checklist after creation
    if (formData.aptId) {
      console.log("[PropertyDetails] Re-checking checklist for apartment:", formData.aptId);
      checkApartmentChecklist(formData.aptId);
    }
  }, [formData.aptId, checkApartmentChecklist, onChecklistCreated]);

  const selectedApartment = ownerApartments.find((apt) => apt._id === formData?.aptId) || null;

  return (
    <View>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Choose Your Property</Text>
      <Text style={{ fontSize: 14, marginBottom: 20, color: COLORS.gray }}>
        Select the Apartment You Want to Schedule for Cleaning
      </Text>

      <FloatingLabelPickerSelect
        label="Select Apartment"
        value={formData?.aptId}
        onValueChange={(value) => {
          console.log("[PropertyDetails] Apartment selected:", value);
          const selected = ownerApartments.find((apt) => apt._id === value);
          if (selected) {
            handleApartmentChange(selected);
          }
        }}
        items={ownerApartments.map((apt) => ({
          label: apt.apt_name,
          value: apt._id,
        }))}
      />

      {checkingChecklist && (
        <View style={styles.checklistChecking}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.checklistText}>Checking for checklist...</Text>
        </View>
      )}

      {selectedApartment && (
        <Animatable.View animation="slideInRight" duration={550}>
          <SingleApartmentItem apartment={selectedApartment} />
        </Animatable.View>
      )}

      {formData?.aptId && !checkingChecklist && (
        <View style={styles.checklistStatus}>
          {checklistStatus.hasChecklist ? (
            <View style={styles.checklistAvailable}>
              <MaterialCommunityIcons 
                name="checkbox-marked-circle-outline" 
                size={24} 
                color="#4CAF50" 
              />
              <View style={styles.checklistInfo}>
                <Text style={styles.checklistName}>
                  Checklist: {checklistStatus.checklistName}
                </Text>
                <Text style={styles.checklistTasks}>
                  {checklistStatus.checklistTasks?.length || 0} tasks configured
                </Text>
              </View>
            </View>
          ) : (
            <>
            <View style={styles.checklistMissing}>
              <MaterialCommunityIcons 
                name="alert-circle-outline" 
                size={24} 
                color="#FF6B6B" 
              />
              <View style={styles.checklistInfo}>
                <Text style={styles.checklistWarning}>
                  No checklist found for this property
                </Text>
          
                <Text style={styles.checklistInstruction}>
                  You need to create a checklist before scheduling cleaning
                </Text>
              </View>
      
            </View>
            <TouchableOpacity
              style={styles.createChecklistButton}
              onPress={handleCreateChecklist}
            >
            <Text style={styles.createChecklistButtonText}>
              Create Checklist
            </Text>
          </TouchableOpacity>
          </>
          )}
        </View>
      )}

      <View style={styles.note}>
        <Text style={styles.noteText}>
          Note: Each property must have a cleaning checklist before scheduling.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  address: {
    marginVertical: 10,
  },
  address_text: {
    fontSize: 16,
  },
  checklistChecking: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  checklistText: {
    marginLeft: 8,
    color: '#856404',
  },
  checklistStatus: {
    marginTop: 0,
    marginBottom: 10,
  },
  checklistAvailable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    padding: 16,
    borderRadius: 8,
  },
  checklistMissing: {
    flexDirection: 'row',
    alignItems: 'flex-start', // 👈 important
    backgroundColor: '#f8d7da',
    padding: 16,
    borderRadius: 8,
  },
  checklistInfo: {
    marginLeft: 12,
    flexShrink: 1,
  },
  checklistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#155724',
  },
  checklistTasks: {
    fontSize: 14,
    color: '#155724',
    opacity: 0.8,
  },
  checklistWarning: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  checklistInstruction: {
    fontSize: 14,
    color: '#721c24',
    marginTop: 4,
  },
  createChecklistButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
    alignItems: 'center',
  },
  createChecklistButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  note: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#E8F4FD',
    borderRadius: 8,
  },
  noteText: {
    color: COLORS.dark,
    fontSize: 14,
    fontStyle: 'italic',
  },
});