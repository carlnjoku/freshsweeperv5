// // ProjectTimelineBar.js – grouped version
// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';

// const ProjectTimelineBar = ({ currentStatus, scheduledDate }) => {
//   // Map backend status to our grouped stages
//   const statusToStage = {
//     published: 0,
//     assigned: 1,
//     accepted: 1,
//     clocked_in: 1,
//     in_progress: 1,
//     pending_review: 2,
//     completed: 2,
//     approved: 2,
//     disapproved: 2,
//   };

//   const currentStage = statusToStage[currentStatus] ?? 0;

//   // Define stages and their internal steps
//   const stages = [
//     {
//       title: 'Job Published',
//       icon: 'cloud-upload',
//       steps: [
//         { key: 'pending_payment', label: 'Published', status: 'active' }
//       ],
//       extraWarning: currentStatus === 'published' && scheduledDate && 
//         (new Date(scheduledDate) - new Date()) < 24 * 60 * 60 * 1000,
//     },
//     {
//       title: 'Active Cleaning',
//       icon: 'progress-wrench',
//       steps: [
//         { key: 'assigned', label: 'Assigned' },
//         { key: 'clocked_in', label: 'Clocked In' },
//         { key: 'in_progress', label: 'In Progress' },
//       ],
//     },
//     {
//       title: 'Review & Completion',
//       icon: 'clipboard-check',
//       steps: [
//         { key: 'pending_review', label: 'Pending Review' },
//         { key: 'approved', label: 'Approved' },
//         { key: 'disapproved', label: 'Revision' },
//       ],
//     },
//   ];

//   // Helper: determine if a specific step is completed, active, or upcoming
//   const getStepStatus = (stageIdx, stepKey) => {
//     if (stageIdx < currentStage) return 'completed';
//     if (stageIdx > currentStage) return 'upcoming';
//     // same stage – compare with currentStatus
//     const statusIndex = stages[stageIdx].steps.findIndex(s => s.key === stepKey);
//     // Need to map currentStatus to step order
//     const stepOrder = {
//       published: 0,
//       assigned: 1,
//       clocked_in: 2,
//       in_progress: 3,
//       pending_review: 0,
//       approved: 1,
//       disapproved: 1,
//     };
//     const currentStepInStage = stepOrder[currentStatus] ?? 0;
//     if (statusIndex < currentStepInStage) return 'completed';
//     if (statusIndex === currentStepInStage) return 'active';
//     return 'upcoming';
//   };

//   const getStageStatus = (stageIdx) => {
//     if (stageIdx < currentStage) return 'completed';
//     if (stageIdx === currentStage) return 'active';
//     return 'upcoming';
//   };

//   const getStageColor = (status) => {
//     if (status === 'completed') return COLORS.success || '#4CAF50';
//     if (status === 'active') return COLORS.primary || '#007AFF';
//     return COLORS.light_gray || '#ccc';
//   };

//   const getStepIconColor = (stepStatus) => {
//     if (stepStatus === 'completed') return COLORS.success || '#4CAF50';
//     if (stepStatus === 'active') return COLORS.primary || '#007AFF';
//     return COLORS.light_gray || '#ccc';
//   };

//   return (
//     <View >
//       {stages.map((stage, idx) => {
//         const stageStatus = getStageStatus(idx);
//         const isLast = idx === stages.length - 1;

//         return (
//           <View key={idx} style={styles.stageContainer}>
//             {/* Stage header */}
//             <View style={styles.stageHeader}>
//               <View
//                 style={[
//                   styles.stageIconCircle,
//                   { backgroundColor: getStageColor(stageStatus) },
//                 ]}
//               >
//                 <MaterialCommunityIcons
//                   name={stage.icon}
//                   size={20}
//                   color="#fff"
//                 />
//               </View>
//               <Text
//                 style={[
//                   styles.stageTitle,
//                   {
//                     color: stageStatus === 'completed' || stageStatus === 'active'
//                       ? COLORS.dark
//                       : COLORS.gray,
//                     fontWeight: stageStatus === 'active' ? '700' : '500',
//                   },
//                 ]}
//               >
//                 {stage.title}
//               </Text>
//               {stage.extraWarning && (
//                 <MaterialCommunityIcons
//                   name="alert-circle"
//                   size={18}
//                   color="#FF9800"
//                   style={styles.warningIcon}
//                 />
//               )}
//             </View>

