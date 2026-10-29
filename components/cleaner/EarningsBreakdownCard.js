// components/cleaner/EarningsBreakdownCard.js
// components/cleaner/EarningsBreakdownCard.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import AppText from '../../ui/AppText';

import { minutesToDuration } from '../../utils/minuteToDuration';
import { tSafe } from '../../utils/tSafe';

const EarningsBreakdownCard = ({
  earningsData,
  currentCleanerId,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  if (
    !earningsData ||
    !Array.isArray(earningsData.breakdown) ||
    earningsData.breakdown.length === 0
  ) {
    return null;
  }

  // Helper function to format status
  const formatStatus = (status) => {
    const statusMap = {
      payment_confirmed: tSafe(
        'status_payment_confirmed',
        'Payment Confirmed'
      ),
      in_progress: tSafe(
        'status_in_progress',
        'In Progress'
      ),
      upcoming: tSafe(
        'status_upcoming',
        'Upcoming'
      ),
      completed: tSafe(
        'status_completed',
        'Completed'
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
      String(status || '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (letter) =>
          letter.toUpperCase()
        )
    );
  };

  // Helper function to format group
  const formatGroup = (group) => {
    if (!group) {
      return tSafe('ungrouped', 'Ungrouped');
    }

    const groupNumber = group.replace('group_', '');

    return `${tSafe(
      'group',
      'Group'
    )} ${groupNumber}`;
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    const statusColors = {
      payment_confirmed: theme.status.success,
      in_progress: theme.brand.primary,
      upcoming: theme.status.warning,
      completed: theme.status.success,
      cancelled: theme.status.error,
      pending: theme.status.pending,
    };

    return (
      statusColors[status] ||
      theme.status.pending
    );
  };

  const {
    totalEarnings,
    cleanerEarnings,
    breakdown,
  } = earningsData;

  // Find current cleaner's data for details section
  const currentCleanerData = breakdown.find(
    (cleaner) =>
      cleaner.cleanerId === currentCleanerId
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="cash-multiple"
          size={20}
          color={theme.brand.primary}
        />

        <AppText
          variant="body"
          style={styles.title}
        >
          {tSafe(
            'earnings_breakdown',
            'Earnings Breakdown'
          )}
        </AppText>
      </View>

      {/* Total Earnings */}
      <View style={styles.totalSection}>
        <AppText style={styles.totalLabel}>
          {tSafe(
            'total_job_value',
            'Total Job Value'
          )}
        </AppText>

        <AppText
          variant="title"
          style={styles.totalAmount}
        >
          ${Number(totalEarnings || 0).toFixed(2)}
        </AppText>
      </View>

      {/* Current Cleaner's Earnings */}
      {cleanerEarnings > 0 && (
        <View style={styles.yourEarningsSection}>
          <View style={styles.yourEarningsHeader}>
            <MaterialCommunityIcons
              name="account"
              size={16}
              color={theme.brand.primary}
            />

            <AppText
              style={styles.yourEarningsLabel}
            >
              {tSafe(
                'your_share',
                'Your Share'
              )}
            </AppText>
          </View>

          <AppText
            variant="body"
            style={styles.yourEarningsAmount}
          >
            ${Number(cleanerEarnings).toFixed(2)}
          </AppText>
        </View>
      )}

      {/* Breakdown by Cleaner */}
      <View style={styles.breakdownSection}>
        <AppText
          variant="body"
          style={styles.breakdownTitle}
        >
          {tSafe(
            'distribution_by_cleaner',
            'Distribution by Cleaner'
          )}
        </AppText>

        {breakdown.map((cleaner) => {
          const statusColor = getStatusColor(
            cleaner.status
          );

          const isCurrentCleaner =
            cleaner.cleanerId === currentCleanerId;

          return (
            <View
              key={cleaner.cleanerId}
              style={[
                styles.cleanerRow,
                isCurrentCleaner &&
                  styles.currentCleanerRow,
              ]}
            >
              <View style={styles.cleanerInfo}>
                <AppText
                  style={styles.cleanerName}
                  numberOfLines={1}
                >
                  {cleaner.name}

                  {isCurrentCleaner && (
                    <AppText
                      style={styles.youLabel}
                    >
                      {' '}
                      ({tSafe('you', 'You')})
                    </AppText>
                  )}
                </AppText>

                <View style={styles.cleanerDetails}>
                  <AppText
                    style={styles.cleanerGroup}
                  >
                    {formatGroup(
                      cleaner.group
                    )}
                  </AppText>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          `${statusColor}20`,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            statusColor,
                        },
                      ]}
                    />

                    <AppText
                      style={[
                        styles.cleanerStatus,
                        {
                          color: statusColor,
                        },
                      ]}
                    >
                      {formatStatus(
                        cleaner.status
                      )}
                    </AppText>
                  </View>
                </View>
              </View>

              <View style={styles.earningsInfo}>
                <AppText
                  style={styles.cleanerEarnings}
                >
                  $
                  {Number(
                    cleaner.earnings || 0
                  ).toFixed(2)}
                </AppText>

                <AppText style={styles.cleanerTime}>
                  {minutesToDuration(
                    cleaner.totalTime || 0
                  )}
                </AppText>
              </View>
            </View>
          );
        })}
      </View>

      {/* Status Legend */}
      <View style={styles.legendSection}>
        <AppText
          style={styles.legendTitle}
        >
          {tSafe(
            'status_legend',
            'Status Legend'
          )}
        </AppText>

        <View style={styles.legendGrid}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                {
                  backgroundColor:
                    theme.status.success,
                },
              ]}
            />

            <AppText style={styles.legendText}>
              {tSafe(
                'status_payment_confirmed',
                'Payment Confirmed'
              )}
            </AppText>
          </View>

          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                {
                  backgroundColor:
                    theme.brand.primary,
                },
              ]}
            />

            <AppText style={styles.legendText}>
              {tSafe(
                'status_in_progress',
                'In Progress'
              )}
            </AppText>
          </View>

          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                {
                  backgroundColor:
                    theme.status.warning,
                },
              ]}
            />

            <AppText style={styles.legendText}>
              {tSafe(
                'status_upcoming',
                'Upcoming'
              )}
            </AppText>
          </View>

          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                {
                  backgroundColor:
                    theme.status.error,
                },
              ]}
            />

            <AppText style={styles.legendText}>
              {tSafe(
                'status_cancelled',
                'Cancelled'
              )}
            </AppText>
          </View>
        </View>
      </View>

      {/* Room and Extra Details for Current Cleaner */}
      {cleanerEarnings > 0 &&
        currentCleanerData && (
          <View style={styles.detailsSection}>
            <AppText
              style={styles.detailsTitle}
            >
              {tSafe(
                'your_assignment_details',
                'Your Assignment Details'
              )}
            </AppText>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons
                  name="door-open"
                  size={16}
                  color={theme.icon.muted}
                />

                <AppText
                  style={styles.detailLabel}
                >
                  {tSafe(
                    'rooms',
                    'Rooms'
                  )}
                </AppText>

                <AppText
                  style={styles.detailValue}
                >
                  {currentCleanerData.rooms
                    ?.length || 0}
                </AppText>
              </View>

              <View style={styles.detailItem}>
                <MaterialCommunityIcons
                  name="star"
                  size={16}
                  color={theme.icon.muted}
                />

                <AppText
                  style={styles.detailLabel}
                >
                  {tSafe(
                    'extras',
                    'Extras'
                  )}
                </AppText>

                <AppText
                  style={styles.detailValue}
                >
                  {currentCleanerData.extras
                    ?.length || 0}
                </AppText>
              </View>

              <View style={styles.detailItem}>
                <MaterialCommunityIcons
                  name="timer"
                  size={16}
                  color={theme.icon.muted}
                />

                <AppText
                  style={styles.detailLabel}
                >
                  {tSafe(
                    'time',
                    'Time'
                  )}
                </AppText>

                <AppText
                  style={styles.detailValue}
                >
                  {minutesToDuration(
                    currentCleanerData.totalTime ||
                      0
                  )}
                </AppText>
              </View>

              <View style={styles.detailItem}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={16}
                  color={theme.icon.muted}
                />

                <AppText
                  style={styles.detailLabel}
                >
                  {tSafe(
                    'group',
                    'Group'
                  )}
                </AppText>

                <AppText
                  style={styles.detailValue}
                  numberOfLines={1}
                >
                  {formatGroup(
                    currentCleanerData.group
                  )}
                </AppText>
              </View>
            </View>
          </View>
        )}
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.card.background,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.card.border,

      shadowColor:
        theme.shadow?.color || '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity:
        theme.shadow?.opacity ?? 0.1,
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
      color: theme.text.primary,
    },

    totalSection: {
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.background.sunken,
      borderRadius: 12,
      marginBottom: 16,
    },

    totalLabel: {
      fontSize: 14,
      color: theme.text.secondary,
      marginBottom: 8,
    },

    totalAmount: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.brand.primary,
    },

    yourEarningsSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor:
        theme.surface.selected,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border.focus,
    },

    yourEarningsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    yourEarningsLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.brand.primary,
    },

    yourEarningsAmount: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.brand.primary,
    },

    breakdownSection: {
      marginBottom: 16,
    },

    breakdownTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 12,
    },

    cleanerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
    },

    currentCleanerRow: {
      backgroundColor:
        theme.surface.selected,
      borderRadius: 8,
      paddingHorizontal: 8,
    },

    cleanerInfo: {
      flex: 1,
      minWidth: 0,
    },

    cleanerName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 4,
    },

    youLabel: {
      color: theme.brand.primary,
      fontWeight: '500',
    },

    cleanerDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
    },

    cleanerGroup: {
      fontSize: 12,
      color: theme.text.secondary,
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
      marginLeft: 8,
    },

    cleanerEarnings: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 4,
    },

    cleanerTime: {
      fontSize: 12,
      color: theme.text.secondary,
    },

    legendSection: {
      padding: 12,
      backgroundColor: theme.background.sunken,
      borderRadius: 8,
      marginBottom: 16,
    },

    legendTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.text.secondary,
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
      color: theme.text.secondary,
      flex: 1,
    },

    detailsSection: {
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },

    detailsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text.primary,
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
      backgroundColor: theme.background.sunken,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.card.border,
    },

    detailLabel: {
      fontSize: 12,
      color: theme.text.secondary,
      marginTop: 4,
      marginBottom: 2,
    },

    detailValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text.primary,
    },
  });

export default EarningsBreakdownCard;