// import React, { useMemo } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// import { tSafe } from '../../utils/tSafe';
// import { useNavigation } from '@react-navigation/native';
// import ROUTES from '../../constants/routes';

// const UpcomingSummaryCard = ({ schedules }) => {
//   const navigation = useNavigation();

//   const count = useMemo(() => {
//     if (!schedules) return 0;
//     return schedules.length;
//   }, [schedules]);

//   if (count === 0) {
//     return (
//       <TouchableOpacity
//         style={styles.container}
//         onPress={() => navigation.navigate(ROUTES.host_bookings)}
//         activeOpacity={0.8}
//       >
//         <View style={styles.iconContainer}>
//           <MaterialCommunityIcons
//             name="calendar-check"
//             size={28}
//             color={COLORS.primary}
//           />
//         </View>
//         <View style={styles.textContainer}>
//           <Text style={styles.title}>
//             {tSafe('no_upcoming', 'No Upcoming Schedules')}
//           </Text>
//           <Text style={styles.subtitle}>
//             {tSafe('schedule_clear', 'Your schedule is clear.')}
//           </Text>
//         </View>
//         <MaterialCommunityIcons
//           name="chevron-right"
//           size={24}
//           color={COLORS.gray}
//         />
//       </TouchableOpacity>
//     );
//   }

//   return (
//     <TouchableOpacity
//       style={styles.container}
//       onPress={() => navigation.navigate(ROUTES.host_bookings)}
//       activeOpacity={0.8}
//     >
//       <View style={styles.iconContainer}>
//         <MaterialCommunityIcons
//           name="calendar-clock"
//           size={28}
//           color={COLORS.primary}
//         />
//       </View>

//       <View style={styles.textContainer}>
//         <Text style={styles.count}>
//           {count}
//           <Text style={styles.countLabel}>
//             {' '}
//             {tSafe('upcoming_schedules', 'Upcoming Schedules')}
//           </Text>
//         </Text>
//         <Text style={styles.message}>
//           {tSafe(
//             'tap_to_view',
//             'Tap to view all upcoming schedules'
//           )}
//         </Text>
//       </View>

//       <MaterialCommunityIcons
//         name="chevron-right"
//         size={24}
//         color={COLORS.gray}
//       />
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 16,
//     marginHorizontal: 16,
//     marginVertical: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.06,
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   iconContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: COLORS.primary_light || '#E3F2FD',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 14,
//   },
//   textContainer: {
//     flex: 1,
//   },
//   count: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: COLORS.dark,
//   },
//   countLabel: {
//     fontSize: 16,
//     fontWeight: '400',
//     color: COLORS.gray,
//   },
//   message: {
//     fontSize: 14,
//     color: COLORS.gray,
//     marginTop: 2,
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.dark,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: COLORS.gray,
//     marginTop: 2,
//   },
// });

// export default UpcomingSummaryCard;



import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../../constants/colors';
import { tSafe } from '../../utils/tSafe';
import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../constants/routes';

const { width } = Dimensions.get('window');

const UpcomingSummaryCard = ({ schedules }) => {
  const navigation = useNavigation();

  const count = useMemo(() => {
    if (!schedules) return 0;
    return schedules.length;
  }, [schedules]);

  const hasSchedules = count > 0;



  return (
    <Animatable.View
      animation="fadeInUp"
      duration={600}
      style={styles.wrapper}
    >
      <TouchableOpacity
        style={styles.container}
        onPress={() => navigation.navigate(ROUTES.cleaner_schedules, { initialTab: 'upcoming' })}
        activeOpacity={0.85} 
        >
        {/* Gradient accent bar at the top */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primary + '80']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accentBar}
        />

        <View style={styles.content}>
          {/* Left: Icon with gradient background */}
          <View style={styles.iconWrapper}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primary + 'CC']}
              style={styles.iconGradient}
            >
              <MaterialCommunityIcons
                name={hasSchedules ? 'calendar-clock' : 'calendar-check'}
                size={28}
                color="#fff"
              />
            </LinearGradient>
          </View>

          {/* Center: Text content */}
          <View style={styles.textContainer}>
            {hasSchedules ? (
              <>
                <Text style={styles.count}>
                  {count}
                  <Text style={styles.countLabel}>
                    {' '}{tSafe('upcoming_schedules', 'Upcoming Schedules')}
                  </Text>
                </Text>
                <View style={styles.statusRow}>
                  <View style={styles.statusDot} />
                  <Text style={styles.message}>
                    {tSafe('tap_to_view', 'Tap to view all upcoming schedules')}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.title}>
                  {tSafe('no_upcoming', 'No Upcoming Schedules')}
                </Text>
                <Text style={styles.subtitle}>
                  {tSafe('schedule_clear', 'Your schedule is clear.')}
                </Text>
              </>
            )}
          </View>

          {/* Right: Chevron */}
          <View style={styles.chevronContainer}>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={COLORS.gray}
            />
          </View>
        </View>

        {/* Progress bar (only when there are schedules) */}
        {hasSchedules && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(count * 10, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>
              {count} {tSafe('upcoming', 'upcoming')}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 0,
    marginVertical: 8,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  accentBar: {
    height: 4,
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconWrapper: {
    marginRight: 14,
  },
  iconGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  count: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    letterSpacing: -0.5,
  },
  countLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  message: {
    fontSize: 14,
    color: '#888',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  chevronContainer: {
    paddingLeft: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#888',
  },
});

export default UpcomingSummaryCard;