// import React, { useContext, useCallback, useState } from 'react';
// import { useFocusEffect } from '@react-navigation/native';
// import { 
//   SafeAreaView, 
//   StyleSheet, 
//   Text, 
//   StatusBar, 
//   ScrollView, 
//   View, 
//   TouchableOpacity, 
//   ActivityIndicator,
//   Dimensions
// } from 'react-native';
// import COLORS from '../../../constants/colors';
// import userService from '../../../services/connection/userService';
// import { AuthContext } from '../../../context/AuthContext';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import * as Animatable from 'react-native-animatable';
// import ImageViewer from 'react-native-image-zoom-viewer';
// import Modal from 'react-native-modal';
// import { Image } from 'expo-image';
// import formatRoomTitle from '../../../utils/formatRoomTitle';

// const { width: screenWidth } = Dimensions.get('window');

// const BeforePhoto = ({ scheduleId, schedule }) => {
//   const { currentUserId } = useContext(AuthContext);
//   const [isLoading, setIsLoading] = useState(false);
//   const [assignedCleaners, setAssignedCleaners] = useState([]);
//   const [isBeforeModalVisible, setBeforeModalVisible] = useState(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [currentImages, setCurrentImages] = useState([]);
//   const [selectedGroup, setSelectedGroup] = useState('all');
//   const [selectedRoom, setSelectedRoom] = useState('all');

//   useFocusEffect(
//     useCallback(() => {
//       let isMounted = true;

//       const fetchData = async () => {
//         try {
//           setIsLoading(true);
//           const response = await userService.getUpdatedImageUrls(scheduleId);
//           if (isMounted) {
//             const res = response.data.data;
            
//             if (res.assignedTo && Array.isArray(res.assignedTo)) {
//               setAssignedCleaners(res.assignedTo);
//             }
//           }
//         } catch (error) {
//           console.log('Error fetching before photos:', error);
//         } finally {
//           if (isMounted) {
//             setIsLoading(false);
//           }
//         }
//       };

//       fetchData();

//       return () => {
//         isMounted = false;
//       };
//     }, [scheduleId])
//   );

//   // Get unique groups
//   const getGroups = () => {
//     const groups = new Set(assignedCleaners.map(cleaner => cleaner.group));
//     return ['all', ...Array.from(groups)];
//   };

//   // Get all unique rooms across filtered cleaners
//   const getAllRooms = () => {
//     const rooms = new Set();
//     getFilteredCleaners().forEach(cleaner => {
//       if (cleaner.before_photos) {
//         Object.keys(cleaner.before_photos).forEach(room => {
//           if (cleaner.before_photos[room].photos?.length > 0) {
//             rooms.add(room);
//           }
//         });
//       }
//     });
//     return ['all', ...Array.from(rooms)];
//   };

//   // Filter cleaners based on selected group
//   const getFilteredCleaners = () => {
//     if (selectedGroup === 'all') {
//       return assignedCleaners;
//     }
//     return assignedCleaners.filter(cleaner => cleaner.group === selectedGroup);
//   };

//   const openImageViewer = (images, index) => {
//     const formattedImages = images.map(photo => ({
//       url: photo.img_url,
//       props: {
//         source: { uri: photo.img_url }
//       }
//     }));
//     setCurrentImages(formattedImages);
//     setCurrentImageIndex(index);
//     setBeforeModalVisible(true);
//   };

//   const getTotalPhotosForCleaner = (cleaner) => {
//     if (!cleaner.before_photos) return 0;
//     return Object.values(cleaner.before_photos).reduce((total, room) => 
//       total + (room.photos?.length || 0), 0
//     );
//   };

//   const getTotalPhotosForGroup = (group) => {
//     const groupCleaners = group === 'all' ? assignedCleaners : assignedCleaners.filter(c => c.group === group);
//     return groupCleaners.reduce((total, cleaner) => total + getTotalPhotosForCleaner(cleaner), 0);
//   };

//   const renderGroupTabs = () => (
//     <ScrollView 
//       horizontal 
//       showsHorizontalScrollIndicator={false}
//       style={styles.groupTabsContainer}
//       contentContainerStyle={styles.groupTabsContent}
//     >
//       {getGroups().map(group => {
//         const photoCount = getTotalPhotosForGroup(group);
//         if (photoCount === 0 && group !== 'all') return null;
        
//         return (
//           <TouchableOpacity
//             key={group}
//             style={[
//               styles.groupTab,
//               selectedGroup === group && styles.groupTabActive
//             ]}
//             onPress={() => {
//               setSelectedGroup(group);
//               setSelectedRoom('all');
//             }}
//           >
//             <Text style={[
//               styles.groupTabText,
//               selectedGroup === group && styles.groupTabTextActive
//             ]}>
//               {group === 'all' ? 'All Groups' : group.replace('_', ' ').toUpperCase()}
//             </Text>
//             <View style={styles.groupBadge}>
//               <Text style={styles.groupBadgeText}>
//                 {photoCount}
//               </Text>
//             </View>
//           </TouchableOpacity>
//         );
//       })}
//     </ScrollView>
//   );

//   const renderRoomFilter = () => {
//     const rooms = getAllRooms();
//     if (rooms.length <= 1) return null;
  
//     return (
//       <View style={styles.roomFilterSection}>
//         <Text style={styles.roomFilterTitle}>Filter by Room:</Text>
//         <ScrollView 
//           horizontal 
//           showsHorizontalScrollIndicator={false}
//           style={styles.roomFilterContainer}
//           contentContainerStyle={styles.roomFilterContent}
//         >
//           {rooms.map(room => (
//             <TouchableOpacity
//               key={room}
//               style={[
//                 styles.roomFilterTab,
//                 selectedRoom === room && styles.roomFilterTabActive
//               ]}
//               onPress={() => setSelectedRoom(room)}
//             >
//               <Text style={[
//                 styles.roomFilterText,
//                 selectedRoom === room && styles.roomFilterTextActive
//               ]}>
//                 {room === 'all' ? 'All Rooms' : formatRoomTitle(room)} {/* Updated this line */}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>
//     );
//   };

//   const renderRoomSection = (cleaner, roomName, roomData) => {
//     if (!roomData.photos?.length) return null;

//     return (
//       <View key={roomName} style={styles.roomSection}>
//         <View style={styles.roomHeader}>
//           <Text style={styles.roomTitle}>
//             {formatRoomTitle(roomName)} {/* Updated this line */}
//           </Text>
//           <Text style={styles.roomPhotoCount}>
//             {roomData.photos.length} photo{roomData.photos.length !== 1 ? 's' : ''}
//           </Text>
//         </View>
        
//         <ScrollView 
//           horizontal 
//           showsHorizontalScrollIndicator={false}
//           style={styles.photosScrollView}
//           contentContainerStyle={styles.photosScrollContent}
//         >
//           {roomData.photos.map((photo, photoIndex) => (
//             <TouchableOpacity
//               key={photoIndex}
//               style={styles.photoCard}
//               onPress={() => openImageViewer(roomData.photos, photoIndex)}
//             >
//               <Image 
//                 source={{ uri: photo.img_url }} 
//                 style={styles.photoImage}
//                 contentFit="cover"
//                 transition={300}
//               />
//               <View style={styles.photoOverlay}>
//                 <MaterialCommunityIcons name="magnify-plus-outline" size={20} color="white" />
//               </View>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>
//     );
//   };

//   const renderCleanerCard = (cleaner, index) => {
//     const totalPhotos = getTotalPhotosForCleaner(cleaner);
    
//     if (totalPhotos === 0) return null;

//     // Filter rooms based on selection
//     const roomsToShow = selectedRoom === 'all' 
//       ? Object.entries(cleaner.before_photos || {})
//       : [[selectedRoom, cleaner.before_photos?.[selectedRoom]]].filter(([_, data]) => data?.photos?.length);

//     if (roomsToShow.length === 0) return null;

