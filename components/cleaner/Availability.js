// import React, { useState } from 'react';
// import { View, Text, StyleSheet, Switch, StatusBar, TouchableOpacity, Dimensions } from 'react-native';
// // import DateTimePicker from '@react-native-community/datetimepicker';
// import DatePicker from 'react-native-date-picker';
// import COLORS from '../../constants/colors';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import availabilityRange from '../../utils/availabilityRange';
// import userService from '../../services/connection/userService';





// const AvailabilityComponent = ({userId, close_avail_modal, get_availability}) => {
//     // State to manage availability data
//     const [availability, setAvailability] = useState([
//         { day: 'Monday', isAvailable: true, startTime: new Date(), endTime: new Date() },
//         { day: 'Tuesday', isAvailable: true, startTime: new Date(), endTime: new Date() },
//         { day: 'Wednesday', isAvailable: true, startTime: new Date(), endTime: new Date() },
//         { day: 'Thursday', isAvailable: true, startTime: new Date(), endTime: new Date() },
//         { day: 'Friday', isAvailable: true, startTime: new Date(), endTime: new Date() },
//         { day: 'Saturday', isAvailable: true, startTime: new Date(), endTime: new Date() },
//         { day: 'Sunday', isAvailable: true, startTime: new Date(), endTime: new Date() },
//     ]);

//     // State variables to control the visibility of DateTimePickers
//     const [showStartTimePicker, setShowStartTimePicker] = useState(false);
//     const [showEndTimePicker, setShowEndTimePicker] = useState(false);
//     const [selectedDayIndex, setSelectedDayIndex] = useState(null);
//     const [timeType, setTimeType] = useState('');

//     // Function to handle availability changes
//     const handleAvailabilityChange = (index, value) => {
//         const updatedAvailability = [...availability];
//         updatedAvailability[index].isAvailable = value;
//         setAvailability(updatedAvailability);
//     };

//     // Function to handle time changes
//     const handleTimeChange = (event, selectedDate) => {
//         if (selectedDate) {
//             const updatedAvailability = [...availability];
//             if (timeType === 'startTime') {
//                 updatedAvailability[selectedDayIndex].startTime = selectedDate;
//             } else if (timeType === 'endTime') {
//                 updatedAvailability[selectedDayIndex].endTime = selectedDate;
//             }
//             setAvailability(updatedAvailability);
//             console.log("___________")
//             // console.log(updatedAvailability)
//             console.log("__________")
//             get_availability(updatedAvailability)
//         }
//         // Close the DateTimePicker
//         setShowStartTimePicker(false);
//         setShowEndTimePicker(false);
//     };

//     // Function to open the DateTimePicker for the selected day and time type
//     const openTimePicker = (index, type) => {
//         setSelectedDayIndex(index);
//         setTimeType(type);
//         if (type === 'startTime') {
//             setShowStartTimePicker(true);
//         } else if (type === 'endTime') {
//             setShowEndTimePicker(true);
//         }
//     };
   
//     const onSubmit = async() => {
//        const data = {
//         userId:userId,
//         availability:availabilityRange(availability)
//        }
//        console.log(data)
//        await userService.updateAvailability(data)
//         .then(response => {
//             const res = response.data.message
//             console.log(res)
//             get_availability(availability)
//             close_avail_modal(false)
//         })
//     }
    
//     const onClose = () => {
//         close_avail_modal(false)
//         get_availability(availability)
//     }

//     return (
//         <View style={styles.modalContainer}>
//         <View style={styles.modalContent}>
//          <StatusBar translucent backgroundColor="transparent" />

//         <View style={styles.close_button}><MaterialCommunityIcons name="close" color={COLORS.gray} size={24} onPress={onClose} /></View>
//         <Text style={styles.heading}>Update Availability</Text>
       
//         <View style={styles.container}>
//             {availability.map((item, index) => (
//                 <View key={index} style={styles.availabilityItem}>
//                     <Text style={styles.day}>{item.day}:</Text>
//                     <Switch
//                         value={item.isAvailable}
//                         onValueChange={(value) => handleAvailabilityChange(index, value)}
//                     />
//                     {item.isAvailable && (
//                         <View style={styles.timeRangeContainer}>
//                             {/* Start Time Picker */}
//                             <TouchableOpacity onPress={() => openTimePicker(index, 'startTime')}>
//                                 <Text style={styles.timeText}>
//                                     {item.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                                 </Text>
//                             </TouchableOpacity>

