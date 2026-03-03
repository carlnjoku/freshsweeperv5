import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import moment from 'moment';
import COLORS from '../../constants/colors';

const CalendarView = ({ title, openUpcomingTab, openOngoingTab, future_schedule_dates }) => {
  const [currentDate, setCurrentDate] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(null);
  console.log(future_schedule_dates)
  // Process schedule dates
  const formattedScheduleDates = future_schedule_dates.map(date => 
    moment(date).format('YYYY-MM-DD')
  );

  // Create schedule count object
  const scheduleCount = formattedScheduleDates.reduce((acc, date) => {
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // Calendar calculation functions
  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const renderCalendarGrid = () => {
    const currentMonth = currentDate.month();
    const currentYear = currentDate.year();
    const numDays = daysInMonth(currentMonth, currentYear);
    const firstDayOfWeek = getFirstDayOfMonth(currentMonth, currentYear);

    let calendarCells = [];

    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarCells.push(<View key={`empty-${i}`} style={styles.calendarCell} />);
    }

    // Create day cells
    for (let day = 1; day <= numDays; day++) {
      const dateKey = moment(new Date(currentYear, currentMonth, day)).format('YYYY-MM-DD');
      const isScheduled = formattedScheduleDates.includes(dateKey);
      const isToday = moment().isSame(dateKey, 'day');
      const isPastDate = moment(dateKey).isBefore(moment(), 'day');
      const scheduleNum = scheduleCount[dateKey] || 0;

      calendarCells.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarCell,
            isScheduled && !isToday && styles.scheduledDay,
            isToday && styles.today,
          ]}
          onPress={() => handleDatePress(isToday, isScheduled)}
        >
          {scheduleNum > 0 && (
            <View style={styles.scheduleCount}>
              <Text style={styles.countText}>{scheduleNum}</Text>
            </View>
          )}
          <Text style={[styles.date, isPastDate && styles.pastDate]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    // Fill remaining week days
    const remainingCells = 7 - ((firstDayOfWeek + numDays) % 7);
    if (remainingCells !== 7) {
      for (let i = 0; i < remainingCells; i++) {
        calendarCells.push(<View key={`empty-end-${i}`} style={styles.calendarCell} />);
      }
    }

    return calendarCells;
  };

  const handleDatePress = (isToday, isScheduled) => {
    if (isToday) {
      openOngoingTab();
    } else if (isScheduled) {
      openUpcomingTab();
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(currentDate.clone().add(direction, 'month'));
  };

  return (
    <View style={styles.container}>
      {/* Month Navigation Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigateMonth(-1)}>
          <Text style={styles.navButton}>‹</Text>
        </TouchableOpacity>
        
        <Text style={styles.header}>
          {currentDate.format('MMMM YYYY')}
        </Text>
        
        <TouchableOpacity onPress={() => navigateMonth(1)}>
          <Text style={styles.navButton}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Days of Week */}
      <View style={styles.daysOfWeek}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} style={styles.day}>{day}</Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {renderCalendarGrid()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    paddingHorizontal: 0,
    height:330,
    paddingTop:20
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.white,
  },
  navButton: {
    fontSize: 30,
    color: COLORS.white,
    paddingHorizontal: 15,
  },
  daysOfWeek: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  day: {
    width: '14%',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.light_gray_1,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: '14%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 8,
    position: 'relative',
  },
  date: {
    fontSize: 16,
    color: COLORS.light_gray_1,
  },
  scheduledDay: {
    backgroundColor: COLORS.darkBlue,
  },
  today: {
    backgroundColor: COLORS.deepBlue,
  },
  pastDate: {
    textDecorationLine: 'line-through',
    color: COLORS.light_gray_1,
  },
  scheduleCount: {
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
  countText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
});

export default CalendarView;