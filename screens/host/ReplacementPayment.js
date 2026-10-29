import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Button,
  Card,
  Checkbox,
  Divider,
} from 'react-native-paper';

import {
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';

import { AuthContext } from '../../context/AuthContext';

import userService from '../../services/connection/userService';

import { tSafe } from '../../utils/tSafe';

import { useTheme } from '../../theme';

import StripeGroupPaymentButton from '../../components/shared/StripeGroupPaymentButton';

import ROUTES from '../../constants/routes';
import CustomCheckbox from '../../components/shared/CustomCheckbox';

/* -------------------------------------------------------------------------- */
/*                                   Tokens                                   */
/* -------------------------------------------------------------------------- */

const S = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

const R = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
};

/* -------------------------------------------------------------------------- */
/*                              Helper functions                              */
/* -------------------------------------------------------------------------- */

const unwrapResponse = (response) => {
  return response?.data ?? response ?? {};
};

const getIdentifier = (value) => {
  if (value == null) {
    return '';
  }

  if (typeof value === 'object') {
    return String(
      value._id ??
      value.id ??
      value.$oid ??
      ''
    );
  }

  return String(value);
};

const normalizeStatus = (value) => {
  return String(value ?? '')
    .trim()
    .toLowerCase();
};

/**
 * Converts API values into safe display strings.
 *
 * This prevents React Native from attempting to render objects directly
 * inside Text components.
 */
const getDisplayMessage = (value, fallback = '') => {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'boolean'
  ) {
    return fallback;
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    const result = String(value).trim();

    return result || fallback;
  }

  if (Array.isArray(value)) {
    const messages = value
      .map((item) => getDisplayMessage(item, ''))
      .filter(Boolean);

    return messages.join(', ') || fallback;
  }

  if (typeof value === 'object') {
    const candidates = [
      value.message,
      value.detail,
      value.error?.message,
      typeof value.error === 'string'
        ? value.error
        : null,
      value.data?.message,
      value.data?.detail,
    ];

    for (const candidate of candidates) {
      if (
        typeof candidate === 'string' &&
        candidate.trim()
      ) {
        return candidate.trim();
      }
    }

    const firstName =
      value.firstname ||
      value.firstName ||
      '';

    const lastName =
      value.lastname ||
      value.lastName ||
      '';

    const fullName =
      `${firstName} ${lastName}`.trim();

    if (fullName) {
      return fullName;
    }

    if (
      typeof value.name === 'string' &&
      value.name.trim()
    ) {
      return value.name.trim();
    }

    if (
      typeof value.group === 'string' &&
      value.group.trim()
    ) {
      return value.group.trim();
    }

    if (
      typeof value._id === 'string'
    ) {
      return value._id;
    }

    if (
      typeof value.id === 'string'
    ) {
      return value.id;
    }

    return fallback;
  }

  return fallback;
};

/**
 * Resolves a Stripe customer ID without converting arbitrary objects
 * into strings such as "[object Object]".
 */
const getStripeCustomerId = (value) => {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value !== 'object') {
    return '';
  }

  const candidates = [
    value.stripe_customer_id,
    value.stripeCustomerId,
    value.customer_id,
    value.customerId,
  ];

  for (const candidate of candidates) {
    if (
      typeof candidate === 'string' &&
      candidate.trim()
    ) {
      return candidate.trim();
    }
  }

  /*
   * Only accept a generic "id" when it looks like a Stripe customer ID.
   * This avoids accidentally treating a MongoDB user ID as a Stripe ID.
   */
  if (
    typeof value.id === 'string' &&
    value.id.startsWith('cus_')
  ) {
    return value.id.trim();
  }

  return '';
};

const formatGroupName = (value) => {
  const groupName = getDisplayMessage(value, '');

  if (!groupName) {
    return '';
  }

  return groupName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
};

const getWorkflowList = (response) => {
  const data = unwrapResponse(response);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.workflows)) {
    return data.workflows;
  }

  if (Array.isArray(data.data?.workflows)) {
    return data.data.workflows;
  }

  return [];
};

const isWorkflowCompleted = (workflow) => {
  if (!workflow) {
    return false;
  }

  const status = normalizeStatus(
    workflow.status
  );

  return (
    status === 'completed' ||
    workflow.replacementAssigned === true ||
    workflow.replacement_assigned === true
  );
};

const getPaymentSource = (payment) => {
  return normalizeStatus(
    payment?.source ??
    payment?.replacementSource ??
    payment?.replacement_source ??
    ''
  );
};

const getHostAdditionalCharge = (payment) => {
  const amount =
    payment?.hostAdditionalCharge ??
    payment?.host_additional_charge ??
    payment?.totalDue ??
    payment?.total_due;

  if (
    amount === undefined ||
    amount === null ||
    amount === ''
  ) {
    return null;
  }

  const parsed = Number(amount);

  return Number.isFinite(parsed)
    ? parsed
    : null;
};

/* -------------------------------------------------------------------------- */
/*                             ReplacementPayment                             */
/* -------------------------------------------------------------------------- */

const ReplacementPayment = () => {
  const navigation = useNavigation();

  const route = useRoute();

  const {
    currentUser,
  } = useContext(AuthContext);

  const {
    theme,
    isDark,
  } = useTheme();

  const styles = createStyles(theme);

  /* ------------------------------ route params ----------------------------- */

  const {
    scheduleId,

    // Parent replacement workflow/request ID.
    requestId,

    // Individual replacement request ID.
    replacementRequestId,

    cleanerId,
    cleanerName,

    replacedCleanerId,
    replacedCleanerName,

    oldCleaningDate,
    newCleaningDate,
    cleaningTime,
    propertyName,
    group,
  } = route.params || {};

  /* ------------------------- Stripe customer details ----------------------- */

  /*
   * Resolve the customer ID without throwing during render.
   *
   * A missing customer ID should only prevent a payment from starting.
   * It must not crash the replacement screen when no payment is required.
   */
  const customerId =
    getStripeCustomerId(
      currentUser?.stripeCustomerId
    ) ||
    getStripeCustomerId(
      currentUser?.stripe_customer_id
    ) ||
    getStripeCustomerId(
      currentUser?.stripe_customer
    ) ||
    getStripeCustomerId(
      currentUser?.stripe?.customerId
    ) ||
    getStripeCustomerId(
      currentUser?.customerId
    );

  const receiptEmail =
    getDisplayMessage(
      currentUser?.stripe_customer?.email ||
      currentUser?.email,
      ''
    ) || null;

  /* --------------------------------- state --------------------------------- */

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    paymentLoading,
    setPaymentLoading,
  ] = useState(false);

  const [
    paymentProcessing,
    setPaymentProcessing,
  ] = useState(false);

  const [
    replacementCompleted,
    setReplacementCompleted,
  ] = useState(false);

  const [
    paymentDetails,
    setPaymentDetails,
  ] = useState(null);

  const [
    acceptedPolicy,
    setAcceptedPolicy,
  ] = useState(false);

  const [
    clientSecret,
    setClientSecret,
  ] = useState(null);

  const [
    paymentIntentId,
    setPaymentIntentId,
  ] = useState(null);

  const [
    screenError,
    setScreenError,
  ] = useState(null);

  const [
    workflowCheckFailed,
    setWorkflowCheckFailed,
  ] = useState(false);

  const mountedRef = useRef(true);

  const redirectingRef = useRef(false);

  const pollingRef = useRef(false);

  const paymentStartingRef = useRef(false);

  /* ---------------------------- mounted status ----------------------------- */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* -------------------------- dashboard navigation ------------------------- */

  const navigateToHostDashboard = useCallback(() => {
    if (redirectingRef.current) {
      return;
    }

    const targetRoutes = [
      ROUTES.host_home_drawer,
      ROUTES.host_dashboard,
    ].filter(Boolean);

    console.log(
      '[Dashboard Redirect] Starting navigation.'
    );

    let currentNavigation = navigation;

    let level = 0;

    while (currentNavigation) {
      const state =
        currentNavigation.getState?.();

      const routeNames =
        state?.routeNames || [];

      console.log(
        `[Dashboard Redirect] Navigator level ${level}:`,
        routeNames
      );

      const dashboardRoute =
        targetRoutes.find((routeName) =>
          routeNames.includes(routeName)
        );

      if (dashboardRoute) {
        console.log(
          '[Dashboard Redirect] Found route:',
          dashboardRoute,
          'at navigator level:',
          level
        );

        try {
          redirectingRef.current = true;

          currentNavigation.reset({
            index: 0,
            routes: [
              {
                name: dashboardRoute,
              },
            ],
          });

          return;
        } catch (error) {
          redirectingRef.current = false;

          console.error(
            '[Dashboard Redirect] Reset failed:',
            error
          );
        }
      }

      currentNavigation =
        currentNavigation.getParent?.();

      level += 1;
    }

    console.error(
      '[Dashboard Redirect] Neither dashboard route was found.'
    );

    Alert.alert(
      tSafe(
        'navigation_error',
        'Navigation Error'
      ),
      tSafe(
        'dashboard_navigation_failed',
        'The replacement is complete, but automatic dashboard navigation failed.'
      )
    );
  }, [navigation]);

  /* -------------------------- workflow verification ------------------------ */

  const getCompletedWorkflow = useCallback(async () => {
    if (!scheduleId || !requestId) {
      return null;
    }

    const response =
      await userService.getReplacementWorkflows(
        String(scheduleId)
      );

    const workflows =
      getWorkflowList(response);

    const targetRequestId =
      getIdentifier(requestId);

    const workflow = workflows.find((item) => {
      const possibleIds = [
        item?.requestId,
        item?.request_id,
        item?.parentRequestId,
        item?.parent_request_id,
        item?.replacementParentId,
        item?.replacement_parent_id,
        item?._id,
        item?.id,
      ].map(getIdentifier);

      return possibleIds.includes(
        targetRequestId
      );
    });

    return workflow || null;
  }, [
    scheduleId,
    requestId,
  ]);

  const checkReplacementWorkflow = useCallback(async () => {
    try {
      const workflow =
        await getCompletedWorkflow();

      if (!workflow) {
        return false;
      }

      if (!isWorkflowCompleted(workflow)) {
        return false;
      }

      console.log(
        'Replacement workflow is already completed:',
        {
          scheduleId,
          requestId,
          status: workflow.status,
          replacementAssigned:
            workflow.replacementAssigned ??
            workflow.replacement_assigned,
        }
      );

      if (mountedRef.current) {
        setReplacementCompleted(true);

        setPaymentProcessing(false);

        setPaymentLoading(false);

        setClientSecret(null);

        setPaymentIntentId(null);
      }

      return true;
    } catch (error) {
      console.log(
        'Error checking replacement workflow:',
        error
      );

      throw error;
    }
  }, [
    getCompletedWorkflow,
    scheduleId,
    requestId,
  ]);

  /* --------------------------- payment details ----------------------------- */

  const fetchPaymentDetails = useCallback(async () => {
    if (!scheduleId || !replacementRequestId) {
      setScreenError(
        tSafe(
          'replacement_payment_missing_ids',
          'The replacement payment information is incomplete. Please return to your schedule and try again.'
        )
      );

      setLoading(false);

      return;
    }

    setLoading(true);

    setScreenError(null);

    setWorkflowCheckFailed(false);

    try {
      /*
       * Check the parent replacement workflow before requesting payment
       * details. A completed replacement must not continue into Stripe.
       */
      if (requestId) {
        try {
          const completed =
            await checkReplacementWorkflow();

          if (completed) {
            setLoading(false);

            setTimeout(() => {
              if (mountedRef.current) {
                navigateToHostDashboard();
              }
            }, 150);

            return;
          }
        } catch (workflowError) {
          console.log(
            'Could not verify replacement workflow before loading payment:',
            workflowError
          );

          setWorkflowCheckFailed(true);
        }
      }

      const response =
        await userService.getReplacementPaymentDetails(
          String(scheduleId),
          String(replacementRequestId)
        );

      const responseData =
        unwrapResponse(response);

      const payment =
        responseData?.payment ??
        responseData?.data?.payment ??
        responseData;

      const source =
        getPaymentSource(payment);

      const hostAdditionalCharge =
        getHostAdditionalCharge(payment);

      const normalizedPayment = {
        ...payment,

        source,

        hostAdditionalCharge,

        propertyName:
          payment?.propertyName ||
          payment?.property_name ||
          propertyName ||
          '',

        cleaningDate:
          payment?.cleaningDate ||
          payment?.cleaning_date ||
          newCleaningDate ||
          '',

        cleaningTime:
          payment?.cleaningTime ||
          payment?.cleaning_time ||
          cleaningTime ||
          '',

        group:
          payment?.group ||
          group ||
          '',

        replacementCleaner:
          payment?.replacementCleaner ||
          payment?.replacement_cleaner ||
          cleanerName ||
          '',

        replacementCleanerId:
          payment?.replacementCleanerId ||
          payment?.replacement_cleaner_id ||
          cleanerId ||
          '',

        originalCleaner:
          payment?.originalCleaner ||
          payment?.original_cleaner ||
          replacedCleanerName ||
          '',

        originalCleanerId:
          payment?.originalCleanerId ||
          payment?.original_cleaner_id ||
          replacedCleanerId ||
          '',

        oldCleaningDate:
          payment?.oldCleaningDate ||
          payment?.old_cleaning_date ||
          oldCleaningDate ||
          '',

        newCleaningDate:
          payment?.newCleaningDate ||
          payment?.new_cleaning_date ||
          newCleaningDate ||
          '',
      };

      /*
       * A cleaner cancellation with a zero host charge must not create
       * a PaymentIntent.
       *
       * The backend must still confirm that the replacement assignment
       * has completed.
       */
      if (
        source === 'cleaner_cancellation' &&
        hostAdditionalCharge === 0
      ) {
        if (requestId) {
          try {
            const completed =
              await checkReplacementWorkflow();

            if (completed) {
              setLoading(false);

              setTimeout(() => {
                if (mountedRef.current) {
                  navigateToHostDashboard();
                }
              }, 150);

              return;
            }
          } catch (workflowError) {
            console.log(
              'Could not verify cleaner-cancellation replacement:',
              workflowError
            );
          }
        }

        if (mountedRef.current) {
          setPaymentDetails(
            normalizedPayment
          );

          setClientSecret(null);

          setPaymentIntentId(null);

          setScreenError(
            tSafe(
              'replacement_assignment_pending',
              'No additional payment is required for this cleaner cancellation. However, the replacement assignment has not yet been confirmed. Please try again shortly.'
            )
          );
        }

        setLoading(false);

        return;
      }

      if (mountedRef.current) {
        setPaymentDetails(
          normalizedPayment
        );

        setClientSecret(null);

        setPaymentIntentId(null);
      }
    } catch (error) {
      console.log(
        'Error fetching replacement payment details:',
        error?.response?.data || error
      );

      if (mountedRef.current) {
        const errorMessage =
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message;

        setScreenError(
          getDisplayMessage(
            errorMessage,
            tSafe(
              'replacement_payment_load_error',
              'Unable to load replacement payment details. Please try again.'
            )
          )
        );
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [
    scheduleId,
    replacementRequestId,
    requestId,
    propertyName,
    newCleaningDate,
    cleaningTime,
    group,
    cleanerName,
    cleanerId,
    replacedCleanerName,
    replacedCleanerId,
    oldCleaningDate,
    checkReplacementWorkflow,
    navigateToHostDashboard,
  ]);

  /* --------------------------- refresh on focus ---------------------------- */

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        if (!active) {
          return;
        }

        await fetchPaymentDetails();
      };

      load();

      return () => {
        active = false;
      };
    }, [
      fetchPaymentDetails,
    ])
  );

  /* ---------------------- automatic completion polling --------------------- */

  const waitForReplacementCompletion = useCallback(async () => {
    if (pollingRef.current) {
      return;
    }

    pollingRef.current = true;

    setPaymentProcessing(true);

    const maxAttempts = 12;

    const delayMs = 3000;

    try {
      for (
        let attempt = 1;
        attempt <= maxAttempts;
        attempt += 1
      ) {
        if (!mountedRef.current) {
          return;
        }

        console.log(
          `Checking replacement completion (${attempt}/${maxAttempts})`
        );

        try {
          const completed =
            await checkReplacementWorkflow();

          if (completed) {
            setPaymentProcessing(false);

            setReplacementCompleted(true);

            setTimeout(() => {
              if (mountedRef.current) {
                navigateToHostDashboard();
              }
            }, 700);

            return;
          }
        } catch (error) {
          console.log(
            'Replacement completion check failed:',
            error
          );
        }

        if (attempt < maxAttempts) {
          await new Promise((resolve) => {
            setTimeout(
              resolve,
              delayMs
            );
          });
        }
      }

      if (mountedRef.current) {
        setPaymentProcessing(false);

        Alert.alert(
          tSafe(
            'replacement_processing',
            'Replacement Processing'
          ),
          tSafe(
            'replacement_payment_processing_message',
            'Your payment was submitted, but the replacement confirmation is still processing. Please check your schedule again shortly.'
          ),
          [
            {
              text: tSafe(
                'go_to_dashboard',
                'Go to Dashboard'
              ),
              onPress:
                navigateToHostDashboard,
            },
          ]
        );
      }
    } finally {
      pollingRef.current = false;
    }
  }, [
    checkReplacementWorkflow,
    navigateToHostDashboard,
  ]);

  /* -------------------------- start payment flow --------------------------- */

  const handlePayment = useCallback(async () => {
    if (paymentStartingRef.current) {
      return;
    }

    if (!acceptedPolicy) {
      Alert.alert(
        tSafe(
          'policy_required_title',
          'Confirmation Required'
        ),
        tSafe(
          'policy_required_message',
          'Please review and accept the replacement payment policy before continuing.'
        )
      );

      return;
    }

    if (
      !scheduleId ||
      !replacementRequestId
    ) {
      Alert.alert(
        tSafe(
          'missing_information',
          'Missing Information'
        ),
        tSafe(
          'replacement_payment_missing_ids',
          'The replacement payment information is incomplete. Please return to your schedule and try again.'
        )
      );

      return;
    }

    paymentStartingRef.current = true;

    setPaymentLoading(true);

    setScreenError(null);

    try {
      /*
       * First protection:
       * never initiate payment if the replacement is already completed.
       */
      if (requestId) {
        let completed;

        try {
          completed =
            await checkReplacementWorkflow();
        } catch (workflowError) {
          console.log(
            'Could not verify workflow before payment:',
            workflowError
          );

          throw new Error(
            tSafe(
              'replacement_workflow_verification_failed',
              'We could not verify the replacement assignment. No payment was started. Please try again.'
            )
          );
        }

        if (completed) {
          navigateToHostDashboard();

          return;
        }
      }

      /*
       * Only use the additional host charge supplied by the backend.
       */
      const source =
        getPaymentSource(paymentDetails);

      const amount =
        getHostAdditionalCharge(paymentDetails);

      /*
       * Second protection:
       * a zero-charge cleaner cancellation must never create a PaymentIntent.
       */
      if (
        source === 'cleaner_cancellation' &&
        amount === 0
      ) {
        let completed = false;

        if (requestId) {
          try {
            completed =
              await checkReplacementWorkflow();
          } catch (workflowError) {
            console.log(
              'Workflow check failed for zero-charge replacement:',
              workflowError
            );
          }
        }

        if (completed) {
          navigateToHostDashboard();

          return;
        }

        throw new Error(
          tSafe(
            'replacement_assignment_pending',
            'No additional payment is required for this cleaner cancellation, but the replacement assignment has not yet been confirmed. No payment was started. Please try again shortly.'
          )
        );
      }

      /*
       * Reject missing, invalid, and zero payment amounts.
       */
      if (
        amount === null ||
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        throw new Error(
          tSafe(
            'invalid_replacement_payment_amount',
            'The additional payment amount is invalid. No payment was started. Please refresh the replacement details.'
          )
        );
      }

      if (!paymentDetails) {
        throw new Error(
          tSafe(
            'replacement_payment_details_missing',
            'Replacement payment details are not available. Please try again.'
          )
        );
      }

      /*
       * Resolve the Stripe customer ID from the payment details first,
       * then fall back to the authenticated user.
       *
       * Never use String(customerId) unless the ID has been validated.
       */
      const stripeCustomerId =
        getStripeCustomerId(
          paymentDetails?.stripeCustomer
        ) ||
        getStripeCustomerId(
          paymentDetails?.stripe_customer
        ) ||
        getStripeCustomerId(
          paymentDetails?.stripe_customer_id
        ) ||
        getStripeCustomerId(
          paymentDetails?.stripeCustomerId
        ) ||
        getStripeCustomerId(
          paymentDetails?.customerId
        ) ||
        getStripeCustomerId(
          paymentDetails?.customer_id
        ) ||
        customerId;

      const paymentReceiptEmail =
        getDisplayMessage(
          paymentDetails?.receiptEmail ||
          paymentDetails?.receipt_email ||
          receiptEmail,
          ''
        ) || undefined;

      if (!stripeCustomerId) {
        console.error(
          'Stripe customer ID could not be resolved.',
          {
            hasCurrentUser: Boolean(currentUser),

            hasStripeCustomer:
              Boolean(currentUser?.stripe_customer),

            availableStripeCustomerKeys:
              currentUser?.stripe_customer &&
              typeof currentUser.stripe_customer === 'object'
                ? Object.keys(currentUser.stripe_customer)
                : [],
          }
        );

        throw new Error(
          tSafe(
            'stripe_customer_missing',
            'Your payment profile could not be found. Please check your payment settings and try again.'
          )
        );
      }

      /*
       * Preserve the existing createReplacementPaymentIntent payload
       * structure, but use the correctly resolved Stripe customer ID.
       */
      const payload = {
        amount,

        currency: String(
          paymentDetails?.currency || 'USD'
        ).toLowerCase(),

        customerId: stripeCustomerId,

        receiptEmail: paymentReceiptEmail,

        metadata: {
          scheduleId: String(scheduleId),

          requestId: String(replacementRequestId),
        },
      };

      console.log(
        'Starting replacement payment:',
        {
          scheduleId,
          replacementRequestId,
          source,
          amount,
          currency: payload.currency,
          hasStripeCustomerId: Boolean(stripeCustomerId),
        }
      );

      const response =
        await userService.createReplacementPaymentIntent(
          payload
        );

      const responseData =
        unwrapResponse(response);

      const secret =
        responseData?.clientSecret ||
        responseData?.client_secret ||
        responseData?.paymentIntent?.client_secret ||
        responseData?.payment_intent?.client_secret ||
        null;

      const intentId =
        responseData?.paymentIntentId ||
        responseData?.payment_intent_id ||
        responseData?.paymentIntent?.id ||
        responseData?.payment_intent?.id ||
        null;

      if (!secret) {
        const serviceError =
          responseData?.detail ||
          responseData?.message;

        throw new Error(
          getDisplayMessage(
            serviceError,
            tSafe(
              'payment_intent_secret_missing',
              'The payment service did not return the information required to continue. Please try again.'
            )
          )
        );
      }

      if (mountedRef.current) {
        setClientSecret(secret);

        setPaymentIntentId(intentId);
      }
    } catch (error) {
      console.log(
        'Replacement payment error:',
        error?.response?.data || error
      );

      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message;

      const message =
        getDisplayMessage(
          errorMessage,
          tSafe(
            'replacement_payment_error',
            'Unable to start the replacement payment. Please try again.'
          )
        );

      if (mountedRef.current) {
        Alert.alert(
          tSafe(
            'payment_error',
            'Payment Error'
          ),
          message
        );
      }
    } finally {
      paymentStartingRef.current = false;

      if (mountedRef.current) {
        setPaymentLoading(false);
      }
    }
  }, [
    acceptedPolicy,
    scheduleId,
    replacementRequestId,
    requestId,
    paymentDetails,
    currentUser,
    customerId,
    receiptEmail,
    checkReplacementWorkflow,
    navigateToHostDashboard,
  ]);

  /* ----------------------------- retry loading ----------------------------- */

  const handleRetry = useCallback(() => {
    redirectingRef.current = false;

    setScreenError(null);

    setClientSecret(null);

    setPaymentIntentId(null);

    fetchPaymentDetails();
  }, [
    fetchPaymentDetails,
  ]);

  /* ------------------------------ formatting ------------------------------- */

  const formatAmount = useCallback((amount) => {
    const value = Number(amount);

    if (!Number.isFinite(value)) {
      return '0.00';
    }

    return value.toFixed(2);
  }, []);

  const displayDate = getDisplayMessage(
    paymentDetails?.cleaningDate ||
    newCleaningDate ||
    oldCleaningDate,
    tSafe(
      'date_not_available',
      'Not available'
    )
  );

  const displayTime = getDisplayMessage(
    paymentDetails?.cleaningTime ||
    cleaningTime,
    tSafe(
      'time_not_available',
      'Not available'
    )
  );

  const displayProperty = getDisplayMessage(
    paymentDetails?.propertyName ||
    propertyName,
    tSafe(
      'property_not_available',
      'Property not available'
    )
  );

  const displayCleaner = getDisplayMessage(
    paymentDetails?.replacementCleaner ||
    cleanerName,
    tSafe(
      'cleaner_not_available',
      'Replacement cleaner'
    )
  );

  const displayGroup = formatGroupName(
    paymentDetails?.group ||
    group
  );

  const displayOriginalCleaner =
    getDisplayMessage(
      paymentDetails?.originalCleaner ||
      replacedCleanerName,
      ''
    );

  const displayOldCleaningDate =
    getDisplayMessage(
      paymentDetails?.oldCleaningDate ||
      paymentDetails?.old_cleaning_date ||
      oldCleaningDate,
      ''
    );

  const hostAdditionalCharge =
    getHostAdditionalCharge(paymentDetails);

  const paymentSource =
    getPaymentSource(paymentDetails);

  /* ------------------------------- loading UI ------------------------------ */

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
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

        <View
          style={styles.centerContainer}
        >
          <ActivityIndicator
            size="large"
            color={theme.brand.primary}
          />

          <AppTextFallback
            theme={theme}
            style={styles.loadingText}
          >
            {tSafe(
              'loading_replacement_payment',
              'Loading replacement details...'
            )}
          </AppTextFallback>
        </View>
      </SafeAreaView>
    );
  }

  /* -------------------------- processing completion ------------------------ */

  if (
    replacementCompleted ||
    paymentProcessing
  ) {
    return (
      <SafeAreaView
        style={styles.container}
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

        <View
          style={styles.centerContainer}
        >
          <View
            style={[
              styles.statusIconContainer,
              {
                backgroundColor:
                  replacementCompleted
                    ? theme.status.success + '18'
                    : theme.brand.primary + '18',
              },
            ]}
          >
            <MaterialCommunityIcons
              name={
                replacementCompleted
                  ? 'check-circle-outline'
                  : 'progress-clock'
              }
              size={56}
              color={
                replacementCompleted
                  ? theme.status.success
                  : theme.brand.primary
              }
            />
          </View>

          <AppTextFallback
            theme={theme}
            style={styles.statusTitle}
          >
            {replacementCompleted
              ? tSafe(
                  'replacement_completed',
                  'Replacement Completed'
                )
              : tSafe(
                  'replacement_processing',
                  'Replacement Processing'
                )}
          </AppTextFallback>

          <AppTextFallback
            theme={theme}
            style={styles.statusDescription}
          >
            {replacementCompleted
              ? tSafe(
                  'replacement_completed_message',
                  'Your replacement cleaner has been assigned successfully.'
                )
              : tSafe(
                  'replacement_processing_message',
                  'Please wait while we confirm the replacement assignment.'
                )}
          </AppTextFallback>

          {paymentProcessing && (
            <ActivityIndicator
              size="large"
              color={theme.brand.primary}
              style={styles.processingIndicator}
            />
          )}

          <Button
            mode="contained"
            onPress={
              navigateToHostDashboard
            }
            style={styles.primaryButton}
            contentStyle={
              styles.buttonContent
            }
            buttonColor={
              theme.brand.primary
            }
            textColor={
              theme.text.inverse
            }
          >
            {tSafe(
              'go_to_dashboard',
              'Go to Dashboard'
            )}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  /* -------------------------------- main UI -------------------------------- */

  return (
    <SafeAreaView
      style={styles.container}
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
      >
        {/* -------------------------------- heading ------------------------------- */}

        <View
          style={styles.header}
        >
          <View
            style={styles.headerIcon}
          >
            <MaterialCommunityIcons
              name="account-switch-outline"
              size={28}
              color={theme.brand.primary}
            />
          </View>

          <AppTextFallback
            theme={theme}
            style={styles.title}
          >
            {tSafe(
              'replacement_payment_title',
              'Replacement Cleaner'
            )}
          </AppTextFallback>

          <AppTextFallback
            theme={theme}
            style={styles.subtitle}
          >
            {tSafe(
              'replacement_payment_subtitle',
              'Review the replacement details before continuing.'
            )}
          </AppTextFallback>
        </View>

        {/* ------------------------------- error --------------------------------- */}

        {!!screenError && (
          <Card
            style={styles.errorCard}
            mode="outlined"
          >
            <Card.Content>
              <View
                style={styles.messageRow}
              >
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={24}
                  color={theme.status.error}
                />

                <View
                  style={styles.messageContent}
                >
                  <AppTextFallback
                    theme={theme}
                    style={styles.errorTitle}
                  >
                    {tSafe(
                      'attention_required',
                      'Attention Required'
                    )}
                  </AppTextFallback>

                  <AppTextFallback
                    theme={theme}
                    style={styles.errorMessage}
                  >
                    {getDisplayMessage(
                      screenError,
                      ''
                    )}
                  </AppTextFallback>
                </View>
              </View>

              <Button
                mode="outlined"
                onPress={handleRetry}
                style={styles.retryButton}
                textColor={theme.brand.primary}
              >
                {tSafe(
                  'try_again',
                  'Try Again'
                )}
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* ---------------------- Replacement Details ---------------------- */}

        <Card
          style={styles.replacementDetailsCard}
          mode="elevated"
        >
          <Card.Content
            style={styles.replacementDetailsContent}
          >
            {/* Section heading */}

            <View
              style={styles.replacementSectionHeading}
            >
              <View
                style={styles.replacementHeadingIcon}
              >
                <MaterialCommunityIcons
                  name="account-switch-outline"
                  size={24}
                  color={theme.brand.primary}
                />
              </View>

              <View
                style={styles.replacementHeadingText}
              >
                <AppTextFallback
                  theme={theme}
                  style={styles.replacementSectionTitle}
                >
                  {tSafe(
                    'replacement_details',
                    'Replacement Details'
                  )}
                </AppTextFallback>

                <AppTextFallback
                  theme={theme}
                  style={styles.replacementSectionSubtitle}
                >
                  Your updated cleaning arrangement
                </AppTextFallback>
              </View>
            </View>

            {/* Replacement cleaner profile */}

            <View
              style={styles.replacementCleanerCard}
            >
              <View
                style={styles.replacementCleanerAvatar}
              >
                <MaterialCommunityIcons
                  name="account-check-outline"
                  size={32}
                  color={theme.brand.primary}
                />
              </View>

              <View
                style={styles.replacementCleanerInfo}
              >
                <AppTextFallback
                  theme={theme}
                  style={styles.replacementFieldLabel}
                >
                  {tSafe(
                    'replacement_cleaner',
                    'Replacement Cleaner'
                  )}
                </AppTextFallback>

                <AppTextFallback
                  theme={theme}
                  style={styles.replacementCleanerName}
                >
                  {displayCleaner}
                </AppTextFallback>

                {!!displayGroup && (
                  <View
                    style={styles.replacementGroupBadge}
                  >
                    <MaterialCommunityIcons
                      name="account-group-outline"
                      size={14}
                      color={theme.brand.primary}
                    />

                    <AppTextFallback
                      theme={theme}
                      style={styles.replacementGroupText}
                    >
                      {displayGroup}
                    </AppTextFallback>
                  </View>
                )}
              </View>

              <MaterialCommunityIcons
                name="check-circle"
                size={22}
                color={theme.status.success}
              />
            </View>

            {/* Property information */}

            <View
              style={styles.replacementPropertyCard}
            >
              <View
                style={styles.replacementPropertyIcon}
              >
                <MaterialCommunityIcons
                  name="home-outline"
                  size={22}
                  color={theme.brand.primary}
                />
              </View>

              <View
                style={styles.replacementPropertyInfo}
              >
                <AppTextFallback
                  theme={theme}
                  style={styles.replacementFieldLabel}
                >
                  {tSafe(
                    'property',
                    'Property'
                  )}
                </AppTextFallback>

                <AppTextFallback
                  theme={theme}
                  style={styles.replacementPropertyName}
                >
                  {displayProperty}
                </AppTextFallback>
              </View>
            </View>

            {/* Cleaning date and time */}

            <View
              style={styles.replacementScheduleRow}
            >
              <View
                style={styles.replacementScheduleTile}
              >
                <View
                  style={styles.replacementScheduleIcon}
                >
                  <MaterialCommunityIcons
                    name="calendar-month-outline"
                    size={21}
                    color={theme.brand.primary}
                  />
                </View>

                <AppTextFallback
                  theme={theme}
                  style={styles.replacementFieldLabel}
                >
                  {tSafe(
                    'cleaning_date',
                    'Cleaning Date'
                  )}
                </AppTextFallback>

                <AppTextFallback
                  theme={theme}
                  style={styles.replacementScheduleValue}
                >
                  {displayDate}
                </AppTextFallback>
              </View>

              <View
                style={styles.replacementScheduleTile}
              >
                <View
                  style={styles.replacementScheduleIcon}
                >
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={21}
                    color={theme.brand.primary}
                  />
                </View>

                <AppTextFallback
                  theme={theme}
                  style={styles.replacementFieldLabel}
                >
                  {tSafe(
                    'cleaning_time',
                    'Cleaning Time'
                  )}
                </AppTextFallback>

                <AppTextFallback
                  theme={theme}
                  style={styles.replacementScheduleValue}
                >
                  {displayTime}
                </AppTextFallback>
              </View>
            </View>

            {/* Original cleaner */}

            {!!displayOriginalCleaner && (
              <View
                style={styles.replacementOriginalCleaner}
              >
                <MaterialCommunityIcons
                  name="account-arrow-left-outline"
                  size={20}
                  color={theme.text.secondary}
                />

                <View
                  style={styles.replacementOriginalCleanerInfo}
                >
                  <AppTextFallback
                    theme={theme}
                    style={styles.replacementFieldLabel}
                  >
                    {tSafe(
                      'original_cleaner',
                      'Original Cleaner'
                    )}
                  </AppTextFallback>

                  <AppTextFallback
                    theme={theme}
                    style={styles.replacementOriginalCleanerName}
                  >
                    {displayOriginalCleaner}
                  </AppTextFallback>
                </View>
              </View>
            )}

            {/* Previous cleaning date */}

            {!!displayOldCleaningDate && (
              <View
                style={styles.replacementPreviousDate}
              >
                <MaterialCommunityIcons
                  name="calendar-arrow-right"
                  size={19}
                  color={theme.text.secondary}
                />

                <AppTextFallback
                  theme={theme}
                  style={styles.replacementPreviousDateLabel}
                >
                  {tSafe(
                    'previous_cleaning_date',
                    'Previous Cleaning Date'
                  )}
                </AppTextFallback>

                <AppTextFallback
                  theme={theme}
                  style={styles.replacementPreviousDateValue}
                >
                  {displayOldCleaningDate}
                </AppTextFallback>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* ---------------------------- payment details -------------------------- */}

        <Card
          style={styles.card}
          mode="elevated"
        >
          <Card.Content>
            <View
              style={styles.sectionHeading}
            >
              <MaterialCommunityIcons
                name="credit-card-outline"
                size={22}
                color={theme.brand.primary}
              />

              <AppTextFallback
                theme={theme}
                style={styles.sectionTitle}
              >
                {tSafe(
                  'payment_summary',
                  'Payment Summary'
                )}
              </AppTextFallback>
            </View>

            <Divider
              style={styles.divider}
            />

            <View
              style={styles.amountRow}
            >
              <AppTextFallback
                theme={theme}
                style={styles.amountLabel}
              >
                {tSafe(
                  'replacement_additional_charge',
                  'Additional Payment'
                )}
              </AppTextFallback>

              <AppTextFallback
                theme={theme}
                style={styles.amountValue}
              >
                {getDisplayMessage(
                  currentUser?.location?.currency_symbol, '$'
                )}
                {hostAdditionalCharge === null
                  ? '—'
                  : formatAmount(
                      hostAdditionalCharge
                    )}
              </AppTextFallback>
            </View>

            <AppTextFallback
              theme={theme}
              style={styles.paymentHint}
            >
              {hostAdditionalCharge === 0
                ? tSafe(
                    'no_additional_payment',
                    'No additional payment is required.'
                  )
                : tSafe(
                    'payment_amount_notice',
                    'Only the additional payment displayed above will be processed.'
                  )}
            </AppTextFallback>

            {paymentSource ===
              'cleaner_cancellation' && (
              <View
                style={styles.noChargeNotice}
              >
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={21}
                  color={theme.status.success}
                />

                <AppTextFallback
                  theme={theme}
                  style={styles.noChargeText}
                >
                  {tSafe(
                    'cleaner_cancellation_no_charge',
                    'This replacement follows a cleaner cancellation. No additional host payment is required when the calculated charge is zero.'
                  )}
                </AppTextFallback>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* ----------------------------- policy --------------------------------- */}

        {!screenError && (
          <Card
            style={styles.policyCard}
            mode="outlined"
          >
            <Card.Content>
              <View
                style={styles.policyHeader}
              >
                <MaterialCommunityIcons
                  name="shield-check-outline"
                  size={22}
                  color={theme.brand.primary}
                />

                <AppTextFallback
                  theme={theme}
                  style={styles.policyTitle}
                >
                  {tSafe(
                    'replacement_payment_policy',
                    'Payment Confirmation'
                  )}
                </AppTextFallback>
              </View>

              {/* <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  setAcceptedPolicy(
                    (previous) => !previous
                  )
                }
                style={styles.checkboxRow}
              >
                <Checkbox
                  status={
                    acceptedPolicy
                      ? 'checked'
                      : 'unchecked'
                  }
                  onPress={() =>
                    setAcceptedPolicy(
                      (previous) => !previous
                    )
                  }
                  color={theme.brand.primary}
                  uncheckedColor={
                    theme.text.secondary
                  }
                />
                

                <View
                  style={styles.policyTextContainer}
                >
                  <AppTextFallback
                    theme={theme}
                    style={styles.policyText}
                  >
                    {tSafe(
                      'replacement_payment_acceptance',
                      'I have reviewed the replacement details and authorize the additional payment shown above, if one is required.'
                    )}
                  </AppTextFallback>
                </View>
              </TouchableOpacity> */}
              
             
              <CustomCheckbox
                checked={acceptedPolicy}
                onPress={() =>
                  setAcceptedPolicy((previous) => !previous)
                }
                label={tSafe(
                  'replacement_payment_acceptance',
                  'I have reviewed the replacement details and authorize the additional payment shown above, if one is required.'
                )}
                color={theme.brand.primary}
                uncheckedColor="#666666"
                textColor={theme.text.primary}
                checkboxSize={20}
                fontSize={14}
              />
            </Card.Content>
          </Card>
        )}

        {/* ---------------------------- payment button --------------------------- */}

        {!screenError &&
          !clientSecret &&
          hostAdditionalCharge !== null &&
          hostAdditionalCharge > 0 && (
            <Button
              mode="contained"
              onPress={handlePayment}
              loading={paymentLoading}
              disabled={
                paymentLoading ||
                !acceptedPolicy
              }
              style={styles.primaryButton}
              contentStyle={
                styles.buttonContent
              }
              buttonColor={
                theme.brand.primary
              }
              textColor={
                theme.text.inverse
              }
              icon="lock-outline"
            >
              {paymentLoading
                ? tSafe(
                    'preparing_payment',
                    'Preparing Payment...'
                  )
                : tSafe(
                    'continue_to_payment',
                    'Continue to Payment'
                  )}
            </Button>
          )}

        {/* ------------------------- Stripe payment UI -------------------------- */}

        {!!clientSecret && (
          <Card
            style={styles.stripeCard}
            mode="outlined"
          >
            <Card.Content>
              <View
                style={styles.sectionHeading}
              >
                <MaterialCommunityIcons
                  name="lock-check-outline"
                  size={22}
                  color={theme.status.success}
                />

                <AppTextFallback
                  theme={theme}
                  style={styles.sectionTitle}
                >
                  {tSafe(
                    'secure_payment',
                    'Secure Payment'
                  )}
                </AppTextFallback>
              </View>

              <AppTextFallback
                theme={theme}
                style={styles.paymentHint}
              >
                {tSafe(
                  'stripe_secure_payment_message',
                  'Complete the payment below to continue.'
                )}
              </AppTextFallback>

              <StripeGroupPaymentButton
                clientSecret={clientSecret}
                paymentIntentId={paymentIntentId}
                amount={hostAdditionalCharge}
                onSuccess={
                  waitForReplacementCompletion
                }
              />
            </Card.Content>
          </Card>
        )}

        {/* ---------------------------- footer action --------------------------- */}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={
            navigateToHostDashboard
          }
          style={styles.cancelAction}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={18}
            color={theme.text.secondary}
          />

          <AppTextFallback
            theme={theme}
            style={styles.cancelActionText}
          >
            {tSafe(
              'return_to_dashboard',
              'Return to Dashboard'
            )}
          </AppTextFallback>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

/* -------------------------------------------------------------------------- */
/*                          Shared display components                         */
/* -------------------------------------------------------------------------- */

const AppTextFallback = ({
  children,
  theme,
  style,
  numberOfLines,
}) => {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        {
          color: theme.text.primary,
        },
        style,
      ]}
    >
      {getDisplayMessage(children, '')}
    </Text>
  );
};

const DetailRow = ({
  theme,
  icon,
  label,
  value,
}) => (
  <View
    style={detailRowStyles.row}
  >
    <View
      style={[
        detailRowStyles.iconContainer,
        {
          backgroundColor:
            theme.surface.selected,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={19}
        color={theme.icon.default}
      />
    </View>

    <View
      style={detailRowStyles.content}
    >
      <AppTextFallback
        theme={theme}
        style={[
          detailRowStyles.label,
          {
            color: theme.text.secondary,
          },
        ]}
      >
        {label}
      </AppTextFallback>

      <AppTextFallback
        theme={theme}
        style={detailRowStyles.value}
      >
        {getDisplayMessage(value, '—')}
      </AppTextFallback>
    </View>
  </View>
);

const detailRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },

  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  content: {
    flex: 1,
  },

  label: {
    fontSize: 12,
    marginBottom: 3,
  },

  value: {
    fontSize: 14,
    fontWeight: '600',
  },
});

/* -------------------------------------------------------------------------- */
/*                                    Styles                                  */
/* -------------------------------------------------------------------------- */

const createStyles = (theme) => {
  const cardShadow = {
    shadowColor:
      theme.shadow?.color || '#000000',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity:
      theme.shadow?.opacity || 0.06,

    shadowRadius: 12,

    elevation: 2,
  };

  return StyleSheet.create({
    /* -------------------------------- container ------------------------------- */

    container: {
      flex: 1,

      backgroundColor:
        theme.background.default,
    },

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      paddingHorizontal: S.lg,
      paddingTop: S.lg,
      paddingBottom: 48,
    },

    centerContainer: {
      flex: 1,

      alignItems: 'center',
      justifyContent: 'center',

      paddingHorizontal: S.xl,

      backgroundColor:
        theme.background.default,
    },

    /* -------------------------------- loading -------------------------------- */

    loadingText: {
      marginTop: S.lg,

      fontSize: 14,

      color:
        theme.text.secondary,

      textAlign: 'center',
    },

    processingIndicator: {
      marginTop: S.xl,
    },

    /* -------------------------------- header --------------------------------- */

    header: {
      alignItems: 'center',

      marginBottom: S.xl,

      paddingHorizontal: S.sm,
    },

    headerIcon: {
      width: 64,
      height: 64,

      borderRadius: R.lg,

      backgroundColor:
        `${theme.brand.primary}15`,

      alignItems: 'center',
      justifyContent: 'center',

      marginBottom: S.md,
    },

    title: {
      color: theme.text.primary,

      fontSize: 25,
      fontWeight: '800',

      textAlign: 'center',

      letterSpacing: -0.5,
    },

    subtitle: {
      color: theme.text.secondary,

      fontSize: 14,
      lineHeight: 21,

      textAlign: 'center',

      marginTop: S.sm,

      maxWidth: 340,
    },

    /* -------------------------------- cards ---------------------------------- */

    card: {
      marginBottom: S.lg,
      backgroundColor: theme.surface.default,
      borderRadius: R.lg,
      overflow: 'hidden',
      ...cardShadow,
    },

    policyCard: {
      marginBottom: S.lg,

      backgroundColor:
        theme.surface.default,

      borderRadius: R.lg,

      borderColor:
        theme.border.default,
    },

    stripeCard: {
      marginTop: S.lg,
      marginBottom: S.lg,

      backgroundColor:
        theme.surface.default,

      borderRadius: R.lg,

      borderColor:
        theme.border.default,
    },

    /* ------------------------------ section heading -------------------------- */

    sectionHeading: {
      flexDirection: 'row',

      alignItems: 'center',

      marginBottom: S.md,

      paddingVertical: S.xs,
    },

    sectionTitle: {
      marginLeft: S.sm,

      color: theme.text.primary,

      fontSize: 16,
      fontWeight: '700',

      letterSpacing: -0.2,
    },

    divider: {
      backgroundColor:
        theme.border.default,

      marginBottom: S.sm,
    },

    /* ----------------------------- payment amount ---------------------------- */

    amountRow: {
      flexDirection: 'row',

      justifyContent: 'space-between',
      alignItems: 'center',

      gap: S.md,

      paddingVertical: S.md,
    },

    amountLabel: {
      flex: 1,

      fontSize: 14,

      color: theme.text.secondary,
    },

    amountValue: {
      fontSize: 24,

      fontWeight: '800',

      letterSpacing: -0.5,

      color: theme.brand.primary,
    },

    paymentHint: {
      fontSize: 13,

      lineHeight: 20,

      color: theme.text.secondary,

      marginTop: S.sm,
    },

    noChargeNotice: {
      flexDirection: 'row',
      alignItems: 'flex-start',

      gap: S.sm,

      marginTop: S.md,

      padding: S.md,

      borderRadius: R.md,

      backgroundColor:
        `${theme.status.success}12`,
    },

    noChargeText: {
      flex: 1,

      fontSize: 13,

      lineHeight: 19,

      color: theme.text.primary,
    },

    /* -------------------------------- policy --------------------------------- */

    policyHeader: {
      flexDirection: 'row',
      alignItems: 'center',

      marginBottom: S.sm,
    },

    policyTitle: {
      marginLeft: S.sm,

      fontSize: 15,
      fontWeight: '700',

      color: theme.text.primary,
    },

    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',

      marginTop: S.sm,

      marginLeft: -S.sm,
    },

    policyTextContainer: {
      flex: 1,

      paddingTop: 10,
      paddingRight: S.xs,
    },

    policyText: {
      fontSize: 13,

      lineHeight: 20,

      color: theme.text.secondary,
    },

    /* -------------------------------- buttons -------------------------------- */

    primaryButton: {
      marginTop: S.md,
      marginBottom: S.md,

      borderRadius: R.md,

      backgroundColor:
        theme.brand.primary,
    },

    buttonContent: {
      minHeight: 50,

      paddingHorizontal: S.md,
    },

    retryButton: {
      marginTop: S.md,

      borderRadius: R.md,

      borderColor:
        theme.border.default,
    },

    cancelAction: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',

      gap: S.sm,

      paddingVertical: S.lg,

      marginTop: S.xs,
    },

    cancelActionText: {
      fontSize: 14,

      fontWeight: '600',

      color: theme.text.secondary,
    },

    /* -------------------------------- errors --------------------------------- */

    errorCard: {
      marginBottom: S.lg,

      backgroundColor:
        theme.surface.default,

      borderRadius: R.md,

      borderColor:
        `${theme.status.error}60`,
    },

    messageRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',

      gap: S.md,
    },

    messageContent: {
      flex: 1,
    },

    errorTitle: {
      fontSize: 15,

      fontWeight: '700',

      color: theme.status.error,

      marginBottom: S.xs,
    },

    errorMessage: {
      fontSize: 13,

      lineHeight: 20,

      color: theme.text.secondary,
    },

    /* ------------------------------ status screen ---------------------------- */

    statusIconContainer: {
      width: 104,
      height: 104,

      borderRadius: R.pill,

      alignItems: 'center',
      justifyContent: 'center',

      marginBottom: S.xl,
    },

    statusTitle: {
      fontSize: 23,

      fontWeight: '800',

      letterSpacing: -0.4,

      color: theme.text.primary,

      textAlign: 'center',
    },

    statusDescription: {
      marginTop: S.md,

      fontSize: 14,

      lineHeight: 22,

      color: theme.text.secondary,

      textAlign: 'center',

      maxWidth: 340,
    },

    /* ---------------------- Replacement Details redesign ---------------------- */

    replacementDetailsCard: {
      marginBottom: S.lg,
      backgroundColor: theme.surface.default,
      borderRadius: R.lg,
      overflow: 'hidden',
      ...cardShadow,
    },

    replacementDetailsContent: {
      paddingVertical: S.lg,
    },

    replacementSectionHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: S.lg,
    },

    replacementHeadingIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${theme.brand.primary}15`,
    },

    replacementHeadingText: {
      flex: 1,
      marginLeft: S.md,
    },

    replacementSectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      letterSpacing: -0.3,
      color: theme.text.primary,
    },

    replacementSectionSubtitle: {
      marginTop: 3,
      fontSize: 12,
      lineHeight: 18,
      color: theme.text.secondary,
    },

    /* Replacement cleaner profile */

    replacementCleanerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: S.md,
      marginBottom: S.md,
      borderRadius: R.md,
      backgroundColor: `${theme.brand.primary}0D`,
      borderWidth: 1,
      borderColor: `${theme.brand.primary}25`,
    },

    replacementCleanerAvatar: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${theme.brand.primary}18`,
      marginRight: S.md,
    },

    replacementCleanerInfo: {
      flex: 1,
      minWidth: 0,
    },

    replacementCleanerName: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '800',
      color: theme.text.primary,
    },

    replacementFieldLabel: {
      fontSize: 11,
      fontWeight: '500',
      letterSpacing: 0.3,
      color: theme.text.secondary,
      marginBottom: 5,
    },

    replacementGroupBadge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: S.sm,
      paddingVertical: S.xs,
      marginTop: S.sm,
      borderRadius: R.pill,
      backgroundColor: `${theme.brand.primary}15`,
      gap: S.xs,
    },

    replacementGroupText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.brand.primary,
    },

    /* Property card */

    replacementPropertyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: S.md,
      marginBottom: S.md,
      borderRadius: R.md,
      backgroundColor: theme.background.default,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    replacementPropertyIcon: {
      width: 42,
      height: 42,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
      marginRight: S.md,
    },

    replacementPropertyInfo: {
      flex: 1,
      minWidth: 0,
    },

    replacementPropertyName: {
      fontSize: 14,
      lineHeight: 21,
      fontWeight: '700',
      color: theme.text.primary,
    },

    /* Date and time cards */

    replacementScheduleRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: S.md,
      marginBottom: S.md,
    },

    replacementScheduleTile: {
      flex: 1,
      minWidth: 0,
      padding: S.md,
      borderRadius: R.md,
      backgroundColor: theme.background.default,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    replacementScheduleIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface.selected,
      marginBottom: S.md,
    },

    replacementScheduleValue: {
      fontSize: 13,
      lineHeight: 20,
      fontWeight: '700',
      color: theme.text.primary,
    },

    /* Original cleaner */

    replacementOriginalCleaner: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: S.md,
      marginTop: S.xs,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border.default,
    },

    replacementOriginalCleanerInfo: {
      flex: 1,
      marginLeft: S.md,
    },

    replacementOriginalCleanerName: {
      fontSize: 13,
      lineHeight: 19,
      fontWeight: '600',
      color: theme.text.primary,
    },

    /* Previous cleaning date */

    replacementPreviousDate: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: S.sm,
      marginTop: S.md,
      paddingTop: S.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border.default,
    },

    replacementPreviousDateLabel: {
      flex: 1,
      fontSize: 12,
      color: theme.text.secondary,
    },

    replacementPreviousDateValue: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.text.primary,
    },

    policyCheckboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'stretch',
      minHeight: 48,
      paddingVertical: 8,
    },
    
    customCheckbox: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: '#666666',
      borderRadius: 3,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      flexShrink: 0,
    },
    
    customCheckboxChecked: {
      backgroundColor: theme.brand.primary,
      borderColor: theme.brand.primary,
    },
    
    customCheckboxTick: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: 'bold',
      lineHeight: 20,
    },
    
    policyCheckboxText: {
      flex: 1,
      flexShrink: 1,
      color: theme.text.primary,
      fontSize: 14,
      lineHeight: 21,
    },
  });
};

