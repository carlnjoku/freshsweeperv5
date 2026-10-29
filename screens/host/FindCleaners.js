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

  // Host team selection for the selected schedule.
  const [selectedCleanerIds, setSelectedCleanerIds] = useState([]);
  // Keeps the host's chosen group for cleaners whose recommendation
  // response does not include a group field.
  const [selectedCleanerGroupById, setSelectedCleanerGroupById] = useState({});

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


  const getCleanerGroup = useCallback((cleaner) => {
    const group =
      cleaner?.group ??
      cleaner?.requestGroup ??
      cleaner?.assignedGroup ??
      cleaner?.request?.group ??
      cleaner?.request_group ??
      null;

    return group == null || String(group).trim() === ''
      ? null
      : String(group);
  }, []);

  const groupLabel = useCallback((group) => {
    if (!group) return tSafe('unknown_group', 'Unknown group');

    const normalized = String(group)
      .replace(/^group[_-]?/i, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

    return `${tSafe('group', 'Group')} ${normalized}`;
  }, []);

  const scheduleAssignedTo = useMemo(() => {
    const assignedTo =
      selectedSchedule?.schedule?.assignedTo ??
      selectedSchedule?.assignedTo ??
      [];

    return Array.isArray(assignedTo) ? assignedTo : [];
  }, [selectedSchedule]);

  const requiredGroupCounts = useMemo(() => {
    return scheduleAssignedTo.reduce((counts, position) => {
      const group = position?.group;
      if (!group) return counts;
      counts[group] = (counts[group] || 0) + 1;
      return counts;
    }, {});
  }, [scheduleAssignedTo]);

  const requiredGroups = useMemo(
    () => Object.keys(requiredGroupCounts),
    [requiredGroupCounts]
  );

  const requiredCleaners = useMemo(
    () => requiredGroups.reduce(
      (total, group) => total + (requiredGroupCounts[group] || 0),
      0
    ),
    [requiredGroups, requiredGroupCounts]
  );


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

  const selectedGroupCounts = useMemo(() => {
    return selectedCleanerIds.reduce((counts, cleanerId) => {
      const cleaner = acceptedCleaners.find(
        (candidate) => getCleanerId(candidate) === cleanerId
      );
      const group = getCleanerGroup(cleaner) || selectedCleanerGroupById[cleanerId];
      if (!group) return counts;
      counts[group] = (counts[group] || 0) + 1;
      return counts;
    }, {});
  }, [selectedCleanerIds, acceptedCleaners, getCleanerId, getCleanerGroup, selectedCleanerGroupById]);

  const missingGroups = useMemo(() => requiredGroups
    .map((group) => {
      const required = requiredGroupCounts[group] || 0;
      const selected = selectedGroupCounts[group] || 0;
      return {
        group,
        required,
        selected,
        remaining: Math.max(0, required - selected),
      };
    })
    .filter((item) => item.remaining > 0),
  [requiredGroups, requiredGroupCounts, selectedGroupCounts]);

  const groupCompositionComplete = useMemo(() => {
    if (!requiredGroups.length) return false;
    return requiredGroups.every((group) =>
      (selectedGroupCounts[group] || 0) ===
      (requiredGroupCounts[group] || 0)
    );
  }, [requiredGroups, requiredGroupCounts, selectedGroupCounts]);


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
      setSelectedCleanerIds([]);
      setSelectedCleanerGroupById({});
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
      setSelectedCleanerIds([]);
      setSelectedCleanerGroupById({});
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
// Host cleaner selection and checkout validation
// ==================================================

const toggleCleaner = useCallback((cleaner) => {
  const cleanerId = getCleanerId(cleaner);
  if (!cleanerId || getCleanerStatus(cleaner) !== 'accepted') return;

  if (selectedCleanerIds.includes(cleanerId)) {
    setSelectedCleanerIds((current) => current.filter((id) => id !== cleanerId));
    setSelectedCleanerGroupById((current) => {
      const next = { ...current };
      delete next[cleanerId];
      return next;
    });
    return;
  }

  if (selectedCleanerIds.length >= requiredCleaners) return;

  // Some recommendation responses omit the group. In that case, assign
  // the cleaner to the first group that still has an open required position.
  const explicitGroup = getCleanerGroup(cleaner);
  const targetGroup = explicitGroup || requiredGroups.find((group) => {
    const requiredForGroup = requiredGroupCounts[group] || 0;
    const selectedForGroup = selectedGroupCounts[group] || 0;
    return requiredForGroup > selectedForGroup;
  });

  if (!targetGroup) {
    Alert.alert(
      tSafe('team_full', 'Team selection complete'),
      tSafe('all_group_positions_filled', 'All required group positions have already been filled.')
    );
    return;
  }

  const requiredForGroup = requiredGroupCounts[targetGroup] || 0;
  const selectedForGroup = selectedGroupCounts[targetGroup] || 0;
  if (!requiredForGroup || selectedForGroup >= requiredForGroup) {
    Alert.alert(
      tSafe('group_full', 'Group is full'),
      tSafe('choose_another_group_cleaner', 'This group already has all the cleaners it needs.')
    );
    return;
  }

  setSelectedCleanerGroupById((current) => ({ ...current, [cleanerId]: targetGroup }));
  setSelectedCleanerIds((current) => current.includes(cleanerId) ? current : [...current, cleanerId]);
}, [
  getCleanerId,
  getCleanerStatus,
  getCleanerGroup,
  selectedCleanerIds,
  selectedGroupCounts,
  requiredCleaners,
  requiredGroups,
  requiredGroupCounts,
]);

const proceedToCheckout = useCallback(() => {
  const openPositions = scheduleAssignedTo.filter((position) => !position?.cleanerId);

  if (
    !selectedSchedule?._id ||
    !scheduleAssignedTo.length ||
    selectedCleanerIds.length !== requiredCleaners ||
    !groupCompositionComplete ||
    openPositions.length !== selectedCleanerIds.length
  ) {
    return;
  }

  const selectedCleaners = selectedCleanerIds
    .map((id) => acceptedCleaners.find((candidate) => getCleanerId(candidate) === id))
    .filter(Boolean);

  if (selectedCleaners.length !== selectedCleanerIds.length) {
    Alert.alert(
      tSafe('selection_changed', 'Selection changed'),
      tSafe('please_reselect_cleaners', 'One or more selected cleaners are no longer available. Please review your selection.')
    );
    setSelectedCleanerIds((current) => current.filter((id) =>
      acceptedCleaners.some((candidate) => getCleanerId(candidate) === id)
    ));
    return;
  }

  const positionsByGroup = openPositions.reduce((groups, position) => {
    const group = position?.group;
    if (!group) return groups;
    if (!groups[group]) groups[group] = [];
    groups[group].push(position);
    return groups;
  }, {});

  const cleanersWithFee = [];
  for (const cleaner of selectedCleaners) {
    const cleanerId = getCleanerId(cleaner);
    const group = getCleanerGroup(cleaner) || selectedCleanerGroupById[cleanerId];
    const position = positionsByGroup[group]?.shift();
    if (!group || !position) {
      Alert.alert(
        tSafe('team_validation_failed', 'Team validation failed'),
        tSafe('selected_cleaner_group_mismatch', 'A selected cleaner does not match an available group position.')
      );
      return;
    }

    const checklist = position?.checklist || {};
    const calculatedPrice = Number(checklist.calculatedPrice ?? checklist.price ?? 0);
    cleanersWithFee.push({
      cleanerId: getCleanerId(cleaner),
      firstname: cleaner?.firstname || cleaner?.firstName || '',
      lastname: cleaner?.lastname || cleaner?.lastName || '',
      avatar: cleaner?.avatar || '',
      group,
      fee: calculatedPrice,
      price: Number(checklist.price ?? 0),
      calculatedPrice,
    });
  }

  const checkoutGroupCounts = cleanersWithFee.reduce((counts, cleaner) => {
    counts[cleaner.group] = (counts[cleaner.group] || 0) + 1;
    return counts;
  }, {});

  if (!requiredGroups.every((group) =>
    checkoutGroupCounts[group] === requiredGroupCounts[group]
  )) {
    return;
  }

  const totalFee = cleanersWithFee.reduce((sum, cleaner) => sum + Number(cleaner.fee || 0), 0);

  navigation?.navigate(ROUTES.host_group_checkout, {
    requestId: null,
    cleaning_fee: totalFee,
    scheduleId: String(selectedSchedule._id),
    schedule: {
      ...(selectedSchedule.schedule || selectedSchedule),
      assignedTo: scheduleAssignedTo,
    },
    selected_cleaners: selectedCleaners.map((cleaner) => ({
      _id: getCleanerId(cleaner),
      cleanerId: getCleanerId(cleaner),
      firstname: cleaner?.firstname || cleaner?.firstName || '',
      lastname: cleaner?.lastname || cleaner?.lastName || '',
      avatar: cleaner?.avatar || '',
      group: getCleanerGroup(cleaner) || selectedCleanerGroupById[getCleanerId(cleaner)],
    })),
    cleanerIds: selectedCleanerIds,
    cleanersWithFee,
    hostSelectionFlow: true,
  });
}, [
  navigation, selectedSchedule, scheduleAssignedTo, selectedCleanerIds,
  requiredCleaners, groupCompositionComplete, acceptedCleaners, getCleanerId,
  getCleanerGroup, requiredGroups, requiredGroupCounts, selectedCleanerGroupById,
]);

const renderCleanerItem = ({ item }) => {
  const cleanerId = getCleanerId(item);
  const status = getCleanerStatus(item);

  const normalizedCleaner = {
    ...item,
    _id: cleanerId,
    cleanerId,
    distanceFromApartment: getCleanerDistance(item),
  };

  const selected = selectedCleanerIds.includes(cleanerId);
  const group = getCleanerGroup(normalizedCleaner);
  const selectableGroup = group || requiredGroups.find((candidateGroup) =>
    (selectedGroupCounts[candidateGroup] || 0) < (requiredGroupCounts[candidateGroup] || 0)
  );
  const selectedForGroup = selectableGroup ? (selectedGroupCounts[selectableGroup] || 0) : 0;
  const requiredForGroup = selectableGroup ? (requiredGroupCounts[selectableGroup] || 0) : 0;
  const groupFull = Boolean(selectableGroup && selectedForGroup >= requiredForGroup);
  const cannotSelect = !selected && (
    !selectableGroup ||
    selectedCleanerIds.length >= requiredCleaners ||
    !requiredForGroup ||
    groupFull
  );

  return (
    <View style={styles.acceptedCleanerItem}>
      <CleanerCard
        item={normalizedCleaner}
        status={status}
        onPress={() => handleOpenCleanerProfile(normalizedCleaner)}
        preview_mode
      />
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ selected, disabled: cannotSelect }}
        activeOpacity={0.85}
        disabled={cannotSelect}
        onPress={() => toggleCleaner(normalizedCleaner)}
        style={[
          styles.selectCleanerButton,
          selected && styles.selectCleanerButtonSelected,
          cannotSelect && styles.selectCleanerButtonDisabled,
        ]}
      >
        <Feather
          name={selected ? 'check-circle' : 'plus-circle'}
          size={18}
          color={selected ? theme.surface.default : (cannotSelect ? theme.text.muted : theme.brand.primary)}
        />
        <AppText
          variant="label"
          color={selected ? theme.surface.default : (cannotSelect ? theme.text.muted : theme.brand.primary)}
        >
          {selected
            ? tSafe('selected', 'Selected')
            : groupFull
              ? `${groupLabel(group)} ${tSafe('already_filled', 'Already filled')}`
              : tSafe('select_cleaner', 'Select Cleaner')}
        </AppText>
      </TouchableOpacity>
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

            {/* Required cleaner count by group */}
            {requiredGroups.length > 0 && (
              <AppCard
                variant="default"
                padding="medium"
                radius="large"
                bordered
                style={styles.teamRequirementsCard}
              >
                <View style={styles.teamRequirementsHeader}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="title" color={theme.text.primary} weight="semibold">
                      {tSafe('team_requirements', 'Team requirements')}
                    </AppText>
                    <AppText variant="caption" color={theme.text.muted} style={{ marginTop: 4 }}>
                      {tSafe('group_requirement_description', 'Each required group must be filled before payment.')}
                    </AppText>
                  </View>
                  <View style={[styles.teamCompletionBadge, groupCompositionComplete && selectedCleanerIds.length === requiredCleaners ? styles.teamCompletionBadgeComplete : styles.teamCompletionBadgeIncomplete]}>
                    <Feather
                      name={groupCompositionComplete && selectedCleanerIds.length === requiredCleaners ? 'check-circle' : 'alert-circle'}
                      size={15}
                      color={groupCompositionComplete && selectedCleanerIds.length === requiredCleaners ? '#15803D' : '#B45309'}
                    />
                    <AppText variant="caption" color={groupCompositionComplete && selectedCleanerIds.length === requiredCleaners ? '#15803D' : '#B45309'}>
                      {groupCompositionComplete && selectedCleanerIds.length === requiredCleaners ? tSafe('complete', 'Complete') : tSafe('incomplete', 'Incomplete')}
                    </AppText>
                  </View>
                </View>
                {requiredGroups.map((group) => {
                  const required = requiredGroupCounts[group] || 0;
                  const selected = selectedGroupCounts[group] || 0;
                  const complete = selected === required;
                  return (
                    <View key={group} style={styles.teamRequirementRow}>
                      <View style={styles.teamRequirementGroup}>
                        <Feather name={complete ? 'check-circle' : 'circle'} size={17} color={complete ? '#15803D' : '#B45309'} />
                        <AppText variant="body" color={theme.text.primary} style={{ marginLeft: 9 }}>
                          {groupLabel(group)}
                        </AppText>
                      </View>
                      <AppText variant="bodyMedium" color={complete ? '#15803D' : theme.text.primary}>
                        {selected} / {required}
                      </AppText>
                    </View>
                  );
                })}
                <View style={styles.teamTotalRow}>
                  <AppText variant="bodyMedium" color={theme.text.primary}>
                    {tSafe('total', 'Total')}
                  </AppText>
                  <AppText variant="bodyMedium" color={selectedCleanerIds.length === requiredCleaners ? '#15803D' : theme.text.primary}>
                    {selectedCleanerIds.length} / {requiredCleaners}
                  </AppText>
                </View>
              </AppCard>
            )}

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

      {currentStep === 3 && selectedSchedule && (
        <View style={styles.checkoutFooter}>
          {!groupCompositionComplete || selectedCleanerIds.length !== requiredCleaners ? (
            <AppText variant="caption" color={theme.status.warning} style={styles.checkoutWarning}>
              {missingGroups.length > 0
                ? `${tSafe('still_needed', 'Still needed')}: ${missingGroups.map((item) => `${groupLabel(item.group)} (${item.remaining})`).join(', ')}`
                : !requiredGroups.length
                  ? tSafe('group_requirements_unavailable', 'Group requirements are unavailable. Refresh the schedule before continuing.')
                  : tSafe('complete_team_selection', 'Select all required cleaners to continue.')}
            </AppText>
          ) : null}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ disabled: !groupCompositionComplete || selectedCleanerIds.length !== requiredCleaners }}
            activeOpacity={0.85}
            disabled={!groupCompositionComplete || selectedCleanerIds.length !== requiredCleaners}
            onPress={proceedToCheckout}
            style={[
              styles.checkoutButton,
              (!groupCompositionComplete || selectedCleanerIds.length !== requiredCleaners) && styles.checkoutButtonDisabled,
            ]}
          >
            <AppText variant="bodyMedium" color={theme.surface.default} weight="semibold">
              {groupCompositionComplete && selectedCleanerIds.length === requiredCleaners
                ? tSafe('continue_to_payment', 'Proceed to Payment')
                : tSafe('complete_team_selection', 'Complete team selection to continue')}
            </AppText>
            {groupCompositionComplete && selectedCleanerIds.length === requiredCleaners ? (
              <Feather name="arrow-right" size={19} color={theme.surface.default} />
            ) : null}
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

    selectCleanerButton: {
      minHeight: 44,
      marginTop: 8,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.brand.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: theme.surface.default,
    },

    selectCleanerButtonSelected: {
      backgroundColor: theme.brand.primary,
      borderColor: theme.brand.primary,
    },

    selectCleanerButtonDisabled: {
      opacity: 0.55,
      borderColor: theme.divider,
      backgroundColor: theme.surface.elevated,
    },

    teamRequirementsCard: {
      marginHorizontal: 16,
      marginBottom: 16,
    },

    teamRequirementsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      gap: 12,
    },

    teamCompletionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 20,
    },

    teamCompletionBadgeComplete: {
      backgroundColor: '#DCFCE7',
    },

    teamCompletionBadgeIncomplete: {
      backgroundColor: '#FEF3C7',
    },

    teamRequirementRow: {
      minHeight: 38,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.divider,
    },

    teamRequirementGroup: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    teamTotalRow: {
      marginTop: 6,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },

    checkoutFooter: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 12,
      backgroundColor: theme.surface.default,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.divider,
    },

    checkoutWarning: {
      marginBottom: 8,
      lineHeight: 18,
    },

    checkoutButton: {
      minHeight: 52,
      borderRadius: 14,
      paddingHorizontal: 18,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
      backgroundColor: theme.brand.primary,
    },

    checkoutButtonDisabled: {
      backgroundColor: theme.text.muted,
      opacity: 0.65,
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
