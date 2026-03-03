// import React, { useState, useRef } from 'react';
// import { 
//   View, 
//   Text, 
//   TouchableOpacity, 
//   StyleSheet, 
//   Animated,
//   LayoutAnimation,
//   Platform,
//   UIManager,
//   Image,
//   ScrollView
// } from 'react-native';
// import { Card, Divider } from 'react-native-paper';
// import { Ionicons, AntDesign } from '@expo/vector-icons';
// import PhotoPreview from '../shared/PhotoPreview';
// import moment from 'moment';
// import COLORS from '../../constants/colors';
// import { useNavigation } from '@react-navigation/native';
// import ROUTES from '../../constants/routes';

// // Enable LayoutAnimation for Android
// if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// const CleanerJobCard = ({ schedule, onImagePress, currentCleanerId }) => {
//   const [expanded, setExpanded] = useState(false);
//   const rotateAnim = useRef(new Animated.Value(0)).current;
//   const scaleAnim = useRef(new Animated.Value(1)).current;
//   const navigation = useNavigation();

//   // Find the specific cleaner from the schedule
//   const currentCleaner = schedule?.assignedTo?.find(
//     cleaner => cleaner.cleanerId === currentCleanerId
//   );

//   // If cleaner not found in this schedule, don't render
//   if (!currentCleaner) {
//     return null;
//   }

//   // Determine if the schedule is completed or uncompleted
//   const getCompletionStatus = () => {
//     // First, check the current cleaner's status
//     const currentCleanerStatus = currentCleaner.status?.toLowerCase();
    
//     // If current cleaner is completed, show as completed regardless of other cleaners
//     if (currentCleanerStatus === 'completed') {
//       return { type: 'completed', text: 'Completed', color: COLORS.green };
//     }
    
//     // If current cleaner is uncompleted, show as uncompleted
//     if (currentCleanerStatus === 'uncompleted') {
//       return { type: 'uncompleted', text: 'Uncompleted', color: COLORS.error };
//     }
    
//     // Check if all cleaners are completed (for overall schedule status)
//     const allCleanersCompleted = schedule?.assignedTo?.every(
//       cleaner => cleaner.status?.toLowerCase() === 'completed'
//     );
    
//     // Check if any cleaner is uncompleted
//     const anyCleanerUncompleted = schedule?.assignedTo?.some(
//       cleaner => cleaner.status?.toLowerCase() === 'uncompleted'
//     );
  
//     // Final fallback logic
//     if (allCleanersCompleted) {
//       return { type: 'completed', text: 'Completed', color: COLORS.success };
//     } else if (anyCleanerUncompleted) {
//       return { type: 'uncompleted', text: 'Uncompleted', color: COLORS.error };
//     } else {
//       return { type: 'in_progress', text: 'In Progress', color: COLORS.warning };
//     }
//   };

//   const completionStatus = getCompletionStatus();


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
//     if (schedule?.status === "completed" && schedule?.verificationStatus === "Pending Approval") {
//       return COLORS.warning;
//     }
//     return completionStatus.color;
//   };

//   const getStatusText = () => {
//     if (schedule?.status === "completed" && schedule?.verificationStatus === "Pending Approval") {
//       return "Pending Approval";
//     }
//     return completionStatus.text;
//   };

//   const getStatusIcon = () => {
//     if (completionStatus.type === 'completed') {
//       return "checkmark-circle-outline";
//     } else if (completionStatus.type === 'uncompleted') {
//       return "close-circle-outline";
//     } else {
//       return "time-outline";
//     }
//   };

//   const getCleanerProgress = () => {
//     return {
//       completed: currentCleaner?.progress?.completedTasks || 0,
//       total: currentCleaner?.progress?.totalTasks || 0,
//       percentage: currentCleaner?.progress?.percentage || 0
//     };
//   };

//   const getCleanerFee = () => {
//     return currentCleaner?.checklist?.price || 0;
//   };

//   const fee = getCleanerFee();

//   const renderCleanerDetails = () => {
//     const progress = getCleanerProgress();
    
