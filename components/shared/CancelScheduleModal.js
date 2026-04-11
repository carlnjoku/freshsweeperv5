// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   Modal,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Alert,
// } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';

// const CancelScheduleModal = ({
//   visible,
//   onClose,
//   booking,
//   userType, // 'host' or 'cleaner'
//   onCancelBooking,
//   cleaners = [], // Array of assigned cleaners
//   cancellationType = 'full', // 'full' (entire booking) or 'partial' (specific cleaner)
//   targetCleaner = null, // Specific cleaner when cancellationType is 'partial'
// }) => {
//   const [selectedReason, setSelectedReason] = useState('');
//   const [additionalNotes, setAdditionalNotes] = useState('');
//   const [step, setStep] = useState(1); // 1: reason, 2: confirmation
  

//   const cancellationReasons = {
//     host: [
//       {
//         id: 'schedule_conflict',
//         label: 'Schedule conflict',
//         description: 'I have a conflict with the scheduled time',
//       },
//       {
//         id: 'no_longer_needed',
//         label: 'Service no longer needed',
//         description: 'I don\'t need the cleaning service anymore',
//       },
//       {
//         id: 'found_alternative',
//         label: 'Found alternative',
//         description: 'I found another cleaning service',
//       },
//       {
//         id: 'cleaner_issues',
//         label: 'Issues with cleaner',
//         description: 'I want to work with a different cleaner',
//       },
//       {
//         id: 'other',
//         label: 'Other reason',
//         description: 'Another reason not listed',
//       },
//     ],
//     cleaner: [
//       {
//         id: 'emergency',
//         label: 'Emergency',
//         description: 'I have a personal emergency',
//       },
//       {
//         id: 'sickness',
//         label: 'Sickness',
//         description: 'I\'m not feeling well',
//       },
//       {
//         id: 'transportation',
//         label: 'Transportation issue',
//         description: 'I have transportation problems',
//       },
//       {
//         id: 'schedule_conflict',
//         label: 'Schedule conflict',
//         description: 'I have another booking at this time',
//       },
//       {
//         id: 'other',
//         label: 'Other reason',
//         description: 'Another reason not listed',
//       },
//     ],
//   };

//   const cancellationPolicy = {
//     host: [
//       {
//         timeframe: 'More than 48 hours before',
//         fee: 'No cancellation fee',
//         penalty: 'Full refund',
//       },
//       {
//         timeframe: '24-48 hours before',
//         fee: '25% cancellation fee',
//         penalty: '75% refund',
//       },
//       {
//         timeframe: 'Less than 24 hours before',
//         fee: '50% cancellation fee',
//         penalty: '50% refund',
//       },
//     ],
//     cleaner: [
//       {
//         timeframe: 'More than 48 hours before',
//         penalty: 'No penalty',
//         impact: 'Good standing maintained',
//       },
//       {
//         timeframe: '24-48 hours before',
//         penalty: 'Small impact on rating',
//         impact: 'May affect future bookings',
//       },
//       {
//         timeframe: 'Less than 24 hours before',
//         penalty: 'Significant impact on rating',
//         impact: 'Temporary suspension risk',
//       },
//     ],
//   };


//   const getCancellationTitle = () => {
//     if (cancellationType === 'partial' && targetCleaner) {
//       return `Cancel ${targetCleaner.firstname}'s Assignment`;
//     }
//     return 'Cancel Booking';
//   };

//   const getCancellationDescription = () => {
//     if (cancellationType === 'partial' && targetCleaner) {
//       return `You are cancelling only ${targetCleaner.firstname}'s assignment. Other cleaners will remain scheduled.`;
//     }
    
//     if (cleaners.length > 1) {
//       return `This will cancel the entire booking for all ${cleaners.length} cleaners.`;
//     }
    
//     return 'This will cancel the entire booking.';
//   };

//   const calculateAffectedCleaners = () => {
//     if (cancellationType === 'partial' && targetCleaner) {
//       return [targetCleaner];
//     }
//     return cleaners;
//   };

//   const handleCancelBooking = () => {
//     const affectedCleaners = calculateAffectedCleaners();
//     const cancellationData = {
//       bookingId: booking.id,
//       cancelledBy: userType,
//       reason: selectedReason,
//       additionalNotes,
//       timestamp: new Date().toISOString(),
//       cancellationType,
//       affectedCleaners: affectedCleaners.map(cleaner => cleaner.cleanerId),
//       targetCleanerId: cancellationType === 'partial' ? targetCleaner.cleanerId : null,
//     };

//     onCancelBooking(cancellationData);
//     onClose();
    
//     // Reset state
//     setSelectedReason('');
//     setAdditionalNotes('');
//     setStep(1);
//   };

//   const calculateTimeUntilBooking = () => {
//     const bookingTime = new Date(booking.date);
//     const now = new Date();
//     const diffHours = (bookingTime - now) / (1000 * 60 * 60);
//     return diffHours;
//   };

