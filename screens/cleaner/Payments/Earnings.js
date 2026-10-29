import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
} from 'react';

import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Modal,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';

import userService from '../../../services/connection/userService';
import { AuthContext } from '../../../context/AuthContext';
import ROUTES from '../../../constants/routes';

import { formatAmountWithSymbol } from '../../../utils/formatAmountWithSymbol';
import { minutesToDuration } from '../../../utils/minuteToDuration';
import { tSafe } from '../../../utils/tSafe';

import { useTheme } from '../../../theme';
import { AppText } from '../../../ui';

const { height } = Dimensions.get('window');

const Earnings = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const {
    bookingId,
    notificationId,
  } = route.params || {};

  const {
    currentUserId,
    currency,
    currentUser,
    geolocationData,
  } = useContext(AuthContext);

  const { theme, isDark } = useTheme();

  const styles = createStyles(theme, isDark);

  const [selectedPeriod, setSelectedPeriod] =
    useState('week');

  const [earningsData, setEarningsData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [modalVisible, setModalVisible] =
    useState(false);

  const [selectedPayment, setSelectedPayment] =
    useState(null);

  const [slideAnim] =
    useState(
      new Animated.Value(height)
    );

  // ============================================================
  // PERIODS
  // ============================================================

  const periods = useMemo(
    () => [
      {
        id: 'week',
        label: tSafe(
          'this_week',
          'This Week'
        ),
      },
      {
        id: 'month',
        label: tSafe(
          'this_month',
          'This Month'
        ),
      },
      {
        id: 'quarter',
        label: tSafe(
          'this_quarter',
          'This Quarter'
        ),
      },
      {
        id: 'year',
        label: tSafe(
          'this_year',
          'This Year'
        ),
      },
    ],
    []
  );

  // ============================================================
  // EARNING TYPE HELPERS
  // ============================================================

  const getEarningType = payment => {
    if (
      payment?.type ===
        'replacement_compensation' ||
      payment?.service ===
        'Replacement Compensation'
    ) {
      return 'replacement_compensation';
    }

    return 'completed_cleaning';
  };

  const isReplacementCompensation =
    payment => {
      return (
        getEarningType(payment) ===
        'replacement_compensation'
      );
    };

  const getEarningTypeLabel = payment => {
    if (
      isReplacementCompensation(
        payment
      )
    ) {
      return tSafe(
        'replacement_compensation',
        'Replacement Compensation'
      );
    }

    return tSafe(
      'completed_cleaning_job',
      'Completed Cleaning Job'
    );
  };

  const getEarningTypeIcon = payment => {
    if (
      isReplacementCompensation(
        payment
      )
    ) {
      return 'cash-refund';
    }

    return 'broom';
  };

  const getEarningTypeColor = payment => {
    if (
      isReplacementCompensation(
        payment
      )
    ) {
      return theme.status.info;
    }

    return theme.status.success;
  };

  // ============================================================
  // REPLACEMENT SOURCE
  // ============================================================

  const getReplacementSourceLabel =
    source => {
      switch (
        String(source || '')
          .toLowerCase()
      ) {
        case 'ical':
        case 'ical_date_change':
          return tSafe(
            'ical_change',
            'iCal Change'
          );

        case 'host_manual':
        case 'manual_schedule_change':
        case 'manual':
          return tSafe(
            'manual_change',
            'Manual Schedule Change'
          );

        case 'cleaner_cancellation':
          return tSafe(
            'cleaner_cancellation',
            'Cleaner Cancellation'
          );

        case 'host_removal':
          return tSafe(
            'host_removal',
            'Host Removal'
          );

        default:
          return tSafe(
            'replacement',
            'Replacement'
          );
      }
    };

  // ============================================================
  // NORMALIZE EARNINGS
  // ============================================================

  const normalizeEarningsData =
    data => {
      const completedPayments =
        Array.isArray(
          data?.recentPayments
        )
          ? data.recentPayments.map(
              payment => ({
                ...payment,

                type:
                  payment?.type ||
                  'completed_cleaning',

                service:
                  payment?.service ||
                  'Completed Cleaning Job',
              })
            )
          : [];

      const replacementPayments =
        Array.isArray(
          data?.replacementPayments
        )
          ? data.replacementPayments.map(
              payment => ({
                ...payment,

                type:
                  'replacement_compensation',

                service:
                  'Replacement Compensation',

                status:
                  payment?.status ||
                  'paid',
              })
            )
          : [];

      const allPayments = [
        ...completedPayments,
        ...replacementPayments,
      ];

      return {
        ...data,

        recentPayments:
          completedPayments,

        replacementPayments:
          replacementPayments,

        allEarnings:
          allPayments,
      };
    };

  // ============================================================
  // FALLBACK DATA
  // ============================================================

  const getFallbackData = () => {
    const cleanerName =
      currentUser
        ? `${currentUser.firstname || ''} ${
            currentUser.lastname || ''
          }`.trim()
        : tSafe(
            'cleaner',
            'Cleaner'
          );

    return {
      totalEarnings: 0,
      cleaningEarnings: 0,
      replacementCompensation: 0,
      completedJobs: 0,
      averageRating: 0,
      averageEarningsPerJob: 0,
      monthlyGrowth: 0,
      upcomingPayout: 0,

      payoutDate:
        new Date()
          .toISOString()
          .split('T')[0],

      earningsBreakdown: {
        week: 0,
        month: 0,
        quarter: 0,
        year: 0,
      },

      replacementCompensationBreakdown: {
        week: 0,
        month: 0,
        quarter: 0,
        year: 0,
      },

      recentPayments: [],

      replacementPayments: [],

      allEarnings: [],

      performance: {
        jobsCompleted: 0,
        repeatClients: 0,
        cancellationRate: 0,
        responseTime: 0,
        acceptanceRate: 0,
      },

      cleanerInfo: {
        name: cleanerName,
        avatar:
          currentUser?.avatar ||
          '',
        badges:
          currentUser?.badges ||
          [],
        rankingScore:
          currentUser?.ranking_score ||
          0,
      },
    };
  };

  // ============================================================
  // FETCH EARNINGS
  // ============================================================

  const fetchEarningsData =
    async () => {
      if (!currentUserId) {
        return;
      }

      try {
        setLoading(true);

        const response =
          await userService.getCleanerEarnings(
            currentUserId
          );

        console.log(
          'Earnings API Response:',
          response
        );

        const responseData =
          response?.data ||
          response ||
          null;

        if (!responseData) {
          throw new Error(
            'No data received from API'
          );
        }

        const normalizedData =
          normalizeEarningsData(
            responseData
          );

        setEarningsData(
          normalizedData
        );
      } catch (error) {
        console.error(
          'Error fetching earnings data:',
          error
        );

        setEarningsData(
          getFallbackData()
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    if (currentUserId) {
      fetchEarningsData();
    }
  }, [currentUserId]);

  // ============================================================
  // REFRESH WHEN SCREEN FOCUSES
  // ============================================================

  useFocusEffect(
    React.useCallback(
      () => {
        if (currentUserId) {
          fetchEarningsData();
        }
      },
      [currentUserId]
    )
  );

  // ============================================================
  // PULL TO REFRESH
  // ============================================================

  const onRefresh =
    React.useCallback(
      () => {
        setRefreshing(true);
        fetchEarningsData();
      },
      [currentUserId]
    );

  // ============================================================
  // PERIOD EARNINGS
  // ============================================================

  const getPeriodEarnings =
    () => {
      return (
        Number(
          earningsData
            ?.earningsBreakdown?.[
            selectedPeriod
          ]
        ) || 0
      );
    };

  // ============================================================
  // PERIOD JOB EARNINGS
  // ============================================================

  const getPeriodJobEarnings =
    () => {
      const breakdown =
        earningsData
          ?.earningsBreakdown;

      return Number(
        breakdown?.[
          selectedPeriod
        ] || 0
      );
    };

  // ============================================================
  // PERIOD COMPENSATION
  // ============================================================

  const getPeriodCompensation =
    () => {
      const breakdown =
        earningsData
          ?.replacementCompensationBreakdown;

      return Number(
        breakdown?.[
          selectedPeriod
        ] || 0
      );
    };

  // ============================================================
  // CURRENCY
  // ============================================================

  const formatCurrency =
    amount => {
      return formatAmountWithSymbol(
        Number(amount || 0),
        currency
      );
    };

  // ============================================================
  // DATE
  // ============================================================

  const formatDate =
    dateString => {
      try {
        if (!dateString) {
          return tSafe(
            'date_unknown',
            'Date unknown'
          );
        }

        const date =
          new Date(
            dateString
          );

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          return tSafe(
            'invalid_date',
            'Invalid date'
          );
        }

        return date.toLocaleDateString(
          'en-US',
          {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }
        );
      } catch (error) {
        return tSafe(
          'invalid_date',
          'Invalid date'
        );
      }
    };

  // ============================================================
  // DATE + TIME
  // ============================================================

  const formatDateTime =
    dateString => {
      try {
        if (!dateString) {
          return tSafe(
            'date_unknown',
            'Date unknown'
          );
        }

        const date =
          new Date(
            dateString
          );

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          return tSafe(
            'invalid_date',
            'Invalid date'
          );
        }

        return date.toLocaleString(
          'en-US',
          {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }
        );
      } catch (error) {
        return tSafe(
          'invalid_date',
          'Invalid date'
        );
      }
    };

  // ============================================================
  // BADGES
  // ============================================================

  const renderBadges =
    () => {
      const badges =
        earningsData
          ?.cleanerInfo?.badges ||
        [];

      if (!badges.length) {
        return null;
      }

      return (
        <View
          style={
            styles.badgesContainer
          }
        >
          {badges
            .slice(0, 3)
            .map(
              (
                badge,
                index
              ) => (
                <View
                  key={index}
                  style={
                    styles.badge
                  }
                >
                  <MaterialCommunityIcons
                    name="trophy"
                    size={12}
                    color={
                      theme.status.warning
                    }
                  />

                  <AppText
                    variant="caption"
                    style={
                      styles.badgeText
                    }
                  >
                    {badge}
                  </AppText>
                </View>
              )
            )}

          {badges.length >
            3 && (
            <AppText
              variant="caption"
              style={
                styles.moreBadgesText
              }
            >
              {tSafe(
                'more_badges',
                '+{count} more',
                {
                  count:
                    badges.length -
                    3,
                }
              )}
            </AppText>
          )}
        </View>
      );
    };

  // ============================================================
  // OPEN PAYMENT MODAL
  // ============================================================

  const openPaymentModal =
    payment => {
      setSelectedPayment(
        payment
      );

      setModalVisible(
        true
      );

      Animated.timing(
        slideAnim,
        {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }
      ).start();
    };

  // ============================================================
  // CLOSE PAYMENT MODAL
  // ============================================================

  const closePaymentModal =
    () => {
      Animated.timing(
        slideAnim,
        {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }
      ).start(
        () => {
          setModalVisible(
            false
          );

          setSelectedPayment(
            null
          );
        }
      );
    };

  // ============================================================
  // LOADING
  // ============================================================

  if (
    loading &&
    !refreshing
  ) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color={
            theme.brand.primary
          }
        />

        <AppText
          variant="body"
          style={
            styles.loadingText
          }
        >
          {tSafe(
            'loading_earnings',
            'Loading earnings data...'
          )}
        </AppText>
      </View>
    );
  }

  // ============================================================
  // CLEANER INFO
  // ============================================================

  const cleanerInfo =
    earningsData
      ?.cleanerInfo || {
      name: currentUser
        ? `${currentUser.firstname || ''} ${
            currentUser.lastname || ''
          }`.trim()
        : tSafe(
            'cleaner',
            'Cleaner'
          ),

      avatar:
        currentUser?.avatar ||
        '',

      rankingScore:
        currentUser?.ranking_score ||
        0,
    };

  const currentPeriodLabel =
    periods.find(
      period =>
        period.id ===
        selectedPeriod
    )?.label || '';

  const recentEarnings =
    earningsData
      ?.allEarnings || [];

  const selectedIsCompensation =
    selectedPayment &&
    isReplacementCompensation(
      selectedPayment
    );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          HEADER
          ====================================================== */}

      <View
        style={
          styles.header
        }
      >
        <TouchableOpacity
          style={
            styles.backButton
          }
          onPress={() =>
            navigation.goBack()
          }
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={
              theme.icon.active
            }
          />
        </TouchableOpacity>

        <View
          style={
            styles.headerUserInfo
          }
        >
          {cleanerInfo?.avatar ? (
            <Image
              source={{
                uri:
                  cleanerInfo.avatar,
              }}
              style={
                styles.userAvatar
              }
            />
          ) : (
            <View
              style={
                styles.userAvatarPlaceholder
              }
            >
              <MaterialCommunityIcons
                name="account"
                size={20}
                color={
                  theme.text.inverse
                }
              />
            </View>
          )}

          <View>
            <AppText
              variant="body"
              style={
                styles.userName
              }
            >
              {cleanerInfo?.name ||
                tSafe(
                  'cleaner',
                  'Cleaner'
                )}
            </AppText>

            <AppText
              variant="caption"
              style={
                styles.userSubtitle
              }
            >
              {tSafe(
                'ranking_label',
                'Ranking: {score}',
                {
                  score:
                    Number(
                      cleanerInfo?.rankingScore ||
                        0
                    ).toFixed(1),
                }
              )}
            </AppText>
          </View>
        </View>

        <TouchableOpacity
          style={
            styles.helpButton
          }
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="help-circle-outline"
            size={24}
            color={
              theme.icon.active
            }
          />
        </TouchableOpacity>
      </View>

      {/* ======================================================
          SCROLL CONTENT
          ====================================================== */}

      <ScrollView
        style={
          styles.scrollView
        }
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              onRefresh
            }
            tintColor={
              theme.brand.primary
            }
            colors={[
              theme.brand.primary,
            ]}
            progressBackgroundColor={
              theme.surface.elevated
            }
          />
        }
      >
        <View
          style={
            styles.content
          }
        >
          {/* ==================================================
              PERIOD SELECTOR
              ================================================== */}

          <View
            style={
              styles.periodSelector
            }
          >
            {periods.map(
              period => (
                <TouchableOpacity
                  key={
                    period.id
                  }
                  style={[
                    styles.periodButton,
                    selectedPeriod ===
                      period.id &&
                      styles.periodButtonActive,
                  ]}
                  onPress={() =>
                    setSelectedPeriod(
                      period.id
                    )
                  }
                  activeOpacity={0.8}
                >
                  <AppText
                    variant="caption"
                    style={[
                      styles.periodButtonText,
                      selectedPeriod ===
                        period.id &&
                        styles.periodButtonTextActive,
                    ]}
                  >
                    {
                      period.label
                    }
                  </AppText>
                </TouchableOpacity>
              )
            )}
          </View>

          {/* ==================================================
              EARNINGS SUMMARY
              ================================================== */}

          <View
            style={
              styles.earningsCard
            }
          >
            <AppText
              variant="caption"
              style={
                styles.earningsLabel
              }
            >
              {tSafe(
                'total_earnings_label',
                'Total Earnings ({period})',
                {
                  period:
                    currentPeriodLabel,
                }
              )}
            </AppText>

            <AppText
              variant="title"
              style={
                styles.earningsAmount
              }
            >
              {formatCurrency(
                getPeriodEarnings()
              )}
            </AppText>

            <View
              style={
                styles.earningsTypeBreakdown
              }
            >
              <View
                style={
                  styles.earningsTypeItem
                }
              >
                <View
                  style={[
                    styles.earningsTypeIcon,
                    {
                      backgroundColor:
                        `${theme.status.success}30`,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="broom"
                    size={18}
                    color={
                      theme.status.success
                    }
                  />
                </View>

                <View
                  style={
                    styles.earningsTypeInfo
                  }
                >
                  <AppText
                    variant="caption"
                    style={
                      styles.earningsTypeLabel
                    }
                  >
                    {tSafe(
                      'job_earnings',
                      'Job Earnings'
                    )}
                  </AppText>

                  <AppText
                    variant="body"
                    style={
                      styles.earningsTypeAmount
                    }
                  >
                    {formatCurrency(
                      getPeriodJobEarnings()
                    )}
                  </AppText>
                </View>
              </View>

              <View
                style={
                  styles.earningsTypeItemLast
                }
              >
                <View
                  style={[
                    styles.earningsTypeIcon,
                    {
                      backgroundColor:
                        `${theme.status.info}30`,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="cash-refund"
                    size={18}
                    color={
                      theme.status.info
                    }
                  />
                </View>

                <View
                  style={
                    styles.earningsTypeInfo
                  }
                >
                  <AppText
                    variant="caption"
                    style={
                      styles.earningsTypeLabel
                    }
                  >
                    {tSafe(
                      'compensation',
                      'Compensation'
                    )}
                  </AppText>

                  <AppText
                    variant="body"
                    style={
                      styles.earningsTypeAmount
                    }
                  >
                    {formatCurrency(
                      getPeriodCompensation()
                    )}
                  </AppText>
                </View>
              </View>
            </View>

            <View
              style={
                styles.earningsStats
              }
            >
              <View
                style={
                  styles.stat
                }
              >
                <MaterialCommunityIcons
                  name="check-circle"
                  size={16}
                  color={
                    theme.status.success
                  }
                />

                <AppText
                  variant="caption"
                  style={
                    styles.statText
                  }
                >
                  {tSafe(
                    'jobs_count',
                    '{count} jobs',
                    {
                      count:
                        earningsData?.completedJobs ||
                        0,
                    }
                  )}
                </AppText>
              </View>

              <View
                style={
                  styles.stat
                }
              >
                <MaterialCommunityIcons
                  name="star"
                  size={16}
                  color={
                    theme.status.warning
                  }
                />

                <AppText
                  variant="caption"
                  style={
                    styles.statText
                  }
                >
                  {tSafe(
                    'rating_label',
                    '{rating} rating',
                    {
                      rating:
                        Number(
                          earningsData?.averageRating ||
                            0
                        ).toFixed(1),
                    }
                  )}
                </AppText>
              </View>

              <View
                style={
                  styles.stat
                }
              >
                <MaterialCommunityIcons
                  name="trending-up"
                  size={16}
                  color={
                    theme.status.success
                  }
                />

                <AppText
                  variant="caption"
                  style={
                    styles.statText
                  }
                >
                  {earningsData
                    ?.averageEarningsPerJob
                    ? tSafe(
                        'per_job',
                        '{amount}/job',
                        {
                          amount:
                            formatCurrency(
                              earningsData.averageEarningsPerJob
                            ),
                        }
                      )
                    : tSafe(
                        'zero_per_job',
                        '$0.00/job'
                      )}
                </AppText>
              </View>
            </View>

            {renderBadges()}
          </View>

          {/* ==================================================
              UPCOMING PAYOUT
              ================================================== */}

          <View
            style={
              styles.payoutCard
            }
          >
            <View
              style={
                styles.payoutHeader
              }
            >
              <MaterialCommunityIcons
                name="cash-fast"
                size={24}
                color={
                  theme.icon.active
                }
              />

              <View
                style={
                  styles.payoutInfo
                }
              >
                <AppText
                  variant="caption"
                  style={
                    styles.payoutLabel
                  }
                >
                  {tSafe(
                    'next_payout',
                    'Next Payout'
                  )}
                </AppText>

                <AppText
                  variant="title"
                  style={
                    styles.payoutAmount
                  }
                >
                  {formatCurrency(
                    earningsData?.upcomingPayout ||
                      0
                  )}
                </AppText>
              </View>
            </View>

            <View
              style={
                styles.payoutDetails
              }
            >
              <AppText
                variant="caption"
                style={
                  styles.payoutDate
                }
              >
                {tSafe(
                  'processing_on',
                  'Processing on {date}',
                  {
                    date:
                      formatDate(
                        earningsData?.payoutDate
                      ),
                  }
                )}
              </AppText>

              {earningsData?.monthlyGrowth >
              0 ? (
                <AppText
                  variant="caption"
                  style={
                    styles.growthText
                  }
                >
                  ↑{' '}
                  {tSafe(
                    'growth_positive',
                    '+{percent}% this month',
                    {
                      percent:
                        Number(
                          earningsData.monthlyGrowth ||
                            0
                        ).toFixed(1),
                    }
                  )}
                </AppText>
              ) : earningsData?.monthlyGrowth <
                0 ? (
                <AppText
                  variant="caption"
                  style={
                    styles.growthTextNegative
                  }
                >
                  ↓{' '}
                  {tSafe(
                    'growth_negative',
                    '{percent}% this month',
                    {
                      percent:
                        Number(
                          earningsData.monthlyGrowth ||
                            0
                        ).toFixed(1),
                    }
                  )}
                </AppText>
              ) : null}
            </View>
          </View>

          {/* ==================================================
              PERFORMANCE
              ================================================== */}

          <View
            style={
              styles.section
            }
          >
            <AppText
              variant="title"
              style={
                styles.sectionTitle
              }
            >
              {tSafe(
                'performance_metrics',
                'Performance Metrics'
              )}
            </AppText>

            <View
              style={
                styles.metricsGrid
              }
            >
              <View
                style={
                  styles.metricCard
                }
              >
                <AppText
                  variant="title"
                  style={
                    styles.metricValue
                  }
                >
                  {earningsData
                    ?.performance
                    ?.jobsCompleted ||
                    0}
                </AppText>

                <AppText
                  variant="caption"
                  style={
                    styles.metricLabel
                  }
                >
                  {tSafe(
                    'jobs_completed',
                    'Jobs Completed'
                  )}
                </AppText>
              </View>

              <View
                style={
                  styles.metricCard
                }
              >
                <AppText
                  variant="title"
                  style={
                    styles.metricValue
                  }
                >
                  {earningsData
                    ?.performance
                    ?.repeatClients ||
                    0}
                </AppText>

                <AppText
                  variant="caption"
                  style={
                    styles.metricLabel
                  }
                >
                  {tSafe(
                    'repeat_clients',
                    'Repeat Clients'
                  )}
                </AppText>
              </View>

              <View
                style={
                  styles.metricCard
                }
              >
                <AppText
                  variant="title"
                  style={
                    styles.metricValue
                  }
                >
                  {(
                    Number(
                      earningsData
                        ?.performance
                        ?.cancellationRate ||
                        0
                    ) * 100
                  ).toFixed(1)}
                  %
                </AppText>

                <AppText
                  variant="caption"
                  style={
                    styles.metricLabel
                  }
                >
                  {tSafe(
                    'cancellation_rate',
                    'Cancellation Rate'
                  )}
                </AppText>
              </View>

              <View
                style={
                  styles.metricCard
                }
              >
                <AppText
                  variant="title"
                  style={
                    styles.metricValue
                  }
                >
                  {minutesToDuration(
                    earningsData
                      ?.performance
                      ?.responseTime
                  ) ||
                    '0 min'}
                </AppText>

                <AppText
                  variant="caption"
                  style={
                    styles.metricLabel
                  }
                >
                  {tSafe(
                    'avg_response',
                    'Avg. Response'
                  )}
                </AppText>
              </View>

              <View
                style={[
                  styles.metricCard,
                  styles.fullWidthMetric,
                ]}
              >
                <AppText
                  variant="title"
                  style={
                    styles.metricValue
                  }
                >
                  {(
                    Number(
                      earningsData
                        ?.performance
                        ?.acceptanceRate ||
                        0
                    ) * 100
                  ).toFixed(0)}
                  %
                </AppText>

                <AppText
                  variant="caption"
                  style={
                    styles.metricLabel
                  }
                >
                  {tSafe(
                    'job_acceptance_rate',
                    'Job Acceptance Rate'
                  )}
                </AppText>
              </View>
            </View>
          </View>

          {/* ==================================================
              RECENT EARNINGS
              ================================================== */}

          <View
            style={
              styles.section
            }
          >
            <View
              style={
                styles.sectionHeader
              }
            >
              <AppText
                variant="title"
                style={
                  styles.sectionTitle
                }
              >
                {tSafe(
                  'recent_earnings',
                  'Recent Earnings'
                )}
              </AppText>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(
                    ROUTES.cleaner_payment_history
                  )
                }
              >
                <AppText
                  variant="caption"
                  style={
                    styles.seeAllText
                  }
                >
                  {tSafe(
                    'see_all',
                    'See All'
                  )}
                </AppText>
              </TouchableOpacity>
            </View>

            {recentEarnings.length >
            0 ? (
              recentEarnings
                .slice(0, 3)
                .map(
                  (
                    payment,
                    index
                  ) => {
                    const compensation =
                      isReplacementCompensation(
                        payment
                      );

                    const typeColor =
                      getEarningTypeColor(
                        payment
                      );

                    return (
                      <TouchableOpacity
                        key={
                          payment.id ||
                          `earning-${index}`
                        }
                        style={
                          styles.paymentItem
                        }
                        onPress={() =>
                          openPaymentModal(
                            payment
                          )
                        }
                        activeOpacity={
                          0.7
                        }
                      >
                        <View
                          style={[
                            styles.paymentIcon,
                            {
                              backgroundColor:
                                `${typeColor}18`,
                            },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={getEarningTypeIcon(
                              payment
                            )}
                            size={20}
                            color={
                              typeColor
                            }
                          />
                        </View>

                        <View
                          style={
                            styles.paymentDetails
                          }
                        >
                          <View
                            style={
                              styles.paymentTitleRow
                            }
                          >
                            <AppText
                              variant="body"
                              style={
                                styles.paymentService
                              }
                              numberOfLines={
                                1
                              }
                            >
                              {getEarningTypeLabel(
                                payment
                              )}
                            </AppText>
                          </View>

                          <AppText
                            variant="caption"
                            style={
                              styles.paymentClient
                            }
                            numberOfLines={
                              1
                            }
                          >
                            {compensation
                              ? getReplacementSourceLabel(
                                  payment.source
                                )
                              : payment.apartment_name ||
                                tSafe(
                                  'cleaning_service',
                                  'Cleaning Service'
                                )}
                          </AppText>

                          <AppText
                            variant="caption"
                            style={
                              styles.paymentDate
                            }
                          >
                            {payment.date
                              ? formatDate(
                                  payment.date
                                )
                              : tSafe(
                                  'date_unknown',
                                  'Date unknown'
                                )}

                            {!compensation &&
                            payment.duration
                              ? ` • ${minutesToDuration(
                                  payment.duration
                                )}`
                              : ''}
                          </AppText>
                        </View>

                        <View
                          style={
                            styles.paymentAmountContainer
                          }
                        >
                          <AppText
                            variant="body"
                            style={[
                              styles.paymentAmount,
                              {
                                color:
                                  typeColor,
                              },
                            ]}
                          >
                            +
                            {formatAmountWithSymbol(
                              payment.amount,
                              currency
                            )}
                          </AppText>

                          <MaterialCommunityIcons
                            name="chevron-right"
                            size={20}
                            color={
                              theme.icon.muted
                            }
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  }
                )
            ) : (
              <View
                style={
                  styles.emptyState
                }
              >
                <MaterialCommunityIcons
                  name="cash-remove"
                  size={48}
                  color={
                    theme.icon.muted
                  }
                />

                <AppText
                  variant="body"
                  style={
                    styles.emptyStateText
                  }
                >
                  {tSafe(
                    'no_recent_payments',
                    'No recent earnings'
                  )}
                </AppText>

                <AppText
                  variant="caption"
                  style={
                    styles.emptyStateSubtext
                  }
                >
                  {tSafe(
                    'complete_jobs_to_see_earnings',
                    'Complete jobs to see your earnings here'
                  )}
                </AppText>
              </View>
            )}
          </View>

          {/* ==================================================
              QUICK ACTIONS
              ================================================== */}

          <View
            style={
              styles.quickActions
            }
          >
            <TouchableOpacity
              style={
                styles.actionButton
              }
              onPress={() =>
                navigation.navigate(
                  ROUTES.cleaner_earning_detail_report
                )
              }
            >
              <MaterialCommunityIcons
                name="chart-box"
                size={24}
                color={
                  theme.icon.active
                }
              />

              <AppText
                variant="caption"
                style={
                  styles.actionText
                }
              >
                {tSafe(
                  'detailed_reports',
                  'Detailed Reports'
                )}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.actionButton
              }
              onPress={() =>
                navigation.navigate(
                  ROUTES.cleaner_payout_settings
                )
              }
            >
              <MaterialCommunityIcons
                name="bank-outline"
                size={24}
                color={
                  theme.icon.active
                }
              />

              <AppText
                variant="caption"
                style={
                  styles.actionText
                }
              >
                {tSafe(
                  'payout_settings',
                  'Payout Settings'
                )}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.actionButton
              }
              onPress={() =>
                navigation.navigate(
                  ROUTES.cleaner_tax_document
                )
              }
            >
              <MaterialCommunityIcons
                name="file-document"
                size={24}
                color={
                  theme.icon.active
                }
              />

              <AppText
                variant="caption"
                style={
                  styles.actionText
                }
              >
                {tSafe(
                  'tax_documents',
                  'Tax Documents'
                )}
              </AppText>
            </TouchableOpacity>
          </View>

          {/* ==================================================
              LIFETIME EARNINGS
              ================================================== */}

          <View
            style={
              styles.lifetimeEarnings
            }
          >
            <View
              style={
                styles.lifetimeHeader
              }
            >
              <MaterialCommunityIcons
                name="trophy"
                size={20}
                color={
                  theme.status.warning
                }
              />

              <AppText
                variant="body"
                style={
                  styles.lifetimeTitle
                }
              >
                {tSafe(
                  'lifetime_earnings',
                  'Lifetime Earnings'
                )}
              </AppText>
            </View>

            <AppText
              variant="title"
              style={
                styles.lifetimeAmount
              }
            >
              {formatCurrency(
                earningsData?.totalEarnings ||
                  0
              )}
            </AppText>

            <AppText
              variant="caption"
              style={
                styles.lifetimeSubtitle
              }
            >
              {tSafe(
                'total_from_jobs_and_compensation',
                'Total from completed jobs and replacement compensation'
              )}
            </AppText>

            <View
              style={
                styles.lifetimeBreakdown
              }
            >
              <View
                style={
                  styles.lifetimeBreakdownItem
                }
              >
                <View
                  style={[
                    styles.lifetimeDot,
                    {
                      backgroundColor:
                        theme.status.success,
                    },
                  ]}
                />

                <AppText
                  variant="caption"
                  style={
                    styles.lifetimeBreakdownLabel
                  }
                >
                  {tSafe(
                    'completed_jobs',
                    'Completed Jobs'
                  )}
                </AppText>

                <AppText
                  variant="body"
                  style={
                    styles.lifetimeBreakdownAmount
                  }
                >
                  {formatCurrency(
                    earningsData?.cleaningEarnings ||
                      0
                  )}
                </AppText>
              </View>

              <View
                style={
                  styles.lifetimeBreakdownItem
                }
              >
                <View
                  style={[
                    styles.lifetimeDot,
                    {
                      backgroundColor:
                        theme.status.info,
                    },
                  ]}
                />

                <AppText
                  variant="caption"
                  style={
                    styles.lifetimeBreakdownLabel
                  }
                >
                  {tSafe(
                    'replacement_compensation',
                    'Replacement Compensation'
                  )}
                </AppText>

                <AppText
                  variant="body"
                  style={
                    styles.lifetimeBreakdownAmount
                  }
                >
                  {formatCurrency(
                    earningsData?.replacementCompensation ||
                      0
                  )}
                </AppText>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ======================================================
          PAYMENT / COMPENSATION DETAILS MODAL
          ====================================================== */}

      <Modal
        visible={
          modalVisible
        }
        transparent
        animationType="fade"
        onRequestClose={
          closePaymentModal
        }
        statusBarTranslucent
      >
        <TouchableOpacity
          style={
            styles.modalOverlay
          }
          activeOpacity={1}
          onPress={
            closePaymentModal
          }
        >
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [
                  {
                    translateY:
                      slideAnim,
                  },
                ],
              },
            ]}
          >
            <View
              style={
                styles.dragHandleContainer
              }
            >
              <View
                style={
                  styles.dragHandle
                }
              />
            </View>

            <ScrollView
              style={
                styles.modalContent
              }
              showsVerticalScrollIndicator={
                false
              }
              bounces={false}
            >
              {selectedPayment && (
                <>
                  {/* ==================================================
                      MODAL HEADER
                      ================================================== */}

                  <View
                    style={
                      styles.modalHeader
                    }
                  >
                    <View
                      style={[
                        styles.modalPaymentIcon,
                        {
                          backgroundColor:
                            `${getEarningTypeColor(
                              selectedPayment
                            )}18`,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={getEarningTypeIcon(
                          selectedPayment
                        )}
                        size={32}
                        color={getEarningTypeColor(
                          selectedPayment
                        )}
                      />
                    </View>

                    <AppText
                      variant="title"
                      style={
                        styles.modalPaymentAmount
                      }
                    >
                      +
                      {formatCurrency(
                        selectedPayment.amount
                      )}
                    </AppText>

                    <AppText
                      variant="caption"
                      style={[
                        styles.modalPaymentStatus,
                        {
                          color:
                            getEarningTypeColor(
                              selectedPayment
                            ),
                          backgroundColor:
                            `${getEarningTypeColor(
                              selectedPayment
                            )}18`,
                        },
                      ]}
                    >
                      {getEarningTypeLabel(
                        selectedPayment
                      )}
                    </AppText>
                  </View>

                  <View
                    style={
                      styles.divider
                    }
                  />

                  {/* ==================================================
                      EARNING DETAILS
                      ================================================== */}

                  <View
                    style={
                      styles.detailsSection
                    }
                  >
                    <AppText
                      variant="body"
                      style={
                        styles.sectionLabel
                      }
                    >
                      {tSafe(
                        'earning_details',
                        'Earning Details'
                      )}
                    </AppText>

                    <View
                      style={
                        styles.detailRow
                      }
                    >
                      <MaterialCommunityIcons
                        name={getEarningTypeIcon(
                          selectedPayment
                        )}
                        size={20}
                        color={getEarningTypeColor(
                          selectedPayment
                        )}
                      />

                      <View
                        style={
                          styles.detailTextContainer
                        }
                      >
                        <AppText
                          variant="caption"
                          style={
                            styles.detailLabel
                          }
                        >
                          {tSafe(
                            'earning_type',
                            'Earning Type'
                          )}
                        </AppText>

                        <AppText
                          variant="body"
                          style={[
                            styles.detailValue,
                            {
                              color:
                                getEarningTypeColor(
                                  selectedPayment
                                ),
                            },
                          ]}
                        >
                          {getEarningTypeLabel(
                            selectedPayment
                          )}
                        </AppText>
                      </View>
                    </View>

                    {/* ==================================================
                        COMPENSATION
                        ================================================== */}

                    {selectedIsCompensation && (
                      <>
                        <View
                          style={
                            styles.detailRow
                          }
                        >
                          <MaterialCommunityIcons
                            name="swap-horizontal"
                            size={20}
                            color={
                              theme.icon.muted
                            }
                          />

                          <View
                            style={
                              styles.detailTextContainer
                            }
                          >
                            <AppText
                              variant="caption"
                              style={
                                styles.detailLabel
                              }
                            >
                              {tSafe(
                                'reason',
                                'Reason'
                              )}
                            </AppText>

                            <AppText
                              variant="body"
                              style={
                                styles.detailValue
                              }
                            >
                              {getReplacementSourceLabel(
                                selectedPayment.source
                              )}
                            </AppText>
                          </View>
                        </View>

                        <View
                          style={
                            styles.compensationNotice
                          }
                        >
                          <MaterialCommunityIcons
                            name="information-outline"
                            size={20}
                            color={
                              theme.status.info
                            }
                          />

                          <AppText
                            variant="caption"
                            style={
                              styles.compensationNoticeText
                            }
                          >
                            {tSafe(
                              'replacement_compensation_explanation',
                              'This payment is compensation associated with a replacement cleaning event.'
                            )}
                          </AppText>
                        </View>
                      </>
                    )}

                    {/* Property */}

                    <View
                      style={
                        styles.detailRow
                      }
                    >
                      <MaterialCommunityIcons
                        name="home"
                        size={20}
                        color={
                          theme.icon.muted
                        }
                      />

                      <View
                        style={
                          styles.detailTextContainer
                        }
                      >
                        <AppText
                          variant="caption"
                          style={
                            styles.detailLabel
                          }
                        >
                          {tSafe(
                            'property',
                            'Property'
                          )}
                        </AppText>

                        <AppText
                          variant="body"
                          style={
                            styles.detailValue
                          }
                        >
                          {selectedPayment.apartment_name ||
                            selectedPayment.property_name ||
                            tSafe(
                              'unknown_property',
                              'Unknown Property'
                            )}
                        </AppText>
                      </View>
                    </View>

                    {/* Client */}

                    <View
                      style={
                        styles.detailRow
                      }
                    >
                      <MaterialCommunityIcons
                        name="account"
                        size={20}
                        color={
                          theme.icon.muted
                        }
                      />

                      <View
                        style={
                          styles.detailTextContainer
                        }
                      >
                        <AppText
                          variant="caption"
                          style={
                            styles.detailLabel
                          }
                        >
                          {tSafe(
                            'client',
                            'Client'
                          )}
                        </AppText>

                        <AppText
                          variant="body"
                          style={
                            styles.detailValue
                          }
                        >
                          {selectedPayment.client ||
                            tSafe(
                              'anonymous',
                              'Anonymous'
                            )}
                        </AppText>
                      </View>
                    </View>

                    {/* Duration */}

                    {!selectedIsCompensation && (
                      <View
                        style={
                          styles.detailRow
                        }
                      >
                        <MaterialCommunityIcons
                          name="clock-outline"
                          size={20}
                          color={
                            theme.icon.muted
                          }
                        />

                        <View
                          style={
                            styles.detailTextContainer
                          }
                        >
                          <AppText
                            variant="caption"
                            style={
                              styles.detailLabel
                            }
                          >
                            {tSafe(
                              'duration',
                              'Duration'
                            )}
                          </AppText>

                          <AppText
                            variant="body"
                            style={
                              styles.detailValue
                            }
                          >
                            {minutesToDuration(
                              selectedPayment.duration
                            ) ||
                              tSafe(
                                'two_hours',
                                '2 hours'
                              )}
                          </AppText>
                        </View>
                      </View>
                    )}

                    {/* Date */}

                    <View
                      style={
                        styles.detailRow
                      }
                    >
                      <MaterialCommunityIcons
                        name="calendar"
                        size={20}
                        color={
                          theme.icon.muted
                        }
                      />

                      <View
                        style={
                          styles.detailTextContainer
                        }
                      >
                        <AppText
                          variant="caption"
                          style={
                            styles.detailLabel
                          }
                        >
                          {tSafe(
                            'date_time',
                            'Date & Time'
                          )}
                        </AppText>

                        <AppText
                          variant="body"
                          style={
                            styles.detailValue
                          }
                        >
                          {formatDateTime(
                            selectedPayment.date
                          )}
                        </AppText>
                      </View>
                    </View>

                    {/* Status */}

                    <View
                      style={
                        styles.detailRow
                      }
                    >
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={20}
                        color={
                          theme.status.success
                        }
                      />

                      <View
                        style={
                          styles.detailTextContainer
                        }
                      >
                        <AppText
                          variant="caption"
                          style={
                            styles.detailLabel
                          }
                        >
                          {tSafe(
                            'status',
                            'Status'
                          )}
                        </AppText>

                        <AppText
                          variant="body"
                          style={[
                            styles.detailValue,
                            styles.statusCompleted,
                          ]}
                        >
                          {selectedIsCompensation
                            ? tSafe(
                                'paid',
                                'Paid'
                              )
                            : tSafe(
                                'completed',
                                'Completed'
                              )}
                        </AppText>
                      </View>
                    </View>
                  </View>

                  {/* ==================================================
                      REPLACEMENT INFORMATION
                      ================================================== */}

                  {selectedIsCompensation && (
                    <View
                      style={
                        styles.detailsSection
                      }
                    >
                      <AppText
                        variant="body"
                        style={
                          styles.sectionLabel
                        }
                      >
                        {tSafe(
                          'replacement_information',
                          'Replacement Information'
                        )}
                      </AppText>

                      {selectedPayment.policyVersion && (
                        <View
                          style={
                            styles.detailRow
                          }
                        >
                          <MaterialCommunityIcons
                            name="shield-check"
                            size={20}
                            color={
                              theme.icon.muted
                            }
                          />

                          <View
                            style={
                              styles.detailTextContainer
                            }
                          >
                            <AppText
                              variant="caption"
                              style={
                                styles.detailLabel
                              }
                            >
                              {tSafe(
                                'policy_version',
                                'Policy Version'
                              )}
                            </AppText>

                            <AppText
                              variant="caption"
                              style={
                                styles.detailValueSmall
                              }
                            >
                              {
                                selectedPayment.policyVersion
                              }
                            </AppText>
                          </View>
                        </View>
                      )}

                      {selectedPayment.policyRuleId && (
                        <View
                          style={
                            styles.detailRow
                          }
                        >
                          <MaterialCommunityIcons
                            name="file-document-outline"
                            size={20}
                            color={
                              theme.icon.muted
                            }
                          />

                          <View
                            style={
                              styles.detailTextContainer
                            }
                          >
                            <AppText
                              variant="caption"
                              style={
                                styles.detailLabel
                              }
                            >
                              {tSafe(
                                'policy_rule',
                                'Policy Rule'
                              )}
                            </AppText>

                            <AppText
                              variant="caption"
                              style={
                                styles.detailValueSmall
                              }
                            >
                              {
                                selectedPayment.policyRuleId
                              }
                            </AppText>
                          </View>
                        </View>
                      )}

                      {selectedPayment.paymentIntentId && (
                        <View
                          style={
                            styles.detailRow
                          }
                        >
                          <MaterialCommunityIcons
                            name="credit-card-check"
                            size={20}
                            color={
                              theme.icon.muted
                            }
                          />

                          <View
                            style={
                              styles.detailTextContainer
                            }
                          >
                            <AppText
                              variant="caption"
                              style={
                                styles.detailLabel
                              }
                            >
                              {tSafe(
                                'payment_intent',
                                'Payment Intent'
                              )}
                            </AppText>

                            <AppText
                              variant="caption"
                              style={
                                styles.detailValueSmall
                              }
                            >
                              {
                                selectedPayment.paymentIntentId
                              }
                            </AppText>
                          </View>
                        </View>
                      )}
                    </View>
                  )}

                  {/* ==================================================
                      PAYMENT INFORMATION
                      ================================================== */}

                  <View
                    style={
                      styles.detailsSection
                    }
                  >
                    <AppText
                      variant="body"
                      style={
                        styles.sectionLabel
                      }
                    >
                      {tSafe(
                        'payment_information',
                        'Payment Information'
                      )}
                    </AppText>

                    <View
                      style={
                        styles.detailRow
                      }
                    >
                      <MaterialCommunityIcons
                        name="identifier"
                        size={20}
                        color={
                          theme.icon.muted
                        }
                      />

                      <View
                        style={
                          styles.detailTextContainer
                        }
                      >
                        <AppText
                          variant="caption"
                          style={
                            styles.detailLabel
                          }
                        >
                          {tSafe(
                            'payment_id',
                            'Payment ID'
                          )}
                        </AppText>

                        <AppText
                          variant="caption"
                          style={
                            styles.detailValueSmall
                          }
                        >
                          {selectedPayment.id ||
                            'N/A'}
                        </AppText>
                      </View>
                    </View>

                    {selectedPayment.scheduleId && (
                      <View
                        style={
                          styles.detailRow
                        }
                      >
                        <MaterialCommunityIcons
                          name="calendar-check"
                          size={20}
                          color={
                            theme.icon.muted
                          }
                        />

                        <View
                          style={
                            styles.detailTextContainer
                          }
                        >
                          <AppText
                            variant="caption"
                            style={
                              styles.detailLabel
                            }
                          >
                            {tSafe(
                              'schedule_id',
                              'Schedule ID'
                            )}
                          </AppText>

                          <AppText
                            variant="caption"
                            style={
                              styles.detailValueSmall
                            }
                          >
                            {
                              selectedPayment.scheduleId
                            }
                          </AppText>
                        </View>
                      </View>
                    )}

                    {selectedPayment.approval_type && (
                      <View
                        style={
                          styles.detailRow
                        }
                      >
                        <MaterialCommunityIcons
                          name="check-decagram"
                          size={20}
                          color={
                            theme.icon.muted
                          }
                        />

                        <View
                          style={
                            styles.detailTextContainer
                          }
                        >
                          <AppText
                            variant="caption"
                            style={
                              styles.detailLabel
                            }
                          >
                            {tSafe(
                              'approval_type',
                              'Approval Type'
                            )}
                          </AppText>

                          <AppText
                            variant="body"
                            style={
                              styles.detailValue
                            }
                          >
                            {selectedPayment.approval_type ===
                            'manual'
                              ? tSafe(
                                  'manual_approval',
                                  'Manual Approval'
                                )
                              : tSafe(
                                  'automatic',
                                  'Automatic'
                                )}
                          </AppText>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Notes */}

                  {selectedPayment.notes && (
                    <View
                      style={
                        styles.detailsSection
                      }
                    >
                      <AppText
                        variant="body"
                        style={
                          styles.sectionLabel
                        }
                      >
                        {tSafe(
                          'notes',
                          'Notes'
                        )}
                      </AppText>

                      <View
                        style={
                          styles.notesContainer
                        }
                      >
                        <AppText
                          variant="caption"
                          style={
                            styles.notesText
                          }
                        >
                          {
                            selectedPayment.notes
                          }
                        </AppText>
                      </View>
                    </View>
                  )}

                  {/* ==================================================
                      ACTION BUTTONS
                      ================================================== */}

                  <View
                    style={
                      styles.modalActions
                    }
                  >
                    <TouchableOpacity
                      style={[
                        styles.modalActionButton,
                        styles.primaryAction,
                      ]}
                      onPress={() => {
                        closePaymentModal();
                      }}
                    >
                      <MaterialCommunityIcons
                        name="download"
                        size={20}
                        color={
                          theme.text.inverse
                        }
                      />

                      <AppText
                        variant="body"
                        style={
                          styles.primaryActionText
                        }
                      >
                        {tSafe(
                          'download_receipt',
                          'Download Receipt'
                        )}
                      </AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.modalActionButton,
                        styles.secondaryAction,
                      ]}
                      onPress={
                        closePaymentModal
                      }
                    >
                      <AppText
                        variant="body"
                        style={
                          styles.secondaryActionText
                        }
                      >
                        {tSafe(
                          'close',
                          'Close'
                        )}
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ============================================================
// THEME-AWARE STYLES
// ============================================================

const createStyles = (
  theme,
  isDark
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        theme.background.default,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 60,
      paddingBottom: 16,
      backgroundColor:
        theme.surface.default,
      borderBottomWidth: 1,
      borderBottomColor:
        theme.divider,
    },

    headerUserInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginLeft: 12,
    },

    userAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },

    userAvatarPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor:
        theme.brand.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },

    userName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.primary,
    },

    userSubtitle: {
      fontSize: 12,
      color: theme.text.secondary,
      marginTop: 2,
    },

    backButton: {
      padding: 8,
    },

    helpButton: {
      padding: 8,
    },

    scrollView: {
      flex: 1,
      backgroundColor:
        theme.background.default,
    },

    content: {
      padding: 16,
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:
        theme.background.default,
    },

    loadingText: {
      marginTop: 16,
      color: theme.text.secondary,
    },

    // ==========================================================
    // PERIOD SELECTOR
    // ==========================================================

    periodSelector: {
      flexDirection: 'row',
      marginBottom: 20,
      backgroundColor:
        theme.surface.elevated,
      borderRadius: 14,
      padding: 4,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    periodButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 4,
      borderRadius: 10,
      alignItems: 'center',
    },

    periodButtonActive: {
      backgroundColor:
        theme.brand.primary,
    },

    periodButtonText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.text.secondary,
      textAlign: 'center',
    },

    periodButtonTextActive: {
      color: theme.text.inverse,
      fontWeight: '600',
    },

    // ==========================================================
    // EARNINGS CARD — IMPROVED DARK MODE CONTRAST
    // ==========================================================

    earningsCard: {
      backgroundColor: theme.brand.secondary,
      borderRadius: 18,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: `${theme.brand.primary}60`,
    },

    earningsLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
      opacity: 1,
      marginBottom: 8,
    },

    earningsAmount: {
      fontSize: 32,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 16,
      lineHeight: 40,
    },

    earningsTypeBreakdown: {
      backgroundColor: isDark
        ? 'rgba(255,255,255,0.12)'
        : 'rgba(255,255,255,0.10)',
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      borderWidth: isDark ? 1 : 0,
      borderColor: 'rgba(255,255,255,0.16)',
    },

    earningsTypeItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },

    earningsTypeItemLast: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    earningsTypeIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      justifyContent: 'center',
      alignItems: 'center',
    },

    earningsTypeInfo: {
      marginLeft: 10,
      flex: 1,
    },

    earningsTypeLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FFFFFF',
      opacity: 1,
    },

    earningsTypeAmount: {
      fontSize: 16,
      color: '#FFFFFF',
      fontWeight: '800',
      marginTop: 3,
    },

    earningsStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
      flexWrap: 'wrap',
      gap: 8,
    },

    stat: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    statText: {
      fontSize: 12,
      color: '#FFFFFF',
      marginLeft: 4,
      fontWeight: '600',
    },

    badgesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },

    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.18)',
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 12,
      marginRight: 8,
      marginBottom: 4,
    },

    badgeText: {
      fontSize: 11,
      color: '#FFFFFF',
      marginLeft: 4,
      fontWeight: '600',
    },

    moreBadgesText: {
      fontSize: 11,
      color: '#FFFFFF',
      fontWeight: '600',
    },

    // ==========================================================
    // PAYOUT
    // ==========================================================

    payoutCard: {
      backgroundColor:
        theme.card.background,
      borderRadius: 14,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor:
        theme.card.border,
    },

    payoutHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },

    payoutInfo: {
      marginLeft: 12,
      flex: 1,
    },

    payoutLabel: {
      fontSize: 14,
      color: theme.text.secondary,
      marginBottom: 4,
    },

    payoutAmount: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text.primary,
    },

    payoutDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    payoutDate: {
      fontSize: 12,
      color: theme.text.muted,
    },

    growthText: {
      fontSize: 12,
      color: theme.status.success,
      fontWeight: '500',
    },

    growthTextNegative: {
      fontSize: 12,
      color: theme.status.error,
      fontWeight: '500',
    },

    // ==========================================================
    // SECTIONS
    // ==========================================================

    section: {
      marginBottom: 24,
    },

    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text.primary,
    },

    seeAllText: {
      fontSize: 14,
      color: theme.brand.primary,
      fontWeight: '600',
    },

    // ==========================================================
    // METRICS
    // ==========================================================

    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },

    metricCard: {
      flex: 1,
      minWidth: '47%',
      backgroundColor:
        theme.card.background,
      borderRadius: 14,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor:
        theme.card.border,
    },

    fullWidthMetric: {
      minWidth: '100%',
    },

    metricValue: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 4,
    },

    metricLabel: {
      fontSize: 12,
      color: theme.text.secondary,
      textAlign: 'center',
    },

    // ==========================================================
    // PAYMENTS
    // ==========================================================

    paymentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor:
        theme.divider,
    },

    paymentIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },

    paymentDetails: {
      flex: 1,
      minWidth: 0,
    },

    paymentTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    paymentService: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 4,
      flexShrink: 1,
    },

    paymentClient: {
      fontSize: 13,
      color: theme.text.secondary,
      marginBottom: 2,
    },

    paymentDate: {
      fontSize: 12,
      color: theme.text.muted,
    },

    paymentAmountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 8,
    },

    paymentAmount: {
      fontSize: 15,
      fontWeight: '700',
      marginRight: 8,
    },

    emptyState: {
      alignItems: 'center',
      padding: 40,
      backgroundColor:
        theme.surface.sunken ||
        theme.background.sunken,
      borderRadius: 14,
      marginTop: 8,
    },

    emptyStateText: {
      fontSize: 16,
      color: theme.text.secondary,
      marginTop: 12,
      fontWeight: '500',
    },

    emptyStateSubtext: {
      fontSize: 14,
      color: theme.text.muted,
      marginTop: 4,
      textAlign: 'center',
    },

    // ==========================================================
    // QUICK ACTIONS
    // ==========================================================

    quickActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },

    actionButton: {
      flex: 1,
      alignItems: 'center',
      padding: 16,
      backgroundColor:
        theme.card.background,
      borderRadius: 14,
      marginHorizontal: 4,
      borderWidth: 1,
      borderColor:
        theme.card.border,
    },

    actionText: {
      fontSize: 12,
      color: theme.brand.primary,
      marginTop: 8,
      textAlign: 'center',
      fontWeight: '600',
    },

    // ==========================================================
    // LIFETIME
    // ==========================================================

    lifetimeEarnings: {
      backgroundColor:
        theme.card.background,
      borderRadius: 14,
      padding: 20,
      borderWidth: 1,
      borderColor:
        theme.card.border,
    },

    lifetimeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },

    lifetimeTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.primary,
      marginLeft: 8,
    },

    lifetimeAmount: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 4,
    },

    lifetimeSubtitle: {
      fontSize: 14,
      color: theme.text.secondary,
      marginBottom: 16,
    },

    lifetimeBreakdown: {
      borderTopWidth: 1,
      borderTopColor:
        theme.divider,
      paddingTop: 14,
    },

    lifetimeBreakdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },

    lifetimeDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
    },

    lifetimeBreakdownLabel: {
      flex: 1,
      fontSize: 13,
      color: theme.text.secondary,
    },

    lifetimeBreakdownAmount: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text.primary,
    },

    // ==========================================================
    // MODAL
    // ==========================================================

    modalOverlay: {
      flex: 1,
      backgroundColor:
        'rgba(0,0,0,0.55)',
      justifyContent: 'flex-end',
    },

    modalContainer: {
      backgroundColor:
        theme.surface.elevated,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight:
        height * 0.85,
      paddingBottom:
        Platform.OS === 'ios'
          ? 34
          : 24,
    },

    dragHandleContainer: {
      alignItems: 'center',
      paddingVertical: 12,
    },

    dragHandle: {
      width: 40,
      height: 4,
      backgroundColor:
        theme.border.strong,
      borderRadius: 2,
    },

    modalContent: {
      paddingHorizontal: 24,
      paddingBottom: 24,
    },

    modalHeader: {
      alignItems: 'center',
      paddingVertical: 24,
    },

    modalPaymentIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },

    modalPaymentAmount: {
      fontSize: 36,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 8,
    },

    modalPaymentStatus: {
      fontSize: 14,
      fontWeight: '600',
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 12,
      overflow: 'hidden',
    },

    divider: {
      height: 1,
      backgroundColor:
        theme.divider,
      marginVertical: 8,
    },

    detailsSection: {
      marginTop: 24,
    },

    sectionLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 16,
    },

    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },

    detailTextContainer: {
      flex: 1,
      marginLeft: 12,
    },

    detailLabel: {
      fontSize: 14,
      color: theme.text.muted,
      marginBottom: 4,
    },

    detailValue: {
      fontSize: 16,
      color: theme.text.primary,
      fontWeight: '500',
    },

    detailValueSmall: {
      fontSize: 14,
      color: theme.text.secondary,
      fontWeight: '400',
    },

    statusCompleted: {
      color: theme.status.success,
    },

    compensationNotice: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor:
        `${theme.status.info}14`,
      borderRadius: 12,
      padding: 14,
      marginBottom: 20,
      borderWidth: 1,
      borderColor:
        `${theme.status.info}25`,
    },

    compensationNoticeText: {
      flex: 1,
      marginLeft: 10,
      fontSize: 13,
      lineHeight: 19,
      color: theme.text.secondary,
    },

    notesContainer: {
      backgroundColor:
        theme.surface.selected,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    notesText: {
      fontSize: 14,
      color: theme.text.secondary,
      lineHeight: 20,
    },

    modalActions: {
      marginTop: 32,
      gap: 12,
    },

    modalActionButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 14,
      paddingVertical: 16,
      gap: 8,
    },

    primaryAction: {
      backgroundColor:
        theme.brand.primary,
      borderWidth: 0,
    },

    primaryActionText: {
      color: theme.text.inverse,
      fontSize: 16,
      fontWeight: '600',
    },

    secondaryAction: {
      backgroundColor:
        theme.surface.selected,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    secondaryActionText: {
      color: theme.text.secondary,
      fontSize: 16,
      fontWeight: '500',
    },
  });

