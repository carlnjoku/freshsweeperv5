
// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Alert } from 'react-native';
// import * as Animatable from 'react-native-animatable';
// import FloatingLabelPickerSelect from '../../../components/shared/FloatingLabelPicker';
// import { checklist } from '../../../utils/tasks_photo';
// import { Checkbox, TextInput, Button } from 'react-native-paper';
// import COLORS from '../../../constants/colors';
// import CustomCard from '../../../components/shared/CustomCard';
// import { MaterialCommunityIcons, MaterialIcons, AntDesign } from '@expo/vector-icons';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { tSafe } from '../../../utils/tSafe';
// import userService from '../../../services/connection/userService';

// const ratePerMinute = 0.8;
// const MINIMUM_TOTAL = 50;
// const MAXIMUM_TOTAL = 2000;
// const MIN_RATIO = 0.5;
// const MAX_RATIO = 2.0;

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
//     savedTotalFee = null,
//     ...props
// }) => {


//   const customPricingInitialized = useRef(false); 

//   const [rooms, setRooms] = useState([]);
//   const [roomAssignments, setRoomAssignments] = useState({});
//   const [extraAssignments, setExtraAssignments] = useState({});
//   const [groupSummary, setGroupSummary] = useState({});
//   const [roomNotes, setRoomNotes] = useState({});
//   const [noteModalVisible, setNoteModalVisible] = useState(false);
//   const [noteText, setNoteText] = useState('');
//   const [selectedRoomForNote, setSelectedRoomForNote] = useState(null);
//   const [expectedCleaners, setExpectedCleaners] = useState(1);
  
//   const [customPricingModalVisible, setCustomPricingModalVisible] = useState(false);
//   const [customTotalFee, setCustomTotalFee] = useState('');
//   const [useCustomPricing, setUseCustomPricing] = useState(false);
//   const [calculatedTotalFee, setCalculatedTotalFee] = useState(0);
//   const [showCustomPricingCard, setShowCustomPricingCard] = useState(false);
//   const [priceMultiplier, setPriceMultiplier] = useState(100);
  
//   const [hasInitialized, setHasInitialized] = useState(false);
  
//   const prevGroupSummaryRef = useRef({});
//   const prevExistingDataRef = useRef(null);
//   const initializationAttempted = useRef(false);

//   // 👇 NEW: ref for Animatable.View and collapsed state
//   const animRef = useRef(null);
//   const [collapsed, setCollapsed] = useState(false);

//   const [roomConsumptionRules, setRoomConsumptionRules] = useState({});
//   const [consumptionModalVisible, setConsumptionModalVisible] = useState(false);
//   const [selectedRoomType, setSelectedRoomType] = useState('');
//   const [consumptionSupplyId, setConsumptionSupplyId] = useState('');
//   const [consumptionQuantity, setConsumptionQuantity] = useState('1');
//   const [supplyList, setSupplyList] = useState([]);

//   useEffect(() => {
//     const fetchSupplies = async () => {
//       try {
//         const res = await userService.getAllSupplies();
//         setSupplyList(res.data || []);
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     fetchSupplies();
//   }, []);

//   const addRoomConsumptionRule = async () => {
//     if (!selectedRoomType || !consumptionSupplyId) return;
//     const qty = parseFloat(consumptionQuantity);
//     if (isNaN(qty) || qty <= 0) {
//       Alert.alert('Invalid Quantity', 'Please enter a positive number');
//       return;
//     }
//     try {
//       const res = await userService.createRoomConsumptionRule({
//         property_id: selectedApartment._id,
//         room_type: selectedRoomType,
//         supply_id: consumptionSupplyId,
//         quantity: qty,
//       });
//       setRoomConsumptionRules(prev => ({
//         ...prev,
//         [selectedRoomType]: [...(prev[selectedRoomType] || []), res.data],
//       }));
//       setConsumptionModalVisible(false);
//       setConsumptionSupplyId('');
//       setConsumptionQuantity('1');
//     } catch (err) {
//       Alert.alert('Error', 'Could not add rule');
//     }
//   };
  
//   const deleteRoomConsumptionRule = async (roomType, ruleId) => {
//     Alert.alert(
//       'Remove Rule',
//       'Are you sure you want to remove this supply consumption?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Remove',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               await userService.deleteRoomConsumptionRule(ruleId);
//               setRoomConsumptionRules(prev => ({
//                 ...prev,
//                 [roomType]: prev[roomType].filter(r => r.id !== ruleId),
//               }));
//             } catch (err) {
//               Alert.alert('Error', 'Could not remove rule');
//             }
//           },
//         },
//       ]
//     );
//   };

//   useEffect(() => {
//     const fetchSupplies = async () => {
//       try {
//         const res = await userService.getAllSupplies();
//         setSupplyList(res.data || []);
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     fetchSupplies();
//   }, []);

//   const fetchRoomConsumptionRules = async () => {
//     try {
//       const res = await userService.getRoomConsumptionRules(selectedApartment?._id);
//       const rules = {};
//       res.data.forEach(rule => {
//         if (!rules[rule.room_type]) rules[rule.room_type] = [];
//         rules[rule.room_type].push(rule);
//       });
//       setRoomConsumptionRules(rules);
//     } catch (err) {
//       console.error('Failed to load room consumption rules', err);
//     }
//   };

//   useEffect(() => {
//     fetchRoomConsumptionRules();
//   }, [selectedApartment?._id]);

//   useEffect(() => {
//     console.log('RoomAssignmentPicker - Current state:', {
//       isEditing,
//       hasInitialized,
//       expectedCleaners,
//       roomsCount: rooms.length,
//       roomAssignments: Object.keys(roomAssignments),
//       extraAssignments: Object.keys(extraAssignments),
//       roomNotes: Object.keys(roomNotes),
//       existingChecklistData: existingChecklistData ? {
//         type: typeof existingChecklistData,
//         isArray: Array.isArray(existingChecklistData),
//         keys: Object.keys(existingChecklistData || {})
//       } : null
//     });
//   }, [isEditing, hasInitialized, expectedCleaners, rooms, roomAssignments, extraAssignments, roomNotes]);

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

//   useEffect(() => {
//     if (!hasInitialized && !initializationAttempted.current) {
//       initializationAttempted.current = true;
      
//       if (isEditing && existingChecklistData) {
//         console.log('INITIALIZING EDIT MODE WITH EXISTING DATA:', existingChecklistData);
        
//         try {
//           let parsedRoomAssignments = {};
//           let parsedExtraAssignments = {};
//           let parsedRoomNotes = {};
//           let groupCount = 0;
          
//           if (typeof existingChecklistData === 'object' && existingChecklistData !== null) {
//             const groupKeys = Object.keys(existingChecklistData);
            
//             const isGroupStructure = groupKeys.some(key => 
//               key.startsWith('group_') || 
//               key === 'a' || key === 'b' || key === 'c' || key === 'd'
//             );
            
//             if (isGroupStructure) {
//               console.log('Detected group structure, parsing...');
//               groupCount = groupKeys.length;
              
//               groupKeys.forEach(groupId => {
//                 const group = existingChecklistData[groupId];
                
//                 if (Array.isArray(group.rooms)) {
//                   group.rooms.forEach(roomId => {
//                     parsedRoomAssignments[roomId] = groupId;
//                   });
//                 }
                
//                 if (group.details) {
//                   Object.entries(group.details).forEach(([key, detail]) => {
//                     if (key !== 'Extra' && detail.notes && detail.notes.text) {
//                       parsedRoomNotes[key] = detail.notes.text;
//                     }
//                   });
//                 }
                
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
                
//                 if (Array.isArray(group.extras)) {
//                   group.extras.forEach(extraLabel => {
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
                  
//                   if (group.notes) {
//                     Object.entries(group.notes).forEach(([roomId, noteText]) => {
//                       if (noteText) {
//                         parsedRoomNotes[roomId] = noteText;
//                       }
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
//           console.log('Parsed room notes:', parsedRoomNotes);
          
//           setRoomAssignments(parsedRoomAssignments);
//           setExtraAssignments(parsedExtraAssignments);
//           setRoomNotes(parsedRoomNotes);
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

//   // Reset everything when switching back to 1 cleaner
//   useEffect(() => {
//     if (!hasInitialized) return;
    
//     if (expectedCleaners === 1) {
//       console.log('Switching to single cleaner mode - resetting all assignments and pricing');
      
//       const newRoomAssignments = {};
//       rooms.forEach(room => {
//         newRoomAssignments[room.id] = 'group_a';
//       });
//       setRoomAssignments(newRoomAssignments);
      
//       const newExtraAssignments = {};
//       Object.entries(extraAssignments).forEach(([taskId, task]) => {
//         if (task.selected) {
//           newExtraAssignments[taskId] = {
//             ...task,
//             group: 'group_a'
//           };
//         }
//       });
//       setExtraAssignments(newExtraAssignments);
      
//       if (useCustomPricing) {
//         setUseCustomPricing(false);
//         setCustomTotalFee('');
//         setPriceMultiplier(100);
        
//         const summaryCopy = JSON.parse(JSON.stringify(groupSummary));
//         Object.keys(summaryCopy).forEach((groupId) => {
//           if (summaryCopy[groupId].calculatedPrice !== undefined) {
//             summaryCopy[groupId].price = summaryCopy[groupId].calculatedPrice;
//           }
//         });
        
//         const totalFee = Object.values(summaryCopy).reduce((sum, group) => sum + (group.price || 0), 0);
//         const totalTime = Object.values(summaryCopy).reduce((sum, group) => sum + (group.totalTime || 0), 0);
        
//         setGroupSummary(summaryCopy);
//         if (onTotalFeeChange) onTotalFeeChange(Number(totalFee.toFixed(2)));
//         if (onTotalTimeChange) onTotalTimeChange(Number(totalTime.toFixed(1)));
        
//         const currentStr = JSON.stringify(summaryCopy);
//         const prevStr = JSON.stringify(prevGroupSummaryRef.current);
//         if (currentStr !== prevStr) {
//           prevGroupSummaryRef.current = summaryCopy;
//           if (onGroupSummaryChange) onGroupSummaryChange(summaryCopy);
//         }
//       }
//     }
//   }, [expectedCleaners, hasInitialized, rooms]);

//   // Handle switching from 1 to multiple cleaners
//   useEffect(() => {
//     if (!hasInitialized) return;
//     if (expectedCleaners <= 1) return;
    
//     console.log('Switching to multiple cleaners mode - ensuring assignments are valid');
    
//     const existingGroups = new Set(Object.values(roomAssignments));
//     const availableGroups = Array.from({ length: expectedCleaners }, (_, i) => `group_${String.fromCharCode(97 + i)}`);
    
//     const needsRedistribution = Array.from(existingGroups).some(group => !availableGroups.includes(group));
    
//     if (needsRedistribution && rooms.length > 0 && Object.keys(roomAssignments).length > 0) {
//       console.log('Redistributing rooms evenly among available groups');
      
//       const newRoomAssignments = { ...roomAssignments };
//       const roomsList = Object.keys(roomAssignments);
      
//       roomsList.forEach((roomId, index) => {
//         const groupIndex = index % availableGroups.length;
//         newRoomAssignments[roomId] = availableGroups[groupIndex];
//       });
      
//       setRoomAssignments(newRoomAssignments);
//     }
//   }, [expectedCleaners, hasInitialized, rooms, roomAssignments]);

//   // Initial assignment for single cleaner
//   useEffect(() => {
//     if (hasInitialized && expectedCleaners === 1 && rooms.length > 0) {
//       if (Object.keys(roomAssignments).length === 0) {
//         const newAssignments = {};
//         rooms.forEach(room => {
//           newAssignments[room.id] = 'group_a';
//         });
//         setRoomAssignments(newAssignments);
//       }
//     }
//   }, [expectedCleaners, rooms, hasInitialized]);

//   useEffect(() => {
//     if (!hasInitialized) return;


//     // 👇 NEW: Check if we have a saved total fee that differs from the calculated one
//     if (savedTotalFee !== null && savedTotalFee !== undefined && !customPricingInitialized.current) {
//       const diff = Math.abs(Number(savedTotalFee) - totalFee);
//       if (diff > 0.01) { // significant difference => custom pricing was used
//         customPricingInitialized.current = true;
//         setUseCustomPricing(true);
//         setCustomTotalFee(String(savedTotalFee));
//         // The next effect run will apply the custom pricing automatically
//         // We skip updating the parent in this run to avoid double calls
//         return; // exit effect, will re-run with new state
//       }
//     }


    
//     console.log('Calculating group summary...');
    
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
//           calculatedPrice: 0,
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
//             calculatedPrice: 0,
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
//       const calculatedPrice = parseFloat((summary[groupId].totalTime * ratePerMinute).toFixed(2));
//       summary[groupId].calculatedPrice = calculatedPrice;
//       summary[groupId].price = calculatedPrice;
//     });

