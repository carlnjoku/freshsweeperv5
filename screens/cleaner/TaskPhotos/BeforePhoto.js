import React, { useEffect, useContext, useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  FlatList,
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ImageViewer from 'react-native-image-zoom-viewer';
import COLORS from '../../../constants/colors';
import userService from '../../../services/connection/userService';
import { AuthContext } from '../../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import CardNoPrimary from '../../../components/shared/CardNoPrimary';
import CustomActivityIndicator from '../../../components/shared/CuustomActivityIndicator';
import { Image } from 'expo-image';
import RNModal from 'react-native-modal';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { tSafe } from '../../../utils/tSafe'; // added import

const formatRoomTitle = (title) => {
  if (!title) return title;
  const parts = title.split('_');
  if (parts.length === 2) {
    const roomType = parts[0];
    const roomNumber = parseInt(parts[1]) + 1;
    const formattedRoomType = roomType.charAt(0).toUpperCase() + roomType.slice(1);
    return `${formattedRoomType} #${roomNumber}`;
  }
  return title;
};

const { width, height } = Dimensions.get('window');

const BeforePhoto = ({ scheduleId, tasksList, isReadOnly, onPhotosUpdated }) => {
  const cameraRef = useRef(null);
  const { currentUserId } = useContext(AuthContext);

  const MAX_IMAGES_UPLOAD = 5;
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState({});
  const [selectedTaskTitle, setSelectedTaskTitle] = useState('');
  const [photos, setPhotos] = useState([]);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isBeforeModalVisible, setBeforeModalVisible] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Camera states
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isSimulator, setIsSimulator] = useState(false);

  
  
  // Check if running on simulator
  useEffect(() => {
    if (Platform.OS === 'ios' && Platform.isPad) {
      setIsSimulator(true);
    }
  }, []);

  // Request camera and media library permissions
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

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await userService.getUpdatedImageUrls(scheduleId);
      const res = response.data.data;
      const getCleanerById = (id) => res.assignedTo.find(cleaner => cleaner.cleanerId === id);
      const beforeImg = getCleanerById(currentUserId);
      setSelectedImages(beforeImg.before_photos || {});
      setTasks(beforeImg.before_photos || {});
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setIsLoading(false);
    }
  }, [scheduleId, currentUserId]);

  const hasFetchedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchData = async () => {
        try {
          if (isActive && !hasFetchedRef.current) {
            await fetchImages();
            hasFetchedRef.current = true;
          }
        } catch (error) {
          if (isActive) console.error("Error fetching data:", error);
        }
      };
      fetchData();
      return () => { isActive = false; };
    }, [fetchImages])
  );

  // Take picture with camera
  const takePicture = async () => {
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

  // Flip camera
  const flipCamera = () => {
    setFacing(current => current === 'back' ? 'front' : 'back');
  };

  const openCamera = (taskTitle) => {
    setSelectedTaskTitle(taskTitle);
    setPhotos([]);
    setIsCameraReady(false);
    setCameraVisible(true);
  };

  const onSubmit = async () => {
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
    setLoading(true);
    const data = {
      photo_type: 'before_photos',
      scheduleId,
      images: photos.map(photo => ({
        filename: photo.filename,
        file: photo.file
      })),
      currentUserId,
      task_title: selectedTaskTitle,
      updated_tasks: selectedImages,
    };

    try {
      const response = await userService.uploadBeforeTaskPhotos(data);
      console.log('Upload response:', response.data);
      await fetchImages();
      if (onPhotosUpdated) onPhotosUpdated();
      Alert.alert(tSafe('success_title', 'Success'), tSafe('photos_uploaded', 'Photos uploaded successfully!'));
      setCameraVisible(false);
      setPhotos([]);
    } catch (err) {
      console.error('Error uploading photos:', err);
      Alert.alert(
        tSafe('upload_error_title', 'Upload Error'),
        err.response?.data?.message || tSafe('failed_upload_photos', 'Failed to upload photos. Please try again.')
      );
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  const removePhoto = (index) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
  };

  const submitCompletion = async () => {
    const jobCompletionData = {
      scheduleId,
      completed_tasks: selectedImages,
      completionTime: new Date(),
    };

    if (Object.keys(selectedImages).length === 0) {
      Alert.alert(tSafe('error_title', 'Error'), tSafe('complete_tasks_before_finish', 'Please complete all tasks before finishing.'));
      return;
    }

    setIsLoading(true);
    try {
      await userService.finishCleaning(jobCompletionData);
      await fetchImages();
      Alert.alert(tSafe('success_title', 'Success'), tSafe('cleaning_documentation_complete', 'Cleaning documentation completed successfully!'));
    } catch (err) {
      console.error('Error submitting completion:', err);
      Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_submit_completion', 'Failed to submit completion. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const onCloseCamera = () => {
    setCameraVisible(false);
    setPhotos([]);
  };

  const renderTask = ({ item }, taskTitle) => (
    <TouchableOpacity
      style={styles.taskContainer}
      onPress={() => console.log(`Task selected: ${item}`)}
    >
      <Text>{item}</Text>
    </TouchableOpacity>
  );

  const deleteImage = async (scheduleId, taskTitle, imageUrl) => {
    try {
      Alert.alert(
        tSafe('delete_image_title', 'Delete Image'),
        tSafe('delete_image_confirmation', 'Are you sure you want to delete this image?'),
        [
          { text: tSafe('cancel', 'Cancel'), style: 'cancel' },
          {
            text: tSafe('delete', 'Delete'),
            onPress: async () => {
              try {
                const encodedUrl = encodeURIComponent(imageUrl);
                const response = await userService.deleteBeforePhoto(scheduleId, taskTitle, encodedUrl);
                if (response.status !== 200 || response.data.status !== "success") {
                  throw new Error("Delete failed");
                }

                setSelectedImages(prev => {
                  const updatedPhotos = prev[taskTitle]?.photos?.filter(photo => photo.img_url !== imageUrl) || [];
                  if (updatedPhotos.length === 0) {
                    const newState = { ...prev };
                    delete newState[taskTitle];
                    return newState;
                  }
                  return { ...prev, [taskTitle]: { ...prev[taskTitle], photos: updatedPhotos } };
                });

                if (onPhotosUpdated) onPhotosUpdated();
                Alert.alert(tSafe('success_title', 'Success'), tSafe('image_deleted', 'Image deleted successfully'));
              } catch (error) {
                console.error("Delete error:", error);
                Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_delete_image', 'Failed to delete image. Please try again.'));
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert(tSafe('error_title', 'Error'), tSafe('unexpected_error', 'An unexpected error occurred'));
    }
  };

  const handleImagePress = (taskTitle, index) => {
    const imagesForViewer = (selectedImages[taskTitle]?.photos || []).map(photo => ({
      url: photo?.img_url || "",
      props: { source: { uri: photo?.img_url || "" } }
    }));
    if (imagesForViewer.length === 0) return;
    setCurrentImages(imagesForViewer);
    setCurrentImageIndex(index);
    setBeforeModalVisible(true);
  };

  const handleDelete = (scheduleId, taskTitle, imageUrl, e) => {
    e.stopPropagation();
    deleteImage(scheduleId, taskTitle, imageUrl);
  };

  // Loading overlay for camera
  const LoadingOverlay = () => (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator size="large" color="white" />
    </View>
  );

  // Empty state placeholder
  const EmptyStatePlaceholder = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="camera-outline" size={64} color={COLORS.lightGray} />
      <Text style={styles.emptyStateTitle}>{tSafe('no_rooms_assigned', 'No Rooms Assigned')}</Text>
      <Text style={styles.emptyStateSubtitle}>
        {tSafe('no_rooms_assigned_message', 'There are no rooms assigned to you for this cleaning schedule.')}
      </Text>
    </View>
  );

  // const renderCategoryItem = ({ item: taskTitle }) => {
  //   const formattedTitle = formatRoomTitle(taskTitle);
  //   const photoCount = selectedImages[taskTitle]?.photos?.length || 0;
  //   const needed = Math.max(0, 3 - photoCount);
  //   const isComplete = photoCount >= 3;
    
  //   return (
  //     <CardNoPrimary key={taskTitle}>
  //       <View style={{ marginBottom: 20 }}>
  //         <View style={styles.categoryHeader}>
  //           <View style={styles.titleContainer}>
  //             <View style={styles.iconContainer}>
  //               <Ionicons name="images-outline" size={20} color={COLORS.primary} />
  //             </View>
  //             <View style={styles.titleTextContainer}>
  //               <Text style={styles.roomTitle}>{formattedTitle}</Text>
  //               <Text style={styles.photoCount}>
  //                 {photoCount} {tSafe('photos', 'photo', { count: photoCount })}
  //               </Text>
  //             </View>
  //           </View>
  //           <View style={styles.statusBadge}>
  //             <Text style={styles.statusText}>
  //               {isComplete ? tSafe('complete', '✅ Complete') : tSafe('in_progress', '📸 In Progress')}
  //             </Text>
  //           </View>
  //         </View>

  //         <FlatList
  //           horizontal
  //           data={selectedImages[taskTitle]?.photos || []}
  //           keyExtractor={(_, index) => `photo-${index}`}
  //           renderItem={({ item: photo, index }) => (
  //             <TouchableOpacity style={styles.thumbnailContainer} onPress={() => handleImagePress(taskTitle, index)}>
  //               <Image source={{ uri: photo.img_url }} style={styles.preview} transition={400} cachePolicy="memory-disk" />
  //               <TouchableOpacity style={styles.deleteButton} onPress={(e) => handleDelete(scheduleId, taskTitle, photo.img_url, e)}>
  //                 <Ionicons name="trash" size={16} color="white" />
  //               </TouchableOpacity>
  //               <View style={styles.photoNumber}>
  //                 <Text style={styles.photoNumberText}>{index + 1}</Text>
  //               </View>
  //             </TouchableOpacity>
  //           )}
  //           showsHorizontalScrollIndicator={false}
  //           contentContainerStyle={styles.previewContainer}
  //           ListEmptyComponent={
  //             <View style={styles.emptyPhotos}>
  //               <Ionicons name="camera-outline" size={40} color="#ddd" />
  //               <Text style={styles.emptyPhotosText}>{tSafe('no_photos_yet', 'No photos yet')}</Text>
  //             </View>
  //           }
  //         />
     
  //         <View style={styles.tasksContainer}>
  //           {selectedImages[taskTitle]?.tasks?.map((task, index) => (
  //             <View key={index.toString()} style={styles.taskItem}>
  //               {renderTask({ item: task }, taskTitle)}
  //             </View>
  //           ))}
  //         </View>
          
  //         <View style={styles.horizontalLine} />
          
  //         <TouchableOpacity
  //           style={[styles.sendButton, isComplete && styles.sendButtonComplete]}
  //           onPress={() => openCamera(taskTitle)}
  //         >
  //           <View style={styles.sendButtonContent}>
  //             <Ionicons name="camera" size={24} color={isComplete ? COLORS.success : COLORS.primary} />
  //             <View style={styles.buttonTextContainer}>
  //               <Text style={[styles.addButtonText, isComplete && styles.addButtonTextComplete]}>
  //                 {tSafe('add_photos_to', 'Add Photos to {room}', { room: formattedTitle })}
  //               </Text>
  //               <Text style={styles.buttonSubtext}>
  //                 {isComplete
  //                   ? tSafe('complete_can_add_more', 'Complete! Can add more')
  //                   : tSafe('needed_more', '{count} more needed', { count: needed })}
  //               </Text>
  //             </View>
  //           </View>
  //           <Ionicons name="chevron-forward" size={20} color="#999" />
  //         </TouchableOpacity>
  //       </View>
  //     </CardNoPrimary>
  //   );
  // };

  // const renderCategoryItem = ({ item: taskTitle }) => {
  //   const formattedTitle = formatRoomTitle(taskTitle);
  //   const photos = selectedImages[taskTitle]?.photos || [];
  //   const photoCount = photos.length;
  //   const needed = Math.max(0, 3 - photoCount);
  //   const isComplete = photoCount >= 3;
  //   const tasks = selectedImages[taskTitle]?.tasks || [];
  //   const completedTasks = tasks.filter(t => t.value).length;
  //   const totalTasks = tasks.length;
  //   const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  //   return (
  //     <View style={styles.categoryCard}>
  //       {/* Header */}
  //       <View style={styles.categoryHeader}>
  //         <View style={styles.categoryTitleContainer}>
  //           <View style={styles.categoryIcon}>
  //             <Ionicons name="home-outline" size={22} color={COLORS.primary} />
  //           </View>
  //           <View>
  //             <Text style={styles.categoryTitle}>{formattedTitle}</Text>
  //             <View style={styles.categoryMeta}>
  //               <Text style={styles.categoryMetaText}>
  //                 {photoCount} {tSafe('photos', 'photos', { count: photoCount })}
  //               </Text>
  //               <View style={styles.metaDot} />
  //               <Text style={styles.categoryMetaText}>
  //                 {completedTasks}/{totalTasks} {tSafe('tasks', 'tasks')}
  //               </Text>
  //             </View>
  //           </View>
  //         </View>
  //         <View style={[styles.statusBadge, isComplete ? styles.statusComplete : styles.statusInProgress]}>
  //           <Text style={styles.statusBadgeText}>
  //             {isComplete ? tSafe('complete', 'Complete') : tSafe('in_progress', 'In Progress')}
  //           </Text>
  //         </View>
  //       </View>
  
  //       {/* Progress Bar */}
  //       <View style={styles.progressBarTrack}>
  //         <View style={[styles.progressBarFill, { width: `${isComplete ? 100 : progress}%` }]} />
  //       </View>
  
  //       {/* Photo Grid */}
  //       {photoCount > 0 ? (
  //         <ScrollView
  //           horizontal
  //           showsHorizontalScrollIndicator={false}
  //           contentContainerStyle={styles.photoGridContainer}
  //         >
  //           {photos.map((photo, index) => (
  //             <TouchableOpacity
  //               key={`photo-${index}`}
  //               style={styles.photoThumbnail}
  //               onPress={() => handleImagePress(taskTitle, index)}
  //             >
  //               <Image source={{ uri: photo.img_url }} style={styles.photoThumbnailImage} />
  //               <View style={styles.photoThumbnailOverlay}>
  //                 <Text style={styles.photoThumbnailIndex}>{index + 1}</Text>
  //               </View>
  //               <TouchableOpacity
  //                 style={styles.photoDeleteButton}
  //                 onPress={(e) => {
  //                   e.stopPropagation();
  //                   handleDelete(scheduleId, taskTitle, photo.img_url, e);
  //                 }}
  //               >
  //                 <Ionicons name="trash-outline" size={14} color="#fff" />
  //               </TouchableOpacity>
  //             </TouchableOpacity>
  //           ))}
  //         </ScrollView>
  //       ) : (
  //         <View style={styles.emptyPhotoState}>
  //           <Ionicons name="camera-outline" size={32} color="#ccc" />
  //           <Text style={styles.emptyPhotoText}>{tSafe('no_photos_yet', 'No photos yet')}</Text>
  //         </View>
  //       )}
  
  //       {/* Tasks */}
  //       {tasks.length > 0 && (
  //         <View style={styles.tasksContainer}>
  //           {tasks.map((task, index) => (
  //             <TouchableOpacity
  //               key={index}
  //               style={styles.taskItem}
  //               onPress={() => handleTaskToggle(taskTitle, task.id)}
  //             >
  //               <View style={[styles.taskCheck, task.value && styles.taskCheckCompleted]}>
  //                 {task.value && <Ionicons name="checkmark" size={12} color="#fff" />}
  //               </View>
  //               <Text style={[styles.taskText, task.value && styles.taskTextCompleted]}>
  //                 {task.label}
  //               </Text>
  //             </TouchableOpacity>
  //           ))}
  //         </View>
  //       )}
  
  //       {/* Add Photos Button */}
  //       <TouchableOpacity
  //         style={[styles.addButton, isComplete && styles.addButtonComplete]}
  //         onPress={() => openCamera(taskTitle)}
  //         activeOpacity={0.7}
  //       >
  //         <View style={styles.addButtonContent}>
  //           <Ionicons name="camera-outline" size={20} color={isComplete ? COLORS.success : COLORS.primary} />
  //           <View style={styles.addButtonTextContainer}>
  //             <Text style={[styles.addButtonTitle, isComplete && styles.addButtonTitleComplete]}>
  //               {isComplete
  //                 ? tSafe('add_more_photos', 'Add More Photos')
  //                 : tSafe('add_photos_to', 'Add Photos to {room}', { room: formattedTitle })}
  //             </Text>
  //             {!isComplete && (
  //               <Text style={styles.addButtonSubtitle}>
  //                 {tSafe('needed_more', '{count} more needed', { count: needed })}
  //               </Text>
  //             )}
  //           </View>
  //         </View>
  //         <Ionicons name="chevron-forward" size={20} color="#999" />
  //       </TouchableOpacity>
  //     </View>
  //   );
  // };


  // Helper function to get room icon
// const getRoomIcon = (type) => {
//   const normalized = type.toLowerCase();
//   switch (normalized) {
//     case 'bedroom':
//       return 'bed-outline';
//     case 'bathroom':
//       return 'shower-outline';
//     case 'kitchen':
//       return 'restaurant-outline';
//     case 'livingroom':
//     case 'living room':
//       return 'sofa-outline';
//     case 'extra':
//       return 'star-outline';
//     default:
//       return 'home-outline';
//   }
// };

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

const renderCategoryItem = ({ item: taskTitle }) => {
  const formattedTitle = formatRoomTitle(taskTitle);
  const photos = selectedImages[taskTitle]?.photos || [];
  const photoCount = photos.length;
  const needed = Math.max(0, 3 - photoCount);
  const isComplete = photoCount >= 3;
  const tasks = selectedImages[taskTitle]?.tasks || [];
  const completedTasks = tasks.filter(t => t.value).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const roomType = taskTitle.split('_')[0] || 'home'; // e.g., "Bedroom_1" -> "Bedroom"

  return (
    <View style={styles.categoryCard}>
      {/* Header */}
      <View style={styles.categoryHeader}>
        <View style={styles.categoryTitleContainer}>
          <View style={styles.categoryIcon}>
            <MaterialCommunityIcons name={getRoomIcon(roomType)} size={22} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.categoryTitle}>{formattedTitle}</Text>
            <View style={styles.categoryMeta}>
              <Text style={styles.categoryMetaText}>
                {photoCount} {tSafe('photos', 'photos', { count: photoCount })}
              </Text>
              <View style={styles.metaDot} />
              <Text style={styles.categoryMetaText}>
                {completedTasks}/{totalTasks} {tSafe('tasks', 'tasks')}
              </Text>
            </View>
          </View>
        </View>
        <View style={[styles.statusBadge, isComplete ? styles.statusComplete : styles.statusInProgress]}>
          <Text style={styles.statusBadgeText}>
            {isComplete ? tSafe('complete', 'Complete') : tSafe('in_progress', 'In Progress')}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${isComplete ? 100 : progress}%` }]} />
      </View>

      {/* Photo Grid */}
      {photoCount > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photoGridContainer}
        >
          {photos.map((photo, index) => (
            <TouchableOpacity
              key={`photo-${index}`}
              style={styles.photoThumbnail}
              onPress={() => handleImagePress(taskTitle, index)}
            >
              <Image source={{ uri: photo.img_url }} style={styles.photoThumbnailImage} />
              <View style={styles.photoThumbnailOverlay}>
                <Text style={styles.photoThumbnailIndex}>{index + 1}</Text>
              </View>
              <TouchableOpacity
                style={styles.photoDeleteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleDelete(scheduleId, taskTitle, photo.img_url, e);
                }}
              >
                <Ionicons name="trash-outline" size={14} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyPhotoState}>
          <Ionicons name="camera-outline" size={32} color="#ccc" />
          <Text style={styles.emptyPhotoText}>{tSafe('no_photos_yet', 'No photos yet')}</Text>
        </View>
      )}

      {/* Tasks */}
      {tasks.length > 0 && (
        <View style={styles.tasksContainer}>
          {tasks.map((task, index) => (
            <TouchableOpacity
              key={index}
              style={styles.taskItem}
              onPress={() => handleTaskToggle(taskTitle, task.id)}
            >
              <View style={[styles.taskCheck, task.value && styles.taskCheckCompleted]}>
                {task.value && <Ionicons name="checkmark" size={12} color="#fff" />}
              </View>
              <Text style={[styles.taskText, task.value && styles.taskTextCompleted]}>
                {task.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Add Photos Button */}
      {/* <TouchableOpacity
        style={[styles.addButton, isComplete && styles.addButtonComplete]}
        onPress={() => openCamera(taskTitle)}
        activeOpacity={0.7}
      >
        <View style={styles.addButtonContent}>
          <Ionicons name="camera-outline" size={20} color={isComplete ? COLORS.success : COLORS.primary} />
          <View style={styles.addButtonTextContainer}>
            <Text style={[styles.addButtonTitle, isComplete && styles.addButtonTitleComplete]}>
              {isComplete
                ? tSafe('add_more_photos', 'Add More Photos')
                : tSafe('add_photos_to', 'Add Photos to {room}', { room: formattedTitle })}
            </Text>
            {!isComplete && (
              <Text style={styles.addButtonSubtitle}>
                {tSafe('needed_more', '{count} more needed', { count: needed })}
              </Text>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity> */}

      <TouchableOpacity
        style={[styles.addButton, isComplete && styles.addButtonComplete, isReadOnly && styles.addButtonDisabled]}
        onPress={() => {
          if (isReadOnly) {
            Alert.alert(
              tSafe('read_only_title', 'Read Only'),
              tSafe('read_only_message', 'This job is locked. You cannot add photos after submitting.')
            );
            return;
          }
          openCamera(taskTitle);
        }}
        activeOpacity={0.7}
        disabled={isReadOnly}
      >
        <View style={styles.addButtonContent}>
          <Ionicons name="camera-outline" size={20} color={isReadOnly ? '#ccc' : (isComplete ? COLORS.success : COLORS.primary)} />
          <View style={styles.addButtonTextContainer}>
            <Text style={[styles.addButtonTitle, isComplete && styles.addButtonTitleComplete, isReadOnly && styles.addButtonTextDisabled]}>
              {isReadOnly
                ? tSafe('read_only_locked', 'Locked – Read Only')
                : isComplete
                  ? tSafe('add_more_photos', 'Add More Photos')
                  : tSafe('add_photos_to', 'Add Photos to {room}', { room: formattedTitle })}
            </Text>
            {!isComplete && !isReadOnly && (
              <Text style={styles.addButtonSubtitle}>
                {tSafe('needed_more', '{count} more needed', { count: needed })}
              </Text>
            )}
            {isReadOnly && (
              <Text style={styles.addButtonSubtitle}>
                {tSafe('read_only_subtitle', 'No changes allowed')}
              </Text>
            )}
          </View>
        </View>
        <Ionicons name={isReadOnly ? 'lock-closed' : 'chevron-forward'} size={20} color={isReadOnly ? '#ccc' : '#999'} />
      </TouchableOpacity>
    </View>
  );
};

  return (
    <SafeAreaView style={styles.container}>
      {/* Before Photos Viewer Modal */}
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
            saveToLocalByLongPress={false}
            onSwipeDown={() => setBeforeModalVisible(false)}
            renderImage={(props) => (
              <Image
                source={{ uri: props.source.uri }}
                style={styles.fullSizeImage}
                contentFit="contain"
                transition={300}
                cachePolicy="memory-disk"
              />
            )}
          />
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setBeforeModalVisible(false)}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </RNModal>

      {/* Camera Modal */}
      <RNModal
        isVisible={cameraVisible}
        style={styles.fullScreenModal}
        onBackdropPress={() => setCameraVisible(false)}
      >
        <View style={styles.cameraModalContainer}>
          {/* Camera Header */}
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

          {/* Camera Preview */}
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
            {photos.length === 0 && permission?.granted && !isSimulator && (
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
                        <TouchableOpacity onPress={() => removePhoto(index)} style={styles.removeButton}>
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

                <TouchableOpacity
                  style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
                  onPress={onSubmit}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={22} color="white" />
                      <Text style={styles.uploadButtonText}>
                        {tSafe('upload_photos', 'Upload {count} photo{plural}', {
                          count: photos.length,
                          plural: photos.length !== 1 ? 's' : ''
                        })}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {photos.length === 0 && permission?.granted && !isSimulator && (
              <Text style={styles.cameraInstructions}>
                {tSafe('camera_instructions', 'Tap the camera button to capture photos')}
              </Text>
            )}
          </View>
        </View>
      </RNModal>

      {/* Main Content */}
      {!cameraVisible ? (
        <View style={{ flex: 1 }}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <CustomActivityIndicator size={40} />
            </View>
          ) : (
            <FlatList
              data={Object.keys(selectedImages)}
              keyExtractor={(item) => item}
              ListHeaderComponent={
                <>
                  <View style={styles.headerContainer}>
                    <View style={styles.headerIcon}>
                      <Ionicons name="document-text-outline" size={28} color={COLORS.primary} />
                    </View>
                    <Text style={styles.headline}>{tSafe('document_starting_point', 'Document the Starting Point')}</Text>
                    <Text style={styles.subtitle}>{tSafe('capture_before_photos', 'Capture before photos for quality assurance')}</Text>
                  </View>
                  <View style={styles.message}>
                    {/* <Ionicons name="information-circle-outline" size={20} color={COLORS.warning} /> */}
                    <Text style={styles.subheading}>
                      {tSafe('instructions_before_photos', '• 3+ photos per area before cleaning\n• Finish all before photos to unlock After Photos\n• Use camera or select from photo library')}
                    </Text>
                  </View>
                </>
              }
              ListEmptyComponent={<EmptyStatePlaceholder />}
              ListFooterComponent={
                Object.keys(selectedImages).length > 0 && (
                  <TouchableOpacity style={styles.finishButton} onPress={submitCompletion}>
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text style={styles.finishButtonText}>{tSafe('finish_documentation', 'Finish Documentation')}</Text>
                  </TouchableOpacity>
                )
              }
              renderItem={renderCategoryItem}
            />
          )}
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
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




  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  categoryMetaText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#C7C7CC',
    marginHorizontal: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusInProgress: {
    backgroundColor: COLORS.warning + '20',
  },
  statusComplete: {
    backgroundColor: COLORS.success + '20',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  photoGridContainer: {
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 10,
    position: 'relative',
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
  },
  photoThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  photoThumbnailOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  photoThumbnailIndex: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  photoDeleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 4,
  },
  emptyPhotoState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyPhotoText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  tasksContainer: {
    marginVertical: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  taskCheck: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#C7C7CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  taskCheckCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  taskText: {
    fontSize: 14,
    color: '#1C1C1E',
    flex: 1,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginTop: 4,
  },
  addButtonComplete: {
    backgroundColor: '#f0f9f0',
    borderColor: '#d4edda',
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonTextContainer: {
    marginLeft: 12,
  },
  addButtonTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  addButtonTitleComplete: {
    color: COLORS.success,
  },
  addButtonSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
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
  headerContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerIcon: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 50,
    marginBottom: 10,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 5,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '400',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    backgroundColor: '#f0f7ff',
    padding: 8,
    borderRadius: 10,
    marginRight: 12,
  },
  titleTextContainer: {
    flex: 1,
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  photoCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  statusBadge: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  thumbnailContainer: {
    margin: 5,
    position: 'relative',
  },
  preview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  photoNumber: {
    position: 'absolute',
    top: 5,
    left: 5,
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
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  sendButtonComplete: {
    backgroundColor: '#f0f9f0',
    borderColor: '#d4edda',
  },
  sendButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  buttonTextContainer: {
    marginLeft: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  addButtonTextComplete: {
    color: '#155724',
  },
  buttonSubtext: {
    fontSize: 12,
    color: '#666',
    fontWeight: '400',
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
    marginTop: 5,
    textAlign: 'center',
  },
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    margin: 16,
    marginTop: 0,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  subheading: {
    flex: 1,
    fontSize: 13,
    color: '#856404',
    marginLeft: 10,
    fontWeight: '500',
    lineHeight: 20,
  },
  finishButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    margin: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  finishButtonText: {
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

  // Simulator and permission styles
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

  // Image Viewer Modal
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
  taskContainer: {
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    marginBottom: 4,
  },
  tasksContainer: {
    marginTop: 10,
  },
  taskItem: {
    marginBottom: 5,
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
  horizontalLine: {
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
    marginVertical: 15,
  },


  addButtonDisabled: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  addButtonTextDisabled: {
    color: '#999',
  },
});

export default BeforePhoto;