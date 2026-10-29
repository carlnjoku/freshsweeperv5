


// components/cleaner/AvailabilityDisplay.js
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { tSafe } from '../../utils/tSafe';
import { useTheme } from '../../theme';
import AppText from '../../ui/AppText';

// Helper to convert "HH:MM" to "h:mm AM/PM"
const formatTimeString = (timeStr) => {
  if (!timeStr) return '';

  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);

  if (Number.isNaN(h)) return timeStr;

  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;

  return `${h12}:${minutes} ${ampm}`;
};

// Helper to format date "YYYY-MM-DD" to "MMM D, YYYY"
const formatDate = (dateStr) => {
  if (!dateStr) return '';

  const parts = dateStr.split('-');

  if (parts.length !== 3) {
    return dateStr;
  }

  const [year, month, day] = parts;

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );

  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Check if a date string is today or in the future
const isTodayOrFuture = (dateStr) => {
  if (!dateStr) return false;

  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  return dateStr >= todayString;
};

// Order for days
const DAYS_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const AvailabilityDisplay = ({
  availability,
  bookedSchedules = [],
  handleOpenAvailability,
}) => {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  // Build a map for fast lookup
  const availabilityMap = {};

  (availability || []).forEach((item) => {
    availabilityMap[item.day] = item;
  });

  // Create a full week array.
  // Missing days get empty slots.
  const displayData = DAYS_ORDER.map((day) => ({
    day,
    slots: availabilityMap[day]?.slots || [],
  }));

  // Filter and sort bookings:
  // only today & future, sorted by date.
  const upcomingBookings = (
    bookedSchedules || []
  )
    .filter((item) => isTodayOrFuture(item.date))
    .sort(
      (a, b) =>
        new Date(a.date) - new Date(b.date)
    );

  const renderDay = ({ item }) => {
    const slots = item.slots || [];

    return (
      <View style={styles.dayItem}>
        <AppText style={styles.dayName}>
          {item.day}
        </AppText>

        <View style={styles.slotsContainer}>
          {slots.length > 0 ? (
            slots.map((slot, idx) => (
              <AppText
                key={`${item.day}-${idx}`}
                style={styles.slotText}
              >
                {formatTimeString(slot.start)} –{' '}
                {formatTimeString(slot.end)}
              </AppText>
            ))
          ) : (
            <AppText
              style={[
                styles.slotText,
                styles.unavailableText,
              ]}
            >
              {tSafe(
                'unavailable',
                'Unavailable'
              )}
            </AppText>
          )}
        </View>
      </View>
    );
  };

  const renderBooking = ({ item }) => (
    <View style={styles.bookingItem}>
      <View style={styles.bookingDateContainer}>
        <MaterialCommunityIcons
          name="calendar"
          size={16}
          color={theme.brand.primary}
        />

        <AppText style={styles.bookingDate}>
          {formatDate(item.date)}
        </AppText>
      </View>

      <View style={styles.bookingTimeContainer}>
        <MaterialCommunityIcons
          name="clock-outline"
          size={14}
          color={theme.icon.muted}
        />

        <AppText style={styles.bookingTime}>
          {formatTimeString(item.start)} –{' '}
          {formatTimeString(item.end)}
        </AppText>
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={20}
              color={theme.icon.muted}
            />
          </View>

          <AppText style={styles.title}>
            {tSafe(
              'availability',
              'Availability'
            )}
          </AppText>
        </View>

        <TouchableOpacity
          onPress={handleOpenAvailability}
          style={styles.editButton}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="pencil"
            size={20}
            color={theme.icon.muted}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Availability List */}
      <FlatList
        data={displayData}
        renderItem={renderDay}
        keyExtractor={(item) => item.day}
        scrollEnabled={false}
        ItemSeparatorComponent={() => (
          <View style={styles.separator} />
        )}
      />

      {/* Booked Schedules Section */}
      <View style={styles.bookedSection}>
        <View style={styles.bookedHeader}>
          <MaterialCommunityIcons
            name="calendar-check"
            size={18}
            color={theme.icon.muted}
          />

          <AppText style={styles.bookedTitle}>
            {tSafe(
              'upcoming_bookings',
              'Upcoming Bookings'
            )}
          </AppText>

          {upcomingBookings.length > 0 && (
            <AppText style={styles.bookedCount}>
              ({upcomingBookings.length})
            </AppText>
          )}
        </View>

        {upcomingBookings.length > 0 ? (
          <FlatList
            data={upcomingBookings}
            renderItem={renderBooking}
            keyExtractor={(item, index) =>
              item.schedule_id ||
              index.toString()
            }
            scrollEnabled={false}
            ItemSeparatorComponent={() => (
              <View style={styles.bookedSeparator} />
            )}
          />
        ) : (
          <View style={styles.noBookingsContainer}>
            <MaterialCommunityIcons
              name="calendar-blank-outline"
              size={24}
              color={theme.icon.muted}
            />

            <AppText style={styles.noBookingsText}>
              {tSafe(
                'no_upcoming_bookings',
                'No upcoming bookings'
              )}
            </AppText>
          </View>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.card.background,
      borderRadius: 20,
      padding: 16,
      marginBottom: 16,

      shadowColor:
        theme.shadow?.color || '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity:
        theme.shadow?.opacity || 0.05,
      shadowRadius: 8,

      elevation: 3,

      borderWidth: 1,
      borderColor: theme.card.border,
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
      backgroundColor: theme.surface.selected,
    },

    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text.primary,
    },

    editButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    divider: {
      height: 1,
      backgroundColor: theme.divider,
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
      color: theme.text.primary,
      width: 100,
    },

    slotsContainer: {
      flex: 1,
      alignItems: 'flex-end',
    },

    slotText: {
      fontSize: 14,
      color: theme.text.primary,
      marginBottom: 2,
    },

    unavailableText: {
      color: theme.text.muted,
      fontStyle: 'italic',
    },

    separator: {
      height: 1,
      backgroundColor: theme.divider,
    },

    // ---------------------------
    // Booked Section
    // ---------------------------

    bookedSection: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },

    bookedHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },

    bookedTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.primary,
      marginLeft: 8,
    },

    bookedCount: {
      fontSize: 14,
      color: theme.text.muted,
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
      color: theme.text.primary,
      marginLeft: 4,
    },

    bookingTimeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    bookingTime: {
      fontSize: 14,
      color: theme.text.secondary,
      marginLeft: 4,
    },

    bookedSeparator: {
      height: 1,
      backgroundColor: theme.divider,
    },

    noBookingsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
    },

    noBookingsText: {
      fontSize: 14,
      color: theme.text.muted,
      marginLeft: 8,
    },
  });

export default AvailabilityDisplay;