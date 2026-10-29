import React, {
  useContext,
  useRef,
  useEffect,
  useState,
} from 'react';

import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  RefreshControl,
  FlatList,
  StatusBar,
  Animated,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import ROUTES from '../../constants/routes';
import userService from '../../services/connection/userService';
import { AuthContext } from '../../context/AuthContext';

import {
  useFocusEffect,
  useRoute,
  useNavigation,
} from '@react-navigation/native';

import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { tSafe } from '../../utils/tSafe';

// Theme
import { useTheme } from '../../theme';
import { AppText, AppCard } from '../../ui';

// Components
import NewlyPublishedSchedule from '../../components/host/NewlyPublishedSchedule';
import PendingApprovalListItem from '../../components/host/PendingApprovalListItem';
import UpcomingScheduleListItem from '../../components/shared/UpcomingScheduleListItem';
import PropertyCardList from '../../components/host/PropertyCardList';

import { useBookingContext } from '../../context/BookingContext';
import NewBooking from './NewBooking';
import EditSchedule from './EditSchedule';

/* ---------------------------------- tokens --------------------------------- */

const S = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

const R = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 28,
  pill: 999,
};

/* ------------------------------ small components --------------------------- */

const StatPill = ({
  icon,
  value,
  label,
  color,
  theme,
}) => {
  const styles = createStyles(theme);

  return (
    <View style={styles.statPill}>
      <View
        style={[
          styles.statPillIcon,
          {
            backgroundColor: `${color}14`,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={color}
        />
      </View>

      <AppText
        variant="title"
        numberOfLines={1}
        style={styles.statPillValue}
      >
        {value}
      </AppText>

      <AppText
        variant="caption"
        numberOfLines={1}
        style={styles.statPillLabel}
      >
        {label}
      </AppText>
    </View>
  );
};

/* --------------------------------- dashboard ------------------------------- */

const Dashboard = () => {
  const { t } = useTranslation();

  const scrollRef = useRef(null);
  const route = useRoute();
  const navigation = useNavigation();

  const {
    currentUser,
    currentUserId,
    currency,
    geolocationData,
    notificationUnreadCount,
  } = useContext(AuthContext);

  const {
    handleEdit,
    modalVisible,
    modalEVisible,
    handleCreateSchedule,
  } = useBookingContext();

  const {
    theme,
    isDark,
  } = useTheme();

  const styles = createStyles(theme);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [pendingPayment, setFilteredPendingPayment] = useState([]);
  const [
    pendingCompletionApproval,
    setFilteredPendingCompletionApprovalSchedules,
  ] = useState([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [cleaningRequests, setCleaningRequests] = useState([]);
  const [properties, setProperties] = useState([]);
  const [clientSecret, setClientSecret] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('upcoming');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const filters = [
    {
      id: 'upcoming',
      label: tSafe('upcoming', 'Upcoming'),
    },
    {
      id: 'in_progress',
      label: tSafe('in_progress', 'In Progress'),
    },
    {
      id: 'completed',
      label: tSafe('completed', 'Completed'),
    },
  ];

  /* ------------------------------------------------------------------------ */
  /* Data                                                                     */
  /* ------------------------------------------------------------------------ */

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await Promise.all([
        fetchSchedules(),
        fetchRequests(),
        fetchProperties(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchSchedules(),
          fetchRequests(),
          fetchProperties(),
          fetchClientSecret(),
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchRequests();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 520,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchClientSecret = async () => {
    try {
      const response = await userService.getClientSecret();
      setClientSecret(response.data.client_secret);
    } catch (error) {
      console.error('Error fetching client secret:', error);
    }
  };

  const fetchRequests = async () => {
    const currentTime = moment().format(
      'YYYY-MM-DD HH:mm:ss'
    );

    try {
      const response =
        await userService.getHostCleaningRequest(
          currentUserId,
          currentTime
        );

      const res = response.data;

      setPendingCount(res.length);

      const pendingPaymentRequests = res.filter(
        (req) => req.status === 'pending_payment'
      );

      setCleaningRequests(res);
      setFilteredPendingPayment(
        pendingPaymentRequests
      );
    } catch (e) {
      console.log(e);
    }
  };

  const fetchProperties = async () => {
    try {
      const response =
        await userService.getApartment(currentUserId);

      setProperties(response.data);
    } catch (error) {
      console.error(
        'Error fetching properties:',
        error
      );
    }
  };

  const fetchSchedules = async () => {
    try {
      const response =
        await userService.getSchedulesByHostId(
          currentUserId
        );

      const res = response.data;

      setSchedules(res);

      const pendingCompletionApprovalSchedules =
        res
          .filter(
            (schedule) =>
              (
                schedule.status === 'completed' ||
                schedule.status === 'in_progress' ||
                schedule.status === 'pending_review'
              ) &&
              Array.isArray(schedule.assignedTo) &&
              schedule.assignedTo.some(
                (cleaner) =>
                  cleaner.status === 'pending_review'
              )
          )
          .map((schedule) => ({
            ...schedule,

            assignedTo:
              schedule.assignedTo.filter(
                (cleaner) =>
                  cleaner.status === 'pending_review'
              ),
          }));

      setFilteredPendingCompletionApprovalSchedules(
        pendingCompletionApprovalSchedules
      );

      const getScheduleDateTime = (schedule) => {
        const date =
          schedule.cleaning_date ||
          schedule.schedule?.cleaning_date;

        const time =
          schedule.cleaning_time ||
          schedule.schedule?.cleaning_time ||
          '00:00:00';

        return new Date(`${date}T${time}`);
      };

      const upcomingSchedulesFiltered = res
        .filter((schedule) => {
          const isValidStatus =
            schedule.status === 'pending_payment' ||
            schedule.status === 'upcoming';

          return isValidStatus;
        })
        .sort(
          (a, b) =>
            getScheduleDateTime(a) -
            getScheduleDateTime(b)
        );

      setUpcomingSchedules(
        upcomingSchedulesFiltered
      );
    } catch (err) {
      console.log(err);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Helpers                                                                  */
  /* ------------------------------------------------------------------------ */

  const handleHostPress = () => {
    navigation.navigate(
      ROUTES.host_add_apt
    );
  };

  const calculateTotalSpent = () => {
    return schedules
      .filter(
        (s) => s.status === 'completed'
      )
      .reduce(
        (sum, schedule) =>
          sum +
          (
            schedule.overall_checklist
              ?.totalFee ||
            schedule.schedule
              ?.total_cleaning_fee ||
            0
          ),
        0
      );
  };

  const formatAmount = (value) => {
    if (value >= 1_000_000) {
      return `${(
        value / 1_000_000
      ).toFixed(1)}M`;
    }

    if (value >= 1_000) {
      return `${(
        value / 1_000
      ).toFixed(1)}k`;
    }

    return value.toString();
  };

  const totalSpent =
    calculateTotalSpent();

  const totalSpentLabel =
    totalSpent;

  const formatCurrency = (amount) => {
    return `${
      geolocationData?.currency?.symbol ||
      '$'
    }${amount?.toFixed(2) || '0.00'}`;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      completed:
        theme.status.success,

      in_progress:
        theme.brand.primary,

      pending_payment:
        theme.status.warning,

      upcoming:
        theme.status.info,

      pending_acceptance:
        theme.status.warning,

      pending_completion_approval:
        theme.status.warning,

      cancelled:
        theme.status.error,
    };

    return (
      colorMap[status] ||
      theme.text.muted
    );
  };

  const getStatusLabel = (status) => {
    const labelMap = {
      completed: tSafe(
        'completed_status',
        'Completed'
      ),

      in_progress: tSafe(
        'in_progress_status',
        'In Progress'
      ),

      pending_payment: tSafe(
        'pending_payment_status',
        'Pending Payment'
      ),

      upcoming: tSafe(
        'upcoming_status',
        'Upcoming'
      ),

      pending_acceptance: tSafe(
        'pending_acceptance_status',
        'Pending'
      ),

      pending_completion_approval:
        tSafe(
          'pending_completion_approval_status',
          'Pending Approval'
        ),

      cancelled: tSafe(
        'cancelled_status',
        'Cancelled'
      ),
    };

    return (
      labelMap[status] ||
      status
    );
  };

  const handleCloseCreateBooking = () => {
    handleCreateSchedule(false);
    resetFormData();
  };

  const resetFormData = () => {};

  /* ------------------------------------------------------------------------ */
  /* Render helpers                                                           */
  /* ------------------------------------------------------------------------ */

  const renderPendingApprovalItem = ({
    item,
  }) => (
    <PendingApprovalListItem
      item={item}
      hostId={currentUserId}
    />
  );

  const renderUpcomingScheduleItem = ({
    item,
  }) => (
    <View style={styles.upcomingItem}>
      <UpcomingScheduleListItem
        item={item}
        currency={currency}
      />
    </View>
  );

  /* ------------------------------------------------------------------------ */
  /* Properties                                                               */
  /* ------------------------------------------------------------------------ */

  const renderPropertySection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <AppText
            variant="title"
            style={styles.sectionTitle}
          >
            {tSafe(
              'properties',
              'Properties'
            )}
          </AppText>

          {properties.length > 0 && (
            <View
              style={
                styles.countBadge
              }
            >
              <AppText
                variant="caption"
                style={
                  styles.countBadgeText
                }
              >
                {properties.length}
              </AppText>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={
            styles.viewAllButton
          }
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate(
              ROUTES.host_my_apartment
            )
          }
        >
          <AppText
            variant="label"
            color={
              theme.brand.primary
            }
            style={
              styles.viewAllText
            }
          >
            {tSafe(
              'view_all',
              'View all'
            )}
          </AppText>

          <MaterialCommunityIcons
            name="chevron-right"
            size={18}
            color={
              theme.brand.primary
            }
          />
        </TouchableOpacity>
      </View>

      <PropertyCardList
        properties={
          properties.slice(0, 3)
        }
        handleHostPress={
          handleHostPress
        }
        currentUserId={
          currentUserId
        }
        navigation={navigation}
        showAddButton={
          properties.length === 0
        }
      />
    </View>
  );

  /* ------------------------------------------------------------------------ */
  /* New cleaning requests                                                    */
  /* ------------------------------------------------------------------------ */

  const renderNewCleaningRequests = () => {
    if (
      cleaningRequests.length === 0
    ) {
      return null;
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View
            style={
              styles.sectionTitleRow
            }
          >
            <AppText
              variant="title"
              style={
                styles.sectionTitle
              }
            >
              {tSafe(
                'new_cleaning_requests',
                'New Cleaning Requests'
              )}
            </AppText>

            <View
              style={
                styles.countBadge
              }
            >
              <AppText
                variant="caption"
                style={
                  styles.countBadgeText
                }
              >
                {
                  cleaningRequests.length
                }
              </AppText>
            </View>
          </View>
        </View>

        <AppText
          variant="caption"
          style={
            styles.sectionSubtitle
          }
        >
          {tSafe(
            'track_cleaning_dashboard',
            "Track all cleaning requests you've sent to cleaners."
          )}
        </AppText>

        <View
          style={
            styles.sectionCard
          }
        >
          <NewlyPublishedSchedule
            schedule={
              cleaningRequests
            }
            pendingCount={
              pendingCount
            }
          />
        </View>
      </View>
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Pending approvals                                                        */
  /* ------------------------------------------------------------------------ */

  const renderPendingApprovals = () => {
    if (
      pendingCompletionApproval.length ===
      0
    ) {
      return null;
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View
            style={
              styles.sectionTitleRow
            }
          >
            <AppText
              variant="title"
              style={
                styles.sectionTitle
              }
            >
              {tSafe(
                'review_completed_cleaning_dashboard',
                'Review Completed Cleaning'
              )}
            </AppText>

            <View
              style={
                styles.countBadge
              }
            >
              <AppText
                variant="caption"
                style={
                  styles.countBadgeText
                }
              >
                {
                  pendingCompletionApproval.length
                }
              </AppText>
            </View>
          </View>
        </View>

        <AppText
          variant="caption"
          style={
            styles.sectionSubtitle
          }
        >
          {tSafe(
            'cleaning_approval_notification',
            "The cleaner has finished the job. Approve to release payment or reject if you're not satisfied."
          )}
        </AppText>

        <View
          style={
            styles.sectionCard
          }
        >
          <FlatList
            data={
              pendingCompletionApproval
            }
            renderItem={
              renderPendingApprovalItem
            }
            keyExtractor={(item) =>
              item._id
            }
            scrollEnabled={false}
          />
        </View>
      </View>
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Upcoming schedules                                                       */
  /* ------------------------------------------------------------------------ */

  const renderUpcomingSchedules = () => {
    if (
      upcomingSchedules.length ===
      0
    ) {
      return null;
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View
            style={
              styles.sectionTitleRow
            }
          >
            <AppText
              variant="title"
              style={
                styles.sectionTitle
              }
            >
              {tSafe(
                'upcoming_schedules',
                'Upcoming Schedules'
              )}
            </AppText>

            <View
              style={
                styles.countBadge
              }
            >
              <AppText
                variant="caption"
                style={
                  styles.countBadgeText
                }
              >
                {
                  upcomingSchedules.length
                }
              </AppText>
            </View>
          </View>

          <TouchableOpacity
            style={
              styles.viewAllButton
            }
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate(
                ROUTES.host_bookings
              )
            }
          >
            <AppText
              variant="label"
              color={
                theme.brand.primary
              }
              style={
                styles.viewAllText
              }
            >
              {tSafe(
                'view_all',
                'View all'
              )}
            </AppText>

            <MaterialCommunityIcons
              name="chevron-right"
              size={18}
              color={
                theme.brand.primary
              }
            />
          </TouchableOpacity>
        </View>

        <View
          style={
            styles.sectionCard
          }
        >
          <FlatList
            data={
              upcomingSchedules.slice(
                0,
                2
              )
            }
            renderItem={
              renderUpcomingScheduleItem
            }
            keyExtractor={(item) =>
              item._id
            }
            scrollEnabled={false}
            ListEmptyComponent={
              <View
                style={
                  styles.emptySection
                }
              >
                <MaterialCommunityIcons
                  name="calendar-blank"
                  size={48}
                  color={
                    theme.text.disabled
                  }
                />

                <AppText
                  variant="body"
                  color={
                    theme.text.muted
                  }
                  style={
                    styles.emptySectionText
                  }
                >
                  {tSafe(
                    'no_upcoming_schedule',
                    'No upcoming schedules'
                  )}
                </AppText>
              </View>
            }
          />
        </View>
      </View>
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                  */
  /* ------------------------------------------------------------------------ */

  if (loading) {
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
          color={
            theme.text.secondary
          }
          style={
            styles.loadingText
          }
        >
          {tSafe(
            'loading_dashboard',
            'Loading dashboard...'
          )}
        </AppText>
      </View>
    );
  }

  const completedCount =
    schedules.filter(
      (s) =>
        s.status ===
        'completed'
    ).length;

  /* ------------------------------------------------------------------------ */
  /* Main dashboard                                                           */
  /* ------------------------------------------------------------------------ */

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top']}
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

      {/* ---------------------------------- header ---------------------------- */}

      <View
        style={styles.header}
      >
        <View
          style={styles.headerLeft}
        >
          <View
            style={
              styles.avatarContainer
            }
          >
            {currentUser?.avatar ? (
              <Image
                source={{
                  uri: currentUser.avatar,
                }}
                style={
                  styles.avatar
                }
              />
            ) : (
              <View
                style={[
                  styles.avatar,
                  styles.avatarPlaceholder,
                ]}
              >
                <AppText
                  variant="subtitle"
                  color={
                    theme.text.inverse
                  }
                  style={
                    styles.avatarText
                  }
                >
                  {currentUser?.firstname?.charAt(
                    0
                  ) || 'U'}
                </AppText>
              </View>
            )}
          </View>

          <View>
            <AppText
              variant="caption"
              style={
                styles.welcomeText
              }
            >
              {tSafe(
                'welcome_back',
                'Welcome back'
              )}
            </AppText>

            <AppText
              variant="title"
              style={
                styles.userName
              }
            >
              {currentUser?.firstname ||
                'User'}
            </AppText>
          </View>
        </View>

        <TouchableOpacity
          style={
            styles.notificationWrapper
          }
          onPress={() =>
            navigation.navigate(
              ROUTES.notification
            )
          }
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="bell-outline"
            size={22}
            color={
              theme.icon.default
            }
          />

          {notificationUnreadCount >
            0 && (
            <View
              style={
                styles.badge
              }
            >
              <AppText
                variant="caption"
                color={
                  theme.text.inverse
                }
                style={
                  styles.badgeText
                }
              >
                {notificationUnreadCount >
                9
                  ? '9+'
                  : notificationUnreadCount}
              </AppText>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        style={[
          styles.scrollView,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY:
                  slideAnim,
              },
            ],
          },
        ]}
        contentContainerStyle={
          styles.scrollContent
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
              handleRefresh
            }
            tintColor={
              theme.brand.primary
            }
            colors={[
              theme.brand.primary,
            ]}
          />
        }
      >
        {/* --------------------------------- hero card ----------------------- */}

        <View
          style={
            styles.heroCard
          }
        >
          <View
            style={[
              styles.heroOrb,
              styles.heroOrbOne,
            ]}
          />

          <View
            style={[
              styles.heroOrb,
              styles.heroOrbTwo,
            ]}
          />

          <View
            style={
              styles.heroTopRow
            }
          >
            <View
              style={
                styles.heroLabelRow
              }
            >
              <MaterialCommunityIcons
                name="wallet-outline"
                size={14}
                color={
                  theme.hero
                    .mutedForeground
                }
              />

              <AppText
                variant="label"
                color={
                  theme.hero
                    .mutedForeground
                }
                style={
                  styles.heroLabel
                }
              >
                {tSafe(
                  'total_spent',
                  'Total Spent'
                )}
              </AppText>
            </View>

            <View
              style={
                styles.heroTrendBadge
              }
            >
              <MaterialCommunityIcons
                name="chart-line"
                size={14}
                color={
                  theme.hero
                    .badgeIcon
                }
              />
            </View>
          </View>

          <AppText
            variant="display"
            color={
              theme.hero
                .foreground
            }
            style={
              styles.heroAmount
            }
          >
            {geolocationData
              ?.currency
              ?.symbol || '$'}
            {totalSpentLabel?.toFixed?.(
              2
            ) ?? '0.00'}
          </AppText>

          <View
            style={
              styles.heroFooterRow
            }
          >
            <AppText
              variant="caption"
              color={
                theme.hero
                  .mutedForeground
              }
              style={
                styles.heroSubtitle
              }
            >
              {`${completedCount} ${tSafe(
                'completed_schedules',
                'completed schedules'
              )}`}
            </AppText>

            <TouchableOpacity
              style={
                styles.heroCta
              }
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate(
                  ROUTES.host_bookings
                )
              }
            >
              <AppText
                variant="label"
                color={
                  theme.hero
                    .badgeIcon
                }
                style={
                  styles.heroCtaText
                }
              >
                {tSafe(
                  'bookings',
                  'Bookings'
                )}
              </AppText>

              <MaterialCommunityIcons
                name="arrow-right"
                size={14}
                color={
                  theme.hero
                    .badgeIcon
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* --------------------------------- stat pills ---------------------- */}

        <View
          style={
            styles.statsRow
          }
        >
          <StatPill
            icon="calendar-check-outline"
            value={
              schedules.length
            }
            label={tSafe(
              'bookings',
              'Bookings'
            )}
            color={
              theme.brand.primary
            }
            theme={theme}
          />

          <StatPill
            icon="home-outline"
            value={
              properties.length
            }
            label={tSafe(
              'properties',
              'Properties'
            )}
            color={
              theme.status.info
            }
            theme={theme}
          />

          <StatPill
            icon="clock-outline"
            value={
              pendingCount
            }
            label={tSafe(
              'pending',
              'Pending'
            )}
            color={
              theme.status.warning
            }
            theme={theme}
          />
        </View>

        {/* --------------------------------- sections ------------------------ */}

        {renderNewCleaningRequests()}

        {renderPendingApprovals()}

        {renderUpcomingSchedules()}

        {renderPropertySection()}
      </Animated.ScrollView>

      {/* --------------------------------- floating CTA ---------------------- */}

      {properties.length > 0 && (
        <TouchableOpacity
          style={
            styles.floatingButton
          }
          onPress={() =>
            handleCreateSchedule(
              true
            )
          }
          activeOpacity={0.9}
        >
          <MaterialCommunityIcons
            name="plus"
            size={22}
            color={
              theme.button
                .primaryText
            }
          />

          <AppText
            variant="label"
            color={
              theme.button
                .primaryText
            }
            style={
              styles.floatingButtonText
            }
          >
            {tSafe(
              'new_schedule',
              'New Schedule'
            )}
          </AppText>
        </TouchableOpacity>
      )}

      <Modal
        visible={
          modalEVisible
        }
        animationType="slide"
      >
        <EditSchedule
          close_modal={
            handleCloseCreateBooking
          }
          mode="create"
        />
      </Modal>

      <Modal
        visible={
          modalVisible
        }
        animationType="slide"
      >
        <NewBooking
          close_modal={
            handleCloseCreateBooking
          }
          mode="create"
        />
      </Modal>
    </SafeAreaView>
  );
};

/* ---------------------------------- styles --------------------------------- */

const createStyles = (theme) =>
  StyleSheet.create({
    /* ---------------------------------------------------------------------- */
    /* Container                                                              */
    /* ---------------------------------------------------------------------- */

    container: {
      flex: 1,
      backgroundColor:
        theme.background.default,
    },

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      paddingTop: S.sm,
      paddingBottom: 120,
    },

    /* ---------------------------------------------------------------------- */
    /* Loading                                                                */
    /* ---------------------------------------------------------------------- */

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:
        theme.background.default,
    },

    loadingText: {
      marginTop: 14,
    },

    /* ---------------------------------------------------------------------- */
    /* Header                                                                 */
    /* ---------------------------------------------------------------------- */

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',

      paddingHorizontal: S.xl,
      paddingBottom: S.md,
      paddingTop: S.sm,

      backgroundColor:
        theme.background.default,
    },

    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    avatarContainer: {
      marginRight: S.md,
    },

    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
    },

    avatarPlaceholder: {
      backgroundColor:
        theme.brand.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },

    avatarText: {
      fontSize: 17,
      fontWeight: '700',
    },

    welcomeText: {
      fontSize: 12,
    },

    userName: {
      fontSize: 17,
      letterSpacing: -0.3,
      marginTop: 1,
    },

    notificationWrapper: {
      position: 'relative',

      width: 40,
      height: 40,
      borderRadius: 14,

      backgroundColor:
        theme.surface.elevated,

      justifyContent: 'center',
      alignItems: 'center',

      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    badge: {
      position: 'absolute',

      top: -4,
      right: -4,

      backgroundColor:
        theme.status.error,

      borderRadius: 10,

      minWidth: 18,
      height: 18,

      paddingHorizontal: 4,

      justifyContent: 'center',
      alignItems: 'center',

      borderWidth: 2,
      borderColor:
        theme.background.default,
    },

    badgeText: {
      fontSize: 10,
      fontWeight: '700',
      textAlign: 'center',
    },

    /* ---------------------------------------------------------------------- */
    /* Hero                                                                   */
    /* ---------------------------------------------------------------------- */

    heroCard: {
      marginHorizontal: S.xl,
      marginTop: S.sm,

      borderRadius: R.xl,
      padding: 22,

      backgroundColor:
        theme.hero.background,

      overflow: 'hidden',

      shadowColor:
        theme.hero.background,

      shadowOffset: {
        width: 0,
        height: 12,
      },

      shadowOpacity: 0.28,
      shadowRadius: 20,

      elevation: 8,
    },

    heroOrb: {
      position: 'absolute',

      borderRadius: R.pill,

      backgroundColor:
        theme.hero.orb,
    },

    heroOrbOne: {
      width: 190,
      height: 190,
      top: -100,
      right: -55,
    },

    heroOrbTwo: {
      width: 130,
      height: 130,
      bottom: -80,
      left: -35,

      backgroundColor:
        theme.hero.orbSecondary,
    },

    heroTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    heroLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    heroLabel: {
      letterSpacing: 0.2,
    },

    heroTrendBadge: {
      width: 30,
      height: 30,

      borderRadius: R.pill,

      backgroundColor:
        theme.hero
          .badgeBackground,

      justifyContent: 'center',
      alignItems: 'center',
    },

    heroAmount: {
      letterSpacing: -1,
      marginTop: 10,
    },

    heroFooterRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',

      marginTop: 16,

      gap: 10,
    },

    heroSubtitle: {
      flex: 1,
    },

    heroCta: {
      flexDirection: 'row',
      alignItems: 'center',

      gap: 4,

      backgroundColor:
        theme.hero
          .badgeBackground,

      paddingHorizontal: 12,
      paddingVertical: 7,

      borderRadius: R.pill,
    },

    heroCtaText: {
      fontSize: 12,
      fontWeight: '700',
    },

    /* ---------------------------------------------------------------------- */
    /* Stats                                                                  */
    /* ---------------------------------------------------------------------- */

    statsRow: {
      flexDirection: 'row',

      paddingHorizontal: S.xl,

      marginTop: S.xl,

      gap: S.md,
    },

    statPill: {
      flex: 1,

      backgroundColor:
        theme.surface.elevated,

      borderRadius: R.md,

      paddingVertical: 16,
      paddingHorizontal: 10,

      alignItems: 'center',

      borderWidth: 1,
      borderColor:
        theme.border.default,

      shadowColor:
        theme.shadow?.color ||
        '#000000',

      shadowOffset: {
        width: 0,
        height: 6,
      },

      shadowOpacity:
        theme.shadow?.opacity ||
        0.08,

      shadowRadius: 14,

      elevation: 3,
    },

    statPillIcon: {
      width: 38,
      height: 38,

      borderRadius: 13,

      justifyContent: 'center',
      alignItems: 'center',

      marginBottom: 10,
    },

    statPillValue: {
      fontSize: 20,
      letterSpacing: -0.4,
      textAlign: 'center',
    },

    statPillLabel: {
      fontSize: 10,

      marginTop: 3,

      letterSpacing: 0.6,

      textTransform: 'uppercase',

      textAlign: 'center',
    },

    /* ---------------------------------------------------------------------- */
    /* Sections                                                               */
    /* ---------------------------------------------------------------------- */

    section: {
      marginTop: S.xxl,
      paddingHorizontal: S.xl,
    },

    sectionHeader: {
      flexDirection: 'row',

      justifyContent:
        'space-between',

      alignItems: 'center',

      marginBottom: S.sm,
    },

    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',

      gap: 8,
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: -0.25,
    },

    countBadge: {
      minWidth: 22,

      paddingHorizontal: 8,
      paddingVertical: 2,

      borderRadius: R.pill,

      backgroundColor:
        theme.brand.primaryLight,

      alignItems: 'center',
      justifyContent: 'center',
    },

    countBadgeText: {
      fontSize: 12,
      fontWeight: '700',

      color:
        theme.brand.primary,

      textAlign: 'center',
    },

    sectionSubtitle: {
      fontSize: 13.5,

      lineHeight: 19,

      marginBottom: S.lg,

      fontWeight: '500',
    },

    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',

      gap: 2,
    },

    viewAllText: {
      fontSize: 13,
      fontWeight: '600',
    },

    sectionCard: {
      backgroundColor:
        theme.card.background,

      borderRadius: R.lg,

      padding: S.lg,

      borderWidth: 1,
      borderColor:
        theme.card.border,

      shadowColor:
        theme.shadow?.color ||
        '#000000',

      shadowOffset: {
        width: 0,
        height: 6,
      },

      shadowOpacity:
        theme.shadow?.opacity ||
        0.08,

      shadowRadius: 14,

      elevation: 3,
    },

    upcomingItem: {
      marginBottom: 12,
    },

    /* ---------------------------------------------------------------------- */
    /* Empty state                                                            */
    /* ---------------------------------------------------------------------- */

    emptySection: {
      alignItems: 'center',
      justifyContent: 'center',

      paddingVertical: 32,
    },

    emptySectionText: {
      marginTop: 12,
    },

    /* ---------------------------------------------------------------------- */
    /* Floating CTA                                                           */
    /* ---------------------------------------------------------------------- */

    floatingButton: {
      position: 'absolute',

      bottom: 26,
      right: 20,

      backgroundColor:
        theme.button
          .primaryBackground,

      flexDirection: 'row',
      alignItems: 'center',

      paddingHorizontal: 20,
      paddingVertical: 14,

      borderRadius: R.pill,

      shadowColor:
        theme.button
          .primaryBackground,

      shadowOffset: {
        width: 0,
        height: 10,
      },

      shadowOpacity: 0.35,
      shadowRadius: 16,

      elevation: 6,
    },

    floatingButtonText: {
      fontSize: 14,
      fontWeight: '700',

      marginLeft: 8,

      letterSpacing: 0.2,
    },
  });

export default Dashboard;


// import React, { useContext, useRef, useEffect, useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Modal,
//   Image,
//   RefreshControl,
//   FlatList,
//   StatusBar,
//   Animated,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';
// import userService from '../../services/connection/userService';
// import { AuthContext } from '../../context/AuthContext';
// import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
// import moment from 'moment';
// import { useTranslation } from 'react-i18next';
// import { tSafe } from '../../utils/tSafe';

// // Components
// import NewlyPublishedSchedule from '../../components/host/NewlyPublishedSchedule';
// import PendingApprovalListItem from '../../components/host/PendingApprovalListItem';
// import UpcomingScheduleListItem from '../../components/shared/UpcomingScheduleListItem';
// import PropertyCardList from '../../components/host/PropertyCardList';
// import { useBookingContext } from '../../context/BookingContext';
// import NewBooking from './NewBooking';
// import EditSchedule from './EditSchedule';

// /* ---------------------------------- tokens --------------------------------- */

// const BG = '#F6F7FB';
// const SURFACE = '#FFFFFF';
// const BORDER = '#EEF0F5';
// const TEXT = '#0F172A';
// const MUTED = '#7C8798';

// const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };
// const R = { sm: 12, md: 18, lg: 24, xl: 28, pill: 999 };

// const cardShadow = {
//   shadowColor: '#0F172A',
//   shadowOffset: { width: 0, height: 6 },
//   shadowOpacity: 0.06,
//   shadowRadius: 14,
//   elevation: 3,
// };

// /* ------------------------------ small components --------------------------- */

// const StatPill = ({ icon, value, label, color }) => (
//   <View style={styles.statPill}>
//     <View style={[styles.statPillIcon, { backgroundColor: color + '14' }]}>
//       <MaterialCommunityIcons name={icon} size={18} color={color} />
//     </View>
//     <Text style={styles.statPillValue} numberOfLines={1}>
//       {value}
//     </Text>
//     <Text style={styles.statPillLabel} numberOfLines={1}>
//       {label}
//     </Text>
//   </View>
// );

// /* --------------------------------- dashboard ------------------------------- */

// const Dashboard = () => {
//   const { t } = useTranslation();
//   const scrollRef = useRef(null);
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { currentUser, currentUserId, currency, geolocationData, notificationUnreadCount } =
//     useContext(AuthContext);
//   const {
//     handleEdit,
//     modalVisible,
//     modalEVisible,
//     handleCreateSchedule,
//   } = useBookingContext();

//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [schedules, setSchedules] = useState([]);
//   const [pendingPayment, setFilteredPendingPayment] = useState([]);
//   const [pendingCompletionApproval, setFilteredPendingCompletionApprovalSchedules] = useState([]);
//   const [upcomingSchedules, setUpcomingSchedules] = useState([]);
//   const [cleaningRequests, setCleaningRequests] = useState([]);
//   const [properties, setProperties] = useState([]);
//   const [clientSecret, setClientSecret] = useState('');
//   const [pendingCount, setPendingCount] = useState(0);
//   const [selectedFilter, setSelectedFilter] = useState('upcoming');

//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(20)).current;

//   const filters = [
//     { id: 'upcoming', label: tSafe('upcoming', 'Upcoming') },
//     { id: 'in_progress', label: tSafe('in_progress', 'In Progress') },
//     { id: 'completed', label: tSafe('completed', 'Completed') },
//   ];

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     try {
//       await Promise.all([fetchSchedules(), fetchRequests(), fetchProperties()]);
//     } catch (error) {
//       console.error('Error refreshing data:', error);
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         await Promise.all([
//           fetchSchedules(),
//           fetchRequests(),
//           fetchProperties(),
//           fetchClientSecret(),
//         ]);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       fetchRequests();
//     }, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, { toValue: 1, duration: 520, useNativeDriver: true }),
//       Animated.timing(slideAnim, { toValue: 0, duration: 520, useNativeDriver: true }),
//     ]).start();
//   }, []);

//   const fetchClientSecret = async () => {
//     try {
//       const response = await userService.getClientSecret();
//       setClientSecret(response.data.client_secret);
//     } catch (error) {
//       console.error('Error fetching client secret:', error);
//     }
//   };

//   const fetchRequests = async () => {
//     const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
//     try {
//       const response = await userService.getHostCleaningRequest(currentUserId, currentTime);
//       const res = response.data;
//       setPendingCount(res.length);
//       const pendingPaymentRequests = res.filter((req) => req.status === 'pending_payment');
//       setCleaningRequests(res);
//       setFilteredPendingPayment(pendingPaymentRequests);
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   const fetchProperties = async () => {
//     try {
//       const response = await userService.getApartment(currentUserId);
//       setProperties(response.data);
//     } catch (error) {
//       console.error('Error fetching properties:', error);
//     }
//   };

//   const fetchSchedules = async () => {
//     try {
//       const response = await userService.getSchedulesByHostId(currentUserId);
//       const res = response.data;
//       setSchedules(res);

//       const pendingCompletionApprovalSchedules = res
//         .filter(
//           (schedule) =>
//             (schedule.status === 'completed' ||
//               schedule.status === 'in_progress' ||
//               schedule.status === 'pending_review') &&
//             Array.isArray(schedule.assignedTo) &&
//             schedule.assignedTo.some((cleaner) => cleaner.status === 'pending_review')
//         )
//         .map((schedule) => ({
//           ...schedule,
//           assignedTo: schedule.assignedTo.filter(
//             (cleaner) => cleaner.status === 'pending_review'
//           ),
//         }));

//       setFilteredPendingCompletionApprovalSchedules(pendingCompletionApprovalSchedules);

//       const getScheduleDateTime = (schedule) => {
//         const date = schedule.cleaning_date || schedule.schedule?.cleaning_date;
//         const time = schedule.cleaning_time || schedule.schedule?.cleaning_time || '00:00:00';
//         return new Date(`${date}T${time}`);
//       };

//       const upcomingSchedulesFiltered = res
//         .filter((schedule) => {
//           const isValidStatus =
//             schedule.status === 'pending_payment' || schedule.status === 'upcoming';
//           return isValidStatus;
//         })
//         .sort((a, b) => getScheduleDateTime(a) - getScheduleDateTime(b));

//       setUpcomingSchedules(upcomingSchedulesFiltered);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const handleHostPress = () => {
//     navigation.navigate(ROUTES.host_add_apt);
//   };

//   const calculateTotalSpent = () => {
//     return schedules
//       .filter((s) => s.status === 'completed')
//       .reduce(
//         (sum, schedule) =>
//           sum +
//           (schedule.overall_checklist?.totalFee ||
//             schedule.schedule?.total_cleaning_fee ||
//             0),
//         0
//       );
//   };

//   const formatAmount = (value) => {
//     if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
//     if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
//     return value.toString();
//   };

//   const totalSpent = calculateTotalSpent();
//   const totalSpentLabel = totalSpent;

//   const formatCurrency = (amount) => {
//     return `${geolocationData?.currency?.symbol || '$'}${amount?.toFixed(2) || '0.00'}`;
//   };

//   const getStatusColor = (status) => {
//     const colorMap = {
//       completed: '#34C759',
//       in_progress: COLORS.primary,
//       pending_payment: '#FF9500',
//       upcoming: '#5AC8FA',
//       pending_acceptance: '#FF9500',
//       pending_completion_approval: '#FF9500',
//       cancelled: '#FF3B30',
//     };
//     return colorMap[status] || '#8E8E93';
//   };

//   const getStatusLabel = (status) => {
//     const labelMap = {
//       completed: tSafe('completed_status', 'Completed'),
//       in_progress: tSafe('in_progress_status', 'In Progress'),
//       pending_payment: tSafe('pending_payment_status', 'Pending Payment'),
//       upcoming: tSafe('upcoming_status', 'Upcoming'),
//       pending_acceptance: tSafe('pending_acceptance_status', 'Pending'),
//       pending_completion_approval: tSafe(
//         'pending_completion_approval_status',
//         'Pending Approval'
//       ),
//       cancelled: tSafe('cancelled_status', 'Cancelled'),
//     };
//     return labelMap[status] || status;
//   };

//   const handleCloseCreateBooking = () => {
//     handleCreateSchedule(false);
//     resetFormData();
//   };

//   const resetFormData = () => {};

//   /* --------------------------------- render helpers ------------------------ */

//   const renderPendingApprovalItem = ({ item }) => (
//     <PendingApprovalListItem item={item} hostId={currentUserId} />
//   );

//   const renderUpcomingScheduleItem = ({ item }) => (
//     <View style={{ marginBottom: 12 }}>
//       <UpcomingScheduleListItem item={item} currency={currency} />
//     </View>
//   );

//   const renderPropertySection = () => (
//     <View style={styles.section}>
//       <View style={styles.sectionHeader}>
//         <View style={styles.sectionTitleRow}>
//           <Text style={styles.sectionTitle}>
//             {tSafe('properties', 'Properties')}
//           </Text>
//           {properties.length > 0 && (
//             <View style={styles.countBadge}>
//               <Text style={styles.countBadgeText}>{properties.length}</Text>
//             </View>
//           )}
//         </View>
//         <TouchableOpacity
//           style={styles.viewAllButton}
//           activeOpacity={0.7}
//           onPress={() => navigation.navigate(ROUTES.host_apartments)}
//         >
//           <Text style={styles.viewAllText}>{tSafe('view_all', 'View all')}</Text>
//           <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.primary} />
//         </TouchableOpacity>
//       </View>

//       <PropertyCardList
//         properties={properties.slice(0, 3)}
//         handleHostPress={handleHostPress}
//         currentUserId={currentUserId}
//         navigation={navigation}
//         showAddButton={properties.length === 0}
//       />
//     </View>
//   );

//   const renderNewCleaningRequests = () => {
//     if (cleaningRequests.length === 0) return null;

//     return (
//       <View style={styles.section}>
//         <View style={styles.sectionHeader}>
//           <View style={styles.sectionTitleRow}>
//             <Text style={styles.sectionTitle}>
//               {tSafe('new_cleaning_requests', 'New Cleaning Requests')}
//             </Text>
//             <View style={styles.countBadge}>
//               <Text style={styles.countBadgeText}>{cleaningRequests.length}</Text>
//             </View>
//           </View>
//         </View>
//         <Text style={styles.sectionSubtitle}>
//           {tSafe(
//             'track_cleaning_dashboard',
//             "Track all cleaning requests you've sent to cleaners."
//           )}
//         </Text>
//         <View style={styles.sectionCard}>
//           <NewlyPublishedSchedule
//             schedule={cleaningRequests}
//             pendingCount={pendingCount}
//           />
//         </View>
//       </View>
//     );
//   };

//   const renderPendingApprovals = () => {
//     if (pendingCompletionApproval.length === 0) return null;

//     return (
//       <View style={styles.section}>
//         <View style={styles.sectionHeader}>
//           <View style={styles.sectionTitleRow}>
//             <Text style={styles.sectionTitle}>
//               {tSafe('review_completed_cleaning_dashboard', 'Review Completed Cleaning')}
//             </Text>
//             <View style={styles.countBadge}>
//               <Text style={styles.countBadgeText}>
//                 {pendingCompletionApproval.length}
//               </Text>
//             </View>
//           </View>
//         </View>
//         <Text style={styles.sectionSubtitle}>
//           {tSafe(
//             'cleaning_approval_notification',
//             "The cleaner has finished the job. Approve to release payment or reject if you're not satisfied."
//           )}
//         </Text>
//         <View style={styles.sectionCard}>
//           <FlatList
//             data={pendingCompletionApproval}
//             renderItem={renderPendingApprovalItem}
//             keyExtractor={(item) => item._id}
//             scrollEnabled={false}
//           />
//         </View>
//       </View>
//     );
//   };

//   const renderUpcomingSchedules = () => {
//     if (upcomingSchedules.length === 0) return null;

//     return (
//       <View style={styles.section}>
//         <View style={styles.sectionHeader}>
//           <View style={styles.sectionTitleRow}>
//             <Text style={styles.sectionTitle}>
//               {tSafe('upcoming_schedules', 'Upcoming Schedules')}
//             </Text>
//             <View style={styles.countBadge}>
//               <Text style={styles.countBadgeText}>{upcomingSchedules.length}</Text>
//             </View>
//           </View>
//           <TouchableOpacity
//             style={styles.viewAllButton}
//             activeOpacity={0.7}
//             onPress={() => navigation.navigate(ROUTES.host_bookings)}
//           >
//             <Text style={styles.viewAllText}>{tSafe('view_all', 'View all')}</Text>
//             <MaterialCommunityIcons
//               name="chevron-right"
//               size={18}
//               color={COLORS.primary}
//             />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.sectionCard}>
//           <FlatList
//             data={upcomingSchedules.slice(0, 2)}
//             renderItem={renderUpcomingScheduleItem}
//             keyExtractor={(item) => item._id}
//             scrollEnabled={false}
//             ListEmptyComponent={
//               <View style={styles.emptySection}>
//                 <MaterialCommunityIcons
//                   name="calendar-blank"
//                   size={48}
//                   color="#CCCCCC"
//                 />
//                 <Text style={styles.emptySectionText}>
//                   {tSafe('no_upcoming_schedule', 'No upcoming schedules')}
//                 </Text>
//               </View>
//             }
//           />
//         </View>
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>
//           {tSafe('loading_dashboard', 'Loading dashboard...')}
//         </Text>
//       </View>
//     );
//   }

//   const completedCount = schedules.filter((s) => s.status === 'completed').length;

//   return (
//     <SafeAreaView style={styles.container} edges={['top']}>
//       <StatusBar barStyle="dark-content" backgroundColor={BG} />

//       {/* ---------------------------------- header ---------------------------- */}
//       <View style={styles.header}>
//         <View style={styles.headerLeft}>
//           <View style={styles.avatarContainer}>
//             {currentUser?.avatar ? (
//               <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
//             ) : (
//               <View style={[styles.avatar, styles.avatarPlaceholder]}>
//                 <Text style={styles.avatarText}>
//                   {currentUser?.firstname?.charAt(0) || 'U'}
//                 </Text>
//               </View>
//             )}
//           </View>
//           <View>
//             <Text style={styles.welcomeText}>
//               {tSafe('welcome_back', 'Welcome back')}
//             </Text>
//             <Text style={styles.userName}>{currentUser?.firstname || 'User'}</Text>
//           </View>
//         </View>

//         <TouchableOpacity
//           style={styles.notificationWrapper}
//           onPress={() => navigation.navigate(ROUTES.notification)}
//           activeOpacity={0.8}
//         >
//           <MaterialCommunityIcons name="bell-outline" size={22} color={TEXT} />
//           {notificationUnreadCount > 0 && (
//             <View style={styles.badge}>
//               <Text style={styles.badgeText}>
//                 {notificationUnreadCount > 9 ? '9+' : notificationUnreadCount}
//               </Text>
//             </View>
//           )}
//         </TouchableOpacity>
//       </View>

//       <Animated.ScrollView
//         ref={scrollRef}
//         style={[
//           styles.scrollView,
//           { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
//         ]}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={handleRefresh}
//             tintColor={COLORS.primary}
//             colors={[COLORS.primary]}
//           />
//         }
//       >
//         {/* --------------------------------- hero card ----------------------- */}
//         <View style={styles.heroCard}>
//           <View style={[styles.heroOrb, styles.heroOrbOne]} />
//           <View style={[styles.heroOrb, styles.heroOrbTwo]} />

//           <View style={styles.heroTopRow}>
//             <View style={styles.heroLabelRow}>
//               <MaterialCommunityIcons
//                 name="wallet-outline"
//                 size={14}
//                 color="rgba(255,255,255,0.85)"
//               />
//               <Text style={styles.heroLabel}>
//                 {tSafe('total_spent', 'Total Spent')}
//               </Text>
//             </View>
//             <View style={styles.heroTrendBadge}>
//               <MaterialCommunityIcons
//                 name="chart-line"
//                 size={14}
//                 color={COLORS.primary}
//               />
//             </View>
//           </View>

//           <Text style={styles.heroAmount}>
//             {geolocationData?.currency?.symbol || '$'}
//             {totalSpentLabel?.toFixed?.(2) ?? '0.00'}
//           </Text>

//           <View style={styles.heroFooterRow}>
//             <Text style={styles.heroSubtitle}>
//               {`${completedCount} ${tSafe(
//                 'completed_schedules',
//                 'completed schedules'
//               )}`}
//             </Text>
//             <TouchableOpacity
//               style={styles.heroCta}
//               activeOpacity={0.85}
//               onPress={() => navigation.navigate(ROUTES.host_bookings)}
//             >
//               <Text style={styles.heroCtaText}>{tSafe('bookings', 'Bookings')}</Text>
//               <MaterialCommunityIcons
//                 name="arrow-right"
//                 size={14}
//                 color={COLORS.primary}
//               />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* --------------------------------- stat pills ---------------------- */}
//         <View style={styles.statsRow}>
//           <StatPill
//             icon="calendar-check-outline"
//             value={schedules.length}
//             label={tSafe('bookings', 'Bookings')}
//             color={COLORS.primary}
//           />
//           <StatPill
//             icon="home-outline"
//             value={properties.length}
//             label={tSafe('properties', 'Properties')}
//             color="#0EA5E9"
//           />
//           <StatPill
//             icon="clock-outline"
//             value={pendingCount}
//             label={tSafe('pending', 'Pending')}
//             color="#F59E0B"
//           />
//         </View>

//         {/* --------------------------------- sections ------------------------ */}
//         {renderNewCleaningRequests()}
//         {renderPendingApprovals()}
//         {renderUpcomingSchedules()}
//         {renderPropertySection()}
//       </Animated.ScrollView>

//       {/* --------------------------------- floating CTA ---------------------- */}
//       {properties.length > 0 && (
//         <TouchableOpacity
//           style={styles.floatingButton}
//           onPress={() => handleCreateSchedule(true)}
//           activeOpacity={0.9}
//         >
//           <MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" />
//           <Text style={styles.floatingButtonText}>
//             {tSafe('new_schedule', 'New Schedule')}
//           </Text>
//         </TouchableOpacity>
//       )}

//       <Modal visible={modalEVisible} animationType="slide">
//         <EditSchedule close_modal={handleCloseCreateBooking} mode="create" />
//       </Modal>

//       <Modal visible={modalVisible} animationType="slide">
//         <NewBooking close_modal={handleCloseCreateBooking} mode="create" />
//       </Modal>
//     </SafeAreaView>
//   );
// };

// /* ---------------------------------- styles --------------------------------- */

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: BG },
//   scrollView: { flex: 1 },
//   scrollContent: { paddingTop: S.sm, paddingBottom: 120 },

//   /* loading */
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: BG,
//   },
//   loadingText: { marginTop: 14, fontSize: 15, color: MUTED, fontWeight: '500' },

//   /* header */
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: S.xl,
//     paddingBottom: S.md,
//     paddingTop: S.sm,
//     backgroundColor: BG,
//   },
//   headerLeft: { flexDirection: 'row', alignItems: 'center' },
//   avatarContainer: { marginRight: S.md },
//   avatar: { width: 42, height: 42, borderRadius: 21 },
//   avatarPlaceholder: {
//     backgroundColor: COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   avatarText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
//   welcomeText: { fontSize: 12, color: MUTED, fontWeight: '500' },
//   userName: {
//     fontSize: 17,
//     fontWeight: '700',
//     color: TEXT,
//     letterSpacing: -0.3,
//     marginTop: 1,
//   },

//   notificationWrapper: {
//     position: 'relative',
//     width: 40,
//     height: 40,
//     borderRadius: 14,
//     backgroundColor: SURFACE,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: BORDER,
//   },
//   badge: {
//     position: 'absolute',
//     top: -4,
//     right: -4,
//     backgroundColor: '#EF4444',
//     borderRadius: 10,
//     minWidth: 18,
//     height: 18,
//     paddingHorizontal: 4,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: BG,
//   },
//   badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },

//   /* hero */
//   heroCard: {
//     marginHorizontal: S.xl,
//     marginTop: S.sm,
//     borderRadius: R.xl,
//     padding: 22,
//     backgroundColor: COLORS.primary,
//     overflow: 'hidden',
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 12 },
//     shadowOpacity: 0.28,
//     shadowRadius: 20,
//     elevation: 8,
//   },
//   heroOrb: {
//     position: 'absolute',
//     borderRadius: R.pill,
//     backgroundColor: 'rgba(255,255,255,0.10)',
//   },
//   heroOrbOne: { width: 190, height: 190, top: -100, right: -55 },
//   heroOrbTwo: {
//     width: 130,
//     height: 130,
//     bottom: -80,
//     left: -35,
//     backgroundColor: 'rgba(255,255,255,0.07)',
//   },
//   heroTopRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   heroLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
//   heroLabel: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: 'rgba(255,255,255,0.85)',
//     letterSpacing: 0.2,
//   },
//   heroTrendBadge: {
//     width: 30,
//     height: 30,
//     borderRadius: R.pill,
//     backgroundColor: '#FFFFFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   heroAmount: {
//     fontSize: 38,
//     fontWeight: '800',
//     color: '#FFFFFF',
//     letterSpacing: -1,
//     marginTop: 10,
//   },
//   heroFooterRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 16,
//   },
//   heroSubtitle: {
//     fontSize: 13,
//     color: 'rgba(255,255,255,0.82)',
//     fontWeight: '500',
//     flex: 1,
//   },
//   heroCta: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     backgroundColor: '#FFFFFF',
//     paddingHorizontal: 12,
//     paddingVertical: 7,
//     borderRadius: R.pill,
//   },
//   heroCtaText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

//   /* stats */
//   statsRow: {
//     flexDirection: 'row',
//     paddingHorizontal: S.xl,
//     marginTop: S.xl,
//     gap: S.md,
//   },
//   statPill: {
//     flex: 1,
//     backgroundColor: SURFACE,
//     borderRadius: R.md,
//     paddingVertical: 16,
//     paddingHorizontal: 10,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: BORDER,
//     ...cardShadow,
//   },
//   statPillIcon: {
//     width: 38,
//     height: 38,
//     borderRadius: 13,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   statPillValue: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: TEXT,
//     letterSpacing: -0.4,
//   },
//   statPillLabel: {
//     fontSize: 10,
//     color: MUTED,
//     fontWeight: '700',
//     marginTop: 3,
//     letterSpacing: 0.6,
//     textTransform: 'uppercase',
//   },

//   /* sections */
//   section: { marginTop: S.xxl, paddingHorizontal: S.xl },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: S.sm,
//   },
//   sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   sectionTitle: {
//     fontSize: 17,
//     fontWeight: '700',
//     color: TEXT,
//     letterSpacing: -0.25,
//   },
//   countBadge: {
//     minWidth: 22,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: R.pill,
//     backgroundColor: COLORS.primary + '16',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   countBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
//   sectionSubtitle: {
//     fontSize: 13.5,
//     color: MUTED,
//     lineHeight: 19,
//     marginBottom: S.lg,
//     fontWeight: '500',
//   },
//   viewAllButton: { flexDirection: 'row', alignItems: 'center', gap: 2 },
//   viewAllText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },

//   sectionCard: {
//     backgroundColor: SURFACE,
//     borderRadius: R.lg,
//     padding: S.lg,
//     borderWidth: 1,
//     borderColor: BORDER,
//     ...cardShadow,
//   },

//   /* empty */
//   emptySection: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 32,
//   },
//   emptySectionText: { fontSize: 14, color: MUTED, marginTop: 12 },

//   /* floating CTA */
//   floatingButton: {
//     position: 'absolute',
//     bottom: 26,
//     right: 20,
//     backgroundColor: COLORS.primary,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 14,
//     borderRadius: R.pill,
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.35,
//     shadowRadius: 16,
//     elevation: 6,
//   },
//   floatingButtonText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '700',
//     marginLeft: 8,
//     letterSpacing: 0.2,
//   },
// });

// export default Dashboard;




// import React, { useContext, useRef, useEffect, useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Modal,
//   Image,
//   Button,
//   RefreshControl,
//   FlatList,
//   StatusBar,

// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';
// import userService from '../../services/connection/userService';
// import { AuthContext } from '../../context/AuthContext';
// import { useFocusEffect, useRoute } from '@react-navigation/native';
// import { useNavigation } from '@react-navigation/native';
// import { useCleanerSelection } from '../../context/CleanerSelectionContext';
// import moment from 'moment';
// import { useTranslation } from 'react-i18next';
// import { tSafe } from '../../utils/tSafe';

// // Components
// import NewlyPublishedSchedule from '../../components/host/NewlyPublishedSchedule';
// import EmptyApartmentPlaceholder from '../../components/shared/EmptyApartmentPlaceholder';
// import PendingApprovalListItem from '../../components/host/PendingApprovalListItem';
// import UpcomingScheduleListItem from '../../components/shared/UpcomingScheduleListItem';
// import PropertyCardList from '../../components/host/PropertyCardList';
// import { useBookingContext } from '../../context/BookingContext';
// import NewBooking from './NewBooking';
// import EditSchedule from './EditSchedule';




// const Dashboard = () => {
//   // const { selectedCleaners } = useCleanerSelection();

//   const { t } = useTranslation();
//   const scrollRef = useRef(null);
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { currentUser, currentUserId, currency, geolocationData, notificationUnreadCount } = useContext(AuthContext);
//   const { handleEdit, modalVisible, modalEVisible, openModal, setOpenModal,  handleCreateSchedule } = useBookingContext();

//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [schedules, setSchedules] = useState([]);
//   const [pendingPayment, setFilteredPendingPayment] = useState([]);
//   const [pendingCompletionApproval, setFilteredPendingCompletionApprovalSchedules] = useState([]);
//   const [upcomingSchedules, setUpcomingSchedules] = useState([]);
//   const [cleaningRequests, setCleaningRequests] = useState([]);
//   const [properties, setProperties] = useState([]);
//   const [clientSecret, setClientSecret] = useState('');
//   const [pendingCount, setPendingCount] = useState(0);

//   // Selected filter for upcoming schedules
//   const [selectedFilter, setSelectedFilter] = useState('upcoming');

//   const filters = [
//     { id: 'upcoming', label: tSafe('upcoming', 'Upcoming') },
//     { id: 'in_progress', label: tSafe('in_progress', 'In Progress') },
//     { id: 'completed', label: tSafe('completed', 'Completed') },
//   ];

//   // Handle refresh
//   const handleRefresh = async () => {
//     setRefreshing(true);
//     try {
//       await Promise.all([fetchSchedules(), fetchRequests(), fetchProperties()]);
//     } catch (error) {
//       console.error('Error refreshing data:', error);
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   // Fetch all data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         await Promise.all([fetchSchedules(), fetchRequests(), fetchProperties(), fetchClientSecret()]);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   // Poll for new requests
//   useEffect(() => {
//     const interval = setInterval(() => {
//       fetchRequests();
//     }, 30000); // Poll every 30 seconds

//     return () => clearInterval(interval);
//   }, []);

//   const fetchClientSecret = async () => {
//     try {
//       const response = await userService.getClientSecret();
//       const res = response.data;
//       setClientSecret(res.client_secret);
//     } catch (error) {
//       console.error('Error fetching client secret:', error);
//     }
//   };

//   const fetchRequests = async () => {
//     const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
//     try {
//       const response = await userService.getHostCleaningRequest(currentUserId, currentTime);
//       const res = response.data;

//       setPendingCount(res.length);

//       const pendingRequests = res.filter(
//         (req) => req.status === "pending_acceptance"
//       );

//       const pendingPaymentRequests = res.filter(
//         (req) => req.status === "pending_payment"
//       );

//       setCleaningRequests(res);
//       setFilteredPendingPayment(pendingPaymentRequests);
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   const fetchProperties = async () => {
//     try {
//       const response = await userService.getApartment(currentUserId);
//       const data = response.data;
//       setProperties(data);
//     } catch (error) {
//       console.error('Error fetching properties:', error);
//     }
//   };

//   const fetchSchedules = async () => {
//     try {
//       const response = await userService.getSchedulesByHostId(currentUserId);
//       const res = response.data;

//       setSchedules(res);

//       // Pending completion approval
//       const pendingCompletionApprovalSchedules = res
//         .filter(
//           (schedule) =>
//             (schedule.status === "completed" ||
//               schedule.status === "in_progress" ||
//               schedule.status === "pending_review") &&
//             Array.isArray(schedule.assignedTo) &&
//             schedule.assignedTo.some(
//               (cleaner) => cleaner.status === "pending_review"
//             )
//         )
//         .map((schedule) => ({
//           ...schedule,
//           assignedTo: schedule.assignedTo.filter(
//             (cleaner) => cleaner.status === "pending_review"
//           ),
//         }));

//       setFilteredPendingCompletionApprovalSchedules(
//         pendingCompletionApprovalSchedules
//       );

    

//       // Helper for datetime
//       const getScheduleDateTime = (schedule) => {
//         const date =
//           schedule.cleaning_date || schedule.schedule?.cleaning_date;
//         const time =
//           schedule.cleaning_time ||
//           schedule.schedule?.cleaning_time ||
//           "00:00:00";

//         return new Date(`${date}T${time}`);
//       };

//       // Upcoming (future only)
//       const upcomingSchedulesFiltered = res
//         .filter((schedule) => {
//           const scheduleDateTime = getScheduleDateTime(schedule);
//           const now = new Date();

//           const isValidStatus =
//             schedule.status === "pending_payment" ||
//             schedule.status === "upcoming"

//           return isValidStatus
//         })
//         .sort((a, b) => {
//           return getScheduleDateTime(a) - getScheduleDateTime(b);
//         });

//       setUpcomingSchedules(upcomingSchedulesFiltered);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const handleHostPress = () => {
//     // navigation.navigate(ROUTES.add_apartment);
//     navigation.navigate(ROUTES.host_add_apt)
//   };

//   const calculateTotalSpent = () => {
//     return schedules
//       .filter(s => s.status === 'completed')
//       .reduce((sum, schedule) => sum + (schedule.overall_checklist?.totalFee || schedule.schedule?.total_cleaning_fee || 0), 0);
//   };

//   const formatAmount = (value) => {
//     if (value >= 1_000_000) {
//       return `${(value / 1_000_000).toFixed(1)}M`;
//     }
//     if (value >= 1_000) {
//       return `${(value / 1_000).toFixed(1)}k`;
//     }
//     return value.toString();
//   };

//   const totalSpent = calculateTotalSpent();
//   const totalSpentLabel = totalSpent;

//   const formatCurrency = (amount) => {
//     return `${geolocationData?.currency?.symbol || '$'}${amount?.toFixed(2) || '0.00'}`;
//   };

//   const getStatusColor = (status) => {
//     const colorMap = {
//       completed: '#34C759',
//       in_progress: COLORS.primary,
//       pending_payment: '#FF9500',
//       upcoming: '#5AC8FA',
//       pending_acceptance: '#FF9500',
//       pending_completion_approval: '#FF9500',
//       cancelled: '#FF3B30',
//     };
//     return colorMap[status] || '#8E8E93';
//   };

//   const getStatusLabel = (status) => {
//     const labelMap = {
//       completed: tSafe('completed_status', 'Completed'),
//       in_progress: tSafe('in_progress_status', 'In Progress'),
//       pending_payment: tSafe('pending_payment_status', 'Pending Payment'),
//       upcoming: tSafe('upcoming_status', 'Upcoming'),
//       pending_acceptance: tSafe('pending_acceptance_status', 'Pending'),
//       pending_completion_approval: tSafe('pending_completion_approval_status', 'Pending Approval'),
//       cancelled: tSafe('cancelled_status', 'Cancelled'),
//     };
//     return labelMap[status] || status;
//   };

//   const handleCloseCreateBooking = () => {
//     handleCreateSchedule(false)
//     resetFormData()
//   }

//   const renderPendingApprovalItem = ({ item }) => (
//     <PendingApprovalListItem item={item} hostId={currentUserId} />
//   );

//   const renderUpcomingScheduleItem = ({ item }) => (
//     <View style={{ marginBottom: 12 }}>
//       <UpcomingScheduleListItem item={item} currency={currency}  />
//     </View>
//   );

//   const renderPropertySection = () => (
//     <View>
//       <PropertyCardList
//         properties={properties.slice(0, 3)}
//         handleHostPress={handleHostPress}
//         currentUserId={currentUserId}
//         navigation={navigation}
//         showAddButton={properties.length === 0}
//       />
//     </View>
//   );

//   const renderNewCleaningRequests = () => {
//     if (cleaningRequests.length === 0) return null;

//     return (
//       <View style={styles.sectionCard}>
//         <View style={styles.sectionHeader}>
//           <Text style={styles.sectionTitle}>{tSafe("new_cleaning_requests", "New Cleaning Requests")} </Text>
//           <Text style={styles.sectionCount}>{cleaningRequests.length}</Text>
//         </View>
//         <Text style={styles.sectionSubtitle}>
//           {tSafe("track_cleaning_dashboard", "Track all cleaning requests you've sent to cleaners.")}
//         </Text>
//         <NewlyPublishedSchedule schedule={cleaningRequests} pendingCount={pendingCount} />
//       </View>
//     );
//   };

//   const renderPendingApprovals = () => {
//     if (pendingCompletionApproval.length === 0) return null;

//     return (
//       <View style={styles.sectionCard}>
//         <View style={styles.sectionHeader}>
//           <Text style={styles.sectionTitle}>{tSafe("review_completed_cleaning_dashboard", "Review Completed Cleaning")} </Text>
//           <Text style={styles.sectionCount}>{pendingCompletionApproval.length}</Text>
//         </View>
//         <Text style={styles.sectionSubtitle}>
//           {tSafe('cleaning_approval_notification', "The cleaner has finished the job. Approve to release payment or reject if you're not satisfied.")}
//         </Text>
//         <FlatList
//           data={pendingCompletionApproval}
//           renderItem={renderPendingApprovalItem}
//           keyExtractor={(item) => item._id}
//           scrollEnabled={false}
//         />
//       </View>
//     );
//   };

//   const { logout } = useContext(AuthContext);
//   const renderUpcomingSchedules = () => {
//     if (upcomingSchedules.length === 0) return null;

//     return (
//       <View style={styles.sectionCard}>
//         <View style={styles.sectionHeader}>
//           <Text style={styles.sectionTitle}>{tSafe('upcoming_schedules', 'Upcoming Schedules')} </Text>
//           <TouchableOpacity onPress={() => navigation.navigate(ROUTES.host_bookings)}>
//             <Text style={styles.viewAllText}>{tSafe('view_all', 'View All')}</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Filter Tabs */}
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           style={styles.filterTabsContainer}
//         >
//           {/* <View style={styles.filterTabs}>
//             {filters.map((filter) => (
//               <TouchableOpacity
//                 key={filter.id}
//                 style={[
//                   styles.filterTab,
//                   selectedFilter === filter.id && styles.filterTabActive,
//                 ]}
//                 onPress={() => setSelectedFilter(filter.id)}
//               >
//                 <Text
//                   style={[
//                     styles.filterTabText,
//                     selectedFilter === filter.id && styles.filterTabTextActive,
//                   ]}
//                 >
//                   {filter.label}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View> */}
//         </ScrollView>

//         <FlatList
//           data={upcomingSchedules.slice(0, 2)}
//           renderItem={renderUpcomingScheduleItem}
//           keyExtractor={(item) => item._id}
//           horizontal={false}
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.horizontalListContent}
//           ListEmptyComponent={
//             <View style={styles.emptySection}>
//               <MaterialCommunityIcons name="calendar-blank" size={48} color="#CCCCCC" />
//               <Text style={styles.emptySectionText}>{tSafe("no_upcoming_schedule", "No upcoming schedules")} </Text>
//             </View>
//           }
//         />
//       </View>
//     );
//   };

//   const renderSummaryCards = () => (
//     <View style={styles.summaryCards}>
//       <View style={styles.summaryCard}>
//         <View style={styles.summaryIconContainer}>
//           <MaterialCommunityIcons name="calendar-check" size={24} color={COLORS.primary} />
//         </View>
//         <Text style={styles.summaryLabel}>{tSafe("bookings", "Bookings")} </Text>
//         <Text style={styles.summaryAmount}>{schedules.length}</Text>
//         <Text style={styles.summarySubtext}>{tSafe("all_schedules", "All schedules")}</Text>
//       </View>

//       <View style={styles.summaryCard}>
//         <View style={styles.summaryIconContainer}>
//           <MaterialCommunityIcons name="cash" size={24} color="#34C759" />
//         </View>
//         <Text style={styles.summaryLabel}>{tSafe("total_spent", "Total Spent")}</Text>
//         <Text style={styles.summaryAmount}>{geolocationData?.currency?.symbol} {totalSpentLabel}</Text>
//         <Text style={styles.summarySubtext}>{tSafe("completed_schedules", "Completed schedules")}</Text>
//       </View>

//       <View style={styles.summaryCard}>
//         <View style={styles.summaryIconContainer}>
//           <MaterialCommunityIcons name="home" size={24} color="#5AC8FA" />
//         </View>
//         <Text style={styles.summaryLabel}>{tSafe("properties", "Properties")}</Text>
//         <Text style={styles.summaryAmount}>{properties.length}</Text>
//         <Text style={styles.summarySubtext}>{tSafe("active_listings", "Active listings")}</Text>
//       </View>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>{tSafe("loading_dashboard", "Loading dashboard...")}</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.headerLeft}>
//           <View style={styles.avatarContainer}>
//             {currentUser?.avatar ? (
//               <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
//             ) : (
//               <View style={[styles.avatar, styles.avatarPlaceholder]}>
//                 <Text style={styles.avatarText}>
//                   {currentUser?.firstname?.charAt(0) || 'U'}
//                 </Text>
//               </View>
//             )}
//           </View>
//           <View>
//             <Text style={styles.welcomeText}>{tSafe("welcome_back", "Welcome back")}</Text>
//             <Text style={styles.userName}>{currentUser?.firstname || 'User'}</Text>
//           </View>
//         </View>
//         <TouchableOpacity
//           style={styles.notificationButton}
//           onPress={() => navigation.navigate(ROUTES.notification)}
//         >
//           <MaterialCommunityIcons name="bell-outline" size={24} color="#1C1C1E" />
//           {notificationUnreadCount > 0 && (
//             <View style={styles.notificationBadge}>
//               <Text style={styles.notificationBadgeText}>{notificationUnreadCount}</Text>
//             </View>
//           )}
//         </TouchableOpacity>
//       </View>

//       <ScrollView
//         ref={scrollRef}
//         style={styles.scrollView}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
//         }
//       >

//         <View style={styles.content}>

//           {/* Summary Cards */}
//           {renderSummaryCards()}

//           {/* New Cleaning Requests */}
//           {renderNewCleaningRequests()}

//           {/* Pending Approvals */}
//           {renderPendingApprovals()}
          

//           {/* Upcoming Schedules */}
//           {/* {renderUpcomingSchedules()} */}

//           {/* Properties Section */}
//           {renderPropertySection()}


//         </View>
//       </ScrollView>

//       {/* Quick Action Button */}
//       {properties.length > 0 && (
//         <TouchableOpacity
//           style={styles.floatingButton}
//           onPress={() => handleCreateSchedule(true)}
//         >
//           <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
//           <Text style={styles.floatingButtonText}>{tSafe("new_schedule", "New Schedule")}</Text>
//         </TouchableOpacity>
//       )}

//       <Modal
//         visible={modalEVisible}
//         animationType="slide"
//         // onRequestClose={onClose} // Handle hardware back button on Android
//       >
//         <EditSchedule
//           close_modal={handleCloseCreateBooking}
//           mode="create"
//         />

//       </Modal>

//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         // onRequestClose={onClose} // Handle hardware back button on Android
//       >

//         <NewBooking
//           close_modal={handleCloseCreateBooking}
//           mode="create"
//         />
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F5F7',
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
//     paddingHorizontal: 20,
//     paddingTop: 60,
//     paddingBottom: 16,
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E5EA',
//   },
//   headerLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatarContainer: {
//     marginRight: 12,
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//   },
//   avatarPlaceholder: {
//     backgroundColor: COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   avatarText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   welcomeText: {
//     fontSize: 12,
//     color: '#8E8E93',
//   },
//   userName: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#1C1C1E',
//   },
//   notificationButton: {
//     padding: 8,
//     position: 'relative',
//   },
//   notificationBadge: {
//     position: 'absolute',
//     top: 4,
//     right: 4,
//     backgroundColor: '#FF3B30',
//     borderRadius: 10,
//     width: 18,
//     height: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   notificationBadgeText: {
//     color: '#FFFFFF',
//     fontSize: 10,
//     fontWeight: 'bold',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   content: {
//     padding: 16,
//     paddingBottom: 100,
//   },
//   summaryCards: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: 24,
//   },
//   summaryCard: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   summaryIconContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#F2F2F7',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   summaryLabel: {
//     fontSize: 12,
//     color: '#8E8E93',
//     marginBottom: 4,
//     fontWeight: '500',
//   },
//   summaryAmount: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: '#1C1C1E',
//     marginBottom: 4,
//   },
//   summarySubtext: {
//     fontSize: 11,
//     color: '#8E8E93',
//   },
//   sectionCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1C1C1E',
//   },
//   sectionCount: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.primary,
//     backgroundColor: `${COLORS.primary}20`,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   sectionSubtitle: {
//     fontSize: 14,
//     color: '#666',
//     lineHeight: 20,
//     marginBottom: 16,
//   },
//   viewAllText: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontWeight: '600',
//   },
//   filterTabsContainer: {
//     marginBottom: 1,
//   },
//   filterTabs: {
//     flexDirection: 'row',
//     backgroundColor: '#F2F2F7',
//     borderRadius: 12,
//     padding: 4,
//   },
//   filterTab: {
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//     minWidth: 100,
//   },
//   filterTabActive: {
//     backgroundColor: COLORS.primary,
//   },
//   filterTabText: {
//     fontSize: 13,
//     fontWeight: '500',
//     color: '#8E8E93',
//   },
//   filterTabTextActive: {
//     color: '#FFFFFF',
//     fontWeight: '600',
//   },
//   emptySection: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 40,
//   },
//   emptySectionText: {
//     fontSize: 16,
//     color: '#8E8E93',
//     marginTop: 12,
//   },
//   helpSection: {
//     borderRadius: 16,
//     padding: 20,
//   },
//   helpHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   helpTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#FFFFFF',
//     marginLeft: 10,
//   },
//   helpText: {
//     fontSize: 14,
//     color: '#FFFFFF',
//     lineHeight: 20,
//     marginBottom: 20,
//     opacity: 0.9,
//   },
//   contactSupportButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 14,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//   },
//   contactSupportText: {
//     fontSize: 15,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   floatingButton: {
//     position: 'absolute',
//     bottom: 30,
//     right: 20,
//     backgroundColor: COLORS.primary,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 14,
//     borderRadius: 30,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   floatingButtonText: {
//     color: '#FFFFFF',
//     fontSize: 15,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
// });

// export default Dashboard;



