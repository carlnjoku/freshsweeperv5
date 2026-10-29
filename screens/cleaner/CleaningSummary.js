// import React, {
//   useState,
//   useContext,
// } from 'react';

// import {
//   View,
//   StyleSheet,
//   Modal,
//   ScrollView,
// } from 'react-native';

// import {
//   Button,
//   Card,
// } from 'react-native-paper';

// import { AuthContext } from '../../context/AuthContext';
// import { MaterialIcons } from '@expo/vector-icons';
// import GroupActions from '../../components/cleaner/GroupActions';
// import { minutesToDuration } from '../../utils/minuteToDuration';
// import TermsConditions from './TermsConditions';
// import { tSafe } from '../../utils/tSafe';
// import { useTheme } from '../../theme';
// import AppText from '../../ui/AppText';

// export default function CleaningSummary({
//   schedule_status,
//   checklist,
//   assignedTo,
//   handleAccept,
//   isEditable = true,
// }) {
//   const { currency } = useContext(AuthContext);
//   const { theme } = useTheme();

//   const [modalVisible, setModalVisible] = useState(false);

//   const [
//     acceptModalVisible,
//     setAcceptModalVisible,
//   ] = useState(false);

//   const [selectedGroup, setSelectedGroup] = useState(null);

//   const styles = createStyles(theme);

//   console.log('Checklistoooo', checklist);

//   // ============================================================
//   // GROUP LABEL
//   // ============================================================

//   const getGroupLabel = (
//     groupKey,
//     totalGroups
//   ) => {
//     if (totalGroups === 1) {
//       return tSafe(
//         'full_cleaning',
//         'Full Cleaning'
//       );
//     }

//     if (!groupKey) {
//       return tSafe(
//         'cleaner_team',
//         'Cleaner Team'
//       );
//     }

//     const parts = String(groupKey).split('_');

//     const groupIdentifier =
//       parts.length > 1
//         ? parts[parts.length - 1]
//         : groupKey;

//     const teamIdentifier =
//       String(groupIdentifier).charAt(0).toUpperCase() +
//       String(groupIdentifier).slice(1);

//     return `${tSafe(
//       'cleaner_team',
//       'Cleaner Team'
//     )} ${teamIdentifier}`;
//   };

//   // ============================================================
//   // PROCESS CHECKLIST
//   // ============================================================

//   const processChecklistData = (
//     checklist,
//     assignedTo = []
//   ) => {
//     try {
//       const groups = [];

//       if (
//         !checklist ||
//         typeof checklist !== 'object'
//       ) {
//         return groups;
//       }

//       const totalGroups =
//         Object.keys(checklist).length;

//       for (const groupKey in checklist) {
//         if (
//           !Object.prototype.hasOwnProperty.call(
//             checklist,
//             groupKey
//           )
//         ) {
//           continue;
//         }

//         const group = checklist[groupKey];

//         if (
//           typeof group !== 'object' ||
//           group === null
//         ) {
//           continue;
//         }

//         const roomTypes = {};

//         const rooms = Array.isArray(group.rooms)
//           ? group.rooms
//           : [];

//         const details =
//           typeof group.details === 'object' &&
//           group.details !== null
//             ? group.details
//             : {};

//         // ======================================================
//         // Count rooms by type
//         // ======================================================

//         rooms.forEach((room) => {
//           if (typeof room === 'string') {
//             const roomType = room.split('_')[0];

//             roomTypes[roomType] =
//               (roomTypes[roomType] || 0) + 1;
//           }
//         });

//         // ======================================================
//         // Count total tasks
//         // ======================================================

//         let taskCount = 0;

//         for (const roomType in details) {
//           if (
//             !Object.prototype.hasOwnProperty.call(
//               details,
//               roomType
//             )
//           ) {
//             continue;
//           }

//           if (
//             roomType !== 'Extra' &&
//             details[roomType] &&
//             typeof details[roomType] === 'object' &&
//             Array.isArray(details[roomType].tasks)
//           ) {
//             taskCount += details[roomType].tasks.length;
//           }
//         }

//         // ======================================================
//         // Add extras
//         // ======================================================

//         if (
//           details.Extra &&
//           typeof details.Extra === 'object' &&
//           Array.isArray(details.Extra.tasks)
//         ) {
//           taskCount += details.Extra.tasks.filter(
//             (task) => task && task.value
//           ).length;
//         }

//         // ======================================================
//         // Find matching assignedTo entry
//         // ======================================================

//         const assignedInfo =
//           assignedTo.find(
//             (assignment) =>
//               assignment?.group === groupKey
//           ) || {};

//         // ======================================================
//         // Build group
//         // ======================================================

//         groups.push({
//           name: groupKey,

//           groupLabel: getGroupLabel(
//             groupKey,
//             totalGroups
//           ),

//           taskCount,

//           roomCount: rooms.length,

//           roomTypes,

//           price:
//             typeof group.price === 'number'
//               ? group.price
//               : 0,

//           extras: Array.isArray(group.extras)
//             ? group.extras
//             : [],

//           details,

//           totalTime:
//             typeof group.totalTime === 'number'
//               ? group.totalTime
//               : 0,

//           rooms,

//           status:
//             assignedInfo.status || 'open',

//           cleanerId:
//             assignedInfo.cleanerId || null,
//         });
//       }

//       return groups;
//     } catch (error) {
//       console.error(
//         'Error processing checklist data:',
//         error
//       );

//       return [];
//     }
//   };

//   // ============================================================
//   // SUMMARY DATA
//   // ============================================================

//   const summaryData = processChecklistData(
//     checklist,
//     assignedTo
//   );

//   console.log(
//     'Summary data',
//     JSON.stringify(summaryData, null, 2)
//   );

//   console.log('AssignedTo', assignedTo);

//   // ============================================================
//   // DETAILS MODAL
//   // ============================================================

//   const openModal = (group) => {
//     setSelectedGroup(group);
//     setModalVisible(true);
//   };

//   // ============================================================
//   // ACCEPT MODAL
//   // ============================================================

//   const openAcceptModal = (group) => {
//     setSelectedGroup(group);
//     setAcceptModalVisible(true);
//   };

//   // ============================================================
//   // CONFIRM ACCEPT
//   // ============================================================

//   const handleAcceptConfirm = (group) => {
//     console.log('Accepted:', group.name);

//     const acceptance = 1;

//     handleAccept(
//       group,
//       acceptance
//     );

//     setAcceptModalVisible(false);
//   };

//   // ============================================================
//   // DECLINE
//   // ============================================================

//   const handleDecline = (group) => {
//     console.log('Declined:', group.name);

//     const acceptance = 0;

//     handleAccept(
//       group,
//       acceptance
//     );
//   };

//   // ============================================================
//   // RULES / PENALTIES
//   // ============================================================

//   const renderRulesAndPenaltiesContent = () => (
//     <TermsConditions />
//   );

//   // ============================================================
//   // ROOM TYPES
//   // ============================================================

//   const formatRoomTypes = (roomTypes) => {
//     if (
//       !roomTypes ||
//       typeof roomTypes !== 'object'
//     ) {
//       return tSafe(
//         'no_rooms',
//         'No rooms'
//       );
//     }

//     return Object.entries(roomTypes)
//       .map(
//         ([type, count]) =>
//           `${count} ${type}${
//             count > 1 ? 's' : ''
//           }`
//       )
//       .join(', ');
//   };

//   // ============================================================
//   // ROOM COUNTS
//   // ============================================================

//   const formatRoomCounts = (rooms) => {
//     const roomCounts = {};

//     if (!Array.isArray(rooms)) {
//       return tSafe(
//         'no_rooms',
//         'No rooms'
//       );
//     }

//     rooms.forEach((room) => {
//       if (typeof room !== 'string') {
//         return;
//       }

//       const roomType = room.split('_')[0];

//       roomCounts[roomType] =
//         (roomCounts[roomType] || 0) + 1;
//     });

//     return Object.entries(roomCounts)
//       .map(
//         ([type, count]) =>
//           `${count} ${type}${
//             count > 1 ? 's' : ''
//           }`
//       )
//       .join(', ');
//   };

//   // ============================================================
//   // TASK ITEM
//   // ============================================================

