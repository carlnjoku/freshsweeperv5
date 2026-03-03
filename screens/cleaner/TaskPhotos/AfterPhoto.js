// import React, { useEffect, useContext, useCallback, useState, useRef } from 'react';
// import { 
//   View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, 
//   FlatList, ScrollView, Dimensions, Animated, PanResponder
// } from 'react-native';
// import { Camera } from 'expo-camera';
// import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'; 
// import COLORS from '../../../constants/colors';
// import userService from '../../../services/connection/userService';
// import { AuthContext } from '../../../context/AuthContext';
// import { useFocusEffect } from '@react-navigation/native';
// import CardNoPrimary from '../../../components/shared/CardNoPrimary';
// import { Checkbox } from 'react-native-paper';
// import ImageViewer from 'react-native-image-zoom-viewer';
// import Modal from 'react-native-modal';
// import { sendPushNotifications } from '../../../utils/sendPushNotification';
// import ROUTES from '../../../constants/routes';
// import CircularProgress from 'react-native-circular-progress-indicator';
// import { Image } from 'expo-image'; 
// import CustomActivityIndicator from '../../../components/shared/CuustomActivityIndicator';
// import formatRoomTitle from '../../../utils/formatRoomTitle';

// const { width } = Dimensions.get('window');

// const ThumbnailItem = React.memo(({ 
//   photo, 
//   index, 
//   openImageViewer, 
//   taskTitle,
//   invertPercentage, 
//   getCleanlinessColor, 
//   photosArray,
//   onDelete
// }) => {
//   const photoScore = invertPercentage(photo.cleanliness?.individual_overall || 0);
//   const isProblemPhoto = photoScore < 35;
//   const fadeAnim = useRef(new Animated.Value(1)).current;

//   const handleDelete = () => {
//     Alert.alert(
//       "Delete Photo",
//       "Are you sure you want to permanently delete this photo?",
//       [
//         { text: "Cancel", style: "cancel" },
//         { 
//           text: "Delete", 
//           onPress: () => {
//             Animated.timing(fadeAnim, {
//               toValue: 0,
//               duration: 300,
//               useNativeDriver: true
//             }).start(() => onDelete(index, taskTitle));
//           }
//         }
//       ]
//     );
//   };

//   return (
//     <Animated.View style={{ opacity: fadeAnim }}>
//       <TouchableOpacity
//         onPress={() => openImageViewer(photosArray, index, taskTitle)}
//         style={styles.thumbnailContainer}
//       >
//         <Image
//           source={{ uri: photo.img_url }}
//           style={styles.preview}
//           cachePolicy="memory-disk"
//           transition={300}
//         />
//         <TouchableOpacity 
//           onPress={handleDelete}
//           style={styles.deleteButton}
//         >
//           <Ionicons name="trash-outline" size={16} color="white" />
//         </TouchableOpacity>
//         {isProblemPhoto && (
//           <View style={styles.warningBadge}>
//             <MaterialIcons name="warning" size={14} color="#fff" />
//           </View>
//         )}
//         <View style={styles.photoNumber}>
//           <Text style={styles.photoNumberText}>{index + 1}</Text>
//         </View>
//       </TouchableOpacity>
//     </Animated.View>
//   );
// });

// const AfterPhoto = ({ scheduleId, hostId }) => {
//   const { currentUserId, currentUser } = useContext(AuthContext);
//   const cameraRef = useRef(null);
//   const MAX_IMAGES_UPLOAD = 10;
  
//   const [tasks, setTasks] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedImages, setSelectedImages] = useState({});
//   const [isUploading, setIsUploading] = useState(false);
//   const [photos, setPhotos] = useState([]);
//   const [cleaning_fee, setFee] = useState(0);
//   const [cameraVisible, setCameraVisible] = useState(false);
//   const [isBeforeModalVisible, setBeforeModalVisible] = useState(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [currentImages, setCurrentImages] = useState([]);
//   const [hostTokens, setHostPushToken] = useState([]);
//   const [selectedTaskTitle, setSelectedTaskTitle] = useState('');
//   const [cameraMode, setCameraMode] = useState('idle');
//   const [selectedRoom, setSelectedRoom] = useState(null);
//   const [rooms, setRooms] = useState([]);

//   const pan = useRef(new Animated.ValueXY()).current;
//   const overlayOpacity = useRef(new Animated.Value(1)).current;

//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => true,
//       onPanResponderMove: Animated.event([null, { dy: pan.y }], { useNativeDriver: false }),
//       onPanResponderRelease: (e, gesture) => {
//         if (gesture.dy > 50) {
//           Animated.timing(pan, { toValue: { x: 0, y: 300 }, duration: 300, useNativeDriver: true }).start();
//           Animated.timing(overlayOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
//         } else {
//           Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
//           Animated.spring(overlayOpacity, { toValue: 1, useNativeDriver: true }).start();
//         }
//       }
//     })
//   ).current;

//   const invertPercentage = (score) => 100 - (score * 10);

//   const getCleanlinessLabel = (invertedScore) => {
//     if (invertedScore <= 35) return 'Needs Deep Cleaning';
//     if (invertedScore <= 40) return 'Requires Attention';
//     return 'Very Clean';
//   };
  
//   const getCleanlinessColor = (invertedScore) => {
//     if (invertedScore <= 35) return '#e74c3c';
//     if (invertedScore <= 40) return '#f1c40f';
//     return '#2ecc71';
//   };

//   const fetchImages = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const response = await userService.getUpdatedImageUrls(scheduleId);
//       const res = response.data.data;
//       const getCleanerById = (id) => res.assignedTo.find(cleaner => cleaner.cleanerId === id);
//       const cl = getCleanerById(currentUserId);
      
//       if (cl?.checklist?.details) {
//         const details = cl.checklist.details;
//         setSelectedImages(details);
        
//         // Convert details object to rooms array - INCLUDING EXTRA ROOM
//         const roomArray = Object.keys(details).map(key => {
//           const roomData = details[key];
//           const isExtraRoom = key === 'Extra';
          
//           return {
//             id: key,
//             name: isExtraRoom ? 'Extra Tasks' : formatRoomTitle(key),
//             type: isExtraRoom ? 'extra' : key.split('_')[0],
//             tasks: roomData.tasks || [],
//             photos: roomData.photos || [],
//             completed: isExtraRoom 
//               ? (roomData.tasks || []).every(task => task.value === true) 
//               : (roomData.tasks || []).every(task => task.value === true) && 
//                 (roomData.photos || []).length >= 3,
//             isExtra: isExtraRoom
//           };
//         }); // No filter - include all rooms
        
//         setRooms(roomArray);
//         setTasks(details);
//         setFee(cl.checklist.price || 0);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   }, [scheduleId, currentUserId]);

//   const fetchHostPushTokens = useCallback(async () => {
//     const response = await userService.getUserPushTokens(hostId);
//     setHostPushToken(response.data.tokens);
//   }, [hostId]);

//   useFocusEffect(
//     useCallback(() => {
//       let isActive = true;
//       const fetchData = async () => {
//         try {
//           await fetchImages();
//           await fetchHostPushTokens();
//         } catch (error) {
//           console.error("Error fetching data:", error);
//         }
//       };
//       if (isActive) fetchData();
//       return () => { isActive = false; };
//     }, [fetchImages, fetchHostPushTokens])
//   );

//   useEffect(() => {
//     (async () => {
//       const { status } = await Camera.requestCameraPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Camera permission not granted');
//       }
//     })();
//   }, []);

//   useEffect(() => {
//     if (currentImages[currentImageIndex]?.cleanliness) {
//       pan.setValue({ x: 0, y: 0 });
//       overlayOpacity.setValue(1);
//     }
//   }, [currentImageIndex]);

//   const openImageViewer = useCallback((images, index, category) => {
//     pan.setValue({ x: 0, y: 0 });
//     overlayOpacity.setValue(1);

//     const formattedImages = images.map(photo => {
//       const score = invertPercentage(photo.cleanliness?.individual_overall || 0);
//       const status = getCleanlinessLabel(score);
      
//       return {
//         url: status === "Very Clean" ? photo.img_url : photo.cleanliness?.heatmap_url || photo.img_url,
//         cleanliness: photo.cleanliness,
//         props: { source: { uri: status === "Very Clean" ? photo.img_url : photo.cleanliness?.heatmap_url } },
//         category: category
//       };
//     });
  
//     setCurrentImages(formattedImages);
//     setCurrentImageIndex(index);
//     setBeforeModalVisible(true);
//   }, []);

//   const takePicture = async () => {
//     if (cameraRef.current) {
//       setCameraMode('capturing');
//       const options = { quality: 0.8, base64: true };
//       const newPhoto = await cameraRef.current.takePictureAsync(options);
      
//       setPhotos(prev => [...prev, {
//         filename: `photo_${Date.now()}_${prev.length}.jpg`,
//         file: `data:image/jpeg;base64,${newPhoto.base64}`,
//         timestamp: new Date().toISOString()
//       }]);
      
//       setCameraMode('review');
      
//       setTimeout(() => {
//         if (photos.length < MAX_IMAGES_UPLOAD - 1) {
//           setCameraMode('idle');
//         }
//       }, 1000);
//     }
//   };

//   const openCamera = (taskTitle) => {
//     setSelectedTaskTitle(taskTitle);
//     setPhotos([]);
//     setCameraMode('idle');
//     setCameraVisible(true);
//   };

//   const validateTasks = () => {
//     if (!selectedImages || Object.keys(selectedImages).length === 0) {
//       Alert.alert("Validation Error", "No tasks or images found for validation.");
//       return false;
//     }

//     let invalidCategories = [];
//     let insufficientImagesCategories = [];

//     Object.keys(selectedImages).forEach((category) => {
//       const categoryData = selectedImages[category];
//       if (!categoryData || !categoryData.tasks || !Array.isArray(categoryData.tasks)) return;

//       const { tasks, photos } = categoryData;
//       const isExtraRoom = category === 'Extra';
//       const allTasksCompleted = tasks.every((task) => task.value === true);
      
//       if (!allTasksCompleted) invalidCategories.push(category);
      
//       // Only check photos for non-extra rooms
//       if (!isExtraRoom && (!photos || photos.length < 3)) {
//         insufficientImagesCategories.push(category);
//       }
//     });

//     if (invalidCategories.length > 0 || insufficientImagesCategories.length > 0) {
//       let errorMessage = "";
//       if (invalidCategories.length > 0) errorMessage += `Incomplete tasks in: ${invalidCategories.join(", ")}.\n`;
//       if (insufficientImagesCategories.length > 0) errorMessage += `Insufficient images in: ${insufficientImagesCategories.join(", ")}.`;
//       Alert.alert("Validation Error", errorMessage);
//       return false;
//     }

//     return true;
//   };

//   const onSubmit = async () => {
//     if (photos.length === 0) {
//       Alert.alert('No Photos', 'Please take at least one photo before uploading.');
//       return;
//     }

//     if (photos.length > MAX_IMAGES_UPLOAD) {
//       Alert.alert('Upload Limit Exceeded', `You can only upload up to ${MAX_IMAGES_UPLOAD} images at a time.`);
//       return;
//     }
  
//     setIsUploading(true);
//     const data = {
//       photo_type: 'after_photos',
//       scheduleId: scheduleId,
//       images: photos,
//       currentUserId: currentUserId,
//       task_title: selectedTaskTitle,
//       updated_tasks: selectedImages,
//     };

//     try {
//       const response = await userService.uploadTaskPhotos(data);
//       if (response.status === 200) {
//         Alert.alert('Upload Successful', `${photos.length} photos have been uploaded successfully!`);
//         fetchImages();
//         setPhotos([]);
//         setCameraMode('idle');
//       }
//     } catch (err) {
//       console.error('Error uploading photos:', err);
//       Alert.alert('Upload Failed', 'An error occurred while uploading your photos.');
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const updateTasksInBackend = async (category, updatedTasks) => {
//     try {
//       const data = { scheduleId, cleanerId: currentUserId, category, tasks: updatedTasks };
//       await userService.updateChecklist(data);
//     } catch (err) {
//       console.error("Error updating tasks:", err);
//     }
//   };
  
//   const handleTaskToggle = (category, taskId) => {
//     setSelectedImages((prevSelectedImages) => {
//       const updatedImages = { ...prevSelectedImages };
//       if (!updatedImages[category]) return prevSelectedImages;

//       updatedImages[category].tasks = updatedImages[category].tasks.map((task) =>
//         task.id === taskId ? { ...task, value: !task.value } : task
//       );

//       updateTasksInBackend(category, updatedImages[category].tasks);
//       return updatedImages;
//     });
//   };

//   const removePhoto = (index) => {
//     setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
//   };

//   const handleDeletePhoto = async (indexToDelete, category) => {
//     try {
//       const photoToDelete = selectedImages[category]?.photos[indexToDelete];
//       if (!photoToDelete) {
//         Alert.alert("Error", "Photo not found");
//         return;
//       }

//       const originalFilename = photoToDelete.img_url.split('/').pop();
//       const heatmapFilename = photoToDelete.cleanliness?.heatmap_url?.split('/').pop();

//       setSelectedImages(prev => {
//         const updated = {...prev};
//         updated[category].photos = updated[category].photos.filter((_, i) => i !== indexToDelete);
//         return updated;
//       });

//       const data = { originalFilename, heatmapFilename, category, scheduleId };
//       await userService.deleteSpaceAfterPhoto(data);
//       updateTasksInBackend(selectedImages);

//     } catch (error) {
//       console.error('Delete failed:', error);
//       setSelectedImages(prev => ({...prev}));
//       Alert.alert('Deletion Failed', error.response?.data?.detail || 'Could not delete photo');
//     }
//   };

//   const submitCompletion = useCallback(async () => {
//     if (!validateTasks()) return;
//     setIsLoading(true);
//     try {
//       await userService.finishCleaning({
//         scheduleId,
//         cleanerId: currentUserId,
//         completed_tasks: selectedImages,
//         fee: parseFloat(cleaning_fee),
//         completionTime: new Date()
//       });
//       sendPushNotifications(hostTokens, 
//         `${currentUser.firstname} Completed Cleaning`,
//         `${currentUser.firstname} ${currentUser.lastname} has completed the cleaning.`,
//         { screen: ROUTES.host_task_progress, params: { scheduleId } }
//       );
//       Alert.alert("Success", "Cleaning completed successfully!");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [selectedImages, hostTokens, scheduleId, currentUser]);

//   const getRoomProgress = (room) => {
//     if (!selectedImages[room.id]) return 0;
//     const roomData = selectedImages[room.id];
//     const isExtraRoom = room.id === 'Extra';
    
//     const taskProgress = roomData.tasks?.length > 0 
//       ? (roomData.tasks.filter(t => t.value).length / roomData.tasks.length) * (isExtraRoom ? 100 : 50) 
//       : 0;
    
//     // For extra rooms, don't require photos - only tasks matter
//     const photoProgress = isExtraRoom ? 0 : Math.min((roomData.photos?.length || 0 / 3) * 50, 50);
    
//     return taskProgress + photoProgress;
//   };

//   const isRoomComplete = (room) => {
//     if (!selectedImages[room.id]) return false;
//     const roomData = selectedImages[room.id];
    
//     const isExtraRoom = room.id === 'Extra';
//     const tasksComplete = roomData.tasks?.every(task => task.value === true) || false;
//     // For extra rooms, we don't require photos
//     const photosComplete = isExtraRoom ? true : (roomData.photos?.length || 0) >= 3;
    
//     return tasksComplete && photosComplete;
//   };

//   const allRoomsComplete = rooms.every(room => isRoomComplete(room));

//   const markRoomComplete = (roomId) => {
//     Alert.alert(
//       "Mark Room Complete",
//       "Are you sure this room is fully cleaned and all photos are taken?",
//       [
//         { text: "Cancel", style: "cancel" },
//         { 
//           text: "Mark Complete", 
//           onPress: () => {
//             setRooms(prev => prev.map(room => 
//               room.id === roomId ? { ...room, completed: true } : room
//             ));
//             Alert.alert("Success", "Room marked as complete!");
//           }
//         }
//       ]
//     );
//   };

//   const getRoomIcon = (type) => {
//     switch(type.toLowerCase()) {
//       case 'bedroom': return 'bed';
//       case 'bathroom': return 'shower';
//       case 'kitchen': return 'silverware-fork-knife';
//       case 'livingroom': return 'sofa';
//       case 'extra': return 'plus-circle';
//       default: return 'home';
//     }
//   };

//   const RoomCard = ({ room }) => {
//     const progress = getRoomProgress(room);
//     const isComplete = isRoomComplete(room);
//     const roomData = selectedImages[room.id] || {};
    
//     return (
//       <TouchableOpacity 
//         style={[
//           styles.roomCard,
//           selectedRoom?.id === room.id && styles.selectedRoomCard,
//           isComplete && styles.completedRoomCard
//         ]}
//         onPress={() => setSelectedRoom(room)}
//       >
//         <View style={styles.roomCardHeader}>
//           <View style={[
//             styles.roomIcon,
//             isComplete && styles.completedRoomIcon
//           ]}>
//             <MaterialCommunityIcons 
//               name={getRoomIcon(room.type)} 
//               size={24} 
//               color={isComplete ? "#4CAF50" : COLORS.primary} 
//             />
//           </View>
//           <View style={styles.roomInfo}>
//             <Text style={styles.roomName}>{room.name}</Text>
//             <Text style={styles.roomStatus}>
//               {isComplete ? "✓ Complete" : "In Progress"}
//             </Text>
//           </View>
//           <View style={styles.roomStats}>
//             <Text style={styles.roomStat}>
//               📸 {roomData.photos?.length || 0}/{room.isExtra ? 'Optional' : '3'}
//             </Text>
//             <Text style={styles.roomStat}>
//               ✅ {roomData.tasks?.filter(t => t.value).length || 0}/{roomData.tasks?.length || 0}
//             </Text>
//           </View>
//         </View>
        
//         <View style={styles.progressContainer}>
//           <View style={styles.progressBar}>
//             <View 
//               style={[
//                 styles.progressFill, 
//                 { 
//                   width: `${progress}%`, 
//                   backgroundColor: isComplete ? '#4CAF50' : COLORS.primary 
//                 }
//               ]} 
//             />
//           </View>
//           <Text style={styles.progressText}>{Math.round(progress)}% complete</Text>
//         </View>
        
//         <TouchableOpacity 
//           style={[
//             styles.roomActionButton,
//             isComplete ? styles.reviewButton : styles.startButton
//           ]}
//           onPress={() => setSelectedRoom(room)}
//         >
//           <Text style={styles.roomActionButtonText}>
//             {isComplete ? "Review" : "Continue"}
//           </Text>
//           <Ionicons 
//             name={isComplete ? "eye" : "arrow-forward"} 
//             size={16} 
//             color="white" 
//           />
//         </TouchableOpacity>
//       </TouchableOpacity>
//     );
//   };

//   const RoomWorkspace = ({ room, onBack }) => {
//     const roomData = selectedImages[room.id] || {};
//     const isExtraRoom = room.id === 'Extra';
    
//     return (
//       <View style={styles.workspace}>
//         <View style={styles.workspaceHeader}>
//           <TouchableOpacity onPress={onBack} style={styles.backButton}>
//             <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
//           </TouchableOpacity>
//           <View style={styles.roomTitleSection}>
//             <Text style={styles.workspaceRoomTitle}>{room.name}</Text>
//             <Text style={styles.workspaceRoomSubtitle}>
//               {isRoomComplete(room) ? "Completed" : "In Progress"}
//             </Text>
//           </View>
//           <CircularProgress
//             value={getRoomProgress(room)}
//             radius={24}
//             duration={1000}
//             progressValueColor={isRoomComplete(room) ? "#4CAF50" : COLORS.primary}
//             activeStrokeColor={isRoomComplete(room) ? "#4CAF50" : COLORS.primary}
//             activeStrokeWidth={4}
//             inActiveStrokeWidth={4}
//             inActiveStrokeColor="#e0e0e0"
//             maxValue={100}
//           />
//         </View>
        
//         <ScrollView style={styles.workspaceContent} showsVerticalScrollIndicator={false}>
//           {/* Photos Section (for all rooms, but optional for extra rooms) */}
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Ionicons name="camera" size={22} color={COLORS.primary} />
//               <Text style={styles.sectionTitle}>
//                 {isExtraRoom ? "Additional Photos (Optional)" : "After Photos"}
//               </Text>
//               {!isExtraRoom && (
//                 <View style={styles.badge}>
//                   <Text style={styles.badgeText}>
//                     {roomData.photos?.length || 0}/3
//                   </Text>
//                 </View>
//               )}
//             </View>
            
//             <Text style={styles.sectionDescription}>
//               {isExtraRoom 
//                 ? "Take photos of any additional cleaning tasks if needed"
//                 : "Take photos of the same areas as your before photos"}
//             </Text>
            
//             {/* Photo Gallery */}
//             <View style={styles.photoGallery}>
//               <FlatList
//                 data={roomData.photos || []}
//                 horizontal
//                 keyExtractor={(item, index) => `${item.id}_${index}`}
//                 renderItem={({ item, index }) => (
//                   <ThumbnailItem
//                     photo={item}
//                     index={index}
//                     taskTitle={room.id}
//                     photosArray={roomData.photos || []}
//                     onDelete={handleDeletePhoto}
//                     openImageViewer={openImageViewer}
//                     invertPercentage={invertPercentage}
//                     getCleanlinessColor={getCleanlinessColor}
//                   />
//                 )}
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.previewContainer}
//                 ListEmptyComponent={
//                   <View style={styles.emptyPhotos}>
//                     <Ionicons name="camera-outline" size={40} color="#ddd" />
//                     <Text style={styles.emptyPhotosText}>No photos yet</Text>
//                     <Text style={styles.emptyPhotosSubtext}>
//                       {isExtraRoom 
//                         ? "Photos are optional for extra tasks"
//                         : "Tap the button below to add photos"}
//                     </Text>
//                   </View>
//                 }
//               />
//             </View>
            
//             {/* Add Photo Button */}
//             <TouchableOpacity 
//               style={styles.addPhotosButton}
//               onPress={() => openCamera(room.id)}
//             >
//               <View style={styles.addButtonContent}>
//                 <Ionicons name="add-circle" size={24} color="white" />
//                 <View style={styles.addButtonTextContainer}>
//                   <Text style={styles.addButtonMainText}>
//                     {isExtraRoom 
//                       ? "Add Optional Photos"
//                       : roomData.photos?.length >= 3 ? "Add More Photos" : "Take Photos"}
//                   </Text>
//                   <Text style={styles.addButtonSubText}>
//                     {isExtraRoom 
//                       ? "Document any additional cleaning work"
//                       : roomData.photos?.length >= 3 
//                         ? "You can add more photos if needed" 
//                         : `At least 3 photos recommended (${3 - (roomData.photos?.length || 0)} more needed)`}
//                   </Text>
//                 </View>
//               </View>
//             </TouchableOpacity>
//           </View>
          
//           {/* Tasks Section */}
//           <View style={[styles.section, isExtraRoom && styles.extraSection]}>
//             <View style={styles.sectionHeader}>
//               <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
//               <Text style={styles.sectionTitle}>
//                 {isExtraRoom ? "Additional Tasks" : "Cleaning Tasks"}
//               </Text>
//               <View style={styles.badge}>
//                 <Text style={styles.badgeText}>
//                   {roomData.tasks?.filter(t => t.value).length || 0}/{roomData.tasks?.length || 0}
//                 </Text>
//               </View>
//             </View>
            
//             <View style={styles.taskProgress}>
//               <View style={styles.taskProgressBar}>
//                 <View style={[
//                   styles.taskProgressFill, 
//                   { 
//                     width: `${roomData.tasks?.length > 0 
//                       ? (roomData.tasks.filter(t => t.value).length / roomData.tasks.length) * 100 
//                       : 0}%` 
//                   }
//                 ]} />
//               </View>
//               <Text style={styles.taskProgressText}>
//                 {roomData.tasks?.filter(t => t.value).length || 0} of {roomData.tasks?.length || 0} tasks completed
//               </Text>
//             </View>
            
//             {/* Task List */}
//             <View style={styles.taskList}>
//               {roomData.tasks?.map((item, index) => (
//                 <TouchableOpacity
//                   key={`${item.id}_${index}`}
//                   style={[
//                     styles.taskItem,
//                     item.value && styles.taskItemCompleted
//                   ]}
//                   onPress={() => handleTaskToggle(room.id, item.id)}
//                 >
//                   <View style={styles.taskItemLeft}>
//                     <Checkbox.Android
//                       status={item.value ? 'checked' : 'unchecked'}
//                       onPress={() => {}}
//                       color={COLORS.primary}
//                       uncheckedColor="#000"
//                     />
//                     <View style={styles.taskTextContainer}>
//                       <Text style={[
//                         styles.taskLabel,
//                         item.value && styles.taskLabelCompleted
//                       ]}>
//                         {item.label}
//                       </Text>
//                       {(item.time || item.price) && (
//                         <View style={styles.taskMeta}>
//                           {item.time && (
//                             <View style={styles.taskMetaItem}>
//                               <Ionicons name="time-outline" size={12} color="#666" />
//                               <Text style={styles.taskMetaText}>
//                                 {item.time} min{item.time > 1 ? 's' : ''}
//                               </Text>
//                             </View>
//                           )}
//                           {item.price && (
//                             <View style={styles.taskMetaItem}>
//                               <Ionicons name="cash-outline" size={12} color="#4CAF50" />
//                               <Text style={styles.taskMetaText}>
//                                 ${item.price}
//                               </Text>
//                             </View>
//                           )}
//                         </View>
//                       )}
//                     </View>
//                   </View>
                  
//                   {item.value ? (
//                     <View style={styles.completedIndicator}>
//                       <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
//                     </View>
//                   ) : (
//                     <Ionicons name="ellipse-outline" size={20} color="#ddd" />
//                   )}
//                 </TouchableOpacity>
//               ))}
              
//               {(!roomData.tasks || roomData.tasks.length === 0) && (
//                 <View style={styles.noTasksContainer}>
//                   <Ionicons name="list-outline" size={40} color="#ddd" />
//                   <Text style={styles.noTasksText}>No tasks assigned</Text>
//                 </View>
//               )}
//             </View>
//           </View>
          
//           {/* Completion Requirements */}
//           <View style={styles.requirementsSection}>
//             <Text style={styles.requirementsTitle}>To complete this {isExtraRoom ? "section" : "room"}:</Text>
            
//             {!isExtraRoom && (
//               <View style={styles.requirementItem}>
//                 <Ionicons 
//                   name={roomData.photos?.length >= 3 ? "checkmark-circle" : "ellipse-outline"} 
//                   size={20} 
//                   color={roomData.photos?.length >= 3 ? "#4CAF50" : "#666"} 
//                 />
//                 <Text style={[
//                   styles.requirementText,
//                   roomData.photos?.length >= 3 && styles.requirementTextCompleted
//                 ]}>
//                   Minimum 3 photos ({roomData.photos?.length || 0}/3)
//                 </Text>
//               </View>
//             )}
            
//             <View style={styles.requirementItem}>
//               <Ionicons 
//                 name={roomData.tasks?.every(t => t.value) ? "checkmark-circle" : "ellipse-outline"} 
//                 size={20} 
//                 color={roomData.tasks?.every(t => t.value) ? "#4CAF50" : "#666"} 
//               />
//               <Text style={[
//                 styles.requirementText,
//                 roomData.tasks?.every(t => t.value) && styles.requirementTextCompleted
//               ]}>
//                 All tasks completed ({roomData.tasks?.filter(t => t.value).length || 0}/{roomData.tasks?.length || 0})
//               </Text>
//             </View>
//           </View>
//         </ScrollView>
        
//         {/* Completion Button */}
//         <View style={styles.completionSection}>
//           {isRoomComplete(room) ? (
//             room.completed ? (
//               <View style={styles.alreadyCompleted}>
//                 <Ionicons name="checkmark-done-circle" size={24} color="#4CAF50" />
//                 <Text style={styles.alreadyCompletedText}>
//                   {room.name} is already completed
//                 </Text>
//               </View>
//             ) : (
//               <TouchableOpacity 
//                 style={styles.markCompleteButton}
//                 onPress={() => markRoomComplete(room.id)}
//               >
//                 <Ionicons name="checkmark-done" size={24} color="white" />
//                 <View style={styles.markCompleteButtonTexts}>
//                   <Text style={styles.markCompleteButtonMain}>
//                     Mark {room.name} Complete
//                   </Text>
//                   <Text style={styles.markCompleteButtonSub}>
//                     All requirements are met ✓
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             )
//           ) : (
//             <View style={styles.incompleteRequirements}>
//               <Ionicons name="alert-circle" size={24} color="#FF9800" />
//               <View style={styles.incompleteRequirementsTexts}>
//                 <Text style={styles.incompleteRequirementsMain}>
//                   Complete requirements to finish
//                 </Text>
//                 <Text style={styles.incompleteRequirementsSub}>
//                   {!isExtraRoom && roomData.photos?.length < 3 && `${3 - (roomData.photos?.length || 0)} more photos, `}
//                   {roomData.tasks?.filter(t => !t.value).length} more tasks
//                 </Text>
//               </View>
//             </View>
//           )}
//         </View>
//       </View>
//     );
//   };


//   const CameraView = () => (
//     <View style={styles.cameraContainer}>
//       {/* Camera Preview Section */}
//       <View style={styles.cameraPreviewContainer}>
//         <Camera style={styles.camera} ref={cameraRef}>
//           <TouchableOpacity 
//             style={styles.closeButton} 
//             onPress={() => {
//               setCameraVisible(false);
//               setPhotos([]);
//               setCameraMode('idle');
//             }}
//           >
//             <Ionicons name="chevron-down" size={28} color="white" />
//           </TouchableOpacity>
          
//           <View style={styles.cameraControls}>
//             {cameraMode === 'capturing' ? (
//               <ActivityIndicator size="large" color="white" />
//             ) : (
//               <TouchableOpacity 
//                 style={styles.captureButton} 
//                 onPress={takePicture}
//                 disabled={photos.length >= MAX_IMAGES_UPLOAD}
//               >
//                 <View style={styles.captureButtonInner}>
//                   <Ionicons name="camera" size={32} color="white" />
//                 </View>
//               </TouchableOpacity>
//             )}
//           </View>
  
//           <View style={styles.photoCounter}>
//             <Ionicons name="images-outline" size={16} color="white" />
//             <Text style={styles.photoCounterText}>
//               {photos.length}/{MAX_IMAGES_UPLOAD}
//             </Text>
//           </View>
//         </Camera>
//       </View>
  
//       {/* Thumbnail List Section */}
//       <View style={styles.cameraThumbnailSection}>
//         <View style={styles.thumbnailSectionContent}>
//           {photos.length > 0 ? (
//             <>
//               {/* <View style={styles.thumbnailSectionHeader}>
//                 <Text style={styles.thumbnailSectionTitle}>Captured Photos</Text>
//                 <View style={styles.photoCountBadge}>
//                   <Text style={styles.photoCountText}>
//                     {photos.length} photo{photos.length !== 1 ? 's' : ''}
//                   </Text>
//                 </View>
//               </View> */}
              
//               <FlatList
//                 data={photos}
//                 horizontal
//                 keyExtractor={(item, index) => index.toString()}
//                 renderItem={({ item, index }) => (
//                   <View style={styles.thumbnailContainer}>
//                     <Image source={{ uri: item.file }} style={styles.preview} />
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
              
//               {/* Only show upload button when photos are captured */}
//               <TouchableOpacity 
//                 onPress={onSubmit} 
//                 style={styles.uploadButton}
//                 disabled={isUploading}
//               >
//                 {isUploading ? (
//                   <ActivityIndicator size="small" color="white" />
//                 ) : (
//                   <>
//                     <Ionicons name="cloud-upload-outline" size={22} color="white" />
//                     <View style={styles.uploadButtonTexts}>
//                       <Text style={styles.uploadButtonMain}>
//                         Upload {photos.length} Photo{photos.length !== 1 ? 's' : ''}
//                       </Text>
//                       <Text style={styles.uploadButtonSub}>
//                         Tap the camera above to add more photos
//                       </Text>
//                     </View>
//                   </>
//                 )}
//               </TouchableOpacity>
//             </>
//           ) : (
//             /* Minimal No Photos Placeholder */
//             <View style={styles.minimalPlaceholder}>
//               <Ionicons name="camera-outline" size={48} color={COLORS.lightGray} />
//               <Text style={styles.minimalPlaceholderText}>
//                 No photos captured yet
//               </Text>
//             </View>
//           )}
//         </View>
//       </View>
//     </View>
//   );
  

//   if (cameraVisible) {
//     return <CameraView />;
//   }

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <CustomActivityIndicator size={40} />
//       </View>
//     );
//   }

//   if (selectedRoom) {
//     return (
//       <RoomWorkspace 
//         room={selectedRoom}
//         onBack={() => setSelectedRoom(null)}
//       />
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headline}>After Photos & Tasks</Text>
//         <Text style={styles.subtitle}>
//           Complete rooms in any order. Each room needs 3+ photos (except Extra Tasks) and all tasks checked.
//         </Text>
//       </View>
      
//       {/* <CardNoPrimary style={styles.progressCard}>
//         <View style={styles.progressHeader}>
//           <Text style={styles.progressTitle}>Overall Progress</Text>
//           <CircularProgress
//             value={(rooms.filter(r => isRoomComplete(r)).length / Math.max(rooms.length, 1)) * 100}
//             radius={28}
//             duration={1000}
//             progressValueColor={COLORS.primary}
//             activeStrokeColor={COLORS.primary}
//             inActiveStrokeColor="#e0e0e0"
//             activeStrokeWidth={5}
//             inActiveStrokeWidth={5}
//             maxValue={100}
//             valueSuffix="%"
//           />
//         </View>
        
//         <View style={styles.progressStats}>
//           <View style={styles.stat}>
//             <Text style={styles.statNumber}>
//               {rooms.filter(r => isRoomComplete(r)).length}/{rooms.length}
//             </Text>
//             <Text style={styles.statLabel}>Rooms Complete</Text>
//           </View>
//           <View style={styles.statDivider} />
//           <View style={styles.stat}>
//             <Text style={styles.statNumber}>
//               {rooms.reduce((sum, room) => {
//                 const roomData = selectedImages[room.id] || {};
//                 return sum + (roomData.tasks?.filter(t => t.value).length || 0);
//               }, 0)}/
//               {rooms.reduce((sum, room) => {
//                 const roomData = selectedImages[room.id] || {};
//                 return sum + (roomData.tasks?.length || 0);
//               }, 0)}
//             </Text>
//             <Text style={styles.statLabel}>Tasks Done</Text>
//           </View>
//         </View>
//       </CardNoPrimary> */}