export default Earnings;


// import React, { useState, useEffect, useContext, useMemo } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   RefreshControl,
//   Image,
//   Modal,
//   Animated,
//   Dimensions,
//   Platform,
// } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
// import userService from '../../../services/connection/userService';
// import { AuthContext } from '../../../context/AuthContext';
// import COLORS from '../../../constants/colors';
// import ROUTES from '../../../constants/routes';
// import { formatAmountWithSymbol } from '../../../utils/formatAmountWithSymbol';
// import { minutesToDuration } from '../../../utils/minuteToDuration';
// import { tSafe } from '../../../utils/tSafe';

// const { width, height } = Dimensions.get('window');

// const Earnings = () => {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { bookingId, notificationId } = route.params || {};
//   const { currentUserId, currency, currentUser, geolocationData } = useContext(AuthContext);


//   const [selectedPeriod, setSelectedPeriod] = useState('week');
//   const [earningsData, setEarningsData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedPayment, setSelectedPayment] = useState(null);
//   const [slideAnim] = useState(new Animated.Value(height));

//   // Define periods with translation keys
//   const periods = useMemo(() => [
//     { id: 'week', label: tSafe('this_week', 'This Week') },
//     { id: 'month', label: tSafe('this_month', 'This Month') },
//     { id: 'quarter', label: tSafe('this_quarter', 'This Quarter') },
//     { id: 'year', label: tSafe('this_year', 'This Year') },
//   ], []);

