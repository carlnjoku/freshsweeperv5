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
//   FlatList
// } from 'react-native';
// import COLORS from '../../../constants/colors';
// import userService from '../../../services/connection/userService';
// import { AuthContext } from '../../../context/AuthContext';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import * as Animatable from 'react-native-animatable';
// import Modal from 'react-native-modal';
// import ImageViewer from 'react-native-image-zoom-viewer';
// import { Image } from 'expo-image';

// const { width: screenWidth } = Dimensions.get('window');

// const Incident = ({ scheduleId, schedule }) => {
//   const { currentUserId } = useContext(AuthContext);
//   const [isLoading, setIsLoading] = useState(false);
//   const [assignedCleaners, setAssignedCleaners] = useState([]);
//   const [isModalVisible, setModalVisible] = useState(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [currentImages, setCurrentImages] = useState([]);
//   const [selectedGroup, setSelectedGroup] = useState('all');

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
//               // Process assigned cleaners and their incidents
//               const processedCleaners = res.assignedTo.map(cleaner => ({
//                 ...cleaner,
//                 // Ensure incidents array exists and has proper structure
//                 incidents: cleaner.incidents?.map(incident => ({
//                   ...incident,
//                   // Ensure cleanerId is set on each incident
//                   cleanerId: incident.cleanerId || cleaner.cleanerId || cleaner._id,
//                   // Ensure photos array is properly structured
//                   photos: incident.photos || incident.uploaded_files || []
//                 })) || []
//               }));
              
//               setAssignedCleaners(processedCleaners);
//             }
//           }
//         } catch (error) {
//           console.log('Error fetching data:', error);
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

//   // Filter cleaners based on selected group
//   const getFilteredCleaners = () => {
//     if (selectedGroup === 'all') {
//       return assignedCleaners;
//     }
//     return assignedCleaners.filter(cleaner => cleaner.group === selectedGroup);
//   };

//   // Get incidents for a specific cleaner
//   const getIncidentsForCleaner = (cleaner) => {
//     return cleaner.incidents || [];
//   };

//   const getTotalIncidentsForCleaner = (cleaner) => {
//     return getIncidentsForCleaner(cleaner).length;
//   };

//   const getTotalIncidentsForGroup = (group) => {
//     const groupCleaners = group === 'all' ? assignedCleaners : assignedCleaners.filter(c => c.group === group);
//     return groupCleaners.reduce((total, cleaner) => total + getTotalIncidentsForCleaner(cleaner), 0);
//   };

//   const openImageViewer = (images, index) => {
//     const formattedImages = images.map(photo => ({
//       url: photo.url,
//       props: {
//         source: { uri: photo.url }
//       }
//     }));
//     setCurrentImages(formattedImages);
//     setCurrentImageIndex(index);
//     setModalVisible(true);
//   };

