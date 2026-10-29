// ModernScheduleCard.js
// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import moment from 'moment';
// import COLORS from '../../constants/colors';
// import { tSafe } from '../../utils/tSafe';

// const ScheduleCard = ({ cleaning_time, cleaning_date, cleaning_end_time }) => {
//   // Calculate duration (e.g., "2h 30m")
//   const calculateDuration = (start, end) => {
//     const startMoment = moment(start, 'h:mm:ss A');
//     const endMoment = moment(end, 'h:mm:ss A');
//     const duration = moment.duration(endMoment.diff(startMoment));
//     const hours = Math.floor(duration.asHours());
//     const minutes = duration.minutes();
//     if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
//     if (hours > 0) return `${hours}h`;
//     return `${minutes}m`;
//   };

//   const startTimeFormatted = moment(cleaning_time, 'h:mm:ss A').format('h:mm A');
//   const endTimeFormatted = moment(cleaning_end_time, 'h:mm:ss A').format('h:mm A');
//   const dateFormatted = moment(cleaning_date).format('ddd, MMM D');
//   const durationText = calculateDuration(cleaning_time, cleaning_end_time);

//   return (
//     <View style={styles.card}>
//       {/* Header with title and status badge */}
//       <View style={styles.header}>
//         <View style={styles.titleContainer}>
//           <MaterialCommunityIcons name="calendar-clock" size={22} color={COLORS.primary} />
//           <Text style={styles.title}>{tSafe('cleaning_schedule', 'Cleaning Schedule')}</Text>
//         </View>
//         <View style={styles.badge}>
//           <MaterialCommunityIcons name="check-circle" size={14} color={COLORS.success} />
//           <Text style={styles.badgeText}>{tSafe('scheduled', 'Scheduled')}</Text>
//         </View>
//       </View>

//       {/* Horizontal timeline: three evenly spaced segments */}
//       <View style={styles.timeline}>
//         {/* Start */}
//         <View style={styles.timelineSegment}>
//           <View style={[styles.iconCircle, { backgroundColor: COLORS.success + '15' }]}>
//             <MaterialCommunityIcons name="play" size={20} color={COLORS.success} />
//           </View>
//           <Text style={styles.timelineLabel}>{tSafe('starts', 'Starts')}</Text>
//           <Text style={styles.timelineValue}>{startTimeFormatted}</Text>
//         </View>

//         {/* Connecting line */}
//         <View style={styles.connector}>
//           <View style={styles.dashedLine} />
//         </View>

//         {/* Date */}
//         <View style={styles.timelineSegment}>
//           <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '15' }]}>
//             <MaterialCommunityIcons name="calendar-blank" size={20} color={COLORS.primary} />
//           </View>
//           <Text style={styles.timelineLabel}>{tSafe('date', 'Date')}</Text>
//           <Text style={styles.timelineValue}>{dateFormatted}</Text>
//         </View>

//         {/* Connecting line */}
//         <View style={styles.connector}>
//           <View style={styles.dashedLine} />
//         </View>

//         {/* End */}
//         <View style={styles.timelineSegment}>
//           <View style={[styles.iconCircle, { backgroundColor: COLORS.warning + '15' }]}>
//             <MaterialCommunityIcons name="stop" size={20} color={COLORS.warning} />
//           </View>
//           <Text style={styles.timelineLabel}>{tSafe('ends', 'Ends')}</Text>
//           <Text style={styles.timelineValue}>{endTimeFormatted}</Text>
//         </View>
//       </View>

//       {/* Duration row with icon */}
//       <View style={styles.durationRow}>
//         <MaterialCommunityIcons name="clock-time-four-outline" size={18} color={COLORS.gray} />
//         <Text style={styles.durationText}>
//           {tSafe('duration', 'Duration')}: {durationText}
//         </Text>
//       </View>

//       {/* Optional: subtle gradient progress bar at the bottom (can be removed if not needed) */}
//       <View style={styles.progressTrack}>
//         <View style={[styles.progressFill, { width: '100%' }]} />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 10,
//     padding: 18,
//     marginHorizontal: 1,
//     marginVertical: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.08,
//     shadowRadius: 12,
//     elevation: 4,
//     borderWidth: 1,
//     borderColor: '#F0F0F0',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   titleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark || '#1E293B',
//     letterSpacing: -0.3,
//   },
//   badge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.success + '10',
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 20,
//     gap: 5,
//   },
//   badgeText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: COLORS.success,
//   },
//   timeline: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   timelineSegment: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   iconCircle: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   timelineLabel: {
//     fontSize: 12,
//     color: COLORS.gray || '#6B7280',
//     fontWeight: '500',
//     marginBottom: 4,
//   },
//   timelineValue: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: COLORS.dark || '#1E293B',
//   },
//   connector: {
//     width: 30,
//     alignItems: 'center',
//   },
//   dashedLine: {
//     width: '100%',
//     height: 1,
//     backgroundColor: '#CBD5E1',
//     borderStyle: 'dashed',
//     borderRadius: 1,
//   },
//   durationRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//     paddingVertical: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#F1F5F9',
//     marginTop: 4,
//   },
//   durationText: {
//     fontSize: 14,
//     color: COLORS.gray || '#6B7280',
//     fontWeight: '500',
//   },
//   progressTrack: {
//     marginTop: 4,
//     height: 4,
//     backgroundColor: '#E2E8F0',
//     borderRadius: 2,
//     overflow: 'hidden',
//   },
//   progressFill: {
//     height: '100%',
//     backgroundColor: COLORS.primary,
//     borderRadius: 2,
//   },
// });

