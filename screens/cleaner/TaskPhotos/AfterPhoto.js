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
// import { Checkbox } from 'react-native-paper';
// import ImageViewer from 'react-native-image-zoom-viewer';
// import RNModal from 'react-native-modal';
// import { sendPushNotifications } from '../../../utils/sendPushNotification';
// import ROUTES from '../../../constants/routes';
// import CircularProgress from 'react-native-circular-progress-indicator';
// import { Image } from 'expo-image'; 
// import CustomActivityIndicator from '../../../components/shared/CuustomActivityIndicator';
// import formatRoomTitle from '../../../utils/formatRoomTitle';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import * as ImagePicker from 'expo-image-picker';
// import { tSafe } from '../../../utils/tSafe';

// const { width, height } = Dimensions.get('window');

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
//       tSafe('delete_photo_title', 'Delete Photo'),
//       tSafe('delete_photo_confirmation', 'Are you sure you want to permanently delete this photo?'),
//       [
//         { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
//         { 
//           text: tSafe('delete', 'Delete'), 
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
//   const [selectedRoom, setSelectedRoom] = useState(null);
//   const [rooms, setRooms] = useState([]);
  
//   const [permission, requestPermission] = useCameraPermissions();
//   const [facing, setFacing] = useState('back');
//   const [isCameraReady, setIsCameraReady] = useState(false);
//   const [isSimulator, setIsSimulator] = useState(false);
  
//   useEffect(() => {
//     if (Platform.OS === 'ios' && Platform.isPad) {
//       setIsSimulator(true);
//     }
//   }, []);

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

//   const invertPercentage = (score) => 100 - (score * 10);

//   const getCleanlinessLabel = (invertedScore) => {
//     if (invertedScore <= 35) return tSafe('needs_deep_cleaning', 'Needs Deep Cleaning');
//     if (invertedScore <= 40) return tSafe('requires_attention', 'Requires Attention');
//     return tSafe('very_clean', 'Very Clean');
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
        
//         const roomArray = Object.keys(details).map(key => {
//           const roomData = details[key];
//           const isExtraRoom = key === 'Extra';
          
//           return {
//             id: key,
//             name: isExtraRoom ? tSafe('extra_tasks', 'Extra Tasks') : formatRoomTitle(key),
//             type: isExtraRoom ? 'extra' : key.split('_')[0],
//             tasks: roomData.tasks || [],
//             photos: roomData.photos || [],
//             completed: isExtraRoom 
//               ? (roomData.tasks || []).every(task => task.value === true) 
//               : (roomData.tasks || []).every(task => task.value === true) && 
//                 (roomData.photos || []).length >= 3,
//             isExtra: isExtraRoom
//           };
//         });
        
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
//           filename: `photo_${Date.now()}.jpg`,
//           file: `data:image/jpeg;base64,${photo.base64}`
//         };
        
//         if (photos.length < MAX_IMAGES_UPLOAD) {
//           setPhotos(prev => [...prev, newPhoto]);
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
//           uri: asset.uri,
//           base64: asset.base64,
//           filename: `photo_${Date.now()}_${index}.jpg`,
//           file: `data:image/jpeg;base64,${asset.base64}`
//         }));

//         if (photos.length + newPhotos.length <= MAX_IMAGES_UPLOAD) {
//           setPhotos(prev => [...prev, ...newPhotos]);
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
//       Alert.alert(
//         tSafe('validation_error_title', 'Validation Error'),
//         tSafe('no_tasks_or_images', 'No tasks or images found for validation.')
//       );
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
      
//       if (!isExtraRoom && (!photos || photos.length < 3)) {
//         insufficientImagesCategories.push(category);
//       }
//     });

//     if (invalidCategories.length > 0 || insufficientImagesCategories.length > 0) {
//       let errorMessage = "";
//       if (invalidCategories.length > 0) errorMessage += tSafe('incomplete_tasks', 'Incomplete tasks in: {categories}.\n', { categories: invalidCategories.join(", ") });
//       if (insufficientImagesCategories.length > 0) errorMessage += tSafe('insufficient_images', 'Insufficient images in: {categories}.', { categories: insufficientImagesCategories.join(", ") });
//       Alert.alert(tSafe('validation_error_title', 'Validation Error'), errorMessage);
//       return false;
//     }

//     return true;
//   };

//   const onSubmit = async () => {
//     if (photos.length === 0) {
//       Alert.alert(
//         tSafe('no_photos_title', 'No Photos'),
//         tSafe('take_photo_before_upload', 'Please take at least one photo before uploading.')
//       );
//       return;
//     }

//     if (photos.length > MAX_IMAGES_UPLOAD) {
//       Alert.alert(
//         tSafe('upload_limit_exceeded_title', 'Upload Limit Exceeded'),
//         tSafe('max_photos_allowed_upload', 'You can only upload up to {count} images at a time.', { count: MAX_IMAGES_UPLOAD })
//       );
//       return;
//     }
  
//     setIsUploading(true);
    
//     const imagesToUpload = photos.map(photo => ({
//       filename: photo.filename,
//       file: photo.file
//     }));

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
//         Alert.alert(
//           tSafe('upload_successful_title', 'Upload Successful'),
//           tSafe('photos_uploaded_count', '{count} photos have been uploaded successfully!', { count: photos.length })
//         );
//         fetchImages();
//         setPhotos([]);
//         setCameraVisible(false);
//       }
//     } catch (err) {
//       console.error('Error uploading photos:', err);
//       Alert.alert(
//         tSafe('upload_failed_title', 'Upload Failed'),
//         tSafe('upload_error_message', 'An error occurred while uploading your photos.')
//       );
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
//         Alert.alert(tSafe('error_title', 'Error'), tSafe('photo_not_found', 'Photo not found'));
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
//       Alert.alert(
//         tSafe('deletion_failed_title', 'Deletion Failed'),
//         error.response?.data?.detail || tSafe('could_not_delete_photo', 'Could not delete photo')
//       );
//     }
//   };

//   // ─── TaskItem (memo) ──────────────────────────────────────────────
//   const TaskItem = React.memo(({ task, roomId, onToggle }) => {
//     const handlePress = useCallback(() => onToggle(roomId, task.id), [roomId, task.id, onToggle]);
  
//     return (
//       <TouchableOpacity
//         style={[styles.taskItem, task.value && styles.taskItemCompleted]}
//         onPress={handlePress}
//         activeOpacity={0.7}
//       >
//         <View style={styles.taskItemLeft}>
//           <Checkbox.Android
//             status={task.value ? 'checked' : 'unchecked'}
//             onPress={() => {}}
//             color={COLORS.primary}
//             uncheckedColor="#000"
//             pointerEvents="none"   // ✅ allows parent TouchableOpacity to handle press
//           />
//           <View style={styles.taskTextContainer}>
//             <Text style={[styles.taskLabel, task.value && styles.taskLabelCompleted]}>
//               {task.label}
//             </Text>
//             {(task.time || task.price) && (
//               <View style={styles.taskMeta}>
//                 {task.time && (
//                   <View style={styles.taskMetaItem}>
//                     <Ionicons name="time-outline" size={12} color="#666" />
//                     <Text style={styles.taskMetaText}>
//                       {task.time} {tSafe('min', 'min')}{task.time > 1 ? 's' : ''}
//                     </Text>
//                   </View>
//                 )}
//                 {task.price && (
//                   <View style={styles.taskMetaItem}>
//                     <Ionicons name="cash-outline" size={12} color="#4CAF50" />
//                     <Text style={styles.taskMetaText}>
//                       ${task.price}
//                     </Text>
//                   </View>
//                 )}
//               </View>
//             )}
//           </View>
//           {task.value ? (
//             <View style={styles.completedIndicator}>
//               <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
//             </View>
//           ) : (
//             <Ionicons name="ellipse-outline" size={20} color="#ddd" />
//           )}
//         </View>
//       </TouchableOpacity>
//     );
//   });

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
//         tSafe('cleaner_completed_cleaning_title', '{name} Completed Cleaning', { name: currentUser.firstname }),
//         tSafe('cleaner_completed_cleaning_message', '{firstname} {lastname} has completed the cleaning.', { firstname: currentUser.firstname, lastname: currentUser.lastname }),
//         { screen: ROUTES.host_task_progress, params: { scheduleId } }
//       );
//       Alert.alert(tSafe('success_title', 'Success'), tSafe('cleaning_completed', 'Cleaning completed successfully!'));
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
    
//     const photoProgress = isExtraRoom ? 0 : Math.min((roomData.photos?.length || 0 / 3) * 50, 50);
    
//     return taskProgress + photoProgress;
//   };

//   const isRoomComplete = (room) => {
//     if (!selectedImages[room.id]) return false;
//     const roomData = selectedImages[room.id];
    
//     const isExtraRoom = room.id === 'Extra';
//     const tasksComplete = roomData.tasks?.every(task => task.value === true) || false;
//     const photosComplete = isExtraRoom ? true : (roomData.photos?.length || 0) >= 3;
    
//     return tasksComplete && photosComplete;
//   };

//   const allRoomsComplete = rooms.every(room => isRoomComplete(room));

//   const markRoomComplete = (roomId) => {
//     Alert.alert(
//       tSafe('mark_room_complete_title', 'Mark Room Complete'),
//       tSafe('mark_room_complete_confirmation', 'Are you sure this room is fully cleaned and all photos are taken?'),
//       [
//         { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
//         { 
//           text: tSafe('mark_complete', 'Mark Complete'), 
//           onPress: () => {
//             setRooms(prev => prev.map(room => 
//               room.id === roomId ? { ...room, completed: true } : room
//             ));
//             Alert.alert(tSafe('success_title', 'Success'), tSafe('room_marked_complete', 'Room marked as complete!'));
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

// //   const RoomCard = ({ room }) => {
// //     const progress = getRoomProgress(room);
// //     const isComplete = isRoomComplete(room);
// //     const roomData = selectedImages[room.id] || {};
    
// //     return (
// //       <TouchableOpacity 
// //         style={[
// //           styles.roomCard,
// //           selectedRoom?.id === room.id && styles.selectedRoomCard,
// //           isComplete && styles.completedRoomCard
// //         ]}
// //         onPress={() => setSelectedRoom(room)}
// //       >
// //         <View style={styles.roomCardHeader}>
// //           <View style={[
// //             styles.roomIcon,
// //             isComplete && styles.completedRoomIcon
// //           ]}>
// //             <MaterialCommunityIcons 
// //               name={getRoomIcon(room.type)} 
// //               size={24} 
// //               color={isComplete ? "#4CAF50" : COLORS.primary} 
// //             />
// //           </View>
// //           <View style={styles.roomInfo}>
// //             <Text style={styles.roomName}>{room.name}</Text>
// //             <Text style={styles.roomStatus}>
// //               {isComplete ? tSafe('complete_status', '✓ Complete') : tSafe('in_progress_status', 'In Progress')}
// //             </Text>
// //           </View>
// //           <View style={styles.roomStats}>
// //             <Text style={styles.roomStat}>
// //               📸 {roomData.photos?.length || 0}/{room.isExtra ? tSafe('optional', 'Optional') : '3'}
// //             </Text>
// //             <Text style={styles.roomStat}>
// //               ✅ {roomData.tasks?.filter(t => t.value).length || 0}/{roomData.tasks?.length || 0}
// //             </Text>
// //           </View>
// //         </View>
        
// //         <View style={styles.progressContainer}>
// //           <View style={styles.progressBar}>
// //             <View 
// //               style={[
// //                 styles.progressFill, 
// //                 { 
// //                   width: `${progress}%`, 
// //                   backgroundColor: isComplete ? '#4CAF50' : COLORS.primary 
// //                 }
// //               ]} 
// //             />
// //           </View>
// //           <Text style={styles.progressText}>{Math.round(progress)}% {tSafe('complete_percent', 'complete')}</Text>
// //         </View>
        
// //         <TouchableOpacity 
// //           style={[
// //             styles.roomActionButton,
// //             isComplete ? styles.reviewButton : styles.startButton
// //           ]}
// //           onPress={() => setSelectedRoom(room)}
// //         >
// //           <Text style={styles.roomActionButtonText}>
// //             {isComplete ? tSafe('review', 'Review') : tSafe('continue', 'Continue')}
// //           </Text>
// //           <Ionicons 
// //             name={isComplete ? "eye" : "arrow-forward"} 
// //             size={16} 
// //             color="white" 
// //           />
// //         </TouchableOpacity>
// //       </TouchableOpacity>
// //     );
// //   };

// const RoomCard = ({ room }) => {
//     const progress = getRoomProgress(room);
//     const isComplete = isRoomComplete(room);
//     const roomData = selectedImages[room.id] || {};
    
//     // Calculate task completion ratio
//     const totalTasks = roomData.tasks?.length || 0;
//     const completedTasks = roomData.tasks?.filter(t => t.value).length || 0;
//     const taskRatio = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
//     const photoCount = roomData.photos?.length || 0;
//     const photoTarget = room.isExtra ? 0 : 3;
    
//     return (
//       <TouchableOpacity 
//         style={[
//           styles.roomCard,
//           selectedRoom?.id === room.id && styles.selectedRoomCard,
//           isComplete && styles.completedRoomCard
//         ]}
//         onPress={() => setSelectedRoom(room)}
//         activeOpacity={0.9}
//       >
//         {/* Header */}
//         <View style={styles.roomCardHeader}>
//           <View style={styles.roomIconWrapper}>
//             <View style={[
//               styles.roomIcon,
//               isComplete && styles.completedRoomIcon
//             ]}>
//               <MaterialCommunityIcons 
//                 name={getRoomIcon(room.type)} 
//                 size={24} 
//                 color={isComplete ? "#4CAF50" : COLORS.primary} 
//               />
//             </View>
//             {isComplete && (
//               <View style={styles.completeBadge}>
//                 <MaterialCommunityIcons name="check" size={12} color="#fff" />
//               </View>
//             )}
//           </View>
          
//           <View style={styles.roomInfo}>
//             <Text style={styles.roomName}>{room.name}</Text>
//             <View style={styles.roomMeta}>
//               <View style={[
//                 styles.statusChip,
//                 isComplete ? styles.statusChipComplete : styles.statusChipInProgress
//               ]}>
//                 <View style={[
//                   styles.statusDot,
//                   isComplete ? styles.statusDotComplete : styles.statusDotInProgress
//                 ]} />
//                 <Text style={styles.statusChipText}>
//                   {isComplete ? tSafe('complete_status', 'Complete') : tSafe('in_progress_status', 'In Progress')}
//                 </Text>
//               </View>
//             </View>
//           </View>
          
//           <View style={styles.roomStats}>
//             <View style={styles.statItem}>
//               <MaterialCommunityIcons name="camera-outline" size={14} color="#888" />
//               <Text style={styles.statText}>
//                 {photoCount}/{photoTarget === 0 ? '∞' : photoTarget}
//               </Text>
//             </View>
//             <View style={styles.statDivider} />
//             <View style={styles.statItem}>
//               <MaterialCommunityIcons name="check-circle-outline" size={14} color="#888" />
//               <Text style={styles.statText}>
//                 {completedTasks}/{totalTasks}
//               </Text>
//             </View>
//           </View>
//         </View>
        
//         {/* Progress */}
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
//           <View style={styles.progressLabel}>
//             <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
//             <Text style={styles.progressText}>{tSafe('complete_percent', 'complete')}</Text>
//           </View>
//         </View>
        
//         {/* Action */}
//         <TouchableOpacity 
//           style={[
//             styles.roomActionButton,
//             isComplete ? styles.reviewButton : styles.startButton
//           ]}
//           onPress={() => setSelectedRoom(room)}
//           activeOpacity={0.8}
//         >
//           <Text style={styles.roomActionButtonText}>
//             {isComplete ? tSafe('review', 'Review') : tSafe('continue', 'Continue')}
//           </Text>
//           <Ionicons 
//             name={isComplete ? "chevron-forward" : "arrow-forward"} 
//             size={18} 
//             color="white" 
//           />
//         </TouchableOpacity>
//       </TouchableOpacity>
//     );
//   };

//   // ─── RoomWorkspace ──────────────────────────────────────────────
//   const RoomWorkspace = ({ room, onBack }) => {
//     const roomData = selectedImages[room.id] || {};
//     const isExtraRoom = room.id === 'Extra';
    
//     // 👇 Scroll restoration
//     const scrollRef = useRef(null);
//     const scrollOffsetRef = useRef(0);

//     // Restore scroll position after tasks change
//     useEffect(() => {
//       if (scrollRef.current && scrollOffsetRef.current > 0) {
//         requestAnimationFrame(() => {
//           scrollRef.current?.scrollTo({ y: scrollOffsetRef.current, animated: false });
//         });
//       }
//     }, [roomData.tasks]); // depends on tasks array (changes on toggle)

//     return (
//       <View style={styles.workspace}>
//         <View style={styles.workspaceHeader}>
//           <TouchableOpacity onPress={onBack} style={styles.backButton}>
//             <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
//           </TouchableOpacity>
//           <View style={styles.roomTitleSection}>
//             <Text style={styles.workspaceRoomTitle}>{room.name}</Text>
//             <Text style={styles.workspaceRoomSubtitle}>
//               {isRoomComplete(room) ? tSafe('completed', 'Completed') : tSafe('in_progress', 'In Progress')}
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
        
//         <ScrollView
//           ref={scrollRef}
//           onScroll={(e) => { scrollOffsetRef.current = e.nativeEvent.contentOffset.y; }}
//           scrollEventThrottle={16}
//           style={styles.workspaceContent}
//           showsVerticalScrollIndicator={false}
//           removeClippedSubviews={false}
//         >
//           {/* Photos Section */}
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Ionicons name="camera" size={22} color={COLORS.primary} />
//               <Text style={styles.sectionTitle}>
//                 {isExtraRoom ? tSafe('additional_photos_optional', 'Additional Photos (Optional)') : tSafe('after_photos', 'After Photos')}
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
//                 ? tSafe('extra_photos_description', 'Take photos of any additional cleaning tasks if needed')
//                 : tSafe('after_photos_description', 'Take photos of the same areas as your before photos')}
//             </Text>
            
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
//                     <Text style={styles.emptyPhotosText}>{tSafe('no_photos_yet', 'No photos yet')}</Text>
//                     <Text style={styles.emptyPhotosSubtext}>
//                       {isExtraRoom 
//                         ? tSafe('photos_optional_message', 'Photos are optional for extra tasks')
//                         : tSafe('tap_to_add_photos', 'Tap the button below to add photos')}
//                     </Text>
//                   </View>
//                 }
//               />
//             </View>
            
//             <TouchableOpacity 
//               style={styles.addPhotosButton}
//               onPress={() => openCamera(room.id)}
//             >
//               <View style={styles.addButtonContent}>
//                 <Ionicons name="add-circle" size={24} color="white" />
//                 <View style={styles.addButtonTextContainer}>
//                   <Text style={styles.addButtonMainText}>
//                     {isExtraRoom 
//                       ? tSafe('add_optional_photos', 'Add Optional Photos')
//                       : roomData.photos?.length >= 3 ? tSafe('add_more_photos', 'Add More Photos') : tSafe('take_photos', 'Take Photos')}
//                   </Text>
//                   <Text style={styles.addButtonSubText}>
//                     {isExtraRoom 
//                       ? tSafe('document_additional_work', 'Document any additional cleaning work')
//                       : roomData.photos?.length >= 3 
//                         ? tSafe('can_add_more_photos', 'You can add more photos if needed') 
//                         : tSafe('photos_needed', '{count} more needed', { count: 3 - (roomData.photos?.length || 0) })}
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
//                 {isExtraRoom ? tSafe('additional_tasks', 'Additional Tasks') : tSafe('cleaning_tasks', 'Cleaning Tasks')}
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
//                 {roomData.tasks?.filter(t => t.value).length || 0} {tSafe('of', 'of')} {roomData.tasks?.length || 0} {tSafe('tasks_completed', 'tasks completed')}
//               </Text>
//             </View>
            
//             <View style={styles.taskList}>
//               {roomData.tasks?.map((item) => (
//                 <TaskItem
//                   key={item.id}
//                   task={item}
//                   roomId={room.id}
//                   onToggle={handleTaskToggle}
//                 />
//               ))}
              
//               {(!roomData.tasks || roomData.tasks.length === 0) && (
//                 <View style={styles.noTasksContainer}>
//                   <Ionicons name="list-outline" size={40} color="#ddd" />
//                   <Text style={styles.noTasksText}>{tSafe('no_tasks_assigned', 'No tasks assigned')}</Text>
//                 </View>
//               )}
//             </View>
//           </View>
          
//           {/* Completion Requirements */}
//           <View style={styles.requirementsSection}>
//             <Text style={styles.requirementsTitle}>{tSafe('to_complete', 'To complete this {type}:', { type: isExtraRoom ? tSafe('section', 'section') : tSafe('room', 'room') })}</Text>
            
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
//                   {tSafe('minimum_photos', 'Minimum 3 photos ({count}/{total})', { count: roomData.photos?.length || 0, total: 3 })}
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
//                 ]}>
//                 {tSafe('all_tasks_completed', 'All tasks completed ({count}/{total})', { count: roomData.tasks?.filter(t => t.value).length || 0, total: roomData.tasks?.length || 0 })}
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
//                   {room.name} {tSafe('already_completed', 'is already completed')}
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
//                     {tSafe('mark_room_complete', 'Mark {room} Complete', { room: room.name })}
//                   </Text>
//                   <Text style={styles.markCompleteButtonSub}>
//                     {tSafe('all_requirements_met', 'All requirements are met ✓')}
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             )
//           ) : (
//             <View style={styles.incompleteRequirements}>
//               <Ionicons name="alert-circle" size={24} color="#FF9800" />
//               <View style={styles.incompleteRequirementsTexts}>
//                 <Text style={styles.incompleteRequirementsMain}>
//                   {tSafe('complete_requirements_to_finish', 'Complete requirements to finish')}
//                 </Text>
//                 <Text style={styles.incompleteRequirementsSub}>
//                   {!isExtraRoom && roomData.photos?.length < 3 && 
//                     tSafe('more_photos_needed', '{count} more photos, ', { count: 3 - (roomData.photos?.length || 0) })}
//                   {roomData.tasks?.filter(t => !t.value).length} {tSafe('more_tasks', 'more tasks')}
//                 </Text>
//               </View>
//             </View>
//           )}
//         </View>
//       </View>
//     );
//   };

//   // ─── Main render ──────────────────────────────────────────────────
//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Image Viewer Modal */}
//       <RNModal
//         isVisible={isBeforeModalVisible}
//         style={styles.fullScreenModal}
//         onBackdropPress={() => setBeforeModalVisible(false)}
//       >
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
//                 <Text style={styles.analysisTitle}>{tSafe('cleanliness_analysis', 'CLEANLINESS ANALYSIS')}</Text>
                
//                 <View style={styles.scoreSection}>
//                   <Text style={styles.sectionTitle}>{tSafe('this_photo', 'THIS PHOTO')}</Text>
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

//                 <Text style={styles.sectionTitle}>{tSafe('main_issues', 'MAIN ISSUES')}</Text>
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
//       </RNModal>

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
//               onPress={onCloseCamera}
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
//               <Ionicons name="images-outline" size={64} color="white" />
//               <Text style={styles.simulatorText}>{tSafe('camera_not_available_simulator', 'Camera not available in simulator')}</Text>
//               <Text style={styles.simulatorSubtext}>
//                 {tSafe('use_pick_from_library', 'Use "Pick from Library" button below to add photos')}
//               </Text>
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
//               <View style={styles.photoCounter}>
//                 <Ionicons name="images-outline" size={16} color="white" />
//                 <Text style={styles.photoCounterText}>
//                   {photos.length}/{MAX_IMAGES_UPLOAD}
//                 </Text>
//               </View>
              
//               <View style={styles.cameraControls}>
//                 <TouchableOpacity 
//                   style={styles.captureButton}
//                   onPress={takePicture}
//                   disabled={photos.length >= MAX_IMAGES_UPLOAD}
//                 >
//                   <View style={styles.captureButtonInner}>
//                     <Ionicons name="camera" size={32} color="white" />
//                   </View>
//                 </TouchableOpacity>
//               </View>
//             </CameraView>
//           )}

//           <View style={styles.bottomSection}>
//             {photos.length === 0 && permission?.granted && !isSimulator && (
//               <TouchableOpacity 
//                 style={styles.libraryButtonBottom}
//                 onPress={pickImageFromLibrary}
//               >
//                 <Ionicons name="images" size={20} color="white" />
//                 <Text style={styles.libraryButtonBottomText}>{tSafe('pick_from_library', 'Pick from Library')}</Text>
//               </TouchableOpacity>
//             )}

//             {photos.length > 0 && (
//               <>
//                 <View style={styles.thumbnailSection}>
//                   <Text style={styles.thumbnailTitle}>{tSafe('selected_photos', 'Selected Photos')}</Text>
//                   <FlatList
//                     data={photos}
//                     horizontal
//                     keyExtractor={(item, index) => index.toString()}
//                     renderItem={({ item, index }) => (
//                       <View style={styles.thumbnailWrapper}>
//                         <Image 
//                           source={{ uri: item.uri || item.file }} 
//                           style={styles.preview} 
//                         />
//                         <TouchableOpacity 
//                           onPress={() => removePhoto(index)} 
//                           style={styles.removeButton}
//                         >
//                           <Ionicons name="close-circle" size={20} color="white" />
//                         </TouchableOpacity>
//                         <View style={styles.previewNumber}>
//                           <Text style={styles.previewNumberText}>{index + 1}</Text>
//                         </View>
//                       </View>
//                     )}
//                     contentContainerStyle={styles.previewContainer}
//                     showsHorizontalScrollIndicator={false}
//                   />
//                 </View>
                
//                 <TouchableOpacity 
//                   style={[
//                     styles.uploadButton,
//                     isUploading && styles.uploadButtonDisabled
//                   ]}
//                   onPress={onSubmit}
//                   disabled={isUploading}
//                 >
//                   {isUploading ? (
//                     <ActivityIndicator size="small" color="white" />
//                   ) : (
//                     <>
//                       <Ionicons name="cloud-upload-outline" size={22} color="white" />
//                       <Text style={styles.uploadButtonText}>
//                         {tSafe('upload_photos', 'Upload {count} photo{plural}', { count: photos.length, plural: photos.length !== 1 ? 's' : '' })}
//                       </Text>
//                     </>
//                   )}
//                 </TouchableOpacity>
//               </>
//             )}

//             {photos.length === 0 && permission?.granted && !isSimulator && (
//               <Text style={styles.cameraInstructions}>
//                 {tSafe('camera_instructions', 'Tap the camera button to capture photos')}
//               </Text>
//             )}
//           </View>
//         </View>
//       </RNModal>

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
//                 <Text style={styles.headline}>{tSafe('after_photos_tasks', 'After Photos & Tasks')}</Text>
//                 <Text style={styles.subtitle}>
//                   {tSafe('complete_rooms_order', 'Complete rooms in any order. Each room needs 3+ photos (except Extra Tasks) and all tasks checked.')}
//                 </Text>

//                 <View style={styles.minimalProgressRow}>
//                   <View style={styles.minimalProgressLeft}>
//                     <Text style={styles.minimalProgressTitle}>{tSafe('progress', 'Progress')}</Text>
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
//                       {rooms.filter(r => isRoomComplete(r)).length}/{rooms.length} {tSafe('rooms', 'rooms')}
//                     </Text>
//                   </View>
//                 </View>
//               </View>
              
//               <Text style={styles.sectionTitle}>{tSafe('all_rooms', 'All Rooms')}</Text>
//               <ScrollView style={styles.roomsContainer}>
//                 {rooms.length > 0 ? (
//                   rooms.map(room => (
//                     <RoomCard key={room.id} room={room} />
//                   ))
//                 ) : (
//                   <View style={styles.noRoomsContainer}>
//                     <Ionicons name="home-outline" size={48} color={COLORS.gray} />
//                     <Text style={styles.noRoomsText}>{tSafe('no_rooms_assigned', 'No rooms assigned')}</Text>
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
//                     {allRoomsComplete ? tSafe('finish_cleaning', 'Finish Cleaning') : tSafe('complete_all_rooms_first', 'Complete All Rooms First')}
//                   </Text>
//                   <Text style={styles.finishButtonSub}>
//                     {allRoomsComplete 
//                       ? tSafe('all_rooms_complete', 'All rooms are complete!') 
//                       : tSafe('rooms_remaining', '{count} room(s) remaining', { count: rooms.filter(r => !isRoomComplete(r)).length })}
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
  
