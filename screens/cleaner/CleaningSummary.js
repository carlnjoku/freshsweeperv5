import React, { useState, useContext } from 'react';
import { View, StyleSheet, Modal, ScrollView, Dimensions } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import COLORS from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import GroupActions from '../../components/cleaner/GroupActions';
import { minutesToDuration } from '../../utils/minuteToDuration';

const { width } = Dimensions.get('window');

export default function CleaningSummary({ checklist, assignedTo, handleAccept }) {
  const { currency } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [acceptModalVisible, setAcceptModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  console.log("Checklistoooo", checklist)
  
  // Function to convert group names to appropriate labels
  const getGroupLabel = (groupKey, totalGroups) => {
    // If there's only one group, label it as "Full Cleaning"
    if (totalGroups === 1) {
      return 'Full Cleaning';
    }
    
    // For multiple groups, use Cleaner A, Cleaner B, etc.
    const groupNumber = groupKey.split('_')[1];
    switch (groupNumber) {
      case '1':
        return 'Cleaner A';
      case '2':
        return 'Cleaner B';
      case '3':
        return 'Cleaner C';
      case '4':
        return 'Cleaner D';
      default:
        return `Cleaner ${groupNumber}`;
    }
  };

  const processChecklistData = (checklist, assignedTo = []) => {
    try {
      const groups = [];
  
      if (!checklist || typeof checklist !== "object") {
        return groups;
      }
  
      const totalGroups = Object.keys(checklist).length;
  
      for (const groupKey in checklist) {
        if (!checklist.hasOwnProperty(groupKey)) continue;
  
        const group = checklist[groupKey];
        if (typeof group !== "object" || group === null) continue;
  
        const roomTypes = {};
        const rooms = Array.isArray(group.rooms) ? group.rooms : [];
        const details =
          typeof group.details === "object" && group.details !== null
            ? group.details
            : {};
  
        // Count rooms by type
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
  
          if (
            roomType !== "Extra" &&
            details[roomType] &&
            typeof details[roomType] === "object" &&
            Array.isArray(details[roomType].tasks)
          ) {
            taskCount += details[roomType].tasks.length;
          }
        }
  
        // Add extras if they exist
        if (
          details.Extra &&
          typeof details.Extra === "object" &&
          Array.isArray(details.Extra.tasks)
        ) {
          taskCount += details.Extra.tasks.filter(
            (task) => task && task.value
          ).length;
        }
  
        // 🔑 Find matching assignedTo entry by group name
        const assignedInfo = assignedTo.find((a) => a.group === groupKey) || {};
        groups.push({
          name: groupKey,
          groupLabel: getGroupLabel(groupKey, totalGroups),
          taskCount,
          roomCount: rooms.length,
          roomTypes,
          price: typeof group.price === "number" ? group.price : 0,
          extras: Array.isArray(group.extras) ? group.extras : [],
          details: details,
          totalTime: typeof group.totalTime === "number" ? group.totalTime : 0,
          rooms: rooms,
          // 🔑 Merge assignedTo info
          status: assignedInfo.status || "open",
          cleanerId: assignedInfo.cleanerId || null,
        });
      }
  
      return groups;
    } catch (error) {
      console.error("Error processing checklist data:", error);
      return [];
    }
  };



  const summaryData = processChecklistData(checklist, assignedTo);

  console.log("Summary data", JSON.stringify(summaryData, null, 2))
  console.log(assignedTo)

  const openModal = (group) => {
    setSelectedGroup(group);
    setModalVisible(true);
  };

  const openAcceptModal = (group) => {
    setSelectedGroup(group);
    setAcceptModalVisible(true);
  };

  const handleAcceptConfirm = (group) => {
    console.log('Accepted:', group.name);
    const acceptance = 1
    handleAccept(group, acceptance);
    setAcceptModalVisible(false);
  };


  const handleDecline = (group) => {
    console.log('Declined:', group.name);
    const acceptance = 0
    handleAccept(group, acceptance);
    // Add your decline logic here
  };

  // Content for Rules and Penalties Modal
  const renderRulesAndPenaltiesContent = () => (
    <ScrollView style={styles.rulesContent}>
      <Text style={styles.rulesTitle}>Terms & Conditions</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Professional Standards</Text>
        <Text style={styles.rulesText}>
          • Arrive 10-15 minutes before scheduled time{"\n"}
          • Wear provided uniform and ID badge{"\n"}
          • Bring all necessary cleaning equipment{"\n"}
          • Maintain professional conduct at all times
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⏰ Punctuality Policy</Text>
        <Text style={styles.rulesText}>
          • <Text style={styles.penaltyText}>Late arrival (1-15 mins):</Text> 10% pay deduction{"\n"}
          • <Text style={styles.penaltyText}>Late arrival (16-30 mins):</Text> 25% pay deduction{"\n"}
          • <Text style={styles.penaltyText}>Late arrival (30+ mins):</Text> Considered no-show
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>❌ No-Show Policy</Text>
        <Text style={styles.rulesText}>
          • <Text style={styles.penaltyText}>First no-show:</Text> $25 penalty + 1-week suspension{"\n"}
          • <Text style={styles.penaltyText}>Second no-show:</Text> $50 penalty + 2-week suspension{"\n"}
          • <Text style={styles.penaltyText}>Third no-show:</Text> Account deactivation
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔍 Quality Standards</Text>
        <Text style={styles.rulesText}>
          • All tasks must be completed as specified{"\n"}
          • Photos required for each completed room{"\n"}
          • Client has 2 hours to report quality issues{"\n"}
          • Poor quality may result in partial payment
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📞 Cancellation Policy</Text>
        <Text style={styles.rulesText}>
          • <Text style={styles.penaltyText}>Cancel 24+ hours before:</Text> No penalty{"\n"}
          • <Text style={styles.penaltyText}>Cancel 4-24 hours before:</Text> $15 penalty{"\n"}
          • <Text style={styles.penaltyText}>Cancel under 4 hours:</Text> $25 penalty
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Payment Terms</Text>
        <Text style={styles.rulesText}>
          • Payment released 24 hours after completion{"\n"}
          • Client disputes may delay payment{"\n"}
          • Damage claims investigated within 48 hours{"\n"}
          • Weekly payout every Friday
        </Text>
      </View>

      <View style={styles.agreementSection}>
        <Text style={styles.agreementText}>
          By clicking "I Agree & Accept", you acknowledge that you have read and agree to all terms and conditions outlined above.
        </Text>
      </View>
    </ScrollView>
  );

  const formatRoomTypes = (roomTypes) => {
    if (!roomTypes || typeof roomTypes !== 'object') return 'No rooms';
    
    return Object.entries(roomTypes)
      .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
      .join(', ');
  };

  const formatRoomCounts = (rooms) => {
    const roomCounts = {};
    rooms.forEach(room => {
      const roomType = room.split('_')[0];
      roomCounts[roomType] = (roomCounts[roomType] || 0) + 1;
    });
    
    return Object.entries(roomCounts)
      .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
      .join(', ');
  };

  const renderTaskItem = (task) => (
    <View key={task.id} style={styles.taskItem}>
      <MaterialIcons 
        name="fiber-manual-record" 
        size={10} 
        color={COLORS.primary} 
      />
      <Text style={styles.taskText}>{task.label}</Text>
    </View>
  );

  const renderRoomTasks = (roomData, roomType) => {
    const tasks = roomData.tasks || [];
    const halfIndex = Math.ceil(tasks.length / 2);
    const leftColumn = tasks.slice(0, halfIndex);
    const rightColumn = tasks.slice(halfIndex);
    
    return (
      <View style={styles.twoColumnContainer}>
        <View style={styles.column}>
          {leftColumn.map(task => renderTaskItem(task))}
        </View>
        <View style={styles.column}>
          {rightColumn.map(task => renderTaskItem(task))}
        </View>
      </View>
    );
  };

  const renderModalContent = () => {
    if (!selectedGroup) return null;
    
    return (
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {selectedGroup.groupLabel} - Details
          </Text>
          <Button 
            icon="close" 
            onPress={() => setModalVisible(false)}
            style={styles.closeButton}
          />
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.modalSection}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Time:</Text>
              <Text style={styles.infoValue}>
                {selectedGroup.totalTime} minutes
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Price:</Text>
              <Text style={styles.totalFee}>
                {currency}{selectedGroup.price.toFixed(2)}
              </Text>
            </View>
            
            <Text style={styles.sectionTitle}>Rooms & Tasks</Text>
            
            <View style={styles.groupContainer}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupTitle}>{selectedGroup.groupLabel}</Text>
                <View style={styles.groupPriceTime}>
                  <View style={styles.timeBadge}>
                    <Text style={styles.timeText}>
                      {selectedGroup.totalTime} mins
                    </Text>
                  </View>
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceText}>
                      {currency}{selectedGroup.price.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Rooms:</Text>
                <Text style={styles.infoValue}>
                  {formatRoomCounts(selectedGroup.rooms)}
                </Text>
              </View>

              {selectedGroup.extras && selectedGroup.extras.length > 0 && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Extras:</Text>
                  <Text style={styles.infoValue}>
                    {selectedGroup.extras.join(', ')}
                  </Text>
                </View>
              )}
              
              {Object.entries(selectedGroup.details).map(([roomType, roomData]) => {
                if (!roomData.tasks || !Array.isArray(roomData.tasks)) return null;
                
                return (
                  <View key={`${roomType}`} style={styles.roomTasks}>
                    <Text style={styles.roomTitle}>{roomType}:</Text>
                    {renderRoomTasks(roomData, roomType)}
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
        
        <View style={styles.modalFooter}>
          <Button 
            mode="contained" 
            onPress={() => {
              setModalVisible(false);
              openAcceptModal(selectedGroup);
            }}
            style={styles.modalActionButton}
          >
            Accept This Task
          </Button>
        </View>
      </View>
    );
  };

  if (summaryData.length === 0) {
    return (
      <View style={styles.emptyState}>
        <MaterialIcons name="cleaning-services" size={48} color={COLORS.gray} />
        <Text style={styles.emptyStateText}>No cleaning tasks available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Cleaning Tasks</Text>
      <Text style={styles.subheader}>
        {summaryData.length === 1 
          ? "Complete cleaning assignment" 
          : "Tasks have been assigned to different cleaners for efficiency"}
      </Text>
      
      {summaryData.map((item) => (
        <Card key={item.name} style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.groupName}>{item.groupLabel}</Text>
              <Text style={styles.price}>{currency}{item.price.toFixed(2)}</Text>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <MaterialIcons name="list" size={16} color={COLORS.primary} />
                <Text style={styles.statText}>{item.taskCount} tasks</Text>
              </View>
              <View style={styles.stat}>
                <MaterialIcons name="home" size={16} color={COLORS.primary} />
                <Text style={styles.statText}>{item.roomCount} rooms</Text>
              </View>
              <View style={styles.stat}>
                <MaterialIcons name="access-time" size={16} color={COLORS.primary} />
                <Text style={styles.statText}>{minutesToDuration(item.totalTime)} </Text>
              </View>
            </View>
            
            <Text style={styles.description}>
              Includes cleaning of {formatRoomTypes(item.roomTypes)}
              {item.extras.length > 0 ? `, plus ${item.extras.join(', ')}` : ''}.
            </Text>
            
            <View style={styles.buttonRow}>
              <GroupActions
                status={item?.status}
                onAccept={() => openAcceptModal(item)}
                onDecline={() => handleDecline(item)}
                onDetails={() => openModal(item)}
              />
            </View>
          </Card.Content>
        </Card>
      ))}
      
      {/* Details Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          {renderModalContent()}
        </View>
      </Modal>

      {/* Accept Rules Modal */}
      <Modal
        visible={acceptModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAcceptModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.rulesModalContainer}>
            <View style={styles.rulesModalHeader}>
              <Text style={styles.rulesModalTitle}>Accept Cleaning Task</Text>
              <Button 
                icon="close" 
                onPress={() => setAcceptModalVisible(false)}
                style={styles.closeButton}
              >
                Close
              </Button>
            </View>
            
            {renderRulesAndPenaltiesContent()}
            
            <View style={styles.rulesModalFooter}>
              <Button 
                mode="outlined" 
                onPress={() => setAcceptModalVisible(false)}
                style={[styles.rulesButton, styles.cancelButton]}
                labelStyle={styles.cancelButtonText}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={() => handleAcceptConfirm(selectedGroup)}
                style={[styles.rulesButton, styles.agreeButton]}
                labelStyle={styles.agreeButtonText}
              >
                I Agree & Accept
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
    elevation: 1,
    shadowColor: '#ddd',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
  },
  declineButton: {
    borderColor: COLORS.grayLight,
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  declineButtonText: {
    color: COLORS.gray,
    fontWeight: '600',
  },
  detailsButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.dark,
    flex: 1,
  },
  closeButton: {
    margin: -10,
  },
  modalContent: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: COLORS.dark,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: COLORS.gray,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.dark,
  },
  totalFee: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  groupContainer: {
    backgroundColor: '#f9f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  groupPriceTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeBadge: {
    backgroundColor: '#e6f2ff',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  priceBadge: {
    backgroundColor: '#e6f7e9',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.success,
  },
  roomTasks: {
    marginBottom: 16,
  },
  roomTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
    color: COLORS.primary,
  },
  twoColumnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  column: {
    width: '48%',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskText: {
    fontSize: 14,
    marginLeft: 8,
    color: COLORS.dark,
    flexShrink: 1,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalActionButton: {
    borderRadius: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primary
  },
  // Rules Modal Styles
  rulesModalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxHeight: '85%',
    overflow: 'hidden',
  },
  rulesModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rulesModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.dark,
    flex: 1,
  },
  rulesContent: {
    padding: 20,
    maxHeight: 400,
  },
  rulesTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  rulesText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.dark,
  },
  penaltyText: {
    fontWeight: '600',
    color: '#dc3545',
  },
  agreementSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#e7f3ff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  agreementText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.dark,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  rulesModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  rulesButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 6,
  },
  cancelButton: {
    borderColor: COLORS.gray,
  },
  cancelButtonText: {
    color: COLORS.gray,
    fontWeight: '600',
  },
  agreeButton: {
    backgroundColor: COLORS.primary,
  },
  agreeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});


