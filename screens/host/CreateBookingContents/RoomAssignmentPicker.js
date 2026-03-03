// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, StyleSheet, ScrollView } from 'react-native';
// import FloatingLabelPickerSelect from '../../../components/shared/FloatingLabelPicker';
// import { checklist } from '../../../utils/tasks_photo';
// import { Checkbox } from 'react-native-paper';
// import COLORS from '../../../constants/colors';
// import CustomCard from '../../../components/shared/CustomCard';
// import { MaterialCommunityIcons } from '@expo/vector-icons';

// const ratePerMinute = 0.8;

// const RoomAssignmentPicker = ({
//   selectedApartment,
//   onAssignmentChange,
//   onGroupSummaryChange,
//   initialRoomAssignments,
//   initialExtraAssignments
// }) => {
//   const [expectedCleaners, setExpectedCleaners] = useState(1);
//   const [taskGroups, setTaskGroups] = useState([]);
//   const [rooms, setRooms] = useState([]);
//   const [roomAssignments, setRoomAssignments] = useState(initialRoomAssignments || {});
//   const [extraAssignments, setExtraAssignments] = useState(initialExtraAssignments || {});
//   const [groupSummary, setGroupSummary] = useState({});
//   const prevGroupSummaryRef = useRef({});

//   useEffect(() => {
//     const newGroups = Array.from({ length: expectedCleaners }, (_, i) => ({
//       groupId: `group_${i + 1}`,
//       rooms: [],
//       pricing: null,
//     }));
//     setTaskGroups(newGroups);
//   }, [expectedCleaners]);

//   useEffect(() => {
//     if (selectedApartment?.roomDetails?.length) {
//       const generatedRooms = selectedApartment.roomDetails.flatMap((roomType) => {
//         const count = typeof roomType.number === 'number' ? roomType.number : 0;
//         return Array.from({ length: count }, (_, i) => ({
//           id: `${roomType.type}_${i}`,
//           type: roomType.type,
//           number: i + 1,
//           size: roomType.size || 0,
//           size_range: roomType.size_range || 'medium',
//         }));
//       });
//       setRooms(generatedRooms);
//     }
//   }, [selectedApartment]);

//   useEffect(() => {
//     const timePerSqft = {
//       Bedroom: 0.15,
//       Bathroom: 0.18,
//       Livingroom: 0.14,
//       Kitchen: 0.20,
//     };
//     const summary = {};

//     rooms.forEach((room) => {
//       const groupId = expectedCleaners > 1 ? roomAssignments[room.id] : 'group_1';
//       if (!groupId) return;

//       const rate = timePerSqft[room.type] || 0.15;
//       const time = room.size * rate;

//       if (!summary[groupId]) {
//         summary[groupId] = {
//           totalTime: 0,
//           rooms: [],
//           price: 0,
//           extras: [],
//           details: {},
//         };
//       }

//       summary[groupId].totalTime += time;
//       summary[groupId].rooms.push(room.id);

//       if (!summary[groupId].details[room.type]) {
//         const tasks = (checklist[room.type]?.tasks || []).map((task) => ({
//           ...task,
//           value: false,
//           name: `${task.label.toLowerCase().replace(/\s+/g, '_')}_${room.type.toLowerCase()}`,
//         }));
//         summary[groupId].details[room.type] = { photos: [], tasks };
//       }
//     });

//     Object.entries(extraAssignments).forEach(([taskId, val]) => {
//       if (val.selected) {
//         const groupId = expectedCleaners > 1 ? val.group : 'group_1';
//         const time = val.time || 5;
//         const price = val.price || 5;

//         if (!summary[groupId]) {
//           summary[groupId] = {
//             totalTime: 0,
//             rooms: [],
//             price: 0,
//             extras: [],
//             details: {},
//           };
//         }

//         summary[groupId].totalTime += time;
//         summary[groupId].price += price;
//         if (val.label) summary[groupId].extras.push(val.label);

//         if (!summary[groupId].details['Extra']) {
//           summary[groupId].details['Extra'] = { photos: [], tasks: [] };
//         }

//         const alreadyIncluded = summary[groupId].details['Extra'].tasks.some((t) => t.id === taskId);
//         if (!alreadyIncluded) {
//           summary[groupId].details['Extra'].tasks.push({
//             label: val.label,
//             value: true,
//             name: taskId,
//             id: taskId,
//             time: val.time,
//             price: val.price,
//           });
//         }
//       }
//     });

//     Object.keys(summary).forEach((groupId) => {
//       summary[groupId].price += parseFloat((summary[groupId].totalTime * ratePerMinute).toFixed(2));
//     });

//     setGroupSummary(summary);
//     const currentStr = JSON.stringify(summary);
//     const prevStr = JSON.stringify(prevGroupSummaryRef.current);
//     if (currentStr !== prevStr) {
//       prevGroupSummaryRef.current = summary;
//       if (onGroupSummaryChange) onGroupSummaryChange(summary);
//     }
//     console.log('Group Summary:\n', JSON.stringify(summary, null, 2));
//   }, [roomAssignments, rooms, extraAssignments, expectedCleaners]);

//   const handleAssignmentChange = (roomId, groupId) => {
//     const updated = { ...roomAssignments, [roomId]: groupId };
//     setRoomAssignments(updated);
//     if (onAssignmentChange) onAssignmentChange(updated, extraAssignments);
//   };

//   const handleExtraGroupAssign = (taskId, groupId) => {
//     setExtraAssignments((prev) => {
//       const existing = prev[taskId] || {};
//       return {
//         ...prev,
//         [taskId]: {
//           ...existing,
//           group: groupId,
//           selected: true,
//           label: existing.label || checklist.Extra.tasks.find((t) => t.id === taskId)?.label || 'Unknown',
//           time: existing.time || 5,
//           price: existing.price || 5,
//         },
//       };
//     });
//   };

//   // const toggleExtraTask = (task) => {
//   //   setExtraAssignments((prev) => {
//   //     const current = prev[task.id];
//   //     if (current) {
//   //       const updated = { ...prev };
//   //       delete updated[task.id];
//   //       return updated;
//   //     }
//   //     return {
//   //       ...prev,
//   //       [task.id]: {
//   //         label: task.label,
//   //         time: task.time || 5,
//   //         price: task.price || 5,
//   //         group: null,
//   //         selected: false,
//   //       },
//   //     };
//   //   });
//   // };


//   const toggleExtraTask = (task) => {
//     setExtraAssignments((prev) => {
//       const current = prev[task.id];
//       if (current) {
//         // Toggle off if currently selected
//         return {
//           ...prev,
//           [task.id]: {
//             ...current,
//             selected: !current.selected,
//           },
//         };
//       } else {
//         // Initialize as unselected
//         return {
//           ...prev,
//           [task.id]: {
//             label: task.label,
//             time: task.time || 5,
//             price: task.price || 5,
//             group: null,
//             selected: false,
//           },
//         };
//       }
//     });
//   };

//   const chunkArray = (arr, size) => {
//     const chunks = [];
//     for (let i = 0; i < arr.length; i += size) {
//       chunks.push(arr.slice(i, i + size));
//     }
//     return chunks;
//   };

//   const getRoomIcon = (type) => {
//     switch (type) {
//       case 'Bedroom':
//         return <MaterialCommunityIcons name="bed-outline" size={26} color={COLORS.gray} style={styles.icon} />;
//       case 'Bathroom':
//         return <MaterialCommunityIcons name="shower" size={26} color={COLORS.gray} style={styles.icon} />;
//       case 'Livingroom':
//         return <MaterialCommunityIcons name="sofa-outline" size={26} color={COLORS.gray} style={styles.icon} />;
//       case 'Kitchen':
//         return <MaterialCommunityIcons name="fridge-outline" size={26} color={COLORS.gray} style={styles.icon} />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <View style={{ padding: 0 }}>
//         <FloatingLabelPickerSelect
//           label="Expected Cleaners"
//           value={expectedCleaners}
//           onValueChange={(val) => setExpectedCleaners(val)}
//           items={Array.from({ length: 10 }, (_, i) => ({
//             label: `${i + 1}`,
//             value: i + 1,
//           }))}
//         />
//       </View>

//       <View style={styles.pickerWrapper}>
//         {rooms.map((room) => (
//           <CustomCard key={room.id} style={styles.roomBlock}>
//             <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//               {getRoomIcon(room.type)}
//               <Text style={styles.roomType}>{room.type} #{room.number}</Text>
//             </View>

//             {expectedCleaners > 1 && (
//               <FloatingLabelPickerSelect
//                 label="Assign to"
//                 value={roomAssignments[room.id] || null}
//                 onValueChange={(groupId) => handleAssignmentChange(room.id, groupId)}
//                 items={taskGroups.map((group) => ({
//                   label: group.groupId.toUpperCase(),
//                   value: group.groupId,
//                 }))}
//               />
//             )}

//             <View style={styles.tasksWrapper}>
//               {chunkArray(checklist[room.type]?.tasks || [], 2).map((row, rowIndex) => (
//                 <View key={rowIndex} style={styles.taskRow}>
//                   {row.map((task) => (
//                     <View key={task.id} style={styles.taskColumn}>
//                       <View style={styles.dotRow}>
//                         <View style={styles.dot} />
//                         <Text style={styles.taskLabel}>{task.label}</Text>
//                       </View>
//                     </View>
//                   ))}
//                 </View>
//               ))}
//             </View>
//           </CustomCard>
//         ))}

//         <CustomCard style={styles.roomBlock}>
//           <Text style={styles.roomType}>Extra Tasks</Text>
//           {checklist.Extra.tasks.map((task) => (
//             <View key={task.id} style={styles.extraRow}>
//               <Checkbox.Android
//                 status={extraAssignments[task.id] ? 'checked' : 'unchecked'}
//                 onPress={() => toggleExtraTask(task)}
//                 color={COLORS.primary_light}
//               />
//               <Text style={[styles.taskLabel, { flex: 1 }]}>{task.label}</Text>
//               {expectedCleaners > 1 && (
//                 <View style={{ width: 140 }}>
//                   <FloatingLabelPickerSelect
//                     label="Assign to"
//                     value={extraAssignments[task.id]?.group || null}
//                     onValueChange={(groupId) => handleExtraGroupAssign(task.id, groupId)}
//                     items={taskGroups.map((group) => ({
//                       label: group.groupId.toUpperCase(),
//                       value: group.groupId,
//                     }))}
//                   />
//                 </View>
//               )}
//             </View>
//           ))}
//         </CustomCard>

//         {expectedCleaners > 1 && Object.keys(groupSummary).length > 0 && (
//           <View style={styles.summaryContainer}>
//             <Text style={styles.summaryHeader}>Group Summary</Text>
//             {Object.entries(groupSummary).map(([groupId, data]) => (
//               <View key={groupId} style={styles.summaryItem}>
//                 <Text style={styles.summaryGroupId}>Group {groupId.toUpperCase()}</Text>
//                 <Text>Total Time: {data.totalTime.toFixed(1)} mins</Text>
//                 <Text>Price: ${data.price.toFixed(2)}</Text>
//                 <Text>
//                   Rooms: {Object.entries(
//                     data.rooms.reduce((acc, roomId) => {
//                       const roomType = roomId.split('_')[0];
//                       acc[roomType] = (acc[roomType] || 0) + 1;
//                       return acc;
//                     }, {})
//                   )
//                     .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
//                     .join(', ')}
//                 </Text>
//                 {data.extras.length > 0 && (
//                   <Text>Extras: {data.extras.join(', ')}</Text>
//                 )}
//               </View>
//             ))}
//           </View>
//         )}
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { paddingTop: 10 },
//   pickerWrapper: { marginTop: 20 },
//   roomBlock: {
//     borderWidth: 1,
//     borderColor: '#eee',
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 20,
//     backgroundColor: '#fff',
//   },
//   roomType: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 5,
//   },
//   tasksWrapper: { marginTop: 10 },
//   taskRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
//   taskColumn: { flex: 1, paddingRight: 10 },
//   dotRow: { flexDirection: 'row', alignItems: 'center' },
//   dot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: COLORS.primary_light || '#1976d2',
//     marginRight: 8,
//   },
//   taskLabel: { fontSize: 14, color: '#333' },
//   extraRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//     gap: 8,
//     flexWrap: 'nowrap',
//   },
//   summaryContainer: {
//     padding: 10,
//     backgroundColor: '#f8f8f8',
//     borderRadius: 8,
//     marginTop: 10,
//   },
//   summaryHeader: {
//     fontWeight: 'bold',
//     fontSize: 16,
//     marginBottom: 10,
//   },
//   summaryItem: { marginBottom: 10 },
//   summaryGroupId: { fontWeight: '600', fontSize: 15 },
//   icon: { marginRight: 8 },
// });

// export default RoomAssignmentPicker;





// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
// import FloatingLabelPickerSelect from '../../../components/shared/FloatingLabelPicker';
// import { checklist } from '../../../utils/tasks_photo';
// import { Checkbox, TextInput, Button } from 'react-native-paper';
// import COLORS from '../../../constants/colors';
// import CustomCard from '../../../components/shared/CustomCard';
// import { MaterialCommunityIcons, MaterialIcons, AntDesign } from '@expo/vector-icons';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