//     return (
//       <View style={styles.cleanerCard}>
//         {/* Cleaner Header */}
//         <View style={styles.cleanerHeader}>
//           <View style={styles.cleanerInfo}>
//             <Image 
//               source={{ uri: currentCleaner.avatar }} 
//               style={styles.cleanerAvatar}
//               defaultSource={require('../../assets/images/default_avatar.png')}
//             />
//             <View style={styles.cleanerDetails}>
//               <Text style={styles.cleanerName}>
//                 {currentCleaner.firstname} {currentCleaner.lastname}
//               </Text>
//               <Text style={styles.cleanerGroup}>
//                 {currentCleaner.group?.replace('_', ' ')} • ${fee}
//               </Text>
//             </View>
//           </View>
//           <View style={[
//             styles.cleanerStatus, 
//             { backgroundColor: completionStatus.color }
//           ]}>
//             <Ionicons name={getStatusIcon()} size={12} color="#fff" />
//             <Text style={styles.cleanerStatusText}>
//               {progress.percentage}%
//             </Text>
//           </View>
//         </View>

//         {/* Progress Bar */}
//         <View style={styles.cleanerProgressContainer}>
//           <View style={styles.progressBackground}>
//             <View 
//               style={[
//                 styles.progressFill,
//                 { 
//                   width: `${progress.percentage}%`,
//                   backgroundColor: completionStatus.color
//                 }
//               ]} 
//             />
//           </View>
//           <Text style={styles.progressText}>
//             {progress.completed}/{progress.total} tasks
//           </Text>
//         </View>

//         {/* Room Assignment */}
//         {currentCleaner.checklist?.rooms && (
//           <View style={styles.roomsContainer}>
//             <Text style={styles.roomsLabel}>Rooms:</Text>
//             <ScrollView 
//               horizontal 
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={styles.roomsList}
//             >
//               {currentCleaner.checklist.rooms.map((room, roomIndex) => (
//                 <View key={roomIndex} style={styles.roomChip}>
//                   <Text style={styles.roomText}>
//                     {room.replace('_', ' ')}
//                   </Text>
//                 </View>
//               ))}
//             </ScrollView>
//           </View>
//         )}

//         {/* Extras */}
//         {currentCleaner.checklist?.extras && currentCleaner.checklist.extras.length > 0 && (
//           <View style={styles.extrasContainer}>
//             <Text style={styles.extrasLabel}>Extras:</Text>
//             <ScrollView 
//               horizontal 
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={styles.extrasList}
//             >
//               {currentCleaner.checklist.extras.map((extra, extraIndex) => (
//                 <View key={extraIndex} style={styles.extraChip}>
//                   <Ionicons name="sparkles" size={12} color={COLORS.primary} />
//                   <Text style={styles.extraText}>{extra}</Text>
//                 </View>
//               ))}
//             </ScrollView>
//           </View>
//         )}
//       </View>
//     );
//   };

//   return (
//     <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
//       <Card style={styles.card}>
//         {/* Header with property info */}
//         <View style={styles.header}>
//           <View style={styles.headerContent}>
//             <View style={styles.titleRow}>
//               <AntDesign name="home" size={20} color={COLORS.primary}/>
//               <Text style={styles.title} numberOfLines={1}>
//                 {schedule?.schedule?.apartment_name || 'Unknown Property'}
//               </Text>
//             </View>
            
//             {/* Completion Status Badge */}
//             <View style={[styles.statusBadge, { backgroundColor: completionStatus.color }]}>
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
//               {completionStatus.type === 'completed' ? 'Completed' : 'Scheduled'} {moment(schedule?.completed_on?.$date || schedule?.completed_on || schedule?.schedule?.cleaning_date).format('MMM DD, YYYY [at] h:mm A')}
//             </Text>
//           </View>

//           {/* Cleaner preview - simplified for single cleaner */}
//           <View style={styles.cleanersPreview}>
//             <View style={styles.cleanersAvatars}>
//               <Image
//                 source={{ uri: currentCleaner.avatar }}
//                 style={styles.previewAvatar}
//               />
//             </View>
//             <Text style={styles.cleanersPreviewText}>
//               Your assignment • {completionStatus.text}
//             </Text>
//           </View>
//         </View>

//         {/* Expandable section */}
//         <TouchableOpacity 
//           onPress={() => navigation.navigate(ROUTES.cleaner_attach_task_photos, {
//             scheduleId: schedule._id,
//             schedule: schedule,
//             cleanerId: currentCleanerId,
//             mode: completionStatus.type === 'completed' ? "completed" : "in_progress"
//           })}
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

