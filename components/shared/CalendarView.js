// import React, { useState, useMemo } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import moment from 'moment';
// import COLORS from '../../constants/colors';
// import { tSafe } from '../../utils/tSafe';

// const CalendarView = ({ title, openUpcomingTab, openOngoingTab, future_schedule_dates }) => {
//   // currentWeekStart holds the start date of the displayed week (Monday or Sunday depending on locale)
//   const [currentWeekStart, setCurrentWeekStart] = useState(moment().startOf('week'));
//   const [selectedDate, setSelectedDate] = useState(null);

//   // Format schedule dates for quick lookup
//   const formattedScheduleDates = future_schedule_dates.map(date =>
//     moment(date).format('YYYY-MM-DD')
//   );

//   // Count occurrences per day
//   const scheduleCount = formattedScheduleDates.reduce((acc, date) => {
//     acc[date] = (acc[date] || 0) + 1;
//     return acc;
//   }, {});

//   // Helper to get translated day names (short)
//   const dayNames = useMemo(() => [
//     tSafe('sun', 'Sun'),
//     tSafe('mon', 'Mon'),
//     tSafe('tue', 'Tue'),
//     tSafe('wed', 'Wed'),
//     tSafe('thu', 'Thu'),
//     tSafe('fri', 'Fri'),
//     tSafe('sat', 'Sat'),
//   ], []);

//   // Helper to translate month names (used in header)
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

//   // Generate the 7 days of the current week
//   const weekDays = useMemo(() => {
//     const days = [];
//     for (let i = 0; i < 7; i++) {
//       const day = moment(currentWeekStart).add(i, 'days');
//       days.push({
//         date: day,
//         dateKey: day.format('YYYY-MM-DD'),
//         dayOfMonth: day.date(),
//         isToday: day.isSame(moment(), 'day'),
//         isPast: day.isBefore(moment(), 'day'),
//         isScheduled: formattedScheduleDates.includes(day.format('YYYY-MM-DD')),
//         scheduleCount: scheduleCount[day.format('YYYY-MM-DD')] || 0,
//       });
//     }
//     return days;
//   }, [currentWeekStart, future_schedule_dates]);

//   // Handler for day press
//   const handleDayPress = (day) => {
//     if (day.isToday) {
//       openOngoingTab();
//     } else if (day.isScheduled) {
//       openUpcomingTab();
//     }
//     // Optionally update selectedDate for visual feedback
//     setSelectedDate(day.dateKey);
//   };

//   // Navigate to previous/next week
//   const navigateWeek = (direction) => {
//     setCurrentWeekStart(currentWeekStart.clone().add(direction, 'week'));
//     setSelectedDate(null);
//   };

//   // Build header text: e.g., "Mar 10 – Mar 16, 2025"
//   const startMonth = currentWeekStart.format('MMM');
//   const startDay = currentWeekStart.date();
//   const endDay = currentWeekStart.clone().add(6, 'days').date();
//   const endMonth = currentWeekStart.clone().add(6, 'days').format('MMM');
//   const year = currentWeekStart.format('YYYY');
//   let headerText = `${startMonth} ${startDay}`;
//   if (startMonth !== endMonth) {
//     headerText += ` – ${endMonth} ${endDay}, ${year}`;
//   } else {
//     headerText += ` – ${endDay}, ${year}`;
//   }