//             {/* Steps inside the stage */}
//             <View style={styles.stepsRow}>
//               {stage.steps.map((step, stepIdx) => {
//                 const stepStatus = getStepStatus(idx, step.key);
//                 const isLastStep = stepIdx === stage.steps.length - 1;
//                 return (
//                   <React.Fragment key={step.key}>
//                     <View style={styles.stepItem}>
//                       <View
//                         style={[
//                           styles.stepDot,
//                           { backgroundColor: getStepIconColor(stepStatus) },
//                           stepStatus === 'active' && styles.activeStepDot,
//                         ]}
//                       />
//                       <Text
//                         style={[
//                           styles.stepLabel,
//                           { color: getStepIconColor(stepStatus) },
//                         ]}
//                       >
//                         {step.label}
//                       </Text>
//                     </View>
//                     {!isLastStep && (
//                       <View
//                         style={[
//                           styles.stepLine,
//                           { backgroundColor: getStepIconColor(stepStatus) === COLORS.success
//                               ? COLORS.success
//                               : COLORS.light_gray },
//                         ]}
//                       />
//                     )}
//                   </React.Fragment>
//                 );
//               })}
//             </View>

//             {/* Vertical connecting line between stages */}
//             {!isLast && (
//               <View
//                 style={[
//                   styles.stageConnector,
//                   {
//                     backgroundColor:
//                       stageStatus === 'completed' ? COLORS.success : COLORS.light_gray,
//                   },
//                 ]}
//               />
//             )}
//           </View>
//         );
//       })}

//       {/* Summary or warning message */}
//       <View style={styles.summary}>
//         {stages[0].extraWarning && (
//           <View style={styles.warningBox}>
//             <MaterialCommunityIcons name="alert-circle" size={16} color="#FF9800" />
//             <Text style={styles.warningText}>
//               No cleaner assigned yet – job expires in less than 24h.
//             </Text>
//           </View>
//         )}
//         <Text style={styles.summaryText}>
//           {currentStatus === 'pending_payment' && '📢 Looking for a cleaner...'}
//           {currentStatus === 'assigned' && '✅ Cleaner assigned – will arrive on scheduled date.'}
//           {currentStatus === 'clocked_in' && '🧹 Cleaner has started working.'}
//           {currentStatus === 'in_progress' && '🔄 Cleaning in progress.'}
//           {currentStatus === 'pending_review' && '👀 Cleaning finished. Please review the work.'}
//           {currentStatus === 'approved' && '🎉 Job completed and approved!'}
//           {currentStatus === 'disapproved' && '❌ Needs revision – please contact your cleaner.'}
//         </Text>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 16,
//     marginHorizontal: 8,
//     marginVertical: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   stageContainer: {
//     marginBottom: 16,
//   },
//   stageHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   stageIconCircle: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   stageTitle: {
//     fontSize: 16,
//     flex: 1,
//   },
//   warningIcon: {
//     marginLeft: 8,
//   },
//   stepsRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingLeft: 44, // align with stage title
//   },
//   stepItem: {
//     alignItems: 'center',
//     flex: 1,
//   },
//   stepDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     marginBottom: 6,
//   },
//   activeStepDot: {
//     width: 14,
//     height: 14,
//     borderRadius: 7,
//     borderWidth: 2,
//     borderColor: '#fff',
//   },
//   stepLabel: {
//     fontSize: 10,
//     textAlign: 'center',
//   },
//   stepLine: {
//     width: 30,
//     height: 2,
//     marginHorizontal: 4,
//   },
//   stageConnector: {
//     width: 2,
//     height: 20,
//     marginLeft: 16, // under the icon
//     marginTop: -8,
//     marginBottom: 8,
//   },
//   summary: {
//     backgroundColor: COLORS.background_light || '#f5f5f5',
//     borderRadius: 12,
//     padding: 12,
//     marginTop: 8,
//   },
//   summaryText: {
//     fontSize: 12,
//     color: COLORS.gray || '#666',
//     textAlign: 'center',
//   },
//   warningBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF3E0',
//     borderRadius: 8,
//     padding: 8,
//     marginBottom: 8,
//   },
//   warningText: {
//     fontSize: 12,
//     color: '#E65100',
//     marginLeft: 6,
//     flex: 1,
//   },
// });

// export default ProjectTimelineBar;




// ProjectTimelineBar.js
// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';

