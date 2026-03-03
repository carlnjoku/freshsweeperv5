// import React, { useContext, useCallback, useEffect,useState } from 'react';
// import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect from React Navigation
// import { SafeAreaView,StyleSheet, Text, StatusBar, useWindowDimensions, Linking, FlatList, ScrollView, View, TouchableOpacity, ActivityIndicator } from 'react-native';
// import COLORS from '../../../constants/colors';
// import userService from '../../../services/connection/userService';
// import { AuthContext } from '../../../context/AuthContext';
// import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
// import * as Animatable from 'react-native-animatable';
// import CardNoPrimary from '../../../components/shared/CardNoPrimary';
// import Modal from 'react-native-modal';
// import ImageViewer from 'react-native-image-zoom-viewer';
// import { Image } from 'expo-image'; 





//   const Incident = ({scheduleId, schedule}) => {


//     const genericArray = new Array(9).fill(null);
//     const {currentUserId} = useContext(AuthContext)

//     const[isLoading, setIsLoading] = useState(false);
//     const[firstname, setFirstname] = useState("")
//     const[lastname, setLastname] = useState("")
//     const[username, setUsername] = useState("")
//     const[avatar, setAvatar] = useState("")
//     const[isOpenImages, setIsOpenImages] = useState(false);
//     const[images, setImages] = React.useState([])
//     const[selected_images, setSelectedImages] = React.useState([])

//     const { width } = useWindowDimensions();
//     const numColumns = 3;
//     const columnWidth = width / numColumns - 26; // Adjusted width to accommodate margins
    
//     const [viewerVisible, setViewerVisible] = useState(false);
//     const [currentImageIndex, setCurrentImageIndex] = useState(0);
//     const [currentImages, setCurrentImages] = useState([]);
//     const [incidents, setIncidents] = useState([]);
    
    
    
//   // Data fetching
//   const fetchIncidents = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const response = await userService.getIncidents(scheduleId);
//       const res = response.data.data;
//       setIncidents(res.incidents);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [scheduleId]);

//     useEffect(() => {
//       fetchIncidents()
//       fetchUser()
//     },[])

//     // Execute fetchImages when the screen comes into focus
//     useFocusEffect(
//       useCallback(() => {
//         fetchImages();
//       }, [])
//     );


//     const fetchImages = async () => {
//       setIsLoading(true);
//       try {
//         const response = await userService.getUpdatedImageUrls(scheduleId);
//         const res = response.data.data;
//         setSelectedImages(res.before_photos);
//       } catch (error) {
//         console.log(error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
    

//   // const openImageViewer = (images, index) => {
//   //   console.log("Brownnnnnn", images)
//   //   setCurrentImages(images);
//   //   setCurrentImageIndex(index);
//   //   setViewerVisible(true);
//   // };

//   const openImageViewer = (images, index) => {
//     console.log("Images data:", images); // Verify image data structure
//     setCurrentImages(images.map(img => ({ url: img.url }))); // Ensure proper format
//     setCurrentImageIndex(index);
//     setViewerVisible(true);
//   };

    
    
//     const fetchUser = async () => {
//       try {
        
//         // setLoading(true)
        
//         await userService.getUser(currentUserId)
//         .then(response=> {
//           const res = response.data
//           console.log(res.firstname)
//           setUsername(res.username)
//           setFirstname(res.firstname)
//           setLastname(res.lastname)
//         })
    
//         // setLoading(false)
  
//       } catch(e) {
//         // error reading value
//         console.log(e)
//       }
//     }

//   return (
//     <SafeAreaView
//       style={{
//         flex:1,
//         backgroundColor:COLORS.white,
//         marginBottom:0,
//       }}
//     >
  
//       <ScrollView>
//           <Animatable.View animation="fadeIn" duration={550}>
//           <View style={styles.container}>

  

//         {isLoading ? (
//           <View style={styles.loaderContainer}>
//             <ActivityIndicator size="large" color={COLORS.primary} />
//           </View>
//         ) : (
//           <View>
//             <FlatList
//               data={incidents}
//               keyExtractor={(item) => item.reported_at}
//               renderItem={({ item }) => (
                
