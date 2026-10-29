// screens/cleaner/EarningsDetailReport.js

import React, {
    useCallback,
    useMemo,
    useState,
  } from 'react';
  
  import {
    View,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
  } from 'react-native';
  
  import MaterialCommunityIcons from
    'react-native-vector-icons/MaterialCommunityIcons';
  
  import {
    useFocusEffect,
    useNavigation,
  } from '@react-navigation/native';
  
  import { useContext } from 'react';
  
  import userService from
    '../../../services/connection/userService';
  
  import { AuthContext } from
    '../../../context/AuthContext';
  
  import {
    formatAmountWithSymbol,
  } from '../../../utils/formatAmountWithSymbol';
  
  import { useTheme } from '../../../theme';
  import AppText from '../../../ui/AppText';
  
  const EarningsDetailReport = () => {
    const navigation = useNavigation();
  
    const { currentUserId } =
      useContext(AuthContext);
  
    const { theme } = useTheme();
  
    const styles = createStyles(theme);
  
    const [loading, setLoading] =
      useState(true);
  
    const [refreshing, setRefreshing] =
      useState(false);
  
    const [earningsData, setEarningsData] =
      useState(null);
  
    const [selectedPeriod, setSelectedPeriod] =
      useState('month');
  
    const fetchReport = async () => {
      try {
        setLoading(true);
  
        const response =
          await userService.getCleanerEarnings(
            currentUserId
          );
  
        setEarningsData(
          response?.data ||
            response ||
            {}
        );
      } catch (error) {
        console.error(
          'Error fetching earnings report:',
          error
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
  
    useFocusEffect(
      useCallback(() => {
        if (currentUserId) {
          fetchReport();
        }
      }, [currentUserId])
    );
  
    const handleRefresh = () => {
      setRefreshing(true);
      fetchReport();
    };
  
    const getEarningType = (item) => {
      if (
        item?.type ===
          'replacement_compensation' ||
        item?.service ===
          'Replacement Compensation'
      ) {
        return 'replacement_compensation';
      }
  
      return 'completed_cleaning';
    };
  
    const getSourceLabel = (source) => {
      switch (source) {
        case 'ical':
        case 'ical_date_change':
          return 'iCal Schedule Change';
  
        case 'manual_schedule_change':
        case 'host_manual':
          return 'Manual Schedule Change';
  
        case 'cleaner_cancellation':
          return 'Cleaner Cancellation';
  
        case 'host_removal':
          return 'Host Cleaner Removal';
  
        default:
          return source
            ? source
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (c) =>
                  c.toUpperCase()
                )
            : 'Replacement';
      }
    };
  
    const allTransactions = useMemo(() => {
      if (!earningsData) {
        return [];
      }
  
      const completed =
        Array.isArray(
          earningsData.recentPayments
        )
          ? earningsData.recentPayments
          : [];
  
      const compensation =
        Array.isArray(
          earningsData.replacementPayments
        )
          ? earningsData.replacementPayments
          : [];
  
      return [
        ...completed.map((item) => ({
          ...item,
          type:
            item.type ||
            'completed_cleaning',
        })),
  
        ...compensation.map((item) => ({
          ...item,
          type:
            item.type ||
            'replacement_compensation',
        })),
      ].sort((a, b) => {
        return (
          new Date(b.date || 0) -
          new Date(a.date || 0)
        );
      });
    }, [earningsData]);
  
    const periodAmount =
      earningsData?.earningsBreakdown?.[
        selectedPeriod
      ] || 0;
  
    const cleaningEarnings =
      earningsData?.cleaningEarnings || 0;
  
    const replacementCompensation =
      earningsData?.replacementCompensation ||
      0;
  
    const completedJobs =
      earningsData?.completedJobs || 0;
  
    const averageEarningsPerJob =
      earningsData?.averageEarningsPerJob ||
      0;
  
    if (loading) {
      return (
        <SafeAreaView
          style={styles.safeArea}
        >
          <View style={styles.loading}>
            <ActivityIndicator
              size="large"
              color={theme.brand.primary}
            />
  
            <AppText
              style={styles.loadingText}
            >
              Loading detailed report...
            </AppText>
          </View>
        </SafeAreaView>
      );
    }
  
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <ScrollView
          contentContainerStyle={
            styles.container
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={
                theme.brand.primary
              }
              colors={[
                theme.brand.primary,
              ]}
            />
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          {/* HEADER */}
  
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() =>
                navigation.goBack()
              }
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color={
                  theme.icon.default
                }
              />
            </TouchableOpacity>
  
            <View style={styles.flex}>
              <AppText
                style={styles.title}
              >
                Detail Report
              </AppText>
  
              <AppText
                style={styles.subtitle}
              >
                Earnings and compensation breakdown
              </AppText>
            </View>
          </View>
  
          {/* PERIOD */}
  
          <View
            style={styles.periodCard}
          >
            {[
              ['week', 'Week'],
              ['month', 'Month'],
              ['quarter', 'Quarter'],
              ['year', 'Year'],
            ].map(
              ([value, label]) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.periodButton,
                    selectedPeriod ===
                      value &&
                      styles.periodButtonActive,
                  ]}
                  onPress={() =>
                    setSelectedPeriod(
                      value
                    )
                  }
                >
                  <AppText
                    style={[
                      styles.periodText,
                      selectedPeriod ===
                        value &&
                        styles.periodTextActive,
                    ]}
                  >
                    {label}
                  </AppText>
                </TouchableOpacity>
              )
            )}
          </View>
  
          {/* PERIOD TOTAL */}
  
          <View
            style={styles.totalCard}
          >
            <AppText
              style={styles.totalLabel}
            >
              {selectedPeriod ===
              'week'
                ? 'This Week'
                : selectedPeriod ===
                    'month'
                  ? 'This Month'
                  : selectedPeriod ===
                      'quarter'
                    ? 'This Quarter'
                    : 'This Year'}
            </AppText>
  
            <AppText
              style={styles.totalAmount}
            >
              {formatAmountWithSymbol(
                periodAmount
              )}
            </AppText>
  
            <AppText
              style={styles.totalSubtitle}
            >
              Completed jobs + eligible compensation
            </AppText>
          </View>
  
          {/* BREAKDOWN */}
  
          <AppText
            style={styles.sectionTitle}
          >
            Earnings Breakdown
          </AppText>
  
          <View
            style={styles.breakdownCard}
          >
            <BreakdownRow
              icon="broom"
              iconColor={
                theme.status.success
              }
              iconBackground={
                `${theme.status.success}18`
              }
              label="Completed Jobs"
              value={
                cleaningEarnings
              }
              theme={theme}
            />
  
            <View
              style={styles.divider}
            />
  
            <BreakdownRow
              icon="cash-plus"
              iconColor={
                theme.status.info
              }
              iconBackground={
                `${theme.status.info}18`
              }
              label="Replacement Compensation"
              value={
                replacementCompensation
              }
              theme={theme}
            />
  
            <View
              style={styles.divider}
            />
  
            <BreakdownRow
              icon="cash-multiple"
              iconColor={
                theme.brand.primary
              }
              iconBackground={
                theme.surface.selected
              }
              label="Total Earnings"
              value={
                earningsData?.totalEarnings ||
                0
              }
              bold
              theme={theme}
            />
          </View>
  
          {/* JOB STATISTICS */}
  
          <AppText
            style={styles.sectionTitle}
          >
            Job Statistics
          </AppText>
  
          <View style={styles.statsGrid}>
            <StatCard
              icon="broom"
              label="Completed Jobs"
              value={completedJobs}
              theme={theme}
            />
  
            <StatCard
              icon="cash"
              label="Avg. Per Job"
              value={formatAmountWithSymbol(
                averageEarningsPerJob
              )}
              theme={theme}
            />
          </View>
  
          {/* TRANSACTIONS */}
  
          <View
            style={styles.transactionHeader}
          >
            <AppText
              style={styles.sectionTitle}
            >
              Transactions
            </AppText>
  
            <View
              style={styles.transactionCount}
            >
              <AppText
                style={
                  styles.transactionCountText
                }
              >
                {allTransactions.length}
              </AppText>
            </View>
          </View>
  
          {allTransactions.length ===
          0 ? (
            <View
              style={styles.emptyCard}
            >
              <MaterialCommunityIcons
                name="receipt-text-outline"
                size={45}
                color={theme.text.disabled}
              />
  
              <AppText
                style={styles.emptyTitle}
              >
                No Transactions
              </AppText>
  
              <AppText
                style={styles.emptyText}
              >
                Your earnings transactions will appear
                here.
              </AppText>
            </View>
          ) : (
            allTransactions.map(
              (
                transaction,
                index
              ) => {
                const type =
                  getEarningType(
                    transaction
                  );
  
                const isCompensation =
                  type ===
                  'replacement_compensation';
  
                const transactionColor =
                  isCompensation
                    ? theme.status.info
                    : theme.status.success;
  
                const transactionBackground =
                  isCompensation
                    ? `${theme.status.info}18`
                    : `${theme.status.success}18`;
  
                return (
                  <View
                    key={
                      transaction.id ||
                      transaction._id ||
                      index
                    }
                    style={
                      styles.transactionCard
                    }
                  >
                    <View
                      style={[
                        styles.transactionIcon,
                        {
                          backgroundColor:
                            transactionBackground,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={
                          isCompensation
                            ? 'cash-plus'
                            : 'broom'
                        }
                        size={24}
                        color={
                          transactionColor
                        }
                      />
                    </View>
  
                    <View
                      style={
                        styles.transactionBody
                      }
                    >
                      <View
                        style={
                          styles.transactionTop
                        }
                      >
                        <View
                          style={
                            styles.flex
                          }
                        >
                          <AppText
                            style={
                              styles.transactionTitle
                            }
                          >
                            {isCompensation
                              ? 'Replacement Compensation'
                              : 'Completed Cleaning Job'}
                          </AppText>
  
                          <AppText
                            style={
                              styles.transactionDate
                            }
                          >
                            {formatDate(
                              transaction.date
                            )}
                          </AppText>
                        </View>
  
                        <AppText
                          style={[
                            styles.transactionAmount,
                            {
                              color:
                                isCompensation
                                  ? theme.status.info
                                  : theme.text.primary,
                            },
                          ]}
                        >
                          +
                          {formatAmountWithSymbol(
                            transaction.amount ||
                              0
                          )}
                        </AppText>
                      </View>
  
                      <View
                        style={
                          styles.badgeRow
                        }
                      >
                        <View
                          style={[
                            styles.typeBadge,
                            {
                              backgroundColor:
                                transactionBackground,
                            },
                          ]}
                        >
                          <AppText
                            style={[
                              styles.typeBadgeText,
                              {
                                color:
                                  transactionColor,
                              },
                            ]}
                          >
                            {isCompensation
                              ? 'COMPENSATION'
                              : 'COMPLETED'}
                          </AppText>
                        </View>
  
                        <AppText
                          style={
                            styles.sourceText
                          }
                        >
                          {isCompensation
                            ? getSourceLabel(
                                transaction.source
                              )
                            : transaction.service ||
                              'Cleaning Service'}
                        </AppText>
                      </View>
  
                      {isCompensation &&
                        transaction.policyVersion && (
                          <AppText
                            style={
                              styles.metadata
                            }
                          >
                            Policy v
                            {
                              transaction.policyVersion
                            }
                          </AppText>
                        )}
  
                      {transaction.client && (
                        <AppText
                          style={
                            styles.metadata
                          }
                        >
                          Client:{' '}
                          {
                            transaction.client
                          }
                        </AppText>
                      )}
                    </View>
                  </View>
                );
              }
            )
          )}
  
          {/* REPORT FOOTER */}
  
          <View
            style={styles.reportInfo}
          >
            <MaterialCommunityIcons
              name="information-outline"
              size={21}
              color={
                theme.brand.primary
              }
            />
  
            <AppText
              style={
                styles.reportInfoText
              }
            >
              Completed job earnings and replacement
              compensation are reported separately.
              Compensation does not count as another
              completed cleaning job.
            </AppText>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };
  
  
  const BreakdownRow = ({
    icon,
    iconColor,
    iconBackground,
    label,
    value,
    bold = false,
    theme,
  }) => {
    const styles = createStyles(theme);
  
    return (
      <View
        style={styles.breakdownRow}
      >
        <View
          style={[
            styles.breakdownIcon,
            {
              backgroundColor:
                iconBackground,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={22}
            color={iconColor}
          />
        </View>
  
        <AppText
          style={[
            styles.breakdownLabel,
            bold && styles.bold,
          ]}
        >
          {label}
        </AppText>
  
        <AppText
          style={[
            styles.breakdownValue,
            bold && styles.bold,
          ]}
        >
          {formatAmountWithSymbol(
            value
          )}
        </AppText>
      </View>
    );
  };
  
  
  const StatCard = ({
    icon,
    label,
    value,
    theme,
  }) => {
    const styles = createStyles(theme);
  
    return (
      <View style={styles.statCard}>
        <MaterialCommunityIcons
          name={icon}
          size={25}
          color={theme.brand.primary}
        />
  
        <AppText
          style={styles.statValue}
        >
          {value}
        </AppText>
  
        <AppText
          style={styles.statLabel}
        >
          {label}
        </AppText>
      </View>
    );
  };
  
  
  const formatDate = (date) => {
    if (!date) {
      return 'Unknown date';
    }
  
    const parsed = new Date(date);
  
    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return String(date);
    }
  
    return parsed.toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    );
  };
  
  
  const createStyles = (theme) =>
    StyleSheet.create({
      safeArea: {
        flex: 1,
        backgroundColor:
          theme.background.default,
      },
  
      container: {
        padding: 20,
        paddingBottom: 45,
      },
  
      loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:
          theme.background.default,
      },
  
      loadingText: {
        marginTop: 12,
        color: theme.text.secondary,
        fontSize: 14,
      },
  
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 22,
      },
  
      backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor:
          theme.surface.elevated,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
        borderWidth: 1,
        borderColor:
          theme.border.default,
      },
  
      title: {
        fontSize: 26,
        fontWeight: '700',
        color: theme.text.primary,
      },
  
      subtitle: {
        marginTop: 4,
        color: theme.text.secondary,
        fontSize: 13,
      },
  
      flex: {
        flex: 1,
      },
  
      periodCard: {
        backgroundColor:
          theme.surface.elevated,
        borderRadius: 14,
        padding: 5,
        flexDirection: 'row',
        marginBottom: 18,
        borderWidth: 1,
        borderColor:
          theme.border.default,
      },
  
      periodButton: {
        flex: 1,
        paddingVertical: 11,
        alignItems: 'center',
        borderRadius: 10,
      },
  
      periodButtonActive: {
        backgroundColor:
          theme.brand.primary,
      },
  
      periodText: {
        color: theme.text.secondary,
        fontSize: 13,
        fontWeight: '600',
      },
  
      periodTextActive: {
        color: theme.text.inverse,
      },
  
      totalCard: {
        backgroundColor:
          theme.brand.primary,
        borderRadius: 20,
        padding: 23,
        marginBottom: 25,
      },
  
      totalLabel: {
        color: theme.text.inverse,
        opacity: 0.85,
        fontSize: 14,
      },
  
      totalAmount: {
        color: theme.text.inverse,
        fontSize: 36,
        fontWeight: '800',
        marginTop: 5,
      },
  
      totalSubtitle: {
        color: theme.text.inverse,
        opacity: 0.8,
        fontSize: 12,
        marginTop: 5,
      },
  
      sectionTitle: {
        fontSize: 19,
        fontWeight: '700',
        color: theme.text.primary,
        marginBottom: 12,
      },
  
      breakdownCard: {
        backgroundColor:
          theme.card.background,
        borderRadius: 18,
        padding: 17,
        marginBottom: 25,
        borderWidth: 1,
        borderColor:
          theme.card.border,
      },
  
      breakdownRow: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 55,
      },
  
      breakdownIcon: {
        width: 43,
        height: 43,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      },
  
      breakdownLabel: {
        flex: 1,
        fontSize: 14,
        color: theme.text.secondary,
      },
  
      breakdownValue: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.text.primary,
      },
  
      bold: {
        fontWeight: '800',
      },
  
      divider: {
        height: 1,
        backgroundColor:
          theme.divider,
      },
  
      statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 25,
      },
  
      statCard: {
        flex: 1,
        backgroundColor:
          theme.card.background,
        borderRadius: 17,
        padding: 17,
        borderWidth: 1,
        borderColor:
          theme.card.border,
      },
  
      statValue: {
        marginTop: 10,
        fontSize: 21,
        fontWeight: '800',
        color: theme.text.primary,
      },
  
      statLabel: {
        marginTop: 3,
        color: theme.text.secondary,
        fontSize: 12,
      },
  
      transactionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:
          'space-between',
      },
  
      transactionCount: {
        backgroundColor:
          theme.surface.selected,
        borderRadius: 12,
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor:
          theme.border.default,
      },
  
      transactionCountText: {
        fontSize: 12,
        color: theme.text.secondary,
        fontWeight: '700',
      },
  
      transactionCard: {
        backgroundColor:
          theme.card.background,
        borderRadius: 17,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor:
          theme.card.border,
      },
  
      transactionIcon: {
        width: 46,
        height: 46,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
      },
  
      transactionBody: {
        flex: 1,
      },
  
      transactionTop: {
        flexDirection: 'row',
      },
  
      transactionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.text.primary,
      },
  
      transactionDate: {
        marginTop: 4,
        color: theme.text.muted,
        fontSize: 12,
      },
  
      transactionAmount: {
        fontSize: 15,
        fontWeight: '800',
      },
  
      badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 9,
        gap: 8,
        flexWrap: 'wrap',
      },
  
      typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 7,
      },
  
      typeBadgeText: {
        fontSize: 9,
        fontWeight: '800',
      },
  
      sourceText: {
        fontSize: 11,
        color: theme.text.secondary,
      },
  
      metadata: {
        marginTop: 5,
        fontSize: 11,
        color: theme.text.muted,
      },
  
      emptyCard: {
        backgroundColor:
          theme.card.background,
        borderRadius: 18,
        padding: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor:
          theme.card.border,
      },
  
      emptyTitle: {
        marginTop: 10,
        fontSize: 17,
        fontWeight: '700',
        color: theme.text.primary,
      },
  
      emptyText: {
        marginTop: 6,
        color: theme.text.secondary,
        textAlign: 'center',
      },
  
      reportInfo: {
        marginTop: 15,
        backgroundColor:
          theme.surface.selected,
        borderRadius: 15,
        padding: 15,
        flexDirection: 'row',
        gap: 10,
        borderWidth: 1,
        borderColor:
          theme.border.default,
      },
  
      reportInfoText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
        color: theme.text.secondary,
      },
    });
  
  export default EarningsDetailReport;