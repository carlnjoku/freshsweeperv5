// import React, { useState, useRef, useCallback, useContext } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator } from 'react-native';
// import { TextInput } from 'react-native-paper';
// import { Ionicons, MaterialCommunityIcons, AntDesign, MaterialIcons } from '@expo/vector-icons'; 
// import { useFocusEffect } from '@react-navigation/native';
// import { Camera } from 'expo-camera';
// import userService from '../../../services/connection/userService';
// import { Modal as PaperModal, Portal, Button, useTheme } from 'react-native-paper';
// import COLORS from '../../../constants/colors';
// import Modal from 'react-native-modal';
// import ImageViewer from 'react-native-image-zoom-viewer';
// import { AuthContext } from '../../../context/AuthContext';

// const ReportIncident = ({ scheduleId }) => {

//   const { currentUserId, currentUser } = useContext(AuthContext);

//   const theme = useTheme();
//   const cameraRef = useRef(null);
//   const [incidentModalOpen, setIncidentModalOpen] = useState(false);
//   const [cameraVisible, setCameraVisible] = useState(false);
//   const [incidentImages, setIncidentImages] = useState([]);
//   const [incidentDescription, setIncidentDescription] = useState('');
//   const [incidents, setIncidents] = useState([]);
//   const [facing, setFacing] = useState('back');
//   const [isLoading, setIsLoading] = useState(false);
//   const [imageViewerVisible, setImageViewerVisible] = useState(false);
//   const [currentImages, setCurrentImages] = useState([]);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);

//   // Data fetching
//   const fetchIncidents = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const response = await userService.getIncidents(scheduleId);
//       const schedule = response.data.data;
  
//       // Find the cleaner group with matching cleanerId
//       const cleanerGroup = schedule.assignedTo?.find(
//         (group) => group.cleanerId === currentUserId   // pass cleanerId here
//       );
  
//       const cleanerIncidents = cleanerGroup?.incidents || [];
  
//       console.log("Cleaner incidents:", cleanerIncidents);
//       setIncidents(cleanerIncidents);
//     } catch (error) {
//       console.error("Fetch incidents error:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [scheduleId]);

//   useFocusEffect(
//     useCallback(() => {
//       fetchIncidents();
//       return () => {};
//     }, [fetchIncidents])
//   );

//   // Camera permissions and handling
//   const openCamera = async () => {
//     const { status } = await Camera.requestCameraPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert('Permission required', 'Camera access is needed to take photos');
//       return;
//     }
//     setCameraVisible(true);
//   };

//   const takePicture = async () => {
//     if (cameraRef.current) {
//       try {
//         const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
//         setIncidentImages(prev => [...prev, photo.uri]);
//         setCameraVisible(false);
//       } catch (error) {
//         console.error('Camera error:', error);
//         Alert.alert('Error', 'Failed to capture image');
//       }
//     }
//   };

//   // Image handling
//   const removePhoto = (index) => {
//     setIncidentImages(prev => prev.filter((_, i) => i !== index));
//   };

//   const openImageViewer = (images, index) => {
//     setCurrentImages(images.map(img => ({ url: img.url })));
//     setCurrentImageIndex(index);
//     setImageViewerVisible(true);
//   };
  

//   // Incident CRUD operations
//   const uploadIncident = async () => {
//     if (!incidentDescription.trim()) {
//       Alert.alert('Validation', 'Please enter incident description');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('scheduleId', scheduleId);
//     formData.append('cleanerId', currentUserId);
//     formData.append('description', incidentDescription);

//     incidentImages.forEach((uri, index) => {
//       formData.append('files', {
//         uri,
//         name: `incident_${Date.now()}_${index}.jpg`,
//         type: 'image/jpeg',
//       });
//     });

//     try {
//       setIsLoading(true);
//       const response = await userService.uploadPhotosIncidentPhotos(formData);
      
//       const newIncident = {
//         ...response.data,
//         photos: response.data.uploaded_files || []
//       };
      
//       setIncidents(prev => [...prev, newIncident]);
//       setIncidentImages([]);
//       setIncidentDescription('');
//       setIncidentModalOpen(false);
//     } catch (error) {
//       console.error('Upload error:', error);
//       Alert.alert('Error', 'Failed to submit incident');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleIncidentUpdate = async (updatedIncidents) => {
//     try {
//       setIsLoading(true);
//       await userService.updateScheduleIncidents({
//         scheduleId,
//         cleanerId:currentUserId,
//         incidents: updatedIncidents.map(({ isEditing, tempDescription, ...inc }) => ({
//           ...inc,
//           photos: inc.photos.map(photo => ({
//             url: photo.url,
//             content_type: photo.content_type,
//             original_name: photo.original_name
//           }))
//         }))
//       });
//     } catch (error) {
//       console.error('Update error:', error);
//       Alert.alert('Error', 'Failed to save changes');
//       // Revert to last good state
//       const freshData = await userService.getIncidents(scheduleId);
//       setIncidents(freshData.data?.incidents || []);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleToggleEdit = (incident) => {
//     setIncidents(prev => 
//       prev.map(inc => 
//         inc.reported_at === incident.reported_at
//           ? { ...inc, isEditing: !inc.isEditing, tempDescription: inc.description }
//           : { ...inc, isEditing: false }
//       )
//     );
//   };

//   const handleSaveEdit = (incident) => {
//     const updatedIncidents = incidents.map(inc => 
//       inc.reported_at === incident.reported_at
//         ? { 
//             ...inc, 
//             description: inc.tempDescription, 
//             isEditing: false,
//             tempDescription: ''
//           }
//         : inc
//     );
    
//     setIncidents(updatedIncidents);
//     handleIncidentUpdate(updatedIncidents);
//   };

//   const handleDeleteImage = (incidentId, imageUrl) => {
//     const updatedIncidents = incidents.map(inc => 
//       inc.reported_at === incidentId
//         ? { ...inc, photos: inc.photos.filter(photo => photo.url !== imageUrl) }
//         : inc
//     );
    
//     setIncidents(updatedIncidents);
//     handleIncidentUpdate(updatedIncidents);
//   };

//   const handleDescriptionChange = (text, incident) => {
//     setIncidents(prev => 
//       prev.map(inc => 
//         inc.reported_at === incident.reported_at
//           ? { ...inc, tempDescription: text }
//           : inc
//       )
//     );
//   };

//   // UI Components
//   const EmptyPlaceholder = () => (
//     <View style={styles.emptyContainer}>
//       <MaterialIcons name="error-outline" size={48} color={COLORS.gray} />
//       <Text style={styles.emptyText}>No incidents reported yet</Text>
//     </View>
//   );

//   const isEditingAny = incidents.some(inc => inc.isEditing);

//   return (
//     <View style={[styles.container, { backgroundColor: COLORS.white }]}>
//       {/* Image Viewer Modal */}
//       <Modal
//         isVisible={imageViewerVisible}
//         style={styles.fullScreenModal}
//         onBackdropPress={() => setImageViewerVisible(false)}
//       >
        
//         <ImageViewer
//           imageUrls={currentImages}
//           index={currentImageIndex}
//           enableSwipeDown
//           onSwipeDown={() => setImageViewerVisible(false)}
//           backgroundColor="black"
//           renderHeader={() => (
//             <TouchableOpacity
//               style={styles.viewerCloseButton}
//               onPress={() => setImageViewerVisible(false)}
//             >
//               <Ionicons name="close" size={28} color="white" />
//             </TouchableOpacity>
//           )}
//         />
//       </Modal>

//       {/* Loading Indicator */}
//       {isLoading && (
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//         </View>
//       )}

//       {/* Incidents List */}
//       <FlatList
//         data={incidents}
//         keyExtractor={(item, index) => {
//           // Handle cases where item might be undefined/null
//           if (item && item.reported_at) {
//             return item.reported_at.toString();
//           }
//           // Fallback to index-based key if reported_at is missing
//           return `incident-${index}`;
//         }}
//         ListHeaderComponent={<Text style={styles.headline}>Incident Reports</Text>}
//         ListEmptyComponent={!isLoading && EmptyPlaceholder}
//         renderItem={({ item }) => (
//           <View style={styles.incidentContainer}>
//             {/* Incident Images */}
//             <FlatList
//               horizontal
//               data={item.photos}
//               keyExtractor={(photo, index) => `${item.reported_at}-${index}`}
//               renderItem={({ item: photo, index }) => (
//                 <View style={styles.imageContainer}>
//                   <TouchableOpacity onPress={() => openImageViewer(item.photos, index)}>
//                     <Image 
//                       source={{ uri: photo.url }} 
//                       style={styles.incidentImage}
//                     />
//                   </TouchableOpacity>
//                   <TouchableOpacity 
//                     style={styles.deleteButton} 
//                     onPress={() => handleDeleteImage(item.reported_at, photo.url)}
//                   >
//                     <AntDesign name="closecircle" size={20} color="red" />
//                   </TouchableOpacity>
//                 </View>
//               )}
//             />

//             {/* Incident Description */}
//             <View style={styles.editRow}>
//               <Text style={styles.descriptionLabel}>Incident Description</Text>
//               <TouchableOpacity 
//                 onPress={() => handleToggleEdit(item)} 
//                 style={styles.editIcon}
//               >
//                 <MaterialIcons 
//                   name={item.isEditing ? "cancel" : "edit"} 
//                   size={18} 
//                   color={COLORS.deepBlue} 
//                 />
//               </TouchableOpacity>
//             </View>

//             {item.isEditing ? (
//               <View>
//                 <TextInput
//                   label="Describe the incident..."
//                   mode="outlined"
//                   multiline
//                   outlineColor="#D8D8D8"
//                   activeOutlineColor={COLORS.primary}
//                   style={styles.descriptionInput}
//                   value={item.tempDescription}
//                   onChangeText={(text) => handleDescriptionChange(text, item)}
//                 />
//                 <TouchableOpacity 
//                   style={styles.saveButton} 
//                   onPress={() => handleSaveEdit(item)}
//                   disabled={isLoading}
//                 >
//                   <Text style={styles.saveButtonText}>
//                     {isLoading ? 'Saving...' : 'Save Changes'}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               <Text style={styles.incidentDescription}>{item.description}</Text>
//             )}
//           </View>
//         )}
//       />

//       {/* Add Incident Button (conditional) */}
//       {!isEditingAny && (
//         <Button 
//           mode="contained" 
//           onPress={() => setIncidentModalOpen(true)}
//           style={styles.addButton}
//           labelStyle={styles.buttonLabel}
//         >
//           Add Incident
//         </Button>
//       )}

//       {/* Incident Creation Modal */}
//       <Portal>
//         <PaperModal
//           visible={incidentModalOpen}
//           onDismiss={() => setIncidentModalOpen(false)}
//           contentContainerStyle={styles.modalContainer}
//         >
//           <Text style={styles.modalTitle}>Report Incident</Text>
          
//           <Button 
//             mode="contained" 
//             onPress={openCamera}
//             style={styles.modalButton}
//             icon="camera"
//           >
//             Take Photo
//           </Button>

//           {/* Image Previews */}
//           {incidentImages.length > 0 && (
//             <FlatList
//               horizontal
//               data={incidentImages}
//               keyExtractor={(item, index) => `preview-${index}`}
//               contentContainerStyle={styles.imageList}
//               renderItem={({ item, index }) => (
//                 <View style={styles.imageContainer}>
//                   <Image source={{ uri: item }} style={styles.previewImage} />
//                   <TouchableOpacity 
//                     style={styles.removePreviewButton}
//                     onPress={() => removePhoto(index)}
//                   >
//                     <AntDesign name="close" size={16} color="white" />
//                   </TouchableOpacity>
//                 </View>
//               )}
//             />
//           )}

//           <TextInput
//             label="Incident description"
//             placeholder="Describe what happened..."
//             mode="outlined"
//             multiline
//             value={incidentDescription}
//             onChangeText={setIncidentDescription}
//             style={styles.descriptionInput}
//           />

//           <View style={styles.modalButtonRow}>
//             <Button 
//               mode="outlined" 
//               onPress={() => {
//                 setIncidentModalOpen(false);
//                 setIncidentImages([]);
//               }}
//               style={styles.modalButton}
//             >
//               Cancel
//             </Button>
//             <Button 
//               mode="contained" 
//               onPress={uploadIncident}
//               style={styles.modalButton}
//               disabled={isLoading || incidentImages.length === 0}
//             >
//               {isLoading ? 'Submitting...' : 'Submit Report'}
//             </Button>
//           </View>
//         </PaperModal>


//       <Modal
//         isVisible={cameraVisible}
//         style={styles.fullScreenModal}
//         onBackdropPress={() => setCameraVisible(false)}
//       >
//         <Camera
//           style={styles.cameraView}
//           type={facing === 'front' ? Camera.Constants.Type.front : Camera.Constants.Type.back}
//           ref={cameraRef}
//         >
//           <View style={styles.cameraControls}>
//             <Button 
//               icon="close" 
//               mode="outlined" 
//               onPress={() => setCameraVisible(false)}
//               style={styles.cameraButton}
//               labelStyle={styles.buttonLabel}
//             />
//             <Button 
//               icon="camera" 
//               mode="contained" 
//               onPress={takePicture}
//               style={styles.cameraButton}
//               labelStyle={styles.buttonLabel}
//             />
//             <Button 
//               icon="camera-flip" 
//               mode="outlined" 
//               onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
//               style={styles.cameraButton}
//               labelStyle={styles.buttonLabel}
//             />
//           </View>
//         </Camera>
//       </Modal>
//       </Portal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//   },
//   headline: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     color: COLORS.deepBlue,
//   },
//   incidentContainer: {
//     marginBottom: 24,
//     padding: 16,
//     borderRadius: 8,
//     backgroundColor: '#F8F9FA',
//     elevation: 2,
//   },
//   imageContainer: {
//     marginRight: 8,
//     marginBottom: 12,
//     position: 'relative',
//   },
//   incidentImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 8,
//   },
//   previewImage: {
//     width: 80,
//     height: 80,
//     borderRadius: 4,
//     marginRight: 8,
//   },
//   deleteButton: {
//     position: 'absolute',
//     top: -8,
//     right: -8,
//     backgroundColor: 'white',
//     borderRadius: 10,
//   },
//   removePreviewButton: {
//     position: 'absolute',
//     top: 4,
//     right: 4,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     borderRadius: 10,
//     padding: 4,
//   },
//   editRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   descriptionLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.darkGray,
//   },
//   incidentDescription: {
//     fontSize: 14,
//     color: COLORS.text,
//     lineHeight: 20,
//   },
//   descriptionInput: {
//     marginBottom: 10,
//     fontSize: 14,
//     width: '100%',
//     minHeight: 100,
//     backgroundColor: '#fff',
//   },
//   saveButton: {
//     backgroundColor: COLORS.primary,
//     padding: 8,
//     borderRadius: 4,
//     alignItems: 'center',
//   },
//   saveButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   addButton: {
//     marginTop: 16,
//     backgroundColor: COLORS.primary,
//   },
//   buttonLabel: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 50,
//   },
//   emptyText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: COLORS.gray,
//   },
//   loaderContainer: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.7)',
//     zIndex: 10,
//   },
//   modalContainer: {
//     backgroundColor: 'white',
//     padding: 20,
//     margin: 20,
//     borderRadius: 8,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   modalButton: {
//     marginVertical: 8,
//   },
//   modalButtonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 16,
//   },
//   imageList: {
//     marginVertical: 12,
//   },
//   cameraModalContainer: {
//     backgroundColor: 'black',
//     padding: 0,
//     margin: 0,
//     flex: 1,
//   },
  
  
//   viewerCloseButton: {
//     position: 'absolute',
//     top: 40,
//     right: 20,
//     zIndex: 1,
//   },


//   fullScreenModal: {
//     margin: 0,
//   },
//   cameraView: {
//     flex: 1,
//     justifyContent: 'flex-end',
//   },
//   cameraControls: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     padding: 20,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   cameraButton: {
//     paddingHorizontal: 20,
//   },
// });

// export default ReportIncident;




// import React, { useState, useRef, useCallback, useContext } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
// import { TextInput } from 'react-native-paper';
// import { Ionicons, MaterialCommunityIcons, AntDesign, MaterialIcons } from '@expo/vector-icons'; 
// import { useFocusEffect } from '@react-navigation/native';
// import { Camera } from 'expo-camera';
// import userService from '../../../services/connection/userService';
// import { Modal as PaperModal, Portal, Button, useTheme } from 'react-native-paper';
// import COLORS from '../../../constants/colors';
// import Modal from 'react-native-modal';
// import ImageViewer from 'react-native-image-zoom-viewer';
// import { AuthContext } from '../../../context/AuthContext';
// import CardNoPrimary from '../../../components/shared/CardNoPrimary';
// import { Image } from 'expo-image';
// import CustomActivityIndicator from '../../../components/shared/CuustomActivityIndicator';

// const ReportIncident = ({ scheduleId }) => {
//   const { currentUserId, currentUser } = useContext(AuthContext);
//   const theme = useTheme();
//   const cameraRef = useRef(null);
//   const [incidentModalOpen, setIncidentModalOpen] = useState(false);
//   const [cameraVisible, setCameraVisible] = useState(false);
//   const [incidentImages, setIncidentImages] = useState([]);
//   const [incidentDescription, setIncidentDescription] = useState('');
//   const [incidents, setIncidents] = useState([]);
//   const [facing, setFacing] = useState('back');
//   const [isLoading, setIsLoading] = useState(false);
//   const [imageViewerVisible, setImageViewerVisible] = useState(false);
//   const [currentImages, setCurrentImages] = useState([]);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [isUploading, setIsUploading] = useState(false);

//   // Data fetching
//   const fetchIncidents = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const response = await userService.getIncidents(scheduleId);
//       const schedule = response.data.data;
  
//       const cleanerGroup = schedule.assignedTo?.find(
//         (group) => group.cleanerId === currentUserId
//       );
  
//       const cleanerIncidents = cleanerGroup?.incidents || [];
//       setIncidents(cleanerIncidents);
//     } catch (error) {
//       console.error("Fetch incidents error:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [scheduleId]);

//   useFocusEffect(
//     useCallback(() => {
//       fetchIncidents();
//       return () => {};
//     }, [fetchIncidents])
//   );

//   // Camera permissions and handling
//   const openCamera = async () => {
//     const { status } = await Camera.requestCameraPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert('Permission required', 'Camera access is needed to take photos');
//       return;
//     }
//     setCameraVisible(true);
//   };

//   const takePicture = async () => {
//     if (cameraRef.current) {
//       try {
//         const photo = await cameraRef.current.takePictureAsync({ 
//           quality: 0.8,
//           // Don't use base64 when we need file URIs for FormData
//           base64: false 
//         });
        
//         const photoData = {
//           filename: `incident_${Date.now()}.jpg`,
//           uri: photo.uri,
//           type: 'image/jpeg'
//         };
        
//         setIncidentImages(prev => [...prev, photoData]);
//         console.log('Photo captured:', photoData);
//       } catch (error) {
//         console.error('Camera error:', error);
//         Alert.alert('Error', 'Failed to capture image');
//       }
//     }
//   };

//   // Image handling
//   const removePhoto = (index) => {
//     setIncidentImages(prev => prev.filter((_, i) => i !== index));
//   };

//   const openImageViewer = (images, index) => {
//     const formattedImages = images.map(img => ({ 
//       url: img.url,
//       props: { source: { uri: img.url } }
//     }));
//     setCurrentImages(formattedImages);
//     setCurrentImageIndex(index);
//     setImageViewerVisible(true);
//   };

//   // Incident CRUD operations
//   const uploadIncident = async () => {
//     if (!incidentDescription.trim()) {
//       Alert.alert('Validation', 'Please enter incident description');
//       return;
//     }
  
//     if (incidentImages.length === 0) {
//       Alert.alert('Validation', 'Please add at least one photo');
//       return;
//     }
  
//     try {
//       setIsUploading(true);
      
//       // Create FormData object
//       const formData = new FormData();
//       formData.append('scheduleId', scheduleId);
//       formData.append('cleanerId', currentUserId);
//       formData.append('description', incidentDescription);
  
//       // Append each image file to FormData
//       incidentImages.forEach((image, index) => {
//         // Convert base64 to blob or use the original file data
//         formData.append('files', {
//           uri: image.uri,
//           name: `incident_${Date.now()}_${index}.jpg`,
//           type: 'image/jpeg',
//         });
//       });
  
//       console.log('Submitting incident with FormData:', {
//         scheduleId,
//         cleanerId: currentUserId,
//         description: incidentDescription,
//         imageCount: incidentImages.length
//       });
  
//       const response = await userService.uploadPhotosIncidentPhotos(formData);
      
//       const newIncident = {
//         ...response.data,
//         photos: response.data.uploaded_files || []
//       };

      
      
//       setIncidents(prev => [...prev, newIncident]);
//       setIncidentImages([]);
//       setIncidentDescription('');
//       setIncidentModalOpen(false);
//       Alert.alert('Success', 'Incident reported successfully');
//     } catch (error) {
//       console.error('Upload error:', error);
//       Alert.alert('Error', 'Failed to submit incident');
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleIncidentUpdate = async (updatedIncidents) => {
//     try {
//       setIsLoading(true);
//       await userService.updateScheduleIncidents({
//         scheduleId,
//         cleanerId: currentUserId,
//         incidents: updatedIncidents.map(({ isEditing, tempDescription, ...inc }) => ({
//           ...inc,
//           photos: inc.photos.map(photo => ({
//             url: photo.url,
//             content_type: photo.content_type,
//             original_name: photo.original_name
//           }))
//         }))
//       });
//     } catch (error) {
//       console.error('Update error:', error);
//       Alert.alert('Error', 'Failed to save changes');
//       const freshData = await userService.getIncidents(scheduleId);
//       setIncidents(fresh.data?.incidents || []);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleToggleEdit = (incident) => {
//     setIncidents(prev => 
//       prev.map(inc => 
//         inc.reported_at === incident.reported_at
//           ? { ...inc, isEditing: !inc.isEditing, tempDescription: inc.description }
//           : { ...inc, isEditing: false }
//       )
//     );
//   };

//   const handleSaveEdit = (incident) => {
//     const updatedIncidents = incidents.map(inc => 
//       inc.reported_at === incident.reported_at
//         ? { 
//             ...inc, 
//             description: inc.tempDescription, 
//             isEditing: false,
//             tempDescription: ''
//           }
//         : inc
//     );
    
//     setIncidents(updatedIncidents);
//     handleIncidentUpdate(updatedIncidents);
//   };

//   const handleDeleteImage = (incidentId, imageUrl) => {
//     const updatedIncidents = incidents.map(inc => 
//       inc.reported_at === incidentId
//         ? { ...inc, photos: inc.photos.filter(photo => photo.url !== imageUrl) }
//         : inc
//     );
    
//     setIncidents(updatedIncidents);
//     handleIncidentUpdate(updatedIncidents);
//   };

//   const handleDescriptionChange = (text, incident) => {
//     setIncidents(prev => 
//       prev.map(inc => 
//         inc.reported_at === incident.reported_at
//           ? { ...inc, tempDescription: text }
//           : inc
//       )
//     );
//   };

//   // UI Components
//   const EmptyPlaceholder = () => (
//     <View style={styles.emptyContainer}>
//       <View style={styles.emptyIcon}>
//         <Ionicons name="shield-checkmark" size={48} color={COLORS.lightGray} />
//       </View>
//       <Text style={styles.emptyTitle}>No Incidents Reported</Text>
//       <Text style={styles.emptySubtitle}>
//         Great job! No issues have been reported for this cleaning session.
//       </Text>
//     </View>
//   );

//   const IncidentImageThumbnail = ({ photo, index, onDelete, onPress }) => (
//     <View style={styles.thumbnailContainer}>
//       <TouchableOpacity onPress={onPress}>
//         <Image 
//           source={{ uri: photo.url }} 
//           style={styles.incidentImage}
//           transition={300}
//           cachePolicy="memory-disk"
//         />
        
//       </TouchableOpacity>
//       <TouchableOpacity 
//         style={styles.deleteButton} 
//         onPress={onDelete}
//       >
//         <Ionicons name="close-circle" size={20} color="white" />
//       </TouchableOpacity>
//       <View style={styles.photoNumber}>
//         <Text style={styles.photoNumberText}>{index + 1}</Text>
//       </View>
//     </View>
//   );

//   const renderIncidentItem = ({ item }) => (
//     <CardNoPrimary key={item.reported_at}>
//       <View style={styles.incidentCard}>
//         {/* Incident Header */}
//         <View style={styles.incidentHeader}>
//           <View style={styles.headerLeft}>
//             <View style={styles.incidentIcon}>
//               <Ionicons name="warning" size={20} color="#d32f2f" />
//             </View>
//             <View>
//               <Text style={styles.incidentTitle}>Incident Report</Text>
//               <Text style={styles.incidentDate}>
//                 {new Date(item.reported_at).toLocaleDateString()}
//               </Text>
//             </View>
//           </View>
//           <TouchableOpacity 
//             onPress={() => handleToggleEdit(item)} 
//             style={styles.editButton}
//           >
//             <Ionicons 
//               name={item.isEditing ? "close" : "create-outline"} 
//               size={20} 
//               color={COLORS.primary} 
//             />
//           </TouchableOpacity>
//         </View>

//         {/* Incident Images */}
//         <FlatList
//           horizontal
//           data={item.photos}
//           keyExtractor={(photo, index) => `${item.reported_at}-${index}`}
//           renderItem={({ item: photo, index }) => (
//             <IncidentImageThumbnail
//               photo={photo}
//               index={index}
//               onDelete={() => handleDeleteImage(item.reported_at, photo.url)}
//               onPress={() => openImageViewer(item.photos, index)}
//             />
//           )}
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.imagesContainer}
//           ListEmptyComponent={
//             <View style={styles.noPhotos}>
//               <Ionicons name="images-outline" size={32} color="#ddd" />
//               <Text style={styles.noPhotosText}>No photos</Text>
//             </View>
//           }
//         />

//         {/* Incident Description */}
//         <View style={styles.descriptionSection}>
//           <Text style={styles.descriptionLabel}>Description</Text>
//           {item.isEditing ? (
//             <View>
//               <TextInput
//                 label="Describe the incident..."
//                 mode="outlined"
//                 multiline
//                 numberOfLines={4}
//                 outlineColor="#D8D8D8"
//                 activeOutlineColor={COLORS.primary}
//                 style={styles.descriptionInput}
//                 value={item.tempDescription}
//                 onChangeText={(text) => handleDescriptionChange(text, item)}
//               />
//               <TouchableOpacity 
//                 style={styles.saveButton} 
//                 onPress={() => handleSaveEdit(item)}
//                 disabled={isLoading}
//               >
//                 <Ionicons name="checkmark" size={18} color="white" />
//                 <Text style={styles.saveButtonText}>
//                   {isLoading ? 'Saving...' : 'Save Changes'}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           ) : (
//             <Text style={styles.incidentDescription}>{item.description}</Text>
//           )}
//         </View>
//       </View>
//     </CardNoPrimary>
//   );

//   const isEditingAny = incidents.some(inc => inc.isEditing);

//   return (
//     <View style={styles.container}>
//       {/* Image Viewer Modal */}
//       <Modal
//         isVisible={imageViewerVisible}
//         style={styles.fullScreenModal}
//         onBackdropPress={() => setImageViewerVisible(false)}
//       >
//         <View style={styles.modalContainer}>
//           <ImageViewer
//             imageUrls={currentImages}
//             index={currentImageIndex}
//             enableSwipeDown
//             onSwipeDown={() => setImageViewerVisible(false)}
//             backgroundColor="black"
//           />
//           <TouchableOpacity
//             style={styles.viewerCloseButton}
//             onPress={() => setImageViewerVisible(false)}
//           >
//             <Ionicons name="close" size={28} color="white" />
//           </TouchableOpacity>
//         </View>
//       </Modal>

//       {/* Loading Indicator */}
//       {isLoading && (
//         <View style={styles.loaderContainer}>
//           <CustomActivityIndicator size={40} />
//         </View>
//       )}

//       {/* Incidents List */}
//       <FlatList
//         data={incidents}
//         keyExtractor={(item, index) => item?.reported_at ? item.reported_at.toString() : `incident-${index}`}
//         ListHeaderComponent={
//           <View style={styles.header}>
//             <View style={styles.headerIcon}>
//               <Ionicons name="document-text-outline" size={32} color={COLORS.primary} />
//             </View>
//             <Text style={styles.headline}>Incident Reports</Text>
//             <Text style={styles.subtitle}>Document any issues or concerns during cleaning</Text>
            
//             <View style={styles.infoCard}>
//               <Ionicons name="information-circle" size={20} color={COLORS.warning} />
//               <Text style={styles.infoText}>
//                 Report any damages, missing items, or other issues encountered during cleaning.
//               </Text>
//             </View>
//           </View>
//         }
//         ListEmptyComponent={!isLoading && EmptyPlaceholder}
//         renderItem={renderIncidentItem}
//         contentContainerStyle={styles.listContainer}
//       />

//       {/* Add Incident Button */}
//       {!isEditingAny && (
//         <TouchableOpacity 
//           style={styles.addButton}
//           onPress={() => setIncidentModalOpen(true)}
//         >
//           <Ionicons name="add-circle" size={22} color="white" />
//           <Text style={styles.addButtonText}>Report Incident</Text>
//         </TouchableOpacity>
//       )}

//       {/* Incident Creation Modal */}
//       <Portal>
//         <PaperModal
//           visible={incidentModalOpen}
//           onDismiss={() => setIncidentModalOpen(false)}
//           contentContainerStyle={styles.creationModal}
//         >
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>Report New Incident</Text>
//             <TouchableOpacity 
//               onPress={() => setIncidentModalOpen(false)}
//               style={styles.modalCloseButton}
//             >
//               <Ionicons name="close" size={24} color={COLORS.dark} />
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity 
//             style={styles.cameraButton}
//             onPress={openCamera}
//           >
//             <Ionicons name="camera" size={24} color={COLORS.primary} />
//             <Text style={styles.cameraButtonText}>Take Photo</Text>
//           </TouchableOpacity>