// <CardNoPrimary style={styles.minimalProgressCard}>
//   <View style={styles.minimalProgressRow}>
//     <View style={styles.minimalProgressLeft}>
//       <Text style={styles.minimalProgressTitle}>Progress</Text>
//       <View style={styles.minimalProgressBar}>
//         <View 
//           style={[
//             styles.minimalProgressFill, 
//             { 
//               width: `${(rooms.filter(r => isRoomComplete(r)).length / Math.max(rooms.length, 1)) * 100}%`,
//               backgroundColor: COLORS.primary
//             }
//           ]} 
//         />
//       </View>
//     </View>
    
//     <View style={styles.minimalProgressRight}>
//       <Text style={styles.minimalProgressPercentage}>
//         {Math.round((rooms.filter(r => isRoomComplete(r)).length / Math.max(rooms.length, 1)) * 100)}%
//       </Text>
//       <Text style={styles.minimalProgressText}>
//         {rooms.filter(r => isRoomComplete(r)).length}/{rooms.length} rooms
//       </Text>
//     </View>
//   </View>
// </CardNoPrimary>
      
//       <Text style={styles.sectionTitle}>All Rooms</Text>
//       <ScrollView style={styles.roomsContainer}>
//         {rooms.length > 0 ? (
//           rooms.map(room => (
//             <RoomCard key={room.id} room={room} />
//           ))
//         ) : (
//           <View style={styles.noRoomsContainer}>
//             <Ionicons name="home-outline" size={48} color={COLORS.gray} />
//             <Text style={styles.noRoomsText}>No rooms assigned</Text>
//           </View>
//         )}
//       </ScrollView>
      
//       <TouchableOpacity 
//         style={[
//           styles.finishButton,
//           !allRoomsComplete && styles.disabledFinishButton
//         ]}
//         onPress={submitCompletion}
//         disabled={!allRoomsComplete}
//       >
//         <Ionicons name="checkmark-done-circle" size={24} color="white" />
//         <View style={styles.finishButtonTexts}>
//           <Text style={styles.finishButtonMain}>
//             {allRoomsComplete ? "Finish Cleaning" : "Complete All Rooms First"}
//           </Text>
//           <Text style={styles.finishButtonSub}>
//             {allRoomsComplete 
//               ? "All rooms are complete!" 
//               : `${rooms.filter(r => !isRoomComplete(r)).length} room(s) remaining`}
//           </Text>
//         </View>
//         <Ionicons name="chevron-forward" size={20} color="white" />
//       </TouchableOpacity>

//       <Modal isVisible={isBeforeModalVisible} style={styles.fullScreenModal}>
//         <View style={styles.modalContainer}>
//           <ImageViewer
//             imageUrls={currentImages}
//             index={currentImageIndex}
//             backgroundColor="black"
//             enableSwipeDown
//             enableImageZoom
//             onSwipeDown={() => setBeforeModalVisible(false)}
//             renderImage={(props) => (
//               <Image source={props.source} style={styles.fullSizeImage} contentFit="contain" />
//             )}
//           />
          
//           {currentImages[currentImageIndex]?.cleanliness && (
//             <Animated.View style={[styles.analysisPanel, { transform: [{ translateY: pan.y }] }]} {...panResponder.panHandlers}>
//               <View style={styles.dragHandle} />
//               <View style={styles.analysisContent}>
//                 <Text style={styles.analysisTitle}>CLEANLINESS ANALYSIS</Text>
                
//                 <View style={styles.scoreSection}>
//                   <Text style={styles.sectionTitle}>THIS PHOTO</Text>
//                   <View style={styles.scoreRow}>
//                     <View style={styles.scoreText}>
//                       <Text style={styles.scorePercentage}>
//                         {invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0).toFixed(0)}%
//                       </Text>
//                       <Text style={styles.scoreLabel}>
//                         {getCleanlinessLabel(invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0))}
//                       </Text>
//                     </View>
//                     <CircularProgress
//                       value={invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0)}
//                       radius={35}
//                       activeStrokeColor={getCleanlinessColor(invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0))}
//                       inActiveStrokeColor="#2d2d2d"
//                       maxValue={100}
//                     />
//                   </View>
//                 </View>

//                 <Text style={styles.sectionTitle}>MAIN ISSUES</Text>
//                 <View style={styles.issuesList}>
//                   {Object.entries(currentImages[currentImageIndex].cleanliness.scores || {})
//                     .sort(([,a], [,b]) => b - a)
//                     .slice(0, 3)
//                     .map(([factor, score]) => (
//                       <View key={factor} style={styles.issueItem}>
//                         <Text style={styles.issueName}>{factor.replace(/_/g, ' ').toUpperCase()}</Text>
//                         <Text style={[styles.issueScore, { color: getCleanlinessColor(100 - (score * 10)) }]}>
//                           {(100 - (score * 10)).toFixed(0)}%
//                         </Text>
//                       </View>
//                     ))}
//                 </View>
//               </View>
//             </Animated.View>
//           )}

//           <TouchableOpacity style={styles.modalCloseButton} onPress={() => setBeforeModalVisible(false)}>
//             <Ionicons name="close" size={24} color="white" />
//           </TouchableOpacity>
//         </View>
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
//   headline: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#1a1a1a',
//     marginBottom: 4,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#666',
//     lineHeight: 20,
//   },
//   progressCard: {
//     margin: 16,
//     padding: 20,
//   },
//   progressHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   progressTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1a1a1a',
//   },
//   progressStats: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//   },
//   stat: {
//     alignItems: 'center',
//   },
//   statNumber: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },
//   statLabel: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 4,
//   },
//   statDivider: {
//     width: 1,
//     backgroundColor: '#e0e0e0',
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginHorizontal: 16,
//     marginBottom: 12,
//   },
//   roomsContainer: {
//     flex: 1,
//     paddingHorizontal: 16,
//   },
//   roomCard: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 2,
//     borderColor: 'transparent',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   selectedRoomCard: {
//     borderColor: COLORS.primary,
//     backgroundColor: '#f8fbff',
//   },
//   completedRoomCard: {
//     borderColor: '#d4edda',
//     backgroundColor: '#f0f9f0',
//   },
//   roomCardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   roomIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#e3f2fd',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   completedRoomIcon: {
//     backgroundColor: '#e8f5e8',
//   },
//   roomInfo: {
//     flex: 1,
//   },
//   roomName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1a1a1a',
//   },
//   roomStatus: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 2,
//   },
//   roomStats: {
//     alignItems: 'flex-end',
//   },
//   roomStat: {
//     fontSize: 12,
//     color: '#666',
//   },
//   progressContainer: {
//     marginBottom: 16,
//   },
//   progressBar: {
//     height: 6,
//     backgroundColor: '#e0e0e0',
//     borderRadius: 3,
//     marginBottom: 8,
//   },
//   progressFill: {
//     height: '100%',
//     borderRadius: 3,
//   },
//   progressText: {
//     fontSize: 12,
//     color: '#666',
//     textAlign: 'right',
//   },
//   roomActionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   startButton: {
//     backgroundColor: COLORS.primary,
//   },
//   reviewButton: {
//     backgroundColor: '#4CAF50',
//   },
//   roomActionButtonText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//     marginRight: 8,
//   },
//   finishButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary,
//     margin: 16,
//     padding: 18,
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   disabledFinishButton: {
//     backgroundColor: '#ccc',
//   },
//   finishButtonTexts: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   finishButtonMain: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   finishButtonSub: {
//     color: 'rgba(255,255,255,0.8)',
//     fontSize: 12,
//     marginTop: 2,
//   },
//   workspace: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   workspaceHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   backButton: {
//     marginRight: 12,
//   },
//   roomTitleSection: {
//     flex: 1,
//   },
//   workspaceRoomTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1a1a1a',
//   },
//   workspaceRoomSubtitle: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 2,
//   },
//   workspaceContent: {
//     flex: 1,
//     padding: 16,
//   },
//   section: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   extraSection: {
//     marginTop: 16,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   badge: {
//     marginLeft: 'auto',
//     backgroundColor: '#e3f2fd',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   badgeText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },
//   photoGallery: {
//     marginBottom: 16,
//   },
//   addPhotosButton: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 8,
//     padding: 16,
//   },
//   addButtonContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   addButtonTextContainer: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   addButtonMainText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 2,
//   },
//   addButtonSubText: {
//     color: 'rgba(255,255,255,0.8)',
//     fontSize: 12,
//   },
//   taskProgress: {
//     marginBottom: 16,
//   },
//   taskProgressBar: {
//     height: 6,
//     backgroundColor: '#e0e0e0',
//     borderRadius: 3,
//     marginBottom: 8,
//   },
//   taskProgressFill: {
//     height: '100%',
//     backgroundColor: COLORS.primary,
//     borderRadius: 3,
//   },
//   taskProgressText: {
//     fontSize: 12,
//     color: '#666',
//     textAlign: 'center',
//   },
//   taskList: {
//     marginBottom: 8,
//   },
//   taskItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   taskItemCompleted: {
//     backgroundColor: '#f9f9f9',
//   },
//   taskItemLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   taskTextContainer: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   taskLabel: {
//     fontSize: 15,
//     fontWeight: '500',
//     color: '#1a1a1a',
//   },
//   taskLabelCompleted: {
//     color: '#666',
//     textDecorationLine: 'line-through',
//   },
//   taskMeta: {
//     flexDirection: 'row',
//     marginTop: 4,
//     gap: 12,
//   },
//   taskMetaItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   taskMetaText: {
//     fontSize: 12,
//     color: '#666',
//     marginLeft: 4,
//   },
//   completedIndicator: {
//     marginLeft: 8,
//   },
//   noTasksContainer: {
//     alignItems: 'center',
//     padding: 20,
//   },
//   noTasksText: {
//     fontSize: 14,
//     color: '#999',
//     marginTop: 8,
//   },
//   requirementsSection: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#f0f0f0',
//   },
//   requirementsTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginBottom: 12,
//   },
//   requirementItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   requirementText: {
//     fontSize: 14,
//     color: '#666',
//     marginLeft: 8,
//   },
//   requirementTextCompleted: {
//     color: '#4CAF50',
//   },
//   completionSection: {
//     padding: 16,
//     backgroundColor: 'white',
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//   },
//   markCompleteButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#4CAF50',
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//   },
//   markCompleteButtonTexts: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   markCompleteButtonMain: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   markCompleteButtonSub: {
//     color: 'rgba(255,255,255,0.8)',
//     fontSize: 12,
//     marginTop: 2,
//   },
//   alreadyCompleted: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 16,
//   },
//   alreadyCompletedText: {
//     fontSize: 16,
//     color: '#4CAF50',
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   incompleteRequirements: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 16,
//   },
//   incompleteRequirementsTexts: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   incompleteRequirementsMain: {
//     fontSize: 16,
//     color: '#FF9800',
//     fontWeight: '600',
//   },
//   incompleteRequirementsSub: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 2,
//   },
//   cameraContainer: {
//     flex: 1,
//   },
//   camera: {
//     flex: 1,
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 50,
//     right: 20,
//     zIndex: 10,
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
//     top: 100,
//     alignSelf: 'center',
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
//   previewSection: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: 'rgba(0,0,0,0.9)',
//     padding: 16,
//   },
//   previewTitle: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 12,
//   },
//   cameraActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 12,
//   },
//   continueButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 20,
//     flex: 1,
//     marginRight: 8,
//     justifyContent: 'center',
//   },
//   continueButtonText: {
//     color: COLORS.primary,
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   saveButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 20,
//     flex: 2,
//     marginLeft: 8,
//   },
//   saveButtonText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   thumbnailContainer: {
//     marginRight: 12,
//     marginBottom: 0,
//     position: 'relative',
//   },
//   preview: {
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
//   warningBadge: {
//     position: 'absolute',
//     top: 8,
//     left: 8,
//     backgroundColor: '#e74c3c',
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
//   emptyPhotos: {
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
//   emptyPhotosText: {
//     fontSize: 12,
//     color: '#999',
//     marginTop: 4,
//   },
//   emptyPhotosSubtext: {
//     fontSize: 12,
//     color: '#999',
//     marginTop: 4,
//     textAlign: 'center',
//   },
//   fullScreenModal: {
//     margin: 0,
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'black',
//   },
//   fullSizeImage: {
//     width: '100%',
//     height: '100%',
//   },
//   modalCloseButton: {
//     position: 'absolute',
//     top: 50,
//     right: 20,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     borderRadius: 20,
//     padding: 8,
//   },
//   analysisPanel: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: 'rgba(0,0,0,0.9)',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 20,
//     paddingBottom: 40,
//   },
//   dragHandle: {
//     width: 40,
//     height: 4,
//     backgroundColor: 'rgba(255,255,255,0.4)',
//     borderRadius: 2,
//     alignSelf: 'center',
//     marginBottom: 16,
//   },
//   analysisContent: {
//     maxHeight: 400,
//   },
//   analysisTitle: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: '700',
//     textAlign: 'center',
//     marginBottom: 20,
//     letterSpacing: 0.5,
//   },
//   scoreSection: {
//     marginBottom: 20,
//   },
//   scoreRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   scoreText: {
//     flex: 1,
//   },
//   scorePercentage: {
//     color: 'white',
//     fontSize: 32,
//     fontWeight: '700',
//     marginBottom: 4,
//   },
//   scoreLabel: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     opacity: 0.9,
//   },
//   issuesList: {
//     backgroundColor: 'rgba(255,255,255,0.05)',
//     borderRadius: 12,
//     padding: 8,
//   },
//   issueItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(255,255,255,0.1)',
//   },
//   issueName: {
//     color: 'white',
//     fontSize: 14,
//     flex: 2,
//     opacity: 0.9,
//   },
//   issueScore: {
//     fontSize: 14,
//     fontWeight: '600',
//     flex: 1,
//     textAlign: 'right',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   noRoomsContainer: {
//     alignItems: 'center',
//     padding: 40,
//     marginTop: 20,
//   },
//   noRoomsText: {
//     fontSize: 16,
//     color: COLORS.gray,
//     marginTop: 12,
//   },
//   previewContainer: {
//     paddingVertical: 8,
//   },




//   cameraContainer: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//   },
//   cameraPreviewContainer: {
//     height: 400, // Fixed height for camera preview
//     backgroundColor: '#000',
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//     elevation: 8,
//     position: 'relative',
//   },
//   camera: {
//     flex: 1,
//   },
//   cameraThumbnailSection: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//   },
//   thumbnailSectionContent: {
//     paddingHorizontal: 16,
//     paddingTop: 0,
//   },
//   thumbnailSectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   thumbnailSectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1a1a1a',
//   },
//   photoCountBadge: {
//     backgroundColor: '#e3f2fd',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   photoCountText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },




//   cameraThumbnailSection: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//   },
//   thumbnailSectionContent: {
//     paddingHorizontal: 16,
//     paddingTop: 0,
//     flex: 1,
//   },
//   thumbnailSectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   thumbnailSectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1a1a1a',
//   },
//   photoCountBadge: {
//     backgroundColor: '#e3f2fd',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   photoCountText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },
  
//   /* Minimal Placeholder Styles */
//   minimalPlaceholder: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     minHeight: 200, // Ensure it's visible without scrolling
//   },
//   minimalPlaceholderText: {
//     fontSize: 16,
//     color: COLORS.gray,
//     marginTop: 12,
//     fontWeight: '500',
//     textAlign: 'center',
//   },
  
//   /* Upload Button Styles */
//   uploadButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary,
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     borderRadius: 12,
//     marginTop: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   uploadButtonTexts: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   uploadButtonMain: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   uploadButtonSub: {
//     color: 'rgba(255,255,255,0.8)',
//     fontSize: 12,
//     marginTop: 2,
//   },










//   minimalProgressCard: {
//     marginBottom: 12,
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//   },
//   minimalProgressRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   minimalProgressLeft: {
//     flex: 1,
//     marginRight: 12,
//   },
//   minimalProgressTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 6,
//   },
//   minimalProgressBar: {
//     height: 4,
//     backgroundColor: '#e8e8e8',
//     borderRadius: 2,
//     overflow: 'hidden',
//   },
//   minimalProgressFill: {
//     height: '100%',
//     borderRadius: 2,
//   },
//   minimalProgressRight: {
//     alignItems: 'flex-end',
//   },
//   minimalProgressPercentage: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.primary,
//     marginBottom: 2,
//   },
//   minimalProgressText: {
//     fontSize: 12,
//     color: '#666',
//   },
// });

// export default AfterPhoto;



// import React, { useEffect, useContext, useCallback, useState, useRef } from 'react';
// import { 
//   View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, 
//   FlatList, ScrollView, Dimensions, Animated, PanResponder
// } from 'react-native';
// import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'; 
// import COLORS from '../../../constants/colors';
// import userService from '../../../services/connection/userService';
// import { AuthContext } from '../../../context/AuthContext';
// import { useFocusEffect } from '@react-navigation/native';
// import CardNoPrimary from '../../../components/shared/CardNoPrimary';
// import { Checkbox } from 'react-native-paper';
// import ImageViewer from 'react-native-image-zoom-viewer';
// import Modal from 'react-native-modal';
// import { sendPushNotifications } from '../../../utils/sendPushNotification';
// import ROUTES from '../../../constants/routes';
// import CircularProgress from 'react-native-circular-progress-indicator';
// import { Image } from 'expo-image'; 
// import CustomActivityIndicator from '../../../components/shared/CuustomActivityIndicator';
// import formatRoomTitle from '../../../utils/formatRoomTitle';
// import Constants from 'expo-constants';

// const { width } = Dimensions.get('window');

// // Base64 encoded 1x1 pixel transparent image for simulation
// const SIMULATED_BASE64_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// const ThumbnailItem = React.memo(({ 
//   photo, 
//   index, 
//   openImageViewer, 
//   taskTitle,
//   invertPercentage, 
//   getCleanlinessColor, 
//   photosArray,
//   onDelete
// }) => {
//   const photoScore = invertPercentage(photo.cleanliness?.individual_overall || 0);
//   const isProblemPhoto = photoScore < 35;
//   const fadeAnim = useRef(new Animated.Value(1)).current;

//   const handleDelete = () => {
//     Alert.alert(
//       "Delete Photo",
//       "Are you sure you want to permanently delete this photo?",
//       [
//         { text: "Cancel", style: "cancel" },
//         { 
//           text: "Delete", 
//           onPress: () => {
//             Animated.timing(fadeAnim, {
//               toValue: 0,
//               duration: 300,
//               useNativeDriver: true
//             }).start(() => onDelete(index, taskTitle));
//           }
//         }
//       ]
//     );
//   };

//   return (
//     <Animated.View style={{ opacity: fadeAnim }}>
//       <TouchableOpacity
//         onPress={() => openImageViewer(photosArray, index, taskTitle)}
//         style={styles.thumbnailContainer}
//       >
//         <Image
//           source={{ uri: photo.img_url }}
//           style={styles.preview}
//           cachePolicy="memory-disk"
//           transition={300}
//         />
//         <TouchableOpacity 
//           onPress={handleDelete}
//           style={styles.deleteButton}
//         >
//           <Ionicons name="trash-outline" size={16} color="white" />
//         </TouchableOpacity>
//         {isProblemPhoto && (
//           <View style={styles.warningBadge}>
//             <MaterialIcons name="warning" size={14} color="#fff" />
//           </View>
//         )}
//         <View style={styles.photoNumber}>
//           <Text style={styles.photoNumberText}>{index + 1}</Text>
//         </View>
//       </TouchableOpacity>
//     </Animated.View>
//   );
// });

// const AfterPhoto = ({ scheduleId, hostId }) => {
//   const { currentUserId, currentUser } = useContext(AuthContext);
//   const cameraRef = useRef(null);
//   const MAX_IMAGES_UPLOAD = 10;
  
//   // Check if running on simulator
//   const isSimulator = !Constants.isDevice;
  
//   const [tasks, setTasks] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedImages, setSelectedImages] = useState({});
//   const [isUploading, setIsUploading] = useState(false);
//   const [photos, setPhotos] = useState([]);
//   const [cleaning_fee, setFee] = useState(0);
//   const [cameraVisible, setCameraVisible] = useState(false);
//   const [isBeforeModalVisible, setBeforeModalVisible] = useState(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [currentImages, setCurrentImages] = useState([]);
//   const [hostTokens, setHostPushToken] = useState([]);
//   const [selectedTaskTitle, setSelectedTaskTitle] = useState('');
//   const [cameraMode, setCameraMode] = useState('idle');
//   const [selectedRoom, setSelectedRoom] = useState(null);
//   const [rooms, setRooms] = useState([]);
//   const [hasCameraPermission, setHasCameraPermission] = useState(null);
//   const [cameraAvailable, setCameraAvailable] = useState(false);

//   // Import camera conditionally
//   let Camera = null;
//   if (!isSimulator) {
//     try {
//       const cameraModule = require('expo-camera');
//       Camera = cameraModule.Camera;
//     } catch (error) {
//       console.log('Camera module not available:', error);
//     }
//   }

//   const pan = useRef(new Animated.ValueXY()).current;
//   const overlayOpacity = useRef(new Animated.Value(1)).current;

//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => true,
//       onPanResponderMove: Animated.event([null, { dy: pan.y }], { useNativeDriver: false }),
//       onPanResponderRelease: (e, gesture) => {
//         if (gesture.dy > 50) {
//           Animated.timing(pan, { toValue: { x: 0, y: 300 }, duration: 300, useNativeDriver: true }).start();
//           Animated.timing(overlayOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
//         } else {
//           Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
//           Animated.spring(overlayOpacity, { toValue: 1, useNativeDriver: true }).start();
//         }
//       }
//     })
//   ).current;

//   const invertPercentage = (score) => 100 - (score * 10);

//   const getCleanlinessLabel = (invertedScore) => {
//     if (invertedScore <= 35) return 'Needs Deep Cleaning';
//     if (invertedScore <= 40) return 'Requires Attention';
//     return 'Very Clean';
//   };
  
//   const getCleanlinessColor = (invertedScore) => {
//     if (invertedScore <= 35) return '#e74c3c';
//     if (invertedScore <= 40) return '#f1c40f';
//     return '#2ecc71';
//   };

//   const fetchImages = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const response = await userService.getUpdatedImageUrls(scheduleId);
//       const res = response.data.data;
//       const getCleanerById = (id) => res.assignedTo.find(cleaner => cleaner.cleanerId === id);
//       const cl = getCleanerById(currentUserId);
      
//       if (cl?.checklist?.details) {
//         const details = cl.checklist.details;
//         setSelectedImages(details);
        
//         // Convert details object to rooms array - INCLUDING EXTRA ROOM
//         const roomArray = Object.keys(details).map(key => {
//           const roomData = details[key];
//           const isExtraRoom = key === 'Extra';
          
//           return {
//             id: key,
//             name: isExtraRoom ? 'Extra Tasks' : formatRoomTitle(key),
//             type: isExtraRoom ? 'extra' : key.split('_')[0],
//             tasks: roomData.tasks || [],
//             photos: roomData.photos || [],
//             completed: isExtraRoom 
//               ? (roomData.tasks || []).every(task => task.value === true) 
//               : (roomData.tasks || []).every(task => task.value === true) && 
//                 (roomData.photos || []).length >= 3,
//             isExtra: isExtraRoom
//           };
//         }); // No filter - include all rooms
        
//         setRooms(roomArray);
//         setTasks(details);
//         setFee(cl.checklist.price || 0);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   }, [scheduleId, currentUserId]);

//   const fetchHostPushTokens = useCallback(async () => {
//     const response = await userService.getUserPushTokens(hostId);
//     setHostPushToken(response.data.tokens);
//   }, [hostId]);

//   useFocusEffect(
//     useCallback(() => {
//       let isActive = true;
//       const fetchData = async () => {
//         try {
//           await fetchImages();
//           await fetchHostPushTokens();
//         } catch (error) {
//           console.error("Error fetching data:", error);
//         }
//       };
//       if (isActive) fetchData();
//       return () => { isActive = false; };
//     }, [fetchImages, fetchHostPushTokens])
//   );

//   useEffect(() => {
//     if (isSimulator) {
//       setCameraAvailable(false);
//       return;
//     }

//     if (!Camera) {
//       setCameraAvailable(false);
//       return;
//     }

//     (async () => {
//       try {
//         const { status } = await Camera.requestCameraPermissionsAsync();
//         setHasCameraPermission(status === 'granted');
//         setCameraAvailable(status === 'granted');
//         if (status !== 'granted') {
//           Alert.alert('Camera permission not granted');
//         }
//       } catch (error) {
//         console.error('Error requesting camera permission:', error);
//         setHasCameraPermission(false);
//         setCameraAvailable(false);
//       }
//     })();
//   }, [isSimulator]);

//   useEffect(() => {
//     if (currentImages[currentImageIndex]?.cleanliness) {
//       pan.setValue({ x: 0, y: 0 });
//       overlayOpacity.setValue(1);
//     }
//   }, [currentImageIndex]);

//   const openImageViewer = useCallback((images, index, category) => {
//     pan.setValue({ x: 0, y: 0 });
//     overlayOpacity.setValue(1);

//     const formattedImages = images.map(photo => {
//       const score = invertPercentage(photo.cleanliness?.individual_overall || 0);
//       const status = getCleanlinessLabel(score);
      
//       return {
//         url: status === "Very Clean" ? photo.img_url : photo.cleanliness?.heatmap_url || photo.img_url,
//         cleanliness: photo.cleanliness,
//         props: { source: { uri: status === "Very Clean" ? photo.img_url : photo.cleanliness?.heatmap_url } },
//         category: category
//       };
//     });
  
//     setCurrentImages(formattedImages);
//     setCurrentImageIndex(index);
//     setBeforeModalVisible(true);
//   }, []);

//   const takePicture = async () => {
//     if (isSimulator) {
//       // Simulate taking a picture on simulator with base64 image
//       const simulatedPhoto = {
//         filename: `simulated-photo-${Date.now()}.jpg`,
//         file: SIMULATED_BASE64_IMAGE, // Use base64 image instead of URL
//         timestamp: new Date().toISOString()
//       };
      
//       setPhotos(prev => [...prev, simulatedPhoto]);
//       setCameraMode('review');
      
//       setTimeout(() => {
//         if (photos.length < MAX_IMAGES_UPLOAD - 1) {
//           setCameraMode('idle');
//         }
//       }, 1000);
//       return;
//     }

//     if (cameraRef.current && hasCameraPermission && Camera) {
//       setCameraMode('capturing');
//       try {
//         const options = { quality: 0.8, base64: true };
//         const newPhoto = await cameraRef.current.takePictureAsync(options);
        
//         setPhotos(prev => [...prev, {
//           filename: `photo_${Date.now()}_${prev.length}.jpg`,
//           file: `data:image/jpeg;base64,${newPhoto.base64}`,
//           timestamp: new Date().toISOString()
//         }]);
        
//         setCameraMode('review');
        
//         setTimeout(() => {
//           if (photos.length < MAX_IMAGES_UPLOAD - 1) {
//             setCameraMode('idle');
//           }
//         }, 1000);
//       } catch (error) {
//         console.error('Error taking picture:', error);
//         Alert.alert('Error', 'Failed to take picture');
//         setCameraMode('idle');
//       }
//     }
//   };

//   const openCamera = (taskTitle) => {
//     if (isSimulator) {
//       Alert.alert(
//         'Camera Simulation',
//         'This is a simulator. Camera functionality is limited. You can still test photo uploads with simulated images.',
//         [{ text: 'OK' }]
//       );
//     }
//     setSelectedTaskTitle(taskTitle);
//     setPhotos([]);
//     setCameraMode('idle');
//     setCameraVisible(true);
//   };

//   const validateTasks = () => {
//     if (!selectedImages || Object.keys(selectedImages).length === 0) {
//       Alert.alert("Validation Error", "No tasks or images found for validation.");
//       return false;
//     }

//     let invalidCategories = [];
//     let insufficientImagesCategories = [];

//     Object.keys(selectedImages).forEach((category) => {
//       const categoryData = selectedImages[category];
//       if (!categoryData || !categoryData.tasks || !Array.isArray(categoryData.tasks)) return;

//       const { tasks, photos } = categoryData;
//       const isExtraRoom = category === 'Extra';
//       const allTasksCompleted = tasks.every((task) => task.value === true);
      
//       if (!allTasksCompleted) invalidCategories.push(category);
      
//       // Only check photos for non-extra rooms
//       if (!isExtraRoom && (!photos || photos.length < 3)) {
//         insufficientImagesCategories.push(category);
//       }
//     });

//     if (invalidCategories.length > 0 || insufficientImagesCategories.length > 0) {
//       let errorMessage = "";
//       if (invalidCategories.length > 0) errorMessage += `Incomplete tasks in: ${invalidCategories.join(", ")}.\n`;
//       if (insufficientImagesCategories.length > 0) errorMessage += `Insufficient images in: ${insufficientImagesCategories.join(", ")}.`;
//       Alert.alert("Validation Error", errorMessage);
//       return false;
//     }

//     return true;
//   };

//   const onSubmit = async () => {
//     if (photos.length === 0) {
//       Alert.alert('No Photos', 'Please take at least one photo before uploading.');
//       return;
//     }

//     if (photos.length > MAX_IMAGES_UPLOAD) {
//       Alert.alert('Upload Limit Exceeded', `You can only upload up to ${MAX_IMAGES_UPLOAD} images at a time.`);
//       return;
//     }
  
//     setIsUploading(true);
    
//     // Prepare images for upload - ensure each has proper base64 format
//     const imagesToUpload = photos.map(photo => {
//       // If using simulated image, use it directly
//       if (photo.file === SIMULATED_BASE64_IMAGE) {
//         return photo;
//       }
      
//       // For real photos, ensure proper format
//       if (photo.file.startsWith('data:image/')) {
//         return photo;
//       }
      
//       // If it doesn't have data prefix, add it (just in case)
//       return {
//         ...photo,
//         file: `data:image/jpeg;base64,${photo.file}`
//       };
//     });

//     const data = {
//       photo_type: 'after_photos',
//       scheduleId: scheduleId,
//       images: imagesToUpload,
//       currentUserId: currentUserId,
//       task_title: selectedTaskTitle,
//       updated_tasks: selectedImages,
//     };

//     try {
//       const response = await userService.uploadTaskPhotos(data);
//       if (response.status === 200) {
//         Alert.alert('Upload Successful', `${photos.length} photos have been uploaded successfully!`);
//         fetchImages();
//         setPhotos([]);
//         setCameraMode('idle');
//         setCameraVisible(false);
//       }
//     } catch (err) {
//       console.error('Error uploading photos:', err);
//       Alert.alert('Upload Failed', 'An error occurred while uploading your photos.');
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const updateTasksInBackend = async (category, updatedTasks) => {
//     try {
//       const data = { scheduleId, cleanerId: currentUserId, category, tasks: updatedTasks };
//       await userService.updateChecklist(data);
//     } catch (err) {
//       console.error("Error updating tasks:", err);
//     }
//   };
  
//   const handleTaskToggle = (category, taskId) => {
//     setSelectedImages((prevSelectedImages) => {
//       const updatedImages = { ...prevSelectedImages };
//       if (!updatedImages[category]) return prevSelectedImages;

//       updatedImages[category].tasks = updatedImages[category].tasks.map((task) =>
//         task.id === taskId ? { ...task, value: !task.value } : task
//       );

//       updateTasksInBackend(category, updatedImages[category].tasks);
//       return updatedImages;
//     });
//   };

//   const removePhoto = (index) => {
//     setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
//   };

//   const handleDeletePhoto = async (indexToDelete, category) => {
//     try {
//       const photoToDelete = selectedImages[category]?.photos[indexToDelete];
//       if (!photoToDelete) {
//         Alert.alert("Error", "Photo not found");
//         return;
//       }

//       const originalFilename = photoToDelete.img_url.split('/').pop();
//       const heatmapFilename = photoToDelete.cleanliness?.heatmap_url?.split('/').pop();

//       setSelectedImages(prev => {
//         const updated = {...prev};
//         updated[category].photos = updated[category].photos.filter((_, i) => i !== indexToDelete);
//         return updated;
//       });

//       const data = { originalFilename, heatmapFilename, category, scheduleId };
//       await userService.deleteSpaceAfterPhoto(data);
//       updateTasksInBackend(selectedImages);

//     } catch (error) {
//       console.error('Delete failed:', error);
//       setSelectedImages(prev => ({...prev}));
//       Alert.alert('Deletion Failed', error.response?.data?.detail || 'Could not delete photo');
//     }
//   };

//   const submitCompletion = useCallback(async () => {
//     if (!validateTasks()) return;
//     setIsLoading(true);
//     try {
//       await userService.finishCleaning({
//         scheduleId,
//         cleanerId: currentUserId,
//         completed_tasks: selectedImages,
//         fee: parseFloat(cleaning_fee),
//         completionTime: new Date()
//       });
//       sendPushNotifications(hostTokens, 
//         `${currentUser.firstname} Completed Cleaning`,
//         `${currentUser.firstname} ${currentUser.lastname} has completed the cleaning.`,
//         { screen: ROUTES.host_task_progress, params: { scheduleId } }
//       );
//       Alert.alert("Success", "Cleaning completed successfully!");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [selectedImages, hostTokens, scheduleId, currentUser]);

//   const getRoomProgress = (room) => {
//     if (!selectedImages[room.id]) return 0;
//     const roomData = selectedImages[room.id];
//     const isExtraRoom = room.id === 'Extra';
    
//     const taskProgress = roomData.tasks?.length > 0 
//       ? (roomData.tasks.filter(t => t.value).length / roomData.tasks.length) * (isExtraRoom ? 100 : 50) 
//       : 0;
    
//     // For extra rooms, don't require photos - only tasks matter
//     const photoProgress = isExtraRoom ? 0 : Math.min((roomData.photos?.length || 0 / 3) * 50, 50);
    
//     return taskProgress + photoProgress;
//   };

//   const isRoomComplete = (room) => {
//     if (!selectedImages[room.id]) return false;
//     const roomData = selectedImages[room.id];
    
//     const isExtraRoom = room.id === 'Extra';
//     const tasksComplete = roomData.tasks?.every(task => task.value === true) || false;
//     // For extra rooms, we don't require photos
//     const photosComplete = isExtraRoom ? true : (roomData.photos?.length || 0) >= 3;
    
//     return tasksComplete && photosComplete;
//   };

//   const allRoomsComplete = rooms.every(room => isRoomComplete(room));

//   const markRoomComplete = (roomId) => {
//     Alert.alert(
//       "Mark Room Complete",
//       "Are you sure this room is fully cleaned and all photos are taken?",
//       [
//         { text: "Cancel", style: "cancel" },
//         { 
//           text: "Mark Complete", 
//           onPress: () => {
//             setRooms(prev => prev.map(room => 
//               room.id === roomId ? { ...room, completed: true } : room
//             ));
//             Alert.alert("Success", "Room marked as complete!");
//           }
//         }
//       ]
//     );
//   };

//   const getRoomIcon = (type) => {
//     switch(type.toLowerCase()) {
//       case 'bedroom': return 'bed';
//       case 'bathroom': return 'shower';
//       case 'kitchen': return 'silverware-fork-knife';
//       case 'livingroom': return 'sofa';
//       case 'extra': return 'plus-circle';
//       default: return 'home';
//     }
//   };

//   const RoomCard = ({ room }) => {
//     const progress = getRoomProgress(room);
//     const isComplete = isRoomComplete(room);
//     const roomData = selectedImages[room.id] || {};
    
//     return (
//       <TouchableOpacity 
//         style={[
//           styles.roomCard,
//           selectedRoom?.id === room.id && styles.selectedRoomCard,
//           isComplete && styles.completedRoomCard
//         ]}
//         onPress={() => setSelectedRoom(room)}
//       >
//         <View style={styles.roomCardHeader}>
//           <View style={[
//             styles.roomIcon,
//             isComplete && styles.completedRoomIcon
//           ]}>
//             <MaterialCommunityIcons 
//               name={getRoomIcon(room.type)} 
//               size={24} 
//               color={isComplete ? "#4CAF50" : COLORS.primary} 
//             />
//           </View>
//           <View style={styles.roomInfo}>
//             <Text style={styles.roomName}>{room.name}</Text>
//             <Text style={styles.roomStatus}>
//               {isComplete ? "✓ Complete" : "In Progress"}
//             </Text>
//           </View>
//           <View style={styles.roomStats}>
//             <Text style={styles.roomStat}>
//               📸 {roomData.photos?.length || 0}/{room.isExtra ? 'Optional' : '3'}
//             </Text>
//             <Text style={styles.roomStat}>
//               ✅ {roomData.tasks?.filter(t => t.value).length || 0}/{roomData.tasks?.length || 0}
//             </Text>
//           </View>
//         </View>
        
//         <View style={styles.progressContainer}>
//           <View style={styles.progressBar}>
//             <View 
//               style={[
//                 styles.progressFill, 
//                 { 
//                   width: `${progress}%`, 
//                   backgroundColor: isComplete ? '#4CAF50' : COLORS.primary 
//                 }
//               ]} 
//             />
//           </View>
//           <Text style={styles.progressText}>{Math.round(progress)}% complete</Text>
//         </View>
        
//         <TouchableOpacity 
//           style={[
//             styles.roomActionButton,
//             isComplete ? styles.reviewButton : styles.startButton
//           ]}
//           onPress={() => setSelectedRoom(room)}
//         >
//           <Text style={styles.roomActionButtonText}>
//             {isComplete ? "Review" : "Continue"}
//           </Text>
//           <Ionicons 
//             name={isComplete ? "eye" : "arrow-forward"} 
//             size={16} 
//             color="white" 
//           />
//         </TouchableOpacity>
//       </TouchableOpacity>
//     );
//   };

//   const RoomWorkspace = ({ room, onBack }) => {
//     const roomData = selectedImages[room.id] || {};
//     const isExtraRoom = room.id === 'Extra';
    
//     return (
//       <View style={styles.workspace}>
//         <View style={styles.workspaceHeader}>
//           <TouchableOpacity onPress={onBack} style={styles.backButton}>
//             <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
//           </TouchableOpacity>
//           <View style={styles.roomTitleSection}>
//             <Text style={styles.workspaceRoomTitle}>{room.name}</Text>
//             <Text style={styles.workspaceRoomSubtitle}>
//               {isRoomComplete(room) ? "Completed" : "In Progress"}
//             </Text>
//           </View>
//           <CircularProgress
//             value={getRoomProgress(room)}
//             radius={24}
//             duration={1000}
//             progressValueColor={isRoomComplete(room) ? "#4CAF50" : COLORS.primary}
//             activeStrokeColor={isRoomComplete(room) ? "#4CAF50" : COLORS.primary}
//             activeStrokeWidth={4}
//             inActiveStrokeWidth={4}
//             inActiveStrokeColor="#e0e0e0"
//             maxValue={100}
//           />
//         </View>
        
//         <ScrollView style={styles.workspaceContent} showsVerticalScrollIndicator={false}>
//           {/* Photos Section (for all rooms, but optional for extra rooms) */}
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Ionicons name="camera" size={22} color={COLORS.primary} />
//               <Text style={styles.sectionTitle}>
//                 {isExtraRoom ? "Additional Photos (Optional)" : "After Photos"}
//               </Text>
//               {!isExtraRoom && (
//                 <View style={styles.badge}>
//                   <Text style={styles.badgeText}>
//                     {roomData.photos?.length || 0}/3
//                   </Text>
//                 </View>
//               )}
//             </View>
            
//             <Text style={styles.sectionDescription}>
//               {isExtraRoom 
//                 ? "Take photos of any additional cleaning tasks if needed"
//                 : "Take photos of the same areas as your before photos"}
//             </Text>
            
//             {/* Photo Gallery */}
//             <View style={styles.photoGallery}>
//               <FlatList
//                 data={roomData.photos || []}
//                 horizontal
//                 keyExtractor={(item, index) => `${item.id}_${index}`}
//                 renderItem={({ item, index }) => (
//                   <ThumbnailItem
//                     photo={item}
//                     index={index}
//                     taskTitle={room.id}
//                     photosArray={roomData.photos || []}
//                     onDelete={handleDeletePhoto}
//                     openImageViewer={openImageViewer}
//                     invertPercentage={invertPercentage}
//                     getCleanlinessColor={getCleanlinessColor}
//                   />
//                 )}
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.previewContainer}
//                 ListEmptyComponent={
//                   <View style={styles.emptyPhotos}>
//                     <Ionicons name="camera-outline" size={40} color="#ddd" />
//                     <Text style={styles.emptyPhotosText}>No photos yet</Text>
//                     <Text style={styles.emptyPhotosSubtext}>
//                       {isExtraRoom 
//                         ? "Photos are optional for extra tasks"
//                         : "Tap the button below to add photos"}
//                     </Text>
//                   </View>
//                 }
//               />
//             </View>
            
//             {/* Add Photo Button */}
//             <TouchableOpacity 
//               style={styles.addPhotosButton}
//               onPress={() => openCamera(room.id)}
//             >
//               <View style={styles.addButtonContent}>
//                 <Ionicons name="add-circle" size={24} color="white" />
//                 <View style={styles.addButtonTextContainer}>
//                   <Text style={styles.addButtonMainText}>
//                     {isExtraRoom 
//                       ? "Add Optional Photos"
//                       : roomData.photos?.length >= 3 ? "Add More Photos" : "Take Photos"}
//                   </Text>
//                   <Text style={styles.addButtonSubText}>
//                     {isExtraRoom 
//                       ? "Document any additional cleaning work"
//                       : roomData.photos?.length >= 3 
//                         ? "You can add more photos if needed" 
//                         : `At least 3 photos recommended (${3 - (roomData.photos?.length || 0)} more needed)`}
//                   </Text>
//                 </View>
//               </View>
//             </TouchableOpacity>
//           </View>
          
//           {/* Tasks Section */}
//           <View style={[styles.section, isExtraRoom && styles.extraSection]}>
//             <View style={styles.sectionHeader}>
//               <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
//               <Text style={styles.sectionTitle}>
//                 {isExtraRoom ? "Additional Tasks" : "Cleaning Tasks"}
//               </Text>
//               <View style={styles.badge}>
//                 <Text style={styles.badgeText}>
//                   {roomData.tasks?.filter(t => t.value).length || 0}/{roomData.tasks?.length || 0}
//                 </Text>
//               </View>
//             </View>
            
//             <View style={styles.taskProgress}>
//               <View style={styles.taskProgressBar}>
//                 <View style={[
//                   styles.taskProgressFill, 
//                   { 
//                     width: `${roomData.tasks?.length > 0 
//                       ? (roomData.tasks.filter(t => t.value).length / roomData.tasks.length) * 100 
//                       : 0}%` 
//                   }
//                 ]} />
//               </View>
//               <Text style={styles.taskProgressText}>
//                 {roomData.tasks?.filter(t => t.value).length || 0} of {roomData.tasks?.length || 0} tasks completed
//               </Text>
//             </View>
            
//             {/* Task List */}
//             <View style={styles.taskList}>
//               {roomData.tasks?.map((item, index) => (
//                 <TouchableOpacity
//                   key={`${item.id}_${index}`}
//                   style={[
//                     styles.taskItem,
//                     item.value && styles.taskItemCompleted
//                   ]}
//                   onPress={() => handleTaskToggle(room.id, item.id)}
//                 >
//                   <View style={styles.taskItemLeft}>
//                     <Checkbox.Android
//                       status={item.value ? 'checked' : 'unchecked'}
//                       onPress={() => {}}
//                       color={COLORS.primary}
//                       uncheckedColor="#000"
//                     />
//                     <View style={styles.taskTextContainer}>
//                       <Text style={[
//                         styles.taskLabel,
//                         item.value && styles.taskLabelCompleted
//                       ]}>
//                         {item.label}
//                       </Text>
//                       {(item.time || item.price) && (
//                         <View style={styles.taskMeta}>
//                           {item.time && (
//                             <View style={styles.taskMetaItem}>
//                               <Ionicons name="time-outline" size={12} color="#666" />
//                               <Text style={styles.taskMetaText}>
//                                 {item.time} min{item.time > 1 ? 's' : ''}
//                               </Text>
//                             </View>
//                           )}
//                           {item.price && (
//                             <View style={styles.taskMetaItem}>
//                               <Ionicons name="cash-outline" size={12} color="#4CAF50" />
//                               <Text style={styles.taskMetaText}>
//                                 ${item.price}
//                               </Text>
//                             </View>
//                           )}
//                         </View>
//                       )}
//                     </View>
//                   </View>
                  
//                   {item.value ? (
//                     <View style={styles.completedIndicator}>
//                       <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
//                     </View>
//                   ) : (
//                     <Ionicons name="ellipse-outline" size={20} color="#ddd" />
//                   )}
//                 </TouchableOpacity>
//               ))}
              
//               {(!roomData.tasks || roomData.tasks.length === 0) && (
//                 <View style={styles.noTasksContainer}>
//                   <Ionicons name="list-outline" size={40} color="#ddd" />
//                   <Text style={styles.noTasksText}>No tasks assigned</Text>
//                 </View>
//               )}
//             </View>
//           </View>
          
//           {/* Completion Requirements */}
//           <View style={styles.requirementsSection}>
//             <Text style={styles.requirementsTitle}>To complete this {isExtraRoom ? "section" : "room"}:</Text>
            
//             {!isExtraRoom && (
//               <View style={styles.requirementItem}>
//                 <Ionicons 
//                   name={roomData.photos?.length >= 3 ? "checkmark-circle" : "ellipse-outline"} 
//                   size={20} 
//                   color={roomData.photos?.length >= 3 ? "#4CAF50" : "#666"} 
//                 />
//                 <Text style={[
//                   styles.requirementText,
//                   roomData.photos?.length >= 3 && styles.requirementTextCompleted
//                 ]}>
//                   Minimum 3 photos ({roomData.photos?.length || 0}/3)
//                 </Text>
//               </View>
//             )}
            
//             <View style={styles.requirementItem}>
//               <Ionicons 
//                 name={roomData.tasks?.every(t => t.value) ? "checkmark-circle" : "ellipse-outline"} 
//                 size={20} 
//                 color={roomData.tasks?.every(t => t.value) ? "#4CAF50" : "#666"} 
//               />
//               <Text style={[
//                 styles.requirementText,
//                 roomData.tasks?.every(t => t.value) && styles.requirementTextCompleted
//               ]}>
//                 All tasks completed ({roomData.tasks?.filter(t => t.value).length || 0}/{roomData.tasks?.length || 0})
//               </Text>
//             </View>
//           </View>
//         </ScrollView>
        
//         {/* Completion Button */}
//         <View style={styles.completionSection}>
//           {isRoomComplete(room) ? (
//             room.completed ? (
//               <View style={styles.alreadyCompleted}>
//                 <Ionicons name="checkmark-done-circle" size={24} color="#4CAF50" />
//                 <Text style={styles.alreadyCompletedText}>
//                   {room.name} is already completed
//                 </Text>
//               </View>
//             ) : (
//               <TouchableOpacity 
//                 style={styles.markCompleteButton}
//                 onPress={() => markRoomComplete(room.id)}
//               >
//                 <Ionicons name="checkmark-done" size={24} color="white" />
//                 <View style={styles.markCompleteButtonTexts}>
//                   <Text style={styles.markCompleteButtonMain}>
//                     Mark {room.name} Complete
//                   </Text>
//                   <Text style={styles.markCompleteButtonSub}>
//                     All requirements are met ✓
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             )
//           ) : (
//             <View style={styles.incompleteRequirements}>
//               <Ionicons name="alert-circle" size={24} color="#FF9800" />
//               <View style={styles.incompleteRequirementsTexts}>
//                 <Text style={styles.incompleteRequirementsMain}>
//                   Complete requirements to finish
//                 </Text>
//                 <Text style={styles.incompleteRequirementsSub}>
//                   {!isExtraRoom && roomData.photos?.length < 3 && `${3 - (roomData.photos?.length || 0)} more photos, `}
//                   {roomData.tasks?.filter(t => !t.value).length} more tasks
//                 </Text>
//               </View>
//             </View>
//           )}
//         </View>
//       </View>
//     );
//   };