//                             {/* End Time Picker */}
//                             <TouchableOpacity onPress={() => openTimePicker(index, 'endTime')}>
//                                 <Text style={styles.timeText}>
//                                     {item.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                                 </Text>
//                             </TouchableOpacity>

//                             {/* DateTimePicker for Start Time */}
//                             {showStartTimePicker && selectedDayIndex === index && timeType === 'startTime' && (
//                                 <DatePicker
//                                     value={item.startTime}
//                                     mode="time"
//                                     display="spinner"
//                                     onChange={handleTimeChange}
//                                 />
//                             )}

//                             {/* DateTimePicker for End Time */}
//                             {showEndTimePicker && selectedDayIndex === index && timeType === 'endTime' && (
//                                 <DatePicker
//                                     value={item.endTime}
//                                     mode="time"
//                                     display="spinner"
//                                     onChange={handleTimeChange}
//                                 />
//                             )}
//                         </View>
//                     )}
//                 </View>
//             ))}

//             <TouchableOpacity style={styles.button} onPress={onSubmit}>
//                 <Text style={styles.button_text}>Continue</Text>
//             </TouchableOpacity>
//         </View>
      
          
//         </View>
//     </View>

        
//     );
// };

// const windowHeight = Dimensions.get('window').height;
// const modalHeight = windowHeight * 0.65;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor:COLORS.backgroundColor,
//         padding:20,
//         // justifyContent: 'center',
//         alignItems: 'center',
//       },
//       heading: {
//           fontSize: 20,
//           fontWeight: 'bold',
//           marginBottom: 20,
//         },
//         detailsContainer: {
//           marginBottom: 20,
//         },
//         label: {
//           fontSize: 18,
//           fontWeight: 'bold',
//           marginBottom: 5,
//         },
//         details: {
//           fontSize: 16,
//         },
//         button: {
//           flexDirection:'row',
//           paddingVertical: 12,
//           paddingHorizontal: 20,
//           marginVertical:20,
//           justifyContent:'center',
//           backgroundColor: COLORS.primary,
//           borderRadius:50
//         },
//         button_text:{
//           color:COLORS.white
//         },
//         modalContainer: {
//           flex: 1,
//           marginTop:30,
//           justifyContent: 'flex-end',
//           alignItems: 'center',
//           backgroundColor: 'rgba(0, 0, 0, 0.1)', // semi-transparent background
//         },
//         modalContent: {
//           backgroundColor: 'white',
//           padding: 20,
//           // borderRadius: 10,
//           borderTopRightRadius:10,
//           borderTopLeftRadius:10,
//           elevation: 5,
//           height: modalHeight, // Set the height of the modal
//           width: '100%',
//         },
//         close_button:{
         
//           alignItems:'flex-end'
//         },
//         availabilityItem: {
//             flexDirection: 'row',
//             alignItems: 'center',
//             marginBottom: 0,
//         },
//         day: {
//             flex: 1,
//             fontWeight: 'bold',
//         },
//         timeText: {
//             marginHorizontal: 8,
//             fontSize: 16,
//         },
//         timeRangeContainer: {
//             flexDirection: 'row',
//             alignItems: 'center',
//         },
// });

// export default AvailabilityComponent;



// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Alert,
//   SafeAreaView,
//   Platform,
//   ActivityIndicator
// } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import DatePicker from 'react-native-date-picker';
// import COLORS from '../../constants/colors';
// import userService from '../../services/connection/userService';
// import { format, parse } from 'date-fns';

// // Helper: safely convert any input to a Date object
// const toSafeDate = (dateValue, fallback = new Date()) => {
//   if (!dateValue) return fallback;
//   try {
//     const date = new Date(dateValue);
//     // Check if date is valid
//     if (isNaN(date.getTime())) return fallback;
//     return date;
//   } catch {
//     return fallback;
//   }
// };

// // Helper: format time as HH:mm
// const formatTime = (date) => {
//   if (!date) return '';
//   return format(date, 'HH:mm');
// };