// const ProjectTimelineBar = ({ currentStatus, scheduledDate, onReviewPress, onContactCleaner }) => {
//   // Stage definitions with steps, icons, and status messages
//   const stages = [
//     {
//       id: 0,
//       title: 'Step 1: Publish Job',
//       icon: 'cloud-upload',
//       steps: [
//         { key: 'published', label: 'Published', description: 'Looking for a cleaner' }
//       ],
//       warning: currentStatus === 'published' && scheduledDate && 
//         (new Date(scheduledDate) - new Date()) < 24 * 60 * 60 * 1000,
//       warningMessage: '⚠️ No cleaner assigned – job expires in <24h',
//     },
//     {
//       id: 1,
//       title: 'Step 2: Active Cleaning',
//       icon: 'broom',
//       steps: [
//         { key: 'assigned', label: 'Assigned', description: 'Cleaner confirmed' },
//         { key: 'clocked_in', label: 'Clocked in', description: 'Arrived on site' },
//         { key: 'in_progress', label: 'In progress', description: 'Cleaning ongoing' },
//       ],
//     },
//     {
//       id: 2,
//       title: 'Step 3: Review & Close',
//       icon: 'clipboard-check-outline',
//       steps: [
//         { key: 'pending_review', label: 'Pending review', description: 'Waiting for your approval' },
//         { key: 'approved', label: 'Approved', description: 'Job completed successfully' },
//         { key: 'disapproved', label: 'Needs revision', description: 'Cleaner requested to redo' },
//       ],
//     },
//   ];

//   // Map backend status to stage & step index
//   const statusMap = {
//     published: { stage: 0, step: 0 },
//     assigned: { stage: 1, step: 0 },
//     accepted: { stage: 1, step: 0 },
//     clocked_in: { stage: 1, step: 1 },
//     in_progress: { stage: 1, step: 2 },
//     pending_review: { stage: 2, step: 0 },
//     approved: { stage: 2, step: 1 },
//     completed: { stage: 2, step: 1 },
//     disapproved: { stage: 2, step: 2 },
//     revision_needed: { stage: 2, step: 2 },
//   };

//   const current = statusMap[currentStatus] || { stage: 0, step: 0 };
//   const currentStageIdx = current.stage;
//   const currentStepIdx = current.step;

//   // Helper to get status of a stage/step
//   const getStageStatus = (stageIdx) => {
//     if (stageIdx < currentStageIdx) return 'completed';
//     if (stageIdx === currentStageIdx) return 'active';
//     return 'upcoming';
//   };

//   const getStepStatus = (stageIdx, stepIdx) => {
//     if (stageIdx < currentStageIdx) return 'completed';
//     if (stageIdx === currentStageIdx) {
//       if (stepIdx < currentStepIdx) return 'completed';
//       if (stepIdx === currentStepIdx) return 'active';
//     }
//     return 'upcoming';
//   };

//   const getColor = (status) => {
//     switch (status) {
//       case 'completed': return COLORS.success || '#4CAF50';
//       case 'active': return COLORS.primary || '#007AFF';
//       default: return COLORS.light_gray || '#E0E0E0';
//     }
//   };

//   const getTextColor = (status) => {
//     if (status === 'completed') return COLORS.success || '#4CAF50';
//     if (status === 'active') return COLORS.primary || '#007AFF';
//     return COLORS.gray || '#999';
//   };

//   // Render a micro-step inside a stage
//   const renderStep = (stageIdx, step, stepIdx) => {
//     const stepStatus = getStepStatus(stageIdx, stepIdx);
//     const isActive = stepStatus === 'active';
//     const isCompleted = stepStatus === 'completed';
//     const isUpcoming = stepStatus === 'upcoming';

//     return (
//       <View key={step.key} style={styles.stepRow}>
//         <View style={styles.stepIndicator}>
//           {isCompleted ? (
//             <View style={[styles.stepCircleCompleted, { backgroundColor: getColor(stepStatus) }]}>
//               <MaterialCommunityIcons name="check" size={12} color="#fff" />
//             </View>
//           ) : (
//             <View style={[styles.stepCircle, { borderColor: getColor(stepStatus) }]} />
//           )}
//           {stepIdx < stages[stageIdx].steps.length - 1 && (
//             <View style={[styles.stepLine, { backgroundColor: getColor(stepStatus) }]} />
//           )}
//         </View>
//         <View style={styles.stepContent}>
//           <Text style={[styles.stepLabel, { color: getTextColor(stepStatus), fontWeight: isActive ? '600' : '400' }]}>
//             {step.label}
//           </Text>
//           <Text style={[styles.stepDesc, { color: getTextColor('upcoming') }]}>
//             {step.description}
//           </Text>
//         </View>
//       </View>
//     );
//   };

