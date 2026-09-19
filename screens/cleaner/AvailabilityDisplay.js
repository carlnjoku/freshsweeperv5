// import React from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import CardNoPrimary from '../../components/shared/CardNoPrimary';
// import CircleIconNoLabel from '../../components/shared/CirecleIconNoLabel';
// import EmptyPlaceholder from '../../components/shared/EmptyPlaceholder';
// import COLORS from '../../constants/colors';
// import CustomCalendar from '../../components/shared/CustomCalendar';
// import { tSafe } from '../../utils/tSafe'; // added import

// // Helper to format time from "HH:MM" to "h:mm AM/PM" – safe version
// const formatTime = (time) => {
//   if (!time || typeof time !== 'string') return '';
//   const parts = time.split(':');
//   if (parts.length < 2) return '';
//   const [hours, minutes] = parts;
//   const hour = parseInt(hours, 10);
//   if (isNaN(hour)) return '';
//   const ampm = hour >= 12 ? 'PM' : 'AM';
//   const hour12 = hour % 12 || 12;
//   return `${hour12}:${minutes} ${ampm}`;
// };

// const AvailabilityDisplay = ({ availability, handleOpenAvailability, mode }) => {
//   const hasAvailability = availability && availability.length > 0;

//   return (
//     <CardNoPrimary style={styles.card}>
//       <View style={styles.header}>
//         <View style={styles.titleContainer}>
//           <View style={styles.iconWrapper}>
//             <MaterialCommunityIcons
//               name="calendar-clock"
//               size={22}
//               color={COLORS.white}
//             />
//           </View>
//           <Text style={styles.title}>
//             {tSafe('availability', 'Availability')}
//           </Text>
//         </View>
//         {mode === 'edit' && (
//           <TouchableOpacity onPress={handleOpenAvailability} style={styles.editButton}>
//             <CircleIconNoLabel
//               onPress={handleOpenAvailability}
//               iconName="pencil"
//               buttonSize={36}
//               radiusSise={18}
//               iconSize={18}
//             />
//           </TouchableOpacity>
//         )}
//       </View>

//       <View style={styles.divider} />

//       <View style={styles.content}>
//         {!hasAvailability ? (
//           <EmptyPlaceholder
//             icon="calendar-blank-outline"
//             message={tSafe('no_availability_info', 'No availability information provided.')}
//           />
//         ) : (
//           <View style={styles.content}>
//             <ScrollView showsVerticalScrollIndicator={false}>
//               <CustomCalendar
//                 availability={availability?.availability || []}
//                 bookedSchedules={availability?.booked_schedules || []}
//               />
//             </ScrollView>
//           </View>
//         )}
//       </View>
//     </CardNoPrimary>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 20,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.08,
//     shadowRadius: 12,
//     elevation: 4,
//     borderWidth: 1,
//     borderColor: '#F0F0F5',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   titleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   iconWrapper: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1E1E2F',
//     letterSpacing: 0.3,
//   },
//   editButton: {
//     padding: 4,
//     backgroundColor: '#F8F9FC',
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#E6E9F0',
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#E6E9F0',
//     marginBottom: 16,
//   },
//   content: {
//     marginTop: 4,
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
//     paddingVertical: 4,
//     paddingHorizontal: 8,
//   },
//   slotTime: {
//     fontSize: 14,
//     color: '#555',
//   },
// });

// export default AvailabilityDisplay;



// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// import { tSafe } from '../../utils/tSafe';
// import { format } from 'date-fns';

// const AvailabilityDisplay = ({ availability, handleOpenAvailability }) => {
//   const hasAvailability = availability && availability.length > 0;

