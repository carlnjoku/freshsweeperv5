// components/cleaner/EarningsBreakdownCard.js
// components/cleaner/EarningsBreakdownCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import { minutesToDuration } from '../../utils/minuteToDuration';

const EarningsBreakdownCard = ({ earningsData, currentCleanerId }) => {
  if (!earningsData || earningsData.breakdown.length === 0) {
    return null;
  }

  // Helper function to format status
  const formatStatus = (status) => {
    const statusMap = {
      'payment_confirmed': 'Payment Confirmed',
      'in_progress': 'In Progress',
      'upcoming': 'Upcoming',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'pending': 'Pending'
    };
    return statusMap[status] || status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Helper function to format group
  const formatGroup = (group) => {
    if (!group) return 'Ungrouped';
    return group.replace('group_', 'Group ');
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    const statusColors = {
      'payment_confirmed': '#34C759',
      'in_progress': COLORS.primary,
      'upcoming': '#FF9500',
      'completed': '#34C759',
      'cancelled': '#DC3545',
      'pending': '#8E8E93'
    };
    return statusColors[status] || '#8E8E93';
  };

  const { totalEarnings, cleanerEarnings, breakdown } = earningsData;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="cash-multiple" size={20} color={COLORS.primary} />
        <Text style={styles.title}>Earnings Breakdown</Text>
      </View>

      {/* Total Earnings */}
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Total Job Value</Text>
        <Text style={styles.totalAmount}>${totalEarnings.toFixed(2)}</Text>
      </View>

      {/* Current Cleaner's Earnings */}
      {cleanerEarnings > 0 && (
        <View style={styles.yourEarningsSection}>
          <View style={styles.yourEarningsHeader}>
            <MaterialCommunityIcons name="account" size={16} color={COLORS.primary} />
            <Text style={styles.yourEarningsLabel}>Your Share</Text>
          </View>
          <Text style={styles.yourEarningsAmount}>${cleanerEarnings.toFixed(2)}</Text>
        </View>
      )}

      {/* Breakdown by Cleaner */}
      <View style={styles.breakdownSection}>
        <Text style={styles.breakdownTitle}>Distribution by Cleaner</Text>
        {breakdown.map((cleaner, index) => (
          <View 
            key={cleaner.cleanerId} 
            style={[
              styles.cleanerRow,
              cleaner.cleanerId === currentCleanerId && styles.currentCleanerRow
            ]}
          >
            <View style={styles.cleanerInfo}>
              <Text style={styles.cleanerName} numberOfLines={1}>
                {cleaner.name}
                {cleaner.cleanerId === currentCleanerId && (
                  <Text style={styles.youLabel}> (You)</Text>
                )}
              </Text>
              <View style={styles.cleanerDetails}>
                <Text style={styles.cleanerGroup}>
                  {formatGroup(cleaner.group)}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(cleaner.status)}20` }]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(cleaner.status) }]} />
                  <Text style={[styles.cleanerStatus, { color: getStatusColor(cleaner.status) }]}>
                    {formatStatus(cleaner.status)}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.earningsInfo}>
              <Text style={styles.cleanerEarnings}>${cleaner.earnings.toFixed(2)}</Text>
              <Text style={styles.cleanerTime}>{minutesToDuration(cleaner.totalTime)}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Status Legend */}
      {/* <View style={styles.legendSection}>
        <Text style={styles.legendTitle}>Status Legend</Text>
        <View style={styles.legendGrid}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
            <Text style={styles.legendText}>Payment Confirmed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.legendText}>In Progress</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
            <Text style={styles.legendText}>Upcoming</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#DC3545' }]} />
            <Text style={styles.legendText}>Cancelled</Text>
          </View>
        </View>
      </View> */}

      {/* Room and Extra Details for Current Cleaner */}
      {cleanerEarnings > 0 && (
        <View style={styles.detailsSection}>
          <Text style={styles.detailsTitle}>Your Assignment Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="door-open" size={16} color="#666" />
              <Text style={styles.detailLabel}>Rooms</Text>
              <Text style={styles.detailValue}>
                {breakdown.find(c => c.cleanerId === currentCleanerId)?.rooms.length || 0}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="star" size={16} color="#666" />
              <Text style={styles.detailLabel}>Extras</Text>
              <Text style={styles.detailValue}>
                {breakdown.find(c => c.cleanerId === currentCleanerId)?.extras.length || 0}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="timer" size={16} color="#666" />
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>
                {minutesToDuration(breakdown.find(c => c.cleanerId === currentCleanerId)?.totalTime || 0)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="account-group" size={16} color="#666" />
              <Text style={styles.detailLabel}>Group</Text>
              <Text style={styles.detailValue}>
                {formatGroup(breakdown.find(c => c.cleanerId === currentCleanerId)?.group)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  totalSection: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
  },
  yourEarningsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#E7F3FF',
    borderRadius: 12,
    marginBottom: 16,
  },
  yourEarningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  yourEarningsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  yourEarningsAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  breakdownSection: {
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  cleanerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  currentCleanerRow: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  cleanerInfo: {
    flex: 1,
  },
  cleanerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  youLabel: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  cleanerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cleanerGroup: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cleanerStatus: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  earningsInfo: {
    alignItems: 'flex-end',
  },
  cleanerEarnings: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  cleanerTime: {
    fontSize: 12,
    color: '#666',
  },
  legendSection: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 16,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: '45%',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#666',
    flex: 1,
  },
  detailsSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
});

export default EarningsBreakdownCard;