// export default function Availability({ cleanerId, close_avail_modal, get_availability }) {
//   const [availability, setAvailability] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [selectedDay, setSelectedDay] = useState(null);
//   const [startTime, setStartTime] = useState(new Date());
//   const [endTime, setEndTime] = useState(new Date());
//   const [timePickerVisible, setTimePickerVisible] = useState({ visible: false, type: 'start' });

//   // Days of the week (adjust order as needed)
//   const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
//   useEffect(() => {
//     fetchAvailability();
//   }, []);

//   const fetchAvailability = async () => {
//     try {
//       const response = await userService.getCleanerAvailability(cleanerId);
//       const data = response.data.data;
//       // Ensure availability is an array and each slot's times are properly parsed
//       const formatted = (data?.availability || []).map((item) => ({
//         day: item.day,
//         slots: (item.slots || []).map((slot) => ({
//           start: toSafeDate(slot.start),
//           end: toSafeDate(slot.end),
//         })),
//       }));
//       setAvailability(formatted);
//     } catch (err) {
//       console.error('Error fetching availability:', err);
//       Alert.alert('Error', 'Failed to load availability');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddSlot = () => {
//     if (!selectedDay) {
//       Alert.alert('Select Day', 'Please select a day first');
//       return;
//     }
//     if (startTime >= endTime) {
//       Alert.alert('Invalid Time', 'End time must be after start time');
//       return;
//     }

//     setAvailability((prev) => {
//       const dayIndex = prev.findIndex((item) => item.day === selectedDay);
//       const newSlot = { start: startTime, end: endTime };
//       if (dayIndex >= 0) {
//         const updated = [...prev];
//         updated[dayIndex] = {
//           ...updated[dayIndex],
//           slots: [...updated[dayIndex].slots, newSlot],
//         };
//         return updated;
//       } else {
//         return [...prev, { day: selectedDay, slots: [newSlot] }];
//       }
//     });

//     // Reset times for next entry
//     setStartTime(new Date());
//     setEndTime(new Date());
//   };

//   const handleRemoveSlot = (day, index) => {
//     setAvailability((prev) => {
//       const dayIndex = prev.findIndex((item) => item.day === day);
//       if (dayIndex === -1) return prev;
//       const updated = [...prev];
//       updated[dayIndex].slots = updated[dayIndex].slots.filter((_, i) => i !== index);
//       if (updated[dayIndex].slots.length === 0) {
//         return prev.filter((_, i) => i !== dayIndex);
//       }
//       return updated;
//     });
//   };

// //   const handleSave = async () => {
// //     setSaving(true);
// //     try {
// //       // Convert back to API format (strings)
// //       const payload = {
// //         availability: availability.map((item) => ({
// //           day: item.day,
// //           slots: item.slots.map((slot) => ({
// //             start: formatTime(slot.start),
// //             end: formatTime(slot.end),
// //           })),
// //         })),
// //       };

// //       console.log("Payloads----PL", payload)
// //       await userService.updateCleanerAvailability(cleanerId, payload);
      
// //       get_availability(payload); // Pass back to parent
// //       Alert.alert('Success', 'Availability updated');
// //       close_avail_modal();
// //     } catch (err) {
// //       console.error('Error saving availability:', err);
// //       Alert.alert('Error', 'Failed to save availability');
// //     } finally {
// //       setSaving(false);
// //     }
// //   };

// const handleSave = async () => {
//     setSaving(true);
//     try {
//       // ✅ Ensure availability is an array
//       if (!Array.isArray(availability)) {
//         throw new Error('Availability data is not an array');
//       }
  
//       // Convert back to API format (strings)
//       const payload = {
//         availability: availability.map((item) => ({
//           day: item.day,
//           slots: item.slots.map((slot) => ({
//             start: formatTime(slot.start),
//             end: formatTime(slot.end),
//           })),
//         })),
//       };
  
//       console.log("Payloads----PL", payload)
//       await userService.updateCleanerAvailability(cleanerId, payload);
      
//       get_availability(payload); // Pass back to parent
//       Alert.alert('Success', 'Availability updated');
//       close_avail_modal();
//     } catch (err) {
//       console.error('Error saving availability:', err);
//       Alert.alert('Error', 'Failed to save availability: ' + err.message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={close_avail_modal}>
//           <MaterialCommunityIcons name="close" size={24} color={COLORS.gray} />
//         </TouchableOpacity>
//         <Text style={styles.title}>Set Availability</Text>
//         <TouchableOpacity onPress={handleSave} disabled={saving}>
//           {saving ? (
//             <ActivityIndicator size="small" color={COLORS.primary} />
//           ) : (
//             <Text style={styles.saveText}>Save</Text>
//           )}
//         </TouchableOpacity>
//       </View>