//   // Camera Modal Styles - EXACTLY LIKE BeforePhoto
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
//     bottom: 255, // EXACTLY LIKE BeforePhoto
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
  
//   // Bottom Section Styles - EXACTLY LIKE BeforePhoto
//   bottomSection: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: 'rgba(0,0,0,0.8)',
//     paddingTop: 16,
//     paddingBottom: Platform.OS === 'ios' ? 34 : 16,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   thumbnailSection: {
//     marginBottom: 16,
//   },
//   thumbnailTitle: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 16,
//     marginBottom: 8,
//   },
//   thumbnailWrapper: {
//     marginHorizontal: 4,
//     position: 'relative',
//   },
//   preview: {
//     width: 70,
//     height: 70,
//     borderRadius: 8,
//     backgroundColor: '#f0f0f0',
//   },
//   removeButton: {
//     position: 'absolute',
//     top: -6,
//     right: -6,
//     backgroundColor: 'rgba(0,0,0,0.8)',
//     borderRadius: 12,
//     padding: 2,
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
//     paddingHorizontal: 12,
//   },
//   uploadButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     paddingVertical: 16,
//     marginHorizontal: 16,
//     borderRadius: 12,
//     marginTop: 8,
//   },
//   uploadButtonDisabled: {
//     backgroundColor: COLORS.gray,
//   },
//   uploadButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 12,
//   },
//   libraryButtonBottom: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingVertical: 12,
//     marginHorizontal: 16,
//     borderRadius: 12,
//     marginBottom: 12,
//   },
//   libraryButtonBottomText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '500',
//     marginLeft: 8,
//   },
//   cameraInstructions: {
//     color: 'rgba(255,255,255,0.7)',
//     fontSize: 12,
//     textAlign: 'center',
//     marginTop: 8,
//     marginBottom: 4,
//   },
  
//   // Other Styles
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'black',
//   },
//   modalCloseButton: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 50 : 30,
//     right: 24,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     borderRadius: 20,
//     padding: 8,
//   },
//   fullSizeImage: {
//     width: '100%',
//     height: '100%',
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
//   taskListContent: {
//     paddingVertical: 4,
//   },


//   // Add these to your StyleSheet
// roomCard: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: '#f0f0f0',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.04,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   selectedRoomCard: {
//     borderColor: COLORS.primary,
//     backgroundColor: '#f8fbff',
//     shadowOpacity: 0.08,
//   },
//   completedRoomCard: {
//     borderColor: '#d4edda',
//     backgroundColor: '#f8fff8',
//   },
//   roomCardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 14,
//   },
//   roomIconWrapper: {
//     position: 'relative',
//     marginRight: 12,
//   },
//   roomIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#f0f7ff',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   completedRoomIcon: {
//     backgroundColor: '#e8f5e8',
//   },
//   completeBadge: {
//     position: 'absolute',
//     top: -4,
//     right: -4,
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     backgroundColor: '#4CAF50',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: '#fff',
//   },
//   roomInfo: {
//     flex: 1,
//   },
//   roomName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginBottom: 4,
//   },
//   roomMeta: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   statusChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     gap: 4,
//   },
//   statusChipComplete: {
//     backgroundColor: '#e8f5e8',
//   },
//   statusChipInProgress: {
//     backgroundColor: '#fff3e0',
//   },
//   statusDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//   },
//   statusDotComplete: {
//     backgroundColor: '#4CAF50',
//   },
//   statusDotInProgress: {
//     backgroundColor: '#FF9800',
//   },
//   statusChipText: {
//     fontSize: 11,
//     fontWeight: '500',
//     color: '#555',
//   },
//   roomStats: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa',
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   statItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   statDivider: {
//     width: 1,
//     height: 16,
//     backgroundColor: '#e0e0e0',
//     marginHorizontal: 6,
//   },
//   statText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: '#555',
//   },
//   progressContainer: {
//     marginBottom: 14,
//   },
//   progressBar: {
//     height: 6,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 3,
//     overflow: 'hidden',
//     marginBottom: 6,
//   },
//   progressFill: {
//     height: '100%',
//     borderRadius: 3,
//   },
//   progressLabel: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   progressPercent: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#333',
//   },
//   progressText: {
//     fontSize: 12,
//     color: '#999',
//   },
//   roomActionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//     gap: 8,
//   },
//   startButton: {
//     backgroundColor: COLORS.primary,
//   },
//   reviewButton: {
//     backgroundColor: '#4CAF50',
//   },
//   roomActionButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
// });

// export default AfterPhoto;



// AfterPhoto.js (full component with all styles and isReadOnly support)
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
// import { Checkbox } from 'react-native-paper';
// import ImageViewer from 'react-native-image-zoom-viewer';
// import RNModal from 'react-native-modal';
// import { sendPushNotifications } from '../../../utils/sendPushNotification';
// import ROUTES from '../../../constants/routes';
// import CircularProgress from 'react-native-circular-progress-indicator';
// import { Image } from 'expo-image';
// import CustomActivityIndicator from '../../../components/shared/CuustomActivityIndicator';
// import formatRoomTitle from '../../../utils/formatRoomTitle';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import * as ImagePicker from 'expo-image-picker';
// import { tSafe } from '../../../utils/tSafe';

// const { width, height } = Dimensions.get('window');

// // ─── ThumbnailItem ──────────────────────────────────────────────
// const ThumbnailItem = React.memo(({
//   photo,
//   index,
//   openImageViewer,
//   taskTitle,
//   invertPercentage,
//   getCleanlinessColor,
//   photosArray,
//   onDelete,
//   isReadOnly = false,
// }) => {
//   const photoScore = invertPercentage(photo.cleanliness?.individual_overall || 0);
//   const isProblemPhoto = photoScore < 35;
//   const fadeAnim = useRef(new Animated.Value(1)).current;

//   const handleDelete = () => {
//     if (isReadOnly) return;
//     Alert.alert(
//       tSafe('delete_photo_title', 'Delete Photo'),
//       tSafe('delete_photo_confirmation', 'Are you sure you want to permanently delete this photo?'),
//       [
//         { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
//         {
//           text: tSafe('delete', 'Delete'),
//           onPress: () => {
//             Animated.timing(fadeAnim, {
//               toValue: 0,
//               duration: 300,
//               useNativeDriver: true,
//             }).start(() => onDelete(index, taskTitle));
//           },
//         },
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
//         {!isReadOnly && (
//           <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
//             <Ionicons name="trash-outline" size={16} color="white" />
//           </TouchableOpacity>
//         )}
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

// // ─── Main Component ──────────────────────────────────────────────
// const AfterPhoto = ({ scheduleId, hostId, isReadOnly = false }) => {
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
//   const [selectedRoom, setSelectedRoom] = useState(null);
//   const [rooms, setRooms] = useState([]);

//   const [permission, requestPermission] = useCameraPermissions();
//   const [facing, setFacing] = useState('back');
//   const [isCameraReady, setIsCameraReady] = useState(false);
//   const [isSimulator, setIsSimulator] = useState(false);

//   useEffect(() => {
//     if (Platform.OS === 'ios' && Platform.isPad) {
//       setIsSimulator(true);
//     }
//   }, []);

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
//       },
//     })
//   ).current;

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

//   const invertPercentage = (score) => 100 - (score * 10);

//   const getCleanlinessLabel = (invertedScore) => {
//     if (invertedScore <= 35) return tSafe('needs_deep_cleaning', 'Needs Deep Cleaning');
//     if (invertedScore <= 40) return tSafe('requires_attention', 'Requires Attention');
//     return tSafe('very_clean', 'Very Clean');
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
//       const getCleanerById = (id) => res.assignedTo.find((cleaner) => cleaner.cleanerId === id);
//       const cl = getCleanerById(currentUserId);

//       if (cl?.checklist?.details) {
//         const details = cl.checklist.details;
//         setSelectedImages(details);

//         const roomArray = Object.keys(details).map((key) => {
//           const roomData = details[key];
//           const isExtraRoom = key === 'Extra';

//           return {
//             id: key,
//             name: isExtraRoom ? tSafe('extra_tasks', 'Extra Tasks') : formatRoomTitle(key),
//             type: isExtraRoom ? 'extra' : key.split('_')[0],
//             tasks: roomData.tasks || [],
//             photos: roomData.photos || [],
//             completed: isExtraRoom
//               ? (roomData.tasks || []).every((task) => task.value === true)
//               : (roomData.tasks || []).every((task) => task.value === true) &&
//                 (roomData.photos || []).length >= 3,
//             isExtra: isExtraRoom,
//           };
//         });

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
//           console.error('Error fetching data:', error);
//         }
//       };
//       if (isActive) fetchData();
//       return () => {
//         isActive = false;
//       };
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

//     const formattedImages = images.map((photo) => {
//       const score = invertPercentage(photo.cleanliness?.individual_overall || 0);
//       const status = getCleanlinessLabel(score);

//       return {
//         url: status === 'Very Clean' ? photo.img_url : photo.cleanliness?.heatmap_url || photo.img_url,
//         cleanliness: photo.cleanliness,
//         props: { source: { uri: status === 'Very Clean' ? photo.img_url : photo.cleanliness?.heatmap_url || photo.img_url } },
//         category: category,
//       };
//     });

//     setCurrentImages(formattedImages);
//     setCurrentImageIndex(index);
//     setBeforeModalVisible(true);
//   }, []);

//   const takePicture = async () => {
//     if (isReadOnly) {
//       Alert.alert(tSafe('read_only', 'Read Only'), tSafe('read_only_message', 'You cannot add photos after submitting.'));
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
//           skipProcessing: true,
//         });

//         const newPhoto = {
//           uri: photo.uri,
//           base64: photo.base64,
//           filename: `photo_${Date.now()}.jpg`,
//           file: `data:image/jpeg;base64,${photo.base64}`,
//         };

//         if (photos.length < MAX_IMAGES_UPLOAD) {
//           setPhotos((prev) => [...prev, newPhoto]);
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

//   const pickImageFromLibrary = async () => {
//     if (isReadOnly) {
//       Alert.alert(tSafe('read_only', 'Read Only'), tSafe('read_only_message', 'You cannot add photos after submitting.'));
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
//         selectionLimit: MAX_IMAGES_UPLOAD - photos.length,
//       });

//       if (!result.canceled) {
//         const newPhotos = result.assets.map((asset, index) => ({
//           uri: asset.uri,
//           base64: asset.base64,
//           filename: `photo_${Date.now()}_${index}.jpg`,
//           file: `data:image/jpeg;base64,${asset.base64}`,
//         }));

//         if (photos.length + newPhotos.length <= MAX_IMAGES_UPLOAD) {
//           setPhotos((prev) => [...prev, ...newPhotos]);
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

//   const flipCamera = () => {
//     setFacing((current) => (current === 'back' ? 'front' : 'back'));
//   };

//   const openCamera = (taskTitle) => {
//     if (isReadOnly) {
//       Alert.alert(tSafe('read_only', 'Read Only'), tSafe('read_only_message', 'You cannot add photos after submitting.'));
//       return;
//     }
//     setSelectedTaskTitle(taskTitle);
//     setPhotos([]);
//     setIsCameraReady(false);
//     setCameraVisible(true);
//   };

//   const validateTasks = () => {
//     if (!selectedImages || Object.keys(selectedImages).length === 0) {
//       Alert.alert(
//         tSafe('validation_error_title', 'Validation Error'),
//         tSafe('no_tasks_or_images', 'No tasks or images found for validation.')
//       );
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

//       if (!isExtraRoom && (!photos || photos.length < 3)) {
//         insufficientImagesCategories.push(category);
//       }
//     });

//     if (invalidCategories.length > 0 || insufficientImagesCategories.length > 0) {
//       let errorMessage = '';
//       if (invalidCategories.length > 0)
//         errorMessage += tSafe('incomplete_tasks', 'Incomplete tasks in: {categories}.\n', {
//           categories: invalidCategories.join(', '),
//         });
//       if (insufficientImagesCategories.length > 0)
//         errorMessage += tSafe('insufficient_images', 'Insufficient images in: {categories}.', {
//           categories: insufficientImagesCategories.join(', '),
//         });
//       Alert.alert(tSafe('validation_error_title', 'Validation Error'), errorMessage);
//       return false;
//     }

//     return true;
//   };

//   const onSubmit = async () => {
//     if (isReadOnly) {
//       Alert.alert(tSafe('read_only', 'Read Only'), tSafe('read_only_message', 'You cannot upload photos after submitting.'));
//       return;
//     }
//     if (photos.length === 0) {
//       Alert.alert(
//         tSafe('no_photos_title', 'No Photos'),
//         tSafe('take_photo_before_upload', 'Please take at least one photo before uploading.')
//       );
//       return;
//     }

//     if (photos.length > MAX_IMAGES_UPLOAD) {
//       Alert.alert(
//         tSafe('upload_limit_exceeded_title', 'Upload Limit Exceeded'),
//         tSafe('max_photos_allowed_upload', 'You can only upload up to {count} images at a time.', { count: MAX_IMAGES_UPLOAD })
//       );
//       return;
//     }

//     setIsUploading(true);

//     const imagesToUpload = photos.map((photo) => ({
//       filename: photo.filename,
//       file: photo.file,
//     }));

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
//         Alert.alert(
//           tSafe('upload_successful_title', 'Upload Successful'),
//           tSafe('photos_uploaded_count', '{count} photos have been uploaded successfully!', { count: photos.length })
//         );
//         fetchImages();
//         setPhotos([]);
//         setCameraVisible(false);
//       }
//     } catch (err) {
//       console.error('Error uploading photos:', err);
//       Alert.alert(
//         tSafe('upload_failed_title', 'Upload Failed'),
//         tSafe('upload_error_message', 'An error occurred while uploading your photos.')
//       );
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const updateTasksInBackend = async (category, updatedTasks) => {
//     if (isReadOnly) return;
//     try {
//       const data = { scheduleId, cleanerId: currentUserId, category, tasks: updatedTasks };
//       await userService.updateChecklist(data);
//     } catch (err) {
//       console.error('Error updating tasks:', err);
//     }
//   };

//   const handleTaskToggle = (category, taskId) => {
//     if (isReadOnly) return;
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
//     if (isReadOnly) return;
//     setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
//   };

//   const handleDeletePhoto = async (indexToDelete, category) => {
//     if (isReadOnly) return;
//     try {
//       const photoToDelete = selectedImages[category]?.photos[indexToDelete];
//       if (!photoToDelete) {
//         Alert.alert(tSafe('error_title', 'Error'), tSafe('photo_not_found', 'Photo not found'));
//         return;
//       }

//       const originalFilename = photoToDelete.img_url.split('/').pop();
//       const heatmapFilename = photoToDelete.cleanliness?.heatmap_url?.split('/').pop();

//       setSelectedImages((prev) => {
//         const updated = { ...prev };
//         updated[category].photos = updated[category].photos.filter((_, i) => i !== indexToDelete);
//         return updated;
//       });

//       const data = { originalFilename, heatmapFilename, category, scheduleId };
//       await userService.deleteSpaceAfterPhoto(data);
//       updateTasksInBackend(selectedImages);
//     } catch (error) {
//       console.error('Delete failed:', error);
//       setSelectedImages((prev) => ({ ...prev }));
//       Alert.alert(
//         tSafe('deletion_failed_title', 'Deletion Failed'),
//         error.response?.data?.detail || tSafe('could_not_delete_photo', 'Could not delete photo')
//       );
//     }
//   };

//   // ─── TaskItem (memo) ──────────────────────────────────────────────
//   const TaskItem = React.memo(({ task, roomId, onToggle }) => {
//     const handlePress = useCallback(() => {
//       if (isReadOnly) return;
//       onToggle(roomId, task.id);
//     }, [roomId, task.id, onToggle, isReadOnly]);

//     return (
//       <TouchableOpacity
//         style={[styles.taskItem, task.value && styles.taskItemCompleted, isReadOnly && styles.readOnlyTaskItem]}
//         onPress={handlePress}
//         activeOpacity={isReadOnly ? 1 : 0.7}
//         disabled={isReadOnly}
//       >
//         <View style={styles.taskItemLeft}>
//           <Checkbox.Android
//             status={task.value ? 'checked' : 'unchecked'}
//             onPress={() => {}}
//             color={COLORS.primary}
//             uncheckedColor="#000"
//             pointerEvents="none"
//           />
//           <View style={styles.taskTextContainer}>
//             <Text style={[styles.taskLabel, task.value && styles.taskLabelCompleted]}>{task.label}</Text>
//             {(task.time || task.price) && (
//               <View style={styles.taskMeta}>
//                 {task.time && (
//                   <View style={styles.taskMetaItem}>
//                     <Ionicons name="time-outline" size={12} color="#666" />
//                     <Text style={styles.taskMetaText}>
//                       {task.time} {tSafe('min', 'min')}
//                       {task.time > 1 ? 's' : ''}
//                     </Text>
//                   </View>
//                 )}
//                 {task.price && (
//                   <View style={styles.taskMetaItem}>
//                     <Ionicons name="cash-outline" size={12} color="#4CAF50" />
//                     <Text style={styles.taskMetaText}>${task.price}</Text>
//                   </View>
//                 )}
//               </View>
//             )}
//           </View>
//           {task.value ? (
//             <View style={styles.completedIndicator}>
//               <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
//             </View>
//           ) : (
//             <Ionicons name="ellipse-outline" size={20} color="#ddd" />
//           )}
//         </View>
//       </TouchableOpacity>
//     );
//   });

//   const submitCompletion = useCallback(async () => {
//     if (isReadOnly) {
//       Alert.alert(
//         tSafe('read_only', 'Read Only'),
//         tSafe('read_only_message', 'You cannot submit after this job has been completed.')
//       );
//       return;
//     }
//     if (!validateTasks()) return;
//     setIsLoading(true);
//     try {
//       await userService.finishCleaning({
//         scheduleId,
//         cleanerId: currentUserId,
//         completed_tasks: selectedImages,
//         fee: parseFloat(cleaning_fee),
//         completionTime: new Date(),
//       });
//       sendPushNotifications(
//         hostTokens,
//         tSafe('cleaner_completed_cleaning_title', '{name} Completed Cleaning', { name: currentUser.firstname }),
//         tSafe('cleaner_completed_cleaning_message', '{firstname} {lastname} has completed the cleaning.', {
//           firstname: currentUser.firstname,
//           lastname: currentUser.lastname,
//         }),
//         { screen: ROUTES.host_task_progress, params: { scheduleId } }
//       );
//       Alert.alert(tSafe('success_title', 'Success'), tSafe('cleaning_completed', 'Cleaning completed successfully!'));
//     } finally {
//       setIsLoading(false);
//     }
//   }, [selectedImages, hostTokens, scheduleId, currentUser, isReadOnly]);

//   const getRoomProgress = (room) => {
//     if (!selectedImages[room.id]) return 0;
//     const roomData = selectedImages[room.id];
//     const isExtraRoom = room.id === 'Extra';

//     const taskProgress =
//       roomData.tasks?.length > 0
//         ? (roomData.tasks.filter((t) => t.value).length / roomData.tasks.length) * (isExtraRoom ? 100 : 50)
//         : 0;

//     const photoProgress = isExtraRoom ? 0 : Math.min((roomData.photos?.length || 0 / 3) * 50, 50);

//     return taskProgress + photoProgress;
//   };

//   const isRoomComplete = (room) => {
//     if (!selectedImages[room.id]) return false;
//     const roomData = selectedImages[room.id];

//     const isExtraRoom = room.id === 'Extra';
//     const tasksComplete = roomData.tasks?.every((task) => task.value === true) || false;
//     const photosComplete = isExtraRoom ? true : (roomData.photos?.length || 0) >= 3;

//     return tasksComplete && photosComplete;
//   };

//   const allRoomsComplete = rooms.every((room) => isRoomComplete(room));

//   const markRoomComplete = (roomId) => {
//     if (isReadOnly) return;
//     Alert.alert(
//       tSafe('mark_room_complete_title', 'Mark Room Complete'),
//       tSafe('mark_room_complete_confirmation', 'Are you sure this room is fully cleaned and all photos are taken?'),
//       [
//         { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
//         {
//           text: tSafe('mark_complete', 'Mark Complete'),
//           onPress: () => {
//             setRooms((prev) =>
//               prev.map((room) => (room.id === roomId ? { ...room, completed: true } : room))
//             );
//             Alert.alert(tSafe('success_title', 'Success'), tSafe('room_marked_complete', 'Room marked as complete!'));
//           },
//         },
//       ]
//     );
//   };

//   const getRoomIcon = (type) => {
//     switch (type.toLowerCase()) {
//       case 'bedroom':
//         return 'bed';
//       case 'bathroom':
//         return 'shower';
//       case 'kitchen':
//         return 'silverware-fork-knife';
//       case 'livingroom':
//         return 'sofa';
//       case 'extra':
//         return 'plus-circle';
//       default:
//         return 'home';
//     }
//   };

//   const onCloseCamera = () => {
//     setCameraVisible(false);
//     setPhotos([]);
//   };

//   // ─── RoomCard ────────────────────────────────────────────────────
//   const RoomCard = ({ room }) => {
//     const progress = getRoomProgress(room);
//     const isComplete = isRoomComplete(room);
//     const roomData = selectedImages[room.id] || {};
//     const totalTasks = roomData.tasks?.length || 0;
//     const completedTasks = roomData.tasks?.filter((t) => t.value).length || 0;
//     const photoCount = roomData.photos?.length || 0;
//     const photoTarget = room.isExtra ? 0 : 3;

//     return (
//       <TouchableOpacity
//         style={[
//           styles.roomCard,
//           selectedRoom?.id === room.id && styles.selectedRoomCard,
//           isComplete && styles.completedRoomCard,
//         ]}
//         onPress={() => setSelectedRoom(room)}
//         activeOpacity={0.9}
//         disabled={isReadOnly && isComplete}
//       >
//         <View style={styles.roomCardHeader}>
//           <View style={styles.roomIconWrapper}>
//             <View style={[styles.roomIcon, isComplete && styles.completedRoomIcon]}>
//               <MaterialCommunityIcons
//                 name={getRoomIcon(room.type)}
//                 size={24}
//                 color={isComplete ? '#4CAF50' : COLORS.primary}
//               />
//             </View>
//             {isComplete && (
//               <View style={styles.completeBadge}>
//                 <MaterialCommunityIcons name="check" size={12} color="#fff" />
//               </View>
//             )}
//           </View>

//           <View style={styles.roomInfo}>
//             <Text style={styles.roomName}>{room.name}</Text>
//             <View style={styles.roomMeta}>
//               <View
//                 style={[
//                   styles.statusChip,
//                   isComplete ? styles.statusChipComplete : styles.statusChipInProgress,
//                 ]}
//               >
//                 <View
//                   style={[
//                     styles.statusDot,
//                     isComplete ? styles.statusDotComplete : styles.statusDotInProgress,
//                   ]}
//                 />
//                 <Text style={styles.statusChipText}>
//                   {isComplete ? tSafe('complete_status', 'Complete') : tSafe('in_progress_status', 'In Progress')}
//                 </Text>
//               </View>
//             </View>
//           </View>

//           <View style={styles.roomStats}>
//             <View style={styles.statItem}>
//               <MaterialCommunityIcons name="camera-outline" size={14} color="#888" />
//               <Text style={styles.statText}>
//                 {photoCount}/{photoTarget === 0 ? '∞' : photoTarget}
//               </Text>
//             </View>
//             <View style={styles.statDivider} />
//             <View style={styles.statItem}>
//               <MaterialCommunityIcons name="check-circle-outline" size={14} color="#888" />
//               <Text style={styles.statText}>
//                 {completedTasks}/{totalTasks}
//               </Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.progressContainer}>
//           <View style={styles.progressBar}>
//             <View
//               style={[
//                 styles.progressFill,
//                 {
//                   width: `${progress}%`,
//                   backgroundColor: isComplete ? '#4CAF50' : COLORS.primary,
//                 },
//               ]}
//             />
//           </View>
//           <View style={styles.progressLabel}>
//             <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
//             <Text style={styles.progressText}>{tSafe('complete_percent', 'complete')}</Text>
//           </View>
//         </View>

//         <TouchableOpacity
//           style={[styles.roomActionButton, isComplete ? styles.reviewButton : styles.startButton]}
//           onPress={() => setSelectedRoom(room)}
//           activeOpacity={0.8}
//           disabled={isReadOnly && isComplete}
//         >
//           <Text style={styles.roomActionButtonText}>
//             {isComplete ? tSafe('review', 'Review') : tSafe('continue', 'Continue')}
//           </Text>
//           <Ionicons name={isComplete ? 'chevron-forward' : 'arrow-forward'} size={18} color="white" />
//         </TouchableOpacity>
//       </TouchableOpacity>
//     );
//   };

//   // ─── RoomWorkspace ──────────────────────────────────────────────
//   const RoomWorkspace = ({ room, onBack }) => {
//     const roomData = selectedImages[room.id] || {};
//     const isExtraRoom = room.id === 'Extra';

//     const scrollRef = useRef(null);
//     const scrollOffsetRef = useRef(0);

//     useEffect(() => {
//       if (scrollRef.current && scrollOffsetRef.current > 0) {
//         requestAnimationFrame(() => {
//           scrollRef.current?.scrollTo({ y: scrollOffsetRef.current, animated: false });
//         });
//       }
//     }, [roomData.tasks]);

//     return (
//       <View style={styles.workspace}>
//         <View style={styles.workspaceHeader}>
//           <TouchableOpacity onPress={onBack} style={styles.backButton}>
//             <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
//           </TouchableOpacity>
//           <View style={styles.roomTitleSection}>
//             <Text style={styles.workspaceRoomTitle}>{room.name}</Text>
//             <Text style={styles.workspaceRoomSubtitle}>
//               {isRoomComplete(room) ? tSafe('completed', 'Completed') : tSafe('in_progress', 'In Progress')}
//             </Text>
//           </View>
//           <CircularProgress
//             value={getRoomProgress(room)}
//             radius={24}
//             duration={1000}
//             progressValueColor={isRoomComplete(room) ? '#4CAF50' : COLORS.primary}
//             activeStrokeColor={isRoomComplete(room) ? '#4CAF50' : COLORS.primary}
//             activeStrokeWidth={4}
//             inActiveStrokeWidth={4}
//             inActiveStrokeColor="#e0e0e0"
//             maxValue={100}
//           />
//         </View>

//         <ScrollView
//           ref={scrollRef}
//           onScroll={(e) => {
//             scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
//           }}
//           scrollEventThrottle={16}
//           style={styles.workspaceContent}
//           showsVerticalScrollIndicator={false}
//           removeClippedSubviews={false}
//         >
//           {/* Photos Section */}
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Ionicons name="camera" size={22} color={COLORS.primary} />
//               <Text style={styles.sectionTitle}>
//                 {isExtraRoom
//                   ? tSafe('additional_photos_optional', 'Additional Photos (Optional)')
//                   : tSafe('after_photos', 'After Photos')}
//               </Text>
//               {!isExtraRoom && (
//                 <View style={styles.badge}>
//                   <Text style={styles.badgeText}>{roomData.photos?.length || 0}/3</Text>
//                 </View>
//               )}
//             </View>

//             <Text style={styles.sectionDescription}>
//               {isExtraRoom
//                 ? tSafe('extra_photos_description', 'Take photos of any additional cleaning tasks if needed')
//                 : tSafe('after_photos_description', 'Take photos of the same areas as your before photos')}
//             </Text>

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
//                     isReadOnly={isReadOnly}
//                   />
//                 )}
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.previewContainer}
//                 ListEmptyComponent={
//                   <View style={styles.emptyPhotos}>
//                     <Ionicons name="camera-outline" size={40} color="#ddd" />
//                     <Text style={styles.emptyPhotosText}>{tSafe('no_photos_yet', 'No photos yet')}</Text>
//                     <Text style={styles.emptyPhotosSubtext}>
//                       {isExtraRoom
//                         ? tSafe('photos_optional_message', 'Photos are optional for extra tasks')
//                         : tSafe('tap_to_add_photos', 'Tap the button below to add photos')}
//                     </Text>
//                   </View>
//                 }
//               />
//             </View>

//             <TouchableOpacity
//               style={[styles.addPhotosButton, isReadOnly && styles.disabledButton]}
//               onPress={() => openCamera(room.id)}
//               disabled={isReadOnly}
//             >
//               <View style={styles.addButtonContent}>
//                 <Ionicons name="add-circle" size={24} color={isReadOnly ? '#999' : 'white'} />
//                 <View style={styles.addButtonTextContainer}>
//                   <Text style={[styles.addButtonMainText, isReadOnly && styles.disabledText]}>
//                     {isExtraRoom
//                       ? tSafe('add_optional_photos', 'Add Optional Photos')
//                       : roomData.photos?.length >= 3
//                       ? tSafe('add_more_photos', 'Add More Photos')
//                       : tSafe('take_photos', 'Take Photos')}
//                   </Text>
//                   <Text style={[styles.addButtonSubText, isReadOnly && styles.disabledText]}>
//                     {isReadOnly
//                       ? tSafe('read_only_photos', 'Read only – no changes allowed')
//                       : isExtraRoom
//                       ? tSafe('document_additional_work', 'Document any additional cleaning work')
//                       : roomData.photos?.length >= 3
//                       ? tSafe('can_add_more_photos', 'You can add more photos if needed')
//                       : tSafe('photos_needed', '{count} more needed', { count: 3 - (roomData.photos?.length || 0) })}
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
//                 {isExtraRoom ? tSafe('additional_tasks', 'Additional Tasks') : tSafe('cleaning_tasks', 'Cleaning Tasks')}
//               </Text>
//               <View style={styles.badge}>
//                 <Text style={styles.badgeText}>
//                   {roomData.tasks?.filter((t) => t.value).length || 0}/{roomData.tasks?.length || 0}
//                 </Text>
//               </View>
//             </View>

//             <View style={styles.taskProgress}>
//               <View style={styles.taskProgressBar}>
//                 <View
//                   style={[
//                     styles.taskProgressFill,
//                     {
//                       width: `${
//                         roomData.tasks?.length > 0
//                           ? (roomData.tasks.filter((t) => t.value).length / roomData.tasks.length) * 100
//                           : 0
//                       }%`,
//                     },
//                   ]}
//                 />
//               </View>
//               <Text style={styles.taskProgressText}>
//                 {roomData.tasks?.filter((t) => t.value).length || 0} {tSafe('of', 'of')}{' '}
//                 {roomData.tasks?.length || 0} {tSafe('tasks_completed', 'tasks completed')}
//               </Text>
//             </View>

//             <View style={styles.taskList}>
//               {roomData.tasks?.map((item) => (
//                 <TaskItem key={item.id} task={item} roomId={room.id} onToggle={handleTaskToggle} />
//               ))}

//               {(!roomData.tasks || roomData.tasks.length === 0) && (
//                 <View style={styles.noTasksContainer}>
//                   <Ionicons name="list-outline" size={40} color="#ddd" />
//                   <Text style={styles.noTasksText}>{tSafe('no_tasks_assigned', 'No tasks assigned')}</Text>
//                 </View>
//               )}
//             </View>
//           </View>

//           {/* Completion Requirements */}
//           <View style={styles.requirementsSection}>
//             <Text style={styles.requirementsTitle}>
//               {tSafe('to_complete', 'To complete this {type}:', {
//                 type: isExtraRoom ? tSafe('section', 'section') : tSafe('room', 'room'),
//               })}
//             </Text>

//             {!isExtraRoom && (
//               <View style={styles.requirementItem}>
//                 <Ionicons
//                   name={roomData.photos?.length >= 3 ? 'checkmark-circle' : 'ellipse-outline'}
//                   size={20}
//                   color={roomData.photos?.length >= 3 ? '#4CAF50' : '#666'}
//                 />
//                 <Text
//                   style={[
//                     styles.requirementText,
//                     roomData.photos?.length >= 3 && styles.requirementTextCompleted,
//                   ]}
//                 >
//                   {tSafe('minimum_photos', 'Minimum 3 photos ({count}/{total})', {
//                     count: roomData.photos?.length || 0,
//                     total: 3,
//                   })}
//                 </Text>
//               </View>
//             )}

//             <View style={styles.requirementItem}>
//               <Ionicons
//                 name={roomData.tasks?.every((t) => t.value) ? 'checkmark-circle' : 'ellipse-outline'}
//                 size={20}
//                 color={roomData.tasks?.every((t) => t.value) ? '#4CAF50' : '#666'}
//               />
//               <Text
//                 style={[
//                   styles.requirementText,
//                   roomData.tasks?.every((t) => t.value) && styles.requirementTextCompleted,
//                 ]}
//               >
//                 {tSafe('all_tasks_completed', 'All tasks completed ({count}/{total})', {
//                   count: roomData.tasks?.filter((t) => t.value).length || 0,
//                   total: roomData.tasks?.length || 0,
//                 })}
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
//                   {room.name} {tSafe('already_completed', 'is already completed')}
//                 </Text>
//               </View>
//             ) : (
//               <TouchableOpacity
//                 style={[styles.markCompleteButton, isReadOnly && styles.disabledButton]}
//                 onPress={() => markRoomComplete(room.id)}
//                 disabled={isReadOnly}
//               >
//                 <Ionicons name="checkmark-done" size={24} color="white" />
//                 <View style={styles.markCompleteButtonTexts}>
//                   <Text style={styles.markCompleteButtonMain}>
//                     {tSafe('mark_room_complete', 'Mark {room} Complete', { room: room.name })}
//                   </Text>
//                   <Text style={styles.markCompleteButtonSub}>
//                     {tSafe('all_requirements_met', 'All requirements are met ✓')}
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             )
//           ) : (
//             <View style={styles.incompleteRequirements}>
//               <Ionicons name="alert-circle" size={24} color="#FF9800" />
//               <View style={styles.incompleteRequirementsTexts}>
//                 <Text style={styles.incompleteRequirementsMain}>
//                   {tSafe('complete_requirements_to_finish', 'Complete requirements to finish')}
//                 </Text>
//                 <Text style={styles.incompleteRequirementsSub}>
//                   {!isExtraRoom &&
//                     roomData.photos?.length < 3 &&
//                     tSafe('more_photos_needed', '{count} more photos, ', {
//                       count: 3 - (roomData.photos?.length || 0),
//                     })}
//                   {roomData.tasks?.filter((t) => !t.value).length} {tSafe('more_tasks', 'more tasks')}
//                 </Text>
//               </View>
//             </View>
//           )}
//         </View>
//       </View>
//     );
//   };

