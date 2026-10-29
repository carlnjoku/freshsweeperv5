import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from 'react';


import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import ROUTES from '../../constants/routes';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../theme';
import userService from '../../services/connection/userService';

const API_BASE_URL = 'https://www.freshsweeper.com/api';

const Notification = () => {
  const {
    currentUser,
    updateNotificationUnreadCount,
  } = useContext(AuthContext);

  const { theme, isDark } = useTheme();
  const navigation = useNavigation();

  console.log('NOTIFICATION SCREEN DEBUG:', {
    isDark,
    background: theme.background.default,
    surface: theme.surface.default,
    elevated: theme.surface.elevated,
    selected: theme.surface.selected,
    card: theme.card,
});

  const styles = useMemo(
    () => createStyles(theme),
    [theme]
  );

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  /*
   * ------------------------------------------------------------
   * HELPERS
   * ------------------------------------------------------------
   */

  const isUnread = useCallback((notification) => {
    return (
      notification?.status === 'sent' ||
      notification?.status === 'delivered'
    );
  }, []);

  const computeUnreadCount = useCallback(
    (list) => {
      return list.filter(isUnread).length;
    },
    [isUnread]
  );

  const getNotificationType = useCallback((notification) => {
    return (
      notification?.metadata?.status ||
      notification?.type ||
      'system_alert'
    );
  }, []);

  const getScreenParams = useCallback((notification) => {
    return notification?.metadata?.screen_params || {};
  }, []);

  /*
   * ------------------------------------------------------------
   * UNREAD COUNT
   * ------------------------------------------------------------
   */

  useEffect(() => {
    if (typeof updateNotificationUnreadCount === 'function') {
      updateNotificationUnreadCount(
        computeUnreadCount(notifications)
      );
    }
  }, [
    notifications,
    computeUnreadCount,
    updateNotificationUnreadCount,
  ]);

  /*
   * ------------------------------------------------------------
   * FETCH NOTIFICATIONS
   * ------------------------------------------------------------
   */

  const fetchNotifications = useCallback(
    async (showRefreshIndicator = false) => {
      if (!currentUser?._id || !currentUser?.userType) {
        setNotifications([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (showRefreshIndicator) {
        setRefreshing(true);
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/notifications/user/${currentUser._id}?userType=${encodeURIComponent(
            currentUser.userType
          )}&limit=50`
        );

        if (!response.ok) {
          throw new Error(
            `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();

        const normalizedNotifications = Array.isArray(data)
          ? data
          : Array.isArray(data?.notifications)
            ? data.notifications
            : [];

        setNotifications(normalizedNotifications);
      } catch (error) {
        console.error(
          'Error fetching notifications:',
          error
        );

        if (!showRefreshIndicator) {
          Alert.alert(
            'Unable to Load Notifications',
            'We could not load your notifications. Please try again.'
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentUser?._id, currentUser?.userType]
  );

  /*
   * ------------------------------------------------------------
   * MARK AS READ
   * ------------------------------------------------------------
   */

  const markAsRead = useCallback(async (notificationId) => {
    if (!notificationId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                status: 'read',
                readAt: new Date().toISOString(),
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        'Error marking notification as read:',
        error
      );
    }
  }, []);

  /*
   * ------------------------------------------------------------
   * MARK ALL AS READ
   * ------------------------------------------------------------
   */

  const markAllAsRead = useCallback(async () => {
    const unreadNotifications =
      notifications.filter(isUnread);

    if (unreadNotifications.length === 0) {
      return;
    }

    try {
      await Promise.all(
        unreadNotifications.map((notification) =>
          markAsRead(notification._id)
        )
      );
    } catch (error) {
      console.error(
        'Error marking all notifications as read:',
        error
      );
    }
  }, [notifications, isUnread, markAsRead]);

  /*
   * ------------------------------------------------------------
   * DELETE NOTIFICATION
   * ------------------------------------------------------------
   */

  const handleDelete = useCallback(async (notificationId) => {
    if (!notificationId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      setNotifications((previous) =>
        previous.filter(
          (notification) =>
            notification._id !== notificationId
        )
      );
    } catch (error) {
      console.error(
        'Error deleting notification:',
        error
      );

      Alert.alert(
        'Unable to Delete',
        'The notification could not be deleted. Please try again.'
      );
    }
  }, []);

  /*
   * ------------------------------------------------------------
   * NOTIFICATION NAVIGATION
   * ------------------------------------------------------------
   */

  const handleNotificationPress = useCallback(
    async (notification) => {
      if (!notification) return;

      const effectiveType =
        getNotificationType(notification);

      const metadata = notification.metadata || {};
      const screenParams = getScreenParams(notification);
      const notificationId = notification._id;

      const scheduleId =
        screenParams.scheduleId ||
        metadata.schedule_id;

      const bookingId =
        screenParams.bookingId ||
        metadata.bookingId;

      const paymentId =
        screenParams.paymentId ||
        metadata.paymentId;

      const propertyId =
        screenParams.propertyId ||
        metadata.propertyId;

      const supportTicketId =
        screenParams.supportTicketId ||
        metadata.supportTicketId;

      const chatId =
        screenParams.chatId ||
        metadata.chatId;

      const paymentIntentId =
        screenParams.paymentIntentId ||
        metadata.paymentIntentId;

      const requestId =
        screenParams.requestId ||
        metadata.requestId;

      /*
       * Mark read before navigating.
       */
      await markAsRead(notificationId);

      switch (effectiveType) {
        /*
         * ========================================================
         * CLEANING REQUESTS
         * ========================================================
         */

        case 'cleaning_request':
          if (currentUser?.userType === 'cleaner') {
            navigation.navigate(
              ROUTES.cleaner_schedule_review,
              {
                scheduleId,
                notificationId,
              }
            );
          } else {
            navigation.navigate(
              ROUTES.host_booking_status,
              {
                scheduleId: scheduleId || bookingId,
                notificationId,
              }
            );
          }
          break;

        /*
         * ========================================================
         * PAYMENTS
         * ========================================================
         */

        case 'payment_confirmed':
          navigation.navigate(
            ROUTES.host_receipt_details,
            {
              scheduleId: scheduleId || bookingId,
              payment_intent_id: paymentIntentId,
              notificationId,
            }
          );
          break;

        case 'payment_confirmed_cleaner':
          navigation.navigate(
            ROUTES.cleaner_schedule_details_view,
            {
              scheduleId,
              notificationId,
            }
          );
          break;

        case 'payment_received':
          if (currentUser?.userType === 'cleaner') {
            navigation.navigate(
              ROUTES.cleaner_earnings,
              {
                paymentId,
                notificationId,
              }
            );
          } else {
            navigation.navigate(
              ROUTES.host_payment_history,
              {
                paymentId,
                notificationId,
              }
            );
          }
          break;

        case 'payment_pending':
          navigation.navigate(
            ROUTES.payment_status,
            {
              paymentId,
              notificationId,
              status: 'pending',
            }
          );
          break;

        case 'payment_failed':
          navigation.navigate(
            ROUTES.payment_status,
            {
              paymentId,
              notificationId,
              status: 'failed',
            }
          );
          break;

        /*
         * ========================================================
         * SCHEDULE
         * ========================================================
         */

        case 'schedule_confirmed':
          navigation.navigate(
            ROUTES.host_booking_detail,
            {
              scheduleId: scheduleId || bookingId,
              notificationId,
            }
          );
          break;

        case 'cleaner_accepted_schedule':
          navigation.navigate(
            ROUTES.host_recommended_cleaners,
            {
              scheduleId,
              requestId,
            }
          );
          break;

        case 'cleaner_clocked_in':
          navigation.navigate(
            ROUTES.host_task_progress,
            {
              scheduleId,
              mode: 'in_progress',
              notificationId,
            }
          );
          break;

        case 'schedule_cancelled':
          navigation.navigate(
            ROUTES.host_cancellation_details,
            {
              scheduleId: scheduleId || bookingId,
              notificationId,
            }
          );
          break;

        case 'schedule_reminder':
          navigation.navigate(
            ROUTES.host_booking_detail,
            {
              scheduleId: scheduleId || bookingId,
              notificationId,
              isReminder: true,
            }
          );
          break;

        /*
         * ========================================================
         * CLEANING STATUS
         * ========================================================
         */

        case 'cleaning_started':
          navigation.navigate(
            ROUTES.cleaning_status,
            {
              scheduleId: scheduleId || bookingId,
              notificationId,
              status: 'started',
            }
          );
          break;

        case 'cleaning_completed':
          navigation.navigate(
            ROUTES.cleaning_status,
            {
              scheduleId: scheduleId || bookingId,
              notificationId,
              status: 'completed',
            }
          );
          break;

        case 'cleaning_delayed':
          navigation.navigate(
            ROUTES.cleaning_status,
            {
              scheduleId: scheduleId || bookingId,
              notificationId,
              status: 'delayed',
              delayReason: metadata?.delayReason,
            }
          );
          break;

        case 'cleaner_on_the_way':
          if (currentUser?.userType === 'host') {
            navigation.navigate(
              ROUTES.cleaner_tracking,
              {
                scheduleId: scheduleId || bookingId,
                notificationId,
                cleanerLocation:
                  metadata?.cleanerLocation,
              }
            );
          }
          break;

        /*
         * ========================================================
         * CLEANER INVITES
         * ========================================================
         */

        case 'platform_cleaner_invited':
          if (currentUser?.userType === 'cleaner') {
            navigation.navigate(
              ROUTES.cleaner_property_preview,
              {
                notificationId,
                propertyId,
              }
            );
          }
          break;

        /*
         * ========================================================
         * DATE CHANGE
         * ========================================================
         */

        case 'cleaner_date_change':
          if (currentUser?.userType === 'cleaner') {
            navigation.navigate(
              ROUTES.cleaner_schedule_date_change,
              {
                notificationId,
                propertyId,
                scheduleId,
                requestId,
                cleanerId:
                  screenParams.cleanerId ||
                  metadata.cleanerId,
                oldCleaningDate:
                  screenParams.oldCleaningDate,
                newCleaningDate:
                  screenParams.newCleaningDate,
                propertyName:
                  screenParams.propertyName,
                cleaningTime:
                  screenParams.cleaningTime,
                group: screenParams.group,
              }
            );
          }
          break;

        /*
         * ========================================================
         * MANUAL SCHEDULE CHANGE
         * ========================================================
         */

        case 'cleaner_manual_schedule_change':
          if (currentUser?.userType === 'cleaner') {
            navigation.navigate(
              ROUTES.cleaner_manual_schedule_date_change,
              {
                notificationId,
                propertyId,
                scheduleId,
                requestId,
                cleanerId:
                  screenParams.cleanerId ||
                  metadata.cleanerId,
                oldCleaningDate:
                  screenParams.oldCleaningDate,
                newCleaningDate:
                  screenParams.newCleaningDate,
                propertyName:
                  screenParams.propertyName,
                cleaningTime:
                  screenParams.cleaningTime,
                group: screenParams.group,
              }
            );
          }
          break;

        /*
         * ========================================================
         * REPLACEMENT CLEANER REQUEST
         * ========================================================
         */

        case 'replacement_cleaner_request':
          if (currentUser?.userType === 'cleaner') {
            navigation.navigate(
              ROUTES.cleaner_replacement_request,
              {
                notificationId,

                // IMPORTANT:
                // This is the CHILD replacement request ID.
                scheduleId:
                  screenParams.scheduleId ||
                  metadata.schedule_id,

                requestId:
                  screenParams.requestId,

                cleanerId:
                  screenParams.cleanerId,

                oldCleaningDate:
                  screenParams.oldCleaningDate,

                newCleaningDate:
                  screenParams.newCleaningDate,

                propertyName:
                  screenParams.propertyName,

                cleaningTime:
                  screenParams.cleaningTime,

                group:
                  screenParams.group,
              }
            );
          }
          break;

        /*
         * ========================================================
         * HOST REPLACEMENT REQUIRED
         * ========================================================
         */

        /*
          * ========================================================
          * HOST REPLACEMENT REQUIRED
          * ========================================================
          */

          case 'cleaner_unavailable_date_change': {
            if (currentUser?.userType !== 'host') {
              break;
            }

            const replacementScheduleId =
              screenParams.scheduleId ||
              metadata.schedule_id;

            const replacementRequestId =
              screenParams.requestId ||
              metadata.requestId;

            // Both IDs identify the existing parent replacement workflow.
            if (!replacementScheduleId || !replacementRequestId) {
              console.error(
                'Cannot open replacement workflow: missing IDs',
                {
                  scheduleId: replacementScheduleId,
                  requestId: replacementRequestId,
                }
              );

              Alert.alert(
                'Unable to Open Replacement',
                'The replacement workflow information is incomplete. Please refresh your notifications and try again.'
              );

              break;
            }

            try {
              /*
              * Check the existing workflow BEFORE deciding
              * which replacement screen to open.
              *
              * This is a read-only request. It does not submit
              * replacement requests or contact additional cleaners.
              */
              const response =
                await userService.getReplacementRequestStatus(
                  replacementScheduleId,
                  replacementRequestId
                );

              const workflow = response?.data || {};

              const existingRequests = Array.isArray(
                workflow.requests
              )
                ? workflow.requests
                : [];

              const requestCount =
                Number.isFinite(workflow.requestCount)
                  ? workflow.requestCount
                  : existingRequests.length;

              const replacementParams = {
                notificationId,

                scheduleId: replacementScheduleId,
                requestId: replacementRequestId,

                cleanerId:
                  screenParams.cleanerId ||
                  metadata.cleanerId,

                oldCleaningDate:
                  screenParams.oldCleaningDate ||
                  workflow.oldCleaningDate,

                newCleaningDate:
                  screenParams.newCleaningDate ||
                  workflow.newCleaningDate,

                propertyName:
                  screenParams.propertyName ||
                  workflow.propertyName,

                cleaningTime:
                  screenParams.cleaningTime ||
                  workflow.cleaningTime,

                group:
                  screenParams.group ||
                  workflow.group,
              };

              if (requestCount > 0) {
                /*
                * Requests already exist.
                *
                * Reopen the existing workflow. Never send the
                * host back to cleaner selection just because
                * they tapped the notification again.
                */
                console.log(
                  'Replacement requests already submitted. Opening existing status screen.',
                  {
                    scheduleId: replacementScheduleId,
                    requestId: replacementRequestId,
                    requestCount,
                  }
                );

                navigation.navigate(
                  ROUTES.host_replacement_request_status,
                  {
                    ...replacementParams,
                    source: 'notification_existing_workflow',
                    requests: existingRequests,
                    totalRequests: requestCount,
                  }
                );
              } else {
                /*
                * The workflow exists, but no replacement requests
                * have been submitted yet.
                *
                * The host can proceed to cleaner selection.
                */
                console.log(
                  'No replacement requests submitted yet. Opening cleaner selection.',
                  {
                    scheduleId: replacementScheduleId,
                    requestId: replacementRequestId,
                  }
                );

                navigation.navigate(
                  ROUTES.host_replacement_cleaner,
                  replacementParams
                );
              }
            } catch (error) {
              /*
              * IMPORTANT:
              *
              * Do not automatically open ReplacementCleaner
              * when this check fails. A network error or inactive
              * workflow must not be mistaken for zero requests.
              */
              console.error(
                'Failed to check existing replacement workflow:',
                error?.response?.data ||
                  error?.message ||
                  error
              );

              Alert.alert(
                'Unable to Check Replacement Status',
                error?.response?.data?.detail ||
                  'We could not verify whether replacement requests have already been submitted. Please try again.'
              );
            }

            break;
          }

        /*
         * ========================================================
         * SYSTEM
         * ========================================================
         */

        case 'system_alert':
          if (currentUser?.userType === 'cleaner') {
            navigation.navigate(
              ROUTES.cleaner_all_requests,
              {
                notificationId,
              }
            );
          } else {
            navigation.navigate(
              ROUTES.host_dashboard,
              {
                notificationId,
              }
            );
          }
          break;

        /*
         * ========================================================
         * INVENTORY
         * ========================================================
         */

        case 'inventory_low':
          navigation.navigate(
            ROUTES.host_inventory,
            {
              propertyId,
              notificationId,
            }
          );
          break;

        /*
         * ========================================================
         * DEFAULT
         * ========================================================
         */

        default:
          console.log(
            'Unknown notification type:',
            effectiveType
          );
          break;
      }
    },
    [
      currentUser,
      navigation,
      getNotificationType,
      getScreenParams,
      markAsRead,
    ]
  );

  /*
   * ------------------------------------------------------------
   * ICONS
   * ------------------------------------------------------------
   */

  const getNotificationIcon = useCallback(
    (notification) => {
      const effectiveType =
        getNotificationType(notification);

      const iconMap = {
        cleaning_request: 'calendar-plus',
        schedule_request: 'calendar-plus',
        schedule_confirmed: 'calendar-check',
        schedule_cancelled: 'calendar-remove',
        schedule_reminder: 'calendar-clock',
        schedule_modified: 'calendar-edit',
        schedule_rescheduled: 'calendar-sync',

        cleaning_started: 'play-circle',
        cleaning_completed: 'check-circle',
        cleaning_delayed: 'clock-alert',
        cleaner_on_the_way: 'map-marker-path',

        system_alert: 'alert-circle',

        payment_received: 'credit-card-check',
        payment_pending: 'clock-outline',
        payment_failed: 'credit-card-off',
        payment_refunded: 'cash-refund',

        rating_received: 'star',
        review_received: 'comment-text',

        account_verified: 'shield-check',
        profile_approved: 'account-check',
        document_expiring: 'file-alert',

        cleaner_clocked_in: 'clock-check',
        upcoming_schedule_reminder: 'clock-alert',
        cleaner_accepted_schedule: 'account-check',

        payment_confirmed: 'cash-check',
        payment_confirmed_cleaner: 'cash-check',
        payment_released: 'cash-fast',
        payment_reminder: 'clock-alert',
        automatic_payment_approved: 'robot',

        cleaner_finished_cleaning: 'check-circle',

        platform_cleaner_invited: 'home-search',
        cleaner_date_change: 'calendar-sync',
        cleaner_manual_schedule_change: 'calendar-edit',
        replacement_cleaner_request: 'account-switch',
        cleaner_unavailable_date_change: 'account-alert',

        inventory_low: 'package-variant',
      };

      return iconMap[effectiveType] || 'bell-outline';
    },
    [getNotificationType]
  );

  /*
   * ------------------------------------------------------------
   * SEMANTIC NOTIFICATION COLOR
   * ------------------------------------------------------------
   */

  const getNotificationColor = useCallback(
    (notification) => {
      const effectiveType =
        getNotificationType(notification);

      const colorMap = {
        cleaning_request: theme.status.warning,
        schedule_request: theme.status.warning,

        schedule_confirmed: theme.status.success,
        schedule_cancelled: theme.status.error,
        schedule_reminder: theme.status.info,
        schedule_modified: theme.status.warning,
        schedule_rescheduled: theme.brand.primary,

        cleaning_started: theme.status.info,
        cleaning_completed: theme.status.success,
        cleaning_delayed: theme.status.warning,
        cleaner_on_the_way: theme.brand.primary,

        system_alert: theme.status.error,

        payment_received: theme.status.success,
        payment_pending: theme.status.warning,
        payment_failed: theme.status.error,
        payment_refunded: theme.text.secondary,

        rating_received: theme.status.warning,
        review_received: theme.status.warning,

        account_verified: theme.status.success,
        profile_approved: theme.status.success,
        document_expiring: theme.status.warning,

        cleaner_clocked_in: theme.status.success,
        upcoming_schedule_reminder: theme.status.warning,
        cleaner_accepted_schedule: theme.status.success,

        payment_confirmed: theme.status.success,
        payment_confirmed_cleaner: theme.status.success,
        payment_released: theme.status.success,
        payment_reminder: theme.status.warning,
        automatic_payment_approved: theme.status.info,

        cleaner_finished_cleaning: theme.status.success,

        platform_cleaner_invited: theme.brand.primary,
        cleaner_date_change: theme.brand.primary,
        cleaner_manual_schedule_change: theme.brand.primary,

        replacement_cleaner_request: theme.status.warning,
        cleaner_unavailable_date_change: theme.status.warning,

        inventory_low: theme.status.warning,
      };

      return (
        colorMap[effectiveType] ||
        theme.icon.muted
      );
    },
    [getNotificationType, theme]
  );

  /*
   * ------------------------------------------------------------
   * ACTION LABEL
   * ------------------------------------------------------------
   */

  const getActionText = useCallback(
    (notification) => {
      const effectiveType =
        getNotificationType(notification);

      const actionMap = {
        cleaning_request:
          currentUser?.userType === 'cleaner'
            ? 'View Request'
            : 'View Status',

        schedule_confirmed: 'View Booking',
        schedule_cancelled: 'View Details',
        schedule_reminder: 'View Booking',
        schedule_modified: 'View Changes',
        schedule_rescheduled: 'View New Time',

        cleaning_started: 'View Progress',
        cleaning_completed: 'View Completion',
        cleaning_delayed: 'View Details',
        cleaner_on_the_way: 'Track Cleaner',

        system_alert: 'View Details',

        payment_received: 'View Details',
        payment_pending: 'View Status',
        payment_failed: 'Retry Payment',
        payment_refunded: 'View Refund',

        rating_received: 'View Rating',
        review_received: 'Read Review',

        account_verified: 'View Profile',
        profile_approved: 'View Profile',
        document_expiring: 'Update Documents',

        cleaner_clocked_in: 'Track Schedule',
        upcoming_schedule_reminder: 'View Details',
        cleaner_accepted_schedule: 'View Schedule',

        payment_confirmed: 'View Receipt',
        payment_confirmed_cleaner: 'View Payment',

        payment_released: 'View Earnings',
        payment_reminder: 'Make Payment',
        automatic_payment_approved: 'View Details',

        cleaner_finished_cleaning: 'View Completion',

        platform_cleaner_invited: 'View Property',
        cleaner_date_change: 'Review Change',
        cleaner_manual_schedule_change:
          'Review Change',

        replacement_cleaner_request:
          'Review Request',

        cleaner_unavailable_date_change:
          'Find Replacement',

        inventory_low: 'View Inventory',
      };

      return (
        actionMap[effectiveType] ||
        'View Details'
      );
    },
    [currentUser?.userType, getNotificationType]
  );

  /*
   * ------------------------------------------------------------
   * TIME
   * ------------------------------------------------------------
   */

  const formatTimeAgo = useCallback((dateString) => {
    if (!dateString) {
      return 'Recently';
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return 'Recently';
    }

    const now = new Date();
    const diffInSeconds = Math.max(
      0,
      Math.floor((now - date) / 1000)
    );

    if (diffInSeconds < 60) {
      return 'Just now';
    }

    if (diffInSeconds < 3600) {
      return `${Math.floor(
        diffInSeconds / 60
      )}m ago`;
    }

    if (diffInSeconds < 86400) {
      return `${Math.floor(
        diffInSeconds / 3600
      )}h ago`;
    }

    if (diffInSeconds < 604800) {
      return `${Math.floor(
        diffInSeconds / 86400
      )}d ago`;
    }

    return date.toLocaleDateString();
  }, []);

  /*
   * ------------------------------------------------------------
   * DELETE ACTION
   * ------------------------------------------------------------
   */

  const renderRightActions = useCallback(
    (notificationId) => (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.deleteButton}
        onPress={() => {
          Alert.alert(
            'Delete Notification',
            'Are you sure you want to delete this notification?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () =>
                  handleDelete(notificationId),
              },
            ]
          );
        }}
      >
        <MaterialCommunityIcons
          name="trash-can-outline"
          size={23}
          color={theme.icon.inverse}
        />

        <Text style={styles.deleteText}>
          Delete
        </Text>
      </TouchableOpacity>
    ),
    [
      handleDelete,
      styles.deleteButton,
      styles.deleteText,
      theme.icon.inverse,
    ]
  );

  /*
   * ------------------------------------------------------------
   * NOTIFICATION CARD
   * ------------------------------------------------------------
   */

  const renderItem = useCallback(
    ({ item }) => {
      const unread = isUnread(item);
      const notificationColor =
        getNotificationColor(item);

      const timestamp =
        item?.sentAt?.$date ||
        item?.createdAt?.$date ||
        item?.sentAt ||
        item?.createdAt;

      return (
        <Swipeable
          renderRightActions={() =>
            renderRightActions(item._id)
          }
          overshootRight={false}
        >
          <TouchableOpacity
            activeOpacity={0.82}
            style={[
              styles.notificationCard,
              unread && styles.unreadCard,
            ]}
            onPress={() =>
              handleNotificationPress(item)
            }
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    `${notificationColor}18`,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={getNotificationIcon(item)}
                size={24}
                color={notificationColor}
              />
            </View>

            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <Text
                  style={styles.title}
                  numberOfLines={1}
                >
                  {item?.title || 'Notification'}
                </Text>

                {unread && (
                  <View
                    style={[
                      styles.unreadBadge,
                      {
                        backgroundColor:
                          theme.brand.primary,
                      },
                    ]}
                  >
                    <Text
                      style={
                        styles.unreadBadgeText
                      }
                    >
                      NEW
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={styles.message}
                numberOfLines={3}
              >
                {item?.message ||
                  'You have a new notification.'}
              </Text>

              <View
                style={styles.notificationFooter}
              >
                <View style={styles.footerLeft}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={13}
                    color={theme.text.muted}
                  />

                  <Text style={styles.time}>
                    {formatTimeAgo(timestamp)}
                  </Text>
                </View>

                <View
                  style={styles.actionIndicator}
                >
                  <Text
                    style={styles.actionText}
                    numberOfLines={1}
                  >
                    {getActionText(item)}
                  </Text>

                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={17}
                    color={theme.brand.primary}
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Swipeable>
      );
    },
    [
      formatTimeAgo,
      getActionText,
      getNotificationColor,
      getNotificationIcon,
      handleNotificationPress,
      isUnread,
      renderRightActions,
      styles,
      theme,
    ]
  );

  /*
   * ------------------------------------------------------------
   * FILTER
   * ------------------------------------------------------------
   */

  const unreadCount = useMemo(
    () => computeUnreadCount(notifications),
    [notifications, computeUnreadCount]
  );

  const filteredNotifications = useMemo(() => {
    if (showUnreadOnly) {
      return notifications.filter(isUnread);
    }

    return notifications;
  }, [
    notifications,
    showUnreadOnly,
    isUnread,
  ]);

  /*
   * ------------------------------------------------------------
   * REFRESH
   * ------------------------------------------------------------
   */

  const onRefresh = useCallback(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  /*
   * ------------------------------------------------------------
   * SCREEN FOCUS
   * ------------------------------------------------------------
   */

  useFocusEffect(
    useCallback(() => {
      fetchNotifications(false);
    }, [fetchNotifications])
  );

  /*
   * ------------------------------------------------------------
   * LOADING
   * ------------------------------------------------------------
   */

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background.default}
        />
  
        <View style={styles.loadingIcon}>
          <MaterialCommunityIcons
            name="bell-outline"
            size={30}
            color={theme.brand.primary}
          />
        </View>
  
        <ActivityIndicator
          size="small"
          color={theme.brand.primary}
        />
  
        <Text style={styles.loadingText}>
          Loading notifications...
        </Text>
      </View>
    );
  }

  /*
   * ------------------------------------------------------------
   * MAIN SCREEN
   * ------------------------------------------------------------
   */

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background.default}
      />
      
      {/* <StatusBar
        barStyle={
          isDark
            ? 'light-content'
            : 'dark-content'
        }
        backgroundColor={
          theme.background.default
        }
      /> */}

      {/* ======================================================
          HEADER
          ====================================================== */}

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>
              Notifications
            </Text>

            <Text style={styles.headerSubtitle}>
              Stay up to date with your activity
            </Text>
          </View>

          <View
            style={[
              styles.headerCount,
              {
                backgroundColor:
                  unreadCount > 0
                    ? theme.brand.primary
                    : theme.surface.elevated,
                borderColor:
                  unreadCount > 0
                    ? theme.brand.primary
                    : theme.border.default,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="bell-outline"
              size={17}
              color={
                unreadCount > 0
                  ? theme.text.inverse
                  : theme.icon.muted
              }
            />

            <Text
              style={[
                styles.headerCountText,
                {
                  color:
                    unreadCount > 0
                      ? theme.text.inverse
                      : theme.text.secondary,
                },
              ]}
            >
              {unreadCount}
            </Text>
          </View>
        </View>

        {/* Filter / summary bar */}
        <View style={styles.controlsRow}>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {filteredNotifications.length}{' '}
              {filteredNotifications.length === 1
                ? 'notification'
                : 'notifications'}
            </Text>

            {unreadCount > 0 && (
              <View
                style={[
                  styles.unreadSummary,
                  {
                    backgroundColor:
                      theme.brand.primaryLight,
                  },
                ]}
              >
                <View
                  style={[
                    styles.summaryDot,
                    {
                      backgroundColor:
                        theme.brand.primary,
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.unreadSummaryText,
                    {
                      color:
                        theme.brand.primary,
                    },
                  ]}
                >
                  {unreadCount} unread
                </Text>
              </View>
            )}
          </View>

          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={markAllAsRead}
                style={styles.markAllButton}
              >
                <MaterialCommunityIcons
                  name="check-all"
                  size={17}
                  color={theme.brand.primary}
                />

                <Text
                  style={styles.markAllText}
                >
                  Mark all read
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                setShowUnreadOnly(
                  (previous) => !previous
                )
              }
              style={[
                styles.filterButton,
                showUnreadOnly &&
                  styles.filterButtonActive,
              ]}
            >
              <MaterialCommunityIcons
                name={
                  showUnreadOnly
                    ? 'filter'
                    : 'filter-outline'
                }
                size={18}
                color={
                  showUnreadOnly
                    ? theme.text.inverse
                    : theme.brand.primary
                }
              />

              <Text
                style={[
                  styles.filterText,
                  showUnreadOnly &&
                    styles.filterTextActive,
                ]}
              >
                {showUnreadOnly
                  ? 'Unread'
                  : 'All'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ======================================================
          LIST
          ====================================================== */}

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item, index) =>
          item?._id || `notification-${index}`
        }
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          filteredNotifications.length === 0 &&
            styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.brand.primary}
            colors={[theme.brand.primary]}
            progressBackgroundColor={
              theme.surface.elevated
            }
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconContainer,
                {
                  backgroundColor:
                    theme.brand.primaryLight,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={
                  showUnreadOnly
                    ? 'check-all'
                    : 'bell-off-outline'
                }
                size={42}
                color={theme.brand.primary}
              />
            </View>

            <Text style={styles.emptyText}>
              {showUnreadOnly
                ? 'You’re all caught up'
                : 'No notifications yet'}
            </Text>

            <Text style={styles.emptySubtext}>
              {showUnreadOnly
                ? 'There are no unread notifications right now.'
                : 'When something important happens, your notifications will appear here.'}
            </Text>

            {showUnreadOnly &&
              notifications.length > 0 && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.emptyAction}
                  onPress={() =>
                    setShowUnreadOnly(false)
                  }
                >
                  <Text
                    style={styles.emptyActionText}
                  >
                    View all notifications
                  </Text>

                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={17}
                    color={theme.button.primaryText}
                  />
                </TouchableOpacity>
              )}
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

/*
 * ================================================================
 * STYLES
 * ================================================================
 */

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.default,
    },

    centerContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background.default,
      paddingHorizontal: 24,
    },

    loadingIcon: {
      width: 62,
      height: 62,
      borderRadius: 31,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.brand.primaryLight,
      marginBottom: 16,
    },

    loadingText: {
      marginTop: 10,
      fontSize: 14,
      color: theme.text.secondary,
    },

    /*
     * ------------------------------------------------------------
     * HEADER
     * ------------------------------------------------------------
     */

    header: {
      backgroundColor: theme.surface.elevated,
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
    },

    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    titleContainer: {
      flex: 1,
      paddingRight: 16,
    },

    headerTitle: {
      fontSize: 25,
      lineHeight: 31,
      fontWeight: '800',
      letterSpacing: -0.5,
      color: theme.text.primary,
    },

    headerSubtitle: {
      marginTop: 3,
      fontSize: 13,
      lineHeight: 18,
      color: theme.text.secondary,
    },

    headerCount: {
      minWidth: 50,
      height: 36,
      paddingHorizontal: 10,
      borderRadius: 18,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
    },

    headerCountText: {
      fontSize: 13,
      fontWeight: '700',
    },

    /*
     * ------------------------------------------------------------
     * CONTROLS
     * ------------------------------------------------------------
     */

    controlsRow: {
      marginTop: 17,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    statsContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
    },

    statsText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.text.secondary,
    },

    unreadSummary: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
      gap: 5,
    },

    summaryDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },

    unreadSummaryText: {
      fontSize: 11,
      fontWeight: '700',
    },

    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    markAllButton: {
      height: 34,
      paddingHorizontal: 9,
      borderRadius: 17,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },

    markAllText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.brand.primary,
    },

    filterButton: {
      height: 34,
      paddingHorizontal: 11,
      borderRadius: 17,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      backgroundColor: theme.brand.primaryLight,
      borderWidth: 1,
      borderColor: theme.brand.primaryLight,
    },

    filterButtonActive: {
      backgroundColor: theme.brand.primary,
      borderColor: theme.brand.primary,
    },

    filterText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.brand.primary,
    },

    filterTextActive: {
      color: theme.text.inverse,
    },

    /*
     * ------------------------------------------------------------
     * LIST
     * ------------------------------------------------------------
     */

    listContent: {
      paddingTop: 10,
      paddingBottom: 28,
    },

    emptyListContent: {
      flexGrow: 1,
    },

    /*
     * ------------------------------------------------------------
     * NOTIFICATION CARD
     * ------------------------------------------------------------
     */

    notificationCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.card.background,
      marginHorizontal: 16,
      marginVertical: 5,
      padding: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.card.border,

      shadowColor: theme.shadow.color,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 8,

      elevation: 2,
    },

    unreadCard: {
      borderColor: theme.brand.primary,
      backgroundColor: theme.surface.selected,
    },

    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    notificationContent: {
      flex: 1,
      minWidth: 0,
    },

    notificationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
    },

    title: {
      flex: 1,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '700',
      color: theme.text.primary,
      paddingRight: 8,
    },

    unreadBadge: {
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 6,
    },

    unreadBadgeText: {
      fontSize: 8,
      fontWeight: '800',
      letterSpacing: 0.5,
      color: theme.text.inverse,
    },

    message: {
      fontSize: 13,
      lineHeight: 19,
      color: theme.text.secondary,
      marginBottom: 10,
    },

    notificationFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 22,
    },

    footerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
    },

    time: {
      fontSize: 11,
      color: theme.text.muted,
      marginLeft: 4,
    },

    actionIndicator: {
      maxWidth: '52%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginLeft: 8,
    },

    actionText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.brand.primary,
      marginRight: 2,
    },

    /*
     * ------------------------------------------------------------
     * DELETE
     * ------------------------------------------------------------
     */

    deleteButton: {
      width: 82,
      marginVertical: 5,
      marginRight: 16,
      borderRadius: 16,
      backgroundColor: theme.status.error,
      alignItems: 'center',
      justifyContent: 'center',
    },

    deleteText: {
      marginTop: 4,
      fontSize: 10,
      fontWeight: '700',
      color: theme.icon.inverse,
    },

    /*
     * ------------------------------------------------------------
     * EMPTY STATE
     * ------------------------------------------------------------
     */

    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      paddingTop: 40,
      paddingBottom: 60,
    },

    emptyIconContainer: {
      width: 86,
      height: 86,
      borderRadius: 43,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },

    emptyText: {
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '800',
      color: theme.text.primary,
      textAlign: 'center',
    },

    emptySubtext: {
      maxWidth: 330,
      marginTop: 8,
      fontSize: 14,
      lineHeight: 21,
      color: theme.text.secondary,
      textAlign: 'center',
    },

    emptyAction: {
      marginTop: 20,
      paddingHorizontal: 16,
      height: 42,
      borderRadius: 21,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      backgroundColor:
        theme.button.primaryBackground,
    },

    emptyActionText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.button.primaryText,
    },
  });

export default Notification;