//   const renderDay = ({ item }) => {
//     const slots = item.slots || [];
//     return (
//       <View style={styles.dayItem}>
//         <Text style={styles.dayName}>{item.day}</Text>
//         <View style={styles.slotsContainer}>
//           {slots.map((slot, idx) => (
//             <Text key={idx} style={styles.slotText}>
//               {format(slot.start, 'h:mm a')} – {format(slot.end, 'h:mm a')}
//             </Text>
//           ))}
//           {slots.length === 0 && (
//             <Text style={[styles.slotText, { color: '#9CA3AF' }]}>
//               {tSafe('unavailable', 'Unavailable')}
//             </Text>
//           )}
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.card}>
//       <View style={styles.header}>
//         <View style={styles.titleContainer}>
//           <View style={[styles.iconContainer, { backgroundColor: '#F0F0F5' }]}>
//             <MaterialCommunityIcons name="clock-outline" size={20} color="#6B7280" />
//           </View>
//           <Text style={styles.title}>{tSafe('availability', 'Availability')}</Text>
//         </View>
//         <TouchableOpacity onPress={handleOpenAvailability} style={styles.editButton}>
//           <MaterialCommunityIcons name="pencil" size={20} color="#6B7280" />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.divider} />

//       {hasAvailability ? (
//         <FlatList
//           data={availability}
//           renderItem={renderDay}
//           keyExtractor={(item, index) => index.toString()}
//           scrollEnabled={false}
//           ItemSeparatorComponent={() => <View style={styles.separator} />}
//         />
//       ) : (
//         <View style={styles.emptyState}>
//           <MaterialCommunityIcons name="calendar-clock-outline" size={28} color="#D1D5DB" />
//           <Text style={styles.emptyText}>{tSafe('no_availability', 'No availability set yet')}</Text>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//     borderWidth: 1,
//     borderColor: '#F0F0F5',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   titleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   iconContainer: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1E1E2F',
//   },
//   editButton: {
//     padding: 6,
//     backgroundColor: '#F8F9FC',
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#E6E9F0',
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#E6E9F0',
//     marginBottom: 16,
//   },
//   dayItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   dayName: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#1E1E2F',
//     width: 100,
//   },
//   slotsContainer: {
//     flex: 1,
//     alignItems: 'flex-end',
//   },
//   slotText: {
//     fontSize: 14,
//     color: '#1E1E2F',
//     marginBottom: 2,
//   },
//   separator: {
//     height: 1,
//     backgroundColor: '#F5F5F8',
//   },
//   emptyState: {
//     alignItems: 'center',
//     paddingVertical: 16,
//   },
//   emptyText: {
//     marginTop: 8,
//     fontSize: 14,
//     color: '#9CA3AF',
//   },
// });

// export default AvailabilityDisplay;



// // components/cleaner/AvailabilityDisplay.js
// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// import { tSafe } from '../../utils/tSafe';

// // Helper to convert "HH:MM" to "h:mm AM/PM"
// const formatTimeString = (timeStr) => {
//   if (!timeStr) return '';
//   const [hours, minutes] = timeStr.split(':');
//   const h = parseInt(hours, 10);
//   const ampm = h >= 12 ? 'PM' : 'AM';
//   const h12 = h % 12 || 12;
//   return `${h12}:${minutes} ${ampm}`;
// };

// const AvailabilityDisplay = ({ availability, handleOpenAvailability }) => {
//   const hasAvailability = availability && availability.length > 0;

//   const renderDay = ({ item }) => {
//     const slots = item.slots || [];
//     return (
//       <View style={styles.dayItem}>
//         <Text style={styles.dayName}>{item.day}</Text>
//         <View style={styles.slotsContainer}>
//           {slots.length > 0 ? (
//             slots.map((slot, idx) => (
//               <Text key={idx} style={styles.slotText}>
//                 {formatTimeString(slot.start)} – {formatTimeString(slot.end)}
//               </Text>
//             ))
//           ) : (
//             <Text style={[styles.slotText, { color: '#9CA3AF' }]}>
//               {tSafe('unavailable', 'Unavailable')}
//             </Text>
//           )}
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.card}>
//       <View style={styles.header}>
//         <View style={styles.titleContainer}>
//           <View style={[styles.iconContainer, { backgroundColor: '#F0F0F5' }]}>
//             <MaterialCommunityIcons name="clock-outline" size={20} color="#6B7280" />
//           </View>
//           <Text style={styles.title}>{tSafe('availability', 'Availability')}</Text>
//         </View>
//         <TouchableOpacity onPress={handleOpenAvailability} style={styles.editButton}>
//           <MaterialCommunityIcons name="pencil" size={20} color="#6B7280" />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.divider} />

