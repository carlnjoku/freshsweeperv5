// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   ScrollView,
//   TouchableOpacity,
// } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import CardNoPrimary from '../../components/shared/CardNoPrimary';
// import CircleIconNoLabel from '../../components/shared/CirecleIconNoLabel';
// import COLORS from '../../constants/colors';
// import CustomCalendar from '../../components/shared/CustomCalendar';
// import userService from '../../services/connection/userService';

// const AvailabilityDisplay = ({ handleOpenAvailability, cleanerId, mode }) => {
//   const [availability, setAvailability] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchAvailability = async () => {
//       try {
//         const response = await userService.getCleanerAvailability(cleanerId);
//         const res = response.data.data;
//         setAvailability(res);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAvailability();
//   }, [cleanerId]);

//   if (loading) {
//     return <ActivityIndicator size="large" color={COLORS.primary} style={styles.centered} />;
//   }

//   if (error) {
//     return <Text style={styles.errorText}>{error}</Text>;
//   }

//   return (
//     <CardNoPrimary style={styles.card}>
//       <View style={styles.header}>
//         <View style={styles.titleContainer}>
//           <MaterialCommunityIcons
//             name="calendar-clock"
//             size={24}
//             color={COLORS.primary}
//             style={styles.icon}
//           />
//           <Text style={styles.title}>Availability</Text>
//         </View>
//         {mode === 'edit' && (
//           <TouchableOpacity onPress={handleOpenAvailability} style={styles.editButton}>
//             <CircleIconNoLabel
//               iconName="pencil"
//               buttonSize={30}
//               radiusSise={15}
//               iconSize={16}
//             />
//           </TouchableOpacity>
//         )}
//       </View>

//       <View style={styles.divider} />

//       <View style={styles.content}>
//         <ScrollView showsVerticalScrollIndicator={false}>
//           <CustomCalendar
//             availability={availability?.availability || []}
//             bookedSchedules={availability?.booked_schedules || []}
//           />
//         </ScrollView>
//       </View>
//     </CardNoPrimary>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     borderRadius: 16,
//     backgroundColor: '#fff',
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
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
//   icon: {
//     marginRight: 8,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333',
//   },
//   editButton: {
//     padding: 4,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: COLORS.light_gray_1,
//     marginVertical: 8,
//   },
//   content: {
//     marginTop: 8,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorText: {
//     color: COLORS.error,
//     textAlign: 'center',
//     fontSize: 14,
//     marginTop: 20,
//   },
// });

// export default AvailabilityDisplay;














import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CardNoPrimary from '../../components/shared/CardNoPrimary';
import CircleIconNoLabel from '../../components/shared/CirecleIconNoLabel';
import EmptyPlaceholder from '../../components/shared/EmptyPlaceholder';
import COLORS from '../../constants/colors';
import CustomCalendar from '../../components/shared/CustomCalendar';



// Helper to format time from "HH:MM" to "h:mm AM/PM" – safe version
const formatTime = (time) => {
  if (!time || typeof time !== 'string') return '';
  const parts = time.split(':');
  if (parts.length < 2) return '';
  const [hours, minutes] = parts;
  const hour = parseInt(hours, 10);
  if (isNaN(hour)) return '';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const AvailabilityDisplay = ({ availability, handleOpenAvailability, mode }) => {
  const hasAvailability = availability && availability.length > 0;

  return (
    <CardNoPrimary style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons
              name="calendar-clock"
              size={22}
              color={COLORS.white}
            />
          </View>
          <Text style={styles.title}>Availability</Text>
        </View>
        {mode === 'edit' && (
          <TouchableOpacity onPress={handleOpenAvailability} style={styles.editButton}>
            <CircleIconNoLabel
              onPress={handleOpenAvailability}
              iconName="pencil"
              buttonSize={36}
              radiusSise={18}
              iconSize={18}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.content}>
        {!hasAvailability ? (
          <EmptyPlaceholder
            icon="calendar-blank-outline"
            message="No availability information provided."
          />
        ) : (
          // availability.map((dayItem) => (
          //   <View key={dayItem.day} style={styles.daySection}>
          //     <Text style={styles.dayHeader}>{dayItem.day}</Text>
          //     {dayItem.slots.map((slot, index) => (
          //       <View key={index} style={styles.slotRow}>
          //         <Text style={styles.slotTime}>
          //           {formatTime(slot.start)} - {formatTime(slot.end)}
          //         </Text>
          //       </View>
          //     ))}
          //   </View>
          // ))

          <View style={styles.content}>
         <ScrollView showsVerticalScrollIndicator={false}>
           <CustomCalendar
             availability={availability?.availability || []}
             bookedSchedules={availability?.booked_schedules || []}
           />
         </ScrollView>
       </View>

        )}
      </View>
    </CardNoPrimary>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
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
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E1E2F',
    letterSpacing: 0.3,
  },
  editButton: {
    padding: 4,
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
  content: {
    marginTop: 4,
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
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  slotTime: {
    fontSize: 14,
    color: '#555',
  },
});

export default AvailabilityDisplay;