//   // Overall progress (0 to 1)
//   const totalStages = stages.length;
//   const overallProgress = currentStageIdx / (totalStages - 1);

//   // Action buttons for active stage
//   const renderActionButton = () => {
//     if (currentStatus === 'pending_review') {
//       return (
//         <TouchableOpacity style={styles.actionButton} onPress={onReviewPress}>
//           <Text style={styles.actionButtonText}>Review Cleaning</Text>
//           <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
//         </TouchableOpacity>
//       );
//     }
//     if (currentStatus === 'disapproved') {
//       return (
//         <TouchableOpacity style={styles.actionButtonOutline} onPress={onContactCleaner}>
//           <Text style={styles.actionButtonOutlineText}>Contact Cleaner</Text>
//           <MaterialCommunityIcons name="chat" size={18} color={COLORS.primary} />
//         </TouchableOpacity>
//       );
//     }
//     return null;
//   };

//   return (
//     <View style={styles.container}>
//       {/* Overall progress bar */}
//       <View style={styles.progressSection}>
//         <View style={styles.progressLabels}>
//           <Text style={styles.progressLabel}>Job Progress</Text>
//           <Text style={styles.progressPercent}>{Math.round(overallProgress * 100)}%</Text>
//         </View>
//         <View style={styles.progressTrack}>
//           <View style={[styles.progressFill, { width: `${overallProgress * 100}%` }]} />
//         </View>
//       </View>

//       {/* Timeline stages */}
//       {stages.map((stage, idx) => {
//         const stageStatus = getStageStatus(idx);
//         const isActive = stageStatus === 'active';
//         const isCompleted = stageStatus === 'completed';

//         return (
//           <View key={idx} style={[styles.stageCard, isActive && styles.activeCard]}>
//             <View style={styles.stageHeader}>
//               <View style={[styles.stageIconBg, { backgroundColor: getColor(stageStatus) }]}>
//                 <MaterialCommunityIcons name={stage.icon} size={22} color="#fff" />
//               </View>
//               <View style={styles.stageTitleContainer}>
//                 <Text style={[styles.stageTitle, { color: getTextColor(stageStatus) }]}>
//                   {stage.title}
//                 </Text>
//                 {isCompleted && (
//                   <View style={styles.badge}>
//                     <Text style={styles.badgeText}>Done</Text>
//                   </View>
//                 )}
//                 {isActive && (
//                   <View style={[styles.badge, styles.activeBadge]}>
//                     <Text style={[styles.badgeText, { color: '#fff' }]}>In progress</Text>
//                   </View>
//                 )}
//               </View>
//             </View>

//             {/* Steps inside stage */}
//             <View style={styles.stepsContainer}>
//               {stage.steps.map((step, stepIdx) => renderStep(idx, step, stepIdx))}
//             </View>

//             {/* Warning inside stage 1 if no cleaner assigned */}
//             {idx === 0 && stage.warning && (
//               <View style={styles.warningContainer}>
//                 <MaterialCommunityIcons name="alert-decagram" size={18} color="#FF9800" />
//                 <Text style={styles.warningText}>{stage.warningMessage}</Text>
//               </View>
//             )}
//           </View>
//         );
//       })}

//       {/* Action button for active stage */}
//       {renderActionButton()}

