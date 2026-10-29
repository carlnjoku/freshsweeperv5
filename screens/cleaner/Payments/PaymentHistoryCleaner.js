import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
} from 'react';

import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  FlatList,
  Platform,
  StatusBar,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';

import { AuthContext } from '../../../context/AuthContext';
import userService from '../../../services/connection/userService';
import { formatAmountWithSymbol } from '../../../utils/formatAmountWithSymbol';
import { minutesToDuration } from '../../../utils/minuteToDuration';
import { tSafe } from '../../../utils/tSafe';

import AppText from '../../../ui/AppText';
import { useTheme } from '../../../theme';

const { height } = Dimensions.get('window');

const PaymentsHistoryCleaner = () => {
  const navigation = useNavigation();

  const {
    currentUserId,
    currency,
  } = useContext(AuthContext);

  const { theme, isDark } = useTheme();

  const styles = createStyles(theme);

  // =========================================================
  // STATE
  // =========================================================

  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const [selectedFilter, setSelectedFilter] =
    useState('all');

  const [sortBy, setSortBy] =
    useState('date');

  const [sortOrder, setSortOrder] =
    useState('desc');

  const [stats, setStats] = useState({
    total: 0,
    cleaningEarnings: 0,
    replacementCompensation: 0,
    thisMonth: 0,
    lastMonth: 0,
    averagePayment: 0,
  });

  const [modalVisible, setModalVisible] =
    useState(false);

  const [selectedPayment, setSelectedPayment] =
    useState(null);

  const [slideAnim] =
    useState(new Animated.Value(height));

  // =========================================================
  // FILTERS
  // =========================================================

  const filters = useMemo(
    () => [
      {
        id: 'all',
        label: tSafe(
          'all_earnings',
          'All Earnings'
        ),
        icon: 'cash-multiple',
      },
      {
        id: 'jobs',
        label: tSafe(
          'completed_jobs',
          'Completed Jobs'
        ),
        icon: 'broom',
      },
      {
        id: 'compensation',
        label: tSafe(
          'compensation',
          'Compensation'
        ),
        icon: 'cash-refund',
      },
      {
        id: 'this_month',
        label: tSafe(
          'this_month',
          'This Month'
        ),
        icon: 'calendar-month',
      },
      {
        id: 'last_month',
        label: tSafe(
          'last_month',
          'Last Month'
        ),
        icon: 'calendar-arrow-left',
      },
    ],
    []
  );

  // =========================================================
  // SORT OPTIONS
  // =========================================================

  const sortOptions = useMemo(
    () => [
      {
        id: 'date',
        label: tSafe(
          'date',
          'Date'
        ),
        icon: 'calendar',
      },
      {
        id: 'amount',
        label: tSafe(
          'amount',
          'Amount'
        ),
        icon: 'currency-usd',
      },
      {
        id: 'client',
        label: tSafe(
          'client',
          'Client'
        ),
        icon: 'account',
      },
    ],
    []
  );

  // =========================================================
  // EARNING TYPE
  // =========================================================

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

  // =========================================================
  // EARNING TYPE LABEL
  // =========================================================

  const getEarningTypeLabel = payment => {
    if (
      getEarningType(payment) ===
      'replacement_compensation'
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

  // =========================================================
  // EARNING TYPE ICON
  // =========================================================

  const getEarningTypeIcon = payment => {
    if (
      getEarningType(payment) ===
      'replacement_compensation'
    ) {
      return 'cash-refund';
    }

    return 'broom';
  };

  // =========================================================
  // EARNING TYPE COLOR
  // =========================================================

  const getEarningTypeColor = payment => {
    if (
      getEarningType(payment) ===
      'replacement_compensation'
    ) {
      return theme.status?.info || '#AF52DE';
    }

    return theme.status?.success || '#34C759';
  };

  // =========================================================
  // REPLACEMENT SOURCE LABEL
  // =========================================================

  const getReplacementSourceLabel = source => {
    switch (
      String(source || '').toLowerCase()
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

  // =========================================================
  // FETCH EARNINGS
  // =========================================================

  const fetchAllPayments = async () => {
    if (!currentUserId) {
      return;
    }

    try {
      setLoading(true);

      console.log(
        'Fetching cleaner earnings:',
        currentUserId
      );

      const response =
        await userService.getCleanerEarnings(
          currentUserId
        );

      console.log(
        'Cleaner earnings response:',
        response
      );

      const earningsData =
        response?.data ||
        response ||
        {};

      // -----------------------------------------------------
      // Completed cleaning jobs
      // -----------------------------------------------------

      const completedJobPayments =
        Array.isArray(
          earningsData.recentPayments
        )
          ? earningsData.recentPayments.map(
              payment => ({
                ...payment,

                type:
                  payment?.type ||
                  'completed_cleaning',

                service:
                  payment?.service ||
                  payment?.property_name ||
                  tSafe(
                    'completed_cleaning_job',
                    'Completed Cleaning Job'
                  ),
              })
            )
          : [];

      // -----------------------------------------------------
      // Replacement compensation
      // -----------------------------------------------------

      const replacementPayments =
        Array.isArray(
          earningsData.replacementPayments
        )
          ? earningsData.replacementPayments.map(
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

      // -----------------------------------------------------
      // Unified earnings list
      // -----------------------------------------------------

      const paymentData = [
        ...completedJobPayments,
        ...replacementPayments,
      ];

      console.log(
        'Completed jobs:',
        completedJobPayments.length
      );

      console.log(
        'Replacement compensation:',
        replacementPayments.length
      );

      console.log(
        'Unified earnings:',
        paymentData.length
      );

      calculateStats(
        paymentData,
        earningsData
      );

      setPayments(
        paymentData
      );

      setFilteredPayments(
        paymentData
      );

    } catch (error) {
      console.error(
        'Error fetching cleaner earnings:',
        error
      );

      setPayments([]);
      setFilteredPayments([]);

      setStats({
        total: 0,
        cleaningEarnings: 0,
        replacementCompensation: 0,
        thisMonth: 0,
        lastMonth: 0,
        averagePayment: 0,
      });

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // CALCULATE STATS
  // =========================================================

  const calculateStats = (
    paymentData,
    earningsData = {}
  ) => {
    if (
      !Array.isArray(paymentData) ||
      paymentData.length === 0
    ) {
      setStats({
        total: Number(
          earningsData.totalEarnings || 0
        ),

        cleaningEarnings: Number(
          earningsData.cleaningEarnings || 0
        ),

        replacementCompensation:
          Number(
            earningsData.replacementCompensation ||
              0
          ),

        thisMonth: Number(
          earningsData?.earningsBreakdown
            ?.month || 0
        ),

        lastMonth: 0,

        averagePayment: 0,
      });

      return;
    }

    let total = 0;
    let cleaningEarnings = 0;
    let replacementCompensation = 0;

    let thisMonthTotal = 0;
    let lastMonthTotal = 0;

    const now = new Date();

    const currentMonth =
      now.getMonth();

    const currentYear =
      now.getFullYear();

    const lastMonth =
      currentMonth === 0
        ? 11
        : currentMonth - 1;

    const lastMonthYear =
      currentMonth === 0
        ? currentYear - 1
        : currentYear;

    paymentData.forEach(
      payment => {
        const amount =
          Number(
            payment?.amount || 0
          );

        total += amount;

        if (
          getEarningType(payment) ===
          'replacement_compensation'
        ) {
          replacementCompensation +=
            amount;
        } else {
          cleaningEarnings +=
            amount;
        }

        if (payment?.date) {
          const paymentDate =
            new Date(payment.date);

          if (
            !Number.isNaN(
              paymentDate.getTime()
            )
          ) {
            const paymentMonth =
              paymentDate.getMonth();

            const paymentYear =
              paymentDate.getFullYear();

            if (
              paymentMonth ===
                currentMonth &&
              paymentYear ===
                currentYear
            ) {
              thisMonthTotal +=
                amount;
            }

            if (
              paymentMonth ===
                lastMonth &&
              paymentYear ===
                lastMonthYear
            ) {
              lastMonthTotal +=
                amount;
            }
          }
        }
      }
    );

    setStats({
      total:
        Number(
          earningsData.totalEarnings
        ) || total,

      cleaningEarnings:
        Number(
          earningsData.cleaningEarnings
        ) || cleaningEarnings,

      replacementCompensation:
        Number(
          earningsData.replacementCompensation
        ) ||
        replacementCompensation,

      thisMonth:
        Number(
          earningsData?.earningsBreakdown
            ?.month
        ) || thisMonthTotal,

      lastMonth:
        lastMonthTotal,

      averagePayment:
        paymentData.length > 0
          ? total / paymentData.length
          : 0,
    });
  };

  // =========================================================
  // FILTER + SEARCH + SORT
  // =========================================================

  useEffect(() => {
    if (!payments.length) {
      setFilteredPayments([]);
      return;
    }

    let result = [
      ...payments,
    ];

    if (searchQuery) {
      const query =
        searchQuery
          .toLowerCase()
          .trim();

      result =
        result.filter(
          payment =>
            (
              payment.client ||
              ''
            )
              .toLowerCase()
              .includes(query) ||

            (
              payment.service ||
              ''
            )
              .toLowerCase()
              .includes(query) ||

            (
              payment.property_name ||
              ''
            )
              .toLowerCase()
              .includes(query) ||

            (
              payment.source ||
              ''
            )
              .toLowerCase()
              .includes(query) ||

            (
              getEarningTypeLabel(
                payment
              ) || ''
            )
              .toLowerCase()
              .includes(query) ||

            (
              payment.id ||
              ''
            )
              .toLowerCase()
              .includes(query)
        );
    }

    switch (
      selectedFilter
    ) {
      case 'jobs':
        result =
          result.filter(
            payment =>
              getEarningType(
                payment
              ) ===
              'completed_cleaning'
          );
        break;

      case 'compensation':
        result =
          result.filter(
            payment =>
              getEarningType(
                payment
              ) ===
              'replacement_compensation'
          );
        break;

      case 'this_month': {
        const now =
          new Date();

        const currentMonth =
          now.getMonth();

        const currentYear =
          now.getFullYear();

        result =
          result.filter(
            payment => {
              const paymentDate =
                new Date(
                  payment.date
                );

              return (
                paymentDate.getMonth() ===
                  currentMonth &&
                paymentDate.getFullYear() ===
                  currentYear
              );
            }
          );

        break;
      }

      case 'last_month': {
        const lastMonthDate =
          new Date();

        lastMonthDate.setMonth(
          lastMonthDate.getMonth() - 1
        );

        const lastMonth =
          lastMonthDate.getMonth();

        const lastMonthYear =
          lastMonthDate.getFullYear();

        result =
          result.filter(
            payment => {
              const paymentDate =
                new Date(
                  payment.date
                );

              return (
                paymentDate.getMonth() ===
                  lastMonth &&
                paymentDate.getFullYear() ===
                  lastMonthYear
              );
            }
          );

        break;
      }

      default:
        break;
    }

    result.sort(
      (a, b) => {
        let valueA;
        let valueB;

        switch (
          sortBy
        ) {
          case 'amount':
            valueA =
              Number(
                a.amount || 0
              );

            valueB =
              Number(
                b.amount || 0
              );

            break;

          case 'client':
            valueA =
              (
                a.client ||
                ''
              ).toLowerCase();

            valueB =
              (
                b.client ||
                ''
              ).toLowerCase();

            break;

          case 'date':
          default:
            valueA =
              new Date(
                a.date || 0
              ).getTime();

            valueB =
              new Date(
                b.date || 0
              ).getTime();

            break;
        }

        if (
          sortOrder ===
          'asc'
        ) {
          return valueA >
            valueB
            ? 1
            : -1;
        }

        return valueA <
          valueB
          ? 1
          : -1;
      }
    );

    setFilteredPayments(
      result
    );

  }, [
    payments,
    searchQuery,
    selectedFilter,
    sortBy,
    sortOrder,
  ]);

  // =========================================================
  // FOCUS
  // =========================================================

  useFocusEffect(
    React.useCallback(
      () => {
        fetchAllPayments();
      },
      [currentUserId]
    )
  );

  // =========================================================
  // REFRESH
  // =========================================================

  const onRefresh =
    React.useCallback(
      () => {
        setRefreshing(true);
        fetchAllPayments();
      },
      [currentUserId]
    );

  // =========================================================
  // MODAL
  // =========================================================

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

  // =========================================================
  // FORMATTING
  // =========================================================

  const formatCurrency =
    amount => {
      return formatAmountWithSymbol(
        Number(
          amount || 0
        ),
        currency
      );
    };

  const formatDate =
    dateString => {
      try {
        if (!dateString) {
          return tSafe(
            'na',
            'N/A'
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

  // =========================================================
  // STATUS
  // =========================================================

  const getStatusColor =
    status => {
      switch (
        String(
          status || ''
        ).toLowerCase()
      ) {
        case 'completed':
        case 'paid':
        case 'succeeded':
        case 'success':
          return theme.status.success;

        case 'pending':
          return theme.status.warning;

        case 'failed':
          return theme.status.error;

        default:
          return theme.text.muted;
      }
    };

  const getStatusLabel =
    status => {
      switch (
        String(
          status || ''
        ).toLowerCase()
      ) {
        case 'completed':
          return tSafe(
            'completed',
            'Completed'
          );

        case 'paid':
          return tSafe(
            'paid',
            'Paid'
          );

        case 'succeeded':
        case 'success':
          return tSafe(
            'paid',
            'Paid'
          );

        case 'pending':
          return tSafe(
            'pending',
            'Pending'
          );

        case 'failed':
          return tSafe(
            'failed',
            'Failed'
          );

        default:
          return (
            status
              ? String(status)
                  .charAt(0)
                  .toUpperCase() +
                String(status)
                  .slice(1)
              : tSafe(
                  'unknown',
                  'Unknown'
                )
          );
      }
    };

  // =========================================================
  // SORT
  // =========================================================

  const toggleSortOrder =
    () => {
      setSortOrder(
        current =>
          current === 'asc'
            ? 'desc'
            : 'asc'
      );
    };

  // =========================================================
  // PAYMENT ITEM
  // =========================================================

  const renderPaymentItem =
    ({ item }) => {

      const earningType =
        getEarningType(
          item
        );

      const isCompensation =
        earningType ===
        'replacement_compensation';

      const earningTypeColor =
        getEarningTypeColor(
          item
        );

      const statusColor =
        getStatusColor(
          item.status
        );

      return (
        <TouchableOpacity
          style={
            styles.paymentCard
          }
          onPress={() =>
            openPaymentModal(
              item
            )
          }
          activeOpacity={0.7}
        >
          <View
            style={
              styles.paymentCardHeader
            }
          >
            <View
              style={[
                styles.paymentIconContainer,
                {
                  backgroundColor:
                    `${earningTypeColor}15`,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={getEarningTypeIcon(
                  item
                )}
                size={24}
                color={
                  earningTypeColor
                }
              />
            </View>

            <View
              style={
                styles.paymentInfo
              }
            >
              <AppText
                style={
                  styles.paymentService
                }
                numberOfLines={1}
              >
                {getEarningTypeLabel(
                  item
                )}
              </AppText>

              <AppText
                style={
                  styles.paymentClient
                }
                numberOfLines={1}
              >
                {isCompensation
                  ? getReplacementSourceLabel(
                      item.source
                    )
                  : (
                      item.client ||
                      tSafe(
                        'client',
                        'Client'
                      )
                    )}
              </AppText>

              <AppText
                style={
                  styles.paymentDate
                }
              >
                {formatDate(
                  item.date
                )}
              </AppText>
            </View>

            <View
              style={
                styles.paymentAmountContainer
              }
            >
              <AppText
                style={[
                  styles.paymentAmount,
                  {
                    color:
                      earningTypeColor,
                  },
                ]}
              >
                +{formatAmountWithSymbol(
                  item.amount,
                  currency
                )}
              </AppText>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      `${earningTypeColor}20`,
                  },
                ]}
              >
                <AppText
                  style={[
                    styles.statusText,
                    {
                      color:
                        earningTypeColor,
                    },
                  ]}
                >
                  {isCompensation
                    ? tSafe(
                        'compensation',
                        'Compensation'
                      )
                    : tSafe(
                        'job_earning',
                        'Job Earning'
                      )}
                </AppText>
              </View>
            </View>
          </View>

          <View
            style={
              styles.paymentCardFooter
            }
          >
            {isCompensation ? (
              <>
                <View
                  style={
                    styles.footerItem
                  }
                >
                  <MaterialCommunityIcons
                    name="swap-horizontal"
                    size={14}
                    color={
                      theme.icon.muted
                    }
                  />

                  <AppText
                    style={
                      styles.footerText
                    }
                    numberOfLines={1}
                  >
                    {getReplacementSourceLabel(
                      item.source
                    )}
                  </AppText>
                </View>

                <View
                  style={
                    styles.footerItem
                  }
                >
                  <MaterialCommunityIcons
                    name="cash-check"
                    size={14}
                    color={
                      theme.status.success
                    }
                  />

                  <AppText
                    style={
                      styles.footerText
                    }
                  >
                    {getStatusLabel(
                      item.status
                    )}
                  </AppText>
                </View>
              </>
            ) : (
              <>
                <View
                  style={
                    styles.footerItem
                  }
                >
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={14}
                    color={
                      theme.icon.muted
                    }
                  />

                  <AppText
                    style={
                      styles.footerText
                    }
                  >
                    {minutesToDuration(
                      item.duration
                    ) ||
                      tSafe(
                        'na',
                        'N/A'
                      )}
                  </AppText>
                </View>

                <View
                  style={
                    styles.footerItem
                  }
                >
                  <MaterialCommunityIcons
                    name="account"
                    size={14}
                    color={
                      theme.icon.muted
                    }
                  />

                  <AppText
                    style={
                      styles.footerText
                    }
                    numberOfLines={1}
                  >
                    {item.client ||
                      tSafe(
                        'client',
                        'Client'
                      )}
                  </AppText>
                </View>
              </>
            )}

            <View
              style={
                styles.footerItem
              }
            >
              <MaterialCommunityIcons
                name="identifier"
                size={14}
                color={
                  theme.icon.muted
                }
              />

              <AppText
                style={
                  styles.footerText
                }
              >
                {tSafe(
                  'id_prefix',
                  'ID:'
                )}{' '}
                {item.id
                  ?.substring(
                    0,
                    8
                  ) ||
                  tSafe(
                    'na',
                    'N/A'
                  )}
              </AppText>
            </View>
          </View>
        </TouchableOpacity>
      );
    };

  // =========================================================
  // HEADER
  // =========================================================

  const renderHeader =
    () => (
      <>
        <View
          style={
            styles.statsContainer
          }
        >
          <View
            style={
              styles.statCard
            }
          >
            <MaterialCommunityIcons
              name="cash-multiple"
              size={24}
              color={
                theme.brand.primary
              }
            />

            <AppText
              style={
                styles.statValue
              }
            >
              {formatAmountWithSymbol(
                stats.total,
                currency
              )}
            </AppText>

            <AppText
              style={
                styles.statLabel
              }
            >
              {tSafe(
                'total_earnings',
                'Total Earnings'
              )}
            </AppText>
          </View>

          <View
            style={
              styles.statCard
            }
          >
            <MaterialCommunityIcons
              name="broom"
              size={24}
              color={
                theme.status.success
              }
            />

            <AppText
              style={
                styles.statValue
              }
            >
              {formatAmountWithSymbol(
                stats.cleaningEarnings,
                currency
              )}
            </AppText>

            <AppText
              style={
                styles.statLabel
              }
            >
              {tSafe(
                'job_earnings',
                'Job Earnings'
              )}
            </AppText>
          </View>

          <View
            style={
              styles.statCard
            }
          >
            <MaterialCommunityIcons
              name="cash-refund"
              size={24}
              color={
                theme.status.info
              }
            />

            <AppText
              style={
                styles.statValue
              }
            >
              {formatAmountWithSymbol(
                stats.replacementCompensation,
                currency
              )}
            </AppText>

            <AppText
              style={
                styles.statLabel
              }
            >
              {tSafe(
                'compensation',
                'Compensation'
              )}
            </AppText>
          </View>
        </View>

        {/* Search */}
        <View
          style={
            styles.searchContainer
          }
        >
          <View
            style={
              styles.searchBar
            }
          >
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={
                theme.icon.muted
              }
            />

            <TextInput
              style={
                styles.searchInput
              }
              placeholder={tSafe(
                'search_payments_placeholder',
                'Search earnings by client, service, or type...'
              )}
              value={
                searchQuery
              }
              onChangeText={
                setSearchQuery
              }
              placeholderTextColor={
                theme.input.placeholder
              }
              selectionColor={
                theme.brand.primary
              }
            />

            {searchQuery ? (
              <TouchableOpacity
                onPress={() =>
                  setSearchQuery(
                    ''
                  )
                }
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={20}
                  color={
                    theme.icon.muted
                  }
                />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Filters */}
        <View
          style={
            styles.filtersSection
          }
        >
          <AppText
            style={
              styles.sectionTitle
            }
          >
            {tSafe(
              'filter_earnings',
              'Filter Earnings'
            )}
          </AppText>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            style={
              styles.filtersScroll
            }
            contentContainerStyle={
              styles.filtersContent
            }
          >
            {filters.map(
              filter => (
                <TouchableOpacity
                  key={
                    filter.id
                  }
                  style={[
                    styles.filterButton,
                    selectedFilter ===
                      filter.id &&
                      styles.filterButtonActive,
                  ]}
                  onPress={() =>
                    setSelectedFilter(
                      filter.id
                    )
                  }
                >
                  <MaterialCommunityIcons
                    name={
                      filter.icon
                    }
                    size={16}
                    color={
                      selectedFilter ===
                      filter.id
                        ? theme.button.primaryText
                        : theme.brand.primary
                    }
                  />

                  <AppText
                    style={[
                      styles.filterButtonText,
                      selectedFilter ===
                        filter.id &&
                        styles.filterButtonTextActive,
                    ]}
                  >
                    {
                      filter.label
                    }
                  </AppText>
                </TouchableOpacity>
              )
            )}
          </ScrollView>
        </View>

        {/* Sorting */}
        <View
          style={
            styles.sortingSection
          }
        >
          <View
            style={
              styles.sortingHeader
            }
          >
            <AppText
              style={
                styles.sectionTitle
              }
            >
              {tSafe(
                'earnings_found',
                '{count} Earnings Found',
                {
                  count:
                    filteredPayments.length,
                }
              )}
            </AppText>

            <TouchableOpacity
              style={
                styles.sortButton
              }
              onPress={
                toggleSortOrder
              }
            >
              <MaterialCommunityIcons
                name={
                  sortOrder ===
                  'asc'
                    ? 'sort-ascending'
                    : 'sort-descending'
                }
                size={20}
                color={
                  theme.brand.primary
                }
              />

              <AppText
                style={
                  styles.sortButtonText
                }
              >
                {tSafe(
                  'sort_by',
                  'Sort by {order}',
                  {
                    order:
                      sortOrder ===
                      'asc'
                        ? tSafe(
                            'ascending',
                            'Ascending'
                          )
                        : tSafe(
                            'descending',
                            'Descending'
                          ),
                  }
                )}
              </AppText>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            style={
              styles.sortOptionsScroll
            }
            contentContainerStyle={
              styles.sortOptionsContent
            }
          >
            {sortOptions.map(
              option => (
                <TouchableOpacity
                  key={
                    option.id
                  }
                  style={[
                    styles.sortOptionButton,
                    sortBy ===
                      option.id &&
                      styles.sortOptionButtonActive,
                  ]}
                  onPress={() =>
                    setSortBy(
                      option.id
                    )
                  }
                >
                  <MaterialCommunityIcons
                    name={
                      option.icon
                    }
                    size={16}
                    color={
                      sortBy ===
                      option.id
                        ? theme.button.primaryText
                        : theme.brand.primary
                    }
                  />

                  <AppText
                    style={[
                      styles.sortOptionText,
                      sortBy ===
                        option.id &&
                        styles.sortOptionTextActive,
                    ]}
                  >
                    {
                      option.label
                    }
                  </AppText>
                </TouchableOpacity>
              )
            )}
          </ScrollView>
        </View>
      </>
    );

  // =========================================================
  // EMPTY
  // =========================================================

  const renderEmptyState =
    () => (
      <View
        style={
          styles.emptyState
        }
      >
        <MaterialCommunityIcons
          name="cash-multiple"
          size={64}
          color={
            theme.icon.muted
          }
        />

        <AppText
          style={
            styles.emptyStateTitle
          }
        >
          {tSafe(
            'no_earnings_found',
            'No Earnings Found'
          )}
        </AppText>

        <AppText
          style={
            styles.emptyStateText
          }
        >
          {searchQuery ||
          selectedFilter !==
            'all'
            ? tSafe(
                'try_changing_filters',
                'Try changing your search or filter criteria'
              )
            : tSafe(
                'complete_jobs_to_see_history',
                'Complete jobs to see your earnings history here'
              )}
        </AppText>

        {(
          searchQuery ||
          selectedFilter !==
            'all'
        ) && (
          <TouchableOpacity
            style={
              styles.resetButton
            }
            onPress={() => {
              setSearchQuery(
                ''
              );

              setSelectedFilter(
                'all'
              );
            }}
          >
            <AppText
              style={
                styles.resetButtonText
              }
            >
              {tSafe(
                'reset_filters',
                'Reset Filters'
              )}
            </AppText>
          </TouchableOpacity>
        )}
      </View>
    );

  // =========================================================
  // LOADING
  // =========================================================

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
          style={
            styles.loadingText
          }
        >
          {tSafe(
            'loading_payment_history',
            'Loading earnings history...'
          )}
        </AppText>
      </View>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  const selectedIsCompensation =
    selectedPayment &&
    getEarningType(
      selectedPayment
    ) ===
      'replacement_compensation';

  return (
    <View
      style={
        styles.container
      }
    >
      <StatusBar
        barStyle={
          isDark
            ? 'light-content'
            : 'dark-content'
        }
        backgroundColor={
          theme.background.default
        }
      />

      {/* Header */}
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
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={
              theme.brand.primary
            }
          />
        </TouchableOpacity>

        <AppText
          style={
            styles.headerTitle
          }
        >
          {tSafe(
            'earnings_history',
            'Earnings History'
          )}
        </AppText>

        <TouchableOpacity
          style={
            styles.exportButton
          }
          onPress={() => {
            alert(
              tSafe(
                'export_feature_coming_soon',
                'Export feature coming soon!'
              )
            );
          }}
        >
          <MaterialCommunityIcons
            name="export"
            size={24}
            color={
              theme.brand.primary
            }
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={
          filteredPayments
        }
        renderItem={
          renderPaymentItem
        }
        keyExtractor={(
          item,
          index
        ) =>
          `${item.type || 'earning'}-${item.id || index}`
        }
        ListHeaderComponent={
          renderHeader
        }
        ListEmptyComponent={
          renderEmptyState
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
          />
        }
        contentContainerStyle={
          styles.listContent
        }
        showsVerticalScrollIndicator={
          false
        }
        ItemSeparatorComponent={() => (
          <View
            style={
              styles.separator
            }
          />
        )}
        ListFooterComponent={
          <View
            style={
              styles.footerSpacing
            }
          />
        }
      />

      {/* =====================================================
          EARNING DETAILS MODAL
          ===================================================== */}

      <Modal
        visible={
          modalVisible
        }
        transparent={
          true
        }
        animationType="fade"
        onRequestClose={
          closePaymentModal
        }
        statusBarTranslucent={
          true
        }
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
              bounces={
                false
              }
            >
              {selectedPayment && (
                <>
                  {/* Modal Header */}
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
                            )}15`,
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
                            )}15`,
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

                  {/* Earning Details */}
                  <View
                    style={
                      styles.detailsSection
                    }
                  >
                    <AppText
                      style={
                        styles.sectionLabel
                      }
                    >
                      {tSafe(
                        'earning_details',
                        'Earning Details'
                      )}
                    </AppText>

                    {/* Type */}
                    <View
                      style={
                        styles.detailRow
                      }
                    >
                      <MaterialCommunityIcons
                        name={
                          selectedIsCompensation
                            ? 'cash-refund'
                            : 'broom'
                        }
                        size={20}
                        color={
                          getEarningTypeColor(
                            selectedPayment
                          )
                        }
                      />

                      <View
                        style={
                          styles.detailTextContainer
                        }
                      >
                        <AppText
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

                    {/* Compensation source */}
                    {selectedIsCompensation && (
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
                    )}

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
                          getStatusColor(
                            selectedPayment.status
                          )
                        }
                      />

                      <View
                        style={
                          styles.detailTextContainer
                        }
                      >
                        <AppText
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
                          style={[
                            styles.detailValue,
                            {
                              color:
                                getStatusColor(
                                  selectedPayment.status
                                ),
                            },
                          ]}
                        >
                          {getStatusLabel(
                            selectedPayment.status
                          )}
                        </AppText>
                      </View>
                    </View>

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
                  </View>

                  {/* Replacement Financial Information */}
                  {selectedIsCompensation && (
                    <View
                      style={
                        styles.detailsSection
                      }
                    >
                      <AppText
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

                  {/* Payment Information */}
                  <View
                    style={
                      styles.detailsSection
                    }
                  >
                    <AppText
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
                          style={
                            styles.detailValueSmall
                          }
                        >
                          {selectedPayment.id ||
                            tSafe(
                              'na',
                              'N/A'
                            )}
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
                  </View>

                  {/* Actions */}
                  <View
                    style={
                      styles.modalActions
                    }
                  >
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        styles.primaryAction,
                      ]}
                      onPress={() => {
                        closePaymentModal();

                        alert(
                          tSafe(
                            'downloading_receipt',
                            'Downloading receipt...'
                          )
                        );
                      }}
                    >
                      <MaterialCommunityIcons
                        name="download"
                        size={20}
                        color={
                          theme.button.primaryText
                        }
                      />

                      <AppText
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
                        styles.actionButton,
                        styles.secondaryAction,
                      ]}
                      onPress={
                        closePaymentModal
                      }
                    >
                      <AppText
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

// =============================================================
// THEME-AWARE STYLES
// =============================================================

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        theme.background.default,
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
      fontSize: 16,
      color:
        theme.text.secondary,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop:
        Platform.OS === 'ios'
          ? 60
          : 40,
      paddingBottom: 16,
      backgroundColor:
        theme.surface.default,
      borderBottomWidth: 1,
      borderBottomColor:
        theme.border.default,
      shadowColor:
        theme.text.primary,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity:
        isDarkTheme(theme)
          ? 0.2
          : 0.08,
      shadowRadius: 2,
      elevation: 2,
    },

    backButton: {
      padding: 8,
    },

    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color:
        theme.text.primary,
    },

    exportButton: {
      padding: 8,
    },

    listContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },

    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },

    statCard: {
      flex: 1,
      backgroundColor:
        theme.card.background,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      marginHorizontal: 3,
      borderWidth: 1,
      borderColor:
        theme.card.border,
      shadowColor:
        theme.text.primary,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity:
        isDarkTheme(theme)
          ? 0.2
          : 0.05,
      shadowRadius: 2,
      elevation: 1,
    },

    statValue: {
      fontSize: 16,
      fontWeight: '700',
      color:
        theme.text.primary,
      marginTop: 8,
    },

    statLabel: {
      fontSize: 11,
      color:
        theme.text.secondary,
      marginTop: 4,
      textAlign: 'center',
    },

    searchContainer: {
      marginBottom: 20,
    },

    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        theme.input.background,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor:
        theme.input.border,
    },

    searchInput: {
      flex: 1,
      fontSize: 16,
      color:
        theme.input.text,
      marginLeft: 12,
      padding: 0,
    },

    filtersSection: {
      marginBottom: 20,
    },

    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color:
        theme.text.primary,
      marginBottom: 12,
    },

    filtersScroll: {
      marginHorizontal: -16,
      paddingHorizontal: 16,
    },

    filtersContent: {
      paddingRight: 16,
    },

    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        theme.surface.selected,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 8,
      borderWidth: 1,
      borderColor:
        theme.brand.primary,
    },

    filterButtonActive: {
      backgroundColor:
        theme.brand.primary,
      borderColor:
        theme.brand.primary,
    },

    filterButtonText: {
      fontSize: 14,
      color:
        theme.brand.primary,
      marginLeft: 6,
      fontWeight: '500',
    },

    filterButtonTextActive: {
      color:
        theme.button.primaryText,
    },

    sortingSection: {
      marginBottom: 20,
    },

    sortingHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },

    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    sortButtonText: {
      fontSize: 14,
      color:
        theme.brand.primary,
      marginLeft: 6,
      fontWeight: '500',
    },

    sortOptionsScroll: {
      marginHorizontal: -16,
      paddingHorizontal: 16,
    },

    sortOptionsContent: {
      paddingRight: 16,
    },

    sortOptionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        theme.surface.elevated,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 8,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    sortOptionButtonActive: {
      backgroundColor:
        theme.brand.primary,
      borderColor:
        theme.brand.primary,
    },

    sortOptionText: {
      fontSize: 14,
      color:
        theme.text.secondary,
      marginLeft: 6,
      fontWeight: '500',
    },

    sortOptionTextActive: {
      color:
        theme.button.primaryText,
    },

    paymentCard: {
      backgroundColor:
        theme.card.background,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor:
        theme.card.border,
      shadowColor:
        theme.text.primary,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity:
        isDarkTheme(theme)
          ? 0.2
          : 0.05,
      shadowRadius: 2,
      elevation: 1,
    },

    paymentCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },

    paymentIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },

    paymentInfo: {
      flex: 1,
      minWidth: 0,
    },

    paymentService: {
      fontSize: 16,
      fontWeight: '600',
      color:
        theme.text.primary,
      marginBottom: 3,
    },

    paymentClient: {
      fontSize: 14,
      color:
        theme.text.secondary,
      marginBottom: 3,
    },

    paymentDate: {
      fontSize: 12,
      color:
        theme.text.muted,
    },

    paymentAmountContainer: {
      alignItems: 'flex-end',
      marginLeft: 8,
    },

    paymentAmount: {
      fontSize: 17,
      fontWeight: '700',
      marginBottom: 4,
    },

    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
    },

    statusText: {
      fontSize: 9,
      fontWeight: '700',
      textTransform: 'uppercase',
    },

    paymentCardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor:
        theme.divider,
      gap: 8,
    },

    footerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
    },

    footerText: {
      fontSize: 12,
      color:
        theme.text.muted,
      marginLeft: 4,
      flexShrink: 1,
    },

    separator: {
      height: 12,
    },

    emptyState: {
      alignItems: 'center',
      padding: 40,
    },

    emptyStateTitle: {
      fontSize: 18,
      fontWeight: '600',
      color:
        theme.text.primary,
      marginTop: 16,
    },

    emptyStateText: {
      fontSize: 14,
      color:
        theme.text.secondary,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 20,
    },

    resetButton: {
      marginTop: 16,
      backgroundColor:
        theme.brand.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },

    resetButtonText: {
      color:
        theme.button.primaryText,
      fontSize: 14,
      fontWeight: '600',
    },

    footerSpacing: {
      height: 20,
    },

    // =========================================================
    // MODAL
    // =========================================================

    modalOverlay: {
      flex: 1,
      backgroundColor:
        'rgba(0, 0, 0, 0.5)',
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
      color:
        theme.text.primary,
      marginBottom: 8,
    },

    modalPaymentStatus: {
      fontSize: 14,
      fontWeight: '600',
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 12,
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
      color:
        theme.text.primary,
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
      color:
        theme.text.muted,
      marginBottom: 4,
    },

    detailValue: {
      fontSize: 16,
      color:
        theme.text.primary,
      fontWeight: '500',
    },

    detailValueSmall: {
      fontSize: 14,
      color:
        theme.text.secondary,
      fontWeight: '400',
    },

    modalActions: {
      marginTop: 32,
      gap: 12,
    },

    actionButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:
        theme.surface.elevated,
      borderRadius: 12,
      marginHorizontal: 4,
      borderWidth: 1,
      borderColor:
        theme.border.default,
      shadowColor:
        theme.text.primary,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity:
        isDarkTheme(theme)
          ? 0.2
          : 0.05,
      shadowRadius: 2,
      elevation: 1,
    },

    primaryAction: {
      backgroundColor:
        theme.button.primaryBackground,
      borderWidth: 0,
      paddingVertical: 16,
      gap: 8,
    },

    primaryActionText: {
      color:
        theme.button.primaryText,
      fontSize: 16,
      fontWeight: '600',
    },

    secondaryAction: {
      backgroundColor:
        theme.surface.selected,
      borderColor:
        theme.border.default,
      paddingVertical: 16,
    },

    secondaryActionText: {
      color:
        theme.text.secondary,
      fontSize: 16,
      fontWeight: '500',
    },
  });

