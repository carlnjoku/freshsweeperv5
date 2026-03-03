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
//   Dimensions,
//   Animated,
//   FlatList
// } from 'react-native';
// import COLORS from '../../../constants/colors';
// import userService from '../../../services/connection/userService';
// import { AuthContext } from '../../../context/AuthContext';
// import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
// import * as Animatable from 'react-native-animatable';
// import ImageViewer from 'react-native-image-zoom-viewer';
// import Modal from 'react-native-modal';
// import { Image } from 'expo-image';
// import CircularProgress from 'react-native-circular-progress-indicator';
// import formatRoomTitle from '../../../utils/formatRoomTitle';

// const { width: screenWidth } = Dimensions.get('window');



// const AfterPhoto = ({ scheduleId, schedule }) => {
//   const { currentUserId } = useContext(AuthContext);
//   const [isLoading, setIsLoading] = useState(false);
//   const [assignedCleaners, setAssignedCleaners] = useState([]);
//   const [isAfterModalVisible, setAfterModalVisible] = useState(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [currentImages, setCurrentImages] = useState([]);
//   const [selectedGroup, setSelectedGroup] = useState('all');
//   const [selectedRoom, setSelectedRoom] = useState('all');
//   const [isDragging, setIsDragging] = useState(false);

//   const pan = useState(new Animated.ValueXY())[0];
//   const overlayOpacity = useState(new Animated.Value(1))[0];

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
//           console.log('Error fetching after photos:', error);
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
//       if (cleaner.completed_tasks) {
//         Object.keys(cleaner.completed_tasks).forEach(room => {
//           if (cleaner.completed_tasks[room].photos?.length > 0 || cleaner.completed_tasks[room].tasks?.length > 0) {
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

//   const getCleanlinessIcon = (invertedScore) => {
//     if (invertedScore <= 35) return 'times';
//     if (invertedScore <= 40) return 'exclamation';
//     return 'check';
//   };

//   const getTotalPhotosForCleaner = (cleaner) => {
//     if (!cleaner.completed_tasks) return 0;
//     return Object.values(cleaner.completed_tasks).reduce((total, room) => 
//       total + (room.photos?.length || 0), 0
//     );
//   };

//   const getTotalPhotosForGroup = (group) => {
//     const groupCleaners = group === 'all' ? assignedCleaners : assignedCleaners.filter(c => c.group === group);
//     return groupCleaners.reduce((total, cleaner) => total + getTotalPhotosForCleaner(cleaner), 0);
//   };

//   const openImageViewer = (images, index, category) => {
//     pan.setValue({ x: 0, y: 0 });
//     overlayOpacity.setValue(1);

//     const formattedImages = images.map(photo => {
//       const cleanliness = photo.cleanliness || {};
//       const score = invertPercentage(cleanliness.individual_overall || 0);
//       const status = getCleanlinessLabel(score);
      
//       return {
//         url: status === "Very Clean" ? photo.img_url : cleanliness.heatmap_url || photo.img_url,
//         cleanliness: cleanliness,
//         props: {
//           source: { uri: status === "Very Clean" ? photo.img_url : cleanliness.heatmap_url || photo.img_url }
//         },
//         category: category
//       };
//     });

//     setCurrentImages(formattedImages);
//     setCurrentImageIndex(index);
//     setAfterModalVisible(true);
//   };

//   // Render task checkbox with labels
//   const renderTask = ({item}) => (
//     <View style={styles.taskContainer}>
//       <Text key={item.id} style={styles.taskText}>
//         <FontAwesome 
//           name={item.value ? "check" : "times"} 
//           size={12} 
//           color={item.value ? COLORS.success : COLORS.error} 
//         /> {item.label}
//       </Text>
//     </View>
//   );

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
//                 {room === 'all' ? 'All Rooms' : formatRoomTitle(room)}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>
//     );
//   };

//   const renderRoomSection = (cleaner, roomName, roomData) => {
//     const hasPhotos = roomData.photos?.length > 0;
//     const hasTasks = roomData.tasks?.length > 0;

//     if (!hasPhotos && !hasTasks) return null;