//   // ─── Main render ──────────────────────────────────────────────────
//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Image Viewer Modal */}
//       <RNModal
//         isVisible={isBeforeModalVisible}
//         style={styles.fullScreenModal}
//         onBackdropPress={() => setBeforeModalVisible(false)}
//       >
//         <View style={styles.modalContainer}>
//           <ImageViewer
//             imageUrls={currentImages}
//             index={currentImageIndex}
//             backgroundColor="black"
//             enableSwipeDown
//             enableImageZoom
//             onSwipeDown={() => setBeforeModalVisible(false)}
//             renderImage={(props) => <Image source={props.source} style={styles.fullSizeImage} contentFit="contain" />}
//           />

//           {currentImages[currentImageIndex]?.cleanliness && (
//             <Animated.View style={[styles.analysisPanel, { transform: [{ translateY: pan.y }] }]} {...panResponder.panHandlers}>
//               <View style={styles.dragHandle} />
//               <View style={styles.analysisContent}>
//                 <Text style={styles.analysisTitle}>{tSafe('cleanliness_analysis', 'CLEANLINESS ANALYSIS')}</Text>

//                 <View style={styles.scoreSection}>
//                   <Text style={styles.sectionTitle}>{tSafe('this_photo', 'THIS PHOTO')}</Text>
//                   <View style={styles.scoreRow}>
//                     <View style={styles.scoreText}>
//                       <Text style={styles.scorePercentage}>
//                         {invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0).toFixed(
//                           0
//                         )}
//                         %
//                       </Text>
//                       <Text style={styles.scoreLabel}>
//                         {getCleanlinessLabel(
//                           invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0)
//                         )}
//                       </Text>
//                     </View>
//                     <CircularProgress
//                       value={invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0)}
//                       radius={35}
//                       activeStrokeColor={getCleanlinessColor(
//                         invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0)
//                       )}
//                       inActiveStrokeColor="#2d2d2d"
//                       maxValue={100}
//                     />
//                   </View>
//                 </View>

//                 <Text style={styles.sectionTitle}>{tSafe('main_issues', 'MAIN ISSUES')}</Text>
//                 <View style={styles.issuesList}>
//                   {Object.entries(currentImages[currentImageIndex].cleanliness.scores || {})
//                     .sort(([, a], [, b]) => b - a)
//                     .slice(0, 3)
//                     .map(([factor, score]) => (
//                       <View key={factor} style={styles.issueItem}>
//                         <Text style={styles.issueName}>{factor.replace(/_/g, ' ').toUpperCase()}</Text>
//                         <Text style={[styles.issueScore, { color: getCleanlinessColor(100 - score * 10) }]}>
//                           {(100 - score * 10).toFixed(0)}%
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
//       </RNModal>

//       {/* Camera Modal */}
//       <RNModal isVisible={cameraVisible} style={styles.fullScreenModal} onBackdropPress={() => setCameraVisible(false)}>
//         <View style={styles.cameraModalContainer}>
//           <View style={styles.cameraHeader}>
//             <TouchableOpacity style={styles.cameraCloseButton} onPress={onCloseCamera}>
//               <Ionicons name="chevron-down" size={28} color="white" />
//             </TouchableOpacity>

//             {!isSimulator && permission?.granted && (
//               <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
//                 <Ionicons name="camera-reverse" size={24} color="white" />
//               </TouchableOpacity>
//             )}
//           </View>

//           {isSimulator ? (
//             <View style={styles.simulatorContainer}>
//               <Ionicons name="images-outline" size={64} color="white" />
//               <Text style={styles.simulatorText}>{tSafe('camera_not_available_simulator', 'Camera not available in simulator')}</Text>
//               <Text style={styles.simulatorSubtext}>
//                 {tSafe('use_pick_from_library', 'Use "Pick from Library" button below to add photos')}
//               </Text>
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
//               <View style={styles.photoCounter}>
//                 <Ionicons name="images-outline" size={16} color="white" />
//                 <Text style={styles.photoCounterText}>
//                   {photos.length}/{MAX_IMAGES_UPLOAD}
//                 </Text>
//               </View>

//               <View style={styles.cameraControls}>
//                 <TouchableOpacity
//                   style={styles.captureButton}
//                   onPress={takePicture}
//                   disabled={photos.length >= MAX_IMAGES_UPLOAD}
//                 >
//                   <View style={styles.captureButtonInner}>
//                     <Ionicons name="camera" size={32} color="white" />
//                   </View>
//                 </TouchableOpacity>
//               </View>
//             </CameraView>
//           )}

//           <View style={styles.bottomSection}>
//             {photos.length === 0 && permission?.granted && !isSimulator && !isReadOnly && (
//               <TouchableOpacity style={styles.libraryButtonBottom} onPress={pickImageFromLibrary}>
//                 <Ionicons name="images" size={20} color="white" />
//                 <Text style={styles.libraryButtonBottomText}>{tSafe('pick_from_library', 'Pick from Library')}</Text>
//               </TouchableOpacity>
//             )}

//             {photos.length > 0 && (
//               <>
//                 <View style={styles.thumbnailSection}>
//                   <Text style={styles.thumbnailTitle}>{tSafe('selected_photos', 'Selected Photos')}</Text>
//                   <FlatList
//                     data={photos}
//                     horizontal
//                     keyExtractor={(item, index) => index.toString()}
//                     renderItem={({ item, index }) => (
//                       <View style={styles.thumbnailWrapper}>
//                         <Image source={{ uri: item.uri || item.file }} style={styles.preview} />
//                         {!isReadOnly && (
//                           <TouchableOpacity onPress={() => removePhoto(index)} style={styles.removeButton}>
//                             <Ionicons name="close-circle" size={20} color="white" />
//                           </TouchableOpacity>
//                         )}
//                         <View style={styles.previewNumber}>
//                           <Text style={styles.previewNumberText}>{index + 1}</Text>
//                         </View>
//                       </View>
//                     )}
//                     contentContainerStyle={styles.previewContainer}
//                     showsHorizontalScrollIndicator={false}
//                   />
//                 </View>

//                 <TouchableOpacity
//                   style={[styles.uploadButton, (isUploading || isReadOnly) && styles.uploadButtonDisabled]}
//                   onPress={onSubmit}
//                   disabled={isUploading || isReadOnly}
//                 >
//                   {isUploading ? (
//                     <ActivityIndicator size="small" color="white" />
//                   ) : (
//                     <>
//                       <Ionicons name="cloud-upload-outline" size={22} color="white" />
//                       <Text style={styles.uploadButtonText}>
//                         {isReadOnly
//                           ? tSafe('read_only_upload', 'Read Only')
//                           : tSafe('upload_photos', 'Upload {count} photo{plural}', {
//                               count: photos.length,
//                               plural: photos.length !== 1 ? 's' : '',
//                             })}
//                       </Text>
//                     </>
//                   )}
//                 </TouchableOpacity>
//               </>
//             )}

//             {photos.length === 0 && permission?.granted && !isSimulator && !isReadOnly && (
//               <Text style={styles.cameraInstructions}>
//                 {tSafe('camera_instructions', 'Tap the camera button to capture photos')}
//               </Text>
//             )}
//           </View>
//         </View>
//       </RNModal>

//       {cameraVisible ? null : (
//         <View style={{ flex: 1 }}>
//           {isLoading ? (
//             <View style={styles.loadingContainer}>
//               <CustomActivityIndicator size={40} />
//             </View>
//           ) : selectedRoom ? (
//             <RoomWorkspace room={selectedRoom} onBack={() => setSelectedRoom(null)} />
//           ) : (
//             <>
//               <View style={styles.header}>
//                 <Text style={styles.headline}>{tSafe('after_photos_tasks', 'After Photos & Tasks')}</Text>
//                 <Text style={styles.subtitle}>
//                   {tSafe('complete_rooms_order', 'Complete rooms in any order. Each room needs 3+ photos (except Extra Tasks) and all tasks checked.')}
//                 </Text>

//                 <View style={styles.minimalProgressRow}>
//                   <View style={styles.minimalProgressLeft}>
//                     <Text style={styles.minimalProgressTitle}>{tSafe('progress', 'Progress')}</Text>
//                     <View style={styles.minimalProgressBar}>
//                       <View
//                         style={[
//                           styles.minimalProgressFill,
//                           {
//                             width: `${(rooms.filter((r) => isRoomComplete(r)).length / Math.max(rooms.length, 1)) * 100}%`,
//                             backgroundColor: COLORS.primary,
//                           },
//                         ]}
//                       />
//                     </View>
//                   </View>

//                   <View style={styles.minimalProgressRight}>
//                     <Text style={styles.minimalProgressPercentage}>
//                       {Math.round((rooms.filter((r) => isRoomComplete(r)).length / Math.max(rooms.length, 1)) * 100)}%
//                     </Text>
//                     <Text style={styles.minimalProgressText}>
//                       {rooms.filter((r) => isRoomComplete(r)).length}/{rooms.length} {tSafe('rooms', 'rooms')}
//                     </Text>
//                   </View>
//                 </View>
//               </View>

//               <Text style={styles.sectionTitle}>{tSafe('all_rooms', 'All Rooms')}</Text>
//               <ScrollView style={styles.roomsContainer}>
//                 {rooms.length > 0 ? (
//                   rooms.map((room) => <RoomCard key={room.id} room={room} />)
//                 ) : (
//                   <View style={styles.noRoomsContainer}>
//                     <Ionicons name="home-outline" size={48} color={COLORS.gray} />
//                     <Text style={styles.noRoomsText}>{tSafe('no_rooms_assigned', 'No rooms assigned')}</Text>
//                   </View>
//                 )}
//               </ScrollView>

//               <TouchableOpacity
//                 style={[styles.finishButton, (!allRoomsComplete || isReadOnly) && styles.disabledFinishButton]}
//                 onPress={submitCompletion}
//                 disabled={!allRoomsComplete || isReadOnly}
//               >
//                 <Ionicons name="checkmark-done-circle" size={24} color="white" />
//                 <View style={styles.finishButtonTexts}>
//                   <Text style={styles.finishButtonMain}>
//                     {isReadOnly
//                       ? tSafe('read_only_submitted', 'Submitted – Read Only')
//                       : allRoomsComplete
//                       ? tSafe('finish_cleaning', 'Finish Cleaning')
//                       : tSafe('complete_all_rooms_first', 'Complete All Rooms First')}
//                   </Text>
//                   <Text style={styles.finishButtonSub}>
//                     {isReadOnly
//                       ? tSafe('read_only_message', 'This job has been submitted and is read only')
//                       : allRoomsComplete
//                       ? tSafe('all_rooms_complete', 'All rooms are complete!')
//                       : tSafe('rooms_remaining', '{count} room(s) remaining', {
//                           count: rooms.filter((r) => !isRoomComplete(r)).length,
//                         })}
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