//   const renderTaskItem = (task) => (
//     <View
//       key={task.id}
//       style={styles.taskItem}
//     >
//       <MaterialIcons
//         name="fiber-manual-record"
//         size={10}
//         color={theme.brand.primary}
//       />

//       <AppText style={styles.taskText}>
//         {task.label}
//       </AppText>
//     </View>
//   );

//   // ============================================================
//   // ROOM TASKS
//   // ============================================================

//   const renderRoomTasks = (
//     roomData,
//     roomType
//   ) => {
//     const tasks = roomData.tasks || [];

//     const halfIndex = Math.ceil(
//       tasks.length / 2
//     );

//     const leftColumn = tasks.slice(
//       0,
//       halfIndex
//     );

//     const rightColumn = tasks.slice(
//       halfIndex
//     );

//     return (
//       <View
//         style={styles.twoColumnContainer}
//       >
//         <View style={styles.column}>
//           {leftColumn.map((task) =>
//             renderTaskItem(task)
//           )}
//         </View>

//         <View style={styles.column}>
//           {rightColumn.map((task) =>
//             renderTaskItem(task)
//           )}
//         </View>
//       </View>
//     );
//   };

//   // ============================================================
//   // DETAILS MODAL CONTENT
//   // ============================================================

//   const renderModalContent = () => {
//     if (!selectedGroup) {
//       return null;
//     }

//     return (
//       <View style={styles.modalContainer}>
//         {/* Modal Header */}

//         <View style={styles.modalHeader}>
//           <AppText style={styles.modalTitle}>
//             {selectedGroup.groupLabel}
//             {' - '}
//             {tSafe(
//               'details',
//               'Details'
//             )}
//           </AppText>

//           <Button
//             icon="close"
//             onPress={() =>
//               setModalVisible(false)
//             }
//             style={styles.closeButton}
//             textColor={theme.text.primary}
//           />
//         </View>

//         {/* Modal Content */}

//         <ScrollView style={styles.modalContent}>
//           <View style={styles.modalSection}>
//             {/* Overview */}

//             <AppText style={styles.sectionTitle}>
//               {tSafe(
//                 'overview',
//                 'Overview'
//               )}
//             </AppText>

//             {/* Total Time */}

//             <View style={styles.infoRow}>
//               <AppText style={styles.infoLabel}>
//                 {tSafe(
//                   'total_time',
//                   'Total Time:'
//                 )}
//               </AppText>

//               <AppText style={styles.infoValue}>
//                 {selectedGroup.totalTime}{' '}
//                 {tSafe(
//                   'minutes',
//                   'minutes'
//                 )}
//               </AppText>
//             </View>

//             {/* Price */}

//             <View style={styles.infoRow}>
//               <AppText style={styles.infoLabel}>
//                 {tSafe(
//                   'price',
//                   'Price:'
//                 )}
//               </AppText>

//               <AppText style={styles.totalFee}>
//                 {currency}
//                 {selectedGroup.price.toFixed(2)}
//               </AppText>
//             </View>

//             {/* Rooms and Tasks */}

//             <AppText style={styles.sectionTitle}>
//               {tSafe(
//                 'rooms_tasks',
//                 'Rooms & Tasks'
//               )}
//             </AppText>

//             <View style={styles.groupContainer}>
//               {/* Group Header */}

//               <View style={styles.groupHeader}>
//                 <AppText style={styles.groupTitle}>
//                   {selectedGroup.groupLabel}
//                 </AppText>

//                 <View style={styles.groupPriceTime}>
//                   <View style={styles.timeBadge}>
//                     <AppText style={styles.timeText}>
//                       {selectedGroup.totalTime}{' '}
//                       {tSafe(
//                         'mins',
//                         'mins'
//                       )}
//                     </AppText>
//                   </View>

//                   <View style={styles.priceBadge}>
//                     <AppText style={styles.priceText}>
//                       {currency}
//                       {selectedGroup.price.toFixed(2)}
//                     </AppText>
//                   </View>
//                 </View>
//               </View>

//               {/* Rooms */}

//               <View style={styles.infoRow}>
//                 <AppText style={styles.infoLabel}>
//                   {tSafe(
//                     'rooms',
//                     'Rooms:'
//                   )}
//                 </AppText>

//                 <AppText style={styles.infoValue}>
//                   {formatRoomCounts(
//                     selectedGroup.rooms
//                   )}
//                 </AppText>
//               </View>

//               {/* Extras */}

//               {selectedGroup.extras &&
//                 selectedGroup.extras.length > 0 && (
//                   <View style={styles.infoRow}>
//                     <AppText style={styles.infoLabel}>
//                       {tSafe(
//                         'extras',
//                         'Extras:'
//                       )}
//                     </AppText>

//                     <AppText style={styles.infoValue}>
//                       {selectedGroup.extras.join(', ')}
//                     </AppText>
//                   </View>
//                 )}

//               {/* Room Tasks */}

//               {Object.entries(
//                 selectedGroup.details
//               ).map(
//                 ([roomType, roomData]) => {
//                   if (
//                     !roomData.tasks ||
//                     !Array.isArray(
//                       roomData.tasks
//                     )
//                   ) {
//                     return null;
//                   }

//                   return (
//                     <View
//                       key={roomType}
//                       style={styles.roomTasks}
//                     >
//                       <AppText style={styles.roomTitle}>
//                         {roomType}:
//                       </AppText>

//                       {renderRoomTasks(
//                         roomData,
//                         roomType
//                       )}
//                     </View>
//                   );
//                 }
//               )}
//             </View>
//           </View>
//         </ScrollView>
//       </View>
//     );
//   };

//   // ============================================================
//   // EMPTY STATE
//   // ============================================================

//   if (summaryData.length === 0) {
//     return (
//       <View style={styles.emptyState}>
//         <MaterialIcons
//           name="cleaning-services"
//           size={48}
//           color={theme.icon.muted}
//         />

//         <AppText style={styles.emptyStateText}>
//           {tSafe(
//             'no_cleaning_tasks',
//             'No cleaning tasks available'
//           )}
//         </AppText>
//       </View>
//     );
//   }

//   // ============================================================
//   // RENDER
//   // ============================================================

//   return (
//     <View style={styles.container}>
//       {/* ====================================================== */}
//       {/* HEADER */}
//       {/* ====================================================== */}

//       <AppText style={styles.header}>
//         {tSafe(
//           'available_cleaning_tasks',
//           'Available Cleaning Tasks'
//         )}
//       </AppText>

//       <AppText style={styles.subheader}>
//         {summaryData.length === 1
//           ? tSafe(
//               'complete_cleaning_assignment',
//               'Complete cleaning assignment'
//             )
//           : tSafe(
//               'tasks_assigned_to_different_cleaners',
//               'Tasks have been assigned to different cleaner teams for efficiency'
//             )}
//       </AppText>

//       {/* ====================================================== */}
//       {/* GROUP CARDS */}
//       {/* ====================================================== */}

//       {summaryData.map((item) => (
//         <Card
//           key={item.name}
//           style={styles.card}
//         >
//           <Card.Content>
//             {/* ================================================= */}
//             {/* CARD HEADER */}
//             {/* ================================================= */}

//             <View style={styles.cardHeader}>
//               <AppText style={styles.groupName}>
//                 {item.groupLabel}
//               </AppText>

//               <AppText style={styles.price}>
//                 {currency}
//                 {item.price.toFixed(2)}
//               </AppText>
//             </View>

//             {/* ================================================= */}
//             {/* STATS */}
//             {/* ================================================= */}

//             <View style={styles.statsRow}>
//               {/* Tasks */}

//               <View style={styles.stat}>
//                 <MaterialIcons
//                   name="list"
//                   size={16}
//                   color={theme.brand.primary}
//                 />

//                 <AppText style={styles.statText}>
//                   {item.taskCount}{' '}
//                   {tSafe(
//                     'tasks',
//                     'tasks'
//                   )}
//                 </AppText>
//               </View>

//               {/* Rooms */}

//               <View style={styles.stat}>
//                 <MaterialIcons
//                   name="home"
//                   size={16}
//                   color={theme.brand.primary}
//                 />

