// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';
// import { Card, Badge, Divider } from 'react-native-paper';
// import { Ionicons } from '@expo/vector-icons';
// import PhotoPreview from './PhotoPreview';
// import moment from 'moment';
// import COLORS from '../../constants/colors';

// const JobCard = ({ schedules, onImagePress }) => {

//   // console.log(schedules.checklist)
//   const [expanded, setExpanded] = useState(false);
//   const toggleExpand = () => setExpanded(!expanded);
//   console.log(schedules.schedule.apartment_name)
//   return (
//     <Card style={styles.card}>
//       <View style={styles.header}>
//         <Text style={styles.title}>{schedules.schedule?.apartment_name}</Text>
//         {schedules?.status==="completed" && schedules?.verificationStatus==="Pending Approval" ? <Badge style={styles.statusApproveBadge}>Approve</Badge>
//         :
//         <Badge style={styles.statusBadge}>Completed</Badge>
//         }
        
//       </View>
//       <Text style={styles.date}>Completed on :  {moment(schedules?.completed_on).format('MM DD YYYY, h:mm A')}</Text>
//       {/* Show photos preview if available */}
    
        
   
//       <TouchableOpacity onPress={toggleExpand} style={styles.expandButton}>
//         <Text style={styles.viewDetailsText}>{expanded ? "Hide Details" : "View Details"}</Text>
//         <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color="gray" />
//       </TouchableOpacity>

//       {expanded && (
//         <>
//           <Divider style={styles.divider} />
//           <View style={styles.taskList}>
//             <PhotoPreview checklist={schedules.checklist} onImagePress={onImagePress}/>
//           </View>
//         </>
//       )}
//     </Card>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     margin: 10,
//     padding: 15,
//     borderRadius: 8,
//     backgroundColor: '#ffffff',
//     elevation: 4,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   title: {
//     fontSize: 15,
//     fontWeight: 'bold',
//   },
//   statusBadge: {
//     backgroundColor: '#4CAF50',
//     color: '#fff',
//     paddingHorizontal:7
//   },
//   statusApproveBadge: {
//     backgroundColor: COLORS.deepBlue,
//     color: '#fff',
//     paddingHorizontal:7
//   },
//   date: {
//     color: '#888',
//     marginVertical: 5,
//     fontSize:13
//   },
//   expandButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     paddingVertical: 8,
//   },
//   viewDetailsText: {
//     color: 'gray',
//     marginRight: 5,
//   },
//   divider: {
//     marginVertical: 10,
//   },
//   taskList: {
//     marginTop: 10,
//   },
//   taskItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 5,
//   },
//   taskLabel: {
//     marginLeft: 8,
//     color: '#333',
//   },
// });

// export default JobCard;



// import React, { useState, useRef } from 'react';
// import { 
//   View, 
//   Text, 
//   TouchableOpacity, 
//   StyleSheet, 
//   Animated,
//   LayoutAnimation,
//   Platform,
//   UIManager
// } from 'react-native';
// import { Card, Badge, Divider } from 'react-native-paper';
// import { Ionicons } from '@expo/vector-icons';
// import PhotoPreview from './PhotoPreview';
// import moment from 'moment';
// import COLORS from '../../constants/colors';

// // Enable LayoutAnimation for Android
// if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// const JobCard = ({ schedules, onImagePress }) => {
//   const [expanded, setExpanded] = useState(false);
//   const rotateAnim = useRef(new Animated.Value(0)).current;
//   const scaleAnim = useRef(new Animated.Value(1)).current;

//   const toggleExpand = () => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
//     Animated.parallel([
//       Animated.timing(rotateAnim, {
//         toValue: expanded ? 0 : 1,
//         duration: 300,
//         useNativeDriver: true,
//       }),
//       Animated.sequence([
//         Animated.timing(scaleAnim, {
//           toValue: 0.95,
//           duration: 100,
//           useNativeDriver: true,
//         }),
//         Animated.timing(scaleAnim, {
//           toValue: 1,
//           duration: 200,
//           useNativeDriver: true,
//         }),
//       ]),
//     ]).start();

//     setExpanded(!expanded);
//   };

//   const rotate = rotateAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: ['0deg', '180deg'],
//   });

//   const getStatusColor = () => {
//     if (schedules?.status === "completed" && schedules?.verificationStatus === "Pending Approval") {
//       return COLORS.warning;
//     }
//     return COLORS.success;
//   };

//   const getStatusText = () => {
//     if (schedules?.status === "completed" && schedules?.verificationStatus === "Pending Approval") {
//       return "Pending Approval";
//     }
//     return "Completed";
//   };

//   const getStatusIcon = () => {
//     if (schedules?.status === "completed" && schedules?.verificationStatus === "Pending Approval") {
//       return "time-outline";
//     }
//     return "checkmark-circle-outline";
//   };

