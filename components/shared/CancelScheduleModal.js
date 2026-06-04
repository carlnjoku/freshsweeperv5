// import React, { useState, useMemo } from 'react';
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
// import COLORS from '../../constants/colors';
// import { tSafe } from '../../utils/tSafe';

// const CancelScheduleModal = ({
//   visible,
//   onClose,
//   booking,
//   userType,
//   onCancelBooking,
//   cleaners = [],
//   cancellationType = 'full',
//   targetCleaner = null,
// }) => {
//   const [selectedReason, setSelectedReason] = useState('');
//   const [additionalNotes, setAdditionalNotes] = useState('');
//   const [step, setStep] = useState(1);

//   // 1. Policies – static keys, default strings with placeholders
//   const cancellationPolicies = useMemo(() => ({
//     host: {
//       titleKey: 'host_cancellation_policy_title',
//       titleDefault: 'Host Cancellation Policy',
//       policies: [
//         {
//           timeframeKey: 'policy_more_48h',
//           timeframeDefault: 'More than 48 hours before',
//           feeKey: 'policy_no_fee',
//           feeDefault: 'No cancellation fee',
//           refundKey: 'policy_100_refund',
//           refundDefault: '100% refund',
//           descriptionKey: 'policy_more_48h_desc',
//           descriptionDefault: 'Cancel anytime more than 48 hours in advance with no charges',
//           color: '#34C759',
//           icon: 'check-circle'
//         },
//         {
//           timeframeKey: 'policy_24_48h',
//           timeframeDefault: '24-48 hours before',
//           feeKey: 'policy_25_fee',
//           feeDefault: '25% cancellation fee',
//           refundKey: 'policy_75_refund',
//           refundDefault: '75% refund',
//           descriptionKey: 'policy_24_48h_desc',
//           descriptionDefault: 'Small fee to compensate cleaner for reserved time',
//           color: '#FF9500',
//           icon: 'clock-alert'
//         },
//         {
//           timeframeKey: 'policy_less_24h',
//           timeframeDefault: 'Less than 24 hours before',
//           feeKey: 'policy_50_fee',
//           feeDefault: '50% cancellation fee',
//           refundKey: 'policy_50_refund',
//           refundDefault: '50% refund',
//           descriptionKey: 'policy_less_24h_desc',
//           descriptionDefault: 'Significant fee due to last-minute cancellation',
//           color: '#FF3B30',
//           icon: 'alert-circle'
//         },
//         {
//           timeframeKey: 'policy_no_show',
//           timeframeDefault: 'No-show or same-day cancellation',
//           feeKey: 'policy_100_fee',
//           feeDefault: '100% cancellation fee',
//           refundKey: 'policy_no_refund',
//           refundDefault: 'No refund',
//           descriptionKey: 'policy_no_show_desc',
//           descriptionDefault: 'Full charge applies for no-shows or same-day cancellations',
//           color: '#8B0000',
//           icon: 'close-circle'
//         }
//       ]
//     },
//     cleaner: {
//       titleKey: 'cleaner_cancellation_policy_title',
//       titleDefault: 'Cleaner Cancellation Policy',
//       policies: [
//         {
//           timeframeKey: 'policy_more_72h',
//           timeframeDefault: 'More than 72 hours before',
//           penaltyKey: 'policy_no_penalty',
//           penaltyDefault: 'No penalty',
//           impactKey: 'policy_no_impact',
//           impactDefault: 'No impact on rating',
//           descriptionKey: 'policy_more_72h_desc',
//           descriptionDefault: 'Cancel with sufficient notice without penalties',
//           color: '#34C759',
//           icon: 'check-circle'
//         },
//         {
//           timeframeKey: 'policy_48_72h',
//           timeframeDefault: '48-72 hours before',
//           penaltyKey: 'policy_minor_impact',
//           penaltyDefault: 'Minor rating impact',
//           impactKey: 'policy_minor_impact_detail',
//           impactDefault: 'Small decrease in reliability score',
//           descriptionKey: 'policy_48_72h_desc',
//           descriptionDefault: 'Minor impact on your cleaner profile rating',
//           color: '#FF9500',
//           icon: 'clock-alert'
//         },
//         {
//           timeframeKey: 'policy_24_48h_cleaner',
//           timeframeDefault: '24-48 hours before',
//           penaltyKey: 'policy_moderate_impact',
//           penaltyDefault: 'Moderate rating impact + warning',
//           impactKey: 'policy_moderate_impact_detail',
//           impactDefault: 'Noticeable decrease in reliability score',
//           descriptionKey: 'policy_24_48h_cleaner_desc',
//           descriptionDefault: 'Affects booking priority and may trigger review',
//           color: '#FFCC00',
//           icon: 'alert'
//         },
//         {
//           timeframeKey: 'policy_less_24h_cleaner',
//           timeframeDefault: 'Less than 24 hours before',
//           penaltyKey: 'policy_severe_impact',
//           penaltyDefault: 'Significant rating impact + temporary suspension risk',
//           impactKey: 'policy_severe_impact_detail',
//           impactDefault: 'Major decrease in reliability score',
//           descriptionKey: 'policy_less_24h_cleaner_desc',
//           descriptionDefault: 'May result in temporary account suspension for repeated offenses',
//           color: '#FF3B30',
//           icon: 'close-circle'
//         }
//       ]
//     }
//   }), []);

