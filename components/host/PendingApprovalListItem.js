import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Image, 
  Text, 
  Keyboard,
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback,
  Animated,
  Dimensions
} from 'react-native';
import COLORS from '../../constants/colors';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';
import userService from '../../services/connection/userService';
import moment from 'moment';
import FeedbackModal from '../shared/Feedback';
import ROUTES from '../../constants/routes';

const { width } = Dimensions.get('window');

const PendingApprovalListItem = ({ item, hostId, onStatusUpdate }) => {
  const [isFeedbackVisible, setFeedbackVisible] = useState(false);
  const [currentFeedbackTo, setCurrentFeedbackTo] = useState("");
  const [currentFeedbackToEmail, setCurrentFeedbackToEmail] = useState("");
  const [currentScheduleId, setCurrentScheduleId] = useState(null);
  const [isInputFocused, setInputFocused] = useState(false);
  const [approvedCleaners, setApprovedCleaners] = useState(new Set());
  const [expanded, setExpanded] = useState(false);
  
  const navigation = useNavigation();
  


  // ✅ Find the first pending cleaner
  const pendingCleaner = item.assignedTo?.find(c => c.status === "pending_review");
  const cleanerId = pendingCleaner?.cleanerId || item.assignedTo?.[0]?.cleanerId;
  const cleanerName = pendingCleaner 
    ? `${pendingCleaner.firstname} ${pendingCleaner.lastname}` 
    : item.assignedTo?.[0]?.firstname || '';

  

  
  const handleUpdateApproved = async (schId, cleanerId, fee) => {
    try {
      const data = { scheduleId: schId, cleanerId: cleanerId, hostId: hostId, fee: fee };
      const response = await userService.updateApproved(data);
      return response;
    } catch (error) {
      console.error("Error updating approval:", error);
      throw error;
    }
  };

  const handleApproveCleaner = async (scheduleId, cleanerId, fee) => {
    try {
      Alert.alert(
        "Confirm Approval",
        "Approve this cleaner's work and release payment?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Approve",
            onPress: async () => {
              try {
                await handleUpdateApproved(scheduleId, cleanerId, fee);
                setApprovedCleaners(prev => new Set(prev).add(cleanerId));
                
                const cleaner = item.assignedTo.find(c => c.cleanerId === cleanerId);
                if (cleaner) {
                  setCurrentFeedbackTo(cleanerId);
                  setCurrentFeedbackToEmail(cleaner.email || "");
                  setCurrentScheduleId(scheduleId);
                  setFeedbackVisible(true);
                }
                
                checkAllCleanersApproved();
              } catch (error) {
                Alert.alert("Error", "Failed to approve cleaner");
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to approve cleaner");
    }
  };
  
  const handleRejectCleaner = (scheduleId, cleanerId) => {
    Alert.alert(
      "Request Changes",
      "Request changes to this cleaner's work?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Request",
          onPress: () => {
            console.log("❌ Reject cleaner:", cleanerId, "for schedule:", scheduleId);
          },
        },
      ]
    );
  };

  const checkAllCleanersApproved = () => {
    const pendingApprovalCleaners = item.assignedTo.filter(cleaner => 
      cleaner.status === "pending_reviewl" && !approvedCleaners.has(cleaner.cleanerId)
    );
    
    if (pendingApprovalCleaners.length === 0) {
      onStatusUpdate?.(item._id, 'approved');
    }
  };

  const handleFeedbackSubmit = async (feedback) => {
    try {
      const data = { 
        scheduleId: currentScheduleId, 
        cleanerId: currentFeedbackTo, 
        email: currentFeedbackToEmail,
        created_on: new Date(),
        ...feedback 
      };
      const response = await userService.sendFeedback(data);
      Alert.alert("Thank You", "Your feedback has been submitted!");
      setFeedbackVisible(false);
    } catch (error) {
      Alert.alert("Error", "Failed to send feedback. Please try again.");
    }
  };

  const formatName = (firstName, lastName) => {
    const first = firstName?.charAt(0).toUpperCase() || '';
    const last = lastName?.charAt(0).toUpperCase() || '';
    return `${first}${last}`;
  };

  const formatCurrency = (amount) => {
    return `$${amount?.toFixed(2) || '0.00'}`;
  };

  const getStatusColor = (status, isApproved) => {
    if (isApproved) return '#34C759';
    if (status === "pending_review") return '#FF9500';
    return '#8E8E93';
  };

  const renderCleanerItem = (cleaner, index) => {
    const isPendingApproval = cleaner.status === "pending_review";
    const isApproved = approvedCleaners.has(cleaner.cleanerId);
    const statusColor = getStatusColor(cleaner.status, isApproved);
    
    return (
      <View key={cleaner.cleanerId} style={styles.cleanerCard}>
        <View style={styles.cleanerHeader}>
          <View style={styles.cleanerAvatarContainer}>
            {cleaner.avatar ? (
              <Image source={{ uri: cleaner.avatar }} style={styles.cleanerAvatar} />
            ) : (
              <View style={[styles.cleanerAvatar, styles.avatarFallback]}>
                <Text style={styles.avatarText}>
                  {formatName(cleaner.firstname, cleaner.lastname)}
                </Text>
              </View>
            )}
            <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
          </View>
          
          <View style={styles.cleanerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.cleanerName}>
                {cleaner.firstname} {cleaner.lastname}
              </Text>
              <Text style={styles.cleanerFee}>{formatCurrency(cleaner.fee || 0)}</Text>
            </View>
            <Text style={styles.cleanerPhone}>{cleaner.phone}</Text>
          </View>
        </View>

        {/* <View style={styles.cleanerFooter}>
          {isPendingApproval && !isApproved ? (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleApproveCleaner(item._id, cleaner.cleanerId, cleaner.fee)}
              >
                <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />
                <Text style={styles.approveButtonText}>Approve</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleRejectCleaner(item._id, cleaner.cleanerId)}
              >
                <MaterialCommunityIcons name="close" size={14} color="#FF3B30" />
                <Text style={styles.rejectButtonText}>Request Changes</Text>
              </TouchableOpacity>
            </View>
          ) : isApproved ? (
            <View style={styles.approvedContainer}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#34C759" />
              <Text style={styles.approvedText}>Approved</Text>
            </View>
          ) : (
            <View style={styles.statusContainer}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {cleaner.status || 'Assigned'}
              </Text>
            </View>
          )}
        </View> */}
      </View>
    );
  };

  const pendingApprovalCount = item.assignedTo?.filter(cleaner => 
    cleaner.status === "pending_review" && !approvedCleaners.has(cleaner.cleanerId)
  ).length || 0;

  const totalCleaners = item.assignedTo?.length || 0;

  return (
    <TouchableOpacity 
      style={styles.container}
      activeOpacity={0.9}
      onPress={() => setExpanded(!expanded)}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[
            styles.iconContainer, 
            pendingApprovalCount > 0 ? styles.iconPending : styles.iconComplete
          ]}>
            <MaterialCommunityIcons 
              name={pendingApprovalCount > 0 ? "clock-alert-outline" : "check-decagram"} 
              size={20} 
              color={pendingApprovalCount > 0 ? '#FF9500' : '#34C759'} 
            />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{item.schedule?.apartment_name}</Text>
            <Text style={styles.subtitle}>{item.schedule?.address}</Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <View style={[
            styles.countBadge,
            pendingApprovalCount > 0 ? styles.countBadgePending : styles.countBadgeComplete
          ]}>
            <Text style={[
              styles.countText,
              pendingApprovalCount > 0 ? styles.countTextPending : styles.countTextComplete
            ]}>
              {pendingApprovalCount} pending
            </Text>
          </View>
          <MaterialCommunityIcons 
            name={expanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#8E8E93" 
          />
        </View>
      </View>

      {/* Progress Bar */}
      {pendingApprovalCount > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { 
                width: `${((totalCleaners - pendingApprovalCount) / totalCleaners) * 100}%` 
              }]} 
            />
          </View>
        </View>
      )}

      {/* Date */}
      <Text style={styles.date}>
        {/* {moment(item.cleaning_date).format("ddd, MMM D • h:mm A")} */}
      </Text>

      {/* Expanded Content */}
      {expanded && (
        <Animated.View style={styles.expandedContent}>
          <View style={styles.divider} />
          
          <View style={styles.cleanersSection}>
            <Text style={styles.sectionTitle}>
              {pendingApprovalCount > 0 ? 'Review Required' : 'All Approved'}
            </Text>
            {Array.isArray(item.assignedTo) && item.assignedTo.length > 0 ? (
              <View style={styles.cleanersList}>
                {item.assignedTo.map(renderCleanerItem)}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="account-group" size={32} color="#D1D1D6" />
                <Text style={styles.emptyText}>No cleaners assigned</Text>
              </View>
            )}
          </View>

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.detailsButton}
              // onPress={() => navigation.navigate('ScheduleDetails', { scheduleId: item._id })}
              onPress={() => navigation.navigate(ROUTES.host_task_progress, {
                scheduleId: item._id,
                // schedule: item,
                // mode:"in_progress"
                cleanerId:cleanerId,
                mode:"review"
              })}
            >
              <MaterialCommunityIcons name="file-document-outline" size={14} color="#666" />
              <Text style={styles.detailsButtonText}>View Details {item.cleanerId}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.supportButton}
              onPress={() => navigation.navigate('Support')}
            >
              <MaterialCommunityIcons name="headphones" size={14} color={COLORS.primary} />
              <Text style={styles.supportButtonText}>Help</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Feedback Modal */}
      <Modal
        isVisible={isFeedbackVisible}
        onBackdropPress={() => {
          if (!isInputFocused) setFeedbackVisible(false);
        }}
        backdropOpacity={0.5}
        animationIn="fadeIn"
        animationOut="fadeOut"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <FeedbackModal
              onSubmit={handleFeedbackSubmit}
              feedbackTo={currentFeedbackTo}
              onInputFocus={() => setInputFocused(true)}
              onInputBlur={() => setInputFocused(false)}
              onClose={() => setFeedbackVisible(false)}
            />
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 1,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconPending: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
  },
  iconComplete: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  date: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    marginTop: 4,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgePending: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
  },
  countBadgeComplete: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
  },
  countTextPending: {
    color: '#FF9500',
  },
  countTextComplete: {
    color: '#34C759',
  },
  progressContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 2,
  },
  expandedContent: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 16,
  },
  cleanersSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  cleanersList: {
    gap: 12,
  },
  cleanerCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cleanerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cleanerAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  cleanerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarFallback: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cleanerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  cleanerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  cleanerFee: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  cleanerPhone: {
    fontSize: 12,
    color: '#8E8E93',
  },
  cleanerFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
    minHeight: 32,
  },
  approveButton: {
    backgroundColor: '#34C759',
  },
  rejectButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  approveButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rejectButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF3B30',
  },
  approvedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.08)',
    padding: 8,
    borderRadius: 8,
    gap: 6,
  },
  approvedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  statusContainer: {
    alignItems: 'center',
    padding: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F9F9FB',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    gap: 6,
  },
  detailsButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  supportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: 'rgba(25, 118, 210, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(25, 118, 210, 0.2)',
    gap: 6,
  },
  supportButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
});

export default PendingApprovalListItem;