//       {hasAvailability ? (
//         <FlatList
//           data={availability}
//           renderItem={renderDay}
//           keyExtractor={(item, index) => index.toString()}
//           scrollEnabled={false}
//           ItemSeparatorComponent={() => <View style={styles.separator} />}
//         />
//       ) : (
//         <View style={styles.emptyState}>
//           <MaterialCommunityIcons name="calendar-clock-outline" size={28} color="#D1D5DB" />
//           <Text style={styles.emptyText}>{tSafe('no_availability', 'No availability set yet')}</Text>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//     borderWidth: 1,
//     borderColor: '#F0F0F5',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   titleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   iconContainer: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1E1E2F',
//   },
//   editButton: {
//     padding: 6,
//     backgroundColor: '#F8F9FC',
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#E6E9F0',
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#E6E9F0',
//     marginBottom: 16,
//   },
//   dayItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   dayName: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#1E1E2F',
//     width: 100,
//   },
//   slotsContainer: {
//     flex: 1,
//     alignItems: 'flex-end',
//   },
//   slotText: {
//     fontSize: 14,
//     color: '#1E1E2F',
//     marginBottom: 2,
//   },
//   separator: {
//     height: 1,
//     backgroundColor: '#F5F5F8',
//   },
//   emptyState: {
//     alignItems: 'center',
//     paddingVertical: 16,
//   },
//   emptyText: {
//     marginTop: 8,
//     fontSize: 14,
//     color: '#9CA3AF',
//   },
// });

// export default AvailabilityDisplay;


// components/cleaner/AvailabilityDisplay.js
// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// import { tSafe } from '../../utils/tSafe';

// // Helper to convert "HH:MM" to "h:mm AM/PM"
// const formatTimeString = (timeStr) => {
//   if (!timeStr) return '';
//   const [hours, minutes] = timeStr.split(':');
//   const h = parseInt(hours, 10);
//   const ampm = h >= 12 ? 'PM' : 'AM';
//   const h12 = h % 12 || 12;
//   return `${h12}:${minutes} ${ampm}`;
// };

// // Order for days
// const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// const AvailabilityDisplay = ({ availability, handleOpenAvailability }) => {
//   // Build a map for fast lookup
//   const availabilityMap = {};
//   availability.forEach(item => {
//     availabilityMap[item.day] = item;
//   });

//   // Create a full week array – missing days get empty slots
//   const displayData = DAYS_ORDER.map(day => ({
//     day,
//     slots: availabilityMap[day]?.slots || [],
//   }));

//   const renderDay = ({ item }) => {
//     const slots = item.slots || [];
//     return (
//       <View style={styles.dayItem}>
//         <Text style={styles.dayName}>{item.day}</Text>
//         <View style={styles.slotsContainer}>
//           {slots.length > 0 ? (
//             slots.map((slot, idx) => (
//               <Text key={idx} style={styles.slotText}>
//                 {formatTimeString(slot.start)} – {formatTimeString(slot.end)}
//               </Text>
//             ))
//           ) : (
//             <Text style={[styles.slotText, styles.unavailableText]}>
//               {tSafe('unavailable', 'Unavailable')}
//             </Text>
//           )}
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.card}>
//       <View style={styles.header}>
//         <View style={styles.titleContainer}>
//           <View style={[styles.iconContainer, { backgroundColor: '#F0F0F5' }]}>
//             <MaterialCommunityIcons name="clock-outline" size={20} color="#6B7280" />
//           </View>
//           <Text style={styles.title}>{tSafe('availability', 'Availability')}</Text>
//         </View>
//         <TouchableOpacity onPress={handleOpenAvailability} style={styles.editButton}>
//           <MaterialCommunityIcons name="pencil" size={20} color="#6B7280" />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.divider} />