//   const CameraView = () => {
//     if (isSimulator) {
//       return (
//         <View style={styles.cameraContainer}>
//           <View style={styles.cameraPreviewContainer}>
//             <View style={[styles.camera, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
//               <Ionicons name="laptop-outline" size={64} color="white" />
//               <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, marginTop: 20 }}>
//                 Camera Simulator Mode
//               </Text>
//               <Text style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 10 }}>
//                 You are using a simulator. Camera functionality is limited.
//               </Text>
//               <Text style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 5 }}>
//                 Tap the button to add simulated base64 photos.
//               </Text>
//               <TouchableOpacity 
//                 style={styles.permissionButton}
//                 onPress={takePicture}
//               >
//                 <Text style={styles.permissionButtonText}>Take Simulated Photo (Base64)</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
  
//           <View style={styles.cameraThumbnailSection}>
//             <View style={styles.thumbnailSectionContent}>
//               {photos.length > 0 ? (
//                 <>
//                   <FlatList
//                     data={photos}
//                     horizontal
//                     keyExtractor={(item, index) => index.toString()}
//                     renderItem={({ item, index }) => (
//                       <View style={styles.thumbnailContainer}>
//                         <Image 
//                           source={{ uri: item.file }} 
//                           style={styles.preview} 
//                           transition={400}
//                           cachePolicy="memory-disk"
//                         />
//                         <TouchableOpacity 
//                           onPress={() => removePhoto(index)} 
//                           style={styles.removeButton}
//                         >
//                           <Ionicons name="trash-outline" size={14} color="white" />
//                         </TouchableOpacity>
//                         <View style={styles.previewNumber}>
//                           <Text style={styles.previewNumberText}>{index + 1}</Text>
//                         </View>
//                       </View>
//                     )}
//                     contentContainerStyle={styles.previewContainer}
//                     showsHorizontalScrollIndicator={false}
//                   />
                  
//                   <TouchableOpacity 
//                     onPress={onSubmit} 
//                     style={styles.uploadButton}
//                     disabled={isUploading}
//                   >
//                     {isUploading ? (
//                       <ActivityIndicator size="small" color="white" />
//                     ) : (
//                       <>
//                         <Ionicons name="cloud-upload-outline" size={22} color="white" />
//                         <View style={styles.uploadButtonTexts}>
//                           <Text style={styles.uploadButtonMain}>
//                             Upload {photos.length} Photo{photos.length !== 1 ? 's' : ''}
//                           </Text>
//                           <Text style={styles.uploadButtonSub}>
//                             These are simulated base64 photos for testing
//                           </Text>
//                         </View>
//                       </>
//                     )}
//                   </TouchableOpacity>
//                 </>
//               ) : (
//                 <View style={styles.minimalPlaceholder}>
//                   <Ionicons name="camera-outline" size={48} color={COLORS.lightGray} />
//                   <Text style={styles.minimalPlaceholderText}>
//                     No photos captured yet
//                   </Text>
//                   <Text style={styles.minimalPlaceholderSubtext}>
//                     Tap "Take Simulated Photo" above
//                   </Text>
//                 </View>
//               )}
//             </View>
//           </View>
//         </View>
//       );
//     }

//     if (!Camera || typeof Camera !== 'function') {
//       return (
//         <View style={styles.cameraContainer}>
//           <View style={styles.cameraPreviewContainer}>
//             <View style={[styles.camera, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
//               <Ionicons name="alert-circle" size={64} color="white" />
//               <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, marginTop: 20 }}>
//                 Camera Not Available
//               </Text>
//               <Text style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 10 }}>
//                 Camera module could not be loaded. Please:
//               </Text>
//               <Text style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 5 }}>
//                 1. Run on a physical device
//               </Text>
//               <Text style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
//                 2. Check camera permissions
//               </Text>
//               <Text style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
//                 3. Reinstall expo-camera
//               </Text>
//             </View>
//           </View>
//         </View>
//       );
//     }

//     if (hasCameraPermission === null) {
//       return (
//         <View style={styles.cameraContainer}>
//           <View style={styles.cameraPreviewContainer}>
//             <View style={[styles.camera, { justifyContent: 'center', alignItems: 'center' }]}>
//               <ActivityIndicator size="large" color="white" />
//               <Text style={{ color: 'white', marginTop: 20 }}>Requesting camera permission...</Text>
//             </View>
//           </View>
//         </View>
//       );
//     }

//     if (hasCameraPermission === false) {
//       return (
//         <View style={styles.cameraContainer}>
//           <View style={styles.cameraPreviewContainer}>
//             <View style={[styles.camera, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
//               <Ionicons name="camera-off" size={64} color="white" />
//               <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, marginTop: 20 }}>
//                 Camera access denied
//               </Text>
//               <Text style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 10 }}>
//                 Please enable camera permissions in your device settings to take photos.
//               </Text>
//               <TouchableOpacity 
//                 style={styles.permissionButton}
//                 onPress={async () => {
//                   try {
//                     const { status } = await Camera.requestCameraPermissionsAsync();
//                     setHasCameraPermission(status === 'granted');
//                   } catch (error) {
//                     console.error('Error requesting permission:', error);
//                   }
//                 }}
//               >
//                 <Text style={styles.permissionButtonText}>Request Permission Again</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       );
//     }

//     return (
//       <View style={styles.cameraContainer}>
//         {isUploading && (
//           <View style={styles.loadingOverlay}>
//             <ActivityIndicator size="large" color="white" />
//           </View>
//         )}
        
//         <View style={styles.cameraPreviewContainer}>
//           <Camera 
//             style={styles.camera} 
//             ref={cameraRef}
//           >
//             <TouchableOpacity 
//               style={styles.closeButton} 
//               onPress={() => {
//                 setCameraVisible(false);
//                 setPhotos([]);
//                 setCameraMode('idle');
//               }}
//             >
//               <Ionicons name="chevron-down" size={28} color="white" />
//             </TouchableOpacity>
            
//             <View style={styles.cameraControls}>
//               {cameraMode === 'capturing' ? (
//                 <ActivityIndicator size="large" color="white" />
//               ) : (
//                 <TouchableOpacity 
//                   style={styles.captureButton} 
//                   onPress={takePicture}
//                   disabled={photos.length >= MAX_IMAGES_UPLOAD}
//                 >
//                   <View style={styles.captureButtonInner}>
//                     <Ionicons name="camera" size={32} color="white" />
//                   </View>
//                 </TouchableOpacity>
//               )}
//             </View>
  
//             <View style={styles.photoCounter}>
//               <Ionicons name="images-outline" size={16} color="white" />
//               <Text style={styles.photoCounterText}>
//                 {photos.length}/{MAX_IMAGES_UPLOAD}
//               </Text>
//             </View>
//           </Camera>
//         </View>
  
//         <View style={styles.cameraThumbnailSection}>
//           <View style={styles.thumbnailSectionContent}>
//             {photos.length > 0 ? (
//               <>
//                 <FlatList
//                   data={photos}
//                   horizontal
//                   keyExtractor={(item, index) => index.toString()}
//                   renderItem={({ item, index }) => (
//                     <View style={styles.thumbnailContainer}>
//                       <Image 
//                         source={{ uri: item.file }} 
//                         style={styles.preview} 
//                         transition={400}
//                         cachePolicy="memory-disk"
//                       />
//                       <TouchableOpacity 
//                         onPress={() => removePhoto(index)} 
//                         style={styles.removeButton}
//                       >
//                         <Ionicons name="trash-outline" size={14} color="white" />
//                       </TouchableOpacity>
//                       <View style={styles.previewNumber}>
//                         <Text style={styles.previewNumberText}>{index + 1}</Text>
//                       </View>
//                     </View>
//                   )}
//                   contentContainerStyle={styles.previewContainer}
//                   showsHorizontalScrollIndicator={false}
//                 />
                
//                 <TouchableOpacity 
//                   onPress={onSubmit} 
//                   style={styles.uploadButton}
//                   disabled={isUploading}
//                 >
//                   {isUploading ? (
//                     <ActivityIndicator size="small" color="white" />
//                   ) : (
//                     <>
//                       <Ionicons name="cloud-upload-outline" size={22} color="white" />
//                       <View style={styles.uploadButtonTexts}>
//                         <Text style={styles.uploadButtonMain}>
//                           Upload {photos.length} Photo{photos.length !== 1 ? 's' : ''}
//                         </Text>
//                         <Text style={styles.uploadButtonSub}>
//                           Tap the camera above to add more photos
//                         </Text>
//                       </View>
//                     </>
//                   )}
//                 </TouchableOpacity>
//               </>
//             ) : (
//               <View style={styles.minimalPlaceholder}>
//                 <Ionicons name="camera-outline" size={48} color={COLORS.lightGray} />
//                 <Text style={styles.minimalPlaceholderText}>
//                   No photos captured yet
//                 </Text>
//                 <Text style={styles.minimalPlaceholderSubtext}>
//                   Tap the camera button to take photos
//                 </Text>
//               </View>
//             )}
//           </View>
//         </View>
//       </View>
//     );
//   };

//   if (cameraVisible) {
//     return <CameraView />;
//   }

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <CustomActivityIndicator size={40} />
//       </View>
//     );
//   }

//   if (selectedRoom) {
//     return (
//       <RoomWorkspace 
//         room={selectedRoom}
//         onBack={() => setSelectedRoom(null)}
//       />
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headline}>After Photos & Tasks</Text>
//         <Text style={styles.subtitle}>
//           Complete rooms in any order. Each room needs 3+ photos (except Extra Tasks) and all tasks checked.
//           {isSimulator && ' (Simulator Mode)'}
//         </Text>
//         {isSimulator && (
//           <View style={styles.simulatorWarning}>
//             <Ionicons name="information-circle" size={16} color={COLORS.warning} />
//             <Text style={styles.simulatorWarningText}>
//               Running on simulator. Using base64 simulated images.
//             </Text>
//           </View>
//         )}

//         <View style={styles.minimalProgressRow}>
//           <View style={styles.minimalProgressLeft}>
//             <Text style={styles.minimalProgressTitle}>Progress</Text>
//             <View style={styles.minimalProgressBar}>
//               <View 
//                 style={[
//                   styles.minimalProgressFill, 
//                   { 
//                     width: `${(rooms.filter(r => isRoomComplete(r)).length / Math.max(rooms.length, 1)) * 100}%`,
//                     backgroundColor: COLORS.primary
//                   }
//                 ]} 
//               />
//             </View>
//           </View>
          
//           <View style={styles.minimalProgressRight}>
//             <Text style={styles.minimalProgressPercentage}>
//               {Math.round((rooms.filter(r => isRoomComplete(r)).length / Math.max(rooms.length, 1)) * 100)}%
//             </Text>
//             <Text style={styles.minimalProgressText}>
//               {rooms.filter(r => isRoomComplete(r)).length}/{rooms.length} rooms
//             </Text>
//           </View>
//         </View>

//       </View>
      
//       <Text style={styles.sectionTitle}>All Rooms</Text>
//       <ScrollView style={styles.roomsContainer}>
//         {rooms.length > 0 ? (
//           rooms.map(room => (
//             <RoomCard key={room.id} room={room} />
//           ))
//         ) : (
//           <View style={styles.noRoomsContainer}>
//             <Ionicons name="home-outline" size={48} color={COLORS.gray} />
//             <Text style={styles.noRoomsText}>No rooms assigned</Text>
//           </View>
//         )}
//       </ScrollView>
      
//       <TouchableOpacity 
//         style={[
//           styles.finishButton,
//           !allRoomsComplete && styles.disabledFinishButton
//         ]}
//         onPress={submitCompletion}
//         disabled={!allRoomsComplete}
//       >
//         <Ionicons name="checkmark-done-circle" size={24} color="white" />
//         <View style={styles.finishButtonTexts}>
//           <Text style={styles.finishButtonMain}>
//             {allRoomsComplete ? "Finish Cleaning" : "Complete All Rooms First"}
//           </Text>
//           <Text style={styles.finishButtonSub}>
//             {allRoomsComplete 
//               ? "All rooms are complete!" 
//               : `${rooms.filter(r => !isRoomComplete(r)).length} room(s) remaining`}
//           </Text>
//         </View>
//         <Ionicons name="chevron-forward" size={20} color="white" />
//       </TouchableOpacity>

//       <Modal isVisible={isBeforeModalVisible} style={styles.fullScreenModal}>
//         <View style={styles.modalContainer}>
//           <ImageViewer
//             imageUrls={currentImages}
//             index={currentImageIndex}
//             backgroundColor="black"
//             enableSwipeDown
//             enableImageZoom
//             onSwipeDown={() => setBeforeModalVisible(false)}
//             renderImage={(props) => (
//               <Image source={props.source} style={styles.fullSizeImage} contentFit="contain" />
//             )}
//           />
          
//           {currentImages[currentImageIndex]?.cleanliness && (
//             <Animated.View style={[styles.analysisPanel, { transform: [{ translateY: pan.y }] }]} {...panResponder.panHandlers}>
//               <View style={styles.dragHandle} />
//               <View style={styles.analysisContent}>
//                 <Text style={styles.analysisTitle}>CLEANLINESS ANALYSIS</Text>
                
//                 <View style={styles.scoreSection}>
//                   <Text style={styles.sectionTitle}>THIS PHOTO</Text>
//                   <View style={styles.scoreRow}>
//                     <View style={styles.scoreText}>
//                       <Text style={styles.scorePercentage}>
//                         {invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0).toFixed(0)}%
//                       </Text>
//                       <Text style={styles.scoreLabel}>
//                         {getCleanlinessLabel(invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0))}
//                       </Text>
//                     </View>
//                     <CircularProgress
//                       value={invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0)}
//                       radius={35}
//                       activeStrokeColor={getCleanlinessColor(invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0))}
//                       inActiveStrokeColor="#2d2d2d"
//                       maxValue={100}
//                     />
//                   </View>
//                 </View>

//                 <Text style={styles.sectionTitle}>MAIN ISSUES</Text>
//                 <View style={styles.issuesList}>
//                   {Object.entries(currentImages[currentImageIndex].cleanliness.scores || {})
//                     .sort(([,a], [,b]) => b - a)
//                     .slice(0, 3)
//                     .map(([factor, score]) => (
//                       <View key={factor} style={styles.issueItem}>
//                         <Text style={styles.issueName}>{factor.replace(/_/g, ' ').toUpperCase()}</Text>
//                         <Text style={[styles.issueScore, { color: getCleanlinessColor(100 - (score * 10)) }]}>
//                           {(100 - (score * 10)).toFixed(0)}%
//                         </Text>
//                       </View>
//                     ))}
//                 </View>
//               </View>
//             </Animated.View>
//           )}