//                   <View style={styles.photosContainer}>
//                     <CardNoPrimary>
//                       <FlatList
//                         horizontal
//                         data={item.photos}
//                         keyExtractor={(photo, index) => `${index}`}
//                         renderItem={({ item: photo, index }) => (
//                           <View style={styles.imageContainer}>
//                             <TouchableOpacity 
//                               onPress={() => openImageViewer(item.photos, index)}
//                             >
//                               <Image 
//                                 source={{ uri: photo.url }} 
//                                 style={styles.incidentImage}
//                                 transition={300}
//                                 cachePolicy="memory-disk" 
//                               />
//                             </TouchableOpacity>
//                           </View>
//                         )}
//                       />
//                       <Text style={styles.incidentDescription}>{item.description}</Text>
//                     </CardNoPrimary>
//                   </View>
           
             
//             )}
//           />
//       </View>
//     )}


//           {/* <View style={{marginLeft:5}}>
    
//               <FlatList 
//                 data = {selected_images}
//                 renderItem = {renderThumbnails}
//                 keyExtractor={(item, index)=> item.index} 
//                 numColumns={numColumns}
//                 key={numColumns}
//                 showsVerticalScrollIndicator={true}
//               />
            
//           </View> */}
//         </View>
//         </Animatable.View>

        
//         </ScrollView>

        
//         <Modal 
//           isVisible={viewerVisible}
//           style={styles.fullScreenModal} 
//           onBackdropPress={() => setViewerVisible(false)}
//         >
//             <View style={styles.imageViewerContainer}>
//               <ImageViewer
//                 imageUrls={currentImages}
//                 index={currentImageIndex}
//                 enableSwipeDown
//                 onSwipeDown={() => setViewerVisible(false)}
//                 backgroundColor="black"
//                 renderImage={(props) => (
//                   <Image
//                     source={{ uri: props.source.uri }}
//                     style={styles.fullSizeImage}
//                     contentFit="contain"
//                     transition={300}
//                     cachePolicy="memory-disk"
//                   />
//                 )}
//                 renderHeader={() => (
//                   <TouchableOpacity
//                     style={styles.viewerCloseButton}
//                     onPress={() => setViewerVisible(false)}
//                   >
//                     <Ionicons name="close" size={28} color="white" />
//                   </TouchableOpacity>
//                 )}
//               />
//             </View>
//         </Modal>
//     </SafeAreaView>
    
   
//   )
// }

// const styles = StyleSheet.create({
//   container:{
//     marginHorizontal:0,
//     marginVertical:0
//   },
//   uploadButton:{
//       width:'100%',
//       alignSelf:'center',
//       marginTop:0,
//       marginBottom:10,
//       padding:20,
//       height:80, 
//       backgroundColor: COLORS.primary_light_1,  
//       borderStyle:'dashed',
//       borderWidth:2,
//       borderColor:COLORS.primary,
//       borderRadius:8, 
//       display: 'flex',
//       alignItems: 'center', 
//       justifyContent: 'center'
//     },
//     thumbnails:{
//       width: 102,
//       height:102,
//       borderRadius:5,
//       margin:5
//     },
//     container0: {
//         backgroundColor: COLORS.white,
//         borderRadius: 10,
//         padding: 15,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.3,
//         shadowRadius: 5,
//         elevation: 3,
//         marginVertical: 10,
//       },
//       cleanersContainer: {
//         flexDirection: 'row',
//         marginBottom: 20,
//       },
//       estimatedTimeContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 10,
//       },
//       startTimeContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//       },
//       timeLabel: {
//         fontSize: 14,
//         fontWeight: 'bold',
//         color: COLORS.black,
//       },
//       timeText: {
//         fontSize: 14,
//         color: COLORS.gray,
//       },
//       fullScreenModal: {
//         margin: 0,
//         backgroundColor: 'rgba(0,0,0,0.9)',
//       },
//       imageViewerContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         backgroundColor: 'black',
//       },
//       fullSizeImage: {
//         flex: 1,
//         width: '100%',
//         height: '100%',
//         resizeMode: 'contain',
//       },
//       incidentContainer: {
//         backgroundColor: '#fff',
//         borderRadius: 12,
//         padding: 16,
//         marginBottom: 16,
//         elevation: 2,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//       },
//       photosContainer:{
//         marginHorizontal:5
//       },
//       imageContainer: {
//         position: 'relative',
//         marginRight: 12,
//         marginBottom: 12,
//       },
//       incidentImage: {
//         width: 100,
//         height: 100,
//         borderRadius: 8,
//       },


//       incidentDescription: {
//         fontSize: 14,
//         color: COLORS.darkGray,
//         lineHeight: 20,
//       },

//       // imageViewerContainer: {
//       //   flex: 1,
//       //   backgroundColor: 'black',
//       // },
//       viewerCloseButton: {
//         position: 'absolute',
//         top: 40,
//         right: 20,
//         zIndex: 1,
//         backgroundColor: 'rgba(255,255,255,0.2)',
//         borderRadius: 20,
//         padding: 8,
//       },
      