//     console.log('Calculated summary:', summary);
//     setGroupSummary(summary);

//     const totalFee = Object.values(summary).reduce((sum, group) => sum + (group.price || 0), 0);
//     const totalTime = Object.values(summary).reduce((sum, group) => sum + (group.totalTime || 0), 0);
    
//     setCalculatedTotalFee(Number(totalFee.toFixed(2)));

//     // 👇 NEW: Initialise custom pricing from saved total if needed
//     if (savedTotalFee !== null && savedTotalFee !== undefined && !customPricingInitialized.current) {
//       const diff = Math.abs(Number(savedTotalFee) - totalFee);
//       if (diff > 0.01) {
//         customPricingInitialized.current = true;
//         setUseCustomPricing(true);
//         setCustomTotalFee(String(savedTotalFee));
//         return; // let the next effect run apply the custom pricing
//       }
//     }

    
//     if (useCustomPricing && customTotalFee) {
//       applyCustomPricing(parseFloat(customTotalFee));
//     } else {
//       if (onTotalFeeChange) onTotalFeeChange(Number(totalFee.toFixed(2)));
//       if (onTotalTimeChange) onTotalTimeChange(Number(totalTime.toFixed(1)));
      
//       const currentStr = JSON.stringify(summary);
//       const prevStr = JSON.stringify(prevGroupSummaryRef.current);
//       if (currentStr !== prevStr) {
//         prevGroupSummaryRef.current = summary;
//         if (onGroupSummaryChange) {
//           console.log('Notifying parent of group summary change');
//           onGroupSummaryChange(summary);
//         }
//       }
//     }
//   }, [roomAssignments, rooms, extraAssignments, roomNotes, hasInitialized, savedTotalFee]);

//   const applyCustomPricing = (customTotal) => {
//     const summaryCopy = JSON.parse(JSON.stringify(groupSummary));
//     const groups = Object.values(summaryCopy);
//     const totalCalculated = groups.reduce((sum, group) => sum + group.calculatedPrice, 0);
    
//     if (totalCalculated === 0) return;
    
//     let appliedTotal = 0;
    
//     Object.keys(summaryCopy).forEach((groupId) => {
//       const group = summaryCopy[groupId];
//       const ratio = group.calculatedPrice / totalCalculated;
//       const proportionalPrice = customTotal * ratio;
//       group.price = Number(proportionalPrice.toFixed(2));
//       appliedTotal += group.price;
//     });
    
//     const roundingDiff = customTotal - appliedTotal;
//     if (Math.abs(roundingDiff) > 0.01) {
//       const groupsArray = Object.keys(summaryCopy);
//       if (groupsArray.length > 0) {
//         summaryCopy[groupsArray[0]].price += roundingDiff;
//       }
//     }
    
//     setGroupSummary(summaryCopy);
    
//     if (onTotalFeeChange) onTotalFeeChange(customTotal);
//     if (onTotalTimeChange) onTotalTimeChange(Object.values(summaryCopy).reduce((sum, g) => sum + g.totalTime, 0));
    
//     const currentStr = JSON.stringify(summaryCopy);
//     const prevStr = JSON.stringify(prevGroupSummaryRef.current);
//     if (currentStr !== prevStr) {
//       prevGroupSummaryRef.current = summaryCopy;
//       if (onGroupSummaryChange) {
//         console.log('Notifying parent of custom pricing update');
//         onGroupSummaryChange(summaryCopy);
//       }
//     }
//   };

//   const validateCustomPrice = (customTotal) => {
//     if (isNaN(customTotal) || customTotal <= 0) {
//       Alert.alert('Invalid Amount', 'Please enter a valid positive amount.');
//       return false;
//     }
    
//     if (customTotal < MINIMUM_TOTAL) {
//       Alert.alert(
//         'Minimum Amount', 
//         `Custom total must be at least $${MINIMUM_TOTAL}. The calculated total is $${calculatedTotalFee.toFixed(2)}.`,
//         [{ text: 'OK' }]
//       );
//       return false;
//     }
    
//     if (customTotal > MAXIMUM_TOTAL) {
//       Alert.alert(
//         'Maximum Amount', 
//         `Custom total cannot exceed $${MAXIMUM_TOTAL}. The calculated total is $${calculatedTotalFee.toFixed(2)}.`,
//         [{ text: 'OK' }]
//       );
//       return false;
//     }
    
//     if (customTotal < calculatedTotalFee * MIN_RATIO) {
//       Alert.alert(
//         'Price Significantly Lower',
//         `Custom price ($${customTotal.toFixed(2)}) is significantly lower than calculated price ($${calculatedTotalFee.toFixed(2)}).\n\nThis means cleaners will earn ${((1 - customTotal / calculatedTotalFee) * 100).toFixed(0)}% less than the standard rate.\n\nAre you sure you want to proceed?`,
//         [
//           { text: 'Cancel', style: 'cancel' },
//           { 
//             text: 'Continue', 
//             onPress: () => {
//               setUseCustomPricing(true);
//               setCustomPricingModalVisible(false);
//               applyCustomPricing(customTotal);
//             },
//             style: 'destructive'
//           }
//         ]
//       );
//       return false;
//     }
    
//     if (customTotal > calculatedTotalFee * MAX_RATIO) {
//       Alert.alert(
//         'Price Significantly Higher',
//         `Custom price ($${customTotal.toFixed(2)}) is significantly higher than calculated price ($${calculatedTotalFee.toFixed(2)}).\n\nThis means cleaners will earn ${((customTotal / calculatedTotalFee - 1) * 100).toFixed(0)}% more than the standard rate.\n\nAre you sure you want to proceed?`,
//         [
//           { text: 'Cancel', style: 'cancel' },
//           { 
//             text: 'Continue', 
//             onPress: () => {
//               setUseCustomPricing(true);
//               setCustomPricingModalVisible(false);
//               applyCustomPricing(customTotal);
//             }
//           }
//         ]
//       );
//       return false;
//     }
    
//     return true;
//   };

//   const handleCustomPricingSave = () => {
//     const customTotal = parseFloat(customTotalFee);
    
//     if (validateCustomPrice(customTotal)) {
//       setUseCustomPricing(true);
//       setCustomPricingModalVisible(false);
//       applyCustomPricing(customTotal);
//     }
//   };

//   const handleMultiplierChange = (multiplier) => {
//     setPriceMultiplier(multiplier);
//     const adjustedTotal = (calculatedTotalFee * multiplier) / 100;
//     setCustomTotalFee(adjustedTotal.toFixed(2));
//   };

//   const handleResetPricing = () => {
//     Alert.alert(
//       'Reset Pricing',
//       'Are you sure you want to reset to the calculated pricing? This will remove your custom pricing.',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { 
//           text: 'Reset', 
//           onPress: () => {
//             setUseCustomPricing(false);
//             setCustomTotalFee('');
//             setPriceMultiplier(100);
            
//             const summaryCopy = JSON.parse(JSON.stringify(groupSummary));
//             Object.keys(summaryCopy).forEach((groupId) => {
//               summaryCopy[groupId].price = summaryCopy[groupId].calculatedPrice;
//             });
            
//             const totalFee = Object.values(summaryCopy).reduce((sum, group) => sum + (group.price || 0), 0);
//             const totalTime = Object.values(summaryCopy).reduce((sum, group) => sum + (group.totalTime || 0), 0);
            
//             setGroupSummary(summaryCopy);
//             if (onTotalFeeChange) onTotalFeeChange(Number(totalFee.toFixed(2)));
//             if (onTotalTimeChange) onTotalTimeChange(Number(totalTime.toFixed(1)));
            
//             const currentStr = JSON.stringify(summaryCopy);
//             const prevStr = JSON.stringify(prevGroupSummaryRef.current);
//             if (currentStr !== prevStr) {
//               prevGroupSummaryRef.current = summaryCopy;
//               if (onGroupSummaryChange) onGroupSummaryChange(summaryCopy);
//             }
//           }
//         }
//       ]
//     );
//   };

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

//   const taskGroups = Array.from({ length: expectedCleaners }, (_, i) => {
//     const groupLetter = String.fromCharCode(65 + i); // A, B, C, D...
//     const groupId = `group_${String.fromCharCode(97 + i)}`; // group_a, group_b, etc.
//     return {
//       groupId,
//       label: `${tSafe('team', 'TEAM')} ${groupLetter}`, // "TEAM A", "TEAM B", etc.
//       value: groupId,
//     };
//   });

//   // 👇 NEW: Animate rooms section when custom pricing toggles
//   useEffect(() => {
//     if (useCustomPricing) {
//       // Animate out, then collapse
//       animRef.current?.slideOutUp?.(400)?.then(() => setCollapsed(true));
//     } else {
//       // Expand first, then animate in
//       setCollapsed(false);
//       // Wait for the next frame to let the height reset
//       requestAnimationFrame(() => {
//         animRef.current?.fadeInDown?.(400);
//       });
//     }
//   }, [useCustomPricing]);

//   if (!hasInitialized) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="small" color={COLORS.primary} />
//         <Text style={styles.loadingText}>{tSafe('loading_checklist_data', 'Loading checklist data...')}</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.pickerWrapper}>
//         <View style={{ marginBottom: 0 }}>
//           <TextInput
//             mode="outlined"
//             label={tSafe('checklist_name', 'Checklist Name')}
//             placeholder={tSafe('checklist_name_placeholder', 'e.g., Mid-July Deep Clean')}
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
//               label={tSafe('expected_cleaners', 'Expected Cleaners')}
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

//         {/* 👇 WRAPPED ROOMS + EXTRA TASKS SECTION */}
//         <Animatable.View
//           ref={animRef}
//           style={[
//             styles.hideableSection,
//             collapsed && styles.collapsed,
//           ]}
//         >
//           {rooms.length === 0 ? (
//             <CustomCard style={styles.roomBlock}>
//               <Text style={styles.roomType}>{tSafe('no_rooms_found', 'No rooms found')}</Text>
//               <Text style={styles.notePreview}>
//                 {tSafe('no_rooms_configured', 'This property doesn\'t have any rooms configured.')}
//               </Text>
//             </CustomCard>
//           ) : (
//             rooms.map((room) => (
//               <CustomCard key={room.id} style={styles.roomBlock}>
//                 <View style={styles.roomHeader}>
//                   <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                     {getRoomIcon(room.type)}
//                     <Text style={styles.roomType}>
//                       {room.type} #{room.number}
//                     </Text>
//                   </View>
//                   <TouchableOpacity
//                     onPress={() => {
//                       setSelectedRoomForNote(room.id);
//                       setNoteText(roomNotes[room.id] || '');
//                       setNoteModalVisible(true);
//                     }}
//                   >
//                     <Icon
//                       name={roomNotes[room.id] ? 'note-edit-outline' : 'note-plus'}
//                       size={24}
//                       color={COLORS.primary_light}
//                     />
//                   </TouchableOpacity>
//                 </View>

//                 {roomNotes[room.id] ? (
//                   <Text style={styles.notePreview}>
//                     {tSafe('note_prefix', 'Note:')} {roomNotes[room.id].slice(0, 40)}...
//                   </Text>
//                 ) : null}
                
//                 {expectedCleaners > 1 ? (
//                   <FloatingLabelPickerSelect
//                     label={tSafe('assign_to', 'Assign to')}
//                     value={roomAssignments[room.id] || null}
//                     onValueChange={(groupId) => handleAssignmentChange(room.id, groupId)}
//                     items={taskGroups}
//                   />
//                 ) : (
//                   <Text style={styles.assignedText}>
//                     {tSafe('assigned_to_team_a', 'Assigned to TEAM A')}
//                   </Text>
//                 )}
                
//                 {roomAssignments[room.id] && (
//                   <View style={styles.tasksWrapper}>
//                     {chunkArray(checklistByRoomType[room.type] || [], 2).map((row, rowIndex) => (
//                       <View key={rowIndex} style={styles.taskRow}>
//                         {row.map((task) => (
//                           <View key={task.id} style={styles.taskColumn}>
//                             <View style={styles.dotRow}>
//                               <View style={styles.dot} />
//                               <Text style={styles.taskLabel}>{task.label}</Text>
//                             </View>
//                           </View>
//                         ))}
//                       </View>
//                     ))}
//                   </View>
//                 )}
//               </CustomCard>
//             ))
//           )}

//           <CustomCard style={styles.roomBlock}>
//             <Text style={styles.roomType}>{tSafe('extra_tasks', 'Extra Tasks')}</Text>
//             {checklist.Extra.tasks.map((task) => {
//               const isSelected = extraAssignments[task.id]?.selected;
//               const assignedGroup = extraAssignments[task.id]?.group;
              