//   // Fetch earnings data
//   const fetchEarningsData = async () => {
//     if (!currentUserId) return;

//     try {
//       setLoading(true);
      
//       // Call the userService to get cleaner earnings
//       const response = await userService.getCleanerEarnings(currentUserId);
      
//       console.log("Earnings API Response:", response);
      
//       if (response && response.data) {
//         // If your service returns the data in response.data
//         setEarningsData(response.data);
//       } else if (response) {
//         // If the service returns the data directly
//         setEarningsData(response);
//       } else {
//         throw new Error('No data received from API');
//       }
//     } catch (error) {
//       console.error('Error fetching earnings data:', error);
//       // Fallback to empty data structure
//       setEarningsData(getFallbackData());
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   // Load data when component mounts or currentUserId changes
//   useEffect(() => {
//     if (currentUserId) {
//       fetchEarningsData();
//     }
//   }, [currentUserId]);

//   // Refresh data when screen comes into focus
//   useFocusEffect(
//     React.useCallback(() => {
//       if (currentUserId) {
//         fetchEarningsData();
//       }
//     }, [currentUserId])
//   );

//   // Pull to refresh
//   const onRefresh = React.useCallback(() => {
//     setRefreshing(true);
//     fetchEarningsData();
//   }, []);

//   // Open payment modal with animation
//   const openPaymentModal = (payment) => {
//     setSelectedPayment(payment);
//     setModalVisible(true);
//     Animated.timing(slideAnim, {
//       toValue: 0,
//       duration: 300,
//       useNativeDriver: true,
//     }).start();
//   };