//       loaderContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//       },
//       emptyContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 20,
//       },
//       emptyText: {
//         fontSize: 16,
//         color: COLORS.gray,
//         marginTop: 16,
//         textAlign: 'center',
//       },
    
// })

// export default Incident




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
  FlatList
} from 'react-native';
import COLORS from '../../../constants/colors';
import userService from '../../../services/connection/userService';
import { AuthContext } from '../../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import Modal from 'react-native-modal';
import ImageViewer from 'react-native-image-zoom-viewer';
import { Image } from 'expo-image';

const { width: screenWidth } = Dimensions.get('window');

const Incident = ({ scheduleId, schedule }) => {
  const { currentUserId } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [assignedCleaners, setAssignedCleaners] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('all');

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
              // Process assigned cleaners and their incidents
              const processedCleaners = res.assignedTo.map(cleaner => ({
                ...cleaner,
                // Ensure incidents array exists and has proper structure
                incidents: cleaner.incidents?.map(incident => ({
                  ...incident,
                  // Ensure cleanerId is set on each incident
                  cleanerId: incident.cleanerId || cleaner.cleanerId || cleaner._id,
                  // Ensure photos array is properly structured
                  photos: incident.photos || incident.uploaded_files || []
                })) || []
              }));
              
              setAssignedCleaners(processedCleaners);
            }
          }
        } catch (error) {
          console.log('Error fetching data:', error);
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

  // Filter cleaners based on selected group
  const getFilteredCleaners = () => {
    if (selectedGroup === 'all') {
      return assignedCleaners;
    }
    return assignedCleaners.filter(cleaner => cleaner.group === selectedGroup);
  };

  // Get incidents for a specific cleaner
  const getIncidentsForCleaner = (cleaner) => {
    return cleaner.incidents || [];
  };

  const getTotalIncidentsForCleaner = (cleaner) => {
    return getIncidentsForCleaner(cleaner).length;
  };

  const getTotalIncidentsForGroup = (group) => {
    const groupCleaners = group === 'all' ? assignedCleaners : assignedCleaners.filter(c => c.group === group);
    return groupCleaners.reduce((total, cleaner) => total + getTotalIncidentsForCleaner(cleaner), 0);
  };

  const openImageViewer = (images, index) => {
    const formattedImages = images.map(photo => ({
      url: photo.url,
      props: {
        source: { uri: photo.url }
      }
    }));
    setCurrentImages(formattedImages);
    setCurrentImageIndex(index);
    setModalVisible(true);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.log('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const renderGroupTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.groupTabsContainer}
      contentContainerStyle={styles.groupTabsContent}
    >
      {getGroups().map(group => {
        const incidentCount = getTotalIncidentsForGroup(group);
        if (incidentCount === 0 && group !== 'all') return null;
        
        return (
          <TouchableOpacity
            key={group}
            style={[
              styles.groupTab,
              selectedGroup === group && styles.groupTabActive
            ]}
            onPress={() => setSelectedGroup(group)}
          >
            <Text style={[
              styles.groupTabText,
              selectedGroup === group && styles.groupTabTextActive
            ]}>
              {group === 'all' ? 'All Groups' : group.replace('_', ' ').toUpperCase()}
            </Text>
            <View style={styles.groupBadge}>
              <Text style={styles.groupBadgeText}>
                {incidentCount}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderIncidentCard = (cleaner, incident, index) => {
    const hasPhotos = incident.photos?.length > 0;

    return (
      <Animatable.View 
        key={`${incident.reported_at}-${index}`}
        style={styles.incidentCard}
        animation="fadeInUp"
        duration={600}
        delay={index * 200}
      >
        {/* Incident Header */}
        <View style={styles.incidentHeader}>
          <View style={styles.incidentInfo}>
            <MaterialCommunityIcons 
              name="alert-circle" 
              size={20} 
              color={COLORS.warning} 
            />
            <Text style={styles.incidentTime}>
              {formatDate(incident.reported_at)}
            </Text>
          </View>
          <View style={[
            styles.statusBadge,
            incident.status === 'reported' && styles.statusReported,
            incident.status === 'resolved' && styles.statusResolved
          ]}>
            <Text style={styles.statusText}>
              {incident.status || 'reported'}
            </Text>
          </View>
        </View>

        {/* Incident Description */}
        <Text style={styles.incidentDescription}>
          {incident.description}
        </Text>

        {/* Incident Photos */}
        {hasPhotos && (
          <View style={styles.photosSection}>
            <Text style={styles.photosTitle}>
              {incident.photos.length} photo{incident.photos.length !== 1 ? 's' : ''}
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.photosScrollView}
              contentContainerStyle={styles.photosScrollContent}
            >
              {incident.photos.map((photo, photoIndex) => (
                <TouchableOpacity
                  key={photoIndex}
                  style={styles.photoCard}
                  onPress={() => openImageViewer(incident.photos, photoIndex)}
                >
                  <Image 
                    source={{ uri: photo.url }} 
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
        )}
      </Animatable.View>
    );
  };

  const renderCleanerCard = (cleaner, index) => {
    const cleanerIncidents = getIncidentsForCleaner(cleaner);
    const totalIncidents = cleanerIncidents.length;

    if (totalIncidents === 0) return null;

    return (
      <Animatable.View 
        key={`${cleaner.cleanerId || cleaner._id}-${index}`}
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
                <Text style={styles.cleanerGroup}>
                  {cleaner.group?.replace('_', ' ').toUpperCase() || 'UNKNOWN GROUP'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.incidentCountBadge}>
            <MaterialCommunityIcons name="alert" size={16} color={COLORS.white} />
            <Text style={styles.incidentCountText}>{totalIncidents}</Text>
          </View>
        </View>

        {/* Incidents List */}
        <View style={styles.incidentsContainer}>
          {cleanerIncidents.map((incident, incidentIndex) => 
            renderIncidentCard(cleaner, incident, incidentIndex)
          )}
        </View>
      </Animatable.View>
    );
  };

  const renderEmptyState = (type = 'general') => {
    const messages = {
      general: {
        icon: 'check-circle-outline',
        title: 'No Incidents Reported',
        message: 'Great news! No incidents have been reported for this cleaning.'
      },
      group: {
        icon: 'account-group',
        title: 'No Incidents in This Group',
        message: 'Selected group has no reported incidents.'
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
  const hasIncidents = filteredCleaners.some(cleaner => getIncidentsForCleaner(cleaner).length > 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading incidents...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Reported Incidents</Text>
              <Text style={styles.headerSubtitle}>
                Reported issues and concerns during cleaning
              </Text>
            </View>
            <View style={styles.summaryBadge}>
              <Text style={styles.summaryText}>
                {assignedCleaners.length} cleaner{assignedCleaners.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          {/* Group Tabs */}
          {getGroups().length > 1 && renderGroupTabs()}

          {/* Cleaners List */}
          <ScrollView 
            showsVerticalScrollIndicator={false}
            style={styles.cleanersScrollView}
            contentContainerStyle={styles.cleanersList}
          >
            {hasIncidents ? (
              <View style={styles.cleanersContent}>
                {filteredCleaners.map((cleaner, index) => 
                  renderCleanerCard(cleaner, index)
                )}
              </View>
            ) : (
              renderEmptyState(
                selectedGroup !== 'all' ? 'group' : 'general'
              )
            )}
          </ScrollView>
        </View>
      )}

      {/* Image Viewer Modal */}
      <Modal
        isVisible={isModalVisible}
        style={styles.modal}
        onBackdropPress={() => setModalVisible(false)}
        onSwipeComplete={() => setModalVisible(false)}
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
            onCancel={() => setModalVisible(false)}
            renderHeader={() => (
              <View style={styles.modalHeader}>
                <Text style={styles.modalCounter}>
                  {currentImageIndex + 1} / {currentImages.length}
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
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
    paddingVertical:0,
    marginRight: 6,
    backgroundColor: COLORS.light_gray_1,
    borderRadius: 50,
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
    backgroundColor: "#f9f9f9",
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
    backgroundColor: COLORS.primary_light_1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  incidentCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  incidentCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 4,
  },
  incidentsContainer: {
    // Incidents will stack vertically
  },
  incidentCard: {
    backgroundColor: COLORS.light_gray_1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  incidentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  incidentTime: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 6,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: COLORS.light_gray,
  },
  statusReported: {
    backgroundColor: COLORS.warning,
  },
  statusResolved: {
    backgroundColor: COLORS.success,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.dark,
    textTransform: 'capitalize',
  },
  incidentDescription: {
    fontSize: 14,
    color: COLORS.dark,
    lineHeight: 20,
    marginBottom: 12,
  },
  photosSection: {
    marginTop: 8,
  },
  photosTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 8,
  },
  photosScrollView: {
    marginHorizontal: -12,
  },
  photosScrollContent: {
    paddingHorizontal: 12,
  },
  photoCard: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.lightGray,
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

export default Incident;