//           <TouchableOpacity style={styles.modalCloseButton} onPress={() => setBeforeModalVisible(false)}>
//             <Ionicons name="close" size={24} color="white" />
//           </TouchableOpacity>
//         </View>
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
//   headline: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#1a1a1a',
//     marginBottom: 4,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#666',
//     lineHeight: 20,
//   },
//   simulatorWarning: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff3cd',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 8,
//     marginTop: 10,
//   },
//   simulatorWarningText: {
//     fontSize: 14,
//     color: '#856404',
//     marginLeft: 8,
//     fontWeight: '500',
//   },
//   progressCard: {
//     margin: 16,
//     padding: 20,
//   },
//   progressHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   progressTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1a1a1a',
//   },
//   progressStats: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//   },
//   stat: {
//     alignItems: 'center',
//   },
//   statNumber: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },
//   statLabel: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 4,
//   },
//   statDivider: {
//     width: 1,
//     backgroundColor: '#e0e0e0',
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginHorizontal: 16,
//     marginBottom: 12,
//   },
//   roomsContainer: {
//     flex: 1,
//     paddingHorizontal: 16,
//   },
//   roomCard: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 2,
//     borderColor: 'transparent',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   selectedRoomCard: {
//     borderColor: COLORS.primary,
//     backgroundColor: '#f8fbff',
//   },
//   completedRoomCard: {
//     borderColor: '#d4edda',
//     backgroundColor: '#f0f9f0',
//   },
//   roomCardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   roomIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#e3f2fd',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   completedRoomIcon: {
//     backgroundColor: '#e8f5e8',
//   },
//   roomInfo: {
//     flex: 1,
//   },
//   roomName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1a1a1a',
//   },
//   roomStatus: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 2,
//   },
//   roomStats: {
//     alignItems: 'flex-end',
//   },
//   roomStat: {
//     fontSize: 12,
//     color: '#666',
//   },
//   progressContainer: {
//     marginBottom: 16,
//   },
//   progressBar: {
//     height: 6,
//     backgroundColor: '#e0e0e0',
//     borderRadius: 3,
//     marginBottom: 8,
//   },
//   progressFill: {
//     height: '100%',
//     borderRadius: 3,
//   },
//   progressText: {
//     fontSize: 12,
//     color: '#666',
//     textAlign: 'right',
//   },
//   roomActionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   startButton: {
//     backgroundColor: COLORS.primary,
//   },
//   reviewButton: {
//     backgroundColor: '#4CAF50',
//   },
//   roomActionButtonText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//     marginRight: 8,
//   },
//   finishButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary,
//     margin: 16,
//     padding: 18,
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   disabledFinishButton: {
//     backgroundColor: '#ccc',
//   },
//   finishButtonTexts: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   finishButtonMain: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   finishButtonSub: {
//     color: 'rgba(255,255,255,0.8)',
//     fontSize: 12,
//     marginTop: 2,
//   },
//   workspace: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   workspaceHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   backButton: {
//     marginRight: 12,
//   },
//   roomTitleSection: {
//     flex: 1,
//   },
//   workspaceRoomTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1a1a1a',
//   },
//   workspaceRoomSubtitle: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 2,
//   },
//   workspaceContent: {
//     flex: 1,
//     padding: 16,
//   },
//   section: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   extraSection: {
//     marginTop: 16,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   badge: {
//     marginLeft: 'auto',
//     backgroundColor: '#e3f2fd',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   badgeText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },
//   photoGallery: {
//     marginBottom: 16,
//   },
//   addPhotosButton: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 8,
//     padding: 16,
//   },
//   addButtonContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   addButtonTextContainer: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   addButtonMainText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 2,
//   },
//   addButtonSubText: {
//     color: 'rgba(255,255,255,0.8)',
//     fontSize: 12,
//   },
//   taskProgress: {
//     marginBottom: 16,
//   },
//   taskProgressBar: {
//     height: 6,
//     backgroundColor: '#e0e0e0',
//     borderRadius: 3,
//     marginBottom: 8,
//   },
//   taskProgressFill: {
//     height: '100%',
//     backgroundColor: COLORS.primary,
//     borderRadius: 3,
//   },
//   taskProgressText: {
//     fontSize: 12,
//     color: '#666',
//     textAlign: 'center',
//   },
//   taskList: {
//     marginBottom: 8,
//   },
//   taskItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   taskItemCompleted: {
//     backgroundColor: '#f9f9f9',
//   },
//   taskItemLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   taskTextContainer: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   taskLabel: {
//     fontSize: 15,
//     fontWeight: '500',
//     color: '#1a1a1a',
//   },
//   taskLabelCompleted: {
//     color: '#666',
//     textDecorationLine: 'line-through',
//   },
//   taskMeta: {
//     flexDirection: 'row',
//     marginTop: 4,
//     gap: 12,
//   },
//   taskMetaItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   taskMetaText: {
//     fontSize: 12,
//     color: '#666',
//     marginLeft: 4,
//   },
//   completedIndicator: {
//     marginLeft: 8,
//   },
//   noTasksContainer: {
//     alignItems: 'center',
//     padding: 20,
//   },
//   noTasksText: {
//     fontSize: 14,
//     color: '#999',
//     marginTop: 8,
//   },
//   requirementsSection: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#f0f0f0',
//   },
//   requirementsTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginBottom: 12,
//   },
//   requirementItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   requirementText: {
//     fontSize: 14,
//     color: '#666',
//     marginLeft: 8,
//   },
//   requirementTextCompleted: {
//     color: '#4CAF50',
//   },
//   completionSection: {
//     padding: 16,
//     backgroundColor: 'white',
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//   },
//   markCompleteButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#4CAF50',
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//   },
//   markCompleteButtonTexts: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   markCompleteButtonMain: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   markCompleteButtonSub: {
//     color: 'rgba(255,255,255,0.8)',
//     fontSize: 12,
//     marginTop: 2,
//   },
//   alreadyCompleted: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 16,
//   },
//   alreadyCompletedText: {
//     fontSize: 16,
//     color: '#4CAF50',
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   incompleteRequirements: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 16,
//   },
//   incompleteRequirementsTexts: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   incompleteRequirementsMain: {
//     fontSize: 16,
//     color: '#FF9800',
//     fontWeight: '600',
//   },
//   incompleteRequirementsSub: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 2,
//   },
//   cameraContainer: {
//     flex: 1,
//   },
//   camera: {
//     flex: 1,
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 50,
//     right: 20,
//     zIndex: 10,
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
//     top: 100,
//     alignSelf: 'center',
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
//   previewSection: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: 'rgba(0,0,0,0.9)',
//     padding: 16,
//   },
//   previewTitle: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 12,
//   },
//   cameraActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 12,
//   },
//   continueButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 20,
//     flex: 1,
//     marginRight: 8,
//     justifyContent: 'center',
//   },
//   continueButtonText: {
//     color: COLORS.primary,
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   saveButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 20,
//     flex: 2,
//     marginLeft: 8,
//   },
//   saveButtonText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   thumbnailContainer: {
//     marginRight: 12,
//     marginBottom: 0,
//     position: 'relative',
//   },
//   preview: {
//     width: 100,
//     height: 100,
//     borderRadius: 12,
//     backgroundColor: '#f0f0f0', // Light gray background for thumbnails
//   },
//   deleteButton: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     padding: 4,
//     borderRadius: 10,
//   },
//   warningBadge: {
//     position: 'absolute',
//     top: 8,
//     left: 8,
//     backgroundColor: '#e74c3c',
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
//   emptyPhotos: {
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
//   emptyPhotosText: {
//     fontSize: 12,
//     color: '#999',
//     marginTop: 4,
//   },
//   emptyPhotosSubtext: {
//     fontSize: 12,
//     color: '#999',
//     marginTop: 4,
//     textAlign: 'center',
//   },
//   fullScreenModal: {
//     margin: 0,
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'black',
//   },
//   fullSizeImage: {
//     width: '100%',
//     height: '100%',
//   },
//   modalCloseButton: {
//     position: 'absolute',
//     top: 50,
//     right: 20,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     borderRadius: 20,
//     padding: 8,
//   },
//   analysisPanel: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: 'rgba(0,0,0,0.9)',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 20,
//     paddingBottom: 40,
//   },
//   dragHandle: {
//     width: 40,
//     height: 4,
//     backgroundColor: 'rgba(255,255,255,0.4)',
//     borderRadius: 2,
//     alignSelf: 'center',
//     marginBottom: 16,
//   },
//   analysisContent: {
//     maxHeight: 400,
//   },
//   analysisTitle: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: '700',
//     textAlign: 'center',
//     marginBottom: 20,
//     letterSpacing: 0.5,
//   },
//   scoreSection: {
//     marginBottom: 20,
//   },
//   scoreRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   scoreText: {
//     flex: 1,
//   },
//   scorePercentage: {
//     color: 'white',
//     fontSize: 32,
//     fontWeight: '700',
//     marginBottom: 4,
//   },
//   scoreLabel: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     opacity: 0.9,
//   },
//   issuesList: {
//     backgroundColor: 'rgba(255,255,255,0.05)',
//     borderRadius: 12,
//     padding: 8,
//   },
//   issueItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(255,255,255,0.1)',
//   },
//   issueName: {
//     color: 'white',
//     fontSize: 14,
//     flex: 2,
//     opacity: 0.9,
//   },
//   issueScore: {
//     fontSize: 14,
//     fontWeight: '600',
//     flex: 1,
//     textAlign: 'right',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   noRoomsContainer: {
//     alignItems: 'center',
//     padding: 40,
//     marginTop: 20,
//   },
//   noRoomsText: {
//     fontSize: 16,
//     color: COLORS.gray,
//     marginTop: 12,
//   },
//   previewContainer: {
//     paddingVertical: 8,
//   },

//   cameraContainer: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//   },
//   cameraPreviewContainer: {
//     height: 400, // Fixed height for camera preview
//     backgroundColor: '#000',
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//     elevation: 8,
//     position: 'relative',
//   },
//   cameraThumbnailSection: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//   },
//   thumbnailSectionContent: {
//     paddingHorizontal: 16,
//     paddingTop: 0,
//   },
//   thumbnailSectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   thumbnailSectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1a1a1a',
//   },
//   photoCountBadge: {
//     backgroundColor: '#e3f2fd',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   photoCountText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },

//   cameraThumbnailSection: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//   },
//   thumbnailSectionContent: {
//     paddingHorizontal: 16,
//     paddingTop: 0,
//     flex: 1,
//   },
//   thumbnailSectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   thumbnailSectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1a1a1a',
//   },
//   photoCountBadge: {
//     backgroundColor: '#e3f2fd',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   photoCountText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },
  
//   minimalPlaceholder: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     minHeight: 200, // Ensure it's visible without scrolling
//   },
//   minimalPlaceholderText: {
//     fontSize: 16,
//     color: COLORS.gray,
//     marginTop: 12,
//     fontWeight: '500',
//     textAlign: 'center',
//   },
//   minimalPlaceholderSubtext: {
//     fontSize: 14,
//     color: COLORS.lightGray,
//     marginTop: 4,
//     textAlign: 'center',
//   },
  
//   uploadButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary,
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     borderRadius: 12,
//     marginTop: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   uploadButtonTexts: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   uploadButtonMain: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   uploadButtonSub: {
//     color: 'rgba(255,255,255,0.8)',
//     fontSize: 12,
//     marginTop: 2,
//   },

//   minimalProgressCard: {
//     marginBottom: 12,
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//   },
//   minimalProgressRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginTop:16
//   },
//   minimalProgressLeft: {
//     flex: 1,
//     marginRight: 12,
//   },
//   minimalProgressTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 6,
//   },
//   minimalProgressBar: {
//     height: 4,
//     backgroundColor: '#e8e8e8',
//     borderRadius: 2,
//     overflow: 'hidden',
//   },
//   minimalProgressFill: {
//     height: '100%',
//     borderRadius: 2,
//   },
//   minimalProgressRight: {
//     alignItems: 'flex-end',
//   },
//   minimalProgressPercentage: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.primary,
//     marginBottom: 2,
//   },
//   minimalProgressText: {
//     fontSize: 12,
//     color: '#666',
//   },
//   permissionButton: {
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 8,
//     marginTop: 20,
//   },
//   permissionButtonText: {
//     color: 'white',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 100,
//   },
// });

// export default AfterPhoto;




// import React, { useEffect, useContext, useCallback, useState, useRef } from 'react';
// import { 
//   View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, 
//   FlatList, ScrollView, Dimensions, Animated, PanResponder, SafeAreaView
// } from 'react-native';
// import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'; 
// import COLORS from '../../../constants/colors';
// import userService from '../../../services/connection/userService';
// import { AuthContext } from '../../../context/AuthContext';
// import { useFocusEffect } from '@react-navigation/native';
// import CardNoPrimary from '../../../components/shared/CardNoPrimary';
// import { Checkbox } from 'react-native-paper';
// import ImageViewer from 'react-native-image-zoom-viewer';
// import Modal from 'react-native-modal';
// import { sendPushNotifications } from '../../../utils/sendPushNotification';
// import ROUTES from '../../../constants/routes';
// import CircularProgress from 'react-native-circular-progress-indicator';
// import { Image } from 'expo-image'; 
// import CustomActivityIndicator from '../../../components/shared/CuustomActivityIndicator';
// import formatRoomTitle from '../../../utils/formatRoomTitle';
// import Constants from 'expo-constants';

// // Import expo-camera with CameraView (new API)
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import * as ImagePicker from 'expo-image-picker';

// const { width } = Dimensions.get('window');

// // Base64 encoded 1x1 pixel transparent image for simulation
// const SIMULATED_BASE64_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// const ThumbnailItem = React.memo(({ 
//   photo, 
//   index, 
//   openImageViewer, 
//   taskTitle,
//   invertPercentage, 
//   getCleanlinessColor, 
//   photosArray,
//   onDelete
// }) => {
//   const photoScore = invertPercentage(photo.cleanliness?.individual_overall || 0);
//   const isProblemPhoto = photoScore < 35;
//   const fadeAnim = useRef(new Animated.Value(1)).current;

//   const handleDelete = () => {
//     Alert.alert(
//       "Delete Photo",
//       "Are you sure you want to permanently delete this photo?",
//       [
//         { text: "Cancel", style: "cancel" },
//         { 
//           text: "Delete", 
//           onPress: () => {
//             Animated.timing(fadeAnim, {
//               toValue: 0,
//               duration: 300,
//               useNativeDriver: true
//             }).start(() => onDelete(index, taskTitle));
//           }
//         }
//       ]
//     );
//   };

//   return (
//     <Animated.View style={{ opacity: fadeAnim }}>
//       <TouchableOpacity
//         onPress={() => openImageViewer(photosArray, index, taskTitle)}
//         style={styles.thumbnailContainer}
//       >
//         <Image
//           source={{ uri: photo.img_url }}
//           style={styles.preview}
//           cachePolicy="memory-disk"
//           transition={300}
//         />
//         <TouchableOpacity 
//           onPress={handleDelete}
//           style={styles.deleteButton}
//         >
//           <Ionicons name="trash-outline" size={16} color="white" />
//         </TouchableOpacity>
//         {isProblemPhoto && (
//           <View style={styles.warningBadge}>
//             <MaterialIcons name="warning" size={14} color="#fff" />
//           </View>
//         )}
//         <View style={styles.photoNumber}>
//           <Text style={styles.photoNumberText}>{index + 1}</Text>
//         </View>
//       </TouchableOpacity>
//     </Animated.View>
//   );
// });

// const AfterPhoto = ({ scheduleId, hostId }) => {
//   const { currentUserId, currentUser } = useContext(AuthContext);
//   const cameraRef = useRef(null);
//   const MAX_IMAGES_UPLOAD = 10;
  
//   // Check if running on simulator
//   const isSimulator = !Constants.isDevice;
  
//   const [tasks, setTasks] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedImages, setSelectedImages] = useState({});
//   const [isUploading, setIsUploading] = useState(false);
//   const [photos, setPhotos] = useState([]);
//   const [cleaning_fee, setFee] = useState(0);
//   const [cameraVisible, setCameraVisible] = useState(false);
//   const [isBeforeModalVisible, setBeforeModalVisible] = useState(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [currentImages, setCurrentImages] = useState([]);
//   const [hostTokens, setHostPushToken] = useState([]);
//   const [selectedTaskTitle, setSelectedTaskTitle] = useState('');
//   const [selectedRoom, setSelectedRoom] = useState(null);
//   const [rooms, setRooms] = useState([]);
  
//   // Updated camera states using CameraView API (same as BeforePhoto)
//   const [permission, requestPermission] = useCameraPermissions();
//   const [facing, setFacing] = useState('back');
//   const [isCameraReady, setIsCameraReady] = useState(false);
//   const [cameraAvailable, setCameraAvailable] = useState(!isSimulator);

//   const pan = useRef(new Animated.ValueXY()).current;
//   const overlayOpacity = useRef(new Animated.Value(1)).current;

//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => true,
//       onPanResponderMove: Animated.event([null, { dy: pan.y }], { useNativeDriver: false }),
//       onPanResponderRelease: (e, gesture) => {
//         if (gesture.dy > 50) {
//           Animated.timing(pan, { toValue: { x: 0, y: 300 }, duration: 300, useNativeDriver: true }).start();
//           Animated.timing(overlayOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
//         } else {
//           Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
//           Animated.spring(overlayOpacity, { toValue: 1, useNativeDriver: true }).start();
//         }
//       }
//     })
//   ).current;

//   // Request camera and media library permissions (same as BeforePhoto)
//   useEffect(() => {
//     (async () => {
//       if (isSimulator) {
//         setCameraAvailable(false);
//         return;
//       }
      
//       // Request camera permissions
//       if (permission && !permission.granted) {
//         await requestPermission();
//         setCameraAvailable(permission?.granted || false);
//       }
      
//       // Request media library permissions for image picker
//       const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (mediaStatus !== 'granted') {
//         console.log('Media library permission denied');
//       }
//     })();
//   }, [isSimulator, permission, requestPermission]);

//   const invertPercentage = (score) => 100 - (score * 10);

//   const getCleanlinessLabel = (invertedScore) => {
//     if (invertedScore <= 35) return 'Needs Deep Cleaning';
//     if (invertedScore <= 40) return 'Requires Attention';
//     return 'Very Clean';
//   };
  
//   const getCleanlinessColor = (invertedScore) => {
//     if (invertedScore <= 35) return '#e74c3c';
//     if (invertedScore <= 40) return '#f1c40f';
//     return '#2ecc71';
//   };

//   const fetchImages = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const response = await userService.getUpdatedImageUrls(scheduleId);
//       const res = response.data.data;
//       const getCleanerById = (id) => res.assignedTo.find(cleaner => cleaner.cleanerId === id);
//       const cl = getCleanerById(currentUserId);
      
//       if (cl?.checklist?.details) {
//         const details = cl.checklist.details;
//         setSelectedImages(details);
        
//         // Convert details object to rooms array - INCLUDING EXTRA ROOM
//         const roomArray = Object.keys(details).map(key => {
//           const roomData = details[key];
//           const isExtraRoom = key === 'Extra';
          
//           return {
//             id: key,
//             name: isExtraRoom ? 'Extra Tasks' : formatRoomTitle(key),
//             type: isExtraRoom ? 'extra' : key.split('_')[0],
//             tasks: roomData.tasks || [],
//             photos: roomData.photos || [],
//             completed: isExtraRoom 
//               ? (roomData.tasks || []).every(task => task.value === true) 
//               : (roomData.tasks || []).every(task => task.value === true) && 
//                 (roomData.photos || []).length >= 3,
//             isExtra: isExtraRoom
//           };
//         }); // No filter - include all rooms
        
//         setRooms(roomArray);
//         setTasks(details);
//         setFee(cl.checklist.price || 0);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   }, [scheduleId, currentUserId]);

//   const fetchHostPushTokens = useCallback(async () => {
//     const response = await userService.getUserPushTokens(hostId);
//     setHostPushToken(response.data.tokens);
//   }, [hostId]);

//   useFocusEffect(
//     useCallback(() => {
//       let isActive = true;
//       const fetchData = async () => {
//         try {
//           await fetchImages();
//           await fetchHostPushTokens();
//         } catch (error) {
//           console.error("Error fetching data:", error);
//         }
//       };
//       if (isActive) fetchData();
//       return () => { isActive = false; };
//     }, [fetchImages, fetchHostPushTokens])
//   );

//   useEffect(() => {
//     if (currentImages[currentImageIndex]?.cleanliness) {
//       pan.setValue({ x: 0, y: 0 });
//       overlayOpacity.setValue(1);
//     }
//   }, [currentImageIndex]);

//   const openImageViewer = useCallback((images, index, category) => {
//     pan.setValue({ x: 0, y: 0 });
//     overlayOpacity.setValue(1);

//     const formattedImages = images.map(photo => {
//       const score = invertPercentage(photo.cleanliness?.individual_overall || 0);
//       const status = getCleanlinessLabel(score);
      
//       return {
//         url: status === "Very Clean" ? photo.img_url : photo.cleanliness?.heatmap_url || photo.img_url,
//         cleanliness: photo.cleanliness,
//         props: { source: { uri: status === "Very Clean" ? photo.img_url : photo.cleanliness?.heatmap_url } },
//         category: category
//       };
//     });
  
//     setCurrentImages(formattedImages);
//     setCurrentImageIndex(index);
//     setBeforeModalVisible(true);
//   }, []);

//   // Take picture with camera or pick from library (same as BeforePhoto)
//   const takePicture = async () => {
//     // On simulator or when camera fails, use image picker
//     if (isSimulator || !cameraAvailable || !permission?.granted) {
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
        
//         const imgSrc = `data:image/jpeg;base64,${photo.base64}`;
//         const photoData = {
//           filename: `photo_${Date.now()}.jpg`,
//           file: imgSrc,
//           timestamp: new Date().toISOString()
//         };
//         setPhotos((prevPhotos) => [...prevPhotos, photoData]);
//         console.log('Photo added:', photoData);
//       } catch (error) {
//         console.error('Error taking picture:', error);
//         Alert.alert('Error', 'Failed to take picture. Using photo library instead.');
//         // Fallback to image picker
//         await pickImageFromLibrary();
//       }
//     } else {
//       // Camera not ready, use image picker
//       await pickImageFromLibrary();
//     }
//   };

//   // Pick image from library (same as BeforePhoto)
//   const pickImageFromLibrary = async () => {
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: false,
//         aspect: [4, 3],
//         quality: 0.8,
//         base64: true,
//         allowsMultipleSelection: true,
//         selectionLimit: MAX_IMAGES_UPLOAD - photos.length
//       });

//       if (!result.canceled) {
//         const newPhotos = result.assets.map((asset, index) => ({
//           filename: `photo_${Date.now()}_${index}.jpg`,
//           file: `data:image/jpeg;base64,${asset.base64}`,
//           timestamp: new Date().toISOString()
//         }));

//         if (photos.length + newPhotos.length <= MAX_IMAGES_UPLOAD) {
//           setPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);
//         } else {
//           Alert.alert('Limit reached', `Maximum ${MAX_IMAGES_UPLOAD} photos allowed`);
//         }
//       }
//     } catch (error) {
//       console.error('Image picker error:', error);
//       Alert.alert('Error', 'Failed to pick image from library');
//     }
//   };

//   // Flip camera (same as BeforePhoto)
//   const flipCamera = () => {
//     setFacing(current => current === 'back' ? 'front' : 'back');
//   };

//   const openCamera = (taskTitle) => {
//     if (isSimulator) {
//       Alert.alert(
//         'Camera Simulation',
//         'This is a simulator. Camera functionality is limited. You can still test photo uploads with images from your library.',
//         [{ text: 'OK' }]
//       );
//     }
//     setSelectedTaskTitle(taskTitle);
//     setPhotos([]);
//     setCameraVisible(true);
//   };

//   const validateTasks = () => {
//     if (!selectedImages || Object.keys(selectedImages).length === 0) {
//       Alert.alert("Validation Error", "No tasks or images found for validation.");
//       return false;
//     }

//     let invalidCategories = [];
//     let insufficientImagesCategories = [];

//     Object.keys(selectedImages).forEach((category) => {
//       const categoryData = selectedImages[category];
//       if (!categoryData || !categoryData.tasks || !Array.isArray(categoryData.tasks)) return;

//       const { tasks, photos } = categoryData;
//       const isExtraRoom = category === 'Extra';
//       const allTasksCompleted = tasks.every((task) => task.value === true);
      
//       if (!allTasksCompleted) invalidCategories.push(category);
      
//       // Only check photos for non-extra rooms
//       if (!isExtraRoom && (!photos || photos.length < 3)) {
//         insufficientImagesCategories.push(category);
//       }
//     });

//     if (invalidCategories.length > 0 || insufficientImagesCategories.length > 0) {
//       let errorMessage = "";
//       if (invalidCategories.length > 0) errorMessage += `Incomplete tasks in: ${invalidCategories.join(", ")}.\n`;
//       if (insufficientImagesCategories.length > 0) errorMessage += `Insufficient images in: ${insufficientImagesCategories.join(", ")}.`;
//       Alert.alert("Validation Error", errorMessage);
//       return false;
//     }

//     return true;
//   };

//   const onSubmit = async () => {
//     if (photos.length === 0) {
//       Alert.alert('No Photos', 'Please take at least one photo before uploading.');
//       return;
//     }

//     if (photos.length > MAX_IMAGES_UPLOAD) {
//       Alert.alert('Upload Limit Exceeded', `You can only upload up to ${MAX_IMAGES_UPLOAD} images at a time.`);
//       return;
//     }
  
//     setIsUploading(true);
    
//     // Prepare images for upload
//     const imagesToUpload = photos.map(photo => {
//       // If using simulated image, use it directly
//       if (photo.file === SIMULATED_BASE64_IMAGE) {
//         return photo;
//       }
      
//       // For real photos, ensure proper format
//       if (photo.file.startsWith('data:image/')) {
//         return photo;
//       }
      
//       // If it doesn't have data prefix, add it (just in case)
//       return {
//         ...photo,
//         file: `data:image/jpeg;base64,${photo.file}`
//       };
//     });

//     const data = {
//       photo_type: 'after_photos',
//       scheduleId: scheduleId,
//       images: imagesToUpload,
//       currentUserId: currentUserId,
//       task_title: selectedTaskTitle,
//       updated_tasks: selectedImages,
//     };

//     try {
//       const response = await userService.uploadTaskPhotos(data);
//       if (response.status === 200) {
//         Alert.alert('Upload Successful', `${photos.length} photos have been uploaded successfully!`);
//         fetchImages();
//         setPhotos([]);
//         setCameraVisible(false);
//       }
//     } catch (err) {
//       console.error('Error uploading photos:', err);
//       Alert.alert('Upload Failed', 'An error occurred while uploading your photos.');
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const updateTasksInBackend = async (category, updatedTasks) => {
//     try {
//       const data = { scheduleId, cleanerId: currentUserId, category, tasks: updatedTasks };
//       await userService.updateChecklist(data);
//     } catch (err) {
//       console.error("Error updating tasks:", err);
//     }
//   };
  
//   const handleTaskToggle = (category, taskId) => {
//     setSelectedImages((prevSelectedImages) => {
//       const updatedImages = { ...prevSelectedImages };
//       if (!updatedImages[category]) return prevSelectedImages;

//       updatedImages[category].tasks = updatedImages[category].tasks.map((task) =>
//         task.id === taskId ? { ...task, value: !task.value } : task
//       );

//       updateTasksInBackend(category, updatedImages[category].tasks);
//       return updatedImages;
//     });
//   };

//   const removePhoto = (index) => {
//     setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
//   };

//   const handleDeletePhoto = async (indexToDelete, category) => {
//     try {
//       const photoToDelete = selectedImages[category]?.photos[indexToDelete];
//       if (!photoToDelete) {
//         Alert.alert("Error", "Photo not found");
//         return;
//       }

//       const originalFilename = photoToDelete.img_url.split('/').pop();
//       const heatmapFilename = photoToDelete.cleanliness?.heatmap_url?.split('/').pop();

//       setSelectedImages(prev => {
//         const updated = {...prev};
//         updated[category].photos = updated[category].photos.filter((_, i) => i !== indexToDelete);
//         return updated;
//       });

//       const data = { originalFilename, heatmapFilename, category, scheduleId };
//       await userService.deleteSpaceAfterPhoto(data);
//       updateTasksInBackend(selectedImages);

//     } catch (error) {
//       console.error('Delete failed:', error);
//       setSelectedImages(prev => ({...prev}));
//       Alert.alert('Deletion Failed', error.response?.data?.detail || 'Could not delete photo');
//     }
//   };

//   const submitCompletion = useCallback(async () => {
//     if (!validateTasks()) return;
//     setIsLoading(true);
//     try {
//       await userService.finishCleaning({
//         scheduleId,
//         cleanerId: currentUserId,
//         completed_tasks: selectedImages,
//         fee: parseFloat(cleaning_fee),
//         completionTime: new Date()
//       });
//       sendPushNotifications(hostTokens, 
//         `${currentUser.firstname} Completed Cleaning`,
//         `${currentUser.firstname} ${currentUser.lastname} has completed the cleaning.`,
//         { screen: ROUTES.host_task_progress, params: { scheduleId } }
//       );
//       Alert.alert("Success", "Cleaning completed successfully!");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [selectedImages, hostTokens, scheduleId, currentUser]);

//   const getRoomProgress = (room) => {
//     if (!selectedImages[room.id]) return 0;
//     const roomData = selectedImages[room.id];
//     const isExtraRoom = room.id === 'Extra';
    
//     const taskProgress = roomData.tasks?.length > 0 
//       ? (roomData.tasks.filter(t => t.value).length / roomData.tasks.length) * (isExtraRoom ? 100 : 50) 
//       : 0;
    
//     // For extra rooms, don't require photos - only tasks matter
//     const photoProgress = isExtraRoom ? 0 : Math.min((roomData.photos?.length || 0 / 3) * 50, 50);
    
//     return taskProgress + photoProgress;
//   };

//   const isRoomComplete = (room) => {
//     if (!selectedImages[room.id]) return false;
//     const roomData = selectedImages[room.id];
    
//     const isExtraRoom = room.id === 'Extra';
//     const tasksComplete = roomData.tasks?.every(task => task.value === true) || false;
//     // For extra rooms, we don't require photos
//     const photosComplete = isExtraRoom ? true : (roomData.photos?.length || 0) >= 3;
    
//     return tasksComplete && photosComplete;
//   };

//   const allRoomsComplete = rooms.every(room => isRoomComplete(room));

//   const markRoomComplete = (roomId) => {
//     Alert.alert(
//       "Mark Room Complete",
//       "Are you sure this room is fully cleaned and all photos are taken?",
//       [
//         { text: "Cancel", style: "cancel" },
//         { 
//           text: "Mark Complete", 
//           onPress: () => {
//             setRooms(prev => prev.map(room => 
//               room.id === roomId ? { ...room, completed: true } : room
//             ));
//             Alert.alert("Success", "Room marked as complete!");
//           }
//         }
//       ]
//     );
//   };

//   const getRoomIcon = (type) => {
//     switch(type.toLowerCase()) {
//       case 'bedroom': return 'bed';
//       case 'bathroom': return 'shower';
//       case 'kitchen': return 'silverware-fork-knife';
//       case 'livingroom': return 'sofa';
//       case 'extra': return 'plus-circle';
//       default: return 'home';
//     }
//   };

//   const onCloseCamera = () => {
//     setCameraVisible(false);
//     setPhotos([]);
//   };

//   // Loading overlay for camera (same as BeforePhoto)
//   const LoadingOverlay = () => (
//     <View style={styles.loadingOverlay}>
//       <ActivityIndicator size="large" color="white" />
//     </View>
//   );

//   // Camera View Component (same pattern as BeforePhoto)
//   const CameraViewComponent = () => {
//     if (isSimulator) {
//       return (
//         <View style={styles.cameraContainer}>
//           <View style={styles.cameraPreviewContainer}>
//             <View style={[styles.camera, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
//               <Ionicons name="laptop-outline" size={64} color="white" />
//               <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, marginTop: 20 }}>
//                 Camera Simulator Mode
//               </Text>
//               <Text style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 10 }}>
//                 You are using a simulator. Camera functionality is limited.
//               </Text>
//               <Text style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 5 }}>
//                 Tap the button to add photos from your library.
//               </Text>
//               <TouchableOpacity 
//                 style={styles.permissionButton}
//                 onPress={pickImageFromLibrary}
//               >
//                 <Text style={styles.permissionButtonText}>Pick Photo from Library</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//           <View style={styles.cameraThumbnailSection}>
//             <View style={styles.thumbnailSectionContent}>
//               {photos.length > 0 ? (
//                 <>
//                   <FlatList
//                     data={photos}
//                     horizontal
//                     keyExtractor={(item, index) => index.toString()}
//                     renderItem={({ item, index }) => (
//                       <View style={styles.thumbnailContainer}>
//                         <Image 
//                           source={{ uri: item.file }} 
//                           style={styles.preview} 
//                           transition={400}
//                           cachePolicy="memory-disk"
//                         />
//                         <TouchableOpacity 
//                           onPress={() => removePhoto(index)} 
//                           style={styles.removeButton}
//                         >
//                           <Ionicons name="trash-outline" size={14} color="white" />
//                         </TouchableOpacity>
//                         <View style={styles.previewNumber}>
//                           <Text style={styles.previewNumberText}>{index + 1}</Text>
//                         </View>
//                       </View>
//                     )}
//                     contentContainerStyle={styles.previewContainer}
//                     showsHorizontalScrollIndicator={false}
//                   />
                  
//                   <TouchableOpacity 
//                     onPress={onSubmit} 
//                     style={styles.uploadButton}
//                     disabled={isUploading}
//                   >
//                     {isUploading ? (
//                       <ActivityIndicator size="small" color="white" />
//                     ) : (
//                       <>
//                         <Ionicons name="cloud-upload-outline" size={22} color="white" />
//                         <View style={styles.uploadButtonTexts}>
//                           <Text style={styles.uploadButtonMain}>
//                             Upload {photos.length} Photo{photos.length !== 1 ? 's' : ''}
//                           </Text>
//                           <Text style={styles.uploadButtonSub}>
//                             These are photos selected from your library
//                           </Text>
//                         </View>
//                       </>
//                     )}
//                   </TouchableOpacity>
//                 </>
//               ) : (
//                 <View style={styles.minimalPlaceholder}>
//                   <Ionicons name="camera-outline" size={48} color={COLORS.lightGray} />
//                   <Text style={styles.minimalPlaceholderText}>
//                     No photos selected yet
//                   </Text>
//                   <Text style={styles.minimalPlaceholderSubtext}>
//                     Tap "Pick Photo from Library" above
//                   </Text>
//                 </View>
//               )}
//             </View>
//           </View>
//         </View>
//       );
//     }

//     if (!permission) {
//       return (
//         <View style={styles.cameraContainer}>
//           <View style={styles.cameraPreviewContainer}>
//             <View style={[styles.camera, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
//               <ActivityIndicator size="large" color="white" />
//               <Text style={{ color: 'white', marginTop: 20 }}>Requesting camera permission...</Text>
//             </View>
//           </View>
//         </View>
//       );
//     }

//     if (!permission.granted) {
//       return (
//         <View style={styles.cameraContainer}>
//           <View style={styles.cameraPreviewContainer}>
//             <View style={[styles.camera, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
//               <Ionicons name="camera-off" size={64} color="white" />
//               <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, marginTop: 20 }}>
//                 Camera access denied
//               </Text>
//               <Text style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 10 }}>
//                 Please enable camera permissions in your device settings to take photos.
//               </Text>
//               <TouchableOpacity 
//                 style={styles.permissionButton}
//                 onPress={pickImageFromLibrary}
//               >
//                 <Ionicons name="images" size={20} color="white" />
//                 <Text style={styles.permissionButtonText}>Pick from Library Instead</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       );
//     }

//     return (
//       <View style={styles.cameraContainer}>
//         {isUploading && <LoadingOverlay />}
        
//         <View style={styles.cameraPreviewContainer}>
//           <CameraView 
//             style={styles.camera}
//             facing={facing}
//             ref={cameraRef}
//             onCameraReady={() => setIsCameraReady(true)}
//           >
//             <TouchableOpacity 
//               style={styles.closeButton} 
//               onPress={onCloseCamera}
//             >
//               <Ionicons name="chevron-down" size={28} color="white" />
//             </TouchableOpacity>
            
//             <View style={styles.cameraControls}>
//               <TouchableOpacity 
//                 style={styles.flipButton}
//                 onPress={flipCamera}
//               >
//                 <Ionicons name="camera-reverse" size={24} color="white" />
//               </TouchableOpacity>
              
//               <TouchableOpacity 
//                 style={styles.captureButton} 
//                 onPress={takePicture}
//                 disabled={photos.length >= MAX_IMAGES_UPLOAD || isUploading}
//               >
//                 <View style={styles.captureButtonInner}>
//                   <Ionicons name="camera" size={32} color="white" />
//                 </View>
//               </TouchableOpacity>
//             </View>

//             <View style={styles.photoCounter}>
//               <Ionicons name="images-outline" size={16} color="white" />
//               <Text style={styles.photoCounterText}>
//                 {photos.length}/{MAX_IMAGES_UPLOAD}
//               </Text>
//             </View>
//           </CameraView>
//         </View>

//         <View style={styles.cameraThumbnailSection}>
//           <View style={styles.thumbnailSectionContent}>
//             {photos.length > 0 ? (
//               <>
//                 <FlatList
//                   data={photos}
//                   horizontal
//                   keyExtractor={(item, index) => index.toString()}
//                   renderItem={({ item, index }) => (
//                     <View style={styles.thumbnailContainer}>
//                       <Image 
//                         source={{ uri: item.file }} 
//                         style={styles.preview} 
//                         transition={400}
//                         cachePolicy="memory-disk"
//                       />
//                       <TouchableOpacity 
//                         onPress={() => removePhoto(index)} 
//                         style={styles.removeButton}
//                       >
//                         <Ionicons name="trash-outline" size={14} color="white" />
//                       </TouchableOpacity>
//                       <View style={styles.previewNumber}>
//                         <Text style={styles.previewNumberText}>{index + 1}</Text>
//                       </View>
//                     </View>
//                   )}
//                   contentContainerStyle={styles.previewContainer}
//                   showsHorizontalScrollIndicator={false}
//                 />
                
//                 <View style={styles.cameraActions}>
//                   <TouchableOpacity 
//                     style={styles.libraryButton}
//                     onPress={pickImageFromLibrary}
//                   >
//                     <Ionicons name="images" size={18} color={COLORS.primary} />
//                     <Text style={styles.libraryButtonText}>Pick from Library</Text>
//                   </TouchableOpacity>
                  
//                   <TouchableOpacity 
//                     onPress={onSubmit} 
//                     style={styles.uploadButton}
//                     disabled={isUploading}
//                   >
//                     {isUploading ? (
//                       <ActivityIndicator size="small" color="white" />
//                     ) : (
//                       <>
//                         <Ionicons name="cloud-upload-outline" size={22} color="white" />
//                         <View style={styles.uploadButtonTexts}>
//                           <Text style={styles.uploadButtonMain}>
//                             Upload {photos.length} Photo{photos.length !== 1 ? 's' : ''}
//                           </Text>
//                           <Text style={styles.uploadButtonSub}>
//                             Tap the camera above to add more photos
//                           </Text>
//                         </View>
//                       </>
//                     )}
//                   </TouchableOpacity>
//                 </View>
//               </>
//             ) : (
//               <View style={styles.minimalPlaceholder}>
//                 <Ionicons name="camera-outline" size={48} color={COLORS.lightGray} />
//                 <Text style={styles.minimalPlaceholderText}>
//                   No photos captured yet
//                 </Text>
//                 <Text style={styles.minimalPlaceholderSubtext}>
//                   Tap the camera button to take photos or pick from library
//                 </Text>
                
//                 <TouchableOpacity 
//                   style={styles.libraryButtonMinimal}
//                   onPress={pickImageFromLibrary}
//                 >
//                   <Ionicons name="images" size={16} color="white" />
//                   <Text style={styles.libraryButtonTextMinimal}>Pick from Library</Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//           </View>
//         </View>
//       </View>
//     );
//   };

//   const RoomCard = ({ room }) => {
//     const progress = getRoomProgress(room);
//     const isComplete = isRoomComplete(room);
//     const roomData = selectedImages[room.id] || {};
    
//     return (
//       <TouchableOpacity 
//         style={[
//           styles.roomCard,
//           selectedRoom?.id === room.id && styles.selectedRoomCard,
//           isComplete && styles.completedRoomCard
//         ]}
//         onPress={() => setSelectedRoom(room)}
//       >
//         <View style={styles.roomCardHeader}>
//           <View style={[
//             styles.roomIcon,
//             isComplete && styles.completedRoomIcon
//           ]}>
//             <MaterialCommunityIcons 
//               name={getRoomIcon(room.type)} 
//               size={24} 
//               color={isComplete ? "#4CAF50" : COLORS.primary} 
//             />
//           </View>
//           <View style={styles.roomInfo}>
//             <Text style={styles.roomName}>{room.name}</Text>
//             <Text style={styles.roomStatus}>
//               {isComplete ? "✓ Complete" : "In Progress"}
//             </Text>
//           </View>
//           <View style={styles.roomStats}>
//             <Text style={styles.roomStat}>
//               📸 {roomData.photos?.length || 0}/{room.isExtra ? 'Optional' : '3'}
//             </Text>
//             <Text style={styles.roomStat}>
//               ✅ {roomData.tasks?.filter(t => t.value).length || 0}/{roomData.tasks?.length || 0}
//             </Text>
//           </View>
//         </View>
        
//         <View style={styles.progressContainer}>
//           <View style={styles.progressBar}>
//             <View 
//               style={[
//                 styles.progressFill, 
//                 { 
//                   width: `${progress}%`, 
//                   backgroundColor: isComplete ? '#4CAF50' : COLORS.primary 
//                 }
//               ]} 
//             />
//           </View>
//           <Text style={styles.progressText}>{Math.round(progress)}% complete</Text>
//         </View>
        
//         <TouchableOpacity 
//           style={[
//             styles.roomActionButton,
//             isComplete ? styles.reviewButton : styles.startButton
//           ]}
//           onPress={() => setSelectedRoom(room)}
//         >
//           <Text style={styles.roomActionButtonText}>
//             {isComplete ? "Review" : "Continue"}
//           </Text>
//           <Ionicons 
//             name={isComplete ? "eye" : "arrow-forward"} 
//             size={16} 
//             color="white" 
//           />
//         </TouchableOpacity>
//       </TouchableOpacity>
//     );
//   };

//   const RoomWorkspace = ({ room, onBack }) => {
//     const roomData = selectedImages[room.id] || {};
//     const isExtraRoom = room.id === 'Extra';
    
//     return (
//       <View style={styles.workspace}>
//         <View style={styles.workspaceHeader}>
//           <TouchableOpacity onPress={onBack} style={styles.backButton}>
//             <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
//           </TouchableOpacity>
//           <View style={styles.roomTitleSection}>
//             <Text style={styles.workspaceRoomTitle}>{room.name}</Text>
//             <Text style={styles.workspaceRoomSubtitle}>
//               {isRoomComplete(room) ? "Completed" : "In Progress"}
//             </Text>
//           </View>
//           <CircularProgress
//             value={getRoomProgress(room)}
//             radius={24}
//             duration={1000}
//             progressValueColor={isRoomComplete(room) ? "#4CAF50" : COLORS.primary}
//             activeStrokeColor={isRoomComplete(room) ? "#4CAF50" : COLORS.primary}
//             activeStrokeWidth={4}
//             inActiveStrokeWidth={4}
//             inActiveStrokeColor="#e0e0e0"
//             maxValue={100}
//           />
//         </View>
        
//         <ScrollView style={styles.workspaceContent} showsVerticalScrollIndicator={false}>
//           {/* Photos Section (for all rooms, but optional for extra rooms) */}
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Ionicons name="camera" size={22} color={COLORS.primary} />
//               <Text style={styles.sectionTitle}>
//                 {isExtraRoom ? "Additional Photos (Optional)" : "After Photos"}
//               </Text>
//               {!isExtraRoom && (
//                 <View style={styles.badge}>
//                   <Text style={styles.badgeText}>
//                     {roomData.photos?.length || 0}/3
//                   </Text>
//                 </View>
//               )}
//             </View>
            
//             <Text style={styles.sectionDescription}>
//               {isExtraRoom 
//                 ? "Take photos of any additional cleaning tasks if needed"
//                 : "Take photos of the same areas as your before photos"}
//             </Text>
            
//             {/* Photo Gallery */}
//             <View style={styles.photoGallery}>
//               <FlatList
//                 data={roomData.photos || []}
//                 horizontal
//                 keyExtractor={(item, index) => `${item.id}_${index}`}
//                 renderItem={({ item, index }) => (
//                   <ThumbnailItem
//                     photo={item}
//                     index={index}
//                     taskTitle={room.id}
//                     photosArray={roomData.photos || []}
//                     onDelete={handleDeletePhoto}
//                     openImageViewer={openImageViewer}
//                     invertPercentage={invertPercentage}
//                     getCleanlinessColor={getCleanlinessColor}
//                   />
//                 )}
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.previewContainer}
//                 ListEmptyComponent={
//                   <View style={styles.emptyPhotos}>
//                     <Ionicons name="camera-outline" size={40} color="#ddd" />
//                     <Text style={styles.emptyPhotosText}>No photos yet</Text>
//                     <Text style={styles.emptyPhotosSubtext}>
//                       {isExtraRoom 
//                         ? "Photos are optional for extra tasks"
//                         : "Tap the button below to add photos"}
//                     </Text>
//                   </View>
//                 }
//               />
//             </View>
            
//             {/* Add Photo Button */}
//             <TouchableOpacity 
//               style={styles.addPhotosButton}
//               onPress={() => openCamera(room.id)}
//             >
//               <View style={styles.addButtonContent}>
//                 <Ionicons name="add-circle" size={24} color="white" />
//                 <View style={styles.addButtonTextContainer}>
//                   <Text style={styles.addButtonMainText}>
//                     {isExtraRoom 
//                       ? "Add Optional Photos"
//                       : roomData.photos?.length >= 3 ? "Add More Photos" : "Take Photos"}
//                   </Text>
//                   <Text style={styles.addButtonSubText}>
//                     {isExtraRoom 
//                       ? "Document any additional cleaning work"
//                       : roomData.photos?.length >= 3 
//                         ? "You can add more photos if needed" 
//                         : `At least 3 photos recommended (${3 - (roomData.photos?.length || 0)} more needed)`}
//                   </Text>
//                 </View>
//               </View>
//             </TouchableOpacity>
//           </View>
          
//           {/* Tasks Section */}
//           <View style={[styles.section, isExtraRoom && styles.extraSection]}>
//             <View style={styles.sectionHeader}>
//               <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
//               <Text style={styles.sectionTitle}>
//                 {isExtraRoom ? "Additional Tasks" : "Cleaning Tasks"}
//               </Text>
//               <View style={styles.badge}>
//                 <Text style={styles.badgeText}>
//                   {roomData.tasks?.filter(t => t.value).length || 0}/{roomData.tasks?.length || 0}
//                 </Text>
//               </View>
//             </View>
            
//             <View style={styles.taskProgress}>
//               <View style={styles.taskProgressBar}>
//                 <View style={[
//                   styles.taskProgressFill, 
//                   { 
//                     width: `${roomData.tasks?.length > 0 
//                       ? (roomData.tasks.filter(t => t.value).length / roomData.tasks.length) * 100 
//                       : 0}%` 
//                   }
//                 ]} />
//               </View>
//               <Text style={styles.taskProgressText}>
//                 {roomData.tasks?.filter(t => t.value).length || 0} of {roomData.tasks?.length || 0} tasks completed
//               </Text>
//             </View>
            
//             {/* Task List */}
//             <View style={styles.taskList}>
//               {roomData.tasks?.map((item, index) => (
//                 <TouchableOpacity
//                   key={`${item.id}_${index}`}
//                   style={[
//                     styles.taskItem,
//                     item.value && styles.taskItemCompleted
//                   ]}
//                   onPress={() => handleTaskToggle(room.id, item.id)}
//                 >
//                   <View style={styles.taskItemLeft}>
//                     <Checkbox.Android
//                       status={item.value ? 'checked' : 'unchecked'}
//                       onPress={() => {}}
//                       color={COLORS.primary}
//                       uncheckedColor="#000"
//                     />
//                     <View style={styles.taskTextContainer}>
//                       <Text style={[
//                         styles.taskLabel,
//                         item.value && styles.taskLabelCompleted
//                       ]}>
//                         {item.label}
//                       </Text>
//                       {(item.time || item.price) && (
//                         <View style={styles.taskMeta}>
//                           {item.time && (
//                             <View style={styles.taskMetaItem}>
//                               <Ionicons name="time-outline" size={12} color="#666" />
//                               <Text style={styles.taskMetaText}>
//                                 {item.time} min{item.time > 1 ? 's' : ''}
//                               </Text>
//                             </View>
//                           )}
//                           {item.price && (
//                             <View style={styles.taskMetaItem}>
//                               <Ionicons name="cash-outline" size={12} color="#4CAF50" />
//                               <Text style={styles.taskMetaText}>
//                                 ${item.price}
//                               </Text>
//                             </View>
//                           )}
//                         </View>
//                       )}
//                     </View>
//                   </View>
                  
//                   {item.value ? (
//                     <View style={styles.completedIndicator}>
//                       <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
//                     </View>
//                   ) : (
//                     <Ionicons name="ellipse-outline" size={20} color="#ddd" />
//                   )}
//                 </TouchableOpacity>
//               ))}
              
//               {(!roomData.tasks || roomData.tasks.length === 0) && (
//                 <View style={styles.noTasksContainer}>
//                   <Ionicons name="list-outline" size={40} color="#ddd" />
//                   <Text style={styles.noTasksText}>No tasks assigned</Text>
//                 </View>
//               )}
//             </View>
//           </View>
          
//           {/* Completion Requirements */}
//           <View style={styles.requirementsSection}>
//             <Text style={styles.requirementsTitle}>To complete this {isExtraRoom ? "section" : "room"}:</Text>
            
//             {!isExtraRoom && (
//               <View style={styles.requirementItem}>
//                 <Ionicons 
//                   name={roomData.photos?.length >= 3 ? "checkmark-circle" : "ellipse-outline"} 
//                   size={20} 
//                   color={roomData.photos?.length >= 3 ? "#4CAF50" : "#666"} 
//                 />
//                 <Text style={[
//                   styles.requirementText,
//                   roomData.photos?.length >= 3 && styles.requirementTextCompleted
//                 ]}>
//                   Minimum 3 photos ({roomData.photos?.length || 0}/3)
//                 </Text>
//               </View>
//             )}
            
//             <View style={styles.requirementItem}>
//               <Ionicons 
//                 name={roomData.tasks?.every(t => t.value) ? "checkmark-circle" : "ellipse-outline"} 
//                 size={20} 
//                 color={roomData.tasks?.every(t => t.value) ? "#4CAF50" : "#666"} 
//               />
//               <Text style={[
//                 styles.requirementText,
//                 roomData.tasks?.every(t => t.value) && styles.requirementTextCompleted
//               ]}>
//                 All tasks completed ({roomData.tasks?.filter(t => t.value).length || 0}/{roomData.tasks?.length || 0})
//               </Text>
//             </View>
//           </View>
//         </ScrollView>
        
//         {/* Completion Button */}
//         <View style={styles.completionSection}>
//           {isRoomComplete(room) ? (
//             room.completed ? (
//               <View style={styles.alreadyCompleted}>
//                 <Ionicons name="checkmark-done-circle" size={24} color="#4CAF50" />
//                 <Text style={styles.alreadyCompletedText}>
//                   {room.name} is already completed
//                 </Text>
//               </View>
//             ) : (
//               <TouchableOpacity 
//                 style={styles.markCompleteButton}
//                 onPress={() => markRoomComplete(room.id)}
//               >
//                 <Ionicons name="checkmark-done" size={24} color="white" />
//                 <View style={styles.markCompleteButtonTexts}>
//                   <Text style={styles.markCompleteButtonMain}>
//                     Mark {room.name} Complete
//                   </Text>
//                   <Text style={styles.markCompleteButtonSub}>
//                     All requirements are met ✓
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             )
//           ) : (
//             <View style={styles.incompleteRequirements}>
//               <Ionicons name="alert-circle" size={24} color="#FF9800" />
//               <View style={styles.incompleteRequirementsTexts}>
//                 <Text style={styles.incompleteRequirementsMain}>
//                   Complete requirements to finish
//                 </Text>
//                 <Text style={styles.incompleteRequirementsSub}>
//                   {!isExtraRoom && roomData.photos?.length < 3 && `${3 - (roomData.photos?.length || 0)} more photos, `}
//                   {roomData.tasks?.filter(t => !t.value).length} more tasks
//                 </Text>
//               </View>
//             </View>
//           )}
//         </View>
//       </View>
//     );
//   };

