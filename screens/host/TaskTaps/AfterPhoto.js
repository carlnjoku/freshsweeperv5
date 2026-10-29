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

// // Simple non-recursive helper functions
// const getAllTasksForCleaner = (cleaner) => {
//   const allTasks = {};
  
//   if (!cleaner || !cleaner.checklist || !cleaner.checklist.details) {
//     return allTasks;
//   }
  
//   Object.keys(cleaner.checklist.details).forEach(roomName => {
//     const roomData = cleaner.checklist.details[roomName];
//     const hasPhotos = Array.isArray(roomData.photos) && roomData.photos.length > 0;
//     const hasTasks = Array.isArray(roomData.tasks) && roomData.tasks.length > 0;
    
//     if (!hasPhotos && !hasTasks) return;
    
//     const completedTasks = roomData.tasks?.filter(task => task.value === true) || [];
//     const pendingTasks = roomData.tasks?.filter(task => task.value === false) || [];
    
//     // Determine room status
//     let roomStatus = 'not_started';
//     if (completedTasks.length > 0 && pendingTasks.length === 0) {
//       roomStatus = 'completed';
//     } else if (completedTasks.length > 0 || hasPhotos) {
//       roomStatus = 'in_progress';
//     }
    
//     allTasks[roomName] = {
//       photos: roomData.photos || [],
//       tasks: completedTasks,
//       pending_tasks: pendingTasks,
//       status: roomStatus,
//       total_tasks: roomData.tasks?.length || 0,
//       completed_tasks: completedTasks.length
//     };
//   });
  
//   return allTasks;
// };

// const getTotalPhotosForCleaner = (cleaner) => {
//   let total = 0;
  
//   if (!cleaner || !cleaner.checklist || !cleaner.checklist.details) {
//     return total;
//   }
  
//   Object.values(cleaner.checklist.details).forEach(roomData => {
//     if (Array.isArray(roomData.photos)) {
//       total += roomData.photos.length;
//     }
//   });
  
//   return total;
// };

// const getCleanerProgressStatus = (cleaner) => {
//   const allTasks = getAllTasksForCleaner(cleaner);
//   const totalRooms = Object.keys(allTasks).length;
  
//   if (totalRooms === 0) return 'not_started';
  
//   const completedRooms = Object.values(allTasks).filter(room => 
//     room.status === 'completed'
//   ).length;
  
//   if (completedRooms === totalRooms) return 'completed';
//   if (completedRooms > 0) return 'partially_completed';
//   return 'in_progress';
// };

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
//               // Directly set the cleaners without recursive processing
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
//       const allTasks = getAllTasksForCleaner(cleaner);
//       Object.keys(allTasks).forEach(room => {
//         if (allTasks[room].photos?.length > 0 || allTasks[room].tasks?.length > 0) {
//           rooms.add(room);
//         }
//       });
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
//     const categoryPhotos = getFilteredCleaners().flatMap(cleaner => {
//       const allTasks = getAllTasksForCleaner(cleaner);
//       return allTasks[category]?.photos || [];
//     });
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
//     const allTasks = getAllTasksForCleaner(cleaner);
//     const totalPhotos = getTotalPhotosForCleaner(cleaner);
//     const progressStatus = getCleanerProgressStatus(cleaner);
    
//     const hasAnyData = Object.values(allTasks).some(room => 
//       room.photos?.length > 0 || room.tasks?.length > 0
//     );
    
//     if (!hasAnyData) return null;

//     // Filter rooms based on selection
//     const roomsToShow = selectedRoom === 'all' 
//       ? Object.entries(allTasks)
//       : [[selectedRoom, allTasks[selectedRoom]]].filter(([_, data]) => 
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
//                   progressStatus === 'completed' && styles.statusCompleted,
//                   progressStatus === 'in_progress' && styles.statusInProgress,
//                   progressStatus === 'partially_completed' && styles.statusPartiallyCompleted
//                 ]}>
//                   <Text style={styles.statusText}>
//                     {progressStatus.replace('_', ' ')}
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
//   const hasContent = filteredCleaners.some(cleaner => {
//     const allTasks = getAllTasksForCleaner(cleaner);
//     return Object.values(allTasks).some(room => 
//       room.photos?.length > 0 || room.tasks?.length > 0
//     );
//   });

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
//   statusPartiallyCompleted: {
//     backgroundColor: COLORS.info,
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
//   FlatList,
//   Alert
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
// import { tSafe } from '../../../utils/tSafe';

// const { width: screenWidth } = Dimensions.get('window');

// // Simple non-recursive helper functions
// const getAllTasksForCleaner = (cleaner) => {
//   const allTasks = {};
  
//   if (!cleaner || !cleaner.checklist || !cleaner.checklist.details) {
//     return allTasks;
//   }
  
//   Object.keys(cleaner.checklist.details).forEach(roomName => {
//     const roomData = cleaner.checklist.details[roomName];
//     const hasPhotos = Array.isArray(roomData.photos) && roomData.photos.length > 0;
//     const hasTasks = Array.isArray(roomData.tasks) && roomData.tasks.length > 0;
    
//     if (!hasPhotos && !hasTasks) return;
    
//     const completedTasks = roomData.tasks?.filter(task => task.value === true) || [];
//     const pendingTasks = roomData.tasks?.filter(task => task.value === false) || [];
    
//     // Determine room status
//     let roomStatus = 'not_started';
//     if (completedTasks.length > 0 && pendingTasks.length === 0) {
//       roomStatus = 'completed';
//     } else if (completedTasks.length > 0 || hasPhotos) {
//       roomStatus = 'in_progress';
//     }
    
//     allTasks[roomName] = {
//       photos: roomData.photos || [],
//       tasks: completedTasks,
//       pending_tasks: pendingTasks,
//       status: roomStatus,
//       total_tasks: roomData.tasks?.length || 0,
//       completed_tasks: completedTasks.length
//     };
//   });
  
//   return allTasks;
// };

// const getTotalPhotosForCleaner = (cleaner) => {
//   let total = 0;
  
//   if (!cleaner || !cleaner.checklist || !cleaner.checklist.details) {
//     return total;
//   }
  
//   Object.values(cleaner.checklist.details).forEach(roomData => {
//     if (Array.isArray(roomData.photos)) {
//       total += roomData.photos.length;
//     }
//   });
  
//   return total;
// };

// const getCleanerProgressStatus = (cleaner) => {
//   const allTasks = getAllTasksForCleaner(cleaner);
//   const totalRooms = Object.keys(allTasks).length;
  
//   if (totalRooms === 0) return 'not_started';
  
//   const completedRooms = Object.values(allTasks).filter(room => 
//     room.status === 'completed'
//   ).length;
  
//   if (completedRooms === totalRooms) return 'completed';
//   if (completedRooms > 0) return 'partially_completed';
//   return 'in_progress';
// };


// // Helper to translate progress status
// const getTranslatedProgressStatus = (status) => {
//   switch (status) {
//     case 'not_started': return tSafe('status_not_started', 'Not Started');
//     case 'in_progress': return tSafe('status_in_progress', 'In Progress');
//     case 'completed': return tSafe('status_completed', 'Completed');
//     case 'partially_completed': return tSafe('status_partially_completed', 'Partially Completed');
//     default: return status;
//   }
// };

// // Helper to translate cleanliness labels
// const getCleanlinessLabel = (invertedScore) => {
//   if (invertedScore <= 35) return tSafe('needs_deep_cleaning', 'Needs Deep Cleaning');
//   if (invertedScore <= 40) return tSafe('requires_attention', 'Requires Attention');
//   return tSafe('very_clean', 'Very Clean');
// };

// const getCleanlinessColor = (invertedScore) => {
//   if (invertedScore <= 35) return '#e74c3c';
//   if (invertedScore <= 40) return '#f1c40f';
//   return '#2ecc71';
// };

// const getCleanlinessIcon = (invertedScore) => {
//   if (invertedScore <= 35) return 'times';
//   if (invertedScore <= 40) return 'exclamation';
//   return 'check';
// };

// const AfterPhoto = ({ scheduleId, schedule, onScroll,   mode, isReviewMode = false, cleanerId }) => {
//   const { currentUserId } = useContext(AuthContext);
//   const [isLoading, setIsLoading] = useState(false);
//   const [assignedCleaners, setAssignedCleaners] = useState([]);
//   const [isAfterModalVisible, setAfterModalVisible] = useState(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [currentImages, setCurrentImages] = useState([]);
//   const [selectedGroup, setSelectedGroup] = useState('all');
//   const [selectedRoom, setSelectedRoom] = useState('all');
//   const [isDragging, setIsDragging] = useState(false);


//   const [showRejectModal, setShowRejectModal] = useState(false);
//   const [selectedRejectReason, setSelectedRejectReason] = useState(null);
//   const [customRejectReason, setCustomRejectReason] = useState('');

//   const [selectedCleanerId, setSelectedCleanerId] = useState(null);

//   const pan = useState(new Animated.ValueXY())[0];
//   const overlayOpacity = useState(new Animated.Value(1))[0];

//   const rejectReasons = [
//     tSafe('reject_reason_no_show', 'No Show'),
//     tSafe('reject_reason_came_late', 'Came Late'),
//     tSafe('reject_reason_cleaning_concerns', 'Cleaning Concerns'),
//     tSafe('reject_reason_damaged_property', 'Damaged Property'),
//     tSafe('reject_reason_other', 'Other'),
//   ];

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
//       const allTasks = getAllTasksForCleaner(cleaner);
//       Object.keys(allTasks).forEach(room => {
//         if (allTasks[room].photos?.length > 0 || allTasks[room].tasks?.length > 0) {
//           rooms.add(room);
//         }
//       });
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

//   // ─── Review handlers ───────────────────────────────────────────
//   // const handleApprove = async () => {
//   //   try {
//   //     const data = {"scheduleId":scheduleId, "cleanerId":cleanerId } 
//   //     await userService.approveWork(data);
//   //     Alert.alert(tSafe('success', 'Success'), tSafe('work_approved', 'Work approved! Payment will be released.'));
//   //     navigation.goBack();
//   //   } catch (error) {
//   //     Alert.alert(tSafe('error', 'Error'), tSafe('approval_failed', 'Could not approve work.'));
//   //   }
//   // };

//   const handleApprove = async (cleanerId) => {
//     try {
//       await userService.approveWork({ scheduleId, cleanerId });
//       Alert.alert(tSafe('success', 'Success'), tSafe('work_approved', 'Work approved! Payment will be released.'));
//       // Optionally refresh the data
//       fetchData();
//     } catch (error) {
//       Alert.alert(tSafe('error', 'Error'), tSafe('approval_failed', 'Could not approve work.'));
//     }
//   };

//   // const handleReject = () => {
//   //   setShowRejectModal(true);
//   // };

//   const handleReject = (cleanerId) => {
//     setSelectedCleanerId(cleanerId); // store which cleaner we're rejecting
//     setShowRejectModal(true);
//   };

//   // const confirmReject = async () => {
//   //   if (!selectedRejectReason) {
//   //     Alert.alert(tSafe('error', 'Error'), tSafe('please_select_reason', 'Please select a reason for rejection.'));
//   //     return;
//   //   }
//   //   const reason = selectedRejectReason === tSafe('reject_reason_other', 'Other')
//   //     ? customRejectReason.trim() || selectedRejectReason
//   //     : selectedRejectReason;
  
//   //   try {
//   //     await userService.rejectWork({ scheduleId, cleanerId, reason });
//   //     Alert.alert(tSafe('success', 'Success'), tSafe('work_rejected', 'Work rejected.'));
//   //     navigation.goBack();
//   //   } catch (error) {
//   //     Alert.alert(tSafe('error', 'Error'), tSafe('reject_failed', 'Could not reject work.'));
//   //   } finally {
//   //     setShowRejectModal(false);
//   //     setSelectedRejectReason(null);
//   //     setCustomRejectReason('');
//   //   }
//   // };

//   const confirmReject = async () => {
//     if (!selectedRejectReason) {
//       Alert.alert(tSafe('error', 'Error'), tSafe('please_select_reason', 'Please select a reason for rejection.'));
//       return;
//     }
//     const reason = selectedRejectReason === tSafe('reject_reason_other', 'Other')
//       ? customRejectReason.trim() || selectedRejectReason
//       : selectedRejectReason;
  
//     try {
//       await userService.rejectWork({ scheduleId, cleanerId: selectedCleanerId, reason });
//       Alert.alert(tSafe('success', 'Success'), tSafe('work_rejected', 'Work rejected.'));
//       // Refresh data
//       fetchData();
//     } catch (error) {
//       Alert.alert(tSafe('error', 'Error'), tSafe('reject_failed', 'Could not reject work.'));
//     } finally {
//       setShowRejectModal(false);
//       setSelectedRejectReason(null);
//       setCustomRejectReason('');
//       setSelectedCleanerId(null);
//     }
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
        
//         let displayName;
//         if (group === 'all') {
//           displayName = tSafe('all_groups', 'All Groups');
//         } else {
//           const groupNumber = group.replace('group_', '');
//           displayName = `${tSafe('group', 'Group')} ${groupNumber}`;
//         }
        
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
//               {displayName}
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

//   // const renderRoomSection = (cleaner, roomName, roomData) => {
//   //   const hasPhotos = roomData.photos?.length > 0;
//   //   const hasTasks = roomData.tasks?.length > 0;

//   //   if (!hasPhotos && !hasTasks) return null;

//   //   const photoCount = roomData.photos?.length || 0;
//   //   const photoLabel = photoCount === 1 ? tSafe('photo', 'photo') : tSafe('photos', 'photos');

//   //   return (
//   //     <View key={roomName} style={styles.roomSection}>
//   //       <View style={styles.roomHeader}>
//   //         <Text style={styles.roomTitle}>
//   //           {formatRoomTitle(roomName)}
//   //         </Text>
//   //         <Text style={styles.roomPhotoCount}>
//   //           {photoCount} {photoLabel}
//   //         </Text>
//   //       </View>
        
//   //       {/* Photos Section */}
//   //       {hasPhotos && (
//   //         <ScrollView 
//   //           horizontal 
//   //           showsHorizontalScrollIndicator={false}
//   //           style={styles.photosScrollView}
//   //           contentContainerStyle={styles.photosScrollContent}
//   //         >
//   //           {roomData.photos.map((photo, photoIndex) => {
//   //             const cleanliness = photo.cleanliness || {};
//   //             const invertedIndividualScore = invertPercentage(cleanliness.individual_overall || 0);

//   //             return (
//   //               <TouchableOpacity
//   //                 key={photoIndex}
//   //                 style={styles.photoCard}
//   //                 onPress={() => openImageViewer(roomData.photos, photoIndex, roomName)}
//   //               >
//   //                 <Image 
//   //                   source={{ uri: photo.img_url }} 
//   //                   style={styles.photoImage}
//   //                   contentFit="cover"
//   //                   transition={300}
//   //                 />
//   //                 <View style={[styles.cleanlinessBadge, { 
//   //                   backgroundColor: getCleanlinessColor(invertedIndividualScore) 
//   //                 }]}>
//   //                   <FontAwesome 
//   //                     name={getCleanlinessIcon(invertedIndividualScore)} 
//   //                     size={14}
//   //                     color="white" 
//   //                   />
//   //                 </View>
//   //                 <View style={styles.photoOverlay}>
//   //                   <MaterialCommunityIcons name="magnify-plus-outline" size={20} color="white" />
//   //                 </View>
//   //               </TouchableOpacity>
//   //             );
//   //           })}
//   //         </ScrollView>
//   //       )}

//   //       {/* Tasks Section */}
//   //       {hasTasks && (
//   //         <View style={styles.tasksContainer}>
//   //           <Text style={styles.tasksTitle}>{tSafe('completed_tasks', 'Completed Tasks:')}</Text>
//   //           <FlatList
//   //             data={roomData.tasks}
//   //             renderItem={renderTask}
//   //             keyExtractor={item => item.id.toString()}
//   //             numColumns={2}
//   //             columnWrapperStyle={styles.columnWrapper}
//   //             scrollEnabled={false}
//   //           />
//   //         </View>
//   //       )}
//   //     </View>
//   //   );
//   // };

//   const renderRoomSection = (cleaner, roomName, roomData) => {
//     const hasPhotos = roomData.photos?.length > 0;
//     const hasTasks = roomData.tasks?.length > 0;
//     const completedTasks = roomData.tasks?.filter(task => task.value === true) || [];
//     const hasProgress = hasPhotos || completedTasks.length > 0;
  
//     // ✅ Placeholder for rooms with no progress
//     if (!hasProgress) {
//       return (
//         <View key={roomName} style={styles.roomSection}>
//           <View style={styles.roomHeader}>
//             <Text style={styles.roomTitle}>{formatRoomTitle(roomName)}</Text>
//             <View style={styles.notStartedBadge}>
//               <Text style={styles.notStartedBadgeText}>{tSafe('not_started', 'Not Started')}</Text>
//             </View>
//           </View>
//           <View style={styles.placeholderContainer}>
//             <MaterialCommunityIcons name="clock-outline" size={24} color={COLORS.gray} />
//             <Text style={styles.placeholderText}>
//               {tSafe('no_updates_yet', 'Cleaner has not started this room yet')}
//             </Text>
//           </View>
//         </View>
//       );
//     }
  
//     // Original rendering for rooms with progress
//     const photoCount = roomData.photos?.length || 0;
//     const photoLabel = photoCount === 1 ? tSafe('photo', 'photo') : tSafe('photos', 'photos');
  
//     return (
//       <View key={roomName} style={styles.roomSection}>
//         <View style={styles.roomHeader}>
//           <Text style={styles.roomTitle}>{formatRoomTitle(roomName)}</Text>
//           <Text style={styles.roomPhotoCount}>
//             {photoCount} {photoLabel}
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
//         {/* {hasTasks && (
//           <View style={styles.tasksContainer}>
//             <Text style={styles.tasksTitle}>{tSafe('completed_tasks', 'Completed Tasks:')}</Text>
//             <FlatList
//               data={roomData.tasks}
//               renderItem={renderTask}
//               keyExtractor={item => item.id.toString()}
//               numColumns={2}
//               columnWrapperStyle={styles.columnWrapper}
//               scrollEnabled={false}
//             />
//           </View>
//         )} */}