//   // Close payment modal with animation
//   const closePaymentModal = () => {
//     Animated.timing(slideAnim, {
//       toValue: height,
//       duration: 250,
//       useNativeDriver: true,
//     }).start(() => {
//       setModalVisible(false);
//       setSelectedPayment(null);
//     });
//   };

//   // Fallback data
//   const getFallbackData = () => {
//     const cleanerName = currentUser 
//       ? `${currentUser.firstname || ''} ${currentUser.lastname || ''}`.trim()
//       : tSafe('cleaner', 'Cleaner');
    
//     return {
//       totalEarnings: 0,
//       completedJobs: 0,
//       averageRating: 0,
//       averageEarningsPerJob: 0,
//       monthlyGrowth: 0,
//       upcomingPayout: 0,
//       payoutDate: new Date().toISOString().split('T')[0],
//       earningsBreakdown: {
//         week: 0,
//         month: 0,
//         quarter: 0,
//         year: 0,
//       },
//       recentPayments: [],
//       performance: {
//         jobsCompleted: 0,
//         repeatClients: 0,
//         cancellationRate: 0,
//         responseTime: '0 min',
//         acceptanceRate: 0,
//       },
//       cleanerInfo: {
//         name: cleanerName,
//         avatar: currentUser?.avatar || '',
//         badges: currentUser?.badges || [],
//         rankingScore: currentUser?.ranking_score || 0,
//       },
//     };
//   };

