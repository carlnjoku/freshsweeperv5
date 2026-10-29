import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
  useMemo,
} from 'react';

import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Modal,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';

import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';

import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';

import {
  Feather,
  MaterialIcons,
  AntDesign,
} from '@expo/vector-icons';

import moment from 'moment';

import {
  Chip,
} from 'react-native-paper';

import userService from '../../services/connection/userService';
import { AuthContext } from '../../context/AuthContext';
import { useBookingContext } from '../../context/BookingContext';
import { useTheme } from '../../theme';
import AppText from '../../ui/AppText';
import AppCard from '../../ui/AppCard';
import { tSafe } from '../../utils/tSafe';
import ROUTES from '../../constants/routes';
import CustomHeader from '../../components/shared/CustomHeader';
import NewBooking from './NewBooking';
import CleanerCard from '../../components/cleaner/CleanerCard';
import CleanerCardSkeleton from '../../components/cleaner/CleanerCardSkeleton';

const SORT_OPTIONS = [
  { label: 'Nearest first', value: 'distance' },
  { label: 'Name A–Z', value: 'name' },
];

const EMPTY_STATUS_COUNTS = {
  notified: 0,
  pending: 0,
  accepted: 0,
  declined: 0,
};

const normalizeStatus = (value) =>
  String(value || 'not_notified')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