export default ReplacementPayment;







// import React, {
//   useCallback,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
// } from 'react';

// import {
//   Alert,
//   ActivityIndicator,
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   TouchableOpacity,
//   View,
// } from 'react-native';

// import {
//   Button,
//   Card,
//   Checkbox,
//   Divider,
// } from 'react-native-paper';

// import {
//   MaterialCommunityIcons,
// } from '@expo/vector-icons';

// import {
//   useNavigation,
//   useRoute,
//   useFocusEffect,
// } from '@react-navigation/native';

// import { AuthContext } from '../../context/AuthContext';

// import userService from '../../services/connection/userService';

// import { tSafe } from '../../utils/tSafe';

// import { useTheme } from '../../theme';

// import StripeGroupPaymentButton from '../../components/shared/StripeGroupPaymentButton';
// import ROUTES from '../../constants/routes';


// /* -------------------------------------------------------------------------- */
// /*                                   Tokens                                   */
// /* -------------------------------------------------------------------------- */

// const S = {
//   xs: 4,
//   sm: 8,
//   md: 12,
//   lg: 16,
//   xl: 20,
//   xxl: 24,
//   xxxl: 32,
// };

// const R = {
//   sm: 10,
//   md: 16,
//   lg: 22,
//   pill: 999,
// };


// /* -------------------------------------------------------------------------- */
// /*                              Helper functions                              */
// /* -------------------------------------------------------------------------- */

// const unwrapResponse = (response) => {
//   return response?.data ?? response ?? {};
// };

// const getIdentifier = (value) => {
//   if (value == null) {
//     return '';
//   }

//   if (typeof value === 'object') {
//     return String(
//       value._id ??
//       value.id ??
//       value.$oid ??
//       ''
//     );
//   }

//   return String(value);
// };

// const normalizeStatus = (value) => {
//   return String(value ?? '')
//     .trim()
//     .toLowerCase();
// };

// const getWorkflowList = (response) => {
//   const data = unwrapResponse(response);

//   if (Array.isArray(data)) {
//     return data;
//   }

//   if (Array.isArray(data.workflows)) {
//     return data.workflows;
//   }

//   if (Array.isArray(data.data?.workflows)) {
//     return data.data.workflows;
//   }

//   return [];
// };

// const isWorkflowCompleted = (workflow) => {
//   if (!workflow) {
//     return false;
//   }

//   const status = normalizeStatus(
//     workflow.status
//   );

//   return (
//     status === 'completed' ||
//     workflow.replacementAssigned === true ||
//     workflow.replacement_assigned === true
//   );
// };

// const getPaymentSource = (payment) => {
//   return normalizeStatus(
//     payment?.source ??
//     payment?.replacementSource ??
//     payment?.replacement_source ??
//     ''
//   );
// };

// const getHostAdditionalCharge = (payment) => {
//   const amount =
//     payment?.hostAdditionalCharge ??
//     payment?.host_additional_charge ??
//     payment?.totalDue ??
//     payment?.total_due;

//   if (
//     amount === undefined ||
//     amount === null ||
//     amount === ''
//   ) {
//     return null;
//   }

//   const parsed = Number(amount);

//   return Number.isFinite(parsed)
//     ? parsed
//     : null;
// };


// /* -------------------------------------------------------------------------- */
// /*                             ReplacementPayment                             */
// /* -------------------------------------------------------------------------- */

// const ReplacementPayment = () => {
//   const navigation = useNavigation();

//   const route = useRoute();

//   const {
//     currentUser,
//   } = useContext(AuthContext);

//   const rawCustomer =
//   currentUser?.stripeCustomerId ||
//   currentUser?.stripe_customer_id ||
//   currentUser?.stripe_customer ||
//   null;

// let customerId = null;

// if (typeof rawCustomer === 'string') {
//   customerId = rawCustomer;
// } else if (rawCustomer?.id) {
//   customerId = rawCustomer.id;
// } else if (rawCustomer?.customerId) {
//   customerId = rawCustomer.customerId;
// } else if (rawCustomer?.customer_id) {
//   customerId = rawCustomer.customer_id;
// } else if (rawCustomer?.stripe_customer_id) {
//   customerId = rawCustomer.stripe_customer_id;
// } else if (rawCustomer?.stripeCustomerId) {
//   customerId = rawCustomer.stripeCustomerId;
// }

// const receiptEmail =
//   currentUser?.stripe_customer?.email ||
//   currentUser?.email ||
//   null;

// if (!customerId) {
//   throw new Error(
//     'Stripe customer ID was not found on the current user.'
//   );
// }

// console.log('Stripe customer ID resolved:', customerId);

//   const {
//     theme,
//     isDark,
//   } = useTheme();

//   const styles = createStyles(theme);

//   /* ------------------------------ route params ----------------------------- */

//   const {
//     scheduleId,

//     // Parent replacement workflow/request ID.
//     requestId,

//     // Individual replacement request ID.
//     replacementRequestId,

//     cleanerId,
//     cleanerName,

//     replacedCleanerId,
//     replacedCleanerName,

//     oldCleaningDate,
//     newCleaningDate,
//     cleaningTime,
//     propertyName,
//     group,
//   } = route.params || {};


//   /* --------------------------------- state --------------------------------- */

//   const [
//     loading,
//     setLoading,
//   ] = useState(true);

//   const [
//     paymentLoading,
//     setPaymentLoading,
//   ] = useState(false);

//   const [
//     paymentProcessing,
//     setPaymentProcessing,
//   ] = useState(false);

//   const [
//     replacementCompleted,
//     setReplacementCompleted,
//   ] = useState(false);

//   const [
//     paymentDetails,
//     setPaymentDetails,
//   ] = useState(null);

//   const [
//     acceptedPolicy,
//     setAcceptedPolicy,
//   ] = useState(false);

//   const [
//     clientSecret,
//     setClientSecret,
//   ] = useState(null);

//   const [
//     paymentIntentId,
//     setPaymentIntentId,
//   ] = useState(null);

//   const [
//     screenError,
//     setScreenError,
//   ] = useState(null);

//   const [
//     workflowCheckFailed,
//     setWorkflowCheckFailed,
//   ] = useState(false);

//   const mountedRef = useRef(true);

//   const redirectingRef = useRef(false);

//   const pollingRef = useRef(false);

//   const paymentStartingRef = useRef(false);

  


//   /* ---------------------------- mounted status ----------------------------- */

//   useEffect(() => {
//     mountedRef.current = true;

//     return () => {
//       mountedRef.current = false;
//     };
//   }, []);


//   // /* -------------------------- dashboard navigation ------------------------- */

//   // const navigateToHostDashboard = useCallback(() => {
//   //   if (redirectingRef.current) {
//   //     return;
//   //   }

//   //   redirectingRef.current = true;

//   //   console.log(
//   //     'Replacement workflow completed. Redirecting host to dashboard.'
//   //   );

//   //   /*
//   //    * Dashboard Host is the host dashboard route used by this application.
//   //    *
//   //    * Resetting the navigation stack prevents the host from returning to
//   //    * the replacement-payment screen using the Back button.
//   //    */
//   //   try {
//   //     navigation.reset({
//   //       index: 0,
//   //       routes: [
//   //         {
//   //           name: ROUTES.host_dashboard,
//   //         },
//   //       ],
//   //     });
//   //   } catch (error) {
//   //     console.log(
//   //       'Could not reset navigation to Dashboard Host:',
//   //       error
//   //     );

//   //     /*
//   //      * Fallback for navigator structures where the dashboard route
//   //      * is registered in a parent navigator.
//   //      */
//   //     try {
//   //       const parentNavigation =
//   //         navigation.getParent?.();

//   //       if (parentNavigation) {
//   //         parentNavigation.navigate(
//   //           ROUTES.host_dashboard
//   //         );
//   //       } else {
//   //         navigation.navigate(
//   //           ROUTES.host_dashboard
//   //         );
//   //       }
//   //     } catch (navigationError) {
//   //       console.log(
//   //         'Dashboard navigation failed:',
//   //         navigationError
//   //       );

//   //       redirectingRef.current = false;

//   //       Alert.alert(
//   //         tSafe(
//   //           'navigation_error',
//   //           'Navigation Error'
//   //         ),
//   //         tSafe(
//   //           'dashboard_navigation_failed',
//   //           'Your replacement is complete, but we could not open the dashboard automatically. Please return to the dashboard.'
//   //         )
//   //       );
//   //     }
//   //   }
//   // }, [navigation]);


//   /* -------------------------- dashboard navigation ------------------------- */

// const navigateToHostDashboard = useCallback(() => {
//   const targetRoutes = [
//     ROUTES.host_home_drawer, // Dashboard Host
//     ROUTES.host_dashboard,   // Home
//   ];

//   console.log(
//     '[Dashboard Redirect] Starting navigation.'
//   );

//   let currentNavigation = navigation;
//   let level = 0;

//   while (currentNavigation) {
//     const state = currentNavigation.getState?.();
//     const routeNames = state?.routeNames || [];

//     console.log(
//       `[Dashboard Redirect] Navigator level ${level}:`,
//       routeNames
//     );

//     // Look for a dashboard route registered at this level.
//     const dashboardRoute = targetRoutes.find((route) =>
//       routeNames.includes(route)
//     );

//     if (dashboardRoute) {
//       console.log(
//         '[Dashboard Redirect] Found route:',
//         dashboardRoute,
//         'at navigator level:',
//         level
//       );

//       try {
//         currentNavigation.reset({
//           index: 0,
//           routes: [
//             {
//               name: dashboardRoute,
//             },
//           ],
//         });

//         return;
//       } catch (error) {
//         console.error(
//           '[Dashboard Redirect] Reset failed:',
//           error
//         );
//       }
//     }

//     currentNavigation = currentNavigation.getParent?.();
//     level += 1;
//   }

//   console.error(
//     '[Dashboard Redirect] Neither dashboard route was found.'
//   );

//   Alert.alert(
//     tSafe('navigation_error', 'Navigation Error'),
//     tSafe(
//       'dashboard_navigation_failed',
//       'The replacement is complete, but automatic dashboard navigation failed.'
//     )
//   );
// }, [navigation]);
//   /* -------------------------- workflow verification ------------------------ */

//   const getCompletedWorkflow = useCallback(async () => {
//     if (!scheduleId || !requestId) {
//       return null;
//     }

//     const response =
//       await userService.getReplacementWorkflows(
//         String(scheduleId)
//       );

//     const workflows =
//       getWorkflowList(response);

//     const targetRequestId =
//       getIdentifier(requestId);

//     const workflow = workflows.find((item) => {
//       const possibleIds = [
//         item?.requestId,
//         item?.request_id,
//         item?.parentRequestId,
//         item?.parent_request_id,
//         item?.replacementParentId,
//         item?.replacement_parent_id,
//         item?._id,
//         item?.id,
//       ].map(getIdentifier);

//       return possibleIds.includes(
//         targetRequestId
//       );
//     });

//     return workflow || null;
//   }, [
//     scheduleId,
//     requestId,
//   ]);


//   const checkReplacementWorkflow = useCallback(async () => {
//     try {
//       const workflow =
//         await getCompletedWorkflow();

//       if (!workflow) {
//         return false;
//       }

//       if (!isWorkflowCompleted(workflow)) {
//         return false;
//       }

//       console.log(
//         'Replacement workflow is already completed:',
//         {
//           scheduleId,
//           requestId,
//           status: workflow.status,
//           replacementAssigned:
//             workflow.replacementAssigned ??
//             workflow.replacement_assigned,
//         }
//       );

//       if (mountedRef.current) {
//         setReplacementCompleted(true);

//         setPaymentProcessing(false);

//         setPaymentLoading(false);

//         setClientSecret(null);

//         setPaymentIntentId(null);
//       }

//       return true;
//     } catch (error) {
//       console.log(
//         'Error checking replacement workflow:',
//         error
//       );

//       throw error;
//     }
//   }, [
//     getCompletedWorkflow,
//     scheduleId,
//     requestId,
//   ]);


//   /* --------------------------- payment details ----------------------------- */

//   const fetchPaymentDetails = useCallback(async () => {
//     if (!scheduleId || !replacementRequestId) {
//       setScreenError(
//         tSafe(
//           'replacement_payment_missing_ids',
//           'The replacement payment information is incomplete. Please return to your schedule and try again.'
//         )
//       );

//       setLoading(false);

//       return;
//     }

//     setLoading(true);

//     setScreenError(null);

//     setWorkflowCheckFailed(false);

//     try {
//       /*
//        * IMPORTANT:
//        *
//        * Check the parent replacement workflow before requesting payment
//        * details. A completed cleaner-cancellation replacement must not
//        * continue into the PaymentIntent flow.
//        */
//       if (requestId) {
//         try {
//           const completed =
//             await checkReplacementWorkflow();

//           if (completed) {
//             setLoading(false);

//             /*
//              * Let the state update happen before resetting navigation.
//              */
//             setTimeout(() => {
//               if (mountedRef.current) {
//                 navigateToHostDashboard();
//               }
//             }, 150);

//             return;
//           }
//         } catch (workflowError) {
//           console.log(
//             'Could not verify replacement workflow before loading payment:',
//             workflowError
//           );

//           /*
//            * Do not assume the workflow is complete if verification failed.
//            * The payment screen can still display details, but payment
//            * initiation independently verifies the workflow.
//            */
//           setWorkflowCheckFailed(true);
//         }
//       }

//       const response =
//         await userService.getReplacementPaymentDetails(
//           String(scheduleId),
//           String(replacementRequestId)
//         );

//       const responseData =
//         unwrapResponse(response);

//       const payment =
//         responseData?.payment ??
//         responseData?.data?.payment ??
//         responseData;

//       const source =
//         getPaymentSource(payment);

//       const hostAdditionalCharge =
//         getHostAdditionalCharge(payment);

//       const normalizedPayment = {
//         ...payment,

//         source,

//         hostAdditionalCharge,

//         propertyName:
//           payment?.propertyName ||
//           payment?.property_name ||
//           propertyName ||
//           '',

//         cleaningDate:
//           payment?.cleaningDate ||
//           payment?.cleaning_date ||
//           newCleaningDate ||
//           '',

//         cleaningTime:
//           payment?.cleaningTime ||
//           payment?.cleaning_time ||
//           cleaningTime ||
//           '',

//         group:
//           payment?.group ||
//           group ||
//           '',

//         replacementCleaner:
//           payment?.replacementCleaner ||
//           cleanerName ||
//           '',

//         replacementCleanerId:
//           payment?.replacementCleanerId ||
//           cleanerId ||
//           '',

//         originalCleaner:
//           payment?.originalCleaner ||
//           replacedCleanerName ||
//           '',