//     return (
//       <View key={roomName} style={styles.roomSection}>
//         <View style={styles.roomHeader}>
//           <Text style={styles.roomTitle}>
//             {formatRoomTitle(roomName)}
//           </Text>
//           <Text style={styles.roomPhotoCount}>
//             {roomData.photos?.length || 0} photo{(roomData.photos?.length || 0) !== 1 ? 's' : ''}
//           </Text>
//         </View>
        
//         {/* Photos Section */}
//         {hasPhotos && (
//           <ScrollView 
//             horizontal 
//             showsHorizontalScrollIndicator={false}
//             style={styles.photosScrollView}
//             contentContainerStyle={styles.photosScrollContent}
//           >
//             {roomData.photos.map((photo, photoIndex) => {
//               const cleanliness = photo.cleanliness || {};
//               const invertedIndividualScore = invertPercentage(cleanliness.individual_overall || 0);

//               return (
//                 <TouchableOpacity
//                   key={photoIndex}
//                   style={styles.photoCard}
//                   onPress={() => openImageViewer(roomData.photos, photoIndex, roomName)}
//                 >
//                   <Image 
//                     source={{ uri: photo.img_url }} 
//                     style={styles.photoImage}
//                     contentFit="cover"
//                     transition={300}
//                   />
//                   <View style={[styles.cleanlinessBadge, { 
//                     backgroundColor: getCleanlinessColor(invertedIndividualScore) 
//                   }]}>
//                     <FontAwesome 
//                       name={getCleanlinessIcon(invertedIndividualScore)} 
//                       size={14}
//                       color="white" 
//                     />
//                   </View>
//                   <View style={styles.photoOverlay}>
//                     <MaterialCommunityIcons name="magnify-plus-outline" size={20} color="white" />
//                   </View>
//                 </TouchableOpacity>
//               );
//             })}
//           </ScrollView>
//         )}

//         {/* Tasks Section */}
//         {hasTasks && (
//           <View style={styles.tasksContainer}>
//             <Text style={styles.tasksTitle}>Completed Tasks:</Text>
//             <FlatList
//               data={roomData.tasks}
//               renderItem={renderTask}
//               keyExtractor={item => item.id.toString()}
//               numColumns={2}
//               columnWrapperStyle={styles.columnWrapper}
//               scrollEnabled={false}
//             />
//           </View>
//         )}
//       </View>
//     );
//   };

//     const renderCleanlinessAnalysis = () => {
//     if (!currentImages[currentImageIndex]?.cleanliness) return null;

//     const cleanlinessData = currentImages[currentImageIndex].cleanliness;
//     const individualOverall = cleanlinessData.individual_overall || 0;
//     const invertedIndividualScore = invertPercentage(individualOverall);
    
//     const category = currentImages[currentImageIndex].category;
//     const categoryPhotos = getFilteredCleaners().flatMap(cleaner => 
//       cleaner.completed_tasks?.[category]?.photos || []
//     );
//     const categoryTotal = categoryPhotos.reduce((sum, photo) => 
//       sum + (photo.cleanliness?.individual_overall || 0), 0);
//     const categoryAverage = categoryPhotos.length > 0 ? 
//       categoryTotal / categoryPhotos.length : 0;
//     const invertedCategoryScore = invertPercentage(categoryAverage);

//     return (
//       <View style={styles.analysisContainer}>
//         <View style={styles.dragHandle} />
//         <View style={styles.cleanlinessDetails}>
//           <Text style={styles.detailHeader}>CLEANLINESS ANALYSIS</Text>
          
//           {/* Individual Score Section */}
//           <View style={styles.scoreSection}>
//             <Text style={styles.sectionTitle}>THIS PHOTO</Text>
//             <View style={styles.scoreRow}>
//               <View style={styles.scoreTextContainer}>
//                 <Text style={styles.percentageText}>
//                   {invertedIndividualScore.toFixed(0)}%
//                 </Text>
//                 <Text style={[styles.statusText, { 
//                   color: getCleanlinessColor(invertedIndividualScore) 
//                 }]}>
//                   {getCleanlinessLabel(invertedIndividualScore)}
//                 </Text>
//               </View>
//               <CircularProgress
//                 value={invertedIndividualScore}
//                 radius={40}
//                 activeStrokeColor={getCleanlinessColor(invertedIndividualScore)}
//                 inActiveStrokeColor="#2d2d2d"
//                 maxValue={100}
//                 duration={1000}
//                 valueSuffix={'%'}
//               />
//             </View>
//           </View>