const FindCleaners = ({ navigation }) => {
  const { currentUserId, currentUser } = useContext(AuthContext);

  const {
    modalVisible,
    handleCreateSchedule,
  } = useBookingContext();

  const { theme, isDark } = useTheme();

  const styles = useMemo(
    () => createStyles(theme, isDark),
    [theme, isDark]
  );

  // ==================================================
  // Navigation state
  // ==================================================

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // ==================================================
  // Data state
  // ==================================================

  const [apartments, setApartments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [cleaners, setCleaners] = useState([]);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ==================================================
  // Cleaner response status state
  // ==================================================

  const [cleanerStatuses, setCleanerStatuses] = useState({});
  const [statusCounts, setStatusCounts] = useState({
    ...EMPTY_STATUS_COUNTS,
  });

  // ==================================================
  // Cleaner search and sorting
  // ==================================================

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('distance');

  // Prevent overlapping status requests.
  const statusRefreshInProgress = useRef(false);

  // Prevent stale recommendation requests from updating
  // the currently selected schedule.
  const recommendationRequestId = useRef(0);

  const selectedScheduleId = selectedSchedule?._id
    ? String(selectedSchedule._id)
    : null;

  
  // ==================================================
  // Cleaner profile modal state
  // ==================================================

  const [profileVisible, setProfileVisible] = useState(false);
  const [profileCleaner, setProfileCleaner] = useState(null);
  const [profileTab, setProfileTab] = useState('about');

  const [profileAvailability, setProfileAvailability] = useState(null);
  const [profileReviews, setProfileReviews] = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);
  // ==================================================
  // Helpers
  // ==================================================

  // ==================================================
  // Close cleaner profile modal
  // ==================================================

  const closeCleanerProfile = useCallback(() => {
    setProfileVisible(false);
  }, []);

  const getCleanerId = useCallback((cleaner) => {
    const id =
      cleaner?.cleanerId ??
      cleaner?.cleaner_id ??
      cleaner?._id;

    return id == null ? '' : String(id);
  }, []);

  const getCleanerName = useCallback((cleaner) => {
    const firstName =
      cleaner?.firstname ??
      cleaner?.firstName ??
      cleaner?.first_name ??
      '';

    const lastName =
      cleaner?.lastname ??
      cleaner?.lastName ??
      cleaner?.last_name ??
      '';

    const fullName = `${firstName} ${lastName}`.trim();

    return (
      fullName ||
      cleaner?.name ||
      cleaner?.displayName ||
      cleaner?.email ||
      tSafe('cleaner', 'Cleaner')
    );
  }, []);

  const getCleanerStatus = useCallback(
    (cleaner) => {
      const cleanerId = getCleanerId(cleaner);

      const statusFromSchedule =
        cleanerId && cleanerStatuses[cleanerId]
          ? cleanerStatuses[cleanerId]
          : null;

      const statusFromRecommendation =
        cleaner?.status ??
        cleaner?.response_status ??
        cleaner?.responseStatus ??
        null;

      return normalizeStatus(
        statusFromSchedule ??
        statusFromRecommendation ??
        'not_notified'
      );
    },
    [cleanerStatuses, getCleanerId]
  );

  const getCleanerDistance = useCallback((cleaner) => {
    const rawDistance =
      cleaner?.distance_miles ??
      cleaner?.distanceFromApartment ??
      null;

    if (
      rawDistance === null ||
      rawDistance === undefined ||
      rawDistance === ''
    ) {
      return null;
    }

    const distance = Number(rawDistance);

    return Number.isFinite(distance) ? distance : null;
  }, []);

  const formatDistance = useCallback(
    (cleaner) => {
      const distance = getCleanerDistance(cleaner);

      if (distance === null) {
        return null;
      }

      return `${distance.toFixed(1)} ${tSafe(
        'miles_away',
        'miles away'
      )}`;
    },
    [getCleanerDistance]
  );

  const formatCleaningTime = useCallback((value) => {
    if (!value) {
      return '';
    }

    const parsed = moment(
      value,
      ['HH:mm:ss', 'H:mm:ss', 'HH:mm', 'H:mm'],
      true
    );

    return parsed.isValid()
      ? parsed.format('h:mm A')
      : value;
  }, []);

  const getCleanerStatusDisplay = useCallback(
    (cleaner) => {
      const status = getCleanerStatus(cleaner);

      const statusMap = {
        not_notified: {
          label: tSafe('not_contacted', 'Not contacted'),
          color: '#64748B',
          backgroundColor: '#F1F5F9',
          icon: 'clock',
        },

        notified: {
          label: tSafe('request_sent', 'Request sent'),
          color: '#1D4ED8',
          backgroundColor: '#DBEAFE',
          icon: 'send',
        },

        pending: {
          label: tSafe('pending', 'Pending'),
          color: '#92400E',
          backgroundColor: '#FEF3C7',
          icon: 'clock',
        },

        accepted: {
          label: tSafe('accepted', 'Accepted'),
          color: '#15803D',
          backgroundColor: '#DCFCE7',
          icon: 'check-circle',
        },

        declined: {
          label: tSafe('declined', 'Declined'),
          color: '#B91C1C',
          backgroundColor: '#FEE2E2',
          icon: 'x-circle',
        },

        assigned: {
          label: tSafe('assigned', 'Assigned'),
          color: '#6D28D9',
          backgroundColor: '#EDE9FE',
          icon: 'check-circle',
        },

        unavailable: {
          label: tSafe('unavailable', 'Unavailable'),
          color: '#B91C1C',
          backgroundColor: '#FEE2E2',
          icon: 'alert-circle',
        },

        cancelled: {
          label: tSafe('cancelled', 'Cancelled'),
          color: '#B91C1C',
          backgroundColor: '#FEE2E2',
          icon: 'x-circle',
        },
      };

      return (
        statusMap[status] || {
          label: status
            ? status
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (letter) =>
                  letter.toUpperCase()
                )
            : tSafe('status_unavailable', 'Status unavailable'),
          color: '#64748B',
          backgroundColor: '#F1F5F9',
          icon: 'info',
        }
      );
    },
    [getCleanerStatus]
  );

  // ==================================================
  // Recommendation progress
  // ==================================================

  const getRecommendationProgress = useCallback(() => {
    const notified = statusCounts.notified || 0;
    const pending = statusCounts.pending || 0;
    const accepted = statusCounts.accepted || 0;
    const declined = statusCounts.declined || 0;

    if (loading) {
      return {
        title: tSafe('finding_cleaners', 'Finding cleaners'),
        message: tSafe(
          'loading_cleaner_recommendations',
          'Please wait while we retrieve recommendations and update the results.'
        ),
        icon: 'search',
        color: theme.brand.primary,
        backgroundColor: theme.surface.elevated,
        showSpinner: true,
      };
    }

    if (accepted > 0) {
      return {
        title: tSafe(
          'cleaners_have_accepted',
          'Cleaners have accepted'
        ),
        message: tSafe(
          'accepted_cleaners_review_message',
          'Review the profiles of cleaners who have accepted your request. You remain in control of the final selection.'
        ),
        icon: 'check-circle',
        color: '#15803D',
        backgroundColor: '#DCFCE7',
        showSpinner: false,
      };
    }

    if (notified > 0 || pending > 0) {
      return {
        title: tSafe(
          'waiting_for_responses',
          'Waiting for cleaner responses'
        ),
        message: tSafe(
          'waiting_for_responses_description',
          'The recommendation process is underway. Accepted cleaners will appear here when they respond.'
        ),
        icon: 'clock',
        color: '#1D4ED8',
        backgroundColor: '#DBEAFE',
        showSpinner: false,
      };
    }

    if (declined > 0) {
      return {
        title: tSafe(
          'no_accepted_cleaners',
          'No accepted cleaners yet'
        ),
        message: tSafe(
          'declined_cleaners_description',
          'Some cleaners have declined. Keep checking while the recommendation process continues.'
        ),
        icon: 'alert-circle',
        color: '#B45309',
        backgroundColor: '#FEF3C7',
        showSpinner: false,
      };
    }

    return {
      title: tSafe(
        'preparing_results',
        'Preparing your results'
      ),
      message: tSafe(
        'accepted_cleaners_will_appear',
        'Accepted cleaners will appear here when they respond to your request.'
      ),
      icon: 'search',
      color: theme.brand.primary,
      backgroundColor: theme.surface.elevated,
      showSpinner: false,
    };
  }, [loading, statusCounts, theme]);

  // ==================================================
  // Derived cleaner lists
  // ==================================================

  // IMPORTANT:
  // Only cleaners whose current response status is accepted
  // can be displayed as cleaner results.
  const acceptedCleaners = useMemo(() => {
    const uniqueCleaners = new Map();

    cleaners.forEach((cleaner) => {
      const cleanerId = getCleanerId(cleaner);

      if (!cleanerId) {
        return;
      }

      if (getCleanerStatus(cleaner) !== 'accepted') {
        return;
      }

      // Avoid showing duplicate cards for the same cleaner.
      if (!uniqueCleaners.has(cleanerId)) {
        uniqueCleaners.set(cleanerId, {
          ...cleaner,
          _id: cleanerId,
          cleanerId,
        });
      }
    });

    return Array.from(uniqueCleaners.values());
  }, [cleaners, getCleanerId, getCleanerStatus]);

  const filteredCleaners = useMemo(() => {
    const normalizedQuery = searchQuery
      .trim()
      .toLowerCase();

    let result = acceptedCleaners.filter((cleaner) => {
      const cleanerName = getCleanerName(cleaner)
        .toLowerCase();

      const cleanerEmail = String(
        cleaner?.email ?? ''
      ).toLowerCase();

      return (
        !normalizedQuery ||
        cleanerName.includes(normalizedQuery) ||
        cleanerEmail.includes(normalizedQuery)
      );
    });

    result = [...result].sort((a, b) => {
      if (sortBy === 'name') {
        return getCleanerName(a).localeCompare(
          getCleanerName(b)
        );
      }

      const distanceA = getCleanerDistance(a);
      const distanceB = getCleanerDistance(b);

      if (
        distanceA === null &&
        distanceB === null
      ) {
        return getCleanerName(a).localeCompare(
          getCleanerName(b)
        );
      }

      if (distanceA === null) return 1;
      if (distanceB === null) return -1;

      return distanceA - distanceB;
    });

    return result;
  }, [
    acceptedCleaners,
    searchQuery,
    sortBy,
    getCleanerName,
    getCleanerDistance,
  ]);

  // ==================================================
  // Cleaner status updates
  // ==================================================

  const updateCleanerStatuses = useCallback(
    (scheduleData) => {
      const notifiedCleaners = Array.isArray(
        scheduleData?.notified_cleaners
      )
        ? scheduleData.notified_cleaners
        : [];

      const statusMap = {};
      const uniqueStatusCounts = {};

      // Use the last record encountered for each cleaner.
      // Counts are calculated after the status map is built
      // to avoid duplicate notification records inflating counts.
      notifiedCleaners.forEach((entry) => {
        const rawCleanerId =
          entry?.cleanerId ??
          entry?.cleaner_id ??
          entry?.cleaner?._id;

        if (
          rawCleanerId === null ||
          rawCleanerId === undefined
        ) {
          return;
        }

        const cleanerId = String(rawCleanerId);
        const status = normalizeStatus(
          entry?.status || 'notified'
        );

        statusMap[cleanerId] = status;
      });

      Object.entries(statusMap).forEach(
        ([cleanerId, status]) => {
          uniqueStatusCounts[cleanerId] = status;
        }
      );

      const counts = { ...EMPTY_STATUS_COUNTS };

      Object.values(uniqueStatusCounts).forEach(
        (status) => {
          if (
            Object.prototype.hasOwnProperty.call(
              counts,
              status
            )
          ) {
            counts[status] += 1;
          }
        }
      );

      setCleanerStatuses(statusMap);
      setStatusCounts(counts);
    },
    []
  );

  const refreshSelectedScheduleStatus = useCallback(
    async (scheduleId) => {
      if (
        !scheduleId ||
        statusRefreshInProgress.current
      ) {
        return;
      }

      statusRefreshInProgress.current = true;

      try {
        const response =
          await userService.getScheduleById(
            scheduleId
          );

        updateCleanerStatuses(response?.data);
      } catch (error) {
        console.warn(
          'Unable to refresh cleaner statuses:',
          error?.message
        );
      } finally {
        statusRefreshInProgress.current = false;
      }
    },
    [updateCleanerStatuses]
  );

  // ==================================================
  // Read cleaner recommendations
  // ==================================================

  const fetchCleanerRecommendations = useCallback(
    async (scheduleId) => {
      if (!scheduleId) {
        return [];
      }

      // This endpoint reads recommendations only.
      // The recommendation process is started separately.
      const response =
        await userService.findCleaners(scheduleId);

      const recommendationData = Array.isArray(
        response?.data
      )
        ? response.data
        : Array.isArray(
            response?.data?.cleaners
          )
          ? response.data.cleaners
          : [];

      return recommendationData;
    },
    []
  );

  // ==================================================
  // Get upcoming schedules for a property
  // ==================================================

  const getUpcomingPropertySchedules = useCallback(
    (scheduleData, property) => {
      if (
        !Array.isArray(scheduleData) ||
        !property
      ) {
        return [];
      }

      return scheduleData.filter((item) => {
        const schedule = item?.schedule;

        if (!schedule) {
          return false;
        }

        if (
          schedule.apartment_name !==
          property.apt_name
        ) {
          return false;
        }

        const cleaningDate = schedule.cleaning_date;
        const cleaningTime = schedule.cleaning_time;

        if (!cleaningDate || !cleaningTime) {
          return false;
        }

        const cleaningDateTime = moment(
          `${cleaningDate} ${cleaningTime}`,
          [
            'YYYY-MM-DD HH:mm:ss',
            'YYYY-MM-DD H:mm:ss',
            'YYYY-MM-DD HH:mm',
            'YYYY-MM-DD H:mm',
          ],
          true
        );

        return (
          cleaningDateTime.isValid() &&
          cleaningDateTime.isSameOrAfter(moment())
        );
      });
    },
    []
  );

  // ==================================================
  // Initial property fetch
  // ==================================================

  useEffect(() => {
    let active = true;

    const fetchProperties = async () => {
      if (!currentUserId) {
        return;
      }

      try {
        const response = await userService.getApartment(
          currentUserId
        );

        if (!active) {
          return;
        }

        const propertyData = Array.isArray(
          response?.data
        )
          ? response.data
          : [];

        if (propertyData.length === 0) {
          setApartments([]);

          Alert.alert(
            tSafe('property_required', 'Property Required'),
            tSafe(
              'property_required_description',
              'Add at least one property before finding cleaners.'
            ),
            [
              {
                text: tSafe('ok', 'OK'),
                onPress: () => {
                  navigation.replace(
                    ROUTES.host_dashboard
                  );
                },
              },
            ],
            { cancelable: false }
          );

          return;
        }

        setApartments(propertyData);
      } catch (error) {
        if (!active) return;

        console.error(
          'Error fetching properties:',
          error
        );

        Alert.alert(
          tSafe('error', 'Error'),
          tSafe(
            'failed_load_properties',
            'Failed to load your properties. Please try again.'
          )
        );
      }
    };

    fetchProperties();

    return () => {
      active = false;
    };
  }, [currentUserId, navigation]);

  // ==================================================
  // Fetch schedules when property changes
  // ==================================================

  useEffect(() => {
    let active = true;

    const fetchPropertySchedules = async () => {
      if (!selectedProperty || !currentUserId) {
        setSchedules([]);
        return;
      }

      setSelectedSchedule(null);
      setCleaners([]);
      setCleanerStatuses({});
      setSearchQuery('');
      setSortBy('distance');
      setStatusCounts({ ...EMPTY_STATUS_COUNTS });

      try {
        const response =
          await userService.getUpcomingSchedulesByHostId(
            currentUserId
          );

        if (!active) return;

        const scheduleData = Array.isArray(
          response?.data
        )
          ? response.data
          : [];

        setSchedules(
          getUpcomingPropertySchedules(
            scheduleData,
            selectedProperty
          )
        );
      } catch (error) {
        if (!active) return;

        console.error(
          'Error fetching property schedules:',
          error
        );

        setSchedules([]);
      }
    };

    fetchPropertySchedules();

    return () => {
      active = false;
    };
  }, [
    selectedProperty,
    currentUserId,
    getUpcomingPropertySchedules,
  ]);

  // ==================================================
  // Fetch recommendations when schedule changes
  // ==================================================

  useEffect(() => {
    let active = true;

    const requestId =
      ++recommendationRequestId.current;

    const fetchCleanersForSchedule = async () => {
      if (!selectedScheduleId) {
        setCleaners([]);
        setCleanerStatuses({});
        setLoading(false);
        setStatusCounts({ ...EMPTY_STATUS_COUNTS });
        return;
      }

      setLoading(true);
      setCleaners([]);
      setCleanerStatuses({});
      setSearchQuery('');
      setSortBy('distance');

      try {
        const recommendationData =
          await fetchCleanerRecommendations(
            selectedScheduleId
          );

        if (
          !active ||
          requestId !== recommendationRequestId.current
        ) {
          return;
        }

        setCleaners(recommendationData);

        const scheduleResponse =
          await userService.getScheduleById(
            selectedScheduleId
          );

        if (
          !active ||
          requestId !== recommendationRequestId.current
        ) {
          return;
        }

        updateCleanerStatuses(scheduleResponse?.data);
      } catch (error) {
        if (
          !active ||
          requestId !== recommendationRequestId.current
        ) {
          return;
        }

        console.error(
          'Error fetching cleaner recommendations:',
          error
        );

        setCleaners([]);

        Alert.alert(
          tSafe('error', 'Error'),
          tSafe(
            'failed_load_cleaners',
            'Unable to load recommended cleaners. Please try again.'
          )
        );
      } finally {
        if (
          active &&
          requestId === recommendationRequestId.current
        ) {
          setLoading(false);
        }
      }
    };

    fetchCleanersForSchedule();

    return () => {
      active = false;
    };
  }, [
    selectedScheduleId,
    fetchCleanerRecommendations,
    updateCleanerStatuses,
  ]);

  // ==================================================
  // Poll cleaner statuses every 10 seconds
  // ==================================================

  useEffect(() => {
    if (
      !selectedScheduleId ||
      currentStep !== 3 ||
      loading
    ) {
      return undefined;
    }

    const interval = setInterval(() => {
      refreshSelectedScheduleStatus(
        selectedScheduleId
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [
    selectedScheduleId,
    currentStep,
    loading,
    refreshSelectedScheduleStatus,
  ]);

  // ==================================================
  // Refresh when screen regains focus
  // ==================================================

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const refreshData = async () => {
        if (!currentUserId) return;

        try {
          const response =
            await userService.getApartment(
              currentUserId
            );

          if (!active) return;

          const newApartments = Array.isArray(
            response?.data
          )
            ? response.data
            : [];

          setApartments(newApartments);

          if (newApartments.length === 0) {
            setSelectedProperty(null);
            setSelectedSchedule(null);
            setCleaners([]);
            setSchedules([]);
            setCurrentStep(1);
            return;
          }

          if (!selectedProperty) return;

          const propertyExists = newApartments.some(
            (property) =>
              String(property._id) ===
              String(selectedProperty._id)
          );

          if (!propertyExists) {
            setSelectedProperty(null);
            setSelectedSchedule(null);
            setCleaners([]);
            setSchedules([]);
            setCurrentStep(1);
            return;
          }

          const schedulesResponse =
            await userService.getUpcomingSchedulesByHostId(
              currentUserId
            );

          if (!active) return;

          const scheduleData = Array.isArray(
            schedulesResponse?.data
          )
            ? schedulesResponse.data
            : [];

          const upcomingSchedules =
            getUpcomingPropertySchedules(
              scheduleData,
              selectedProperty
            );

          setSchedules(upcomingSchedules);

          if (selectedSchedule) {
            const scheduleExists =
              upcomingSchedules.some(
                (schedule) =>
                  String(schedule._id) ===
                  String(selectedSchedule._id)
              );

            if (!scheduleExists) {
              setSelectedSchedule(null);
              setCleaners([]);
              setCurrentStep(2);
              return;
            }

            await refreshSelectedScheduleStatus(
              String(selectedSchedule._id)
            );
          }
        } catch (error) {
          if (active) {
            console.error(
              'Error refreshing FindCleaners:',
              error
            );
          }
        }
      };

      refreshData();

      return () => {
        active = false;
      };
    }, [
      currentUserId,
      selectedProperty,
      selectedSchedule,
      getUpcomingPropertySchedules,
      refreshSelectedScheduleStatus,
    ])
  );

  // ==================================================
  // Property selection
  // ==================================================

  const handleSelectProperty = useCallback(
    (property) => {
      if (
        String(selectedProperty?._id) ===
        String(property?._id)
      ) {
        return;
      }

      setSelectedProperty(property);
      setSelectedSchedule(null);
      setCleaners([]);
      setCleanerStatuses({});
      setSchedules([]);
      setSearchQuery('');
      setSortBy('distance');
      setStatusCounts({ ...EMPTY_STATUS_COUNTS });
      setCurrentStep(1);
    },
    [selectedProperty]
  );

  // ==================================================
  // Schedule selection
  // ==================================================

  const handleSelectSchedule = useCallback(
    (schedule) => {
      if (
        String(selectedSchedule?._id) ===
        String(schedule?._id)
      ) {
        return;
      }

      setSelectedSchedule(schedule);
      setCleaners([]);
      setCleanerStatuses({});
      setSearchQuery('');
      setSortBy('distance');
      setStatusCounts({ ...EMPTY_STATUS_COUNTS });
      setCurrentStep(2);
    },
    [selectedSchedule]
  );

  // ==================================================
  // Navigation and recommendation trigger
  // ==================================================

  const handleStepNavigation = useCallback(async () => {
    if (
      currentStep === 1 &&
      selectedProperty
    ) {
      setCurrentStep(2);
      return;
    }

    if (
      currentStep !== 2 ||
      !selectedSchedule ||
      loading
    ) {
      return;
    }

    try {
      setLoading(true);

      // Preserve the existing recommendation trigger.
      // findCleaners() is read-only and must not replace it.
      const response =
        await userService.startCleanerRecommendation(
          selectedSchedule._id
        );

      if (response?.data?.status === 'success') {
        setCurrentStep(3);

        const scheduleId = String(
          selectedSchedule._id
        );

        const recommendationData =
          await fetchCleanerRecommendations(scheduleId);

        setCleaners(recommendationData);

        // Fetch schedule status directly here rather than
        // calling the guarded polling function. This ensures
        // the first status fetch is not skipped by an
        // already-running polling request.
        try {
          const scheduleResponse =
            await userService.getScheduleById(scheduleId);

          updateCleanerStatuses(scheduleResponse?.data);
        } catch (statusError) {
          console.warn(
            'Unable to load initial cleaner statuses:',
            statusError?.message
          );
        }
      } else {
        Alert.alert(
          tSafe('unable_to_start_search', 'Unable to Start Search'),
          tSafe(
            'recommendation_start_failed',
            'The cleaner recommendation flow could not be started.'
          )
        );
      }
    } catch (error) {
      console.error(
        'Error starting cleaner recommendation flow:',
        error?.response?.data || error?.message
      );

      Alert.alert(
        tSafe('unable_to_start_search', 'Unable to Start Search'),
        error?.response?.data?.detail?.message ||
          error?.response?.data?.detail ||
          tSafe(
            'failed_start_cleaner_search',
            'Unable to start the cleaner search. Please try again.'
          )
      );
    } finally {
      setLoading(false);
    }
  }, [
    currentStep,
    selectedProperty,
    selectedSchedule,
    loading,
    fetchCleanerRecommendations,
    updateCleanerStatuses,
  ]);

  const handleCloseCreateBooking = useCallback(() => {
    handleCreateSchedule(false);
  }, [handleCreateSchedule]);

  // ==================================================
  // Pull-to-refresh
  // ==================================================

  const handleRefresh = useCallback(async () => {
    if (refreshing || !currentUserId) return;

    setRefreshing(true);

    try {
      const response =
        await userService.getApartment(
          currentUserId
        );

      const newApartments = Array.isArray(
        response?.data
      )
        ? response.data
        : [];

      setApartments(newApartments);

      if (newApartments.length === 0) {
        setSelectedProperty(null);
        setSelectedSchedule(null);
        setSchedules([]);
        setCleaners([]);
        setCleanerStatuses({});
        setStatusCounts({ ...EMPTY_STATUS_COUNTS });
        setCurrentStep(1);

        Alert.alert(
          tSafe('property_required', 'Property Required'),
          tSafe(
            'property_required_description',
            'Add a property before finding cleaners.'
          ),
          [
            {
              text: tSafe('ok', 'OK'),
              onPress: () =>
                navigation.replace(
                  ROUTES.host_dashboard
                ),
            },
          ]
        );

        return;
      }

      if (!selectedProperty) return;

      const propertyExists = newApartments.some(
        (property) =>
          String(property._id) ===
          String(selectedProperty._id)
      );

      if (!propertyExists) {
        setSelectedProperty(null);
        setSelectedSchedule(null);
        setSchedules([]);
        setCleaners([]);
        setCleanerStatuses({});
        setStatusCounts({ ...EMPTY_STATUS_COUNTS });
        setCurrentStep(1);
        return;
      }

      const scheduleResponse =
        await userService.getUpcomingSchedulesByHostId(
          currentUserId
        );

      const scheduleData = Array.isArray(
        scheduleResponse?.data
      )
        ? scheduleResponse.data
        : [];

      const upcomingSchedules =
        getUpcomingPropertySchedules(
          scheduleData,
          selectedProperty
        );

      setSchedules(upcomingSchedules);

      if (!selectedScheduleId) return;

      const scheduleExists =
        upcomingSchedules.some(
          (schedule) =>
            String(schedule._id) ===
            selectedScheduleId
        );

      if (!scheduleExists) {
        setSelectedSchedule(null);
        setCleaners([]);
        setCleanerStatuses({});
        setStatusCounts({ ...EMPTY_STATUS_COUNTS });
        setCurrentStep(2);
        return;
      }

      const recommendationData =
        await fetchCleanerRecommendations(
          selectedScheduleId
        );

      setCleaners(recommendationData);

      const scheduleStatusResponse =
        await userService.getScheduleById(
          selectedScheduleId
        );

      updateCleanerStatuses(scheduleStatusResponse?.data);
    } catch (error) {
      console.error(
        'FindCleaners refresh error:',
        error
      );

      Alert.alert(
        tSafe('error', 'Error'),
        tSafe(
          'refresh_failed',
          'Unable to refresh the screen. Please try again.'
        )
      );
    } finally {
      setRefreshing(false);
    }
  }, [
    refreshing,
    currentUserId,
    selectedProperty,
    selectedScheduleId,
    navigation,
    getUpcomingPropertySchedules,
    fetchCleanerRecommendations,
    updateCleanerStatuses,
  ]);

  // ==================================================
  // Open cleaner profile
  // ==================================================

  // ==================================================
  // Open cleaner profile modal
  // ==================================================

  const handleOpenCleanerProfile = useCallback(
    async (cleaner) => {
      const cleanerId = getCleanerId(cleaner);

      if (!cleanerId) {
        Alert.alert(
          tSafe('error', 'Error'),
          tSafe(
            'cleaner_id_missing',
            'The cleaner profile could not be opened because the cleaner ID is missing.'
          )
        );

        return;
      }

      const normalizedCleaner = {
        ...cleaner,
        _id: cleanerId,
        cleanerId,
        distanceFromApartment: getCleanerDistance(cleaner),
      };

      // Store the selected cleaner.
      setProfileCleaner(normalizedCleaner);

      // Open the About tab by default.
      setProfileTab('about');

      // Clear information belonging to the previous cleaner.
      setProfileAvailability(null);
      setProfileReviews([]);

      // Open the modal immediately.
      setProfileVisible(true);

      // Show the loading indicator while fetching details.
      setProfileLoading(true);

      try {
        const [
          availabilityResponse,
          reviewsResponse,
        ] = await Promise.all([
          userService.getCleanerAvailability(cleanerId),
          userService.getCleanerFeedbacks(cleanerId),
        ]);

        setProfileAvailability(
          availabilityResponse?.data?.data ??
          availabilityResponse?.data ??
          null
        );

        const reviewsData =
          reviewsResponse?.data?.data ??
          reviewsResponse?.data ??
          [];

        setProfileReviews(
          Array.isArray(reviewsData)
            ? reviewsData
            : []
        );
      } catch (error) {
        console.warn(
          'Unable to load cleaner profile details:',
          error?.response?.data?.detail ||
            error?.message
        );

        Alert.alert(
          tSafe('error', 'Error'),
          tSafe(
            'profile_details_failed',
            'Some cleaner profile details could not be loaded. Please try again.'
          )
        );
      } finally {
        setProfileLoading(false);
      }
    },
    [
      getCleanerId,
      getCleanerDistance,
    ]
  );

  // const handleOpenCleanerProfile = useCallback(
  //   (cleaner) => {
  //     const cleanerId = getCleanerId(cleaner);

  //     if (!cleanerId) {
  //       Alert.alert(
  //         tSafe('error', 'Error'),
  //         tSafe(
  //           'cleaner_id_missing',
  //           'The cleaner profile could not be opened because the cleaner ID is missing.'
  //         )
  //       );

  //       return;
  //     }

  //     const normalizedCleaner = {
  //       ...cleaner,
  //       _id: cleanerId,
  //       cleanerId,
  //       distanceFromApartment:
  //         getCleanerDistance(cleaner),
  //     };

  //     navigation.navigate(
  //       ROUTES.cleaner_profile_info,
  //       {
  //         item: normalizedCleaner,
  //         selected_schedule: selectedSchedule,
  //         selected_scheduleId: selectedSchedule?._id,
  //         hostId: currentUserId,
  //         hostFname:
  //           currentUser?.firstname ||
  //           currentUser?.firstName ||
  //           '',
  //         hostLname:
  //           currentUser?.lastname ||
  //           currentUser?.lastName ||
  //           '',
  //         distanceFromApartment:
  //           getCleanerDistance(cleaner),
  //       }
  //     );
  //   },
  //   [
  //     navigation,
  //     getCleanerId,
  //     getCleanerDistance,
  //     selectedSchedule,
  //     currentUserId,
  //     currentUser,
  //   ]
  // );

  // ==================================================
  // Property card
  // ==================================================

  const renderPropertyItem = ({ item }) => {
    const selected =
      String(selectedProperty?._id) ===
      String(item._id);

    const roomDetails = Array.isArray(
      item.roomDetails
    )
      ? item.roomDetails
      : [];

    return (
      <AppCard
        variant={selected ? 'elevated' : 'default'}
        padding="medium"
        radius="large"
        bordered
        style={[
          styles.propertyCard,
          selected && styles.selectedCard,
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityState={{ selected }}
          onPress={() => handleSelectProperty(item)}
        >
          <View style={styles.propertyHeader}>
            <View style={styles.propertyIcon}>
              <AntDesign
                name="home"
                size={25}
                color={theme.brand.primary}
              />
            </View>

            <View style={styles.propertyDetails}>
              <AppText
                variant="title"
                color={theme.text.primary}
                weight="semibold"
                numberOfLines={2}
              >
                {item.apt_name ||
                  tSafe(
                    'unnamed_property',
                    'Unnamed Property'
                  )}
              </AppText>

              <AppText
                variant="caption"
                color={theme.text.muted}
                numberOfLines={2}
                style={styles.propertyAddress}
              >
                {item.address ||
                  tSafe(
                    'address_unavailable',
                    'Address unavailable'
                  )}
              </AppText>
            </View>

            <View
              style={[
                styles.selectionIndicator,
                selected &&
                  styles.selectionIndicatorActive,
              ]}
            >
              {selected && (
                <Feather
                  name="check"
                  size={15}
                  color={theme.surface.default}
                />
              )}
            </View>
          </View>

          <View style={styles.roomTypeContainer}>
            {roomDetails
              .slice(0, 3)
              .map((room, index) => (
                <Chip
                  key={`${item._id}-room-${index}`}
                  compact
                  style={styles.roomChip}
                  textStyle={styles.roomChipText}
                >
                  {`${room?.number || 0} ${
                    room?.type || ''
                  }`}
                </Chip>
              ))}
          </View>
        </TouchableOpacity>
      </AppCard>
    );
  };

  // ==================================================
  // Schedule card
  // ==================================================

  const renderScheduleItem = ({ item }) => {
    const schedule = item?.schedule || {};

    const date = moment(
      schedule.cleaning_date,
      'YYYY-MM-DD',
      true
    );

    const selected =
      String(selectedSchedule?._id) ===
      String(item._id);

    return (
      <AppCard
        variant={selected ? 'elevated' : 'default'}
        padding="medium"
        radius="large"
        bordered
        style={[
          styles.scheduleCard,
          selected && styles.selectedCard,
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityState={{ selected }}
          onPress={() => handleSelectSchedule(item)}
        >
          <View style={styles.scheduleRow}>
            <View style={styles.dateBadge}>
              <AppText
                variant="heading"
                color={theme.surface.default}
                weight="bold"
              >
                {date.isValid()
                  ? date.format('D')
                  : '--'}
              </AppText>

              <AppText
                variant="caption"
                color={theme.surface.default}
                weight="semibold"
              >
                {date.isValid()
                  ? date.format('MMM')
                  : ''}
              </AppText>
            </View>

            <View style={styles.scheduleDetails}>
              <AppText
                variant="title"
                color={theme.text.primary}
                weight="semibold"
              >
                {date.isValid()
                  ? date.format('dddd')
                  : tSafe(
                      'date_unavailable',
                      'Date unavailable'
                    )}
              </AppText>

              <View style={styles.detailRow}>
                <MaterialIcons
                  name="schedule"
                  size={16}
                  color={theme.text.muted}
                />

                <AppText
                  variant="caption"
                  color={theme.text.muted}
                  style={styles.detailText}
                >
                  {formatCleaningTime(
                    schedule.cleaning_time
                  )}

                  {schedule.cleaning_end_time
                    ? ` – ${formatCleaningTime(
                        schedule.cleaning_end_time
                      )}`
                    : ''}
                </AppText>
              </View>

              <View style={styles.detailRow}>
                <MaterialIcons
                  name="location-on"
                  size={16}
                  color={theme.text.muted}
                />

                <AppText
                  variant="caption"
                  color={theme.text.muted}
                  numberOfLines={2}
                  style={styles.detailText}
                >
                  {schedule.address ||
                    selectedProperty?.address ||
                    tSafe(
                      'address_unavailable',
                      'Address unavailable'
                    )}
                </AppText>
              </View>
            </View>

            <View
              style={[
                styles.selectionIndicator,
                selected &&
                  styles.selectionIndicatorActive,
              ]}
            >
              {selected && (
                <Feather
                  name="check"
                  size={15}
                  color={theme.surface.default}
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </AppCard>
    );
  };

  // ==================================================
  // Recommendation progress card
  // ==================================================

  const renderRecommendationProgress = () => {
    const progress = getRecommendationProgress();

    return (
      <AppCard
        variant="elevated"
        padding="medium"
        radius="large"
        bordered
        style={styles.progressCard}
      >
        <View style={styles.progressHeader}>
          <View
            style={[
              styles.progressIcon,
              {
                backgroundColor:
                  progress.backgroundColor,
              },
            ]}
          >
            {progress.showSpinner ? (
              <ActivityIndicator
                size="small"
                color={progress.color}
              />
            ) : (
              <Feather
                name={progress.icon}
                size={23}
                color={progress.color}
              />
            )}
          </View>

          <View style={styles.progressTextContainer}>
            <AppText
              variant="title"
              color={theme.text.primary}
              weight="semibold"
            >
              {progress.title}
            </AppText>

            <AppText
              variant="body"
              color={theme.text.muted}
              style={styles.progressMessage}
            >
              {progress.message}
            </AppText>
          </View>
        </View>

        <View style={styles.progressCounts}>
          {[
            {
              key: 'notified',
              label: tSafe('notified', 'Notified'),
              color: '#2563EB',
            },
            {
              key: 'pending',
              label: tSafe('pending', 'Pending'),
              color: '#D97706',
            },
            {
              key: 'accepted',
              label: tSafe('accepted', 'Accepted'),
              color: '#15803D',
            },
            {
              key: 'declined',
              label: tSafe('declined', 'Declined'),
              color: '#DC2626',
            },
          ].map((item) => (
            <View
              key={item.key}
              style={styles.progressCountItem}
            >
              <AppText
                variant="heading"
                color={item.color}
                weight="bold"
              >
                {statusCounts[item.key] || 0}
              </AppText>

              <AppText
                variant="caption"
                color={theme.text.muted}
              >
                {item.label}
              </AppText>
            </View>
          ))}
        </View>

        <View style={styles.liveStatusRow}>
          <View style={styles.liveStatusDot} />

          <AppText
            variant="caption"
            color={theme.text.muted}
          >
            {tSafe(
              'statuses_refresh_automatically',
              'Cleaner statuses refresh automatically.'
            )}
          </AppText>
        </View>
      </AppCard>
    );
  };

  // ==================================================
  // Selected schedule summary
  // ==================================================

  const renderScheduleSummary = () => {
    const schedule = selectedSchedule?.schedule || {};

    const date = moment(
      schedule.cleaning_date,
      'YYYY-MM-DD',
      true
    );

    return (
      <AppCard
        variant="elevated"
        padding="medium"
        radius="large"
        bordered
        style={styles.scheduleSummaryCard}
      >
        <View style={styles.summaryCalendarIcon}>
          <Feather
            name="calendar"
            size={21}
            color={theme.brand.primary}
          />
        </View>

        <View style={styles.scheduleSummaryDetails}>
          <AppText
            variant="title"
            color={theme.text.primary}
            weight="semibold"
          >
            {selectedProperty?.apt_name ||
              schedule.apartment_name ||
              ''}
          </AppText>

          <AppText
            variant="body"
            color={theme.text.muted}
            style={styles.summaryDate}
          >
            {date.isValid()
              ? date.format('ddd, MMM DD, YYYY')
              : tSafe('date_unavailable', 'Date unavailable')}
          </AppText>

          <View style={styles.detailRow}>
            <Feather
              name="clock"
              size={13}
              color={theme.text.muted}
            />

            <AppText
              variant="caption"
              color={theme.text.muted}
              style={styles.detailText}
            >
              {formatCleaningTime(
                schedule.cleaning_time
              )}

              {schedule.cleaning_end_time
                ? ` – ${formatCleaningTime(
                    schedule.cleaning_end_time
                  )}`
                : ''}
            </AppText>
          </View>

          <AppText
            variant="caption"
            color={theme.text.muted}
            numberOfLines={2}
            style={styles.summaryAddress}
          >
            {schedule.address ||
              selectedProperty?.address ||
              ''}
          </AppText>
        </View>
      </AppCard>
    );
  };

  // ==================================================
  // Accepted cleaner card
  // ==================================================

  // ==================================================
// Accepted cleaner card
// ==================================================

const renderCleanerItem = ({ item }) => {
  const cleanerId = getCleanerId(item);
  const status = getCleanerStatus(item);

  const normalizedCleaner = {
    ...item,
    _id: cleanerId,
    cleanerId,
    distanceFromApartment: getCleanerDistance(item),
  };

  return (
    <View style={styles.acceptedCleanerItem}>
      <CleanerCard
        item={normalizedCleaner}
        status={status}
        onPress={() => handleOpenCleanerProfile(normalizedCleaner)}
        preview_mode
      />
    </View>
  );
};

  // ==================================================
  // Search and sorting for accepted cleaners only
  // ==================================================

  const renderFilterControls = () => (
    <AppCard
      variant="default"
      padding="medium"
      radius="large"
      bordered
      style={styles.filterCard}
    >
      <AppText
        variant="title"
        color={theme.text.primary}
        weight="semibold"
      >
        {tSafe(
          'accepted_cleaners',
          'Accepted Cleaners'
        )}
      </AppText>

      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={18}
          color={theme.text.muted}
        />

        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={tSafe(
            'search_accepted_cleaners',
            'Search accepted cleaners by name or email'
          )}
          placeholderTextColor={theme.text.muted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel={tSafe(
            'search_accepted_cleaners',
            'Search accepted cleaners by name or email'
          )}
          style={[
            styles.searchInput,
            { color: theme.text.primary },
          ]}
        />

        {searchQuery.length > 0 && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={tSafe(
              'clear_search',
              'Clear search'
            )}
            onPress={() => setSearchQuery('')}
            hitSlop={8}
          >
            <Feather
              name="x-circle"
              size={18}
              color={theme.text.muted}
            />
          </TouchableOpacity>
        )}
      </View>

      <AppText
        variant="label"
        color={theme.text.primary}
        style={styles.filterLabel}
      >
        {tSafe('sort_by', 'Sort by')}
      </AppText>

      <View style={styles.sortOptions}>
        {SORT_OPTIONS.map((option) => {
          const selected =
            sortBy === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setSortBy(option.value)}
              style={[
                styles.sortOption,
                selected && styles.activeSortOption,
              ]}
            >
              <Feather
                name={
                  option.value === 'distance'
                    ? 'map-pin'
                    : 'type'
                }
                size={14}
                color={
                  selected
                    ? theme.surface.default
                    : theme.text.muted
                }
              />

              <AppText
                variant="caption"
                color={
                  selected
                    ? theme.surface.default
                    : theme.text.primary
                }
                weight="medium"
                style={styles.sortOptionText}
              >
                {option.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.filterResultsRow}>
        <AppText
          variant="caption"
          color={theme.text.muted}
        >
          {`${filteredCleaners.length} ${
            filteredCleaners.length === 1
              ? tSafe('accepted_cleaner', 'accepted cleaner')
              : tSafe('accepted_cleaners', 'accepted cleaners')
          }`}
        </AppText>

        {(searchQuery || sortBy !== 'distance') && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setSortBy('distance');
            }}
            accessibilityRole="button"
          >
            <AppText
              variant="label"
              color={theme.brand.primary}
            >
              {tSafe('reset', 'Reset')}
            </AppText>
          </TouchableOpacity>
        )}
      </View>
    </AppCard>
  );

  // ==================================================
  // Empty accepted-cleaner results
  // ==================================================

  const renderEmptyCleanerResults = () => {
    const hasAcceptedCleaners =
      acceptedCleaners.length > 0;

    const waitingForResponses =
      (statusCounts.notified || 0) > 0 ||
      (statusCounts.pending || 0) > 0;

    let title;
    let description;
    let icon = 'users';

    if (hasAcceptedCleaners && searchQuery.trim()) {
      title = tSafe(
        'no_matching_accepted_cleaners',
        'No matching accepted cleaners'
      );

      description = tSafe(
        'try_different_search',
        'Try a different name or email search.'
      );

      icon = 'search';
    } else if (waitingForResponses) {
      title = tSafe(
        'waiting_for_cleaner_responses',
        'Waiting for cleaner responses'
      );

      description = tSafe(
        'accepted_cleaners_appear_when_ready',
        'No cleaners have accepted yet. Cleaners who accept your request will appear here automatically.'
      );

      icon = 'clock';
    } else if ((statusCounts.declined || 0) > 0) {
      title = tSafe(
        'no_cleaners_accepted_yet',
        'No cleaners have accepted yet'
      );

      description = tSafe(
        'check_again_later',
        'The cleaners contacted so far have not accepted. Pull down to refresh the latest response statuses.'
      );

      icon = 'users';
    } else {
      title = tSafe(
        'no_accepted_cleaners',
        'No accepted cleaners yet'
      );

      description = tSafe(
        'accepted_cleaners_will_appear',
        'Accepted cleaners will appear here when they respond to your request. Pull down to refresh.'
      );

      icon = 'users';
    }

    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Feather
            name={icon}
            size={30}
            color={theme.brand.primary}
          />
        </View>

        <AppText
          variant="title"
          color={theme.text.primary}
          align="center"
          style={styles.emptyTitle}
        >
          {title}
        </AppText>

        <AppText
          variant="body"
          color={theme.text.muted}
          align="center"
          style={styles.emptyDescription}
        >
          {description}
        </AppText>

        {hasAcceptedCleaners && searchQuery.trim() ? (
          <TouchableOpacity
            style={styles.resetEmptyButton}
            onPress={() => setSearchQuery('')}
          >
            <AppText
              variant="label"
              color={theme.brand.primary}
            >
              {tSafe('clear_search', 'Clear search')}
            </AppText>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  // ==================================================
  // Main render
  // ==================================================

  return (
    <View style={styles.container}>
      <ExpoStatusBar
        style={isDark ? 'light' : 'dark'}
      />

      <CustomHeader
        navigation={navigation}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.brand.primary}
            colors={[theme.brand.primary]}
          />
        }
      >
        {/* ========================================== */}
        {/* Step 1: Choose property */}
        {/* ========================================== */}

        {currentStep === 1 && (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
          >
            <View style={styles.sectionHeader}>
              <AppText
                variant="heading"
                color={theme.text.primary}
              >
                {tSafe('choose_property', 'Choose a Property')}
              </AppText>

              <AppText
                variant="body"
                color={theme.text.muted}
                style={styles.sectionSubtitle}
              >
                {tSafe(
                  'select_property_for_cleaning',
                  'Select the property that needs cleaning.'
                )}
              </AppText>
            </View>

            {apartments.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather
                  name="home"
                  size={38}
                  color={theme.text.muted}
                />

                <AppText
                  variant="title"
                  color={theme.text.primary}
                  align="center"
                  style={styles.emptyTitle}
                >
                  {tSafe(
                    'no_properties_found',
                    'No Properties Found'
                  )}
                </AppText>

                <AppText
                  variant="body"
                  color={theme.text.muted}
                  align="center"
                  style={styles.emptyDescription}
                >
                  {tSafe(
                    'add_property_before_cleaners',
                    'Add a property before looking for cleaners.'
                  )}
                </AppText>
              </View>
            ) : (
              <FlatList
                data={apartments}
                renderItem={renderPropertyItem}
                keyExtractor={(item) => String(item._id)}
                scrollEnabled={false}
                removeClippedSubviews={false}
              />
            )}
          </Animated.View>
        )}

        {/* ========================================== */}
        {/* Step 2: Choose schedule */}
        {/* ========================================== */}

        {currentStep === 2 && (
          <Animated.View
            entering={SlideInRight}
            exiting={SlideOutLeft}
          >
            <View style={styles.sectionHeader}>
              <AppText
                variant="heading"
                color={theme.text.primary}
              >
                {tSafe('choose_schedule', 'Choose a Schedule')}
              </AppText>

              <AppText
                variant="body"
                color={theme.text.muted}
                style={styles.sectionSubtitle}
              >
                {tSafe(
                  'select_upcoming_cleaning',
                  'Select the upcoming cleaning that needs a cleaner.'
                )}
              </AppText>
            </View>

            {schedules.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Feather
                    name="calendar"
                    size={30}
                    color={theme.brand.primary}
                  />
                </View>

                <AppText
                  variant="title"
                  color={theme.text.primary}
                  align="center"
                  style={styles.emptyTitle}
                >
                  {tSafe(
                    'no_available_schedules',
                    'No Available Schedules'
                  )}
                </AppText>

                <AppText
                  variant="body"
                  color={theme.text.muted}
                  align="center"
                  style={styles.emptyDescription}
                >
                  {tSafe(
                    'no_upcoming_schedules',
                    'There are no upcoming cleaning schedules for this property.'
                  )}
                </AppText>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.createScheduleButton}
                  onPress={() => handleCreateSchedule(true)}
                >
                  <Feather
                    name="plus"
                    size={17}
                    color={theme.surface.default}
                  />

                  <AppText
                    variant="label"
                    color={theme.surface.default}
                    style={styles.createScheduleButtonText}
                  >
                    {tSafe('create_schedule', 'Create Schedule')}
                  </AppText>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={schedules}
                renderItem={renderScheduleItem}
                keyExtractor={(item) => String(item._id)}
                scrollEnabled={false}
                removeClippedSubviews={false}
              />
            )}
          </Animated.View>
        )}

        {/* ========================================== */}
        {/* Step 3: Accepted cleaner results only */}
        {/* ========================================== */}

        {currentStep === 3 && selectedSchedule && (
          <Animated.View
            entering={SlideInRight}
            exiting={SlideOutLeft}
          >
            <View style={styles.sectionHeader}>
              <AppText
                variant="heading"
                color={theme.text.primary}
              >
                {tSafe(
                  'cleaners_who_accepted',
                  'Cleaners Who Accepted'
                )}
              </AppText>

              <AppText
                variant="body"
                color={theme.text.muted}
                style={styles.sectionSubtitle}
              >
                {tSafe(
                  'accepted_cleaners_subtitle',
                  'Only cleaners who have accepted your cleaning request appear below.'
                )}
              </AppText>
            </View>

            {renderScheduleSummary()}

            {renderRecommendationProgress()}

            {!loading &&
              acceptedCleaners.length > 0 &&
              renderFilterControls()}

            {!loading &&
              filteredCleaners.length > 0 && (
                <View style={styles.listHeading}>
                  <View style={styles.listHeadingText}>
                    <AppText
                      variant="title"
                      color={theme.text.primary}
                      weight="semibold"
                    >
                      {tSafe(
                        'accepted_cleaners',
                        'Accepted Cleaners'
                      )}
                    </AppText>

                    <AppText
                      variant="caption"
                      color={theme.text.muted}
                    >
                      {tSafe(
                        'review_accepted_cleaner_profiles',
                        'Review their profiles before making your selection.'
                      )}
                    </AppText>
                  </View>

                  <Chip
                    compact
                    style={styles.resultCountChip}
                    textStyle={styles.resultCountText}
                  >
                    {filteredCleaners.length}
                  </Chip>
                </View>
              )}

            {loading ? (
              <View style={styles.skeletonContainer}>
                {[...Array(4)].map((_, index) => (
                  <CleanerCardSkeleton
                    key={`cleaner-skeleton-${index}`}
                  />
                ))}
              </View>
            ) : (
              <FlatList
                data={filteredCleaners}
                renderItem={renderCleanerItem}
                keyExtractor={(item, index) =>
                  getCleanerId(item) || `cleaner-${index}`
                }
                scrollEnabled={false}
                removeClippedSubviews={false}
                ListEmptyComponent={
                  renderEmptyCleanerResults
                }
              />
            )}

            {!loading &&
              acceptedCleaners.length > 0 && (
                <AppCard
                  variant="default"
                  padding="medium"
                  radius="large"
                  bordered
                  style={styles.hostDecisionCard}
                >
                  <View style={styles.hostDecisionRow}>
                    <Feather
                      name="user-check"
                      size={23}
                      color="#15803D"
                    />

                    <View style={styles.hostDecisionText}>
                      <AppText
                        variant="title"
                        color={theme.text.primary}
                        weight="semibold"
                      >
                        {tSafe(
                          'your_decision_comes_next',
                          'Your decision comes next'
                        )}
                      </AppText>

                      <AppText
                        variant="body"
                        color={theme.text.muted}
                        style={styles.hostDecisionMessage}
                      >
                        {tSafe(
                          'host_selects_accepted_cleaner',
                          'Review the accepted cleaners and choose the cleaner you want. An acceptance does not automatically assign a cleaner to your schedule.'
                        )}
                      </AppText>
                    </View>
                  </View>
                </AppCard>
              )}
          </Animated.View>
        )}
      </ScrollView>

      {/* ============================================ */}
      {/* Bottom navigation */}
      {/* ============================================ */}

      {(
        (currentStep === 1 && selectedProperty) ||
        (currentStep === 2 && selectedSchedule)
      ) && (
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.nextButton,
              loading && styles.disabledNextButton,
            ]}
            disabled={loading}
            onPress={handleStepNavigation}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color={theme.surface.default}
              />
            ) : (
              <>
                <AppText
                  variant="bodyMedium"
                  color={theme.surface.default}
                  weight="semibold"
                >
                  {currentStep === 1
                    ? tSafe(
                        'next_choose_schedule',
                        'Next: Choose Schedule'
                      )
                    : tSafe('find_cleaners', 'Find Cleaners')}
                </AppText>

                <Feather
                  name="arrow-right"
                  size={19}
                  color={theme.surface.default}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* ============================================ */}
      {/* Cleaner profile modal */}
      {/* ============================================ */}

      <Modal
        visible={profileVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeCleanerProfile}
      >
        <View style={styles.profileModalContainer}>
          {/* Modal header */}
          <View style={styles.profileModalHeader}>
            <View style={styles.profileModalHeaderText}>
              <AppText
                variant="heading"
                color={theme.text.primary}
                weight="semibold"
              >
                {tSafe('cleaner_profile', 'Cleaner Profile')}
              </AppText>

              <AppText
                variant="caption"
                color={theme.text.muted}
              >
                {profileCleaner
                  ? getCleanerName(profileCleaner)
                  : ''}
              </AppText>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={tSafe(
                'close_profile',
                'Close profile'
              )}
              onPress={closeCleanerProfile}
              style={styles.profileCloseButton}
            >
              <Feather
                name="x"
                size={23}
                color={theme.text.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Cleaner profile content */}
          <ScrollView
            contentContainerStyle={styles.profileModalContent}
            showsVerticalScrollIndicator={false}
          >
            {profileCleaner && (
              <>
                {/* Cleaner identity */}
                <AppCard
                  variant="elevated"
                  padding="medium"
                  radius="large"
                  bordered
                  style={styles.profileIdentityCard}
                >
                  <View style={styles.profileIdentityRow}>
                    <View style={styles.profileAvatar}>
                      <Feather
                        name="user"
                        size={32}
                        color={theme.brand.primary}
                      />
                    </View>

                    <View style={styles.profileIdentityDetails}>
                      <AppText
                        variant="title"
                        color={theme.text.primary}
                        weight="semibold"
                      >
                        {getCleanerName(profileCleaner)}
                      </AppText>

                      {!!profileCleaner.email && (
                        <AppText
                          variant="caption"
                          color={theme.text.muted}
                          style={styles.profileEmail}
                        >
                          {profileCleaner.email}
                        </AppText>
                      )}

                      {getCleanerDistance(profileCleaner) !== null && (
                        <View style={styles.profileDistanceRow}>
                          <Feather
                            name="map-pin"
                            size={14}
                            color={theme.text.muted}
                          />

                          <AppText
                            variant="caption"
                            color={theme.text.muted}
                            style={styles.profileDistanceText}
                          >
                            {`${getCleanerDistance(
                              profileCleaner
                            ).toFixed(1)} ${tSafe(
                              'miles_away',
                              'miles away'
                            )}`}
                          </AppText>
                        </View>
                      )}
                    </View>
                  </View>
                </AppCard>

                {/* Profile tabs */}
                <View style={styles.profileTabs}>
                  {[
                    {
                      key: 'about',
                      label: tSafe('about', 'About'),
                      icon: 'user',
                    },
                    {
                      key: 'availability',
                      label: tSafe(
                        'availability',
                        'Availability'
                      ),
                      icon: 'calendar',
                    },
                    {
                      key: 'reviews',
                      label: tSafe('reviews', 'Reviews'),
                      icon: 'star',
                    },
                  ].map((tab) => {
                    const active = profileTab === tab.key;

                    return (
                      <TouchableOpacity
                        key={tab.key}
                        activeOpacity={0.8}
                        accessibilityRole="tab"
                        accessibilityState={{
                          selected: active,
                        }}
                        onPress={() => setProfileTab(tab.key)}
                        style={[
                          styles.profileTab,
                          active && styles.profileTabActive,
                        ]}
                      >
                        <Feather
                          name={tab.icon}
                          size={16}
                          color={
                            active
                              ? theme.brand.primary
                              : theme.text.muted
                          }
                        />

                        <AppText
                          variant="label"
                          color={
                            active
                              ? theme.brand.primary
                              : theme.text.muted
                          }
                          style={styles.profileTabLabel}
                        >
                          {tab.label}
                        </AppText>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Profile tab content */}
                {profileLoading ? (
                  <View style={styles.profileLoading}>
                    <ActivityIndicator
                      size="large"
                      color={theme.brand.primary}
                    />

                    <AppText
                      variant="body"
                      color={theme.text.muted}
                      style={styles.profileLoadingText}
                    >
                      {tSafe(
                        'loading_profile',
                        'Loading cleaner profile...'
                      )}
                    </AppText>
                  </View>
                ) : (
                  <>
                    {/* ABOUT TAB */}
                    {profileTab === 'about' && (
                      <AppCard
                        variant="default"
                        padding="medium"
                        radius="large"
                        bordered
                        style={styles.profileSectionCard}
                      >
                        <AppText
                          variant="title"
                          color={theme.text.primary}
                          weight="semibold"
                        >
                          {tSafe(
                            'about_cleaner',
                            'About this cleaner'
                          )}
                        </AppText>

                        <AppText
                          variant="body"
                          color={theme.text.muted}
                          style={styles.profileSectionText}
                        >
                          {profileCleaner.aboutme ||
                            profileCleaner.aboutMe ||
                            tSafe(
                              'no_about_information',
                              'No additional information has been provided.'
                            )}
                        </AppText>

                        {!!profileCleaner.certification && (
                          <>
                            <View style={styles.profileDivider} />

                            <AppText
                              variant="title"
                              color={theme.text.primary}
                              weight="semibold"
                            >
                              {tSafe(
                                'certifications',
                                'Certifications'
                              )}
                            </AppText>

                            <AppText
                              variant="body"
                              color={theme.text.muted}
                              style={styles.profileSectionText}
                            >
                              {Array.isArray(
                                profileCleaner.certification
                              )
                                ? profileCleaner.certification.join(', ')
                                : typeof profileCleaner.certification ===
                                    'string'
                                  ? profileCleaner.certification
                                  : Object.entries(
                                      profileCleaner.certification
                                    )
                                      .filter(
                                        ([, value]) =>
                                          value !== null &&
                                          value !== undefined &&
                                          value !== false &&
                                          value !== ''
                                      )
                                      .map(
                                        ([key, value]) =>
                                          `${key}: ${
                                            typeof value === 'object'
                                              ? JSON.stringify(value)
                                              : value
                                          }`
                                      )
                                      .join('\n') ||
                                    tSafe(
                                      'no_certifications',
                                      'No certifications listed.'
                                    )}
                            </AppText>
                          </>
                        )}
                      </AppCard>
                    )}

                    {/* AVAILABILITY TAB */}
                    {profileTab === 'availability' && (
                      <AppCard
                        variant="default"
                        padding="medium"
                        radius="large"
                        bordered
                        style={styles.profileSectionCard}
                      >
                        <AppText
                          variant="title"
                          color={theme.text.primary}
                          weight="semibold"
                        >
                          {tSafe(
                            'cleaner_availability',
                            'Cleaner Availability'
                          )}
                        </AppText>

                        {profileAvailability ? (
                          <AppText
                            variant="body"
                            color={theme.text.muted}
                            style={styles.profileSectionText}
                          >
                            {typeof profileAvailability === 'string'
                              ? profileAvailability
                              : JSON.stringify(
                                  profileAvailability,
                                  null,
                                  2
                                )}
                          </AppText>
                        ) : (
                          <AppText
                            variant="body"
                            color={theme.text.muted}
                            style={styles.profileSectionText}
                          >
                            {tSafe(
                              'availability_not_available',
                              'Availability information is not available.'
                            )}
                          </AppText>
                        )}
                      </AppCard>
                    )}

                    {/* REVIEWS TAB */}
                    {profileTab === 'reviews' && (
                      <View>
                        <AppText
                          variant="title"
                          color={theme.text.primary}
                          weight="semibold"
                          style={styles.profileReviewsHeading}
                        >
                          {tSafe(
                            'cleaner_reviews',
                            'Cleaner Reviews'
                          )}
                        </AppText>

                        {profileReviews.length === 0 ? (
                          <AppCard
                            variant="default"
                            padding="medium"
                            radius="large"
                            bordered
                          >
                            <View style={styles.profileEmptyReviews}>
                              <Feather
                                name="message-circle"
                                size={28}
                                color={theme.text.muted}
                              />

                              <AppText
                                variant="body"
                                color={theme.text.muted}
                                style={styles.profileEmptyReviewsText}
                              >
                                {tSafe(
                                  'no_reviews_yet',
                                  'No reviews are available for this cleaner yet.'
                                )}
                              </AppText>
                            </View>
                          </AppCard>
                        ) : (
                          profileReviews.map((review, index) => (
                            <AppCard
                              key={String(
                                review?._id ??
                                review?.id ??
                                index
                              )}
                              variant="default"
                              padding="medium"
                              radius="large"
                              bordered
                              style={styles.profileReviewCard}
                            >
                              <View style={styles.profileReviewHeader}>
                                <AppText
                                  variant="title"
                                  color={theme.text.primary}
                                  weight="semibold"
                                >
                                  {review?.hostName ||
                                    review?.reviewerName ||
                                    review?.name ||
                                    tSafe(
                                      'host_review',
                                      'Host Review'
                                    )}
                                </AppText>

                                {Number(
                                  review?.rating ??
                                  review?.stars ??
                                  0
                                ) > 0 && (
                                  <View style={styles.profileReviewRating}>
                                    <Feather
                                      name="star"
                                      size={14}
                                      color="#D97706"
                                    />

                                    <AppText
                                      variant="label"
                                      color={theme.text.primary}
                                      style={styles.profileReviewRatingText}
                                    >
                                      {Number(
                                        review?.rating ??
                                        review?.stars
                                      ).toFixed(1)}
                                    </AppText>
                                  </View>
                                )}
                              </View>

                              <AppText
                                variant="body"
                                color={theme.text.muted}
                                style={styles.profileSectionText}
                              >
                                {review?.feedback ||
                                  review?.comment ||
                                  review?.review ||
                                  tSafe(
                                    'no_review_comment',
                                    'No written comment was provided.'
                                  )}
                              </AppText>

                              {(review?.createdAt ||
                                review?.created_at ||
                                review?.date) && (
                                <AppText
                                  variant="caption"
                                  color={theme.text.muted}
                                  style={styles.profileReviewDate}
                                >
                                  {moment(
                                    review.createdAt ||
                                    review.created_at ||
                                    review.date
                                  ).isValid()
                                    ? moment(
                                        review.createdAt ||
                                        review.created_at ||
                                        review.date
                                      ).format('MMM D, YYYY')
                                    : ''}
                                </AppText>
                              )}
                            </AppCard>
                          ))
                        )}
                      </View>
                    )}
                  </>
                )}
              </>
            )}
          </ScrollView>

          {/* Modal footer */}
          <View style={styles.profileModalFooter}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.profileDoneButton}
              onPress={closeCleanerProfile}
            >
              <AppText
                variant="bodyMedium"
                color={theme.surface.default}
                weight="semibold"
              >
                {tSafe('close', 'Close')}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ============================================ */}
      {/* New booking modal */}
      {/* ============================================ */}

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={handleCloseCreateBooking}
        statusBarTranslucent
      >
        <NewBooking
          close_modal={handleCloseCreateBooking}
          mode="create"
        />
      </Modal>
    </View>
  );
};

// ==================================================
// Theme-aware styles
// ==================================================

const createStyles = (theme, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    scrollView: {
      flex: 1,
    },

    content: {
      paddingTop: 8,
      paddingBottom: 28,
    },

    // Section headings

    sectionHeader: {
      marginHorizontal: 18,
      marginTop: 14,
      marginBottom: 16,
    },

    sectionSubtitle: {
      marginTop: 6,
      lineHeight: 21,
    },

    // Property cards

    propertyCard: {
      marginHorizontal: 16,
      marginBottom: 12,
    },

    selectedCard: {
      borderColor: theme.brand.primary,
    },

    propertyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    propertyIcon: {
      width: 50,
      height: 50,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.elevated,
      marginRight: 13,
    },

    propertyDetails: {
      flex: 1,
      paddingRight: 8,
    },

    propertyAddress: {
      marginTop: 5,
    },

    selectionIndicator: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.divider,
      alignItems: 'center',
      justifyContent: 'center',
    },

    selectionIndicatorActive: {
      borderColor: theme.brand.primary,
      backgroundColor: theme.brand.primary,
    },

    roomTypeContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      marginTop: 14,
      gap: 6,
    },

    roomChip: {
      backgroundColor: theme.surface.elevated,
    },

    roomChipText: {
      color: theme.text.muted,
    },

    // Schedule cards

    scheduleCard: {
      marginHorizontal: 16,
      marginBottom: 12,
    },

    scheduleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    dateBadge: {
      width: 62,
      height: 68,
      borderRadius: 14,
      backgroundColor: theme.brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },

    scheduleDetails: {
      flex: 1,
    },

    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 7,
    },

    detailText: {
      flex: 1,
      marginLeft: 7,
    },

    // Schedule summary

    scheduleSummaryCard: {
      flexDirection: 'row',
      marginHorizontal: 16,
      marginBottom: 14,
    },

    summaryCalendarIcon: {
      width: 44,
      height: 44,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.elevated,
      marginRight: 12,
    },

    scheduleSummaryDetails: {
      flex: 1,
    },

    summaryDate: {
      marginTop: 5,
    },

    summaryAddress: {
      marginTop: 7,
    },

    // Recommendation progress

    progressCard: {
      marginHorizontal: 16,
      marginBottom: 18,
    },

    progressHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },

    progressIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    progressTextContainer: {
      flex: 1,
    },

    progressMessage: {
      marginTop: 5,
      lineHeight: 20,
    },

    progressCounts: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 18,
      paddingTop: 15,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.divider,
    },

    progressCountItem: {
      flex: 1,
      alignItems: 'center',
    },

    liveStatusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 14,
    },

    liveStatusDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: '#16A34A',
      marginRight: 7,
    },

    // Search and sorting

    filterCard: {
      marginHorizontal: 16,
      marginBottom: 18,
    },

    searchContainer: {
      minHeight: 48,
      marginTop: 13,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.divider,
      borderRadius: 12,
      backgroundColor: theme.surface.elevated,
    },

    searchInput: {
      flex: 1,
      minHeight: 46,
      paddingVertical: 8,
      paddingHorizontal: 10,
      fontSize: 14,
    },

    filterLabel: {
      marginTop: 17,
      marginBottom: 8,
    },

    sortOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },

    sortOption: {
      minHeight: 36,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.divider,
      backgroundColor: theme.surface.elevated,
      flexDirection: 'row',
      alignItems: 'center',
    },

    activeSortOption: {
      backgroundColor: theme.brand.primary,
      borderColor: theme.brand.primary,
    },

    sortOptionText: {
      marginLeft: 6,
    },

    filterResultsRow: {
      marginTop: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    // Cleaner list

    listHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 18,
      marginBottom: 12,
    },

    listHeadingText: {
      flex: 1,
      paddingRight: 8,
    },

    resultCountChip: {
      backgroundColor: theme.surface.elevated,
    },

    resultCountText: {
      color: theme.brand.primary,
    },

    cleanerContent: {
      paddingHorizontal: 0,
    },

    // Accepted cleaner highlight

    acceptedCleanerCard: {
      marginHorizontal: 12,
      marginBottom: 13,
      overflow: 'hidden',
      borderColor: '#16A34A',
      borderWidth: 1.5,
    },

    acceptedTopBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: isDark ? '#123524' : '#DCFCE7',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? '#236341' : '#86EFAC',
    },

    acceptedBannerText: {
      marginLeft: 7,
      fontSize: 11,
      letterSpacing: 0.3,
    },

    // Cleaner response status

    cleanerStatusSection: {
      minHeight: 66,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingLeft: 14,
      paddingRight: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.divider,
      backgroundColor: theme.surface.elevated,
    },

    cleanerStatusLeft: {
      flex: 1,
      paddingRight: 8,
    },

    cleanerStatusBadge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 16,
    },

    cleanerStatusBadgeText: {
      marginLeft: 5,
      fontSize: 12,
    },

    acceptedProfileButton: {
      minHeight: 38,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: isDark ? '#123524' : '#F0FDF4',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },

    distanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
    },

    distanceText: {
      marginLeft: 5,
    },

    // Host decision reminder

    hostDecisionCard: {
      marginHorizontal: 16,
      marginTop: 6,
      marginBottom: 24,
      borderColor: isDark ? '#236341' : '#86EFAC',
    },

    hostDecisionRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },

    hostDecisionText: {
      flex: 1,
      marginLeft: 12,
    },

    hostDecisionMessage: {
      marginTop: 6,
      lineHeight: 20,
    },

    // Empty states

    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 28,
      paddingVertical: 38,
      marginHorizontal: 16,
      backgroundColor: theme.surface.default,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.divider,
    },

    emptyIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 18,
      backgroundColor: theme.surface.elevated,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },

    emptyTitle: {
      marginTop: 12,
    },

    emptyDescription: {
      marginTop: 8,
      lineHeight: 20,
    },

    resetEmptyButton: {
      marginTop: 16,
      padding: 8,
    },

    createScheduleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 13,
      paddingHorizontal: 20,
      backgroundColor: theme.brand.primary,
      borderRadius: 12,
      marginTop: 20,
    },

    createScheduleButtonText: {
      marginLeft: 8,
    },

    skeletonContainer: {
      marginTop: 8,
    },

    // Footer

    footer: {
      backgroundColor: theme.surface.default,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.divider,
    },

    nextButton: {
      minHeight: 52,
      backgroundColor: theme.brand.primary,
      borderRadius: 14,
      paddingHorizontal: 18,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
    },

    disabledNextButton: {
      opacity: 0.7,
    },

    // Cleaner list

    listHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 18,
      marginBottom: 12,
    },

    listHeadingText: {
      flex: 1,
      paddingRight: 8,
    },

    resultCountChip: {
      backgroundColor: theme.surface.elevated,
    },

    resultCountText: {
      color: theme.brand.primary,
    },

    acceptedCleanerItem: {
      marginHorizontal: 12,
      marginBottom: 12,
    },

    // Cleaner profile modal

    profileModalContainer: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    profileModalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.divider,
    },

    profileModalHeaderText: {
      flex: 1,
      paddingRight: 12,
    },

    profileCloseButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.elevated,
    },

    profileModalContent: {
      paddingTop: 16,
      paddingBottom: 24,
    },

    profileIdentityCard: {
      marginHorizontal: 16,
      marginBottom: 16,
    },

    profileIdentityRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    profileAvatar: {
      width: 66,
      height: 66,
      borderRadius: 33,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.elevated,
      marginRight: 14,
    },

    profileIdentityDetails: {
      flex: 1,
    },

    profileEmail: {
      marginTop: 5,
    },

    profileDistanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 7,
    },

    profileDistanceText: {
      marginLeft: 5,
    },

    profileTabs: {
      flexDirection: 'row',
      marginHorizontal: 16,
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
    },

    profileTab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 13,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },

    profileTabActive: {
      borderBottomColor: theme.brand.primary,
    },

    profileTabLabel: {
      marginLeft: 6,
    },

    profileLoading: {
      paddingVertical: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },

    profileLoadingText: {
      marginTop: 12,
    },

    profileSectionCard: {
      marginHorizontal: 16,
      marginBottom: 14,
    },

    profileSectionText: {
      marginTop: 10,
      lineHeight: 22,
    },

    profileDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.divider,
      marginVertical: 18,
    },

    profileReviewsHeading: {
      marginHorizontal: 18,
      marginBottom: 12,
    },

    profileReviewCard: {
      marginHorizontal: 16,
      marginBottom: 12,
    },

    profileReviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    profileReviewRating: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    profileReviewRatingText: {
      marginLeft: 5,
    },

    profileReviewDate: {
      marginTop: 10,
    },

    profileEmptyReviews: {
      alignItems: 'center',
      paddingVertical: 20,
    },

    profileEmptyReviewsText: {
      textAlign: 'center',
      marginTop: 12,
      lineHeight: 21,
    },

    profileModalFooter: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.divider,
      backgroundColor: theme.surface.default,
    },

    profileDoneButton: {
      minHeight: 50,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.brand.primary,
    },
  });

export default FindCleaners;







// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   useContext,
//   useRef,
//   useMemo,
// } from 'react';

// import {
//   View,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   FlatList,
//   Modal,
//   Alert,
//   RefreshControl,
//   ActivityIndicator,
// } from 'react-native';

// import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
// import { useFocusEffect } from '@react-navigation/native';

// import Animated, {
//   FadeIn,
//   FadeOut,
//   SlideInRight,
//   SlideOutLeft,
// } from 'react-native-reanimated';