//         originalCleanerId:
//           payment?.originalCleanerId ||
//           replacedCleanerId ||
//           '',

//         oldCleaningDate:
//           payment?.oldCleaningDate ||
//           payment?.old_cleaning_date ||
//           oldCleaningDate ||
//           '',

//         newCleaningDate:
//           payment?.newCleaningDate ||
//           payment?.new_cleaning_date ||
//           newCleaningDate ||
//           '',
//       };

//       /*
//        * Cleaner cancellation replacements should not require an additional
//        * host payment when the calculated host charge is zero.
//        *
//        * Do not create a PaymentIntent in this situation.
//        *
//        * Verify the workflow once more so that an already-completed
//        * replacement is sent straight to the host dashboard.
//        */
//       if (
//         source === 'cleaner_cancellation' &&
//         hostAdditionalCharge === 0
//       ) {
//         if (requestId) {
//           try {
//             const completed =
//               await checkReplacementWorkflow();

//             if (completed) {
//               setLoading(false);

//               setTimeout(() => {
//                 if (mountedRef.current) {
//                   navigateToHostDashboard();
//                 }
//               }, 150);

//               return;
//             }
//           } catch (workflowError) {
//             console.log(
//               'Could not verify cleaner-cancellation replacement:',
//               workflowError
//             );
//           }
//         }

//         /*
//          * Do not proceed to Stripe just because the replacement payment
//          * amount is zero. The assignment must be confirmed by the backend.
//          */
//         setPaymentDetails(
//           normalizedPayment
//         );

//         setScreenError(
//           tSafe(
//             'replacement_assignment_pending',
//             'No additional payment is required for this cleaner cancellation. However, the replacement assignment has not yet been confirmed. Please try again shortly.'
//           )
//         );

//         setLoading(false);

//         return;
//       }

//       if (mountedRef.current) {
//         setPaymentDetails(
//           normalizedPayment
//         );

//         setClientSecret(null);

//         setPaymentIntentId(null);
//       }
//     } catch (error) {
//       console.log(
//         'Error fetching replacement payment details:',
//         error?.response?.data || error
//       );

//       if (mountedRef.current) {
//         setScreenError(
//           error?.response?.data?.detail ||
//           error?.response?.data?.message ||
//           error?.message ||
//           tSafe(
//             'replacement_payment_load_error',
//             'Unable to load replacement payment details. Please try again.'
//           )
//         );
//       }
//     } finally {
//       if (mountedRef.current) {
//         setLoading(false);
//       }
//     }
//   }, [
//     scheduleId,
//     replacementRequestId,
//     requestId,
//     propertyName,
//     newCleaningDate,
//     cleaningTime,
//     group,
//     cleanerName,
//     cleanerId,
//     replacedCleanerName,
//     replacedCleanerId,
//     oldCleaningDate,
//     checkReplacementWorkflow,
//     navigateToHostDashboard,
//   ]);


//   /* --------------------------- refresh on focus --------------------------- */

//   useFocusEffect(
//     useCallback(() => {
//       let active = true;

//       const load = async () => {
//         if (!active) {
//           return;
//         }

//         await fetchPaymentDetails();
//       };

//       load();

//       return () => {
//         active = false;
//       };
//     }, [
//       fetchPaymentDetails,
//     ])
//   );


//   /* ---------------------- automatic completion polling --------------------- */

//   const waitForReplacementCompletion = useCallback(async () => {
//     if (pollingRef.current) {
//       return;
//     }

//     pollingRef.current = true;

//     setPaymentProcessing(true);

//     /*
//      * Allow time for the Stripe webhook and backend replacement workflow
//      * to update the persisted replacement request.
//      */
//     const maxAttempts = 12;

//     const delayMs = 3000;

//     try {
//       for (
//         let attempt = 1;
//         attempt <= maxAttempts;
//         attempt += 1
//       ) {
//         if (!mountedRef.current) {
//           return;
//         }

//         console.log(
//           `Checking replacement completion (${attempt}/${maxAttempts})`
//         );

//         try {
//           const completed =
//             await checkReplacementWorkflow();

//           if (completed) {
//             setPaymentProcessing(false);

//             setReplacementCompleted(true);

//             setTimeout(() => {
//               if (mountedRef.current) {
//                 navigateToHostDashboard();
//               }
//             }, 700);

//             return;
//           }
//         } catch (error) {
//           console.log(
//             'Replacement completion check failed:',
//             error
//           );
//         }

//         if (attempt < maxAttempts) {
//           await new Promise((resolve) => {
//             setTimeout(
//               resolve,
//               delayMs
//             );
//           });
//         }
//       }

//       if (mountedRef.current) {
//         setPaymentProcessing(false);

//         Alert.alert(
//           tSafe(
//             'replacement_processing',
//             'Replacement Processing'
//           ),
//           tSafe(
//             'replacement_payment_processing_message',
//             'Your payment was submitted, but the replacement confirmation is still processing. Please check your schedule again shortly.'
//           ),
//           [
//             {
//               text: tSafe(
//                 'go_to_dashboard',
//                 'Go to Dashboard'
//               ),
//               onPress:
//                 navigateToHostDashboard,
//             },
//           ]
//         );
//       }
//     } finally {
//       pollingRef.current = false;
//     }
//   }, [
//     checkReplacementWorkflow,
//     navigateToHostDashboard,
//   ]);


//   /* -------------------------- start payment flow --------------------------- */

//   const handlePayment = useCallback(async () => {
//     if (paymentStartingRef.current) {
//       return;
//     }

//     if (!acceptedPolicy) {
//       Alert.alert(
//         tSafe(
//           'policy_required_title',
//           'Confirmation Required'
//         ),
//         tSafe(
//           'policy_required_message',
//           'Please review and accept the replacement payment policy before continuing.'
//         )
//       );

//       return;
//     }

//     if (
//       !scheduleId ||
//       !replacementRequestId
//     ) {
//       Alert.alert(
//         tSafe(
//           'missing_information',
//           'Missing Information'
//         ),
//         tSafe(
//           'replacement_payment_missing_ids',
//           'The replacement payment information is incomplete. Please return to your schedule and try again.'
//         )
//       );

//       return;
//     }

//     paymentStartingRef.current = true;

//     setPaymentLoading(true);

//     setScreenError(null);

//     try {
//       /*
//        * First protection:
//        * never initiate payment if the replacement is already completed.
//        */
//       if (requestId) {
//         let completed;

//         try {
//           completed =
//             await checkReplacementWorkflow();
//         } catch (workflowError) {
//           console.log(
//             'Could not verify workflow before payment:',
//             workflowError
//           );

//           throw new Error(
//             tSafe(
//               'replacement_workflow_verification_failed',
//               'We could not verify the replacement assignment. No payment was started. Please try again.'
//             )
//           );
//         }

//         if (completed) {
//           navigateToHostDashboard();

//           return;
//         }
//       }

//       /*
//        * Use the payment amount returned by the backend.
//        * Do not infer a payment amount from the replacement fee or cleaner
//        * information.
//        */
//       const source =
//         getPaymentSource(paymentDetails);

//       const amount =
//         getHostAdditionalCharge(paymentDetails);

//       /*
//        * Second protection:
//        * a cleaner-cancellation replacement with no host charge must never
//        * create a Stripe PaymentIntent.
//        */
//       if (
//         source === 'cleaner_cancellation' &&
//         amount === 0
//       ) {
//         let completed = false;

//         if (requestId) {
//           try {
//             completed =
//               await checkReplacementWorkflow();
//           } catch (workflowError) {
//             console.log(
//               'Workflow check failed for zero-charge replacement:',
//               workflowError
//             );
//           }
//         }

//         if (completed) {
//           navigateToHostDashboard();

//           return;
//         }

//         throw new Error(
//           tSafe(
//             'replacement_assignment_pending',
//             'No additional payment is required for this cleaner cancellation, but the replacement assignment has not yet been confirmed. No payment was started. Please try again shortly.'
//           )
//         );
//       }

//       /*
//        * Reject invalid or zero amounts in the payment flow.
//        * This is a safety check in addition to the cleaner-cancellation guard.
//        */
//       if (
//         amount === null ||
//         !Number.isFinite(amount) ||
//         amount <= 0
//       ) {
//         throw new Error(
//           tSafe(
//             'invalid_replacement_payment_amount',
//             'The additional payment amount is invalid. No payment was started. Please refresh the replacement details.'
//           )
//         );
//       }

//       if (!paymentDetails) {
//         throw new Error(
//           tSafe(
//             'replacement_payment_details_missing',
//             'Replacement payment details are not available. Please try again.'
//           )
//         );
//       }

//       /*
//        * Retrieve the Stripe customer identifier from the payment details
//        * or the authenticated user object.
//        *
//        * Keep the existing backend contract for createReplacementPaymentIntent.
//        */
//       // const stripeCustomerId =
//       //   paymentDetails?.stripeCustomerId ||
//       //   paymentDetails?.stripe_customer_id ||
//       //   paymentDetails?.customerId ||
//       //   paymentDetails?.customer_id ||
//       //   currentUser?.stripe_customer_id ||
//       //   currentUser?.stripeCustomerId ||
//       //   null;

//       // if (!stripeCustomerId) {
//       //   throw new Error(
//       //     tSafe(
//       //       'stripe_customer_missing',
//       //       'Your payment profile could not be found. Please check your payment settings and try again.'
//       //     )
//       //   );
//       // }

//       const stripeCustomerId =
//         currentUser?.stripe_customer?.stripe_customer_id ||
//         currentUser?.stripe_customer_id ||
//         currentUser?.stripeCustomerId ||
//         currentUser?.customerId ||
//         currentUser?.stripe?.customerId ||
//         null;

//       const receiptEmail =
//         currentUser?.stripe_customer?.email ||
//         currentUser?.email ||
//         null;

//       if (!stripeCustomerId) {
//         console.error(
//           'Stripe customer ID not found in currentUser:',
//           {
//             hasCurrentUser: Boolean(currentUser),
//             hasStripeCustomer: Boolean(currentUser?.stripe_customer),
//             availableStripeCustomerKeys: currentUser?.stripe_customer
//               ? Object.keys(currentUser.stripe_customer)
//               : [],
//           }
//         );

//         throw new Error(
//               tSafe(
//                 'stripe_customer_missing',
//                 'Your payment profile could not be found. Please check your payment settings and try again.'
//               )
//             );
//       }

//       // const payload = {
//       //   scheduleId: String(scheduleId),

//       //   requestId: requestId
//       //     ? String(requestId)
//       //     : null,

//       //   replacementRequestId:
//       //     String(replacementRequestId),

//       //   cleanerId: cleanerId
//       //     ? String(cleanerId)
//       //     : null,

//       //   replacedCleanerId:
//       //     replacedCleanerId
//       //       ? String(replacedCleanerId)
//       //       : null,

//       //   customerId:
//       //     String(stripeCustomerId),

//       //   amount,

//       //   receiptEmail,

//       //   source:
//       //     source || paymentDetails?.source || null,

//       //   group:
//       //     group || paymentDetails?.group || null,
//       // };


//       // const payload = {
//       //   scheduleId: String(scheduleId),
      
//       //   requestId: String(replacementRequestId),
//       //   replacementRequestId: String(replacementRequestId),
//       //   parentRequestId: String(requestId),
      
//       //   cleanerId: cleanerId
//       //     ? String(cleanerId)
//       //     : undefined,
      
//       //   replacedCleanerId: replacedCleanerId
//       //     ? String(replacedCleanerId)
//       //     : undefined,
      
//       //   group: group || undefined,
      
//       //   customerId: stripeCustomerId,
//       //   receiptEmail,
//       //   amount,
//       // };

//       const payload = {
//         amount,
//         currency: String(paymentDetails?.currency || 'USD').toLowerCase(),
//         customerId: String(customerId),
//         receiptEmail: receiptEmail || undefined,
//         metadata: {
//           scheduleId: String(scheduleId),
//           requestId: String(replacementRequestId),
//         },
//       };
      
//       const response =
//         await userService.createReplacementPaymentIntent(payload);
      
    
//       const responseData =
//         unwrapResponse(response);

//       const secret =
//         responseData?.clientSecret ||
//         responseData?.client_secret ||
//         responseData?.paymentIntent?.client_secret ||
//         responseData?.payment_intent?.client_secret ||
//         null;

//       const intentId =
//         responseData?.paymentIntentId ||
//         responseData?.payment_intent_id ||
//         responseData?.paymentIntent?.id ||
//         responseData?.payment_intent?.id ||
//         null;

//       if (!secret) {
//         throw new Error(
//           responseData?.detail ||
//           responseData?.message ||
//           tSafe(
//             'payment_intent_secret_missing',
//             'The payment service did not return the information required to continue. Please try again.'
//           )
//         );
//       }

//       if (mountedRef.current) {
//         setClientSecret(secret);

//         setPaymentIntentId(intentId);
//       }
//     } catch (error) {
//       console.log(
//         'Replacement payment error:',
//         error?.response?.data || error
//       );

//       const message =
//         error?.response?.data?.detail ||
//         error?.response?.data?.message ||
//         error?.message ||
//         tSafe(
//           'replacement_payment_error',
//           'Unable to start the replacement payment. Please try again.'
//         );

//       if (mountedRef.current) {
//         Alert.alert(
//           tSafe(
//             'payment_error',
//             'Payment Error'
//           ),
//           message
//         );
//       }
//     } finally {
//       paymentStartingRef.current = false;

//       if (mountedRef.current) {
//         setPaymentLoading(false);
//       }
//     }
//   }, [
//     acceptedPolicy,
//     scheduleId,
//     replacementRequestId,
//     requestId,
//     paymentDetails,
//     currentUser,
//     cleanerId,
//     replacedCleanerId,
//     group,
//     receiptEmail,
//     checkReplacementWorkflow,
//     navigateToHostDashboard,
//   ]);


//   /* ----------------------------- retry loading ----------------------------- */

//   const handleRetry = useCallback(() => {
//     redirectingRef.current = false;

//     setScreenError(null);

//     setClientSecret(null);

//     setPaymentIntentId(null);

//     fetchPaymentDetails();
//   }, [
//     fetchPaymentDetails,
//   ]);


//   /* ------------------------------ formatting ------------------------------- */

//   const formatAmount = useCallback((amount) => {
//     const value = Number(amount);

//     if (!Number.isFinite(value)) {
//       return '0.00';
//     }

//     return value.toFixed(2);
//   }, []);


//   const displayDate =
//     paymentDetails?.cleaningDate ||
//     newCleaningDate ||
//     oldCleaningDate ||
//     tSafe(
//       'date_not_available',
//       'Not available'
//     );

//   const displayTime =
//     paymentDetails?.cleaningTime ||
//     cleaningTime ||
//     tSafe(
//       'time_not_available',
//       'Not available'
//     );

//   const displayProperty =
//     paymentDetails?.propertyName ||
//     propertyName ||
//     tSafe(
//       'property_not_available',
//       'Property not available'
//     );

//   const displayCleaner =
//     paymentDetails?.replacementCleaner ||
//     cleanerName ||
//     tSafe(
//       'cleaner_not_available',
//       'Replacement cleaner'
//     );

//   const displayGroup =
//     paymentDetails?.group ||
//     group ||
//     '';

//   const hostAdditionalCharge =
//     getHostAdditionalCharge(paymentDetails);


//   /* ------------------------------- loading UI ------------------------------ */

//   if (loading) {
//     return (
//       <SafeAreaView
//         style={styles.container}
//       >
//         <StatusBar
//           barStyle={
//             isDark
//               ? 'light-content'
//               : 'dark-content'
//           }
//           backgroundColor={
//             theme.background.default
//           }
//         />

//         <View
//           style={styles.centerContainer}
//         >
//           <ActivityIndicator
//             size="large"
//             color={theme.brand.primary}
//           />

//           <AppTextFallback
//             theme={theme}
//             style={styles.loadingText}
//           >
//             {tSafe(
//               'loading_replacement_payment',
//               'Loading replacement details...'
//             )}
//           </AppTextFallback>
//         </View>
//       </SafeAreaView>
//     );
//   }


//   /* -------------------------- processing completion ------------------------ */

//   if (
//     replacementCompleted ||
//     paymentProcessing
//   ) {
//     return (
//       <SafeAreaView
//         style={styles.container}
//       >
//         <StatusBar
//           barStyle={
//             isDark
//               ? 'light-content'
//               : 'dark-content'
//           }
//           backgroundColor={
//             theme.background.default
//           }
//         />

//         <View
//           style={styles.centerContainer}
//         >
//           <View
//             style={[
//               styles.statusIconContainer,
//               {
//                 backgroundColor:
//                   replacementCompleted
//                     ? theme.status.success + '18'
//                     : theme.brand.primary + '18',
//               },
//             ]}
//           >
//             <MaterialCommunityIcons
//               name={
//                 replacementCompleted
//                   ? 'check-circle-outline'
//                   : 'progress-clock'
//               }
//               size={56}
//               color={
//                 replacementCompleted
//                   ? theme.status.success
//                   : theme.brand.primary
//               }
//             />
//           </View>

//           <AppTextFallback
//             theme={theme}
//             style={styles.statusTitle}
//           >
//             {replacementCompleted
//               ? tSafe(
//                   'replacement_completed',
//                   'Replacement Completed'
//                 )
//               : tSafe(
//                   'replacement_processing',
//                   'Replacement Processing'
//                 )}
//           </AppTextFallback>

//           <AppTextFallback
//             theme={theme}
//             style={styles.statusDescription}
//           >
//             {replacementCompleted
//               ? tSafe(
//                   'replacement_completed_message',
//                   'Your replacement cleaner has been assigned successfully.'
//                 )
//               : tSafe(
//                   'replacement_processing_message',
//                   'Please wait while we confirm the replacement assignment.'
//                 )}
//           </AppTextFallback>

//           {paymentProcessing && (
//             <ActivityIndicator
//               size="large"
//               color={theme.brand.primary}
//               style={styles.processingIndicator}
//             />
//           )}

//           <Button
//             mode="contained"
//             onPress={
//               navigateToHostDashboard
//             }
//             style={styles.primaryButton}
//             contentStyle={
//               styles.buttonContent
//             }
//             buttonColor={
//               theme.brand.primary
//             }
//             textColor={
//               theme.text.inverse
//             }
//           >
//             {tSafe(
//               'go_to_dashboard',
//               'Go to Dashboard'
//             )}
//           </Button>
//         </View>
//       </SafeAreaView>
//     );
//   }


//   /* -------------------------------- main UI -------------------------------- */

//   return (
//     <SafeAreaView
//       style={styles.container}
//     >
//       <StatusBar
//         barStyle={
//           isDark
//             ? 'light-content'
//             : 'dark-content'
//         }
//         backgroundColor={
//           theme.background.default
//         }
//       />

//       <ScrollView
//         style={styles.scrollView}
//         contentContainerStyle={
//           styles.scrollContent
//         }
//         showsVerticalScrollIndicator={false}
//       >
//         {/* -------------------------------- heading ------------------------------- */}

//         <View
//           style={styles.header}
//         >
//           <View
//             style={styles.headerIcon}
//           >
//             <MaterialCommunityIcons
//               name="account-switch-outline"
//               size={28}
//               color={theme.brand.primary}
//             />
//           </View>

//           <AppTextFallback
//             theme={theme}
//             style={styles.title}
//           >
//             {tSafe(
//               'replacement_payment_title',
//               'Replacement Cleaner'
//             )}
//           </AppTextFallback>

//           <AppTextFallback
//             theme={theme}
//             style={styles.subtitle}
//           >
//             {tSafe(
//               'replacement_payment_subtitle',
//               'Review the replacement details before continuing.'
//             )}
//           </AppTextFallback>
//         </View>


//         {/* ------------------------------- error --------------------------------- */}

//         {screenError && (
//           <Card
//             style={styles.errorCard}
//             mode="outlined"
//           >
//             <Card.Content>
//               <View
//                 style={styles.messageRow}
//               >
//                 <MaterialCommunityIcons
//                   name="alert-circle-outline"
//                   size={24}
//                   color={theme.status.error}
//                 />

//                 <View
//                   style={styles.messageContent}
//                 >
//                   <AppTextFallback
//                     theme={theme}
//                     style={styles.errorTitle}
//                   >
//                     {tSafe(
//                       'attention_required',
//                       'Attention Required'
//                     )}
//                   </AppTextFallback>

//                   <AppTextFallback
//                     theme={theme}
//                     style={styles.errorMessage}
//                   >
//                     {screenError}
//                   </AppTextFallback>
//                 </View>
//               </View>

//               <Button
//                 mode="outlined"
//                 onPress={handleRetry}
//                 style={styles.retryButton}
//                 textColor={theme.brand.primary}
//               >
//                 {tSafe(
//                   'try_again',
//                   'Try Again'
//                 )}
//               </Button>
//             </Card.Content>
//           </Card>
//         )}



//         {/* ---------------------- Replacement Details ---------------------- */}

//         <Card
//           style={styles.replacementDetailsCard}
//           mode="elevated"
//         >
//           <Card.Content style={styles.replacementDetailsContent}>
//             {/* Section heading */}
//             <View style={styles.replacementSectionHeading}>
//               <View style={styles.replacementHeadingIcon}>
//                 <MaterialCommunityIcons
//                   name="account-switch-outline"
//                   size={24}
//                   color={theme.brand.primary}
//                 />
//               </View>

//               <View style={styles.replacementHeadingText}>
//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.replacementSectionTitle}
//                 >
//                   {tSafe(
//                     'replacement_details',
//                     'Replacement Details'
//                   )}
//                 </AppTextFallback>

//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.replacementSectionSubtitle}
//                 >
//                   Your updated cleaning arrangement
//                 </AppTextFallback>
//               </View>
//             </View>

//             {/* Replacement cleaner profile */}
//             <View style={styles.replacementCleanerCard}>
//               <View style={styles.replacementCleanerAvatar}>
//                 <MaterialCommunityIcons
//                   name="account-check-outline"
//                   size={32}
//                   color={theme.brand.primary}
//                 />
//               </View>

//               <View style={styles.replacementCleanerInfo}>
//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.replacementFieldLabel}
//                 >
//                   {tSafe(
//                     'replacement_cleaner',
//                     'Replacement Cleaner'
//                   )}
//                 </AppTextFallback>

//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.replacementCleanerName}
//                 >
//                   {displayCleaner}
//                 </AppTextFallback>

//                 {!!displayGroup && (
//                   <View style={styles.replacementGroupBadge}>
//                     <MaterialCommunityIcons
//                       name="account-group-outline"
//                       size={14}
//                       color={theme.brand.primary}
//                     />

//                     <AppTextFallback
//                       theme={theme}
//                       style={styles.replacementGroupText}
//                     >
//                       {displayGroup
//                         .replace(/_/g, ' ')
//                         .replace(/\b\w/g, (char) =>
//                           char.toUpperCase()
//                         )}
//                     </AppTextFallback>
//                   </View>
//                 )}
//               </View>

//               <MaterialCommunityIcons
//                 name="check-circle"
//                 size={22}
//                 color={theme.status.success}
//               />
//             </View>

//             {/* Property information */}
//             <View style={styles.replacementPropertyCard}>
//               <View style={styles.replacementPropertyIcon}>
//                 <MaterialCommunityIcons
//                   name="home-outline"
//                   size={22}
//                   color={theme.brand.primary}
//                 />
//               </View>

//               <View style={styles.replacementPropertyInfo}>
//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.replacementFieldLabel}
//                 >
//                   {tSafe('property', 'Property')}
//                 </AppTextFallback>

//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.replacementPropertyName}
//                 >
//                   {displayProperty}
//                 </AppTextFallback>
//               </View>
//             </View>

//             {/* Cleaning date and time */}
//             <View style={styles.replacementScheduleRow}>
//               <View style={styles.replacementScheduleTile}>
//                 <View style={styles.replacementScheduleIcon}>
//                   <MaterialCommunityIcons
//                     name="calendar-month-outline"
//                     size={21}
//                     color={theme.brand.primary}
//                   />
//                 </View>

//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.replacementFieldLabel}
//                 >
//                   {tSafe('cleaning_date', 'Cleaning Date')}
//                 </AppTextFallback>

//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.replacementScheduleValue}
//                 >
//                   {displayDate}
//                 </AppTextFallback>
//               </View>

//               <View style={styles.replacementScheduleTile}>
//                 <View style={styles.replacementScheduleIcon}>
//                   <MaterialCommunityIcons
//                     name="clock-outline"
//                     size={21}
//                     color={theme.brand.primary}
//                   />
//                 </View>

//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.replacementFieldLabel}
//                 >
//                   {tSafe('cleaning_time', 'Cleaning Time')}
//                 </AppTextFallback>

//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.replacementScheduleValue}
//                 >
//                   {displayTime}
//                 </AppTextFallback>
//               </View>
//             </View>

//             {/* Original cleaner */}
//             {!!(
//               paymentDetails?.originalCleaner ||
//               replacedCleanerName
//             ) && (
//               <View style={styles.replacementOriginalCleaner}>
//                 <MaterialCommunityIcons
//                   name="account-arrow-left-outline"
//                   size={20}
//                   color={theme.text.secondary}
//                 />

//                 <View style={styles.replacementOriginalCleanerInfo}>
//                   <AppTextFallback
//                     theme={theme}
//                     style={styles.replacementFieldLabel}
//                   >
//                     {tSafe(
//                       'original_cleaner',
//                       'Original Cleaner'
//                     )}
//                   </AppTextFallback>

//                   <AppTextFallback
//                     theme={theme}
//                     style={styles.replacementOriginalCleanerName}
//                   >
//                     {paymentDetails?.originalCleaner ||
//                       replacedCleanerName}
//                   </AppTextFallback>
//                 </View>
//               </View>
//             )}

//             {/* Previous cleaning date */}
//             {!!oldCleaningDate && (
//               <View style={styles.replacementPreviousDate}>
//                 <MaterialCommunityIcons
//                   name="calendar-arrow-right"
//                   size={19}
//                   color={theme.text.secondary}
//                 />

//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.replacementPreviousDateLabel}
//                 >
//                   {tSafe(
//                     'previous_cleaning_date',
//                     'Previous Cleaning Date'
//                   )}
//                 </AppTextFallback>

//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.replacementPreviousDateValue}
//                 >
//                   {oldCleaningDate}
//                 </AppTextFallback>
//               </View>
//             )}
//           </Card.Content>
//         </Card>

//         {/* ---------------------------- payment details -------------------------- */}

//         <Card
//           style={styles.card}
//           mode="elevated"
//         >
//           <Card.Content>
//             <View
//               style={styles.sectionHeading}
//             >
//               <MaterialCommunityIcons
//                 name="credit-card-outline"
//                 size={22}
//                 color={theme.brand.primary}
//               />

//               <AppTextFallback
//                 theme={theme}
//                 style={styles.sectionTitle}
//               >
//                 {tSafe(
//                   'payment_summary',
//                   'Payment Summary'
//                 )}
//               </AppTextFallback>
//             </View>

//             <Divider
//               style={styles.divider}
//             />

//             <View
//               style={styles.amountRow}
//             >
//               <AppTextFallback
//                 theme={theme}
//                 style={styles.amountLabel}
//               >
//                 {tSafe(
//                   'replacement_additional_charge',
//                   'Additional Payment'
//                 )}
//               </AppTextFallback>

//               <AppTextFallback
//                 theme={theme}
//                 style={styles.amountValue}
//               >
//                 {paymentDetails?.currencySymbol ||
//                   '$'}
//                 {hostAdditionalCharge === null
//                   ? '—'
//                   : formatAmount(
//                       hostAdditionalCharge
//                     )}
//               </AppTextFallback>
//             </View>

//             <AppTextFallback
//               theme={theme}
//               style={styles.paymentHint}
//             >
//               {hostAdditionalCharge === 0
//                 ? tSafe(
//                     'no_additional_payment',
//                     'No additional payment is required.'
//                   )
//                 : tSafe(
//                     'payment_amount_notice',
//                     'Only the additional payment displayed above will be processed.'
//                   )}
//             </AppTextFallback>

//             {getPaymentSource(paymentDetails) ===
//               'cleaner_cancellation' && (
//               <View
//                 style={styles.noChargeNotice}
//               >
//                 <MaterialCommunityIcons
//                   name="check-circle-outline"
//                   size={21}
//                   color={theme.status.success}
//                 />

//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.noChargeText}
//                 >
//                   {tSafe(
//                     'cleaner_cancellation_no_charge',
//                     'This replacement follows a cleaner cancellation. No additional host payment is required when the calculated charge is zero.'
//                   )}
//                 </AppTextFallback>
//               </View>
//             )}
//           </Card.Content>
//         </Card>


//         {/* ----------------------------- policy --------------------------------- */}

//         {!screenError && (
//           <Card
//             style={styles.policyCard}
//             mode="outlined"
//           >
//             <Card.Content>
//               <View
//                 style={styles.policyHeader}
//               >
//                 <MaterialCommunityIcons
//                   name="shield-check-outline"
//                   size={22}
//                   color={theme.brand.primary}
//                 />

//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.policyTitle}
//                 >
//                   {tSafe(
//                     'replacement_payment_policy',
//                     'Payment Confirmation'
//                   )}
//                 </AppTextFallback>
//               </View>

//               <TouchableOpacity
//                 activeOpacity={0.8}
//                 onPress={() =>
//                   setAcceptedPolicy(
//                     (previous) => !previous
//                   )
//                 }
//                 style={styles.checkboxRow}
//               >
//                 <Checkbox
//                   status={
//                     acceptedPolicy
//                       ? 'checked'
//                       : 'unchecked'
//                   }
//                   onPress={() =>
//                     setAcceptedPolicy(
//                       (previous) => !previous
//                     )
//                   }
//                   color={theme.brand.primary}
//                   uncheckedColor={
//                     theme.text.secondary
//                   }
//                 />

//                 <View
//                   style={styles.policyTextContainer}
//                 >
//                   <AppTextFallback
//                     theme={theme}
//                     style={styles.policyText}
//                   >
//                     {tSafe(
//                       'replacement_payment_acceptance',
//                       'I have reviewed the replacement details and authorize the additional payment shown above, if one is required.'
//                     )}
//                   </AppTextFallback>
//                 </View>
//               </TouchableOpacity>
//             </Card.Content>
//           </Card>
//         )}


//         {/* ---------------------------- payment button --------------------------- */}

//         {!screenError &&
//           !clientSecret &&
//           hostAdditionalCharge !== null &&
//           hostAdditionalCharge > 0 && (
//             <Button
//               mode="contained"
//               onPress={handlePayment}
//               loading={paymentLoading}
//               disabled={
//                 paymentLoading ||
//                 !acceptedPolicy
//               }
//               style={styles.primaryButton}
//               contentStyle={
//                 styles.buttonContent
//               }
//               buttonColor={
//                 theme.brand.primary
//               }
//               textColor={
//                 theme.text.inverse
//               }
//               icon="lock-outline"
//             >
//               {paymentLoading
//                 ? tSafe(
//                     'preparing_payment',
//                     'Preparing Payment...'
//                   )
//                 : tSafe(
//                     'continue_to_payment',
//                     'Continue to Payment'
//                   )}
//             </Button>
//           )}


//         {/* ------------------------- Stripe payment UI -------------------------- */}

//         {!!clientSecret && (
//           <Card
//             style={styles.stripeCard}
//             mode="outlined"
//           >
//             <Card.Content>
//               <View
//                 style={styles.sectionHeading}
//               >
//                 <MaterialCommunityIcons
//                   name="lock-check-outline"
//                   size={22}
//                   color={theme.status.success}
//                 />

//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.sectionTitle}
//                 >
//                   {tSafe(
//                     'secure_payment',
//                     'Secure Payment'
//                   )}
//                 </AppTextFallback>
//               </View>

//               <AppTextFallback
//                 theme={theme}
//                 style={styles.paymentHint}
//               >
//                 {tSafe(
//                   'stripe_secure_payment_message',
//                   'Complete the payment below to continue.'
//                 )}
//               </AppTextFallback>

//               <StripeGroupPaymentButton
//                 clientSecret={clientSecret}
//                 paymentIntentId={paymentIntentId}
//                 amount={hostAdditionalCharge}
//                 onSuccess={
//                   waitForReplacementCompletion
//                 }
//               />
//             </Card.Content>
//           </Card>
//         )}


//         {/* ---------------------------- footer action --------------------------- */}

//         <TouchableOpacity
//           activeOpacity={0.8}
//           onPress={
//             navigateToHostDashboard
//           }
//           style={styles.cancelAction}
//         >
//           <MaterialCommunityIcons
//             name="arrow-left"
//             size={18}
//             color={theme.text.secondary}
//           />

//           <AppTextFallback
//             theme={theme}
//             style={styles.cancelActionText}
//           >
//             {tSafe(
//               'return_to_dashboard',
//               'Return to Dashboard'
//             )}
//           </AppTextFallback>
//         </TouchableOpacity>

//       </ScrollView>
//     </SafeAreaView>
//   );
// };


// /* -------------------------------------------------------------------------- */
// /*                          Shared display components                         */
// /* -------------------------------------------------------------------------- */

// /*
//  * This small text wrapper keeps the screen compatible with the theme tokens
//  * used by the Dashboard without assuming additional AppText props that may
//  * differ across your shared UI implementation.
//  *
//  * If your shared AppText component supports a "variant" prop, you can replace
//  * this wrapper with AppText and pass the corresponding variant.
//  */

// const AppTextFallback = ({
//   children,
//   theme,
//   style,
//   numberOfLines,
// }) => {
//   const { Text } = require('react-native');

//   return (
//     <Text
//       numberOfLines={numberOfLines}
//       style={[
//         {
//           color: theme.text.primary,
//         },
//         style,
//       ]}
//     >
//       {children}
//     </Text>
//   );
// };


