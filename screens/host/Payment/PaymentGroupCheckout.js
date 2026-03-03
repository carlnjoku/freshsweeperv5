import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import StripeGroupPaymentButton from '../../../components/shared/StripeGroupPaymentButton';
import userService from '../../../services/connection/userService';
import COLORS from '../../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../../context/AuthContext';
import { ScrollView } from 'react-native-gesture-handler';
import PaymentDetails from './PaymentDetails';
import ROUTES from '../../../constants/routes';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import onAddFriend from '../../../utils/createNewChatFriend';

const API_BASE_URL = 'http://your-api-url.com'; // Replace with your actual API URL

const PaymentGroupCheckout = ({ route, navigation }) => {
  const { currentUser, currentUserId, fbaseUser } = useContext(AuthContext);
  
  const {
    requestId,
    cleaning_fee,
    scheduleId,
    schedule,
    selected_cleaners,
    cleanerIds,
    cleanersWithFee,
    cleaner_stripe_account_id
  } = route.params;
  
  console.log("cleanersIds", selected_cleaners)
  console.log('🧾 Cleaners with fees:', cleanersWithFee);

  // Compute total fee from individual cleaner fees
  const totalCleanersFee = cleanersWithFee?.reduce((sum, c) => sum + (Number(c.fee) || 0), 0);
  const serviceFee = totalCleanersFee * 0.1; // 10% service fee
  const totalAmount = totalCleanersFee + serviceFee;
 

  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [savedCards, setSavedCards] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const [cleaning_date, setCleaningDate] = useState(schedule.cleaning_date);
  const [cleaning_time, setCleaningTime] = useState(schedule.cleaning_time);
  const [cleaning_end_time, setCleaningEndTime] = useState(schedule.cleaning_end_time);

  
  let cleaning_end_time1 = cleaning_end_time;
  let end_time = moment(cleaning_end_time1, "HH:mm:ss").add(2, 'hours').format("HH:mm");
  let start_time = moment(cleaning_time, "HH:mm:ss").format("HH:mm")
  const selectedCleanerIds = selected_cleaners.map(selected_cleaner => selected_cleaner._id);
  let dayName = moment(cleaning_date, "YYYY-MM-DD").format("dddd");


  useEffect(() => {
    const fetchClientSecret = async () => {
      if (serviceFee > 0) {
        try {
          const data = {
            amount: totalAmount,
            customerId: currentUser.stripe_customer?.stripe_customer_id,
            cleaner_stripe_account_id,
            metadata: {
              scheduleId,
              requestId,
              cleaning_date,
              start_time,
              end_time,
              dayName,
              cleaners: JSON.stringify(cleanersWithFee)
            },
            platformFeeAmount: serviceFee,
            receiptEmail: currentUser.email,
            currency:currentUser.location?.currency?.code
          };

          const response = await userService.fetchGroupPaymentIntentClientSecret(data);
          const { clientSecret, paymentIntentId, status } = response.data;
          console.log("Payment intent", response.data)
          setClientSecret(clientSecret);
          setPaymentIntentId(paymentIntentId);
          setPaymentStatus(status);
        } catch (error) {
          Alert.alert('Error', 'Failed to create a payment intent.');
        }
      }
    };

    const fetchSavedCards = async () => {
      try {
        const custData = { customerId: currentUser.stripe_customer?.stripe_customer_id };
        const response = await userService.fetchCustomerPaymentMethods(custData);
        setSavedCards(response.data.payment_methods);
      } catch (error) {
        console.error('Failed to fetch saved cards:', error);
      }
    };

    fetchSavedCards();
    fetchClientSecret();
  }, [cleaning_fee]);

  const handlePaymentSuccess = async (result) => {
    // Compute total fee dynamically (from cleanersWithFee)
    const totalCleanersFee = cleanersWithFee?.reduce(
      (sum, c) => sum + (Number(c.fee) || 0),
      0
    );
    const serviceFee = totalCleanersFee * 0.1; // 10% service fee
    const totalAmount = totalCleanersFee + serviceFee;
  
    setPaymentStatus(result.status);
  
    Toast.show({
      type: 'success',
      text1: 'Payment Successful 💸',
      text2: `Payment of $${totalAmount.toFixed(2)} (including service fee) was successful!`,
      position: 'bottom',
    });
    
   
    try {
      // ✅ 1️⃣ Create chatrooms for each cleaner (and pass fee)
      await Promise.all(
        cleanersWithFee.map(({ cleanerId, fee }) =>
          onAddFriend(cleanerId, fbaseUser, schedule, scheduleId, fee)
        )
      );
      console.log("✅ All chatrooms created successfully!");
  
      // ✅ 2️⃣ Call backend payment success endpoint (all notifications handled here)
      await callBackendPaymentSuccess(totalAmount);
  
      console.log("✅ Payment success flow completed.");
    } catch (error) {
      console.error("❌ Error during payment success flow:", error);
      // Just log the error - no fallback needed since RQ will retry
    }
  
    // ✅ 3️⃣ Redirect to dashboard
    navigation.navigate(ROUTES.host_home_tab);
  };

  const callBackendPaymentSuccess = async (totalAmount) => {
    try {

      const payload = {
        scheduleId: scheduleId,
        hostId: currentUserId,
        cleanerIds: selectedCleanerIds,
        totalAmount: totalAmount,
        hostName: currentUser.firstname + ' ' + currentUser.lastname,
        hostEmail: currentUser.email,
        cleanersWithFee: cleanersWithFee // Include individual fees for cleaner notifications
      }
      const response = await userService.sendChatMessagePushNotification(payload)
      
      // const response = await fetch(`${API_BASE_URL}/payment_success`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     scheduleId: scheduleId,
      //     hostId: currentUserId,
      //     cleanerIds: selectedCleanerIds,
      //     totalAmount: totalAmount,
      //     hostName: currentUser.firstname + ' ' + currentUser.lastname,
      //     hostEmail: currentUser.email,
      //     cleanersWithFee: cleanersWithFee // Include individual fees for cleaner notifications
      //   }),
      // });

      // const result = await response.json();
      // alert(response.status)
      console.log("The response coming back...", response)
      if (response.status === 'success') {
        console.log('✅ Payment success notifications queued:', response.job_id);
      } else {
        console.error('❌ Backend notification failed:', response.error);
        // RQ will handle retries, so no need for fallback
      }
    } catch (error) {
      console.error('❌ Error calling payment success endpoint:', error);
      // RQ will handle retries, so no need for fallback
    }
  };

  const handlePaymentError = (error) => {
    setPaymentStatus(error.status);
  
    Toast.show({
      type: 'error',
      text1: 'Payment Failed',
      text2: error.message || 'An unexpected error occurred.',
      position: 'bottom',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{justifyContent:'center', alignItems:'center', marginTop:40, marginBottom:10}}>
        <View style={styles.circle}>
          <MaterialCommunityIcons name="cart" size={40} color="#ffffff" />
        </View>
        </View>
        <Text style={styles.header}>Payment Checkout</Text>

        <PaymentDetails 
          cleaningServiceFee={serviceFee} 
          cleanersWithFee={cleanersWithFee} 
        />

        {clientSecret && totalCleanersFee > 0 ? (
          <StripeGroupPaymentButton 
            clientSecret={clientSecret} 
            totalAmount={totalAmount} 
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            fbaseUser={fbaseUser} 
            scheduleId={scheduleId}
            schedule={schedule}
            cleanersId={selectedCleanerIds}
            hostId={currentUserId}
            hostName={currentUser.firstname + ' ' + currentUser.lastname}
            hostEMail={currentUser.email}
          />
        ) : (
          <Text style={{ textAlign: 'center', fontSize: 12 }}>
            Loading payment information...
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  icon: {
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PaymentGroupCheckout;





// import React, { useState, useEffect, useContext } from 'react';
// import { View, Text, Alert, StyleSheet } from 'react-native';
// import StripeGroupPaymentButton from '../../../components/shared/StripeGroupPaymentButton';
// import userService from '../../../services/connection/userService';
// import COLORS from '../../../constants/colors';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { AuthContext } from '../../../context/AuthContext';
// import { ScrollView } from 'react-native-gesture-handler';
// import PaymentDetails from './PaymentDetails';
// import ROUTES from '../../../constants/routes';
// import moment from 'moment';
// import Toast from 'react-native-toast-message';
// import onAddFriend from '../../../utils/createNewChatFriend';
// // import { useNavigation } from '@react-navigation/native';


// const PaymentGroupCheckout = ({ route, navigation }) => {
//   const { currentUser, currentUserId, fbaseUser } = useContext(AuthContext);
//   // const navigation = useNavigation()

//   const {
//     requestId,
//     cleaning_fee,
//     scheduleId,
//     schedule,
//     selected_cleaners,
//     cleanerIds,
//     cleanersWithFee,
//     cleaner_stripe_account_id
//   } = route.params;
  
//   console.log("cleanersIds", selected_cleaners)
//   console.log('🧾 Cleaners with fees:', cleanersWithFee);

//   // Compute total fee from individual cleaner fees
//   const totalCleanersFee = cleanersWithFee?.reduce((sum, c) => sum + (Number(c.fee) || 0), 0);
//   const serviceFee = totalCleanersFee * 0.1; // 10% service fee
//   const totalAmount = totalCleanersFee + serviceFee;
 

//   const [clientSecret, setClientSecret] = useState(null);
//   const [paymentIntentId, setPaymentIntentId] = useState(null);
//   const [savedCards, setSavedCards] = useState([]);
//   const [paymentStatus, setPaymentStatus] = useState(null);

//   const [cleaning_date, setCleaningDate] = useState(schedule.cleaning_date);
//   const [cleaning_time, setCleaningTime] = useState(schedule.cleaning_time);
//   const [cleaning_end_time, setCleaningEndTime] = useState(schedule.cleaning_end_time);

  
//   // alert(scheduleId)
//   // alert(moment("19:09:00", "HH:mm:ss").add(2, 'hours').format("h:mm A"))

//   // console.log(typeof cleaning_end_time); // Should be 'object' if it's a Date
//   // console.log(cleaning_end_time); // Check its actual value

// let cleaning_end_time1 = cleaning_end_time;  // Example string
// let end_time = moment(cleaning_end_time1, "HH:mm:ss").add(2, 'hours').format("HH:mm");
 
// let start_time = moment(cleaning_time, "HH:mm:ss").format("HH:mm")
// // let roko = moment(cleaning_end_time, "HH:mm:ss").format("HH:mm");
// // console.log("Roko", roko)
// // console.log(moment(cleaning_time, "HH:mm:ss").format("HH:mm"))
// // console.log(cleaning_end_time)
// // console.log("Formated",formattedEndTime); // Expected Output: 1:10 PM
// // const newTime = moment(cleaning_end_time, "HH:mm:ss").add(2, 'hours').format("HH:mm");
// // console.log("new", newTime)

// console.log("Selected cleaners", selected_cleaners)
// console.log("request cleaners", requestId)

// const selectedCleanerIds = selected_cleaners.map(selected_cleaner => selected_cleaner._id);

// let dayName = moment(cleaning_date, "YYYY-MM-DD").format("dddd");



//   useEffect(() => {
//     const fetchClientSecret = async () => {
//       if (serviceFee > 0) {
//         try {
//           const data = {
//             amount: totalAmount,
//             customerId: currentUser.stripe_customer?.stripe_customer_id,
//             cleaner_stripe_account_id,
//             metadata: {
//               scheduleId,
//               requestId,
//               start_time,
//               end_time,
//               dayName,
//               cleaners: JSON.stringify(cleanersWithFee)
//             },
//             platformFeeAmount: serviceFee,
//             receiptEmail: currentUser.email, // Ensure the receipt email is sent
//             currency:currentUser.location?.currency?.code
//           };

//           // console.log("data", data)
          

//           const response = await userService.fetchGroupPaymentIntentClientSecret(data);
//           const { clientSecret, paymentIntentId, status } = response.data;
//           console.log("Payment intent", response.data)
//           // alert(clientSecret)
//           // alert(currentUser.stripe_customer?.stripe_customer_id)
//           setClientSecret(clientSecret);
//           setPaymentIntentId(paymentIntentId);
//           setPaymentStatus(status);
//         } catch (error) {
//           Alert.alert('Error', 'Failed to create a payment intent.');
//         }
//       }
//     };

//     const fetchSavedCards = async () => {
//       try {
//         const custData = { customerId: currentUser.stripe_customer?.stripe_customer_id };
//         const response = await userService.fetchCustomerPaymentMethods(custData);
//         setSavedCards(response.data.payment_methods);
//       } catch (error) {
//         console.error('Failed to fetch saved cards:', error);
//       }
//     };

//     fetchSavedCards();
//     fetchClientSecret();
//   }, [cleaning_fee]);

  

//   const handlePaymentSuccess = async (result) => {
//     // Compute total fee dynamically (from cleanersWithFee)
//     const totalCleanersFee = cleanersWithFee?.reduce(
//       (sum, c) => sum + (Number(c.fee) || 0),
//       0
//     );
//     const serviceFee = totalCleanersFee * 0.1; // 10% service fee
//     const totalAmount = totalCleanersFee + serviceFee;
  
//     setPaymentStatus(result.status);
  
//     Toast.show({
//       type: 'success',
//       text1: 'Payment Successful 💸',
//       text2: `Payment of $${totalAmount.toFixed(2)} (including service fee) was successful!`,
//       position: 'bottom',
//     });
  
//     try {
//       // ✅ 1️⃣ Create chatrooms for each cleaner (and pass fee)
//       await Promise.all(
//         cleanersWithFee.map(({ cleanerId, fee }) =>
//           onAddFriend(cleanerId, fbaseUser, schedule, scheduleId, fee)
//         )
//       );
//       console.log("✅ All chatrooms created successfully!");
  
//       // ✅ 2️⃣ Fetch host and cleaners' push tokens in parallel
//       const [hostResponse, ...cleanerResponses] = await Promise.all([
//         userService.getUserPushTokens(currentUserId), // host
//         ...cleanersWithFee.map(({ cleanerId }) =>
//           userService.getUserPushTokens(cleanerId)
//         ),
//       ]);
  
//       const hostTokens = hostResponse?.data?.tokens || [];
//       const cleanerTokensMap = {}; // cleanerId => tokens
//       cleanersWithFee.forEach(({ cleanerId }, index) => {
//         cleanerTokensMap[cleanerId] = cleanerResponses[index]?.data?.tokens || [];
//       });
  
//       // ✅ 3️⃣ Host Notification
//       if (hostTokens.length > 0) {
//         const hostNotification = {
//           title: "Payment Successful",
//           body: `You’ve successfully paid $${totalAmount.toFixed(2)} for schedule #${scheduleId}.`,
//           data: {
//             screen: ROUTES.host_dashboard,
//             params: { scheduleId, hostId: currentUserId },
//           },
//         };
  
//         const hostPayload = hostTokens.map((token) => ({
//           to: token,
//           ...hostNotification,
//         }));
  
//         await userService.sendChatMessagePushNotification(hostPayload);
//         console.log("📨 Host push notifications sent.");
//       }
  
//       // ✅ 4️⃣ Cleaner Notifications (individual fees)
//       await Promise.all(
//         cleanersWithFee.map(async ({ cleanerId, fee }) => {
//           const tokens = cleanerTokensMap[cleanerId];
//           if (!tokens.length) return;
  
//           const cleanerNotification = {
//             title: "Payment Confirmed ✅",
//             body: `A payment of $${fee.toFixed(2)} has been confirmed for your cleaning schedule #${scheduleId}.`,
//             data: {
//               screen: ROUTES.cleaner_dashboard,
//               params: { scheduleId, hostId: currentUserId },
//             },
//           };
  
//           const payload = tokens.map((token) => ({
//             to: token,
//             ...cleanerNotification,
//           }));
  
//           await userService.sendChatMessagePushNotification(payload);
//           console.log(`📨 Cleaner ${cleanerId} notified with fee $${fee}`);
//         })
//       );
  
//       console.log("✅ All push notifications sent successfully.");
//     } catch (error) {
//       console.error("❌ Error during payment success flow:", error);
//     }
  
//     // ✅ 5️⃣ Redirect to dashboard
//     navigation.navigate(ROUTES.host_home_tab);
//   };
  
//   const handlePaymentError = (error) => {
//     setPaymentStatus(error.status);
  
//     Toast.show({
//       type: 'error',
//       text1: 'Payment Failed',
//       text2: error.message || 'An unexpected error occurred.',
//       position: 'bottom',
//     });
//   };

//   return (
//     <View style={styles.container}>
//       <ScrollView showsVerticalScrollIndicator={false}>
//         <View style={{justifyContent:'center', alignItems:'center', marginTop:40, marginBottom:10}}>
//         <View style={styles.circle}>
//           <MaterialCommunityIcons name="cart" size={40} color="#ffffff" />
//         </View>
//         </View>
//         <Text style={styles.header}>Payment Checkout</Text>

//         {/* <PaymentDetails cleaningServiceFee={totalCleanersFee} serviceFee={serviceFee} /> */}
//         <PaymentDetails 
//           cleaningServiceFee={serviceFee} 
//           cleanersWithFee={cleanersWithFee} 
//         />

//         {clientSecret && totalCleanersFee > 0 ? (
//           <StripeGroupPaymentButton 
//             clientSecret={clientSecret} 
//             totalAmount={totalAmount} 
//             onSuccess={handlePaymentSuccess}
//             onError={handlePaymentError}
//             fbaseUser={fbaseUser} 
//             scheduleId={scheduleId}
//             schedule={schedule}
//             cleanersId={selectedCleanerIds}
//             hostId={currentUserId}
//             hostName={currentUser.firstname + ' ' + currentUser.lastname}
//             hostEMail={currentUser.email}
//           />
//         ) : (
//           <Text style={{ textAlign: 'center', fontSize: 12 }}>
//             Loading payment information...
//           </Text>
//         )}





//         {/* <PaymentDetails cleaningServiceFee={cleaning_fee} />

//         {clientSecret && cleaning_fee > 0 ? (
          
//           <StripeGroupPaymentButton 
//             clientSecret={clientSecret} 
//             totalAmount={cleaning_fee} 
//             onSuccess={handlePaymentSuccess}
//             onError={handlePaymentError}
//             fbaseUser={fbaseUser} 
//             scheduleId = {scheduleId}
//             schedule={schedule}
//             cleanersId={selectedCleanerIds}
//             hostId={currentUserId}
//             hostName={currentUser.firstname + ' ' + currentUser.lastname}
//             hostEMail={currentUser.email}
//           />
//         ) : (
//           <Text style={{ textAlign: 'center', fontSize: 12 }}>Loading payment information...</Text>
//         )} */}
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 10,
//     justifyContent: 'center',
//     alignItems: 'stretch',
//   },
//   icon: {
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   header: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   circle: {
//     width: 60,
//     height: 60,
//     borderRadius: 30, // Makes the view a perfect circle
//     backgroundColor: COLORS.primary, // Set the circle's background color
//     justifyContent: 'center', // Center the icon horizontally
//     alignItems: 'center', // Center the icon vertically
//   },
// });

// export default PaymentGroupCheckout;









// import React, { useState, useEffect, useContext } from 'react';
// import { View, Text, Alert, StyleSheet } from 'react-native';
// import StripePaymentButton from '../../../components/StripePaymentButton';
// import userService from '../../../services/userService';
// import mockPaymentData from '../../../utils/mockPaymentData';
// import COLORS from '../../../constants/colors';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { AuthContext } from '../../../context/AuthContext';
// import SavedCards from '../../../components/stripe/SavedCards';
// import { ScrollView } from 'react-native-gesture-handler';
// import { PUBLISHABLE_KEY } from '../../../secret';
// import PaymentDetails from './PaymentDetails';
// import onAddFriend from '../../../utils/createNewChatFriend';

// const PaymentSingleCheckout = ({ route, navigation }) => {

//   const {currentUser, currentUserId, fbaseUser} = useContext(AuthContext)

//   const { requestId,cleaning_fee, scheduleId, schedule, host_expo_token, cleaner_expo_token, cleanerId, 
//   cleaner_firstname, cleaner_lastname, cleaner_avatar } = route.params;
  
//   // Calculate Service Fee (10% of cleaning service fee)
//   const serviceFee = cleaning_fee * 0.1;

//   // Calculate Total
//   const total = cleaning_fee + serviceFee

//   const [clientSecret, setClientSecret] = useState(null);
//   const [totalAmount, setTotalAmount] = useState(0);
//   const [saved_cards, setSavedCards] = useState([]);
//   const [customerId, setCustomerId] = useState(currentUser.stripe_customer?.stripe_customer_id)
//   const [selectedCard, setSelectedCard] = useState(null); // State to track selected card
//   const [total_fee, setTotalFee] = useState(total); // State to track selected card

//   const[cleaner_tokens, setCleanerTokens]=useState([])
//   const[host_tokens, setHostPushToken]=useState([])

  


//   useEffect(() => {
    
//     const fetchClientSecret = async () => {
    
      
//       if (total > 0) {
//         try {
//         //   const data = { amount: total };
//           const data = { 
//             amount: total, 
//             customerId: customerId, 
//             metadata:{
//                 scheduleId: scheduleId,
//                 cleanerId:cleanerId,
//                 cleaner_firstname:cleaner_firstname,
//                 cleaner_lastname:cleaner_lastname,
//                 cleaner_avatar:cleaner_avatar,
//                 requestId:requestId
//             },
//             platformFeeAmount: 150, 
//             // cleanerAccountId: 'cleaner-stripe-account-id'
//         };
//           const response = await userService.fetchSinglePaymentIntentClientSecret(data);
//           setClientSecret(response.data.clientSecret);
//           fetchCleanerPushTokens()
//         } catch (error) {
//           Alert.alert("Error", "Failed to get payment intent.");
//         }
//       }
//     };

//     const fetchCleanerPushTokens = async() => {
//       await userService.getUserPushTokens(cleanerId)
//       .then(response => {
//           const res = response.data.tokens
//           setCleanerTokens(res)
//           console.log("User tokens", res)
//       })
      
//       await userService.getUserPushTokens(currentUserId)
//       .then(response => {
//           const res = response.data.tokens
//           setHostPushToken(res)
//           console.log("User tokens", res)
//       })
//     }


    
//     const fetchSavedCards = async () => {
//         try {
//           const custData = {customerId:customerId}
//           const response = await userService.fetchCustomerPaymentMethods(custData)

//           // console.log(response.data.payment_methods)
//           setSavedCards(response.data.payment_methods);
//         } catch (error) {
//           console.error("Failed to fetch saved cards:", error);
//         }
//       };
  
//     fetchSavedCards();

//     fetchClientSecret();
//   }, [cleaning_fee]);

//   const handleCardSelection = (cardId) => {
//     setSelectedCard(cardId);
//   };

//   // New component
//   const [paymentStatus, setPaymentStatus] = useState(null);

//   const handlePaymentSuccess = (result) => {
//     setPaymentStatus(result.status);
    
    
//     // send push notification to cleaner
//     Alert.alert('Payment Success', `Payment of $${result.totalAmount} was successful!`);

//     // Create chat room and friend
//     onAddFriend(cleanerId, fbaseUser, schedule, scheduleId, cleaner_expo_token,
//       host_expo_token)
//     };

//   const handlePaymentError = (error) => {
//     setPaymentStatus(error.status);
//     Alert.alert('Payment Error', error.message);
//   };


//   return (
//     <View style={styles.container}>
//         <ScrollView showsVerticalScrollIndicator={false}>
//         {/* Centered Checkout Icon */}
//       <Icon name="shopping-cart" size={48} color="#4CAF50" style={styles.icon} />
//       <Text style={styles.header}>Payment Checkout </Text>

//       {/* {saved_cards.length > 0 ? (
//         <SavedCards savedCards={saved_cards} selectedCard={selectedCard} onSelectCard={handleCardSelection} />
//       ) : (
//         // <Text style={{ textAlign: 'center', fontSize: 12 }}>Loading saved cards...</Text>
//         <Text style={{ textAlign: 'center', fontSize: 12 }}></Text>
//       )} */}
      
//       {clientSecret && cleaning_fee > 0 ? (
//         <View style={styles.paymentButtonContainer}>
            
//           <PaymentDetails 
//             cleaningServiceFee={cleaning_fee} 
//           />
//           <StripePaymentButton 
//             // publishableKey={PUBLISHABLE_KEY}
//             clientSecret={clientSecret} 
//             totalAmount={total_fee} 
//             selectedCard={selectedCard} 
//             onSuccess={handlePaymentSuccess}
//             onError={handlePaymentError}
//             fbaseUser={fbaseUser} 
//             scheduleId = {scheduleId}
//             customerId={customerId}
//             schedule={schedule}
//             cleanerId={cleanerId}
//             cleaner_expo_tokens={cleaner_tokens}
//             host_expo_tokens={host_tokens}
//           />
//         </View>
//       ) : (
//         <Text style={{textAlign:'center', fontSize:12}}>Loading payment information...</Text>
//       )}

//     </ScrollView> 
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 0,
//     margin:10,
//     justifyContent: 'center',
//     alignItems: 'stretch', // Stretch to full width
//   },
//   icon: {
//     marginBottom: 20,  // Add space below the icon
//     textAlign: 'center', // Center-align header text
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center', // Center header text
//     marginBottom: 20,
//   },
//   totalText: {
//     fontSize: 13,
//     textAlign: 'center', // Center total amount text
//     marginVertical: 0,
//     paddingRight:15,
//     fontWeight:'400'
//   },
//   paymentButtonContainer: {
//     backgroundColor: '#FFFFFF',
//     // padding: 16,
//     borderRadius: 8,
//     marginVertical: 8,
//     marginTop:20,
//     // flexDirection: 'row',
//     // justifyContent: 'space-between',
//     // alignItems: 'center',
//     shadowColor: COLORS.gray,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 1,
//     width: '100%', // Full width for payment button
//     // alignItems: 'center', // Center content within the payment button container
//   },
// });

// export default PaymentSingleCheckout;