//   const formatDate = (dateString) => {
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString('en-US', {
//         month: 'short',
//         day: 'numeric',
//         year: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     } catch (error) {
//       console.log('Error formatting date:', error);
//       return 'Invalid date';
//     }
//   };

//   const renderGroupTabs = () => (
//     <ScrollView 
//       horizontal 
//       showsHorizontalScrollIndicator={false}
//       style={styles.groupTabsContainer}
//       contentContainerStyle={styles.groupTabsContent}
//     >
//       {getGroups().map(group => {
//         const incidentCount = getTotalIncidentsForGroup(group);
//         if (incidentCount === 0 && group !== 'all') return null;
        
//         return (
//           <TouchableOpacity
//             key={group}
//             style={[
//               styles.groupTab,
//               selectedGroup === group && styles.groupTabActive
//             ]}
//             onPress={() => setSelectedGroup(group)}
//           >
//             <Text style={[
//               styles.groupTabText,
//               selectedGroup === group && styles.groupTabTextActive
//             ]}>
//               {group === 'all' ? 'All Groups' : group.replace('_', ' ').toUpperCase()}
//             </Text>
//             <View style={styles.groupBadge}>
//               <Text style={styles.groupBadgeText}>
//                 {incidentCount}
//               </Text>
//             </View>
//           </TouchableOpacity>
//         );
//       })}
//     </ScrollView>
//   );

//   const renderIncidentCard = (cleaner, incident, index) => {
//     const hasPhotos = incident.photos?.length > 0;

//     return (
//       <Animatable.View 
//         key={`${incident.reported_at}-${index}`}
//         style={styles.incidentCard}
//         animation="fadeInUp"
//         duration={600}
//         delay={index * 200}
//       >
//         {/* Incident Header */}
//         <View style={styles.incidentHeader}>
//           <View style={styles.incidentInfo}>
//             <MaterialCommunityIcons 
//               name="alert-circle" 
//               size={20} 
//               color={COLORS.warning} 
//             />
//             <Text style={styles.incidentTime}>
//               {formatDate(incident.reported_at)}
//             </Text>
//           </View>
//           <View style={[
//             styles.statusBadge,
//             incident.status === 'reported' && styles.statusReported,
//             incident.status === 'resolved' && styles.statusResolved
//           ]}>
//             <Text style={styles.statusText}>
//               {incident.status || 'reported'}
//             </Text>
//           </View>
//         </View>

//         {/* Incident Description */}
//         <Text style={styles.incidentDescription}>
//           {incident.description}
//         </Text>

//         {/* Incident Photos */}
//         {hasPhotos && (
//           <View style={styles.photosSection}>
//             <Text style={styles.photosTitle}>
//               {incident.photos.length} photo{incident.photos.length !== 1 ? 's' : ''}
//             </Text>
//             <ScrollView 
//               horizontal 
//               showsHorizontalScrollIndicator={false}
//               style={styles.photosScrollView}
//               contentContainerStyle={styles.photosScrollContent}
//             >
//               {incident.photos.map((photo, photoIndex) => (
//                 <TouchableOpacity
//                   key={photoIndex}
//                   style={styles.photoCard}
//                   onPress={() => openImageViewer(incident.photos, photoIndex)}
//                 >
//                   <Image 
//                     source={{ uri: photo.url }} 
//                     style={styles.photoImage}
//                     contentFit="cover"
//                     transition={300}
//                   />
//                   <View style={styles.photoOverlay}>
//                     <MaterialCommunityIcons name="magnify-plus-outline" size={20} color="white" />
//                   </View>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>
//         )}
//       </Animatable.View>
//     );
//   };

//   const renderCleanerCard = (cleaner, index) => {
//     const cleanerIncidents = getIncidentsForCleaner(cleaner);
//     const totalIncidents = cleanerIncidents.length;

//     if (totalIncidents === 0) return null;

//     return (
//       <Animatable.View 
//         key={`${cleaner.cleanerId || cleaner._id}-${index}`}
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
//                 <Text style={styles.cleanerGroup}>
//                   {cleaner.group?.replace('_', ' ').toUpperCase() || 'UNKNOWN GROUP'}
//                 </Text>
//               </View>
//             </View>
//           </View>
//           <View style={styles.incidentCountBadge}>
//             <MaterialCommunityIcons name="alert" size={16} color={COLORS.white} />
//             <Text style={styles.incidentCountText}>{totalIncidents}</Text>
//           </View>
//         </View>

//         {/* Incidents List */}
//         <View style={styles.incidentsContainer}>
//           {cleanerIncidents.map((incident, incidentIndex) => 
//             renderIncidentCard(cleaner, incident, incidentIndex)
//           )}
//         </View>
//       </Animatable.View>
//     );
//   };

//   const renderEmptyState = (type = 'general') => {
//     const messages = {
//       general: {
//         icon: 'check-circle-outline',
//         title: 'No Incidents Reported',
//         message: 'Great news! No incidents have been reported for this cleaning.'
//       },
//       group: {
//         icon: 'account-group',
//         title: 'No Incidents in This Group',
//         message: 'Selected group has no reported incidents.'
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
//   const hasIncidents = filteredCleaners.some(cleaner => getIncidentsForCleaner(cleaner).length > 0);

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      
//       {isLoading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text style={styles.loadingText}>Loading incidents...</Text>
//         </View>
//       ) : (
//         <View style={styles.content}>
//           {/* Header */}
//           <View style={styles.header}>
//             <View style={styles.headerTextContainer}>
//               <Text style={styles.headerTitle}>Reported Incidents</Text>
//               <Text style={styles.headerSubtitle}>
//                 Reported issues and concerns during cleaning
//               </Text>
//             </View>
//             <View style={styles.summaryBadge}>
//               <Text style={styles.summaryText}>
//                 {assignedCleaners.length} cleaner{assignedCleaners.length !== 1 ? 's' : ''}
//               </Text>
//             </View>
//           </View>

//           {/* Group Tabs */}
//           {getGroups().length > 1 && renderGroupTabs()}

//           {/* Cleaners List */}
//           <ScrollView 
//             showsVerticalScrollIndicator={false}
//             style={styles.cleanersScrollView}
//             contentContainerStyle={styles.cleanersList}
//           >
//             {hasIncidents ? (
//               <View style={styles.cleanersContent}>
//                 {filteredCleaners.map((cleaner, index) => 
//                   renderCleanerCard(cleaner, index)
//                 )}
//               </View>
//             ) : (
//               renderEmptyState(
//                 selectedGroup !== 'all' ? 'group' : 'general'
//               )
//             )}
//           </ScrollView>
//         </View>
//       )}

//       {/* Image Viewer Modal */}
//       <Modal
//         isVisible={isModalVisible}
//         style={styles.modal}
//         onBackdropPress={() => setModalVisible(false)}
//         onSwipeComplete={() => setModalVisible(false)}
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
//             onCancel={() => setModalVisible(false)}
//             renderHeader={() => (
//               <View style={styles.modalHeader}>
//                 <Text style={styles.modalCounter}>
//                   {currentImageIndex + 1} / {currentImages.length}
//                 </Text>
//                 <TouchableOpacity 
//                   style={styles.closeButton}
//                   onPress={() => setModalVisible(false)}
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
//     paddingVertical:0,
//     marginRight: 6,
//     backgroundColor: COLORS.light_gray_1,
//     borderRadius: 50,
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
//     backgroundColor: "#f9f9f9",
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
//     backgroundColor: COLORS.primary_light_1,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 6,
//   },
//   incidentCountBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.warning,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   incidentCountText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.white,
//     marginLeft: 4,
//   },
//   incidentsContainer: {
//     // Incidents will stack vertically
//   },
//   incidentCard: {
//     backgroundColor: COLORS.light_gray_1,
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 12,
//   },
//   incidentHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   incidentInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   incidentTime: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginLeft: 6,
//     fontWeight: '500',
//   },
//   statusBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 6,
//     backgroundColor: COLORS.light_gray,
//   },
//   statusReported: {
//     backgroundColor: COLORS.warning,
//   },
//   statusResolved: {
//     backgroundColor: COLORS.success,
//   },
//   statusText: {
//     fontSize: 10,
//     fontWeight: '600',
//     color: COLORS.dark,
//     textTransform: 'capitalize',
//   },
//   incidentDescription: {
//     fontSize: 14,
//     color: COLORS.dark,
//     lineHeight: 20,
//     marginBottom: 12,
//   },
//   photosSection: {
//     marginTop: 8,
//   },
//   photosTitle: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.gray,
//     marginBottom: 8,
//   },
//   photosScrollView: {
//     marginHorizontal: -12,
//   },
//   photosScrollContent: {
//     paddingHorizontal: 12,
//   },
//   photoCard: {
//     width: 100,
//     height: 100,
//     borderRadius: 8,
//     marginRight: 12,
//     overflow: 'hidden',
//     position: 'relative',
//   },
//   photoImage: {
//     width: '100%',
//     height: '100%',
//     backgroundColor: COLORS.lightGray,
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

// export default Incident;



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
//   FlatList
// } from 'react-native';
// import COLORS from '../../../constants/colors';
// import userService from '../../../services/connection/userService';
// import { AuthContext } from '../../../context/AuthContext';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import * as Animatable from 'react-native-animatable';
// import Modal from 'react-native-modal';
// import ImageViewer from 'react-native-image-zoom-viewer';
// import { Image } from 'expo-image';
// import { tSafe } from '../../../utils/tSafe'; // added import

// const { width: screenWidth } = Dimensions.get('window');

// const Incident = ({ scheduleId, schedule }) => {
//   const { currentUserId } = useContext(AuthContext);
//   const [isLoading, setIsLoading] = useState(false);
//   const [assignedCleaners, setAssignedCleaners] = useState([]);
//   const [isModalVisible, setModalVisible] = useState(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [currentImages, setCurrentImages] = useState([]);
//   const [selectedGroup, setSelectedGroup] = useState('all');

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
//               // Process assigned cleaners and their incidents
//               const processedCleaners = res.assignedTo.map(cleaner => ({
//                 ...cleaner,
//                 // Ensure incidents array exists and has proper structure
//                 incidents: cleaner.incidents?.map(incident => ({
//                   ...incident,
//                   // Ensure cleanerId is set on each incident
//                   cleanerId: incident.cleanerId || cleaner.cleanerId || cleaner._id,
//                   // Ensure photos array is properly structured
//                   photos: incident.photos || incident.uploaded_files || []
//                 })) || []
//               }));
              
//               setAssignedCleaners(processedCleaners);
//             }
//           }
//         } catch (error) {
//           console.log('Error fetching data:', error);
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

//   // Filter cleaners based on selected group
//   const getFilteredCleaners = () => {
//     if (selectedGroup === 'all') {
//       return assignedCleaners;
//     }
//     return assignedCleaners.filter(cleaner => cleaner.group === selectedGroup);
//   };

//   // Get incidents for a specific cleaner
//   const getIncidentsForCleaner = (cleaner) => {
//     return cleaner.incidents || [];
//   };

//   const getTotalIncidentsForCleaner = (cleaner) => {
//     return getIncidentsForCleaner(cleaner).length;
//   };

//   const getTotalIncidentsForGroup = (group) => {
//     const groupCleaners = group === 'all' ? assignedCleaners : assignedCleaners.filter(c => c.group === group);
//     return groupCleaners.reduce((total, cleaner) => total + getTotalIncidentsForCleaner(cleaner), 0);
//   };

//   const openImageViewer = (images, index) => {
//     const formattedImages = images.map(photo => ({
//       url: photo.url,
//       props: {
//         source: { uri: photo.url }
//       }
//     }));
//     setCurrentImages(formattedImages);
//     setCurrentImageIndex(index);
//     setModalVisible(true);
//   };

//   const formatDate = (dateString) => {
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString('en-US', {
//         month: 'short',
//         day: 'numeric',
//         year: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     } catch (error) {
//       console.log('Error formatting date:', error);
//       return tSafe('invalid_date', 'Invalid date');
//     }
//   };

//   // Helper to translate group label
//   const getGroupLabel = (group) => {
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
//         const incidentCount = getTotalIncidentsForGroup(group);
//         if (incidentCount === 0 && group !== 'all') return null;
        
//         const label = getGroupLabel(group);
        
//         return (
//           <TouchableOpacity
//             key={group}
//             style={[
//               styles.groupTab,
//               selectedGroup === group && styles.groupTabActive
//             ]}
//             onPress={() => setSelectedGroup(group)}
//           >
//             <Text style={[
//               styles.groupTabText,
//               selectedGroup === group && styles.groupTabTextActive
//             ]}>
//               {label}
//             </Text>
//             <View style={styles.groupBadge}>
//               <Text style={styles.groupBadgeText}>
//                 {incidentCount}
//               </Text>
//             </View>
//           </TouchableOpacity>
//         );
//       })}
//     </ScrollView>
//   );

//   const renderIncidentCard = (cleaner, incident, index) => {
//     const hasPhotos = incident.photos?.length > 0;
//     const photoCount = incident.photos?.length || 0;
//     const photoLabel = photoCount === 1 ? tSafe('photo', 'photo') : tSafe('photos', 'photos');

//     // Translate status
//     const getIncidentStatus = (status) => {
//       switch (status) {
//         case 'reported': return tSafe('status_reported', 'reported');
//         case 'resolved': return tSafe('status_resolved', 'resolved');
//         default: return status || tSafe('status_reported', 'reported');
//       }
//     };

//     return (
//       <Animatable.View 
//         key={`${incident.reported_at}-${index}`}
//         style={styles.incidentCard}
//         animation="fadeInUp"
//         duration={600}
//         delay={index * 200}
//       >
//         {/* Incident Header */}
//         <View style={styles.incidentHeader}>
//           <View style={styles.incidentInfo}>
//             <MaterialCommunityIcons 
//               name="alert-circle" 
//               size={20} 
//               color={COLORS.warning} 
//             />
//             <Text style={styles.incidentTime}>
//               {formatDate(incident.reported_at)}
//             </Text>
//           </View>
//           <View style={[
//             styles.statusBadge,
//             incident.status === 'reported' && styles.statusReported,
//             incident.status === 'resolved' && styles.statusResolved
//           ]}>
//             <Text style={styles.statusText}>
//               {getIncidentStatus(incident.status)}
//             </Text>
//           </View>
//         </View>

//         {/* Incident Description */}
//         <Text style={styles.incidentDescription}>
//           {incident.description}
//         </Text>

//         {/* Incident Photos */}
//         {hasPhotos && (
//           <View style={styles.photosSection}>
//             <Text style={styles.photosTitle}>
//               {photoCount} {photoLabel}
//             </Text>
//             <ScrollView 
//               horizontal 
//               showsHorizontalScrollIndicator={false}
//               style={styles.photosScrollView}
//               contentContainerStyle={styles.photosScrollContent}
//             >
//               {incident.photos.map((photo, photoIndex) => (
//                 <TouchableOpacity
//                   key={photoIndex}
//                   style={styles.photoCard}
//                   onPress={() => openImageViewer(incident.photos, photoIndex)}
//                 >
//                   <Image 
//                     source={{ uri: photo.url }} 
//                     style={styles.photoImage}
//                     contentFit="cover"
//                     transition={300}
//                   />
//                   <View style={styles.photoOverlay}>
//                     <MaterialCommunityIcons name="magnify-plus-outline" size={20} color="white" />
//                   </View>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>
//         )}
//       </Animatable.View>
//     );
//   };

//   const renderCleanerCard = (cleaner, index) => {
//     const cleanerIncidents = getIncidentsForCleaner(cleaner);
//     const totalIncidents = cleanerIncidents.length;

//     if (totalIncidents === 0) return null;

//     const groupLabel = cleaner.group?.replace('_', ' ')?.toUpperCase() || tSafe('unknown_group', 'UNKNOWN GROUP');

//     return (
//       <Animatable.View 
//         key={`${cleaner.cleanerId || cleaner._id}-${index}`}
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
//                 <Text style={styles.cleanerGroup}>
//                   {groupLabel}
//                 </Text>
//               </View>
//             </View>
//           </View>
//           <View style={styles.incidentCountBadge}>
//             <MaterialCommunityIcons name="alert" size={16} color={COLORS.white} />
//             <Text style={styles.incidentCountText}>{totalIncidents}</Text>
//           </View>
//         </View>

//         {/* Incidents List */}
//         <View style={styles.incidentsContainer}>
//           {cleanerIncidents.map((incident, incidentIndex) => 
//             renderIncidentCard(cleaner, incident, incidentIndex)
//           )}
//         </View>
//       </Animatable.View>
//     );
//   };

//   const renderEmptyState = (type = 'general') => {
//     const messages = {
//       general: {
//         icon: 'check-circle-outline',
//         title: tSafe('no_incidents_title', 'No Incidents Reported'),
//         message: tSafe('no_incidents_message', 'Great news! No incidents have been reported for this cleaning.')
//       },
//       group: {
//         icon: 'account-group',
//         title: tSafe('no_incidents_in_group_title', 'No Incidents in This Group'),
//         message: tSafe('no_incidents_in_group_message', 'Selected group has no reported incidents.')
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
//   const hasIncidents = filteredCleaners.some(cleaner => getIncidentsForCleaner(cleaner).length > 0);

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      
//       {isLoading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text style={styles.loadingText}>{tSafe('loading_incidents', 'Loading incidents...')}</Text>
//         </View>
//       ) : (
//         <View style={styles.content}>
//           {/* Header */}
//           <View style={styles.header}>
//             <View style={styles.headerTextContainer}>
//               <Text style={styles.headerTitle}>{tSafe('reported_incidents_title', 'Reported Incidents')}</Text>
//               <Text style={styles.headerSubtitle}>
//                 {tSafe('reported_incidents_subtitle', 'Reported issues and concerns during cleaning')}
//               </Text>
//             </View>
//             <View style={styles.summaryBadge}>
//               <Text style={styles.summaryText}>
//                 {assignedCleaners.length} {assignedCleaners.length === 1 ? tSafe('cleaner', 'cleaner') : tSafe('cleaners', 'cleaners')}
//               </Text>
//             </View>
//           </View>

//           {/* Group Tabs */}
//           {getGroups().length > 1 && renderGroupTabs()}

//           {/* Cleaners List */}
//           <ScrollView 
//             showsVerticalScrollIndicator={false}
//             style={styles.cleanersScrollView}
//             contentContainerStyle={styles.cleanersList}
//           >
//             {hasIncidents ? (
//               <View style={styles.cleanersContent}>
//                 {filteredCleaners.map((cleaner, index) => 
//                   renderCleanerCard(cleaner, index)
//                 )}
//               </View>
//             ) : (
//               renderEmptyState(
//                 selectedGroup !== 'all' ? 'group' : 'general'
//               )
//             )}
//           </ScrollView>
//         </View>
//       )}

//       {/* Image Viewer Modal */}
//       <Modal
//         isVisible={isModalVisible}
//         style={styles.modal}
//         onBackdropPress={() => setModalVisible(false)}
//         onSwipeComplete={() => setModalVisible(false)}
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
//             onCancel={() => setModalVisible(false)}
//             renderHeader={() => (
//               <View style={styles.modalHeader}>
//                 <Text style={styles.modalCounter}>
//                   {currentImageIndex + 1} / {currentImages.length}
//                 </Text>
//                 <TouchableOpacity 
//                   style={styles.closeButton}
//                   onPress={() => setModalVisible(false)}
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
//     paddingVertical:0,
//     marginRight: 6,
//     backgroundColor: COLORS.light_gray_1,
//     borderRadius: 50,
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
//     backgroundColor: "#f9f9f9",
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
//     backgroundColor: COLORS.primary_light_1,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 6,
//   },
//   incidentCountBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.warning,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   incidentCountText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.white,
//     marginLeft: 4,
//   },
//   incidentsContainer: {
//     // Incidents will stack vertically
//   },
//   incidentCard: {
//     backgroundColor: COLORS.light_gray_1,
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 12,
//   },
//   incidentHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   incidentInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   incidentTime: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginLeft: 6,
//     fontWeight: '500',
//   },
//   statusBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 6,
//     backgroundColor: COLORS.light_gray,
//   },
//   statusReported: {
//     backgroundColor: COLORS.warning,
//   },
//   statusResolved: {
//     backgroundColor: COLORS.success,
//   },
//   statusText: {
//     fontSize: 10,
//     fontWeight: '600',
//     color: COLORS.dark,
//     textTransform: 'capitalize',
//   },
//   incidentDescription: {
//     fontSize: 14,
//     color: COLORS.dark,
//     lineHeight: 20,
//     marginBottom: 12,
//   },
//   photosSection: {
//     marginTop: 8,
//   },
//   photosTitle: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.gray,
//     marginBottom: 8,
//   },
//   photosScrollView: {
//     marginHorizontal: -12,
//   },
//   photosScrollContent: {
//     paddingHorizontal: 12,
//   },
//   photoCard: {
//     width: 100,
//     height: 100,
//     borderRadius: 8,
//     marginRight: 12,
//     overflow: 'hidden',
//     position: 'relative',
//   },
//   photoImage: {
//     width: '100%',
//     height: '100%',
//     backgroundColor: COLORS.lightGray,
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

// export default Incident;





// TaskTaps/Incident.js
// import React, { useContext, useCallback, useState } from 'react';
// import { useFocusEffect, useNavigation } from '@react-navigation/native';
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
//   FlatList,
// } from 'react-native';
// import COLORS from '../../../constants/colors';
// import userService from '../../../services/connection/userService';
// import { AuthContext } from '../../../context/AuthContext';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import * as Animatable from 'react-native-animatable';
// import Modal from 'react-native-modal';
// import ImageViewer from 'react-native-image-zoom-viewer';
// import { Image } from 'expo-image';
// import { tSafe } from '../../../utils/tSafe';
// import ROUTES from '../../../constants/routes';

// const { width: screenWidth } = Dimensions.get('window');

// const Incident = ({ scheduleId, schedule, onScroll }) => {
//   const { currentUserId } = useContext(AuthContext);
//   const navigation = useNavigation();
//   const [isLoading, setIsLoading] = useState(false);
//   const [assignedCleaners, setAssignedCleaners] = useState([]);
//   const [isModalVisible, setModalVisible] = useState(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [currentImages, setCurrentImages] = useState([]);
//   const [selectedGroup, setSelectedGroup] = useState('all');

//   // Fetch data on focus
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
//               // Process assigned cleaners and store groupIndex
//               const processedCleaners = res.assignedTo.map((cleaner, index) => ({
//                 ...cleaner,
//                 groupIndex: index, // store group index for notification
//                 incidents: cleaner.incidents?.map((incident) => ({
//                   ...incident,
//                   cleanerId: incident.cleanerId || cleaner.cleanerId || cleaner._id,
//                   photos: incident.photos || incident.uploaded_files || [],
//                 })) || [],
//               }));

//               setAssignedCleaners(processedCleaners);
//             }
//           }
//         } catch (error) {
//           console.log('Error fetching data:', error);
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
//     const groups = new Set(assignedCleaners.map((cleaner) => cleaner.group));
//     return ['all', ...Array.from(groups)];
//   };

//   // Filter cleaners based on selected group
//   const getFilteredCleaners = () => {
//     if (selectedGroup === 'all') {
//       return assignedCleaners;
//     }
//     return assignedCleaners.filter((cleaner) => cleaner.group === selectedGroup);
//   };

//   // Get incidents for a specific cleaner
//   const getIncidentsForCleaner = (cleaner) => {
//     return cleaner.incidents || [];
//   };

//   const getTotalIncidentsForCleaner = (cleaner) => {
//     return getIncidentsForCleaner(cleaner).length;
//   };

//   const getTotalIncidentsForGroup = (group) => {
//     const groupCleaners = group === 'all' ? assignedCleaners : assignedCleaners.filter((c) => c.group === group);
//     return groupCleaners.reduce((total, cleaner) => total + getTotalIncidentsForCleaner(cleaner), 0);
//   };

//   const openImageViewer = (images, index) => {
//     const formattedImages = images.map((photo) => ({
//       url: photo.url,
//       props: {
//         source: { uri: photo.url },
//       },
//     }));
//     setCurrentImages(formattedImages);
//     setCurrentImageIndex(index);
//     setModalVisible(true);
//   };

//   const formatDate = (dateString) => {
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString('en-US', {
//         month: 'short',
//         day: 'numeric',
//         year: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//       });
//     } catch (error) {
//       console.log('Error formatting date:', error);
//       return tSafe('invalid_date', 'Invalid date');
//     }
//   };

//   // Helper to translate group label
//   const getGroupLabel = (group) => {
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
//       {getGroups().map((group) => {
//         const incidentCount = getTotalIncidentsForGroup(group);
//         if (incidentCount === 0 && group !== 'all') return null;

//         const label = getGroupLabel(group);

//         return (
//           <TouchableOpacity
//             key={group}
//             style={[styles.groupTab, selectedGroup === group && styles.groupTabActive]}
//             onPress={() => setSelectedGroup(group)}
//           >
//             <Text style={[styles.groupTabText, selectedGroup === group && styles.groupTabTextActive]}>
//               {label}
//             </Text>
//             <View style={styles.groupBadge}>
//               <Text style={styles.groupBadgeText}>{incidentCount}</Text>
//             </View>
//           </TouchableOpacity>
//         );
//       })}
//     </ScrollView>
//   );

//   // ✅ Renders a single incident card with "Notify Team" button
//   const renderIncidentCard = (cleaner, incident, incidentIndex, groupIndex) => {
//     const hasPhotos = incident.photos?.length > 0;
//     const photoCount = incident.photos?.length || 0;
//     const photoLabel = photoCount === 1 ? tSafe('photo', 'photo') : tSafe('photos', 'photos');

//     const getIncidentStatus = (status) => {
//       switch (status) {
//         case 'reported':
//           return tSafe('status_reported', 'reported');
//         case 'resolved':
//           return tSafe('status_resolved', 'resolved');
//         default:
//           return status || tSafe('status_reported', 'reported');
//       }
//     };

//     // ✅ Navigate to team selection
//     const handleNotify = () => {
//       navigation.navigate(ROUTES.host_select_team_members, {
//         scheduleId: scheduleId,
//         incident: {
//           groupIndex: groupIndex,
//           incidentIndex: incidentIndex,
//           description: incident.description,
//         },
//       });
//     };

//     return (
//       <Animatable.View
//         key={`${incident.reported_at}-${incidentIndex}`}
//         style={styles.incidentCard}
//         animation="fadeInUp"
//         duration={600}
//         delay={incidentIndex * 200}
//       >
//         {/* Incident Header */}
//         <View style={styles.incidentHeader}>
//           <View style={styles.incidentInfo}>
//             <MaterialCommunityIcons name="alert-circle" size={20} color={COLORS.warning} />
//             <Text style={styles.incidentTime}>{formatDate(incident.reported_at)}</Text>
//           </View>
//           <View
//             style={[
//               styles.statusBadge,
//               incident.status === 'reported' && styles.statusReported,
//               incident.status === 'resolved' && styles.statusResolved,
//             ]}
//           >
//             <Text style={styles.statusText}>{getIncidentStatus(incident.status)}</Text>
//           </View>
//         </View>

//         {/* Incident Description */}
//         <Text style={styles.incidentDescription}>{incident.description}</Text>

//         {/* Incident Photos */}
//         {hasPhotos && (
//           <View style={styles.photosSection}>
//             <Text style={styles.photosTitle}>
//               {photoCount} {photoLabel}
//             </Text>
//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               style={styles.photosScrollView}
//               contentContainerStyle={styles.photosScrollContent}
//             >
//               {incident.photos.map((photo, photoIndex) => (
//                 <TouchableOpacity
//                   key={photoIndex}
//                   style={styles.photoCard}
//                   onPress={() => openImageViewer(incident.photos, photoIndex)}
//                 >
//                   <Image source={{ uri: photo.url }} style={styles.photoImage} contentFit="cover" transition={300} />
//                   <View style={styles.photoOverlay}>
//                     <MaterialCommunityIcons name="magnify-plus-outline" size={20} color="white" />
//                   </View>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>
//         )}

//         {/* ✅ Notify Team Button */}
//         <TouchableOpacity style={styles.notifyButton} onPress={handleNotify}>
//           <MaterialCommunityIcons name="bell" size={16} color={COLORS.white} />
//           <Text style={styles.notifyButtonText}>{tSafe('notify_team', 'Notify Team')}</Text>
//         </TouchableOpacity>
//       </Animatable.View>
//     );
//   };

//   const renderCleanerCard = (cleaner, index) => {
//     const cleanerIncidents = getIncidentsForCleaner(cleaner);
//     const totalIncidents = cleanerIncidents.length;

//     if (totalIncidents === 0) return null;

//     const groupLabel = cleaner.group?.replace('_', ' ')?.toUpperCase() || tSafe('unknown_group', 'UNKNOWN GROUP');

//     return (
//       <Animatable.View
//         key={`${cleaner.cleanerId || cleaner._id}-${index}`}
//         style={styles.cleanerCard}
//         animation="fadeInUp"
//         duration={600}
//         delay={index * 200}
//       >
//         {/* Cleaner Header */}
//         <View style={styles.cleanerHeader}>
//           <View style={styles.cleanerInfo}>
//             <Image source={{ uri: cleaner.avatar }} style={styles.cleanerAvatar} contentFit="cover" />
//             <View style={styles.cleanerDetails}>
//               <Text style={styles.cleanerName}>
//                 {cleaner.firstname} {cleaner.lastname}
//               </Text>
//               <View style={styles.cleanerMeta}>
//                 <Text style={styles.cleanerGroup}>{groupLabel}</Text>
//               </View>
//             </View>
//           </View>
//           <View style={styles.incidentCountBadge}>
//             <MaterialCommunityIcons name="alert" size={16} color={COLORS.white} />
//             <Text style={styles.incidentCountText}>{totalIncidents}</Text>
//           </View>
//         </View>

//         {/* Incidents List */}
//         <View style={styles.incidentsContainer}>
//           {cleanerIncidents.map((incident, incidentIndex) =>
//             renderIncidentCard(cleaner, incident, incidentIndex, cleaner.groupIndex)
//           )}
//         </View>
//       </Animatable.View>
//     );
//   };

//   const renderEmptyState = (type = 'general') => {
//     const messages = {
//       general: {
//         icon: 'check-circle-outline',
//         title: tSafe('no_incidents_title', 'No Incidents Reported'),
//         message: tSafe('no_incidents_message', 'Great news! No incidents have been reported for this cleaning.'),
//       },
//       group: {
//         icon: 'account-group',
//         title: tSafe('no_incidents_in_group_title', 'No Incidents in This Group'),
//         message: tSafe('no_incidents_in_group_message', 'Selected group has no reported incidents.'),
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
//   const hasIncidents = filteredCleaners.some((cleaner) => getIncidentsForCleaner(cleaner).length > 0);

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />

//       {isLoading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text style={styles.loadingText}>{tSafe('loading_incidents', 'Loading incidents...')}</Text>
//         </View>
//       ) : (
//         <View style={styles.content}>
//           {/* Header */}
//           <View style={styles.header}>
//             <View style={styles.headerTextContainer}>
//               <Text style={styles.headerTitle}>{tSafe('reported_incidents_title', 'Reported Incidents')}</Text>
//               <Text style={styles.headerSubtitle}>
//                 {tSafe('reported_incidents_subtitle', 'Reported issues and concerns during cleaning')}
//               </Text>
//             </View>
//             <View style={styles.summaryBadge}>
//               <Text style={styles.summaryText}>
//                 {assignedCleaners.length} {assignedCleaners.length === 1 ? tSafe('cleaner', 'cleaner') : tSafe('cleaners', 'cleaners')}
//               </Text>
//             </View>
//           </View>

//           {/* Group Tabs */}
//           {getGroups().length > 1 && renderGroupTabs()}

//           {/* Cleaners List */}
//           <ScrollView
//             showsVerticalScrollIndicator={false}
//             style={styles.cleanersScrollView}
//             contentContainerStyle={styles.cleanersList}
//             onScroll={onScroll}                 // ✅ added
//             scrollEventThrottle={16} 
//           >
//             {hasIncidents ? (
//               <View style={styles.cleanersContent}>
//                 {filteredCleaners.map((cleaner, index) => renderCleanerCard(cleaner, index))}
//               </View>
//             ) : (
//               renderEmptyState(selectedGroup !== 'all' ? 'group' : 'general')
//             )}
//           </ScrollView>
//         </View>
//       )}

//       {/* Image Viewer Modal */}
//       <Modal
//         isVisible={isModalVisible}
//         style={styles.modal}
//         onBackdropPress={() => setModalVisible(false)}
//         onSwipeComplete={() => setModalVisible(false)}
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
//             onCancel={() => setModalVisible(false)}
//             renderHeader={() => (
//               <View style={styles.modalHeader}>
//                 <Text style={styles.modalCounter}>
//                   {currentImageIndex + 1} / {currentImages.length}
//                 </Text>
//                 <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
//                   <MaterialCommunityIcons name="close" size={24} color="white" />
//                 </TouchableOpacity>
//               </View>
//             )}
//             renderImage={(props) => <Image {...props} style={styles.fullSizeImage} contentFit="contain" transition={300} />}
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
//     borderRadius: 50,
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
//     backgroundColor: '#f9f9f9',
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
//     backgroundColor: COLORS.primary_light_1,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 6,
//   },
//   incidentCountBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.warning,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   incidentCountText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.white,
//     marginLeft: 4,
//   },
//   incidentsContainer: {
//     // vertical stacking
//   },
//   incidentCard: {
//     backgroundColor: COLORS.light_gray_1,
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 12,
//   },
//   incidentHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   incidentInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   incidentTime: {
//     fontSize: 12,
//     color: COLORS.gray,
//     marginLeft: 6,
//     fontWeight: '500',
//   },
//   statusBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 6,
//     backgroundColor: COLORS.light_gray,
//   },
//   statusReported: {
//     backgroundColor: COLORS.warning,
//   },
//   statusResolved: {
//     backgroundColor: COLORS.success,
//   },
//   statusText: {
//     fontSize: 10,
//     fontWeight: '600',
//     color: COLORS.dark,
//     textTransform: 'capitalize',
//   },
//   incidentDescription: {
//     fontSize: 14,
//     color: COLORS.dark,
//     lineHeight: 20,
//     marginBottom: 12,
//   },
//   photosSection: {
//     marginTop: 8,
//   },
//   photosTitle: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.gray,
//     marginBottom: 8,
//   },
//   photosScrollView: {
//     marginHorizontal: -12,
//   },
//   photosScrollContent: {
//     paddingHorizontal: 12,
//   },
//   photoCard: {
//     width: 100,
//     height: 100,
//     borderRadius: 8,
//     marginRight: 12,
//     overflow: 'hidden',
//     position: 'relative',
//   },
//   photoImage: {
//     width: '100%',
//     height: '100%',
//     backgroundColor: COLORS.lightGray,
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
//   // ✅ New styles for Notify button
//   notifyButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     marginTop: 12,
//     alignSelf: 'flex-start',
//   },
//   notifyButtonText: {
//     color: COLORS.white,
//     fontSize: 12,
//     fontWeight: '600',
//     marginLeft: 6,
//   },
// });

// export default Incident;


import React, {
  useContext,
  useCallback,
  useState,
  useMemo,
} from 'react';

import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  ScrollView,
  View,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Modal as RNModal,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import Modal from 'react-native-modal';
import ImageViewer from 'react-native-image-zoom-viewer';
import { Image } from 'expo-image';

import { useTheme } from '../../../theme';
import { AppText } from '../../../ui';

import userService from '../../../services/connection/userService';
import { AuthContext } from '../../../context/AuthContext';
import { tSafe } from '../../../utils/tSafe';
import ROUTES from '../../../constants/routes';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const formatGroupName = (group) => {
  if (!group) {
    return tSafe('unknown_group', 'Unknown Group');
  }

  const suffix = String(group).replace(/^group_/i, '');

  return `${tSafe('group', 'Group')} ${suffix.toUpperCase()}`;
};

const getPhotoUrl = (photo) => {
  if (typeof photo === 'string') {
    return photo;
  }

  return (
    photo?.url ||
    photo?.img_url ||
    photo?.uri ||
    ''
  );
};

const getIncidentStatus = (status) => {
  switch (String(status || '').toLowerCase()) {
    case 'reported':
      return tSafe('status_reported', 'Reported');

    case 'resolved':
      return tSafe('status_resolved', 'Resolved');

    default:
      return status || tSafe('status_reported', 'Reported');
  }
};

const formatIncidentDate = (dateString) => {
  if (!dateString) {
    return tSafe('invalid_date', 'Invalid date');
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return tSafe('invalid_date', 'Invalid date');
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

const Incident = ({
  scheduleId,
  schedule,
  onScroll,
}) => {
  const { theme, isDark } = useTheme();

  const styles = useMemo(
    () => createStyles(theme, isDark),
    [theme, isDark]
  );

  const { currentUserId } = useContext(AuthContext);
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);
  const [assignedCleaners, setAssignedCleaners] = useState([]);

  const [isModalVisible, setModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState('all');

  // ───────────────────────────────────────────────────────────
  // Fetch incidents when screen receives focus
  // ───────────────────────────────────────────────────────────

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const fetchData = async () => {
        if (!scheduleId) {
          setAssignedCleaners([]);
          setIsLoading(false);
          return;
        }

        try {
          setIsLoading(true);

          const response =
            await userService.getUpdatedImageUrls(scheduleId);

          if (!active) {
            return;
          }

          const data = response?.data?.data;

          if (Array.isArray(data?.assignedTo)) {
            const processedCleaners = data.assignedTo.map(
              (cleaner, index) => ({
                ...cleaner,

                // Preserved for the Notify Team navigation flow.
                groupIndex: index,

                incidents: (
                  Array.isArray(cleaner.incidents)
                    ? cleaner.incidents
                    : []
                ).map((incident) => ({
                  ...incident,

                  cleanerId:
                    incident.cleanerId ||
                    cleaner.cleanerId ||
                    cleaner._id,

                  photos: (
                    Array.isArray(incident.photos)
                      ? incident.photos
                      : Array.isArray(incident.uploaded_files)
                      ? incident.uploaded_files
                      : []
                  ).map((photo) => {
                    if (typeof photo === 'string') {
                      return { url: photo };
                    }

                    return {
                      ...photo,
                      url: getPhotoUrl(photo),
                    };
                  }),
                })),
              })
            );

            setAssignedCleaners(processedCleaners);
          } else {
            setAssignedCleaners([]);
          }
        } catch (error) {
          if (active) {
            console.error(
              'Error fetching incident data:',
              error
            );
          }
        } finally {
          if (active) {
            setIsLoading(false);
          }
        }
      };

      fetchData();

      return () => {
        active = false;
      };
    }, [scheduleId])
  );

  // ───────────────────────────────────────────────────────────
  // Group helpers
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

  const getIncidentsForCleaner = (cleaner) => {
    return Array.isArray(cleaner.incidents)
      ? cleaner.incidents
      : [];
  };

  const getTotalIncidentsForCleaner = (cleaner) => {
    return getIncidentsForCleaner(cleaner).length;
  };

  const getTotalIncidentsForGroup = (group) => {
    const cleaners =
      group === 'all'
        ? assignedCleaners
        : assignedCleaners.filter(
            (cleaner) => cleaner.group === group
          );

    return cleaners.reduce(
      (total, cleaner) =>
        total + getTotalIncidentsForCleaner(cleaner),
      0
    );
  };

  const totalIncidentCount = assignedCleaners.reduce(
    (total, cleaner) =>
      total + getTotalIncidentsForCleaner(cleaner),
    0
  );

  // ───────────────────────────────────────────────────────────
  // Image viewer
  // ───────────────────────────────────────────────────────────

  const openImageViewer = (photos, index) => {
    const formattedImages = photos
      .map((photo) => {
        const url = getPhotoUrl(photo);

        if (!url) {
          return null;
        }

        return {
          url,
          props: {
            source: { uri: url },
          },
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

    setModalVisible(true);
  };

  // ───────────────────────────────────────────────────────────
  // Group filter tabs
  // ───────────────────────────────────────────────────────────

  const renderGroupTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.groupTabsContainer}
      contentContainerStyle={styles.groupTabsContent}
    >
      {getGroups().map((group) => {
        const incidentCount =
          getTotalIncidentsForGroup(group);

        if (
          incidentCount === 0 &&
          group !== 'all'
        ) {
          return null;
        }

        const selected = selectedGroup === group;

        const label =
          group === 'all'
            ? tSafe('all_groups', 'All Groups')
            : formatGroupName(group);

        return (
          <TouchableOpacity
            key={group}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[
              styles.groupTab,
              selected && styles.groupTabActive,
            ]}
            onPress={() => setSelectedGroup(group)}
          >
            <AppText
              style={[
                styles.groupTabText,
                selected && styles.groupTabTextActive,
              ]}
            >
              {label}
            </AppText>

            <View
              style={[
                styles.groupBadge,
                selected && styles.groupBadgeActive,
              ]}
            >
              <AppText
                style={[
                  styles.groupBadgeText,
                  selected && styles.groupBadgeTextActive,
                ]}
              >
                {incidentCount}
              </AppText>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  // ───────────────────────────────────────────────────────────
  // Incident card
  // ───────────────────────────────────────────────────────────

  const renderIncidentCard = (
    cleaner,
    incident,
    incidentIndex
  ) => {
    const photos = Array.isArray(incident.photos)
      ? incident.photos
      : [];

    const photoCount = photos.filter(
      (photo) => Boolean(getPhotoUrl(photo))
    ).length;

    const photoLabel =
      photoCount === 1
        ? tSafe('photo', 'photo')
        : tSafe('photos', 'photos');

    const status = String(
      incident.status || 'reported'
    ).toLowerCase();

    const isResolved = status === 'resolved';

    // Keep the existing team-selection route and parameters.
    const handleNotify = () => {
      navigation.navigate(
        ROUTES.host_select_team_members,
        {
          scheduleId,

          incident: {
            groupIndex: cleaner.groupIndex,
            incidentIndex,
            description: incident.description,
          },
        }
      );
    };

    return (
      <Animatable.View
        key={
          incident._id ||
          incident.id ||
          `${incident.reported_at || 'incident'}-${incidentIndex}`
        }
        style={styles.incidentCard}
        animation="fadeInUp"
        duration={400}
        delay={Math.min(incidentIndex * 100, 400)}
      >
        {/* Incident header */}

        <View style={styles.incidentHeader}>
          <View style={styles.incidentInfo}>
            <View
              style={[
                styles.incidentIcon,
                isResolved
                  ? styles.incidentIconResolved
                  : styles.incidentIconReported,
              ]}
            >
              <MaterialCommunityIcons
                name={
                  isResolved
                    ? 'check-circle-outline'
                    : 'alert-circle-outline'
                }
                size={20}
                color={
                  isResolved
                    ? theme.status.success
                    : theme.status.warning
                }
              />
            </View>

            <View style={styles.incidentTimeContainer}>
              <AppText
                style={styles.incidentTime}
              >
                {formatIncidentDate(
                  incident.reported_at
                )}
              </AppText>

              <AppText
                style={styles.incidentTimeCaption}
              >
                {tSafe(
                  'incident_reported_at',
                  'Incident report'
                )}
              </AppText>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              isResolved
                ? styles.statusResolved
                : styles.statusReported,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isResolved
                    ? theme.status.success
                    : theme.status.warning,
                },
              ]}
            />

            <AppText
              style={[
                styles.statusText,
                {
                  color: isResolved
                    ? theme.status.success
                    : theme.status.warning,
                },
              ]}
            >
              {getIncidentStatus(incident.status)}
            </AppText>
          </View>
        </View>

        {/* Incident description */}

        <AppText
          style={styles.incidentDescription}
        >
          {incident.description ||
            tSafe(
              'no_incident_description',
              'No description provided.'
            )}
        </AppText>

        {/* Incident photos */}

        {photoCount > 0 && (
          <View style={styles.photosSection}>
            <View style={styles.photosHeader}>
              <View style={styles.photosTitleRow}>
                <MaterialCommunityIcons
                  name="image-multiple-outline"
                  size={17}
                  color={theme.icon.muted}
                />

                <AppText
                  style={styles.photosTitle}
                >
                  {photoCount} {photoLabel}
                </AppText>
              </View>

              <AppText
                style={styles.photosHint}
              >
                {tSafe(
                  'tap_to_enlarge',
                  'Tap to enlarge'
                )}
              </AppText>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.photosScrollView}
              contentContainerStyle={
                styles.photosScrollContent
              }
            >
              {photos.map((photo, photoIndex) => {
                const photoUrl = getPhotoUrl(photo);

                if (!photoUrl) {
                  return null;
                }

                return (
                  <TouchableOpacity
                    key={
                      photo?._id ||
                      photo?.id ||
                      `incident-photo-${photoIndex}`
                    }
                    accessibilityRole="imagebutton"
                    accessibilityLabel={tSafe(
                      'view_incident_photo',
                      'View incident photo'
                    )}
                    style={styles.photoCard}
                    onPress={() =>
                      openImageViewer(
                        photos,
                        photoIndex
                      )
                    }
                  >
                    <Image
                      source={{ uri: photoUrl }}
                      style={styles.photoImage}
                      contentFit="cover"
                      transition={250}
                    />

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
          </View>
        )}

        {/* Notify team */}

        <TouchableOpacity
          accessibilityRole="button"
          style={styles.notifyButton}
          onPress={handleNotify}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="account-group-outline"
            size={18}
            color={theme.button.primaryText}
          />

          <AppText
            style={styles.notifyButtonText}
          >
            {tSafe('notify_team', 'Notify Team')}
          </AppText>

          <MaterialCommunityIcons
            name="arrow-right"
            size={17}
            color={theme.button.primaryText}
          />
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  // ───────────────────────────────────────────────────────────
  // Cleaner card
  // ───────────────────────────────────────────────────────────

  const renderCleanerCard = (cleaner, index) => {
    const incidents =
      getIncidentsForCleaner(cleaner);

    if (incidents.length === 0) {
      return null;
    }

    const groupLabel = formatGroupName(
      cleaner.group
    );

    const cleanerName =
      `${cleaner.firstname || ''} ${
        cleaner.lastname || ''
      }`.trim() ||
      tSafe('cleaner', 'Cleaner');

    return (
      <Animatable.View
        key={
          cleaner.cleanerId ||
          cleaner._id ||
          `cleaner-${index}`
        }
        style={styles.cleanerCard}
        animation="fadeInUp"
        duration={400}
        delay={Math.min(index * 100, 400)}
      >
        {/* Cleaner header */}

        <View style={styles.cleanerHeader}>
          <View style={styles.cleanerInfo}>
            {cleaner.avatar ? (
              <Image
                source={{ uri: cleaner.avatar }}
                style={styles.cleanerAvatar}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons
                  name="account-outline"
                  size={26}
                  color={theme.icon.muted}
                />
              </View>
            )}

            <View style={styles.cleanerDetails}>
              <AppText
                variant="subtitle"
                style={styles.cleanerName}
              >
                {cleanerName}
              </AppText>

              <View style={styles.cleanerMeta}>
                <View style={styles.cleanerGroupBadge}>
                  <MaterialCommunityIcons
                    name="account-group-outline"
                    size={13}
                    color={theme.brand.primary}
                  />

                  <AppText
                    style={styles.cleanerGroup}
                  >
                    {groupLabel}
                  </AppText>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.incidentCountBadge}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={17}
              color={theme.status.warning}
            />

            <AppText
              style={styles.incidentCountText}
            >
              {incidents.length}
            </AppText>
          </View>
        </View>

        {/* Incidents list */}

        <View style={styles.incidentsContainer}>
          {incidents.map((incident, incidentIndex) =>
            renderIncidentCard(
              cleaner,
              incident,
              incidentIndex
            )
          )}
        </View>
      </Animatable.View>
    );
  };

  // ───────────────────────────────────────────────────────────
  // Empty state
  // ───────────────────────────────────────────────────────────

  const renderEmptyState = (type = 'general') => {
    const messages = {
      general: {
        icon: 'check-circle-outline',
        title: tSafe(
          'no_incidents_title',
          'No Incidents Reported'
        ),
        message: tSafe(
          'no_incidents_message',
          'Great news! No incidents have been reported for this cleaning.'
        ),
      },

      group: {
        icon: 'account-group-outline',
        title: tSafe(
          'no_incidents_in_group_title',
          'No Incidents in This Group'
        ),
        message: tSafe(
          'no_incidents_in_group_message',
          'The selected group has no reported incidents.'
        ),
      },
    };

    const {
      icon,
      title,
      message,
    } = messages[type] || messages.general;

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

  // ───────────────────────────────────────────────────────────
  // Main render
  // ───────────────────────────────────────────────────────────

  const filteredCleaners = getFilteredCleaners();

  const hasIncidents = filteredCleaners.some(
    (cleaner) =>
      getIncidentsForCleaner(cleaner).length > 0
  );

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
              'loading_incidents',
              'Loading incidents...'
            )}
          </AppText>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Header */}

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={25}
                color={theme.brand.primary}
              />
            </View>

            <View style={styles.headerTextContainer}>
              <AppText
                variant="heading"
                style={styles.headerTitle}
              >
                {tSafe(
                  'reported_incidents_title',
                  'Reported Incidents'
                )}
              </AppText>

              <AppText
                color={theme.text.secondary}
                style={styles.headerSubtitle}
              >
                {tSafe(
                  'reported_incidents_subtitle',
                  'Reported issues and concerns during cleaning'
                )}
              </AppText>
            </View>

            <View style={styles.summaryBadge}>
              <AppText
                style={styles.summaryText}
              >
                {totalIncidentCount}
              </AppText>

              <AppText
                style={styles.summaryCaption}
              >
                {tSafe('incidents', 'Incidents')}
              </AppText>
            </View>
          </View>

          {/* Group tabs */}

          {getGroups().length > 1 &&
            renderGroupTabs()}

          {/* Incidents list */}

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.cleanersScrollView}
            contentContainerStyle={styles.cleanersList}
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            {hasIncidents ? (
              <View style={styles.cleanersContent}>
                {filteredCleaners.map(
                  (cleaner, index) =>
                    renderCleanerCard(
                      cleaner,
                      index
                    )
                )}
              </View>
            ) : (
              renderEmptyState(
                selectedGroup !== 'all'
                  ? 'group'
                  : 'general'
              )
            )}
          </ScrollView>
        </View>
      )}

      {/* ────────────────────────────────────────────────
          Image Viewer Modal
      ──────────────────────────────────────────────── */}

      <Modal
        isVisible={isModalVisible}
        style={styles.modal}
        onBackdropPress={() =>
          setModalVisible(false)
        }
        onSwipeComplete={() =>
          setModalVisible(false)
        }
        swipeDirection={['down']}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropOpacity={0.95}
        useNativeDriver
      >
        <View style={styles.modalContainer}>
          <ImageViewer
            imageUrls={currentImages}
            index={currentImageIndex}
            backgroundColor="#000000"
            enableSwipeDown
            enableImageZoom
            onCancel={() =>
              setModalVisible(false)
            }
            onChange={(index) =>
              setCurrentImageIndex(index ?? 0)
            }
            renderHeader={() => (
              <View style={styles.modalHeader}>
                {/* Photo counter — left */}
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
                      Number(currentImageIndex) || 0
                    ) + 1}{' '}
                    / {currentImages.length}
                  </AppText>
                </View>
            
                {/* Close button — right */}
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={tSafe(
                    'close_image_viewer',
                    'Close image viewer'
                  )}
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.8}
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
      backgroundColor: theme.brand.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    headerTextContainer: {
      flex: 1,
    },

    headerTitle: {
      fontSize: 19,
      fontWeight: '700',
      marginBottom: 3,
    },

    headerSubtitle: {
      fontSize: 12,
      lineHeight: 17,
    },

    summaryBadge: {
      minWidth: 54,
      alignItems: 'center',
      backgroundColor: theme.brand.primaryLight,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 13,
      marginLeft: 8,
    },

    summaryText: {
      fontSize: 17,
      fontWeight: '800',
      color: theme.brand.primary,
    },

    summaryCaption: {
      fontSize: 9,
      fontWeight: '600',
      color: theme.brand.primary,
      marginTop: 1,
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
      minWidth: 19,
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderRadius: 8,
      alignItems: 'center',
      backgroundColor: theme.background.sunken,
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
      marginBottom: 14,
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

    avatarPlaceholder: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 11,
      backgroundColor: theme.surface.elevated,
      justifyContent: 'center',
      alignItems: 'center',
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
    },

    cleanerGroupBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: theme.brand.primaryLight,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 7,
    },

    cleanerGroup: {
      fontSize: 11,
      color: theme.brand.primary,
      fontWeight: '700',
    },

    incidentCountBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.elevated,
      borderWidth: 1,
      borderColor: theme.border.default,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 12,
      marginLeft: 8,
      gap: 5,
    },

    incidentCountText: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.text.primary,
    },

    incidentsContainer: {},

    incidentCard: {
      backgroundColor: theme.background.sunken,
      borderColor: theme.border.default,
      borderWidth: 1,
      borderRadius: 14,
      padding: 12,
      marginBottom: 12,
    },

    incidentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      gap: 8,
    },

    incidentInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    incidentIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 9,
    },

    incidentIconReported: {
      backgroundColor: theme.surface.elevated,
    },

    incidentIconResolved: {
      backgroundColor: theme.surface.elevated,
    },

    incidentTimeContainer: {
      flex: 1,
    },

    incidentTime: {
      fontSize: 12,
      color: theme.text.primary,
      fontWeight: '600',
    },

    incidentTimeCaption: {
      fontSize: 10,
      color: theme.text.muted,
      marginTop: 2,
    },

    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 8,
      gap: 5,
    },

    statusReported: {
      backgroundColor: theme.surface.elevated,
    },

    statusResolved: {
      backgroundColor: theme.surface.elevated,
    },

    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },

    statusText: {
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'capitalize',
    },

    incidentDescription: {
      fontSize: 13,
      color: theme.text.primary,
      lineHeight: 20,
      marginBottom: 10,
    },

    photosSection: {
      marginTop: 5,
    },

    photosHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 9,
    },

    photosTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    photosTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.text.secondary,
    },

    photosHint: {
      fontSize: 10,
      color: theme.text.muted,
    },

    photosScrollView: {
      marginHorizontal: -12,
    },

    photosScrollContent: {
      paddingHorizontal: 12,
    },

    photoCard: {
      width: 104,
      height: 104,
      borderRadius: 11,
      marginRight: 10,
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: theme.surface.elevated,
    },

    photoImage: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.surface.elevated,
    },

    photoOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.18)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    notifyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-start',
      gap: 8,
      backgroundColor: theme.button.primaryBackground,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 12,
      marginTop: 14,
    },

    notifyButtonText: {
      color: theme.button.primaryText,
      fontSize: 12,
      fontWeight: '700',
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

    modal: {
      margin: 0,
    },

    modalContainer: {
      flex: 1,
      backgroundColor: '#000000',
    },

    modalHeader: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 52 : 40,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      zIndex: 10,
    },

    modalCounter: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },

    closeButton: {
      backgroundColor: 'rgba(255,255,255,0.20)',
      borderRadius: 22,
      padding: 10,
    },

    fullSizeImage: {
      width: '100%',
      height: '100%',
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
      backgroundColor: 'rgba(0,0,0,0.55)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.18)',
    },
    
    closeButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.55)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.18)',
    },
    
    fullSizeImage: {
      width: '100%',
      height: '100%',
    },
  });

export default Incident;