// const DetailRow = ({
//   theme,
//   icon,
//   label,
//   value,
// }) => (
//   <View
//     style={detailRowStyles.row}
//   >
//     <View
//       style={[
//         detailRowStyles.iconContainer,
//         {
//           backgroundColor:
//             theme.surface.selected,
//         },
//       ]}
//     >
//       <MaterialCommunityIcons
//         name={icon}
//         size={19}
//         color={theme.icon.default}
//       />
//     </View>

//     <View
//       style={detailRowStyles.content}
//     >
//       <AppTextFallback
//         theme={theme}
//         style={[
//           detailRowStyles.label,
//           {
//             color: theme.text.secondary,
//           },
//         ]}
//       >
//         {label}
//       </AppTextFallback>

//       <AppTextFallback
//         theme={theme}
//         style={detailRowStyles.value}
//       >
//         {value || '—'}
//       </AppTextFallback>
//     </View>
//   </View>
// );


// const detailRowStyles = StyleSheet.create({
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//   },

//   iconContainer: {
//     width: 38,
//     height: 38,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },

//   content: {
//     flex: 1,
//   },

//   label: {
//     fontSize: 12,
//     marginBottom: 3,
//   },

//   value: {
//     fontSize: 14,
//     fontWeight: '600',
//   },

  
// });


// /* -------------------------------------------------------------------------- */
// /*                                    Styles                                  */
// /* -------------------------------------------------------------------------- */

// const createStyles = (theme) => {
//   const cardShadow = {
//     shadowColor:
//       theme.shadow?.color || '#000000',

//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },

//     shadowOpacity:
//       theme.shadow?.opacity || 0.06,

//     shadowRadius: 12,

//     elevation: 2,
//   };

//   return StyleSheet.create({
//     /* -------------------------------- container ------------------------------- */

//     container: {
//       flex: 1,

//       backgroundColor:
//         theme.background.default,
//     },

//     scrollView: {
//       flex: 1,
//     },

//     scrollContent: {
//       paddingHorizontal: S.lg,
//       paddingTop: S.lg,
//       paddingBottom: 48,
//     },

//     centerContainer: {
//       flex: 1,

//       alignItems: 'center',
//       justifyContent: 'center',

//       paddingHorizontal: S.xl,

//       backgroundColor:
//         theme.background.default,
//     },

//     /* -------------------------------- loading -------------------------------- */

//     loadingText: {
//       marginTop: S.lg,

//       fontSize: 14,

//       color:
//         theme.text.secondary,

//       textAlign: 'center',
//     },

//     processingIndicator: {
//       marginTop: S.xl,
//     },

//     /* -------------------------------- header --------------------------------- */

//     header: {
//       alignItems: 'center',

//       marginBottom: S.xl,

//       paddingHorizontal: S.sm,
//     },

//     headerIcon: {
//       width: 64,
//       height: 64,

//       borderRadius: R.lg,

//       backgroundColor:
//         `${theme.brand.primary}15`,

//       alignItems: 'center',
//       justifyContent: 'center',

//       marginBottom: S.md,
//     },

//     title: {
//       color: theme.text.primary,

//       fontSize: 25,
//       fontWeight: '800',

//       textAlign: 'center',

//       letterSpacing: -0.5,
//     },

//     subtitle: {
//       color: theme.text.secondary,

//       fontSize: 14,
//       lineHeight: 21,

//       textAlign: 'center',

//       marginTop: S.sm,

//       maxWidth: 340,
//     },

//     /* -------------------------------- cards ---------------------------------- */

//     card: {
//       marginBottom: S.lg,
//       backgroundColor: theme.surface.default,
//       borderRadius: R.lg,
//       overflow: 'hidden',
//       ...cardShadow,
//     },

//     policyCard: {
//       marginBottom: S.lg,

//       backgroundColor:
//         theme.surface.default,

//       borderRadius: R.lg,

//       borderColor:
//         theme.border.default,
//     },

//     stripeCard: {
//       marginTop: S.lg,
//       marginBottom: S.lg,

//       backgroundColor:
//         theme.surface.default,

//       borderRadius: R.lg,

//       borderColor:
//         theme.border.default,
//     },

//     /* ------------------------------ section heading -------------------------- */

//     sectionHeading: {

//       flexDirection: 'row',
    
//       alignItems: 'center',
    
//       marginBottom: S.md,
    
//       paddingVertical: S.xs,
    
//     },

//     sectionTitle: {
//       marginLeft: S.sm,

//       color: theme.text.primary,

//       fontSize: 16,
//       fontWeight: '700',

//       letterSpacing: -0.2,
//     },

//     divider: {
//       backgroundColor:
//         theme.border.default,

//       marginBottom: S.sm,
//     },

//     /* ----------------------------- payment amount ---------------------------- */

//     amountRow: {
//       flexDirection: 'row',

//       justifyContent: 'space-between',
//       alignItems: 'center',

//       gap: S.md,

//       paddingVertical: S.md,
//     },

//     amountLabel: {
//       flex: 1,

//       fontSize: 14,

//       color: theme.text.secondary,
//     },

//     amountValue: {
//       fontSize: 24,

//       fontWeight: '800',

//       letterSpacing: -0.5,

//       color: theme.brand.primary,
//     },

//     paymentHint: {
//       fontSize: 13,

//       lineHeight: 20,

//       color: theme.text.secondary,

//       marginTop: S.sm,
//     },

//     noChargeNotice: {
//       flexDirection: 'row',
//       alignItems: 'flex-start',

//       gap: S.sm,

//       marginTop: S.md,

//       padding: S.md,

//       borderRadius: R.md,

//       backgroundColor:
//         `${theme.status.success}12`,
//     },

//     noChargeText: {
//       flex: 1,

//       fontSize: 13,

//       lineHeight: 19,

//       color: theme.text.primary,
//     },

//     /* -------------------------------- policy --------------------------------- */

//     policyHeader: {
//       flexDirection: 'row',
//       alignItems: 'center',

//       marginBottom: S.sm,
//     },

//     policyTitle: {
//       marginLeft: S.sm,

//       fontSize: 15,
//       fontWeight: '700',

//       color: theme.text.primary,
//     },

//     checkboxRow: {
//       flexDirection: 'row',
//       alignItems: 'flex-start',

//       marginTop: S.sm,

//       marginLeft: -S.sm,
//     },

//     policyTextContainer: {
//       flex: 1,

//       paddingTop: 10,
//       paddingRight: S.xs,
//     },

//     policyText: {
//       fontSize: 13,

//       lineHeight: 20,

//       color: theme.text.secondary,
//     },

//     /* -------------------------------- buttons -------------------------------- */

//     primaryButton: {
//       marginTop: S.md,
//       marginBottom: S.md,

//       borderRadius: R.md,

//       backgroundColor:
//         theme.brand.primary,
//     },

//     buttonContent: {
//       minHeight: 50,

//       paddingHorizontal: S.md,
//     },

//     retryButton: {
//       marginTop: S.md,

//       borderRadius: R.md,

//       borderColor:
//         theme.border.default,
//     },

//     cancelAction: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',

//       gap: S.sm,

//       paddingVertical: S.lg,

//       marginTop: S.xs,
//     },

//     cancelActionText: {
//       fontSize: 14,

//       fontWeight: '600',

//       color: theme.text.secondary,
//     },

//     /* -------------------------------- errors --------------------------------- */

//     errorCard: {
//       marginBottom: S.lg,

//       backgroundColor:
//         theme.surface.default,

//       borderRadius: R.md,

//       borderColor:
//         `${theme.status.error}60`,
//     },

//     messageRow: {
//       flexDirection: 'row',
//       alignItems: 'flex-start',

//       gap: S.md,
//     },

//     messageContent: {
//       flex: 1,
//     },

//     errorTitle: {
//       fontSize: 15,

//       fontWeight: '700',

//       color: theme.status.error,

//       marginBottom: S.xs,
//     },

//     errorMessage: {
//       fontSize: 13,

//       lineHeight: 20,

//       color: theme.text.secondary,
//     },

//     /* ------------------------------ status screen ---------------------------- */

//     statusIconContainer: {
//       width: 104,
//       height: 104,

//       borderRadius: R.pill,

//       alignItems: 'center',
//       justifyContent: 'center',

//       marginBottom: S.xl,
//     },

//     statusTitle: {
//       fontSize: 23,

//       fontWeight: '800',

//       letterSpacing: -0.4,

//       color: theme.text.primary,

//       textAlign: 'center',
//     },

//     statusDescription: {
//       marginTop: S.md,

//       fontSize: 14,

//       lineHeight: 22,

//       color: theme.text.secondary,

//       textAlign: 'center',

//       maxWidth: 340,
//     },

//     /* ---------------------- Replacement Details redesign ---------------------- */

// replacementDetailsCard: {
//   marginBottom: S.lg,
//   backgroundColor: theme.surface.default,
//   borderRadius: R.lg,
//   overflow: 'hidden',
//   ...cardShadow,
// },

// replacementDetailsContent: {
//   paddingVertical: S.lg,
// },

// replacementSectionHeading: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   marginBottom: S.lg,
// },

// replacementHeadingIcon: {
//   width: 46,
//   height: 46,
//   borderRadius: 14,
//   alignItems: 'center',
//   justifyContent: 'center',
//   backgroundColor: `${theme.brand.primary}15`,
// },

// replacementHeadingText: {
//   flex: 1,
//   marginLeft: S.md,
// },

// replacementSectionTitle: {
//   fontSize: 18,
//   fontWeight: '800',
//   letterSpacing: -0.3,
//   color: theme.text.primary,
// },

// replacementSectionSubtitle: {
//   marginTop: 3,
//   fontSize: 12,
//   lineHeight: 18,
//   color: theme.text.secondary,
// },

// /* Replacement cleaner profile */

// replacementCleanerCard: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   padding: S.md,
//   marginBottom: S.md,
//   borderRadius: R.md,
//   backgroundColor: `${theme.brand.primary}0D`,
//   borderWidth: 1,
//   borderColor: `${theme.brand.primary}25`,
// },

// replacementCleanerAvatar: {
//   width: 52,
//   height: 52,
//   borderRadius: 16,
//   alignItems: 'center',
//   justifyContent: 'center',
//   backgroundColor: `${theme.brand.primary}18`,
//   marginRight: S.md,
// },

// replacementCleanerInfo: {
//   flex: 1,
//   minWidth: 0,
// },

// replacementCleanerName: {
//   fontSize: 16,
//   lineHeight: 22,
//   fontWeight: '800',
//   color: theme.text.primary,
// },

// replacementFieldLabel: {
//   fontSize: 11,
//   fontWeight: '500',
//   letterSpacing: 0.3,
//   color: theme.text.secondary,
//   marginBottom: 5,
// },

// replacementGroupBadge: {
//   alignSelf: 'flex-start',
//   flexDirection: 'row',
//   alignItems: 'center',
//   paddingHorizontal: S.sm,
//   paddingVertical: S.xs,
//   marginTop: S.sm,
//   borderRadius: R.pill,
//   backgroundColor: `${theme.brand.primary}15`,
//   gap: S.xs,
// },

// replacementGroupText: {
//   fontSize: 11,
//   fontWeight: '700',
//   color: theme.brand.primary,
// },

// /* Property card */

// replacementPropertyCard: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   padding: S.md,
//   marginBottom: S.md,
//   borderRadius: R.md,
//   backgroundColor: theme.background.default,
//   borderWidth: 1,
//   borderColor: theme.border.default,
// },

// replacementPropertyIcon: {
//   width: 42,
//   height: 42,
//   borderRadius: 12,
//   alignItems: 'center',
//   justifyContent: 'center',
//   backgroundColor: theme.surface.selected,
//   marginRight: S.md,
// },

// replacementPropertyInfo: {
//   flex: 1,
//   minWidth: 0,
// },

// replacementPropertyName: {
//   fontSize: 14,
//   lineHeight: 21,
//   fontWeight: '700',
//   color: theme.text.primary,
// },

// /* Date and time cards */

// replacementScheduleRow: {
//   flexDirection: 'row',
//   alignItems: 'stretch',
//   gap: S.md,
//   marginBottom: S.md,
// },

// replacementScheduleTile: {
//   flex: 1,
//   minWidth: 0,
//   padding: S.md,
//   borderRadius: R.md,
//   backgroundColor: theme.background.default,
//   borderWidth: 1,
//   borderColor: theme.border.default,
// },

// replacementScheduleIcon: {
//   width: 36,
//   height: 36,
//   borderRadius: 11,
//   alignItems: 'center',
//   justifyContent: 'center',
//   backgroundColor: theme.surface.selected,
//   marginBottom: S.md,
// },

// replacementScheduleValue: {
//   fontSize: 13,
//   lineHeight: 20,
//   fontWeight: '700',
//   color: theme.text.primary,
// },

// /* Original cleaner */

// replacementOriginalCleaner: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   paddingTop: S.md,
//   marginTop: S.xs,
//   borderTopWidth: StyleSheet.hairlineWidth,
//   borderTopColor: theme.border.default,
// },

// replacementOriginalCleanerInfo: {
//   flex: 1,
//   marginLeft: S.md,
// },

// replacementOriginalCleanerName: {
//   fontSize: 13,
//   lineHeight: 19,
//   fontWeight: '600',
//   color: theme.text.primary,
// },

// /* Previous cleaning date */

// replacementPreviousDate: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   flexWrap: 'wrap',
//   gap: S.sm,
//   marginTop: S.md,
//   paddingTop: S.md,
//   borderTopWidth: StyleSheet.hairlineWidth,
//   borderTopColor: theme.border.default,
// },

// replacementPreviousDateLabel: {
//   flex: 1,
//   fontSize: 12,
//   color: theme.text.secondary,
// },

// replacementPreviousDateValue: {
//   fontSize: 12,
//   fontWeight: '700',
//   color: theme.text.primary,
// },

    
//   });
// };


// export default ReplacementPayment;








// import React, {
//   useCallback,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
// } from 'react';

// import {
//   Alert,
//   ActivityIndicator,
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   TouchableOpacity,
//   View,
// } from 'react-native';

// import {
//   Button,
//   Card,
//   Checkbox,
//   Divider,
// } from 'react-native-paper';

// import {
//   MaterialCommunityIcons,
// } from '@expo/vector-icons';

// import {
//   useNavigation,
//   useRoute,
//   useFocusEffect,
// } from '@react-navigation/native';

// import { AuthContext } from '../../context/AuthContext';

// import userService from '../../services/connection/userService';

// import { tSafe } from '../../utils/tSafe';

// import { useTheme } from '../../theme';

// import StripeGroupPaymentButton from '../../components/shared/StripeGroupPaymentButton';
// import ROUTES from '../../constants/routes';


// /* -------------------------------------------------------------------------- */
// /*                                   Tokens                                   */
// /* -------------------------------------------------------------------------- */

// const S = {
//   xs: 4,
//   sm: 8,
//   md: 12,
//   lg: 16,
//   xl: 20,
//   xxl: 24,
//   xxxl: 32,
// };

// const R = {
//   sm: 10,
//   md: 16,
//   lg: 22,
//   pill: 999,
// };


// /* -------------------------------------------------------------------------- */
// /*                              Helper functions                              */
// /* -------------------------------------------------------------------------- */

// const unwrapResponse = (response) => {
//   return response?.data ?? response ?? {};
// };

// const getIdentifier = (value) => {
//   if (value == null) {
//     return '';
//   }

//   if (typeof value === 'object') {
//     return String(
//       value._id ??
//       value.id ??
//       value.$oid ??
//       ''
//     );
//   }

//   return String(value);
// };

// const normalizeStatus = (value) => {
//   return String(value ?? '')
//     .trim()
//     .toLowerCase();
// };

// const getWorkflowList = (response) => {
//   const data = unwrapResponse(response);

//   if (Array.isArray(data)) {
//     return data;
//   }

//   if (Array.isArray(data.workflows)) {
//     return data.workflows;
//   }

//   if (Array.isArray(data.data?.workflows)) {
//     return data.data.workflows;
//   }

//   return [];
// };

// const isWorkflowCompleted = (workflow) => {
//   if (!workflow) {
//     return false;
//   }

//   const status = normalizeStatus(
//     workflow.status
//   );

//   return (
//     status === 'completed' ||
//     workflow.replacementAssigned === true ||
//     workflow.replacement_assigned === true
//   );
// };

// const getPaymentSource = (payment) => {
//   return normalizeStatus(
//     payment?.source ??
//     payment?.replacementSource ??
//     payment?.replacement_source ??
//     ''
//   );
// };

// const getHostAdditionalCharge = (payment) => {
//   const amount =
//     payment?.hostAdditionalCharge ??
//     payment?.host_additional_charge ??
//     payment?.totalDue ??
//     payment?.total_due;

//   if (
//     amount === undefined ||
//     amount === null ||
//     amount === ''
//   ) {
//     return null;
//   }

//   const parsed = Number(amount);

//   return Number.isFinite(parsed)
//     ? parsed
//     : null;
// };


// /* -------------------------------------------------------------------------- */
// /*                             ReplacementPayment                             */
// /* -------------------------------------------------------------------------- */

// const ReplacementPayment = () => {
//   const navigation = useNavigation();

//   const route = useRoute();

//   const {
//     currentUser,
//   } = useContext(AuthContext);

//   const rawCustomer =
//   currentUser?.stripeCustomerId ||
//   currentUser?.stripe_customer_id ||
//   currentUser?.stripe_customer ||
//   null;

// let customerId = null;

// if (typeof rawCustomer === 'string') {
//   customerId = rawCustomer;
// } else if (rawCustomer?.id) {
//   customerId = rawCustomer.id;
// } else if (rawCustomer?.customerId) {
//   customerId = rawCustomer.customerId;
// } else if (rawCustomer?.customer_id) {
//   customerId = rawCustomer.customer_id;
// } else if (rawCustomer?.stripe_customer_id) {
//   customerId = rawCustomer.stripe_customer_id;
// } else if (rawCustomer?.stripeCustomerId) {
//   customerId = rawCustomer.stripeCustomerId;
// }

// const receiptEmail =
//   currentUser?.stripe_customer?.email ||
//   currentUser?.email ||
//   null;

// if (!customerId) {
//   throw new Error(
//     'Stripe customer ID was not found on the current user.'
//   );
// }

// console.log('Stripe customer ID resolved:', customerId);

//   const {
//     theme,
//     isDark,
//   } = useTheme();

//   const styles = createStyles(theme);

//   /* ------------------------------ route params ----------------------------- */

//   const {
//     scheduleId,

//     // Parent replacement workflow/request ID.
//     requestId,

//     // Individual replacement request ID.
//     replacementRequestId,

//     cleanerId,
//     cleanerName,

//     replacedCleanerId,
//     replacedCleanerName,

//     oldCleaningDate,
//     newCleaningDate,
//     cleaningTime,
//     propertyName,
//     group,
//   } = route.params || {};


//   /* --------------------------------- state --------------------------------- */

//   const [
//     loading,
//     setLoading,
//   ] = useState(true);

//   const [
//     paymentLoading,
//     setPaymentLoading,
//   ] = useState(false);

//   const [
//     paymentProcessing,
//     setPaymentProcessing,
//   ] = useState(false);

//   const [
//     replacementCompleted,
//     setReplacementCompleted,
//   ] = useState(false);

//   const [
//     paymentDetails,
//     setPaymentDetails,
//   ] = useState(null);

//   const [
//     acceptedPolicy,
//     setAcceptedPolicy,
//   ] = useState(false);

//   const [
//     clientSecret,
//     setClientSecret,
//   ] = useState(null);

//   const [
//     paymentIntentId,
//     setPaymentIntentId,
//   ] = useState(null);

//   const [
//     screenError,
//     setScreenError,
//   ] = useState(null);

//   const [
//     workflowCheckFailed,
//     setWorkflowCheckFailed,
//   ] = useState(false);

//   const mountedRef = useRef(true);

//   const redirectingRef = useRef(false);

//   const pollingRef = useRef(false);

//   const paymentStartingRef = useRef(false);

  


//   /* ---------------------------- mounted status ----------------------------- */

//   useEffect(() => {
//     mountedRef.current = true;

//     return () => {
//       mountedRef.current = false;
//     };
//   }, []);


//   // /* -------------------------- dashboard navigation ------------------------- */

//   // const navigateToHostDashboard = useCallback(() => {
//   //   if (redirectingRef.current) {
//   //     return;
//   //   }

//   //   redirectingRef.current = true;

//   //   console.log(
//   //     'Replacement workflow completed. Redirecting host to dashboard.'
//   //   );

//   //   /*
//   //    * Dashboard Host is the host dashboard route used by this application.
//   //    *
//   //    * Resetting the navigation stack prevents the host from returning to
//   //    * the replacement-payment screen using the Back button.
//   //    */
//   //   try {
//   //     navigation.reset({
//   //       index: 0,
//   //       routes: [
//   //         {
//   //           name: ROUTES.host_dashboard,
//   //         },
//   //       ],
//   //     });
//   //   } catch (error) {
//   //     console.log(
//   //       'Could not reset navigation to Dashboard Host:',
//   //       error
//   //     );

//   //     /*
//   //      * Fallback for navigator structures where the dashboard route
//   //      * is registered in a parent navigator.
//   //      */
//   //     try {
//   //       const parentNavigation =
//   //         navigation.getParent?.();

//   //       if (parentNavigation) {
//   //         parentNavigation.navigate(
//   //           ROUTES.host_dashboard
//   //         );
//   //       } else {
//   //         navigation.navigate(
//   //           ROUTES.host_dashboard
//   //         );
//   //       }
//   //     } catch (navigationError) {
//   //       console.log(
//   //         'Dashboard navigation failed:',
//   //         navigationError
//   //       );

//   //       redirectingRef.current = false;

//   //       Alert.alert(
//   //         tSafe(
//   //           'navigation_error',
//   //           'Navigation Error'
//   //         ),
//   //         tSafe(
//   //           'dashboard_navigation_failed',
//   //           'Your replacement is complete, but we could not open the dashboard automatically. Please return to the dashboard.'
//   //         )
//   //       );
//   //     }
//   //   }
//   // }, [navigation]);


//   /* -------------------------- dashboard navigation ------------------------- */

// const navigateToHostDashboard = useCallback(() => {
//   const targetRoutes = [
//     ROUTES.host_home_drawer, // Dashboard Host
//     ROUTES.host_dashboard,   // Home
//   ];

//   console.log(
//     '[Dashboard Redirect] Starting navigation.'
//   );

//   let currentNavigation = navigation;
//   let level = 0;

//   while (currentNavigation) {
//     const state = currentNavigation.getState?.();
//     const routeNames = state?.routeNames || [];

//     console.log(
//       `[Dashboard Redirect] Navigator level ${level}:`,
//       routeNames
//     );

//     // Look for a dashboard route registered at this level.
//     const dashboardRoute = targetRoutes.find((route) =>
//       routeNames.includes(route)
//     );

//     if (dashboardRoute) {
//       console.log(
//         '[Dashboard Redirect] Found route:',
//         dashboardRoute,
//         'at navigator level:',
//         level
//       );

//       try {
//         currentNavigation.reset({
//           index: 0,
//           routes: [
//             {
//               name: dashboardRoute,
//             },
//           ],
//         });

//         return;
//       } catch (error) {
//         console.error(
//           '[Dashboard Redirect] Reset failed:',
//           error
//         );
//       }
//     }

//     currentNavigation = currentNavigation.getParent?.();
//     level += 1;
//   }

//   console.error(
//     '[Dashboard Redirect] Neither dashboard route was found.'
//   );

//   Alert.alert(
//     tSafe('navigation_error', 'Navigation Error'),
//     tSafe(
//       'dashboard_navigation_failed',
//       'The replacement is complete, but automatic dashboard navigation failed.'
//     )
//   );
// }, [navigation]);
//   /* -------------------------- workflow verification ------------------------ */

//   const getCompletedWorkflow = useCallback(async () => {
//     if (!scheduleId || !requestId) {
//       return null;
//     }

//     const response =
//       await userService.getReplacementWorkflows(
//         String(scheduleId)
//       );

//     const workflows =
//       getWorkflowList(response);

//     const targetRequestId =
//       getIdentifier(requestId);

//     const workflow = workflows.find((item) => {
//       const possibleIds = [
//         item?.requestId,
//         item?.request_id,
//         item?.parentRequestId,
//         item?.parent_request_id,
//         item?.replacementParentId,
//         item?.replacement_parent_id,
//         item?._id,
//         item?.id,
//       ].map(getIdentifier);

//       return possibleIds.includes(
//         targetRequestId
//       );
//     });

//     return workflow || null;
//   }, [
//     scheduleId,
//     requestId,
//   ]);


//   const checkReplacementWorkflow = useCallback(async () => {
//     try {
//       const workflow =
//         await getCompletedWorkflow();

//       if (!workflow) {
//         return false;
//       }

//       if (!isWorkflowCompleted(workflow)) {
//         return false;
//       }

//       console.log(
//         'Replacement workflow is already completed:',
//         {
//           scheduleId,
//           requestId,
//           status: workflow.status,
//           replacementAssigned:
//             workflow.replacementAssigned ??
//             workflow.replacement_assigned,
//         }
//       );

//       if (mountedRef.current) {
//         setReplacementCompleted(true);

//         setPaymentProcessing(false);

//         setPaymentLoading(false);

//         setClientSecret(null);

//         setPaymentIntentId(null);
//       }

//       return true;
//     } catch (error) {
//       console.log(
//         'Error checking replacement workflow:',
//         error
//       );

//       throw error;
//     }
//   }, [
//     getCompletedWorkflow,
//     scheduleId,
//     requestId,
//   ]);


//   /* --------------------------- payment details ----------------------------- */

//   const fetchPaymentDetails = useCallback(async () => {
//     if (!scheduleId || !replacementRequestId) {
//       setScreenError(
//         tSafe(
//           'replacement_payment_missing_ids',
//           'The replacement payment information is incomplete. Please return to your schedule and try again.'
//         )
//       );

//       setLoading(false);

//       return;
//     }

//     setLoading(true);

//     setScreenError(null);

//     setWorkflowCheckFailed(false);

//     try {
//       /*
//        * IMPORTANT:
//        *
//        * Check the parent replacement workflow before requesting payment
//        * details. A completed cleaner-cancellation replacement must not
//        * continue into the PaymentIntent flow.
//        */
//       if (requestId) {
//         try {
//           const completed =
//             await checkReplacementWorkflow();

//           if (completed) {
//             setLoading(false);

//             /*
//              * Let the state update happen before resetting navigation.
//              */
//             setTimeout(() => {
//               if (mountedRef.current) {
//                 navigateToHostDashboard();
//               }
//             }, 150);

//             return;
//           }
//         } catch (workflowError) {
//           console.log(
//             'Could not verify replacement workflow before loading payment:',
//             workflowError
//           );

//           /*
//            * Do not assume the workflow is complete if verification failed.
//            * The payment screen can still display details, but payment
//            * initiation independently verifies the workflow.
//            */
//           setWorkflowCheckFailed(true);
//         }
//       }

//       const response =
//         await userService.getReplacementPaymentDetails(
//           String(scheduleId),
//           String(replacementRequestId)
//         );

//       const responseData =
//         unwrapResponse(response);

//       const payment =
//         responseData?.payment ??
//         responseData?.data?.payment ??
//         responseData;

//       const source =
//         getPaymentSource(payment);

//       const hostAdditionalCharge =
//         getHostAdditionalCharge(payment);

//       const normalizedPayment = {
//         ...payment,

//         source,

//         hostAdditionalCharge,

//         propertyName:
//           payment?.propertyName ||
//           payment?.property_name ||
//           propertyName ||
//           '',

//         cleaningDate:
//           payment?.cleaningDate ||
//           payment?.cleaning_date ||
//           newCleaningDate ||
//           '',

//         cleaningTime:
//           payment?.cleaningTime ||
//           payment?.cleaning_time ||
//           cleaningTime ||
//           '',

//         group:
//           payment?.group ||
//           group ||
//           '',

//         replacementCleaner:
//           payment?.replacementCleaner ||
//           cleanerName ||
//           '',

//         replacementCleanerId:
//           payment?.replacementCleanerId ||
//           cleanerId ||
//           '',

//         originalCleaner:
//           payment?.originalCleaner ||
//           replacedCleanerName ||
//           '',

//         originalCleanerId:
//           payment?.originalCleanerId ||
//           replacedCleanerId ||
//           '',

//         oldCleaningDate:
//           payment?.oldCleaningDate ||
//           payment?.old_cleaning_date ||
//           oldCleaningDate ||
//           '',

//         newCleaningDate:
//           payment?.newCleaningDate ||
//           payment?.new_cleaning_date ||
//           newCleaningDate ||
//           '',
//       };

//       /*
//        * Cleaner cancellation replacements should not require an additional
//        * host payment when the calculated host charge is zero.
//        *
//        * Do not create a PaymentIntent in this situation.
//        *
//        * Verify the workflow once more so that an already-completed
//        * replacement is sent straight to the host dashboard.
//        */
//       if (
//         source === 'cleaner_cancellation' &&
//         hostAdditionalCharge === 0
//       ) {
//         if (requestId) {
//           try {
//             const completed =
//               await checkReplacementWorkflow();

//             if (completed) {
//               setLoading(false);

//               setTimeout(() => {
//                 if (mountedRef.current) {
//                   navigateToHostDashboard();
//                 }
//               }, 150);

//               return;
//             }
//           } catch (workflowError) {
//             console.log(
//               'Could not verify cleaner-cancellation replacement:',
//               workflowError
//             );
//           }
//         }

//         /*
//          * Do not proceed to Stripe just because the replacement payment
//          * amount is zero. The assignment must be confirmed by the backend.
//          */
//         setPaymentDetails(
//           normalizedPayment
//         );

//         setScreenError(
//           tSafe(
//             'replacement_assignment_pending',
//             'No additional payment is required for this cleaner cancellation. However, the replacement assignment has not yet been confirmed. Please try again shortly.'
//           )
//         );

//         setLoading(false);

//         return;
//       }

//       if (mountedRef.current) {
//         setPaymentDetails(
//           normalizedPayment
//         );

//         setClientSecret(null);

//         setPaymentIntentId(null);
//       }
//     } catch (error) {
//       console.log(
//         'Error fetching replacement payment details:',
//         error?.response?.data || error
//       );

//       if (mountedRef.current) {
//         setScreenError(
//           error?.response?.data?.detail ||
//           error?.response?.data?.message ||
//           error?.message ||
//           tSafe(
//             'replacement_payment_load_error',
//             'Unable to load replacement payment details. Please try again.'
//           )
//         );
//       }
//     } finally {
//       if (mountedRef.current) {
//         setLoading(false);
//       }
//     }
//   }, [
//     scheduleId,
//     replacementRequestId,
//     requestId,
//     propertyName,
//     newCleaningDate,
//     cleaningTime,
//     group,
//     cleanerName,
//     cleanerId,
//     replacedCleanerName,
//     replacedCleanerId,
//     oldCleaningDate,
//     checkReplacementWorkflow,
//     navigateToHostDashboard,
//   ]);


//   /* --------------------------- refresh on focus --------------------------- */

//   useFocusEffect(
//     useCallback(() => {
//       let active = true;

//       const load = async () => {
//         if (!active) {
//           return;
//         }

//         await fetchPaymentDetails();
//       };

//       load();

//       return () => {
//         active = false;
//       };
//     }, [
//       fetchPaymentDetails,
//     ])
//   );


//   /* ---------------------- automatic completion polling --------------------- */

//   const waitForReplacementCompletion = useCallback(async () => {
//     if (pollingRef.current) {
//       return;
//     }

//     pollingRef.current = true;

//     setPaymentProcessing(true);

//     /*
//      * Allow time for the Stripe webhook and backend replacement workflow
//      * to update the persisted replacement request.
//      */
//     const maxAttempts = 12;

//     const delayMs = 3000;

//     try {
//       for (
//         let attempt = 1;
//         attempt <= maxAttempts;
//         attempt += 1
//       ) {
//         if (!mountedRef.current) {
//           return;
//         }

//         console.log(
//           `Checking replacement completion (${attempt}/${maxAttempts})`
//         );

//         try {
//           const completed =
//             await checkReplacementWorkflow();

//           if (completed) {
//             setPaymentProcessing(false);

//             setReplacementCompleted(true);

//             setTimeout(() => {
//               if (mountedRef.current) {
//                 navigateToHostDashboard();
//               }
//             }, 700);

//             return;
//           }
//         } catch (error) {
//           console.log(
//             'Replacement completion check failed:',
//             error
//           );
//         }

//         if (attempt < maxAttempts) {
//           await new Promise((resolve) => {
//             setTimeout(
//               resolve,
//               delayMs
//             );
//           });
//         }
//       }

//       if (mountedRef.current) {
//         setPaymentProcessing(false);

//         Alert.alert(
//           tSafe(
//             'replacement_processing',
//             'Replacement Processing'
//           ),
//           tSafe(
//             'replacement_payment_processing_message',
//             'Your payment was submitted, but the replacement confirmation is still processing. Please check your schedule again shortly.'
//           ),
//           [
//             {
//               text: tSafe(
//                 'go_to_dashboard',
//                 'Go to Dashboard'
//               ),
//               onPress:
//                 navigateToHostDashboard,
//             },
//           ]
//         );
//       }
//     } finally {
//       pollingRef.current = false;
//     }
//   }, [
//     checkReplacementWorkflow,
//     navigateToHostDashboard,
//   ]);


//   /* -------------------------- start payment flow --------------------------- */

//   const handlePayment = useCallback(async () => {
//     if (paymentStartingRef.current) {
//       return;
//     }

//     if (!acceptedPolicy) {
//       Alert.alert(
//         tSafe(
//           'policy_required_title',
//           'Confirmation Required'
//         ),
//         tSafe(
//           'policy_required_message',
//           'Please review and accept the replacement payment policy before continuing.'
//         )
//       );