// // ─── Styles ──────────────────────────────────────────────────────
// const styles = StyleSheet.create({
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
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: '#f0f0f0',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.04,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   selectedRoomCard: {
//     borderColor: COLORS.primary,
//     backgroundColor: '#f8fbff',
//     shadowOpacity: 0.08,
//   },
//   completedRoomCard: {
//     borderColor: '#d4edda',
//     backgroundColor: '#f8fff8',
//   },
//   roomCardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 14,
//   },
//   roomIconWrapper: {
//     position: 'relative',
//     marginRight: 12,
//   },
//   roomIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#f0f7ff',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   completedRoomIcon: {
//     backgroundColor: '#e8f5e8',
//   },
//   completeBadge: {
//     position: 'absolute',
//     top: -4,
//     right: -4,
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     backgroundColor: '#4CAF50',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: '#fff',
//   },
//   roomInfo: {
//     flex: 1,
//   },
//   roomName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginBottom: 4,
//   },
//   roomMeta: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   statusChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     gap: 4,
//   },
//   statusChipComplete: {
//     backgroundColor: '#e8f5e8',
//   },
//   statusChipInProgress: {
//     backgroundColor: '#fff3e0',
//   },
//   statusDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//   },
//   statusDotComplete: {
//     backgroundColor: '#4CAF50',
//   },
//   statusDotInProgress: {
//     backgroundColor: '#FF9800',
//   },
//   statusChipText: {
//     fontSize: 11,
//     fontWeight: '500',
//     color: '#555',
//   },
//   roomStats: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa',
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   statItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   statDivider: {
//     width: 1,
//     height: 16,
//     backgroundColor: '#e0e0e0',
//     marginHorizontal: 6,
//   },
//   statText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: '#555',
//   },
//   progressContainer: {
//     marginBottom: 14,
//   },
//   progressBar: {
//     height: 6,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 3,
//     overflow: 'hidden',
//     marginBottom: 6,
//   },
//   progressFill: {
//     height: '100%',
//     borderRadius: 3,
//   },
//   progressLabel: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   progressPercent: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#333',
//   },
//   progressText: {
//     fontSize: 12,
//     color: '#999',
//   },
//   roomActionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//     gap: 8,
//   },
//   startButton: {
//     backgroundColor: COLORS.primary,
//   },
//   reviewButton: {
//     backgroundColor: '#4CAF50',
//   },
//   roomActionButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
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
//   disabledButton: {
//     opacity: 0.5,
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
//   disabledText: {
//     color: '#999',
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
//   readOnlyTaskItem: {
//     opacity: 0.8,
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
//     bottom: 255,
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

//   // Bottom Section Styles
//   bottomSection: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: 'rgba(0,0,0,0.8)',
//     paddingTop: 16,
//     paddingBottom: Platform.OS === 'ios' ? 34 : 16,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   thumbnailSection: {
//     marginBottom: 16,
//   },
//   thumbnailTitle: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 16,
//     marginBottom: 8,
//   },
//   thumbnailWrapper: {
//     marginHorizontal: 4,
//     position: 'relative',
//   },
//   preview: {
//     width: 70,
//     height: 70,
//     borderRadius: 8,
//     backgroundColor: '#f0f0f0',
//   },
//   removeButton: {
//     position: 'absolute',
//     top: -6,
//     right: -6,
//     backgroundColor: 'rgba(0,0,0,0.8)',
//     borderRadius: 12,
//     padding: 2,
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
//     paddingHorizontal: 12,
//   },
//   uploadButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     paddingVertical: 16,
//     marginHorizontal: 16,
//     borderRadius: 12,
//     marginTop: 8,
//   },
//   uploadButtonDisabled: {
//     backgroundColor: COLORS.gray,
//   },
//   uploadButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 12,
//   },
//   libraryButtonBottom: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingVertical: 12,
//     marginHorizontal: 16,
//     borderRadius: 12,
//     marginBottom: 12,
//   },
//   libraryButtonBottomText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '500',
//     marginLeft: 8,
//   },
//   cameraInstructions: {
//     color: 'rgba(255,255,255,0.7)',
//     fontSize: 12,
//     textAlign: 'center',
//     marginTop: 8,
//     marginBottom: 4,
//   },

//   // Other Styles
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'black',
//   },
//   modalCloseButton: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 50 : 30,
//     right: 24,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     borderRadius: 20,
//     padding: 8,
//   },
//   fullSizeImage: {
//     width: '100%',
//     height: '100%',
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
//     marginTop: 16,
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
//   taskListContent: {
//     paddingVertical: 4,
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
// import { Checkbox } from 'react-native-paper';
// import ImageViewer from 'react-native-image-zoom-viewer';
// import RNModal from 'react-native-modal';
// import { sendPushNotifications } from '../../../utils/sendPushNotification';
// import ROUTES from '../../../constants/routes';
// import CircularProgress from 'react-native-circular-progress-indicator';
// import { Image } from 'expo-image';
// import CustomActivityIndicator from '../../../components/shared/CuustomActivityIndicator';
// import formatRoomTitle from '../../../utils/formatRoomTitle';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import * as ImagePicker from 'expo-image-picker';
// import { tSafe } from '../../../utils/tSafe';

// const { width, height } = Dimensions.get('window');

// // ─── ThumbnailItem ──────────────────────────────────────────────
// const ThumbnailItem = React.memo(({
//   photo,
//   index,
//   openImageViewer,
//   taskTitle,
//   invertPercentage,
//   getCleanlinessColor,
//   photosArray,
//   onDelete,
//   isReadOnly = false,
// }) => {
//   const photoScore = invertPercentage(photo.cleanliness?.individual_overall || 0);
//   const isProblemPhoto = photoScore < 35;
//   const fadeAnim = useRef(new Animated.Value(1)).current;

//   const handleDelete = () => {
//     if (isReadOnly) return;
//     Alert.alert(
//       tSafe('delete_photo_title', 'Delete Photo'),
//       tSafe('delete_photo_confirmation', 'Are you sure you want to permanently delete this photo?'),
//       [
//         { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
//         {
//           text: tSafe('delete', 'Delete'),
//           onPress: () => {
//             Animated.timing(fadeAnim, {
//               toValue: 0,
//               duration: 300,
//               useNativeDriver: true,
//             }).start(() => onDelete(index, taskTitle));
//           },
//         },
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
//         {!isReadOnly && (
//           <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
//             <Ionicons name="trash-outline" size={16} color="white" />
//           </TouchableOpacity>
//         )}
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

// // ─── Main Component ──────────────────────────────────────────────
// const AfterPhoto = ({ scheduleId, hostId, isReadOnly = false }) => {
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
//   const [selectedRoom, setSelectedRoom] = useState(null);
//   const [rooms, setRooms] = useState([]);

//   // Animation refs for room workspace slide transition
//   const slideAnim = useRef(new Animated.Value(width)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const [roomToShow, setRoomToShow] = useState(null);

//   const [permission, requestPermission] = useCameraPermissions();
//   const [facing, setFacing] = useState('back');
//   const [isCameraReady, setIsCameraReady] = useState(false);
//   const [isSimulator, setIsSimulator] = useState(false);

//   useEffect(() => {
//     if (Platform.OS === 'ios' && Platform.isPad) {
//       setIsSimulator(true);
//     }
//   }, []);

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
//       },
//     })
//   ).current;

//   // ─── Animation effect for room transition ──────────────────────
//   useEffect(() => {
//     if (selectedRoom) {
//       setRoomToShow(selectedRoom);
//       Animated.parallel([
//         Animated.spring(slideAnim, {
//           toValue: 0,
//           useNativeDriver: true,
//           tension: 80,
//           friction: 12,
//         }),
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 300,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     } else {
//       Animated.parallel([
//         Animated.spring(slideAnim, {
//           toValue: width,
//           useNativeDriver: true,
//           tension: 80,
//           friction: 12,
//         }),
//         Animated.timing(fadeAnim, {
//           toValue: 0,
//           duration: 200,
//           useNativeDriver: true,
//         }),
//       ]).start(() => {
//         setRoomToShow(null);
//       });
//     }
//   }, [selectedRoom]);

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

//   const invertPercentage = (score) => 100 - (score * 10);

//   const getCleanlinessLabel = (invertedScore) => {
//     if (invertedScore <= 35) return tSafe('needs_deep_cleaning', 'Needs Deep Cleaning');
//     if (invertedScore <= 40) return tSafe('requires_attention', 'Requires Attention');
//     return tSafe('very_clean', 'Very Clean');
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
//       const getCleanerById = (id) => res.assignedTo.find((cleaner) => cleaner.cleanerId === id);
//       const cl = getCleanerById(currentUserId);

//       if (cl?.checklist?.details) {
//         const details = cl.checklist.details;
//         setSelectedImages(details);

//         const roomArray = Object.keys(details).map((key) => {
//           const roomData = details[key];
//           const isExtraRoom = key === 'Extra';

//           return {
//             id: key,
//             name: isExtraRoom ? tSafe('extra_tasks', 'Extra Tasks') : formatRoomTitle(key),
//             type: isExtraRoom ? 'extra' : key.split('_')[0],
//             tasks: roomData.tasks || [],
//             photos: roomData.photos || [],
//             completed: isExtraRoom
//               ? (roomData.tasks || []).every((task) => task.value === true)
//               : (roomData.tasks || []).every((task) => task.value === true) &&
//                 (roomData.photos || []).length >= 3,
//             isExtra: isExtraRoom,
//           };
//         });

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
//           console.error('Error fetching data:', error);
//         }
//       };
//       if (isActive) fetchData();
//       return () => {
//         isActive = false;
//       };
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

//     const formattedImages = images.map((photo) => {
//       const score = invertPercentage(photo.cleanliness?.individual_overall || 0);
//       const status = getCleanlinessLabel(score);

//       return {
//         url: status === 'Very Clean' ? photo.img_url : photo.cleanliness?.heatmap_url || photo.img_url,
//         cleanliness: photo.cleanliness,
//         props: { source: { uri: status === 'Very Clean' ? photo.img_url : photo.cleanliness?.heatmap_url || photo.img_url } },
//         category: category,
//       };
//     });

//     setCurrentImages(formattedImages);
//     setCurrentImageIndex(index);
//     setBeforeModalVisible(true);
//   }, []);

//   const takePicture = async () => {
//     if (isReadOnly) {
//       Alert.alert(tSafe('read_only', 'Read Only'), tSafe('read_only_message', 'You cannot add photos after submitting.'));
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
//           skipProcessing: true,
//         });

//         const newPhoto = {
//           uri: photo.uri,
//           base64: photo.base64,
//           filename: `photo_${Date.now()}.jpg`,
//           file: `data:image/jpeg;base64,${photo.base64}`,
//         };

//         if (photos.length < MAX_IMAGES_UPLOAD) {
//           setPhotos((prev) => [...prev, newPhoto]);
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

//   const pickImageFromLibrary = async () => {
//     if (isReadOnly) {
//       Alert.alert(tSafe('read_only', 'Read Only'), tSafe('read_only_message', 'You cannot add photos after submitting.'));
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
//         selectionLimit: MAX_IMAGES_UPLOAD - photos.length,
//       });

//       if (!result.canceled) {
//         const newPhotos = result.assets.map((asset, index) => ({
//           uri: asset.uri,
//           base64: asset.base64,
//           filename: `photo_${Date.now()}_${index}.jpg`,
//           file: `data:image/jpeg;base64,${asset.base64}`,
//         }));

//         if (photos.length + newPhotos.length <= MAX_IMAGES_UPLOAD) {
//           setPhotos((prev) => [...prev, ...newPhotos]);
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

//   const flipCamera = () => {
//     setFacing((current) => (current === 'back' ? 'front' : 'back'));
//   };

//   const openCamera = (taskTitle) => {
//     if (isReadOnly) {
//       Alert.alert(tSafe('read_only', 'Read Only'), tSafe('read_only_message', 'You cannot add photos after submitting.'));
//       return;
//     }
//     setSelectedTaskTitle(taskTitle);
//     setPhotos([]);
//     setIsCameraReady(false);
//     setCameraVisible(true);
//   };

//   const validateTasks = () => {
//     if (!selectedImages || Object.keys(selectedImages).length === 0) {
//       Alert.alert(
//         tSafe('validation_error_title', 'Validation Error'),
//         tSafe('no_tasks_or_images', 'No tasks or images found for validation.')
//       );
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

//       if (!isExtraRoom && (!photos || photos.length < 3)) {
//         insufficientImagesCategories.push(category);
//       }
//     });

//     if (invalidCategories.length > 0 || insufficientImagesCategories.length > 0) {
//       let errorMessage = '';
//       if (invalidCategories.length > 0)
//         errorMessage += tSafe('incomplete_tasks', 'Incomplete tasks in: {categories}.\n', {
//           categories: invalidCategories.join(', '),
//         });
//       if (insufficientImagesCategories.length > 0)
//         errorMessage += tSafe('insufficient_images', 'Insufficient images in: {categories}.', {
//           categories: insufficientImagesCategories.join(', '),
//         });
//       Alert.alert(tSafe('validation_error_title', 'Validation Error'), errorMessage);
//       return false;
//     }

//     return true;
//   };

//   const onSubmit = async () => {
//     if (isReadOnly) {
//       Alert.alert(tSafe('read_only', 'Read Only'), tSafe('read_only_message', 'You cannot upload photos after submitting.'));
//       return;
//     }
//     if (photos.length === 0) {
//       Alert.alert(
//         tSafe('no_photos_title', 'No Photos'),
//         tSafe('take_photo_before_upload', 'Please take at least one photo before uploading.')
//       );
//       return;
//     }

//     if (photos.length > MAX_IMAGES_UPLOAD) {
//       Alert.alert(
//         tSafe('upload_limit_exceeded_title', 'Upload Limit Exceeded'),
//         tSafe('max_photos_allowed_upload', 'You can only upload up to {count} images at a time.', { count: MAX_IMAGES_UPLOAD })
//       );
//       return;
//     }

//     setIsUploading(true);

//     const imagesToUpload = photos.map((photo) => ({
//       filename: photo.filename,
//       file: photo.file,
//     }));

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
//         Alert.alert(
//           tSafe('upload_successful_title', 'Upload Successful'),
//           tSafe('photos_uploaded_count', '{count} photos have been uploaded successfully!', { count: photos.length })
//         );
//         fetchImages();
//         setPhotos([]);
//         setCameraVisible(false);
//       }
//     } catch (err) {
//       console.error('Error uploading photos:', err);
//       Alert.alert(
//         tSafe('upload_failed_title', 'Upload Failed'),
//         tSafe('upload_error_message', 'An error occurred while uploading your photos.')
//       );
//     } finally {
//       setIsUploading(false);
//     }
//   };

// //   const updateTasksInBackend = async (category, updatedTasks) => {
// //     console.log(updatedTasks)
// //     if (isReadOnly) return;
// //     try {
// //       const data = { scheduleId, cleanerId: currentUserId, category, tasks: updatedTasks };
// //       await userService.updateChecklist(data);
// //     } catch (err) {
// //       console.error('Error updating tasks:', err);
// //     }
// //   };

//   const updateTasksInBackend = async (category, updatedTasks) => {
//     if (isReadOnly) return;
//     try {
//       const formattedTasks = updatedTasks.map(task => ({
//         name: task.name,
//         value: task.value === true
//       }));
  
//       const data = { scheduleId, cleanerId: currentUserId, category, tasks: formattedTasks };
//       console.log('Payload sent to /update_checklist_tasks:', data);
//       await userService.updateChecklist(data);
//     } catch (err) {
//       console.error('Error updating tasks:', err);
//     }
//   };

//   const handleTaskToggle = (category, taskId) => {
//     if (isReadOnly) return;
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
//     if (isReadOnly) return;
//     setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
//   };

// //   const handleDeletePhoto = async (indexToDelete, category) => {
// //     if (isReadOnly) return;
// //     try {
// //       const photoToDelete = selectedImages[category]?.photos[indexToDelete];
// //       if (!photoToDelete) {
// //         Alert.alert(tSafe('error_title', 'Error'), tSafe('photo_not_found', 'Photo not found'));
// //         return;
// //       }

// //       const originalFilename = photoToDelete.img_url.split('/').pop();
// //       const heatmapFilename = photoToDelete.cleanliness?.heatmap_url?.split('/').pop();

// //       setSelectedImages((prev) => {
// //         const updated = { ...prev };
// //         updated[category].photos = updated[category].photos.filter((_, i) => i !== indexToDelete);
// //         return updated;
// //       });

// //       const data = { originalFilename, heatmapFilename, category, scheduleId };
// //       await userService.deleteSpaceAfterPhoto(data);
// //       updateTasksInBackend(selectedImages);
// //     } catch (error) {
// //       console.error('Delete failed:', error);
// //       setSelectedImages((prev) => ({ ...prev }));
// //       Alert.alert(
// //         tSafe('deletion_failed_title', 'Deletion Failed'),
// //         error.response?.data?.detail || tSafe('could_not_delete_photo', 'Could not delete photo')
// //       );
// //     }
// //   };


// //   const handleDeletePhoto = async (indexToDelete, category) => {
// //     if (isReadOnly) return;
// //     try {
// //       const photoToDelete = selectedImages[category]?.photos[indexToDelete];
// //       if (!photoToDelete) {
// //         Alert.alert(tSafe('error_title', 'Error'), tSafe('photo_not_found', 'Photo not found'));
// //         return;
// //       }
  
// //       const originalFilename = photoToDelete.img_url.split('/').pop();
// //       const heatmapFilename = photoToDelete.cleanliness?.heatmap_url?.split('/').pop();
  
// //       // Optimistic UI update
// //       setSelectedImages((prev) => {
// //         const updated = { ...prev };
// //         updated[category].photos = updated[category].photos.filter((_, i) => i !== indexToDelete);
// //         return updated;
// //       });
  
// //       // Build payload – only include heatmap if it exists
// //       const data = { originalFilename, category, scheduleId };
// //       if (heatmapFilename) {
// //         data.heatmapFilename = heatmapFilename;
// //       }

// //       console.log("Delete data-----12", data)
  
// //       await userService.deleteSpaceAfterPhoto(data);
// //       updateTasksInBackend(selectedImages); // consider using updated state
// //     } catch (error) {
// //       console.error('Delete failed:', error);
// //       setSelectedImages((prev) => ({ ...prev })); // rollback
// //       Alert.alert(
// //         tSafe('deletion_failed_title', 'Deletion Failed'),
// //         error.response?.data?.detail || tSafe('could_not_delete_photo', 'Could not delete photo')
// //       );
// //     }
// //   };


// // ─── Delete a photo (no task update) ──────────────────────────────
// const handleDeletePhoto = async (indexToDelete, category) => {
//     if (isReadOnly) return;
  
//     try {
//       const photoToDelete = selectedImages[category]?.photos[indexToDelete];
//       if (!photoToDelete) {
//         Alert.alert(tSafe('error_title', 'Error'), tSafe('photo_not_found', 'Photo not found'));
//         return;
//       }
  
//     //   const originalFilename = photoToDelete.img_url.split('/').pop();
//     //   const heatmapFilename = photoToDelete.cleanliness?.heatmap_url?.split('/').pop();

//         const fullFilename = photoToDelete.img_url.split('/').pop();
//         const originalFilename = fullFilename.split('?')[0];   // remove query string
//         const heatmapFilename = photoToDelete.cleanliness?.heatmap_url?.split('/').pop()?.split('?')[0] || null;

//         const data = {
//             originalFilename,
//             category,
//             scheduleId,
//             cleanerId: currentUserId,   // add this to identify which cleaner's photos to remove
//         };
//         if (heatmapFilename) {
//             data.heatmapFilename = heatmapFilename;
//         }
  
//       // ── Optimistic UI update ──
//       setSelectedImages((prev) => {
//         const updated = { ...prev };
//         updated[category].photos = updated[category].photos.filter((_, i) => i !== indexToDelete);
//         return updated;
//       });
  
//       // ── Build deletion payload ──
//     //   const data = {
//     //     originalFilename,
//     //     category,
//     //     scheduleId,
//     //     cleanerId: currentUserId,   // ← add this
//     //   };
//     //   if (heatmapFilename) {
//     //     data.heatmapFilename = heatmapFilename;
//     //   }
//       console.log('🗑️ Delete payload:', data);
  
//       await userService.deleteSpaceAfterPhoto(data);
  
//       // ✅ REMOVED the incorrect call: updateTasksInBackend(selectedImages);
//       // (Deleting a photo does not change task statuses, so no need to update tasks.)
  
//     } catch (error) {
//       console.error('Delete failed:', error);
//       // Rollback optimistic update
//       setSelectedImages((prev) => ({ ...prev }));
//       Alert.alert(
//         tSafe('deletion_failed_title', 'Deletion Failed'),
//         error.response?.data?.detail || tSafe('could_not_delete_photo', 'Could not delete photo')
//       );
//     }
//   };

//   // ─── TaskItem (memo) ──────────────────────────────────────────────
//   const TaskItem = React.memo(({ task, roomId, onToggle }) => {
//     const handlePress = useCallback(() => {
//       if (isReadOnly) return;
//       onToggle(roomId, task.id);
//     }, [roomId, task.id, onToggle, isReadOnly]);

//     return (
//       <TouchableOpacity
//         style={[styles.taskItem, task.value && styles.taskItemCompleted, isReadOnly && styles.readOnlyTaskItem]}
//         onPress={handlePress}
//         activeOpacity={isReadOnly ? 1 : 0.7}
//         disabled={isReadOnly}
//       >
//         <View style={styles.taskItemLeft}>
//           <Checkbox.Android
//             status={task.value ? 'checked' : 'unchecked'}
//             onPress={() => {}}
//             color={COLORS.primary}
//             uncheckedColor="#000"
//             pointerEvents="none"
//           />
//           <View style={styles.taskTextContainer}>
//             <Text style={[styles.taskLabel, task.value && styles.taskLabelCompleted]}>{task.label}</Text>
//             {(task.time || task.price) && (
//               <View style={styles.taskMeta}>
//                 {task.time && (
//                   <View style={styles.taskMetaItem}>
//                     <Ionicons name="time-outline" size={12} color="#666" />
//                     <Text style={styles.taskMetaText}>
//                       {task.time} {tSafe('min', 'min')}
//                       {task.time > 1 ? 's' : ''}
//                     </Text>
//                   </View>
//                 )}
//                 {task.price && (
//                   <View style={styles.taskMetaItem}>
//                     <Ionicons name="cash-outline" size={12} color="#4CAF50" />
//                     <Text style={styles.taskMetaText}>${task.price}</Text>
//                   </View>
//                 )}
//               </View>
//             )}
//           </View>
//           {task.value ? (
//             <View style={styles.completedIndicator}>
//               <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
//             </View>
//           ) : (
//             <Ionicons name="ellipse-outline" size={20} color="#ddd" />
//           )}
//         </View>
//       </TouchableOpacity>
//     );
//   });

//   const submitCompletion = useCallback(async () => {
//     if (isReadOnly) {
//       Alert.alert(
//         tSafe('read_only', 'Read Only'),
//         tSafe('read_only_message', 'You cannot submit after this job has been completed.')
//       );
//       return;
//     }
//     if (!validateTasks()) return;
//     setIsLoading(true);
//     try {
//       await userService.finishCleaning({
//         scheduleId,
//         cleanerId: currentUserId,
//         completed_tasks: selectedImages,
//         fee: parseFloat(cleaning_fee),
//         completionTime: new Date(),
//       });
//       sendPushNotifications(
//         hostTokens,
//         tSafe('cleaner_completed_cleaning_title', '{name} Completed Cleaning', { name: currentUser.firstname }),
//         tSafe('cleaner_completed_cleaning_message', '{firstname} {lastname} has completed the cleaning.', {
//           firstname: currentUser.firstname,
//           lastname: currentUser.lastname,
//         }),
//         { screen: ROUTES.host_task_progress, params: { scheduleId } }
//       );
//       Alert.alert(tSafe('success_title', 'Success'), tSafe('cleaning_completed', 'Cleaning completed successfully!'));
//     } finally {
//       setIsLoading(false);
//     }
//   }, [selectedImages, hostTokens, scheduleId, currentUser, isReadOnly]);

//   const getRoomProgress = (room) => {
//     if (!selectedImages[room.id]) return 0;
//     const roomData = selectedImages[room.id];
//     const isExtraRoom = room.id === 'Extra';

//     const taskProgress =
//       roomData.tasks?.length > 0
//         ? (roomData.tasks.filter((t) => t.value).length / roomData.tasks.length) * (isExtraRoom ? 100 : 50)
//         : 0;

//     const photoProgress = isExtraRoom ? 0 : Math.min((roomData.photos?.length || 0 / 3) * 50, 50);

//     return taskProgress + photoProgress;
//   };

//   const isRoomComplete = (room) => {
//     if (!selectedImages[room.id]) return false;
//     const roomData = selectedImages[room.id];

//     const isExtraRoom = room.id === 'Extra';
//     const tasksComplete = roomData.tasks?.every((task) => task.value === true) || false;
//     const photosComplete = isExtraRoom ? true : (roomData.photos?.length || 0) >= 3;

//     return tasksComplete && photosComplete;
//   };

//   const allRoomsComplete = rooms.every((room) => isRoomComplete(room));

//   const markRoomComplete = (roomId) => {
//     if (isReadOnly) return;
//     Alert.alert(
//       tSafe('mark_room_complete_title', 'Mark Room Complete'),
//       tSafe('mark_room_complete_confirmation', 'Are you sure this room is fully cleaned and all photos are taken?'),
//       [
//         { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
//         {
//           text: tSafe('mark_complete', 'Mark Complete'),
//           onPress: () => {
//             setRooms((prev) =>
//               prev.map((room) => (room.id === roomId ? { ...room, completed: true } : room))
//             );
//             Alert.alert(tSafe('success_title', 'Success'), tSafe('room_marked_complete', 'Room marked as complete!'));
//           },
//         },
//       ]
//     );
//   };

//   const getRoomIcon = (type) => {
//     switch (type.toLowerCase()) {
//       case 'bedroom':
//         return 'bed';
//       case 'bathroom':
//         return 'shower';
//       case 'kitchen':
//         return 'silverware-fork-knife';
//       case 'livingroom':
//         return 'sofa';
//       case 'extra':
//         return 'plus-circle';
//       default:
//         return 'home';
//     }
//   };

//   const onCloseCamera = () => {
//     setCameraVisible(false);
//     setPhotos([]);
//   };

//   // ─── RoomCard ────────────────────────────────────────────────────
//   const RoomCard = ({ room }) => {
//     const progress = getRoomProgress(room);
//     const isComplete = isRoomComplete(room);
//     const roomData = selectedImages[room.id] || {};
//     const totalTasks = roomData.tasks?.length || 0;
//     const completedTasks = roomData.tasks?.filter((t) => t.value).length || 0;
//     const photoCount = roomData.photos?.length || 0;
//     const photoTarget = room.isExtra ? 0 : 3;

//     return (
//       <TouchableOpacity
//         style={[
//           styles.roomCard,
//           selectedRoom?.id === room.id && styles.selectedRoomCard,
//           isComplete && styles.completedRoomCard,
//         ]}
//         onPress={() => setSelectedRoom(room)}
//         activeOpacity={0.9}
//         disabled={isReadOnly && isComplete}
//       >
//         <View style={styles.roomCardHeader}>
//           <View style={styles.roomIconWrapper}>
//             <View style={[styles.roomIcon, isComplete && styles.completedRoomIcon]}>
//               <MaterialCommunityIcons
//                 name={getRoomIcon(room.type)}
//                 size={24}
//                 color={isComplete ? '#4CAF50' : COLORS.primary}
//               />
//             </View>
//             {isComplete && (
//               <View style={styles.completeBadge}>
//                 <MaterialCommunityIcons name="check" size={12} color="#fff" />
//               </View>
//             )}
//           </View>

//           <View style={styles.roomInfo}>
//             <Text style={styles.roomName}>{room.name}</Text>
//             <View style={styles.roomMeta}>
//               <View
//                 style={[
//                   styles.statusChip,
//                   isComplete ? styles.statusChipComplete : styles.statusChipInProgress,
//                 ]}
//               >
//                 <View
//                   style={[
//                     styles.statusDot,
//                     isComplete ? styles.statusDotComplete : styles.statusDotInProgress,
//                   ]}
//                 />
//                 <Text style={styles.statusChipText}>
//                   {isComplete ? tSafe('complete_status', 'Complete') : tSafe('in_progress_status', 'In Progress')}
//                 </Text>
//               </View>
//             </View>
//           </View>

//           <View style={styles.roomStats}>
//             <View style={styles.statItem}>
//               <MaterialCommunityIcons name="camera-outline" size={14} color="#888" />
//               <Text style={styles.statText}>
//                 {photoCount}/{photoTarget === 0 ? '∞' : photoTarget}
//               </Text>
//             </View>
//             <View style={styles.statDivider} />
//             <View style={styles.statItem}>
//               <MaterialCommunityIcons name="check-circle-outline" size={14} color="#888" />
//               <Text style={styles.statText}>
//                 {completedTasks}/{totalTasks}
//               </Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.progressContainer}>
//           <View style={styles.progressBar}>
//             <View
//               style={[
//                 styles.progressFill,
//                 {
//                   width: `${progress}%`,
//                   backgroundColor: isComplete ? '#4CAF50' : COLORS.primary,
//                 },
//               ]}
//             />
//           </View>
//           <View style={styles.progressLabel}>
//             <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
//             <Text style={styles.progressText}>{tSafe('complete_percent', 'complete')}</Text>
//           </View>
//         </View>

//         <TouchableOpacity
//           style={[styles.roomActionButton, isComplete ? styles.reviewButton : styles.startButton]}
//           onPress={() => setSelectedRoom(room)}
//           activeOpacity={0.8}
//           disabled={isReadOnly && isComplete}
//         >
//           <Text style={styles.roomActionButtonText}>
//             {isComplete ? tSafe('review', 'Review') : tSafe('continue', 'Continue')}
//           </Text>
//           <Ionicons name={isComplete ? 'chevron-forward' : 'arrow-forward'} size={18} color="white" />
//         </TouchableOpacity>
//       </TouchableOpacity>
//     );
//   };

//   // ─── RoomWorkspace ──────────────────────────────────────────────
//   const RoomWorkspace = ({ room, onBack }) => {
//     const roomData = selectedImages[room.id] || {};
//     const isExtraRoom = room.id === 'Extra';

//     const scrollRef = useRef(null);
//     const scrollOffsetRef = useRef(0);

//     useEffect(() => {
//       if (scrollRef.current && scrollOffsetRef.current > 0) {
//         requestAnimationFrame(() => {
//           scrollRef.current?.scrollTo({ y: scrollOffsetRef.current, animated: false });
//         });
//       }
//     }, [roomData.tasks]);

//     return (
//       <View style={styles.workspace}>
//         <View style={styles.workspaceHeader}>
//           <TouchableOpacity onPress={onBack} style={styles.backButton}>
//             <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
//           </TouchableOpacity>
//           <View style={styles.roomTitleSection}>
//             <Text style={styles.workspaceRoomTitle}>{room.name}</Text>
//             <Text style={styles.workspaceRoomSubtitle}>
//               {isRoomComplete(room) ? tSafe('completed', 'Completed') : tSafe('in_progress', 'In Progress')}
//             </Text>
//           </View>
//           <CircularProgress
//             value={getRoomProgress(room)}
//             radius={24}
//             duration={1000}
//             progressValueColor={isRoomComplete(room) ? '#4CAF50' : COLORS.primary}
//             activeStrokeColor={isRoomComplete(room) ? '#4CAF50' : COLORS.primary}
//             activeStrokeWidth={4}
//             inActiveStrokeWidth={4}
//             inActiveStrokeColor="#e0e0e0"
//             maxValue={100}
//           />
//         </View>

//         <ScrollView
//           ref={scrollRef}
//           onScroll={(e) => {
//             scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
//           }}
//           scrollEventThrottle={16}
//           style={styles.workspaceContent}
//           showsVerticalScrollIndicator={false}
//           removeClippedSubviews={false}
//         >
//           {/* Photos Section */}
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Ionicons name="camera" size={22} color={COLORS.primary} />
//               <Text style={styles.sectionTitle}>
//                 {isExtraRoom
//                   ? tSafe('additional_photos_optional', 'Additional Photos (Optional)')
//                   : tSafe('after_photos', 'After Photos')}
//               </Text>
//               {!isExtraRoom && (
//                 <View style={styles.badge}>
//                   <Text style={styles.badgeText}>{roomData.photos?.length || 0}/3</Text>
//                 </View>
//               )}
//             </View>

//             <Text style={styles.sectionDescription}>
//               {isExtraRoom
//                 ? tSafe('extra_photos_description', 'Take photos of any additional cleaning tasks if needed')
//                 : tSafe('after_photos_description', 'Take photos of the same areas as your before photos')}
//             </Text>

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
//                     isReadOnly={isReadOnly}
//                   />
//                 )}
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.previewContainer}
//                 ListEmptyComponent={
//                   <View style={styles.emptyPhotos}>
//                     <Ionicons name="camera-outline" size={40} color="#ddd" />
//                     <Text style={styles.emptyPhotosText}>{tSafe('no_photos_yet', 'No photos yet')}</Text>
//                     <Text style={styles.emptyPhotosSubtext}>
//                       {isExtraRoom
//                         ? tSafe('photos_optional_message', 'Photos are optional for extra tasks')
//                         : tSafe('tap_to_add_photos', 'Tap the button below to add photos')}
//                     </Text>
//                   </View>
//                 }
//               />
//             </View>

//             <TouchableOpacity
//               style={[styles.addPhotosButton, isReadOnly && styles.disabledButton]}
//               onPress={() => openCamera(room.id)}
//               disabled={isReadOnly}
//             >
//               <View style={styles.addButtonContent}>
//                 <Ionicons name="add-circle" size={24} color={isReadOnly ? '#999' : 'white'} />
//                 <View style={styles.addButtonTextContainer}>
//                   <Text style={[styles.addButtonMainText, isReadOnly && styles.disabledText]}>
//                     {isExtraRoom
//                       ? tSafe('add_optional_photos', 'Add Optional Photos')
//                       : roomData.photos?.length >= 3
//                       ? tSafe('add_more_photos', 'Add More Photos')
//                       : tSafe('take_photos', 'Take Photos')}
//                   </Text>
//                   <Text style={[styles.addButtonSubText, isReadOnly && styles.disabledText]}>
//                     {isReadOnly
//                       ? tSafe('read_only_photos', 'Read only – no changes allowed')
//                       : isExtraRoom
//                       ? tSafe('document_additional_work', 'Document any additional cleaning work')
//                       : roomData.photos?.length >= 3
//                       ? tSafe('can_add_more_photos', 'You can add more photos if needed')
//                       : tSafe('photos_needed', '{count} more needed', { count: 3 - (roomData.photos?.length || 0) })}
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
//                 {isExtraRoom ? tSafe('additional_tasks', 'Additional Tasks') : tSafe('cleaning_tasks', 'Cleaning Tasks')}
//               </Text>
//               <View style={styles.badge}>
//                 <Text style={styles.badgeText}>
//                   {roomData.tasks?.filter((t) => t.value).length || 0}/{roomData.tasks?.length || 0}
//                 </Text>
//               </View>
//             </View>

//             <View style={styles.taskProgress}>
//               <View style={styles.taskProgressBar}>
//                 <View
//                   style={[
//                     styles.taskProgressFill,
//                     {
//                       width: `${
//                         roomData.tasks?.length > 0
//                           ? (roomData.tasks.filter((t) => t.value).length / roomData.tasks.length) * 100
//                           : 0
//                       }%`,
//                     },
//                   ]}
//                 />
//               </View>
//               <Text style={styles.taskProgressText}>
//                 {roomData.tasks?.filter((t) => t.value).length || 0} {tSafe('of', 'of')}{' '}
//                 {roomData.tasks?.length || 0} {tSafe('tasks_completed', 'tasks completed')}
//               </Text>
//             </View>

//             <View style={styles.taskList}>
//               {roomData.tasks?.map((item) => (
//                 <TaskItem key={item.id} task={item} roomId={room.id} onToggle={handleTaskToggle} />
//               ))}

//               {(!roomData.tasks || roomData.tasks.length === 0) && (
//                 <View style={styles.noTasksContainer}>
//                   <Ionicons name="list-outline" size={40} color="#ddd" />
//                   <Text style={styles.noTasksText}>{tSafe('no_tasks_assigned', 'No tasks assigned')}</Text>
//                 </View>
//               )}
//             </View>
//           </View>

//           {/* Completion Requirements */}
//           <View style={styles.requirementsSection}>
//             <Text style={styles.requirementsTitle}>
//               {tSafe('to_complete', 'To complete this {type}:', {
//                 type: isExtraRoom ? tSafe('section', 'section') : tSafe('room', 'room'),
//               })}
//             </Text>

//             {!isExtraRoom && (
//               <View style={styles.requirementItem}>
//                 <Ionicons
//                   name={roomData.photos?.length >= 3 ? 'checkmark-circle' : 'ellipse-outline'}
//                   size={20}
//                   color={roomData.photos?.length >= 3 ? '#4CAF50' : '#666'}
//                 />
//                 <Text
//                   style={[
//                     styles.requirementText,
//                     roomData.photos?.length >= 3 && styles.requirementTextCompleted,
//                   ]}
//                 >
//                   {tSafe('minimum_photos', 'Minimum 3 photos ({count}/{total})', {
//                     count: roomData.photos?.length || 0,
//                     total: 3,
//                   })}
//                 </Text>
//               </View>
//             )}

//             <View style={styles.requirementItem}>
//               <Ionicons
//                 name={roomData.tasks?.every((t) => t.value) ? 'checkmark-circle' : 'ellipse-outline'}
//                 size={20}
//                 color={roomData.tasks?.every((t) => t.value) ? '#4CAF50' : '#666'}
//               />
//               <Text
//                 style={[
//                   styles.requirementText,
//                   roomData.tasks?.every((t) => t.value) && styles.requirementTextCompleted,
//                 ]}
//               >
//                 {tSafe('all_tasks_completed', 'All tasks completed ({count}/{total})', {
//                   count: roomData.tasks?.filter((t) => t.value).length || 0,
//                   total: roomData.tasks?.length || 0,
//                 })}
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
//                   {room.name} {tSafe('already_completed', 'is already completed')}
//                 </Text>
//               </View>
//             ) : (
//               <TouchableOpacity
//                 style={[styles.markCompleteButton, isReadOnly && styles.disabledButton]}
//                 onPress={() => markRoomComplete(room.id)}
//                 disabled={isReadOnly}
//               >
//                 <Ionicons name="checkmark-done" size={24} color="white" />
//                 <View style={styles.markCompleteButtonTexts}>
//                   <Text style={styles.markCompleteButtonMain}>
//                     {tSafe('mark_room_complete', 'Mark {room} Complete', { room: room.name })}
//                   </Text>
//                   <Text style={styles.markCompleteButtonSub}>
//                     {tSafe('all_requirements_met', 'All requirements are met ✓')}
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             )
//           ) : (
//             <View style={styles.incompleteRequirements}>
//               <Ionicons name="alert-circle" size={24} color="#FF9800" />
//               <View style={styles.incompleteRequirementsTexts}>
//                 <Text style={styles.incompleteRequirementsMain}>
//                   {tSafe('complete_requirements_to_finish', 'Complete requirements to finish')}
//                 </Text>
//                 <Text style={styles.incompleteRequirementsSub}>
//                   {!isExtraRoom &&
//                     roomData.photos?.length < 3 &&
//                     tSafe('more_photos_needed', '{count} more photos, ', {
//                       count: 3 - (roomData.photos?.length || 0),
//                     })}
//                   {roomData.tasks?.filter((t) => !t.value).length} {tSafe('more_tasks', 'more tasks')}
//                 </Text>
//               </View>
//             </View>
//           )}
//         </View>
//       </View>
//     );
//   };