//   const getCancellationFee = () => {
//     const hoursUntilBooking = calculateTimeUntilBooking();
    
//     if (userType === 'host') {
//       if (hoursUntilBooking > 48) return { fee: 0, percentage: 0 };
//       if (hoursUntilBooking > 24) return { fee: booking.amount * 0.25, percentage: 25 };
//       return { fee: booking.amount * 0.5, percentage: 50 };
//     } else {
//       // Cleaner penalties are different
//       if (hoursUntilBooking > 48) return { penalty: 'None', impact: 'Low' };
//       if (hoursUntilBooking > 24) return { penalty: 'Medium', impact: 'Medium' };
//       return { penalty: 'High', impact: 'High' };
//     }
//   };




//   const handleConfirmCancel = () => {
//     const feeInfo = getCancellationFee();
    
//     if (userType === 'host') {
//       Alert.alert(
//         'Confirm Cancellation',
//         `Are you sure you want to cancel this booking? 
        
// Cancellation Fee: $${feeInfo.fee.toFixed(2)} (${feeInfo.percentage}%)
// Refund Amount: $${(booking.amount - feeInfo.fee).toFixed(2)}`,
//         [
//           { text: 'Go Back', style: 'cancel' },
//           { 
//             text: 'Confirm Cancellation', 
//             style: 'destructive',
//             onPress: handleCancelBooking
//           },
//         ]
//       );
//     } else {
//       Alert.alert(
//         'Confirm Cancellation',
//         `Are you sure you want to cancel this booking?
        
// Impact: ${feeInfo.penalty} penalty
// This will ${feeInfo.impact.toLowerCase()} impact your cleaner rating.`,
//         [
//           { text: 'Go Back', style: 'cancel' },
//           { 
//             text: 'Confirm Cancellation', 
//             style: 'destructive',
//             onPress: handleCancelBooking
//           },
//         ]
//       );
//     }
//   };


//   const renderCleanerList = () => {
//     const affectedCleaners = calculateAffectedCleaners();
    
//     return (
//       <View style={styles.cleanersSection}>
//         <Text style={styles.sectionTitle}>
//           {cancellationType === 'partial' ? 'Cleaner Being Removed' : 'All Affected Cleaners'}
//         </Text>
//         {affectedCleaners.map((cleaner, index) => (
//           <View key={cleaner.cleanerId || index} style={styles.cleanerItem}>
//             <View style={styles.cleanerAvatar}>
//               <MaterialCommunityIcons name="account" size={20} color="#666" />
//             </View>
//             <View style={styles.cleanerInfo}>
//               <Text style={styles.cleanerName}>
//                 {cleaner.firstname} {cleaner.lastname}
//               </Text>
//               <Text style={styles.cleanerStatus}>
//                 Status: {cleaner.status || 'assigned'}
//               </Text>
//             </View>
//             {cancellationType === 'partial' && (
//               <MaterialCommunityIcons name="close-circle" size={20} color="#DC3545" />
//             )}
//           </View>
//         ))}
//       </View>
//     );
//   };

//   const renderReasonStep = () => (
//     <View>
//       <Text style={styles.stepTitle}>Why are you cancelling?</Text>
//       <Text style={styles.stepDescription}>
//         {userType === 'host' 
//           ? 'Please let us know why you need to cancel this booking.'
//           : 'Please select your reason for cancellation.'
//         }
//       </Text>

//       <ScrollView style={styles.reasonsList}>
//         {cancellationReasons[userType].map((reason) => (
//           <TouchableOpacity
//             key={reason.id}
//             style={[
//               styles.reasonItem,
//               selectedReason === reason.id && styles.reasonItemSelected,
//             ]}
//             onPress={() => setSelectedReason(reason.id)}
//           >
//             <View style={styles.reasonContent}>
//               <Text style={styles.reasonLabel}>{reason.label}</Text>
//               <Text style={styles.reasonDescription}>{reason.description}</Text>
//             </View>
//             <View style={[
//               styles.radio,
//               selectedReason === reason.id && styles.radioSelected,
//             ]}>
//               {selectedReason === reason.id && (
//                 <View style={styles.radioInner} />
//               )}
//             </View>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>

//       <TouchableOpacity
//         style={[
//           styles.continueButton,
//           !selectedReason && styles.continueButtonDisabled,
//         ]}
//         disabled={!selectedReason}
//         onPress={() => setStep(2)}
//       >
//         <Text style={styles.continueButtonText}>Continue</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   const renderConfirmationStep = () => (
//     <View>
//       <Text style={styles.stepTitle}>Cancellation Details</Text>
      
//       {/* Cancellation Policy */}
//       <View style={styles.policySection}>
//         <Text style={styles.sectionTitle}>
//           {userType === 'host' ? 'Cancellation Policy' : 'Cancellation Impact'}
//         </Text>
        