//           {/* Image Previews */}
//           {incidentImages.length > 0 && (
//             <View style={styles.previewSection}>
//               <Text style={styles.previewTitle}>Captured Photos ({incidentImages.length})</Text>
//               <FlatList
//                 horizontal
//                 data={incidentImages}
//                 keyExtractor={(item, index) => `preview-${index}`}
//                 contentContainerStyle={styles.previewContainer}
//                 renderItem={({ item, index }) => (
//                   <View style={styles.previewImageContainer}>
//                     <Image source={{ uri: item.uri }} style={styles.previewImage} />
//                     <TouchableOpacity 
//                       style={styles.removePreviewButton}
//                       onPress={() => removePhoto(index)}
//                     >
//                       <Ionicons name="close" size={16} color="white" />
//                     </TouchableOpacity>
//                     <View style={styles.previewNumber}>
//                       <Text style={styles.previewNumberText}>{index + 1}</Text>
//                     </View>
//                   </View>
//                 )}
//               />
//             </View>
//           )}

//           <TextInput
//             label="Incident description"
//             placeholder="Describe what happened..."
//             mode="outlined"
//             multiline
//             numberOfLines={4}
//             value={incidentDescription}
//             onChangeText={setIncidentDescription}
//             style={styles.modalDescriptionInput}
//             outlineColor="#D8D8D8"
//             activeOutlineColor={COLORS.primary}
//           />

//           <View style={styles.modalActions}>
//             <TouchableOpacity 
//               style={styles.cancelButton}
//               onPress={() => {
//                 setIncidentModalOpen(false);
//                 setIncidentImages([]);
//                 setIncidentDescription('');
//               }}
//             >
//               <Text style={styles.cancelButtonText}>Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={[
//                 styles.submitButton,
//                 (!incidentDescription.trim() || incidentImages.length === 0) && styles.submitButtonDisabled
//               ]}
//               onPress={uploadIncident}
//               disabled={isUploading || !incidentDescription.trim() || incidentImages.length === 0}
//             >
//               {isUploading ? (
//                 <ActivityIndicator size="small" color="white" />
//               ) : (
//                 <>
//                   <Ionicons name="cloud-upload" size={18} color="white" />
//                   <Text style={styles.submitButtonText}>Submit Report</Text>
//                 </>
//               )}
//             </TouchableOpacity>
//           </View>
//         </PaperModal>
//       </Portal>

//       {/* Camera Modal */}
//       <Modal
//         isVisible={cameraVisible}
//         style={styles.fullScreenModal}
//         onBackdropPress={() => setCameraVisible(false)}
//       >
//         <Camera
//           style={styles.cameraView}
//           type={facing}
//           ref={cameraRef}
//         >
//           <View style={styles.cameraHeader}>
//             <TouchableOpacity 
//               onPress={() => setCameraVisible(false)}
//               style={styles.cameraCloseButton}
//             >
//               <Ionicons name="close" size={28} color="white" />
//             </TouchableOpacity>
//           </View>
          
//           <View style={styles.cameraControls}>
//             <TouchableOpacity 
//               style={styles.flipButton}
//               onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
//             >
//               <Ionicons name="camera-reverse" size={28} color="white" />
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={styles.captureButton}
//               onPress={takePicture}
//             >
//               <View style={styles.captureButtonInner}>
//                 <Ionicons name="camera" size={32} color="white" />
//               </View>
//             </TouchableOpacity>
            