// const ratePerMinute = 0.8;

// const RoomAssignmentPicker = ({ 
//     selectedApartment, 
//     taskGroups: initialTaskGroups = [], 
//     onTotalFeeChange,
//     onTotalTimeChange,
//     onInfoPress,
//     checklistName,
//     setChecklistName,
//     onAssignmentChange, 
//     onGroupSummaryChange,
//     initialRoomAssignments,
//     initialExtraAssignments,
//     isEditing,
//     initialData,
//     onTaskGroupsChange,
//     existingChecklistData = null,
//     initialTotalFee = 0,
//     initialTotalTime = 0,
//   ...props
    
// }) => {
//   const [rooms, setRooms] = useState([]);
//   const [roomAssignments, setRoomAssignments] = useState(initialRoomAssignments || {});
//   const [extraAssignments, setExtraAssignments] = useState(initialExtraAssignments || {});
//   const [groupSummary, setGroupSummary] = useState({});
//   const [roomNotes, setRoomNotes] = useState({});
//   const [noteModalVisible, setNoteModalVisible] = useState(false);
//   const [noteText, setNoteText] = useState('');
//   const [activeRoomForNote, setActiveRoomForNote] = useState(null);
//   const [selectedRoomForNote, setSelectedRoomForNote] = useState(null);
//   const [expectedCleaners, setExpectedCleaners] = useState(1);
//   const [totalFee, setTotalFee] = useState(0);
//   const [totalTime, setTotalTime] = useState(0);

  
//   // State for task groups
//   const [taskGroups, setTaskGroups] = useState([]);
//   const [hasInitialized, setHasInitialized] = useState(false);

//   const prevGroupSummaryRef = useRef({});

//   const getRoomIcon = (type) => {
//   switch (type) {
//     case 'Bedroom':
//       return <MaterialCommunityIcons name="bed-outline" size={26} color={COLORS.gray} style={styles.icon} />;
//     case 'Bathroom':
//       return <MaterialCommunityIcons name="shower" size={26} color={COLORS.gray} style={styles.icon} />;
//     case 'Livingroom':
//       return <MaterialCommunityIcons name="sofa-outline" size={26} color={COLORS.gray} style={styles.icon} />;
//     case 'Kitchen':
//       return <MaterialCommunityIcons name="fridge-outline" size={26} color={COLORS.gray} style={styles.icon} />;
//     default:
//       return null;
//   }
// };

// // Initialize with existing data when in editing mode
// // useEffect(() => {
// //   if (isEditing && existingChecklistData && !hasInitialized) {
// //     console.log('RoomAssignmentPicker - Initializing with existing data:', existingChecklistData);
    
// //     let groups = [];
    
// //     // Handle different data formats
// //     if (Array.isArray(existingChecklistData)) {
// //       groups = existingChecklistData.map((group, index) => ({
// //         groupId: group.groupId || `group_${index + 1}`,
// //         rooms: group.rooms || [],
// //         pricing: group.pricing || null,
// //         tasks: group.tasks || []
// //       }));
// //     } else if (typeof existingChecklistData === 'object') {
// //       const groupKeys = Object.keys(existingChecklistData);
// //       groups = groupKeys.map((key, index) => {
// //         const group = existingChecklistData[key];
// //         return {
// //           groupId: key,
// //           rooms: Array.isArray(group.rooms) ? group.rooms : [],
// //           pricing: group.pricing || null,
// //           tasks: group.tasks || []
// //         };
// //       });
// //     }
    
// //     console.log('Initialized groups for editing:', groups);
// //     setTaskGroups(groups);
    
// //     // Calculate initial totals
// //     let totalFee = 0;
// //     let totalTime = 0;
    
// //     groups.forEach(group => {
// //       if (group.pricing) {
// //         totalFee += group.pricing.totalPrice || 0;
// //         totalTime += group.pricing.totalTime || 0;
// //       }
// //     });
    
// //     if (onTotalFeeChange) onTotalFeeChange(totalFee);
// //     if (onTotalTimeChange) onTotalTimeChange(totalTime);
    
// //     // Create group summary
// //     const groupSummary = {};
// //     groups.forEach(group => {
// //       groupSummary[group.groupId] = {
// //         rooms: group.rooms,
// //         pricing: group.pricing,
// //         tasks: group.tasks || []
// //       };
// //     });
    
// //     if (onGroupSummaryChange) onGroupSummaryChange(groupSummary);
    
// //     setHasInitialized(true);
// //   } else if (!isEditing && initialTaskGroups.length > 0 && !hasInitialized) {
// //     // For create mode, use the provided initialTaskGroups
// //     console.log('RoomAssignmentPicker - Initializing for create mode:', initialTaskGroups);
// //     setTaskGroups(initialTaskGroups);
// //     setHasInitialized(true);
// //   }
// // }, [isEditing, existingChecklistData, initialTaskGroups, hasInitialized]);

// useEffect(() => {
//   if (isEditing && existingChecklistData) {
//     console.log('Initializing with existing checklist data:', existingChecklistData);
    
//     // Parse and set the existing data
//     // This will depend on how your RoomAssignmentPicker stores data internally
    
//     // Example: If you have a state for groups, initialize it
//     // setGroups(parseChecklistData(existingChecklistData));
    
//     // Set totals
//     if (onDataUpdate) {
//       onDataUpdate({
//         totalFee: initialTotalFee,
//         totalTime: initialTotalTime,
//         checklist: existingChecklistData
//       });
//     }
//   }
// }, [isEditing, existingChecklistData, initialTotalFee, initialTotalTime]);

// // And in the component, add logic to handle initial data:
// useEffect(() => {
//   if (isEditing && initialData) {
//     // Initialize with existing data
//     console.log('Initializing with existing data:', initialData);
//     // Your logic to populate form with existing data
//   }
// }, [isEditing, initialData]);

// // Also add a useEffect to notify parent of task groups changes:
// useEffect(() => {
//   if (onTaskGroupsChange) {
//     onTaskGroupsChange(taskGroups);
//   }
// }, [taskGroups, onTaskGroupsChange]);
//   useEffect(() => {
//     if (selectedApartment?.roomDetails?.length) {
//       const generatedRooms = selectedApartment.roomDetails.flatMap((roomType) => {
//         const count = typeof roomType.number === 'number' ? roomType.number : 0;
//         return Array.from({ length: count }, (_, i) => ({
//           id: `${roomType.type}_${i}`,
//           type: roomType.type,
//           number: i + 1,
//           size: roomType.size || 0,
//           size_range: roomType.size_range || 'medium',
//         }));
//       });
//       setRooms(generatedRooms);
//     }
//   }, [selectedApartment]);

//   useEffect(() => {
//     if (expectedCleaners === 1 && rooms.length > 0) {
//       const newAssignments = {};
//       rooms.forEach(room => {
//         newAssignments[room.id] = 'a';
//       });
//       setRoomAssignments(newAssignments);
//     }
//   }, [expectedCleaners, rooms]);

//   useEffect(() => {
//     const timePerSqft = {
//       Bedroom: 0.15,
//       Bathroom: 0.18,
//       Livingroom: 0.14,
//       Kitchen: 0.20,
//     };

//     const summary = {};

//     rooms.forEach((room) => {
//       const groupId = roomAssignments[room.id];
//       if (!groupId) return;

//       const rate = timePerSqft[room.type] || 0.15;
//       const time = room.size * rate;

//       if (!summary[groupId]) {
//         summary[groupId] = {
//           totalTime: 0,
//           rooms: [],
//           price: 0,
//           extras: [],
//           details: {},
//         };
//       }

//       summary[groupId].totalTime += time;
//       summary[groupId].rooms.push(room.id);

//       // if (!summary[groupId].details[room.type]) {
//       //   const tasks = (checklist[room.type]?.tasks || []).map((task) => ({
//       //     ...task,
//       //     value: false,
//       //     name: `${task.label.toLowerCase().replace(/\s+/g, '_')}_${room.type.toLowerCase()}`
//       //   }));

//       //   summary[groupId].details[room.type] = {
//       //     photos: [],
//       //     tasks,
//       //   };

//       //   summary[groupId].details[room.type].notes = {
//       //     ...summary[groupId].details[room.type].notes,
//       //     [room.id]: {
//       //       text: roomNotes[room.id] || '',
//       //     }
//       //   };
//       // }

//       if (!summary[groupId].details[room.id]) {
//         const tasks = (checklist[room.type]?.tasks || []).map((task) => ({
//           ...task,
//           value: false,
//           name: `${task.label.toLowerCase().replace(/\s+/g, '_')}_${room.id.toLowerCase()}`
//         }));
      
//         summary[groupId].details[room.id] = {
//           photos: [],
//           tasks,
//           notes: {
//             text: roomNotes[room.id] || '',
//           },
//         };
//       }
//     });

//     Object.entries(extraAssignments).forEach(([taskId, val]) => {
//       if (val.selected && val.group) {
//         const groupId = val.group;
//         const time = val.time || 5;
//         const price = val.price || 5;

//         if (!summary[groupId]) {
//           summary[groupId] = {
//             totalTime: 0,
//             rooms: [],
//             price: 0,
//             extras: [],
//             details: {},
//           };
//         }

//         summary[groupId].totalTime += time;
//         summary[groupId].price += price;
//         if (val.label) summary[groupId].extras.push(val.label);

//         if (!summary[groupId].details['Extra']) {
//           summary[groupId].details['Extra'] = {
//             photos: [],
//             tasks: [],
//           };
//         }

//         const alreadyIncluded = summary[groupId].details['Extra'].tasks.some((t) => t.id === taskId);
//         if (!alreadyIncluded) {
//           summary[groupId].details['Extra'].tasks.push({
//             label: val.label,
//             value: true,
//             name: taskId,
//             id: taskId,
//             time: val.time,
//             price: val.price,
//           });
//         }
//       }
//     });

//     Object.keys(summary).forEach((groupId) => {
//       summary[groupId].price += parseFloat((summary[groupId].totalTime * ratePerMinute).toFixed(2));
//     });

//     setGroupSummary(summary);
    

//     const totalFee = Object.values(summary).reduce((sum, group) => sum + (group.price || 0), 0);
//     onTotalFeeChange?.(Number(totalFee.toFixed(2)));

//     const totalTime = Object.values(summary).reduce((sum, group) => sum + (group.totalTime || 0), 0);
    
//     setTotalFee(totalFee); // store locally
//     setTotalTime(totalFee); // store locally
    
    
//     onTotalFeeChange?.(Number(totalFee.toFixed(2)));
//     onTotalTimeChange?.(Number(totalTime.toFixed(1))); // Add this callback
//     const currentStr = JSON.stringify(summary);
//     const prevStr = JSON.stringify(prevGroupSummaryRef.current);
//     if (currentStr !== prevStr) {
//       prevGroupSummaryRef.current = summary;
//       if (onGroupSummaryChange) onGroupSummaryChange(summary);
//     }

//     console.log('Group Summary:\n', JSON.stringify(summary, null, 2));
//   }, [roomAssignments, rooms, extraAssignments]);

//   const handleAssignmentChange = (roomId, groupId) => {
//     const updated = { ...roomAssignments, [roomId]: groupId };
//     setRoomAssignments(updated);
//     if (onAssignmentChange) onAssignmentChange(updated, extraAssignments);
//   };

//   const handleSaveNote = (roomId, noteText) => {
//     setRoomNotes((prev) => ({
//       ...prev,
//       [roomId]: noteText,
//     }));
//     setNoteModalVisible(false);
//   };

//   const handleExtraGroupAssign = (taskId, groupId) => {
//     setExtraAssignments((prev) => {
//       const existing = prev[taskId] || {};
//       return {
//         ...prev,
//         [taskId]: {
//           ...existing,
//           group: groupId,
//           selected: true,
//           label: existing.label || checklist.Extra.tasks.find(t => t.id === taskId)?.label || 'Unknown',
//           time: existing.time || 5,
//           price: existing.price || 5,
//         },
//       };
//     });
//   };

//   const toggleExtraTask = (task) => {
//     setExtraAssignments((prev) => {
//       const current = prev[task.id];
//       if (current) {
//         const updated = { ...prev };
//         delete updated[task.id];
//         return updated;
//       }
//       return {
//         ...prev,
//         [task.id]: {
//           label: task.label,
//           time: task.time || 5,
//           price: task.price || 5,
//           group: null,
//           selected: false,
//         },
//       };
//     });
//   };

//   const chunkArray = (arr, size) => {
//     const chunks = [];
//     for (let i = 0; i < arr.length; i += size) {
//       chunks.push(arr.slice(i, i + size));
//     }
//     return chunks;
//   };

//   const checklistByRoomType = {
//     Bedroom: checklist.Bedroom.tasks,
//     Bathroom: checklist.Bathroom.tasks,
//     Livingroom: checklist.Livingroom.tasks,
//     Kitchen: checklist.Kitchen.tasks,
//   };

//   console.log('RoomAssignmentPicker received props:', {
//     selectedApartment,
//     initialTaskGroups,
//     isEditing,
//     existingChecklistData,
//     hasInitialized
//   });