//         {hasTasks && (
//           <View style={styles.tasksContainer}>
//             <Text style={styles.tasksTitle}>{tSafe('completed_tasks', 'Completed Tasks:')}</Text>
//             <FlatList
//               data={roomData.tasks}
//               renderItem={renderTask}
//               keyExtractor={item => item.id.toString()}
//               numColumns={2}
//               columnWrapperStyle={styles.columnWrapper}
//               scrollEnabled={false}
//               ListEmptyComponent={
//                 <View style={styles.noTasksContainer}>
//                   <MaterialCommunityIcons name="list-outline" size={40} color="#ddd" />
//                   <Text style={styles.noTasksText}>{tSafe('no_tasks_assigned', 'No tasks assigned')}</Text>
//                 </View>
//               }
//             />
//           </View>
//         )}
//       </View>
//     );
//   };

//   const renderCleanlinessAnalysis = () => {
//     if (!currentImages[currentImageIndex]?.cleanliness) return null;

//     const cleanlinessData = currentImages[currentImageIndex].cleanliness;
//     const individualOverall = cleanlinessData.individual_overall || 0;
//     const invertedIndividualScore = invertPercentage(individualOverall);
    
//     const category = currentImages[currentImageIndex].category;
//     const categoryPhotos = getFilteredCleaners().flatMap(cleaner => {
//       const allTasks = getAllTasksForCleaner(cleaner);
//       return allTasks[category]?.photos || [];
//     });
//     const categoryTotal = categoryPhotos.reduce((sum, photo) => 
//       sum + (photo.cleanliness?.individual_overall || 0), 0);
//     const categoryAverage = categoryPhotos.length > 0 ? 
//       categoryTotal / categoryPhotos.length : 0;
//     const invertedCategoryScore = invertPercentage(categoryAverage);

//     // Translate factor names
//     const translateFactor = (factor) => {
//       const map = {
//         dust: tSafe('factor_dust', 'Dust'),
//         streaks: tSafe('factor_streaks', 'Streaks'),
//         spots: tSafe('factor_spots', 'Spots'),
//         debris: tSafe('factor_debris', 'Debris'),
//         shine: tSafe('factor_shine', 'Shine'),
//         organization: tSafe('factor_organization', 'Organization'),
//         smell: tSafe('factor_smell', 'Smell'),
//         stains: tSafe('factor_stains', 'Stains'),
//         cleanliness: tSafe('factor_cleanliness', 'Cleanliness'),
//         general: tSafe('factor_general', 'General'),
//       };
//       return map[factor] || factor.replace(/_/g, ' ').toUpperCase();
//     };

//     return (
//       <View style={styles.analysisContainer}>
//         <View style={styles.dragHandle} />
//         <View style={styles.cleanlinessDetails}>
//           <Text style={styles.detailHeader}>{tSafe('cleanliness_analysis', 'CLEANLINESS ANALYSIS')}</Text>
          
//           {/* Individual Score Section */}
//           <View style={styles.scoreSection}>
//             <Text style={styles.sectionTitle}>{tSafe('this_photo', 'THIS PHOTO')}</Text>
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
//           <Text style={styles.sectionTitle}>{tSafe('main_issues', 'MAIN ISSUES')}</Text>
//           <View style={styles.factorsContainer}>
//             {Object.entries(cleanlinessData.scores || {})
//               .sort(([,a], [,b]) => b - a)
//               .slice(0, 3)
//               .map(([factor, score]) => (
//                 <View key={factor} style={styles.factorItem}>
//                   <Text style={styles.factorName}>
//                     {translateFactor(factor)}
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
//     const allTasks = getAllTasksForCleaner(cleaner);
//     const totalPhotos = getTotalPhotosForCleaner(cleaner);
//     const progressStatus = getCleanerProgressStatus(cleaner);
    
//     const hasAnyData = Object.values(allTasks).some(room => 
//       room.photos?.length > 0 || room.tasks?.length > 0
//     );
    
//     if (!hasAnyData) return null;

//     // Filter rooms based on selection
//     const roomsToShow = selectedRoom === 'all' 
//       ? Object.entries(allTasks)
//       : [[selectedRoom, allTasks[selectedRoom]]].filter(([_, data]) => 
//           data?.photos?.length || data?.tasks?.length
//         );

//     if (roomsToShow.length === 0) return null;

//     const translatedStatus = getTranslatedProgressStatus(progressStatus);
//     const groupDisplay = `${tSafe('group', 'Group')} ${cleaner.group.replace('group_', '')}`;

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
//                 <Text style={styles.cleanerGroup}>{groupDisplay}</Text>
//                 <View style={[
//                   styles.statusBadge,
//                   progressStatus === 'completed' && styles.statusCompleted,
//                   progressStatus === 'in_progress' && styles.statusInProgress,
//                   progressStatus === 'partially_completed' && styles.statusPartiallyCompleted
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

//         {/* Room Sections with Horizontal Photo Lists and Tasks */}
//         <View style={styles.roomsContainer}>
//           {roomsToShow.map(([roomName, roomData]) => 
//             renderRoomSection(cleaner, roomName, roomData)
//           )}
//         </View>
//         {/* ✅ Approval Actions for this cleaner (only in review mode) */}
//         {isReviewMode && (
//           <View style={styles.cleanerActions}>
//             <TouchableOpacity
//               style={[styles.actionButton, styles.rejectButtonSmall]}
//               onPress={() => handleReject(cleaner.cleanerId)}
//             >
//               <Text style={styles.actionButtonText}>{tSafe('reject', 'Reject')}</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.actionButton, styles.approveButtonSmall]}
//               onPress={() => handleApprove(cleaner.cleanerId)}
//             >
//               <Text style={styles.actionButtonText}>{tSafe('approve', 'Approve')}</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </Animatable.View>
//     );
//   };

//   const renderEmptyState = (type = 'general') => {
//     const messages = {
//       general: {
//         icon: 'camera-off',
//         title: tSafe('no_after_photos_title', 'No After Photos Yet'),
//         message: tSafe('no_after_photos_message', 'After photos and completed tasks will appear here once cleaners complete their work.')
//       },
//       group: {
//         icon: 'account-group',
//         title: tSafe('no_photos_in_group_title', 'No Photos in This Group'),
//         message: tSafe('no_photos_in_group_message', 'Selected group has no after photos or completed tasks yet.')
//       },
//       room: {
//         icon: 'door-open',
//         title: tSafe('no_photos_in_room_title', 'No Photos in This Room'),
//         message: tSafe('no_photos_in_room_message', 'Selected room has no after photos or completed tasks yet.')
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
//   const hasContent = filteredCleaners.some(cleaner => {
//     const allTasks = getAllTasksForCleaner(cleaner);
//     return Object.values(allTasks).some(room => 
//       room.photos?.length > 0 || room.tasks?.length > 0
//     );
//   });

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      
//       {isLoading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text style={styles.loadingText}>{tSafe('loading_after_photos', 'Loading after photos...')}</Text>
//         </View>
//       ) : (
//         <View style={styles.content}>
//           {/* Header and Filters - Limited height sections */}
//           <View style={styles.header}>
//             <View style={styles.headerTextContainer}>
//               <Text style={styles.headerTitle}>{tSafe('after_cleaning', 'After Cleaning')}</Text>
//               <Text style={styles.headerSubtitle}>
//                 {tSafe('after_cleaning_subtitle', 'Photos taken after cleaning is completed')}
//               </Text>
//             </View>
//             <View style={styles.summaryBadge}>
//               <Text style={styles.summaryText}>
//                 {assignedCleaners.length} {assignedCleaners.length === 1 ? tSafe('cleaner', 'cleaner') : tSafe('cleaners', 'cleaners')}
//               </Text>
//             </View>
//           </View>
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
//               onScroll={onScroll}                 // ✅ added
//               scrollEventThrottle={16} 
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

//       {/* {isReviewMode && !isLoading && (
//         <View style={styles.reviewActionsContainer}>
//           <TouchableOpacity style={[styles.reviewButton, styles.rejectButton]} onPress={handleReject}>
//             <Text style={styles.reviewButtonText}>{tSafe('reject', 'Reject')}</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={[styles.reviewButton, styles.approveButton]} onPress={handleApprove}>
//             <Text style={styles.reviewButtonText}>{tSafe('approve', 'Approve')}</Text>
//           </TouchableOpacity>
//         </View>
//       )} */}

//       {/* Reject Reason Modal */}
//       <Modal
//         visible={showRejectModal}
//         animationType="slide"
//         onRequestClose={() => setShowRejectModal(false)}
//         transparent={true}

//       >
//         <View style={styles.rejectModalOverlay}>
//           <View style={styles.rejectModalContainer}>
//             <Text style={styles.rejectModalTitle}>{tSafe('reject_work_reason', 'Why are you rejecting this work?')}</Text>
//             <View style={styles.rejectOptions}>
//               {rejectReasons.map((reason) => (
//                 <TouchableOpacity
//                   key={reason}
//                   style={[
//                     styles.rejectOption,
//                     selectedRejectReason === reason && styles.rejectOptionSelected,
//                   ]}
//                   onPress={() => {
//                     setSelectedRejectReason(reason);
//                     if (reason !== tSafe('reject_reason_other', 'Other')) {
//                       setCustomRejectReason('');
//                     }
//                   }}
//                 >
//                   <Text style={[
//                     styles.rejectOptionText,
//                     selectedRejectReason === reason && styles.rejectOptionTextSelected,
//                   ]}>
//                     {reason}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//             {selectedRejectReason === tSafe('reject_reason_other', 'Other') && (
//               <TextInput
//                 style={styles.rejectCustomInput}
//                 placeholder={tSafe('describe_reason', 'Describe the reason...')}
//                 value={customRejectReason}
//                 onChangeText={setCustomRejectReason}
//                 multiline
//               />
//             )}
//             <View style={styles.rejectModalActions}>
//               <TouchableOpacity style={[styles.rejectModalButton, styles.rejectModalCancel]} onPress={() => setShowRejectModal(false)}>
//                 <Text style={styles.rejectModalButtonText}>{tSafe('cancel', 'Cancel')}</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={[styles.rejectModalButton, styles.rejectModalConfirm]} onPress={confirmReject}>
//                 <Text style={styles.rejectModalButtonText}>{tSafe('confirm_reject', 'Confirm Reject')}</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

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
//   statusPartiallyCompleted: {
//     backgroundColor: COLORS.info,
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


//   reviewActionsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     padding: 16,
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#e0e0e0',
//     position: 'relative', // it will naturally be at the bottom because it's placed outside ScrollView
//   },
//   reviewButton: {
//     flex: 1,
//     paddingVertical: 14,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginHorizontal: 6,
//   },
//   approveButton: {
//     backgroundColor: '#4CAF50',
//     borderRadius:50
//   },
//   rejectButton: {
//     // backgroundColor: '#f44336',
//     backgroundColor: COLORS.black,
//     borderRadius:50
//   },
//   reviewButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },

//   rejectModalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     justifyContent: 'center',
//     alignItems: 'center',
  
//   },
//   rejectModalContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 24,
//     width: '100%',
//     maxWidth: 400,
//   },
//   rejectModalTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   rejectOptions: {
//     marginBottom: 16,
//   },
//   rejectOption: {
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     marginBottom: 8,
//   },
//   rejectOptionSelected: {
//     borderColor: COLORS.primary,
//     backgroundColor: `${COLORS.primary}10`,
//   },
//   rejectOptionText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   rejectOptionTextSelected: {
//     color: COLORS.primary,
//     fontWeight: '600',
//   },
//   rejectCustomInput: {
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//     fontSize: 16,
//     minHeight: 80,
//     textAlignVertical: 'top',
//   },
//   rejectModalActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   rejectModalButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginHorizontal: 4,
//   },
//   rejectModalCancel: {
//     backgroundColor: '#e0e0e0',
//   },
//   rejectModalConfirm: {
//     backgroundColor: '#f44336',
//   },
//   rejectModalButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#fff',
//   },


//   notStartedBadge: {
//     backgroundColor: '#f0f0f0',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   notStartedBadgeText: {
//     fontSize: 12,
//     color: '#666',
//     fontWeight: '500',
//   },
//   placeholderContainer: {
//     padding: 20,
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//     borderStyle: 'dashed',
//   },
//   placeholderText: {
//     marginTop: 8,
//     fontSize: 14,
//     color: '#999',
//     textAlign: 'center',
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

//   cleanerActions: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     marginTop: 12,
//     gap: 8,
//   },
//   actionButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     minWidth: 80,
//     alignItems: 'center',
//   },
//   approveButtonSmall: {
//     backgroundColor: '#4CAF50',
//   },
//   rejectButtonSmall: {
//     backgroundColor: '#f44336',
//   },
//   actionButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 14,
//   },
// });

// export default AfterPhoto;






// AfterPhoto.js
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
//   FlatList,
//   Alert,
//   TextInput,
// } from 'react-native';
// import COLORS from '../../../constants/colors';
// import userService from '../../../services/connection/userService';
// import { AuthContext } from '../../../context/AuthContext';
// import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
// import * as Animatable from 'react-native-animatable';
// import ImageViewer from 'react-native-image-zoom-viewer';
// import { Modal as RNModal } from 'react-native';
// import Modal from 'react-native-modal';
// import { Image } from 'expo-image';
// import CircularProgress from 'react-native-circular-progress-indicator';
// import formatRoomTitle from '../../../utils/formatRoomTitle';
// import { tSafe } from '../../../utils/tSafe';

// const { width: screenWidth } = Dimensions.get('window');

// // ─── Helper functions ─────────────────────────────────────────────
// const getAllTasksForCleaner = (cleaner) => {
//   const allTasks = {};
//   if (!cleaner || !cleaner.checklist || !cleaner.checklist.details) {
//     return allTasks;
//   }
//   Object.keys(cleaner.checklist.details).forEach(roomName => {
//     const roomData = cleaner.checklist.details[roomName];
//     const hasPhotos = Array.isArray(roomData.photos) && roomData.photos.length > 0;
//     const hasTasks = Array.isArray(roomData.tasks) && roomData.tasks.length > 0;
//     if (!hasPhotos && !hasTasks) return;
//     const completedTasks = roomData.tasks?.filter(task => task.value === true) || [];
//     const pendingTasks = roomData.tasks?.filter(task => task.value === false) || [];
//     let roomStatus = 'not_started';
//     if (completedTasks.length > 0 && pendingTasks.length === 0) {
//       roomStatus = 'completed';
//     } else if (completedTasks.length > 0 || hasPhotos) {
//       roomStatus = 'in_progress';
//     }
//     allTasks[roomName] = {
//       photos: roomData.photos || [],
//       tasks: completedTasks,
//       pending_tasks: pendingTasks,
//       status: roomStatus,
//       total_tasks: roomData.tasks?.length || 0,
//       completed_tasks: completedTasks.length,
//     };
//   });
//   return allTasks;
// };

// const getTotalPhotosForCleaner = (cleaner) => {
//   let total = 0;
//   if (!cleaner || !cleaner.checklist || !cleaner.checklist.details) return total;
//   Object.values(cleaner.checklist.details).forEach(roomData => {
//     if (Array.isArray(roomData.photos)) {
//       total += roomData.photos.length;
//     }
//   });
//   return total;
// };

// const getCleanerProgressStatus = (cleaner) => {
//   const allTasks = getAllTasksForCleaner(cleaner);
//   const totalRooms = Object.keys(allTasks).length;
//   if (totalRooms === 0) return 'not_started';
//   const completedRooms = Object.values(allTasks).filter(room => room.status === 'completed').length;
//   if (completedRooms === totalRooms) return 'completed';
//   if (completedRooms > 0) return 'partially_completed';
//   return 'in_progress';
// };

// const getTranslatedProgressStatus = (status) => {
//   switch (status) {
//     case 'not_started': return tSafe('status_not_started', 'Not Started');
//     case 'in_progress': return tSafe('status_in_progress', 'In Progress');
//     case 'completed': return tSafe('status_completed', 'Completed');
//     case 'partially_completed': return tSafe('status_partially_completed', 'Partially Completed');
//     default: return status;
//   }
// };

// const getCleanlinessLabel = (invertedScore) => {
//   if (invertedScore <= 35) return tSafe('needs_deep_cleaning', 'Needs Deep Cleaning');
//   if (invertedScore <= 40) return tSafe('requires_attention', 'Requires Attention');
//   return tSafe('very_clean', 'Very Clean');
// };

// const getCleanlinessColor = (invertedScore) => {
//   if (invertedScore <= 35) return '#e74c3c';
//   if (invertedScore <= 40) return '#f1c40f';
//   return '#2ecc71';
// };

// const getCleanlinessIcon = (invertedScore) => {
//   if (invertedScore <= 35) return 'times';
//   if (invertedScore <= 40) return 'exclamation';
//   return 'check';
// };

// // ─── Main Component ──────────────────────────────────────────────
// const AfterPhoto = ({ scheduleId, schedule, onScroll, mode, isReviewMode = false }) => {
//   const { currentUserId } = useContext(AuthContext);

//   const [isLoading, setIsLoading] = useState(false);
//   const [assignedCleaners, setAssignedCleaners] = useState([]);
//   const [isAfterModalVisible, setAfterModalVisible] = useState(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [currentImages, setCurrentImages] = useState([]);
//   const [selectedGroup, setSelectedGroup] = useState('all');
//   const [selectedRoom, setSelectedRoom] = useState('all');
//   const [isDragging, setIsDragging] = useState(false);