// import {
//   Feather,
//   MaterialIcons,
//   AntDesign,
// } from '@expo/vector-icons';

// import moment from 'moment';

// import {
//   Chip,
// } from 'react-native-paper';

// import userService from '../../services/connection/userService';
// import { AuthContext } from '../../context/AuthContext';
// import { useBookingContext } from '../../context/BookingContext';
// import { useTheme } from '../../theme';
// import AppText from '../../ui/AppText';
// import AppCard from '../../ui/AppCard';
// import { tSafe } from '../../utils/tSafe';
// import ROUTES from '../../constants/routes';
// import CustomHeader from '../../components/shared/CustomHeader';
// import NewBooking from './NewBooking';
// import CleanerCard from '../../components/cleaner/CleanerCard';
// import CleanerCardSkeleton from '../../components/cleaner/CleanerCardSkeleton';

// const STATUS_FILTERS = [
//   { label: 'All cleaners', value: 'all' },
//   { label: 'Not contacted', value: 'not_notified' },
//   { label: 'Notified', value: 'notified' },
//   { label: 'Pending', value: 'pending' },
//   { label: 'Accepted', value: 'accepted' },
//   { label: 'Declined', value: 'declined' },
// ];

// const SORT_OPTIONS = [
//   { label: 'Nearest first', value: 'distance' },
//   { label: 'Name A–Z', value: 'name' },
//   { label: 'Status', value: 'status' },
// ];

// const EMPTY_STATUS_COUNTS = {
//   notified: 0,
//   pending: 0,
//   accepted: 0,
//   declined: 0,
// };

// const FindCleaners = ({ navigation }) => {
//   const { currentUserId, currentUser } = useContext(AuthContext);

//   const {
//     modalVisible,
//     handleCreateSchedule,
//   } = useBookingContext();

//   const { theme, isDark } = useTheme();

//   const styles = useMemo(
//     () => createStyles(theme, isDark),
//     [theme, isDark]
//   );

//   // ==================================================
//   // Navigation state
//   // ==================================================

//   const [currentStep, setCurrentStep] = useState(1);
//   const [selectedProperty, setSelectedProperty] = useState(null);
//   const [selectedSchedule, setSelectedSchedule] = useState(null);

//   // ==================================================
//   // Data state
//   // ==================================================

//   const [apartments, setApartments] = useState([]);
//   const [schedules, setSchedules] = useState([]);
//   const [cleaners, setCleaners] = useState([]);

//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   // ==================================================
//   // Cleaner response status state
//   // ==================================================

//   const [cleanerStatuses, setCleanerStatuses] = useState({});
//   const [statusCounts, setStatusCounts] = useState({
//     ...EMPTY_STATUS_COUNTS,
//   });

//   // ==================================================
//   // Cleaner search and filters
//   // ==================================================

//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [sortBy, setSortBy] = useState('distance');

//   // Prevent overlapping schedule-status requests.
//   const statusRefreshInProgress = useRef(false);

//   // Prevent an old recommendation request from overwriting
//   // results for a newly selected schedule.
//   const recommendationRequestId = useRef(0);

//   const selectedScheduleId = selectedSchedule?._id
//     ? String(selectedSchedule._id)
//     : null;

//   // ==================================================
//   // Helpers
//   // ==================================================

//   const getCleanerId = useCallback((cleaner) => {
//     const id = cleaner?.cleanerId ?? cleaner?._id;

//     return id == null ? '' : String(id);
//   }, []);

//   const getCleanerName = useCallback((cleaner) => {
//     const firstName =
//       cleaner?.firstname ??
//       cleaner?.firstName ??
//       cleaner?.first_name ??
//       '';

//     const lastName =
//       cleaner?.lastname ??
//       cleaner?.lastName ??
//       cleaner?.last_name ??
//       '';

//     const fullName = `${firstName} ${lastName}`.trim();

//     return (
//       fullName ||
//       cleaner?.name ||
//       cleaner?.displayName ||
//       cleaner?.email ||
//       'Cleaner'
//     );
//   }, []);

//   const getCleanerStatus = useCallback(
//     (cleaner) => {
//       const cleanerId = getCleanerId(cleaner);

//       return String(
//         cleanerStatuses[cleanerId] ??
//         cleaner?.status ??
//         'not_notified'
//       )
//         .trim()
//         .toLowerCase()
//         .replace(/[\s-]+/g, '_');
//     },
//     [cleanerStatuses, getCleanerId]
//   );

//   const getCleanerDistance = useCallback((cleaner) => {
//     const rawDistance =
//       cleaner?.distance_miles ??
//       cleaner?.distanceFromApartment ??
//       null;

//     if (
//       rawDistance === null ||
//       rawDistance === undefined ||
//       rawDistance === ''
//     ) {
//       return null;
//     }

//     const distance = Number(rawDistance);

//     return Number.isFinite(distance) ? distance : null;
//   }, []);

//   const formatDistance = useCallback(
//     (cleaner) => {
//       const distance = getCleanerDistance(cleaner);

//       if (distance === null) {
//         return null;
//       }

//       return `${distance.toFixed(1)} ${tSafe(
//         'miles_away',
//         'miles away'
//       )}`;
//     },
//     [getCleanerDistance]
//   );

//   const formatCleaningTime = useCallback((value) => {
//     if (!value) {
//       return '';
//     }

//     const parsed = moment(
//       value,
//       ['HH:mm:ss', 'H:mm:ss', 'HH:mm', 'H:mm'],
//       true
//     );

//     return parsed.isValid()
//       ? parsed.format('h:mm A')
//       : value;
//   }, []);

//   const getCleanerStatusDisplay = useCallback(
//     (cleaner) => {
//       const status = getCleanerStatus(cleaner);

//       const statusMap = {
//         not_notified: {
//           label: 'Not contacted',
//           color: '#64748B',
//           backgroundColor: '#F1F5F9',
//           icon: 'clock',
//         },

//         notified: {
//           label: 'Request sent',
//           color: '#1D4ED8',
//           backgroundColor: '#DBEAFE',
//           icon: 'send',
//         },

//         pending: {
//           label: 'Pending',
//           color: '#92400E',
//           backgroundColor: '#FEF3C7',
//           icon: 'clock',
//         },

//         accepted: {
//           label: 'Accepted',
//           color: '#15803D',
//           backgroundColor: '#DCFCE7',
//           icon: 'check-circle',
//         },

//         declined: {
//           label: 'Declined',
//           color: '#B91C1C',
//           backgroundColor: '#FEE2E2',
//           icon: 'x-circle',
//         },

//         assigned: {
//           label: 'Assigned',
//           color: '#6D28D9',
//           backgroundColor: '#EDE9FE',
//           icon: 'check-circle',
//         },

//         unavailable: {
//           label: 'Unavailable',
//           color: '#B91C1C',
//           backgroundColor: '#FEE2E2',
//           icon: 'alert-circle',
//         },

//         cancelled: {
//           label: 'Cancelled',
//           color: '#B91C1C',
//           backgroundColor: '#FEE2E2',
//           icon: 'x-circle',
//         },
//       };

//       return (
//         statusMap[status] || {
//           label: status
//             ? status
//                 .replace(/_/g, ' ')
//                 .replace(/\b\w/g, (letter) =>
//                   letter.toUpperCase()
//                 )
//             : 'Status unavailable',
//           color: '#64748B',
//           backgroundColor: '#F1F5F9',
//           icon: 'info',
//         }
//       );
//     },
//     [getCleanerStatus]
//   );

//   // ==================================================
//   // Recommendation progress
//   // ==================================================

//   const getRecommendationProgress = useCallback(() => {
//     const notified = statusCounts.notified || 0;
//     const pending = statusCounts.pending || 0;
//     const accepted = statusCounts.accepted || 0;
//     const declined = statusCounts.declined || 0;

//     if (loading) {
//       return {
//         title: 'Finding cleaners',
//         message:
//           'Please wait while we retrieve cleaner recommendations and update the results.',
//         icon: 'search',
//         color: theme.brand.primary,
//         backgroundColor: theme.surface.elevated,
//         showSpinner: true,
//       };
//     }

//     if (accepted > 0) {
//       return {
//         title: 'Cleaners have accepted',
//         message:
//           'Review the profiles of cleaners who have accepted your request. You remain in control of the final selection.',
//         icon: 'check-circle',
//         color: '#15803D',
//         backgroundColor: '#DCFCE7',
//         showSpinner: false,
//       };
//     }

//     if (notified > 0 || pending > 0) {
//       return {
//         title: 'Waiting for cleaner responses',
//         message:
//           'The recommendation process is underway. Cleaner response statuses will update as new responses arrive.',
//         icon: 'clock',
//         color: '#1D4ED8',
//         backgroundColor: '#DBEAFE',
//         showSpinner: false,
//       };
//     }

//     if (declined > 0) {
//       return {
//         title: 'No accepted cleaners yet',
//         message:
//           'Some cleaners have declined. Keep checking the results as the recommendation process continues.',
//         icon: 'alert-circle',
//         color: '#B45309',
//         backgroundColor: '#FEF3C7',
//         showSpinner: false,
//       };
//     }

//     if (cleaners.length > 0) {
//       return {
//         title: 'Recommendations ready',
//         message:
//           'Review the recommended cleaners below. Their current response status is displayed on each cleaner card.',
//         icon: 'users',
//         color: theme.brand.primary,
//         backgroundColor: theme.surface.elevated,
//         showSpinner: false,
//       };
//     }

//     return {
//       title: 'Preparing your results',
//       message:
//         'Your cleaner recommendation flow has been started. Results will appear here when available.',
//       icon: 'search',
//       color: theme.brand.primary,
//       backgroundColor: theme.surface.elevated,
//       showSpinner: false,
//     };
//   }, [
//     loading,
//     statusCounts,
//     cleaners.length,
//     theme,
//   ]);

//   // ==================================================
//   // Derived cleaner list
//   // ==================================================

//   const filteredCleaners = useMemo(() => {
//     const normalizedQuery = searchQuery
//       .trim()
//       .toLowerCase();

//     let result = cleaners.filter((cleaner) => {
//       const cleanerName = getCleanerName(cleaner)
//         .toLowerCase();

//       const cleanerEmail = String(
//         cleaner?.email ?? ''
//       ).toLowerCase();

//       const matchesSearch =
//         !normalizedQuery ||
//         cleanerName.includes(normalizedQuery) ||
//         cleanerEmail.includes(normalizedQuery);

//       if (!matchesSearch) {
//         return false;
//       }

//       const status = getCleanerStatus(cleaner);

//       switch (statusFilter) {
//         case 'not_notified':
//           return status === 'not_notified';

//         case 'notified':
//           return status === 'notified';

//         case 'pending':
//           return status === 'pending';

//         case 'accepted':
//           return status === 'accepted';

//         case 'declined':
//           return status === 'declined';

//         case 'all':
//         default:
//           return true;
//       }
//     });

//     result = [...result].sort((a, b) => {
//       if (sortBy === 'name') {
//         return getCleanerName(a).localeCompare(
//           getCleanerName(b)
//         );
//       }

//       if (sortBy === 'status') {
//         return getCleanerStatus(a).localeCompare(
//           getCleanerStatus(b)
//         );
//       }

//       if (sortBy === 'distance') {
//         const distanceA = getCleanerDistance(a);
//         const distanceB = getCleanerDistance(b);

//         if (
//           distanceA === null &&
//           distanceB === null
//         ) {
//           return getCleanerName(a).localeCompare(
//             getCleanerName(b)
//           );
//         }

//         if (distanceA === null) return 1;
//         if (distanceB === null) return -1;

//         return distanceA - distanceB;
//       }

//       return 0;
//     });

//     return result;
//   }, [
//     cleaners,
//     searchQuery,
//     statusFilter,
//     sortBy,
//     getCleanerName,
//     getCleanerStatus,
//     getCleanerDistance,
//   ]);

//   // ==================================================
//   // Cleaner status updates
//   // ==================================================

//   const updateCleanerStatuses = useCallback(
//     (scheduleData) => {
//       const notifiedCleaners = Array.isArray(
//         scheduleData?.notified_cleaners
//       )
//         ? scheduleData.notified_cleaners
//         : [];

//       const statusMap = {};
//       const counts = { ...EMPTY_STATUS_COUNTS };

//       notifiedCleaners.forEach((entry) => {
//         if (
//           entry?.cleanerId === null ||
//           entry?.cleanerId === undefined
//         ) {
//           return;
//         }

//         const cleanerId = String(entry.cleanerId);

//         const status = String(
//           entry.status || 'notified'
//         )
//           .trim()
//           .toLowerCase()
//           .replace(/[\s-]+/g, '_');

//         // Keep the latest status if a cleaner has multiple
//         // notification records in the schedule document.
//         statusMap[cleanerId] = status;

//         if (
//           Object.prototype.hasOwnProperty.call(
//             counts,
//             status
//           )
//         ) {
//           counts[status] += 1;
//         }
//       });

//       setCleanerStatuses(statusMap);
//       setStatusCounts(counts);
//     },
//     []
//   );

//   const refreshSelectedScheduleStatus = useCallback(
//     async (scheduleId) => {
//       if (
//         !scheduleId ||
//         statusRefreshInProgress.current
//       ) {
//         return;
//       }

//       statusRefreshInProgress.current = true;

//       try {
//         const response =
//           await userService.getScheduleById(
//             scheduleId
//           );

//         updateCleanerStatuses(response?.data);
//       } catch (error) {
//         console.warn(
//           'Unable to refresh cleaner statuses:',
//           error?.message
//         );
//       } finally {
//         statusRefreshInProgress.current = false;
//       }
//     },
//     [updateCleanerStatuses]
//   );

//   // ==================================================
//   // Read cleaner recommendations
//   // ==================================================

//   const fetchCleanerRecommendations = useCallback(
//     async (scheduleId) => {
//       if (!scheduleId) {
//         return [];
//       }

//       // This is the existing read-only recommendations
//       // endpoint. It does not start another search.
//       const response =
//         await userService.findCleaners(scheduleId);

//       const recommendationData = Array.isArray(
//         response?.data
//       )
//         ? response.data
//         : Array.isArray(
//             response?.data?.cleaners
//           )
//           ? response.data.cleaners
//           : [];

//       return recommendationData;
//     },
//     []
//   );

//   // ==================================================
//   // Get upcoming schedules for a property
//   // ==================================================

//   const getUpcomingPropertySchedules = useCallback(
//     (scheduleData, property) => {
//       if (
//         !Array.isArray(scheduleData) ||
//         !property
//       ) {
//         return [];
//       }

//       return scheduleData.filter((item) => {
//         const schedule = item?.schedule;

//         if (!schedule) {
//           return false;
//         }

//         if (
//           schedule.apartment_name !==
//           property.apt_name
//         ) {
//           return false;
//         }

//         const cleaningDate = schedule.cleaning_date;
//         const cleaningTime = schedule.cleaning_time;

//         if (!cleaningDate || !cleaningTime) {
//           return false;
//         }

//         const cleaningDateTime = moment(
//           `${cleaningDate} ${cleaningTime}`,
//           [
//             'YYYY-MM-DD HH:mm:ss',
//             'YYYY-MM-DD H:mm:ss',
//             'YYYY-MM-DD HH:mm',
//             'YYYY-MM-DD H:mm',
//           ],
//           true
//         );

//         return (
//           cleaningDateTime.isValid() &&
//           cleaningDateTime.isSameOrAfter(moment())
//         );
//       });
//     },
//     []
//   );

//   // ==================================================
//   // Initial property fetch
//   // ==================================================

//   useEffect(() => {
//     let active = true;

//     const fetchProperties = async () => {
//       if (!currentUserId) {
//         return;
//       }

//       try {
//         const response = await userService.getApartment(
//           currentUserId
//         );

//         if (!active) {
//           return;
//         }

//         const propertyData = Array.isArray(
//           response?.data
//         )
//           ? response.data
//           : [];

//         if (propertyData.length === 0) {
//           setApartments([]);

//           Alert.alert(
//             tSafe('property_required', 'Property Required'),
//             tSafe(
//               'property_required_description',
//               'Add at least one property before finding cleaners.'
//             ),
//             [
//               {
//                 text: tSafe('ok', 'OK'),
//                 onPress: () => {
//                   navigation.replace(
//                     ROUTES.host_dashboard
//                   );
//                 },
//               },
//             ],
//             { cancelable: false }
//           );

//           return;
//         }

//         setApartments(propertyData);
//       } catch (error) {
//         if (!active) return;

//         console.error(
//           'Error fetching properties:',
//           error
//         );

//         Alert.alert(
//           tSafe('error', 'Error'),
//           tSafe(
//             'failed_load_properties',
//             'Failed to load your properties. Please try again.'
//           )
//         );
//       }
//     };

//     fetchProperties();

//     return () => {
//       active = false;
//     };
//   }, [currentUserId, navigation]);

//   // ==================================================
//   // Fetch schedules when property changes
//   // ==================================================

//   useEffect(() => {
//     let active = true;

//     const fetchPropertySchedules = async () => {
//       if (!selectedProperty || !currentUserId) {
//         setSchedules([]);
//         return;
//       }

//       setSelectedSchedule(null);
//       setCleaners([]);
//       setCleanerStatuses({});
//       setSearchQuery('');
//       setStatusFilter('all');
//       setSortBy('distance');
//       setStatusCounts({ ...EMPTY_STATUS_COUNTS });

//       try {
//         const response =
//           await userService.getUpcomingSchedulesByHostId(
//             currentUserId
//           );

//         if (!active) return;

//         const scheduleData = Array.isArray(
//           response?.data
//         )
//           ? response.data
//           : [];

//         setSchedules(
//           getUpcomingPropertySchedules(
//             scheduleData,
//             selectedProperty
//           )
//         );
//       } catch (error) {
//         if (!active) return;

//         console.error(
//           'Error fetching property schedules:',
//           error
//         );

//         setSchedules([]);
//       }
//     };

//     fetchPropertySchedules();

//     return () => {
//       active = false;
//     };
//   }, [
//     selectedProperty,
//     currentUserId,
//     getUpcomingPropertySchedules,
//   ]);

//   // ==================================================
//   // Fetch recommendations when schedule changes
//   // ==================================================

//   useEffect(() => {
//     let active = true;

//     const requestId =
//       ++recommendationRequestId.current;

//     const fetchCleanersForSchedule = async () => {
//       if (!selectedScheduleId) {
//         setCleaners([]);
//         setCleanerStatuses({});
//         setLoading(false);
//         setStatusCounts({ ...EMPTY_STATUS_COUNTS });
//         return;
//       }

//       setLoading(true);
//       setCleaners([]);
//       setCleanerStatuses({});
//       setSearchQuery('');
//       setStatusFilter('all');
//       setSortBy('distance');

//       try {
//         const recommendationData =
//           await fetchCleanerRecommendations(
//             selectedScheduleId
//           );

//         if (
//           !active ||
//           requestId !== recommendationRequestId.current
//         ) {
//           return;
//         }

//         setCleaners(recommendationData);

//         const scheduleResponse =
//           await userService.getScheduleById(
//             selectedScheduleId
//           );

//         if (
//           !active ||
//           requestId !== recommendationRequestId.current
//         ) {
//           return;
//         }

//         updateCleanerStatuses(scheduleResponse?.data);
//       } catch (error) {
//         if (
//           !active ||
//           requestId !== recommendationRequestId.current
//         ) {
//           return;
//         }

//         console.error(
//           'Error fetching cleaner recommendations:',
//           error
//         );

//         setCleaners([]);

//         Alert.alert(
//           tSafe('error', 'Error'),
//           tSafe(
//             'failed_load_cleaners',
//             'Unable to load recommended cleaners. Please try again.'
//           )
//         );
//       } finally {
//         if (
//           active &&
//           requestId === recommendationRequestId.current
//         ) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchCleanersForSchedule();

//     return () => {
//       active = false;
//     };
//   }, [
//     selectedScheduleId,
//     fetchCleanerRecommendations,
//     updateCleanerStatuses,
//   ]);

//   // ==================================================
//   // Poll cleaner statuses every 10 seconds
//   // ==================================================

//   useEffect(() => {
//     if (
//       !selectedScheduleId ||
//       currentStep !== 3 ||
//       loading
//     ) {
//       return undefined;
//     }

//     const interval = setInterval(() => {
//       refreshSelectedScheduleStatus(
//         selectedScheduleId
//       );
//     }, 10000);

//     return () => clearInterval(interval);
//   }, [
//     selectedScheduleId,
//     currentStep,
//     loading,
//     refreshSelectedScheduleStatus,
//   ]);

//   // ==================================================
//   // Refresh when screen regains focus
//   // ==================================================

//   useFocusEffect(
//     useCallback(() => {
//       let active = true;

//       const refreshData = async () => {
//         if (!currentUserId) return;

//         try {
//           const response =
//             await userService.getApartment(
//               currentUserId
//             );

//           if (!active) return;

//           const newApartments = Array.isArray(
//             response?.data
//           )
//             ? response.data
//             : [];

//           setApartments(newApartments);

//           if (newApartments.length === 0) {
//             setSelectedProperty(null);
//             setSelectedSchedule(null);
//             setCleaners([]);
//             setSchedules([]);
//             setCurrentStep(1);
//             return;
//           }

//           if (!selectedProperty) return;

//           const propertyExists = newApartments.some(
//             (property) =>
//               String(property._id) ===
//               String(selectedProperty._id)
//           );

//           if (!propertyExists) {
//             setSelectedProperty(null);
//             setSelectedSchedule(null);
//             setCleaners([]);
//             setSchedules([]);
//             setCurrentStep(1);
//             return;
//           }

//           const schedulesResponse =
//             await userService.getUpcomingSchedulesByHostId(
//               currentUserId
//             );

//           if (!active) return;

//           const scheduleData = Array.isArray(
//             schedulesResponse?.data
//           )
//             ? schedulesResponse.data
//             : [];

//           const upcomingSchedules =
//             getUpcomingPropertySchedules(
//               scheduleData,
//               selectedProperty
//             );

//           setSchedules(upcomingSchedules);

//           if (selectedSchedule) {
//             const scheduleExists =
//               upcomingSchedules.some(
//                 (schedule) =>
//                   String(schedule._id) ===
//                   String(selectedSchedule._id)
//               );

//             if (!scheduleExists) {
//               setSelectedSchedule(null);
//               setCleaners([]);
//               setCurrentStep(2);
//               return;
//             }

//             await refreshSelectedScheduleStatus(
//               String(selectedSchedule._id)
//             );
//           }
//         } catch (error) {
//           if (active) {
//             console.error(
//               'Error refreshing FindCleaners:',
//               error
//             );
//           }
//         }
//       };

//       refreshData();

//       return () => {
//         active = false;
//       };
//     }, [
//       currentUserId,
//       selectedProperty,
//       selectedSchedule,
//       getUpcomingPropertySchedules,
//       refreshSelectedScheduleStatus,
//     ])
//   );

//   // ==================================================
//   // Property selection
//   // ==================================================

//   const handleSelectProperty = useCallback(
//     (property) => {
//       if (
//         String(selectedProperty?._id) ===
//         String(property?._id)
//       ) {
//         return;
//       }

//       setSelectedProperty(property);
//       setSelectedSchedule(null);
//       setCleaners([]);
//       setCleanerStatuses({});
//       setSchedules([]);
//       setSearchQuery('');
//       setStatusFilter('all');
//       setSortBy('distance');
//       setStatusCounts({ ...EMPTY_STATUS_COUNTS });
//       setCurrentStep(1);
//     },
//     [selectedProperty]
//   );

//   // ==================================================
//   // Schedule selection
//   // ==================================================

//   const handleSelectSchedule = useCallback(
//     (schedule) => {
//       if (
//         String(selectedSchedule?._id) ===
//         String(schedule?._id)
//       ) {
//         return;
//       }

//       setSelectedSchedule(schedule);
//       setCleaners([]);
//       setCleanerStatuses({});
//       setSearchQuery('');
//       setStatusFilter('all');
//       setSortBy('distance');
//       setStatusCounts({ ...EMPTY_STATUS_COUNTS });
//       setCurrentStep(2);
//     },
//     [selectedSchedule]
//   );

//   // ==================================================
//   // Navigation and recommendation trigger
//   // ==================================================

//   const handleStepNavigation = useCallback(async () => {
//     if (
//       currentStep === 1 &&
//       selectedProperty
//     ) {
//       setCurrentStep(2);
//       return;
//     }

//     if (
//       currentStep !== 2 ||
//       !selectedSchedule ||
//       loading
//     ) {
//       return;
//     }

//     try {
//       setLoading(true);

//       // Preserve the existing recommendation trigger.
//       // Do not replace it with findCleaners(), because that
//       // endpoint is used only to read recommendations.
//       const response =
//         await userService.startCleanerRecommendation(
//           selectedSchedule._id
//         );

//       if (response?.data?.status === 'success') {
//         setCurrentStep(3);

//         // Refresh both the recommendation results and
//         // notification statuses after starting the flow.
//         const [recommendationResult] =
//           await Promise.all([
//             fetchCleanerRecommendations(
//               selectedSchedule._id
//             ),
//             refreshSelectedScheduleStatus(
//               selectedSchedule._id
//             ),
//           ]);

//         setCleaners(recommendationResult);
//       } else {
//         Alert.alert(
//           'Unable to Start Search',
//           'The cleaner recommendation flow could not be started.'
//         );
//       }
//     } catch (error) {
//       console.error(
//         'Error starting cleaner recommendation flow:',
//         error?.response?.data || error?.message
//       );

//       Alert.alert(
//         'Unable to Start Search',
//         error?.response?.data?.detail?.message ||
//           error?.response?.data?.detail ||
//           'Unable to start the cleaner search. Please try again.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [
//     currentStep,
//     selectedProperty,
//     selectedSchedule,
//     loading,
//     fetchCleanerRecommendations,
//     refreshSelectedScheduleStatus,
//   ]);

//   const handleCloseCreateBooking = useCallback(() => {
//     handleCreateSchedule(false);
//   }, [handleCreateSchedule]);

//   // ==================================================
//   // Pull-to-refresh
//   // ==================================================

//   const handleRefresh = useCallback(async () => {
//     if (refreshing || !currentUserId) return;

//     setRefreshing(true);

//     try {
//       const response =
//         await userService.getApartment(
//           currentUserId
//         );

//       const newApartments = Array.isArray(
//         response?.data
//       )
//         ? response.data
//         : [];

//       setApartments(newApartments);

//       if (newApartments.length === 0) {
//         setSelectedProperty(null);
//         setSelectedSchedule(null);
//         setSchedules([]);
//         setCleaners([]);
//         setCleanerStatuses({});
//         setStatusCounts({ ...EMPTY_STATUS_COUNTS });
//         setCurrentStep(1);

//         Alert.alert(
//           tSafe('property_required', 'Property Required'),
//           tSafe(
//             'property_required_description',
//             'Add a property before finding cleaners.'
//           ),
//           [
//             {
//               text: tSafe('ok', 'OK'),
//               onPress: () =>
//                 navigation.replace(
//                   ROUTES.host_dashboard
//                 ),
//             },
//           ]
//         );

//         return;
//       }

//       if (!selectedProperty) return;

//       const propertyExists = newApartments.some(
//         (property) =>
//           String(property._id) ===
//           String(selectedProperty._id)
//       );

//       if (!propertyExists) {
//         setSelectedProperty(null);
//         setSelectedSchedule(null);
//         setSchedules([]);
//         setCleaners([]);
//         setCleanerStatuses({});
//         setStatusCounts({ ...EMPTY_STATUS_COUNTS });
//         setCurrentStep(1);
//         return;
//       }

//       const scheduleResponse =
//         await userService.getUpcomingSchedulesByHostId(
//           currentUserId
//         );

//       const scheduleData = Array.isArray(
//         scheduleResponse?.data
//       )
//         ? scheduleResponse.data
//         : [];

//       const upcomingSchedules =
//         getUpcomingPropertySchedules(
//           scheduleData,
//           selectedProperty
//         );

//       setSchedules(upcomingSchedules);

//       if (!selectedScheduleId) return;

//       const scheduleExists =
//         upcomingSchedules.some(
//           (schedule) =>
//             String(schedule._id) ===
//             selectedScheduleId
//         );

//       if (!scheduleExists) {
//         setSelectedSchedule(null);
//         setCleaners([]);
//         setCleanerStatuses({});
//         setStatusCounts({ ...EMPTY_STATUS_COUNTS });
//         setCurrentStep(2);
//         return;
//       }

//       const recommendationData =
//         await fetchCleanerRecommendations(
//           selectedScheduleId
//         );

//       setCleaners(recommendationData);

//       await refreshSelectedScheduleStatus(
//         selectedScheduleId
//       );
//     } catch (error) {
//       console.error(
//         'FindCleaners refresh error:',
//         error
//       );

//       Alert.alert(
//         tSafe('error', 'Error'),
//         tSafe(
//           'refresh_failed',
//           'Unable to refresh the screen. Please try again.'
//         )
//       );
//     } finally {
//       setRefreshing(false);
//     }
//   }, [
//     refreshing,
//     currentUserId,
//     selectedProperty,
//     selectedScheduleId,
//     navigation,
//     getUpcomingPropertySchedules,
//     fetchCleanerRecommendations,
//     refreshSelectedScheduleStatus,
//   ]);

//   // ==================================================
//   // Open cleaner profile
//   // ==================================================

//   const handleOpenCleanerProfile = useCallback(
//     (cleaner) => {
//       const cleanerId = getCleanerId(cleaner);

//       if (!cleanerId) {
//         Alert.alert(
//           tSafe('error', 'Error'),
//           'The cleaner profile could not be opened because the cleaner ID is missing.'
//         );

//         return;
//       }

//       const normalizedCleaner = {
//         ...cleaner,
//         _id: cleanerId,
//         cleanerId,
//         distanceFromApartment:
//           getCleanerDistance(cleaner),
//       };

//       navigation.navigate(
//         ROUTES.cleaner_profile_info,
//         {
//           item: normalizedCleaner,
//           selected_schedule: selectedSchedule,
//           selected_scheduleId: selectedSchedule?._id,
//           hostId: currentUserId,
//           hostFname:
//             currentUser?.firstname ||
//             currentUser?.firstName ||
//             '',
//           hostLname:
//             currentUser?.lastname ||
//             currentUser?.lastName ||
//             '',
//           distanceFromApartment:
//             getCleanerDistance(cleaner),
//         }
//       );
//     },
//     [
//       navigation,
//       getCleanerId,
//       getCleanerDistance,
//       selectedSchedule,
//       currentUserId,
//       currentUser,
//     ]
//   );

//   // ==================================================
//   // Property card
//   // ==================================================

//   const renderPropertyItem = ({ item }) => {
//     const selected =
//       String(selectedProperty?._id) ===
//       String(item._id);

//     const roomDetails = Array.isArray(
//       item.roomDetails
//     )
//       ? item.roomDetails
//       : [];

//     return (
//       <AppCard
//         variant={selected ? 'elevated' : 'default'}
//         padding="medium"
//         radius="large"
//         bordered
//         style={[
//           styles.propertyCard,
//           selected && styles.selectedCard,
//         ]}
//       >
//         <TouchableOpacity
//           activeOpacity={0.8}
//           accessibilityRole="button"
//           accessibilityState={{ selected }}
//           onPress={() => handleSelectProperty(item)}
//         >
//           <View style={styles.propertyHeader}>
//             <View style={styles.propertyIcon}>
//               <AntDesign
//                 name="home"
//                 size={25}
//                 color={theme.brand.primary}
//               />
//             </View>

//             <View style={styles.propertyDetails}>
//               <AppText
//                 variant="title"
//                 color={theme.text.primary}
//                 weight="semibold"
//                 numberOfLines={2}
//               >
//                 {item.apt_name ||
//                   tSafe(
//                     'unnamed_property',
//                     'Unnamed Property'
//                   )}
//               </AppText>

//               <AppText
//                 variant="caption"
//                 color={theme.text.muted}
//                 numberOfLines={2}
//                 style={styles.propertyAddress}
//               >
//                 {item.address ||
//                   tSafe(
//                     'address_unavailable',
//                     'Address unavailable'
//                   )}
//               </AppText>
//             </View>

//             <View
//               style={[
//                 styles.selectionIndicator,
//                 selected &&
//                   styles.selectionIndicatorActive,
//               ]}
//             >
//               {selected && (
//                 <Feather
//                   name="check"
//                   size={15}
//                   color={theme.surface.default}
//                 />
//               )}
//             </View>
//           </View>

//           <View style={styles.roomTypeContainer}>
//             {roomDetails
//               .slice(0, 3)
//               .map((room, index) => (
//                 <Chip
//                   key={`${item._id}-room-${index}`}
//                   compact
//                   style={styles.roomChip}
//                   textStyle={styles.roomChipText}
//                 >
//                   {`${room?.number || 0} ${
//                     room?.type || ''
//                   }`}
//                 </Chip>
//               ))}
//           </View>
//         </TouchableOpacity>
//       </AppCard>
//     );
//   };

//   // ==================================================
//   // Schedule card
//   // ==================================================

//   const renderScheduleItem = ({ item }) => {
//     const schedule = item?.schedule || {};

//     const date = moment(
//       schedule.cleaning_date,
//       'YYYY-MM-DD',
//       true
//     );

//     const selected =
//       String(selectedSchedule?._id) ===
//       String(item._id);

//     return (
//       <AppCard
//         variant={selected ? 'elevated' : 'default'}
//         padding="medium"
//         radius="large"
//         bordered
//         style={[
//           styles.scheduleCard,
//           selected && styles.selectedCard,
//         ]}
//       >
//         <TouchableOpacity
//           activeOpacity={0.8}
//           accessibilityRole="button"
//           accessibilityState={{ selected }}
//           onPress={() => handleSelectSchedule(item)}
//         >
//           <View style={styles.scheduleRow}>
//             <View style={styles.dateBadge}>
//               <AppText
//                 variant="heading"
//                 color={theme.surface.default}
//                 weight="bold"
//               >
//                 {date.isValid()
//                   ? date.format('D')
//                   : '--'}
//               </AppText>

//               <AppText
//                 variant="caption"
//                 color={theme.surface.default}
//                 weight="semibold"
//               >
//                 {date.isValid()
//                   ? date.format('MMM')
//                   : ''}
//               </AppText>
//             </View>

//             <View style={styles.scheduleDetails}>
//               <AppText
//                 variant="title"
//                 color={theme.text.primary}
//                 weight="semibold"
//               >
//                 {date.isValid()
//                   ? date.format('dddd')
//                   : tSafe(
//                       'date_unavailable',
//                       'Date unavailable'
//                     )}
//               </AppText>

//               <View style={styles.detailRow}>
//                 <MaterialIcons
//                   name="schedule"
//                   size={16}
//                   color={theme.text.muted}
//                 />

//                 <AppText
//                   variant="caption"
//                   color={theme.text.muted}
//                   style={styles.detailText}
//                 >
//                   {formatCleaningTime(
//                     schedule.cleaning_time
//                   )}

//                   {schedule.cleaning_end_time
//                     ? ` – ${formatCleaningTime(
//                         schedule.cleaning_end_time
//                       )}`
//                     : ''}
//                 </AppText>
//               </View>

//               <View style={styles.detailRow}>
//                 <MaterialIcons
//                   name="location-on"
//                   size={16}
//                   color={theme.text.muted}
//                 />

//                 <AppText
//                   variant="caption"
//                   color={theme.text.muted}
//                   numberOfLines={2}
//                   style={styles.detailText}
//                 >
//                   {schedule.address ||
//                     selectedProperty?.address ||
//                     tSafe(
//                       'address_unavailable',
//                       'Address unavailable'
//                     )}
//                 </AppText>
//               </View>
//             </View>

//             <View
//               style={[
//                 styles.selectionIndicator,
//                 selected &&
//                   styles.selectionIndicatorActive,
//               ]}
//             >
//               {selected && (
//                 <Feather
//                   name="check"
//                   size={15}
//                   color={theme.surface.default}
//                 />
//               )}
//             </View>
//           </View>
//         </TouchableOpacity>
//       </AppCard>
//     );
//   };

//   // ==================================================
//   // Recommendation progress card
//   // ==================================================

//   const renderRecommendationProgress = () => {
//     const progress = getRecommendationProgress();

//     return (
//       <AppCard
//         variant="elevated"
//         padding="medium"
//         radius="large"
//         bordered
//         style={styles.progressCard}
//       >
//         <View style={styles.progressHeader}>
//           <View
//             style={[
//               styles.progressIcon,
//               {
//                 backgroundColor:
//                   progress.backgroundColor,
//               },
//             ]}
//           >
//             {progress.showSpinner ? (
//               <ActivityIndicator
//                 size="small"
//                 color={progress.color}
//               />
//             ) : (
//               <Feather
//                 name={progress.icon}
//                 size={23}
//                 color={progress.color}
//               />
//             )}
//           </View>