//   return (
//     <View style={styles.container}>
//       {/* Week Navigation Header */}
//       <View style={styles.headerContainer}>
//         <TouchableOpacity onPress={() => navigateWeek(-1)} style={styles.navButton}>
//           <Text style={styles.navArrow}>‹</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerText}>{headerText}</Text>
//         <TouchableOpacity onPress={() => navigateWeek(1)} style={styles.navButton}>
//           <Text style={styles.navArrow}>›</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Days of Week Row */}
//       <View style={styles.weekRow}>
//         {weekDays.map((day, index) => {
//           const isSelected = selectedDate === day.dateKey;
//           return (
//             <TouchableOpacity
//               key={index}
//               style={[
//                 styles.dayContainer,
//                 day.isToday && styles.todayContainer,
//                 day.isScheduled && !day.isToday && styles.scheduledContainer,
//                 isSelected && styles.selectedContainer,
//               ]}
//               onPress={() => handleDayPress(day)}
//               activeOpacity={0.7}
//             >
//               {/* Day name */}
//               <Text style={[styles.dayName, day.isToday && styles.todayText]}>
//                 {dayNames[index]}
//               </Text>
//               {/* Day number */}
//               <Text style={[styles.dayNumber, day.isPast && styles.pastDate]}>
//                 {day.dayOfMonth}
//               </Text>
//               {/* Schedule count badge */}
//               {day.scheduleCount > 0 && (
//                 <View style={styles.scheduleBadge}>
//                   <Text style={styles.badgeText}>{day.scheduleCount}</Text>
//                 </View>
//               )}
//             </TouchableOpacity>
//           );
//         })}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     marginTop: 0,
//     paddingHorizontal: 10,
//     paddingTop: 20,
//     height: 170, // adjust as needed
//   },
//   headerContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//     paddingHorizontal: 5,
//   },
//   headerText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: COLORS.white,
//   },
//   navButton: {
//     paddingHorizontal: 15,
//     paddingVertical: 5,
//   },
//   navArrow: {
//     fontSize: 28,
//     color: COLORS.white,
//   },
//   weekRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//   },
//   dayContainer: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: 8,
//     borderRadius: 8,
//     marginHorizontal: 2,
//     backgroundColor: 'transparent',
//     minHeight: 80,
//     justifyContent: 'center',
//     position: 'relative',
//   },
//   dayName: {
//     fontSize: 12,
//     color: COLORS.light_gray_1,
//     marginBottom: 4,
//     fontWeight: '500',
//   },
//   dayNumber: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: COLORS.white,
//   },
//   todayContainer: {
//     backgroundColor: COLORS.deepBlue,
//     borderRadius: 8,
//   },
//   todayText: {
//     color: COLORS.white,
//   },
//   scheduledContainer: {
//     backgroundColor: COLORS.darkBlue,
//     borderRadius: 8,
//   },
//   selectedContainer: {
//     borderWidth: 1,
//     borderColor: COLORS.darkBlue,
//     borderRadius: 8,
//   },
//   pastDate: {
//     opacity: 0.4,
//     textDecorationLine: 'line-through',
//   },
//   scheduleBadge: {
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
//   badgeText: {
//     color: COLORS.white,
//     fontSize: 10,
//     fontWeight: '700',
//   },
// });

// export default CalendarView;




import React, { useState, useMemo } from 'react';

import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import moment from 'moment';

import { tSafe } from '../../utils/tSafe';
import { useTheme } from '../../theme';
import AppText from '../../ui/AppText';