//             <View style={styles.photoCounter}>
//               <Text style={styles.photoCounterText}>
//                 {incidentImages.length} photo{incidentImages.length !== 1 ? 's' : ''}
//               </Text>
//             </View>
//           </View>
//         </Camera>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   header: {
//     padding: 20,
//     backgroundColor: 'white',
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   headerIcon: {
//     alignSelf: 'center',
//     backgroundColor: '#e3f2fd',
//     padding: 12,
//     borderRadius: 50,
//     marginBottom: 12,
//   },
//   headline: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#1a1a1a',
//     textAlign: 'center',
//     marginBottom: 4,
//     letterSpacing: -0.5,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 16,
//     fontWeight: '400',
//   },
//   infoCard: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     padding: 16,
//     backgroundColor: '#fff3cd',
//     borderRadius: 12,
//     borderLeftWidth: 4,
//     borderLeftColor: COLORS.warning,
//   },
//   infoText: {
//     flex: 1,
//     fontSize: 14,
//     color: '#856404',
//     marginLeft: 12,
//     lineHeight: 20,
//   },
//   listContainer: {
//     padding: 16,
//   },
//   incidentCard: {
//     padding: 16,
//   },
//   incidentHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 16,
//   },
//   headerLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   incidentIcon: {
//     backgroundColor: '#ffebee',
//     padding: 8,
//     borderRadius: 10,
//     marginRight: 12,
//   },
//   incidentTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginBottom: 2,
//   },
//   incidentDate: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '400',
//   },
//   editButton: {
//     padding: 8,
//   },
//   imagesContainer: {
//     paddingVertical: 8,
//   },
//   thumbnailContainer: {
//     marginRight: 12,
//     marginBottom: 8,
//     position: 'relative',
//   },
//   incidentImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 12,
//     backgroundColor: '#f0f0f0',
//   },
//   deleteButton: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     padding: 4,
//     borderRadius: 10,
//   },
//   photoNumber: {
//     position: 'absolute',
//     top: 8,
//     left: 8,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   photoNumberText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: '600',
//   },
//   noPhotos: {
//     width: 100,
//     height: 100,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     borderStyle: 'dashed',
//   },
//   noPhotosText: {
//     fontSize: 12,
//     color: '#999',
//     marginTop: 4,
//   },
//   descriptionSection: {
//     marginTop: 8,
//   },
//   descriptionLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginBottom: 8,
//   },
//   descriptionInput: {
//     backgroundColor: 'white',
//   },
//   incidentDescription: {
//     fontSize: 14,
//     color: '#1a1a1a',
//     lineHeight: 20,
//     backgroundColor: '#f8f9fa',
//     padding: 12,
//     borderRadius: 8,
//   },
//   saveButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 12,
//   },
//   saveButtonText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     padding: 40,
//     marginTop: 20,
//   },
//   emptyIcon: {
//     backgroundColor: '#f0f0f0',
//     padding: 20,
//     borderRadius: 50,
//     marginBottom: 16,
//   },
//   emptyTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#666',
//     marginBottom: 8,
//   },
//   emptySubtitle: {
//     fontSize: 14,
//     color: '#999',
//     textAlign: 'center',
//     lineHeight: 20,
//   },
//   addButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     padding: 16,
//     margin: 16,
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   addButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   creationModal: {
//     backgroundColor: 'white',
//     margin: 20,
//     borderRadius: 16,
//     padding: 0,
//     overflow: 'hidden',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1a1a1a',
//   },
//   modalCloseButton: {
//     padding: 4,
//   },
//   cameraButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     margin: 20,
//     backgroundColor: '#f8f9fa',
//     borderRadius: 12,
//     borderWidth: 1.5,
//     borderColor: '#e0e0e0',
//   },
//   cameraButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginLeft: 12,
//   },
//   previewSection: {
//     paddingHorizontal: 20,
//     marginBottom: 16,
//   },
//   previewTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#666',
//     marginBottom: 12,
//   },
//   previewContainer: {
//     paddingVertical: 8,
//   },
//   previewImageContainer: {
//     marginRight: 12,
//     position: 'relative',
//   },
//   previewImage: {
//     width: 80,
//     height: 80,
//     borderRadius: 8,
//   },
//   removePreviewButton: {
//     position: 'absolute',
//     top: 4,
//     right: 4,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     borderRadius: 10,
//     padding: 4,
//   },
//   previewNumber: {
//     position: 'absolute',
//     top: 4,
//     left: 4,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 4,
//     paddingVertical: 2,
//     borderRadius: 6,
//   },
//   previewNumberText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: '600',
//   },
//   modalDescriptionInput: {
//     marginHorizontal: 20,
//     marginBottom: 20,
//     backgroundColor: 'white',
//   },
//   modalActions: {
//     flexDirection: 'row',
//     padding: 20,
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//     gap: 12,
//   },
//   cancelButton: {
//     flex: 1,
//     padding: 14,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     alignItems: 'center',
//   },
//   cancelButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#666',
//   },
//   submitButton: {
//     flex: 2,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     padding: 14,
//     borderRadius: 8,
//   },
//   submitButtonDisabled: {
//     backgroundColor: '#ccc',
//   },
//   submitButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   fullScreenModal: {
//     margin: 0,
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'black',
//   },
//   viewerCloseButton: {
//     position: 'absolute',
//     top: 50,
//     right: 20,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     borderRadius: 20,
//     padding: 8,
//     zIndex: 1,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(255,255,255,0.9)',
//     zIndex: 10,
//   },
//   cameraView: {
//     flex: 1,
//   },
//   cameraHeader: {
//     position: 'absolute',
//     top: 50,
//     left: 0,
//     right: 0,
//     zIndex: 1,
//     paddingHorizontal: 20,
//   },
//   cameraCloseButton: {
//     alignSelf: 'flex-end',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     borderRadius: 20,
//     padding: 8,
//   },
//   cameraControls: {
//     position: 'absolute',
//     bottom: 40,
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 40,
//   },
//   flipButton: {
//     padding: 12,
//   },
//   captureButton: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   captureButtonInner: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: 'rgba(255,255,255,0.3)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 3,
//     borderColor: 'white',
//   },
//   photoCounter: {
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//   },
//   photoCounterText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//   },
// });

// export default ReportIncident;




// import React, { useState, useRef, useCallback, useContext, useEffect } from 'react';
// import { 
//   View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, 
//   ActivityIndicator, Dimensions, SafeAreaView, Platform 
// } from 'react-native';
// import { TextInput } from 'react-native-paper';
// import { Ionicons } from '@expo/vector-icons'; 
// import { useFocusEffect } from '@react-navigation/native';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import * as ImagePicker from 'expo-image-picker';
// import userService from '../../../services/connection/userService';
// import { Modal as PaperModal, Portal } from 'react-native-paper';
// import COLORS from '../../../constants/colors';
// import RNModal from 'react-native-modal';
// import ImageViewer from 'react-native-image-zoom-viewer';
// import { AuthContext } from '../../../context/AuthContext';
// import CardNoPrimary from '../../../components/shared/CardNoPrimary';
// import { Image } from 'expo-image';
// import CustomActivityIndicator from '../../../components/shared/CuustomActivityIndicator';

// const { width, height } = Dimensions.get('window');

// const ReportIncident = ({ scheduleId }) => {
//   const { currentUserId } = useContext(AuthContext);
//   const cameraRef = useRef(null);
//   const [incidentModalOpen, setIncidentModalOpen] = useState(false);
//   const [cameraVisible, setCameraVisible] = useState(false);
//   const [incidentImages, setIncidentImages] = useState([]);
//   const [incidentDescription, setIncidentDescription] = useState('');
//   const [incidents, setIncidents] = useState([]);
//   const [facing, setFacing] = useState('back');
//   const [isLoading, setIsLoading] = useState(false);
//   const [imageViewerVisible, setImageViewerVisible] = useState(false);
//   const [currentImages, setCurrentImages] = useState([]);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [isUploading, setIsUploading] = useState(false);
//   const [permission, requestPermission] = useCameraPermissions();
//   const [editingDescription, setEditingDescription] = useState('');
//   const [editingIncidentId, setEditingIncidentId] = useState(null);
//   const [isCameraReady, setIsCameraReady] = useState(false);
//   const [isSimulator, setIsSimulator] = useState(false);
  
//   const MAX_IMAGES_UPLOAD = 5;

//   // Check if running on simulator
//   useEffect(() => {
//     // Check if we're likely on a simulator (iOS Simulator doesn't have camera)
//     if (Platform.OS === 'ios') {
//       // This is a common check for simulator
//       const checkSimulator = async () => {
//         try {
//           // Try to access camera - if it fails, we might be on simulator
//           if (permission?.granted) {
//             // Additional check for simulator
//             setIsSimulator(false); // Default to false
//           }
//         } catch (error) {
//           setIsSimulator(true);
//         }
//       };
//       checkSimulator();
//     }
//   }, [permission]);

//   // Request camera and media library permissions
//   useEffect(() => {
//     (async () => {
//       // Request camera permissions
//       if (permission && !permission.granted) {
//         await requestPermission();
//       }
      
//       // Request media library permissions for image picker
//       const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (mediaStatus !== 'granted') {
//         console.log('Media library permission denied');
//       }
//     })();
//   }, [permission, requestPermission]);

//   // Data fetching
//   const fetchIncidents = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const response = await userService.getIncidents(scheduleId);
//       const schedule = response.data.data;
  
//       const cleanerGroup = schedule.assignedTo?.find(
//         (group) => group.cleanerId === currentUserId
//       );
  
//       const cleanerIncidents = cleanerGroup?.incidents || [];
//       setIncidents(cleanerIncidents);
//     } catch (error) {
//       console.error("Fetch incidents error:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [scheduleId, currentUserId]);

//   useFocusEffect(
//     useCallback(() => {
//       fetchIncidents();
//       return () => {};
//     }, [fetchIncidents])
//   );

//   // Take picture with camera or pick from library
//   const takePicture = async () => {
//     // On simulator or when camera fails, use image picker
//     if (isSimulator || !permission?.granted) {
//       await pickImageFromLibrary();
//       return;
//     }

//     if (cameraRef.current && isCameraReady) {
//       try {
//         const photo = await cameraRef.current.takePictureAsync({
//           quality: 0.8,
//           base64: true,
//           exif: false,
//           skipProcessing: true
//         });
        
//         const newPhoto = {
//           uri: photo.uri,
//           base64: photo.base64,
//           filename: `incident_${Date.now()}.jpg`,
//           file: `data:image/jpg;base64,${photo.base64}`
//         };
        
//         if (incidentImages.length < MAX_IMAGES_UPLOAD) {
//           setIncidentImages(prev => [...prev, newPhoto]);
//         } else {
//           Alert.alert('Limit reached', `Maximum ${MAX_IMAGES_UPLOAD} photos allowed`);
//         }
//       } catch (error) {
//         console.error('Camera error:', error);
//         Alert.alert('Error', 'Failed to capture image. Using photo library instead.');
//         // Fallback to image picker
//         await pickImageFromLibrary();
//       }
//     } else {
//       // Camera not ready, use image picker
//       await pickImageFromLibrary();
//     }
//   };

//   // Pick image from library
//   const pickImageFromLibrary = async () => {
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: false,
//         aspect: [4, 3],
//         quality: 0.8,
//         base64: true,
//         allowsMultipleSelection: true,
//         selectionLimit: MAX_IMAGES_UPLOAD - incidentImages.length
//       });

//       if (!result.canceled) {
//         const newPhotos = result.assets.map((asset, index) => ({
//           uri: asset.uri,
//           base64: asset.base64,
//           filename: `incident_${Date.now()}_${index}.jpg`,
//           file: `data:image/jpg;base64,${asset.base64}`
//         }));

//         if (incidentImages.length + newPhotos.length <= MAX_IMAGES_UPLOAD) {
//           setIncidentImages(prev => [...prev, ...newPhotos]);
//         } else {
//           Alert.alert('Limit reached', `Maximum ${MAX_IMAGES_UPLOAD} photos allowed`);
//         }
//       }
//     } catch (error) {
//       console.error('Image picker error:', error);
//       Alert.alert('Error', 'Failed to pick image from library');
//     }
//   };

//   // Flip camera
//   const flipCamera = () => {
//     setFacing(current => current === 'back' ? 'front' : 'back');
//   };

//   // Image handling
//   const removePhoto = (index) => {
//     setIncidentImages(prev => prev.filter((_, i) => i !== index));
//   };

//   const openImageViewer = (images, index) => {
//     if (Array.isArray(images)) {
//       const formattedImages = images.map(img => ({ 
//         url: img.url || img.uri || img.file,
//         props: { source: { uri: img.url || img.uri || img.file } }
//       }));
//       setCurrentImages(formattedImages);
//       setCurrentImageIndex(index);
//       setImageViewerVisible(true);
//     }
//   };

//   // Incident CRUD operations
//   const uploadIncident = async () => {
//     if (!incidentDescription.trim()) {
//       Alert.alert('Validation', 'Please enter incident description');
//       return;
//     }
  
//     if (incidentImages.length === 0) {
//       Alert.alert('Validation', 'Please add at least one photo');
//       return;
//     }
  
//     try {
//       setIsUploading(true);
      
//       const formData = new FormData();
//       formData.append('scheduleId', scheduleId);
//       formData.append('cleanerId', currentUserId);
//       formData.append('description', incidentDescription);

//       // Convert images to file objects
//       incidentImages.forEach((image, index) => {
//         if (image.uri) {
//           // Extract filename from URI or use default
//           const filename = image.filename || `incident_${Date.now()}_${index}.jpg`;
          
//           // Create a file object
//           formData.append('files', {
//             uri: image.uri,
//             name: filename,
//             type: 'image/jpeg',
//           });
//         }
//       });

//       const response = await userService.uploadPhotosIncidentPhotos(formData);
      
//       const newIncident = {
//         ...response.data,
//         photos: response.data.uploaded_files || incidentImages.map(img => ({ 
//           url: img.uri || img.file,
//           content_type: 'image/jpeg',
//           original_name: img.filename || 'incident_photo.jpg'
//         })),
//         description: incidentDescription,
//         reported_at: new Date().toISOString()
//       };
      
//       setIncidents(prev => [...prev, newIncident]);
//       setIncidentImages([]);
//       setIncidentDescription('');
//       setIncidentModalOpen(false);
//       Alert.alert('Success', 'Incident reported successfully');
//     } catch (error) {
//       console.error('Upload error:', error.response?.data || error.message || error);
//       Alert.alert('Error', 'Failed to submit incident. Please try again.');
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleToggleEdit = (incident) => {
//     if (editingIncidentId === incident.reported_at) {
//       setEditingIncidentId(null);
//       setEditingDescription('');
//     } else {
//       setEditingIncidentId(incident.reported_at);
//       setEditingDescription(incident.description || '');
//     }
//   };

//   const handleSaveEdit = async () => {
//     if (!editingIncidentId || !editingDescription.trim()) {
//       Alert.alert('Error', 'Please enter a description');
//       return;
//     }

//     try {
//       setIsLoading(true);
      
//       const updatedIncidents = incidents.map(inc => 
//         inc.reported_at === editingIncidentId
//           ? { 
//               ...inc, 
//               description: editingDescription,
//               isEditing: false
//             }
//           : inc
//       );
      
//       setIncidents(updatedIncidents);
      
//       await userService.updateScheduleIncidents({
//         scheduleId,
//         cleanerId: currentUserId,
//         incidents: updatedIncidents.map(({ isEditing, ...inc }) => ({
//           ...inc,
//           photos: inc.photos.map(photo => ({
//             url: photo.url,
//             content_type: photo.content_type || 'image/jpeg',
//             original_name: photo.original_name || 'incident_photo.jpg'
//           }))
//         }))
//       });
      
//       setEditingIncidentId(null);
//       setEditingDescription('');
      
//       Alert.alert('Success', 'Incident updated successfully');
//     } catch (error) {
//       console.error('Update error:', error);
//       Alert.alert('Error', 'Failed to save changes');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDeleteImage = (incidentId, imageUrl) => {
//     const updatedIncidents = incidents.map(inc => 
//       inc.reported_at === incidentId
//         ? { ...inc, photos: inc.photos.filter(photo => photo.url !== imageUrl) }
//         : inc
//     );
    
//     setIncidents(updatedIncidents);
    
//     // Update backend
//     userService.updateScheduleIncidents({
//       scheduleId,
//       cleanerId: currentUserId,
//       incidents: updatedIncidents.map(({ isEditing, ...inc }) => ({
//         ...inc,
//         photos: inc.photos.map(photo => ({
//           url: photo.url,
//           content_type: photo.content_type || 'image/jpeg',
//           original_name: photo.original_name || 'incident_photo.jpg'
//         }))
//       }))
//     }).catch(error => {
//       console.error('Delete image error:', error);
//       Alert.alert('Error', 'Failed to delete image');
//     });
//   };

//   // UI Components
//   const EmptyPlaceholder = () => (
//     <View style={styles.emptyContainer}>
//       <View style={styles.emptyIcon}>
//         <Ionicons name="shield-checkmark" size={48} color={COLORS.lightGray} />
//       </View>
//       <Text style={styles.emptyTitle}>No Incidents Reported</Text>
//       <Text style={styles.emptySubtitle}>
//         Great job! No issues have been reported for this cleaning session.
//       </Text>
//     </View>
//   );

//   const IncidentImageThumbnail = ({ photo, index, onDelete, onPress }) => (
//     <View style={styles.thumbnailContainer}>
//       <TouchableOpacity onPress={onPress}>
//         <Image 
//           source={{ uri: photo.url || photo.uri || photo.file }} 
//           style={styles.incidentImage}
//           transition={300}
//           cachePolicy="memory-disk"
//         />
//       </TouchableOpacity>
//       <TouchableOpacity 
//         style={styles.deleteButton} 
//         onPress={onDelete}
//       >
//         <Ionicons name="close-circle" size={20} color="white" />
//       </TouchableOpacity>
//       <View style={styles.photoNumber}>
//         <Text style={styles.photoNumberText}>{index + 1}</Text>
//       </View>
//     </View>
//   );

//   const PreviewThumbnail = ({ item, index }) => (
//     <TouchableOpacity 
//       style={styles.previewThumbnailContainer}
//       onPress={() => openImageViewer(incidentImages, index)}
//     >
//       <Image source={{ uri: item.uri || item.file }} style={styles.previewThumbnail} />
//       <TouchableOpacity 
//         style={styles.removePreviewButton}
//         onPress={(e) => {
//           e.stopPropagation();
//           removePhoto(index);
//         }}
//       >
//         <Ionicons name="close" size={16} color="white" />
//       </TouchableOpacity>
//       <View style={styles.previewNumberSmall}>
//         <Text style={styles.previewNumberTextSmall}>{index + 1}</Text>
//       </View>
//     </TouchableOpacity>
//   );

//   const renderIncidentItem = ({ item }) => (
//     <CardNoPrimary key={item.reported_at}>
//       <View style={styles.incidentCard}>
//         {/* Incident Header */}
//         <View style={styles.incidentHeader}>
//           <View style={styles.headerLeft}>
//             <View style={styles.incidentIcon}>
//               <Ionicons name="warning" size={20} color="#d32f2f" />
//             </View>
//             <View>
//               <Text style={styles.incidentTitle}>Incident Report</Text>
//               <Text style={styles.incidentDate}>
//                 {new Date(item.reported_at).toLocaleDateString()}
//               </Text>
//             </View>
//           </View>
//           <TouchableOpacity 
//             onPress={() => handleToggleEdit(item)} 
//             style={styles.editButton}
//           >
//             <Ionicons 
//               name={editingIncidentId === item.reported_at ? "close" : "create-outline"} 
//               size={20} 
//               color={COLORS.primary} 
//             />
//           </TouchableOpacity>
//         </View>

//         {/* Incident Images */}
//         <FlatList
//           horizontal
//           data={item.photos}
//           keyExtractor={(photo, index) => `${item.reported_at}-${index}`}
//           renderItem={({ item: photo, index }) => (
//             <IncidentImageThumbnail
//               photo={photo}
//               index={index}
//               onDelete={() => handleDeleteImage(item.reported_at, photo.url)}
//               onPress={() => openImageViewer(item.photos, index)}
//             />
//           )}
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.imagesContainer}
//           ListEmptyComponent={
//             <View style={styles.noPhotos}>
//               <Ionicons name="images-outline" size={32} color="#ddd" />
//               <Text style={styles.noPhotosText}>No photos</Text>
//             </View>
//           }
//         />

//         {/* Incident Description */}
//         <View style={styles.descriptionSection}>
//           <Text style={styles.descriptionLabel}>Description</Text>
//           {editingIncidentId === item.reported_at ? (
//             <View>
//               <TextInput
//                 label="Describe the incident..."
//                 mode="outlined"
//                 multiline
//                 numberOfLines={4}
//                 outlineColor="#D8D8D8"
//                 activeOutlineColor={COLORS.primary}
//                 style={styles.descriptionInput}
//                 value={editingDescription}
//                 onChangeText={setEditingDescription}
//                 autoFocus={true}
//               />
//               <TouchableOpacity 
//                 style={styles.saveButton} 
//                 onPress={handleSaveEdit}
//                 disabled={isLoading}
//               >
//                 <Ionicons name="checkmark" size={18} color="white" />
//                 <Text style={styles.saveButtonText}>
//                   {isLoading ? 'Saving...' : 'Save Changes'}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           ) : (
//             <Text style={styles.incidentDescription}>{item.description}</Text>
//           )}
//         </View>
//       </View>
//     </CardNoPrimary>
//   );

//   const isEditingAny = editingIncidentId !== null;

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Camera Modal */}
//       <RNModal
//         isVisible={cameraVisible}
//         style={styles.fullScreenModal}
//         onBackdropPress={() => setCameraVisible(false)}
//       >
//         <View style={styles.cameraModalContainer}>
//           {/* Camera Header */}
//           <View style={styles.cameraHeader}>
//             <TouchableOpacity 
//               style={styles.cameraCloseButton}
//               onPress={() => setCameraVisible(false)}
//             >
//               <Ionicons name="chevron-down" size={28} color="white" />
//             </TouchableOpacity>
            
//             {!isSimulator && permission?.granted && (
//               <TouchableOpacity 
//                 style={styles.flipButton}
//                 onPress={flipCamera}
//               >
//                 <Ionicons name="camera-reverse" size={24} color="white" />
//               </TouchableOpacity>
//             )}
//           </View>

//           {/* Camera Preview */}
//           {isSimulator ? (
//             <View style={styles.simulatorContainer}>
//               <Ionicons name="camera-off" size={64} color="white" />
//               <Text style={styles.simulatorText}>Camera not available in simulator</Text>
//               <Text style={styles.simulatorSubtext}>
//                 Use "Pick from Library" button below to add photos
//               </Text>
              
//               <TouchableOpacity 
//                 style={styles.libraryButton}
//                 onPress={pickImageFromLibrary}
//               >
//                 <Ionicons name="images" size={24} color="white" />
//                 <Text style={styles.libraryButtonText}>Pick from Library</Text>
//               </TouchableOpacity>
//             </View>
//           ) : !permission ? (
//             <View style={styles.permissionContainer}>
//               <ActivityIndicator size="large" color="white" />
//               <Text style={styles.permissionText}>Requesting camera permission...</Text>
//             </View>
//           ) : !permission.granted ? (
//             <View style={styles.permissionContainer}>
//               <Ionicons name="camera-off" size={48} color="white" />
//               <Text style={styles.permissionText}>No access to camera</Text>
//               <TouchableOpacity 
//                 style={styles.permissionButton}
//                 onPress={() => {
//                   setCameraVisible(false);
//                   Alert.alert(
//                     'Permission Required',
//                     'Please enable camera permissions in your device settings.',
//                     [{ text: 'OK' }]
//                   );
//                 }}
//               >
//                 <Text style={styles.permissionButtonText}>OK</Text>
//               </TouchableOpacity>
//             </View>
//           ) : (
//             <CameraView 
//               style={styles.camera}
//               facing={facing}
//               ref={cameraRef}
//               onCameraReady={() => setIsCameraReady(true)}
//             >
//               {/* Camera Controls */}
//               <View style={styles.cameraControls}>
//                 <TouchableOpacity 
//                   style={styles.captureButton}
//                   onPress={takePicture}
//                   disabled={incidentImages.length >= MAX_IMAGES_UPLOAD}
//                 >
//                   <View style={styles.captureButtonInner}>
//                     <Ionicons name="camera" size={32} color="white" />
//                   </View>
//                 </TouchableOpacity>
//               </View>

//               {/* Photo Counter */}
//               <View style={styles.photoCounter}>
//                 <Ionicons name="images-outline" size={16} color="white" />
//                 <Text style={styles.photoCounterText}>
//                   {incidentImages.length}/{MAX_IMAGES_UPLOAD}
//                 </Text>
//               </View>
//             </CameraView>
//           )}

//           {/* Thumbnail Preview Section */}
//           {incidentImages.length > 0 && (
//             <View style={styles.cameraThumbnailSection}>
//               <FlatList
//                 data={incidentImages}
//                 horizontal
//                 keyExtractor={(item, index) => index.toString()}
//                 renderItem={({ item, index }) => (
//                   <View style={styles.thumbnailContainer}>
//                     <Image source={{ uri: item.uri || item.file }} style={styles.preview} />
//                     <TouchableOpacity 
//                       onPress={() => removePhoto(index)} 
//                       style={styles.removeButton}
//                     >
//                       <Ionicons name="trash-outline" size={14} color="white" />
//                     </TouchableOpacity>
//                     <View style={styles.previewNumber}>
//                       <Text style={styles.previewNumberText}>{index + 1}</Text>
//                     </View>
//                   </View>
//                 )}
//                 contentContainerStyle={styles.previewContainer}
//                 showsHorizontalScrollIndicator={false}
//               />
              
//               <TouchableOpacity 
//                 style={styles.doneButton}
//                 onPress={() => setCameraVisible(false)}
//               >
//                 <Ionicons name="checkmark" size={20} color="white" />
//                 <Text style={styles.doneButtonText}>Done ({incidentImages.length} photos)</Text>
//               </TouchableOpacity>
//             </View>
//           )}

//           {incidentImages.length === 0 && permission?.granted && !isSimulator && (
//             <View style={styles.cameraInstructions}>
//               <Text style={styles.cameraInstructionsText}>
//                 Tap the camera button to capture incident photos
//               </Text>
//               <TouchableOpacity 
//                 style={styles.libraryButtonSmall}
//                 onPress={pickImageFromLibrary}
//               >
//                 <Ionicons name="images" size={16} color="white" />
//                 <Text style={styles.libraryButtonTextSmall}>or Pick from Library</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       </RNModal>

//       {/* Image Viewer Modal */}
//       <RNModal
//         isVisible={imageViewerVisible}
//         style={styles.fullScreenModal}
//         onBackdropPress={() => setImageViewerVisible(false)}
//       >
//         <View style={styles.modalContainer}>
//           <ImageViewer
//             imageUrls={currentImages}
//             index={currentImageIndex}
//             enableSwipeDown
//             onSwipeDown={() => setImageViewerVisible(false)}
//             backgroundColor="black"
//           />
//           <TouchableOpacity
//             style={styles.viewerCloseButton}
//             onPress={() => setImageViewerVisible(false)}
//           >
//             <Ionicons name="close" size={28} color="white" />
//           </TouchableOpacity>
//         </View>
//       </RNModal>

//       {/* Loading Indicator */}
//       {isLoading && (
//         <View style={styles.loaderContainer}>
//           <CustomActivityIndicator size={40} />
//         </View>
//       )}

//       {/* Incidents List */}
//       <FlatList
//         data={incidents}
//         keyExtractor={(item, index) => item?.reported_at ? item.reported_at.toString() : `incident-${index}`}
//         ListHeaderComponent={
//           <View style={styles.header}>
//             <View style={styles.headerIcon}>
//               <Ionicons name="document-text-outline" size={32} color={COLORS.primary} />
//             </View>
//             <Text style={styles.headline}>Incident Reports</Text>
//             <Text style={styles.subtitle}>Document any issues or concerns during cleaning</Text>
            
//             <View style={styles.infoCard}>
//               <Ionicons name="information-circle" size={20} color={COLORS.warning} />
//               <Text style={styles.infoText}>
//                 Report any damages, missing items, or other issues encountered during cleaning.
//               </Text>
//             </View>
//           </View>
//         }
//         ListEmptyComponent={!isLoading && <EmptyPlaceholder />}
//         renderItem={renderIncidentItem}
//         contentContainerStyle={styles.listContainer}
//       />

//       {/* Add Incident Button */}
//       {!isEditingAny && (
//         <TouchableOpacity 
//           style={styles.addButton}
//           onPress={() => setIncidentModalOpen(true)}
//         >
//           <Ionicons name="add-circle" size={22} color="white" />
//           <Text style={styles.addButtonText}>Report Incident</Text>
//         </TouchableOpacity>
//       )}

//       {/* Incident Creation Modal */}
//       <Portal>
//         <PaperModal
//           visible={incidentModalOpen}
//           onDismiss={() => {
//             setIncidentModalOpen(false);
//             setIncidentImages([]);
//             setIncidentDescription('');
//           }}
//           style={styles.creationModal}
//         >
//           <View style={styles.modalContentWrapper}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Report New Incident</Text>
//               <TouchableOpacity 
//                 onPress={() => {
//                   setIncidentModalOpen(false);
//                   setIncidentImages([]);
//                   setIncidentDescription('');
//                 }}
//                 style={styles.modalCloseButton}
//               >
//                 <Ionicons name="close" size={24} color={COLORS.dark} />
//               </TouchableOpacity>
//             </View>

//             {/* Camera Button */}
//             <TouchableOpacity 
//               style={styles.cameraButton}
//               onPress={() => setCameraVisible(true)}
//             >
//               <Ionicons name="camera" size={24} color={COLORS.primary} />
//               <Text style={styles.cameraButtonText}>
//                 {isSimulator ? 'Pick Photo from Library' : incidentImages.length > 0 ? 'Add More Photos' : 'Take Photo'}
//               </Text>
//             </TouchableOpacity>

//             {/* Alternative Library Button */}
//             <TouchableOpacity 
//               style={styles.libraryButtonModal}
//               onPress={pickImageFromLibrary}
//             >
//               <Ionicons name="images" size={24} color={COLORS.primary} />
//               <Text style={styles.libraryButtonTextModal}>
//                 Pick from Photo Library
//               </Text>
//             </TouchableOpacity>

//             {/* Image Previews */}
//             {incidentImages.length > 0 && (
//               <View style={styles.previewSection}>
//                 <View style={styles.previewSectionHeader}>
//                   <Text style={styles.previewTitle}>Captured Photos ({incidentImages.length}/{MAX_IMAGES_UPLOAD})</Text>
//                   <TouchableOpacity 
//                     style={styles.clearAllButton}
//                     onPress={() => setIncidentImages([])}
//                   >
//                     <Text style={styles.clearAllText}>Clear All</Text>
//                   </TouchableOpacity>
//                 </View>
//                 <FlatList
//                   horizontal
//                   data={incidentImages}
//                   keyExtractor={(item, index) => `preview-${index}`}
//                   contentContainerStyle={styles.previewContainer}
//                   renderItem={({ item, index }) => (
//                     <PreviewThumbnail item={item} index={index} />
//                   )}
//                 />
//               </View>
//             )}

//             <TextInput
//               label="Incident description"
//               placeholder="Describe what happened..."
//               mode="outlined"
//               multiline
//               numberOfLines={4}
//               value={incidentDescription}
//               onChangeText={setIncidentDescription}
//               style={styles.modalDescriptionInput}
//               outlineColor="#D8D8D8"
//               activeOutlineColor={COLORS.primary}
//             />

//             <View style={styles.modalActions}>
//               <TouchableOpacity 
//                 style={styles.cancelButton}
//                 onPress={() => {
//                   setIncidentModalOpen(false);
//                   setIncidentImages([]);
//                   setIncidentDescription('');
//                 }}
//               >
//                 <Text style={styles.cancelButtonText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity 
//                 style={[
//                   styles.submitButton,
//                   (!incidentDescription.trim() || incidentImages.length === 0) && styles.submitButtonDisabled
//                 ]}
//                 onPress={uploadIncident}
//                 disabled={isUploading || !incidentDescription.trim() || incidentImages.length === 0}
//               >
//                 {isUploading ? (
//                   <ActivityIndicator size="small" color="white" />
//                 ) : (
//                   <>
//                     <Ionicons name="cloud-upload" size={18} color="white" />
//                     <Text style={styles.submitButtonText}>Submit Report</Text>
//                   </>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </PaperModal>
//       </Portal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   header: {
//     padding: 20,
//     backgroundColor: 'white',
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   headerIcon: {
//     alignSelf: 'center',
//     backgroundColor: '#e3f2fd',
//     padding: 12,
//     borderRadius: 50,
//     marginBottom: 12,
//   },
//   headline: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#1a1a1a',
//     textAlign: 'center',
//     marginBottom: 4,
//     letterSpacing: -0.5,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 16,
//     fontWeight: '400',
//   },
//   infoCard: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     padding: 16,
//     backgroundColor: '#fff3cd',
//     borderRadius: 12,
//     borderLeftWidth: 4,
//     borderLeftColor: COLORS.warning,
//   },
//   infoText: {
//     flex: 1,
//     fontSize: 14,
//     color: '#856404',
//     marginLeft: 12,
//     lineHeight: 20,
//   },
//   listContainer: {
//     padding: 16,
//   },
//   incidentCard: {
//     padding: 16,
//   },
//   incidentHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 16,
//   },
//   headerLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   incidentIcon: {
//     backgroundColor: '#ffebee',
//     padding: 8,
//     borderRadius: 10,
//     marginRight: 12,
//   },
//   incidentTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginBottom: 2,
//   },
//   incidentDate: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '400',
//   },
//   editButton: {
//     padding: 8,
//   },
//   imagesContainer: {
//     paddingVertical: 8,
//   },
//   thumbnailContainer: {
//     marginRight: 12,
//     marginBottom: 8,
//     position: 'relative',
//   },
//   incidentImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 12,
//     backgroundColor: '#f0f0f0',
//   },
//   deleteButton: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     padding: 4,
//     borderRadius: 10,
//   },
//   photoNumber: {
//     position: 'absolute',
//     top: 8,
//     left: 8,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   photoNumberText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: '600',
//   },
//   noPhotos: {
//     width: 100,
//     height: 100,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     borderStyle: 'dashed',
//   },
//   noPhotosText: {
//     fontSize: 12,
//     color: '#999',
//     marginTop: 4,
//   },
//   descriptionSection: {
//     marginTop: 8,
//   },
//   descriptionLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginBottom: 8,
//   },
//   descriptionInput: {
//     backgroundColor: 'white',
//   },
//   incidentDescription: {
//     fontSize: 14,
//     color: '#1a1a1a',
//     lineHeight: 20,
//     backgroundColor: '#f8f9fa',
//     padding: 12,
//     borderRadius: 8,
//   },
//   saveButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 12,
//   },
//   saveButtonText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     padding: 40,
//     marginTop: 20,
//   },
//   emptyIcon: {
//     backgroundColor: '#f0f0f0',
//     padding: 20,
//     borderRadius: 50,
//     marginBottom: 16,
//   },
//   emptyTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#666',
//     marginBottom: 8,
//   },
//   emptySubtitle: {
//     fontSize: 14,
//     color: '#999',
//     textAlign: 'center',
//     lineHeight: 20,
//   },
//   addButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     padding: 16,
//     margin: 16,
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   addButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   creationModal: {
//     margin: 20,
//   },
//   modalContentWrapper: {
//     backgroundColor: 'white',
//     borderRadius: 16,
//     overflow: 'hidden',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1a1a1a',
//   },
//   modalCloseButton: {
//     padding: 4,
//   },
//   cameraButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     margin: 20,
//     marginBottom: 12,
//     backgroundColor: '#f8f9fa',
//     borderRadius: 12,
//     borderWidth: 1.5,
//     borderColor: '#e0e0e0',
//   },
//   cameraButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginLeft: 12,
//   },
//   libraryButtonModal: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     marginHorizontal: 20,
//     marginBottom: 16,
//     backgroundColor: '#f0f8ff',
//     borderRadius: 12,
//     borderWidth: 1.5,
//     borderColor: '#e0f0ff',
//   },
//   libraryButtonTextModal: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginLeft: 12,
//   },
//   previewSection: {
//     paddingHorizontal: 20,
//     marginBottom: 16,
//   },
//   previewSectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   previewTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#666',
//   },
//   clearAllButton: {
//     padding: 4,
//   },
//   clearAllText: {
//     fontSize: 14,
//     color: COLORS.error,
//     fontWeight: '500',
//   },
//   previewContainer: {
//     paddingVertical: 8,
//   },
//   previewThumbnailContainer: {
//     marginRight: 12,
//     position: 'relative',
//   },
//   previewThumbnail: {
//     width: 80,
//     height: 80,
//     borderRadius: 8,
//   },
//   removePreviewButton: {
//     position: 'absolute',
//     top: 4,
//     right: 4,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     borderRadius: 10,
//     padding: 4,
//   },
//   previewNumberSmall: {
//     position: 'absolute',
//     top: 4,
//     left: 4,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 4,
//     paddingVertical: 2,
//     borderRadius: 6,
//   },
//   previewNumberTextSmall: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: '600',
//   },
//   modalDescriptionInput: {
//     marginHorizontal: 20,
//     marginBottom: 20,
//     backgroundColor: 'white',
//   },
//   modalActions: {
//     flexDirection: 'row',
//     padding: 20,
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//     gap: 12,
//   },
//   cancelButton: {
//     flex: 1,
//     padding: 14,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     alignItems: 'center',
//   },
//   cancelButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#666',
//   },
//   submitButton: {
//     flex: 2,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     padding: 14,
//     borderRadius: 8,
//   },
//   submitButtonDisabled: {
//     backgroundColor: '#ccc',
//   },
//   submitButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
  
//   // Camera Modal Styles
//   fullScreenModal: {
//     margin: 0,
//   },
//   cameraModalContainer: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   cameraHeader: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 50 : 30,
//     left: 20,
//     right: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     zIndex: 10,
//   },
//   cameraCloseButton: {
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     borderRadius: 20,
//     padding: 8,
//   },
//   flipButton: {
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     borderRadius: 20,
//     padding: 8,
//   },
//   simulatorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#000',
//     paddingHorizontal: 20,
//   },
//   simulatorText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: '600',
//     marginTop: 20,
//     textAlign: 'center',
//   },
//   simulatorSubtext: {
//     color: '#ccc',
//     fontSize: 14,
//     marginTop: 10,
//     textAlign: 'center',
//     marginBottom: 30,
//   },
//   libraryButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 24,
//     paddingVertical: 14,
//     borderRadius: 12,
//     marginTop: 20,
//   },
//   libraryButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 10,
//   },
//   libraryButtonSmall: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 8,
//     marginTop: 8,
//   },
//   libraryButtonTextSmall: {
//     color: 'white',
//     fontSize: 12,
//     fontWeight: '500',
//     marginLeft: 6,
//   },
//   permissionContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#000',
//   },
//   permissionText: {
//     color: 'white',
//     fontSize: 16,
//     marginTop: 16,
//     textAlign: 'center',
//     paddingHorizontal: 20,
//   },
//   permissionButton: {
//     marginTop: 20,
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   permissionButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   camera: {
//     flex: 1,
//   },
//   cameraControls: {
//     position: 'absolute',
//     bottom: 200,
//     alignSelf: 'center',
//   },
//   captureButton: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   captureButtonInner: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: 'rgba(255,255,255,0.3)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 3,
//     borderColor: 'white',
//   },
//   photoCounter: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 100 : 80,
//     alignSelf: 'center',
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//   },
//   photoCounterText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 6,
//   },
//   cameraThumbnailSection: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     paddingHorizontal: 0,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingBottom: Platform.OS === 'ios' ? 34 : 16,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   preview: { 
//     width: 80, 
//     height: 80,
//     borderRadius: 8,
//     backgroundColor: '#f0f0f0',
//   },
//   removeButton: {
//     position: 'absolute',
//     top: 4,
//     right: 4,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     borderRadius: 12,
//     padding: 4,
//   },
//   previewNumber: {
//     position: 'absolute',
//     top: 4,
//     left: 4,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   previewNumberText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: '600',
//   },
//   doneButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     padding: 12,
//     borderRadius: 12,
//     marginTop: 12,
//   },
//   doneButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   cameraInstructions: {
//     position: 'absolute',
//     bottom: 40,
//     alignSelf: 'center',
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 16,
//     alignItems: 'center',
//   },
//   cameraInstructionsText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'black',
//   },
//   viewerCloseButton: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 50 : 30,
//     right: 20,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     borderRadius: 20,
//     padding: 8,
//     zIndex: 1,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(255,255,255,0.9)',
//     zIndex: 10,
//   },
// });

// export default ReportIncident;



// import React, { useState, useRef, useCallback, useContext, useEffect } from 'react';
// import { 
//   View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, 
//   ActivityIndicator, Dimensions, SafeAreaView, Platform 
// } from 'react-native';
// import { TextInput } from 'react-native-paper';
// import { Ionicons } from '@expo/vector-icons'; 
// import { useFocusEffect } from '@react-navigation/native';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import * as ImagePicker from 'expo-image-picker';
// import userService from '../../../services/connection/userService';
// import { Modal as PaperModal, Portal } from 'react-native-paper';
// import COLORS from '../../../constants/colors';
// import RNModal from 'react-native-modal';
// import ImageViewer from 'react-native-image-zoom-viewer';
// import { AuthContext } from '../../../context/AuthContext';
// import CardNoPrimary from '../../../components/shared/CardNoPrimary';
// import { Image } from 'expo-image';
// import CustomActivityIndicator from '../../../components/shared/CuustomActivityIndicator';
// import { tSafe } from '../../../utils/tSafe'; // added import

// const { width, height } = Dimensions.get('window');

// const ReportIncident = ({ scheduleId }) => {
//   const { currentUserId } = useContext(AuthContext);
//   const cameraRef = useRef(null);
//   const [incidentModalOpen, setIncidentModalOpen] = useState(false);
//   const [cameraVisible, setCameraVisible] = useState(false);
//   const [incidentImages, setIncidentImages] = useState([]);
//   const [incidentDescription, setIncidentDescription] = useState('');
//   const [incidents, setIncidents] = useState([]);
//   const [facing, setFacing] = useState('back');
//   const [isLoading, setIsLoading] = useState(false);
//   const [imageViewerVisible, setImageViewerVisible] = useState(false);
//   const [currentImages, setCurrentImages] = useState([]);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [isUploading, setIsUploading] = useState(false);
//   const [permission, requestPermission] = useCameraPermissions();
//   const [editingDescription, setEditingDescription] = useState('');
//   const [editingIncidentId, setEditingIncidentId] = useState(null);
//   const [isCameraReady, setIsCameraReady] = useState(false);
//   const [isSimulator, setIsSimulator] = useState(false);
  
//   const MAX_IMAGES_UPLOAD = 5;

//   // Check if running on simulator
//   useEffect(() => {
//     if (Platform.OS === 'ios') {
//       const checkSimulator = async () => {
//         try {
//           if (permission?.granted) {
//             setIsSimulator(false);
//           }
//         } catch (error) {
//           setIsSimulator(true);
//         }
//       };
//       checkSimulator();
//     }
//   }, [permission]);

//   // Request camera and media library permissions
//   useEffect(() => {
//     (async () => {
//       if (permission && !permission.granted) {
//         await requestPermission();
//       }
//       const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (mediaStatus !== 'granted') {
//         console.log('Media library permission denied');
//       }
//     })();
//   }, [permission, requestPermission]);

//   // Data fetching
//   const fetchIncidents = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const response = await userService.getIncidents(scheduleId);
//       const schedule = response.data.data;
//       const cleanerGroup = schedule.assignedTo?.find(
//         (group) => group.cleanerId === currentUserId
//       );
//       const cleanerIncidents = cleanerGroup?.incidents || [];
//       setIncidents(cleanerIncidents);
//     } catch (error) {
//       console.error("Fetch incidents error:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [scheduleId, currentUserId]);

//   useFocusEffect(
//     useCallback(() => {
//       fetchIncidents();
//       return () => {};
//     }, [fetchIncidents])
//   );

//   // Take picture with camera or pick from library
//   const takePicture = async () => {
//     if (isSimulator || !permission?.granted) {
//       await pickImageFromLibrary();
//       return;
//     }

//     if (cameraRef.current && isCameraReady) {
//       try {
//         const photo = await cameraRef.current.takePictureAsync({
//           quality: 0.8,
//           base64: true,
//           exif: false,
//           skipProcessing: true
//         });
        
//         const newPhoto = {
//           uri: photo.uri,
//           base64: photo.base64,
//           filename: `incident_${Date.now()}.jpg`,
//           file: `data:image/jpg;base64,${photo.base64}`
//         };
        
//         if (incidentImages.length < MAX_IMAGES_UPLOAD) {
//           setIncidentImages(prev => [...prev, newPhoto]);
//         } else {
//           Alert.alert(
//             tSafe('limit_reached_title', 'Limit reached'),
//             tSafe('max_photos_allowed', 'Maximum {count} photos allowed', { count: MAX_IMAGES_UPLOAD })
//           );
//         }
//       } catch (error) {
//         console.error('Camera error:', error);
//         Alert.alert(
//           tSafe('error_title', 'Error'),
//           tSafe('failed_capture_image', 'Failed to capture image. Using photo library instead.')
//         );
//         await pickImageFromLibrary();
//       }
//     } else {
//       await pickImageFromLibrary();
//     }
//   };

//   // Pick image from library
//   const pickImageFromLibrary = async () => {
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: false,
//         aspect: [4, 3],
//         quality: 0.8,
//         base64: true,
//         allowsMultipleSelection: true,
//         selectionLimit: MAX_IMAGES_UPLOAD - incidentImages.length
//       });

//       if (!result.canceled) {
//         const newPhotos = result.assets.map((asset, index) => ({
//           uri: asset.uri,
//           base64: asset.base64,
//           filename: `incident_${Date.now()}_${index}.jpg`,
//           file: `data:image/jpg;base64,${asset.base64}`
//         }));

//         if (incidentImages.length + newPhotos.length <= MAX_IMAGES_UPLOAD) {
//           setIncidentImages(prev => [...prev, ...newPhotos]);
//         } else {
//           Alert.alert(
//             tSafe('limit_reached_title', 'Limit reached'),
//             tSafe('max_photos_allowed', 'Maximum {count} photos allowed', { count: MAX_IMAGES_UPLOAD })
//           );
//         }
//       }
//     } catch (error) {
//       console.error('Image picker error:', error);
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe('failed_pick_image', 'Failed to pick image from library')
//       );
//     }
//   };

//   // Flip camera
//   const flipCamera = () => {
//     setFacing(current => current === 'back' ? 'front' : 'back');
//   };

//   // Image handling
//   const removePhoto = (index) => {
//     setIncidentImages(prev => prev.filter((_, i) => i !== index));
//   };

//   const openImageViewer = (images, index) => {
//     if (Array.isArray(images)) {
//       const formattedImages = images.map(img => ({ 
//         url: img.url || img.uri || img.file,
//         props: { source: { uri: img.url || img.uri || img.file } }
//       }));
//       setCurrentImages(formattedImages);
//       setCurrentImageIndex(index);
//       setImageViewerVisible(true);
//     }
//   };

//   // Incident CRUD operations
//   const uploadIncident = async () => {
//     if (!incidentDescription.trim()) {
//       Alert.alert(
//         tSafe('validation_title', 'Validation'),
//         tSafe('enter_incident_description', 'Please enter incident description')
//       );
//       return;
//     }
  
//     if (incidentImages.length === 0) {
//       Alert.alert(
//         tSafe('validation_title', 'Validation'),
//         tSafe('add_incident_photo', 'Please add at least one photo')
//       );
//       return;
//     }
  
//     try {
//       setIsUploading(true);
      
//       const formData = new FormData();
//       formData.append('scheduleId', scheduleId);
//       formData.append('cleanerId', currentUserId);
//       formData.append('description', incidentDescription);

//       incidentImages.forEach((image, index) => {
//         if (image.uri) {
//           const filename = image.filename || `incident_${Date.now()}_${index}.jpg`;
//           formData.append('files', {
//             uri: image.uri,
//             name: filename,
//             type: 'image/jpeg',
//           });
//         }
//       });

//       const response = await userService.uploadPhotosIncidentPhotos(formData);
      
//       const newIncident = {
//         ...response.data,
//         photos: response.data.uploaded_files || incidentImages.map(img => ({ 
//           url: img.uri || img.file,
//           content_type: 'image/jpeg',
//           original_name: img.filename || 'incident_photo.jpg'
//         })),
//         description: incidentDescription,
//         reported_at: new Date().toISOString()
//       };
      
//       setIncidents(prev => [...prev, newIncident]);
//       setIncidentImages([]);
//       setIncidentDescription('');
//       setIncidentModalOpen(false);
//       Alert.alert(
//         tSafe('success_title', 'Success'),
//         tSafe('incident_reported', 'Incident reported successfully')
//       );
//     } catch (error) {
//       console.error('Upload error:', error.response?.data || error.message || error);
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe('failed_submit_incident', 'Failed to submit incident. Please try again.')
//       );
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleToggleEdit = (incident) => {
//     if (editingIncidentId === incident.reported_at) {
//       setEditingIncidentId(null);
//       setEditingDescription('');
//     } else {
//       setEditingIncidentId(incident.reported_at);
//       setEditingDescription(incident.description || '');
//     }
//   };

//   const handleSaveEdit = async () => {
//     if (!editingIncidentId || !editingDescription.trim()) {
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe('enter_description', 'Please enter a description')
//       );
//       return;
//     }

//     try {
//       setIsLoading(true);
      
//       const updatedIncidents = incidents.map(inc => 
//         inc.reported_at === editingIncidentId
//           ? { ...inc, description: editingDescription, isEditing: false }
//           : inc
//       );
      
//       setIncidents(updatedIncidents);
      
//       await userService.updateScheduleIncidents({
//         scheduleId,
//         cleanerId: currentUserId,
//         incidents: updatedIncidents.map(({ isEditing, ...inc }) => ({
//           ...inc,
//           photos: inc.photos.map(photo => ({
//             url: photo.url,
//             content_type: photo.content_type || 'image/jpeg',
//             original_name: photo.original_name || 'incident_photo.jpg'
//           }))
//         }))
//       });
      
//       setEditingIncidentId(null);
//       setEditingDescription('');
      
//       Alert.alert(
//         tSafe('success_title', 'Success'),
//         tSafe('incident_updated', 'Incident updated successfully')
//       );
//     } catch (error) {
//       console.error('Update error:', error);
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe('failed_save_changes', 'Failed to save changes')
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDeleteImage = (incidentId, imageUrl) => {
//     const updatedIncidents = incidents.map(inc => 
//       inc.reported_at === incidentId
//         ? { ...inc, photos: inc.photos.filter(photo => photo.url !== imageUrl) }
//         : inc
//     );
    
//     setIncidents(updatedIncidents);
    
//     userService.updateScheduleIncidents({
//       scheduleId,
//       cleanerId: currentUserId,
//       incidents: updatedIncidents.map(({ isEditing, ...inc }) => ({
//         ...inc,
//         photos: inc.photos.map(photo => ({
//           url: photo.url,
//           content_type: photo.content_type || 'image/jpeg',
//           original_name: photo.original_name || 'incident_photo.jpg'
//         }))
//       }))
//     }).catch(error => {
//       console.error('Delete image error:', error);
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe('failed_delete_image', 'Failed to delete image')
//       );
//     });
//   };

//   // UI Components
//   const EmptyPlaceholder = () => (
//     <View style={styles.emptyContainer}>
//       <View style={styles.emptyIcon}>
//         <Ionicons name="shield-checkmark" size={48} color={COLORS.lightGray} />
//       </View>
//       <Text style={styles.emptyTitle}>{tSafe('no_incidents_reported', 'No Incidents Reported')}</Text>
//       <Text style={styles.emptySubtitle}>
//         {tSafe('no_incidents_message', 'Great job! No issues have been reported for this cleaning session.')}
//       </Text>
//     </View>
//   );

//   const IncidentImageThumbnail = ({ photo, index, onDelete, onPress }) => (
//     <View style={styles.thumbnailContainer}>
//       <TouchableOpacity onPress={onPress}>
//         <Image 
//           source={{ uri: photo.url || photo.uri || photo.file }} 
//           style={styles.incidentImage}
//           transition={300}
//           cachePolicy="memory-disk"
//         />
//       </TouchableOpacity>
//       <TouchableOpacity 
//         style={styles.deleteButton} 
//         onPress={onDelete}
//       >
//         <Ionicons name="close-circle" size={20} color="white" />
//       </TouchableOpacity>
//       <View style={styles.photoNumber}>
//         <Text style={styles.photoNumberText}>{index + 1}</Text>
//       </View>
//     </View>
//   );

//   const PreviewThumbnail = ({ item, index }) => (
//     <TouchableOpacity 
//       style={styles.previewThumbnailContainer}
//       onPress={() => openImageViewer(incidentImages, index)}
//     >
//       <Image source={{ uri: item.uri || item.file }} style={styles.previewThumbnail} />
//       <TouchableOpacity 
//         style={styles.removePreviewButton}
//         onPress={(e) => {
//           e.stopPropagation();
//           removePhoto(index);
//         }}
//       >
//         <Ionicons name="close" size={16} color="white" />
//       </TouchableOpacity>
//       <View style={styles.previewNumberSmall}>
//         <Text style={styles.previewNumberTextSmall}>{index + 1}</Text>
//       </View>
//     </TouchableOpacity>
//   );

//   const renderIncidentItem = ({ item }) => (
//     <CardNoPrimary key={item.reported_at}>
//       <View style={styles.incidentCard}>
//         {/* Incident Header */}
//         <View style={styles.incidentHeader}>
//           <View style={styles.headerLeft}>
//             <View style={styles.incidentIcon}>
//               <Ionicons name="warning" size={20} color="#d32f2f" />
//             </View>
//             <View>
//               <Text style={styles.incidentTitle}>{tSafe('incident_report', 'Incident Report')}</Text>
//               <Text style={styles.incidentDate}>
//                 {new Date(item.reported_at).toLocaleDateString()}
//               </Text>
//             </View>
//           </View>
//           <TouchableOpacity 
//             onPress={() => handleToggleEdit(item)} 
//             style={styles.editButton}
//           >
//             <Ionicons 
//               name={editingIncidentId === item.reported_at ? "close" : "create-outline"} 
//               size={20} 
//               color={COLORS.primary} 
//             />
//           </TouchableOpacity>
//         </View>

//         {/* Incident Images */}
//         <FlatList
//           horizontal
//           data={item.photos}
//           keyExtractor={(photo, index) => `${item.reported_at}-${index}`}
//           renderItem={({ item: photo, index }) => (
//             <IncidentImageThumbnail
//               photo={photo}
//               index={index}
//               onDelete={() => handleDeleteImage(item.reported_at, photo.url)}
//               onPress={() => openImageViewer(item.photos, index)}
//             />
//           )}
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.imagesContainer}
//           ListEmptyComponent={
//             <View style={styles.noPhotos}>
//               <Ionicons name="images-outline" size={32} color="#ddd" />
//               <Text style={styles.noPhotosText}>{tSafe('no_photos', 'No photos')}</Text>
//             </View>
//           }
//         />

//         {/* Incident Description */}
//         <View style={styles.descriptionSection}>
//           <Text style={styles.descriptionLabel}>{tSafe('description', 'Description')}</Text>
//           {editingIncidentId === item.reported_at ? (
//             <View>
//               <TextInput
//                 label={tSafe('describe_incident', 'Describe the incident...')}
//                 mode="outlined"
//                 multiline
//                 numberOfLines={4}
//                 outlineColor="#D8D8D8"
//                 activeOutlineColor={COLORS.primary}
//                 style={styles.descriptionInput}
//                 value={editingDescription}
//                 onChangeText={setEditingDescription}
//                 autoFocus={true}
//               />
//               <TouchableOpacity 
//                 style={styles.saveButton} 
//                 onPress={handleSaveEdit}
//                 disabled={isLoading}
//               >
//                 <Ionicons name="checkmark" size={18} color="white" />
//                 <Text style={styles.saveButtonText}>
//                   {isLoading ? tSafe('saving', 'Saving...') : tSafe('save_changes', 'Save Changes')}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           ) : (
//             <Text style={styles.incidentDescription}>{item.description}</Text>
//           )}
//         </View>
//       </View>
//     </CardNoPrimary>
//   );

//   const isEditingAny = editingIncidentId !== null;

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Camera Modal */}
//       <RNModal
//         isVisible={cameraVisible}
//         style={styles.fullScreenModal}
//         onBackdropPress={() => setCameraVisible(false)}
//       >
//         <View style={styles.cameraModalContainer}>
//           {/* Camera Header */}
//           <View style={styles.cameraHeader}>
//             <TouchableOpacity 
//               style={styles.cameraCloseButton}
//               onPress={() => setCameraVisible(false)}
//             >
//               <Ionicons name="chevron-down" size={28} color="white" />
//             </TouchableOpacity>
            
//             {!isSimulator && permission?.granted && (
//               <TouchableOpacity 
//                 style={styles.flipButton}
//                 onPress={flipCamera}
//               >
//                 <Ionicons name="camera-reverse" size={24} color="white" />
//               </TouchableOpacity>
//             )}
//           </View>

//           {/* Camera Preview */}
//           {isSimulator ? (
//             <View style={styles.simulatorContainer}>
//               <Ionicons name="camera-off" size={64} color="white" />
//               <Text style={styles.simulatorText}>{tSafe('camera_not_available_simulator', 'Camera not available in simulator')}</Text>
//               <Text style={styles.simulatorSubtext}>
//                 {tSafe('use_pick_from_library', 'Use "Pick from Library" button below to add photos')}
//               </Text>
              
//               <TouchableOpacity 
//                 style={styles.libraryButton}
//                 onPress={pickImageFromLibrary}
//               >
//                 <Ionicons name="images" size={24} color="white" />
//                 <Text style={styles.libraryButtonText}>{tSafe('pick_from_library', 'Pick from Library')}</Text>
//               </TouchableOpacity>
//             </View>
//           ) : !permission ? (
//             <View style={styles.permissionContainer}>
//               <ActivityIndicator size="large" color="white" />
//               <Text style={styles.permissionText}>{tSafe('requesting_camera_permission', 'Requesting camera permission...')}</Text>
//             </View>
//           ) : !permission.granted ? (
//             <View style={styles.permissionContainer}>
//               <Ionicons name="camera-off" size={48} color="white" />
//               <Text style={styles.permissionText}>{tSafe('no_access_camera', 'No access to camera')}</Text>
//               <TouchableOpacity 
//                 style={styles.permissionButton}
//                 onPress={() => {
//                   setCameraVisible(false);
//                   Alert.alert(
//                     tSafe('permission_required_title', 'Permission Required'),
//                     tSafe('enable_camera_permissions', 'Please enable camera permissions in your device settings.'),
//                     [{ text: tSafe('ok', 'OK') }]
//                   );
//                 }}
//               >
//                 <Text style={styles.permissionButtonText}>{tSafe('ok', 'OK')}</Text>
//               </TouchableOpacity>
//             </View>
//           ) : (
//             <CameraView 
//               style={styles.camera}
//               facing={facing}
//               ref={cameraRef}
//               onCameraReady={() => setIsCameraReady(true)}
//             >
//               {/* Camera Controls */}
//               <View style={styles.cameraControls}>
//                 <TouchableOpacity 
//                   style={styles.captureButton}
//                   onPress={takePicture}
//                   disabled={incidentImages.length >= MAX_IMAGES_UPLOAD}
//                 >
//                   <View style={styles.captureButtonInner}>
//                     <Ionicons name="camera" size={32} color="white" />
//                   </View>
//                 </TouchableOpacity>
//               </View>

//               {/* Photo Counter */}
//               <View style={styles.photoCounter}>
//                 <Ionicons name="images-outline" size={16} color="white" />
//                 <Text style={styles.photoCounterText}>
//                   {incidentImages.length}/{MAX_IMAGES_UPLOAD}
//                 </Text>
//               </View>
//             </CameraView>
//           )}

//           {/* Thumbnail Preview Section */}
//           {incidentImages.length > 0 && (
//             <View style={styles.cameraThumbnailSection}>
//               <FlatList
//                 data={incidentImages}
//                 horizontal
//                 keyExtractor={(item, index) => index.toString()}
//                 renderItem={({ item, index }) => (
//                   <View style={styles.thumbnailContainer}>
//                     <Image source={{ uri: item.uri || item.file }} style={styles.preview} />
//                     <TouchableOpacity 
//                       onPress={() => removePhoto(index)} 
//                       style={styles.removeButton}
//                     >
//                       <Ionicons name="trash-outline" size={14} color="white" />
//                     </TouchableOpacity>
//                     <View style={styles.previewNumber}>
//                       <Text style={styles.previewNumberText}>{index + 1}</Text>
//                     </View>
//                   </View>
//                 )}
//                 contentContainerStyle={styles.previewContainer}
//                 showsHorizontalScrollIndicator={false}
//               />
              
//               <TouchableOpacity 
//                 style={styles.doneButton}
//                 onPress={() => setCameraVisible(false)}
//               >
//                 <Ionicons name="checkmark" size={20} color="white" />
//                 <Text style={styles.doneButtonText}>
//                   {tSafe('done_photos', 'Done ({count} photos)', { count: incidentImages.length })}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           )}

//           {incidentImages.length === 0 && permission?.granted && !isSimulator && (
//             <View style={styles.cameraInstructions}>
//               <Text style={styles.cameraInstructionsText}>
//                 {tSafe('camera_instructions', 'Tap the camera button to capture incident photos')}
//               </Text>
//               <TouchableOpacity 
//                 style={styles.libraryButtonSmall}
//                 onPress={pickImageFromLibrary}
//               >
//                 <Ionicons name="images" size={16} color="white" />
//                 <Text style={styles.libraryButtonTextSmall}>{tSafe('or_pick_from_library', 'or Pick from Library')}</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       </RNModal>

//       {/* Image Viewer Modal */}
//       <RNModal
//         isVisible={imageViewerVisible}
//         style={styles.fullScreenModal}
//         onBackdropPress={() => setImageViewerVisible(false)}
//       >
//         <View style={styles.modalContainer}>
//           <ImageViewer
//             imageUrls={currentImages}
//             index={currentImageIndex}
//             enableSwipeDown
//             onSwipeDown={() => setImageViewerVisible(false)}
//             backgroundColor="black"
//           />
//           <TouchableOpacity
//             style={styles.viewerCloseButton}
//             onPress={() => setImageViewerVisible(false)}
//           >
//             <Ionicons name="close" size={28} color="white" />
//           </TouchableOpacity>
//         </View>
//       </RNModal>

//       {/* Loading Indicator */}
//       {isLoading && (
//         <View style={styles.loaderContainer}>
//           <CustomActivityIndicator size={40} />
//         </View>
//       )}

//       {/* Incidents List */}
//       <FlatList
//         data={incidents}
//         keyExtractor={(item, index) => item?.reported_at ? item.reported_at.toString() : `incident-${index}`}
//         ListHeaderComponent={
//           <View style={styles.header}>
//             <View style={styles.headerIcon}>
//               <Ionicons name="document-text-outline" size={32} color={COLORS.primary} />
//             </View>
//             <Text style={styles.headline}>{tSafe('incident_reports', 'Incident Reports')}</Text>
//             <Text style={styles.subtitle}>{tSafe('document_issues', 'Document any issues or concerns during cleaning')}</Text>
            
//             <View style={styles.infoCard}>
//               <Ionicons name="information-circle" size={20} color={COLORS.warning} />
//               <Text style={styles.infoText}>
//                 {tSafe('report_info_text', 'Report any damages, missing items, or other issues encountered during cleaning.')}
//               </Text>
//             </View>
//           </View>
//         }
//         ListEmptyComponent={!isLoading && <EmptyPlaceholder />}
//         renderItem={renderIncidentItem}
//         contentContainerStyle={styles.listContainer}
//       />

//       {/* Add Incident Button */}
//       {!isEditingAny && (
//         <TouchableOpacity 
//           style={styles.addButton}
//           onPress={() => setIncidentModalOpen(true)}
//         >
//           <Ionicons name="add-circle" size={22} color="white" />
//           <Text style={styles.addButtonText}>{tSafe('report_incident', 'Report Incident')}</Text>
//         </TouchableOpacity>
//       )}

//       {/* Incident Creation Modal */}
//       <Portal>
//         <PaperModal
//           visible={incidentModalOpen}
//           onDismiss={() => {
//             setIncidentModalOpen(false);
//             setIncidentImages([]);
//             setIncidentDescription('');
//           }}
//           style={styles.creationModal}
//         >
//           <View style={styles.modalContentWrapper}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>{tSafe('report_new_incident', 'Report New Incident')}</Text>
//               <TouchableOpacity 
//                 onPress={() => {
//                   setIncidentModalOpen(false);
//                   setIncidentImages([]);
//                   setIncidentDescription('');
//                 }}
//                 style={styles.modalCloseButton}
//               >
//                 <Ionicons name="close" size={24} color={COLORS.dark} />
//               </TouchableOpacity>
//             </View>

//             {/* Camera Button */}
//             <TouchableOpacity 
//               style={styles.cameraButton}
//               onPress={() => setCameraVisible(true)}
//             >
//               <Ionicons name="camera" size={24} color={COLORS.primary} />
//               <Text style={styles.cameraButtonText}>
//                 {isSimulator
//                   ? tSafe('pick_photo_from_library', 'Pick Photo from Library')
//                   : incidentImages.length > 0
//                     ? tSafe('add_more_photos', 'Add More Photos')
//                     : tSafe('take_photo', 'Take Photo')}
//               </Text>
//             </TouchableOpacity>

//             {/* Alternative Library Button */}
//             <TouchableOpacity 
//               style={styles.libraryButtonModal}
//               onPress={pickImageFromLibrary}
//             >
//               <Ionicons name="images" size={24} color={COLORS.primary} />
//               <Text style={styles.libraryButtonTextModal}>
//                 {tSafe('pick_from_photo_library', 'Pick from Photo Library')}
//               </Text>
//             </TouchableOpacity>

//             {/* Image Previews */}
//             {incidentImages.length > 0 && (
//               <View style={styles.previewSection}>
//                 <View style={styles.previewSectionHeader}>
//                   <Text style={styles.previewTitle}>
//                     {tSafe('captured_photos', 'Captured Photos ({count}/{total})', {
//                       count: incidentImages.length,
//                       total: MAX_IMAGES_UPLOAD
//                     })}
//                   </Text>
//                   <TouchableOpacity 
//                     style={styles.clearAllButton}
//                     onPress={() => setIncidentImages([])}
//                   >
//                     <Text style={styles.clearAllText}>{tSafe('clear_all', 'Clear All')}</Text>
//                   </TouchableOpacity>
//                 </View>
//                 <FlatList
//                   horizontal
//                   data={incidentImages}
//                   keyExtractor={(item, index) => `preview-${index}`}
//                   contentContainerStyle={styles.previewContainer}
//                   renderItem={({ item, index }) => (
//                     <PreviewThumbnail item={item} index={index} />
//                   )}
//                 />
//               </View>
//             )}

//             <TextInput
//               label={tSafe('incident_description_label', 'Incident description')}
//               placeholder={tSafe('describe_incident_placeholder', 'Describe what happened...')}
//               mode="outlined"
//               multiline
//               numberOfLines={4}
//               value={incidentDescription}
//               onChangeText={setIncidentDescription}
//               style={styles.modalDescriptionInput}
//               outlineColor="#D8D8D8"
//               activeOutlineColor={COLORS.primary}
//             />

//             <View style={styles.modalActions}>
//               <TouchableOpacity 
//                 style={styles.cancelButton}
//                 onPress={() => {
//                   setIncidentModalOpen(false);
//                   setIncidentImages([]);
//                   setIncidentDescription('');
//                 }}
//               >
//                 <Text style={styles.cancelButtonText}>{tSafe('cancel', 'Cancel')}</Text>
//               </TouchableOpacity>
//               <TouchableOpacity 
//                 style={[
//                   styles.submitButton,
//                   (!incidentDescription.trim() || incidentImages.length === 0) && styles.submitButtonDisabled
//                 ]}
//                 onPress={uploadIncident}
//                 disabled={isUploading || !incidentDescription.trim() || incidentImages.length === 0}
//               >
//                 {isUploading ? (
//                   <ActivityIndicator size="small" color="white" />
//                 ) : (
//                   <>
//                     <Ionicons name="cloud-upload" size={18} color="white" />
//                     <Text style={styles.submitButtonText}>{tSafe('submit_report', 'Submit Report')}</Text>
//                   </>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </PaperModal>
//       </Portal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   header: {
//     padding: 20,
//     backgroundColor: 'white',
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   headerIcon: {
//     alignSelf: 'center',
//     backgroundColor: '#e3f2fd',
//     padding: 12,
//     borderRadius: 50,
//     marginBottom: 12,
//   },
//   headline: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#1a1a1a',
//     textAlign: 'center',
//     marginBottom: 4,
//     letterSpacing: -0.5,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 16,
//     fontWeight: '400',
//   },
//   infoCard: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     padding: 16,
//     backgroundColor: '#fff3cd',
//     borderRadius: 12,
//     borderLeftWidth: 4,
//     borderLeftColor: COLORS.warning,
//   },
//   infoText: {
//     flex: 1,
//     fontSize: 14,
//     color: '#856404',
//     marginLeft: 12,
//     lineHeight: 20,
//   },
//   listContainer: {
//     padding: 16,
//   },
//   incidentCard: {
//     padding: 16,
//   },
//   incidentHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 16,
//   },
//   headerLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   incidentIcon: {
//     backgroundColor: '#ffebee',
//     padding: 8,
//     borderRadius: 10,
//     marginRight: 12,
//   },
//   incidentTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginBottom: 2,
//   },
//   incidentDate: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '400',
//   },
//   editButton: {
//     padding: 8,
//   },
//   imagesContainer: {
//     paddingVertical: 8,
//   },
//   thumbnailContainer: {
//     marginRight: 12,
//     marginBottom: 8,
//     position: 'relative',
//   },
//   incidentImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 12,
//     backgroundColor: '#f0f0f0',
//   },
//   deleteButton: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     padding: 4,
//     borderRadius: 10,
//   },
//   photoNumber: {
//     position: 'absolute',
//     top: 8,
//     left: 8,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   photoNumberText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: '600',
//   },
//   noPhotos: {
//     width: 100,
//     height: 100,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     borderStyle: 'dashed',
//   },
//   noPhotosText: {
//     fontSize: 12,
//     color: '#999',
//     marginTop: 4,
//   },
//   descriptionSection: {
//     marginTop: 8,
//   },
//   descriptionLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginBottom: 8,
//   },
//   descriptionInput: {
//     backgroundColor: 'white',
//   },
//   incidentDescription: {
//     fontSize: 14,
//     color: '#1a1a1a',
//     lineHeight: 20,
//     backgroundColor: '#f8f9fa',
//     padding: 12,
//     borderRadius: 8,
//   },
//   saveButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 12,
//   },
//   saveButtonText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     padding: 40,
//     marginTop: 20,
//   },
//   emptyIcon: {
//     backgroundColor: '#f0f0f0',
//     padding: 20,
//     borderRadius: 50,
//     marginBottom: 16,
//   },
//   emptyTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#666',
//     marginBottom: 8,
//   },
//   emptySubtitle: {
//     fontSize: 14,
//     color: '#999',
//     textAlign: 'center',
//     lineHeight: 20,
//   },
//   addButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     padding: 16,
//     margin: 16,
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   addButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   creationModal: {
//     margin: 20,
//   },
//   modalContentWrapper: {
//     backgroundColor: 'white',
//     borderRadius: 16,
//     overflow: 'hidden',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1a1a1a',
//   },
//   modalCloseButton: {
//     padding: 4,
//   },
//   cameraButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     margin: 20,
//     marginBottom: 12,
//     backgroundColor: '#f8f9fa',
//     borderRadius: 12,
//     borderWidth: 1.5,
//     borderColor: '#e0e0e0',
//   },
//   cameraButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginLeft: 12,
//   },
//   libraryButtonModal: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     marginHorizontal: 20,
//     marginBottom: 16,
//     backgroundColor: '#f0f8ff',
//     borderRadius: 12,
//     borderWidth: 1.5,
//     borderColor: '#e0f0ff',
//   },
//   libraryButtonTextModal: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginLeft: 12,
//   },
//   previewSection: {
//     paddingHorizontal: 20,
//     marginBottom: 16,
//   },
//   previewSectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   previewTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#666',
//   },
//   clearAllButton: {
//     padding: 4,
//   },
//   clearAllText: {
//     fontSize: 14,
//     color: COLORS.error,
//     fontWeight: '500',
//   },
//   previewContainer: {
//     paddingVertical: 8,
//   },
//   previewThumbnailContainer: {
//     marginRight: 12,
//     position: 'relative',
//   },
//   previewThumbnail: {
//     width: 80,
//     height: 80,
//     borderRadius: 8,
//   },
//   removePreviewButton: {
//     position: 'absolute',
//     top: 4,
//     right: 4,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     borderRadius: 10,
//     padding: 4,
//   },
//   previewNumberSmall: {
//     position: 'absolute',
//     top: 4,
//     left: 4,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 4,
//     paddingVertical: 2,
//     borderRadius: 6,
//   },
//   previewNumberTextSmall: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: '600',
//   },
//   modalDescriptionInput: {
//     marginHorizontal: 20,
//     marginBottom: 20,
//     backgroundColor: 'white',
//   },
//   modalActions: {
//     flexDirection: 'row',
//     padding: 20,
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//     gap: 12,
//   },
//   cancelButton: {
//     flex: 1,
//     padding: 14,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     alignItems: 'center',
//   },
//   cancelButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#666',
//   },
//   submitButton: {
//     flex: 2,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     padding: 14,
//     borderRadius: 8,
//   },
//   submitButtonDisabled: {
//     backgroundColor: '#ccc',
//   },
//   submitButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
  
//   // Camera Modal Styles
//   fullScreenModal: {
//     margin: 0,
//   },
//   cameraModalContainer: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   cameraHeader: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 50 : 30,
//     left: 20,
//     right: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     zIndex: 10,
//   },
//   cameraCloseButton: {
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     borderRadius: 20,
//     padding: 8,
//   },
//   flipButton: {
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     borderRadius: 20,
//     padding: 8,
//   },
//   simulatorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#000',
//     paddingHorizontal: 20,
//   },
//   simulatorText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: '600',
//     marginTop: 20,
//     textAlign: 'center',
//   },
//   simulatorSubtext: {
//     color: '#ccc',
//     fontSize: 14,
//     marginTop: 10,
//     textAlign: 'center',
//     marginBottom: 30,
//   },
//   libraryButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 24,
//     paddingVertical: 14,
//     borderRadius: 12,
//     marginTop: 20,
//   },
//   libraryButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 10,
//   },
//   libraryButtonSmall: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 8,
//     marginTop: 8,
//   },
//   libraryButtonTextSmall: {
//     color: 'white',
//     fontSize: 12,
//     fontWeight: '500',
//     marginLeft: 6,
//   },
//   permissionContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#000',
//   },
//   permissionText: {
//     color: 'white',
//     fontSize: 16,
//     marginTop: 16,
//     textAlign: 'center',
//     paddingHorizontal: 20,
//   },
//   permissionButton: {
//     marginTop: 20,
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   permissionButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   camera: {
//     flex: 1,
//   },
//   cameraControls: {
//     position: 'absolute',
//     bottom: 200,
//     alignSelf: 'center',
//   },
//   captureButton: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   captureButtonInner: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: 'rgba(255,255,255,0.3)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 3,
//     borderColor: 'white',
//   },
//   photoCounter: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 100 : 80,
//     alignSelf: 'center',
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//   },
//   photoCounterText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 6,
//   },
//   cameraThumbnailSection: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     paddingHorizontal: 0,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingBottom: Platform.OS === 'ios' ? 34 : 16,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   preview: { 
//     width: 80, 
//     height: 80,
//     borderRadius: 8,
//     backgroundColor: '#f0f0f0',
//   },
//   removeButton: {
//     position: 'absolute',
//     top: 4,
//     right: 4,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     borderRadius: 12,
//     padding: 4,
//   },
//   previewNumber: {
//     position: 'absolute',
//     top: 4,
//     left: 4,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   previewNumberText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: '600',
//   },
//   doneButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     padding: 12,
//     borderRadius: 12,
//     marginTop: 12,
//   },
//   doneButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   cameraInstructions: {
//     position: 'absolute',
//     bottom: 40,
//     alignSelf: 'center',
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 16,
//     alignItems: 'center',
//   },
//   cameraInstructionsText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'black',
//   },
//   viewerCloseButton: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 50 : 30,
//     right: 20,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     borderRadius: 20,
//     padding: 8,
//     zIndex: 1,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(255,255,255,0.9)',
//     zIndex: 10,
//   },
// });

// export default ReportIncident;




// import React, { useState, useRef, useCallback, useContext, useEffect, memo } from 'react';
// import { 
//   View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, 
//   ActivityIndicator, Dimensions, SafeAreaView, ScrollView, Platform, KeyboardAvoidingView
// } from 'react-native';
// import { TextInput } from 'react-native-paper';
// import { Ionicons } from '@expo/vector-icons'; 
// import { useFocusEffect } from '@react-navigation/native';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import * as ImagePicker from 'expo-image-picker';
// import userService from '../../../services/connection/userService';
// // import { Modal as PaperModal, Portal } from 'react-native-paper';
// import Modal from 'react-native-modal'; // Ensure this is imported at the top
// import COLORS from '../../../constants/colors';
// import RNModal from 'react-native-modal';
// import ImageViewer from 'react-native-image-zoom-viewer';
// import { AuthContext } from '../../../context/AuthContext';
// import CardNoPrimary from '../../../components/shared/CardNoPrimary';
// import { Image } from 'expo-image';
// import CustomActivityIndicator from '../../../components/shared/CuustomActivityIndicator';
// import { tSafe } from '../../../utils/tSafe';

// const { width, height } = Dimensions.get('window');

// // ─── Memoized Modal Content ──────────────────────────────────────
// // const IncidentModalContent = memo(({
// //   visible,
// //   incidentDescription,
// //   setIncidentDescription,
// //   incidentImages,
// //   setIncidentImages,
// //   isUploading,
// //   uploadIncident,
// //   onClose,
// //   openCamera,
// //   pickImageFromLibrary,
// //   MAX_IMAGES_UPLOAD,
// // }) => {
// //   const removePhoto = (index) => {
// //     setIncidentImages(prev => prev.filter((_, i) => i !== index));
// //   };

// //   return (
// //     <PaperModal
// //       visible={visible}
// //       onDismiss={onClose}
// //       style={styles.creationModal}
// //     >
// //       <View style={styles.modalContentWrapper}>
// //         <View style={styles.modalHeader}>
// //           <Text style={styles.modalTitle}>{tSafe('report_new_incident', 'Report New Incident')}</Text>
// //           <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
// //             <Ionicons name="close" size={24} color={COLORS.dark} />
// //           </TouchableOpacity>
// //         </View>

// //         <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
// //           <Ionicons name="camera" size={24} color={COLORS.primary} />
// //           <Text style={styles.cameraButtonText}>
// //             {incidentImages.length > 0
// //               ? tSafe('add_more_photos', 'Add More Photos')
// //               : tSafe('take_photo', 'Take Photo')}
// //           </Text>
// //         </TouchableOpacity>

// //         <TouchableOpacity style={styles.libraryButtonModal} onPress={pickImageFromLibrary}>
// //           <Ionicons name="images" size={24} color={COLORS.primary} />
// //           <Text style={styles.libraryButtonTextModal}>
// //             {tSafe('pick_from_photo_library', 'Pick from Photo Library')}
// //           </Text>
// //         </TouchableOpacity>

// //         {incidentImages.length > 0 && (
// //           <View style={styles.previewSection}>
// //             <View style={styles.previewSectionHeader}>
// //               <Text style={styles.previewTitle}>
// //                 {tSafe('captured_photos', 'Captured Photos ({count}/{total})', {
// //                   count: incidentImages.length,
// //                   total: MAX_IMAGES_UPLOAD
// //                 })}
// //               </Text>
// //               <TouchableOpacity style={styles.clearAllButton} onPress={() => setIncidentImages([])}>
// //                 <Text style={styles.clearAllText}>{tSafe('clear_all', 'Clear All')}</Text>
// //               </TouchableOpacity>
// //             </View>
// //             <FlatList
// //               horizontal
// //               data={incidentImages}
// //               keyExtractor={(item, index) => `preview-${index}`}
// //               contentContainerStyle={styles.previewContainer}
// //               renderItem={({ item, index }) => (
// //                 <View style={styles.previewThumbnailContainer}>
// //                   <Image source={{ uri: item.uri || item.file }} style={styles.previewThumbnail} />
// //                   <TouchableOpacity
// //                     style={styles.removePreviewButton}
// //                     onPress={() => removePhoto(index)}
// //                   >
// //                     <Ionicons name="close" size={16} color="white" />
// //                   </TouchableOpacity>
// //                   <View style={styles.previewNumberSmall}>
// //                     <Text style={styles.previewNumberTextSmall}>{index + 1}</Text>
// //                   </View>
// //                 </View>
// //               )}
// //             />
// //           </View>
// //         )}

// //         <TextInput
// //           label={tSafe('incident_description_label', 'Incident description')}
// //           placeholder={tSafe('describe_incident_placeholder', 'Describe what happened...')}
// //           mode="outlined"
// //           multiline
// //           numberOfLines={4}
// //           value={incidentDescription}
// //           onChangeText={setIncidentDescription}
// //           style={styles.modalDescriptionInput}
// //           outlineColor="#D8D8D8"
// //           activeOutlineColor={COLORS.primary}
// //         />

// //         <View style={styles.modalActions}>
// //           <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
// //             <Text style={styles.cancelButtonText}>{tSafe('cancel', 'Cancel')}</Text>
// //           </TouchableOpacity>
// //           <TouchableOpacity
// //             style={[
// //               styles.submitButton,
// //               (!incidentDescription.trim() || incidentImages.length === 0) && styles.submitButtonDisabled
// //             ]}
// //             onPress={uploadIncident}
// //             disabled={isUploading || !incidentDescription.trim() || incidentImages.length === 0}
// //           >
// //             {isUploading ? (
// //               <ActivityIndicator size="small" color="white" />
// //             ) : (
// //               <>
// //                 <Ionicons name="cloud-upload" size={18} color="white" />
// //                 <Text style={styles.submitButtonText}>{tSafe('submit_report', 'Submit Report')}</Text>
// //               </>
// //             )}
// //           </TouchableOpacity>
// //         </View>
// //       </View>
// //     </PaperModal>
// //   );
// // });

// const IncidentModalContent = memo(({
//   visible,
//   incidentDescription,
//   setIncidentDescription,
//   incidentImages,
//   setIncidentImages,
//   isUploading,
//   uploadIncident,
//   onClose,
//   openCamera,
//   pickImageFromLibrary,
//   MAX_IMAGES_UPLOAD,
// }) => {
//   const scrollViewRef = useRef(null);
//   const inputRef = useRef(null);

//   const removePhoto = (index) => {
//     setIncidentImages(prev => prev.filter((_, i) => i !== index));
//   };

//   // Scroll to the bottom when the keyboard appears or photos change
//   const scrollToBottom = () => {
//     setTimeout(() => {
//       scrollViewRef.current?.scrollToEnd({ animated: true });
//     }, 300);
//   };

//   // Focus handler – scrolls to input
//   const handleInputFocus = () => {
//     scrollToBottom();
//   };

//   // Whenever photos change, scroll to bottom so the input is visible
//   useEffect(() => {
//     if (incidentImages.length > 0) {
//       scrollToBottom();
//     }
//   }, [incidentImages]);

//   return (
//     <Modal
//       isVisible={visible}
//       onBackdropPress={onClose}
//       onSwipeComplete={onClose}
//       swipeDirection="down"
//       style={styles.modal}
//       backdropOpacity={0.5}
//       animationIn="slideInUp"
//       animationOut="slideOutDown"
//     >
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={{ flex: 1 }}
//         keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
//       >
//         <ScrollView
//           ref={scrollViewRef}
//           style={styles.modalScroll}
//           contentContainerStyle={styles.modalScrollContent}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//         >
//           {/* Header */}
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>{tSafe('report_new_incident', 'Report New Incident')}</Text>
//             <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
//               <Ionicons name="close" size={24} color={COLORS.dark} />
//             </TouchableOpacity>
//           </View>

//           {/* Camera & Library Buttons */}
//           <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
//             <Ionicons name="camera" size={24} color={COLORS.primary} />
//             <Text style={styles.cameraButtonText}>
//               {incidentImages.length > 0
//                 ? tSafe('add_more_photos', 'Add More Photos')
//                 : tSafe('take_photo', 'Take Photo')}
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.libraryButtonModal} onPress={pickImageFromLibrary}>
//             <Ionicons name="images" size={24} color={COLORS.primary} />
//             <Text style={styles.libraryButtonTextModal}>
//               {tSafe('pick_from_photo_library', 'Pick from Photo Library')}
//             </Text>
//           </TouchableOpacity>

//           {/* Image Previews */}
//           {incidentImages.length > 0 && (
//             <View style={styles.previewSection}>
//               <View style={styles.previewSectionHeader}>
//                 <Text style={styles.previewTitle}>
//                   {tSafe('captured_photos', 'Captured Photos ({count}/{total})', {
//                     count: incidentImages.length,
//                     total: MAX_IMAGES_UPLOAD
//                   })}
//                 </Text>
//                 <TouchableOpacity style={styles.clearAllButton} onPress={() => setIncidentImages([])}>
//                   <Text style={styles.clearAllText}>{tSafe('clear_all', 'Clear All')}</Text>
//                 </TouchableOpacity>
//               </View>
//               <FlatList
//                 horizontal
//                 data={incidentImages}
//                 keyExtractor={(item, index) => `preview-${index}`}
//                 contentContainerStyle={styles.previewContainer}
//                 renderItem={({ item, index }) => (
//                   <View style={styles.previewThumbnailContainer}>
//                     <Image source={{ uri: item.uri || item.file }} style={styles.previewThumbnail} />
//                     <TouchableOpacity
//                       style={styles.removePreviewButton}
//                       onPress={() => removePhoto(index)}
//                     >
//                       <Ionicons name="close" size={16} color="white" />
//                     </TouchableOpacity>
//                     <View style={styles.previewNumberSmall}>
//                       <Text style={styles.previewNumberTextSmall}>{index + 1}</Text>
//                     </View>
//                   </View>
//                 )}
//               />
//             </View>
//           )}

//           {/* Description Input */}
//           <TextInput
//             ref={inputRef}
//             label={tSafe('incident_description_label', 'Incident description')}
//             placeholder={tSafe('describe_incident_placeholder', 'Describe what happened...')}
//             mode="outlined"
//             multiline
//             numberOfLines={4}
//             value={incidentDescription}
//             onChangeText={setIncidentDescription}
//             onFocus={handleInputFocus}
//             style={styles.modalDescriptionInput}
//             outlineColor="#D8D8D8"
//             activeOutlineColor={COLORS.primary}
//           />

//           {/* Actions */}
//           <View style={styles.modalActions}>
//             <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
//               <Text style={styles.cancelButtonText}>{tSafe('cancel', 'Cancel')}</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[
//                 styles.submitButton,
//                 (!incidentDescription.trim() || incidentImages.length === 0) && styles.submitButtonDisabled
//               ]}
//               onPress={uploadIncident}
//               disabled={isUploading || !incidentDescription.trim() || incidentImages.length === 0}
//             >
//               {isUploading ? (
//                 <ActivityIndicator size="small" color="white" />
//               ) : (
//                 <>
//                   <Ionicons name="cloud-upload" size={18} color="white" />
//                   <Text style={styles.submitButtonText}>{tSafe('submit_report', 'Submit Report')}</Text>
//                 </>
//               )}
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </Modal>
//   );
// });
// // ─── Helper Components ──────────────────────────────────────────
// const IncidentListHeader = memo(() => (
//   <View style={styles.header}>
//     <View style={styles.headerIcon}>
//       <Ionicons name="document-text-outline" size={32} color={COLORS.primary} />
//     </View>
//     <Text style={styles.headline}>{tSafe('incident_reports', 'Incident Reports')}</Text>
//     <Text style={styles.subtitle}>{tSafe('document_issues', 'Document any issues or concerns during cleaning')}</Text>
//     <View style={styles.infoCard}>
//       <Ionicons name="information-circle" size={20} color={COLORS.warning} />
//       <Text style={styles.infoText}>
//         {tSafe('report_info_text', 'Report any damages, missing items, or other issues encountered during cleaning.')}
//       </Text>
//     </View>
//   </View>
// ));

// const EmptyPlaceholder = memo(() => (
//   <View style={styles.emptyContainer}>
//     <View style={styles.emptyIcon}>
//       <Ionicons name="shield-checkmark" size={48} color={COLORS.lightGray} />
//     </View>
//     <Text style={styles.emptyTitle}>{tSafe('no_incidents_reported', 'No Incidents Reported')}</Text>
//     <Text style={styles.emptySubtitle}>
//       {tSafe('no_incidents_message', 'Great job! No issues have been reported for this cleaning session.')}
//     </Text>
//   </View>
// ));

// // ─── Main Component ──────────────────────────────────────────────
// const ReportIncident = ({ scheduleId }) => {
//   const { currentUserId } = useContext(AuthContext);
//   const cameraRef = useRef(null);
//   const [incidentModalOpen, setIncidentModalOpen] = useState(false);
//   const [cameraVisible, setCameraVisible] = useState(false);
//   const [incidentImages, setIncidentImages] = useState([]);
//   const [incidentDescription, setIncidentDescription] = useState('');
//   const [incidents, setIncidents] = useState([]);
//   const [facing, setFacing] = useState('back');
//   const [isLoading, setIsLoading] = useState(false);
//   const [imageViewerVisible, setImageViewerVisible] = useState(false);
//   const [currentImages, setCurrentImages] = useState([]);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [isUploading, setIsUploading] = useState(false);
//   const [permission, requestPermission] = useCameraPermissions();
//   const [editingDescription, setEditingDescription] = useState('');
//   const [editingIncidentId, setEditingIncidentId] = useState(null);
//   const [isCameraReady, setIsCameraReady] = useState(false);
//   const [isSimulator, setIsSimulator] = useState(false);
  
//   const MAX_IMAGES_UPLOAD = 5;

//   // Check if running on simulator
//   useEffect(() => {
//     if (Platform.OS === 'ios') {
//       const checkSimulator = async () => {
//         try {
//           if (permission?.granted) {
//             setIsSimulator(false);
//           }
//         } catch (error) {
//           setIsSimulator(true);
//         }
//       };
//       checkSimulator();
//     }
//   }, [permission]);

//   // Request camera and media library permissions
//   useEffect(() => {
//     (async () => {
//       if (permission && !permission.granted) {
//         await requestPermission();
//       }
//       const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (mediaStatus !== 'granted') {
//         console.log('Media library permission denied');
//       }
//     })();
//   }, [permission, requestPermission]);

//   // Data fetching
//   const fetchIncidents = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const response = await userService.getIncidents(scheduleId);
//       const schedule = response.data.data;
//       const cleanerGroup = schedule.assignedTo?.find(
//         (group) => group.cleanerId === currentUserId
//       );
//       const cleanerIncidents = cleanerGroup?.incidents || [];
//       setIncidents(cleanerIncidents);
//     } catch (error) {
//       console.error("Fetch incidents error:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [scheduleId, currentUserId]);

//   useFocusEffect(
//     useCallback(() => {
//       fetchIncidents();
//       return () => {};
//     }, [fetchIncidents])
//   );

//   // Take picture with camera or pick from library
//   const takePicture = useCallback(async () => {
//     if (isSimulator || !permission?.granted) {
//       await pickImageFromLibrary();
//       return;
//     }

//     if (cameraRef.current && isCameraReady) {
//       try {
//         const photo = await cameraRef.current.takePictureAsync({
//           quality: 0.8,
//           base64: true,
//           exif: false,
//           skipProcessing: true
//         });
        
//         const newPhoto = {
//           uri: photo.uri,
//           base64: photo.base64,
//           filename: `incident_${Date.now()}.jpg`,
//           file: `data:image/jpg;base64,${photo.base64}`
//         };
        
//         if (incidentImages.length < MAX_IMAGES_UPLOAD) {
//           setIncidentImages(prev => [...prev, newPhoto]);
//         } else {
//           Alert.alert(
//             tSafe('limit_reached_title', 'Limit reached'),
//             tSafe('max_photos_allowed', 'Maximum {count} photos allowed', { count: MAX_IMAGES_UPLOAD })
//           );
//         }
//       } catch (error) {
//         console.error('Camera error:', error);
//         Alert.alert(
//           tSafe('error_title', 'Error'),
//           tSafe('failed_capture_image', 'Failed to capture image. Using photo library instead.')
//         );
//         await pickImageFromLibrary();
//       }
//     } else {
//       await pickImageFromLibrary();
//     }
//   }, [isSimulator, permission, isCameraReady, incidentImages, MAX_IMAGES_UPLOAD]);

//   // Pick image from library
//   const pickImageFromLibrary = useCallback(async () => {
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: false,
//         aspect: [4, 3],
//         quality: 0.8,
//         base64: true,
//         allowsMultipleSelection: true,
//         selectionLimit: MAX_IMAGES_UPLOAD - incidentImages.length
//       });

//       if (!result.canceled) {
//         const newPhotos = result.assets.map((asset, index) => ({
//           uri: asset.uri,
//           base64: asset.base64,
//           filename: `incident_${Date.now()}_${index}.jpg`,
//           file: `data:image/jpg;base64,${asset.base64}`
//         }));

//         if (incidentImages.length + newPhotos.length <= MAX_IMAGES_UPLOAD) {
//           setIncidentImages(prev => [...prev, ...newPhotos]);
//         } else {
//           Alert.alert(
//             tSafe('limit_reached_title', 'Limit reached'),
//             tSafe('max_photos_allowed', 'Maximum {count} photos allowed', { count: MAX_IMAGES_UPLOAD })
//           );
//         }
//       }
//     } catch (error) {
//       console.error('Image picker error:', error);
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe('failed_pick_image', 'Failed to pick image from library')
//       );
//     }
//   }, [incidentImages, MAX_IMAGES_UPLOAD]);

//   // Flip camera
//   const flipCamera = useCallback(() => {
//     setFacing(current => current === 'back' ? 'front' : 'back');
//   }, []);

//   // Image handling
//   const removePhoto = useCallback((index) => {
//     setIncidentImages(prev => prev.filter((_, i) => i !== index));
//   }, []);

//   const openImageViewer = useCallback((images, index) => {
//     if (Array.isArray(images)) {
//       const formattedImages = images.map(img => ({ 
//         url: img.url || img.uri || img.file,
//         props: { source: { uri: img.url || img.uri || img.file } }
//       }));
//       setCurrentImages(formattedImages);
//       setCurrentImageIndex(index);
//       setImageViewerVisible(true);
//     }
//   }, []);

//   // Incident CRUD operations
//   const uploadIncident = useCallback(async () => {
//     if (!incidentDescription.trim()) {
//       Alert.alert(
//         tSafe('validation_title', 'Validation'),
//         tSafe('enter_incident_description', 'Please enter incident description')
//       );
//       return;
//     }
  
//     if (incidentImages.length === 0) {
//       Alert.alert(
//         tSafe('validation_title', 'Validation'),
//         tSafe('add_incident_photo', 'Please add at least one photo')
//       );
//       return;
//     }
  
//     try {
//       setIsUploading(true);
      
//       const formData = new FormData();
//       formData.append('scheduleId', scheduleId);
//       formData.append('cleanerId', currentUserId);
//       formData.append('description', incidentDescription);

//       incidentImages.forEach((image, index) => {
//         if (image.uri) {
//           const filename = image.filename || `incident_${Date.now()}_${index}.jpg`;
//           formData.append('files', {
//             uri: image.uri,
//             name: filename,
//             type: 'image/jpeg',
//           });
//         }
//       });

//       const response = await userService.uploadPhotosIncidentPhotos(formData);
      
//       const newIncident = {
//         ...response.data,
//         photos: response.data.uploaded_files || incidentImages.map(img => ({ 
//           url: img.uri || img.file,
//           content_type: 'image/jpeg',
//           original_name: img.filename || 'incident_photo.jpg'
//         })),
//         description: incidentDescription,
//         reported_at: new Date().toISOString()
//       };
      
//       setIncidents(prev => [...prev, newIncident]);
//       setIncidentImages([]);
//       setIncidentDescription('');
//       setIncidentModalOpen(false);
//       Alert.alert(
//         tSafe('success_title', 'Success'),
//         tSafe('incident_reported', 'Incident reported successfully')
//       );
//     } catch (error) {
//       console.error('Upload error:', error.response?.data || error.message || error);
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe('failed_submit_incident', 'Failed to submit incident. Please try again.')
//       );
//     } finally {
//       setIsUploading(false);
//     }
//   }, [incidentDescription, incidentImages, scheduleId, currentUserId]);

//   const handleToggleEdit = useCallback((incident) => {
//     if (editingIncidentId === incident.reported_at) {
//       setEditingIncidentId(null);
//       setEditingDescription('');
//     } else {
//       setEditingIncidentId(incident.reported_at);
//       setEditingDescription(incident.description || '');
//     }
//   }, [editingIncidentId]);

//   const handleSaveEdit = useCallback(async () => {
//     if (!editingIncidentId || !editingDescription.trim()) {
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe('enter_description', 'Please enter a description')
//       );
//       return;
//     }

//     try {
//       setIsLoading(true);
      
//       const updatedIncidents = incidents.map(inc => 
//         inc.reported_at === editingIncidentId
//           ? { ...inc, description: editingDescription, isEditing: false }
//           : inc
//       );
      
//       setIncidents(updatedIncidents);
      
//       await userService.updateScheduleIncidents({
//         scheduleId,
//         cleanerId: currentUserId,
//         incidents: updatedIncidents.map(({ isEditing, ...inc }) => ({
//           ...inc,
//           photos: inc.photos.map(photo => ({
//             url: photo.url,
//             content_type: photo.content_type || 'image/jpeg',
//             original_name: photo.original_name || 'incident_photo.jpg'
//           }))
//         }))
//       });
      
//       setEditingIncidentId(null);
//       setEditingDescription('');
      
//       Alert.alert(
//         tSafe('success_title', 'Success'),
//         tSafe('incident_updated', 'Incident updated successfully')
//       );
//     } catch (error) {
//       console.error('Update error:', error);
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe('failed_save_changes', 'Failed to save changes')
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   }, [editingIncidentId, editingDescription, incidents, scheduleId, currentUserId]);

//   const handleDeleteImage = useCallback((incidentId, imageUrl) => {
//     const updatedIncidents = incidents.map(inc => 
//       inc.reported_at === incidentId
//         ? { ...inc, photos: inc.photos.filter(photo => photo.url !== imageUrl) }
//         : inc
//     );
    
//     setIncidents(updatedIncidents);
    
//     userService.updateScheduleIncidents({
//       scheduleId,
//       cleanerId: currentUserId,
//       incidents: updatedIncidents.map(({ isEditing, ...inc }) => ({
//         ...inc,
//         photos: inc.photos.map(photo => ({
//           url: photo.url,
//           content_type: photo.content_type || 'image/jpeg',
//           original_name: photo.original_name || 'incident_photo.jpg'
//         }))
//       }))
//     }).catch(error => {
//       console.error('Delete image error:', error);
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe('failed_delete_image', 'Failed to delete image')
//       );
//     });
//   }, [incidents, scheduleId, currentUserId]);

//   // Render helpers
//   const IncidentImageThumbnail = useCallback(({ photo, index, onDelete, onPress }) => (
//     <View style={styles.thumbnailContainer}>
//       <TouchableOpacity onPress={onPress}>
//         <Image 
//           source={{ uri: photo.url || photo.uri || photo.file }} 
//           style={styles.incidentImage}
//           transition={300}
//           cachePolicy="memory-disk"
//         />
//       </TouchableOpacity>
//       <TouchableOpacity 
//         style={styles.deleteButton} 
//         onPress={onDelete}
//       >
//         <Ionicons name="close-circle" size={20} color="white" />
//       </TouchableOpacity>
//       <View style={styles.photoNumber}>
//         <Text style={styles.photoNumberText}>{index + 1}</Text>
//       </View>
//     </View>
//   ), []);

//   const renderIncidentItem = useCallback(({ item }) => {
//     const isEditing = editingIncidentId === item.reported_at;
//     return (
//       <CardNoPrimary key={item.reported_at}>
//         <View style={styles.incidentCard}>
//           <View style={styles.incidentHeader}>
//             <View style={styles.headerLeft}>
//               <View style={styles.incidentIcon}>
//                 <Ionicons name="warning" size={20} color="#d32f2f" />
//               </View>
//               <View>
//                 <Text style={styles.incidentTitle}>{tSafe('incident_report', 'Incident Report')}</Text>
//                 <Text style={styles.incidentDate}>
//                   {new Date(item.reported_at).toLocaleDateString()}
//                 </Text>
//               </View>
//             </View>
//             <TouchableOpacity 
//               onPress={() => handleToggleEdit(item)} 
//               style={styles.editButton}
//             >
//               <Ionicons 
//                 name={isEditing ? "close" : "create-outline"} 
//                 size={20} 
//                 color={COLORS.primary} 
//               />
//             </TouchableOpacity>
//           </View>

//           <FlatList
//             horizontal
//             data={item.photos}
//             keyExtractor={(photo, index) => `${item.reported_at}-${index}`}
//             renderItem={({ item: photo, index }) => (
//               <IncidentImageThumbnail
//                 photo={photo}
//                 index={index}
//                 onDelete={() => handleDeleteImage(item.reported_at, photo.url)}
//                 onPress={() => openImageViewer(item.photos, index)}
//               />
//             )}
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.imagesContainer}
//             ListEmptyComponent={
//               <View style={styles.noPhotos}>
//                 <Ionicons name="images-outline" size={32} color="#ddd" />
//                 <Text style={styles.noPhotosText}>{tSafe('no_photos', 'No photos')}</Text>
//               </View>
//             }
//           />

//           <View style={styles.descriptionSection}>
//             <Text style={styles.descriptionLabel}>{tSafe('description', 'Description')}</Text>
//             {isEditing ? (
//               <View>
//                 <TextInput
//                   label={tSafe('describe_incident', 'Describe the incident...')}
//                   mode="outlined"
//                   multiline
//                   numberOfLines={4}
//                   outlineColor="#D8D8D8"
//                   activeOutlineColor={COLORS.primary}
//                   style={styles.descriptionInput}
//                   value={editingDescription}
//                   onChangeText={setEditingDescription}
//                   autoFocus={true}
//                 />
//                 <TouchableOpacity 
//                   style={styles.saveButton} 
//                   onPress={handleSaveEdit}
//                   disabled={isLoading}
//                 >
//                   <Ionicons name="checkmark" size={18} color="white" />
//                   <Text style={styles.saveButtonText}>
//                     {isLoading ? tSafe('saving', 'Saving...') : tSafe('save_changes', 'Save Changes')}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               <Text style={styles.incidentDescription}>{item.description}</Text>
//             )}
//           </View>
//         </View>
//       </CardNoPrimary>
//     );
//   }, [editingIncidentId, editingDescription, handleToggleEdit, handleSaveEdit, isLoading, openImageViewer, handleDeleteImage, IncidentImageThumbnail]);

//   const isEditingAny = editingIncidentId !== null;

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Camera Modal */}
//       <RNModal
//         isVisible={cameraVisible}
//         style={styles.fullScreenModal}
//         onBackdropPress={() => setCameraVisible(false)}
//       >
//         <View style={styles.cameraModalContainer}>
//           <View style={styles.cameraHeader}>
//             <TouchableOpacity 
//               style={styles.cameraCloseButton}
//               onPress={() => setCameraVisible(false)}
//             >
//               <Ionicons name="chevron-down" size={28} color="white" />
//             </TouchableOpacity>
            
//             {!isSimulator && permission?.granted && (
//               <TouchableOpacity 
//                 style={styles.flipButton}
//                 onPress={flipCamera}
//               >
//                 <Ionicons name="camera-reverse" size={24} color="white" />
//               </TouchableOpacity>
//             )}
//           </View>

//           {isSimulator ? (
//             <View style={styles.simulatorContainer}>
//               <Ionicons name="camera-off" size={64} color="white" />
//               <Text style={styles.simulatorText}>{tSafe('camera_not_available_simulator', 'Camera not available in simulator')}</Text>
//               <Text style={styles.simulatorSubtext}>
//                 {tSafe('use_pick_from_library', 'Use "Pick from Library" button below to add photos')}
//               </Text>
              
//               <TouchableOpacity 
//                 style={styles.libraryButton}
//                 onPress={pickImageFromLibrary}
//               >
//                 <Ionicons name="images" size={24} color="white" />
//                 <Text style={styles.libraryButtonText}>{tSafe('pick_from_library', 'Pick from Library')}</Text>
//               </TouchableOpacity>
//             </View>
//           ) : !permission ? (
//             <View style={styles.permissionContainer}>
//               <ActivityIndicator size="large" color="white" />
//               <Text style={styles.permissionText}>{tSafe('requesting_camera_permission', 'Requesting camera permission...')}</Text>
//             </View>
//           ) : !permission.granted ? (
//             <View style={styles.permissionContainer}>
//               <Ionicons name="camera-off" size={48} color="white" />
//               <Text style={styles.permissionText}>{tSafe('no_access_camera', 'No access to camera')}</Text>
//               <TouchableOpacity 
//                 style={styles.permissionButton}
//                 onPress={() => {
//                   setCameraVisible(false);
//                   Alert.alert(
//                     tSafe('permission_required_title', 'Permission Required'),
//                     tSafe('enable_camera_permissions', 'Please enable camera permissions in your device settings.'),
//                     [{ text: tSafe('ok', 'OK') }]
//                   );
//                 }}
//               >
//                 <Text style={styles.permissionButtonText}>{tSafe('ok', 'OK')}</Text>
//               </TouchableOpacity>
//             </View>
//           ) : (
//             <CameraView 
//               style={styles.camera}
//               facing={facing}
//               ref={cameraRef}
//               onCameraReady={() => setIsCameraReady(true)}
//             >
//               <View style={styles.cameraControls}>
//                 <TouchableOpacity 
//                   style={styles.captureButton}
//                   onPress={takePicture}
//                   disabled={incidentImages.length >= MAX_IMAGES_UPLOAD}
//                 >
//                   <View style={styles.captureButtonInner}>
//                     <Ionicons name="camera" size={32} color="white" />
//                   </View>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.photoCounter}>
//                 <Ionicons name="images-outline" size={16} color="white" />
//                 <Text style={styles.photoCounterText}>
//                   {incidentImages.length}/{MAX_IMAGES_UPLOAD}
//                 </Text>
//               </View>
//             </CameraView>
//           )}

//           {incidentImages.length > 0 && (
//             <View style={styles.cameraThumbnailSection}>
//               <FlatList
//                 data={incidentImages}
//                 horizontal
//                 keyExtractor={(item, index) => index.toString()}
//                 renderItem={({ item, index }) => (
//                   <View style={styles.thumbnailContainer}>
//                     <Image source={{ uri: item.uri || item.file }} style={styles.preview} />
//                     <TouchableOpacity 
//                       onPress={() => removePhoto(index)} 
//                       style={styles.removeButton}
//                     >
//                       <Ionicons name="trash-outline" size={14} color="white" />
//                     </TouchableOpacity>
//                     <View style={styles.previewNumber}>
//                       <Text style={styles.previewNumberText}>{index + 1}</Text>
//                     </View>
//                   </View>
//                 )}
//                 contentContainerStyle={styles.previewContainer}
//                 showsHorizontalScrollIndicator={false}
//               />
              
//               <TouchableOpacity 
//                 style={styles.doneButton}
//                 onPress={() => setCameraVisible(false)}
//               >
//                 <Ionicons name="checkmark" size={20} color="white" />
//                 <Text style={styles.doneButtonText}>
//                   {tSafe('done_photos', 'Done ({count} photos)', { count: incidentImages.length })}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           )}

//           {incidentImages.length === 0 && permission?.granted && !isSimulator && (
//             <View style={styles.cameraInstructions}>
//               <Text style={styles.cameraInstructionsText}>
//                 {tSafe('camera_instructions', 'Tap the camera button to capture incident photos')}
//               </Text>
//               <TouchableOpacity 
//                 style={styles.libraryButtonSmall}
//                 onPress={pickImageFromLibrary}
//               >
//                 <Ionicons name="images" size={16} color="white" />
//                 <Text style={styles.libraryButtonTextSmall}>{tSafe('or_pick_from_library', 'or Pick from Library')}</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       </RNModal>

//       {/* Image Viewer Modal */}
//       <RNModal
//         isVisible={imageViewerVisible}
//         style={styles.fullScreenModal}
//         onBackdropPress={() => setImageViewerVisible(false)}
//       >
//         <View style={styles.modalContainer}>
//           <ImageViewer
//             imageUrls={currentImages}
//             index={currentImageIndex}
//             enableSwipeDown
//             onSwipeDown={() => setImageViewerVisible(false)}
//             backgroundColor="black"
//           />
//           <TouchableOpacity
//             style={styles.viewerCloseButton}
//             onPress={() => setImageViewerVisible(false)}
//           >
//             <Ionicons name="close" size={28} color="white" />
//           </TouchableOpacity>
//         </View>
//       </RNModal>

//       {/* Loading Indicator */}
//       {isLoading && (
//         <View style={styles.loaderContainer}>
//           <CustomActivityIndicator size={40} />
//         </View>
//       )}

//       {/* Incidents List */}
//       <FlatList
//         data={incidents}
//         keyExtractor={(item, index) => item?.reported_at ? item.reported_at.toString() : `incident-${index}`}
//         ListHeaderComponent={IncidentListHeader}
//         ListEmptyComponent={!isLoading && EmptyPlaceholder}
//         renderItem={renderIncidentItem}
//         contentContainerStyle={styles.listContainer}
//         extraData={[editingIncidentId, editingDescription]}
//       />

//       {/* Add Incident Button */}
//       {!isEditingAny && (
//         <TouchableOpacity 
//           style={styles.addButton}
//           onPress={() => setIncidentModalOpen(true)}
//         >
//           <Ionicons name="add-circle" size={22} color="white" />
//           <Text style={styles.addButtonText}>{tSafe('report_incident', 'Report Incident')}</Text>
//         </TouchableOpacity>
//       )}

//       {/* Incident Creation Modal */}
//       <IncidentModalContent
//         visible={incidentModalOpen}
//         incidentDescription={incidentDescription}
//         setIncidentDescription={setIncidentDescription}
//         incidentImages={incidentImages}
//         setIncidentImages={setIncidentImages}
//         isUploading={isUploading}
//         uploadIncident={uploadIncident}
//         onClose={() => {
//           setIncidentModalOpen(false);
//           setIncidentImages([]);
//           setIncidentDescription('');
//         }}
//         openCamera={() => setCameraVisible(true)}
//         pickImageFromLibrary={pickImageFromLibrary}
//         MAX_IMAGES_UPLOAD={MAX_IMAGES_UPLOAD}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   header: {
//     padding: 20,
//     backgroundColor: 'white',
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   headerIcon: {
//     alignSelf: 'center',
//     backgroundColor: '#e3f2fd',
//     padding: 12,
//     borderRadius: 50,
//     marginBottom: 12,
//   },
//   headline: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#1a1a1a',
//     textAlign: 'center',
//     marginBottom: 4,
//     letterSpacing: -0.5,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 16,
//     fontWeight: '400',
//   },
//   infoCard: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     padding: 16,
//     backgroundColor: '#fff3cd',
//     borderRadius: 12,
//     borderLeftWidth: 4,
//     borderLeftColor: COLORS.warning,
//   },
//   infoText: {
//     flex: 1,
//     fontSize: 14,
//     color: '#856404',
//     marginLeft: 12,
//     lineHeight: 20,
//   },
//   listContainer: {
//     padding: 16,
//   },
//   incidentCard: {
//     padding: 16,
//   },
//   incidentHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 16,
//   },
//   headerLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   incidentIcon: {
//     backgroundColor: '#ffebee',
//     padding: 8,
//     borderRadius: 10,
//     marginRight: 12,
//   },
//   incidentTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginBottom: 2,
//   },
//   incidentDate: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '400',
//   },
//   editButton: {
//     padding: 8,
//   },
//   imagesContainer: {
//     paddingVertical: 8,
//   },
//   thumbnailContainer: {
//     marginRight: 12,
//     marginBottom: 8,
//     position: 'relative',
//   },
//   incidentImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 12,
//     backgroundColor: '#f0f0f0',
//   },
//   deleteButton: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     padding: 4,
//     borderRadius: 10,
//   },
//   photoNumber: {
//     position: 'absolute',
//     top: 8,
//     left: 8,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   photoNumberText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: '600',
//   },
//   noPhotos: {
//     width: 100,
//     height: 100,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     borderStyle: 'dashed',
//   },
//   noPhotosText: {
//     fontSize: 12,
//     color: '#999',
//     marginTop: 4,
//   },
//   descriptionSection: {
//     marginTop: 8,
//   },
//   descriptionLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginBottom: 8,
//   },
//   descriptionInput: {
//     backgroundColor: 'white',
//   },
//   incidentDescription: {
//     fontSize: 14,
//     color: '#1a1a1a',
//     lineHeight: 20,
//     backgroundColor: '#f8f9fa',
//     padding: 12,
//     borderRadius: 8,
//   },
//   saveButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 12,
//   },
//   saveButtonText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     padding: 40,
//     marginTop: 20,
//   },
//   emptyIcon: {
//     backgroundColor: '#f0f0f0',
//     padding: 20,
//     borderRadius: 50,
//     marginBottom: 16,
//   },
//   emptyTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#666',
//     marginBottom: 8,
//   },
//   emptySubtitle: {
//     fontSize: 14,
//     color: '#999',
//     textAlign: 'center',
//     lineHeight: 20,
//   },
//   addButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     padding: 16,
//     margin: 16,
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   addButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   modal: {
//     margin: 0,
//     justifyContent: 'flex-end',
//   },
//   creationModal: {
//     margin: 20,
//     justifyContent: 'center',
//   },
//   modalContentWrapper: {
//     backgroundColor: 'white',
//     borderRadius: 16,
//     overflow: 'hidden',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1a1a1a',
//   },
//   modalCloseButton: {
//     padding: 4,
//   },
//   cameraButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     margin: 20,
//     marginBottom: 12,
//     backgroundColor: '#f8f9fa',
//     borderRadius: 12,
//     borderWidth: 1.5,
//     borderColor: '#e0e0e0',
//   },
//   cameraButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginLeft: 12,
//   },
//   libraryButtonModal: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     marginHorizontal: 20,
//     marginBottom: 16,
//     backgroundColor: '#f0f8ff',
//     borderRadius: 12,
//     borderWidth: 1.5,
//     borderColor: '#e0f0ff',
//   },
//   libraryButtonTextModal: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginLeft: 12,
//   },
//   previewSection: {
//     paddingHorizontal: 20,
//     marginBottom: 16,
//   },
//   previewSectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   previewTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#666',
//   },
//   clearAllButton: {
//     padding: 4,
//   },
//   clearAllText: {
//     fontSize: 14,
//     color: COLORS.error,
//     fontWeight: '500',
//   },
//   previewContainer: {
//     paddingVertical: 8,
//   },
//   previewThumbnailContainer: {
//     marginRight: 12,
//     position: 'relative',
//   },
//   previewThumbnail: {
//     width: 80,
//     height: 80,
//     borderRadius: 8,
//   },
//   removePreviewButton: {
//     position: 'absolute',
//     top: 4,
//     right: 4,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     borderRadius: 10,
//     padding: 4,
//   },
//   previewNumberSmall: {
//     position: 'absolute',
//     top: 4,
//     left: 4,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 4,
//     paddingVertical: 2,
//     borderRadius: 6,
//   },
//   previewNumberTextSmall: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: '600',
//   },
//   modalDescriptionInput: {
//     marginHorizontal: 20,
//     marginBottom: 20,
//     backgroundColor: 'white',
//   },
//   modalActions: {
//     flexDirection: 'row',
//     padding: 20,
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//     gap: 12,
//   },
//   cancelButton: {
//     flex: 1,
//     padding: 14,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     alignItems: 'center',
//   },
//   cancelButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#666',
//   },
//   submitButton: {
//     flex: 2,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     padding: 14,
//     borderRadius: 8,
//   },
//   submitButtonDisabled: {
//     backgroundColor: '#ccc',
//   },
//   submitButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
  
//   // Camera Modal Styles
//   fullScreenModal: {
//     margin: 0,
//   },
//   cameraModalContainer: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   cameraHeader: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 50 : 30,
//     left: 20,
//     right: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     zIndex: 10,
//   },
//   cameraCloseButton: {
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     borderRadius: 20,
//     padding: 8,
//   },
//   flipButton: {
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     borderRadius: 20,
//     padding: 8,
//   },
//   simulatorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#000',
//     paddingHorizontal: 20,
//   },
//   simulatorText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: '600',
//     marginTop: 20,
//     textAlign: 'center',
//   },
//   simulatorSubtext: {
//     color: '#ccc',
//     fontSize: 14,
//     marginTop: 10,
//     textAlign: 'center',
//     marginBottom: 30,
//   },
//   libraryButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 24,
//     paddingVertical: 14,
//     borderRadius: 12,
//     marginTop: 20,
//   },
//   libraryButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 10,
//   },
//   libraryButtonSmall: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 8,
//     marginTop: 8,
//   },
//   libraryButtonTextSmall: {
//     color: 'white',
//     fontSize: 12,
//     fontWeight: '500',
//     marginLeft: 6,
//   },
//   permissionContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#000',
//   },
//   permissionText: {
//     color: 'white',
//     fontSize: 16,
//     marginTop: 16,
//     textAlign: 'center',
//     paddingHorizontal: 20,
//   },
//   permissionButton: {
//     marginTop: 20,
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   permissionButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   camera: {
//     flex: 1,
//   },
//   cameraControls: {
//     position: 'absolute',
//     bottom: 200,
//     alignSelf: 'center',
//   },
//   captureButton: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   captureButtonInner: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: 'rgba(255,255,255,0.3)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 3,
//     borderColor: 'white',
//   },
//   photoCounter: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 100 : 80,
//     alignSelf: 'center',
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//   },
//   photoCounterText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 6,
//   },
//   cameraThumbnailSection: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     paddingHorizontal: 0,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingBottom: Platform.OS === 'ios' ? 34 : 16,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   preview: { 
//     width: 80, 
//     height: 80,
//     borderRadius: 8,
//     backgroundColor: '#f0f0f0',
//   },
//   removeButton: {
//     position: 'absolute',
//     top: 4,
//     right: 4,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     borderRadius: 12,
//     padding: 4,
//   },
//   previewNumber: {
//     position: 'absolute',
//     top: 4,
//     left: 4,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   previewNumberText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: '600',
//   },
//   doneButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     padding: 12,
//     borderRadius: 12,
//     marginTop: 12,
//   },
//   doneButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   cameraInstructions: {
//     position: 'absolute',
//     bottom: 40,
//     alignSelf: 'center',
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 16,
//     alignItems: 'center',
//   },
//   cameraInstructionsText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'black',
//   },
//   viewerCloseButton: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 50 : 30,
//     right: 20,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     borderRadius: 20,
//     padding: 8,
//     zIndex: 1,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(255,255,255,0.9)',
//     zIndex: 10,
//   },
//   modalScroll: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     maxHeight: '90%', // prevents it from going off screen
//   },
//   modalScrollContent: {
//     padding: 24,
//     paddingBottom: 40,
//   },
// });

// export default ReportIncident;



// import React, { useState, useRef, useCallback, useContext, useEffect, memo } from 'react';
// import { 
//   View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, 
//   ActivityIndicator, Dimensions, SafeAreaView, ScrollView, Platform, KeyboardAvoidingView
// } from 'react-native';
// import { TextInput } from 'react-native-paper';
// import { Ionicons } from '@expo/vector-icons'; 
// import { useFocusEffect } from '@react-navigation/native';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import * as ImagePicker from 'expo-image-picker';
// import userService from '../../../services/connection/userService';
// import Modal from 'react-native-modal';
// import COLORS from '../../../constants/colors';
// import RNModal from 'react-native-modal';
// import ImageViewer from 'react-native-image-zoom-viewer';
// import { AuthContext } from '../../../context/AuthContext';
// import CardNoPrimary from '../../../components/shared/CardNoPrimary';
// import { Image } from 'expo-image';
// import CustomActivityIndicator from '../../../components/shared/CuustomActivityIndicator';
// import { tSafe } from '../../../utils/tSafe';

// const { width, height } = Dimensions.get('window');

// // ─── Memoized Modal Content ──────────────────────────────────────
// const IncidentModalContent = memo(({
//   visible,
//   incidentDescription,
//   setIncidentDescription,
//   incidentImages,
//   setIncidentImages,
//   isUploading,
//   uploadIncident,
//   onClose,
//   openCamera,
//   pickImageFromLibrary,
//   MAX_IMAGES_UPLOAD,
//   isReadOnly,
// }) => {
//   const scrollViewRef = useRef(null);
//   const inputRef = useRef(null);

//   const removePhoto = (index) => {
//     if (isReadOnly) {
//       Alert.alert(
//         tSafe('read_only_title', 'Read Only'),
//         tSafe('read_only_message', 'This job is locked. You cannot modify incident reports.')
//       );
//       return;
//     }
//     setIncidentImages(prev => prev.filter((_, i) => i !== index));
//   };

//   const scrollToBottom = () => {
//     setTimeout(() => {
//       scrollViewRef.current?.scrollToEnd({ animated: true });
//     }, 300);
//   };

//   const handleInputFocus = () => {
//     scrollToBottom();
//   };

//   useEffect(() => {
//     if (incidentImages.length > 0) {
//       scrollToBottom();
//     }
//   }, [incidentImages]);

//   return (
//     <Modal
//       isVisible={visible}
//       onBackdropPress={onClose}
//       onSwipeComplete={onClose}
//       swipeDirection="down"
//       style={styles.modal}
//       backdropOpacity={0.5}
//       animationIn="slideInUp"
//       animationOut="slideOutDown"
//     >
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={{ flex: 1 }}
//         keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
//       >
//         <ScrollView
//           ref={scrollViewRef}
//           style={styles.modalScroll}
//           contentContainerStyle={styles.modalScrollContent}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//         >
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>{tSafe('report_new_incident', 'Report New Incident')}</Text>
//             <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
//               <Ionicons name="close" size={24} color={COLORS.dark} />
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity
//             style={[styles.cameraButton, isReadOnly && styles.disabledButton]}
//             onPress={() => {
//               if (isReadOnly) {
//                 Alert.alert(
//                   tSafe('read_only_title', 'Read Only'),
//                   tSafe('read_only_message', 'This job is locked. You cannot add photos.')
//                 );
//                 return;
//               }
//               openCamera();
//             }}
//             disabled={isReadOnly}
//           >
//             <Ionicons name="camera" size={24} color={isReadOnly ? '#ccc' : COLORS.primary} />
//             <Text style={[styles.cameraButtonText, isReadOnly && styles.disabledText]}>
//               {incidentImages.length > 0
//                 ? tSafe('add_more_photos', 'Add More Photos')
//                 : tSafe('take_photo', 'Take Photo')}
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.libraryButtonModal, isReadOnly && styles.disabledButton]}
//             onPress={() => {
//               if (isReadOnly) {
//                 Alert.alert(
//                   tSafe('read_only_title', 'Read Only'),
//                   tSafe('read_only_message', 'This job is locked. You cannot add photos.')
//                 );
//                 return;
//               }
//               pickImageFromLibrary();
//             }}
//             disabled={isReadOnly}
//           >
//             <Ionicons name="images" size={24} color={isReadOnly ? '#ccc' : COLORS.primary} />
//             <Text style={[styles.libraryButtonTextModal, isReadOnly && styles.disabledText]}>
//               {tSafe('pick_from_photo_library', 'Pick from Photo Library')}
//             </Text>
//           </TouchableOpacity>

//           {incidentImages.length > 0 && (
//             <View style={styles.previewSection}>
//               <View style={styles.previewSectionHeader}>
//                 <Text style={styles.previewTitle}>
//                   {tSafe('captured_photos', 'Captured Photos ({count}/{total})', {
//                     count: incidentImages.length,
//                     total: MAX_IMAGES_UPLOAD
//                   })}
//                 </Text>
//                 {!isReadOnly && (
//                   <TouchableOpacity style={styles.clearAllButton} onPress={() => setIncidentImages([])}>
//                     <Text style={styles.clearAllText}>{tSafe('clear_all', 'Clear All')}</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//               <FlatList
//                 horizontal
//                 data={incidentImages}
//                 keyExtractor={(item, index) => `preview-${index}`}
//                 contentContainerStyle={styles.previewContainer}
//                 renderItem={({ item, index }) => (
//                   <View style={styles.previewThumbnailContainer}>
//                     <Image source={{ uri: item.uri || item.file }} style={styles.previewThumbnail} />
//                     {!isReadOnly && (
//                       <TouchableOpacity
//                         style={styles.removePreviewButton}
//                         onPress={() => removePhoto(index)}
//                       >
//                         <Ionicons name="close" size={16} color="white" />
//                       </TouchableOpacity>
//                     )}
//                     <View style={styles.previewNumberSmall}>
//                       <Text style={styles.previewNumberTextSmall}>{index + 1}</Text>
//                     </View>
//                   </View>
//                 )}
//               />
//             </View>
//           )}

//           <TextInput
//             ref={inputRef}
//             label={tSafe('incident_description_label', 'Incident description')}
//             placeholder={tSafe('describe_incident_placeholder', 'Describe what happened...')}
//             mode="outlined"
//             multiline
//             numberOfLines={4}
//             value={incidentDescription}
//             onChangeText={setIncidentDescription}
//             onFocus={handleInputFocus}
//             style={styles.modalDescriptionInput}
//             outlineColor="#D8D8D8"
//             activeOutlineColor={COLORS.primary}
//             editable={!isReadOnly}
//           />

//           <View style={styles.modalActions}>
//             <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
//               <Text style={styles.cancelButtonText}>{tSafe('cancel', 'Cancel')}</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[
//                 styles.submitButton,
//                 (!incidentDescription.trim() || incidentImages.length === 0 || isReadOnly) && styles.submitButtonDisabled
//               ]}
//               onPress={uploadIncident}
//               disabled={isUploading || !incidentDescription.trim() || incidentImages.length === 0 || isReadOnly}
//             >
//               {isUploading ? (
//                 <ActivityIndicator size="small" color="white" />
//               ) : (
//                 <>
//                   <Ionicons name="cloud-upload" size={18} color="white" />
//                   <Text style={styles.submitButtonText}>{tSafe('submit_report', 'Submit Report')}</Text>
//                 </>
//               )}
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </Modal>
//   );
// });

// // ─── Helper Components ──────────────────────────────────────────
// const IncidentListHeader = memo(() => (
//   <View style={styles.header}>
//     <View style={styles.headerIcon}>
//       <Ionicons name="document-text-outline" size={32} color={COLORS.primary} />
//     </View>
//     <Text style={styles.headline}>{tSafe('incident_reports', 'Incident Reports')}</Text>
//     <Text style={styles.subtitle}>{tSafe('document_issues', 'Document any issues or concerns during cleaning')}</Text>
//     <View style={styles.infoCard}>
//       <Ionicons name="information-circle" size={20} color={COLORS.warning} />
//       <Text style={styles.infoText}>
//         {tSafe('report_info_text', 'Report any damages, missing items, or other issues encountered during cleaning.')}
//       </Text>
//     </View>
//   </View>
// ));

// const EmptyPlaceholder = memo(() => (
//   <View style={styles.emptyContainer}>
//     <View style={styles.emptyIcon}>
//       <Ionicons name="shield-checkmark" size={48} color={COLORS.lightGray} />
//     </View>
//     <Text style={styles.emptyTitle}>{tSafe('no_incidents_reported', 'No Incidents Reported')}</Text>
//     <Text style={styles.emptySubtitle}>
//       {tSafe('no_incidents_message', 'Great job! No issues have been reported for this cleaning session.')}
//     </Text>
//   </View>
// ));

// // ─── Main Component ──────────────────────────────────────────────
// const ReportIncident = ({ scheduleId, isReadOnly = false }) => {
//   const { currentUserId } = useContext(AuthContext);
//   const cameraRef = useRef(null);
//   const [incidentModalOpen, setIncidentModalOpen] = useState(false);
//   const [cameraVisible, setCameraVisible] = useState(false);
//   const [incidentImages, setIncidentImages] = useState([]);
//   const [incidentDescription, setIncidentDescription] = useState('');
//   const [incidents, setIncidents] = useState([]);
//   const [facing, setFacing] = useState('back');
//   const [isLoading, setIsLoading] = useState(false);
//   const [imageViewerVisible, setImageViewerVisible] = useState(false);
//   const [currentImages, setCurrentImages] = useState([]);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [isUploading, setIsUploading] = useState(false);
//   const [permission, requestPermission] = useCameraPermissions();
//   const [editingDescription, setEditingDescription] = useState('');
//   const [editingIncidentId, setEditingIncidentId] = useState(null);
//   const [isCameraReady, setIsCameraReady] = useState(false);
//   const [isSimulator, setIsSimulator] = useState(false);
  
//   const MAX_IMAGES_UPLOAD = 5;

//   // Check if running on simulator
//   useEffect(() => {
//     if (Platform.OS === 'ios') {
//       const checkSimulator = async () => {
//         try {
//           if (permission?.granted) {
//             setIsSimulator(false);
//           }
//         } catch (error) {
//           setIsSimulator(true);
//         }
//       };
//       checkSimulator();
//     }
//   }, [permission]);

//   // Request camera and media library permissions
//   useEffect(() => {
//     (async () => {
//       if (permission && !permission.granted) {
//         await requestPermission();
//       }
//       const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (mediaStatus !== 'granted') {
//         console.log('Media library permission denied');
//       }
//     })();
//   }, [permission, requestPermission]);

//   // Data fetching
//   const fetchIncidents = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const response = await userService.getIncidents(scheduleId);
//       const schedule = response.data.data;
//       const cleanerGroup = schedule.assignedTo?.find(
//         (group) => group.cleanerId === currentUserId
//       );
//       const cleanerIncidents = cleanerGroup?.incidents || [];
//       setIncidents(cleanerIncidents);
//     } catch (error) {
//       console.error("Fetch incidents error:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [scheduleId, currentUserId]);

//   useFocusEffect(
//     useCallback(() => {
//       fetchIncidents();
//       return () => {};
//     }, [fetchIncidents])
//   );

//   // Take picture with camera or pick from library
//   const takePicture = useCallback(async () => {
//     if (isReadOnly) {
//       Alert.alert(
//         tSafe('read_only_title', 'Read Only'),
//         tSafe('read_only_message', 'This job is locked. You cannot add photos.')
//       );
//       return;
//     }
//     if (isSimulator || !permission?.granted) {
//       await pickImageFromLibrary();
//       return;
//     }

//     if (cameraRef.current && isCameraReady) {
//       try {
//         const photo = await cameraRef.current.takePictureAsync({
//           quality: 0.8,
//           base64: true,
//           exif: false,
//           skipProcessing: true
//         });
        
//         const newPhoto = {
//           uri: photo.uri,
//           base64: photo.base64,
//           filename: `incident_${Date.now()}.jpg`,
//           file: `data:image/jpg;base64,${photo.base64}`
//         };
        
//         if (incidentImages.length < MAX_IMAGES_UPLOAD) {
//           setIncidentImages(prev => [...prev, newPhoto]);
//         } else {
//           Alert.alert(
//             tSafe('limit_reached_title', 'Limit reached'),
//             tSafe('max_photos_allowed', 'Maximum {count} photos allowed', { count: MAX_IMAGES_UPLOAD })
//           );
//         }
//       } catch (error) {
//         console.error('Camera error:', error);
//         Alert.alert(
//           tSafe('error_title', 'Error'),
//           tSafe('failed_capture_image', 'Failed to capture image. Using photo library instead.')
//         );
//         await pickImageFromLibrary();
//       }
//     } else {
//       await pickImageFromLibrary();
//     }
//   }, [isSimulator, permission, isCameraReady, incidentImages, MAX_IMAGES_UPLOAD, isReadOnly]);

//   // Pick image from library
//   const pickImageFromLibrary = useCallback(async () => {
//     if (isReadOnly) {
//       Alert.alert(
//         tSafe('read_only_title', 'Read Only'),
//         tSafe('read_only_message', 'This job is locked. You cannot add photos.')
//       );
//       return;
//     }
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: false,
//         aspect: [4, 3],
//         quality: 0.8,
//         base64: true,
//         allowsMultipleSelection: true,
//         selectionLimit: MAX_IMAGES_UPLOAD - incidentImages.length
//       });

//       if (!result.canceled) {
//         const newPhotos = result.assets.map((asset, index) => ({
//           uri: asset.uri,
//           base64: asset.base64,
//           filename: `incident_${Date.now()}_${index}.jpg`,
//           file: `data:image/jpg;base64,${asset.base64}`
//         }));

//         if (incidentImages.length + newPhotos.length <= MAX_IMAGES_UPLOAD) {
//           setIncidentImages(prev => [...prev, ...newPhotos]);
//         } else {
//           Alert.alert(
//             tSafe('limit_reached_title', 'Limit reached'),
//             tSafe('max_photos_allowed', 'Maximum {count} photos allowed', { count: MAX_IMAGES_UPLOAD })
//           );
//         }
//       }
//     } catch (error) {
//       console.error('Image picker error:', error);
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe('failed_pick_image', 'Failed to pick image from library')
//       );
//     }
//   }, [incidentImages, MAX_IMAGES_UPLOAD, isReadOnly]);

//   // Flip camera
//   const flipCamera = useCallback(() => {
//     setFacing(current => current === 'back' ? 'front' : 'back');
//   }, []);

//   // Image handling
//   const removePhoto = useCallback((index) => {
//     if (isReadOnly) {
//       Alert.alert(
//         tSafe('read_only_title', 'Read Only'),
//         tSafe('read_only_message', 'This job is locked. You cannot modify incident reports.')
//       );
//       return;
//     }
//     setIncidentImages(prev => prev.filter((_, i) => i !== index));
//   }, [isReadOnly]);

//   const openImageViewer = useCallback((images, index) => {
//     if (Array.isArray(images)) {
//       const formattedImages = images.map(img => ({ 
//         url: img.url || img.uri || img.file,
//         props: { source: { uri: img.url || img.uri || img.file } }
//       }));
//       setCurrentImages(formattedImages);
//       setCurrentImageIndex(index);
//       setImageViewerVisible(true);
//     }
//   }, []);

//   // Incident CRUD operations
//   const uploadIncident = useCallback(async () => {
//     if (isReadOnly) {
//       Alert.alert(
//         tSafe('read_only_title', 'Read Only'),
//         tSafe('read_only_message', 'This job is locked. You cannot submit new incidents.')
//       );
//       return;
//     }
//     if (!incidentDescription.trim()) {
//       Alert.alert(
//         tSafe('validation_title', 'Validation'),
//         tSafe('enter_incident_description', 'Please enter incident description')
//       );
//       return;
//     }
  
//     if (incidentImages.length === 0) {
//       Alert.alert(
//         tSafe('validation_title', 'Validation'),
//         tSafe('add_incident_photo', 'Please add at least one photo')
//       );
//       return;
//     }
  
//     try {
//       setIsUploading(true);
      
//       const formData = new FormData();
//       formData.append('scheduleId', scheduleId);
//       formData.append('cleanerId', currentUserId);
//       formData.append('description', incidentDescription);

//       incidentImages.forEach((image, index) => {
//         if (image.uri) {
//           const filename = image.filename || `incident_${Date.now()}_${index}.jpg`;
//           formData.append('files', {
//             uri: image.uri,
//             name: filename,
//             type: 'image/jpeg',
//           });
//         }
//       });

//       const response = await userService.uploadPhotosIncidentPhotos(formData);
      
//       const newIncident = {
//         ...response.data,
//         photos: response.data.uploaded_files || incidentImages.map(img => ({ 
//           url: img.uri || img.file,
//           content_type: 'image/jpeg',
//           original_name: img.filename || 'incident_photo.jpg'
//         })),
//         description: incidentDescription,
//         reported_at: new Date().toISOString()
//       };
      
//       setIncidents(prev => [...prev, newIncident]);
//       setIncidentImages([]);
//       setIncidentDescription('');
//       setIncidentModalOpen(false);
//       Alert.alert(
//         tSafe('success_title', 'Success'),
//         tSafe('incident_reported', 'Incident reported successfully')
//       );
//     } catch (error) {
//       console.error('Upload error:', error.response?.data || error.message || error);
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe('failed_submit_incident', 'Failed to submit incident. Please try again.')
//       );
//     } finally {
//       setIsUploading(false);
//     }
//   }, [incidentDescription, incidentImages, scheduleId, currentUserId, isReadOnly]);

//   const handleToggleEdit = useCallback((incident) => {
//     if (isReadOnly) {
//       Alert.alert(
//         tSafe('read_only_title', 'Read Only'),
//         tSafe('read_only_message', 'This job is locked. You cannot edit incidents.')
//       );
//       return;
//     }
//     if (editingIncidentId === incident.reported_at) {
//       setEditingIncidentId(null);
//       setEditingDescription('');
//     } else {
//       setEditingIncidentId(incident.reported_at);
//       setEditingDescription(incident.description || '');
//     }
//   }, [editingIncidentId, isReadOnly]);

//   const handleSaveEdit = useCallback(async () => {
//     if (isReadOnly) {
//       Alert.alert(
//         tSafe('read_only_title', 'Read Only'),
//         tSafe('read_only_message', 'This job is locked. You cannot edit incidents.')
//       );
//       return;
//     }
//     if (!editingIncidentId || !editingDescription.trim()) {
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe('enter_description', 'Please enter a description')
//       );
//       return;
//     }

//     try {
//       setIsLoading(true);
      
//       const updatedIncidents = incidents.map(inc => 
//         inc.reported_at === editingIncidentId
//           ? { ...inc, description: editingDescription, isEditing: false }
//           : inc
//       );
      
//       setIncidents(updatedIncidents);
      
//       await userService.updateScheduleIncidents({
//         scheduleId,
//         cleanerId: currentUserId,
//         incidents: updatedIncidents.map(({ isEditing, ...inc }) => ({
//           ...inc,
//           photos: inc.photos.map(photo => ({
//             url: photo.url,
//             content_type: photo.content_type || 'image/jpeg',
//             original_name: photo.original_name || 'incident_photo.jpg'
//           }))
//         }))
//       });
      
//       setEditingIncidentId(null);
//       setEditingDescription('');
      
//       Alert.alert(
//         tSafe('success_title', 'Success'),
//         tSafe('incident_updated', 'Incident updated successfully')
//       );
//     } catch (error) {
//       console.error('Update error:', error);
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe('failed_save_changes', 'Failed to save changes')
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   }, [editingIncidentId, editingDescription, incidents, scheduleId, currentUserId, isReadOnly]);

//   const handleDeleteImage = useCallback((incidentId, imageUrl) => {
//     if (isReadOnly) {
//       Alert.alert(
//         tSafe('read_only_title', 'Read Only'),
//         tSafe('read_only_message', 'This job is locked. You cannot delete images.')
//       );
//       return;
//     }
//     const updatedIncidents = incidents.map(inc => 
//       inc.reported_at === incidentId
//         ? { ...inc, photos: inc.photos.filter(photo => photo.url !== imageUrl) }
//         : inc
//     );
    
//     setIncidents(updatedIncidents);
    
//     userService.updateScheduleIncidents({
//       scheduleId,
//       cleanerId: currentUserId,
//       incidents: updatedIncidents.map(({ isEditing, ...inc }) => ({
//         ...inc,
//         photos: inc.photos.map(photo => ({
//           url: photo.url,
//           content_type: photo.content_type || 'image/jpeg',
//           original_name: photo.original_name || 'incident_photo.jpg'
//         }))
//       }))
//     }).catch(error => {
//       console.error('Delete image error:', error);
//       Alert.alert(
//         tSafe('error_title', 'Error'),
//         tSafe('failed_delete_image', 'Failed to delete image')
//       );
//     });
//   }, [incidents, scheduleId, currentUserId, isReadOnly]);

//   // Render helpers
//   const IncidentImageThumbnail = useCallback(({ photo, index, onDelete, onPress }) => (
//     <View style={styles.thumbnailContainer}>
//       <TouchableOpacity onPress={onPress}>
//         <Image 
//           source={{ uri: photo.url || photo.uri || photo.file }} 
//           style={styles.incidentImage}
//           transition={300}
//           cachePolicy="memory-disk"
//         />
//       </TouchableOpacity>
//       {!isReadOnly && (
//         <TouchableOpacity 
//           style={styles.deleteButton} 
//           onPress={onDelete}
//         >
//           <Ionicons name="close-circle" size={20} color="white" />
//         </TouchableOpacity>
//       )}
//       <View style={styles.photoNumber}>
//         <Text style={styles.photoNumberText}>{index + 1}</Text>
//       </View>
//     </View>
//   ), [isReadOnly]);

//   const renderIncidentItem = useCallback(({ item }) => {
//     const isEditing = editingIncidentId === item.reported_at;
//     return (
//       <CardNoPrimary key={item.reported_at}>
//         <View style={styles.incidentCard}>
//           <View style={styles.incidentHeader}>
//             <View style={styles.headerLeft}>
//               <View style={styles.incidentIcon}>
//                 <Ionicons name="warning" size={20} color="#d32f2f" />
//               </View>
//               <View>
//                 <Text style={styles.incidentTitle}>{tSafe('incident_report', 'Incident Report')}</Text>
//                 <Text style={styles.incidentDate}>
//                   {new Date(item.reported_at).toLocaleDateString()}
//                 </Text>
//               </View>
//             </View>
//             {!isReadOnly && (
//               <TouchableOpacity 
//                 onPress={() => handleToggleEdit(item)} 
//                 style={styles.editButton}
//               >
//                 <Ionicons 
//                   name={isEditing ? "close" : "create-outline"} 
//                   size={20} 
//                   color={COLORS.primary} 
//                 />
//               </TouchableOpacity>
//             )}
//             {isReadOnly && (
//               <View style={styles.editButton}>
//                 <Ionicons name="lock-closed" size={20} color="#ccc" />
//               </View>
//             )}
//           </View>

//           <FlatList
//             horizontal
//             data={item.photos}
//             keyExtractor={(photo, index) => `${item.reported_at}-${index}`}
//             renderItem={({ item: photo, index }) => (
//               <IncidentImageThumbnail
//                 photo={photo}
//                 index={index}
//                 onDelete={() => handleDeleteImage(item.reported_at, photo.url)}
//                 onPress={() => openImageViewer(item.photos, index)}
//               />
//             )}
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.imagesContainer}
//             ListEmptyComponent={
//               <View style={styles.noPhotos}>
//                 <Ionicons name="images-outline" size={32} color="#ddd" />
//                 <Text style={styles.noPhotosText}>{tSafe('no_photos', 'No photos')}</Text>
//               </View>
//             }
//           />