//           <View style={styles.progressTextContainer}>
//             <AppText
//               variant="title"
//               color={theme.text.primary}
//               weight="semibold"
//             >
//               {progress.title}
//             </AppText>

//             <AppText
//               variant="body"
//               color={theme.text.muted}
//               style={styles.progressMessage}
//             >
//               {progress.message}
//             </AppText>
//           </View>
//         </View>

//         <View style={styles.progressCounts}>
//           {[
//             {
//               key: 'notified',
//               label: 'Notified',
//               color: '#2563EB',
//             },
//             {
//               key: 'pending',
//               label: 'Pending',
//               color: '#D97706',
//             },
//             {
//               key: 'accepted',
//               label: 'Accepted',
//               color: '#15803D',
//             },
//             {
//               key: 'declined',
//               label: 'Declined',
//               color: '#DC2626',
//             },
//           ].map((item) => (
//             <View
//               key={item.key}
//               style={styles.progressCountItem}
//             >
//               <AppText
//                 variant="heading"
//                 color={item.color}
//                 weight="bold"
//               >
//                 {statusCounts[item.key] || 0}
//               </AppText>

//               <AppText
//                 variant="caption"
//                 color={theme.text.muted}
//               >
//                 {item.label}
//               </AppText>
//             </View>
//           ))}
//         </View>

//         <View style={styles.liveStatusRow}>
//           <View style={styles.liveStatusDot} />

//           <AppText
//             variant="caption"
//             color={theme.text.muted}
//           >
//             Cleaner statuses refresh automatically.
//           </AppText>
//         </View>
//       </AppCard>
//     );
//   };

//   // ==================================================
//   // Selected schedule summary
//   // ==================================================

//   const renderScheduleSummary = () => {
//     const schedule = selectedSchedule?.schedule || {};

//     const date = moment(
//       schedule.cleaning_date,
//       'YYYY-MM-DD',
//       true
//     );

//     return (
//       <AppCard
//         variant="elevated"
//         padding="medium"
//         radius="large"
//         bordered
//         style={styles.scheduleSummaryCard}
//       >
//         <View style={styles.summaryCalendarIcon}>
//           <Feather
//             name="calendar"
//             size={21}
//             color={theme.brand.primary}
//           />
//         </View>

//         <View style={styles.scheduleSummaryDetails}>
//           <AppText
//             variant="title"
//             color={theme.text.primary}
//             weight="semibold"
//           >
//             {selectedProperty?.apt_name ||
//               schedule.apartment_name ||
//               ''}
//           </AppText>

//           <AppText
//             variant="body"
//             color={theme.text.muted}
//             style={styles.summaryDate}
//           >
//             {date.isValid()
//               ? date.format('ddd, MMM DD, YYYY')
//               : 'Date unavailable'}
//           </AppText>

//           <View style={styles.detailRow}>
//             <Feather
//               name="clock"
//               size={13}
//               color={theme.text.muted}
//             />

//             <AppText
//               variant="caption"
//               color={theme.text.muted}
//               style={styles.detailText}
//             >
//               {formatCleaningTime(
//                 schedule.cleaning_time
//               )}

//               {schedule.cleaning_end_time
//                 ? ` – ${formatCleaningTime(
//                     schedule.cleaning_end_time
//                   )}`
//                 : ''}
//             </AppText>
//           </View>

//           <AppText
//             variant="caption"
//             color={theme.text.muted}
//             numberOfLines={2}
//             style={styles.summaryAddress}
//           >
//             {schedule.address ||
//               selectedProperty?.address ||
//               ''}
//           </AppText>
//         </View>
//       </AppCard>
//     );
//   };

//   // ==================================================
//   // Cleaner card
//   // ==================================================

//   const renderCleanerItem = ({ item }) => {
//     const cleanerId = getCleanerId(item);
//     const status = getCleanerStatus(item);

//     const statusDisplay =
//       getCleanerStatusDisplay(item);

//     const isAccepted = status === 'accepted';

//     const distance = formatDistance(item);

//     const normalizedCleaner = {
//       ...item,
//       _id: cleanerId,
//       cleanerId,
//       distanceFromApartment:
//         getCleanerDistance(item),
//     };

//     return (
//       <AppCard
//         variant="default"
//         padding="none"
//         radius="large"
//         bordered
//         style={[
//           styles.cleanerCard,
//           isAccepted && styles.acceptedCleanerCard,
//         ]}
//       >
//         {isAccepted && (
//           <View style={styles.acceptedTopBanner}>
//             <Feather
//               name="check-circle"
//               size={15}
//               color="#15803D"
//             />

//             <AppText
//               variant="label"
//               color="#15803D"
//               style={styles.acceptedBannerText}
//             >
//               CLEANER ACCEPTED YOUR REQUEST
//             </AppText>
//           </View>
//         )}

//         <View style={styles.cleanerContent}>
//           <CleanerCard
//             item={normalizedCleaner}
//             status={status}
//             onPress={() =>
//               handleOpenCleanerProfile(item)
//             }
//           />
//         </View>

//         <View style={styles.cleanerStatusSection}>
//           <View style={styles.cleanerStatusLeft}>
//             <View
//               style={[
//                 styles.cleanerStatusBadge,
//                 {
//                   backgroundColor:
//                     statusDisplay.backgroundColor,
//                 },
//               ]}
//             >
//               <Feather
//                 name={statusDisplay.icon}
//                 size={13}
//                 color={statusDisplay.color}
//               />

//               <AppText
//                 variant="label"
//                 color={statusDisplay.color}
//                 style={styles.cleanerStatusBadgeText}
//               >
//                 {statusDisplay.label}
//               </AppText>
//             </View>

//             {distance !== null && (
//               <View style={styles.distanceRow}>
//                 <Feather
//                   name="map-pin"
//                   size={12}
//                   color={theme.text.muted}
//                 />

//                 <AppText
//                   variant="caption"
//                   color={theme.text.muted}
//                   style={styles.distanceText}
//                 >
//                   {distance}
//                 </AppText>
//               </View>
//             )}
//           </View>

//           <TouchableOpacity
//             activeOpacity={0.8}
//             accessibilityRole="button"
//             accessibilityLabel={`View ${getCleanerName(
//               item
//             )}'s profile`}
//             onPress={() =>
//               handleOpenCleanerProfile(item)
//             }
//             style={[
//               styles.profileButton,
//               isAccepted && styles.acceptedProfileButton,
//             ]}
//           >
//             <AppText
//               variant="label"
//               color={
//                 isAccepted
//                   ? '#15803D'
//                   : theme.brand.primary
//               }
//             >
//               View Profile
//             </AppText>

//             <Feather
//               name="chevron-right"
//               size={16}
//               color={
//                 isAccepted
//                   ? '#15803D'
//                   : theme.brand.primary
//               }
//             />
//           </TouchableOpacity>
//         </View>
//       </AppCard>
//     );
//   };

//   // ==================================================
//   // Search, filters, and sorting
//   // ==================================================

//   const renderFilterControls = () => (
//     <AppCard
//       variant="default"
//       padding="medium"
//       radius="large"
//       bordered
//       style={styles.filterCard}
//     >
//       <AppText
//         variant="title"
//         color={theme.text.primary}
//         weight="semibold"
//       >
//         Find a Cleaner
//       </AppText>

//       <View style={styles.searchContainer}>
//         <Feather
//           name="search"
//           size={18}
//           color={theme.text.muted}
//         />

//         <TextInput
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//           placeholder="Search by name or email"
//           placeholderTextColor={theme.text.muted}
//           autoCapitalize="none"
//           autoCorrect={false}
//           returnKeyType="search"
//           accessibilityLabel="Search cleaners by name or email"
//           style={[
//             styles.searchInput,
//             { color: theme.text.primary },
//           ]}
//         />

//         {searchQuery.length > 0 && (
//           <TouchableOpacity
//             accessibilityRole="button"
//             accessibilityLabel="Clear search"
//             onPress={() => setSearchQuery('')}
//             hitSlop={8}
//           >
//             <Feather
//               name="x-circle"
//               size={18}
//               color={theme.text.muted}
//             />
//           </TouchableOpacity>
//         )}
//       </View>

//       <AppText
//         variant="label"
//         color={theme.text.primary}
//         style={styles.filterLabel}
//       >
//         Filter by response
//       </AppText>

//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.filterChips}
//       >
//         {STATUS_FILTERS.map((filter) => {
//           const selected =
//             statusFilter === filter.value;

//           return (
//             <Chip
//               key={filter.value}
//               selected={selected}
//               onPress={() =>
//                 setStatusFilter(filter.value)
//               }
//               compact
//               style={[
//                 styles.filterChip,
//                 selected && styles.activeFilterChip,
//               ]}
//               textStyle={[
//                 styles.filterChipText,
//                 selected &&
//                   styles.activeFilterChipText,
//               ]}
//               accessibilityLabel={filter.label}
//             >
//               {filter.label}
//             </Chip>
//           );
//         })}
//       </ScrollView>

//       <AppText
//         variant="label"
//         color={theme.text.primary}
//         style={styles.filterLabel}
//       >
//         Sort by
//       </AppText>

//       <View style={styles.sortOptions}>
//         {SORT_OPTIONS.map((option) => {
//           const selected =
//             sortBy === option.value;

//           return (
//             <TouchableOpacity
//               key={option.value}
//               activeOpacity={0.8}
//               accessibilityRole="button"
//               accessibilityState={{ selected }}
//               onPress={() =>
//                 setSortBy(option.value)
//               }
//               style={[
//                 styles.sortOption,
//                 selected && styles.activeSortOption,
//               ]}
//             >
//               <Feather
//                 name={
//                   option.value === 'distance'
//                     ? 'map-pin'
//                     : option.value === 'name'
//                       ? 'type'
//                       : 'filter'
//                 }
//                 size={14}
//                 color={
//                   selected
//                     ? theme.surface.default
//                     : theme.text.muted
//                 }
//               />

//               <AppText
//                 variant="caption"
//                 color={
//                   selected
//                     ? theme.surface.default
//                     : theme.text.primary
//                 }
//                 weight="medium"
//                 style={styles.sortOptionText}
//               >
//                 {option.label}
//               </AppText>
//             </TouchableOpacity>
//           );
//         })}
//       </View>

//       <View style={styles.filterResultsRow}>
//         <AppText
//           variant="caption"
//           color={theme.text.muted}
//         >
//           {`${filteredCleaners.length} matching ${
//             filteredCleaners.length === 1
//               ? 'cleaner'
//               : 'cleaners'
//           }`}
//         </AppText>

//         {(searchQuery ||
//           statusFilter !== 'all' ||
//           sortBy !== 'distance') && (
//           <TouchableOpacity
//             onPress={() => {
//               setSearchQuery('');
//               setStatusFilter('all');
//               setSortBy('distance');
//             }}
//             accessibilityRole="button"
//           >
//             <AppText
//               variant="label"
//               color={theme.brand.primary}
//             >
//               Reset filters
//             </AppText>
//           </TouchableOpacity>
//         )}
//       </View>
//     </AppCard>
//   );

//   // ==================================================
//   // Empty results state
//   // ==================================================

//   const renderEmptyCleanerResults = () => {
//     const noRecommendations =
//       cleaners.length === 0;

//     return (
//       <View style={styles.emptyState}>
//         <View style={styles.emptyIconContainer}>
//           <Feather
//             name="users"
//             size={30}
//             color={theme.brand.primary}
//           />
//         </View>

//         <AppText
//           variant="title"
//           color={theme.text.primary}
//           align="center"
//           style={styles.emptyTitle}
//         >
//           {noRecommendations
//             ? 'No cleaner results yet'
//             : 'No matching cleaners'}
//         </AppText>

//         <AppText
//           variant="body"
//           color={theme.text.muted}
//           align="center"
//           style={styles.emptyDescription}
//         >
//           {noRecommendations
//             ? 'Your recommendation process may still be running. Pull down to refresh the results.'
//             : 'Try changing your search or response-status filter.'}
//         </AppText>

//         {!noRecommendations && (
//           <TouchableOpacity
//             style={styles.resetEmptyButton}
//             onPress={() => {
//               setSearchQuery('');
//               setStatusFilter('all');
//               setSortBy('distance');
//             }}
//           >
//             <AppText
//               variant="label"
//               color={theme.brand.primary}
//             >
//               Reset filters
//             </AppText>
//           </TouchableOpacity>
//         )}
//       </View>
//     );
//   };

//   // ==================================================
//   // Main render
//   // ==================================================

//   return (
//     <View style={styles.container}>
//       <ExpoStatusBar
//         style={isDark ? 'light' : 'dark'}
//       />

//       <CustomHeader
//         navigation={navigation}
//         currentStep={currentStep}
//         setCurrentStep={setCurrentStep}
//       />

//       <ScrollView
//         style={styles.scrollView}
//         contentContainerStyle={styles.content}
//         keyboardShouldPersistTaps="handled"
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={handleRefresh}
//             tintColor={theme.brand.primary}
//             colors={[theme.brand.primary]}
//           />
//         }
//       >
//         {/* ========================================== */}
//         {/* Step 1: Choose property */}
//         {/* ========================================== */}

//         {currentStep === 1 && (
//           <Animated.View
//             entering={FadeIn}
//             exiting={FadeOut}
//           >
//             <View style={styles.sectionHeader}>
//               <AppText
//                 variant="heading"
//                 color={theme.text.primary}
//               >
//                 Choose a Property
//               </AppText>

//               <AppText
//                 variant="body"
//                 color={theme.text.muted}
//                 style={styles.sectionSubtitle}
//               >
//                 Select the property that needs cleaning.
//               </AppText>
//             </View>

//             {apartments.length === 0 ? (
//               <View style={styles.emptyState}>
//                 <Feather
//                   name="home"
//                   size={38}
//                   color={theme.text.muted}
//                 />

//                 <AppText
//                   variant="title"
//                   color={theme.text.primary}
//                   align="center"
//                   style={styles.emptyTitle}
//                 >
//                   No Properties Found
//                 </AppText>

//                 <AppText
//                   variant="body"
//                   color={theme.text.muted}
//                   align="center"
//                   style={styles.emptyDescription}
//                 >
//                   Add a property before looking for cleaners.
//                 </AppText>
//               </View>
//             ) : (
//               <FlatList
//                 data={apartments}
//                 renderItem={renderPropertyItem}
//                 keyExtractor={(item) =>
//                   String(item._id)
//                 }
//                 scrollEnabled={false}
//                 removeClippedSubviews={false}
//               />
//             )}
//           </Animated.View>
//         )}

//         {/* ========================================== */}
//         {/* Step 2: Choose schedule */}
//         {/* ========================================== */}

//         {currentStep === 2 && (
//           <Animated.View
//             entering={SlideInRight}
//             exiting={SlideOutLeft}
//           >
//             <View style={styles.sectionHeader}>
//               <AppText
//                 variant="heading"
//                 color={theme.text.primary}
//               >
//                 Choose a Schedule
//               </AppText>

//               <AppText
//                 variant="body"
//                 color={theme.text.muted}
//                 style={styles.sectionSubtitle}
//               >
//                 Select the upcoming cleaning that needs a cleaner.
//               </AppText>
//             </View>

//             {schedules.length === 0 ? (
//               <View style={styles.emptyState}>
//                 <View style={styles.emptyIconContainer}>
//                   <Feather
//                     name="calendar"
//                     size={30}
//                     color={theme.brand.primary}
//                   />
//                 </View>

//                 <AppText
//                   variant="title"
//                   color={theme.text.primary}
//                   align="center"
//                   style={styles.emptyTitle}
//                 >
//                   No Available Schedules
//                 </AppText>

//                 <AppText
//                   variant="body"
//                   color={theme.text.muted}
//                   align="center"
//                   style={styles.emptyDescription}
//                 >
//                   There are no upcoming cleaning schedules for this property.
//                 </AppText>

//                 <TouchableOpacity
//                   activeOpacity={0.85}
//                   style={styles.createScheduleButton}
//                   onPress={() =>
//                     handleCreateSchedule(true)
//                   }
//                 >
//                   <Feather
//                     name="plus"
//                     size={17}
//                     color={theme.surface.default}
//                   />

//                   <AppText
//                     variant="label"
//                     color={theme.surface.default}
//                     style={styles.createScheduleButtonText}
//                   >
//                     Create Schedule
//                   </AppText>
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               <FlatList
//                 data={schedules}
//                 renderItem={renderScheduleItem}
//                 keyExtractor={(item) =>
//                   String(item._id)
//                 }
//                 scrollEnabled={false}
//                 removeClippedSubviews={false}
//               />
//             )}
//           </Animated.View>
//         )}

//         {/* ========================================== */}
//         {/* Step 3: Cleaner search results */}
//         {/* ========================================== */}

//         {currentStep === 3 && selectedSchedule && (
//           <Animated.View
//             entering={SlideInRight}
//             exiting={SlideOutLeft}
//           >
//             <View style={styles.sectionHeader}>
//               <AppText
//                 variant="heading"
//                 color={theme.text.primary}
//               >
//                 Cleaner Search Results
//               </AppText>

//               <AppText
//                 variant="body"
//                 color={theme.text.muted}
//                 style={styles.sectionSubtitle}
//               >
//                 Track responses, review accepted cleaners, and decide which cleaner is right for your schedule.
//               </AppText>
//             </View>

//             {/* Selected schedule */}

//             {renderScheduleSummary()}

//             {/* Recommendation progress and live counts */}

//             {renderRecommendationProgress()}

//             {/* Search, filters, and sorting */}

//             {!loading &&
//               cleaners.length > 0 &&
//               renderFilterControls()}

//             {/* Results heading */}

//             {!loading &&
//               filteredCleaners.length > 0 && (
//                 <View style={styles.listHeading}>
//                   <View style={styles.listHeadingText}>
//                     <AppText
//                       variant="title"
//                       color={theme.text.primary}
//                       weight="semibold"
//                     >
//                       Recommended Cleaners
//                     </AppText>

//                     <AppText
//                       variant="caption"
//                       color={theme.text.muted}
//                     >
//                       Tap a cleaner to review their profile and response status.
//                     </AppText>
//                   </View>

//                   <Chip
//                     compact
//                     style={styles.resultCountChip}
//                     textStyle={styles.resultCountText}
//                   >
//                     {filteredCleaners.length}
//                   </Chip>
//                 </View>
//               )}

//             {/* Loading state */}

//             {loading ? (
//               <View style={styles.skeletonContainer}>
//                 {[...Array(4)].map((_, index) => (
//                   <CleanerCardSkeleton
//                     key={`cleaner-skeleton-${index}`}
//                   />
//                 ))}
//               </View>
//             ) : (
//               <FlatList
//                 data={filteredCleaners}
//                 renderItem={renderCleanerItem}
//                 keyExtractor={(item, index) =>
//                   getCleanerId(item) ||
//                   `cleaner-${index}`
//                 }
//                 scrollEnabled={false}
//                 removeClippedSubviews={false}
//                 ListEmptyComponent={
//                   renderEmptyCleanerResults
//                 }
//               />
//             )}

//             {/* Host decision reminder */}

//             {!loading &&
//               statusCounts.accepted > 0 && (
//                 <AppCard
//                   variant="default"
//                   padding="medium"
//                   radius="large"
//                   bordered
//                   style={styles.hostDecisionCard}
//                 >
//                   <View style={styles.hostDecisionRow}>
//                     <Feather
//                       name="user-check"
//                       size={23}
//                       color="#15803D"
//                     />

//                     <View style={styles.hostDecisionText}>
//                       <AppText
//                         variant="title"
//                         color={theme.text.primary}
//                         weight="semibold"
//                       >
//                         Your decision comes next
//                       </AppText>

//                       <AppText
//                         variant="body"
//                         color={theme.text.muted}
//                         style={styles.hostDecisionMessage}
//                       >
//                         Review the accepted cleaners and choose the cleaner you want. An acceptance does not automatically assign a cleaner to your schedule.
//                       </AppText>
//                     </View>
//                   </View>
//                 </AppCard>
//               )}
//           </Animated.View>
//         )}
//       </ScrollView>

//       {/* ============================================ */}
//       {/* Bottom navigation */}
//       {/* ============================================ */}

//       {(
//         (currentStep === 1 && selectedProperty) ||
//         (currentStep === 2 && selectedSchedule)
//       ) && (
//         <View style={styles.footer}>
//           <TouchableOpacity
//             activeOpacity={0.85}
//             style={[
//               styles.nextButton,
//               loading && styles.disabledNextButton,
//             ]}
//             disabled={loading}
//             onPress={handleStepNavigation}
//           >
//             {loading ? (
//               <ActivityIndicator
//                 size="small"
//                 color={theme.surface.default}
//               />
//             ) : (
//               <>
//                 <AppText
//                   variant="bodyMedium"
//                   color={theme.surface.default}
//                   weight="semibold"
//                 >
//                   {currentStep === 1
//                     ? 'Next: Choose Schedule'
//                     : 'Find Cleaners'}
//                 </AppText>

//                 <Feather
//                   name="arrow-right"
//                   size={19}
//                   color={theme.surface.default}
//                 />
//               </>
//             )}
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* ============================================ */}
//       {/* New booking modal */}
//       {/* ============================================ */}

//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         onRequestClose={handleCloseCreateBooking}
//         statusBarTranslucent
//       >
//         <NewBooking
//           close_modal={handleCloseCreateBooking}
//           mode="create"
//         />
//       </Modal>
//     </View>
//   );
// };

// // ==================================================
// // Theme-aware styles
// // ==================================================

// const createStyles = (theme, isDark) =>
//   StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: theme.background.default,
//     },

//     scrollView: {
//       flex: 1,
//     },

//     content: {
//       paddingTop: 8,
//       paddingBottom: 28,
//     },

//     // Section headings

//     sectionHeader: {
//       marginHorizontal: 18,
//       marginTop: 14,
//       marginBottom: 16,
//     },

//     sectionSubtitle: {
//       marginTop: 6,
//       lineHeight: 21,
//     },

//     // Property cards

//     propertyCard: {
//       marginHorizontal: 16,
//       marginBottom: 12,
//     },

//     selectedCard: {
//       borderColor: theme.brand.primary,
//     },

//     propertyHeader: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },

//     propertyIcon: {
//       width: 50,
//       height: 50,
//       borderRadius: 15,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: theme.surface.elevated,
//       marginRight: 13,
//     },

//     propertyDetails: {
//       flex: 1,
//       paddingRight: 8,
//     },

//     propertyAddress: {
//       marginTop: 5,
//     },

//     selectionIndicator: {
//       width: 24,
//       height: 24,
//       borderRadius: 12,
//       borderWidth: 1.5,
//       borderColor: theme.divider,
//       alignItems: 'center',
//       justifyContent: 'center',
//     },

//     selectionIndicatorActive: {
//       borderColor: theme.brand.primary,
//       backgroundColor: theme.brand.primary,
//     },

//     roomTypeContainer: {
//       flexDirection: 'row',
//       flexWrap: 'wrap',
//       alignItems: 'center',
//       marginTop: 14,
//       gap: 6,
//     },

//     roomChip: {
//       backgroundColor: theme.surface.elevated,
//     },

//     roomChipText: {
//       color: theme.text.muted,
//     },

//     // Schedule cards

//     scheduleCard: {
//       marginHorizontal: 16,
//       marginBottom: 12,
//     },

//     scheduleRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },

//     dateBadge: {
//       width: 62,
//       height: 68,
//       borderRadius: 14,
//       backgroundColor: theme.brand.primary,
//       alignItems: 'center',
//       justifyContent: 'center',
//       marginRight: 14,
//     },

//     scheduleDetails: {
//       flex: 1,
//     },

//     detailRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginTop: 7,
//     },

//     detailText: {
//       flex: 1,
//       marginLeft: 7,
//     },

//     // Schedule summary

//     scheduleSummaryCard: {
//       flexDirection: 'row',
//       marginHorizontal: 16,
//       marginBottom: 14,
//     },

//     summaryCalendarIcon: {
//       width: 44,
//       height: 44,
//       borderRadius: 13,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: theme.surface.elevated,
//       marginRight: 12,
//     },

//     scheduleSummaryDetails: {
//       flex: 1,
//     },

//     summaryDate: {
//       marginTop: 5,
//     },

//     summaryAddress: {
//       marginTop: 7,
//     },

//     // Recommendation progress

//     progressCard: {
//       marginHorizontal: 16,
//       marginBottom: 18,
//     },

//     progressHeader: {
//       flexDirection: 'row',
//       alignItems: 'flex-start',
//     },

//     progressIcon: {
//       width: 46,
//       height: 46,
//       borderRadius: 15,
//       alignItems: 'center',
//       justifyContent: 'center',
//       marginRight: 12,
//     },

//     progressTextContainer: {
//       flex: 1,
//     },

//     progressMessage: {
//       marginTop: 5,
//       lineHeight: 20,
//     },

//     progressCounts: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       marginTop: 18,
//       paddingTop: 15,
//       borderTopWidth: StyleSheet.hairlineWidth,
//       borderTopColor: theme.divider,
//     },

//     progressCountItem: {
//       flex: 1,
//       alignItems: 'center',
//     },

//     liveStatusRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//       marginTop: 14,
//     },

//     liveStatusDot: {
//       width: 7,
//       height: 7,
//       borderRadius: 4,
//       backgroundColor: '#16A34A',
//       marginRight: 7,
//     },

//     // Search and filters

//     filterCard: {
//       marginHorizontal: 16,
//       marginBottom: 18,
//     },

//     searchContainer: {
//       minHeight: 48,
//       marginTop: 13,
//       paddingHorizontal: 12,
//       flexDirection: 'row',
//       alignItems: 'center',
//       borderWidth: 1,
//       borderColor: theme.divider,
//       borderRadius: 12,
//       backgroundColor: theme.surface.elevated,
//     },

//     searchInput: {
//       flex: 1,
//       minHeight: 46,
//       paddingVertical: 8,
//       paddingHorizontal: 10,
//       fontSize: 14,
//     },

//     filterLabel: {
//       marginTop: 17,
//       marginBottom: 8,
//     },

//     filterChips: {
//       alignItems: 'center',
//       paddingRight: 4,
//       gap: 8,
//     },

//     filterChip: {
//       backgroundColor: theme.surface.elevated,
//       borderColor: theme.divider,
//       borderWidth: 1,
//     },

//     activeFilterChip: {
//       backgroundColor: theme.brand.primary,
//       borderColor: theme.brand.primary,
//     },

//     filterChipText: {
//       color: theme.text.primary,
//       fontSize: 12,
//     },

//     activeFilterChipText: {
//       color: theme.surface.default,
//     },

//     sortOptions: {
//       flexDirection: 'row',
//       flexWrap: 'wrap',
//       gap: 8,
//     },

//     sortOption: {
//       minHeight: 36,
//       paddingHorizontal: 10,
//       paddingVertical: 8,
//       borderRadius: 10,
//       borderWidth: 1,
//       borderColor: theme.divider,
//       backgroundColor: theme.surface.elevated,
//       flexDirection: 'row',
//       alignItems: 'center',
//     },

//     activeSortOption: {
//       backgroundColor: theme.brand.primary,
//       borderColor: theme.brand.primary,
//     },

//     sortOptionText: {
//       marginLeft: 6,
//     },

//     filterResultsRow: {
//       marginTop: 15,
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//     },

//     // Cleaner list

//     listHeading: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       marginHorizontal: 18,
//       marginBottom: 12,
//     },

//     listHeadingText: {
//       flex: 1,
//       paddingRight: 8,
//     },

//     resultCountChip: {
//       backgroundColor: theme.surface.elevated,
//     },

//     resultCountText: {
//       color: theme.brand.primary,
//     },

//     cleanerCard: {
//       marginHorizontal: 12,
//       marginBottom: 13,
//       overflow: 'hidden',
//     },

//     cleanerContent: {
//       paddingHorizontal: 0,
//     },

//     // Accepted cleaner highlight

//     acceptedCleanerCard: {
//       borderColor: '#16A34A',
//       borderWidth: 1.5,
//     },

//     acceptedTopBanner: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       paddingHorizontal: 14,
//       paddingVertical: 10,
//       backgroundColor: '#DCFCE7',
//       borderBottomWidth: StyleSheet.hairlineWidth,
//       borderBottomColor: '#86EFAC',
//     },

//     acceptedBannerText: {
//       marginLeft: 7,
//       fontSize: 11,
//       letterSpacing: 0.3,
//     },

//     // Cleaner response status

//     cleanerStatusSection: {
//       minHeight: 66,
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       paddingVertical: 10,
//       paddingLeft: 14,
//       paddingRight: 10,
//       borderTopWidth: StyleSheet.hairlineWidth,
//       borderTopColor: theme.divider,
//       backgroundColor: theme.surface.elevated,
//     },

//     cleanerStatusLeft: {
//       flex: 1,
//       paddingRight: 8,
//     },

//     cleanerStatusBadge: {
//       alignSelf: 'flex-start',
//       flexDirection: 'row',
//       alignItems: 'center',
//       paddingHorizontal: 10,
//       paddingVertical: 6,
//       borderRadius: 16,
//     },

//     cleanerStatusBadgeText: {
//       marginLeft: 5,
//       fontSize: 12,
//     },

//     profileButton: {
//       minHeight: 38,
//       paddingHorizontal: 10,
//       paddingVertical: 8,
//       borderRadius: 10,
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//     },

//     acceptedProfileButton: {
//       backgroundColor: '#F0FDF4',
//     },

//     distanceRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginTop: 6,
//     },

//     distanceText: {
//       marginLeft: 5,
//     },

//     // Host decision reminder

//     hostDecisionCard: {
//       marginHorizontal: 16,
//       marginTop: 6,
//       marginBottom: 24,
//       borderColor: '#86EFAC',
//     },

//     hostDecisionRow: {
//       flexDirection: 'row',
//       alignItems: 'flex-start',
//     },

//     hostDecisionText: {
//       flex: 1,
//       marginLeft: 12,
//     },

//     hostDecisionMessage: {
//       marginTop: 6,
//       lineHeight: 20,
//     },

//     // Empty states

//     emptyState: {
//       alignItems: 'center',
//       justifyContent: 'center',
//       paddingHorizontal: 28,
//       paddingVertical: 38,
//       marginHorizontal: 16,
//       backgroundColor: theme.surface.default,
//       borderRadius: 18,
//       borderWidth: 1,
//       borderColor: theme.divider,
//     },

//     emptyIconContainer: {
//       width: 60,
//       height: 60,
//       borderRadius: 18,
//       backgroundColor: theme.surface.elevated,
//       alignItems: 'center',
//       justifyContent: 'center',
//       marginBottom: 12,
//     },

//     emptyTitle: {
//       marginTop: 12,
//     },

//     emptyDescription: {
//       marginTop: 8,
//       lineHeight: 20,
//     },

//     resetEmptyButton: {
//       marginTop: 16,
//       padding: 8,
//     },

//     createScheduleButton: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//       paddingVertical: 13,
//       paddingHorizontal: 20,
//       backgroundColor: theme.brand.primary,
//       borderRadius: 12,
//       marginTop: 20,
//     },

//     createScheduleButtonText: {
//       marginLeft: 8,
//     },

//     skeletonContainer: {
//       marginTop: 8,
//     },

//     // Footer

//     footer: {
//       backgroundColor: theme.surface.default,
//       paddingHorizontal: 16,
//       paddingTop: 10,
//       paddingBottom: 12,
//       borderTopWidth: StyleSheet.hairlineWidth,
//       borderTopColor: theme.divider,
//     },

//     nextButton: {
//       minHeight: 52,
//       backgroundColor: theme.brand.primary,
//       borderRadius: 14,
//       paddingHorizontal: 18,
//       flexDirection: 'row',
//       justifyContent: 'center',
//       alignItems: 'center',
//       gap: 10,
//     },

//     disabledNextButton: {
//       opacity: 0.7,
//     },
//   });

// export default FindCleaners;









// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   useContext,
//   useRef,
//   useMemo,
// } from 'react';

// import {
//   View,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   FlatList,
//   Modal,
//   Alert,
//   RefreshControl,
// } from 'react-native';

// import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
// import { useFocusEffect } from '@react-navigation/native';

// import Animated, {
//   FadeIn,
//   FadeOut,
//   SlideInRight,
//   SlideOutLeft,
// } from 'react-native-reanimated';

// import {
//   Feather,
//   MaterialIcons,
//   AntDesign,
// } from '@expo/vector-icons';

// import moment from 'moment';

// import {
//   Button,
//   Chip,
// } from 'react-native-paper';

// import userService from '../../services/connection/userService';
// import { AuthContext } from '../../context/AuthContext';
// import { useBookingContext } from '../../context/BookingContext';
// import { useTheme } from '../../theme';
// import AppText from '../../ui/AppText';
// import AppCard from '../../ui/AppCard';
// import { tSafe } from '../../utils/tSafe';
// import ROUTES from '../../constants/routes';
// import CustomHeader from '../../components/shared/CustomHeader';
// import NewBooking from './NewBooking';
// import CleanerCard from '../../components/cleaner/CleanerCard';
// import CleanerCardSkeleton from '../../components/cleaner/CleanerCardSkeleton';
// import CustomCheckbox from '../../components/shared/CustomCheckbox';

// const STATUS_FILTERS = [
//   { label: 'All cleaners', value: 'all' },
//   { label: 'Available', value: 'available' },
//   { label: 'Not contacted', value: 'not_notified' },
//   { label: 'Notified', value: 'notified' },
//   { label: 'Pending', value: 'pending' },
//   { label: 'Accepted', value: 'accepted' },
//   { label: 'Declined', value: 'declined' },
// ];

// const SORT_OPTIONS = [
//   { label: 'Nearest first', value: 'distance' },
//   { label: 'Name A–Z', value: 'name' },
//   { label: 'Status', value: 'status' },
// ];

// const BLOCKED_CLEANER_STATUSES = new Set([
//   'notified',
//   'pending',
//   'accepted',
//   'assigned',
//   'in_progress',
//   'pending_review',
//   'completed',
//   'reviewed',
//   'cancelled',
//   'unavailable',
//   'not_available',
//   'not_available_for_invite',
// ]);

// const EMPTY_STATUS_COUNTS = {
//   notified: 0,
//   pending: 0,
//   accepted: 0,
//   declined: 0,
// };

// const FindCleaners = ({ navigation }) => {
//   const { currentUserId, currentUser } = useContext(AuthContext);

//   const {
//     modalVisible,
//     handleCreateSchedule,
//   } = useBookingContext();

//   const { theme, isDark } = useTheme();

//   const styles = useMemo(
//     () => createStyles(theme, isDark),
//     [theme, isDark]
//   );

//   // --------------------------------------------------
//   // Navigation state
//   // --------------------------------------------------

//   const [currentStep, setCurrentStep] = useState(1);
//   const [selectedProperty, setSelectedProperty] = useState(null);
//   const [selectedSchedule, setSelectedSchedule] = useState(null);

//   // --------------------------------------------------
//   // Data state
//   // --------------------------------------------------

//   const [apartments, setApartments] = useState([]);
//   const [schedules, setSchedules] = useState([]);
//   const [cleaners, setCleaners] = useState([]);

//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   // --------------------------------------------------
//   // Cleaner status state
//   // --------------------------------------------------

//   const [cleanerStatuses, setCleanerStatuses] = useState({});
//   const [statusCounts, setStatusCounts] = useState(
//     EMPTY_STATUS_COUNTS
//   );

//   // --------------------------------------------------
//   // Cleaner selection
//   // --------------------------------------------------

//   const [selectedCleanerIds, setSelectedCleanerIds] = useState([]);
//   const [sendingRequests, setSendingRequests] = useState(false);

//   // --------------------------------------------------
//   // Cleaner search, filters, and sorting
//   // --------------------------------------------------

//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [sortBy, setSortBy] = useState('distance');

//   const statusRefreshInProgress = useRef(false);

//   const selectedScheduleId = selectedSchedule?._id
//     ? String(selectedSchedule._id)
//     : null;

//   // ==================================================
//   // Helpers
//   // ==================================================

//   const getCleanerId = useCallback((cleaner) => {
//     const id = cleaner?.cleanerId ?? cleaner?._id;

//     return id == null ? '' : String(id);
//   }, []);

//   const getCleanerName = useCallback((cleaner) => {
//     const firstName =
//       cleaner?.firstname ??
//       cleaner?.firstName ??
//       cleaner?.first_name ??
//       '';

//     const lastName =
//       cleaner?.lastname ??
//       cleaner?.lastName ??
//       cleaner?.last_name ??
//       '';

//     const fullName = `${firstName} ${lastName}`.trim();

//     return (
//       fullName ||
//       cleaner?.name ||
//       cleaner?.displayName ||
//       cleaner?.email ||
//       ''
//     );
//   }, []);

//   const getCleanerStatus = useCallback(
//     (cleaner) => {
//       const cleanerId = getCleanerId(cleaner);

