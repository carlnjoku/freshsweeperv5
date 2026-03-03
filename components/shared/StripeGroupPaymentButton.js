import React, { useState, useEffect, useContext } from 'react';
import { View, Alert, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import ROUTES from '../../constants/routes';
import userService from '../../services/connection/userService';
import { sendPushNotifications } from '../../utils/sendPushNotification';
import onAddFriend from '../../utils/createNewChatFriend';


const StripeGroupPaymentButton = ({ 
  clientSecret, 
  totalAmount, 
  onSuccess, 
  onError, 
  cleanersId,
  schedule, 
  scheduleId,
  hostId,
  hostName,
  hostEmail,
  fbaseUser
}) => {
  
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [host_expo_token, setHostPushToken] = useState([]);
  const [cleaner_expo_tokens, setCleanerPushTokens] = useState([]);


 useEffect(() => {
  if (Array.isArray(cleanersId) && cleanersId.length > 0) {
    fetchCleanerPushTokens(cleanersId);
  }
  if (hostId) {
    fetchHostPushTokens(hostId);
  }
}, [cleanersId, hostId]);


  const fetchCleanerPushTokens = async (cleanerIds) => {
    try {
      let allTokens = [];
  
      for (const id of cleanerIds) {
        const response = await userService.getUserPushTokens(id);
        const tokens = response.data.tokens || [];
        allTokens = [...allTokens, ...tokens];
      }
  
      setCleanerPushTokens(allTokens);
    } catch (error) {
      console.error("Error fetching cleaner push tokens:", error);
    }
  };

  // const fetchCleanerPushTokens = async (id) => {
  //   try {
  //     const response = await userService.getUserPushTokens(id);
  //     setCleanerPushToken(response.data.tokens || []);
  //   } catch (error) {
  //     console.error("Error fetching cleaner push tokens:", error);
  //   }
  // };

  const fetchHostPushTokens = async (id) => {
    try {
      const response = await userService.getUserPushTokens(id);
      setHostPushToken(response.data.tokens || []);
    } catch (error) {
      console.error("Error fetching host push tokens:", error);
    }
  };

  const handlePayment = async () => {
    try {
      if (!clientSecret) {
        onError({ status: 'error', message: 'Invalid Payment Intent' });
        return;
      }

      // Initialize Stripe Payment Sheet
      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Freshsweeper',
        customer: {
          email: hostEmail,
          name: hostName,
        },
        returnURL: 'freshsweeper://payment-complete',
      });

      if (error) throw new Error(error.message);

      // Show Stripe Payment Sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) throw new Error(paymentError.message);

      // Payment successful
      const paymentDetails = { status: 'success', totalAmount };
      onSuccess(paymentDetails);

      // Add friend create chatroom and send the initial message 
      // onAddFriend(cleanerId, fbaseUser, schedule, scheduleId, cleaner_expo_token, host_expo_token)

      
      // Send push notification to host
      // await sendPushNotifications(
      //   host_expo_token,
      //   'Payment Successful',
      //   `Your payment of $${totalAmount} has been processed successfully.`,
      //   { screen: ROUTES.host_payment_history, params: { totalAmount } }
      // );

      // // Send push notification to cleaner
      // await sendPushNotifications(
      //   cleaner_expo_tokens,
      //   'New Cleaning Job Assigned',
      //   'A cleaning job has been successfully paid and assigned to you.',
      //   {
      //     screen: ROUTES.cleaner_schedule_details_view,
      //     params: { scheduleId: scheduleId }
      //   }
      // );

    } catch (error) {
      onError({ status: 'error', message: error.message });
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePayment}>
      <Text style={styles.buttonText}>Pay Now</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default StripeGroupPaymentButton;