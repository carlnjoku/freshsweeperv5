import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

import {
  Checkbox,
  Divider,
} from 'react-native-paper';

import {
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';

import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';

import moment from 'moment';

import userService from '../../services/connection/userService';
import ROUTES from '../../constants/routes';

import { useTheme } from '../../theme';
import AppText from '../../ui/AppText';
import AppCard from '../../ui/AppCard';
import AppButton from '../../ui/AppButton';

// =========================================================
// Helpers
// =========================================================

const formatGroup = (group) => {
  if (!group) return '';

  return group
    .split('_')
    .map(
      word =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(' ');
};

const formatDate = (dateString) => {
  if (!dateString) return '';

  // Prevent YYYY-MM-DD timezone shifting.
  if (
    typeof dateString === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(dateString)
  ) {
    const [year, month, day] =
      dateString.split('-').map(Number);

    return moment(
      new Date(year, month - 1, day)
    ).format('MMM D, YYYY');
  }

  const date = moment(dateString);

  return date.isValid()
    ? date.format('MMM D, YYYY')
    : dateString;
};

const formatTime = (timeString) => {
  if (!timeString) return '';

  const time = moment(
    timeString,
    ['HH:mm:ss', 'HH:mm'],
    true
  );

  return time.isValid()
    ? time.format('h:mm A')
    : timeString;
};

const getInitials = (firstname, lastname) => {
  const first =
    firstname?.charAt(0)?.toUpperCase() || '';

  const last =
    lastname?.charAt(0)?.toUpperCase() || '';

  return `${first}${last}`;
};

const getSelectedReplacementRequest = (statusData) => {
  if (!statusData?.requests) {
    return null;
  }

  return (
    statusData.requests.find(
      item => item?.selectedByHost === true
    ) || null
  );
};

// =========================================================
// Theme helper
// =========================================================

const withAlpha = (color, alpha, fallback) => {
  if (
    typeof color === 'string' &&
    /^#[0-9a-fA-F]{6}$/.test(color)
  ) {
    return `${color}${alpha}`;
  }

  return fallback || color;
};

// =========================================================
// Component
// =========================================================

const ReplacementRequestStatus = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { theme, isDark } = useTheme();

  const {
    scheduleId,
    requestId,
  } = route.params || {};

  // -------------------------------------------------------
  // State
  // -------------------------------------------------------

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCleaner, setSelectedCleaner] = useState(null);

  // =======================================================
  // Fetch
  // =======================================================

  const fetchStatus = useCallback(
    async (showLoader = false) => {
      if (!scheduleId || !requestId) {
        console.warn(
          'Missing scheduleId or requestId'
        );

        setLoading(false);
        return;
      }

      try {
        if (showLoader) {
          setLoading(true);
        }

        const response =
          await userService.getReplacementRequestStatus(
            scheduleId,
            requestId
          );

        console.log(
          '✅ Replacement request status:',
          response.data
        );

        setData(response.data);

        // Preserve host selection from backend.
        const previouslySelected =
          getSelectedReplacementRequest(response.data);

        if (previouslySelected) {
          setSelectedCleaner(previouslySelected);
        } else {
          // Clear local selection if no longer persisted.
          setSelectedCleaner(null);
        }
      } catch (error) {
        console.error(
          '❌ Failed to fetch replacement request status:',
          error.response?.status,
          error.response?.data || error.message
        );

        Alert.alert(
          'Unable to Load',
          error?.response?.data?.detail ||
            'We could not load the replacement requests.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [scheduleId, requestId]
  );

  // =======================================================
  // Initial load
  // =======================================================

  useEffect(() => {
    fetchStatus(true);
  }, [fetchStatus]);

  // =======================================================
  // Refresh on focus
  // =======================================================

  useFocusEffect(
    useCallback(() => {
      fetchStatus(false);
    }, [fetchStatus])
  );

  // =======================================================
  // Auto refresh
  // =======================================================

  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatus(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchStatus]);

  // =======================================================
  // Pull refresh
  // =======================================================

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStatus(false);
  };

  // =======================================================
  // Select cleaner
  // =======================================================

  const handleSelectCleaner = (cleaner) => {
    if (cleaner.status !== 'accepted') {
      return;
    }

    setSelectedCleaner(cleaner);
  };

  // =======================================================
  // Continue
  // =======================================================

  const handleContinue = async () => {
    const persistedSelectedCleaner =
      getSelectedReplacementRequest(data);

    const cleanerToUse =
      persistedSelectedCleaner || selectedCleaner;

    // -------------------------------------------------------
    // Existing selection: continue directly to payment.
    // -------------------------------------------------------

    if (
      data?.status === 'payment_required' &&
      cleanerToUse
    ) {
      console.log(
        '💳 Existing replacement workflow requires payment:',
        {
          scheduleId,
          requestId,
          replacementRequestId: cleanerToUse.requestId,
          cleanerId: cleanerToUse.cleanerId,
        }
      );

      navigation.navigate(
        ROUTES.host_replacement_payment,
        {
          scheduleId: String(scheduleId),
          requestId: String(requestId),

          replacementRequestId: String(
            cleanerToUse.requestId
          ),

          cleanerId: String(
            cleanerToUse.cleanerId
          ),

          cleanerName: cleanerToUse.cleanerName,

          replacedCleanerId:
            data?.unavailableCleaner?.cleanerId ||
            data?.originalCleanerId ||
            null,

          replacedCleanerName:
            data?.unavailableCleaner?.name || null,

          oldCleaningDate: data?.oldCleaningDate,
          newCleaningDate: data?.newCleaningDate,
          cleaningTime: data?.cleaningTime,
          propertyName: data?.propertyName,

          group:
            cleanerToUse.group || data?.group,
        }
      );

      return;
    }

    // -------------------------------------------------------
    // Normal cleaner selection flow.
    // -------------------------------------------------------

    if (!selectedCleaner) {
      Alert.alert(
        'Select a Cleaner',
        'Please select an accepted cleaner to continue.'
      );

      return;
    }

    if (selectedCleaner.status !== 'accepted') {
      Alert.alert(
        'Cleaner No Longer Available',
        'This cleaner is no longer available. Please select another accepted cleaner.'
      );

      await fetchStatus(true);
      return;
    }

    Alert.alert(
      'Confirm Cleaner',
      `Continue with ${selectedCleaner.cleanerName} as the replacement cleaner?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: async () => {
            try {
              setLoading(true);

              const response =
                await userService.selectReplacementCleaner({
                  scheduleId: String(scheduleId),
                  requestId: String(requestId),

                  replacementRequestId: String(
                    selectedCleaner.requestId
                  ),

                  cleanerId: String(
                    selectedCleaner.cleanerId
                  ),
                });

              console.log(
                '✅ Replacement cleaner selected:',
                response?.data
              );

              if (!response?.data?.success) {
                throw new Error(
                  response?.data?.message ||
                    'Unable to select the replacement cleaner.'
                );
              }

              navigation.navigate(
                ROUTES.host_replacement_payment,
                {
                  scheduleId: String(scheduleId),
                  requestId: String(requestId),

                  replacementRequestId: String(
                    selectedCleaner.requestId
                  ),

                  cleanerId: String(
                    selectedCleaner.cleanerId
                  ),

                  cleanerName:
                    selectedCleaner.cleanerName,

                  replacedCleanerId:
                    data?.unavailableCleaner?.cleanerId ||
                    data?.originalCleanerId ||
                    null,

                  replacedCleanerName:
                    data?.unavailableCleaner?.name ||
                    null,

                  oldCleaningDate: data?.oldCleaningDate,
                  newCleaningDate: data?.newCleaningDate,
                  cleaningTime: data?.cleaningTime,
                  propertyName: data?.propertyName,

                  group:
                    selectedCleaner.group || data?.group,
                }
              );
            } catch (error) {
              console.error(
                '❌ Failed to select replacement cleaner:',
                error.response?.status,
                error.response?.data || error.message
              );

              Alert.alert(
                'Unable to Select Cleaner',
                error?.response?.data?.detail ||
                  error?.response?.data?.message ||
                  error?.message ||
                  'We could not select this replacement cleaner. Please try again.'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // =======================================================
  // Status badge
  // =======================================================

  const renderStatus = (status) => {
    let label = 'Waiting';
    let color = theme.status.pending;
    let background = withAlpha(
      theme.status.pending,
      '20',
      theme.surface.selected
    );

    if (status === 'accepted') {
      label = 'Available';
      color = theme.status.success;
      background = withAlpha(
        theme.status.success,
        '20',
        theme.surface.selected
      );
    } else if (status === 'declined') {
      label = 'Declined';
      color = theme.status.error;
      background = withAlpha(
        theme.status.error,
        '20',
        theme.surface.selected
      );
    }

    return (
      <View
        style={[
          styles.statusPill,
          { backgroundColor: background },
        ]}
      >
        <View
          style={[
            styles.statusDot,
            { backgroundColor: color },
          ]}
        />

        <AppText
          variant="caption"
          style={[
            styles.statusText,
            { color },
          ]}
        >
          {label}
        </AppText>
      </View>
    );
  };

  // =======================================================
  // Cleaner card
  // =======================================================

  const renderCleaner = ({ item }) => {
    const isAccepted = item.status === 'accepted';

    const isSelected =
      selectedCleaner?.requestId === item.requestId;

    return (
      <TouchableOpacity
        activeOpacity={isAccepted ? 0.75 : 1}
        onPress={() => handleSelectCleaner(item)}
        disabled={!isAccepted}
      >
        <AppCard
          variant="bordered"
          style={[
            styles.cleanerCard,
            {
              backgroundColor: theme.card.background,
              borderColor: isSelected
                ? theme.brand.primary
                : theme.card.border,
              borderWidth: isSelected ? 2 : 1,
              opacity:
                item.status === 'declined' ? 0.65 : 1,
            },
          ]}
        >
          {/* Avatar */}

          <View
            style={[
              styles.avatar,
              {
                backgroundColor: theme.surface.selected,
              },
            ]}
          >
            <AppText
              variant="subtitle"
              style={{ color: theme.text.secondary }}
            >
              {getInitials(
                item.firstname,
                item.lastname
              )}
            </AppText>
          </View>

          {/* Cleaner information */}

          <View style={styles.cleanerContent}>
            <View style={styles.cleanerTopRow}>
              <AppText
                variant="subtitle"
                numberOfLines={1}
                style={[
                  styles.cleanerName,
                  { color: theme.text.primary },
                ]}
              >
                {item.cleanerName}
              </AppText>

              {renderStatus(item.status)}
            </View>

            <AppText
              variant="caption"
              style={[
                styles.cleanerGroup,
                { color: theme.text.secondary },
              ]}
            >
              {formatGroup(item.group)}
            </AppText>

            {item.status === 'accepted' && (
              <AppText
                variant="caption"
                style={[
                  styles.cleanerMessage,
                  { color: theme.status.success },
                ]}
              >
                Available for the updated date
              </AppText>
            )}

            {item.status === 'pending' && (
              <AppText
                variant="caption"
                style={[
                  styles.cleanerMessage,
                  { color: theme.text.secondary },
                ]}
              >
                Waiting for cleaner response
              </AppText>
            )}

            {item.status === 'declined' && (
              <AppText
                variant="caption"
                style={[
                  styles.cleanerMessage,
                  { color: theme.text.secondary },
                ]}
              >
                Cleaner is unavailable
              </AppText>
            )}
          </View>

          {/* Selection */}

          {isAccepted && (
            <Checkbox
              status={isSelected ? 'checked' : 'unchecked'}
              onPress={() => handleSelectCleaner(item)}
              color={theme.brand.primary}
              uncheckedColor={theme.icon.muted}
            />
          )}
        </AppCard>
      </TouchableOpacity>
    );
  };

  // =======================================================
  // Loading
  // =======================================================

  if (loading && !data) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: theme.background.default },
        ]}
      >
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background.default}
        />

        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.brand.primary}
          />

          <AppText
            variant="h3"
            style={[
              styles.loadingTitle,
              { color: theme.text.primary },
            ]}
          >
            Loading requests
          </AppText>

          <AppText
            variant="body"
            style={[
              styles.loadingSubtitle,
              { color: theme.text.secondary },
            ]}
          >
            Checking replacement cleaner responses...
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  // =======================================================
  // No data
  // =======================================================

  if (!data) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: theme.background.default },
        ]}
      >
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background.default}
        />

        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="clipboard-alert-outline"
            size={46}
            color={theme.icon.muted}
          />

          <AppText
            variant="h2"
            style={[
              styles.emptyTitle,
              { color: theme.text.primary },
            ]}
          >
            No request information
          </AppText>

          <AppText
            variant="body"
            style={[
              styles.emptySubtitle,
              { color: theme.text.secondary },
            ]}
          >
            We couldn't find the replacement requests
            for this cleaning.
          </AppText>

          <AppButton
            variant="primary"
            onPress={() => fetchStatus(true)}
          >
            Try Again
          </AppButton>
        </View>
      </SafeAreaView>
    );
  }

  // =======================================================
  // Main UI
  // =======================================================

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.background.default },
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background.default}
      />

      <FlatList
        data={data.requests || []}
        keyExtractor={item => item.requestId}
        renderItem={renderCleaner}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.brand.primary}
            colors={[theme.brand.primary]}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Hero */}

            <View style={styles.hero}>
              <View
                style={[
                  styles.heroIcon,
                  {
                    backgroundColor: withAlpha(
                      theme.brand.primary,
                      '18',
                      theme.surface.selected
                    ),
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="account-search-outline"
                  size={29}
                  color={theme.brand.primary}
                />
              </View>

              <View style={styles.heroContent}>
                <AppText
                  variant="h1"
                  style={[
                    styles.heroTitle,
                    { color: theme.text.primary },
                  ]}
                >
                  Find a Replacement
                </AppText>

                <AppText
                  variant="body"
                  style={[
                    styles.heroSubtitle,
                    { color: theme.text.secondary },
                  ]}
                >
                  Choose a cleaner for your updated
                  cleaning date.
                </AppText>
              </View>
            </View>

            {/* Booking information */}

            <AppCard
              variant="bordered"
              style={[
                styles.bookingCard,
                {
                  backgroundColor: theme.card.background,
                  borderColor: theme.card.border,
                },
              ]}
            >
              <View style={styles.bookingHeader}>
                <View
                  style={[
                    styles.propertyIcon,
                    {
                      backgroundColor: theme.surface.selected,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="home-outline"
                    size={25}
                    color={theme.icon.default}
                  />
                </View>

                <View style={styles.propertyInfo}>
                  <AppText
                    variant="subtitle"
                    style={{ color: theme.text.primary }}
                  >
                    {data.propertyName}
                  </AppText>

                  <AppText
                    variant="caption"
                    style={[
                      styles.groupLabel,
                      { color: theme.text.secondary },
                    ]}
                  >
                    {formatGroup(data.group)}
                  </AppText>
                </View>
              </View>

              <Divider
                style={[
                  styles.bookingDivider,
                  { backgroundColor: theme.divider },
                ]}
              />

              <View style={styles.bookingDetails}>
                <View style={styles.detailItem}>
                  <AppText
                    variant="caption"
                    style={[
                      styles.detailLabel,
                      { color: theme.text.muted },
                    ]}
                  >
                    ORIGINAL DATE
                  </AppText>

                  <AppText
                    variant="body"
                    style={{ color: theme.text.secondary }}
                  >
                    {formatDate(data.oldCleaningDate)}
                  </AppText>
                </View>

                <View style={styles.arrowContainer}>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={19}
                    color={theme.icon.muted}
                  />
                </View>

                <View style={styles.detailItem}>
                  <AppText
                    variant="caption"
                    style={[
                      styles.detailLabel,
                      { color: theme.text.muted },
                    ]}
                  >
                    NEW DATE
                  </AppText>

                  <AppText
                    variant="body"
                    style={[
                      styles.detailValue,
                      { color: theme.text.primary },
                    ]}
                  >
                    {formatDate(data.newCleaningDate)}
                  </AppText>
                </View>

                <View style={styles.timeContainer}>
                  <AppText
                    variant="caption"
                    style={[
                      styles.detailLabel,
                      { color: theme.text.muted },
                    ]}
                  >
                    TIME
                  </AppText>

                  <AppText
                    variant="body"
                    style={[
                      styles.detailValue,
                      { color: theme.text.primary },
                    ]}
                  >
                    {formatTime(data.cleaningTime)}
                  </AppText>
                </View>
              </View>
            </AppCard>

            {/* Original cleaner notice */}

            {data.unavailableCleaner && (
              <View
                style={[
                  styles.noticeCard,
                  {
                    backgroundColor: withAlpha(
                      theme.status.warning,
                      '18',
                      theme.surface.selected
                    ),
                    borderColor: withAlpha(
                      theme.status.warning,
                      '45',
                      theme.border.default
                    ),
                  },
                ]}
              >
                <View
                  style={[
                    styles.noticeIcon,
                    {
                      backgroundColor: withAlpha(
                        theme.status.warning,
                        '25',
                        theme.surface.selected
                      ),
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="alert-outline"
                    size={20}
                    color={theme.status.warning}
                  />
                </View>

                <View style={styles.noticeContent}>
                  <AppText
                    variant="subtitle"
                    style={{ color: theme.text.primary }}
                  >
                    Original cleaner unavailable
                  </AppText>

                  <AppText
                    variant="body"
                    style={[
                      styles.noticeText,
                      { color: theme.text.secondary },
                    ]}
                  >
                    {data.unavailableCleaner.name}
                    {' '}is unavailable for the updated date.
                    Select an available replacement below.
                  </AppText>
                </View>
              </View>
            )}

            {/* Response summary */}

            <View style={styles.summarySection}>
              <View>
                <AppText
                  variant="h2"
                  style={[
                    styles.sectionTitle,
                    { color: theme.text.primary },
                  ]}
                >
                  Cleaner Responses
                </AppText>

                <AppText
                  variant="caption"
                  style={[
                    styles.sectionSubtitle,
                    { color: theme.text.secondary },
                  ]}
                >
                  Select one cleaner after they accept.
                </AppText>
              </View>

              <View style={styles.responseCount}>
                <AppText
                  variant="h2"
                  style={{ color: theme.text.primary }}
                >
                  {data.requestCount}
                </AppText>

                <AppText
                  variant="caption"
                  style={[
                    styles.responseCountLabel,
                    { color: theme.text.muted },
                  ]}
                >
                  REQUESTS
                </AppText>
              </View>
            </View>

            {/* Response stats */}

            <View style={styles.statsRow}>
              <AppCard
                variant="bordered"
                style={[
                  styles.statCard,
                  {
                    backgroundColor: theme.card.background,
                    borderColor: theme.card.border,
                  },
                ]}
              >
                <AppText
                  variant="h2"
                  style={{ color: theme.status.pending }}
                >
                  {data.pendingCount}
                </AppText>

                <AppText
                  variant="caption"
                  style={[
                    styles.statLabel,
                    { color: theme.text.secondary },
                  ]}
                >
                  Waiting
                </AppText>
              </AppCard>

              <AppCard
                variant="bordered"
                style={[
                  styles.statCard,
                  {
                    backgroundColor: theme.card.background,
                    borderColor: theme.card.border,
                  },
                ]}
              >
                <AppText
                  variant="h2"
                  style={{ color: theme.status.success }}
                >
                  {data.acceptedCount}
                </AppText>

                <AppText
                  variant="caption"
                  style={[
                    styles.statLabel,
                    { color: theme.text.secondary },
                  ]}
                >
                  Available
                </AppText>
              </AppCard>

              <AppCard
                variant="bordered"
                style={[
                  styles.statCard,
                  {
                    backgroundColor: theme.card.background,
                    borderColor: theme.card.border,
                  },
                ]}
              >
                <AppText
                  variant="h2"
                  style={{ color: theme.status.error }}
                >
                  {data.declinedCount}
                </AppText>

                <AppText
                  variant="caption"
                  style={[
                    styles.statLabel,
                    { color: theme.text.secondary },
                  ]}
                >
                  Declined
                </AppText>
              </AppCard>
            </View>

            <AppText
              variant="h2"
              style={[
                styles.listHeader,
                { color: theme.text.primary },
              ]}
            >
              Replacement Cleaners
            </AppText>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            {selectedCleaner && (
              <View
                style={[
                  styles.selectedContainer,
                  {
                    backgroundColor: theme.surface.elevated,
                    borderColor: theme.border.default,
                  },
                ]}
              >
                <View
                  style={[
                    styles.selectedCheck,
                    {
                      backgroundColor: withAlpha(
                        theme.status.success,
                        '20',
                        theme.surface.selected
                      ),
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="check"
                    size={22}
                    color={theme.status.success}
                  />
                </View>

                <View style={styles.selectedInfo}>
                  <AppText
                    variant="caption"
                    style={[
                      styles.selectedLabel,
                      { color: theme.text.muted },
                    ]}
                  >
                    SELECTED CLEANER
                  </AppText>

                  <AppText
                    variant="subtitle"
                    style={{ color: theme.text.primary }}
                  >
                    {selectedCleaner.cleanerName}
                  </AppText>
                </View>
              </View>
            )}

            {!selectedCleaner &&
              data.acceptedCount > 0 && (
                <AppText
                  variant="caption"
                  style={[
                    styles.selectionHint,
                    { color: theme.text.secondary },
                  ]}
                >
                  Tap an available cleaner above to select them.
                </AppText>
              )}

            {data.pendingCount > 0 && (
              <View style={styles.refreshNotice}>
                <ActivityIndicator
                  size="small"
                  color={theme.brand.primary}
                />

                <AppText
                  variant="caption"
                  style={{ color: theme.text.secondary }}
                >
                  Waiting for cleaner responses...
                </AppText>
              </View>
            )}

            <AppButton
              variant="primary"
              onPress={handleContinue}
              disabled={
                !selectedCleaner &&
                data?.status !== 'payment_required'
              }
            >
              {data?.status === 'payment_required'
                ? 'Complete Replacement Payment'
                : 'Continue'}
            </AppButton>

            <AppText
              variant="caption"
              style={[
                styles.footerNote,
                { color: theme.text.muted },
              ]}
            >
              You can only select a cleaner who has
              accepted the replacement request.
            </AppText>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

// =========================================================
// Static layout styles
// Theme-dependent colors are applied inline above.
// =========================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 30,
  },

  // Loading

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  loadingTitle: {
    marginTop: 18,
  },

  loadingSubtitle: {
    marginTop: 6,
    textAlign: 'center',
  },

  // Empty

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  emptyTitle: {
    marginTop: 16,
    textAlign: 'center',
  },

  emptySubtitle: {
    textAlign: 'center',
    marginVertical: 10,
  },

  // Hero

  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
  },

  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  heroContent: {
    flex: 1,
  },

  heroTitle: {
    letterSpacing: -0.5,
  },

  heroSubtitle: {
    marginTop: 4,
    lineHeight: 20,
  },

  // Booking

  bookingCard: {
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 18,
  },

  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  propertyIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  propertyInfo: {
    flex: 1,
    marginLeft: 12,
  },

  groupLabel: {
    marginTop: 3,
  },

  bookingDivider: {
    marginVertical: 16,
    height: StyleSheet.hairlineWidth,
  },

  bookingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailItem: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: 5,
  },

  detailValue: {
    fontWeight: '700',
  },

  arrowContainer: {
    paddingHorizontal: 7,
  },

  timeContainer: {
    flex: 0.8,
    paddingLeft: 10,
  },

  // Notice

  noticeCard: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  noticeIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  noticeContent: {
    flex: 1,
    marginLeft: 11,
  },

  noticeText: {
    marginTop: 3,
    lineHeight: 19,
  },

  // Summary

  summarySection: {
    marginTop: 25,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {},

  sectionSubtitle: {
    marginTop: 4,
  },

  responseCount: {
    alignItems: 'flex-end',
  },

  responseCountLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  // Stats

  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 14,
    gap: 9,
  },

  statCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  statLabel: {
    marginTop: 3,
  },

  // Cleaner list

  listHeader: {
    marginHorizontal: 16,
    marginTop: 25,
    marginBottom: 11,
  },

  cleanerCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 13,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cleanerContent: {
    flex: 1,
    marginLeft: 12,
  },

  cleanerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  cleanerName: {
    flex: 1,
    marginRight: 7,
  },

  cleanerGroup: {
    marginTop: 3,
  },

  cleanerMessage: {
    marginTop: 5,
  },

  // Status pills

  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  statusText: {
    fontWeight: '700',
  },

  // Footer

  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  selectedContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  selectedCheck: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedInfo: {
    marginLeft: 11,
  },

  selectedLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  selectionHint: {
    textAlign: 'center',
    marginBottom: 10,
  },

  refreshNotice: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    gap: 7,
  },

  footerNote: {
    textAlign: 'center',
    lineHeight: 15,
    marginTop: 10,
    paddingHorizontal: 20,
  },
});

export default ReplacementRequestStatus;




// import React, {
//     useCallback,
//     useEffect,
//     useState,
//   } from 'react';
  
//   import {
//     View,
//     Text,
//     StyleSheet,
//     SafeAreaView,
//     FlatList,
//     Alert,
//     ActivityIndicator,
//     RefreshControl,
//     TouchableOpacity,
//     StatusBar,
//   } from 'react-native';
  
//   import {
//     Button,
//     Checkbox,
//     Divider,
//     IconButton,
//   } from 'react-native-paper';
  
//   import {
//     useNavigation,
//     useRoute,
//     useFocusEffect,
//   } from '@react-navigation/native';
  
//   import moment from 'moment';
  
// //   import userService from '../services/userService';
// import userService from '../../services/connection/userService';
// import ROUTES from '../../constants/routes';
// import COLORS from '../../constants/colors';
  
  
//   // =========================================================
//   // Helpers
//   // =========================================================
  
//   const formatGroup = (group) => {
//     if (!group) return '';
  
//     return group
//       .split('_')
//       .map(
//         word =>
//           word.charAt(0).toUpperCase() +
//           word.slice(1)
//       )
//       .join(' ');
//   };
  
  
//   const formatDate = (dateString) => {
//     if (!dateString) return '';
  
//     // Prevent YYYY-MM-DD timezone shifting
//     if (
//       typeof dateString === 'string' &&
//       /^\d{4}-\d{2}-\d{2}$/.test(dateString)
//     ) {
//       const [year, month, day] =
//         dateString.split('-').map(Number);
  
//       return moment(
//         new Date(year, month - 1, day)
//       ).format('MMM D, YYYY');
//     }
  
//     const date = moment(dateString);
  
//     return date.isValid()
//       ? date.format('MMM D, YYYY')
//       : dateString;
//   };
  
  
//   const formatTime = (timeString) => {
//     if (!timeString) return '';
  
//     const time = moment(
//       timeString,
//       ['HH:mm:ss', 'HH:mm'],
//       true
//     );
  
//     return time.isValid()
//       ? time.format('h:mm A')
//       : timeString;
//   };
  
  
//   const getInitials = (firstname, lastname) => {
//     const first =
//       firstname?.charAt(0)?.toUpperCase() || '';
  
//     const last =
//       lastname?.charAt(0)?.toUpperCase() || '';
  
//     return `${first}${last}`;
//   };

//   // =======================================================
//   // Get selected replacement request
//   // =======================================================

//   const getSelectedReplacementRequest = (statusData) => {

//     if (!statusData?.requests) {
//       return null;
//     }

//     return (
//       statusData.requests.find(
//         (item) =>
//           item?.selectedByHost === true
//       ) || null
//     );
//   };


  
  
//   // =========================================================
//   // Component
//   // =========================================================
  
//   const ReplacementRequestStatus = () => {
  
//     const navigation = useNavigation();
//     const route = useRoute();
  
//     const {
//       scheduleId,
//       requestId,
//     } = route.params || {};
  
  
//     // -------------------------------------------------------
//     // State
//     // -------------------------------------------------------
  
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [refreshing, setRefreshing] = useState(false);
  
//     const [selectedCleaner, setSelectedCleaner] =
//       useState(null);
  
  
//     // =======================================================
//     // Fetch
//     // =======================================================
  
//     const fetchStatus = useCallback(
//       async (showLoader = false) => {
  
//         if (!scheduleId || !requestId) {
//           console.warn(
//             'Missing scheduleId or requestId'
//           );
  
//           setLoading(false);
//           return;
//         }
  
//         try {
  
//           if (showLoader) {
//             setLoading(true);
//           }
  
//           const response =
//             await userService.getReplacementRequestStatus(
//               scheduleId,
//               requestId
//             );
  
//           console.log(
//             '✅ Replacement request status:',
//             response.data
//           );
  
//           setData(response.data);

//           // Preserve host selection
//           const previouslySelected =
//           getSelectedReplacementRequest(
//             response.data
//           );

//           if (previouslySelected) {

//           setSelectedCleaner(
//             previouslySelected
//           );

//           } else {

//           /*
//           * If the backend says a cleaner is no longer
//           * selected, clear the local selection as well.
//           */
//           setSelectedCleaner(null);
//           }
  
//         } catch (error) {
//           console.error(
//             '❌ Failed to fetch replacement request status:',
//             error.response?.status,
//             error.response?.data || error.message
//           );
        

          
  
//           Alert.alert(
//             'Unable to Load',
//             error?.response?.data?.detail ||
//               'We could not load the replacement requests.'
//           );
  
//         } finally {
  
//           setLoading(false);
//           setRefreshing(false);
//         }
  
//       },
//       [scheduleId, requestId]
//     );
  
  
//     // =======================================================
//     // Initial load
//     // =======================================================
  
//     useEffect(() => {
//       fetchStatus(true);
//     }, [fetchStatus]);
  
  
//     // =======================================================
//     // Refresh on focus
//     // =======================================================
  
//     useFocusEffect(
//       useCallback(() => {
//         fetchStatus(false);
//       }, [fetchStatus])
//     );
  
  
//     // =======================================================
//     // Auto refresh
//     // =======================================================
  
//     useEffect(() => {
  
//       const interval = setInterval(() => {
//         fetchStatus(false);
//       }, 10000);
  
//       return () => clearInterval(interval);
  
//     }, [fetchStatus]);
  
  
//     // =======================================================
//     // Pull refresh
//     // =======================================================
  
//     const handleRefresh = () => {
//       setRefreshing(true);
//       fetchStatus(false);
//     };
  
  
//     // =======================================================
//     // Select cleaner
//     // =======================================================
  
//     const handleSelectCleaner = (cleaner) => {
  
//       if (cleaner.status !== 'accepted') {
//         return;
//       }
  
//       setSelectedCleaner(cleaner);
//     };
  
  
//     // =======================================================
//     // Continue
//     // =======================================================

//     const handleContinue = async () => {

//       /*
//       * =====================================================
//       * PAYMENT REQUIRED
//       * =====================================================
//       *
//       * If the workflow already has a selected cleaner,
//       * do not ask the host to select them again.
//       *
//       * Go directly to ReplacementPayment.
//       * =====================================================
//       */

//       const persistedSelectedCleaner =
//         getSelectedReplacementRequest(data);

//       const cleanerToUse =
//         persistedSelectedCleaner ||
//         selectedCleaner;


//       if (
//         data?.status === 'payment_required' &&
//         cleanerToUse
//       ) {

//         console.log(
//           '💳 Existing replacement workflow requires payment:',
//           {
//             scheduleId,
//             requestId,
//             replacementRequestId:
//               cleanerToUse.requestId,
//             cleanerId:
//               cleanerToUse.cleanerId,
//           }
//         );


//         navigation.navigate(
//           ROUTES.host_replacement_payment,
//           {

//             /*
//             * Schedule
//             */
//             scheduleId:
//               String(scheduleId),

//             /*
//             * Parent date-change request
//             */
//             requestId:
//               String(requestId),

//             /*
//             * IMPORTANT:
//             * This is the CHILD replacement request.
//             */
//             replacementRequestId:
//               String(
//                 cleanerToUse.requestId
//               ),

//             /*
//             * Selected replacement cleaner
//             */
//             cleanerId:
//               String(
//                 cleanerToUse.cleanerId
//               ),

//             cleanerName:
//               cleanerToUse.cleanerName,

//             /*
//             * Original cleaner
//             */
//             replacedCleanerId:
//               data?.unavailableCleaner
//                 ?.cleanerId ||
//               data?.originalCleanerId ||
//               null,

//             replacedCleanerName:
//               data?.unavailableCleaner
//                 ?.name ||
//               null,

//             /*
//             * Cleaning information
//             */
//             oldCleaningDate:
//               data?.oldCleaningDate,

//             newCleaningDate:
//               data?.newCleaningDate,

//             cleaningTime:
//               data?.cleaningTime,

//             propertyName:
//               data?.propertyName,

//             group:
//               cleanerToUse.group ||
//               data?.group,
//           }
//         );

//         return;
//       }


//       /*
//       * =====================================================
//       * NORMAL CLEANER SELECTION FLOW
//       * =====================================================
//       */

//       if (!selectedCleaner) {

//         Alert.alert(
//           'Select a Cleaner',
//           'Please select an accepted cleaner to continue.'
//         );

//         return;
//       }


//       if (
//         selectedCleaner.status !==
//         'accepted'
//       ) {

//         Alert.alert(
//           'Cleaner No Longer Available',
//           'This cleaner is no longer available. Please select another accepted cleaner.'
//         );

//         await fetchStatus(true);

//         return;
//       }


//       Alert.alert(
//         'Confirm Cleaner',

//         `Continue with ${selectedCleaner.cleanerName} as the replacement cleaner?`,

//         [
//           {
//             text: 'Cancel',
//             style: 'cancel',
//           },

//           {
//             text: 'Continue',

//             onPress: async () => {

//               try {

//                 setLoading(true);


//                 /*
//                 * =================================================
//                 * Persist host selection
//                 * =================================================
//                 */

//                 const response =
//                   await userService.selectReplacementCleaner({
//                     scheduleId:
//                       String(scheduleId),

//                     /*
//                     * Parent date-change request
//                     */
//                     requestId:
//                       String(requestId),

//                     /*
//                     * Child replacement request
//                     */
//                     replacementRequestId:
//                       String(
//                         selectedCleaner.requestId
//                       ),

//                     /*
//                     * Cleaner
//                     */
//                     cleanerId:
//                       String(
//                         selectedCleaner.cleanerId
//                       ),
//                   });


//                 console.log(
//                   '✅ Replacement cleaner selected:',
//                   response?.data
//                 );


//                 if (
//                   !response?.data?.success
//                 ) {

//                   throw new Error(
//                     response?.data?.message ||
//                     'Unable to select the replacement cleaner.'
//                   );
//                 }


//                 /*
//                 * =================================================
//                 * Navigate to payment
//                 * =================================================
//                 */

//                 navigation.navigate(
//                   ROUTES.host_replacement_payment,
//                   {

//                     scheduleId:
//                       String(scheduleId),

//                     /*
//                     * Parent request
//                     */
//                     requestId:
//                       String(requestId),

//                     /*
//                     * Child replacement request
//                     */
//                     replacementRequestId:
//                       String(
//                         selectedCleaner.requestId
//                       ),

//                     cleanerId:
//                       String(
//                         selectedCleaner.cleanerId
//                       ),

//                     cleanerName:
//                       selectedCleaner.cleanerName,

//                     replacedCleanerId:
//                       data?.unavailableCleaner
//                         ?.cleanerId ||
//                       data?.originalCleanerId ||
//                       null,

//                     replacedCleanerName:
//                       data?.unavailableCleaner
//                         ?.name ||
//                       null,

//                     oldCleaningDate:
//                       data?.oldCleaningDate,

//                     newCleaningDate:
//                       data?.newCleaningDate,

//                     cleaningTime:
//                       data?.cleaningTime,

//                     propertyName:
//                       data?.propertyName,

//                     group:
//                       selectedCleaner.group ||
//                       data?.group,
//                   }
//                 );

//               } catch (error) {
//                 console.error(
//                   '❌ Failed to select replacement cleaner:',
//                   error.response?.status,
//                   error.response?.data || error.message
//                 );
              


//                 Alert.alert(
//                   'Unable to Select Cleaner',

//                   error?.response?.data?.detail ||
//                     error?.response?.data?.message ||
//                     error?.message ||
//                     'We could not select this replacement cleaner. Please try again.'
//                 );

//               } finally {

//                 setLoading(false);

//               }
//             },
//           },
//         ]
//       );
//     };

//     // const handleContinue = async () => {
//     //     if (!selectedCleaner) {
//     //       Alert.alert(
//     //         'Select a Cleaner',
//     //         'Please select an accepted cleaner to continue.'
//     //       );
      
//     //       return;
//     //     }
      
//     //     // ---------------------------------------------------------
//     //     // Make sure the selected cleaner is still accepted
//     //     // ---------------------------------------------------------
//     //     if (selectedCleaner.status !== 'accepted') {
//     //       Alert.alert(
//     //         'Cleaner No Longer Available',
//     //         'This cleaner is no longer available for replacement. Please select another accepted cleaner.'
//     //       );
      
//     //       await fetchStatus(true);
//     //       return;
//     //     }
      
//     //     Alert.alert(
//     //       'Confirm Cleaner',
//     //       `Continue with ${selectedCleaner.cleanerName} as the replacement cleaner?`,
//     //       [
//     //         {
//     //           text: 'Cancel',
//     //           style: 'cancel',
//     //         },
      
//     //         {
//     //           text: 'Continue',
      
//     //           onPress: async () => {
//     //             try {
//     //               // -------------------------------------------------
//     //               // Show loading state
//     //               // -------------------------------------------------
//     //               setLoading(true);
      
//     //               console.log(
//     //                 'Selecting replacement cleaner:',
//     //                 {
//     //                   scheduleId,
//     //                   requestId,
//     //                   replacementRequestId:
//     //                     selectedCleaner.requestId,
//     //                   cleanerId:
//     //                     selectedCleaner.cleanerId,
//     //                 }
//     //               );
      
//     //               // -------------------------------------------------
//     //               // Tell backend which accepted cleaner was selected
//     //               // -------------------------------------------------
//     //               const response =
//     //                 await userService.selectReplacementCleaner({
//     //                   scheduleId: String(scheduleId),
      
//     //                   // Parent date-change request
//     //                   requestId: String(requestId),
      
//     //                   // Child replacement request
//     //                   replacementRequestId:
//     //                     String(selectedCleaner.requestId),
      
//     //                   // Selected replacement cleaner
//     //                   cleanerId:
//     //                     String(selectedCleaner.cleanerId),
//     //                 });
      
//     //               console.log(
//     //                 '✅ Replacement cleaner selected:',
//     //                 response?.data
//     //               );
      
//     //               // -------------------------------------------------
//     //               // Verify backend confirmed selection
//     //               // -------------------------------------------------
//     //               if (
//     //                 !response?.data?.success
//     //               ) {
//     //                 throw new Error(
//     //                   response?.data?.message ||
//     //                   'The replacement cleaner could not be selected.'
//     //                 );
//     //               }
      
//     //               // -------------------------------------------------
//     //               // Navigate to payment
//     //               //
//     //               // IMPORTANT:
//     //               // The schedule has NOT been changed yet.
//     //               // Payment/webhook will perform the final assignment.
//     //               // -------------------------------------------------
//     //               navigation.navigate(ROUTES.host_replacement_payment,
//     //                 {
//     //                   scheduleId,
//     //                   // Parent date-change request
//     //                   requestId,
//     //                   // Selected replacement request
//     //                   replacementRequestId:
//     //                     selectedCleaner.requestId,
      
//     //                   // Selected cleaner
//     //                   cleanerId:
//     //                     selectedCleaner.cleanerId,
      
//     //                   cleanerName:
//     //                     selectedCleaner.cleanerName,
      
//     //                   group:
//     //                     selectedCleaner.group,
      
//     //                   oldCleaningDate:
//     //                     data.oldCleaningDate,
      
//     //                   newCleaningDate:
//     //                     data.newCleaningDate,
      
//     //                   cleaningTime:
//     //                     data.cleaningTime,
      
//     //                   propertyName:
//     //                     data.propertyName,
      
//     //                   replacementCleanerFee:
//     //                     response?.data
//     //                       ?.replacementCleanerFee ??
//     //                     selectedCleaner
//     //                       ?.replacementCleanerFee,
//     //                 }
//     //               );
      
//     //             } catch (error) {
      
//     //               console.error(
//     //                 '❌ Failed to select replacement cleaner:',
//     //                 error
//     //               );
      
//     //               const message =
//     //                 error?.response?.data?.detail ||
//     //                 error?.response?.data?.message ||
//     //                 error?.message ||
//     //                 'We could not select this replacement cleaner. Please try again.';
      
//     //               Alert.alert(
//     //                 'Unable to Select Cleaner',
//     //                 message
//     //               );
      
//     //             } finally {
//     //               setLoading(false);
//     //             }
//     //           },
//     //         },
//     //       ]
//     //     );
//     //   };
  
  
//     // =======================================================
//     // Status badge
//     // =======================================================
  
//     const renderStatus = (status) => {
  
//       if (status === 'accepted') {
//         return (
//           <View style={[
//             styles.statusPill,
//             styles.acceptedPill,
//           ]}>
//             <View style={[
//               styles.statusDot,
//               styles.acceptedDot,
//             ]} />
  
//             <Text style={[
//               styles.statusText,
//               styles.acceptedText,
//             ]}>
//               Available
//             </Text>
//           </View>
//         );
//       }
  
  
//       if (status === 'declined') {
//         return (
//           <View style={[
//             styles.statusPill,
//             styles.declinedPill,
//           ]}>
//             <View style={[
//               styles.statusDot,
//               styles.declinedDot,
//             ]} />
  
//             <Text style={[
//               styles.statusText,
//               styles.declinedText,
//             ]}>
//               Declined
//             </Text>
//           </View>
//         );
//       }
  
  
//       return (
//         <View style={[
//           styles.statusPill,
//           styles.pendingPill,
//         ]}>
//           <View style={[
//             styles.statusDot,
//             styles.pendingDot,
//           ]} />
  
//           <Text style={[
//             styles.statusText,
//             styles.pendingText,
//           ]}>
//             Waiting
//           </Text>
//         </View>
//       );
//     };
  
  
//     // =======================================================
//     // Cleaner card
//     // =======================================================
  
//     const renderCleaner = ({ item }) => {
  
//       const isAccepted =
//         item.status === 'accepted';
  
//       const isSelected =
//         selectedCleaner?.requestId ===
//         item.requestId;
  
  
//       return (
//         <TouchableOpacity
//           activeOpacity={isAccepted ? 0.75 : 1}
//           onPress={() =>
//             handleSelectCleaner(item)
//           }
//           disabled={!isAccepted}
//         >
  
//           <View
//             style={[
//               styles.cleanerCard,
  
//               isSelected &&
//                 styles.selectedCleanerCard,
  
//               item.status === 'declined' &&
//                 styles.declinedCleanerCard,
//             ]}
//           >
  
//             {/* Avatar */}
  
//             <View style={styles.avatar}>
  
//               <Text style={styles.avatarText}>
//                 {getInitials(
//                   item.firstname,
//                   item.lastname
//                 )}
//               </Text>
  
//             </View>
  
  
//             {/* Cleaner information */}
  
//             <View style={styles.cleanerContent}>
  
//               <View style={styles.cleanerTopRow}>
  
//                 <Text
//                   style={styles.cleanerName}
//                   numberOfLines={1}
//                 >
//                   {item.cleanerName}
//                 </Text>
  
//                 {renderStatus(item.status)}
  
//               </View>
  
  
//               <Text style={styles.cleanerGroup}>
//                 {formatGroup(item.group)}
//               </Text>
  
  
//               {item.status === 'accepted' && (
  
//                 <Text style={styles.availableMessage}>
//                   Available for the updated date
//                 </Text>
  
//               )}
  
//               {item.status === 'pending' && (
  
//                 <Text style={styles.waitingMessage}>
//                   Waiting for cleaner response
//                 </Text>
  
//               )}
  
//               {item.status === 'declined' && (
  
//                 <Text style={styles.declinedMessage}>
//                   Cleaner is unavailable
//                 </Text>
  
//               )}
  
//             </View>
  
  
//             {/* Selection */}
  
//             {isAccepted && (
  
//               <Checkbox
//                 status={
//                   isSelected
//                     ? 'checked'
//                     : 'unchecked'
//                 }
//                 onPress={() =>
//                   handleSelectCleaner(item)
//                 }
//               />
  
//             )}
  
//           </View>
  
//         </TouchableOpacity>
//       );
//     };
  
  
//     // =======================================================
//     // Loading
//     // =======================================================
  
//     if (loading && !data) {
//       return (
//         <SafeAreaView style={styles.safeArea}>
//           <StatusBar barStyle="dark-content" />
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" />
//             <Text style={styles.loadingTitle}>
//               Loading requests
//             </Text>
//             <Text style={styles.loadingSubtitle}>
//               Checking replacement cleaner responses...
//             </Text>
//           </View>
//         </SafeAreaView>
//       );
//     }
  
  
//     // =======================================================
//     // No data
//     // =======================================================
  
//     if (!data) {
  
//       return (
//         <SafeAreaView style={styles.safeArea}>
  
//           <View style={styles.emptyContainer}>
  
//             <Text style={styles.emptyTitle}>
//               No request information
//             </Text>
  
//             <Text style={styles.emptySubtitle}>
//               We couldn't find the replacement requests
//               for this cleaning.
//             </Text>
  
//             <Button
//               mode="contained"
//               onPress={() =>
//                 fetchStatus(true)
//               }
//             >
//               Try Again
//             </Button>
  
//           </View>
  
//         </SafeAreaView>
//       );
//     }
  
  
//     // =======================================================
//     // Main UI
//     // =======================================================
  
//     return (
//       <SafeAreaView style={styles.safeArea}>
  
//         <StatusBar barStyle="dark-content" />
  
  
//         <FlatList
//           data={data.requests || []}
  
//           keyExtractor={item =>
//             item.requestId
//           }
  
//           renderItem={renderCleaner}
  
//           showsVerticalScrollIndicator={false}
  
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={handleRefresh}
//             />
//           }
  
  
//           // =================================================
//           // HEADER
//           // =================================================
  
//           ListHeaderComponent={
  
//             <View>
  
  
//               {/* ---------------------------------------------
//                   Hero
//               --------------------------------------------- */}
  
//               <View style={styles.hero}>
  
//                 <View style={styles.heroIcon}>
  
//                   <Text style={styles.heroIconText}>
//                     ↻
//                   </Text>
  
//                 </View>
  
//                 <View style={styles.heroContent}>
  
//                   <Text style={styles.heroTitle}>
//                     Find a Replacement
//                   </Text>
  
//                   <Text style={styles.heroSubtitle}>
//                     Choose a cleaner for your updated
//                     cleaning date.
//                   </Text>
  
//                 </View>
  
//               </View>
  
  
//               {/* ---------------------------------------------
//                   Booking information
//               --------------------------------------------- */}
  
//               <View style={styles.bookingCard}>
  
//                 <View style={styles.bookingHeader}>
  
//                   <View style={styles.propertyIcon}>
//                     <Text style={styles.propertyIconText}>
//                       ⌂
//                     </Text>
//                   </View>
  
//                   <View style={styles.propertyInfo}>
  
//                     <Text style={styles.propertyName}>
//                       {data.propertyName}
//                     </Text>
  
//                     <Text style={styles.groupLabel}>
//                       {formatGroup(data.group)}
//                     </Text>
  
//                   </View>
  
//                 </View>
  
  
//                 <Divider style={styles.bookingDivider} />
  
  
//                 <View style={styles.bookingDetails}>
  
//                   <View style={styles.detailItem}>
  
//                     <Text style={styles.detailLabel}>
//                       ORIGINAL DATE
//                     </Text>
  
//                     <Text style={styles.detailValueMuted}>
//                       {formatDate(
//                         data.oldCleaningDate
//                       )}
//                     </Text>
  
//                   </View>
  
  
//                   <View style={styles.arrowContainer}>
//                     <Text style={styles.arrow}>
//                       →
//                     </Text>
//                   </View>
  
  
//                   <View style={styles.detailItem}>
  
//                     <Text style={styles.detailLabel}>
//                       NEW DATE
//                     </Text>
  
//                     <Text style={styles.detailValue}>
//                       {formatDate(
//                         data.newCleaningDate
//                       )}
//                     </Text>
  
//                   </View>
  
  
//                   <View style={styles.timeContainer}>
  
//                     <Text style={styles.detailLabel}>
//                       TIME
//                     </Text>
  
//                     <Text style={styles.detailValue}>
//                       {formatTime(
//                         data.cleaningTime
//                       )}
//                     </Text>
  
//                   </View>
  
//                 </View>
  
//               </View>
  
  
//               {/* ---------------------------------------------
//                   Original cleaner notice
//               --------------------------------------------- */}
  
//               {data.unavailableCleaner && (
  
//                 <View style={styles.noticeCard}>
  
//                   <View style={styles.noticeIcon}>
//                     <Text style={styles.noticeIconText}>
//                       !
//                     </Text>
//                   </View>
  
//                   <View style={styles.noticeContent}>
  
//                     <Text style={styles.noticeTitle}>
//                       Original cleaner unavailable
//                     </Text>
  
//                     <Text style={styles.noticeText}>
//                       {data.unavailableCleaner.name}
//                       {' '}is unavailable for the
//                       updated date. Select an available
//                       replacement below.
//                     </Text>
  
//                   </View>
  
//                 </View>
  
//               )}
  
  
//               {/* ---------------------------------------------
//                   Response summary
//               --------------------------------------------- */}
  
//               <View style={styles.summarySection}>
  
//                 <View>
  
//                   <Text style={styles.sectionTitle}>
//                     Cleaner Responses
//                   </Text>
  
//                   <Text style={styles.sectionSubtitle}>
//                     Select one cleaner after they accept.
//                   </Text>
  
//                 </View>
  
  
//                 <View style={styles.responseCount}>
  
//                   <Text style={styles.responseCountNumber}>
//                     {data.requestCount}
//                   </Text>
  
//                   <Text style={styles.responseCountLabel}>
//                     REQUESTS
//                   </Text>
  
//                 </View>
  
//               </View>
  
  
//               {/* ---------------------------------------------
//                   Response stats
//               --------------------------------------------- */}
  
//               <View style={styles.statsRow}>
  
//                 <View style={styles.statCard}>
  
//                   <Text style={[
//                     styles.statNumber,
//                     styles.pendingNumber,
//                   ]}>
//                     {data.pendingCount}
//                   </Text>
  
//                   <Text style={styles.statLabel}>
//                     Waiting
//                   </Text>
  
//                 </View>
  
  
//                 <View style={styles.statCard}>
  
//                   <Text style={[
//                     styles.statNumber,
//                     styles.acceptedNumber,
//                   ]}>
//                     {data.acceptedCount}
//                   </Text>
  
//                   <Text style={styles.statLabel}>
//                     Available
//                   </Text>
  
//                 </View>
  
  
//                 <View style={styles.statCard}>
  
//                   <Text style={[
//                     styles.statNumber,
//                     styles.declinedNumber,
//                   ]}>
//                     {data.declinedCount}
//                   </Text>
  
//                   <Text style={styles.statLabel}>
//                     Declined
//                   </Text>
  
//                 </View>
  
//               </View>
  
  
//               <Text style={styles.listHeader}>
//                 Replacement Cleaners
//               </Text>
  
//             </View>
//           }
  
  
//           // =================================================
//           // FOOTER
//           // =================================================
  
//           ListFooterComponent={
  
//             <View style={styles.footer}>
  
//               {selectedCleaner && (
  
//                 <View style={styles.selectedContainer}>
  
//                   <View style={styles.selectedCheck}>
  
//                     <Text style={styles.selectedCheckText}>
//                       ✓
//                     </Text>
  
//                   </View>
  
//                   <View style={styles.selectedInfo}>
  
//                     <Text style={styles.selectedLabel}>
//                       SELECTED CLEANER
//                     </Text>
  
//                     <Text style={styles.selectedName}>
//                       {selectedCleaner.cleanerName}
//                     </Text>
  
//                   </View>
  
//                 </View>
  
//               )}
  
  
//               {!selectedCleaner &&
//                 data.acceptedCount > 0 && (
  
//                   <Text style={styles.selectionHint}>
//                     Tap an available cleaner above
//                     to select them.
//                   </Text>
  
//                 )}
  
  
//               {data.pendingCount > 0 && (
//                 <View style={styles.refreshNotice}>
  
//                   <ActivityIndicator
//                     size="small"
//                   />
  
//                   <Text style={styles.refreshText}>
//                     Waiting for cleaner responses...
//                   </Text>
  
//                 </View>
//               )}
  
  
//               {/* <Button
//                 mode="contained"
//                 onPress={handleContinue}
//                 disabled={
//                   !selectedCleaner
//                 }
//                 style={[
//                   styles.continueButton,
//                   !selectedCleaner &&
//                     styles.disabledButton,
//                 ]}
//                 contentStyle={
//                   styles.continueButtonContent
//                 }
//                 labelStyle={
//                   styles.continueButtonLabel
//                 }
//               >
//                 Continue
//               </Button> */}

//               <Button
//                 mode="contained"
//                 onPress={handleContinue}
//                 disabled={
//                   !selectedCleaner &&
//                   data?.status !== 'payment_required'
//                 }
//                 style={[
//                   styles.continueButton,
//                   !selectedCleaner &&
//                     data?.status !== 'payment_required' &&
//                     styles.disabledButton,
//                 ]}
//                 contentStyle={
//                   styles.continueButtonContent
//                 }
//                 labelStyle={
//                   styles.continueButtonLabel
//                 }

//               >

//               {data?.status === 'payment_required'

//                 ? 'Complete Replacement Payment'

//                 : 'Continue'}

//               </Button>
  
  
//               <Text style={styles.footerNote}>
//                 You can only select a cleaner who has
//                 accepted the replacement request.
//               </Text>
  
//             </View>
//           }
  
//           contentContainerStyle={
//             styles.listContent
//           }
//         />
  
//       </SafeAreaView>
//     );
//   };
  
  
//   // =========================================================
//   // Styles
//   // =========================================================
  
//   const styles = StyleSheet.create({
  
//     safeArea: {
//       flex: 1,
//       backgroundColor: '#F8FAFC',
//     },
  
//     listContent: {
//       paddingBottom: 30,
//     },
  
  
//     // =======================================================
//     // Loading
//     // =======================================================
  
//     loadingContainer: {
//       flex: 1,
//       alignItems: 'center',
//       justifyContent: 'center',
//       paddingHorizontal: 30,
//     },
  
//     loadingTitle: {
//       marginTop: 18,
//       fontSize: 18,
//       fontWeight: '700',
//     },
  
//     loadingSubtitle: {
//       marginTop: 6,
//       fontSize: 14,
//       textAlign: 'center',
//       opacity: 0.55,
//     },
  
  
//     // =======================================================
//     // Empty
//     // =======================================================
  
//     emptyContainer: {
//       flex: 1,
//       alignItems: 'center',
//       justifyContent: 'center',
//       paddingHorizontal: 30,
//     },
  
//     emptyTitle: {
//       fontSize: 20,
//       fontWeight: '700',
//     },
  
//     emptySubtitle: {
//       fontSize: 14,
//       textAlign: 'center',
//       marginVertical: 10,
//       opacity: 0.6,
//     },
  
  
//     // =======================================================
//     // Hero
//     // =======================================================
  
//     hero: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       paddingHorizontal: 20,
//       paddingTop: 18,
//       paddingBottom: 20,
//     },
  
//     heroIcon: {
//       width: 52,
//       height: 52,
//       borderRadius: 18,
//       backgroundColor: '#EAF2FF',
//       alignItems: 'center',
//       justifyContent: 'center',
//       marginRight: 14,
//     },
  
//     heroIconText: {
//       fontSize: 27,
//       fontWeight: '700',
//     },
  
//     heroContent: {
//       flex: 1,
//     },
  
//     heroTitle: {
//       fontSize: 24,
//       fontWeight: '800',
//       letterSpacing: -0.5,
//     },
  
//     heroSubtitle: {
//       marginTop: 4,
//       fontSize: 14,
//       lineHeight: 20,
//       opacity: 0.6,
//     },
  
  
//     // =======================================================
//     // Booking
//     // =======================================================
  
//     bookingCard: {
//       marginHorizontal: 16,
//       backgroundColor: '#FFFFFF',
//       borderRadius: 18,
//       padding: 18,
  
//       shadowOffset: {
//         width: 0,
//         height: 4,
//       },
  
//       shadowOpacity: 0.06,
//       shadowRadius: 12,
  
//       elevation: 2,
//     },
  
//     bookingHeader: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },
  
//     propertyIcon: {
//       width: 46,
//       height: 46,
//       borderRadius: 14,
//       backgroundColor: '#F1F5F9',
//       alignItems: 'center',
//       justifyContent: 'center',
//     },
  
//     propertyIconText: {
//       fontSize: 24,
//     },
  
//     propertyInfo: {
//       flex: 1,
//       marginLeft: 12,
//     },
  
//     propertyName: {
//       fontSize: 17,
//       fontWeight: '750',
//     },
  
//     groupLabel: {
//       fontSize: 13,
//       marginTop: 3,
//       opacity: 0.55,
//     },
  
//     bookingDivider: {
//       marginVertical: 16,
//     },
  
//     bookingDetails: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },
  
//     detailItem: {
//       flex: 1,
//     },
  
//     detailLabel: {
//       fontSize: 9,
//       fontWeight: '800',
//       letterSpacing: 0.7,
//       opacity: 0.45,
//       marginBottom: 5,
//     },
  
//     detailValue: {
//       fontSize: 14,
//       fontWeight: '700',
//     },
  
//     detailValueMuted: {
//       fontSize: 14,
//       fontWeight: '600',
//       opacity: 0.55,
//     },
  
//     arrowContainer: {
//       paddingHorizontal: 7,
//     },
  
//     arrow: {
//       fontSize: 18,
//       opacity: 0.35,
//     },
  
//     timeContainer: {
//       flex: 0.8,
//       paddingLeft: 10,
//     },
  
  
//     // =======================================================
//     // Notice
//     // =======================================================
  
//     noticeCard: {
//       marginHorizontal: 16,
//       marginTop: 14,
//       padding: 14,
//       borderRadius: 16,
//       backgroundColor: '#FFF8E7',
//       flexDirection: 'row',
//       alignItems: 'flex-start',
//     },
  
//     noticeIcon: {
//       width: 30,
//       height: 30,
//       borderRadius: 10,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: '#FFE8A3',
//     },
  
//     noticeIconText: {
//       fontSize: 16,
//       fontWeight: '800',
//     },
  
//     noticeContent: {
//       flex: 1,
//       marginLeft: 11,
//     },
  
//     noticeTitle: {
//       fontSize: 14,
//       fontWeight: '750',
//     },
  
//     noticeText: {
//       fontSize: 13,
//       lineHeight: 19,
//       marginTop: 3,
//       opacity: 0.65,
//     },
  
  
//     // =======================================================
//     // Summary
//     // =======================================================
  
//     summarySection: {
//       marginTop: 25,
//       marginHorizontal: 16,
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//     },
  
//     sectionTitle: {
//       fontSize: 18,
//       fontWeight: '800',
//     },
  
//     sectionSubtitle: {
//       fontSize: 12,
//       marginTop: 4,
//       opacity: 0.5,
//     },
  
//     responseCount: {
//       alignItems: 'flex-end',
//     },
  
//     responseCountNumber: {
//       fontSize: 20,
//       fontWeight: '800',
//     },
  
//     responseCountLabel: {
//       fontSize: 8,
//       fontWeight: '800',
//       letterSpacing: 0.8,
//       opacity: 0.4,
//     },
  
  
//     // =======================================================
//     // Stats
//     // =======================================================
  
//     statsRow: {
//       flexDirection: 'row',
//       marginHorizontal: 16,
//       marginTop: 14,
//       gap: 9,
//     },
  
//     statCard: {
//       flex: 1,
//       backgroundColor: '#FFFFFF',
//       borderRadius: 14,
//       paddingVertical: 13,
//       alignItems: 'center',
//     },
  
//     statNumber: {
//       fontSize: 21,
//       fontWeight: '800',
//     },
  
//     pendingNumber: {
//       opacity: 0.65,
//     },
  
//     acceptedNumber: {
//       opacity: 0.8,
//     },
  
//     declinedNumber: {
//       opacity: 0.55,
//     },
  
//     statLabel: {
//       fontSize: 11,
//       marginTop: 3,
//       opacity: 0.5,
//     },
  
  
//     // =======================================================
//     // Cleaner list
//     // =======================================================
  
//     listHeader: {
//       marginHorizontal: 16,
//       marginTop: 25,
//       marginBottom: 11,
//       fontSize: 17,
//       fontWeight: '800',
//     },
  
//     cleanerCard: {
//       marginHorizontal: 16,
//       marginBottom: 10,
//       padding: 13,
//       borderRadius: 16,
//       backgroundColor: '#FFFFFF',
//       flexDirection: 'row',
//       alignItems: 'center',
  
//       shadowOffset: {
//         width: 0,
//         height: 2,
//       },
  
//       shadowOpacity: 0.035,
//       shadowRadius: 8,
  
//       elevation: 1,
//     },
  
//     selectedCleanerCard: {
//       borderWidth: 2,
//     },
  
//     declinedCleanerCard: {
//       opacity: 0.65,
//     },
  
//     avatar: {
//       width: 48,
//       height: 48,
//       borderRadius: 15,
//       backgroundColor: '#EEF2F7',
//       alignItems: 'center',
//       justifyContent: 'center',
//     },
  
//     avatarText: {
//       fontSize: 15,
//       fontWeight: '800',
//       opacity: 0.65,
//     },
  
//     cleanerContent: {
//       flex: 1,
//       marginLeft: 12,
//     },
  
//     cleanerTopRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },
  
//     cleanerName: {
//       flex: 1,
//       fontSize: 15,
//       fontWeight: '750',
//       marginRight: 7,
//     },
  
//     cleanerGroup: {
//       fontSize: 12,
//       marginTop: 3,
//       opacity: 0.5,
//     },
  
//     availableMessage: {
//       fontSize: 11,
//       marginTop: 5,
//       opacity: 0.6,
//     },
  
//     waitingMessage: {
//       fontSize: 11,
//       marginTop: 5,
//       opacity: 0.5,
//     },
  
//     declinedMessage: {
//       fontSize: 11,
//       marginTop: 5,
//       opacity: 0.5,
//     },
  
  
//     // =======================================================
//     // Status pills
//     // =======================================================
  
//     statusPill: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       paddingHorizontal: 8,
//       paddingVertical: 5,
//       borderRadius: 20,
//     },
  
//     pendingPill: {
//       backgroundColor: '#F1F3F5',
//     },
  
//     acceptedPill: {
//       backgroundColor: '#EDF7F0',
//     },
  
//     declinedPill: {
//       backgroundColor: '#F6F0F0',
//     },
  
//     statusDot: {
//       width: 6,
//       height: 6,
//       borderRadius: 3,
//       marginRight: 5,
//     },
  
//     pendingDot: {
//       backgroundColor: '#999999',
//     },
  
//     acceptedDot: {
//       backgroundColor: '#4D9A61',
//     },
  
//     declinedDot: {
//       backgroundColor: '#B46A6A',
//     },
  
//     statusText: {
//       fontSize: 10,
//       fontWeight: '700',
//     },
  
//     pendingText: {
//       opacity: 0.6,
//     },
  
//     acceptedText: {
//       opacity: 0.8,
//     },
  
//     declinedText: {
//       opacity: 0.7,
//     },
  
  
//     // =======================================================
//     // Footer
//     // =======================================================
  
//     footer: {
//       paddingHorizontal: 16,
//       paddingTop: 8,
//     },
  
//     selectedContainer: {
//       backgroundColor: '#FFFFFF',
//       borderRadius: 16,
//       padding: 13,
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginBottom: 12,
//     },
  
//     selectedCheck: {
//       width: 38,
//       height: 38,
//       borderRadius: 12,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: '#EAF4EC',
//     },
  
//     selectedCheckText: {
//       fontSize: 19,
//       fontWeight: '800',
//       opacity: 0.75,
//     },
  
//     selectedInfo: {
//       marginLeft: 11,
//     },
  
//     selectedLabel: {
//       fontSize: 8,
//       fontWeight: '800',
//       letterSpacing: 0.8,
//       opacity: 0.45,
//     },
  
//     selectedName: {
//       fontSize: 15,
//       fontWeight: '750',
//       marginTop: 2,
//     },
  
//     selectionHint: {
//       textAlign: 'center',
//       fontSize: 12,
//       opacity: 0.5,
//       marginBottom: 10,
//     },
  
//     refreshNotice: {
//       flexDirection: 'row',
//       justifyContent: 'center',
//       alignItems: 'center',
//       marginBottom: 12,
//       gap: 7,
//     },
  
//     refreshText: {
//       fontSize: 12,
//       opacity: 0.5,
//     },
  
//     continueButton: {
//       borderRadius: 13,
//       backgroundColor:COLORS.dark
//     },
  
//     disabledButton: {
//       opacity: 0.45,
//     },
  
//     continueButtonContent: {
//       height: 52,
//     },
  
//     continueButtonLabel: {
//       fontSize: 15,
//       fontWeight: '700',
//     },
  
//     footerNote: {
//       textAlign: 'center',
//       fontSize: 10,
//       lineHeight: 15,
//       marginTop: 10,
//       opacity: 0.4,
//       paddingHorizontal: 20,
//     },
  
//   });
  
//   export default ReplacementRequestStatus;











// import React, {
//   useCallback,
//   useEffect,
//   useState,
// } from 'react';

// import {
//   ActivityIndicator,
//   Alert,
//   RefreshControl,
//   ScrollView,
//   StyleSheet,
//   View,
// } from 'react-native';

// import {
//   Button,
//   Divider,
//   Icon,
// } from 'react-native-paper';

// import {
//   useFocusEffect,
//   useNavigation,
//   useRoute,
// } from '@react-navigation/native';

// import userService from '../../services/connection/userService';
// import { ROUTES } from '../../constants/routes';
// import { useTheme } from '../../theme';
// import { AppText, AppCard } from '../../ui';


// const REFRESH_INTERVAL = 10000;


// const getStatusColor = (status, theme) => {
//   switch (String(status || '').toLowerCase()) {
//     case 'accepted':
//     case 'available':
//     case 'selected':
//     case 'completed':
//       return theme.status?.success || '#2E7D32';

//     case 'declined':
//     case 'unavailable':
//     case 'cancelled':
//     case 'failed':
//       return theme.status?.error || '#D32F2F';

//     case 'pending':
//     case 'waiting':
//     case 'notified':
//     case 'payment_required':
//       return theme.status?.warning || '#ED8B00';

//     default:
//       return theme.text.secondary;
//   }
// };


// const formatStatus = (status) => {
//   if (!status) {
//     return 'Pending';
//   }

//   return String(status)
//     .replace(/_/g, ' ')
//     .replace(/\b\w/g, (character) => character.toUpperCase());
// };


// const getErrorMessage = (error) => {
//   return (
//     error?.response?.data?.detail ||
//     error?.response?.data?.message ||
//     error?.message ||
//     'Something went wrong. Please try again.'
//   );
// };


// const normalizeResponse = (response) => {
//   if (!response) {
//     return {};
//   }

//   return response.data ?? response;
// };


// const ReplacementRequestStatus = () => {
//   const navigation = useNavigation();
//   const route = useRoute();

//   const { theme, isDark } = useTheme();

//   const {
//     scheduleId,
//     requestId,
//     replacementRequestId,
//   } = route.params || {};

//   const effectiveRequestId =
//     requestId || replacementRequestId;

//   const [requestData, setRequestData] = useState(null);
//   const [cleaners, setCleaners] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [selectingCleanerId, setSelectingCleanerId] = useState(null);

//   const [errorMessage, setErrorMessage] = useState('');

//   const styles = createStyles(theme, isDark);


//   /**
//    * Fetch the latest replacement request status.
//    *
//    * This function is used for:
//    * - Initial loading.
//    * - Pull-to-refresh.
//    * - Screen focus.
//    * - Automatic status refresh.
//    */
//   const fetchReplacementStatus = useCallback(
//     async (showLoader = false) => {
//       if (!scheduleId || !effectiveRequestId) {
//         setErrorMessage(
//           'The replacement request information is incomplete.'
//         );
//         setLoading(false);
//         setRefreshing(false);
//         return;
//       }

//       if (showLoader) {
//         setLoading(true);
//       }

//       try {
//         setErrorMessage('');

//         const response =
//           await userService.getReplacementRequestStatus(
//             scheduleId,
//             effectiveRequestId
//           );

//         const data = normalizeResponse(response);

//         setRequestData(data);

//         /*
//          * Accept the cleaner list from the replacement-status
//          * response while preserving the complete request object.
//          *
//          * Adjust these aliases if your backend uses a different
//          * canonical field for the candidate cleaner list.
//          */
//         const cleanerList =
//           data.cleaners ??
//           data.available_cleaners ??
//           data.replacement_cleaners ??
//           data.candidates ??
//           [];

//         setCleaners(
//           Array.isArray(cleanerList) ? cleanerList : []
//         );
//       } catch (error) {
//         console.error(
//           'Error fetching replacement request status:',
//           error?.response?.data || error
//         );

//         setErrorMessage(getErrorMessage(error));
//       } finally {
//         setLoading(false);
//         setRefreshing(false);
//       }
//     },
//     [scheduleId, effectiveRequestId]
//   );


//   /**
//    * Refresh the request whenever this screen becomes active.
//    */
//   useFocusEffect(
//     useCallback(() => {
//       fetchReplacementStatus(true);
//     }, [fetchReplacementStatus])
//   );


//   /**
//    * Automatically refresh the request while this screen is open.
//    */
//   useEffect(() => {
//     const interval = setInterval(() => {
//       fetchReplacementStatus(false);
//     }, REFRESH_INTERVAL);

//     return () => clearInterval(interval);
//   }, [fetchReplacementStatus]);


//   /**
//    * Pull-to-refresh handler.
//    */
//   const handleRefresh = useCallback(() => {
//     setRefreshing(true);
//     fetchReplacementStatus(false);
//   }, [fetchReplacementStatus]);


//   /**
//    * Select a replacement cleaner.
//    *
//    * The backend remains responsible for validating the replacement
//    * request and determining whether the cleaner can be selected.
//    */
//   const handleSelectCleaner = useCallback(
//     async (cleaner) => {
//       const cleanerId =
//         cleaner?.cleanerId ??
//         cleaner?.cleaner_id ??
//         cleaner?._id ??
//         cleaner?.id;

//       if (!cleanerId) {
//         Alert.alert(
//           'Unable to select cleaner',
//           'The selected cleaner does not have a valid ID.'
//         );
//         return;
//       }

//       if (!scheduleId || !effectiveRequestId) {
//         Alert.alert(
//           'Unable to select cleaner',
//           'The replacement request information is incomplete.'
//         );
//         return;
//       }

//       Alert.alert(
//         'Confirm Replacement',
//         `Would you like to select ${
//           cleaner.name ||
//           cleaner.fullName ||
//           cleaner.firstName ||
//           'this cleaner'
//         } for this cleaning request?`,
//         [
//           {
//             text: 'Cancel',
//             style: 'cancel',
//           },
//           {
//             text: 'Confirm',
//             onPress: async () => {
//               try {
//                 setSelectingCleanerId(String(cleanerId));

//                 /*
//                  * Keep the API method and its argument order
//                  * consistent with your userService implementation.
//                  */
//                 const response =
//                   await userService.selectReplacementCleaner(
//                     scheduleId,
//                     effectiveRequestId,
//                     cleanerId
//                   );

//                 const result = normalizeResponse(response);

//                 /*
//                  * Refresh the backend state before proceeding.
//                  */
//                 await fetchReplacementStatus(false);

//                 /*
//                  * A payment step may be required after the cleaner
//                  * has been selected.
//                  *
//                  * Only navigate to payment when the backend confirms
//                  * that payment is required.
//                  */
//                 const status = String(
//                   result.status ??
//                   result.request_status ??
//                   result.replacement_status ??
//                   ''
//                 ).toLowerCase();

//                 const paymentRequired =
//                   result.payment_required === true ||
//                   result.requires_payment === true ||
//                   status === 'payment_required';

//                 if (paymentRequired) {
//                   navigation.navigate(
//                     ROUTES?.REPLACEMENT_PAYMENT ||
//                     'ReplacementPayment',
//                     {
//                       scheduleId,
//                       requestId: effectiveRequestId,
//                       replacementRequestId: effectiveRequestId,
//                       cleanerId,
//                       cleaner,
//                       replacementRequest: result,
//                     }
//                   );

//                   return;
//                 }

//                 Alert.alert(
//                   'Replacement Updated',
//                   'The replacement request has been updated successfully.'
//                 );
//               } catch (error) {
//                 console.error(
//                   'Error selecting replacement cleaner:',
//                   error?.response?.data || error
//                 );

//                 Alert.alert(
//                   'Selection Failed',
//                   getErrorMessage(error)
//                 );
//               } finally {
//                 setSelectingCleanerId(null);
//               }
//             },
//           },
//         ]
//       );
//     },
//     [
//       scheduleId,
//       effectiveRequestId,
//       fetchReplacementStatus,
//       navigation,
//     ]
//   );


//   /**
//    * Derive request-level status information.
//    */
//   const requestStatus =
//     requestData?.status ??
//     requestData?.request_status ??
//     requestData?.replacement_status ??
//     'pending';

//   const normalizedStatus = String(requestStatus).toLowerCase();

//   const requestIsComplete = [
//     'completed',
//     'selected',
//     'accepted',
//   ].includes(normalizedStatus);

//   const paymentIsRequired =
//     normalizedStatus === 'payment_required' ||
//     requestData?.payment_required === true ||
//     requestData?.requires_payment === true;

//   const requestIsUnavailable = [
//     'unavailable',
//     'failed',
//     'cancelled',
//     'expired',
//   ].includes(normalizedStatus);


//   /**
//    * Render the request status banner.
//    */
//   const renderRequestStatus = () => (
//     <AppCard
//       variant="default"
//       padding="medium"
//       radius="large"
//       bordered
//       style={styles.statusCard}
//     >
//       <View style={styles.statusHeader}>
//         <View style={styles.statusIconContainer}>
//           <Icon
//             source={
//               requestIsComplete
//                 ? 'check-circle-outline'
//                 : requestIsUnavailable
//                   ? 'alert-circle-outline'
//                   : 'account-clock-outline'
//             }
//             size={28}
//             color={getStatusColor(requestStatus, theme)}
//           />
//         </View>

//         <View style={styles.statusHeaderText}>
//           <AppText
//             variant="title"
//             weight="semibold"
//             color={theme.text.primary}
//           >
//             Replacement Request
//           </AppText>

//           <AppText
//             variant="body"
//             color={theme.text.secondary}
//           >
//             Track your replacement cleaner request.
//           </AppText>
//         </View>
//       </View>

//       <Divider
//         style={styles.divider}
//         theme={undefined}
//       />

//       <View style={styles.statusRow}>
//         <AppText
//           variant="body"
//           color={theme.text.secondary}
//         >
//           Current status
//         </AppText>

//         <View
//           style={[
//             styles.statusBadge,
//             {
//               backgroundColor: getStatusColor(
//                 requestStatus,
//                 theme
//               ) + '20',
//             },
//           ]}
//         >
//           <AppText
//             variant="label"
//             weight="semibold"
//             color={getStatusColor(requestStatus, theme)}
//           >
//             {formatStatus(requestStatus)}
//           </AppText>
//         </View>
//       </View>

//       {requestData?.message ? (
//         <AppText
//           variant="body"
//           color={theme.text.secondary}
//           style={styles.statusMessage}
//         >
//           {requestData.message}
//         </AppText>
//       ) : null}

//       {paymentIsRequired ? (
//         <View style={styles.noticeContainer}>
//           <Icon
//             source="credit-card-outline"
//             size={20}
//             color={theme.brand.primary}
//           />

//           <View style={styles.noticeText}>
//             <AppText
//               variant="body"
//               weight="semibold"
//               color={theme.text.primary}
//             >
//               Payment required
//             </AppText>

//             <AppText
//               variant="body"
//               color={theme.text.secondary}
//             >
//               The replacement has reached the payment stage.
//             </AppText>
//           </View>
//         </View>
//       ) : null}

//       {requestIsUnavailable ? (
//         <AppText
//           variant="body"
//           color={getStatusColor(requestStatus, theme)}
//           style={styles.statusMessage}
//         >
//           No replacement is currently confirmed for this request.
//         </AppText>
//       ) : null}
//     </AppCard>
//   );


//   /**
//    * Render a cleaner option.
//    */
//   const renderCleaner = (cleaner, index) => {
//     const cleanerId =
//       cleaner?.cleanerId ??
//       cleaner?.cleaner_id ??
//       cleaner?._id ??
//       cleaner?.id;

//     const cleanerName =
//       cleaner?.name ||
//       cleaner?.fullName ||
//       [
//         cleaner?.firstName,
//         cleaner?.lastName,
//       ].filter(Boolean).join(' ') ||
//       'Available Cleaner';

//     const cleanerStatus =
//       cleaner?.status ||
//       cleaner?.availability_status ||
//       'available';

//     const isSelecting =
//       selectingCleanerId !== null &&
//       String(selectingCleanerId) === String(cleanerId);

//     const unavailable = [
//       'unavailable',
//       'declined',
//       'cancelled',
//     ].includes(String(cleanerStatus).toLowerCase());

//     return (
//       <AppCard
//         key={String(cleanerId || index)}
//         variant="default"
//         padding="medium"
//         radius="large"
//         bordered
//         style={styles.cleanerCard}
//       >
//         <View style={styles.cleanerHeader}>
//           <View style={styles.cleanerAvatar}>
//             <Icon
//               source="account-outline"
//               size={30}
//               color={theme.brand.primary}
//             />
//           </View>

//           <View style={styles.cleanerInfo}>
//             <AppText
//               variant="subtitle"
//               weight="semibold"
//               color={theme.text.primary}
//             >
//               {cleanerName}
//             </AppText>

//             {cleaner?.rating !== undefined &&
//             cleaner?.rating !== null ? (
//               <View style={styles.ratingRow}>
//                 <Icon
//                   source="star"
//                   size={16}
//                   color={theme.status?.warning || '#ED8B00'}
//                 />

//                 <AppText
//                   variant="body"
//                   color={theme.text.secondary}
//                 >
//                   {Number(cleaner.rating).toFixed(1)}
//                 </AppText>
//               </View>
//             ) : null}

//             {cleaner?.distance !== undefined &&
//             cleaner?.distance !== null ? (
//               <AppText
//                 variant="caption"
//                 color={theme.text.secondary}
//               >
//                 {cleaner.distance} miles away
//               </AppText>
//             ) : null}
//           </View>
//         </View>

//         <View style={styles.cleanerStatusRow}>
//           <AppText
//             variant="body"
//             color={theme.text.secondary}
//           >
//             Availability
//           </AppText>

//           <AppText
//             variant="label"
//             weight="semibold"
//             color={getStatusColor(cleanerStatus, theme)}
//           >
//             {formatStatus(cleanerStatus)}
//           </AppText>
//         </View>

//         {cleaner?.bio ? (
//           <AppText
//             variant="body"
//             color={theme.text.secondary}
//             style={styles.cleanerBio}
//           >
//             {cleaner.bio}
//           </AppText>
//         ) : null}

//         <Button
//           mode="contained"
//           onPress={() => handleSelectCleaner(cleaner)}
//           disabled={
//             isSelecting ||
//             selectingCleanerId !== null ||
//             unavailable ||
//             !cleanerId
//           }
//           loading={isSelecting}
//           buttonColor={theme.brand.primary}
//           textColor={theme.text.onBrand || '#FFFFFF'}
//           style={styles.selectButton}
//           contentStyle={styles.buttonContent}
//         >
//           {isSelecting ? 'Selecting...' : 'Select Cleaner'}
//         </Button>
//       </AppCard>
//     );
//   };


//   /**
//    * Main screen.
//    */
//   if (loading) {
//     return (
//       <View style={styles.centerContainer}>
//         <ActivityIndicator
//           size="large"
//           color={theme.brand.primary}
//         />

//         <AppText
//           variant="body"
//           color={theme.text.secondary}
//           style={styles.loadingText}
//         >
//           Loading replacement request...
//         </AppText>
//       </View>
//     );
//   }


//   return (
//     <View style={styles.container}>
//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={handleRefresh}
//             tintColor={theme.brand.primary}
//             colors={[theme.brand.primary]}
//           />
//         }
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={styles.pageHeader}>
//           <AppText
//             variant="heading"
//             weight="bold"
//             color={theme.text.primary}
//           >
//             Replacement Status
//           </AppText>

//           <AppText
//             variant="body"
//             color={theme.text.secondary}
//             style={styles.pageSubtitle}
//           >
//             Follow the progress of your replacement cleaner request.
//           </AppText>
//         </View>

//         {errorMessage ? (
//           <AppCard
//             variant="default"
//             padding="medium"
//             radius="large"
//             bordered
//             style={styles.errorCard}
//           >
//             <View style={styles.errorHeader}>
//               <Icon
//                 source="alert-circle-outline"
//                 size={24}
//                 color={theme.status?.error || '#D32F2F'}
//               />

//               <AppText
//                 variant="subtitle"
//                 weight="semibold"
//                 color={theme.text.primary}
//               >
//                 Unable to refresh request
//               </AppText>
//             </View>

//             <AppText
//               variant="body"
//               color={theme.text.secondary}
//               style={styles.errorMessage}
//             >
//               {errorMessage}
//             </AppText>

//             <Button
//               mode="outlined"
//               onPress={() => fetchReplacementStatus(true)}
//               textColor={theme.brand.primary}
//               style={styles.retryButton}
//             >
//               Try Again
//             </Button>
//           </AppCard>
//         ) : null}

//         {requestData ? renderRequestStatus() : null}

//         <View style={styles.sectionHeader}>
//           <AppText
//             variant="title"
//             weight="semibold"
//             color={theme.text.primary}
//           >
//             Available Replacement Cleaners
//           </AppText>

//           <AppText
//             variant="body"
//             color={theme.text.secondary}
//             style={styles.sectionSubtitle}
//           >
//             Select a suitable cleaner if replacement options are available.
//           </AppText>
//         </View>

//         {cleaners.length > 0 ? (
//           cleaners.map(renderCleaner)
//         ) : (
//           <AppCard
//             variant="default"
//             padding="large"
//             radius="large"
//             bordered
//             style={styles.emptyCard}
//           >
//             <View style={styles.emptyIconContainer}>
//               <Icon
//                 source="account-search-outline"
//                 size={42}
//                 color={theme.text.secondary}
//               />
//             </View>

//             <AppText
//               variant="subtitle"
//               weight="semibold"
//               color={theme.text.primary}
//               align="center"
//             >
//               No replacement cleaners available yet
//             </AppText>

//             <AppText
//               variant="body"
//               color={theme.text.secondary}
//               align="center"
//               style={styles.emptyDescription}
//             >
//               We are waiting for replacement options. Pull down to refresh
//               the request status.
//             </AppText>

//             <Button
//               mode="outlined"
//               onPress={handleRefresh}
//               loading={refreshing}
//               disabled={refreshing}
//               textColor={theme.brand.primary}
//               style={styles.refreshButton}
//             >
//               Refresh Status
//             </Button>
//           </AppCard>
//         )}

//         <View style={styles.footer}>
//           <AppText
//             variant="caption"
//             color={theme.text.secondary}
//             align="center"
//           >
//             This screen refreshes automatically every 10 seconds.
//           </AppText>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };


// const createStyles = (theme, isDark) =>
//   StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: theme.background.default,
//     },

//     scrollContent: {
//       padding: 16,
//       paddingBottom: 32,
//     },

//     centerContainer: {
//       flex: 1,
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: 24,
//       backgroundColor: theme.background.default,
//     },

//     loadingText: {
//       marginTop: 14,
//       textAlign: 'center',
//     },

//     pageHeader: {
//       marginBottom: 20,
//     },

//     pageSubtitle: {
//       marginTop: 6,
//       lineHeight: 21,
//     },

//     statusCard: {
//       marginBottom: 24,
//       backgroundColor: theme.surface.default,
//       borderColor: theme.border.default,
//     },

//     statusHeader: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },

//     statusIconContainer: {
//       width: 48,
//       height: 48,
//       borderRadius: 24,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: theme.surface.elevated,
//       marginRight: 12,
//     },

//     statusHeaderText: {
//       flex: 1,
//     },

//     divider: {
//       marginVertical: 16,
//       backgroundColor: theme.border.default,
//     },

//     statusRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       flexWrap: 'wrap',
//       gap: 8,
//     },

//     statusBadge: {
//       paddingHorizontal: 12,
//       paddingVertical: 6,
//       borderRadius: 20,
//     },

//     statusMessage: {
//       marginTop: 12,
//       lineHeight: 21,
//     },

//     noticeContainer: {
//       flexDirection: 'row',
//       alignItems: 'flex-start',
//       marginTop: 16,
//       padding: 12,
//       borderRadius: 12,
//       backgroundColor: theme.surface.elevated,
//     },

//     noticeText: {
//       flex: 1,
//       marginLeft: 10,
//     },

//     sectionHeader: {
//       marginBottom: 14,
//     },

//     sectionSubtitle: {
//       marginTop: 6,
//       lineHeight: 21,
//     },

//     cleanerCard: {
//       marginBottom: 14,
//       backgroundColor: theme.surface.default,
//       borderColor: theme.border.default,
//     },

//     cleanerHeader: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },

//     cleanerAvatar: {
//       width: 52,
//       height: 52,
//       borderRadius: 26,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: theme.surface.elevated,
//       marginRight: 12,
//     },

//     cleanerInfo: {
//       flex: 1,
//     },

//     ratingRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginTop: 4,
//       gap: 4,
//     },

//     cleanerStatusRow: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       marginTop: 16,
//       paddingVertical: 12,
//       borderTopWidth: StyleSheet.hairlineWidth,
//       borderTopColor: theme.border.default,
//       borderBottomWidth: StyleSheet.hairlineWidth,
//       borderBottomColor: theme.border.default,
//     },

//     cleanerBio: {
//       marginTop: 12,
//       lineHeight: 21,
//     },

//     selectButton: {
//       marginTop: 16,
//       borderRadius: 10,
//     },

//     buttonContent: {
//       minHeight: 46,
//     },

//     errorCard: {
//       marginBottom: 20,
//       backgroundColor: theme.surface.default,
//       borderColor: theme.border.default,
//     },

//     errorHeader: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: 10,
//     },

//     errorMessage: {
//       marginTop: 10,
//       lineHeight: 21,
//     },

//     retryButton: {
//       marginTop: 14,
//       borderColor: theme.brand.primary,
//     },

//     emptyCard: {
//       alignItems: 'center',
//       backgroundColor: theme.surface.default,
//       borderColor: theme.border.default,
//     },

//     emptyIconContainer: {
//       width: 72,
//       height: 72,
//       borderRadius: 36,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: theme.surface.elevated,
//       marginBottom: 16,
//     },

//     emptyDescription: {
//       marginTop: 8,
//       lineHeight: 21,
//     },

//     refreshButton: {
//       marginTop: 18,
//       borderColor: theme.brand.primary,
//     },

//     footer: {
//       marginTop: 20,
//       paddingVertical: 8,
//     },
//   });


// export default ReplacementRequestStatus;