//   const [showRejectModal, setShowRejectModal] = useState(false);
//   const [selectedRejectReason, setSelectedRejectReason] = useState(null);
//   const [customRejectReason, setCustomRejectReason] = useState('');
//   const [selectedCleanerId, setSelectedCleanerId] = useState(null);

//   const pan = useState(new Animated.ValueXY())[0];
//   const overlayOpacity = useState(new Animated.Value(1))[0];

//   const rejectReasons = [
//     tSafe('reject_reason_no_show', 'No Show'),
//     tSafe('reject_reason_came_late', 'Came Late'),
//     tSafe('reject_reason_cleaning_concerns', 'Cleaning Concerns'),
//     tSafe('reject_reason_damaged_property', 'Damaged Property'),
//     tSafe('reject_reason_other', 'Other'),
//   ];

//   // ─── Fetch data ──────────────────────────────────────────────────
//   const fetchData = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       const response = await userService.getUpdatedImageUrls(scheduleId);
//       const res = response.data.data;
//       if (res.assignedTo && Array.isArray(res.assignedTo)) {
//         setAssignedCleaners(res.assignedTo);
//       }
//     } catch (error) {
//       console.log('Error fetching after photos:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [scheduleId]);

//   useFocusEffect(
//     useCallback(() => {
//       let isMounted = true;
//       if (isMounted) fetchData();
//       return () => { isMounted = false; };
//     }, [fetchData])
//   );

//   // ─── Review handlers ────────────────────────────────────────────
//   const handleApprove = async (cleanerId) => {
//     try {
//       await userService.approveWork({ scheduleId, cleanerId });
//       Alert.alert(tSafe('success', 'Success'), tSafe('work_approved', 'Work approved! Payment will be released.'));
//       fetchData();
//     } catch (error) {
//       Alert.alert(tSafe('error', 'Error'), tSafe('approval_failed', 'Could not approve work.'));
//     }
//   };

//   const handleReject = (cleanerId) => {
//     setSelectedCleanerId(cleanerId);
//     setShowRejectModal(true);
//   };

//   const confirmReject = async () => {
//     if (!selectedRejectReason) {
//       Alert.alert(tSafe('error', 'Error'), tSafe('please_select_reason', 'Please select a reason for rejection.'));
//       return;
//     }
//     const reason = selectedRejectReason === tSafe('reject_reason_other', 'Other')
//       ? customRejectReason.trim() || selectedRejectReason
//       : selectedRejectReason;

//     try {
//       await userService.rejectWork({ scheduleId, cleanerId: selectedCleanerId, reason });
//       Alert.alert(tSafe('success', 'Success'), tSafe('work_rejected', 'Work rejected.'));
//       fetchData();
//     } catch (error) {
//       Alert.alert(tSafe('error', 'Error'), tSafe('reject_failed', 'Could not reject work.'));
//     } finally {
//       setShowRejectModal(false);
//       setSelectedRejectReason(null);
//       setCustomRejectReason('');
//       setSelectedCleanerId(null);
//     }
//   };

//   // ─── Render helpers ─────────────────────────────────────────────
//   const renderTask = ({ item, index }) => (
//     <View style={styles.taskContainer} key={item?.id || `task-${index}`}>
//       <Text style={styles.taskText}>
//         <FontAwesome
//           name={item.value ? 'check' : 'times'}
//           size={12}
//           color={item.value ? COLORS.success : COLORS.error}
//         /> {item.label}
//       </Text>
//     </View>
//   );

//   const getGroups = () => {
//     const groups = new Set(assignedCleaners.map(cleaner => cleaner.group));
//     return ['all', ...Array.from(groups)];
//   };

//   const getAllRooms = () => {
//     const rooms = new Set();
//     getFilteredCleaners().forEach(cleaner => {
//       const allTasks = getAllTasksForCleaner(cleaner);
//       Object.keys(allTasks).forEach(room => {
//         if (allTasks[room].photos?.length > 0 || allTasks[room].tasks?.length > 0) {
//           rooms.add(room);
//         }
//       });
//     });
//     return ['all', ...Array.from(rooms)];
//   };

//   const getFilteredCleaners = () => {
//     if (selectedGroup === 'all') return assignedCleaners;
//     return assignedCleaners.filter(cleaner => cleaner.group === selectedGroup);
//   };

//   const invertPercentage = (score) => 100 - (score * 10);

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
//         url: status === 'Very Clean' ? photo.img_url : cleanliness.heatmap_url || photo.img_url,
//         cleanliness: cleanliness,
//         props: { source: { uri: status === 'Very Clean' ? photo.img_url : cleanliness.heatmap_url || photo.img_url } },
//         category: category,
//       };
//     });
//     setCurrentImages(formattedImages);
//     setCurrentImageIndex(index);
//     setAfterModalVisible(true);
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
//         let displayName;
//         if (group === 'all') {
//           displayName = tSafe('all_groups', 'All Groups');
//         } else {
//           const groupNumber = group.replace('group_', '');
//           displayName = `${tSafe('group', 'Group')} ${groupNumber}`;
//         }
//         return (
//           <TouchableOpacity
//             key={group}
//             style={[styles.groupTab, selectedGroup === group && styles.groupTabActive]}
//             onPress={() => {
//               setSelectedGroup(group);
//               setSelectedRoom('all');
//             }}
//           >
//             <Text style={[styles.groupTabText, selectedGroup === group && styles.groupTabTextActive]}>
//               {displayName}
//             </Text>
//             <View style={styles.groupBadge}>
//               <Text style={styles.groupBadgeText}>{photoCount}</Text>
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
//               style={[styles.roomFilterTab, selectedRoom === room && styles.roomFilterTabActive]}
//               onPress={() => setSelectedRoom(room)}
//             >
//               <Text style={[styles.roomFilterText, selectedRoom === room && styles.roomFilterTextActive]}>
//                 {room === 'all' ? tSafe('all_rooms', 'All Rooms') : formatRoomTitle(room)}
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
//     const completedTasks = roomData.tasks?.filter(task => task.value === true) || [];
//     const hasProgress = hasPhotos || completedTasks.length > 0;

//     if (!hasProgress) {
//       return (
//         <View key={roomName} style={styles.roomSection}>
//           <View style={styles.roomHeader}>
//             <Text style={styles.roomTitle}>{formatRoomTitle(roomName)}</Text>
//             <View style={styles.notStartedBadge}>
//               <Text style={styles.notStartedBadgeText}>{tSafe('not_started', 'Not Started')}</Text>
//             </View>
//           </View>
//           <View style={styles.placeholderContainer}>
//             <MaterialCommunityIcons name="clock-outline" size={24} color={COLORS.gray} />
//             <Text style={styles.placeholderText}>{tSafe('no_updates_yet', 'Cleaner has not started this room yet')}</Text>
//           </View>
//         </View>
//       );
//     }

//     const photoCount = roomData.photos?.length || 0;
//     const photoLabel = photoCount === 1 ? tSafe('photo', 'photo') : tSafe('photos', 'photos');

//     return (
//       <View key={roomName} style={styles.roomSection}>
//         <View style={styles.roomHeader}>
//           <Text style={styles.roomTitle}>{formatRoomTitle(roomName)}</Text>
//           <Text style={styles.roomPhotoCount}>{photoCount} {photoLabel}</Text>
//         </View>
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
//                   <Image source={{ uri: photo.img_url }} style={styles.photoImage} contentFit="cover" transition={300} />
//                   <View style={[styles.cleanlinessBadge, { backgroundColor: getCleanlinessColor(invertedIndividualScore) }]}>
//                     <FontAwesome name={getCleanlinessIcon(invertedIndividualScore)} size={14} color="white" />
//                   </View>
//                   <View style={styles.photoOverlay}>
//                     <MaterialCommunityIcons name="magnify-plus-outline" size={20} color="white" />
//                   </View>
//                 </TouchableOpacity>
//               );
//             })}
//           </ScrollView>
//         )}
//         {hasTasks && (
//           <View style={styles.tasksContainer}>
//             <Text style={styles.tasksTitle}>{tSafe('completed_tasks', 'Completed Tasks:')}</Text>
//             <FlatList
//               data={roomData.tasks}
//               renderItem={renderTask}
//               keyExtractor={(item, index) => (item?.id ? item.id.toString() : `task_${index}`)}
//               numColumns={2}
//               columnWrapperStyle={styles.columnWrapper}
//               scrollEnabled={false}
//               ListEmptyComponent={
//                 <View style={styles.noTasksContainer}>
//                   <MaterialCommunityIcons name="list-outline" size={40} color="#ddd" />
//                   <Text style={styles.noTasksText}>{tSafe('no_tasks_assigned', 'No tasks assigned')}</Text>
//                 </View>
//               }
//             />
//           </View>
//         )}
//       </View>
//     );
//   };

//   const renderCleanlinessAnalysis = () => {
//     if (!currentImages[currentImageIndex]?.cleanliness) return null;
//     const cleanlinessData = currentImages[currentImageIndex].cleanliness;
//     const individualOverall = cleanlinessData.individual_overall || 0;
//     const invertedIndividualScore = invertPercentage(individualOverall);
//     const category = currentImages[currentImageIndex].category;
//     const categoryPhotos = getFilteredCleaners().flatMap(cleaner => {
//       const allTasks = getAllTasksForCleaner(cleaner);
//       return allTasks[category]?.photos || [];
//     });
//     const categoryTotal = categoryPhotos.reduce((sum, photo) => sum + (photo.cleanliness?.individual_overall || 0), 0);
//     const categoryAverage = categoryPhotos.length > 0 ? categoryTotal / categoryPhotos.length : 0;
//     const invertedCategoryScore = invertPercentage(categoryAverage);

//     const translateFactor = (factor) => {
//       const map = {
//         dust: tSafe('factor_dust', 'Dust'),
//         streaks: tSafe('factor_streaks', 'Streaks'),
//         spots: tSafe('factor_spots', 'Spots'),
//         debris: tSafe('factor_debris', 'Debris'),
//         shine: tSafe('factor_shine', 'Shine'),
//         organization: tSafe('factor_organization', 'Organization'),
//         smell: tSafe('factor_smell', 'Smell'),
//         stains: tSafe('factor_stains', 'Stains'),
//         cleanliness: tSafe('factor_cleanliness', 'Cleanliness'),
//         general: tSafe('factor_general', 'General'),
//       };
//       return map[factor] || factor.replace(/_/g, ' ').toUpperCase();
//     };

//     return (
//       <View style={styles.analysisContainer}>
//         <View style={styles.dragHandle} />
//         <View style={styles.cleanlinessDetails}>
//           <Text style={styles.detailHeader}>{tSafe('cleanliness_analysis', 'CLEANLINESS ANALYSIS')}</Text>
//           <View style={styles.scoreSection}>
//             <Text style={styles.sectionTitle}>{tSafe('this_photo', 'THIS PHOTO')}</Text>
//             <View style={styles.scoreRow}>
//               <View style={styles.scoreTextContainer}>
//                 <Text style={styles.percentageText}>{invertedIndividualScore.toFixed(0)}%</Text>
//                 <Text style={[styles.statusText, { color: getCleanlinessColor(invertedIndividualScore) }]}>
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
//           <Text style={styles.sectionTitle}>{tSafe('main_issues', 'MAIN ISSUES')}</Text>
//           <View style={styles.factorsContainer}>
//             {Object.entries(cleanlinessData.scores || {})
//               .sort(([, a], [, b]) => b - a)
//               .slice(0, 3)
//               .map(([factor, score]) => (
//                 <View key={factor} style={styles.factorItem}>
//                   <Text style={styles.factorName}>{translateFactor(factor)}</Text>
//                   <Text style={[styles.factorScore, { color: getCleanlinessColor(100 - (score * 10)) }]}>
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
//     const allTasks = getAllTasksForCleaner(cleaner);
//     const totalPhotos = getTotalPhotosForCleaner(cleaner);
//     const progressStatus = getCleanerProgressStatus(cleaner);

//     const hasAnyData = Object.values(allTasks).some(room => room.photos?.length > 0 || room.tasks?.length > 0);
//     if (!hasAnyData) return null;

//     const roomsToShow = selectedRoom === 'all'
//       ? Object.entries(allTasks)
//       : [[selectedRoom, allTasks[selectedRoom]]].filter(([_, data]) => data?.photos?.length || data?.tasks?.length);
//     if (roomsToShow.length === 0) return null;

//     const translatedStatus = getTranslatedProgressStatus(progressStatus);
//     const groupDisplay = `${tSafe('group', 'Group')} ${cleaner.group.replace('group_', '')}`;

//     const isPending = cleaner.status?.toLowerCase() === 'pending_review';
//     const isApproved = cleaner.status?.toLowerCase() === 'approved';
//     const isRejected = ['uncompleted', 'rejected', 'cancelled'].includes(cleaner.status?.toLowerCase());

//     return (
//       <Animatable.View
//         key={`${cleaner.cleanerId}-${index}`}
//         style={styles.cleanerCard}
//         animation="fadeInUp"
//         duration={600}
//         delay={index * 200}
//       >
//         <View style={styles.cleanerHeader}>
//           <View style={styles.cleanerInfo}>
//             <Image source={{ uri: cleaner.avatar }} style={styles.cleanerAvatar} contentFit="cover" />
//             <View style={styles.cleanerDetails}>
//               <Text style={styles.cleanerName}>{cleaner.firstname} {cleaner.lastname}</Text>
//               <View style={styles.cleanerMeta}>
//                 <Text style={styles.cleanerGroup}>{groupDisplay}</Text>
//                 <View style={[
//                   styles.statusBadge,
//                   progressStatus === 'completed' && styles.statusCompleted,
//                   progressStatus === 'in_progress' && styles.statusInProgress,
//                   progressStatus === 'partially_completed' && styles.statusPartiallyCompleted
//                 ]}>
//                   <Text style={styles.statusText}>{translatedStatus}</Text>
//                 </View>
//               </View>
//             </View>
//           </View>
//           <View style={styles.photoCountBadge}>
//             <MaterialCommunityIcons name="camera" size={16} color={COLORS.white} />
//             <Text style={styles.photoCountText}>{totalPhotos}</Text>
//           </View>
//         </View>

//         <View style={styles.roomsContainer}>
//           {roomsToShow.map(([roomName, roomData]) => renderRoomSection(cleaner, roomName, roomData))}
//         </View>

//         {isReviewMode && (
//           <View style={styles.cleanerActions}>
//             {isPending ? (
//               <>
//                 <TouchableOpacity
//                   style={[styles.actionButton, styles.rejectButtonSmall]}
//                   onPress={() => handleReject(cleaner.cleanerId)}
//                 >
//                   <Text style={styles.actionButtonText}>{tSafe('reject', 'Reject')}</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.actionButton, styles.approveButtonSmall]}
//                   onPress={() => handleApprove(cleaner.cleanerId)}
//                 >
//                   <Text style={styles.actionButtonText}>{tSafe('approve', 'Approve')}</Text>
//                 </TouchableOpacity>
//               </>
//             ) : (
//               <View style={styles.statusContainer}>
//                 <Text style={[styles.statusText, { color: isApproved ? '#4CAF50' : '#f44336' }]}>
//                   {isApproved ? tSafe('approved', 'Approved') : tSafe('rejected', 'Rejected')}
//                 </Text>
//               </View>
//             )}
//           </View>
//         )}
//       </Animatable.View>
//     );
//   };

//   const renderEmptyState = (type = 'general') => {
//     const messages = {
//       general: {
//         icon: 'camera-off',
//         title: tSafe('no_after_photos_title', 'No After Photos Yet'),
//         message: tSafe('no_after_photos_message', 'After photos and completed tasks will appear here once cleaners complete their work.'),
//       },
//       group: {
//         icon: 'account-group',
//         title: tSafe('no_photos_in_group_title', 'No Photos in This Group'),
//         message: tSafe('no_photos_in_group_message', 'Selected group has no after photos or completed tasks yet.'),
//       },
//       room: {
//         icon: 'door-open',
//         title: tSafe('no_photos_in_room_title', 'No Photos in This Room'),
//         message: tSafe('no_photos_in_room_message', 'Selected room has no after photos or completed tasks yet.'),
//       },
//     };
//     const { icon, title, message } = messages[type];
//     return (
//       <View style={styles.emptyState}>
//         <MaterialCommunityIcons name={icon} size={80} color={COLORS.light_gray} />
//         <Text style={styles.emptyStateTitle}>{title}</Text>
//         <Text style={styles.emptyStateText}>{message}</Text>
//       </View>
//     );
//   };

//   const filteredCleaners = getFilteredCleaners();
//   const hasContent = filteredCleaners.some(cleaner => {
//     const allTasks = getAllTasksForCleaner(cleaner);
//     return Object.values(allTasks).some(room => room.photos?.length > 0 || room.tasks?.length > 0);
//   });

//   // ─── Render ──────────────────────────────────────────────────────
//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />

//       {isLoading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text style={styles.loadingText}>{tSafe('loading_after_photos', 'Loading after photos...')}</Text>
//         </View>
//       ) : (
//         <View style={styles.content}>
//           <View style={styles.header}>
//             <View style={styles.headerTextContainer}>
//               <Text style={styles.headerTitle}>{tSafe('after_cleaning', 'After Cleaning')}</Text>
//               <Text style={styles.headerSubtitle}>
//                 {tSafe('after_cleaning_subtitle', 'Photos taken after cleaning is completed')}
//               </Text>
//             </View>
//             <View style={styles.summaryBadge}>
//               <Text style={styles.summaryText}>
//                 {assignedCleaners.length} {assignedCleaners.length === 1 ? tSafe('cleaner', 'cleaner') : tSafe('cleaners', 'cleaners')}
//               </Text>
//             </View>
//           </View>
//           <View>
//             {getGroups().length > 1 && renderGroupTabs()}
//             {renderRoomFilter()}
//           </View>