//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.pickerWrapper}>
//       <View style={{ marginBottom: 0 }}>
//         <TextInput
//           mode="outlined"
//           label="Checklist Name"
//           placeholder="e.g., Mid-July Deep Clean"
//           placeholderTextColor={COLORS.darkGray}
//           outlineColor="#CCC"
//           value={checklistName}
//           onChangeText={setChecklistName}
//           activeOutlineColor={COLORS.primary}
//           style={{marginBottom:0, marginTop:40, fontSize:14, backgroundColor:"#fff"}}
          
//           iconName="email-outline"
  
//         />
//       </View>
      
      
//       <View style={styles.pickerContainer}>
//         <View style={styles.pickerWrapper}>
//           <FloatingLabelPickerSelect
//             label="Expected Cleaners"
//             value={expectedCleaners}
//             onValueChange={(val) => setExpectedCleaners(val)}
//             items={Array.from({ length: 10 }, (_, i) => ({
//               label: `${i + 1}`,
//               value: i + 1,
//             }))}
//           />
//         </View>
//         <TouchableOpacity 
//           onPress={onInfoPress} 
//           style={styles.infoIcon}
//         >
//           <MaterialIcons name="info-outline" size={26} color={COLORS.gray} />
//         </TouchableOpacity>
//       </View>

//         {rooms.map((room) => (
//           <CustomCard key={room.id} style={styles.roomBlock}>
//             <View style={styles.roomHeader}>
                
//                 <Text style={styles.roomType}> {getRoomIcon(room.type)} {room.type} #{room.number}</Text>
//                 <TouchableOpacity
//                   onPress={() => {
//                     setSelectedRoomForNote(room.id);
//                     setNoteText(roomNotes[room.id] || '');
//                     setNoteModalVisible(true);
//                   }}
//                 >
//                   {/* <Feather name="edit-3" size={18} color="#888" /> */}
//                   <Icon
//                     name={roomNotes[room.id] ? 'note-edit-outline' : 'note-plus'}
//                     size={24}
//                     color={COLORS.primary_light}
//                   />
//                 </TouchableOpacity>
//               </View>

//               {/* ⬇️ Add this right below the header to show saved note */}
//               {roomNotes[room.id] ? (
//                 <Text style={styles.notePreview}>Note: {roomNotes[room.id].slice(0, 40)}...</Text>
//               ) : null}
//             {expectedCleaners > 1 && (
//               <FloatingLabelPickerSelect
//                 label="Assign to"
//                 value={roomAssignments[room.id] || null}
//                 onValueChange={(groupId) => handleAssignmentChange(room.id, groupId)}
//                 items={taskGroups.map((group) => ({
//                   label: group.groupId.toUpperCase(),
//                   value: group.groupId,
//                 }))}
//               />
//             )}
//             {roomAssignments[room.id] && (
//               <View style={styles.tasksWrapper}>
//                 {chunkArray(checklistByRoomType[room.type] || [], 2).map((row, rowIndex) => (
//                   <View key={rowIndex} style={styles.taskRow}>
//                     {row.map((task) => (
//                       <View key={task.id} style={styles.taskColumn}>
//                         <View style={styles.dotRow}>
//                           <View style={styles.dot} />
//                           <Text style={styles.taskLabel}>{task.label}</Text>
//                         </View>
//                       </View>
//                     ))}
//                   </View>
//                 ))}
//               </View>
//             )}
//           </CustomCard>
//         ))}

//         <CustomCard style={styles.roomBlock}>
//           <Text style={styles.roomType}>Extra Tasks</Text>
//           {checklist.Extra.tasks.map((task) => (
//             <View key={task.id} style={styles.extraRow}>
//               <Checkbox.Android
//                 status={extraAssignments[task.id]?.selected ? 'checked' : 'unchecked'}
//                 onPress={() => {
//                   if (expectedCleaners === 1) {
//                     setExtraAssignments((prev) => {
//                       const current = prev[task.id];
//                       if (current?.selected) {
//                         const updated = { ...prev };
//                         delete updated[task.id];
//                         return updated;
//                       }
//                       return {
//                         ...prev,
//                         [task.id]: {
//                           label: task.label,
//                           time: task.time || 5,
//                           price: task.price || 5,
//                           group: 'a', // 👈 auto-assign to group A
//                           selected: true,
//                         },
//                       };
//                     });
//                   } else {
//                     toggleExtraTask(task);
//                   }
//                 }}
//                 color={COLORS.primary_light}
//               />
//               <Text style={[styles.taskLabel, { flex: 1 }]}>{task.label}</Text>

//               {/* Only show assign dropdown if expectedCleaners > 1 */}
//               {expectedCleaners > 1 && (
//                 <View style={{ width: 140 }}>
//                   <FloatingLabelPickerSelect
//                     label="Assign to"
//                     value={extraAssignments[task.id]?.group || null}
//                     onValueChange={(groupId) => handleExtraGroupAssign(task.id, groupId)}
//                     items={taskGroups.map((group) => ({
//                       label: group.groupId.toUpperCase(),
//                       value: group.groupId,
//                     }))}
//                   />
//                 </View>
//               )}
//             </View>
//           ))}
//         </CustomCard>

//         {Object.keys(groupSummary).length > 0 && (
//           <View style={styles.summaryContainer}>
//             <Text style={styles.summaryHeader}>Group Summary</Text>
//             {Object.entries(groupSummary).map(([groupId, data]) => (
//               <View key={groupId} style={styles.summaryItem}>
//                 <Text style={styles.summaryGroupId}>Group {groupId.toUpperCase()}</Text>
//                 <Text>Total Time: {data.totalTime.toFixed(1)} mins</Text>
//                 <Text>Price: ${data.price.toFixed(2)}</Text>
//                 <Text>
//                   Rooms: {Object.entries(data.rooms.reduce((acc, roomId) => {
//                     const roomType = roomId.split('_')[0];
//                     acc[roomType] = (acc[roomType] || 0) + 1;
//                     return acc;
//                   }, {})).map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`).join(', ')}
//                 </Text>
//                 {data.extras.length > 0 && <Text>Extras: {data.extras.join(', ')}</Text>}
//               </View>
//             ))}
//           </View>
//         )}

//         {noteModalVisible && (
//           // <Modal transparent animationType="slide" visible={noteModalVisible}>
//           //   <View style={styles.modalOverlay}>
//           //     <View style={styles.modalContent}>
//           //       <Text style={styles.modalTitle}>Add Note for {activeRoomForNote}</Text>
//           //       <TextInput
//           //         mode="outlined"
//           //         multiline
//           //         placeholder="Enter your note here..."
//           //         value={noteText}
//           //         onChangeText={setNoteText}
//           //         style={{ height: 100, marginBottom: 20 }}
//           //       />
//           //       <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
//           //         <Button onPress={() => setNoteModalVisible(false)}>Cancel</Button>
//           //         <Button
//           //           onPress={() => {
//           //             setRoomNotes((prev) => ({
//           //               ...prev,
//           //               [activeRoomForNote]: noteText,
//           //             }));
//           //             setNoteModalVisible(false);
//           //           }}
//           //         >
//           //           Save
//           //         </Button>
//           //       </View>
//           //     </View>
//           //   </View>
//           // </Modal>
//           <Modal visible={noteModalVisible} transparent animationType="fade">
//             <View style={styles.modalOverlay}>
//               <View style={styles.modalContent}>
//                 <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Add Note</Text>
//                 <TextInput
//                   mode="outlined"
//                   multiline
//                   numberOfLines={4}
//                   value={noteText}
//                   onChangeText={setNoteText}
//                   placeholder="Add your note for this room..."
//                   placeholderTextColor={COLORS.darkGray}
//                   outlineColor="#CCC"
//                   activeOutlineColor={COLORS.primary}
//                   style={{marginBottom:0, marginTop:10, fontSize:14, backgroundColor:"#fff"}}
//                 />
//                 <Button mode="contained" onPress={() => handleSaveNote(selectedRoomForNote, noteText)} style={{ marginTop: 10, backgroundColor:COLORS.primary }}>
//                   Save Note
//                 </Button>
//               </View>
//             </View>
//           </Modal>
//         )}

        
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     paddingTop: 10,
//   },
//   // pickerWrapper: {
//   //   marginTop: 20,
//   // },
//   roomBlock: {
//     borderWidth: 1,
//     borderColor: '#eee',
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 20,
//     backgroundColor: '#fff',
//   },
//   roomHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },  
  
//   roomType: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   noteIcon: {
//     fontSize: 18,
//   },
//   notePreview: {
//     fontStyle: 'italic',
//     fontSize: 12,
//     color: COLORS.gray,
//     marginBottom: 0,
//   },
//   taskRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   taskColumn: {
//     flex: 1,
//     paddingRight: 10,
//   },
//   tasksWrapper: {
//     marginTop: 12,
//   },
//   dotRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   dot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: COLORS.primary_light || '#1976d2',
//     marginRight: 8,
//   },
//   taskLabel: {
//     fontSize: 14,
//     color: '#333',
//   },
//   extraRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 0,
//     gap: 8,
//     flexWrap: 'nowrap',
//   },
//   summaryContainer: {
//     padding: 10,
//     backgroundColor: '#f8f8f8',
//     borderRadius: 8,
//     marginTop: 10,
//   },
//   summaryHeader: {
//     fontWeight: 'bold',
//     fontSize: 16,
//     marginBottom: 10,
//   },
//   summaryItem: {
//     marginBottom: 10,
//   },
//   summaryGroupId: {
//     fontWeight: '600',
//     fontSize: 15,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     padding: 20,
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 20,
//   },
//   modalTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   iconWrapper: {
//     paddingLeft: 8,
//     paddingTop: 12,
//   },

//   pickerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   pickerWrapper: {
//     flex: 1,
//     marginRight: 10,
//   },
//   infoIcon: {
//     padding: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// export default RoomAssignmentPicker;





// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
// import FloatingLabelPickerSelect from '../../../components/shared/FloatingLabelPicker';
// import { checklist } from '../../../utils/tasks_photo';
// import { Checkbox, TextInput, Button } from 'react-native-paper';
// import COLORS from '../../../constants/colors';
// import CustomCard from '../../../components/shared/CustomCard';
// import { MaterialCommunityIcons, MaterialIcons, AntDesign } from '@expo/vector-icons';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// const ratePerMinute = 0.8;

// const RoomAssignmentPicker = ({ 
//     selectedApartment, 
//     onGroupSummaryChange,
//     onTotalFeeChange,
//     onTotalTimeChange,
//     onInfoPress,
//     checklistName,
//     setChecklistName,
//     isEditing = false,
//     existingChecklistData = null,
//     ...props
// }) => {
//   const [rooms, setRooms] = useState([]);
//   const [roomAssignments, setRoomAssignments] = useState({});
//   const [extraAssignments, setExtraAssignments] = useState({});
//   const [groupSummary, setGroupSummary] = useState({});
//   const [roomNotes, setRoomNotes] = useState({});
//   const [noteModalVisible, setNoteModalVisible] = useState(false);
//   const [noteText, setNoteText] = useState('');
//   const [selectedRoomForNote, setSelectedRoomForNote] = useState(null);
//   const [expectedCleaners, setExpectedCleaners] = useState(1);
  
//   // State for task groups - initialize based on mode
//   const [taskGroups, setTaskGroups] = useState([]);
//   const [hasInitialized, setHasInitialized] = useState(false);
  
//   const prevGroupSummaryRef = useRef({});

//   // Initialize task groups based on mode (edit or create)
//   useEffect(() => {
//     if (!hasInitialized) {
//       if (isEditing && existingChecklistData) {
//         // EDIT MODE: Initialize with existing data
//         console.log('Initializing in EDIT mode with data:', existingChecklistData);
        
//         // Parse existing checklist data
//         let parsedGroups = [];
        
//         // Handle different data formats
//         if (Array.isArray(existingChecklistData)) {
//           parsedGroups = existingChecklistData.map((group, index) => ({
//             groupId: group.groupId || `group_${index + 1}`,
//             rooms: group.rooms || [],
//             pricing: group.pricing || null,
//             tasks: group.tasks || []
//           }));
//         } else if (typeof existingChecklistData === 'object') {
//           const groupKeys = Object.keys(existingChecklistData);
          
//           // If it's an object with group keys (group1, group2, etc.)
//           if (groupKeys.length > 0 && (groupKeys[0].startsWith('group') || existingChecklistData[groupKeys[0]]?.rooms !== undefined)) {
//             parsedGroups = groupKeys.map((key, index) => {
//               const group = existingChecklistData[key];
//               return {
//                 groupId: key,
//                 rooms: Array.isArray(group?.rooms) ? group.rooms : [],
//                 pricing: group?.pricing || null,
//                 tasks: Array.isArray(group?.tasks) ? group.tasks : []
//               };
//             });
//           } else {
//             // Single group structure
//             parsedGroups = [{
//               groupId: 'group_1',
//               rooms: [],
//               pricing: null,
//               tasks: []
//             }];
//           }
//         }
        
//         setTaskGroups(parsedGroups);
//         setExpectedCleaners(parsedGroups.length || 1);
        