//       {/* Summary message */}
//       <View style={styles.summaryCard}>
//         <MaterialCommunityIcons name="information" size={20} color={COLORS.primary} />
//         <Text style={styles.summaryText}>
//           {currentStatus === 'published' && 'No cleaner yet? We’re still matching – you can extend the date if needed.'}
//           {currentStatus === 'assigned' && 'Cleaner will arrive on the scheduled date.'}
//           {currentStatus === 'clocked_in' && 'Cleaner started – you’ll be notified when done.'}
//           {currentStatus === 'in_progress' && 'Work in progress – check back later.'}
//           {currentStatus === 'pending_review' && 'Please review the cleaning quality and approve or request changes.'}
//           {currentStatus === 'approved' && 'Job completed! Thank you for using FreshSweeper.'}
//           {currentStatus === 'disapproved' && 'The cleaner has been notified. You can discuss details via chat.'}
//         </Text>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     backgroundColor: '#F8FAFC',
//   },
//   // Progress bar
//   progressSection: {
//     marginBottom: 24,
//   },
//   progressLabels: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   progressLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.dark || '#1E293B',
//   },
//   progressPercent: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },
//   progressTrack: {
//     height: 8,
//     backgroundColor: '#E2E8F0',
//     borderRadius: 4,
//     overflow: 'hidden',
//   },
//   progressFill: {
//     height: '100%',
//     backgroundColor: COLORS.primary,
//     borderRadius: 4,
//   },
//   // Stage cards
//   stageCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 20,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   activeCard: {
//     borderWidth: 1,
//     borderColor: COLORS.primary,
//     shadowOpacity: 0.1,
//   },
//   stageHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   stageIconBg: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   stageTitleContainer: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   stageTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   badge: {
//     backgroundColor: '#E2E8F0',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 20,
//   },
//   activeBadge: {
//     backgroundColor: COLORS.primary,
//   },
//   badgeText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.dark,
//   },
//   // Steps inside stage
//   stepsContainer: {
//     marginLeft: 8,
//   },
//   stepRow: {
//     flexDirection: 'row',
//     marginBottom: 16,
//   },
//   stepIndicator: {
//     width: 24,
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   stepCircle: {
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//     borderWidth: 2,
//     backgroundColor: '#fff',
//   },
//   stepCircleCompleted: {
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   stepLine: {
//     width: 2,
//     height: 24,
//     marginTop: 4,
//   },
//   stepContent: {
//     flex: 1,
//   },
//   stepLabel: {
//     fontSize: 14,
//     marginBottom: 2,
//   },
//   stepDesc: {
//     fontSize: 12,
//   },
//   // Warning
//   warningContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF8E1',
//     padding: 10,
//     borderRadius: 12,
//     marginTop: 8,
//   },
//   warningText: {
//     fontSize: 12,
//     color: '#E65100',
//     marginLeft: 8,
//     flex: 1,
//   },
//   // Action button
//   actionButton: {
//     backgroundColor: COLORS.primary,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 14,
//     paddingHorizontal: 20,
//     borderRadius: 30,
//     marginBottom: 16,
//   },
//   actionButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   actionButtonOutline: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 14,
//     paddingHorizontal: 20,
//     borderRadius: 30,
//     borderWidth: 1,
//     borderColor: COLORS.primary,
//     marginBottom: 16,
//   },
//   actionButtonOutlineText: {
//     color: COLORS.primary,
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   // Summary card
//   summaryCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 14,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.03,
//     shadowRadius: 4,
//     elevation: 1,
//   },
//   summaryText: {
//     flex: 1,
//     fontSize: 13,
//     color: COLORS.gray,
//     marginLeft: 10,
//   },
// });

// export default ProjectTimelineBar;




// ProjectTimelineBar.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';

const ProjectTimelineBar = ({ currentStatus, scheduledDate, onReviewPress, onContactCleaner }) => {
  // Stage definitions
  const stages = [
    {
      id: 0,
      title: 'Step 1: Publish Job',
      icon: 'cloud-upload',
      steps: [
        { key: 'pending_payment', label: 'Published', description: 'Looking for a cleaner' }
      ],
      warning: currentStatus === 'pending_payment' && scheduledDate && 
        (new Date(scheduledDate) - new Date()) < 24 * 60 * 60 * 1000,
      warningMessage: '⚠️ No cleaner assigned – job expires in <24h',
    },
    {
      id: 1,
      title: 'Step 2: Active Cleaning',
      icon: 'broom',
      steps: [
        { key: 'upcoming', label: 'Assigned', description: 'Cleaner confirmed' },
        { key: 'clocked_in', label: 'Clocked in', description: 'Arrived on site' },
        { key: 'in_progress', label: 'In progress', description: 'Cleaning ongoing' },
      ],
    },
    {
      id: 2,
      title: 'Step 3: Review & Close',
      icon: 'clipboard-check-outline',
      steps: [
        { key: 'pending_review', label: 'Pending review', description: 'Waiting for your approval' },
        { key: 'approved', label: 'Approved', description: 'Job completed successfully' },
        { key: 'disapproved', label: 'Needs revision', description: 'Cleaner requested to redo' },
      ],
    },
  ];

  // Map backend status to stage & step index
  const statusMap = {
    pending_payment: { stage: 0, step: 0 },
    upcoming: { stage: 1, step: 0 },
    accepted: { stage: 1, step: 0 },
    clocked_in: { stage: 1, step: 1 },
    in_progress: { stage: 1, step: 2 },
    pending_review: { stage: 2, step: 0 },
    approved: { stage: 2, step: 1 },
    completed: { stage: 2, step: 1 },
    disapproved: { stage: 2, step: 2 },
    revision_needed: { stage: 2, step: 2 },
  };

  const current = statusMap[currentStatus] || { stage: 0, step: 0 };
  const currentStageIdx = current.stage;
  const currentStepIdx = current.step;

  // Collapsible state: stage 1 is always expanded, stages 2 and 3 collapsible.
  // By default, expand the active stage, collapse others.
  const getDefaultExpanded = (stageIdx) => {
    if (stageIdx === 0) return true; // Stage 1 always expanded
    return stageIdx === currentStageIdx; // Only expand the active stage
  };

  const [expandedStages, setExpandedStages] = useState({
    0: true,
    1: getDefaultExpanded(1),
    2: getDefaultExpanded(2),
  });

  const toggleStage = (stageIdx) => {
    if (stageIdx === 0) return; // Stage 1 cannot be collapsed
    setExpandedStages(prev => ({ ...prev, [stageIdx]: !prev[stageIdx] }));
  };

  // Helper to get status of a stage/step
  const getStageStatus = (stageIdx) => {
    if (stageIdx < currentStageIdx) return 'completed';
    if (stageIdx === currentStageIdx) return 'active';
    return 'upcoming';
  };

  const getStepStatus = (stageIdx, stepIdx) => {
    if (stageIdx < currentStageIdx) return 'completed';
    if (stageIdx === currentStageIdx) {
      if (stepIdx < currentStepIdx) return 'completed';
      if (stepIdx === currentStepIdx) return 'active';
    }
    return 'upcoming';
  };

  const getColor = (status) => {
    switch (status) {
      case 'completed': return COLORS.success || '#4CAF50';
      case 'active': return COLORS.primary || '#007AFF';
      default: return COLORS.light_gray || '#E0E0E0';
    }
  };

  const getTextColor = (status) => {
    if (status === 'completed') return COLORS.success || '#4CAF50';
    if (status === 'active') return COLORS.primary || '#007AFF';
    return COLORS.gray || '#999';
  };

  // Render a micro-step inside a stage
  const renderStep = (stageIdx, step, stepIdx) => {
    const stepStatus = getStepStatus(stageIdx, stepIdx);
    const isActive = stepStatus === 'active';
    const isCompleted = stepStatus === 'completed';

    return (
      <View key={step.key} style={styles.stepRow}>
        <View style={styles.stepIndicator}>
          {isCompleted ? (
            <View style={[styles.stepCircleCompleted, { backgroundColor: getColor(stepStatus) }]}>
              <MaterialCommunityIcons name="check" size={12} color="#fff" />
            </View>
          ) : (
            <View style={[styles.stepCircle, { borderColor: getColor(stepStatus) }]} />
          )}
          {stepIdx < stages[stageIdx].steps.length - 1 && (
            <View style={[styles.stepLine, { backgroundColor: getColor(stepStatus) }]} />
          )}
        </View>
        <View style={styles.stepContent}>
          <Text style={[styles.stepLabel, { color: getTextColor(stepStatus), fontWeight: isActive ? '600' : '400' }]}>
            {step.label}
          </Text>
          <Text style={[styles.stepDesc, { color: getTextColor('upcoming') }]}>
            {step.description}
          </Text>
        </View>
      </View>
    );
  };

  // Overall progress (0 to 1)
  const totalStages = stages.length;
  const overallProgress = currentStageIdx / (totalStages - 1);

  // Action buttons for active stage
  const renderActionButton = () => {
    if (currentStatus === 'pending_review') {
      return (
        <TouchableOpacity style={styles.actionButton} onPress={onReviewPress}>
          <Text style={styles.actionButtonText}>Review Cleaning</Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
        </TouchableOpacity>
      );
    }
    if (currentStatus === 'disapproved') {
      return (
        <TouchableOpacity style={styles.actionButtonOutline} onPress={onContactCleaner}>
          <Text style={styles.actionButtonOutlineText}>Contact Cleaner</Text>
          <MaterialCommunityIcons name="chat" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Overall progress bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>Job Progress</Text>
          <Text style={styles.progressPercent}>{Math.round(overallProgress * 100)}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${overallProgress * 100}%` }]} />
        </View>
      </View>

      {/* Timeline stages */}
      {stages.map((stage, idx) => {
        const stageStatus = getStageStatus(idx);
        const isActive = stageStatus === 'active';
        const isCompleted = stageStatus === 'completed';
        const isExpanded = expandedStages[idx];
        const canCollapse = idx !== 0; // only stages 2 and 3 are collapsible
        const chevronIcon = isExpanded ? 'chevron-up' : 'chevron-down';

        return (
          <View key={idx} style={[styles.stageCard, isActive && styles.activeCard]}>
            {/* Header with touchable toggle for collapsible stages */}
            <TouchableOpacity
              activeOpacity={canCollapse ? 0.7 : 1}
              onPress={() => canCollapse && toggleStage(idx)}
              disabled={!canCollapse}
            >
              <View style={styles.stageHeader}>
                <View style={[styles.stageIconBg, { backgroundColor: getColor(stageStatus) }]}>
                  <MaterialCommunityIcons name={stage.icon} size={22} color="#fff" />
                </View>
                <View style={styles.stageTitleContainer}>
                  <Text style={[styles.stageTitle, { color: getTextColor(stageStatus) }]}>
                    {stage.title}
                  </Text>
                  <View style={styles.headerRight}>
                    {isCompleted && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>Done</Text>
                      </View>
                    )}
                    {isActive && (
                      <View style={[styles.badge, styles.activeBadge]}>
                        <Text style={[styles.badgeText, { color: '#fff' }]}>In progress</Text>
                      </View>
                    )}
                    {canCollapse && (
                      <MaterialCommunityIcons name={chevronIcon} size={22} color={COLORS.gray} />
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Steps inside stage – only show if expanded */}
            {isExpanded && (
              <View style={styles.stepsContainer}>
                {stage.steps.map((step, stepIdx) => renderStep(idx, step, stepIdx))}
              </View>
            )}

            {/* Warning inside stage 1 if no cleaner assigned */}
            {idx === 0 && stage.warning && (
              <View style={styles.warningContainer}>
                <MaterialCommunityIcons name="alert-decagram" size={18} color="#FF9800" />
                <Text style={styles.warningText}>{stage.warningMessage}</Text>
              </View>
            )}
          </View>
        );
      })}

      {/* Action button for active stage */}
      {renderActionButton()}

      {/* Summary message */}
      <View style={styles.summaryCard}>
        <MaterialCommunityIcons name="information" size={20} color={COLORS.primary} />
        <Text style={styles.summaryText}>
          {currentStatus === 'pending_payment' && 'No cleaner yet? We’re still matching – you can extend the date if needed.'}
          {currentStatus === 'upcoming' && 'Cleaner will arrive on the scheduled date.'}
          {currentStatus === 'clocked_in' && 'Cleaner started – you’ll be notified when done.'}
          {currentStatus === 'in_progress' && 'Work in progress – check back later.'}
          {currentStatus === 'pending_review' && 'Please review the cleaning quality and approve or request changes.'}
          {currentStatus === 'approved' && 'Job completed! Thank you for using FreshSweeper.'}
          {currentStatus === 'disapproved' && 'The cleaner has been notified. You can discuss details via chat.'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  progressSection: {
    marginBottom: 24,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark || '#1E293B',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  stageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activeCard: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    shadowOpacity: 0.1,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stageTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stageTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  activeBadge: {
    backgroundColor: COLORS.primary,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.dark,
  },
  stepsContainer: {
    marginLeft: 8,
    marginTop: 16,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepIndicator: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  stepCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  stepCircleCompleted: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepLine: {
    width: 2,
    height: 24,
    marginTop: 4,
  },
  stepContent: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 10,
    borderRadius: 12,
    marginTop: 12,
  },
  warningText: {
    fontSize: 12,
    color: '#E65100',
    marginLeft: 8,
    flex: 1,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginBottom: 16,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 16,
  },
  actionButtonOutlineText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  summaryText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.gray,
    marginLeft: 10,
  },
});

export default ProjectTimelineBar;