//   if (cameraVisible) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <CameraViewComponent />
//       </SafeAreaView>
//     );
//   }

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <CustomActivityIndicator size={40} />
//       </View>
//     );
//   }

//   if (selectedRoom) {
//     return (
//       <RoomWorkspace 
//         room={selectedRoom}
//         onBack={() => setSelectedRoom(null)}
//       />
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headline}>After Photos & Tasks</Text>
//         <Text style={styles.subtitle}>
//           Complete rooms in any order. Each room needs 3+ photos (except Extra Tasks) and all tasks checked.
//           {isSimulator && ' (Simulator Mode)'}
//         </Text>
//         {isSimulator && (
//           <View style={styles.simulatorWarning}>
//             <Ionicons name="information-circle" size={16} color={COLORS.warning} />
//             <Text style={styles.simulatorWarningText}>
//               Running on simulator. Using photo library for testing.
//             </Text>
//           </View>
//         )}

//         <View style={styles.minimalProgressRow}>
//           <View style={styles.minimalProgressLeft}>
//             <Text style={styles.minimalProgressTitle}>Progress</Text>
//             <View style={styles.minimalProgressBar}>
//               <View 
//                 style={[
//                   styles.minimalProgressFill, 
//                   { 
//                     width: `${(rooms.filter(r => isRoomComplete(r)).length / Math.max(rooms.length, 1)) * 100}%`,
//                     backgroundColor: COLORS.primary
//                   }
//                 ]} 
//               />
//             </View>
//           </View>
          
//           <View style={styles.minimalProgressRight}>
//             <Text style={styles.minimalProgressPercentage}>
//               {Math.round((rooms.filter(r => isRoomComplete(r)).length / Math.max(rooms.length, 1)) * 100)}%
//             </Text>
//             <Text style={styles.minimalProgressText}>
//               {rooms.filter(r => isRoomComplete(r)).length}/{rooms.length} rooms
//             </Text>
//           </View>
//         </View>

//       </View>
      
//       <Text style={styles.sectionTitle}>All Rooms</Text>
//       <ScrollView style={styles.roomsContainer}>
//         {rooms.length > 0 ? (
//           rooms.map(room => (
//             <RoomCard key={room.id} room={room} />
//           ))
//         ) : (
//           <View style={styles.noRoomsContainer}>
//             <Ionicons name="home-outline" size={48} color={COLORS.gray} />
//             <Text style={styles.noRoomsText}>No rooms assigned</Text>
//           </View>
//         )}
//       </ScrollView>
      
//       <TouchableOpacity 
//         style={[
//           styles.finishButton,
//           !allRoomsComplete && styles.disabledFinishButton
//         ]}
//         onPress={submitCompletion}
//         disabled={!allRoomsComplete}
//       >
//         <Ionicons name="checkmark-done-circle" size={24} color="white" />
//         <View style={styles.finishButtonTexts}>
//           <Text style={styles.finishButtonMain}>
//             {allRoomsComplete ? "Finish Cleaning" : "Complete All Rooms First"}
//           </Text>
//           <Text style={styles.finishButtonSub}>
//             {allRoomsComplete 
//               ? "All rooms are complete!" 
//               : `${rooms.filter(r => !isRoomComplete(r)).length} room(s) remaining`}
//           </Text>
//         </View>
//         <Ionicons name="chevron-forward" size={20} color="white" />
//       </TouchableOpacity>

//       <Modal isVisible={isBeforeModalVisible} style={styles.fullScreenModal}>
//         <View style={styles.modalContainer}>
//           <ImageViewer
//             imageUrls={currentImages}
//             index={currentImageIndex}
//             backgroundColor="black"
//             enableSwipeDown
//             enableImageZoom
//             onSwipeDown={() => setBeforeModalVisible(false)}
//             renderImage={(props) => (
//               <Image source={props.source} style={styles.fullSizeImage} contentFit="contain" />
//             )}
//           />
          
//           {currentImages[currentImageIndex]?.cleanliness && (
//             <Animated.View style={[styles.analysisPanel, { transform: [{ translateY: pan.y }] }]} {...panResponder.panHandlers}>
//               <View style={styles.dragHandle} />
//               <View style={styles.analysisContent}>
//                 <Text style={styles.analysisTitle}>CLEANLINESS ANALYSIS</Text>
                
//                 <View style={styles.scoreSection}>
//                   <Text style={styles.sectionTitle}>THIS PHOTO</Text>
//                   <View style={styles.scoreRow}>
//                     <View style={styles.scoreText}>
//                       <Text style={styles.scorePercentage}>
//                         {invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0).toFixed(0)}%
//                       </Text>
//                       <Text style={styles.scoreLabel}>
//                         {getCleanlinessLabel(invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0))}
//                       </Text>
//                     </View>
//                     <CircularProgress
//                       value={invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0)}
//                       radius={35}
//                       activeStrokeColor={getCleanlinessColor(invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0))}
//                       inActiveStrokeColor="#2d2d2d"
//                       maxValue={100}
//                     />
//                   </View>
//                 </View>

//                 <Text style={styles.sectionTitle}>MAIN ISSUES</Text>
//                 <View style={styles.issuesList}>
//                   {Object.entries(currentImages[currentImageIndex].cleanliness.scores || {})
//                     .sort(([,a], [,b]) => b - a)
//                     .slice(0, 3)
//                     .map(([factor, score]) => (
//                       <View key={factor} style={styles.issueItem}>
//                         <Text style={styles.issueName}>{factor.replace(/_/g, ' ').toUpperCase()}</Text>
//                         <Text style={[styles.issueScore, { color: getCleanlinessColor(100 - (score * 10)) }]}>
//                           {(100 - (score * 10)).toFixed(0)}%
//                         </Text>
//                       </View>
//                     ))}
//                 </View>
//               </View>
//             </Animated.View>
//           )}

//           <TouchableOpacity style={styles.modalCloseButton} onPress={() => setBeforeModalVisible(false)}>
//             <Ionicons name="close" size={24} color="white" />
//           </TouchableOpacity>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// // Add these missing styles to your existing styles object:
// const styles = StyleSheet.create({
//   // ... (keep all your existing styles)

//   container: {
//         flex: 1,
//         backgroundColor: '#f8f9fa',
//       },
//       header: {
//         padding: 20,
//         backgroundColor: 'white',
//         borderBottomWidth: 1,
//         borderBottomColor: '#f0f0f0',
//       },
//       headline: {
//         fontSize: 24,
//         fontWeight: '700',
//         color: '#1a1a1a',
//         marginBottom: 4,
//       },
//       subtitle: {
//         fontSize: 14,
//         color: '#666',
//         lineHeight: 20,
//       },
//       simulatorWarning: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#fff3cd',
//         paddingHorizontal: 12,
//         paddingVertical: 8,
//         borderRadius: 8,
//         marginTop: 10,
//       },
//       simulatorWarningText: {
//         fontSize: 14,
//         color: '#856404',
//         marginLeft: 8,
//         fontWeight: '500',
//       },
//       progressCard: {
//         margin: 16,
//         padding: 20,
//       },
//       progressHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 20,
//       },
//       progressTitle: {
//         fontSize: 18,
//         fontWeight: '600',
//         color: '#1a1a1a',
//       },
//       progressStats: {
//         flexDirection: 'row',
//         justifyContent: 'space-around',
//       },
//       stat: {
//         alignItems: 'center',
//       },
//       statNumber: {
//         fontSize: 24,
//         fontWeight: '700',
//         color: COLORS.primary,
//       },
//       statLabel: {
//         fontSize: 12,
//         color: '#666',
//         marginTop: 4,
//       },
//       statDivider: {
//         width: 1,
//         backgroundColor: '#e0e0e0',
//       },
//       sectionTitle: {
//         fontSize: 18,
//         fontWeight: '600',
//         color: '#1a1a1a',
//         marginHorizontal: 16,
//         marginBottom: 12,
//       },
//       roomsContainer: {
//         flex: 1,
//         paddingHorizontal: 16,
//       },
//       roomCard: {
//         backgroundColor: 'white',
//         borderRadius: 12,
//         padding: 16,
//         marginBottom: 12,
//         borderWidth: 2,
//         borderColor: 'transparent',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.05,
//         shadowRadius: 4,
//         elevation: 2,
//       },
//       selectedRoomCard: {
//         borderColor: COLORS.primary,
//         backgroundColor: '#f8fbff',
//       },
//       completedRoomCard: {
//         borderColor: '#d4edda',
//         backgroundColor: '#f0f9f0',
//       },
//       roomCardHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 12,
//       },
//       roomIcon: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         backgroundColor: '#e3f2fd',
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginRight: 12,
//       },
//       completedRoomIcon: {
//         backgroundColor: '#e8f5e8',
//       },
//       roomInfo: {
//         flex: 1,
//       },
//       roomName: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: '#1a1a1a',
//       },
//       roomStatus: {
//         fontSize: 12,
//         color: '#666',
//         marginTop: 2,
//       },
//       roomStats: {
//         alignItems: 'flex-end',
//       },
//       roomStat: {
//         fontSize: 12,
//         color: '#666',
//       },
//       progressContainer: {
//         marginBottom: 16,
//       },
//       progressBar: {
//         height: 6,
//         backgroundColor: '#e0e0e0',
//         borderRadius: 3,
//         marginBottom: 8,
//       },
//       progressFill: {
//         height: '100%',
//         borderRadius: 3,
//       },
//       progressText: {
//         fontSize: 12,
//         color: '#666',
//         textAlign: 'right',
//       },
//       roomActionButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingVertical: 10,
//         borderRadius: 8,
//       },
//       startButton: {
//         backgroundColor: COLORS.primary,
//       },
//       reviewButton: {
//         backgroundColor: '#4CAF50',
//       },
//       roomActionButtonText: {
//         color: 'white',
//         fontSize: 14,
//         fontWeight: '600',
//         marginRight: 8,
//       },
//       finishButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: COLORS.primary,
//         margin: 16,
//         padding: 18,
//         borderRadius: 12,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 3,
//       },
//       disabledFinishButton: {
//         backgroundColor: '#ccc',
//       },
//       finishButtonTexts: {
//         flex: 1,
//         marginLeft: 12,
//       },
//       finishButtonMain: {
//         color: 'white',
//         fontSize: 16,
//         fontWeight: '600',
//       },
//       finishButtonSub: {
//         color: 'rgba(255,255,255,0.8)',
//         fontSize: 12,
//         marginTop: 2,
//       },
//       workspace: {
//         flex: 1,
//         backgroundColor: '#f8f9fa',
//       },
//       workspaceHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: 'white',
//         padding: 16,
//         borderBottomWidth: 1,
//         borderBottomColor: '#f0f0f0',
//       },
//       backButton: {
//         marginRight: 12,
//       },
//       roomTitleSection: {
//         flex: 1,
//       },
//       workspaceRoomTitle: {
//         fontSize: 20,
//         fontWeight: '700',
//         color: '#1a1a1a',
//       },
//       workspaceRoomSubtitle: {
//         fontSize: 14,
//         color: '#666',
//         marginTop: 2,
//       },
//       workspaceContent: {
//         flex: 1,
//         padding: 16,
//       },
//       section: {
//         backgroundColor: 'white',
//         borderRadius: 12,
//         padding: 16,
//         marginBottom: 16,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.05,
//         shadowRadius: 3,
//         elevation: 2,
//       },
//       extraSection: {
//         marginTop: 16,
//       },
//       sectionHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 12,
//       },
//       badge: {
//         marginLeft: 'auto',
//         backgroundColor: '#e3f2fd',
//         paddingHorizontal: 10,
//         paddingVertical: 4,
//         borderRadius: 12,
//       },
//       badgeText: {
//         fontSize: 12,
//         fontWeight: '600',
//         color: COLORS.primary,
//       },
//       photoGallery: {
//         marginBottom: 16,
//       },
//       addPhotosButton: {
//         backgroundColor: COLORS.primary,
//         borderRadius: 8,
//         padding: 16,
//       },
//       addButtonContent: {
//         flexDirection: 'row',
//         alignItems: 'center',
//       },
//       addButtonTextContainer: {
//         marginLeft: 12,
//         flex: 1,
//       },
//       addButtonMainText: {
//         color: 'white',
//         fontSize: 16,
//         fontWeight: '600',
//         marginBottom: 2,
//       },
//       addButtonSubText: {
//         color: 'rgba(255,255,255,0.8)',
//         fontSize: 12,
//       },
//       taskProgress: {
//         marginBottom: 16,
//       },
//       taskProgressBar: {
//         height: 6,
//         backgroundColor: '#e0e0e0',
//         borderRadius: 3,
//         marginBottom: 8,
//       },
//       taskProgressFill: {
//         height: '100%',
//         backgroundColor: COLORS.primary,
//         borderRadius: 3,
//       },
//       taskProgressText: {
//         fontSize: 12,
//         color: '#666',
//         textAlign: 'center',
//       },
//       taskList: {
//         marginBottom: 8,
//       },
//       taskItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingVertical: 12,
//         borderBottomWidth: 1,
//         borderBottomColor: '#f0f0f0',
//       },
//       taskItemCompleted: {
//         backgroundColor: '#f9f9f9',
//       },
//       taskItemLeft: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         flex: 1,
//       },
//       taskTextContainer: {
//         marginLeft: 12,
//         flex: 1,
//       },
//       taskLabel: {
//         fontSize: 15,
//         fontWeight: '500',
//         color: '#1a1a1a',
//       },
//       taskLabelCompleted: {
//         color: '#666',
//         textDecorationLine: 'line-through',
//       },
//       taskMeta: {
//         flexDirection: 'row',
//         marginTop: 4,
//         gap: 12,
//       },
//       taskMetaItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//       },
//       taskMetaText: {
//         fontSize: 12,
//         color: '#666',
//         marginLeft: 4,
//       },
//       completedIndicator: {
//         marginLeft: 8,
//       },
//       noTasksContainer: {
//         alignItems: 'center',
//         padding: 20,
//       },
//       noTasksText: {
//         fontSize: 14,
//         color: '#999',
//         marginTop: 8,
//       },
//       requirementsSection: {
//         backgroundColor: 'white',
//         borderRadius: 12,
//         padding: 16,
//         marginBottom: 16,
//         borderWidth: 1,
//         borderColor: '#f0f0f0',
//       },
//       requirementsTitle: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: '#1a1a1a',
//         marginBottom: 12,
//       },
//       requirementItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 8,
//       },
//       requirementText: {
//         fontSize: 14,
//         color: '#666',
//         marginLeft: 8,
//       },
//       requirementTextCompleted: {
//         color: '#4CAF50',
//       },
//       completionSection: {
//         padding: 16,
//         backgroundColor: 'white',
//         borderTopWidth: 1,
//         borderTopColor: '#f0f0f0',
//       },
//       markCompleteButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#4CAF50',
//         paddingVertical: 16,
//         paddingHorizontal: 20,
//         borderRadius: 8,
//       },
//       markCompleteButtonTexts: {
//         marginLeft: 12,
//         flex: 1,
//       },
//       markCompleteButtonMain: {
//         color: 'white',
//         fontSize: 16,
//         fontWeight: '600',
//       },
//       markCompleteButtonSub: {
//         color: 'rgba(255,255,255,0.8)',
//         fontSize: 12,
//         marginTop: 2,
//       },
//       alreadyCompleted: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingVertical: 16,
//       },
//       alreadyCompletedText: {
//         fontSize: 16,
//         color: '#4CAF50',
//         fontWeight: '600',
//         marginLeft: 8,
//       },
//       incompleteRequirements: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingVertical: 16,
//       },
//       incompleteRequirementsTexts: {
//         marginLeft: 12,
//         flex: 1,
//       },
//       incompleteRequirementsMain: {
//         fontSize: 16,
//         color: '#FF9800',
//         fontWeight: '600',
//       },
//       incompleteRequirementsSub: {
//         fontSize: 12,
//         color: '#666',
//         marginTop: 2,
//       },
//       cameraContainer: {
//         flex: 1,
//       },
//       camera: {
//         flex: 1,
//       },
//       closeButton: {
//         position: 'absolute',
//         top: 50,
//         right: 20,
//         zIndex: 10,
//       },
//       cameraControls: {
//         position: 'absolute',
//         bottom: 200,
//         alignSelf: 'center',
//       },
//       captureButton: {
//         alignItems: 'center',
//         justifyContent: 'center',
//       },
//       captureButtonInner: {
//         width: 70,
//         height: 70,
//         borderRadius: 35,
//         backgroundColor: 'rgba(255,255,255,0.3)',
//         justifyContent: 'center',
//         alignItems: 'center',
//         borderWidth: 3,
//         borderColor: 'white',
//       },
//       photoCounter: {
//         position: 'absolute',
//         top: 100,
//         alignSelf: 'center',
//         backgroundColor: 'rgba(0,0,0,0.7)',
//         paddingHorizontal: 12,
//         paddingVertical: 6,
//         borderRadius: 16,
//       },
//       photoCounterText: {
//         color: 'white',
//         fontSize: 14,
//         fontWeight: '600',
//       },
//       previewSection: {
//         position: 'absolute',
//         bottom: 0,
//         left: 0,
//         right: 0,
//         backgroundColor: 'rgba(0,0,0,0.9)',
//         padding: 16,
//       },
//       previewTitle: {
//         color: 'white',
//         fontSize: 16,
//         fontWeight: '600',
//         marginBottom: 12,
//       },
//       cameraActions: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginTop: 12,
//       },
//       continueButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: 'white',
//         paddingHorizontal: 16,
//         paddingVertical: 10,
//         borderRadius: 20,
//         flex: 1,
//         marginRight: 8,
//         justifyContent: 'center',
//       },
//       continueButtonText: {
//         color: COLORS.primary,
//         fontSize: 14,
//         fontWeight: '600',
//         marginLeft: 8,
//       },
//       saveButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: COLORS.primary,
//         paddingHorizontal: 16,
//         paddingVertical: 10,
//         borderRadius: 20,
//         flex: 2,
//         marginLeft: 8,
//       },
//       saveButtonText: {
//         color: 'white',
//         fontSize: 14,
//         fontWeight: '600',
//         marginLeft: 8,
//       },
//       thumbnailContainer: {
//         marginRight: 12,
//         marginBottom: 0,
//         position: 'relative',
//       },
//       preview: {
//         width: 100,
//         height: 100,
//         borderRadius: 12,
//         backgroundColor: '#f0f0f0', // Light gray background for thumbnails
//       },
//       deleteButton: {
//         position: 'absolute',
//         top: 8,
//         right: 8,
//         backgroundColor: 'rgba(0,0,0,0.6)',
//         padding: 4,
//         borderRadius: 10,
//       },
//       warningBadge: {
//         position: 'absolute',
//         top: 8,
//         left: 8,
//         backgroundColor: '#e74c3c',
//         padding: 4,
//         borderRadius: 10,
//       },
//       photoNumber: {
//         position: 'absolute',
//         top: 8,
//         left: 8,
//         backgroundColor: 'rgba(0,0,0,0.7)',
//         paddingHorizontal: 6,
//         paddingVertical: 2,
//         borderRadius: 10,
//       },
//       photoNumberText: {
//         color: 'white',
//         fontSize: 10,
//         fontWeight: '600',
//       },
//       removeButton: {
//         position: 'absolute',
//         top: 4,
//         right: 4,
//         backgroundColor: 'rgba(0,0,0,0.6)',
//         borderRadius: 12,
//         padding: 4,
//       },
//       previewNumber: {
//         position: 'absolute',
//         top: 4,
//         left: 4,
//         backgroundColor: 'rgba(0,0,0,0.7)',
//         paddingHorizontal: 6,
//         paddingVertical: 2,
//         borderRadius: 10,
//       },
//       previewNumberText: {
//         color: 'white',
//         fontSize: 10,
//         fontWeight: '600',
//       },
//       emptyPhotos: {
//         width: 100,
//         height: 100,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#f8f9fa',
//         borderRadius: 12,
//         borderWidth: 1,
//         borderColor: '#e0e0e0',
//         borderStyle: 'dashed',
//       },
//       emptyPhotosText: {
//         fontSize: 12,
//         color: '#999',
//         marginTop: 4,
//       },
//       emptyPhotosSubtext: {
//         fontSize: 12,
//         color: '#999',
//         marginTop: 4,
//         textAlign: 'center',
//       },
//       fullScreenModal: {
//         margin: 0,
//       },
//       modalContainer: {
//         flex: 1,
//         backgroundColor: 'black',
//       },
//       fullSizeImage: {
//         width: '100%',
//         height: '100%',
//       },
//       modalCloseButton: {
//         position: 'absolute',
//         top: 50,
//         right: 20,
//         backgroundColor: 'rgba(0,0,0,0.5)',
//         borderRadius: 20,
//         padding: 8,
//       },
//       analysisPanel: {
//         position: 'absolute',
//         bottom: 0,
//         left: 0,
//         right: 0,
//         backgroundColor: 'rgba(0,0,0,0.9)',
//         borderTopLeftRadius: 20,
//         borderTopRightRadius: 20,
//         padding: 20,
//         paddingBottom: 40,
//       },
//       dragHandle: {
//         width: 40,
//         height: 4,
//         backgroundColor: 'rgba(255,255,255,0.4)',
//         borderRadius: 2,
//         alignSelf: 'center',
//         marginBottom: 16,
//       },
//       analysisContent: {
//         maxHeight: 400,
//       },
//       analysisTitle: {
//         color: 'white',
//         fontSize: 18,
//         fontWeight: '700',
//         textAlign: 'center',
//         marginBottom: 20,
//         letterSpacing: 0.5,
//       },
//       scoreSection: {
//         marginBottom: 20,
//       },
//       scoreRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//       },
//       scoreText: {
//         flex: 1,
//       },
//       scorePercentage: {
//         color: 'white',
//         fontSize: 32,
//         fontWeight: '700',
//         marginBottom: 4,
//       },
//       scoreLabel: {
//         color: 'white',
//         fontSize: 16,
//         fontWeight: '600',
//         opacity: 0.9,
//       },
//       issuesList: {
//         backgroundColor: 'rgba(255,255,255,0.05)',
//         borderRadius: 12,
//         padding: 8,
//       },
//       issueItem: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingVertical: 10,
//         borderBottomWidth: 1,
//         borderBottomColor: 'rgba(255,255,255,0.1)',
//       },
//       issueName: {
//         color: 'white',
//         fontSize: 14,
//         flex: 2,
//         opacity: 0.9,
//       },
//       issueScore: {
//         fontSize: 14,
//         fontWeight: '600',
//         flex: 1,
//         textAlign: 'right',
//       },
//       loadingContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//       },
//       noRoomsContainer: {
//         alignItems: 'center',
//         padding: 40,
//         marginTop: 20,
//       },
//       noRoomsText: {
//         fontSize: 16,
//         color: COLORS.gray,
//         marginTop: 12,
//       },
//       previewContainer: {
//         paddingVertical: 8,
//       },
    