//         // Set room assignments from existing data
//         const newRoomAssignments = {};
//         const newExtraAssignments = {};
        
//         // Parse room assignments
//         parsedGroups.forEach(group => {
//           if (Array.isArray(group.rooms)) {
//             group.rooms.forEach(roomId => {
//               newRoomAssignments[roomId] = group.groupId;
//             });
//           }
          
//           // Parse tasks for extra assignments
//           if (Array.isArray(group.tasks)) {
//             group.tasks.forEach(task => {
//               if (task.category === 'extra' || task.type === 'extra') {
//                 newExtraAssignments[task.id || task.label] = {
//                   label: task.label,
//                   time: task.time || 5,
//                   price: task.price || 5,
//                   group: group.groupId,
//                   selected: true,
//                 };
//               }
//             });
//           }
//         });
        
//         setRoomAssignments(newRoomAssignments);
//         setExtraAssignments(newExtraAssignments);
        
//         setHasInitialized(true);
//       } else {
//         // CREATE MODE: Initialize with default groups
//         console.log('Initializing in CREATE mode');
//         const defaultGroups = Array.from({ length: expectedCleaners }, (_, i) => ({
//           groupId: `group_${String.fromCharCode(97 + i)}`, // a, b, c, etc.
//           rooms: [],
//           pricing: null,
//           tasks: []
//         }));
        
//         setTaskGroups(defaultGroups);
//         setHasInitialized(true);
//       }
//     }
//   }, [isEditing, existingChecklistData, hasInitialized]);

//   // Initialize rooms from apartment data
//   useEffect(() => {
//     if (selectedApartment?.roomDetails?.length) {
//       const generatedRooms = selectedApartment.roomDetails.flatMap((roomType) => {
//         const count = typeof roomType.number === 'number' ? roomType.number : 0;
//         return Array.from({ length: count }, (_, i) => ({
//           id: `${roomType.type}_${i}`,
//           type: roomType.type,
//           number: i + 1,
//           size: roomType.size || 0,
//           size_range: roomType.size_range || 'medium',
//         }));
//       });
//       setRooms(generatedRooms);
//     }
//   }, [selectedApartment]);

//   // Auto-assign all rooms to group 'a' when only one cleaner is expected
//   useEffect(() => {
//     if (expectedCleaners === 1 && rooms.length > 0) {
//       const newAssignments = {};
//       rooms.forEach(room => {
//         newAssignments[room.id] = 'a';
//       });
//       setRoomAssignments(newAssignments);
//     }
//   }, [expectedCleaners, rooms]);

//   // Calculate group summary when assignments change
//   useEffect(() => {
//     if (!hasInitialized) return;
    
//     const timePerSqft = {
//       Bedroom: 0.15,
//       Bathroom: 0.18,
//       Livingroom: 0.14,
//       Kitchen: 0.20,
//     };

//     const summary = {};

//     // Calculate for rooms
//     rooms.forEach((room) => {
//       const groupId = roomAssignments[room.id];
//       if (!groupId) return;

//       const rate = timePerSqft[room.type] || 0.15;
//       const time = room.size * rate;

//       if (!summary[groupId]) {
//         summary[groupId] = {
//           totalTime: 0,
//           rooms: [],
//           price: 0,
//           extras: [],
//           details: {},
//         };
//       }

//       summary[groupId].totalTime += time;
//       summary[groupId].rooms.push(room.id);

//       if (!summary[groupId].details[room.id]) {
//         const tasks = (checklist[room.type]?.tasks || []).map((task) => ({
//           ...task,
//           value: false,
//           name: `${task.label.toLowerCase().replace(/\s+/g, '_')}_${room.id.toLowerCase()}`
//         }));
      
//         summary[groupId].details[room.id] = {
//           photos: [],
//           tasks,
//           notes: {
//             text: roomNotes[room.id] || '',
//           },
//         };
//       }
//     });

//     // Calculate for extra tasks
//     Object.entries(extraAssignments).forEach(([taskId, val]) => {
//       if (val.selected && val.group) {
//         const groupId = val.group;
//         const time = val.time || 5;
//         const price = val.price || 5;

//         if (!summary[groupId]) {
//           summary[groupId] = {
//             totalTime: 0,
//             rooms: [],
//             price: 0,
//             extras: [],
//             details: {},
//           };
//         }

//         summary[groupId].totalTime += time;
//         summary[groupId].price += price;
//         if (val.label) summary[groupId].extras.push(val.label);

//         if (!summary[groupId].details['Extra']) {
//           summary[groupId].details['Extra'] = {
//             photos: [],
//             tasks: [],
//           };
//         }

//         const alreadyIncluded = summary[groupId].details['Extra'].tasks.some((t) => t.id === taskId);
//         if (!alreadyIncluded) {
//           summary[groupId].details['Extra'].tasks.push({
//             label: val.label,
//             value: true,
//             name: taskId,
//             id: taskId,
//             time: val.time,
//             price: val.price,
//           });
//         }
//       }
//     });

//     // Calculate prices
//     Object.keys(summary).forEach((groupId) => {
//       summary[groupId].price += parseFloat((summary[groupId].totalTime * ratePerMinute).toFixed(2));
//     });

//     // Update local state
//     setGroupSummary(summary);

//     // Calculate totals
//     const totalFee = Object.values(summary).reduce((sum, group) => sum + (group.price || 0), 0);
//     const totalTime = Object.values(summary).reduce((sum, group) => sum + (group.totalTime || 0), 0);
    
//     // Notify parent of changes
//     if (onTotalFeeChange) onTotalFeeChange(Number(totalFee.toFixed(2)));
//     if (onTotalTimeChange) onTotalTimeChange(Number(totalTime.toFixed(1)));
    
//     // Only notify parent of group summary change if it actually changed
//     const currentStr = JSON.stringify(summary);
//     const prevStr = JSON.stringify(prevGroupSummaryRef.current);
//     if (currentStr !== prevStr) {
//       prevGroupSummaryRef.current = summary;
//       if (onGroupSummaryChange) onGroupSummaryChange(summary);
//     }

//     console.log('Group Summary:', summary);
//   }, [roomAssignments, rooms, extraAssignments, roomNotes, hasInitialized]);

//   const handleAssignmentChange = (roomId, groupId) => {
//     const updated = { ...roomAssignments, [roomId]: groupId };
//     setRoomAssignments(updated);
//   };

//   const handleSaveNote = (roomId, noteText) => {
//     setRoomNotes((prev) => ({
//       ...prev,
//       [roomId]: noteText,
//     }));
//     setNoteModalVisible(false);
//   };

//   const handleExtraGroupAssign = (taskId, groupId) => {
//     setExtraAssignments((prev) => {
//       const existing = prev[taskId] || {};
//       return {
//         ...prev,
//         [taskId]: {
//           ...existing,
//           group: groupId,
//           selected: true,
//           label: existing.label || checklist.Extra.tasks.find(t => t.id === taskId)?.label || 'Unknown',
//           time: existing.time || 5,
//           price: existing.price || 5,
//         },
//       };
//     });
//   };

//   const toggleExtraTask = (task) => {
//     setExtraAssignments((prev) => {
//       const current = prev[task.id];
//       if (current) {
//         const updated = { ...prev };
//         delete updated[task.id];
//         return updated;
//       }
//       return {
//         ...prev,
//         [task.id]: {
//           label: task.label,
//           time: task.time || 5,
//           price: task.price || 5,
//           group: null,
//           selected: false,
//         },
//       };
//     });
//   };

//   // Update task groups when expectedCleaners changes
//   useEffect(() => {
//     if (hasInitialized) {
//       const newTaskGroups = Array.from({ length: expectedCleaners }, (_, i) => {
//         const groupId = `group_${String.fromCharCode(97 + i)}`;
//         const existingGroup = taskGroups.find(g => g.groupId === groupId);
        
//         return existingGroup || {
//           groupId,
//           rooms: [],
//           pricing: null,
//           tasks: []
//         };
//       });
      
//       setTaskGroups(newTaskGroups);
//     }
//   }, [expectedCleaners, hasInitialized]);

//   const getRoomIcon = (type) => {
//     switch (type) {
//       case 'Bedroom':
//         return <MaterialCommunityIcons name="bed-outline" size={26} color={COLORS.gray} style={styles.icon} />;
//       case 'Bathroom':
//         return <MaterialCommunityIcons name="shower" size={26} color={COLORS.gray} style={styles.icon} />;
//       case 'Livingroom':
//         return <MaterialCommunityIcons name="sofa-outline" size={26} color={COLORS.gray} style={styles.icon} />;
//       case 'Kitchen':
//         return <MaterialCommunityIcons name="fridge-outline" size={26} color={COLORS.gray} style={styles.icon} />;
//       default:
//         return null;
//     }
//   };

//   const chunkArray = (arr, size) => {
//     const chunks = [];
//     for (let i = 0; i < arr.length; i += size) {
//       chunks.push(arr.slice(i, i + size));
//     }
//     return chunks;
//   };

//   const checklistByRoomType = {
//     Bedroom: checklist.Bedroom.tasks,
//     Bathroom: checklist.Bathroom.tasks,
//     Livingroom: checklist.Livingroom.tasks,
//     Kitchen: checklist.Kitchen.tasks,
//   };

//   console.log('RoomAssignmentPicker state:', {
//     isEditing,
//     hasInitialized,
//     taskGroupsCount: taskGroups.length,
//     roomAssignmentsCount: Object.keys(roomAssignments).length,
//     roomsCount: rooms.length
//   });

//   if (!hasInitialized) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text>Loading checklist data...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.pickerWrapper}>
//         <View style={{ marginBottom: 0 }}>
//           <TextInput
//             mode="outlined"
//             label="Checklist Name"
//             placeholder="e.g., Mid-July Deep Clean"
//             placeholderTextColor={COLORS.darkGray}
//             outlineColor="#CCC"
//             value={checklistName}
//             onChangeText={setChecklistName}
//             activeOutlineColor={COLORS.primary}
//             style={{marginBottom:0, marginTop:40, fontSize:14, backgroundColor:"#fff"}}
//             iconName="email-outline"
//           />
//         </View>
        
//         <View style={styles.pickerContainer}>
//           <View style={styles.pickerWrapper}>
//             <FloatingLabelPickerSelect
//               label="Expected Cleaners"
//               value={expectedCleaners}
//               onValueChange={(val) => setExpectedCleaners(val)}
//               items={Array.from({ length: 10 }, (_, i) => ({
//                 label: `${i + 1}`,
//                 value: i + 1,
//               }))}
//             />
//           </View>
//           <TouchableOpacity 
//             onPress={onInfoPress} 
//             style={styles.infoIcon}
//           >
//             <MaterialIcons name="info-outline" size={26} color={COLORS.gray} />
//           </TouchableOpacity>
//         </View>

//         {rooms.map((room) => (
//           <CustomCard key={room.id} style={styles.roomBlock}>
//             <View style={styles.roomHeader}>
//               <Text style={styles.roomType}>
//                 {getRoomIcon(room.type)} {room.type} #{room.number}
//               </Text>
//               <TouchableOpacity
//                 onPress={() => {
//                   setSelectedRoomForNote(room.id);
//                   setNoteText(roomNotes[room.id] || '');
//                   setNoteModalVisible(true);
//                 }}
//               >
//                 <Icon
//                   name={roomNotes[room.id] ? 'note-edit-outline' : 'note-plus'}
//                   size={24}
//                   color={COLORS.primary_light}
//                 />
//               </TouchableOpacity>
//             </View>

//             {roomNotes[room.id] ? (
//               <Text style={styles.notePreview}>Note: {roomNotes[room.id].slice(0, 40)}...</Text>
//             ) : null}
            
//             {expectedCleaners > 1 && (
//               <FloatingLabelPickerSelect
//                 label="Assign to"
//                 value={roomAssignments[room.id] || null}
//                 onValueChange={(groupId) => handleAssignmentChange(room.id, groupId)}
//                 items={taskGroups.map((group) => ({
//                   label: group.groupId.toUpperCase(),
//                   value: group.groupId,
//                 }))}
//               />
//             )}
            
//             {roomAssignments[room.id] && (
//               <View style={styles.tasksWrapper}>
//                 {chunkArray(checklistByRoomType[room.type] || [], 2).map((row, rowIndex) => (
//                   <View key={rowIndex} style={styles.taskRow}>
//                     {row.map((task) => (
//                       <View key={task.id} style={styles.taskColumn}>
//                         <View style={styles.dotRow}>
//                           <View style={styles.dot} />
//                           <Text style={styles.taskLabel}>{task.label}</Text>
//                         </View>
//                       </View>
//                     ))}
//                   </View>
//                 ))}
//               </View>
//             )}
//           </CustomCard>
//         ))}