// =============================================================
// THEME HELPER
// =============================================================

const isDarkTheme = theme =>
  theme?.background?.default ===
  '#0B1220';

export default PaymentsHistoryCleaner;


// import React, { useState, useEffect, useContext, useMemo } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   RefreshControl,
//   TextInput,
//   FlatList,
//   Platform,
//   StatusBar,
//   Dimensions,
//   Modal,
//   Animated,
//   Image,
// } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import { AuthContext } from '../../../context/AuthContext';
// import userService from '../../../services/connection/userService';
// import COLORS from '../../../constants/colors';
// import { formatAmountWithSymbol } from '../../../utils/formatAmountWithSymbol';
// import { minutesToDuration } from '../../../utils/minuteToDuration';
// import { tSafe } from '../../../utils/tSafe';

// const { width, height } = Dimensions.get('window');

// const PaymentsHistoryCleaner = () => {
//   const navigation = useNavigation();
//   const { currentUserId, currency, currentUser, geolocationData } = useContext(AuthContext);


//   const [payments, setPayments] = useState([]);
//   const [filteredPayments, setFilteredPayments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedFilter, setSelectedFilter] = useState('all');
//   const [sortBy, setSortBy] = useState('date');
//   const [sortOrder, setSortOrder] = useState('desc');
//   const [stats, setStats] = useState({
//     total: 0,
//     thisMonth: 0,
//     lastMonth: 0,
//     averagePayment: 0,
//   });