//       return String(
//         cleanerStatuses[cleanerId] ??
//         cleaner?.status ??
//         'not_notified'
//       ).trim().toLowerCase();
//     },
//     [cleanerStatuses, getCleanerId]
//   );

//   const getCleanerDistance = useCallback((cleaner) => {
//     const rawDistance =
//       cleaner?.distance_miles ??
//       cleaner?.distanceFromApartment ??
//       null;

//     if (
//       rawDistance === null ||
//       rawDistance === undefined ||
//       rawDistance === ''
//     ) {
//       return null;
//     }

//     const distance = Number(rawDistance);

//     return Number.isFinite(distance) ? distance : null;
//   }, []);

//   const formatDistance = useCallback(
//     (cleaner) => {
//       const distance = getCleanerDistance(cleaner);

//       if (distance === null) {
//         return null;
//       }

//       return `${distance.toFixed(1)} ${tSafe(
//         'miles_away',
//         'miles away'
//       )}`;
//     },
//     [getCleanerDistance]
//   );

//   const isCleanerSelectable = useCallback(
//     (cleaner) => {
//       if (!cleaner || sendingRequests) {
//         return false;
//       }

//       const cleanerId = getCleanerId(cleaner);

//       if (!cleanerId) {
//         return false;
//       }

//       const status = getCleanerStatus(cleaner);

//       return !BLOCKED_CLEANER_STATUSES.has(status);
//     },
//     [
//       sendingRequests,
//       getCleanerId,
//       getCleanerStatus,
//     ]
//   );

//   const formatCleaningTime = useCallback((value) => {
//     if (!value) {
//       return '';
//     }

//     const parsed = moment(
//       value,
//       ['HH:mm:ss', 'H:mm:ss', 'HH:mm', 'H:mm'],
//       true
//     );

//     return parsed.isValid()
//       ? parsed.format('h:mm A')
//       : value;
//   }, []);

//   // ==================================================
//   // Derived cleaner list
//   // ==================================================

//   const filteredCleaners = useMemo(() => {
//     const normalizedQuery = searchQuery.trim().toLowerCase();

//     let result = cleaners.filter((cleaner) => {
//       const cleanerName = getCleanerName(cleaner).toLowerCase();
//       const cleanerEmail = String(
//         cleaner?.email ?? ''
//       ).toLowerCase();

//       const matchesSearch =
//         !normalizedQuery ||
//         cleanerName.includes(normalizedQuery) ||
//         cleanerEmail.includes(normalizedQuery);

//       if (!matchesSearch) {
//         return false;
//       }

//       const status = getCleanerStatus(cleaner);
//       const selectable = isCleanerSelectable(cleaner);

//       switch (statusFilter) {
//         case 'available':
//           return selectable;

//         case 'not_notified':
//           return status === 'not_notified';

//         case 'notified':
//           return status === 'notified';

//         case 'pending':
//           return status === 'pending';

//         case 'accepted':
//           return status === 'accepted';

//         case 'declined':
//           return status === 'declined';

//         case 'all':
//         default:
//           return true;
//       }
//     });

//     result = [...result].sort((a, b) => {
//       if (sortBy === 'name') {
//         return getCleanerName(a).localeCompare(
//           getCleanerName(b)
//         );
//       }

//       if (sortBy === 'status') {
//         return getCleanerStatus(a).localeCompare(
//           getCleanerStatus(b)
//         );
//       }

//       if (sortBy === 'distance') {
//         const distanceA = getCleanerDistance(a);
//         const distanceB = getCleanerDistance(b);

//         if (distanceA === null && distanceB === null) {
//           return getCleanerName(a).localeCompare(
//             getCleanerName(b)
//           );
//         }

//         if (distanceA === null) return 1;
//         if (distanceB === null) return -1;

//         return distanceA - distanceB;
//       }

//       return 0;
//     });

//     return result;
//   }, [
//     cleaners,
//     searchQuery,
//     statusFilter,
//     sortBy,
//     getCleanerName,
//     getCleanerStatus,
//     getCleanerDistance,
//     isCleanerSelectable,
//   ]);

//   const eligibleCleaners = useMemo(
//     () => cleaners.filter(isCleanerSelectable),
//     [cleaners, isCleanerSelectable]
//   );

//   const selectedEligibleCount = useMemo(
//     () =>
//       selectedCleanerIds.filter((id) =>
//         eligibleCleaners.some(
//           (cleaner) => getCleanerId(cleaner) === id
//         )
//       ).length,
//     [
//       selectedCleanerIds,
//       eligibleCleaners,
//       getCleanerId,
//     ]
//   );

//   const allEligibleSelected =
//     eligibleCleaners.length > 0 &&
//     eligibleCleaners.every((cleaner) =>
//       selectedCleanerIds.includes(getCleanerId(cleaner))
//     );

//   // ==================================================
//   // Cleaner status updates
//   // ==================================================

//   const updateCleanerStatuses = useCallback((scheduleData) => {
//     const notifiedCleaners = Array.isArray(
//       scheduleData?.notified_cleaners
//     )
//       ? scheduleData.notified_cleaners
//       : [];

//     const statusMap = {};
//     const counts = { ...EMPTY_STATUS_COUNTS };

//     notifiedCleaners.forEach((entry) => {
//       if (
//         entry?.cleanerId === null ||
//         entry?.cleanerId === undefined
//       ) {
//         return;
//       }

//       const cleanerId = String(entry.cleanerId);

//       const status = String(
//         entry.status || 'notified'
//       ).trim().toLowerCase();

//       statusMap[cleanerId] = status;

//       if (
//         Object.prototype.hasOwnProperty.call(
//           counts,
//           status
//         )
//       ) {
//         counts[status] += 1;
//       }
//     });

//     setCleanerStatuses(statusMap);
//     setStatusCounts(counts);
//   }, []);

//   const refreshSelectedScheduleStatus = useCallback(
//     async (scheduleId) => {
//       if (
//         !scheduleId ||
//         statusRefreshInProgress.current
//       ) {
//         return;
//       }

//       statusRefreshInProgress.current = true;

//       try {
//         const response = await userService.getScheduleById(
//           scheduleId
//         );

//         updateCleanerStatuses(response?.data);
//       } catch (error) {
//         console.warn(
//           'Unable to refresh cleaner statuses:',
//           error?.message
//         );
//       } finally {
//         statusRefreshInProgress.current = false;
//       }
//     },
//     [updateCleanerStatuses]
//   );

//   const getUpcomingPropertySchedules = useCallback(
//     (scheduleData, property) => {
//       if (!Array.isArray(scheduleData) || !property) {
//         return [];
//       }

//       return scheduleData.filter((item) => {
//         const schedule = item?.schedule;

//         if (!schedule) {
//           return false;
//         }

//         if (
//           schedule.apartment_name !== property.apt_name
//         ) {
//           return false;
//         }

//         const cleaningDate = schedule.cleaning_date;
//         const cleaningTime = schedule.cleaning_time;

//         if (!cleaningDate || !cleaningTime) {
//           return false;
//         }

//         const cleaningDateTime = moment(
//           `${cleaningDate} ${cleaningTime}`,
//           [
//             'YYYY-MM-DD HH:mm:ss',
//             'YYYY-MM-DD H:mm:ss',
//             'YYYY-MM-DD HH:mm',
//             'YYYY-MM-DD H:mm',
//           ],
//           true
//         );

//         return (
//           cleaningDateTime.isValid() &&
//           cleaningDateTime.isSameOrAfter(moment())
//         );
//       });
//     },
//     []
//   );

//   // ==================================================
//   // Initial property fetch
//   // ==================================================

//   useEffect(() => {
//     let active = true;

//     const fetchProperties = async () => {
//       if (!currentUserId) {
//         return;
//       }

//       try {
//         const response = await userService.getApartment(
//           currentUserId
//         );

//         if (!active) {
//           return;
//         }

//         const propertyData = Array.isArray(response?.data)
//           ? response.data
//           : [];

//         if (propertyData.length === 0) {
//           setApartments([]);

//           Alert.alert(
//             tSafe('property_required', 'Property Required'),
//             tSafe(
//               'property_required_description',
//               'Add at least one property before finding cleaners.'
//             ),
//             [
//               {
//                 text: tSafe('ok', 'OK'),
//                 onPress: () => {
//                   navigation.replace(ROUTES.host_dashboard);
//                 },
//               },
//             ],
//             { cancelable: false }
//           );

//           return;
//         }

//         setApartments(propertyData);
//       } catch (error) {
//         if (!active) return;

//         console.error('Error fetching properties:', error);

//         Alert.alert(
//           tSafe('error', 'Error'),
//           tSafe(
//             'failed_load_properties',
//             'Failed to load your properties. Please try again.'
//           )
//         );
//       }
//     };

//     fetchProperties();

//     return () => {
//       active = false;
//     };
//   }, [currentUserId, navigation]);

//   // ==================================================
//   // Fetch schedules when property changes
//   // ==================================================

//   useEffect(() => {
//     let active = true;

//     const fetchPropertySchedules = async () => {
//       if (!selectedProperty || !currentUserId) {
//         setSchedules([]);
//         return;
//       }

//       setSelectedSchedule(null);
//       setCleaners([]);
//       setCleanerStatuses({});
//       setSelectedCleanerIds([]);
//       setSearchQuery('');
//       setStatusFilter('all');
//       setSortBy('distance');
//       setStatusCounts({ ...EMPTY_STATUS_COUNTS });

//       try {
//         const response =
//           await userService.getUpcomingSchedulesByHostId(
//             currentUserId
//           );

//         if (!active) return;

//         const scheduleData = Array.isArray(response?.data)
//           ? response.data
//           : [];

//         setSchedules(
//           getUpcomingPropertySchedules(
//             scheduleData,
//             selectedProperty
//           )
//         );
//       } catch (error) {
//         if (!active) return;

//         console.error(
//           'Error fetching property schedules:',
//           error
//         );

//         setSchedules([]);
//       }
//     };

//     fetchPropertySchedules();

//     return () => {
//       active = false;
//     };
//   }, [
//     selectedProperty,
//     currentUserId,
//     getUpcomingPropertySchedules,
//   ]);

//   // ==================================================
//   // Fetch recommendations when schedule changes
//   // ==================================================

//   useEffect(() => {
//     let active = true;

//     const fetchCleanersForSchedule = async () => {
//       if (!selectedScheduleId) {
//         setCleaners([]);
//         setCleanerStatuses({});
//         setSelectedCleanerIds([]);
//         setLoading(false);
//         setStatusCounts({ ...EMPTY_STATUS_COUNTS });
//         return;
//       }

//       setLoading(true);
//       setCleaners([]);
//       setCleanerStatuses({});
//       setSelectedCleanerIds([]);
//       setSearchQuery('');
//       setStatusFilter('all');
//       setSortBy('distance');

//       try {
//         // This endpoint is read-only: it only retrieves recommendations.
//         const cleanersResponse =
//           await userService.findCleaners(
//             selectedScheduleId
//           );

//         if (!active) return;

//         const recommendationData = Array.isArray(
//           cleanersResponse?.data
//         )
//           ? cleanersResponse.data
//           : Array.isArray(
//               cleanersResponse?.data?.cleaners
//             )
//             ? cleanersResponse.data.cleaners
//             : [];

//         setCleaners(recommendationData);

//         const scheduleResponse =
//           await userService.getScheduleById(
//             selectedScheduleId
//           );

//         if (!active) return;

//         updateCleanerStatuses(scheduleResponse?.data);
//       } catch (error) {
//         if (!active) return;

//         console.error(
//           'Error fetching cleaner recommendations:',
//           error
//         );

//         setCleaners([]);

//         Alert.alert(
//           tSafe('error', 'Error'),
//           tSafe(
//             'failed_load_cleaners',
//             'Unable to load recommended cleaners. Please try again.'
//           )
//         );
//       } finally {
//         if (active) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchCleanersForSchedule();

//     return () => {
//       active = false;
//     };
//   }, [
//     selectedScheduleId,
//     updateCleanerStatuses,
//   ]);

//   // ==================================================
//   // Poll statuses every 10 seconds
//   // ==================================================

//   useEffect(() => {
//     if (!selectedScheduleId || loading) {
//       return undefined;
//     }

//     const interval = setInterval(() => {
//       refreshSelectedScheduleStatus(selectedScheduleId);
//     }, 10000);

//     return () => clearInterval(interval);
//   }, [
//     selectedScheduleId,
//     loading,
//     refreshSelectedScheduleStatus,
//   ]);

//   // ==================================================
//   // Refresh when screen regains focus
//   // ==================================================

//   useFocusEffect(
//     useCallback(() => {
//       let active = true;

//       const refreshData = async () => {
//         if (!currentUserId) return;

//         try {
//           const response = await userService.getApartment(
//             currentUserId
//           );

//           if (!active) return;

//           const newApartments = Array.isArray(response?.data)
//             ? response.data
//             : [];

//           setApartments(newApartments);

//           if (newApartments.length === 0) {
//             setSelectedProperty(null);
//             setSelectedSchedule(null);
//             setSelectedCleanerIds([]);
//             setCleaners([]);
//             setSchedules([]);
//             setCurrentStep(1);
//             return;
//           }

//           if (!selectedProperty) return;

//           const propertyExists = newApartments.some(
//             (property) =>
//               String(property._id) ===
//               String(selectedProperty._id)
//           );

//           if (!propertyExists) {
//             setSelectedProperty(null);
//             setSelectedSchedule(null);
//             setSelectedCleanerIds([]);
//             setCleaners([]);
//             setSchedules([]);
//             setCurrentStep(1);
//             return;
//           }

//           const schedulesResponse =
//             await userService.getUpcomingSchedulesByHostId(
//               currentUserId
//             );

//           if (!active) return;

//           const scheduleData = Array.isArray(
//             schedulesResponse?.data
//           )
//             ? schedulesResponse.data
//             : [];

//           const upcomingSchedules =
//             getUpcomingPropertySchedules(
//               scheduleData,
//               selectedProperty
//             );

//           setSchedules(upcomingSchedules);

//           if (selectedSchedule) {
//             const scheduleExists = upcomingSchedules.some(
//               (schedule) =>
//                 String(schedule._id) ===
//                 String(selectedSchedule._id)
//             );

//             if (!scheduleExists) {
//               setSelectedSchedule(null);
//               setSelectedCleanerIds([]);
//               setCleaners([]);
//               setCurrentStep(2);
//               return;
//             }

//             await refreshSelectedScheduleStatus(
//               String(selectedSchedule._id)
//             );
//           }
//         } catch (error) {
//           if (active) {
//             console.error(
//               'Error refreshing FindCleaners:',
//               error
//             );
//           }
//         }
//       };

//       refreshData();

//       return () => {
//         active = false;
//       };
//     }, [
//       currentUserId,
//       selectedProperty,
//       selectedSchedule,
//       getUpcomingPropertySchedules,
//       refreshSelectedScheduleStatus,
//     ])
//   );

//   // ==================================================
//   // Selection handlers
//   // ==================================================

//   const toggleCleanerSelection = useCallback(
//     (cleaner) => {
//       if (sendingRequests || !cleaner) {
//         return;
//       }

//       const cleanerObject =
//         typeof cleaner === 'object'
//           ? cleaner
//           : cleaners.find(
//               (item) =>
//                 getCleanerId(item) === String(cleaner)
//             );

//       if (!cleanerObject) return;

//       const cleanerId = getCleanerId(cleanerObject);

//       if (!cleanerId) return;

//       setSelectedCleanerIds((previous) => {
//         // Permit deselection even if a cleaner's status has changed.
//         if (previous.includes(cleanerId)) {
//           return previous.filter((id) => id !== cleanerId);
//         }

//         // Only allow adding an eligible cleaner.
//         if (!isCleanerSelectable(cleanerObject)) {
//           return previous;
//         }

//         return [...previous, cleanerId];
//       });
//     },
//     [
//       sendingRequests,
//       cleaners,
//       getCleanerId,
//       isCleanerSelectable,
//     ]
//   );

//   const toggleSelectAllAvailable = useCallback(() => {
//     if (sendingRequests) return;

//     const eligibleIds = cleaners
//       .filter(isCleanerSelectable)
//       .map(getCleanerId)
//       .filter(Boolean);

//     if (eligibleIds.length === 0) {
//       Alert.alert(
//         tSafe('no_available_cleaners', 'No Available Cleaners'),
//         tSafe(
//           'no_eligible_cleaners_to_select',
//           'There are no eligible cleaners to select.'
//         )
//       );

//       return;
//     }

//     setSelectedCleanerIds((previous) => {
//       const allSelected = eligibleIds.every((id) =>
//         previous.includes(id)
//       );

//       if (allSelected) {
//         return previous.filter(
//           (id) => !eligibleIds.includes(id)
//         );
//       }

//       return [...new Set([...previous, ...eligibleIds])];
//     });
//   }, [
//     sendingRequests,
//     cleaners,
//     isCleanerSelectable,
//     getCleanerId,
//   ]);

//   const clearCleanerSelection = useCallback(() => {
//     if (!sendingRequests) {
//       setSelectedCleanerIds([]);
//     }
//   }, [sendingRequests]);

//   const handleSelectProperty = useCallback(
//     (property) => {
//       if (
//         String(selectedProperty?._id) ===
//         String(property?._id)
//       ) {
//         return;
//       }

//       setSelectedProperty(property);
//       setSelectedSchedule(null);
//       setSelectedCleanerIds([]);
//       setCleaners([]);
//       setCleanerStatuses({});
//       setSchedules([]);
//       setSearchQuery('');
//       setStatusFilter('all');
//       setSortBy('distance');
//       setCurrentStep(1);
//     },
//     [selectedProperty]
//   );

//   const handleSelectSchedule = useCallback(
//     (schedule) => {
//       if (
//         String(selectedSchedule?._id) ===
//         String(schedule?._id)
//       ) {
//         return;
//       }

//       setSelectedSchedule(schedule);
//       setSelectedCleanerIds([]);
//       setCleaners([]);
//       setCleanerStatuses({});
//       setSearchQuery('');
//       setStatusFilter('all');
//       setSortBy('distance');
//       setCurrentStep(2);
//     },
//     [selectedSchedule]
//   );

//   // ==================================================
//   // Bulk request submission
//   // ==================================================

//   /**
//    * The dedicated initial-cleaner invitation endpoint has not
//    * been connected in this component yet.
//    *
//    * Do not replace this with the replacement-cleaner endpoint.
//    */

//   const handleSendCleanerRequests = useCallback(async () => {
//     if (sendingRequests) return;

//     if (!selectedScheduleId) {
//       Alert.alert(
//         tSafe('schedule_required', 'Schedule Required'),
//         tSafe(
//           'select_schedule_first',
//           'Please select a cleaning schedule first.'
//         )
//       );

//       return;
//     }

//     if (selectedCleanerIds.length === 0) {
//       Alert.alert(
//         tSafe('select_cleaners', 'Select Cleaners'),
//         tSafe(
//           'select_at_least_one_cleaner',
//           'Please select at least one cleaner.'
//         )
//       );

//       return;
//     }

//     const selectedCleaners = cleaners.filter((cleaner) =>
//       selectedCleanerIds.includes(getCleanerId(cleaner))
//     );

//     const validCleaners = selectedCleaners.filter(
//       isCleanerSelectable
//     );

//     const validIds = validCleaners
//       .map(getCleanerId)
//       .filter(Boolean);

//     if (
//       validIds.length !== selectedCleanerIds.length ||
//       selectedCleaners.length !== selectedCleanerIds.length
//     ) {
//       setSelectedCleanerIds(validIds);

//       Alert.alert(
//         tSafe('review_selection', 'Review Selection'),
//         tSafe(
//           'selection_changed_message',
//           'One or more selected cleaners are no longer eligible. Review your selection before continuing.'
//         )
//       );

//       return;
//     }

//     Alert.alert(
//       tSafe('bulk_requests', 'Bulk Cleaner Requests'),
//       tSafe(
//         'bulk_endpoint_not_connected',
//         'Your selection is ready. The dedicated initial-cleaner invitation endpoint must be connected before invitations can be sent.'
//       ),
//       [{ text: tSafe('ok', 'OK') }]
//     );
//   }, [
//     sendingRequests,
//     selectedScheduleId,
//     selectedCleanerIds,
//     cleaners,
//     getCleanerId,
//     isCleanerSelectable,
//   ]);

//   // ==================================================
//   // Navigation
//   // ==================================================

//   // const handleStepNavigation = useCallback(() => {
//   //   if (currentStep === 1 && selectedProperty) {
//   //     setCurrentStep(2);
//   //     return;
//   //   }

//   //   if (currentStep === 2 && selectedSchedule) {
//   //     setCurrentStep(3);
//   //   }
//   // }, [
//   //   currentStep,
//   //   selectedProperty,
//   //   selectedSchedule,
//   // ]);


//   const handleStepNavigation = useCallback(async () => {
//     if (currentStep === 1 && selectedProperty) {
//       setCurrentStep(2);
//       return;
//     }
  
//     if (currentStep === 2 && selectedSchedule) {
//       try {
//         setLoading(true);
  
//         const response = await userService.startCleanerRecommendation(
//           selectedSchedule._id
//         );
  
//         if (response.data?.status === 'success') {
//           setCurrentStep(3);
  
//           // Refresh the schedule and its cleaner notification statuses.
//           await refreshSelectedScheduleStatus(selectedSchedule._id);
//         } else {
//           Alert.alert(
//             'Unable to Start Search',
//             'The cleaner recommendation flow could not be started.'
//           );
//         }
//       } catch (error) {
//         console.error(
//           'Error starting cleaner recommendation flow:',
//           error.response?.data || error.message
//         );
  
//         Alert.alert(
//           'Unable to Start Search',
//           error.response?.data?.detail?.message ||
//             error.response?.data?.detail ||
//             'Unable to start the cleaner search. Please try again.'
//         );
//       } finally {
//         setLoading(false);
//       }
//     }
//   }, [
//     currentStep,
//     selectedProperty,
//     selectedSchedule,
//     refreshSelectedScheduleStatus,
//   ]);

//   const handleCloseCreateBooking = useCallback(() => {
//     handleCreateSchedule(false);
//   }, [handleCreateSchedule]);

//   // ==================================================
//   // Pull-to-refresh
//   // ==================================================

//   const handleRefresh = useCallback(async () => {
//     if (refreshing || !currentUserId) return;

//     setRefreshing(true);

//     try {
//       const response = await userService.getApartment(
//         currentUserId
//       );

//       const newApartments = Array.isArray(response?.data)
//         ? response.data
//         : [];

//       setApartments(newApartments);

//       if (newApartments.length === 0) {
//         setSelectedProperty(null);
//         setSelectedSchedule(null);
//         setSelectedCleanerIds([]);
//         setSchedules([]);
//         setCleaners([]);
//         setCurrentStep(1);

//         Alert.alert(
//           tSafe('property_required', 'Property Required'),
//           tSafe(
//             'property_required_description',
//             'Add a property before finding cleaners.'
//           ),
//           [
//             {
//               text: tSafe('ok', 'OK'),
//               onPress: () =>
//                 navigation.replace(ROUTES.host_dashboard),
//             },
//           ]
//         );

//         return;
//       }

//       if (!selectedProperty) return;

//       const scheduleResponse =
//         await userService.getUpcomingSchedulesByHostId(
//           currentUserId
//         );

//       const scheduleData = Array.isArray(
//         scheduleResponse?.data
//       )
//         ? scheduleResponse.data
//         : [];

//       const upcomingSchedules =
//         getUpcomingPropertySchedules(
//           scheduleData,
//           selectedProperty
//         );

//       setSchedules(upcomingSchedules);

//       if (selectedScheduleId) {
//         const scheduleExists = upcomingSchedules.some(
//           (schedule) =>
//             String(schedule._id) === selectedScheduleId
//         );

//         if (!scheduleExists) {
//           setSelectedSchedule(null);
//           setSelectedCleanerIds([]);
//           setCleaners([]);
//           setCurrentStep(2);
//           return;
//         }

//         // Refresh both recommendation data and statuses.
//         const cleanersResponse =
//           await userService.findCleaners(selectedScheduleId);

//         const recommendationData = Array.isArray(
//           cleanersResponse?.data
//         )
//           ? cleanersResponse.data
//           : Array.isArray(
//               cleanersResponse?.data?.cleaners
//             )
//             ? cleanersResponse.data.cleaners
//             : [];

//         setCleaners(recommendationData);

//         await refreshSelectedScheduleStatus(
//           selectedScheduleId
//         );
//       }
//     } catch (error) {
//       console.error('FindCleaners refresh error:', error);

//       Alert.alert(
//         tSafe('error', 'Error'),
//         tSafe(
//           'refresh_failed',
//           'Unable to refresh the screen. Please try again.'
//         )
//       );
//     } finally {
//       setRefreshing(false);
//     }
//   }, [
//     refreshing,
//     currentUserId,
//     selectedProperty,
//     selectedScheduleId,
//     navigation,
//     getUpcomingPropertySchedules,
//     refreshSelectedScheduleStatus,
//   ]);

//   // ==================================================
//   // Property card
//   // ==================================================

//   const renderPropertyItem = ({ item }) => {
//     const selected =
//       String(selectedProperty?._id) === String(item._id);

//     const roomDetails = Array.isArray(item.roomDetails)
//       ? item.roomDetails
//       : [];

//     return (
//       <AppCard
//         variant={selected ? 'elevated' : 'default'}
//         padding="medium"
//         radius="large"
//         bordered
//         style={[
//           styles.propertyCard,
//           selected && styles.selectedCard,
//         ]}
//       >
//         <TouchableOpacity
//           activeOpacity={0.8}
//           accessibilityRole="button"
//           accessibilityState={{ selected }}
//           onPress={() => handleSelectProperty(item)}
//         >
//           <View style={styles.propertyHeader}>
//             <View style={styles.propertyIcon}>
//               <AntDesign
//                 name="home"
//                 size={25}
//                 color={theme.brand.primary}
//               />
//             </View>

//             <View style={styles.propertyDetails}>
//               <AppText
//                 variant="title"
//                 color={theme.text.primary}
//                 weight="semibold"
//                 numberOfLines={2}
//               >
//                 {item.apt_name ||
//                   tSafe('unnamed_property', 'Unnamed Property')}
//               </AppText>

//               <AppText
//                 variant="caption"
//                 color={theme.text.muted}
//                 numberOfLines={2}
//                 style={styles.propertyAddress}
//               >
//                 {item.address ||
//                   tSafe(
//                     'address_unavailable',
//                     'Address unavailable'
//                   )}
//               </AppText>
//             </View>

//             <View
//               style={[
//                 styles.selectionIndicator,
//                 selected && styles.selectionIndicatorActive,
//               ]}
//             >
//               {selected && (
//                 <Feather
//                   name="check"
//                   size={15}
//                   color={theme.surface.default}
//                 />
//               )}
//             </View>
//           </View>

//           <View style={styles.roomTypeContainer}>
//             {roomDetails.slice(0, 3).map((room, index) => (
//               <Chip
//                 key={`${item._id}-room-${index}`}
//                 compact
//                 style={styles.roomChip}
//                 textStyle={styles.roomChipText}
//               >
//                 {`${room?.number || 0} ${room?.type || ''}`}
//               </Chip>
//             ))}
//           </View>
//         </TouchableOpacity>
//       </AppCard>
//     );
//   };

//   // ==================================================
//   // Schedule card
//   // ==================================================

//   const renderScheduleItem = ({ item }) => {
//     const schedule = item?.schedule || {};

//     const date = moment(
//       schedule.cleaning_date,
//       'YYYY-MM-DD',
//       true
//     );

//     const selected =
//       String(selectedSchedule?._id) === String(item._id);

//     return (
//       <AppCard
//         variant={selected ? 'elevated' : 'default'}
//         padding="medium"
//         radius="large"
//         bordered
//         style={[
//           styles.scheduleCard,
//           selected && styles.selectedCard,
//         ]}
//       >
//         <TouchableOpacity
//           activeOpacity={0.8}
//           accessibilityRole="button"
//           accessibilityState={{ selected }}
//           onPress={() => handleSelectSchedule(item)}
//         >
//           <View style={styles.scheduleRow}>
//             <View style={styles.dateBadge}>
//               <AppText
//                 variant="heading"
//                 color={theme.surface.default}
//                 weight="bold"
//               >
//                 {date.isValid() ? date.format('D') : '--'}
//               </AppText>

//               <AppText
//                 variant="caption"
//                 color={theme.surface.default}
//                 weight="semibold"
//               >
//                 {date.isValid() ? date.format('MMM') : ''}
//               </AppText>
//             </View>

//             <View style={styles.scheduleDetails}>
//               <AppText
//                 variant="title"
//                 color={theme.text.primary}
//                 weight="semibold"
//               >
//                 {date.isValid()
//                   ? date.format('dddd')
//                   : tSafe('date_unavailable', 'Date unavailable')}
//               </AppText>

//               <View style={styles.detailRow}>
//                 <MaterialIcons
//                   name="schedule"
//                   size={16}
//                   color={theme.text.muted}
//                 />

//                 <AppText
//                   variant="caption"
//                   color={theme.text.muted}
//                   style={styles.detailText}
//                 >
//                   {formatCleaningTime(schedule.cleaning_time)}
//                   {schedule.cleaning_end_time
//                     ? ` – ${formatCleaningTime(
//                         schedule.cleaning_end_time
//                       )}`
//                     : ''}
//                 </AppText>
//               </View>

//               <View style={styles.detailRow}>
//                 <MaterialIcons
//                   name="location-on"
//                   size={16}
//                   color={theme.text.muted}
//                 />

//                 <AppText
//                   variant="caption"
//                   color={theme.text.muted}
//                   numberOfLines={2}
//                   style={styles.detailText}
//                 >
//                   {schedule.address ||
//                     selectedProperty?.address ||
//                     tSafe(
//                       'address_unavailable',
//                       'Address unavailable'
//                     )}
//                 </AppText>
//               </View>
//             </View>

//             <View
//               style={[
//                 styles.selectionIndicator,
//                 selected && styles.selectionIndicatorActive,
//               ]}
//             >
//               {selected && (
//                 <Feather
//                   name="check"
//                   size={15}
//                   color={theme.surface.default}
//                 />
//               )}
//             </View>
//           </View>
//         </TouchableOpacity>
//       </AppCard>
//     );
//   };

//   // ==================================================
//   // Cleaner card
//   // ==================================================

//   const renderCleanerItem = ({ item }) => {
//     const cleanerId = getCleanerId(item);
//     const status = getCleanerStatus(item);
//     const selectable = isCleanerSelectable(item);
//     const checked = selectedCleanerIds.includes(cleanerId);
//     const distance = formatDistance(item);

//     const normalizedCleaner = {
//       ...item,
//       _id: cleanerId,
//       cleanerId,
//       distanceFromApartment: getCleanerDistance(item),
//     };

//     const checkboxLabel = checked
//       ? tSafe('deselect_cleaner', 'Deselect cleaner')
//       : tSafe('select_cleaner', 'Select cleaner');

//     return (
//       <AppCard
//         variant={checked ? 'elevated' : 'default'}
//         padding="none"
//         radius="large"
//         bordered
//         style={[
//           styles.cleanerCard,
//           checked && styles.selectedCleanerCard,
//         ]}
//       >
//         <View style={styles.cleanerContent}>
//           <CleanerCard
//             item={normalizedCleaner}
//             status={status}
//             onPress={() => {
//               navigation.navigate(
//                 ROUTES.cleaner_profile_info,
//                 {
//                   item: normalizedCleaner,
//                   selected_schedule: selectedSchedule,
//                   selected_scheduleId: selectedSchedule?._id,
//                   hostId: currentUserId,
//                   hostFname:
//                     currentUser?.firstname ||
//                     currentUser?.firstName ||
//                     '',
//                   hostLname:
//                     currentUser?.lastname ||
//                     currentUser?.lastName ||
//                     '',
//                   distanceFromApartment:
//                     getCleanerDistance(item),
//                 }
//               );
//             }}
//           />
//         </View>

//         <View style={styles.cleanerSelectionRow}>
//           <View style={styles.cleanerSelectionDetails}>
//             <AppText
//               variant="bodyMedium"
//               color={theme.text.primary}
//               weight="medium"
//             >
//               {checked
//                 ? tSafe('selected', 'Selected')
//                 : selectable
//                   ? tSafe(
//                       'available_to_invite',
//                       'Available to invite'
//                     )
//                   : tSafe(
//                       'not_available_for_invite',
//                       'Not available for a new invitation'
//                     )}
//             </AppText>

//             {distance !== null && (
//               <View style={styles.distanceRow}>
//                 <Feather
//                   name="map-pin"
//                   size={12}
//                   color={theme.text.muted}
//                 />

//                 <AppText
//                   variant="caption"
//                   color={theme.text.muted}
//                   style={styles.distanceText}
//                 >
//                   {distance}
//                 </AppText>
//               </View>
//             )}
//           </View>

//           <View
//             style={[
//               styles.checkboxContainer,
//               !selectable && !checked && styles.disabledCheckbox,
//             ]}
//           >
//             <CustomCheckbox
//               checked={checked}
//               onPress={() => toggleCleanerSelection(item)}
//               label={checkboxLabel}
//               accessibilityLabel={checkboxLabel}
//             />
//           </View>
//         </View>
//       </AppCard>
//     );
//   };

//   // ==================================================
//   // Filter and sort controls
//   // ==================================================

//   const renderFilterControls = () => (
//     <AppCard
//       variant="default"
//       padding="medium"
//       radius="large"
//       bordered
//       style={styles.filterCard}
//     >
//       <AppText
//         variant="title"
//         color={theme.text.primary}
//         weight="semibold"
//       >
//         {tSafe('filter_cleaners', 'Find a Cleaner')}
//       </AppText>

//       <View style={styles.searchContainer}>
//         <Feather
//           name="search"
//           size={18}
//           color={theme.text.muted}
//         />

//         <TextInput
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//           placeholder={tSafe(
//             'search_cleaners_placeholder',
//             'Search by name or email'
//           )}
//           placeholderTextColor={theme.text.muted}
//           autoCapitalize="none"
//           autoCorrect={false}
//           returnKeyType="search"
//           accessibilityLabel={tSafe(
//             'search_cleaners',
//             'Search cleaners by name or email'
//           )}
//           style={[
//             styles.searchInput,
//             { color: theme.text.primary },
//           ]}
//         />

//         {searchQuery.length > 0 && (
//           <TouchableOpacity
//             accessibilityRole="button"
//             accessibilityLabel={tSafe(
//               'clear_search',
//               'Clear search'
//             )}
//             onPress={() => setSearchQuery('')}
//             hitSlop={8}
//           >
//             <Feather
//               name="x-circle"
//               size={18}
//               color={theme.text.muted}
//             />
//           </TouchableOpacity>
//         )}
//       </View>

//       <AppText
//         variant="label"
//         color={theme.text.primary}
//         style={styles.filterLabel}
//       >
//         {tSafe('filter_by_status', 'Filter by status')}
//       </AppText>

//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.filterChips}
//       >
//         {STATUS_FILTERS.map((filter) => {
//           const selected = statusFilter === filter.value;

//           return (
//             <Chip
//               key={filter.value}
//               selected={selected}
//               onPress={() => setStatusFilter(filter.value)}
//               compact
//               style={[
//                 styles.filterChip,
//                 selected && styles.activeFilterChip,
//               ]}
//               textStyle={[
//                 styles.filterChipText,
//                 selected && styles.activeFilterChipText,
//               ]}
//               accessibilityLabel={tSafe(
//                 `filter_${filter.value}`,
//                 filter.label
//               )}
//             >
//               {tSafe(
//                 `filter_${filter.value}`,
//                 filter.label
//               )}
//             </Chip>
//           );
//         })}
//       </ScrollView>

//       <AppText
//         variant="label"
//         color={theme.text.primary}
//         style={styles.filterLabel}
//       >
//         {tSafe('sort_by', 'Sort by')}
//       </AppText>

//       <View style={styles.sortOptions}>
//         {SORT_OPTIONS.map((option) => {
//           const selected = sortBy === option.value;

//           return (
//             <TouchableOpacity
//               key={option.value}
//               activeOpacity={0.8}
//               accessibilityRole="button"
//               accessibilityState={{ selected }}
//               onPress={() => setSortBy(option.value)}
//               style={[
//                 styles.sortOption,
//                 selected && styles.activeSortOption,
//               ]}
//             >
//               <Feather
//                 name={
//                   option.value === 'distance'
//                     ? 'map-pin'
//                     : option.value === 'name'
//                       ? 'type'
//                       : 'filter'
//                 }
//                 size={14}
//                 color={
//                   selected
//                     ? theme.surface.default
//                     : theme.text.muted
//                 }
//               />

//               <AppText
//                 variant="caption"
//                 color={
//                   selected
//                     ? theme.surface.default
//                     : theme.text.primary
//                 }
//                 weight="medium"
//                 style={styles.sortOptionText}
//               >
//                 {tSafe(
//                   `sort_${option.value}`,
//                   option.label
//                 )}
//               </AppText>
//             </TouchableOpacity>
//           );
//         })}
//       </View>