//       cameraContainer: {
//         flex: 1,
//         backgroundColor: COLORS.white,
//       },
//       cameraPreviewContainer: {
//         height: 400, // Fixed height for camera preview
//         backgroundColor: '#000',
//         borderBottomLeftRadius: 24,
//         borderBottomRightRadius: 24,
//         overflow: 'hidden',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.15,
//         shadowRadius: 8,
//         elevation: 8,
//         position: 'relative',
//       },
//       cameraThumbnailSection: {
//         flex: 1,
//         backgroundColor: COLORS.white,
//       },
//       thumbnailSectionContent: {
//         paddingHorizontal: 16,
//         paddingTop: 0,
//       },
//       thumbnailSectionHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 16,
//       },
//       thumbnailSectionTitle: {
//         fontSize: 18,
//         fontWeight: '700',
//         color: '#1a1a1a',
//       },
//       photoCountBadge: {
//         backgroundColor: '#e3f2fd',
//         paddingHorizontal: 10,
//         paddingVertical: 4,
//         borderRadius: 12,
//       },
//       photoCountText: {
//         fontSize: 12,
//         fontWeight: '600',
//         color: COLORS.primary,
//       },
    
//       cameraThumbnailSection: {
//         flex: 1,
//         backgroundColor: COLORS.white,
//       },
//       thumbnailSectionContent: {
//         paddingHorizontal: 16,
//         paddingTop: 0,
//         flex: 1,
//       },
//       thumbnailSectionHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 16,
//       },
//       thumbnailSectionTitle: {
//         fontSize: 18,
//         fontWeight: '700',
//         color: '#1a1a1a',
//       },
//       photoCountBadge: {
//         backgroundColor: '#e3f2fd',
//         paddingHorizontal: 10,
//         paddingVertical: 4,
//         borderRadius: 12,
//       },
//       photoCountText: {
//         fontSize: 12,
//         fontWeight: '600',
//         color: COLORS.primary,
//       },
      
//       minimalPlaceholder: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         minHeight: 200, // Ensure it's visible without scrolling
//       },
//       minimalPlaceholderText: {
//         fontSize: 16,
//         color: COLORS.gray,
//         marginTop: 12,
//         fontWeight: '500',
//         textAlign: 'center',
//       },
//       minimalPlaceholderSubtext: {
//         fontSize: 14,
//         color: COLORS.lightGray,
//         marginTop: 4,
//         textAlign: 'center',
//       },
      
//       uploadButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: COLORS.primary,
//         paddingVertical: 16,
//         paddingHorizontal: 20,
//         borderRadius: 12,
//         marginTop: 20,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 3,
//       },
//       uploadButtonTexts: {
//         marginLeft: 12,
//         flex: 1,
//       },
//       uploadButtonMain: {
//         color: 'white',
//         fontSize: 16,
//         fontWeight: '600',
//       },
//       uploadButtonSub: {
//         color: 'rgba(255,255,255,0.8)',
//         fontSize: 12,
//         marginTop: 2,
//       },
    
//       minimalProgressCard: {
//         marginBottom: 12,
//         paddingVertical: 14,
//         paddingHorizontal: 16,
//       },
//       minimalProgressRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         marginTop:16
//       },
//       minimalProgressLeft: {
//         flex: 1,
//         marginRight: 12,
//       },
//       minimalProgressTitle: {
//         fontSize: 14,
//         fontWeight: '600',
//         color: COLORS.dark,
//         marginBottom: 6,
//       },
//       minimalProgressBar: {
//         height: 4,
//         backgroundColor: '#e8e8e8',
//         borderRadius: 2,
//         overflow: 'hidden',
//       },
//       minimalProgressFill: {
//         height: '100%',
//         borderRadius: 2,
//       },
//       minimalProgressRight: {
//         alignItems: 'flex-end',
//       },
//       minimalProgressPercentage: {
//         fontSize: 18,
//         fontWeight: '700',
//         color: COLORS.primary,
//         marginBottom: 2,
//       },
//       minimalProgressText: {
//         fontSize: 12,
//         color: '#666',
//       },
//       permissionButton: {
//         backgroundColor: COLORS.primary,
//         paddingHorizontal: 20,
//         paddingVertical: 12,
//         borderRadius: 8,
//         marginTop: 20,
//       },
//       permissionButtonText: {
//         color: 'white',
//         fontWeight: '600',
//         fontSize: 16,
//       },
//       loadingOverlay: {
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         backgroundColor: 'rgba(0,0,0,0.7)',
//         justifyContent: 'center',
//         alignItems: 'center',
//         zIndex: 100,
//       },
//   // Add these new styles from BeforePhoto:
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 100,
//   },
  
//   cameraContainer: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//   },
//   cameraPreviewContainer: {
//     height: 400,
//     backgroundColor: '#000',
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//     elevation: 8,
//     position: 'relative',
//   },
//   camera: {
//     flex: 1,
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 50,
//     right: 20,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     borderRadius: 20,
//     padding: 8,
//     zIndex: 10,
//   },
//   cameraControls: {
//     position: 'absolute',
//     bottom: 40,
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   flipButton: {
//     position: 'absolute',
//     left: 20,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     borderRadius: 20,
//     padding: 10,
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
//     top: 100,
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
//     flex: 1,
//     backgroundColor: COLORS.white,
//     paddingTop: 16,
//   },
//   thumbnailSectionContent: {
//     paddingHorizontal: 16,
//     flex: 1,
//   },
//   minimalPlaceholder: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     minHeight: 200,
//   },
//   minimalPlaceholderText: {
//     fontSize: 16,
//     color: COLORS.gray,
//     marginTop: 12,
//     fontWeight: '500',
//     textAlign: 'center',
//   },
//   minimalPlaceholderSubtext: {
//     fontSize: 14,
//     color: COLORS.lightGray,
//     marginTop: 4,
//     textAlign: 'center',
//     marginBottom: 16,
//   },
//   cameraActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 16,
//     gap: 12,
//   },
//   libraryButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f0f8ff',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#e0f0ff',
//     flex: 1,
//   },
//   libraryButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginLeft: 8,
//   },
//   libraryButtonMinimal: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(59, 130, 246, 0.8)',
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 8,
//     marginTop: 12,
//   },
//   libraryButtonTextMinimal: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: 'white',
//     marginLeft: 8,
//   },
//   uploadButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary,
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     borderRadius: 12,
//     flex: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   uploadButtonTexts: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   uploadButtonMain: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   uploadButtonSub: {
//     color: 'rgba(255,255,255,0.8)',
//     fontSize: 12,
//     marginTop: 2,
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
//   previewContainer: { 
//     flexDirection: 'row',
//     paddingHorizontal: 5,
//     paddingVertical: 8,
//   },
//   permissionButton: {
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 8,
//     marginTop: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   permissionButtonText: {
//     color: 'white',
//     fontWeight: '600',
//     fontSize: 16,
//     marginLeft: 8,
//   },
  
//   // Ensure these existing styles are present:
//   thumbnailContainer: { 
//     marginRight: 12,
//     marginBottom: 0,
//     position: 'relative',
//   },
//   preview: {
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
//   warningBadge: {
//     position: 'absolute',
//     top: 8,
//     left: 8,
//     backgroundColor: '#e74c3c',
//     padding: 4,
//     borderRadius: 10,
//   },
// });

// export default AfterPhoto;



// import React, { useEffect, useContext, useCallback, useState, useRef } from 'react';
// import { 
//   View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, 
//   FlatList, ScrollView, Dimensions, Animated, PanResponder, SafeAreaView,
//   Platform,
//   Linking,
// } from 'react-native';
// import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'; 
// import COLORS from '../../../constants/colors';
// import userService from '../../../services/connection/userService';
// import { AuthContext } from '../../../context/AuthContext';
// import { useFocusEffect } from '@react-navigation/native';
// import CardNoPrimary from '../../../components/shared/CardNoPrimary';
// import { Checkbox } from 'react-native-paper';
// import ImageViewer from 'react-native-image-zoom-viewer';
// import Modal from 'react-native-modal';
// import { sendPushNotifications } from '../../../utils/sendPushNotification';
// import ROUTES from '../../../constants/routes';
// import CircularProgress from 'react-native-circular-progress-indicator';
// import { Image } from 'expo-image'; 
// import CustomActivityIndicator from '../../../components/shared/CuustomActivityIndicator';
// import formatRoomTitle from '../../../utils/formatRoomTitle';
// import Constants from 'expo-constants';

// // Import expo-camera with CameraView (new API)
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import * as ImagePicker from 'expo-image-picker';

// const { width, height } = Dimensions.get('window');

// // Base64 encoded 1x1 pixel transparent image for simulation
// const SIMULATED_BASE64_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// const ThumbnailItem = React.memo(({ 
//   photo, 
//   index, 
//   openImageViewer, 
//   taskTitle,
//   invertPercentage, 
//   getCleanlinessColor, 
//   photosArray,
//   onDelete
// }) => {
//   const photoScore = invertPercentage(photo.cleanliness?.individual_overall || 0);
//   const isProblemPhoto = photoScore < 35;
//   const fadeAnim = useRef(new Animated.Value(1)).current;

//   const handleDelete = () => {
//     Alert.alert(
//       "Delete Photo",
//       "Are you sure you want to permanently delete this photo?",
//       [
//         { text: "Cancel", style: "cancel" },
//         { 
//           text: "Delete", 
//           onPress: () => {
//             Animated.timing(fadeAnim, {
//               toValue: 0,
//               duration: 300,
//               useNativeDriver: true
//             }).start(() => onDelete(index, taskTitle));
//           }
//         }
//       ]
//     );
//   };

//   return (
//     <Animated.View style={{ opacity: fadeAnim }}>
//       <TouchableOpacity
//         onPress={() => openImageViewer(photosArray, index, taskTitle)}
//         style={styles.thumbnailContainer}
//       >
//         <Image
//           source={{ uri: photo.img_url }}
//           style={styles.preview}
//           cachePolicy="memory-disk"
//           transition={300}
//         />
//         <TouchableOpacity 
//           onPress={handleDelete}
//           style={styles.deleteButton}
//         >
//           <Ionicons name="trash-outline" size={16} color="white" />
//         </TouchableOpacity>
//         {isProblemPhoto && (
//           <View style={styles.warningBadge}>
//             <MaterialIcons name="warning" size={14} color="#fff" />
//           </View>
//         )}
//         <View style={styles.photoNumber}>
//           <Text style={styles.photoNumberText}>{index + 1}</Text>
//         </View>
//       </TouchableOpacity>
//     </Animated.View>
//   );
// });

// const AfterPhoto = ({ scheduleId, hostId }) => {
//   const { currentUserId, currentUser } = useContext(AuthContext);
//   const cameraRef = useRef(null);
//   const MAX_IMAGES_UPLOAD = 10;
  
//   // Check if running on simulator
//   const isSimulator = !Constants.isDevice;
  
//   const [tasks, setTasks] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedImages, setSelectedImages] = useState({});
//   const [isUploading, setIsUploading] = useState(false);
//   const [photos, setPhotos] = useState([]);
//   const [cleaning_fee, setFee] = useState(0);
//   const [cameraVisible, setCameraVisible] = useState(false);
//   const [isBeforeModalVisible, setBeforeModalVisible] = useState(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [currentImages, setCurrentImages] = useState([]);
//   const [hostTokens, setHostPushToken] = useState([]);
//   const [selectedTaskTitle, setSelectedTaskTitle] = useState('');
//   const [selectedRoom, setSelectedRoom] = useState(null);
//   const [rooms, setRooms] = useState([]);
  
//   // Updated camera states using CameraView API (same as BeforePhoto)
//   const [permission, requestPermission] = useCameraPermissions();
//   const [facing, setFacing] = useState('back');
//   const [isCameraReady, setIsCameraReady] = useState(false);

//   const pan = useRef(new Animated.ValueXY()).current;
//   const overlayOpacity = useRef(new Animated.Value(1)).current;

//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => true,
//       onPanResponderMove: Animated.event([null, { dy: pan.y }], { useNativeDriver: false }),
//       onPanResponderRelease: (e, gesture) => {
//         if (gesture.dy > 50) {
//           Animated.timing(pan, { toValue: { x: 0, y: 300 }, duration: 300, useNativeDriver: true }).start();
//           Animated.timing(overlayOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
//         } else {
//           Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
//           Animated.spring(overlayOpacity, { toValue: 1, useNativeDriver: true }).start();
//         }
//       }
//     })
//   ).current;

//   // Request camera and media library permissions (same as BeforePhoto)
//   useEffect(() => {
//     (async () => {
//       try {
//         // Request camera permissions
//         if (permission && !permission.granted) {
//           await requestPermission();
//         }
        
//         // Request media library permissions for image picker
//         const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//         if (mediaStatus !== 'granted') {
//           console.log('Media library permission denied');
//         }
//       } catch (error) {
//         console.log('Permission request error:', error);
//       }
//     })();
//   }, [permission, requestPermission]);

//   const invertPercentage = (score) => 100 - (score * 10);

//   const getCleanlinessLabel = (invertedScore) => {
//     if (invertedScore <= 35) return 'Needs Deep Cleaning';
//     if (invertedScore <= 40) return 'Requires Attention';
//     return 'Very Clean';
//   };
  
//   const getCleanlinessColor = (invertedScore) => {
//     if (invertedScore <= 35) return '#e74c3c';
//     if (invertedScore <= 40) return '#f1c40f';
//     return '#2ecc71';
//   };

//   const fetchImages = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const response = await userService.getUpdatedImageUrls(scheduleId);
//       const res = response.data.data;
//       const getCleanerById = (id) => res.assignedTo.find(cleaner => cleaner.cleanerId === id);
//       const cl = getCleanerById(currentUserId);
      
//       if (cl?.checklist?.details) {
//         const details = cl.checklist.details;
//         setSelectedImages(details);
        
//         // Convert details object to rooms array - INCLUDING EXTRA ROOM
//         const roomArray = Object.keys(details).map(key => {
//           const roomData = details[key];
//           const isExtraRoom = key === 'Extra';
          
//           return {
//             id: key,
//             name: isExtraRoom ? 'Extra Tasks' : formatRoomTitle(key),
//             type: isExtraRoom ? 'extra' : key.split('_')[0],
//             tasks: roomData.tasks || [],
//             photos: roomData.photos || [],
//             completed: isExtraRoom 
//               ? (roomData.tasks || []).every(task => task.value === true) 
//               : (roomData.tasks || []).every(task => task.value === true) && 
//                 (roomData.photos || []).length >= 3,
//             isExtra: isExtraRoom
//           };
//         }); // No filter - include all rooms
        
//         setRooms(roomArray);
//         setTasks(details);
//         setFee(cl.checklist.price || 0);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   }, [scheduleId, currentUserId]);

//   const fetchHostPushTokens = useCallback(async () => {
//     const response = await userService.getUserPushTokens(hostId);
//     setHostPushToken(response.data.tokens);
//   }, [hostId]);

//   useFocusEffect(
//     useCallback(() => {
//       let isActive = true;
//       const fetchData = async () => {
//         try {
//           await fetchImages();
//           await fetchHostPushTokens();
//         } catch (error) {
//           console.error("Error fetching data:", error);
//         }
//       };
//       if (isActive) fetchData();
//       return () => { isActive = false; };
//     }, [fetchImages, fetchHostPushTokens])
//   );

//   useEffect(() => {
//     if (currentImages[currentImageIndex]?.cleanliness) {
//       pan.setValue({ x: 0, y: 0 });
//       overlayOpacity.setValue(1);
//     }
//   }, [currentImageIndex]);

//   const openImageViewer = useCallback((images, index, category) => {
//     pan.setValue({ x: 0, y: 0 });
//     overlayOpacity.setValue(1);

//     const formattedImages = images.map(photo => {
//       const score = invertPercentage(photo.cleanliness?.individual_overall || 0);
//       const status = getCleanlinessLabel(score);
      
//       return {
//         url: status === "Very Clean" ? photo.img_url : photo.cleanliness?.heatmap_url || photo.img_url,
//         cleanliness: photo.cleanliness,
//         props: { source: { uri: status === "Very Clean" ? photo.img_url : photo.cleanliness?.heatmap_url } },
//         category: category
//       };
//     });
  
//     setCurrentImages(formattedImages);
//     setCurrentImageIndex(index);
//     setBeforeModalVisible(true);
//   }, []);

//   // Take picture with camera - SIMPLIFIED VERSION (same as BeforePhoto)
//   const takePicture = async () => {
//     if (cameraRef.current) {
//       try {
//         const photo = await cameraRef.current.takePictureAsync({
//           quality: 0.8,
//           base64: true,
//           exif: false,
//           skipProcessing: true
//         });
        
//         const imgSrc = `data:image/jpeg;base64,${photo.base64}`;
//         const photoData = {
//           filename: `photo_${Date.now()}.jpg`,
//           file: imgSrc,
//           timestamp: new Date().toISOString()
//         };
//         setPhotos((prevPhotos) => [...prevPhotos, photoData]);
//         console.log('Photo added:', photoData);
//       } catch (error) {
//         console.error('Camera error:', error);
//         Alert.alert('Error', 'Failed to capture image. Using photo library instead.');
//         await pickImageFromLibrary();
//       }
//     } else {
//       await pickImageFromLibrary();
//     }
//   };

//   // Pick image from library (same as BeforePhoto)
//   const pickImageFromLibrary = async () => {
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: false,
//         aspect: [4, 3],
//         quality: 0.8,
//         base64: true,
//         allowsMultipleSelection: true,
//         selectionLimit: MAX_IMAGES_UPLOAD - photos.length
//       });

//       if (!result.canceled) {
//         const newPhotos = result.assets.map((asset, index) => ({
//           filename: `photo_${Date.now()}_${index}.jpg`,
//           file: `data:image/jpeg;base64,${asset.base64}`,
//           timestamp: new Date().toISOString()
//         }));

//         if (photos.length + newPhotos.length <= MAX_IMAGES_UPLOAD) {
//           setPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);
//         } else {
//           Alert.alert('Limit reached', `Maximum ${MAX_IMAGES_UPLOAD} photos allowed`);
//         }
//       }
//     } catch (error) {
//       console.error('Image picker error:', error);
//       Alert.alert('Error', 'Failed to pick image from library');
//     }
//   };

//   // Flip camera (same as BeforePhoto)
//   const flipCamera = () => {
//     setFacing(current => current === 'back' ? 'front' : 'back');
//   };

//   const openCamera = (taskTitle) => {
//     setSelectedTaskTitle(taskTitle);
//     setPhotos([]);
//     setIsCameraReady(false);
//     setCameraVisible(true);
//   };

//   const validateTasks = () => {
//     if (!selectedImages || Object.keys(selectedImages).length === 0) {
//       Alert.alert("Validation Error", "No tasks or images found for validation.");
//       return false;
//     }

//     let invalidCategories = [];
//     let insufficientImagesCategories = [];

//     Object.keys(selectedImages).forEach((category) => {
//       const categoryData = selectedImages[category];
//       if (!categoryData || !categoryData.tasks || !Array.isArray(categoryData.tasks)) return;

//       const { tasks, photos } = categoryData;
//       const isExtraRoom = category === 'Extra';
//       const allTasksCompleted = tasks.every((task) => task.value === true);
      
//       if (!allTasksCompleted) invalidCategories.push(category);
      
//       // Only check photos for non-extra rooms
//       if (!isExtraRoom && (!photos || photos.length < 3)) {
//         insufficientImagesCategories.push(category);
//       }
//     });

//     if (invalidCategories.length > 0 || insufficientImagesCategories.length > 0) {
//       let errorMessage = "";
//       if (invalidCategories.length > 0) errorMessage += `Incomplete tasks in: ${invalidCategories.join(", ")}.\n`;
//       if (insufficientImagesCategories.length > 0) errorMessage += `Insufficient images in: ${insufficientImagesCategories.join(", ")}.`;
//       Alert.alert("Validation Error", errorMessage);
//       return false;
//     }

//     return true;
//   };

//   const onSubmit = async () => {
//     if (photos.length === 0) {
//       Alert.alert('No Photos', 'Please take at least one photo before uploading.');
//       return;
//     }

//     if (photos.length > MAX_IMAGES_UPLOAD) {
//       Alert.alert('Upload Limit Exceeded', `You can only upload up to ${MAX_IMAGES_UPLOAD} images at a time.`);
//       return;
//     }
  
//     setIsUploading(true);
    
//     // Prepare images for upload
//     const imagesToUpload = photos.map(photo => {
//       // If using simulated image, use it directly
//       if (photo.file === SIMULATED_BASE64_IMAGE) {
//         return photo;
//       }
      
//       // For real photos, ensure proper format
//       if (photo.file.startsWith('data:image/')) {
//         return photo;
//       }
      
//       // If it doesn't have data prefix, add it (just in case)
//       return {
//         ...photo,
//         file: `data:image/jpeg;base64,${photo.file}`
//       };
//     });

//     const data = {
//       photo_type: 'after_photos',
//       scheduleId: scheduleId,
//       images: imagesToUpload,
//       currentUserId: currentUserId,
//       task_title: selectedTaskTitle,
//       updated_tasks: selectedImages,
//     };

//     try {
//       const response = await userService.uploadTaskPhotos(data);
//       if (response.status === 200) {
//         Alert.alert('Upload Successful', `${photos.length} photos have been uploaded successfully!`);
//         fetchImages();
//         setPhotos([]);
//         setCameraVisible(false);
//       }
//     } catch (err) {
//       console.error('Error uploading photos:', err);
//       Alert.alert('Upload Failed', 'An error occurred while uploading your photos.');
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const updateTasksInBackend = async (category, updatedTasks) => {
//     try {
//       const data = { scheduleId, cleanerId: currentUserId, category, tasks: updatedTasks };
//       await userService.updateChecklist(data);
//     } catch (err) {
//       console.error("Error updating tasks:", err);
//     }
//   };
  
//   const handleTaskToggle = (category, taskId) => {
//     setSelectedImages((prevSelectedImages) => {
//       const updatedImages = { ...prevSelectedImages };
//       if (!updatedImages[category]) return prevSelectedImages;

//       updatedImages[category].tasks = updatedImages[category].tasks.map((task) =>
//         task.id === taskId ? { ...task, value: !task.value } : task
//       );

//       updateTasksInBackend(category, updatedImages[category].tasks);
//       return updatedImages;
//     });
//   };

//   const removePhoto = (index) => {
//     setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
//   };

//   const handleDeletePhoto = async (indexToDelete, category) => {
//     try {
//       const photoToDelete = selectedImages[category]?.photos[indexToDelete];
//       if (!photoToDelete) {
//         Alert.alert("Error", "Photo not found");
//         return;
//       }

//       const originalFilename = photoToDelete.img_url.split('/').pop();
//       const heatmapFilename = photoToDelete.cleanliness?.heatmap_url?.split('/').pop();

//       setSelectedImages(prev => {
//         const updated = {...prev};
//         updated[category].photos = updated[category].photos.filter((_, i) => i !== indexToDelete);
//         return updated;
//       });

//       const data = { originalFilename, heatmapFilename, category, scheduleId };
//       await userService.deleteSpaceAfterPhoto(data);
//       updateTasksInBackend(selectedImages);

//     } catch (error) {
//       console.error('Delete failed:', error);
//       setSelectedImages(prev => ({...prev}));
//       Alert.alert('Deletion Failed', error.response?.data?.detail || 'Could not delete photo');
//     }
//   };

//   const submitCompletion = useCallback(async () => {
//     if (!validateTasks()) return;
//     setIsLoading(true);
//     try {
//       await userService.finishCleaning({
//         scheduleId,
//         cleanerId: currentUserId,
//         completed_tasks: selectedImages,
//         fee: parseFloat(cleaning_fee),
//         completionTime: new Date()
//       });
//       sendPushNotifications(hostTokens, 
//         `${currentUser.firstname} Completed Cleaning`,
//         `${currentUser.firstname} ${currentUser.lastname} has completed the cleaning.`,
//         { screen: ROUTES.host_task_progress, params: { scheduleId } }
//       );
//       Alert.alert("Success", "Cleaning completed successfully!");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [selectedImages, hostTokens, scheduleId, currentUser]);

//   const getRoomProgress = (room) => {
//     if (!selectedImages[room.id]) return 0;
//     const roomData = selectedImages[room.id];
//     const isExtraRoom = room.id === 'Extra';
    
//     const taskProgress = roomData.tasks?.length > 0 
//       ? (roomData.tasks.filter(t => t.value).length / roomData.tasks.length) * (isExtraRoom ? 100 : 50) 
//       : 0;
    
//     // For extra rooms, don't require photos - only tasks matter
//     const photoProgress = isExtraRoom ? 0 : Math.min((roomData.photos?.length || 0 / 3) * 50, 50);
    
//     return taskProgress + photoProgress;
//   };

//   const isRoomComplete = (room) => {
//     if (!selectedImages[room.id]) return false;
//     const roomData = selectedImages[room.id];
    
//     const isExtraRoom = room.id === 'Extra';
//     const tasksComplete = roomData.tasks?.every(task => task.value === true) || false;
//     // For extra rooms, we don't require photos
//     const photosComplete = isExtraRoom ? true : (roomData.photos?.length || 0) >= 3;
    
//     return tasksComplete && photosComplete;
//   };

//   const allRoomsComplete = rooms.every(room => isRoomComplete(room));

//   const markRoomComplete = (roomId) => {
//     Alert.alert(
//       "Mark Room Complete",
//       "Are you sure this room is fully cleaned and all photos are taken?",
//       [
//         { text: "Cancel", style: "cancel" },
//         { 
//           text: "Mark Complete", 
//           onPress: () => {
//             setRooms(prev => prev.map(room => 
//               room.id === roomId ? { ...room, completed: true } : room
//             ));
//             Alert.alert("Success", "Room marked as complete!");
//           }
//         }
//       ]
//     );
//   };

//   const getRoomIcon = (type) => {
//     switch(type.toLowerCase()) {
//       case 'bedroom': return 'bed';
//       case 'bathroom': return 'shower';
//       case 'kitchen': return 'silverware-fork-knife';
//       case 'livingroom': return 'sofa';
//       case 'extra': return 'plus-circle';
//       default: return 'home';
//     }
//   };

//   const onCloseCamera = () => {
//     setCameraVisible(false);
//     setPhotos([]);
//   };

//   // Loading overlay for camera (same as BeforePhoto)
//   const LoadingOverlay = () => (
//     <View style={styles.loadingOverlay}>
//       <ActivityIndicator size="large" color="white" />
//     </View>
//   );

//   // Camera View Component - SIMPLIFIED like BeforePhoto
//   const CameraViewComponent = () => {
//     // Simple permission checks
//     if (!permission) {
//       return (
//         <View style={styles.cameraContainer}>
//           <View style={styles.cameraPreviewContainer}>
//             <View style={[styles.camera, styles.centerContent]}>
//               <ActivityIndicator size="large" color="white" />
//               <Text style={{ color: 'white', marginTop: 20 }}>Checking camera permission...</Text>
//             </View>
//           </View>
//         </View>
//       );
//     }

//     if (!permission.granted) {
//       return (
//         <View style={styles.cameraContainer}>
//           <View style={styles.cameraPreviewContainer}>
//             <View style={[styles.camera, styles.centerContent]}>
//               <Ionicons name="camera-off" size={64} color="white" />
//               <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, marginTop: 20 }}>
//                 Camera Access Required
//               </Text>
//               <Text style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 10, marginBottom: 20 }}>
//                 Please enable camera permissions to use this feature
//               </Text>
//               <TouchableOpacity 
//                 style={styles.permissionButton}
//                 onPress={() => Linking.openSettings()}
//               >
//                 <Ionicons name="settings-outline" size={20} color="white" />
//                 <Text style={styles.permissionButtonText}>Open Settings</Text>
//               </TouchableOpacity>
//               <TouchableOpacity 
//                 style={[styles.permissionButton, { backgroundColor: COLORS.secondary, marginTop: 10 }]}
//                 onPress={pickImageFromLibrary}
//               >
//                 <Ionicons name="images-outline" size={20} color="white" />
//                 <Text style={styles.permissionButtonText}>Use Photo Library</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       );
//     }

//     // Camera is available and permission is granted
//     return (
//       <View style={styles.cameraContainer}>
//         {isUploading && <LoadingOverlay />}
        
//         {/* Camera Header */}
//         <View style={styles.cameraHeader}>
//           <TouchableOpacity 
//             style={styles.cameraCloseButton}
//             onPress={onCloseCamera}
//           >
//             <Ionicons name="chevron-down" size={28} color="white" />
//           </TouchableOpacity>
          
//           <TouchableOpacity 
//             style={styles.flipButton}
//             onPress={flipCamera}
//           >
//             <Ionicons name="camera-reverse" size={24} color="white" />
//           </TouchableOpacity>
//         </View>

//         {/* Camera Preview */}
//         <CameraView 
//           style={styles.camera}
//           facing={facing}
//           ref={cameraRef}
//           onCameraReady={() => setIsCameraReady(true)}
//         >
//           {/* Camera Controls */}
//           <View style={[
//             styles.cameraControls,
//             photos.length > 0 && styles.cameraControlsWithPhotos
//           ]}>
//             <TouchableOpacity 
//               style={styles.captureButton}
//               onPress={takePicture}
//               disabled={photos.length >= MAX_IMAGES_UPLOAD}
//             >
//               <View style={styles.captureButtonInner}>
//                 <Ionicons name="camera" size={32} color="white" />
//               </View>
//             </TouchableOpacity>
//           </View>

//           {/* Photo Counter */}
//           <View style={styles.photoCounter}>
//             <Ionicons name="images-outline" size={16} color="white" />
//             <Text style={styles.photoCounterText}>
//               {photos.length}/{MAX_IMAGES_UPLOAD}
//             </Text>
//           </View>
//         </CameraView>

//         {/* Bottom section - Always visible but conditionally shows content */}
//         <View style={[
//           styles.bottomSection,
//           photos.length > 0 && styles.bottomSectionWithPhotos
//         ]}>
//           {photos.length > 0 ? (
//             <>
//               {/* Thumbnail Preview */}
//               <View style={styles.thumbnailSection}>
//                 <FlatList
//                   data={photos}
//                   horizontal
//                   keyExtractor={(item, index) => index.toString()}
//                   renderItem={({ item, index }) => (
//                     <View style={styles.thumbnailContainer}>
//                       <Image 
//                         source={{ uri: item.file }} 
//                         style={styles.preview} 
//                         transition={400}
//                         cachePolicy="memory-disk"
//                       />
//                       <TouchableOpacity 
//                         onPress={() => removePhoto(index)} 
//                         style={styles.removeButton}
//                       >
//                         <Ionicons name="trash-outline" size={14} color="white" />
//                       </TouchableOpacity>
//                       <View style={styles.previewNumber}>
//                         <Text style={styles.previewNumberText}>{index + 1}</Text>
//                       </View>
//                     </View>
//                   )}
//                   contentContainerStyle={styles.previewContainer}
//                   showsHorizontalScrollIndicator={false}
//                 />
//               </View>
              
//               {/* Upload Button */}
//               <TouchableOpacity 
//                 onPress={onSubmit} 
//                 style={styles.uploadButton}
//                 disabled={isUploading}
//               >
//                 {isUploading ? (
//                   <ActivityIndicator size="small" color="white" />
//                 ) : (
//                   <>
//                     <Ionicons name="cloud-upload-outline" size={22} color="white" />
//                     <Text style={styles.uploadButtonText}>
//                       Upload {photos.length} Photo{photos.length !== 1 ? 's' : ''}
//                     </Text>
//                   </>
//                 )}
//               </TouchableOpacity>
//             </>
//           ) : (
//             // When no photos, show simple instructions
//             <View style={styles.cameraInstructions}>
//               <Text style={styles.cameraInstructionsText}>
//                 Tap the camera button to capture photos
//               </Text>
//             </View>
//           )}
//         </View>
//       </View>
//     );
//   };

//   const RoomCard = ({ room }) => {
//     const progress = getRoomProgress(room);
//     const isComplete = isRoomComplete(room);
//     const roomData = selectedImages[room.id] || {};
    
//     return (
//       <TouchableOpacity 
//         style={[
//           styles.roomCard,
//           selectedRoom?.id === room.id && styles.selectedRoomCard,
//           isComplete && styles.completedRoomCard
//         ]}
//         onPress={() => setSelectedRoom(room)}
//       >
//         <View style={styles.roomCardHeader}>
//           <View style={[
//             styles.roomIcon,
//             isComplete && styles.completedRoomIcon
//           ]}>
//             <MaterialCommunityIcons 
//               name={getRoomIcon(room.type)} 
//               size={24} 
//               color={isComplete ? "#4CAF50" : COLORS.primary} 
//             />
//           </View>
//           <View style={styles.roomInfo}>
//             <Text style={styles.roomName}>{room.name}</Text>
//             <Text style={styles.roomStatus}>
//               {isComplete ? "✓ Complete" : "In Progress"}
//             </Text>
//           </View>
//           <View style={styles.roomStats}>
//             <Text style={styles.roomStat}>
//               📸 {roomData.photos?.length || 0}/{room.isExtra ? 'Optional' : '3'}
//             </Text>
//             <Text style={styles.roomStat}>
//               ✅ {roomData.tasks?.filter(t => t.value).length || 0}/{roomData.tasks?.length || 0}
//             </Text>
//           </View>
//         </View>
        
//         <View style={styles.progressContainer}>
//           <View style={styles.progressBar}>
//             <View 
//               style={[
//                 styles.progressFill, 
//                 { 
//                   width: `${progress}%`, 
//                   backgroundColor: isComplete ? '#4CAF50' : COLORS.primary 
//                 }
//               ]} 
//             />
//           </View>
//           <Text style={styles.progressText}>{Math.round(progress)}% complete</Text>
//         </View>
        
//         <TouchableOpacity 
//           style={[
//             styles.roomActionButton,
//             isComplete ? styles.reviewButton : styles.startButton
//           ]}
//           onPress={() => setSelectedRoom(room)}
//         >
//           <Text style={styles.roomActionButtonText}>
//             {isComplete ? "Review" : "Continue"}
//           </Text>
//           <Ionicons 
//             name={isComplete ? "eye" : "arrow-forward"} 
//             size={16} 
//             color="white" 
//           />
//         </TouchableOpacity>
//       </TouchableOpacity>
//     );
//   };

//   const RoomWorkspace = ({ room, onBack }) => {
//     const roomData = selectedImages[room.id] || {};
//     const isExtraRoom = room.id === 'Extra';
    
//     return (
//       <View style={styles.workspace}>
//         <View style={styles.workspaceHeader}>
//           <TouchableOpacity onPress={onBack} style={styles.backButton}>
//             <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
//           </TouchableOpacity>
//           <View style={styles.roomTitleSection}>
//             <Text style={styles.workspaceRoomTitle}>{room.name}</Text>
//             <Text style={styles.workspaceRoomSubtitle}>
//               {isRoomComplete(room) ? "Completed" : "In Progress"}
//             </Text>
//           </View>
//           <CircularProgress
//             value={getRoomProgress(room)}
//             radius={24}
//             duration={1000}
//             progressValueColor={isRoomComplete(room) ? "#4CAF50" : COLORS.primary}
//             activeStrokeColor={isRoomComplete(room) ? "#4CAF50" : COLORS.primary}
//             activeStrokeWidth={4}
//             inActiveStrokeWidth={4}
//             inActiveStrokeColor="#e0e0e0"
//             maxValue={100}
//           />
//         </View>
        
//         <ScrollView style={styles.workspaceContent} showsVerticalScrollIndicator={false}>
//           {/* Photos Section (for all rooms, but optional for extra rooms) */}
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Ionicons name="camera" size={22} color={COLORS.primary} />
//               <Text style={styles.sectionTitle}>
//                 {isExtraRoom ? "Additional Photos (Optional)" : "After Photos"}
//               </Text>
//               {!isExtraRoom && (
//                 <View style={styles.badge}>
//                   <Text style={styles.badgeText}>
//                     {roomData.photos?.length || 0}/3
//                   </Text>
//                 </View>
//               )}
//             </View>
            
//             <Text style={styles.sectionDescription}>
//               {isExtraRoom 
//                 ? "Take photos of any additional cleaning tasks if needed"
//                 : "Take photos of the same areas as your before photos"}
//             </Text>
            
//             {/* Photo Gallery */}
//             <View style={styles.photoGallery}>
//               <FlatList
//                 data={roomData.photos || []}
//                 horizontal
//                 keyExtractor={(item, index) => `${item.id}_${index}`}
//                 renderItem={({ item, index }) => (
//                   <ThumbnailItem
//                     photo={item}
//                     index={index}
//                     taskTitle={room.id}
//                     photosArray={roomData.photos || []}
//                     onDelete={handleDeletePhoto}
//                     openImageViewer={openImageViewer}
//                     invertPercentage={invertPercentage}
//                     getCleanlinessColor={getCleanlinessColor}
//                   />
//                 )}
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.previewContainer}
//                 ListEmptyComponent={
//                   <View style={styles.emptyPhotos}>
//                     <Ionicons name="camera-outline" size={40} color="#ddd" />
//                     <Text style={styles.emptyPhotosText}>No photos yet</Text>
//                     <Text style={styles.emptyPhotosSubtext}>
//                       {isExtraRoom 
//                         ? "Photos are optional for extra tasks"
//                         : "Tap the button below to add photos"}
//                     </Text>
//                   </View>
//                 }
//               />
//             </View>
            
//             {/* Add Photo Button */}
//             <TouchableOpacity 
//               style={styles.addPhotosButton}
//               onPress={() => openCamera(room.id)}
//             >
//               <View style={styles.addButtonContent}>
//                 <Ionicons name="add-circle" size={24} color="white" />
//                 <View style={styles.addButtonTextContainer}>
//                   <Text style={styles.addButtonMainText}>
//                     {isExtraRoom 
//                       ? "Add Optional Photos"
//                       : roomData.photos?.length >= 3 ? "Add More Photos" : "Take Photos"}
//                   </Text>
//                   <Text style={styles.addButtonSubText}>
//                     {isExtraRoom 
//                       ? "Document any additional cleaning work"
//                       : roomData.photos?.length >= 3 
//                         ? "You can add more photos if needed" 
//                         : `At least 3 photos recommended (${3 - (roomData.photos?.length || 0)} more needed)`}
//                   </Text>
//                 </View>
//               </View>
//             </TouchableOpacity>
//           </View>
          
//           {/* Tasks Section */}
//           <View style={[styles.section, isExtraRoom && styles.extraSection]}>
//             <View style={styles.sectionHeader}>
//               <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
//               <Text style={styles.sectionTitle}>
//                 {isExtraRoom ? "Additional Tasks" : "Cleaning Tasks"}
//               </Text>
//               <View style={styles.badge}>
//                 <Text style={styles.badgeText}>
//                   {roomData.tasks?.filter(t => t.value).length || 0}/{roomData.tasks?.length || 0}
//                 </Text>
//               </View>
//             </View>
            
//             <View style={styles.taskProgress}>
//               <View style={styles.taskProgressBar}>
//                 <View style={[
//                   styles.taskProgressFill, 
//                   { 
//                     width: `${roomData.tasks?.length > 0 
//                       ? (roomData.tasks.filter(t => t.value).length / roomData.tasks.length) * 100 
//                       : 0}%` 
//                   }
//                 ]} />
//               </View>
//               <Text style={styles.taskProgressText}>
//                 {roomData.tasks?.filter(t => t.value).length || 0} of {roomData.tasks?.length || 0} tasks completed
//               </Text>
//             </View>
            
//             {/* Task List */}
//             <View style={styles.taskList}>
//               {roomData.tasks?.map((item, index) => (
//                 <TouchableOpacity
//                   key={`${item.id}_${index}`}
//                   style={[
//                     styles.taskItem,
//                     item.value && styles.taskItemCompleted
//                   ]}
//                   onPress={() => handleTaskToggle(room.id, item.id)}
//                 >
//                   <View style={styles.taskItemLeft}>
//                     <Checkbox.Android
//                       status={item.value ? 'checked' : 'unchecked'}
//                       onPress={() => {}}
//                       color={COLORS.primary}
//                       uncheckedColor="#000"
//                     />
//                     <View style={styles.taskTextContainer}>
//                       <Text style={[
//                         styles.taskLabel,
//                         item.value && styles.taskLabelCompleted
//                       ]}>
//                         {item.label}
//                       </Text>
//                       {(item.time || item.price) && (
//                         <View style={styles.taskMeta}>
//                           {item.time && (
//                             <View style={styles.taskMetaItem}>
//                               <Ionicons name="time-outline" size={12} color="#666" />
//                               <Text style={styles.taskMetaText}>
//                                 {item.time} min{item.time > 1 ? 's' : ''}
//                               </Text>
//                             </View>
//                           )}
//                           {item.price && (
//                             <View style={styles.taskMetaItem}>
//                               <Ionicons name="cash-outline" size={12} color="#4CAF50" />
//                               <Text style={styles.taskMetaText}>
//                                 ${item.price}
//                               </Text>
//                             </View>
//                           )}
//                         </View>
//                       )}
//                     </View>
                    
//                     {item.value ? (
//                     <View style={styles.completedIndicator}>
//                       <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
//                     </View>
//                     ) : (
//                       <Ionicons name="ellipse-outline" size={20} color="#ddd" />
//                     )}

//                   </View>
                  
                  
//                 </TouchableOpacity>
//               ))}
              
//               {(!roomData.tasks || roomData.tasks.length === 0) && (
//                 <View style={styles.noTasksContainer}>
//                   <Ionicons name="list-outline" size={40} color="#ddd" />
//                   <Text style={styles.noTasksText}>No tasks assigned</Text>
//                 </View>
//               )}
//             </View>
//           </View>
          
//           {/* Completion Requirements */}
//           <View style={styles.requirementsSection}>
//             <Text style={styles.requirementsTitle}>To complete this {isExtraRoom ? "section" : "room"}:</Text>
            
//             {!isExtraRoom && (
//               <View style={styles.requirementItem}>
//                 <Ionicons 
//                   name={roomData.photos?.length >= 3 ? "checkmark-circle" : "ellipse-outline"} 
//                   size={20} 
//                   color={roomData.photos?.length >= 3 ? "#4CAF50" : "#666"} 
//                 />
//                 <Text style={[
//                   styles.requirementText,
//                   roomData.photos?.length >= 3 && styles.requirementTextCompleted
//                 ]}>
//                   Minimum 3 photos ({roomData.photos?.length || 0}/3)
//                 </Text>
//               </View>
//             )}
            
//             <View style={styles.requirementItem}>
//               <Ionicons 
//                 name={roomData.tasks?.every(t => t.value) ? "checkmark-circle" : "ellipse-outline"} 
//                 size={20} 
//                 color={roomData.tasks?.every(t => t.value) ? "#4CAF50" : "#666"} 
//               />
//               <Text style={[
//                 styles.requirementText,
//                 roomData.tasks?.every(t => t.value) && styles.requirementTextCompleted
//               ]}>
//                 All tasks completed ({roomData.tasks?.filter(t => t.value).length || 0}/{roomData.tasks?.length || 0})
//               </Text>
//             </View>
//           </View>
//         </ScrollView>
        
//         {/* Completion Button */}
//         <View style={styles.completionSection}>
//           {isRoomComplete(room) ? (
//             room.completed ? (
//               <View style={styles.alreadyCompleted}>
//                 <Ionicons name="checkmark-done-circle" size={24} color="#4CAF50" />
//                 <Text style={styles.alreadyCompletedText}>
//                   {room.name} is already completed
//                 </Text>
//               </View>
//             ) : (
//               <TouchableOpacity 
//                 style={styles.markCompleteButton}
//                 onPress={() => markRoomComplete(room.id)}
//               >
//                 <Ionicons name="checkmark-done" size={24} color="white" />
//                 <View style={styles.markCompleteButtonTexts}>
//                   <Text style={styles.markCompleteButtonMain}>
//                     Mark {room.name} Complete
//                   </Text>
//                   <Text style={styles.markCompleteButtonSub}>
//                     All requirements are met ✓
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             )
//           ) : (
//             <View style={styles.incompleteRequirements}>
//               <Ionicons name="alert-circle" size={24} color="#FF9800" />
//               <View style={styles.incompleteRequirementsTexts}>
//                 <Text style={styles.incompleteRequirementsMain}>
//                   Complete requirements to finish
//                 </Text>
//                 <Text style={styles.incompleteRequirementsSub}>
//                   {!isExtraRoom && roomData.photos?.length < 3 && `${3 - (roomData.photos?.length || 0)} more photos, `}
//                   {roomData.tasks?.filter(t => !t.value).length} more tasks
//                 </Text>
//               </View>
//             </View>
//           )}
//         </View>
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Camera Modal */}
//       <Modal
//         isVisible={cameraVisible}
//         style={styles.fullScreenModal}
//         onBackdropPress={() => setCameraVisible(false)}
//       >
//         <View style={styles.cameraModalContainer}>
//           <CameraViewComponent />
//         </View>
//       </Modal>

