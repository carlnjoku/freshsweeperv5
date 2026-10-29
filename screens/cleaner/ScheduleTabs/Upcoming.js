import React, {
  useContext,
  useMemo,
} from 'react';

import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import * as Animatable from 'react-native-animatable';

import {
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import UpcomingScheduleItem from '../../../components/shared/UpcomingScheduleItem';
import { tSafe } from '../../../utils/tSafe';
import { getClockInStatus } from '../../../utils/clockInHelper';
import { AuthContext } from '../../../context/AuthContext';
import { useTheme } from '../../../theme';


export default function Upcoming({
  schedules,
  isLoading = false,
}) {
  const {
    currentUserId,
  } = useContext(AuthContext);

  const {
    theme,
  } = useTheme();

  const styles =
    createStyles(theme);


  /*
   * ---------------------------------------------------------
   * FILTER SCHEDULES
   * ---------------------------------------------------------
   *
   * Filter out:
   * - cancelled schedules
   * - cancelled cleaner assignments
   * - schedules whose cleaning time has passed
   */
  const filteredSchedules =
    useMemo(() => {
      if (!schedules) {
        return [];
      }

      return schedules.filter(
        (item) => {
          /*
           * Check if schedule is cancelled.
           */
          const isScheduleCancelled =
            item.status
              ?.toLowerCase() ===
            'cancelled';

          /*
           * Find this cleaner's assignment.
           */
          const assignedToForCleaner =
            item.assignedTo?.find(
              (cleaner) =>
                cleaner.cleanerId ===
                currentUserId
            );

          /*
           * Check if this cleaner's
           * assignment is cancelled.
           */
          const isUserAssignmentCancelled =
            assignedToForCleaner
              ?.status
              ?.toLowerCase() ===
            'cancelled';

          const isCancelled =
            isScheduleCancelled ||
            isUserAssignmentCancelled;

          /*
           * Exclude cancelled jobs.
           */
          if (isCancelled) {
            return false;
          }

          /*
           * Check if cleaning time has passed.
           */
          const { status } =
            getClockInStatus(
              item.schedule
                .cleaning_date,
              item.schedule
                .cleaning_time
            );

          /*
           * Exclude past jobs.
           */
          if (
            status === 'past'
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      schedules,
      currentUserId,
    ]);


  /*
   * ---------------------------------------------------------
   * RENDER SCHEDULE
   * ---------------------------------------------------------
   */

  const renderItem = ({
    item,
  }) => {
    /*
     * Compute clock-in status.
     */
    const {
      canClockIn,
      status,
      message,
    } = getClockInStatus(
      item.schedule
        .cleaning_date,
      item.schedule
        .cleaning_time
    );

    const clockInStatus = {
      status,
      message,
    };

    /*
     * Check cancellations again for safety.
     */
    const isScheduleCancelled =
      item.status
        ?.toLowerCase() ===
      'cancelled';

    const assignedToForCleaner =
      item.assignedTo?.find(
        (cleaner) =>
          cleaner.cleanerId ===
          currentUserId
      );

    const isUserAssignmentCancelled =
      assignedToForCleaner
        ?.status
        ?.toLowerCase() ===
      'cancelled';

    const isCancelled =
      isScheduleCancelled ||
      isUserAssignmentCancelled;

    const finalCanClockIn =
      canClockIn &&
      !isCancelled;

    return (
      <UpcomingScheduleItem
        item={item}
        canClockIn={
          finalCanClockIn
        }
        clockInStatus={
          clockInStatus
        }
      />
    );
  };


  /*
   * ---------------------------------------------------------
   * EMPTY STATE
   * ---------------------------------------------------------
   */

  const renderEmptyState = (
    type = 'general'
  ) => {
    const messages = {
      general: {
        icon:
          'calendar-blank',

        title: tSafe(
          'upcoming_empty_general_title',
          'No Upcoming Jobs'
        ),

        message: tSafe(
          'upcoming_empty_general_message',
          "You don't have any upcoming cleaning jobs. New assignments will appear here once you're booked."
        ),
      },

      assigned: {
        icon:
          'account-clock',

        title: tSafe(
          'upcoming_empty_assigned_title',
          'No Assigned Jobs'
        ),

        message: tSafe(
          'upcoming_empty_assigned_message',
          "You haven't been assigned to any cleaning jobs yet. Available jobs will appear here when hosts book your services."
        ),
      },

      available: {
        icon:
          'briefcase-outline',

        title: tSafe(
          'upcoming_empty_available_title',
          'No Available Jobs'
        ),

        message: tSafe(
          'upcoming_empty_available_message',
          'There are no available cleaning jobs in your area at the moment. Check back later for new opportunities.'
        ),
      },

      error: {
        icon:
          'alert-circle-outline',

        title: tSafe(
          'upcoming_empty_error_title',
          'Unable to Load Jobs'
        ),

        message: tSafe(
          'upcoming_empty_error_message',
          'There was an issue loading your upcoming jobs. Please pull down to refresh or check your connection.'
        ),
      },
    };

    const {
      icon,
      title,
      message,
    } =
      messages[type] ||
      messages.general;

    return (
      <Animatable.View
        animation="fadeInUp"
        duration={600}
        delay={100}
        style={
          styles.emptyState
        }
      >
        <MaterialCommunityIcons
          name={icon}
          size={80}
          color={
            theme.icon.muted
          }
        />

        <Text
          style={
            styles.emptyStateTitle
          }
        >
          {title}
        </Text>

        <Text
          style={
            styles.emptyStateText
          }
        >
          {message}
        </Text>
      </Animatable.View>
    );
  };


  /*
   * ---------------------------------------------------------
   * ITEM SEPARATOR
   * ---------------------------------------------------------
   */

  const itemSeparator = () => (
    <View
      style={
        styles.itemSeparator
      }
    />
  );


  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (isLoading) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color={
            theme.brand.primary
          }
        />

        <Text
          style={
            styles.loadingText
          }
        >
          {tSafe(
            'loading_upcoming_jobs',
            'Loading upcoming jobs...'
          )}
        </Text>
      </View>
    );
  }


  /*
   * ---------------------------------------------------------
   * MAIN CONTENT
   * ---------------------------------------------------------
   */

  return (
    <View
      style={styles.container}
    >
      <Animatable.View
        animation="fadeIn"
        duration={550}
        style={
          styles.animatedContainer
        }
      >
        <FlatList
          data={
            filteredSchedules
          }
          renderItem={
            renderItem
          }

          ListEmptyComponent={
            <View
              style={
                styles.emptyContainer
              }
            >
              {renderEmptyState(
                'general'
              )}
            </View>
          }

          ItemSeparatorComponent={
            itemSeparator
          }

          keyExtractor={(
            item,
            index
          ) =>
            item._id ||
            index.toString()
          }

          showsVerticalScrollIndicator={
            false
          }

          contentContainerStyle={
            filteredSchedules.length ===
            0
              ? styles.emptyListContent
              : styles.listContent
          }
        />
      </Animatable.View>
    </View>
  );
}


/*
 * ---------------------------------------------------------
 * THEMED STYLES
 * ---------------------------------------------------------
 */

const createStyles = (
  theme
) =>
  StyleSheet.create({

    /*
     * Main container
     */
    container: {
      flex: 1,

      backgroundColor:
        theme.background.default,

      paddingVertical: 15,
    },


    /*
     * Animated list wrapper
     */
    animatedContainer: {
      flex: 1,
    },


    /*
     * Loading state
     */
    loadingContainer: {
      flex: 1,

      justifyContent:
        'center',

      alignItems:
        'center',

      backgroundColor:
        theme.background.default,
    },

    loadingText: {
      marginTop: 12,

      fontSize: 16,

      color:
        theme.text.secondary,
    },


    /*
     * List
     */
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 20,
      paddingTop: 8,
    },

    emptyListContent: {
      flexGrow: 1,
    },


    /*
     * Schedule separator
     */
    itemSeparator: {
      height: 12,
    },


    /*
     * Empty state container
     */
    emptyContainer: {
      flex: 1,

      justifyContent:
        'center',

      alignItems:
        'center',
    },


    /*
     * Empty state
     */
    emptyState: {
      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal: 40,
      paddingVertical: 60,
    },

    emptyStateTitle: {
      fontSize: 18,

      fontWeight: '600',

      color:
        theme.text.primary,

      marginTop: 16,
      marginBottom: 8,

      textAlign: 'center',
    },

    emptyStateText: {
      fontSize: 14,
      color:
        theme.text.secondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 20,
    },
  });








// import React, { useContext, useMemo } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   ActivityIndicator,
//   StyleSheet,
// } from 'react-native';
// import * as Animatable from 'react-native-animatable';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../../constants/colors';
// import UpcomingScheduleItem from '../../../components/shared/UpcomingScheduleItem';
// import { tSafe } from '../../../utils/tSafe';
// import { getClockInStatus } from '../../../utils/clockInHelper';
// import { AuthContext } from '../../../context/AuthContext';

// export default function Upcoming({ schedules, isLoading = false }) {
//   const { currentUserId } = useContext(AuthContext);

//   // Filter out cancelled and past schedules
//   const filteredSchedules = useMemo(() => {
//     if (!schedules) return [];
//     return schedules.filter((item) => {
//       // Check if schedule is cancelled
//       const isScheduleCancelled = item.status?.toLowerCase() === 'cancelled';
//       const assignedToForCleaner = item.assignedTo?.find(
//         (cleaner) => cleaner.cleanerId === currentUserId
//       );
//       const isUserAssignmentCancelled =
//         assignedToForCleaner?.status?.toLowerCase() === 'cancelled';
//       const isCancelled = isScheduleCancelled || isUserAssignmentCancelled;

//       // If cancelled, exclude
//       if (isCancelled) return false;

//       // Check if cleaning time has passed
//       const { status } = getClockInStatus(
//         item.schedule.cleaning_date,
//         item.schedule.cleaning_time
//       );
//       // If status is 'past', exclude
//       if (status === 'past') return false;

//       return true;
//     });
//   }, [schedules, currentUserId]);

//   const renderItem = ({ item }) => {
//     // Compute clock-in status
//     const { canClockIn, status, message } = getClockInStatus(
//       item.schedule.cleaning_date,
//       item.schedule.cleaning_time
//     );
//     const clockInStatus = { status, message };

//     // Check cancellations again (should already be filtered, but keep for safety)
//     const isScheduleCancelled = item.status?.toLowerCase() === 'cancelled';
//     const assignedToForCleaner = item.assignedTo?.find(
//       (cleaner) => cleaner.cleanerId === currentUserId
//     );
//     const isUserAssignmentCancelled =
//       assignedToForCleaner?.status?.toLowerCase() === 'cancelled';
//     const isCancelled = isScheduleCancelled || isUserAssignmentCancelled;

//     const finalCanClockIn = canClockIn && !isCancelled;

//     return (
//       <UpcomingScheduleItem
//         item={item}
//         canClockIn={finalCanClockIn}
//         clockInStatus={clockInStatus}
//       />
//     );
//   };

//   const renderEmptyState = (type = 'general') => {
//     const messages = {
//       general: {
//         icon: 'calendar-blank',
//         title: tSafe('upcoming_empty_general_title', 'No Upcoming Jobs'),
//         message: tSafe(
//           'upcoming_empty_general_message',
//           "You don't have any upcoming cleaning jobs. New assignments will appear here once you're booked."
//         ),
//       },
//       assigned: {
//         icon: 'account-clock',
//         title: tSafe('upcoming_empty_assigned_title', 'No Assigned Jobs'),
//         message: tSafe(
//           'upcoming_empty_assigned_message',
//           "You haven't been assigned to any cleaning jobs yet. Available jobs will appear here when hosts book your services."
//         ),
//       },
//       available: {
//         icon: 'briefcase-outline',
//         title: tSafe('upcoming_empty_available_title', 'No Available Jobs'),
//         message: tSafe(
//           'upcoming_empty_available_message',
//           'There are no available cleaning jobs in your area at the moment. Check back later for new opportunities.'
//         ),
//       },
//       error: {
//         icon: 'alert-circle-outline',
//         title: tSafe('upcoming_empty_error_title', 'Unable to Load Jobs'),
//         message: tSafe(
//           'upcoming_empty_error_message',
//           'There was an issue loading your upcoming jobs. Please pull down to refresh or check your connection.'
//         ),
//       },
//     };

//     const { icon, title, message } = messages[type] || messages.general;

//     return (
//       <Animatable.View
//         animation="fadeInUp"
//         duration={600}
//         delay={100}
//         style={styles.emptyState}
//       >
//         <MaterialCommunityIcons name={icon} size={80} color={COLORS.light_gray} />
//         <Text style={styles.emptyStateTitle}>{title}</Text>
//         <Text style={styles.emptyStateText}>{message}</Text>
//       </Animatable.View>
//     );
//   };

//   const itemSeparator = () => <View style={styles.item_separator} />;

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>
//           {tSafe('loading_upcoming_jobs', 'Loading upcoming jobs...')}
//         </Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Animatable.View animation="fadeIn" duration={550} style={styles.animatedContainer}>
//         <FlatList
//           data={filteredSchedules}
//           renderItem={renderItem}
//           ListEmptyComponent={
//             <View style={styles.emptyContainer}>
//               {renderEmptyState('general')}
//             </View>
//           }
//           ItemSeparatorComponent={itemSeparator}
//           keyExtractor={(item, index) => item._id || index.toString()}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={
//             filteredSchedules.length === 0 ? styles.emptyListContent : styles.listContent
//           }
//         />
//       </Animatable.View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//     paddingVertical: 15,
//   },
//   animatedContainer: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: COLORS.background,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: COLORS.gray,
//   },
//   listContent: {
//     paddingHorizontal: 16,
//     paddingBottom: 20,
//     paddingTop: 8,
//   },
//   emptyListContent: {
//     flexGrow: 1,
//   },
//   item_separator: {
//     height: 12,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyState: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 40,
//     paddingVertical: 60,
//   },
//   emptyStateTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: COLORS.darkGray,
//     marginTop: 16,
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   emptyStateText: {
//     fontSize: 14,
//     color: COLORS.gray,
//     textAlign: 'center',
//     lineHeight: 20,
//     marginBottom: 20,
//   },
// });