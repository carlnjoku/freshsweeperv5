// import React, { useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import moment from 'moment';
// import COLORS from '../../constants/colors';

// const CalendarView = ({ title, openUpcomingTab, openOngoingTab, future_schedule_dates }) => {
//   const [currentDate, setCurrentDate] = useState(moment());
//   const [selectedDate, setSelectedDate] = useState(null);
//   console.log(future_schedule_dates)
//   // Process schedule dates
//   const formattedScheduleDates = future_schedule_dates.map(date => 
//     moment(date).format('YYYY-MM-DD')
//   );

//   // Create schedule count object
//   const scheduleCount = formattedScheduleDates.reduce((acc, date) => {
//     acc[date] = (acc[date] || 0) + 1;
//     return acc;
//   }, {});

//   // Calendar calculation functions
//   const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
//   const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

//   const renderCalendarGrid = () => {
//     const currentMonth = currentDate.month();
//     const currentYear = currentDate.year();
//     const numDays = daysInMonth(currentMonth, currentYear);
//     const firstDayOfWeek = getFirstDayOfMonth(currentMonth, currentYear);

//     let calendarCells = [];

//     // Add empty cells for days before first day of month
//     for (let i = 0; i < firstDayOfWeek; i++) {
//       calendarCells.push(<View key={`empty-${i}`} style={styles.calendarCell} />);
//     }

//     // Create day cells
//     for (let day = 1; day <= numDays; day++) {
//       const dateKey = moment(new Date(currentYear, currentMonth, day)).format('YYYY-MM-DD');
//       const isScheduled = formattedScheduleDates.includes(dateKey);
//       const isToday = moment().isSame(dateKey, 'day');
//       const isPastDate = moment(dateKey).isBefore(moment(), 'day');
//       const scheduleNum = scheduleCount[dateKey] || 0;

//       calendarCells.push(
//         <TouchableOpacity
//           key={day}
//           style={[
//             styles.calendarCell,
//             isScheduled && !isToday && styles.scheduledDay,
//             isToday && styles.today,
//           ]}
//           onPress={() => handleDatePress(isToday, isScheduled)}
//         >
//           {scheduleNum > 0 && (
//             <View style={styles.scheduleCount}>
//               <Text style={styles.countText}>{scheduleNum}</Text>
//             </View>
//           )}
//           <Text style={[styles.date, isPastDate && styles.pastDate]}>
//             {day}
//           </Text>
//         </TouchableOpacity>
//       );
//     }

//     // Fill remaining week days
//     const remainingCells = 7 - ((firstDayOfWeek + numDays) % 7);
//     if (remainingCells !== 7) {
//       for (let i = 0; i < remainingCells; i++) {
//         calendarCells.push(<View key={`empty-end-${i}`} style={styles.calendarCell} />);
//       }
//     }

//     return calendarCells;
//   };

//   const handleDatePress = (isToday, isScheduled) => {
//     if (isToday) {
//       openOngoingTab();
//     } else if (isScheduled) {
//       openUpcomingTab();
//     }
//   };

//   const navigateMonth = (direction) => {
//     setCurrentDate(currentDate.clone().add(direction, 'month'));
//   };

//   return (
//     <View style={styles.container}>
//       {/* Month Navigation Header */}
//       <View style={styles.headerContainer}>
//         <TouchableOpacity onPress={() => navigateMonth(-1)}>
//           <Text style={styles.navButton}>‹</Text>
//         </TouchableOpacity>
        
//         <Text style={styles.header}>
//           {currentDate.format('MMMM YYYY')}
//         </Text>
        
//         <TouchableOpacity onPress={() => navigateMonth(1)}>
//           <Text style={styles.navButton}>›</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Days of Week */}
//       <View style={styles.daysOfWeek}>
//         {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
//           <Text key={day} style={styles.day}>{day}</Text>
//         ))}
//       </View>