//         {/* Expanded content */}
//         {expanded && (
//           <View style={styles.expandedContent}>
//             <Divider style={styles.divider} />
            
//             {/* Cleaner Section */}
//             <View style={styles.cleanerSection}>
//               <Text style={styles.sectionTitle}>Your Assignment</Text>
//               {renderCleanerDetails()}
//             </View>

//             {/* Property Details */}
//             <View style={styles.propertySection}>
//               <Text style={styles.sectionTitle}>Property Details</Text>
//               <View style={styles.propertyStats}>
//                 <View style={styles.statItem}>
//                   <Ionicons name="time-outline" size={16} color={COLORS.gray} />
//                   <Text style={styles.statText}>
//                     {schedule?.schedule?.total_cleaning_time || 0} min
//                   </Text>
//                 </View>
//                 <View style={styles.statItem}>
//                   <Ionicons name="cash-outline" size={16} color={COLORS.gray} />
//                   <Text style={styles.statText}>
//                     ${fee} (Your fee)
//                   </Text>
//                 </View>
//                 <View style={styles.statItem}>
//                   <Ionicons name="location-outline" size={16} color={COLORS.gray} />
//                   <Text style={styles.statText} numberOfLines={1}>
//                     {schedule?.schedule?.address?.split(',')[0] || 'Unknown address'}
//                   </Text>
//                 </View>
//               </View>
//             </View>

//             {/* Photo preview section - filtered for this cleaner if needed */}
//             <View style={styles.photoSection}>
//               <Text style={styles.sectionTitle}>Your Cleaning Photos</Text>
//               <PhotoPreview 
//                 checklist={currentCleaner.checklist || schedule.checklist} 
//                 onImagePress={onImagePress}
//               />
//             </View>
//           </View>
//         )}
//       </Card>
//     </Animated.View>
//   );
// };

// // Styles remain exactly the same as your original
// const styles = StyleSheet.create({
//   card: {
//     margin: 0,
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
//     marginBottom: 12,
//   },
//   date: {
//     color: COLORS.gray,
//     fontSize: 13,
//     marginLeft: 6,
//     fontWeight: '500',
//   },
//   cleanersPreview: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   cleanersAvatars: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   previewAvatar: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     borderWidth: 2,
//     borderColor: '#fff',
//     backgroundColor: COLORS.light_gray,
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
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 12,
//     paddingHorizontal: 20,
//   },
//   cleanerSection: {
//     marginBottom: 16,
//   },
//   cleanerCard: {
//     backgroundColor: '#f8f9fa',
//     borderRadius: 12,
//     padding: 16,
//     marginHorizontal: 20,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//   },
//   cleanerHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 12,
//   },
//   cleanerInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   cleanerAvatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginRight: 12,
//   },
//   cleanerDetails: {
//     flex: 1,
//   },
//   cleanerName: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 2,
//   },
//   cleanerGroup: {
//     fontSize: 12,
//     color: COLORS.gray,
//     fontWeight: '500',
//   },
//   cleanerStatus: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   cleanerStatusText: {
//     color: '#fff',
//     fontSize: 11,
//     fontWeight: '600',
//     marginLeft: 4,
//   },
//   cleanerProgressContainer: {
//     marginBottom: 12,
//   },
//   progressBackground: {
//     height: 6,
//     backgroundColor: '#e9ecef',
//     borderRadius: 3,
//     marginBottom: 6,
//     overflow: 'hidden',
//   },
//   progressFill: {
//     height: '100%',
//     borderRadius: 3,
//   },
//   progressText: {
//     fontSize: 11,
//     color: COLORS.gray,
//     fontWeight: '500',
//     textAlign: 'center',
//   },
//   roomsContainer: {
//     marginBottom: 8,
//   },
//   roomsLabel: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 6,
//   },
//   roomsList: {
//     paddingRight: 20,
//   },
//   roomChip: {
//     backgroundColor: '#fff',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#dee2e6',
//     marginRight: 6,
//   },
//   roomText: {
//     fontSize: 11,
//     color: COLORS.dark,
//     fontWeight: '500',
//   },
//   extrasContainer: {
//     marginBottom: 4,
//   },
//   extrasLabel: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginBottom: 6,
//   },
//   extrasList: {
//     paddingRight: 20,
//   },
//   extraChip: {
//     backgroundColor: '#e7f5ff',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: COLORS.primary_light,
//     marginRight: 6,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   extraText: {
//     fontSize: 11,
//     color: COLORS.primary,
//     fontWeight: '500',
//     marginLeft: 4,
//   },
//   propertySection: {
//     marginBottom: 16,
//   },
//   propertyStats: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     paddingHorizontal: 20,
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
//     textAlign: 'center',
//   },
//   photoSection: {
//     paddingBottom: 20,
//   },
// });