//       <View style={styles.filterResultsRow}>
//         <AppText
//           variant="caption"
//           color={theme.text.muted}
//         >
//           {`${filteredCleaners.length} ${tSafe(
//             'matching_cleaners',
//             'matching cleaners'
//           )}`}
//         </AppText>

//         {(searchQuery || statusFilter !== 'all' ||
//           sortBy !== 'distance') && (
//           <TouchableOpacity
//             onPress={() => {
//               setSearchQuery('');
//               setStatusFilter('all');
//               setSortBy('distance');
//             }}
//             accessibilityRole="button"
//           >
//             <AppText
//               variant="label"
//               color={theme.brand.primary}
//             >
//               {tSafe('reset_filters', 'Reset filters')}
//             </AppText>
//           </TouchableOpacity>
//         )}
//       </View>
//     </AppCard>
//   );

//   // ==================================================
//   // Bulk request panel
//   // ==================================================

//   const renderBulkRequestPanel = () => {
//     const selectableCount = eligibleCleaners.length;
//     const selectedCount = selectedCleanerIds.length;

//     return (
//       <AppCard
//         variant="elevated"
//         padding="large"
//         radius="large"
//         bordered
//         style={styles.bulkRequestPanel}
//       >
//         <View style={styles.bulkRequestHeader}>
//           <View style={styles.bulkRequestIcon}>
//             <Feather
//               name="users"
//               size={21}
//               color={theme.brand.primary}
//             />
//           </View>

//           <View style={styles.bulkRequestHeaderText}>
//             <AppText
//               variant="title"
//               color={theme.text.primary}
//               weight="semibold"
//             >
//               {tSafe('invite_cleaners', 'Invite Cleaners')}
//             </AppText>

//             <AppText
//               variant="caption"
//               color={theme.text.muted}
//               style={styles.panelDescription}
//             >
//               {tSafe(
//                 'select_cleaners_description',
//                 'Select the cleaners you want to invite to this cleaning.'
//               )}
//             </AppText>
//           </View>
//         </View>

//         <View style={styles.selectAllRow}>
//           <View style={styles.selectAllTextContainer}>
//             <AppText
//               variant="bodyMedium"
//               color={theme.text.primary}
//               weight="medium"
//             >
//               {tSafe(
//                 'select_all_available',
//                 'Select all available'
//               )}
//             </AppText>

//             <AppText
//               variant="caption"
//               color={theme.text.muted}
//             >
//               {`${selectableCount} ${tSafe(
//                 'eligible_cleaners',
//                 'eligible cleaners'
//               )}`}
//             </AppText>
//           </View>

//           <TouchableOpacity
//             activeOpacity={0.8}
//             disabled={
//               sendingRequests || selectableCount === 0
//             }
//             onPress={toggleSelectAllAvailable}
//             accessibilityRole="button"
//             accessibilityLabel={
//               allEligibleSelected
//                 ? tSafe(
//                     'deselect_all_available',
//                     'Deselect all available cleaners'
//                   )
//                 : tSafe(
//                     'select_all_available',
//                     'Select all available cleaners'
//                   )
//             }
//             style={[
//               styles.selectAllButton,
//               (sendingRequests || selectableCount === 0) &&
//                 styles.disabledButton,
//             ]}
//           >
//             <Feather
//               name={
//                 allEligibleSelected
//                   ? 'check-square'
//                   : 'square'
//               }
//               size={19}
//               color={theme.brand.primary}
//             />

//             <AppText
//               variant="label"
//               color={theme.brand.primary}
//               style={styles.selectAllButtonText}
//             >
//               {allEligibleSelected
//                 ? tSafe('deselect_all', 'Deselect all')
//                 : tSafe('select_all', 'Select all')}
//             </AppText>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.selectionSummary}>
//           <View>
//             <AppText
//               variant="display"
//               color={theme.brand.primary}
//               weight="bold"
//             >
//               {selectedCount}
//             </AppText>

//             <AppText
//               variant="caption"
//               color={theme.text.muted}
//             >
//               {tSafe('selected_cleaners', 'Selected cleaners')}
//             </AppText>
//           </View>

//           <View style={styles.availableSummary}>
//             <View style={styles.availableDot} />

//             <AppText
//               variant="caption"
//               color={theme.text.primary}
//               weight="medium"
//             >
//               {`${selectableCount} ${tSafe(
//                 'available',
//                 'available'
//               )}`}
//             </AppText>
//           </View>
//         </View>

//         {selectedCount > 0 && (
//           <TouchableOpacity
//             disabled={sendingRequests}
//             onPress={clearCleanerSelection}
//             style={styles.clearSelectionButton}
//           >
//             <Feather
//               name="x-circle"
//               size={15}
//               color={theme.brand.primary}
//             />

//             <AppText
//               variant="label"
//               color={theme.brand.primary}
//               style={styles.clearSelectionText}
//             >
//               {tSafe('clear_selection', 'Clear selection')}
//             </AppText>
//           </TouchableOpacity>
//         )}

//         <Button
//           mode="contained"
//           icon="send"
//           loading={sendingRequests}
//           disabled={
//             selectedCount === 0 ||
//             sendingRequests ||
//             !selectedScheduleId
//           }
//           onPress={handleSendCleanerRequests}
//           buttonColor={theme.brand.primary}
//           textColor={theme.surface.default}
//           style={styles.bulkRequestButton}
//           contentStyle={styles.bulkRequestButtonContent}
//           labelStyle={styles.bulkRequestButtonLabel}
//         >
//           {sendingRequests
//             ? tSafe('sending_requests', 'Sending requests...')
//             : `${tSafe(
//                 'send_requests_to',
//                 'Send Requests to'
//               )} ${selectedCount} ${
//                 selectedCount === 1
//                   ? tSafe('cleaner', 'Cleaner')
//                   : tSafe('cleaners', 'Cleaners')
//               }`}
//         </Button>

//         <AppText
//           variant="caption"
//           color={theme.text.muted}
//           align="center"
//           style={styles.bulkRequestFootnote}
//         >
//           {tSafe(
//             'bulk_request_footer',
//             'The selected cleaners will be validated before invitations are sent.'
//           )}
//         </AppText>
//       </AppCard>
//     );
//   };

//   // ==================================================
//   // Main render
//   // ==================================================

//   return (
//     <View style={styles.container}>
//       <ExpoStatusBar style={isDark ? 'light' : 'dark'} />

//       <CustomHeader
//         navigation={navigation}
//         currentStep={currentStep}
//         setCurrentStep={setCurrentStep}
//       />

//       <ScrollView
//         style={styles.scrollView}
//         contentContainerStyle={styles.content}
//         keyboardShouldPersistTaps="handled"
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={handleRefresh}
//             tintColor={theme.brand.primary}
//             colors={[theme.brand.primary]}
//           />
//         }
//       >
//         {/* ========================================== */}
//         {/* Step 1: Choose property */}
//         {/* ========================================== */}

//         {currentStep === 1 && (
//           <Animated.View
//             entering={FadeIn}
//             exiting={FadeOut}
//           >
//             <View style={styles.sectionHeader}>
//               <AppText
//                 variant="heading"
//                 color={theme.text.primary}
//               >
//                 {tSafe('choose_property', 'Choose a Property')}
//               </AppText>

//               <AppText
//                 variant="body"
//                 color={theme.text.muted}
//                 style={styles.sectionSubtitle}
//               >
//                 {tSafe(
//                   'choose_property_description',
//                   'Select the property that needs cleaning.'
//                 )}
//               </AppText>
//             </View>

//             {apartments.length === 0 ? (
//               <View style={styles.emptyState}>
//                 <Feather
//                   name="home"
//                   size={38}
//                   color={theme.text.muted}
//                 />

//                 <AppText
//                   variant="title"
//                   color={theme.text.primary}
//                   align="center"
//                   style={styles.emptyTitle}
//                 >
//                   {tSafe('no_properties', 'No Properties Found')}
//                 </AppText>

//                 <AppText
//                   variant="body"
//                   color={theme.text.muted}
//                   align="center"
//                   style={styles.emptyDescription}
//                 >
//                   {tSafe(
//                     'add_property_first',
//                     'Add a property before looking for cleaners.'
//                   )}
//                 </AppText>
//               </View>
//             ) : (
//               <FlatList
//                 data={apartments}
//                 renderItem={renderPropertyItem}
//                 keyExtractor={(item) => String(item._id)}
//                 scrollEnabled={false}
//                 removeClippedSubviews={false}
//               />
//             )}
//           </Animated.View>
//         )}

//         {/* ========================================== */}
//         {/* Step 2: Choose schedule */}
//         {/* ========================================== */}

//         {currentStep === 2 && (
//           <Animated.View
//             entering={SlideInRight}
//             exiting={SlideOutLeft}
//           >
//             <View style={styles.sectionHeader}>
//               <AppText
//                 variant="heading"
//                 color={theme.text.primary}
//               >
//                 {tSafe('choose_schedule', 'Choose a Schedule')}
//               </AppText>

//               <AppText
//                 variant="body"
//                 color={theme.text.muted}
//                 style={styles.sectionSubtitle}
//               >
//                 {tSafe(
//                   'choose_schedule_description',
//                   'Select the upcoming cleaning that needs a cleaner.'
//                 )}
//               </AppText>
//             </View>

//             {schedules.length === 0 ? (
//               <View style={styles.emptyState}>
//                 <View style={styles.emptyIconContainer}>
//                   <Feather
//                     name="calendar"
//                     size={30}
//                     color={theme.brand.primary}
//                   />
//                 </View>

//                 <AppText
//                   variant="title"
//                   color={theme.text.primary}
//                   align="center"
//                   style={styles.emptyTitle}
//                 >
//                   {tSafe(
//                     'no_available_schedules',
//                     'No Available Schedules'
//                   )}
//                 </AppText>

//                 <AppText
//                   variant="body"
//                   color={theme.text.muted}
//                   align="center"
//                   style={styles.emptyDescription}
//                 >
//                   {tSafe(
//                     'no_schedules_for_property',
//                     'There are no upcoming cleaning schedules for this property.'
//                   )}
//                 </AppText>

//                 <TouchableOpacity
//                   activeOpacity={0.85}
//                   style={styles.createScheduleButton}
//                   onPress={() => handleCreateSchedule(true)}
//                 >
//                   <Feather
//                     name="plus"
//                     size={17}
//                     color={theme.surface.default}
//                   />

//                   <AppText
//                     variant="label"
//                     color={theme.surface.default}
//                     style={styles.createScheduleButtonText}
//                   >
//                     {tSafe('create_schedule', 'Create Schedule')}
//                   </AppText>
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               <FlatList
//                 data={schedules}
//                 renderItem={renderScheduleItem}
//                 keyExtractor={(item) => String(item._id)}
//                 scrollEnabled={false}
//                 removeClippedSubviews={false}
//               />
//             )}
//           </Animated.View>
//         )}

//         {/* ========================================== */}
//         {/* Step 3: Recommended cleaners */}
//         {/* ========================================== */}

//         {currentStep === 3 && selectedSchedule && (
//           <Animated.View
//             entering={SlideInRight}
//             exiting={SlideOutLeft}
//           >
//             <View style={styles.sectionHeader}>
//               <AppText
//                 variant="heading"
//                 color={theme.text.primary}
//               >
//                 {tSafe(
//                   'recommended_cleaners',
//                   'Recommended Cleaners'
//                 )}
//               </AppText>

//               <AppText
//                 variant="body"
//                 color={theme.text.muted}
//                 style={styles.sectionSubtitle}
//               >
//                 {tSafe(
//                   'select_multiple_cleaners',
//                   'Choose one or more eligible cleaners to invite.'
//                 )}
//               </AppText>
//             </View>

//             {/* Selected schedule */}

//             <AppCard
//               variant="elevated"
//               padding="medium"
//               radius="large"
//               bordered
//               style={styles.scheduleSummaryCard}
//             >
//               <View style={styles.summaryCalendarIcon}>
//                 <Feather
//                   name="calendar"
//                   size={21}
//                   color={theme.brand.primary}
//                 />
//               </View>

//               <View style={styles.scheduleSummaryDetails}>
//                 <AppText
//                   variant="title"
//                   color={theme.text.primary}
//                   weight="semibold"
//                 >
//                   {selectedProperty?.apt_name ||
//                     selectedSchedule?.schedule?.apartment_name ||
//                     ''}
//                 </AppText>

//                 <AppText
//                   variant="body"
//                   color={theme.text.muted}
//                   style={styles.summaryDate}
//                 >
//                   {moment(
//                     selectedSchedule.schedule.cleaning_date,
//                     'YYYY-MM-DD'
//                   ).format('ddd, MMM DD, YYYY')}
//                 </AppText>

//                 <View style={styles.detailRow}>
//                   <Feather
//                     name="clock"
//                     size={13}
//                     color={theme.text.muted}
//                   />

//                   <AppText
//                     variant="caption"
//                     color={theme.text.muted}
//                     style={styles.detailText}
//                   >
//                     {formatCleaningTime(
//                       selectedSchedule.schedule.cleaning_time
//                     )}
//                   </AppText>
//                 </View>

//                 <AppText
//                   variant="caption"
//                   color={theme.text.muted}
//                   numberOfLines={2}
//                   style={styles.summaryAddress}
//                 >
//                   {selectedSchedule.schedule.address ||
//                     selectedProperty?.address ||
//                     ''}
//                 </AppText>
//               </View>
//             </AppCard>

//             {/* Existing request statuses */}

//             <AppCard
//               variant="default"
//               padding="medium"
//               radius="large"
//               bordered
//               style={styles.statusSummary}
//             >
//               {[
//                 {
//                   label: tSafe('notified', 'Notified'),
//                   count: statusCounts.notified,
//                   color: theme.text.muted,
//                 },
//                 {
//                   label: tSafe('pending', 'Pending'),
//                   count: statusCounts.pending,
//                   color: theme.brand.primary,
//                 },
//                 {
//                   label: tSafe('accepted', 'Accepted'),
//                   count: statusCounts.accepted,
//                   color: theme.brand.primary,
//                 },
//                 {
//                   label: tSafe('declined', 'Declined'),
//                   count: statusCounts.declined,
//                   color: theme.text.muted,
//                 },
//               ].map((item) => (
//                 <View
//                   key={item.label}
//                   style={styles.statusSummaryItem}
//                 >
//                   <View
//                     style={[
//                       styles.statusDot,
//                       { backgroundColor: item.color },
//                     ]}
//                   />

//                   <AppText
//                     variant="caption"
//                     color={theme.text.muted}
//                   >
//                     {item.label}
//                   </AppText>

//                   <AppText
//                     variant="bodyMedium"
//                     color={theme.text.primary}
//                     weight="semibold"
//                   >
//                     {item.count}
//                   </AppText>
//                 </View>
//               ))}
//             </AppCard>

//             {/* Search, status filters, and sorting */}

//             {!loading && cleaners.length > 0 &&
//               renderFilterControls()}

//             {/* Cleaner list heading */}

//             {!loading && filteredCleaners.length > 0 && (
//               <View style={styles.listHeading}>
//                 <View style={styles.listHeadingText}>
//                   <AppText
//                     variant="title"
//                     color={theme.text.primary}
//                     weight="semibold"
//                   >
//                     {tSafe(
//                       'available_cleaners',
//                       'Recommended Cleaners'
//                     )}
//                   </AppText>

//                   <AppText
//                     variant="caption"
//                     color={theme.text.muted}
//                   >
//                     {tSafe(
//                       'tap_checkbox_to_select',
//                       'Select cleaners using the checkbox.'
//                     )}
//                   </AppText>
//                 </View>

//                 <Chip
//                   compact
//                   style={styles.resultCountChip}
//                   textStyle={styles.resultCountText}
//                 >
//                   {filteredCleaners.length}
//                 </Chip>
//               </View>
//             )}

//             {/* Loading state */}

//             {loading ? (
//               <View style={styles.skeletonContainer}>
//                 {[...Array(5)].map((_, index) => (
//                   <CleanerCardSkeleton
//                     key={`cleaner-skeleton-${index}`}
//                   />
//                 ))}
//               </View>
//             ) : (
//               <FlatList
//                 data={filteredCleaners}
//                 renderItem={renderCleanerItem}
//                 keyExtractor={(item, index) =>
//                   getCleanerId(item) || `cleaner-${index}`
//                 }
//                 scrollEnabled={false}
//                 removeClippedSubviews={false}
//                 ListEmptyComponent={
//                   <View style={styles.emptyState}>
//                     <View style={styles.emptyIconContainer}>
//                       <Feather
//                         name="users"
//                         size={30}
//                         color={theme.brand.primary}
//                       />
//                     </View>

//                     <AppText
//                       variant="title"
//                       color={theme.text.primary}
//                       align="center"
//                       style={styles.emptyTitle}
//                     >
//                       {cleaners.length === 0
//                         ? tSafe(
//                             'no_available_cleaners',
//                             'No Recommended Cleaners'
//                           )
//                         : tSafe(
//                             'no_matching_cleaners',
//                             'No Matching Cleaners'
//                           )}
//                     </AppText>

//                     <AppText
//                       variant="body"
//                       color={theme.text.muted}
//                       align="center"
//                       style={styles.emptyDescription}
//                     >
//                       {cleaners.length === 0
//                         ? tSafe(
//                             'try_refreshing_recommendations',
//                             'No cleaners were found. Pull down to refresh and try again.'
//                           )
//                         : tSafe(
//                             'adjust_cleaner_filters',
//                             'Try changing your search or filters.'
//                           )}
//                     </AppText>

//                     {cleaners.length > 0 && (
//                       <TouchableOpacity
//                         style={styles.resetEmptyButton}
//                         onPress={() => {
//                           setSearchQuery('');
//                           setStatusFilter('all');
//                           setSortBy('distance');
//                         }}
//                       >
//                         <AppText
//                           variant="label"
//                           color={theme.brand.primary}
//                         >
//                           {tSafe(
//                             'reset_filters',
//                             'Reset filters'
//                           )}
//                         </AppText>
//                       </TouchableOpacity>
//                     )}
//                   </View>
//                 }
//               />
//             )}

//             {/* Bulk selection and invitation panel */}

//             {!loading && cleaners.length > 0 &&
//               renderBulkRequestPanel()}
//           </Animated.View>
//         )}
//       </ScrollView>

//       {/* Bottom navigation */}

//       {(
//         (currentStep === 1 && selectedProperty) ||
//         (currentStep === 2 && selectedSchedule)
//       ) && (
//         <View style={styles.footer}>
//           <TouchableOpacity
//             activeOpacity={0.85}
//             style={styles.nextButton}
//             onPress={handleStepNavigation}
//           >
//             <AppText
//               variant="bodyMedium"
//               color={theme.surface.default}
//               weight="semibold"
//             >
//               {currentStep === 1
//                 ? tSafe(
//                     'next_choose_schedule',
//                     'Next: Choose Schedule'
//                   )
//                 : tSafe('find_cleaners', 'Find Cleaners')}
//             </AppText>

//             <Feather
//               name="arrow-right"
//               size={19}
//               color={theme.surface.default}
//             />
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* New booking modal */}

//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         onRequestClose={handleCloseCreateBooking}
//         statusBarTranslucent
//       >
//         <NewBooking
//           close_modal={handleCloseCreateBooking}
//           mode="create"
//         />
//       </Modal>
//     </View>
//   );
// };

// // ==================================================
// // Theme-aware styles
// // ==================================================

// const createStyles = (theme, isDark) =>
//   StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: theme.background.default,
//     },

//     scrollView: {
//       flex: 1,
//     },

//     content: {
//       paddingTop: 8,
//       paddingBottom: 28,
//     },

//     // Section headings

//     sectionHeader: {
//       marginHorizontal: 18,
//       marginTop: 14,
//       marginBottom: 16,
//     },

//     sectionSubtitle: {
//       marginTop: 6,
//       lineHeight: 21,
//     },

//     // Property cards

//     propertyCard: {
//       marginHorizontal: 16,
//       marginBottom: 12,
//     },

//     selectedCard: {
//       borderColor: theme.brand.primary,
//     },

//     propertyHeader: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },

//     propertyIcon: {
//       width: 50,
//       height: 50,
//       borderRadius: 15,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: theme.surface.elevated,
//       marginRight: 13,
//     },

//     propertyDetails: {
//       flex: 1,
//       paddingRight: 8,
//     },

//     propertyAddress: {
//       marginTop: 5,
//     },

//     selectionIndicator: {
//       width: 24,
//       height: 24,
//       borderRadius: 12,
//       borderWidth: 1.5,
//       borderColor: theme.divider,
//       alignItems: 'center',
//       justifyContent: 'center',
//     },

//     selectionIndicatorActive: {
//       borderColor: theme.brand.primary,
//       backgroundColor: theme.brand.primary,
//     },

//     roomTypeContainer: {
//       flexDirection: 'row',
//       flexWrap: 'wrap',
//       alignItems: 'center',
//       marginTop: 14,
//       gap: 6,
//     },

//     roomChip: {
//       backgroundColor: theme.surface.elevated,
//     },

//     roomChipText: {
//       color: theme.text.muted,
//     },

//     // Schedule cards

//     scheduleCard: {
//       marginHorizontal: 16,
//       marginBottom: 12,
//     },

//     scheduleRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },

//     dateBadge: {
//       width: 62,
//       height: 68,
//       borderRadius: 14,
//       backgroundColor: theme.brand.primary,
//       alignItems: 'center',
//       justifyContent: 'center',
//       marginRight: 14,
//     },

//     scheduleDetails: {
//       flex: 1,
//     },

//     detailRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginTop: 7,
//     },

//     detailText: {
//       flex: 1,
//       marginLeft: 7,
//     },

//     // Schedule summary

//     scheduleSummaryCard: {
//       flexDirection: 'row',
//       marginHorizontal: 16,
//       marginBottom: 16,
//     },

//     summaryCalendarIcon: {
//       width: 44,
//       height: 44,
//       borderRadius: 13,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: theme.surface.elevated,
//       marginRight: 12,
//     },

//     scheduleSummaryDetails: {
//       flex: 1,
//     },

//     summaryDate: {
//       marginTop: 5,
//     },

//     summaryAddress: {
//       marginTop: 7,
//     },

//     // Status summary

//     statusSummary: {
//       marginHorizontal: 16,
//       marginBottom: 18,
//       flexDirection: 'row',
//       flexWrap: 'wrap',
//     },

//     statusSummaryItem: {
//       width: '50%',
//       flexDirection: 'row',
//       alignItems: 'center',
//       paddingVertical: 9,
//       paddingHorizontal: 4,
//       gap: 6,
//     },

//     statusDot: {
//       width: 7,
//       height: 7,
//       borderRadius: 4,
//     },

//     // Search and filters

//     filterCard: {
//       marginHorizontal: 16,
//       marginBottom: 18,
//     },

//     searchContainer: {
//       minHeight: 48,
//       marginTop: 13,
//       paddingHorizontal: 12,
//       flexDirection: 'row',
//       alignItems: 'center',
//       borderWidth: 1,
//       borderColor: theme.divider,
//       borderRadius: 12,
//       backgroundColor: theme.surface.elevated,
//     },

//     searchInput: {
//       flex: 1,
//       minHeight: 46,
//       paddingVertical: 8,
//       paddingHorizontal: 10,
//       fontSize: 14,
//     },

//     filterLabel: {
//       marginTop: 17,
//       marginBottom: 8,
//     },

//     filterChips: {
//       alignItems: 'center',
//       paddingRight: 4,
//       gap: 8,
//     },

//     filterChip: {
//       backgroundColor: theme.surface.elevated,
//       borderColor: theme.divider,
//       borderWidth: 1,
//     },

//     activeFilterChip: {
//       backgroundColor: theme.brand.primary,
//       borderColor: theme.brand.primary,
//     },

//     filterChipText: {
//       color: theme.text.primary,
//       fontSize: 12,
//     },

//     activeFilterChipText: {
//       color: theme.surface.default,
//     },

//     sortOptions: {
//       flexDirection: 'row',
//       flexWrap: 'wrap',
//       gap: 8,
//     },

//     sortOption: {
//       minHeight: 36,
//       paddingHorizontal: 10,
//       paddingVertical: 8,
//       borderRadius: 10,
//       borderWidth: 1,
//       borderColor: theme.divider,
//       backgroundColor: theme.surface.elevated,
//       flexDirection: 'row',
//       alignItems: 'center',
//     },

//     activeSortOption: {
//       backgroundColor: theme.brand.primary,
//       borderColor: theme.brand.primary,
//     },

//     sortOptionText: {
//       marginLeft: 6,
//     },

//     filterResultsRow: {
//       marginTop: 15,
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//     },

//     // Cleaner list

//     listHeading: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       marginHorizontal: 18,
//       marginBottom: 12,
//     },

//     listHeadingText: {
//       flex: 1,
//       paddingRight: 8,
//     },

//     resultCountChip: {
//       backgroundColor: theme.surface.elevated,
//     },

//     resultCountText: {
//       color: theme.brand.primary,
//     },

//     cleanerCard: {
//       marginHorizontal: 12,
//       marginBottom: 13,
//       overflow: 'hidden',
//     },

//     selectedCleanerCard: {
//       borderColor: theme.brand.primary,
//     },

//     cleanerContent: {
//       paddingHorizontal: 0,
//     },

//     cleanerSelectionRow: {
//       minHeight: 60,
//       flexDirection: 'row',
//       alignItems: 'center',
//       paddingLeft: 16,
//       paddingRight: 6,
//       borderTopWidth: StyleSheet.hairlineWidth,
//       borderTopColor: theme.divider,
//       backgroundColor: theme.surface.elevated,
//     },

//     cleanerSelectionDetails: {
//       flex: 1,
//       paddingVertical: 10,
//     },

//     checkboxContainer: {
//       justifyContent: 'center',
//     },

//     disabledCheckbox: {
//       opacity: 0.55,
//     },

//     distanceRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginTop: 5,
//     },

//     distanceText: {
//       marginLeft: 5,
//     },

//     // Bulk selection

//     selectAllRow: {
//       marginTop: 18,
//       paddingVertical: 12,
//       paddingHorizontal: 12,
//       borderWidth: 1,
//       borderColor: theme.divider,
//       borderRadius: 12,
//       backgroundColor: theme.surface.elevated,
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//     },

//     selectAllTextContainer: {
//       flex: 1,
//       paddingRight: 8,
//     },

//     selectAllButton: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       paddingVertical: 8,
//       paddingHorizontal: 9,
//       borderRadius: 9,
//     },

//     selectAllButtonText: {
//       marginLeft: 6,
//     },

//     disabledButton: {
//       opacity: 0.45,
//     },

//     // Bulk request panel

//     bulkRequestPanel: {
//       marginHorizontal: 16,
//       marginTop: 10,
//       marginBottom: 24,
//     },

//     bulkRequestHeader: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },

//     bulkRequestIcon: {
//       width: 45,
//       height: 45,
//       borderRadius: 14,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: theme.surface.elevated,
//       marginRight: 12,
//     },

//     bulkRequestHeaderText: {
//       flex: 1,
//     },

//     panelDescription: {
//       marginTop: 4,
//       lineHeight: 18,
//     },

//     selectionSummary: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       marginTop: 16,
//       paddingVertical: 14,
//       paddingHorizontal: 15,
//       borderRadius: 14,
//       backgroundColor: theme.surface.elevated,
//     },

//     availableSummary: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       paddingHorizontal: 10,
//       paddingVertical: 8,
//       borderRadius: 20,
//       backgroundColor: theme.surface.default,
//     },

//     availableDot: {
//       width: 7,
//       height: 7,
//       borderRadius: 4,
//       backgroundColor: theme.brand.primary,
//       marginRight: 6,
//     },

//     clearSelectionButton: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       alignSelf: 'flex-start',
//       marginTop: 12,
//       paddingVertical: 5,
//     },

//     clearSelectionText: {
//       marginLeft: 6,
//     },

//     bulkRequestButton: {
//       marginTop: 15,
//       borderRadius: 12,
//     },

//     bulkRequestButtonContent: {
//       minHeight: 50,
//       paddingHorizontal: 8,
//     },

//     bulkRequestButtonLabel: {
//       fontSize: 13,
//       fontWeight: '700',
//     },

//     bulkRequestFootnote: {
//       marginTop: 11,
//       lineHeight: 17,
//     },

//     // Empty states

//     emptyState: {
//       alignItems: 'center',
//       justifyContent: 'center',
//       paddingHorizontal: 28,
//       paddingVertical: 38,
//       marginHorizontal: 16,
//       backgroundColor: theme.surface.default,
//       borderRadius: 18,
//       borderWidth: 1,
//       borderColor: theme.divider,
//     },

//     emptyIconContainer: {
//       width: 60,
//       height: 60,
//       borderRadius: 18,
//       backgroundColor: theme.surface.elevated,
//       alignItems: 'center',
//       justifyContent: 'center',
//       marginBottom: 12,
//     },

//     emptyTitle: {
//       marginTop: 12,
//     },

//     emptyDescription: {
//       marginTop: 8,
//       lineHeight: 20,
//     },

//     resetEmptyButton: {
//       marginTop: 16,
//       padding: 8,
//     },

//     createScheduleButton: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//       paddingVertical: 13,
//       paddingHorizontal: 20,
//       backgroundColor: theme.brand.primary,
//       borderRadius: 12,
//       marginTop: 20,
//     },

//     createScheduleButtonText: {
//       marginLeft: 8,
//     },

//     skeletonContainer: {
//       marginTop: 8,
//     },

//     // Footer

//     footer: {
//       backgroundColor: theme.surface.default,
//       paddingHorizontal: 16,
//       paddingTop: 10,
//       paddingBottom: 12,
//       borderTopWidth: StyleSheet.hairlineWidth,
//       borderTopColor: theme.divider,
//     },

//     nextButton: {
//       minHeight: 52,
//       backgroundColor: theme.brand.primary,
//       borderRadius: 14,
//       paddingHorizontal: 18,
//       flexDirection: 'row',
//       justifyContent: 'center',
//       alignItems: 'center',
//       gap: 10,
//     },
//   });

// export default FindCleaners;













// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   useContext,
//   useRef,
//   useMemo,
// } from 'react';

// import {
//   View,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   FlatList,
//   Modal,
//   Alert,
//   RefreshControl,
//   StatusBar,
// } from 'react-native';

// import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

// import { useFocusEffect } from '@react-navigation/native';

// import Animated, {
//   FadeIn,
//   FadeOut,
//   SlideInRight,
//   SlideOutLeft,
// } from 'react-native-reanimated';

// import {
//   Feather,
//   MaterialIcons,
//   AntDesign,
// } from '@expo/vector-icons';

// import moment from 'moment';

// import {
//   Button,
//   Checkbox,
//   Chip,
// } from 'react-native-paper';
// import userService from '../../services/connection/userService';
// import { AuthContext } from '../../context/AuthContext';
// import { useBookingContext } from '../../context/BookingContext';
// import { useTheme } from '../../theme';
// import  AppText  from '../../ui/AppText';
// import AppCard from '../../ui/AppCard';
// import { tSafe } from '../../utils/tSafe';
// import ROUTES from '../../constants/routes';
// import CustomHeader from '../../components/shared/CustomHeader';
// import NewBooking from './NewBooking';
// import CleanerCard from '../../components/cleaner/CleanerCard';
// import CleanerCardSkeleton from '../../components/cleaner/CleanerCardSkeleton';
// import CustomCheckbox from '../../components/shared/CustomCheckbox';

// const FindCleaners = ({ navigation }) => {
//   const { currentUserId, currentUser } = useContext(AuthContext);

//   const {
//     modalVisible,
//     handleCreateSchedule,
//   } = useBookingContext();

//   const { theme, isDark } = useTheme();

//   const styles = useMemo(
//     () => createStyles(theme, isDark),
//     [theme, isDark]
//   );

//   // --------------------------------------------------
//   // Navigation state
//   // --------------------------------------------------

//   const [currentStep, setCurrentStep] = useState(1);
//   const [selectedProperty, setSelectedProperty] = useState(null);
//   const [selectedSchedule, setSelectedSchedule] = useState(null);

//   // --------------------------------------------------
//   // Data state
//   // --------------------------------------------------

//   const [apartments, setApartments] = useState([]);

//   const [schedules, setSchedules] = useState([]);

//   const [cleaners, setCleaners] = useState([]);

//   const [loading, setLoading] = useState(false);

//   const [refreshing, setRefreshing] = useState(false);

//   // --------------------------------------------------
//   // Cleaner status state
//   // --------------------------------------------------

//   const [cleanerStatuses, setCleanerStatuses] = useState({});

//   const [statusCounts, setStatusCounts] = useState({
//     notified: 0,
//     pending: 0,
//     accepted: 0,
//     declined: 0,
//   });

//   // --------------------------------------------------
//   // Multi-cleaner selection
//   // --------------------------------------------------

//   const [selectedCleanerIds, setSelectedCleanerIds] = useState([]);

//   const [sendingRequests, setSendingRequests] = useState(false);

//   const statusRefreshInProgress = useRef(false);

//   const selectedScheduleId = selectedSchedule?._id
//     ? String(selectedSchedule._id)
//     : null;


    

//   // ==================================================
//   // Helpers
//   // ==================================================

//   const getCleanerId = useCallback((cleaner) => {
//     const id = cleaner?.cleanerId ?? cleaner?._id;

//     return id == null ? '' : String(id);
//   }, []);


//   const getCleanerStatus = useCallback(
//     (cleaner) => {
//       const cleanerId = getCleanerId(cleaner);

//       return String(
//         cleanerStatuses[cleanerId] ??
//         cleaner?.status ??
//         'not_notified'
//       ).toLowerCase();
//     },
//     [cleanerStatuses, getCleanerId]
//   );


//   const getCleanerDistance = useCallback((cleaner) => {
//     return (
//       cleaner?.distance_miles ??
//       cleaner?.distanceFromApartment ??
//       null
//     );
//   }, []);


//   const formatDistance = useCallback(
//     (cleaner) => {
//       const distance = getCleanerDistance(cleaner);

//       if (
//         distance === null ||
//         distance === undefined ||
//         Number.isNaN(Number(distance))
//       ) {
//         return null;
//       }

//       return `${Number(distance).toFixed(1)} ${tSafe(
//         'miles_away',
//         'miles away'
//       )}`;
//     },
//     [getCleanerDistance]
//   );


//   const isCleanerSelectable = useCallback(
//     (cleaner) => {
//       const cleanerId = getCleanerId(cleaner);

//       if (!cleanerId) {
//         return false;
//       }

//       const status = getCleanerStatus(cleaner);

//       const blockedStatuses = [
//         'notified',
//         'pending',
//         'accepted',
//         'assigned',
//         'in_progress',
//         'pending_review',
//         'completed',
//         'reviewed',
//         'cancelled',
//       ];

//       return !blockedStatuses.includes(status);
//     },
//     [getCleanerId, getCleanerStatus]
//   );


//   const updateCleanerStatuses = useCallback((scheduleData) => {
//     const notifiedCleaners = Array.isArray(
//       scheduleData?.notified_cleaners
//     )
//       ? scheduleData.notified_cleaners
//       : [];

//     const statusMap = {};

//     const counts = {
//       notified: 0,
//       pending: 0,
//       accepted: 0,
//       declined: 0,
//     };

//     notifiedCleaners.forEach((entry) => {
//       if (
//         entry?.cleanerId === null ||
//         entry?.cleanerId === undefined
//       ) {
//         return;
//       }

//       const cleanerId = String(entry.cleanerId);

//       const status = String(
//         entry.status || 'notified'
//       ).toLowerCase();

//       statusMap[cleanerId] = status;

//       if (Object.prototype.hasOwnProperty.call(counts, status)) {
//         counts[status] += 1;
//       }
//     });

//     setCleanerStatuses(statusMap);

//     setStatusCounts(counts);
//   }, []);


//   const refreshSelectedScheduleStatus = useCallback(
//     async (scheduleId) => {
//       if (
//         !scheduleId ||
//         statusRefreshInProgress.current
//       ) {
//         return;
//       }

//       statusRefreshInProgress.current = true;

//       try {
//         const response = await userService.getScheduleById(
//           scheduleId
//         );

//         updateCleanerStatuses(response?.data);
//       } catch (error) {
//         console.warn(
//           'Unable to refresh cleaner statuses:',
//           error?.message
//         );
//       } finally {
//         statusRefreshInProgress.current = false;
//       }
//     },
//     [updateCleanerStatuses]
//   );


//   const getUpcomingPropertySchedules = useCallback(
//     (scheduleData, property) => {
//       if (!Array.isArray(scheduleData) || !property) {
//         return [];
//       }

//       return scheduleData.filter((item) => {
//         const schedule = item?.schedule;

//         if (!schedule) {
//           return false;
//         }