//           {/* Top Issues Section */}
//           <Text style={styles.sectionTitle}>MAIN ISSUES</Text>
//           <View style={styles.factorsContainer}>
//             {Object.entries(cleanlinessData.scores || {})
//               .sort(([,a], [,b]) => b - a)
//               .slice(0, 3)
//               .map(([factor, score]) => (
//                 <View key={factor} style={styles.factorItem}>
//                   <Text style={styles.factorName}>
//                     {factor.replace(/_/g, ' ').toUpperCase()}
//                   </Text>
//                   <Text style={[styles.factorScore, { 
//                     color: getCleanlinessColor(100 - (score * 10)) 
//                   }]}>
//                     {(100 - (score * 10)).toFixed(0)}%
//                   </Text>
//                 </View>
//               ))}
//           </View>
//         </View>
//       </View>
//     );
//   };

//   const renderCleanerCard = (cleaner, index) => {
//     const totalPhotos = getTotalPhotosForCleaner(cleaner);
//     const hasCompletedTasks = cleaner.completed_tasks && Object.values(cleaner.completed_tasks).some(room => 
//       room.photos?.length > 0 || room.tasks?.length > 0
//     );
    
//     if (!hasCompletedTasks) return null;

//     // Filter rooms based on selection
//     const roomsToShow = selectedRoom === 'all' 
//       ? Object.entries(cleaner.completed_tasks || {})
//       : [[selectedRoom, cleaner.completed_tasks?.[selectedRoom]]].filter(([_, data]) => 
//           data?.photos?.length || data?.tasks?.length
//         );

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

//         {/* Room Sections with Horizontal Photo Lists and Tasks */}
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
//         title: 'No After Photos Yet',
//         message: 'After photos and completed tasks will appear here once cleaners complete their work.'
//       },
//       group: {
//         icon: 'account-group',
//         title: 'No Photos in This Group',
//         message: 'Selected group has no after photos or completed tasks yet.'
//       },
//       room: {
//         icon: 'door-open',
//         title: 'No Photos in This Room',
//         message: 'Selected room has no after photos or completed tasks yet.'
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
//   const hasContent = filteredCleaners.some(cleaner => 
//     cleaner.completed_tasks && Object.values(cleaner.completed_tasks).some(room => 
//       room.photos?.length > 0 || room.tasks?.length > 0
//     )
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      
//       {isLoading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text style={styles.loadingText}>Loading after photos...</Text>
//         </View>
//       ) : (
//         <View style={styles.content}>
//           {/* Header and Filters - Limited height sections */}
//           <View style={styles.header}>
//                <View style={styles.headerTextContainer}>
//                  <Text style={styles.headerTitle}>After Cleaning</Text>
//                  <Text style={styles.headerSubtitle}>
//                    Photos taken after cleaning is completed
//                  </Text>
//                </View>
//                <View style={styles.summaryBadge}>
//                  <Text style={styles.summaryText}>
//                    {assignedCleaners.length} cleaner{assignedCleaners.length !== 1 ? 's' : ''}
//                  </Text>
//                </View>
//              </View>
//           <View>
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
//               {hasContent ? (
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