//               return (
//                 <View key={task.id} style={styles.extraRow}>
//                   <Checkbox.Android
//                     status={isSelected ? 'checked' : 'unchecked'}
//                     onPress={() => {
//                       if (expectedCleaners === 1) {
//                         if (isSelected) {
//                           setExtraAssignments(prev => {
//                             const updated = { ...prev };
//                             delete updated[task.id];
//                             return updated;
//                           });
//                         } else {
//                           setExtraAssignments(prev => ({
//                             ...prev,
//                             [task.id]: {
//                               label: task.label,
//                               time: task.time || 5,
//                               price: task.price || 5,
//                               group: 'group_a',
//                               selected: true,
//                             },
//                           }));
//                         }
//                       } else {
//                         toggleExtraTask(task);
//                       }
//                     }}
//                     color={COLORS.primary_light}
//                   />
//                   <Text style={[styles.taskLabel, { flex: 1 }]}>{task.label}</Text>
                    
//                   {expectedCleaners > 1 && (
//                     <View style={{ width: 140 }}>
//                       <FloatingLabelPickerSelect
//                         label={tSafe('assign_to', 'Assign to')}
//                         value={assignedGroup || null}
//                         onValueChange={(groupId) => handleExtraGroupAssign(task.id, groupId)}
//                         items={taskGroups}
//                       />
//                     </View>
//                   )}
//                 </View>
//               );
//             })}
//           </CustomCard>
//         </Animatable.View>

//         {/* CUSTOM PRICING CARD (always visible) */}
//         <CustomCard style={styles.customPricingCard}>
//           <View style={styles.customPricingHeader}>
//             <MaterialIcons name="attach-money" size={24} color={COLORS.primary} />
//             <Text style={styles.customPricingTitle}>{tSafe('pricing_summary', 'Pricing Summary')}</Text>
//           </View>

//           {/* ─── Team Fee Breakdown ─── */}
//           {Object.keys(groupSummary).length > 0 && (
//             <View style={styles.teamFeeContainer}>
//               {Object.entries(groupSummary).map(([groupId, group]) => {
//                 const groupLabel = taskGroups.find(g => g.value === groupId)?.label || groupId;
//                 return (
//                   <View key={groupId} style={styles.teamFeeRow}>
//                     <Text style={styles.teamName}>{groupLabel}</Text>
//                     <View style={styles.teamFeeRight}>
//                       <Text style={styles.teamFee}>${group.price?.toFixed(2) || '0.00'}</Text>
//                       <Text style={styles.teamTime}>({group.totalTime?.toFixed(1) || 0} min)</Text>
//                     </View>
//                   </View>
//                 );
//               })}
//             </View>
//           )}

//           {/* Calculated total (or custom if active) */}
//           <View style={[styles.pricingRow, { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 }]}>
//             <Text style={styles.pricingLabel}>
//               {useCustomPricing ? tSafe('custom_total', 'Custom Total') : tSafe('calculated_total', 'Calculated Total')}
//             </Text>
//             <Text style={useCustomPricing ? styles.customPriceValue : styles.calculatedPriceValue}>
//               ${Object.values(groupSummary).reduce((sum, g) => sum + (g.price || 0), 0).toFixed(2)}
//             </Text>
//           </View>

//           {!useCustomPricing ? (
//             <TouchableOpacity 
//               style={styles.setCustomPriceButton}
//               onPress={() => setCustomPricingModalVisible(true)}
//             >
//               <MaterialIcons name="edit" size={18} color="white" />
//               <Text style={styles.setCustomPriceButtonText}>
//                 {tSafe('set_custom_price', 'Set Custom Price')}
//               </Text>
//             </TouchableOpacity>
//           ) : (
//             <TouchableOpacity 
//               style={[styles.setCustomPriceButton, { backgroundColor: COLORS.error || '#d32f2f' }]}
//               onPress={handleResetPricing}
//             >
//               <MaterialIcons name="restore" size={18} color="white" />
//               <Text style={styles.setCustomPriceButtonText}>
//                 {tSafe('reset_to_calculated', 'Reset to Calculated')}
//               </Text>
//             </TouchableOpacity>
//           )}

//           {useCustomPricing && (
//             <View style={styles.customPricingNote}>
//               <MaterialIcons name="info" size={16} color="#888" />
//               <Text style={styles.customPricingNoteText}>
//                 {tSafe('custom_pricing_note', 'Custom pricing is active. The total will be split proportionally among cleaners based on their assigned tasks.')}
//               </Text>
//             </View>
//           )}
//         </CustomCard>

//         {/* Room Inventory Consumption Card – commented out, keep as is */}

//         <Modal visible={customPricingModalVisible} transparent animationType="fade">
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContent}>
//               <Text style={styles.modalTitle}>{tSafe('custom_pricing', 'Custom Pricing')}</Text>
//               <Text style={styles.modalSubtitle}>
//                 {tSafe('custom_pricing_modal_desc', 'Set a custom total amount for this cleaning job. The amount will be automatically split among cleaners based on their assigned tasks.')}
//               </Text>
              
//               <View style={styles.calculatedTotalContainer}>
//                 <Text style={styles.calculatedTotalLabel}>{tSafe('calculated_total', 'Calculated Total')}</Text>
//                 <Text style={styles.calculatedTotalValue}>${calculatedTotalFee.toFixed(2)}</Text>
//               </View>
              
//               <View style={styles.multiplierContainer}>
//                 <Text style={styles.multiplierLabel}>Quick adjust by percentage:</Text>
//                 <View style={styles.multiplierRow}>
//                   <TouchableOpacity 
//                     style={styles.multiplierButton}
//                     onPress={() => handleMultiplierChange(Math.max(50, priceMultiplier - 5))}
//                   >
//                     <Text style={styles.multiplierButtonText}>-5%</Text>
//                   </TouchableOpacity>
//                   <Text style={styles.multiplierValue}>{priceMultiplier}%</Text>
//                   <TouchableOpacity 
//                     style={styles.multiplierButton}
//                     onPress={() => handleMultiplierChange(Math.min(200, priceMultiplier + 5))}
//                   >
//                     <Text style={styles.multiplierButtonText}>+5%</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
              
//               <TextInput
//                 mode="outlined"
//                 label={tSafe('custom_total_fee', 'Custom Total Fee ($)')}
//                 placeholder={`${calculatedTotalFee.toFixed(2)}`}
//                 value={customTotalFee}
//                 onChangeText={setCustomTotalFee}
//                 keyboardType="numeric"
//                 style={styles.modalInput}
//               />
              
//               <View style={styles.priceLimits}>
//                 <Text style={styles.priceLimitText}>Min: ${MINIMUM_TOTAL}</Text>
//                 <Text style={styles.priceLimitText}>Max: ${MAXIMUM_TOTAL}</Text>
//                 <Text style={styles.priceLimitText}>
//                   Range: {MIN_RATIO * 100}% - {MAX_RATIO * 100}% of calculated
//                 </Text>
//               </View>
              
//               <Button 
//                 mode="contained" 
//                 onPress={handleCustomPricingSave} 
//                 style={styles.modalButton}
//                 buttonColor={COLORS.primary}
//               >
//                 {tSafe('apply_custom_price', 'Apply Custom Price')}
//               </Button>
              
//               <Button 
//                 mode="outlined" 
//                 onPress={() => {
//                   setCustomPricingModalVisible(false);
//                   setCustomTotalFee('');
//                 }} 
//                 style={styles.modalCancelButton}
//               >
//                 {tSafe('cancel', 'Cancel')}
//               </Button>
//             </View>
//           </View>
//         </Modal>

//         {noteModalVisible && (
//           <Modal visible={noteModalVisible} transparent animationType="fade">
//             <View style={styles.modalOverlay}>
//               <View style={styles.modalContent}>
//                 <Text style={styles.modalTitle}>{tSafe('add_note', 'Add Note')}</Text>
//                 <TextInput
//                   mode="outlined"
//                   multiline
//                   numberOfLines={4}
//                   value={noteText}
//                   onChangeText={setNoteText}
//                   placeholder={tSafe('note_placeholder', 'Add your note for this room...')}
//                   placeholderTextColor={COLORS.darkGray}
//                   outlineColor="#CCC"
//                   activeOutlineColor={COLORS.primary}
//                   style={styles.modalInput}
//                 />
//                 <Button 
//                   mode="contained" 
//                   onPress={() => handleSaveNote(selectedRoomForNote, noteText)} 
//                   style={styles.modalButton}
//                   buttonColor={COLORS.primary}
//                 >
//                   {tSafe('save_note', 'Save Note')}
//                 </Button>
//                 <Button 
//                   mode="outlined" 
//                   onPress={() => setNoteModalVisible(false)} 
//                   style={styles.modalCancelButton}
//                 >
//                   {tSafe('cancel', 'Cancel')}
//                 </Button>
//               </View>
//             </View>
//           </Modal>
//         )}
//       </View>

//       <Modal visible={consumptionModalVisible} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Consumption Rule for {selectedRoomType}</Text>
//             <Text style={styles.modalSubtitle}>
//               When cleaning this room, deduct:
//             </Text>
//             <FloatingLabelPickerSelect
//               label="Select Supply"
//               value={consumptionSupplyId}
//               onValueChange={setConsumptionSupplyId}
//               items={supplyList.map(s => ({ label: s.name, value: s._id }))}
//             />
//             <TextInput
//               style={styles.modalInput}
//               placeholder="Quantity (e.g., 2)"
//               keyboardType="numeric"
//               value={consumptionQuantity}
//               onChangeText={setConsumptionQuantity}
//             />
//             <View style={styles.modalButtons}>
//               <Button mode="outlined" onPress={() => setConsumptionModalVisible(false)}>Cancel</Button>
//               <Button mode="contained" onPress={addRoomConsumptionRule} buttonColor={COLORS.primary}>Add</Button>
//             </View>
//           </View>
//         </View>
//       </Modal>
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
//     marginTop: 24,
//     paddingHorizontal: 4,
//     marginBottom: 16,
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
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   modalSubtitle: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 16,
//     lineHeight: 20,
//   },
//   modalInput: {
//     marginBottom: 16,
//     backgroundColor: '#fff',
//   },
//   modalButton: {
//     marginBottom: 10,
//   },
//   modalCancelButton: {
//     marginBottom: 0,
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
//   // Custom Pricing Styles
//   customPricingToggle: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 14,
//     marginBottom: 16,
//     backgroundColor: '#F8F9FC',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#E8ECF0',
//     gap: 8,
//   },
//   customPricingToggleText: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },
//   customPricingCard: {
//     borderWidth: 1,
//     borderColor: '#E8ECF0',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 20,
//     backgroundColor: '#fff',
//   },
//   customPricingHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//     gap: 8,
//   },
//   customPricingTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1E1E2F',
//   },
//   customPricingDescription: {
//     backgroundColor: '#F0F7FF',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//   },
//   customPricingDescriptionText: {
//     fontSize: 13,
//     color: '#4A5568',
//     lineHeight: 18,
//   },
//   pricingInfo: {
//     marginBottom: 12,
//   },
//   pricingRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   pricingLabel: {
//     fontSize: 14,
//     color: '#666',
//   },
//   calculatedPriceValue: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#666',
//   },
//   customPriceValue: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },
//   setCustomPriceButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     paddingVertical: 12,
//     borderRadius: 8,
//     marginTop: 12,
//     gap: 8,
//   },
//   setCustomPriceButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: 'white',
//   },
//   customPricingNote: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F9F9FC',
//     padding: 10,
//     borderRadius: 8,
//     gap: 6,
//     marginTop: 8,
//   },
//   customPricingNoteText: {
//     flex: 1,
//     fontSize: 11,
//     color: '#888',
//     lineHeight: 15,
//   },
//   calculatedTotalContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//     padding: 12,
//     backgroundColor: '#f5f5f5',
//     borderRadius: 8,
//   },
//   calculatedTotalLabel: {
//     fontSize: 14,
//     color: '#666',
//   },
//   calculatedTotalValue: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   multiplierContainer: {
//     marginBottom: 16,
//     padding: 12,
//     backgroundColor: '#f8f8f8',
//     borderRadius: 8,
//   },
//   multiplierLabel: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   multiplierRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 16,
//   },
//   multiplierButton: {
//     backgroundColor: COLORS.primary + '20',
//     paddingHorizontal: 16,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   multiplierButtonText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: COLORS.primary,
//   },
//   multiplierValue: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//     minWidth: 60,
//     textAlign: 'center',
//   },
//   priceLimits: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//     paddingHorizontal: 4,
//   },
//   priceLimitText: {
//     fontSize: 11,
//     color: '#999',
//   },
//   resetButton: {
//     marginTop: 12,
//     paddingVertical: 6,
//     alignItems: 'center',
//   },
//   resetButtonText: {
//     fontSize: 12,
//     color: COLORS.primary,
//     textDecorationLine: 'underline',
//   },