//         if (
//           schedule.apartment_name !== property.apt_name
//         ) {
//           return false;
//         }

//         const cleaningDate = schedule.cleaning_date;

//         const cleaningTime = schedule.cleaning_time;

//         if (!cleaningDate || !cleaningTime) {
//           return false;
//         }

//         const cleaningDateTime = moment(
//           `${cleaningDate} ${cleaningTime}`,
//           [
//             'YYYY-MM-DD HH:mm:ss',
//             'YYYY-MM-DD H:mm:ss',
//             'YYYY-MM-DD HH:mm',
//             'YYYY-MM-DD H:mm',
//           ],
//           true
//         );

//         return (
//           cleaningDateTime.isValid() &&
//           cleaningDateTime.isSameOrAfter(moment())
//         );
//       });
//     },
//     []
//   );


//   const formatCleaningTime = useCallback((value) => {
//     if (!value) {
//       return '';
//     }

//     const parsed = moment(
//       value,
//       ['HH:mm:ss', 'H:mm:ss', 'HH:mm', 'H:mm'],
//       true
//     );

//     return parsed.isValid()
//       ? parsed.format('h:mm A')
//       : value;
//   }, []);


//   // ==================================================
//   // Initial property fetch
//   // ==================================================

//   useEffect(() => {
//     let active = true;

//     const fetchProperties = async () => {
//       if (!currentUserId) {
//         return;
//       }

//       try {
//         const response = await userService.getApartment(
//           currentUserId
//         );

//         if (!active) {
//           return;
//         }

//         const propertyData = Array.isArray(response?.data)
//           ? response.data
//           : [];

//         if (propertyData.length === 0) {
//           setApartments([]);

//           Alert.alert(
//             tSafe('property_required', 'Property Required'),
//             tSafe(
//               'property_required_description',
//               'Add at least one property before finding cleaners.'
//             ),
//             [
//               {
//                 text: tSafe('ok', 'OK'),
//                 onPress: () => {
//                   navigation.replace(ROUTES.host_dashboard);
//                 },
//               },
//             ],
//             { cancelable: false }
//           );

//           return;
//         }

//         setApartments(propertyData);
//       } catch (error) {
//         if (!active) {
//           return;
//         }

//         console.error(
//           'Error fetching properties:',
//           error
//         );

//         Alert.alert(
//           tSafe('error', 'Error'),
//           tSafe(
//             'failed_load_properties',
//             'Failed to load your properties. Please try again.'
//           )
//         );
//       }
//     };

//     fetchProperties();

//     return () => {
//       active = false;
//     };
//   }, [currentUserId, navigation]);


//   // ==================================================
//   // Fetch schedules when property changes
//   // ==================================================

//   useEffect(() => {
//     let active = true;

//     const fetchPropertySchedules = async () => {
//       if (!selectedProperty || !currentUserId) {
//         setSchedules([]);
//         return;
//       }

//       setSelectedSchedule(null);
//       setCleaners([]);
//       setCleanerStatuses({});
//       setSelectedCleanerIds([]);

//       setStatusCounts({
//         notified: 0,
//         pending: 0,
//         accepted: 0,
//         declined: 0,
//       });

//       try {
//         const response =
//           await userService.getUpcomingSchedulesByHostId(
//             currentUserId
//           );

//         if (!active) {
//           return;
//         }

//         const scheduleData = Array.isArray(response?.data)
//           ? response.data
//           : [];

//         setSchedules(
//           getUpcomingPropertySchedules(
//             scheduleData,
//             selectedProperty
//           )
//         );
//       } catch (error) {
//         if (!active) {
//           return;
//         }

//         console.error(
//           'Error fetching property schedules:',
//           error
//         );

//         setSchedules([]);
//       }
//     };

//     fetchPropertySchedules();

//     return () => {
//       active = false;
//     };
//   }, [
//     selectedProperty,
//     currentUserId,
//     getUpcomingPropertySchedules,
//   ]);


//   // ==================================================
//   // Fetch recommendations when schedule changes
//   // ==================================================

//   useEffect(() => {
//     let active = true;

//     const fetchCleanersForSchedule = async () => {
//       if (!selectedScheduleId) {
//         setCleaners([]);
//         setCleanerStatuses({});
//         setSelectedCleanerIds([]);
//         setLoading(false);

//         setStatusCounts({
//           notified: 0,
//           pending: 0,
//           accepted: 0,
//           declined: 0,
//         });

//         return;
//       }

//       setLoading(true);
//       setCleaners([]);
//       setCleanerStatuses({});
//       setSelectedCleanerIds([]);

//       try {
//         // The recommendation endpoint remains read-only.
//         const cleanersResponse = await userService.findCleaners(
//           selectedScheduleId
//         );

//         if (!active) {
//           return;
//         }

//         const recommendationData = Array.isArray(
//           cleanersResponse?.data
//         )
//           ? cleanersResponse.data
//           : Array.isArray(cleanersResponse?.data?.cleaners)
//             ? cleanersResponse.data.cleaners
//             : [];

//         setCleaners(recommendationData);

//         // Load existing request statuses from the schedule.
//         const scheduleResponse =
//           await userService.getScheduleById(
//             selectedScheduleId
//           );

//         if (!active) {
//           return;
//         }

//         updateCleanerStatuses(scheduleResponse?.data);
//       } catch (error) {
//         if (!active) {
//           return;
//         }

//         console.error(
//           'Error fetching cleaner recommendations:',
//           error
//         );

//         setCleaners([]);

//         Alert.alert(
//           tSafe('error', 'Error'),
//           tSafe(
//             'failed_load_cleaners',
//             'Unable to load recommended cleaners. Please try again.'
//           )
//         );
//       } finally {
//         if (active) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchCleanersForSchedule();

//     return () => {
//       active = false;
//     };
//   }, [
//     selectedScheduleId,
//     updateCleanerStatuses,
//   ]);


//   // ==================================================
//   // Poll statuses every 10 seconds
//   // ==================================================

//   useEffect(() => {
//     if (!selectedScheduleId || loading) {
//       return undefined;
//     }

//     const interval = setInterval(() => {
//       refreshSelectedScheduleStatus(
//         selectedScheduleId
//       );
//     }, 10000);

//     return () => clearInterval(interval);
//   }, [
//     selectedScheduleId,
//     loading,
//     refreshSelectedScheduleStatus,
//   ]);


//   // ==================================================
//   // Refresh when screen regains focus
//   // ==================================================

//   useFocusEffect(
//     useCallback(() => {
//       let active = true;

//       const refreshData = async () => {
//         if (!currentUserId) {
//           return;
//         }

//         try {
//           const response = await userService.getApartment(
//             currentUserId
//           );

//           if (!active) {
//             return;
//           }

//           const newApartments = Array.isArray(response?.data)
//             ? response.data
//             : [];

//           setApartments(newApartments);

//           if (newApartments.length === 0) {
//             setSelectedProperty(null);
//             setSelectedSchedule(null);
//             setSelectedCleanerIds([]);
//             setCleaners([]);
//             setSchedules([]);
//             setCurrentStep(1);

//             return;
//           }

//           if (!selectedProperty) {
//             return;
//           }

//           const propertyExists = newApartments.some(
//             (property) =>
//               String(property._id) ===
//               String(selectedProperty._id)
//           );

//           if (!propertyExists) {
//             setSelectedProperty(null);
//             setSelectedSchedule(null);
//             setSelectedCleanerIds([]);
//             setCleaners([]);
//             setSchedules([]);
//             setCurrentStep(1);

//             return;
//           }

//           const schedulesResponse =
//             await userService.getUpcomingSchedulesByHostId(
//               currentUserId
//             );

//           if (!active) {
//             return;
//           }

//           const scheduleData = Array.isArray(
//             schedulesResponse?.data
//           )
//             ? schedulesResponse.data
//             : [];

//           const upcomingSchedules =
//             getUpcomingPropertySchedules(
//               scheduleData,
//               selectedProperty
//             );

//           setSchedules(upcomingSchedules);

//           if (selectedSchedule) {
//             const scheduleExists = upcomingSchedules.some(
//               (schedule) =>
//                 String(schedule._id) ===
//                 String(selectedSchedule._id)
//             );

//             if (!scheduleExists) {
//               setSelectedSchedule(null);
//               setSelectedCleanerIds([]);
//               setCleaners([]);
//               setCurrentStep(2);

//               return;
//             }

//             await refreshSelectedScheduleStatus(
//               String(selectedSchedule._id)
//             );
//           }
//         } catch (error) {
//           if (active) {
//             console.error(
//               'Error refreshing FindCleaners:',
//               error
//             );
//           }
//         }
//       };

//       refreshData();

//       return () => {
//         active = false;
//       };
//     }, [
//       currentUserId,
//       selectedProperty,
//       selectedSchedule,
//       getUpcomingPropertySchedules,
//       refreshSelectedScheduleStatus,
//     ])
//   );


//   // ==================================================
//   // Selection handlers
//   // ==================================================

//   // const toggleCleanerSelection = useCallback(
//   //   (cleaner) => {
//   //     if (sendingRequests) {
//   //       return;
//   //     }

//   //     const cleanerId = getCleanerId(cleaner);

//   //     if (!cleanerId) {
//   //       return;
//   //     }

//   //     if (!isCleanerSelectable(cleaner)) {
//   //       Alert.alert(
//   //         tSafe('cleaner_unavailable', 'Cleaner Unavailable'),
//   //         tSafe(
//   //           'cleaner_already_contacted',
//   //           'This cleaner is not currently eligible for a new invitation.'
//   //         )
//   //       );

//   //       return;
//   //     }

//   //     setSelectedCleanerIds((previous) => {
//   //       if (previous.includes(cleanerId)) {
//   //         return previous.filter(
//   //           (id) => id !== cleanerId
//   //         );
//   //       }

//   //       return [...previous, cleanerId];
//   //     });
//   //   },
//   //   [
//   //     sendingRequests,
//   //     getCleanerId,
//   //     isCleanerSelectable,
//   //   ]
//   // );

//   const toggleCleanerSelection = (cleanerId) => {
//     if (!cleanerId) return;
  
//     setSelectedCleanerIds((previous) => {
//       if (previous.includes(cleanerId)) {
//         return previous.filter((id) => id !== cleanerId);
//       }
  
//       return [...previous, cleanerId];
//     });
//   };


//   const handleSelectProperty = useCallback(
//     (property) => {
//       if (
//         String(selectedProperty?._id) ===
//         String(property?._id)
//       ) {
//         return;
//       }

//       setSelectedProperty(property);
//       setSelectedSchedule(null);
//       setSelectedCleanerIds([]);
//       setCleaners([]);
//       setCleanerStatuses({});
//       setSchedules([]);
//       setCurrentStep(1);
//     },
//     [selectedProperty]
//   );


//   const handleSelectSchedule = useCallback(
//     (schedule) => {
//       if (
//         String(selectedSchedule?._id) ===
//         String(schedule?._id)
//       ) {
//         return;
//       }

//       setSelectedSchedule(schedule);
//       setSelectedCleanerIds([]);
//       setCleaners([]);
//       setCleanerStatuses({});
//       setCurrentStep(2);
//     },
//     [selectedSchedule]
//   );


//   const clearCleanerSelection = useCallback(() => {
//     if (!sendingRequests) {
//       setSelectedCleanerIds([]);
//     }
//   }, [sendingRequests]);


//   // ==================================================
//   // Bulk request submission
//   // ==================================================

//   /**
//    * Frontend selection is implemented.
//    *
//    * This handler intentionally does not call the replacement
//    * endpoint or guess the name of the new API method.
//    *
//    * We will connect it to the dedicated initial-cleaner request
//    * endpoint once that endpoint exists.
//    */

//   const handleSendCleanerRequests = useCallback(async () => {
//     if (sendingRequests) {
//       return;
//     }

//     if (!selectedScheduleId) {
//       Alert.alert(
//         tSafe('schedule_required', 'Schedule Required'),
//         tSafe(
//           'select_schedule_first',
//           'Please select a cleaning schedule first.'
//         )
//       );

//       return;
//     }

//     if (selectedCleanerIds.length === 0) {
//       Alert.alert(
//         tSafe('select_cleaners', 'Select Cleaners'),
//         tSafe(
//           'select_at_least_one_cleaner',
//           'Please select at least one cleaner.'
//         )
//       );

//       return;
//     }

//     const selectedCleaners = cleaners.filter(
//       (cleaner) =>
//         selectedCleanerIds.includes(
//           getCleanerId(cleaner)
//         )
//     );

//     const validCleaners = selectedCleaners.filter(
//       isCleanerSelectable
//     );

//     if (
//       validCleaners.length !== selectedCleanerIds.length
//     ) {
//       setSelectedCleanerIds(
//         validCleaners.map(getCleanerId)
//       );

//       Alert.alert(
//         tSafe('review_selection', 'Review Selection'),
//         tSafe(
//           'selection_changed_message',
//           'One or more selected cleaners are no longer eligible. Review your selection before continuing.'
//         )
//       );

//       return;
//     }

//     Alert.alert(
//       tSafe('bulk_requests', 'Bulk Cleaner Requests'),
//       tSafe(
//         'bulk_endpoint_not_connected',
//         'Your selection is ready. The dedicated bulk request endpoint must be connected before invitations can be sent.'
//       ),
//       [
//         {
//           text: tSafe('ok', 'OK'),
//         },
//       ]
//     );
//   }, [
//     sendingRequests,
//     selectedScheduleId,
//     selectedCleanerIds,
//     cleaners,
//     getCleanerId,
//     isCleanerSelectable,
//   ]);


//   // ==================================================
//   // Navigation
//   // ==================================================

//   const handleStepNavigation = useCallback(() => {
//     if (currentStep === 1 && selectedProperty) {
//       setCurrentStep(2);
//       return;
//     }

//     if (currentStep === 2 && selectedSchedule) {
//       setCurrentStep(3);
//     }
//   }, [
//     currentStep,
//     selectedProperty,
//     selectedSchedule,
//   ]);


//   const handleCloseCreateBooking = useCallback(() => {
//     handleCreateSchedule(false);
//   }, [handleCreateSchedule]);


//   // ==================================================
//   // Pull-to-refresh
//   // ==================================================

//   const handleRefresh = useCallback(async () => {
//     if (refreshing || !currentUserId) {
//       return;
//     }

//     setRefreshing(true);

//     try {
//       const response = await userService.getApartment(
//         currentUserId
//       );

//       const newApartments = Array.isArray(response?.data)
//         ? response.data
//         : [];

//       setApartments(newApartments);

//       if (newApartments.length === 0) {
//         setSelectedProperty(null);
//         setSelectedSchedule(null);
//         setSelectedCleanerIds([]);
//         setSchedules([]);
//         setCleaners([]);
//         setCurrentStep(1);

//         Alert.alert(
//           tSafe('property_required', 'Property Required'),
//           tSafe(
//             'property_required_description',
//             'Add a property before finding cleaners.'
//           ),
//           [
//             {
//               text: tSafe('ok', 'OK'),
//               onPress: () =>
//                 navigation.replace(ROUTES.host_dashboard),
//             },
//           ]
//         );

//         return;
//       }

//       if (!selectedProperty) {
//         return;
//       }

//       const scheduleResponse =
//         await userService.getUpcomingSchedulesByHostId(
//           currentUserId
//         );

//       const scheduleData = Array.isArray(
//         scheduleResponse?.data
//       )
//         ? scheduleResponse.data
//         : [];

//       const upcomingSchedules =
//         getUpcomingPropertySchedules(
//           scheduleData,
//           selectedProperty
//         );

//       setSchedules(upcomingSchedules);

//       if (selectedScheduleId) {
//         const scheduleExists = upcomingSchedules.some(
//           (schedule) =>
//             String(schedule._id) === selectedScheduleId
//         );

//         if (!scheduleExists) {
//           setSelectedSchedule(null);
//           setSelectedCleanerIds([]);
//           setCleaners([]);
//           setCurrentStep(2);

//           return;
//         }

//         await refreshSelectedScheduleStatus(
//           selectedScheduleId
//         );
//       }
//     } catch (error) {
//       console.error(
//         'FindCleaners refresh error:',
//         error
//       );

//       Alert.alert(
//         tSafe('error', 'Error'),
//         tSafe(
//           'refresh_failed',
//           'Unable to refresh the screen. Please try again.'
//         )
//       );
//     } finally {
//       setRefreshing(false);
//     }
//   }, [
//     refreshing,
//     currentUserId,
//     selectedProperty,
//     selectedScheduleId,
//     navigation,
//     getUpcomingPropertySchedules,
//     refreshSelectedScheduleStatus,
//   ]);


//   // ==================================================
//   // Property card
//   // ==================================================

//   const renderPropertyItem = ({ item }) => {
//     const selected =
//       String(selectedProperty?._id) ===
//       String(item._id);

//     const roomDetails = Array.isArray(item.roomDetails)
//       ? item.roomDetails
//       : [];

//     return (
//       <AppCard
//         variant={selected ? 'elevated' : 'default'}
//         padding="medium"
//         radius="large"
//         bordered
//         style={[
//           styles.propertyCard,
//           selected && styles.selectedCard,
//         ]}
//       >
//         <TouchableOpacity
//           activeOpacity={0.8}
//           accessibilityRole="button"
//           accessibilityState={{ selected }}
//           onPress={() => handleSelectProperty(item)}
//         >
//           <View style={styles.propertyHeader}>
//             <View style={styles.propertyIcon}>
//               <AntDesign
//                 name="home"
//                 size={25}
//                 color={theme.brand.primary}
//               />
//             </View>

//             <View style={styles.propertyDetails}>
//               <AppText
//                 variant="title"
//                 color={theme.text.primary}
//                 weight="semibold"
//                 numberOfLines={2}
//               >
//                 {item.apt_name ||
//                   tSafe('unnamed_property', 'Unnamed Property')}
//               </AppText>

//               <AppText
//                 variant="caption"
//                 color={theme.text.muted}
//                 numberOfLines={2}
//                 style={styles.propertyAddress}
//               >
//                 {item.address ||
//                   tSafe(
//                     'address_unavailable',
//                     'Address unavailable'
//                   )}
//               </AppText>
//             </View>

//             <View
//               style={[
//                 styles.selectionIndicator,
//                 selected && styles.selectionIndicatorActive,
//               ]}
//             >
//               {selected && (
//                 <Feather
//                   name="check"
//                   size={15}
//                   color={theme.surface.default}
//                 />
//               )}
//             </View>
//           </View>

//           <View style={styles.roomTypeContainer}>
//             {roomDetails.slice(0, 3).map((room, index) => (
//               <Chip
//                 key={`${item._id}-room-${index}`}
//                 compact
//                 style={styles.roomChip}
//                 textStyle={styles.roomChipText}
//               >
//                 {`${room?.number || 0} ${room?.type || ''}`}
//               </Chip>
//             ))}
//           </View>
//         </TouchableOpacity>
//       </AppCard>
//     );
//   };


//   // ==================================================
//   // Schedule card
//   // ==================================================

//   const renderScheduleItem = ({ item }) => {
//     const schedule = item?.schedule || {};

//     const date = moment(
//       schedule.cleaning_date,
//       'YYYY-MM-DD',
//       true
//     );

//     const selected =
//       String(selectedSchedule?._id) ===
//       String(item._id);

//     return (
//       <AppCard
//         variant={selected ? 'elevated' : 'default'}
//         padding="medium"
//         radius="large"
//         bordered
//         style={[
//           styles.scheduleCard,
//           selected && styles.selectedCard,
//         ]}
//       >
//         <TouchableOpacity
//           activeOpacity={0.8}
//           accessibilityRole="button"
//           accessibilityState={{ selected }}
//           onPress={() => handleSelectSchedule(item)}
//         >
//           <View style={styles.scheduleRow}>
//             <View style={styles.dateBadge}>
//               <AppText
//                 variant="heading"
//                 color={theme.surface.default}
//                 weight="bold"
//               >
//                 {date.isValid() ? date.format('D') : '--'}
//               </AppText>

//               <AppText
//                 variant="caption"
//                 color={theme.surface.default}
//                 weight="semibold"
//               >
//                 {date.isValid() ? date.format('MMM') : ''}
//               </AppText>
//             </View>

//             <View style={styles.scheduleDetails}>
//               <AppText
//                 variant="title"
//                 color={theme.text.primary}
//                 weight="semibold"
//               >
//                 {date.isValid()
//                   ? date.format('dddd')
//                   : tSafe('date_unavailable', 'Date unavailable')}
//               </AppText>

//               <View style={styles.detailRow}>
//                 <MaterialIcons
//                   name="schedule"
//                   size={16}
//                   color={theme.text.muted}
//                 />

//                 <AppText
//                   variant="caption"
//                   color={theme.text.muted}
//                   style={styles.detailText}
//                 >
//                   {formatCleaningTime(schedule.cleaning_time)}
//                   {schedule.cleaning_end_time
//                     ? ` – ${formatCleaningTime(
//                         schedule.cleaning_end_time
//                       )}`
//                     : ''}
//                 </AppText>
//               </View>

//               <View style={styles.detailRow}>
//                 <MaterialIcons
//                   name="location-on"
//                   size={16}
//                   color={theme.text.muted}
//                 />

//                 <AppText
//                   variant="caption"
//                   color={theme.text.muted}
//                   numberOfLines={2}
//                   style={styles.detailText}
//                 >
//                   {schedule.address ||
//                     selectedProperty?.address ||
//                     tSafe(
//                       'address_unavailable',
//                       'Address unavailable'
//                     )}
//                 </AppText>
//               </View>
//             </View>

//             <View
//               style={[
//                 styles.selectionIndicator,
//                 selected && styles.selectionIndicatorActive,
//               ]}
//             >
//               {selected && (
//                 <Feather
//                   name="check"
//                   size={15}
//                   color={theme.surface.default}
//                 />
//               )}
//             </View>
//           </View>
//         </TouchableOpacity>
//       </AppCard>
//     );
//   };


//   // ==================================================
//   // Cleaner card
//   // ==================================================

//   const renderCleanerItem = ({ item }) => {
//     const cleanerId = getCleanerId(item);
//     const status = getCleanerStatus(item);
//     const selectable = isCleanerSelectable(item);
//     const checked = selectedCleanerIds.includes(cleanerId);
//     const distance = formatDistance(item);
//     const normalizedCleaner = {
//       ...item,
//       _id: cleanerId,
//       cleanerId,
//       distanceFromApartment: getCleanerDistance(item),
//     };

//     // const cleanerId = item.cleanerId || item._id;
//     const isSelected = selectedCleanerIds.includes(cleanerId);

//     return (
//       <AppCard
//         variant={checked ? 'elevated' : 'default'}
//         padding="none"
//         radius="large"
//         bordered
//         style={[
//           styles.cleanerCard,
//           checked && styles.selectedCleanerCard,
//         ]}
//       >
//         <View style={styles.cleanerContent}>
//           <CleanerCard
//             item={normalizedCleaner}
//             status={status}
//             onPress={() => {
//               navigation.navigate(
//                 ROUTES.cleaner_profile_info,
//                 {
//                   item: normalizedCleaner,
//                   selected_schedule: selectedSchedule,
//                   selected_scheduleId: selectedSchedule?._id,

//                   // Use the authenticated host ID.
//                   hostId: currentUserId,

//                   // A recommendation is not a request,
//                   // so don't pass a fabricated requestId.
//                   hostFname:
//                     currentUser?.firstname ||
//                     currentUser?.firstName ||
//                     '',

//                   hostLname:
//                     currentUser?.lastname ||
//                     currentUser?.lastName ||
//                     '',

//                   distanceFromApartment:
//                     getCleanerDistance(item),
//                 }
//               );
//             }}
//           />
//         </View>

//         <View style={styles.cleanerSelectionRow}>
//           <View style={styles.cleanerSelectionDetails}>
//             <AppText
//               variant="bodyMedium"
//               color={theme.text.primary}
//               weight="medium"
//             >
//               {checked
//                 ? tSafe('selected', 'Selected')
//                 : selectable
//                   ? tSafe(
//                       'available_to_invite',
//                       'Available to invite'
//                     )
//                   : tSafe(
//                       'not_available_for_invite',
//                       'Not available for a new invitation'
//                     )}
//             </AppText>

//             {distance && (
//               <View style={styles.distanceRow}>
//                 <Feather
//                   name="map-pin"
//                   size={12}
//                   color={theme.text.muted}
//                 />

//                 <AppText
//                   variant="caption"
//                   color={theme.text.muted}
//                   style={styles.distanceText}
//                 >
//                   {distance}
//                 </AppText>
//               </View>
//             )}
//           </View>
//           <CustomCheckbox
//             checked={isSelected}
//             onPress={() => toggleCleanerSelection(cleanerId)}
//             label={tSafe('Select cleaner')}
//             accessibilityLabel={tSafe('Select this cleaner')}
//           />
//           {/* <Checkbox
//             status={checked ? 'checked' : 'unchecked'}
//             disabled={!selectable || sendingRequests}
//             onPress={() => toggleCleanerSelection(item)}
//             color={theme.brand.primary}
//             uncheckedColor={theme.text.muted}
//             accessibilityLabel={
//               checked
//                 ? tSafe('deselect_cleaner', 'Deselect cleaner')
//                 : tSafe('select_cleaner', 'Select cleaner')
//             }
//           /> */}
//         </View>
//       </AppCard>
//     );
//   };


//   // ==================================================
//   // Bulk request panel
//   // ==================================================

//   const renderBulkRequestPanel = () => {
//     const selectableCount = cleaners.filter(
//       isCleanerSelectable
//     ).length;

//     const selectedCount = selectedCleanerIds.length;

//     return (
//       <AppCard
//         variant="elevated"
//         padding="large"
//         radius="large"
//         bordered
//         style={styles.bulkRequestPanel}
//       >
//         <View style={styles.bulkRequestHeader}>
//           <View style={styles.bulkRequestIcon}>
//             <Feather
//               name="users"
//               size={21}
//               color={theme.brand.primary}
//             />
//           </View>

//           <View style={styles.bulkRequestHeaderText}>
//             <AppText
//               variant="title"
//               color={theme.text.primary}
//               weight="semibold"
//             >
//               {tSafe('invite_cleaners', 'Invite Cleaners')}
//             </AppText>

//             <AppText
//               variant="caption"
//               color={theme.text.muted}
//               style={styles.panelDescription}
//             >
//               {tSafe(
//                 'select_cleaners_description',
//                 'Select the cleaners you want to invite to this cleaning.'
//               )}
//             </AppText>
//           </View>
//         </View>

//         <View style={styles.selectionSummary}>
//           <View>
//             <AppText
//               variant="display"
//               color={theme.brand.primary}
//               weight="bold"
//             >
//               {selectedCount}
//             </AppText>

//             <AppText
//               variant="caption"
//               color={theme.text.muted}
//             >
//               {tSafe('selected_cleaners', 'Selected cleaners')}
//             </AppText>
//           </View>

//           <View style={styles.availableSummary}>
//             <View style={styles.availableDot} />

//             <AppText
//               variant="caption"
//               color={theme.text.primary}
//               weight="medium"
//             >
//               {`${selectableCount} ${tSafe(
//                 'available',
//                 'available'
//               )}`}
//             </AppText>
//           </View>
//         </View>

//         {selectedCount > 0 && (
//           <TouchableOpacity
//             disabled={sendingRequests}
//             onPress={clearCleanerSelection}
//             style={styles.clearSelectionButton}
//           >
//             <Feather
//               name="x-circle"
//               size={15}
//               color={theme.brand.primary}
//             />

//             <AppText
//               variant="label"
//               color={theme.brand.primary}
//               style={styles.clearSelectionText}
//             >
//               {tSafe('clear_selection', 'Clear selection')}
//             </AppText>
//           </TouchableOpacity>
//         )}

//         <Button
//           mode="contained"
//           icon="send"
//           loading={sendingRequests}
//           disabled={
//             selectedCount === 0 ||
//             sendingRequests ||
//             !selectedScheduleId
//           }
//           onPress={handleSendCleanerRequests}
//           buttonColor={theme.brand.primary}
//           textColor={theme.surface.default}
//           style={styles.bulkRequestButton}
//           contentStyle={styles.bulkRequestButtonContent}
//           labelStyle={styles.bulkRequestButtonLabel}
//         >
//           {sendingRequests
//             ? tSafe('sending_requests', 'Sending requests...')
//             : `${tSafe(
//                 'send_requests_to',
//                 'Send Requests to'
//               )} ${selectedCount} ${
//                 selectedCount === 1
//                   ? tSafe('cleaner', 'Cleaner')
//                   : tSafe('cleaners', 'Cleaners')
//               }`}
//         </Button>

//         <AppText
//           variant="caption"
//           color={theme.text.muted}
//           align="center"
//           style={styles.bulkRequestFootnote}
//         >
//           {tSafe(
//             'bulk_request_footer',
//             'Select multiple cleaners before sending invitations.'
//           )}
//         </AppText>
//       </AppCard>
//     );
//   };


//   // ==================================================
//   // Main render
//   // ==================================================

//   return (
//     <View style={styles.container}>
//       <ExpoStatusBar
//         style={isDark ? 'light' : 'dark'}
//       />

//       <CustomHeader
//         navigation={navigation}
//         currentStep={currentStep}
//         setCurrentStep={setCurrentStep}
//       />

//       <ScrollView
//         style={styles.scrollView}
//         contentContainerStyle={styles.content}
//         keyboardShouldPersistTaps="handled"
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={handleRefresh}
//             tintColor={theme.brand.primary}
//             colors={[theme.brand.primary]}
//           />
//         }
//       >
//         {/* ========================================== */}
//         {/* Step 1: Choose property */}
//         {/* ========================================== */}

//         {currentStep === 1 && (
//           <Animated.View
//             entering={FadeIn}
//             exiting={FadeOut}
//           >
//             <View style={styles.sectionHeader}>
//               <AppText
//                 variant="heading"
//                 color={theme.text.primary}
//               >
//                 {tSafe('choose_property', 'Choose a Property')}
//               </AppText>

//               <AppText
//                 variant="body"
//                 color={theme.text.muted}
//                 style={styles.sectionSubtitle}
//               >
//                 {tSafe(
//                   'choose_property_description',
//                   'Select the property that needs cleaning.'
//                 )}
//               </AppText>
//             </View>

//             {apartments.length === 0 ? (
//               <View style={styles.emptyState}>
//                 <Feather
//                   name="home"
//                   size={38}
//                   color={theme.text.muted}
//                 />

//                 <AppText
//                   variant="title"
//                   color={theme.text.primary}
//                   align="center"
//                   style={styles.emptyTitle}
//                 >
//                   {tSafe('no_properties', 'No Properties Found')}
//                 </AppText>

//                 <AppText
//                   variant="body"
//                   color={theme.text.muted}
//                   align="center"
//                   style={styles.emptyDescription}
//                 >
//                   {tSafe(
//                     'add_property_first',
//                     'Add a property before looking for cleaners.'
//                   )}
//                 </AppText>
//               </View>
//             ) : (
//               <FlatList
//                 data={apartments}
//                 renderItem={renderPropertyItem}
//                 keyExtractor={(item) => String(item._id)}
//                 scrollEnabled={false}
//                 removeClippedSubviews={false}
//               />
//             )}
//           </Animated.View>
//         )}


//         {/* ========================================== */}
//         {/* Step 2: Choose schedule */}
//         {/* ========================================== */}

//         {currentStep === 2 && (
//           <Animated.View
//             entering={SlideInRight}
//             exiting={SlideOutLeft}
//           >
//             <View style={styles.sectionHeader}>
//               <AppText
//                 variant="heading"
//                 color={theme.text.primary}
//               >
//                 {tSafe('choose_schedule', 'Choose a Schedule')}
//               </AppText>

//               <AppText
//                 variant="body"
//                 color={theme.text.muted}
//                 style={styles.sectionSubtitle}
//               >
//                 {tSafe(
//                   'choose_schedule_description',
//                   'Select the upcoming cleaning that needs a cleaner.'
//                 )}
//               </AppText>
//             </View>

//             {schedules.length === 0 ? (
//               <View style={styles.emptyState}>
//                 <View style={styles.emptyIconContainer}>
//                   <Feather
//                     name="calendar"
//                     size={30}
//                     color={theme.brand.primary}
//                   />
//                 </View>

//                 <AppText
//                   variant="title"
//                   color={theme.text.primary}
//                   align="center"
//                   style={styles.emptyTitle}
//                 >
//                   {tSafe(
//                     'no_available_schedules',
//                     'No Available Schedules'
//                   )}
//                 </AppText>

//                 <AppText
//                   variant="body"
//                   color={theme.text.muted}
//                   align="center"
//                   style={styles.emptyDescription}
//                 >
//                   {tSafe(
//                     'no_schedules_for_property',
//                     'There are no upcoming cleaning schedules for this property.'
//                   )}
//                 </AppText>

//                 <TouchableOpacity
//                   activeOpacity={0.85}
//                   style={styles.createScheduleButton}
//                   onPress={() => handleCreateSchedule(true)}
//                 >
//                   <Feather
//                     name="plus"
//                     size={17}
//                     color={theme.surface.default}
//                   />

//                   <AppText
//                     variant="label"
//                     color={theme.surface.default}
//                     style={styles.createScheduleButtonText}
//                   >
//                     {tSafe('create_schedule', 'Create Schedule')}
//                   </AppText>
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               <FlatList
//                 data={schedules}
//                 renderItem={renderScheduleItem}
//                 keyExtractor={(item) => String(item._id)}
//                 scrollEnabled={false}
//                 removeClippedSubviews={false}
//               />
//             )}
//           </Animated.View>
//         )}


//         {/* ========================================== */}
//         {/* Step 3: Recommended cleaners */}
//         {/* ========================================== */}

//         {currentStep === 3 && selectedSchedule && (
//           <Animated.View
//             entering={SlideInRight}
//             exiting={SlideOutLeft}
//           >
//             <View style={styles.sectionHeader}>
//               <AppText
//                 variant="heading"
//                 color={theme.text.primary}
//               >
//                 {tSafe(
//                   'recommended_cleaners',
//                   'Recommended Cleaners'
//                 )}
//               </AppText>

//               <AppText
//                 variant="body"
//                 color={theme.text.muted}
//                 style={styles.sectionSubtitle}
//               >
//                 {tSafe(
//                   'select_multiple_cleaners',
//                   'Choose one or more eligible cleaners to invite.'
//                 )}
//               </AppText>
//             </View>


//             {/* Selected schedule */}

//             <AppCard
//               variant="elevated"
//               padding="medium"
//               radius="large"
//               bordered
//               style={styles.scheduleSummaryCard}
//             >
//               <View style={styles.summaryCalendarIcon}>
//                 <Feather
//                   name="calendar"
//                   size={21}
//                   color={theme.brand.primary}
//                 />
//               </View>

//               <View style={styles.scheduleSummaryDetails}>
//                 <AppText
//                   variant="title"
//                   color={theme.text.primary}
//                   weight="semibold"
//                 >
//                   {selectedProperty?.apt_name ||
//                     selectedSchedule?.schedule?.apartment_name ||
//                     ''}
//                 </AppText>

//                 <AppText
//                   variant="body"
//                   color={theme.text.muted}
//                   style={styles.summaryDate}
//                 >
//                   {moment(
//                     selectedSchedule.schedule.cleaning_date,
//                     'YYYY-MM-DD'
//                   ).format('ddd, MMM DD, YYYY')}
//                 </AppText>

//                 <View style={styles.detailRow}>
//                   <Feather
//                     name="clock"
//                     size={13}
//                     color={theme.text.muted}
//                   />

//                   <AppText
//                     variant="caption"
//                     color={theme.text.muted}
//                     style={styles.detailText}
//                   >
//                     {formatCleaningTime(
//                       selectedSchedule.schedule.cleaning_time
//                     )}
//                   </AppText>
//                 </View>

//                 <AppText
//                   variant="caption"
//                   color={theme.text.muted}
//                   numberOfLines={2}
//                   style={styles.summaryAddress}
//                 >
//                   {selectedSchedule.schedule.address ||
//                     selectedProperty?.address ||
//                     ''}
//                 </AppText>
//               </View>
//             </AppCard>


//             {/* Existing request statuses */}

//             <AppCard
//               variant="default"
//               padding="medium"
//               radius="large"
//               bordered
//               style={styles.statusSummary}
//             >
//               <View style={styles.statusSummaryItem}>
//                 <View
//                   style={[
//                     styles.statusDot,
//                     {
//                       backgroundColor:
//                         theme.text.muted,
//                     },
//                   ]}
//                 />

//                 <AppText
//                   variant="caption"
//                   color={theme.text.muted}
//                 >
//                   {tSafe('notified', 'Notified')}
//                 </AppText>

//                 <AppText
//                   variant="bodyMedium"
//                   color={theme.text.primary}
//                   weight="semibold"
//                 >
//                   {statusCounts.notified}
//                 </AppText>
//               </View>