//   // 2. Cancellation reasons – static keys
//   const cancellationReasons = useMemo(() => ({
//     host: [
//       {
//         id: 'schedule_conflict',
//         labelKey: 'reason_schedule_conflict',
//         labelDefault: 'Schedule conflict',
//         descriptionKey: 'reason_schedule_conflict_desc',
//         descriptionDefault: 'I have a conflict with the scheduled time',
//       },
//       {
//         id: 'no_longer_needed',
//         labelKey: 'reason_no_longer_needed',
//         labelDefault: 'Service no longer needed',
//         descriptionKey: 'reason_no_longer_needed_desc',
//         descriptionDefault: 'I don\'t need the cleaning service anymore',
//       },
//       {
//         id: 'found_alternative',
//         labelKey: 'reason_found_alternative',
//         labelDefault: 'Found alternative',
//         descriptionKey: 'reason_found_alternative_desc',
//         descriptionDefault: 'I found another cleaning service',
//       },
//       {
//         id: 'cleaner_issues',
//         labelKey: 'reason_cleaner_issues',
//         labelDefault: 'Issues with cleaner',
//         descriptionKey: 'reason_cleaner_issues_desc',
//         descriptionDefault: 'I want to work with a different cleaner',
//       },
//       {
//         id: 'other',
//         labelKey: 'reason_other',
//         labelDefault: 'Other reason',
//         descriptionKey: 'reason_other_desc',
//         descriptionDefault: 'Another reason not listed',
//       },
//     ],
//     cleaner: [
//       {
//         id: 'emergency',
//         labelKey: 'reason_emergency',
//         labelDefault: 'Emergency',
//         descriptionKey: 'reason_emergency_desc',
//         descriptionDefault: 'I have a personal emergency',
//       },
//       {
//         id: 'sickness',
//         labelKey: 'reason_sickness',
//         labelDefault: 'Sickness',
//         descriptionKey: 'reason_sickness_desc',
//         descriptionDefault: 'I\'m not feeling well',
//       },
//       {
//         id: 'transportation',
//         labelKey: 'reason_transportation',
//         labelDefault: 'Transportation issue',
//         descriptionKey: 'reason_transportation_desc',
//         descriptionDefault: 'I have transportation problems',
//       },
//       {
//         id: 'schedule_conflict',
//         labelKey: 'reason_schedule_conflict',
//         labelDefault: 'Schedule conflict',
//         descriptionKey: 'reason_schedule_conflict_desc',
//         descriptionDefault: 'I have another booking at this time',
//       },
//       {
//         id: 'other',
//         labelKey: 'reason_other',
//         labelDefault: 'Other reason',
//         descriptionKey: 'reason_other_desc',
//         descriptionDefault: 'Another reason not listed',
//       },
//     ],
//   }), []);

//   const safeCleaners = Array.isArray(cleaners) ? cleaners : [];

//   const calculateTimeUntilBooking = () => {
//     if (!booking?.date) return Infinity;
//     const bookingTime = new Date(booking.date);
//     const now = new Date();
//     return (bookingTime - now) / (1000 * 60 * 60);
//   };

//   const calculateCancellationFee = () => {
//     const hoursUntilBooking = calculateTimeUntilBooking();
//     const totalAmount = booking?.amount || 0;
//     if (hoursUntilBooking > 48) {
//       return { fee: 0, percentage: 0, refund: totalAmount };
//     } else if (hoursUntilBooking > 24) {
//       const fee = totalAmount * 0.25;
//       return { fee, percentage: 25, refund: totalAmount - fee };
//     } else if (hoursUntilBooking > 0) {
//       const fee = totalAmount * 0.5;
//       return { fee, percentage: 50, refund: totalAmount - fee };
//     } else {
//       return { fee: totalAmount, percentage: 100, refund: 0 };
//     }
//   };

//   const getCleanerPenalty = () => {
//     const hoursUntilBooking = calculateTimeUntilBooking();
//     if (hoursUntilBooking > 72) {
//       return {
//         penaltyKey: 'penalty_none',
//         penaltyDefault: 'None',
//         impactKey: 'penalty_impact_low',
//         impactDefault: 'Low',
//         descriptionKey: 'penalty_desc_none',
//         descriptionDefault: 'No impact on your rating',
//         reliabilityImpact: 0,
//         ratingImpact: 0
//       };
//     } else if (hoursUntilBooking > 48) {
//       return {
//         penaltyKey: 'penalty_minor',
//         penaltyDefault: 'Minor',
//         impactKey: 'penalty_impact_medium',
//         impactDefault: 'Medium',
//         descriptionKey: 'penalty_desc_minor',
//         descriptionDefault: 'Small decrease in reliability score',
//         reliabilityImpact: 8,
//         ratingImpact: 0.2
//       };
//     } else if (hoursUntilBooking > 24) {
//       return {
//         penaltyKey: 'penalty_moderate',
//         penaltyDefault: 'Moderate',
//         impactKey: 'penalty_impact_high',
//         impactDefault: 'High',
//         descriptionKey: 'penalty_desc_moderate',
//         descriptionDefault: 'Noticeable impact on booking priority',
//         reliabilityImpact: 15,
//         ratingImpact: 0.4
//       };
//     } else {
//       return {
//         penaltyKey: 'penalty_severe',
//         penaltyDefault: 'Severe',
//         impactKey: 'penalty_impact_very_high',
//         impactDefault: 'Very High',
//         descriptionKey: 'penalty_desc_severe',
//         descriptionDefault: 'Risk of temporary suspension',
//         reliabilityImpact: 25,
//         ratingImpact: 0.8
//       };
//     }
//   };

//   // 3. Helper functions using tSafe with interpolation objects
//   const getCancellationTitle = () => {
//     if (cancellationType === 'partial' && targetCleaner) {
//       return tSafe('cancel_cleaner_assignment_title', "Cancel {name}'s Assignment", { name: targetCleaner.firstname });
//     }
//     return tSafe('cancel_booking_title', 'Cancel Booking');
//   };

//   const getCancellationDescription = () => {
//     if (cancellationType === 'partial' && targetCleaner) {
//       return tSafe('cancel_partial_description_1', "You are cancelling only {name}'s assignment. Other cleaners will remain scheduled.", { name: targetCleaner.firstname });
//     }
//     if (safeCleaners.length > 1) {
//       return tSafe('cancel_full_description_plural', 'This will cancel the entire booking for all {count} cleaners.', { count: safeCleaners.length });
//     }
//     return tSafe('cancel_full_description', 'This will cancel the entire booking.');
//   };