//           <View style={styles.descriptionSection}>
//             <Text style={styles.descriptionLabel}>{tSafe('description', 'Description')}</Text>
//             {isEditing && !isReadOnly ? (
//               <View>
//                 <TextInput
//                   label={tSafe('describe_incident', 'Describe the incident...')}
//                   mode="outlined"
//                   multiline
//                   numberOfLines={4}
//                   outlineColor="#D8D8D8"
//                   activeOutlineColor={COLORS.primary}
//                   style={styles.descriptionInput}
//                   value={editingDescription}
//                   onChangeText={setEditingDescription}
//                   autoFocus={true}
//                 />
//                 <TouchableOpacity 
//                   style={styles.saveButton} 
//                   onPress={handleSaveEdit}
//                   disabled={isLoading}
//                 >
//                   <Ionicons name="checkmark" size={18} color="white" />
//                   <Text style={styles.saveButtonText}>
//                     {isLoading ? tSafe('saving', 'Saving...') : tSafe('save_changes', 'Save Changes')}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               <Text style={styles.incidentDescription}>{item.description}</Text>
//             )}
//           </View>
//         </View>
//       </CardNoPrimary>
//     );
//   }, [editingIncidentId, editingDescription, handleToggleEdit, handleSaveEdit, isLoading, openImageViewer, handleDeleteImage, IncidentImageThumbnail, isReadOnly]);