//         {cancellationPolicy[userType].map((policy, index) => (
//           <View key={index} style={styles.policyItem}>
//             <Text style={styles.policyTimeframe}>{policy.timeframe}</Text>
//             <View style={styles.policyDetails}>
//               <Text style={styles.policyFee}>{policy.fee || policy.penalty}</Text>
//               <Text style={styles.policyImpact}>{policy.penalty || policy.impact}</Text>
//             </View>
//           </View>
//         ))}
//       </View>

//       {/* Current Booking Impact */}
//       <View style={styles.impactSection}>
//         <Text style={styles.sectionTitle}>For This Booking</Text>
//         <View style={styles.impactItem}>
//           <Text style={styles.impactLabel}>
//             {userType === 'host' ? 'Cancellation Fee:' : 'Impact Level:'}
//           </Text>
//           <Text style={styles.impactValue}>
//             {userType === 'host' 
//               ? `$${getCancellationFee().fee.toFixed(2)}` 
//               : getCancellationFee().penalty
//             }
//           </Text>
//         </View>
//         {userType === 'host' && (
//           <View style={styles.impactItem}>
//             <Text style={styles.impactLabel}>Refund Amount:</Text>
//             <Text style={styles.impactValue}>
//               ${(booking.amount - getCancellationFee().fee).toFixed(2)}
//             </Text>
//           </View>
//         )}
//       </View>

//       <View style={styles.actionButtons}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => setStep(1)}
//         >
//           <Text style={styles.backButtonText}>Back</Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity
//           style={styles.confirmCancelButton}
//           onPress={handleConfirmCancel}
//         >
//           <MaterialCommunityIcons name="alert-circle" size={20} color="#FFFFFF" />
//           <Text style={styles.confirmCancelButtonText}>Confirm Cancellation</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       presentationStyle="pageSheet"
//       onRequestClose={onClose}
//     >
//       <View style={styles.container}>
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={onClose} style={styles.closeButton}>
//             <MaterialCommunityIcons name="close" size={24} color="#666" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>{getCancellationTitle()}</Text>
//           <View style={styles.stepIndicator}>
//             <Text style={styles.stepText}>Step {step} of 2</Text>
//           </View>
//         </View>

//         <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//           <View style={styles.content}>
//             {/* Cancellation Description */}
//             <View style={styles.descriptionSection}>
//               <Text style={styles.descriptionText}>
//                 {getCancellationDescription()}
//               </Text>
//             </View>

//             {/* Show affected cleaners */}
//             {renderCleanerList()}

