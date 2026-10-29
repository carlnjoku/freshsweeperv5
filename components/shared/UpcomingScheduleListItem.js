// import React, { useContext, useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
// import COLORS from '../../constants/colors';
// import { Chip } from 'react-native-paper';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import moment from 'moment';
// import ROUTES from '../../constants/routes';
// import { useNavigation } from '@react-navigation/native';
// import { useBookingContext } from '../../context/BookingContext';
// import { AuthContext } from '../../context/AuthContext';
// import { tSafe } from '../../utils/tSafe';

// const UpcomingScheduleListItem = ({ item, currency }) => {
//   const navigation = useNavigation();
//   const { userType, currentUserId } = useContext(AuthContext);

//   console.log("Upp------coming", JSON.stringify(item.schedule, null, 2))


//   const assignedToForCleaner = item.assignedTo?.find(
//     (cleaner) => cleaner.cleanerId === currentUserId
//   );

//   // Check if schedule is cancelled OR current user's assignment is cancelled
//   const isScheduleCancelled = item.status?.toLowerCase() === 'cancelled';
//   const isUserAssignmentCancelled = assignedToForCleaner?.status?.toLowerCase() === 'cancelled';

//   const isCancelled = isScheduleCancelled || isUserAssignmentCancelled;

//   const { handleEdit } = useBookingContext();

//   return (
//     <View>
//       <View style={styles.container}>
//         <View style={styles.date_time}>
//           <Text style={styles.date}>
//             {moment(item.schedule.cleaning_date).format('ddd MMM DD')}
//           </Text>
//           <Text style={styles.time}>
//             {moment(item.schedule.cleaning_time, 'h:mm:ss A').format('h:mm A')}
//           </Text>
//         </View>

//         <View style={styles.dotline}>
//           <View style={styles.dot} />
//           <View style={styles.line} />
//         </View>

//         <View style={styles.task_details}>
//           <Text bold style={styles.task}>
//             {item.schedule.apartment_name}
//           </Text>
//           <Text style={styles.apartment}>{item.schedule.address}</Text>

//           <Chip
//               mode="flat"
//               style={styles.activeChip}
//               textStyle={styles.text}
//             >

//               {`${currency}${Number(item.schedule.total_cleaning_fee || 0).toFixed(2)}`}

//             </Chip>

//           {userType === 'host' ? (
//             <View style={styles.action}>
//               {item.status === 'pending_payment' || 'upcoming' ? (
//                 <View
//                   style={{
//                     flexDirection: 'row',
//                     width: '85%',
//                     justifyContent: 'space-between',
//                     alignItems: 'center',
//                   }}
//                 >
//                   <TouchableOpacity
//                     onPress={() =>
//                       navigation.navigate(ROUTES.host_schedule_details, {
//                         scheduleId: item._id,
//                       })
//                     }
//                   >
//                     <Text style={styles.details}>
//                       {tSafe('view_schedule', 'View schedule')}
//                     </Text>
//                   </TouchableOpacity>