//   const isEditingAny = editingIncidentId !== null;

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Camera Modal */}
//       <RNModal
//         isVisible={cameraVisible}
//         style={styles.fullScreenModal}
//         onBackdropPress={() => setCameraVisible(false)}
//       >
//         <View style={styles.cameraModalContainer}>
//           <View style={styles.cameraHeader}>
//             <TouchableOpacity 
//               style={styles.cameraCloseButton}
//               onPress={() => setCameraVisible(false)}
//             >
//               <Ionicons name="chevron-down" size={28} color="white" />
//             </TouchableOpacity>
            
//             {!isSimulator && permission?.granted && !isReadOnly && (
//               <TouchableOpacity 
//                 style={styles.flipButton}
//                 onPress={flipCamera}
//               >
//                 <Ionicons name="camera-reverse" size={24} color="white" />
//               </TouchableOpacity>
//             )}
//           </View>

//           {isSimulator ? (
//             <View style={styles.simulatorContainer}>
//               <Ionicons name="camera-off" size={64} color="white" />
//               <Text style={styles.simulatorText}>{tSafe('camera_not_available_simulator', 'Camera not available in simulator')}</Text>
//               <Text style={styles.simulatorSubtext}>
//                 {tSafe('use_pick_from_library', 'Use "Pick from Library" button below to add photos')}
//               </Text>
              