//         <CustomCard style={styles.roomBlock}>
//           <Text style={styles.roomType}>Extra Tasks</Text>
//           {checklist.Extra.tasks.map((task) => (
//             <View key={task.id} style={styles.extraRow}>
//               <Checkbox.Android
//                 status={extraAssignments[task.id]?.selected ? 'checked' : 'unchecked'}
//                 onPress={() => {
//                   if (expectedCleaners === 1) {
//                     setExtraAssignments((prev) => {
//                       const current = prev[task.id];
//                       if (current?.selected) {
//                         const updated = { ...prev };
//                         delete updated[task.id];
//                         return updated;
//                       }
//                       return {
//                         ...prev,
//                         [task.id]: {
//                           label: task.label,
//                           time: task.time || 5,
//                           price: task.price || 5,
//                           group: 'a',
//                           selected: true,
//                         },
//                       };
//                     });
//                   } else {
//                     toggleExtraTask(task);
//                   }
//                 }}
//                 color={COLORS.primary_light}
//               />
//               <Text style={[styles.taskLabel, { flex: 1 }]}>{task.label}</Text>

//               {expectedCleaners > 1 && (
//                 <View style={{ width: 140 }}>
//                   <FloatingLabelPickerSelect
//                     label="Assign to"
//                     value={extraAssignments[task.id]?.group || null}
//                     onValueChange={(groupId) => handleExtraGroupAssign(task.id, groupId)}
//                     items={taskGroups.map((group) => ({
//                       label: group.groupId.toUpperCase(),
//                       value: group.groupId,
//                     }))}
//                   />
//                 </View>
//               )}
//             </View>
//           ))}
//         </CustomCard>

//         {Object.keys(groupSummary).length > 0 && (
//           <View style={styles.summaryContainer}>
//             <Text style={styles.summaryHeader}>Group Summary</Text>
//             {Object.entries(groupSummary).map(([groupId, data]) => (
//               <View key={groupId} style={styles.summaryItem}>
//                 <Text style={styles.summaryGroupId}>Group {groupId.toUpperCase()}</Text>
//                 <Text>Total Time: {data.totalTime.toFixed(1)} mins</Text>
//                 <Text>Price: ${data.price.toFixed(2)}</Text>
//                 <Text>
//                   Rooms: {Object.entries(data.rooms.reduce((acc, roomId) => {
//                     const roomType = roomId.split('_')[0];
//                     acc[roomType] = (acc[roomType] || 0) + 1;
//                     return acc;
//                   }, {})).map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`).join(', ')}
//                 </Text>
//                 {data.extras.length > 0 && <Text>Extras: {data.extras.join(', ')}</Text>}
//               </View>
//             ))}
//           </View>
//         )}

//         {noteModalVisible && (
//           <Modal visible={noteModalVisible} transparent animationType="fade">
//             <View style={styles.modalOverlay}>
//               <View style={styles.modalContent}>
//                 <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Add Note</Text>
//                 <TextInput
//                   mode="outlined"
//                   multiline
//                   numberOfLines={4}
//                   value={noteText}
//                   onChangeText={setNoteText}
//                   placeholder="Add your note for this room..."
//                   placeholderTextColor={COLORS.darkGray}
//                   outlineColor="#CCC"
//                   activeOutlineColor={COLORS.primary}
//                   style={{marginBottom:0, marginTop:10, fontSize:14, backgroundColor:"#fff"}}
//                 />
//                 <Button mode="contained" onPress={() => handleSaveNote(selectedRoomForNote, noteText)} style={{ marginTop: 10, backgroundColor:COLORS.primary }}>
//                   Save Note
//                 </Button>
//               </View>
//             </View>
//           </Modal>
//         )}
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     paddingTop: 10,
//   },
//   roomBlock: {
//     borderWidth: 1,
//     borderColor: '#eee',
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 20,
//     backgroundColor: '#fff',
//   },
//   roomHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },  
//   roomType: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   notePreview: {
//     fontStyle: 'italic',
//     fontSize: 12,
//     color: COLORS.gray,
//     marginBottom: 0,
//   },
//   taskRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   taskColumn: {
//     flex: 1,
//     paddingRight: 10,
//   },
//   tasksWrapper: {
//     marginTop: 12,
//   },
//   dotRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   dot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: COLORS.primary_light || '#1976d2',
//     marginRight: 8,
//   },
//   taskLabel: {
//     fontSize: 14,
//     color: '#333',
//   },
//   extraRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 0,
//     gap: 8,
//     flexWrap: 'nowrap',
//   },
//   summaryContainer: {
//     padding: 10,
//     backgroundColor: '#f8f8f8',
//     borderRadius: 8,
//     marginTop: 10,
//   },
//   summaryHeader: {
//     fontWeight: 'bold',
//     fontSize: 16,
//     marginBottom: 10,
//   },
//   summaryItem: {
//     marginBottom: 10,
//   },
//   summaryGroupId: {
//     fontWeight: '600',
//     fontSize: 15,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     padding: 20,
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 20,
//   },
//   pickerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   pickerWrapper: {
//     flex: 1,
//     marginRight: 10,
//   },
//   infoIcon: {
//     padding: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingContainer: {
//     padding: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   icon: {
//     marginRight: 8,
//   },
// });

// export default RoomAssignmentPicker;





// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
// import FloatingLabelPickerSelect from '../../../components/shared/FloatingLabelPicker';
// import { checklist } from '../../../utils/tasks_photo';
// import { Checkbox, TextInput, Button } from 'react-native-paper';
// import COLORS from '../../../constants/colors';
// import CustomCard from '../../../components/shared/CustomCard';
// import { MaterialCommunityIcons, MaterialIcons, AntDesign } from '@expo/vector-icons';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// const ratePerMinute = 0.8;

// const RoomAssignmentPicker = ({ 
//     selectedApartment, 
//     onGroupSummaryChange,
//     onTotalFeeChange,
//     onTotalTimeChange,
//     onInfoPress,
//     checklistName,
//     setChecklistName,
//     isEditing = false,
//     existingChecklistData = null,
//     ...props
// }) => {
//   const [rooms, setRooms] = useState([]);
//   const [roomAssignments, setRoomAssignments] = useState({});
//   const [extraAssignments, setExtraAssignments] = useState({});
//   const [groupSummary, setGroupSummary] = useState({});
//   const [roomNotes, setRoomNotes] = useState({});
//   const [noteModalVisible, setNoteModalVisible] = useState(false);
//   const [noteText, setNoteText] = useState('');
//   const [selectedRoomForNote, setSelectedRoomForNote] = useState(null);
//   const [expectedCleaners, setExpectedCleaners] = useState(1);
  
//   const [hasInitialized, setHasInitialized] = useState(false);
  
//   const prevGroupSummaryRef = useRef({});
//   const prevExistingDataRef = useRef(null);
//   const initializationAttempted = useRef(false);

//   // Debug logging
//   useEffect(() => {
//     console.log('RoomAssignmentPicker - Current state:', {
//       isEditing,
//       hasInitialized,
//       expectedCleaners,
//       roomsCount: rooms.length,
//       roomAssignments: Object.keys(roomAssignments),
//       extraAssignments: Object.keys(extraAssignments),
//       existingChecklistData: existingChecklistData ? {
//         type: typeof existingChecklistData,
//         isArray: Array.isArray(existingChecklistData),
//         keys: Object.keys(existingChecklistData || {})
//       } : null
//     });
//   }, [isEditing, hasInitialized, expectedCleaners, rooms, roomAssignments, extraAssignments]);

//   // Initialize rooms from apartment data
//   useEffect(() => {
//     if (selectedApartment?.roomDetails?.length) {
//       console.log('Initializing rooms from apartment:', selectedApartment.roomDetails);
      
//       const generatedRooms = selectedApartment.roomDetails.flatMap((roomType) => {
//         const count = typeof roomType.number === 'number' ? roomType.number : 0;
//         return Array.from({ length: count }, (_, i) => ({
//           id: `${roomType.type}_${i + 1}`,
//           type: roomType.type,
//           number: i + 1,
//           size: roomType.size || 0,
//           size_range: roomType.size_range || 'medium',
//         }));
//       });
      
//       console.log('Generated rooms:', generatedRooms);
//       setRooms(generatedRooms);
//     } else {
//       console.log('No room details found in apartment:', selectedApartment);
//       setRooms([]);
//     }
//   }, [selectedApartment]);

//   // Initialize from existing checklist data
//   useEffect(() => {
//     if (!hasInitialized && !initializationAttempted.current) {
//       initializationAttempted.current = true;
      
//       if (isEditing && existingChecklistData) {
//         console.log('INITIALIZING EDIT MODE WITH EXISTING DATA:', existingChecklistData);
        
//         try {
//           // The existingChecklistData should be the groupSummary structure
//           // Example: { group_a: { rooms: [...], details: {...}, ... }, group_b: {...} }
          
//           let parsedRoomAssignments = {};
//           let parsedExtraAssignments = {};
//           let groupCount = 0;
          
//           // Check if it's the correct group summary structure
//           if (typeof existingChecklistData === 'object' && existingChecklistData !== null) {
//             const groupKeys = Object.keys(existingChecklistData);
            
//             // Check if first key looks like a group (group_a, group_b, a, b, etc.)
//             const isGroupStructure = groupKeys.some(key => 
//               key.startsWith('group_') || 
//               key === 'a' || key === 'b' || key === 'c' || key === 'd'
//             );
            
//             if (isGroupStructure) {
//               console.log('Detected group structure, parsing...');
              
//               groupCount = groupKeys.length;
              
//               // Parse each group
//               groupKeys.forEach(groupId => {
//                 const group = existingChecklistData[groupId];
                
//                 // Parse room assignments
//                 if (Array.isArray(group.rooms)) {
//                   group.rooms.forEach(roomId => {
//                     parsedRoomAssignments[roomId] = groupId;
//                   });
//                 }
                
//                 // Parse extra tasks from details
//                 if (group.details && group.details.Extra && Array.isArray(group.details.Extra.tasks)) {
//                   group.details.Extra.tasks.forEach(task => {
//                     if (task.id) {
//                       parsedExtraAssignments[task.id] = {
//                         label: task.label || task.name,
//                         time: task.time || 5,
//                         price: task.price || 5,
//                         group: groupId,
//                         selected: true,
//                       };
//                     }
//                   });
//                 }
                
//                 // Also check extras array
//                 if (Array.isArray(group.extras)) {
//                   group.extras.forEach(extraLabel => {
//                     // Find the corresponding task from checklist.Extra.tasks
//                     const extraTask = checklist.Extra.tasks.find(t => t.label === extraLabel);
//                     if (extraTask) {
//                       parsedExtraAssignments[extraTask.id] = {
//                         label: extraTask.label,
//                         time: extraTask.time || 5,
//                         price: extraTask.price || 5,
//                         group: groupId,
//                         selected: true,
//                       };
//                     }
//                   });
//                 }
//               });
//             } else {
//               // Try to parse as array format
//               if (Array.isArray(existingChecklistData)) {
//                 console.log('Detected array structure, parsing...');
                
//                 groupCount = existingChecklistData.length;
                
//                 existingChecklistData.forEach((group, index) => {
//                   const groupId = group.groupId || `group_${index + 1}`;
                  
//                   if (Array.isArray(group.rooms)) {
//                     group.rooms.forEach(roomId => {
//                       parsedRoomAssignments[roomId] = groupId;
//                     });
//                   }
                  
//                   if (Array.isArray(group.tasks)) {
//                     group.tasks.forEach(task => {
//                       if (task.category === 'extra' || task.type === 'extra') {
//                         const taskKey = task.id || task.label;
//                         parsedExtraAssignments[taskKey] = {
//                           label: task.label,
//                           time: task.time || 5,
//                           price: task.price || 5,
//                           group: groupId,
//                           selected: true,
//                         };
//                       }
//                     });
//                   }
//                 });
//               }
//             }
//           }
          
//           console.log('Parsed room assignments:', parsedRoomAssignments);
//           console.log('Parsed extra assignments:', parsedExtraAssignments);
          
//           setRoomAssignments(parsedRoomAssignments);
//           setExtraAssignments(parsedExtraAssignments);
//           setExpectedCleaners(groupCount > 0 ? groupCount : 1);
//           setHasInitialized(true);
          
//         } catch (error) {
//           console.error('Error initializing from existing data:', error);
//           setHasInitialized(true);
//         }
//       } else {
//         console.log('Initializing in CREATE mode');
//         setHasInitialized(true);
//       }
//     }
//   }, [isEditing, existingChecklistData, hasInitialized]);

  


//   useEffect(() => {
//     if (hasInitialized && expectedCleaners === 1 && rooms.length > 0) {
//       const newAssignments = {};
//       rooms.forEach(room => {
//         newAssignments[room.id] = 'group_a';
//       });
//       setRoomAssignments(newAssignments);
//     }
//   }, [expectedCleaners, rooms, hasInitialized]);

//   // Calculate group summary when assignments change
//   useEffect(() => {
//     if (!hasInitialized) return;
    
//     console.log('Calculating group summary...');
    
//     const timePerSqft = {
//       Bedroom: 0.15,
//       Bathroom: 0.18,
//       Livingroom: 0.14,
//       Kitchen: 0.20,
//     };

//     const summary = {};

//     // Calculate for rooms
//     rooms.forEach((room) => {
//       const groupId = roomAssignments[room.id];
//       if (!groupId) return;

