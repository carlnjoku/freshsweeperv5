import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import moment from 'moment';
import { useNavigation } from '@react-navigation/native';

import ButtonPrimary from './ButtonPrimary';
import ROUTES from '../../constants/routes';
import { AuthContext } from '../../context/AuthContext';
import { tSafe } from '../../utils/tSafe';
import { useTheme } from '../../theme';


const UpcomingScheduleItem = ({
  item,
  canClockIn = false,
  clockInStatus = {},
}) => {
  const {
    currentUserId,
  } = useContext(AuthContext);

  const navigation =
    useNavigation();

  const {
    theme,
  } = useTheme();

  const styles =
    createStyles(theme);


  /*
   * ---------------------------------------------------------
   * CURRENT CLEANER ASSIGNMENT
   * ---------------------------------------------------------
   */

  const assignedToForCleaner =
    item.assignedTo?.find(
      (cleaner) =>
        cleaner.cleanerId ===
        currentUserId
    );


  /*
   * ---------------------------------------------------------
   * CANCELLATION STATUS
   * ---------------------------------------------------------
   */

  const isScheduleCancelled =
    item.status
      ?.toLowerCase() ===
    'cancelled';

  const isUserAssignmentCancelled =
    assignedToForCleaner
      ?.status
      ?.toLowerCase() ===
    'cancelled';

  const isCancelled =
    isScheduleCancelled ||
    isUserAssignmentCancelled;


  /*
   * ---------------------------------------------------------
   * HIDE PAST ITEMS
   * ---------------------------------------------------------
   */

  if (
    clockInStatus.status ===
    'past'
  ) {
    return null;
  }


  /*
   * ---------------------------------------------------------
   * COUNTDOWN / STATUS MESSAGE
   * ---------------------------------------------------------
   */

  const getCountdownMessage =
    () => {
      /*
       * Cancelled assignment/job
       */
      if (isCancelled) {
        if (
          isUserAssignmentCancelled
        ) {
          return tSafe(
            'assignment_cancelled',
            'Your assignment has been cancelled'
          );
        }

        if (
          isScheduleCancelled
        ) {
          return tSafe(
            'job_cancelled',
            'This job has been cancelled'
          );
        }
      }


      /*
       * Within one hour
       */
      if (
        clockInStatus.status ===
        'within_1_hour'
      ) {
        return clockInStatus.message;
      }


      /*
       * Future schedule
       */
      if (
        clockInStatus.status ===
        'future'
      ) {
        const cleaningStart =
          new Date(
            `${item.schedule.cleaning_date}T${item.schedule.cleaning_time}Z`
          );

        const now =
          new Date();

        const timeDiff =
          cleaningStart.getTime() -
          now.getTime();


        if (timeDiff <= 0) {
          return tSafe(
            'clock_in_available_now',
            'Clock-in available now'
          );
        }


        const hoursLeft =
          Math.floor(
            timeDiff /
              (60 * 60 * 1000)
          );

        const minutesLeft =
          Math.floor(
            (timeDiff %
              (60 * 60 * 1000)) /
              (60 * 1000)
          );


        let template;


        if (hoursLeft > 0) {
          template = tSafe(
            'clock_in_available_hours1',
            'Clock-in available in {hours}h {minutes}m'
          );

          return template
            .replace(
              '{hours}',
              hoursLeft
            )
            .replace(
              '{minutes}',
              minutesLeft
            );
        }


        template = tSafe(
          'clock_in_available_minutes1',
          'Clock-in available in {minutes}m'
        );

        return template.replace(
          '{minutes}',
          minutesLeft
        );
      }


      return null;
    };


  const countdownMessage =
    getCountdownMessage();


  /*
   * ---------------------------------------------------------
   * USER-SPECIFIC CANCELLATION MESSAGE
   * ---------------------------------------------------------
   */

  const userCancelledMessage =
    isUserAssignmentCancelled
      ? tSafe(
          'assignment_cancelled_message',
          'Your assignment was cancelled'
        )
      : null;


  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <View>
      <View
        style={styles.container}
      >

        {/* ----------------------------------------------- */}
        {/* DATE / TIME */}
        {/* ----------------------------------------------- */}

        <View
          style={
            styles.dateTime
          }
        >
          <Text
            style={[
              styles.date,
              isCancelled &&
                styles.cancelledText,
            ]}
          >
            {moment(
              item.schedule.cleaning_date
            ).format(
              'ddd MMM DD'
            )}
          </Text>

          <Text
            style={[
              styles.time,
              isCancelled &&
                styles.cancelledText,
            ]}
          >
            {moment(
              item.schedule.cleaning_time,
              'h:mm:ss A'
            ).format(
              'h:mm A'
            )}
          </Text>
        </View>


        {/* ----------------------------------------------- */}
        {/* TIMELINE */}
        {/* ----------------------------------------------- */}

        <View
          style={styles.dotline}
        >
          <View
            style={[
              styles.dot,

              isCancelled
                ? styles.dotCancelled
                : canClockIn
                ? styles.dotActive
                : styles.dotUpcoming,
            ]}
          />

          <View
            style={styles.line}
          />
        </View>


        {/* ----------------------------------------------- */}
        {/* JOB DETAILS */}
        {/* ----------------------------------------------- */}

        <View
          style={
            styles.taskDetails
          }
        >
          <Text
            style={[
              styles.task,
              isCancelled &&
                styles.cancelledText,
            ]}
          >
            {
              item.schedule
                .apartment_name
            }
          </Text>

          <Text
            style={[
              styles.apartment,
              isCancelled &&
                styles.cancelledText,
            ]}
          >
            {
              item.schedule
                .address
            }
          </Text>


          {/* ------------------------------------------- */}
          {/* USER CANCELLATION */}
          {/* ------------------------------------------- */}

          {userCancelledMessage && (
            <View
              style={
                styles.userCancelledContainer
              }
            >
              <Text
                style={
                  styles.userCancelledText
                }
              >
                {
                  userCancelledMessage
                }
              </Text>
            </View>
          )}


          {/* ------------------------------------------- */}
          {/* JOB CANCELLATION */}
          {/* ------------------------------------------- */}

          {isScheduleCancelled &&
            !isUserAssignmentCancelled && (
              <View
                style={
                  styles.cancelledContainer
                }
              >
                <Text
                  style={
                    styles.cancelledText
                  }
                >
                  {tSafe(
                    'job_cancelled_label',
                    'Job Cancelled'
                  )}
                </Text>
              </View>
            )}


          {/* ------------------------------------------- */}
          {/* CLOCK-IN BUTTON */}
          {/* ------------------------------------------- */}

          {!isCancelled &&
            canClockIn && (
              <View
                style={
                  styles.action
                }
              >
                <ButtonPrimary
                  title={tSafe(
                    'clock_in_button',
                    'Clock-In'
                  )}
                  onPress={() =>
                    navigation.navigate(
                      ROUTES.cleaner_clock_in,
                      {
                        scheduleId:
                          item._id,

                        schedule:
                          item,

                        cleaner:
                          assignedToForCleaner,
                      }
                    )
                  }
                />
              </View>
            )}


          {/* ------------------------------------------- */}
          {/* COUNTDOWN / VIEW DETAILS */}
          {/* ------------------------------------------- */}

          {!isCancelled &&
            !canClockIn &&
            countdownMessage && (
              <>
                <View
                  style={
                    styles.countdownContainer
                  }
                >
                  <Text
                    style={
                      styles.countdownText
                    }
                  >
                    {
                      countdownMessage
                    }
                  </Text>
                </View>

                <View
                  style={
                    styles.action
                  }
                >
                  <ButtonPrimary
                    title={tSafe(
                      'view_details_button',
                      'View Details'
                    )}
                    onPress={() =>
                      navigation.navigate(
                        ROUTES.cleaner_schedule_details_view,
                        {
                          item:
                            item._id,

                          scheduleId:
                            item._id,
                        }
                      )
                    }
                  />
                </View>
              </>
            )}
        </View>
      </View>
    </View>
  );
};


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
     * Main timeline row
     */
    container: {
      flexDirection: 'row',
      marginBottom: 0,
      marginTop: 5,
    },


    /*
     * Timeline
     */
    dotline: {
      flex: 0.05,
      height: '100%',
      alignItems:
        'flex-start',
    },

    line: {
      borderLeftWidth: 0.7,

      borderLeftColor:
        theme.border.default,

      minHeight: 78,

      marginHorizontal: 5,
      marginVertical: 0,
    },


    /*
     * Date / time
     */
    dateTime: {
      flex: 0.25,
      alignItems: 'flex-end',
      marginRight: 5,
    },

    date: {
      marginTop: -4,

      fontSize: 14,

      fontWeight: '500',

      color:
        theme.text.primary,
    },

    time: {
      marginTop: 4,

      fontSize: 12,

      color:
        theme.text.secondary,
    },


    /*
     * Job details
     */
    taskDetails: {
      flex: 0.7,

      alignItems:
        'flex-start',

      width: '100%',

      marginTop: -5,
    },

    task: {
      fontWeight: '500',

      fontSize: 15,

      color:
        theme.text.primary,
    },

    apartment: {
      color:
        theme.text.secondary,

      fontSize: 13,

      marginTop: 2,
    },


    /*
     * Timeline dots
     */
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginBottom: 5,
    },

    dotActive: {
      backgroundColor:
        theme.status.success,
    },

    dotUpcoming: {
      backgroundColor:
        theme.brand.primary,
    },

    dotCancelled: {
      backgroundColor:
        theme.text.disabled,
    },


    /*
     * Action buttons
     */
    action: {
      flexDirection: 'row',

      justifyContent:
        'space-evenly',

      marginTop: -5,

      marginBottom: 5,
    },


    /*
     * User assignment cancellation
     *
     * Neutral dark-mode-safe surface with
     * warning semantic color.
     */
    userCancelledContainer: {
      backgroundColor:
        theme.background.sunken,

      paddingHorizontal: 12,
      paddingVertical: 8,

      borderRadius: 6,

      marginTop: 8,

      borderWidth: 1,

      borderColor:
        theme.status.warning,
    },

    userCancelledText: {
      color:
        theme.status.warning,

      fontWeight: '500',
    },


    /*
     * General job cancellation
     */
    cancelledContainer: {
      backgroundColor:
        theme.background.sunken,

      paddingHorizontal: 12,
      paddingVertical: 8,

      borderRadius: 6,

      marginTop: 8,

      borderWidth: 1,

      borderColor:
        theme.status.error,
    },

    cancelledText: {
      color:
        theme.status.error,

      textDecorationLine:
        'line-through',
    },


    /*
     * Countdown
     */
    countdownContainer: {
      backgroundColor:
        theme.background.sunken,

      paddingHorizontal: 12,
      paddingVertical: 8,

      borderRadius: 6,

      marginTop: 8,

      borderWidth: 1,

      borderColor:
        theme.status.warning,
    },

    countdownText: {
      color:
        theme.status.warning,

      fontSize: 12,

      fontWeight: '500',
    },


    /*
     * Past state
     *
     * Kept for compatibility if this style is
     * used later.
     */
    pastContainer: {
      backgroundColor:
        theme.background.sunken,

      paddingHorizontal: 12,
      paddingVertical: 8,

      borderRadius: 6,

      marginTop: 8,

      borderWidth: 1,

      borderColor:
        theme.status.error,
    },

    pastText: {
      color:
        theme.status.error,

      fontSize: 12,

      fontWeight: '500',
    },
  });