//   const calculateAffectedCleaners = () => {
//     if (cancellationType === 'partial' && targetCleaner) return [targetCleaner];
//     return safeCleaners;
//   };

//   const handleCancelBooking = () => {
//     const affectedCleaners = calculateAffectedCleaners();
//     const feeInfo = userType === 'host' ? calculateCancellationFee() : null;
//     const penaltyInfo = userType === 'cleaner' ? getCleanerPenalty() : null;

//     const cancellationData = {
//       bookingId: booking?.id,
//       cancelledBy: userType,
//       reason: selectedReason,
//       additionalNotes,
//       timestamp: new Date().toISOString(),
//       cancellationType,
//       affectedCleaners: affectedCleaners.map(c => c?.cleanerId).filter(Boolean),
//       targetCleanerId: cancellationType === 'partial' ? targetCleaner?.cleanerId : null,
//       cancellationFee: feeInfo?.fee || 0,
//       refundAmount: feeInfo?.refund || 0,
//       penaltyLevel: tSafe(penaltyInfo?.penaltyKey, penaltyInfo?.penaltyDefault || 'None')
//     };

//     onCancelBooking(cancellationData);
//     onClose();
//     setSelectedReason('');
//     setAdditionalNotes('');
//     setStep(1);
//   };

//   // 4. Render helpers – all tSafe calls use keys + defaults, placeholders passed as object
//   const renderReasonStep = () => (
//     <View>
//       <Text style={styles.stepTitle}>{tSafe('cancel_reason_title', 'Why are you cancelling?')}</Text>
//       <Text style={styles.stepDescription}>
//         {userType === 'host'
//           ? tSafe('cancel_reason_host_desc', 'Please let us know why you need to cancel this booking.')
//           : tSafe('cancel_reason_cleaner_desc', 'Please select your reason for cancellation.')}
//       </Text>

//       <ScrollView style={styles.reasonsList}>
//         {cancellationReasons[userType]?.map((reason) => (
//           <TouchableOpacity
//             key={reason.id}
//             style={[styles.reasonItem, selectedReason === reason.id && styles.reasonItemSelected]}
//             onPress={() => setSelectedReason(reason.id)}
//           >
//             <View style={styles.reasonContent}>
//               <Text style={styles.reasonLabel}>{tSafe(reason.labelKey, reason.labelDefault)}</Text>
//               <Text style={styles.reasonDescription}>{tSafe(reason.descriptionKey, reason.descriptionDefault)}</Text>
//             </View>
//             <View style={[styles.radio, selectedReason === reason.id && styles.radioSelected]}>
//               {selectedReason === reason.id && <View style={styles.radioInner} />}
//             </View>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>

//       <TouchableOpacity
//         style={[styles.continueButton, !selectedReason && styles.continueButtonDisabled]}
//         disabled={!selectedReason}
//         onPress={() => setStep(2)}
//       >
//         <Text style={styles.continueButtonText}>{tSafe('continue', 'Continue')}</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   const renderCleanerList = () => {
//     const affectedCleaners = calculateAffectedCleaners();
//     if (!affectedCleaners.length) return null;

//     return (
//       <View style={styles.cleanersSection}>
//         <Text style={styles.sectionTitle}>
//           {cancellationType === 'partial'
//             ? tSafe('cleaner_being_removed', 'Cleaner Being Removed')
//             : tSafe('all_affected_cleaners', 'All Affected Cleaners')}
//         </Text>
//         {affectedCleaners.map((cleaner, index) => (
//           <View key={cleaner?.cleanerId || index} style={styles.cleanerItem}>
//             <View style={styles.cleanerAvatar}>
//               <MaterialCommunityIcons name="account" size={20} color="#666" />
//             </View>
//             <View style={styles.cleanerInfo}>
//               <Text style={styles.cleanerName}>
//                 {cleaner?.firstname ? `${cleaner.firstname} ${cleaner.lastname}` : tSafe('unknown_cleaner', 'Unknown Cleaner')}
//               </Text>
//               <Text style={styles.cleanerStatus}>
//                 {tSafe('status_label', 'Status')}: {cleaner?.status || tSafe('assigned', 'assigned')}
//               </Text>
//             </View>
//             {cancellationType === 'partial' && <MaterialCommunityIcons name="close-circle" size={20} color="#DC3545" />}
//           </View>
//         ))}
//       </View>
//     );
//   };

//   const renderPolicyDetails = () => {
//     const hoursUntilBooking = calculateTimeUntilBooking();
//     const penaltyInfo = userType === 'cleaner' ? getCleanerPenalty() : null;

//     return (
//       <View style={styles.policySection}>
//         <Text style={styles.sectionTitle}>
//           {userType === 'host'
//             ? tSafe('cancellation_fees', 'Cancellation Fees')
//             : tSafe('cancellation_impact', 'Cancellation Impact on Your Profile')}
//         </Text>

//         <View style={styles.currentPolicy}>
//           <Text style={styles.currentPolicyTitle}>{tSafe('for_this_cancellation', 'For This Cancellation:')}</Text>
//           <Text style={styles.timeRemaining}>
//             {tSafe('time_until_booking', 'Time until booking: {time}', {
//               time: hoursUntilBooking > 0
//                 ? `${Math.floor(hoursUntilBooking)} ${tSafe('hours', 'hours')}`
//                 : tSafe('less_than_1_hour', 'Less than 1 hour')
//             })}
//           </Text>

