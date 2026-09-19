import React, {
    useCallback,
    useEffect,
    useState,
  } from 'react';
  
  import {
    View,
    Text,
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
    Button,
    Checkbox,
    Divider,
    IconButton,
  } from 'react-native-paper';
  
  import {
    useNavigation,
    useRoute,
    useFocusEffect,
  } from '@react-navigation/native';
  
  import moment from 'moment';
  
//   import userService from '../services/userService';
import userService from '../../services/connection/userService';
  
  
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
  
    // Prevent YYYY-MM-DD timezone shifting
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
  
  
  // =========================================================
  // Component
  // =========================================================
  
  const ReplacementRequestStatus = () => {
  
    const navigation = useNavigation();
    const route = useRoute();
  
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
  
    const [selectedCleaner, setSelectedCleaner] =
      useState(null);
  
  
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
  
          // Preserve host selection
          const previouslySelected =
            response.data?.requests?.find(
              item =>
                item.selectedByHost === true
            );
  
          if (previouslySelected) {
            setSelectedCleaner(
              previouslySelected
            );
          }
  
        } catch (error) {
  
          console.error(
            '❌ Failed to fetch replacement request status:',
            error
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
  
    const handleContinue = () => {
  
      if (!selectedCleaner) {
        Alert.alert(
          'Select a Cleaner',
          'Please select an accepted cleaner to continue.'
        );
  
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
            onPress: () => {
  
              // -------------------------------------------------
              // Payment/cancellation flow will be connected here.
              // -------------------------------------------------
  
              navigation.navigate(
                'ReplacementPayment',
                {
                  scheduleId,
                  requestId,
  
                  cleanerId:
                    selectedCleaner.cleanerId,
  
                  replacementRequestId:
                    selectedCleaner.requestId,
  
                  group:
                    selectedCleaner.group,
  
                  cleanerName:
                    selectedCleaner.cleanerName,
  
                  oldCleaningDate:
                    data.oldCleaningDate,
  
                  newCleaningDate:
                    data.newCleaningDate,
  
                  cleaningTime:
                    data.cleaningTime,
  
                  propertyName:
                    data.propertyName,
                }
              );
  
            },
          },
        ]
      );
    };
  
  
    // =======================================================
    // Status badge
    // =======================================================
  
    const renderStatus = (status) => {
  
      if (status === 'accepted') {
        return (
          <View style={[
            styles.statusPill,
            styles.acceptedPill,
          ]}>
            <View style={[
              styles.statusDot,
              styles.acceptedDot,
            ]} />
  
            <Text style={[
              styles.statusText,
              styles.acceptedText,
            ]}>
              Available
            </Text>
          </View>
        );
      }
  
  
      if (status === 'declined') {
        return (
          <View style={[
            styles.statusPill,
            styles.declinedPill,
          ]}>
            <View style={[
              styles.statusDot,
              styles.declinedDot,
            ]} />
  
            <Text style={[
              styles.statusText,
              styles.declinedText,
            ]}>
              Declined
            </Text>
          </View>
        );
      }
  
  
      return (
        <View style={[
          styles.statusPill,
          styles.pendingPill,
        ]}>
          <View style={[
            styles.statusDot,
            styles.pendingDot,
          ]} />
  
          <Text style={[
            styles.statusText,
            styles.pendingText,
          ]}>
            Waiting
          </Text>
        </View>
      );
    };
  
  
    // =======================================================
    // Cleaner card
    // =======================================================
  
    const renderCleaner = ({ item }) => {
  
      const isAccepted =
        item.status === 'accepted';
  
      const isSelected =
        selectedCleaner?.requestId ===
        item.requestId;
  
  
      return (
        <TouchableOpacity
          activeOpacity={isAccepted ? 0.75 : 1}
          onPress={() =>
            handleSelectCleaner(item)
          }
          disabled={!isAccepted}
        >
  
          <View
            style={[
              styles.cleanerCard,
  
              isSelected &&
                styles.selectedCleanerCard,
  
              item.status === 'declined' &&
                styles.declinedCleanerCard,
            ]}
          >
  
            {/* Avatar */}
  
            <View style={styles.avatar}>
  
              <Text style={styles.avatarText}>
                {getInitials(
                  item.firstname,
                  item.lastname
                )}
              </Text>
  
            </View>
  
  
            {/* Cleaner information */}
  
            <View style={styles.cleanerContent}>
  
              <View style={styles.cleanerTopRow}>
  
                <Text
                  style={styles.cleanerName}
                  numberOfLines={1}
                >
                  {item.cleanerName}
                </Text>
  
                {renderStatus(item.status)}
  
              </View>
  
  
              <Text style={styles.cleanerGroup}>
                {formatGroup(item.group)}
              </Text>
  
  
              {item.status === 'accepted' && (
  
                <Text style={styles.availableMessage}>
                  Available for the updated date
                </Text>
  
              )}
  
              {item.status === 'pending' && (
  
                <Text style={styles.waitingMessage}>
                  Waiting for cleaner response
                </Text>
  
              )}
  
              {item.status === 'declined' && (
  
                <Text style={styles.declinedMessage}>
                  Cleaner is unavailable
                </Text>
  
              )}
  
            </View>
  
  
            {/* Selection */}
  
            {isAccepted && (
  
              <Checkbox
                status={
                  isSelected
                    ? 'checked'
                    : 'unchecked'
                }
                onPress={() =>
                  handleSelectCleaner(item)
                }
              />
  
            )}
  
          </View>
  
        </TouchableOpacity>
      );
    };
  
  
    // =======================================================
    // Loading
    // =======================================================
  
    if (loading && !data) {
  
      return (
        <SafeAreaView style={styles.safeArea}>
  
          <StatusBar barStyle="dark-content" />
  
          <View style={styles.loadingContainer}>
  
            <ActivityIndicator size="large" />
  
            <Text style={styles.loadingTitle}>
              Loading requests
            </Text>
  
            <Text style={styles.loadingSubtitle}>
              Checking replacement cleaner responses...
            </Text>
  
          </View>
  
        </SafeAreaView>
      );
    }
  
  
    // =======================================================
    // No data
    // =======================================================
  
    if (!data) {
  
      return (
        <SafeAreaView style={styles.safeArea}>
  
          <View style={styles.emptyContainer}>
  
            <Text style={styles.emptyTitle}>
              No request information
            </Text>
  
            <Text style={styles.emptySubtitle}>
              We couldn't find the replacement requests
              for this cleaning.
            </Text>
  
            <Button
              mode="contained"
              onPress={() =>
                fetchStatus(true)
              }
            >
              Try Again
            </Button>
  
          </View>
  
        </SafeAreaView>
      );
    }
  
  
    // =======================================================
    // Main UI
    // =======================================================
  
    return (
      <SafeAreaView style={styles.safeArea}>
  
        <StatusBar barStyle="dark-content" />
  
  
        <FlatList
          data={data.requests || []}
  
          keyExtractor={item =>
            item.requestId
          }
  
          renderItem={renderCleaner}
  
          showsVerticalScrollIndicator={false}
  
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
  
  
          // =================================================
          // HEADER
          // =================================================
  
          ListHeaderComponent={
  
            <View>
  
  
              {/* ---------------------------------------------
                  Hero
              --------------------------------------------- */}
  
              <View style={styles.hero}>
  
                <View style={styles.heroIcon}>
  
                  <Text style={styles.heroIconText}>
                    ↻
                  </Text>
  
                </View>
  
                <View style={styles.heroContent}>
  
                  <Text style={styles.heroTitle}>
                    Find a Replacement
                  </Text>
  
                  <Text style={styles.heroSubtitle}>
                    Choose a cleaner for your updated
                    cleaning date.
                  </Text>
  
                </View>
  
              </View>
  
  
              {/* ---------------------------------------------
                  Booking information
              --------------------------------------------- */}
  
              <View style={styles.bookingCard}>
  
                <View style={styles.bookingHeader}>
  
                  <View style={styles.propertyIcon}>
                    <Text style={styles.propertyIconText}>
                      ⌂
                    </Text>
                  </View>
  
                  <View style={styles.propertyInfo}>
  
                    <Text style={styles.propertyName}>
                      {data.propertyName}
                    </Text>
  
                    <Text style={styles.groupLabel}>
                      {formatGroup(data.group)}
                    </Text>
  
                  </View>
  
                </View>
  
  
                <Divider style={styles.bookingDivider} />
  
  
                <View style={styles.bookingDetails}>
  
                  <View style={styles.detailItem}>
  
                    <Text style={styles.detailLabel}>
                      ORIGINAL DATE
                    </Text>
  
                    <Text style={styles.detailValueMuted}>
                      {formatDate(
                        data.oldCleaningDate
                      )}
                    </Text>
  
                  </View>
  
  
                  <View style={styles.arrowContainer}>
                    <Text style={styles.arrow}>
                      →
                    </Text>
                  </View>
  
  
                  <View style={styles.detailItem}>
  
                    <Text style={styles.detailLabel}>
                      NEW DATE
                    </Text>
  
                    <Text style={styles.detailValue}>
                      {formatDate(
                        data.newCleaningDate
                      )}
                    </Text>
  
                  </View>
  
  
                  <View style={styles.timeContainer}>
  
                    <Text style={styles.detailLabel}>
                      TIME
                    </Text>
  
                    <Text style={styles.detailValue}>
                      {formatTime(
                        data.cleaningTime
                      )}
                    </Text>
  
                  </View>
  
                </View>
  
              </View>
  
  
              {/* ---------------------------------------------
                  Original cleaner notice
              --------------------------------------------- */}
  
              {data.unavailableCleaner && (
  
                <View style={styles.noticeCard}>
  
                  <View style={styles.noticeIcon}>
                    <Text style={styles.noticeIconText}>
                      !
                    </Text>
                  </View>
  
                  <View style={styles.noticeContent}>
  
                    <Text style={styles.noticeTitle}>
                      Original cleaner unavailable
                    </Text>
  
                    <Text style={styles.noticeText}>
                      {data.unavailableCleaner.name}
                      {' '}is unavailable for the
                      updated date. Select an available
                      replacement below.
                    </Text>
  
                  </View>
  
                </View>
  
              )}
  
  
              {/* ---------------------------------------------
                  Response summary
              --------------------------------------------- */}
  
              <View style={styles.summarySection}>
  
                <View>
  
                  <Text style={styles.sectionTitle}>
                    Cleaner Responses
                  </Text>
  
                  <Text style={styles.sectionSubtitle}>
                    Select one cleaner after they accept.
                  </Text>
  
                </View>
  
  
                <View style={styles.responseCount}>
  
                  <Text style={styles.responseCountNumber}>
                    {data.requestCount}
                  </Text>
  
                  <Text style={styles.responseCountLabel}>
                    REQUESTS
                  </Text>
  
                </View>
  
              </View>
  
  
              {/* ---------------------------------------------
                  Response stats
              --------------------------------------------- */}
  
              <View style={styles.statsRow}>
  
                <View style={styles.statCard}>
  
                  <Text style={[
                    styles.statNumber,
                    styles.pendingNumber,
                  ]}>
                    {data.pendingCount}
                  </Text>
  
                  <Text style={styles.statLabel}>
                    Waiting
                  </Text>
  
                </View>
  
  
                <View style={styles.statCard}>
  
                  <Text style={[
                    styles.statNumber,
                    styles.acceptedNumber,
                  ]}>
                    {data.acceptedCount}
                  </Text>
  
                  <Text style={styles.statLabel}>
                    Available
                  </Text>
  
                </View>
  
  
                <View style={styles.statCard}>
  
                  <Text style={[
                    styles.statNumber,
                    styles.declinedNumber,
                  ]}>
                    {data.declinedCount}
                  </Text>
  
                  <Text style={styles.statLabel}>
                    Declined
                  </Text>
  
                </View>
  
              </View>
  
  
              <Text style={styles.listHeader}>
                Replacement Cleaners
              </Text>
  
            </View>
          }
  
  
          // =================================================
          // FOOTER
          // =================================================
  
          ListFooterComponent={
  
            <View style={styles.footer}>
  
              {selectedCleaner && (
  
                <View style={styles.selectedContainer}>
  
                  <View style={styles.selectedCheck}>
  
                    <Text style={styles.selectedCheckText}>
                      ✓
                    </Text>
  
                  </View>
  
                  <View style={styles.selectedInfo}>
  
                    <Text style={styles.selectedLabel}>
                      SELECTED CLEANER
                    </Text>
  
                    <Text style={styles.selectedName}>
                      {selectedCleaner.cleanerName}
                    </Text>
  
                  </View>
  
                </View>
  
              )}
  
  
              {!selectedCleaner &&
                data.acceptedCount > 0 && (
  
                  <Text style={styles.selectionHint}>
                    Tap an available cleaner above
                    to select them.
                  </Text>
  
                )}
  
  
              {data.pendingCount > 0 && (
                <View style={styles.refreshNotice}>
  
                  <ActivityIndicator
                    size="small"
                  />
  
                  <Text style={styles.refreshText}>
                    Waiting for cleaner responses...
                  </Text>
  
                </View>
              )}
  
  
              <Button
                mode="contained"
                onPress={handleContinue}
                disabled={
                  !selectedCleaner
                }
                style={[
                  styles.continueButton,
                  !selectedCleaner &&
                    styles.disabledButton,
                ]}
                contentStyle={
                  styles.continueButtonContent
                }
                labelStyle={
                  styles.continueButtonLabel
                }
              >
                Continue
              </Button>
  
  
              <Text style={styles.footerNote}>
                You can only select a cleaner who has
                accepted the replacement request.
              </Text>
  
            </View>
          }
  
          contentContainerStyle={
            styles.listContent
          }
        />
  
      </SafeAreaView>
    );
  };
  
  
  // =========================================================
  // Styles
  // =========================================================
  
  const styles = StyleSheet.create({
  
    safeArea: {
      flex: 1,
      backgroundColor: '#F8FAFC',
    },
  
    listContent: {
      paddingBottom: 30,
    },
  
  
    // =======================================================
    // Loading
    // =======================================================
  
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 30,
    },
  
    loadingTitle: {
      marginTop: 18,
      fontSize: 18,
      fontWeight: '700',
    },
  
    loadingSubtitle: {
      marginTop: 6,
      fontSize: 14,
      textAlign: 'center',
      opacity: 0.55,
    },
  
  
    // =======================================================
    // Empty
    // =======================================================
  
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 30,
    },
  
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
    },
  
    emptySubtitle: {
      fontSize: 14,
      textAlign: 'center',
      marginVertical: 10,
      opacity: 0.6,
    },
  
  
    // =======================================================
    // Hero
    // =======================================================
  
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
      backgroundColor: '#EAF2FF',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
  
    heroIconText: {
      fontSize: 27,
      fontWeight: '700',
    },
  
    heroContent: {
      flex: 1,
    },
  
    heroTitle: {
      fontSize: 24,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
  
    heroSubtitle: {
      marginTop: 4,
      fontSize: 14,
      lineHeight: 20,
      opacity: 0.6,
    },
  
  
    // =======================================================
    // Booking
    // =======================================================
  
    bookingCard: {
      marginHorizontal: 16,
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      padding: 18,
  
      shadowOffset: {
        width: 0,
        height: 4,
      },
  
      shadowOpacity: 0.06,
      shadowRadius: 12,
  
      elevation: 2,
    },
  
    bookingHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  
    propertyIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: '#F1F5F9',
      alignItems: 'center',
      justifyContent: 'center',
    },
  
    propertyIconText: {
      fontSize: 24,
    },
  
    propertyInfo: {
      flex: 1,
      marginLeft: 12,
    },
  
    propertyName: {
      fontSize: 17,
      fontWeight: '750',
    },
  
    groupLabel: {
      fontSize: 13,
      marginTop: 3,
      opacity: 0.55,
    },
  
    bookingDivider: {
      marginVertical: 16,
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
      opacity: 0.45,
      marginBottom: 5,
    },
  
    detailValue: {
      fontSize: 14,
      fontWeight: '700',
    },
  
    detailValueMuted: {
      fontSize: 14,
      fontWeight: '600',
      opacity: 0.55,
    },
  
    arrowContainer: {
      paddingHorizontal: 7,
    },
  
    arrow: {
      fontSize: 18,
      opacity: 0.35,
    },
  
    timeContainer: {
      flex: 0.8,
      paddingLeft: 10,
    },
  
  
    // =======================================================
    // Notice
    // =======================================================
  
    noticeCard: {
      marginHorizontal: 16,
      marginTop: 14,
      padding: 14,
      borderRadius: 16,
      backgroundColor: '#FFF8E7',
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
  
    noticeIcon: {
      width: 30,
      height: 30,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFE8A3',
    },
  
    noticeIconText: {
      fontSize: 16,
      fontWeight: '800',
    },
  
    noticeContent: {
      flex: 1,
      marginLeft: 11,
    },
  
    noticeTitle: {
      fontSize: 14,
      fontWeight: '750',
    },
  
    noticeText: {
      fontSize: 13,
      lineHeight: 19,
      marginTop: 3,
      opacity: 0.65,
    },
  
  
    // =======================================================
    // Summary
    // =======================================================
  
    summarySection: {
      marginTop: 25,
      marginHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
    },
  
    sectionSubtitle: {
      fontSize: 12,
      marginTop: 4,
      opacity: 0.5,
    },
  
    responseCount: {
      alignItems: 'flex-end',
    },
  
    responseCountNumber: {
      fontSize: 20,
      fontWeight: '800',
    },
  
    responseCountLabel: {
      fontSize: 8,
      fontWeight: '800',
      letterSpacing: 0.8,
      opacity: 0.4,
    },
  
  
    // =======================================================
    // Stats
    // =======================================================
  
    statsRow: {
      flexDirection: 'row',
      marginHorizontal: 16,
      marginTop: 14,
      gap: 9,
    },
  
    statCard: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      borderRadius: 14,
      paddingVertical: 13,
      alignItems: 'center',
    },
  
    statNumber: {
      fontSize: 21,
      fontWeight: '800',
    },
  
    pendingNumber: {
      opacity: 0.65,
    },
  
    acceptedNumber: {
      opacity: 0.8,
    },
  
    declinedNumber: {
      opacity: 0.55,
    },
  
    statLabel: {
      fontSize: 11,
      marginTop: 3,
      opacity: 0.5,
    },
  
  
    // =======================================================
    // Cleaner list
    // =======================================================
  
    listHeader: {
      marginHorizontal: 16,
      marginTop: 25,
      marginBottom: 11,
      fontSize: 17,
      fontWeight: '800',
    },
  
    cleanerCard: {
      marginHorizontal: 16,
      marginBottom: 10,
      padding: 13,
      borderRadius: 16,
      backgroundColor: '#FFFFFF',
      flexDirection: 'row',
      alignItems: 'center',
  
      shadowOffset: {
        width: 0,
        height: 2,
      },
  
      shadowOpacity: 0.035,
      shadowRadius: 8,
  
      elevation: 1,
    },
  
    selectedCleanerCard: {
      borderWidth: 2,
    },
  
    declinedCleanerCard: {
      opacity: 0.65,
    },
  
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor: '#EEF2F7',
      alignItems: 'center',
      justifyContent: 'center',
    },
  
    avatarText: {
      fontSize: 15,
      fontWeight: '800',
      opacity: 0.65,
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
      fontSize: 15,
      fontWeight: '750',
      marginRight: 7,
    },
  
    cleanerGroup: {
      fontSize: 12,
      marginTop: 3,
      opacity: 0.5,
    },
  
    availableMessage: {
      fontSize: 11,
      marginTop: 5,
      opacity: 0.6,
    },
  
    waitingMessage: {
      fontSize: 11,
      marginTop: 5,
      opacity: 0.5,
    },
  
    declinedMessage: {
      fontSize: 11,
      marginTop: 5,
      opacity: 0.5,
    },
  
  
    // =======================================================
    // Status pills
    // =======================================================
  
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 20,
    },
  
    pendingPill: {
      backgroundColor: '#F1F3F5',
    },
  
    acceptedPill: {
      backgroundColor: '#EDF7F0',
    },
  
    declinedPill: {
      backgroundColor: '#F6F0F0',
    },
  
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 5,
    },
  
    pendingDot: {
      backgroundColor: '#999999',
    },
  
    acceptedDot: {
      backgroundColor: '#4D9A61',
    },
  
    declinedDot: {
      backgroundColor: '#B46A6A',
    },
  
    statusText: {
      fontSize: 10,
      fontWeight: '700',
    },
  
    pendingText: {
      opacity: 0.6,
    },
  
    acceptedText: {
      opacity: 0.8,
    },
  
    declinedText: {
      opacity: 0.7,
    },
  
  
    // =======================================================
    // Footer
    // =======================================================
  
    footer: {
      paddingHorizontal: 16,
      paddingTop: 8,
    },
  
    selectedContainer: {
      backgroundColor: '#FFFFFF',
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
      backgroundColor: '#EAF4EC',
    },
  
    selectedCheckText: {
      fontSize: 19,
      fontWeight: '800',
      opacity: 0.75,
    },
  
    selectedInfo: {
      marginLeft: 11,
    },
  
    selectedLabel: {
      fontSize: 8,
      fontWeight: '800',
      letterSpacing: 0.8,
      opacity: 0.45,
    },
  
    selectedName: {
      fontSize: 15,
      fontWeight: '750',
      marginTop: 2,
    },
  
    selectionHint: {
      textAlign: 'center',
      fontSize: 12,
      opacity: 0.5,
      marginBottom: 10,
    },
  
    refreshNotice: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
      gap: 7,
    },
  
    refreshText: {
      fontSize: 12,
      opacity: 0.5,
    },
  
    continueButton: {
      borderRadius: 13,
    },
  
    disabledButton: {
      opacity: 0.45,
    },
  
    continueButtonContent: {
      height: 52,
    },
  
    continueButtonLabel: {
      fontSize: 15,
      fontWeight: '700',
    },
  
    footerNote: {
      textAlign: 'center',
      fontSize: 10,
      lineHeight: 15,
      marginTop: 10,
      opacity: 0.4,
      paddingHorizontal: 20,
    },
  
  });
  
  export default ReplacementRequestStatus;