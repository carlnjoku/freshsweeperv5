import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import StripeGroupPaymentButton from '../../../components/shared/StripeGroupPaymentButton';
import userService from '../../../services/connection/userService';
import COLORS from '../../../constants/colors';
import { AuthContext } from '../../../context/AuthContext';
import { ScrollView } from 'react-native-gesture-handler';
import PaymentDetails from './PaymentDetails';
import ROUTES from '../../../constants/routes';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import onAddFriend from '../../../utils/createNewChatFriend';
import { tSafe } from '../../../utils/tSafe';

const PaymentGroupCheckout = ({ route, navigation }) => {
  const { currentUser, currentUserId, fbaseUser } =
    useContext(AuthContext);

  const {
    requestId,
    cleaning_fee,
    scheduleId,
    schedule,
    selected_cleaners,
    cleanerIds,
    cleanersWithFee,
    cleaner_stripe_account_id,
    hostSelectionFlow,
  } = route.params || {};

  /*
   * ---------------------------------------------------------
   * SCHEDULE DATA
   * ---------------------------------------------------------
   *
   * The schedule being passed from HostCleanerRecommendations
   * can have this structure:
   *
   * schedule = {
   *   schedule: {
   *     cleaning_date: "...",
   *     cleaning_time: "...",
   *     cleaning_end_time: "...",
   *     total_cleaning_fee: ...
   *   },
   *   assignedTo: [...]
   * }
   *
   * So we first use schedule.schedule.
   */
  const scheduleData = schedule?.schedule || schedule || {};

  /*
   * ---------------------------------------------------------
   * CLEANING DATE / TIME
   * ---------------------------------------------------------
   */

  const cleaning_date =
    scheduleData?.cleaning_date || '';

  const cleaning_time =
    scheduleData?.cleaning_time || '';

  const cleaning_end_time =
    scheduleData?.cleaning_end_time || '';

  /*
   * Parse cleaning start time.
   *
   * Supports:
   * HH:mm:ss
   * HH:mm
   */
  const startMoment = moment(
    cleaning_time,
    ['HH:mm:ss', 'HH:mm'],
    true
  );

  /*
   * Parse cleaning end time.
   */
  const endMoment = moment(
    cleaning_end_time,
    ['HH:mm:ss', 'HH:mm'],
    true
  );

  /*
   * Parse cleaning date.
   */
  const dateMoment = moment(
    cleaning_date,
    'YYYY-MM-DD',
    true
  );

  /*
   * Final values sent to backend / Stripe metadata.
   */
  const start_time = startMoment.isValid()
    ? startMoment.format('HH:mm')
    : '';

  const end_time = endMoment.isValid()
    ? endMoment
        .clone()
        .add(2, 'hours')
        .format('HH:mm')
    : '';

  const dayName = dateMoment.isValid()
    ? dateMoment.format('dddd')
    : '';

  /*
   * ---------------------------------------------------------
   * SELECTED CLEANER IDS
   * ---------------------------------------------------------
   *
   * This was missing from the previous version and was causing:
   *
   * ReferenceError:
   * Property 'selectedCleanerIds' doesn't exist
   *
   * Support both _id and cleanerId because the selected cleaner
   * objects can contain either/both.
   */
  const selectedCleanerIds = (
    selected_cleaners || []
  ).map(
    (cleaner) =>
      cleaner?._id ||
      cleaner?.cleanerId
  );

  /*
   * ---------------------------------------------------------
   * DEBUG / CHECKOUT PARAMS
   * ---------------------------------------------------------
   */
  console.log('💳 GROUP CHECKOUT PARAMS:', {
    scheduleId,
    cleaning_date,
    cleaning_time,
    cleaning_end_time,
    start_time,
    end_time,
    dayName,
    cleaning_fee,
    cleanersWithFee,
    hostSelectionFlow,
    scheduleTotalFee:
      scheduleData?.total_cleaning_fee,
  });

  /*
   * ---------------------------------------------------------
   * CALCULATE CLEANING FEES
   * ---------------------------------------------------------
   */

  const scheduleTotalFee =
    Number(scheduleData?.total_cleaning_fee) || 0;

  const cleanerFeeTotal = (
    Array.isArray(cleanersWithFee)
      ? cleanersWithFee
      : []
  ).reduce(
    (sum, cleaner) =>
      sum + (Number(cleaner?.fee) || 0),
    0
  );

  /*
   * Host-selection flow uses the schedule's total
   * cleaning fee.
   *
   * Normal flow uses individual cleaner fees.
   */
  const totalCleanersFee = hostSelectionFlow
    ? scheduleTotalFee
    : cleanerFeeTotal;

  const serviceFee = totalCleanersFee * 0.1;

  const totalAmount =
    totalCleanersFee + serviceFee;

  /*
   * ---------------------------------------------------------
   * STATE
   * ---------------------------------------------------------
   */

  const [clientSecret, setClientSecret] =
    useState(null);

  const [paymentIntentId, setPaymentIntentId] =
    useState(null);

  const [savedCards, setSavedCards] =
    useState([]);

  const [paymentStatus, setPaymentStatus] =
    useState(null);

  /*
   * ---------------------------------------------------------
   * CREATE STRIPE PAYMENT INTENT
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const fetchClientSecret = async () => {
      /*
       * Don't create a PaymentIntent if there is
       * no schedule or no amount.
       */
      if (
        !scheduleId ||
        totalAmount <= 0
      ) {
        console.log(
          '💳 PAYMENT INTENT SKIPPED:',
          {
            scheduleId,
            totalCleanersFee,
            serviceFee,
            totalAmount,
          }
        );

        return;
      }

      try {
        /*
         * Build the metadata that will eventually
         * be available to the Stripe webhook.
         */
        const data = {
          amount: totalAmount,

          customerId:
            currentUser
              ?.stripe_customer
              ?.stripe_customer_id,

          metadata: {
            scheduleId,
            requestId,

            cleaning_date,

            start_time,

            end_time,

            dayName,

            cleaners: JSON.stringify(
              (
                cleanersWithFee || []
              ).map((cleaner) => ({
                cleanerId:
                  cleaner?.cleanerId ||
                  cleaner?._id,

                group:
                  cleaner?.group,

                fee:
                  cleaner?.fee,
              }))
            ),

            hostSelectionFlow:
              Boolean(hostSelectionFlow),
          },

          platformFeeAmount:
            serviceFee,

          receiptEmail:
            currentUser?.email,

          currency: 'USD',
        };

        /*
         * Create PaymentIntent on backend.
         */
        const response =
          await userService
            .fetchGroupPaymentIntentClientSecret(
              data
            );

        console.log(
          '💳 GROUP PAYMENT INTENT RESPONSE:',
          response?.data
        );

        const {
          clientSecret:
            createdClientSecret,

          paymentIntentId:
            createdPaymentIntentId,

          status,
        } = response?.data || {};

        if (!createdClientSecret) {
          console.error(
            '❌ GROUP PAYMENT INTENT RETURNED NO CLIENT SECRET:',
            response?.data
          );

          return;
        }

        setClientSecret(
          createdClientSecret
        );

        setPaymentIntentId(
          createdPaymentIntentId
        );

        setPaymentStatus(status);

      } catch (error) {
        console.error(
          '❌ GROUP PAYMENT INTENT ERROR:',
          error?.response?.data ||
            error
        );

        Alert.alert(
          'Payment Error',
          error?.response?.data?.detail ||
            error?.response?.data?.message ||
            'Unable to initialize payment.'
        );
      }
    };

    fetchClientSecret();

  }, [
    scheduleId,
    totalAmount,
    serviceFee,
    hostSelectionFlow,
  ]);

  /*
   * ---------------------------------------------------------
   * PAYMENT SUCCESS
   * ---------------------------------------------------------
   */

  const handlePaymentSuccess = async (
    result
  ) => {
    /*
     * Recalculate the amount so the value used
     * after payment matches the checkout amount.
     */

    const cleanerFeeTotal = (
      Array.isArray(cleanersWithFee)
        ? cleanersWithFee
        : []
    ).reduce(
      (sum, cleaner) =>
        sum +
        (Number(cleaner?.fee) || 0),
      0
    );

    const scheduleFeeFallback =
      Number(
        scheduleData?.total_cleaning_fee
      ) ||
      Number(cleaning_fee) ||
      0;

    /*
     * Keep host-selection flow consistent
     * with the PaymentIntent calculation.
     */
    const finalCleanersFee =
      hostSelectionFlow
        ? scheduleFeeFallback
        : cleanerFeeTotal;

    const subtotalCents =
      Math.round(
        finalCleanersFee * 100
      );

    const serviceFeeCents =
      Math.round(
        subtotalCents * 0.10
      );

    const totalAmountCents =
      subtotalCents +
      serviceFeeCents;

    const finalServiceFee =
      serviceFeeCents / 100;

    const finalTotalAmount =
      totalAmountCents / 100;

    setPaymentStatus(
      result?.status
    );

    /*
     * Payment successful notification.
     */
    Toast.show({
      type: 'success',

      text1: tSafe(
        'payment_successful_title',
        'Payment Successful 💸'
      ),

      text2: tSafe(
        'payment_successful_message',
        'Payment of ${amount} (including service fee) was successful!',
        {
          amount:
            `$${finalTotalAmount.toFixed(2)}`,
        }
      ),

      position: 'bottom',
    });

    /*
     * -------------------------------------------------------
     * LEGACY PAYMENT FLOW
     * -------------------------------------------------------
     *
     * Only execute this when this is NOT the
     * host-selection flow.
     */
    if (!hostSelectionFlow) {
      try {
        const hostId =
          currentUserId;

        /*
         * Create chatrooms for cleaners.
         */
        const chatResults =
          await Promise.allSettled(
            (
              cleanersWithFee || []
            ).map(
              ({
                cleanerId,
                fee,
              }) =>
                onAddFriend(
                  hostId,
                  cleanerId,
                  currentUser,
                  schedule,
                  scheduleId,
                  fee
                )
            )
          );

        chatResults.forEach(
          (chatResult, index) => {
            const cleanerId =
              cleanersWithFee?.[
                index
              ]?.cleanerId;

            if (
              chatResult.status ===
              'fulfilled'
            ) {
              console.log(
                `✅ Chatroom created for cleaner ${cleanerId}`
              );
            } else {
              console.error(
                `❌ Failed to create chatroom for cleaner ${cleanerId}:`,
                chatResult.reason
              );
            }
          }
        );

        /*
         * Notify backend that payment succeeded.
         */
        await callBackendPaymentSuccess(
          finalTotalAmount
        );

        console.log(
          '✅ Legacy payment success flow completed.'
        );

      } catch (error) {
        console.error(
          '❌ Error during legacy payment success flow:',
          error
        );
      }

    } else {
      /*
       * Host-selection flow:
       *
       * Stripe webhook is authoritative for
       * assigning the selected cleaners.
       */
      console.log(
        '✅ Host selection flow: Stripe webhook remains authoritative for assignment.'
      );
    }

    /*
     * Redirect host to dashboard.
     */
    navigation.navigate(
      ROUTES.host_home_tab
    );
  };

  /*
   * ---------------------------------------------------------
   * BACKEND PAYMENT SUCCESS
   * ---------------------------------------------------------
   */

  const callBackendPaymentSuccess =
    async (amount) => {
      try {
        const payload = {
          scheduleId,

          hostId:
            currentUserId,

          cleanerIds:
            selectedCleanerIds,

          totalAmount:
            amount,

          hostName:
            `${currentUser?.firstname || ''} ${
              currentUser?.lastname || ''
            }`.trim(),

          hostEmail:
            currentUser?.email,

          /*
           * Individual cleaner fees.
           */
          cleanersWithFee:
            cleanersWithFee || [],

          paymentIntentId,
        };

        const response =
          await userService
            .sendChatMessagePushNotification(
              payload
            );

        console.log(
          'Payment success response ----------YT',
          response
        );

        if (
          response?.status === 200
        ) {
          console.log(
            '✅ Payment success notifications queued:',
            response?.data?.job_id
          );
        } else {
          console.error(
            '❌ Backend notification failed:',
            response?.data?.error
          );
        }

      } catch (error) {
        console.error(
          '❌ Error calling payment success endpoint:',
          error
        );
      }
    };

  /*
   * ---------------------------------------------------------
   * PAYMENT ERROR
   * ---------------------------------------------------------
   */

  const handlePaymentError =
    (error) => {
      setPaymentStatus(
        error?.status
      );

      Toast.show({
        type: 'error',

        text1: tSafe(
          'payment_failed_title',
          'Payment Failed'
        ),

        text2:
          error?.message ||
          tSafe(
            'unexpected_error',
            'An unexpected error occurred.'
          ),

        position: 'bottom',
      });
    };

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
      >

        <View
          style={{
            justifyContent:
              'center',
            alignItems:
              'center',
            marginTop: 40,
            marginBottom: 10,
          }}
        />

        <PaymentDetails
          cleaningServiceFee={
            serviceFee
          }
          cleanersWithFee={
            cleanersWithFee
          }
        />

        {clientSecret &&
        totalCleanersFee > 0 ? (

          <StripeGroupPaymentButton
            clientSecret={
              clientSecret
            }

            totalAmount={
              totalAmount
            }

            onSuccess={
              handlePaymentSuccess
            }

            onError={
              handlePaymentError
            }

            fbaseUser={
              fbaseUser
            }

            scheduleId={
              scheduleId
            }

            schedule={
              schedule
            }

            cleanersId={
              selectedCleanerIds
            }

            hostId={
              currentUserId
            }

            hostName={
              `${currentUser?.firstname || ''} ${
                currentUser?.lastname || ''
              }`.trim()
            }

            hostEMail={
              currentUser?.email
            }
          />

        ) : (

          <Text
            style={{
              textAlign:
                'center',
              fontSize: 12,
            }}
          >
            {tSafe(
              'loading_payment_info',
              'Loading payment information...'
            )}
          </Text>

        )}

      </ScrollView>
    </View>
  );
};

/*
 * ---------------------------------------------------------
 * STYLES
 * ---------------------------------------------------------
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent:
      'center',
    alignItems:
      'stretch',
  },

  icon: {
    marginBottom: 20,
    textAlign:
      'center',
  },

  header: {
    fontSize: 20,
    fontWeight:
      'bold',
    textAlign:
      'center',
    marginBottom: 20,
  },

  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor:
      COLORS.primary,
    justifyContent:
      'center',
    alignItems:
      'center',
  },
});

export default PaymentGroupCheckout;