//           {userType === 'cleaner' && penaltyInfo && (
//             <View style={styles.penaltyDetails}>
//               <View style={styles.penaltyRow}>
//                 <Text style={styles.penaltyLabel}>{tSafe('penalty_level_label', 'Penalty Level:')}</Text>
//                 <Text style={[
//                   styles.penaltyValue,
//                   penaltyInfo.penaltyKey === 'penalty_severe' ? styles.severePenalty :
//                   penaltyInfo.penaltyKey === 'penalty_moderate' ? styles.moderatePenalty :
//                   styles.minorPenalty
//                 ]}>
//                   {tSafe(penaltyInfo.penaltyKey, penaltyInfo.penaltyDefault)}
//                 </Text>
//               </View>

//               <View style={styles.impactMetrics}>
//                 <View style={styles.metricItem}>
//                   <MaterialCommunityIcons name="shield-account" size={16} color="#666" />
//                   <Text style={styles.metricLabel}>{tSafe('reliability_score_label', 'Reliability Score:')}</Text>
//                   <Text style={styles.metricValue}>-{penaltyInfo.reliabilityImpact}%</Text>
//                 </View>
//                 <View style={styles.metricItem}>
//                   <MaterialCommunityIcons name="star" size={16} color="#666" />
//                   <Text style={styles.metricLabel}>{tSafe('overall_rating_label', 'Overall Rating:')}</Text>
//                   <Text style={styles.metricValue}>-{penaltyInfo.ratingImpact}</Text>
//                 </View>
//               </View>

//               <Text style={styles.penaltyDescription}>{tSafe(penaltyInfo.descriptionKey, penaltyInfo.descriptionDefault)}</Text>

//               <View style={styles.decayInfo}>
//                 <MaterialCommunityIcons name="clock-outline" size={14} color="#666" />
//                 <Text style={styles.decayText}>
//                   {tSafe('penalty_decay_message', 'This penalty will decay by 50% every 30 days with good performance')}
//                 </Text>
//               </View>
//             </View>
//           )}
//         </View>
//       </View>
//     );
//   };

//   const renderConfirmationStep = () => {
//     const feeInfo = userType === 'host' ? calculateCancellationFee() : null;
//     const penaltyInfo = userType === 'cleaner' ? getCleanerPenalty() : null;

//     return (
//       <View>
//         <Text style={styles.stepTitle}>{tSafe('confirm_cancellation_title', 'Confirm Assignment Cancellation')}</Text>

//         {userType === 'cleaner' && targetCleaner && (
//           <View style={styles.cleanerConfirmation}>
//             <Text style={styles.confirmationText}>
//               {tSafe('cancel_cleaner_assignment_confirmation', 'You are about to cancel your assignment for:')}
//             </Text>
//             <View style={styles.cleanerCard}>
//               <MaterialCommunityIcons name="account" size={24} color={COLORS.primary} />
//               <View style={styles.cleanerDetails}>
//                 <Text style={styles.cleanerName}>{targetCleaner.firstname} {targetCleaner.lastname}</Text>
//                 <Text style={styles.cleanerAssignment}>
//                   {targetCleaner.group
//                     ? tSafe('group_label', 'Group {group}', { group: targetCleaner.group.replace('group_', '') })
//                     : tSafe('your_assignment', 'Your Assignment')}
//                 </Text>
//               </View>
//             </View>
//           </View>
//         )}

//         {renderPolicyDetails()}

//         <View style={styles.confirmationSection}>
//           <Text style={styles.confirmationTitle}>{tSafe('final_confirmation', 'Final Confirmation')}</Text>
//           <Text style={styles.confirmationText}>
//             {userType === 'cleaner'
//               ? tSafe('confirm_cleaner_cancellation_text', 'Are you sure you want to cancel your assignment? This will result in a {penalty} penalty on your cleaner profile.', {
//                   penalty: tSafe(penaltyInfo?.penaltyKey || 'penalty_none', penaltyInfo?.penaltyDefault || 'none').toLowerCase()
//                 })
//               : tSafe('confirm_host_cancellation_text', 'Are you sure you want to cancel this booking? This action will result in a ${fee} cancellation fee.', {
//                   fee: feeInfo?.fee.toFixed(2)
//                 })
//             }
//           </Text>

//           {userType === 'cleaner' && penaltyInfo?.penaltyKey !== 'penalty_none' && (
//             <Text style={styles.warningText}>
//               ⚠️ {tSafe('frequent_cancellation_warning', 'Frequent cancellations may affect your ability to receive future bookings.')}
//             </Text>
//           )}
//         </View>

//         <View style={styles.actionButtons}>
//           <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
//             <Text style={styles.backButtonText}>{tSafe('back', 'Back')}</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.confirmCancelButton, userType === 'cleaner' && styles.cleanerCancelButton]}
//             onPress={handleCancelBooking}
//           >
//             <MaterialCommunityIcons name={userType === 'cleaner' ? "account-cancel" : "alert-circle"} size={20} color="#FFFFFF" />
//             <Text style={styles.confirmCancelButtonText}>
//               {userType === 'cleaner' ? tSafe('cancel_assignment', 'Cancel Assignment') : tSafe('confirm_cancellation', 'Confirm Cancellation')}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
//       <View style={styles.container}>
//         <View style={styles.header}>
//           <TouchableOpacity onPress={onClose} style={styles.closeButton}>
//             <MaterialCommunityIcons name="close" size={24} color="#666" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>{getCancellationTitle()}</Text>
//           <View style={styles.stepIndicator}>
//             <Text style={styles.stepText}>
//               {tSafe('step_of', 'Step {step} of {total}', { step, total: 2 })}
//             </Text>
//           </View>
//         </View>