//       {/* Calendar Grid */}
//       <View style={styles.calendarGrid}>
//         {renderCalendarGrid()}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     marginTop: 0,
//     paddingHorizontal: 0,
//     height:330,
//     paddingTop:20
//   },
//   headerContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 15,
//     paddingHorizontal: 10,
//   },
//   header: {
//     fontSize: 22,
//     fontWeight: '600',
//     color: COLORS.white,
//   },
//   navButton: {
//     fontSize: 30,
//     color: COLORS.white,
//     paddingHorizontal: 15,
//   },
//   daysOfWeek: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//     paddingHorizontal: 5,
//   },
//   day: {
//     width: '14%',
//     textAlign: 'center',
//     fontSize: 14,
//     fontWeight: '500',
//     color: COLORS.light_gray_1,
//   },
//   calendarGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//   },
//   calendarCell: {
//     width: '14%',
//     aspectRatio: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginVertical: 2,
//     borderRadius: 8,
//     position: 'relative',
//   },
//   date: {
//     fontSize: 16,
//     color: COLORS.light_gray_1,
//   },
//   scheduledDay: {
//     backgroundColor: COLORS.darkBlue,
//   },
//   today: {
//     backgroundColor: COLORS.deepBlue,
//   },
//   pastDate: {
//     textDecorationLine: 'line-through',
//     color: COLORS.light_gray_1,
//   },
//   scheduleCount: {
//     position: 'absolute',
//     top: 4,
//     right: 4,
//     backgroundColor: COLORS.accent,
//     borderRadius: 9,
//     minWidth: 18,
//     height: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 4,
//   },
//   countText: {
//     color: COLORS.white,
//     fontSize: 12,
//     fontWeight: '700',
//   },
// });

// export default CalendarView;



// import React, { useState, useMemo } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import moment from 'moment';
// import COLORS from '../../constants/colors';
// import { tSafe } from '../../utils/tSafe'; // added import

// const CalendarView = ({ title, openUpcomingTab, openOngoingTab, future_schedule_dates }) => {
//   const [currentDate, setCurrentDate] = useState(moment());
//   const [selectedDate, setSelectedDate] = useState(null);
//   console.log(future_schedule_dates)
//   // Process schedule dates
//   const formattedScheduleDates = future_schedule_dates.map(date => 
//     moment(date).format('YYYY-MM-DD')
//   );

//   // Create schedule count object
//   const scheduleCount = formattedScheduleDates.reduce((acc, date) => {
//     acc[date] = (acc[date] || 0) + 1;
//     return acc;
//   }, {});

//   // Calendar calculation functions
//   const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
//   const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

//   // Helper to translate month names
//   const getTranslatedMonth = (monthName) => {
//     const monthMap = {
//       'January': tSafe('january', 'January'),
//       'February': tSafe('february', 'February'),
//       'March': tSafe('march', 'March'),
//       'April': tSafe('april', 'April'),
//       'May': tSafe('may', 'May'),
//       'June': tSafe('june', 'June'),
//       'July': tSafe('july', 'July'),
//       'August': tSafe('august', 'August'),
//       'September': tSafe('september', 'September'),
//       'October': tSafe('october', 'October'),
//       'November': tSafe('november', 'November'),
//       'December': tSafe('december', 'December'),
//     };
//     return monthMap[monthName] || monthName;
//   };

//   // Day names translation
//   const dayNames = useMemo(() => [
//     tSafe('sun', 'Sun'),
//     tSafe('mon', 'Mon'),
//     tSafe('tue', 'Tue'),
//     tSafe('wed', 'Wed'),
//     tSafe('thu', 'Thu'),
//     tSafe('fri', 'Fri'),
//     tSafe('sat', 'Sat'),
//   ], []);

//   const renderCalendarGrid = () => {
//     const currentMonth = currentDate.month();
//     const currentYear = currentDate.year();
//     const numDays = daysInMonth(currentMonth, currentYear);
//     const firstDayOfWeek = getFirstDayOfMonth(currentMonth, currentYear);

//     let calendarCells = [];

//     // Add empty cells for days before first day of month
//     for (let i = 0; i < firstDayOfWeek; i++) {
//       calendarCells.push(<View key={`empty-${i}`} style={styles.calendarCell} />);
//     }

//     // Create day cells
//     for (let day = 1; day <= numDays; day++) {
//       const dateKey = moment(new Date(currentYear, currentMonth, day)).format('YYYY-MM-DD');
//       const isScheduled = formattedScheduleDates.includes(dateKey);
//       const isToday = moment().isSame(dateKey, 'day');
//       const isPastDate = moment(dateKey).isBefore(moment(), 'day');
//       const scheduleNum = scheduleCount[dateKey] || 0;

//       calendarCells.push(
//         <TouchableOpacity
//           key={day}
//           style={[
//             styles.calendarCell,
//             isScheduled && !isToday && styles.scheduledDay,
//             isToday && styles.today,
//           ]}
//           onPress={() => handleDatePress(isToday, isScheduled)}
//         >
//           {scheduleNum > 0 && (
//             <View style={styles.scheduleCount}>
//               <Text style={styles.countText}>{scheduleNum}</Text>
//             </View>
//           )}
//           <Text style={[styles.date, isPastDate && styles.pastDate]}>
//             {day}
//           </Text>
//         </TouchableOpacity>
//       );
//     }

