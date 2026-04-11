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


import React, { useContext, useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  StatusBar, 
  ScrollView, 
  View, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions
} from 'react-native';
import COLORS from '../../../constants/colors';
import userService from '../../../services/connection/userService';
import { AuthContext } from '../../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import ImageViewer from 'react-native-image-zoom-viewer';
import Modal from 'react-native-modal';
import { Image } from 'expo-image';
import formatRoomTitle from '../../../utils/formatRoomTitle';
import { tSafe } from '../../../utils/tSafe'; // added import

const { width: screenWidth } = Dimensions.get('window');

// Helper to translate statuses
const getTranslatedStatus = (status) => {
  switch (status) {
    case 'completed': return tSafe('status_completed', 'Completed');
    case 'in_progress': return tSafe('status_in_progress', 'In Progress');
    default: return status?.replace('_', ' ') || status;
  }
};

const BeforePhoto = ({ scheduleId, schedule }) => {
  const { currentUserId } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [assignedCleaners, setAssignedCleaners] = useState([]);
  const [isBeforeModalVisible, setBeforeModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState('all');

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const fetchData = async () => {
        try {
          setIsLoading(true);
          const response = await userService.getUpdatedImageUrls(scheduleId);
          if (isMounted) {
            const res = response.data.data;
            
            if (res.assignedTo && Array.isArray(res.assignedTo)) {
              setAssignedCleaners(res.assignedTo);
            }
          }
        } catch (error) {
          console.log('Error fetching before photos:', error);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

      fetchData();

      return () => {
        isMounted = false;
      };
    }, [scheduleId])
  );

  // Get unique groups
  const getGroups = () => {
    const groups = new Set(assignedCleaners.map(cleaner => cleaner.group));
    return ['all', ...Array.from(groups)];
  };

  // Get all unique rooms across filtered cleaners
  const getAllRooms = () => {
    const rooms = new Set();
    getFilteredCleaners().forEach(cleaner => {
      if (cleaner.before_photos) {
        Object.keys(cleaner.before_photos).forEach(room => {
          if (cleaner.before_photos[room].photos?.length > 0) {
            rooms.add(room);
          }
        });
      }
    });
    return ['all', ...Array.from(rooms)];
  };

  // Filter cleaners based on selected group
  const getFilteredCleaners = () => {
    if (selectedGroup === 'all') {
      return assignedCleaners;
    }
    return assignedCleaners.filter(cleaner => cleaner.group === selectedGroup);
  };

  const openImageViewer = (images, index) => {
    const formattedImages = images.map(photo => ({
      url: photo.img_url,
      props: {
        source: { uri: photo.img_url }
      }
    }));
    setCurrentImages(formattedImages);
    setCurrentImageIndex(index);
    setBeforeModalVisible(true);
  };

  const getTotalPhotosForCleaner = (cleaner) => {
    if (!cleaner.before_photos) return 0;
    return Object.values(cleaner.before_photos).reduce((total, room) => 
      total + (room.photos?.length || 0), 0
    );
  };

  const getTotalPhotosForGroup = (group) => {
    const groupCleaners = group === 'all' ? assignedCleaners : assignedCleaners.filter(c => c.group === group);
    return groupCleaners.reduce((total, cleaner) => total + getTotalPhotosForCleaner(cleaner), 0);
  };

  // Helper to format group label
  const formatGroupLabel = (group) => {
    if (group === 'all') return tSafe('all_groups', 'All Groups');
    const groupNumber = group.replace('group_', '');
    return `${tSafe('group', 'Group')} ${groupNumber}`;
  };

  const renderGroupTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.groupTabsContainer}
      contentContainerStyle={styles.groupTabsContent}
    >
      {getGroups().map(group => {
        const photoCount = getTotalPhotosForGroup(group);
        if (photoCount === 0 && group !== 'all') return null;
        
        const label = formatGroupLabel(group);
        
        return (
          <TouchableOpacity
            key={group}
            style={[
              styles.groupTab,
              selectedGroup === group && styles.groupTabActive
            ]}
            onPress={() => {
              setSelectedGroup(group);
              setSelectedRoom('all');
            }}
          >
            <Text style={[
              styles.groupTabText,
              selectedGroup === group && styles.groupTabTextActive
            ]}>
              {label}
            </Text>
            <View style={styles.groupBadge}>
              <Text style={styles.groupBadgeText}>
                {photoCount}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderRoomFilter = () => {
    const rooms = getAllRooms();
    if (rooms.length <= 1) return null;
  
    return (
      <View style={styles.roomFilterSection}>
        <Text style={styles.roomFilterTitle}>{tSafe('filter_by_room', 'Filter by Room:')}</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.roomFilterContainer}
          contentContainerStyle={styles.roomFilterContent}
        >
          {rooms.map(room => (
            <TouchableOpacity
              key={room}
              style={[
                styles.roomFilterTab,
                selectedRoom === room && styles.roomFilterTabActive
              ]}
              onPress={() => setSelectedRoom(room)}
            >
              <Text style={[
                styles.roomFilterText,
                selectedRoom === room && styles.roomFilterTextActive
              ]}>
                {room === 'all' ? tSafe('all_rooms', 'All Rooms') : formatRoomTitle(room)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderRoomSection = (cleaner, roomName, roomData) => {
    if (!roomData.photos?.length) return null;

    const photoCount = roomData.photos.length;
    const photoLabel = photoCount === 1 ? tSafe('photo', 'photo') : tSafe('photos', 'photos');

    return (
      <View key={roomName} style={styles.roomSection}>
        <View style={styles.roomHeader}>
          <Text style={styles.roomTitle}>
            {formatRoomTitle(roomName)}
          </Text>
          <Text style={styles.roomPhotoCount}>
            {photoCount} {photoLabel}
          </Text>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.photosScrollView}
          contentContainerStyle={styles.photosScrollContent}
        >
          {roomData.photos.map((photo, photoIndex) => (
            <TouchableOpacity
              key={photoIndex}
              style={styles.photoCard}
              onPress={() => openImageViewer(roomData.photos, photoIndex)}
            >
              <Image 
                source={{ uri: photo.img_url }} 
                style={styles.photoImage}
                contentFit="cover"
                transition={300}
              />
              <View style={styles.photoOverlay}>
                <MaterialCommunityIcons name="magnify-plus-outline" size={20} color="white" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderCleanerCard = (cleaner, index) => {
    const totalPhotos = getTotalPhotosForCleaner(cleaner);
    
    if (totalPhotos === 0) return null;

    // Filter rooms based on selection
    const roomsToShow = selectedRoom === 'all' 
      ? Object.entries(cleaner.before_photos || {})
      : [[selectedRoom, cleaner.before_photos?.[selectedRoom]]].filter(([_, data]) => data?.photos?.length);

    if (roomsToShow.length === 0) return null;

    const translatedStatus = getTranslatedStatus(cleaner.status);
    const groupLabel = `${tSafe('group', 'Group')} ${cleaner.group.replace('group_', '')}`;

    return (
      <Animatable.View 
        key={`${cleaner.cleanerId}-${index}`}
        style={styles.cleanerCard}
        animation="fadeInUp"
        duration={600}
        delay={index * 200}
      >
        {/* Cleaner Header */}
        <View style={styles.cleanerHeader}>
          <View style={styles.cleanerInfo}>
            <Image 
              source={{ uri: cleaner.avatar }} 
              style={styles.cleanerAvatar}
              contentFit="cover"
            />
            <View style={styles.cleanerDetails}>
              <Text style={styles.cleanerName}>
                {cleaner.firstname} {cleaner.lastname}
              </Text>
              <View style={styles.cleanerMeta}>
                <Text style={styles.cleanerGroup}>{groupLabel}</Text>
                <View style={[
                  styles.statusBadge,
                  cleaner.status === 'completed' && styles.statusCompleted,
                  cleaner.status === 'in_progress' && styles.statusInProgress
                ]}>
                  <Text style={styles.statusText}>
                    {translatedStatus}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.photoCountBadge}>
            <MaterialCommunityIcons name="camera" size={16} color={COLORS.white} />
            <Text style={styles.photoCountText}>{totalPhotos}</Text>
          </View>
        </View>

        {/* Room Sections with Horizontal Photo Lists */}
        <View style={styles.roomsContainer}>
          {roomsToShow.map(([roomName, roomData]) => 
            renderRoomSection(cleaner, roomName, roomData)
          )}
        </View>
      </Animatable.View>
    );
  };

  const renderEmptyState = (type = 'general') => {
    const messages = {
      general: {
        icon: 'camera-off',
        title: tSafe('no_before_photos_title', 'No Before Photos Yet'),
        message: tSafe('no_before_photos_message', 'Before photos will appear here once cleaners start documenting their work.')
      },
      group: {
        icon: 'account-group',
        title: tSafe('no_photos_in_group_title', 'No Photos in This Group'),
        message: tSafe('no_photos_in_group_message', 'Selected group has no before photos yet.')
      },
      room: {
        icon: 'door-open',
        title: tSafe('no_photos_in_room_title', 'No Photos in This Room'),
        message: tSafe('no_photos_in_room_message', 'Selected room has no before photos yet.')
      }
    };

    const { icon, title, message } = messages[type];

    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons 
          name={icon} 
          size={80} 
          color={COLORS.light_gray} 
        />
        <Text style={styles.emptyStateTitle}>{title}</Text>
        <Text style={styles.emptyStateText}>{message}</Text>
      </View>
    );
  };

  const filteredCleaners = getFilteredCleaners();
  const hasPhotos = filteredCleaners.some(cleaner => getTotalPhotosForCleaner(cleaner) > 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{tSafe('loading_before_photos', 'Loading before photos...')}</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Header and Filters - Limited height sections */}
          <View>
            <View style={styles.header}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>{tSafe('before_cleaning', 'Before Cleaning')}</Text>
                <Text style={styles.headerSubtitle}>
                  {tSafe('before_cleaning_subtitle', 'Photos taken before cleaning begins')}
                </Text>
              </View>
              <View style={styles.summaryBadge}>
                <Text style={styles.summaryText}>
                  {assignedCleaners.length} {assignedCleaners.length === 1 ? tSafe('cleaner', 'cleaner') : tSafe('cleaners', 'cleaners')}
                </Text>
              </View>
            </View>
  
            {/* Group Tabs - Limited height */}
            {getGroups().length > 1 && renderGroupTabs()}
  
            {/* Room Filter - Limited height */}
            {renderRoomFilter()}
          </View>
  
          {/* Main Content - Takes remaining space */}
          <View style={styles.mainContentArea}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              style={styles.cleanersScrollView}
              contentContainerStyle={styles.cleanersList}
            >
              {hasPhotos ? (
                <View style={styles.cleanersContent}>
                  {filteredCleaners.map((cleaner, index) => 
                    renderCleanerCard(cleaner, index)
                  )}
                </View>
              ) : (
                renderEmptyState(
                  selectedGroup !== 'all' ? 'group' : 
                  selectedRoom !== 'all' ? 'room' : 'general'
                )
              )}
            </ScrollView>
          </View>
        </View>
      )}
  
      {/* Image Viewer Modal */}
      <Modal
        isVisible={isBeforeModalVisible}
        style={styles.modal}
        onBackdropPress={() => setBeforeModalVisible(false)}
        onSwipeComplete={() => setBeforeModalVisible(false)}
        swipeDirection={['down']}
        animationIn="fadeIn"
        animationOut="fadeOut"
      >
        <View style={styles.modalContainer}>
          <ImageViewer
            imageUrls={currentImages}
            index={currentImageIndex}
            backgroundColor="black"
            enableSwipeDown
            enableImageZoom
            onCancel={() => setBeforeModalVisible(false)}
            renderHeader={(currentIndex) => (
              <View style={styles.modalHeader}>
                <Text style={styles.modalCounter}>
                  {currentIndex + 1} / {currentImages.length}
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setBeforeModalVisible(false)}
                >
                  <MaterialCommunityIcons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            )}
            renderImage={(props) => (
              <Image
                {...props}
                style={styles.fullSizeImage}
                contentFit="contain"
                transition={300}
              />
            )}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light_gray_1,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 18,
  },
  summaryBadge: {
    backgroundColor: COLORS.primary_light_1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  groupTabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light_gray_1,
    backgroundColor: COLORS.white,
    maxHeight: 60,
  },
  groupTabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  groupTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    backgroundColor: COLORS.light_gray_1,
    borderRadius: 16,
  },
  groupTabActive: {
    backgroundColor: COLORS.primary,
  },
  groupTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.dark,
    marginRight: 4,
  },
  groupTabTextActive: {
    color: COLORS.white,
  },
  groupBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 18,
    alignItems: 'center',
  },
  groupBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.dark,
  },
  roomFilterSection: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light_gray_1,
    backgroundColor: COLORS.white,
    maxHeight: 80,
  },
  roomFilterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 6,
  },
  roomFilterContainer: {
    marginHorizontal: -20,
  },
  roomFilterContent: {
    paddingHorizontal: 20,
  },
  roomFilterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    backgroundColor: COLORS.light_gray_1,
    borderRadius: 16,
  },
  roomFilterTabActive: {
    backgroundColor: COLORS.secondary,
  },
  roomFilterText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.dark,
  },
  roomFilterTextActive: {
    color: COLORS.white,
  },
  mainContentArea: {
    flex: 1,
  },
  cleanersScrollView: {
    flex: 1,
  },
  cleanersList: {
    flexGrow: 1,
    padding: 16,
  },
  cleanersContent: {
    padding: 0,
  },
  cleanerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cleanerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cleanerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cleanerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  cleanerDetails: {
    flex: 1,
  },
  cleanerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  cleanerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  cleanerGroup: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 8,
    backgroundColor: COLORS.primary_light_1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: COLORS.light_gray_1,
  },
  statusCompleted: {
    backgroundColor: COLORS.green,
  },
  statusInProgress: {
    backgroundColor: "#FED8B1",
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.dark,
    textTransform: 'capitalize',
  },
  photoCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  photoCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 4,
  },
  roomsContainer: {
    // Room sections will stack vertically
  },
  roomSection: {
    marginBottom: 20,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    textTransform: 'capitalize',
  },
  roomPhotoCount: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  photosScrollView: {
    marginHorizontal: -16,
  },
  photosScrollContent: {
    paddingHorizontal: 16,
  },
  photoCard: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.light_gray,
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  modal: {
    margin: 0,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  modalHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  modalCounter: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 10,
  },
  fullSizeImage: {
    width: '100%',
    height: '100%',
  },
});

export default BeforePhoto;