const CalendarView = ({
  title,
  openUpcomingTab,
  openOngoingTab,
  future_schedule_dates = [],
}) => {
  const { theme, isDark } = useTheme();

  const styles = useMemo(
    () => createStyles(theme, isDark),
    [theme, isDark]
  );

  const [currentWeekStart, setCurrentWeekStart] = useState(
    moment().startOf('week')
  );

  const [selectedDate, setSelectedDate] = useState(null);

  // Normalize schedule dates for quick lookup.
  const formattedScheduleDates = useMemo(
    () =>
      future_schedule_dates.map((date) =>
        moment(date).format('YYYY-MM-DD')
      ),
    [future_schedule_dates]
  );

  // Count schedules for each date.
  const scheduleCount = useMemo(
    () =>
      formattedScheduleDates.reduce((acc, date) => {
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {}),
    [formattedScheduleDates]
  );

  // Translated day names.
  const dayNames = useMemo(
    () => [
      tSafe('sun', 'Sun'),
      tSafe('mon', 'Mon'),
      tSafe('tue', 'Tue'),
      tSafe('wed', 'Wed'),
      tSafe('thu', 'Thu'),
      tSafe('fri', 'Fri'),
      tSafe('sat', 'Sat'),
    ],
    []
  );

  // Generate the seven days of the displayed week.
  const weekDays = useMemo(() => {
    const days = [];
    const today = moment();

    for (let i = 0; i < 7; i++) {
      const day = moment(currentWeekStart).add(i, 'days');
      const dateKey = day.format('YYYY-MM-DD');

      days.push({
        date: day,
        dateKey,
        dayOfMonth: day.date(),
        isToday: day.isSame(today, 'day'),
        isPast: day.isBefore(today, 'day'),
        isScheduled: (scheduleCount[dateKey] || 0) > 0,
        scheduleCount: scheduleCount[dateKey] || 0,
      });
    }

    return days;
  }, [currentWeekStart, scheduleCount]);

  // Handle date selection.
  const handleDayPress = (day) => {
    setSelectedDate(day.dateKey);

    if (day.isToday) {
      openOngoingTab?.();
    } else if (day.isScheduled) {
      openUpcomingTab?.();
    }
  };

  // Navigate to the previous or next week.
  const navigateWeek = (direction) => {
    setCurrentWeekStart((previous) =>
      previous.clone().add(direction, 'week')
    );

    setSelectedDate(null);
  };

  // Translate month abbreviations.
  const getTranslatedMonth = (monthName) => {
    const monthMap = {
      Jan: tSafe('january', 'January'),
      Feb: tSafe('february', 'February'),
      Mar: tSafe('march', 'March'),
      Apr: tSafe('april', 'April'),
      May: tSafe('may', 'May'),
      Jun: tSafe('june', 'June'),
      Jul: tSafe('july', 'July'),
      Aug: tSafe('august', 'August'),
      Sep: tSafe('september', 'September'),
      Oct: tSafe('october', 'October'),
      Nov: tSafe('november', 'November'),
      Dec: tSafe('december', 'December'),
    };

    return monthMap[monthName] || monthName;
  };

  // Build the displayed week range.
  const startMonth = getTranslatedMonth(
    currentWeekStart.format('MMM')
  );

  const endDate = currentWeekStart.clone().add(6, 'days');

  const endMonth = getTranslatedMonth(endDate.format('MMM'));

  const startDay = currentWeekStart.date();
  const endDay = endDate.date();

  const startYear = currentWeekStart.format('YYYY');
  const endYear = endDate.format('YYYY');

  let headerText;

  if (startYear !== endYear) {
    headerText =
      `${startMonth} ${startDay}, ${startYear} – ` +
      `${endMonth} ${endDay}, ${endYear}`;
  } else if (startMonth !== endMonth) {
    headerText =
      `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${endYear}`;
  } else {
    headerText =
      `${startMonth} ${startDay} – ${endDay}, ${endYear}`;
  }

  return (
    <View style={styles.container}>
      {/* Week Navigation Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={tSafe(
            'previous_week',
            'Previous week'
          )}
          onPress={() => navigateWeek(-1)}
          style={styles.navButton}
          activeOpacity={0.7}
        >
          <AppText style={styles.navArrow}>‹</AppText>
        </TouchableOpacity>

        <AppText
          style={styles.headerText}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {headerText}
        </AppText>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={tSafe(
            'next_week',
            'Next week'
          )}
          onPress={() => navigateWeek(1)}
          style={styles.navButton}
          activeOpacity={0.7}
        >
          <AppText style={styles.navArrow}>›</AppText>
        </TouchableOpacity>
      </View>

      {/* Days of the Week */}
      <View style={styles.weekRow}>
        {weekDays.map((day, index) => {
          const isSelected = selectedDate === day.dateKey;

          return (
            <TouchableOpacity
              key={day.dateKey}
              accessibilityRole="button"
              accessibilityLabel={`${dayNames[index]} ${day.dayOfMonth}${
                day.isToday
                  ? `, ${tSafe('today', 'today')}`
                  : ''
              }${
                day.scheduleCount > 0
                  ? `, ${day.scheduleCount} ${
                      day.scheduleCount === 1
                        ? tSafe('schedule', 'schedule')
                        : tSafe('schedules', 'schedules')
                    }`
                  : ''
              }`}
              accessibilityState={{
                selected: isSelected,
              }}
              style={[
                styles.dayContainer,

                // Scheduled days get a subtle background.
                day.isScheduled &&
                  !day.isToday &&
                  styles.scheduledContainer,

                // Selected dates receive an outline.
                isSelected && styles.selectedContainer,
              ]}
              onPress={() => handleDayPress(day)}
              activeOpacity={0.75}
            >
              {/* Day Label: never highlighted for today */}
              <AppText style={styles.dayName}>
                {dayNames[index]}
              </AppText>

              {/* Date Number: circle today and scheduled dates */}
              <View
                style={[
                  styles.dayNumberContainer,

                  // Today's date gets the brand-colored circle.
                  day.isToday && styles.todayDateCircle,

                  // Other scheduled dates get a green circle.
                  day.isScheduled &&
                    !day.isToday &&
                    styles.scheduledDateCircle,

                  // Today with a job gets a green outline.
                  day.isToday &&
                    day.isScheduled &&
                    styles.todayScheduledDateCircle,
                ]}
              >
                <AppText
                  style={[
                    styles.dayNumber,

                    (day.isToday || day.isScheduled) &&
                      styles.highlightedDateText,

                    day.isPast &&
                      !day.isToday &&
                      styles.pastDate,
                  ]}
                >
                  {day.dayOfMonth}
                </AppText>
              </View>

              {/* Schedule Count Badge */}
              {day.scheduleCount > 0 && (
                <View
                  style={[
                    styles.scheduleBadge,
                    day.isToday && styles.todayBadge,
                  ]}
                >
                  <AppText
                    style={[
                      styles.badgeText,
                      day.isToday && styles.todayBadgeText,
                    ]}
                  >
                    {day.scheduleCount}
                  </AppText>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const createStyles = (theme, isDark) =>
  StyleSheet.create({
    // ---------------------------
    // Calendar Container
    // ---------------------------

    container: {
      marginTop: 0,
      paddingHorizontal: 10,
      paddingTop: 20,
      paddingBottom: 12,
      minHeight: 170,
      backgroundColor: 'transparent',
    },

    // ---------------------------
    // Week Header
    // ---------------------------

    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 18,
      paddingHorizontal: 2,
    },

    headerText: {
      flex: 1,
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '700',
      color: theme.text.primary,
      marginHorizontal: 4,
    },

    navButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.surface?.elevated ||
        theme.surface?.default,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    navArrow: {
      fontSize: 28,
      lineHeight: 32,
      fontWeight: '400',
      color: theme.text.primary,
      textAlign: 'center',
    },

    // ---------------------------
    // Week Days
    // ---------------------------

    weekRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'stretch',
    },

    dayContainer: {
      flex: 1,
      minWidth: 0,
      minHeight: 78,

      alignItems: 'center',
      justifyContent: 'center',

      paddingTop: 10,
      paddingBottom: 12,

      borderRadius: 12,
      marginHorizontal: 2,

      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: 'transparent',

      position: 'relative',
    },

    dayName: {
      fontSize: 11,
      color: theme.text.secondary,
      marginBottom: 7,
      fontWeight: '600',
    },

    // ---------------------------
    // Date Number Circle
    // ---------------------------

    dayNumberContainer: {
      width: 34,
      height: 34,
      borderRadius: 17,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor: 'transparent',
    },

    dayNumber: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.text.primary,
      textAlign: 'center',
    },

    // ---------------------------
    // Today's Date
    // ---------------------------

    todayDateCircle: {
      backgroundColor: theme.brand.primary,
    },

    // ---------------------------
    // Scheduled Dates
    // ---------------------------

    scheduledDateCircle: {
      backgroundColor: theme.status.success,
    },

    // Today and scheduled: brand fill + green outline.
    todayScheduledDateCircle: {
      backgroundColor: theme.brand.primary,
      borderWidth: 2,
      borderColor: theme.status.success,
    },

    highlightedDateText: {
      color: theme.text.inverse,
    },

    // ---------------------------
    // Scheduled Day Background
    // ---------------------------

    scheduledContainer: {
      backgroundColor:
        theme.surface?.selected ||
        (isDark
          ? 'rgba(255,255,255,0.08)'
          : 'rgba(0,0,0,0.04)'),

      borderColor: theme.border.default,
    },

    // ---------------------------
    // Selected Date
    // ---------------------------

    selectedContainer: {
      borderWidth: 2,
      borderColor: theme.brand.primary,
    },

    // ---------------------------
    // Past Dates
    // ---------------------------

    pastDate: {
      opacity: 0.45,
      textDecorationLine: 'line-through',
    },

    // ---------------------------
    // Schedule Count Badge
    // ---------------------------

    scheduleBadge: {
      position: 'absolute',
      top: 3,
      right: 3,

      minWidth: 17,
      height: 17,
      paddingHorizontal: 4,

      borderRadius: 9,

      justifyContent: 'center',
      alignItems: 'center',

      backgroundColor: theme.brand.primary,
    },

    badgeText: {
      color: theme.text.inverse,
      fontSize: 10,
      fontWeight: '800',
      textAlign: 'center',
    },

    // Today has a contrasting badge.
    todayBadge: {
      backgroundColor: theme.text.inverse,
    },

    todayBadgeText: {
      color: theme.brand.primary,
    },
  });

export default CalendarView;