//       <ScrollView style={styles.content}>
//         {/* Day Selection */}
//         <Text style={styles.sectionTitle}>Select Day</Text>
//         <View style={styles.daysContainer}>
//           {days.map((day) => (
//             <TouchableOpacity
//               key={day}
//               style={[
//                 styles.dayButton,
//                 selectedDay === day && styles.dayButtonSelected,
//               ]}
//               onPress={() => setSelectedDay(day)}
//             >
//               <Text
//                 style={[
//                   styles.dayText,
//                   selectedDay === day && styles.dayTextSelected,
//                 ]}
//               >
//                 {day.slice(0, 3)}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         {/* Time Selection */}
//         {selectedDay && (
//           <>
//             <Text style={styles.sectionTitle}>Add Time Slot</Text>
//             <View style={styles.timeRow}>
//               <TouchableOpacity
//                 style={styles.timeButton}
//                 onPress={() => setTimePickerVisible({ visible: true, type: 'start' })}
//               >
//                 <Text style={styles.timeLabel}>Start</Text>
//                 <Text style={styles.timeValue}>{formatTime(startTime)}</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.timeButton}
//                 onPress={() => setTimePickerVisible({ visible: true, type: 'end' })}
//               >
//                 <Text style={styles.timeLabel}>End</Text>
//                 <Text style={styles.timeValue}>{formatTime(endTime)}</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.addButton} onPress={handleAddSlot}>
//                 <MaterialCommunityIcons name="plus" size={24} color={COLORS.white} />
//               </TouchableOpacity>
//             </View>
//           </>
//         )}

//         {/* Availability List */}
//         <Text style={styles.sectionTitle}>Your Availability</Text>
//         {availability.length === 0 ? (
//           <View style={styles.emptyContainer}>
//             <MaterialCommunityIcons
//               name="calendar-blank-outline"
//               size={48}
//               color={COLORS.gray}
//             />
//             <Text style={styles.emptyText}>No availability set yet.</Text>
//           </View>
//         ) : (
//           availability.map((item) => (
//             <View key={item.day} style={styles.daySection}>
//               <Text style={styles.dayHeader}>{item.day}</Text>
//               {item.slots.map((slot, index) => (
//                 <View key={index} style={styles.slotRow}>
//                   <Text style={styles.slotTime}>
//                     {formatTime(slot.start)} - {formatTime(slot.end)}
//                   </Text>
//                   <TouchableOpacity
//                     onPress={() => handleRemoveSlot(item.day, index)}
//                     hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//                   >
//                     <MaterialCommunityIcons
//                       name="close-circle-outline"
//                       size={20}
//                       color={COLORS.error}
//                     />
//                   </TouchableOpacity>
//                 </View>
//               ))}
//             </View>
//           ))
//         )}
//       </ScrollView>

