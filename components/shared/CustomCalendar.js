import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Button } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    eachDayOfInterval, 
    isSameMonth, 
    addMonths, 
    subMonths, 
    startOfWeek, 
    endOfWeek 
  } from 'date-fns';
import SmoothModal from './SmoothModal';
import { Card, Title, Paragraph, useTheme, IconButton } from 'react-native-paper';
import COLORS from '../../constants/colors';

const CustomCalendar = ({ availability, bookedSchedules }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const { colors } = useTheme();
  
    // Generate complete calendar grid with padding days
    const generateCalendarGrid = (date) => {
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
      return eachDayOfInterval({ start: startDate, end: endDate });
    };

    
  
    // Split days into weeks
    const daysInMonth = generateCalendarGrid(currentDate);
    const weeks = [];
    for (let i = 0; i < daysInMonth.length; i += 7) {
      weeks.push(daysInMonth.slice(i, i + 7));
    }


  // Get availability for a day
  const getDayAvailability = date => {
    const dayName = format(date, 'EEEE');
    return availability.find(a => a.day === dayName)?.slots || [];
  };

  // Get bookings for a date
  const getBookings = date => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return bookedSchedules.filter(b => b.date === formattedDate);
  };

  // Render single day cell
  const renderDay = date => {
    const isCurrentMonth = isSameMonth(date, currentDate);
    const availability = getDayAvailability(date);
    const bookings = getBookings(date);
    const bookingCount = bookings.length;
    const hasAvailability = availability.length > 0;

    return (
        <TouchableOpacity
        key={date.toString()}
        style={[
          styles.day,
          !isCurrentMonth && styles.disabledDay,
          hasAvailability && styles.availableDay,
        ]}
        onPress={() => {
          setSelectedDate(date);
          setModalVisible(true);
        }}
        disabled={!isCurrentMonth}
      >
        <Text style={styles.dayText}>{format(date, 'd')}</Text>
        {bookingCount > 0 && (
          <View style={styles.bookingBadge}>
            <Text style={styles.bookingText}>{bookingCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const bookings = [
    {
      date: '2025-02-19',
      start: '10:00',
      end: '12:00',
      cleaner_id: 'cleaner_123',
      duration: 2,
    },
    {
      date: '2025-02-19',
      start: '16:00',
      end: '20:00',
      cleaner_id: 'cleaner_123',
      duration: 2,
    },
    {
      date: '2025-02-20',
      start: '14:00',
      end: '16:00',
      cleaner_id: 'cleaner_456',
      duration: 2,
    },
  ];

  const renderBookingList = (bookings) => {
    return bookings.map((booking, index) => (
      <Card key={index} style={[styles.card, { backgroundColor: COLORS.primary_light_2 }]}>
        <Card.Content>
          <View style={styles.header}>
            <Title style={styles.title}>
              {booking.start} - {booking.end}
            </Title>
            <IconButton
              icon={() => (
                <MaterialCommunityIcons
                  name="calendar-check"
                  size={24}
                  color={COLORS.primary}
                />
              )}
              onPress={() => console.log('View details')}
            />
          </View>
          <Paragraph style={styles.subtitle}>
            <MaterialCommunityIcons
              name="account"
              size={16}
              color={colors.text}
            />{' '}
            Cleaner: {booking.cleaner_id}
          </Paragraph>
        </Card.Content>
        <Card.Actions style={styles.actions}>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => console.log('Edit booking')}
          />
          <IconButton
            icon="delete"
            size={20}
            color={COLORS.primary}
            style={{
                backgroundColor: COLORS.primary_light, // Light red shade
            }}
            onPress={() => console.log('Delete booking')}
          />
        </Card.Actions>
      </Card>
    ));
  };

  return (
    <View style={styles.container}>
      {/* Month navigation */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentDate(subMonths(currentDate, 1))}>
            <MaterialCommunityIcons name="chevron-left" size={34} color="#000" />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{format(currentDate, 'MMMM yyyy')}</Text>
        <TouchableOpacity onPress={() => setCurrentDate(addMonths(currentDate, 1))}>
            <MaterialCommunityIcons name="chevron-right" size={34} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Week days header */}
    <View style={styles.weekHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <Text key={day} style={styles.weekDay}>{day}</Text>
        ))}
    </View>

      {/* Calendar grid */}
      {weeks.map((week, i) => (
        <View key={i} style={styles.week}>
          {week.map(renderDay)}
        </View>
      ))}
   
    <SmoothModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      >
        {selectedDate && (
          <>
            <Text style={styles.modalTitle}>
              {format(selectedDate, 'EEEE, MMM d')}
            </Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Availability:</Text>
              {getDayAvailability(selectedDate).map((slot, i) => (
                <Text key={i}>{slot.start} - {slot.end}</Text>
              ))}
            </View>

            <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bookings:</Text>
              {renderBookingList(getBookings(selectedDate))}
              
            </View>
          </>
        )}
      </SmoothModal>
      {/* Day details modal */}
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDay: {
    width: 40,
    textAlign: 'center',
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  day: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  availableDay: {
    backgroundColor: '#c8e6c9',
  },
  disabledDay: {
    opacity: 0.4,
  },
  dayText: {
    color: '#333',
  },
  bookingDot: {
    position: 'absolute',
    bottom: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e57373',
  },
  modal: {
    flex: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bookingBadge: {
    position: 'absolute',
    top: -3,
    right: -5,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  
    backgroundColor: COLORS.primary_light_2,
    elevation: 0, // Removes elevation-based shadow
    shadowColor: 'transparent', // Removes shadow on iOS
    borderWidth: 1, // Optional: Add a border for better separation
    borderColor: COLORS.primary_light_2, // Optional: Light border color
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    marginVertical: 4,
    color: '#666',
  },
  actions: {
    justifyContent: 'flex-end',
  },

});

export default CustomCalendar;