//       return;
//     }

//     if (
//       !scheduleId ||
//       !replacementRequestId
//     ) {
//       Alert.alert(
//         tSafe(
//           'missing_information',
//           'Missing Information'
//         ),
//         tSafe(
//           'replacement_payment_missing_ids',
//           'The replacement payment information is incomplete. Please return to your schedule and try again.'
//         )
//       );

//       return;
//     }

//     paymentStartingRef.current = true;

//     setPaymentLoading(true);

//     setScreenError(null);

//     try {
//       /*
//        * First protection:
//        * never initiate payment if the replacement is already completed.
//        */
//       if (requestId) {
//         let completed;

//         try {
//           completed =
//             await checkReplacementWorkflow();
//         } catch (workflowError) {
//           console.log(
//             'Could not verify workflow before payment:',
//             workflowError
//           );

//           throw new Error(
//             tSafe(
//               'replacement_workflow_verification_failed',
//               'We could not verify the replacement assignment. No payment was started. Please try again.'
//             )
//           );
//         }

//         if (completed) {
//           navigateToHostDashboard();

//           return;
//         }
//       }

//       /*
//        * Use the payment amount returned by the backend.
//        * Do not infer a payment amount from the replacement fee or cleaner
//        * information.
//        */
//       const source =
//         getPaymentSource(paymentDetails);

//       const amount =
//         getHostAdditionalCharge(paymentDetails);

//       /*
//        * Second protection:
//        * a cleaner-cancellation replacement with no host charge must never
//        * create a Stripe PaymentIntent.
//        */
//       if (
//         source === 'cleaner_cancellation' &&
//         amount === 0
//       ) {
//         let completed = false;

//         if (requestId) {
//           try {
//             completed =
//               await checkReplacementWorkflow();
//           } catch (workflowError) {
//             console.log(
//               'Workflow check failed for zero-charge replacement:',
//               workflowError
//             );
//           }
//         }

//         if (completed) {
//           navigateToHostDashboard();

//           return;
//         }

//         throw new Error(
//           tSafe(
//             'replacement_assignment_pending',
//             'No additional payment is required for this cleaner cancellation, but the replacement assignment has not yet been confirmed. No payment was started. Please try again shortly.'
//           )
//         );
//       }

//       /*
//        * Reject invalid or zero amounts in the payment flow.
//        * This is a safety check in addition to the cleaner-cancellation guard.
//        */
//       if (
//         amount === null ||
//         !Number.isFinite(amount) ||
//         amount <= 0
//       ) {
//         throw new Error(
//           tSafe(
//             'invalid_replacement_payment_amount',
//             'The additional payment amount is invalid. No payment was started. Please refresh the replacement details.'
//           )
//         );
//       }

//       if (!paymentDetails) {
//         throw new Error(
//           tSafe(
//             'replacement_payment_details_missing',
//             'Replacement payment details are not available. Please try again.'
//           )
//         );
//       }

//       /*
//        * Retrieve the Stripe customer identifier from the payment details
//        * or the authenticated user object.
//        *
//        * Keep the existing backend contract for createReplacementPaymentIntent.
//        */
//       // const stripeCustomerId =
//       //   paymentDetails?.stripeCustomerId ||
//       //   paymentDetails?.stripe_customer_id ||
//       //   paymentDetails?.customerId ||
//       //   paymentDetails?.customer_id ||
//       //   currentUser?.stripe_customer_id ||
//       //   currentUser?.stripeCustomerId ||
//       //   null;

//       // if (!stripeCustomerId) {
//       //   throw new Error(
//       //     tSafe(
//       //       'stripe_customer_missing',
//       //       'Your payment profile could not be found. Please check your payment settings and try again.'
//       //     )
//       //   );
//       // }

//       const stripeCustomerId =
//         currentUser?.stripe_customer?.stripe_customer_id ||
//         currentUser?.stripe_customer_id ||
//         currentUser?.stripeCustomerId ||
//         currentUser?.customerId ||
//         currentUser?.stripe?.customerId ||
//         null;

//       const receiptEmail =
//         currentUser?.stripe_customer?.email ||
//         currentUser?.email ||
//         null;

//       if (!stripeCustomerId) {
//         console.error(
//           'Stripe customer ID not found in currentUser:',
//           {
//             hasCurrentUser: Boolean(currentUser),
//             hasStripeCustomer: Boolean(currentUser?.stripe_customer),
//             availableStripeCustomerKeys: currentUser?.stripe_customer
//               ? Object.keys(currentUser.stripe_customer)
//               : [],
//           }
//         );

//         throw new Error(
//               tSafe(
//                 'stripe_customer_missing',
//                 'Your payment profile could not be found. Please check your payment settings and try again.'
//               )
//             );
//       }

//       // const payload = {
//       //   scheduleId: String(scheduleId),

//       //   requestId: requestId
//       //     ? String(requestId)
//       //     : null,

//       //   replacementRequestId:
//       //     String(replacementRequestId),

//       //   cleanerId: cleanerId
//       //     ? String(cleanerId)
//       //     : null,

//       //   replacedCleanerId:
//       //     replacedCleanerId
//       //       ? String(replacedCleanerId)
//       //       : null,

//       //   customerId:
//       //     String(stripeCustomerId),

//       //   amount,

//       //   receiptEmail,

//       //   source:
//       //     source || paymentDetails?.source || null,

//       //   group:
//       //     group || paymentDetails?.group || null,
//       // };


//       // const payload = {
//       //   scheduleId: String(scheduleId),
      
//       //   requestId: String(replacementRequestId),
//       //   replacementRequestId: String(replacementRequestId),
//       //   parentRequestId: String(requestId),
      
//       //   cleanerId: cleanerId
//       //     ? String(cleanerId)
//       //     : undefined,
      
//       //   replacedCleanerId: replacedCleanerId
//       //     ? String(replacedCleanerId)
//       //     : undefined,
      
//       //   group: group || undefined,
      
//       //   customerId: stripeCustomerId,
//       //   receiptEmail,
//       //   amount,
//       // };

//       const payload = {
//         amount,
//         currency: String(paymentDetails?.currency || 'USD').toLowerCase(),
//         customerId: String(customerId),
//         receiptEmail: receiptEmail || undefined,
//         metadata: {
//           scheduleId: String(scheduleId),
//           requestId: String(replacementRequestId),
//         },
//       };
      
//       const response =
//         await userService.createReplacementPaymentIntent(payload);
      
    
//       const responseData =
//         unwrapResponse(response);

//       const secret =
//         responseData?.clientSecret ||
//         responseData?.client_secret ||
//         responseData?.paymentIntent?.client_secret ||
//         responseData?.payment_intent?.client_secret ||
//         null;

//       const intentId =
//         responseData?.paymentIntentId ||
//         responseData?.payment_intent_id ||
//         responseData?.paymentIntent?.id ||
//         responseData?.payment_intent?.id ||
//         null;

//       if (!secret) {
//         throw new Error(
//           responseData?.detail ||
//           responseData?.message ||
//           tSafe(
//             'payment_intent_secret_missing',
//             'The payment service did not return the information required to continue. Please try again.'
//           )
//         );
//       }

//       if (mountedRef.current) {
//         setClientSecret(secret);

//         setPaymentIntentId(intentId);
//       }
//     } catch (error) {
//       console.log(
//         'Replacement payment error:',
//         error?.response?.data || error
//       );

//       const message =
//         error?.response?.data?.detail ||
//         error?.response?.data?.message ||
//         error?.message ||
//         tSafe(
//           'replacement_payment_error',
//           'Unable to start the replacement payment. Please try again.'
//         );

//       if (mountedRef.current) {
//         Alert.alert(
//           tSafe(
//             'payment_error',
//             'Payment Error'
//           ),
//           message
//         );
//       }
//     } finally {
//       paymentStartingRef.current = false;

//       if (mountedRef.current) {
//         setPaymentLoading(false);
//       }
//     }
//   }, [
//     acceptedPolicy,
//     scheduleId,
//     replacementRequestId,
//     requestId,
//     paymentDetails,
//     currentUser,
//     cleanerId,
//     replacedCleanerId,
//     group,
//     receiptEmail,
//     checkReplacementWorkflow,
//     navigateToHostDashboard,
//   ]);


//   /* ----------------------------- retry loading ----------------------------- */

//   const handleRetry = useCallback(() => {
//     redirectingRef.current = false;

//     setScreenError(null);

//     setClientSecret(null);

//     setPaymentIntentId(null);

//     fetchPaymentDetails();
//   }, [
//     fetchPaymentDetails,
//   ]);


//   /* ------------------------------ formatting ------------------------------- */

//   const formatAmount = useCallback((amount) => {
//     const value = Number(amount);

//     if (!Number.isFinite(value)) {
//       return '0.00';
//     }

//     return value.toFixed(2);
//   }, []);


//   const displayDate =
//     paymentDetails?.cleaningDate ||
//     newCleaningDate ||
//     oldCleaningDate ||
//     tSafe(
//       'date_not_available',
//       'Not available'
//     );

//   const displayTime =
//     paymentDetails?.cleaningTime ||
//     cleaningTime ||
//     tSafe(
//       'time_not_available',
//       'Not available'
//     );

//   const displayProperty =
//     paymentDetails?.propertyName ||
//     propertyName ||
//     tSafe(
//       'property_not_available',
//       'Property not available'
//     );

//   const displayCleaner =
//     paymentDetails?.replacementCleaner ||
//     cleanerName ||
//     tSafe(
//       'cleaner_not_available',
//       'Replacement cleaner'
//     );

//   const displayGroup =
//     paymentDetails?.group ||
//     group ||
//     '';

//   const hostAdditionalCharge =
//     getHostAdditionalCharge(paymentDetails);


//   /* ------------------------------- loading UI ------------------------------ */

//   if (loading) {
//     return (
//       <SafeAreaView
//         style={styles.container}
//       >
//         <StatusBar
//           barStyle={
//             isDark
//               ? 'light-content'
//               : 'dark-content'
//           }
//           backgroundColor={
//             theme.background.default
//           }
//         />

//         <View
//           style={styles.centerContainer}
//         >
//           <ActivityIndicator
//             size="large"
//             color={theme.brand.primary}
//           />

//           <AppTextFallback
//             theme={theme}
//             style={styles.loadingText}
//           >
//             {tSafe(
//               'loading_replacement_payment',
//               'Loading replacement details...'
//             )}
//           </AppTextFallback>
//         </View>
//       </SafeAreaView>
//     );
//   }


//   /* -------------------------- processing completion ------------------------ */

//   if (
//     replacementCompleted ||
//     paymentProcessing
//   ) {
//     return (
//       <SafeAreaView
//         style={styles.container}
//       >
//         <StatusBar
//           barStyle={
//             isDark
//               ? 'light-content'
//               : 'dark-content'
//           }
//           backgroundColor={
//             theme.background.default
//           }
//         />

//         <View
//           style={styles.centerContainer}
//         >
//           <View
//             style={[
//               styles.statusIconContainer,
//               {
//                 backgroundColor:
//                   replacementCompleted
//                     ? theme.status.success + '18'
//                     : theme.brand.primary + '18',
//               },
//             ]}
//           >
//             <MaterialCommunityIcons
//               name={
//                 replacementCompleted
//                   ? 'check-circle-outline'
//                   : 'progress-clock'
//               }
//               size={56}
//               color={
//                 replacementCompleted
//                   ? theme.status.success
//                   : theme.brand.primary
//               }
//             />
//           </View>

//           <AppTextFallback
//             theme={theme}
//             style={styles.statusTitle}
//           >
//             {replacementCompleted
//               ? tSafe(
//                   'replacement_completed',
//                   'Replacement Completed'
//                 )
//               : tSafe(
//                   'replacement_processing',
//                   'Replacement Processing'
//                 )}
//           </AppTextFallback>

//           <AppTextFallback
//             theme={theme}
//             style={styles.statusDescription}
//           >
//             {replacementCompleted
//               ? tSafe(
//                   'replacement_completed_message',
//                   'Your replacement cleaner has been assigned successfully.'
//                 )
//               : tSafe(
//                   'replacement_processing_message',
//                   'Please wait while we confirm the replacement assignment.'
//                 )}
//           </AppTextFallback>

//           {paymentProcessing && (
//             <ActivityIndicator
//               size="large"
//               color={theme.brand.primary}
//               style={styles.processingIndicator}
//             />
//           )}

//           <Button
//             mode="contained"
//             onPress={
//               navigateToHostDashboard
//             }
//             style={styles.primaryButton}
//             contentStyle={
//               styles.buttonContent
//             }
//             buttonColor={
//               theme.brand.primary
//             }
//             textColor={
//               theme.text.inverse
//             }
//           >
//             {tSafe(
//               'go_to_dashboard',
//               'Go to Dashboard'
//             )}
//           </Button>
//         </View>
//       </SafeAreaView>
//     );
//   }


//   /* -------------------------------- main UI -------------------------------- */

//   return (
//     <SafeAreaView
//       style={styles.container}
//     >
//       <StatusBar
//         barStyle={
//           isDark
//             ? 'light-content'
//             : 'dark-content'
//         }
//         backgroundColor={
//           theme.background.default
//         }
//       />

//       <ScrollView
//         style={styles.scrollView}
//         contentContainerStyle={
//           styles.scrollContent
//         }
//         showsVerticalScrollIndicator={false}
//       >
//         {/* -------------------------------- heading ------------------------------- */}

//         <View
//           style={styles.header}
//         >
//           <View
//             style={styles.headerIcon}
//           >
//             <MaterialCommunityIcons
//               name="account-switch-outline"
//               size={28}
//               color={theme.brand.primary}
//             />
//           </View>

//           <AppTextFallback
//             theme={theme}
//             style={styles.title}
//           >
//             {tSafe(
//               'replacement_payment_title',
//               'Replacement Cleaner'
//             )}
//           </AppTextFallback>

//           <AppTextFallback
//             theme={theme}
//             style={styles.subtitle}
//           >
//             {tSafe(
//               'replacement_payment_subtitle',
//               'Review the replacement details before continuing.'
//             )}
//           </AppTextFallback>
//         </View>


//         {/* ------------------------------- error --------------------------------- */}

//         {screenError && (
//           <Card
//             style={styles.errorCard}
//             mode="outlined"
//           >
//             <Card.Content>
//               <View
//                 style={styles.messageRow}
//               >
//                 <MaterialCommunityIcons
//                   name="alert-circle-outline"
//                   size={24}
//                   color={theme.status.error}
//                 />

//                 <View
//                   style={styles.messageContent}
//                 >
//                   <AppTextFallback
//                     theme={theme}
//                     style={styles.errorTitle}
//                   >
//                     {tSafe(
//                       'attention_required',
//                       'Attention Required'
//                     )}
//                   </AppTextFallback>

//                   <AppTextFallback
//                     theme={theme}
//                     style={styles.errorMessage}
//                   >
//                     {screenError}
//                   </AppTextFallback>
//                 </View>
//               </View>

//               <Button
//                 mode="outlined"
//                 onPress={handleRetry}
//                 style={styles.retryButton}
//                 textColor={theme.brand.primary}
//               >
//                 {tSafe(
//                   'try_again',
//                   'Try Again'
//                 )}
//               </Button>
//             </Card.Content>
//           </Card>
//         )}



//         {/* ---------------------- Replacement Details ---------------------- */}

//         <Card
//           style={styles.replacementDetailsCard}
//           mode="elevated"
//         >
//           <Card.Content style={styles.replacementDetailsContent}>
//             {/* Section heading */}
//             <View style={styles.replacementSectionHeading}>
//               <View style={styles.replacementHeadingIcon}>
//                 <MaterialCommunityIcons
//                   name="account-switch-outline"
//                   size={24}
//                   color={theme.brand.primary}
//                 />
//               </View>

//               <View style={styles.replacementHeadingText}>
//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.replacementSectionTitle}
//                 >
//                   {tSafe(
//                     'replacement_details',
//                     'Replacement Details'
//                   )}
//                 </AppTextFallback>

//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.replacementSectionSubtitle}
//                 >
//                   Your updated cleaning arrangement
//                 </AppTextFallback>
//               </View>
//             </View>

//             {/* Replacement cleaner profile */}
//             <View style={styles.replacementCleanerCard}>
//               <View style={styles.replacementCleanerAvatar}>
//                 <MaterialCommunityIcons
//                   name="account-check-outline"
//                   size={32}
//                   color={theme.brand.primary}
//                 />
//               </View>

//               <View style={styles.replacementCleanerInfo}>
//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.replacementFieldLabel}
//                 >
//                   {tSafe(
//                     'replacement_cleaner',
//                     'Replacement Cleaner'
//                   )}
//                 </AppTextFallback>

//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.replacementCleanerName}
//                 >
//                   {displayCleaner}
//                 </AppTextFallback>

//                 {!!displayGroup && (
//                   <View style={styles.replacementGroupBadge}>
//                     <MaterialCommunityIcons
//                       name="account-group-outline"
//                       size={14}
//                       color={theme.brand.primary}
//                     />

//                     <AppTextFallback
//                       theme={theme}
//                       style={styles.replacementGroupText}
//                     >
//                       {displayGroup
//                         .replace(/_/g, ' ')
//                         .replace(/\b\w/g, (char) =>
//                           char.toUpperCase()
//                         )}
//                     </AppTextFallback>
//                   </View>
//                 )}
//               </View>

//               <MaterialCommunityIcons
//                 name="check-circle"
//                 size={22}
//                 color={theme.status.success}
//               />
//             </View>

//             {/* Property information */}
//             <View style={styles.replacementPropertyCard}>
//               <View style={styles.replacementPropertyIcon}>
//                 <MaterialCommunityIcons
//                   name="home-outline"
//                   size={22}
//                   color={theme.brand.primary}
//                 />
//               </View>

//               <View style={styles.replacementPropertyInfo}>
//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.replacementFieldLabel}
//                 >
//                   {tSafe('property', 'Property')}
//                 </AppTextFallback>

//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.replacementPropertyName}
//                 >
//                   {displayProperty}
//                 </AppTextFallback>
//               </View>
//             </View>

//             {/* Cleaning date and time */}
//             <View style={styles.replacementScheduleRow}>
//               <View style={styles.replacementScheduleTile}>
//                 <View style={styles.replacementScheduleIcon}>
//                   <MaterialCommunityIcons
//                     name="calendar-month-outline"
//                     size={21}
//                     color={theme.brand.primary}
//                   />
//                 </View>

//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.replacementFieldLabel}
//                 >
//                   {tSafe('cleaning_date', 'Cleaning Date')}
//                 </AppTextFallback>

//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.replacementScheduleValue}
//                 >
//                   {displayDate}
//                 </AppTextFallback>
//               </View>

//               <View style={styles.replacementScheduleTile}>
//                 <View style={styles.replacementScheduleIcon}>
//                   <MaterialCommunityIcons
//                     name="clock-outline"
//                     size={21}
//                     color={theme.brand.primary}
//                   />
//                 </View>

//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.replacementFieldLabel}
//                 >
//                   {tSafe('cleaning_time', 'Cleaning Time')}
//                 </AppTextFallback>

//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.replacementScheduleValue}
//                 >
//                   {displayTime}
//                 </AppTextFallback>
//               </View>
//             </View>

//             {/* Original cleaner */}
//             {!!(
//               paymentDetails?.originalCleaner ||
//               replacedCleanerName
//             ) && (
//               <View style={styles.replacementOriginalCleaner}>
//                 <MaterialCommunityIcons
//                   name="account-arrow-left-outline"
//                   size={20}
//                   color={theme.text.secondary}
//                 />

//                 <View style={styles.replacementOriginalCleanerInfo}>
//                   <AppTextFallback
//                     theme={theme}
//                     style={styles.replacementFieldLabel}
//                   >
//                     {tSafe(
//                       'original_cleaner',
//                       'Original Cleaner'
//                     )}
//                   </AppTextFallback>

//                   <AppTextFallback
//                     theme={theme}
//                     style={styles.replacementOriginalCleanerName}
//                   >
//                     {paymentDetails?.originalCleaner ||
//                       replacedCleanerName}
//                   </AppTextFallback>
//                 </View>
//               </View>
//             )}

//             {/* Previous cleaning date */}
//             {!!oldCleaningDate && (
//               <View style={styles.replacementPreviousDate}>
//                 <MaterialCommunityIcons
//                   name="calendar-arrow-right"
//                   size={19}
//                   color={theme.text.secondary}
//                 />

//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.replacementPreviousDateLabel}
//                 >
//                   {tSafe(
//                     'previous_cleaning_date',
//                     'Previous Cleaning Date'
//                   )}
//                 </AppTextFallback>

//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.replacementPreviousDateValue}
//                 >
//                   {oldCleaningDate}
//                 </AppTextFallback>
//               </View>
//             )}
//           </Card.Content>
//         </Card>

//         {/* ---------------------------- payment details -------------------------- */}

//         <Card
//           style={styles.card}
//           mode="elevated"
//         >
//           <Card.Content>
//             <View
//               style={styles.sectionHeading}
//             >
//               <MaterialCommunityIcons
//                 name="credit-card-outline"
//                 size={22}
//                 color={theme.brand.primary}
//               />

//               <AppTextFallback
//                 theme={theme}
//                 style={styles.sectionTitle}
//               >
//                 {tSafe(
//                   'payment_summary',
//                   'Payment Summary'
//                 )}
//               </AppTextFallback>
//             </View>

//             <Divider
//               style={styles.divider}
//             />

//             <View
//               style={styles.amountRow}
//             >
//               <AppTextFallback
//                 theme={theme}
//                 style={styles.amountLabel}
//               >
//                 {tSafe(
//                   'replacement_additional_charge',
//                   'Additional Payment'
//                 )}
//               </AppTextFallback>

//               <AppTextFallback
//                 theme={theme}
//                 style={styles.amountValue}
//               >
//                 {paymentDetails?.currencySymbol ||
//                   '$'}
//                 {hostAdditionalCharge === null
//                   ? '—'
//                   : formatAmount(
//                       hostAdditionalCharge
//                     )}
//               </AppTextFallback>
//             </View>

//             <AppTextFallback
//               theme={theme}
//               style={styles.paymentHint}
//             >
//               {hostAdditionalCharge === 0
//                 ? tSafe(
//                     'no_additional_payment',
//                     'No additional payment is required.'
//                   )
//                 : tSafe(
//                     'payment_amount_notice',
//                     'Only the additional payment displayed above will be processed.'
//                   )}
//             </AppTextFallback>

//             {getPaymentSource(paymentDetails) ===
//               'cleaner_cancellation' && (
//               <View
//                 style={styles.noChargeNotice}
//               >
//                 <MaterialCommunityIcons
//                   name="check-circle-outline"
//                   size={21}
//                   color={theme.status.success}
//                 />

//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.noChargeText}
//                 >
//                   {tSafe(
//                     'cleaner_cancellation_no_charge',
//                     'This replacement follows a cleaner cancellation. No additional host payment is required when the calculated charge is zero.'
//                   )}
//                 </AppTextFallback>
//               </View>
//             )}
//           </Card.Content>
//         </Card>


//         {/* ----------------------------- policy --------------------------------- */}

//         {!screenError && (
//           <Card
//             style={styles.policyCard}
//             mode="outlined"
//           >
//             <Card.Content>
//               <View
//                 style={styles.policyHeader}
//               >
//                 <MaterialCommunityIcons
//                   name="shield-check-outline"
//                   size={22}
//                   color={theme.brand.primary}
//                 />

//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.policyTitle}
//                 >
//                   {tSafe(
//                     'replacement_payment_policy',
//                     'Payment Confirmation'
//                   )}
//                 </AppTextFallback>
//               </View>

//               <TouchableOpacity
//                 activeOpacity={0.8}
//                 onPress={() =>
//                   setAcceptedPolicy(
//                     (previous) => !previous
//                   )
//                 }
//                 style={styles.checkboxRow}
//               >
//                 <Checkbox
//                   status={
//                     acceptedPolicy
//                       ? 'checked'
//                       : 'unchecked'
//                   }
//                   onPress={() =>
//                     setAcceptedPolicy(
//                       (previous) => !previous
//                     )
//                   }
//                   color={theme.brand.primary}
//                   uncheckedColor={
//                     theme.text.secondary
//                   }
//                 />

//                 <View
//                   style={styles.policyTextContainer}
//                 >
//                   <AppTextFallback
//                     theme={theme}
//                     style={styles.policyText}
//                   >
//                     {tSafe(
//                       'replacement_payment_acceptance',
//                       'I have reviewed the replacement details and authorize the additional payment shown above, if one is required.'
//                     )}
//                   </AppTextFallback>
//                 </View>
//               </TouchableOpacity>
//             </Card.Content>
//           </Card>
//         )}


//         {/* ---------------------------- payment button --------------------------- */}

//         {!screenError &&
//           !clientSecret &&
//           hostAdditionalCharge !== null &&
//           hostAdditionalCharge > 0 && (
//             <Button
//               mode="contained"
//               onPress={handlePayment}
//               loading={paymentLoading}
//               disabled={
//                 paymentLoading ||
//                 !acceptedPolicy
//               }
//               style={styles.primaryButton}
//               contentStyle={
//                 styles.buttonContent
//               }
//               buttonColor={
//                 theme.brand.primary
//               }
//               textColor={
//                 theme.text.inverse
//               }
//               icon="lock-outline"
//             >
//               {paymentLoading
//                 ? tSafe(
//                     'preparing_payment',
//                     'Preparing Payment...'
//                   )
//                 : tSafe(
//                     'continue_to_payment',
//                     'Continue to Payment'
//                   )}
//             </Button>
//           )}


//         {/* ------------------------- Stripe payment UI -------------------------- */}

//         {!!clientSecret && (
//           <Card
//             style={styles.stripeCard}
//             mode="outlined"
//           >
//             <Card.Content>
//               <View
//                 style={styles.sectionHeading}
//               >
//                 <MaterialCommunityIcons
//                   name="lock-check-outline"
//                   size={22}
//                   color={theme.status.success}
//                 />

//                 <AppTextFallback
//                   theme={theme}
//                   style={styles.sectionTitle}
//                 >
//                   {tSafe(
//                     'secure_payment',
//                     'Secure Payment'
//                   )}
//                 </AppTextFallback>
//               </View>

//               <AppTextFallback
//                 theme={theme}
//                 style={styles.paymentHint}
//               >
//                 {tSafe(
//                   'stripe_secure_payment_message',
//                   'Complete the payment below to continue.'
//                 )}
//               </AppTextFallback>

//               <StripeGroupPaymentButton
//                 clientSecret={clientSecret}
//                 paymentIntentId={paymentIntentId}
//                 amount={hostAdditionalCharge}
//                 onSuccess={
//                   waitForReplacementCompletion
//                 }
//               />
//             </Card.Content>
//           </Card>
//         )}


//         {/* ---------------------------- footer action --------------------------- */}

//         <TouchableOpacity
//           activeOpacity={0.8}
//           onPress={
//             navigateToHostDashboard
//           }
//           style={styles.cancelAction}
//         >
//           <MaterialCommunityIcons
//             name="arrow-left"
//             size={18}
//             color={theme.text.secondary}
//           />

//           <AppTextFallback
//             theme={theme}
//             style={styles.cancelActionText}
//           >
//             {tSafe(
//               'return_to_dashboard',
//               'Return to Dashboard'
//             )}
//           </AppTextFallback>
//         </TouchableOpacity>

//       </ScrollView>
//     </SafeAreaView>
//   );
// };


// /* -------------------------------------------------------------------------- */
// /*                          Shared display components                         */
// /* -------------------------------------------------------------------------- */

// /*
//  * This small text wrapper keeps the screen compatible with the theme tokens
//  * used by the Dashboard without assuming additional AppText props that may
//  * differ across your shared UI implementation.
//  *
//  * If your shared AppText component supports a "variant" prop, you can replace
//  * this wrapper with AppText and pass the corresponding variant.
//  */

// const AppTextFallback = ({
//   children,
//   theme,
//   style,
//   numberOfLines,
// }) => {
//   const { Text } = require('react-native');

//   return (
//     <Text
//       numberOfLines={numberOfLines}
//       style={[
//         {
//           color: theme.text.primary,
//         },
//         style,
//       ]}
//     >
//       {children}
//     </Text>
//   );
// };


// const DetailRow = ({
//   theme,
//   icon,
//   label,
//   value,
// }) => (
//   <View
//     style={detailRowStyles.row}
//   >
//     <View
//       style={[
//         detailRowStyles.iconContainer,
//         {
//           backgroundColor:
//             theme.surface.selected,
//         },
//       ]}
//     >
//       <MaterialCommunityIcons
//         name={icon}
//         size={19}
//         color={theme.icon.default}
//       />
//     </View>

//     <View
//       style={detailRowStyles.content}
//     >
//       <AppTextFallback
//         theme={theme}
//         style={[
//           detailRowStyles.label,
//           {
//             color: theme.text.secondary,
//           },
//         ]}
//       >
//         {label}
//       </AppTextFallback>

//       <AppTextFallback
//         theme={theme}
//         style={detailRowStyles.value}
//       >
//         {value || '—'}
//       </AppTextFallback>
//     </View>
//   </View>
// );


// const detailRowStyles = StyleSheet.create({
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//   },

//   iconContainer: {
//     width: 38,
//     height: 38,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },

//   content: {
//     flex: 1,
//   },

//   label: {
//     fontSize: 12,
//     marginBottom: 3,
//   },

//   value: {
//     fontSize: 14,
//     fontWeight: '600',
//   },

  
// });


// /* -------------------------------------------------------------------------- */
// /*                                    Styles                                  */
// /* -------------------------------------------------------------------------- */

// const createStyles = (theme) => {
//   const cardShadow = {
//     shadowColor:
//       theme.shadow?.color || '#000000',

//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },

//     shadowOpacity:
//       theme.shadow?.opacity || 0.06,

//     shadowRadius: 12,

//     elevation: 2,
//   };

//   return StyleSheet.create({
//     /* -------------------------------- container ------------------------------- */

//     container: {
//       flex: 1,

//       backgroundColor:
//         theme.background.default,
//     },

//     scrollView: {
//       flex: 1,
//     },

//     scrollContent: {
//       paddingHorizontal: S.lg,
//       paddingTop: S.lg,
//       paddingBottom: 48,
//     },

//     centerContainer: {
//       flex: 1,

//       alignItems: 'center',
//       justifyContent: 'center',

//       paddingHorizontal: S.xl,

//       backgroundColor:
//         theme.background.default,
//     },

//     /* -------------------------------- loading -------------------------------- */

//     loadingText: {
//       marginTop: S.lg,

//       fontSize: 14,

//       color:
//         theme.text.secondary,

//       textAlign: 'center',
//     },

//     processingIndicator: {
//       marginTop: S.xl,
//     },

//     /* -------------------------------- header --------------------------------- */

//     header: {
//       alignItems: 'center',

//       marginBottom: S.xl,

//       paddingHorizontal: S.sm,
//     },

//     headerIcon: {
//       width: 64,
//       height: 64,

//       borderRadius: R.lg,

//       backgroundColor:
//         `${theme.brand.primary}15`,

//       alignItems: 'center',
//       justifyContent: 'center',

//       marginBottom: S.md,
//     },

//     title: {
//       color: theme.text.primary,

//       fontSize: 25,
//       fontWeight: '800',

//       textAlign: 'center',

//       letterSpacing: -0.5,
//     },

//     subtitle: {
//       color: theme.text.secondary,

//       fontSize: 14,
//       lineHeight: 21,

//       textAlign: 'center',

//       marginTop: S.sm,

//       maxWidth: 340,
//     },

//     /* -------------------------------- cards ---------------------------------- */

//     card: {
//       marginBottom: S.lg,
//       backgroundColor: theme.surface.default,
//       borderRadius: R.lg,
//       overflow: 'hidden',
//       ...cardShadow,
//     },

//     policyCard: {
//       marginBottom: S.lg,

//       backgroundColor:
//         theme.surface.default,

//       borderRadius: R.lg,

//       borderColor:
//         theme.border.default,
//     },

//     stripeCard: {
//       marginTop: S.lg,
//       marginBottom: S.lg,

//       backgroundColor:
//         theme.surface.default,

//       borderRadius: R.lg,

//       borderColor:
//         theme.border.default,
//     },

//     /* ------------------------------ section heading -------------------------- */

//     sectionHeading: {

//       flexDirection: 'row',
    
//       alignItems: 'center',
    
//       marginBottom: S.md,
    
//       paddingVertical: S.xs,
    
//     },

//     sectionTitle: {
//       marginLeft: S.sm,

//       color: theme.text.primary,

//       fontSize: 16,
//       fontWeight: '700',

//       letterSpacing: -0.2,
//     },

//     divider: {
//       backgroundColor:
//         theme.border.default,

//       marginBottom: S.sm,
//     },

//     /* ----------------------------- payment amount ---------------------------- */

//     amountRow: {
//       flexDirection: 'row',

//       justifyContent: 'space-between',
//       alignItems: 'center',

//       gap: S.md,

//       paddingVertical: S.md,
//     },

//     amountLabel: {
//       flex: 1,

//       fontSize: 14,

//       color: theme.text.secondary,
//     },

//     amountValue: {
//       fontSize: 24,

//       fontWeight: '800',

//       letterSpacing: -0.5,

//       color: theme.brand.primary,
//     },

//     paymentHint: {
//       fontSize: 13,

//       lineHeight: 20,

//       color: theme.text.secondary,

//       marginTop: S.sm,
//     },

//     noChargeNotice: {
//       flexDirection: 'row',
//       alignItems: 'flex-start',

//       gap: S.sm,

//       marginTop: S.md,

//       padding: S.md,

//       borderRadius: R.md,

//       backgroundColor:
//         `${theme.status.success}12`,
//     },

//     noChargeText: {
//       flex: 1,

//       fontSize: 13,