//       {/* Image Viewer Modal */}
//       <Modal isVisible={isBeforeModalVisible} style={styles.fullScreenModal}>
//         <View style={styles.modalContainer}>
//           <ImageViewer
//             imageUrls={currentImages}
//             index={currentImageIndex}
//             backgroundColor="black"
//             enableSwipeDown
//             enableImageZoom
//             onSwipeDown={() => setBeforeModalVisible(false)}
//             renderImage={(props) => (
//               <Image source={props.source} style={styles.fullSizeImage} contentFit="contain" />
//             )}
//           />
          
//           {currentImages[currentImageIndex]?.cleanliness && (
//             <Animated.View style={[styles.analysisPanel, { transform: [{ translateY: pan.y }] }]} {...panResponder.panHandlers}>
//               <View style={styles.dragHandle} />
//               <View style={styles.analysisContent}>
//                 <Text style={styles.analysisTitle}>CLEANLINESS ANALYSIS</Text>
                
//                 <View style={styles.scoreSection}>
//                   <Text style={styles.sectionTitle}>THIS PHOTO</Text>
//                   <View style={styles.scoreRow}>
//                     <View style={styles.scoreText}>
//                       <Text style={styles.scorePercentage}>
//                         {invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0).toFixed(0)}%
//                       </Text>
//                       <Text style={styles.scoreLabel}>
//                         {getCleanlinessLabel(invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0))}
//                       </Text>
//                     </View>
//                     <CircularProgress
//                       value={invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0)}
//                       radius={35}
//                       activeStrokeColor={getCleanlinessColor(invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0))}
//                       inActiveStrokeColor="#2d2d2d"
//                       maxValue={100}
//                     />
//                   </View>
//                 </View>

//                 <Text style={styles.sectionTitle}>MAIN ISSUES</Text>
//                 <View style={styles.issuesList}>
//                   {Object.entries(currentImages[currentImageIndex].cleanliness.scores || {})
//                     .sort(([,a], [,b]) => b - a)
//                     .slice(0, 3)
//                     .map(([factor, score]) => (
//                       <View key={factor} style={styles.issueItem}>
//                         <Text style={styles.issueName}>{factor.replace(/_/g, ' ').toUpperCase()}</Text>
//                         <Text style={[styles.issueScore, { color: getCleanlinessColor(100 - (score * 10)) }]}>
//                           {(100 - (score * 10)).toFixed(0)}%
//                         </Text>
//                       </View>
//                     ))}
//                 </View>
//               </View>
//             </Animated.View>
//           )}

//           <TouchableOpacity style={styles.modalCloseButton} onPress={() => setBeforeModalVisible(false)}>
//             <Ionicons name="close" size={24} color="white" />
//           </TouchableOpacity>
//         </View>
//       </Modal>

//       {cameraVisible ? null : (
//         <View style={{ flex: 1 }}>
//           {isLoading ? (
//             <View style={styles.loadingContainer}>
//               <CustomActivityIndicator size={40} />
//             </View>
//           ) : selectedRoom ? (
//             <RoomWorkspace 
//               room={selectedRoom}
//               onBack={() => setSelectedRoom(null)}
//             />
//           ) : (
//             <>
//               <View style={styles.header}>
//                 <Text style={styles.headline}>After Photos & Tasks</Text>
//                 <Text style={styles.subtitle}>
//                   Complete rooms in any order. Each room needs 3+ photos (except Extra Tasks) and all tasks checked.
//                   {/* {isSimulator && ' (Simulator Mode)'} */}
//                 </Text>
//                 {/* {isSimulator && (
//                   <View style={styles.simulatorWarning}>
//                     <Ionicons name="information-circle" size={16} color={COLORS.warning} />
//                     <Text style={styles.simulatorWarningText}>
//                       Running on simulator. Using photo library for testing.
//                     </Text>
//                   </View>
//                 )} */}

//                 <View style={styles.minimalProgressRow}>
//                   <View style={styles.minimalProgressLeft}>
//                     <Text style={styles.minimalProgressTitle}>Progress</Text>
//                     <View style={styles.minimalProgressBar}>
//                       <View 
//                         style={[
//                           styles.minimalProgressFill, 
//                           { 
//                             width: `${(rooms.filter(r => isRoomComplete(r)).length / Math.max(rooms.length, 1)) * 100}%`,
//                             backgroundColor: COLORS.primary
//                           }
//                         ]} 
//                       />
//                     </View>
//                   </View>
                  
//                   <View style={styles.minimalProgressRight}>
//                     <Text style={styles.minimalProgressPercentage}>
//                       {Math.round((rooms.filter(r => isRoomComplete(r)).length / Math.max(rooms.length, 1)) * 100)}%
//                     </Text>
//                     <Text style={styles.minimalProgressText}>
//                       {rooms.filter(r => isRoomComplete(r)).length}/{rooms.length} rooms
//                     </Text>
//                   </View>
//                 </View>
//               </View>
              
//               <Text style={styles.sectionTitle}>All Rooms</Text>
//               <ScrollView style={styles.roomsContainer}>
//                 {rooms.length > 0 ? (
//                   rooms.map(room => (
//                     <RoomCard key={room.id} room={room} />
//                   ))
//                 ) : (
//                   <View style={styles.noRoomsContainer}>
//                     <Ionicons name="home-outline" size={48} color={COLORS.gray} />
//                     <Text style={styles.noRoomsText}>No rooms assigned</Text>
//                   </View>
//                 )}
//               </ScrollView>
              
