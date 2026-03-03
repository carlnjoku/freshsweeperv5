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




import React, { useState, useRef, useCallback, useContext, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, 
  ActivityIndicator, Dimensions, SafeAreaView, Platform 
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons'; 
import { useFocusEffect } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import userService from '../../../services/connection/userService';
import { Modal as PaperModal, Portal } from 'react-native-paper';
import COLORS from '../../../constants/colors';
import RNModal from 'react-native-modal';
import ImageViewer from 'react-native-image-zoom-viewer';
import { AuthContext } from '../../../context/AuthContext';
import CardNoPrimary from '../../../components/shared/CardNoPrimary';
import { Image } from 'expo-image';
import CustomActivityIndicator from '../../../components/shared/CuustomActivityIndicator';

const { width, height } = Dimensions.get('window');

const ReportIncident = ({ scheduleId }) => {
  const { currentUserId } = useContext(AuthContext);
  const cameraRef = useRef(null);
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [incidentImages, setIncidentImages] = useState([]);
  const [incidentDescription, setIncidentDescription] = useState('');
  const [incidents, setIncidents] = useState([]);
  const [facing, setFacing] = useState('back');
  const [isLoading, setIsLoading] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [editingDescription, setEditingDescription] = useState('');
  const [editingIncidentId, setEditingIncidentId] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isSimulator, setIsSimulator] = useState(false);
  
  const MAX_IMAGES_UPLOAD = 5;

  // Check if running on simulator
  useEffect(() => {
    // Check if we're likely on a simulator (iOS Simulator doesn't have camera)
    if (Platform.OS === 'ios') {
      // This is a common check for simulator
      const checkSimulator = async () => {
        try {
          // Try to access camera - if it fails, we might be on simulator
          if (permission?.granted) {
            // Additional check for simulator
            setIsSimulator(false); // Default to false
          }
        } catch (error) {
          setIsSimulator(true);
        }
      };
      checkSimulator();
    }
  }, [permission]);

  // Request camera and media library permissions
  useEffect(() => {
    (async () => {
      // Request camera permissions
      if (permission && !permission.granted) {
        await requestPermission();
      }
      
      // Request media library permissions for image picker
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaStatus !== 'granted') {
        console.log('Media library permission denied');
      }
    })();
  }, [permission, requestPermission]);

  // Data fetching
  const fetchIncidents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await userService.getIncidents(scheduleId);
      const schedule = response.data.data;
  
      const cleanerGroup = schedule.assignedTo?.find(
        (group) => group.cleanerId === currentUserId
      );
  
      const cleanerIncidents = cleanerGroup?.incidents || [];
      setIncidents(cleanerIncidents);
    } catch (error) {
      console.error("Fetch incidents error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [scheduleId, currentUserId]);

  useFocusEffect(
    useCallback(() => {
      fetchIncidents();
      return () => {};
    }, [fetchIncidents])
  );

  // Take picture with camera or pick from library
  const takePicture = async () => {
    // On simulator or when camera fails, use image picker
    if (isSimulator || !permission?.granted) {
      await pickImageFromLibrary();
      return;
    }

    if (cameraRef.current && isCameraReady) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
          exif: false,
          skipProcessing: true
        });
        
        const newPhoto = {
          uri: photo.uri,
          base64: photo.base64,
          filename: `incident_${Date.now()}.jpg`,
          file: `data:image/jpg;base64,${photo.base64}`
        };
        
        if (incidentImages.length < MAX_IMAGES_UPLOAD) {
          setIncidentImages(prev => [...prev, newPhoto]);
        } else {
          Alert.alert('Limit reached', `Maximum ${MAX_IMAGES_UPLOAD} photos allowed`);
        }
      } catch (error) {
        console.error('Camera error:', error);
        Alert.alert('Error', 'Failed to capture image. Using photo library instead.');
        // Fallback to image picker
        await pickImageFromLibrary();
      }
    } else {
      // Camera not ready, use image picker
      await pickImageFromLibrary();
    }
  };

  // Pick image from library
  const pickImageFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
        allowsMultipleSelection: true,
        selectionLimit: MAX_IMAGES_UPLOAD - incidentImages.length
      });

      if (!result.canceled) {
        const newPhotos = result.assets.map((asset, index) => ({
          uri: asset.uri,
          base64: asset.base64,
          filename: `incident_${Date.now()}_${index}.jpg`,
          file: `data:image/jpg;base64,${asset.base64}`
        }));

        if (incidentImages.length + newPhotos.length <= MAX_IMAGES_UPLOAD) {
          setIncidentImages(prev => [...prev, ...newPhotos]);
        } else {
          Alert.alert('Limit reached', `Maximum ${MAX_IMAGES_UPLOAD} photos allowed`);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image from library');
    }
  };

  // Flip camera
  const flipCamera = () => {
    setFacing(current => current === 'back' ? 'front' : 'back');
  };

  // Image handling
  const removePhoto = (index) => {
    setIncidentImages(prev => prev.filter((_, i) => i !== index));
  };

  const openImageViewer = (images, index) => {
    if (Array.isArray(images)) {
      const formattedImages = images.map(img => ({ 
        url: img.url || img.uri || img.file,
        props: { source: { uri: img.url || img.uri || img.file } }
      }));
      setCurrentImages(formattedImages);
      setCurrentImageIndex(index);
      setImageViewerVisible(true);
    }
  };

  // Incident CRUD operations
  const uploadIncident = async () => {
    if (!incidentDescription.trim()) {
      Alert.alert('Validation', 'Please enter incident description');
      return;
    }
  
    if (incidentImages.length === 0) {
      Alert.alert('Validation', 'Please add at least one photo');
      return;
    }
  
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('scheduleId', scheduleId);
      formData.append('cleanerId', currentUserId);
      formData.append('description', incidentDescription);

      // Convert images to file objects
      incidentImages.forEach((image, index) => {
        if (image.uri) {
          // Extract filename from URI or use default
          const filename = image.filename || `incident_${Date.now()}_${index}.jpg`;
          
          // Create a file object
          formData.append('files', {
            uri: image.uri,
            name: filename,
            type: 'image/jpeg',
          });
        }
      });

      const response = await userService.uploadPhotosIncidentPhotos(formData);
      
      const newIncident = {
        ...response.data,
        photos: response.data.uploaded_files || incidentImages.map(img => ({ 
          url: img.uri || img.file,
          content_type: 'image/jpeg',
          original_name: img.filename || 'incident_photo.jpg'
        })),
        description: incidentDescription,
        reported_at: new Date().toISOString()
      };
      
      setIncidents(prev => [...prev, newIncident]);
      setIncidentImages([]);
      setIncidentDescription('');
      setIncidentModalOpen(false);
      Alert.alert('Success', 'Incident reported successfully');
    } catch (error) {
      console.error('Upload error:', error.response?.data || error.message || error);
      Alert.alert('Error', 'Failed to submit incident. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleEdit = (incident) => {
    if (editingIncidentId === incident.reported_at) {
      setEditingIncidentId(null);
      setEditingDescription('');
    } else {
      setEditingIncidentId(incident.reported_at);
      setEditingDescription(incident.description || '');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingIncidentId || !editingDescription.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    try {
      setIsLoading(true);
      
      const updatedIncidents = incidents.map(inc => 
        inc.reported_at === editingIncidentId
          ? { 
              ...inc, 
              description: editingDescription,
              isEditing: false
            }
          : inc
      );
      
      setIncidents(updatedIncidents);
      
      await userService.updateScheduleIncidents({
        scheduleId,
        cleanerId: currentUserId,
        incidents: updatedIncidents.map(({ isEditing, ...inc }) => ({
          ...inc,
          photos: inc.photos.map(photo => ({
            url: photo.url,
            content_type: photo.content_type || 'image/jpeg',
            original_name: photo.original_name || 'incident_photo.jpg'
          }))
        }))
      });
      
      setEditingIncidentId(null);
      setEditingDescription('');
      
      Alert.alert('Success', 'Incident updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = (incidentId, imageUrl) => {
    const updatedIncidents = incidents.map(inc => 
      inc.reported_at === incidentId
        ? { ...inc, photos: inc.photos.filter(photo => photo.url !== imageUrl) }
        : inc
    );
    
    setIncidents(updatedIncidents);
    
    // Update backend
    userService.updateScheduleIncidents({
      scheduleId,
      cleanerId: currentUserId,
      incidents: updatedIncidents.map(({ isEditing, ...inc }) => ({
        ...inc,
        photos: inc.photos.map(photo => ({
          url: photo.url,
          content_type: photo.content_type || 'image/jpeg',
          original_name: photo.original_name || 'incident_photo.jpg'
        }))
      }))
    }).catch(error => {
      console.error('Delete image error:', error);
      Alert.alert('Error', 'Failed to delete image');
    });
  };

  // UI Components
  const EmptyPlaceholder = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="shield-checkmark" size={48} color={COLORS.lightGray} />
      </View>
      <Text style={styles.emptyTitle}>No Incidents Reported</Text>
      <Text style={styles.emptySubtitle}>
        Great job! No issues have been reported for this cleaning session.
      </Text>
    </View>
  );

  const IncidentImageThumbnail = ({ photo, index, onDelete, onPress }) => (
    <View style={styles.thumbnailContainer}>
      <TouchableOpacity onPress={onPress}>
        <Image 
          source={{ uri: photo.url || photo.uri || photo.file }} 
          style={styles.incidentImage}
          transition={300}
          cachePolicy="memory-disk"
        />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={onDelete}
      >
        <Ionicons name="close-circle" size={20} color="white" />
      </TouchableOpacity>
      <View style={styles.photoNumber}>
        <Text style={styles.photoNumberText}>{index + 1}</Text>
      </View>
    </View>
  );

  const PreviewThumbnail = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.previewThumbnailContainer}
      onPress={() => openImageViewer(incidentImages, index)}
    >
      <Image source={{ uri: item.uri || item.file }} style={styles.previewThumbnail} />
      <TouchableOpacity 
        style={styles.removePreviewButton}
        onPress={(e) => {
          e.stopPropagation();
          removePhoto(index);
        }}
      >
        <Ionicons name="close" size={16} color="white" />
      </TouchableOpacity>
      <View style={styles.previewNumberSmall}>
        <Text style={styles.previewNumberTextSmall}>{index + 1}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderIncidentItem = ({ item }) => (
    <CardNoPrimary key={item.reported_at}>
      <View style={styles.incidentCard}>
        {/* Incident Header */}
        <View style={styles.incidentHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.incidentIcon}>
              <Ionicons name="warning" size={20} color="#d32f2f" />
            </View>
            <View>
              <Text style={styles.incidentTitle}>Incident Report</Text>
              <Text style={styles.incidentDate}>
                {new Date(item.reported_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => handleToggleEdit(item)} 
            style={styles.editButton}
          >
            <Ionicons 
              name={editingIncidentId === item.reported_at ? "close" : "create-outline"} 
              size={20} 
              color={COLORS.primary} 
            />
          </TouchableOpacity>
        </View>

        {/* Incident Images */}
        <FlatList
          horizontal
          data={item.photos}
          keyExtractor={(photo, index) => `${item.reported_at}-${index}`}
          renderItem={({ item: photo, index }) => (
            <IncidentImageThumbnail
              photo={photo}
              index={index}
              onDelete={() => handleDeleteImage(item.reported_at, photo.url)}
              onPress={() => openImageViewer(item.photos, index)}
            />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imagesContainer}
          ListEmptyComponent={
            <View style={styles.noPhotos}>
              <Ionicons name="images-outline" size={32} color="#ddd" />
              <Text style={styles.noPhotosText}>No photos</Text>
            </View>
          }
        />

        {/* Incident Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionLabel}>Description</Text>
          {editingIncidentId === item.reported_at ? (
            <View>
              <TextInput
                label="Describe the incident..."
                mode="outlined"
                multiline
                numberOfLines={4}
                outlineColor="#D8D8D8"
                activeOutlineColor={COLORS.primary}
                style={styles.descriptionInput}
                value={editingDescription}
                onChangeText={setEditingDescription}
                autoFocus={true}
              />
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSaveEdit}
                disabled={isLoading}
              >
                <Ionicons name="checkmark" size={18} color="white" />
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.incidentDescription}>{item.description}</Text>
          )}
        </View>
      </View>
    </CardNoPrimary>
  );

  const isEditingAny = editingIncidentId !== null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Camera Modal */}
      <RNModal
        isVisible={cameraVisible}
        style={styles.fullScreenModal}
        onBackdropPress={() => setCameraVisible(false)}
      >
        <View style={styles.cameraModalContainer}>
          {/* Camera Header */}
          <View style={styles.cameraHeader}>
            <TouchableOpacity 
              style={styles.cameraCloseButton}
              onPress={() => setCameraVisible(false)}
            >
              <Ionicons name="chevron-down" size={28} color="white" />
            </TouchableOpacity>
            
            {!isSimulator && permission?.granted && (
              <TouchableOpacity 
                style={styles.flipButton}
                onPress={flipCamera}
              >
                <Ionicons name="camera-reverse" size={24} color="white" />
              </TouchableOpacity>
            )}
          </View>

          {/* Camera Preview */}
          {isSimulator ? (
            <View style={styles.simulatorContainer}>
              <Ionicons name="camera-off" size={64} color="white" />
              <Text style={styles.simulatorText}>Camera not available in simulator</Text>
              <Text style={styles.simulatorSubtext}>
                Use "Pick from Library" button below to add photos
              </Text>
              
              <TouchableOpacity 
                style={styles.libraryButton}
                onPress={pickImageFromLibrary}
              >
                <Ionicons name="images" size={24} color="white" />
                <Text style={styles.libraryButtonText}>Pick from Library</Text>
              </TouchableOpacity>
            </View>
          ) : !permission ? (
            <View style={styles.permissionContainer}>
              <ActivityIndicator size="large" color="white" />
              <Text style={styles.permissionText}>Requesting camera permission...</Text>
            </View>
          ) : !permission.granted ? (
            <View style={styles.permissionContainer}>
              <Ionicons name="camera-off" size={48} color="white" />
              <Text style={styles.permissionText}>No access to camera</Text>
              <TouchableOpacity 
                style={styles.permissionButton}
                onPress={() => {
                  setCameraVisible(false);
                  Alert.alert(
                    'Permission Required',
                    'Please enable camera permissions in your device settings.',
                    [{ text: 'OK' }]
                  );
                }}
              >
                <Text style={styles.permissionButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <CameraView 
              style={styles.camera}
              facing={facing}
              ref={cameraRef}
              onCameraReady={() => setIsCameraReady(true)}
            >
              {/* Camera Controls */}
              <View style={styles.cameraControls}>
                <TouchableOpacity 
                  style={styles.captureButton}
                  onPress={takePicture}
                  disabled={incidentImages.length >= MAX_IMAGES_UPLOAD}
                >
                  <View style={styles.captureButtonInner}>
                    <Ionicons name="camera" size={32} color="white" />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Photo Counter */}
              <View style={styles.photoCounter}>
                <Ionicons name="images-outline" size={16} color="white" />
                <Text style={styles.photoCounterText}>
                  {incidentImages.length}/{MAX_IMAGES_UPLOAD}
                </Text>
              </View>
            </CameraView>
          )}

          {/* Thumbnail Preview Section */}
          {incidentImages.length > 0 && (
            <View style={styles.cameraThumbnailSection}>
              <FlatList
                data={incidentImages}
                horizontal
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View style={styles.thumbnailContainer}>
                    <Image source={{ uri: item.uri || item.file }} style={styles.preview} />
                    <TouchableOpacity 
                      onPress={() => removePhoto(index)} 
                      style={styles.removeButton}
                    >
                      <Ionicons name="trash-outline" size={14} color="white" />
                    </TouchableOpacity>
                    <View style={styles.previewNumber}>
                      <Text style={styles.previewNumberText}>{index + 1}</Text>
                    </View>
                  </View>
                )}
                contentContainerStyle={styles.previewContainer}
                showsHorizontalScrollIndicator={false}
              />
              
              <TouchableOpacity 
                style={styles.doneButton}
                onPress={() => setCameraVisible(false)}
              >
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.doneButtonText}>Done ({incidentImages.length} photos)</Text>
              </TouchableOpacity>
            </View>
          )}

          {incidentImages.length === 0 && permission?.granted && !isSimulator && (
            <View style={styles.cameraInstructions}>
              <Text style={styles.cameraInstructionsText}>
                Tap the camera button to capture incident photos
              </Text>
              <TouchableOpacity 
                style={styles.libraryButtonSmall}
                onPress={pickImageFromLibrary}
              >
                <Ionicons name="images" size={16} color="white" />
                <Text style={styles.libraryButtonTextSmall}>or Pick from Library</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </RNModal>

      {/* Image Viewer Modal */}
      <RNModal
        isVisible={imageViewerVisible}
        style={styles.fullScreenModal}
        onBackdropPress={() => setImageViewerVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ImageViewer
            imageUrls={currentImages}
            index={currentImageIndex}
            enableSwipeDown
            onSwipeDown={() => setImageViewerVisible(false)}
            backgroundColor="black"
          />
          <TouchableOpacity
            style={styles.viewerCloseButton}
            onPress={() => setImageViewerVisible(false)}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </RNModal>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loaderContainer}>
          <CustomActivityIndicator size={40} />
        </View>
      )}

      {/* Incidents List */}
      <FlatList
        data={incidents}
        keyExtractor={(item, index) => item?.reported_at ? item.reported_at.toString() : `incident-${index}`}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="document-text-outline" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.headline}>Incident Reports</Text>
            <Text style={styles.subtitle}>Document any issues or concerns during cleaning</Text>
            
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={20} color={COLORS.warning} />
              <Text style={styles.infoText}>
                Report any damages, missing items, or other issues encountered during cleaning.
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={!isLoading && <EmptyPlaceholder />}
        renderItem={renderIncidentItem}
        contentContainerStyle={styles.listContainer}
      />

      {/* Add Incident Button */}
      {!isEditingAny && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIncidentModalOpen(true)}
        >
          <Ionicons name="add-circle" size={22} color="white" />
          <Text style={styles.addButtonText}>Report Incident</Text>
        </TouchableOpacity>
      )}

      {/* Incident Creation Modal */}
      <Portal>
        <PaperModal
          visible={incidentModalOpen}
          onDismiss={() => {
            setIncidentModalOpen(false);
            setIncidentImages([]);
            setIncidentDescription('');
          }}
          style={styles.creationModal}
        >
          <View style={styles.modalContentWrapper}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report New Incident</Text>
              <TouchableOpacity 
                onPress={() => {
                  setIncidentModalOpen(false);
                  setIncidentImages([]);
                  setIncidentDescription('');
                }}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={COLORS.dark} />
              </TouchableOpacity>
            </View>

            {/* Camera Button */}
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={() => setCameraVisible(true)}
            >
              <Ionicons name="camera" size={24} color={COLORS.primary} />
              <Text style={styles.cameraButtonText}>
                {isSimulator ? 'Pick Photo from Library' : incidentImages.length > 0 ? 'Add More Photos' : 'Take Photo'}
              </Text>
            </TouchableOpacity>

            {/* Alternative Library Button */}
            <TouchableOpacity 
              style={styles.libraryButtonModal}
              onPress={pickImageFromLibrary}
            >
              <Ionicons name="images" size={24} color={COLORS.primary} />
              <Text style={styles.libraryButtonTextModal}>
                Pick from Photo Library
              </Text>
            </TouchableOpacity>

            {/* Image Previews */}
            {incidentImages.length > 0 && (
              <View style={styles.previewSection}>
                <View style={styles.previewSectionHeader}>
                  <Text style={styles.previewTitle}>Captured Photos ({incidentImages.length}/{MAX_IMAGES_UPLOAD})</Text>
                  <TouchableOpacity 
                    style={styles.clearAllButton}
                    onPress={() => setIncidentImages([])}
                  >
                    <Text style={styles.clearAllText}>Clear All</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  horizontal
                  data={incidentImages}
                  keyExtractor={(item, index) => `preview-${index}`}
                  contentContainerStyle={styles.previewContainer}
                  renderItem={({ item, index }) => (
                    <PreviewThumbnail item={item} index={index} />
                  )}
                />
              </View>
            )}

            <TextInput
              label="Incident description"
              placeholder="Describe what happened..."
              mode="outlined"
              multiline
              numberOfLines={4}
              value={incidentDescription}
              onChangeText={setIncidentDescription}
              style={styles.modalDescriptionInput}
              outlineColor="#D8D8D8"
              activeOutlineColor={COLORS.primary}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setIncidentModalOpen(false);
                  setIncidentImages([]);
                  setIncidentDescription('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  (!incidentDescription.trim() || incidentImages.length === 0) && styles.submitButtonDisabled
                ]}
                onPress={uploadIncident}
                disabled={isUploading || !incidentDescription.trim() || incidentImages.length === 0}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={18} color="white" />
                    <Text style={styles.submitButtonText}>Submit Report</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </PaperModal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerIcon: {
    alignSelf: 'center',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 50,
    marginBottom: 12,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '400',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
    marginLeft: 12,
    lineHeight: 20,
  },
  listContainer: {
    padding: 16,
  },
  incidentCard: {
    padding: 16,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  incidentIcon: {
    backgroundColor: '#ffebee',
    padding: 8,
    borderRadius: 10,
    marginRight: 12,
  },
  incidentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  incidentDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  editButton: {
    padding: 8,
  },
  imagesContainer: {
    paddingVertical: 8,
  },
  thumbnailContainer: {
    marginRight: 12,
    marginBottom: 8,
    position: 'relative',
  },
  incidentImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 4,
    borderRadius: 10,
  },
  photoNumber: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  photoNumberText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  noPhotos: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  noPhotosText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  descriptionSection: {
    marginTop: 8,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  descriptionInput: {
    backgroundColor: 'white',
  },
  incidentDescription: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 20,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyIcon: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 50,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  creationModal: {
    margin: 20,
  },
  modalContentWrapper: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  modalCloseButton: {
    padding: 4,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 20,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  cameraButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 12,
  },
  libraryButtonModal: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0f0ff',
  },
  libraryButtonTextModal: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 12,
  },
  previewSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  previewSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  clearAllButton: {
    padding: 4,
  },
  clearAllText: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: '500',
  },
  previewContainer: {
    paddingVertical: 8,
  },
  previewThumbnailContainer: {
    marginRight: 12,
    position: 'relative',
  },
  previewThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePreviewButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 4,
  },
  previewNumberSmall: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
  },
  previewNumberTextSmall: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  modalDescriptionInput: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Camera Modal Styles
  fullScreenModal: {
    margin: 0,
  },
  cameraModalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  cameraCloseButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
  },
  flipButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
  },
  simulatorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 20,
  },
  simulatorText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  simulatorSubtext: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    marginBottom: 30,
  },
  libraryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  libraryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  libraryButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  libraryButtonTextSmall: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  permissionText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  permissionButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
  },
  captureButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  photoCounter: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  photoCounterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  cameraThumbnailSection: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 16,
  },
  preview: { 
    width: 80, 
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  previewNumber: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  previewNumberText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cameraInstructions: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  cameraInstructionsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  viewerCloseButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
    zIndex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    zIndex: 10,
  },
});

export default ReportIncident;