//       {/* Image Viewer Modal with Cleanliness Analysis */}
//       <Modal
//         isVisible={isAfterModalVisible}
//         style={styles.modal}
//         onBackdropPress={() => setAfterModalVisible(false)}
//         onSwipeComplete={() => setAfterModalVisible(false)}
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
//             onCancel={() => setAfterModalVisible(false)}
//             onChange={(index) => setCurrentImageIndex(index)}
//             renderHeader={() => (
//               <TouchableOpacity 
//                 style={styles.closeButton}
//                 onPress={() => setAfterModalVisible(false)}
//               >
//                 <MaterialCommunityIcons name="close" size={24} color="white" />
//               </TouchableOpacity>
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
//           {renderCleanlinessAnalysis()}
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
//     header: {
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
//   },
//   cleanersContent: {
//     padding: 16,
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
//     backgroundColor: COLORS.success,
//   },
//   statusInProgress: {
//     backgroundColor: COLORS.warning,
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
//     marginBottom: 12,
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
//   cleanlinessBadge: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
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
//   tasksContainer: {
//     marginTop: 8,
//   },
//   tasksTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 8,
//   },
//   taskContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//     flex: 1,
//   },
//   taskText: {
//     marginLeft: 4,
//     fontSize: 12,
//     color: COLORS.gray,
//   },
//   columnWrapper: {
//     justifyContent: 'space-between',
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
//   closeButton: {
//     position: 'absolute',
//     top: 50,
//     right: 20,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     borderRadius: 20,
//     padding: 10,
//     zIndex: 1,
//   },
//   fullSizeImage: {
//     width: '100%',
//     height: '100%',
//   },
//   analysisContainer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: 'rgba(0,0,0,0.85)',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     padding: 16,
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
//   cleanlinessDetails: {
//     gap: 20,
//   },
//   detailHeader: {
//     color: 'white',
//     fontSize: 20,
//     fontWeight: '800',
//     marginBottom: 24,
//     textAlign: 'center',
//     letterSpacing: 0.5,
//   },
//   scoreSection: {
//     marginBottom: 16,
//   },
//   scoreRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   scoreTextContainer: {
//     flex: 1,
//     marginRight: 16,
//   },
//   percentageText: {
//     color: 'white',
//     fontSize: 36,
//     fontWeight: '700',
//     marginBottom: 4,
//   },

//   sectionTitle: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '700',
//     marginBottom: 12,
//     letterSpacing: 0.5,
//   },
//   factorsContainer: {
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     borderRadius: 12,
//     padding: 8,
//   },
//   factorItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(255,255,255,0.1)',
//   },
//   factorName: {
//     color: 'white',
//     fontSize: 14,
//     flex: 2,
//   },
//   factorScore: {
//     fontSize: 14,
//     fontWeight: '600',
//     flex: 1,
//     textAlign: 'right',
//   },
// });

// export default AfterPhoto;






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
  Dimensions,
  Animated,
  FlatList
} from 'react-native';
import COLORS from '../../../constants/colors';
import userService from '../../../services/connection/userService';
import { AuthContext } from '../../../context/AuthContext';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import ImageViewer from 'react-native-image-zoom-viewer';
import Modal from 'react-native-modal';
import { Image } from 'expo-image';
import CircularProgress from 'react-native-circular-progress-indicator';
import formatRoomTitle from '../../../utils/formatRoomTitle';

const { width: screenWidth } = Dimensions.get('window');

// Simple non-recursive helper functions
const getAllTasksForCleaner = (cleaner) => {
  const allTasks = {};
  
  if (!cleaner || !cleaner.checklist || !cleaner.checklist.details) {
    return allTasks;
  }
  
  Object.keys(cleaner.checklist.details).forEach(roomName => {
    const roomData = cleaner.checklist.details[roomName];
    const hasPhotos = Array.isArray(roomData.photos) && roomData.photos.length > 0;
    const hasTasks = Array.isArray(roomData.tasks) && roomData.tasks.length > 0;
    
    if (!hasPhotos && !hasTasks) return;
    
    const completedTasks = roomData.tasks?.filter(task => task.value === true) || [];
    const pendingTasks = roomData.tasks?.filter(task => task.value === false) || [];
    
    // Determine room status
    let roomStatus = 'not_started';
    if (completedTasks.length > 0 && pendingTasks.length === 0) {
      roomStatus = 'completed';
    } else if (completedTasks.length > 0 || hasPhotos) {
      roomStatus = 'in_progress';
    }
    
    allTasks[roomName] = {
      photos: roomData.photos || [],
      tasks: completedTasks,
      pending_tasks: pendingTasks,
      status: roomStatus,
      total_tasks: roomData.tasks?.length || 0,
      completed_tasks: completedTasks.length
    };
  });
  
  return allTasks;
};

