import React, { useContext, useState } from 'react';
import { 
  SafeAreaView,
  Text, 
  StyleSheet, 
  StatusBar, 
  FlatList,
  ScrollView, 
  View, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CleaningRequestItem from '../../components/cleaner/CleaningRequestItem';
import COLORS from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function AllRequests({ route }) {
  const { currency } = useContext(AuthContext);
  const { active_requests } = route.params || {};
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // Categorize statuses
  const categorizeStatus = (status) => {
    if (status === 'pending_payment' || status === 'payment_confirmed') {
      return 'accepted';
    } else if (status === 'pending_acceptance') {
      return 'pending';
    } else if (status === 'declined') {
      return 'declined';
    }
    return status; // fallback for any other status
  };

  // Filter requests based on selected filter
  const filteredRequests = active_requests?.filter(request => {
    if (selectedFilter === 'all') return true;
    const category = categorizeStatus(request.status);
    return category === selectedFilter;
  }) || [];

  // Get status counts based on categories
  const getStatusCounts = () => {
    let pendingCount = 0;
    let acceptedCount = 0;
    let declinedCount = 0;

    active_requests?.forEach(request => {
      const category = categorizeStatus(request.status);
      switch (category) {
        case 'pending':
          pendingCount++;
          break;
        case 'accepted':
          acceptedCount++;
          break;
        case 'declined':
          declinedCount++;
          break;
      }
    });

    return {
      pending: pendingCount,
      accepted: acceptedCount,
      declined: declinedCount,
      total: active_requests?.length || 0,
    };
  };

  const statusCounts = getStatusCounts();

  // Get original statuses for filtering
  const getStatusesForCategory = (category) => {
    switch (category) {
      case 'accepted':
        return ['pending_payment', 'payment_confirmed'];
      case 'pending':
        return ['pending_acceptance'];
      case 'declined':
        return ['declined'];
      default:
        return [];
    }
  };

  // Get status display text
  const getStatusDisplayText = (status) => {
    const category = categorizeStatus(status);
    
    if (category === 'accepted') {
      if (status === 'pending_payment') return 'Accepted (Pending Payment)';
      if (status === 'payment_confirmed') return 'Accepted (Payment Confirmed)';
      return 'Accepted';
    } else if (category === 'pending') {
      return 'Pending Acceptance';
    } else if (category === 'declined') {
      return 'Declined';
    }
    return status; // fallback
  };

  // Get status color
  const getStatusColor = (status) => {
    const category = categorizeStatus(status);
    
    switch (category) {
      case 'accepted':
        return '#34C759'; // Green
      case 'pending':
        return '#FF9500'; // Orange
      case 'declined':
        return '#FF3B30'; // Red
      default:
        return '#8E8E93'; // Gray
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const category = categorizeStatus(status);
    
    switch (category) {
      case 'accepted':
        return 'check-circle';
      case 'pending':
        return 'clock-outline';
      case 'declined':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  // List Header Component
  const ListHeaderComponent = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>All Cleaning Requests</Text>
      <Text style={styles.subtitle}>
        Review and manage all cleaning requests you've received
      </Text>
      
      {/* Status Summary Cards */}
      <View style={styles.summaryCards}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCount}>{statusCounts.total}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={[styles.summaryCard, styles.pendingCard]}>
          <Text style={[styles.summaryCount, styles.pendingCount]}>{statusCounts.pending}</Text>
          <Text style={[styles.summaryLabel, styles.pendingLabel]}>Pending</Text>
          <Text style={styles.summarySubtext}>Awaiting response</Text>
        </View>
        <View style={[styles.summaryCard, styles.acceptedCard]}>
          <Text style={[styles.summaryCount, styles.acceptedCount]}>{statusCounts.accepted}</Text>
          <Text style={[styles.summaryLabel, styles.acceptedLabel]}>Accepted</Text>
          <Text style={styles.summarySubtext}>In progress / Paid</Text>
        </View>
        <View style={[styles.summaryCard, styles.declinedCard]}>
          <Text style={[styles.summaryCount, styles.declinedCount]}>{statusCounts.declined}</Text>
          <Text style={[styles.summaryLabel, styles.declinedLabel]}>Declined</Text>
          <Text style={styles.summarySubtext}>Not available</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterTabsContainer}
      >
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === 'all' && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === 'all' && styles.filterTabTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === 'pending' && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter('pending')}
          >
            <View style={styles.filterTabContent}>
              <MaterialCommunityIcons 
                name="clock-outline" 
                size={14} 
                color={selectedFilter === 'pending' ? '#FFFFFF' : '#FF9500'} 
              />
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === 'pending' && styles.filterTabTextActive,
                ]}
              >
                Pending ({statusCounts.pending})
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === 'accepted' && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter('accepted')}
          >
            <View style={styles.filterTabContent}>
              <MaterialCommunityIcons 
                name="check-circle" 
                size={14} 
                color={selectedFilter === 'accepted' ? '#FFFFFF' : '#34C759'} 
              />
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === 'accepted' && styles.filterTabTextActive,
                ]}
              >
                Accepted ({statusCounts.accepted})
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === 'declined' && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter('declined')}
          >
            <View style={styles.filterTabContent}>
              <MaterialCommunityIcons 
                name="close-circle" 
                size={14} 
                color={selectedFilter === 'declined' ? '#FFFFFF' : '#FF3B30'} 
              />
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === 'declined' && styles.filterTabTextActive,
                ]}
              >
                Declined ({statusCounts.declined})
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            Showing {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
          </Text>
          {selectedFilter !== 'all' && (
            <View style={[styles.filterBadge, { backgroundColor: getStatusColor(selectedFilter) + '20' }]}>
              <MaterialCommunityIcons 
                name={getStatusIcon(selectedFilter)} 
                size={12} 
                color={getStatusColor(selectedFilter)} 
              />
              <Text style={[styles.filterBadgeText, { color: getStatusColor(selectedFilter) }]}>
                {selectedFilter === 'pending' ? 'Awaiting Response' : 
                 selectedFilter === 'accepted' ? 'In Progress / Paid' : 
                 'Not Available'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  // List Empty Component
  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons 
        name={selectedFilter === 'accepted' ? 'check-circle' : 
              selectedFilter === 'declined' ? 'close-circle' : 
              selectedFilter === 'pending' ? 'clock-outline' : 
              'calendar-search'} 
        size={64} 
        color="#D1D1D6" 
      />
      <Text style={styles.emptyTitle}>
        {selectedFilter === 'all' 
          ? 'No Cleaning Requests' 
          : `No ${selectedFilter} requests`
        }
      </Text>
      <Text style={styles.emptyText}>
        {selectedFilter === 'all' 
          ? "You haven't received any cleaning requests yet." 
          : selectedFilter === 'pending'
          ? "You don't have any pending acceptance requests."
          : selectedFilter === 'accepted'
          ? "You don't have any accepted requests."
          : "You don't have any declined requests."
        }
      </Text>
      {selectedFilter !== 'all' && (
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={styles.viewAllButtonText}>View All Requests</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Render item with categorized status
  const renderItem = ({ item }) => {
    const category = categorizeStatus(item.status);
    const statusDisplayText = getStatusDisplayText(item.status);
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);
    
    return (
      <CleaningRequestItem 
        item={item}
        status={item.status}
        category={category}
        statusDisplayText={statusDisplayText}
        statusColor={statusColor}
        statusIcon={statusIcon}
        currency={currency}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <FlatList 
        data={filteredRequests}
        renderItem={renderItem}
        ListHeaderComponent={<ListHeaderComponent />}
        ListEmptyComponent={<ListEmptyComponent />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item, index) => item._id || index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
    lineHeight: 20,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    marginBottom: 8,
    minWidth: width * 0.22,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  pendingCard: {
    backgroundColor: 'rgba(255, 149, 0, 0.05)',
    borderColor: 'rgba(255, 149, 0, 0.2)',
  },
  acceptedCard: {
    backgroundColor: 'rgba(52, 199, 89, 0.05)',
    borderColor: 'rgba(52, 199, 89, 0.2)',
  },
  declinedCard: {
    backgroundColor: 'rgba(255, 59, 48, 0.05)',
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  summaryCount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  summarySubtext: {
    fontSize: 9,
    color: '#8E8E93',
    marginTop: 2,
    textAlign: 'center',
  },
  pendingCount: {
    color: '#FF9500',
  },
  acceptedCount: {
    color: '#34C759',
  },
  declinedCount: {
    color: '#FF3B30',
  },
  pendingLabel: {
    color: '#FF9500',
  },
  acceptedLabel: {
    color: '#34C759',
  },
  declinedLabel: {
    color: '#FF3B30',
  },
  filterTabsContainer: {
    marginBottom: 16,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 4,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  resultsContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8E8E93',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  viewAllButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
});