//           <View style={styles.mainContentArea}>
//             <ScrollView
//               showsVerticalScrollIndicator={false}
//               style={styles.cleanersScrollView}
//               contentContainerStyle={styles.cleanersList}
//               onScroll={onScroll}
//               scrollEventThrottle={16}
//             >
//               {hasContent ? (
//                 <View style={styles.cleanersContent}>
//                   {filteredCleaners.map((cleaner, index) => renderCleanerCard(cleaner, index))}
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

//       {/* Reject Reason Modal */}
//       <RNModal
//         visible={showRejectModal}
//         animationType="slide"
//         onRequestClose={() => setShowRejectModal(false)}
//         transparent={true}
//       >
        
//         <View style={styles.rejectModalOverlay}>
//           <View style={styles.rejectModalContainer}>
//             <Text style={styles.rejectModalTitle}>{tSafe('reject_work_reason', 'Why are you rejecting this work?')}</Text>
//             <View style={styles.rejectOptions}>
//               {rejectReasons.map((reason) => (
//                 <TouchableOpacity
//                   key={reason}
//                   style={[styles.rejectOption, selectedRejectReason === reason && styles.rejectOptionSelected]}
//                   onPress={() => {
//                     setSelectedRejectReason(reason);
//                     if (reason !== tSafe('reject_reason_other', 'Other')) setCustomRejectReason('');
//                   }}
//                 >
//                   <Text style={[styles.rejectOptionText, selectedRejectReason === reason && styles.rejectOptionTextSelected]}>
//                     {reason}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//             {selectedRejectReason === tSafe('reject_reason_other', 'Other') && (
//               <TextInput
//                 style={styles.rejectCustomInput}
//                 placeholder={tSafe('describe_reason', 'Describe the reason...')}
//                 value={customRejectReason}
//                 onChangeText={setCustomRejectReason}
//                 multiline
//               />
//             )}
//             <View style={styles.rejectModalActions}>
//               <TouchableOpacity style={[styles.rejectModalButton, styles.rejectModalCancel]} onPress={() => setShowRejectModal(false)}>
//                 <Text style={styles.rejectModalButtonText}>{tSafe('cancel', 'Cancel')}</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={[styles.rejectModalButton, styles.rejectModalConfirm]} onPress={confirmReject}>
//                 <Text style={styles.rejectModalButtonText}>{tSafe('confirm_reject', 'Confirm Reject')}</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </RNModal>

//       {/* Image Viewer Modal */}
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
//               <TouchableOpacity style={styles.closeButton} onPress={() => setAfterModalVisible(false)}>
//                 <MaterialCommunityIcons name="close" size={24} color="white" />
//               </TouchableOpacity>
//             )}
//             renderImage={(props) => (
//               <Image {...props} style={styles.fullSizeImage} contentFit="contain" transition={300} />
//             )}
//           />
//           {renderCleanlinessAnalysis()}
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// // ─── Styles ──────────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: COLORS.white },
//   content: { flex: 1 },
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
//   headerTextContainer: { flex: 1 },
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
//   roomFilterContainer: { marginHorizontal: -20 },
//   roomFilterContent: { paddingHorizontal: 20 },
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
//   mainContentArea: { flex: 1 },
//   cleanersScrollView: { flex: 1 },
//   cleanersList: { flexGrow: 1 },
//   cleanersContent: { padding: 16 },
//   cleanerCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
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
//   cleanerDetails: { flex: 1 },
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
//   statusCompleted: { backgroundColor: COLORS.success },
//   statusInProgress: { backgroundColor: COLORS.warning },
//   statusPartiallyCompleted: { backgroundColor: COLORS.info },
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
//   roomsContainer: {},
//   roomSection: { marginBottom: 20 },
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
//   photosScrollContent: { paddingHorizontal: 16 },
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
//   tasksContainer: { marginTop: 8 },
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
//   columnWrapper: { justifyContent: 'space-between' },
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
//   modal: { margin: 0 },
//   modalContainer: { flex: 1, backgroundColor: 'black' },
//   closeButton: {
//     position: 'absolute',
//     top: 50,
//     right: 20,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     borderRadius: 20,
//     padding: 10,
//     zIndex: 1,
//   },
//   fullSizeImage: { width: '100%', height: '100%' },
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
//   cleanlinessDetails: { gap: 20 },
//   detailHeader: {
//     color: 'white',
//     fontSize: 20,
//     fontWeight: '800',
//     marginBottom: 24,
//     textAlign: 'center',
//     letterSpacing: 0.5,
//   },
//   scoreSection: { marginBottom: 16 },
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
//   rejectModalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 0,  // remove padding to allow full width
//   },
//   rejectModalContainer: {
//     backgroundColor: '#FFF',
//     borderRadius: 24,
//     padding: 24,
//     width: '100%',        // full width
//     alignSelf: 'center',
//     // no maxWidth – or set to 100% if you want a tiny margin
//     marginHorizontal: 0,
//   },
//   rejectCustomInput: {
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//     fontSize: 16,
//     minHeight: 80,
//     textAlignVertical: 'top',
//     width: '100%',        // full width inside the container
//   },

//   rejectModalTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   rejectOptions: { marginBottom: 16 },
//   rejectOption: {
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     marginBottom: 8,
//   },
//   rejectOptionSelected: {
//     borderColor: COLORS.primary,
//     backgroundColor: `${COLORS.primary}10`,
//   },
//   rejectOptionText: { fontSize: 16, color: '#333' },
//   rejectOptionTextSelected: {
//     color: COLORS.primary,
//     fontWeight: '600',
//   },
//   rejectCustomInput: {
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//     fontSize: 16,
//     minHeight: 80,
//     textAlignVertical: 'top',
//   },
//   rejectModalActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   rejectModalButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginHorizontal: 4,
//   },
//   rejectModalCancel: { backgroundColor: COLORS.dark },
//   rejectModalConfirm: { backgroundColor: '#f44336' },
//   rejectModalButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#fff',
//   },
//   notStartedBadge: {
//     backgroundColor: '#f0f0f0',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   notStartedBadgeText: {
//     fontSize: 12,
//     color: '#666',
//     fontWeight: '500',
//   },
//   placeholderContainer: {
//     padding: 20,
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//     borderStyle: 'dashed',
//   },
//   placeholderText: {
//     marginTop: 8,
//     fontSize: 14,
//     color: '#999',
//     textAlign: 'center',
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
//   cleanerActions: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     marginTop: 12,
//     gap: 8,
//   },
//   actionButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     minWidth: 80,
//     alignItems: 'center',
//   },
//   approveButtonSmall: { backgroundColor: '#4CAF50' },
//   rejectButtonSmall: { backgroundColor: '#f44336' },
//   actionButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   statusContainer: {
//     alignItems: 'center',
//     padding: 6,
//   },
// });

// export default AfterPhoto;




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
//   FlatList,
//   Alert,
//   TextInput,
//   Keyboard,
//   TouchableWithoutFeedback,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';
// import COLORS from '../../../constants/colors';
// import userService from '../../../services/connection/userService';
// import { AuthContext } from '../../../context/AuthContext';
// import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
// import * as Animatable from 'react-native-animatable';
// import ImageViewer from 'react-native-image-zoom-viewer';
// import { Modal as RNModal } from 'react-native';
// import Modal from 'react-native-modal';
// import { Image } from 'expo-image';
// import CircularProgress from 'react-native-circular-progress-indicator';
// import formatRoomTitle from '../../../utils/formatRoomTitle';
// import { tSafe } from '../../../utils/tSafe';
// import FeedbackModal from '../../../components/shared/Feedback';

// const { width: screenWidth } = Dimensions.get('window');

// // ─── Helper functions ─────────────────────────────────────────────
// const getAllTasksForCleaner = (cleaner) => {
//   const allTasks = {};
//   if (!cleaner || !cleaner.checklist || !cleaner.checklist.details) {
//     return allTasks;
//   }
//   Object.keys(cleaner.checklist.details).forEach(roomName => {
//     const roomData = cleaner.checklist.details[roomName];
//     const hasPhotos = Array.isArray(roomData.photos) && roomData.photos.length > 0;
//     const hasTasks = Array.isArray(roomData.tasks) && roomData.tasks.length > 0;
//     if (!hasPhotos && !hasTasks) return;
//     const completedTasks = roomData.tasks?.filter(task => task.value === true) || [];
//     const pendingTasks = roomData.tasks?.filter(task => task.value === false) || [];
//     let roomStatus = 'not_started';
//     if (completedTasks.length > 0 && pendingTasks.length === 0) {
//       roomStatus = 'completed';
//     } else if (completedTasks.length > 0 || hasPhotos) {
//       roomStatus = 'in_progress';
//     }
//     allTasks[roomName] = {
//       photos: roomData.photos || [],
//       tasks: completedTasks,
//       pending_tasks: pendingTasks,
//       status: roomStatus,
//       total_tasks: roomData.tasks?.length || 0,
//       completed_tasks: completedTasks.length,
//     };
//   });
//   return allTasks;
// };

// const getTotalPhotosForCleaner = (cleaner) => {
//   let total = 0;
//   if (!cleaner || !cleaner.checklist || !cleaner.checklist.details) return total;
//   Object.values(cleaner.checklist.details).forEach(roomData => {
//     if (Array.isArray(roomData.photos)) {
//       total += roomData.photos.length;
//     }
//   });
//   return total;
// };

// const getCleanerProgressStatus = (cleaner) => {
//   const allTasks = getAllTasksForCleaner(cleaner);
//   const totalRooms = Object.keys(allTasks).length;
//   if (totalRooms === 0) return 'not_started';
//   const completedRooms = Object.values(allTasks).filter(room => room.status === 'completed').length;
//   if (completedRooms === totalRooms) return 'completed';
//   if (completedRooms > 0) return 'partially_completed';
//   return 'in_progress';
// };

// const getTranslatedProgressStatus = (status) => {
//   switch (status) {
//     case 'not_started': return tSafe('status_not_started', 'Not Started');
//     case 'in_progress': return tSafe('status_in_progress', 'In Progress');
//     case 'completed': return tSafe('status_completed', 'Completed');
//     case 'partially_completed': return tSafe('status_partially_completed', 'Partially Completed');
//     default: return status;
//   }
// };

// const getCleanlinessLabel = (invertedScore) => {
//   if (invertedScore <= 35) return tSafe('needs_deep_cleaning', 'Needs Deep Cleaning');
//   if (invertedScore <= 40) return tSafe('requires_attention', 'Requires Attention');
//   return tSafe('very_clean', 'Very Clean');
// };

// const getCleanlinessColor = (invertedScore) => {
//   if (invertedScore <= 35) return '#e74c3c';
//   if (invertedScore <= 40) return '#f1c40f';
//   return '#2ecc71';
// };

// const getCleanlinessIcon = (invertedScore) => {
//   if (invertedScore <= 35) return 'times';
//   if (invertedScore <= 40) return 'exclamation';
//   return 'check';
// };

// // ─── Main Component ──────────────────────────────────────────────
// const AfterPhoto = ({ scheduleId, schedule, onScroll, mode, isReviewMode = false }) => {
//   const { currentUserId } = useContext(AuthContext);

//   const [isLoading, setIsLoading] = useState(false);
//   const [assignedCleaners, setAssignedCleaners] = useState([]);
//   const [isAfterModalVisible, setAfterModalVisible] = useState(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [currentImages, setCurrentImages] = useState([]);
//   const [selectedGroup, setSelectedGroup] = useState('all');
//   const [selectedRoom, setSelectedRoom] = useState('all');
//   const [isDragging, setIsDragging] = useState(false);

//   const [showRejectModal, setShowRejectModal] = useState(false);
//   const [selectedRejectReason, setSelectedRejectReason] = useState(null);
//   const [customRejectReason, setCustomRejectReason] = useState('');
//   const [selectedCleanerId, setSelectedCleanerId] = useState(null);

//   // Feedback modal states
//   const [isFeedbackVisible, setFeedbackVisible] = useState(false);
//   const [currentFeedbackTo, setCurrentFeedbackTo] = useState(null);
//   const [isInputFocused, setInputFocused] = useState(false);

//   const pan = useState(new Animated.ValueXY())[0];
//   const overlayOpacity = useState(new Animated.Value(1))[0];

//   const rejectReasons = [
//     tSafe('reject_reason_no_show', 'No Show'),
//     tSafe('reject_reason_came_late', 'Came Late'),
//     tSafe('reject_reason_cleaning_concerns', 'Cleaning Concerns'),
//     tSafe('reject_reason_damaged_property', 'Damaged Property'),
//     tSafe('reject_reason_other', 'Other'),
//   ];

//   // ─── Fetch data ──────────────────────────────────────────────────
//   const fetchData = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       const response = await userService.getUpdatedImageUrls(scheduleId);
//       const res = response.data.data;
//       if (res.assignedTo && Array.isArray(res.assignedTo)) {
//         setAssignedCleaners(res.assignedTo);
//       }
//     } catch (error) {
//       console.log('Error fetching after photos:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [scheduleId]);

//   useFocusEffect(
//     useCallback(() => {
//       let isMounted = true;
//       if (isMounted) fetchData();
//       return () => { isMounted = false; };
//     }, [fetchData])
//   );

//   // ─── Review handlers ────────────────────────────────────────────
//   const handleApprove = async (cleanerId) => {
//     try {
//       await userService.approveWork({ scheduleId, cleanerId });
//       // Show feedback modal after approval
//       setCurrentFeedbackTo(cleanerId);
//       setFeedbackVisible(true);
//       fetchData(); // Refresh data, but modal stays open
//     } catch (error) {
//       Alert.alert(tSafe('error', 'Error'), tSafe('approval_failed', 'Could not approve work.'));
//     }
//   };

//   const handleFeedbackSubmit = async (feedback) => {
//     try {
//       const data = { 
//         scheduleId: scheduleId, 
//         cleanerId: currentFeedbackTo, 
//         // email: assignedCleaners.email || "",
//         ...feedback 
//       };
//       console.log(data)
//       const response = await userService.sendFeedback(data);
//       Alert.alert("Thank You", "Your feedback has been submitted!");
//       setFeedbackVisible(false);
//     } catch (error) {
//       Alert.alert("Error", "Failed to send feedback. Please try again.");
//     }
//   };

//   const handleReject = (cleanerId) => {
//     setSelectedCleanerId(cleanerId);
//     setShowRejectModal(true);
//   };

//   const confirmReject = async () => {
//     if (!selectedRejectReason) {
//       Alert.alert(tSafe('error', 'Error'), tSafe('please_select_reason', 'Please select a reason for rejection.'));
//       return;
//     }
//     const reason = selectedRejectReason === tSafe('reject_reason_other', 'Other')
//       ? customRejectReason.trim() || selectedRejectReason
//       : selectedRejectReason;

//     try {
//       await userService.rejectWork({ scheduleId, cleanerId: selectedCleanerId, reason });
//       Alert.alert(tSafe('success', 'Success'), tSafe('work_rejected', 'Work rejected.'));
//       fetchData();
//     } catch (error) {
//       Alert.alert(tSafe('error', 'Error'), tSafe('reject_failed', 'Could not reject work.'));
//     } finally {
//       setShowRejectModal(false);
//       setSelectedRejectReason(null);
//       setCustomRejectReason('');
//       setSelectedCleanerId(null);
//     }
//   };

//   // ─── Render helpers ─────────────────────────────────────────────
//   const renderTask = ({ item, index }) => (
//     <View style={styles.taskContainer} key={item?.id || `task-${index}`}>
//       <Text style={styles.taskText}>
//         <FontAwesome
//           name={item.value ? 'check' : 'times'}
//           size={12}
//           color={item.value ? COLORS.success : COLORS.error}
//         /> {item.label}
//       </Text>
//     </View>
//   );

//   const getGroups = () => {
//     const groups = new Set(assignedCleaners.map(cleaner => cleaner.group));
//     return ['all', ...Array.from(groups)];
//   };

//   const getAllRooms = () => {
//     const rooms = new Set();
//     getFilteredCleaners().forEach(cleaner => {
//       const allTasks = getAllTasksForCleaner(cleaner);
//       Object.keys(allTasks).forEach(room => {
//         if (allTasks[room].photos?.length > 0 || allTasks[room].tasks?.length > 0) {
//           rooms.add(room);
//         }
//       });
//     });
//     return ['all', ...Array.from(rooms)];
//   };

//   const getFilteredCleaners = () => {
//     if (selectedGroup === 'all') return assignedCleaners;
//     return assignedCleaners.filter(cleaner => cleaner.group === selectedGroup);
//   };

//   const invertPercentage = (score) => 100 - (score * 10);

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
//         url: status === 'Very Clean' ? photo.img_url : cleanliness.heatmap_url || photo.img_url,
//         cleanliness: cleanliness,
//         props: { source: { uri: status === 'Very Clean' ? photo.img_url : cleanliness.heatmap_url || photo.img_url } },
//         category: category,
//       };
//     });
//     setCurrentImages(formattedImages);
//     setCurrentImageIndex(index);
//     setAfterModalVisible(true);
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
//         let displayName;
//         if (group === 'all') {
//           displayName = tSafe('all_groups', 'All Groups');
//         } else {
//           const groupNumber = group.replace('group_', '');
//           displayName = `${tSafe('group', 'Group')} ${groupNumber}`;
//         }
//         return (
//           <TouchableOpacity
//             key={group}
//             style={[styles.groupTab, selectedGroup === group && styles.groupTabActive]}
//             onPress={() => {
//               setSelectedGroup(group);
//               setSelectedRoom('all');
//             }}
//           >
//             <Text style={[styles.groupTabText, selectedGroup === group && styles.groupTabTextActive]}>
//               {displayName}
//             </Text>
//             <View style={styles.groupBadge}>
//               <Text style={styles.groupBadgeText}>{photoCount}</Text>
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
//               style={[styles.roomFilterTab, selectedRoom === room && styles.roomFilterTabActive]}
//               onPress={() => setSelectedRoom(room)}
//             >
//               <Text style={[styles.roomFilterText, selectedRoom === room && styles.roomFilterTextActive]}>
//                 {room === 'all' ? tSafe('all_rooms', 'All Rooms') : formatRoomTitle(room)}
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
//     const completedTasks = roomData.tasks?.filter(task => task.value === true) || [];
//     const hasProgress = hasPhotos || completedTasks.length > 0;