//       const rate = timePerSqft[room.type] || 0.15;
//       const time = room.size * rate;

//       if (!summary[groupId]) {
//         summary[groupId] = {
//           totalTime: 0,
//           rooms: [],
//           price: 0,
//           extras: [],
//           details: {},
//         };
//       }

//       summary[groupId].totalTime += time;
//       summary[groupId].rooms.push(room.id);

//       if (!summary[groupId].details[room.id]) {
//         const tasks = (checklist[room.type]?.tasks || []).map((task) => ({
//           ...task,
//           value: false,
//           name: `${task.label.toLowerCase().replace(/\s+/g, '_')}_${room.id.toLowerCase()}`
//         }));
      
//         summary[groupId].details[room.id] = {
//           photos: [],
//           tasks,
//           notes: {
//             text: roomNotes[room.id] || '',
//           },
//         };
//       }
//     });

//     // Calculate for extra tasks
//     Object.entries(extraAssignments).forEach(([taskId, val]) => {
//       if (val.selected && val.group) {
//         const groupId = val.group;
//         const time = val.time || 5;
//         const price = val.price || 5;

//         if (!summary[groupId]) {
//           summary[groupId] = {
//             totalTime: 0,
//             rooms: [],
//             price: 0,
//             extras: [],
//             details: {},
//           };
//         }

//         summary[groupId].totalTime += time;
//         summary[groupId].price += price;
//         if (val.label) summary[groupId].extras.push(val.label);

//         if (!summary[groupId].details['Extra']) {
//           summary[groupId].details['Extra'] = {
//             photos: [],
//             tasks: [],
//           };
//         }

//         const alreadyIncluded = summary[groupId].details['Extra'].tasks.some((t) => t.id === taskId);
//         if (!alreadyIncluded) {
//           summary[groupId].details['Extra'].tasks.push({
//             label: val.label,
//             value: true,
//             name: taskId,
//             id: taskId,
//             time: val.time,
//             price: val.price,
//           });
//         }
//       }
//     });

//     // Calculate prices
//     Object.keys(summary).forEach((groupId) => {
//       summary[groupId].price += parseFloat((summary[groupId].totalTime * ratePerMinute).toFixed(2));
//     });

//     console.log('Calculated summary:', summary);
//     setGroupSummary(summary);

//     // Calculate totals
//     const totalFee = Object.values(summary).reduce((sum, group) => sum + (group.price || 0), 0);
//     const totalTime = Object.values(summary).reduce((sum, group) => sum + (group.totalTime || 0), 0);
    
//     // Notify parent of changes
//     if (onTotalFeeChange) onTotalFeeChange(Number(totalFee.toFixed(2)));
//     if (onTotalTimeChange) onTotalTimeChange(Number(totalTime.toFixed(1)));
    
//     // Notify parent of group summary change
//     const currentStr = JSON.stringify(summary);
//     const prevStr = JSON.stringify(prevGroupSummaryRef.current);
//     if (currentStr !== prevStr) {
//       prevGroupSummaryRef.current = summary;
//       if (onGroupSummaryChange) {
//         console.log('Notifying parent of group summary change');
//         onGroupSummaryChange(summary);
//       }
//     }
//   }, [roomAssignments, rooms, extraAssignments, roomNotes, hasInitialized]);

//   const handleAssignmentChange = (roomId, groupId) => {
//     console.log('Assignment change:', roomId, '->', groupId);
//     const updated = { ...roomAssignments, [roomId]: groupId };
//     setRoomAssignments(updated);
//   };

//   const handleSaveNote = (roomId, noteText) => {
//     setRoomNotes((prev) => ({
//       ...prev,
//       [roomId]: noteText,
//     }));
//     setNoteModalVisible(false);
//   };

//   const handleExtraGroupAssign = (taskId, groupId) => {
    
//     setExtraAssignments((prev) => {
//       const existing = prev[taskId] || {};
//       return {
//         ...prev,
//         [taskId]: {
//           ...existing,
//           group: groupId,
//           selected: true,
//           label: existing.label || checklist.Extra.tasks.find(t => t.id === taskId)?.label || 'Unknown',
//           time: existing.time || 5,
//           price: existing.price || 5,
//         },
//       };
//     });
//   };

//   const toggleExtraTask = (task) => {
//     setExtraAssignments((prev) => {
//       const current = prev[task.id];
//       if (current) {
//         const updated = { ...prev };
//         delete updated[task.id];
//         return updated;
//       }
//       return {
//         ...prev,
//         [task.id]: {
//           label: task.label,
//           time: task.time || 5,
//           price: task.price || 5,
//           group: null,
//           selected: false,
//         },
//       };
//     });
//   };

//   const getRoomIcon = (type) => {
//     switch (type) {
//       case 'Bedroom':
//         return <MaterialCommunityIcons name="bed-outline" size={26} color={COLORS.gray} style={styles.icon} />;
//       case 'Bathroom':
//         return <MaterialCommunityIcons name="shower" size={26} color={COLORS.gray} style={styles.icon} />;
//       case 'Livingroom':
//         return <MaterialCommunityIcons name="sofa-outline" size={26} color={COLORS.gray} style={styles.icon} />;
//       case 'Kitchen':
//         return <MaterialCommunityIcons name="fridge-outline" size={26} color={COLORS.gray} style={styles.icon} />;
//       default:
//         return null;
//     }
//   };

//   const chunkArray = (arr, size) => {
//     const chunks = [];
//     for (let i = 0; i < arr.length; i += size) {
//       chunks.push(arr.slice(i, i + size));
//     }
//     return chunks;
//   };

//   const checklistByRoomType = {
//     Bedroom: checklist.Bedroom.tasks,
//     Bathroom: checklist.Bathroom.tasks,
//     Livingroom: checklist.Livingroom.tasks,
//     Kitchen: checklist.Kitchen.tasks,
//   };

//   // Generate task groups for the picker
//   const taskGroups = Array.from({ length: expectedCleaners }, (_, i) => {
//     const groupId = `group_${String.fromCharCode(97 + i)}`;

//     return {
//       groupId,
//       label: `Group ${groupId.toUpperCase()}`,
//       value: groupId,
//     };
//   });

//   if (!hasInitialized) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="small" color={COLORS.primary} />
//         <Text style={styles.loadingText}>Loading checklist data...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.pickerWrapper}>
//         <View style={{ marginBottom: 0 }}>
//           <TextInput
//             mode="outlined"
//             label="Checklist Name"
//             placeholder="e.g., Mid-July Deep Clean"
//             placeholderTextColor={COLORS.darkGray}
//             outlineColor="#CCC"
//             value={checklistName}
//             onChangeText={setChecklistName}
//             activeOutlineColor={COLORS.primary}
//             style={{marginBottom:0, marginTop:40, fontSize:14, backgroundColor:"#fff"}}
//           />
//         </View>
        
//         <View style={styles.pickerContainer}>
//           <View style={styles.pickerWrapper}>
//             <FloatingLabelPickerSelect
//               label="Expected Cleaners"
//               value={expectedCleaners}
//               onValueChange={(val) => setExpectedCleaners(val)}
//               items={Array.from({ length: 10 }, (_, i) => ({
//                 label: `${i + 1}`,
//                 value: i + 1,
//               }))}
//             />
//           </View>
//           <TouchableOpacity 
//             onPress={onInfoPress} 
//             style={styles.infoIcon}
//           >
//             <MaterialIcons name="info-outline" size={26} color={COLORS.gray} />
//           </TouchableOpacity>
//         </View>

//         {rooms.length === 0 ? (
//           <CustomCard style={styles.roomBlock}>
//             <Text style={styles.roomType}>No rooms found</Text>
//             <Text style={styles.notePreview}>
//               This property doesn't have any rooms configured.
//             </Text>
//           </CustomCard>
//         ) : (
//           rooms.map((room) => (
//             <CustomCard key={room.id} style={styles.roomBlock}>
//               <View style={styles.roomHeader}>
//                 <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                   {getRoomIcon(room.type)}
//                   <Text style={styles.roomType}>
//                     {room.type} #{room.number}
//                   </Text>
//                 </View>
//                 <TouchableOpacity
//                   onPress={() => {
//                     setSelectedRoomForNote(room.id);
//                     setNoteText(roomNotes[room.id] || '');
//                     setNoteModalVisible(true);
//                   }}
//                 >
//                   <Icon
//                     name={roomNotes[room.id] ? 'note-edit-outline' : 'note-plus'}
//                     size={24}
//                     color={COLORS.primary_light}
//                   />
//                 </TouchableOpacity>
//               </View>

//               {roomNotes[room.id] ? (
//                 <Text style={styles.notePreview}>Note: {roomNotes[room.id].slice(0, 40)}...</Text>
//               ) : null}
              
//               {expectedCleaners > 1 ? (
//                 <FloatingLabelPickerSelect
//                   label="Assign to"
//                   value={roomAssignments[room.id] || null}
//                   onValueChange={(groupId) => handleAssignmentChange(room.id, groupId)}
//                   items={taskGroups}
//                 />
//               ) : (
//                 <Text style={styles.assignedText}>Assigned to Group A</Text>
//               )}
              
//               {roomAssignments[room.id] && (
//                 <View style={styles.tasksWrapper}>
//                   {chunkArray(checklistByRoomType[room.type] || [], 2).map((row, rowIndex) => (
//                     <View key={rowIndex} style={styles.taskRow}>
//                       {row.map((task) => (
//                         <View key={task.id} style={styles.taskColumn}>
//                           <View style={styles.dotRow}>
//                             <View style={styles.dot} />
//                             <Text style={styles.taskLabel}>{task.label}</Text>
//                           </View>
//                         </View>
//                       ))}
//                     </View>
//                   ))}
//                 </View>
//               )}
//             </CustomCard>
//           ))
//         )}

//         <CustomCard style={styles.roomBlock}>
//           <Text style={styles.roomType}>Extra Tasks</Text>
//           {checklist.Extra.tasks.map((task) => {
//             const isSelected = extraAssignments[task.id]?.selected;
//             const assignedGroup = extraAssignments[task.id]?.group;
            
//             return (
//               <View key={task.id} style={styles.extraRow}>
//                 <Checkbox.Android
//                   status={isSelected ? 'checked' : 'unchecked'}
//                   onPress={() => {
//                     if (expectedCleaners === 1) {
//                       // For single cleaner, toggle with auto-assignment to group 'a'
//                       if (isSelected) {
//                         setExtraAssignments(prev => {
//                           const updated = { ...prev };
//                           delete updated[task.id];
//                           return updated;
//                         });
//                       } else {
//                         setExtraAssignments(prev => ({
//                           ...prev,
//                           [task.id]: {
//                             label: task.label,
//                             time: task.time || 5,
//                             price: task.price || 5,
//                             group: 'group_a',
//                             selected: true,
//                           },
//                         }));
//                       }
//                     } else {
//                       // For multiple cleaners, toggle without auto-assignment
//                       toggleExtraTask(task);
//                     }
//                   }}
//                   color={COLORS.primary_light}
//                 />
//                 <Text style={[styles.taskLabel, { flex: 1 }]}>{task.label}</Text>
                  
//                 {expectedCleaners > 1 && (
//                   <View style={{ width: 140 }}>
//                     <FloatingLabelPickerSelect
//                       label="Assign to"
//                       value={assignedGroup || null}
//                       onValueChange={(groupId) => handleExtraGroupAssign(task.id, groupId)}
//                       items={taskGroups}
//                     />
//                   </View>
//                 )}
//               </View>
//             );
//           })}
//         </CustomCard>

//         {/* {Object.keys(groupSummary).length > 0 && (
//           <View style={styles.summaryContainer}>
//             <Text style={styles.summaryHeader}>Group Summary</Text>
//             {Object.entries(groupSummary).map(([groupId, data]) => (
//               <View key={groupId} style={styles.summaryItem}>
//                 <Text style={styles.summaryGroupId}>Group {groupId.toUpperCase()}</Text>
//                 <Text>Total Time: {data.totalTime.toFixed(1)} mins</Text>
//                 <Text>Price: ${data.price.toFixed(2)}</Text>
//                 <Text>
//                   Rooms: {Object.entries(data.rooms.reduce((acc, roomId) => {
//                     const roomType = roomId.split('_')[0];
//                     acc[roomType] = (acc[roomType] || 0) + 1;
//                     return acc;
//                   }, {})).map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`).join(', ')}
//                 </Text>
//                 {data.extras.length > 0 && <Text>Extras: {data.extras.join(', ')}</Text>}
//               </View>
//             ))}
//           </View>
//         )} */}
//       {Object.keys(groupSummary).length > 0 && (
//         <View style={styles.summaryContainer}>
//           <View style={styles.summaryHeaderRow}>
//             <Text style={styles.summaryTitle}>Summary</Text>
//             <Text style={styles.totalTime}>
//               {Object.values(groupSummary).reduce((sum, group) => sum + group.totalTime, 0).toFixed(1)} min
//             </Text>
//           </View>
          
//           {Object.entries(groupSummary).map(([groupId, data]) => {
//             const roomCounts = data.rooms.reduce((acc, roomId) => {
//               const roomType = roomId.split('_')[0];
//               acc[roomType] = (acc[roomType] || 0) + 1;
//               return acc;
//             }, {});
            
