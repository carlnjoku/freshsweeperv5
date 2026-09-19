import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';

import COLORS from '../../constants/colors';
import { tSafe } from '../../utils/tSafe';

const { width } = Dimensions.get('window');

const DAY_SIZE = Math.min((width - 70) / 7, 48);

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const formatTime = (time) => {
  if (!time) return '';

  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);

  if (Number.isNaN(h)) {
    return time;
  }

  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;

  return `${h12}:${minutes} ${ampm}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';

  const d = new Date(`${dateStr}T00:00:00`);

  if (Number.isNaN(d.getTime())) {
    return dateStr;
  }

  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// --------------------------------------------------
// Component
// --------------------------------------------------

const HostAvailabilityDisplay = ({
  bookedSchedules = [],
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    moment().startOf('week')
  );

  const [selectedDate, setSelectedDate] = useState(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const today = moment().startOf('day');

  // --------------------------------------------------
  // Upcoming bookings
  // --------------------------------------------------

  const upcomingBookings = useMemo(() => {
    if (!Array.isArray(bookedSchedules)) {
      return [];
    }

    return bookedSchedules
      .filter((item) => {
        if (!item?.date) {
          return false;
        }

        return moment(item.date).isSameOrAfter(today, 'day');
      })
      .sort((a, b) => {
        const dateDiff = moment(a.date).diff(moment(b.date));

        if (dateDiff !== 0) {
          return dateDiff;
        }

        return (a.start || '').localeCompare(b.start || '');
      });
  }, [bookedSchedules, today]);

  // --------------------------------------------------
  // Date -> booking count
  // --------------------------------------------------

  const bookedDatesMap = useMemo(() => {
    const map = new Map();

    upcomingBookings.forEach((item) => {
      if (!item?.date) {
        return;
      }

      map.set(
        item.date,
        (map.get(item.date) || 0) + 1
      );
    });

    return map;
  }, [upcomingBookings]);

  // --------------------------------------------------
  // Selected date bookings
  // --------------------------------------------------

  const bookingsForSelectedDate = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    return upcomingBookings
      .filter((item) => item.date === selectedDate)
      .sort((a, b) =>
        (a.start || '').localeCompare(a.start || '')
      );
  }, [selectedDate, upcomingBookings]);

  // --------------------------------------------------
  // Week days
  // --------------------------------------------------

  const weekDays = useMemo(() => {
    const days = [];

    for (let i = 0; i < 7; i += 1) {
      const day = moment(currentWeekStart).add(i, 'days');

      const dateStr = day.format('YYYY-MM-DD');

      const bookingCount =
        bookedDatesMap.get(dateStr) || 0;

      const isBooked = bookingCount > 0;
      const isToday = day.isSame(today, 'day');
      const isSelected = selectedDate === dateStr;
      const isPast = day.isBefore(today, 'day');

      days.push({
        date: day.toDate(),
        dateStr,
        dayOfMonth: day.date(),
        dayName: day.format('ddd'),
        bookingCount,
        isBooked,
        isToday,
        isSelected,
        isPast,
      });
    }

    return days;
  }, [
    currentWeekStart,
    bookedDatesMap,
    selectedDate,
    today,
  ]);

  // --------------------------------------------------
  // Week header
  // --------------------------------------------------

  const start = moment(currentWeekStart);
  const end = moment(currentWeekStart).add(6, 'days');

  const startMonth = start.format('MMM');
  const endMonth = end.format('MMM');

  const startDay = start.date();
  const endDay = end.date();

  const year = start.format('YYYY');

  let headerText = `${startMonth} ${startDay}`;

  if (startMonth !== endMonth) {
    headerText += ` – ${endMonth} ${endDay}, ${year}`;
  } else {
    headerText += ` – ${endDay}, ${year}`;
  }

  // --------------------------------------------------
  // Animation
  // --------------------------------------------------

  const animateTransition = (callback) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (callback) {
        callback();
      }
    });
  };

  // --------------------------------------------------
  // Navigation
  // --------------------------------------------------

  const goToPreviousWeek = () => {
    const newWeekStart = moment(currentWeekStart).subtract(
      1,
      'week'
    );

    animateTransition(() => {
      setCurrentWeekStart(newWeekStart);
      setSelectedDate(null);
    });
  };

  const goToNextWeek = () => {
    const newWeekStart = moment(currentWeekStart).add(
      1,
      'week'
    );

    animateTransition(() => {
      setCurrentWeekStart(newWeekStart);
      setSelectedDate(null);
    });
  };

  const goToToday = () => {
    animateTransition(() => {
      setCurrentWeekStart(
        moment().startOf('week')
      );

      setSelectedDate(null);
    });
  };

  // --------------------------------------------------
  // Day selection
  // --------------------------------------------------

  const handleDayPress = (dayData) => {
    if (
      dayData.isPast &&
      !dayData.isToday
    ) {
      return;
    }

    if (
      !dayData.isBooked &&
      !dayData.isToday
    ) {
      return;
    }

    setSelectedDate((previous) =>
      previous === dayData.dateStr
        ? null
        : dayData.dateStr
    );
  };

  // --------------------------------------------------
  // Render day
  // --------------------------------------------------

  const renderDay = (dayData) => {
    const {
      dayOfMonth,
      isBooked,
      isToday,
      isSelected,
      isPast,
      bookingCount,
      dayName,
    } = dayData;

    const selectable =
      (isBooked || isToday) &&
      !isPast;

    return (
      <TouchableOpacity
        key={dayData.dateStr}
        style={[
          styles.dayCell,

          isSelected &&
            styles.daySelected,

          isToday &&
            !isSelected &&
            styles.dayToday,

          isPast &&
            styles.dayPast,

          isBooked &&
            !isSelected &&
            !isToday &&
            styles.dayBooked,
        ]}
        onPress={() =>
          handleDayPress(dayData)
        }
        disabled={!selectable}
        activeOpacity={0.75}
      >
        <Text
          style={[
            styles.dayNameText,

            isSelected &&
              styles.dayNameSelected,

            isToday &&
              !isSelected &&
              styles.dayNameToday,

            isPast &&
              styles.dayNamePast,

            isBooked &&
              !isSelected &&
              !isToday &&
              styles.dayNameBooked,
          ]}
        >
          {dayName}
        </Text>

        <Text
          style={[
            styles.dayText,

            isSelected &&
              styles.daySelectedText,

            isToday &&
              !isSelected &&
              styles.dayTodayText,

            isPast &&
              styles.dayPastText,

            isBooked &&
              !isSelected &&
              !isToday &&
              styles.dayBookedText,
          ]}
        >
          {dayOfMonth}
        </Text>

        {isBooked && (
          <View
            style={[
              styles.bookingIndicator,

              isSelected &&
                styles.bookingIndicatorSelected,
            ]}
          >
            {bookingCount > 1 && (
              <Text
                style={
                  styles.bookingIndicatorText
                }
              >
                {bookingCount}
              </Text>
            )}
          </View>
        )}

        {isToday && !isSelected && (
          <View style={styles.todayIndicator} />
        )}
      </TouchableOpacity>
    );
  };

  // --------------------------------------------------
  // Stats
  // --------------------------------------------------

  const totalBookings =
    upcomingBookings.length;

  const bookedDays =
    bookedDatesMap.size;

  // --------------------------------------------------
  // Empty state
  // --------------------------------------------------

  if (totalBookings === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <MaterialCommunityIcons
            name="calendar-blank-outline"
            size={34}
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.emptyTitle}>
          {tSafe(
            'no_bookings_title',
            'No Upcoming Bookings'
          )}
        </Text>

        <Text style={styles.emptySubtitle}>
          {tSafe(
            'no_bookings_desc',
            'This cleaner has no scheduled bookings yet.'
          )}
        </Text>
      </View>
    );
  }

  // --------------------------------------------------
  // Main UI
  // --------------------------------------------------

  return (
    <View style={styles.container}>
      {/* Header */}

      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            {tSafe(
              'booking_calendar',
              'Booking Calendar'
            )}
          </Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={styles.summaryDot} />

              <Text style={styles.subtitle}>
                {bookedDays}{' '}
                {tSafe(
                  'days_booked',
                  'days booked'
                )}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <Text style={styles.subtitle}>
              {totalBookings}{' '}
              {tSafe(
                'total_bookings',
                'bookings'
              )}
            </Text>
          </View>
        </View>

        {/* Only visible for cleaner */}

      </View>

      {/* Today */}

      <View style={styles.todayRow}>
        <View style={styles.todayLabelContainer}>
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={16}
            color="#77777E"
          />

          <Text style={styles.todayLabel}>
            {tSafe(
              'your_schedule',
              'Your schedule'
            )}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.todayButton}
          onPress={goToToday}
          activeOpacity={0.75}
        >
          <Text style={styles.todayButtonText}>
            {tSafe('today', 'Today')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Week navigation */}

      <View style={styles.weekNavigation}>
        <TouchableOpacity
          onPress={goToPreviousWeek}
          style={styles.navigationButton}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={22}
            color="#4A4A4A"
          />
        </TouchableOpacity>

        <View style={styles.weekCenter}>
          <Text style={styles.weekText}>
            {headerText}
          </Text>

          <Text style={styles.weekHint}>
            {tSafe(
              'select_booking_day',
              'Select a booked day'
            )}
          </Text>
        </View>

        <TouchableOpacity
          onPress={goToNextWeek}
          style={styles.navigationButton}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color="#4A4A4A"
          />
        </TouchableOpacity>
      </View>

      {/* Calendar */}

      <Animated.View
        style={[
          styles.weekGrid,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.weekRow}>
          {weekDays.map(renderDay)}
        </View>
      </Animated.View>

      {/* Legend */}

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendIndicator,
              styles.legendBooked,
            ]}
          />

          <Text style={styles.legendText}>
            {tSafe('booked', 'Booked')}
          </Text>
        </View>

        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendIndicator,
              styles.legendToday,
            ]}
          />

          <Text style={styles.legendText}>
            {tSafe('today', 'Today')}
          </Text>
        </View>

        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendIndicator,
              styles.legendSelected,
            ]}
          />

          <Text style={styles.legendText}>
            {tSafe('selected', 'Selected')}
          </Text>
        </View>
      </View>

      {/* Selected date */}

      {selectedDate && (
        <View style={styles.selectedDateContainer}>
          <View style={styles.selectedDateHeader}>
            <View style={styles.selectedDateIcon}>
              <MaterialCommunityIcons
                name="calendar-check-outline"
                size={19}
                color={COLORS.primary}
              />
            </View>

            <View
              style={styles.selectedDateHeaderText}
            >
              <Text
                style={styles.selectedDateEyebrow}
              >
                {tSafe(
                  'schedule',
                  'Schedule'
                )}
              </Text>

              <Text
                style={styles.selectedDateTitle}
              >
                {formatDate(selectedDate)}
              </Text>
            </View>

            <View
              style={styles.bookingCountBadge}
            >
              <Text
                style={
                  styles.bookingCountBadgeText
                }
              >
                {bookingsForSelectedDate.length}
              </Text>
            </View>
          </View>

          {bookingsForSelectedDate.length >
          0 ? (
            <FlatList
              data={
                bookingsForSelectedDate
              }
              keyExtractor={(
                item,
                index
              ) =>
                item?.schedule_id ||
                item?._id ||
                index.toString()
              }
              renderItem={({
                item,
                index,
              }) => (
                <View
                  style={styles.bookingItem}
                >
                  <View
                    style={
                      styles.bookingTimeline
                    }
                  >
                    <View
                      style={
                        styles.bookingTimeCircle
                      }
                    >
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={16}
                        color={
                          COLORS.primary
                        }
                      />
                    </View>

                    {index <
                      bookingsForSelectedDate.length -
                        1 && (
                      <View
                        style={
                          styles.bookingLine
                        }
                      />
                    )}
                  </View>

                  <View
                    style={
                      styles.bookingItemContent
                    }
                  >
                    <Text
                      style={
                        styles.bookingTimeLabel
                      }
                    >
                      {tSafe(
                        'time',
                        'Time'
                      )}
                    </Text>

                    <Text
                      style={
                        styles.bookingTimeText
                      }
                    >
                      {formatTime(
                        item?.start
                      )}{' '}
                      –{' '}
                      {formatTime(
                        item?.end
                      )}
                    </Text>

                    <View
                      style={
                        styles.bookingStatusRow
                      }
                    >
                      <View
                        style={
                          styles.bookingStatusDot
                        }
                      />

                      <Text
                        style={
                          styles.bookingStatusText
                        }
                      >
                        {tSafe(
                          'confirmed',
                          'Confirmed'
                        )}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              scrollEnabled={false}
            />
          ) : (
            <Text
              style={
                styles.noBookingsForDay
              }
            >
              {tSafe(
                'no_bookings_this_day',
                'No bookings on this day.'
              )}
            </Text>
          )}
        </View>
      )}

      {/* Hint */}

      {!selectedDate && (
        <View style={styles.hintContainer}>
          <MaterialCommunityIcons
            name="gesture-tap"
            size={16}
            color="#B1B1B7"
          />

          <Text style={styles.hintText}>
            {tSafe(
              'tap_booked_date',
              'Tap a booked date to view details'
            )}
          </Text>
        </View>
      )}
    </View>
  );
};

// --------------------------------------------------
// Styles
// --------------------------------------------------

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginVertical: 8,
    marginHorizontal: 4,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 14,

    elevation: 3,

    borderWidth: 1,
    borderColor: '#F0F0F2',
  },

  // --------------------------------------------------
  // Header
  // --------------------------------------------------

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 17,
  },

  headerText: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#17171A',
    letterSpacing: -0.4,
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 6,
  },

  summaryDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#D9D9DE',
    marginHorizontal: 9,
  },

  subtitle: {
    fontSize: 12,
    color: '#85858C',
    fontWeight: '500',
  },


  // --------------------------------------------------
  // Today row
  // --------------------------------------------------

  todayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  todayLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  todayLabel: {
    marginLeft: 6,
    fontSize: 12,
    color: '#77777E',
    fontWeight: '500',
  },

  todayButton: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: '#F4F7FF',
  },

  todayButtonText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },

  // --------------------------------------------------
  // Week navigation
  // --------------------------------------------------

  weekNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  navigationButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F6F6F8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  weekCenter: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 10,
  },

  weekText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#202024',
    letterSpacing: -0.2,
    textAlign: 'center',
  },

  weekHint: {
    marginTop: 3,
    fontSize: 11,
    color: '#A0A0A6',
  },

  // --------------------------------------------------
  // Calendar
  // --------------------------------------------------

  weekGrid: {
    marginBottom: 7,
  },

  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE + 10,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8FA',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F2F2F4',
  },

  dayNameText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#99999F',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },

  dayText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#303035',
  },

  // --------------------------------------------------
  // Today
  // --------------------------------------------------

  dayToday: {
    backgroundColor: '#F2F6FF',
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },

  dayTodayText: {
    color: COLORS.primary,
  },

  dayNameToday: {
    color: COLORS.primary,
  },

  todayIndicator: {
    position: 'absolute',
    bottom: 5,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },

  // --------------------------------------------------
  // Booked
  // --------------------------------------------------

  dayBooked: {
    backgroundColor: '#FFF7F6',
    borderColor: '#FFE0DC',
  },

  dayBookedText: {
    color: '#C94B3F',
  },

  dayNameBooked: {
    color: '#C94B3F',
  },

  // --------------------------------------------------
  // Selected
  // --------------------------------------------------

  daySelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.22,
    shadowRadius: 9,

    elevation: 5,
  },

  daySelectedText: {
    color: '#FFFFFF',
  },

  dayNameSelected: {
    color: '#FFFFFF',
  },

  bookingIndicator: {
    position: 'absolute',
    bottom: 5,
    minWidth: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D65A4F',
    justifyContent: 'center',
    alignItems: 'center',
  },

  bookingIndicatorSelected: {
    backgroundColor: '#FFFFFF',
  },

  bookingIndicatorText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#D65A4F',
  },

  // --------------------------------------------------
  // Past
  // --------------------------------------------------

  dayPast: {
    opacity: 0.35,
    backgroundColor: '#F5F5F6',
  },

  dayPastText: {
    color: '#A7A7AD',
  },

  dayNamePast: {
    color: '#B4B4BA',
  },

  // --------------------------------------------------
  // Legend
  // --------------------------------------------------

  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 7,
    gap: 16,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  legendIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },

  legendBooked: {
    backgroundColor: '#D65A4F',
  },

  legendToday: {
    backgroundColor: '#E7EEFF',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },

  legendSelected: {
    backgroundColor: COLORS.primary,
  },

  legendText: {
    fontSize: 10,
    color: '#8C8C93',
    fontWeight: '500',
  },

  // --------------------------------------------------
  // Selected date
  // --------------------------------------------------

  selectedDateContainer: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEF1',
  },

  selectedDateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  selectedDateIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedDateHeaderText: {
    flex: 1,
    marginLeft: 10,
  },

  selectedDateEyebrow: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9999A0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  selectedDateTitle: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '700',
    color: '#202024',
  },

  bookingCountBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bookingCountBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // --------------------------------------------------
  // Booking item
  // --------------------------------------------------

  bookingItem: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFB',
    borderRadius: 14,
    padding: 12,
    marginBottom: 7,
    borderWidth: 1,
    borderColor: '#F0F0F2',
  },

  bookingTimeline: {
    alignItems: 'center',
    width: 34,
  },

  bookingTimeCircle: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: '#EEF3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  bookingLine: {
    flex: 1,
    width: 1,
    backgroundColor: '#DCE2F1',
    marginTop: 4,
  },

  bookingItemContent: {
    flex: 1,
    marginLeft: 10,
  },

  bookingTimeLabel: {
    fontSize: 10,
    color: '#9999A0',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  bookingTimeText: {
    marginTop: 2,
    fontSize: 15,
    color: '#25252A',
    fontWeight: '700',
  },

  bookingStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  bookingStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3E9B62',
    marginRight: 6,
  },

  bookingStatusText: {
    fontSize: 11,
    color: '#3E9B62',
    fontWeight: '600',
  },

  noBookingsForDay: {
    paddingVertical: 18,
    textAlign: 'center',
    color: '#929299',
    fontSize: 13,
  },

  // --------------------------------------------------
  // Hint
  // --------------------------------------------------

  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingTop: 10,
  },

  hintText: {
    marginLeft: 7,
    fontSize: 11,
    color: '#A0A0A6',
  },

  // --------------------------------------------------
  // Empty state
  // --------------------------------------------------

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 42,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F0F0F2',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 12,

    elevation: 2,
  },

  emptyIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#F3F6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#202024',
    marginBottom: 6,
  },

  emptySubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#9999A0',
    textAlign: 'center',
  },

  
});

export default HostAvailabilityDisplay;



// import React, { useState, useMemo, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
//   Dimensions,
//   Animated,
// } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import moment from 'moment';
// import COLORS from '../../constants/colors';
// import { tSafe } from '../../utils/tSafe';

// const { width } = Dimensions.get('window');
// const DAY_SIZE = (width - 64) / 7; // more padding for modern look

// // Helper formatters
// const formatTime = (time) => {
//   if (!time) return '';
//   const [hours, minutes] = time.split(':');
//   const h = parseInt(hours, 10);
//   const ampm = h >= 12 ? 'PM' : 'AM';
//   const h12 = h % 12 || 12;
//   return `${h12}:${minutes} ${ampm}`;
// };

// const formatDate = (dateStr) => {
//   if (!dateStr) return '';
//   const d = new Date(dateStr);
//   return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
// };

// const isSameDay = (d1, d2) => {
//   return d1.getFullYear() === d2.getFullYear() &&
//          d1.getMonth() === d2.getMonth() &&
//          d1.getDate() === d2.getDate();
// };

// const HostAvailabilityDisplay = ({ bookedSchedules }) => {
//   const [currentWeekStart, setCurrentWeekStart] = useState(moment().startOf('week'));
//   const [selectedDate, setSelectedDate] = useState(null);
//   const fadeAnim = useRef(new Animated.Value(1)).current;

//   const today = moment().startOf('day');

//   // Filter upcoming bookings (today & future)
//   const upcomingBookings = useMemo(() => {
//     if (!bookedSchedules) return [];
//     return bookedSchedules
//       .filter(item => moment(item.date).isSameOrAfter(today, 'day'))
//       .sort((a, b) => moment(a.date).diff(moment(b.date)));
//   }, [bookedSchedules]);

//   // Map date -> count
//   const bookedDatesMap = useMemo(() => {
//     const map = new Map();
//     upcomingBookings.forEach(item => {
//       map.set(item.date, (map.get(item.date) || 0) + 1);
//     });
//     return map;
//   }, [upcomingBookings]);

//   // Bookings for selected date
//   const bookingsForSelectedDate = useMemo(() => {
//     if (!selectedDate) return [];
//     return upcomingBookings
//       .filter(item => item.date === selectedDate)
//       .sort((a, b) => a.start.localeCompare(b.start));
//   }, [selectedDate, upcomingBookings]);

//   // Generate week days
//   const weekDays = useMemo(() => {
//     const days = [];
//     for (let i = 0; i < 7; i++) {
//       const day = moment(currentWeekStart).add(i, 'days');
//       const dateStr = day.format('YYYY-MM-DD');
//       const bookingCount = bookedDatesMap.get(dateStr) || 0;
//       const isBooked = bookingCount > 0;
//       const isToday = day.isSame(today, 'day');
//       const isSelected = selectedDate === dateStr;
//       const isPast = day.isBefore(today, 'day');

//       days.push({
//         date: day.toDate(),
//         dateStr,
//         dayOfMonth: day.date(),
//         isBooked,
//         isToday,
//         isSelected,
//         isPast,
//         bookingCount,
//         dayName: day.format('ddd'), // short day name
//       });
//     }
//     return days;
//   }, [currentWeekStart, bookedDatesMap, selectedDate, today]);

//   // Navigation
//   const goToPreviousWeek = () => {
//     const newWeekStart = moment(currentWeekStart).subtract(1, 'week');
//     animateTransition(() => {
//       setCurrentWeekStart(newWeekStart);
//       setSelectedDate(null);
//     });
//   };

//   const goToNextWeek = () => {
//     const newWeekStart = moment(currentWeekStart).add(1, 'week');
//     animateTransition(() => {
//       setCurrentWeekStart(newWeekStart);
//       setSelectedDate(null);
//     });
//   };

//   const goToToday = () => {
//     animateTransition(() => {
//       setCurrentWeekStart(moment().startOf('week'));
//       setSelectedDate(null);
//     });
//   };

//   const animateTransition = (callback) => {
//     Animated.sequence([
//       Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
//       Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
//     ]).start(callback || (() => {}));
//   };

//   const handleDayPress = (dayData) => {
//     if (dayData.isPast && !dayData.isToday) return;
//     if (!dayData.isBooked && !dayData.isToday) return;
//     setSelectedDate(prev => prev === dayData.dateStr ? null : dayData.dateStr);
//   };

//   // Render a single day cell
//   const renderDay = (dayData) => {
//     const { dayOfMonth, isBooked, isToday, isSelected, isPast, bookingCount, dayName } = dayData;
//     const selectable = (isBooked || isToday) && !isPast;

//     let cellStyle = styles.dayCell;
//     let textStyle = styles.dayText;
//     let nameStyle = styles.dayNameText;

//     if (isSelected) {
//       cellStyle = [styles.dayCell, styles.daySelected];
//       textStyle = [styles.dayText, styles.daySelectedText];
//       nameStyle = [styles.dayNameText, styles.dayNameSelected];
//     } else if (isToday) {
//       cellStyle = [styles.dayCell, styles.dayToday];
//       textStyle = [styles.dayText, styles.dayTodayText];
//       nameStyle = [styles.dayNameText, styles.dayNameToday];
//     } else if (isPast) {
//       cellStyle = [styles.dayCell, styles.dayPast];
//       textStyle = [styles.dayText, styles.dayPastText];
//       nameStyle = [styles.dayNameText, styles.dayNamePast];
//     } else if (isBooked) {
//       cellStyle = [styles.dayCell, styles.dayBooked];
//       textStyle = [styles.dayText, styles.dayBookedText];
//       nameStyle = [styles.dayNameText, styles.dayNameBooked];
//     }

//     return (
//       <TouchableOpacity
//         style={cellStyle}
//         onPress={() => handleDayPress(dayData)}
//         disabled={!selectable}
//         activeOpacity={0.6}
//       >
//         <Text style={nameStyle}>{dayName}</Text>
//         <Text style={textStyle}>{dayOfMonth}</Text>
//         {isBooked && !isSelected && (
//           <View style={styles.bookingBadge}>
//             <Text style={styles.bookingBadgeText}>{bookingCount}</Text>
//           </View>
//         )}
//         {isToday && <View style={styles.todayDot} />}
//         {isSelected && (
//           <LinearGradient
//             colors={[COLORS.primary, COLORS.primaryDark || COLORS.primary]}
//             style={styles.selectedGlow}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//           />
//         )}
//       </TouchableOpacity>
//     );
//   };

//   // Stats
//   const totalBookings = upcomingBookings.length;
//   const bookedDays = bookedDatesMap.size;

//   // Week header range
//   const start = moment(currentWeekStart);
//   const end = moment(currentWeekStart).add(6, 'days');
//   const startMonth = start.format('MMM');
//   const startDay = start.date();
//   const endMonth = end.format('MMM');
//   const endDay = end.date();
//   const year = start.format('YYYY');
//   let headerText = `${startMonth} ${startDay}`;
//   if (startMonth !== endMonth) {
//     headerText += ` – ${endMonth} ${endDay}, ${year}`;
//   } else {
//     headerText += ` – ${endDay}, ${year}`;
//   }

//   // Empty state
//   if (totalBookings === 0) {
//     return (
//       <View style={styles.emptyContainer}>
//         <View style={styles.emptyIconContainer}>
//           <MaterialCommunityIcons name="calendar-blank" size={48} color={COLORS.primary} />
//         </View>
//         <Text style={styles.emptyTitle}>{tSafe('no_bookings_title', 'No Upcoming Bookings')}</Text>
//         <Text style={styles.emptySubtitle}>
//           {tSafe('no_bookings_desc', 'This cleaner has no scheduled bookings yet.')}
//         </Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <View>
//           <Text style={styles.title}>{tSafe('booking_calendar', 'Booking Calendar')}</Text>
//           <Text style={styles.subtitle}>
//             {bookedDays} {tSafe('days_booked', 'days booked')} · {totalBookings} {tSafe('total_bookings', 'total bookings')}
//           </Text>
//         </View>
//         <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
//           <MaterialCommunityIcons name="calendar-today" size={18} color={COLORS.primary} />
//           <Text style={styles.todayButtonText}>{tSafe('today', 'Today')}</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Week navigation */}
//       <View style={styles.navContainer}>
//         <TouchableOpacity onPress={goToPreviousWeek} style={styles.navButton}>
//           <MaterialCommunityIcons name="chevron-left" size={24} color="#888" />
//         </TouchableOpacity>
//         <Text style={styles.weekText}>{headerText}</Text>
//         <TouchableOpacity onPress={goToNextWeek} style={styles.navButton}>
//           <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
//         </TouchableOpacity>
//       </View>

//       {/* Week grid */}
//       <Animated.View style={[styles.weekGrid, { opacity: fadeAnim }]}>
//         <View style={styles.weekRow}>
//           {weekDays.map((dayData, index) => (
//             <React.Fragment key={index}>
//               {renderDay(dayData)}
//             </React.Fragment>
//           ))}
//         </View>
//       </Animated.View>

//       {/* Legend */}
//       <View style={styles.legendContainer}>
//         <View style={styles.legendItem}>
//           <View style={[styles.legendDot, { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' }]} />
//           <Text style={styles.legendText}>{tSafe('available', 'Available')}</Text>
//         </View>
//         <View style={styles.legendItem}>
//           <View style={[styles.legendDot, { backgroundColor: '#FFE5E5', borderColor: '#D32F2F' }]} />
//           <Text style={styles.legendText}>{tSafe('booked', 'Booked')}</Text>
//         </View>
//         <View style={styles.legendItem}>
//           <View style={[styles.legendDot, { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]} />
//           <Text style={styles.legendText}>{tSafe('selected', 'Selected')}</Text>
//         </View>
//       </View>

//       {/* Selected date bookings */}
//       {selectedDate && (
//         <View style={styles.selectedDateContainer}>
//           <View style={styles.selectedDateHeader}>
//             <MaterialCommunityIcons name="calendar" size={20} color={COLORS.primary} />
//             <Text style={styles.selectedDateTitle}>
//               {tSafe('bookings_for', 'Bookings for')} {formatDate(selectedDate)}
//             </Text>
//             <View style={styles.bookingCountBadge}>
//               <Text style={styles.bookingCountBadgeText}>{bookingsForSelectedDate.length}</Text>
//             </View>
//           </View>

//           {bookingsForSelectedDate.length > 0 ? (
//             <FlatList
//               data={bookingsForSelectedDate}
//               keyExtractor={(item, index) => item.schedule_id || index.toString()}
//               renderItem={({ item }) => (
//                 <View style={styles.bookingItem}>
//                   <View style={styles.bookingTimeCircle}>
//                     <MaterialCommunityIcons name="clock-outline" size={14} color="#fff" />
//                   </View>
//                   <View style={styles.bookingItemContent}>
//                     <Text style={styles.bookingTimeText}>
//                       {formatTime(item.start)} – {formatTime(item.end)}
//                     </Text>
//                     <View style={styles.bookingStatusPill}>
//                       <Text style={styles.bookingStatusText}>Confirmed</Text>
//                     </View>
//                   </View>
//                 </View>
//               )}
//               scrollEnabled={false}
//             />
//           ) : (
//             <Text style={styles.noBookingsForDay}>
//               {tSafe('no_bookings_this_day', 'No bookings on this day.')}
//             </Text>
//           )}
//         </View>
//       )}

//       {/* Hint */}
//       {!selectedDate && (
//         <View style={styles.hintContainer}>
//           <MaterialCommunityIcons name="fingerprint" size={18} color="#ccc" />
//           <Text style={styles.hintText}>
//             {tSafe('tap_booked_date', 'Tap a booked date to view details')}
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// };

// // --- Modern styles ---
// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 20,
//     marginVertical: 8,
//     marginHorizontal: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.06,
//     shadowRadius: 12,
//     elevation: 4,
//     borderWidth: 0,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 14,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1C1C1E',
//     letterSpacing: -0.3,
//   },
//   subtitle: {
//     fontSize: 13,
//     color: '#8E8E93',
//     marginTop: 2,
//     fontWeight: '400',
//   },
//   todayButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F2F2F7',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     gap: 6,
//     borderWidth: 0,
//   },
//   todayButtonText: {
//     fontSize: 13,
//     fontWeight: '500',
//     color: COLORS.primary,
//   },
//   navContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 14,
//   },
//   navButton: {
//     padding: 6,
//     borderRadius: 20,
//     backgroundColor: '#F5F5F5',
//     width: 36,
//     height: 36,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   weekText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1C1C1E',
//     letterSpacing: -0.2,
//   },
//   weekGrid: {
//     marginBottom: 6,
//   },
//   weekRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//   },
//   dayCell: {
//     width: DAY_SIZE,
//     height: DAY_SIZE + 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 16,
//     marginVertical: 2,
//     backgroundColor: '#F9F9F9',
//     position: 'relative',
//     paddingVertical: 4,
//   },
//   dayNameText: {
//     fontSize: 10,
//     fontWeight: '500',
//     color: '#999',
//     marginBottom: 2,
//     letterSpacing: 0.3,
//   },
//   dayText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//   },
//   // States
//   dayToday: {
//     backgroundColor: '#F0F7FF',
//     borderWidth: 1.5,
//     borderColor: COLORS.primary,
//   },
//   dayTodayText: {
//     color: COLORS.primary,
//   },
//   dayNameToday: {
//     color: COLORS.primary,
//   },
//   todayDot: {
//     position: 'absolute',
//     bottom: 4,
//     width: 5,
//     height: 5,
//     borderRadius: 2.5,
//     backgroundColor: COLORS.primary,
//   },
//   daySelected: {
//     backgroundColor: COLORS.primary,
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   daySelectedText: {
//     color: '#fff',
//   },
//   dayNameSelected: {
//     color: '#fff',
//   },
//   selectedGlow: {
//     position: 'absolute',
//     top: -2,
//     left: -2,
//     right: -2,
//     bottom: -2,
//     borderRadius: 18,
//     opacity: 0.25,
//   },
//   dayBooked: {
//     backgroundColor: '#FFF0EE',
//     borderWidth: 1,
//     borderColor: '#FFCDD2',
//   },
//   dayBookedText: {
//     color: '#D32F2F',
//   },
//   dayNameBooked: {
//     color: '#D32F2F',
//   },
//   dayPast: {
//     opacity: 0.4,
//   },
//   dayPastText: {
//     color: '#ccc',
//   },
//   dayNamePast: {
//     color: '#ccc',
//   },
//   bookingBadge: {
//     position: 'absolute',
//     top: 2,
//     right: 2,
//     minWidth: 18,
//     height: 18,
//     borderRadius: 9,
//     backgroundColor: '#D32F2F',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 4,
//     borderWidth: 1,
//     borderColor: '#fff',
//   },
//   bookingBadgeText: {
//     fontSize: 9,
//     color: '#fff',
//     fontWeight: '700',
//   },
//   legendContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     gap: 20,
//     marginTop: 10,
//     marginBottom: 2,
//   },
//   legendItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//   },
//   legendDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     borderWidth: 1,
//   },
//   legendText: {
//     fontSize: 11,
//     color: '#8E8E93',
//     fontWeight: '500',
//   },
//   selectedDateContainer: {
//     marginTop: 16,
//     paddingTop: 14,
//     borderTopWidth: 1,
//     borderTopColor: '#F0F0F0',
//   },
//   selectedDateHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   selectedDateTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1C1C1E',
//     marginLeft: 8,
//     flex: 1,
//   },
//   bookingCountBadge: {
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 12,
//   },
//   bookingCountBadgeText: {
//     fontSize: 11,
//     fontWeight: '600',
//     color: '#fff',
//   },
//   bookingItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     backgroundColor: '#F8F9FA',
//     borderRadius: 12,
//     marginVertical: 3,
//     borderWidth: 0,
//   },
//   bookingTimeCircle: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   bookingItemContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     flex: 1,
//     marginLeft: 12,
//   },
//   bookingTimeText: {
//     fontSize: 14,
//     color: '#333',
//     fontWeight: '500',
//   },
//   bookingStatusPill: {
//     backgroundColor: '#E8F5E9',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   bookingStatusText: {
//     fontSize: 10,
//     color: '#2E7D32',
//     fontWeight: '600',
//     letterSpacing: 0.3,
//   },
//   noBookingsForDay: {
//     fontSize: 14,
//     color: '#999',
//     fontStyle: 'italic',
//     paddingVertical: 10,
//     textAlign: 'center',
//   },
//   hintContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 8,
//     marginTop: 14,
//     paddingTop: 8,
//   },
//   hintText: {
//     fontSize: 12,
//     color: '#999',
//     fontStyle: 'italic',
//   },
//   // Empty state
//   emptyContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 40,
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     borderWidth: 0,
//     padding: 24,
//     marginVertical: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.06,
//     shadowRadius: 12,
//     elevation: 4,
//   },
//   emptyIconContainer: {
//     width: 72,
//     height: 72,
//     borderRadius: 36,
//     backgroundColor: '#F2F2F7',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   emptyTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1C1C1E',
//     marginBottom: 6,
//   },
//   emptySubtitle: {
//     fontSize: 14,
//     color: '#999',
//     textAlign: 'center',
//   },
// });

// export default HostAvailabilityDisplay;



