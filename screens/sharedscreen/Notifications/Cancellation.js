import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';

const CancellationDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { bookingId, notificationId } = route.params || {};

  const [cancellationData, setCancellationData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchCancellationDetails = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setCancellationData({
            id: bookingId || '12345',
            bookingDate: '2024-01-20T14:00:00Z',
            cancelledAt: '2024-01-18T10:30:00Z',
            cancelledBy: 'cleaner', // 'host' or 'cleaner'
            cancelledByName: 'John Cleaner',
            reason: 'Schedule conflict',
            detailedReason: 'Unexpected family emergency requires me to be out of town.',
            refundStatus: 'processed', // 'pending', 'processed', 'none'
            refundAmount: 85.00,
            serviceType: 'Deep Cleaning',
            duration: '2 hours',
            address: '123 Main St, New York, NY',
            originalPrice: 85.00,
            cancellationFee: 0.00,
            policy: 'Cancelled more than 24 hours in advance - full refund',
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        Alert.alert('Error', 'Failed to load cancellation details');
        setLoading(false);
      }
    };

    fetchCancellationDetails();
  }, [bookingId]);

  const getStatusColor = (status) => {
    const colorMap = {
      processed: '#34C759',
      pending: '#FF9500',
      none: '#8E8E93',
    };
    return colorMap[status] || '#8E8E93';
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      processed: 'check-circle',
      pending: 'clock-outline',
      none: 'cancel',
    };
    return iconMap[status] || 'help-circle';
  };

  const handleReorder = () => {
    Alert.alert(
      'Reorder Service',
      'Would you like to book a new cleaning service?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Book Now', 
          onPress: () => navigation.navigate('Booking', { 
            previousBooking: cancellationData 
          })
        },
      ]
    );
  };

  const handleContactSupport = () => {
    // In a real app, this would open email or chat
    Alert.alert('Contact Support', 'Customer support will be happy to assist you.');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="refresh" size={48} color="#007AFF" />
        <Text style={styles.loadingText}>Loading cancellation details...</Text>
      </View>
    );
  }

  if (!cancellationData) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={64} color="#FF3B30" />
        <Text style={styles.errorText}>Cancellation details not found</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cancellation Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <MaterialCommunityIcons
                name={getStatusIcon(cancellationData.refundStatus)}
                size={32}
                color={getStatusColor(cancellationData.refundStatus)}
              />
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitle}>Booking Cancelled</Text>
                <Text style={styles.statusSubtitle}>
                  {cancellationData.refundStatus === 'processed' 
                    ? 'Refund processed successfully' 
                    : cancellationData.refundStatus === 'pending'
                    ? 'Refund pending processing'
                    : 'No refund applicable'
                  }
                </Text>
              </View>
            </View>
          </View>

          {/* Cancellation Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cancellation Information</Text>
            
            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <MaterialCommunityIcons name="calendar" size={16} color="#666" />
                <Text style={styles.detailLabel}>Original Booking</Text>
              </View>
              <Text style={styles.detailValue}>
                {new Date(cancellationData.bookingDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
                <Text style={styles.detailLabel}>Cancelled On</Text>
              </View>
              <Text style={styles.detailValue}>
                {new Date(cancellationData.cancelledAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <MaterialCommunityIcons name="account" size={16} color="#666" />
                <Text style={styles.detailLabel}>Cancelled By</Text>
              </View>
              <Text style={styles.detailValue}>
                {cancellationData.cancelledByName}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <MaterialCommunityIcons name="comment-outline" size={16} color="#666" />
                <Text style={styles.detailLabel}>Reason</Text>
              </View>
              <Text style={styles.detailValue}>
                {cancellationData.reason}
              </Text>
            </View>
          </View>

          {/* Service Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Details</Text>
            
            <View style={styles.serviceCard}>
              <MaterialCommunityIcons name="broom" size={20} color="#007AFF" />
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceType}>{cancellationData.serviceType}</Text>
                <Text style={styles.serviceDetails}>
                  {cancellationData.duration} • {cancellationData.address}
                </Text>
              </View>
            </View>
          </View>

          {/* Payment Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            
            <View style={styles.paymentCard}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Original Price</Text>
                <Text style={styles.paymentValue}>
                  ${cancellationData.originalPrice.toFixed(2)}
                </Text>
              </View>
              
              {cancellationData.cancellationFee > 0 && (
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Cancellation Fee</Text>
                  <Text style={styles.paymentValue}>
                    -${cancellationData.cancellationFee.toFixed(2)}
                  </Text>
                </View>
              )}
              
              {cancellationData.refundAmount > 0 && (
                <View style={[styles.paymentRow, styles.refundRow]}>
                  <Text style={styles.refundLabel}>Refund Amount</Text>
                  <Text style={styles.refundValue}>
                    ${cancellationData.refundAmount.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.policyNote}>
              <MaterialCommunityIcons name="information-outline" size={16} color="#007AFF" />
              <Text style={styles.policyText}>{cancellationData.policy}</Text>
            </View>
          </View>

          {/* Additional Notes */}
          {cancellationData.detailedReason && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Notes</Text>
              <View style={styles.notesCard}>
                <Text style={styles.notesText}>
                  {cancellationData.detailedReason}
                </Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleReorder}
            >
              <MaterialCommunityIcons name="calendar-plus" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Book New Service</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleContactSupport}
            >
              <MaterialCommunityIcons name="help-circle" size={20} color="#007AFF" />
              <Text style={styles.secondaryButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  serviceInfo: {
    marginLeft: 12,
    flex: 1,
  },
  serviceType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  serviceDetails: {
    fontSize: 14,
    color: '#666',
  },
  paymentCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  refundRow: {
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    marginTop: 8,
    paddingTop: 12,
  },
  refundLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
  },
  refundValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34C759',
  },
  policyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#E7F3FF',
    borderRadius: 8,
  },
  policyText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  notesCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButtons: {
    marginTop: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default CancellationDetails;