//     if (!hasProgress) {
//       return (
//         <View key={roomName} style={styles.roomSection}>
//           <View style={styles.roomHeader}>
//             <Text style={styles.roomTitle}>{formatRoomTitle(roomName)}</Text>
//             <View style={styles.notStartedBadge}>
//               <Text style={styles.notStartedBadgeText}>{tSafe('not_started', 'Not Started')}</Text>
//             </View>
//           </View>
//           <View style={styles.placeholderContainer}>
//             <MaterialCommunityIcons name="clock-outline" size={24} color={COLORS.gray} />
//             <Text style={styles.placeholderText}>{tSafe('no_updates_yet', 'Cleaner has not started this room yet')}</Text>
//           </View>
//         </View>
//       );
//     }

//     const photoCount = roomData.photos?.length || 0;
//     const photoLabel = photoCount === 1 ? tSafe('photo', 'photo') : tSafe('photos', 'photos');

//     return (
//       <View key={roomName} style={styles.roomSection}>
//         <View style={styles.roomHeader}>
//           <Text style={styles.roomTitle}>{formatRoomTitle(roomName)}</Text>
//           <Text style={styles.roomPhotoCount}>{photoCount} {photoLabel}</Text>
//         </View>
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
//                   <Image source={{ uri: photo.img_url }} style={styles.photoImage} contentFit="cover" transition={300} />
//                   <View style={[styles.cleanlinessBadge, { backgroundColor: getCleanlinessColor(invertedIndividualScore) }]}>
//                     <FontAwesome name={getCleanlinessIcon(invertedIndividualScore)} size={14} color="white" />
//                   </View>
//                   <View style={styles.photoOverlay}>
//                     <MaterialCommunityIcons name="magnify-plus-outline" size={20} color="white" />
//                   </View>
//                 </TouchableOpacity>
//               );
//             })}
//           </ScrollView>
//         )}
//         {hasTasks && (
//           <View style={styles.tasksContainer}>
//             <Text style={styles.tasksTitle}>{tSafe('completed_tasks', 'Completed Tasks:')}</Text>
//             <FlatList
//               data={roomData.tasks}
//               renderItem={renderTask}
//               keyExtractor={(item, index) => (item?.id ? item.id.toString() : `task_${index}`)}
//               numColumns={2}
//               columnWrapperStyle={styles.columnWrapper}
//               scrollEnabled={false}
//               ListEmptyComponent={
//                 <View style={styles.noTasksContainer}>
//                   <MaterialCommunityIcons name="list-outline" size={40} color="#ddd" />
//                   <Text style={styles.noTasksText}>{tSafe('no_tasks_assigned', 'No tasks assigned')}</Text>
//                 </View>
//               }
//             />
//           </View>
//         )}
//       </View>
//     );
//   };

//   const renderCleanlinessAnalysis = () => {
//     if (!currentImages[currentImageIndex]?.cleanliness) return null;
//     const cleanlinessData = currentImages[currentImageIndex].cleanliness;
//     const individualOverall = cleanlinessData.individual_overall || 0;
//     const invertedIndividualScore = invertPercentage(individualOverall);
//     const category = currentImages[currentImageIndex].category;
//     const categoryPhotos = getFilteredCleaners().flatMap(cleaner => {
//       const allTasks = getAllTasksForCleaner(cleaner);
//       return allTasks[category]?.photos || [];
//     });
//     const categoryTotal = categoryPhotos.reduce((sum, photo) => sum + (photo.cleanliness?.individual_overall || 0), 0);
//     const categoryAverage = categoryPhotos.length > 0 ? categoryTotal / categoryPhotos.length : 0;
//     const invertedCategoryScore = invertPercentage(categoryAverage);

//     const translateFactor = (factor) => {
//       const map = {
//         dust: tSafe('factor_dust', 'Dust'),
//         streaks: tSafe('factor_streaks', 'Streaks'),
//         spots: tSafe('factor_spots', 'Spots'),
//         debris: tSafe('factor_debris', 'Debris'),
//         shine: tSafe('factor_shine', 'Shine'),
//         organization: tSafe('factor_organization', 'Organization'),
//         smell: tSafe('factor_smell', 'Smell'),
//         stains: tSafe('factor_stains', 'Stains'),
//         cleanliness: tSafe('factor_cleanliness', 'Cleanliness'),
//         general: tSafe('factor_general', 'General'),
//       };
//       return map[factor] || factor.replace(/_/g, ' ').toUpperCase();
//     };

//     return (
//       <View style={styles.analysisContainer}>
//         <View style={styles.dragHandle} />
//         <View style={styles.cleanlinessDetails}>
//           <Text style={styles.detailHeader}>{tSafe('cleanliness_analysis', 'CLEANLINESS ANALYSIS')}</Text>
//           <View style={styles.scoreSection}>
//             <Text style={styles.sectionTitle}>{tSafe('this_photo', 'THIS PHOTO')}</Text>
//             <View style={styles.scoreRow}>
//               <View style={styles.scoreTextContainer}>
//                 <Text style={styles.percentageText}>{invertedIndividualScore.toFixed(0)}%</Text>
//                 <Text style={[styles.statusText, { color: getCleanlinessColor(invertedIndividualScore) }]}>
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
//           <Text style={styles.sectionTitle}>{tSafe('main_issues', 'MAIN ISSUES')}</Text>
//           <View style={styles.factorsContainer}>
//             {Object.entries(cleanlinessData.scores || {})
//               .sort(([, a], [, b]) => b - a)
//               .slice(0, 3)
//               .map(([factor, score]) => (
//                 <View key={factor} style={styles.factorItem}>
//                   <Text style={styles.factorName}>{translateFactor(factor)}</Text>
//                   <Text style={[styles.factorScore, { color: getCleanlinessColor(100 - (score * 10)) }]}>
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
//     const allTasks = getAllTasksForCleaner(cleaner);
//     const totalPhotos = getTotalPhotosForCleaner(cleaner);
//     const progressStatus = getCleanerProgressStatus(cleaner);

//     const hasAnyData = Object.values(allTasks).some(room => room.photos?.length > 0 || room.tasks?.length > 0);
//     if (!hasAnyData) return null;

//     const roomsToShow = selectedRoom === 'all'
//       ? Object.entries(allTasks)
//       : [[selectedRoom, allTasks[selectedRoom]]].filter(([_, data]) => data?.photos?.length || data?.tasks?.length);
//     if (roomsToShow.length === 0) return null;

//     const translatedStatus = getTranslatedProgressStatus(progressStatus);
//     const groupDisplay = `${tSafe('group', 'Group')} ${cleaner.group.replace('group_', '')}`;

//     const isPending = cleaner.status?.toLowerCase() === 'pending_review';
//     const isApproved = cleaner.status?.toLowerCase() === 'approved';
//     const isRejected = ['uncompleted', 'rejected', 'cancelled'].includes(cleaner.status?.toLowerCase());

//     return (
//       <Animatable.View
//         key={`${cleaner.cleanerId}-${index}`}
//         style={styles.cleanerCard}
//         animation="fadeInUp"
//         duration={600}
//         delay={index * 200}
//       >
//         <View style={styles.cleanerHeader}>
//           <View style={styles.cleanerInfo}>
//             <Image source={{ uri: cleaner.avatar }} style={styles.cleanerAvatar} contentFit="cover" />
//             <View style={styles.cleanerDetails}>
//               <Text style={styles.cleanerName}>{cleaner.firstname} {cleaner.lastname}</Text>
//               <View style={styles.cleanerMeta}>
//                 <Text style={styles.cleanerGroup}>{groupDisplay}</Text>
//                 <View style={[
//                   styles.statusBadge,
//                   progressStatus === 'completed' && styles.statusCompleted,
//                   progressStatus === 'in_progress' && styles.statusInProgress,
//                   progressStatus === 'partially_completed' && styles.statusPartiallyCompleted
//                 ]}>
//                   <Text style={styles.statusText}>{translatedStatus}</Text>
//                 </View>
//               </View>
//             </View>
//           </View>
//           <View style={styles.photoCountBadge}>
//             <MaterialCommunityIcons name="camera" size={16} color={COLORS.white} />
//             <Text style={styles.photoCountText}>{totalPhotos}</Text>
//           </View>
//         </View>

//         <View style={styles.roomsContainer}>
//           {roomsToShow.map(([roomName, roomData]) => renderRoomSection(cleaner, roomName, roomData))}
//         </View>

//         {isReviewMode && (
//           <View style={styles.cleanerActions}>
//             {isPending ? (
//               <>
//                 <TouchableOpacity
//                   style={[styles.actionButton, styles.rejectButtonSmall]}
//                   onPress={() => handleReject(cleaner.cleanerId)}
//                 >
//                   <Text style={styles.actionButtonText}>{tSafe('reject', 'Reject')}</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.actionButton, styles.approveButtonSmall]}
//                   onPress={() => handleApprove(cleaner.cleanerId)}
//                 >
//                   <Text style={styles.actionButtonText}>{tSafe('approve', 'Approve')}</Text>
//                 </TouchableOpacity>
//               </>
//             ) : (
//               <View style={styles.statusContainer}>
//                 <Text style={[styles.statusText, { color: isApproved ? '#4CAF50' : '#f44336' }]}>
//                   {isApproved ? tSafe('approved', 'Approved') : tSafe('rejected', 'Rejected')}
//                 </Text>
//               </View>
//             )}
//           </View>
//         )}
//       </Animatable.View>
//     );
//   };

//   const renderEmptyState = (type = 'general') => {
//     const messages = {
//       general: {
//         icon: 'camera-off',
//         title: tSafe('no_after_photos_title', 'No After Photos Yet'),
//         message: tSafe('no_after_photos_message', 'After photos and completed tasks will appear here once cleaners complete their work.'),
//       },
//       group: {
//         icon: 'account-group',
//         title: tSafe('no_photos_in_group_title', 'No Photos in This Group'),
//         message: tSafe('no_photos_in_group_message', 'Selected group has no after photos or completed tasks yet.'),
//       },
//       room: {
//         icon: 'door-open',
//         title: tSafe('no_photos_in_room_title', 'No Photos in This Room'),
//         message: tSafe('no_photos_in_room_message', 'Selected room has no after photos or completed tasks yet.'),
//       },
//     };
//     const { icon, title, message } = messages[type];
//     return (
//       <View style={styles.emptyState}>
//         <MaterialCommunityIcons name={icon} size={80} color={COLORS.light_gray} />
//         <Text style={styles.emptyStateTitle}>{title}</Text>
//         <Text style={styles.emptyStateText}>{message}</Text>
//       </View>
//     );
//   };

//   const filteredCleaners = getFilteredCleaners();
//   const hasContent = filteredCleaners.some(cleaner => {
//     const allTasks = getAllTasksForCleaner(cleaner);
//     return Object.values(allTasks).some(room => room.photos?.length > 0 || room.tasks?.length > 0);
//   });

//   // ─── Render ──────────────────────────────────────────────────────
//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />

//       {isLoading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text style={styles.loadingText}>{tSafe('loading_after_photos', 'Loading after photos...')}</Text>
//         </View>
//       ) : (
//         <View style={styles.content}>
//           <View style={styles.header}>
//             <View style={styles.headerTextContainer}>
//               <Text style={styles.headerTitle}>{tSafe('after_cleaning', 'After Cleaning')}</Text>
//               <Text style={styles.headerSubtitle}>
//                 {tSafe('after_cleaning_subtitle', 'Photos taken after cleaning is completed')}
//               </Text>
//             </View>
//             <View style={styles.summaryBadge}>
//               <Text style={styles.summaryText}>
//                 {assignedCleaners.length} {assignedCleaners.length === 1 ? tSafe('cleaner', 'cleaner') : tSafe('cleaners', 'cleaners')}
//               </Text>
//             </View>
//           </View>
//           <View>
//             {getGroups().length > 1 && renderGroupTabs()}
//             {renderRoomFilter()}
//           </View>

//           <View style={styles.mainContentArea}>
//             <ScrollView
//               showsVerticalScrollIndicator={false}
//               style={styles.cleanersScrollView}
//               contentContainerStyle={styles.cleanersList}
//               onScroll={onScroll}
//               scrollEventThrottle={16}
//             >
//               {hasContent ? (
//                 <View style={styles.cleanersContent}>
//                   {filteredCleaners.map((cleaner, index) => renderCleanerCard(cleaner, index))}
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

//       {/* Reject Reason Modal */}
//       <RNModal
//         visible={showRejectModal}
//         animationType="slide"
//         onRequestClose={() => setShowRejectModal(false)}
//         transparent={true}
//       >
//         <View style={styles.rejectModalOverlay}>
//           <View style={styles.rejectModalContainer}>
//             <Text style={styles.rejectModalTitle}>{tSafe('reject_work_reason', 'Why are you rejecting this work?')}</Text>
//             <View style={styles.rejectOptions}>
//               {rejectReasons.map((reason) => (
//                 <TouchableOpacity
//                   key={reason}
//                   style={[styles.rejectOption, selectedRejectReason === reason && styles.rejectOptionSelected]}
//                   onPress={() => {
//                     setSelectedRejectReason(reason);
//                     if (reason !== tSafe('reject_reason_other', 'Other')) setCustomRejectReason('');
//                   }}
//                 >
//                   <Text style={[styles.rejectOptionText, selectedRejectReason === reason && styles.rejectOptionTextSelected]}>
//                     {reason}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//             {selectedRejectReason === tSafe('reject_reason_other', 'Other') && (
//               <TextInput
//                 style={styles.rejectCustomInput}
//                 placeholder={tSafe('describe_reason', 'Describe the reason...')}
//                 value={customRejectReason}
//                 onChangeText={setCustomRejectReason}
//                 multiline
//               />
//             )}
//             <View style={styles.rejectModalActions}>
//               <TouchableOpacity style={[styles.rejectModalButton, styles.rejectModalCancel]} onPress={() => setShowRejectModal(false)}>
//                 <Text style={styles.rejectModalButtonText}>{tSafe('cancel', 'Cancel')}</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={[styles.rejectModalButton, styles.rejectModalConfirm]} onPress={confirmReject}>
//                 <Text style={styles.rejectModalButtonText}>{tSafe('confirm_reject', 'Confirm Reject')}</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </RNModal>

//       {/* Feedback Modal */}
      
//         <RNModal
//           visible={isFeedbackVisible}
//           animationType="slide"
//           onRequestClose={() => setFeedbackVisible(false)}
//           transparent={true}
//         >
//         <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//           <KeyboardAvoidingView
//             behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//             style={styles.feedbackModalContainer}
//           >
//             <FeedbackModal
//               onSubmit={handleFeedbackSubmit}
//               feedbackTo={currentFeedbackTo}
//               onInputFocus={() => setInputFocused(true)}
//               onInputBlur={() => setInputFocused(false)}
//               onClose={() => setFeedbackVisible(false)}
//             />
//           </KeyboardAvoidingView>
//         </TouchableWithoutFeedback>
//         </RNModal>
     

//       {/* Image Viewer Modal */}
//       <Modal
//         isVisible={isAfterModalVisible}
//         style={styles.modal}
//         onBackdropPress={() => setAfterModalVisible(false)}
//         onSwipeComplete={() => setAfterModalVisible(false)}
//         swipeDirection={['down']}
//         animationIn="fadeIn"
//         animationOut="fadeOut"
//       >
//         <View style={styles.imageViewerContainer}>
//           <ImageViewer
//             imageUrls={currentImages}
//             index={currentImageIndex}
//             backgroundColor="black"
//             enableSwipeDown
//             enableImageZoom
//             onCancel={() => setAfterModalVisible(false)}
//             onChange={(index) => setCurrentImageIndex(index)}
//             renderHeader={() => (
//               <TouchableOpacity style={styles.closeButton} onPress={() => setAfterModalVisible(false)}>
//                 <MaterialCommunityIcons name="close" size={24} color="white" />
//               </TouchableOpacity>
//             )}
//             renderImage={(props) => (
//               <Image {...props} style={styles.fullSizeImage} contentFit="contain" transition={300} />
//             )}
//           />
//           {renderCleanlinessAnalysis()}
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// // ─── Styles ──────────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: COLORS.white },
//   content: { flex: 1 },
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
//   headerTextContainer: { flex: 1 },
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
//   roomFilterContainer: { marginHorizontal: -20 },
//   roomFilterContent: { paddingHorizontal: 20 },
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
//   mainContentArea: { flex: 1 },
//   cleanersScrollView: { flex: 1 },
//   cleanersList: { flexGrow: 1 },
//   cleanersContent: { padding: 16 },
//   cleanerCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
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
//   cleanerDetails: { flex: 1 },
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
//   statusCompleted: { backgroundColor: COLORS.success },
//   statusInProgress: { backgroundColor: COLORS.warning },
//   statusPartiallyCompleted: { backgroundColor: COLORS.info },
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
//   roomsContainer: {},
//   roomSection: { marginBottom: 20 },
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
//   photosScrollContent: { paddingHorizontal: 16 },
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
//   tasksContainer: { marginTop: 8 },
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
//   columnWrapper: { justifyContent: 'space-between' },
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
//   modal: { margin: 0 },
//   imageViewerContainer: { flex: 1, backgroundColor: 'black' },
//   closeButton: {
//     position: 'absolute',
//     top: 50,
//     right: 20,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     borderRadius: 20,
//     padding: 10,
//     zIndex: 1,
//   },
//   fullSizeImage: { width: '100%', height: '100%' },
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
//   cleanlinessDetails: { gap: 20 },
//   detailHeader: {
//     color: 'white',
//     fontSize: 20,
//     fontWeight: '800',
//     marginBottom: 24,
//     textAlign: 'center',
//     letterSpacing: 0.5,
//   },
//   scoreSection: { marginBottom: 16 },
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
//   rejectModalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 0,
//   },
//   rejectModalContainer: {
//     backgroundColor: '#FFF',
//     borderRadius: 24,
//     padding: 24,
//     width: '100%',
//     alignSelf: 'center',
//     marginHorizontal: 0,
//   },
//   rejectCustomInput: {
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//     fontSize: 16,
//     minHeight: 80,
//     textAlignVertical: 'top',
//     width: '100%',
//   },
//   rejectModalTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   rejectOptions: { marginBottom: 16 },
//   rejectOption: {
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     marginBottom: 8,
//   },
//   rejectOptionSelected: {
//     borderColor: COLORS.primary,
//     backgroundColor: `${COLORS.primary}10`,
//   },
//   rejectOptionText: { fontSize: 16, color: '#333' },
//   rejectOptionTextSelected: {
//     color: COLORS.primary,
//     fontWeight: '600',
//   },
//   rejectModalActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   rejectModalButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginHorizontal: 4,
//   },
//   rejectModalCancel: { backgroundColor: COLORS.dark },
//   rejectModalConfirm: { backgroundColor: '#f44336' },
//   rejectModalButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#fff',
//   },
//   notStartedBadge: {
//     backgroundColor: '#f0f0f0',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   notStartedBadgeText: {
//     fontSize: 12,
//     color: '#666',
//     fontWeight: '500',
//   },
//   placeholderContainer: {
//     padding: 20,
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//     borderStyle: 'dashed',
//   },
//   placeholderText: {
//     marginTop: 8,
//     fontSize: 14,
//     color: '#999',
//     textAlign: 'center',
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
//   cleanerActions: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     marginTop: 12,
//     gap: 8,
//   },
//   actionButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     minWidth: 80,
//     alignItems: 'center',
//   },
//   approveButtonSmall: { backgroundColor: '#4CAF50' },
//   rejectButtonSmall: { backgroundColor: '#f44336' },
//   actionButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   statusContainer: {
//     alignItems: 'center',
//     padding: 6,
//   },
//   fullScreenModal: {
//     flex: 1,
//     margin: 0,
//     padding: 0,
//     backgroundColor: 'transparent',
//   },
//   feedbackModalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'transparent',
//     paddingHorizontal: 20,
//   },
// });