//         <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//           <View style={styles.content}>
//             <View style={styles.descriptionSection}>
//               <Text style={styles.descriptionText}>{getCancellationDescription()}</Text>
//             </View>
//             {renderCleanerList()}
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
//   scrollView: {
//     flex: 1,
//   },
//   content: {
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
//     maxHeight: 300,
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
//   cleanersSection: {
//     backgroundColor: '#F8F9FA',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1A1A1A',
//     marginBottom: 12,
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
//   policySection: {
//     backgroundColor: '#F8F9FA',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//   },
//   currentPolicy: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#E9ECEF',
//   },
//   currentPolicyTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1A1A1A',
//     marginBottom: 8,
//   },
//   timeRemaining: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 12,
//     fontStyle: 'italic',
//   },
//   feeDetails: {
//     marginTop: 8,
//   },
//   feeRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   feeLabel: {
//     fontSize: 14,
//     color: '#666',
//   },
//   feeValue: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#FF3B30',
//   },
//   refundValue: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#34C759',
//   },
//   penaltyDetails: {
//     marginTop: 8,
//   },
//   penaltyRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   penaltyLabel: {
//     fontSize: 14,
//     color: '#666',
//   },
//   penaltyValue: {
//     fontSize: 14,
//     fontWeight: '600',
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 4,
//   },
//   minorPenalty: {
//     backgroundColor: '#FFF3CD',
//     color: '#856404',
//   },
//   moderatePenalty: {
//     backgroundColor: '#FFEAA7',
//     color: '#856404',
//   },
//   severePenalty: {
//     backgroundColor: '#F8D7DA',
//     color: '#721C24',
//   },
//   penaltyDescription: {
//     fontSize: 12,
//     color: '#666',
//     fontStyle: 'italic',
//     marginTop: 4,
//   },
//   policyBreakdown: {
//     marginTop: 8,
//   },
//   policyBreakdownTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1A1A1A',
//     marginBottom: 12,
//   },
//   policyItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E9ECEF',
//   },
//   policyHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   policyTimeframe: {
//     fontSize: 12,
//     color: '#666',
//     marginLeft: 8,
//     flex: 1,
//   },
//   policyDetails: {
//     alignItems: 'flex-end',
//     flex: 1,
//   },
//   policyFee: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#1A1A1A',
//   },
//   policyImpact: {
//     fontSize: 10,
//     color: '#666',
//     marginTop: 2,
//   },
//   confirmationSection: {
//     backgroundColor: '#FFF3CD',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 24,
//     borderWidth: 1,
//     borderColor: '#FFEAA7',
//   },
//   confirmationTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#856404',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   confirmationText: {
//     fontSize: 14,
//     color: '#856404',
//     textAlign: 'center',
//     lineHeight: 20,
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

//   // Add to your CancelScheduleModal styles
// impactMetrics: {
//   marginVertical: 12,
//   gap: 8,
// },
// metricItem: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   gap: 8,
//   paddingVertical: 6,
// },
// metricLabel: {
//   fontSize: 14,
//   color: '#666',
//   flex: 1,
// },
// metricValue: {
//   fontSize: 14,
//   fontWeight: '600',
//   color: '#DC3545',
// },
// decayInfo: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   gap: 6,
//   padding: 8,
//   backgroundColor: '#F8F9FA',
//   borderRadius: 6,
//   marginTop: 8,
// },
// decayText: {
//   fontSize: 12,
//   color: '#666',
//   flex: 1,
//   fontStyle: 'italic',
// },

// // Add these styles to your CancelScheduleModal
// cleanerConfirmation: {
//   backgroundColor: '#F8F9FA',
//   borderRadius: 12,
//   padding: 16,
//   marginBottom: 16,
// },
// cleanerCard: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   gap: 12,
//   marginTop: 12,
//   padding: 12,
//   backgroundColor: '#FFFFFF',
//   borderRadius: 8,
// },
// cleanerDetails: {
//   flex: 1,
// },
// cleanerName: {
//   fontSize: 16,
//   fontWeight: '600',
//   color: '#1C1C1E',
// },
// cleanerAssignment: {
//   fontSize: 14,
//   color: '#666',
//   marginTop: 4,
// },
// cleanerCancelButton: {
//   backgroundColor: '#DC3545',
// },
// warningText: {
//   fontSize: 12,
//   color: '#DC3545',
//   marginTop: 8,
//   fontStyle: 'italic',
//   textAlign: 'center',
// },
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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import { tSafe } from '../../utils/tSafe';