//       lineHeight: 19,

//       color: theme.text.primary,
//     },

//     /* -------------------------------- policy --------------------------------- */

//     policyHeader: {
//       flexDirection: 'row',
//       alignItems: 'center',

//       marginBottom: S.sm,
//     },

//     policyTitle: {
//       marginLeft: S.sm,

//       fontSize: 15,
//       fontWeight: '700',

//       color: theme.text.primary,
//     },

//     checkboxRow: {
//       flexDirection: 'row',
//       alignItems: 'flex-start',

//       marginTop: S.sm,

//       marginLeft: -S.sm,
//     },

//     policyTextContainer: {
//       flex: 1,

//       paddingTop: 10,
//       paddingRight: S.xs,
//     },

//     policyText: {
//       fontSize: 13,

//       lineHeight: 20,

//       color: theme.text.secondary,
//     },

//     /* -------------------------------- buttons -------------------------------- */

//     primaryButton: {
//       marginTop: S.md,
//       marginBottom: S.md,

//       borderRadius: R.md,

//       backgroundColor:
//         theme.brand.primary,
//     },

//     buttonContent: {
//       minHeight: 50,

//       paddingHorizontal: S.md,
//     },

//     retryButton: {
//       marginTop: S.md,

//       borderRadius: R.md,

//       borderColor:
//         theme.border.default,
//     },

//     cancelAction: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',

//       gap: S.sm,

//       paddingVertical: S.lg,

//       marginTop: S.xs,
//     },

//     cancelActionText: {
//       fontSize: 14,

//       fontWeight: '600',

//       color: theme.text.secondary,
//     },

//     /* -------------------------------- errors --------------------------------- */

//     errorCard: {
//       marginBottom: S.lg,

//       backgroundColor:
//         theme.surface.default,

//       borderRadius: R.md,

//       borderColor:
//         `${theme.status.error}60`,
//     },

//     messageRow: {
//       flexDirection: 'row',
//       alignItems: 'flex-start',

//       gap: S.md,
//     },

//     messageContent: {
//       flex: 1,
//     },

//     errorTitle: {
//       fontSize: 15,

//       fontWeight: '700',

//       color: theme.status.error,

//       marginBottom: S.xs,
//     },

//     errorMessage: {
//       fontSize: 13,

//       lineHeight: 20,

//       color: theme.text.secondary,
//     },

//     /* ------------------------------ status screen ---------------------------- */

//     statusIconContainer: {
//       width: 104,
//       height: 104,

//       borderRadius: R.pill,

//       alignItems: 'center',
//       justifyContent: 'center',

//       marginBottom: S.xl,
//     },

//     statusTitle: {
//       fontSize: 23,

//       fontWeight: '800',

//       letterSpacing: -0.4,

//       color: theme.text.primary,

//       textAlign: 'center',
//     },

//     statusDescription: {
//       marginTop: S.md,

//       fontSize: 14,

//       lineHeight: 22,

//       color: theme.text.secondary,

//       textAlign: 'center',

//       maxWidth: 340,
//     },

//     /* ---------------------- Replacement Details redesign ---------------------- */

// replacementDetailsCard: {
//   marginBottom: S.lg,
//   backgroundColor: theme.surface.default,
//   borderRadius: R.lg,
//   overflow: 'hidden',
//   ...cardShadow,
// },

// replacementDetailsContent: {
//   paddingVertical: S.lg,
// },

// replacementSectionHeading: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   marginBottom: S.lg,
// },

// replacementHeadingIcon: {
//   width: 46,
//   height: 46,
//   borderRadius: 14,
//   alignItems: 'center',
//   justifyContent: 'center',
//   backgroundColor: `${theme.brand.primary}15`,
// },

// replacementHeadingText: {
//   flex: 1,
//   marginLeft: S.md,
// },

// replacementSectionTitle: {
//   fontSize: 18,
//   fontWeight: '800',
//   letterSpacing: -0.3,
//   color: theme.text.primary,
// },

// replacementSectionSubtitle: {
//   marginTop: 3,
//   fontSize: 12,
//   lineHeight: 18,
//   color: theme.text.secondary,
// },

// /* Replacement cleaner profile */

// replacementCleanerCard: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   padding: S.md,
//   marginBottom: S.md,
//   borderRadius: R.md,
//   backgroundColor: `${theme.brand.primary}0D`,
//   borderWidth: 1,
//   borderColor: `${theme.brand.primary}25`,
// },

// replacementCleanerAvatar: {
//   width: 52,
//   height: 52,
//   borderRadius: 16,
//   alignItems: 'center',
//   justifyContent: 'center',
//   backgroundColor: `${theme.brand.primary}18`,
//   marginRight: S.md,
// },

// replacementCleanerInfo: {
//   flex: 1,
//   minWidth: 0,
// },

// replacementCleanerName: {
//   fontSize: 16,
//   lineHeight: 22,
//   fontWeight: '800',
//   color: theme.text.primary,
// },

// replacementFieldLabel: {
//   fontSize: 11,
//   fontWeight: '500',
//   letterSpacing: 0.3,
//   color: theme.text.secondary,
//   marginBottom: 5,
// },

// replacementGroupBadge: {
//   alignSelf: 'flex-start',
//   flexDirection: 'row',
//   alignItems: 'center',
//   paddingHorizontal: S.sm,
//   paddingVertical: S.xs,
//   marginTop: S.sm,
//   borderRadius: R.pill,
//   backgroundColor: `${theme.brand.primary}15`,
//   gap: S.xs,
// },

// replacementGroupText: {
//   fontSize: 11,
//   fontWeight: '700',
//   color: theme.brand.primary,
// },

// /* Property card */

// replacementPropertyCard: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   padding: S.md,
//   marginBottom: S.md,
//   borderRadius: R.md,
//   backgroundColor: theme.background.default,
//   borderWidth: 1,
//   borderColor: theme.border.default,
// },

// replacementPropertyIcon: {
//   width: 42,
//   height: 42,
//   borderRadius: 12,
//   alignItems: 'center',
//   justifyContent: 'center',
//   backgroundColor: theme.surface.selected,
//   marginRight: S.md,
// },

// replacementPropertyInfo: {
//   flex: 1,
//   minWidth: 0,
// },

// replacementPropertyName: {
//   fontSize: 14,
//   lineHeight: 21,
//   fontWeight: '700',
//   color: theme.text.primary,
// },

// /* Date and time cards */

// replacementScheduleRow: {
//   flexDirection: 'row',
//   alignItems: 'stretch',
//   gap: S.md,
//   marginBottom: S.md,
// },

// replacementScheduleTile: {
//   flex: 1,
//   minWidth: 0,
//   padding: S.md,
//   borderRadius: R.md,
//   backgroundColor: theme.background.default,
//   borderWidth: 1,
//   borderColor: theme.border.default,
// },

// replacementScheduleIcon: {
//   width: 36,
//   height: 36,
//   borderRadius: 11,
//   alignItems: 'center',
//   justifyContent: 'center',
//   backgroundColor: theme.surface.selected,
//   marginBottom: S.md,
// },

// replacementScheduleValue: {
//   fontSize: 13,
//   lineHeight: 20,
//   fontWeight: '700',
//   color: theme.text.primary,
// },

// /* Original cleaner */

// replacementOriginalCleaner: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   paddingTop: S.md,
//   marginTop: S.xs,
//   borderTopWidth: StyleSheet.hairlineWidth,
//   borderTopColor: theme.border.default,
// },

// replacementOriginalCleanerInfo: {
//   flex: 1,
//   marginLeft: S.md,
// },

// replacementOriginalCleanerName: {
//   fontSize: 13,
//   lineHeight: 19,
//   fontWeight: '600',
//   color: theme.text.primary,
// },

// /* Previous cleaning date */

// replacementPreviousDate: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   flexWrap: 'wrap',
//   gap: S.sm,
//   marginTop: S.md,
//   paddingTop: S.md,
//   borderTopWidth: StyleSheet.hairlineWidth,
//   borderTopColor: theme.border.default,
// },

// replacementPreviousDateLabel: {
//   flex: 1,
//   fontSize: 12,
//   color: theme.text.secondary,
// },

// replacementPreviousDateValue: {
//   fontSize: 12,
//   fontWeight: '700',
//   color: theme.text.primary,
// },

    
//   });
// };


// export default ReplacementPayment;





















// import React, {
//   useCallback,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
// } from 'react';

// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   ScrollView,
//   Alert,
//   ActivityIndicator,
//   TouchableOpacity,
// } from 'react-native';

// import {
//   Button,
//   Card,
//   Divider,
//   Checkbox,
// } from 'react-native-paper';

// import {
//   useNavigation,
//   useRoute,
//   useFocusEffect,
// } from '@react-navigation/native';

// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// // import { AuthContext } from '../context/AuthContext';
// // import { COLORS } from '../constants/colors';

// import { AuthContext } from '../../context/AuthContext';
// import COLORS from '../../constants/colors';

// // import userService from '../services/connection/userService';
// import userService from '../../services/connection/userService';

//   import StripeGroupPaymentButton from '../../components/shared/StripeGroupPaymentButton';


// const WORKFLOW_POLL_INTERVAL = 3000;
// const WORKFLOW_POLL_ATTEMPTS = 12;


// /**
//  * ReplacementPayment
//  *
//  * Handles two replacement-payment scenarios:
//  *
//  * 1. Cleaner cancellation:
//  *    - No additional host payment is required.
//  *    - Do not create a Stripe PaymentIntent.
//  *    - Wait for backend confirmation that the replacement is assigned.
//  *    - Redirect the host to Dashboard Host.
//  *
//  * 2. Replacement requiring payment:
//  *    - Retrieve payment details using the CHILD replacement request ID.
//  *    - Create the Stripe PaymentIntent.
//  *    - Allow the host to pay.
//  *    - Wait for backend/webhook confirmation.
//  *    - Redirect the host to Dashboard Host when completed.
//  */
// const ReplacementPayment = () => {
//   const navigation = useNavigation();
//   const route = useRoute();

//   const { currentUser } = useContext(AuthContext);

//   const {
//     scheduleId,
//     requestId,
//     replacementRequestId,
//     cleanerId,
//     cleanerName,
//     replacedCleanerId,
//     replacedCleanerName,
//     oldCleaningDate,
//     newCleaningDate,
//     cleaningTime,
//     propertyName,
//     group,
//   } = route.params || {};


//   // ---------------------------------------------------------
//   // STATE
//   // ---------------------------------------------------------

//   const [loading, setLoading] = useState(true);

//   const [paymentLoading, setPaymentLoading] = useState(false);

//   const [paymentProcessing, setPaymentProcessing] = useState(false);

//   const [replacementCompleted, setReplacementCompleted] =
//     useState(false);

//   const [paymentDetails, setPaymentDetails] = useState(null);

//   const [acceptedPolicy, setAcceptedPolicy] = useState(false);

//   const [clientSecret, setClientSecret] = useState(null);

//   const [paymentIntentId, setPaymentIntentId] = useState(null);

//   const [errorMessage, setErrorMessage] = useState(null);

//   const [workflowStatus, setWorkflowStatus] = useState(null);


//   // Prevent multiple navigation attempts.
//   const navigationStartedRef = useRef(false);

//   // Prevent duplicate PaymentIntent requests.
//   const paymentRequestInProgressRef = useRef(false);

//   // Prevent state updates after unmount.
//   const mountedRef = useRef(true);


//   useEffect(() => {
//     mountedRef.current = true;

//     return () => {
//       mountedRef.current = false;
//     };
//   }, []);


//   // ---------------------------------------------------------
//   // NORMALIZE API RESPONSE
//   // ---------------------------------------------------------

//   const unwrapResponse = useCallback((response) => {
//     return response?.data ?? response;
//   }, []);


//   // ---------------------------------------------------------
//   // NAVIGATE TO HOST DASHBOARD
//   // ---------------------------------------------------------

//   const navigateToHostDashboard = useCallback(() => {
//     if (navigationStartedRef.current) {
//       return;
//     }

//     navigationStartedRef.current = true;

//     console.log(
//       'Replacement completed. Redirecting host to Dashboard Host.'
//     );

//     try {
//       navigation.reset({
//         index: 0,
//         routes: [
//           {
//             name: 'Dashboard Host',
//           },
//         ],
//       });
//     } catch (error) {
//       console.error(
//         'Unable to reset navigation to Dashboard Host:',
//         error
//       );

//       navigationStartedRef.current = false;

//       Alert.alert(
//         'Replacement Completed',
//         'Your replacement cleaner has been assigned. Please return to your host dashboard.'
//       );
//     }
//   }, [navigation]);


//   // ---------------------------------------------------------
//   // FIND THE RELEVANT REPLACEMENT WORKFLOW
//   // ---------------------------------------------------------

//   const findReplacementWorkflow = useCallback(
//     async () => {
//       if (!scheduleId || !requestId) {
//         console.warn(
//           'Cannot check replacement workflow: scheduleId or parent requestId is missing.'
//         );

//         return null;
//       }

//       /*
//        * IMPORTANT:
//        *
//        * requestId is the PARENT replacement workflow/event ID.
//        *
//        * replacementRequestId is the CHILD request ID for the
//        * selected replacement cleaner.
//        *
//        * Do not use replacementRequestId to locate the parent
//        * workflow.
//        */

//       const response =
//         await userService.getReplacementWorkflows(
//           String(scheduleId)
//         );

//       const responseData = unwrapResponse(response);

//       const workflows = Array.isArray(responseData)
//         ? responseData
//         : Array.isArray(responseData?.workflows)
//           ? responseData.workflows
//           : [];

//       console.log(
//         'Replacement workflows received:',
//         workflows.length
//       );

//       const parentRequestId = String(requestId);

//       const workflow = workflows.find((item) => {
//         const possibleParentIds = [
//           item?.requestId,
//           item?.parentRequestId,
//           item?.replacementParentId,
//           item?.replacement_event_id,
//           item?._id,
//         ]
//           .filter((value) => value != null)
//           .map((value) => String(value));

//         return possibleParentIds.includes(parentRequestId);
//       });

//       if (!workflow) {
//         console.warn(
//           'Replacement workflow was not found for parent request:',
//           parentRequestId
//         );

//         return null;
//       }

//       console.log('Matched replacement workflow:', {
//         requestId: workflow?.requestId,
//         parentRequestId: workflow?.parentRequestId,
//         status: workflow?.status,
//         replacementAssigned: workflow?.replacementAssigned,
//         source: workflow?.source,
//       });

//       return workflow;
//     },
//     [
//       scheduleId,
//       requestId,
//       unwrapResponse,
//     ]
//   );


//   // ---------------------------------------------------------
//   // DETERMINE WHETHER THE REPLACEMENT IS COMPLETE
//   // ---------------------------------------------------------

//   const isWorkflowCompleted = useCallback((workflow) => {
//     if (!workflow) {
//       return false;
//     }

//     const status = String(
//       workflow?.status ?? ''
//     )
//       .trim()
//       .toLowerCase();

//     return (
//       status === 'completed' ||
//       workflow?.replacementAssigned === true
//     );
//   }, []);


//   // ---------------------------------------------------------
//   // CHECK REPLACEMENT WORKFLOW
//   // ---------------------------------------------------------

//   const checkReplacementWorkflow = useCallback(
//     async () => {
//       try {
//         const workflow = await findReplacementWorkflow();

//         if (!workflow) {
//           return false;
//         }

//         const status = String(
//           workflow?.status ?? ''
//         )
//           .trim()
//           .toLowerCase();

//         if (mountedRef.current) {
//           setWorkflowStatus(status || null);
//         }

//         if (isWorkflowCompleted(workflow)) {
//           console.log(
//             'Backend confirms that the replacement workflow is complete.'
//           );

//           if (mountedRef.current) {
//             setReplacementCompleted(true);
//             setPaymentProcessing(false);
//             setClientSecret(null);
//             setPaymentIntentId(null);
//             setErrorMessage(null);
//           }

//           return true;
//         }

//         return false;
//       } catch (error) {
//         console.error(
//           'Error checking replacement workflow:',
//           error?.response?.data || error?.message || error
//         );

//         return false;
//       }
//     },
//     [
//       findReplacementWorkflow,
//       isWorkflowCompleted,
//     ]
//   );


//   // ---------------------------------------------------------
//   // WAIT FOR BACKEND CONFIRMATION
//   // ---------------------------------------------------------

//   const waitForReplacementCompletion = useCallback(
//     async ({
//       redirectOnCompletion = true,
//     } = {}) => {
//       console.log(
//         'Waiting for backend replacement completion confirmation...'
//       );

//       if (mountedRef.current) {
//         setPaymentProcessing(true);
//       }

//       for (
//         let attempt = 1;
//         attempt <= WORKFLOW_POLL_ATTEMPTS;
//         attempt += 1
//       ) {
//         if (!mountedRef.current) {
//           return false;
//         }

//         console.log(
//           `Replacement workflow check ${attempt}/${WORKFLOW_POLL_ATTEMPTS}`
//         );

//         const completed = await checkReplacementWorkflow();

//         if (completed) {
//           if (mountedRef.current) {
//             setPaymentProcessing(false);
//             setReplacementCompleted(true);
//           }

//           if (redirectOnCompletion) {
//             navigateToHostDashboard();
//           }

//           return true;
//         }

//         if (attempt < WORKFLOW_POLL_ATTEMPTS) {
//           await new Promise((resolve) => {
//             setTimeout(
//               resolve,
//               WORKFLOW_POLL_INTERVAL
//             );
//           });
//         }
//       }

//       if (mountedRef.current) {
//         setPaymentProcessing(false);
//       }

//       console.warn(
//         'Replacement completion was not confirmed within the polling window.'
//       );

//       return false;
//     },
//     [
//       checkReplacementWorkflow,
//       navigateToHostDashboard,
//     ]
//   );


//   // ---------------------------------------------------------
//   // READ PAYMENT SOURCE
//   // ---------------------------------------------------------

//   const getPaymentSource = useCallback(
//     (payment) => {
//       return String(
//         payment?.source ??
//         payment?.replacementSource ??
//         payment?.replacement_source ??
//         ''
//       )
//         .trim()
//         .toLowerCase();
//     },
//     []
//   );


//   // ---------------------------------------------------------
//   // READ HOST ADDITIONAL CHARGE
//   // ---------------------------------------------------------

//   const getHostAdditionalCharge = useCallback(
//     (payment) => {
//       const rawAmount =
//         payment?.hostAdditionalCharge ??
//         payment?.host_additional_charge ??
//         payment?.totalDue ??
//         payment?.total_due;

//       if (rawAmount === undefined || rawAmount === null) {
//         return null;
//       }

//       const amount = Number(rawAmount);

//       return Number.isFinite(amount)
//         ? amount
//         : null;
//     },
//     []
//   );


//   // ---------------------------------------------------------
//   // LOAD PAYMENT DETAILS
//   // ---------------------------------------------------------

//   const fetchPaymentDetails = useCallback(
//     async () => {
//       if (!mountedRef.current) {
//         return;
//       }

//       setLoading(true);
//       setErrorMessage(null);

//       try {
//         if (!scheduleId || !requestId) {
//           throw new Error(
//             'Missing schedule ID or parent replacement request ID.'
//           );
//         }

//         /*
//          * STEP 1:
//          *
//          * Check the parent workflow BEFORE calling the payment
//          * details endpoint.
//          *
//          * If the replacement has already been assigned, the
//          * payment screen must not request another payment.
//          */

//         const workflow = await findReplacementWorkflow();

//         if (!mountedRef.current) {
//           return;
//         }

//         if (workflow) {
//           const workflowSource = String(
//             workflow?.source ??
//             workflow?.replacementSource ??
//             workflow?.replacement_source ??
//             ''
//           )
//             .trim()
//             .toLowerCase();

//           const workflowStatusValue = String(
//             workflow?.status ?? ''
//           )
//             .trim()
//             .toLowerCase();

//           setWorkflowStatus(
//             workflowStatusValue || null
//           );

//           if (isWorkflowCompleted(workflow)) {
//             console.log(
//               'Replacement is already complete. Skipping payment details and Stripe.'
//             );

//             setReplacementCompleted(true);
//             setPaymentProcessing(false);
//             setClientSecret(null);
//             setPaymentIntentId(null);
//             setPaymentDetails(null);

//             /*
//              * The backend has already confirmed assignment.
//              * Redirect directly to the host dashboard.
//              */
//             requestAnimationFrame(() => {
//               if (mountedRef.current) {
//                 navigateToHostDashboard();
//               }
//             });

//             return;
//           }

//           /*
//            * A cleaner-cancellation replacement should not
//            * create an additional host charge when the policy
//            * says no payment is required.
//            *
//            * We still check payment details below when the
//            * workflow is not complete, so we can confirm the
//            * authoritative amount from the backend.
//            */
//           if (
//             workflowSource === 'cleaner_cancellation'
//           ) {
//             console.log(
//               'Replacement source is cleaner_cancellation.'
//             );
//           }
//         }

//         /*
//          * STEP 2:
//          *
//          * The child replacement request ID is required to
//          * retrieve payment details for the selected cleaner.
//          */

//         if (!replacementRequestId) {
//           throw new Error(
//             'Missing replacement request ID for the selected cleaner.'
//           );
//         }

//         const response =
//           await userService.getReplacementPaymentDetails(
//             String(scheduleId),
//             String(replacementRequestId)
//           );

//         const responseData = unwrapResponse(response);

//         const payment =
//           responseData?.payment ??
//           responseData?.paymentDetails ??
//           responseData;

//         if (
//           !payment ||
//           typeof payment !== 'object'
//         ) {
//           throw new Error(
//             'The server did not return valid replacement payment details.'
//           );
//         }

//         const source = getPaymentSource(payment);

//         const hostAdditionalCharge =
//           getHostAdditionalCharge(payment);

//         console.log(
//           'Replacement payment details received:',
//           {
//             source,
//             hostAdditionalCharge,
//             replacementRequestId,
//           }
//         );

//         /*
//          * STEP 3:
//          *
//          * If this is a cleaner cancellation and the backend
//          * calculates zero additional payment, do not create
//          * a PaymentIntent.
//          *
//          * The assignment must still be confirmed by the
//          * backend before navigating away.
//          */

//         if (
//           source === 'cleaner_cancellation' &&
//           hostAdditionalCharge === 0
//         ) {
//           console.log(
//             'Cleaner cancellation requires no additional host payment. Stripe will not be called.'
//           );

//           if (mountedRef.current) {
//             setPaymentDetails({
//               ...payment,
//               source,
//               hostAdditionalCharge: 0,
//               propertyName,
//               cleaningDate:
//                 newCleaningDate || oldCleaningDate,
//               cleaningTime,
//               group,
//               replacementCleaner: cleanerName,
//               originalCleaner: replacedCleanerName,
//             });

//             setClientSecret(null);
//             setPaymentIntentId(null);
//             setPaymentProcessing(true);
//           }

//           /*
//            * The assignment may already be complete, or the
//            * backend may still be finalizing it.
//            *
//            * Wait for confirmed completion. Never create a
//            * PaymentIntent in this branch.
//            */

//           const completed =
//             await waitForReplacementCompletion({
//               redirectOnCompletion: true,
//             });

//           if (completed) {
//             return;
//           }

//           /*
//            * Do not send the host into Stripe when no payment
//            * is required. If the backend has not confirmed
//            * assignment yet, leave a clear message instead.
//            */
//           if (mountedRef.current) {
//             setPaymentProcessing(false);

//             setErrorMessage(
//               'No additional payment is required. The replacement assignment has not yet been confirmed by the server. Please refresh this screen shortly.'
//             );
//           }

//           return;
//         }

//         /*
//          * STEP 4:
//          *
//          * For other replacement scenarios, retain the normal
//          * payment-details display and Stripe payment flow.
//          */

//         if (mountedRef.current) {
//           setPaymentDetails({
//             ...payment,

//             source,

//             hostAdditionalCharge,

//             propertyName,

//             cleaningDate:
//               newCleaningDate || oldCleaningDate,

//             cleaningTime,

//             group,

//             replacementCleaner: cleanerName,

//             originalCleaner: replacedCleanerName,
//           });
//         }
//       } catch (error) {
//         console.error(
//           'Error loading replacement payment details:',
//           error?.response?.data || error?.message || error
//         );

//         if (mountedRef.current) {
//           setErrorMessage(
//             error?.response?.data?.detail ||
//             error?.response?.data?.message ||
//             error?.message ||
//             'Unable to load replacement payment details.'
//           );
//         }
//       } finally {
//         if (mountedRef.current) {
//           setLoading(false);
//         }
//       }
//     },
//     [
//       scheduleId,
//       requestId,
//       replacementRequestId,
//       findReplacementWorkflow,
//       isWorkflowCompleted,
//       getPaymentSource,
//       getHostAdditionalCharge,
//       unwrapResponse,
//       waitForReplacementCompletion,
//       navigateToHostDashboard,
//       propertyName,
//       newCleaningDate,
//       oldCleaningDate,
//       cleaningTime,
//       group,
//       cleanerName,
//       replacedCleanerName,
//     ]
//   );


//   // ---------------------------------------------------------
//   // LOAD WHEN THE SCREEN RECEIVES FOCUS
//   // ---------------------------------------------------------

//   useFocusEffect(
//     useCallback(() => {
//       navigationStartedRef.current = false;

//       fetchPaymentDetails();

//       return () => {
//         // Do not set state here. The mounted ref handles
//         // state updates when the component unmounts.
//       };
//     }, [fetchPaymentDetails])
//   );


//   // ---------------------------------------------------------
//   // HANDLE PAYMENT
//   // ---------------------------------------------------------

//   const handlePayment = useCallback(
//     async () => {
//       if (paymentRequestInProgressRef.current) {
//         return;
//       }

//       if (replacementCompleted) {
//         navigateToHostDashboard();
//         return;
//       }

//       if (!acceptedPolicy) {
//         Alert.alert(
//           'Policy Agreement Required',
//           'Please review and accept the replacement payment policy before continuing.'
//         );

//         return;
//       }

//       if (!scheduleId || !requestId) {
//         Alert.alert(
//           'Missing Information',
//           'The schedule or replacement workflow ID is missing.'
//         );

//         return;
//       }

//       if (!replacementRequestId) {
//         Alert.alert(
//           'Missing Replacement Request',
//           'The selected cleaner replacement request ID is missing.'
//         );

//         return;
//       }

//       /*
//        * Always re-check the parent workflow before creating
//        * a PaymentIntent.
//        *
//        * This protects against the host returning to this
//        * screen after the replacement has already been assigned.
//        */

//       const alreadyCompleted =
//         await checkReplacementWorkflow();

//       if (alreadyCompleted) {
//         navigateToHostDashboard();
//         return;
//       }

//       const source = getPaymentSource(paymentDetails);

//       const amount =
//         getHostAdditionalCharge(paymentDetails);

//       /*
//        * IMPORTANT:
//        *
//        * Cleaner cancellation with zero additional charge
//        * must never create a Stripe PaymentIntent.
//        */

//       if (
//         source === 'cleaner_cancellation' &&
//         amount === 0
//       ) {
//         console.log(
//           'Blocking Stripe PaymentIntent: cleaner cancellation has zero additional charge.'
//         );

//         const completed =
//           await waitForReplacementCompletion({
//             redirectOnCompletion: true,
//           });

//         if (completed) {
//           return;
//         }

//         Alert.alert(
//           'No Additional Payment Required',
//           'The cleaner cancellation does not require another payment. The replacement assignment is still awaiting server confirmation. Please try again shortly.'
//         );

//         return;
//       }

//       /*
//        * A payment-required replacement must have a valid,
//        * positive amount.
//        *
//        * Do not allow missing, invalid, or zero amounts to
//        * fall through to Stripe.
//        */

//       if (
//         amount === null ||
//         !Number.isFinite(amount) ||
//         amount <= 0
//       ) {
//         Alert.alert(
//           'Payment Not Required or Unavailable',
//           'The server has not returned a valid positive payment amount. No payment has been initiated. Please refresh the replacement details.'
//         );

//         return;
//       }

//       paymentRequestInProgressRef.current = true;

//       setPaymentLoading(true);
//       setErrorMessage(null);

//       try {
//         /*
//          * Retrieve the authenticated host's customer ID.
//          *
//          * Keep the field names consistent with the existing
//          * AuthContext/user model in your application.
//          */

//         const stripeCustomerId =
//           currentUser?.stripeCustomerId ||
//           currentUser?.stripe_customer_id ||
//           currentUser?.customerId ||
//           currentUser?.stripe?.customerId ||
//           null;

//         const receiptEmail =
//           currentUser?.email || null;

//         if (!stripeCustomerId) {
//           throw new Error(
//             'Your Stripe customer account could not be found. Please contact support.'
//           );
//         }

//         /*
//          * The server remains authoritative for payment
//          * validation and the final amount.
//          *
//          * The child replacement request ID is used here.
//          */

//         const payload = {
//           scheduleId: String(scheduleId),

//           requestId: String(replacementRequestId),

//           replacementRequestId: String(
//             replacementRequestId
//           ),

//           parentRequestId: String(requestId),

//           cleanerId: cleanerId
//             ? String(cleanerId)
//             : undefined,

//           replacedCleanerId: replacedCleanerId
//             ? String(replacedCleanerId)
//             : undefined,

//           group: group || undefined,

//           customerId: String(stripeCustomerId),

//           receiptEmail,

//           amount,
//         };

//         console.log(
//           'Creating replacement PaymentIntent:',
//           {
//             scheduleId: payload.scheduleId,
//             replacementRequestId:
//               payload.replacementRequestId,
//             parentRequestId:
//               payload.parentRequestId,
//             source,
//             amount,
//           }
//         );

//         /*
//          * This endpoint should independently validate the
//          * payment requirement on the backend.
//          */

//         const response =
//           await userService.createReplacementPaymentIntent(
//             payload
//           );

//         const responseData =
//           unwrapResponse(response);

//         const secret =
//           responseData?.clientSecret ||
//           responseData?.client_secret ||
//           responseData?.paymentIntent?.client_secret ||
//           null;

//         const intentId =
//           responseData?.paymentIntentId ||
//           responseData?.payment_intent_id ||
//           responseData?.paymentIntent?.id ||
//           null;

//         if (!secret) {
//           throw new Error(
//             'The server did not return a Stripe client secret.'
//           );
//         }

//         if (mountedRef.current) {
//           setClientSecret(secret);
//           setPaymentIntentId(intentId);
//         }
//       } catch (error) {
//         console.error(
//           'Error creating replacement PaymentIntent:',
//           error?.response?.data || error?.message || error
//         );

//         const detail =
//           error?.response?.data?.detail ||
//           error?.response?.data?.message ||
//           error?.message ||
//           'Unable to initiate replacement payment.';

//         if (mountedRef.current) {
//           setErrorMessage(detail);

//           Alert.alert(
//             'Payment Error',
//             detail
//           );
//         }
//       } finally {
//         paymentRequestInProgressRef.current = false;

//         if (mountedRef.current) {
//           setPaymentLoading(false);
//         }
//       }
//     },
//     [
//       acceptedPolicy,
//       replacementCompleted,
//       scheduleId,
//       requestId,
//       replacementRequestId,
//       checkReplacementWorkflow,
//       navigateToHostDashboard,
//       getPaymentSource,
//       getHostAdditionalCharge,
//       paymentDetails,
//       waitForReplacementCompletion,
//       currentUser,
//       cleanerId,
//       replacedCleanerId,
//       group,
//       unwrapResponse,
//     ]
//   );


//   // ---------------------------------------------------------
//   // STRIPE PAYMENT SUCCESS
//   // ---------------------------------------------------------

//   const handlePaymentSuccess = useCallback(
//     async (paymentResult) => {
//       console.log(
//         'Stripe payment flow reported success:',
//         paymentResult?.paymentIntent?.id ||
//         paymentResult?.id ||
//         paymentIntentId ||
//         'Payment result received'
//       );

//       setClientSecret(null);
//       setPaymentProcessing(true);

//       /*
//        * A successful Stripe payment is not, by itself,
//        * confirmation that the replacement assignment has
//        * been finalized.
//        *
//        * The backend/webhook must confirm completion.
//        */

//       const completed =
//         await waitForReplacementCompletion({
//           redirectOnCompletion: true,
//         });

//       if (!completed && mountedRef.current) {
//         Alert.alert(
//           'Payment Received',
//           'Your payment was processed, but the replacement assignment is still being confirmed. Please return to this screen shortly to check the status.'
//         );
//       }
//     },
//     [
//       paymentIntentId,
//       waitForReplacementCompletion,
//     ]
//   );


//   // ---------------------------------------------------------
//   // STRIPE PAYMENT FAILURE
//   // ---------------------------------------------------------

//   const handlePaymentError = useCallback(
//     (error) => {
//       console.error(
//         'Stripe replacement payment failed:',
//         error?.message || error
//       );

//       setPaymentProcessing(false);
//       setClientSecret(null);

//       const message =
//         error?.message ||
//         'Your replacement payment could not be completed. Please try again.';

//       setErrorMessage(message);

//       Alert.alert(
//         'Payment Failed',
//         message
//       );
//     },
//     []
//   );


//   // ---------------------------------------------------------
//   // FORMAT MONEY
//   // ---------------------------------------------------------

//   const formatCurrency = useCallback(
//     (value) => {
//       const amount = Number(value);

//       if (!Number.isFinite(amount)) {
//         return '$0.00';
//       }

//       return new Intl.NumberFormat('en-US', {
//         style: 'currency',
//         currency: 'USD',
//       }).format(amount);
//     },
//     []
//   );


//   // ---------------------------------------------------------
//   // DISPLAY DATE
//   // ---------------------------------------------------------

//   const formatDisplayDate = useCallback(
//     (value) => {
//       if (!value) {
//         return 'Not specified';
//       }

//       /*
//        * Avoid interpreting a YYYY-MM-DD date as UTC and
//        * accidentally displaying the previous local day.
//        */