//               <TouchableOpacity 
//                 style={[
//                   styles.finishButton,
//                   !allRoomsComplete && styles.disabledFinishButton
//                 ]}
//                 onPress={submitCompletion}
//                 disabled={!allRoomsComplete}
//               >
//                 <Ionicons name="checkmark-done-circle" size={24} color="white" />
//                 <View style={styles.finishButtonTexts}>
//                   <Text style={styles.finishButtonMain}>
//                     {allRoomsComplete ? "Finish Cleaning" : "Complete All Rooms First"}
//                   </Text>
//                   <Text style={styles.finishButtonSub}>
//                     {allRoomsComplete 
//                       ? "All rooms are complete!" 
//                       : `${rooms.filter(r => !isRoomComplete(r)).length} room(s) remaining`}
//                   </Text>
//                 </View>
//                 <Ionicons name="chevron-forward" size={20} color="white" />
//               </TouchableOpacity>
//             </>
//           )}
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   cameraModalContainer: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   container: { 
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 100,
//   },
//   emptyStateContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 40,
//     marginTop: 50,
//   },
//   emptyStateTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptyStateSubtitle: {
//     fontSize: 16,
//     color: COLORS.gray,
//     textAlign: 'center',
//     lineHeight: 22,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'absolute',
//     top: 100,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     zIndex: 10,
//   },
//   header: {
//     padding: 20,
//     backgroundColor: 'white',
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   headline: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#1a1a1a',
//     marginBottom: 4,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#666',
//     lineHeight: 20,
//   },
//   simulatorWarning: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff3cd',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 8,
//     marginTop: 10,
//   },
//   simulatorWarningText: {
//     fontSize: 14,
//     color: '#856404',
//     marginLeft: 8,
//     fontWeight: '500',
//   },
//   progressCard: {
//     margin: 16,
//     padding: 20,
//   },
//   progressHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   progressTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1a1a1a',
//   },
//   progressStats: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//   },
//   stat: {
//     alignItems: 'center',
//   },
//   statNumber: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },
//   statLabel: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 4,
//   },
//   statDivider: {
//     width: 1,
//     backgroundColor: '#e0e0e0',
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginHorizontal: 16,
//     marginBottom: 12,
//   },
//   roomsContainer: {
//     flex: 1,
//     paddingHorizontal: 16,
//   },
//   roomCard: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 2,
//     borderColor: 'transparent',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   selectedRoomCard: {
//     borderColor: COLORS.primary,
//     backgroundColor: '#f8fbff',
//   },
//   completedRoomCard: {
//     borderColor: '#d4edda',
//     backgroundColor: '#f0f9f0',
//   },
//   roomCardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   roomIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#e3f2fd',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   completedRoomIcon: {
//     backgroundColor: '#e8f5e8',
//   },
//   roomInfo: {
//     flex: 1,
//   },
//   roomName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1a1a1a',
//   },
//   roomStatus: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 2,
//   },
//   roomStats: {
//     alignItems: 'flex-end',
//   },
//   roomStat: {
//     fontSize: 12,
//     color: '#666',
//   },
//   progressContainer: {
//     marginBottom: 16,
//   },
//   progressBar: {
//     height: 6,
//     backgroundColor: '#e0e0e0',
//     borderRadius: 3,
//     marginBottom: 8,
//   },
//   progressFill: {
//     height: '100%',
//     borderRadius: 3,
//   },
//   progressText: {
//     fontSize: 12,
//     color: '#666',
//     textAlign: 'right',
//   },
//   roomActionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   startButton: {
//     backgroundColor: COLORS.primary,
//   },
//   reviewButton: {
//     backgroundColor: '#4CAF50',
//   },
//   roomActionButtonText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//     marginRight: 8,
//   },
//   finishButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary,
//     margin: 16,
//     padding: 18,
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   disabledFinishButton: {
//     backgroundColor: '#ccc',
//   },
//   finishButtonTexts: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   finishButtonMain: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   finishButtonSub: {
//     color: 'rgba(255,255,255,0.8)',
//     fontSize: 12,
//     marginTop: 2,
//   },
//   workspace: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   workspaceHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   backButton: {
//     marginRight: 12,
//   },
//   roomTitleSection: {
//     flex: 1,
//   },
//   workspaceRoomTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1a1a1a',
//   },
//   workspaceRoomSubtitle: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 2,
//   },
//   workspaceContent: {
//     flex: 1,
//     padding: 16,
//   },
//   section: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   extraSection: {
//     marginTop: 16,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   badge: {
//     marginLeft: 'auto',
//     backgroundColor: '#e3f2fd',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   badgeText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },
//   photoGallery: {
//     marginBottom: 16,
//   },
//   addPhotosButton: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 8,
//     padding: 16,
//   },
//   addButtonContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   addButtonTextContainer: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   addButtonMainText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 2,
//   },
//   addButtonSubText: {
//     color: 'rgba(255,255,255,0.8)',
//     fontSize: 12,
//   },
//   taskProgress: {
//     marginBottom: 16,
//   },
//   taskProgressBar: {
//     height: 6,
//     backgroundColor: '#e0e0e0',
//     borderRadius: 3,
//     marginBottom: 8,
//   },
//   taskProgressFill: {
//     height: '100%',
//     backgroundColor: COLORS.primary,
//     borderRadius: 3,
//   },
//   taskProgressText: {
//     fontSize: 12,
//     color: '#666',
//     textAlign: 'center',
//   },
//   taskList: {
//     marginBottom: 8,
//   },
//   taskItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   taskItemCompleted: {
//     backgroundColor: '#f9f9f9',
//   },
//   taskItemLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   taskTextContainer: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   taskLabel: {
//     fontSize: 15,
//     fontWeight: '500',
//     color: '#1a1a1a',
//   },
//   taskLabelCompleted: {
//     color: '#666',
//     textDecorationLine: 'line-through',
//   },
//   taskMeta: {
//     flexDirection: 'row',
//     marginTop: 4,
//     gap: 12,
//   },
//   taskMetaItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   taskMetaText: {
//     fontSize: 12,
//     color: '#666',
//     marginLeft: 4,
//   },
//   completedIndicator: {
//     marginLeft: 8,
//   },
//   noTasksContainer: {
//     alignItems: 'center',
//     padding: 20,
//   },
//   noTasksText: {
//     fontSize: 14,
//     color: '#999',
//     marginTop: 8,
//   },
//   requirementsSection: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#f0f0f0',
//   },
//   requirementsTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginBottom: 12,
//   },
//   requirementItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   requirementText: {
//     fontSize: 14,
//     color: '#666',
//     marginLeft: 8,
//   },
//   requirementTextCompleted: {
//     color: '#4CAF50',
//   },
//   completionSection: {
//     padding: 16,
//     backgroundColor: 'white',
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//   },
//   markCompleteButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#4CAF50',
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//   },
//   markCompleteButtonTexts: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   markCompleteButtonMain: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   markCompleteButtonSub: {
//     color: 'rgba(255,255,255,0.8)',
//     fontSize: 12,
//     marginTop: 2,
//   },
//   alreadyCompleted: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 16,
//   },
//   alreadyCompletedText: {
//     fontSize: 16,
//     color: '#4CAF50',
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   incompleteRequirements: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 16,
//   },
//   incompleteRequirementsTexts: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   incompleteRequirementsMain: {
//     fontSize: 16,
//     color: '#FF9800',
//     fontWeight: '600',
//   },
//   incompleteRequirementsSub: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 2,
//   },
  
//   // Camera Modal Styles (same as BeforePhoto)
//   cameraContainer: {
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
//   camera: {
//     flex: 1,
//   },
//   cameraControls: {
//     position: 'absolute',
//     bottom: 120, // Positioned above the bottom section
//     alignSelf: 'center',
//   },
//   cameraControlsWithPhotos: {
//     bottom: 200, // Move camera button higher when photos are present
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
  
//   // Bottom Section
//   bottomSection: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: 'rgba(0,0,0,0.8)',
//     paddingVertical: 20,
//     paddingHorizontal: 16,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     minHeight: 100, // Minimum height when no photos
//   },
//   bottomSectionWithPhotos: {
//     minHeight: 180, // Increased height when photos are present
//   },
  
//   // Thumbnail Section
//   thumbnailSection: {
//     marginBottom: 16,
//   },
  
//   // Camera Preview Thumbnail
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
  
//   // Upload Button
//   uploadButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   uploadButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 12,
//   },
  
//   // Camera Instructions
//   cameraInstructions: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 20,
//   },
//   cameraInstructionsText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '500',
//     textAlign: 'center',
//   },
  
//   // Other Styles
//   previewContainer: { 
//     flexDirection: 'row',
//     paddingHorizontal: 5,
//     paddingVertical: 8,
//   },
//   modalCloseButton: {
//     position: 'absolute',
//     top: 50,
//     right: 24,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     borderRadius: 20,
//     padding: 8,
//   },
//   horizontalLine: {
//     borderBottomColor: '#f0f0f0',
//     borderBottomWidth: 1,
//     marginVertical: 15,
//   },
//   deleteButton: {
//     position: 'absolute',
//     top: 5,
//     right: 5,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     padding: 6,
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.3,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   fullScreenModal: {
//     margin: 0,
//     justifyContent: 'center',
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'black'
//   },
//   fullSizeImage: {
//     width: '100%',
//     height: '100%',
//   },
//   taskContainer: {
//     padding: 8,
//     backgroundColor: '#f8f9fa',
//     borderRadius: 6,
//     marginBottom: 4,
//   },
//   tasksContainer: {
//     marginTop: 10,
//   },
//   taskItem: {
//     marginBottom: 5,
//   },
//   permissionButton: {
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 8,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   permissionButtonText: {
//     color: 'white',
//     fontWeight: '600',
//     fontSize: 16,
//     marginLeft: 8,
//   },
//   centerContent: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   cameraPreviewContainer: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   thumbnailContainer: { 
//     marginRight: 12,
//     marginBottom: 0,
//     position: 'relative',
//   },
//   warningBadge: {
//     position: 'absolute',
//     top: 8,
//     left: 8,
//     backgroundColor: '#e74c3c',
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
//   emptyPhotos: {
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
//   emptyPhotosText: {
//     fontSize: 12,
//     color: '#999',
//     marginTop: 4,
//   },
//   emptyPhotosSubtext: {
//     fontSize: 12,
//     color: '#999',
//     marginTop: 4,
//     textAlign: 'center',
//   },
//   analysisPanel: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: 'rgba(0,0,0,0.9)',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 20,
//     paddingBottom: 40,
//   },
//   dragHandle: {
//     width: 40,
//     height: 4,
//     backgroundColor: 'rgba(255,255,255,0.4)',
//     borderRadius: 2,
//     alignSelf: 'center',
//     marginBottom: 16,
//   },
//   analysisContent: {
//     maxHeight: 400,
//   },
//   analysisTitle: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: '700',
//     textAlign: 'center',
//     marginBottom: 20,
//     letterSpacing: 0.5,
//   },
//   scoreSection: {
//     marginBottom: 20,
//   },
//   scoreRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   scoreText: {
//     flex: 1,
//   },
//   scorePercentage: {
//     color: 'white',
//     fontSize: 32,
//     fontWeight: '700',
//     marginBottom: 4,
//   },
//   scoreLabel: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     opacity: 0.9,
//   },
//   issuesList: {
//     backgroundColor: 'rgba(255,255,255,0.05)',
//     borderRadius: 12,
//     padding: 8,
//   },
//   issueItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(255,255,255,0.1)',
//   },
//   issueName: {
//     color: 'white',
//     fontSize: 14,
//     flex: 2,
//     opacity: 0.9,
//   },
//   issueScore: {
//     fontSize: 14,
//     fontWeight: '600',
//     flex: 1,
//     textAlign: 'right',
//   },
//   noRoomsContainer: {
//     alignItems: 'center',
//     padding: 40,
//     marginTop: 20,
//   },
//   noRoomsText: {
//     fontSize: 16,
//     color: COLORS.gray,
//     marginTop: 12,
//   },
//   minimalProgressRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginTop:16
//   },
//   minimalProgressLeft: {
//     flex: 1,
//     marginRight: 12,
//   },
//   minimalProgressTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 6,
//   },
//   minimalProgressBar: {
//     height: 4,
//     backgroundColor: '#e8e8e8',
//     borderRadius: 2,
//     overflow: 'hidden',
//   },
//   minimalProgressFill: {
//     height: '100%',
//     borderRadius: 2,
//   },
//   minimalProgressRight: {
//     alignItems: 'flex-end',
//   },
//   minimalProgressPercentage: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.primary,
//     marginBottom: 2,
//   },
//   minimalProgressText: {
//     fontSize: 12,
//     color: '#666',
//   },
// });

// export default AfterPhoto;



import React, { useEffect, useContext, useCallback, useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, 
  FlatList, ScrollView, Dimensions, Animated, PanResponder, SafeAreaView,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import COLORS from '../../../constants/colors';
import userService from '../../../services/connection/userService';
import { AuthContext } from '../../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import CardNoPrimary from '../../../components/shared/CardNoPrimary';
import { Checkbox } from 'react-native-paper';
import ImageViewer from 'react-native-image-zoom-viewer';
import RNModal from 'react-native-modal'; // Changed from Modal to RNModal
import { sendPushNotifications } from '../../../utils/sendPushNotification';
import ROUTES from '../../../constants/routes';
import CircularProgress from 'react-native-circular-progress-indicator';
import { Image } from 'expo-image'; 
import CustomActivityIndicator from '../../../components/shared/CuustomActivityIndicator';
import formatRoomTitle from '../../../utils/formatRoomTitle';
import Constants from 'expo-constants';

// Import expo-camera
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

// Base64 encoded 1x1 pixel transparent image for simulation
const SIMULATED_BASE64_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const ThumbnailItem = React.memo(({ 
  photo, 
  index, 
  openImageViewer, 
  taskTitle,
  invertPercentage, 
  getCleanlinessColor, 
  photosArray,
  onDelete
}) => {
  const photoScore = invertPercentage(photo.cleanliness?.individual_overall || 0);
  const isProblemPhoto = photoScore < 35;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleDelete = () => {
    Alert.alert(
      "Delete Photo",
      "Are you sure you want to permanently delete this photo?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          onPress: () => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true
            }).start(() => onDelete(index, taskTitle));
          }
        }
      ]
    );
  };

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        onPress={() => openImageViewer(photosArray, index, taskTitle)}
        style={styles.thumbnailContainer}
      >
        <Image
          source={{ uri: photo.img_url }}
          style={styles.preview}
          cachePolicy="memory-disk"
          transition={300}
        />
        <TouchableOpacity 
          onPress={handleDelete}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={16} color="white" />
        </TouchableOpacity>
        {isProblemPhoto && (
          <View style={styles.warningBadge}>
            <MaterialIcons name="warning" size={14} color="#fff" />
          </View>
        )}
        <View style={styles.photoNumber}>
          <Text style={styles.photoNumberText}>{index + 1}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const AfterPhoto = ({ scheduleId, hostId }) => {
  const { currentUserId, currentUser } = useContext(AuthContext);
  const cameraRef = useRef(null);
  const MAX_IMAGES_UPLOAD = 10;
  
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [cleaning_fee, setFee] = useState(0);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [isBeforeModalVisible, setBeforeModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);
  const [hostTokens, setHostPushToken] = useState([]);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  
  // Camera states - EXACTLY LIKE BeforePhoto
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isSimulator, setIsSimulator] = useState(false);
  
  // Check if running on simulator - EXACTLY LIKE BeforePhoto
  useEffect(() => {
    // Simple check - you can enhance this if needed
    if (Platform.OS === 'ios' && Platform.isPad) {
      setIsSimulator(true);
    }
  }, []);

  const pan = useRef(new Animated.ValueXY()).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gesture) => {
        if (gesture.dy > 50) {
          Animated.timing(pan, { toValue: { x: 0, y: 300 }, duration: 300, useNativeDriver: true }).start();
          Animated.timing(overlayOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
          Animated.spring(overlayOpacity, { toValue: 1, useNativeDriver: true }).start();
        }
      }
    })
  ).current;

  // Request camera and media library permissions - EXACTLY LIKE BeforePhoto
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

  const invertPercentage = (score) => 100 - (score * 10);

  const getCleanlinessLabel = (invertedScore) => {
    if (invertedScore <= 35) return 'Needs Deep Cleaning';
    if (invertedScore <= 40) return 'Requires Attention';
    return 'Very Clean';
  };
  
  const getCleanlinessColor = (invertedScore) => {
    if (invertedScore <= 35) return '#e74c3c';
    if (invertedScore <= 40) return '#f1c40f';
    return '#2ecc71';
  };

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await userService.getUpdatedImageUrls(scheduleId);
      const res = response.data.data;
      const getCleanerById = (id) => res.assignedTo.find(cleaner => cleaner.cleanerId === id);
      const cl = getCleanerById(currentUserId);
      
      if (cl?.checklist?.details) {
        const details = cl.checklist.details;
        setSelectedImages(details);
        
        // Convert details object to rooms array - INCLUDING EXTRA ROOM
        const roomArray = Object.keys(details).map(key => {
          const roomData = details[key];
          const isExtraRoom = key === 'Extra';
          
          return {
            id: key,
            name: isExtraRoom ? 'Extra Tasks' : formatRoomTitle(key),
            type: isExtraRoom ? 'extra' : key.split('_')[0],
            tasks: roomData.tasks || [],
            photos: roomData.photos || [],
            completed: isExtraRoom 
              ? (roomData.tasks || []).every(task => task.value === true) 
              : (roomData.tasks || []).every(task => task.value === true) && 
                (roomData.photos || []).length >= 3,
            isExtra: isExtraRoom
          };
        }); // No filter - include all rooms
        
        setRooms(roomArray);
        setTasks(details);
        setFee(cl.checklist.price || 0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [scheduleId, currentUserId]);

  const fetchHostPushTokens = useCallback(async () => {
    const response = await userService.getUserPushTokens(hostId);
    setHostPushToken(response.data.tokens);
  }, [hostId]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchData = async () => {
        try {
          await fetchImages();
          await fetchHostPushTokens();
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      if (isActive) fetchData();
      return () => { isActive = false; };
    }, [fetchImages, fetchHostPushTokens])
  );

  useEffect(() => {
    if (currentImages[currentImageIndex]?.cleanliness) {
      pan.setValue({ x: 0, y: 0 });
      overlayOpacity.setValue(1);
    }
  }, [currentImageIndex]);

  const openImageViewer = useCallback((images, index, category) => {
    pan.setValue({ x: 0, y: 0 });
    overlayOpacity.setValue(1);

    const formattedImages = images.map(photo => {
      const score = invertPercentage(photo.cleanliness?.individual_overall || 0);
      const status = getCleanlinessLabel(score);
      
      return {
        url: status === "Very Clean" ? photo.img_url : photo.cleanliness?.heatmap_url || photo.img_url,
        cleanliness: photo.cleanliness,
        props: { source: { uri: status === "Very Clean" ? photo.img_url : photo.cleanliness?.heatmap_url } },
        category: category
      };
    });
  
    setCurrentImages(formattedImages);
    setCurrentImageIndex(index);
    setBeforeModalVisible(true);
  }, []);

  // Take picture with camera - EXACTLY LIKE BeforePhoto
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
          filename: `photo_${Date.now()}.jpg`,
          file: `data:image/jpeg;base64,${photo.base64}`
        };
        
        if (photos.length < MAX_IMAGES_UPLOAD) {
          setPhotos(prev => [...prev, newPhoto]);
        } else {
          Alert.alert('Limit reached', `Maximum ${MAX_IMAGES_UPLOAD} photos allowed`);
        }
      } catch (error) {
        console.error('Camera error:', error);
        Alert.alert('Error', 'Failed to capture image. Using photo library instead.');
        await pickImageFromLibrary();
      }
    } else {
      await pickImageFromLibrary();
    }
  };

  // Pick image from library - EXACTLY LIKE BeforePhoto
  const pickImageFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
        allowsMultipleSelection: true,
        selectionLimit: MAX_IMAGES_UPLOAD - photos.length
      });

      if (!result.canceled) {
        const newPhotos = result.assets.map((asset, index) => ({
          uri: asset.uri,
          base64: asset.base64,
          filename: `photo_${Date.now()}_${index}.jpg`,
          file: `data:image/jpeg;base64,${asset.base64}`
        }));

        if (photos.length + newPhotos.length <= MAX_IMAGES_UPLOAD) {
          setPhotos(prev => [...prev, ...newPhotos]);
        } else {
          Alert.alert('Limit reached', `Maximum ${MAX_IMAGES_UPLOAD} photos allowed`);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image from library');
    }
  };

  // Flip camera - EXACTLY LIKE BeforePhoto
  const flipCamera = () => {
    setFacing(current => current === 'back' ? 'front' : 'back');
  };

  const openCamera = (taskTitle) => {
    setSelectedTaskTitle(taskTitle);
    setPhotos([]);
    setIsCameraReady(false);
    setCameraVisible(true);
  };

  const validateTasks = () => {
    if (!selectedImages || Object.keys(selectedImages).length === 0) {
      Alert.alert("Validation Error", "No tasks or images found for validation.");
      return false;
    }

    let invalidCategories = [];
    let insufficientImagesCategories = [];

    Object.keys(selectedImages).forEach((category) => {
      const categoryData = selectedImages[category];
      if (!categoryData || !categoryData.tasks || !Array.isArray(categoryData.tasks)) return;

      const { tasks, photos } = categoryData;
      const isExtraRoom = category === 'Extra';
      const allTasksCompleted = tasks.every((task) => task.value === true);
      
      if (!allTasksCompleted) invalidCategories.push(category);
      
      // Only check photos for non-extra rooms
      if (!isExtraRoom && (!photos || photos.length < 3)) {
        insufficientImagesCategories.push(category);
      }
    });

    if (invalidCategories.length > 0 || insufficientImagesCategories.length > 0) {
      let errorMessage = "";
      if (invalidCategories.length > 0) errorMessage += `Incomplete tasks in: ${invalidCategories.join(", ")}.\n`;
      if (insufficientImagesCategories.length > 0) errorMessage += `Insufficient images in: ${insufficientImagesCategories.join(", ")}.`;
      Alert.alert("Validation Error", errorMessage);
      return false;
    }

    return true;
  };

  const onSubmit = async () => {
    if (photos.length === 0) {
      Alert.alert('No Photos', 'Please take at least one photo before uploading.');
      return;
    }

    if (photos.length > MAX_IMAGES_UPLOAD) {
      Alert.alert('Upload Limit Exceeded', `You can only upload up to ${MAX_IMAGES_UPLOAD} images at a time.`);
      return;
    }
  
    setIsUploading(true);
    
    // Prepare images for upload - EXACTLY LIKE BeforePhoto
    const imagesToUpload = photos.map(photo => ({
      filename: photo.filename,
      file: photo.file
    }));

    const data = {
      photo_type: 'after_photos',
      scheduleId: scheduleId,
      images: imagesToUpload,
      currentUserId: currentUserId,
      task_title: selectedTaskTitle,
      updated_tasks: selectedImages,
    };

    try {
      const response = await userService.uploadTaskPhotos(data);
      if (response.status === 200) {
        Alert.alert('Upload Successful', `${photos.length} photos have been uploaded successfully!`);
        fetchImages();
        setPhotos([]);
        setCameraVisible(false);
      }
    } catch (err) {
      console.error('Error uploading photos:', err);
      Alert.alert('Upload Failed', 'An error occurred while uploading your photos.');
    } finally {
      setIsUploading(false);
    }
  };

  const updateTasksInBackend = async (category, updatedTasks) => {
    try {
      const data = { scheduleId, cleanerId: currentUserId, category, tasks: updatedTasks };
      await userService.updateChecklist(data);
    } catch (err) {
      console.error("Error updating tasks:", err);
    }
  };
  
  const handleTaskToggle = (category, taskId) => {
    setSelectedImages((prevSelectedImages) => {
      const updatedImages = { ...prevSelectedImages };
      if (!updatedImages[category]) return prevSelectedImages;

      updatedImages[category].tasks = updatedImages[category].tasks.map((task) =>
        task.id === taskId ? { ...task, value: !task.value } : task
      );

      updateTasksInBackend(category, updatedImages[category].tasks);
      return updatedImages;
    });
  };

  const removePhoto = (index) => {
    setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
  };

  const handleDeletePhoto = async (indexToDelete, category) => {
    try {
      const photoToDelete = selectedImages[category]?.photos[indexToDelete];
      if (!photoToDelete) {
        Alert.alert("Error", "Photo not found");
        return;
      }

      const originalFilename = photoToDelete.img_url.split('/').pop();
      const heatmapFilename = photoToDelete.cleanliness?.heatmap_url?.split('/').pop();

      setSelectedImages(prev => {
        const updated = {...prev};
        updated[category].photos = updated[category].photos.filter((_, i) => i !== indexToDelete);
        return updated;
      });

      const data = { originalFilename, heatmapFilename, category, scheduleId };
      await userService.deleteSpaceAfterPhoto(data);
      updateTasksInBackend(selectedImages);

    } catch (error) {
      console.error('Delete failed:', error);
      setSelectedImages(prev => ({...prev}));
      Alert.alert('Deletion Failed', error.response?.data?.detail || 'Could not delete photo');
    }
  };

  const submitCompletion = useCallback(async () => {
    if (!validateTasks()) return;
    setIsLoading(true);
    try {
      await userService.finishCleaning({
        scheduleId,
        cleanerId: currentUserId,
        completed_tasks: selectedImages,
        fee: parseFloat(cleaning_fee),
        completionTime: new Date()
      });
      sendPushNotifications(hostTokens, 
        `${currentUser.firstname} Completed Cleaning`,
        `${currentUser.firstname} ${currentUser.lastname} has completed the cleaning.`,
        { screen: ROUTES.host_task_progress, params: { scheduleId } }
      );
      Alert.alert("Success", "Cleaning completed successfully!");
    } finally {
      setIsLoading(false);
    }
  }, [selectedImages, hostTokens, scheduleId, currentUser]);

  const getRoomProgress = (room) => {
    if (!selectedImages[room.id]) return 0;
    const roomData = selectedImages[room.id];
    const isExtraRoom = room.id === 'Extra';
    
    const taskProgress = roomData.tasks?.length > 0 
      ? (roomData.tasks.filter(t => t.value).length / roomData.tasks.length) * (isExtraRoom ? 100 : 50) 
      : 0;
    
    // For extra rooms, don't require photos - only tasks matter
    const photoProgress = isExtraRoom ? 0 : Math.min((roomData.photos?.length || 0 / 3) * 50, 50);
    
    return taskProgress + photoProgress;
  };

  const isRoomComplete = (room) => {
    if (!selectedImages[room.id]) return false;
    const roomData = selectedImages[room.id];
    
    const isExtraRoom = room.id === 'Extra';
    const tasksComplete = roomData.tasks?.every(task => task.value === true) || false;
    // For extra rooms, we don't require photos
    const photosComplete = isExtraRoom ? true : (roomData.photos?.length || 0) >= 3;
    
    return tasksComplete && photosComplete;
  };

  const allRoomsComplete = rooms.every(room => isRoomComplete(room));

  const markRoomComplete = (roomId) => {
    Alert.alert(
      "Mark Room Complete",
      "Are you sure this room is fully cleaned and all photos are taken?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Mark Complete", 
          onPress: () => {
            setRooms(prev => prev.map(room => 
              room.id === roomId ? { ...room, completed: true } : room
            ));
            Alert.alert("Success", "Room marked as complete!");
          }
        }
      ]
    );
  };

  const getRoomIcon = (type) => {
    switch(type.toLowerCase()) {
      case 'bedroom': return 'bed';
      case 'bathroom': return 'shower';
      case 'kitchen': return 'silverware-fork-knife';
      case 'livingroom': return 'sofa';
      case 'extra': return 'plus-circle';
      default: return 'home';
    }
  };

  const onCloseCamera = () => {
    setCameraVisible(false);
    setPhotos([]);
  };

  const RoomCard = ({ room }) => {
    const progress = getRoomProgress(room);
    const isComplete = isRoomComplete(room);
    const roomData = selectedImages[room.id] || {};
    
    return (
      <TouchableOpacity 
        style={[
          styles.roomCard,
          selectedRoom?.id === room.id && styles.selectedRoomCard,
          isComplete && styles.completedRoomCard
        ]}
        onPress={() => setSelectedRoom(room)}
      >
        <View style={styles.roomCardHeader}>
          <View style={[
            styles.roomIcon,
            isComplete && styles.completedRoomIcon
          ]}>
            <MaterialCommunityIcons 
              name={getRoomIcon(room.type)} 
              size={24} 
              color={isComplete ? "#4CAF50" : COLORS.primary} 
            />
          </View>
          <View style={styles.roomInfo}>
            <Text style={styles.roomName}>{room.name}</Text>
            <Text style={styles.roomStatus}>
              {isComplete ? "✓ Complete" : "In Progress"}
            </Text>
          </View>
          <View style={styles.roomStats}>
            <Text style={styles.roomStat}>
              📸 {roomData.photos?.length || 0}/{room.isExtra ? 'Optional' : '3'}
            </Text>
            <Text style={styles.roomStat}>
              ✅ {roomData.tasks?.filter(t => t.value).length || 0}/{roomData.tasks?.length || 0}
            </Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${progress}%`, 
                  backgroundColor: isComplete ? '#4CAF50' : COLORS.primary 
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}% complete</Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.roomActionButton,
            isComplete ? styles.reviewButton : styles.startButton
          ]}
          onPress={() => setSelectedRoom(room)}
        >
          <Text style={styles.roomActionButtonText}>
            {isComplete ? "Review" : "Continue"}
          </Text>
          <Ionicons 
            name={isComplete ? "eye" : "arrow-forward"} 
            size={16} 
            color="white" 
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const RoomWorkspace = ({ room, onBack }) => {
    const roomData = selectedImages[room.id] || {};
    const isExtraRoom = room.id === 'Extra';
    
    return (
      <View style={styles.workspace}>
        <View style={styles.workspaceHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.roomTitleSection}>
            <Text style={styles.workspaceRoomTitle}>{room.name}</Text>
            <Text style={styles.workspaceRoomSubtitle}>
              {isRoomComplete(room) ? "Completed" : "In Progress"}
            </Text>
          </View>
          <CircularProgress
            value={getRoomProgress(room)}
            radius={24}
            duration={1000}
            progressValueColor={isRoomComplete(room) ? "#4CAF50" : COLORS.primary}
            activeStrokeColor={isRoomComplete(room) ? "#4CAF50" : COLORS.primary}
            activeStrokeWidth={4}
            inActiveStrokeWidth={4}
            inActiveStrokeColor="#e0e0e0"
            maxValue={100}
          />
        </View>
        
        <ScrollView style={styles.workspaceContent} showsVerticalScrollIndicator={false}>
          {/* Photos Section (for all rooms, but optional for extra rooms) */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="camera" size={22} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>
                {isExtraRoom ? "Additional Photos (Optional)" : "After Photos"}
              </Text>
              {!isExtraRoom && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {roomData.photos?.length || 0}/3
                  </Text>
                </View>
              )}
            </View>
            
            <Text style={styles.sectionDescription}>
              {isExtraRoom 
                ? "Take photos of any additional cleaning tasks if needed"
                : "Take photos of the same areas as your before photos"}
            </Text>
            
            {/* Photo Gallery */}
            <View style={styles.photoGallery}>
              <FlatList
                data={roomData.photos || []}
                horizontal
                keyExtractor={(item, index) => `${item.id}_${index}`}
                renderItem={({ item, index }) => (
                  <ThumbnailItem
                    photo={item}
                    index={index}
                    taskTitle={room.id}
                    photosArray={roomData.photos || []}
                    onDelete={handleDeletePhoto}
                    openImageViewer={openImageViewer}
                    invertPercentage={invertPercentage}
                    getCleanlinessColor={getCleanlinessColor}
                  />
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.previewContainer}
                ListEmptyComponent={
                  <View style={styles.emptyPhotos}>
                    <Ionicons name="camera-outline" size={40} color="#ddd" />
                    <Text style={styles.emptyPhotosText}>No photos yet</Text>
                    <Text style={styles.emptyPhotosSubtext}>
                      {isExtraRoom 
                        ? "Photos are optional for extra tasks"
                        : "Tap the button below to add photos"}
                    </Text>
                  </View>
                }
              />
            </View>
            
            {/* Add Photo Button */}
            <TouchableOpacity 
              style={styles.addPhotosButton}
              onPress={() => openCamera(room.id)}
            >
              <View style={styles.addButtonContent}>
                <Ionicons name="add-circle" size={24} color="white" />
                <View style={styles.addButtonTextContainer}>
                  <Text style={styles.addButtonMainText}>
                    {isExtraRoom 
                      ? "Add Optional Photos"
                      : roomData.photos?.length >= 3 ? "Add More Photos" : "Take Photos"}
                  </Text>
                  <Text style={styles.addButtonSubText}>
                    {isExtraRoom 
                      ? "Document any additional cleaning work"
                      : roomData.photos?.length >= 3 
                        ? "You can add more photos if needed" 
                        : `At least 3 photos recommended (${3 - (roomData.photos?.length || 0)} more needed)`}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Tasks Section */}
          <View style={[styles.section, isExtraRoom && styles.extraSection]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>
                {isExtraRoom ? "Additional Tasks" : "Cleaning Tasks"}
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {roomData.tasks?.filter(t => t.value).length || 0}/{roomData.tasks?.length || 0}
                </Text>
              </View>
            </View>
            
            <View style={styles.taskProgress}>
              <View style={styles.taskProgressBar}>
                <View style={[
                  styles.taskProgressFill, 
                  { 
                    width: `${roomData.tasks?.length > 0 
                      ? (roomData.tasks.filter(t => t.value).length / roomData.tasks.length) * 100 
                      : 0}%` 
                  }
                ]} />
              </View>
              <Text style={styles.taskProgressText}>
                {roomData.tasks?.filter(t => t.value).length || 0} of {roomData.tasks?.length || 0} tasks completed
              </Text>
            </View>
            
            {/* Task List */}
            <View style={styles.taskList}>
              {roomData.tasks?.map((item, index) => (
                <TouchableOpacity
                  key={`${item.id}_${index}`}
                  style={[
                    styles.taskItem,
                    item.value && styles.taskItemCompleted
                  ]}
                  onPress={() => handleTaskToggle(room.id, item.id)}
                >
                  <View style={styles.taskItemLeft}>
                    <Checkbox.Android
                      status={item.value ? 'checked' : 'unchecked'}
                      onPress={() => {}}
                      color={COLORS.primary}
                      uncheckedColor="#000"
                    />
                    <View style={styles.taskTextContainer}>
                      <Text style={[
                        styles.taskLabel,
                        item.value && styles.taskLabelCompleted
                      ]}>
                        {item.label}
                      </Text>
                      {(item.time || item.price) && (
                        <View style={styles.taskMeta}>
                          {item.time && (
                            <View style={styles.taskMetaItem}>
                              <Ionicons name="time-outline" size={12} color="#666" />
                              <Text style={styles.taskMetaText}>
                                {item.time} min{item.time > 1 ? 's' : ''}
                              </Text>
                            </View>
                          )}
                          {item.price && (
                            <View style={styles.taskMetaItem}>
                              <Ionicons name="cash-outline" size={12} color="#4CAF50" />
                              <Text style={styles.taskMetaText}>
                                ${item.price}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                    
                    {item.value ? (
                    <View style={styles.completedIndicator}>
                      <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    </View>
                    ) : (
                      <Ionicons name="ellipse-outline" size={20} color="#ddd" />
                    )}

                  </View>
                  
                  
                </TouchableOpacity>
              ))}
              
              {(!roomData.tasks || roomData.tasks.length === 0) && (
                <View style={styles.noTasksContainer}>
                  <Ionicons name="list-outline" size={40} color="#ddd" />
                  <Text style={styles.noTasksText}>No tasks assigned</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Completion Requirements */}
          <View style={styles.requirementsSection}>
            <Text style={styles.requirementsTitle}>To complete this {isExtraRoom ? "section" : "room"}:</Text>
            
            {!isExtraRoom && (
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={roomData.photos?.length >= 3 ? "checkmark-circle" : "ellipse-outline"} 
                  size={20} 
                  color={roomData.photos?.length >= 3 ? "#4CAF50" : "#666"} 
                />
                <Text style={[
                  styles.requirementText,
                  roomData.photos?.length >= 3 && styles.requirementTextCompleted
                ]}>
                  Minimum 3 photos ({roomData.photos?.length || 0}/3)
                </Text>
              </View>
            )}
            
            <View style={styles.requirementItem}>
              <Ionicons 
                name={roomData.tasks?.every(t => t.value) ? "checkmark-circle" : "ellipse-outline"} 
                size={20} 
                color={roomData.tasks?.every(t => t.value) ? "#4CAF50" : "#666"} 
              />
              <Text style={[
                styles.requirementText,
                roomData.tasks?.every(t => t.value) && styles.requirementTextCompleted
                ]}>
                All tasks completed ({roomData.tasks?.filter(t => t.value).length || 0}/{roomData.tasks?.length || 0})
              </Text>
            </View>
          </View>
        </ScrollView>
        
        {/* Completion Button */}
        <View style={styles.completionSection}>
          {isRoomComplete(room) ? (
            room.completed ? (
              <View style={styles.alreadyCompleted}>
                <Ionicons name="checkmark-done-circle" size={24} color="#4CAF50" />
                <Text style={styles.alreadyCompletedText}>
                  {room.name} is already completed
                </Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.markCompleteButton}
                onPress={() => markRoomComplete(room.id)}
              >
                <Ionicons name="checkmark-done" size={24} color="white" />
                <View style={styles.markCompleteButtonTexts}>
                  <Text style={styles.markCompleteButtonMain}>
                    Mark {room.name} Complete
                  </Text>
                  <Text style={styles.markCompleteButtonSub}>
                    All requirements are met ✓
                  </Text>
                </View>
              </TouchableOpacity>
            )
          ) : (
            <View style={styles.incompleteRequirements}>
              <Ionicons name="alert-circle" size={24} color="#FF9800" />
              <View style={styles.incompleteRequirementsTexts}>
                <Text style={styles.incompleteRequirementsMain}>
                  Complete requirements to finish
                </Text>
                <Text style={styles.incompleteRequirementsSub}>
                  {!isExtraRoom && roomData.photos?.length < 3 && `${3 - (roomData.photos?.length || 0)} more photos, `}
                  {roomData.tasks?.filter(t => !t.value).length} more tasks
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Before Photos Viewer Modal - CHANGED TO RNModal */}
      <RNModal
        isVisible={isBeforeModalVisible}
        style={styles.fullScreenModal}
        onBackdropPress={() => setBeforeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ImageViewer
            imageUrls={currentImages}
            index={currentImageIndex}
            backgroundColor="black"
            enableSwipeDown
            enableImageZoom
            onSwipeDown={() => setBeforeModalVisible(false)}
            renderImage={(props) => (
              <Image source={props.source} style={styles.fullSizeImage} contentFit="contain" />
            )}
          />
          
          {currentImages[currentImageIndex]?.cleanliness && (
            <Animated.View style={[styles.analysisPanel, { transform: [{ translateY: pan.y }] }]} {...panResponder.panHandlers}>
              <View style={styles.dragHandle} />
              <View style={styles.analysisContent}>
                <Text style={styles.analysisTitle}>CLEANLINESS ANALYSIS</Text>
                
                <View style={styles.scoreSection}>
                  <Text style={styles.sectionTitle}>THIS PHOTO</Text>
                  <View style={styles.scoreRow}>
                    <View style={styles.scoreText}>
                      <Text style={styles.scorePercentage}>
                        {invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0).toFixed(0)}%
                      </Text>
                      <Text style={styles.scoreLabel}>
                        {getCleanlinessLabel(invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0))}
                      </Text>
                    </View>
                    <CircularProgress
                      value={invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0)}
                      radius={35}
                      activeStrokeColor={getCleanlinessColor(invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0))}
                      inActiveStrokeColor="#2d2d2d"
                      maxValue={100}
                    />
                  </View>
                </View>

                <Text style={styles.sectionTitle}>MAIN ISSUES</Text>
                <View style={styles.issuesList}>
                  {Object.entries(currentImages[currentImageIndex].cleanliness.scores || {})
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3)
                    .map(([factor, score]) => (
                      <View key={factor} style={styles.issueItem}>
                        <Text style={styles.issueName}>{factor.replace(/_/g, ' ').toUpperCase()}</Text>
                        <Text style={[styles.issueScore, { color: getCleanlinessColor(100 - (score * 10)) }]}>
                          {(100 - (score * 10)).toFixed(0)}%
                        </Text>
                      </View>
                    ))}
                </View>
              </View>
            </Animated.View>
          )}

          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setBeforeModalVisible(false)}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </RNModal>

      {/* Camera Modal - EXACTLY LIKE BeforePhoto */}
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
              onPress={onCloseCamera}
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
              <Ionicons name="images-outline" size={64} color="white" />
              <Text style={styles.simulatorText}>Camera not available in simulator</Text>
              <Text style={styles.simulatorSubtext}>
                Use "Pick from Library" button below to add photos
              </Text>
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
              {/* Photo Counter */}
              <View style={styles.photoCounter}>
                <Ionicons name="images-outline" size={16} color="white" />
                <Text style={styles.photoCounterText}>
                  {photos.length}/{MAX_IMAGES_UPLOAD}
                </Text>
              </View>
              
              {/* Camera Controls */}
              <View style={styles.cameraControls}>
                <TouchableOpacity 
                  style={styles.captureButton}
                  onPress={takePicture}
                  disabled={photos.length >= MAX_IMAGES_UPLOAD}
                >
                  <View style={styles.captureButtonInner}>
                    <Ionicons name="camera" size={32} color="white" />
                  </View>
                </TouchableOpacity>
              </View>
            </CameraView>
          )}

          {/* Bottom Section with Thumbnails and Upload Button */}
          <View style={styles.bottomSection}>
            {/* Library button when no photos */}
            {photos.length === 0 && permission?.granted && !isSimulator && (
              <TouchableOpacity 
                style={styles.libraryButtonBottom}
                onPress={pickImageFromLibrary}
              >
                <Ionicons name="images" size={20} color="white" />
                <Text style={styles.libraryButtonBottomText}>Pick from Library</Text>
              </TouchableOpacity>
            )}

            {/* Thumbnail preview when photos exist */}
            {photos.length > 0 && (
              <>
                <View style={styles.thumbnailSection}>
                  <Text style={styles.thumbnailTitle}>Selected Photos</Text>
                  <FlatList
                    data={photos}
                    horizontal
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                      <View style={styles.thumbnailWrapper}>
                        <Image 
                          source={{ uri: item.uri || item.file }} 
                          style={styles.preview} 
                        />
                        <TouchableOpacity 
                          onPress={() => removePhoto(index)} 
                          style={styles.removeButton}
                        >
                          <Ionicons name="close-circle" size={20} color="white" />
                        </TouchableOpacity>
                        <View style={styles.previewNumber}>
                          <Text style={styles.previewNumberText}>{index + 1}</Text>
                        </View>
                      </View>
                    )}
                    contentContainerStyle={styles.previewContainer}
                    showsHorizontalScrollIndicator={false}
                  />
                </View>
                
                {/* Upload Button - Always at the bottom */}
                <TouchableOpacity 
                  style={[
                    styles.uploadButton,
                    isUploading && styles.uploadButtonDisabled
                  ]}
                  onPress={onSubmit}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={22} color="white" />
                      <Text style={styles.uploadButtonText}>
                        Upload {photos.length} Photo{photos.length !== 1 ? 's' : ''}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Camera instructions when no photos */}
            {photos.length === 0 && permission?.granted && !isSimulator && (
              <Text style={styles.cameraInstructions}>
                Tap the camera button to capture photos
              </Text>
            )}
          </View>
        </View>
      </RNModal>

      {cameraVisible ? null : (
        <View style={{ flex: 1 }}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <CustomActivityIndicator size={40} />
            </View>
          ) : selectedRoom ? (
            <RoomWorkspace 
              room={selectedRoom}
              onBack={() => setSelectedRoom(null)}
            />
          ) : (
            <>
              <View style={styles.header}>
                <Text style={styles.headline}>After Photos & Tasks</Text>
                <Text style={styles.subtitle}>
                  Complete rooms in any order. Each room needs 3+ photos (except Extra Tasks) and all tasks checked.
                </Text>

                <View style={styles.minimalProgressRow}>
                  <View style={styles.minimalProgressLeft}>
                    <Text style={styles.minimalProgressTitle}>Progress</Text>
                    <View style={styles.minimalProgressBar}>
                      <View 
                        style={[
                          styles.minimalProgressFill, 
                          { 
                            width: `${(rooms.filter(r => isRoomComplete(r)).length / Math.max(rooms.length, 1)) * 100}%`,
                            backgroundColor: COLORS.primary
                          }
                        ]} 
                      />
                    </View>
                  </View>
                  
                  <View style={styles.minimalProgressRight}>
                    <Text style={styles.minimalProgressPercentage}>
                      {Math.round((rooms.filter(r => isRoomComplete(r)).length / Math.max(rooms.length, 1)) * 100)}%
                    </Text>
                    <Text style={styles.minimalProgressText}>
                      {rooms.filter(r => isRoomComplete(r)).length}/{rooms.length} rooms
                    </Text>
                  </View>
                </View>
              </View>
              
              <Text style={styles.sectionTitle}>All Rooms</Text>
              <ScrollView style={styles.roomsContainer}>
                {rooms.length > 0 ? (
                  rooms.map(room => (
                    <RoomCard key={room.id} room={room} />
                  ))
                ) : (
                  <View style={styles.noRoomsContainer}>
                    <Ionicons name="home-outline" size={48} color={COLORS.gray} />
                    <Text style={styles.noRoomsText}>No rooms assigned</Text>
                  </View>
                )}
              </ScrollView>
              
              <TouchableOpacity 
                style={[
                  styles.finishButton,
                  !allRoomsComplete && styles.disabledFinishButton
                ]}
                onPress={submitCompletion}
                disabled={!allRoomsComplete}
              >
                <Ionicons name="checkmark-done-circle" size={24} color="white" />
                <View style={styles.finishButtonTexts}>
                  <Text style={styles.finishButtonMain}>
                    {allRoomsComplete ? "Finish Cleaning" : "Complete All Rooms First"}
                  </Text>
                  <Text style={styles.finishButtonSub}>
                    {allRoomsComplete 
                      ? "All rooms are complete!" 
                      : `${rooms.filter(r => !isRoomComplete(r)).length} room(s) remaining`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="white" />
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 10,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  simulatorWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  simulatorWarningText: {
    fontSize: 14,
    color: '#856404',
    marginLeft: 8,
    fontWeight: '500',
  },
  progressCard: {
    margin: 16,
    padding: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  roomsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  roomCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedRoomCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#f8fbff',
  },
  completedRoomCard: {
    borderColor: '#d4edda',
    backgroundColor: '#f0f9f0',
  },
  roomCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  completedRoomIcon: {
    backgroundColor: '#e8f5e8',
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  roomStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  roomStats: {
    alignItems: 'flex-end',
  },
  roomStat: {
    fontSize: 12,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  roomActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  startButton: {
    backgroundColor: COLORS.primary,
  },
  reviewButton: {
    backgroundColor: '#4CAF50',
  },
  roomActionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    margin: 16,
    padding: 18,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledFinishButton: {
    backgroundColor: '#ccc',
  },
  finishButtonTexts: {
    flex: 1,
    marginLeft: 12,
  },
  finishButtonMain: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  finishButtonSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  workspace: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  workspaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 12,
  },
  roomTitleSection: {
    flex: 1,
  },
  workspaceRoomTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  workspaceRoomSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  workspaceContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  extraSection: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    marginLeft: 'auto',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  photoGallery: {
    marginBottom: 16,
  },
  addPhotosButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  addButtonMainText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  addButtonSubText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  taskProgress: {
    marginBottom: 16,
  },
  taskProgressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 8,
  },
  taskProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  taskProgressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  taskList: {
    marginBottom: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taskItemCompleted: {
    backgroundColor: '#f9f9f9',
  },
  taskItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  taskLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  taskLabelCompleted: {
    color: '#666',
    textDecorationLine: 'line-through',
  },
  taskMeta: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 12,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskMetaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  completedIndicator: {
    marginLeft: 8,
  },
  noTasksContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noTasksText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  requirementsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  requirementTextCompleted: {
    color: '#4CAF50',
  },
  completionSection: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  markCompleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  markCompleteButtonTexts: {
    marginLeft: 12,
    flex: 1,
  },
  markCompleteButtonMain: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  markCompleteButtonSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  alreadyCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  alreadyCompletedText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 8,
  },
  incompleteRequirements: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  incompleteRequirementsTexts: {
    marginLeft: 12,
    flex: 1,
  },
  incompleteRequirementsMain: {
    fontSize: 16,
    color: '#FF9800',
    fontWeight: '600',
  },
  incompleteRequirementsSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  
  // Camera Modal Styles - EXACTLY LIKE BeforePhoto
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
    bottom: 255, // EXACTLY LIKE BeforePhoto
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
  
  // Bottom Section Styles - EXACTLY LIKE BeforePhoto
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  thumbnailSection: {
    marginBottom: 16,
  },
  thumbnailTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 8,
  },
  thumbnailWrapper: {
    marginHorizontal: 4,
    position: 'relative',
  },
  preview: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    padding: 2,
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
  previewContainer: {
    paddingHorizontal: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  libraryButtonBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  libraryButtonBottomText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  cameraInstructions: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  
  // Other Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  modalCloseButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  fullSizeImage: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbnailContainer: { 
    marginRight: 12,
    marginBottom: 0,
    position: 'relative',
  },
  warningBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#e74c3c',
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
  emptyPhotos: {
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
  emptyPhotosText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  emptyPhotosSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  analysisPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  analysisContent: {
    maxHeight: 400,
  },
  analysisTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  scoreSection: {
    marginBottom: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreText: {
    flex: 1,
  },
  scorePercentage: {
    color: 'white',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  scoreLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.9,
  },
  issuesList: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 8,
  },
  issueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  issueName: {
    color: 'white',
    fontSize: 14,
    flex: 2,
    opacity: 0.9,
  },
  issueScore: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  noRoomsContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 20,
  },
  noRoomsText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 12,
  },
  minimalProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop:16
  },
  minimalProgressLeft: {
    flex: 1,
    marginRight: 12,
  },
  minimalProgressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 6,
  },
  minimalProgressBar: {
    height: 4,
    backgroundColor: '#e8e8e8',
    borderRadius: 2,
    overflow: 'hidden',
  },
  minimalProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  minimalProgressRight: {
    alignItems: 'flex-end',
  },
  minimalProgressPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  minimalProgressText: {
    fontSize: 12,
    color: '#666',
  },
});

export default AfterPhoto;