const CancelScheduleModal = ({
  visible,
  onClose,
  booking,
  userType,
  onCancelBooking,
  cleaners = [],
  cancellationType = 'full',
  targetCleaner = null,
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [step, setStep] = useState(1);

  // Helper: map group ID (e.g., "group_a") to a translated display name
  const getGroupDisplayName = (groupId) => {
    if (!groupId) return null;
    const mapping = {
      group_a: tSafe('group_a_name', 'Alpha'),
      group_b: tSafe('group_b_name', 'Beta'),
      group_c: tSafe('group_c_name', 'Gamma'),
    };
    return mapping[groupId] || groupId.replace('group_', '');
  };

  // Helper: map cleaner status to user‑friendly, translatable string
  const getCleanerStatusLabel = (status) => {
    if (!status) return tSafe('status_assigned', 'Assigned');
    const mapping = {
      payment_confirmed: { key: 'status_payment_confirmed', default: 'Payment Confirmed' },
      pending_payment: { key: 'status_pending_payment', default: 'Pending Payment' },
      cancelled: { key: 'status_cancelled', default: 'Schedule Cancelled' },
      assigned: { key: 'status_assigned', default: 'Assigned' },
      clocked_in: { key: 'status_clocked_in', default: 'Clocked In' },
      in_progress: { key: 'status_in_progress', default: 'In Progress' },
      pending_review: { key: 'status_pending_review', default: 'Pending Review' },
      approved: { key: 'status_approved', default: 'Approved' },
      disapproved: { key: 'status_disapproved', default: 'Disapproved' },
    };
    const item = mapping[status];
    if (item) {
      return tSafe(item.key, item.default);
    }
    // fallback – capitalize first letter
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // 1. Policies – static keys, default strings with placeholders
  const cancellationPolicies = useMemo(() => ({
    host: {
      titleKey: 'host_cancellation_policy_title',
      titleDefault: 'Host Cancellation Policy',
      policies: [
        {
          timeframeKey: 'policy_more_48h',
          timeframeDefault: 'More than 48 hours before',
          feeKey: 'policy_no_fee',
          feeDefault: 'No cancellation fee',
          refundKey: 'policy_100_refund',
          refundDefault: '100% refund',
          descriptionKey: 'policy_more_48h_desc',
          descriptionDefault: 'Cancel anytime more than 48 hours in advance with no charges',
          color: '#34C759',
          icon: 'check-circle'
        },
        {
          timeframeKey: 'policy_24_48h',
          timeframeDefault: '24-48 hours before',
          feeKey: 'policy_25_fee',
          feeDefault: '25% cancellation fee',
          refundKey: 'policy_75_refund',
          refundDefault: '75% refund',
          descriptionKey: 'policy_24_48h_desc',
          descriptionDefault: 'Small fee to compensate cleaner for reserved time',
          color: '#FF9500',
          icon: 'clock-alert'
        },
        {
          timeframeKey: 'policy_less_24h',
          timeframeDefault: 'Less than 24 hours before',
          feeKey: 'policy_50_fee',
          feeDefault: '50% cancellation fee',
          refundKey: 'policy_50_refund',
          refundDefault: '50% refund',
          descriptionKey: 'policy_less_24h_desc',
          descriptionDefault: 'Significant fee due to last-minute cancellation',
          color: '#FF3B30',
          icon: 'alert-circle'
        },
        {
          timeframeKey: 'policy_no_show',
          timeframeDefault: 'No-show or same-day cancellation',
          feeKey: 'policy_100_fee',
          feeDefault: '100% cancellation fee',
          refundKey: 'policy_no_refund',
          refundDefault: 'No refund',
          descriptionKey: 'policy_no_show_desc',
          descriptionDefault: 'Full charge applies for no-shows or same-day cancellations',
          color: '#8B0000',
          icon: 'close-circle'
        }
      ]
    },
    cleaner: {
      titleKey: 'cleaner_cancellation_policy_title',
      titleDefault: 'Cleaner Cancellation Policy',
      policies: [
        {
          timeframeKey: 'policy_more_72h',
          timeframeDefault: 'More than 72 hours before',
          penaltyKey: 'policy_no_penalty',
          penaltyDefault: 'No penalty',
          impactKey: 'policy_no_impact',
          impactDefault: 'No impact on rating',
          descriptionKey: 'policy_more_72h_desc',
          descriptionDefault: 'Cancel with sufficient notice without penalties',
          color: '#34C759',
          icon: 'check-circle'
        },
        {
          timeframeKey: 'policy_48_72h',
          timeframeDefault: '48-72 hours before',
          penaltyKey: 'policy_minor_impact',
          penaltyDefault: 'Minor rating impact',
          impactKey: 'policy_minor_impact_detail',
          impactDefault: 'Small decrease in reliability score',
          descriptionKey: 'policy_48_72h_desc',
          descriptionDefault: 'Minor impact on your cleaner profile rating',
          color: '#FF9500',
          icon: 'clock-alert'
        },
        {
          timeframeKey: 'policy_24_48h_cleaner',
          timeframeDefault: '24-48 hours before',
          penaltyKey: 'policy_moderate_impact',
          penaltyDefault: 'Moderate rating impact + warning',
          impactKey: 'policy_moderate_impact_detail',
          impactDefault: 'Noticeable decrease in reliability score',
          descriptionKey: 'policy_24_48h_cleaner_desc',
          descriptionDefault: 'Affects booking priority and may trigger review',
          color: '#FFCC00',
          icon: 'alert'
        },
        {
          timeframeKey: 'policy_less_24h_cleaner',
          timeframeDefault: 'Less than 24 hours before',
          penaltyKey: 'policy_severe_impact',
          penaltyDefault: 'Significant rating impact + temporary suspension risk',
          impactKey: 'policy_severe_impact_detail',
          impactDefault: 'Major decrease in reliability score',
          descriptionKey: 'policy_less_24h_cleaner_desc',
          descriptionDefault: 'May result in temporary account suspension for repeated offenses',
          color: '#FF3B30',
          icon: 'close-circle'
        }
      ]
    }
  }), []);

  // 2. Cancellation reasons – static keys
  const cancellationReasons = useMemo(() => ({
    host: [
      {
        id: 'schedule_conflict',
        labelKey: 'reason_schedule_conflict',
        labelDefault: 'Schedule conflict',
        descriptionKey: 'reason_schedule_conflict_desc',
        descriptionDefault: 'I have a conflict with the scheduled time',
      },
      {
        id: 'no_longer_needed',
        labelKey: 'reason_no_longer_needed',
        labelDefault: 'Service no longer needed',
        descriptionKey: 'reason_no_longer_needed_desc',
        descriptionDefault: 'I don\'t need the cleaning service anymore',
      },
      {
        id: 'found_alternative',
        labelKey: 'reason_found_alternative',
        labelDefault: 'Found alternative',
        descriptionKey: 'reason_found_alternative_desc',
        descriptionDefault: 'I found another cleaning service',
      },
      {
        id: 'cleaner_issues',
        labelKey: 'reason_cleaner_issues',
        labelDefault: 'Issues with cleaner',
        descriptionKey: 'reason_cleaner_issues_desc',
        descriptionDefault: 'I want to work with a different cleaner',
      },
      {
        id: 'other',
        labelKey: 'reason_other',
        labelDefault: 'Other reason',
        descriptionKey: 'reason_other_desc',
        descriptionDefault: 'Another reason not listed',
      },
    ],
    cleaner: [
      {
        id: 'emergency',
        labelKey: 'reason_emergency',
        labelDefault: 'Emergency',
        descriptionKey: 'reason_emergency_desc',
        descriptionDefault: 'I have a personal emergency',
      },
      {
        id: 'sickness',
        labelKey: 'reason_sickness',
        labelDefault: 'Sickness',
        descriptionKey: 'reason_sickness_desc',
        descriptionDefault: 'I\'m not feeling well',
      },
      {
        id: 'transportation',
        labelKey: 'reason_transportation',
        labelDefault: 'Transportation issue',
        descriptionKey: 'reason_transportation_desc',
        descriptionDefault: 'I have transportation problems',
      },
      {
        id: 'schedule_conflict',
        labelKey: 'reason_schedule_conflict',
        labelDefault: 'Schedule conflict',
        descriptionKey: 'reason_schedule_conflict_desc',
        descriptionDefault: 'I have another booking at this time',
      },
      {
        id: 'other',
        labelKey: 'reason_other',
        labelDefault: 'Other reason',
        descriptionKey: 'reason_other_desc',
        descriptionDefault: 'Another reason not listed',
      },
    ],
  }), []);

  const safeCleaners = Array.isArray(cleaners) ? cleaners : [];

  const calculateTimeUntilBooking = () => {
    if (!booking?.date) return Infinity;
    const bookingTime = new Date(booking.date);
    const now = new Date();
    return (bookingTime - now) / (1000 * 60 * 60);
  };

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
      return { fee: totalAmount, percentage: 100, refund: 0 };
    }
  };

  const getCleanerPenalty = () => {
    const hoursUntilBooking = calculateTimeUntilBooking();
    if (hoursUntilBooking > 72) {
      return {
        penaltyKey: 'penalty_none',
        penaltyDefault: 'None',
        impactKey: 'penalty_impact_low',
        impactDefault: 'Low',
        descriptionKey: 'penalty_desc_none',
        descriptionDefault: 'No impact on your rating',
        reliabilityImpact: 0,
        ratingImpact: 0
      };
    } else if (hoursUntilBooking > 48) {
      return {
        penaltyKey: 'penalty_minor',
        penaltyDefault: 'Minor',
        impactKey: 'penalty_impact_medium',
        impactDefault: 'Medium',
        descriptionKey: 'penalty_desc_minor',
        descriptionDefault: 'Small decrease in reliability score',
        reliabilityImpact: 8,
        ratingImpact: 0.2
      };
    } else if (hoursUntilBooking > 24) {
      return {
        penaltyKey: 'penalty_moderate',
        penaltyDefault: 'Moderate',
        impactKey: 'penalty_impact_high',
        impactDefault: 'High',
        descriptionKey: 'penalty_desc_moderate',
        descriptionDefault: 'Noticeable impact on booking priority',
        reliabilityImpact: 15,
        ratingImpact: 0.4
      };
    } else {
      return {
        penaltyKey: 'penalty_severe',
        penaltyDefault: 'Severe',
        impactKey: 'penalty_impact_very_high',
        impactDefault: 'Very High',
        descriptionKey: 'penalty_desc_severe',
        descriptionDefault: 'Risk of temporary suspension',
        reliabilityImpact: 25,
        ratingImpact: 0.8
      };
    }
  };

  // 3. Helper functions using tSafe with interpolation objects
  const getCancellationTitle = () => {
    if (cancellationType === 'partial' && targetCleaner) {
      return tSafe('cancel_cleaner_assignment_title', "Cancel {name}'s Assignment", { name: targetCleaner.firstname });
    }
    return tSafe('cancel_booking_title', 'Cancel Booking');
  };

  const getCancellationDescription = () => {
    if (cancellationType === 'partial' && targetCleaner) {
      return tSafe('cancel_partial_description_1', "You are cancelling only {name}'s assignment. Other cleaners will remain scheduled.", { name: targetCleaner.firstname });
    }
    if (safeCleaners.length > 1) {
      return tSafe('cancel_full_description_plural', 'This will cancel the entire booking for all {count} cleaners.', { count: safeCleaners.length });
    }
    return tSafe('cancel_full_description', 'This will cancel the entire booking.');
  };

  const calculateAffectedCleaners = () => {
    if (cancellationType === 'partial' && targetCleaner) return [targetCleaner];
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
      affectedCleaners: affectedCleaners.map(c => c?.cleanerId).filter(Boolean),
      targetCleanerId: cancellationType === 'partial' ? targetCleaner?.cleanerId : null,
      cancellationFee: feeInfo?.fee || 0,
      refundAmount: feeInfo?.refund || 0,
      penaltyLevel: tSafe(penaltyInfo?.penaltyKey, penaltyInfo?.penaltyDefault || 'None')
    };

    onCancelBooking(cancellationData);
    onClose();
    setSelectedReason('');
    setAdditionalNotes('');
    setStep(1);
  };

  // 4. Render helpers – all tSafe calls use keys + defaults, placeholders passed as object
  const renderReasonStep = () => (
    <View>
      <Text style={styles.stepTitle}>{tSafe('cancel_reason_title', 'Why are you cancelling?')}</Text>
      <Text style={styles.stepDescription}>
        {userType === 'host'
          ? tSafe('cancel_reason_host_desc', 'Please let us know why you need to cancel this booking.')
          : tSafe('cancel_reason_cleaner_desc', 'Please select your reason for cancellation.')}
      </Text>

      <ScrollView style={styles.reasonsList}>
        {cancellationReasons[userType]?.map((reason) => (
          <TouchableOpacity
            key={reason.id}
            style={[styles.reasonItem, selectedReason === reason.id && styles.reasonItemSelected]}
            onPress={() => setSelectedReason(reason.id)}
          >
            <View style={styles.reasonContent}>
              <Text style={styles.reasonLabel}>{tSafe(reason.labelKey, reason.labelDefault)}</Text>
              <Text style={styles.reasonDescription}>{tSafe(reason.descriptionKey, reason.descriptionDefault)}</Text>
            </View>
            <View style={[styles.radio, selectedReason === reason.id && styles.radioSelected]}>
              {selectedReason === reason.id && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.continueButton, !selectedReason && styles.continueButtonDisabled]}
        disabled={!selectedReason}
        onPress={() => setStep(2)}
      >
        <Text style={styles.continueButtonText}>{tSafe('continue', 'Continue')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCleanerList = () => {
    const affectedCleaners = calculateAffectedCleaners();
    if (!affectedCleaners.length) return null;

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
                {tSafe('status_label', 'Status')}: {getCleanerStatusLabel(cleaner?.status)}
              </Text>
            </View>
            {cancellationType === 'partial' && <MaterialCommunityIcons name="close-circle" size={20} color="#DC3545" />}
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
          {userType === 'host'
            ? tSafe('cancellation_fees', 'Cancellation Fees')
            : tSafe('cancellation_impact', 'Cancellation Impact on Your Profile')}
        </Text>

        <View style={styles.currentPolicy}>
          <Text style={styles.currentPolicyTitle}>{tSafe('for_this_cancellation', 'For This Cancellation:')}</Text>
          <Text style={styles.timeRemaining}>
            {tSafe('time_until_booking', 'Time until booking: {time}', {
              time: hoursUntilBooking > 0
                ? `${Math.floor(hoursUntilBooking)} ${tSafe('hours', 'hours')}`
                : tSafe('less_than_1_hour', 'Less than 1 hour')
            })}
          </Text>

          {userType === 'cleaner' && penaltyInfo && (
            <View style={styles.penaltyDetails}>
              <View style={styles.penaltyRow}>
                <Text style={styles.penaltyLabel}>{tSafe('penalty_level_label', 'Penalty Level:')}</Text>
                <Text style={[
                  styles.penaltyValue,
                  penaltyInfo.penaltyKey === 'penalty_severe' ? styles.severePenalty :
                  penaltyInfo.penaltyKey === 'penalty_moderate' ? styles.moderatePenalty :
                  styles.minorPenalty
                ]}>
                  {tSafe(penaltyInfo.penaltyKey, penaltyInfo.penaltyDefault)}
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

              <Text style={styles.penaltyDescription}>{tSafe(penaltyInfo.descriptionKey, penaltyInfo.descriptionDefault)}</Text>

              <View style={styles.decayInfo}>
                <MaterialCommunityIcons name="clock-outline" size={14} color="#666" />
                <Text style={styles.decayText}>
                  {tSafe('penalty_decay_message', 'This penalty will decay by 50% every 30 days with good performance')}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderConfirmationStep = () => {
    const feeInfo = userType === 'host' ? calculateCancellationFee() : null;
    const penaltyInfo = userType === 'cleaner' ? getCleanerPenalty() : null;

    return (
      <View>
        <Text style={styles.stepTitle}>{tSafe('confirm_cancellation_title', 'Confirm Assignment Cancellation')}</Text>

        {userType === 'cleaner' && targetCleaner && (
          <View style={styles.cleanerConfirmation}>
            <Text style={styles.confirmationText}>
              {tSafe('cancel_cleaner_assignment_confirmation', 'You are about to cancel your assignment for:')}
            </Text>
            <View style={styles.cleanerCard}>
              <MaterialCommunityIcons name="account" size={24} color={COLORS.primary} />
              <View style={styles.cleanerDetails}>
                <Text style={styles.cleanerName}>{targetCleaner.firstname} {targetCleaner.lastname}</Text>
                <Text style={styles.cleanerAssignment}>
                  {targetCleaner.group
                    ? tSafe('group_label', 'Group {group}', { group: getGroupDisplayName(targetCleaner.group) })
                    : tSafe('your_assignment', 'Your Assignment')}
                </Text>
              </View>
            </View>
          </View>
        )}

        {renderPolicyDetails()}

        <View style={styles.confirmationSection}>
          <Text style={styles.confirmationTitle}>{tSafe('final_confirmation', 'Final Confirmation')}</Text>
          <Text style={styles.confirmationText}>
            {userType === 'cleaner'
              ? tSafe('confirm_cleaner_cancellation_text', 'Are you sure you want to cancel your assignment? This will result in a {penalty} penalty on your cleaner profile.', {
                  penalty: tSafe(penaltyInfo?.penaltyKey || 'penalty_none', penaltyInfo?.penaltyDefault || 'none').toLowerCase()
                })
              : tSafe('confirm_host_cancellation_text', 'Are you sure you want to cancel this booking? This action will result in a ${fee} cancellation fee.', {
                  fee: feeInfo?.fee.toFixed(2)
                })
            }
          </Text>

          {userType === 'cleaner' && penaltyInfo?.penaltyKey !== 'penalty_none' && (
            <Text style={styles.warningText}>
              ⚠️ {tSafe('frequent_cancellation_warning', 'Frequent cancellations may affect your ability to receive future bookings.')}
            </Text>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
            <Text style={styles.backButtonText}>{tSafe('back', 'Back')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmCancelButton, userType === 'cleaner' && styles.cleanerCancelButton]}
            onPress={handleCancelBooking}
          >
            <MaterialCommunityIcons name={userType === 'cleaner' ? "account-cancel" : "alert-circle"} size={20} color="#FFFFFF" />
            <Text style={styles.confirmCancelButtonText}>
              {userType === 'cleaner' ? tSafe('cancel_assignment', 'Cancel Assignment') : tSafe('confirm_cancellation', 'Confirm Cancellation')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
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
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionText}>{getCancellationDescription()}</Text>
            </View>
            {renderCleanerList()}
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