//   // Modal states
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedPayment, setSelectedPayment] = useState(null);
//   const [slideAnim] = useState(new Animated.Value(height));

//   const filters = useMemo(() => [
//     { id: 'all', label: tSafe('all_payments', 'All Payments'), icon: 'cash-multiple' },
//     { id: 'this_month', label: tSafe('this_month', 'This Month'), icon: 'calendar-month' },
//     { id: 'last_month', label: tSafe('last_month', 'Last Month'), icon: 'calendar-arrow-left' },
//     { id: 'approved', label: tSafe('approved', 'Approved'), icon: 'check-circle' },
//     { id: 'pending', label: tSafe('pending', 'Pending'), icon: 'clock-outline' },
//     { id: 'manual', label: tSafe('manual_approval', 'Manual Approval'), icon: 'hand-coin' },
//     { id: 'auto', label: tSafe('auto_approval', 'Auto Approval'), icon: 'credit-card-check' },
//   ], []);

//   const sortOptions = useMemo(() => [
//     { id: 'date', label: tSafe('date', 'Date'), icon: 'calendar' },
//     { id: 'amount', label: tSafe('amount', 'Amount'), icon: 'currency-usd' },
//     { id: 'client', label: tSafe('client', 'Client'), icon: 'account' },
//   ], []);