//       {/* Time Picker Modal */}
//       <DatePicker
//         modal
//         open={timePickerVisible.visible}
//         date={timePickerVisible.type === 'start' ? startTime : endTime}
//         mode="time"
//         onConfirm={(date) => {
//           if (timePickerVisible.type === 'start') {
//             setStartTime(date);
//           } else {
//             setEndTime(date);
//           }
//           setTimePickerVisible({ ...timePickerVisible, visible: false });
//         }}
//         onCancel={() => setTimePickerVisible({ ...timePickerVisible, visible: false })}
//         title={timePickerVisible.type === 'start' ? 'Select Start Time' : 'Select End Time'}
//         confirmText="Done"
//         cancelText="Cancel"
//         locale="en"
//         minuteInterval={15}
//         is24hourSource="locale"
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333',
//   },
//   saveText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },
//   content: {
//     flex: 1,
//     padding: 16,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   daysContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginBottom: 16,
//   },
//   dayButton: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     backgroundColor: '#f0f0f0',
//     marginRight: 8,
//     marginBottom: 8,
//   },
//   dayButtonSelected: {
//     backgroundColor: COLORS.primary,
//   },
//   dayText: {
//     fontSize: 14,
//     color: '#666',
//   },
//   dayTextSelected: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   timeRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   timeButton: {
//     flex: 1,
//     paddingVertical: 12,
//     paddingHorizontal: 10,
//     backgroundColor: '#f9f9f9',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     marginRight: 8,
//   },
//   timeLabel: {
//     fontSize: 12,
//     color: '#999',
//     marginBottom: 2,
//   },
//   timeValue: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#333',
//   },
//   addButton: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   daySection: {
//     marginBottom: 16,
//     paddingBottom: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   dayHeader: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 8,
//   },
//   slotRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 6,
//     paddingHorizontal: 8,
//     backgroundColor: '#fafafa',
//     borderRadius: 6,
//     marginBottom: 4,
//   },
//   slotTime: {
//     fontSize: 14,
//     color: '#555',
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 40,
//   },
//   emptyText: {
//     marginTop: 12,
//     fontSize: 14,
//     color: COLORS.gray,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DatePicker from 'react-native-date-picker';
import COLORS from '../../constants/colors';
import userService from '../../services/connection/userService';
import { format } from 'date-fns';
import { tSafe } from '../../utils/tSafe'; // added import

// Helper: safely convert any input to a Date object
const toSafeDate = (dateValue, fallback = new Date()) => {
  if (!dateValue) return fallback;
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return fallback;
    return date;
  } catch {
    return fallback;
  }
};

// Helper: format time as HH:mm
const formatTime = (date) => {
  if (!date) return '';
  return format(date, 'HH:mm');
};