//       <FlatList
//         data={displayData}
//         renderItem={renderDay}
//         keyExtractor={(item) => item.day}
//         scrollEnabled={false}
//         ItemSeparatorComponent={() => <View style={styles.separator} />}
//         ListEmptyComponent={
//           <View style={styles.emptyState}>
//             <MaterialCommunityIcons name="calendar-clock-outline" size={28} color="#D1D5DB" />
//             <Text style={styles.emptyText}>{tSafe('no_availability', 'No availability set yet')}</Text>
//           </View>
//         }
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//     borderWidth: 1,
//     borderColor: '#F0F0F5',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   titleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   iconContainer: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1E1E2F',
//   },
//   editButton: {
//     padding: 6,
//     backgroundColor: '#F8F9FC',
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#E6E9F0',
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#E6E9F0',
//     marginBottom: 16,
//   },
//   dayItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   dayName: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#1E1E2F',
//     width: 100,
//   },
//   slotsContainer: {
//     flex: 1,
//     alignItems: 'flex-end',
//   },
//   slotText: {
//     fontSize: 14,
//     color: '#1E1E2F',
//     marginBottom: 2,
//   },
//   unavailableText: {
//     color: '#9CA3AF',
//     fontStyle: 'italic',
//   },
//   separator: {
//     height: 1,
//     backgroundColor: '#F5F5F8',
//   },
//   emptyState: {
//     alignItems: 'center',
//     paddingVertical: 16,
//   },
//   emptyText: {
//     marginTop: 8,
//     fontSize: 14,
//     color: '#9CA3AF',
//   },
// });

// export default AvailabilityDisplay;



// components/cleaner/AvailabilityDisplay.js
// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// import { tSafe } from '../../utils/tSafe';

// // Helper to convert "HH:MM" to "h:mm AM/PM"
// const formatTimeString = (timeStr) => {
//   if (!timeStr) return '';
//   const [hours, minutes] = timeStr.split(':');
//   const h = parseInt(hours, 10);
//   const ampm = h >= 12 ? 'PM' : 'AM';
//   const h12 = h % 12 || 12;
//   return `${h12}:${minutes} ${ampm}`;
// };

// // Helper to format date "YYYY-MM-DD" to "MMM D, YYYY"
// const formatDate = (dateStr) => {
//   if (!dateStr) return '';
//   const parts = dateStr.split('-');
//   if (parts.length !== 3) return dateStr;
//   const [year, month, day] = parts;
//   const date = new Date(year, month - 1, day);
//   return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
// };

// // Order for days
// const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// const AvailabilityDisplay = ({ availability, bookedSchedules = [], handleOpenAvailability }) => {
//   // Build a map for fast lookup
//   const availabilityMap = {};
//   availability.forEach(item => {
//     availabilityMap[item.day] = item;
//   });

//   // Create a full week array – missing days get empty slots
//   const displayData = DAYS_ORDER.map(day => ({
//     day,
//     slots: availabilityMap[day]?.slots || [],
//   }));

//   // Sort booked schedules by date (upcoming first)
//   const sortedBookings = [...bookedSchedules].sort((a, b) => new Date(a.date) - new Date(b.date));

//   const renderDay = ({ item }) => {
//     const slots = item.slots || [];
//     return (
//       <View style={styles.dayItem}>
//         <Text style={styles.dayName}>{item.day}</Text>
//         <View style={styles.slotsContainer}>
//           {slots.length > 0 ? (
//             slots.map((slot, idx) => (
//               <Text key={idx} style={styles.slotText}>
//                 {formatTimeString(slot.start)} – {formatTimeString(slot.end)}
//               </Text>
//             ))
//           ) : (
//             <Text style={[styles.slotText, styles.unavailableText]}>
//               {tSafe('unavailable', 'Unavailable')}
//             </Text>
//           )}
//         </View>
//       </View>
//     );
//   };

//   const renderBooking = ({ item }) => (
//     <View style={styles.bookingItem}>
//       <View style={styles.bookingDateContainer}>
//         <MaterialCommunityIcons name="calendar" size={16} color={COLORS.primary} />
//         <Text style={styles.bookingDate}>{formatDate(item.date)}</Text>
//       </View>
//       <View style={styles.bookingTimeContainer}>
//         <MaterialCommunityIcons name="clock-outline" size={14} color="#666" />
//         <Text style={styles.bookingTime}>
//           {formatTimeString(item.start)} – {formatTimeString(item.end)}
//         </Text>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.card}>
//       <View style={styles.header}>
//         <View style={styles.titleContainer}>
//           <View style={[styles.iconContainer, { backgroundColor: '#F0F0F5' }]}>
//             <MaterialCommunityIcons name="clock-outline" size={20} color="#6B7280" />
//           </View>
//           <Text style={styles.title}>{tSafe('availability', 'Availability')}</Text>
//         </View>
//         <TouchableOpacity onPress={handleOpenAvailability} style={styles.editButton}>
//           <MaterialCommunityIcons name="pencil" size={20} color="#6B7280" />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.divider} />