//     // Fill remaining week days
//     const remainingCells = 7 - ((firstDayOfWeek + numDays) % 7);
//     if (remainingCells !== 7) {
//       for (let i = 0; i < remainingCells; i++) {
//         calendarCells.push(<View key={`empty-end-${i}`} style={styles.calendarCell} />);
//       }
//     }

//     return calendarCells;
//   };

//   const handleDatePress = (isToday, isScheduled) => {
//     if (isToday) {
//       openOngoingTab();
//     } else if (isScheduled) {
//       openUpcomingTab();
//     }
//   };

//   const navigateMonth = (direction) => {
//     setCurrentDate(currentDate.clone().add(direction, 'month'));
//   };

//   const monthName = currentDate.format('MMMM');
//   const translatedMonth = getTranslatedMonth(monthName);
//   const year = currentDate.format('YYYY');

//   return (
//     <View style={styles.container}>
//       {/* Month Navigation Header */}
//       <View style={styles.headerContainer}>
//         <TouchableOpacity onPress={() => navigateMonth(-1)}>
//           <Text style={styles.navButton}>‹</Text>
//         </TouchableOpacity>
        
//         <Text style={styles.header}>
//           {translatedMonth} {year}
//         </Text>
        
//         <TouchableOpacity onPress={() => navigateMonth(1)}>
//           <Text style={styles.navButton}>›</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Days of Week */}
//       <View style={styles.daysOfWeek}>
//         {dayNames.map(day => (
//           <Text key={day} style={styles.day}>{day}</Text>
//         ))}
//       </View>

//       {/* Calendar Grid */}
//       <View style={styles.calendarGrid}>
//         {renderCalendarGrid()}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     marginTop: 0,
//     paddingHorizontal: 0,
//     height:330,
//     paddingTop:20
//   },
//   headerContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 15,
//     paddingHorizontal: 10,
//   },
//   header: {
//     fontSize: 22,
//     fontWeight: '600',
//     color: COLORS.white,
//   },
//   navButton: {
//     fontSize: 30,
//     color: COLORS.white,
//     paddingHorizontal: 15,
//   },
//   daysOfWeek: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//     paddingHorizontal: 5,
//   },
//   day: {
//     width: '14%',
//     textAlign: 'center',
//     fontSize: 14,
//     fontWeight: '500',
//     color: COLORS.light_gray_1,
//   },
//   calendarGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//   },
//   calendarCell: {
//     width: '14%',
//     aspectRatio: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginVertical: 2,
//     borderRadius: 8,
//     position: 'relative',
//   },
//   date: {
//     fontSize: 16,
//     color: COLORS.light_gray_1,
//   },
//   scheduledDay: {
//     backgroundColor: COLORS.darkBlue,
//   },
//   today: {
//     backgroundColor: COLORS.deepBlue,
//   },
//   pastDate: {
//     textDecorationLine: 'line-through',
//     color: COLORS.light_gray_1,
//   },
//   scheduleCount: {
//     position: 'absolute',
//     top: 4,
//     right: 4,
//     backgroundColor: COLORS.accent,
//     borderRadius: 9,
//     minWidth: 18,
//     height: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 4,
//   },
//   countText: {
//     color: COLORS.white,
//     fontSize: 12,
//     fontWeight: '700',
//   },
// });

// export default CalendarView;


import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import moment from 'moment';
import COLORS from '../../constants/colors';
import { tSafe } from '../../utils/tSafe';