export default UpcomingScheduleItem;








// import React, { useContext } from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import COLORS from '../../constants/colors';
// import moment from 'moment';
// import ROUTES from '../../constants/routes';
// import { useNavigation } from '@react-navigation/native';
// import ButtonPrimary from './ButtonPrimary';
// import { AuthContext } from '../../context/AuthContext';
// import { tSafe } from '../../utils/tSafe'; // added import

// const UpcomingScheduleItem = ({ item, canClockIn = false, clockInStatus = {} }) => {
//   const { currentUserId } = useContext(AuthContext);
//   const navigation = useNavigation();

//   const assignedToForCleaner = item.assignedTo?.find(
//     (cleaner) => cleaner.cleanerId === currentUserId
//   );

//   // Check if schedule is cancelled OR current user's assignment is cancelled
//   const isScheduleCancelled = item.status?.toLowerCase() === 'cancelled';
//   const isUserAssignmentCancelled = assignedToForCleaner?.status?.toLowerCase() === 'cancelled';
//   const isCancelled = isScheduleCancelled || isUserAssignmentCancelled;

//   // ✅ Hide this item if the cleaning time has passed
//   if (clockInStatus.status === 'past') {
//     return null;
//   }

//   const getCountdownMessage = () => {
//     if (isCancelled) {
//       if (isUserAssignmentCancelled) {
//         return tSafe('assignment_cancelled', 'Your assignment has been cancelled');
//       } else if (isScheduleCancelled) {
//         return tSafe('job_cancelled', 'This job has been cancelled');
//       }
//     }
  