//   // ─── Main render ──────────────────────────────────────────────────
//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Image Viewer Modal */}
//       <RNModal
//         isVisible={isBeforeModalVisible}
//         style={styles.fullScreenModal}
//         onBackdropPress={() => setBeforeModalVisible(false)}
//       >
//         <View style={styles.modalContainer}>
//           <ImageViewer
//             imageUrls={currentImages}
//             index={currentImageIndex}
//             backgroundColor="black"
//             enableSwipeDown
//             enableImageZoom
//             onSwipeDown={() => setBeforeModalVisible(false)}
//             renderImage={(props) => <Image source={props.source} style={styles.fullSizeImage} contentFit="contain" />}
//           />

//           {currentImages[currentImageIndex]?.cleanliness && (
//             <Animated.View style={[styles.analysisPanel, { transform: [{ translateY: pan.y }] }]} {...panResponder.panHandlers}>
//               <View style={styles.dragHandle} />
//               <View style={styles.analysisContent}>
//                 <Text style={styles.analysisTitle}>{tSafe('cleanliness_analysis', 'CLEANLINESS ANALYSIS')}</Text>

//                 <View style={styles.scoreSection}>
//                   <Text style={styles.sectionTitle}>{tSafe('this_photo', 'THIS PHOTO')}</Text>
//                   <View style={styles.scoreRow}>
//                     <View style={styles.scoreText}>
//                       <Text style={styles.scorePercentage}>
//                         {invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0).toFixed(
//                           0
//                         )}
//                         %
//                       </Text>
//                       <Text style={styles.scoreLabel}>
//                         {getCleanlinessLabel(
//                           invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0)
//                         )}
//                       </Text>
//                     </View>
//                     <CircularProgress
//                       value={invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0)}
//                       radius={35}
//                       activeStrokeColor={getCleanlinessColor(
//                         invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0)
//                       )}
//                       inActiveStrokeColor="#2d2d2d"
//                       maxValue={100}
//                     />
//                   </View>
//                 </View>

//                 <Text style={styles.sectionTitle}>{tSafe('main_issues', 'MAIN ISSUES')}</Text>
//                 <View style={styles.issuesList}>
//                   {Object.entries(currentImages[currentImageIndex].cleanliness.scores || {})
//                     .sort(([, a], [, b]) => b - a)
//                     .slice(0, 3)
//                     .map(([factor, score]) => (
//                       <View key={factor} style={styles.issueItem}>
//                         <Text style={styles.issueName}>{factor.replace(/_/g, ' ').toUpperCase()}</Text>
//                         <Text style={[styles.issueScore, { color: getCleanlinessColor(100 - score * 10) }]}>
//                           {(100 - score * 10).toFixed(0)}%
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
//       </RNModal>

//       {/* Camera Modal */}
//       <RNModal isVisible={cameraVisible} style={styles.fullScreenModal} onBackdropPress={() => setCameraVisible(false)}>
//         <View style={styles.cameraModalContainer}>
//           <View style={styles.cameraHeader}>
//             <TouchableOpacity style={styles.cameraCloseButton} onPress={onCloseCamera}>
//               <Ionicons name="chevron-down" size={28} color="white" />
//             </TouchableOpacity>

//             {!isSimulator && permission?.granted && (
//               <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
//                 <Ionicons name="camera-reverse" size={24} color="white" />
//               </TouchableOpacity>
//             )}
//           </View>

//           {isSimulator ? (
//             <View style={styles.simulatorContainer}>
//               <Ionicons name="images-outline" size={64} color="white" />
//               <Text style={styles.simulatorText}>{tSafe('camera_not_available_simulator', 'Camera not available in simulator')}</Text>
//               <Text style={styles.simulatorSubtext}>
//                 {tSafe('use_pick_from_library', 'Use "Pick from Library" button below to add photos')}
//               </Text>
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
//               <View style={styles.photoCounter}>
//                 <Ionicons name="images-outline" size={16} color="white" />
//                 <Text style={styles.photoCounterText}>
//                   {photos.length}/{MAX_IMAGES_UPLOAD}
//                 </Text>
//               </View>

//               <View style={styles.cameraControls}>
//                 <TouchableOpacity
//                   style={styles.captureButton}
//                   onPress={takePicture}
//                   disabled={photos.length >= MAX_IMAGES_UPLOAD}
//                 >
//                   <View style={styles.captureButtonInner}>
//                     <Ionicons name="camera" size={32} color="white" />
//                   </View>
//                 </TouchableOpacity>
//               </View>
//             </CameraView>
//           )}

//           <View style={styles.bottomSection}>
//             {photos.length === 0 && permission?.granted && !isSimulator && !isReadOnly && (
//               <TouchableOpacity style={styles.libraryButtonBottom} onPress={pickImageFromLibrary}>
//                 <Ionicons name="images" size={20} color="white" />
//                 <Text style={styles.libraryButtonBottomText}>{tSafe('pick_from_library', 'Pick from Library')}</Text>
//               </TouchableOpacity>
//             )}

//             {photos.length > 0 && (
//               <>
//                 <View style={styles.thumbnailSection}>
//                   <Text style={styles.thumbnailTitle}>{tSafe('selected_photos', 'Selected Photos')}</Text>
//                   <FlatList
//                     data={photos}
//                     horizontal
//                     keyExtractor={(item, index) => index.toString()}
//                     renderItem={({ item, index }) => (
//                       <View style={styles.thumbnailWrapper}>
//                         <Image source={{ uri: item.uri || item.file }} style={styles.preview} />
//                         {!isReadOnly && (
//                           <TouchableOpacity onPress={() => removePhoto(index)} style={styles.removeButton}>
//                             <Ionicons name="close-circle" size={20} color="white" />
//                           </TouchableOpacity>
//                         )}
//                         <View style={styles.previewNumber}>
//                           <Text style={styles.previewNumberText}>{index + 1}</Text>
//                         </View>
//                       </View>
//                     )}
//                     contentContainerStyle={styles.previewContainer}
//                     showsHorizontalScrollIndicator={false}
//                   />
//                 </View>

//                 <TouchableOpacity
//                   style={[styles.uploadButton, (isUploading || isReadOnly) && styles.uploadButtonDisabled]}
//                   onPress={onSubmit}
//                   disabled={isUploading || isReadOnly}
//                 >
//                   {isUploading ? (
//                     <ActivityIndicator size="small" color="white" />
//                   ) : (
//                     <>
//                       <Ionicons name="cloud-upload-outline" size={22} color="white" />
//                       <Text style={styles.uploadButtonText}>
//                         {isReadOnly
//                           ? tSafe('read_only_upload', 'Read Only')
//                           : tSafe('upload_photos', 'Upload {count} photo{plural}', {
//                               count: photos.length,
//                               plural: photos.length !== 1 ? 's' : '',
//                             })}
//                       </Text>
//                     </>
//                   )}
//                 </TouchableOpacity>
//               </>
//             )}

//             {photos.length === 0 && permission?.granted && !isSimulator && !isReadOnly && (
//               <Text style={styles.cameraInstructions}>
//                 {tSafe('camera_instructions', 'Tap the camera button to capture photos')}
//               </Text>
//             )}
//           </View>
//         </View>
//       </RNModal>

//       {cameraVisible ? null : (
//         <View style={{ flex: 1 }}>
//           {isLoading ? (
//             <View style={styles.loadingContainer}>
//               <CustomActivityIndicator size={40} />
//             </View>
//           ) : (
//             <>
//               {/* Room List – always rendered, but pointerEvents disabled when workspace is shown */}
//               <View style={{ flex: 1, pointerEvents: roomToShow ? 'none' : 'auto' }}>
//                 <View style={styles.header}>
//                   <Text style={styles.headline}>{tSafe('after_photos_tasks', 'After Photos & Tasks')}</Text>
//                   <Text style={styles.subtitle}>
//                     {tSafe('complete_rooms_order', 'Complete rooms in any order. Each room needs 3+ photos (except Extra Tasks) and all tasks checked.')}
//                   </Text>

//                   <View style={styles.minimalProgressRow}>
//                     <View style={styles.minimalProgressLeft}>
//                       <Text style={styles.minimalProgressTitle}>{tSafe('progress', 'Progress')}</Text>
//                       <View style={styles.minimalProgressBar}>
//                         <View
//                           style={[
//                             styles.minimalProgressFill,
//                             {
//                               width: `${(rooms.filter((r) => isRoomComplete(r)).length / Math.max(rooms.length, 1)) * 100}%`,
//                               backgroundColor: COLORS.primary,
//                             },
//                           ]}
//                         />
//                       </View>
//                     </View>

//                     <View style={styles.minimalProgressRight}>
//                       <Text style={styles.minimalProgressPercentage}>
//                         {Math.round((rooms.filter((r) => isRoomComplete(r)).length / Math.max(rooms.length, 1)) * 100)}%
//                       </Text>
//                       <Text style={styles.minimalProgressText}>
//                         {rooms.filter((r) => isRoomComplete(r)).length}/{rooms.length} {tSafe('rooms', 'rooms')}
//                       </Text>
//                     </View>
//                   </View>
//                 </View>

//                 <Text style={styles.sectionTitle}>{tSafe('all_rooms', 'All Rooms')}</Text>
//                 <ScrollView style={styles.roomsContainer}>
//                   {rooms.length > 0 ? (
//                     rooms.map((room) => <RoomCard key={room.id} room={room} />)
//                   ) : (
//                     <View style={styles.noRoomsContainer}>
//                       <Ionicons name="home-outline" size={48} color={COLORS.gray} />
//                       <Text style={styles.noRoomsText}>{tSafe('no_rooms_assigned', 'No rooms assigned')}</Text>
//                     </View>
//                   )}
//                 </ScrollView>

//                 <TouchableOpacity
//                   style={[styles.finishButton, (!allRoomsComplete || isReadOnly) && styles.disabledFinishButton]}
//                   onPress={submitCompletion}
//                   disabled={!allRoomsComplete || isReadOnly}
//                 >
//                   <Ionicons name="checkmark-done-circle" size={24} color="white" />
//                   <View style={styles.finishButtonTexts}>
//                     <Text style={styles.finishButtonMain}>
//                       {isReadOnly
//                         ? tSafe('read_only_submitted', 'Submitted – Read Only')
//                         : allRoomsComplete
//                         ? tSafe('finish_cleaning', 'Finish Cleaning')
//                         : tSafe('complete_all_rooms_first', 'Complete All Rooms First')}
//                     </Text>
//                     <Text style={styles.finishButtonSub}>
//                       {isReadOnly
//                         ? tSafe('read_only_message', 'This job has been submitted and is read only')
//                         : allRoomsComplete
//                         ? tSafe('all_rooms_complete', 'All rooms are complete!')
//                         : tSafe('rooms_remaining', '{count} room(s) remaining', {
//                             count: rooms.filter((r) => !isRoomComplete(r)).length,
//                           })}
//                     </Text>
//                   </View>
//                   <Ionicons name="chevron-forward" size={20} color="white" />
//                 </TouchableOpacity>
//               </View>

//               {/* Animated Workspace Overlay */}
//               {roomToShow && (
//                 <Animated.View
//                   style={[
//                     styles.workspaceContainer,
//                     {
//                       transform: [{ translateX: slideAnim }],
//                       opacity: fadeAnim,
//                     },
//                   ]}
//                 >
//                   <RoomWorkspace room={roomToShow} onBack={() => setSelectedRoom(null)} />
//                 </Animated.View>
//               )}
//             </>
//           )}
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };

// // ─── Styles ──────────────────────────────────────────────────────
// const styles = StyleSheet.create({
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
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: '#f0f0f0',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.04,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   selectedRoomCard: {
//     borderColor: COLORS.primary,
//     backgroundColor: '#f8fbff',
//     shadowOpacity: 0.08,
//   },
//   completedRoomCard: {
//     borderColor: '#d4edda',
//     backgroundColor: '#f8fff8',
//   },
//   roomCardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 14,
//   },
//   roomIconWrapper: {
//     position: 'relative',
//     marginRight: 12,
//   },
//   roomIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#f0f7ff',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   completedRoomIcon: {
//     backgroundColor: '#e8f5e8',
//   },
//   completeBadge: {
//     position: 'absolute',
//     top: -4,
//     right: -4,
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     backgroundColor: '#4CAF50',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: '#fff',
//   },
//   roomInfo: {
//     flex: 1,
//   },
//   roomName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginBottom: 4,
//   },
//   roomMeta: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   statusChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     gap: 4,
//   },
//   statusChipComplete: {
//     backgroundColor: '#e8f5e8',
//   },
//   statusChipInProgress: {
//     backgroundColor: '#fff3e0',
//   },
//   statusDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//   },
//   statusDotComplete: {
//     backgroundColor: '#4CAF50',
//   },
//   statusDotInProgress: {
//     backgroundColor: '#FF9800',
//   },
//   statusChipText: {
//     fontSize: 11,
//     fontWeight: '500',
//     color: '#555',
//   },
//   roomStats: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa',
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   statItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   statDivider: {
//     width: 1,
//     height: 16,
//     backgroundColor: '#e0e0e0',
//     marginHorizontal: 6,
//   },
//   statText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: '#555',
//   },
//   progressContainer: {
//     marginBottom: 14,
//   },
//   progressBar: {
//     height: 6,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 3,
//     overflow: 'hidden',
//     marginBottom: 6,
//   },
//   progressFill: {
//     height: '100%',
//     borderRadius: 3,
//   },
//   progressLabel: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   progressPercent: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#333',
//   },
//   progressText: {
//     fontSize: 12,
//     color: '#999',
//   },
//   roomActionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//     gap: 8,
//   },
//   startButton: {
//     backgroundColor: COLORS.primary,
//   },
//   reviewButton: {
//     backgroundColor: '#4CAF50',
//   },
//   roomActionButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
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
//   disabledButton: {
//     opacity: 0.5,
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
//   disabledText: {
//     color: '#999',
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
//   readOnlyTaskItem: {
//     opacity: 0.8,
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
//     bottom: 255,
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

//   // Bottom Section Styles
//   bottomSection: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: 'rgba(0,0,0,0.8)',
//     paddingTop: 16,
//     paddingBottom: Platform.OS === 'ios' ? 34 : 16,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   thumbnailSection: {
//     marginBottom: 16,
//   },
//   thumbnailTitle: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 16,
//     marginBottom: 8,
//   },
//   thumbnailWrapper: {
//     marginHorizontal: 4,
//     position: 'relative',
//   },
//   preview: {
//     width: 70,
//     height: 70,
//     borderRadius: 8,
//     backgroundColor: '#f0f0f0',
//   },
//   removeButton: {
//     position: 'absolute',
//     top: -6,
//     right: -6,
//     backgroundColor: 'rgba(0,0,0,0.8)',
//     borderRadius: 12,
//     padding: 2,
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
//     paddingHorizontal: 12,
//   },
//   uploadButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     paddingVertical: 16,
//     marginHorizontal: 16,
//     borderRadius: 12,
//     marginTop: 8,
//   },
//   uploadButtonDisabled: {
//     backgroundColor: COLORS.gray,
//   },
//   uploadButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 12,
//   },
//   libraryButtonBottom: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingVertical: 12,
//     marginHorizontal: 16,
//     borderRadius: 12,
//     marginBottom: 12,
//   },
//   libraryButtonBottomText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '500',
//     marginLeft: 8,
//   },
//   cameraInstructions: {
//     color: 'rgba(255,255,255,0.7)',
//     fontSize: 12,
//     textAlign: 'center',
//     marginTop: 8,
//     marginBottom: 4,
//   },

//   // Other Styles
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'black',
//   },
//   modalCloseButton: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 50 : 30,
//     right: 24,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     borderRadius: 20,
//     padding: 8,
//   },
//   fullSizeImage: {
//     width: '100%',
//     height: '100%',
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
//     marginTop: 16,
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
//   taskListContent: {
//     paddingVertical: 4,
//   },
//   // New style for animated workspace overlay
//   workspaceContainer: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: '#f8f9fa',
//     zIndex: 10,
//   },
// });

// export default AfterPhoto;



// AfterPhoto.js (full component with all styles and isReadOnly support)
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
// import { Checkbox } from 'react-native-paper';
// import ImageViewer from 'react-native-image-zoom-viewer';
// import RNModal from 'react-native-modal';
// import { sendPushNotifications } from '../../../utils/sendPushNotification';
// import ROUTES from '../../../constants/routes';
// import CircularProgress from 'react-native-circular-progress-indicator';
// import { Image } from 'expo-image';
// import CustomActivityIndicator from '../../../components/shared/CuustomActivityIndicator';
// import formatRoomTitle from '../../../utils/formatRoomTitle';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import * as ImagePicker from 'expo-image-picker';
// import { tSafe } from '../../../utils/tSafe';

// const { width, height } = Dimensions.get('window');

// // ─── ThumbnailItem ──────────────────────────────────────────────
// const ThumbnailItem = React.memo(({
//   photo,
//   index,
//   openImageViewer,
//   taskTitle,
//   invertPercentage,
//   getCleanlinessColor,
//   photosArray,
//   onDelete,
//   isReadOnly = false,
// }) => {
//   const photoScore = invertPercentage(photo.cleanliness?.individual_overall || 0);
//   const isProblemPhoto = photoScore < 35;
//   const fadeAnim = useRef(new Animated.Value(1)).current;

//   const handleDelete = () => {
//     if (isReadOnly) return;
//     Alert.alert(
//       tSafe('delete_photo_title', 'Delete Photo'),
//       tSafe('delete_photo_confirmation', 'Are you sure you want to permanently delete this photo?'),
//       [
//         { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
//         {
//           text: tSafe('delete', 'Delete'),
//           onPress: () => {
//             Animated.timing(fadeAnim, {
//               toValue: 0,
//               duration: 300,
//               useNativeDriver: true,
//             }).start(() => onDelete(index, taskTitle));
//           },
//         },
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
//         {!isReadOnly && (
//           <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
//             <Ionicons name="trash-outline" size={16} color="white" />
//           </TouchableOpacity>
//         )}
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

// // ─── Main Component ──────────────────────────────────────────────
// const AfterPhoto = ({ scheduleId, hostId, isReadOnly = false }) => {
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
//   const [selectedRoom, setSelectedRoom] = useState(null);
//   const [rooms, setRooms] = useState([]);

//   const [permission, requestPermission] = useCameraPermissions();
//   const [facing, setFacing] = useState('back');
//   const [isCameraReady, setIsCameraReady] = useState(false);
//   const [isSimulator, setIsSimulator] = useState(false);

//   useEffect(() => {
//     if (Platform.OS === 'ios' && Platform.isPad) {
//       setIsSimulator(true);
//     }
//   }, []);

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
//       },
//     })
//   ).current;

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

//   const invertPercentage = (score) => 100 - (score * 10);

//   const getCleanlinessLabel = (invertedScore) => {
//     if (invertedScore <= 35) return tSafe('needs_deep_cleaning', 'Needs Deep Cleaning');
//     if (invertedScore <= 40) return tSafe('requires_attention', 'Requires Attention');
//     return tSafe('very_clean', 'Very Clean');
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
//       const getCleanerById = (id) => res.assignedTo.find((cleaner) => cleaner.cleanerId === id);
//       const cl = getCleanerById(currentUserId);

//       if (cl?.checklist?.details) {
//         const details = cl.checklist.details;
//         setSelectedImages(details);

//         const roomArray = Object.keys(details).map((key) => {
//           const roomData = details[key];
//           const isExtraRoom = key === 'Extra';

//           return {
//             id: key,
//             name: isExtraRoom ? tSafe('extra_tasks', 'Extra Tasks') : formatRoomTitle(key),
//             type: isExtraRoom ? 'extra' : key.split('_')[0],
//             tasks: roomData.tasks || [],
//             photos: roomData.photos || [],
//             completed: isExtraRoom
//               ? (roomData.tasks || []).every((task) => task.value === true)
//               : (roomData.tasks || []).every((task) => task.value === true) &&
//                 (roomData.photos || []).length >= 3,
//             isExtra: isExtraRoom,
//           };
//         });

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
//           console.error('Error fetching data:', error);
//         }
//       };
//       if (isActive) fetchData();
//       return () => {
//         isActive = false;
//       };
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

//     const formattedImages = images.map((photo) => {
//       const score = invertPercentage(photo.cleanliness?.individual_overall || 0);
//       const status = getCleanlinessLabel(score);

//       return {
//         url: status === 'Very Clean' ? photo.img_url : photo.cleanliness?.heatmap_url || photo.img_url,
//         cleanliness: photo.cleanliness,
//         props: { source: { uri: status === 'Very Clean' ? photo.img_url : photo.cleanliness?.heatmap_url || photo.img_url } },
//         category: category,
//       };
//     });

//     setCurrentImages(formattedImages);
//     setCurrentImageIndex(index);
//     setBeforeModalVisible(true);
//   }, []);

//   const takePicture = async () => {
//     if (isReadOnly) {
//       Alert.alert(tSafe('read_only', 'Read Only'), tSafe('read_only_message', 'You cannot add photos after submitting.'));
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
//           skipProcessing: true,
//         });

//         const newPhoto = {
//           uri: photo.uri,
//           base64: photo.base64,
//           filename: `photo_${Date.now()}.jpg`,
//           file: `data:image/jpeg;base64,${photo.base64}`,
//         };

//         if (photos.length < MAX_IMAGES_UPLOAD) {
//           setPhotos((prev) => [...prev, newPhoto]);
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

//   const pickImageFromLibrary = async () => {
//     if (isReadOnly) {
//       Alert.alert(tSafe('read_only', 'Read Only'), tSafe('read_only_message', 'You cannot add photos after submitting.'));
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
//         selectionLimit: MAX_IMAGES_UPLOAD - photos.length,
//       });

//       if (!result.canceled) {
//         const newPhotos = result.assets.map((asset, index) => ({
//           uri: asset.uri,
//           base64: asset.base64,
//           filename: `photo_${Date.now()}_${index}.jpg`,
//           file: `data:image/jpeg;base64,${asset.base64}`,
//         }));

//         if (photos.length + newPhotos.length <= MAX_IMAGES_UPLOAD) {
//           setPhotos((prev) => [...prev, ...newPhotos]);
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

//   const flipCamera = () => {
//     setFacing((current) => (current === 'back' ? 'front' : 'back'));
//   };

//   const openCamera = (taskTitle) => {
//     if (isReadOnly) {
//       Alert.alert(tSafe('read_only', 'Read Only'), tSafe('read_only_message', 'You cannot add photos after submitting.'));
//       return;
//     }
//     setSelectedTaskTitle(taskTitle);
//     setPhotos([]);
//     setIsCameraReady(false);
//     setCameraVisible(true);
//   };

//   const validateTasks = () => {
//     if (!selectedImages || Object.keys(selectedImages).length === 0) {
//       Alert.alert(
//         tSafe('validation_error_title', 'Validation Error'),
//         tSafe('no_tasks_or_images', 'No tasks or images found for validation.')
//       );
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

//       if (!isExtraRoom && (!photos || photos.length < 3)) {
//         insufficientImagesCategories.push(category);
//       }
//     });

//     if (invalidCategories.length > 0 || insufficientImagesCategories.length > 0) {
//       let errorMessage = '';
//       if (invalidCategories.length > 0)
//         errorMessage += tSafe('incomplete_tasks', 'Incomplete tasks in: {categories}.\n', {
//           categories: invalidCategories.join(', '),
//         });
//       if (insufficientImagesCategories.length > 0)
//         errorMessage += tSafe('insufficient_images', 'Insufficient images in: {categories}.', {
//           categories: insufficientImagesCategories.join(', '),
//         });
//       Alert.alert(tSafe('validation_error_title', 'Validation Error'), errorMessage);
//       return false;
//     }

//     return true;
//   };

//   const onSubmit = async () => {
//     if (isReadOnly) {
//       Alert.alert(tSafe('read_only', 'Read Only'), tSafe('read_only_message', 'You cannot upload photos after submitting.'));
//       return;
//     }
//     if (photos.length === 0) {
//       Alert.alert(
//         tSafe('no_photos_title', 'No Photos'),
//         tSafe('take_photo_before_upload', 'Please take at least one photo before uploading.')
//       );
//       return;
//     }

//     if (photos.length > MAX_IMAGES_UPLOAD) {
//       Alert.alert(
//         tSafe('upload_limit_exceeded_title', 'Upload Limit Exceeded'),
//         tSafe('max_photos_allowed_upload', 'You can only upload up to {count} images at a time.', { count: MAX_IMAGES_UPLOAD })
//       );
//       return;
//     }

//     setIsUploading(true);

//     const imagesToUpload = photos.map((photo) => ({
//       filename: photo.filename,
//       file: photo.file,
//     }));

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
//         Alert.alert(
//           tSafe('upload_successful_title', 'Upload Successful'),
//           tSafe('photos_uploaded_count', '{count} photos have been uploaded successfully!', { count: photos.length })
//         );
//         fetchImages();
//         setPhotos([]);
//         setCameraVisible(false);
//       }
//     } catch (err) {
//       console.error('Error uploading photos:', err);
//       Alert.alert(
//         tSafe('upload_failed_title', 'Upload Failed'),
//         tSafe('upload_error_message', 'An error occurred while uploading your photos.')
//       );
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const updateTasksInBackend = async (category, updatedTasks) => {
//     if (isReadOnly) return;
//     try {
//       const data = { scheduleId, cleanerId: currentUserId, category, tasks: updatedTasks };
//       await userService.updateChecklist(data);
//     } catch (err) {
//       console.error('Error updating tasks:', err);
//     }
//   };

//   const handleTaskToggle = (category, taskId) => {
//     if (isReadOnly) return;
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
//     if (isReadOnly) return;
//     setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
//   };

//   const handleDeletePhoto = async (indexToDelete, category) => {
//     if (isReadOnly) return;
//     try {
//       const photoToDelete = selectedImages[category]?.photos[indexToDelete];
//       if (!photoToDelete) {
//         Alert.alert(tSafe('error_title', 'Error'), tSafe('photo_not_found', 'Photo not found'));
//         return;
//       }

//       const originalFilename = photoToDelete.img_url.split('/').pop();
//       const heatmapFilename = photoToDelete.cleanliness?.heatmap_url?.split('/').pop();

//       setSelectedImages((prev) => {
//         const updated = { ...prev };
//         updated[category].photos = updated[category].photos.filter((_, i) => i !== indexToDelete);
//         return updated;
//       });

//       const data = { originalFilename, heatmapFilename, category, scheduleId };
//       await userService.deleteSpaceAfterPhoto(data);
//       updateTasksInBackend(selectedImages);
//     } catch (error) {
//       console.error('Delete failed:', error);
//       setSelectedImages((prev) => ({ ...prev }));
//       Alert.alert(
//         tSafe('deletion_failed_title', 'Deletion Failed'),
//         error.response?.data?.detail || tSafe('could_not_delete_photo', 'Could not delete photo')
//       );
//     }
//   };

//   // ─── TaskItem (memo) ──────────────────────────────────────────────
//   const TaskItem = React.memo(({ task, roomId, onToggle }) => {
//     const handlePress = useCallback(() => {
//       if (isReadOnly) return;
//       onToggle(roomId, task.id);
//     }, [roomId, task.id, onToggle, isReadOnly]);

//     return (
//       <TouchableOpacity
//         style={[styles.taskItem, task.value && styles.taskItemCompleted, isReadOnly && styles.readOnlyTaskItem]}
//         onPress={handlePress}
//         activeOpacity={isReadOnly ? 1 : 0.7}
//         disabled={isReadOnly}
//       >
//         <View style={styles.taskItemLeft}>
//           <Checkbox.Android
//             status={task.value ? 'checked' : 'unchecked'}
//             onPress={() => {}}
//             color={COLORS.primary}
//             uncheckedColor="#000"
//             pointerEvents="none"
//           />
//           <View style={styles.taskTextContainer}>
//             <Text style={[styles.taskLabel, task.value && styles.taskLabelCompleted]}>{task.label}</Text>
//             {(task.time || task.price) && (
//               <View style={styles.taskMeta}>
//                 {task.time && (
//                   <View style={styles.taskMetaItem}>
//                     <Ionicons name="time-outline" size={12} color="#666" />
//                     <Text style={styles.taskMetaText}>
//                       {task.time} {tSafe('min', 'min')}
//                       {task.time > 1 ? 's' : ''}
//                     </Text>
//                   </View>
//                 )}
//                 {task.price && (
//                   <View style={styles.taskMetaItem}>
//                     <Ionicons name="cash-outline" size={12} color="#4CAF50" />
//                     <Text style={styles.taskMetaText}>${task.price}</Text>
//                   </View>
//                 )}
//               </View>
//             )}
//           </View>
//           {task.value ? (
//             <View style={styles.completedIndicator}>
//               <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
//             </View>
//           ) : (
//             <Ionicons name="ellipse-outline" size={20} color="#ddd" />
//           )}
//         </View>
//       </TouchableOpacity>
//     );
//   });

//   const submitCompletion = useCallback(async () => {
//     if (isReadOnly) {
//       Alert.alert(
//         tSafe('read_only', 'Read Only'),
//         tSafe('read_only_message', 'You cannot submit after this job has been completed.')
//       );
//       return;
//     }
//     if (!validateTasks()) return;
//     setIsLoading(true);
//     try {
//       await userService.finishCleaning({
//         scheduleId,
//         cleanerId: currentUserId,
//         completed_tasks: selectedImages,
//         fee: parseFloat(cleaning_fee),
//         completionTime: new Date(),
//       });
//       sendPushNotifications(
//         hostTokens,
//         tSafe('cleaner_completed_cleaning_title', '{name} Completed Cleaning', { name: currentUser.firstname }),
//         tSafe('cleaner_completed_cleaning_message', '{firstname} {lastname} has completed the cleaning.', {
//           firstname: currentUser.firstname,
//           lastname: currentUser.lastname,
//         }),
//         { screen: ROUTES.host_task_progress, params: { scheduleId } }
//       );
//       Alert.alert(tSafe('success_title', 'Success'), tSafe('cleaning_completed', 'Cleaning completed successfully!'));
//     } finally {
//       setIsLoading(false);
//     }
//   }, [selectedImages, hostTokens, scheduleId, currentUser, isReadOnly]);

//   const getRoomProgress = (room) => {
//     if (!selectedImages[room.id]) return 0;
//     const roomData = selectedImages[room.id];
//     const isExtraRoom = room.id === 'Extra';

//     const taskProgress =
//       roomData.tasks?.length > 0
//         ? (roomData.tasks.filter((t) => t.value).length / roomData.tasks.length) * (isExtraRoom ? 100 : 50)
//         : 0;

//     const photoProgress = isExtraRoom ? 0 : Math.min((roomData.photos?.length || 0 / 3) * 50, 50);

//     return taskProgress + photoProgress;
//   };

//   const isRoomComplete = (room) => {
//     if (!selectedImages[room.id]) return false;
//     const roomData = selectedImages[room.id];

//     const isExtraRoom = room.id === 'Extra';
//     const tasksComplete = roomData.tasks?.every((task) => task.value === true) || false;
//     const photosComplete = isExtraRoom ? true : (roomData.photos?.length || 0) >= 3;

//     return tasksComplete && photosComplete;
//   };

//   const allRoomsComplete = rooms.every((room) => isRoomComplete(room));

//   const markRoomComplete = (roomId) => {
//     if (isReadOnly) return;
//     Alert.alert(
//       tSafe('mark_room_complete_title', 'Mark Room Complete'),
//       tSafe('mark_room_complete_confirmation', 'Are you sure this room is fully cleaned and all photos are taken?'),
//       [
//         { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
//         {
//           text: tSafe('mark_complete', 'Mark Complete'),
//           onPress: () => {
//             setRooms((prev) =>
//               prev.map((room) => (room.id === roomId ? { ...room, completed: true } : room))
//             );
//             Alert.alert(tSafe('success_title', 'Success'), tSafe('room_marked_complete', 'Room marked as complete!'));
//           },
//         },
//       ]
//     );
//   };

//   const getRoomIcon = (type) => {
//     switch (type.toLowerCase()) {
//       case 'bedroom':
//         return 'bed';
//       case 'bathroom':
//         return 'shower';
//       case 'kitchen':
//         return 'silverware-fork-knife';
//       case 'livingroom':
//         return 'sofa';
//       case 'extra':
//         return 'plus-circle';
//       default:
//         return 'home';
//     }
//   };

//   const onCloseCamera = () => {
//     setCameraVisible(false);
//     setPhotos([]);
//   };

//   // ─── RoomCard ────────────────────────────────────────────────────
//   const RoomCard = ({ room }) => {
//     const progress = getRoomProgress(room);
//     const isComplete = isRoomComplete(room);
//     const roomData = selectedImages[room.id] || {};
//     const totalTasks = roomData.tasks?.length || 0;
//     const completedTasks = roomData.tasks?.filter((t) => t.value).length || 0;
//     const photoCount = roomData.photos?.length || 0;
//     const photoTarget = room.isExtra ? 0 : 3;

//     return (
//       <TouchableOpacity
//         style={[
//           styles.roomCard,
//           selectedRoom?.id === room.id && styles.selectedRoomCard,
//           isComplete && styles.completedRoomCard,
//         ]}
//         onPress={() => setSelectedRoom(room)}
//         activeOpacity={0.9}
//         disabled={isReadOnly && isComplete}
//       >
//         <View style={styles.roomCardHeader}>
//           <View style={styles.roomIconWrapper}>
//             <View style={[styles.roomIcon, isComplete && styles.completedRoomIcon]}>
//               <MaterialCommunityIcons
//                 name={getRoomIcon(room.type)}
//                 size={24}
//                 color={isComplete ? '#4CAF50' : COLORS.primary}
//               />
//             </View>
//             {isComplete && (
//               <View style={styles.completeBadge}>
//                 <MaterialCommunityIcons name="check" size={12} color="#fff" />
//               </View>
//             )}
//           </View>

//           <View style={styles.roomInfo}>
//             <Text style={styles.roomName}>{room.name}</Text>
//             <View style={styles.roomMeta}>
//               <View
//                 style={[
//                   styles.statusChip,
//                   isComplete ? styles.statusChipComplete : styles.statusChipInProgress,
//                 ]}
//               >
//                 <View
//                   style={[
//                     styles.statusDot,
//                     isComplete ? styles.statusDotComplete : styles.statusDotInProgress,
//                   ]}
//                 />
//                 <Text style={styles.statusChipText}>
//                   {isComplete ? tSafe('complete_status', 'Complete') : tSafe('in_progress_status', 'In Progress')}
//                 </Text>
//               </View>
//             </View>
//           </View>

//           <View style={styles.roomStats}>
//             <View style={styles.statItem}>
//               <MaterialCommunityIcons name="camera-outline" size={14} color="#888" />
//               <Text style={styles.statText}>
//                 {photoCount}/{photoTarget === 0 ? '∞' : photoTarget}
//               </Text>
//             </View>
//             <View style={styles.statDivider} />
//             <View style={styles.statItem}>
//               <MaterialCommunityIcons name="check-circle-outline" size={14} color="#888" />
//               <Text style={styles.statText}>
//                 {completedTasks}/{totalTasks}
//               </Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.progressContainer}>
//           <View style={styles.progressBar}>
//             <View
//               style={[
//                 styles.progressFill,
//                 {
//                   width: `${progress}%`,
//                   backgroundColor: isComplete ? '#4CAF50' : COLORS.primary,
//                 },
//               ]}
//             />
//           </View>
//           <View style={styles.progressLabel}>
//             <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
//             <Text style={styles.progressText}>{tSafe('complete_percent', 'complete')}</Text>
//           </View>
//         </View>

//         <TouchableOpacity
//           style={[styles.roomActionButton, isComplete ? styles.reviewButton : styles.startButton]}
//           onPress={() => setSelectedRoom(room)}
//           activeOpacity={0.8}
//           disabled={isReadOnly && isComplete}
//         >
//           <Text style={styles.roomActionButtonText}>
//             {isComplete ? tSafe('review', 'Review') : tSafe('continue', 'Continue')}
//           </Text>
//           <Ionicons name={isComplete ? 'chevron-forward' : 'arrow-forward'} size={18} color="white" />
//         </TouchableOpacity>
//       </TouchableOpacity>
//     );
//   };

//   // ─── RoomWorkspace ──────────────────────────────────────────────
// //   const RoomWorkspace = ({ room, onBack }) => {
// //     const roomData = selectedImages[room.id] || {};
// //     const isExtraRoom = room.id === 'Extra';

// //     const scrollRef = useRef(null);
// //     const scrollOffsetRef = useRef(0);

// //     useEffect(() => {
// //       if (scrollRef.current && scrollOffsetRef.current > 0) {
// //         requestAnimationFrame(() => {
// //           scrollRef.current?.scrollTo({ y: scrollOffsetRef.current, animated: false });
// //         });
// //       }
// //     }, [roomData.tasks]);

// //     return (
// //       <View style={styles.workspace}>
// //         <View style={styles.workspaceHeader}>
// //           <TouchableOpacity onPress={onBack} style={styles.backButton}>
// //             <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
// //           </TouchableOpacity>
// //           <View style={styles.roomTitleSection}>
// //             <Text style={styles.workspaceRoomTitle}>{room.name}</Text>
// //             <Text style={styles.workspaceRoomSubtitle}>
// //               {isRoomComplete(room) ? tSafe('completed', 'Completed') : tSafe('in_progress', 'In Progress')}
// //             </Text>
// //           </View>
// //           <CircularProgress
// //             value={getRoomProgress(room)}
// //             radius={24}
// //             duration={1000}
// //             progressValueColor={isRoomComplete(room) ? '#4CAF50' : COLORS.primary}
// //             activeStrokeColor={isRoomComplete(room) ? '#4CAF50' : COLORS.primary}
// //             activeStrokeWidth={4}
// //             inActiveStrokeWidth={4}
// //             inActiveStrokeColor="#e0e0e0"
// //             maxValue={100}
// //           />
// //         </View>

// //         <ScrollView
// //           ref={scrollRef}
// //           onScroll={(e) => {
// //             scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
// //           }}
// //           scrollEventThrottle={16}
// //           style={styles.workspaceContent}
// //           showsVerticalScrollIndicator={false}
// //           removeClippedSubviews={false}
// //         >
// //           {/* Photos Section */}
// //           <View style={styles.section}>
// //             <View style={styles.sectionHeader}>
// //               <Ionicons name="camera" size={22} color={COLORS.primary} />
// //               <Text style={styles.sectionTitle}>
// //                 {isExtraRoom
// //                   ? tSafe('additional_photos_optional', 'Additional Photos (Optional)')
// //                   : tSafe('after_photos', 'After Photos')}
// //               </Text>
// //               {!isExtraRoom && (
// //                 <View style={styles.badge}>
// //                   <Text style={styles.badgeText}>{roomData.photos?.length || 0}/3</Text>
// //                 </View>
// //               )}
// //             </View>

// //             <Text style={styles.sectionDescription}>
// //               {isExtraRoom
// //                 ? tSafe('extra_photos_description', 'Take photos of any additional cleaning tasks if needed')
// //                 : tSafe('after_photos_description', 'Take photos of the same areas as your before photos')}
// //             </Text>

// //             <View style={styles.photoGallery}>
// //               <FlatList
// //                 data={roomData.photos || []}
// //                 horizontal
// //                 keyExtractor={(item, index) => `${item.id}_${index}`}
// //                 renderItem={({ item, index }) => (
// //                   <ThumbnailItem
// //                     photo={item}
// //                     index={index}
// //                     taskTitle={room.id}
// //                     photosArray={roomData.photos || []}
// //                     onDelete={handleDeletePhoto}
// //                     openImageViewer={openImageViewer}
// //                     invertPercentage={invertPercentage}
// //                     getCleanlinessColor={getCleanlinessColor}
// //                     isReadOnly={isReadOnly}
// //                   />
// //                 )}
// //                 showsHorizontalScrollIndicator={false}
// //                 contentContainerStyle={styles.previewContainer}
// //                 ListEmptyComponent={
// //                   <View style={styles.emptyPhotos}>
// //                     <Ionicons name="camera-outline" size={40} color="#ddd" />
// //                     <Text style={styles.emptyPhotosText}>{tSafe('no_photos_yet', 'No photos yet')}</Text>
// //                     <Text style={styles.emptyPhotosSubtext}>
// //                       {isExtraRoom
// //                         ? tSafe('photos_optional_message', 'Photos are optional for extra tasks')
// //                         : tSafe('tap_to_add_photos', 'Tap the button below to add photos')}
// //                     </Text>
// //                   </View>
// //                 }
// //               />
// //             </View>

// //             <TouchableOpacity
// //               style={[styles.addPhotosButton, isReadOnly && styles.disabledButton]}
// //               onPress={() => openCamera(room.id)}
// //               disabled={isReadOnly}
// //             >
// //               <View style={styles.addButtonContent}>
// //                 <Ionicons name="add-circle" size={24} color={isReadOnly ? '#999' : 'white'} />
// //                 <View style={styles.addButtonTextContainer}>
// //                   <Text style={[styles.addButtonMainText, isReadOnly && styles.disabledText]}>
// //                     {isExtraRoom
// //                       ? tSafe('add_optional_photos', 'Add Optional Photos')
// //                       : roomData.photos?.length >= 3
// //                       ? tSafe('add_more_photos', 'Add More Photos')
// //                       : tSafe('take_photos', 'Take Photos')}
// //                   </Text>
// //                   <Text style={[styles.addButtonSubText, isReadOnly && styles.disabledText]}>
// //                     {isReadOnly
// //                       ? tSafe('read_only_photos', 'Read only – no changes allowed')
// //                       : isExtraRoom
// //                       ? tSafe('document_additional_work', 'Document any additional cleaning work')
// //                       : roomData.photos?.length >= 3
// //                       ? tSafe('can_add_more_photos', 'You can add more photos if needed')
// //                       : tSafe('photos_needed', '{count} more needed', { count: 3 - (roomData.photos?.length || 0) })}
// //                   </Text>
// //                 </View>
// //               </View>
// //             </TouchableOpacity>
// //           </View>

// //           {/* Tasks Section */}
// //           <View style={[styles.section, isExtraRoom && styles.extraSection]}>
// //             <View style={styles.sectionHeader}>
// //               <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
// //               <Text style={styles.sectionTitle}>
// //                 {isExtraRoom ? tSafe('additional_tasks', 'Additional Tasks') : tSafe('cleaning_tasks', 'Cleaning Tasks')}
// //               </Text>
// //               <View style={styles.badge}>
// //                 <Text style={styles.badgeText}>
// //                   {roomData.tasks?.filter((t) => t.value).length || 0}/{roomData.tasks?.length || 0}
// //                 </Text>
// //               </View>
// //             </View>

// //             <View style={styles.taskProgress}>
// //               <View style={styles.taskProgressBar}>
// //                 <View
// //                   style={[
// //                     styles.taskProgressFill,
// //                     {
// //                       width: `${
// //                         roomData.tasks?.length > 0
// //                           ? (roomData.tasks.filter((t) => t.value).length / roomData.tasks.length) * 100
// //                           : 0
// //                       }%`,
// //                     },
// //                   ]}
// //                 />
// //               </View>
// //               <Text style={styles.taskProgressText}>
// //                 {roomData.tasks?.filter((t) => t.value).length || 0} {tSafe('of', 'of')}{' '}
// //                 {roomData.tasks?.length || 0} {tSafe('tasks_completed', 'tasks completed')}
// //               </Text>
// //             </View>

// //             <View style={styles.taskList}>
// //               {roomData.tasks?.map((item) => (
// //                 <TaskItem key={item.id} task={item} roomId={room.id} onToggle={handleTaskToggle} />
// //               ))}

// //               {(!roomData.tasks || roomData.tasks.length === 0) && (
// //                 <View style={styles.noTasksContainer}>
// //                   <Ionicons name="list-outline" size={40} color="#ddd" />
// //                   <Text style={styles.noTasksText}>{tSafe('no_tasks_assigned', 'No tasks assigned')}</Text>
// //                 </View>
// //               )}
// //             </View>
// //           </View>

// //           {/* Completion Requirements */}
// //           <View style={styles.requirementsSection}>
// //             <Text style={styles.requirementsTitle}>
// //               {tSafe('to_complete', 'To complete this {type}:', {
// //                 type: isExtraRoom ? tSafe('section', 'section') : tSafe('room', 'room'),
// //               })}
// //             </Text>

// //             {!isExtraRoom && (
// //               <View style={styles.requirementItem}>
// //                 <Ionicons
// //                   name={roomData.photos?.length >= 3 ? 'checkmark-circle' : 'ellipse-outline'}
// //                   size={20}
// //                   color={roomData.photos?.length >= 3 ? '#4CAF50' : '#666'}
// //                 />
// //                 <Text
// //                   style={[
// //                     styles.requirementText,
// //                     roomData.photos?.length >= 3 && styles.requirementTextCompleted,
// //                   ]}
// //                 >
// //                   {tSafe('minimum_photos', 'Minimum 3 photos ({count}/{total})', {
// //                     count: roomData.photos?.length || 0,
// //                     total: 3,
// //                   })}
// //                 </Text>
// //               </View>
// //             )}

// //             <View style={styles.requirementItem}>
// //               <Ionicons
// //                 name={roomData.tasks?.every((t) => t.value) ? 'checkmark-circle' : 'ellipse-outline'}
// //                 size={20}
// //                 color={roomData.tasks?.every((t) => t.value) ? '#4CAF50' : '#666'}
// //               />
// //               <Text
// //                 style={[
// //                   styles.requirementText,
// //                   roomData.tasks?.every((t) => t.value) && styles.requirementTextCompleted,
// //                 ]}
// //               >
// //                 {tSafe('all_tasks_completed', 'All tasks completed ({count}/{total})', {
// //                   count: roomData.tasks?.filter((t) => t.value).length || 0,
// //                   total: roomData.tasks?.length || 0,
// //                 })}
// //               </Text>
// //             </View>
// //           </View>
// //         </ScrollView>

// //         {/* Completion Button */}
// //         <View style={styles.completionSection}>
// //           {isRoomComplete(room) ? (
// //             room.completed ? (
// //               <View style={styles.alreadyCompleted}>
// //                 <Ionicons name="checkmark-done-circle" size={24} color="#4CAF50" />
// //                 <Text style={styles.alreadyCompletedText}>
// //                   {room.name} {tSafe('already_completed', 'is already completed')}
// //                 </Text>
// //               </View>
// //             ) : (
// //               <TouchableOpacity
// //                 style={[styles.markCompleteButton, isReadOnly && styles.disabledButton]}
// //                 onPress={() => markRoomComplete(room.id)}
// //                 disabled={isReadOnly}
// //               >
// //                 <Ionicons name="checkmark-done" size={24} color="white" />
// //                 <View style={styles.markCompleteButtonTexts}>
// //                   <Text style={styles.markCompleteButtonMain}>
// //                     {tSafe('mark_room_complete', 'Mark {room} Complete', { room: room.name })}
// //                   </Text>
// //                   <Text style={styles.markCompleteButtonSub}>
// //                     {tSafe('all_requirements_met', 'All requirements are met ✓')}
// //                   </Text>
// //                 </View>
// //               </TouchableOpacity>
// //             )
// //           ) : (
// //             <View style={styles.incompleteRequirements}>
// //               <Ionicons name="alert-circle" size={24} color="#FF9800" />
// //               <View style={styles.incompleteRequirementsTexts}>
// //                 <Text style={styles.incompleteRequirementsMain}>
// //                   {tSafe('complete_requirements_to_finish', 'Complete requirements to finish')}
// //                 </Text>
// //                 <Text style={styles.incompleteRequirementsSub}>
// //                   {!isExtraRoom &&
// //                     roomData.photos?.length < 3 &&
// //                     tSafe('more_photos_needed', '{count} more photos, ', {
// //                       count: 3 - (roomData.photos?.length || 0),
// //                     })}
// //                   {roomData.tasks?.filter((t) => !t.value).length} {tSafe('more_tasks', 'more tasks')}
// //                 </Text>
// //               </View>
// //             </View>
// //           )}
// //         </View>
// //       </View>
// //     );
// //   };


// const RoomWorkspace = ({ room, onBack }) => {
//     const roomData = selectedImages[room.id] || {};
//     const isExtraRoom = room.id === 'Extra';
  
//     const scrollRef = useRef(null);
//     const scrollOffsetRef = useRef(0);
  
//     useEffect(() => {
//       if (scrollRef.current && scrollOffsetRef.current > 0) {
//         requestAnimationFrame(() => {
//           scrollRef.current?.scrollTo({ y: scrollOffsetRef.current, animated: false });
//         });
//       }
//     }, [roomData.tasks]);
  
//     return (
//       <View style={styles.workspace}>
//         <View style={styles.workspaceHeader}>
//           <TouchableOpacity onPress={onBack} style={styles.backButton}>
//             <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
//           </TouchableOpacity>
//           <View style={styles.roomTitleSection}>
//             <Text style={styles.workspaceRoomTitle}>{room.name}</Text>
//             <Text style={styles.workspaceRoomSubtitle}>
//               {isRoomComplete(room) ? tSafe('completed', 'Completed') : tSafe('in_progress', 'In Progress')}
//             </Text>
//           </View>
//           <CircularProgress
//             value={getRoomProgress(room)}
//             radius={24}
//             duration={1000}
//             progressValueColor={isRoomComplete(room) ? '#4CAF50' : COLORS.primary}
//             activeStrokeColor={isRoomComplete(room) ? '#4CAF50' : COLORS.primary}
//             activeStrokeWidth={4}
//             inActiveStrokeWidth={4}
//             inActiveStrokeColor="#e0e0e0"
//             maxValue={100}
//           />
//         </View>
  
//         <ScrollView
//           ref={scrollRef}
//           onScroll={(e) => {
//             scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
//           }}
//           scrollEventThrottle={16}
//           style={styles.workspaceContent}
//           showsVerticalScrollIndicator={false}
//           removeClippedSubviews={false}
//         >
//           {/* Photos Section */}
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Ionicons name="camera" size={22} color={COLORS.primary} />
//               <Text style={styles.sectionTitle}>
//                 {isExtraRoom
//                   ? tSafe('additional_photos_optional', 'Additional Photos (Optional)')
//                   : tSafe('after_photos', 'After Photos')}
//               </Text>
//               {!isExtraRoom && (
//                 <View style={styles.badge}>
//                   <Text style={styles.badgeText}>{roomData.photos?.length || 0}/3</Text>
//                 </View>
//               )}
//             </View>
  
//             <Text style={styles.sectionDescription}>
//               {isExtraRoom
//                 ? tSafe('extra_photos_description', 'Take photos of any additional cleaning tasks if needed')
//                 : tSafe('after_photos_description', 'Take photos of the same areas as your before photos')}
//             </Text>
  
//             <View style={styles.photoGallery}>
//               <FlatList
//                 data={roomData.photos || []}
//                 horizontal
//                 keyExtractor={(item, index) => (item.id ? item.id.toString() : `photo_${index}`)}
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
//                     isReadOnly={isReadOnly}
//                   />
//                 )}
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.previewContainer}
//                 ListEmptyComponent={
//                   <View style={styles.emptyPhotos}>
//                     <Ionicons name="camera-outline" size={40} color="#ddd" />
//                     <Text style={styles.emptyPhotosText}>{tSafe('no_photos_yet', 'No photos yet')}</Text>
//                     <Text style={styles.emptyPhotosSubtext}>
//                       {isExtraRoom
//                         ? tSafe('photos_optional_message', 'Photos are optional for extra tasks')
//                         : tSafe('tap_to_add_photos', 'Tap the button below to add photos')}
//                     </Text>
//                   </View>
//                 }
//               />
//             </View>
  
//             <TouchableOpacity
//               style={[styles.addPhotosButton, isReadOnly && styles.disabledButton]}
//               onPress={() => openCamera(room.id)}
//               disabled={isReadOnly}
//             >
//               <View style={styles.addButtonContent}>
//                 <Ionicons name="add-circle" size={24} color={isReadOnly ? '#999' : 'white'} />
//                 <View style={styles.addButtonTextContainer}>
//                   <Text style={[styles.addButtonMainText, isReadOnly && styles.disabledText]}>
//                     {isExtraRoom
//                       ? tSafe('add_optional_photos', 'Add Optional Photos')
//                       : roomData.photos?.length >= 3
//                       ? tSafe('add_more_photos', 'Add More Photos')
//                       : tSafe('take_photos', 'Take Photos')}
//                   </Text>
//                   <Text style={[styles.addButtonSubText, isReadOnly && styles.disabledText]}>
//                     {isReadOnly
//                       ? tSafe('read_only_photos', 'Read only – no changes allowed')
//                       : isExtraRoom
//                       ? tSafe('document_additional_work', 'Document any additional cleaning work')
//                       : roomData.photos?.length >= 3
//                       ? tSafe('can_add_more_photos', 'You can add more photos if needed')
//                       : tSafe('photos_needed', '{count} more needed', { count: 3 - (roomData.photos?.length || 0) })}
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
//                 {isExtraRoom ? tSafe('additional_tasks', 'Additional Tasks') : tSafe('cleaning_tasks', 'Cleaning Tasks')}
//               </Text>
//               <View style={styles.badge}>
//                 <Text style={styles.badgeText}>
//                   {roomData.tasks?.filter((t) => t.value).length || 0}/{roomData.tasks?.length || 0}
//                 </Text>
//               </View>
//             </View>
  
//             <View style={styles.taskProgress}>
//               <View style={styles.taskProgressBar}>
//                 <View
//                   style={[
//                     styles.taskProgressFill,
//                     {
//                       width: `${
//                         roomData.tasks?.length > 0
//                           ? (roomData.tasks.filter((t) => t.value).length / roomData.tasks.length) * 100
//                           : 0
//                       }%`,
//                     },
//                   ]}
//                 />
//               </View>
//               <Text style={styles.taskProgressText}>
//                 {roomData.tasks?.filter((t) => t.value).length || 0} {tSafe('of', 'of')}{' '}
//                 {roomData.tasks?.length || 0} {tSafe('tasks_completed', 'tasks completed')}
//               </Text>
//             </View>
  
//             <View style={styles.taskList}>
//               {roomData.tasks?.map((item, index) => (
//                 <TaskItem
//                   key={item.id || `task_${index}`}
//                   task={item}
//                   roomId={room.id}
//                   onToggle={handleTaskToggle}
//                 />
//               ))}
  
//               {(!roomData.tasks || roomData.tasks.length === 0) && (
//                 <View style={styles.noTasksContainer}>
//                   <Ionicons name="list-outline" size={40} color="#ddd" />
//                   <Text style={styles.noTasksText}>{tSafe('no_tasks_assigned', 'No tasks assigned')}</Text>
//                 </View>
//               )}
//             </View>
//           </View>
  
//           {/* Completion Requirements */}
//           <View style={styles.requirementsSection}>
//             <Text style={styles.requirementsTitle}>
//               {tSafe('to_complete', 'To complete this {type}:', {
//                 type: isExtraRoom ? tSafe('section', 'section') : tSafe('room', 'room'),
//               })}
//             </Text>
  
//             {!isExtraRoom && (
//               <View style={styles.requirementItem}>
//                 <Ionicons
//                   name={roomData.photos?.length >= 3 ? 'checkmark-circle' : 'ellipse-outline'}
//                   size={20}
//                   color={roomData.photos?.length >= 3 ? '#4CAF50' : '#666'}
//                 />
//                 <Text
//                   style={[
//                     styles.requirementText,
//                     roomData.photos?.length >= 3 && styles.requirementTextCompleted,
//                   ]}
//                 >
//                   {tSafe('minimum_photos', 'Minimum 3 photos ({count}/{total})', {
//                     count: roomData.photos?.length || 0,
//                     total: 3,
//                   })}
//                 </Text>
//               </View>
//             )}
  
//             <View style={styles.requirementItem}>
//               <Ionicons
//                 name={roomData.tasks?.every((t) => t.value) ? 'checkmark-circle' : 'ellipse-outline'}
//                 size={20}
//                 color={roomData.tasks?.every((t) => t.value) ? '#4CAF50' : '#666'}
//               />
//               <Text
//                 style={[
//                   styles.requirementText,
//                   roomData.tasks?.every((t) => t.value) && styles.requirementTextCompleted,
//                 ]}
//               >
//                 {tSafe('all_tasks_completed', 'All tasks completed ({count}/{total})', {
//                   count: roomData.tasks?.filter((t) => t.value).length || 0,
//                   total: roomData.tasks?.length || 0,
//                 })}
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
//                   {room.name} {tSafe('already_completed', 'is already completed')}
//                 </Text>
//               </View>
//             ) : (
//               <TouchableOpacity
//                 style={[styles.markCompleteButton, isReadOnly && styles.disabledButton]}
//                 onPress={() => markRoomComplete(room.id)}
//                 disabled={isReadOnly}
//               >
//                 <Ionicons name="checkmark-done" size={24} color="white" />
//                 <View style={styles.markCompleteButtonTexts}>
//                   <Text style={styles.markCompleteButtonMain}>
//                     {tSafe('mark_room_complete', 'Mark {room} Complete', { room: room.name })}
//                   </Text>
//                   <Text style={styles.markCompleteButtonSub}>
//                     {tSafe('all_requirements_met', 'All requirements are met ✓')}
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             )
//           ) : (
//             <View style={styles.incompleteRequirements}>
//               <Ionicons name="alert-circle" size={24} color="#FF9800" />
//               <View style={styles.incompleteRequirementsTexts}>
//                 <Text style={styles.incompleteRequirementsMain}>
//                   {tSafe('complete_requirements_to_finish', 'Complete requirements to finish')}
//                 </Text>
//                 <Text style={styles.incompleteRequirementsSub}>
//                   {!isExtraRoom &&
//                     roomData.photos?.length < 3 &&
//                     tSafe('more_photos_needed', '{count} more photos, ', {
//                       count: 3 - (roomData.photos?.length || 0),
//                     })}
//                   {roomData.tasks?.filter((t) => !t.value).length} {tSafe('more_tasks', 'more tasks')}
//                 </Text>
//               </View>
//             </View>
//           )}
//         </View>
//       </View>
//     );
//   };

//   // ─── Main render ──────────────────────────────────────────────────
//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Image Viewer Modal */}
//       <RNModal
//         isVisible={isBeforeModalVisible}
//         style={styles.fullScreenModal}
//         onBackdropPress={() => setBeforeModalVisible(false)}
//       >
//         <View style={styles.modalContainer}>
//           <ImageViewer
//             imageUrls={currentImages}
//             index={currentImageIndex}
//             backgroundColor="black"
//             enableSwipeDown
//             enableImageZoom
//             onSwipeDown={() => setBeforeModalVisible(false)}
//             renderImage={(props) => <Image source={props.source} style={styles.fullSizeImage} contentFit="contain" />}
//           />

//           {currentImages[currentImageIndex]?.cleanliness && (
//             <Animated.View style={[styles.analysisPanel, { transform: [{ translateY: pan.y }] }]} {...panResponder.panHandlers}>
//               <View style={styles.dragHandle} />
//               <View style={styles.analysisContent}>
//                 <Text style={styles.analysisTitle}>{tSafe('cleanliness_analysis', 'CLEANLINESS ANALYSIS')}</Text>

//                 <View style={styles.scoreSection}>
//                   <Text style={styles.sectionTitle}>{tSafe('this_photo', 'THIS PHOTO')}</Text>
//                   <View style={styles.scoreRow}>
//                     <View style={styles.scoreText}>
//                       <Text style={styles.scorePercentage}>
//                         {invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0).toFixed(
//                           0
//                         )}
//                         %
//                       </Text>
//                       <Text style={styles.scoreLabel}>
//                         {getCleanlinessLabel(
//                           invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0)
//                         )}
//                       </Text>
//                     </View>
//                     <CircularProgress
//                       value={invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0)}
//                       radius={35}
//                       activeStrokeColor={getCleanlinessColor(
//                         invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0)
//                       )}
//                       inActiveStrokeColor="#2d2d2d"
//                       maxValue={100}
//                     />
//                   </View>
//                 </View>

//                 <Text style={styles.sectionTitle}>{tSafe('main_issues', 'MAIN ISSUES')}</Text>
//                 <View style={styles.issuesList}>
//                   {Object.entries(currentImages[currentImageIndex].cleanliness.scores || {})
//                     .sort(([, a], [, b]) => b - a)
//                     .slice(0, 3)
//                     .map(([factor, score]) => (
//                       <View key={factor} style={styles.issueItem}>
//                         <Text style={styles.issueName}>{factor.replace(/_/g, ' ').toUpperCase()}</Text>
//                         <Text style={[styles.issueScore, { color: getCleanlinessColor(100 - score * 10) }]}>
//                           {(100 - score * 10).toFixed(0)}%
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
//       </RNModal>

//       {/* Camera Modal */}
//       <RNModal isVisible={cameraVisible} style={styles.fullScreenModal} onBackdropPress={() => setCameraVisible(false)}>
//         <View style={styles.cameraModalContainer}>
//           <View style={styles.cameraHeader}>
//             <TouchableOpacity style={styles.cameraCloseButton} onPress={onCloseCamera}>
//               <Ionicons name="chevron-down" size={28} color="white" />
//             </TouchableOpacity>

//             {!isSimulator && permission?.granted && (
//               <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
//                 <Ionicons name="camera-reverse" size={24} color="white" />
//               </TouchableOpacity>
//             )}
//           </View>

//           {isSimulator ? (
//             <View style={styles.simulatorContainer}>
//               <Ionicons name="images-outline" size={64} color="white" />
//               <Text style={styles.simulatorText}>{tSafe('camera_not_available_simulator', 'Camera not available in simulator')}</Text>
//               <Text style={styles.simulatorSubtext}>
//                 {tSafe('use_pick_from_library', 'Use "Pick from Library" button below to add photos')}
//               </Text>
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
//               <View style={styles.photoCounter}>
//                 <Ionicons name="images-outline" size={16} color="white" />
//                 <Text style={styles.photoCounterText}>
//                   {photos.length}/{MAX_IMAGES_UPLOAD}
//                 </Text>
//               </View>

//               <View style={styles.cameraControls}>
//                 <TouchableOpacity
//                   style={styles.captureButton}
//                   onPress={takePicture}
//                   disabled={photos.length >= MAX_IMAGES_UPLOAD}
//                 >
//                   <View style={styles.captureButtonInner}>
//                     <Ionicons name="camera" size={32} color="white" />
//                   </View>
//                 </TouchableOpacity>
//               </View>
//             </CameraView>
//           )}

//           <View style={styles.bottomSection}>
//             {photos.length === 0 && permission?.granted && !isSimulator && !isReadOnly && (
//               <TouchableOpacity style={styles.libraryButtonBottom} onPress={pickImageFromLibrary}>
//                 <Ionicons name="images" size={20} color="white" />
//                 <Text style={styles.libraryButtonBottomText}>{tSafe('pick_from_library', 'Pick from Library')}</Text>
//               </TouchableOpacity>
//             )}

//             {photos.length > 0 && (
//               <>
//                 <View style={styles.thumbnailSection}>
//                   <Text style={styles.thumbnailTitle}>{tSafe('selected_photos', 'Selected Photos')}</Text>
//                   <FlatList
//                     data={photos}
//                     horizontal
//                     keyExtractor={(item, index) => index.toString()}
//                     renderItem={({ item, index }) => (
//                       <View style={styles.thumbnailWrapper}>
//                         <Image source={{ uri: item.uri || item.file }} style={styles.preview} />
//                         {!isReadOnly && (
//                           <TouchableOpacity onPress={() => removePhoto(index)} style={styles.removeButton}>
//                             <Ionicons name="close-circle" size={20} color="white" />
//                           </TouchableOpacity>
//                         )}
//                         <View style={styles.previewNumber}>
//                           <Text style={styles.previewNumberText}>{index + 1}</Text>
//                         </View>
//                       </View>
//                     )}
//                     contentContainerStyle={styles.previewContainer}
//                     showsHorizontalScrollIndicator={false}
//                   />
//                 </View>

//                 <TouchableOpacity
//                   style={[styles.uploadButton, (isUploading || isReadOnly) && styles.uploadButtonDisabled]}
//                   onPress={onSubmit}
//                   disabled={isUploading || isReadOnly}
//                 >
//                   {isUploading ? (
//                     <ActivityIndicator size="small" color="white" />
//                   ) : (
//                     <>
//                       <Ionicons name="cloud-upload-outline" size={22} color="white" />
//                       <Text style={styles.uploadButtonText}>
//                         {isReadOnly
//                           ? tSafe('read_only_upload', 'Read Only')
//                           : tSafe('upload_photos', 'Upload {count} photo{plural}', {
//                               count: photos.length,
//                               plural: photos.length !== 1 ? 's' : '',
//                             })}
//                       </Text>
//                     </>
//                   )}
//                 </TouchableOpacity>
//               </>
//             )}

//             {photos.length === 0 && permission?.granted && !isSimulator && !isReadOnly && (
//               <Text style={styles.cameraInstructions}>
//                 {tSafe('camera_instructions', 'Tap the camera button to capture photos')}
//               </Text>
//             )}
//           </View>
//         </View>
//       </RNModal>

//       {cameraVisible ? null : (
//         <View style={{ flex: 1 }}>
//           {isLoading ? (
//             <View style={styles.loadingContainer}>
//               <CustomActivityIndicator size={40} />
//             </View>
//           ) : selectedRoom ? (
//             <RoomWorkspace room={selectedRoom} onBack={() => setSelectedRoom(null)} />
//           ) : (
//             <>
//               <View style={styles.header}>
//                 <Text style={styles.headline}>{tSafe('after_photos_tasks', 'After Photos & Tasks')}</Text>
//                 <Text style={styles.subtitle}>
//                   {tSafe('complete_rooms_order', 'Complete rooms in any order. Each room needs 3+ photos (except Extra Tasks) and all tasks checked.')}
//                 </Text>

//                 <View style={styles.minimalProgressRow}>
//                   <View style={styles.minimalProgressLeft}>
//                     <Text style={styles.minimalProgressTitle}>{tSafe('progress', 'Progress')}</Text>
//                     <View style={styles.minimalProgressBar}>
//                       <View
//                         style={[
//                           styles.minimalProgressFill,
//                           {
//                             width: `${(rooms.filter((r) => isRoomComplete(r)).length / Math.max(rooms.length, 1)) * 100}%`,
//                             backgroundColor: COLORS.primary,
//                           },
//                         ]}
//                       />
//                     </View>
//                   </View>

//                   <View style={styles.minimalProgressRight}>
//                     <Text style={styles.minimalProgressPercentage}>
//                       {Math.round((rooms.filter((r) => isRoomComplete(r)).length / Math.max(rooms.length, 1)) * 100)}%
//                     </Text>
//                     <Text style={styles.minimalProgressText}>
//                       {rooms.filter((r) => isRoomComplete(r)).length}/{rooms.length} {tSafe('rooms', 'rooms')}
//                     </Text>
//                   </View>
//                 </View>
//               </View>

//               <Text style={styles.sectionTitle}>{tSafe('all_rooms', 'All Rooms')}</Text>
//               <ScrollView style={styles.roomsContainer}>
//                 {rooms.length > 0 ? (
//                   rooms.map((room) => <RoomCard key={room.id} room={room} />)
//                 ) : (
//                   <View style={styles.noRoomsContainer}>
//                     <Ionicons name="home-outline" size={48} color={COLORS.gray} />
//                     <Text style={styles.noRoomsText}>{tSafe('no_rooms_assigned', 'No rooms assigned')}</Text>
//                   </View>
//                 )}
//               </ScrollView>

//               <TouchableOpacity
//                 style={[styles.finishButton, (!allRoomsComplete || isReadOnly) && styles.disabledFinishButton]}
//                 onPress={submitCompletion}
//                 disabled={!allRoomsComplete || isReadOnly}
//               >
//                 <Ionicons name="checkmark-done-circle" size={24} color="white" />
//                 <View style={styles.finishButtonTexts}>
//                   <Text style={styles.finishButtonMain}>
//                     {isReadOnly
//                       ? tSafe('read_only_submitted', 'Submitted – Read Only')
//                       : allRoomsComplete
//                       ? tSafe('finish_cleaning', 'Finish Cleaning')
//                       : tSafe('complete_all_rooms_first', 'Complete All Rooms First')}
//                   </Text>
//                   <Text style={styles.finishButtonSub}>
//                     {isReadOnly
//                       ? tSafe('read_only_message', 'This job has been submitted and is read only')
//                       : allRoomsComplete
//                       ? tSafe('all_rooms_complete', 'All rooms are complete!')
//                       : tSafe('rooms_remaining', '{count} room(s) remaining', {
//                           count: rooms.filter((r) => !isRoomComplete(r)).length,
//                         })}
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

// // ─── Styles ──────────────────────────────────────────────────────
// const styles = StyleSheet.create({
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
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: '#f0f0f0',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.04,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   selectedRoomCard: {
//     borderColor: COLORS.primary,
//     backgroundColor: '#f8fbff',
//     shadowOpacity: 0.08,
//   },
//   completedRoomCard: {
//     borderColor: '#d4edda',
//     backgroundColor: '#f8fff8',
//   },
//   roomCardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 14,
//   },
//   roomIconWrapper: {
//     position: 'relative',
//     marginRight: 12,
//   },
//   roomIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#f0f7ff',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   completedRoomIcon: {
//     backgroundColor: '#e8f5e8',
//   },
//   completeBadge: {
//     position: 'absolute',
//     top: -4,
//     right: -4,
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     backgroundColor: '#4CAF50',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: '#fff',
//   },
//   roomInfo: {
//     flex: 1,
//   },
//   roomName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginBottom: 4,
//   },
//   roomMeta: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   statusChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     gap: 4,
//   },
//   statusChipComplete: {
//     backgroundColor: '#e8f5e8',
//   },
//   statusChipInProgress: {
//     backgroundColor: '#fff3e0',
//   },
//   statusDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//   },
//   statusDotComplete: {
//     backgroundColor: '#4CAF50',
//   },
//   statusDotInProgress: {
//     backgroundColor: '#FF9800',
//   },
//   statusChipText: {
//     fontSize: 11,
//     fontWeight: '500',
//     color: '#555',
//   },
//   roomStats: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa',
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   statItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   statDivider: {
//     width: 1,
//     height: 16,
//     backgroundColor: '#e0e0e0',
//     marginHorizontal: 6,
//   },
//   statText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: '#555',
//   },
//   progressContainer: {
//     marginBottom: 14,
//   },
//   progressBar: {
//     height: 6,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 3,
//     overflow: 'hidden',
//     marginBottom: 6,
//   },
//   progressFill: {
//     height: '100%',
//     borderRadius: 3,
//   },
//   progressLabel: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   progressPercent: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#333',
//   },
//   progressText: {
//     fontSize: 12,
//     color: '#999',
//   },
//   roomActionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//     gap: 8,
//   },
//   startButton: {
//     backgroundColor: COLORS.primary,
//   },
//   reviewButton: {
//     backgroundColor: '#4CAF50',
//   },
//   roomActionButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
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
//   disabledButton: {
//     opacity: 0.5,
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
//   disabledText: {
//     color: '#999',
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
//   readOnlyTaskItem: {
//     opacity: 0.8,
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
//     bottom: 255,
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

//   // Bottom Section Styles
//   bottomSection: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: 'rgba(0,0,0,0.8)',
//     paddingTop: 16,
//     paddingBottom: Platform.OS === 'ios' ? 34 : 16,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   thumbnailSection: {
//     marginBottom: 16,
//   },
//   thumbnailTitle: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 16,
//     marginBottom: 8,
//   },
//   thumbnailWrapper: {
//     marginHorizontal: 4,
//     position: 'relative',
//   },
//   preview: {
//     width: 70,
//     height: 70,
//     borderRadius: 8,
//     backgroundColor: '#f0f0f0',
//   },
//   removeButton: {
//     position: 'absolute',
//     top: -6,
//     right: -6,
//     backgroundColor: 'rgba(0,0,0,0.8)',
//     borderRadius: 12,
//     padding: 2,
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
//     paddingHorizontal: 12,
//   },
//   uploadButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     paddingVertical: 16,
//     marginHorizontal: 16,
//     borderRadius: 12,
//     marginTop: 8,
//   },
//   uploadButtonDisabled: {
//     backgroundColor: COLORS.gray,
//   },
//   uploadButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 12,
//   },
//   libraryButtonBottom: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingVertical: 12,
//     marginHorizontal: 16,
//     borderRadius: 12,
//     marginBottom: 12,
//   },
//   libraryButtonBottomText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '500',
//     marginLeft: 8,
//   },
//   cameraInstructions: {
//     color: 'rgba(255,255,255,0.7)',
//     fontSize: 12,
//     textAlign: 'center',
//     marginTop: 8,
//     marginBottom: 4,
//   },

//   // Other Styles
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'black',
//   },
//   modalCloseButton: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 50 : 30,
//     right: 24,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     borderRadius: 20,
//     padding: 8,
//   },
//   fullSizeImage: {
//     width: '100%',
//     height: '100%',
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
//     marginTop: 16,
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
//   taskListContent: {
//     paddingVertical: 4,
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
import { Checkbox } from 'react-native-paper';
import ImageViewer from 'react-native-image-zoom-viewer';
import RNModal from 'react-native-modal';
import { sendPushNotifications } from '../../../utils/sendPushNotification';
import ROUTES from '../../../constants/routes';
import CircularProgress from 'react-native-circular-progress-indicator';
import { Image } from 'expo-image';
import CustomActivityIndicator from '../../../components/shared/CuustomActivityIndicator';
import formatRoomTitle from '../../../utils/formatRoomTitle';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { tSafe } from '../../../utils/tSafe';

const { width, height } = Dimensions.get('window');

// ─── ThumbnailItem ──────────────────────────────────────────────
const ThumbnailItem = React.memo(({
  photo,
  index,
  openImageViewer,
  taskTitle,
  invertPercentage,
  getCleanlinessColor,
  photosArray,
  onDelete,
  isReadOnly = false,
}) => {
  const photoScore = invertPercentage(photo.cleanliness?.individual_overall || 0);
  const isProblemPhoto = photoScore < 35;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleDelete = () => {
    if (isReadOnly) return;
    Alert.alert(
      tSafe('delete_photo_title', 'Delete Photo'),
      tSafe('delete_photo_confirmation', 'Are you sure you want to permanently delete this photo?'),
      [
        { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
        {
          text: tSafe('delete', 'Delete'),
          onPress: () => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => onDelete(index, taskTitle));
          },
        },
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
        {!isReadOnly && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={16} color="white" />
          </TouchableOpacity>
        )}
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

// ─── Main Component ──────────────────────────────────────────────
const AfterPhoto = ({ scheduleId, hostId, isReadOnly = false }) => {
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

  // Animation refs for room workspace slide transition
  const slideAnim = useRef(new Animated.Value(width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [roomToShow, setRoomToShow] = useState(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isSimulator, setIsSimulator] = useState(false);

  useEffect(() => {
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
      },
    })
  ).current;

  // ─── Animation effect for room transition ──────────────────────
  useEffect(() => {
    if (selectedRoom) {
      setRoomToShow(selectedRoom);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 12,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: width,
          useNativeDriver: true,
          tension: 80,
          friction: 12,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setRoomToShow(null);
      });
    }
  }, [selectedRoom]);

  useEffect(() => {
    (async () => {
      if (permission && !permission.granted) {
        await requestPermission();
      }
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaStatus !== 'granted') {
        console.log('Media library permission denied');
      }
    })();
  }, [permission, requestPermission]);

  const invertPercentage = (score) => 100 - (score * 10);

  const getCleanlinessLabel = (invertedScore) => {
    if (invertedScore <= 35) return tSafe('needs_deep_cleaning', 'Needs Deep Cleaning');
    if (invertedScore <= 40) return tSafe('requires_attention', 'Requires Attention');
    return tSafe('very_clean', 'Very Clean');
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
      const getCleanerById = (id) => res.assignedTo.find((cleaner) => cleaner.cleanerId === id);
      const cl = getCleanerById(currentUserId);

      if (cl?.checklist?.details) {
        const details = cl.checklist.details;
        setSelectedImages(details);

        const roomArray = Object.keys(details).map((key) => {
          const roomData = details[key];
          const isExtraRoom = key === 'Extra';

          return {
            id: key,
            name: isExtraRoom ? tSafe('extra_tasks', 'Extra Tasks') : formatRoomTitle(key),
            type: isExtraRoom ? 'extra' : key.split('_')[0],
            tasks: roomData.tasks || [],
            photos: roomData.photos || [],
            completed: isExtraRoom
              ? (roomData.tasks || []).every((task) => task.value === true)
              : (roomData.tasks || []).every((task) => task.value === true) &&
                (roomData.photos || []).length >= 3,
            isExtra: isExtraRoom,
          };
        });

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
          console.error('Error fetching data:', error);
        }
      };
      if (isActive) fetchData();
      return () => {
        isActive = false;
      };
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

    const formattedImages = images.map((photo) => {
      const score = invertPercentage(photo.cleanliness?.individual_overall || 0);
      const status = getCleanlinessLabel(score);

      return {
        url: status === 'Very Clean' ? photo.img_url : photo.cleanliness?.heatmap_url || photo.img_url,
        cleanliness: photo.cleanliness,
        props: { source: { uri: status === 'Very Clean' ? photo.img_url : photo.cleanliness?.heatmap_url || photo.img_url } },
        category: category,
      };
    });

    setCurrentImages(formattedImages);
    setCurrentImageIndex(index);
    setBeforeModalVisible(true);
  }, []);

  const takePicture = async () => {
    if (isReadOnly) {
      Alert.alert(tSafe('read_only', 'Read Only'), tSafe('read_only_message', 'You cannot add photos after submitting.'));
      return;
    }
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
          skipProcessing: true,
        });

        const newPhoto = {
          uri: photo.uri,
          base64: photo.base64,
          filename: `photo_${Date.now()}.jpg`,
          file: `data:image/jpeg;base64,${photo.base64}`,
        };

        if (photos.length < MAX_IMAGES_UPLOAD) {
          setPhotos((prev) => [...prev, newPhoto]);
        } else {
          Alert.alert(
            tSafe('limit_reached_title', 'Limit reached'),
            tSafe('max_photos_allowed', 'Maximum {count} photos allowed', { count: MAX_IMAGES_UPLOAD })
          );
        }
      } catch (error) {
        console.error('Camera error:', error);
        Alert.alert(
          tSafe('error_title', 'Error'),
          tSafe('failed_capture_image', 'Failed to capture image. Using photo library instead.')
        );
        await pickImageFromLibrary();
      }
    } else {
      await pickImageFromLibrary();
    }
  };

  const pickImageFromLibrary = async () => {
    if (isReadOnly) {
      Alert.alert(tSafe('read_only', 'Read Only'), tSafe('read_only_message', 'You cannot add photos after submitting.'));
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
        allowsMultipleSelection: true,
        selectionLimit: MAX_IMAGES_UPLOAD - photos.length,
      });

      if (!result.canceled) {
        const newPhotos = result.assets.map((asset, index) => ({
          uri: asset.uri,
          base64: asset.base64,
          filename: `photo_${Date.now()}_${index}.jpg`,
          file: `data:image/jpeg;base64,${asset.base64}`,
        }));

        if (photos.length + newPhotos.length <= MAX_IMAGES_UPLOAD) {
          setPhotos((prev) => [...prev, ...newPhotos]);
        } else {
          Alert.alert(
            tSafe('limit_reached_title', 'Limit reached'),
            tSafe('max_photos_allowed', 'Maximum {count} photos allowed', { count: MAX_IMAGES_UPLOAD })
          );
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe('failed_pick_image', 'Failed to pick image from library')
      );
    }
  };

  const flipCamera = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const openCamera = (taskTitle) => {
    if (isReadOnly) {
      Alert.alert(tSafe('read_only', 'Read Only'), tSafe('read_only_message', 'You cannot add photos after submitting.'));
      return;
    }
    setSelectedTaskTitle(taskTitle);
    setPhotos([]);
    setIsCameraReady(false);
    setCameraVisible(true);
  };

  const validateTasks = () => {
    if (!selectedImages || Object.keys(selectedImages).length === 0) {
      Alert.alert(
        tSafe('validation_error_title', 'Validation Error'),
        tSafe('no_tasks_or_images', 'No tasks or images found for validation.')
      );
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

      if (!isExtraRoom && (!photos || photos.length < 3)) {
        insufficientImagesCategories.push(category);
      }
    });

    if (invalidCategories.length > 0 || insufficientImagesCategories.length > 0) {
      let errorMessage = '';
      if (invalidCategories.length > 0)
        errorMessage += tSafe('incomplete_tasks', 'Incomplete tasks in: {categories}.\n', {
          categories: invalidCategories.join(', '),
        });
      if (insufficientImagesCategories.length > 0)
        errorMessage += tSafe('insufficient_images', 'Insufficient images in: {categories}.', {
          categories: insufficientImagesCategories.join(', '),
        });
      Alert.alert(tSafe('validation_error_title', 'Validation Error'), errorMessage);
      return false;
    }

    return true;
  };

  const onSubmit = async () => {
    if (isReadOnly) {
      Alert.alert(tSafe('read_only', 'Read Only'), tSafe('read_only_message', 'You cannot upload photos after submitting.'));
      return;
    }
    if (photos.length === 0) {
      Alert.alert(
        tSafe('no_photos_title', 'No Photos'),
        tSafe('take_photo_before_upload', 'Please take at least one photo before uploading.')
      );
      return;
    }

    if (photos.length > MAX_IMAGES_UPLOAD) {
      Alert.alert(
        tSafe('upload_limit_exceeded_title', 'Upload Limit Exceeded'),
        tSafe('max_photos_allowed_upload', 'You can only upload up to {count} images at a time.', { count: MAX_IMAGES_UPLOAD })
      );
      return;
    }

    setIsUploading(true);

    const imagesToUpload = photos.map((photo) => ({
      filename: photo.filename,
      file: photo.file,
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
        Alert.alert(
          tSafe('upload_successful_title', 'Upload Successful'),
          tSafe('photos_uploaded_count', '{count} photos have been uploaded successfully!', { count: photos.length })
        );
        fetchImages();
        setPhotos([]);
        setCameraVisible(false);
      }
    } catch (err) {
      console.error('Error uploading photos:', err);
      Alert.alert(
        tSafe('upload_failed_title', 'Upload Failed'),
        tSafe('upload_error_message', 'An error occurred while uploading your photos.')
      );
    } finally {
      setIsUploading(false);
    }
  };

  const updateTasksInBackend = async (category, updatedTasks) => {
    if (isReadOnly) return;
    try {
      const data = { scheduleId, cleanerId: currentUserId, category, tasks: updatedTasks };
      await userService.updateChecklist(data);
    } catch (err) {
      console.error('Error updating tasks:', err);
    }
  };

  const handleTaskToggle = (category, taskId) => {
    if (isReadOnly) return;
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
    if (isReadOnly) return;
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
  };

  const handleDeletePhoto = async (indexToDelete, category) => {
    if (isReadOnly) return;
    try {
      const photoToDelete = selectedImages[category]?.photos[indexToDelete];
      if (!photoToDelete) {
        Alert.alert(tSafe('error_title', 'Error'), tSafe('photo_not_found', 'Photo not found'));
        return;
      }

      const originalFilename = photoToDelete.img_url.split('/').pop();
      const heatmapFilename = photoToDelete.cleanliness?.heatmap_url?.split('/').pop();

      setSelectedImages((prev) => {
        const updated = { ...prev };
        updated[category].photos = updated[category].photos.filter((_, i) => i !== indexToDelete);
        return updated;
      });

      const data = { originalFilename, heatmapFilename, category, scheduleId };
      await userService.deleteSpaceAfterPhoto(data);
      updateTasksInBackend(selectedImages);
    } catch (error) {
      console.error('Delete failed:', error);
      setSelectedImages((prev) => ({ ...prev }));
      Alert.alert(
        tSafe('deletion_failed_title', 'Deletion Failed'),
        error.response?.data?.detail || tSafe('could_not_delete_photo', 'Could not delete photo')
      );
    }
  };

  // ─── TaskItem (memo) ──────────────────────────────────────────────
  const TaskItem = React.memo(({ task, roomId, onToggle }) => {
    const handlePress = useCallback(() => {
      if (isReadOnly) return;
      onToggle(roomId, task.id);
    }, [roomId, task.id, onToggle, isReadOnly]);

    return (
      <TouchableOpacity
        style={[styles.taskItem, task.value && styles.taskItemCompleted, isReadOnly && styles.readOnlyTaskItem]}
        onPress={handlePress}
        activeOpacity={isReadOnly ? 1 : 0.7}
        disabled={isReadOnly}
      >
        <View style={styles.taskItemLeft}>
          <Checkbox.Android
            status={task.value ? 'checked' : 'unchecked'}
            onPress={() => {}}
            color={COLORS.primary}
            uncheckedColor="#000"
            pointerEvents="none"
          />
          <View style={styles.taskTextContainer}>
            <Text style={[styles.taskLabel, task.value && styles.taskLabelCompleted]}>{task.label}</Text>
            {(task.time || task.price) && (
              <View style={styles.taskMeta}>
                {task.time && (
                  <View style={styles.taskMetaItem}>
                    <Ionicons name="time-outline" size={12} color="#666" />
                    <Text style={styles.taskMetaText}>
                      {task.time} {tSafe('min', 'min')}
                      {task.time > 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
                {task.price && (
                  <View style={styles.taskMetaItem}>
                    <Ionicons name="cash-outline" size={12} color="#4CAF50" />
                    <Text style={styles.taskMetaText}>${task.price}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          {task.value ? (
            <View style={styles.completedIndicator}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            </View>
          ) : (
            <Ionicons name="ellipse-outline" size={20} color="#ddd" />
          )}
        </View>
      </TouchableOpacity>
    );
  });

  const submitCompletion = useCallback(async () => {
    if (isReadOnly) {
      Alert.alert(
        tSafe('read_only', 'Read Only'),
        tSafe('read_only_message', 'You cannot submit after this job has been completed.')
      );
      return;
    }
    if (!validateTasks()) return;
    setIsLoading(true);
    try {
      await userService.finishCleaning({
        scheduleId,
        cleanerId: currentUserId,
        completed_tasks: selectedImages,
        fee: parseFloat(cleaning_fee),
        completionTime: new Date(),
      });
      sendPushNotifications(
        hostTokens,
        tSafe('cleaner_completed_cleaning_title', '{name} Completed Cleaning', { name: currentUser.firstname }),
        tSafe('cleaner_completed_cleaning_message', '{firstname} {lastname} has completed the cleaning.', {
          firstname: currentUser.firstname,
          lastname: currentUser.lastname,
        }),
        { screen: ROUTES.host_task_progress, params: { scheduleId } }
      );
      Alert.alert(tSafe('success_title', 'Success'), tSafe('cleaning_completed', 'Cleaning completed successfully!'));
    } finally {
      setIsLoading(false);
    }
  }, [selectedImages, hostTokens, scheduleId, currentUser, isReadOnly]);

  const getRoomProgress = (room) => {
    if (!selectedImages[room.id]) return 0;
    const roomData = selectedImages[room.id];
    const isExtraRoom = room.id === 'Extra';

    const taskProgress =
      roomData.tasks?.length > 0
        ? (roomData.tasks.filter((t) => t.value).length / roomData.tasks.length) * (isExtraRoom ? 100 : 50)
        : 0;

    const photoProgress = isExtraRoom ? 0 : Math.min((roomData.photos?.length || 0 / 3) * 50, 50);

    return taskProgress + photoProgress;
  };

  const isRoomComplete = (room) => {
    if (!selectedImages[room.id]) return false;
    const roomData = selectedImages[room.id];

    const isExtraRoom = room.id === 'Extra';
    const tasksComplete = roomData.tasks?.every((task) => task.value === true) || false;
    const photosComplete = isExtraRoom ? true : (roomData.photos?.length || 0) >= 3;

    return tasksComplete && photosComplete;
  };

  const allRoomsComplete = rooms.every((room) => isRoomComplete(room));

  const markRoomComplete = (roomId) => {
    if (isReadOnly) return;
    Alert.alert(
      tSafe('mark_room_complete_title', 'Mark Room Complete'),
      tSafe('mark_room_complete_confirmation', 'Are you sure this room is fully cleaned and all photos are taken?'),
      [
        { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
        {
          text: tSafe('mark_complete', 'Mark Complete'),
          onPress: () => {
            setRooms((prev) =>
              prev.map((room) => (room.id === roomId ? { ...room, completed: true } : room))
            );
            Alert.alert(tSafe('success_title', 'Success'), tSafe('room_marked_complete', 'Room marked as complete!'));
          },
        },
      ]
    );
  };

  const getRoomIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'bedroom':
        return 'bed';
      case 'bathroom':
        return 'shower';
      case 'kitchen':
        return 'silverware-fork-knife';
      case 'livingroom':
        return 'sofa';
      case 'extra':
        return 'plus-circle';
      default:
        return 'home';
    }
  };

  const onCloseCamera = () => {
    setCameraVisible(false);
    setPhotos([]);
  };

  // ─── RoomCard ────────────────────────────────────────────────────
  const RoomCard = ({ room }) => {
    const progress = getRoomProgress(room);
    const isComplete = isRoomComplete(room);
    const roomData = selectedImages[room.id] || {};
    const totalTasks = roomData.tasks?.length || 0;
    const completedTasks = roomData.tasks?.filter((t) => t.value).length || 0;
    const photoCount = roomData.photos?.length || 0;
    const photoTarget = room.isExtra ? 0 : 3;

    return (
      <TouchableOpacity
        style={[
          styles.roomCard,
          selectedRoom?.id === room.id && styles.selectedRoomCard,
          isComplete && styles.completedRoomCard,
        ]}
        onPress={() => setSelectedRoom(room)}
        activeOpacity={0.9}
        disabled={isReadOnly && isComplete}
      >
        <View style={styles.roomCardHeader}>
          <View style={styles.roomIconWrapper}>
            <View style={[styles.roomIcon, isComplete && styles.completedRoomIcon]}>
              <MaterialCommunityIcons
                name={getRoomIcon(room.type)}
                size={24}
                color={isComplete ? '#4CAF50' : COLORS.primary}
              />
            </View>
            {isComplete && (
              <View style={styles.completeBadge}>
                <MaterialCommunityIcons name="check" size={12} color="#fff" />
              </View>
            )}
          </View>

          <View style={styles.roomInfo}>
            <Text style={styles.roomName}>{room.name}</Text>
            <View style={styles.roomMeta}>
              <View
                style={[
                  styles.statusChip,
                  isComplete ? styles.statusChipComplete : styles.statusChipInProgress,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    isComplete ? styles.statusDotComplete : styles.statusDotInProgress,
                  ]}
                />
                <Text style={styles.statusChipText}>
                  {isComplete ? tSafe('complete_status', 'Complete') : tSafe('in_progress_status', 'In Progress')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.roomStats}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="camera-outline" size={14} color="#888" />
              <Text style={styles.statText}>
                {photoCount}/{photoTarget === 0 ? '∞' : photoTarget}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="check-circle-outline" size={14} color="#888" />
              <Text style={styles.statText}>
                {completedTasks}/{totalTasks}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: isComplete ? '#4CAF50' : COLORS.primary,
                },
              ]}
            />
          </View>
          <View style={styles.progressLabel}>
            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
            <Text style={styles.progressText}>{tSafe('complete_percent', 'complete')}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.roomActionButton, isComplete ? styles.reviewButton : styles.startButton]}
          onPress={() => setSelectedRoom(room)}
          activeOpacity={0.8}
          disabled={isReadOnly && isComplete}
        >
          <Text style={styles.roomActionButtonText}>
            {isComplete ? tSafe('review', 'Review') : tSafe('continue', 'Continue')}
          </Text>
          <Ionicons name={isComplete ? 'chevron-forward' : 'arrow-forward'} size={18} color="white" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // ─── RoomWorkspace ──────────────────────────────────────────────
  const RoomWorkspace = ({ room, onBack }) => {
    const roomData = selectedImages[room.id] || {};
    const isExtraRoom = room.id === 'Extra';

    const scrollRef = useRef(null);
    const scrollOffsetRef = useRef(0);

    useEffect(() => {
      if (scrollRef.current && scrollOffsetRef.current > 0) {
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({ y: scrollOffsetRef.current, animated: false });
        });
      }
    }, [roomData.tasks]);

    return (
      <View style={styles.workspace}>
        <View style={styles.workspaceHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.roomTitleSection}>
            <Text style={styles.workspaceRoomTitle}>{room.name}</Text>
            <Text style={styles.workspaceRoomSubtitle}>
              {isRoomComplete(room) ? tSafe('completed', 'Completed') : tSafe('in_progress', 'In Progress')}
            </Text>
          </View>
          <CircularProgress
            value={getRoomProgress(room)}
            radius={24}
            duration={1000}
            progressValueColor={isRoomComplete(room) ? '#4CAF50' : COLORS.primary}
            activeStrokeColor={isRoomComplete(room) ? '#4CAF50' : COLORS.primary}
            activeStrokeWidth={4}
            inActiveStrokeWidth={4}
            inActiveStrokeColor="#e0e0e0"
            maxValue={100}
          />
        </View>

        <ScrollView
          ref={scrollRef}
          onScroll={(e) => {
            scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          style={styles.workspaceContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
        >
          {/* Photos Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="camera" size={22} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>
                {isExtraRoom
                  ? tSafe('additional_photos_optional', 'Additional Photos (Optional)')
                  : tSafe('after_photos', 'After Photos')}
              </Text>
              {!isExtraRoom && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{roomData.photos?.length || 0}/3</Text>
                </View>
              )}
            </View>

            <Text style={styles.sectionDescription}>
              {isExtraRoom
                ? tSafe('extra_photos_description', 'Take photos of any additional cleaning tasks if needed')
                : tSafe('after_photos_description', 'Take photos of the same areas as your before photos')}
            </Text>

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
                    isReadOnly={isReadOnly}
                  />
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.previewContainer}
                ListEmptyComponent={
                  <View style={styles.emptyPhotos}>
                    <Ionicons name="camera-outline" size={40} color="#ddd" />
                    <Text style={styles.emptyPhotosText}>{tSafe('no_photos_yet', 'No photos yet')}</Text>
                    <Text style={styles.emptyPhotosSubtext}>
                      {isExtraRoom
                        ? tSafe('photos_optional_message', 'Photos are optional for extra tasks')
                        : tSafe('tap_to_add_photos', 'Tap the button below to add photos')}
                    </Text>
                  </View>
                }
              />
            </View>

            <TouchableOpacity
              style={[styles.addPhotosButton, isReadOnly && styles.disabledButton]}
              onPress={() => openCamera(room.id)}
              disabled={isReadOnly}
            >
              <View style={styles.addButtonContent}>
                <Ionicons name="add-circle" size={24} color={isReadOnly ? '#999' : 'white'} />
                <View style={styles.addButtonTextContainer}>
                  <Text style={[styles.addButtonMainText, isReadOnly && styles.disabledText]}>
                    {isExtraRoom
                      ? tSafe('add_optional_photos', 'Add Optional Photos')
                      : roomData.photos?.length >= 3
                      ? tSafe('add_more_photos', 'Add More Photos')
                      : tSafe('take_photos', 'Take Photos')}
                  </Text>
                  <Text style={[styles.addButtonSubText, isReadOnly && styles.disabledText]}>
                    {isReadOnly
                      ? tSafe('read_only_photos', 'Read only – no changes allowed')
                      : isExtraRoom
                      ? tSafe('document_additional_work', 'Document any additional cleaning work')
                      : roomData.photos?.length >= 3
                      ? tSafe('can_add_more_photos', 'You can add more photos if needed')
                      : tSafe('photos_needed', '{count} more needed', { count: 3 - (roomData.photos?.length || 0) })}
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
                {isExtraRoom ? tSafe('additional_tasks', 'Additional Tasks') : tSafe('cleaning_tasks', 'Cleaning Tasks')}
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {roomData.tasks?.filter((t) => t.value).length || 0}/{roomData.tasks?.length || 0}
                </Text>
              </View>
            </View>

            <View style={styles.taskProgress}>
              <View style={styles.taskProgressBar}>
                <View
                  style={[
                    styles.taskProgressFill,
                    {
                      width: `${
                        roomData.tasks?.length > 0
                          ? (roomData.tasks.filter((t) => t.value).length / roomData.tasks.length) * 100
                          : 0
                      }%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.taskProgressText}>
                {roomData.tasks?.filter((t) => t.value).length || 0} {tSafe('of', 'of')}{' '}
                {roomData.tasks?.length || 0} {tSafe('tasks_completed', 'tasks completed')}
              </Text>
            </View>

            <View style={styles.taskList}>
              {roomData.tasks?.map((item) => (
                <TaskItem key={item.id} task={item} roomId={room.id} onToggle={handleTaskToggle} />
              ))}

              {(!roomData.tasks || roomData.tasks.length === 0) && (
                <View style={styles.noTasksContainer}>
                  <Ionicons name="list-outline" size={40} color="#ddd" />
                  <Text style={styles.noTasksText}>{tSafe('no_tasks_assigned', 'No tasks assigned')}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Completion Requirements */}
          <View style={styles.requirementsSection}>
            <Text style={styles.requirementsTitle}>
              {tSafe('to_complete', 'To complete this {type}:', {
                type: isExtraRoom ? tSafe('section', 'section') : tSafe('room', 'room'),
              })}
            </Text>

            {!isExtraRoom && (
              <View style={styles.requirementItem}>
                <Ionicons
                  name={roomData.photos?.length >= 3 ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={roomData.photos?.length >= 3 ? '#4CAF50' : '#666'}
                />
                <Text
                  style={[
                    styles.requirementText,
                    roomData.photos?.length >= 3 && styles.requirementTextCompleted,
                  ]}
                >
                  {tSafe('minimum_photos', 'Minimum 3 photos ({count}/{total})', {
                    count: roomData.photos?.length || 0,
                    total: 3,
                  })}
                </Text>
              </View>
            )}

            <View style={styles.requirementItem}>
              <Ionicons
                name={roomData.tasks?.every((t) => t.value) ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={roomData.tasks?.every((t) => t.value) ? '#4CAF50' : '#666'}
              />
              <Text
                style={[
                  styles.requirementText,
                  roomData.tasks?.every((t) => t.value) && styles.requirementTextCompleted,
                ]}
              >
                {tSafe('all_tasks_completed', 'All tasks completed ({count}/{total})', {
                  count: roomData.tasks?.filter((t) => t.value).length || 0,
                  total: roomData.tasks?.length || 0,
                })}
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
                  {room.name} {tSafe('already_completed', 'is already completed')}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.markCompleteButton, isReadOnly && styles.disabledButton]}
                onPress={() => markRoomComplete(room.id)}
                disabled={isReadOnly}
              >
                <Ionicons name="checkmark-done" size={24} color="white" />
                <View style={styles.markCompleteButtonTexts}>
                  <Text style={styles.markCompleteButtonMain}>
                    {tSafe('mark_room_complete', 'Mark {room} Complete', { room: room.name })}
                  </Text>
                  <Text style={styles.markCompleteButtonSub}>
                    {tSafe('all_requirements_met', 'All requirements are met ✓')}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          ) : (
            <View style={styles.incompleteRequirements}>
              <Ionicons name="alert-circle" size={24} color="#FF9800" />
              <View style={styles.incompleteRequirementsTexts}>
                <Text style={styles.incompleteRequirementsMain}>
                  {tSafe('complete_requirements_to_finish', 'Complete requirements to finish')}
                </Text>
                <Text style={styles.incompleteRequirementsSub}>
                  {!isExtraRoom &&
                    roomData.photos?.length < 3 &&
                    tSafe('more_photos_needed', '{count} more photos, ', {
                      count: 3 - (roomData.photos?.length || 0),
                    })}
                  {roomData.tasks?.filter((t) => !t.value).length} {tSafe('more_tasks', 'more tasks')}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  // ─── Main render ──────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Image Viewer Modal */}
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
            renderImage={(props) => <Image source={props.source} style={styles.fullSizeImage} contentFit="contain" />}
          />

          {currentImages[currentImageIndex]?.cleanliness && (
            <Animated.View style={[styles.analysisPanel, { transform: [{ translateY: pan.y }] }]} {...panResponder.panHandlers}>
              <View style={styles.dragHandle} />
              <View style={styles.analysisContent}>
                <Text style={styles.analysisTitle}>{tSafe('cleanliness_analysis', 'CLEANLINESS ANALYSIS')}</Text>

                <View style={styles.scoreSection}>
                  <Text style={styles.sectionTitle}>{tSafe('this_photo', 'THIS PHOTO')}</Text>
                  <View style={styles.scoreRow}>
                    <View style={styles.scoreText}>
                      <Text style={styles.scorePercentage}>
                        {invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0).toFixed(
                          0
                        )}
                        %
                      </Text>
                      <Text style={styles.scoreLabel}>
                        {getCleanlinessLabel(
                          invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0)
                        )}
                      </Text>
                    </View>
                    <CircularProgress
                      value={invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0)}
                      radius={35}
                      activeStrokeColor={getCleanlinessColor(
                        invertPercentage(currentImages[currentImageIndex].cleanliness.individual_overall || 0)
                      )}
                      inActiveStrokeColor="#2d2d2d"
                      maxValue={100}
                    />
                  </View>
                </View>

                <Text style={styles.sectionTitle}>{tSafe('main_issues', 'MAIN ISSUES')}</Text>
                <View style={styles.issuesList}>
                  {Object.entries(currentImages[currentImageIndex].cleanliness.scores || {})
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([factor, score]) => (
                      <View key={factor} style={styles.issueItem}>
                        <Text style={styles.issueName}>{factor.replace(/_/g, ' ').toUpperCase()}</Text>
                        <Text style={[styles.issueScore, { color: getCleanlinessColor(100 - score * 10) }]}>
                          {(100 - score * 10).toFixed(0)}%
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

      {/* Camera Modal */}
      <RNModal isVisible={cameraVisible} style={styles.fullScreenModal} onBackdropPress={() => setCameraVisible(false)}>
        <View style={styles.cameraModalContainer}>
          <View style={styles.cameraHeader}>
            <TouchableOpacity style={styles.cameraCloseButton} onPress={onCloseCamera}>
              <Ionicons name="chevron-down" size={28} color="white" />
            </TouchableOpacity>

            {!isSimulator && permission?.granted && (
              <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
                <Ionicons name="camera-reverse" size={24} color="white" />
              </TouchableOpacity>
            )}
          </View>

          {isSimulator ? (
            <View style={styles.simulatorContainer}>
              <Ionicons name="images-outline" size={64} color="white" />
              <Text style={styles.simulatorText}>{tSafe('camera_not_available_simulator', 'Camera not available in simulator')}</Text>
              <Text style={styles.simulatorSubtext}>
                {tSafe('use_pick_from_library', 'Use "Pick from Library" button below to add photos')}
              </Text>
            </View>
          ) : !permission ? (
            <View style={styles.permissionContainer}>
              <ActivityIndicator size="large" color="white" />
              <Text style={styles.permissionText}>{tSafe('requesting_camera_permission', 'Requesting camera permission...')}</Text>
            </View>
          ) : !permission.granted ? (
            <View style={styles.permissionContainer}>
              <Ionicons name="camera-off" size={48} color="white" />
              <Text style={styles.permissionText}>{tSafe('no_access_camera', 'No access to camera')}</Text>
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={() => {
                  setCameraVisible(false);
                  Alert.alert(
                    tSafe('permission_required_title', 'Permission Required'),
                    tSafe('enable_camera_permissions', 'Please enable camera permissions in your device settings.'),
                    [{ text: tSafe('ok', 'OK') }]
                  );
                }}
              >
                <Text style={styles.permissionButtonText}>{tSafe('ok', 'OK')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <CameraView
              style={styles.camera}
              facing={facing}
              ref={cameraRef}
              onCameraReady={() => setIsCameraReady(true)}
            >
              <View style={styles.photoCounter}>
                <Ionicons name="images-outline" size={16} color="white" />
                <Text style={styles.photoCounterText}>
                  {photos.length}/{MAX_IMAGES_UPLOAD}
                </Text>
              </View>

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

          <View style={styles.bottomSection}>
            {photos.length === 0 && permission?.granted && !isSimulator && !isReadOnly && (
              <TouchableOpacity style={styles.libraryButtonBottom} onPress={pickImageFromLibrary}>
                <Ionicons name="images" size={20} color="white" />
                <Text style={styles.libraryButtonBottomText}>{tSafe('pick_from_library', 'Pick from Library')}</Text>
              </TouchableOpacity>
            )}

            {photos.length > 0 && (
              <>
                <View style={styles.thumbnailSection}>
                  <Text style={styles.thumbnailTitle}>{tSafe('selected_photos', 'Selected Photos')}</Text>
                  <FlatList
                    data={photos}
                    horizontal
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                      <View style={styles.thumbnailWrapper}>
                        <Image source={{ uri: item.uri || item.file }} style={styles.preview} />
                        {!isReadOnly && (
                          <TouchableOpacity onPress={() => removePhoto(index)} style={styles.removeButton}>
                            <Ionicons name="close-circle" size={20} color="white" />
                          </TouchableOpacity>
                        )}
                        <View style={styles.previewNumber}>
                          <Text style={styles.previewNumberText}>{index + 1}</Text>
                        </View>
                      </View>
                    )}
                    contentContainerStyle={styles.previewContainer}
                    showsHorizontalScrollIndicator={false}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.uploadButton, (isUploading || isReadOnly) && styles.uploadButtonDisabled]}
                  onPress={onSubmit}
                  disabled={isUploading || isReadOnly}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={22} color="white" />
                      <Text style={styles.uploadButtonText}>
                        {isReadOnly
                          ? tSafe('read_only_upload', 'Read Only')
                          : tSafe('upload_photos', 'Upload {count} photo{plural}', {
                              count: photos.length,
                              plural: photos.length !== 1 ? 's' : '',
                            })}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {photos.length === 0 && permission?.granted && !isSimulator && !isReadOnly && (
              <Text style={styles.cameraInstructions}>
                {tSafe('camera_instructions', 'Tap the camera button to capture photos')}
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
          ) : (
            <>
              {/* Room List – always rendered, but pointerEvents disabled when workspace is shown */}
              <View style={{ flex: 1, pointerEvents: roomToShow ? 'none' : 'auto' }}>
                <View style={styles.header}>
                  <Text style={styles.headline}>{tSafe('after_photos_tasks', 'After Photos & Tasks')}</Text>
                  <Text style={styles.subtitle}>
                    {tSafe('complete_rooms_order', 'Complete rooms in any order. Each room needs 3+ photos (except Extra Tasks) and all tasks checked.')}
                  </Text>

                  <View style={styles.minimalProgressRow}>
                    <View style={styles.minimalProgressLeft}>
                      <Text style={styles.minimalProgressTitle}>{tSafe('progress', 'Progress')}</Text>
                      <View style={styles.minimalProgressBar}>
                        <View
                          style={[
                            styles.minimalProgressFill,
                            {
                              width: `${(rooms.filter((r) => isRoomComplete(r)).length / Math.max(rooms.length, 1)) * 100}%`,
                              backgroundColor: COLORS.primary,
                            },
                          ]}
                        />
                      </View>
                    </View>

                    <View style={styles.minimalProgressRight}>
                      <Text style={styles.minimalProgressPercentage}>
                        {Math.round((rooms.filter((r) => isRoomComplete(r)).length / Math.max(rooms.length, 1)) * 100)}%
                      </Text>
                      <Text style={styles.minimalProgressText}>
                        {rooms.filter((r) => isRoomComplete(r)).length}/{rooms.length} {tSafe('rooms', 'rooms')}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>{tSafe('all_rooms', 'All Rooms')}</Text>
                <ScrollView style={styles.roomsContainer}>
                  {rooms.length > 0 ? (
                    rooms.map((room) => <RoomCard key={room.id} room={room} />)
                  ) : (
                    <View style={styles.noRoomsContainer}>
                      <Ionicons name="home-outline" size={48} color={COLORS.gray} />
                      <Text style={styles.noRoomsText}>{tSafe('no_rooms_assigned', 'No rooms assigned')}</Text>
                    </View>
                  )}
                </ScrollView>

                <TouchableOpacity
                  style={[styles.finishButton, (!allRoomsComplete || isReadOnly) && styles.disabledFinishButton]}
                  onPress={submitCompletion}
                  disabled={!allRoomsComplete || isReadOnly}
                >
                  <Ionicons name="checkmark-done-circle" size={24} color="white" />
                  <View style={styles.finishButtonTexts}>
                    <Text style={styles.finishButtonMain}>
                      {isReadOnly
                        ? tSafe('read_only_submitted', 'Submitted – Read Only')
                        : allRoomsComplete
                        ? tSafe('finish_cleaning', 'Finish Cleaning')
                        : tSafe('complete_all_rooms_first', 'Complete All Rooms First')}
                    </Text>
                    <Text style={styles.finishButtonSub}>
                      {isReadOnly
                        ? tSafe('read_only_message', 'This job has been submitted and is read only')
                        : allRoomsComplete
                        ? tSafe('all_rooms_complete', 'All rooms are complete!')
                        : tSafe('rooms_remaining', '{count} room(s) remaining', {
                            count: rooms.filter((r) => !isRoomComplete(r)).length,
                          })}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="white" />
                </TouchableOpacity>
              </View>

              {/* Animated Workspace Overlay */}
              {roomToShow && (
                <Animated.View
                  style={[
                    styles.workspaceContainer,
                    {
                      transform: [{ translateX: slideAnim }],
                      opacity: fadeAnim,
                    },
                  ]}
                >
                  <RoomWorkspace room={roomToShow} onBack={() => setSelectedRoom(null)} />
                </Animated.View>
              )}
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedRoomCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#f8fbff',
    shadowOpacity: 0.08,
  },
  completedRoomCard: {
    borderColor: '#d4edda',
    backgroundColor: '#f8fff8',
  },
  roomCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  roomIconWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  roomIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedRoomIcon: {
    backgroundColor: '#e8f5e8',
  },
  completeBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  roomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusChipComplete: {
    backgroundColor: '#e8f5e8',
  },
  statusChipInProgress: {
    backgroundColor: '#fff3e0',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotComplete: {
    backgroundColor: '#4CAF50',
  },
  statusDotInProgress: {
    backgroundColor: '#FF9800',
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#555',
  },
  roomStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 6,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555',
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  progressText: {
    fontSize: 12,
    color: '#999',
  },
  roomActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  startButton: {
    backgroundColor: COLORS.primary,
  },
  reviewButton: {
    backgroundColor: '#4CAF50',
  },
  roomActionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  disabledButton: {
    opacity: 0.5,
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
  disabledText: {
    color: '#999',
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
  readOnlyTaskItem: {
    opacity: 0.8,
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
    bottom: 255,
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

  // Bottom Section Styles
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
    marginTop: 16,
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
  taskListContent: {
    paddingVertical: 4,
  },
  // New style for animated workspace overlay
  workspaceContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f8f9fa',
    zIndex: 10,
  },
});

export default AfterPhoto;