const CalendarView = ({ title, openUpcomingTab, openOngoingTab, future_schedule_dates }) => {
  // currentWeekStart holds the start date of the displayed week (Monday or Sunday depending on locale)
  const [currentWeekStart, setCurrentWeekStart] = useState(moment().startOf('week'));
  const [selectedDate, setSelectedDate] = useState(null);

  // Format schedule dates for quick lookup
  const formattedScheduleDates = future_schedule_dates.map(date =>
    moment(date).format('YYYY-MM-DD')
  );

  // Count occurrences per day
  const scheduleCount = formattedScheduleDates.reduce((acc, date) => {
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // Helper to get translated day names (short)
  const dayNames = useMemo(() => [
    tSafe('sun', 'Sun'),
    tSafe('mon', 'Mon'),
    tSafe('tue', 'Tue'),
    tSafe('wed', 'Wed'),
    tSafe('thu', 'Thu'),
    tSafe('fri', 'Fri'),
    tSafe('sat', 'Sat'),
  ], []);

  // Helper to translate month names (used in header)
  const getTranslatedMonth = (monthName) => {
    const monthMap = {
      'January': tSafe('january', 'January'),
      'February': tSafe('february', 'February'),
      'March': tSafe('march', 'March'),
      'April': tSafe('april', 'April'),
      'May': tSafe('may', 'May'),
      'June': tSafe('june', 'June'),
      'July': tSafe('july', 'July'),
      'August': tSafe('august', 'August'),
      'September': tSafe('september', 'September'),
      'October': tSafe('october', 'October'),
      'November': tSafe('november', 'November'),
      'December': tSafe('december', 'December'),
    };
    return monthMap[monthName] || monthName;
  };

  // Generate the 7 days of the current week
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = moment(currentWeekStart).add(i, 'days');
      days.push({
        date: day,
        dateKey: day.format('YYYY-MM-DD'),
        dayOfMonth: day.date(),
        isToday: day.isSame(moment(), 'day'),
        isPast: day.isBefore(moment(), 'day'),
        isScheduled: formattedScheduleDates.includes(day.format('YYYY-MM-DD')),
        scheduleCount: scheduleCount[day.format('YYYY-MM-DD')] || 0,
      });
    }
    return days;
  }, [currentWeekStart, future_schedule_dates]);

  // Handler for day press
  const handleDayPress = (day) => {
    if (day.isToday) {
      openOngoingTab();
    } else if (day.isScheduled) {
      openUpcomingTab();
    }
    // Optionally update selectedDate for visual feedback
    setSelectedDate(day.dateKey);
  };

  // Navigate to previous/next week
  const navigateWeek = (direction) => {
    setCurrentWeekStart(currentWeekStart.clone().add(direction, 'week'));
    setSelectedDate(null);
  };

  // Build header text: e.g., "Mar 10 – Mar 16, 2025"
  const startMonth = currentWeekStart.format('MMM');
  const startDay = currentWeekStart.date();
  const endDay = currentWeekStart.clone().add(6, 'days').date();
  const endMonth = currentWeekStart.clone().add(6, 'days').format('MMM');
  const year = currentWeekStart.format('YYYY');
  let headerText = `${startMonth} ${startDay}`;
  if (startMonth !== endMonth) {
    headerText += ` – ${endMonth} ${endDay}, ${year}`;
  } else {
    headerText += ` – ${endDay}, ${year}`;
  }

  return (
    <View style={styles.container}>
      {/* Week Navigation Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigateWeek(-1)} style={styles.navButton}>
          <Text style={styles.navArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>{headerText}</Text>
        <TouchableOpacity onPress={() => navigateWeek(1)} style={styles.navButton}>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Days of Week Row */}
      <View style={styles.weekRow}>
        {weekDays.map((day, index) => {
          const isSelected = selectedDate === day.dateKey;
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayContainer,
                day.isToday && styles.todayContainer,
                day.isScheduled && !day.isToday && styles.scheduledContainer,
                isSelected && styles.selectedContainer,
              ]}
              onPress={() => handleDayPress(day)}
              activeOpacity={0.7}
            >
              {/* Day name */}
              <Text style={[styles.dayName, day.isToday && styles.todayText]}>
                {dayNames[index]}
              </Text>
              {/* Day number */}
              <Text style={[styles.dayNumber, day.isPast && styles.pastDate]}>
                {day.dayOfMonth}
              </Text>
              {/* Schedule count badge */}
              {day.scheduleCount > 0 && (
                <View style={styles.scheduleBadge}>
                  <Text style={styles.badgeText}>{day.scheduleCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    paddingHorizontal: 10,
    paddingTop: 20,
    height: 170, // adjust as needed
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  navButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  navArrow: {
    fontSize: 28,
    color: COLORS.white,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dayContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 2,
    backgroundColor: 'transparent',
    minHeight: 80,
    justifyContent: 'center',
    position: 'relative',
  },
  dayName: {
    fontSize: 12,
    color: COLORS.light_gray_1,
    marginBottom: 4,
    fontWeight: '500',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  todayContainer: {
    backgroundColor: COLORS.deepBlue,
    borderRadius: 8,
  },
  todayText: {
    color: COLORS.white,
  },
  scheduledContainer: {
    backgroundColor: COLORS.darkBlue,
    borderRadius: 8,
  },
  selectedContainer: {
    borderWidth: 1,
    borderColor: COLORS.darkBlue,
    borderRadius: 8,
  },
  pastDate: {
    opacity: 0.4,
    textDecorationLine: 'line-through',
  },
  scheduleBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.accent,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
});

export default CalendarView;