// export default AfterPhoto;

import React, {
  useContext,
  useCallback,
  useState,
  useMemo,
} from 'react';

import { useFocusEffect } from '@react-navigation/native';

import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  ScrollView,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  FlatList,
  Alert,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Modal as RNModal,
} from 'react-native';

import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import ImageViewer from 'react-native-image-zoom-viewer';
import Modal from 'react-native-modal';
import { Image } from 'expo-image';
import CircularProgress from 'react-native-circular-progress-indicator';

import { useTheme } from '../../../theme';
import { AppText } from '../../../ui';

import userService from '../../../services/connection/userService';
import { AuthContext } from '../../../context/AuthContext';
import formatRoomTitle from '../../../utils/formatRoomTitle';
import { tSafe } from '../../../utils/tSafe';
import FeedbackModal from '../../../components/shared/Feedback';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const getAllTasksForCleaner = (cleaner) => {
  const allTasks = {};

  if (!cleaner?.checklist?.details) {
    return allTasks;
  }

  Object.keys(cleaner.checklist.details).forEach((roomName) => {
    const roomData = cleaner.checklist.details[roomName] || {};

    const photos = Array.isArray(roomData.photos)
      ? roomData.photos
      : [];

    const tasks = Array.isArray(roomData.tasks)
      ? roomData.tasks
      : [];

    if (photos.length === 0 && tasks.length === 0) {
      return;
    }

    const completedTasks = tasks.filter(
      (task) => task.value === true
    );

    const pendingTasks = tasks.filter(
      (task) => task.value === false
    );

    let roomStatus = 'not_started';

    if (
      completedTasks.length > 0 &&
      pendingTasks.length === 0
    ) {
      roomStatus = 'completed';
    } else if (
      completedTasks.length > 0 ||
      photos.length > 0
    ) {
      roomStatus = 'in_progress';
    }

    allTasks[roomName] = {
      photos,
      tasks: completedTasks,
      pending_tasks: pendingTasks,
      status: roomStatus,
      total_tasks: tasks.length,
      completed_tasks: completedTasks.length,
    };
  });

  return allTasks;
};

const getTotalPhotosForCleaner = (cleaner) => {
  let total = 0;

  if (!cleaner?.checklist?.details) {
    return total;
  }

  Object.values(cleaner.checklist.details).forEach((roomData) => {
    if (Array.isArray(roomData.photos)) {
      total += roomData.photos.length;
    }
  });

  return total;
};

const getCleanerProgressStatus = (cleaner) => {
  const allTasks = getAllTasksForCleaner(cleaner);
  const rooms = Object.values(allTasks);

  if (rooms.length === 0) {
    return 'not_started';
  }

  const completedRooms = rooms.filter(
    (room) => room.status === 'completed'
  ).length;

  if (completedRooms === rooms.length) {
    return 'completed';
  }

  if (completedRooms > 0) {
    return 'partially_completed';
  }

  return 'in_progress';
};

const getTranslatedProgressStatus = (status) => {
  switch (status) {
    case 'not_started':
      return tSafe('status_not_started', 'Not Started');

    case 'in_progress':
      return tSafe('status_in_progress', 'In Progress');

    case 'completed':
      return tSafe('status_completed', 'Completed');

    case 'partially_completed':
      return tSafe(
        'status_partially_completed',
        'Partially Completed'
      );

    default:
      return status;
  }
};

const getCleanlinessLabel = (score) => {
  if (score <= 35) {
    return tSafe(
      'needs_deep_cleaning',
      'Needs Deep Cleaning'
    );
  }

  if (score <= 40) {
    return tSafe(
      'requires_attention',
      'Requires Attention'
    );
  }

  return tSafe('very_clean', 'Very Clean');
};

const getCleanlinessColor = (score, theme) => {
  if (score <= 35) {
    return theme.status.error;
  }

  if (score <= 40) {
    return theme.status.warning;
  }

  return theme.status.success;
};

const getCleanlinessIcon = (score) => {
  if (score <= 35) {
    return 'times';
  }

  if (score <= 40) {
    return 'exclamation';
  }

  return 'check';
};

const formatGroupName = (group) => {
  if (!group) {
    return tSafe('group', 'Group');
  }

  const suffix = String(group).replace(/^group_/i, '');

  return `${tSafe('group', 'Group')} ${suffix.toUpperCase()}`;
};

const getImageUrl = (photo) => {
  if (typeof photo === 'string') {
    return photo;
  }

  return (
    photo?.img_url ||
    photo?.url ||
    photo?.uri ||
    ''
  );
};

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