const getTotalPhotosForCleaner = (cleaner) => {
  let total = 0;
  
  if (!cleaner || !cleaner.checklist || !cleaner.checklist.details) {
    return total;
  }
  
  Object.values(cleaner.checklist.details).forEach(roomData => {
    if (Array.isArray(roomData.photos)) {
      total += roomData.photos.length;
    }
  });
  
  return total;
};

const getCleanerProgressStatus = (cleaner) => {
  const allTasks = getAllTasksForCleaner(cleaner);
  const totalRooms = Object.keys(allTasks).length;
  
  if (totalRooms === 0) return 'not_started';
  
  const completedRooms = Object.values(allTasks).filter(room => 
    room.status === 'completed'
  ).length;
  
  if (completedRooms === totalRooms) return 'completed';
  if (completedRooms > 0) return 'partially_completed';
  return 'in_progress';
};

const AfterPhoto = ({ scheduleId, schedule }) => {
  const { currentUserId } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [assignedCleaners, setAssignedCleaners] = useState([]);
  const [isAfterModalVisible, setAfterModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [isDragging, setIsDragging] = useState(false);

  const pan = useState(new Animated.ValueXY())[0];
  const overlayOpacity = useState(new Animated.Value(1))[0];

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
              // Directly set the cleaners without recursive processing
              setAssignedCleaners(res.assignedTo);
            }
          }
        } catch (error) {
          console.log('Error fetching after photos:', error);
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
      const allTasks = getAllTasksForCleaner(cleaner);
      Object.keys(allTasks).forEach(room => {
        if (allTasks[room].photos?.length > 0 || allTasks[room].tasks?.length > 0) {
          rooms.add(room);
        }
      });
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

  const getCleanlinessIcon = (invertedScore) => {
    if (invertedScore <= 35) return 'times';
    if (invertedScore <= 40) return 'exclamation';
    return 'check';
  };

  const getTotalPhotosForGroup = (group) => {
    const groupCleaners = group === 'all' ? assignedCleaners : assignedCleaners.filter(c => c.group === group);
    return groupCleaners.reduce((total, cleaner) => total + getTotalPhotosForCleaner(cleaner), 0);
  };

  const openImageViewer = (images, index, category) => {
    pan.setValue({ x: 0, y: 0 });
    overlayOpacity.setValue(1);

    const formattedImages = images.map(photo => {
      const cleanliness = photo.cleanliness || {};
      const score = invertPercentage(cleanliness.individual_overall || 0);
      const status = getCleanlinessLabel(score);
      
      return {
        url: status === "Very Clean" ? photo.img_url : cleanliness.heatmap_url || photo.img_url,
        cleanliness: cleanliness,
        props: {
          source: { uri: status === "Very Clean" ? photo.img_url : cleanliness.heatmap_url || photo.img_url }
        },
        category: category
      };
    });

    setCurrentImages(formattedImages);
    setCurrentImageIndex(index);
    setAfterModalVisible(true);
  };

  // Render task checkbox with labels
  const renderTask = ({item}) => (
    <View style={styles.taskContainer}>
      <Text key={item.id} style={styles.taskText}>
        <FontAwesome 
          name={item.value ? "check" : "times"} 
          size={12} 
          color={item.value ? COLORS.success : COLORS.error} 
        /> {item.label}
      </Text>
    </View>
  );

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
              {group === 'all' ? 'All Groups' : group.replace('_', ' ').toUpperCase()}
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
        <Text style={styles.roomFilterTitle}>Filter by Room:</Text>
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
                {room === 'all' ? 'All Rooms' : formatRoomTitle(room)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderRoomSection = (cleaner, roomName, roomData) => {
    const hasPhotos = roomData.photos?.length > 0;
    const hasTasks = roomData.tasks?.length > 0;

    if (!hasPhotos && !hasTasks) return null;

    return (
      <View key={roomName} style={styles.roomSection}>
        <View style={styles.roomHeader}>
          <Text style={styles.roomTitle}>
            {formatRoomTitle(roomName)}
          </Text>
          <Text style={styles.roomPhotoCount}>
            {roomData.photos?.length || 0} photo{(roomData.photos?.length || 0) !== 1 ? 's' : ''}
          </Text>
        </View>
        
        {/* Photos Section */}
        {hasPhotos && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.photosScrollView}
            contentContainerStyle={styles.photosScrollContent}
          >
            {roomData.photos.map((photo, photoIndex) => {
              const cleanliness = photo.cleanliness || {};
              const invertedIndividualScore = invertPercentage(cleanliness.individual_overall || 0);

              return (
                <TouchableOpacity
                  key={photoIndex}
                  style={styles.photoCard}
                  onPress={() => openImageViewer(roomData.photos, photoIndex, roomName)}
                >
                  <Image 
                    source={{ uri: photo.img_url }} 
                    style={styles.photoImage}
                    contentFit="cover"
                    transition={300}
                  />
                  <View style={[styles.cleanlinessBadge, { 
                    backgroundColor: getCleanlinessColor(invertedIndividualScore) 
                  }]}>
                    <FontAwesome 
                      name={getCleanlinessIcon(invertedIndividualScore)} 
                      size={14}
                      color="white" 
                    />
                  </View>
                  <View style={styles.photoOverlay}>
                    <MaterialCommunityIcons name="magnify-plus-outline" size={20} color="white" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Tasks Section */}
        {hasTasks && (
          <View style={styles.tasksContainer}>
            <Text style={styles.tasksTitle}>Completed Tasks:</Text>
            <FlatList
              data={roomData.tasks}
              renderItem={renderTask}
              keyExtractor={item => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              scrollEnabled={false}
            />
          </View>
        )}
      </View>
    );
  };

    const renderCleanlinessAnalysis = () => {
    if (!currentImages[currentImageIndex]?.cleanliness) return null;

    const cleanlinessData = currentImages[currentImageIndex].cleanliness;
    const individualOverall = cleanlinessData.individual_overall || 0;
    const invertedIndividualScore = invertPercentage(individualOverall);
    
    const category = currentImages[currentImageIndex].category;
    const categoryPhotos = getFilteredCleaners().flatMap(cleaner => {
      const allTasks = getAllTasksForCleaner(cleaner);
      return allTasks[category]?.photos || [];
    });
    const categoryTotal = categoryPhotos.reduce((sum, photo) => 
      sum + (photo.cleanliness?.individual_overall || 0), 0);
    const categoryAverage = categoryPhotos.length > 0 ? 
      categoryTotal / categoryPhotos.length : 0;
    const invertedCategoryScore = invertPercentage(categoryAverage);

    return (
      <View style={styles.analysisContainer}>
        <View style={styles.dragHandle} />
        <View style={styles.cleanlinessDetails}>
          <Text style={styles.detailHeader}>CLEANLINESS ANALYSIS</Text>
          
          {/* Individual Score Section */}
          <View style={styles.scoreSection}>
            <Text style={styles.sectionTitle}>THIS PHOTO</Text>
            <View style={styles.scoreRow}>
              <View style={styles.scoreTextContainer}>
                <Text style={styles.percentageText}>
                  {invertedIndividualScore.toFixed(0)}%
                </Text>
                <Text style={[styles.statusText, { 
                  color: getCleanlinessColor(invertedIndividualScore) 
                }]}>
                  {getCleanlinessLabel(invertedIndividualScore)}
                </Text>
              </View>
              <CircularProgress
                value={invertedIndividualScore}
                radius={40}
                activeStrokeColor={getCleanlinessColor(invertedIndividualScore)}
                inActiveStrokeColor="#2d2d2d"
                maxValue={100}
                duration={1000}
                valueSuffix={'%'}
              />
            </View>
          </View>

          {/* Top Issues Section */}
          <Text style={styles.sectionTitle}>MAIN ISSUES</Text>
          <View style={styles.factorsContainer}>
            {Object.entries(cleanlinessData.scores || {})
              .sort(([,a], [,b]) => b - a)
              .slice(0, 3)
              .map(([factor, score]) => (
                <View key={factor} style={styles.factorItem}>
                  <Text style={styles.factorName}>
                    {factor.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                  <Text style={[styles.factorScore, { 
                    color: getCleanlinessColor(100 - (score * 10)) 
                  }]}>
                    {(100 - (score * 10)).toFixed(0)}%
                  </Text>
                </View>
              ))}
          </View>
        </View>
      </View>
    );
  };

  const renderCleanerCard = (cleaner, index) => {
    const allTasks = getAllTasksForCleaner(cleaner);
    const totalPhotos = getTotalPhotosForCleaner(cleaner);
    const progressStatus = getCleanerProgressStatus(cleaner);
    
    const hasAnyData = Object.values(allTasks).some(room => 
      room.photos?.length > 0 || room.tasks?.length > 0
    );
    
    if (!hasAnyData) return null;

    // Filter rooms based on selection
    const roomsToShow = selectedRoom === 'all' 
      ? Object.entries(allTasks)
      : [[selectedRoom, allTasks[selectedRoom]]].filter(([_, data]) => 
          data?.photos?.length || data?.tasks?.length
        );

    if (roomsToShow.length === 0) return null;

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
                <Text style={styles.cleanerGroup}>{cleaner.group.replace('_', ' ').toUpperCase()}</Text>
                <View style={[
                  styles.statusBadge,
                  progressStatus === 'completed' && styles.statusCompleted,
                  progressStatus === 'in_progress' && styles.statusInProgress,
                  progressStatus === 'partially_completed' && styles.statusPartiallyCompleted
                ]}>
                  <Text style={styles.statusText}>
                    {progressStatus.replace('_', ' ')}
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

        {/* Room Sections with Horizontal Photo Lists and Tasks */}
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
        title: 'No After Photos Yet',
        message: 'After photos and completed tasks will appear here once cleaners complete their work.'
      },
      group: {
        icon: 'account-group',
        title: 'No Photos in This Group',
        message: 'Selected group has no after photos or completed tasks yet.'
      },
      room: {
        icon: 'door-open',
        title: 'No Photos in This Room',
        message: 'Selected room has no after photos or completed tasks yet.'
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
  const hasContent = filteredCleaners.some(cleaner => {
    const allTasks = getAllTasksForCleaner(cleaner);
    return Object.values(allTasks).some(room => 
      room.photos?.length > 0 || room.tasks?.length > 0
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading after photos...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Header and Filters - Limited height sections */}
          <View style={styles.header}>
               <View style={styles.headerTextContainer}>
                 <Text style={styles.headerTitle}>After Cleaning</Text>
                 <Text style={styles.headerSubtitle}>
                   Photos taken after cleaning is completed
                 </Text>
               </View>
               <View style={styles.summaryBadge}>
                 <Text style={styles.summaryText}>
                   {assignedCleaners.length} cleaner{assignedCleaners.length !== 1 ? 's' : ''}
                 </Text>
               </View>
             </View>
          <View>
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
              {hasContent ? (
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

      {/* Image Viewer Modal with Cleanliness Analysis */}
      <Modal
        isVisible={isAfterModalVisible}
        style={styles.modal}
        onBackdropPress={() => setAfterModalVisible(false)}
        onSwipeComplete={() => setAfterModalVisible(false)}
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
            onCancel={() => setAfterModalVisible(false)}
            onChange={(index) => setCurrentImageIndex(index)}
            renderHeader={() => (
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setAfterModalVisible(false)}
              >
                <MaterialCommunityIcons name="close" size={24} color="white" />
              </TouchableOpacity>
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
          {renderCleanlinessAnalysis()}
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
  },
  cleanersContent: {
    padding: 16,
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
    backgroundColor: COLORS.success,
  },
  statusInProgress: {
    backgroundColor: COLORS.warning,
  },
  statusPartiallyCompleted: {
    backgroundColor: COLORS.info,
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
    marginBottom: 12,
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
  cleanlinessBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
  tasksContainer: {
    marginTop: 8,
  },
  tasksTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flex: 1,
  },
  taskText: {
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.gray,
  },
  columnWrapper: {
    justifyContent: 'space-between',
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
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 10,
    zIndex: 1,
  },
  fullSizeImage: {
    width: '100%',
    height: '100%',
  },
  analysisContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
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
  cleanlinessDetails: {
    gap: 20,
  },
  detailHeader: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  scoreSection: {
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  percentageText: {
    color: 'white',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
  },

  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  factorsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 8,
  },
  factorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  factorName: {
    color: 'white',
    fontSize: 14,
    flex: 2,
  },
  factorScore: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
});

export default AfterPhoto;