//     if (clockInStatus.status === 'within_1_hour') {
//       return clockInStatus.message;
//     } else if (clockInStatus.status === 'future') {
//       const cleaningStart = new Date(`${item.schedule.cleaning_date}T${item.schedule.cleaning_time}Z`);
//       const now = new Date();
//       const timeDiff = cleaningStart.getTime() - now.getTime();
  
//       if (timeDiff <= 0) {
//         return tSafe('clock_in_available_now', 'Clock‑in available now');
//       }
  
//       const hoursLeft = Math.floor(timeDiff / (60 * 60 * 1000));
//       const minutesLeft = Math.floor((timeDiff % (60 * 60 * 1000)) / (60 * 1000));
  
//       let template;
//       if (hoursLeft > 0) {
//         template = tSafe('clock_in_available_hours1', 'Clock‑in available in {hours}h {minutes}m');
//         return template.replace('{hours}', hoursLeft).replace('{minutes}', minutesLeft);
//       } else {
//         template = tSafe('clock_in_available_minutes1', 'Clock‑in available in {minutes}m');
//         return template.replace('{minutes}', minutesLeft);
//       }
//     }
//     return null;
//   };

//   const countdownMessage = getCountdownMessage();

//   const userCancelledMessage = isUserAssignmentCancelled
//     ? tSafe('assignment_cancelled_message', 'Your assignment was cancelled')
//     : null;