//                 <AppText style={styles.statText}>
//                   {item.roomCount}{' '}
//                   {tSafe(
//                     'rooms',
//                     'rooms'
//                   )}
//                 </AppText>
//               </View>

//               {/* Time */}

//               <View style={styles.stat}>
//                 <MaterialIcons
//                   name="access-time"
//                   size={16}
//                   color={theme.brand.primary}
//                 />

//                 <AppText style={styles.statText}>
//                   {minutesToDuration(
//                     item.totalTime
//                   )}
//                 </AppText>
//               </View>
//             </View>

//             {/* ================================================= */}
//             {/* DESCRIPTION */}
//             {/* ================================================= */}

//             <AppText style={styles.description}>
//               {tSafe(
//                 'includes_cleaning_of',
//                 'Includes cleaning of'
//               )}{' '}
//               {formatRoomTypes(
//                 item.roomTypes
//               )}

//               {item.extras.length > 0
//                 ? `${tSafe(
//                     'plus',
//                     ', plus '
//                   )}${item.extras.join(', ')}`
//                 : ''}
//               .
//             </AppText>

//             {/* ================================================= */}
//             {/* ACTIONS */}
//             {/* ================================================= */}

//             <View style={styles.buttonRow}>
//               <GroupActions
//                 status={item?.status}
//                 schedule_status={
//                   schedule_status
//                 }
//                 onAccept={() =>
//                   openAcceptModal(item)
//                 }
//                 onDecline={() =>
//                   handleDecline(item)
//                 }
//                 onDetails={() =>
//                   openModal(item)
//                 }
//                 disabled={!isEditable}
//               />
//             </View>
//           </Card.Content>
//         </Card>
//       ))}

//       {/* ====================================================== */}
//       {/* DETAILS MODAL */}
//       {/* ====================================================== */}

//       <Modal
//         visible={modalVisible}
//         transparent
//         animationType="slide"
//         onRequestClose={() =>
//           setModalVisible(false)
//         }
//       >
//         <View style={styles.modalOverlay}>
//           {renderModalContent()}
//         </View>
//       </Modal>

//       {/* ====================================================== */}
//       {/* ACCEPT RULES MODAL */}
//       {/* ====================================================== */}

//       <Modal
//         visible={acceptModalVisible}
//         transparent
//         animationType="slide"
//         onRequestClose={() =>
//           setAcceptModalVisible(false)
//         }
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.rulesModalContainer}>
//             {/* Rules Header */}

//             <View style={styles.rulesModalHeader}>
//               <AppText style={styles.rulesModalTitle}>
//                 {tSafe(
//                   'accept_cleaning_task',
//                   'Accept Cleaning Task'
//                 )}
//               </AppText>

//               <Button
//                 icon="close"
//                 onPress={() =>
//                   setAcceptModalVisible(false)
//                 }
//                 style={styles.closeButton}
//                 textColor={theme.text.primary}
//               />
//             </View>

//             {/* Terms */}

//             {renderRulesAndPenaltiesContent()}

//             {/* Footer */}

//             <View style={styles.rulesModalFooter}>
//               <Button
//                 mode="outlined"
//                 onPress={() =>
//                   setAcceptModalVisible(false)
//                 }
//                 style={[
//                   styles.rulesButton,
//                   styles.cancelButton,
//                 ]}
//                 labelStyle={
//                   styles.cancelButtonText
//                 }
//               >
//                 {tSafe(
//                   'cancel',
//                   'Cancel'
//                 )}
//               </Button>

//               <Button
//                 mode="contained"
//                 onPress={() =>
//                   handleAcceptConfirm(
//                     selectedGroup
//                   )
//                 }
//                 style={[
//                   styles.rulesButton,
//                   styles.agreeButton,
//                 ]}
//                 labelStyle={
//                   styles.agreeButtonText
//                 }
//               >
//                 {tSafe(
//                   'i_agree_and_accept',
//                   'I Agree & Accept'
//                 )}
//               </Button>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// // ============================================================
// // STYLES
// // ============================================================

// const createStyles = (theme) =>
//   StyleSheet.create({
//     container: {
//       flex: 1,
//       padding: 1,
//       backgroundColor:
//         theme.background.default,
//     },

//     header: {
//       fontSize: 20,
//       fontWeight: '700',
//       marginBottom: 4,
//       color: theme.text.primary,
//     },

//     subheader: {
//       fontSize: 14,
//       marginBottom: 20,
//       color: theme.text.secondary,
//       lineHeight: 20,
//     },

//     card: {
//       marginBottom: 16,
//       borderRadius: 12,
//       backgroundColor:
//         theme.card.background,
//       borderWidth: 1,
//       borderColor:
//         theme.card.border,
//       elevation: 1,
//       shadowColor:
//         theme.shadow?.color || '#000000',
//       shadowOffset: {
//         width: 0,
//         height: 2,
//       },
//       shadowOpacity:
//         theme.shadow?.opacity ?? 0.05,
//       shadowRadius: 1,
//     },

//     cardHeader: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       marginBottom: 16,
//     },

//     groupName: {
//       fontSize: 18,
//       fontWeight: '600',
//       color: theme.text.primary,
//     },

//     price: {
//       fontSize: 18,
//       fontWeight: '700',
//       color: theme.brand.primary,
//     },

//     statsRow: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       marginBottom: 16,
//       paddingHorizontal: 4,
//     },

//     stat: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },

//     statText: {
//       marginLeft: 6,
//       fontSize: 14,
//       color: theme.text.secondary,
//     },

//     description: {
//       fontSize: 14,
//       color: theme.text.primary,
//       marginBottom: 20,
//       lineHeight: 20,
//     },

//     buttonRow: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//     },

//     button: {
//       flex: 1,
//       marginHorizontal: 4,
//     },

//     acceptButton: {
//       backgroundColor:
//         theme.button.primaryBackground,
//     },

//     declineButton: {
//       borderColor:
//         theme.border.default,
//     },

//     acceptButtonText: {
//       color:
//         theme.button.primaryText,
//       fontWeight: '600',
//     },

//     declineButtonText: {
//       color: theme.text.secondary,
//       fontWeight: '600',
//     },

//     detailsButtonText: {
//       color: theme.brand.primary,
//       fontWeight: '600',
//     },

//     emptyState: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//       padding: 40,
//       backgroundColor:
//         theme.background.default,
//     },

//     emptyStateText: {
//       fontSize: 16,
//       color: theme.text.secondary,
//       marginTop: 16,
//       textAlign: 'center',
//     },

//     // ========================================================
//     // DETAILS MODAL
//     // ========================================================

//     modalOverlay: {
//       flex: 1,
//       backgroundColor:
//         theme.overlay,
//       justifyContent: 'center',
//       alignItems: 'center',
//       padding: 20,
//     },

//     modalContainer: {
//       backgroundColor:
//         theme.surface.elevated,
//       borderRadius: 16,
//       width: '100%',
//       maxHeight: '80%',
//       overflow: 'hidden',
//       borderWidth: 1,
//       borderColor:
//         theme.border.default,
//     },

//     modalHeader: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       padding: 20,
//       borderBottomWidth: 1,
//       borderBottomColor:
//         theme.divider,
//     },

//     modalTitle: {
//       fontSize: 20,
//       fontWeight: '700',
//       color: theme.text.primary,
//       flex: 1,
//     },

//     closeButton: {
//       margin: -10,
//     },

//     modalContent: {
//       padding: 20,
//     },

//     modalSection: {
//       marginBottom: 16,
//     },

//     sectionTitle: {
//       fontSize: 18,
//       fontWeight: '600',
//       marginBottom: 16,
//       color: theme.text.primary,
//     },

//     infoRow: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       marginBottom: 12,
//     },

//     infoLabel: {
//       fontSize: 15,
//       color: theme.text.secondary,
//       flexShrink: 1,
//     },

//     infoValue: {
//       fontSize: 15,
//       fontWeight: '500',
//       color: theme.text.primary,
//       flexShrink: 1,
//       textAlign: 'right',
//       marginLeft: 12,
//     },

//     totalFee: {
//       fontSize: 16,
//       fontWeight: '700',
//       color: theme.brand.primary,
//     },