//       {/* Availability List */}
//       <FlatList
//         data={displayData}
//         renderItem={renderDay}
//         keyExtractor={(item) => item.day}
//         scrollEnabled={false}
//         ItemSeparatorComponent={() => <View style={styles.separator} />}
//       />

//       {/* Booked Schedules Section */}
//       <View style={styles.bookedSection}>
//         <View style={styles.bookedHeader}>
//           <MaterialCommunityIcons name="calendar-check" size={18} color="#6B7280" />
//           <Text style={styles.bookedTitle}>{tSafe('booked_schedules', 'Booked Schedules')}</Text>
//           {sortedBookings.length > 0 && (
//             <Text style={styles.bookedCount}>({sortedBookings.length})</Text>
//           )}
//         </View>

//         {sortedBookings.length > 0 ? (
//           <FlatList
//             data={sortedBookings}
//             renderItem={renderBooking}
//             keyExtractor={(item, index) => item.schedule_id || index.toString()}
//             scrollEnabled={false}
//             ItemSeparatorComponent={() => <View style={styles.bookedSeparator} />}
//           />
//         ) : (
//           <View style={styles.noBookingsContainer}>
//             <MaterialCommunityIcons name="calendar-blank-outline" size={24} color="#D1D5DB" />
//             <Text style={styles.noBookingsText}>{tSafe('no_bookings', 'No upcoming bookings')}</Text>
//           </View>
//         )}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//     borderWidth: 1,
//     borderColor: '#F0F0F5',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   titleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   iconContainer: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1E1E2F',
//   },
//   editButton: {
//     padding: 6,
//     backgroundColor: '#F8F9FC',
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#E6E9F0',
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#E6E9F0',
//     marginBottom: 16,
//   },
//   dayItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   dayName: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#1E1E2F',
//     width: 100,
//   },
//   slotsContainer: {
//     flex: 1,
//     alignItems: 'flex-end',
//   },
//   slotText: {
//     fontSize: 14,
//     color: '#1E1E2F',
//     marginBottom: 2,
//   },
//   unavailableText: {
//     color: '#9CA3AF',
//     fontStyle: 'italic',
//   },
//   separator: {
//     height: 1,
//     backgroundColor: '#F5F5F8',
//   },
//   // Booked section
//   bookedSection: {
//     marginTop: 16,
//     paddingTop: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#E6E9F0',
//   },
//   bookedHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   bookedTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1E1E2F',
//     marginLeft: 8,
//   },
//   bookedCount: {
//     fontSize: 14,
//     color: '#9CA3AF',
//     marginLeft: 4,
//   },
//   bookingItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 6,
//   },
//   bookingDateContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   bookingDate: {
//     fontSize: 14,
//     color: '#333',
//     marginLeft: 4,
//   },
//   bookingTimeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   bookingTime: {
//     fontSize: 14,
//     color: '#666',
//     marginLeft: 4,
//   },
//   bookedSeparator: {
//     height: 1,
//     backgroundColor: '#F5F5F8',
//   },
//   noBookingsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//   },
//   noBookingsText: {
//     fontSize: 14,
//     color: '#9CA3AF',
//     marginLeft: 8,
//   },
// });

// export default AvailabilityDisplay;


// components/cleaner/AvailabilityDisplay.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import { tSafe } from '../../utils/tSafe';

// Helper to convert "HH:MM" to "h:mm AM/PM"
const formatTimeString = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

// Helper to format date "YYYY-MM-DD" to "MMM D, YYYY"
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Check if a date string is today or in the future
const isTodayOrFuture = (dateStr) => {
  if (!dateStr) return false;
  const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
  return dateStr >= today;
};