//   return (
//     <View>
//       <View style={styles.container}>
//         <View style={styles.date_time}>
//           <Text
//             style={[
//               styles.date,
//               isCancelled && styles.cancelledText,
//             ]}
//           >
//             {moment(item.schedule.cleaning_date).format('ddd MMM DD')}
//           </Text>
//           <Text
//             style={[
//               styles.time,
//               isCancelled && styles.cancelledText,
//             ]}
//           >
//             {moment(item.schedule.cleaning_time, 'h:mm:ss A').format('h:mm A')}
//           </Text>
//         </View>

//         <View style={styles.dotline}>
//           <View
//             style={[
//               styles.dot,
//               isCancelled
//                 ? styles.dotCancelled
//                 : canClockIn
//                 ? styles.dotActive
//                 : styles.dotUpcoming,
//             ]}
//           />
//           <View style={styles.line} />
//         </View>

//         <View style={styles.task_details}>
//           <Text
//             style={[
//               styles.task,
//               isCancelled && styles.cancelledText,
//             ]}
//           >
//             {item.schedule.apartment_name}
//           </Text>
//           <Text
//             style={[
//               styles.apartment,
//               isCancelled && styles.cancelledText,
//             ]}
//           >
//             {item.schedule.address}
//           </Text>

//           {/* User‑specific cancelled message */}
//           {userCancelledMessage && (
//             <View style={styles.userCancelledContainer}>
//               <Text style={styles.userCancelledText}>{userCancelledMessage}</Text>
//             </View>
//           )}