// export default CleanerJobCard;



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
import { Card, Divider } from 'react-native-paper';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import PhotoPreview from '../shared/PhotoPreview';
import moment from 'moment';
import COLORS from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../constants/routes';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CleanerJobCard = ({ schedule, onImagePress, currentCleanerId }) => {
  const [expanded, setExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation();

  // Find the specific cleaner from the schedule
  const currentCleaner = schedule?.assignedTo?.find(
    cleaner => cleaner.cleanerId === currentCleanerId
  );

  // If cleaner not found in this schedule, don't render
  if (!currentCleaner) {
    return null;
  }

  // Determine if the schedule is completed or uncompleted
  const getCompletionStatus = () => {
    // First, check the current cleaner's status
    const currentCleanerStatus = currentCleaner.status?.toLowerCase();
    
    // Check if payment has been released for this cleaner
    const isPaymentReleased = currentCleaner.payment_released === true;
    
    // Check if payment is approved (using both field names to handle typos)
    const isPaymentApproved = currentCleaner.payment_approved === true || 
                             currentCleaner.payment_appoved === true; // Handle typo in sample data
    
    // If payment has been released, show payment released status (highest priority)
    if (isPaymentReleased) {
      return { type: 'payment_released', text: 'Payment Released', color: COLORS.success };
    }
    
    // If payment is approved but not yet released
    if (isPaymentApproved || currentCleanerStatus === 'payment_approved') {
      return { type: 'payment_approved', text: 'Payment Approved', color: '#28a745' }; // Green color
    }
    
    // If status is payment_confirmed
    if (currentCleanerStatus === 'payment_confirmed') {
      return { type: 'payment_confirmed', text: 'Payment Confirmed', color: '#17a2b8' }; // Teal color
    }
    
    // If current cleaner is completed, show as completed
    if (currentCleanerStatus === 'completed') {
      return { type: 'completed', text: 'Completed', color: COLORS.green };
    }
    
    // If current cleaner is uncompleted, show as uncompleted
    if (currentCleanerStatus === 'uncompleted') {
      return { type: 'uncompleted', text: 'Uncompleted', color: COLORS.error };
    }
    
    // Check if all cleaners are completed (for overall schedule status)
    const allCleanersCompleted = schedule?.assignedTo?.every(
      cleaner => cleaner.status?.toLowerCase() === 'completed'
    );
    
    // Check if any cleaner is uncompleted
    const anyCleanerUncompleted = schedule?.assignedTo?.some(
      cleaner => cleaner.status?.toLowerCase() === 'uncompleted'
    );
  
    // Final fallback logic
    if (allCleanersCompleted) {
      return { type: 'completed', text: 'Completed', color: COLORS.success };
    } else if (anyCleanerUncompleted) {
      return { type: 'uncompleted', text: 'Uncompleted', color: COLORS.error };
    } else {
      return { type: 'in_progress', text: 'In Progress', color: COLORS.warning };
    }
  };

  const completionStatus = getCompletionStatus();

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

  const getStatusIcon = () => {
    if (completionStatus.type === 'payment_released') {
      return "checkmark-done-circle-outline"; // Double checkmark for released payment
    } else if (completionStatus.type === 'payment_approved') {
      return "checkmark-circle-outline"; // Single checkmark for approved
    } else if (completionStatus.type === 'payment_confirmed') {
      return "checkmark-circle"; // Filled checkmark for confirmed
    } else if (completionStatus.type === 'completed') {
      return "checkmark-circle-outline";
    } else if (completionStatus.type === 'uncompleted') {
      return "close-circle-outline";
    } else {
      return "time-outline";
    }
  };

  const getCleanerProgress = () => {
    return {
      completed: currentCleaner?.progress?.completedTasks || 0,
      total: currentCleaner?.progress?.totalTasks || 0,
      percentage: currentCleaner?.progress?.percentage || 0
    };
  };

  const getCleanerFee = () => {
    return currentCleaner?.checklist?.price || currentCleaner?.fee || 0;
  };

  const fee = getCleanerFee();

  // Format date based on status
  const getDisplayDate = () => {
    const completionDate = schedule?.completed_on?.$date || schedule?.completed_on;
    const scheduledDate = schedule?.schedule?.cleaning_date;
    
    if (completionStatus.type === 'payment_released' && currentCleaner.payout_date) {
      return `Paid ${moment(currentCleaner.payout_date).format('MMM DD, YYYY')}`;
    } else if (completionStatus.type === 'payment_approved') {
      return `Approved ${moment(completionDate).format('MMM DD, YYYY')}`;
    } else if (completionStatus.type === 'payment_confirmed') {
      return `Payment Confirmed ${moment(completionDate).format('MMM DD, YYYY')}`;
    } else if (completionStatus.type === 'completed') {
      return `Completed ${moment(completionDate).format('MMM DD, YYYY [at] h:mm A')}`;
    } else {
      return `Scheduled ${moment(scheduledDate).format('MMM DD, YYYY [at] h:mm A')}`;
    }
  };

  const renderCleanerDetails = () => {
    const progress = getCleanerProgress();
    
    return (
      <View style={styles.cleanerCard}>
        {/* Cleaner Header */}
        <View style={styles.cleanerHeader}>
          <View style={styles.cleanerInfo}>
            <Image 
              source={{ uri: currentCleaner.avatar }} 
              style={styles.cleanerAvatar}
              defaultSource={require('../../assets/images/default_avatar.png')}
            />
            <View style={styles.cleanerDetails}>
              <Text style={styles.cleanerName}>
                {currentCleaner.firstname} {currentCleaner.lastname}
              </Text>
              <Text style={styles.cleanerGroup}>
                {currentCleaner.group?.replace('_', ' ')} • ${fee.toFixed(2)}
                {currentCleaner.payment_released && ' • Paid'}
                {currentCleaner.payout_date && ` on ${moment(currentCleaner.payout_date).format('MMM DD')}`}
              </Text>
            </View>
          </View>
          <View style={[
            styles.cleanerStatus, 
            { backgroundColor: completionStatus.color }
          ]}>
            <Ionicons name={getStatusIcon()} size={12} color="#fff" />
            <Text style={styles.cleanerStatusText}>
              {completionStatus.type === 'payment_released' || 
               completionStatus.type === 'approved' ||
               completionStatus.type === 'payment_confirmed' 
                ? completionStatus.text 
                : `${progress.percentage}%`}
            </Text>
          </View>
        </View>

        {/* Progress Bar - Only show for in-progress jobs */}
        {(completionStatus.type === 'in_progress' || completionStatus.type === 'completed') && (
          <View style={styles.cleanerProgressContainer}>
            <View style={styles.progressBackground}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${progress.percentage}%`,
                    backgroundColor: completionStatus.color
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {progress.completed}/{progress.total} tasks
            </Text>
          </View>
        )}

        {/* Payment Info for approved/released status */}
        {(completionStatus.type === 'payment_released' || 
          completionStatus.type === 'approved' ||
          completionStatus.type === 'payment_confirmed') && (
          <View style={[
            styles.paymentInfo,
            { 
              backgroundColor: completionStatus.type === 'payment_released' ? '#d4edda' : 
                              completionStatus.type === 'payment_approved' ? '#d1ecf1' : 
                              '#e2e3e5'
            }
          ]}>
            <View style={styles.paymentRow}>
              <Ionicons 
                name="cash-outline" 
                size={16} 
                color={completionStatus.type === 'payment_released' ? '#155724' : 
                       completionStatus.type === 'payment_approved' ? '#0c5460' : 
                       '#383d41'} 
              />
              <Text style={[
                styles.paymentText,
                { 
                  color: completionStatus.type === 'payment_released' ? '#155724' : 
                         completionStatus.type === 'payment_approved' ? '#0c5460' : 
                         '#383d41'
                }
              ]}>
                {completionStatus.type === 'payment_released' 
                  ? `Payment released ${currentCleaner.payout_date ? moment(currentCleaner.payout_date).format('MMM DD, YYYY') : ''}`
                  : completionStatus.type === 'approved'
                  ? 'Payment approved - awaiting release'
                  : 'Payment confirmed - under review'}
              </Text>
            </View>
            {currentCleaner.transfer_id && (
              <Text style={styles.transferId}>
                Transfer ID: {currentCleaner.transfer_id}
              </Text>
            )}
          </View>
        )}

        {/* Room Assignment */}
        {currentCleaner.checklist?.rooms && (
          <View style={styles.roomsContainer}>
            <Text style={styles.roomsLabel}>Rooms:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.roomsList}
            >
              {currentCleaner.checklist.rooms.map((room, roomIndex) => (
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
        {currentCleaner.checklist?.extras && currentCleaner.checklist.extras.length > 0 && (
          <View style={styles.extrasContainer}>
            <Text style={styles.extrasLabel}>Extras:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.extrasList}
            >
              {currentCleaner.checklist.extras.map((extra, extraIndex) => (
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
              <AntDesign name="home" size={20} color={COLORS.primary}/>
              <Text style={styles.title} numberOfLines={1}>
                {schedule?.schedule?.apartment_name || 'Unknown Property'}
              </Text>
            </View>
            
            {/* Completion Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: completionStatus.color }]}>
              <Ionicons 
                name={getStatusIcon()} 
                size={12} 
                color="#fff" 
                style={styles.statusIcon}
              />
              <Text style={styles.statusText}>{completionStatus.text}</Text>
            </View>
          </View>

          {/* Date and time */}
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.gray} />
            <Text style={styles.date}>
              {getDisplayDate()}
            </Text>
          </View>

          {/* Cleaner preview - simplified for single cleaner */}
          <View style={styles.cleanersPreview}>
            <View style={styles.cleanersAvatars}>
              <Image
                source={{ uri: currentCleaner.avatar }}
                style={styles.previewAvatar}
              />
            </View>
            <Text style={styles.cleanersPreviewText}>
              Your assignment • {completionStatus.text}
            </Text>
          </View>
        </View>

        {/* Expandable section */}
        <TouchableOpacity 
          onPress={() => navigation.navigate(ROUTES.cleaner_attach_task_photos, {
            scheduleId: schedule._id,
            schedule: schedule,
            cleanerId: currentCleanerId,
            mode: completionStatus.type === 'completed' ? "completed" : "in_progress"
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
            
            {/* Cleaner Section */}
            <View style={styles.cleanerSection}>
              <Text style={styles.sectionTitle}>Your Assignment</Text>
              {renderCleanerDetails()}
            </View>

            {/* Property Details */}
            <View style={styles.propertySection}>
              <Text style={styles.sectionTitle}>Property Details</Text>
              <View style={styles.propertyStats}>
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={16} color={COLORS.gray} />
                  <Text style={styles.statText}>
                    {schedule?.schedule?.total_cleaning_time || 0} min
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="cash-outline" size={16} color={COLORS.gray} />
                  <Text style={styles.statText}>
                    ${fee.toFixed(2)} (Your fee)
                    {currentCleaner.payment_released && ' • Paid'}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="location-outline" size={16} color={COLORS.gray} />
                  <Text style={styles.statText} numberOfLines={1}>
                    {schedule?.schedule?.address?.split(',')[0] || 'Unknown address'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Photo preview section - filtered for this cleaner if needed */}
            <View style={styles.photoSection}>
              <Text style={styles.sectionTitle}>Your Cleaning Photos</Text>
              <PhotoPreview 
                checklist={currentCleaner.checklist || schedule.checklist} 
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
    elevation: 5,
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
    backgroundColor: COLORS.light_gray,
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
  cleanerSection: {
    marginBottom: 16,
  },
  cleanerCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
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
  // Payment info styles
  paymentInfo: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  transferId: {
    fontSize: 11,
    color: '#155724',
    fontFamily: 'monospace',
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
    borderColor: COLORS.primary_light,
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

export default CleanerJobCard;