//       const match = String(value).match(
//         /^(\d{4})-(\d{2})-(\d{2})$/
//       );

//       let date;

//       if (match) {
//         date = new Date(
//           Number(match[1]),
//           Number(match[2]) - 1,
//           Number(match[3])
//         );
//       } else {
//         date = new Date(value);
//       }

//       if (Number.isNaN(date.getTime())) {
//         return String(value);
//       }

//       return date.toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric',
//       });
//     },
//     []
//   );


//   // ---------------------------------------------------------
//   // LOADING SCREEN
//   // ---------------------------------------------------------

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.centeredContainer}>
//         <ActivityIndicator
//           size="large"
//           color={COLORS?.primary || '#2563EB'}
//         />

//         <Text style={styles.loadingText}>
//           Checking replacement status...
//         </Text>
//       </SafeAreaView>
//     );
//   }


//   // ---------------------------------------------------------
//   // REPLACEMENT COMPLETION SCREEN
//   // ---------------------------------------------------------

//   if (replacementCompleted) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.completionContainer}>
//           <MaterialCommunityIcons
//             name="check-circle"
//             size={82}
//             color="#16A34A"
//           />

//           <Text style={styles.completionTitle}>
//             Replacement Completed
//           </Text>

//           <Text style={styles.completionDescription}>
//             The replacement cleaner has been assigned successfully.
//             No further action is required.
//           </Text>

//           <Button
//             mode="contained"
//             onPress={navigateToHostDashboard}
//             style={styles.primaryButton}
//             contentStyle={styles.buttonContent}
//           >
//             Go to Dashboard
//           </Button>
//         </View>
//       </SafeAreaView>
//     );
//   }


//   // ---------------------------------------------------------
//   // WAITING FOR ZERO-PAYMENT ASSIGNMENT
//   // ---------------------------------------------------------

//   if (
//     paymentProcessing &&
//     !clientSecret &&
//     getPaymentSource(paymentDetails) ===
//       'cleaner_cancellation' &&
//     getHostAdditionalCharge(paymentDetails) === 0
//   ) {
//     return (
//       <SafeAreaView style={styles.centeredContainer}>
//         <ActivityIndicator
//           size="large"
//           color={COLORS?.primary || '#2563EB'}
//         />

//         <Text style={styles.loadingText}>
//           Confirming your replacement cleaner...
//         </Text>

//         <Text style={styles.waitingDescription}>
//           No additional payment is required. We are waiting for
//           the server to confirm the replacement assignment.
//         </Text>

//         <Button
//           mode="outlined"
//           onPress={async () => {
//             const completed =
//               await checkReplacementWorkflow();

//             if (completed) {
//               navigateToHostDashboard();
//               return;
//             }

//             Alert.alert(
//               'Replacement Pending',
//               'The server has not confirmed the assignment yet. Please try again shortly.'
//             );
//           }}
//           style={styles.secondaryButton}
//         >
//           Check Status
//         </Button>
//       </SafeAreaView>
//     );
//   }


//   // ---------------------------------------------------------
//   // ERROR SCREEN
//   // ---------------------------------------------------------

//   if (errorMessage && !paymentDetails && !clientSecret) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.errorContainer}>
//           <MaterialCommunityIcons
//             name="alert-circle-outline"
//             size={64}
//             color="#DC2626"
//           />

//           <Text style={styles.errorTitle}>
//             Unable to Load Replacement
//           </Text>

//           <Text style={styles.errorDescription}>
//             {errorMessage}
//           </Text>

//           <Button
//             mode="contained"
//             onPress={fetchPaymentDetails}
//             style={styles.primaryButton}
//           >
//             Retry
//           </Button>

//           <Button
//             mode="outlined"
//             onPress={navigateToHostDashboard}
//             style={styles.secondaryButton}
//           >
//             Go to Dashboard
//           </Button>
//         </View>
//       </SafeAreaView>
//     );
//   }


//   // ---------------------------------------------------------
//   // PAYMENT SUMMARY
//   // ---------------------------------------------------------

//   const paymentAmount =
//     getHostAdditionalCharge(paymentDetails);

//   const paymentSource =
//     getPaymentSource(paymentDetails);

//   const requiresPayment =
//     paymentAmount !== null &&
//     Number.isFinite(paymentAmount) &&
//     paymentAmount > 0;

//   const cleaningDate =
//     paymentDetails?.cleaningDate ||
//     newCleaningDate ||
//     oldCleaningDate;

//   const displayPropertyName =
//     paymentDetails?.propertyName ||
//     propertyName ||
//     'Property';

//   const displayCleanerName =
//     paymentDetails?.replacementCleaner ||
//     cleanerName ||
//     'Replacement cleaner';

//   const displayOriginalCleanerName =
//     paymentDetails?.originalCleaner ||
//     replacedCleanerName ||
//     'Previous cleaner';


//   // ---------------------------------------------------------
//   // MAIN SCREEN
//   // ---------------------------------------------------------

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         keyboardShouldPersistTaps="handled"
//       >
//         <View style={styles.header}>
//           <TouchableOpacity
//             onPress={() => navigation.goBack()}
//             style={styles.backButton}
//           >
//             <MaterialCommunityIcons
//               name="arrow-left"
//               size={25}
//               color="#111827"
//             />
//           </TouchableOpacity>

//           <Text style={styles.headerTitle}>
//             Replacement Cleaner
//           </Text>
//         </View>


//         {/* Replacement details */}

//         <Card style={styles.card}>
//           <Card.Content>
//             <View style={styles.cardHeading}>
//               <MaterialCommunityIcons
//                 name="account-switch-outline"
//                 size={25}
//                 color={COLORS?.primary || '#2563EB'}
//               />

//               <Text style={styles.cardTitle}>
//                 Replacement Details
//               </Text>
//             </View>

//             <Divider style={styles.divider} />

//             <DetailRow
//               label="Property"
//               value={displayPropertyName}
//             />

//             <DetailRow
//               label="Replacement cleaner"
//               value={displayCleanerName}
//             />

//             <DetailRow
//               label="Previous cleaner"
//               value={displayOriginalCleanerName}
//             />

//             <DetailRow
//               label="Cleaning date"
//               value={formatDisplayDate(cleaningDate)}
//             />

//             <DetailRow
//               label="Cleaning time"
//               value={cleaningTime || 'Not specified'}
//             />

//             <DetailRow
//               label="Cleaning group"
//               value={
//                 group
//                   ? String(group)
//                       .replace(/_/g, ' ')
//                       .replace(/\b\w/g, (letter) =>
//                         letter.toUpperCase()
//                       )
//                   : 'Not specified'
//               }
//             />
//           </Card.Content>
//         </Card>


//         {/* Payment details */}

//         <Card style={styles.card}>
//           <Card.Content>
//             <View style={styles.cardHeading}>
//               <MaterialCommunityIcons
//                 name="credit-card-outline"
//                 size={25}
//                 color={COLORS?.primary || '#2563EB'}
//               />

//               <Text style={styles.cardTitle}>
//                 Payment Summary
//               </Text>
//             </View>

//             <Divider style={styles.divider} />

//             {paymentSource === 'cleaner_cancellation' &&
//             paymentAmount === 0 ? (
//               <View style={styles.noPaymentContainer}>
//                 <MaterialCommunityIcons
//                   name="check-circle-outline"
//                   size={34}
//                   color="#16A34A"
//                 />

//                 <Text style={styles.noPaymentTitle}>
//                   No Additional Payment Required
//                 </Text>

//                 <Text style={styles.noPaymentDescription}>
//                   The original booking payment remains in place.
//                   The replacement process will not initiate another
//                   charge for this cleaner cancellation.
//                 </Text>
//               </View>
//             ) : (
//               <>
//                 <DetailRow
//                   label="Additional payment"
//                   value={
//                     paymentAmount !== null
//                       ? formatCurrency(paymentAmount)
//                       : 'Unavailable'
//                   }
//                   emphasize
//                 />

//                 {paymentDetails?.currency && (
//                   <DetailRow
//                     label="Currency"
//                     value={String(
//                       paymentDetails.currency
//                     ).toUpperCase()}
//                   />
//                 )}

//                 <Text style={styles.paymentNote}>
//                   The replacement payment amount is calculated by
//                   the server according to the applicable replacement
//                   policy.
//                 </Text>
//               </>
//             )}
//           </Card.Content>
//         </Card>


//         {/* Policy agreement */}

//         {requiresPayment && (
//           <Card style={styles.card}>
//             <Card.Content>
//               <Text style={styles.cardTitle}>
//                 Replacement Payment Policy
//               </Text>

//               <Divider style={styles.divider} />

//               <Text style={styles.policyText}>
//                 I understand that the additional replacement
//                 payment shown above is calculated according to
//                 Freshsweeper's replacement policy. I authorize
//                 payment of the displayed amount to complete this
//                 replacement.
//               </Text>

//               <View style={styles.checkboxContainer}>
//                 <Checkbox
//                   status={
//                     acceptedPolicy
//                       ? 'checked'
//                       : 'unchecked'
//                   }
//                   onPress={() => {
//                     setAcceptedPolicy((previous) => !previous);
//                   }}
//                 />

//                 <TouchableOpacity
//                   style={styles.checkboxTextContainer}
//                   onPress={() => {
//                     setAcceptedPolicy((previous) => !previous);
//                   }}
//                 >
//                   <Text style={styles.checkboxText}>
//                     I have read and accept the replacement payment
//                     policy.
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </Card.Content>
//           </Card>
//         )}


//         {/* General error message */}

//         {errorMessage && (
//           <View style={styles.inlineError}>
//             <MaterialCommunityIcons
//               name="alert-circle-outline"
//               size={21}
//               color="#DC2626"
//             />

//             <Text style={styles.inlineErrorText}>
//               {errorMessage}
//             </Text>
//           </View>
//         )}


//         {/* Stripe payment button */}

//         {clientSecret && requiresPayment && (
//           <View style={styles.paymentButtonContainer}>
//             <Text style={styles.paymentInstructions}>
//               Complete the payment below to continue the
//               replacement process.
//             </Text>

//             <StripeGroupPaymentButton
//               clientSecret={clientSecret}
//               onSuccess={handlePaymentSuccess}
//               onError={handlePaymentError}
//             />
//           </View>
//         )}


//         {/* Create PaymentIntent button */}

//         {!clientSecret &&
//           !paymentProcessing &&
//           requiresPayment && (
//             <Button
//               mode="contained"
//               onPress={handlePayment}
//               loading={paymentLoading}
//               disabled={paymentLoading}
//               style={styles.primaryButton}
//               contentStyle={styles.buttonContent}
//             >
//               {paymentLoading
//                 ? 'Preparing Payment...'
//                 : `Continue to Payment — ${formatCurrency(
//                     paymentAmount
//                   )}`}
//             </Button>
//           )}


//         {/* Zero-payment cleaner cancellation */}

//         {!clientSecret &&
//           !paymentProcessing &&
//           paymentSource === 'cleaner_cancellation' &&
//           paymentAmount === 0 && (
//             <View style={styles.noPaymentActionContainer}>
//               <Text style={styles.paymentInstructions}>
//                 No payment will be initiated. Check the replacement
//                 assignment status below.
//               </Text>

//               <Button
//                 mode="contained"
//                 onPress={async () => {
//                   setPaymentProcessing(true);

//                   const completed =
//                     await waitForReplacementCompletion({
//                       redirectOnCompletion: true,
//                     });

//                   if (!completed && mountedRef.current) {
//                     setPaymentProcessing(false);

//                     Alert.alert(
//                       'Replacement Pending',
//                       'The backend has not confirmed the replacement assignment yet. No payment has been initiated.'
//                     );
//                   }
//                 }}
//                 style={styles.primaryButton}
//                 contentStyle={styles.buttonContent}
//               >
//                 Check Replacement Status
//               </Button>
//             </View>
//           )}


//         {/* Back to dashboard */}

//         {!clientSecret && !paymentProcessing && (
//           <Button
//             mode="text"
//             onPress={navigateToHostDashboard}
//             style={styles.dashboardButton}
//           >
//             Return to Dashboard
//           </Button>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// };


// // ---------------------------------------------------------
// // REUSABLE DETAIL ROW
// // ---------------------------------------------------------

// const DetailRow = ({
//   label,
//   value,
//   emphasize = false,
// }) => {
//   return (
//     <View style={styles.detailRow}>
//       <Text style={styles.detailLabel}>
//         {label}
//       </Text>

//       <Text
//         style={[
//           styles.detailValue,
//           emphasize && styles.emphasizedValue,
//         ]}
//       >
//         {value == null || value === ''
//           ? 'Not specified'
//           : String(value)}
//       </Text>
//     </View>
//   );
// };


// // ---------------------------------------------------------
// // STYLES
// // ---------------------------------------------------------

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8FAFC',
//   },

//   centeredContainer: {
//     flex: 1,
//     backgroundColor: '#F8FAFC',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 24,
//     paddingVertical: 32,
//   },

//   scrollContent: {
//     paddingHorizontal: 16,
//     paddingTop: 12,
//     paddingBottom: 40,
//   },

//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },

//   backButton: {
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 10,
//   },

//   headerTitle: {
//     flex: 1,
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#111827',
//   },

//   card: {
//     marginBottom: 16,
//     borderRadius: 14,
//     backgroundColor: '#FFFFFF',
//     elevation: 2,
//   },

//   cardHeading: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//   },

//   cardTitle: {
//     fontSize: 17,
//     fontWeight: '700',
//     color: '#111827',
//     marginLeft: 9,
//     flexShrink: 1,
//   },

//   divider: {
//     marginVertical: 14,
//   },

//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     paddingVertical: 9,
//     gap: 12,
//   },

//   detailLabel: {
//     flex: 1,
//     fontSize: 14,
//     color: '#64748B',
//   },

//   detailValue: {
//     flex: 1.3,
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1F2937',
//     textAlign: 'right',
//   },

//   emphasizedValue: {
//     fontSize: 19,
//     fontWeight: '700',
//     color: '#111827',
//   },

//   paymentNote: {
//     marginTop: 12,
//     fontSize: 13,
//     lineHeight: 19,
//     color: '#64748B',
//   },

//   policyText: {
//     fontSize: 14,
//     lineHeight: 21,
//     color: '#475569',
//   },

//   checkboxContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 12,
//   },

//   checkboxTextContainer: {
//     flex: 1,
//     paddingVertical: 8,
//   },

//   checkboxText: {
//     fontSize: 14,
//     lineHeight: 20,
//     color: '#334155',
//   },

//   primaryButton: {
//     marginTop: 16,
//     borderRadius: 9,
//     backgroundColor: COLORS?.primary || '#2563EB',
//   },

//   secondaryButton: {
//     marginTop: 12,
//     borderRadius: 9,
//   },

//   buttonContent: {
//     minHeight: 48,
//     paddingVertical: 4,
//   },

//   dashboardButton: {
//     marginTop: 10,
//   },

//   paymentButtonContainer: {
//     marginTop: 8,
//     marginBottom: 12,
//   },

//   paymentInstructions: {
//     fontSize: 14,
//     lineHeight: 21,
//     color: '#475569',
//     marginBottom: 10,
//   },

//   noPaymentContainer: {
//     alignItems: 'center',
//     paddingVertical: 14,
//     paddingHorizontal: 8,
//   },

//   noPaymentTitle: {
//     fontSize: 17,
//     fontWeight: '700',
//     color: '#166534',
//     textAlign: 'center',
//     marginTop: 10,
//   },

//   noPaymentDescription: {
//     fontSize: 14,
//     lineHeight: 21,
//     color: '#475569',
//     textAlign: 'center',
//     marginTop: 8,
//   },

//   noPaymentActionContainer: {
//     marginTop: 4,
//     marginBottom: 8,
//   },

//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#334155',
//     textAlign: 'center',
//   },

//   waitingDescription: {
//     fontSize: 14,
//     lineHeight: 21,
//     color: '#64748B',
//     textAlign: 'center',
//     marginTop: 12,
//     marginBottom: 12,
//   },

//   completionContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 24,
//     paddingVertical: 32,
//   },

//   completionTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#111827',
//     textAlign: 'center',
//     marginTop: 20,
//   },

//   completionDescription: {
//     fontSize: 15,
//     lineHeight: 23,
//     color: '#64748B',
//     textAlign: 'center',
//     marginTop: 12,
//     marginBottom: 12,
//   },

//   errorContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 24,
//     paddingVertical: 32,
//   },

//   errorTitle: {
//     fontSize: 21,
//     fontWeight: '700',
//     color: '#111827',
//     textAlign: 'center',
//     marginTop: 16,
//   },

//   errorDescription: {
//     fontSize: 14,
//     lineHeight: 21,
//     color: '#64748B',
//     textAlign: 'center',
//     marginTop: 12,
//   },

//   inlineError: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     padding: 12,
//     marginVertical: 10,
//     borderRadius: 8,
//     backgroundColor: '#FEF2F2',
//     gap: 8,
//   },

//   inlineErrorText: {
//     flex: 1,
//     fontSize: 13,
//     lineHeight: 19,
//     color: '#991B1B',
//   },
// });


// export default ReplacementPayment;
















// import React, {
//     useCallback,
//     useContext,
//     useState,
//   } from 'react';
  
//   import {
//     View,
//     Text,
//     StyleSheet,
//     SafeAreaView,
//     ScrollView,
//     Alert,
//     ActivityIndicator,
//     TouchableOpacity,
//   } from 'react-native';
  
//   import {
//     Button,
//     Card,
//     Divider,
//     Checkbox,
//   } from 'react-native-paper';
  
//   import {
//     useNavigation,
//     useRoute,
//     useFocusEffect,
//   } from '@react-navigation/native';
  
//   import {
//     MaterialCommunityIcons,
//   } from '@expo/vector-icons';
  
//   import { AuthContext } from '../../context/AuthContext';
  
//   import COLORS from '../../constants/colors';
//   import userService from '../../services/connection/userService';
//   import { tSafe } from '../../utils/tSafe';
//   import StripeGroupPaymentButton from '../../components/shared/StripeGroupPaymentButton';
  
  
//   const ReplacementPayment = () => {
//     const navigation = useNavigation();
//     const route = useRoute();
  
//     const { currentUser } =
//       useContext(AuthContext);
  
//     const receiptEmail =
//       currentUser?.email || null;
  
  
//     /*
//      * =========================================================
//      * ROUTE PARAMS
//      * =========================================================
//      */
  
//     const {
//       scheduleId,
  
//       // Parent date-change request
//       requestId,
  
//       // Child replacement request
//       replacementRequestId,
  
//       // Selected replacement cleaner
//       cleanerId,
//       cleanerName,
  
//       // Original cleaner
//       replacedCleanerId,
//       replacedCleanerName,
  
//       // Updated cleaning date
//       oldCleaningDate,
//       newCleaningDate,
//       cleaningTime,
//       propertyName,
//       group,
//     } = route.params || {};
  
  
//     /*
//      * =========================================================
//      * DISPLAY HELPERS
//      * =========================================================
//      */
  
//     /*
//      * IMPORTANT:
//      *
//      * Dates such as:
//      *
//      * 2026-09-27
//      *
//      * must not be passed directly to:
//      *
//      * new Date("2026-09-27")
//      *
//      * because JavaScript interprets YYYY-MM-DD as UTC,
//      * which can cause the displayed date to shift backward
//      * depending on the user's timezone.
//      */
  
//     const formatDate = (dateValue) => {
//       if (!dateValue) {
//         return tSafe(
//           'not_available',
//           'Not available'
//         );
//       }
  
//       /*
//        * Handle YYYY-MM-DD explicitly.
//        */
//       if (
//         typeof dateValue === 'string' &&
//         /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
//       ) {
//         const [year, month, day] =
//           dateValue.split('-').map(Number);
  
//         const date = new Date(
//           year,
//           month - 1,
//           day
//         );
  
//         return date.toLocaleDateString(
//           undefined,
//           {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric',
//           }
//         );
//       }
  
//       /*
//        * Handle other valid date formats.
//        */
//       const date = new Date(dateValue);
  
//       if (Number.isNaN(date.getTime())) {
//         return String(dateValue);
//       }
  
//       return date.toLocaleDateString(
//         undefined,
//         {
//           year: 'numeric',
//           month: 'short',
//           day: 'numeric',
//         }
//       );
//     };
  
  
//     /*
//      * Convert:
//      *
//      * group_a
//      *
//      * into:
//      *
//      * Group A
//      */
  
//     const formatGroup = (groupValue) => {
//       if (!groupValue) {
//         return '';
//       }
  
//       return String(groupValue)
//         .replace(/[_-]+/g, ' ')
//         .replace(/\b\w/g, (letter) =>
//           letter.toUpperCase()
//         );
//     };
  
  
//     /*
//      * Format currency safely.
//      */
  
//     const formatMoney = (
//       value,
//       currency = 'USD'
//     ) => {
//       const numericValue = Number(value);
  
//       if (!Number.isFinite(numericValue)) {
//         return `${String(currency).toUpperCase()} 0.00`;
//       }
  
//       try {
//         return new Intl.NumberFormat(
//           undefined,
//           {
//             style: 'currency',
//             currency: String(currency).toUpperCase(),
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2,
//           }
//         ).format(numericValue);
//       } catch (error) {
//         return `${String(currency).toUpperCase()} ${numericValue.toFixed(2)}`;
//       }
//     };
  
  
//     /*
//      * =========================================================
//      * STATE
//      * =========================================================
//      */
  
//     const [loading, setLoading] =
//       useState(true);
  
//     const [paymentLoading, setPaymentLoading] =
//       useState(false);
  
//     const [paymentProcessing, setPaymentProcessing] =
//       useState(false);
  
//     const [replacementCompleted, setReplacementCompleted] =
//       useState(false);
  
//     const [paymentDetails, setPaymentDetails] =
//       useState(null);
  
//     const [acceptedPolicy, setAcceptedPolicy] =
//       useState(false);
  
//     const [clientSecret, setClientSecret] =
//       useState(null);
  
//     const [paymentIntentId, setPaymentIntentId] =
//       useState(null);

    
//     /*
//     * =========================================================
//     * REDIRECT TO HOST DASHBOARD
//     * =========================================================
//     */

//     const navigateToHostDashboard = useCallback(() => {
//       console.log(
//         '🏠 Replacement completed. Redirecting host to dashboard.'
//       );

//       navigation.reset({
//         index: 0,
//         routes: [
//           {
//             name: 'Dashboard Host',
//           },
//         ],
//       });
//     }, [navigation]);
  
  
//     /*
//      * =========================================================
//      * LOAD PAYMENT DETAILS
//      * =========================================================
//      *
//      * The backend calculates:
//      *
//      * - replacement cleaner earnings
//      * - replacement fee
//      * - penalty
//      * - host additional charge
//      * - total due
//      *
//      * The mobile application does NOT calculate the
//      * amount that Stripe will charge.
//      */
  
//     const fetchPaymentDetails =
//       useCallback(async () => {
  
//         if (
//           !scheduleId ||
//           !requestId ||
//           !replacementRequestId ||
//           !cleanerId
//         ) {
//           setLoading(false);
  
//           Alert.alert(
//             tSafe(
//               'error_title',
//               'Error'
//             ),
//             tSafe(
//               'missing_replacement_information',
//               'The replacement information is missing. Please go back and select the cleaner again.'
//             )
//           );
  
//           return;
//         }
  
//         try {
//           setLoading(true);
  
//           console.log(
//             '💳 Loading replacement payment details'
//           );
  
//           console.log(
//             'Schedule ID:',
//             scheduleId
//           );
  
//           console.log(
//             'Parent Request ID:',
//             requestId
//           );
  
//           console.log(
//             'Replacement Request ID:',
//             replacementRequestId
//           );
  
//           console.log(
//             'Replacement Cleaner ID:',
//             cleanerId
//           );
  
//           /*
//            * IMPORTANT:
//            *
//            * The payment endpoint uses the CHILD
//            * replacement request ID.
//            *
//            * requestId =
//            * parent date_change request
//            *
//            * replacementRequestId =
//            * child replacement request
//            */
  
//           const response =
//             await userService.getReplacementPaymentDetails(
//               String(scheduleId),
//               String(replacementRequestId)
//             );
  
//           const responseData =
//             response?.data || response;
  
//           if (!responseData) {
//             throw new Error(
//               'No replacement payment details returned.'
//             );
//           }
  
//           console.log(
//             '✅ Replacement payment response:',
//             responseData
//           );
  
//           /*
//            * Backend returns:
//            *
//            * {
//            *   success: true,
//            *   scheduleId: "...",
//            *   requestId: "...",
//            *   payment: {
//            *      ...
//            *   }
//            * }
//            */
  
//           const payment =
//             responseData?.payment ||
//             responseData;
  
//           if (!payment) {
//             throw new Error(
//               'Replacement payment calculation was not returned.'
//             );
//           }
  
//           console.log(
//             '💰 Authoritative replacement payment:',
//             payment
//           );
  
//           setPaymentDetails({
//             ...payment,
  
//             propertyName:
//               payment?.propertyName ||
//               propertyName,
  
//             cleaningDate:
//               payment?.cleaningDate ||
//               newCleaningDate,
  
//             cleaningTime:
//               payment?.cleaningTime ||
//               cleaningTime,
  
//             group:
//               payment?.group ||
//               group,
  
//             replacementCleaner: {
//               ...(payment?.replacementCleaner || {}),
  
//               id:
//                 payment?.replacementCleaner?.id ||
//                 cleanerId,
  
//               name:
//                 payment?.replacementCleaner?.name ||
//                 cleanerName,
//             },
  
//             originalCleaner: {
//               ...(payment?.originalCleaner || {}),
  
//               id:
//                 payment?.originalCleaner?.id ||
//                 replacedCleanerId,
  
//               name:
//                 payment?.originalCleaner?.name ||
//                 replacedCleanerName,
//             },
//           });
  
//         } catch (error) {
  
//           console.error(
//             '❌ Failed to load replacement payment details:',
//             error?.response?.data ||
//               error
//           );
  
//           Alert.alert(
//             tSafe(
//               'unable_to_load',
//               'Unable to Load'
//             ),
  
//             error?.response?.data?.detail ||
//               error?.response?.data?.message ||
//               tSafe(
//                 'failed_to_load_replacement_payment',
//                 'Unable to load the replacement payment information.'
//               ),
  
//             [
//               {
//                 text: tSafe(
//                   'go_back',
//                   'Go Back'
//                 ),
  
//                 onPress: () =>
//                   navigation.goBack(),
//               },
//             ]
//           );
  
//         } finally {
//           setLoading(false);
//         }
  
//       }, [
//         scheduleId,
//         requestId,
//         replacementRequestId,
//         cleanerId,
//         propertyName,
//         newCleaningDate,
//         cleaningTime,
//         group,
//         cleanerName,
//         replacedCleanerId,
//         replacedCleanerName,
//         navigation,
//       ]);
  
  
//     /*
//      * =========================================================
//      * LOAD WHEN SCREEN FOCUSES
//      * =========================================================
//      */
  
//     useFocusEffect(
//       useCallback(() => {
//         fetchPaymentDetails();
//       }, [
//         fetchPaymentDetails,
//       ])
//     );
  
  
//     /*
//      * =========================================================
//      * CHECK REPLACEMENT WORKFLOW
//      * =========================================================
//      *
//      * IMPORTANT:
//      *
//      * Stripe PaymentSheet success does NOT mean the
//      * replacement workflow is completed.
//      *
//      * The backend webhook is responsible for:
//      *
//      * 1. Confirming the payment
//      * 2. Updating the payment record
//      * 3. Assigning the replacement cleaner
//      * 4. Marking the workflow completed
//      */
  
//     const checkReplacementWorkflow =
//       useCallback(async () => {
  
//         if (
//           !scheduleId ||
//           !requestId
//         ) {
//           return false;
//         }
  
//         try {
  
//           console.log(
//             '🔎 Checking replacement workflow status...'
//           );
  
//           const response =
//             await userService.getReplacementWorkflows(
//               String(scheduleId)
//             );
  
//           const workflows =
//             response?.data?.workflows || [];
  
//           /*
//            * requestId here is the PARENT
//            * date-change request.
//            */
  
//           const workflow =
//             workflows.find(
//               (item) =>
//                 String(item?.requestId) ===
//                 String(requestId)
//             );
  
//           if (!workflow) {
  
//             console.log(
//               '⚠️ Replacement workflow not found yet.'
//             );
  
//             return false;
//           }
  
//           console.log(
//             '🔎 Replacement workflow:',
//             workflow
//           );
  
//           /*
//            * Backend is authoritative.
//            */
  
//           if (
//             workflow.status ===
//               'completed' ||
//             workflow.replacementAssigned ===
//               true
//           ) {
  
//             console.log(
//               '✅ Replacement workflow completed.'
//             );
  
//             setPaymentProcessing(false);
//             setReplacementCompleted(true);
  
//             return true;
//           }
  
//           console.log(
//             '⏳ Replacement still processing:',
//             workflow.status
//           );
  
//           return false;
  
//         } catch (error) {
  
//           console.error(
//             '❌ Failed to check replacement workflow:',
//             error?.response?.data ||
//               error?.message ||
//               error
//           );
  
//           return false;
//         }
  
//       }, [
//         scheduleId,
//         requestId,
//       ]);
  
  
//     /*
//      * =========================================================
//      * WAIT FOR WEBHOOK / REPLACEMENT COMPLETION
//      * =========================================================
//      */
  
//     const waitForReplacementCompletion =
//       useCallback(async () => {
  
//         setPaymentProcessing(true);
  
//         /*
//          * Stripe webhook may take a short amount of
//          * time to reach the backend.
//          *
//          * Check every 3 seconds.
//          *
//          * 12 attempts = approximately 36 seconds.
//          */
  
//         for (
//           let attempt = 1;
//           attempt <= 12;
//           attempt++
//         ) {
  
//           console.log(
//             `🔄 Replacement completion check ${attempt}/12`
//           );
  
//           const completed =
//             await checkReplacementWorkflow();
  
//           if (completed) {
//             return;
//           }
  
//           /*
//            * Wait before checking again.
//            */
  
//           await new Promise(
//             (resolve) =>
//               setTimeout(
//                 resolve,
//                 3000
//               )
//           );
//         }
  
//         /*
//          * Stripe succeeded but the backend webhook
//          * has not completed the workflow yet.
//          */
  
//         setPaymentProcessing(false);
  
//         Alert.alert(
//           'Payment Submitted',
  
//           'Your payment was received by Stripe. We are still confirming the replacement cleaner assignment. You can return to your schedule and check the replacement status shortly.',
  
//           [
//             {
//               text: 'OK',
  
//               onPress: () => {
//                 navigation.goBack();
//               },
//             },
//           ]
//         );
  
//       }, [
//         checkReplacementWorkflow,
//         navigation,
//       ]);
  
  
//     /*
//      * =========================================================
//      * PAYMENT
//      * =========================================================
//      */
  
//     const handlePayment =
//       async () => {
  
//         if (!acceptedPolicy) {
  
//           Alert.alert(
//             'Policy Agreement Required',
  
//             'Please review and accept the replacement policy before continuing.'
//           );
  
//           return;
//         }
  
//         if (
//           !scheduleId ||
//           !requestId ||
//           !replacementRequestId ||
//           !cleanerId
//         ) {
  
//           Alert.alert(
//             'Error',
  
//             'Required replacement information is missing.'
//           );
  
//           return;
//         }
  
//         try {
  
//           setPaymentLoading(true);
  
//           /*
//           * =====================================================
//           * AUTHORITATIVE PAYMENT AMOUNT
//           * =====================================================
//           */

//           const rawAmount =
//           paymentDetails?.hostAdditionalCharge ??
//           paymentDetails?.totalDue;

//           const amount = Number(rawAmount);

//           if (
//             rawAmount === undefined ||
//             rawAmount === null ||
//             rawAmount === '' ||
//             !Number.isFinite(amount) ||
//             amount < 0
//           ) {
//             throw new Error(
//               'The replacement payment amount is invalid.'
//             );
//           }

//           /*
//           * Cleaner cancellation:
//           *
//           * The host owes no additional compensation.
//           * Do not create a Stripe PaymentIntent for $0.
//           *
//           * The backend must finalize the zero-additional-charge
//           * workflow through its existing trusted payment and
//           * assignment logic.
//           */

//           if (
//             paymentDetails?.source === 'cleaner_cancellation' &&
//             amount === 0
//           ) {
//           Alert.alert(
//             'No Additional Payment Required',
//             'The original cleaner cancelled this cleaning. No additional compensation is due from you. The replacement assignment must still be confirmed by the server.',
//             [
//               {
//                 text: 'OK',
//                 onPress: () => navigation.goBack(),
//               },
//             ]
//           );

//           return;
//           }
  
  
//           /*
//            * =====================================================
//            * STRIPE CUSTOMER ID
//            * =====================================================
//            *
//            * Support different possible shapes.
//            */
  
//           const rawCustomer =
//             currentUser?.stripeCustomerId ||
//             currentUser?.stripe_customer_id ||
//             currentUser?.stripe_customer ||
//             null;
  
//           let customerId = null;
  
//           if (
//             typeof rawCustomer ===
//             'string'
//           ) {
  
//             customerId =
//               rawCustomer;
  
//           } else if (
//             rawCustomer?.id
//           ) {
  
//             customerId =
//               rawCustomer.id;
  
//           } else if (
//             rawCustomer?.customerId
//           ) {
  
//             customerId =
//               rawCustomer.customerId;
  
//           } else if (
//             rawCustomer?.customer_id
//           ) {
  
//             customerId =
//               rawCustomer.customer_id;
  
//           } else if (
//             rawCustomer?.stripe_customer_id
//           ) {
  
//             customerId =
//               rawCustomer.stripe_customer_id;
//           }
  
//           if (!customerId) {
  