//   const getPeriodEarnings = () => {
//     return earningsData?.earningsBreakdown[selectedPeriod] || 0;
//   };

//   const formatCurrency = (amount) => {
//     return `${currency}${amount?.toFixed(2) || '0.00'}`;
//   };

//   const formatDate = (dateString) => {
//     try {
//       if (!dateString) return tSafe('date_unknown', 'Date unknown');
//       const date = new Date(dateString);
//       return date.toLocaleDateString('en-US', {
//         month: 'short',
//         day: 'numeric',
//         year: 'numeric',
//       });
//     } catch (error) {
//       return tSafe('invalid_date', 'Invalid date');
//     }
//   };

//   const formatDateTime = (dateString) => {
//     try {
//       if (!dateString) return tSafe('date_unknown', 'Date unknown');
//       const date = new Date(dateString);
//       return date.toLocaleDateString('en-US', {
//         month: 'long',
//         day: 'numeric',
//         year: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//       });
//     } catch (error) {
//       return tSafe('invalid_date', 'Invalid date');
//     }
//   };

//   const renderBadges = () => {
//     const badges = earningsData?.cleanerInfo?.badges || [];
//     if (!badges.length) return null;

//     return (
//       <View style={styles.badgesContainer}>
//         {badges.slice(0, 3).map((badge, index) => (
//           <View key={index} style={styles.badge}>
//             <MaterialCommunityIcons name="trophy" size={12} color="#FFD700" />
//             <Text style={styles.badgeText}>{badge}</Text>
//           </View>
//         ))}
//         {badges.length > 3 && (
//           <Text style={styles.moreBadgesText}>
//             {tSafe('more_badges', '+{count} more', { count: badges.length - 3 })}
//           </Text>
//         )}
//       </View>
//     );
//   };

