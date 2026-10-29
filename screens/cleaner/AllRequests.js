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
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import CleaningRequestItem from '../../components/cleaner/CleaningRequestItem';
import { AuthContext } from '../../context/AuthContext';
import { tSafe } from '../../utils/tSafe';
import { useTheme } from '../../theme';

export default function AllRequests({ route }) {
  const { currency } = useContext(AuthContext);
  const { active_requests } = route.params || {};

  const { theme, isDark } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const styles = createStyles(theme);

  // ---------------------------------------------------------------------------
  // REFRESH
  // ---------------------------------------------------------------------------

  const handleRefresh = () => {
    setRefreshing(true);

    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // ---------------------------------------------------------------------------
  // STATUS CATEGORIZATION
  // ---------------------------------------------------------------------------

  const categorizeStatus = (status) => {
    if (
      status === 'pending_payment' ||
      status === 'payment_confirmed'
    ) {
      return 'accepted';
    }

    if (status === 'pending_acceptance') {
      return 'pending';
    }

    if (status === 'declined') {
      return 'declined';
    }

    return status;
  };

  // ---------------------------------------------------------------------------
  // FILTER REQUESTS
  // ---------------------------------------------------------------------------

  const filteredRequests =
    active_requests?.filter((request) => {
      if (selectedFilter === 'all') {
        return true;
      }

      const category = categorizeStatus(request.status);

      return category === selectedFilter;
    }) || [];

  // ---------------------------------------------------------------------------
  // STATUS COUNTS
  // ---------------------------------------------------------------------------

  const getStatusCounts = () => {
    let pendingCount = 0;
    let acceptedCount = 0;
    let declinedCount = 0;

    active_requests?.forEach((request) => {
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

        default:
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

  // ---------------------------------------------------------------------------
  // STATUS DISPLAY TEXT
  // ---------------------------------------------------------------------------

  const getStatusDisplayText = (status) => {
    const category = categorizeStatus(status);

    if (category === 'accepted') {
      if (status === 'pending_payment') {
        return tSafe(
          'accepted_pending_payment',
          'Accepted (Pending Payment)'
        );
      }

      if (status === 'payment_confirmed') {
        return tSafe(
          'accepted_payment_confirmed',
          'Accepted (Payment Confirmed)'
        );
      }

      return tSafe('accepted', 'Accepted');
    }

    if (category === 'pending') {
      return tSafe(
        'pending_acceptance',
        'Pending Acceptance'
      );
    }

    if (category === 'declined') {
      return tSafe('declined', 'Declined');
    }

    return status;
  };

  // ---------------------------------------------------------------------------
  // STATUS COLOR
  // ---------------------------------------------------------------------------

  const getStatusColor = (status) => {
    const category = categorizeStatus(status);

    switch (category) {
      case 'accepted':
        return theme.status.success;

      case 'pending':
        return theme.status.pending;

      case 'declined':
        return theme.status.error;

      default:
        return theme.text.muted;
    }
  };

  // ---------------------------------------------------------------------------
  // STATUS ICON
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // HEADER
  // ---------------------------------------------------------------------------

  const ListHeaderComponent = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>
        {tSafe(
          'all_cleaning_requests',
          'All Cleaning Requests'
        )}
      </Text>

      <Text style={styles.subtitle}>
        {tSafe(
          'review_manage_requests',
          "Review and manage all cleaning requests you've received"
        )}
      </Text>

      {/* ------------------------------------------------------------------ */}
      {/* FILTER TABS                                                        */}
      {/* ------------------------------------------------------------------ */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterTabsContainer}
        contentContainerStyle={styles.filterTabsContent}
      >
        {/* ALL */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.filterTab,
            selectedFilter === 'all' && styles.filterTabActive,
          ]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text
            style={[
              styles.filterTabText,
              selectedFilter === 'all' &&
                styles.filterTabTextActive,
            ]}
          >
            {tSafe('all', 'All')}
          </Text>
        </TouchableOpacity>

        {/* PENDING */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.filterTab,
            selectedFilter === 'pending' &&
              styles.filterTabActive,
          ]}
          onPress={() => setSelectedFilter('pending')}
        >
          <View style={styles.filterTabContent}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={14}
              color={
                selectedFilter === 'pending'
                  ? theme.icon.inverse
                  : theme.status.pending
              }
            />

            <Text
              style={[
                styles.filterTabText,
                selectedFilter === 'pending' &&
                  styles.filterTabTextActive,
              ]}
            >
              {tSafe('pending_filter', 'Pending')} (
              {statusCounts.pending})
            </Text>
          </View>
        </TouchableOpacity>

        {/* ACCEPTED */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.filterTab,
            selectedFilter === 'accepted' &&
              styles.filterTabActive,
          ]}
          onPress={() => setSelectedFilter('accepted')}
        >
          <View style={styles.filterTabContent}>
            <MaterialCommunityIcons
              name="check-circle"
              size={14}
              color={
                selectedFilter === 'accepted'
                  ? theme.icon.inverse
                  : theme.status.success
              }
            />

            <Text
              style={[
                styles.filterTabText,
                selectedFilter === 'accepted' &&
                  styles.filterTabTextActive,
              ]}
            >
              {tSafe('accepted_filter', 'Accepted')} (
              {statusCounts.accepted})
            </Text>
          </View>
        </TouchableOpacity>

        {/* DECLINED */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.filterTab,
            selectedFilter === 'declined' &&
              styles.filterTabActive,
          ]}
          onPress={() => setSelectedFilter('declined')}
        >
          <View style={styles.filterTabContent}>
            <MaterialCommunityIcons
              name="close-circle"
              size={14}
              color={
                selectedFilter === 'declined'
                  ? theme.icon.inverse
                  : theme.status.error
              }
            />

            <Text
              style={[
                styles.filterTabText,
                selectedFilter === 'declined' &&
                  styles.filterTabTextActive,
              ]}
            >
              {tSafe('declined_filter', 'Declined')} (
              {statusCounts.declined})
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* ------------------------------------------------------------------ */}
      {/* RESULTS                                                            */}
      {/* ------------------------------------------------------------------ */}

      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {tSafe(
              'showing_x_requests',
              'Showing {count} request{s}',
              {
                count: filteredRequests.length,
                s:
                  filteredRequests.length !== 1
                    ? 's'
                    : '',
              }
            )}
          </Text>

          {selectedFilter !== 'all' && (
            <View
              style={[
                styles.filterBadge,
                {
                  backgroundColor:
                    getStatusColor(selectedFilter) + '20',
                },
              ]}
            >
              <MaterialCommunityIcons
                name={getStatusIcon(selectedFilter)}
                size={12}
                color={getStatusColor(selectedFilter)}
              />

              <Text
                style={[
                  styles.filterBadgeText,
                  {
                    color: getStatusColor(selectedFilter),
                  },
                ]}
              >
                {selectedFilter === 'pending'
                  ? tSafe(
                      'awaiting_response',
                      'Awaiting Response'
                    )
                  : selectedFilter === 'accepted'
                  ? tSafe(
                      'in_progress_paid',
                      'In Progress / Paid'
                    )
                  : tSafe(
                      'not_available',
                      'Not Available'
                    )}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  // ---------------------------------------------------------------------------
  // EMPTY STATE
  // ---------------------------------------------------------------------------

  const ListEmptyComponent = () => {
    const emptyIcon =
      selectedFilter === 'accepted'
        ? 'check-circle'
        : selectedFilter === 'declined'
        ? 'close-circle'
        : selectedFilter === 'pending'
        ? 'clock-outline'
        : 'calendar-search';

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <MaterialCommunityIcons
            name={emptyIcon}
            size={52}
            color={theme.icon.muted}
          />
        </View>

        <Text style={styles.emptyTitle}>
          {selectedFilter === 'all'
            ? tSafe(
                'no_cleaning_requests',
                'No Cleaning Requests'
              )
            : tSafe(
                'no_filter_requests',
                'No {filter} requests',
                {
                  filter: tSafe(
                    selectedFilter,
                    selectedFilter
                  ),
                }
              )}
        </Text>

        <Text style={styles.emptyText}>
          {selectedFilter === 'all'
            ? tSafe(
                'no_requests_yet',
                "You haven't received any cleaning requests yet."
              )
            : selectedFilter === 'pending'
            ? tSafe(
                'no_pending_requests',
                "You don't have any pending acceptance requests."
              )
            : selectedFilter === 'accepted'
            ? tSafe(
                'no_accepted_requests',
                "You don't have any accepted requests."
              )
            : tSafe(
                'no_declined_requests',
                "You don't have any declined requests."
              )}
        </Text>

        {selectedFilter !== 'all' && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.viewAllButton}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={styles.viewAllButtonText}>
              {tSafe(
                'view_all_requests',
                'View All Requests'
              )}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ---------------------------------------------------------------------------
  // RENDER REQUEST
  // ---------------------------------------------------------------------------

  const renderItem = ({ item }) => {
    const category = categorizeStatus(item.status);
    const statusDisplayText =
      getStatusDisplayText(item.status);
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

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={
          isDark ? 'light-content' : 'dark-content'
        }
        backgroundColor={theme.background.default}
      />

      <FlatList
        data={filteredRequests}
        renderItem={renderItem}
        ListHeaderComponent={<ListHeaderComponent />}
        ListEmptyComponent={<ListEmptyComponent />}
        ItemSeparatorComponent={() => (
          <View style={styles.separator} />
        )}
        keyExtractor={(item, index) =>
          item._id || index.toString()
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.brand.primary]}
            tintColor={theme.brand.primary}
            progressBackgroundColor={
              theme.surface.elevated
            }
          />
        }
      />
    </SafeAreaView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    contentContainer: {
      paddingHorizontal: 16,
      paddingBottom: 24,
    },

    // -------------------------------------------------------------------------
    // HEADER
    // -------------------------------------------------------------------------

    headerContainer: {
      paddingTop: 20,
      paddingBottom: 8,
      backgroundColor: theme.background.default,
    },

    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 8,
      letterSpacing: -0.3,
    },

    subtitle: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.text.secondary,
      marginBottom: 20,
    },

    // -------------------------------------------------------------------------
    // FILTERS
    // -------------------------------------------------------------------------

    filterTabsContainer: {
      marginBottom: 16,
    },

    filterTabsContent: {
      paddingRight: 4,
    },

    filterTab: {
      minHeight: 40,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 10,
      marginRight: 8,
      justifyContent: 'center',
      backgroundColor: theme.surface.elevated,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    filterTabActive: {
      backgroundColor: theme.brand.primary,
      borderColor: theme.brand.primary,
    },

    filterTabContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
    },

    filterTabText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.text.secondary,
    },

    filterTabTextActive: {
      color: theme.text.inverse,
      fontWeight: '600',
    },

    // -------------------------------------------------------------------------
    // RESULTS
    // -------------------------------------------------------------------------

    resultsContainer: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
      marginBottom: 16,
    },

    resultsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 10,
    },

    resultsText: {
      flex: 1,
      fontSize: 13,
      fontWeight: '500',
      color: theme.text.secondary,
    },

    filterBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 12,
      gap: 4,
    },

    filterBadgeText: {
      fontSize: 11,
      fontWeight: '600',
    },

    // -------------------------------------------------------------------------
    // EMPTY STATE
    // -------------------------------------------------------------------------

    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 56,
      paddingHorizontal: 24,
      backgroundColor: theme.card.background,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.card.border,
      marginTop: 8,
    },

    emptyIconContainer: {
      width: 84,
      height: 84,
      borderRadius: 42,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background.sunken,
      marginBottom: 4,
    },

    emptyTitle: {
      fontSize: 19,
      fontWeight: '700',
      color: theme.text.primary,
      marginTop: 16,
      marginBottom: 8,
      textAlign: 'center',
    },

    emptyText: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.text.secondary,
      textAlign: 'center',
      marginBottom: 20,
      maxWidth: 320,
    },

    viewAllButton: {
      paddingHorizontal: 20,
      paddingVertical: 11,
      backgroundColor: theme.button.primaryBackground,
      borderRadius: 10,
    },

    viewAllButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.button.primaryText,
    },

    // -------------------------------------------------------------------------
    // LIST
    // -------------------------------------------------------------------------

    separator: {
      height: 1,
      backgroundColor: theme.divider,
      marginVertical: 8,
    },
  });