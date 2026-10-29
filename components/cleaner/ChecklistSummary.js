import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { minutesToDuration } from '../../utils/minuteToDuration';
import { tSafe } from '../../utils/tSafe';
import { useTheme } from '../../theme';
import AppText from '../../ui/AppText';
import AppCard from '../../ui/AppCard';

export default function CleaningSummary({ checklist, assignedTo }) {
  const { currency, currentUserId } = useContext(AuthContext);
  const { theme } = useTheme();

  const styles = createStyles(theme);

  console.log('CleaningSummary - checklist prop:', checklist);
  console.log('CleaningSummary - assignedTo:', assignedTo);
  console.log('CleaningSummary - currentUserId:', currentUserId);

  // Find the current user's assignment
  const currentUserAssignment = Array.isArray(assignedTo)
    ? assignedTo.find(
        (assignment) => assignment.cleanerId === currentUserId
      )
    : assignedTo;

  console.log(
    'CleaningSummary - currentUserAssignment:',
    currentUserAssignment
  );

  // If no assignment found for current user
  if (!currentUserAssignment) {
    return (
      <View style={styles.emptyState}>
        <MaterialIcons
          name="cleaning-services"
          size={48}
          color={theme.icon.muted}
        />

        <AppText style={styles.emptyStateText}>
          {tSafe(
            'no_cleaning_assignment_found',
            'No cleaning assignment found for you'
          )}
        </AppText>
      </View>
    );
  }

  // Get checklist data - prioritize the checklist from currentUserAssignment
  const getChecklistData = () => {
    // Use the checklist from currentUserAssignment if it exists
    if (currentUserAssignment.checklist) {
      console.log(
        'Using checklist from currentUserAssignment'
      );

      return currentUserAssignment.checklist;
    }

    // Fall back to the checklist prop if provided
    if (checklist) {
      console.log('Using checklist from prop');

      return checklist;
    }

    console.log('No checklist data found');

    return null;
  };

  const checklistData = getChecklistData();

  console.log(
    'CleaningSummary - checklistData:',
    checklistData
  );

  if (!checklistData) {
    return (
      <View style={styles.emptyState}>
        <MaterialIcons
          name="cleaning-services"
          size={48}
          color={theme.icon.muted}
        />

        <AppText style={styles.emptyStateText}>
          {tSafe(
            'no_checklist_data_available',
            'No checklist data available'
          )}
        </AppText>
      </View>
    );
  }

  // Helper to translate status
  const getStatusText = (status) => {
    const statusMap = {
      accepted: tSafe(
        'status_accepted',
        'Accepted'
      ),
      in_progress: tSafe(
        'status_in_progress',
        'In Progress'
      ),
      completed: tSafe(
        'status_completed',
        'Completed'
      ),
      payment_confirmed: tSafe(
        'status_payment_confirmed',
        'Payment Confirmed'
      ),
      cancelled: tSafe(
        'status_cancelled',
        'Cancelled'
      ),
      pending: tSafe(
        'status_pending',
        'Pending'
      ),
    };

    return (
      statusMap[status] ||
      (status
        ? status.charAt(0).toUpperCase() +
          status.slice(1)
        : tSafe('status_unknown', 'Unknown'))
    );
  };

  // Process the checklist data for display
  const processChecklistData = () => {
    const rooms = Array.isArray(checklistData.rooms)
      ? checklistData.rooms
      : [];

    const details = checklistData.details || {};

    const extras = Array.isArray(checklistData.extras)
      ? checklistData.extras
      : [];

    // Count rooms by type
    const roomTypes = {};

    rooms.forEach((room) => {
      if (typeof room === 'string') {
        const roomType = room.split('_')[0];

        roomTypes[roomType] =
          (roomTypes[roomType] || 0) + 1;
      }
    });

    // Count total tasks
    let taskCount = 0;

    for (const roomType in details) {
      if (!Object.prototype.hasOwnProperty.call(details, roomType)) {
        continue;
      }

      const roomTasks = details[roomType];

      if (Array.isArray(roomTasks)) {
        taskCount += roomTasks.length;
      } else if (
        roomTasks &&
        Array.isArray(roomTasks.tasks)
      ) {
        taskCount += roomTasks.tasks.length;
      }
    }

    return {
      groupLabel: tSafe(
        'your_cleaning_assignment',
        'Your Cleaning Assignment'
      ),
      taskCount,
      roomCount: rooms.length,
      roomTypes,
      price:
        typeof checklistData.price === 'number'
          ? checklistData.price
          : 0,
      extras,
      totalTime:
        typeof checklistData.totalTime === 'number'
          ? checklistData.totalTime
          : 0,
      status:
        currentUserAssignment.status || 'open',
      rooms,
      details,
    };
  };

  const assignmentData = processChecklistData();

  console.log(
    'CleaningSummary - assignmentData:',
    assignmentData
  );

  const formatRoomTypes = (roomTypes) => {
    if (
      !roomTypes ||
      typeof roomTypes !== 'object' ||
      Object.keys(roomTypes).length === 0
    ) {
      return tSafe(
        'no_rooms_specified',
        'No rooms specified'
      );
    }

    return Object.entries(roomTypes)
      .map(
        ([type, count]) =>
          `${count} ${type}${count > 1 ? 's' : ''}`
      )
      .join(', ');
  };

  const getStatusColor = () => {
    switch (currentUserAssignment.status) {
      case 'accepted':
        return theme.status.success;

      case 'in_progress':
        return theme.status.info;

      case 'completed':
        return theme.status.success;

      case 'payment_confirmed':
        return theme.status.success;

      case 'cancelled':
        return theme.status.error;

      default:
        return theme.status.warning;
    }
  };

  return (
    <View style={styles.container}>
      <AppText
        variant="title"
        style={styles.header}
      >
        {tSafe(
          'your_cleaning_assignment_title',
          'Your Cleaning Assignment'
        )}
      </AppText>

      <AppText style={styles.subheader}>
        {tSafe(
          'tasks_and_requirements',
          'Tasks and requirements for your cleaning assignment'
        )}
      </AppText>

      <AppCard
        variant="bordered"
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerInfo}>
            <AppText
              variant="body"
              style={styles.groupName}
            >
              {assignmentData.groupLabel}
            </AppText>

            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      getStatusColor(),
                  },
                ]}
              />

              <AppText style={styles.statusText}>
                {tSafe('status_label', 'Status:')}{' '}
                {getStatusText(
                  currentUserAssignment.status
                )}
              </AppText>
            </View>
          </View>

          <AppText
            variant="body"
            style={styles.price}
          >
            {currency}
            {assignmentData.price.toFixed(2)}
          </AppText>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <MaterialIcons
              name="list"
              size={16}
              color={theme.brand.primary}
            />

            <AppText style={styles.statText}>
              {assignmentData.taskCount}{' '}
              {tSafe('tasks', 'tasks')}
            </AppText>
          </View>

          <View style={styles.stat}>
            <MaterialIcons
              name="home"
              size={16}
              color={theme.brand.primary}
            />

            <AppText style={styles.statText}>
              {assignmentData.roomCount}{' '}
              {tSafe('rooms', 'rooms')}
            </AppText>
          </View>

          <View style={styles.stat}>
            <MaterialIcons
              name="access-time"
              size={16}
              color={theme.brand.primary}
            />

            <AppText style={styles.statText}>
              {minutesToDuration(
                assignmentData.totalTime
              )}
            </AppText>
          </View>
        </View>

        <AppText style={styles.description}>
          {tSafe(
            'includes_cleaning_of',
            'Includes cleaning of'
          )}{' '}
          {formatRoomTypes(
            assignmentData.roomTypes
          )}
          {assignmentData.extras.length > 0
            ? `${tSafe('plus', ', plus')} ${assignmentData.extras.join(
                ', '
              )}`
            : ''}
          .
        </AppText>

        {/* Additional details section */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <MaterialIcons
              name="assignment"
              size={16}
              color={theme.icon.muted}
            />

            <AppText style={styles.detailLabel}>
              {tSafe(
                'total_tasks',
                'Total Tasks:'
              )}
            </AppText>

            <AppText style={styles.detailValue}>
              {assignmentData.taskCount}
            </AppText>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons
              name="location-on"
              size={16}
              color={theme.icon.muted}
            />

            <AppText style={styles.detailLabel}>
              {tSafe('rooms_label', 'Rooms:')}
            </AppText>

            <AppText style={styles.detailValue}>
              {assignmentData.roomCount}
            </AppText>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons
              name="schedule"
              size={16}
              color={theme.icon.muted}
            />

            <AppText style={styles.detailLabel}>
              {tSafe(
                'estimated_time',
                'Estimated Time:'
              )}
            </AppText>

            <AppText style={styles.detailValue}>
              {minutesToDuration(
                assignmentData.totalTime
              )}
            </AppText>
          </View>

          {assignmentData.extras.length > 0 && (
            <View style={styles.detailRow}>
              <MaterialIcons
                name="add-circle"
                size={16}
                color={theme.icon.muted}
              />

              <AppText style={styles.detailLabel}>
                {tSafe(
                  'extra_services',
                  'Extra Services:'
                )}
              </AppText>

              <AppText
                style={styles.detailValue}
                numberOfLines={2}
              >
                {assignmentData.extras.join(', ')}
              </AppText>
            </View>
          )}
        </View>

        {/* Progress section */}
        {currentUserAssignment.progress && (
          <View style={styles.progressSection}>
            <AppText
              variant="body"
              style={styles.progressTitle}
            >
              {tSafe('progress', 'Progress')}
            </AppText>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(
                      Math.max(
                        currentUserAssignment
                          .progress
                          .percentage || 0,
                        0
                      ),
                      100
                    )}%`,
                  },
                ]}
              />
            </View>

            <AppText style={styles.progressText}>
              {currentUserAssignment.progress
                .completedTasks || 0}{' '}
              {tSafe('of', 'of')}{' '}
              {currentUserAssignment.progress
                .totalTasks || 0}{' '}
              {tSafe(
                'tasks_completed',
                'tasks completed'
              )}
            </AppText>
          </View>
        )}
      </AppCard>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 1,
      backgroundColor: theme.background.default,
    },

    header: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 4,
      color: theme.text.primary,
    },

    subheader: {
      fontSize: 14,
      marginBottom: 20,
      color: theme.text.secondary,
      lineHeight: 20,
    },

    card: {
      marginBottom: 16,
      borderRadius: 12,
      backgroundColor: theme.card.background,
      borderColor: theme.card.border,
    },

    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },

    headerInfo: {
      flex: 1,
      paddingRight: 12,
    },

    groupName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 8,
    },

    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
    },

    statusText: {
      fontSize: 14,
      color: theme.text.secondary,
      fontWeight: '500',
    },

    price: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.brand.primary,
    },

    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
      paddingHorizontal: 4,
    },

    stat: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
    },

    statText: {
      marginLeft: 6,
      fontSize: 14,
      color: theme.text.secondary,
    },

    description: {
      fontSize: 14,
      color: theme.text.primary,
      marginBottom: 20,
      lineHeight: 20,
    },

    detailsSection: {
      backgroundColor: theme.background.sunken,
      borderRadius: 8,
      padding: 16,
      marginTop: 8,
    },

    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },

    detailLabel: {
      fontSize: 14,
      color: theme.text.secondary,
      marginLeft: 8,
      marginRight: 'auto',
      fontWeight: '500',
    },

    detailValue: {
      fontSize: 14,
      color: theme.text.primary,
      fontWeight: '600',
      maxWidth: '45%',
      textAlign: 'right',
    },

    progressSection: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },

    progressTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 8,
    },

    progressBar: {
      height: 8,
      backgroundColor: theme.background.sunken,
      borderRadius: 4,
      marginBottom: 8,
      overflow: 'hidden',
    },

    progressFill: {
      height: '100%',
      backgroundColor: theme.brand.primary,
      borderRadius: 4,
    },

    progressText: {
      fontSize: 14,
      color: theme.text.secondary,
      textAlign: 'center',
    },

    emptyState: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      backgroundColor: theme.surface.elevated,
      borderRadius: 12,
      marginVertical: 16,
      borderWidth: 1,
      borderColor: theme.card.border,
    },

    emptyStateText: {
      fontSize: 16,
      color: theme.text.secondary,
      marginTop: 16,
      textAlign: 'center',
      fontWeight: '600',
    },
  });