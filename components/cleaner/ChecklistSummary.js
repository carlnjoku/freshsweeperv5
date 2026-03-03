import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import COLORS from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { minutesToDuration } from '../../utils/minuteToDuration';

export default function CleaningSummary({ checklist, assignedTo }) {
  const { currency, currentUserId } = useContext(AuthContext);

  console.log("CleaningSummary - checklist prop:", checklist);
  console.log("CleaningSummary - assignedTo:", assignedTo);
  console.log("CleaningSummary - currentUserId:", currentUserId);

  // Find the current user's assignment
  const currentUserAssignment = Array.isArray(assignedTo) 
    ? assignedTo.find(assignment => assignment.cleanerId === currentUserId)
    : assignedTo; // In case it's passed as single object like [currentCleanerAssignment]

  console.log("CleaningSummary - currentUserAssignment:", currentUserAssignment);

  // If no assignment found for current user
  if (!currentUserAssignment) {
    return (
      <View style={styles.emptyState}>
        <MaterialIcons name="cleaning-services" size={48} color={COLORS.gray} />
        <Text style={styles.emptyStateText}>No cleaning assignment found for you</Text>
      </View>
    );
  }

  // Get checklist data - prioritize the checklist from currentUserAssignment
  const getChecklistData = () => {
    // Use the checklist from currentUserAssignment if it exists
    if (currentUserAssignment.checklist) {
      console.log("Using checklist from currentUserAssignment");
      return currentUserAssignment.checklist;
    }
    
    // Fall back to the checklist prop if provided
    if (checklist) {
      console.log("Using checklist from prop");
      return checklist;
    }
    
    console.log("No checklist data found");
    return null;
  };

  const checklistData = getChecklistData();
  console.log("CleaningSummary - checklistData:", checklistData);

  if (!checklistData) {
    return (
      <View style={styles.emptyState}>
        <MaterialIcons name="cleaning-services" size={48} color={COLORS.gray} />
        <Text style={styles.emptyStateText}>No checklist data available</Text>
      </View>
    );
  }

  // Process the checklist data for display
  const processChecklistData = () => {
    const rooms = Array.isArray(checklistData.rooms) ? checklistData.rooms : [];
    const details = checklistData.details || {};
    const extras = Array.isArray(checklistData.extras) ? checklistData.extras : [];

    // Count rooms by type
    const roomTypes = {};
    rooms.forEach((room) => {
      if (typeof room === "string") {
        const roomType = room.split("_")[0];
        roomTypes[roomType] = (roomTypes[roomType] || 0) + 1;
      }
    });

    // Count total tasks
    let taskCount = 0;
    for (const roomType in details) {
      if (!details.hasOwnProperty(roomType)) continue;

      const roomTasks = details[roomType];
      if (Array.isArray(roomTasks)) {
        taskCount += roomTasks.length;
      } else if (roomTasks && Array.isArray(roomTasks.tasks)) {
        taskCount += roomTasks.tasks.length;
      }
    }

    return {
      groupLabel: 'Your Cleaning Assignment',
      taskCount,
      roomCount: rooms.length,
      roomTypes,
      price: typeof checklistData.price === "number" ? checklistData.price : 0,
      extras: extras,
      totalTime: typeof checklistData.totalTime === "number" ? checklistData.totalTime : 0,
      status: currentUserAssignment.status || "open",
      rooms: rooms,
      details: details,
    };
  };

  const assignmentData = processChecklistData();
  console.log("CleaningSummary - assignmentData:", assignmentData);

  const formatRoomTypes = (roomTypes) => {
    if (!roomTypes || typeof roomTypes !== 'object' || Object.keys(roomTypes).length === 0) {
      return 'No rooms specified';
    }
    
    return Object.entries(roomTypes)
      .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
      .join(', ');
  };

  const getStatusColor = () => {
    switch(currentUserAssignment.status) {
      case 'accepted': return '#34C759';
      case 'in_progress': return COLORS.primary;
      case 'completed': return '#34C759';
      case 'payment_confirmed': return '#34C759';
      case 'cancelled': return '#DC3545';
      default: return '#FF9500';
    }
  };

  const getStatusText = () => {
    switch(currentUserAssignment.status) {
      case 'accepted': return 'Accepted';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'payment_confirmed': return 'Payment Confirmed';
      case 'cancelled': return 'Cancelled';
      default: return 'Pending';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Cleaning Assignment</Text>
      <Text style={styles.subheader}>
        Tasks and requirements for your cleaning assignment
      </Text>
      
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.groupName}>{assignmentData.groupLabel}</Text>
              <View style={styles.statusContainer}>
                <View 
                  style={[
                    styles.statusDot, 
                    { backgroundColor: getStatusColor() }
                  ]} 
                />
                <Text style={styles.statusText}>
                  Status: {getStatusText()}
                </Text>
              </View>
            </View>
            <Text style={styles.price}>{currency}{assignmentData.price.toFixed(2)}</Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <MaterialIcons name="list" size={16} color={COLORS.primary} />
              <Text style={styles.statText}>{assignmentData.taskCount} tasks</Text>
            </View>
            <View style={styles.stat}>
              <MaterialIcons name="home" size={16} color={COLORS.primary} />
              <Text style={styles.statText}>{assignmentData.roomCount} rooms</Text>
            </View>
            <View style={styles.stat}>
              <MaterialIcons name="access-time" size={16} color={COLORS.primary} />
              <Text style={styles.statText}>{minutesToDuration(assignmentData.totalTime)}</Text>
            </View>
          </View>
          
          <Text style={styles.description}>
            Includes cleaning of {formatRoomTypes(assignmentData.roomTypes)}
            {assignmentData.extras.length > 0 ? `, plus ${assignmentData.extras.join(', ')}` : ''}.
          </Text>

          {/* Additional details section */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <MaterialIcons name="assignment" size={16} color={COLORS.gray} />
              <Text style={styles.detailLabel}>Total Tasks:</Text>
              <Text style={styles.detailValue}>{assignmentData.taskCount}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <MaterialIcons name="location-on" size={16} color={COLORS.gray} />
              <Text style={styles.detailLabel}>Rooms:</Text>
              <Text style={styles.detailValue}>{assignmentData.roomCount}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <MaterialIcons name="schedule" size={16} color={COLORS.gray} />
              <Text style={styles.detailLabel}>Estimated Time:</Text>
              <Text style={styles.detailValue}>{minutesToDuration(assignmentData.totalTime)}</Text>
            </View>
            
            {assignmentData.extras.length > 0 && (
              <View style={styles.detailRow}>
                <MaterialIcons name="add-circle" size={16} color={COLORS.gray} />
                <Text style={styles.detailLabel}>Extra Services:</Text>
                <Text style={styles.detailValue}>{assignmentData.extras.join(', ')}</Text>
              </View>
            )}
          </View>

          {/* Progress section */}
          {currentUserAssignment.progress && (
            <View style={styles.progressSection}>
              <Text style={styles.progressTitle}>Progress</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${currentUserAssignment.progress.percentage || 0}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {currentUserAssignment.progress.completedTasks || 0} of {currentUserAssignment.progress.totalTasks || 0} tasks completed
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    color: COLORS.dark,
  },
  subheader: {
    fontSize: 14,
    marginBottom: 20,
    color: COLORS.gray,
    lineHeight: 20,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
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
    color: COLORS.gray,
    fontWeight: '500',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
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
  },
  statText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.gray,
  },
  description: {
    fontSize: 14,
    color: COLORS.dark,
    marginBottom: 20,
    lineHeight: 20,
  },
  detailsSection: {
    backgroundColor: '#f8f9fa',
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
    color: COLORS.gray,
    marginLeft: 8,
    marginRight: 'auto',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '600',
  },
  progressSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e5e5',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginVertical: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
});