export default function Availability({ cleanerId, close_avail_modal, get_availability }) {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [timePickerVisible, setTimePickerVisible] = useState({ visible: false, type: 'start' });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await userService.getCleanerAvailability(cleanerId);
      const data = response.data.data;
      const rawAvailability = data?.availability || [];
      const formatted = rawAvailability.map((item) => ({
        day: item.day,
        slots: (item.slots || []).map((slot) => ({
          start: toSafeDate(slot.start),
          end: toSafeDate(slot.end),
        })),
      }));
      setAvailability(formatted);
    } catch (err) {
      console.error('Error fetching availability:', err);
      Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_load_availability', 'Failed to load availability'));
      setAvailability([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = () => {
    if (!selectedDay) {
      Alert.alert(tSafe('select_day_title', 'Select Day'), tSafe('please_select_day', 'Please select a day first'));
      return;
    }
    if (startTime >= endTime) {
      Alert.alert(tSafe('invalid_time_title', 'Invalid Time'), tSafe('end_time_after_start', 'End time must be after start time'));
      return;
    }

    setAvailability((prev) => {
      const dayIndex = prev.findIndex((item) => item.day === selectedDay);
      const newSlot = { start: startTime, end: endTime };
      if (dayIndex >= 0) {
        const updated = [...prev];
        updated[dayIndex] = {
          ...updated[dayIndex],
          slots: [...updated[dayIndex].slots, newSlot],
        };
        return updated;
      } else {
        return [...prev, { day: selectedDay, slots: [newSlot] }];
      }
    });

    // Reset times for next entry
    setStartTime(new Date());
    setEndTime(new Date());
  };

  const handleRemoveSlot = (day, index) => {
    setAvailability((prev) => {
      const dayIndex = prev.findIndex((item) => item.day === day);
      if (dayIndex === -1) return prev;
      const updated = [...prev];
      updated[dayIndex].slots = updated[dayIndex].slots.filter((_, i) => i !== index);
      if (updated[dayIndex].slots.length === 0) {
        return prev.filter((_, i) => i !== dayIndex);
      }
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!Array.isArray(availability)) {
        throw new Error(`Availability is not an array: ${typeof availability}`);
      }

      const payload = {
        availability: availability.map((item) => ({
          day: item.day,
          slots: item.slots.map((slot) => ({
            start: formatTime(slot.start),
            end: formatTime(slot.end),
          })),
        })),
      };

      await userService.updateCleanerAvailability(cleanerId, payload);
      get_availability(payload);
      Alert.alert(tSafe('success_title', 'Success'), tSafe('availability_updated', 'Availability updated'));
      close_avail_modal();
    } catch (err) {
      console.error('Error saving availability:', err);
      Alert.alert(tSafe('error_title', 'Error'), tSafe('failed_save_availability', 'Failed to save availability: ') + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Helper to get translated day name
  const getDayTranslation = (day) => {
    const dayKey = day.toLowerCase();
    switch (dayKey) {
      case 'monday': return tSafe('monday', 'Monday');
      case 'tuesday': return tSafe('tuesday', 'Tuesday');
      case 'wednesday': return tSafe('wednesday', 'Wednesday');
      case 'thursday': return tSafe('thursday', 'Thursday');
      case 'friday': return tSafe('friday', 'Friday');
      case 'saturday': return tSafe('saturday', 'Saturday');
      case 'sunday': return tSafe('sunday', 'Sunday');
      default: return day;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={close_avail_modal}>
          <MaterialCommunityIcons name="close" size={24} color={COLORS.gray} />
        </TouchableOpacity>
        <Text style={styles.title}>{tSafe('set_availability', 'Set Availability')}</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={styles.saveText}>{tSafe('save', 'Save')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Day Selection */}
        <Text style={styles.sectionTitle}>{tSafe('select_day', 'Select Day')}</Text>
        <View style={styles.daysContainer}>
          {days.map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                selectedDay === day && styles.dayButtonSelected,
              ]}
              onPress={() => setSelectedDay(day)}
            >
              <Text
                style={[
                  styles.dayText,
                  selectedDay === day && styles.dayTextSelected,
                ]}
              >
                {getDayTranslation(day).slice(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Time Selection */}
        {selectedDay && (
          <>
            <Text style={styles.sectionTitle}>{tSafe('add_time_slot', 'Add Time Slot')}</Text>
            <View style={styles.timeRow}>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setTimePickerVisible({ visible: true, type: 'start' })}
              >
                <Text style={styles.timeLabel}>{tSafe('start', 'Start')}</Text>
                <Text style={styles.timeValue}>{formatTime(startTime)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setTimePickerVisible({ visible: true, type: 'end' })}
              >
                <Text style={styles.timeLabel}>{tSafe('end', 'End')}</Text>
                <Text style={styles.timeValue}>{formatTime(endTime)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} onPress={handleAddSlot}>
                <MaterialCommunityIcons name="plus" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Availability List */}
        <Text style={styles.sectionTitle}>{tSafe('your_availability', 'Your Availability')}</Text>
        {availability.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="calendar-blank-outline"
              size={48}
              color={COLORS.gray}
            />
            <Text style={styles.emptyText}>{tSafe('no_availability_set', 'No availability set yet.')}</Text>
          </View>
        ) : (
          availability.map((item) => (
            <View key={item.day} style={styles.daySection}>
              <Text style={styles.dayHeader}>{getDayTranslation(item.day)}</Text>
              {item.slots.map((slot, index) => (
                <View key={index} style={styles.slotRow}>
                  <Text style={styles.slotTime}>
                    {formatTime(slot.start)} - {formatTime(slot.end)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveSlot(item.day, index)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialCommunityIcons
                      name="close-circle-outline"
                      size={20}
                      color={COLORS.error}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Time Picker Modal */}
      <DatePicker
        modal
        open={timePickerVisible.visible}
        date={timePickerVisible.type === 'start' ? startTime : endTime}
        mode="time"
        onConfirm={(date) => {
          if (timePickerVisible.type === 'start') {
            setStartTime(date);
          } else {
            setEndTime(date);
          }
          setTimePickerVisible({ ...timePickerVisible, visible: false });
        }}
        onCancel={() => setTimePickerVisible({ ...timePickerVisible, visible: false })}
        title={timePickerVisible.type === 'start' ? tSafe('select_start_time', 'Select Start Time') : tSafe('select_end_time', 'Select End Time')}
        confirmText={tSafe('done', 'Done')}
        cancelText={tSafe('cancel', 'Cancel')}
        locale="en"
        minuteInterval={15}
        is24hourSource="locale"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginTop: Platform.OS === 'ios' ? 0 : 30,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  dayButtonSelected: {
    backgroundColor: COLORS.primary,
  },
  dayText: {
    fontSize: 14,
    color: '#666',
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  timeLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  daySection: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dayHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#fafafa',
    borderRadius: 6,
    marginBottom: 4,
  },
  slotTime: {
    fontSize: 14,
    color: '#555',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});