//                   <TouchableOpacity
//                     onPress={() => handleEdit(true, item)}
//                   >
//                     <Text style={styles.details}>
//                       {tSafe('edit_schedule', 'Edit schedule')}
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               ) : (
//                 <TouchableOpacity
//                   onPress={() =>
//                     navigation.navigate(ROUTES.host_schedule_details, {
//                       scheduleId: item._id,
//                     })
//                   }
//                 >
//                   <Text style={styles.details}>
//                     {tSafe('view_schedule', 'View schedule')}
//                   </Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           ) : (
//             <View style={styles.action}>
//               {item.status === 'open' ? (
//                 <TouchableOpacity
//                   onPress={() =>
//                     navigation.navigate(ROUTES.cleaner_schedule_details, {
//                       item: item.item,
//                     })
//                   }
//                 >
//                   <Text style={styles.details}>
//                     {tSafe('view_details', 'View Details')}
//                   </Text>
//                 </TouchableOpacity>
//               ) : (
//                 <>
//                   {!isCancelled && (
//                     <TouchableOpacity
//                       onPress={() =>
//                         navigation.navigate(ROUTES.cleaner_clock_in, {
//                           scheduleId: item._id,
//                           schedule: item,
//                           cleaner: assignedToForCleaner,
//                         })
//                       }
//                     >
//                       <Text style={styles.clockin}>
//                         {tSafe('clock_in', 'Clock-In')}
//                       </Text>
//                     </TouchableOpacity>
//                   )}
//                 </>
//               )}
//             </View>
//           )}
//         </View>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     marginBottom: 10,
//     marginTop: 15,
//   },
//   dotline: {
//     flex: 0.05,
//     height: '100%',
//     alignItems: 'flex-start',
//   },
//   line: {
//     borderLeftWidth: 0.7,
//     borderLeftColor: COLORS.light_gray,
//     minHeight: 78,
//     marginHorizontal: 5,
//     marginVertical: 0,
//   },
//   date_time: {
//     flex: 0.25,
//     alignItems: 'flex-end',
//     marginRight: 5,
//   },
//   task: {
//     fontWeight: '500',
//   },
//   apartment: {
//     color: COLORS.gray,
//     fontSize: 13,
//     marginBottom: 5,
//   },
//   date: {
//     marginTop: -4,
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   time: {
//     marginTop: 4,
//     fontSize: 12,
//   },
//   assignee: {
//     fontSize: 12,
//     color: COLORS.gray,
//   },
//   task_details: {
//     flex: 0.7,
//     alignItems: 'flex-start',
//     width: '100%',
//     marginTop: -5,
//   },
//   status: {
//     textTransform: 'capitalize',
//     color: COLORS.light_gray,
//   },
//   dot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: COLORS.primary,
//     marginBottom: 5,
//   },
//   details: {
//     fontSize: 14,
//     color: COLORS.primary,
//     textDecorationLine: 'underline',
//   },
//   clockin: {
//     fontSize: 14,
//     marginLeft: 20,
//     color: COLORS.primary,
//     fontWeight: 'bold',
//   },
//   action: {
//     flexDirection: 'row',
//     justifyContent: 'space-evenly',
//     marginTop: 5,
//     marginBottom: 5,
//   },
//   chip: {
//     backgroundColor: COLORS.light_gray_1,
//     borderRadius: 50,
//   },
//   activeChip: {
//     backgroundColor: COLORS.primary_light_1,
//     borderRadius: 50,
//   },
//   text: {
//     fontWeight: '400',
//   },
// });

// export default UpcomingScheduleListItem;



// import React, { useContext } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
// } from 'react-native';
// import COLORS from '../../constants/colors';
// import { Chip } from 'react-native-paper';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import moment from 'moment';
// import ROUTES from '../../constants/routes';
// import { useNavigation } from '@react-navigation/native';
// import { useBookingContext } from '../../context/BookingContext';
// import { AuthContext } from '../../context/AuthContext';
// import { tSafe } from '../../utils/tSafe';

// const UpcomingScheduleListItem = ({
//   item,
//   currency,
//   replacementWorkflows = [],
// }) => {
//   const navigation = useNavigation();
//   const { userType, currentUserId } = useContext(AuthContext);

//   const assignedToForCleaner = item.assignedTo?.find(
//     (cleaner) => cleaner.cleanerId === currentUserId
//   );

//   // ---------------------------------------------------------
//   // CANCELLATION STATUS
//   // ---------------------------------------------------------

//   const isScheduleCancelled =
//     item.status?.toLowerCase() === 'cancelled';

//   const isUserAssignmentCancelled =
//     assignedToForCleaner?.status?.toLowerCase() === 'cancelled';

//   const isCancelled =
//     isScheduleCancelled || isUserAssignmentCancelled;

//   // ---------------------------------------------------------
//   // CLOCK-IN STATUS
//   // ---------------------------------------------------------

//   const hasAnyCleanerClockedIn =
//     item.assignedTo?.some(
//       (cleaner) =>
//         cleaner.clockedIn === true ||
//         cleaner.clockInTime != null
//     ) || false;

//   const { handleEdit } = useBookingContext();

//   // ---------------------------------------------------------
//   // REPLACEMENT WORKFLOWS
//   // ---------------------------------------------------------

//   const activeReplacementWorkflows = Array.isArray(
//     replacementWorkflows
//   )
//     ? replacementWorkflows.filter(
//         (workflow) =>
//           workflow?.status &&
//           workflow.status !== 'completed'
//       )
//     : [];

//   const completedReplacementWorkflows = Array.isArray(
//     replacementWorkflows
//   )
//     ? replacementWorkflows.filter(
//         (workflow) =>
//           workflow?.status === 'completed'
//       )
//     : [];

//   /**
//    * Prioritize active workflows.
//    * If there are no active workflows, show the completed one.
//    */
//   const replacementWorkflow =
//     activeReplacementWorkflows[0] ||
//     completedReplacementWorkflows[0] ||
//     null;

//   const hasReplacementWorkflow =
//     replacementWorkflow !== null;

//   const replacementStatus =
//     replacementWorkflow?.status || null;

//   // ---------------------------------------------------------
//   // REPLACEMENT NAVIGATION
//   // ---------------------------------------------------------

//   // const handleReplacementWorkflow = (workflow) => {
//   //   if (!workflow) return;

//   //   const workflowStatus = workflow.status;

//   //   // -------------------------------------------------------
//   //   // WAITING FOR CLEANER
//   //   // -------------------------------------------------------

//   //   if (workflowStatus === 'waiting_for_cleaners') {
//   //     navigation.navigate('ReplacementRequestStatus', {
//   //       scheduleId: String(item._id),
//   //       requestId: String(workflow.requestId),
//   //     });

//   //     return;
//   //   }

//   //   // -------------------------------------------------------
//   //   // REPLACEMENT READY
//   //   // -------------------------------------------------------

//   //   if (workflowStatus === 'cleaner_available') {
//   //     navigation.navigate('ReplacementRequestStatus', {
//   //       scheduleId: String(item._id),
//   //       requestId: String(workflow.requestId),
//   //     });

//   //     return;
//   //   }

//   //   // -------------------------------------------------------
//   //   // PAYMENT REQUIRED
//   //   // -------------------------------------------------------

//   //   if (workflowStatus === 'payment_required') {
//   //     const selectedCleaner =
//   //       workflow.selectedCleaner;

//   //     if (
//   //       !selectedCleaner?.requestId ||
//   //       !selectedCleaner?.cleanerId
//   //     ) {
//   //       console.warn(
//   //         'Replacement workflow requires payment but has no selected cleaner:',
//   //         workflow
//   //       );

//   //       navigation.navigate(
//   //         'ReplacementRequestStatus',
//   //         {
//   //           scheduleId: String(item._id),
//   //           requestId: String(
//   //             workflow.requestId
//   //           ),
//   //         }
//   //       );

//   //       return;
//   //     }

//   //     // Find the selected child replacement request
//   //     const selectedRequest =
//   //       workflow.requests?.find(
//   //         (request) =>
//   //           String(request.requestId) ===
//   //           String(
//   //             selectedCleaner.requestId
//   //           )
//   //       );

//   //     navigation.navigate(
//   //       'ReplacementPayment',
//   //       {
//   //         // Schedule
//   //         scheduleId: String(item._id),

//   //         // Parent date-change request
//   //         requestId: String(
//   //           workflow.requestId
//   //         ),

//   //         // Child replacement request
//   //         replacementRequestId: String(
//   //           selectedCleaner.requestId
//   //         ),

//   //         // Replacement cleaner
//   //         cleanerId: String(
//   //           selectedCleaner.cleanerId
//   //         ),

//   //         cleanerName:
//   //           selectedRequest?.cleanerName ||
//   //           selectedRequest?.name ||
//   //           '',

//   //         // Original cleaner
//   //         replacedCleanerId:
//   //           workflow?.unavailableCleaner
//   //             ?.cleanerId ||
//   //           workflow?.originalCleanerId ||
//   //           null,

//   //         replacedCleanerName:
//   //           workflow?.unavailableCleaner
//   //             ?.name ||
//   //           workflow?.originalCleanerName ||
//   //           null,

//   //         // Schedule information
//   //         oldCleaningDate:
//   //           workflow.oldCleaningDate,

//   //         newCleaningDate:
//   //           workflow.newCleaningDate,

//   //         cleaningTime:
//   //           workflow.cleaningTime,

//   //         propertyName:
//   //           workflow.propertyName,

//   //         group:
//   //           workflow.group,
//   //       }
//   //     );

//   //     return;
//   //   }
//   // };

//   // ---------------------------------------------------------
//   // REPLACEMENT NAVIGATION
//   // ---------------------------------------------------------

//   const handleReplacementWorkflow = (workflow) => {
//     if (!workflow) {
//       console.warn(
//         '[REPLACEMENT] No replacement workflow supplied'
//       );
//       return;
//     }

//     const scheduleId = String(item._id);
//     const requestId = workflow.requestId
//       ? String(workflow.requestId)
//       : null;

//     const workflowStatus = workflow.status;

//     console.log('[REPLACEMENT] Opening workflow:', {
//       scheduleId,
//       requestId,
//       status: workflowStatus,
//       source: workflow.source,
//       group: workflow.group,
//     });

//     if (!requestId) {
//       console.warn(
//         '[REPLACEMENT] Missing parent replacement requestId:',
//         workflow
//       );

//       return;
//     }

//     // -------------------------------------------------------
//     // WAITING FOR CLEANERS
//     //
//     // Parent replacement event exists and cleaner requests
//     // are already in progress.
//     // -------------------------------------------------------

//     if (workflowStatus === 'waiting_for_cleaners') {
//       navigation.navigate('ReplacementRequestStatus', {
//         scheduleId,
//         requestId,
//         source: workflow.source,
//         group: workflow.group,
//       });

//       return;
//     }

//     // -------------------------------------------------------
//     // REPLACEMENT CLEANER AVAILABLE
//     //
//     // At least one cleaner accepted.
//     // Host can continue the replacement flow and select one.
//     // -------------------------------------------------------

//     if (workflowStatus === 'cleaner_available') {
//       navigation.navigate('ReplacementRequestStatus', {
//         scheduleId,
//         requestId,
//         source: workflow.source,
//         group: workflow.group,
//       });

//       return;
//     }

//     // -------------------------------------------------------
//     // PAYMENT REQUIRED
//     //
//     // A replacement cleaner has already been selected.
//     // Go directly to payment.
//     // -------------------------------------------------------

//     if (workflowStatus === 'payment_required') {
//       const selectedCleaner =
//         workflow.selectedCleaner;

//       if (
//         !selectedCleaner?.requestId ||
//         !selectedCleaner?.cleanerId
//       ) {
//         console.warn(
//           '[REPLACEMENT] Payment required but selected cleaner is missing:',
//           workflow
//         );

//         navigation.navigate(
//           'ReplacementRequestStatus',
//           {
//             scheduleId,
//             requestId,
//             source: workflow.source,
//             group: workflow.group,
//           }
//         );

//         return;
//       }

//       const selectedRequest =
//         workflow.requests?.find(
//           (request) =>
//             String(request.requestId) ===
//             String(selectedCleaner.requestId)
//         );

//       navigation.navigate(
//         'ReplacementPayment',
//         {
//           // -----------------------------------------------
//           // Schedule
//           // -----------------------------------------------
//           scheduleId,

//           // -----------------------------------------------
//           // Parent replacement EVENT
//           //
//           // IMPORTANT:
//           // This is no longer assumed to be a date_change
//           // request.
//           // -----------------------------------------------
//           requestId,

//           // -----------------------------------------------
//           // Child replacement request
//           // -----------------------------------------------
//           replacementRequestId:
//             String(selectedCleaner.requestId),

//           // -----------------------------------------------
//           // Replacement cleaner
//           // -----------------------------------------------
//           cleanerId:
//             String(selectedCleaner.cleanerId),

//           cleanerName:
//             selectedRequest?.cleanerName ||
//             selectedRequest?.name ||
//             '',

//           // -----------------------------------------------
//           // Original cleaner
//           // -----------------------------------------------
//           replacedCleanerId:
//             workflow?.unavailableCleaner?.cleanerId ||
//             workflow?.originalCleanerId ||
//             null,

//           replacedCleanerName:
//             workflow?.unavailableCleaner?.name ||
//             workflow?.originalCleanerName ||
//             null,

//           // -----------------------------------------------
//           // Schedule information
//           // -----------------------------------------------
//           oldCleaningDate:
//             workflow.oldCleaningDate,

//           newCleaningDate:
//             workflow.newCleaningDate,

//           oldCleaningTime:
//             workflow.oldCleaningTime || null,

//           newCleaningTime:
//             workflow.newCleaningTime || null,

//           cleaningTime:
//             workflow.cleaningTime,

//           propertyName:
//             workflow.propertyName,

//           group:
//             workflow.group,

//           // -----------------------------------------------
//           // Replacement source
//           // -----------------------------------------------
//           source:
//             workflow.source || null,
//         }
//       );

//       return;
//     }

//     // -------------------------------------------------------
//     // COMPLETED
//     //
//     // Nothing to navigate to. The card is informational.
//     // -------------------------------------------------------

//     if (workflowStatus === 'completed') {
//       return;
//     }

//     // -------------------------------------------------------
//     // FALLBACK
//     //
//     // If the backend introduces another active replacement
//     // state, keep the user inside the replacement workflow.
//     // -------------------------------------------------------

//     navigation.navigate(
//       'ReplacementRequestStatus',
//       {
//         scheduleId,
//         requestId,
//         source: workflow.source,
//         group: workflow.group,
//       }
//     );
//   };

//   // ---------------------------------------------------------
//   // REPLACEMENT CONTENT
//   // ---------------------------------------------------------

//   const getReplacementContent = () => {
//     switch (replacementStatus) {
//       case 'waiting_for_cleaners':
//         return {
//           icon: 'clock-outline',
//           title: 'Waiting for Cleaner',
//           subtitle:
//             'Waiting for cleaner responses',
//           clickable: true,
//         };

//       case 'cleaner_available':
//         return {
//           icon: 'account-check-outline',
//           title: 'Replacement Ready',
//           subtitle:
//             'A replacement cleaner is available',
//           clickable: true,
//         };

//       case 'payment_required':
//         return {
//           icon: 'credit-card-outline',
//           title: 'Complete Replacement Payment',
//           subtitle:
//             'Payment is required to confirm the replacement',
//           clickable: true,
//         };

//       case 'completed':
//         return {
//           icon: 'check-circle-outline',
//           title: 'Replacement Complete',
//           subtitle:
//             'Your replacement has been confirmed',
//           clickable: false,
//         };

//       default:
//         return {
//           icon: 'account-switch-outline',
//           title: 'Replacement',
//           subtitle:
//             'Replacement workflow in progress',
//           clickable: true,
//         };
//     }
//   };

//   const replacementContent =
//     getReplacementContent();

//   // ---------------------------------------------------------
//   // REPLACEMENT CARD STYLE
//   // ---------------------------------------------------------

//   const isPaymentRequired =
//     replacementStatus === 'payment_required';

//   const isCompleted =
//     replacementStatus === 'completed';

//   // ---------------------------------------------------------
//   // RENDER
//   // ---------------------------------------------------------

//   return (
//     <View>
//       <View style={styles.container}>

//         {/* ================================================= */}
//         {/* DATE / TIME */}
//         {/* ================================================= */}

//         <View style={styles.date_time}>
//           <Text style={styles.date}>
//             {moment(
//               item.schedule.cleaning_date
//             ).format('ddd MMM DD')}
//           </Text>

//           <Text style={styles.time}>
//             {moment(
//               item.schedule.cleaning_time,
//               'h:mm:ss A'
//             ).format('h:mm A')}
//           </Text>
//         </View>

//         {/* ================================================= */}
//         {/* TIMELINE */}
//         {/* ================================================= */}

//         <View style={styles.dotline}>
//           <View style={styles.dot} />
//           <View style={styles.line} />
//         </View>

//         {/* ================================================= */}
//         {/* SCHEDULE DETAILS */}
//         {/* ================================================= */}

//         <View style={styles.task_details}>

//           <Text style={styles.task}>
//             {item.schedule.apartment_name}
//           </Text>

//           <Text style={styles.apartment}>
//             {item.schedule.address}
//           </Text>

//           <Chip
//             mode="flat"
//             style={styles.activeChip}
//             textStyle={styles.text}
//           >
//             {`${currency}${Number(
//               item.schedule.total_cleaning_fee || 0
//             ).toFixed(2)}`}
//           </Chip>

//           {/* ================================================= */}
//           {/* HOST */}
//           {/* ================================================= */}

//           {userType === 'host' ? (
//             <View style={styles.action}>

//               {/* ============================================= */}
//               {/* REPLACEMENT WORKFLOW CARD */}
//               {/* ============================================= */}

//               {hasReplacementWorkflow && (
//                 <TouchableOpacity
//                   activeOpacity={
//                     replacementContent.clickable
//                       ? 0.75
//                       : 1
//                   }
//                   disabled={
//                     !replacementContent.clickable
//                   }
//                   onPress={() => {
//                     if (
//                       replacementContent.clickable
//                     ) {
//                       handleReplacementWorkflow(
//                         replacementWorkflow
//                       );
//                     }
//                   }}
//                   style={[
//                     styles.replacementCard,

//                     isPaymentRequired &&
//                       styles.replacementPaymentCard,

//                     isCompleted &&
//                       styles.replacementCompletedCard,
//                   ]}
//                 >

//                   {/* ICON */}

//                   <View
//                     style={[
//                       styles.replacementIconContainer,

//                       isPaymentRequired &&
//                         styles.replacementPaymentIcon,

//                       isCompleted &&
//                         styles.replacementCompletedIcon,
//                     ]}
//                   >
//                     <MaterialCommunityIcons
//                       name={
//                         replacementContent.icon
//                       }
//                       size={20}
//                       color={
//                         isCompleted
//                           ? COLORS.gray
//                           : COLORS.primary
//                       }
//                     />
//                   </View>

//                   {/* TEXT */}

//                   <View
//                     style={
//                       styles.replacementTextContainer
//                     }
//                   >
//                     <Text
//                       style={[
//                         styles.replacementTitle,

//                         isCompleted &&
//                           styles.replacementCompletedTitle,
//                       ]}
//                       numberOfLines={1}
//                     >
//                       {
//                         replacementContent.title
//                       }
//                     </Text>

//                     <Text
//                       style={[
//                         styles.replacementSubtitle,

//                         isCompleted &&
//                           styles.replacementCompletedSubtitle,
//                       ]}
//                       numberOfLines={2}
//                     >
//                       {
//                         replacementContent.subtitle
//                       }
//                     </Text>
//                   </View>

//                   {/* CHEVRON */}

//                   {replacementContent.clickable && (
//                     <MaterialCommunityIcons
//                       name="chevron-right"
//                       size={22}
//                       color={COLORS.gray}
//                       style={
//                         styles.replacementChevron
//                       }
//                     />
//                   )}

//                 </TouchableOpacity>
//               )}

//               {/* ============================================= */}
//               {/* NORMAL SCHEDULE ACTIONS */}
//               {/* ============================================= */}

//               {(item.status === 'pending_payment' ||
//                 item.status === 'upcoming' ||
//                 item.status === 'payment_confirmed' ||
//                 item.status === 'open') ? (

//                 <View
//                   style={
//                     styles.normalActions
//                   }
//                 >

//                   {/* VIEW SCHEDULE */}

//                   <TouchableOpacity
//                     onPress={() =>
//                       navigation.navigate(
//                         ROUTES.host_schedule_details,
//                         {
//                           scheduleId:
//                             item._id,
//                         }
//                       )
//                     }
//                   >
//                     <Text style={styles.details}>
//                       {tSafe(
//                         'view_schedule',
//                         'View schedule'
//                       )}
//                     </Text>
//                   </TouchableOpacity>

//                   {/* ======================================= */}
//                   {/* EDIT SCHEDULE */}
//                   {/* ======================================= */}

//                   {!hasAnyCleanerClockedIn &&
//                     !hasReplacementWorkflow && (
//                       <TouchableOpacity
//                         onPress={() =>
//                           handleEdit(
//                             true,
//                             item
//                           )
//                         }
//                       >
//                         <Text
//                           style={
//                             styles.details
//                           }
//                         >
//                           {tSafe(
//                             'edit_schedule',
//                             'Edit schedule'
//                           )}
//                         </Text>
//                       </TouchableOpacity>
//                     )}

//                 </View>

//               ) : (

//                 <TouchableOpacity
//                   onPress={() =>
//                     navigation.navigate(
//                       ROUTES.host_schedule_details,
//                       {
//                         scheduleId:
//                           item._id,
//                       }
//                     )
//                   }
//                 >
//                   <Text style={styles.details}>
//                     {tSafe(
//                       'view_schedule',
//                       'View schedule'
//                     )}
//                   </Text>
//                 </TouchableOpacity>

//               )}

//             </View>

//           ) : (

//             /* ================================================= */
//             /* CLEANER */
//             /* ================================================= */

//             <View style={styles.action}>

//               {item.status === 'open' ? (

//                 <TouchableOpacity
//                   onPress={() =>
//                     navigation.navigate(
//                       ROUTES.cleaner_schedule_details,
//                       {
//                         item: item.item,
//                       }
//                     )
//                   }
//                 >
//                   <Text style={styles.details}>
//                     {tSafe(
//                       'view_details',
//                       'View Details'
//                     )}
//                   </Text>
//                 </TouchableOpacity>

//               ) : (

//                 <>
//                   {!isCancelled && (
//                     <TouchableOpacity
//                       onPress={() =>
//                         navigation.navigate(
//                           ROUTES.cleaner_clock_in,
//                           {
//                             scheduleId:
//                               item._id,

//                             schedule:
//                               item,

//                             cleaner:
//                               assignedToForCleaner,
//                           }
//                         )
//                       }
//                     >
//                       <Text
//                         style={
//                           styles.clockin
//                         }
//                       >
//                         {tSafe(
//                           'clock_in',
//                           'Clock-In'
//                         )}
//                       </Text>
//                     </TouchableOpacity>
//                   )}
//                 </>

//               )}

//             </View>

//           )}

//         </View>
//       </View>
//     </View>
//   );
// };

// // ===========================================================
// // STYLES
// // ===========================================================

// const styles = StyleSheet.create({

//   container: {
//     flexDirection: 'row',
//     marginBottom: 10,
//     marginTop: 15,
//   },

//   // ---------------------------------------------------------
//   // Timeline
//   // ---------------------------------------------------------

//   dotline: {
//     flex: 0.05,
//     height: '100%',
//     alignItems: 'flex-start',
//   },

//   line: {
//     borderLeftWidth: 0.7,
//     borderLeftColor: COLORS.light_gray,
//     minHeight: 78,
//     marginHorizontal: 5,
//     marginVertical: 0,
//   },

//   dot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: COLORS.primary,
//     marginBottom: 5,
//   },

//   // ---------------------------------------------------------
//   // Date / Time
//   // ---------------------------------------------------------

//   date_time: {
//     flex: 0.25,
//     alignItems: 'flex-end',
//     marginRight: 5,
//   },

//   date: {
//     marginTop: -4,
//     fontSize: 14,
//     fontWeight: '500',
//   },

//   time: {
//     marginTop: 4,
//     fontSize: 12,
//   },

//   // ---------------------------------------------------------
//   // Schedule
//   // ---------------------------------------------------------

//   task_details: {
//     flex: 0.7,
//     alignItems: 'flex-start',
//     width: '100%',
//     marginTop: -5,
//   },

//   task: {
//     fontWeight: '500',
//   },

//   apartment: {
//     color: COLORS.gray,
//     fontSize: 13,
//     marginBottom: 5,
//   },

//   activeChip: {
//     backgroundColor:
//       COLORS.primary_light_1,
//     borderRadius: 50,
//   },

//   text: {
//     fontWeight: '400',
//   },

//   // ---------------------------------------------------------
//   // Actions
//   // ---------------------------------------------------------

//   action: {
//     width: '100%',
//     marginTop: 7,
//     marginBottom: 5,
//   },

//   normalActions: {
//     flexDirection: 'row',
//     width: '85%',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 4,
//   },

//   details: {
//     fontSize: 14,
//     color: COLORS.primary,
//     textDecorationLine: 'underline',
//   },

//   clockin: {
//     fontSize: 14,
//     marginLeft: 20,
//     color: COLORS.primary,
//     fontWeight: 'bold',
//   },

//   // ---------------------------------------------------------
//   // Replacement Card
//   // ---------------------------------------------------------

//   replacementCard: {
//     width: '100%',
//     flexDirection: 'row',
//     alignItems: 'center',

//     backgroundColor: '#F8FAFC',

//     borderWidth: 1,
//     borderColor: '#E2E8F0',

//     borderRadius: 12,

//     paddingVertical: 11,
//     paddingHorizontal: 11,

//     marginTop: 7,
//     marginBottom: 8,
//   },

//   replacementPaymentCard: {
//     backgroundColor:
//       COLORS.primary_light_1,

//     borderColor:
//       COLORS.primary,
//   },

//   replacementCompletedCard: {
//     backgroundColor: '#F5F5F5',
//     borderColor: '#E2E2E2',
//   },

//   // ---------------------------------------------------------
//   // Replacement Icon
//   // ---------------------------------------------------------

//   replacementIconContainer: {
//     width: 40,
//     height: 40,

//     borderRadius: 10,

//     alignItems: 'center',
//     justifyContent: 'center',

//     backgroundColor: '#E8EEF5',
//   },

//   replacementPaymentIcon: {
//     backgroundColor: '#FFFFFF',
//   },

//   replacementCompletedIcon: {
//     backgroundColor: '#E9E9E9',
//   },

//   // ---------------------------------------------------------
//   // Replacement Text
//   // ---------------------------------------------------------

//   replacementTextContainer: {
//     flex: 1,
//     marginLeft: 11,
//     paddingRight: 5,
//   },

//   replacementTitle: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: '#1F2937',
//     marginBottom: 2,
//   },

//   replacementSubtitle: {
//     fontSize: 12,
//     lineHeight: 17,
//     color: '#64748B',
//   },

//   replacementCompletedTitle: {
//     color: '#6B7280',
//   },

//   replacementCompletedSubtitle: {
//     color: '#9CA3AF',
//   },

//   replacementChevron: {
//     marginLeft: 4,
//   },
// });

// export default UpcomingScheduleListItem;




import React, { useContext } from 'react';

import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {
  Chip,
} from 'react-native-paper';

import {
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import moment from 'moment';

import ROUTES from '../../constants/routes';

import {
  useNavigation,
} from '@react-navigation/native';

import {
  useBookingContext,
} from '../../context/BookingContext';

import {
  AuthContext,
} from '../../context/AuthContext';

import {
  tSafe,
} from '../../utils/tSafe';

import {
  AppText,
} from '../../ui';

import {
  useTheme,
} from '../../theme';

const UpcomingScheduleListItem = ({
  item,
  currency,
  replacementWorkflows = [],
}) => {
  const navigation =
    useNavigation();

  const {
    theme,
  } = useTheme();

  const styles =
    createStyles(theme);

  const {
    userType,
    currentUserId,
  } = useContext(AuthContext);

  const {
    handleEdit,
  } = useBookingContext();

  const assignedToForCleaner =
    item.assignedTo?.find(
      (cleaner) =>
        cleaner.cleanerId ===
        currentUserId
    );

  // ---------------------------------------------------------
  // CANCELLATION STATUS
  // ---------------------------------------------------------

  const isScheduleCancelled =
    item.status?.toLowerCase() ===
    'cancelled';

  const isUserAssignmentCancelled =
    assignedToForCleaner?.status?.toLowerCase() ===
    'cancelled';

  const isCancelled =
    isScheduleCancelled ||
    isUserAssignmentCancelled;

  // ---------------------------------------------------------
  // CLOCK-IN STATUS
  // ---------------------------------------------------------

  const hasAnyCleanerClockedIn =
    item.assignedTo?.some(
      (cleaner) =>
        cleaner.clockedIn === true ||
        cleaner.clockInTime != null
    ) || false;

  // ---------------------------------------------------------
  // REPLACEMENT WORKFLOWS
  // ---------------------------------------------------------

  const activeReplacementWorkflows =
    Array.isArray(
      replacementWorkflows
    )
      ? replacementWorkflows.filter(
          (workflow) =>
            workflow?.status &&
            workflow.status !==
              'completed'
        )
      : [];

  const completedReplacementWorkflows =
    Array.isArray(
      replacementWorkflows
    )
      ? replacementWorkflows.filter(
          (workflow) =>
            workflow?.status ===
            'completed'
        )
      : [];

  /**
   * Prioritize active workflows.
   * If there are no active workflows,
   * show the completed one.
   */
  const replacementWorkflow =
    activeReplacementWorkflows[0] ||
    completedReplacementWorkflows[0] ||
    null;

  const hasReplacementWorkflow =
    replacementWorkflow !== null;

  const replacementStatus =
    replacementWorkflow?.status ||
    null;


    console.log('[REPLACEMENT CARD DEBUG]', {
      scheduleId: item?._id,
      replacementWorkflows,
      activeReplacementWorkflows,
      completedReplacementWorkflows,
      replacementWorkflow,
      hasReplacementWorkflow,
    });

  // ---------------------------------------------------------
  // REPLACEMENT NAVIGATION
  // ---------------------------------------------------------

  const handleReplacementWorkflow = (workflow) => {
    if (!workflow) {
      console.warn(
        '[REPLACEMENT] No replacement workflow supplied'
      );
      return;
    }
  
    const scheduleId = String(item._id);
  
    // The requestId must identify the parent replacement event.
    const requestId = workflow.requestId
      ? String(workflow.requestId)
      : workflow.workflowId
        ? String(workflow.workflowId)
        : null;
  
    const workflowStatus = workflow.status;
    const workflowSource = workflow.source || null;
  
    console.log(
      '[REPLACEMENT] Opening workflow:',
      {
        scheduleId,
        requestId,
        status: workflowStatus,
        source: workflowSource,
        flow: workflow.flow,
        group: workflow.group,
      }
    );
  
    if (!requestId) {
      console.warn(
        '[REPLACEMENT] Missing replacement event ID:',
        workflow
      );
      return;
    }
  
    // -------------------------------------------------------
    // HOST REMOVAL / REPLACEMENT REQUIRED
    // -------------------------------------------------------
  
    if (workflowStatus === 'replacement_required') {
      console.log(
        '[REPLACEMENT] Opening cleaner selection screen:',
        {
          scheduleId,
          requestId,
          source: workflowSource,
        }
      );
  
      navigation.navigate(
        ROUTES.host_replacement_cleaner,
        {
          scheduleId,
          requestId,
  
          cleanerId:
            workflow.cleanerId ||
            workflow.unavailableCleaner?.cleanerId ||
            workflow.originalCleanerId ||
            null,
  
          source: workflowSource,
          group: workflow.group,
  
          oldCleaningDate:
            workflow.oldCleaningDate ||
            workflow.old_cleaning_date ||
            null,
  
          newCleaningDate:
            workflow.newCleaningDate ||
            workflow.new_cleaning_date ||
            null,
  
          oldCleaningTime:
            workflow.oldCleaningTime ||
            workflow.old_cleaning_time ||
            null,
  
          newCleaningTime:
            workflow.newCleaningTime ||
            workflow.new_cleaning_time ||
            null,
  
          propertyName:
            workflow.propertyName ||
            workflow.property_name ||
            null,
        }
      );
  
      return;
    }
  
    console.log('[REPLACEMENT NAVIGATION DEBUG]', {
      scheduleId,
      requestId,
      workflowStatus,
      source: workflowSource,
      route: ROUTES.host_replacement_request_status,
      workflow,
    });
    // -------------------------------------------------------
    // WAITING FOR CLEANERS
    // -------------------------------------------------------
  
    if (workflowStatus === 'waiting_for_cleaners') {
      navigation.navigate(
        ROUTES.host_replacement_request_status,
        {
          scheduleId,
          requestId,
          source: workflowSource,
          group: workflow.group,
        }
      );
  
      return;
    }
  
    // -------------------------------------------------------
    // REPLACEMENT CLEANER AVAILABLE
    // -------------------------------------------------------
  
    if (workflowStatus === 'cleaner_available') {
      navigation.navigate(
        ROUTES.host_replacement_request_status,
        {
          scheduleId,
          requestId,
          source: workflowSource,
          group: workflow.group,
        }
      );
  
      return;
    }
  
    // -------------------------------------------------------
    // PAYMENT REQUIRED
    // -------------------------------------------------------
  
    if (workflowStatus === 'payment_required') {
      const selectedCleaner = workflow.selectedCleaner;
  
      if (
        !selectedCleaner?.requestId ||
        !selectedCleaner?.cleanerId
      ) {
        console.warn(
          '[REPLACEMENT] Payment required but selected cleaner is missing:',
          workflow
        );
  
        navigation.navigate(
          ROUTES.host_replacement_request_status,
          {
            scheduleId,
            requestId,
            source: workflowSource,
            group: workflow.group,
          }
        );
  
        return;
      }
  
      const selectedRequest = workflow.requests?.find(
        (request) =>
          String(request.requestId) ===
          String(selectedCleaner.requestId)
      );
  
      navigation.navigate(
        'ReplacementPayment',
        {
          scheduleId,
          requestId,
  
          replacementRequestId: String(
            selectedCleaner.requestId
          ),
  
          cleanerId: String(
            selectedCleaner.cleanerId
          ),
  
          cleanerName:
            selectedRequest?.cleanerName ||
            selectedRequest?.name ||
            '',
  
          replacedCleanerId:
            workflow.unavailableCleaner?.cleanerId ||
            workflow.originalCleanerId ||
            workflow.cleanerId ||
            null,
  
          replacedCleanerName:
            workflow.unavailableCleaner?.name ||
            workflow.originalCleanerName ||
            null,
  
          oldCleaningDate:
            workflow.oldCleaningDate ||
            workflow.old_cleaning_date ||
            null,
  
          newCleaningDate:
            workflow.newCleaningDate ||
            workflow.new_cleaning_date ||
            null,
  
          oldCleaningTime:
            workflow.oldCleaningTime ||
            workflow.old_cleaning_time ||
            null,
  
          newCleaningTime:
            workflow.newCleaningTime ||
            workflow.new_cleaning_time ||
            null,
  
          cleaningTime:
            workflow.cleaningTime ||
            workflow.cleaning_time ||
            null,
  
          propertyName:
            workflow.propertyName ||
            workflow.property_name ||
            null,
  
          group: workflow.group,
          source: workflowSource,
        }
      );
  
      return;
    }
  
    // -------------------------------------------------------
    // COMPLETED
    // -------------------------------------------------------
  
    if (workflowStatus === 'completed') {
      return;
    }
  
    // -------------------------------------------------------
    // UNKNOWN STATUS
    // -------------------------------------------------------
  
    console.warn(
      '[REPLACEMENT] Unhandled workflow status:',
      {
        workflowStatus,
        workflow,
      }
    );
  };

  // const handleReplacementWorkflow =
  //   (workflow) => {
  //     if (!workflow) {
  //       console.warn(
  //         '[REPLACEMENT] No replacement workflow supplied'
  //       );
  //       return;
  //     }

  //     const scheduleId =
  //       String(item._id);

  //     const requestId =
  //       workflow.requestId
  //         ? String(
  //             workflow.requestId
  //           )
  //         : null;

  //     const workflowStatus =
  //       workflow.status;

  //     console.log(
  //       '[REPLACEMENT] Opening workflow:',
  //       {
  //         scheduleId,
  //         requestId,
  //         status:
  //           workflowStatus,
  //         source:
  //           workflow.source,
  //         group:
  //           workflow.group,
  //       }
  //     );

  //     if (!requestId) {
  //       console.warn(
  //         '[REPLACEMENT] Missing parent replacement requestId:',
  //         workflow
  //       );

  //       return;
  //     }

  //     // -------------------------------------------------------
  //     // WAITING FOR CLEANERS
  //     // -------------------------------------------------------

  //     if (
  //       workflowStatus ===
  //       'waiting_for_cleaners'
  //     ) {
  //       navigation.navigate(
  //         'ReplacementRequestStatus',
  //         {
  //           scheduleId,
  //           requestId,
  //           source:
  //             workflow.source,
  //           group:
  //             workflow.group,
  //         }
  //       );

  //       return;
  //     }

  //     // -------------------------------------------------------
  //     // REPLACEMENT CLEANER AVAILABLE
  //     // -------------------------------------------------------

  //     if (
  //       workflowStatus ===
  //       'cleaner_available'
  //     ) {
  //       navigation.navigate(
  //         'ReplacementRequestStatus',
  //         {
  //           scheduleId,
  //           requestId,
  //           source:
  //             workflow.source,
  //           group:
  //             workflow.group,
  //         }
  //       );

  //       return;
  //     }

  //     // -------------------------------------------------------
  //     // PAYMENT REQUIRED
  //     // -------------------------------------------------------

  //     if (
  //       workflowStatus ===
  //       'payment_required'
  //     ) {
  //       const selectedCleaner =
  //         workflow.selectedCleaner;

  //       if (
  //         !selectedCleaner?.requestId ||
  //         !selectedCleaner?.cleanerId
  //       ) {
  //         console.warn(
  //           '[REPLACEMENT] Payment required but selected cleaner is missing:',
  //           workflow
  //         );

  //         navigation.navigate(
  //           'ReplacementRequestStatus',
  //           {
  //             scheduleId,
  //             requestId,
  //             source:
  //               workflow.source,
  //             group:
  //               workflow.group,
  //           }
  //         );

  //         return;
  //       }

  //       const selectedRequest =
  //         workflow.requests?.find(
  //           (request) =>
  //             String(
  //               request.requestId
  //             ) ===
  //             String(
  //               selectedCleaner.requestId
  //             )
  //         );

  //       navigation.navigate(
  //         'ReplacementPayment',
  //         {
  //           scheduleId,

  //           requestId,

  //           replacementRequestId:
  //             String(
  //               selectedCleaner.requestId
  //             ),

  //           cleanerId:
  //             String(
  //               selectedCleaner.cleanerId
  //             ),

  //           cleanerName:
  //             selectedRequest?.cleanerName ||
  //             selectedRequest?.name ||
  //             '',

  //           replacedCleanerId:
  //             workflow
  //               ?.unavailableCleaner
  //               ?.cleanerId ||
  //             workflow?.originalCleanerId ||
  //             null,

  //           replacedCleanerName:
  //             workflow
  //               ?.unavailableCleaner
  //               ?.name ||
  //             workflow?.originalCleanerName ||
  //             null,

  //           oldCleaningDate:
  //             workflow.oldCleaningDate,

  //           newCleaningDate:
  //             workflow.newCleaningDate,

  //           oldCleaningTime:
  //             workflow.oldCleaningTime ||
  //             null,

  //           newCleaningTime:
  //             workflow.newCleaningTime ||
  //             null,

  //           cleaningTime:
  //             workflow.cleaningTime,

  //           propertyName:
  //             workflow.propertyName,

  //           group:
  //             workflow.group,

  //           source:
  //             workflow.source ||
  //             null,
  //         }
  //       );

  //       return;
  //     }

  //     // -------------------------------------------------------
  //     // COMPLETED
  //     // -------------------------------------------------------

  //     if (
  //       workflowStatus ===
  //       'completed'
  //     ) {
  //       return;
  //     }

  //     // -------------------------------------------------------
  //     // FALLBACK
  //     // -------------------------------------------------------

  //     navigation.navigate(
  //       'ReplacementRequestStatus',
  //       {
  //         scheduleId,
  //         requestId,
  //         source:
  //           workflow.source,
  //         group:
  //           workflow.group,
  //       }
  //     );
  //   };

  // ---------------------------------------------------------
  // REPLACEMENT CONTENT
  // ---------------------------------------------------------

  const getReplacementContent =
    () => {
      switch (
        replacementStatus
      ) {
        case 'replacement_required':
        return {
          icon: 'account-search-outline',
          title: 'Find Replacement Cleaner',
          subtitle: 'Select cleaners to replace the removed cleaner',
          clickable: true,
        };
        case 'waiting_for_cleaners':
          return {
            icon:
              'clock-outline',

            title:
              'Waiting for Cleaner',

            subtitle:
              'Waiting for cleaner responses',

            clickable: true,
          };

        case 'cleaner_available':
          return {
            icon:
              'account-check-outline',

            title:
              'Replacement Ready',

            subtitle:
              'A replacement cleaner is available',

            clickable: true,
          };

        case 'payment_required':
          return {
            icon:
              'credit-card-outline',

            title:
              'Complete Replacement Payment',

            subtitle:
              'Payment is required to confirm the replacement',

            clickable: true,
          };

        case 'completed':
          return {
            icon:
              'check-circle-outline',

            title:
              'Replacement Complete',

            subtitle:
              'Your replacement has been confirmed',

            clickable: false,
          };

        default:
          return {
            icon:
              'account-switch-outline',

            title:
              'Replacement',

            subtitle:
              'Replacement workflow in progress',

            clickable: true,
          };
      }
    };

  const replacementContent =
    getReplacementContent();

  const isPaymentRequired =
    replacementStatus ===
    'payment_required';

  const isCompleted =
    replacementStatus ===
    'completed';

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

  return (
    <View>
      <View style={styles.container}>

        {/* ================================================= */}
        {/* DATE / TIME */}
        {/* ================================================= */}

        <View
          style={styles.date_time}
        >
          <AppText
            variant="bodyMedium"
            style={styles.date}
          >
            {moment(
              item.schedule
                .cleaning_date
            ).format(
              'ddd MMM DD'
            )}
          </AppText>

          <AppText
            variant="caption"
            style={styles.time}
          >
            {moment(
              item.schedule
                .cleaning_time,
              'h:mm:ss A'
            ).format(
              'h:mm A'
            )}
          </AppText>
        </View>

        {/* ================================================= */}
        {/* TIMELINE */}
        {/* ================================================= */}

        <View
          style={styles.dotline}
        >
          <View
            style={styles.dot}
          />

          <View
            style={styles.line}
          />
        </View>

        {/* ================================================= */}
        {/* SCHEDULE DETAILS */}
        {/* ================================================= */}

        <View
          style={styles.task_details}
        >
          <AppText
            variant="bodyMedium"
            style={styles.task}
          >
            {
              item.schedule
                .apartment_name
            }
          </AppText>

          <AppText
            variant="caption"
            style={styles.apartment}
          >
            {
              item.schedule
                .address
            }
          </AppText>

          <Chip
            mode="flat"
            style={styles.activeChip}
            textStyle={
              styles.chipText
            }
          >
            {`${currency}${Number(
              item.schedule
                .total_cleaning_fee ||
                0
            ).toFixed(2)}`}
          </Chip>

          {/* ================================================= */}
          {/* HOST */}
          {/* ================================================= */}

          {userType ===
          'host' ? (
            <View
              style={
                styles.action
              }
            >

              {/* ============================================= */}
              {/* REPLACEMENT WORKFLOW */}
              {/* ============================================= */}

              {hasReplacementWorkflow && (
                <TouchableOpacity
                  activeOpacity={
                    replacementContent.clickable
                      ? 0.75
                      : 1
                  }
                  disabled={
                    !replacementContent.clickable
                  }
                  onPress={() => {
                    if (
                      replacementContent.clickable
                    ) {
                      handleReplacementWorkflow(
                        replacementWorkflow
                      );
                    }
                  }}
                  style={[
                    styles.replacementCard,

                    isPaymentRequired &&
                      styles.replacementPaymentCard,

                    isCompleted &&
                      styles.replacementCompletedCard,
                  ]}
                >

                  {/* ICON */}

                  <View
                    style={[
                      styles.replacementIconContainer,

                      isPaymentRequired &&
                        styles.replacementPaymentIcon,

                      isCompleted &&
                        styles.replacementCompletedIcon,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        replacementContent.icon
                      }
                      size={20}
                      color={
                        isCompleted
                          ? theme.icon.muted
                          : theme.brand.primary
                      }
                    />
                  </View>

                  {/* TEXT */}

                  <View
                    style={
                      styles.replacementTextContainer
                    }
                  >
                    <AppText
                      variant="label"
                      numberOfLines={1}
                      style={[
                        styles.replacementTitle,

                        isCompleted &&
                          styles.replacementCompletedTitle,
                      ]}
                    >
                      {
                        replacementContent.title
                      }
                    </AppText>

                    <AppText
                      variant="caption"
                      numberOfLines={2}
                      style={[
                        styles.replacementSubtitle,

                        isCompleted &&
                          styles.replacementCompletedSubtitle,
                      ]}
                    >
                      {
                        replacementContent.subtitle
                      }
                    </AppText>
                  </View>

                  {/* CHEVRON */}

                  {replacementContent.clickable && (
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={22}
                      color={
                        theme.icon.muted
                      }
                      style={
                        styles.replacementChevron
                      }
                    />
                  )}
                </TouchableOpacity>
              )}

              {/* ============================================= */}
              {/* NORMAL SCHEDULE ACTIONS */}
              {/* ============================================= */}

              {(
                item.status ===
                  'pending_payment' ||
                item.status ===
                  'upcoming' ||
                item.status ===
                  'payment_confirmed' ||
                item.status === 'open'
              ) ? (
                <View
                  style={
                    styles.normalActions
                  }
                >

                  {/* VIEW SCHEDULE */}

                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate(
                        ROUTES.host_schedule_details,
                        {
                          scheduleId:
                            item._id,
                        }
                      )
                    }
                  >
                    <AppText
                      variant="label"
                      style={
                        styles.details
                      }
                    >
                      {tSafe(
                        'view_schedule',
                        'View schedule'
                      )}
                    </AppText>
                  </TouchableOpacity>

                  {/* EDIT SCHEDULE */}

                  {!hasAnyCleanerClockedIn &&
                    !hasReplacementWorkflow && (
                      <TouchableOpacity
                        onPress={() =>
                          handleEdit(
                            true,
                            item
                          )
                        }
                      >
                        <AppText
                          variant="label"
                          style={
                            styles.details
                          }
                        >
                          {tSafe(
                            'edit_schedule',
                            'Edit schedule'
                          )}
                        </AppText>
                      </TouchableOpacity>
                    )}
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(
                      ROUTES.host_schedule_details,
                      {
                        scheduleId:
                          item._id,
                      }
                    )
                  }
                >
                  <AppText
                    variant="label"
                    style={
                      styles.details
                    }
                  >
                    {tSafe(
                      'view_schedule',
                      'View schedule'
                    )}
                  </AppText>
                </TouchableOpacity>
              )}
            </View>
          ) : (

            /* ================================================= */
            /* CLEANER */
            /* ================================================= */

            <View
              style={
                styles.action
              }
            >
              {item.status ===
              'open' ? (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(
                      ROUTES.cleaner_schedule_details,
                      {
                        item:
                          item.item,
                      }
                    )
                  }
                >
                  <AppText
                    variant="label"
                    style={
                      styles.details
                    }
                  >
                    {tSafe(
                      'view_details',
                      'View Details'
                    )}
                  </AppText>
                </TouchableOpacity>
              ) : (
                <>
                  {!isCancelled && (
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate(
                          ROUTES.cleaner_clock_in,
                          {
                            scheduleId:
                              item._id,

                            schedule:
                              item,

                            cleaner:
                              assignedToForCleaner,
                          }
                        )
                      }
                    >
                      <AppText
                        variant="label"
                        style={
                          styles.clockin
                        }
                      >
                        {tSafe(
                          'clock_in',
                          'Clock-In'
                        )}
                      </AppText>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

// ===========================================================
// STYLES
// ===========================================================

const createStyles = (
  theme
) =>
  StyleSheet.create({

    // -------------------------------------------------------
    // Container
    // -------------------------------------------------------

    container: {
      flexDirection: 'row',
      marginBottom: 10,
      marginTop: 15,
    },

    // -------------------------------------------------------
    // Timeline
    // -------------------------------------------------------

    dotline: {
      flex: 0.05,
      height: '100%',
      alignItems:
        'flex-start',
    },

    line: {
      borderLeftWidth: 0.7,

      borderLeftColor:
        theme.border.default,

      minHeight: 78,

      marginHorizontal: 5,
      marginVertical: 0,
    },

    dot: {
      width: 10,
      height: 10,

      borderRadius: 5,

      backgroundColor:
        theme.brand.primary,

      marginBottom: 5,
    },

    // -------------------------------------------------------
    // Date / Time
    // -------------------------------------------------------

    date_time: {
      flex: 0.25,
      alignItems: 'flex-end',
      marginRight: 5,
    },

    date: {
      marginTop: -4,
    },

    time: {
      marginTop: 4,
    },

    // -------------------------------------------------------
    // Schedule
    // -------------------------------------------------------

    task_details: {
      flex: 0.7,
      alignItems:
        'flex-start',

      width: '100%',

      marginTop: -5,
    },

    task: {
      fontWeight: '500',
    },

    apartment: {
      marginBottom: 5,
    },

    // -------------------------------------------------------
    // Price chip
    // -------------------------------------------------------

    activeChip: {
      backgroundColor:
        theme.brand.primaryLight,

      borderRadius: 50,

      borderWidth: 1,

      borderColor:
        `${theme.brand.primary}25`,
    },

    chipText: {
      color:
        theme.text.primary,

      fontWeight: '500',
    },

    // -------------------------------------------------------
    // Actions
    // -------------------------------------------------------

    action: {
      width: '100%',
      marginTop: 7,
      marginBottom: 5,
    },

    normalActions: {
      flexDirection: 'row',

      width: '85%',

      justifyContent:
        'space-between',

      alignItems: 'center',

      marginTop: 4,
    },

    details: {
      color:
        theme.brand.primary,

      textDecorationLine:
        'underline',
    },

    clockin: {
      marginLeft: 20,

      color:
        theme.brand.primary,

      fontWeight: '700',
    },

    // -------------------------------------------------------
    // Replacement Card
    // -------------------------------------------------------

    replacementCard: {
      width: '100%',

      flexDirection: 'row',

      alignItems: 'center',

      backgroundColor:
        theme.surface.elevated,

      borderWidth: 1,

      borderColor:
        theme.border.default,

      borderRadius: 12,

      paddingVertical: 11,
      paddingHorizontal: 11,

      marginTop: 7,
      marginBottom: 8,
    },

    replacementPaymentCard: {
      backgroundColor:
        theme.surface.selected,

      borderColor:
        theme.brand.primary,
    },

    replacementCompletedCard: {
      backgroundColor:
        theme.background.sunken,

      borderColor:
        theme.border.default,
    },

    // -------------------------------------------------------
    // Replacement Icon
    // -------------------------------------------------------

    replacementIconContainer: {
      width: 40,
      height: 40,

      borderRadius: 10,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        theme.background.sunken,
    },

    replacementPaymentIcon: {
      backgroundColor:
        theme.surface.elevated,
    },

    replacementCompletedIcon: {
      backgroundColor:
        theme.background.sunken,
    },

    // -------------------------------------------------------
    // Replacement Text
    // -------------------------------------------------------

    replacementTextContainer: {
      flex: 1,

      marginLeft: 11,

      paddingRight: 5,
    },

    replacementTitle: {
      marginBottom: 2,
    },

    replacementSubtitle: {
      lineHeight: 17,
    },

    replacementCompletedTitle: {
      color:
        theme.text.muted,
    },

    replacementCompletedSubtitle: {
      color:
        theme.text.disabled,
    },

    replacementChevron: {
      marginLeft: 4,
    },
  });

export default UpcomingScheduleListItem;