//   return (
//     <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
//       <Card style={styles.card}>
//         {/* Header with gradient effect */}
//         <View style={styles.header}>
//           <View style={styles.headerContent}>
//             <View style={styles.titleRow}>
//               <Ionicons name="business-outline" size={20} color={COLORS.primary} />
//               <Text style={styles.title} numberOfLines={1}>
//                 {schedules.schedule?.apartment_name || 'Unknown Property'}
//               </Text>
//             </View>
            
//             <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
//               <Ionicons 
//                 name={getStatusIcon()} 
//                 size={12} 
//                 color="#fff" 
//                 style={styles.statusIcon}
//               />
//               <Text style={styles.statusText}>{getStatusText()}</Text>
//             </View>
//           </View>

//           {/* Date and time */}
//           <View style={styles.dateRow}>
//             <Ionicons name="calendar-outline" size={14} color={COLORS.gray} />
//             <Text style={styles.date}>
//               Completed {moment(schedules?.completed_on).format('MMM DD, YYYY [at] h:mm A')}
//             </Text>
//           </View>
//         </View>

//         {/* Progress bar for completion */}
//         <View style={styles.progressContainer}>
//           <View style={styles.progressBackground}>
//             <View 
//               style={[
//                 styles.progressFill,
//                 { 
//                   width: `${schedules?.progress?.percentage || 0}%`,
//                   backgroundColor: getStatusColor()
//                 }
//               ]} 
//             />
//           </View>
//           <Text style={styles.progressText}>
//             {schedules?.progress?.completedTasks || 0}/{schedules?.progress?.totalTasks || 0} tasks
//           </Text>
//         </View>

//         {/* Expandable section */}
//         <TouchableOpacity 
//           onPress={toggleExpand} 
//           style={styles.expandButton}
//           activeOpacity={0.7}
//         >
//           <Text style={styles.viewDetailsText}>
//             {expanded ? "Hide Details" : "View Details"}
//           </Text>
//           <Animated.View style={{ transform: [{ rotate }] }}>
//             <Ionicons name="chevron-down" size={20} color={COLORS.primary} />
//           </Animated.View>
//         </TouchableOpacity>

//         {/* Expanded content with smooth animation */}
//         {expanded && (
//           <View style={styles.expandedContent}>
//             <Divider style={styles.divider} />
            
//             {/* Quick stats */}
//             <View style={styles.statsContainer}>
//               <View style={styles.statItem}>
//                 <Ionicons name="time-outline" size={16} color={COLORS.gray} />
//                 <Text style={styles.statText}>
//                   {schedules.checklist?.totalTime || 0} min
//                 </Text>
//               </View>
              
//               <View style={styles.statItem}>
//                 <Ionicons name="cash-outline" size={16} color={COLORS.gray} />
//                 <Text style={styles.statText}>
//                   ${schedules.checklist?.price || 0}
//                 </Text>
//               </View>
              
//               <View style={styles.statItem}>
//                 <Ionicons name="home-outline" size={16} color={COLORS.gray} />
//                 <Text style={styles.statText}>
//                   {schedules.checklist?.rooms?.length || 0} rooms
//                 </Text>
//               </View>
//             </View>

//             {/* Photo preview section */}
//             <View style={styles.photoSection}>
//               <Text style={styles.sectionTitle}>Cleaning Photos</Text>
//               <PhotoPreview 
//                 checklist={schedules.checklist} 
//                 onImagePress={onImagePress}
//               />
//             </View>
//           </View>
//         )}
//       </Card>
//     </Animated.View>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     margin: 16,
//     padding: 0,
//     borderRadius: 16,
//     backgroundColor: '#ffffff',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     elevation: 5,
//     overflow: 'hidden',
//   },
//   header: {
//     padding: 20,
//     paddingBottom: 16,
//     backgroundColor: '#fafafa',
//   },
//   headerContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 12,
//   },
//   titleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//     marginRight: 12,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.dark,
//     marginLeft: 8,
//     flex: 1,
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     minWidth: 60,
//   },
//   statusIcon: {
//     marginRight: 4,
//   },
//   statusText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   dateRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   date: {
//     color: COLORS.gray,
//     fontSize: 13,
//     marginLeft: 6,
//     fontWeight: '500',
//   },
//   progressContainer: {
//     paddingHorizontal: 20,
//     paddingBottom: 16,
//   },
//   progressBackground: {
//     height: 6,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 3,
//     marginBottom: 8,
//     overflow: 'hidden',
//   },
//   progressFill: {
//     height: '100%',
//     borderRadius: 3,
//   },
//   progressText: {
//     fontSize: 12,
//     color: COLORS.gray,
//     fontWeight: '500',
//     textAlign: 'center',
//   },
//   expandButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 20,
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//   },
//   viewDetailsText: {
//     color: COLORS.primary,
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   expandedContent: {
//     paddingTop: 8,
//   },
//   divider: {
//     marginHorizontal: 20,
//     backgroundColor: '#f0f0f0',
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     padding: 20,
//     paddingBottom: 16,
//   },
//   statItem: {
//     alignItems: 'center',
//     flex: 1,
//   },
//   statText: {
//     fontSize: 12,
//     color: COLORS.dark,
//     fontWeight: '600',
//     marginTop: 4,
//   },
//   photoSection: {
//     padding: 20,
//     paddingTop: 0,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 12,
//   },
// });

// export default JobCard;



import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  Image,
  ScrollView
} from 'react-native';
import { Card, Badge, Divider } from 'react-native-paper';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import PhotoPreview from './PhotoPreview';
import moment from 'moment';
import COLORS from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../constants/routes';


// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const JobCard = ({ schedules, onImagePress }) => {
  const [expanded, setExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const currentCleaner = "726298y39838233203"

  const navigation = useNavigation();

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: expanded ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    setExpanded(!expanded);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // Get participating cleaners
  const participatingCleaners = schedules?.assignedTo?.filter(cleaner => cleaner.participated) || [];

  const getStatusColor = () => {
    if (schedules?.status === "completed" && schedules?.verificationStatus === "Pending Approval") {
      return COLORS.warning;
    }
    return COLORS.success;
  };

  const getStatusText = () => {
    if (schedules?.status === "completed" && schedules?.verificationStatus === "Pending Approval") {
      return "Pending Approval";
    }
    return "Completed";
  };

  const getStatusIcon = () => {
    if (schedules?.status === "completed" && schedules?.verificationStatus === "Pending Approval") {
      return "time-outline";
    }
    return "checkmark-circle-outline";
  };

  const getCleanerProgress = (cleaner) => {
    return {
      completed: cleaner?.progress?.completedTasks || 0,
      total: cleaner?.progress?.totalTasks || 0,
      percentage: cleaner?.progress?.percentage || 0
    };
  };

  const getCleanerFee = (cleaner) => {
    return cleaner?.checklist?.price || 0;
  };

  const renderCleanerCard = (cleaner, index) => {
    const progress = getCleanerProgress(cleaner);
    const fee = getCleanerFee(cleaner);
    
    return (
      <View key={cleaner.cleanerId || index} style={styles.cleanerCard}>
        {/* Cleaner Header */}
        <View style={styles.cleanerHeader}>
          <View style={styles.cleanerInfo}>
            <Image 
              source={{ uri: cleaner.avatar }} 
              style={styles.cleanerAvatar}
              defaultSource={require('../../assets/images/default_avatar.png')} // Add a default avatar
            />
            <View style={styles.cleanerDetails}>
              <Text style={styles.cleanerName}>
                {cleaner.firstname} {cleaner.lastname}
              </Text>
              <Text style={styles.cleanerGroup}>
                {cleaner.group?.replace('_', ' ')} • ${fee}
              </Text>
            </View>
          </View>
          <View style={[
            styles.cleanerStatus, 
            { backgroundColor: getStatusColor() }
          ]}>
            
            <Ionicons name={getStatusIcon()} size={12} color="#fff" />
            <Text style={styles.cleanerStatusText}>
              {progress.percentage}%
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.cleanerProgressContainer}>
          <View style={styles.progressBackground}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${progress.percentage}%`,
                  backgroundColor: getStatusColor()
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {progress.completed}/{progress.total} tasks
          </Text>
        </View>

        {/* Room Assignment */}
        {cleaner.checklist?.rooms && (
          <View style={styles.roomsContainer}>
            <Text style={styles.roomsLabel}>Rooms:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.roomsList}
            >
              {cleaner.checklist.rooms.map((room, roomIndex) => (
                <View key={roomIndex} style={styles.roomChip}>
                  <Text style={styles.roomText}>
                    {room.replace('_', ' ')}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Extras */}
        {cleaner.checklist?.extras && cleaner.checklist.extras.length > 0 && (
          <View style={styles.extrasContainer}>
            <Text style={styles.extrasLabel}>Extras:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.extrasList}
            >
              {cleaner.checklist.extras.map((extra, extraIndex) => (
                <View key={extraIndex} style={styles.extraChip}>
                  <Ionicons name="sparkles" size={12} color={COLORS.primary} />
                  <Text style={styles.extraText}>{extra}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Card style={styles.card}>
        {/* Header with property info */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              {/* <Ionicons name="business-outline" size={20} color={COLORS.primary} /> */}
              <AntDesign name="home" size={20} color={COLORS.primary}/>
              <Text style={styles.title} numberOfLines={1}>
                {schedules?.schedule?.apartment_name || 'Unknown Property'}
              </Text>
            </View>
            
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Ionicons 
                name={getStatusIcon()} 
                size={12} 
                color="#fff" 
                style={styles.statusIcon}
              />
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
          </View>

          {/* Date and time */}
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.gray} />
            <Text style={styles.date}>
              Completed {moment(schedules?.completed_on?.$date || schedules?.completed_on).format('MMM DD, YYYY [at] h:mm A')}
            </Text>
          </View>

          {/* Cleaners preview */}
          {participatingCleaners.length > 0 && (
            <View style={styles.cleanersPreview}>
              <View style={styles.cleanersAvatars}>
                {participatingCleaners.slice(0, 3).map((cleaner, index) => (
                  <Image
                    key={cleaner.cleanerId}
                    source={{ uri: cleaner.avatar }}
                    style={[
                      styles.previewAvatar,
                      { marginLeft: index > 0 ? -8 : 0 }
                    ]}
                  />
                ))}
                {participatingCleaners.length > 3 && (
                  <View style={[styles.previewAvatar, styles.moreCleaners]}>
                    <Text style={styles.moreCleanersText}>
                      +{participatingCleaners.length - 3}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.cleanersPreviewText}>
                {participatingCleaners.length} cleaner{participatingCleaners.length > 1 ? 's' : ''} assigned
              </Text>
            </View>
          )}
        </View>

        {/* Expandable section */}
        <TouchableOpacity 
          onPress={() => navigation.navigate(ROUTES.host_task_progress, {
            scheduleId: schedules._id,
            schedule: schedules,
            mode: "completed"
          })}
          style={styles.expandButton}
          activeOpacity={0.7}
        >
          <Text style={styles.viewDetailsText}>
            {expanded ? "Hide Details" : "View Details"}
          </Text>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons name="chevron-down" size={20} color={COLORS.primary} />
          </Animated.View>
        </TouchableOpacity>

        {/* Expanded content */}
        {expanded && (
          <View style={styles.expandedContent}>
            <Divider style={styles.divider} />
            
            {/* Cleaners Section */}
            <View style={styles.cleanersSection}>
              <Text style={styles.sectionTitle}>Assigned Cleaners</Text>
              <View style={styles.cleanersList}>
                {participatingCleaners.map(renderCleanerCard)}
              </View>
            </View>

            {/* Property Details */}
            <View style={styles.propertySection}>
              <Text style={styles.sectionTitle}>Property Details</Text>
              <View style={styles.propertyStats}>
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={16} color={COLORS.gray} />
                  <Text style={styles.statText}>
                    {schedules?.schedule?.total_cleaning_time || 0} min
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="cash-outline" size={16} color={COLORS.gray} />
                  <Text style={styles.statText}>
                    ${schedules?.schedule?.total_cleaning_fee || 0}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="location-outline" size={16} color={COLORS.gray} />
                  <Text style={styles.statText} numberOfLines={1}>
                    {schedules?.schedule?.address?.split(',')[0] || 'Unknown address'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Photo preview section */}
            <View style={styles.photoSection}>
              <Text style={styles.sectionTitle}>Cleaning Photos</Text>
              <PhotoPreview 
                checklist={schedules.checklist} 
                onImagePress={onImagePress}
              />
            </View>
          </View>
        )}
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 0,
    padding: 0,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 1,
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    backgroundColor: '#fafafa',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginLeft: 8,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 60,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    color: COLORS.gray,
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
  cleanersPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cleanersAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: COLORS.lightGray,
  },
  moreCleaners: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreCleanersText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  cleanersPreviewText: {
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '500',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  viewDetailsText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  expandedContent: {
    paddingTop: 8,
  },
  divider: {
    marginHorizontal: 20,
    backgroundColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  cleanersSection: {
    marginBottom: 16,
  },
  cleanersList: {
    paddingHorizontal: 20,
  },
  cleanerCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cleanerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cleanerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cleanerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  cleanerDetails: {
    flex: 1,
  },
  cleanerName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 2,
  },
  cleanerGroup: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  cleanerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cleanerStatusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  cleanerProgressContainer: {
    marginBottom: 12,
  },
  progressBackground: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: COLORS.gray,
    fontWeight: '500',
    textAlign: 'center',
  },
  roomsContainer: {
    marginBottom: 8,
  },
  roomsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 6,
  },
  roomsList: {
    paddingRight: 20,
  },
  roomChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginRight: 6,
  },
  roomText: {
    fontSize: 11,
    color: COLORS.dark,
    fontWeight: '500',
  },
  extrasContainer: {
    marginBottom: 4,
  },
  extrasLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 6,
  },
  extrasList: {
    paddingRight: 20,
  },
  extraChip: {
    backgroundColor: '#e7f5ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    marginRight: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  extraText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  propertySection: {
    marginBottom: 16,
  },
  propertyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 12,
    color: COLORS.dark,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  photoSection: {
    paddingBottom: 20,
  },
});

export default JobCard;