//               <TouchableOpacity 
//                 style={[styles.libraryButton, isReadOnly && styles.disabledButton]}
//                 onPress={pickImageFromLibrary}
//                 disabled={isReadOnly}
//               >
//                 <Ionicons name="images" size={24} color={isReadOnly ? '#ccc' : 'white'} />
//                 <Text style={[styles.libraryButtonText, isReadOnly && styles.disabledText]}>
//                   {tSafe('pick_from_library', 'Pick from Library')}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           ) : !permission ? (
//             <View style={styles.permissionContainer}>
//               <ActivityIndicator size="large" color="white" />
//               <Text style={styles.permissionText}>{tSafe('requesting_camera_permission', 'Requesting camera permission...')}</Text>
//             </View>
//           ) : !permission.granted ? (
//             <View style={styles.permissionContainer}>
//               <Ionicons name="camera-off" size={48} color="white" />
//               <Text style={styles.permissionText}>{tSafe('no_access_camera', 'No access to camera')}</Text>
//               <TouchableOpacity 
//                 style={styles.permissionButton}
//                 onPress={() => {
//                   setCameraVisible(false);
//                   Alert.alert(
//                     tSafe('permission_required_title', 'Permission Required'),
//                     tSafe('enable_camera_permissions', 'Please enable camera permissions in your device settings.'),
//                     [{ text: tSafe('ok', 'OK') }]
//                   );
//                 }}
//               >
//                 <Text style={styles.permissionButtonText}>{tSafe('ok', 'OK')}</Text>
//               </TouchableOpacity>
//             </View>
//           ) : (
//             <CameraView 
//               style={styles.camera}
//               facing={facing}
//               ref={cameraRef}
//               onCameraReady={() => setIsCameraReady(true)}
//             >
//               <View style={styles.cameraControls}>
//                 <TouchableOpacity 
//                   style={styles.captureButton}
//                   onPress={takePicture}
//                   disabled={incidentImages.length >= MAX_IMAGES_UPLOAD || isReadOnly}
//                 >
//                   <View style={[styles.captureButtonInner, isReadOnly && styles.disabledButton]}>
//                     <Ionicons name="camera" size={32} color={isReadOnly ? '#999' : 'white'} />
//                   </View>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.photoCounter}>
//                 <Ionicons name="images-outline" size={16} color="white" />
//                 <Text style={styles.photoCounterText}>
//                   {incidentImages.length}/{MAX_IMAGES_UPLOAD}
//                 </Text>
//               </View>
//             </CameraView>
//           )}