//   if (loading && !refreshing) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>{tSafe('loading_earnings', 'Loading earnings data...')}</Text>
//       </View>
//     );
//   }

//   // Get cleaner info for display
//   const cleanerInfo = earningsData?.cleanerInfo || {
//     name: currentUser 
//       ? `${currentUser.firstname || ''} ${currentUser.lastname || ''}`.trim()
//       : tSafe('cleaner', 'Cleaner'),
//     avatar: currentUser?.avatar || '',
//     rankingScore: currentUser?.ranking_score || 0,
//   };

//   // Helper to get current period label
//   const currentPeriodLabel = periods.find(p => p.id === selectedPeriod)?.label || '';

//   return (
//     <View style={styles.container}>
//       {/* Header with cleaner info */}
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//         >
//           <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primary} />
//         </TouchableOpacity>
//         <View style={styles.headerUserInfo}>
//           {cleanerInfo?.avatar ? (
//             <Image source={{ uri: cleanerInfo.avatar }} style={styles.userAvatar} />
//           ) : (
//             <View style={styles.userAvatarPlaceholder}>
//               <MaterialCommunityIcons name="account" size={20} color="#FFFFFF" />
//             </View>
//           )}
//           <View>
//             <Text style={styles.userName}>{cleanerInfo?.name || tSafe('cleaner', 'Cleaner')}</Text>
//             <Text style={styles.userSubtitle}>
//               {tSafe('ranking_label', 'Ranking: {score}', { score: (cleanerInfo?.rankingScore || 0).toFixed(1) })}
//             </Text>
//           </View>
//         </View>
//         <TouchableOpacity style={styles.helpButton}>
//           <MaterialCommunityIcons name="help-circle-outline" size={24} color={COLORS.primary} />
//         </TouchableOpacity>
//       </View>

//       <ScrollView 
//         style={styles.scrollView} 
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       >
//         <View style={styles.content}>
//           {/* Period Selector */}
//           <View style={styles.periodSelector}>
//             {periods.map((period) => (
//               <TouchableOpacity
//                 key={period.id}
//                 style={[
//                   styles.periodButton,
//                   selectedPeriod === period.id && styles.periodButtonActive,
//                 ]}
//                 onPress={() => setSelectedPeriod(period.id)}
//               >
//                 <Text
//                   style={[
//                     styles.periodButtonText,
//                     selectedPeriod === period.id && styles.periodButtonTextActive,
//                   ]}
//                 >
//                   {period.label}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           {/* Earnings Summary Card */}
//           <View style={styles.earningsCard}>
//             <Text style={styles.earningsLabel}>
//               {tSafe('total_earnings_label', 'Total Earnings ({period})', { period: currentPeriodLabel })}
//             </Text>
//             <Text style={styles.earningsAmount}>
//               {formatCurrency(getPeriodEarnings())}
//             </Text>
            