//               <View style={styles.statusSummaryItem}>
//                 <View
//                   style={[
//                     styles.statusDot,
//                     {
//                       backgroundColor:
//                         theme.brand.primary,
//                     },
//                   ]}
//                 />

//                 <AppText
//                   variant="caption"
//                   color={theme.text.muted}
//                 >
//                   {tSafe('pending', 'Pending')}
//                 </AppText>

//                 <AppText
//                   variant="bodyMedium"
//                   color={theme.text.primary}
//                   weight="semibold"
//                 >
//                   {statusCounts.pending}
//                 </AppText>
//               </View>

//               <View style={styles.statusSummaryItem}>
//                 <View
//                   style={[
//                     styles.statusDot,
//                     {
//                       backgroundColor:
//                         theme.brand.primary,
//                     },
//                   ]}
//                 />

//                 <AppText
//                   variant="caption"
//                   color={theme.text.muted}
//                 >
//                   {tSafe('accepted', 'Accepted')}
//                 </AppText>

//                 <AppText
//                   variant="bodyMedium"
//                   color={theme.text.primary}
//                   weight="semibold"
//                 >
//                   {statusCounts.accepted}
//                 </AppText>
//               </View>

//               <View style={styles.statusSummaryItem}>
//                 <View
//                   style={[
//                     styles.statusDot,
//                     {
//                       backgroundColor:
//                         theme.text.muted,
//                     },
//                   ]}
//                 />

//                 <AppText
//                   variant="caption"
//                   color={theme.text.muted}
//                 >
//                   {tSafe('declined', 'Declined')}
//                 </AppText>

//                 <AppText
//                   variant="bodyMedium"
//                   color={theme.text.primary}
//                   weight="semibold"
//                 >
//                   {statusCounts.declined}
//                 </AppText>
//               </View>
//             </AppCard>


//             {/* Recommendation list heading */}

//             {!loading && cleaners.length > 0 && (
//               <View style={styles.listHeading}>
//                 <View style={styles.listHeadingText}>
//                   <AppText
//                     variant="title"
//                     color={theme.text.primary}
//                     weight="semibold"
//                   >
//                     {tSafe(
//                       'available_cleaners',
//                       'Available Cleaners'
//                     )}
//                   </AppText>

//                   <AppText
//                     variant="caption"
//                     color={theme.text.muted}
//                   >
//                     {tSafe(
//                       'tap_checkbox_to_select',
//                       'Use the checkbox to select a cleaner.'
//                     )}
//                   </AppText>
//                 </View>

//                 <Chip
//                   compact
//                   style={styles.resultCountChip}
//                   textStyle={styles.resultCountText}
//                 >
//                   {cleaners.length}
//                 </Chip>
//               </View>
//             )}


//             {/* Loading state */}

//             {loading ? (
//               <View style={styles.skeletonContainer}>
//                 {[...Array(5)].map((_, index) => (
//                   <CleanerCardSkeleton
//                     key={`cleaner-skeleton-${index}`}
//                   />
//                 ))}
//               </View>
//             ) : (
//               <FlatList
//                 data={cleaners}
//                 renderItem={renderCleanerItem}
//                 keyExtractor={(item, index) =>
//                   getCleanerId(item) || `cleaner-${index}`
//                 }
//                 scrollEnabled={false}
//                 removeClippedSubviews={false}
//                 ListEmptyComponent={
//                   <View style={styles.emptyState}>
//                     <View style={styles.emptyIconContainer}>
//                       <Feather
//                         name="users"
//                         size={30}
//                         color={theme.brand.primary}
//                       />
//                     </View>

//                     <AppText
//                       variant="title"
//                       color={theme.text.primary}
//                       align="center"
//                       style={styles.emptyTitle}
//                     >
//                       {tSafe(
//                         'no_available_cleaners',
//                         'No Available Cleaners'
//                       )}
//                     </AppText>

//                     <AppText
//                       variant="body"
//                       color={theme.text.muted}
//                       align="center"
//                       style={styles.emptyDescription}
//                     >
//                       {tSafe(
//                         'try_refreshing_recommendations',
//                         'No eligible cleaners were found. Pull down to refresh and try again.'
//                       )}
//                     </AppText>
//                   </View>
//                 }
//               />
//             )}


//             {/* Multi-select bulk request panel */}

//             {!loading && cleaners.length > 0 &&
//               renderBulkRequestPanel()}
//           </Animated.View>
//         )}
//       </ScrollView>


//       {/* Bottom navigation */}

//       {(
//         (currentStep === 1 && selectedProperty) ||
//         (currentStep === 2 && selectedSchedule)
//       ) && (
//         <View style={styles.footer}>
//           <TouchableOpacity
//             activeOpacity={0.85}
//             style={styles.nextButton}
//             onPress={handleStepNavigation}
//           >
//             <AppText
//               variant="bodyMedium"
//               color={theme.surface.default}
//               weight="semibold"
//             >
//               {currentStep === 1
//                 ? tSafe(
//                     'next_choose_schedule',
//                     'Next: Choose Schedule'
//                   )
//                 : tSafe(
//                     'find_cleaners',
//                     'Find Cleaners'
//                   )}
//             </AppText>

//             <Feather
//               name="arrow-right"
//               size={19}
//               color={theme.surface.default}
//             />
//           </TouchableOpacity>
//         </View>
//       )}


//       {/* New booking modal */}

//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         onRequestClose={handleCloseCreateBooking}
//         statusBarTranslucent
//       >
//         <NewBooking
//           close_modal={handleCloseCreateBooking}
//           mode="create"
//         />
//       </Modal>
//     </View>
//   );
// };


// // ==================================================
// // Theme-aware styles
// // ==================================================

// const createStyles = (theme, isDark) =>
//   StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: theme.background.default,
//     },

//     scrollView: {
//       flex: 1,
//     },

//     content: {
//       paddingTop: 8,
//       paddingBottom: 28,
//     },

//     // Section headings

//     sectionHeader: {
//       marginHorizontal: 18,
//       marginTop: 14,
//       marginBottom: 16,
//     },

//     sectionSubtitle: {
//       marginTop: 6,
//       lineHeight: 21,
//     },

//     // Property cards

//     propertyCard: {
//       marginHorizontal: 16,
//       marginBottom: 12,
//     },

//     selectedCard: {
//       borderColor: theme.brand.primary,
//     },

//     propertyHeader: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },

//     propertyIcon: {
//       width: 50,
//       height: 50,
//       borderRadius: 15,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: theme.surface.elevated,
//       marginRight: 13,
//     },

//     propertyDetails: {
//       flex: 1,
//       paddingRight: 8,
//     },

//     propertyAddress: {
//       marginTop: 5,
//     },

//     selectionIndicator: {
//       width: 24,
//       height: 24,
//       borderRadius: 12,
//       borderWidth: 1.5,
//       borderColor: theme.divider,
//       alignItems: 'center',
//       justifyContent: 'center',
//     },

//     selectionIndicatorActive: {
//       borderColor: theme.brand.primary,
//       backgroundColor: theme.brand.primary,
//     },

//     roomTypeContainer: {
//       flexDirection: 'row',
//       flexWrap: 'wrap',
//       alignItems: 'center',
//       marginTop: 14,
//       gap: 6,
//     },

//     roomChip: {
//       backgroundColor: theme.surface.elevated,
//     },

//     roomChipText: {
//       color: theme.text.muted,
//     },

//     // Schedule cards

//     scheduleCard: {
//       marginHorizontal: 16,
//       marginBottom: 12,
//     },

//     scheduleRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },

//     dateBadge: {
//       width: 62,
//       height: 68,
//       borderRadius: 14,
//       backgroundColor: theme.brand.primary,
//       alignItems: 'center',
//       justifyContent: 'center',
//       marginRight: 14,
//     },

//     scheduleDetails: {
//       flex: 1,
//     },

//     detailRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginTop: 7,
//     },

//     detailText: {
//       flex: 1,
//       marginLeft: 7,
//     },

//     // Schedule summary

//     scheduleSummaryCard: {
//       flexDirection: 'row',
//       marginHorizontal: 16,
//       marginBottom: 16,
//     },

//     summaryCalendarIcon: {
//       width: 44,
//       height: 44,
//       borderRadius: 13,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: theme.surface.elevated,
//       marginRight: 12,
//     },

//     scheduleSummaryDetails: {
//       flex: 1,
//     },

//     summaryDate: {
//       marginTop: 5,
//     },

//     summaryAddress: {
//       marginTop: 7,
//     },

//     // Status summary

//     statusSummary: {
//       marginHorizontal: 16,
//       marginBottom: 20,
//       flexDirection: 'row',
//       flexWrap: 'wrap',
//     },

//     statusSummaryItem: {
//       width: '50%',
//       flexDirection: 'row',
//       alignItems: 'center',
//       paddingVertical: 9,
//       paddingHorizontal: 4,
//       gap: 6,
//     },

//     statusDot: {
//       width: 7,
//       height: 7,
//       borderRadius: 4,
//     },

//     // Cleaner list

//     listHeading: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       marginHorizontal: 18,
//       marginBottom: 12,
//     },

//     listHeadingText: {
//       flex: 1,
//       paddingRight: 8,
//     },

//     resultCountChip: {
//       backgroundColor: theme.surface.elevated,
//     },

//     resultCountText: {
//       color: theme.brand.primary,
//     },

//     cleanerCard: {
//       marginHorizontal: 12,
//       marginBottom: 13,
//       overflow: 'hidden',
//     },

//     selectedCleanerCard: {
//       borderColor: theme.brand.primary,
//     },

//     cleanerContent: {
//       paddingHorizontal: 0,
//     },

//     cleanerSelectionRow: {
//       minHeight: 60,
//       flexDirection: 'row',
//       alignItems: 'center',
//       paddingLeft: 16,
//       paddingRight: 6,
//       borderTopWidth: StyleSheet.hairlineWidth,
//       borderTopColor: theme.divider,
//       backgroundColor: theme.surface.elevated,
//     },

//     cleanerSelectionDetails: {
//       flex: 1,
//       paddingVertical: 10,
//     },

//     distanceRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginTop: 5,
//     },

//     distanceText: {
//       marginLeft: 5,
//     },

//     // Bulk request panel

//     bulkRequestPanel: {
//       marginHorizontal: 16,
//       marginTop: 10,
//       marginBottom: 24,
//     },

//     bulkRequestHeader: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },

//     bulkRequestIcon: {
//       width: 45,
//       height: 45,
//       borderRadius: 14,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: theme.surface.elevated,
//       marginRight: 12,
//     },

//     bulkRequestHeaderText: {
//       flex: 1,
//     },

//     panelDescription: {
//       marginTop: 4,
//       lineHeight: 18,
//     },

//     selectionSummary: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       marginTop: 20,
//       paddingVertical: 14,
//       paddingHorizontal: 15,
//       borderRadius: 14,
//       backgroundColor: theme.surface.elevated,
//     },

//     availableSummary: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       paddingHorizontal: 10,
//       paddingVertical: 8,
//       borderRadius: 20,
//       backgroundColor: theme.surface.default,
//     },

//     availableDot: {
//       width: 7,
//       height: 7,
//       borderRadius: 4,
//       backgroundColor: theme.brand.primary,
//       marginRight: 6,
//     },

//     clearSelectionButton: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       alignSelf: 'flex-start',
//       marginTop: 12,
//       paddingVertical: 5,
//     },

//     clearSelectionText: {
//       marginLeft: 6,
//     },

//     bulkRequestButton: {
//       marginTop: 15,
//       borderRadius: 12,
//     },

//     bulkRequestButtonContent: {
//       minHeight: 50,
//       paddingHorizontal: 8,
//     },

//     bulkRequestButtonLabel: {
//       fontSize: 13,
//       fontWeight: '700',
//     },

//     bulkRequestFootnote: {
//       marginTop: 11,
//       lineHeight: 17,
//     },

//     // Empty states

//     emptyState: {
//       alignItems: 'center',
//       justifyContent: 'center',
//       paddingHorizontal: 28,
//       paddingVertical: 38,
//       marginHorizontal: 16,
//       backgroundColor: theme.surface.default,
//       borderRadius: 18,
//       borderWidth: 1,
//       borderColor: theme.divider,
//     },

//     emptyIconContainer: {
//       width: 60,
//       height: 60,
//       borderRadius: 18,
//       backgroundColor: theme.surface.elevated,
//       alignItems: 'center',
//       justifyContent: 'center',
//       marginBottom: 12,
//     },

//     emptyTitle: {
//       marginTop: 12,
//     },

//     emptyDescription: {
//       marginTop: 8,
//       lineHeight: 20,
//     },

//     createScheduleButton: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//       paddingVertical: 13,
//       paddingHorizontal: 20,
//       backgroundColor: theme.brand.primary,
//       borderRadius: 12,
//       marginTop: 20,
//     },

//     createScheduleButtonText: {
//       marginLeft: 8,
//     },

//     skeletonContainer: {
//       marginTop: 8,
//     },

//     // Footer

//     footer: {
//       backgroundColor: theme.surface.default,
//       paddingHorizontal: 16,
//       paddingTop: 10,
//       paddingBottom: 12,
//       borderTopWidth: StyleSheet.hairlineWidth,
//       borderTopColor: theme.divider,
//     },

//     nextButton: {
//       minHeight: 52,
//       backgroundColor: theme.brand.primary,
//       borderRadius: 14,
//       paddingHorizontal: 18,
//       flexDirection: 'row',
//       justifyContent: 'center',
//       alignItems: 'center',
//       gap: 10,
//     },
//   });

// export default FindCleaners;

// import React, { useState, useEffect, useCallback, useContext } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, Modal, Alert, RefreshControl } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
// import { Feather, MaterialIcons } from '@expo/vector-icons';
// import moment from 'moment';
// import userService from '../../services/connection/userService';
// import { AuthContext } from '../../context/AuthContext';
// import COLORS from '../../constants/colors';
// import { HomeSkeleton } from '../../components/shared/skeleton/HomeSkeleton';
// import * as Animatable from 'react-native-animatable';
// import { AntDesign } from '@expo/vector-icons';
// import { Chip } from 'react-native-paper';
// import ROUTES from '../../constants/routes';
// import CustomHeader from '../../components/shared/CustomHeader';
// import { useBookingContext } from '../../context/BookingContext';
// import NewBooking from './NewBooking';
// import CleanerCard from '../../components/cleaner/CleanerCard';
// import { tSafe } from '../../utils/tSafe';
// import CleanerCardSkeleton from '../../components/cleaner/CleanerCardSkeleton';

// const FindCleaners = ({ navigation }) => {
//   const { currentUserId, currentUser } = useContext(AuthContext);
//   const { modalVisible, handleCreateSchedule } = useBookingContext();

//   const [currentStep, setCurrentStep] = useState(1);
//   const [selectedProperty, setSelectedProperty] = useState(null);
//   const [selectedSchedule, setSelectedSchedule] = useState(null);
//   const [apartments, setApartments] = useState([]);
//   const [schedules, setSchedules] = useState([]);
//   const [cleaners, setCleaners] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   // --- Status state ---
//   const [cleanerStatuses, setCleanerStatuses] = useState({});
//   const [statusCounts, setStatusCounts] = useState({
//     notified: 0,
//     pending: 0,
//     accepted: 0,
//     declined: 0
//   });

//   const genericArray = new Array(5).fill(null);

//   // ---------- Initial Data Fetch ----------
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [apartmentsRes] = await Promise.all([
//           userService.getApartment(currentUserId),
//         ]);
  
//         if (!apartmentsRes.data || apartmentsRes.data.length === 0) {
//           Alert.alert(
//             'Property Required',
//             'You need to add at least one property before you can find cleaners. Please add a property first.',
//             [
//               {
//                 text: 'OK',
//                 onPress: () => navigation.replace(ROUTES.host_dashboard),
//               },
//             ],
//             { cancelable: false }
//           );
//           return;
//         }
  
//         setApartments(apartmentsRes.data);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         Alert.alert('Error', 'Failed to load your properties. Please try again.');
//       }
//     };
  
//     fetchData();
//   }, [currentUserId, navigation]);

//   // ---------- Fetch schedules when property is selected ----------
//   useEffect(() => {
//     const fetchPropertySchedules = async () => {
//       if (!selectedProperty) return;
      
//       try {
//         const schedulesRes = await userService.getUpcomingSchedulesByHostId(currentUserId);
//         const filtered = schedulesRes.data.filter(
//           item => item.schedule.apartment_name === selectedProperty.apt_name
//         );

//         const upcomingSchedules = filtered.filter(schedule => {
//           const cleaningDate = schedule.schedule.cleaning_date;
//           const cleaningTime = schedule.schedule.cleaning_time;
//           if (!cleaningDate || !cleaningTime) return false;
//           const cleaningDateTime = moment(`${cleaningDate} ${cleaningTime}`, 'YYYY-MM-DD HH:mm:ss');
//           return cleaningDateTime.isSameOrAfter(moment());
//         });
        
//         setSchedules(upcomingSchedules);
//         setSelectedSchedule(null);
//       } catch (error) {
//         console.error('Error fetching schedules:', error);
//       }
//     };
    
//     fetchPropertySchedules();
//   }, [selectedProperty, currentUserId]);

//   // ---------- Fetch cleaners + statuses when schedule is selected ----------
//   useEffect(() => {
//     if (!selectedSchedule) return;
  
//     setLoading(true);
  
//     const timeout = setTimeout(async () => {
//       try {
//         // 1. Fetch cleaners
//         const cleanersRes = await userService.findCleaners(selectedSchedule._id);
//         setCleaners(cleanersRes.data);

//         // 2. Fetch schedule details for statuses
//         const scheduleRes = await userService.getScheduleById(selectedSchedule._id);
//         const notified = scheduleRes.data.notified_cleaners || [];

//         // Build status map
//         const statusMap = {};
//         notified.forEach(item => {
//           statusMap[item.cleanerId] = item.status || 'pending';
//         });
//         setCleanerStatuses(statusMap);

//         // Compute counts
//         const counts = { notified: 0, pending: 0, accepted: 0, declined: 0 };
//         notified.forEach(item => {
//           const s = item.status || 'pending';
//           if (counts[s] !== undefined) counts[s]++;
//         });
//         setStatusCounts(counts);

//       } catch (error) {
//         console.error('Error fetching data:', error);
//       } finally {
//         setLoading(false);
//       }
//     }, 2000);
  
//     return () => {
//       clearTimeout(timeout);
//       setLoading(false);
//     };
//   }, [selectedSchedule]);

//   // ---------- Auto-refresh statuses every 10 seconds ----------
//   useEffect(() => {
//     if (!selectedSchedule || loading) return;

//     const interval = setInterval(async () => {
//       try {
//         const scheduleRes = await userService.getScheduleById(selectedSchedule._id);
//         const notified = scheduleRes.data.notified_cleaners || [];

//         const statusMap = {};
//         notified.forEach(item => {
//           statusMap[item.cleanerId] = item.status || 'pending';
//         });
//         setCleanerStatuses(statusMap);

//         const counts = { notified: 0, pending: 0, accepted: 0, declined: 0 };
//         notified.forEach(item => {
//           const s = item.status || 'pending';
//           if (counts[s] !== undefined) counts[s]++;
//         });
//         setStatusCounts(counts);
//       } catch (e) {
//         // silent fail – will retry next interval
//       }
//     }, 10000); // 10 seconds

//     return () => clearInterval(interval);
//   }, [selectedSchedule, loading]);

//   // ---------- SILENT REFRESH on focus ----------
//   useFocusEffect(
//     useCallback(() => {
//       const refreshData = async () => {
//         try {
//           const apartmentsRes = await userService.getApartment(currentUserId);
//           if (!apartmentsRes.data || apartmentsRes.data.length === 0) {
//             setApartments([]);
//             setSelectedProperty(null);
//             setSelectedSchedule(null);
//             setCurrentStep(1);
//             return;
//           }
          
//           const newApartments = apartmentsRes.data;
//           setApartments(newApartments);

//           if (selectedProperty) {
//             const stillExists = newApartments.some(apt => apt._id === selectedProperty._id);
//             if (!stillExists) {
//               setSelectedProperty(null);
//               setSelectedSchedule(null);
//               setCurrentStep(1);
//               return;
//             }
            
//             const schedulesRes = await userService.getUpcomingSchedulesByHostId(currentUserId);
//             const filtered = schedulesRes.data.filter(
//               item => item.schedule.apartment_name === selectedProperty.apt_name
//             );
//             const upcomingSchedules = filtered.filter(schedule => {
//               const cleaningDate = schedule.schedule.cleaning_date;
//               const cleaningTime = schedule.schedule.cleaning_time;
//               if (!cleaningDate || !cleaningTime) return false;
//               const cleaningDateTime = moment(`${cleaningDate} ${cleaningTime}`, 'YYYY-MM-DD HH:mm:ss');
//               return cleaningDateTime.isSameOrAfter(moment());
//             });
//             setSchedules(upcomingSchedules);

//             if (selectedSchedule) {
//               const scheduleStillExists = upcomingSchedules.some(s => s._id === selectedSchedule._id);
//               if (!scheduleStillExists) {
//                 setSelectedSchedule(null);
//               }
//             }
//           } else {
//             setCurrentStep(1);
//             setSelectedSchedule(null);
//           }
//         } catch (error) {
//           console.error('Error refreshing data:', error);
//         }
//       };

//       refreshData();
//     }, [currentUserId, selectedProperty, selectedSchedule])
//   );

//   // ---------- Cleanup on unmount ----------
//   useEffect(() => {
//     return () => {
//       setCurrentStep(1);
//       setSelectedProperty(null);
//       setSelectedSchedule(null);
//     };
//   }, []);

//   // ---------- Navigation handlers ----------
//   const handleStepNavigation = () => {
//     if (currentStep === 1 && selectedProperty) {
//       setCurrentStep(2);
//     }
//     if (currentStep === 2 && selectedSchedule) {
//       setCurrentStep(3);
//     }
//   };

//   const handleCloseCreateBooking = () => {
//     handleCreateSchedule(false);
//   };

//   // ---------- Render functions ----------
//   const renderPropertyItem = ({ item }) => (
//     <View style={{marginHorizontal:15}}>
//       <TouchableOpacity
//         style={[
//           styles.card,
//           selectedProperty?._id === item._id && styles.selectedCard
//         ]}
//         onPress={() => setSelectedProperty(item)}
//       >
//         {selectedProperty?._id === item._id && (
//           <View style={styles.checkBadge}>
//             <Feather name="check" size={16} color="white" />
//           </View>
//         )}

//         <View style={styles.itemContent}>
//           <View style={{marginRight:10}}>
//             <AntDesign name="home" size={40} color={COLORS.gray}/>
//           </View>
//           <View style={{width:'85%'}}>
//             <Text style={styles.cardTitle}>{item.apt_name}</Text>
//             <Text style={styles.address}>{item.address}</Text>
//           </View>
//         </View>

//         <View style={styles.room_type_container}>
//           <Chip mode="flat" style={styles.activeChip} textStyle={styles.textChip}>
//             {item.roomDetails[0]?.['number'] || 0} {item.roomDetails[0]?.['type'] || ''}
//           </Chip>
//           <Chip mode="flat" style={styles.activeChip} textStyle={styles.textChip}>
//             {item.roomDetails[1]?.['number'] || 0} {item.roomDetails[1]?.['type'] || ''}
//           </Chip>
//           <Chip mode="flat" style={styles.activeChip} textStyle={styles.textChip}>
//             {item.roomDetails[2]?.['number'] || 0} {item.roomDetails[2]?.['type'] || ''}
//           </Chip>
//         </View>
//       </TouchableOpacity>
//     </View>
//   );

//   const renderScheduleItem = ({ item }) => {
//     const dateBadge = {
//       day: moment(item.schedule.cleaning_date).format('D'),
//       month: moment(item.schedule.cleaning_date).format('MMM'),
//       dayName: moment(item.schedule.cleaning_date).format('dddd')
//     };
//     return (
//       <View style={{marginHorizontal:15}}>
//         <TouchableOpacity
//           style={[
//             styles.card,
//             styles.scheduleCard,
//             selectedSchedule?._id === item._id && styles.selectedCard
//           ]}
//           onPress={() => setSelectedSchedule(item)}
//         >
//           <View style={styles.scheduleDetails}>
//             <View style={[styles.dateBadge, { backgroundColor: COLORS.primary }]}>
//               <Text style={styles.day}>{dateBadge.day}</Text>
//               <Text style={styles.month}>{dateBadge.month}</Text>
//             </View>
//             <View>
//               <Text style={styles.cardTitle}>{dateBadge.dayName}</Text>
//               <View style={styles.row}>
//                 <MaterialIcons name="schedule" size={18} color={COLORS.light_gray} />
//                 <Text style={styles.infoText}>
//                   {moment(item.schedule.cleaning_time, 'h:mm:ss A').format('h:mm A')} - {moment(item.schedule.cleaning_end_time, 'h:mm:ss A').format('h:mm A') || 'TBD'}
//                 </Text>
//               </View>
//               <View style={styles.row}>
//                 <MaterialIcons name="location-on" size={18} color={COLORS.light_gray} />
//                 <Text style={styles.address}>{item.schedule.address}</Text>
//               </View>
//             </View>
//           </View>
//           {selectedSchedule?._id === item._id && (
//             <View style={styles.checkBadge}>
//               <Feather name="check" size={16} color="white" />
//             </View>
//           )}
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   const renderCleanerItem = ({ item }) => {
//     const cleanerId = item._id;
//     const status = cleanerStatuses[cleanerId] || 'pending'; // default to pending
   

//     return (
//       <View style={{margin:10}}>
//         <CleanerCard
//           item={item}
//           status={status}
//           onPress={() =>
//             navigation.navigate(ROUTES.cleaner_profile_info, {
//               item: item,
//               selected_schedule: selectedSchedule,
//               selected_scheduleId: selectedSchedule._id,
//               hostId: item,
//               requestId: item._id,
//               hostFname: item.firstname,
//               hostLname: item.lastname,
//               distanceFromApartment: item.distanceFromApartment
//             })
//           }
//         />
//       </View>
//     );
//   };

//   // ---------- Render ----------
//   return (
//     <View style={styles.container}>
//       <CustomHeader 
//         navigation={navigation}
//         currentStep={currentStep}
//         setCurrentStep={setCurrentStep}
//       />

//       <ScrollView 
//         contentContainerStyle={styles.content}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={async () => {
//               setRefreshing(true);
//               try {
//                 // Force refresh: reload apartments and schedules
//                 const apartmentsRes = await userService.getApartment(currentUserId);
//                 if (!apartmentsRes.data || apartmentsRes.data.length === 0) {
//                   Alert.alert(
//                     'Property Required',
//                     'You need to add at least one property before you can find cleaners.',
//                     [{ text: 'OK', onPress: () => navigation.replace(ROUTES.host_dashboard) }],
//                     { cancelable: false }
//                   );
//                   setRefreshing(false);
//                   return;
//                 }
//                 setApartments(apartmentsRes.data);
//                 if (selectedProperty) {
//                   const schedulesRes = await userService.getUpcomingSchedulesByHostId(currentUserId);
//                   const filtered = schedulesRes.data.filter(
//                     item => item.schedule.apartment_name === selectedProperty.apt_name
//                   );
//                   const upcomingSchedules = filtered.filter(schedule => {
//                     const cleaningDate = schedule.schedule.cleaning_date;
//                     const cleaningTime = schedule.schedule.cleaning_time;
//                     if (!cleaningDate || !cleaningTime) return false;
//                     const cleaningDateTime = moment(`${cleaningDate} ${cleaningTime}`, 'YYYY-MM-DD HH:mm:ss');
//                     return cleaningDateTime.isSameOrAfter(moment());
//                   });
//                   setSchedules(upcomingSchedules);
//                   if (selectedSchedule) {
//                     const stillExists = upcomingSchedules.some(s => s._id === selectedSchedule._id);
//                     if (!stillExists) setSelectedSchedule(null);
//                   }
//                   // Also refresh statuses for the selected schedule
//                   if (selectedSchedule) {
//                     const scheduleRes = await userService.getScheduleById(selectedSchedule._id);
//                     const notified = scheduleRes.data.notified_cleaners || [];
//                     const statusMap = {};
//                     notified.forEach(item => {
//                       statusMap[item.cleanerId] = item.status || 'pending';
//                     });
//                     setCleanerStatuses(statusMap);
//                     const counts = { notified: 0, pending: 0, accepted: 0, declined: 0 };
//                     notified.forEach(item => {
//                       const s = item.status || 'pending';
//                       if (counts[s] !== undefined) counts[s]++;
//                     });
//                     setStatusCounts(counts);
//                   }
//                 } else {
//                   setSchedules([]);
//                   setSelectedSchedule(null);
//                   setCurrentStep(1);
//                 }
//               } catch (error) {
//                 console.error('Pull-to-refresh error:', error);
//               } finally {
//                 setRefreshing(false);
//               }
//             }}
//           />
//         }
//       >
//         {currentStep === 1 && (
//           <Animated.View entering={FadeIn} exiting={FadeOut}>
//             <FlatList
//               data={apartments}
//               renderItem={renderPropertyItem}
//               keyExtractor={item => item._id}
//               scrollEnabled={false}
//             />
//           </Animated.View>
//         )}

//         {currentStep === 2 && (
//           <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
//             {schedules.length === 0 ? (
//               <View style={styles.emptyState}>
//                 <Feather name="calendar" size={40} color={COLORS.gray} />
//                 <Text style={styles.emptyText}>{tSafe('no_available_schedules', 'No available schedules for this property')}</Text>
//                 <TouchableOpacity
//                   style={styles.createScheduleButton}
//                   onPress={() => handleCreateSchedule(true)}
//                 >
//                   <Text style={{color:'white'}}>{tSafe('create_schedule', 'Create Schedule')}</Text>
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               <FlatList
//                 data={schedules}
//                 renderItem={renderScheduleItem}
//                 keyExtractor={item => item._id}
//                 scrollEnabled={false}
//               />
//             )}
//           </Animated.View>
//         )}

//         {currentStep === 3 && (
//           <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
//             <View style={styles.location_calendar_block}>
//               <View style={styles.calender}>
//                 <Text style={{ fontSize: 12 }}>
//                   {moment(selectedSchedule.schedule.cleaning_date).format('ddd MMM DD')}
//                 </Text>
//                 <Text style={{ fontSize: 11 }}>{selectedSchedule.schedule.cleaning_time}</Text>
//               </View>
//               <View style={styles.addre1}>
//                 <Text style={styles.headline1}>{selectedProperty.apt_name}</Text>
//                 <Text style={styles.tagline1}>{selectedProperty.address}</Text>
//               </View>
//             </View>

//             {/* ----- Status Summary ----- */}
//             <View style={styles.statusSummary}>
//               <Text style={styles.summaryText}>
//                 Notified: <Text style={styles.summaryCount}>{statusCounts.notified}</Text>
//               </Text>
//               <Text style={styles.summaryText}>
//                 Pending: <Text style={styles.summaryCount}>{statusCounts.pending}</Text>
//               </Text>
//               <Text style={styles.summaryText}>
//                 Accepted: <Text style={styles.summaryCount}>{statusCounts.accepted}</Text>
//               </Text>
//               <Text style={styles.summaryText}>
//                 Declined: <Text style={styles.summaryCount}>{statusCounts.declined}</Text>
//               </Text>
//             </View>

//             {loading ? (
//               <View style={{ marginTop: 16 }}>
//                 {[...Array(5)].map((_, index) => (
//                   <CleanerCardSkeleton key={index} />
//                 ))}
//               </View>
//             ) : (
//               <FlatList
//                 data={cleaners}
//                 renderItem={renderCleanerItem}
//                 keyExtractor={item => item._id}
//                 ListEmptyComponent={
//                   <Text style={styles.emptyText}>{tSafe('no_available_cleaners', 'No available cleaners found')}</Text>
//                 }
//                 scrollEnabled={false}
//               />
//             )}
//           </Animated.View>
//         )}
//       </ScrollView>

//       {/* Footer Navigation – only shows when selection is made */}
//       {(currentStep === 1 && selectedProperty) || (currentStep === 2 && selectedSchedule) ? (
//         <TouchableOpacity
//           style={styles.nextButton}
//           onPress={handleStepNavigation}
//         >
//           <Text style={styles.buttonText}>
//             {currentStep === 1 ? tSafe('next_choose_schedule', 'Next: Choose Schedule') : tSafe('find_cleaners', 'Find Cleaners')}
//           </Text>
//           <Feather name="arrow-right" size={20} color="white" />
//         </TouchableOpacity>
//       ) : null}

//       <Modal 
//         visible={modalVisible}
//         animationType="slide" 
//       >
//         <NewBooking 
//           close_modal={handleCloseCreateBooking}
//           mode="create"
//         />
//       </Modal>
//     </View>
//   );
// };

// // ---------- Styles ----------
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.light,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: COLORS.white,
//     shadowColor: COLORS.dark,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 6,
//     elevation: 5,
//   },
//   stepIndicatorContainer: {
//     flexDirection: 'row',
//     flex: 1,
//     justifyContent: 'center',
//     gap: 8,
//   },
//   stepIndicator: {
//     width: 28,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: COLORS.lightGray,
//   },
//   activeStepIndicator: {
//     backgroundColor: COLORS.primary,
//   },
//   content: {
//     padding: 0,
//     marginTop:20
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: COLORS.dark,
//     marginHorizontal:15,
//     marginVertical:20
//   },
//   card: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 2,
//     borderColor: 'transparent',
//   },
//   selectedCard: {
//     borderColor: COLORS.primary,
//     backgroundColor: COLORS.primaryLight,
//   },
//   checkBadge: {
//     position: 'absolute',
//     top: -8,
//     right: -8,
//     backgroundColor: COLORS.primary,
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: COLORS.dark,
//     marginTop: 4,
//   },
//   cardSubtitle: {
//     fontSize: 14,
//     color: COLORS.gray,
//     marginTop: 4,
//   },
//   scheduleDetails: {
//     marginTop: 8,
//     flexDirection:'row'
//   },
//   nextButton: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 12,
//     padding: 16,
//     margin: 16,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 12,
//   },
//   buttonText: {
//     color: COLORS.white,
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   loadingContainer: {
//     padding: 32,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   loadingText: {
//     marginTop: 16,
//     color: COLORS.gray,
//   },
//   emptyText: {
//     textAlign: 'center',
//     color: COLORS.gray,
//     marginTop: 24,
//   },
//   location_calendar_block:{
//     flexDirection:'row',
//     justifyContent:'center',
//     height:60,
//     borderRadius:0,
//     borderWidth:0.5,
//     borderColor:COLORS.light_gray,
//     marginBottom:20
//   },
//   addre1:{
//     flex:0.8,
//     paddingHorizontal:10
//   },
//   calender:{
//     flex:0.2,
//     padding:10,
//     backgroundColor:COLORS.light_gray_1,
//     borderBottomLeftRadius:0,
//     borderTopLeftRadius:5,
//     alignItems:'center'
//   },
//   headline1: {
//     fontSize: 16,
//     fontWeight: '500',
//     marginBottom: 0,
//     marginTop:7,
//   },
//   tagline1: {
//       fontSize: 14,
//       color: '#555',
//       marginBottom: 16,
//   },
//   emptyState: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 32,
//   },
//   emptyText: {
//     marginTop: 16,
//     color: COLORS.gray,
//     textAlign: 'center',
//   },
//   room_type_container:{
//     flexDirection:'row',
//     justifyContent:'space-between',
//     alignItems:'center',
//     marginTop:10,
//     width:'100%'
//   },
//   activeChip: {
//     backgroundColor: COLORS.light_gray_1,
//     borderRadius:50
//   },
//   textChip: {
//     fontSize: 12,
//     fontWeight: '400',
//     color: COLORS.gray,
//   },
//   itemContent:{
//     flexDirection:'row',
//     alignItems:'center',
//   },
//   address:{
//     fontSize: 13,
//     color: '#555',
//   },
//   scheduleIcon: {
//     backgroundColor: COLORS.primary_light_1,
//     borderRadius: 8,
//     padding: 12,
//     marginRight: 16,
//   },
//   createScheduleButton:{
//     padding:10,
//     backgroundColor:COLORS.primary,
//     borderRadius:50,
//     marginTop:20
//   },
//   dateBadge: {
//     width: 70,
//     height: 70,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 16,
//   },
//   day: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: 'white',
//   },
//   month: {
//     fontSize: 14,
//     color: 'white',
//     textTransform: 'uppercase',
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 4,
//   },
//   infoText: {
//     marginLeft: 6,
//     fontSize: 14,
//     color: COLORS.gray,
//   },

//   // ----- Status Summary styles -----
//   statusSummary: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     padding: 12,
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     marginHorizontal: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   summaryText: {
//     fontSize: 14,
//     color: '#555',
//   },
//   summaryCount: {
//     fontWeight: '700',
//     color: '#1E1E2F',
//   },
// });

// export default FindCleaners;