//     groupContainer: {
//       backgroundColor:
//         theme.surface.selected,
//       borderRadius: 12,
//       padding: 16,
//       marginBottom: 16,
//       borderWidth: 1,
//       borderColor:
//         theme.border.default,
//     },

//     groupHeader: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       marginBottom: 12,
//     },

//     groupTitle: {
//       fontSize: 16,
//       fontWeight: '600',
//       color: theme.text.primary,
//       flex: 1,
//     },

//     groupPriceTime: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: 8,
//     },

//     timeBadge: {
//       backgroundColor:
//         theme.status.info,
//       opacity: 0.15,
//       borderRadius: 8,
//       paddingVertical: 4,
//       paddingHorizontal: 10,
//     },

//     timeText: {
//       fontSize: 14,
//       fontWeight: '500',
//       color: theme.status.info,
//     },

//     priceBadge: {
//       backgroundColor:
//         theme.status.success,
//       opacity: 0.15,
//       borderRadius: 8,
//       paddingVertical: 4,
//       paddingHorizontal: 10,
//     },

//     priceText: {
//       fontSize: 14,
//       fontWeight: '500',
//       color: theme.status.success,
//     },

//     roomTasks: {
//       marginBottom: 16,
//     },

//     roomTitle: {
//       fontSize: 15,
//       fontWeight: '500',
//       marginBottom: 8,
//       color: theme.brand.primary,
//     },

//     twoColumnContainer: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       marginTop: 8,
//     },

//     column: {
//       width: '48%',
//     },

//     taskItem: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginBottom: 8,
//     },

//     taskText: {
//       fontSize: 14,
//       marginLeft: 8,
//       color: theme.text.primary,
//       flexShrink: 1,
//     },

//     modalFooter: {
//       padding: 20,
//       borderTopWidth: 1,
//       borderTopColor:
//         theme.divider,
//     },

//     modalActionButton: {
//       borderRadius: 12,
//       paddingVertical: 6,
//       backgroundColor:
//         theme.button.primaryBackground,
//     },

//     // ========================================================
//     // RULES MODAL
//     // ========================================================

//     rulesModalContainer: {
//       backgroundColor:
//         theme.surface.elevated,
//       borderRadius: 16,
//       width: '100%',
//       maxHeight: '85%',
//       overflow: 'hidden',
//       borderWidth: 1,
//       borderColor:
//         theme.border.default,
//     },

//     rulesModalHeader: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       padding: 20,
//       borderBottomWidth: 1,
//       borderBottomColor:
//         theme.divider,
//     },

//     rulesModalTitle: {
//       fontSize: 20,
//       fontWeight: '700',
//       color: theme.text.primary,
//       flex: 1,
//     },

//     rulesContent: {
//       padding: 20,
//       maxHeight: 400,
//     },

//     rulesTitle: {
//       fontSize: 22,
//       fontWeight: '700',
//       color: theme.brand.primary,
//       textAlign: 'center',
//       marginBottom: 20,
//     },

//     section: {
//       marginBottom: 20,
//       padding: 16,
//       backgroundColor:
//         theme.background.sunken,
//       borderRadius: 12,
//       borderLeftWidth: 4,
//       borderLeftColor:
//         theme.brand.primary,
//     },

//     rulesText: {
//       fontSize: 14,
//       lineHeight: 20,
//       color: theme.text.primary,
//     },

//     penaltyText: {
//       fontWeight: '600',
//       color: theme.status.error,
//     },

//     agreementSection: {
//       marginTop: 20,
//       padding: 16,
//       backgroundColor:
//         theme.status.info,
//       borderRadius: 12,
//       borderLeftWidth: 4,
//       borderLeftColor:
//         theme.status.info,
//     },

//     agreementText: {
//       fontSize: 14,
//       lineHeight: 20,
//       color: theme.text.primary,
//       fontStyle: 'italic',
//       textAlign: 'center',
//     },

//     rulesModalFooter: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       padding: 20,
//       borderTopWidth: 1,
//       borderTopColor:
//         theme.divider,
//       gap: 12,
//     },

//     rulesButton: {
//       flex: 1,
//       borderRadius: 12,
//       paddingVertical: 6,
//     },

//     cancelButton: {
//       borderColor:
//         theme.border.default,
//     },

//     cancelButtonText: {
//       color: theme.text.secondary,
//       fontWeight: '600',
//     },

//     agreeButton: {
//       backgroundColor:
//         theme.button.primaryBackground,
//     },

//     agreeButtonText: {
//       color:
//         theme.button.primaryText,
//       fontWeight: '600',
//     },
//   });




import React, {
  useState,
  useContext,
  useMemo,
} from 'react';

import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';

import {
  Button,
  Card,
} from 'react-native-paper';

import { AuthContext } from '../../context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';

import GroupActions from '../../components/cleaner/GroupActions';
import { minutesToDuration } from '../../utils/minuteToDuration';
import TermsConditions from './TermsConditions';
import { tSafe } from '../../utils/tSafe';

import { useTheme } from '../../theme';
import AppText from '../../ui/AppText';

// ============================================================
// HELPERS
// ============================================================

const safeNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const formatMoney = (value, currency) => {
  const amount = safeNumber(value);

  return `${currency || '$'}${amount.toFixed(2)}`;
};

const getTaskLabel = (task) => {
  if (typeof task === 'string') {
    return task.trim();
  }

  if (!task || typeof task !== 'object') {
    return '';
  }

  const value =
    task.label ??
    task.name ??
    task.value ??
    '';

  if (typeof value !== 'string' && typeof value !== 'number') {
    return '';
  }

  return String(value).trim();
};

const getRoomTypeLabel = (roomType) => {
  if (!roomType) {
    return '';
  }

  return String(roomType)
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
};

const withAlpha = (color, alpha, fallback) => {
  if (
    typeof color === 'string' &&
    /^#[0-9a-fA-F]{6}$/.test(color)
  ) {
    return `${color}${alpha}`;
  }

  return fallback || color;
};

// ============================================================
// COMPONENT
// ============================================================