//             {/* Rest of the cancellation flow (reasons, confirmation, etc.) */}
//             {step === 1 ? renderReasonStep() : renderConfirmationStep()}
//           </View>
//         </ScrollView>
//       </View>
//     </Modal>
    
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingTop: 60,
//     paddingBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//   },
//   closeButton: {
//     padding: 8,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1A1A1A',
//   },
//   stepIndicator: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     backgroundColor: '#F8F9FA',
//     borderRadius: 16,
//   },
//   stepText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: '#666',
//   },
//   content: {
//     flex: 1,
//     padding: 20,
//   },
//   stepTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#1A1A1A',
//     marginBottom: 8,
//   },
//   stepDescription: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 24,
//     lineHeight: 22,
//   },
//   reasonsList: {
//     marginBottom: 24,
//   },
//   reasonItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     borderWidth: 1,
//     borderColor: '#E9ECEF',
//     borderRadius: 12,
//     marginBottom: 12,
//   },
//   reasonItemSelected: {
//     borderColor: '#007AFF',
//     backgroundColor: '#E7F3FF',
//   },
//   reasonContent: {
//     flex: 1,
//   },
//   reasonLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1A1A1A',
//     marginBottom: 4,
//   },
//   reasonDescription: {
//     fontSize: 14,
//     color: '#666',
//   },
//   radio: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     borderWidth: 2,
//     borderColor: '#CCCCCC',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   radioSelected: {
//     borderColor: '#007AFF',
//   },
//   radioInner: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: '#007AFF',
//   },
//   continueButton: {
//     backgroundColor: '#007AFF',
//     paddingVertical: 16,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   continueButtonDisabled: {
//     backgroundColor: '#CCCCCC',
//   },
//   continueButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   policySection: {
//     backgroundColor: '#F8F9FA',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1A1A1A',
//     marginBottom: 16,
//   },
//   policyItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E9ECEF',
//   },
//   policyTimeframe: {
//     fontSize: 14,
//     color: '#666',
//     flex: 1,
//   },
//   policyDetails: {
//     alignItems: 'flex-end',
//     flex: 1,
//   },
//   policyFee: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1A1A1A',
//   },
//   policyImpact: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 2,
//   },
//   impactSection: {
//     backgroundColor: '#FFF3CD',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 24,
//     borderWidth: 1,
//     borderColor: '#FFEAA7',
//   },
//   impactItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   impactLabel: {
//     fontSize: 14,
//     color: '#856404',
//   },
//   impactValue: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#856404',
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   backButton: {
//     flex: 1,
//     paddingVertical: 16,
//     borderRadius: 12,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#007AFF',
//   },
//   backButtonText: {
//     color: '#007AFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   confirmCancelButton: {
//     flex: 2,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 16,
//     borderRadius: 12,
//     backgroundColor: '#DC3545',
//     gap: 8,
//   },
//   confirmCancelButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
  




//   cleanersSection: {
//     backgroundColor: '#F8F9FA',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//   },
//   cleanerItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E9ECEF',
//   },
//   cleanerAvatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#E9ECEF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   cleanerInfo: {
//     flex: 1,
//   },
//   cleanerName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1A1A1A',
//     marginBottom: 4,
//   },
//   cleanerStatus: {
//     fontSize: 12,
//     color: '#666',
//   },
//   descriptionSection: {
//     backgroundColor: '#E7F3FF',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#B3D9FF',
//   },
//   descriptionText: {
//     fontSize: 14,
//     color: '#007AFF',
//     textAlign: 'center',
//     lineHeight: 20,
//   },
// });

// export default CancelScheduleModal;









import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import { tSafe } from '../../utils/tSafe'; // added import

const CancelScheduleModal = ({
  visible,
  onClose,
  booking,
  userType, // 'host' or 'cleaner'
  onCancelBooking,
  cleaners = [], // Default to empty array
  cancellationType = 'full', // 'full' (entire booking) or 'partial' (specific cleaner)
  targetCleaner = null, // Specific cleaner when cancellationType is 'partial'
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [step, setStep] = useState(1);

  // Cancellation policies with penalties and fees (translated)
  const cancellationPolicies = useMemo(() => ({
    host: {
      title: tSafe('host_cancellation_policy_title', 'Host Cancellation Policy'),
      policies: [
        {
          timeframe: tSafe('policy_more_48h', 'More than 48 hours before'),
          fee: tSafe('policy_no_fee', 'No cancellation fee'),
          refund: tSafe('policy_100_refund', '100% refund'),
          description: tSafe('policy_more_48h_desc', 'Cancel anytime more than 48 hours in advance with no charges'),
          color: '#34C759',
          icon: 'check-circle'
        },
        {
          timeframe: tSafe('policy_24_48h', '24-48 hours before'),
          fee: tSafe('policy_25_fee', '25% cancellation fee'),
          refund: tSafe('policy_75_refund', '75% refund'),
          description: tSafe('policy_24_48h_desc', 'Small fee to compensate cleaner for reserved time'),
          color: '#FF9500',
          icon: 'clock-alert'
        },
        {
          timeframe: tSafe('policy_less_24h', 'Less than 24 hours before'),
          fee: tSafe('policy_50_fee', '50% cancellation fee'),
          refund: tSafe('policy_50_refund', '50% refund'),
          description: tSafe('policy_less_24h_desc', 'Significant fee due to last-minute cancellation'),
          color: '#FF3B30',
          icon: 'alert-circle'
        },
        {
          timeframe: tSafe('policy_no_show', 'No-show or same-day cancellation'),
          fee: tSafe('policy_100_fee', '100% cancellation fee'),
          refund: tSafe('policy_no_refund', 'No refund'),
          description: tSafe('policy_no_show_desc', 'Full charge applies for no-shows or same-day cancellations'),
          color: '#8B0000',
          icon: 'close-circle'
        }
      ]
    },
    cleaner: {
      title: tSafe('cleaner_cancellation_policy_title', 'Cleaner Cancellation Policy'),
      policies: [
        {
          timeframe: tSafe('policy_more_72h', 'More than 72 hours before'),
          penalty: tSafe('policy_no_penalty', 'No penalty'),
          impact: tSafe('policy_no_impact', 'No impact on rating'),
          description: tSafe('policy_more_72h_desc', 'Cancel with sufficient notice without penalties'),
          color: '#34C759',
          icon: 'check-circle'
        },
        {
          timeframe: tSafe('policy_48_72h', '48-72 hours before'),
          penalty: tSafe('policy_minor_impact', 'Minor rating impact'),
          impact: tSafe('policy_minor_impact_detail', 'Small decrease in reliability score'),
          description: tSafe('policy_48_72h_desc', 'Minor impact on your cleaner profile rating'),
          color: '#FF9500',
          icon: 'clock-alert'
        },
        {
          timeframe: tSafe('policy_24_48h_cleaner', '24-48 hours before'),
          penalty: tSafe('policy_moderate_impact', 'Moderate rating impact + warning'),
          impact: tSafe('policy_moderate_impact_detail', 'Noticeable decrease in reliability score'),
          description: tSafe('policy_24_48h_cleaner_desc', 'Affects booking priority and may trigger review'),
          color: '#FFCC00',
          icon: 'alert'
        },
        {
          timeframe: tSafe('policy_less_24h_cleaner', 'Less than 24 hours before'),
          penalty: tSafe('policy_severe_impact', 'Significant rating impact + temporary suspension risk'),
          impact: tSafe('policy_severe_impact_detail', 'Major decrease in reliability score'),
          description: tSafe('policy_less_24h_cleaner_desc', 'May result in temporary account suspension for repeated offenses'),
          color: '#FF3B30',
          icon: 'close-circle'
        }
      ]
    }
  }), []);

  // Cancellation reasons (translated)
  const cancellationReasons = useMemo(() => ({
    host: [
      {
        id: 'schedule_conflict',
        label: tSafe('reason_schedule_conflict', 'Schedule conflict'),
        description: tSafe('reason_schedule_conflict_desc', 'I have a conflict with the scheduled time'),
      },
      {
        id: 'no_longer_needed',
        label: tSafe('reason_no_longer_needed', 'Service no longer needed'),
        description: tSafe('reason_no_longer_needed_desc', 'I don\'t need the cleaning service anymore'),
      },
      {
        id: 'found_alternative',
        label: tSafe('reason_found_alternative', 'Found alternative'),
        description: tSafe('reason_found_alternative_desc', 'I found another cleaning service'),
      },
      {
        id: 'cleaner_issues',
        label: tSafe('reason_cleaner_issues', 'Issues with cleaner'),
        description: tSafe('reason_cleaner_issues_desc', 'I want to work with a different cleaner'),
      },
      {
        id: 'other',
        label: tSafe('reason_other', 'Other reason'),
        description: tSafe('reason_other_desc', 'Another reason not listed'),
      },
    ],
    cleaner: [
      {
        id: 'emergency',
        label: tSafe('reason_emergency', 'Emergency'),
        description: tSafe('reason_emergency_desc', 'I have a personal emergency'),
      },
      {
        id: 'sickness',
        label: tSafe('reason_sickness', 'Sickness'),
        description: tSafe('reason_sickness_desc', 'I\'m not feeling well'),
      },
      {
        id: 'transportation',
        label: tSafe('reason_transportation', 'Transportation issue'),
        description: tSafe('reason_transportation_desc', 'I have transportation problems'),
      },
      {
        id: 'schedule_conflict',
        label: tSafe('reason_schedule_conflict', 'Schedule conflict'),
        description: tSafe('reason_schedule_conflict_desc', 'I have another booking at this time'),
      },
      {
        id: 'other',
        label: tSafe('reason_other', 'Other reason'),
        description: tSafe('reason_other_desc', 'Another reason not listed'),
      },
    ],
  }), []);

  // Safe array handling for cleaners
  const safeCleaners = Array.isArray(cleaners) ? cleaners : [];

  // Calculate time until booking
  const calculateTimeUntilBooking = () => {
    if (!booking?.date) return Infinity;
    
    const bookingTime = new Date(booking.date);
    const now = new Date();
    const diffHours = (bookingTime - now) / (1000 * 60 * 60);
    return diffHours;
  };

  // Calculate cancellation fee for host
  const calculateCancellationFee = () => {
    const hoursUntilBooking = calculateTimeUntilBooking();
    const totalAmount = booking?.amount || 0;
    
    if (hoursUntilBooking > 48) {
      return { fee: 0, percentage: 0, refund: totalAmount };
    } else if (hoursUntilBooking > 24) {
      const fee = totalAmount * 0.25;
      return { fee, percentage: 25, refund: totalAmount - fee };
    } else if (hoursUntilBooking > 0) {
      const fee = totalAmount * 0.5;
      return { fee, percentage: 50, refund: totalAmount - fee };
    } else {
      // Same day or no-show
      return { fee: totalAmount, percentage: 100, refund: 0 };
    }
  };

  // Get cleaner penalty based on timing (translated strings for penalties)
  const getCleanerPenalty = () => {
    const hoursUntilBooking = calculateTimeUntilBooking();
    
    if (hoursUntilBooking > 72) {
      return {
        penalty: tSafe('penalty_none', 'None'),
        impact: tSafe('penalty_impact_low', 'Low'),
        description: tSafe('penalty_desc_none', 'No impact on your rating'),
        reliabilityImpact: 0,
        ratingImpact: 0
      };
    } else if (hoursUntilBooking > 48) {
      return {
        penalty: tSafe('penalty_minor', 'Minor'),
        impact: tSafe('penalty_impact_medium', 'Medium'),
        description: tSafe('penalty_desc_minor', 'Small decrease in reliability score'),
        reliabilityImpact: 8,
        ratingImpact: 0.2
      };
    } else if (hoursUntilBooking > 24) {
      return {
        penalty: tSafe('penalty_moderate', 'Moderate'),
        impact: tSafe('penalty_impact_high', 'High'),
        description: tSafe('penalty_desc_moderate', 'Noticeable impact on booking priority'),
        reliabilityImpact: 15,
        ratingImpact: 0.4
      };
    } else {
      return {
        penalty: tSafe('penalty_severe', 'Severe'),
        impact: tSafe('penalty_impact_very_high', 'Very High'),
        description: tSafe('penalty_desc_severe', 'Risk of temporary suspension'),
        reliabilityImpact: 25,
        ratingImpact: 0.8
      };
    }
  };

  const getCancellationTitle = () => {
    if (cancellationType === 'partial' && targetCleaner) {
      return tSafe('cancel_cleaner_assignment_title', 'Cancel {name}\'s Assignment', { name: targetCleaner.firstname });
    }
    return tSafe('cancel_booking_title', 'Cancel Booking');
  };

  const getCancellationDescription = () => {
    if (cancellationType === 'partial' && targetCleaner) {
      return tSafe('cancel_partial_description', 'You are cancelling only {name}\'s assignment. Other cleaners will remain scheduled.', { name: targetCleaner.firstname });
    }
    
    if (safeCleaners.length > 1) {
      return tSafe('cancel_full_description_plural', 'This will cancel the entire booking for all {count} cleaners.', { count: safeCleaners.length });
    }
    
    return tSafe('cancel_full_description', 'This will cancel the entire booking.');
  };

  const calculateAffectedCleaners = () => {
    if (cancellationType === 'partial' && targetCleaner) {
      return [targetCleaner];
    }
    return safeCleaners;
  };

  const handleCancelBooking = () => {
    const affectedCleaners = calculateAffectedCleaners();
    const feeInfo = userType === 'host' ? calculateCancellationFee() : null;
    const penaltyInfo = userType === 'cleaner' ? getCleanerPenalty() : null;

    const cancellationData = {
      bookingId: booking?.id,
      cancelledBy: userType,
      reason: selectedReason,
      additionalNotes,
      timestamp: new Date().toISOString(),
      cancellationType,
      affectedCleaners: affectedCleaners.map(cleaner => cleaner?.cleanerId).filter(Boolean),
      targetCleanerId: cancellationType === 'partial' ? targetCleaner?.cleanerId : null,
      cancellationFee: feeInfo?.fee || 0,
      refundAmount: feeInfo?.refund || 0,
      penaltyLevel: penaltyInfo?.penalty || 'None'
    };

    onCancelBooking(cancellationData);
    onClose();
    
    // Reset state
    setSelectedReason('');
    setAdditionalNotes('');
    setStep(1);
  };

  const renderReasonStep = () => (
    <View>
      <Text style={styles.stepTitle}>{tSafe('cancel_reason_title', 'Why are you cancelling?')}</Text>
      <Text style={styles.stepDescription}>
        {userType === 'host' 
          ? tSafe('cancel_reason_host_desc', 'Please let us know why you need to cancel this booking.')
          : tSafe('cancel_reason_cleaner_desc', 'Please select your reason for cancellation.')
        }
      </Text>

      <ScrollView style={styles.reasonsList}>
        {cancellationReasons[userType]?.map((reason) => (
          <TouchableOpacity
            key={reason.id}
            style={[
              styles.reasonItem,
              selectedReason === reason.id && styles.reasonItemSelected,
            ]}
            onPress={() => setSelectedReason(reason.id)}
          >
            <View style={styles.reasonContent}>
              <Text style={styles.reasonLabel}>{reason.label}</Text>
              <Text style={styles.reasonDescription}>{reason.description}</Text>
            </View>
            <View style={[
              styles.radio,
              selectedReason === reason.id && styles.radioSelected,
            ]}>
              {selectedReason === reason.id && (
                <View style={styles.radioInner} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.continueButton,
          !selectedReason && styles.continueButtonDisabled,
        ]}
        disabled={!selectedReason}
        onPress={() => setStep(2)}
      >
        <Text style={styles.continueButtonText}>{tSafe('continue', 'Continue')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCleanerList = () => {
    const affectedCleaners = calculateAffectedCleaners();
    
    // Don't render if no cleaners to show
    if (!affectedCleaners || affectedCleaners.length === 0) {
      return null;
    }

    return (
      <View style={styles.cleanersSection}>
        <Text style={styles.sectionTitle}>
          {cancellationType === 'partial' 
            ? tSafe('cleaner_being_removed', 'Cleaner Being Removed')
            : tSafe('all_affected_cleaners', 'All Affected Cleaners')}
        </Text>
        {affectedCleaners.map((cleaner, index) => (
          <View key={cleaner?.cleanerId || index} style={styles.cleanerItem}>
            <View style={styles.cleanerAvatar}>
              <MaterialCommunityIcons name="account" size={20} color="#666" />
            </View>
            <View style={styles.cleanerInfo}>
              <Text style={styles.cleanerName}>
                {cleaner?.firstname ? `${cleaner.firstname} ${cleaner.lastname}` : tSafe('unknown_cleaner', 'Unknown Cleaner')}
              </Text>
              <Text style={styles.cleanerStatus}>
                {tSafe('status_label', 'Status')}: {cleaner?.status || tSafe('assigned', 'assigned')}
              </Text>
            </View>
            {cancellationType === 'partial' && (
              <MaterialCommunityIcons name="close-circle" size={20} color="#DC3545" />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderPolicyDetails = () => {
    const hoursUntilBooking = calculateTimeUntilBooking();
    const penaltyInfo = userType === 'cleaner' ? getCleanerPenalty() : null;

    return (
      <View style={styles.policySection}>
        <Text style={styles.sectionTitle}>
          {userType === 'host' ? tSafe('cancellation_fees', 'Cancellation Fees') : tSafe('cancellation_impact', 'Cancellation Impact on Your Profile')}
        </Text>
        
        {/* Current timing and applicable policy */}
        <View style={styles.currentPolicy}>
          <Text style={styles.currentPolicyTitle}>{tSafe('for_this_cancellation', 'For This Cancellation:')}</Text>
          <Text style={styles.timeRemaining}>
            {tSafe('time_until_booking', 'Time until booking: {time}', { 
              time: hoursUntilBooking > 0 ? `${Math.floor(hoursUntilBooking)} ${tSafe('hours', 'hours')}` : tSafe('less_than_1_hour', 'Less than 1 hour')
            })}
          </Text>
          
          {userType === 'cleaner' && penaltyInfo && (
            <View style={styles.penaltyDetails}>
              <View style={styles.penaltyRow}>
                <Text style={styles.penaltyLabel}>{tSafe('penalty_level_label', 'Penalty Level:')}</Text>
                <Text style={[
                  styles.penaltyValue, 
                  penaltyInfo.penalty === 'Severe' ? styles.severePenalty :
                  penaltyInfo.penalty === 'Moderate' ? styles.moderatePenalty :
                  styles.minorPenalty
                ]}>
                  {penaltyInfo.penalty}
                </Text>
              </View>
              
              <View style={styles.impactMetrics}>
                <View style={styles.metricItem}>
                  <MaterialCommunityIcons name="shield-account" size={16} color="#666" />
                  <Text style={styles.metricLabel}>{tSafe('reliability_score_label', 'Reliability Score:')}</Text>
                  <Text style={styles.metricValue}>-{penaltyInfo.reliabilityImpact}%</Text>
                </View>
                <View style={styles.metricItem}>
                  <MaterialCommunityIcons name="star" size={16} color="#666" />
                  <Text style={styles.metricLabel}>{tSafe('overall_rating_label', 'Overall Rating:')}</Text>
                  <Text style={styles.metricValue}>-{penaltyInfo.ratingImpact}</Text>
                </View>
              </View>
              
              <Text style={styles.penaltyDescription}>{penaltyInfo.description}</Text>
              
              {/* Penalty decay information */}
              <View style={styles.decayInfo}>
                <MaterialCommunityIcons name="clock-outline" size={14} color="#666" />
                <Text style={styles.decayText}>
                  {tSafe('penalty_decay_message', 'This penalty will decay by 50% every 30 days with good performance')}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Rest of the policy breakdown (if needed) - you can add more content here */}
      </View>
    );
  };

  const renderConfirmationStep = () => {
    const feeInfo = userType === 'host' ? calculateCancellationFee() : null;
    const penaltyInfo = userType === 'cleaner' ? getCleanerPenalty() : null;

    return (
      <View>
        <Text style={styles.stepTitle}>{tSafe('confirm_cancellation_title', 'Confirm Assignment Cancellation')}</Text>
        
        {/* Show affected cleaner (always the current cleaner) */}
        {userType === 'cleaner' && targetCleaner && (
          <View style={styles.cleanerConfirmation}>
            <Text style={styles.confirmationText}>
              {tSafe('cancel_cleaner_assignment_confirmation', 'You are about to cancel your assignment for:')}
            </Text>
            <View style={styles.cleanerCard}>
              <MaterialCommunityIcons name="account" size={24} color={COLORS.primary} />
              <View style={styles.cleanerDetails}>
                <Text style={styles.cleanerName}>
                  {targetCleaner.firstname} {targetCleaner.lastname}
                </Text>
                <Text style={styles.cleanerAssignment}>
                  {targetCleaner.group ? tSafe('group_label', 'Group {group}', { group: targetCleaner.group.replace('group_', '') }) : tSafe('your_assignment', 'Your Assignment')}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Policy and penalties */}
        {renderPolicyDetails()}

        {/* Final confirmation */}
        <View style={styles.confirmationSection}>
          <Text style={styles.confirmationTitle}>{tSafe('final_confirmation', 'Final Confirmation')}</Text>
          <Text style={styles.confirmationText}>
            {userType === 'cleaner' 
              ? tSafe('confirm_cleaner_cancellation_text', 'Are you sure you want to cancel your assignment? This will result in a {penalty} penalty on your cleaner profile.', { penalty: penaltyInfo?.penalty?.toLowerCase() || tSafe('no', 'no') })
              : tSafe('confirm_host_cancellation_text', 'Are you sure you want to cancel this booking? This action will result in a ${fee} cancellation fee.', { fee: feeInfo?.fee.toFixed(2) })
            }
          </Text>
          
          {userType === 'cleaner' && penaltyInfo?.penalty !== 'None' && (
            <Text style={styles.warningText}>
              ⚠️ {tSafe('frequent_cancellation_warning', 'Frequent cancellations may affect your ability to receive future bookings.')}
            </Text>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep(1)}
          >
            <Text style={styles.backButtonText}>{tSafe('back', 'Back')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.confirmCancelButton,
              userType === 'cleaner' && styles.cleanerCancelButton
            ]}
            onPress={handleCancelBooking}
          >
            <MaterialCommunityIcons 
              name={userType === 'cleaner' ? "account-cancel" : "alert-circle"} 
              size={20} 
              color="#FFFFFF" 
            />
            <Text style={styles.confirmCancelButtonText}>
              {userType === 'cleaner' ? tSafe('cancel_assignment', 'Cancel Assignment') : tSafe('confirm_cancellation', 'Confirm Cancellation')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getCancellationTitle()}</Text>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>
              {tSafe('step_of', 'Step {step} of {total}', { step, total: 2 })}
            </Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Cancellation Description */}
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionText}>
                {getCancellationDescription()}
              </Text>
            </View>

            {/* Show affected cleaners */}
            {renderCleanerList()}

            {/* Rest of the cancellation flow */}
            {step === 1 ? renderReasonStep() : renderConfirmationStep()}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  stepIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  reasonsList: {
    marginBottom: 24,
    maxHeight: 300,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    marginBottom: 12,
  },
  reasonItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E7F3FF',
  },
  reasonContent: {
    flex: 1,
  },
  reasonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  reasonDescription: {
    fontSize: 14,
    color: '#666',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#007AFF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionSection: {
    backgroundColor: '#E7F3FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#B3D9FF',
  },
  descriptionText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    lineHeight: 20,
  },
  cleanersSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  cleanerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  cleanerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cleanerInfo: {
    flex: 1,
  },
  cleanerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cleanerStatus: {
    fontSize: 12,
    color: '#666',
  },
  policySection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  currentPolicy: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  currentPolicyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  timeRemaining: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  feeDetails: {
    marginTop: 8,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  feeLabel: {
    fontSize: 14,
    color: '#666',
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
  },
  refundValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  penaltyDetails: {
    marginTop: 8,
  },
  penaltyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  penaltyLabel: {
    fontSize: 14,
    color: '#666',
  },
  penaltyValue: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  minorPenalty: {
    backgroundColor: '#FFF3CD',
    color: '#856404',
  },
  moderatePenalty: {
    backgroundColor: '#FFEAA7',
    color: '#856404',
  },
  severePenalty: {
    backgroundColor: '#F8D7DA',
    color: '#721C24',
  },
  penaltyDescription: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  policyBreakdown: {
    marginTop: 8,
  },
  policyBreakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  policyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  policyTimeframe: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  policyDetails: {
    alignItems: 'flex-end',
    flex: 1,
  },
  policyFee: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  policyImpact: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  confirmationSection: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  confirmationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmationText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmCancelButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#DC3545',
    gap: 8,
  },
  confirmCancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Add to your CancelScheduleModal styles
impactMetrics: {
  marginVertical: 12,
  gap: 8,
},
metricItem: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  paddingVertical: 6,
},
metricLabel: {
  fontSize: 14,
  color: '#666',
  flex: 1,
},
metricValue: {
  fontSize: 14,
  fontWeight: '600',
  color: '#DC3545',
},
decayInfo: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  padding: 8,
  backgroundColor: '#F8F9FA',
  borderRadius: 6,
  marginTop: 8,
},
decayText: {
  fontSize: 12,
  color: '#666',
  flex: 1,
  fontStyle: 'italic',
},

// Add these styles to your CancelScheduleModal
cleanerConfirmation: {
  backgroundColor: '#F8F9FA',
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
},
cleanerCard: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  marginTop: 12,
  padding: 12,
  backgroundColor: '#FFFFFF',
  borderRadius: 8,
},
cleanerDetails: {
  flex: 1,
},
cleanerName: {
  fontSize: 16,
  fontWeight: '600',
  color: '#1C1C1E',
},
cleanerAssignment: {
  fontSize: 14,
  color: '#666',
  marginTop: 4,
},
cleanerCancelButton: {
  backgroundColor: '#DC3545',
},
warningText: {
  fontSize: 12,
  color: '#DC3545',
  marginTop: 8,
  fontStyle: 'italic',
  textAlign: 'center',
},
});

export default CancelScheduleModal;