const AfterPhoto = ({
  scheduleId,
  schedule,
  onScroll,
  mode,
  isReviewMode = false,
}) => {
  const { theme, isDark } = useTheme();

  const styles = useMemo(
    () => createStyles(theme, isDark),
    [theme, isDark]
  );

  const { currentUserId } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [assignedCleaners, setAssignedCleaners] = useState([]);

  const [isAfterModalVisible, setAfterModalVisible] =
    useState(false);

  const [currentImageIndex, setCurrentImageIndex] =
    useState(0);

  const [currentImages, setCurrentImages] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState('all');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectReason, setSelectedRejectReason] =
    useState(null);

  const [customRejectReason, setCustomRejectReason] =
    useState('');

  const [selectedCleanerId, setSelectedCleanerId] =
    useState(null);

  const [isFeedbackVisible, setFeedbackVisible] =
    useState(false);

  const [currentFeedbackTo, setCurrentFeedbackTo] =
    useState(null);

  const pan = useState(new Animated.ValueXY())[0];
  const overlayOpacity = useState(new Animated.Value(1))[0];

  const rejectReasons = useMemo(
    () => [
      tSafe('reject_reason_no_show', 'No Show'),
      tSafe('reject_reason_came_late', 'Came Late'),
      tSafe(
        'reject_reason_cleaning_concerns',
        'Cleaning Concerns'
      ),
      tSafe(
        'reject_reason_damaged_property',
        'Damaged Property'
      ),
      tSafe('reject_reason_other', 'Other'),
    ],
    []
  );

  // ───────────────────────────────────────────────────────────
  // Fetch data
  // ───────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!scheduleId) {
      setAssignedCleaners([]);
      return;
    }

    try {
      setIsLoading(true);

      const response =
        await userService.getUpdatedImageUrls(scheduleId);

      const data = response?.data?.data;

      setAssignedCleaners(
        Array.isArray(data?.assignedTo)
          ? data.assignedTo
          : []
      );
    } catch (error) {
      console.error(
        'Error fetching after photos:',
        error
      );
    } finally {
      setIsLoading(false);
    }
  }, [scheduleId]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        if (!scheduleId) {
          setAssignedCleaners([]);
          return;
        }

        try {
          setIsLoading(true);

          const response =
            await userService.getUpdatedImageUrls(
              scheduleId
            );

          if (!active) {
            return;
          }

          const data = response?.data?.data;

          setAssignedCleaners(
            Array.isArray(data?.assignedTo)
              ? data.assignedTo
              : []
          );
        } catch (error) {
          if (active) {
            console.error(
              'Error fetching after photos:',
              error
            );
          }
        } finally {
          if (active) {
            setIsLoading(false);
          }
        }
      };

      load();

      return () => {
        active = false;
      };
    }, [scheduleId])
  );

  // ───────────────────────────────────────────────────────────
  // Review handlers
  // ───────────────────────────────────────────────────────────

  const handleApprove = async (cleanerId) => {
    try {
      await userService.approveWork({
        scheduleId,
        cleanerId,
      });

      setCurrentFeedbackTo(cleanerId);
      setFeedbackVisible(true);

      await fetchData();
    } catch (error) {
      Alert.alert(
        tSafe('error', 'Error'),
        tSafe(
          'approval_failed',
          'Could not approve work.'
        )
      );
    }
  };

  const handleFeedbackSubmit = async (feedback) => {
    try {
      const data = {
        scheduleId,
        cleanerId: currentFeedbackTo,
        ...feedback,
      };

      await userService.sendFeedback(data);

      Alert.alert(
        tSafe('thank_you', 'Thank You'),
        tSafe(
          'feedback_submitted',
          'Your feedback has been submitted!'
        )
      );

      setFeedbackVisible(false);
    } catch (error) {
      Alert.alert(
        tSafe('error', 'Error'),
        tSafe(
          'feedback_failed',
          'Failed to send feedback. Please try again.'
        )
      );
    }
  };

  const handleReject = (cleanerId) => {
    setSelectedCleanerId(cleanerId);
    setSelectedRejectReason(null);
    setCustomRejectReason('');
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!selectedRejectReason) {
      Alert.alert(
        tSafe('error', 'Error'),
        tSafe(
          'please_select_reason',
          'Please select a reason for rejection.'
        )
      );

      return;
    }

    const isOther =
      selectedRejectReason ===
      tSafe('reject_reason_other', 'Other');

    const reason = isOther
      ? customRejectReason.trim()
      : selectedRejectReason;

    if (isOther && !reason) {
      Alert.alert(
        tSafe('error', 'Error'),
        tSafe(
          'describe_reason',
          'Please describe the reason for rejection.'
        )
      );

      return;
    }

    try {
      await userService.rejectWork({
        scheduleId,
        cleanerId: selectedCleanerId,
        reason,
      });

      Alert.alert(
        tSafe('success', 'Success'),
        tSafe('work_rejected', 'Work rejected.')
      );

      await fetchData();
    } catch (error) {
      Alert.alert(
        tSafe('error', 'Error'),
        tSafe(
          'reject_failed',
          'Could not reject work.'
        )
      );
    } finally {
      setShowRejectModal(false);
      setSelectedRejectReason(null);
      setCustomRejectReason('');
      setSelectedCleanerId(null);
    }
  };

  // ───────────────────────────────────────────────────────────
  // Group and room filters
  // ───────────────────────────────────────────────────────────

  const getGroups = () => {
    const groups = new Set(
      assignedCleaners
        .map((cleaner) => cleaner.group)
        .filter(Boolean)
    );

    return ['all', ...Array.from(groups)];
  };

  const getFilteredCleaners = () => {
    if (selectedGroup === 'all') {
      return assignedCleaners;
    }

    return assignedCleaners.filter(
      (cleaner) => cleaner.group === selectedGroup
    );
  };

  const getAllRooms = () => {
    const rooms = new Set();

    getFilteredCleaners().forEach((cleaner) => {
      const allTasks = getAllTasksForCleaner(cleaner);

      Object.keys(allTasks).forEach((room) => {
        const roomData = allTasks[room];

        if (
          roomData.photos?.length > 0 ||
          roomData.tasks?.length > 0
        ) {
          rooms.add(room);
        }
      });
    });

    return ['all', ...Array.from(rooms)];
  };

  const invertPercentage = (score) => {
    const numericScore = Number(score) || 0;

    return Math.max(
      0,
      Math.min(100, 100 - numericScore * 10)
    );
  };

  const getTotalPhotosForGroup = (group) => {
    const cleaners =
      group === 'all'
        ? assignedCleaners
        : assignedCleaners.filter(
            (cleaner) => cleaner.group === group
          );

    return cleaners.reduce(
      (total, cleaner) =>
        total + getTotalPhotosForCleaner(cleaner),
      0
    );
  };

  // ───────────────────────────────────────────────────────────
  // Image viewer
  // ───────────────────────────────────────────────────────────

  const openImageViewer = (
    images,
    index,
    category
  ) => {
    pan.setValue({ x: 0, y: 0 });
    overlayOpacity.setValue(1);

    const formattedImages = images
      .map((photo) => {
        const cleanliness = photo?.cleanliness || {};
        const individualScore =
          cleanliness.individual_overall || 0;

        const score = invertPercentage(individualScore);
        const status = getCleanlinessLabel(score);

        const originalUrl = getImageUrl(photo);

        const imageUrl =
          status ===
          tSafe('very_clean', 'Very Clean')
            ? originalUrl
            : cleanliness.heatmap_url || originalUrl;

        if (!imageUrl) {
          return null;
        }

        return {
          url: imageUrl,
          cleanliness,
          props: {
            source: {
              uri: imageUrl,
            },
          },
          category,
        };
      })
      .filter(Boolean);

    if (formattedImages.length === 0) {
      return;
    }

    setCurrentImages(formattedImages);

    setCurrentImageIndex(
      Math.max(
        0,
        Math.min(index, formattedImages.length - 1)
      )
    );

    setAfterModalVisible(true);
  };

  // ───────────────────────────────────────────────────────────
  // Group tabs
  // ───────────────────────────────────────────────────────────

  const renderGroupTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.groupTabsContainer}
      contentContainerStyle={styles.groupTabsContent}
    >
      {getGroups().map((group) => {
        const photoCount =
          getTotalPhotosForGroup(group);

        if (photoCount === 0 && group !== 'all') {
          return null;
        }

        const displayName =
          group === 'all'
            ? tSafe('all_groups', 'All Groups')
            : formatGroupName(group);

        const isSelected = selectedGroup === group;

        return (
          <TouchableOpacity
            key={group}
            accessibilityRole="button"
            accessibilityState={{
              selected: isSelected,
            }}
            style={[
              styles.groupTab,
              isSelected && styles.groupTabActive,
            ]}
            onPress={() => {
              setSelectedGroup(group);
              setSelectedRoom('all');
            }}
          >
            <AppText
              style={[
                styles.groupTabText,
                isSelected &&
                  styles.groupTabTextActive,
              ]}
            >
              {displayName}
            </AppText>

            <View
              style={[
                styles.groupBadge,
                isSelected &&
                  styles.groupBadgeActive,
              ]}
            >
              <AppText
                style={[
                  styles.groupBadgeText,
                  isSelected &&
                    styles.groupBadgeTextActive,
                ]}
              >
                {photoCount}
              </AppText>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  // ───────────────────────────────────────────────────────────
  // Room filters
  // ───────────────────────────────────────────────────────────

  const renderRoomFilter = () => {
    const rooms = getAllRooms();

    if (rooms.length <= 1) {
      return null;
    }

    return (
      <View style={styles.roomFilterSection}>
        <AppText
          variant="label"
          color={theme.text.secondary}
          style={styles.roomFilterTitle}
        >
          {tSafe('filter_by_room', 'Filter by Room')}
        </AppText>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.roomFilterContainer}
          contentContainerStyle={styles.roomFilterContent}
        >
          {rooms.map((room) => {
            const isSelected = selectedRoom === room;

            return (
              <TouchableOpacity
                key={room}
                accessibilityRole="button"
                accessibilityState={{
                  selected: isSelected,
                }}
                style={[
                  styles.roomFilterTab,
                  isSelected &&
                    styles.roomFilterTabActive,
                ]}
                onPress={() => setSelectedRoom(room)}
              >
                <AppText
                  style={[
                    styles.roomFilterText,
                    isSelected &&
                      styles.roomFilterTextActive,
                  ]}
                >
                  {room === 'all'
                    ? tSafe('all_rooms', 'All Rooms')
                    : formatRoomTitle(room)}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  // ───────────────────────────────────────────────────────────
  // Room section
  // ───────────────────────────────────────────────────────────

  const renderRoomSection = (
    cleaner,
    roomName,
    roomData
  ) => {
    if (!roomData) {
      return null;
    }

    const photos = Array.isArray(roomData.photos)
      ? roomData.photos
      : [];

    const completedTasks = Array.isArray(roomData.tasks)
      ? roomData.tasks
      : [];

    const hasPhotos = photos.length > 0;
    const hasTasks = completedTasks.length > 0;
    const hasProgress = hasPhotos || hasTasks;

    if (!hasProgress) {
      return (
        <View
          key={roomName}
          style={styles.roomSection}
        >
          <View style={styles.roomHeader}>
            <AppText
              variant="subtitle"
              style={styles.roomTitle}
            >
              {formatRoomTitle(roomName)}
            </AppText>

            <View style={styles.notStartedBadge}>
              <AppText
                style={styles.notStartedBadgeText}
              >
                {tSafe(
                  'not_started',
                  'Not Started'
                )}
              </AppText>
            </View>
          </View>

          <View style={styles.placeholderContainer}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={28}
              color={theme.icon.muted}
            />

            <AppText
              color={theme.text.secondary}
              style={styles.placeholderText}
            >
              {tSafe(
                'no_updates_yet',
                'Cleaner has not started this room yet'
              )}
            </AppText>
          </View>
        </View>
      );
    }

    const photoCount = photos.length;

    const photoLabel =
      photoCount === 1
        ? tSafe('photo', 'photo')
        : tSafe('photos', 'photos');

    return (
      <View
        key={roomName}
        style={styles.roomSection}
      >
        <View style={styles.roomHeader}>
          <AppText
            variant="subtitle"
            style={styles.roomTitle}
          >
            {formatRoomTitle(roomName)}
          </AppText>

          <AppText
            variant="caption"
            color={theme.text.secondary}
            style={styles.roomPhotoCount}
          >
            {photoCount} {photoLabel}
          </AppText>
        </View>

        {hasPhotos && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.photosScrollView}
            contentContainerStyle={
              styles.photosScrollContent
            }
          >
            {photos.map((photo, photoIndex) => {
              const imageUrl = getImageUrl(photo);

              if (!imageUrl) {
                return null;
              }

              const cleanliness =
                photo?.cleanliness || {};

              const score = invertPercentage(
                cleanliness.individual_overall || 0
              );

              const statusColor =
                getCleanlinessColor(score, theme);

              return (
                <TouchableOpacity
                  key={
                    photo?._id ||
                    photo?.id ||
                    `${roomName}-photo-${photoIndex}`
                  }
                  accessibilityRole="imagebutton"
                  accessibilityLabel={tSafe(
                    'view_cleaning_photo',
                    'View cleaning photo'
                  )}
                  style={styles.photoCard}
                  onPress={() =>
                    openImageViewer(
                      photos,
                      photoIndex,
                      roomName
                    )
                  }
                >
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.photoImage}
                    contentFit="cover"
                    transition={250}
                  />

                  <View
                    style={[
                      styles.cleanlinessBadge,
                      {
                        backgroundColor: statusColor,
                      },
                    ]}
                  >
                    <FontAwesome
                      name={getCleanlinessIcon(score)}
                      size={13}
                      color={theme.text.inverse}
                    />
                  </View>

                  <View style={styles.photoOverlay}>
                    <MaterialCommunityIcons
                      name="magnify-plus-outline"
                      size={22}
                      color="#FFFFFF"
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {hasTasks && (
          <View style={styles.tasksContainer}>
            <AppText
              variant="label"
              style={styles.tasksTitle}
            >
              {tSafe(
                'completed_tasks',
                'Completed Tasks'
              )}
            </AppText>

            <FlatList
              data={completedTasks}
              renderItem={({ item, index }) => (
                <View
                  key={
                    item?.id ||
                    `task-${index}`
                  }
                  style={styles.taskContainer}
                >
                  <FontAwesome
                    name={
                      item.value
                        ? 'check'
                        : 'times'
                    }
                    size={12}
                    color={
                      item.value
                        ? theme.status.success
                        : theme.status.error
                    }
                  />

                  <AppText
                    style={styles.taskText}
                  >
                    {item.label}
                  </AppText>
                </View>
              )}
              keyExtractor={(item, index) =>
                item?.id
                  ? String(item.id)
                  : `task-${index}`
              }
              numColumns={2}
              columnWrapperStyle={
                styles.columnWrapper
              }
              scrollEnabled={false}
              ListEmptyComponent={
                <View
                  style={styles.noTasksContainer}
                >
                  <MaterialCommunityIcons
                    name="clipboard-list-outline"
                    size={36}
                    color={theme.icon.muted}
                  />

                  <AppText
                    color={theme.text.secondary}
                    style={styles.noTasksText}
                  >
                    {tSafe(
                      'no_tasks_assigned',
                      'No tasks assigned'
                    )}
                  </AppText>
                </View>
              }
            />
          </View>
        )}
      </View>
    );
  };

  // ───────────────────────────────────────────────────────────
  // Cleanliness analysis
  // ───────────────────────────────────────────────────────────

  const renderCleanlinessAnalysis = () => {
    const currentImage =
      currentImages[currentImageIndex];

    if (!currentImage?.cleanliness) {
      return null;
    }

    const cleanlinessData =
      currentImage.cleanliness;

    const individualOverall =
      cleanlinessData.individual_overall || 0;

    const invertedIndividualScore =
      invertPercentage(individualOverall);

    const category = currentImage.category;

    const categoryPhotos = getFilteredCleaners().flatMap(
      (cleaner) => {
        const allTasks =
          getAllTasksForCleaner(cleaner);

        return allTasks[category]?.photos || [];
      }
    );

    const categoryTotal = categoryPhotos.reduce(
      (sum, photo) =>
        sum +
        (photo?.cleanliness?.individual_overall || 0),
      0
    );

    const categoryAverage =
      categoryPhotos.length > 0
        ? categoryTotal / categoryPhotos.length
        : 0;

    const invertedCategoryScore =
      invertPercentage(categoryAverage);

    const translateFactor = (factor) => {
      const map = {
        dust: tSafe('factor_dust', 'Dust'),
        streaks: tSafe(
          'factor_streaks',
          'Streaks'
        ),
        spots: tSafe('factor_spots', 'Spots'),
        debris: tSafe('factor_debris', 'Debris'),
        shine: tSafe('factor_shine', 'Shine'),
        organization: tSafe(
          'factor_organization',
          'Organization'
        ),
        smell: tSafe('factor_smell', 'Smell'),
        stains: tSafe('factor_stains', 'Stains'),
        cleanliness: tSafe(
          'factor_cleanliness',
          'Cleanliness'
        ),
        general: tSafe('factor_general', 'General'),
      };

      return (
        map[factor] ||
        String(factor)
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
          )
      );
    };

    const individualColor =
      getCleanlinessColor(
        invertedIndividualScore,
        theme
      );

    return (
      <View style={styles.analysisContainer}>
        <View style={styles.dragHandle} />

        <View style={styles.cleanlinessDetails}>
          <AppText
            style={styles.detailHeader}
          >
            {tSafe(
              'cleanliness_analysis',
              'CLEANLINESS ANALYSIS'
            )}
          </AppText>

          <View style={styles.scoreSection}>
            <AppText
              style={styles.sectionTitle}
            >
              {tSafe('this_photo', 'THIS PHOTO')}
            </AppText>

            <View style={styles.scoreRow}>
              <View
                style={styles.scoreTextContainer}
              >
                <AppText
                  style={styles.percentageText}
                >
                  {invertedIndividualScore.toFixed(0)}%
                </AppText>

                <AppText
                  style={[
                    styles.analysisStatusText,
                    { color: individualColor },
                  ]}
                >
                  {getCleanlinessLabel(
                    invertedIndividualScore
                  )}
                </AppText>
              </View>

              <CircularProgress
                value={invertedIndividualScore}
                radius={38}
                activeStrokeColor={individualColor}
                inActiveStrokeColor={
                  isDark ? '#354154' : '#D8E0EA'
                }
                maxValue={100}
                duration={700}
                valueSuffix="%"
                titleColor="#FFFFFF"
                valueColor="#FFFFFF"
              />
            </View>
          </View>

          <View style={styles.categoryAverage}>
            <AppText
              style={styles.sectionTitle}
            >
              {tSafe(
                'room_average',
                'ROOM AVERAGE'
              )}
            </AppText>

            <View style={styles.categoryAverageRow}>
              <AppText
                style={styles.categoryAverageText}
              >
                {invertedCategoryScore.toFixed(0)}%
              </AppText>

              <AppText
                style={styles.categoryAverageCaption}
              >
                {formatRoomTitle(category || '')}
              </AppText>
            </View>
          </View>

          <AppText
            style={styles.sectionTitle}
          >
            {tSafe('main_issues', 'MAIN ISSUES')}
          </AppText>

          <View style={styles.factorsContainer}>
            {Object.entries(
              cleanlinessData.scores || {}
            )
              .sort(
                ([, a], [, b]) =>
                  Number(b) - Number(a)
              )
              .slice(0, 3)
              .map(([factor, score]) => {
                const factorScore =
                  invertPercentage(score);

                return (
                  <View
                    key={factor}
                    style={styles.factorItem}
                  >
                    <AppText
                      style={styles.factorName}
                    >
                      {translateFactor(factor)}
                    </AppText>

                    <AppText
                      style={[
                        styles.factorScore,
                        {
                          color: getCleanlinessColor(
                            factorScore,
                            theme
                          ),
                        },
                      ]}
                    >
                      {factorScore.toFixed(0)}%
                    </AppText>
                  </View>
                );
              })}
          </View>
        </View>
      </View>
    );
  };

  // ───────────────────────────────────────────────────────────
  // Cleaner cards
  // ───────────────────────────────────────────────────────────

  const renderCleanerCard = (cleaner, index) => {
    const allTasks =
      getAllTasksForCleaner(cleaner);

    const totalPhotos =
      getTotalPhotosForCleaner(cleaner);

    const progressStatus =
      getCleanerProgressStatus(cleaner);

    const hasAnyData = Object.values(allTasks).some(
      (room) =>
        room.photos?.length > 0 ||
        room.tasks?.length > 0
    );

    if (!hasAnyData) {
      return null;
    }

    const roomsToShow =
      selectedRoom === 'all'
        ? Object.entries(allTasks)
        : [
            [
              selectedRoom,
              allTasks[selectedRoom],
            ],
          ].filter(
            ([, data]) =>
              data?.photos?.length ||
              data?.tasks?.length
          );

    if (roomsToShow.length === 0) {
      return null;
    }

    const translatedStatus =
      getTranslatedProgressStatus(progressStatus);

    const groupDisplay =
      formatGroupName(cleaner.group);

    const cleanerStatus = String(
      cleaner.status || ''
    ).toLowerCase();

    const isPending =
      cleanerStatus === 'pending_review';

    const isApproved =
      cleanerStatus === 'approved';

    const isRejected = [
      'uncompleted',
      'rejected',
      'cancelled',
    ].includes(cleanerStatus);

    return (
      <Animatable.View
        key={`${cleaner.cleanerId || cleaner._id || index}`}
        style={styles.cleanerCard}
        animation="fadeInUp"
        duration={400}
        delay={Math.min(index * 100, 400)}
      >
        <View style={styles.cleanerHeader}>
          <View style={styles.cleanerInfo}>
            <Image
              source={
                cleaner.avatar
                  ? { uri: cleaner.avatar }
                  : undefined
              }
              style={styles.cleanerAvatar}
              contentFit="cover"
              transition={200}
            />

            <View style={styles.cleanerDetails}>
              <AppText
                variant="subtitle"
                style={styles.cleanerName}
              >
                {`${cleaner.firstname || ''} ${
                  cleaner.lastname || ''
                }`.trim() ||
                  tSafe(
                    'cleaner',
                    'Cleaner'
                  )}
              </AppText>

              <View style={styles.cleanerMeta}>
                <AppText
                  style={styles.cleanerGroup}
                >
                  {groupDisplay}
                </AppText>

                <View
                  style={[
                    styles.statusBadge,
                    progressStatus === 'completed' &&
                      styles.statusCompleted,
                    progressStatus === 'in_progress' &&
                      styles.statusInProgress,
                    progressStatus ===
                      'partially_completed' &&
                      styles.statusPartiallyCompleted,
                  ]}
                >
                  <AppText
                    style={[
                      styles.statusText,
                      progressStatus !== 'not_started' &&
                        styles.statusTextOnColor,
                    ]}
                  >
                    {translatedStatus}
                  </AppText>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.photoCountBadge}>
            <MaterialCommunityIcons
              name="camera-outline"
              size={16}
              color={theme.text.inverse}
            />

            <AppText
              style={styles.photoCountText}
            >
              {totalPhotos}
            </AppText>
          </View>
        </View>

        <View style={styles.roomsContainer}>
          {roomsToShow.map(([roomName, roomData]) =>
            renderRoomSection(
              cleaner,
              roomName,
              roomData
            )
          )}
        </View>

        {isReviewMode && (
          <View style={styles.cleanerActions}>
            {isPending ? (
              <>
                <TouchableOpacity
                  accessibilityRole="button"
                  style={[
                    styles.actionButton,
                    styles.rejectButtonSmall,
                  ]}
                  onPress={() =>
                    handleReject(cleaner.cleanerId)
                  }
                >
                  <MaterialCommunityIcons
                    name="close-circle-outline"
                    size={16}
                    color="#FFFFFF"
                  />

                  <AppText
                    style={styles.actionButtonText}
                  >
                    {tSafe('reject', 'Reject')}
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  accessibilityRole="button"
                  style={[
                    styles.actionButton,
                    styles.approveButtonSmall,
                  ]}
                  onPress={() =>
                    handleApprove(cleaner.cleanerId)
                  }
                >
                  <MaterialCommunityIcons
                    name="check-circle-outline"
                    size={16}
                    color="#FFFFFF"
                  />

                  <AppText
                    style={styles.actionButtonText}
                  >
                    {tSafe('approve', 'Approve')}
                  </AppText>
                </TouchableOpacity>
              </>
            ) : (
              <View
                style={[
                  styles.reviewStatusContainer,
                  isApproved
                    ? styles.approvedStatus
                    : styles.rejectedStatus,
                ]}
              >
                <MaterialCommunityIcons
                  name={
                    isApproved
                      ? 'check-circle-outline'
                      : 'alert-circle-outline'
                  }
                  size={17}
                  color={
                    isApproved
                      ? theme.status.success
                      : theme.status.error
                  }
                />

                <AppText
                  style={[
                    styles.reviewStatusText,
                    {
                      color: isApproved
                        ? theme.status.success
                        : theme.status.error,
                    },
                  ]}
                >
                  {isApproved
                    ? tSafe('approved', 'Approved')
                    : isRejected
                    ? tSafe('rejected', 'Rejected')
                    : tSafe(
                        'review_status_pending',
                        'Awaiting Review'
                      )}
                </AppText>
              </View>
            )}
          </View>
        )}
      </Animatable.View>
    );
  };

  // ───────────────────────────────────────────────────────────
  // Empty state
  // ───────────────────────────────────────────────────────────

  const renderEmptyState = (type = 'general') => {
    const messages = {
      general: {
        icon: 'camera-off-outline',
        title: tSafe(
          'no_after_photos_title',
          'No After Photos Yet'
        ),
        message: tSafe(
          'no_after_photos_message',
          'After photos and completed tasks will appear here once cleaners complete their work.'
        ),
      },

      group: {
        icon: 'account-group-outline',
        title: tSafe(
          'no_photos_in_group_title',
          'No Photos in This Group'
        ),
        message: tSafe(
          'no_photos_in_group_message',
          'The selected group has no after photos or completed tasks yet.'
        ),
      },

      room: {
        icon: 'door-closed',
        title: tSafe(
          'no_photos_in_room_title',
          'No Photos in This Room'
        ),
        message: tSafe(
          'no_photos_in_room_message',
          'The selected room has no after photos or completed tasks yet.'
        ),
      },
    };

    const { icon, title, message } =
      messages[type] || messages.general;

    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyStateIcon}>
          <MaterialCommunityIcons
            name={icon}
            size={42}
            color={theme.brand.primary}
          />
        </View>

        <AppText
          variant="heading"
          style={styles.emptyStateTitle}
        >
          {title}
        </AppText>

        <AppText
          color={theme.text.secondary}
          style={styles.emptyStateText}
        >
          {message}
        </AppText>
      </View>
    );
  };

  const filteredCleaners = getFilteredCleaners();

  const visibleCleaners = filteredCleaners.filter(
    (cleaner) => {
      const allTasks =
        getAllTasksForCleaner(cleaner);

      const hasData = Object.values(allTasks).some(
        (room) =>
          room.photos?.length > 0 ||
          room.tasks?.length > 0
      );

      if (!hasData) {
        return false;
      }

      if (selectedRoom === 'all') {
        return true;
      }

      const room = allTasks[selectedRoom];

      return Boolean(
        room?.photos?.length ||
        room?.tasks?.length
      );
    }
  );

  // ───────────────────────────────────────────────────────────
  // Main render
  // ───────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.background.default}
        barStyle={
          isDark ? 'light-content' : 'dark-content'
        }
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.brand.primary}
          />

          <AppText
            color={theme.text.secondary}
            style={styles.loadingText}
          >
            {tSafe(
              'loading_after_photos',
              'Loading after photos...'
            )}
          </AppText>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons
                name="camera-check-outline"
                size={24}
                color={theme.brand.primary}
              />
            </View>

            <View style={styles.headerTextContainer}>
              <AppText
                variant="heading"
                style={styles.headerTitle}
              >
                {tSafe(
                  'after_cleaning',
                  'After Cleaning'
                )}
              </AppText>

              <AppText
                color={theme.text.secondary}
                style={styles.headerSubtitle}
              >
                {tSafe(
                  'after_cleaning_subtitle',
                  'Photos taken after cleaning is completed'
                )}
              </AppText>
            </View>

            <View style={styles.summaryBadge}>
              <AppText
                style={styles.summaryText}
              >
                {assignedCleaners.length}{' '}
                {assignedCleaners.length === 1
                  ? tSafe('cleaner', 'Cleaner')
                  : tSafe('cleaners', 'Cleaners')}
              </AppText>
            </View>
          </View>

          <View>
            {getGroups().length > 1 &&
              renderGroupTabs()}

            {renderRoomFilter()}
          </View>

          <View style={styles.mainContentArea}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.cleanersScrollView}
              contentContainerStyle={
                styles.cleanersList
              }
              onScroll={onScroll}
              scrollEventThrottle={16}
            >
              {visibleCleaners.length > 0 ? (
                <View style={styles.cleanersContent}>
                  {visibleCleaners.map(
                    (cleaner, index) =>
                      renderCleanerCard(
                        cleaner,
                        index
                      )
                  )}
                </View>
              ) : (
                renderEmptyState(
                  selectedRoom !== 'all'
                    ? 'room'
                    : selectedGroup !== 'all'
                    ? 'group'
                    : 'general'
                )
              )}
            </ScrollView>
          </View>
        </View>
      )}

      {/* ────────────────────────────────────────────────
          Reject Reason Modal
      ──────────────────────────────────────────────── */}

      <RNModal
        visible={showRejectModal}
        animationType="slide"
        onRequestClose={() =>
          setShowRejectModal(false)
        }
        transparent
        statusBarTranslucent
      >
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
        >
          <View style={styles.rejectModalOverlay}>
            <View
              style={styles.rejectModalContainer}
            >
              <View style={styles.rejectModalHeader}>
                <View style={styles.rejectModalIcon}>
                  <MaterialCommunityIcons
                    name="alert-circle-outline"
                    size={25}
                    color={theme.status.error}
                  />
                </View>

                <AppText
                  variant="heading"
                  style={styles.rejectModalTitle}
                >
                  {tSafe(
                    'reject_work_reason',
                    'Why are you rejecting this work?'
                  )}
                </AppText>

                <AppText
                  color={theme.text.secondary}
                  style={styles.rejectModalSubtitle}
                >
                  {tSafe(
                    'select_rejection_reason',
                    'Select a reason to continue.'
                  )}
                </AppText>
              </View>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                style={styles.rejectOptions}
                showsVerticalScrollIndicator={false}
              >
                {rejectReasons.map((reason) => {
                  const selected =
                    selectedRejectReason === reason;

                  return (
                    <TouchableOpacity
                      key={reason}
                      accessibilityRole="radio"
                      accessibilityState={{
                        selected,
                      }}
                      style={[
                        styles.rejectOption,
                        selected &&
                          styles.rejectOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedRejectReason(
                          reason
                        );

                        if (
                          reason !==
                          tSafe(
                            'reject_reason_other',
                            'Other'
                          )
                        ) {
                          setCustomRejectReason('');
                        }
                      }}
                    >
                      <AppText
                        style={[
                          styles.rejectOptionText,
                          selected &&
                            styles.rejectOptionTextSelected,
                        ]}
                      >
                        {reason}
                      </AppText>

                      <MaterialCommunityIcons
                        name={
                          selected
                            ? 'radiobox-marked'
                            : 'radiobox-blank'
                        }
                        size={21}
                        color={
                          selected
                            ? theme.brand.primary
                            : theme.icon.muted
                        }
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {selectedRejectReason ===
                tSafe(
                  'reject_reason_other',
                  'Other'
                ) && (
                <TextInput
                  style={styles.rejectCustomInput}
                  placeholder={tSafe(
                    'describe_reason',
                    'Describe the reason...'
                  )}
                  placeholderTextColor={
                    theme.input.placeholder
                  }
                  value={customRejectReason}
                  onChangeText={
                    setCustomRejectReason
                  }
                  multiline
                  textAlignVertical="top"
                  maxLength={1000}
                />
              )}

              <View style={styles.rejectModalActions}>
                <TouchableOpacity
                  style={[
                    styles.rejectModalButton,
                    styles.rejectModalCancel,
                  ]}
                  onPress={() => {
                    setShowRejectModal(false);
                    setSelectedRejectReason(null);
                    setCustomRejectReason('');
                    setSelectedCleanerId(null);
                  }}
                >
                  <AppText
                    style={styles.rejectCancelText}
                  >
                    {tSafe('cancel', 'Cancel')}
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.rejectModalButton,
                    styles.rejectModalConfirm,
                  ]}
                  onPress={confirmReject}
                >
                  <AppText
                    style={styles.rejectConfirmText}
                  >
                    {tSafe(
                      'confirm_reject',
                      'Confirm Rejection'
                    )}
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </RNModal>

      {/* ────────────────────────────────────────────────
          Feedback Modal
      ──────────────────────────────────────────────── */}

      <RNModal
        visible={isFeedbackVisible}
        animationType="slide"
        onRequestClose={() =>
          setFeedbackVisible(false)
        }
        transparent
        statusBarTranslucent
      >
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
        >
          <KeyboardAvoidingView
            behavior={
              Platform.OS === 'ios'
                ? 'padding'
                : 'height'
            }
            style={styles.feedbackModalContainer}
          >
            <FeedbackModal
              onSubmit={handleFeedbackSubmit}
              feedbackTo={currentFeedbackTo}
              onInputFocus={() => {}}
              onInputBlur={() => {}}
              onClose={() =>
                setFeedbackVisible(false)
              }
            />
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </RNModal>

      {/* ────────────────────────────────────────────────
          Image Viewer Modal
      ──────────────────────────────────────────────── */}

      <Modal
        isVisible={isAfterModalVisible}
        style={styles.modal}
        onBackdropPress={() =>
          setAfterModalVisible(false)
        }
        onSwipeComplete={() =>
          setAfterModalVisible(false)
        }
        swipeDirection={['down']}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropOpacity={0.95}
        useNativeDriver
      >
        <View style={styles.imageViewerContainer}>
          <ImageViewer
            imageUrls={currentImages}
            index={currentImageIndex}
            backgroundColor="#000000"
            enableSwipeDown
            enableImageZoom
            onCancel={() =>
              setAfterModalVisible(false)
            }
            onChange={(index) =>
              setCurrentImageIndex(index ?? 0)
            }
            // renderHeader={() => (
            //   <TouchableOpacity
            //     accessibilityRole="button"
            //     accessibilityLabel={tSafe(
            //       'close',
            //       'Close image viewer'
            //     )}
            //     style={styles.closeButton}
            //     onPress={() =>
            //       setAfterModalVisible(false)
            //     }
            //   >
            //     <MaterialCommunityIcons
            //       name="close"
            //       size={24}
            //       color="#FFFFFF"
            //     />
            //   </TouchableOpacity>
            // )}
            renderHeader={() => (
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
                    {Math.max(0, Number(currentImageIndex) || 0) + 1}{' '}
                    / {currentImages.length}
                  </AppText>
                </View>
            
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={tSafe(
                    'close_image_viewer',
                    'Close image viewer'
                  )}
                  onPress={() => setAfterModalVisible(false)}
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
                source={{
                  uri:
                    props?.source?.uri ||
                    currentImages[currentImageIndex]?.url,
                }}
                style={styles.fullSizeImage}
                contentFit="contain"
                transition={200}
              />
            )}
          />

          {renderCleanlinessAnalysis()}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────
// Theme-aware styles
// ─────────────────────────────────────────────────────────────

const createStyles = (theme, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    content: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      backgroundColor: theme.background.default,
    },

    loadingText: {
      marginTop: 12,
      fontSize: 14,
      textAlign: 'center',
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: theme.surface.default,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border.default,
    },

    headerIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.brand.primaryLight,
      marginRight: 12,
    },

    headerTextContainer: {
      flex: 1,
    },

    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 3,
    },

    headerSubtitle: {
      fontSize: 12,
      lineHeight: 17,
    },

    summaryBadge: {
      backgroundColor: theme.brand.primaryLight,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 12,
      marginLeft: 8,
    },

    summaryText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.brand.primary,
    },

    groupTabsContainer: {
      backgroundColor: theme.surface.default,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border.default,
      maxHeight: 58,
    },

    groupTabsContent: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },

    groupTab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 7,
      marginRight: 8,
      backgroundColor: theme.surface.elevated,
      borderWidth: 1,
      borderColor: theme.border.default,
      borderRadius: 18,
    },

    groupTabActive: {
      backgroundColor: theme.brand.primary,
      borderColor: theme.brand.primary,
    },

    groupTabText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.text.primary,
      marginRight: 6,
    },

    groupTabTextActive: {
      color: theme.text.inverse,
    },

    groupBadge: {
      backgroundColor: theme.background.sunken,
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderRadius: 8,
      minWidth: 19,
      alignItems: 'center',
    },

    groupBadgeActive: {
      backgroundColor: 'rgba(255,255,255,0.25)',
    },

    groupBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.text.secondary,
    },

    groupBadgeTextActive: {
      color: theme.text.inverse,
    },

    roomFilterSection: {
      paddingHorizontal: 16,
      paddingVertical: 9,
      backgroundColor: theme.surface.default,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border.default,
    },

    roomFilterTitle: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 7,
    },

    roomFilterContainer: {
      marginHorizontal: -16,
    },

    roomFilterContent: {
      paddingHorizontal: 16,
    },

    roomFilterTab: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      marginRight: 8,
      backgroundColor: theme.surface.elevated,
      borderWidth: 1,
      borderColor: theme.border.default,
      borderRadius: 18,
    },

    roomFilterTabActive: {
      backgroundColor: theme.brand.secondary,
      borderColor: theme.brand.secondary,
    },

    roomFilterText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.text.primary,
    },

    roomFilterTextActive: {
      color: theme.text.inverse,
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
      padding: 14,
    },

    cleanerCard: {
      backgroundColor: theme.card.background,
      borderColor: theme.card.border,
      borderWidth: 1,
      borderRadius: 18,
      padding: 14,
      marginBottom: 14,
      shadowColor: theme.shadow.color,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 5,
      elevation: isDark ? 0 : 3,
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
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 11,
      backgroundColor: theme.surface.elevated,
    },

    cleanerDetails: {
      flex: 1,
    },

    cleanerName: {
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 5,
    },

    cleanerMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
    },

    cleanerGroup: {
      fontSize: 11,
      color: theme.brand.primary,
      fontWeight: '700',
      backgroundColor: theme.brand.primaryLight,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 7,
      overflow: 'hidden',
    },

    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 7,
      backgroundColor: theme.surface.elevated,
    },

    statusCompleted: {
      backgroundColor: theme.status.success,
    },

    statusInProgress: {
      backgroundColor: theme.status.warning,
    },

    statusPartiallyCompleted: {
      backgroundColor: theme.status.info,
    },

    statusText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.text.secondary,
    },

    statusTextOnColor: {
      color: '#FFFFFF',
    },

    photoCountBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.brand.primary,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 12,
      marginLeft: 8,
    },

    photoCountText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.text.inverse,
      marginLeft: 5,
    },

    roomsContainer: {},

    roomSection: {
      marginBottom: 20,
    },

    roomHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 11,
    },

    roomTitle: {
      fontSize: 15,
      fontWeight: '700',
    },

    roomPhotoCount: {
      fontSize: 12,
      fontWeight: '500',
    },

    photosScrollView: {
      marginHorizontal: -14,
      marginBottom: 12,
    },

    photosScrollContent: {
      paddingHorizontal: 14,
    },

    photoCard: {
      width: 118,
      height: 118,
      borderRadius: 12,
      marginRight: 11,
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: theme.surface.elevated,
    },

    photoImage: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.surface.elevated,
    },

    cleanlinessBadge: {
      position: 'absolute',
      top: 7,
      right: 7,
      width: 25,
      height: 25,
      borderRadius: 13,
      justifyContent: 'center',
      alignItems: 'center',
    },

    photoOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.20)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    tasksContainer: {
      marginTop: 8,
    },

    tasksTitle: {
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 9,
    },

    taskContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
      flex: 1,
      paddingRight: 8,
      gap: 6,
    },

    taskText: {
      fontSize: 12,
      color: theme.text.secondary,
      flexShrink: 1,
      lineHeight: 18,
    },

    columnWrapper: {
      justifyContent: 'space-between',
    },

    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingVertical: 54,
    },

    emptyStateIcon: {
      width: 82,
      height: 82,
      borderRadius: 28,
      backgroundColor: theme.brand.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },

    emptyStateTitle: {
      fontSize: 19,
      fontWeight: '700',
      marginTop: 14,
      marginBottom: 8,
      textAlign: 'center',
    },

    emptyStateText: {
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 22,
    },

    noTasksContainer: {
      alignItems: 'center',
      padding: 20,
    },

    noTasksText: {
      fontSize: 13,
      marginTop: 8,
    },

    placeholderContainer: {
      padding: 20,
      alignItems: 'center',
      backgroundColor: theme.background.sunken,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border.default,
      borderStyle: 'dashed',
    },

    placeholderText: {
      marginTop: 8,
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 19,
    },

    notStartedBadge: {
      backgroundColor: theme.surface.elevated,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },

    notStartedBadgeText: {
      fontSize: 11,
      color: theme.text.secondary,
      fontWeight: '600',
    },

    cleanerActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: 12,
      gap: 8,
      flexWrap: 'wrap',
    },

    actionButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 9,
      paddingHorizontal: 13,
      borderRadius: 12,
      minWidth: 90,
      gap: 6,
    },

    approveButtonSmall: {
      backgroundColor: theme.status.success,
    },

    rejectButtonSmall: {
      backgroundColor: theme.status.error,
    },

    actionButtonText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 12,
    },

    reviewStatusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
    },

    approvedStatus: {
      backgroundColor: theme.surface.elevated,
    },

    rejectedStatus: {
      backgroundColor: theme.surface.elevated,
    },

    reviewStatusText: {
      fontSize: 12,
      fontWeight: '700',
    },

    modal: {
      margin: 0,
    },

    imageViewerContainer: {
      flex: 1,
      backgroundColor: '#000000',
    },

    closeButton: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 52 : 40,
      right: 18,
      backgroundColor: 'rgba(255,255,255,0.20)',
      borderRadius: 24,
      padding: 10,
      zIndex: 10,
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
      backgroundColor: isDark
        ? 'rgba(11,18,32,0.97)'
        : 'rgba(20,30,46,0.97)',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 18,
      paddingTop: 12,
      paddingBottom: Platform.OS === 'ios' ? 32 : 22,
      maxHeight: '56%',
    },

    dragHandle: {
      width: 40,
      height: 4,
      backgroundColor: 'rgba(255,255,255,0.4)',
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 12,
    },

    cleanlinessDetails: {
      gap: 12,
    },

    detailHeader: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 4,
      textAlign: 'center',
      letterSpacing: 0.5,
    },

    scoreSection: {
      marginBottom: 4,
    },

    scoreRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },

    scoreTextContainer: {
      flex: 1,
      marginRight: 14,
    },

    percentageText: {
      color: '#FFFFFF',
      fontSize: 30,
      fontWeight: '800',
      marginBottom: 4,
    },

    analysisStatusText: {
      fontSize: 13,
      fontWeight: '700',
    },

    sectionTitle: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '800',
      marginBottom: 8,
      letterSpacing: 0.5,
    },

    categoryAverage: {
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: 10,
    },

    categoryAverageRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    categoryAverageText: {
      color: '#FFFFFF',
      fontSize: 23,
      fontWeight: '800',
    },

    categoryAverageCaption: {
      color: 'rgba(255,255,255,0.75)',
      fontSize: 12,
      flexShrink: 1,
      textAlign: 'right',
      marginLeft: 10,
    },

    factorsContainer: {
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderRadius: 12,
      paddingHorizontal: 8,
    },

    factorItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: 'rgba(255,255,255,0.12)',
    },

    factorName: {
      color: '#FFFFFF',
      fontSize: 12,
      flex: 2,
    },

    factorScore: {
      fontSize: 12,
      fontWeight: '700',
      flex: 1,
      textAlign: 'right',
    },

    rejectModalOverlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 18,
      paddingVertical: 24,
    },

    rejectModalContainer: {
      backgroundColor: theme.surface.elevated,
      borderColor: theme.border.default,
      borderWidth: 1,
      borderRadius: 22,
      padding: 20,
      width: '100%',
      maxWidth: 480,
      maxHeight: '90%',
      alignSelf: 'center',
    },

    rejectModalHeader: {
      alignItems: 'center',
      marginBottom: 18,
    },

    rejectModalIcon: {
      width: 52,
      height: 52,
      borderRadius: 17,
      backgroundColor: theme.surface.selected,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },

    rejectModalTitle: {
      fontSize: 18,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 7,
    },

    rejectModalSubtitle: {
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 19,
    },

    rejectOptions: {
      marginBottom: 12,
      flexGrow: 0,
    },

    rejectOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 13,
      borderRadius: 11,
      borderWidth: 1,
      borderColor: theme.border.default,
      marginBottom: 8,
      gap: 12,
    },

    rejectOptionSelected: {
      borderColor: theme.brand.primary,
      backgroundColor: theme.surface.selected,
    },

    rejectOptionText: {
      flex: 1,
      fontSize: 13,
      color: theme.text.primary,
    },

    rejectOptionTextSelected: {
      color: theme.brand.primary,
      fontWeight: '700',
    },

    rejectCustomInput: {
      borderWidth: 1,
      borderColor: theme.input.border,
      backgroundColor: theme.input.background,
      color: theme.input.text,
      borderRadius: 12,
      padding: 12,
      marginBottom: 14,
      fontSize: 14,
      minHeight: 85,
      textAlignVertical: 'top',
    },

    rejectModalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
      marginTop: 4,
    },

    rejectModalButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },

    rejectModalCancel: {
      backgroundColor: theme.button.secondaryBackground,
    },

    rejectModalConfirm: {
      backgroundColor: theme.status.error,
    },

    rejectCancelText: {
      color: theme.button.secondaryText,
      fontSize: 13,
      fontWeight: '700',
    },

    rejectConfirmText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '700',
      textAlign: 'center',
    },

    feedbackModalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.overlay,
      paddingHorizontal: 20,
    },

    modalHeader: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 52 : 40,
      left: 16,
      right: 16,
      zIndex: 100,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    
    modalCounterContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      minHeight: 42,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 24,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.18)',
    },
    
    closeButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.18)',
    },
  });

export default AfterPhoto;