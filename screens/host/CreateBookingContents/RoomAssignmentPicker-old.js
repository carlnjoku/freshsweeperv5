import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Alert } from 'react-native';
import FloatingLabelPickerSelect from '../../../components/shared/FloatingLabelPicker';
import { checklist } from '../../../utils/tasks_photo';
import { Checkbox, TextInput, Button } from 'react-native-paper';
import COLORS from '../../../constants/colors';
import CustomCard from '../../../components/shared/CustomCard';
import { MaterialCommunityIcons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { tSafe } from '../../../utils/tSafe';

const ratePerMinute = 0.8;
const MINIMUM_TOTAL = 50;
const MAXIMUM_TOTAL = 2000;
const MIN_RATIO = 0.5;
const MAX_RATIO = 2.0;

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
  
  const [customPricingModalVisible, setCustomPricingModalVisible] = useState(false);
  const [customTotalFee, setCustomTotalFee] = useState('');
  const [useCustomPricing, setUseCustomPricing] = useState(false);
  const [calculatedTotalFee, setCalculatedTotalFee] = useState(0);
  const [showCustomPricingCard, setShowCustomPricingCard] = useState(false);
  const [priceMultiplier, setPriceMultiplier] = useState(100);
  
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const prevGroupSummaryRef = useRef({});
  const prevExistingDataRef = useRef(null);
  const initializationAttempted = useRef(false);

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

  useEffect(() => {
    if (!hasInitialized && !initializationAttempted.current) {
      initializationAttempted.current = true;
      
      if (isEditing && existingChecklistData) {
        console.log('INITIALIZING EDIT MODE WITH EXISTING DATA:', existingChecklistData);
        
        try {
          let parsedRoomAssignments = {};
          let parsedExtraAssignments = {};
          let parsedRoomNotes = {};
          let groupCount = 0;
          
          if (typeof existingChecklistData === 'object' && existingChecklistData !== null) {
            const groupKeys = Object.keys(existingChecklistData);
            
            const isGroupStructure = groupKeys.some(key => 
              key.startsWith('group_') || 
              key === 'a' || key === 'b' || key === 'c' || key === 'd'
            );
            
            if (isGroupStructure) {
              console.log('Detected group structure, parsing...');
              groupCount = groupKeys.length;
              
              groupKeys.forEach(groupId => {
                const group = existingChecklistData[groupId];
                
                if (Array.isArray(group.rooms)) {
                  group.rooms.forEach(roomId => {
                    parsedRoomAssignments[roomId] = groupId;
                  });
                }
                
                if (group.details) {
                  Object.entries(group.details).forEach(([key, detail]) => {
                    if (key !== 'Extra' && detail.notes && detail.notes.text) {
                      parsedRoomNotes[key] = detail.notes.text;
                    }
                  });
                }
                
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
                
                if (Array.isArray(group.extras)) {
                  group.extras.forEach(extraLabel => {
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

  // Reset everything when switching back to 1 cleaner
  useEffect(() => {
    if (!hasInitialized) return;
    
    if (expectedCleaners === 1) {
      console.log('Switching to single cleaner mode - resetting all assignments and pricing');
      
      // Reset all room assignments to group_a
      const newRoomAssignments = {};
      rooms.forEach(room => {
        newRoomAssignments[room.id] = 'group_a';
      });
      setRoomAssignments(newRoomAssignments);
      
      // Reset all extra task assignments to group_a
      const newExtraAssignments = {};
      Object.entries(extraAssignments).forEach(([taskId, task]) => {
        if (task.selected) {
          newExtraAssignments[taskId] = {
            ...task,
            group: 'group_a'
          };
        }
      });
      setExtraAssignments(newExtraAssignments);
      
      // Reset custom pricing to calculated pricing
      if (useCustomPricing) {
        setUseCustomPricing(false);
        setCustomTotalFee('');
        setPriceMultiplier(100);
        
        // Reset group summary prices to calculated prices
        const summaryCopy = JSON.parse(JSON.stringify(groupSummary));
        Object.keys(summaryCopy).forEach((groupId) => {
          if (summaryCopy[groupId].calculatedPrice !== undefined) {
            summaryCopy[groupId].price = summaryCopy[groupId].calculatedPrice;
          }
        });
        
        // Update parent with reset pricing
        const totalFee = Object.values(summaryCopy).reduce((sum, group) => sum + (group.price || 0), 0);
        const totalTime = Object.values(summaryCopy).reduce((sum, group) => sum + (group.totalTime || 0), 0);
        
        setGroupSummary(summaryCopy);
        if (onTotalFeeChange) onTotalFeeChange(Number(totalFee.toFixed(2)));
        if (onTotalTimeChange) onTotalTimeChange(Number(totalTime.toFixed(1)));
        
        const currentStr = JSON.stringify(summaryCopy);
        const prevStr = JSON.stringify(prevGroupSummaryRef.current);
        if (currentStr !== prevStr) {
          prevGroupSummaryRef.current = summaryCopy;
          if (onGroupSummaryChange) onGroupSummaryChange(summaryCopy);
        }
      }
    }
  }, [expectedCleaners, hasInitialized, rooms]);

  // Handle switching from 1 to multiple cleaners
  useEffect(() => {
    if (!hasInitialized) return;
    if (expectedCleaners <= 1) return;
    
    console.log('Switching to multiple cleaners mode - ensuring assignments are valid');
    
    const existingGroups = new Set(Object.values(roomAssignments));
    const availableGroups = Array.from({ length: expectedCleaners }, (_, i) => `group_${String.fromCharCode(97 + i)}`);
    
    const needsRedistribution = Array.from(existingGroups).some(group => !availableGroups.includes(group));
    
    if (needsRedistribution && rooms.length > 0 && Object.keys(roomAssignments).length > 0) {
      console.log('Redistributing rooms evenly among available groups');
      
      const newRoomAssignments = { ...roomAssignments };
      const roomsList = Object.keys(roomAssignments);
      
      roomsList.forEach((roomId, index) => {
        const groupIndex = index % availableGroups.length;
        newRoomAssignments[roomId] = availableGroups[groupIndex];
      });
      
      setRoomAssignments(newRoomAssignments);
    }
  }, [expectedCleaners, hasInitialized, rooms, roomAssignments]);

  // Initial assignment for single cleaner
  useEffect(() => {
    if (hasInitialized && expectedCleaners === 1 && rooms.length > 0) {
      if (Object.keys(roomAssignments).length === 0) {
        const newAssignments = {};
        rooms.forEach(room => {
          newAssignments[room.id] = 'group_a';
        });
        setRoomAssignments(newAssignments);
      }
    }
  }, [expectedCleaners, rooms, hasInitialized]);

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
          calculatedPrice: 0,
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
            calculatedPrice: 0,
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

    Object.keys(summary).forEach((groupId) => {
      const calculatedPrice = parseFloat((summary[groupId].totalTime * ratePerMinute).toFixed(2));
      summary[groupId].calculatedPrice = calculatedPrice;
      summary[groupId].price = calculatedPrice;
    });

    console.log('Calculated summary:', summary);
    setGroupSummary(summary);

    const totalFee = Object.values(summary).reduce((sum, group) => sum + (group.price || 0), 0);
    const totalTime = Object.values(summary).reduce((sum, group) => sum + (group.totalTime || 0), 0);
    
    setCalculatedTotalFee(Number(totalFee.toFixed(2)));
    
    if (useCustomPricing && customTotalFee) {
      applyCustomPricing(parseFloat(customTotalFee));
    } else {
      if (onTotalFeeChange) onTotalFeeChange(Number(totalFee.toFixed(2)));
      if (onTotalTimeChange) onTotalTimeChange(Number(totalTime.toFixed(1)));
      
      const currentStr = JSON.stringify(summary);
      const prevStr = JSON.stringify(prevGroupSummaryRef.current);
      if (currentStr !== prevStr) {
        prevGroupSummaryRef.current = summary;
        if (onGroupSummaryChange) {
          console.log('Notifying parent of group summary change');
          onGroupSummaryChange(summary);
        }
      }
    }
  }, [roomAssignments, rooms, extraAssignments, roomNotes, hasInitialized]);

  const applyCustomPricing = (customTotal) => {
    const summaryCopy = JSON.parse(JSON.stringify(groupSummary));
    const groups = Object.values(summaryCopy);
    const totalCalculated = groups.reduce((sum, group) => sum + group.calculatedPrice, 0);
    
    if (totalCalculated === 0) return;
    
    let appliedTotal = 0;
    
    Object.keys(summaryCopy).forEach((groupId) => {
      const group = summaryCopy[groupId];
      const ratio = group.calculatedPrice / totalCalculated;
      const proportionalPrice = customTotal * ratio;
      group.price = Number(proportionalPrice.toFixed(2));
      appliedTotal += group.price;
    });
    
    const roundingDiff = customTotal - appliedTotal;
    if (Math.abs(roundingDiff) > 0.01) {
      const groupsArray = Object.keys(summaryCopy);
      if (groupsArray.length > 0) {
        summaryCopy[groupsArray[0]].price += roundingDiff;
      }
    }
    
    setGroupSummary(summaryCopy);
    
    if (onTotalFeeChange) onTotalFeeChange(customTotal);
    if (onTotalTimeChange) onTotalTimeChange(Object.values(summaryCopy).reduce((sum, g) => sum + g.totalTime, 0));
    
    const currentStr = JSON.stringify(summaryCopy);
    const prevStr = JSON.stringify(prevGroupSummaryRef.current);
    if (currentStr !== prevStr) {
      prevGroupSummaryRef.current = summaryCopy;
      if (onGroupSummaryChange) {
        console.log('Notifying parent of custom pricing update');
        onGroupSummaryChange(summaryCopy);
      }
    }
  };

  const validateCustomPrice = (customTotal) => {
    if (isNaN(customTotal) || customTotal <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive amount.');
      return false;
    }
    
    if (customTotal < MINIMUM_TOTAL) {
      Alert.alert(
        'Minimum Amount', 
        `Custom total must be at least $${MINIMUM_TOTAL}. The calculated total is $${calculatedTotalFee.toFixed(2)}.`,
        [{ text: 'OK' }]
      );
      return false;
    }
    
    if (customTotal > MAXIMUM_TOTAL) {
      Alert.alert(
        'Maximum Amount', 
        `Custom total cannot exceed $${MAXIMUM_TOTAL}. The calculated total is $${calculatedTotalFee.toFixed(2)}.`,
        [{ text: 'OK' }]
      );
      return false;
    }
    
    if (customTotal < calculatedTotalFee * MIN_RATIO) {
      Alert.alert(
        'Price Significantly Lower',
        `Custom price ($${customTotal.toFixed(2)}) is significantly lower than calculated price ($${calculatedTotalFee.toFixed(2)}).\n\nThis means cleaners will earn ${((1 - customTotal / calculatedTotalFee) * 100).toFixed(0)}% less than the standard rate.\n\nAre you sure you want to proceed?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Continue', 
            onPress: () => {
              setUseCustomPricing(true);
              setCustomPricingModalVisible(false);
              applyCustomPricing(customTotal);
            },
            style: 'destructive'
          }
        ]
      );
      return false;
    }
    
    if (customTotal > calculatedTotalFee * MAX_RATIO) {
      Alert.alert(
        'Price Significantly Higher',
        `Custom price ($${customTotal.toFixed(2)}) is significantly higher than calculated price ($${calculatedTotalFee.toFixed(2)}).\n\nThis means cleaners will earn ${((customTotal / calculatedTotalFee - 1) * 100).toFixed(0)}% more than the standard rate.\n\nAre you sure you want to proceed?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Continue', 
            onPress: () => {
              setUseCustomPricing(true);
              setCustomPricingModalVisible(false);
              applyCustomPricing(customTotal);
            }
          }
        ]
      );
      return false;
    }
    
    return true;
  };

  const handleCustomPricingSave = () => {
    const customTotal = parseFloat(customTotalFee);
    
    if (validateCustomPrice(customTotal)) {
      setUseCustomPricing(true);
      setCustomPricingModalVisible(false);
      applyCustomPricing(customTotal);
    }
  };

  const handleMultiplierChange = (multiplier) => {
    setPriceMultiplier(multiplier);
    const adjustedTotal = (calculatedTotalFee * multiplier) / 100;
    setCustomTotalFee(adjustedTotal.toFixed(2));
  };

  const handleResetPricing = () => {
    Alert.alert(
      'Reset Pricing',
      'Are you sure you want to reset to the calculated pricing? This will remove your custom pricing.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          onPress: () => {
            setUseCustomPricing(false);
            setCustomTotalFee('');
            setPriceMultiplier(100);
            
            const summaryCopy = JSON.parse(JSON.stringify(groupSummary));
            Object.keys(summaryCopy).forEach((groupId) => {
              summaryCopy[groupId].price = summaryCopy[groupId].calculatedPrice;
            });
            
            const totalFee = Object.values(summaryCopy).reduce((sum, group) => sum + (group.price || 0), 0);
            const totalTime = Object.values(summaryCopy).reduce((sum, group) => sum + (group.totalTime || 0), 0);
            
            setGroupSummary(summaryCopy);
            if (onTotalFeeChange) onTotalFeeChange(Number(totalFee.toFixed(2)));
            if (onTotalTimeChange) onTotalTimeChange(Number(totalTime.toFixed(1)));
            
            const currentStr = JSON.stringify(summaryCopy);
            const prevStr = JSON.stringify(prevGroupSummaryRef.current);
            if (currentStr !== prevStr) {
              prevGroupSummaryRef.current = summaryCopy;
              if (onGroupSummaryChange) onGroupSummaryChange(summaryCopy);
            }
          }
        }
      ]
    );
  };

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

  const taskGroups = Array.from({ length: expectedCleaners }, (_, i) => {
    const groupLetter = String.fromCharCode(65 + i); // A, B, C, D...
    const groupId = `group_${String.fromCharCode(97 + i)}`; // group_a, group_b, etc.
    return {
      groupId,
      label: `${tSafe('team', 'TEAM')} ${groupLetter}`, // "TEAM A", "TEAM B", etc.
      value: groupId,
    };
  });

  if (!hasInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>{tSafe('loading_checklist_data', 'Loading checklist data...')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.pickerWrapper}>
        <View style={{ marginBottom: 0 }}>
          <TextInput
            mode="outlined"
            label={tSafe('checklist_name', 'Checklist Name')}
            placeholder={tSafe('checklist_name_placeholder', 'e.g., Mid-July Deep Clean')}
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
              label={tSafe('expected_cleaners', 'Expected Cleaners')}
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
            <Text style={styles.roomType}>{tSafe('no_rooms_found', 'No rooms found')}</Text>
            <Text style={styles.notePreview}>
              {tSafe('no_rooms_configured', 'This property doesn\'t have any rooms configured.')}
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
                <Text style={styles.notePreview}>
                  {tSafe('note_prefix', 'Note:')} {roomNotes[room.id].slice(0, 40)}...
                </Text>
              ) : null}
              
              {expectedCleaners > 1 ? (
                <FloatingLabelPickerSelect
                  label={tSafe('assign_to', 'Assign to')}
                  value={roomAssignments[room.id] || null}
                  onValueChange={(groupId) => handleAssignmentChange(room.id, groupId)}
                  items={taskGroups}
                />
              ) : (
                <Text style={styles.assignedText}>
                  {tSafe('assigned_to_team_a', 'Assigned to TEAM A')}
                </Text>
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
          <Text style={styles.roomType}>{tSafe('extra_tasks', 'Extra Tasks')}</Text>
          {checklist.Extra.tasks.map((task) => {
            const isSelected = extraAssignments[task.id]?.selected;
            const assignedGroup = extraAssignments[task.id]?.group;
            
            return (
              <View key={task.id} style={styles.extraRow}>
                <Checkbox.Android
                  status={isSelected ? 'checked' : 'unchecked'}
                  onPress={() => {
                    if (expectedCleaners === 1) {
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
                      toggleExtraTask(task);
                    }
                  }}
                  color={COLORS.primary_light}
                />
                <Text style={[styles.taskLabel, { flex: 1 }]}>{task.label}</Text>
                  
                {expectedCleaners > 1 && (
                  <View style={{ width: 140 }}>
                    <FloatingLabelPickerSelect
                      label={tSafe('assign_to', 'Assign to')}
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
              <Text style={styles.summaryTitle}>{tSafe('summary', 'Summary')}</Text>
              <Text style={styles.totalTime}>
                {Object.values(groupSummary).reduce((sum, group) => sum + group.totalTime, 0).toFixed(1)} {tSafe('minutes_abbr', 'min')}
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
                    <Text style={styles.groupName}>
                      {tSafe('team', 'TEAM')} {groupId.replace('group_', '').toUpperCase()}
                    </Text>
                    <Text style={styles.groupPrice}>${data.price.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.groupDetails}>
                    <Text style={styles.detailText}>
                      {data.totalTime.toFixed(1)} {tSafe('minutes_abbr', 'min')} • {roomSummary}
                    </Text>
                    {data.extras.length > 0 && (
                      <Text style={styles.extrasText}>{data.extras.join(', ')}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Custom Pricing Section - Moved to Bottom */}
        <TouchableOpacity 
          style={styles.customPricingToggle}
          onPress={() => setShowCustomPricingCard(!showCustomPricingCard)}
        >
          <MaterialIcons 
            name={showCustomPricingCard ? "price-check" : "attach-money"} 
            size={24} 
            color={COLORS.primary} 
          />
          <Text style={styles.customPricingToggleText}>
            {showCustomPricingCard ? tSafe('hide_custom_pricing', 'Hide Custom Pricing') : tSafe('customize_pricing', 'Customize Pricing')}
          </Text>
          <MaterialIcons 
            name={showCustomPricingCard ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
            size={24} 
            color={COLORS.gray} 
          />
        </TouchableOpacity>

        {showCustomPricingCard && (
          <CustomCard style={styles.customPricingCard}>
            <View style={styles.customPricingHeader}>
              <MaterialIcons name="edit" size={22} color={COLORS.primary} />
              <Text style={styles.customPricingTitle}>{tSafe('custom_pricing_title', 'Set Your Own Price')}</Text>
            </View>
            
            <View style={styles.customPricingDescription}>
              <Text style={styles.customPricingDescriptionText}>
                {tSafe('custom_pricing_description', 'Want to offer a special rate or adjust the total price? Set your own custom amount and we\'ll automatically distribute it fairly among all cleaners based on their assigned tasks.')}
              </Text>
            </View>
            
            <View style={styles.pricingInfo}>
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>{tSafe('calculated_total', 'Calculated Total')}</Text>
                <Text style={styles.calculatedPriceValue}>${calculatedTotalFee.toFixed(2)}</Text>
              </View>
              
              {useCustomPricing ? (
                <>
                  <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabel}>{tSafe('custom_total', 'Your Custom Total')}</Text>
                    <Text style={styles.customPriceValue}>${parseFloat(customTotalFee || calculatedTotalFee).toFixed(2)}</Text>
                  </View>
                  <TouchableOpacity onPress={handleResetPricing} style={styles.resetButton}>
                    <Text style={styles.resetButtonText}>{tSafe('reset_to_calculated', 'Reset to Calculated Price')}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity 
                  style={styles.setCustomPriceButton}
                  onPress={() => {
                    setCustomTotalFee(calculatedTotalFee.toFixed(2));
                    setCustomPricingModalVisible(true);
                  }}
                >
                  <MaterialIcons name="edit" size={18} color="white" />
                  <Text style={styles.setCustomPriceButtonText}>{tSafe('set_custom_price', 'Set Custom Price')}</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.customPricingNote}>
              <MaterialIcons name="info-outline" size={14} color={COLORS.gray} />
              <Text style={styles.customPricingNoteText}>
                {tSafe('custom_pricing_note', 'Custom prices are distributed proportionally among cleaners. Each cleaner will receive a fair share based on their assigned workload.')}
              </Text>
            </View>
          </CustomCard>
        )}

        <Modal visible={customPricingModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{tSafe('custom_pricing', 'Custom Pricing')}</Text>
              <Text style={styles.modalSubtitle}>
                {tSafe('custom_pricing_modal_desc', 'Set a custom total amount for this cleaning job. The amount will be automatically split among cleaners based on their assigned tasks.')}
              </Text>
              
              <View style={styles.calculatedTotalContainer}>
                <Text style={styles.calculatedTotalLabel}>{tSafe('calculated_total', 'Calculated Total')}</Text>
                <Text style={styles.calculatedTotalValue}>${calculatedTotalFee.toFixed(2)}</Text>
              </View>
              
              <View style={styles.multiplierContainer}>
                <Text style={styles.multiplierLabel}>Quick adjust by percentage:</Text>
                <View style={styles.multiplierRow}>
                  <TouchableOpacity 
                    style={styles.multiplierButton}
                    onPress={() => handleMultiplierChange(Math.max(50, priceMultiplier - 5))}
                  >
                    <Text style={styles.multiplierButtonText}>-5%</Text>
                  </TouchableOpacity>
                  <Text style={styles.multiplierValue}>{priceMultiplier}%</Text>
                  <TouchableOpacity 
                    style={styles.multiplierButton}
                    onPress={() => handleMultiplierChange(Math.min(200, priceMultiplier + 5))}
                  >
                    <Text style={styles.multiplierButtonText}>+5%</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <TextInput
                mode="outlined"
                label={tSafe('custom_total_fee', 'Custom Total Fee ($)')}
                placeholder={`${calculatedTotalFee.toFixed(2)}`}
                value={customTotalFee}
                onChangeText={setCustomTotalFee}
                keyboardType="numeric"
                style={styles.modalInput}
              />
              
              <View style={styles.priceLimits}>
                <Text style={styles.priceLimitText}>Min: ${MINIMUM_TOTAL}</Text>
                <Text style={styles.priceLimitText}>Max: ${MAXIMUM_TOTAL}</Text>
                <Text style={styles.priceLimitText}>
                  Range: {MIN_RATIO * 100}% - {MAX_RATIO * 100}% of calculated
                </Text>
              </View>
              
              <Button 
                mode="contained" 
                onPress={handleCustomPricingSave} 
                style={styles.modalButton}
                buttonColor={COLORS.primary}
              >
                {tSafe('apply_custom_price', 'Apply Custom Price')}
              </Button>
              
              <Button 
                mode="outlined" 
                onPress={() => {
                  setCustomPricingModalVisible(false);
                  setCustomTotalFee('');
                }} 
                style={styles.modalCancelButton}
              >
                {tSafe('cancel', 'Cancel')}
              </Button>
            </View>
          </View>
        </Modal>

        {noteModalVisible && (
          <Modal visible={noteModalVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{tSafe('add_note', 'Add Note')}</Text>
                <TextInput
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  value={noteText}
                  onChangeText={setNoteText}
                  placeholder={tSafe('note_placeholder', 'Add your note for this room...')}
                  placeholderTextColor={COLORS.darkGray}
                  outlineColor="#CCC"
                  activeOutlineColor={COLORS.primary}
                  style={styles.modalInput}
                />
                <Button 
                  mode="contained" 
                  onPress={() => handleSaveNote(selectedRoomForNote, noteText)} 
                  style={styles.modalButton}
                  buttonColor={COLORS.primary}
                >
                  {tSafe('save_note', 'Save Note')}
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={() => setNoteModalVisible(false)} 
                  style={styles.modalCancelButton}
                >
                  {tSafe('cancel', 'Cancel')}
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
    marginBottom: 16,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  modalInput: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  modalButton: {
    marginBottom: 10,
  },
  modalCancelButton: {
    marginBottom: 0,
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
  // Custom Pricing Styles
  customPricingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginBottom: 16,
    backgroundColor: '#F8F9FC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8ECF0',
    gap: 8,
  },
  customPricingToggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  customPricingCard: {
    borderWidth: 1,
    borderColor: '#E8ECF0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  customPricingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  customPricingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1E2F',
  },
  customPricingDescription: {
    backgroundColor: '#F0F7FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  customPricingDescriptionText: {
    fontSize: 13,
    color: '#4A5568',
    lineHeight: 18,
  },
  pricingInfo: {
    marginBottom: 12,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pricingLabel: {
    fontSize: 14,
    color: '#666',
  },
  calculatedPriceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  customPriceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  setCustomPriceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  setCustomPriceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  customPricingNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9FC',
    padding: 10,
    borderRadius: 8,
    gap: 6,
    marginTop: 8,
  },
  customPricingNoteText: {
    flex: 1,
    fontSize: 11,
    color: '#888',
    lineHeight: 15,
  },
  calculatedTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  calculatedTotalLabel: {
    fontSize: 14,
    color: '#666',
  },
  calculatedTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  multiplierContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  multiplierLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  multiplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  multiplierButton: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  multiplierButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
  },
  multiplierValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 60,
    textAlign: 'center',
  },
  priceLimits: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  priceLimitText: {
    fontSize: 11,
    color: '#999',
  },
  resetButton: {
    marginTop: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 12,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
});

export default RoomAssignmentPicker;



