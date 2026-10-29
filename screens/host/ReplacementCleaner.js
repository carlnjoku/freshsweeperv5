import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';

import {
  Button,
  Checkbox,
} from 'react-native-paper';

import {
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import moment from 'moment';

import userService from '../../services/connection/userService';
import ROUTES from '../../constants/routes';

import { useTheme } from '../../theme';
import { AppText, AppCard } from '../../ui';

const ReplacementCleaner = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);

  /*
   * =========================================================
   * ROUTE PARAMS
   * =========================================================
   */

  const {
    scheduleId,
    requestId,
    cleanerId,
  } = route?.params || {};

  /*
   * =========================================================
   * STATE
   * =========================================================
   */

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingRequests, setSendingRequests] = useState(false);

  const [candidates, setCandidates] = useState([]);
  const [scheduleDetails, setScheduleDetails] = useState(null);
  const [unavailableCleaner, setUnavailableCleaner] = useState(null);
  const [selectedCleaners, setSelectedCleaners] = useState([]);

  /*
   * Prevent duplicate initialization and stale requests.
   */

  const mountedRef = useRef(true);
  const initializationRef = useRef(false);
  const submissionRef = useRef(false);
  const workflowBlockedRef = useRef(false);

  /*
   * =========================================================
   * HELPERS
   * =========================================================
   */

  const getErrorMessage = (error, fallback) => {
    const detail = error?.response?.data?.detail;
    const message = error?.response?.data?.message;

    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }

    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    if (detail && typeof detail === 'object') {
      return detail.message || fallback;
    }

    return fallback;
  };

  const normalizeStatus = (status) =>
    String(status || '').trim().toLowerCase();

  const navigateToReplacementStatus = useCallback(
    (extraParams = {}) => {
      navigation.replace(
        ROUTES.host_replacement_request_status,
        {
          scheduleId: String(scheduleId),
          requestId: String(requestId),
          cleanerId,
          ...extraParams,
        }
      );
    },
    [
      navigation,
      scheduleId,
      requestId,
      cleanerId,
    ]
  );

  /*
   * =========================================================
   * FORMAT GROUP
   * =========================================================
   */

  const formatGroup = (group) => {
    if (!group) return '';

    return String(group)
      .split('_')
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(' ');
  };

  /*
   * =========================================================
   * FORMAT DATE
   * =========================================================
   */

  const formatDate = (date) => {
    if (!date) return '';

    // Avoid timezone shifting YYYY-MM-DD.
    if (
      typeof date === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      const [year, month, day] = date
        .split('-')
        .map(Number);

      return moment(
        new Date(year, month - 1, day)
      ).format('MMM D, YYYY');
    }

    const parsed = moment(date);

    return parsed.isValid()
      ? parsed.format('MMM D, YYYY')
      : '';
  };

  /*
   * =========================================================
   * FORMAT TIME
   * =========================================================
   */

  const formatTime = (time) => {
    if (!time) return '';

    const parsedTime = moment(
      time,
      ['HH:mm:ss', 'HH:mm', 'h:mm:ss A', 'h:mm A'],
      true
    );

    if (!parsedTime.isValid()) {
      return time;
    }

    return parsedTime.format('h:mm A');
  };

  /*
   * =========================================================
   * CLEANER HELPERS
   * =========================================================
   */

  const getInitials = (cleaner) => {
    const first =
      cleaner?.firstname?.charAt(0) || '';

    const last =
      cleaner?.lastname?.charAt(0) || '';

    if (first || last) {
      return `${first}${last}`.toUpperCase();
    }

    const name = cleaner?.name || '';

    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  const getCleanerId = (cleaner) =>
    String(
      cleaner?.cleanerId ||
      cleaner?._id ||
      ''
    );

  const getCleanerName = (cleaner) =>
    cleaner?.name ||
    `${cleaner?.firstname || ''} ${
      cleaner?.lastname || ''
    }`.trim() ||
    'Cleaner';

  const isAlreadyAssigned = (cleaner) =>
    cleaner?.alreadyAssigned === true;

  const getAssignedGroups = (cleaner) =>
    Array.isArray(cleaner?.assignedGroups)
      ? cleaner.assignedGroups
      : [];

  const formatAssignedGroups = (cleaner) => {
    const groups = getAssignedGroups(cleaner);

    if (groups.length === 0) {
      return 'another group';
    }

    return groups.map(formatGroup).join(', ');
  };

  /*
   * =========================================================
   * AUTHORITATIVE WORKFLOW STATUS
   * =========================================================
   *
   * Do not depend on getReplacementWorkflow() returning
   * response.data.workflow. The status endpoint returns
   * workflowStatus, replacementAssigned and other fields
   * directly in response.data.
   */

  const checkExistingReplacementWorkflow =
    useCallback(async () => {
      if (!scheduleId || !requestId) {
        return null;
      }

      const response =
        await userService.getReplacementRequestStatus(
          String(scheduleId),
          String(requestId)
        );

      const data = response?.data;

      if (
        !data ||
        data.status !== 'success'
      ) {
        throw new Error(
          'The server returned an invalid replacement status response.'
        );
      }

      console.log(
        '[ReplacementCleaner] Authoritative workflow status:',
        {
          scheduleId,
          requestId,
          workflowStatus: data.workflowStatus,
          replacementAssigned: data.replacementAssigned,
          canSelectCleaner: data.canSelectCleaner,
          requestCount: data.requestCount,
        }
      );

      return data;
    }, [
      scheduleId,
      requestId,
    ]);

  /*
   * =========================================================
   * FETCH REPLACEMENT CANDIDATES
   * =========================================================
   */

  const fetchReplacementCleaners = useCallback(
    async () => {
      if (!scheduleId || !requestId) {
        Alert.alert(
          'Missing Information',
          'The replacement request information is missing. Please reopen the replacement workflow.'
        );

        setCandidates([]);
        setLoading(false);
        setRefreshing(false);

        return false;
      }

      try {
        console.log(
          '[ReplacementCleaner] Fetching candidates:',
          {
            scheduleId,
            requestId,
            cleanerId,
          }
        );

        const response =
          await userService.getReplacementCleaners(
            String(scheduleId),
            String(requestId)
          );

        const data = response?.data || {};

        console.log(
          '[ReplacementCleaner] Candidate response:',
          {
            status: data?.status,
            source: data?.source,
            flow: data?.flow,
            workflowStatus: data?.workflowStatus,
            candidateCount: data?.candidateCount,
          }
        );

        /*
         * The candidate endpoint may also reject stale
         * workflows. Never treat an unsuccessful response
         * as an empty successful result.
         */

        if (
          response?.status >= 400 ||
          data?.status === 'error'
        ) {
          throw new Error(
            data?.detail ||
            data?.message ||
            'Unable to load replacement candidates.'
          );
        }

        const fetchedCandidates = Array.isArray(
          data?.candidates
        )
          ? data.candidates
          : [];

        if (!mountedRef.current) {
          return false;
        }

        setCandidates(fetchedCandidates);

        setUnavailableCleaner(
          data?.unavailableCleaner || null
        );

        setScheduleDetails({
          scheduleId:
            data?.scheduleId || scheduleId,

          requestId:
            data?.requestId || requestId,

          source:
            data?.source || 'manual_schedule_change',

          flow:
            data?.flow || 'replacement_event',

          workflowStatus:
            data?.workflowStatus || 'replacement_required',

          group:
            data?.group,

          oldCleaningDate:
            data?.oldCleaningDate,

          newCleaningDate:
            data?.newCleaningDate,

          oldCleaningTime:
            data?.oldCleaningTime,

          newCleaningTime:
            data?.newCleaningTime,

          cleaningTime:
            data?.cleaningTime,

          cleaningEndTime:
            data?.cleaningEndTime,

          propertyName:
            data?.propertyName,
        });

        setSelectedCleaners([]);

        return true;
      } catch (error) {
        console.error(
          '[ReplacementCleaner] Failed to load candidates:',
          error?.response?.data ||
            error?.message ||
            error
        );

        if (mountedRef.current) {
          setCandidates([]);

          Alert.alert(
            'Unable to Load Cleaners',
            getErrorMessage(
              error,
              'Unable to load replacement cleaners. Please try again.'
            )
          );
        }

        return false;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [
      scheduleId,
      requestId,
      cleanerId,
    ]
  );

  /*
   * =========================================================
   * INITIALIZE REPLACEMENT FLOW
   * =========================================================
   */

  const initializeReplacementFlow = useCallback(
    async () => {
      if (initializationRef.current) {
        return;
      }

      initializationRef.current = true;
      workflowBlockedRef.current = false;

      setLoading(true);
      setCandidates([]);
      setSelectedCleaners([]);

      console.log(
        '[ReplacementCleaner] Initializing replacement flow:',
        {
          scheduleId,
          requestId,
          cleanerId,
        }
      );

      try {
        if (!scheduleId || !requestId) {
          setLoading(false);

          Alert.alert(
            'Missing Information',
            'The replacement request information is missing. Please reopen the replacement workflow.',
            [
              {
                text: 'Go Back',
                onPress: () => navigation.goBack(),
              },
            ]
          );

          return;
        }

        /*
         * Always check the authoritative endpoint first.
         *
         * A failed status lookup must not cause the app to
         * assume that the workflow is new and load candidates.
         */

        const workflow =
          await checkExistingReplacementWorkflow();

        if (!mountedRef.current) {
          return;
        }

        if (!workflow) {
          setLoading(false);

          Alert.alert(
            'Replacement Unavailable',
            'The replacement workflow could not be found. Please return to your schedule and try again.',
            [
              {
                text: 'Go Back',
                onPress: () => navigation.goBack(),
              },
            ]
          );

          return;
        }

        const workflowStatus = normalizeStatus(
          workflow.workflowStatus
        );

        const replacementAssigned =
          workflow.replacementAssigned === true;

        const workflowSource =
          workflow.source ||
          'manual_schedule_change';

        const statusParams = {
          source: workflowSource,
          group: workflow.group,

          oldCleaningDate:
            workflow.oldCleaningDate ||
            workflow.old_cleaning_date,

          newCleaningDate:
            workflow.newCleaningDate ||
            workflow.new_cleaning_date,

          oldCleaningTime:
            workflow.oldCleaningTime ||
            workflow.old_cleaning_time,

          newCleaningTime:
            workflow.newCleaningTime ||
            workflow.new_cleaning_time,

          cleaningTime:
            workflow.newCleaningTime ||
            workflow.new_cleaning_time ||
            workflow.cleaningTime ||
            workflow.cleaning_time,

          propertyName:
            workflow.propertyName ||
            workflow.property_name,
        };

        console.log(
          '[ReplacementCleaner] Evaluating workflow:',
          {
            workflowStatus,
            replacementAssigned,
            canSelectCleaner: workflow.canSelectCleaner,
          }
        );

        /*
         * RULE 1:
         * A completed workflow or an assigned replacement
         * must never reopen candidate selection.
         */

        if (
          workflowStatus === 'completed' ||
          replacementAssigned
        ) {
          workflowBlockedRef.current = true;

          setCandidates([]);
          setSelectedCleaners([]);
          setLoading(false);

          Alert.alert(
            'Replacement Already Completed',
            'A replacement cleaner has already been assigned, or this replacement workflow has been completed.',
            [
              {
                text: 'View Status',
                onPress: () => {
                  navigateToReplacementStatus(
                    statusParams
                  );
                },
              },
              {
                text: 'Go Back',
                style: 'cancel',
                onPress: () => navigation.goBack(),
              },
            ],
            { cancelable: false }
          );

          return;
        }

        /*
         * RULE 2:
         * Requests have already been sent. The host should
         * manage responses on the status screen, not send
         * another batch from the candidate-selection screen.
         */

        const statusScreenStates = [
          'waiting_for_cleaners',
          'cleaner_available',
          'payment_required',
        ];

        if (
          statusScreenStates.includes(workflowStatus)
        ) {
          workflowBlockedRef.current = true;

          setCandidates([]);
          setSelectedCleaners([]);
          setLoading(false);

          navigateToReplacementStatus(
            statusParams
          );

          return;
        }

        /*
         * RULE 3:
         * Only replacement_required opens candidate selection.
         *
         * Do not gate this screen on canSelectCleaner. That
         * field can refer to choosing an accepted replacement,
         * whereas this screen selects cleaners to invite.
         */

        if (
          workflowStatus !== 'replacement_required'
        ) {
          workflowBlockedRef.current = true;

          setCandidates([]);
          setSelectedCleaners([]);
          setLoading(false);

          Alert.alert(
            'Replacement Unavailable',
            `Candidate selection is not available for the current workflow status: ${
              workflowStatus || 'unknown'
            }.`,
            [
              {
                text: 'View Status',
                onPress: () => {
                  navigateToReplacementStatus(
                    statusParams
                  );
                },
              },
              {
                text: 'Go Back',
                style: 'cancel',
                onPress: () => navigation.goBack(),
              },
            ],
            { cancelable: false }
          );

          return;
        }

        /*
         * RULE 4:
         * The backend confirms that the workflow still requires
         * replacement requests. Fetch the candidates.
         */

        await fetchReplacementCleaners();
      } catch (error) {
        console.error(
          '[ReplacementCleaner] Initialization failed:',
          error?.response?.data ||
            error?.message ||
            error
        );

        if (mountedRef.current) {
          setCandidates([]);
          setSelectedCleaners([]);
          setLoading(false);

          Alert.alert(
            'Unable to Verify Replacement',
            getErrorMessage(
              error,
              'We could not verify the replacement status. Please try again.'
            ),
            [
              {
                text: 'Go Back',
                style: 'cancel',
                onPress: () => navigation.goBack(),
              },
              {
                text: 'Retry',
                onPress: () => {
                  initializationRef.current = false;
                  initializeReplacementFlow();
                },
              },
            ]
          );
        }
      } finally {
        initializationRef.current = false;
      }
    },
    [
      scheduleId,
      requestId,
      cleanerId,
      navigation,
      checkExistingReplacementWorkflow,
      fetchReplacementCleaners,
      navigateToReplacementStatus,
    ]
  );

  /*
   * =========================================================
   * INITIAL LOAD AND CLEANUP
   * =========================================================
   */

  useEffect(() => {
    mountedRef.current = true;

    initializeReplacementFlow();

    return () => {
      mountedRef.current = false;
    };
  }, [initializeReplacementFlow]);

  /*
   * =========================================================
   * REFRESH
   * =========================================================
   *
   * Recheck workflow status before fetching candidates.
   * Refresh must not bypass the completed-workflow guard.
   */

  const handleRefresh = async () => {
    if (
      refreshing ||
      loading ||
      sendingRequests ||
      workflowBlockedRef.current
    ) {
      return;
    }

    setRefreshing(true);

    try {
      const workflow =
        await checkExistingReplacementWorkflow();

      if (!mountedRef.current) {
        return;
      }

      const workflowStatus = normalizeStatus(
        workflow?.workflowStatus
      );

      if (
        !workflow ||
        workflowStatus !== 'replacement_required' ||
        workflow.replacementAssigned === true
      ) {
        workflowBlockedRef.current = true;

        setCandidates([]);
        setSelectedCleaners([]);
        setRefreshing(false);

        Alert.alert(
          'Replacement No Longer Available',
          'This replacement workflow has changed. You will be redirected to its current status.',
          [
            {
              text: 'View Status',
              onPress: () => {
                navigateToReplacementStatus();
              },
            },
          ],
          { cancelable: false }
        );

        return;
      }

      await fetchReplacementCleaners();
    } catch (error) {
      console.error(
        '[ReplacementCleaner] Refresh failed:',
        error?.response?.data ||
          error?.message ||
          error
      );

      if (mountedRef.current) {
        setRefreshing(false);

        Alert.alert(
          'Refresh Failed',
          getErrorMessage(
            error,
            'Unable to refresh replacement cleaners. Please try again.'
          )
        );
      }
    }
  };

  /*
   * =========================================================
   * TOGGLE CLEANER
   * =========================================================
   */

  const handleToggleCleaner = (cleaner) => {
    if (
      sendingRequests ||
      workflowBlockedRef.current
    ) {
      return;
    }

    const id = getCleanerId(cleaner);

    if (!id) return;

    const alreadySelected =
      selectedCleaners.includes(id);

    if (alreadySelected) {
      setSelectedCleaners((previous) =>
        previous.filter(
          (cleanerIdValue) => cleanerIdValue !== id
        )
      );

      return;
    }

    if (isAlreadyAssigned(cleaner)) {
      const assignedGroups =
        formatAssignedGroups(cleaner);

      const cleanerName =
        getCleanerName(cleaner);

      Alert.alert(
        'Cleaner Already Assigned',
        `${cleanerName} is already assigned to ${assignedGroups} for this cleaning.\n\nYou can still select this cleaner if you want them to handle this replacement as well.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Select Cleaner',
            onPress: () => {
              if (
                workflowBlockedRef.current ||
                submissionRef.current
              ) {
                return;
              }

              setSelectedCleaners((previous) => {
                if (previous.includes(id)) {
                  return previous;
                }

                return [...previous, id];
              });
            },
          },
        ]
      );

      return;
    }

    setSelectedCleaners((previous) => [
      ...previous,
      id,
    ]);
  };

  const isCleanerSelected = (cleaner) =>
    selectedCleaners.includes(
      getCleanerId(cleaner)
    );

  /*
   * =========================================================
   * SEND REPLACEMENT REQUESTS
   * =========================================================
   */

  const handleSendReplacementRequests = () => {
    if (
      sendingRequests ||
      workflowBlockedRef.current
    ) {
      return;
    }

    if (!scheduleId || !requestId) {
      Alert.alert(
        'Missing Information',
        'The replacement request information is missing.'
      );

      return;
    }

    if (selectedCleaners.length === 0) {
      Alert.alert(
        'Select Cleaners',
        'Please select at least one cleaner.'
      );

      return;
    }

    const alreadyAssignedSelected =
      candidates.filter((cleaner) => {
        const id = getCleanerId(cleaner);

        return (
          selectedCleaners.includes(id) &&
          cleaner?.alreadyAssigned === true
        );
      });

    if (alreadyAssignedSelected.length > 0) {
      const names = alreadyAssignedSelected
        .map(getCleanerName)
        .join(', ');

      Alert.alert(
        'Already Assigned Cleaner',
        `${names} ${
          alreadyAssignedSelected.length === 1
            ? 'is'
            : 'are'
        } already assigned to another group for this cleaning.\n\nYou are intentionally requesting ${
          alreadyAssignedSelected.length === 1
            ? 'this cleaner'
            : 'these cleaners'
        } as a replacement as well.\n\nDo you want to continue?`,
        [
          {
            text: 'Go Back',
            style: 'cancel',
          },
          {
            text: 'Continue',
            onPress: submitReplacementRequests,
          },
        ]
      );

      return;
    }

    Alert.alert(
      'Send Replacement Requests',
      `Send requests to ${selectedCleaners.length} selected cleaner${
        selectedCleaners.length === 1 ? '' : 's'
      }?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send Requests',
          onPress: submitReplacementRequests,
        },
      ]
    );
  };

  /*
   * =========================================================
   * SUBMIT REQUESTS
   * =========================================================
   *
   * Verify the workflow immediately before submission.
   * This protects against the screen becoming stale while
   * the host is choosing cleaners.
   */

  const submitReplacementRequests = async () => {
    if (
      submissionRef.current ||
      sendingRequests ||
      workflowBlockedRef.current
    ) {
      return;
    }

    submissionRef.current = true;

    try {
      setSendingRequests(true);

      const workflow =
        await checkExistingReplacementWorkflow();

      if (!mountedRef.current) {
        return;
      }

      const workflowStatus = normalizeStatus(
        workflow?.workflowStatus
      );

      if (
        !workflow ||
        workflowStatus !== 'replacement_required' ||
        workflow.replacementAssigned === true
      ) {
        workflowBlockedRef.current = true;

        setCandidates([]);
        setSelectedCleaners([]);

        Alert.alert(
          'Replacement No Longer Available',
          'This replacement workflow has already changed or a replacement cleaner has been assigned. No new requests will be sent.',
          [
            {
              text: 'View Status',
              onPress: () => {
                navigateToReplacementStatus();
              },
            },
          ],
          { cancelable: false }
        );

        return;
      }

      console.log(
        '[ReplacementCleaner] Submitting replacement requests:',
        {
          scheduleId,
          requestId,
          source: scheduleDetails?.source,
          group: scheduleDetails?.group,
          cleanerIds: selectedCleaners,
        }
      );

      const response =
        await userService.sendReplacementRequests({
          scheduleId,
          requestId,
          cleanerIds: selectedCleaners,
        });

      const data = response?.data || {};

      console.log(
        '[ReplacementCleaner] Submission response:',
        {
          status: data?.status,
          source: data?.source,
          requestCount: data?.requestCount,
          createdCount:
            data?.createdRequests?.length || 0,
          existingCount:
            data?.existingRequests?.length || 0,
        }
      );

      const createdRequests =
        Array.isArray(data?.createdRequests)
          ? data.createdRequests
          : [];

      const existingRequests =
        Array.isArray(data?.existingRequests)
          ? data.existingRequests
          : [];

      const skippedRequests =
        Array.isArray(data?.skippedRequests)
          ? data.skippedRequests
          : [];

      const totalRequests =
        createdRequests.length +
        existingRequests.length;

      if (totalRequests === 0) {
        Alert.alert(
          'No Requests Created',
          'The server did not return any created or existing replacement requests.'
        );

        return;
      }

      setSelectedCleaners([]);

      navigateToReplacementStatus({
        source:
          data?.source ||
          scheduleDetails?.source ||
          'manual_schedule_change',

        group:
          data?.group ||
          scheduleDetails?.group,

        oldCleaningDate:
          data?.oldCleaningDate ||
          scheduleDetails?.oldCleaningDate,

        newCleaningDate:
          data?.newCleaningDate ||
          scheduleDetails?.newCleaningDate,

        oldCleaningTime:
          data?.oldCleaningTime ||
          scheduleDetails?.oldCleaningTime,

        newCleaningTime:
          data?.newCleaningTime ||
          scheduleDetails?.newCleaningTime,

        cleaningTime:
          data?.cleaningTime ||
          scheduleDetails?.cleaningTime,

        propertyName:
          data?.propertyName ||
          scheduleDetails?.propertyName,

        createdRequests,
        existingRequests,
        skippedRequests,
        totalRequests,
      });
    } catch (error) {
      console.error(
        '[ReplacementCleaner] Failed to send requests:',
        error?.response?.data ||
          error?.message ||
          error
      );

      const statusCode = error?.response?.status;

      if (statusCode === 409) {
        workflowBlockedRef.current = true;

        setCandidates([]);
        setSelectedCleaners([]);

        Alert.alert(
          'Replacement Already Updated',
          'The server reports that this replacement workflow has already been completed or changed. No additional replacement requests were submitted.',
          [
            {
              text: 'View Status',
              onPress: () => {
                navigateToReplacementStatus();
              },
            },
            {
              text: 'Go Back',
              style: 'cancel',
              onPress: () => navigation.goBack(),
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          'Unable to Send Requests',
          getErrorMessage(
            error,
            'Unable to send replacement requests. Please try again.'
          )
        );
      }
    } finally {
      submissionRef.current = false;

      if (mountedRef.current) {
        setSendingRequests(false);
      }
    }
  };

  /*
   * =========================================================
   * RENDER CLEANER
   * =========================================================
   */

  const renderCleaner = ({ item }) => {
    const isSelected =
      isCleanerSelected(item);

    const alreadyAssigned =
      isAlreadyAssigned(item);

    const assignedGroups =
      getAssignedGroups(item);

    const cleanerName =
      getCleanerName(item);

    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => handleToggleCleaner(item)}
        disabled={
          sendingRequests ||
          workflowBlockedRef.current
        }
        accessibilityRole="button"
        accessibilityState={{
          selected: isSelected,
          disabled:
            sendingRequests ||
            workflowBlockedRef.current,
        }}
      >
        <View
          style={[
            styles.cleanerCard,
            isSelected && styles.cleanerCardSelected,
            alreadyAssigned &&
              styles.cleanerCardAlreadyAssigned,
          ]}
        >
          <View style={styles.checkboxContainer}>
            <Checkbox
              status={
                isSelected ? 'checked' : 'unchecked'
              }
              onPress={() => handleToggleCleaner(item)}
              color={theme.brand.primary}
              uncheckedColor={theme.icon.muted}
              disabled={
                sendingRequests ||
                workflowBlockedRef.current
              }
            />
          </View>

          <View
            style={[
              styles.avatar,
              isSelected && styles.avatarSelected,
            ]}
          >
            <AppText
              variant="bodyMedium"
              color={
                isSelected
                  ? theme.brand.primary
                  : theme.text.secondary
              }
              style={styles.avatarText}
            >
              {getInitials(item)}
            </AppText>
          </View>

          <View style={styles.cleanerInfo}>
            <AppText
              variant="bodyMedium"
              style={styles.cleanerName}
              numberOfLines={1}
            >
              {cleanerName}
            </AppText>

            <AppText
              variant="caption"
              color={theme.text.secondary}
              style={styles.distance}
            >
              {item?.distance != null
                ? `${item.distance} mi away`
                : 'Available cleaner'}
            </AppText>

            {item?.rating != null && (
              <View style={styles.ratingRow}>
                <MaterialCommunityIcons
                  name="star"
                  size={14}
                  color={theme.status.warning}
                />

                <AppText
                  variant="caption"
                  color={theme.text.secondary}
                  style={styles.rating}
                >
                  {item.rating}
                </AppText>
              </View>
            )}

            {alreadyAssigned && (
              <View style={styles.alreadyAssignedInfo}>
                <AppText
                  variant="caption"
                  color={theme.status.warning}
                  weight="700"
                >
                  Already assigned
                </AppText>

                <AppText
                  variant="caption"
                  color={theme.text.secondary}
                  style={styles.alreadyAssignedText}
                >
                  {assignedGroups.length > 0
                    ? `Assigned to ${assignedGroups
                        .map(formatGroup)
                        .join(', ')}`
                    : 'Already assigned to another group'}
                </AppText>
              </View>
            )}
          </View>

          <View style={styles.badgeColumn}>
            {alreadyAssigned && (
              <View style={styles.alreadyAssignedBadge}>
                <AppText
                  variant="caption"
                  color={theme.status.warning}
                  style={styles.badgeText}
                >
                  Assigned
                </AppText>
              </View>
            )}

            {isSelected && (
              <View style={styles.selectedBadge}>
                <AppText
                  variant="caption"
                  color={theme.brand.primary}
                  style={styles.badgeText}
                >
                  Selected
                </AppText>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          backgroundColor={theme.background.default}
          barStyle={
            isDark ? 'light-content' : 'dark-content'
          }
        />

        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.brand.primary}
          />

          <AppText
            variant="title"
            style={styles.loadingTitle}
          >
            Finding replacement cleaners
          </AppText>

          <AppText
            variant="body"
            color={theme.text.secondary}
            align="center"
            style={styles.loadingSubtitle}
          >
            Checking cleaners available for this
            replacement assignment...
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * =========================================================
   * MAIN UI
   * =========================================================
   */

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.background.default}
        barStyle={
          isDark ? 'light-content' : 'dark-content'
        }
      />

      <FlatList
        data={candidates}
        keyExtractor={(item, index) =>
          getCleanerId(item) || String(index)
        }
        renderItem={renderCleaner}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Page header */}
            <View style={styles.header}>
              <AppText
                variant="heading"
                style={styles.title}
              >
                Find a Replacement
              </AppText>

              <AppText
                variant="body"
                color={theme.text.secondary}
                style={styles.subtitle}
              >
                Select cleaners you'd like to invite to this
                replacement assignment.
              </AppText>
            </View>

            {/* Schedule hero */}
            <AppCard
              variant="default"
              padding="medium"
              radius="large"
              elevated
              style={styles.scheduleHero}
            >
              <View style={styles.scheduleHeroRow}>
                <View style={styles.scheduleIcon}>
                  <MaterialCommunityIcons
                    name="calendar-refresh"
                    size={27}
                    color={theme.brand.primary}
                  />
                </View>

                <View style={styles.scheduleHeroContent}>
                  <AppText
                    variant="title"
                    style={styles.propertyName}
                    numberOfLines={1}
                  >
                    {scheduleDetails?.propertyName ||
                      'Property'}
                  </AppText>

                  {!!scheduleDetails?.group && (
                    <AppText
                      variant="caption"
                      color={theme.text.secondary}
                      style={styles.scheduleGroup}
                    >
                      {formatGroup(scheduleDetails.group)}
                    </AppText>
                  )}

                  <View style={styles.scheduleMeta}>
                    <View style={styles.metaItem}>
                      <AppText
                        variant="caption"
                        color={theme.text.muted}
                        style={styles.metaLabel}
                      >
                        CLEANING DATE
                      </AppText>

                      <AppText
                        variant="bodyMedium"
                        style={styles.metaValue}
                      >
                        {formatDate(
                          scheduleDetails?.newCleaningDate
                        ) || 'Not specified'}
                      </AppText>
                    </View>

                    <View style={styles.metaDivider} />

                    <View style={styles.metaItem}>
                      <AppText
                        variant="caption"
                        color={theme.text.muted}
                        style={styles.metaLabel}
                      >
                        TIME
                      </AppText>

                      <AppText
                        variant="bodyMedium"
                        style={styles.metaValue}
                      >
                        {formatTime(
                          scheduleDetails?.cleaningTime
                        ) || 'Not specified'}
                      </AppText>
                    </View>
                  </View>
                </View>
              </View>
            </AppCard>

            {/* Date comparison */}
            <View style={styles.dateChange}>
              <View style={styles.dateColumn}>
                <AppText
                  variant="caption"
                  color={theme.text.muted}
                  style={styles.dateLabel}
                >
                  ORIGINAL
                </AppText>

                <AppText
                  variant="bodyMedium"
                  color={theme.text.secondary}
                  style={styles.oldDate}
                >
                  {formatDate(
                    scheduleDetails?.oldCleaningDate
                  ) || 'Not specified'}
                </AppText>
              </View>

              <MaterialCommunityIcons
                name="arrow-right"
                size={22}
                color={theme.icon.muted}
              />

              <View style={styles.dateColumn}>
                <AppText
                  variant="caption"
                  color={theme.text.muted}
                  style={styles.dateLabel}
                >
                  UPDATED
                </AppText>

                <AppText
                  variant="bodyMedium"
                  color={theme.status.success}
                  style={styles.updatedDate}
                >
                  {formatDate(
                    scheduleDetails?.newCleaningDate
                  ) || 'Not specified'}
                </AppText>
              </View>
            </View>

            {/* Unavailable cleaner */}
            {unavailableCleaner && (
              <View style={styles.unavailableBanner}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={27}
                  color={theme.status.warning}
                />

                <View style={styles.warningContent}>
                  <AppText
                    variant="bodyMedium"
                    color={theme.status.warning}
                    style={styles.warningTitle}
                  >
                    {scheduleDetails?.source === 'host_removal'
                      ? 'Cleaner removed'
                      : 'Cleaner unavailable'}
                  </AppText>

                  <AppText
                    variant="body"
                    color={theme.text.secondary}
                    style={styles.warningText}
                  >
                    {scheduleDetails?.source === 'host_removal'
                      ? `${getCleanerName(unavailableCleaner)} has been removed from this assignment. Select replacement cleaners to fill the open position.`
                      : `${getCleanerName(unavailableCleaner)} declined the updated cleaning date.`}
                  </AppText>
                </View>
              </View>
            )}

            {/* Selection heading */}
            <View style={styles.selectionHeader}>
              <View style={styles.selectionHeaderText}>
                <AppText
                  variant="title"
                  style={styles.selectionTitle}
                >
                  Available Cleaners
                </AppText>

                <AppText
                  variant="caption"
                  color={theme.text.secondary}
                  style={styles.selectionSubtitle}
                >
                  Select multiple cleaners
                </AppText>
              </View>

              <View style={styles.selectionCount}>
                <AppText
                  variant="title"
                  color={theme.brand.primary}
                >
                  {selectedCleaners.length}
                </AppText>

                <AppText
                  variant="caption"
                  color={theme.text.secondary}
                  style={styles.selectionCountLabel}
                >
                  SELECTED
                </AppText>
              </View>
            </View>

            {/* Instruction */}
            <View style={styles.instruction}>
              <MaterialCommunityIcons
                name="information-outline"
                size={21}
                color={theme.status.info}
              />

              <AppText
                variant="body"
                color={theme.text.secondary}
                style={styles.instructionText}
              >
                Select multiple cleaners. Each selected cleaner
                will receive a replacement request.
              </AppText>
            </View>

            {/* Already assigned explanation */}
            {candidates.some(
              (cleaner) =>
                cleaner?.alreadyAssigned === true
            ) && (
              <View style={styles.alreadyAssignedNotice}>
                <MaterialCommunityIcons
                  name="alert-outline"
                  size={25}
                  color={theme.status.warning}
                />

                <View style={styles.alreadyAssignedNoticeContent}>
                  <AppText
                    variant="bodyMedium"
                    color={theme.status.warning}
                  >
                    Already assigned cleaners
                  </AppText>

                  <AppText
                    variant="body"
                    color={theme.text.secondary}
                    style={styles.alreadyAssignedNoticeText}
                  >
                    Some cleaners may already be assigned to
                    another group for this cleaning. You may
                    still select them if they are your
                    preferred replacement.
                  </AppText>
                </View>
              </View>
            )}
          </View>
        }
        ListFooterComponent={
          candidates.length > 0 ? (
            <View style={styles.footer}>
              <Button
                mode="contained"
                onPress={handleSendReplacementRequests}
                disabled={
                  selectedCleaners.length === 0 ||
                  sendingRequests ||
                  workflowBlockedRef.current
                }
                loading={sendingRequests}
                buttonColor={
                  theme.button.primaryBackground
                }
                textColor={
                  theme.button.primaryText
                }
                contentStyle={styles.sendButtonContent}
                style={styles.sendButton}
                icon={
                  sendingRequests
                    ? undefined
                    : 'send'
                }
                accessibilityLabel="Send replacement requests"
              >
                {sendingRequests
                  ? 'Sending Requests...'
                  : selectedCleaners.length > 0
                    ? `Send ${selectedCleaners.length} Request${
                        selectedCleaners.length === 1
                          ? ''
                          : 's'
                      }`
                    : 'Select Cleaners'}
              </Button>

              <AppText
                variant="caption"
                color={theme.text.muted}
                align="center"
                style={styles.footerText}
              >
                Cleaners can accept or decline the request.
                You will choose the replacement after they
                respond.
              </AppText>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons
                  name="account-search-outline"
                  size={34}
                  color={theme.icon.muted}
                />
              </View>

              <AppText
                variant="title"
                align="center"
                style={styles.emptyStateTitle}
              >
                No replacement cleaners found
              </AppText>

              <AppText
                variant="body"
                color={theme.text.secondary}
                align="center"
                style={styles.emptyStateText}
              >
                There are currently no cleaners available for
                this replacement assignment.
              </AppText>

              <Button
                mode="outlined"
                onPress={handleRefresh}
                disabled={
                  refreshing ||
                  sendingRequests ||
                  workflowBlockedRef.current
                }
                textColor={theme.brand.primary}
                style={styles.retryButton}
              >
                Try Again
              </Button>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

/*
 * =========================================================
 * THEME-AWARE STYLES
 * =========================================================
 */

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    listContent: {
      paddingBottom: 30,
      flexGrow: 1,
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },

    loadingTitle: {
      marginTop: 18,
      textAlign: 'center',
    },

    loadingSubtitle: {
      marginTop: 7,
      lineHeight: 20,
      textAlign: 'center',
    },

    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 18,
    },

    title: {
      letterSpacing: -0.4,
    },

    subtitle: {
      marginTop: 6,
      lineHeight: 20,
    },

    scheduleHero: {
      marginHorizontal: 16,
      marginBottom: 0,
    },

    scheduleHeroRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },

    scheduleIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor: theme.brand.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
    },

    scheduleHeroContent: {
      flex: 1,
      marginLeft: 13,
      minWidth: 0,
    },

    propertyName: {
      flexShrink: 1,
    },

    scheduleGroup: {
      marginTop: 3,
    },

    scheduleMeta: {
      flexDirection: 'row',
      marginTop: 15,
      alignItems: 'center',
    },

    metaItem: {
      flex: 1,
      minWidth: 0,
    },

    metaLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.7,
    },

    metaValue: {
      marginTop: 4,
    },

    metaDivider: {
      width: 1,
      height: 30,
      backgroundColor: theme.divider,
      marginHorizontal: 12,
    },

    dateChange: {
      marginHorizontal: 16,
      marginTop: 10,
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderRadius: 16,
      backgroundColor: theme.surface.default,
      borderWidth: 1,
      borderColor: theme.border.default,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-evenly',
    },

    dateColumn: {
      flex: 1,
      alignItems: 'center',
    },

    dateLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.7,
    },

    oldDate: {
      marginTop: 4,
      textAlign: 'center',
    },

    updatedDate: {
      marginTop: 4,
      textAlign: 'center',
    },

    unavailableBanner: {
      marginHorizontal: 16,
      marginTop: 12,
      padding: 14,
      borderRadius: 14,
      backgroundColor: theme.surface.default,
      borderWidth: 1,
      borderColor: theme.status.warning,
      flexDirection: 'row',
      alignItems: 'flex-start',
    },

    warningContent: {
      flex: 1,
      marginLeft: 10,
    },

    warningTitle: {
      fontWeight: '700',
    },

    warningText: {
      marginTop: 4,
      lineHeight: 19,
    },

    selectionHeader: {
      marginHorizontal: 16,
      marginTop: 25,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    selectionHeaderText: {
      flex: 1,
    },

    selectionTitle: {
      fontWeight: '700',
    },

    selectionSubtitle: {
      marginTop: 3,
    },

    selectionCount: {
      minWidth: 65,
      paddingVertical: 7,
      paddingHorizontal: 10,
      borderRadius: 12,
      backgroundColor: theme.surface.selected,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    selectionCountLabel: {
      marginTop: 1,
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 0.5,
    },

    instruction: {
      marginHorizontal: 16,
      marginBottom: 10,
      padding: 12,
      borderRadius: 12,
      backgroundColor: theme.surface.default,
      borderWidth: 1,
      borderColor: theme.border.default,
      flexDirection: 'row',
      alignItems: 'center',
    },

    instructionText: {
      flex: 1,
      marginLeft: 9,
      lineHeight: 18,
    },

    alreadyAssignedNotice: {
      marginHorizontal: 16,
      marginBottom: 14,
      padding: 13,
      borderRadius: 14,
      backgroundColor: theme.surface.default,
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderWidth: 1,
      borderColor: theme.status.warning,
    },

    alreadyAssignedNoticeContent: {
      flex: 1,
      marginLeft: 9,
    },

    alreadyAssignedNoticeText: {
      marginTop: 4,
      lineHeight: 18,
    },

    cleanerCard: {
      marginHorizontal: 16,
      marginBottom: 10,
      padding: 13,
      borderRadius: 17,
      backgroundColor: theme.card.background,
      borderWidth: 1,
      borderColor: theme.card.border,
      flexDirection: 'row',
      alignItems: 'center',

      shadowColor: theme.shadow.color,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 6,

      elevation: 1,
    },

    cleanerCardSelected: {
      borderWidth: 2,
      borderColor: theme.brand.primary,
      backgroundColor: theme.surface.selected,
      padding: 12,
    },

    cleanerCardAlreadyAssigned: {
      borderColor: theme.status.warning,
    },

    checkboxContainer: {
      marginLeft: -4,
      marginRight: 2,
    },

    avatar: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor:
        theme.surface.sunken || theme.background.sunken,
      justifyContent: 'center',
      alignItems: 'center',
    },

    avatarSelected: {
      backgroundColor: theme.brand.primaryLight,
    },

    avatarText: {
      fontWeight: '700',
    },

    cleanerInfo: {
      flex: 1,
      marginLeft: 11,
      minWidth: 0,
    },

    cleanerName: {
      fontWeight: '700',
    },

    distance: {
      marginTop: 4,
    },

    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },

    rating: {
      marginLeft: 3,
    },

    alreadyAssignedInfo: {
      marginTop: 7,
      paddingVertical: 6,
      paddingHorizontal: 8,
      borderRadius: 8,
      backgroundColor: theme.surface.default,
      borderWidth: 1,
      borderColor: theme.status.warning,
    },

    alreadyAssignedText: {
      marginTop: 3,
      lineHeight: 15,
    },

    badgeColumn: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      marginLeft: 8,
    },

    alreadyAssignedBadge: {
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: theme.surface.default,
      borderWidth: 1,
      borderColor: theme.status.warning,
      marginBottom: 5,
    },

    selectedBadge: {
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor: theme.brand.primaryLight,
    },

    badgeText: {
      fontSize: 10,
      fontWeight: '700',
    },

    footer: {
      paddingHorizontal: 16,
      marginTop: 10,
    },

    sendButton: {
      borderRadius: 14,
    },

    sendButtonContent: {
      height: 54,
    },

    footerText: {
      marginTop: 10,
      paddingHorizontal: 15,
      lineHeight: 17,
    },

    emptyState: {
      marginHorizontal: 16,
      marginTop: 20,
      marginBottom: 20,
      padding: 25,
      borderRadius: 16,
      backgroundColor: theme.card.background,
      borderWidth: 1,
      borderColor: theme.card.border,
      alignItems: 'center',
    },

    emptyIcon: {
      width: 60,
      height: 60,
      borderRadius: 20,
      backgroundColor: theme.surface.default,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },

    emptyStateTitle: {
      fontWeight: '700',
      textAlign: 'center',
    },

    emptyStateText: {
      marginTop: 7,
      lineHeight: 19,
      textAlign: 'center',
    },

    retryButton: {
      marginTop: 18,
      borderColor: theme.border.strong,
    },
  });

export default ReplacementCleaner;