// export default ScheduleCard;


import React, { useMemo } from 'react';

import {
    View,
    Text,
    StyleSheet,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import moment from 'moment';

import { useTheme } from '../../theme';
import { tSafe } from '../../utils/tSafe';

const ScheduleCard = ({
    cleaning_time,
    cleaning_date,
    cleaning_end_time,
}) => {
    const { theme } = useTheme();

    const colors = useMemo(() => ({
        background: theme.surface.default,
        elevated: theme.surface.elevated,

        primary: theme.brand.primary,

        text: theme.text.primary,
        secondaryText: theme.text.secondary,
        mutedText: theme.text.muted,

        border: theme.border.default,

        success: theme.status.success,
        warning: theme.status.warning,

        shadow: theme.shadow.color,
        shadowOpacity: theme.shadow.opacity,
    }), [theme]);

    const styles = useMemo(
        () => createStyles(colors),
        [colors]
    );

    /**
     * Parse common time formats safely.
     * Supports examples such as:
     * 11:00:00
     * 11:00:00 AM
     * 11:00 AM
     * 23:00:00
     */
    const parseTime = (time) => {
        if (!time) {
            return null;
        }

        const parsed = moment(
            time,
            [
                'h:mm:ss A',
                'h:mm A',
                'HH:mm:ss',
                'HH:mm',
                'H:mm:ss',
                'H:mm',
            ],
            true
        );

        return parsed.isValid() ? parsed : null;
    };

    const formatTime = (time) => {
        const parsed = parseTime(time);

        return parsed
            ? parsed.format('h:mm A')
            : '--';
    };

    const formatDate = (date) => {
        if (!date) {
            return '--';
        }

        // Avoid timezone shifting for date-only strings such as YYYY-MM-DD.
        const dateOnlyMatch = String(date).match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );

        let parsedDate;

        if (dateOnlyMatch) {
            const [, year, month, day] = dateOnlyMatch;

            parsedDate = moment([
                Number(year),
                Number(month) - 1,
                Number(day),
            ]);
        } else {
            parsedDate = moment(date);
        }

        return parsedDate.isValid()
            ? parsedDate.format('ddd, MMM D')
            : '--';
    };

    const calculateDuration = (start, end) => {
        const startMoment = parseTime(start);
        const endMoment = parseTime(end);

        if (!startMoment || !endMoment) {
            return '--';
        }

        let difference = endMoment.diff(startMoment);

        // Support a cleaning session that finishes after midnight.
        if (difference < 0) {
            difference += 24 * 60 * 60 * 1000;
        }

        const duration = moment.duration(difference);

        const totalHours = Math.floor(duration.asHours());
        const minutes = duration.minutes();

        if (totalHours > 0 && minutes > 0) {
            return `${totalHours}h ${minutes}m`;
        }

        if (totalHours > 0) {
            return `${totalHours}h`;
        }

        return `${minutes}m`;
    };

    const startTimeFormatted = formatTime(cleaning_time);
    const endTimeFormatted = formatTime(cleaning_end_time);
    const dateFormatted = formatDate(cleaning_date);

    const durationText = calculateDuration(
        cleaning_time,
        cleaning_end_time
    );

    return (
        <View style={styles.card}>
            {/* Header */}

            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <MaterialCommunityIcons
                        name="calendar-clock"
                        size={22}
                        color={colors.primary}
                    />

                    <Text style={styles.title}>
                        {tSafe(
                            'cleaning_schedule',
                            'Cleaning Schedule'
                        )}
                    </Text>
                </View>

                <View style={styles.badge}>
                    <MaterialCommunityIcons
                        name="check-circle"
                        size={14}
                        color={colors.success}
                    />

                    <Text style={styles.badgeText}>
                        {tSafe('scheduled', 'Scheduled')}
                    </Text>
                </View>
            </View>

            {/* Timeline */}

            <View style={styles.timeline}>
                {/* Start */}

                <View style={styles.timelineSegment}>
                    <View
                        style={[
                            styles.iconCircle,
                            styles.successIconCircle,
                        ]}
                    >
                        <MaterialCommunityIcons
                            name="play"
                            size={20}
                            color={colors.success}
                        />
                    </View>

                    <Text style={styles.timelineLabel}>
                        {tSafe('starts', 'Starts')}
                    </Text>

                    <Text style={styles.timelineValue}>
                        {startTimeFormatted}
                    </Text>
                </View>

                {/* Connector */}

                <View style={styles.connector}>
                    <View style={styles.dashedLine} />
                </View>

                {/* Date */}

                <View style={styles.timelineSegment}>
                    <View
                        style={[
                            styles.iconCircle,
                            styles.primaryIconCircle,
                        ]}
                    >
                        <MaterialCommunityIcons
                            name="calendar-blank"
                            size={20}
                            color={colors.primary}
                        />
                    </View>

                    <Text style={styles.timelineLabel}>
                        {tSafe('date', 'Date')}
                    </Text>

                    <Text
                        style={styles.timelineValue}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                    >
                        {dateFormatted}
                    </Text>
                </View>

                {/* Connector */}

                <View style={styles.connector}>
                    <View style={styles.dashedLine} />
                </View>

                {/* End */}

                <View style={styles.timelineSegment}>
                    <View
                        style={[
                            styles.iconCircle,
                            styles.warningIconCircle,
                        ]}
                    >
                        <MaterialCommunityIcons
                            name="stop"
                            size={20}
                            color={colors.warning}
                        />
                    </View>

                    <Text style={styles.timelineLabel}>
                        {tSafe('ends', 'Ends')}
                    </Text>

                    <Text style={styles.timelineValue}>
                        {endTimeFormatted}
                    </Text>
                </View>
            </View>

            {/* Duration */}

            <View style={styles.durationRow}>
                <MaterialCommunityIcons
                    name="clock-time-four-outline"
                    size={18}
                    color={colors.mutedText}
                />

                <Text style={styles.durationText}>
                    {tSafe('duration', 'Duration')}: {durationText}
                </Text>
            </View>

            {/* Progress Indicator */}

            <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
            </View>
        </View>
    );
};