//           {incidentImages.length > 0 && (
//             <View style={styles.cameraThumbnailSection}>
//               <FlatList
//                 data={incidentImages}
//                 horizontal
//                 keyExtractor={(item, index) => index.toString()}
//                 renderItem={({ item, index }) => (
//                   <View style={styles.thumbnailContainer}>
//                     <Image source={{ uri: item.uri || item.file }} style={styles.preview} />
//                     {!isReadOnly && (
//                       <TouchableOpacity 
//                         onPress={() => removePhoto(index)} 
//                         style={styles.removeButton}
//                       >
//                         <Ionicons name="trash-outline" size={14} color="white" />
//                       </TouchableOpacity>
//                     )}
//                     <View style={styles.previewNumber}>
//                       <Text style={styles.previewNumberText}>{index + 1}</Text>
//                     </View>
//                   </View>
//                 )}
//                 contentContainerStyle={styles.previewContainer}
//                 showsHorizontalScrollIndicator={false}
//               />
              
//               <TouchableOpacity 
//                 style={styles.doneButton}
//                 onPress={() => setCameraVisible(false)}
//               >
//                 <Ionicons name="checkmark" size={20} color="white" />
//                 <Text style={styles.doneButtonText}>
//                   {tSafe('done_photos', 'Done ({count} photos)', { count: incidentImages.length })}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           )}

//           {incidentImages.length === 0 && permission?.granted && !isSimulator && (
//             <View style={styles.cameraInstructions}>
//               <Text style={styles.cameraInstructionsText}>
//                 {tSafe('camera_instructions', 'Tap the camera button to capture incident photos')}
//               </Text>
//               {!isReadOnly && (
//                 <TouchableOpacity 
//                   style={styles.libraryButtonSmall}
//                   onPress={pickImageFromLibrary}
//                 >
//                   <Ionicons name="images" size={16} color="white" />
//                   <Text style={styles.libraryButtonTextSmall}>{tSafe('or_pick_from_library', 'or Pick from Library')}</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           )}
//         </View>
//       </RNModal>

//       {/* Image Viewer Modal */}
//       <RNModal
//         isVisible={imageViewerVisible}
//         style={styles.fullScreenModal}
//         onBackdropPress={() => setImageViewerVisible(false)}
//       >
//         <View style={styles.modalContainer}>
//           <ImageViewer
//             imageUrls={currentImages}
//             index={currentImageIndex}
//             enableSwipeDown
//             onSwipeDown={() => setImageViewerVisible(false)}
//             backgroundColor="black"
//           />
//           <TouchableOpacity
//             style={styles.viewerCloseButton}
//             onPress={() => setImageViewerVisible(false)}
//           >
//             <Ionicons name="close" size={28} color="white" />
//           </TouchableOpacity>
//         </View>
//       </RNModal>

//       {/* Loading Indicator */}
//       {isLoading && (
//         <View style={styles.loaderContainer}>
//           <CustomActivityIndicator size={40} />
//         </View>
//       )}

//       {/* Incidents List */}
//       <FlatList
//         data={incidents}
//         keyExtractor={(item, index) => item?.reported_at ? item.reported_at.toString() : `incident-${index}`}
//         ListHeaderComponent={IncidentListHeader}
//         ListEmptyComponent={!isLoading && EmptyPlaceholder}
//         renderItem={renderIncidentItem}
//         contentContainerStyle={styles.listContainer}
//         extraData={[editingIncidentId, editingDescription, isReadOnly]}
//       />

//       {/* Add Incident Button */}
//       {!isEditingAny && (
//         <TouchableOpacity 
//           style={[styles.addButton, isReadOnly && styles.addButtonDisabled]}
//           onPress={() => {
//             if (isReadOnly) {
//               Alert.alert(
//                 tSafe('read_only_title', 'Read Only'),
//                 tSafe('read_only_message', 'This job is locked. You cannot report new incidents.')
//               );
//               return;
//             }
//             setIncidentModalOpen(true);
//           }}
//           disabled={isReadOnly}
//         >
//           <Ionicons name={isReadOnly ? "lock-closed" : "add-circle"} size={22} color={isReadOnly ? '#999' : 'white'} />
//           <Text style={[styles.addButtonText, isReadOnly && styles.disabledText]}>
//             {isReadOnly ? tSafe('locked_read_only', 'Locked – Read Only') : tSafe('report_incident', 'Report Incident')}
//           </Text>
//         </TouchableOpacity>
//       )}