//     return (
//       <Animatable.View 
//         key={`${cleaner.cleanerId}-${index}`}
//         style={styles.cleanerCard}
//         animation="fadeInUp"
//         duration={600}
//         delay={index * 200}
//       >
//         {/* Cleaner Header */}
//         <View style={styles.cleanerHeader}>
//           <View style={styles.cleanerInfo}>
//             <Image 
//               source={{ uri: cleaner.avatar }} 
//               style={styles.cleanerAvatar}
//               contentFit="cover"
//             />
//             <View style={styles.cleanerDetails}>
//               <Text style={styles.cleanerName}>
//                 {cleaner.firstname} {cleaner.lastname}
//               </Text>
//               <View style={styles.cleanerMeta}>
//                 <Text style={styles.cleanerGroup}>{cleaner.group.replace('_', ' ').toUpperCase()}</Text>
//                 <View style={[
//                   styles.statusBadge,
//                   cleaner.status === 'completed' && styles.statusCompleted,
//                   cleaner.status === 'in_progress' && styles.statusInProgress
//                 ]}>
//                   <Text style={styles.statusText}>
//                     {cleaner.status.replace('_', ' ')}
//                   </Text>
//                 </View>
//               </View>
//             </View>
//           </View>
//           <View style={styles.photoCountBadge}>
//             <MaterialCommunityIcons name="camera" size={16} color={COLORS.white} />
//             <Text style={styles.photoCountText}>{totalPhotos}</Text>
//           </View>
//         </View>

//         {/* Room Sections with Horizontal Photo Lists */}
//         <View style={styles.roomsContainer}>
//           {roomsToShow.map(([roomName, roomData]) => 
//             renderRoomSection(cleaner, roomName, roomData)
//           )}
//         </View>
//       </Animatable.View>
//     );
//   };

//   const renderEmptyState = (type = 'general') => {
//     const messages = {
//       general: {
//         icon: 'camera-off',
//         title: 'No Before Photos Yet',
//         message: 'Before photos will appear here once cleaners start documenting their work.'
//       },
//       group: {
//         icon: 'account-group',
//         title: 'No Photos in This Group',
//         message: 'Selected group has no before photos yet.'
//       },
//       room: {
//         icon: 'door-open',
//         title: 'No Photos in This Room',
//         message: 'Selected room has no before photos yet.'
//       }
//     };

//     const { icon, title, message } = messages[type];

//     return (
//       <View style={styles.emptyState}>
//         <MaterialCommunityIcons 
//           name={icon} 
//           size={80} 
//           color={COLORS.light_gray} 
//         />
//         <Text style={styles.emptyStateTitle}>{title}</Text>
//         <Text style={styles.emptyStateText}>{message}</Text>
//       </View>
//     );
//   };

//   const filteredCleaners = getFilteredCleaners();
//   const hasPhotos = filteredCleaners.some(cleaner => getTotalPhotosForCleaner(cleaner) > 0);

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      
//       {isLoading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text style={styles.loadingText}>Loading before photos...</Text>
//         </View>
//       ) : (
//         <View style={styles.content}>
//           {/* Header and Filters - Limited height sections */}
//           <View>
//             {/* Header - Commented out as per your code, but keeping structure */}
//             <View style={styles.header}>
//               <View style={styles.headerTextContainer}>
//                 <Text style={styles.headerTitle}>Before Cleaning</Text>
//                 <Text style={styles.headerSubtitle}>
//                   Photos taken before cleaning begins
//                 </Text>
//               </View>
//               <View style={styles.summaryBadge}>
//                 <Text style={styles.summaryText}>
//                   {assignedCleaners.length} cleaner{assignedCleaners.length !== 1 ? 's' : ''}
//                 </Text>
//               </View>
//             </View>
  
//             {/* Group Tabs - Limited height */}
//             {getGroups().length > 1 && renderGroupTabs()}
  
//             {/* Room Filter - Limited height */}
//             {renderRoomFilter()}
//           </View>
  
//           {/* Main Content - Takes remaining space */}
//           <View style={styles.mainContentArea}>
//             <ScrollView 
//               showsVerticalScrollIndicator={false}
//               style={styles.cleanersScrollView}
//               contentContainerStyle={styles.cleanersList}
//             >
//               {hasPhotos ? (
//                 <View style={styles.cleanersContent}>
//                   {filteredCleaners.map((cleaner, index) => 
//                     renderCleanerCard(cleaner, index)
//                   )}
//                 </View>
//               ) : (
//                 renderEmptyState(
//                   selectedGroup !== 'all' ? 'group' : 
//                   selectedRoom !== 'all' ? 'room' : 'general'
//                 )
//               )}
//             </ScrollView>
//           </View>
//         </View>
//       )}
  