export default function CleaningSummary({
  schedule_status,
  checklist,
  assignedTo,
  handleAccept,
  isEditable = true,
}) {
  const { currency } = useContext(AuthContext);
  const { theme } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);

  const [
    acceptModalVisible,
    setAcceptModalVisible,
  ] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState(null);

  const styles = useMemo(
    () => createStyles(theme),
    [theme]
  );

  // ==========================================================
  // GROUP LABEL
  // ==========================================================

  const getGroupLabel = (
    groupKey,
    totalGroups
  ) => {
    if (totalGroups === 1) {
      return tSafe(
        'full_cleaning',
        'Full Cleaning'
      );
    }

    if (!groupKey) {
      return tSafe(
        'cleaner_team',
        'Cleaner Team'
      );
    }

    const parts = String(groupKey).split('_');

    const groupIdentifier =
      parts.length > 1
        ? parts[parts.length - 1]
        : groupKey;

    const teamIdentifier =
      String(groupIdentifier).charAt(0).toUpperCase() +
      String(groupIdentifier).slice(1);

    return `${tSafe(
      'cleaner_team',
      'Cleaner Team'
    )} ${teamIdentifier}`;
  };

  // ==========================================================
  // PROCESS CHECKLIST
  // ==========================================================

  const processChecklistData = (
    checklistData,
    assignedCleaners = []
  ) => {
    try {
      if (
        !checklistData ||
        typeof checklistData !== 'object' ||
        Array.isArray(checklistData)
      ) {
        return [];
      }

      const groupEntries = Object.entries(
        checklistData
      ).filter(
        ([, group]) =>
          group &&
          typeof group === 'object' &&
          !Array.isArray(group)
      );

      const totalGroups = groupEntries.length;

      return groupEntries.map(
        ([groupKey, group]) => {
          const roomTypes = {};

          const rooms = Array.isArray(group.rooms)
            ? group.rooms
            : [];

          const details =
            group.details &&
            typeof group.details === 'object' &&
            !Array.isArray(group.details)
              ? group.details
              : {};

          // Count rooms by type.

          rooms.forEach((room) => {
            if (typeof room !== 'string') {
              return;
            }

            const roomType = room.split('_')[0];

            roomTypes[roomType] =
              (roomTypes[roomType] || 0) + 1;
          });

          // Count ordinary room tasks.

          let taskCount = 0;

          Object.entries(details).forEach(
            ([roomType, roomData]) => {
              if (
                roomType === 'Extra' ||
                !roomData ||
                typeof roomData !== 'object' ||
                !Array.isArray(roomData.tasks)
              ) {
                return;
              }

              taskCount += roomData.tasks.filter(
                (task) => Boolean(getTaskLabel(task))
              ).length;
            }
          );

          // Count additional tasks.

          if (
            details.Extra &&
            Array.isArray(details.Extra.tasks)
          ) {
            taskCount += details.Extra.tasks.filter(
              (task) => Boolean(getTaskLabel(task))
            ).length;
          }

          // Find cleaner assignment for this group.

          const assignedInfo =
            assignedCleaners.find(
              (assignment) =>
                assignment?.group === groupKey
            ) || {};

          return {
            name: groupKey,

            groupLabel: getGroupLabel(
              groupKey,
              totalGroups
            ),

            taskCount,

            roomCount: rooms.length,

            roomTypes,

            price: safeNumber(group.price),

            extras: Array.isArray(group.extras)
              ? group.extras
              : [],

            details,

            totalTime: safeNumber(
              group.totalTime
            ),

            rooms,

            status:
              assignedInfo.status || 'open',

            cleanerId:
              assignedInfo.cleanerId || null,
          };
        }
      );
    } catch (error) {
      console.error(
        'Error processing checklist data:',
        error
      );

      return [];
    }
  };

  // ==========================================================
  // SUMMARY DATA
  // ==========================================================

  const summaryData = useMemo(
    () =>
      processChecklistData(
        checklist,
        assignedTo
      ),
    [checklist, assignedTo]
  );

  // ==========================================================
  // DETAILS MODAL
  // ==========================================================

  const openModal = (group) => {
    setSelectedGroup(group);
    setModalVisible(true);
  };

  const closeDetailsModal = () => {
    setModalVisible(false);
  };

  // ==========================================================
  // ACCEPT MODAL
  // ==========================================================

  const openAcceptModal = (group) => {
    setSelectedGroup(group);
    setAcceptModalVisible(true);
  };

  const closeAcceptModal = () => {
    setAcceptModalVisible(false);
  };

  // ==========================================================
  // CONFIRM ACCEPT
  // ==========================================================

  const handleAcceptConfirm = (group) => {
    if (!group || typeof handleAccept !== 'function') {
      return;
    }

    console.log('Accepted:', group.name);

    handleAccept(group, 1);

    setAcceptModalVisible(false);
  };

  // ==========================================================
  // DECLINE
  // ==========================================================

  const handleDecline = (group) => {
    if (!group || typeof handleAccept !== 'function') {
      return;
    }

    console.log('Declined:', group.name);

    handleAccept(group, 0);
  };

  // ==========================================================
  // TERMS AND CONDITIONS
  // ==========================================================

  const renderRulesAndPenaltiesContent = () => (
    <TermsConditions />
  );

  // ==========================================================
  // ROOM TYPES
  // ==========================================================

  const formatRoomTypes = (roomTypes) => {
    if (
      !roomTypes ||
      typeof roomTypes !== 'object'
    ) {
      return tSafe(
        'no_rooms',
        'No rooms'
      );
    }

    const formatted = Object.entries(roomTypes)
      .filter(([, count]) => safeNumber(count) > 0)
      .map(([type, count]) => {
        const number = safeNumber(count);

        const label = getRoomTypeLabel(type);

        return `${number} ${label}${
          number === 1 ? '' : 's'
        }`;
      });

    return formatted.length > 0
      ? formatted.join(', ')
      : tSafe('no_rooms', 'No rooms');
  };

  // ==========================================================
  // ROOM COUNTS
  // ==========================================================

  const formatRoomCounts = (rooms) => {
    if (!Array.isArray(rooms) || rooms.length === 0) {
      return tSafe(
        'no_rooms',
        'No rooms'
      );
    }

    const roomCounts = {};

    rooms.forEach((room) => {
      if (typeof room !== 'string') {
        return;
      }

      const roomType = room.split('_')[0];

      roomCounts[roomType] =
        (roomCounts[roomType] || 0) + 1;
    });

    const formatted = Object.entries(roomCounts)
      .map(([type, count]) => {
        const label = getRoomTypeLabel(type);

        return `${count} ${label}${
          count === 1 ? '' : 's'
        }`;
      });

    return formatted.length > 0
      ? formatted.join(', ')
      : tSafe('no_rooms', 'No rooms');
  };

  // ==========================================================
  // ROOM TASK DATA
  // ==========================================================

  const getRoomEntries = (group) => {
    if (
      !group?.details ||
      typeof group.details !== 'object'
    ) {
      return [];
    }

    return Object.entries(group.details).filter(
      ([roomType, roomData]) =>
        roomType !== 'Extra' &&
        roomData &&
        typeof roomData === 'object' &&
        Array.isArray(roomData.tasks)
    );
  };

  const getExtraTasks = (group) => {
    const extraTasks = group?.details?.Extra?.tasks;

    if (!Array.isArray(extraTasks)) {
      return [];
    }

    return extraTasks.filter(
      (task) => Boolean(getTaskLabel(task))
    );
  };

  // ==========================================================
  // DETAILS MODAL CONTENT
  // ==========================================================

  const renderModalContent = () => {
    if (!selectedGroup) {
      return null;
    }

    const groupPrice = safeNumber(
      selectedGroup.price
    );

    const groupTime = safeNumber(
      selectedGroup.totalTime
    );

    const rooms = Array.isArray(
      selectedGroup.rooms
    )
      ? selectedGroup.rooms
      : [];

    const extras = Array.isArray(
      selectedGroup.extras
    )
      ? selectedGroup.extras
      : [];

    const roomEntries = getRoomEntries(
      selectedGroup
    );

    const extraTasks = getExtraTasks(
      selectedGroup
    );

    const totalTasks = roomEntries.reduce(
      (total, [, roomData]) =>
        total +
        roomData.tasks.filter(
          (task) => Boolean(getTaskLabel(task))
        ).length,
      0
    ) + extraTasks.length;

    return (
      <View style={styles.modalContainer}>
        {/* ================================================
            HEADER
        ================================================= */}

        <View style={styles.detailsHeader}>
          <View style={styles.detailsHeaderIcon}>
            <MaterialIcons
              name="cleaning-services"
              size={25}
              color={theme.brand.primary}
            />
          </View>

          <View style={styles.detailsHeaderText}>
            <AppText style={styles.detailsEyebrow}>
              {tSafe(
                'cleaning_assignment',
                'CLEANING ASSIGNMENT'
              )}
            </AppText>

            <AppText
              style={styles.modalTitle}
              numberOfLines={2}
            >
              {selectedGroup.groupLabel}
            </AppText>

            <AppText style={styles.detailsSubtitle}>
              {tSafe(
                'group_details_subtitle',
                'Review the assigned rooms and cleaning tasks'
              )}
            </AppText>
          </View>

          <TouchableOpacity
            onPress={closeDetailsModal}
            style={styles.closeIconButton}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={tSafe(
              'close_details',
              'Close details'
            )}
          >
            <MaterialIcons
              name="close"
              size={23}
              color={theme.icon.default}
            />
          </TouchableOpacity>
        </View>

        {/* ================================================
            SUMMARY METRICS
        ================================================= */}

        <View style={styles.detailsSummary}>
          {/* PRICE */}

          <View style={styles.summaryMetricCard}>
            <View style={styles.metricIcon}>
              <MaterialIcons
                name="payments"
                size={19}
                color={theme.status.success}
              />
            </View>

            <AppText style={styles.metricLabel}>
              {tSafe(
                'total_price',
                'TOTAL PRICE'
              )}
            </AppText>

            <AppText
              style={styles.metricValue}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatMoney(groupPrice, currency)}
            </AppText>
          </View>

          {/* DURATION */}

          <View style={styles.summaryMetricCard}>
            <View style={styles.metricIcon}>
              <MaterialIcons
                name="schedule"
                size={19}
                color={theme.status.info}
              />
            </View>

            <AppText style={styles.metricLabel}>
              {tSafe(
                'duration',
                'DURATION'
              )}
            </AppText>

            <AppText
              style={styles.metricValue}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {minutesToDuration(groupTime)}
            </AppText>
          </View>

          {/* ROOMS */}

          <View style={styles.summaryMetricCard}>
            <View style={styles.metricIcon}>
              <MaterialIcons
                name="meeting-room"
                size={19}
                color={theme.brand.primary}
              />
            </View>

            <AppText style={styles.metricLabel}>
              {tSafe(
                'rooms',
                'ROOMS'
              )}
            </AppText>

            <AppText style={styles.metricValue}>
              {rooms.length}
            </AppText>
          </View>

          {/* TASKS */}

          <View style={styles.summaryMetricCard}>
            <View style={styles.metricIcon}>
              <MaterialIcons
                name="checklist"
                size={19}
                color={theme.brand.secondary}
              />
            </View>

            <AppText style={styles.metricLabel}>
              {tSafe(
                'tasks',
                'TASKS'
              )}
            </AppText>

            <AppText style={styles.metricValue}>
              {totalTasks}
            </AppText>
          </View>
        </View>

        {/* ================================================
            SCROLLABLE CONTENT
        ================================================= */}

        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={
            styles.modalContentContainer
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* OVERVIEW */}

          <View style={styles.detailsSection}>
            <View style={styles.sectionHeading}>
              <View style={styles.sectionHeadingAccent} />

              <AppText style={styles.sectionTitle}>
                {tSafe(
                  'overview',
                  'Overview'
                )}
              </AppText>
            </View>

            <View style={styles.overviewCard}>
              {/* GROUP */}

              <View style={styles.overviewRow}>
                <View style={styles.overviewLabelContainer}>
                  <MaterialIcons
                    name="groups"
                    size={18}
                    color={theme.icon.muted}
                  />

                  <AppText style={styles.overviewLabel}>
                    {tSafe(
                      'cleaner_team',
                      'Cleaner team'
                    )}
                  </AppText>
                </View>

                <AppText style={styles.overviewValue}>
                  {selectedGroup.groupLabel}
                </AppText>
              </View>

              <View style={styles.overviewDivider} />

              {/* ROOMS */}

              <View style={styles.overviewRow}>
                <View style={styles.overviewLabelContainer}>
                  <MaterialIcons
                    name="meeting-room"
                    size={18}
                    color={theme.icon.muted}
                  />

                  <AppText style={styles.overviewLabel}>
                    {tSafe(
                      'rooms',
                      'Rooms'
                    )}
                  </AppText>
                </View>

                <AppText style={styles.overviewValue}>
                  {formatRoomCounts(rooms)}
                </AppText>
              </View>

              {/* EXTRAS */}

              {extras.length > 0 && (
                <>
                  <View style={styles.overviewDivider} />

                  <View style={styles.overviewRow}>
                    <View style={styles.overviewLabelContainer}>
                      <MaterialIcons
                        name="add-circle-outline"
                        size={18}
                        color={theme.icon.muted}
                      />

                      <AppText style={styles.overviewLabel}>
                        {tSafe(
                          'extras',
                          'Extras'
                        )}
                      </AppText>
                    </View>

                    <AppText style={styles.overviewValue}>
                      {extras.join(', ')}
                    </AppText>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* ROOM TASKS */}

          <View style={styles.detailsSection}>
            <View style={styles.sectionHeading}>
              <View style={styles.sectionHeadingAccent} />

              <View style={styles.roomSectionHeadingText}>
                <AppText style={styles.sectionTitle}>
                  {tSafe(
                    'rooms_tasks',
                    'Rooms & Tasks'
                  )}
                </AppText>

                <AppText style={styles.sectionSubtitle}>
                  {tSafe(
                    'room_tasks_description',
                    'Cleaning tasks included in this assignment'
                  )}
                </AppText>
              </View>

              <View style={styles.taskCountBadge}>
                <AppText style={styles.taskCountText}>
                  {totalTasks}
                </AppText>
              </View>
            </View>

            {roomEntries.length > 0 ? (
              roomEntries.map(
                ([roomType, roomData], index) => {
                  const tasks = roomData.tasks.filter(
                    (task) => Boolean(getTaskLabel(task))
                  );

                  return (
                    <View
                      key={roomType}
                      style={styles.roomTaskCard}
                    >
                      {/* ROOM HEADER */}

                      <View style={styles.roomTaskHeader}>
                        <View style={styles.roomTaskIcon}>
                          <MaterialIcons
                            name="home-work"
                            size={20}
                            color={theme.brand.primary}
                          />
                        </View>

                        <View style={styles.roomTaskHeadingText}>
                          <AppText
                            style={styles.roomTitle}
                          >
                            {getRoomTypeLabel(roomType)}
                          </AppText>

                          <AppText style={styles.roomTaskSubtitle}>
                            {tasks.length}{' '}
                            {tasks.length === 1
                              ? tSafe('task', 'task')
                              : tSafe('tasks', 'tasks')}
                          </AppText>
                        </View>

                        <View style={styles.roomNumberBadge}>
                          <AppText style={styles.roomNumberText}>
                            {String(index + 1).padStart(2, '0')}
                          </AppText>
                        </View>
                      </View>

                      {/* TASK LIST */}

                      <View style={styles.taskList}>
                        {tasks.length > 0 ? (
                          tasks.map(
                            (task, taskIndex) => (
                              <View
                                key={
                                  task?.id != null
                                    ? String(task.id)
                                    : `${roomType}-${taskIndex}`
                                }
                                style={[
                                  styles.taskItem,
                                  taskIndex ===
                                    tasks.length - 1 &&
                                    styles.lastTaskItem,
                                ]}
                              >
                                <View style={styles.taskBullet}>
                                  <MaterialIcons
                                    name="check"
                                    size={13}
                                    color={theme.brand.primary}
                                  />
                                </View>

                                <AppText style={styles.taskText}>
                                  {getTaskLabel(task)}
                                </AppText>
                              </View>
                            )
                          )
                        ) : (
                          <AppText style={styles.noTasksText}>
                            {tSafe(
                              'no_tasks_for_room',
                              'No tasks listed for this room'
                            )}
                          </AppText>
                        )}
                      </View>
                    </View>
                  );
                }
              )
            ) : (
              <View style={styles.noTasksCard}>
                <MaterialIcons
                  name="checklist"
                  size={30}
                  color={theme.icon.muted}
                />

                <AppText style={styles.noTasksText}>
                  {tSafe(
                    'no_room_tasks',
                    'No room tasks are available.'
                  )}
                </AppText>
              </View>
            )}
          </View>

          {/* ADDITIONAL TASKS */}

          {extraTasks.length > 0 && (
            <View style={styles.detailsSection}>
              <View style={styles.sectionHeading}>
                <View style={styles.sectionHeadingAccent} />

                <AppText style={styles.sectionTitle}>
                  {tSafe(
                    'additional_tasks',
                    'Additional Tasks'
                  )}
                </AppText>
              </View>

              <View style={styles.roomTaskCard}>
                {extraTasks.map(
                  (task, index) => (
                    <View
                      key={
                        task?.id != null
                          ? String(task.id)
                          : `extra-${index}`
                      }
                      style={[
                        styles.taskItem,
                        index === extraTasks.length - 1 &&
                          styles.lastTaskItem,
                      ]}
                    >
                      <View style={styles.taskBullet}>
                        <MaterialIcons
                          name="check"
                          size={13}
                          color={theme.brand.primary}
                        />
                      </View>

                      <AppText style={styles.taskText}>
                        {getTaskLabel(task)}
                      </AppText>
                    </View>
                  )
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* ================================================
            FIXED FOOTER
        ================================================= */}

        <View style={styles.detailsFooter}>
          <View style={styles.footerSummary}>
            <AppText style={styles.footerLabel}>
              {tSafe(
                'assignment_total',
                'Assignment total'
              )}
            </AppText>

            <AppText style={styles.footerPrice}>
              {formatMoney(groupPrice, currency)}
            </AppText>
          </View>

          <Button
            mode="contained"
            onPress={closeDetailsModal}
            style={styles.doneButton}
            contentStyle={styles.doneButtonContent}
            buttonColor={
              theme.button.primaryBackground
            }
            textColor={theme.button.primaryText}
            icon="check"
          >
            {tSafe(
              'done',
              'Done'
            )}
          </Button>
        </View>
      </View>
    );
  };

  // ==========================================================
  // EMPTY STATE
  // ==========================================================

  if (summaryData.length === 0) {
    return (
      <View style={styles.emptyState}>
        <MaterialIcons
          name="cleaning-services"
          size={48}
          color={theme.icon.muted}
        />

        <AppText style={styles.emptyStateText}>
          {tSafe(
            'no_cleaning_tasks',
            'No cleaning tasks available'
          )}
        </AppText>
      </View>
    );
  }

  // ==========================================================
  // MAIN RENDER
  // ==========================================================

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.pageHeader}>
        <View style={styles.pageHeaderIcon}>
          <MaterialIcons
            name="cleaning-services"
            size={23}
            color={theme.brand.primary}
          />
        </View>

        <View style={styles.pageHeaderText}>
          <AppText style={styles.header}>
            {tSafe(
              'available_cleaning_tasks',
              'Available Cleaning Tasks'
            )}
          </AppText>

          <AppText style={styles.subheader}>
            {summaryData.length === 1
              ? tSafe(
                  'complete_cleaning_assignment',
                  'Complete cleaning assignment'
                )
              : tSafe(
                  'tasks_assigned_to_different_cleaners',
                  'Tasks have been assigned to different cleaner teams for efficiency'
                )}
          </AppText>
        </View>
      </View>

      {/* GROUP CARDS */}

      {summaryData.map((item) => (
        <Card
          key={item.name}
          style={styles.card}
          mode="elevated"
        >
          <Card.Content style={styles.cardContent}>
            {/* CARD HEADER */}

            <View style={styles.cardHeader}>
              <View style={styles.groupIcon}>
                <MaterialIcons
                  name="groups"
                  size={22}
                  color={theme.brand.primary}
                />
              </View>

              <View style={styles.groupHeaderText}>
                <AppText style={styles.groupName}>
                  {item.groupLabel}
                </AppText>

                <AppText style={styles.groupSubtitle}>
                  {item.roomCount}{' '}
                  {tSafe('rooms', 'rooms')}
                  {' · '}
                  {item.taskCount}{' '}
                  {tSafe('tasks', 'tasks')}
                </AppText>
              </View>

              <AppText
                style={styles.price}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatMoney(item.price, currency)}
              </AppText>
            </View>

            {/* STATS */}

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <MaterialIcons
                  name="checklist"
                  size={17}
                  color={theme.brand.primary}
                />

                <AppText style={styles.statText}>
                  {item.taskCount}{' '}
                  {tSafe('tasks', 'tasks')}
                </AppText>
              </View>

              <View style={styles.stat}>
                <MaterialIcons
                  name="meeting-room"
                  size={17}
                  color={theme.brand.primary}
                />

                <AppText style={styles.statText}>
                  {item.roomCount}{' '}
                  {tSafe('rooms', 'rooms')}
                </AppText>
              </View>

              <View style={styles.stat}>
                <MaterialIcons
                  name="schedule"
                  size={17}
                  color={theme.brand.primary}
                />

                <AppText style={styles.statText}>
                  {minutesToDuration(item.totalTime)}
                </AppText>
              </View>
            </View>

            {/* DESCRIPTION */}

            <AppText style={styles.description}>
              {tSafe(
                'includes_cleaning_of',
                'Includes cleaning of'
              )}{' '}
              {formatRoomTypes(item.roomTypes)}

              {item.extras.length > 0
                ? `${tSafe(
                    'plus',
                    ', plus '
                  )}${item.extras.join(', ')}`
                : ''}
              .
            </AppText>

            {/* ACTIONS */}

            <View style={styles.buttonRow}>
              <GroupActions
                status={item.status}
                schedule_status={schedule_status}
                onAccept={() => openAcceptModal(item)}
                onDecline={() => handleDecline(item)}
                onDetails={() => openModal(item)}
                disabled={!isEditable}
              />
            </View>
          </Card.Content>
        </Card>
      ))}

      {/* ======================================================
          DETAILS MODAL
      ====================================================== */}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={closeDetailsModal}
      >
        <View style={styles.modalOverlay}>
          {renderModalContent()}
        </View>
      </Modal>

      {/* ======================================================
          ACCEPT RULES MODAL
      ====================================================== */}

      <Modal
        visible={acceptModalVisible}
        transparent
        animationType="slide"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={closeAcceptModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.rulesModalContainer}>
            {/* HEADER */}

            <View style={styles.rulesModalHeader}>
              <View style={styles.rulesHeaderIcon}>
                <MaterialIcons
                  name="verified-user"
                  size={23}
                  color={theme.brand.primary}
                />
              </View>

              <View style={styles.rulesHeaderText}>
                <AppText style={styles.rulesModalTitle}>
                  {tSafe(
                    'accept_cleaning_task',
                    'Accept Cleaning Task'
                  )}
                </AppText>

                <AppText style={styles.rulesModalSubtitle}>
                  {selectedGroup?.groupLabel || ''}
                </AppText>
              </View>

              <TouchableOpacity
                onPress={closeAcceptModal}
                style={styles.closeIconButton}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={tSafe(
                  'close',
                  'Close'
                )}
              >
                <MaterialIcons
                  name="close"
                  size={23}
                  color={theme.icon.default}
                />
              </TouchableOpacity>
            </View>

            {/* TERMS */}

            <View style={styles.rulesContent}>
              {renderRulesAndPenaltiesContent()}
            </View>

            {/* FOOTER */}

            <View style={styles.rulesModalFooter}>
              <Button
                mode="outlined"
                onPress={closeAcceptModal}
                style={styles.rulesButton}
                contentStyle={styles.rulesButtonContent}
                textColor={theme.text.secondary}
              >
                {tSafe(
                  'cancel',
                  'Cancel'
                )}
              </Button>

              <Button
                mode="contained"
                onPress={() =>
                  handleAcceptConfirm(selectedGroup)
                }
                disabled={!selectedGroup || !isEditable}
                style={styles.rulesButton}
                contentStyle={styles.rulesButtonContent}
                buttonColor={
                  theme.button.primaryBackground
                }
                textColor={theme.button.primaryText}
                icon="check"
              >
                {tSafe(
                  'i_agree_and_accept',
                  'I Agree & Accept'
                )}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ============================================================
// THEME-AWARE STYLES
// ============================================================

const createStyles = (theme) =>
  StyleSheet.create({
    // ========================================================
    // MAIN SCREEN
    // ========================================================

    container: {
      flex: 1,
      padding: 1,
      backgroundColor: theme.background.default,
    },

    pageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      gap: 12,
    },

    pageHeaderIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    pageHeaderText: {
      flex: 1,
      minWidth: 0,
    },

    header: {
      fontSize: 20,
      lineHeight: 27,
      fontWeight: '800',
      color: theme.text.primary,
    },

    subheader: {
      fontSize: 13,
      marginTop: 4,
      color: theme.text.secondary,
      lineHeight: 19,
    },

    // ========================================================
    // GROUP CARD
    // ========================================================

    card: {
      marginBottom: 16,
      borderRadius: 18,
      backgroundColor: theme.card.background,
      borderWidth: 1,
      borderColor: theme.card.border,
      elevation: 2,
      shadowColor: theme.shadow?.color || '#000000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: theme.shadow?.opacity ?? 0.08,
      shadowRadius: 8,
    },

    cardContent: {
      padding: 16,
    },

    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 10,
    },

    groupIcon: {
      width: 44,
      height: 44,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    groupHeaderText: {
      flex: 1,
      minWidth: 0,
    },

    groupName: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '800',
      color: theme.text.primary,
    },

    groupSubtitle: {
      fontSize: 12,
      lineHeight: 18,
      marginTop: 3,
      color: theme.text.secondary,
    },

    price: {
      fontSize: 17,
      fontWeight: '800',
      color: theme.brand.primary,
      flexShrink: 1,
    },

    // ========================================================
    // GROUP STATS
    // ========================================================

    statsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 12,
      marginBottom: 14,
      borderRadius: 13,
      backgroundColor: theme.background.sunken,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    stat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    statText: {
      fontSize: 12,
      color: theme.text.secondary,
      fontWeight: '600',
    },

    description: {
      fontSize: 13,
      lineHeight: 20,
      color: theme.text.secondary,
      marginBottom: 18,
    },

    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },

    // ========================================================
    // EMPTY STATE
    // ========================================================

    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      backgroundColor: theme.background.default,
    },

    emptyStateText: {
      fontSize: 15,
      lineHeight: 23,
      color: theme.text.secondary,
      marginTop: 16,
      textAlign: 'center',
    },

    // ========================================================
    // MODAL OVERLAY
    // ========================================================

    modalOverlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: Platform.OS === 'ios' ? 28 : 20,
    },

    // ========================================================
    // DETAILS MODAL CONTAINER
    // ========================================================

    modalContainer: {
      width: '100%',
      maxWidth: 560,
      height: '88%',
      maxHeight: 820,
      backgroundColor: theme.background.default,
      borderRadius: 24,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.border.default,
      shadowColor: theme.shadow?.color || '#000000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: theme.shadow?.opacity ?? 0.15,
      shadowRadius: 24,
      elevation: 12,
    },

    // ========================================================
    // DETAILS HEADER
    // ========================================================

    detailsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 18,
      paddingBottom: 17,
      backgroundColor: theme.surface.elevated,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
    },

    detailsHeaderIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
      borderWidth: 1,
      borderColor: theme.border.default,
      marginRight: 11,
    },

    detailsHeaderText: {
      flex: 1,
      minWidth: 0,
    },

    detailsEyebrow: {
      color: theme.brand.primary,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
      marginBottom: 4,
    },

    modalTitle: {
      fontSize: 19,
      lineHeight: 25,
      fontWeight: '800',
      color: theme.text.primary,
    },

    detailsSubtitle: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 17,
      color: theme.text.secondary,
    },

    closeIconButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
      borderWidth: 1,
      borderColor: theme.border.default,
      marginLeft: 7,
    },

    // ========================================================
    // DETAILS SUMMARY METRICS
    // ========================================================

    detailsSummary: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 12,
      paddingTop: 13,
      paddingBottom: 5,
      backgroundColor: theme.background.default,
      gap: 8,
    },

    summaryMetricCard: {
      flexGrow: 1,
      flexBasis: '40%',
      minWidth: 110,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 15,
      backgroundColor: theme.surface.elevated,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    metricIcon: {
      width: 34,
      height: 34,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
      marginBottom: 9,
    },

    metricLabel: {
      color: theme.text.secondary,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.6,
      marginBottom: 5,
    },

    metricValue: {
      color: theme.text.primary,
      fontSize: 18,
      fontWeight: '800',
    },

    // ========================================================
    // DETAILS SCROLL AREA
    // ========================================================

    modalContent: {
      flex: 1,
    },

    modalContentContainer: {
      paddingHorizontal: 15,
      paddingTop: 18,
      paddingBottom: 24,
    },

    detailsSection: {
      marginBottom: 23,
    },

    // ========================================================
    // SECTION HEADINGS
    // ========================================================

    sectionHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 13,
      gap: 10,
    },

    sectionHeadingAccent: {
      width: 4,
      height: 24,
      borderRadius: 4,
      backgroundColor: theme.brand.primary,
    },

    sectionTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '800',
      color: theme.text.primary,
    },

    roomSectionHeadingText: {
      flex: 1,
      minWidth: 0,
    },

    sectionSubtitle: {
      marginTop: 3,
      fontSize: 12,
      lineHeight: 17,
      color: theme.text.secondary,
    },

    taskCountBadge: {
      minWidth: 34,
      height: 30,
      paddingHorizontal: 9,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    taskCountText: {
      color: theme.brand.primary,
      fontSize: 13,
      fontWeight: '800',
    },

    // ========================================================
    // OVERVIEW
    // ========================================================

    overviewCard: {
      paddingHorizontal: 14,
      paddingVertical: 3,
      borderRadius: 16,
      backgroundColor: theme.surface.elevated,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    overviewRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingVertical: 13,
      gap: 12,
    },

    overviewLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      minWidth: 0,
      gap: 8,
    },

    overviewLabel: {
      flexShrink: 1,
      fontSize: 13,
      color: theme.text.secondary,
    },

    overviewValue: {
      flex: 1,
      flexShrink: 1,
      textAlign: 'right',
      fontSize: 13,
      fontWeight: '600',
      lineHeight: 19,
      color: theme.text.primary,
    },

    overviewDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.divider,
    },

    // ========================================================
    // ROOM TASK CARDS
    // ========================================================

    roomTaskCard: {
      marginBottom: 12,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderRadius: 16,
      backgroundColor: theme.surface.elevated,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    roomTaskHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },

    roomTaskIcon: {
      width: 41,
      height: 41,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
      borderWidth: 1,
      borderColor: theme.border.default,
      marginRight: 10,
    },

    roomTaskHeadingText: {
      flex: 1,
      minWidth: 0,
    },

    roomTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.text.primary,
    },

    roomTaskSubtitle: {
      fontSize: 12,
      marginTop: 3,
      color: theme.text.secondary,
    },

    roomNumberBadge: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background.sunken,
      borderWidth: 1,
      borderColor: theme.border.default,
      marginLeft: 7,
    },

    roomNumberText: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.text.secondary,
    },

    // ========================================================
    // TASK ROWS
    // ========================================================

    taskList: {
      borderTopWidth: 1,
      borderTopColor: theme.divider,
      paddingTop: 9,
    },

    taskItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 9,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.divider,
    },

    lastTaskItem: {
      borderBottomWidth: 0,
    },

    taskBullet: {
      width: 23,
      height: 23,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
      marginRight: 10,
      marginTop: -1,
    },

    taskText: {
      flex: 1,
      flexShrink: 1,
      fontSize: 13,
      lineHeight: 20,
      color: theme.text.primary,
    },

    noTasksCard: {
      minHeight: 110,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      borderRadius: 16,
      backgroundColor: theme.surface.elevated,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    noTasksText: {
      fontSize: 13,
      lineHeight: 19,
      textAlign: 'center',
      marginTop: 8,
      color: theme.text.secondary,
    },

    // ========================================================
    // DETAILS FOOTER
    // ========================================================

    detailsFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 17,
      paddingVertical: 13,
      gap: 12,
      backgroundColor: theme.surface.elevated,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },

    footerSummary: {
      flex: 1,
      minWidth: 0,
    },

    footerLabel: {
      fontSize: 11,
      color: theme.text.secondary,
      marginBottom: 3,
    },

    footerPrice: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.text.primary,
    },

    doneButton: {
      minWidth: 115,
      borderRadius: 12,
    },

    doneButtonContent: {
      minHeight: 45,
    },

    // ========================================================
    // ACCEPTANCE / TERMS MODAL
    // ========================================================

    rulesModalContainer: {
      width: '100%',
      maxWidth: 560,
      maxHeight: '85%',
      backgroundColor: theme.surface.elevated,
      borderRadius: 22,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.border.default,
      shadowColor: theme.shadow?.color || '#000000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: theme.shadow?.opacity ?? 0.15,
      shadowRadius: 20,
      elevation: 12,
    },

    rulesModalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 17,
      paddingVertical: 17,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
    },

    rulesHeaderIcon: {
      width: 43,
      height: 43,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
      marginRight: 11,
    },

    rulesHeaderText: {
      flex: 1,
      minWidth: 0,
    },

    rulesModalTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: theme.text.primary,
    },

    rulesModalSubtitle: {
      fontSize: 12,
      marginTop: 4,
      color: theme.text.secondary,
    },

    rulesContent: {
      flexShrink: 1,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },

    rulesModalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
      gap: 10,
    },

    rulesButton: {
      flex: 1,
      borderRadius: 12,
    },

    rulesButtonContent: {
      minHeight: 46,
    },
  });