// ModernScheduleCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import COLORS from '../../constants/colors';
import { tSafe } from '../../utils/tSafe';

const ScheduleCard = ({ cleaning_time, cleaning_date, cleaning_end_time }) => {
  // Calculate duration (e.g., "2h 30m")
  const calculateDuration = (start, end) => {
    const startMoment = moment(start, 'h:mm:ss A');
    const endMoment = moment(end, 'h:mm:ss A');
    const duration = moment.duration(endMoment.diff(startMoment));
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  const startTimeFormatted = moment(cleaning_time, 'h:mm:ss A').format('h:mm A');
  const endTimeFormatted = moment(cleaning_end_time, 'h:mm:ss A').format('h:mm A');
  const dateFormatted = moment(cleaning_date).format('ddd, MMM D');
  const durationText = calculateDuration(cleaning_time, cleaning_end_time);

  return (
    <View style={styles.card}>
      {/* Header with title and status badge */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons name="calendar-clock" size={22} color={COLORS.primary} />
          <Text style={styles.title}>{tSafe('cleaning_schedule', 'Cleaning Schedule')}</Text>
        </View>
        <View style={styles.badge}>
          <MaterialCommunityIcons name="check-circle" size={14} color={COLORS.success} />
          <Text style={styles.badgeText}>{tSafe('scheduled', 'Scheduled')}</Text>
        </View>
      </View>

      {/* Horizontal timeline: three evenly spaced segments */}
      <View style={styles.timeline}>
        {/* Start */}
        <View style={styles.timelineSegment}>
          <View style={[styles.iconCircle, { backgroundColor: COLORS.success + '15' }]}>
            <MaterialCommunityIcons name="play" size={20} color={COLORS.success} />
          </View>
          <Text style={styles.timelineLabel}>{tSafe('starts', 'Starts')}</Text>
          <Text style={styles.timelineValue}>{startTimeFormatted}</Text>
        </View>

        {/* Connecting line */}
        <View style={styles.connector}>
          <View style={styles.dashedLine} />
        </View>

        {/* Date */}
        <View style={styles.timelineSegment}>
          <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '15' }]}>
            <MaterialCommunityIcons name="calendar-blank" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.timelineLabel}>{tSafe('date', 'Date')}</Text>
          <Text style={styles.timelineValue}>{dateFormatted}</Text>
        </View>

        {/* Connecting line */}
        <View style={styles.connector}>
          <View style={styles.dashedLine} />
        </View>

        {/* End */}
        <View style={styles.timelineSegment}>
          <View style={[styles.iconCircle, { backgroundColor: COLORS.warning + '15' }]}>
            <MaterialCommunityIcons name="stop" size={20} color={COLORS.warning} />
          </View>
          <Text style={styles.timelineLabel}>{tSafe('ends', 'Ends')}</Text>
          <Text style={styles.timelineValue}>{endTimeFormatted}</Text>
        </View>
      </View>

      {/* Duration row with icon */}
      <View style={styles.durationRow}>
        <MaterialCommunityIcons name="clock-time-four-outline" size={18} color={COLORS.gray} />
        <Text style={styles.durationText}>
          {tSafe('duration', 'Duration')}: {durationText}
        </Text>
      </View>

      {/* Optional: subtle gradient progress bar at the bottom (can be removed if not needed) */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: '100%' }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 18,
    marginHorizontal: 1,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark || '#1E293B',
    letterSpacing: -0.3,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '10',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.success,
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timelineSegment: {
    flex: 1,
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineLabel: {
    fontSize: 12,
    color: COLORS.gray || '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  timelineValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.dark || '#1E293B',
  },
  connector: {
    width: 30,
    alignItems: 'center',
  },
  dashedLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 4,
  },
  durationText: {
    fontSize: 14,
    color: COLORS.gray || '#6B7280',
    fontWeight: '500',
  },
  progressTrack: {
    marginTop: 4,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
});

export default ScheduleCard;