//             const roomSummary = Object.entries(roomCounts)
//               .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
//               .join(', ');
              
//             return (
//               <View key={groupId} style={styles.groupItem}>
//                 <View style={styles.groupHeader}>
//                   <Text style={styles.groupName}>Group {groupId.replace('group_', '').toUpperCase()}</Text>
//                   <Text style={styles.groupPrice}>${data.price.toFixed(2)}</Text>
//                 </View>
                
//                 <View style={styles.groupDetails}>
//                   <Text style={styles.detailText}>{data.totalTime.toFixed(1)} min • {roomSummary}</Text>
//                   {data.extras.length > 0 && (
//                     <Text style={styles.extrasText}>{data.extras.join(', ')}</Text>
//                   )}
//                 </View>
//               </View>
//             );
//           })}
//         </View>
//       )}
//         {noteModalVisible && (
//           <Modal visible={noteModalVisible} transparent animationType="fade">
//             <View style={styles.modalOverlay}>
//               <View style={styles.modalContent}>
//                 <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Add Note</Text>
//                 <TextInput
//                   mode="outlined"
//                   multiline
//                   numberOfLines={4}
//                   value={noteText}
//                   onChangeText={setNoteText}
//                   placeholder="Add your note for this room..."
//                   placeholderTextColor={COLORS.darkGray}
//                   outlineColor="#CCC"
//                   activeOutlineColor={COLORS.primary}
//                   style={{marginBottom:0, marginTop:10, fontSize:14, backgroundColor:"#fff"}}
//                 />
//                 <Button mode="contained" onPress={() => handleSaveNote(selectedRoomForNote, noteText)} style={{ marginTop: 10, backgroundColor:COLORS.primary }}>
//                   Save Note
//                 </Button>
//                 <Button mode="outlined" onPress={() => setNoteModalVisible(false)} style={{ marginTop: 10 }}>
//                   Cancel
//                 </Button>
//               </View>
//             </View>
//           </Modal>
//         )}
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     paddingTop: 10,
//   },
//   roomBlock: {
//     borderWidth: 1,
//     borderColor: '#eee',
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 20,
//     backgroundColor: '#fff',
//   },
//   roomHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },  
//   roomType: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   assignedText: {
//     fontSize: 14,
//     color: COLORS.primary,
//     marginTop: 8,
//     fontStyle: 'italic',
//   },
//   notePreview: {
//     fontStyle: 'italic',
//     fontSize: 12,
//     color: COLORS.gray,
//     marginBottom: 0,
//   },
//   taskRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   taskColumn: {
//     flex: 1,
//     paddingRight: 10,
//   },
//   tasksWrapper: {
//     marginTop: 12,
//   },
//   dotRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   dot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: COLORS.primary_light || '#1976d2',
//     marginRight: 8,
//   },
//   taskLabel: {
//     fontSize: 14,
//     color: '#333',
//   },
//   extraRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 0,
//     gap: 8,
//     flexWrap: 'nowrap',
//   },
//   summaryContainer: {
//     padding: 10,
//     backgroundColor: '#f8f8f8',
//     borderRadius: 8,
//     marginTop: 10,
//   },
//   summaryHeader: {
//     fontWeight: 'bold',
//     fontSize: 16,
//     marginBottom: 10,
//   },
//   summaryItem: {
//     marginBottom: 10,
//   },
//   summaryGroupId: {
//     fontWeight: '600',
//     fontSize: 15,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     padding: 20,
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 20,
//   },
//   pickerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   pickerWrapper: {
//     flex: 1,
//     marginRight: 10,
//   },
//   infoIcon: {
//     padding: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingContainer: {
//     padding: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   loadingText: {
//     marginTop: 8,
//     fontSize: 14,
//     color: COLORS.gray,
//   },
//   icon: {
//     marginRight: 8,
//   },







//   summaryContainer: {
//     marginTop: 24,
//     paddingHorizontal: 4,
//   },
  
//   summaryHeaderRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//     paddingBottom: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eaeaea',
//   },
  
//   summaryTitle: {
//     fontSize: 18,
//     fontWeight: '500',
//     color: '#333',
//   },
  
//   totalTime: {
//     fontSize: 14,
//     color: '#666',
//   },
  
//   groupItem: {
//     marginBottom: 12,
//     paddingBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
  
//   groupHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
  
//   groupName: {
//     fontSize: 15,
//     fontWeight: '500',
//     color: '#333',
//   },
  
//   groupPrice: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//   },
  
//   groupDetails: {
//     paddingLeft: 2,
//   },
  
//   detailText: {
//     fontSize: 13,
//     color: '#666',
//     lineHeight: 18,
//   },
  
//   extrasText: {
//     fontSize: 12,
//     color: '#888',
//     fontStyle: 'italic',
//     marginTop: 2,
//   },
// });

// export default RoomAssignmentPicker;