//   // Fetch all payments
//   const fetchAllPayments = async () => {
//     if (!currentUserId) return;

//     try {
//       setLoading(true);
      
//       console.log("Fetching payments for user:", currentUserId);
      
//       const response = await userService.getAllCleanerPayments(currentUserId);
      
//       console.log("API Response:", response);
      
//       let paymentData = [];
      
//       if (response) {
//         if (response.data && response.data.payments) {
//           paymentData = response.data.payments;
//           console.log("Found payments in response.data.payments:", paymentData.length);
//         } else if (response.payments) {
//           paymentData = response.payments;
//           console.log("Found payments in response.payments:", paymentData.length);
//         } else if (Array.isArray(response)) {
//           paymentData = response;
//           console.log("Response is directly an array:", paymentData.length);
//         } else if (response.data && Array.isArray(response.data)) {
//           paymentData = response.data;
//           console.log("Found array in response.data:", paymentData.length);
//         }
//       }
      
//       console.log("Final paymentData:", paymentData);
      
//       if (!Array.isArray(paymentData)) {
//         console.error("paymentData is not an array. Full response structure:");
//         console.log(JSON.stringify(response, null, 2));
//         paymentData = [];
//       }
      
//       calculateStats(paymentData);
      
//       setPayments(paymentData);
//       setFilteredPayments(paymentData);
      