//   modernCard: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 20,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 12,
//     elevation: 3,
//   },
//   cardHeaderRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1E1E2F',
//     marginLeft: 10,
//   },
//   cardSubtitle: {
//     fontSize: 14,
//     color: '#6C6C80',
//     lineHeight: 20,
//     marginBottom: 20,
//   },
//   roomSection: {
//     marginBottom: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//     paddingBottom: 16,
//   },
//   roomSectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   roomSectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1E1E2F',
//     flex: 1,
//     marginLeft: 8,
//   },
//   addSupplyChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F0F7FF',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   addSupplyChipText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: COLORS.primary,
//     marginLeft: 4,
//   },
//   supplyChipContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//   },
//   supplyChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F8F9FC',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#E8ECF0',
//     gap: 6,
//   },
//   supplyChipText: {
//     fontSize: 13,
//     color: '#1E1E2F',
//   },
//   emptySupplyState: {
//     alignItems: 'center',
//     paddingVertical: 16,
//     backgroundColor: '#F8F9FC',
//     borderRadius: 12,
//   },
//   emptySupplyText: {
//     fontSize: 14,
//     color: '#999',
//     marginTop: 4,
//   },
//   emptySupplySubtext: {
//     fontSize: 12,
//     color: '#bbb',
//   },

//   mappingSection: { marginTop: 12 },
//   mappingSectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
//   mappingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingVertical: 4 },
//   mappingTaskLabel: { fontSize: 14, color: '#555', flex: 1 },
//   mappingActions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
//   addMappingButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F0FE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16 },
//   addMappingText: { fontSize: 12, color: COLORS.primary, marginLeft: 4 },
//   mappedItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16, gap: 4 },
//   mappedText: { fontSize: 12, color: '#333' },

//   teamFeeContainer: {
//     marginBottom: 12,
//     backgroundColor: '#F8F9FC',
//     borderRadius: 8,
//     padding: 10,
//   },
//   teamFeeRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 6,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   teamName: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#333',
//   },
//   teamFeeRight: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//   },
//   teamFee: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#1E1E2F',
//   },
//   teamTime: {
//     fontSize: 12,
//     color: '#888',
//   },

//   // 👇 NEW: styles for hideable section
//   hideableSection: {
//     overflow: 'hidden',
//   },
//   collapsed: {
//     height: 0,
//     opacity: 0,
//   },
// });

// export default RoomAssignmentPicker;





import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';

import * as Animatable from 'react-native-animatable';

import FloatingLabelPickerSelect from '../../../components/shared/FloatingLabelPicker';
import { checklist } from '../../../utils/tasks_photo';
import { Checkbox, TextInput, Button } from 'react-native-paper';
import CustomCard from '../../../components/shared/CustomCard';