import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import FloatingLabelPickerSelect from '../../../components/shared/FloatingLabelPicker';
import { checklist } from '../../../utils/tasks_photo';
import { Checkbox, TextInput, Button } from 'react-native-paper';
import COLORS from '../../../constants/colors';
import CustomCard from '../../../components/shared/CustomCard';
import { MaterialCommunityIcons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ratePerMinute = 0.8;

const RoomAssignmentPicker = ({ 
    selectedApartment, 
    onGroupSummaryChange,
    onTotalFeeChange,
    onTotalTimeChange,
    onInfoPress,
    checklistName,
    setChecklistName,
    isEditing = false,
    existingChecklistData = null,
    ...props
}) => {
  const [rooms, setRooms] = useState([]);
  const [roomAssignments, setRoomAssignments] = useState({});
  const [extraAssignments, setExtraAssignments] = useState({});
  const [groupSummary, setGroupSummary] = useState({});
  const [roomNotes, setRoomNotes] = useState({});
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [selectedRoomForNote, setSelectedRoomForNote] = useState(null);
  const [expectedCleaners, setExpectedCleaners] = useState(1);
  
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const prevGroupSummaryRef = useRef({});
  const prevExistingDataRef = useRef(null);
  const initializationAttempted = useRef(false);

  // Debug logging
  useEffect(() => {
    console.log('RoomAssignmentPicker - Current state:', {
      isEditing,
      hasInitialized,
      expectedCleaners,
      roomsCount: rooms.length,
      roomAssignments: Object.keys(roomAssignments),
      extraAssignments: Object.keys(extraAssignments),
      roomNotes: Object.keys(roomNotes),
      existingChecklistData: existingChecklistData ? {
        type: typeof existingChecklistData,
        isArray: Array.isArray(existingChecklistData),
        keys: Object.keys(existingChecklistData || {})
      } : null
    });
  }, [isEditing, hasInitialized, expectedCleaners, rooms, roomAssignments, extraAssignments, roomNotes]);

  // Initialize rooms from apartment data
  useEffect(() => {
    if (selectedApartment?.roomDetails?.length) {
      console.log('Initializing rooms from apartment:', selectedApartment.roomDetails);
      
      const generatedRooms = selectedApartment.roomDetails.flatMap((roomType) => {
        const count = typeof roomType.number === 'number' ? roomType.number : 0;
        return Array.from({ length: count }, (_, i) => ({
          id: `${roomType.type}_${i + 1}`,
          type: roomType.type,
          number: i + 1,
          size: roomType.size || 0,
          size_range: roomType.size_range || 'medium',
        }));
      });
      
      console.log('Generated rooms:', generatedRooms);
      setRooms(generatedRooms);
    } else {
      console.log('No room details found in apartment:', selectedApartment);
      setRooms([]);
    }
  }, [selectedApartment]);

  // Initialize from existing checklist data
  useEffect(() => {
    if (!hasInitialized && !initializationAttempted.current) {
      initializationAttempted.current = true;
      
      if (isEditing && existingChecklistData) {
        console.log('INITIALIZING EDIT MODE WITH EXISTING DATA:', existingChecklistData);
        
        try {
          // The existingChecklistData should be the groupSummary structure
          // Example: { group_a: { rooms: [...], details: {...}, ... }, group_b: {...} }
          
          let parsedRoomAssignments = {};
          let parsedExtraAssignments = {};
          let parsedRoomNotes = {};
          let groupCount = 0;
          
          // Check if it's the correct group summary structure
          if (typeof existingChecklistData === 'object' && existingChecklistData !== null) {
            const groupKeys = Object.keys(existingChecklistData);
            
            // Check if first key looks like a group (group_a, group_b, a, b, etc.)
            const isGroupStructure = groupKeys.some(key => 
              key.startsWith('group_') || 
              key === 'a' || key === 'b' || key === 'c' || key === 'd'
            );
            
            if (isGroupStructure) {
              console.log('Detected group structure, parsing...');
              
              groupCount = groupKeys.length;
              
              // Parse each group
              groupKeys.forEach(groupId => {
                const group = existingChecklistData[groupId];
                
                // Parse room assignments
                if (Array.isArray(group.rooms)) {
                  group.rooms.forEach(roomId => {
                    parsedRoomAssignments[roomId] = groupId;
                  });
                }
                
                // Parse room notes from details
                if (group.details) {
                  Object.entries(group.details).forEach(([key, detail]) => {
                    // Check if this is a room detail (not 'Extra')
                    if (key !== 'Extra' && detail.notes && detail.notes.text) {
                      // Store the note for this room
                      parsedRoomNotes[key] = detail.notes.text;
                    }
                  });
                }
                
                // Parse extra tasks from details
                if (group.details && group.details.Extra && Array.isArray(group.details.Extra.tasks)) {
                  group.details.Extra.tasks.forEach(task => {
                    if (task.id) {
                      parsedExtraAssignments[task.id] = {
                        label: task.label || task.name,
                        time: task.time || 5,
                        price: task.price || 5,
                        group: groupId,
                        selected: true,
                      };
                    }
                  });
                }
                
                // Also check extras array
                if (Array.isArray(group.extras)) {
                  group.extras.forEach(extraLabel => {
                    // Find the corresponding task from checklist.Extra.tasks
                    const extraTask = checklist.Extra.tasks.find(t => t.label === extraLabel);
                    if (extraTask) {
                      parsedExtraAssignments[extraTask.id] = {
                        label: extraTask.label,
                        time: extraTask.time || 5,
                        price: extraTask.price || 5,
                        group: groupId,
                        selected: true,
                      };
                    }
                  });
                }
              });
            } else {
              // Try to parse as array format
              if (Array.isArray(existingChecklistData)) {
                console.log('Detected array structure, parsing...');
                
                groupCount = existingChecklistData.length;
                
                existingChecklistData.forEach((group, index) => {
                  const groupId = group.groupId || `group_${index + 1}`;
                  
                  if (Array.isArray(group.rooms)) {
                    group.rooms.forEach(roomId => {
                      parsedRoomAssignments[roomId] = groupId;
                    });
                  }
                  
                  // Parse room notes from array format if available
                  if (group.notes) {
                    Object.entries(group.notes).forEach(([roomId, noteText]) => {
                      if (noteText) {
                        parsedRoomNotes[roomId] = noteText;
                      }
                    });
                  }
                  
                  if (Array.isArray(group.tasks)) {
                    group.tasks.forEach(task => {
                      if (task.category === 'extra' || task.type === 'extra') {
                        const taskKey = task.id || task.label;
                        parsedExtraAssignments[taskKey] = {
                          label: task.label,
                          time: task.time || 5,
                          price: task.price || 5,
                          group: groupId,
                          selected: true,
                        };
                      }
                    });
                  }
                });
              }
            }
          }
          
          console.log('Parsed room assignments:', parsedRoomAssignments);
          console.log('Parsed extra assignments:', parsedExtraAssignments);
          console.log('Parsed room notes:', parsedRoomNotes);
          
          setRoomAssignments(parsedRoomAssignments);
          setExtraAssignments(parsedExtraAssignments);
          setRoomNotes(parsedRoomNotes);
          setExpectedCleaners(groupCount > 0 ? groupCount : 1);
          setHasInitialized(true);
          
        } catch (error) {
          console.error('Error initializing from existing data:', error);
          setHasInitialized(true);
        }
      } else {
        console.log('Initializing in CREATE mode');
        setHasInitialized(true);
      }
    }
  }, [isEditing, existingChecklistData, hasInitialized]);

  useEffect(() => {
    if (hasInitialized && expectedCleaners === 1 && rooms.length > 0) {
      const newAssignments = {};
      rooms.forEach(room => {
        newAssignments[room.id] = 'group_a';
      });
      setRoomAssignments(newAssignments);
    }
  }, [expectedCleaners, rooms, hasInitialized]);

  // Calculate group summary when assignments change
  useEffect(() => {
    if (!hasInitialized) return;
    
    console.log('Calculating group summary...');
    
    const timePerSqft = {
      Bedroom: 0.15,
      Bathroom: 0.18,
      Livingroom: 0.14,
      Kitchen: 0.20,
    };

    const summary = {};

    // Calculate for rooms
    rooms.forEach((room) => {
      const groupId = roomAssignments[room.id];
      if (!groupId) return;

      const rate = timePerSqft[room.type] || 0.15;
      const time = room.size * rate;

      if (!summary[groupId]) {
        summary[groupId] = {
          totalTime: 0,
          rooms: [],
          price: 0,
          extras: [],
          details: {},
        };
      }

      summary[groupId].totalTime += time;
      summary[groupId].rooms.push(room.id);

      if (!summary[groupId].details[room.id]) {
        const tasks = (checklist[room.type]?.tasks || []).map((task) => ({
          ...task,
          value: false,
          name: `${task.label.toLowerCase().replace(/\s+/g, '_')}_${room.id.toLowerCase()}`
        }));
      
        summary[groupId].details[room.id] = {
          photos: [],
          tasks,
          notes: {
            text: roomNotes[room.id] || '',
          },
        };
      }
    });

    // Calculate for extra tasks
    Object.entries(extraAssignments).forEach(([taskId, val]) => {
      if (val.selected && val.group) {
        const groupId = val.group;
        const time = val.time || 5;
        const price = val.price || 5;

        if (!summary[groupId]) {
          summary[groupId] = {
            totalTime: 0,
            rooms: [],
            price: 0,
            extras: [],
            details: {},
          };
        }

        summary[groupId].totalTime += time;
        summary[groupId].price += price;
        if (val.label) summary[groupId].extras.push(val.label);

        if (!summary[groupId].details['Extra']) {
          summary[groupId].details['Extra'] = {
            photos: [],
            tasks: [],
          };
        }

        const alreadyIncluded = summary[groupId].details['Extra'].tasks.some((t) => t.id === taskId);
        if (!alreadyIncluded) {
          summary[groupId].details['Extra'].tasks.push({
            label: val.label,
            value: true,
            name: taskId,
            id: taskId,
            time: val.time,
            price: val.price,
          });
        }
      }
    });

    // Calculate prices
    Object.keys(summary).forEach((groupId) => {
      summary[groupId].price += parseFloat((summary[groupId].totalTime * ratePerMinute).toFixed(2));
    });

    console.log('Calculated summary:', summary);
    setGroupSummary(summary);

    // Calculate totals
    const totalFee = Object.values(summary).reduce((sum, group) => sum + (group.price || 0), 0);
    const totalTime = Object.values(summary).reduce((sum, group) => sum + (group.totalTime || 0), 0);
    
    // Notify parent of changes
    if (onTotalFeeChange) onTotalFeeChange(Number(totalFee.toFixed(2)));
    if (onTotalTimeChange) onTotalTimeChange(Number(totalTime.toFixed(1)));
    
    // Notify parent of group summary change
    const currentStr = JSON.stringify(summary);
    const prevStr = JSON.stringify(prevGroupSummaryRef.current);
    if (currentStr !== prevStr) {
      prevGroupSummaryRef.current = summary;
      if (onGroupSummaryChange) {
        console.log('Notifying parent of group summary change');
        onGroupSummaryChange(summary);
      }
    }
  }, [roomAssignments, rooms, extraAssignments, roomNotes, hasInitialized]);

  const handleAssignmentChange = (roomId, groupId) => {
    console.log('Assignment change:', roomId, '->', groupId);
    const updated = { ...roomAssignments, [roomId]: groupId };
    setRoomAssignments(updated);
  };

  const handleSaveNote = (roomId, noteText) => {
    setRoomNotes((prev) => ({
      ...prev,
      [roomId]: noteText,
    }));
    setNoteModalVisible(false);
  };

  const handleExtraGroupAssign = (taskId, groupId) => {
    
    setExtraAssignments((prev) => {
      const existing = prev[taskId] || {};
      return {
        ...prev,
        [taskId]: {
          ...existing,
          group: groupId,
          selected: true,
          label: existing.label || checklist.Extra.tasks.find(t => t.id === taskId)?.label || 'Unknown',
          time: existing.time || 5,
          price: existing.price || 5,
        },
      };
    });
  };

  const toggleExtraTask = (task) => {
    setExtraAssignments((prev) => {
      const current = prev[task.id];
      if (current) {
        const updated = { ...prev };
        delete updated[task.id];
        return updated;
      }
      return {
        ...prev,
        [task.id]: {
          label: task.label,
          time: task.time || 5,
          price: task.price || 5,
          group: null,
          selected: false,
        },
      };
    });
  };

  const getRoomIcon = (type) => {
    switch (type) {
      case 'Bedroom':
        return <MaterialCommunityIcons name="bed-outline" size={26} color={COLORS.gray} style={styles.icon} />;
      case 'Bathroom':
        return <MaterialCommunityIcons name="shower" size={26} color={COLORS.gray} style={styles.icon} />;
      case 'Livingroom':
        return <MaterialCommunityIcons name="sofa-outline" size={26} color={COLORS.gray} style={styles.icon} />;
      case 'Kitchen':
        return <MaterialCommunityIcons name="fridge-outline" size={26} color={COLORS.gray} style={styles.icon} />;
      default:
        return null;
    }
  };

  const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const checklistByRoomType = {
    Bedroom: checklist.Bedroom.tasks,
    Bathroom: checklist.Bathroom.tasks,
    Livingroom: checklist.Livingroom.tasks,
    Kitchen: checklist.Kitchen.tasks,
  };

  // Generate task groups for the picker
  const taskGroups = Array.from({ length: expectedCleaners }, (_, i) => {
    const groupId = `group_${String.fromCharCode(97 + i)}`;

    return {
      groupId,
      label: `Group ${groupId.toUpperCase()}`,
      value: groupId,
    };
  });

  if (!hasInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading checklist data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.pickerWrapper}>
        <View style={{ marginBottom: 0 }}>
          <TextInput
            mode="outlined"
            label="Checklist Name"
            placeholder="e.g., Mid-July Deep Clean"
            placeholderTextColor={COLORS.darkGray}
            outlineColor="#CCC"
            value={checklistName}
            onChangeText={setChecklistName}
            activeOutlineColor={COLORS.primary}
            style={{marginBottom:0, marginTop:40, fontSize:14, backgroundColor:"#fff"}}
          />
        </View>
        
        <View style={styles.pickerContainer}>
          <View style={styles.pickerWrapper}>
            <FloatingLabelPickerSelect
              label="Expected Cleaners"
              value={expectedCleaners}
              onValueChange={(val) => setExpectedCleaners(val)}
              items={Array.from({ length: 10 }, (_, i) => ({
                label: `${i + 1}`,
                value: i + 1,
              }))}
            />
          </View>
          <TouchableOpacity 
            onPress={onInfoPress} 
            style={styles.infoIcon}
          >
            <MaterialIcons name="info-outline" size={26} color={COLORS.gray} />
          </TouchableOpacity>
        </View>

        {rooms.length === 0 ? (
          <CustomCard style={styles.roomBlock}>
            <Text style={styles.roomType}>No rooms found</Text>
            <Text style={styles.notePreview}>
              This property doesn't have any rooms configured.
            </Text>
          </CustomCard>
        ) : (
          rooms.map((room) => (
            <CustomCard key={room.id} style={styles.roomBlock}>
              <View style={styles.roomHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {getRoomIcon(room.type)}
                  <Text style={styles.roomType}>
                    {room.type} #{room.number}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedRoomForNote(room.id);
                    setNoteText(roomNotes[room.id] || '');
                    setNoteModalVisible(true);
                  }}
                >
                  <Icon
                    name={roomNotes[room.id] ? 'note-edit-outline' : 'note-plus'}
                    size={24}
                    color={COLORS.primary_light}
                  />
                </TouchableOpacity>
              </View>

              {roomNotes[room.id] ? (
                <Text style={styles.notePreview}>Note: {roomNotes[room.id].slice(0, 40)}...</Text>
              ) : null}
              
              {expectedCleaners > 1 ? (
                <FloatingLabelPickerSelect
                  label="Assign to"
                  value={roomAssignments[room.id] || null}
                  onValueChange={(groupId) => handleAssignmentChange(room.id, groupId)}
                  items={taskGroups}
                />
              ) : (
                <Text style={styles.assignedText}>Assigned to Group A</Text>
              )}
              
              {roomAssignments[room.id] && (
                <View style={styles.tasksWrapper}>
                  {chunkArray(checklistByRoomType[room.type] || [], 2).map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.taskRow}>
                      {row.map((task) => (
                        <View key={task.id} style={styles.taskColumn}>
                          <View style={styles.dotRow}>
                            <View style={styles.dot} />
                            <Text style={styles.taskLabel}>{task.label}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              )}
            </CustomCard>
          ))
        )}

        <CustomCard style={styles.roomBlock}>
          <Text style={styles.roomType}>Extra Tasks</Text>
          {checklist.Extra.tasks.map((task) => {
            const isSelected = extraAssignments[task.id]?.selected;
            const assignedGroup = extraAssignments[task.id]?.group;
            
            return (
              <View key={task.id} style={styles.extraRow}>
                <Checkbox.Android
                  status={isSelected ? 'checked' : 'unchecked'}
                  onPress={() => {
                    if (expectedCleaners === 1) {
                      // For single cleaner, toggle with auto-assignment to group 'a'
                      if (isSelected) {
                        setExtraAssignments(prev => {
                          const updated = { ...prev };
                          delete updated[task.id];
                          return updated;
                        });
                      } else {
                        setExtraAssignments(prev => ({
                          ...prev,
                          [task.id]: {
                            label: task.label,
                            time: task.time || 5,
                            price: task.price || 5,
                            group: 'group_a',
                            selected: true,
                          },
                        }));
                      }
                    } else {
                      // For multiple cleaners, toggle without auto-assignment
                      toggleExtraTask(task);
                    }
                  }}
                  color={COLORS.primary_light}
                />
                <Text style={[styles.taskLabel, { flex: 1 }]}>{task.label}</Text>
                  
                {expectedCleaners > 1 && (
                  <View style={{ width: 140 }}>
                    <FloatingLabelPickerSelect
                      label="Assign to"
                      value={assignedGroup || null}
                      onValueChange={(groupId) => handleExtraGroupAssign(task.id, groupId)}
                      items={taskGroups}
                    />
                  </View>
                )}
              </View>
            );
          })}
        </CustomCard>

        {Object.keys(groupSummary).length > 0 && (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryHeaderRow}>
              <Text style={styles.summaryTitle}>Summary</Text>
              <Text style={styles.totalTime}>
                {Object.values(groupSummary).reduce((sum, group) => sum + group.totalTime, 0).toFixed(1)} min
              </Text>
            </View>
            
            {Object.entries(groupSummary).map(([groupId, data]) => {
              const roomCounts = data.rooms.reduce((acc, roomId) => {
                const roomType = roomId.split('_')[0];
                acc[roomType] = (acc[roomType] || 0) + 1;
                return acc;
              }, {});
              
              const roomSummary = Object.entries(roomCounts)
                .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
                .join(', ');
                
              return (
                <View key={groupId} style={styles.groupItem}>
                  <View style={styles.groupHeader}>
                    <Text style={styles.groupName}>Group {groupId.replace('group_', '').toUpperCase()}</Text>
                    <Text style={styles.groupPrice}>${data.price.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.groupDetails}>
                    <Text style={styles.detailText}>{data.totalTime.toFixed(1)} min • {roomSummary}</Text>
                    {data.extras.length > 0 && (
                      <Text style={styles.extrasText}>{data.extras.join(', ')}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {noteModalVisible && (
          <Modal visible={noteModalVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Add Note</Text>
                <TextInput
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  value={noteText}
                  onChangeText={setNoteText}
                  placeholder="Add your note for this room..."
                  placeholderTextColor={COLORS.darkGray}
                  outlineColor="#CCC"
                  activeOutlineColor={COLORS.primary}
                  style={{marginBottom:0, marginTop:10, fontSize:14, backgroundColor:"#fff"}}
                />
                <Button mode="contained" onPress={() => handleSaveNote(selectedRoomForNote, noteText)} style={{ marginTop: 10, backgroundColor:COLORS.primary }}>
                  Save Note
                </Button>
                <Button mode="outlined" onPress={() => setNoteModalVisible(false)} style={{ marginTop: 10 }}>
                  Cancel
                </Button>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
  },
  roomBlock: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },  
  roomType: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  assignedText: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  notePreview: {
    fontStyle: 'italic',
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 0,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskColumn: {
    flex: 1,
    paddingRight: 10,
  },
  tasksWrapper: {
    marginTop: 12,
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary_light || '#1976d2',
    marginRight: 8,
  },
  taskLabel: {
    fontSize: 14,
    color: '#333',
  },
  extraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    gap: 8,
    flexWrap: 'nowrap',
  },
  summaryContainer: {
    marginTop: 24,
    paddingHorizontal: 4,
  },
  
  summaryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  
  summaryTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  
  totalTime: {
    fontSize: 14,
    color: '#666',
  },
  
  groupItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  groupName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  
  groupPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  
  groupDetails: {
    paddingLeft: 2,
  },
  
  detailText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  
  extrasText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerWrapper: {
    flex: 1,
    marginRight: 10,
  },
  infoIcon: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.gray,
  },
  icon: {
    marginRight: 8,
  },
});

export default RoomAssignmentPicker;