import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Linking,
  View,
  useWindowDimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';

import userService from '../../services/connection/userService';
import moment from 'moment';

import {
  MaterialCommunityIcons,
  Ionicons,
} from '@expo/vector-icons';

import { AuthContext } from '../../context/AuthContext';
import ROUTES from '../../constants/routes';
import calculateDistance from '../../utils/calculateDistance';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import CancelScheduleModal from '../../components/shared/CancelScheduleModal';
import { getCityState } from '../../utils/getAddressFromCoordinates';
import { calculateEarningsFromChecklist } from '../../utils/earningCalculator';
import EarningsBreakdownCard from '../../components/cleaner/EarningsBreakdownCard';
import ChecklistSummary from '../../components/cleaner/ChecklistSummary';

import { tSafe } from '../../utils/tSafe';
import { useTheme } from '../../theme';
import AppText from '../../ui/AppText';

export default function ScheduleDetailView({ route }) {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const {
    item,
    requestId,
    scheduleId,
    hostId,
  } = route.params;

  const {
    geolocationData,
    currentUserId,
    currentUser,
  } = useContext(AuthContext);

  const { width } = useWindowDimensions();

  // ============================================================
  // STYLES
  // ============================================================

  const styles = createStyles(theme);

  // ============================================================
  // STATE MANAGEMENT
  // ============================================================

  const [schedule, setSchedule] = useState({});
  const [cleaning_date, setCleaningDate] = useState('');
  const [cleaning_time, setCleaningTime] = useState('');
  const [cleaning_end_time, setCleaningEndTime] = useState('');
  const [room_type_and_size, setRoomTypeSize] = useState([]);
  const [apartment_latitude, setApartmentLatitude] = useState('');
  const [apartment_longitude, setApartmentLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [apartment_name, setApartmentName] = useState('');
  const [total_cleaning_fee, setTotalCleaningFee] = useState('');
  const [regular_cleaning, setRegularCleaning] = useState([]);
  const [extra, setExtra] = useState([]);
  const [distance, setDistance] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const [city, setCity] = useState(null);
  const [state, setState] = useState(null);
  const [postalcode, setPostalCode] = useState(null);
  const [country, setCountry] = useState(null);

  // ============================================================
  // CANCELLATION STATES
  // ============================================================

  const [
    cancelModalVisible,
    setCancelModalVisible,
  ] = useState(false);

  const [
    cancellationLoading,
    setCancellationLoading,
  ] = useState(false);

  const [
    currentCleanerAssignment,
    setCurrentCleanerAssignment,
  ] = useState(null);

  // ============================================================
  // ANIMATION VALUES
  // ============================================================

  const fadeAnim = useState(
    new Animated.Value(0)
  )[0];

  const slideAnim = useState(
    new Animated.Value(50)
  )[0];

  // ============================================================
  // ROOM TYPE DATA
  // ============================================================

  const bedroomCount =
    room_type_and_size.find(
      room => room.type === 'Bedroom'
    )?.number || 0;

  const bathroomCount =
    room_type_and_size.find(
      room => room.type === 'Bathroom'
    )?.number || 0;

  const kitchen =
    room_type_and_size.find(
      room => room.type === 'Kitchen'
    )?.number || 0;

  const livingroomCount =
    room_type_and_size.find(
      room => room.type === 'Livingroom'
    )?.number || 0;

  const bedroomSize =
    room_type_and_size.find(
      room => room.type === 'Bedroom'
    )?.size || 0;

  const bathroomSize =
    room_type_and_size.find(
      room => room.type === 'Bathroom'
    )?.size || 0;

  const kitchenSize =
    room_type_and_size.find(
      room => room.type === 'Kitchen'
    )?.size || 0;

  const livingroomSize =
    room_type_and_size.find(
      room => room.type === 'Livingroom'
    )?.size || 0;

  // ============================================================
  // FETCH SCHEDULE
  // ============================================================

  useEffect(() => {
    fetchSchedule();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);

      const response =
        await userService.getScheduleById(scheduleId);

      const res = response.data;

      setSchedule(res);

      const scheduleData = res.schedule || {};

      setRoomTypeSize(
        scheduleData.selected_apt_room_type_and_size || []
      );

      setCleaningDate(
        scheduleData.cleaning_date || ''
      );

      setCleaningTime(
        scheduleData.cleaning_time || ''
      );

      setCleaningEndTime(
        scheduleData.cleaning_end_time || ''
      );

      const lat1 = geolocationData?.latitude;
      const lon1 = geolocationData?.longitude;

      const lat2 = scheduleData.apartment_latitude;
      const lon2 = scheduleData.apartment_longitude;

      if (
        lat1 != null &&
        lon1 != null &&
        lat2 != null &&
        lon2 != null
      ) {
        const dist = calculateDistance(
          lat1,
          lon1,
          lat2,
          lon2
        );

        setDistance(dist);
      }

      setApartmentLatitude(lat2);
      setApartmentLongitude(lon2);

      setAddress(scheduleData.address || '');
      setApartmentName(scheduleData.apartment_name || '');
      setTotalCleaningFee(scheduleData.total_cleaning_fee || 0);

      setRegularCleaning(
        scheduleData.regular_cleaning || []
      );

      setExtra(scheduleData.extra || []);
      setStatus(res.status || '');

      if (lat2 != null && lon2 != null) {
        try {
          const result = await getCityState({
            latitude: Number(lat2),
            longitude: Number(lon2),
          });

          setCity(result?.city || '');
          setState(result?.state || '');
          setPostalCode(result?.postalCode || '');
          setCountry(result?.country || '');
        } catch (locationError) {
          console.warn(
            'Could not resolve property location:',
            locationError
          );
        }
      }

      if (res.assignedTo && currentUserId) {
        const currentAssignment = res.assignedTo.find(
          cleaner =>
            String(cleaner.cleanerId) === String(currentUserId)
        );

        setCurrentCleanerAssignment(
          currentAssignment || null
        );
      }
    } catch (error) {
      console.error(
        'Error fetching schedule:',
        error
      );

      Alert.alert(
        tSafe('error', 'Error'),
        tSafe(
          'failed_to_load_schedule',
          'Failed to load schedule details.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CALCULATE PENALTY IMPACT
  // ============================================================

  const calculatePenaltyImpact = () => {
    if (
      !schedule ||
      !cleaning_date ||
      !cleaning_time
    ) {
      return null;
    }

    const bookingTime = moment(
      `${cleaning_date} ${cleaning_time}`,
      [
        'YYYY-MM-DD HH:mm:ss',
        'YYYY-MM-DD HH:mm',
        'YYYY-MM-DD h:mm A',
        'YYYY-MM-DD hh:mm A',
      ],
      true
    );

    if (!bookingTime.isValid()) {
      return null;
    }

    const hoursUntilBooking = bookingTime.diff(
      moment(),
      'minutes'
    ) / 60;

    let penaltyInfo = {
      points: 0,
      tier: 'NONE',
      description: '',
      reliabilityImpact: 0,
      ratingImpact: 0,
    };

    if (hoursUntilBooking <= 24) {
      penaltyInfo = {
        points: 20,
        tier: 'SEVERE',
        description: tSafe(
          'less_than_24_hours',
          'Less than 24 hours notice'
        ),
        reliabilityImpact: -15,
        ratingImpact: -0.4,
      };
    } else if (hoursUntilBooking <= 48) {
      penaltyInfo = {
        points: 10,
        tier: 'MODERATE',
        description: tSafe(
          '24_48_hours',
          '24-48 hours notice'
        ),
        reliabilityImpact: -8,
        ratingImpact: -0.2,
      };
    } else if (hoursUntilBooking <= 72) {
      penaltyInfo = {
        points: 5,
        tier: 'MINOR',
        description: tSafe(
          '48_72_hours',
          '48-72 hours notice'
        ),
        reliabilityImpact: -4,
        ratingImpact: -0.1,
      };
    } else {
      penaltyInfo = {
        points: 0,
        tier: 'NONE',
        description: tSafe(
          'more_than_72_hours',
          'More than 72 hours notice'
        ),
        reliabilityImpact: 0,
        ratingImpact: 0,
      };
    }

    return penaltyInfo;
  };

  // ============================================================
  // CAN CANCEL ASSIGNMENT
  // ============================================================

  const canCancelAssignment = () => {
    if (!schedule || !currentCleanerAssignment) {
      return false;
    }

    const bookingTime = moment(
      `${cleaning_date} ${cleaning_time}`,
      [
        'YYYY-MM-DD HH:mm:ss',
        'YYYY-MM-DD HH:mm',
        'YYYY-MM-DD h:mm A',
        'YYYY-MM-DD hh:mm A',
      ],
      true
    );

    if (!bookingTime.isValid()) {
      return false;
    }

    const hoursUntilBooking = bookingTime.diff(
      moment(),
      'minutes'
    ) / 60;

    if (hoursUntilBooking <= 0) {
      return false;
    }

    if (
      ['in_progress', 'completed'].includes(
        currentCleanerAssignment.status
      )
    ) {
      return false;
    }

    if (schedule.status === 'cancelled') {
      return false;
    }

    return true;
  };

  // ============================================================
  // CLEANER CANCELLATION
  // ============================================================

  const handleCancelBooking = async cancellationData => {
    setCancellationLoading(true);

    console.log(
      'Cleaner cancellation data:',
      cancellationData
    );

    try {
      const penaltyImpact = calculatePenaltyImpact();

      const cancellationPayload = {
        ...cancellationData,
        cancellationType: 'partial',
        targetCleanerId: currentUserId,
        cancelledBy: 'cleaner',
        penaltyLevel: penaltyImpact?.tier || 'NONE',
        penaltyPoints: penaltyImpact?.points || 0,
      };

      const response = await userService.cancelSchedule(
        scheduleId,
        cancellationPayload
      );

      if (response.data.success) {
        let message = tSafe(
          'assignment_cancelled_success',
          'Your assignment has been cancelled successfully.'
        );

        if (
          penaltyImpact &&
          penaltyImpact.tier !== 'NONE'
        ) {
          message += tSafe(
            'penalty_applied_message',
            '\n\nPenalty Applied: {tier} Level\nReliability Impact: {reliability}%\nRating Impact: {rating} stars\n\nThis penalty will decay over 30 days with good performance.',
            {
              tier: penaltyImpact.tier,
              reliability: penaltyImpact.reliabilityImpact,
              rating: penaltyImpact.ratingImpact,
            }
          );
        }

        Alert.alert(
          penaltyImpact?.tier === 'NONE'
            ? tSafe(
                'assignment_cancelled',
                'Assignment Cancelled'
              )
            : tSafe(
                'assignment_cancelled_penalty',
                'Assignment Cancelled - Penalty Applied'
              ),
          message,
          [
            {
              text: tSafe('ok', 'OK'),
              onPress: () => {
                setCancelModalVisible(false);
                fetchSchedule();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          tSafe('error', 'Error'),
          response?.data?.message ||
            response?.message ||
            tSafe(
              'failed_to_cancel_assignment',
              'Failed to cancel assignment'
            )
        );
      }
    } catch (error) {
      console.error(
        'Cleaner cancellation error:',
        error
      );

      Alert.alert(
        tSafe('error', 'Error'),
        tSafe(
          'failed_to_cancel_assignment_try_again',
          'Failed to cancel assignment. Please try again.'
        )
      );
    } finally {
      setCancellationLoading(false);
    }
  };

  // ============================================================
  // CANCELLATION BOOKING DATA
  // ============================================================

  const getBookingForCancellation = () => ({
    id: scheduleId,
    date: `${cleaning_date}T${cleaning_time}`,
    amount: calculateEarnings(),
    service: tSafe(
      'cleaning_service',
      'Cleaning Service'
    ),
    host: schedule?.hostInfo?.firstname
      ? `${schedule.hostInfo.firstname} ${schedule.hostInfo.lastname || ''}`.trim()
      : tSafe('host', 'Host'),
    status: currentCleanerAssignment?.status || 'pending',
    cleaning_date,
    cleaning_time,
  });

  // ============================================================
  // EARNINGS
  // ============================================================

  const calculateEarnings = () => {
    if (
      !currentCleanerAssignment ||
      !Array.isArray(schedule?.assignedTo)
    ) {
      return 0;
    }

    const earningsData = calculateEarningsFromChecklist(
      schedule.assignedTo,
      currentUserId
    );

    return Number(earningsData?.cleanerEarnings || 0);
  };

  const calculateTotalAmount = () => {
    if (!Array.isArray(schedule?.assignedTo)) {
      return 0;
    }

    const earningsData = calculateEarningsFromChecklist(
      schedule.assignedTo
    );

    return Number(earningsData?.totalEarnings || 0);
  };

  const getEarningsBreakdown = () => {
    if (!Array.isArray(schedule?.assignedTo)) {
      return {};
    }

    return calculateEarningsFromChecklist(
      schedule.assignedTo,
      currentUserId
    );
  };

  // ============================================================
  // CURRENT CLEANER CHECKLIST
  // ============================================================

  const getCurrentCleanerChecklist = () => {
    if (!currentCleanerAssignment) {
      return null;
    }

    if (
      schedule.checklist &&
      currentCleanerAssignment.group
    ) {
      return {
        [currentCleanerAssignment.group]:
          schedule.checklist[
            currentCleanerAssignment.group
          ],
      };
    }

    return currentCleanerAssignment.checklist;
  };

  // ============================================================
  // DIRECTIONS
  // ============================================================

  const handleOpenDirections = () => {
    const currentLatitude = currentUser?.location?.latitude;
    const currentLongitude = currentUser?.location?.longitude;

    if (
      currentLatitude == null ||
      currentLongitude == null ||
      apartment_latitude == null ||
      apartment_longitude == null
    ) {
      Alert.alert(
        tSafe('error', 'Error'),
        tSafe(
          'location_unavailable',
          'Location information is unavailable.'
        )
      );
      return;
    }

    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=${currentLatitude},${currentLongitude}` +
      `&destination=${apartment_latitude},${apartment_longitude}` +
      `&travelmode=driving`;

    Linking.openURL(url).catch(error =>
      console.error(
        'Failed to open Google Maps',
        error
      )
    );
  };

  // ============================================================
  // TASK NAVIGATION
  // ============================================================

  const gotToTaskScreen = () => {
    navigation.navigate(
      ROUTES.cleaner_attach_task_photos,
      {
        scheduleId,
      }
    );
  };

  const handleClockIn = () => {
    navigation.navigate(
      ROUTES.cleaner_clock_in,
      {
        schedule,
        cleaner: currentCleanerAssignment,
      }
    );
  };

  // ============================================================
  // STATUS COLOR AND ICON
  // ============================================================

  const getStatusColor = () => {
    switch (status) {
      case 'upcoming':
        return theme.status.warning;

      case 'in_progress':
        return theme.brand.primary;

      case 'completed':
        return theme.status.success;

      default:
        return theme.icon.muted;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'upcoming':
        return 'clock-outline';

      case 'in_progress':
        return 'progress-clock';

      case 'completed':
        return 'check-circle';

      default:
        return 'calendar';
    }
  };

  // ============================================================
  // ROOM DETAIL
  // ============================================================

  const RoomDetail = ({ type, count, size }) => {
    const icons = {
      Bedroom: 'bed',
      Bathroom: 'shower',
      Kitchen: 'silverware-fork-knife',
      Livingroom: 'sofa',
    };

    const getTranslatedRoomType = roomType => {
      const map = {
        Bedroom: tSafe('bedroom', 'Bedroom'),
        Bathroom: tSafe('bathroom', 'Bathroom'),
        Kitchen: tSafe('kitchen', 'Kitchen'),
        Livingroom: tSafe('livingroom', 'Livingroom'),
      };

      return map[roomType] || roomType;
    };

    return (
      <View style={styles.roomDetail}>
        <View style={styles.roomIconContainer}>
          <MaterialCommunityIcons
            name={icons[type] || 'home-outline'}
            size={20}
            color={theme.icon.muted}
          />
        </View>

        <View style={styles.roomInfo}>
          <AppText style={styles.roomType}>
            {getTranslatedRoomType(type)}
          </AppText>

          <AppText style={styles.roomSpecs}>
            {count}{' '}
            {count === 1
              ? tSafe('room_singular', 'room')
              : tSafe('rooms_plural', 'rooms')}{' '}
            • {size} {tSafe('sq_ft', 'sq ft')}
          </AppText>
        </View>

        <AppText style={styles.roomCount}>
          {count}
        </AppText>
      </View>
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator
          size="large"
          color={theme.brand.primary}
        />

        <AppText style={styles.loadingText}>
          {tSafe(
            'loading_schedule_details',
            'Loading schedule details...'
          )}
        </AppText>
      </View>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* ====================================================== */}
      {/* PROFILE-STYLE GRADIENT HEADER */}
      {/* ====================================================== */}

      <LinearGradient
        colors={[
          theme.brand.primary,
          theme.brand.secondary || theme.brand.primary,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Decorative background circles */}
        <View
          pointerEvents="none"
          style={styles.headerDecorationLarge}
        />

        <View
          pointerEvents="none"
          style={styles.headerDecorationSmall}
        />

        <View style={styles.headerContent}>
          {/* Back button */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={tSafe('go_back', 'Go back')}
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={theme.text.inverse}
            />
          </TouchableOpacity>

          {/* Brand and title */}
          <View style={styles.headerTitleContainer}>
            <AppText style={styles.headerEyebrow}>
              FRESHSWEEPER
            </AppText>

            <AppText style={styles.headerTitle}>
              {tSafe(
                'cleaning_details',
                'Cleaning Details'
              )}
            </AppText>

            <View style={styles.statusPill}>
              <MaterialCommunityIcons
                name={getStatusIcon()}
                size={14}
                color={theme.text.inverse}
              />

              <AppText style={styles.statusText}>
                {status
                  ? status.replace(/_/g, ' ')
                  : tSafe('scheduled', 'Scheduled')}
              </AppText>
            </View>
          </View>

          {/* Cancel button */}
          <View style={styles.headerActionContainer}>
            {canCancelAssignment() ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={tSafe(
                  'cancel_assignment',
                  'Cancel assignment'
                )}
                style={styles.cancelHeaderButton}
                onPress={() => setCancelModalVisible(true)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={21}
                  color={theme.text.inverse}
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.headerActionPlaceholder} />
            )}
          </View>
        </View>
      </LinearGradient>

      {/* ====================================================== */}
      {/* MAIN CONTENT */}
      {/* ====================================================== */}

      <Animated.ScrollView
        style={[
          styles.scrollView,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* LOCATION CARD */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color={theme.brand.primary}
            />

            <AppText style={styles.cardTitle}>
              {tSafe('location', 'Location')}
            </AppText>
          </View>

          <AppText style={styles.apartmentName}>
            {apartment_name || tSafe(
              'property',
              'Property'
            )}
          </AppText>

          <AppText style={styles.address}>
            {[city, state, postalcode]
              .filter(Boolean)
              .join(', ') ||
              address ||
              tSafe(
                'address_unavailable',
                'Address unavailable'
              )}
          </AppText>

          <View style={styles.locationInfo}>
            <View style={styles.distanceBadge}>
              <MaterialCommunityIcons
                name="map-marker-distance"
                size={16}
                color={theme.icon.muted}
              />

              <AppText style={styles.distanceText}>
                {Number.isFinite(Number(distance))
                  ? Number(distance).toFixed(1)
                  : '—'}{' '}
                {tSafe('miles_away', 'miles away')}
              </AppText>
            </View>

            <TouchableOpacity
              style={styles.directionButton}
              onPress={handleOpenDirections}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="directions"
                size={16}
                color={theme.brand.primary}
              />

              <AppText style={styles.directionText}>
                {tSafe('directions', 'Directions')}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* PROPERTY DETAILS */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name="home"
              size={20}
              color={theme.brand.primary}
            />

            <AppText style={styles.cardTitle}>
              {tSafe(
                'property_details',
                'Property Details'
              )}
            </AppText>
          </View>

          <View style={styles.roomsList}>
            {room_type_and_size.map((room, index) => (
              <RoomDetail
                key={`${room.type}-${index}`}
                type={room.type}
                count={room.number}
                size={room.size}
              />
            ))}
          </View>

          <View style={styles.totalArea}>
            <MaterialCommunityIcons
              name="ruler-square"
              size={16}
              color={theme.icon.muted}
            />

            <AppText style={styles.totalAreaText}>
              {tSafe('total_area', 'Total Area')}: {' '}
              {bedroomSize +
                bathroomSize +
                kitchenSize +
                livingroomSize}{' '}
              {tSafe('sq_ft', 'sq ft')}
            </AppText>
          </View>
        </View>

        {/* SCHEDULE TIMELINE */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name="calendar-clock"
              size={20}
              color={theme.brand.primary}
            />

            <AppText style={styles.cardTitle}>
              {tSafe('schedule', 'Schedule')}
            </AppText>
          </View>

          <View style={styles.timeline}>
            {/* Start */}

            <View style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  styles.startDot,
                ]}
              >
                <MaterialCommunityIcons
                  name="play"
                  size={12}
                  color={theme.status.success}
                />
              </View>

              <View style={styles.timelineContent}>
                <AppText style={styles.timelineLabel}>
                  {tSafe('start_time', 'START TIME')}
                </AppText>

                <AppText style={styles.timelineTime}>
                  {moment(
                    cleaning_time,
                    [
                      'HH:mm:ss',
                      'HH:mm',
                      'h:mm A',
                      'hh:mm A',
                    ],
                    true
                  ).isValid()
                    ? moment(
                        cleaning_time,
                        [
                          'HH:mm:ss',
                          'HH:mm',
                          'h:mm A',
                          'hh:mm A',
                        ],
                        true
                      ).format('h:mm A')
                    : cleaning_time || '—'}
                </AppText>
              </View>
            </View>

            <View style={styles.timelineConnector} />

            {/* Date */}

            <View style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  styles.dateDot,
                ]}
              >
                <MaterialCommunityIcons
                  name="calendar-blank"
                  size={12}
                  color={theme.brand.primary}
                />
              </View>

              <View style={styles.timelineContent}>
                <AppText style={styles.timelineLabel}>
                  {tSafe('date', 'DATE')}
                </AppText>

                <AppText style={styles.timelineTime}>
                  {cleaning_date
                    ? moment(cleaning_date).format(
                        'ddd, MMM D, YYYY'
                      )
                    : '—'}
                </AppText>
              </View>
            </View>

            <View style={styles.timelineConnector} />

            {/* End */}

            <View style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  styles.endDot,
                ]}
              >
                <MaterialCommunityIcons
                  name="stop"
                  size={12}
                  color={theme.status.warning}
                />
              </View>

              <View style={styles.timelineContent}>
                <AppText style={styles.timelineLabel}>
                  {tSafe('end_time', 'END TIME')}
                </AppText>

                <AppText style={styles.timelineTime}>
                  {moment(
                    cleaning_end_time,
                    [
                      'HH:mm:ss',
                      'HH:mm',
                      'h:mm A',
                      'hh:mm A',
                    ],
                    true
                  ).isValid()
                    ? moment(
                        cleaning_end_time,
                        [
                          'HH:mm:ss',
                          'HH:mm',
                          'h:mm A',
                          'hh:mm A',
                        ],
                        true
                      ).format('h:mm A')
                    : cleaning_end_time || '—'}
                </AppText>
              </View>
            </View>
          </View>

          <View style={styles.durationContainer}>
            <MaterialCommunityIcons
              name="timer-outline"
              size={16}
              color={theme.icon.muted}
            />

            <AppText style={styles.durationText}>
              {(() => {
                const start = moment(
                  cleaning_time,
                  [
                    'HH:mm:ss',
                    'HH:mm',
                    'h:mm A',
                    'hh:mm A',
                  ],
                  true
                );

                const end = moment(
                  cleaning_end_time,
                  [
                    'HH:mm:ss',
                    'HH:mm',
                    'h:mm A',
                    'hh:mm A',
                  ],
                  true
                );

                if (!start.isValid() || !end.isValid()) {
                  return tSafe(
                    'duration_not_available',
                    'Duration not available'
                  );
                }

                let minutes = end.diff(start, 'minutes');

                // Handle schedules that cross midnight.
                if (minutes < 0) {
                  minutes += 24 * 60;
                }

                const hours = Math.floor(minutes / 60);
                const remainingMinutes = minutes % 60;

                if (hours > 0) {
                  return `${hours}h${
                    remainingMinutes > 0
                      ? ` ${remainingMinutes}m`
                      : ''
                  }`;
                }

                return `${remainingMinutes}m`;
              })()}
            </AppText>
          </View>
        </View>

        {/* CLEANING CHECKLIST */}

        <ChecklistSummary
          assignedTo={
            currentCleanerAssignment
              ? [currentCleanerAssignment]
              : []
          }
        />

        {/* EARNINGS BREAKDOWN */}

        <EarningsBreakdownCard
          earningsData={getEarningsBreakdown()}
          currentCleanerId={currentUserId}
        />

        {/* CANCELLATION POLICY */}

        {canCancelAssignment() && (
          <TouchableOpacity
            style={styles.card}
            onPress={() => setCancelModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={20}
                color={theme.status.warning}
              />

              <AppText style={styles.cardTitle}>
                {tSafe(
                  'cancellation_policy',
                  'Cancellation Policy'
                )}
              </AppText>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={theme.icon.muted}
              />
            </View>

            <AppText style={styles.policyText}>
              {tSafe(
                'cancellation_policy_text',
                'View cancellation terms and potential penalties'
              )}
            </AppText>
          </TouchableOpacity>
        )}
      </Animated.ScrollView>

      {/* ====================================================== */}
      {/* FIXED ACTION BUTTON */}
      {/* ====================================================== */}

      <View style={styles.actionContainer}>
        <View style={styles.priceContainer}>
          <AppText style={styles.priceLabel}>
            {tSafe('your_earnings', 'Your Earnings')}
          </AppText>

          <AppText style={styles.priceValue}>
            {geolocationData?.currency?.symbol || '$'}
            {calculateEarnings().toFixed(2)}
          </AppText>
        </View>

        {status === 'upcoming' &&
        canCancelAssignment() ? (
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.cancelButton,
            ]}
            onPress={() => setCancelModalVisible(true)}
            disabled={cancellationLoading}
            activeOpacity={0.8}
          >
            {cancellationLoading ? (
              <ActivityIndicator
                size="small"
                color={theme.text.inverse}
              />
            ) : (
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color={theme.text.inverse}
              />
            )}

            <AppText style={styles.actionButtonText}>
              {tSafe(
                'cancel_assignment',
                'Cancel Assignment'
              )}
            </AppText>
          </TouchableOpacity>
        ) : status === 'in_progress' ? (
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.primaryButton,
            ]}
            onPress={gotToTaskScreen}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="camera"
              size={20}
              color={theme.button.primaryText}
            />

            <AppText style={styles.actionButtonText}>
              {tSafe(
                'continue_work',
                'Continue Work'
              )}
            </AppText>
          </TouchableOpacity>
        ) : status === 'upcoming' ? (
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.primaryButton,
            ]}
            onPress={handleClockIn}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="timer-outline"
              size={20}
              color={theme.button.primaryText}
            />

            <AppText style={styles.actionButtonText}>
              {tSafe('clock_in', 'Clock In')}
            </AppText>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* ====================================================== */}
      {/* CANCELLATION MODAL */}
      {/* ====================================================== */}

      <CancelScheduleModal
        visible={cancelModalVisible}
        onClose={() => setCancelModalVisible(false)}
        booking={getBookingForCancellation()}
        userType="cleaner"
        onCancelBooking={handleCancelBooking}
        cleaners={
          currentCleanerAssignment
            ? [currentCleanerAssignment]
            : []
        }
        cancellationType="partial"
        targetCleaner={currentCleanerAssignment}
        penaltyImpact={calculatePenaltyImpact()}
      />
    </SafeAreaView>
  );
}

// ============================================================
// THEME-AWARE STYLES
// ============================================================

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    // ========================================================
    // LOADING
    // ========================================================

    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background.default,
    },

    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.text.secondary,
    },

    // ========================================================
    // PROFILE-STYLE GRADIENT HEADER
    // ========================================================

    header: {
      position: 'relative',
      overflow: 'hidden',

      paddingTop: 60,
      paddingBottom: 24,
      paddingHorizontal: 20,

      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
    },

    headerDecorationLarge: {
      position: 'absolute',
      top: -80,
      right: -55,

      width: 230,
      height: 230,
      borderRadius: 115,

      backgroundColor: 'rgba(255,255,255,0.09)',
    },

    headerDecorationSmall: {
      position: 'absolute',
      bottom: -45,
      left: 65,

      width: 120,
      height: 120,
      borderRadius: 60,

      backgroundColor: 'rgba(255,255,255,0.07)',
    },

    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 15,

      justifyContent: 'center',
      alignItems: 'center',

      backgroundColor: 'rgba(255,255,255,0.14)',

      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.18)',
    },

    headerTitleContainer: {
      flex: 1,
      minWidth: 0,
      alignItems: 'flex-start',
      marginHorizontal: 14,
    },

    headerEyebrow: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 2,

      color: theme.hero.mutedForeground,

      marginBottom: 6,
    },

    headerTitle: {
      fontSize: 22,
      fontWeight: '800',
      lineHeight: 29,

      color: theme.text.inverse,
      letterSpacing: -0.4,
    },

    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',

      marginTop: 10,

      paddingHorizontal: 12,
      paddingVertical: 7,

      borderRadius: 22,

      backgroundColor: 'rgba(255,255,255,0.14)',

      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.18)',

      gap: 6,
    },

    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.text.inverse,
      textTransform: 'capitalize',
    },

    headerActionContainer: {
      width: 42,
      alignItems: 'center',
      justifyContent: 'center',
    },

    headerActionPlaceholder: {
      width: 42,
      height: 42,
    },

    cancelHeaderButton: {
      width: 42,
      height: 42,
      borderRadius: 15,

      justifyContent: 'center',
      alignItems: 'center',

      backgroundColor: 'rgba(255,255,255,0.14)',

      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.18)',
    },

    // ========================================================
    // SCROLL VIEW
    // ========================================================

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      padding: 16,
      paddingBottom: 32,
    },

    // ========================================================
    // CARDS
    // ========================================================

    card: {
      backgroundColor: theme.card.background,
      borderColor: theme.card.border,
      borderWidth: 1,
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,

      shadowColor: theme.shadow?.color || '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: theme.shadow?.opacity ?? 0.08,
      shadowRadius: 8,

      elevation: 3,
    },

    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 12,
    },

    cardTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '700',
      color: theme.text.primary,
    },

    // ========================================================
    // LOCATION
    // ========================================================

    apartmentName: {
      fontSize: 22,
      lineHeight: 29,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 6,
    },

    address: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.text.secondary,
      marginBottom: 16,
    },

    locationInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 10,
    },

    distanceBadge: {
      flexDirection: 'row',
      alignItems: 'center',

      backgroundColor: theme.surface.selected,

      paddingHorizontal: 12,
      paddingVertical: 9,

      borderRadius: 12,
      gap: 6,
    },

    distanceText: {
      fontSize: 13,
      color: theme.text.secondary,
      fontWeight: '500',
    },

    directionButton: {
      flexDirection: 'row',
      alignItems: 'center',

      paddingHorizontal: 14,
      paddingVertical: 9,

      backgroundColor: theme.surface.selected,

      borderRadius: 12,
      gap: 6,
    },

    directionText: {
      fontSize: 14,
      color: theme.brand.primary,
      fontWeight: '600',
    },

    // ========================================================
    // PROPERTY DETAILS
    // ========================================================

    roomsList: {
      gap: 12,
      marginBottom: 16,
    },

    roomDetail: {
      flexDirection: 'row',
      alignItems: 'center',

      padding: 12,

      backgroundColor: theme.background.sunken,

      borderRadius: 14,
      gap: 12,
    },

    roomIconContainer: {
      width: 42,
      height: 42,
      borderRadius: 14,

      backgroundColor: theme.surface.selected,

      justifyContent: 'center',
      alignItems: 'center',
    },

    roomInfo: {
      flex: 1,
    },

    roomType: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 3,
    },

    roomSpecs: {
      fontSize: 13,
      color: theme.text.secondary,
    },

    roomCount: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.brand.primary,
    },

    totalArea: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',

      padding: 12,

      backgroundColor: theme.surface.selected,

      borderRadius: 12,
      gap: 8,
    },

    totalAreaText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text.secondary,
    },

    // ========================================================
    // SCHEDULE TIMELINE
    // ========================================================

    timeline: {
      marginBottom: 16,
    },

    timelineItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },

    timelineDot: {
      width: 26,
      height: 26,
      borderRadius: 13,

      borderWidth: 2,

      justifyContent: 'center',
      alignItems: 'center',

      marginRight: 16,

      backgroundColor: theme.card.background,
    },

    startDot: {
      borderColor: theme.status.success,
    },

    dateDot: {
      borderColor: theme.brand.primary,
    },

    endDot: {
      borderColor: theme.status.warning,
    },

    timelineConnector: {
      width: 2,
      height: 20,

      backgroundColor: theme.divider,

      marginLeft: 12,
      marginBottom: 8,
    },

    timelineContent: {
      flex: 1,
    },

    timelineLabel: {
      fontSize: 11,
      fontWeight: '700',

      color: theme.text.muted,

      marginBottom: 4,
      letterSpacing: 1,
    },

    timelineTime: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.primary,
    },

    durationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',

      padding: 12,

      backgroundColor: theme.surface.selected,

      borderRadius: 12,
      gap: 8,
    },

    durationText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text.secondary,
    },

    // ========================================================
    // CANCELLATION POLICY
    // ========================================================

    policyText: {
      fontSize: 14,
      color: theme.text.secondary,
      lineHeight: 21,
    },

    // ========================================================
    // FIXED ACTION CONTAINER
    // ========================================================

    actionContainer: {
      flexDirection: 'row',
      alignItems: 'center',

      paddingHorizontal: 20,
      paddingVertical: 16,

      backgroundColor: theme.surface.elevated,

      borderTopWidth: 1,
      borderTopColor: theme.divider,

      gap: 12,
    },

    priceContainer: {
      flex: 1,
      minWidth: 0,
    },

    priceLabel: {
      fontSize: 12,
      color: theme.text.secondary,
      marginBottom: 4,
    },

    priceValue: {
      fontSize: 23,
      fontWeight: '800',
      color: theme.text.primary,
      lineHeight: 30,
    },

    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',

      paddingHorizontal: 16,
      paddingVertical: 14,

      borderRadius: 15,
      gap: 8,

      minHeight: 50,
      flexShrink: 1,
    },

    primaryButton: {
      backgroundColor: theme.button.primaryBackground,
    },

    cancelButton: {
      backgroundColor: theme.status.error,
    },

    actionButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.button.primaryText,
      flexShrink: 1,
    },
  });







// import React, { useContext, useEffect, useState } from 'react';
// import { 
//   SafeAreaView, 
//   StyleSheet, 
//   Text, 
//   StatusBar, 
//   Linking, 
//   ScrollView, 
//   View, 
//   useWindowDimensions, 
//   TouchableOpacity, 
//   ActivityIndicator,
//   Alert,
//   Animated
// } from 'react-native';
// import COLORS from '../../constants/colors';
// import userService from '../../services/connection/userService';
// import moment from 'moment';
// import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
// import { AuthContext } from '../../context/AuthContext';
// import ROUTES from '../../constants/routes';
// import calculateDistance from '../../utils/calculateDistance';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import CancelScheduleModal from '../../components/shared/CancelScheduleModal';
// import TaskInfoBanner from './TaskInfoBanner';
// import { getAddressFromCoords, getCityState } from '../../utils/getAddressFromCoordinates';
// import { calculateEarningsFromChecklist } from '../../utils/earningCalculator';
// import EarningsBreakdownCard from '../../components/cleaner/EarningsBreakdownCard';
// import ChecklistSummary from '../../components/cleaner/ChecklistSummary';
// import { tSafe } from '../../utils/tSafe'; // added import

// export default function ScheduleDetailView({route}) {
//     const navigation = useNavigation()
//     const {item, requestId, scheduleId, hostId} = route.params
//     const {geolocationData, currentUserId, currentUser} = useContext(AuthContext)
//     const { width } = useWindowDimensions();

//     // State management
//     const [schedule, setSchedule] = useState({})
//     const [cleaning_date, setCleaningDate] = useState("")
//     const [cleaning_time, setCleaningTime] = useState("")
//     const [cleaning_end_time, setCleaningEndTime] = useState("")
//     const [room_type_and_size, setRoomTypeSize] = useState([])
//     const [apartment_latitude, setApartmentLatitude] = useState("")
//     const [apartment_longitude, setApartmentLongitude] = useState("")
//     const [address, setAddress] = useState("")
//     const [apartment_name, setApartmentName] = useState("")
//     const [total_cleaning_fee, setTotalCleaningFee] = useState("")
//     const [regular_cleaning, setRegularCleaning] = useState([])
//     const [extra, setExtra] = useState([])
//     const [distance, setDistance] = useState([])
//     const [status, setStatus] = useState([])
//     const [loading, setLoading] = useState(true)

//     const[city, setCity] = useState(null)
//     const[state, setState] = useState(null)
//     const[postalcode, setPostalCode] = useState(null)
//     const[country, setCountry] = useState(null)
    
//     // Cancellation states
//     const [cancelModalVisible, setCancelModalVisible] = useState(false);
//     const [cancellationLoading, setCancellationLoading] = useState(false);
//     const [currentCleanerAssignment, setCurrentCleanerAssignment] = useState(null);

//     // Animation values
//     const fadeAnim = useState(new Animated.Value(0))[0];
//     const slideAnim = useState(new Animated.Value(50))[0];

//     // Room type data
//     const bedroomCount = room_type_and_size.find(room => room.type === "Bedroom")?.number || 0;
//     const bathroomCount = room_type_and_size.find(room => room.type === "Bathroom")?.number || 0;
//     const kitchen = room_type_and_size.find(room => room.type === "Kitchen")?.number || 0;
//     const livingroomCount = room_type_and_size.find(room => room.type === "Livingroom")?.number || 0;

//     const bedroomSize = room_type_and_size.find(room => room.type === "Bedroom")?.size || 0;
//     const bathroomSize = room_type_and_size.find(room => room.type === "Bathroom")?.size || 0;
//     const kitchenSize = room_type_and_size.find(room => room.type === "Kitchen")?.size || 0;
//     const livingroomSize = room_type_and_size.find(room => room.type === "Livingroom")?.size || 0;

   
    
//     useEffect(() => {
//       fetchSchedule()
//     }, [])

//     useEffect(() => {
//       if (!loading) {
//         Animated.parallel([
//           Animated.timing(fadeAnim, {
//             toValue: 1,
//             duration: 600,
//             useNativeDriver: true,
//           }),
//           Animated.timing(slideAnim, {
//             toValue: 0,
//             duration: 500,
//             useNativeDriver: true,
//           })
//         ]).start();
//       }
//     }, [loading]);
   
//     const fetchSchedule = async() => {
//       try {
//         setLoading(true);
//         const response = await userService.getScheduleById(scheduleId)
//         // .then(response => {
//           const res = response.data
//           setSchedule(res)
//           setRoomTypeSize(res.schedule.selected_apt_room_type_and_size)
//           setCleaningDate(res.schedule.cleaning_date)
//           setCleaningTime(res.schedule.cleaning_time)
//           setCleaningEndTime(res.schedule.cleaning_end_time)
          
//           const lat1 = geolocationData.latitude
//           const lon1 = geolocationData.longitude
//           const lat2 = res.schedule.apartment_latitude
//           const lon2 = res.schedule.apartment_longitude
//           const dist = calculateDistance(lat1, lon1, lat2, lon2)
          
//           setDistance(dist)
//           setApartmentLatitude(res.schedule.apartment_latitude)
//           setApartmentLongitude(res.schedule.apartment_longitude)
//           setAddress(res.schedule.address)
//           setApartmentName(res.schedule.apartment_name)
//           setTotalCleaningFee(res.schedule.total_cleaning_fee)
//           setRegularCleaning(res.schedule.regular_cleaning)
//           setExtra(res.schedule.extra)
//           setStatus(res.status)

//           const coordinate = {
//             latitude: lat2,
//             longitude: lon2
//           };

          

//           const result = await getCityState(coordinate);
        
        
//           setCity(result.city)
//           setState(result.state)
//           setPostalCode(result.postalCode)
//           setCountry(result.country)
      
          
//           if (res.assignedTo && currentUserId) {
//             const currentAssignment = res.assignedTo.find(cleaner => 
//               cleaner.cleanerId === currentUserId
//             );
//             setCurrentCleanerAssignment(currentAssignment);
//           }
//         // })
//       } catch(e) {
//         console.log(e)
//       } finally {
//         setLoading(false);
//       }
//     }

//     // Calculate penalty impact for the cleaner
//     const calculatePenaltyImpact = () => {
//       if (!schedule || !cleaning_date || !cleaning_time) return null;

//       const bookingTime = new Date(`${cleaning_date}T${cleaning_time}`);
//       const now = new Date();
//       const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);
      
//       let penaltyInfo = {
//         points: 0,
//         tier: 'NONE',
//         description: '',
//         reliabilityImpact: 0,
//         ratingImpact: 0
//       };

//       // Calculate penalty based on timing
//       if (hoursUntilBooking <= 24) {
//         penaltyInfo = {
//           points: 20,
//           tier: 'SEVERE',
//           description: tSafe('less_than_24_hours', 'Less than 24 hours notice'),
//           reliabilityImpact: -15,
//           ratingImpact: -0.4
//         };
//       } else if (hoursUntilBooking <= 48) {
//         penaltyInfo = {
//           points: 10,
//           tier: 'MODERATE',
//           description: tSafe('24_48_hours', '24-48 hours notice'),
//           reliabilityImpact: -8,
//           ratingImpact: -0.2
//         };
//       } else if (hoursUntilBooking <= 72) {
//         penaltyInfo = {
//           points: 5,
//           tier: 'MINOR',
//           description: tSafe('48_72_hours', '48-72 hours notice'),
//           reliabilityImpact: -4,
//           ratingImpact: -0.1
//         };
//       } else {
//         penaltyInfo = {
//           points: 0,
//           tier: 'NONE',
//           description: tSafe('more_than_72_hours', 'More than 72 hours notice'),
//           reliabilityImpact: 0,
//           ratingImpact: 0
//         };
//       }

//       return penaltyInfo;
//     };

//     const canCancelAssignment = () => {
//       if (!schedule || !currentCleanerAssignment) return false;
//       const bookingTime = new Date(`${cleaning_date}T${cleaning_time}`);
//       const now = new Date();
//       const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);
      
//       if (hoursUntilBooking <= 0) return false;
//       if (currentCleanerAssignment.status === 'in_progress') return false;
//       if (currentCleanerAssignment.status === 'completed') return false;
//       if (schedule.status === 'cancelled') return false;
      
//       return true;
//     };

    

//     // Cleaner cancellation handler with penalty integration
//     const handleCancelBooking = async (cancellationData) => {
//       setCancellationLoading(true);
//       console.log("Cleaner cancellation data:", cancellationData);

//       try {
//         // Calculate penalty impact
//         const penaltyImpact = calculatePenaltyImpact();
        
//         const cancellationPayload = {
//           ...cancellationData,
//           cancellationType: 'partial',
//           targetCleanerId: currentUserId,
//           cancelledBy: 'cleaner',
//           penaltyLevel: penaltyImpact?.tier || 'NONE',
//           penaltyPoints: penaltyImpact?.points || 0
//         };

//         const response = await userService.cancelSchedule(
//           scheduleId, 
//           cancellationPayload
//         );
        
//         if (response.data.success) {
//           let message = tSafe('assignment_cancelled_success', 'Your assignment has been cancelled successfully.');
          
//           if (penaltyImpact && penaltyImpact.tier !== 'NONE') {
//             message += tSafe('penalty_applied_message', '\n\nPenalty Applied: {tier} Level\nReliability Impact: {reliability}%\nRating Impact: {rating} stars\n\nThis penalty will decay over 30 days with good performance.', {
//               tier: penaltyImpact.tier,
//               reliability: penaltyImpact.reliabilityImpact,
//               rating: penaltyImpact.ratingImpact
//             });
//           }

//           Alert.alert(
//             penaltyImpact?.tier === 'NONE' ? tSafe('assignment_cancelled', 'Assignment Cancelled') : tSafe('assignment_cancelled_penalty', 'Assignment Cancelled - Penalty Applied'),
//             message,
//             [{ 
//               text: tSafe('ok', 'OK'), 
//               onPress: () => {
//                 setCancelModalVisible(false);
//                 fetchSchedule();
//               }
//             }]
//           );
//         } else {
//           Alert.alert(tSafe('error', 'Error'), response.message || tSafe('failed_to_cancel_assignment', 'Failed to cancel assignment'));
//         }
//       } catch (error) {
//         console.error('Cleaner cancellation error:', error);
//         Alert.alert(tSafe('error', 'Error'), tSafe('failed_to_cancel_assignment_try_again', 'Failed to cancel assignment. Please try again.'));
//       } finally {
//         setCancellationLoading(false);
//       }
//     };

//     const getBookingForCancellation = () => {
//       return {
//         id: scheduleId,
//         date: `${cleaning_date}T${cleaning_time}`,
//         amount: calculateEarnings(),
//         service: tSafe('cleaning_service', 'Cleaning Service'),
//         host: schedule?.hostInfo?.firstname ? `${schedule.hostInfo.firstname} ${schedule.hostInfo.lastname}` : tSafe('host', 'Host'),
//         status: currentCleanerAssignment?.status || 'pending',
//         cleaning_date: cleaning_date,
//         cleaning_time: cleaning_time
//       };
//     };

     
    


//     const calculateEarnings = () => {
//       if (!currentCleanerAssignment) return 0;
      
//       const earningsData = calculateEarningsFromChecklist(
//         schedule.assignedTo, 
//         currentUserId
//       );
      
//       return earningsData.cleanerEarnings;
//     };
    
//     const calculateTotalAmount = () => {
//       const earningsData = calculateEarningsFromChecklist(schedule.assignedTo);
//       return earningsData.totalEarnings;
//     };
    
//     // Add these new functions for detailed earnings display
//     const getEarningsBreakdown = () => {
//       return calculateEarningsFromChecklist(schedule.assignedTo, currentUserId);
//     };

//     // Get current cleaner's checklist data
//     const getCurrentCleanerChecklist = () => {
  
//       if (!currentCleanerAssignment) return null;

//       // If schedule has a checklist structure with groups
//       if (schedule.checklist && currentCleanerAssignment.group) {
//           return {
//               [currentCleanerAssignment.group]: schedule.checklist[currentCleanerAssignment.group]
//           };
//       }
     
//       // If checklist is directly in assignedTo
//       return currentCleanerAssignment.checklist;
//   };
    
//     const getGroupEarnings = () => {
//       return getEarningsByGroup(schedule.assignedTo);
//     };
    
//     const getStatusEarnings = () => {
//       return getEarningsByStatus(schedule.assignedTo);
//     };

//     // const calculateEarnings = () => {
//     //   if (!currentCleanerAssignment) return 0;
//     //   const totalAmount = calculateTotalAmount();
//     //   const assignedTo = schedule.assignedTo || [];
//     //   const cleanerCount = assignedTo.length || 1;
//     //   return totalAmount / cleanerCount;
//     // };

//     // const calculateTotalAmount = () => {
//     //   let total = 0;
//     //   if (Array.isArray(regular_cleaning)) {
//     //     total += regular_cleaning.reduce((sum, item) => sum + (item.price || 0), 0);
//     //   }
//     //   if (Array.isArray(extra)) {
//     //     total += extra.reduce((sum, item) => sum + (item.price || 0), 0);
//     //   }
//     //   return total > 0 ? total : 100;
//     // };

//     const handleOpenDirections = () => {
//       const url = `https://www.google.com/maps/dir/?api=1&origin=${currentUser.location.latitude},${currentUser.location.longitude }&destination=${apartment_latitude},${apartment_longitude}&travelmode=driving`;
//       Linking.openURL(url).catch((err) =>
//         console.error("Failed to open Google Maps", err)
//       );
//     };

//     const gotToTaskScreen = () => {
//       navigation.navigate(ROUTES.cleaner_attach_task_photos,{scheduleId:scheduleId})
//     }

//     const handleClockIn = () => {
//       navigation.navigate(ROUTES.cleaner_clock_in, {
//         scheduleId:scheduleId,
//         schedule:schedule
//       })
//     }

//     const getStatusColor = () => {
//       switch(status) {
//         case 'upcoming': return '#FFA500';
//         case 'in_progress': return COLORS.primary;
//         case 'completed': return '#34C759';
//         default: return '#8E8E93';
//       }
//     };

//     const getStatusIcon = () => {
//       switch(status) {
//         case 'upcoming': return 'clock-outline';
//         case 'in_progress': return 'progress-clock';
//         case 'completed': return 'check-circle';
//         default: return 'calendar';
//       }
//     };

//     const RoomDetail = ({ type, count, size }) => {
//       const icons = {
//         Bedroom: 'bed',
//         Bathroom: 'shower',
//         Kitchen: 'silverware-fork-knife',
//         Livingroom: 'sofa'
//       };
      
//       // Translate room type for display
//       const getTranslatedRoomType = (roomType) => {
//         const map = {
//           Bedroom: tSafe('bedroom', 'Bedroom'),
//           Bathroom: tSafe('bathroom', 'Bathroom'),
//           Kitchen: tSafe('kitchen', 'Kitchen'),
//           Livingroom: tSafe('livingroom', 'Livingroom')
//         };
//         return map[roomType] || roomType;
//       };

//       return (
//         <View style={styles.roomDetail}>
//           <View style={styles.roomIconContainer}>
//             <MaterialCommunityIcons 
//               name={icons[type]} 
//               size={20} 
//               color={COLORS.gray} 
//             />
//           </View>
//           <View style={styles.roomInfo}>
//             <Text style={styles.roomType}>{getTranslatedRoomType(type)}</Text>
//             <Text style={styles.roomSpecs}>
//               {count} {count === 1 ? tSafe('room_singular', 'room') : tSafe('rooms_plural', 'rooms')} • {size} {tSafe('sq_ft', 'sq ft')}
//             </Text>
//           </View>
//           <Text style={styles.roomCount}>{count}</Text>
//         </View>
//       );
//     };

//     if (loading) {
//       return (
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text style={styles.loadingText}>{tSafe('loading_schedule_details', 'Loading schedule details...')}</Text>
//         </View>
//       );
//     }

//     return (
//       <SafeAreaView style={styles.container}>
//         <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        
//         {/* Header with Gradient */}
//         <LinearGradient
//           colors={[COLORS.primary, COLORS.primary]}
//           style={styles.header}
//         >
//           <View style={styles.headerContent}>
//             <TouchableOpacity 
//               style={styles.backButton}
//               onPress={() => navigation.goBack()}
//             >
//               <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
//             </TouchableOpacity>
            
//             <View style={styles.headerTitleContainer}>
//               <Text style={styles.headerTitle}>{tSafe('cleaning_details', 'Cleaning Details')}</Text>
//               <View style={styles.statusPill}>
//                 <MaterialCommunityIcons 
//                   name={getStatusIcon()} 
//                   size={14} 
//                   color="#FFFFFF" 
//                 />
//                 <Text style={styles.statusText}>
//                   {status?.replace('_', ' ') || tSafe('scheduled', 'Scheduled')}
//                 </Text>
//               </View>
//             </View>
            
//             {canCancelAssignment() && (
//               <TouchableOpacity 
//                 style={styles.cancelHeaderButton}
//                 onPress={() => setCancelModalVisible(true)}
//               >
//                 <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
//               </TouchableOpacity>
//             )}
//           </View>
//         </LinearGradient>

//         <Animated.ScrollView 
//           style={[
//             styles.scrollView,
//             {
//               opacity: fadeAnim,
//               transform: [{ translateY: slideAnim }]
//             }
//           ]}
//           showsVerticalScrollIndicator={false}
//         >
//           {/* Location Card */}
//           <View style={styles.card}>
//             <View style={styles.cardHeader}>
//               <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} />
//               <Text style={styles.cardTitle}>{tSafe('location', 'Location')}</Text>
//             </View>
            
//             <Text style={styles.apartmentName}>{apartment_name}</Text>
//             <Text style={styles.address}>{city}, {state} - {postalcode}</Text>
            
//             <View style={styles.locationInfo}>
//               <View style={styles.distanceBadge}>
//                 <MaterialCommunityIcons name="map-marker-distance" size={16} color="#666" />
//                 <Text style={styles.distanceText}>
//                   {distance || 0} {tSafe('miles_away', 'miles away')}
//                 </Text>
//               </View>
              
//               <TouchableOpacity 
//                 style={styles.directionButton}
//                 onPress={handleOpenDirections}
//               >
//                 <MaterialCommunityIcons name="directions" size={16} color={COLORS.primary} />
//                 <Text style={styles.directionText}>{tSafe('directions', 'Directions')}</Text>
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* Property Details Card */}
//           <View style={styles.card}>
//             <View style={styles.cardHeader}>
//               <MaterialCommunityIcons name="home" size={20} color={COLORS.primary} />
//               <Text style={styles.cardTitle}>{tSafe('property_details', 'Property Details')}</Text>
//             </View>
            
//             <View style={styles.roomsList}>
//               {room_type_and_size.map((room, index) => (
//                 <RoomDetail 
//                   key={index}
//                   type={room.type}
//                   count={room.number}
//                   size={room.size}
//                 />
//               ))}
//             </View>
            
//             <View style={styles.totalArea}>
//               <MaterialCommunityIcons name="ruler-square" size={16} color="#666" />
//               <Text style={styles.totalAreaText}>
//                 {tSafe('total_area', 'Total Area')}: {bedroomSize + bathroomSize + kitchenSize + livingroomSize} {tSafe('sq_ft', 'sq ft')}
//               </Text>
//             </View>
//           </View>

//           {/* Schedule Timeline Card */}
//           <View style={styles.card}>
//             <View style={styles.cardHeader}>
//               <MaterialCommunityIcons name="calendar-clock" size={20} color={COLORS.primary} />
//               <Text style={styles.cardTitle}>{tSafe('schedule', 'Schedule')}</Text>
//             </View>
            
//             <View style={styles.timeline}>
//               <View style={styles.timelineItem}>
//                 <View style={[styles.timelineDot, styles.startDot]}>
//                   <MaterialCommunityIcons name="play" size={12} color="#34C759" />
//                 </View>
//                 <View style={styles.timelineContent}>
//                   <Text style={styles.timelineLabel}>{tSafe('start_time', 'START TIME')}</Text>
//                   <Text style={styles.timelineTime}>
//                     {moment(cleaning_time, 'h:mm:ss A').format('h:mm A')}
//                   </Text>
//                 </View>
//               </View>
              
//               <View style={styles.timelineConnector} />
              
//               <View style={styles.timelineItem}>
//                 <View style={[styles.timelineDot, styles.dateDot]}>
//                   <MaterialCommunityIcons name="calendar-blank" size={12} color={COLORS.primary} />
//                 </View>
//                 <View style={styles.timelineContent}>
//                   <Text style={styles.timelineLabel}>{tSafe('date', 'DATE')}</Text>
//                   <Text style={styles.timelineTime}>
//                     {moment(cleaning_date).format('ddd, MMM D, YYYY')}
//                   </Text>
//                 </View>
//               </View>
              
//               <View style={styles.timelineConnector} />
              
//               <View style={styles.timelineItem}>
//                 <View style={[styles.timelineDot, styles.endDot]}>
//                   <MaterialCommunityIcons name="stop" size={12} color="#FF9500" />
//                 </View>
//                 <View style={styles.timelineContent}>
//                   <Text style={styles.timelineLabel}>{tSafe('end_time', 'END TIME')}</Text>
//                   <Text style={styles.timelineTime}>
//                     {moment(cleaning_end_time, 'h:mm:ss A').format('h:mm A')}
//                   </Text>
//                 </View>
//               </View>
//             </View>
            
//             <View style={styles.durationContainer}>
//               <MaterialCommunityIcons name="timer-outline" size={16} color="#666" />
//               <Text style={styles.durationText}>
//                 {(() => {
//                   try {
//                     const start = moment(cleaning_time, 'h:mm:ss A');
//                     const end = moment(cleaning_end_time, 'h:mm:ss A');
//                     const duration = moment.duration(end.diff(start));
//                     const hours = duration.hours();
//                     const minutes = duration.minutes();
//                     if (hours > 0) return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
//                     return `${minutes}m`;
//                   } catch (error) {
//                     return tSafe('duration_not_available', 'Duration not available');
//                   }
//                 })()}
//               </Text>
//             </View>
//           </View>

//           <ChecklistSummary
//             assignedTo={[currentCleanerAssignment]}
//           />

//           <EarningsBreakdownCard 
//             earningsData={getEarningsBreakdown()}
//             currentCleanerId={currentUserId}
//           />
        
        

//           {/* Cancellation Policy Card */}
//           {canCancelAssignment() && (
//             <TouchableOpacity 
//               style={styles.card}
//               onPress={() => setCancelModalVisible(true)}
//             >
//               <View style={styles.cardHeader}>
//                 <MaterialCommunityIcons name="alert-circle" size={20} color="#FF9500" />
//                 <Text style={styles.cardTitle}>{tSafe('cancellation_policy', 'Cancellation Policy')}</Text>
//                 <MaterialCommunityIcons name="chevron-right" size={20} color="#C7C7CC" />
//               </View>
//               <Text style={styles.policyText}>
//                 {tSafe('cancellation_policy_text', 'View cancellation terms and potential penalties')}
//               </Text>
//             </TouchableOpacity>
//           )}
//         </Animated.ScrollView>

//         {/* Fixed Action Button */}
//         <View style={styles.actionContainer}>
        
//           <View style={styles.priceContainer}>
//             <Text style={styles.priceLabel}>{tSafe('your_earnings', 'Your Earnings')}</Text>
//             <Text style={styles.priceValue}>
//               {geolocationData.currency.symbol}{calculateEarnings().toFixed(2)}
//             </Text>
//           </View>
   
          
//           {status === 'upcoming' && canCancelAssignment() ? (
//             <TouchableOpacity 
//               style={[styles.actionButton, styles.cancelButton]}
//               onPress={() => setCancelModalVisible(true)}
//             >
//               <MaterialCommunityIcons name="close-circle" size={20} color="#FFFFFF" />
//               <Text style={styles.actionButtonText}>{tSafe('cancel_assignment', 'Cancel Assignment')}</Text>
//             </TouchableOpacity>
//           ) : status === 'in_progress' ? (
//             <TouchableOpacity 
//               style={[styles.actionButton, styles.primaryButton]}
//               onPress={handleClockIn}
//             >
//               <MaterialCommunityIcons name="timer-outline" size={20} color="#FFFFFF" />
//               <Text style={styles.actionButtonText}>{tSafe('clock_in', 'Clock In')}</Text>
//             </TouchableOpacity>
//           ) : status === 'in_progress' ? (
//             <TouchableOpacity 
//               style={[styles.actionButton, styles.primaryButton]}
//               onPress={gotToTaskScreen}
//             >
//               <MaterialCommunityIcons name="camera" size={20} color="#FFFFFF" />
//               <Text style={styles.actionButtonText}>{tSafe('continue_work', 'Continue Work')}</Text>
//             </TouchableOpacity>
//           ) : null}
//         </View>

//         {/* Cancellation Modal */}
//         <CancelScheduleModal
//           visible={cancelModalVisible}
//           onClose={() => setCancelModalVisible(false)}
//           booking={getBookingForCancellation()}
//           userType="cleaner"
//           onCancelBooking={handleCancelBooking}
//           cleaners={[currentCleanerAssignment].filter(Boolean)}
//           cancellationType="partial"
//           targetCleaner={currentCleanerAssignment}
//           penaltyImpact={calculatePenaltyImpact()} // Add penalty impact data
//         />
//       </SafeAreaView>
//     );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8F9FA',
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F8F9FA',
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: '#666',
//   },
//   header: {
//     paddingTop: 60,
//     paddingBottom: 20,
//     paddingHorizontal: 20,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   backButton: {
//     padding: 8,
//   },
//   headerTitleContainer: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#FFFFFF',
//     marginBottom: 8,
//   },
//   statusPill: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     gap: 6,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#FFFFFF',
//     textTransform: 'capitalize',
//   },
//   cancelHeaderButton: {
//     padding: 8,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     borderRadius: 20,
//   },
//   scrollView: {
//     flex: 1,
//     padding: 16,
//   },
//   card: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//     gap: 12,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1C1C1E',
//     flex: 1,
//   },
//   apartmentName: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#1C1C1E',
//     marginBottom: 4,
//   },
//   address: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 16,
//     lineHeight: 22,
//   },
//   locationInfo: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   distanceBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F2F2F7',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 12,
//     gap: 6,
//   },
//   distanceText: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '500',
//   },
//   directionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     backgroundColor: '#E7F3FF',
//     borderRadius: 12,
//     gap: 6,
//   },
//   directionText: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontWeight: '600',
//   },
//   // Property Details Styles
//   roomsList: {
//     gap: 12,
//     marginBottom: 16,
//   },
//   roomDetail: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//     backgroundColor: '#F8F9FA',
//     borderRadius: 12,
//     gap: 12,
//   },
//   roomIconContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#E7F3FF',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   roomInfo: {
//     flex: 1,
//   },
//   roomType: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1C1C1E',
//     marginBottom: 2,
//   },
//   roomSpecs: {
//     fontSize: 14,
//     color: '#666',
//   },
//   roomCount: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },
//   totalArea: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 12,
//     backgroundColor: '#F2F2F7',
//     borderRadius: 12,
//     gap: 8,
//   },
//   totalAreaText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#666',
//   },
//   // Timeline Styles
//   timeline: {
//     marginBottom: 16,
//   },
//   timelineItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   timelineDot: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     borderWidth: 2,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 16,
//     backgroundColor: '#FFFFFF',
//   },
//   startDot: {
//     borderColor: '#34C759',
//   },
//   dateDot: {
//     borderColor: COLORS.primary,
//   },
//   endDot: {
//     borderColor: '#FF9500',
//   },
//   timelineConnector: {
//     width: 2,
//     height: 20,
//     backgroundColor: '#E5E5EA',
//     marginLeft: 11,
//     marginBottom: 8,
//   },
//   timelineContent: {
//     flex: 1,
//   },
//   timelineLabel: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#8E8E93',
//     marginBottom: 4,
//     letterSpacing: 0.5,
//   },
//   timelineTime: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1C1C1E',
//   },
//   durationContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 12,
//     backgroundColor: '#F2F2F7',
//     borderRadius: 12,
//     gap: 8,
//   },
//   durationText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#666',
//   },
//   // Services Styles
//   servicesList: {
//     gap: 12,
//   },
//   serviceItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   serviceText: {
//     fontSize: 16,
//     color: '#1C1C1E',
//     flex: 1,
//   },
//   // Earnings Styles
//   earningsContainer: {
//     alignItems: 'center',
//     padding: 16,
//   },
//   earningsAmount: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: COLORS.primary,
//     marginBottom: 8,
//   },
//   earningsLabel: {
//     fontSize: 14,
//     color: '#666',
//     textAlign: 'center',
//   },
//   policyText: {
//     fontSize: 14,
//     color: '#666',
//     lineHeight: 20,
//   },
//   // Action Container
//   actionContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: '#FFFFFF',
//     borderTopWidth: 1,
//     borderTopColor: '#E5E5EA',
//     gap: 16,
//   },
//   priceContainer: {
//     flex: 1,
//   },
//   priceLabel: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 4,
//   },
//   priceValue: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#1C1C1E',
//   },
//   actionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 24,
//     paddingVertical: 16,
//     borderRadius: 14,
//     gap: 8,
//     minWidth: 140,
//     justifyContent: 'center',
//   },
//   primaryButton: {
//     backgroundColor: COLORS.primary,
//   },
//   cancelButton: {
//     backgroundColor: '#DC3545',
//   },
//   actionButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#FFFFFF',
//   },
// });