//       {/* Image Viewer Modal */}
//       <Modal
//         isVisible={isBeforeModalVisible}
//         style={styles.modal}
//         onBackdropPress={() => setBeforeModalVisible(false)}
//         onSwipeComplete={() => setBeforeModalVisible(false)}
//         swipeDirection={['down']}
//         animationIn="fadeIn"
//         animationOut="fadeOut"
//       >
//         <View style={styles.modalContainer}>
//           <ImageViewer
//             imageUrls={currentImages}
//             index={currentImageIndex}
//             backgroundColor="black"
//             enableSwipeDown
//             enableImageZoom
//             onCancel={() => setBeforeModalVisible(false)}
//             renderHeader={(currentIndex) => (
//               <View style={styles.modalHeader}>
//                 <Text style={styles.modalCounter}>
//                   {currentIndex + 1} / {currentImages.length}
//                 </Text>
//                 <TouchableOpacity 
//                   style={styles.closeButton}
//                   onPress={() => setBeforeModalVisible(false)}
//                 >
//                   <MaterialCommunityIcons name="close" size={24} color="white" />
//                 </TouchableOpacity>
//               </View>
//             )}
//             renderImage={(props) => (
//               <Image
//                 {...props}
//                 style={styles.fullSizeImage}
//                 contentFit="contain"
//                 transition={300}
//               />
//             )}
//           />
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
  
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//   },
//   content: {
//     flex: 1, // Keep flex: 1 but restructure the internal layout
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: COLORS.gray,
//     textAlign: 'center',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     backgroundColor: COLORS.white,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.light_gray_1,
//   },
//   headerTextContainer: {
//     flex: 1,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: COLORS.dark,
//     marginBottom: 4,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: COLORS.gray,
//     lineHeight: 18,
//   },
//   summaryBadge: {
//     backgroundColor: COLORS.primary_light_1,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     marginLeft: 12,
//   },
//   summaryText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },
//   groupTabsContainer: {
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.light_gray_1,
//     backgroundColor: COLORS.white,
//     maxHeight: 60, // Limit maximum height
//   },
//   groupTabsContent: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//   },
//   groupTab: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     marginRight: 6,
//     backgroundColor: COLORS.light_gray_1,
//     borderRadius: 16,
//   },
//   groupTabActive: {
//     backgroundColor: COLORS.primary,
//   },
//   groupTabText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginRight: 4,
//   },
//   groupTabTextActive: {
//     color: COLORS.white,
//   },
//   groupBadge: {
//     backgroundColor: 'rgba(255,255,255,0.3)',
//     paddingHorizontal: 4,
//     paddingVertical: 1,
//     borderRadius: 8,
//     minWidth: 18,
//     alignItems: 'center',
//   },
//   groupBadgeText: {
//     fontSize: 10,
//     fontWeight: '600',
//     color: COLORS.dark,
//   },
//   roomFilterSection: {
//     paddingHorizontal: 20,
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.light_gray_1,
//     backgroundColor: COLORS.white,
//     maxHeight: 80, // Limit maximum height
//   },
//   roomFilterTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 6,
//   },
//   roomFilterContainer: {
//     marginHorizontal: -20,
//   },
//   roomFilterContent: {
//     paddingHorizontal: 20,
//   },
//   roomFilterTab: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     marginRight: 6,
//     backgroundColor: COLORS.light_gray_1,
//     borderRadius: 16,
//   },
//   roomFilterTabActive: {
//     backgroundColor: COLORS.secondary,
//   },
//   roomFilterText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: COLORS.dark,
//   },
//   roomFilterTextActive: {
//     color: COLORS.white,
//   },
//   // Main content area that takes remaining space
//   mainContentArea: {
//     flex: 1, // This takes all remaining space after headers
//   },
//   cleanersScrollView: {
//     flex: 1,
//   },
//   cleanersList: {
//     flexGrow: 1,
//     padding: 16,
//   },
//   cleanersContent: {
//     padding: 0,
//   },
//   cleanerCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   cleanerHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   cleanerInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   cleanerAvatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 12,
//   },
//   cleanerDetails: {
//     flex: 1,
//   },
//   cleanerName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: COLORS.dark,
//     marginBottom: 4,
//   },
//   cleanerMeta: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//   },
//   cleanerGroup: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontWeight: '600',
//     marginRight: 8,
//     backgroundColor: COLORS.primary_light_1,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 6,
//   },
//   statusBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 6,
//     backgroundColor: COLORS.light_gray_1,
//   },
//   statusCompleted: {
//     backgroundColor: COLORS.green,
//   },
//   statusInProgress: {
//     backgroundColor: "#FED8B1",
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.dark,
//     textTransform: 'capitalize',
//   },
//   photoCountBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   photoCountText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.white,
//     marginLeft: 4,
//   },
//   roomsContainer: {
//     // Room sections will stack vertically
//   },
//   roomSection: {
//     marginBottom: 20,
//   },
//   roomHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   roomTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     textTransform: 'capitalize',
//   },
//   roomPhotoCount: {
//     fontSize: 14,
//     color: COLORS.gray,
//     fontWeight: '500',
//   },
//   photosScrollView: {
//     marginHorizontal: -16,
//   },
//   photosScrollContent: {
//     paddingHorizontal: 16,
//   },
//   photoCard: {
//     width: 120,
//     height: 120,
//     borderRadius: 8,
//     marginRight: 12,
//     overflow: 'hidden',
//     position: 'relative',
//   },
//   photoImage: {
//     width: '100%',
//     height: '100%',
//     backgroundColor: COLORS.light_gray,
//   },
//   photoOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     opacity: 0,
//   },
//   emptyState: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 40,
//     paddingVertical: 60,
//   },
//   emptyStateTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginTop: 16,
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   emptyStateText: {
//     fontSize: 16,
//     color: COLORS.gray,
//     textAlign: 'center',
//     lineHeight: 22,
//   },
//   modal: {
//     margin: 0,
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'black',
//   },
//   modalHeader: {
//     position: 'absolute',
//     top: 50,
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     zIndex: 1,
//   },
//   modalCounter: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   closeButton: {
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     borderRadius: 20,
//     padding: 10,
//   },
//   fullSizeImage: {
//     width: '100%',
//     height: '100%',
//   },
// });

// export default BeforePhoto;


// import React, { useContext, useCallback, useState } from 'react';
// import { useFocusEffect } from '@react-navigation/native';
// import { 
//   SafeAreaView, 
//   StyleSheet, 
//   Text, 
//   StatusBar, 
//   ScrollView, 
//   View, 
//   TouchableOpacity, 
//   ActivityIndicator,
//   Dimensions
// } from 'react-native';
// import COLORS from '../../../constants/colors';
// import userService from '../../../services/connection/userService';
// import { AuthContext } from '../../../context/AuthContext';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import * as Animatable from 'react-native-animatable';
// import ImageViewer from 'react-native-image-zoom-viewer';
// import Modal from 'react-native-modal';
// import { Image } from 'expo-image';
// import formatRoomTitle from '../../../utils/formatRoomTitle';
// import { tSafe } from '../../../utils/tSafe'; // added import

// const { width: screenWidth } = Dimensions.get('window');

// // Helper to translate statuses
// const getTranslatedStatus = (status) => {
//   switch (status) {
//     case 'completed': return tSafe('status_completed', 'Completed');
//     case 'in_progress': return tSafe('status_in_progress', 'In Progress');
//     default: return status?.replace('_', ' ') || status;
//   }
// };

// const BeforePhoto = ({ scheduleId, schedule, onScroll }) => {
//   const { currentUserId } = useContext(AuthContext);
//   const [isLoading, setIsLoading] = useState(false);
//   const [assignedCleaners, setAssignedCleaners] = useState([]);
//   const [isBeforeModalVisible, setBeforeModalVisible] = useState(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [currentImages, setCurrentImages] = useState([]);
//   const [selectedGroup, setSelectedGroup] = useState('all');
//   const [selectedRoom, setSelectedRoom] = useState('all');

//   useFocusEffect(
//     useCallback(() => {
//       let isMounted = true;

//       const fetchData = async () => {
//         try {
//           setIsLoading(true);
//           const response = await userService.getUpdatedImageUrls(scheduleId);
//           if (isMounted) {
//             const res = response.data.data;
            
//             if (res.assignedTo && Array.isArray(res.assignedTo)) {
//               setAssignedCleaners(res.assignedTo);
//             }
//           }
//         } catch (error) {
//           console.log('Error fetching before photos:', error);
//         } finally {
//           if (isMounted) {
//             setIsLoading(false);
//           }
//         }
//       };

//       fetchData();

//       return () => {
//         isMounted = false;
//       };
//     }, [scheduleId])
//   );

//   // Get unique groups
//   const getGroups = () => {
//     const groups = new Set(assignedCleaners.map(cleaner => cleaner.group));
//     return ['all', ...Array.from(groups)];
//   };

//   // Get all unique rooms across filtered cleaners
//   const getAllRooms = () => {
//     const rooms = new Set();
//     getFilteredCleaners().forEach(cleaner => {
//       if (cleaner.before_photos) {
//         Object.keys(cleaner.before_photos).forEach(room => {
//           if (cleaner.before_photos[room].photos?.length > 0) {
//             rooms.add(room);
//           }
//         });
//       }
//     });
//     return ['all', ...Array.from(rooms)];
//   };

//   // Filter cleaners based on selected group
//   const getFilteredCleaners = () => {
//     if (selectedGroup === 'all') {
//       return assignedCleaners;
//     }
//     return assignedCleaners.filter(cleaner => cleaner.group === selectedGroup);
//   };

//   const openImageViewer = (images, index) => {
//     const formattedImages = images.map(photo => ({
//       url: photo.img_url,
//       props: {
//         source: { uri: photo.img_url }
//       }
//     }));
//     setCurrentImages(formattedImages);
//     setCurrentImageIndex(index);
//     setBeforeModalVisible(true);
//   };

//   const getTotalPhotosForCleaner = (cleaner) => {
//     if (!cleaner.before_photos) return 0;
//     return Object.values(cleaner.before_photos).reduce((total, room) => 
//       total + (room.photos?.length || 0), 0
//     );
//   };

//   const getTotalPhotosForGroup = (group) => {
//     const groupCleaners = group === 'all' ? assignedCleaners : assignedCleaners.filter(c => c.group === group);
//     return groupCleaners.reduce((total, cleaner) => total + getTotalPhotosForCleaner(cleaner), 0);
//   };

//   // Helper to format group label
//   const formatGroupLabel = (group) => {
//     if (group === 'all') return tSafe('all_groups', 'All Groups');
//     const groupNumber = group.replace('group_', '');
//     return `${tSafe('group', 'Group')} ${groupNumber}`;
//   };

//   const renderGroupTabs = () => (
//     <ScrollView 
//       horizontal 
//       showsHorizontalScrollIndicator={false}
//       style={styles.groupTabsContainer}
//       contentContainerStyle={styles.groupTabsContent}
//     >
//       {getGroups().map(group => {
//         const photoCount = getTotalPhotosForGroup(group);
//         if (photoCount === 0 && group !== 'all') return null;
        
//         const label = formatGroupLabel(group);
        
//         return (
//           <TouchableOpacity
//             key={group}
//             style={[
//               styles.groupTab,
//               selectedGroup === group && styles.groupTabActive
//             ]}
//             onPress={() => {
//               setSelectedGroup(group);
//               setSelectedRoom('all');
//             }}
//           >
//             <Text style={[
//               styles.groupTabText,
//               selectedGroup === group && styles.groupTabTextActive
//             ]}>
//               {label}
//             </Text>
//             <View style={styles.groupBadge}>
//               <Text style={styles.groupBadgeText}>
//                 {photoCount}
//               </Text>
//             </View>
//           </TouchableOpacity>
//         );
//       })}
//     </ScrollView>
//   );

//   const renderRoomFilter = () => {
//     const rooms = getAllRooms();
//     if (rooms.length <= 1) return null;
  
//     return (
//       <View style={styles.roomFilterSection}>
//         <Text style={styles.roomFilterTitle}>{tSafe('filter_by_room', 'Filter by Room:')}</Text>
//         <ScrollView 
//           horizontal 
//           showsHorizontalScrollIndicator={false}
//           style={styles.roomFilterContainer}
//           contentContainerStyle={styles.roomFilterContent}
//         >
//           {rooms.map(room => (
//             <TouchableOpacity
//               key={room}
//               style={[
//                 styles.roomFilterTab,
//                 selectedRoom === room && styles.roomFilterTabActive
//               ]}
//               onPress={() => setSelectedRoom(room)}
//             >
//               <Text style={[
//                 styles.roomFilterText,
//                 selectedRoom === room && styles.roomFilterTextActive
//               ]}>
//                 {room === 'all' ? tSafe('all_rooms', 'All Rooms') : formatRoomTitle(room)}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>
//     );
//   };

//   const renderRoomSection = (cleaner, roomName, roomData) => {
//     if (!roomData.photos?.length) return null;

//     const photoCount = roomData.photos.length;
//     const photoLabel = photoCount === 1 ? tSafe('photo', 'photo') : tSafe('photos', 'photos');

//     return (
//       <View key={roomName} style={styles.roomSection}>
//         <View style={styles.roomHeader}>
//           <Text style={styles.roomTitle}>
//             {formatRoomTitle(roomName)}
//           </Text>
//           <Text style={styles.roomPhotoCount}>
//             {photoCount} {photoLabel}
//           </Text>
//         </View>
        
//         <ScrollView 
//           horizontal 
//           showsHorizontalScrollIndicator={false}
//           style={styles.photosScrollView}
//           contentContainerStyle={styles.photosScrollContent}
//         >
//           {roomData.photos.map((photo, photoIndex) => (
//             <TouchableOpacity
//               key={photoIndex}
//               style={styles.photoCard}
//               onPress={() => openImageViewer(roomData.photos, photoIndex)}
//             >
//               <Image 
//                 source={{ uri: photo.img_url }} 
//                 style={styles.photoImage}
//                 contentFit="cover"
//                 transition={300}
//               />
//               <View style={styles.photoOverlay}>
//                 <MaterialCommunityIcons name="magnify-plus-outline" size={20} color="white" />
//               </View>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>
//     );
//   };

//   const renderCleanerCard = (cleaner, index) => {
//     const totalPhotos = getTotalPhotosForCleaner(cleaner);
    
//     if (totalPhotos === 0) return null;

//     // Filter rooms based on selection
//     const roomsToShow = selectedRoom === 'all' 
//       ? Object.entries(cleaner.before_photos || {})
//       : [[selectedRoom, cleaner.before_photos?.[selectedRoom]]].filter(([_, data]) => data?.photos?.length);

//     if (roomsToShow.length === 0) return null;

//     const translatedStatus = getTranslatedStatus(cleaner.status);
//     const groupLabel = `${tSafe('group', 'Group')} ${cleaner.group.replace('group_', '')}`;

//     return (
//       <Animatable.View 
//         key={`${cleaner.cleanerId}-${index}`}
//         style={styles.cleanerCard}
//         animation="fadeInUp"
//         duration={600}
//         delay={index * 200}
//       >
//         {/* Cleaner Header */}
//         <View style={styles.cleanerHeader}>
//           <View style={styles.cleanerInfo}>
//             <Image 
//               source={{ uri: cleaner.avatar }} 
//               style={styles.cleanerAvatar}
//               contentFit="cover"
//             />
//             <View style={styles.cleanerDetails}>
//               <Text style={styles.cleanerName}>
//                 {cleaner.firstname} {cleaner.lastname}
//               </Text>
//               <View style={styles.cleanerMeta}>
//                 <Text style={styles.cleanerGroup}>{groupLabel}</Text>
//                 <View style={[
//                   styles.statusBadge,
//                   cleaner.status === 'completed' && styles.statusCompleted,
//                   cleaner.status === 'in_progress' && styles.statusInProgress
//                 ]}>
//                   <Text style={styles.statusText}>
//                     {translatedStatus}
//                   </Text>
//                 </View>
//               </View>
//             </View>
//           </View>
//           <View style={styles.photoCountBadge}>
//             <MaterialCommunityIcons name="camera" size={16} color={COLORS.white} />
//             <Text style={styles.photoCountText}>{totalPhotos}</Text>
//           </View>
//         </View>

//         {/* Room Sections with Horizontal Photo Lists */}
//         <View style={styles.roomsContainer}>
//           {roomsToShow.map(([roomName, roomData]) => 
//             renderRoomSection(cleaner, roomName, roomData)
//           )}
//         </View>
//       </Animatable.View>
//     );
//   };

//   const renderEmptyState = (type = 'general') => {
//     const messages = {
//       general: {
//         icon: 'camera-off',
//         title: tSafe('no_before_photos_title', 'No Before Photos Yet'),
//         message: tSafe('no_before_photos_message', 'Before photos will appear here once cleaners start documenting their work.')
//       },
//       group: {
//         icon: 'account-group',
//         title: tSafe('no_photos_in_group_title', 'No Photos in This Group'),
//         message: tSafe('no_photos_in_group_message', 'Selected group has no before photos yet.')
//       },
//       room: {
//         icon: 'door-open',
//         title: tSafe('no_photos_in_room_title', 'No Photos in This Room'),
//         message: tSafe('no_photos_in_room_message', 'Selected room has no before photos yet.')
//       }
//     };

//     const { icon, title, message } = messages[type];

//     return (
//       <View style={styles.emptyState}>
//         <MaterialCommunityIcons 
//           name={icon} 
//           size={80} 
//           color={COLORS.light_gray} 
//         />
//         <Text style={styles.emptyStateTitle}>{title}</Text>
//         <Text style={styles.emptyStateText}>{message}</Text>
//       </View>
//     );
//   };

//   const filteredCleaners = getFilteredCleaners();
//   const hasPhotos = filteredCleaners.some(cleaner => getTotalPhotosForCleaner(cleaner) > 0);

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      
//       {isLoading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text style={styles.loadingText}>{tSafe('loading_before_photos', 'Loading before photos...')}</Text>
//         </View>
//       ) : (
//         <View style={styles.content}>
//           {/* Header and Filters - Limited height sections */}
//           <View>
//             <View style={styles.header}>
//               <View style={styles.headerTextContainer}>
//                 <Text style={styles.headerTitle}>{tSafe('before_cleaning', 'Before Cleaning')}</Text>
//                 <Text style={styles.headerSubtitle}>
//                   {tSafe('before_cleaning_subtitle', 'Photos taken before cleaning begins')}
//                 </Text>
//               </View>
//               <View style={styles.summaryBadge}>
//                 <Text style={styles.summaryText}>
//                   {assignedCleaners.length} {assignedCleaners.length === 1 ? tSafe('cleaner', 'cleaner') : tSafe('cleaners', 'cleaners')}
//                 </Text>
//               </View>
//             </View>
  
//             {/* Group Tabs - Limited height */}
//             {getGroups().length > 1 && renderGroupTabs()}
  
//             {/* Room Filter - Limited height */}
//             {renderRoomFilter()}
//           </View>
  
//           {/* Main Content - Takes remaining space */}
//           <View style={styles.mainContentArea}>
//             <ScrollView 
//               showsVerticalScrollIndicator={false}
//               style={styles.cleanersScrollView}
//               contentContainerStyle={styles.cleanersList}
//               onScroll={onScroll}                 // ✅ added
//               scrollEventThrottle={16} 
//             >
//               {hasPhotos ? (
//                 <View style={styles.cleanersContent}>
//                   {filteredCleaners.map((cleaner, index) => 
//                     renderCleanerCard(cleaner, index)
//                   )}
//                 </View>
//               ) : (
//                 renderEmptyState(
//                   selectedGroup !== 'all' ? 'group' : 
//                   selectedRoom !== 'all' ? 'room' : 'general'
//                 )
//               )}
//             </ScrollView>
//           </View>
//         </View>
//       )}
  
//       {/* Image Viewer Modal */}
//       <Modal
//         isVisible={isBeforeModalVisible}
//         style={styles.modal}
//         onBackdropPress={() => setBeforeModalVisible(false)}
//         onSwipeComplete={() => setBeforeModalVisible(false)}
//         swipeDirection={['down']}
//         animationIn="fadeIn"
//         animationOut="fadeOut"
//       >
//         <View style={styles.modalContainer}>
//           <ImageViewer
//             imageUrls={currentImages}
//             index={currentImageIndex}
//             backgroundColor="black"
//             enableSwipeDown
//             enableImageZoom
//             onCancel={() => setBeforeModalVisible(false)}
//             renderHeader={(currentIndex) => (
//               <View style={styles.modalHeader}>
//                 <Text style={styles.modalCounter}>
//                   {currentIndex + 1} / {currentImages.length}
//                 </Text>
//                 <TouchableOpacity 
//                   style={styles.closeButton}
//                   onPress={() => setBeforeModalVisible(false)}
//                 >
//                   <MaterialCommunityIcons name="close" size={24} color="white" />
//                 </TouchableOpacity>
//               </View>
//             )}
//             renderImage={(props) => (
//               <Image
//                 {...props}
//                 style={styles.fullSizeImage}
//                 contentFit="contain"
//                 transition={300}
//               />
//             )}
//           />
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
  
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//   },
//   content: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: COLORS.gray,
//     textAlign: 'center',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     backgroundColor: COLORS.white,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.light_gray_1,
//   },
//   headerTextContainer: {
//     flex: 1,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: COLORS.dark,
//     marginBottom: 4,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: COLORS.gray,
//     lineHeight: 18,
//   },
//   summaryBadge: {
//     backgroundColor: COLORS.primary_light_1,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     marginLeft: 12,
//   },
//   summaryText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },
//   groupTabsContainer: {
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.light_gray_1,
//     backgroundColor: COLORS.white,
//     maxHeight: 60,
//   },
//   groupTabsContent: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//   },
//   groupTab: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     marginRight: 6,
//     backgroundColor: COLORS.light_gray_1,
//     borderRadius: 16,
//   },
//   groupTabActive: {
//     backgroundColor: COLORS.primary,
//   },
//   groupTabText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginRight: 4,
//   },
//   groupTabTextActive: {
//     color: COLORS.white,
//   },
//   groupBadge: {
//     backgroundColor: 'rgba(255,255,255,0.3)',
//     paddingHorizontal: 4,
//     paddingVertical: 1,
//     borderRadius: 8,
//     minWidth: 18,
//     alignItems: 'center',
//   },
//   groupBadgeText: {
//     fontSize: 10,
//     fontWeight: '600',
//     color: COLORS.dark,
//   },
//   roomFilterSection: {
//     paddingHorizontal: 20,
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.light_gray_1,
//     backgroundColor: COLORS.white,
//     maxHeight: 80,
//   },
//   roomFilterTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 6,
//   },
//   roomFilterContainer: {
//     marginHorizontal: -20,
//   },
//   roomFilterContent: {
//     paddingHorizontal: 20,
//   },
//   roomFilterTab: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     marginRight: 6,
//     backgroundColor: COLORS.light_gray_1,
//     borderRadius: 16,
//   },
//   roomFilterTabActive: {
//     backgroundColor: COLORS.secondary,
//   },
//   roomFilterText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: COLORS.dark,
//   },
//   roomFilterTextActive: {
//     color: COLORS.white,
//   },
//   mainContentArea: {
//     flex: 1,
//   },
//   cleanersScrollView: {
//     flex: 1,
//   },
//   cleanersList: {
//     flexGrow: 1,
//     padding: 16,
//   },
//   cleanersContent: {
//     padding: 0,
//   },
//   cleanerCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   cleanerHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   cleanerInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   cleanerAvatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 12,
//   },
//   cleanerDetails: {
//     flex: 1,
//   },
//   cleanerName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: COLORS.dark,
//     marginBottom: 4,
//   },
//   cleanerMeta: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//   },
//   cleanerGroup: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontWeight: '600',
//     marginRight: 8,
//     backgroundColor: COLORS.primary_light_1,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 6,
//   },
//   statusBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 6,
//     backgroundColor: COLORS.light_gray_1,
//   },
//   statusCompleted: {
//     backgroundColor: COLORS.green,
//   },
//   statusInProgress: {
//     backgroundColor: "#FED8B1",
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.dark,
//     textTransform: 'capitalize',
//   },
//   photoCountBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   photoCountText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.white,
//     marginLeft: 4,
//   },
//   roomsContainer: {
//     // Room sections will stack vertically
//   },
//   roomSection: {
//     marginBottom: 20,
//   },
//   roomHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   roomTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     textTransform: 'capitalize',
//   },
//   roomPhotoCount: {
//     fontSize: 14,
//     color: COLORS.gray,
//     fontWeight: '500',
//   },
//   photosScrollView: {
//     marginHorizontal: -16,
//   },
//   photosScrollContent: {
//     paddingHorizontal: 16,
//   },
//   photoCard: {
//     width: 120,
//     height: 120,
//     borderRadius: 8,
//     marginRight: 12,
//     overflow: 'hidden',
//     position: 'relative',
//   },
//   photoImage: {
//     width: '100%',
//     height: '100%',
//     backgroundColor: COLORS.light_gray,
//   },
//   photoOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     opacity: 0,
//   },
//   emptyState: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 40,
//     paddingVertical: 60,
//   },
//   emptyStateTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginTop: 16,
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   emptyStateText: {
//     fontSize: 16,
//     color: COLORS.gray,
//     textAlign: 'center',
//     lineHeight: 22,
//   },
//   modal: {
//     margin: 0,
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'black',
//   },
//   modalHeader: {
//     position: 'absolute',
//     top: 50,
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     zIndex: 1,
//   },
//   modalCounter: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   closeButton: {
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     borderRadius: 20,
//     padding: 10,
//   },
//   fullSizeImage: {
//     width: '100%',
//     height: '100%',
//   },
// });

// export default BeforePhoto;


import React, {
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import ImageViewer from 'react-native-image-zoom-viewer';
import Modal from 'react-native-modal';
import { Image } from 'expo-image';

import { AuthContext } from '../../../context/AuthContext';
import userService from '../../../services/connection/userService';
import formatRoomTitle from '../../../utils/formatRoomTitle';
import { tSafe } from '../../../utils/tSafe';

import { useTheme } from '../../../theme';
import {
  AppText,
  AppCard,
  AppButton,
} from '../../../ui';

const STATUS_CONFIG = {
  completed: {
    label: 'Completed',
    icon: 'check-circle-outline',
    color: 'success',
  },
  in_progress: {
    label: 'In Progress',
    icon: 'progress-clock',
    color: 'info',
  },
  pending: {
    label: 'Pending',
    icon: 'clock-outline',
    color: 'pending',
  },
};

const normalizeArray = (value) =>
  Array.isArray(value) ? value : [];

const getPhotoUrl = (photo) => {
  if (typeof photo === 'string') {
    return photo.trim();
  }

  if (typeof photo?.img_url === 'string') {
    return photo.img_url.trim();
  }

  if (typeof photo?.url === 'string') {
    return photo.url.trim();
  }

  return '';
};

const getCleanerId = (cleaner, index = 0) =>
  String(
    cleaner?.cleanerId ||
    cleaner?.cleaner_id ||
    cleaner?._id ||
    `cleaner-${index}`
  );

const getCleanerName = (cleaner) => {
  const name = [
    cleaner?.firstname,
    cleaner?.lastname,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    name ||
    cleaner?.name ||
    tSafe('cleaner', 'Cleaner')
  );
};

const formatGroupLabel = (group) => {
  if (!group || group === 'all') {
    return tSafe('all_groups', 'All Groups');
  }

  const normalized = String(group)
    .replace(/^group[_\s-]*/i, '')
    .trim();

  if (!normalized) {
    return tSafe('group', 'Group');
  }

  return `${tSafe('group', 'Group')} ${normalized.toUpperCase()}`;
};

const getStatusConfig = (status) => {
  const normalized = String(status || '')
    .trim()
    .toLowerCase();

  if (STATUS_CONFIG[normalized]) {
    return {
      ...STATUS_CONFIG[normalized],
      label: tSafe(
        `status_${normalized}`,
        STATUS_CONFIG[normalized].label
      ),
    };
  }

  const fallbackLabel = normalized
    ? normalized
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    : tSafe('status_unknown', 'Unknown');

  return {
    label: fallbackLabel,
    icon: 'information-outline',
    color: 'pending',
  };
};

const getRoomPhotoEntries = (cleaner) => {
  const beforePhotos = cleaner?.before_photos;

  if (
    !beforePhotos ||
    typeof beforePhotos !== 'object' ||
    Array.isArray(beforePhotos)
  ) {
    return [];
  }

  return Object.entries(beforePhotos)
    .map(([roomName, roomData]) => {
      const photos = normalizeArray(roomData?.photos)
        .map((photo) => ({
          ...(
            typeof photo === 'object' && photo !== null
              ? photo
              : {}
          ),
          img_url: getPhotoUrl(photo),
        }))
        .filter((photo) => Boolean(photo.img_url));

      return [
        roomName,
        {
          ...(roomData || {}),
          photos,
        },
      ];
    })
    .filter(([, roomData]) => roomData.photos.length > 0);
};

const getTotalPhotosForCleaner = (cleaner) =>
  getRoomPhotoEntries(cleaner).reduce(
    (total, [, roomData]) =>
      total + roomData.photos.length,
    0
  );

export default function BeforePhoto({
  scheduleId,
  schedule,
  onScroll,
}) {
  const { currentUserId } = useContext(AuthContext);
  const { theme, isDark } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [assignedCleaners, setAssignedCleaners] = useState([]);

  const [isBeforeModalVisible, setBeforeModalVisible] =
    useState(false);

  const [currentImageIndex, setCurrentImageIndex] =
    useState(0);

  const [currentImages, setCurrentImages] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState('all');

  const styles = useMemo(
    () => createStyles(theme),
    [theme]
  );

  const fetchData = useCallback(
    async ({ silent = false } = {}) => {
      if (!scheduleId) {
        setAssignedCleaners([]);
        setLoadError(
          tSafe(
            'schedule_unavailable',
            'The cleaning schedule could not be identified.'
          )
        );
        setIsLoading(false);
        setRefreshing(false);
        return;
      }

      if (!silent) {
        setIsLoading(true);
      }

      setLoadError('');

      try {
        const response =
          await userService.getUpdatedImageUrls(scheduleId);

        const payload =
          response?.data?.data ??
          response?.data;

        const cleaners = normalizeArray(
          payload?.assignedTo
        );

        setAssignedCleaners(cleaners);
      } catch (error) {
        console.error(
          'Error fetching before photos:',
          error?.response?.data ||
            error?.message ||
            error
        );

        setLoadError(
          tSafe(
            'before_photos_load_error',
            'Unable to load before photos. Please try again.'
          )
        );
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [scheduleId]
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        if (!active) {
          return;
        }

        await fetchData();
      };

      load();

      return () => {
        active = false;
      };
    }, [fetchData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData({ silent: true });
  }, [fetchData]);

  const groups = useMemo(() => {
    const uniqueGroups = [
      ...new Set(
        assignedCleaners
          .map((cleaner) => cleaner?.group)
          .filter(Boolean)
      ),
    ];

    return ['all', ...uniqueGroups];
  }, [assignedCleaners]);

  const filteredCleaners = useMemo(() => {
    if (selectedGroup === 'all') {
      return assignedCleaners;
    }

    return assignedCleaners.filter(
      (cleaner) => cleaner?.group === selectedGroup
    );
  }, [assignedCleaners, selectedGroup]);

  const getTotalPhotosForGroup = useCallback(
    (group) => {
      const cleaners =
        group === 'all'
          ? assignedCleaners
          : assignedCleaners.filter(
              (cleaner) => cleaner?.group === group
            );

      return cleaners.reduce(
        (total, cleaner) =>
          total + getTotalPhotosForCleaner(cleaner),
        0
      );
    },
    [assignedCleaners]
  );

  const rooms = useMemo(() => {
    const uniqueRooms = new Set();

    filteredCleaners.forEach((cleaner) => {
      getRoomPhotoEntries(cleaner).forEach(
        ([roomName]) => uniqueRooms.add(roomName)
      );
    });

    return ['all', ...Array.from(uniqueRooms)];
  }, [filteredCleaners]);

  const openImageViewer = useCallback(
    (photos, index) => {
      const validImages = normalizeArray(photos)
        .map((photo) => ({
          url: getPhotoUrl(photo),
        }))
        .filter((photo) => Boolean(photo.url));

      if (validImages.length === 0) {
        return;
      }

      const safeIndex = Math.min(
        Math.max(index, 0),
        validImages.length - 1
      );

      setCurrentImages(validImages);
      setCurrentImageIndex(safeIndex);
      setBeforeModalVisible(true);
    },
    []
  );

  const closeImageViewer = useCallback(() => {
    setBeforeModalVisible(false);
  }, []);

  const getRoomsToShow = useCallback(
    (cleaner) => {
      const entries = getRoomPhotoEntries(cleaner);

      if (selectedRoom === 'all') {
        return entries;
      }

      return entries.filter(
        ([roomName]) => roomName === selectedRoom
      );
    },
    [selectedRoom]
  );

  const hasPhotos = filteredCleaners.some((cleaner) => {
    return getRoomsToShow(cleaner).some(
      ([, roomData]) => roomData.photos.length > 0
    );
  });

  const getThemeStatusColor = useCallback(
    (colorName) => {
      switch (colorName) {
        case 'success':
          return theme.status.success;
        case 'info':
          return theme.status.info;
        case 'warning':
          return theme.status.warning;
        case 'error':
          return theme.status.error;
        default:
          return theme.status.pending;
      }
    },
    [theme]
  );

  const renderGroupTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.groupTabsContent}
      style={styles.groupTabsContainer}
    >
      {groups.map((group) => {
        const photoCount = getTotalPhotosForGroup(group);

        if (group !== 'all' && photoCount === 0) {
          return null;
        }

        const isActive = selectedGroup === group;

        return (
          <TouchableOpacity
            key={group}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => {
              setSelectedGroup(group);
              setSelectedRoom('all');
            }}
            style={[
              styles.groupTab,
              isActive && styles.groupTabActive,
            ]}
          >
            <AppText
              variant="label"
              color={
                isActive
                  ? theme.button.primaryText
                  : theme.text.secondary
              }
            >
              {formatGroupLabel(group)}
            </AppText>

            <View
              style={[
                styles.groupBadge,
                isActive && styles.groupBadgeActive,
              ]}
            >
              <AppText
                variant="caption"
                color={
                  isActive
                    ? theme.button.primaryText
                    : theme.text.secondary
                }
              >
                {photoCount}
              </AppText>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderRoomFilter = () => {
    if (rooms.length <= 1) {
      return null;
    }

    return (
      <View style={styles.roomFilterSection}>
        <AppText
          variant="label"
          color={theme.text.primary}
          style={styles.roomFilterTitle}
        >
          {tSafe('filter_by_room', 'Filter by room')}
        </AppText>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.roomFilterContent}
        >
          {rooms.map((room) => {
            const isActive = selectedRoom === room;

            return (
              <TouchableOpacity
                key={room}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                onPress={() => setSelectedRoom(room)}
                style={[
                  styles.roomFilterTab,
                  isActive && styles.roomFilterTabActive,
                ]}
              >
                <AppText
                  variant="caption"
                  color={
                    isActive
                      ? theme.button.primaryText
                      : theme.text.secondary
                  }
                  weight="600"
                >
                  {room === 'all'
                    ? tSafe('all_rooms', 'All rooms')
                    : formatRoomTitle(room)}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderRoomSection = (roomName, roomData) => {
    const photos = normalizeArray(roomData?.photos);

    if (photos.length === 0) {
      return null;
    }

    const photoLabel =
      photos.length === 1
        ? tSafe('photo', 'photo')
        : tSafe('photos', 'photos');

    return (
      <View key={roomName} style={styles.roomSection}>
        <View style={styles.roomHeader}>
          <View style={styles.roomTitleContainer}>
            <View style={styles.roomIconContainer}>
              <MaterialCommunityIcons
                name="door-open"
                size={17}
                color={theme.brand.primary}
              />
            </View>

            <AppText
              variant="subtitle"
              color={theme.text.primary}
            >
              {formatRoomTitle(roomName)}
            </AppText>
          </View>

          <View style={styles.roomPhotoCountBadge}>
            <AppText
              variant="caption"
              color={theme.text.secondary}
            >
              {photos.length} {photoLabel}
            </AppText>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photosScrollContent}
        >
          {photos.map((photo, photoIndex) => (
            <TouchableOpacity
              key={`${roomName}-${photoIndex}-${getPhotoUrl(photo)}`}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={`${formatRoomTitle(roomName)} ${tSafe(
                'photo',
                'photo'
              )} ${photoIndex + 1}`}
              onPress={() =>
                openImageViewer(photos, photoIndex)
              }
              style={styles.photoCard}
            >
              <Image
                source={{ uri: getPhotoUrl(photo) }}
                style={styles.photoImage}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />

              <View style={styles.photoOverlay}>
                <View style={styles.zoomIcon}>
                  <MaterialCommunityIcons
                    name="magnify-plus-outline"
                    size={20}
                    color="#FFFFFF"
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderCleanerCard = (cleaner, index) => {
    const roomsToShow = getRoomsToShow(cleaner);

    const totalPhotos = roomsToShow.reduce(
      (total, [, roomData]) =>
        total + roomData.photos.length,
      0
    );

    if (totalPhotos === 0) {
      return null;
    }

    const cleanerName = getCleanerName(cleaner);
    const cleanerId = getCleanerId(cleaner, index);
    const status = getStatusConfig(cleaner.status);
    const statusColor = getThemeStatusColor(status.color);

    const groupLabel = cleaner?.group
      ? formatGroupLabel(cleaner.group)
      : tSafe('group_not_assigned', 'No group assigned');

    const avatarUrl =
      typeof cleaner?.avatar === 'string'
        ? cleaner.avatar.trim()
        : '';

    return (
      <Animatable.View
        key={cleanerId}
        animation="fadeInUp"
        duration={350}
        delay={Math.min(index * 70, 280)}
        useNativeDriver
      >
        <AppCard
          bordered
          padding="medium"
          radius="large"
          style={styles.cleanerCard}
        >
          <View style={styles.cleanerHeader}>
            <View style={styles.cleanerInfo}>
              <View style={styles.avatarContainer}>
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.cleanerAvatar}
                    contentFit="cover"
                    transition={150}
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <MaterialCommunityIcons
                      name="account"
                      size={26}
                      color={theme.icon.muted}
                    />
                  </View>
                )}
              </View>

              <View style={styles.cleanerDetails}>
                <AppText
                  variant="subtitle"
                  color={theme.text.primary}
                  numberOfLines={2}
                >
                  {cleanerName}
                </AppText>

                <AppText
                  variant="caption"
                  color={theme.text.secondary}
                  style={styles.cleanerGroup}
                  numberOfLines={1}
                >
                  {groupLabel}
                </AppText>
              </View>
            </View>

            <View style={styles.photoCountBadge}>
              <MaterialCommunityIcons
                name="camera-outline"
                size={16}
                color={theme.button.primaryText}
              />

              <AppText
                variant="label"
                color={theme.button.primaryText}
              >
                {totalPhotos}
              </AppText>
            </View>
          </View>

          <View style={styles.cleanerStatusRow}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: statusColor },
              ]}
            />

            <MaterialCommunityIcons
              name={status.icon}
              size={16}
              color={statusColor}
            />

            <AppText
              variant="caption"
              color={statusColor}
              weight="600"
            >
              {status.label}
            </AppText>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.roomsContainer}>
            {roomsToShow.map(([roomName, roomData]) =>
              renderRoomSection(roomName, roomData)
            )}
          </View>
        </AppCard>
      </Animatable.View>
    );
  };

  const renderEmptyState = () => {
    let icon = 'camera-off-outline';
    let title = tSafe(
      'no_before_photos_title',
      'No before photos yet'
    );
    let message = tSafe(
      'no_before_photos_message',
      'Before photos will appear here when cleaners document the property before cleaning.'
    );

    if (loadError) {
      icon = 'cloud-alert';
      title = tSafe(
        'before_photos_unavailable',
        'Photos unavailable'
      );
      message = loadError;
    } else if (selectedGroup !== 'all' && !hasPhotos) {
      icon = 'account-group-outline';
      title = tSafe(
        'no_photos_in_group_title',
        'No photos in this group'
      );
      message = tSafe(
        'no_photos_in_group_message',
        'This group has no before photos available yet.'
      );
    } else if (selectedRoom !== 'all' && !hasPhotos) {
      icon = 'door-closed';
      title = tSafe(
        'no_photos_in_room_title',
        'No photos in this room'
      );
      message = tSafe(
        'no_photos_in_room_message',
        'No before photos are available for the selected room.'
      );
    }

    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <MaterialCommunityIcons
            name={icon}
            size={42}
            color={
              loadError
                ? theme.status.error
                : theme.brand.primary
            }
          />
        </View>

        <AppText
          variant="heading"
          color={theme.text.primary}
          align="center"
          style={styles.emptyStateTitle}
        >
          {title}
        </AppText>

        <AppText
          variant="body"
          color={theme.text.secondary}
          align="center"
          style={styles.emptyStateText}
        >
          {message}
        </AppText>

        {loadError ? (
          <AppButton
            title={tSafe('try_again', 'Try again')}
            onPress={() => fetchData()}
            icon="refresh"
            style={styles.retryButton}
          />
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.background.default}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <AppText
              variant="display"
              color={theme.text.primary}
            >
              {tSafe('before_cleaning', 'Before cleaning')}
            </AppText>

            <AppText
              variant="body"
              color={theme.text.secondary}
              style={styles.headerSubtitle}
            >
              {tSafe(
                'before_cleaning_subtitle',
                'Review photos taken before cleaning begins.'
              )}
            </AppText>
          </View>

          <View style={styles.summaryBadge}>
            <MaterialCommunityIcons
              name="account-group-outline"
              size={18}
              color={theme.brand.primary}
            />

            <AppText
              variant="bodyMedium"
              color={theme.brand.primary}
              weight="600"
            >
              {assignedCleaners.length}
            </AppText>
          </View>
        </View>

        <View style={styles.summaryTextRow}>
          <View style={styles.summaryDot} />

          <AppText
            variant="caption"
            color={theme.text.secondary}
          >
            {assignedCleaners.length === 1
              ? tSafe('cleaner_assigned', '1 cleaner assigned')
              : tSafe(
                  'cleaners_assigned_count',
                  `${assignedCleaners.length} cleaners assigned`
                )}
          </AppText>
        </View>

        {groups.length > 1 && renderGroupTabs()}

        {renderRoomFilter()}

        <View style={styles.mainContentArea}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={theme.brand.primary}
              />

              <AppText
                variant="body"
                color={theme.text.secondary}
                style={styles.loadingText}
              >
                {tSafe(
                  'loading_before_photos',
                  'Loading before photos...'
                )}
              </AppText>
            </View>
          ) : (
            <ScrollView
              style={styles.cleanersScrollView}
              contentContainerStyle={styles.cleanersList}
              showsVerticalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={theme.brand.primary}
                  colors={[theme.brand.primary]}
                  progressBackgroundColor={theme.surface.elevated}
                />
              }
            >
              {hasPhotos ? (
                <View style={styles.cleanersContent}>
                  {filteredCleaners.map(
                    (cleaner, index) =>
                      renderCleanerCard(cleaner, index)
                  )}
                </View>
              ) : (
                renderEmptyState()
              )}
            </ScrollView>
          )}
        </View>
      </View>

      <Modal
        isVisible={isBeforeModalVisible}
        style={styles.modal}
        onBackdropPress={closeImageViewer}
        onBackButtonPress={closeImageViewer}
        onSwipeComplete={closeImageViewer}
        swipeDirection={['down']}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropOpacity={0.95}
        useNativeDriver
        hideModalContentWhileAnimating
      >
        <View style={styles.modalContainer}>
          <ImageViewer
            imageUrls={currentImages}
            index={currentImageIndex}
            backgroundColor="#000000"
            enableSwipeDown
            enableImageZoom
            saveToLocalByLongPress={false}
            onChange={(index) => {
              if (typeof index === 'number') {
                setCurrentImageIndex(index);
              }
            }}
            onCancel={closeImageViewer}
            renderHeader={(currentIndex = currentImageIndex) => (
              <View style={styles.modalHeader}>
                <View style={styles.modalCounterContainer}>
                  <MaterialCommunityIcons
                    name="image-multiple-outline"
                    size={17}
                    color="#FFFFFF"
                  />

                  <AppText
                    variant="bodyMedium"
                    color="#FFFFFF"
                  >
                    {Math.max(
                      0,
                      Number(currentIndex) || 0
                    ) + 1}{' '}
                    / {currentImages.length}
                  </AppText>
                </View>

                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={tSafe(
                    'close_image_viewer',
                    'Close image viewer'
                  )}
                  onPress={closeImageViewer}
                  style={styles.closeButton}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={23}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
            )}
            renderImage={(props) => (
              <Image
                source={props?.source}
                style={styles.fullSizeImage}
                contentFit="contain"
                transition={150}
              />
            )}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    content: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 10,
    },

    headerTextContainer: {
      flex: 1,
      paddingRight: 12,
    },

    headerSubtitle: {
      marginTop: 5,
      lineHeight: 20,
    },

    summaryBadge: {
      minWidth: 58,
      minHeight: 44,
      paddingHorizontal: 12,
      borderRadius: 15,
      backgroundColor: theme.surface.selected,
      borderWidth: 1,
      borderColor: theme.border.default,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
    },

    summaryTextRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 21,
      paddingBottom: 14,
      gap: 7,
    },

    summaryDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: theme.status.success,
    },

    groupTabsContainer: {
      maxHeight: 58,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border.default,
      backgroundColor: theme.background.elevated,
    },

    groupTabsContent: {
      paddingHorizontal: 16,
      paddingVertical: 9,
      alignItems: 'center',
      gap: 8,
    },

    groupTab: {
      minHeight: 36,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 12,
      backgroundColor: theme.surface.default,
      borderWidth: 1,
      borderColor: theme.border.default,
      gap: 7,
    },

    groupTabActive: {
      backgroundColor: theme.brand.primary,
      borderColor: theme.brand.primary,
    },

    groupBadge: {
      minWidth: 21,
      height: 21,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
      backgroundColor: theme.background.sunken,
    },

    groupBadgeActive: {
      backgroundColor: 'rgba(255,255,255,0.22)',
    },

    roomFilterSection: {
      paddingTop: 13,
      paddingBottom: 12,
      backgroundColor: theme.background.default,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border.default,
    },

    roomFilterTitle: {
      paddingHorizontal: 20,
      marginBottom: 9,
    },

    roomFilterContent: {
      paddingHorizontal: 16,
      gap: 8,
    },

    roomFilterTab: {
      minHeight: 34,
      justifyContent: 'center',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 11,
      borderWidth: 1,
      borderColor: theme.border.default,
      backgroundColor: theme.surface.default,
    },

    roomFilterTabActive: {
      backgroundColor: theme.brand.secondary,
      borderColor: theme.brand.secondary,
    },

    mainContentArea: {
      flex: 1,
      minHeight: 0,
    },

    cleanersScrollView: {
      flex: 1,
    },

    cleanersList: {
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 36,
    },

    cleanersContent: {
      gap: 14,
    },

    cleanerCard: {
      backgroundColor: theme.card.background,
      borderColor: theme.card.border,
    },

    cleanerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },

    cleanerInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 0,
    },

    avatarContainer: {
      width: 49,
      height: 49,
      borderRadius: 25,
      overflow: 'hidden',
      backgroundColor: theme.surface.selected,
      marginRight: 11,
    },

    cleanerAvatar: {
      width: '100%',
      height: '100%',
    },

    avatarFallback: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },

    cleanerDetails: {
      flex: 1,
      minWidth: 0,
    },

    cleanerGroup: {
      marginTop: 4,
    },

    photoCountBadge: {
      minHeight: 34,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 11,
      backgroundColor: theme.brand.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
    },

    cleanerStatusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 13,
      gap: 6,
    },

    statusIndicator: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },

    cardDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.divider,
      marginTop: 15,
      marginBottom: 16,
    },

    roomsContainer: {
      gap: 20,
    },

    roomSection: {
      marginBottom: 2,
    },

    roomHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      gap: 8,
    },

    roomTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 8,
    },

    roomIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: theme.surface.selected,
      alignItems: 'center',
      justifyContent: 'center',
    },

    roomPhotoCountBadge: {
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 9,
      backgroundColor: theme.background.sunken,
    },

    photosScrollContent: {
      paddingRight: 4,
      gap: 10,
    },

    photoCard: {
      width: 126,
      height: 126,
      borderRadius: 14,
      overflow: 'hidden',
      backgroundColor: theme.surface.selected,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    photoImage: {
      width: '100%',
      height: '100%',
    },

    photoOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      padding: 8,
      backgroundColor: 'rgba(0,0,0,0.08)',
    },

    zoomIcon: {
      width: 30,
      height: 30,
      borderRadius: 10,
      backgroundColor: 'rgba(0,0,0,0.48)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },

    loadingText: {
      marginTop: 13,
    },

    emptyState: {
      flexGrow: 1,
      minHeight: 300,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 28,
      paddingVertical: 45,
    },

    emptyIconContainer: {
      width: 88,
      height: 88,
      borderRadius: 27,
      backgroundColor: theme.surface.selected,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },

    emptyStateTitle: {
      marginBottom: 10,
    },

    emptyStateText: {
      lineHeight: 22,
      maxWidth: 340,
    },

    retryButton: {
      marginTop: 22,
    },

    modal: {
      margin: 0,
    },

    modalContainer: {
      flex: 1,
      backgroundColor: '#000000',
    },

    modalHeader: {
      position: 'absolute',
      top: 48,
      left: 0,
      right: 0,
      zIndex: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
    },

    modalCounterContainer: {
      minHeight: 38,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.15)',
      gap: 8,
    },

    closeButton: {
      width: 42,
      height: 42,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.18)',
    },

    fullSizeImage: {
      width: '100%',
      height: '100%',
    },
  });