//             <View style={styles.earningsStats}>
//               <View style={styles.stat}>
//                 <MaterialCommunityIcons name="check-circle" size={16} color="#34C759" />
//                 <Text style={styles.statText}>
//                   {tSafe('jobs_count', '{count} jobs', { count: earningsData?.completedJobs || 0 })}
//                 </Text>
//               </View>
//               <View style={styles.stat}>
//                 <MaterialCommunityIcons name="star" size={16} color="#FFCC00" />
//                 <Text style={styles.statText}>
//                   {tSafe('rating_label', '{rating} rating', { rating: (earningsData?.averageRating || 0).toFixed(1) })}
//                 </Text>
//               </View>
//               <View style={styles.stat}>
//                 <MaterialCommunityIcons name="trending-up" size={16} color="#34C759" />
//                 <Text style={styles.statText}>
//                   {earningsData?.averageEarningsPerJob ? 
//                     tSafe('per_job', '{amount}/job', { amount: formatCurrency(earningsData.averageEarningsPerJob) }) : 
//                     tSafe('zero_per_job', '$0.00/job')}
//                 </Text>
//               </View>
//             </View>

//             {/* Badges display */}
//             {renderBadges()}
//           </View>

//           {/* Upcoming Payout Card */}
//           <View style={styles.payoutCard}>
//             <View style={styles.payoutHeader}>
//               <MaterialCommunityIcons name="cash-fast" size={24} color={COLORS.primary} />
//               <View style={styles.payoutInfo}>
//                 <Text style={styles.payoutLabel}>{tSafe('next_payout', 'Next Payout')}</Text>
//                 <Text style={styles.payoutAmount}>
//                   {formatCurrency(earningsData?.upcomingPayout || 0)}
//                 </Text>
//               </View>
//             </View>
//             <View style={styles.payoutDetails}>
//               <Text style={styles.payoutDate}>
//                 {tSafe('processing_on', 'Processing on {date}', { date: formatDate(earningsData?.payoutDate) })}
//               </Text>
//               {earningsData?.monthlyGrowth > 0 ? (
//                 <Text style={styles.growthText}>
//                   <MaterialCommunityIcons name="trending-up" size={14} color="#34C759" />
//                   {tSafe('growth_positive', '+{percent}% this month', { percent: (earningsData.monthlyGrowth || 0).toFixed(1) })}
//                 </Text>
//               ) : earningsData?.monthlyGrowth < 0 ? (
//                 <Text style={styles.growthTextNegative}>
//                   <MaterialCommunityIcons name="trending-down" size={14} color="#FF3B30" />
//                   {tSafe('growth_negative', '{percent}% this month', { percent: (earningsData.monthlyGrowth || 0).toFixed(1) })}
//                 </Text>
//               ) : null}
//             </View>
//           </View>

//           {/* Performance Metrics */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>{tSafe('performance_metrics', 'Performance Metrics')}</Text>
//             <View style={styles.metricsGrid}>
//               <View style={styles.metricCard}>
//                 <Text style={styles.metricValue}>
//                   {earningsData?.performance?.jobsCompleted || 0}
//                 </Text>
//                 <Text style={styles.metricLabel}>{tSafe('jobs_completed', 'Jobs Completed')}</Text>
//               </View>
//               <View style={styles.metricCard}>
//                 <Text style={styles.metricValue}>
//                   {earningsData?.performance?.repeatClients || 0}
//                 </Text>
//                 <Text style={styles.metricLabel}>{tSafe('repeat_clients', 'Repeat Clients')}</Text>
//               </View>
//               <View style={styles.metricCard}>
//                 <Text style={styles.metricValue}>
//                   {((earningsData?.performance?.cancellationRate || 0) * 100).toFixed(1)}%
//                 </Text>
//                 <Text style={styles.metricLabel}>{tSafe('cancellation_rate', 'Cancellation Rate')}</Text>
//               </View>
//               <View style={styles.metricCard}>
//                 <Text style={styles.metricValue}>
//                   {minutesToDuration(earningsData?.performance?.responseTime) || '0 min'}
//                 </Text>
//                 <Text style={styles.metricLabel}>{tSafe('avg_response', 'Avg. Response')}</Text>
//               </View>
//               <View style={[styles.metricCard, styles.fullWidthMetric]}>
//                 <Text style={styles.metricValue}>
//                   {((earningsData?.performance?.acceptanceRate || 0) * 100).toFixed(0)}%
//                 </Text>
//                 <Text style={styles.metricLabel}>{tSafe('job_acceptance_rate', 'Job Acceptance Rate')}</Text>
//               </View>
//             </View>
//           </View>

//           {/* Recent Payments */}
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Text style={styles.sectionTitle}>{tSafe('recent_payments', 'Recent Payments')}</Text>
//               <TouchableOpacity 
//                 onPress={() => navigation.navigate(ROUTES.cleaner_payment_history, {item:"item"})}
//               >
//                 <Text style={styles.seeAllText}>{tSafe('see_all', 'See All')}</Text>
//               </TouchableOpacity>
//             </View>

//             {earningsData?.recentPayments && earningsData.recentPayments.length > 0 ? (
//               earningsData.recentPayments?.slice(0, 2)?.map((payment) => (
//                 <TouchableOpacity 
//                   key={payment.id} 
//                   style={styles.paymentItem}
//                   onPress={() => openPaymentModal(payment)}
//                   activeOpacity={0.7}
//                 >
//                   <View style={styles.paymentIcon}>
//                     <MaterialCommunityIcons 
//                       name={payment.approval_type === 'manual' ? "hand-coin" : "credit-card-check"} 
//                       size={20} 
//                       color="#34C759" 
//                     />
//                   </View>
//                   <View style={styles.paymentDetails}>
//                     <Text style={styles.paymentService}>{payment.apartment_name || tSafe('cleaning_service', 'Cleaning Service')}</Text>
//                     <Text style={styles.paymentClient}>{payment.client || tSafe('client', 'Client')}</Text>
//                     <Text style={styles.paymentDate}>
//                       {payment.date ? formatDate(payment.date) : tSafe('date_unknown', 'Date unknown')} • {minutesToDuration(payment.duration) || tSafe('duration_na', 'N/A')}
//                     </Text>
//                   </View>
//                   <View style={styles.paymentAmountContainer}>
//                     <Text style={styles.paymentAmount}>
//                       {formatAmountWithSymbol(payment.amount, currency)}
//                     </Text>
//                     <MaterialCommunityIcons 
//                       name="chevron-right" 
//                       size={20} 
//                       color="#8E8E93" 
//                     />
//                   </View>
//                 </TouchableOpacity>
//               ))
//             ) : (
//               <View style={styles.emptyState}>
//                 <MaterialCommunityIcons name="cash-remove" size={48} color="#C7C7CC" />
//                 <Text style={styles.emptyStateText}>{tSafe('no_recent_payments', 'No recent payments')}</Text>
//                 <Text style={styles.emptyStateSubtext}>
//                   {tSafe('complete_jobs_to_see_earnings', 'Complete jobs to see your earnings here')}
//                 </Text>
//               </View>
//             )}
//           </View>

//           {/* Quick Actions */}
//           <View style={styles.quickActions}>
//             <TouchableOpacity 
//               style={styles.actionButton}
//               onPress={() => navigation.navigate('EarningsReport')}
//             >
//               <MaterialCommunityIcons name="chart-box" size={24} color={COLORS.primary} />
//               <Text style={styles.actionText}>{tSafe('detailed_reports', 'Detailed Reports')}</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={styles.actionButton}
//               onPress={() => navigation.navigate('PayoutSettings')}
//             >
//               <MaterialCommunityIcons name="bank-outline" size={24} color={COLORS.primary} />
//               <Text style={styles.actionText}>{tSafe('payout_settings', 'Payout Settings')}</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={styles.actionButton}
//               onPress={() => navigation.navigate('TaxDocuments')}
//             >
//               <MaterialCommunityIcons name="file-document" size={24} color={COLORS.primary} />
//               <Text style={styles.actionText}>{tSafe('tax_documents', 'Tax Documents')}</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Total Lifetime Earnings */}
//           <View style={styles.lifetimeEarnings}>
//             <View style={styles.lifetimeHeader}>
//               <MaterialCommunityIcons name="trophy" size={20} color="#FFD700" />
//               <Text style={styles.lifetimeTitle}>{tSafe('lifetime_earnings', 'Lifetime Earnings')}</Text>
//             </View>
//             <Text style={styles.lifetimeAmount}>
//               {formatCurrency(earningsData?.totalEarnings || 0)}
//             </Text>
//             <Text style={styles.lifetimeSubtitle}>
//               {tSafe('total_from_completed_jobs', 'Total from all completed jobs')}
//             </Text>
//           </View>
//         </View>
//       </ScrollView>

//       {/* Payment Details Modal */}
//       <Modal
//         visible={modalVisible}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={closePaymentModal}
//         statusBarTranslucent={true}
//       >
//         <TouchableOpacity 
//           style={styles.modalOverlay}
//           activeOpacity={1}
//           onPress={closePaymentModal}
//         >
//           <Animated.View 
//             style={[
//               styles.modalContainer,
//               { transform: [{ translateY: slideAnim }] }
//             ]}
//           >
//             {/* Drag Handle */}
//             <View style={styles.dragHandleContainer}>
//               <View style={styles.dragHandle} />
//             </View>

//             {/* Modal Content */}
//             <ScrollView 
//               style={styles.modalContent}
//               showsVerticalScrollIndicator={false}
//               bounces={false}
//             >
//               {selectedPayment && (
//                 <>
//                   {/* Payment Header */}
//                   <View style={styles.modalHeader}>
//                     <View style={styles.modalPaymentIcon}>
//                       <MaterialCommunityIcons 
//                         name={selectedPayment.approval_type === 'manual' ? "hand-coin" : "credit-card-check"} 
//                         size={32} 
//                         color="#34C759" 
//                       />
//                     </View>
//                     <Text style={styles.modalPaymentAmount}>
//                       {formatCurrency(selectedPayment.amount)}
//                     </Text>
//                     <Text style={styles.modalPaymentStatus}>
//                       {selectedPayment.approval_type === 'manual' 
//                         ? tSafe('manually_approved', 'Manually Approved')
//                         : tSafe('auto_approved', 'Auto Approved')}
//                     </Text>
//                   </View>

//                   {/* Divider */}
//                   <View style={styles.divider} />

//                   {/* Payment Details */}
//                   <View style={styles.detailsSection}>
//                     <Text style={styles.sectionLabel}>{tSafe('payment_details', 'Payment Details')}</Text>
                    
//                     <View style={styles.detailRow}>
//                       <MaterialCommunityIcons name="briefcase" size={20} color="#8E8E93" />
//                       <View style={styles.detailTextContainer}>
//                         <Text style={styles.detailLabel}>{tSafe('service_type', 'Service Type')}</Text>
//                         <Text style={styles.detailValue}>{selectedPayment.apartment_name || tSafe('standard_cleaning', 'Standard Cleaning')}</Text>
//                       </View>
//                     </View>