/* -------------------------------------------------------------------------- */
/* THEME-AWARE STYLES                                                         */
/* -------------------------------------------------------------------------- */

const createStyles = (colors) =>
    StyleSheet.create({
        card: {
            backgroundColor: colors.background,

            borderRadius: 12,
            padding: 18,

            marginHorizontal: 1,
            marginVertical: 8,

            borderWidth: 1,
            borderColor: colors.border,

            shadowColor: colors.shadow,
            shadowOffset: {
                width: 0,
                height: 3,
            },
            shadowOpacity: colors.shadowOpacity,
            shadowRadius: 10,

            elevation: 3,
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
            flexShrink: 1,
            gap: 8,
        },

        title: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            letterSpacing: -0.3,
            flexShrink: 1,
        },

        badge: {
            flexDirection: 'row',
            alignItems: 'center',

            backgroundColor: 'rgba(46, 204, 113, 0.12)',

            paddingHorizontal: 10,
            paddingVertical: 5,

            borderRadius: 20,
            gap: 5,
            marginLeft: 8,
        },

        badgeText: {
            fontSize: 12,
            fontWeight: '500',
            color: colors.success,
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
            minWidth: 0,
        },

        iconCircle: {
            width: 44,
            height: 44,
            borderRadius: 22,

            justifyContent: 'center',
            alignItems: 'center',

            marginBottom: 8,
        },

        successIconCircle: {
            backgroundColor: 'rgba(46, 204, 113, 0.12)',
        },

        primaryIconCircle: {
            backgroundColor: 'rgba(0, 191, 255, 0.12)',
        },

        warningIconCircle: {
            backgroundColor: 'rgba(243, 156, 18, 0.12)',
        },

        timelineLabel: {
            fontSize: 12,
            color: colors.secondaryText,
            fontWeight: '500',
            marginBottom: 4,
        },

        timelineValue: {
            fontSize: 13,
            fontWeight: '600',
            color: colors.text,
            textAlign: 'center',
        },

        connector: {
            width: 24,
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: 2,
        },

        dashedLine: {
            width: '100%',
            height: 1,
            backgroundColor: colors.border,
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
            borderTopColor: colors.border,

            marginTop: 4,
        },

        durationText: {
            fontSize: 14,
            color: colors.secondaryText,
            fontWeight: '500',
        },

        progressTrack: {
            marginTop: 4,
            height: 4,

            backgroundColor: colors.border,

            borderRadius: 2,
            overflow: 'hidden',
        },

        progressFill: {
            height: '100%',
            width: '100%',

            backgroundColor: colors.primary,

            borderRadius: 2,
        },
    });

export default ScheduleCard;