//     } catch (error) {
//       console.error('Error fetching all payments:', error);
//       setPayments([]);
//       setFilteredPayments([]);
//       setStats({
//         total: 0,
//         thisMonth: 0,
//         lastMonth: 0,
//         averagePayment: 0,
//       });
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const calculateStats = (paymentData) => {
//     console.log("Calculating stats for:", paymentData);
    
//     if (!paymentData || !Array.isArray(paymentData) || paymentData.length === 0) {
//       console.log("No payment data to calculate stats");
//       setStats({
//         total: 0,
//         thisMonth: 0,
//         lastMonth: 0,
//         averagePayment: 0,
//       });
//       return;
//     }

//     const now = new Date();
//     const currentMonth = now.getMonth();
//     const currentYear = now.getFullYear();
//     const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
//     const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

//     let total = 0;
//     let thisMonthTotal = 0;
//     let lastMonthTotal = 0;

//     paymentData.forEach((payment) => {
//       const amount = payment.amount || 0;
//       total += amount;

//       if (payment.date) {
//         try {
//           const paymentDate = new Date(payment.date);
//           const paymentMonth = paymentDate.getMonth();
//           const paymentYear = paymentDate.getFullYear();

//           if (paymentMonth === currentMonth && paymentYear === currentYear) {
//             thisMonthTotal += amount;
//           } else if (paymentMonth === lastMonth && paymentYear === lastMonthYear) {
//             lastMonthTotal += amount;
//           }
//         } catch (dateError) {
//           console.error("Error parsing date:", payment.date, dateError);
//         }
//       }
//     });

//     const statsData = {
//       total: total,
//       thisMonth: thisMonthTotal,
//       lastMonth: lastMonthTotal,
//       averagePayment: paymentData.length > 0 ? total / paymentData.length : 0,
//     };

//     console.log("Calculated stats:", statsData);
//     setStats(statsData);
//   };

//   // Apply filters and search
//   useEffect(() => {
//     if (!payments.length) {
//       setFilteredPayments([]);
//       return;
//     }

//     let result = [...payments];

//     // Apply search filter
//     if (searchQuery) {
//       const query = searchQuery.toLowerCase();
//       result = result.filter(payment =>
//         (payment.client?.toLowerCase() || '').includes(query) ||
//         (payment.service?.toLowerCase() || '').includes(query) ||
//         (payment.id?.toLowerCase() || '').includes(query)
//       );
//     }

//     // Apply category filter
//     switch (selectedFilter) {
//       case 'this_month':
//         const now = new Date();
//         const currentMonth = now.getMonth();
//         const currentYear = now.getFullYear();
//         result = result.filter(payment => {
//           const paymentDate = new Date(payment.date);
//           return (
//             paymentDate.getMonth() === currentMonth &&
//             paymentDate.getFullYear() === currentYear
//           );
//         });
//         break;
//       case 'last_month':
//         const lastMonthDate = new Date();
//         lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
//         const lastMonth = lastMonthDate.getMonth();
//         const lastMonthYear = lastMonthDate.getFullYear();
//         result = result.filter(payment => {
//           const paymentDate = new Date(payment.date);
//           return (
//             paymentDate.getMonth() === lastMonth &&
//             paymentDate.getFullYear() === lastMonthYear
//           );
//         });
//         break;
//       case 'approved':
//         result = result.filter(payment => payment.status === 'completed');
//         break;
//       case 'pending':
//         result = result.filter(payment => payment.status === 'pending');
//         break;
//       case 'manual':
//         result = result.filter(payment => payment.approval_type === 'manual');
//         break;
//       case 'auto':
//         result = result.filter(payment => payment.approval_type === 'auto');
//         break;
//       default:
//         break;
//     }

//     // Apply sorting
//     result.sort((a, b) => {
//       let valueA, valueB;

//       switch (sortBy) {
//         case 'date':
//           valueA = new Date(a.date).getTime();
//           valueB = new Date(b.date).getTime();
//           break;
//         case 'amount':
//           valueA = a.amount || 0;
//           valueB = b.amount || 0;
//           break;
//         case 'client':
//           valueA = (a.client || '').toLowerCase();
//           valueB = (b.client || '').toLowerCase();
//           break;
//         default:
//           valueA = new Date(a.date).getTime();
//           valueB = new Date(b.date).getTime();
//       }

//       if (sortOrder === 'asc') {
//         return valueA > valueB ? 1 : -1;
//       } else {
//         return valueA < valueB ? 1 : -1;
//       }
//     });

//     setFilteredPayments(result);
//   }, [payments, searchQuery, selectedFilter, sortBy, sortOrder]);

//   // Load data on focus
//   useFocusEffect(
//     React.useCallback(() => {
//       fetchAllPayments();
//     }, [currentUserId])
//   );

//   // Pull to refresh
//   const onRefresh = React.useCallback(() => {
//     setRefreshing(true);
//     fetchAllPayments();
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

//   const formatCurrency = (amount) => {
//     return `${currency}${amount?.toFixed(2) || '0.00'}`;
//   };

//   const formatDate = (dateString) => {
//     try {
//       if (!dateString) return tSafe('na', 'N/A');
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

//   const getStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'completed':
//         return '#34C759';
//       case 'pending':
//         return '#FF9500';
//       case 'failed':
//         return '#FF3B30';
//       default:
//         return '#8E8E93';
//     }
//   };

//   const getStatusIcon = (status, approvalType) => {
//     if (status === 'completed') {
//       return approvalType === 'manual' ? 'hand-coin' : 'credit-card-check';
//     } else if (status === 'pending') {
//       return 'clock-outline';
//     } else {
//       return 'alert-circle';
//     }
//   };

//   const toggleSortOrder = () => {
//     setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
//   };

//   const renderPaymentItem = ({ item }) => (
//     <TouchableOpacity 
//       style={styles.paymentCard}
//       onPress={() => openPaymentModal(item)}
//       activeOpacity={0.7}
//     >
//       <View style={styles.paymentCardHeader}>
//         <View style={styles.paymentIconContainer}>
//           <MaterialCommunityIcons 
//             name={getStatusIcon(item.status, item.approval_type)} 
//             size={24} 
//             color={getStatusColor(item.status)} 
//           />
//         </View>
//         <View style={styles.paymentInfo}>
//           <Text style={styles.paymentService}>{item.property_name || tSafe('cleaning_service', 'Cleaning Service')}</Text>
//           <Text style={styles.paymentClient}>{item.client || tSafe('client', 'Client')}</Text>
//           <Text style={styles.paymentDate}>{formatDate(item.date)}</Text>
//         </View>
//         <View style={styles.paymentAmountContainer}>
//           <Text style={styles.paymentAmount}>{formatAmountWithSymbol(item.amount, currency)}</Text>

//           <View style={[
//             styles.statusBadge,
//             { backgroundColor: getStatusColor(item.status) + '20' }
//           ]}>
//             <Text style={[
//               styles.statusText,
//               { color: getStatusColor(item.status) }
//             ]}>
//               {item.status === 'completed' ? tSafe('completed', 'Completed') :
//                item.status === 'pending' ? tSafe('pending', 'Pending') :
//                item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : tSafe('unknown', 'Unknown')}
//             </Text>
//           </View>
//         </View>
//       </View>
      
//       <View style={styles.paymentCardFooter}>
//         <View style={styles.footerItem}>
//           <MaterialCommunityIcons name="clock-outline" size={14} color="#8E8E93" />
//           <Text style={styles.footerText}>{minutesToDuration(item.duration) || tSafe('na', 'N/A')}</Text>
//         </View>
//         <View style={styles.footerItem}>
//           <MaterialCommunityIcons 
//             name={item.approval_type === 'manual' ? 'hand-pointing-right' : 'robot'} 
//             size={14} 
//             color="#8E8E93" 
//           />
//           <Text style={styles.footerText}>
//             {item.approval_type === 'manual' ? tSafe('manual', 'Manual') : tSafe('auto', 'Auto')}
//           </Text>
//         </View>
//         <View style={styles.footerItem}>
//           <MaterialCommunityIcons name="identifier" size={14} color="#8E8E93" />
//           <Text style={styles.footerText}>
//             {tSafe('id_prefix', 'ID:')} {item.id?.substring(0, 8) || tSafe('na', 'N/A')}
//           </Text>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   const renderHeader = () => (
//     <>
//       {/* Stats Overview */}
//       <View style={styles.statsContainer}>
//         <View style={styles.statCard}>
//           <MaterialCommunityIcons name="cash-multiple" size={24} color={COLORS.primary} />
//           <Text style={styles.statValue}>{formatAmountWithSymbol(stats.total, currency)}</Text>
//           <Text style={styles.statLabel}>{tSafe('total_earnings', 'Total Earnings')}</Text>
//         </View>
//         <View style={styles.statCard}>
//           <MaterialCommunityIcons name="calendar-month" size={24} color="#34C759" />
//           <Text style={styles.statValue}>{formatAmountWithSymbol(stats.thisMonth, currency)}</Text>
//           <Text style={styles.statLabel}>{tSafe('this_month', 'This Month')}</Text>
//         </View>
//         <View style={styles.statCard}>
//           <MaterialCommunityIcons name="trending-up" size={24} color="#FF9500" />
//           <Text style={styles.statValue}>{formatAmountWithSymbol(stats.averagePayment, currency)}</Text>
//           <Text style={styles.statLabel}>{tSafe('avg_payment', 'Avg Payment')}</Text>
//         </View>
//       </View>

//       {/* Search Bar */}
//       <View style={styles.searchContainer}>
//         <View style={styles.searchBar}>
//           <MaterialCommunityIcons name="magnify" size={20} color="#8E8E93" />
//           <TextInput
//             style={styles.searchInput}
//             placeholder={tSafe('search_payments_placeholder', 'Search payments by client or service...')}
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//             placeholderTextColor="#8E8E93"
//           />
//           {searchQuery ? (
//             <TouchableOpacity onPress={() => setSearchQuery('')}>
//               <MaterialCommunityIcons name="close-circle" size={20} color="#8E8E93" />
//             </TouchableOpacity>
//           ) : null}
//         </View>
//       </View>

//       {/* Filters */}
//       <View style={styles.filtersSection}>
//         <Text style={styles.sectionTitle}>{tSafe('filter_payments', 'Filter Payments')}</Text>
//         <ScrollView 
//           horizontal 
//           showsHorizontalScrollIndicator={false}
//           style={styles.filtersScroll}
//           contentContainerStyle={styles.filtersContent}
//         >
//           {filters.map(filter => (
//             <TouchableOpacity
//               key={filter.id}
//               style={[
//                 styles.filterButton,
//                 selectedFilter === filter.id && styles.filterButtonActive,
//               ]}
//               onPress={() => setSelectedFilter(filter.id)}
//             >
//               <MaterialCommunityIcons 
//                 name={filter.icon} 
//                 size={16} 
//                 color={selectedFilter === filter.id ? '#FFFFFF' : COLORS.primary} 
//               />
//               <Text style={[
//                 styles.filterButtonText,
//                 selectedFilter === filter.id && styles.filterButtonTextActive,
//               ]}>
//                 {filter.label}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>

//       {/* Sorting */}
//       <View style={styles.sortingSection}>
//         <View style={styles.sortingHeader}>
//           <Text style={styles.sectionTitle}>
//             {tSafe('payments_found', '{count} Payments Found', { count: filteredPayments.length })}
//           </Text>
//           <TouchableOpacity 
//             style={styles.sortButton}
//             onPress={toggleSortOrder}
//           >
//             <MaterialCommunityIcons 
//               name={sortOrder === 'asc' ? 'sort-ascending' : 'sort-descending'} 
//               size={20} 
//               color={COLORS.primary} 
//             />
//             <Text style={styles.sortButtonText}>
//               {tSafe('sort_by', 'Sort by {order}', { order: sortOrder === 'asc' ? tSafe('ascending', 'Ascending') : tSafe('descending', 'Descending') })}
//             </Text>
//           </TouchableOpacity>
//         </View>
        
//         <ScrollView 
//           horizontal 
//           showsHorizontalScrollIndicator={false}
//           style={styles.sortOptionsScroll}
//           contentContainerStyle={styles.sortOptionsContent}
//         >
//           {sortOptions.map(option => (
//             <TouchableOpacity
//               key={option.id}
//               style={[
//                 styles.sortOptionButton,
//                 sortBy === option.id && styles.sortOptionButtonActive,
//               ]}
//               onPress={() => setSortBy(option.id)}
//             >
//               <MaterialCommunityIcons 
//                 name={option.icon} 
//                 size={16} 
//                 color={sortBy === option.id ? '#FFFFFF' : COLORS.primary} 
//               />
//               <Text style={[
//                 styles.sortOptionText,
//                 sortBy === option.id && styles.sortOptionTextActive,
//               ]}>
//                 {option.label}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>
//     </>
//   );

//   const renderEmptyState = () => (
//     <View style={styles.emptyState}>
//       <MaterialCommunityIcons name="cash-multiple" size={64} color="#C7C7CC" />
//       <Text style={styles.emptyStateTitle}>{tSafe('no_payments_found', 'No Payments Found')}</Text>
//       <Text style={styles.emptyStateText}>
//         {searchQuery || selectedFilter !== 'all' 
//           ? tSafe('try_changing_filters', 'Try changing your search or filter criteria')
//           : tSafe('complete_jobs_to_see_history', 'Complete jobs to see your payment history here')}
//       </Text>
//       {(searchQuery || selectedFilter !== 'all') && (
//         <TouchableOpacity 
//           style={styles.resetButton}
//           onPress={() => {
//             setSearchQuery('');
//             setSelectedFilter('all');
//           }}
//         >
//           <Text style={styles.resetButtonText}>{tSafe('reset_filters', 'Reset Filters')}</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );

  
//   if (loading && !refreshing) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>{tSafe('loading_payment_history', 'Loading payment history...')}</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//         >
//           <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primary} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>{tSafe('payment_history', 'Payment History')}</Text>
//         <TouchableOpacity 
//           style={styles.exportButton}
//           onPress={() => {
//             alert(tSafe('export_feature_coming_soon', 'Export feature coming soon!'));
//           }}
//         >
//           <MaterialCommunityIcons name="export" size={24} color={COLORS.primary} />
//         </TouchableOpacity>
//       </View>

//       <FlatList
//         data={filteredPayments}
//         renderItem={renderPaymentItem}
//         keyExtractor={(item) => item.id}
//         ListHeaderComponent={renderHeader}
//         ListEmptyComponent={renderEmptyState}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//         contentContainerStyle={styles.listContent}
//         showsVerticalScrollIndicator={false}
//         ItemSeparatorComponent={() => <View style={styles.separator} />}
//         ListFooterComponent={<View style={styles.footerSpacing} />}
//       />

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
//                         name={getStatusIcon(selectedPayment.status, selectedPayment.approval_type)} 
//                         size={32} 
//                         color={getStatusColor(selectedPayment.status)} 
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
//                         <Text style={styles.detailValue}>{selectedPayment.property_name || tSafe('standard_cleaning', 'Standard Cleaning')}</Text>
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
//                       <MaterialCommunityIcons name="check-circle" size={20} color={getStatusColor(selectedPayment.status)} />
//                       <View style={styles.detailTextContainer}>
//                         <Text style={styles.detailLabel}>{tSafe('status', 'Status')}</Text>
//                         <Text style={[styles.detailValue, { color: getStatusColor(selectedPayment.status) }]}>
//                           {selectedPayment.status === 'completed' ? tSafe('completed', 'Completed') :
//                            selectedPayment.status === 'pending' ? tSafe('pending', 'Pending') :
//                            selectedPayment.status?.charAt(0).toUpperCase() + selectedPayment.status?.slice(1) || tSafe('unknown', 'Unknown')}
//                         </Text>
//                       </View>
//                     </View>

//                     <View style={styles.detailRow}>
//                       <MaterialCommunityIcons name="home" size={20} color="#8E8E93" />
//                       <View style={styles.detailTextContainer}>
//                         <Text style={styles.detailLabel}>{tSafe('property', 'Property')}</Text>
//                         <Text style={styles.detailValue}>{selectedPayment.property_name || tSafe('unknown_property', 'Unknown Property')}</Text>
//                       </View>
//                     </View>

//                     <View style={styles.detailRow}>
//                       <MaterialCommunityIcons name="map-marker" size={20} color="#8E8E93" />
//                       <View style={styles.detailTextContainer}>
//                         <Text style={styles.detailLabel}>{tSafe('address', 'Address')}</Text>
//                         <Text style={styles.detailValueSmall}>{selectedPayment.address || tSafe('address_not_available', 'Address not available')}</Text>
//                       </View>
//                     </View>
//                   </View>

//                   {/* Payment Information */}
//                   <View style={styles.detailsSection}>
//                     <Text style={styles.sectionLabel}>{tSafe('payment_information', 'Payment Information')}</Text>
                    
//                     <View style={styles.detailRow}>
//                       <MaterialCommunityIcons name="identifier" size={20} color="#8E8E93" />
//                       <View style={styles.detailTextContainer}>
//                         <Text style={styles.detailLabel}>{tSafe('payment_id', 'Payment ID')}</Text>
//                         <Text style={styles.detailValueSmall}>
//                           {selectedPayment.id || tSafe('na', 'N/A')}
//                         </Text>
//                       </View>
//                     </View>

//                     <View style={styles.detailRow}>
//                       <MaterialCommunityIcons name="credit-card" size={20} color="#8E8E93" />
//                       <View style={styles.detailTextContainer}>
//                         <Text style={styles.detailLabel}>{tSafe('approval_type', 'Approval Type')}</Text>
//                         <Text style={styles.detailValue}>
//                           {selectedPayment.approval_type === 'manual' ? tSafe('manual_approval', 'Manual Approval') : tSafe('automatic', 'Automatic')}
//                         </Text>
//                       </View>
//                     </View>

//                     {selectedPayment.approved_by && (
//                       <View style={styles.detailRow}>
//                         <MaterialCommunityIcons name="account-check" size={20} color="#8E8E93" />
//                         <View style={styles.detailTextContainer}>
//                           <Text style={styles.detailLabel}>{tSafe('approved_by', 'Approved By')}</Text>
//                           <Text style={styles.detailValue}>
//                             {selectedPayment.approved_by || tSafe('system', 'System')}
//                           </Text>
//                         </View>
//                       </View>
//                     )}

//                     {selectedPayment.scheduleId && (
//                       <View style={styles.detailRow}>
//                         <MaterialCommunityIcons name="calendar-check" size={20} color="#8E8E93" />
//                         <View style={styles.detailTextContainer}>
//                           <Text style={styles.detailLabel}>{tSafe('schedule_id', 'Schedule ID')}</Text>
//                           <Text style={styles.detailValueSmall}>
//                             {selectedPayment.scheduleId || tSafe('na', 'N/A')}
//                           </Text>
//                         </View>
//                       </View>
//                     )}
//                   </View>

//                   {/* Action Buttons */}
//                   <View style={styles.modalActions}>
//                     <TouchableOpacity 
//                       style={[styles.actionButton, styles.primaryAction]}
//                       onPress={() => {
//                         closePaymentModal();
//                         alert(tSafe('downloading_receipt', 'Downloading receipt...'));
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
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingTop: Platform.OS === 'ios' ? 60 : 40,
//     paddingBottom: 16,
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   backButton: {
//     padding: 8,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1A1A1A',
//   },
//   exportButton: {
//     padding: 8,
//   },
//   listContent: {
//     paddingHorizontal: 16,
//     paddingTop: 16,
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   statCard: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 16,
//     alignItems: 'center',
//     marginHorizontal: 4,
//     borderWidth: 1,
//     borderColor: '#E9ECEF',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   statValue: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1A1A1A',
//     marginTop: 8,
//   },
//   statLabel: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 4,
//   },
//   searchContainer: {
//     marginBottom: 20,
//   },
//   searchBar: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderWidth: 1,
//     borderColor: '#E9ECEF',
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     color: '#1A1A1A',
//     marginLeft: 12,
//     padding: 0,
//   },
//   filtersSection: {
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1A1A1A',
//     marginBottom: 12,
//   },
//   filtersScroll: {
//     marginHorizontal: -16,
//     paddingHorizontal: 16,
//   },
//   filtersContent: {
//     paddingRight: 16,
//   },
//   filterButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#E7F3FF',
//     borderRadius: 20,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     marginRight: 8,
//     borderWidth: 1,
//     borderColor: COLORS.primary,
//   },
//   filterButtonActive: {
//     backgroundColor: COLORS.primary,
//     borderColor: COLORS.primary,
//   },
//   filterButtonText: {
//     fontSize: 14,
//     color: COLORS.primary,
//     marginLeft: 6,
//     fontWeight: '500',
//   },
//   filterButtonTextActive: {
//     color: '#FFFFFF',
//   },
//   sortingSection: {
//     marginBottom: 20,
//   },
//   sortingHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   sortButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   sortButtonText: {
//     fontSize: 14,
//     color: COLORS.primary,
//     marginLeft: 6,
//     fontWeight: '500',
//   },
//   sortOptionsScroll: {
//     marginHorizontal: -16,
//     paddingHorizontal: 16,
//   },
//   sortOptionsContent: {
//     paddingRight: 16,
//   },
//   sortOptionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F8F9FA',
//     borderRadius: 20,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     marginRight: 8,
//     borderWidth: 1,
//     borderColor: '#E9ECEF',
//   },
//   sortOptionButtonActive: {
//     backgroundColor: COLORS.primary,
//     borderColor: COLORS.primary,
//   },
//   sortOptionText: {
//     fontSize: 14,
//     color: '#666',
//     marginLeft: 6,
//     fontWeight: '500',
//   },
//   sortOptionTextActive: {
//     color: '#FFFFFF',
//   },
//   paymentCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: '#E9ECEF',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   paymentCardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   paymentIconContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#F8F9FA',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   paymentInfo: {
//     flex: 1,
//   },
//   paymentService: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1A1A1A',
//     marginBottom: 2,
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
//     alignItems: 'flex-end',
//   },
//   paymentAmount: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#34C759',
//     marginBottom: 4,
//   },
//   statusBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   statusText: {
//     fontSize: 10,
//     fontWeight: '600',
//     textTransform: 'uppercase',
//   },
//   paymentCardFooter: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#F0F0F0',
//   },
//   footerItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   footerText: {
//     fontSize: 12,
//     color: '#8E8E93',
//     marginLeft: 4,
//   },
//   separator: {
//     height: 12,
//   },
//   emptyState: {
//     alignItems: 'center',
//     padding: 40,
//   },
//   emptyStateTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1A1A1A',
//     marginTop: 16,
//   },
//   emptyStateText: {
//     fontSize: 14,
//     color: '#8E8E93',
//     textAlign: 'center',
//     marginTop: 8,
//     lineHeight: 20,
//   },
//   resetButton: {
//     marginTop: 16,
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   resetButtonText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   footerSpacing: {
//     height: 20,
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
//     backgroundColor: '#F8F9FA',
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
//   modalActions: {
//     marginTop: 32,
//     gap: 12,
//   },
//   actionButton: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
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
//   primaryAction: {
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

// export default PaymentsHistoryCleaner;