//                     <View style={styles.detailRow}>
//                       <MaterialCommunityIcons name="account" size={20} color="#8E8E93" />
//                       <View style={styles.detailTextContainer}>
//                         <Text style={styles.detailLabel}>{tSafe('client', 'Client')}</Text>
//                         <Text style={styles.detailValue}>{selectedPayment.client || tSafe('anonymous', 'Anonymous')}</Text>
//                       </View>
//                     </View>

//                     <View style={styles.detailRow}>
//                       <MaterialCommunityIcons name="clock-outline" size={20} color="#8E8E93" />
//                       <View style={styles.detailTextContainer}>
//                         <Text style={styles.detailLabel}>{tSafe('duration', 'Duration')}</Text>
//                         <Text style={styles.detailValue}>{minutesToDuration(selectedPayment.duration) || tSafe('two_hours', '2 hours')}</Text>
//                       </View>
//                     </View>

//                     <View style={styles.detailRow}>
//                       <MaterialCommunityIcons name="calendar" size={20} color="#8E8E93" />
//                       <View style={styles.detailTextContainer}>
//                         <Text style={styles.detailLabel}>{tSafe('date_time', 'Date & Time')}</Text>
//                         <Text style={styles.detailValue}>
//                           {formatDateTime(selectedPayment.date) || tSafe('date_not_available', 'Date not available')}
//                         </Text>
//                       </View>
//                     </View>

//                     <View style={styles.detailRow}>
//                       <MaterialCommunityIcons name="check-circle" size={20} color="#34C759" />
//                       <View style={styles.detailTextContainer}>
//                         <Text style={styles.detailLabel}>{tSafe('status', 'Status')}</Text>
//                         <Text style={[styles.detailValue, styles.statusCompleted]}>
//                           {tSafe('completed', 'Completed')}
//                         </Text>
//                       </View>
//                     </View>
//                   </View>

//                   {/* Payment ID Section */}
//                   <View style={styles.detailsSection}>
//                     <Text style={styles.sectionLabel}>{tSafe('payment_information', 'Payment Information')}</Text>
                    
//                     <View style={styles.detailRow}>
//                       <MaterialCommunityIcons name="identifier" size={20} color="#8E8E93" />
//                       <View style={styles.detailTextContainer}>
//                         <Text style={styles.detailLabel}>{tSafe('payment_id', 'Payment ID')}</Text>
//                         <Text style={styles.detailValueSmall}>
//                           {selectedPayment.id || 'N/A'}
//                         </Text>
//                       </View>
//                     </View>

//                     <View style={styles.detailRow}>
//                       <MaterialCommunityIcons name="credit-card" size={20} color="#8E8E93" />
//                       <View style={styles.detailTextContainer}>
//                         <Text style={styles.detailLabel}>{tSafe('approval_type', 'Approval Type')}</Text>
//                         <Text style={styles.detailValue}>
//                           {selectedPayment.approval_type === 'manual' 
//                             ? tSafe('manual_approval', 'Manual Approval')
//                             : tSafe('automatic', 'Automatic')}
//                         </Text>
//                       </View>
//                     </View>
//                   </View>

//                   {/* Notes Section (if available) */}
//                   {selectedPayment.notes && (
//                     <View style={styles.detailsSection}>
//                       <Text style={styles.sectionLabel}>{tSafe('notes', 'Notes')}</Text>
//                       <View style={styles.notesContainer}>
//                         <Text style={styles.notesText}>{selectedPayment.notes}</Text>
//                       </View>
//                     </View>
//                   )}

//                   {/* Action Buttons */}
//                   <View style={styles.modalActions}>
//                     <TouchableOpacity 
//                       style={[styles.actionButton, styles.primaryAction]}
//                       onPress={() => {
//                         // Handle receipt download or view
//                         closePaymentModal();
//                         // Add your receipt logic here
//                       }}
//                     >
//                       <MaterialCommunityIcons name="download" size={20} color="#FFFFFF" />
//                       <Text style={styles.primaryActionText}>{tSafe('download_receipt', 'Download Receipt')}</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity 
//                       style={[styles.actionButton, styles.secondaryAction]}
//                       onPress={closePaymentModal}
//                     >
//                       <Text style={styles.secondaryActionText}>{tSafe('close', 'Close')}</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </>
//               )}
//             </ScrollView>
//           </Animated.View>
//         </TouchableOpacity>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8F9FA',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingTop: 60,
//     paddingBottom: 16,
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//   },
//   headerUserInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//     marginLeft: 12,
//   },
//   userAvatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginRight: 12,
//   },
//   userAvatarPlaceholder: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   userName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1A1A1A',
//   },
//   userSubtitle: {
//     fontSize: 12,
//     color: '#666',
//   },
//   backButton: {
//     padding: 8,
//   },
//   helpButton: {
//     padding: 8,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   content: {
//     padding: 16,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: '#666',
//   },
//   periodSelector: {
//     flexDirection: 'row',
//     marginBottom: 20,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   periodButton: {
//     flex: 1,
//     paddingVertical: 10,
//     paddingHorizontal: 4,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   periodButtonActive: {
//     backgroundColor: COLORS.primary,
//   },
//   periodButtonText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: '#666',
//   },
//   periodButtonTextActive: {
//     color: '#FFFFFF',
//     fontWeight: '600',
//   },
//   earningsCard: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 16,
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   earningsLabel: {
//     fontSize: 14,
//     color: '#FFFFFF',
//     opacity: 0.9,
//     marginBottom: 8,
//   },
//   earningsAmount: {
//     fontSize: 32,
//     fontWeight: '700',
//     color: '#FFFFFF',
//     marginBottom: 16,
//   },
//   earningsStats: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   stat: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   statText: {
//     fontSize: 12,
//     color: '#FFFFFF',
//     marginLeft: 4,
//     fontWeight: '500',
//   },
//   badgesContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginTop: 8,
//   },
//   badge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     marginRight: 8,
//     marginBottom: 4,
//   },
//   badgeText: {
//     fontSize: 10,
//     color: '#FFFFFF',
//     marginLeft: 4,
//     fontWeight: '500',
//   },
//   moreBadgesText: {
//     fontSize: 10,
//     color: '#FFFFFF',
//     opacity: 0.8,
//   },
//   payoutCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: '#E9ECEF',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   payoutHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   payoutInfo: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   payoutLabel: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 4,
//   },
//   payoutAmount: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#1A1A1A',
//   },
//   payoutDetails: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   payoutDate: {
//     fontSize: 12,
//     color: '#8E8E93',
//   },
//   growthText: {
//     fontSize: 12,
//     color: '#34C759',
//     fontWeight: '500',
//   },
//   growthTextNegative: {
//     fontSize: 12,
//     color: '#FF3B30',
//     fontWeight: '500',
//   },
//   section: {
//     marginBottom: 24,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1A1A1A',
//   },
//   seeAllText: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontWeight: '500',
//   },
//   metricsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 12,
//   },
//   metricCard: {
//     flex: 1,
//     minWidth: '47%',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 16,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#E9ECEF',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   fullWidthMetric: {
//     minWidth: '100%',
//   },
//   metricValue: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1A1A1A',
//     marginBottom: 4,
//   },
//   metricLabel: {
//     fontSize: 12,
//     color: '#666',
//     textAlign: 'center',
//   },
//   paymentItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//   },
//   paymentIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#E7F3FF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   paymentDetails: {
//     flex: 1,
//   },
//   paymentService: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1A1A1A',
//     marginBottom: 4,
//   },
//   paymentClient: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 2,
//   },
//   paymentDate: {
//     fontSize: 12,
//     color: '#8E8E93',
//   },
//   paymentAmountContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   paymentAmount: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#34C759',
//     marginRight: 8,
//   },
//   emptyState: {
//     alignItems: 'center',
//     padding: 40,
//     backgroundColor: '#F8F9FA',
//     borderRadius: 12,
//     marginTop: 8,
//   },
//   emptyStateText: {
//     fontSize: 16,
//     color: '#8E8E93',
//     marginTop: 12,
//     fontWeight: '500',
//   },
//   emptyStateSubtext: {
//     fontSize: 14,
//     color: '#C7C7CC',
//     marginTop: 4,
//     textAlign: 'center',
//   },
//   quickActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 24,
//   },
//   actionButton: {
//     flex: 1,
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     marginHorizontal: 4,
//     borderWidth: 1,
//     borderColor: '#E9ECEF',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   actionText: {
//     fontSize: 12,
//     color: COLORS.primary,
//     marginTop: 8,
//     textAlign: 'center',
//     fontWeight: '500',
//   },
//   lifetimeEarnings: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: '#E9ECEF',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   lifetimeHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   lifetimeTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1A1A1A',
//     marginLeft: 8,
//   },
//   lifetimeAmount: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#1A1A1A',
//     marginBottom: 4,
//   },
//   lifetimeSubtitle: {
//     fontSize: 14,
//     color: '#666',
//   },

//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContainer: {
//     backgroundColor: '#FFFFFF',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     maxHeight: height * 0.85,
//     paddingBottom: Platform.OS === 'ios' ? 34 : 24,
//   },
//   dragHandleContainer: {
//     alignItems: 'center',
//     paddingVertical: 12,
//   },
//   dragHandle: {
//     width: 40,
//     height: 4,
//     backgroundColor: '#E0E0E0',
//     borderRadius: 2,
//   },
//   modalContent: {
//     paddingHorizontal: 24,
//     paddingBottom: 24,
//   },
//   modalHeader: {
//     alignItems: 'center',
//     paddingVertical: 24,
//   },
//   modalPaymentIcon: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: '#E7F3FF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   modalPaymentAmount: {
//     fontSize: 36,
//     fontWeight: '700',
//     color: '#1A1A1A',
//     marginBottom: 8,
//   },
//   modalPaymentStatus: {
//     fontSize: 14,
//     color: '#34C759',
//     fontWeight: '500',
//     backgroundColor: '#E7F9E7',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#F0F0F0',
//     marginVertical: 8,
//   },
//   detailsSection: {
//     marginTop: 24,
//   },
//   sectionLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1A1A1A',
//     marginBottom: 16,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   detailTextContainer: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   detailLabel: {
//     fontSize: 14,
//     color: '#8E8E93',
//     marginBottom: 4,
//   },
//   detailValue: {
//     fontSize: 16,
//     color: '#1A1A1A',
//     fontWeight: '500',
//   },
//   detailValueSmall: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '400',
//   },
//   statusCompleted: {
//     color: '#34C759',
//   },
//   notesContainer: {
//     backgroundColor: '#F8F9FA',
//     padding: 16,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#E9ECEF',
//   },
//   notesText: {
//     fontSize: 14,
//     color: '#666',
//     lineHeight: 20,
//   },
//   modalActions: {
//     marginTop: 32,
//     gap: 12,
//   },
//   primaryAction: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary,
//     borderWidth: 0,
//     paddingVertical: 16,
//     gap: 8,
//   },
//   primaryActionText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   secondaryAction: {
//     backgroundColor: '#F8F9FA',
//     borderColor: '#E9ECEF',
//     paddingVertical: 16,
//   },
//   secondaryActionText: {
//     color: '#666',
//     fontSize: 16,
//     fontWeight: '500',
//   },
// });

// export default Earnings;