import {
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { tSafe } from '../../../utils/tSafe';
import userService from '../../../services/connection/userService';

import { useTheme } from '../../../theme';
import AppText from '../../../ui/AppText';

const ratePerMinute = 0.8;
const MINIMUM_TOTAL = 50;
const MAXIMUM_TOTAL = 2000;
const MIN_RATIO = 0.5;
const MAX_RATIO = 2.0;

/**
 * Safely adds alpha to a six-digit hex color.
 * Example:
 * withAlpha('#123456', '20') => '#12345620'
 */
const withAlpha = (color, alpha = '20', fallback = 'rgba(0,0,0,0.08)') => {
  if (
    typeof color === 'string' &&
    /^#[0-9a-fA-F]{6}$/.test(color)
  ) {
    return `${color}${alpha}`;
  }

  return fallback;
};

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
  savedTotalFee = null,
  ...props
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const customPricingInitialized = useRef(false);

  const [rooms, setRooms] = useState([]);
  const [roomAssignments, setRoomAssignments] = useState({});
  const [extraAssignments, setExtraAssignments] = useState({});
  const [groupSummary, setGroupSummary] = useState({});
  const [roomNotes, setRoomNotes] = useState({});
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [selectedRoomForNote, setSelectedRoomForNote] = useState(null);
  const [expectedCleaners, setExpectedCleaners] = useState(1);

  const [customPricingModalVisible, setCustomPricingModalVisible] =
    useState(false);
  const [customTotalFee, setCustomTotalFee] = useState('');
  const [useCustomPricing, setUseCustomPricing] = useState(false);
  const [calculatedTotalFee, setCalculatedTotalFee] = useState(0);
  const [showCustomPricingCard, setShowCustomPricingCard] = useState(false);
  const [priceMultiplier, setPriceMultiplier] = useState(100);

  const [hasInitialized, setHasInitialized] = useState(false);

  const prevGroupSummaryRef = useRef({});
  const prevExistingDataRef = useRef(null);
  const initializationAttempted = useRef(false);

  const animRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);

  const [roomConsumptionRules, setRoomConsumptionRules] = useState({});
  const [consumptionModalVisible, setConsumptionModalVisible] =
    useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [consumptionSupplyId, setConsumptionSupplyId] = useState('');
  const [consumptionQuantity, setConsumptionQuantity] = useState('1');
  const [supplyList, setSupplyList] = useState([]);

  useEffect(() => {
    const fetchSupplies = async () => {
      try {
        const res = await userService.getAllSupplies();
        setSupplyList(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSupplies();
  }, []);

  const addRoomConsumptionRule = async () => {
    if (!selectedRoomType || !consumptionSupplyId) return;

    const qty = parseFloat(consumptionQuantity);

    if (isNaN(qty) || qty <= 0) {
      Alert.alert(
        tSafe('invalid_quantity', 'Invalid Quantity'),
        tSafe(
          'positive_quantity_required',
          'Please enter a positive number'
        )
      );
      return;
    }

    try {
      const res = await userService.createRoomConsumptionRule({
        property_id: selectedApartment._id,
        room_type: selectedRoomType,
        supply_id: consumptionSupplyId,
        quantity: qty,
      });

      setRoomConsumptionRules(prev => ({
        ...prev,
        [selectedRoomType]: [
          ...(prev[selectedRoomType] || []),
          res.data,
        ],
      }));

      setConsumptionModalVisible(false);
      setConsumptionSupplyId('');
      setConsumptionQuantity('1');
    } catch (err) {
      Alert.alert(
        tSafe('error', 'Error'),
        tSafe('could_not_add_rule', 'Could not add rule')
      );
    }
  };

  const deleteRoomConsumptionRule = async (roomType, ruleId) => {
    Alert.alert(
      tSafe('remove_rule', 'Remove Rule'),
      tSafe(
        'remove_supply_consumption_confirm',
        'Are you sure you want to remove this supply consumption?'
      ),
      [
        {
          text: tSafe('cancel', 'Cancel'),
          style: 'cancel',
        },
        {
          text: tSafe('remove', 'Remove'),
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.deleteRoomConsumptionRule(ruleId);

              setRoomConsumptionRules(prev => ({
                ...prev,
                [roomType]: prev[roomType].filter(
                  r => r.id !== ruleId
                ),
              }));
            } catch (err) {
              Alert.alert(
                tSafe('error', 'Error'),
                tSafe(
                  'could_not_remove_rule',
                  'Could not remove rule'
                )
              );
            }
          },
        },
      ]
    );
  };

  const fetchRoomConsumptionRules = async () => {
    if (!selectedApartment?._id) {
      setRoomConsumptionRules({});
      return;
    }

    try {
      const res = await userService.getRoomConsumptionRules(
        selectedApartment._id
      );

      const rules = {};

      (res.data || []).forEach(rule => {
        if (!rules[rule.room_type]) {
          rules[rule.room_type] = [];
        }

        rules[rule.room_type].push(rule);
      });

      setRoomConsumptionRules(rules);
    } catch (err) {
      console.error(
        'Failed to load room consumption rules',
        err
      );
    }
  };

  useEffect(() => {
    fetchRoomConsumptionRules();
  }, [selectedApartment?._id]);

  useEffect(() => {
    console.log('RoomAssignmentPicker - Current state:', {
      isEditing,
      hasInitialized,
      expectedCleaners,
      roomsCount: rooms.length,
      roomAssignments: Object.keys(roomAssignments),
      extraAssignments: Object.keys(extraAssignments),
      roomNotes: Object.keys(roomNotes),
      existingChecklistData: existingChecklistData
        ? {
            type: typeof existingChecklistData,
            isArray: Array.isArray(existingChecklistData),
            keys: Object.keys(existingChecklistData || {}),
          }
        : null,
    });
  }, [
    isEditing,
    hasInitialized,
    expectedCleaners,
    rooms,
    roomAssignments,
    extraAssignments,
    roomNotes,
  ]);

  useEffect(() => {
    if (selectedApartment?.roomDetails?.length) {
      console.log(
        'Initializing rooms from apartment:',
        selectedApartment.roomDetails
      );

      const generatedRooms =
        selectedApartment.roomDetails.flatMap(roomType => {
          const count =
            typeof roomType.number === 'number'
              ? roomType.number
              : 0;

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
      console.log(
        'No room details found in apartment:',
        selectedApartment
      );
      setRooms([]);
    }
  }, [selectedApartment]);

  useEffect(() => {
    if (!hasInitialized && !initializationAttempted.current) {
      initializationAttempted.current = true;

      if (isEditing && existingChecklistData) {
        console.log(
          'INITIALIZING EDIT MODE WITH EXISTING DATA:',
          existingChecklistData
        );

        try {
          let parsedRoomAssignments = {};
          let parsedExtraAssignments = {};
          let parsedRoomNotes = {};
          let groupCount = 0;

          if (
            typeof existingChecklistData === 'object' &&
            existingChecklistData !== null
          ) {
            const groupKeys =
              Object.keys(existingChecklistData);

            const isGroupStructure = groupKeys.some(
              key =>
                key.startsWith('group_') ||
                key === 'a' ||
                key === 'b' ||
                key === 'c' ||
                key === 'd'
            );

            if (isGroupStructure) {
              console.log(
                'Detected group structure, parsing...'
              );

              groupCount = groupKeys.length;

              groupKeys.forEach(groupId => {
                const group =
                  existingChecklistData[groupId];

                if (Array.isArray(group.rooms)) {
                  group.rooms.forEach(roomId => {
                    parsedRoomAssignments[roomId] =
                      groupId;
                  });
                }

                if (group.details) {
                  Object.entries(group.details).forEach(
                    ([key, detail]) => {
                      if (
                        key !== 'Extra' &&
                        detail.notes &&
                        detail.notes.text
                      ) {
                        parsedRoomNotes[key] =
                          detail.notes.text;
                      }
                    }
                  );
                }

                if (
                  group.details &&
                  group.details.Extra &&
                  Array.isArray(group.details.Extra.tasks)
                ) {
                  group.details.Extra.tasks.forEach(task => {
                    if (task.id) {
                      parsedExtraAssignments[task.id] = {
                        label:
                          task.label || task.name,
                        time: task.time || 5,
                        price: task.price || 5,
                        group: groupId,
                        selected: true,
                      };
                    }
                  });
                }

                if (Array.isArray(group.extras)) {
                  group.extras.forEach(extraLabel => {
                    const extraTask =
                      checklist.Extra.tasks.find(
                        t => t.label === extraLabel
                      );

                    if (extraTask) {
                      parsedExtraAssignments[
                        extraTask.id
                      ] = {
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
              if (Array.isArray(existingChecklistData)) {
                console.log(
                  'Detected array structure, parsing...'
                );

                groupCount =
                  existingChecklistData.length;

                existingChecklistData.forEach(
                  (group, index) => {
                    const groupId =
                      group.groupId ||
                      `group_${index + 1}`;

                    if (Array.isArray(group.rooms)) {
                      group.rooms.forEach(roomId => {
                        parsedRoomAssignments[
                          roomId
                        ] = groupId;
                      });
                    }

                    if (group.notes) {
                      Object.entries(group.notes).forEach(
                        ([roomId, noteText]) => {
                          if (noteText) {
                            parsedRoomNotes[roomId] =
                              noteText;
                          }
                        }
                      );
                    }

                    if (Array.isArray(group.tasks)) {
                      group.tasks.forEach(task => {
                        if (
                          task.category === 'extra' ||
                          task.type === 'extra'
                        ) {
                          const taskKey =
                            task.id || task.label;

                          parsedExtraAssignments[
                            taskKey
                          ] = {
                            label: task.label,
                            time: task.time || 5,
                            price: task.price || 5,
                            group: groupId,
                            selected: true,
                          };
                        }
                      });
                    }
                  }
                );
              }
            }
          }

          console.log(
            'Parsed room assignments:',
            parsedRoomAssignments
          );

          console.log(
            'Parsed extra assignments:',
            parsedExtraAssignments
          );

          console.log(
            'Parsed room notes:',
            parsedRoomNotes
          );

          setRoomAssignments(parsedRoomAssignments);
          setExtraAssignments(parsedExtraAssignments);
          setRoomNotes(parsedRoomNotes);
          setExpectedCleaners(
            groupCount > 0 ? groupCount : 1
          );
          setHasInitialized(true);
        } catch (error) {
          console.error(
            'Error initializing from existing data:',
            error
          );

          setHasInitialized(true);
        }
      } else {
        console.log('Initializing in CREATE mode');
        setHasInitialized(true);
      }
    }
  }, [
    isEditing,
    existingChecklistData,
    hasInitialized,
  ]);

  useEffect(() => {
    if (!hasInitialized) return;

    if (expectedCleaners === 1) {
      console.log(
        'Switching to single cleaner mode - resetting all assignments and pricing'
      );

      const newRoomAssignments = {};

      rooms.forEach(room => {
        newRoomAssignments[room.id] = 'group_a';
      });

      setRoomAssignments(newRoomAssignments);

      const newExtraAssignments = {};

      Object.entries(extraAssignments).forEach(
        ([taskId, task]) => {
          if (task.selected) {
            newExtraAssignments[taskId] = {
              ...task,
              group: 'group_a',
            };
          }
        }
      );

      setExtraAssignments(newExtraAssignments);

      if (useCustomPricing) {
        setUseCustomPricing(false);
        setCustomTotalFee('');
        setPriceMultiplier(100);

        const summaryCopy = JSON.parse(
          JSON.stringify(groupSummary)
        );

        Object.keys(summaryCopy).forEach(groupId => {
          if (
            summaryCopy[groupId].calculatedPrice !==
            undefined
          ) {
            summaryCopy[groupId].price =
              summaryCopy[groupId].calculatedPrice;
          }
        });

        const totalFee = Object.values(summaryCopy).reduce(
          (sum, group) => sum + (group.price || 0),
          0
        );

        const totalTime = Object.values(summaryCopy).reduce(
          (sum, group) => sum + (group.totalTime || 0),
          0
        );

        setGroupSummary(summaryCopy);

        if (onTotalFeeChange) {
          onTotalFeeChange(
            Number(totalFee.toFixed(2))
          );
        }

        if (onTotalTimeChange) {
          onTotalTimeChange(
            Number(totalTime.toFixed(1))
          );
        }

        const currentStr =
          JSON.stringify(summaryCopy);
        const prevStr = JSON.stringify(
          prevGroupSummaryRef.current
        );

        if (currentStr !== prevStr) {
          prevGroupSummaryRef.current =
            summaryCopy;

          if (onGroupSummaryChange) {
            onGroupSummaryChange(summaryCopy);
          }
        }
      }
    }
  }, [
    expectedCleaners,
    hasInitialized,
    rooms,
  ]);

  useEffect(() => {
    if (!hasInitialized) return;
    if (expectedCleaners <= 1) return;

    console.log(
      'Switching to multiple cleaners mode - ensuring assignments are valid'
    );

    const existingGroups = new Set(
      Object.values(roomAssignments)
    );

    const availableGroups = Array.from(
      { length: expectedCleaners },
      (_, i) =>
        `group_${String.fromCharCode(97 + i)}`
    );

    const needsRedistribution =
      Array.from(existingGroups).some(
        group => !availableGroups.includes(group)
      );

    if (
      needsRedistribution &&
      rooms.length > 0 &&
      Object.keys(roomAssignments).length > 0
    ) {
      console.log(
        'Redistributing rooms evenly among available groups'
      );

      const newRoomAssignments = {
        ...roomAssignments,
      };

      const roomsList =
        Object.keys(roomAssignments);

      roomsList.forEach((roomId, index) => {
        const groupIndex =
          index % availableGroups.length;

        newRoomAssignments[roomId] =
          availableGroups[groupIndex];
      });

      setRoomAssignments(newRoomAssignments);
    }
  }, [
    expectedCleaners,
    hasInitialized,
    rooms,
    roomAssignments,
  ]);

  useEffect(() => {
    if (
      hasInitialized &&
      expectedCleaners === 1 &&
      rooms.length > 0
    ) {
      if (
        Object.keys(roomAssignments).length === 0
      ) {
        const newAssignments = {};

        rooms.forEach(room => {
          newAssignments[room.id] = 'group_a';
        });

        setRoomAssignments(newAssignments);
      }
    }
  }, [
    expectedCleaners,
    rooms,
    hasInitialized,
  ]);

  useEffect(() => {
    if (!hasInitialized) return;

    if (
      savedTotalFee !== null &&
      savedTotalFee !== undefined &&
      !customPricingInitialized.current
    ) {
      const diff = Math.abs(
        Number(savedTotalFee) - calculatedTotalFee
      );

      if (diff > 0.01) {
        customPricingInitialized.current = true;

        setUseCustomPricing(true);
        setCustomTotalFee(
          String(savedTotalFee)
        );

        return;
      }
    }

    console.log('Calculating group summary...');

    const timePerSqft = {
      Bedroom: 0.15,
      Bathroom: 0.18,
      Livingroom: 0.14,
      Kitchen: 0.20,
    };

    const summary = {};

    rooms.forEach(room => {
      const groupId =
        roomAssignments[room.id];

      if (!groupId) return;

      const rate =
        timePerSqft[room.type] || 0.15;

      const time =
        room.size * rate;

      if (!summary[groupId]) {
        summary[groupId] = {
          totalTime: 0,
          rooms: [],
          price: 0,
          extras: [],
          details: {},
          calculatedPrice: 0,
        };
      }

      summary[groupId].totalTime += time;
      summary[groupId].rooms.push(room.id);

      if (
        !summary[groupId].details[room.id]
      ) {
        const tasks = (
          checklist[room.type]?.tasks || []
        ).map(task => ({
          ...task,
          value: false,
          name: `${task.label
            .toLowerCase()
            .replace(/\s+/g, '_')}_${room.id.toLowerCase()}`,
        }));

        summary[groupId].details[room.id] = {
          photos: [],
          tasks,
          notes: {
            text:
              roomNotes[room.id] || '',
          },
        };
      }
    });

    Object.entries(extraAssignments).forEach(
      ([taskId, val]) => {
        if (
          val.selected &&
          val.group
        ) {
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
              calculatedPrice: 0,
            };
          }

          summary[groupId].totalTime += time;
          summary[groupId].price += price;

          if (val.label) {
            summary[groupId].extras.push(
              val.label
            );
          }

          if (
            !summary[groupId].details.Extra
          ) {
            summary[groupId].details.Extra = {
              photos: [],
              tasks: [],
            };
          }

          const alreadyIncluded =
            summary[groupId].details.Extra.tasks.some(
              t => t.id === taskId
            );

          if (!alreadyIncluded) {
            summary[groupId].details.Extra.tasks.push({
              label: val.label,
              value: true,
              name: taskId,
              id: taskId,
              time: val.time,
              price: val.price,
            });
          }
        }
      }
    );

    Object.keys(summary).forEach(groupId => {
      const calculatedPrice =
        parseFloat(
          (
            summary[groupId].totalTime *
            ratePerMinute
          ).toFixed(2)
        );

      summary[groupId].calculatedPrice =
        calculatedPrice;

      summary[groupId].price =
        calculatedPrice;
    });

    console.log(
      'Calculated summary:',
      summary
    );

    setGroupSummary(summary);

    const totalFee =
      Object.values(summary).reduce(
        (sum, group) =>
          sum + (group.price || 0),
        0
      );

    const totalTime =
      Object.values(summary).reduce(
        (sum, group) =>
          sum + (group.totalTime || 0),
        0
      );

    setCalculatedTotalFee(
      Number(totalFee.toFixed(2))
    );

    if (
      savedTotalFee !== null &&
      savedTotalFee !== undefined &&
      !customPricingInitialized.current
    ) {
      const diff = Math.abs(
        Number(savedTotalFee) - totalFee
      );

      if (diff > 0.01) {
        customPricingInitialized.current = true;

        setUseCustomPricing(true);
        setCustomTotalFee(
          String(savedTotalFee)
        );

        return;
      }
    }

    if (
      useCustomPricing &&
      customTotalFee
    ) {
      applyCustomPricing(
        parseFloat(customTotalFee)
      );
    } else {
      if (onTotalFeeChange) {
        onTotalFeeChange(
          Number(totalFee.toFixed(2))
        );
      }

      if (onTotalTimeChange) {
        onTotalTimeChange(
          Number(totalTime.toFixed(1))
        );
      }

      const currentStr =
        JSON.stringify(summary);

      const prevStr =
        JSON.stringify(
          prevGroupSummaryRef.current
        );

      if (currentStr !== prevStr) {
        prevGroupSummaryRef.current =
          summary;

        if (onGroupSummaryChange) {
          console.log(
            'Notifying parent of group summary change'
          );

          onGroupSummaryChange(summary);
        }
      }
    }
  }, [
    roomAssignments,
    rooms,
    extraAssignments,
    roomNotes,
    hasInitialized,
    savedTotalFee,
  ]);

  const applyCustomPricing = customTotal => {
    const summaryCopy =
      JSON.parse(
        JSON.stringify(groupSummary)
      );

    const groups =
      Object.values(summaryCopy);

    const totalCalculated =
      groups.reduce(
        (sum, group) =>
          sum + group.calculatedPrice,
        0
      );

    if (totalCalculated === 0) return;

    let appliedTotal = 0;

    Object.keys(summaryCopy).forEach(
      groupId => {
        const group =
          summaryCopy[groupId];

        const ratio =
          group.calculatedPrice /
          totalCalculated;

        const proportionalPrice =
          customTotal * ratio;

        group.price =
          Number(
            proportionalPrice.toFixed(2)
          );

        appliedTotal += group.price;
      }
    );

    const roundingDiff =
      customTotal - appliedTotal;

    if (
      Math.abs(roundingDiff) > 0.01
    ) {
      const groupsArray =
        Object.keys(summaryCopy);

      if (groupsArray.length > 0) {
        summaryCopy[
          groupsArray[0]
        ].price += roundingDiff;
      }
    }

    setGroupSummary(summaryCopy);

    if (onTotalFeeChange) {
      onTotalFeeChange(customTotal);
    }

    if (onTotalTimeChange) {
      onTotalTimeChange(
        Object.values(summaryCopy).reduce(
          (sum, g) =>
            sum + g.totalTime,
          0
        )
      );
    }

    const currentStr =
      JSON.stringify(summaryCopy);

    const prevStr =
      JSON.stringify(
        prevGroupSummaryRef.current
      );

    if (currentStr !== prevStr) {
      prevGroupSummaryRef.current =
        summaryCopy;

      if (onGroupSummaryChange) {
        console.log(
          'Notifying parent of custom pricing update'
        );

        onGroupSummaryChange(
          summaryCopy
        );
      }
    }
  };

  const validateCustomPrice = customTotal => {
    if (
      isNaN(customTotal) ||
      customTotal <= 0
    ) {
      Alert.alert(
        tSafe('invalid_amount', 'Invalid Amount'),
        tSafe(
          'valid_positive_amount',
          'Please enter a valid positive amount.'
        )
      );

      return false;
    }

    if (customTotal < MINIMUM_TOTAL) {
      Alert.alert(
        tSafe('minimum_amount', 'Minimum Amount'),
        `Custom total must be at least $${MINIMUM_TOTAL}. The calculated total is $${calculatedTotalFee.toFixed(
          2
        )}.`,
        [{ text: tSafe('ok', 'OK') }]
      );

      return false;
    }

    if (customTotal > MAXIMUM_TOTAL) {
      Alert.alert(
        tSafe('maximum_amount', 'Maximum Amount'),
        `Custom total cannot exceed $${MAXIMUM_TOTAL}. The calculated total is $${calculatedTotalFee.toFixed(
          2
        )}.`,
        [{ text: tSafe('ok', 'OK') }]
      );

      return false;
    }

    if (
      customTotal <
      calculatedTotalFee * MIN_RATIO
    ) {
      Alert.alert(
        tSafe(
          'price_significantly_lower',
          'Price Significantly Lower'
        ),
        `Custom price ($${customTotal.toFixed(
          2
        )}) is significantly lower than calculated price ($${calculatedTotalFee.toFixed(
          2
        )}).\n\nThis means cleaners will earn ${(
          (1 -
            customTotal /
              calculatedTotalFee) *
          100
        ).toFixed(
          0
        )}% less than the standard rate.\n\nAre you sure you want to proceed?`,
        [
          {
            text: tSafe(
              'cancel',
              'Cancel'
            ),
            style: 'cancel',
          },
          {
            text: tSafe(
              'continue',
              'Continue'
            ),
            onPress: () => {
              setUseCustomPricing(true);
              setCustomPricingModalVisible(
                false
              );

              applyCustomPricing(
                customTotal
              );
            },
            style: 'destructive',
          },
        ]
      );

      return false;
    }

    if (
      customTotal >
      calculatedTotalFee * MAX_RATIO
    ) {
      Alert.alert(
        tSafe(
          'price_significantly_higher',
          'Price Significantly Higher'
        ),
        `Custom price ($${customTotal.toFixed(
          2
        )}) is significantly higher than calculated price ($${calculatedTotalFee.toFixed(
          2
        )}).\n\nThis means cleaners will earn ${(
          (customTotal /
            calculatedTotalFee -
            1) *
          100
        ).toFixed(
          0
        )}% more than the standard rate.\n\nAre you sure you want to proceed?`,
        [
          {
            text: tSafe(
              'cancel',
              'Cancel'
            ),
            style: 'cancel',
          },
          {
            text: tSafe(
              'continue',
              'Continue'
            ),
            onPress: () => {
              setUseCustomPricing(true);
              setCustomPricingModalVisible(
                false
              );

              applyCustomPricing(
                customTotal
              );
            },
          },
        ]
      );

      return false;
    }

    return true;
  };

  const handleCustomPricingSave = () => {
    const customTotal =
      parseFloat(customTotalFee);

    if (
      validateCustomPrice(customTotal)
    ) {
      setUseCustomPricing(true);
      setCustomPricingModalVisible(
        false
      );

      applyCustomPricing(
        customTotal
      );
    }
  };

  const handleMultiplierChange =
    multiplier => {
      setPriceMultiplier(multiplier);

      const adjustedTotal =
        (calculatedTotalFee *
          multiplier) /
        100;

      setCustomTotalFee(
        adjustedTotal.toFixed(2)
      );
    };

  const handleResetPricing = () => {
    Alert.alert(
      tSafe(
        'reset_pricing',
        'Reset Pricing'
      ),
      tSafe(
        'reset_pricing_confirm',
        'Are you sure you want to reset to the calculated pricing? This will remove your custom pricing.'
      ),
      [
        {
          text: tSafe(
            'cancel',
            'Cancel'
          ),
          style: 'cancel',
        },
        {
          text: tSafe(
            'reset',
            'Reset'
          ),
          onPress: () => {
            setUseCustomPricing(false);
            setCustomTotalFee('');
            setPriceMultiplier(100);

            const summaryCopy =
              JSON.parse(
                JSON.stringify(
                  groupSummary
                )
              );

            Object.keys(
              summaryCopy
            ).forEach(groupId => {
              summaryCopy[
                groupId
              ].price =
                summaryCopy[
                  groupId
                ].calculatedPrice;
            });

            const totalFee =
              Object.values(
                summaryCopy
              ).reduce(
                (sum, group) =>
                  sum +
                  (group.price ||
                    0),
                0
              );

            const totalTime =
              Object.values(
                summaryCopy
              ).reduce(
                (sum, group) =>
                  sum +
                  (group.totalTime ||
                    0),
                0
              );

            setGroupSummary(
              summaryCopy
            );

            if (onTotalFeeChange) {
              onTotalFeeChange(
                Number(
                  totalFee.toFixed(2)
                )
              );
            }

            if (onTotalTimeChange) {
              onTotalTimeChange(
                Number(
                  totalTime.toFixed(1)
                )
              );
            }

            const currentStr =
              JSON.stringify(
                summaryCopy
              );

            const prevStr =
              JSON.stringify(
                prevGroupSummaryRef.current
              );

            if (
              currentStr !==
              prevStr
            ) {
              prevGroupSummaryRef.current =
                summaryCopy;

              if (
                onGroupSummaryChange
              ) {
                onGroupSummaryChange(
                  summaryCopy
                );
              }
            }
          },
        },
      ]
    );
  };

  const handleAssignmentChange = (
    roomId,
    groupId
  ) => {
    console.log(
      'Assignment change:',
      roomId,
      '->',
      groupId
    );

    const updated = {
      ...roomAssignments,
      [roomId]: groupId,
    };

    setRoomAssignments(updated);
  };

  const handleSaveNote = (
    roomId,
    noteText
  ) => {
    setRoomNotes(prev => ({
      ...prev,
      [roomId]: noteText,
    }));

    setNoteModalVisible(false);
  };

  const handleExtraGroupAssign = (
    taskId,
    groupId
  ) => {
    setExtraAssignments(prev => {
      const existing =
        prev[taskId] || {};

      return {
        ...prev,
        [taskId]: {
          ...existing,
          group: groupId,
          selected: true,
          label:
            existing.label ||
            checklist.Extra.tasks.find(
              t => t.id === taskId
            )?.label ||
            'Unknown',
          time:
            existing.time || 5,
          price:
            existing.price || 5,
        },
      };
    });
  };

  const toggleExtraTask = task => {
    setExtraAssignments(prev => {
      const current =
        prev[task.id];

      if (current) {
        const updated = {
          ...prev,
        };

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

  const getRoomIcon = type => {
    const iconProps = {
      size: 26,
      color: theme.icon.default,
      style: styles.icon,
    };

    switch (type) {
      case 'Bedroom':
        return (
          <MaterialCommunityIcons
            name="bed-outline"
            {...iconProps}
          />
        );

      case 'Bathroom':
        return (
          <MaterialCommunityIcons
            name="shower"
            {...iconProps}
          />
        );

      case 'Livingroom':
        return (
          <MaterialCommunityIcons
            name="sofa-outline"
            {...iconProps}
          />
        );

      case 'Kitchen':
        return (
          <MaterialCommunityIcons
            name="fridge-outline"
            {...iconProps}
          />
        );

      default:
        return null;
    }
  };

  const chunkArray = (
    arr,
    size
  ) => {
    const chunks = [];

    for (
      let i = 0;
      i < arr.length;
      i += size
    ) {
      chunks.push(
        arr.slice(i, i + size)
      );
    }

    return chunks;
  };

  const checklistByRoomType = {
    Bedroom:
      checklist.Bedroom.tasks,
    Bathroom:
      checklist.Bathroom.tasks,
    Livingroom:
      checklist.Livingroom.tasks,
    Kitchen:
      checklist.Kitchen.tasks,
  };

  const taskGroups = Array.from(
    { length: expectedCleaners },
    (_, i) => {
      const groupLetter =
        String.fromCharCode(
          65 + i
        );

      const groupId =
        `group_${String.fromCharCode(
          97 + i
        )}`;

      return {
        groupId,
        label: `${tSafe(
          'team',
          'TEAM'
        )} ${groupLetter}`,
        value: groupId,
      };
    }
  );

  useEffect(() => {
    if (useCustomPricing) {
      animRef.current
        ?.slideOutUp?.(400)
        ?.then(() =>
          setCollapsed(true)
        );
    } else {
      setCollapsed(false);

      requestAnimationFrame(() => {
        animRef.current?.fadeInDown?.(
          400
        );
      });
    }
  }, [useCustomPricing]);

  if (!hasInitialized) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="small"
          color={
            theme.brand.primary
          }
        />

        <AppText
          variant="body2"
          style={
            styles.loadingText
          }
        >
          {tSafe(
            'loading_checklist_data',
            'Loading checklist data...'
          )}
        </AppText>
      </View>
    );
  }

  const totalDisplayedPrice =
    Object.values(
      groupSummary
    ).reduce(
      (sum, g) =>
        sum + (g.price || 0),
      0
    );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.contentContainer
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      <View
        style={
          styles.pickerWrapper
        }
      >
        {/* Checklist Name */}
        <TextInput
          mode="outlined"
          label={tSafe(
            'checklist_name',
            'Checklist Name'
          )}
          placeholder={tSafe(
            'checklist_name_placeholder',
            'e.g., Mid-July Deep Clean'
          )}
          placeholderTextColor={
            theme.input.placeholder
          }
          outlineColor={
            theme.input.border
          }
          activeOutlineColor={
            theme.input.focus
          }
          value={checklistName}
          onChangeText={
            setChecklistName
          }
          style={
            styles.checklistNameInput
          }
          textColor={
            theme.input.text
          }
          theme={{
            colors: {
              primary:
                theme.input.focus,
              outline:
                theme.input.border,
              background:
                theme.input.background,
              onSurface:
                theme.input.text,
              placeholder:
                theme.input.placeholder,
            },
            roundness: 14,
          }}
        />

        {/* Expected Cleaners */}
        <View
          style={
            styles.pickerContainer
          }
        >
          <View
            style={
              styles.pickerWrapper
            }
          >
            <FloatingLabelPickerSelect
              label={tSafe(
                'expected_cleaners',
                'Expected Cleaners'
              )}
              value={
                expectedCleaners
              }
              onValueChange={val =>
                setExpectedCleaners(
                  val
                )
              }
              items={Array.from(
                { length: 10 },
                (_, i) => ({
                  label: `${
                    i + 1
                  }`,
                  value: i + 1,
                })
              )}
            />
          </View>

          <TouchableOpacity
            onPress={
              onInfoPress
            }
            style={
              styles.infoIcon
            }
            accessibilityRole="button"
            accessibilityLabel={tSafe(
              'expected_cleaners_info',
              'Expected cleaners information'
            )}
          >
            <MaterialIcons
              name="info-outline"
              size={26}
              color={
                theme.icon.default
              }
            />
          </TouchableOpacity>
        </View>

        {/* Rooms + Extra Tasks */}
        <Animatable.View
          ref={animRef}
          style={[
            styles.hideableSection,
            collapsed &&
              styles.collapsed,
          ]}
        >
          {rooms.length === 0 ? (
            <CustomCard
              style={
                styles.roomBlock
              }
            >
              <AppText
                variant="h6"
                style={
                  styles.roomType
                }
              >
                {tSafe(
                  'no_rooms_found',
                  'No rooms found'
                )}
              </AppText>

              <AppText
                variant="body2"
                style={
                  styles.notePreview
                }
              >
                {tSafe(
                  'no_rooms_configured',
                  "This property doesn't have any rooms configured."
                )}
              </AppText>
            </CustomCard>
          ) : (
            rooms.map(room => (
              <CustomCard
                key={room.id}
                style={
                  styles.roomBlock
                }
              >
                <View
                  style={
                    styles.roomHeader
                  }
                >
                  <View
                    style={
                      styles.roomTitleRow
                    }
                  >
                    {getRoomIcon(
                      room.type
                    )}

                    <AppText
                      variant="body1"
                      style={
                        styles.roomType
                      }
                    >
                      {room.type} #
                      {room.number}
                    </AppText>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedRoomForNote(
                        room.id
                      );

                      setNoteText(
                        roomNotes[
                          room.id
                        ] || ''
                      );

                      setNoteModalVisible(
                        true
                      );
                    }}
                    style={
                      styles.noteButton
                    }
                    accessibilityRole="button"
                    accessibilityLabel={tSafe(
                      'room_note',
                      'Room note'
                    )}
                  >
                    <Icon
                      name={
                        roomNotes[
                          room.id
                        ]
                          ? 'note-edit-outline'
                          : 'note-plus'
                      }
                      size={24}
                      color={
                        theme.icon.active
                      }
                    />
                  </TouchableOpacity>
                </View>

                {roomNotes[
                  room.id
                ] ? (
                  <AppText
                    variant="caption"
                    style={
                      styles.notePreview
                    }
                  >
                    {tSafe(
                      'note_prefix',
                      'Note:'
                    )}{' '}
                    {roomNotes[
                      room.id
                    ].slice(
                      0,
                      40
                    )}
                    ...
                  </AppText>
                ) : null}

                {expectedCleaners >
                1 ? (
                  <FloatingLabelPickerSelect
                    label={tSafe(
                      'assign_to',
                      'Assign to'
                    )}
                    value={
                      roomAssignments[
                        room.id
                      ] || null
                    }
                    onValueChange={groupId =>
                      handleAssignmentChange(
                        room.id,
                        groupId
                      )
                    }
                    items={
                      taskGroups
                    }
                  />
                ) : (
                  <AppText
                    variant="body2"
                    style={
                      styles.assignedText
                    }
                  >
                    {tSafe(
                      'assigned_to_team_a',
                      'Assigned to TEAM A'
                    )}
                  </AppText>
                )}

                {roomAssignments[
                  room.id
                ] && (
                  <View
                    style={
                      styles.tasksWrapper
                    }
                  >
                    {chunkArray(
                      checklistByRoomType[
                        room.type
                      ] || [],
                      2
                    ).map(
                      (
                        row,
                        rowIndex
                      ) => (
                        <View
                          key={
                            rowIndex
                          }
                          style={
                            styles.taskRow
                          }
                        >
                          {row.map(
                            task => (
                              <View
                                key={
                                  task.id
                                }
                                style={
                                  styles.taskColumn
                                }
                              >
                                <View
                                  style={
                                    styles.dotRow
                                  }
                                >
                                  <View
                                    style={
                                      styles.dot
                                    }
                                  />

                                  <AppText
                                    variant="body2"
                                    style={
                                      styles.taskLabel
                                    }
                                  >
                                    {
                                      task.label
                                    }
                                  </AppText>
                                </View>
                              </View>
                            )
                          )}
                        </View>
                      )
                    )}
                  </View>
                )}
              </CustomCard>
            ))
          )}

          {/* Extra Tasks */}
          <CustomCard
            style={
              styles.roomBlock
            }
          >
            <AppText
              variant="h6"
              style={
                styles.roomType
              }
            >
              {tSafe(
                'extra_tasks',
                'Extra Tasks'
              )}
            </AppText>

            {checklist.Extra.tasks.map(
              task => {
                const isSelected =
                  extraAssignments[
                    task.id
                  ]?.selected;

                const assignedGroup =
                  extraAssignments[
                    task.id
                  ]?.group;

                return (
                  <View
                    key={task.id}
                    style={
                      styles.extraRow
                    }
                  >
                    <Checkbox.Android
                      status={
                        isSelected
                          ? 'checked'
                          : 'unchecked'
                      }
                      onPress={() => {
                        if (
                          expectedCleaners ===
                          1
                        ) {
                          if (
                            isSelected
                          ) {
                            setExtraAssignments(
                              prev => {
                                const updated =
                                  {
                                    ...prev,
                                  };

                                delete updated[
                                  task.id
                                ];

                                return updated;
                              }
                            );
                          } else {
                            setExtraAssignments(
                              prev => ({
                                ...prev,
                                [task.id]: {
                                  label:
                                    task.label,
                                  time:
                                    task.time ||
                                    5,
                                  price:
                                    task.price ||
                                    5,
                                  group:
                                    'group_a',
                                  selected:
                                    true,
                                },
                              })
                            );
                          }
                        } else {
                          toggleExtraTask(
                            task
                          );
                        }
                      }}
                      color={
                        theme.brand.primary
                      }
                      uncheckedColor={
                        theme.icon.muted
                      }
                    />

                    <AppText
                      variant="body2"
                      style={
                        styles.taskLabel
                      }
                    >
                      {task.label}
                    </AppText>

                    {expectedCleaners >
                      1 && (
                      <View
                        style={
                          styles.extraPicker
                        }
                      >
                        <FloatingLabelPickerSelect
                          label={tSafe(
                            'assign_to',
                            'Assign to'
                          )}
                          value={
                            assignedGroup ||
                            null
                          }
                          onValueChange={groupId =>
                            handleExtraGroupAssign(
                              task.id,
                              groupId
                            )
                          }
                          items={
                            taskGroups
                          }
                        />
                      </View>
                    )}
                  </View>
                );
              }
            )}
          </CustomCard>
        </Animatable.View>

        {/* Pricing Summary */}
        <CustomCard
          style={
            styles.customPricingCard
          }
        >
          <View
            style={
              styles.customPricingHeader
            }
          >
            <MaterialIcons
              name="attach-money"
              size={24}
              color={
                theme.brand.primary
              }
            />

            <AppText
              variant="h6"
              style={
                styles.customPricingTitle
              }
            >
              {tSafe(
                'pricing_summary',
                'Pricing Summary'
              )}
            </AppText>
          </View>

          {Object.keys(
            groupSummary
          ).length > 0 && (
            <View
              style={
                styles.teamFeeContainer
              }
            >
              {Object.entries(
                groupSummary
              ).map(
                ([groupId, group]) => {
                  const groupLabel =
                    taskGroups.find(
                      g =>
                        g.value ===
                        groupId
                    )?.label ||
                    groupId;

                  return (
                    <View
                      key={groupId}
                      style={
                        styles.teamFeeRow
                      }
                    >
                      <AppText
                        variant="body2"
                        style={
                          styles.teamName
                        }
                      >
                        {
                          groupLabel
                        }
                      </AppText>

                      <View
                        style={
                          styles.teamFeeRight
                        }
                      >
                        <AppText
                          variant="body1"
                          style={
                            styles.teamFee
                          }
                        >
                          $
                          {group.price?.toFixed(
                            2
                          ) ||
                            '0.00'}
                        </AppText>

                        <AppText
                          variant="caption"
                          style={
                            styles.teamTime
                          }
                        >
                          (
                          {group.totalTime?.toFixed(
                            1
                          ) || 0}{' '}
                          min)
                        </AppText>
                      </View>
                    </View>
                  );
                }
              )}
            </View>
          )}

          <View
            style={
              styles.pricingRow
            }
          >
            <AppText
              variant="body2"
              style={
                styles.pricingLabel
              }
            >
              {useCustomPricing
                ? tSafe(
                    'custom_total',
                    'Custom Total'
                  )
                : tSafe(
                    'calculated_total',
                    'Calculated Total'
                  )}
            </AppText>

            <AppText
              variant="body1"
              style={
                useCustomPricing
                  ? styles.customPriceValue
                  : styles.calculatedPriceValue
              }
            >
              $
              {totalDisplayedPrice.toFixed(
                2
              )}
            </AppText>
          </View>

          {!useCustomPricing ? (
            <TouchableOpacity
              style={
                styles.setCustomPriceButton
              }
              onPress={() =>
                setCustomPricingModalVisible(
                  true
                )
              }
              accessibilityRole="button"
            >
              <MaterialIcons
                name="edit"
                size={18}
                color={
                  theme.button.primaryText
                }
              />

              <AppText
                variant="body2"
                style={
                  styles.setCustomPriceButtonText
                }
              >
                {tSafe(
                  'set_custom_price',
                  'Set Custom Price'
                )}
              </AppText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.setCustomPriceButton,
                styles.resetPricingButton,
              ]}
              onPress={
                handleResetPricing
              }
              accessibilityRole="button"
            >
              <MaterialIcons
                name="restore"
                size={18}
                color={
                  theme.button.primaryText
                }
              />

              <AppText
                variant="body2"
                style={
                  styles.setCustomPriceButtonText
                }
              >
                {tSafe(
                  'reset_to_calculated',
                  'Reset to Calculated'
                )}
              </AppText>
            </TouchableOpacity>
          )}

          {useCustomPricing && (
            <View
              style={
                styles.customPricingNote
              }
            >
              <MaterialIcons
                name="info"
                size={16}
                color={
                  theme.icon.muted
                }
              />

              <AppText
                variant="caption"
                style={
                  styles.customPricingNoteText
                }
              >
                {tSafe(
                  'custom_pricing_note',
                  'Custom pricing is active. The total will be split proportionally among cleaners based on their assigned tasks.'
                )}
              </AppText>
            </View>
          )}
        </CustomCard>

        {/* Custom Pricing Modal */}
        <Modal
          visible={
            customPricingModalVisible
          }
          transparent
          animationType="fade"
          onRequestClose={() =>
            setCustomPricingModalVisible(
              false
            )
          }
        >
          <View
            style={
              styles.modalOverlay
            }
          >
            <View
              style={
                styles.modalContent
              }
            >
              <AppText
                variant="h6"
                style={
                  styles.modalTitle
                }
              >
                {tSafe(
                  'custom_pricing',
                  'Custom Pricing'
                )}
              </AppText>

              <AppText
                variant="body2"
                style={
                  styles.modalSubtitle
                }
              >
                {tSafe(
                  'custom_pricing_modal_desc',
                  'Set a custom total amount for this cleaning job. The amount will be automatically split among cleaners based on their assigned tasks.'
                )}
              </AppText>

              <View
                style={
                  styles.calculatedTotalContainer
                }
              >
                <AppText
                  variant="body2"
                  style={
                    styles.calculatedTotalLabel
                  }
                >
                  {tSafe(
                    'calculated_total',
                    'Calculated Total'
                  )}
                </AppText>

                <AppText
                  variant="body1"
                  style={
                    styles.calculatedTotalValue
                  }
                >
                  $
                  {calculatedTotalFee.toFixed(
                    2
                  )}
                </AppText>
              </View>

              <View
                style={
                  styles.multiplierContainer
                }
              >
                <AppText
                  variant="caption"
                  style={
                    styles.multiplierLabel
                  }
                >
                  {tSafe(
                    'quick_adjust_percentage',
                    'Quick adjust by percentage:'
                  )}
                </AppText>

                <View
                  style={
                    styles.multiplierRow
                  }
                >
                  <TouchableOpacity
                    style={
                      styles.multiplierButton
                    }
                    onPress={() =>
                      handleMultiplierChange(
                        Math.max(
                          50,
                          priceMultiplier -
                            5
                        )
                      )
                    }
                  >
                    <AppText
                      variant="caption"
                      style={
                        styles.multiplierButtonText
                      }
                    >
                      -5%
                    </AppText>
                  </TouchableOpacity>

                  <AppText
                    variant="body1"
                    style={
                      styles.multiplierValue
                    }
                  >
                    {
                      priceMultiplier
                    }
                    %
                  </AppText>

                  <TouchableOpacity
                    style={
                      styles.multiplierButton
                    }
                    onPress={() =>
                      handleMultiplierChange(
                        Math.min(
                          200,
                          priceMultiplier +
                            5
                        )
                      )
                    }
                  >
                    <AppText
                      variant="caption"
                      style={
                        styles.multiplierButtonText
                      }
                    >
                      +5%
                    </AppText>
                  </TouchableOpacity>
                </View>
              </View>

              <TextInput
                mode="outlined"
                label={tSafe(
                  'custom_total_fee',
                  'Custom Total Fee ($)'
                )}
                placeholder={`${calculatedTotalFee.toFixed(
                  2
                )}`}
                value={
                  customTotalFee
                }
                onChangeText={
                  setCustomTotalFee
                }
                keyboardType="numeric"
                style={
                  styles.modalInput
                }
                textColor={
                  theme.input.text
                }
                placeholderTextColor={
                  theme.input.placeholder
                }
                outlineColor={
                  theme.input.border
                }
                activeOutlineColor={
                  theme.input.focus
                }
                theme={{
                  colors: {
                    primary:
                      theme.input.focus,
                    outline:
                      theme.input.border,
                    background:
                      theme.input.background,
                    onSurface:
                      theme.input.text,
                    placeholder:
                      theme.input.placeholder,
                  },
                  roundness: 14,
                }}
              />

              <View
                style={
                  styles.priceLimits
                }
              >
                <AppText
                  variant="caption"
                  style={
                    styles.priceLimitText
                  }
                >
                  Min: $
                  {MINIMUM_TOTAL}
                </AppText>

                <AppText
                  variant="caption"
                  style={
                    styles.priceLimitText
                  }
                >
                  Max: $
                  {MAXIMUM_TOTAL}
                </AppText>

                <AppText
                  variant="caption"
                  style={
                    styles.priceLimitText
                  }
                >
                  Range:{' '}
                  {MIN_RATIO *
                    100}
                  % -{' '}
                  {MAX_RATIO *
                    100}
                  %
                </AppText>
              </View>

              <Button
                mode="contained"
                onPress={
                  handleCustomPricingSave
                }
                style={
                  styles.modalButton
                }
                buttonColor={
                  theme.button
                    .primaryBackground
                }
                textColor={
                  theme.button
                    .primaryText
                }
              >
                {tSafe(
                  'apply_custom_price',
                  'Apply Custom Price'
                )}
              </Button>

              <Button
                mode="outlined"
                onPress={() => {
                  setCustomPricingModalVisible(
                    false
                  );

                  setCustomTotalFee(
                    ''
                  );
                }}
                style={
                  styles.modalCancelButton
                }
                textColor={
                  theme.button
                    .secondaryText
                }
              >
                {tSafe(
                  'cancel',
                  'Cancel'
                )}
              </Button>
            </View>
          </View>
        </Modal>

        {/* Room Note Modal */}
        {noteModalVisible && (
          <Modal
            visible={
              noteModalVisible
            }
            transparent
            animationType="fade"
            onRequestClose={() =>
              setNoteModalVisible(
                false
              )
            }
          >
            <View
              style={
                styles.modalOverlay
              }
            >
              <View
                style={
                  styles.modalContent
                }
              >
                <AppText
                  variant="h6"
                  style={
                    styles.modalTitle
                  }
                >
                  {tSafe(
                    'add_note',
                    'Add Note'
                  )}
                </AppText>

                <TextInput
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  value={noteText}
                  onChangeText={
                    setNoteText
                  }
                  placeholder={tSafe(
                    'note_placeholder',
                    'Add your note for this room...'
                  )}
                  placeholderTextColor={
                    theme.input.placeholder
                  }
                  outlineColor={
                    theme.input.border
                  }
                  activeOutlineColor={
                    theme.input.focus
                  }
                  style={
                    styles.modalInput
                  }
                  textColor={
                    theme.input.text
                  }
                  theme={{
                    colors: {
                      primary:
                        theme.input.focus,
                      outline:
                        theme.input.border,
                      background:
                        theme.input.background,
                      onSurface:
                        theme.input.text,
                      placeholder:
                        theme.input.placeholder,
                    },
                    roundness: 14,
                  }}
                />

                <Button
                  mode="contained"
                  onPress={() =>
                    handleSaveNote(
                      selectedRoomForNote,
                      noteText
                    )
                  }
                  style={
                    styles.modalButton
                  }
                  buttonColor={
                    theme.button
                      .primaryBackground
                  }
                  textColor={
                    theme.button
                      .primaryText
                  }
                >
                  {tSafe(
                    'save_note',
                    'Save Note'
                  )}
                </Button>

                <Button
                  mode="outlined"
                  onPress={() =>
                    setNoteModalVisible(
                      false
                    )
                  }
                  style={
                    styles.modalCancelButton
                  }
                  textColor={
                    theme.button
                      .secondaryText
                  }
                >
                  {tSafe(
                    'cancel',
                    'Cancel'
                  )}
                </Button>
              </View>
            </View>
          </Modal>
        )}
      </View>

      {/* Consumption Rule Modal */}
      <Modal
        visible={
          consumptionModalVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setConsumptionModalVisible(
            false
          )
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.modalContent
            }
          >
            <AppText
              variant="h6"
              style={
                styles.modalTitle
              }
            >
              Consumption Rule for{' '}
              {selectedRoomType}
            </AppText>

            <AppText
              variant="body2"
              style={
                styles.modalSubtitle
              }
            >
              When cleaning this room,
              deduct:
            </AppText>

            <FloatingLabelPickerSelect
              label="Select Supply"
              value={
                consumptionSupplyId
              }
              onValueChange={
                setConsumptionSupplyId
              }
              items={supplyList.map(
                s => ({
                  label: s.name,
                  value: s._id,
                })
              )}
            />

            <TextInput
              mode="outlined"
              label="Quantity"
              placeholder="Quantity (e.g., 2)"
              keyboardType="numeric"
              value={
                consumptionQuantity
              }
              onChangeText={
                setConsumptionQuantity
              }
              style={
                styles.modalInput
              }
              textColor={
                theme.input.text
              }
              placeholderTextColor={
                theme.input.placeholder
              }
              outlineColor={
                theme.input.border
              }
              activeOutlineColor={
                theme.input.focus
              }
              theme={{
                colors: {
                  primary:
                    theme.input.focus,
                  outline:
                    theme.input.border,
                  background:
                    theme.input.background,
                  onSurface:
                    theme.input.text,
                  placeholder:
                    theme.input.placeholder,
                },
                roundness: 14,
              }}
            />

            <View
              style={
                styles.modalButtons
              }
            >
              <Button
                mode="outlined"
                onPress={() =>
                  setConsumptionModalVisible(
                    false
                  )
                }
                textColor={
                  theme.button
                    .secondaryText
                }
              >
                {tSafe(
                  'cancel',
                  'Cancel'
                )}
              </Button>

              <Button
                mode="contained"
                onPress={
                  addRoomConsumptionRule
                }
                buttonColor={
                  theme.button
                    .primaryBackground
                }
                textColor={
                  theme.button
                    .primaryText
                }
              >
                {tSafe(
                  'add',
                  'Add'
                )}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        theme.background.default,
    },

    contentContainer: {
      paddingTop: 10,
      paddingBottom: 32,
    },

    pickerWrapper: {
      flex: 1,
      paddingHorizontal: 4,
    },

    checklistNameInput: {
      marginBottom: 0,
      marginTop: 30,
      backgroundColor:
        theme.input.background,
      fontSize: 14,
    },

    roomBlock: {
      borderWidth: 1,
      borderColor:
        theme.card.border ||
        theme.border.default,
      borderRadius: 14,
      padding: 12,
      marginBottom: 18,
      backgroundColor:
        theme.card.background ||
        theme.surface.default,
    },

    roomHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
    },

    roomTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    roomType: {
      fontSize: 16,
      fontWeight: '600',
      color:
        theme.text.primary,
      marginLeft: 8,
    },

    noteButton: {
      padding: 6,
      borderRadius: 10,
      backgroundColor:
        withAlpha(
          theme.brand.primary,
          '12'
        ),
    },

    assignedText: {
      fontSize: 14,
      color:
        theme.brand.primary,
      marginTop: 8,
      fontStyle: 'italic',
    },

    notePreview: {
      fontStyle: 'italic',
      fontSize: 12,
      color:
        theme.text.muted,
      marginBottom: 6,
      lineHeight: 18,
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
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor:
        theme.divider,
    },

    dotRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor:
        theme.brand.primary,
      marginRight: 8,
    },

    taskLabel: {
      fontSize: 14,
      color:
        theme.text.primary,
      flex: 1,
      lineHeight: 20,
    },

    extraRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 2,
      gap: 8,
      flexWrap: 'nowrap',
    },

    extraPicker: {
      width: 140,
    },

    pickerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },

    infoIcon: {
      padding: 8,
      justifyContent:
        'center',
      alignItems: 'center',
      borderRadius: 12,
      backgroundColor:
        withAlpha(
          theme.brand.primary,
          '10'
        ),
    },

    loadingContainer: {
      padding: 20,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        theme.background.default,
    },

    loadingText: {
      marginTop: 8,
      color:
        theme.text.secondary,
    },

    icon: {
      marginRight: 8,
    },

    customPricingCard: {
      borderWidth: 1,
      borderColor:
        theme.card.border ||
        theme.border.default,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      backgroundColor:
        theme.card.background ||
        theme.surface.elevated,
    },

    customPricingHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 8,
    },

    customPricingTitle: {
      color:
        theme.text.primary,
      fontWeight: '600',
    },

    pricingRow: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor:
        theme.divider,
    },

    pricingLabel: {
      color:
        theme.text.secondary,
    },

    calculatedPriceValue: {
      fontSize: 17,
      fontWeight: '600',
      color:
        theme.text.secondary,
    },

    customPriceValue: {
      fontSize: 18,
      fontWeight: '700',
      color:
        theme.brand.primary,
    },

    setCustomPriceButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        theme.button
          .primaryBackground,
      paddingVertical: 13,
      borderRadius: 10,
      marginTop: 12,
      gap: 8,
    },

    resetPricingButton: {
      backgroundColor:
        theme.status.error,
    },

    setCustomPriceButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color:
        theme.button.primaryText,
    },

    customPricingNote: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        withAlpha(
          theme.status.info,
          '12'
        ),
      padding: 11,
      borderRadius: 10,
      gap: 7,
      marginTop: 10,
      borderWidth: 1,
      borderColor:
        withAlpha(
          theme.status.info,
          '20'
        ),
    },

    customPricingNoteText: {
      flex: 1,
      fontSize: 11,
      color:
        theme.text.secondary,
      lineHeight: 16,
    },

    teamFeeContainer: {
      marginBottom: 12,
      backgroundColor:
        theme.surface.sunken ||
        theme.background.sunken,
      borderRadius: 10,
      padding: 10,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    teamFeeRow: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor:
        theme.divider,
    },

    teamName: {
      fontSize: 14,
      fontWeight: '500',
      color:
        theme.text.primary,
    },

    teamFeeRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    teamFee: {
      fontSize: 15,
      fontWeight: '600',
      color:
        theme.text.primary,
    },

    teamTime: {
      fontSize: 12,
      color:
        theme.text.muted,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor:
        theme.overlay ||
        'rgba(0,0,0,0.5)',
      justifyContent:
        'center',
      padding: 20,
    },

    modalContent: {
      backgroundColor:
        theme.surface.elevated ||
        theme.surface.default,
      borderRadius: 18,
      padding: 20,
      borderWidth: 1,
      borderColor:
        theme.border.default,
      maxHeight: '90%',
    },

    modalTitle: {
      fontSize: 19,
      fontWeight: '700',
      color:
        theme.text.primary,
      marginBottom: 8,
    },

    modalSubtitle: {
      fontSize: 14,
      color:
        theme.text.secondary,
      marginBottom: 16,
      lineHeight: 20,
    },

    modalInput: {
      marginBottom: 16,
      backgroundColor:
        theme.input.background,
    },

    modalButton: {
      marginBottom: 10,
      borderRadius: 10,
    },

    modalCancelButton: {
      marginBottom: 0,
      borderRadius: 10,
      borderColor:
        theme.border.default,
    },

    modalButtons: {
      flexDirection: 'row',
      justifyContent:
        'flex-end',
      alignItems: 'center',
      gap: 10,
      marginTop: 4,
    },

    calculatedTotalContainer: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      marginBottom: 16,
      padding: 13,
      backgroundColor:
        theme.surface.sunken ||
        theme.background.sunken,
      borderRadius: 10,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    calculatedTotalLabel: {
      fontSize: 14,
      color:
        theme.text.secondary,
    },

    calculatedTotalValue: {
      fontSize: 17,
      fontWeight: '700',
      color:
        theme.text.primary,
    },

    multiplierContainer: {
      marginBottom: 16,
      padding: 12,
      backgroundColor:
        theme.surface.sunken ||
        theme.background.sunken,
      borderRadius: 10,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    multiplierLabel: {
      fontSize: 12,
      color:
        theme.text.secondary,
      marginBottom: 8,
      textAlign: 'center',
    },

    multiplierRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 16,
    },

    multiplierButton: {
      backgroundColor:
        withAlpha(
          theme.brand.primary,
          '18'
        ),
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        withAlpha(
          theme.brand.primary,
          '25'
        ),
    },

    multiplierButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color:
        theme.brand.primary,
    },

    multiplierValue: {
      fontSize: 17,
      fontWeight: '700',
      color:
        theme.text.primary,
      minWidth: 60,
      textAlign: 'center',
    },

    priceLimits: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      marginBottom: 16,
      paddingHorizontal: 4,
      gap: 8,
    },

    priceLimitText: {
      fontSize: 10,
      color:
        theme.text.muted,
      flexShrink: 1,
    },

    hideableSection: {
      overflow: 'hidden',
    },

    collapsed: {
      height: 0,
      opacity: 0,
    },

    // Retained styles for the existing/possible
    // consumption UI.
    modernCard: {
      backgroundColor:
        theme.surface.elevated ||
        theme.surface.default,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    cardHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },

    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color:
        theme.text.primary,
      marginLeft: 10,
    },

    cardSubtitle: {
      fontSize: 14,
      color:
        theme.text.secondary,
      lineHeight: 20,
      marginBottom: 20,
    },

    roomSection: {
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor:
        theme.divider,
      paddingBottom: 16,
    },

    roomSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },

    roomSectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color:
        theme.text.primary,
      flex: 1,
      marginLeft: 8,
    },

    addSupplyChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        withAlpha(
          theme.brand.primary,
          '12'
        ),
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },

    addSupplyChipText: {
      fontSize: 12,
      fontWeight: '500',
      color:
        theme.brand.primary,
      marginLeft: 4,
    },

    supplyChipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },

    supplyChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        theme.surface.sunken ||
        theme.background.sunken,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        theme.border.default,
      gap: 6,
    },

    supplyChipText: {
      fontSize: 13,
      color:
        theme.text.primary,
    },

    emptySupplyState: {
      alignItems: 'center',
      paddingVertical: 16,
      backgroundColor:
        theme.surface.sunken ||
        theme.background.sunken,
      borderRadius: 12,
    },

    emptySupplyText: {
      fontSize: 14,
      color:
        theme.text.muted,
      marginTop: 4,
    },

    emptySupplySubtext: {
      fontSize: 12,
      color:
        theme.text.disabled,
    },

    mappingSection: {
      marginTop: 12,
    },

    mappingSectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
      color:
        theme.text.primary,
    },

    mappingRow: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      marginBottom: 8,
      paddingVertical: 4,
    },

    mappingTaskLabel: {
      fontSize: 14,
      color:
        theme.text.secondary,
      flex: 1,
    },

    mappingActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },

    addMappingButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        withAlpha(
          theme.brand.primary,
          '12'
        ),
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 16,
    },

    addMappingText: {
      fontSize: 12,
      color:
        theme.brand.primary,
      marginLeft: 4,
    },

    mappedItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        theme.surface.sunken ||
        theme.background.sunken,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 16,
      gap: 4,
    },

    mappedText: {
      fontSize: 12,
      color:
        theme.text.primary,
    },
  });

export default RoomAssignmentPicker;