//             throw new Error(
//               'Your Stripe customer account could not be found.'
//             );
//           }
  
  
//           /*
//            * =====================================================
//            * RECEIPT EMAIL
//            * =====================================================
//            */
  
//           const receiptEmail =
//             currentUser?.email ||
//             null;
  
  
//           /*
//            * =====================================================
//            * PAYMENT INTENT PAYLOAD
//            * =====================================================
//            *
//            * IMPORTANT:
//            *
//            * requestId sent in Stripe metadata is the
//            * CHILD replacement request.
//            *
//            * The route-level requestId remains the
//            * PARENT date-change request.
//            */
  
//           const payload = {
  
//             amount,
  
//             currency:
//               String(
//                 paymentDetails?.currency ||
//                 'USD'
//               ).toLowerCase(),
  
//             customerId:
//               String(customerId),
  
//             receiptEmail:
//               receiptEmail ||
//               undefined,
  
//             metadata: {
  
//               scheduleId:
//                 String(scheduleId),
  
//               requestId:
//                 String(
//                   replacementRequestId
//                 ),
//             },
//           };
  
  
//           /*
//            * =====================================================
//            * DEBUG LOGGING
//            * =====================================================
//            */
  
//           console.log(
//             '===================================='
//           );
  
//           console.log(
//             '💳 CREATE REPLACEMENT PAYMENT INTENT'
//           );
  
//           console.log(
//             '===================================='
//           );
  
//           console.log(
//             'Schedule:',
//             scheduleId
//           );
  
//           console.log(
//             'Parent request:',
//             requestId
//           );
  
//           console.log(
//             'Replacement request:',
//             replacementRequestId
//           );
  
//           console.log(
//             'Replacement cleaner:',
//             cleanerId
//           );
  
//           console.log(
//             'Original cleaner:',
//             replacedCleanerId
//           );
  
//           console.log(
//             'Group:',
//             group
//           );
  
//           console.log(
//             'Amount:',
//             amount
//           );
  
//           console.log(
//             'Currency:',
//             payload.currency
//           );
  
//           console.log(
//             'Receipt email:',
//             receiptEmail
//           );
  
//           console.log(
//             'Stripe customer:',
//             `${String(
//               customerId
//             ).substring(0, 8)}...`
//           );
  
  
//           /*
//            * =====================================================
//            * CREATE PAYMENT INTENT
//            * =====================================================
//            */
  
//           const response =
//             await userService.createReplacementPaymentIntent(
//               payload
//             );
  
//           const data =
//             response?.data ||
//             response;
  
//           console.log(
//             '✅ Replacement PaymentIntent response:',
//             data
//           );
  
//           if (!data) {
  
//             throw new Error(
//               'No response was returned from the payment server.'
//             );
//           }
  
//           if (
//             data?.success === false
//           ) {
  
//             throw new Error(
//               data?.message ||
//               'Unable to create the replacement payment.'
//             );
//           }
  
  
//           /*
//            * =====================================================
//            * CLIENT SECRET
//            * =====================================================
//            */
  
//           const returnedClientSecret =
//             data?.clientSecret ||
//             data?.paymentIntentClientSecret ||
//             data?.client_secret ||
//             data?.paymentIntent
//               ?.client_secret;
  
//           if (
//             !returnedClientSecret
//           ) {
  
//             console.error(
//               '❌ No Stripe client secret returned:',
//               data
//             );
  
//             throw new Error(
//               'Stripe did not return a payment client secret.'
//             );
//           }
  
  
//           /*
//            * =====================================================
//            * SAVE PAYMENT INFORMATION
//            * =====================================================
//            */
  
//           setClientSecret(
//             returnedClientSecret
//           );
  
//           setPaymentIntentId(
//             data?.paymentIntentId ||
//             data?.paymentIntent?.id ||
//             null
//           );
  
//           console.log(
//             '✅ Stripe PaymentIntent ready'
//           );
  
//           console.log(
//             'PaymentIntent:',
//             data?.paymentIntentId ||
//               data?.paymentIntent?.id
//           );
  
//         } catch (error) {
  
//           console.error(
//             '❌ Replacement payment error:',
//             error?.response?.data ||
//               error
//           );
  
//           Alert.alert(
//             'Payment Failed',
  
//             error?.response?.data?.detail ||
//               error?.response?.data?.message ||
//               error?.message ||
//               'Unable to prepare the replacement payment.'
//           );
  
//         } finally {
  
//           setPaymentLoading(
//             false
//           );
//         }
//       };
  
  
//     /*
//      * =========================================================
//      * LOADING
//      * =========================================================
//      */
  
//     if (loading) {
  
//       return (
//         <SafeAreaView
//           style={styles.safeArea}
//         >
  
//           <View
//             style={
//               styles.loadingContainer
//             }
//           >
  
//             <ActivityIndicator
//               size="large"
//               color={COLORS.primary}
//             />
  
//             <Text
//               style={
//                 styles.loadingText
//               }
//             >
//               {tSafe(
//                 'loading_payment_details',
//                 'Loading payment details...'
//               )}
//             </Text>
  
//           </View>
  
//         </SafeAreaView>
//       );
//     }
  
  
//     /*
//      * =========================================================
//      * BACKEND VALUES
//      * =========================================================
//      */
  
//     const currency =
//       paymentDetails?.currency ||
//       'USD';
  
//     const originalCleaner =
//       paymentDetails?.originalCleaner ||
//       {};
  
//     const replacementCleaner =
//       paymentDetails?.replacementCleaner ||
//       {};
  
//     const cleanerEarnings =
//       paymentDetails?.replacementCleanerEarnings ??
//       paymentDetails?.cleanerEarnings ??
//       0;
  
//     const replacementFee =
//       paymentDetails?.replacementFee ??
//       0;
  
//     const penalty =
//       paymentDetails?.penalty ??
//       0;
  
//     /*
//      * IMPORTANT:
//      *
//      * hostAdditionalCharge is the actual amount
//      * the host is expected to pay.
//      *
//      * totalDue remains as a fallback for
//      * backwards compatibility.
//      */
  
//     const totalDue =
//       paymentDetails?.hostAdditionalCharge ??
//       paymentDetails?.totalDue ??
//       0;
  
  
//     /*
//      * Stripe amount is calculated from
//      * the backend response.
//      */
  
//     const amount =
//       Number(
//         paymentDetails?.hostAdditionalCharge ??
//         paymentDetails?.totalDue ??
//         0
//       );
  
//     const penaltyReason =
//       paymentDetails?.penaltyReason ||
//       '';
  
//     const policy =
//       paymentDetails?.policy ||
//       {};
  
  
//     /*
//      * =========================================================
//      * REPLACEMENT COMPLETED
//      * =========================================================
//      *
//      * This state is only reached after the mobile app
//      * sees the backend workflow become completed.
//      */
  
//     if (replacementCompleted) {
  
//       return (
//         <SafeAreaView
//           style={styles.safeArea}
//         >
  
//           <View
//             style={
//               styles.completionContainer
//             }
//           >
  
//             <View
//               style={
//                 styles.completionIcon
//               }
//             >
  
//               <MaterialCommunityIcons
//                 name="check-circle-outline"
//                 size={72}
//                 color={COLORS.primary}
//               />
  
//             </View>
  
//             <Text
//               style={
//                 styles.completionTitle
//               }
//             >
//               Replacement Complete
//             </Text>
  
//             <Text
//               style={
//                 styles.completionText
//               }
//             >
//               {replacementCleaner?.name ||
//                 cleanerName ||
//                 'The replacement cleaner'}{' '}
//               has been assigned to your cleaning.
//             </Text>
  
//             <Text
//               style={
//                 styles.completionSubtext
//               }
//             >
//               Your payment has been confirmed and
//               the schedule has been updated.
//             </Text>
  
//             <Button
//               mode="contained"
//               onPress={() => {
//                 navigation.goBack();
//               }}
//               buttonColor={COLORS.primary}
//               textColor="#FFFFFF"
//               style={
//                 styles.completionButton
//               }
//               contentStyle={
//                 styles.paymentButtonContent
//               }
//               icon="calendar-check-outline"
//             >
//               View Schedule
//             </Button>
  
//           </View>
  
//         </SafeAreaView>
//       );
//     }
  
  
//     /*
//      * =========================================================
//      * PAYMENT PROCESSING
//      * =========================================================
//      *
//      * Stripe succeeded and we are waiting for the
//      * backend webhook to assign the replacement cleaner.
//      */
  
//     if (paymentProcessing) {
  
//       return (
//         <SafeAreaView
//           style={styles.safeArea}
//         >
  
//           <View
//             style={
//               styles.processingContainer
//             }
//           >
  
//             <View
//               style={
//                 styles.processingIcon
//               }
//             >
  
//               <MaterialCommunityIcons
//                 name="credit-card-check-outline"
//                 size={58}
//                 color={COLORS.primary}
//               />
  
//             </View>
  
//             <Text
//               style={
//                 styles.processingTitle
//               }
//             >
//               Confirming Payment
//             </Text>
  
//             <Text
//               style={
//                 styles.processingText
//               }
//             >
//               Your payment was submitted successfully.
//               We are confirming the payment and assigning
//               the replacement cleaner.
//             </Text>
  
//             <ActivityIndicator
//               size="large"
//               color={COLORS.primary}
//               style={
//                 styles.processingSpinner
//               }
//             />
  
//             <Text
//               style={
//                 styles.processingSubtext
//               }
//             >
//               Please wait while we finish updating
//               your cleaning schedule.
//             </Text>
  
//           </View>
  
//         </SafeAreaView>
//       );
//     }
  
  
//     /*
//      * =========================================================
//      * RENDER
//      * =========================================================
//      */
  
//     return (
//       <SafeAreaView
//         style={styles.safeArea}
//       >
  
//         <ScrollView
//           contentContainerStyle={
//             styles.container
//           }
//           showsVerticalScrollIndicator={
//             false
//           }
//         >
  
//           {/* ===================================================
//               HEADER
//           ==================================================== */}
  
//           <View
//             style={styles.header}
//           >
  
//             <View
//               style={styles.headerIcon}
//             >
  
//               <MaterialCommunityIcons
//                 name="account-switch-outline"
//                 size={32}
//                 color={COLORS.primary}
//               />
  
//             </View>
  
//             <Text
//               style={styles.title}
//             >
//               {tSafe(
//                 'replacement_cleaning',
//                 'Replacement Cleaning'
//               )}
//             </Text>
  
//             <Text
//               style={styles.subtitle}
//             >
//               {tSafe(
//                 'review_replacement_before_payment',
//                 'Review the replacement details and payment before confirming.'
//               )}
//             </Text>
  
//           </View>
  
  
//           {/* ===================================================
//               CLEANING DETAILS
//           ==================================================== */}
  
//           <Card
//             style={styles.card}
//           >
  
//             <Card.Content>
  
//               <Text
//                 style={styles.sectionLabel}
//               >
//                 {tSafe(
//                   'cleaning_details',
//                   'CLEANING DETAILS'
//                 )}
//               </Text>
  
//               <Text
//                 style={styles.propertyName}
//               >
//                 {propertyName ||
//                   paymentDetails?.propertyName ||
//                   tSafe(
//                     'property',
//                     'Property'
//                   )}
//               </Text>
  
//               <View
//                 style={styles.detailRow}
//               >
  
//                 <Text
//                   style={styles.detailLabel}
//                 >
//                   {tSafe(
//                     'date',
//                     'Date'
//                   )}
//                 </Text>
  
//                 <Text
//                   style={styles.detailValue}
//                 >
//                   {formatDate(
//                     newCleaningDate ||
//                       paymentDetails?.cleaningDate
//                   )}
//                 </Text>
  
//               </View>
  
//               <View
//                 style={styles.detailRow}
//               >
  
//                 <Text
//                   style={styles.detailLabel}
//                 >
//                   {tSafe(
//                     'time',
//                     'Time'
//                   )}
//                 </Text>
  
//                 <Text
//                   style={styles.detailValue}
//                 >
//                   {cleaningTime ||
//                     paymentDetails?.cleaningTime ||
//                     tSafe(
//                       'not_available',
//                       'Not available'
//                     )}
//                 </Text>
  
//               </View>
  
//               {group ? (
  
//                 <View
//                   style={styles.detailRow}
//                 >
  
//                   <Text
//                     style={styles.detailLabel}
//                   >
//                     {tSafe(
//                       'cleaning_team',
//                       'Cleaning Team'
//                     )}
//                   </Text>
  
//                   <Text
//                     style={styles.detailValue}
//                   >
//                     {formatGroup(
//                       group
//                     )}
//                   </Text>
  
//                 </View>
  
//               ) : null}
  
//             </Card.Content>
  
//           </Card>
  
  
//           {/* ===================================================
//               CLEANER CHANGE
//           ==================================================== */}
  
//           <Card
//             style={styles.card}
//           >
  
//             <Card.Content>
  
//               <Text
//                 style={styles.sectionLabel}
//               >
//                 {tSafe(
//                   'cleaner_change',
//                   'CLEANER CHANGE'
//                 )}
//               </Text>
  
  
//               {/* Original Cleaner */}
  
//               <View
//                 style={
//                   styles.cleanerRow
//                 }
//               >
  
//                 <View
//                   style={
//                     styles.cleanerIconOld
//                   }
//                 >
  
//                   <MaterialCommunityIcons
//                     name="account-remove-outline"
//                     size={23}
//                     color="#DC2626"
//                   />
  
//                 </View>
  
//                 <View
//                   style={
//                     styles.cleanerInfo
//                   }
//                 >
  
//                   <Text
//                     style={
//                       styles.cleanerLabel
//                     }
//                   >
//                     {tSafe(
//                       'original_cleaner',
//                       'Original Cleaner'
//                     )}
//                   </Text>
  
//                   <Text
//                     style={
//                       styles.cleanerName
//                     }
//                   >
//                     {originalCleaner?.name ||
//                       replacedCleanerName ||
//                       tSafe(
//                         'original_cleaner',
//                         'Original Cleaner'
//                       )}
//                   </Text>
  
//                 </View>
  
//               </View>
  
  
//               <View
//                 style={
//                   styles.changeArrow
//                 }
//               >
  
//                 <MaterialCommunityIcons
//                   name="arrow-down"
//                   size={22}
//                   color="#9CA3AF"
//                 />
  
//               </View>
  
  
//               {/* Replacement Cleaner */}
  
//               <View
//                 style={
//                   styles.cleanerRow
//                 }
//               >
  
//                 <View
//                   style={
//                     styles.cleanerIconNew
//                   }
//                 >
  
//                   <MaterialCommunityIcons
//                     name="account-check-outline"
//                     size={23}
//                     color={COLORS.primary}
//                   />
  
//                 </View>
  
//                 <View
//                   style={
//                     styles.cleanerInfo
//                   }
//                 >
  
//                   <Text
//                     style={
//                       styles.cleanerLabel
//                     }
//                   >
//                     {tSafe(
//                       'replacement_cleaner',
//                       'Replacement Cleaner'
//                     )}
//                   </Text>
  
//                   <Text
//                     style={
//                       styles.cleanerName
//                     }
//                   >
//                     {replacementCleaner?.name ||
//                       cleanerName ||
//                       tSafe(
//                         'selected_cleaner',
//                         'Selected Cleaner'
//                       )}
//                   </Text>
  
//                 </View>
  
//               </View>
  
//             </Card.Content>
  
//           </Card>
  
  
//           {/* ===================================================
//               PAYMENT BREAKDOWN
//           ==================================================== */}
  
//           <Card
//             style={styles.card}
//           >
  
//             <Card.Content>
  
//               <View
//                 style={
//                   styles.sectionHeaderRow
//                 }
//               >
  
//                 <Text
//                   style={
//                     styles.sectionLabelNoMargin
//                   }
//                 >
//                   {tSafe(
//                     'payment_summary',
//                     'PAYMENT SUMMARY'
//                   )}
//                 </Text>
  
//                 <MaterialCommunityIcons
//                   name="receipt-text-outline"
//                   size={21}
//                   color={COLORS.primary}
//                 />
  
//               </View>
  
  
//               <Divider
//                 style={styles.divider}
//               />
  
  
//               {/* Cleaner Earnings */}
  
//               <View
//                 style={styles.amountRow}
//               >
  
//                 <View
//                   style={
//                     styles.amountDescription
//                   }
//                 >
  
//                   <Text
//                     style={
//                       styles.amountLabel
//                     }
//                   >
//                     {tSafe(
//                       'replacement_cleaner_earnings',
//                       'Replacement Cleaner Earnings'
//                     )}
//                   </Text>
  
//                   <Text
//                     style={
//                       styles.amountSubtext
//                     }
//                   >
//                     {tSafe(
//                       'replacement_cleaner_earnings_description',
//                       'Amount allocated to the replacement cleaner.'
//                     )}
//                   </Text>
  
//                 </View>
  
//                 <Text
//                   style={
//                     styles.amountValue
//                   }
//                 >
//                   {formatMoney(
//                     cleanerEarnings,
//                     currency
//                   )}
//                 </Text>
  
//               </View>
  
  
//               {/* Replacement Fee */}
  
//               {Number(
//                 replacementFee
//               ) > 0 && (
  
//                 <View
//                   style={styles.amountRow}
//                 >
  
//                   <View
//                     style={
//                       styles.amountDescription
//                     }
//                   >
  
//                     <Text
//                       style={
//                         styles.amountLabel
//                       }
//                     >
//                       {tSafe(
//                         'replacement_fee',
//                         'Replacement Fee'
//                       )}
//                     </Text>
  
//                     <Text
//                       style={
//                         styles.amountSubtext
//                       }
//                     >
//                       {tSafe(
//                         'replacement_fee_description',
//                         'Fee associated with arranging a replacement cleaner.'
//                       )}
//                     </Text>
  
//                   </View>
  
//                   <Text
//                     style={
//                       styles.amountValue
//                     }
//                   >
//                     {formatMoney(
//                       replacementFee,
//                       currency
//                     )}
//                   </Text>
  
//                 </View>
  
//               )}
  
  
//               {/* Penalty */}
  
//               {Number(
//                 penalty
//               ) > 0 && (
  
//                 <View
//                   style={styles.penaltyBox}
//                 >
  
//                   <View
//                     style={
//                       styles.penaltyHeader
//                     }
//                   >
  
//                     <MaterialCommunityIcons
//                       name="alert-circle-outline"
//                       size={21}
//                       color="#B45309"
//                     />
  
//                     <Text
//                       style={
//                         styles.penaltyTitle
//                       }
//                     >
//                       {tSafe(
//                         'penalty',
//                         'Penalty'
//                       )}
//                     </Text>
  
//                     <Text
//                       style={
//                         styles.penaltyAmount
//                       }
//                     >
//                       {formatMoney(
//                         penalty,
//                         currency
//                       )}
//                     </Text>
  
//                   </View>
  
//                   {penaltyReason ? (
  
//                     <Text
//                       style={
//                         styles.penaltyReason
//                       }
//                     >
//                       {penaltyReason}
//                     </Text>
  
//                   ) : null}
  
//                 </View>
  
//               )}
  
  
//               <Divider
//                 style={
//                   styles.totalDivider
//                 }
//               />
  
  
//               {/* Total */}
  
//               <View
//                 style={styles.totalRow}
//               >
  
//                 <Text
//                   style={styles.totalLabel}
//                 >
//                   {tSafe(
//                     'total_due',
//                     'Total Due'
//                   )}
//                 </Text>
  
//                 <Text
//                   style={styles.totalValue}
//                 >
//                   {formatMoney(
//                     totalDue,
//                     currency
//                   )}
//                 </Text>
  
//               </View>
  
//             </Card.Content>
  
//           </Card>
  
  
//           {/* ===================================================
//               POLICY
//           ==================================================== */}
  
//           <Card
//             style={styles.card}
//           >
  
//             <Card.Content>
  
//               <View
//                 style={
//                   styles.sectionHeaderRow
//                 }
//               >
  
//                 <Text
//                   style={
//                     styles.sectionLabelNoMargin
//                   }
//                 >
//                   {tSafe(
//                     'replacement_policy',
//                     'REPLACEMENT POLICY'
//                   )}
//                 </Text>
  
//                 <MaterialCommunityIcons
//                   name="file-document-outline"
//                   size={21}
//                   color={COLORS.primary}
//                 />
  
//               </View>
  
  
//               <Divider
//                 style={styles.divider}
//               />
  
  
//               <Text
//                 style={
//                   styles.policyText
//                 }
//               >
//                 {policy?.summary ||
//                   tSafe(
//                     'replacement_policy_default',
//                     'By confirming this replacement, you acknowledge that the selected cleaner will be assigned to the cleaning and that applicable replacement fees or penalties may apply according to Freshsweeper policy.'
//                   )}
//               </Text>
  
  
//               <TouchableOpacity
//                 style={
//                   styles.policyButton
//                 }
//                 onPress={() => {
  
//                   Alert.alert(
//                     tSafe(
//                       'replacement_policy',
//                       'Replacement Policy'
//                     ),
  
//                     policy?.details ||
//                       tSafe(
//                         'replacement_policy_default',
//                         'Replacement policies and applicable fees are determined by Freshsweeper based on the circumstances of the replacement.'
//                       )
//                   );
  
//                 }}
//               >
  
//                 <Text
//                   style={
//                     styles.policyButtonText
//                   }
//                 >
//                   {tSafe(
//                     'view_full_policy',
//                     'View Full Policy'
//                   )}
//                 </Text>
  
//                 <MaterialCommunityIcons
//                   name="chevron-right"
//                   size={21}
//                   color={COLORS.primary}
//                 />
  
//               </TouchableOpacity>
  
//             </Card.Content>
  
//           </Card>
  
  
//           {/* ===================================================
//               POLICY CHECKBOX
//           ==================================================== */}
  
//           <TouchableOpacity
//             style={
//               styles.checkboxContainer
//             }
//             activeOpacity={0.8}
//             onPress={() =>
//               setAcceptedPolicy(
//                 !acceptedPolicy
//               )
//             }
//           >
  
//             <Checkbox
//               status={
//                 acceptedPolicy
//                   ? 'checked'
//                   : 'unchecked'
//               }
//               onPress={() =>
//                 setAcceptedPolicy(
//                   !acceptedPolicy
//                 )
//               }
//               color={COLORS.primary}
//             />
  
//             <Text
//               style={
//                 styles.checkboxText
//               }
//             >
//               {tSafe(
//                 'replacement_policy_agreement',
//                 'I have reviewed and agree to the replacement cleaning policy, including any applicable fees or penalties.'
//               )}
//             </Text>
  
//           </TouchableOpacity>
  
  
//           {/* ===================================================
//               PAYMENT BUTTON
//           ==================================================== */}
  
//           {clientSecret ? (
  
//             <StripeGroupPaymentButton
//               clientSecret={
//                 clientSecret
//               }
  
//               totalAmount={
//                 amount
//               }
  
//               hostName={
//                 currentUser?.firstname
//                   ? `${currentUser.firstname} ${
//                       currentUser.lastname || ''
//                     }`.trim()
//                   : ''
//               }
  
//               hostEmail={
//                 currentUser?.email
//               }
  
//               scheduleId={
//                 scheduleId
//               }
  
//               hostId={
//                 currentUser?._id
//               }
  
//               onSuccess={
//                 (paymentResult) => {
  
//                   console.log(
//                     '✅ Stripe PaymentSheet completed:',
//                     paymentResult
//                   );
  
//                   /*
//                    * Stripe PaymentSheet completion does
//                    * NOT mean the replacement workflow is
//                    * complete.
//                    *
//                    * Wait for the backend webhook.
//                    */
  
//                   waitForReplacementCompletion();
//                 }
//               }
  
//               onError={
//                 (error) => {
  
//                   console.error(
//                     '❌ Stripe payment failed:',
//                     error
//                   );
  
//                   Alert.alert(
//                     'Payment Failed',
  
//                     error?.message ||
//                       'The payment could not be completed.'
//                   );
  
//                 }
//               }
//             />
  
//           ) : (
  
//             <Button
//               mode="contained"
//               onPress={
//                 handlePayment
//               }
//               disabled={
//                 paymentLoading ||
//                 !acceptedPolicy
//               }
//               loading={
//                 paymentLoading
//               }
//               buttonColor={
//                 COLORS.primary
//               }
//               textColor="#FFFFFF"
//               style={
//                 styles.paymentButton
//               }
//               contentStyle={
//                 styles.paymentButtonContent
//               }
//               icon="credit-card-outline"
//             >
//               {tSafe(
//                 'pay_and_confirm',
//                 'Pay & Confirm Replacement'
//               )}
//             </Button>
  
//           )}
  
  
//           {/* ===================================================
//               PAYMENT SECURITY
//           ==================================================== */}
  
//           <View
//             style={
//               styles.securePayment
//             }
//           >
  
//             <MaterialCommunityIcons
//               name="lock-outline"
//               size={17}
//               color="#6B7280"
//             />
  
//             <Text
//               style={
//                 styles.securePaymentText
//               }
//             >
//               {tSafe(
//                 'secure_payment',
//                 'Your payment is securely processed through Stripe.'
//               )}
//             </Text>
  
//           </View>
  
  
//           <View
//             style={
//               styles.bottomSpace
//             }
//           />
  
//         </ScrollView>
  
//       </SafeAreaView>
//     );
//   };
  
  
//   export default ReplacementPayment;
  
  
//   /*
//    * ===========================================================
//    * STYLES
//    * ===========================================================
//    */
  
//   const styles = StyleSheet.create({
  
//     safeArea: {
//       flex: 1,
//       backgroundColor: '#F8FAFC',
//     },
  
//     container: {
//       padding: 20,
//       paddingBottom: 40,
//     },
  
  
//     /*
//      * Header
//      */
  
//     header: {
//       alignItems: 'center',
//       marginBottom: 22,
//     },
  
//     headerIcon: {
//       width: 68,
//       height: 68,
//       borderRadius: 34,
//       backgroundColor: '#EEF2FF',
//       alignItems: 'center',
//       justifyContent: 'center',
//       marginBottom: 12,
//     },
  
//     title: {
//       fontSize: 24,
//       fontWeight: '800',
//       color: '#222',
//       textAlign: 'center',
//       marginBottom: 7,
//     },
  
//     subtitle: {
//       fontSize: 14,
//       lineHeight: 21,
//       color: '#6B7280',
//       textAlign: 'center',
//       maxWidth: 350,
//     },
  
  
//     /*
//      * Cards
//      */
  
//     card: {
//       marginBottom: 16,
//       borderRadius: 16,
//       backgroundColor: '#FFFFFF',
//       elevation: 1,
//     },
  
//     sectionLabel: {
//       fontSize: 11,
//       fontWeight: '800',
//       letterSpacing: 1,
//       color: '#8A8A8A',
//       marginBottom: 9,
//     },
  
//     sectionLabelNoMargin: {
//       fontSize: 11,
//       fontWeight: '800',
//       letterSpacing: 1,
//       color: '#8A8A8A',
//     },
  
//     sectionHeaderRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//     },
  
//     propertyName: {
//       fontSize: 19,
//       fontWeight: '700',
//       color: '#222',
//       marginBottom: 12,
//     },
  
//     detailRow: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       paddingVertical: 7,
//     },
  
//     detailLabel: {
//       fontSize: 14,
//       color: '#777',
//     },
  
//     detailValue: {
//       fontSize: 14,
//       fontWeight: '600',
//       color: '#333',
//       maxWidth: '65%',
//       textAlign: 'right',
//     },
  
//     divider: {
//       marginVertical: 14,
//     },
  
  
//     /*
//      * Cleaner
//      */
  
//     cleanerRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },
  
//     cleanerIconOld: {
//       width: 46,
//       height: 46,
//       borderRadius: 13,
//       backgroundColor: '#FEF2F2',
//       alignItems: 'center',
//       justifyContent: 'center',
//       marginRight: 12,
//     },
  
//     cleanerIconNew: {
//       width: 46,
//       height: 46,
//       borderRadius: 13,
//       backgroundColor: '#EEF2FF',
//       alignItems: 'center',
//       justifyContent: 'center',
//       marginRight: 12,
//     },
  
//     cleanerInfo: {
//       flex: 1,
//     },
  
//     cleanerLabel: {
//       fontSize: 11,
//       fontWeight: '700',
//       color: '#8A8A8A',
//       textTransform: 'uppercase',
//       letterSpacing: 0.5,
//     },
  
//     cleanerName: {
//       marginTop: 3,
//       fontSize: 16,
//       fontWeight: '700',
//       color: '#222',
//     },
  
//     changeArrow: {
//       alignItems: 'center',
//       paddingVertical: 7,
//     },
  
  
//     /*
//      * Amounts
//      */
  
//     amountRow: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       paddingVertical: 10,
//     },
  
//     amountDescription: {
//       flex: 1,
//       paddingRight: 15,
//     },
  
//     amountLabel: {
//       fontSize: 14,
//       fontWeight: '600',
//       color: '#333',
//     },
  
//     amountSubtext: {
//       marginTop: 3,
//       fontSize: 11,
//       lineHeight: 16,
//       color: '#888',
//     },
  
//     amountValue: {
//       fontSize: 15,
//       fontWeight: '700',
//       color: '#333',
//     },
  
  
//     /*
//      * Penalty
//      */
  
//     penaltyBox: {
//       marginTop: 8,
//       padding: 12,
//       borderRadius: 12,
//       backgroundColor: '#FFFBEB',
//       borderWidth: 1,
//       borderColor: '#FDE68A',
//     },
  
//     penaltyHeader: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },
  
//     penaltyTitle: {
//       flex: 1,
//       marginLeft: 7,
//       fontSize: 14,
//       fontWeight: '700',
//       color: '#92400E',
//     },
  
//     penaltyAmount: {
//       fontSize: 15,
//       fontWeight: '800',
//       color: '#92400E',
//     },
  
//     penaltyReason: {
//       marginTop: 7,
//       fontSize: 12,
//       lineHeight: 18,
//       color: '#78350F',
//     },
  
//     totalDivider: {
//       marginTop: 12,
//       marginBottom: 14,
//     },
  
//     totalRow: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//     },
  
//     totalLabel: {
//       fontSize: 18,
//       fontWeight: '800',
//       color: '#222',
//     },
  
//     totalValue: {
//       fontSize: 21,
//       fontWeight: '800',
//       color: COLORS.primary,
//     },
  
  
//     /*
//      * Policy
//      */
  
//     policyText: {
//       fontSize: 13,
//       lineHeight: 20,
//       color: '#555',
//     },
  
//     policyButton: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       marginTop: 12,
//       paddingVertical: 10,
//     },
  
//     policyButtonText: {
//       fontSize: 14,
//       fontWeight: '700',
//       color: COLORS.primary,
//     },
  
  
//     /*
//      * Checkbox
//      */
  
//     checkboxContainer: {
//       flexDirection: 'row',
//       alignItems: 'flex-start',
//       marginBottom: 18,
//       paddingRight: 5,
//     },
  
//     checkboxText: {
//       flex: 1,
//       marginTop: 7,
//       fontSize: 13,
//       lineHeight: 19,
//       color: '#555',
//     },
  
  
//     /*
//      * Payment
//      */
  
//     paymentButton: {
//       borderRadius: 11,
//     },
  
//     paymentButtonContent: {
//       height: 54,
//     },
  
  
//     /*
//      * Payment Processing
//      */
  
//     processingContainer: {
//       flex: 1,
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: 30,
//     },
  
//     processingIcon: {
//       width: 100,
//       height: 100,
//       borderRadius: 50,
//       backgroundColor: '#EEF2FF',
//       alignItems: 'center',
//       justifyContent: 'center',
//       marginBottom: 24,
//     },
  
//     processingTitle: {
//       fontSize: 25,
//       fontWeight: '800',
//       color: '#222',
//       textAlign: 'center',
//       marginBottom: 12,
//     },
  
//     processingText: {
//       fontSize: 15,
//       lineHeight: 23,
//       color: '#4B5563',
//       textAlign: 'center',
//       maxWidth: 360,
//     },
  
//     processingSpinner: {
//       marginTop: 28,
//     },
  
//     processingSubtext: {
//       marginTop: 14,
//       fontSize: 13,
//       lineHeight: 20,
//       color: '#6B7280',
//       textAlign: 'center',
//       maxWidth: 340,
//     },
  
  
//     /*
//      * Replacement Complete
//      */
  
//     completionContainer: {
//       flex: 1,
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: 30,
//     },
  
//     completionIcon: {
//       width: 110,
//       height: 110,
//       borderRadius: 55,
//       backgroundColor: '#EEF2FF',
//       alignItems: 'center',
//       justifyContent: 'center',
//       marginBottom: 24,
//     },
  
//     completionTitle: {
//       fontSize: 26,
//       fontWeight: '800',
//       color: '#222',
//       textAlign: 'center',
//       marginBottom: 12,
//     },
  
//     completionText: {
//       fontSize: 16,
//       fontWeight: '600',
//       color: '#333',
//       textAlign: 'center',
//       lineHeight: 24,
//     },
  
//     completionSubtext: {
//       marginTop: 10,
//       fontSize: 14,
//       color: '#6B7280',
//       textAlign: 'center',
//       lineHeight: 21,
//     },
  
//     completionButton: {
//       marginTop: 28,
//       width: '100%',
//       borderRadius: 11,
//     },
  
  
//     /*
//      * Secure Payment
//      */
  
//     securePayment: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//       marginTop: 13,
//     },
  
//     securePaymentText: {
//       marginLeft: 5,
//       fontSize: 11,
//       color: '#6B7280',
//     },
  
  
//     /*
//      * Loading
//      */
  
//     loadingContainer: {
//       flex: 1,
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: 30,
//     },
  
//     loadingText: {
//       marginTop: 12,
//       fontSize: 14,
//       color: '#6B7280',
//     },
  
//     bottomSpace: {
//       height: 25,
//     },
  
//   });