// Order for days
const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AvailabilityDisplay = ({ availability, bookedSchedules = [], handleOpenAvailability }) => {
  // Build a map for fast lookup
  const availabilityMap = {};
  availability.forEach(item => {
    availabilityMap[item.day] = item;
  });

  // Create a full week array – missing days get empty slots
  const displayData = DAYS_ORDER.map(day => ({
    day,
    slots: availabilityMap[day]?.slots || [],
  }));

  // Filter and sort bookings: only today & future, sorted by date
  const upcomingBookings = (bookedSchedules || [])
    .filter(item => isTodayOrFuture(item.date))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const renderDay = ({ item }) => {
    const slots = item.slots || [];
    return (
      <View style={styles.dayItem}>
        <Text style={styles.dayName}>{item.day}</Text>
        <View style={styles.slotsContainer}>
          {slots.length > 0 ? (
            slots.map((slot, idx) => (
              <Text key={idx} style={styles.slotText}>
                {formatTimeString(slot.start)} – {formatTimeString(slot.end)}
              </Text>
            ))
          ) : (
            <Text style={[styles.slotText, styles.unavailableText]}>
              {tSafe('unavailable', 'Unavailable')}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderBooking = ({ item }) => (
    <View style={styles.bookingItem}>
      <View style={styles.bookingDateContainer}>
        <MaterialCommunityIcons name="calendar" size={16} color={COLORS.primary} />
        <Text style={styles.bookingDate}>{formatDate(item.date)}</Text>
      </View>
      <View style={styles.bookingTimeContainer}>
        <MaterialCommunityIcons name="clock-outline" size={14} color="#666" />
        <Text style={styles.bookingTime}>
          {formatTimeString(item.start)} – {formatTimeString(item.end)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.iconContainer, { backgroundColor: '#F0F0F5' }]}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#6B7280" />
          </View>
          <Text style={styles.title}>{tSafe('availability', 'Availability')}</Text>
        </View>
        <TouchableOpacity onPress={handleOpenAvailability} style={styles.editButton}>
          <MaterialCommunityIcons name="pencil" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Availability List */}
      <FlatList
        data={displayData}
        renderItem={renderDay}
        keyExtractor={(item) => item.day}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Booked Schedules Section */}
      <View style={styles.bookedSection}>
        <View style={styles.bookedHeader}>
          <MaterialCommunityIcons name="calendar-check" size={18} color="#6B7280" />
          <Text style={styles.bookedTitle}>{tSafe('upcoming_bookings', 'Upcoming Bookings')}</Text>
          {upcomingBookings.length > 0 && (
            <Text style={styles.bookedCount}>({upcomingBookings.length})</Text>
          )}
        </View>

        {upcomingBookings.length > 0 ? (
          <FlatList
            data={upcomingBookings}
            renderItem={renderBooking}
            keyExtractor={(item, index) => item.schedule_id || index.toString()}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.bookedSeparator} />}
          />
        ) : (
          <View style={styles.noBookingsContainer}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={24} color="#D1D5DB" />
            <Text style={styles.noBookingsText}>{tSafe('no_upcoming_bookings', 'No upcoming bookings')}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E1E2F',
  },
  editButton: {
    padding: 6,
    backgroundColor: '#F8F9FC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E9F0',
  },
  divider: {
    height: 1,
    backgroundColor: '#E6E9F0',
    marginBottom: 16,
  },
  dayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E1E2F',
    width: 100,
  },
  slotsContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  slotText: {
    fontSize: 14,
    color: '#1E1E2F',
    marginBottom: 2,
  },
  unavailableText: {
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  separator: {
    height: 1,
    backgroundColor: '#F5F5F8',
  },
  // Booked section
  bookedSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E6E9F0',
  },
  bookedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1E2F',
    marginLeft: 8,
  },
  bookedCount: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  bookingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  bookingDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingDate: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  bookingTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingTime: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  bookedSeparator: {
    height: 1,
    backgroundColor: '#F5F5F8',
  },
  noBookingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  noBookingsText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  
});

export default AvailabilityDisplay;