//       {/* Incident Creation Modal */}
//       <IncidentModalContent
//         visible={incidentModalOpen}
//         incidentDescription={incidentDescription}
//         setIncidentDescription={setIncidentDescription}
//         incidentImages={incidentImages}
//         setIncidentImages={setIncidentImages}
//         isUploading={isUploading}
//         uploadIncident={uploadIncident}
//         onClose={() => {
//           setIncidentModalOpen(false);
//           setIncidentImages([]);
//           setIncidentDescription('');
//         }}
//         openCamera={() => setCameraVisible(true)}
//         pickImageFromLibrary={pickImageFromLibrary}
//         MAX_IMAGES_UPLOAD={MAX_IMAGES_UPLOAD}
//         isReadOnly={isReadOnly}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   header: {
//     padding: 20,
//     backgroundColor: 'white',
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   headerIcon: {
//     alignSelf: 'center',
//     backgroundColor: '#e3f2fd',
//     padding: 12,
//     borderRadius: 50,
//     marginBottom: 12,
//   },
//   headline: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#1a1a1a',
//     textAlign: 'center',
//     marginBottom: 4,
//     letterSpacing: -0.5,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 16,
//     fontWeight: '400',
//   },
//   infoCard: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     padding: 16,
//     backgroundColor: '#fff3cd',
//     borderRadius: 12,
//     borderLeftWidth: 4,
//     borderLeftColor: COLORS.warning,
//   },
//   infoText: {
//     flex: 1,
//     fontSize: 14,
//     color: '#856404',
//     marginLeft: 12,
//     lineHeight: 20,
//   },
//   listContainer: {
//     padding: 16,
//   },
//   incidentCard: {
//     padding: 16,
//   },
//   incidentHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 16,
//   },
//   headerLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   incidentIcon: {
//     backgroundColor: '#ffebee',
//     padding: 8,
//     borderRadius: 10,
//     marginRight: 12,
//   },
//   incidentTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginBottom: 2,
//   },
//   incidentDate: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '400',
//   },
//   editButton: {
//     padding: 8,
//   },
//   imagesContainer: {
//     paddingVertical: 8,
//   },
//   thumbnailContainer: {
//     marginRight: 12,
//     marginBottom: 8,
//     position: 'relative',
//   },
//   incidentImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 12,
//     backgroundColor: '#f0f0f0',
//   },
//   deleteButton: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     padding: 4,
//     borderRadius: 10,
//   },
//   photoNumber: {
//     position: 'absolute',
//     top: 8,
//     left: 8,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   photoNumberText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: '600',
//   },
//   noPhotos: {
//     width: 100,
//     height: 100,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     borderStyle: 'dashed',
//   },
//   noPhotosText: {
//     fontSize: 12,
//     color: '#999',
//     marginTop: 4,
//   },
//   descriptionSection: {
//     marginTop: 8,
//   },
//   descriptionLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginBottom: 8,
//   },
//   descriptionInput: {
//     backgroundColor: 'white',
//   },
//   incidentDescription: {
//     fontSize: 14,
//     color: '#1a1a1a',
//     lineHeight: 20,
//     backgroundColor: '#f8f9fa',
//     padding: 12,
//     borderRadius: 8,
//   },
//   saveButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 12,
//   },
//   saveButtonText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     padding: 40,
//     marginTop: 20,
//   },
//   emptyIcon: {
//     backgroundColor: '#f0f0f0',
//     padding: 20,
//     borderRadius: 50,
//     marginBottom: 16,
//   },
//   emptyTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#666',
//     marginBottom: 8,
//   },
//   emptySubtitle: {
//     fontSize: 14,
//     color: '#999',
//     textAlign: 'center',
//     lineHeight: 20,
//   },
//   addButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     padding: 16,
//     margin: 16,
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   addButtonDisabled: {
//     backgroundColor: '#e0e0e0',
//     opacity: 0.6,
//   },
//   addButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   modal: {
//     margin: 0,
//     justifyContent: 'flex-end',
//   },
//   creationModal: {
//     margin: 20,
//     justifyContent: 'center',
//   },
//   modalContentWrapper: {
//     backgroundColor: 'white',
//     borderRadius: 16,
//     overflow: 'hidden',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1a1a1a',
//   },
//   modalCloseButton: {
//     padding: 4,
//   },
//   cameraButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     margin: 20,
//     marginBottom: 12,
//     backgroundColor: '#f8f9fa',
//     borderRadius: 12,
//     borderWidth: 1.5,
//     borderColor: '#e0e0e0',
//   },
//   cameraButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginLeft: 12,
//   },
//   libraryButtonModal: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     marginHorizontal: 20,
//     marginBottom: 16,
//     backgroundColor: '#f0f8ff',
//     borderRadius: 12,
//     borderWidth: 1.5,
//     borderColor: '#e0f0ff',
//   },
//   libraryButtonTextModal: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginLeft: 12,
//   },
//   previewSection: {
//     paddingHorizontal: 20,
//     marginBottom: 16,
//   },
//   previewSectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   previewTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#666',
//   },
//   clearAllButton: {
//     padding: 4,
//   },
//   clearAllText: {
//     fontSize: 14,
//     color: COLORS.error,
//     fontWeight: '500',
//   },
//   previewContainer: {
//     paddingVertical: 8,
//   },
//   previewThumbnailContainer: {
//     marginRight: 12,
//     position: 'relative',
//   },
//   previewThumbnail: {
//     width: 80,
//     height: 80,
//     borderRadius: 8,
//   },
//   removePreviewButton: {
//     position: 'absolute',
//     top: 4,
//     right: 4,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     borderRadius: 10,
//     padding: 4,
//   },
//   previewNumberSmall: {
//     position: 'absolute',
//     top: 4,
//     left: 4,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 4,
//     paddingVertical: 2,
//     borderRadius: 6,
//   },
//   previewNumberTextSmall: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: '600',
//   },
//   modalDescriptionInput: {
//     marginHorizontal: 20,
//     marginBottom: 20,
//     backgroundColor: 'white',
//   },
//   modalActions: {
//     flexDirection: 'row',
//     padding: 20,
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//     gap: 12,
//   },
//   cancelButton: {
//     flex: 1,
//     padding: 14,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     alignItems: 'center',
//   },
//   cancelButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#666',
//   },
//   submitButton: {
//     flex: 2,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     padding: 14,
//     borderRadius: 8,
//   },
//   submitButtonDisabled: {
//     backgroundColor: '#ccc',
//   },
//   submitButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
  
//   // Camera Modal Styles
//   fullScreenModal: {
//     margin: 0,
//   },
//   cameraModalContainer: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   cameraHeader: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 50 : 30,
//     left: 20,
//     right: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     zIndex: 10,
//   },
//   cameraCloseButton: {
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     borderRadius: 20,
//     padding: 8,
//   },
//   flipButton: {
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     borderRadius: 20,
//     padding: 8,
//   },
//   simulatorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#000',
//     paddingHorizontal: 20,
//   },
//   simulatorText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: '600',
//     marginTop: 20,
//     textAlign: 'center',
//   },
//   simulatorSubtext: {
//     color: '#ccc',
//     fontSize: 14,
//     marginTop: 10,
//     textAlign: 'center',
//     marginBottom: 30,
//   },
//   libraryButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 24,
//     paddingVertical: 14,
//     borderRadius: 12,
//     marginTop: 20,
//   },
//   libraryButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 10,
//   },
//   libraryButtonSmall: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 8,
//     marginTop: 8,
//   },
//   libraryButtonTextSmall: {
//     color: 'white',
//     fontSize: 12,
//     fontWeight: '500',
//     marginLeft: 6,
//   },
//   permissionContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#000',
//   },
//   permissionText: {
//     color: 'white',
//     fontSize: 16,
//     marginTop: 16,
//     textAlign: 'center',
//     paddingHorizontal: 20,
//   },
//   permissionButton: {
//     marginTop: 20,
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   permissionButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   camera: {
//     flex: 1,
//   },
//   cameraControls: {
//     position: 'absolute',
//     bottom: 200,
//     alignSelf: 'center',
//   },
//   captureButton: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   captureButtonInner: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: 'rgba(255,255,255,0.3)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 3,
//     borderColor: 'white',
//   },
//   photoCounter: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 100 : 80,
//     alignSelf: 'center',
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//   },
//   photoCounterText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 6,
//   },
//   cameraThumbnailSection: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     paddingHorizontal: 0,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingBottom: Platform.OS === 'ios' ? 34 : 16,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   preview: { 
//     width: 80, 
//     height: 80,
//     borderRadius: 8,
//     backgroundColor: '#f0f0f0',
//   },
//   removeButton: {
//     position: 'absolute',
//     top: 4,
//     right: 4,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     borderRadius: 12,
//     padding: 4,
//   },
//   previewNumber: {
//     position: 'absolute',
//     top: 4,
//     left: 4,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   previewNumberText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: '600',
//   },
//   doneButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     padding: 12,
//     borderRadius: 12,
//     marginTop: 12,
//   },
//   doneButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   cameraInstructions: {
//     position: 'absolute',
//     bottom: 40,
//     alignSelf: 'center',
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 16,
//     alignItems: 'center',
//   },
//   cameraInstructionsText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'black',
//   },
//   viewerCloseButton: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 50 : 30,
//     right: 20,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     borderRadius: 20,
//     padding: 8,
//     zIndex: 1,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(255,255,255,0.9)',
//     zIndex: 10,
//   },
//   modalScroll: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     maxHeight: '90%',
//   },
//   modalScrollContent: {
//     padding: 24,
//     paddingBottom: 40,
//   },
//   disabledButton: {
//     opacity: 0.5,
//   },
//   disabledText: {
//     color: '#999',
//   },
// });

// export default ReportIncident;




import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { TextInput, Button, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';

import * as ImagePicker from 'expo-image-picker';

import ImageViewer from 'react-native-image-zoom-viewer';

import { useFocusEffect } from '@react-navigation/native';

import { AuthContext } from '../../../context/AuthContext';
import userService from '../../../services/connection/userService';

import { useTheme } from '../../../theme';

const MAX_IMAGES_UPLOAD = 5;
const MAX_DESCRIPTION_LENGTH = 2000;

/* =========================================================
   THEME HELPERS
========================================================= */

const getThemeColors = (theme) => {
  const defaults = {
    primary: '#008C8C',
    primaryLight: '#E0F4F2',

    background: '#F6F8FA',
    surface: '#FFFFFF',
    selected: '#E8F5F3',

    text: '#172B2B',
    secondaryText: '#64748B',
    mutedText: '#94A3B8',
    disabledText: '#CBD5E1',

    border: '#E2E8F0',
    strongBorder: '#CBD5E1',
    divider: '#E2E8F0',

    success: '#16A34A',
    warning: '#D97706',
    error: '#DC2626',

    icon: '#64748B',

    buttonText: '#FFFFFF',
    disabledButton: '#CBD5E1',

    overlay: 'rgba(0,0,0,0.65)',
  };

  const brand = theme?.brand || {};
  const background = theme?.background || {};
  const text = theme?.text || {};
  const border = theme?.border || {};
  const status = theme?.status || {};
  const icon = theme?.icon || {};
  const button = theme?.button || {};

  return {
    ...defaults,

    primary:
      brand.primary ||
      theme?.colors?.primary ||
      defaults.primary,

    primaryLight:
      brand.primaryLight ||
      defaults.primaryLight,

    background:
      background.default ||
      background.sunken ||
      theme?.colors?.background ||
      defaults.background,

    surface:
      theme?.surface?.default ||
      theme?.colors?.surface ||
      defaults.surface,

    selected:
      theme?.surface?.selected ||
      defaults.selected,

    text:
      text.primary ||
      theme?.colors?.onSurface ||
      defaults.text,

    secondaryText:
      text.secondary ||
      defaults.secondaryText,

    mutedText:
      text.muted ||
      defaults.mutedText,

    disabledText:
      text.disabled ||
      defaults.disabledText,

    border:
      border.default ||
      defaults.border,

    strongBorder:
      border.strong ||
      defaults.strongBorder,

    divider:
      theme?.divider ||
      defaults.divider,

    success:
      status.success ||
      defaults.success,

    warning:
      status.warning ||
      defaults.warning,

    error:
      status.error ||
      defaults.error,

    icon:
      icon.default ||
      icon.secondary ||
      defaults.icon,

    buttonText:
      button.primaryText ||
      defaults.buttonText,

    disabledButton:
      button.disabled ||
      defaults.disabledButton,
  };
};

/* =========================================================
   GENERAL HELPERS
========================================================= */

const getIdentifier = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object') {
    return (
      value._id ||
      value.id ||
      value.userId ||
      value.cleanerId ||
      null
    );
  }

  return String(value);
};

const getPhotoUri = (photo) => {
  if (!photo) {
    return null;
  }

  if (typeof photo === 'string') {
    return photo;
  }

  return (
    photo.uri ||
    photo.url ||
    photo.secure_url ||
    photo.imageUrl ||
    photo.photoUrl ||
    photo.location ||
    null
  );
};

const getIncidentIdentifier = (incident) => {
  if (!incident) {
    return null;
  }

  return (
    incident._id ||
    incident.id ||
    incident.incidentId ||
    null
  );
};

const normalizePhoto = (photo) => {
  if (!photo) {
    return null;
  }

  if (typeof photo === 'string') {
    return {
      uri: photo,
    };
  }

  const uri = getPhotoUri(photo);

  if (!uri) {
    return null;
  }

  return {
    ...photo,
    uri,
  };
};

const normalizeIncident = (incident, index = 0) => {
  const photos = Array.isArray(incident?.photos)
    ? incident.photos
    : [];

  return {
    ...incident,

    _localId:
      getIncidentIdentifier(incident) ||
      `incident-${index}`,

    description:
      typeof incident?.description === 'string'
        ? incident.description
        : '',

    photos: photos
      .map(normalizePhoto)
      .filter(Boolean),

    reported_at:
      incident?.reported_at ||
      incident?.reportedAt ||
      incident?.created_at ||
      incident?.createdAt ||
      null,
  };
};

const formatReportedDate = (dateValue) => {
  if (!dateValue) {
    return 'Date unavailable';
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return date.toLocaleString();
};

/* =========================================================
   SMALL REUSABLE COMPONENTS
========================================================= */

const SectionLabel = ({
  title,
  subtitle,
  styles,
  colors,
}) => (
  <View style={styles.sectionHeading}>
    <Text style={styles.sectionTitle}>
      {title}
    </Text>

    {subtitle ? (
      <Text style={styles.sectionSubtitle}>
        {subtitle}
      </Text>
    ) : null}
  </View>
);

const EmptyPlaceholder = ({
  icon,
  title,
  description,
  styles,
  colors,
}) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconContainer}>
      <Ionicons
        name={icon}
        size={30}
        color={colors.primary}
      />
    </View>

    <Text style={styles.emptyTitle}>
      {title}
    </Text>

    <Text style={styles.emptyDescription}>
      {description}
    </Text>
  </View>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */

const ReportIncident = ({
  scheduleId,
  isReadOnly = false,
}) => {
  const themeContext = useTheme();

  const theme =
    themeContext?.theme ||
    themeContext;

  const colors = useMemo(
    () => getThemeColors(theme),
    [theme]
  );

  /*
   * IMPORTANT:
   * This initializes styles before any render function
   * accesses styles.container, styles.card, etc.
   */
  const styles = useMemo(
    () => createStyles(colors),
    [colors]
  );

  const authContext = React.useContext(AuthContext);

  const currentUserId = useMemo(() => {
    const user =
      authContext?.currentUser ||
      authContext?.user ||
      authContext?.authUser;

    return getIdentifier(
      user?._id ||
      user?.id ||
      user?.userId
    );
  }, [
    authContext?.currentUser,
    authContext?.user,
    authContext?.authUser,
  ]);

  const [incidents, setIncidents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);

  const [incidentModalVisible, setIncidentModalVisible] =
    useState(false);

  const [cameraModalVisible, setCameraModalVisible] =
    useState(false);

  const [viewerVisible, setViewerVisible] =
    useState(false);

  const [viewerImages, setViewerImages] =
    useState([]);

  const [viewerIndex, setViewerIndex] =
    useState(0);

  const [editingIncidentId, setEditingIncidentId] =
    useState(null);

  const [editingDescription, setEditingDescription] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [selectedImages, setSelectedImages] =
    useState([]);

  const [cameraFacing, setCameraFacing] =
    useState('back');

  const [cameraReady, setCameraReady] =
    useState(false);

  const [cameraPermission, requestCameraPermission] =
    useCameraPermissions();

  const cameraRef = useRef(null);

  const mountedRef = useRef(true);

  const requestInProgressRef = useRef(false);
  const uploadInProgressRef = useRef(false);
  const saveInProgressRef = useRef(false);
  const deleteInProgressRef = useRef(false);

  /* =======================================================
     MOUNT / UNMOUNT
  ======================================================= */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* =======================================================
     FETCH INCIDENTS
  ======================================================= */

  const fetchIncidents = useCallback(
    async (showLoader = true) => {
      if (!scheduleId || !currentUserId) {
        if (mountedRef.current) {
          setIncidents([]);
          setLoading(false);
          setRefreshing(false);
        }

        return;
      }

      if (requestInProgressRef.current) {
        return;
      }

      requestInProgressRef.current = true;

      if (mountedRef.current && showLoader) {
        setLoading(true);
      }

      try {
        const response =
          await userService.getIncidents(scheduleId);

        /*
         * Preserve the existing response contract:
         * response.data.data contains the schedule.
         */
        const schedule =
          response?.data?.data ||
          response?.data?.schedule ||
          null;

        if (!schedule) {
          if (mountedRef.current) {
            setIncidents([]);
          }

          return;
        }

        const assignedTo = Array.isArray(schedule.assignedTo)
          ? schedule.assignedTo
          : [];

        /*
         * Locate the current cleaner's assigned group.
         */
        const cleanerAssignment = assignedTo.find(
          (assignment) => {
            const cleanerId = getIdentifier(
              assignment?.cleanerId
            );

            return cleanerId === currentUserId;
          }
        );

        const groupIncidents = Array.isArray(
          cleanerAssignment?.incidents
        )
          ? cleanerAssignment.incidents
          : [];

        const normalizedIncidents = groupIncidents.map(
          (incident, index) =>
            normalizeIncident(incident, index)
        );

        if (mountedRef.current) {
          setIncidents(normalizedIncidents);
        }
      } catch (error) {
        console.error(
          'Error fetching incidents:',
          error?.response?.data || error?.message || error
        );

        if (mountedRef.current) {
          Alert.alert(
            'Unable to Load Incidents',
            'We could not load the incident reports. Please try again.'
          );
        }
      } finally {
        requestInProgressRef.current = false;

        if (mountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [scheduleId, currentUserId]
  );

  useFocusEffect(
    useCallback(() => {
      fetchIncidents(true);
    }, [fetchIncidents])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchIncidents(false);
  }, [fetchIncidents]);

  /* =======================================================
     RESET NEW INCIDENT FORM
  ======================================================= */

  const resetIncidentForm = useCallback(() => {
    setDescription('');
    setSelectedImages([]);
    setIncidentModalVisible(false);
    setCameraModalVisible(false);
    setCameraReady(false);
  }, []);

  const openIncidentForm = useCallback(() => {
    if (isReadOnly) {
      return;
    }

    setDescription('');
    setSelectedImages([]);
    setIncidentModalVisible(true);
  }, [isReadOnly]);

  /* =======================================================
     IMAGE PICKER
  ======================================================= */

  const openImageLibrary = useCallback(async () => {
    if (isReadOnly) {
      return;
    }

    const remainingSlots =
      MAX_IMAGES_UPLOAD - selectedImages.length;

    if (remainingSlots <= 0) {
      Alert.alert(
        'Photo Limit Reached',
        `You can upload a maximum of ${MAX_IMAGES_UPLOAD} photos per incident.`
      );

      return;
    }

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow photo library access to select incident photos.'
        );

        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsMultipleSelection: true,
          selectionLimit: remainingSlots,
          quality: 0.8,
          allowsEditing: false,
        });

      if (result.canceled) {
        return;
      }

      const assets = Array.isArray(result.assets)
        ? result.assets
        : [];

      const newImages = assets
        .filter((asset) => asset?.uri)
        .map((asset) => ({
          uri: asset.uri,
          fileName:
            asset.fileName ||
            `incident-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2)}.jpg`,
          mimeType: asset.mimeType || 'image/jpeg',
        }));

      setSelectedImages((previousImages) => {
        const availableSlots =
          MAX_IMAGES_UPLOAD - previousImages.length;

        if (newImages.length > availableSlots) {
          Alert.alert(
            'Photo Limit Reached',
            `Only ${availableSlots} additional photo(s) can be selected.`
          );
        }

        return [
          ...previousImages,
          ...newImages.slice(0, availableSlots),
        ];
      });
    } catch (error) {
      console.error(
        'Error opening image library:',
        error?.message || error
      );

      Alert.alert(
        'Photo Selection Failed',
        'Unable to open your photo library. Please try again.'
      );
    }
  }, [isReadOnly, selectedImages.length]);

  /* =======================================================
     CAMERA
  ======================================================= */

  const openCamera = useCallback(async () => {
    if (isReadOnly) {
      return;
    }

    if (selectedImages.length >= MAX_IMAGES_UPLOAD) {
      Alert.alert(
        'Photo Limit Reached',
        `You can upload a maximum of ${MAX_IMAGES_UPLOAD} photos per incident.`
      );

      return;
    }

    try {
      let permission = cameraPermission;

      if (!permission?.granted) {
        permission = await requestCameraPermission();
      }

      if (!permission?.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access to photograph the incident.'
        );

        return;
      }

      setCameraReady(false);
      setCameraModalVisible(true);
    } catch (error) {
      console.error(
        'Error requesting camera permission:',
        error?.message || error
      );

      Alert.alert(
        'Camera Unavailable',
        'Unable to open the camera. Please try again.'
      );
    }
  }, [
    isReadOnly,
    selectedImages.length,
    cameraPermission,
    requestCameraPermission,
  ]);

  const takePicture = useCallback(async () => {
    if (!cameraRef.current || !cameraReady) {
      return;
    }

    if (selectedImages.length >= MAX_IMAGES_UPLOAD) {
      Alert.alert(
        'Photo Limit Reached',
        `You can upload a maximum of ${MAX_IMAGES_UPLOAD} photos per incident.`
      );

      return;
    }

    try {
      const photo =
        await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: false,
        });

      if (!photo?.uri) {
        Alert.alert(
          'Capture Failed',
          'The photo could not be captured. Please try again.'
        );

        return;
      }

      const newImage = {
        uri: photo.uri,
        fileName: `incident-${Date.now()}.jpg`,
        mimeType: 'image/jpeg',
      };

      setSelectedImages((previousImages) => {
        if (previousImages.length >= MAX_IMAGES_UPLOAD) {
          return previousImages;
        }

        return [...previousImages, newImage];
      });

      setCameraModalVisible(false);
      setCameraReady(false);
    } catch (error) {
      console.error(
        'Error taking incident photo:',
        error?.message || error
      );

      Alert.alert(
        'Capture Failed',
        'Unable to take the photo. Please try again.'
      );
    }
  }, [cameraReady, selectedImages.length]);

  const toggleCameraFacing = useCallback(() => {
    setCameraFacing((previousFacing) =>
      previousFacing === 'back' ? 'front' : 'back'
    );
  }, []);

  /* =======================================================
     REMOVE A SELECTED PHOTO BEFORE UPLOAD
  ======================================================= */

  const removeSelectedImage = useCallback((index) => {
    setSelectedImages((previousImages) =>
      previousImages.filter(
        (_, imageIndex) => imageIndex !== index
      )
    );
  }, []);

  /* =======================================================
     UPLOAD INCIDENT
  ======================================================= */

  const uploadIncident = useCallback(async () => {
    if (isReadOnly) {
      return;
    }

    if (!scheduleId) {
      Alert.alert(
        'Unable to Report Incident',
        'The schedule ID is missing.'
      );

      return;
    }

    if (!currentUserId) {
      Alert.alert(
        'Unable to Report Incident',
        'Your user information could not be identified. Please sign in again.'
      );

      return;
    }

    const cleanDescription = description.trim();

    if (!cleanDescription) {
      Alert.alert(
        'Description Required',
        'Please describe the incident before submitting.'
      );

      return;
    }

    if (!selectedImages.length) {
      Alert.alert(
        'Photos Required',
        'Please add at least one photo of the incident.'
      );

      return;
    }

    if (selectedImages.length > MAX_IMAGES_UPLOAD) {
      Alert.alert(
        'Too Many Photos',
        `You can upload a maximum of ${MAX_IMAGES_UPLOAD} photos per incident.`
      );

      return;
    }

    if (uploadInProgressRef.current) {
      return;
    }

    uploadInProgressRef.current = true;

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append('scheduleId', String(scheduleId));
      formData.append('cleanerId', String(currentUserId));
      formData.append('description', cleanDescription);

      selectedImages.forEach((image, index) => {
        const uri = image?.uri;

        if (!uri) {
          return;
        }

        const fileName =
          image.fileName ||
          `incident-${Date.now()}-${index}.jpg`;

        const mimeType =
          image.mimeType ||
          'image/jpeg';

        formData.append('files', {
          uri,
          name: fileName,
          type: mimeType,
        });
      });

      const response =
        await userService.uploadPhotosIncidentPhotos(
          formData
        );

      if (
        response?.status >= 400 ||
        response?.data?.success === false
      ) {
        throw new Error(
          response?.data?.message ||
          'The incident could not be uploaded.'
        );
      }

      /*
       * Preserve the existing API contract:
       * uploaded_files contains the uploaded photo references.
       */
      const uploadedFiles =
        response?.data?.uploaded_files;

      const uploadedPhotos = Array.isArray(uploadedFiles)
        ? uploadedFiles
            .map(normalizePhoto)
            .filter(Boolean)
        : selectedImages
            .map(normalizePhoto)
            .filter(Boolean);

      const newIncident = normalizeIncident({
        _id:
          response?.data?.incident?._id ||
          response?.data?.incidentId ||
          `incident-${Date.now()}`,

        description: cleanDescription,

        photos: uploadedPhotos,

        reported_at:
          response?.data?.reported_at ||
          response?.data?.incident?.reported_at ||
          new Date().toISOString(),
      });

      if (mountedRef.current) {
        setIncidents((previousIncidents) => [
          ...previousIncidents,
          newIncident,
        ]);

        resetIncidentForm();

        Alert.alert(
          'Incident Reported',
          'Your incident report has been submitted successfully.'
        );
      }
    } catch (error) {
      console.error(
        'Error uploading incident:',
        error?.response?.data ||
          error?.message ||
          error
      );

      if (mountedRef.current) {
        Alert.alert(
          'Upload Failed',
          error?.response?.data?.detail ||
            error?.response?.data?.message ||
            error?.message ||
            'Unable to submit the incident. Please try again.'
        );
      }
    } finally {
      uploadInProgressRef.current = false;

      if (mountedRef.current) {
        setUploading(false);
      }
    }
  }, [
    isReadOnly,
    scheduleId,
    currentUserId,
    description,
    selectedImages,
    resetIncidentForm,
  ]);

  /* =======================================================
     EDIT INCIDENT DESCRIPTION
  ======================================================= */

  const startEditingIncident = useCallback(
    (incident) => {
      if (isReadOnly) {
        return;
      }

      setEditingIncidentId(
        getIncidentIdentifier(incident) ||
          incident?._localId
      );

      setEditingDescription(
        incident?.description || ''
      );
    },
    [isReadOnly]
  );

  const cancelEditingIncident = useCallback(() => {
    setEditingIncidentId(null);
    setEditingDescription('');
  }, []);

  const saveIncidentDescription = useCallback(
    async (incident) => {
      if (isReadOnly) {
        return;
      }

      const cleanDescription =
        editingDescription.trim();

      if (!cleanDescription) {
        Alert.alert(
          'Description Required',
          'Please enter an incident description.'
        );

        return;
      }

      if (saveInProgressRef.current) {
        return;
      }

      if (!scheduleId || !currentUserId) {
        Alert.alert(
          'Unable to Save',
          'The schedule or cleaner information is missing.'
        );

        return;
      }

      saveInProgressRef.current = true;
      setSaving(true);

      try {
        const updatedIncidents = incidents.map(
          (existingIncident) => {
            const existingId =
              getIncidentIdentifier(existingIncident) ||
              existingIncident?._localId;

            const targetId =
              getIncidentIdentifier(incident) ||
              incident?._localId;

            if (existingId === targetId) {
              return {
                ...existingIncident,
                description: cleanDescription,
              };
            }

            return existingIncident;
          }
        );

        /*
         * Preserve the existing backend payload.
         */
        await userService.updateScheduleIncidents({
          scheduleId,
          cleanerId: currentUserId,

          incidents: updatedIncidents.map(
            (existingIncident) => {
              const {
                _localId,
                ...incidentData
              } = existingIncident;

              return incidentData;
            }
          ),
        });

        if (mountedRef.current) {
          setIncidents(updatedIncidents);
          cancelEditingIncident();

          Alert.alert(
            'Description Updated',
            'The incident description has been updated.'
          );
        }
      } catch (error) {
        console.error(
          'Error updating incident description:',
          error?.response?.data ||
            error?.message ||
            error
        );

        if (mountedRef.current) {
          Alert.alert(
            'Update Failed',
            error?.response?.data?.detail ||
              error?.response?.data?.message ||
              'Unable to update the incident description. Please try again.'
          );
        }
      } finally {
        saveInProgressRef.current = false;

        if (mountedRef.current) {
          setSaving(false);
        }
      }
    },
    [
      isReadOnly,
      editingDescription,
      scheduleId,
      currentUserId,
      incidents,
      cancelEditingIncident,
    ]
  );

  /* =======================================================
     DELETE INCIDENT PHOTO
  ======================================================= */

  const deleteIncidentPhoto = useCallback(
    (incident, photoIndex) => {
      if (isReadOnly) {
        return;
      }

      if (deleteInProgressRef.current) {
        return;
      }

      Alert.alert(
        'Delete Photo',
        'Are you sure you want to remove this photo from the incident?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',

            onPress: async () => {
              if (deleteInProgressRef.current) {
                return;
              }

              deleteInProgressRef.current = true;
              setDeletingPhoto(true);

              try {
                const targetId =
                  getIncidentIdentifier(incident) ||
                  incident?._localId;

                const updatedIncidents =
                  incidents.map((existingIncident) => {
                    const existingId =
                      getIncidentIdentifier(
                        existingIncident
                      ) ||
                      existingIncident?._localId;

                    if (existingId !== targetId) {
                      return existingIncident;
                    }

                    return {
                      ...existingIncident,

                      photos:
                        existingIncident.photos.filter(
                          (_, index) =>
                            index !== photoIndex
                        ),
                    };
                  });

                /*
                 * Persist the updated incident list before
                 * updating local state.
                 */
                await userService.updateScheduleIncidents({
                  scheduleId,
                  cleanerId: currentUserId,

                  incidents: updatedIncidents.map(
                    (existingIncident) => {
                      const {
                        _localId,
                        ...incidentData
                      } = existingIncident;

                      return incidentData;
                    }
                  ),
                });

                if (mountedRef.current) {
                  setIncidents(updatedIncidents);

                  Alert.alert(
                    'Photo Removed',
                    'The photo has been removed from the incident.'
                  );
                }
              } catch (error) {
                console.error(
                  'Error deleting incident photo:',
                  error?.response?.data ||
                    error?.message ||
                    error
                );

                if (mountedRef.current) {
                  Alert.alert(
                    'Delete Failed',
                    error?.response?.data?.detail ||
                      error?.response?.data?.message ||
                      'Unable to remove the photo. Please try again.'
                  );
                }
              } finally {
                deleteInProgressRef.current = false;

                if (mountedRef.current) {
                  setDeletingPhoto(false);
                }
              }
            },
          },
        ]
      );
    },
    [
      isReadOnly,
      incidents,
      scheduleId,
      currentUserId,
    ]
  );

  /* =======================================================
     IMAGE VIEWER
  ======================================================= */

  const openImageViewer = useCallback(
    (photos, selectedIndex = 0) => {
      const images = (Array.isArray(photos) ? photos : [])
        .map((photo) => {
          const uri = getPhotoUri(photo);

          return uri ? { url: uri } : null;
        })
        .filter(Boolean);

      if (!images.length) {
        return;
      }

      setViewerImages(images);

      setViewerIndex(
        Math.max(
          0,
          Math.min(selectedIndex, images.length - 1)
        )
      );

      setViewerVisible(true);
    },
    []
  );

  /* =======================================================
     RENDER PHOTO GRID
  ======================================================= */

  const renderPhotoGrid = useCallback(
    (incident, editable = false) => {
      const photos = Array.isArray(incident?.photos)
        ? incident.photos
        : [];

      if (!photos.length) {
        return (
          <View style={styles.noPhotosContainer}>
            <Ionicons
              name="image-outline"
              size={20}
              color={colors.mutedText}
            />

            <Text style={styles.noPhotosText}>
              No photos attached
            </Text>
          </View>
        );
      }

      return (
        <View style={styles.photoGrid}>
          {photos.map((photo, index) => {
            const uri = getPhotoUri(photo);

            if (!uri) {
              return null;
            }

            return (
              <View
                key={`${uri}-${index}`}
                style={styles.photoWrapper}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() =>
                    openImageViewer(photos, index)
                  }
                >
                  <Image
                    source={{ uri }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                </TouchableOpacity>

                {editable && !isReadOnly ? (
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Delete incident photo"
                    style={styles.deletePhotoButton}
                    onPress={() =>
                      deleteIncidentPhoto(
                        incident,
                        index
                      )
                    }
                    disabled={deletingPhoto}
                  >
                    <Ionicons
                      name="close"
                      size={16}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          })}
        </View>
      );
    },
    [
      styles,
      colors,
      isReadOnly,
      deletingPhoto,
      openImageViewer,
      deleteIncidentPhoto,
    ]
  );

  /* =======================================================
     RENDER INCIDENT CARD
  ======================================================= */

  const renderIncident = useCallback(
    (incident, index) => {
      const incidentId =
        getIncidentIdentifier(incident) ||
        incident?._localId ||
        `incident-${index}`;

      const isEditing =
        editingIncidentId === incidentId;

      return (
        <View
          key={incidentId}
          style={styles.incidentCard}
        >
          <View style={styles.incidentHeader}>
            <View style={styles.incidentHeaderLeft}>
              <View style={styles.incidentIconContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={21}
                  color={colors.primary}
                />
              </View>

              <View style={styles.incidentHeaderText}>
                <Text style={styles.incidentTitle}>
                  Incident {index + 1}
                </Text>

                <Text style={styles.incidentDate}>
                  {formatReportedDate(
                    incident.reported_at
                  )}
                </Text>
              </View>
            </View>

            {!isReadOnly && !isEditing ? (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() =>
                  startEditingIncident(incident)
                }
                accessibilityRole="button"
                accessibilityLabel="Edit incident description"
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            ) : null}
          </View>

          <Divider
            style={styles.cardDivider}
          />

          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                mode="outlined"
                label="Incident description"
                value={editingDescription}
                onChangeText={setEditingDescription}
                multiline
                numberOfLines={4}
                maxLength={MAX_DESCRIPTION_LENGTH}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
                textColor={colors.text}
                style={styles.descriptionInput}
                contentStyle={styles.descriptionInputContent}
                disabled={saving}
              />

              <Text style={styles.characterCount}>
                {editingDescription.length}/
                {MAX_DESCRIPTION_LENGTH}
              </Text>

              <View style={styles.editActions}>
                <Button
                  mode="outlined"
                  onPress={cancelEditingIncident}
                  disabled={saving}
                  textColor={colors.secondaryText}
                  style={styles.secondaryButton}
                >
                  Cancel
                </Button>

                <Button
                  mode="contained"
                  onPress={() =>
                    saveIncidentDescription(incident)
                  }
                  loading={saving}
                  disabled={saving}
                  buttonColor={colors.primary}
                  textColor={colors.buttonText}
                  style={styles.primaryButton}
                >
                  Save
                </Button>
              </View>
            </View>
          ) : (
            <Text style={styles.incidentDescription}>
              {incident.description ||
                'No description provided.'}
            </Text>
          )}

          <View style={styles.photoSectionHeader}>
            <Text style={styles.photoSectionTitle}>
              Photos ({incident.photos.length})
            </Text>

            {deletingPhoto && !isReadOnly ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
              />
            ) : null}
          </View>

          {renderPhotoGrid(
            incident,
            !isReadOnly
          )}
        </View>
      );
    },
    [
      styles,
      colors,
      isReadOnly,
      editingIncidentId,
      editingDescription,
      saving,
      deletingPhoto,
      startEditingIncident,
      cancelEditingIncident,
      saveIncidentDescription,
      renderPhotoGrid,
    ]
  );

  /* =======================================================
     RENDER NEW INCIDENT MODAL
  ======================================================= */

  const renderIncidentModal = () => (
    <Modal
      visible={incidentModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={resetIncidentForm}
    >
      <KeyboardAvoidingView
        style={styles.modalScreen}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={resetIncidentForm}
            disabled={uploading}
            style={styles.modalHeaderButton}
          >
            <Ionicons
              name="close"
              size={25}
              color={colors.text}
            />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>
            Report Incident
          </Text>

          <View style={styles.modalHeaderButton} />
        </View>

        <ScrollView
          style={styles.modalScroll}
          contentContainerStyle={styles.modalContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.fieldLabel}>
            Incident description
          </Text>

          <TextInput
            mode="outlined"
            placeholder="Describe what happened..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            maxLength={MAX_DESCRIPTION_LENGTH}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            textColor={colors.text}
            style={styles.descriptionInput}
            contentStyle={styles.descriptionInputContent}
            disabled={uploading}
          />

          <Text style={styles.characterCount}>
            {description.length}/{MAX_DESCRIPTION_LENGTH}
          </Text>

          <View style={styles.photoSectionHeader}>
            <View>
              <Text style={styles.photoSectionTitle}>
                Incident photos
              </Text>

              <Text style={styles.photoHint}>
                Add at least one photo. Maximum {MAX_IMAGES_UPLOAD}.
              </Text>
            </View>

            <Text style={styles.photoCountBadge}>
              {selectedImages.length}/{MAX_IMAGES_UPLOAD}
            </Text>
          </View>

          <View style={styles.photoActionRow}>
            <TouchableOpacity
              style={styles.photoActionButton}
              onPress={openCamera}
              disabled={uploading}
            >
              <Ionicons
                name="camera-outline"
                size={25}
                color={colors.primary}
              />

              <Text style={styles.photoActionText}>
                Take Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.photoActionButton}
              onPress={openImageLibrary}
              disabled={uploading}
            >
              <Ionicons
                name="images-outline"
                size={25}
                color={colors.primary}
              />

              <Text style={styles.photoActionText}>
                Choose Photos
              </Text>
            </TouchableOpacity>
          </View>

          {selectedImages.length > 0 ? (
            <View style={styles.photoGrid}>
              {selectedImages.map((image, index) => (
                <View
                  key={`${image.uri}-${index}`}
                  style={styles.photoWrapper}
                >
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.photo}
                    resizeMode="cover"
                  />

                  <TouchableOpacity
                    style={styles.deletePhotoButton}
                    onPress={() =>
                      removeSelectedImage(index)
                    }
                    disabled={uploading}
                  >
                    <Ionicons
                      name="close"
                      size={16}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons
                name="images-outline"
                size={32}
                color={colors.mutedText}
              />

              <Text style={styles.photoPlaceholderText}>
                No photos selected
              </Text>
            </View>
          )}

          <View style={styles.noticeBox}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={colors.primary}
            />

            <Text style={styles.noticeText}>
              Please provide an accurate description and
              photos that clearly show the incident.
            </Text>
          </View>

          <Button
            mode="contained"
            onPress={uploadIncident}
            loading={uploading}
            disabled={uploading}
            buttonColor={colors.primary}
            textColor={colors.buttonText}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
            icon="cloud-upload-outline"
          >
            Submit Incident
          </Button>

          <Button
            mode="text"
            onPress={resetIncidentForm}
            disabled={uploading}
            textColor={colors.secondaryText}
            style={styles.cancelModalButton}
          >
            Cancel
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );

  /* =======================================================
     RENDER CAMERA MODAL
  ======================================================= */

  const renderCameraModal = () => (
    <Modal
      visible={cameraModalVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => {
        setCameraModalVisible(false);
        setCameraReady(false);
      }}
    >
      <View style={styles.cameraContainer}>
        <StatusBar
          hidden
          barStyle="light-content"
        />

        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraFacing}
          onCameraReady={() => setCameraReady(true)}
        />

        <View style={styles.cameraTopBar}>
          <TouchableOpacity
            style={styles.cameraIconButton}
            onPress={() => {
              setCameraModalVisible(false);
              setCameraReady(false);
            }}
          >
            <Ionicons
              name="close"
              size={28}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <Text style={styles.cameraTitle}>
            Capture Incident
          </Text>

          <TouchableOpacity
            style={styles.cameraIconButton}
            onPress={toggleCameraFacing}
          >
            <Ionicons
              name="camera-reverse-outline"
              size={27}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.cameraBottomBar}>
          <Text style={styles.cameraHint}>
            {selectedImages.length} of {MAX_IMAGES_UPLOAD} photos selected
          </Text>

          <TouchableOpacity
            style={[
              styles.captureButton,
              !cameraReady && styles.captureButtonDisabled,
            ]}
            onPress={takePicture}
            disabled={!cameraReady}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          {!cameraReady ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
              style={styles.cameraLoading}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );

  /* =======================================================
     RENDER IMAGE VIEWER
  ======================================================= */

  const renderImageViewer = () => (
    <Modal
      visible={viewerVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setViewerVisible(false)}
    >
      <View style={styles.viewerContainer}>
        <TouchableOpacity
          style={styles.viewerCloseButton}
          onPress={() => setViewerVisible(false)}
        >
          <Ionicons
            name="close"
            size={30}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <ImageViewer
          imageUrls={viewerImages}
          index={viewerIndex}
          enableSwipeDown
          onSwipeDown={() => setViewerVisible(false)}
          onCancel={() => setViewerVisible(false)}
          backgroundColor="rgba(0,0,0,0.96)"
          renderIndicator={(
            currentIndex,
            allSize
          ) => (
            <View style={styles.viewerIndicator}>
              <Text style={styles.viewerIndicatorText}>
                {currentIndex} / {allSize}
              </Text>
            </View>
          )}
        />
      </View>
    </Modal>
  );

  /* =======================================================
     MAIN RENDER
  ======================================================= */

  return (
    <View style={styles.container}>
      <View style={styles.mainHeader}>
        <View style={styles.mainHeaderIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={25}
            color={colors.primary}
          />
        </View>

        <View style={styles.mainHeaderText}>
          <Text style={styles.mainTitle}>
            Report Incident
          </Text>

          <Text style={styles.mainSubtitle}>
            {isReadOnly
              ? 'Review reported incidents and photos.'
              : 'Document issues discovered during cleaning.'}
          </Text>
        </View>
      </View>

      <Divider style={styles.mainDivider} />

      {!isReadOnly ? (
        <TouchableOpacity
          style={styles.addIncidentButton}
          onPress={openIncidentForm}
          activeOpacity={0.8}
        >
          <Ionicons
            name="add-circle-outline"
            size={22}
            color={colors.buttonText}
          />

          <Text style={styles.addIncidentButtonText}>
            Report New Incident
          </Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.incidentsHeader}>
        <SectionLabel
          title="Reported Incidents"
          subtitle={
            incidents.length === 1
              ? '1 incident recorded'
              : `${incidents.length} incidents recorded`
          }
          styles={styles}
          colors={colors}
        />

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={loading || refreshing}
        >
          {refreshing ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
            />
          ) : (
            <Ionicons
              name="refresh-outline"
              size={21}
              color={colors.primary}
            />
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text style={styles.loadingText}>
            Loading incidents...
          </Text>
        </View>
      ) : incidents.length === 0 ? (
        <EmptyPlaceholder
          icon="shield-checkmark-outline"
          title="No incidents reported"
          description={
            isReadOnly
              ? 'There are no incident reports available for this schedule.'
              : 'No incidents have been reported for this cleaning yet.'
          }
          styles={styles}
          colors={colors}
        />
      ) : (
        <ScrollView
          style={styles.incidentList}
          contentContainerStyle={styles.incidentListContent}
          showsVerticalScrollIndicator={false}
        >
          {incidents.map(renderIncident)}
        </ScrollView>
      )}

      {renderIncidentModal()}
      {renderCameraModal()}
      {renderImageViewer()}
    </View>
  );
};

/* =========================================================
   STYLES
========================================================= */

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },

    mainHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },

    mainHeaderIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    mainHeaderText: {
      flex: 1,
    },

    mainTitle: {
      fontSize: 19,
      fontWeight: '700',
      color: colors.text,
    },

    mainSubtitle: {
      fontSize: 13,
      color: colors.secondaryText,
      marginTop: 4,
      lineHeight: 19,
    },

    mainDivider: {
      backgroundColor: colors.divider,
      marginBottom: 16,
    },

    addIncidentButton: {
      minHeight: 48,
      borderRadius: 12,
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      marginBottom: 24,
      gap: 8,
    },

    addIncidentButtonText: {
      color: colors.buttonText,
      fontWeight: '700',
      fontSize: 14,
    },

    incidentsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },

    sectionHeading: {
      flex: 1,
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
    },

    sectionSubtitle: {
      fontSize: 12,
      color: colors.secondaryText,
      marginTop: 4,
    },

    refreshButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    loadingContainer: {
      flex: 1,
      minHeight: 160,
      alignItems: 'center',
      justifyContent: 'center',
    },

    loadingText: {
      marginTop: 12,
      fontSize: 13,
      color: colors.secondaryText,
    },

    incidentList: {
      flex: 1,
    },

    incidentListContent: {
      paddingBottom: 24,
    },

    incidentCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 14,
      elevation: 1,
    },

    incidentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },

    incidentHeaderLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },

    incidentIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },

    incidentHeaderText: {
      flex: 1,
    },

    incidentTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },

    incidentDate: {
      fontSize: 11,
      color: colors.secondaryText,
      marginTop: 4,
    },

    iconButton: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },

    cardDivider: {
      backgroundColor: colors.divider,
      marginBottom: 14,
    },

    incidentDescription: {
      fontSize: 14,
      lineHeight: 22,
      color: colors.text,
      marginBottom: 18,
    },

    editContainer: {
      marginBottom: 18,
    },

    descriptionInput: {
      backgroundColor: colors.surface,
      fontSize: 14,
    },

    descriptionInputContent: {
      minHeight: 90,
      textAlignVertical: 'top',
      paddingTop: 12,
    },

    characterCount: {
      textAlign: 'right',
      fontSize: 11,
      color: colors.mutedText,
      marginTop: 5,
      marginBottom: 8,
    },

    editActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: 10,
    },

    secondaryButton: {
      borderColor: colors.border,
      borderRadius: 10,
    },

    primaryButton: {
      borderRadius: 10,
    },

    photoSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      marginTop: 4,
    },

    photoSectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },

    photoHint: {
      fontSize: 12,
      color: colors.secondaryText,
      marginTop: 4,
      lineHeight: 18,
    },

    photoCountBadge: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
      backgroundColor: colors.primaryLight,
      borderRadius: 8,
      overflow: 'hidden',
      paddingHorizontal: 10,
      paddingVertical: 6,
    },

    photoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 12,
    },

    photoWrapper: {
      width: '30%',
      aspectRatio: 1,
      position: 'relative',
      marginBottom: 4,
    },

    photo: {
      width: '100%',
      height: '100%',
      borderRadius: 12,
      backgroundColor: colors.background,
    },

    deletePhotoButton: {
      position: 'absolute',
      top: 5,
      right: 5,
      width: 27,
      height: 27,
      borderRadius: 14,
      backgroundColor: colors.error,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 2,
    },

    noPhotosContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      gap: 8,
    },

    noPhotosText: {
      fontSize: 12,
      color: colors.mutedText,
    },

    emptyContainer: {
      flex: 1,
      minHeight: 210,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 32,
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },

    emptyIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },

    emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },

    emptyDescription: {
      fontSize: 13,
      color: colors.secondaryText,
      textAlign: 'center',
      lineHeight: 20,
      marginTop: 8,
    },

    /* Incident modal */

    modalScreen: {
      flex: 1,
      backgroundColor: colors.background,
    },

    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    modalHeaderButton: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },

    modalTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
    },

    modalScroll: {
      flex: 1,
    },

    modalContent: {
      padding: 18,
      paddingBottom: 40,
    },

    fieldLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 10,
    },

    photoActionRow: {
      flexDirection: 'row',
      gap: 12,
      marginVertical: 16,
    },

    photoActionButton: {
      flex: 1,
      minHeight: 92,
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      gap: 8,
    },

    photoActionText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },

    photoPlaceholder: {
      minHeight: 130,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 16,
    },

    photoPlaceholderText: {
      fontSize: 12,
      color: colors.secondaryText,
    },

    noticeBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      backgroundColor: colors.primaryLight,
      padding: 14,
      borderRadius: 12,
      marginTop: 8,
      marginBottom: 20,
    },

    noticeText: {
      flex: 1,
      fontSize: 12,
      color: colors.text,
      lineHeight: 19,
    },

    submitButton: {
      borderRadius: 12,
    },

    submitButtonContent: {
      minHeight: 48,
    },

    cancelModalButton: {
      marginTop: 8,
    },

    /* Camera modal */

    cameraContainer: {
      flex: 1,
      backgroundColor: '#000000',
    },

    camera: {
      flex: 1,
    },

    cameraTopBar: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 50 : 25,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
    },

    cameraIconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0,0,0,0.45)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    cameraTitle: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },

    cameraBottomBar: {
      position: 'absolute',
      bottom: Platform.OS === 'ios' ? 45 : 30,
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 90,
    },

    cameraHint: {
      color: '#FFFFFF',
      fontSize: 12,
      marginBottom: 14,
    },

    captureButton: {
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 4,
      borderColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },

    captureButtonDisabled: {
      opacity: 0.5,
    },

    captureButtonInner: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: '#FFFFFF',
    },

    cameraLoading: {
      position: 'absolute',
      right: 30,
      bottom: 25,
    },

    /* Image viewer */

    viewerContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.96)',
    },

    viewerCloseButton: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 48 : 20,
      right: 18,
      zIndex: 10,
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: 'rgba(40,40,40,0.8)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    viewerIndicator: {
      position: 'absolute',
      bottom: 35,
      alignSelf: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
    },

    viewerIndicatorText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '600',
    },
  });

export default ReportIncident;