//           {/* General cancelled message */}
//           {isScheduleCancelled && !isUserAssignmentCancelled && (
//             <View style={styles.cancelledContainer}>
//               <Text style={styles.cancelledText}>
//                 {tSafe('job_cancelled_label', 'Job Cancelled')}
//               </Text>
//             </View>
//           )}

//           {/* Clock-In Button */}
//           {!isCancelled && canClockIn && (
//             <View style={styles.action}>
//               <ButtonPrimary
//                 title={tSafe('clock_in_button', 'Clock‑In')}
//                 onPress={() =>
//                   navigation.navigate(ROUTES.cleaner_clock_in, {
//                     scheduleId: item._id,
//                     schedule: item,
//                     cleaner: assignedToForCleaner,
//                   })
//                 }
//               />
//             </View>
//           )}

//           {/* Countdown / View Details */}
//           {!isCancelled && !canClockIn && countdownMessage && (
//             <>
//               <View style={styles.countdownContainer}>
//                 <Text style={styles.countdownText}>{countdownMessage}</Text>
//               </View>
//               <View style={styles.action}>
//                 <ButtonPrimary
//                   title={tSafe('view_details_button', 'View Details')}
//                   onPress={() =>
//                     navigation.navigate(ROUTES.cleaner_schedule_details_view, {
//                       item: item._id,
//                       scheduleId: item._id,
//                     })
//                   }
//                 />
//               </View>
//             </>
//           )}
//         </View>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   // ... (same styles, no changes needed)
//   container: {
//     flexDirection: 'row',
//     marginBottom: 0,
//     marginTop: 5,
//   },
//   dotline: {
//     flex: 0.05,
//     height: '100%',
//     alignItems: 'flex-start',
//   },
//   line: {
//     borderLeftWidth: 0.7,
//     borderLeftColor: COLORS.light_gray,
//     minHeight: 78,
//     marginHorizontal: 5,
//     marginVertical: 0,
//   },
//   date_time: {
//     flex: 0.25,
//     alignItems: 'flex-end',
//     marginRight: 5,
//   },
//   task: {
//     fontWeight: '500',
//   },
//   apartment: {
//     color: COLORS.gray,
//     fontSize: 13,
//   },
//   date: {
//     marginTop: -4,
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   time: {
//     marginTop: 4,
//     fontSize: 12,
//   },
//   task_details: {
//     flex: 0.7,
//     alignItems: 'flex-start',
//     width: '100%',
//     marginTop: -5,
//   },
//   dot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     marginBottom: 5,
//   },
//   dotActive: {
//     backgroundColor: '#4CAF50',
//   },
//   dotUpcoming: {
//     backgroundColor: COLORS.primary,
//   },
//   dotCancelled: {
//     backgroundColor: '#6c757d',
//   },
//   action: {
//     flexDirection: 'row',
//     justifyContent: 'space-evenly',
//     marginTop: -5,
//     marginBottom: 5,
//   },
//   userCancelledContainer: {
//     backgroundColor: '#fff3cd',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 6,
//     marginTop: 8,
//     borderWidth: 1,
//     borderColor: '#ffeaa7',
//   },
//   userCancelledText: {
//     color: '#856404',
//     fontWeight: '500',
//   },
//   cancelledContainer: {
//     backgroundColor: '#f8d7da',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 6,
//     marginTop: 8,
//     borderWidth: 1,
//     borderColor: '#f5c6cb',
//   },
//   cancelledText: {
//     color: '#721c24',
//     textDecorationLine: 'line-through',
//   },
//   countdownContainer: {
//     backgroundColor: '#FFF3CD',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 6,
//     marginTop: 8,
//     borderWidth: 1,
//     borderColor: '#FFEAA7',
//   },
//   countdownText: {
//     color: '#856404',
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   pastContainer: {
//     backgroundColor: '#F8D7DA',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 6,
//     marginTop: 8,
//     borderWidth: 1,
//     borderColor: '#F5C6CB',
//   },
//   pastText: {
//     color: '#721C24',
//     fontSize: 12,
//     fontWeight: '500',
//   },
// });

// export default UpcomingScheduleItem;


