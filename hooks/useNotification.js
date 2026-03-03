// import * as Device from 'expo-device';
// import * as Notifications from 'expo-notifications';
// import { Platform } from 'react-native';
// import React, { useState, useContext, useEffect } from 'react';
// import { useNavigation } from '@react-navigation/native'; // Import useNavigation

// export const useNotification = () => {
//     const [expoPushToken, setExpoPushToken] = useState("");
//     const navigation = useNavigation(); // Initialize navigation

//     const registerForPushNotificationsAsync = async () => {
//         if (Device.isDevice) {
//             const { status: existingStatus } = await Notifications.getPermissionsAsync();
//             let finalStatus = existingStatus;

//             if (existingStatus !== 'granted') {
//                 const { status } = await Notifications.requestPermissionsAsync();
//                 finalStatus = status;
//             }

//             if (finalStatus !== 'granted') {
//                 alert('Failed to get push token for push notification!');
//                 return;
//             }

//             const token = (await Notifications.getExpoPushTokenAsync()).data;
//             console.log('Token', token);
//             setExpoPushToken(token);

//             // Set up the notification channel for Android
//             if (Platform.OS === 'android') {
//                 Notifications.setNotificationChannelAsync('default', {
//                     name: 'default',
//                     importance: Notifications.AndroidImportance.MAX,
//                     vibrationPattern: [0, 250, 250, 250],
//                     lightColor: '#FF231F7C',
//                 });
//             }
//         } else {
//             alert('Must use physical device for Push Notifications');
//         }
//     };

//     const handleNotification = notification => {
//         // Handle incoming notification while the app is in the foreground
//     };

//     const handleNotificationResponse = response => {
//         // Handle notification response when the app is opened from the notification
//         const data = response.notification.request.content.data;

//         // Check the data to determine where to navigate
//         if (data.screen) {
//             // Navigate to the specified screen with any provided parameters
//             navigation.navigate(data.screen, data.params);
//         }
//     };

//     useEffect(() => {
//         // Add notification listeners
//         const subscriptionReceived = Notifications.addNotificationReceivedListener(handleNotification);
//         const subscriptionResponse = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

//         // Cleanup listeners on unmount
//         return () => {
//             subscriptionReceived.remove();
//             subscriptionResponse.remove();
//         };
//     }, []);

//     return { expoPushToken, registerForPushNotificationsAsync, handleNotification, handleNotificationResponse };
// };







// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
// import { useState, useEffect } from 'react';
// import { navigate } from './navigationService';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// // import userService from '../services/userService';
// import userService from '../services/connection/userService';


// export function useNotification() {
    
//     const [expoPushToken, setExpoPushToken] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);



//     const registerForPushNotificationsAsync = async (userId) => {
      
//         if (!userId) {
//             console.error('User ID is required for registering push notifications.');
//             setError('User ID is required.');
//             return;
//         }
//         try {
//             // Step 1: Retrieve token from AsyncStorage
//             let token = await AsyncStorage.getItem('expoPushToken');
            
//             // Step 2: Validate the token with the backend
//             const tdata = {
//                 // userId:userId,
//                 token:token
//             }
//             alert(tdata)
//             console.log("Nweeeewn toks", tdata)
//             const isValid = token && (await validateTokenWithBackend(tdata));
    
//             if (!isValid) {
//                 // alert('Token is invalid or missing. Generating a new one...')
//                 // console.warn('Token is invalid or missing. Generating a new one...');
                
//                 // Step 3: Generate a new push token
//                 token = await generateNewPushToken();
            
//                 if (token) {
//                     // Step 4: Save the new token locally
//                     await AsyncStorage.setItem('expoPushToken', token);
    
//                     // Step 5: Send the new token to the backend
//                     await sendTokenToBackend(token, userId);
                    
//                 } else {
//                     console.warn('Failed to generate a new push token.');
//                 }
//             } else {
//                 console.log('Token is valid and already exists:', token);
//             }
    
//             // Step 6: Update the state
//             setExpoPushToken(token);
//         } catch (error) {
//             console.error('Error registering for push notifications:', error.message || error);
//         }
//     };

//     const generateNewPushToken = async () => {
//         if (Device.isDevice) {
//             const { status: existingStatus } = await Notifications.getPermissionsAsync();
//             let finalStatus = existingStatus;

//             if (existingStatus !== 'granted') {
//                 const { status } = await Notifications.requestPermissionsAsync();
//                 finalStatus = status;
//             }

//             if (finalStatus === 'granted') {
//                 return (await Notifications.getExpoPushTokenAsync()).data;
//             } else {
//                 console.warn('Permission for notifications not granted.');
//             }
//         } else {
//             console.warn('Must use a physical device for Push Notifications');
//         }

//         return null;
//     };

//     const validateTokenWithBackend = async (tdata) => {
//         console.log("token",tdata)
//         try {
//             const response = await userService.validateToken(tdata);
//             console.log(response.data.isValid)
//             return response.data.isValid; // Backend should return { isValid: true/false }
            
//         } catch (error) {
//             console.error('Error validating push token:', error);
//             return false;
//         }
//     };

//     const sendTokenToBackend = async (token, userId) => {
//         try {
//             const deviceInfo = {
//                 deviceName: Device.deviceName || 'Unknown Device',
//                 osType: Device.osName || 'Unknown OS',
//                 osVersion: Device.osVersion || 'Unknown Version',
//                 token,
//                 userId:userId,
//             };
//             console.log("My device", deviceInfo)
    
//             const response = await userService.storeToken(deviceInfo);

//             console.log('Token successfully sent to backend:', response.data);
//         } catch (error) {
//             console.error('Error sending token to backend:', error.message || error);
//         }
//     };


//     const handleNotificationResponse = (response) => {
//         console.log("Notification response:", response);

//         // Extract notification data
//         const { screen, params } = response?.notification?.request?.content?.data || {};
//         console.log(screen)
//         console.log(params)
//         if (screen) {
//             // Navigate to the specified screen with params
//             navigate(screen, params);
//         } else {
//             console.log("No screen specified in notification data.");
//         }
//     };

    


//     // Handle notification when received in the foreground
//     const handleNotification = (notification) => {
//         console.log("Notification received in foreground:", notification);
//         // You can process notifications here if needed
//     };


    
    

//     useEffect(() => {
//         registerForPushNotificationsAsync();

//         Notifications.setNotificationHandler({
//             handleNotification: async () => ({
//                 shouldShowAlert: true,
//                 shouldPlaySound: true,
//                 shouldSetBadge: true,
//             }),
//         });

//         // Listeners for notification events
//         const notificationListener = Notifications.addNotificationReceivedListener(handleNotification);
//         const responseListener = Notifications.addNotificationResponseReceivedListener(
//         handleNotificationResponse
//         );

//         // Clean up listeners on unmount
//         return () => {
//         Notifications.removeNotificationSubscription(notificationListener);
//         Notifications.removeNotificationSubscription(responseListener);
//         };

//     }, []);


//     return {
//         expoPushToken,
//         registerForPushNotificationsAsync, // Let components call this when they have userId
//         handleNotificationResponse,
//         loading,
//         error
//     };
// }




// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
// import { useState, useEffect } from 'react';
// import { navigate } from './navigationService';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import userService from '../services/connection/userService';

// export function useNotification() {
//     const [expoPushToken, setExpoPushToken] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);

//     const registerForPushNotificationsAsync = async (userId) => {
//         if (!userId) {
//             console.error('User ID is required for registering push notifications.');
//             setError('User ID is required.');
//             return;
//         }
        
//         try {
//             setLoading(true);
//             setError(null);

//             // Step 1: Retrieve token from AsyncStorage
//             let token = await AsyncStorage.getItem('expoPushToken');
            
//             // Step 2: Validate the token with the backend
//             const tdata = {
//                 userId: userId, // FIXED: Uncommented this line
//                 token: token
//             }
//             // FIXED: Remove disruptive alert
//             // alert(tdata)
//             console.log("Validating token", tdata);
            
//             const isValid = token && (await validateTokenWithBackend(tdata));

//             if (!isValid) {
//                 console.warn('Token is invalid or missing. Generating a new one...');
                
//                 // Step 3: Generate a new push token
//                 token = await generateNewPushToken();
//                 console.log("Generated token", token)
//                 alert(token)
            
//                 if (token) {
//                     // Step 4: Save the new token locally
//                     await AsyncStorage.setItem('expoPushToken', token);
    
//                     // Step 5: Send the new token to the backend
//                     await sendTokenToBackend(token, userId);
                    
//                 } else {
//                     console.warn('Failed to generate a new push token.');
//                 }
//             } else {
//                 console.log('Token is valid and already exists:', token);
//             }
    
//             // Step 6: Update the state
//             setExpoPushToken(token);
//         } catch (error) {
//             console.error('Error registering for push notifications:', error.message || error);
//             setError(error.message || 'Failed to register for push notifications');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const generateNewPushToken = async () => {
//         if (Device.isDevice) {
//             const { status: existingStatus } = await Notifications.getPermissionsAsync();
//             let finalStatus = existingStatus;

//             if (existingStatus !== 'granted') {
//                 const { status } = await Notifications.requestPermissionsAsync();
//                 finalStatus = status;
//             }

//             if (finalStatus === 'granted') {
//                 // Add your Expo project ID from app.json
//                 return (await Notifications.getExpoPushTokenAsync({
//                     projectId: "a0e21e18-12cb-4043-ac87-18931f1f29bc" // From your app.json
//                 })).data;
//             } else {
//                 console.warn('Permission for notifications not granted.');
//             }
//         } else {
//             console.warn('Must use a physical device for Push Notifications');
//         }

//         return null;
//     };

//     const validateTokenWithBackend = async (tdata) => {
//         console.log("Validating token with backend:", tdata);
//         try {
//             const response = await userService.validateToken(tdata);
//             console.log("Token validation response:", response.data.isValid);
//             return response.data.isValid;
//         } catch (error) {
//             console.error('Error validating push token:', error);
//             return false;
//         }
//     };

//     const sendTokenToBackend = async (token, userId) => {
//         try {
//             const deviceInfo = {
//                 deviceName: Device.deviceName || 'Unknown Device',
//                 osType: Device.osName || 'Unknown OS',
//                 osVersion: Device.osVersion || 'Unknown Version',
//                 token,
//                 userId: userId,
//             };
//             console.log("Sending device info to backend:", deviceInfo);
    
//             const response = await userService.storeToken(deviceInfo);
//             console.log('Token successfully sent to backend:', response.data);
//         } catch (error) {
//             console.error('Error sending token to backend:', error.message || error);
//             throw error; // Re-throw to handle in calling function
//         }
//     };

//     const handleNotificationResponse = (response) => {
//         console.log("Notification response:", response);

//         // Extract notification data
//         const { screen, params } = response?.notification?.request?.content?.data || {};
//         console.log("Screen to navigate:", screen);
//         console.log("Navigation params:", params);
        
//         if (screen) {
//             // Navigate to the specified screen with params
//             navigate(screen, params);
//         } else {
//             console.log("No screen specified in notification data.");
//         }
//     };

//     const handleNotification = (notification) => {
//         console.log("Notification received in foreground:", notification);
//         // You can process notifications here if needed
//     };

//     // FIXED: Remove automatic registration from useEffect
//     useEffect(() => {
//         // Only setup notification handlers, don't call registerForPushNotificationsAsync here
//         Notifications.setNotificationHandler({
//             handleNotification: async () => ({
//                 shouldShowAlert: true,
//                 shouldPlaySound: true,
//                 shouldSetBadge: true,
//             }),
//         });

//         // Listeners for notification events
//         const notificationListener = Notifications.addNotificationReceivedListener(handleNotification);
//         const responseListener = Notifications.addNotificationResponseReceivedListener(
//             handleNotificationResponse
//         );

//         // Clean up listeners on unmount
//         return () => {
//             Notifications.removeNotificationSubscription(notificationListener);
//             Notifications.removeNotificationSubscription(responseListener);
//         };
//     }, []);

//     return {
//         expoPushToken,
//         registerForPushNotificationsAsync,
//         handleNotificationResponse,
//         loading,
//         error
//     };
// }


















// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
// import { useState, useEffect } from 'react';
// import { navigate } from './navigationService';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import userService from '../services/connection/userService';

// const notificationDataToURL = (data) => {
//     if (!data) return null;
  
//     const { screen, params } = data;
    
//     switch (screen) {
//       case 'Chat':
//         return `freshsweeper://messages/chat/${params.chatroomId}?` +
//                `selectedUser=${encodeURIComponent(JSON.stringify(params.selectedUser))}&` +
//                `fbaseUser=${encodeURIComponent(JSON.stringify(params.fbaseUser))}&` +
//                `schedule=${encodeURIComponent(JSON.stringify(params.schedule))}&` +
//                `friendIndex=${params.friendIndex}`;
  
//       case 'BookingDetails':
//         return `freshsweeper://booking/${params.bookingId}?notificationId=${params.notificationId}`;
  
//       case 'BookingRequest':
//         return `freshsweeper://booking-request/${params.scheduleId}?notificationId=${params.notificationId}`;
  
//       case 'Payment':
//         return `freshsweeper://payment/${params.paymentId}?status=${params.status}`;
  
//       case 'Notifications':
//         return 'freshsweeper://notifications';
  
//       case 'Home':
//       default:
//         return 'freshsweeper://home';
//     }
//   };

// export function useNotification() {
//     const [expoPushToken, setExpoPushToken] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);

//     const registerForPushNotificationsAsync = async (userId) => {
//         if (!userId) {
//             console.error('User ID is required for registering push notifications.');
//             setError('User ID is required.');
//             return;
//         }
        
//         try {
//             setLoading(true);
//             setError(null);

//             console.log('=== Starting Push Notification Registration ===');
            
//             // Generate push token using Expo's service
//             const token = await generateNewPushToken();
//             console.log("Generated token:", token);

//             if (token) {
//                 // Save the token locally
//                 await AsyncStorage.setItem('expoPushToken', token);
                
//                 // Send the token to your backend
//                 await sendTokenToBackend(token, userId);
                
//                 setExpoPushToken(token);
//                 console.log('✅ Push notification registration successful');
//             } else {
//                 throw new Error('Failed to generate push token');
//             }
//         } catch (error) {
//             console.error('Error registering for push notifications:', error);
//             setError(error.message || 'Failed to register for push notifications');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const generateNewPushToken = async () => {
//         try {
//             console.log('Requesting notification permissions...');
            
//             // Skip the check - just request permissions directly
//             const { status } = await Notifications.requestPermissionsAsync();
//             console.log('Permission result:', status);
            
//             if (status !== 'granted') {
//                 alert(`Permission denied: ${status}`);
//                 return null;
//             }
            
//             console.log('Generating push token...');
//             const tokenData = await Notifications.getExpoPushTokenAsync({
//                 projectId: "a0e21e18-12cb-4043-ac87-18931f1f29bc"
//             });
            
//             console.log('Token generated:', tokenData.data);
//             // alert(`Token: ${tokenData.data}`);
//             return tokenData.data;
            
//         } catch (error) {
//             console.error('Error:', error);
//             // alert(`Error: ${error.message}`);
//             return null;
//         }
//     };

//     // const generateNewPushToken = async () => {
//     //     console.log('Checking device and permissions...');
        
//     //     if (!Device.isDevice) {
//     //         console.warn('Must use physical device for push notifications');
//     //         // For testing, return a mock token
//     //         return "ExponentPushToken[TestDeviceMockToken123]";
//     //     }

//     //     try {
//     //         // Check current permissions
//     //         const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     //         console.log('Current permission status:', existingStatus);

//     //         let finalStatus = existingStatus;
//     //         if (existingStatus !== 'granted') {
//     //             console.log('Requesting notification permissions...');
//     //             const { status } = await Notifications.requestPermissionsAsync();
//     //             finalStatus = status;
//     //             console.log('Permission request result:', status);
//     //         }

//     //         if (finalStatus !== 'granted') {
//     //             console.warn('Permission not granted for notifications');
//     //             return null;
//     //         }

//     //         console.log('Generating Expo push token...');
//     //         const tokenData = await Notifications.getExpoPushTokenAsync({
//     //             projectId: "a0e21e18-12cb-4043-ac87-18931f1f29bc"
//     //         });
            
//     //         console.log('✅ Token generated successfully');
//     //         return tokenData.data;

//     //     } catch (error) {
//     //         console.error('Error generating push token:', error);
//     //         return null;
//     //     }
//     // };

//     const sendTokenToBackend = async (token, userId) => {
//         try {
//             const deviceInfo = {
//                 deviceName: Device.deviceName || 'Unknown Device',
//                 osType: Device.osName || 'Unknown OS',
//                 osVersion: Device.osVersion || 'Unknown Version',
//                 token: token,
//                 userId: userId,
//             };
//             console.log("Sending device info to backend:", deviceInfo);
    
//             const response = await userService.storeToken(deviceInfo);
//             console.log('Token successfully sent to backend:', response.data);
//         } catch (error) {
//             console.error('Error sending token to backend:', error.message || error);
//             throw error;
//         }
//     };

//     // Test function to get token quickly
//     const getTestToken = async () => {
//         try {
//             setLoading(true);
//             const token = await generateNewPushToken();
            
//             if (token) {
//                 setExpoPushToken(token);
//                 alert(`Expo Push Token:\n\n${token}\n\n📋 Check console for easy copying`);
//                 console.log('🔔 Expo Push Token:', token);
//                 return token;
//             }
//         } catch (error) {
//             console.error('Error getting test token:', error);
//             alert('Error: ' + error.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Test local notification
//     const sendTestNotification = async () => {
//         try {
//             await Notifications.scheduleNotificationAsync({
//                 content: {
//                     title: "Test Notification",
//                     body: "This is a test notification from your app!",
//                     data: { screen: "Home", test: true },
//                     sound: true,
//                 },
//                 trigger: null, // Send immediately
//             });
//             console.log('✅ Test notification sent');
//             alert('Test notification sent!');
//         } catch (error) {
//             console.error('❌ Failed to send test notification:', error);
//             alert('Failed to send test notification: ' + error.message);
//         }
//     };

//     // Enhanced notification response handler
//     const handleNotificationResponse = (response) => {
//         console.log("Notification response received:", response);

//         const data = response?.notification?.request?.content?.data;
//         console.log("Notification data:", data);

//         if (data) {
//             // Convert notification data to deep link URL
//             const url = notificationDataToURL(data);
//             console.log("Converted URL:", url);
            
//             if (url) {
//                 // Use deep linking to navigate
//                 Linking.openURL(url).catch(err => {
//                     console.error('Error opening URL:', err);
//                     // Fallback navigation if deep linking fails
//                     handleFallbackNavigation(data);
//                 });
//             } else {
//                 console.log("No URL generated from notification data");
//             }
//         } else {
//             console.log("No data found in notification");
//         }
//     };

//     // const handleNotificationResponse = (response) => {
//     //     console.log("Notification response:", response);

//     //     const { screen, params } = response?.notification?.request?.content?.data || {};
//     //     console.log("Screen to navigate:", screen);
//     //     console.log("Navigation params:", params);
        
//     //     if (screen) {
//     //         navigate(screen, params);
//     //     } else {
//     //         console.log("No screen specified in notification data.");
//     //     }
//     // };

//     // Fallback navigation if deep linking fails
//     const handleFallbackNavigation = (data) => {
//         // This would require a navigation ref or context
//         console.log("Fallback navigation for:", data);
//         // You can implement this if you have a navigation ref available
//     };

//     const handleNotification = (notification) => {
//         console.log("Notification received in foreground:", notification);
//     };

//     useEffect(() => {
//         // Setup notification handlers
//         Notifications.setNotificationHandler({
//             handleNotification: async () => ({
//                 shouldShowAlert: true,
//                 shouldPlaySound: true,
//                 shouldSetBadge: true,
//             }),
//         });

//         // Listeners for notification events
//         const notificationListener = Notifications.addNotificationReceivedListener(handleNotification);
//         const responseListener = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

//         // Clean up listeners on unmount
//         return () => {
//             Notifications.removeNotificationSubscription(notificationListener);
//             Notifications.removeNotificationSubscription(responseListener);
//         };
//     }, []);

//     return {
//         expoPushToken,
//         registerForPushNotificationsAsync,
//         getTestToken,
//         sendTestNotification,
//         handleNotificationResponse,
//         loading,
//         error
//     };
// }














// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
// import { useState, useEffect } from 'react';
// import { Linking } from 'react-native';
// import { navigate } from './navigationService';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import userService from '../services/connection/userService';

// const notificationDataToURL = (data) => {
//     if (!data) return null;
  
//     const { screen, params } = data;
    
//     // Map screen names to deep link URLs
//     switch (screen) {
//       // Cleaner routes
//       case 'cleaner_schedule_review':
//         return `freshsweeper://schedule-review/${params.scheduleId}?` +
//                `requestId=${params.requestId}&` +
//                `hostId=${params.hostId}`;

//       case 'cleaner_all_requests':
//         return 'freshsweeper://all-requests';

//       case 'cleaner_schedule_details_view':
//         return `freshsweeper://schedule-details/${params.scheduleId}`;

//       case 'cleaner_clock_in':
//         return `freshsweeper://clock-in/${params.scheduleId}`;

//       case 'cleaner_attach_task_photos':
//         return `freshsweeper://attach-photos/${params.scheduleId}`;

//       // Host routes
//       case 'host_schedule_details':
//         return `freshsweeper://host-schedule/${params.scheduleId}`;

//       case 'host_confirm':
//         return `freshsweeper://confirm-request/${params.requestId}`;

//       case 'host_task_progress':
//         return `freshsweeper://task-progress/${params.scheduleId}`;

//       // Chat routes
//       case 'chat_conversation':
//         return `freshsweeper://chat/${params.chatroomId}?` +
//                `selectedUser=${encodeURIComponent(JSON.stringify(params.selectedUser))}&` +
//                `fbaseUser=${encodeURIComponent(JSON.stringify(params.fbaseUser))}&` +
//                `schedule=${encodeURIComponent(JSON.stringify(params.schedule))}&` +
//                `friendIndex=${params.friendIndex}`;

//       // Common routes
//       case 'notification':
//         return 'freshsweeper://notifications';

//       case 'cleaner_dashboard':
//       case 'host_dashboard':
//       default:
//         return 'freshsweeper://home';
//     }
// };

// export function useNotification() {
//     const [expoPushToken, setExpoPushToken] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);

//     const registerForPushNotificationsAsync = async (userId) => {
//         if (!userId) {
//             console.error('User ID is required for registering push notifications.');
//             setError('User ID is required.');
//             return;
//         }
        
//         try {
//             setLoading(true);
//             setError(null);

//             console.log('=== Starting Push Notification Registration ===');
            
//             // Generate push token using Expo's service
//             const token = await generateNewPushToken();
//             console.log("Generated token:", token);

//             if (token) {
//                 // Save the token locally
//                 await AsyncStorage.setItem('expoPushToken', token);
                
//                 // Send the token to your backend
//                 await sendTokenToBackend(token, userId);
                
//                 setExpoPushToken(token);
//                 console.log('✅ Push notification registration successful');
//             } else {
//                 throw new Error('Failed to generate push token');
//             }
//         } catch (error) {
//             console.error('Error registering for push notifications:', error);
//             setError(error.message || 'Failed to register for push notifications');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const generateNewPushToken = async () => {
//         try {
//             console.log('Requesting notification permissions...');
            
//             // Skip the check - just request permissions directly
//             const { status } = await Notifications.requestPermissionsAsync();
//             console.log('Permission result:', status);
            
//             if (status !== 'granted') {
//                 alert(`Permission denied: ${status}`);
//                 return null;
//             }
            
//             console.log('Generating push token...');
//             const tokenData = await Notifications.getExpoPushTokenAsync({
//                 projectId: "a0e21e18-12cb-4043-ac87-18931f1f29bc"
//             });
            
//             console.log('Token generated:', tokenData.data);
//             return tokenData.data;
            
//         } catch (error) {
//             console.error('Error:', error);
//             return null;
//         }
//     };

//     const sendTokenToBackend = async (token, userId) => {
//         try {
//             const deviceInfo = {
//                 deviceName: Device.deviceName || 'Unknown Device',
//                 osType: Device.osName || 'Unknown OS',
//                 osVersion: Device.osVersion || 'Unknown Version',
//                 token: token,
//                 userId: userId,
//             };
//             console.log("Sending device info to backend:", deviceInfo);
    
//             const response = await userService.storeToken(deviceInfo);
//             console.log('Token successfully sent to backend:', response.data);
//         } catch (error) {
//             console.error('Error sending token to backend:', error.message || error);
//             throw error;
//         }
//     };

//     // Enhanced notification response handler
//     const handleNotificationResponse = (response) => {
//         console.log("Notification response received:", response);

//         const data = response?.notification?.request?.content?.data;
//         console.log("Notification data:", data);

//         if (data) {
//             // Try deep linking first
//             const url = notificationDataToURL(data);
//             console.log("Converted URL:", url);
            
//             if (url) {
//                 // Use deep linking to navigate
//                 Linking.openURL(url).catch(err => {
//                     console.error('Error opening URL via deep link:', err);
//                     // Fallback to direct navigation
//                     handleDirectNavigation(data);
//                 });
//             } else {
//                 console.log("No URL generated from notification data, using direct navigation");
//                 handleDirectNavigation(data);
//             }
//         } else {
//             console.log("No data found in notification");
//         }
//     };

//     // Direct navigation fallback
//     const handleDirectNavigation = (data) => {
//         const { screen, params } = data;
//         console.log("Direct navigation to:", screen, "with params:", params);
        
//         if (screen) {
//             // Navigate directly using the navigation service
//             navigate(screen, params);
//         } else {
//             console.log("No screen specified in notification data.");
//             // Fallback to home
//             navigate('cleaner_dashboard'); // or 'host_dashboard' based on user type
//         }
//     };

//     const handleNotification = (notification) => {
//         console.log("Notification received in foreground:", notification);
//         // You can show custom in-app notifications here if needed
//     };

//     // Handle initial notification when app is opened from notification
//     const handleInitialNotification = async () => {
//         try {
//             const initialNotification = await Notifications.getLastNotificationResponseAsync();
//             if (initialNotification) {
//                 console.log('App was opened from notification:', initialNotification);
//                 // Small delay to ensure navigation is ready
//                 setTimeout(() => {
//                     handleNotificationResponse(initialNotification);
//                 }, 1000);
//             }
//         } catch (error) {
//             console.error('Error handling initial notification:', error);
//         }
//     };

//     useEffect(() => {
//         // Setup notification handlers
//         Notifications.setNotificationHandler({
//             handleNotification: async () => ({
//                 shouldShowAlert: true,
//                 shouldPlaySound: true,
//                 shouldSetBadge: true,
//             }),
//         });

//         // Handle initial notification
//         handleInitialNotification();

//         // Listeners for notification events
//         const notificationListener = Notifications.addNotificationReceivedListener(handleNotification);
//         const responseListener = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

//         // Clean up listeners on unmount
//         return () => {
//             Notifications.removeNotificationSubscription(notificationListener);
//             Notifications.removeNotificationSubscription(responseListener);
//         };
//     }, []);

//     // Test function to get token quickly
//     const getTestToken = async () => {
//         try {
//             setLoading(true);
//             const token = await generateNewPushToken();
            
//             if (token) {
//                 setExpoPushToken(token);
//                 alert(`Expo Push Token:\n\n${token}\n\n📋 Check console for easy copying`);
//                 console.log('🔔 Expo Push Token:', token);
//                 return token;
//             }
//         } catch (error) {
//             console.error('Error getting test token:', error);
//             alert('Error: ' + error.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Test local notification with route names
//     const sendTestNotification = async (screen = 'cleaner_schedule_review', params = {}) => {
//         try {
//             await Notifications.scheduleNotificationAsync({
//                 content: {
//                     title: "Test Navigation",
//                     body: `Testing navigation to ${screen}`,
//                     data: { 
//                         screen: screen,
//                         params: {
//                             scheduleId: "6923d418b5c829ae8cb52670",
//                             requestId: "6923d545dfeb9ec7850247b0",
//                             hostId: "68844853b4c35a50a4de2830",
//                             ...params
//                         }
//                     },
//                     sound: true,
//                 },
//                 trigger: null, // Send immediately
//             });
//             console.log(`✅ Test notification sent for screen: ${screen}`);
//             alert(`Test notification sent for: ${screen}`);
//         } catch (error) {
//             console.error('❌ Failed to send test notification:', error);
//             alert('Failed to send test notification: ' + error.message);
//         }
//     };

//     // Specific test functions for common routes
//     const testScheduleReviewNotification = () => {
//         sendTestNotification('cleaner_schedule_review', {
//             scheduleId: "692871b16ef2b8a46dc2d946",
//             requestId: "692872ddd87e7aa66a16c4c6", 
//             hostId: "68844853b4c35a50a4de2830"
//         });
//     };

//     const testAllRequestsNotification = () => {
//         sendTestNotification('cleaner_all_requests');
//     };

//     const testChatNotification = () => {
//         sendTestNotification('chat_conversation', {
//             chatroomId: "test_chat_123",
//             selectedUser: { name: "Test User", userId: "user_123" },
//             fbaseUser: { name: "Current User", userId: "current_123" },
//             schedule: { id: "schedule_123" },
//             friendIndex: 0
//         });
//     };

//     return {
//         expoPushToken,
//         registerForPushNotificationsAsync,
//         getTestToken,
//         sendTestNotification,
//         testScheduleReviewNotification,
//         testAllRequestsNotification,
//         testChatNotification,
//         handleNotificationResponse,
//         loading,
//         error
//     };
// }



// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
// import { useState, useEffect } from 'react';
// import { Linking } from 'react-native';
// import { navigate } from './navigationService';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import userService from '../services/connection/userService';

// // Enhanced debug logger
// const debugLog = async (type, message, data = null) => {
//   const timestamp = new Date().toISOString();
//   const logEntry = {
//     timestamp,
//     type,
//     message,
//     data,
//     source: 'useNotificationHook'
//   };
  
//   console.log(`🔔 [${type.toUpperCase()}] ${message}`, data ? data : '');
  
//   // Save to AsyncStorage for persistent logs
//   try {
//     const logs = await AsyncStorage.getItem('notificationDebugLogs');
//     const existingLogs = logs ? JSON.parse(logs) : [];
//     existingLogs.push(logEntry);
//     if (existingLogs.length > 100) existingLogs.shift(); // Keep only last 100 entries
//     await AsyncStorage.setItem('notificationDebugLogs', JSON.stringify(existingLogs));
//   } catch (error) {
//     console.log('Failed to save debug log:', error);
//   }
// };

// const notificationDataToURL = (data) => {
//     if (!data) {
//         debugLog('warning', 'notificationDataToURL called with null data');
//         return null;
//     }
  
//     const { screen, params } = data;
    
//     debugLog('info', `Converting notification data to URL`, { screen, params });
    
//     // Map screen names to deep link URLs
//     switch (screen) {
//       // Cleaner routes
//       case 'cleaner_schedule_review':
//         const scheduleReviewUrl = `freshsweeper://schedule-review/${params?.scheduleId}?` +
//                `requestId=${params?.requestId}&` +
//                `hostId=${params?.hostId}`;
//         debugLog('success', `Generated cleaner_schedule_review URL`, { 
//             screen, 
//             params, 
//             url: scheduleReviewUrl 
//         });
//         return scheduleReviewUrl;

//       case 'cleaner_all_requests':
//         debugLog('success', 'Generated cleaner_all_requests URL');
//         return 'freshsweeper://all-requests';

//       case 'cleaner_schedule_details_view':
//         debugLog('success', 'Generated cleaner_schedule_details_view URL');
//         return `freshsweeper://schedule-details/${params?.scheduleId}`;

//       case 'cleaner_clock_in':
//         debugLog('success', 'Generated cleaner_clock_in URL');
//         return `freshsweeper://clock-in/${params?.scheduleId}`;

//       case 'cleaner_attach_task_photos':
//         debugLog('success', 'Generated cleaner_attach_task_photos URL');
//         return `freshsweeper://attach-photos/${params?.scheduleId}`;

//       // Host routes
//       case 'host_schedule_details':
//         debugLog('success', 'Generated host_schedule_details URL');
//         return `freshsweeper://host-schedule/${params?.scheduleId}`;

//       case 'host_confirm':
//         debugLog('success', 'Generated host_confirm URL');
//         return `freshsweeper://confirm-request/${params?.requestId}`;

//       case 'host_task_progress':
//         debugLog('success', 'Generated host_task_progress URL');
//         return `freshsweeper://task-progress/${params?.scheduleId}`;

//       // Chat routes
//       case 'chat_conversation':
//         const chatUrl = `freshsweeper://chat/${params?.chatroomId}?` +
//                `selectedUser=${encodeURIComponent(JSON.stringify(params?.selectedUser))}&` +
//                `fbaseUser=${encodeURIComponent(JSON.stringify(params?.fbaseUser))}&` +
//                `schedule=${encodeURIComponent(JSON.stringify(params?.schedule))}&` +
//                `friendIndex=${params?.friendIndex}`;
//         debugLog('success', 'Generated chat_conversation URL', { url: chatUrl });
//         return chatUrl;

//       // Common routes
//       case 'notification':
//         debugLog('success', 'Generated notification URL');
//         return 'freshsweeper://notifications';

//       case 'cleaner_dashboard':
//       case 'host_dashboard':
//       default:
//         debugLog('info', 'Using default home URL');
//         return 'freshsweeper://home';
//     }
// };

// export function useNotification() {
//     const [expoPushToken, setExpoPushToken] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);

//     const registerForPushNotificationsAsync = async (userId) => {
//         if (!userId) {
//             debugLog('error', 'User ID is required for registering push notifications');
//             setError('User ID is required.');
//             return;
//         }
        
//         try {
//             setLoading(true);
//             setError(null);

//             debugLog('info', 'Starting Push Notification Registration', { userId });
            
//             // Generate push token using Expo's service
//             const token = await generateNewPushToken();
//             debugLog('info', 'Generated push token', { token: token ? '✅ Received' : '❌ Failed' });

//             if (token) {
//                 // Save the token locally
//                 await AsyncStorage.setItem('expoPushToken', token);
                
//                 // Send the token to your backend
//                 await sendTokenToBackend(token, userId);
                
//                 setExpoPushToken(token);
//                 debugLog('success', 'Push notification registration successful', { token: token.substring(0, 20) + '...' });
//             } else {
//                 throw new Error('Failed to generate push token');
//             }
//         } catch (error) {
//             debugLog('error', 'Error registering for push notifications', { error: error.message });
//             setError(error.message || 'Failed to register for push notifications');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const generateNewPushToken = async () => {
//         try {
//             debugLog('info', 'Requesting notification permissions...');
            
//             const { status } = await Notifications.requestPermissionsAsync();
//             debugLog('info', 'Permission result', { status });
            
//             if (status !== 'granted') {
//                 debugLog('error', 'Notification permission denied', { status });
//                 alert(`Permission denied: ${status}`);
//                 return null;
//             }
            
//             debugLog('info', 'Generating push token...');
//             const tokenData = await Notifications.getExpoPushTokenAsync({
//                 projectId: "a0e21e18-12cb-4043-ac87-18931f1f29bc"
//             });
            
//             debugLog('success', 'Token generated successfully', { 
//                 token: tokenData.data.substring(0, 20) + '...' 
//             });
//             return tokenData.data;
            
//         } catch (error) {
//             debugLog('error', 'Error generating push token', { error: error.message });
//             return null;
//         }
//     };

//     const sendTokenToBackend = async (token, userId) => {
//         try {
//             const deviceInfo = {
//                 deviceName: Device.deviceName || 'Unknown Device',
//                 osType: Device.osName || 'Unknown OS',
//                 osVersion: Device.osVersion || 'Unknown Version',
//                 token: token,
//                 userId: userId,
//             };
            
//             debugLog('info', 'Sending device info to backend', {
//                 deviceName: deviceInfo.deviceName,
//                 osType: deviceInfo.osType,
//                 userId: deviceInfo.userId
//             });
    
//             const response = await userService.storeToken(deviceInfo);
//             debugLog('success', 'Token successfully sent to backend', { 
//                 response: response.data 
//             });
//         } catch (error) {
//             debugLog('error', 'Error sending token to backend', { 
//                 error: error.message || error 
//             });
//             throw error;
//         }
//     };

//     // Enhanced notification response handler with detailed logging
//     const handleNotificationResponse = (response) => {
//         debugLog('info', '🎯 NOTIFICATION TAPPED - Response received', {
//             hasResponse: !!response,
//             hasNotification: !!response?.notification,
//             hasRequest: !!response?.notification?.request
//         });

//         const data = response?.notification?.request?.content?.data;
//         debugLog('info', '📋 Raw notification data extracted', data);

//         if (data) {
//             debugLog('success', '✅ Notification data found', {
//                 screen: data.screen,
//                 params: data.params,
//                 dataStructure: Object.keys(data)
//             });

//             // Special logging for cleaner_schedule_review
//             if (data.screen === 'cleaner_schedule_review') {
//                 debugLog('highlight', '🚀 CLEANER_SCHEDULE_REVIEW NOTIFICATION DETECTED', {
//                     screen: data.screen,
//                     params: data.params,
//                     hasScheduleId: !!data.params?.scheduleId,
//                     hasRequestId: !!data.params?.requestId,
//                     hasHostId: !!data.params?.hostId
//                 });
//             }

//             // Try deep linking first
//             const url = notificationDataToURL(data);
//             debugLog('info', '🔗 Deep link URL generated', { url });
            
//             if (url) {
//                 debugLog('info', 'Attempting to open URL via deep linking...');
//                 // Use deep linking to navigate
//                 Linking.openURL(url).then(() => {
//                     debugLog('success', 'Deep link URL opened successfully', { url });
//                 }).catch(err => {
//                     debugLog('error', 'Error opening URL via deep link', { 
//                         error: err.message,
//                         url 
//                     });
//                     // Fallback to direct navigation
//                     debugLog('info', 'Falling back to direct navigation...');
//                     handleDirectNavigation(data);
//                 });
//             } else {
//                 debugLog('warning', 'No URL generated from notification data, using direct navigation');
//                 handleDirectNavigation(data);
//             }
//         } else {
//             debugLog('error', '❌ No data found in notification response');
//         }
//     };

//     // Enhanced direct navigation fallback with detailed logging
//     const handleDirectNavigation = (data) => {
//         const { screen, params } = data;
        
//         debugLog('info', '🎯 DIRECT NAVIGATION STARTED', {
//             screen,
//             params,
//             hasScreen: !!screen,
//             hasParams: !!params
//         });

//         if (screen) {
//             // Special logging for cleaner_schedule_review
//             if (screen === 'cleaner_schedule_review') {
//                 debugLog('highlight', '🚀 NAVIGATING TO CLEANER_SCHEDULE_REVIEW', {
//                     screen,
//                     params,
//                     scheduleId: params?.scheduleId,
//                     requestId: params?.requestId,
//                     hostId: params?.hostId
//                 });
//             }

//             debugLog('success', `📱 Navigating to screen: ${screen}`, { params });
            
//             // Navigate directly using the navigation service
//             navigate(screen, params);
            
//             debugLog('success', `✅ Navigation command sent for: ${screen}`);
//         } else {
//             debugLog('error', '❌ No screen specified in notification data');
//             // Fallback to home
//             const fallbackScreen = 'cleaner_dashboard'; // or 'host_dashboard' based on user type
//             debugLog('info', `Using fallback navigation to: ${fallbackScreen}`);
//             navigate(fallbackScreen);
//         }
//     };

//     const handleNotification = (notification) => {
//         debugLog('info', '📲 Notification received in foreground', {
//             title: notification?.request?.content?.title,
//             body: notification?.request?.content?.body,
//             data: notification?.request?.content?.data
//         });
//         // You can show custom in-app notifications here if needed
//     };

//     // Enhanced initial notification handler
//     const handleInitialNotification = async () => {
//         try {
//             debugLog('info', 'Checking for initial notification...');
//             const initialNotification = await Notifications.getLastNotificationResponseAsync();
            
//             if (initialNotification) {
//                 debugLog('success', '📱 App was opened from notification', {
//                     hasData: !!initialNotification?.notification?.request?.content?.data
//                 });
                
//                 // Small delay to ensure navigation is ready
//                 setTimeout(() => {
//                     debugLog('info', 'Processing initial notification after delay...');
//                     handleNotificationResponse(initialNotification);
//                 }, 1000);
//             } else {
//                 debugLog('info', 'No initial notification found');
//             }
//         } catch (error) {
//             debugLog('error', 'Error handling initial notification', { 
//                 error: error.message 
//             });
//         }
//     };

//     // Function to view debug logs
//     const viewDebugLogs = async () => {
//         try {
//             const logs = await AsyncStorage.getItem('notificationDebugLogs');
//             const parsedLogs = logs ? JSON.parse(logs) : [];
//             console.log('📊 NOTIFICATION DEBUG LOGS:', parsedLogs);
//             alert(`Check console for debug logs. Total entries: ${parsedLogs.length}`);
//             return parsedLogs;
//         } catch (error) {
//             console.error('Error reading debug logs:', error);
//         }
//     };

//     // Function to clear debug logs
//     const clearDebugLogs = async () => {
//         try {
//             await AsyncStorage.removeItem('notificationDebugLogs');
//             debugLog('info', 'Debug logs cleared by user');
//             console.log('🗑️ Debug logs cleared');
//             alert('Debug logs cleared');
//         } catch (error) {
//             console.error('Error clearing debug logs:', error);
//         }
//     };

//     useEffect(() => {
//         debugLog('info', 'useNotification hook initialized');
        
//         // Setup notification handlers
//         Notifications.setNotificationHandler({
//             handleNotification: async () => ({
//                 shouldShowAlert: true,
//                 shouldPlaySound: true,
//                 shouldSetBadge: true,
//             }),
//         });

//         // Handle initial notification
//         handleInitialNotification();

//         // Listeners for notification events
//         const notificationListener = Notifications.addNotificationReceivedListener(handleNotification);
//         const responseListener = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

//         debugLog('info', 'Notification listeners added');

//         // Clean up listeners on unmount
//         return () => {
//             Notifications.removeNotificationSubscription(notificationListener);
//             Notifications.removeNotificationSubscription(responseListener);
//             debugLog('info', 'Notification listeners cleaned up');
//         };
//     }, []);

//     // Test function to get token quickly
//     const getTestToken = async () => {
//         try {
//             setLoading(true);
//             const token = await generateNewPushToken();
            
//             if (token) {
//                 setExpoPushToken(token);
//                 debugLog('success', 'Test token generated', { 
//                     token: token.substring(0, 20) + '...' 
//                 });
//                 alert(`Expo Push Token:\n\n${token}\n\n📋 Check console for easy copying`);
//                 console.log('🔔 Expo Push Token:', token);
//                 return token;
//             }
//         } catch (error) {
//             debugLog('error', 'Error getting test token', { error: error.message });
//             alert('Error: ' + error.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Enhanced test notification with detailed logging
//     const sendTestNotification = async (screen = 'cleaner_schedule_review', params = {}) => {
//         try {
//             const testParams = {
//                 scheduleId: "6923d418b5c829ae8cb52670",
//                 requestId: "6923d545dfeb9ec7850247b0", 
//                 hostId: "68844853b4c35a50a4de2830",
//                 ...params
//             };

//             debugLog('info', 'Sending test notification', { screen, params: testParams });
            
//             await Notifications.scheduleNotificationAsync({
//                 content: {
//                     title: "Test Navigation",
//                     body: `Testing navigation to ${screen}`,
//                     data: { 
//                         screen: screen,
//                         params: testParams
//                     },
//                     sound: true,
//                 },
//                 trigger: null, // Send immediately
//             });
            
//             debugLog('success', `✅ Test notification sent for screen: ${screen}`, {
//                 screen,
//                 params: testParams
//             });
//             alert(`Test notification sent for: ${screen}\nCheck logs for details.`);
//         } catch (error) {
//             debugLog('error', 'Failed to send test notification', { 
//                 error: error.message,
//                 screen 
//             });
//             alert('Failed to send test notification: ' + error.message);
//         }
//     };

//     // Specific test functions for common routes
//     const testScheduleReviewNotification = () => {
//         debugLog('info', 'Testing cleaner_schedule_review notification');
//         sendTestNotification('cleaner_schedule_review', {
//             scheduleId: "692871b16ef2b8a46dc2d946",
//             requestId: "692872ddd87e7aa66a16c4c6", 
//             hostId: "68844853b4c35a50a4de2830"
//         });
//     };

//     const testAllRequestsNotification = () => {
//         debugLog('info', 'Testing cleaner_all_requests notification');
//         sendTestNotification('cleaner_all_requests');
//     };

//     const testChatNotification = () => {
//         debugLog('info', 'Testing chat_conversation notification');
//         sendTestNotification('chat_conversation', {
//             chatroomId: "test_chat_123",
//             selectedUser: { name: "Test User", userId: "user_123" },
//             fbaseUser: { name: "Current User", userId: "current_123" },
//             schedule: { id: "schedule_123" },
//             friendIndex: 0
//         });
//     };

//     return {
//         expoPushToken,
//         registerForPushNotificationsAsync,
//         getTestToken,
//         sendTestNotification,
//         testScheduleReviewNotification,
//         testAllRequestsNotification,
//         testChatNotification,
//         handleNotificationResponse,
//         viewDebugLogs,
//         clearDebugLogs,
//         loading,
//         error
//     };
// }









// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
// import { useState, useEffect } from 'react';
// import { AppState } from 'react-native';
// import { navigate } from './navigationService';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import userService from '../services/connection/userService';
// import ROUTES from '../constants/routes'; // Import your routes
// import { Linking } from 'react-native'; // Add this import

// // Enhanced debug logger
// const debugLog = async (type, message, data = null) => {
//   const timestamp = new Date().toISOString();
//   const logEntry = {
//     timestamp,
//     type,
//     message,
//     data,
//     source: 'useNotificationHook'
//   };
  
//   console.log(`🔔 [${type.toUpperCase()}] ${message}`, data ? data : '');
  
//   // Save to AsyncStorage for persistent logs
//   try {
//     const logs = await AsyncStorage.getItem('notificationDebugLogs');
//     const existingLogs = logs ? JSON.parse(logs) : [];
//     existingLogs.push(logEntry);
//     if (existingLogs.length > 100) existingLogs.shift();
//     await AsyncStorage.setItem('notificationDebugLogs', JSON.stringify(existingLogs));
//   } catch (error) {
//     console.log('Failed to save debug log:', error);
//   }
// };

// export function useNotification() {
//     const [expoPushToken, setExpoPushToken] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [appState, setAppState] = useState(AppState.currentState);

//     // Track app state
//     useEffect(() => {
//         const subscription = AppState.addEventListener('change', nextAppState => {
//             setAppState(nextAppState);
//             debugLog('info', 'App state changed', { from: appState, to: nextAppState });
//         });

//         return () => {
//             subscription.remove();
//         };
//     }, [appState]);

//     const registerForPushNotificationsAsync = async (userId) => {
//         if (!userId) {
//             debugLog('error', 'User ID is required for registering push notifications');
//             setError('User ID is required.');
//             return;
//         }
        
//         try {
//             setLoading(true);
//             setError(null);

//             debugLog('info', 'Starting Push Notification Registration', { userId });
            
//             const token = await generateNewPushToken();
//             debugLog('info', 'Generated push token', { token: token ? '✅ Received' : '❌ Failed' });

//             if (token) {
//                 await AsyncStorage.setItem('expoPushToken', token);
//                 await sendTokenToBackend(token, userId);
//                 setExpoPushToken(token);
//                 debugLog('success', 'Push notification registration successful', { token: token.substring(0, 20) + '...' });
//             } else {
//                 throw new Error('Failed to generate push token');
//             }
//         } catch (error) {
//             debugLog('error', 'Error registering for push notifications', { error: error.message });
//             setError(error.message || 'Failed to register for push notifications');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const generateNewPushToken = async () => {
//         try {
//             debugLog('info', 'Requesting notification permissions...');
            
//             const { status } = await Notifications.requestPermissionsAsync();
//             debugLog('info', 'Permission result', { status });
            
//             if (status !== 'granted') {
//                 debugLog('error', 'Notification permission denied', { status });
//                 alert(`Permission denied: ${status}`);
//                 return null;
//             }
            
//             debugLog('info', 'Generating push token...');
//             const tokenData = await Notifications.getExpoPushTokenAsync({
//                 projectId: "a0e21e18-12cb-4043-ac87-18931f1f29bc"
//             });
            
//             debugLog('success', 'Token generated successfully', { 
//                 token: tokenData.data.substring(0, 20) + '...' 
//             });
//             return tokenData.data;
            
//         } catch (error) {
//             debugLog('error', 'Error generating push token', { error: error.message });
//             return null;
//         }
//     };

//     const sendTokenToBackend = async (token, userId) => {
//         try {
//             const deviceInfo = {
//                 deviceName: Device.deviceName || 'Unknown Device',
//                 osType: Device.osName || 'Unknown OS',
//                 osVersion: Device.osVersion || 'Unknown Version',
//                 token: token,
//                 userId: userId,
//             };
            
//             debugLog('info', 'Sending device info to backend', {
//                 deviceName: deviceInfo.deviceName,
//                 osType: deviceInfo.osType,
//                 userId: deviceInfo.userId
//             });
    
//             const response = await userService.storeToken(deviceInfo);
//             debugLog('success', 'Token successfully sent to backend', { 
//                 response: response.data 
//             });
//         } catch (error) {
//             debugLog('error', 'Error sending token to backend', { 
//                 error: error.message || error 
//             });
//             throw error;
//         }
//     };


//     // Enhanced notification response handler - HYBRID APPROACH
//     const handleNotificationResponse = (response) => {
//         debugLog('info', '🎯 NOTIFICATION TAPPED - Response received', {
//             hasResponse: !!response,
//             hasNotification: !!response?.notification,
//             hasRequest: !!response?.notification?.request,
//             appState: appState
//         });

//         const data = response?.notification?.request?.content?.data;
//         debugLog('info', '📋 Raw notification data extracted', data);

//         if (data) {
//             debugLog('success', '✅ Notification data found', {
//                 screen: data.screen,
//                 params: data.params,
//                 dataStructure: Object.keys(data)
//             });

//             // Special logging for cleaner_schedule_review
//             // if (data.screen === 'Review & Confirm Schedule' || data.screen === 'cleaner_schedule_review') {
//             if (data.screen === 'Review & Confirm Schedule' || data.screen === 'cleaner_schedule_review' || data.screen === 'Schedule Requests'  || data.screen === 'host_schedule_request' || data.screen === 'Schedule Info' || data.screen ==='cleaner_schedule_details_view' ) {
//                 debugLog('highlight', '🚀 CLEANER_SCHEDULE_REVIEW NOTIFICATION DETECTED', {
//                     screen: data.screen,
//                     params: data.params,
//                     hasScheduleId: !!data.params?.scheduleId,
//                     hasRequestId: !!data.params?.requestId,
//                     hasHostId: !!data.params?.hostId
//                 });
//             }

//             // HYBRID APPROACH: Use deep linking for web-originated notifications, 
//             // direct navigation for push notifications
//             const isWebOriginated = data.source === 'web' || data.fromWeb === true;
            
//             if (isWebOriginated && data.deepLinkUrl) {
//                 debugLog('info', '🌐 Web-originated notification, using deep linking', {
//                     deepLinkUrl: data.deepLinkUrl
//                 });
//                 handleDeepLinkNavigation(data.deepLinkUrl, data);
//             } else {
//                 debugLog('info', '📱 Push notification, using direct navigation');
//                 handleDirectNavigation(data);
//             }
//         } else {
//             debugLog('error', '❌ No data found in notification response');
//         }
//     };


//     const screenNameToRouteMap = {
//         // Backend screen names → Route names
//         'Review & Confirm Schedule': ROUTES.cleaner_schedule_review,
//         'Schedule Requests': ROUTES.host_schedule_request,  // Fixed typo
//         'Schedule Resquests': ROUTES.host_schedule_request,  // Keep for backward compatibility
//         'Schedule Info': ROUTES.cleaner_schedule_details_view,
//         'All Requests': ROUTES.cleaner_all_requests,
//         'Clock-In': ROUTES.cleaner_clock_in,
//         'Clock In': ROUTES.cleaner_clock_in,  // Alternative format
//         'Attach Task Photos': ROUTES.cleaner_attach_task_photos,
//         'Schedule Details': ROUTES.host_schedule_details,
//         'Confirm Request': ROUTES.host_confirm,
//         'Task Progress': ROUTES.host_task_progress,
//         'Chat Conversation': ROUTES.chat_conversation,
//         'Chat': ROUTES.chat_conversation,  // Alternative
//         'Notification': ROUTES.notification,
//         'Notifications': ROUTES.notification,  // Alternative
//         'Home': ROUTES.cleaner_dashboard,
//         'Dashboard': ROUTES.cleaner_dashboard,  // Alternative
//         'Cleaner Dashboard': ROUTES.cleaner_dashboard,
//         'Host Dashboard': ROUTES.host_dashboard,
//         'Profile': ROUTES.profile,  // Add if exists
//         'Settings': ROUTES.settings,  // Add if exists
//     };
    
//     // Also update screenKeyToRouteMap for consistency
//     const screenKeyToRouteMap = {
//         'cleaner_schedule_review': ROUTES.cleaner_schedule_review,
//         'host_schedule_request': ROUTES.host_schedule_request,
//         'cleaner_schedule_details_view': ROUTES.cleaner_schedule_details_view,
//         'cleaner_all_requests': ROUTES.cleaner_all_requests,
//         'cleaner_clock_in': ROUTES.cleaner_clock_in,
//         'cleaner_attach_task_photos': ROUTES.cleaner_attach_task_photos,
//         'host_schedule_details': ROUTES.host_schedule_details,
//         'host_confirm': ROUTES.host_confirm,
//         'host_task_progress': ROUTES.host_task_progress,
//         'chat_conversation': ROUTES.chat_conversation,
//         'notification': ROUTES.notification,
//         'cleaner_dashboard': ROUTES.cleaner_dashboard,
//         'host_dashboard': ROUTES.host_dashboard,
//         'profile': ROUTES.profile,  // Add if exists
//         'settings': ROUTES.settings,  // Add if exists
//     };

//     const handleDirectNavigation = async (data) => {
//         let { screen, params } = data;
        
//         debugLog('info', '🎯 DIRECT NAVIGATION STARTED', {
//             receivedScreen: screen,
//             params,
//             hasScreen: !!screen,
//             hasParams: !!params,
//             appState: appState
//         });
    
//         if (screen) {
//             // Trim and clean the screen name
//             screen = screen.trim();
            
//             // Try multiple mapping approaches
//             let actualScreenName = null;
            
//             // 1. Try exact match in screenNameToRouteMap
//             actualScreenName = screenNameToRouteMap[screen];
            
//             // 2. Try exact match in screenKeyToRouteMap
//             if (!actualScreenName) {
//                 actualScreenName = screenKeyToRouteMap[screen];
//             }
            
//             // 3. Try case-insensitive match
//             if (!actualScreenName) {
//                 const lowerScreen = screen.toLowerCase();
//                 for (const [key, route] of Object.entries(screenNameToRouteMap)) {
//                     if (key.toLowerCase() === lowerScreen) {
//                         actualScreenName = route;
//                         break;
//                     }
//                 }
//             }
            
//             // 4. Try partial match
//             if (!actualScreenName) {
//                 const searchTerms = ['schedule', 'request', 'chat', 'confirm', 'task', 'clock'];
//                 for (const term of searchTerms) {
//                     if (screen.toLowerCase().includes(term)) {
//                         // Find the best match
//                         for (const [key, route] of Object.entries(screenNameToRouteMap)) {
//                             if (key.toLowerCase().includes(term)) {
//                                 actualScreenName = route;
//                                 debugLog('info', `Partial match found for ${screen} → ${key}`);
//                                 break;
//                             }
//                         }
//                         if (actualScreenName) break;
//                     }
//                 }
//             }
            
//             // 5. If still no match, use the received screen as fallback
//             if (!actualScreenName) {
//                 actualScreenName = screen;
//                 debugLog('warning', `No mapping found for screen: ${screen}, using direct navigation`);
//             }
            
//             debugLog('info', '🔄 Screen mapping result', {
//                 receivedScreen: screen,
//                 actualScreenName,
//                 mappingSuccess: actualScreenName !== screen
//             });
    
//             // Special logging for important screens
//             if (screen.includes('Schedule') || screen.includes('Request')) {
//                 debugLog('highlight', '🚀 SCHEDULE/REQUEST NOTIFICATION', {
//                     originalScreen: screen,
//                     mappedScreen: actualScreenName,
//                     params: params,
//                     navigationReady: true
//                 });
//             }
    
//             // Navigate
//             try {
//                 debugLog('success', `📱 Navigating to: ${actualScreenName}`, { 
//                     originalScreen: screen,
//                     params: params,
//                     navigationMethod: 'direct',
//                     timestamp: new Date().toISOString()
//                 });
                
//                 navigate(actualScreenName, params);
                
//                 debugLog('success', `✅ Navigation command sent`, {
//                     screen: actualScreenName,
//                     paramsCount: params ? Object.keys(params).length : 0,
//                     navigationTime: new Date().toISOString()
//                 });
//             } catch (navigationError) {
//                 debugLog('error', 'Navigation failed', {
//                     screen: actualScreenName,
//                     originalScreen: screen,
//                     error: navigationError.message
//                 });
                
//                 // Ultimate fallback - go to appropriate dashboard based on user type
//                 const userType = await getUserType(); // You'll need to implement this
//                 const fallbackScreen = userType === 'cleaner' 
//                     ? ROUTES.cleaner_dashboard 
//                     : ROUTES.host_dashboard;
                
//                 debugLog('warning', `Using ultimate fallback to: ${fallbackScreen}`);
//                 navigate(fallbackScreen);
//             }
//         } else {
//             debugLog('error', '❌ No screen specified in notification data');
//             // Fallback to appropriate dashboard
//             const userType = await getUserType();
//             const fallbackScreen = userType === 'cleaner' 
//                 ? ROUTES.cleaner_dashboard 
//                 : ROUTES.host_dashboard;
//             navigate(fallbackScreen);
//         }
//     };

//     // Helper function to get user type
//     const getUserType = async () => {
//         try {
//             const userType = await AsyncStorage.getItem('userType');
//             return userType || 'cleaner'; // Default to cleaner
//         } catch (error) {
//             return 'cleaner';
//         }
//     };
  

//     // Add this to your test functions
// const testAllNotificationTypes = () => {
//     const testCases = [
//         { screen: 'Schedule Requests', params: { scheduleId: 'test_123', requestId: 'req_123' } },
//         { screen: 'Schedule Info', params: { scheduleId: 'test_123' } },
//         { screen: 'All Requests', params: {} },
//         { screen: 'Clock-In', params: { scheduleId: 'test_123' } },
//         { screen: 'Chat Conversation', params: { chatroomId: 'chat_123' } },
//         { screen: 'Task Progress', params: { scheduleId: 'test_123' } },
//         { screen: 'Confirm Request', params: { requestId: 'req_123' } },
//     ];
    
//     testCases.forEach((testCase, index) => {
//         setTimeout(() => {
//             debugLog('info', `Testing notification ${index + 1}: ${testCase.screen}`);
//             sendTestNotification(testCase.screen, testCase.params);
//         }, index * 2000); // Stagger notifications by 2 seconds
//     });
// };

// // Add to return statement
// return {
//     // ... existing returns
//     testAllNotificationTypes,
// };

//     // Enhanced direct navigation fallback with detailed logging
//     // const handleDirectNavigation = (data) => {
//     //     let { screen, params } = data;
        
//     //     debugLog('info', '🎯 DIRECT NAVIGATION STARTED', {
//     //         receivedScreen: screen,
//     //         params,
//     //         hasScreen: !!screen,
//     //         hasParams: !!params,
//     //         appState: appState
//     //     });
    
//     //     if (screen) {
//     //         // Create a reverse mapping from screen names to route names
//     //         const screenNameToRouteMap = {
//     //             // Backend screen names → Route names
//     //             'Review & Confirm Schedule': ROUTES.cleaner_schedule_review,
//     //             'Schedule Requests': ROUTES.host_schedule_request,  // Fixed typo
//     //             'Schedule Resquests': ROUTES.host_schedule_request,  // Keep for backward compatibility
//     //             'Schedule Info': ROUTES.cleaner_schedule_details_view,
//     //             'All Requests': ROUTES.cleaner_all_requests,
//     //             'Clock-In': ROUTES.cleaner_clock_in,
//     //             'Clock In': ROUTES.cleaner_clock_in,  // Alternative format
//     //             'Attach Task Photos': ROUTES.cleaner_attach_task_photos,
//     //             'Schedule Details': ROUTES.host_schedule_details,
//     //             'Confirm Request': ROUTES.host_confirm,
//     //             'Task Progress': ROUTES.host_task_progress,
//     //             'Chat Conversation': ROUTES.chat_conversation,
//     //             'Chat': ROUTES.chat_conversation,  // Alternative
//     //             'Notification': ROUTES.notification,
//     //             'Notifications': ROUTES.notification,  // Alternative
//     //             'Home': ROUTES.cleaner_dashboard,
//     //             'Dashboard': ROUTES.cleaner_dashboard,  // Alternative
//     //             'Cleaner Dashboard': ROUTES.cleaner_dashboard,
//     //             'Host Dashboard': ROUTES.host_dashboard,
//     //             'Profile': ROUTES.profile,  // Add if exists
//     //             'Settings': ROUTES.settings,  // Add if exists
//     //         };
            
//     //         // Also update screenKeyToRouteMap for consistency
//     //         const screenKeyToRouteMap = {
//     //             'cleaner_schedule_review': ROUTES.cleaner_schedule_review,
//     //             'host_schedule_request': ROUTES.host_schedule_request,
//     //             'cleaner_schedule_details_view': ROUTES.cleaner_schedule_details_view,
//     //             'cleaner_all_requests': ROUTES.cleaner_all_requests,
//     //             'cleaner_clock_in': ROUTES.cleaner_clock_in,
//     //             'cleaner_attach_task_photos': ROUTES.cleaner_attach_task_photos,
//     //             'host_schedule_details': ROUTES.host_schedule_details,
//     //             'host_confirm': ROUTES.host_confirm,
//     //             'host_task_progress': ROUTES.host_task_progress,
//     //             'chat_conversation': ROUTES.chat_conversation,
//     //             'notification': ROUTES.notification,
//     //             'cleaner_dashboard': ROUTES.cleaner_dashboard,
//     //             'host_dashboard': ROUTES.host_dashboard,
//     //             'profile': ROUTES.profile,  // Add if exists
//     //             'settings': ROUTES.settings,  // Add if exists
//     //         };
    
//     //         // Try backend screen name first, then screen key, then fallback to received screen
//     //         const actualScreenName = screenNameToRouteMap[screen] || screenKeyToRouteMap[screen] || screen;
            
//     //         debugLog('info', '🔄 Screen mapping result', {
//     //             receivedScreen: screen,
//     //             actualScreenName,
//     //             mappingType: screenNameToRouteMap[screen] ? 'backend-name' : 
//     //                         screenKeyToRouteMap[screen] ? 'frontend-key' : 'direct'
//     //         });
    
//     //         // Special logging for cleaner_schedule_review (both formats)
//     //         if (screen === 'Review & Confirm Schedule' || screen === 'cleaner_schedule_review' 
//     //             || screen === 'Schedule Requests'  || screen === 'host_schedule_request' 
//     //             || screen === 'Schedule Info' || screen ==='cleaner_schedule_details_view') {
//     //             debugLog('highlight', '🚀 NAVIGATING TO CLEANER_SCHEDULE_REVIEW', {
//     //                 receivedScreen: screen,
//     //                 actualScreenName,
//     //                 params,
//     //                 scheduleId: params?.scheduleId,
//     //                 requestId: params?.requestId,
//     //                 hostId: params?.hostId,
//     //                 allParams: JSON.stringify(params, null, 2)
//     //             });
//     //         }
    
//     //         debugLog('success', `📱 Navigating to screen: ${actualScreenName}`, { 
//     //             receivedScreen: screen,
//     //             actualScreenName,
//     //             params,
//     //             navigationMethod: 'direct',
//     //             timestamp: new Date().toISOString()
//     //         });
            
//     //         // Navigate directly using the navigation service with the actual screen name
//     //         try {
//     //             navigate(actualScreenName, params);
//     //             debugLog('success', `✅ Navigation command sent for: ${actualScreenName}`, {
//     //                 receivedScreen: screen,
//     //                 actualScreenName,
//     //                 paramsCount: params ? Object.keys(params).length : 0,
//     //                 navigationTime: new Date().toISOString()
//     //             });
//     //         } catch (navigationError) {
//     //             debugLog('error', 'Navigation failed', {
//     //                 receivedScreen: screen,
//     //                 actualScreenName,
//     //                 error: navigationError.message,
//     //                 stack: navigationError.stack
//     //             });
                
//     //             // Final fallback to home with detailed logging
//     //             const fallbackScreen = ROUTES.cleaner_dashboard;
//     //             debugLog('warning', `Using fallback navigation to: ${fallbackScreen} due to navigation error`);
//     //             navigate(fallbackScreen);
//     //         }
//     //     } else {
//     //         debugLog('error', '❌ No screen specified in notification data');
//     //         // Fallback to home
//     //         const fallbackScreen = ROUTES.cleaner_dashboard;
//     //         debugLog('info', `Using fallback navigation to: ${fallbackScreen}`);
//     //         navigate(fallbackScreen);
//     //     }
//     // };

//     // Enhanced deep link navigation for web-originated notifications
//     const handleDeepLinkNavigation = async (url, data) => {
//         debugLog('info', '🔗 Handling deep link navigation', { 
//             url, 
//             appState,
//             source: 'web-originated'
//         });

//         try {
//             const canOpen = await Linking.canOpenURL(url);
//             debugLog('info', 'Can open URL check', { canOpen, url });

//             if (canOpen) {
//                 debugLog('info', 'Opening URL via Linking.openURL...');
                
//                 // Use deep linking for web-originated notifications
//                 await Linking.openURL(url);
//                 debugLog('success', 'Deep link URL opened successfully', { 
//                     url,
//                     appState 
//                 });
//             } else {
//                 debugLog('error', 'Cannot open URL, falling back to direct navigation', { url });
//                 handleDirectNavigation(data);
//             }
//         } catch (error) {
//             debugLog('error', 'Error in deep link navigation', { 
//                 error: error.message,
//                 url 
//             });
//             debugLog('info', 'Falling back to direct navigation...');
//             handleDirectNavigation(data);
//         }
//     };

//     const handleNotification = (notification) => {
//         debugLog('info', '📲 Notification received in foreground', {
//             title: notification?.request?.content?.title,
//             body: notification?.request?.content?.body,
//             data: notification?.request?.content?.data,
//             appState: appState
//         });
//         // You can show custom in-app notifications here if needed
//     };

//     // Enhanced initial notification handler
//     const handleInitialNotification = async () => {
//         try {
//             debugLog('info', 'Checking for initial notification...');
//             const initialNotification = await Notifications.getLastNotificationResponseAsync();
            
//             if (initialNotification) {
//                 debugLog('success', '📱 App was opened from notification', {
//                     hasData: !!initialNotification?.notification?.request?.content?.data,
//                     appState: 'initial',
//                     notificationContent: initialNotification?.notification?.request?.content
//                 });
                
//                 // Small delay to ensure navigation is ready
//                 setTimeout(() => {
//                     debugLog('info', 'Processing initial notification after delay...');
//                     handleNotificationResponse(initialNotification);
//                 }, 1500);
//             } else {
//                 debugLog('info', 'No initial notification found');
//             }
//         } catch (error) {
//             debugLog('error', 'Error handling initial notification', { 
//                 error: error.message,
//                 stack: error.stack
//             });
//         }
//     };

//     // Function to view debug logs
//     const viewDebugLogs = async () => {
//         try {
//             const logs = await AsyncStorage.getItem('notificationDebugLogs');
//             const parsedLogs = logs ? JSON.parse(logs) : [];
//             console.log('📊 NOTIFICATION DEBUG LOGS:', parsedLogs);
//             alert(`Check console for debug logs. Total entries: ${parsedLogs.length}`);
//             return parsedLogs;
//         } catch (error) {
//             console.error('Error reading debug logs:', error);
//         }
//     };

//     // Function to clear debug logs
//     const clearDebugLogs = async () => {
//         try {
//             await AsyncStorage.removeItem('notificationDebugLogs');
//             debugLog('info', 'Debug logs cleared by user');
//             console.log('🗑️ Debug logs cleared');
//             alert('Debug logs cleared');
//         } catch (error) {
//             console.error('Error clearing debug logs:', error);
//         }
//     };

//     // Function to get current debug logs count
//     const getDebugLogsCount = async () => {
//         try {
//             const logs = await AsyncStorage.getItem('notificationDebugLogs');
//             const parsedLogs = logs ? JSON.parse(logs) : [];
//             return parsedLogs.length;
//         } catch (error) {
//             console.error('Error getting logs count:', error);
//             return 0;
//         }
//     };

//     useEffect(() => {
//         debugLog('info', 'useNotification hook initialized', {
//             appState: AppState.currentState,
//             timestamp: new Date().toISOString()
//         });
        
//         // Setup notification handlers
//         Notifications.setNotificationHandler({
//             handleNotification: async () => ({
//                 shouldShowAlert: true,
//                 shouldPlaySound: true,
//                 shouldSetBadge: true,
//             }),
//         });

//         // Handle initial notification
//         handleInitialNotification();

//         // Listeners for notification events
//         const notificationListener = Notifications.addNotificationReceivedListener(handleNotification);
//         const responseListener = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

//         debugLog('info', 'Notification listeners added', {
//             hasNotificationListener: !!notificationListener,
//             hasResponseListener: !!responseListener
//         });

//         // Clean up listeners on unmount
//         return () => {
//             if (notificationListener) {
//                 Notifications.removeNotificationSubscription(notificationListener);
//             }
//             if (responseListener) {
//                 Notifications.removeNotificationSubscription(responseListener);
//             }
//             debugLog('info', 'Notification listeners cleaned up');
//         };
//     }, []);

//     // Test function to get token quickly
//     const getTestToken = async () => {
//         try {
//             setLoading(true);
//             const token = await generateNewPushToken();
            
//             if (token) {
//                 setExpoPushToken(token);
//                 debugLog('success', 'Test token generated', { 
//                     token: token.substring(0, 20) + '...' 
//                 });
//                 alert(`Expo Push Token:\n\n${token}\n\n📋 Check console for easy copying`);
//                 console.log('🔔 Expo Push Token:', token);
//                 return token;
//             }
//         } catch (error) {
//             debugLog('error', 'Error getting test token', { error: error.message });
//             alert('Error: ' + error.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Enhanced test notification with detailed logging
//     const sendTestNotification = async (screen = 'cleaner_schedule_review', params = {}) => {
//         try {
//             const testParams = {
//                 scheduleId: "6923d418b5c829ae8cb52670",
//                 requestId: "6923d545dfeb9ec7850247b0", 
//                 hostId: "68844853b4c35a50a4de2830",
//                 ...params
//             };

//             debugLog('info', 'Sending test notification', { 
//                 screen, 
//                 actualRouteName: ROUTES[screen] || screen,
//                 params: testParams,
//                 testType: 'manual'
//             });
            
//             await Notifications.scheduleNotificationAsync({
//                 content: {
//                     title: "Test Navigation",
//                     body: `Testing navigation to ${ROUTES[screen] || screen}`,
//                     data: { 
//                         screen: screen,
//                         params: testParams
//                     },
//                     sound: true,
//                 },
//                 trigger: null, // Send immediately
//             });
            
//             debugLog('success', `✅ Test notification sent for screen: ${screen}`, {
//                 screenKey: screen,
//                 actualRouteName: ROUTES[screen] || screen,
//                 params: testParams,
//                 notificationType: 'test'
//             });
//             alert(`Test notification sent for: ${ROUTES[screen] || screen}\nCheck logs for details.`);
//         } catch (error) {
//             debugLog('error', 'Failed to send test notification', { 
//                 error: error.message,
//                 screen,
//                 actualRouteName: ROUTES[screen] || screen,
//                 stack: error.stack
//             });
//             alert('Failed to send test notification: ' + error.message);
//         }
//     };

//     // Specific test functions for common routes
//     const testScheduleReviewNotification = () => {
//         debugLog('info', 'Testing cleaner_schedule_review notification', {
//             screenKey: 'cleaner_schedule_review',
//             actualRouteName: ROUTES.cleaner_schedule_review
//         });
//         sendTestNotification('cleaner_schedule_review', {
//             scheduleId: "6929d646534802ebd8ca2d89",
//             requestId: "6929d772fea1b69275ca8a36", 
//             hostId: "68844853b4c35a50a4de2830"
//         });
//     };

//     // Test function for backend format (screen names)
//     const testBackendFormatNotification = () => {
//         debugLog('info', 'Testing BACKEND FORMAT notification', {
//             screenKey: 'Review & Confirm Schedule',
//             actualRouteName: ROUTES.cleaner_schedule_review
//         });
        
//         // Simulate exactly what backend sends
//         sendTestNotification('Review & Confirm Schedule', {
//             scheduleId: "6929d646534802ebd8ca2d89",
//             requestId: "6929d772fea1b69275ca8a36", 
//             hostId: "68844853b4c35a50a4de2830"
//         });
//     };

//     const testAllRequestsNotification = () => {
//         debugLog('info', 'Testing cleaner_all_requests notification', {
//             screenKey: 'cleaner_all_requests',
//             actualRouteName: ROUTES.cleaner_all_requests
//         });
//         sendTestNotification('cleaner_all_requests');
//     };

//     const testChatNotification = () => {
//         debugLog('info', 'Testing chat_conversation notification', {
//             screenKey: 'chat_conversation',
//             actualRouteName: ROUTES.chat_conversation
//         });
//         sendTestNotification('chat_conversation', {
//             chatroomId: "test_chat_123",
//             selectedUser: { name: "Test User", userId: "user_123" },
//             fbaseUser: { name: "Current User", userId: "current_123" },
//             schedule: { id: "schedule_123" },
//             friendIndex: 0
//         });
//     };

//     return {
//         expoPushToken,
//         registerForPushNotificationsAsync,
//         getTestToken,
//         sendTestNotification,
//         testScheduleReviewNotification,
//         testBackendFormatNotification,
//         testAllRequestsNotification,
//         testChatNotification,
//         handleNotificationResponse,
//         viewDebugLogs,
//         clearDebugLogs,
//         getDebugLogsCount,
//         loading,
//         error
//     };
// }









// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
// import { useState, useEffect, useCallback } from 'react';
// import { AppState } from 'react-native';
// import { navigate } from './navigationService';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import userService from '../services/connection/userService';
// import ROUTES from '../constants/routes';
// import { Linking } from 'react-native';

// // Enhanced debug logger
// const debugLog = async (type, message, data = null) => {
//   const timestamp = new Date().toISOString();
//   const logEntry = {
//     timestamp,
//     type,
//     message,
//     data,
//     source: 'useNotificationHook'
//   };
  
//   console.log(`🔔 [${type.toUpperCase()}] ${message}`, data ? data : '');
  
//   try {
//     const logs = await AsyncStorage.getItem('notificationDebugLogs');
//     const existingLogs = logs ? JSON.parse(logs) : [];
//     existingLogs.push(logEntry);
//     if (existingLogs.length > 100) existingLogs.shift();
//     await AsyncStorage.setItem('notificationDebugLogs', JSON.stringify(existingLogs));
//   } catch (error) {
//     console.log('Failed to save debug log:', error);
//   }
// };



// export function useNotification() {
//     const [expoPushToken, setExpoPushToken] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [appState, setAppState] = useState(AppState.currentState);

//     // ========== CORE NOTIFICATION HANDLERS ==========
//     // Define these FIRST to avoid EventEmitter error
//     const handleNotification = useCallback((notification) => {
//         debugLog('info', '📲 Notification received in foreground', {
//             title: notification?.request?.content?.title,
//             body: notification?.request?.content?.body,
//             data: notification?.request?.content?.data,
//             appState: AppState.currentState
//         });
//     }, []);

//     // Enhanced notification response handler - HYBRID APPROACH
//     const handleNotificationResponse = useCallback((response) => {
//         debugLog('info', '🎯 NOTIFICATION TAPPED - Response received', {
//             hasResponse: !!response,
//             hasNotification: !!response?.notification,
//             hasRequest: !!response?.notification?.request,
//             appState: AppState.currentState
//         });

//         const data = response?.notification?.request?.content?.data;
//         debugLog('info', '📋 Raw notification data extracted', data);

//         if (data) {
//             debugLog('success', '✅ Notification data found', {
//                 screen: data.screen,
//                 params: data.params,
//                 dataStructure: Object.keys(data)
//             });

//             if (data.screen === 'Review & Confirm Schedule' || data.screen === 'cleaner_schedule_review' || 
//                 data.screen === 'Schedule Requests' || data.screen === 'host_schedule_request' || 
//                 data.screen === 'Schedule Info' || data.screen ==='cleaner_schedule_details_view' || 
//                 data.screen === 'Payment Receipt' || data.screen ==='host_receipt_details') {
//                 debugLog('highlight', '🚀 SCHEDULE NOTIFICATION DETECTED', {
//                     screen: data.screen,
//                     params: data.params,
//                     hasScheduleId: !!data.params?.scheduleId,
//                     hasRequestId: !!data.params?.requestId,
//                     hasHostId: !!data.params?.hostId
//                 });
//             }

//             const isWebOriginated = data.source === 'web' || data.fromWeb === true;
            
//             if (isWebOriginated && data.deepLinkUrl) {
//                 debugLog('info', '🌐 Web-originated notification, using deep linking', {
//                     deepLinkUrl: data.deepLinkUrl
//                 });
//                 handleDeepLinkNavigation(data.deepLinkUrl, data);
//             } else {
//                 debugLog('info', '📱 Push notification, using direct navigation');
//                 handleDirectNavigation(data);
//             }
//         } else {
//             debugLog('error', '❌ No data found in notification response');
//         }
//     }, []);

//     // Track app state
//     useEffect(() => {
//         const subscription = AppState.addEventListener('change', nextAppState => {
//             setAppState(nextAppState);
//             debugLog('info', 'App state changed', { from: appState, to: nextAppState });
//         });

//         return () => {
//             subscription.remove();
//         };
//     }, [appState]);

//     const registerForPushNotificationsAsync = async (userId) => {
//         if (!userId) {
//             debugLog('error', 'User ID is required for registering push notifications');
//             setError('User ID is required.');
//             return;
//         }
        
//         try {
//             setLoading(true);
//             setError(null);

//             debugLog('info', 'Starting Push Notification Registration', { userId });
            
//             const token = await generateNewPushToken();
//             debugLog('info', 'Generated push token', { token: token ? '✅ Received' : '❌ Failed' });
//             alert(token)
//             if (token) {
//                 await AsyncStorage.setItem('expoPushToken', token);
//                 await sendTokenToBackend(token, userId);
//                 setExpoPushToken(token);
//                 debugLog('success', 'Push notification registration successful', { token: token.substring(0, 20) + '...' });
//             } else {
//                 throw new Error('Failed to generate push token');
//             }
//         } catch (error) {
//             debugLog('error', 'Error registering for push notifications', { error: error.message });
//             setError(error.message || 'Failed to register for push notifications');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const generateNewPushToken = async () => {
//         try {
//             debugLog('info', 'Requesting notification permissions...');
            
//             const { status } = await Notifications.requestPermissionsAsync();
//             debugLog('info', 'Permission result', { status });
            
//             if (status !== 'granted') {
//                 debugLog('error', 'Notification permission denied', { status });
//                 alert(`Permission denied: ${status}`);
//                 return null;
//             }
            
//             debugLog('info', 'Generating push token...');
//             const tokenData = await Notifications.getExpoPushTokenAsync({
//                 projectId: "a0e21e18-12cb-4043-ac87-18931f1f29bc"
//             });
            
//             debugLog('success', 'Token generated successfully', { 
//                 token: tokenData.data.substring(0, 20) + '...' 
//             });
//             return tokenData.data;
            
//         } catch (error) {
//             debugLog('error', 'Error generating push token', { error: error.message });
//             return null;
//         }
//     };

//     const sendTokenToBackend = async (token, userId) => {
        
//         try {
//             const deviceInfo = {
//                 deviceName: Device.deviceName || 'Unknown Device',
//                 osType: Device.osName || 'Unknown OS',
//                 osVersion: Device.osVersion || 'Unknown Version',
//                 token: token,
//                 userId: userId,
//             };

            
//             console.log("Device info", deviceInfo)
//             debugLog('info', 'Sending device info to backend', {
//                 deviceName: deviceInfo.deviceName,
//                 osType: deviceInfo.osType,
//                 userId: deviceInfo.userId
//             });
    
//             const response = await userService.storeToken(deviceInfo);
//             debugLog('success', 'Token successfully sent to backend', { 
//                 response: response.data 
//             });
//             console.log('success', 'Token successfully sent to backend', { 
//                 response: response.data 
//             });
//         } catch (error) {
//             debugLog('error', 'Error sending token to backend', { 
//                 error: error.message || error 
//             });
//             throw error;
//         }
//     };

//     // Screen name mappings
//     const screenNameToRouteMap = {
//         'Review & Confirm Schedule': ROUTES.cleaner_schedule_review,
//         'Schedule Requests': ROUTES.host_schedule_request,
//         'Schedule Resquests': ROUTES.host_schedule_request,
//         'Schedule Info': ROUTES.cleaner_schedule_details_view,
//         'Payment Receipt': ROUTES.host_receipt_details,
//         'All Requests': ROUTES.cleaner_all_requests,
//         'Clock-In': ROUTES.cleaner_clock_in,
//         'Clock In': ROUTES.cleaner_clock_in,
//         'Attach Task Photos': ROUTES.cleaner_attach_task_photos,
//         'Schedule Details': ROUTES.host_schedule_details,
//         'Confirm Request': ROUTES.host_confirm,
//         'Task Progress': ROUTES.host_task_progress,
//         'Chat Conversation': ROUTES.chat_conversation,
//         'Chat': ROUTES.chat_conversation,
//         'Notification': ROUTES.notification,
//         'Notifications': ROUTES.notification,
//         'Home': ROUTES.cleaner_dashboard,
//         'Dashboard': ROUTES.cleaner_dashboard,
//         'Cleaner Dashboard': ROUTES.cleaner_dashboard,
//         'Host Dashboard': ROUTES.host_dashboard,
//         'Profile': ROUTES.profile,
//         'Settings': ROUTES.settings,
//     };
    
//     const screenKeyToRouteMap = {
//         'cleaner_schedule_review': ROUTES.cleaner_schedule_review,
//         'host_schedule_request': ROUTES.host_schedule_request,
//         'cleaner_schedule_details_view': ROUTES.cleaner_schedule_details_view,
//         'host_receipt_details': ROUTES.host_receipt_details,
//         'cleaner_all_requests': ROUTES.cleaner_all_requests,
//         'cleaner_clock_in': ROUTES.cleaner_clock_in,
//         'cleaner_attach_task_photos': ROUTES.cleaner_attach_task_photos,
//         'host_schedule_details': ROUTES.host_schedule_details,
//         'host_confirm': ROUTES.host_confirm,
//         'host_task_progress': ROUTES.host_task_progress,
//         'chat_conversation': ROUTES.chat_conversation,
//         'notification': ROUTES.notification,
//         'cleaner_dashboard': ROUTES.cleaner_dashboard,
//         'host_dashboard': ROUTES.host_dashboard,
//         'profile': ROUTES.profile,
//         'settings': ROUTES.settings,
//     };

//     // Helper function to get user type
//     const getUserType = async () => {
//         try {
//             const userType = await AsyncStorage.getItem('userType');
//             return userType || 'cleaner';
//         } catch (error) {
//             return 'cleaner';
//         }
//     };

//     const handleDirectNavigation = async (data) => {
//         let { screen, params } = data;
        
//         debugLog('info', '🎯 DIRECT NAVIGATION STARTED', {
//             receivedScreen: screen,
//             params,
//             hasScreen: !!screen,
//             hasParams: !!params,
//             appState: AppState.currentState
//         });
    
//         if (screen) {
//             screen = screen.trim();
//             let actualScreenName = null;
            
//             // 1. Try exact match in screenNameToRouteMap
//             actualScreenName = screenNameToRouteMap[screen];
            
//             // 2. Try exact match in screenKeyToRouteMap
//             if (!actualScreenName) {
//                 actualScreenName = screenKeyToRouteMap[screen];
//             }
            
//             // 3. Try case-insensitive match
//             if (!actualScreenName) {
//                 const lowerScreen = screen.toLowerCase();
//                 for (const [key, route] of Object.entries(screenNameToRouteMap)) {
//                     if (key.toLowerCase() === lowerScreen) {
//                         actualScreenName = route;
//                         break;
//                     }
//                 }
//             }
            
//             // 4. Try partial match
//             if (!actualScreenName) {
//                 const searchTerms = ['schedule', 'request', 'chat', 'confirm', 'task', 'clock'];
//                 for (const term of searchTerms) {
//                     if (screen.toLowerCase().includes(term)) {
//                         for (const [key, route] of Object.entries(screenNameToRouteMap)) {
//                             if (key.toLowerCase().includes(term)) {
//                                 actualScreenName = route;
//                                 debugLog('info', `Partial match found for ${screen} → ${key}`);
//                                 break;
//                             }
//                         }
//                         if (actualScreenName) break;
//                     }
//                 }
//             }
            
//             // 5. If still no match, use the received screen as fallback
//             if (!actualScreenName) {
//                 actualScreenName = screen;
//                 debugLog('warning', `No mapping found for screen: ${screen}, using direct navigation`);
//             }
            
//             debugLog('info', '🔄 Screen mapping result', {
//                 receivedScreen: screen,
//                 actualScreenName,
//                 mappingSuccess: actualScreenName !== screen
//             });
    
//             if (screen.includes('Schedule') || screen.includes('Request')) {
//                 debugLog('highlight', '🚀 SCHEDULE/REQUEST NOTIFICATION', {
//                     originalScreen: screen,
//                     mappedScreen: actualScreenName,
//                     params: params,
//                     navigationReady: true
//                 });
//             }
    
//             try {
//                 debugLog('success', `📱 Navigating to: ${actualScreenName}`, { 
//                     originalScreen: screen,
//                     params: params,
//                     navigationMethod: 'direct',
//                     timestamp: new Date().toISOString()
//                 });
                
//                 navigate(actualScreenName, params);
                
//                 debugLog('success', `✅ Navigation command sent`, {
//                     screen: actualScreenName,
//                     paramsCount: params ? Object.keys(params).length : 0,
//                     navigationTime: new Date().toISOString()
//                 });
//             } catch (navigationError) {
//                 debugLog('error', 'Navigation failed', {
//                     screen: actualScreenName,
//                     originalScreen: screen,
//                     error: navigationError.message
//                 });
                
//                 const userType = await getUserType();
//                 const fallbackScreen = userType === 'cleaner' 
//                     ? ROUTES.cleaner_dashboard 
//                     : ROUTES.host_dashboard;
                
//                 debugLog('warning', `Using ultimate fallback to: ${fallbackScreen}`);
//                 navigate(fallbackScreen);
//             }
//         } else {
//             debugLog('error', '❌ No screen specified in notification data');
//             const userType = await getUserType();
//             const fallbackScreen = userType === 'cleaner' 
//                 ? ROUTES.cleaner_dashboard 
//                 : ROUTES.host_dashboard;
//             navigate(fallbackScreen);
//         }
//     };

//     // Enhanced deep link navigation for web-originated notifications
//     const handleDeepLinkNavigation = async (url, data) => {
//         debugLog('info', '🔗 Handling deep link navigation', { 
//             url, 
//             appState: AppState.currentState,
//             source: 'web-originated'
//         });

//         try {
//             const canOpen = await Linking.canOpenURL(url);
//             debugLog('info', 'Can open URL check', { canOpen, url });

//             if (canOpen) {
//                 debugLog('info', 'Opening URL via Linking.openURL...');
//                 await Linking.openURL(url);
//                 debugLog('success', 'Deep link URL opened successfully', { 
//                     url,
//                     appState: AppState.currentState 
//                 });
//             } else {
//                 debugLog('error', 'Cannot open URL, falling back to direct navigation', { url });
//                 handleDirectNavigation(data);
//             }
//         } catch (error) {
//             debugLog('error', 'Error in deep link navigation', { 
//                 error: error.message,
//                 url 
//             });
//             debugLog('info', 'Falling back to direct navigation...');
//             handleDirectNavigation(data);
//         }
//     };

//     // Enhanced initial notification handler
//     const handleInitialNotification = async () => {
//         try {
//             debugLog('info', 'Checking for initial notification...');
//             const initialNotification = await Notifications.getLastNotificationResponseAsync();
            
//             if (initialNotification) {
//                 debugLog('success', '📱 App was opened from notification', {
//                     hasData: !!initialNotification?.notification?.request?.content?.data,
//                     appState: 'initial',
//                     notificationContent: initialNotification?.notification?.request?.content
//                 });
                
//                 setTimeout(() => {
//                     debugLog('info', 'Processing initial notification after delay...');
//                     handleNotificationResponse(initialNotification);
//                 }, 1500);
//             } else {
//                 debugLog('info', 'No initial notification found');
//             }
//         } catch (error) {
//             debugLog('error', 'Error handling initial notification', { 
//                 error: error.message,
//                 stack: error.stack
//             });
//         }
//     };

//     // Function to view debug logs
//     const viewDebugLogs = async () => {
//         try {
//             const logs = await AsyncStorage.getItem('notificationDebugLogs');
//             const parsedLogs = logs ? JSON.parse(logs) : [];
//             console.log('📊 NOTIFICATION DEBUG LOGS:', parsedLogs);
//             alert(`Check console for debug logs. Total entries: ${parsedLogs.length}`);
//             return parsedLogs;
//         } catch (error) {
//             console.error('Error reading debug logs:', error);
//         }
//     };

//     // Function to clear debug logs
//     const clearDebugLogs = async () => {
//         try {
//             await AsyncStorage.removeItem('notificationDebugLogs');
//             debugLog('info', 'Debug logs cleared by user');
//             console.log('🗑️ Debug logs cleared');
//             alert('Debug logs cleared');
//         } catch (error) {
//             console.error('Error clearing debug logs:', error);
//         }
//     };

//     // Function to get current debug logs count
//     const getDebugLogsCount = async () => {
//         try {
//             const logs = await AsyncStorage.getItem('notificationDebugLogs');
//             const parsedLogs = logs ? JSON.parse(logs) : [];
//             return parsedLogs.length;
//         } catch (error) {
//             console.error('Error getting logs count:', error);
//             return 0;
//         }
//     };

//     // ========== MAIN SETUP EFFECT ==========
//     useEffect(() => {
//         debugLog('info', 'useNotification hook initialized', {
//             appState: AppState.currentState,
//             timestamp: new Date().toISOString()
//         });
        
//         // Setup notification handlers
//         Notifications.setNotificationHandler({
//             handleNotification: async () => ({
//                 shouldShowAlert: true,
//                 shouldPlaySound: true,
//                 shouldSetBadge: true,
//             }),
//         });

//         // Handle initial notification
//         handleInitialNotification();

//         // Listeners for notification events
//         const notificationListener = Notifications.addNotificationReceivedListener(handleNotification);
//         const responseListener = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

//         debugLog('info', 'Notification listeners added', {
//             hasNotificationListener: !!notificationListener,
//             hasResponseListener: !!responseListener
//         });

//         // Clean up listeners on unmount
//         return () => {
//             if (notificationListener) {
//                 Notifications.removeNotificationSubscription(notificationListener);
//             }
//             if (responseListener) {
//                 Notifications.removeNotificationSubscription(responseListener);
//             }
//             debugLog('info', 'Notification listeners cleaned up');
//         };
//     }, [handleNotification, handleNotificationResponse]);

//     // Test function to get token quickly
//     const getTestToken = async () => {
//         try {
//             setLoading(true);
//             const token = await generateNewPushToken();
            
//             if (token) {
//                 setExpoPushToken(token);
//                 debugLog('success', 'Test token generated', { 
//                     token: token.substring(0, 20) + '...' 
//                 });
//                 alert(`Expo Push Token:\n\n${token}\n\n📋 Check console for easy copying`);
//                 console.log('🔔 Expo Push Token:', token);
//                 return token;
//             }
//         } catch (error) {
//             debugLog('error', 'Error getting test token', { error: error.message });
//             alert('Error: ' + error.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Enhanced test notification with detailed logging
//     const sendTestNotification = async (screen = 'cleaner_schedule_review', params = {}) => {
//         try {
//             const testParams = {
//                 scheduleId: "6923d418b5c829ae8cb52670",
//                 requestId: "6923d545dfeb9ec7850247b0", 
//                 hostId: "68844853b4c35a50a4de2830",
//                 ...params
//             };

//             debugLog('info', 'Sending test notification', { 
//                 screen, 
//                 actualRouteName: ROUTES[screen] || screen,
//                 params: testParams,
//                 testType: 'manual'
//             });
            
//             await Notifications.scheduleNotificationAsync({
//                 content: {
//                     title: "Test Navigation",
//                     body: `Testing navigation to ${ROUTES[screen] || screen}`,
//                     data: { 
//                         screen: screen,
//                         params: testParams
//                     },
//                     sound: true,
//                 },
//                 trigger: null,
//             });
            
//             debugLog('success', `✅ Test notification sent for screen: ${screen}`, {
//                 screenKey: screen,
//                 actualRouteName: ROUTES[screen] || screen,
//                 params: testParams,
//                 notificationType: 'test'
//             });
//             alert(`Test notification sent for: ${ROUTES[screen] || screen}\nCheck logs for details.`);
//         } catch (error) {
//             debugLog('error', 'Failed to send test notification', { 
//                 error: error.message,
//                 screen,
//                 actualRouteName: ROUTES[screen] || screen,
//                 stack: error.stack
//             });
//             alert('Failed to send test notification: ' + error.message);
//         }
//     };

//     // Test function for all notification types
//     const testAllNotificationTypes = () => {
//         const testCases = [
//             { screen: 'Schedule Requests', params: { scheduleId: '692f41bd5d4bcbac71dc9666', requestId: '692f41c0507260e04abd9b5d' } },
//             { screen: 'Schedule Info', params: { scheduleId: '692f41bd5d4bcbac71dc9666' } },
//             { screen: 'Payment Receipt', params: { scheduleId: '692f41bd5d4bcbac71dc9666' } },
//             { screen: 'All Requests', params: {} },
//             { screen: 'Clock-In', params: { scheduleId: '692f41bd5d4bcbac71dc9666' } },
//             { screen: 'Chat Conversation', params: { chatroomId: 'chat_123' } },
//             { screen: 'Task Progress', params: { scheduleId: '692f41bd5d4bcbac71dc9666' } },
//             { screen: 'Confirm Request', params: { requestId: '692f41c0507260e04abd9b5d' } },
//         ];
        
//         testCases.forEach((testCase, index) => {
//             setTimeout(() => {
//                 debugLog('info', `Testing notification ${index + 1}: ${testCase.screen}`);
//                 sendTestNotification(testCase.screen, testCase.params);
//             }, index * 2000);
//         });
//     };

//     // Specific test functions for common routes
//     const testScheduleReviewNotification = () => {
//         debugLog('info', 'Testing cleaner_schedule_review notification', {
//             screenKey: 'cleaner_schedule_review',
//             actualRouteName: ROUTES.cleaner_schedule_review
//         });
//         sendTestNotification('cleaner_schedule_review', {
//             scheduleId: "6929d646534802ebd8ca2d89",
//             requestId: "6929d772fea1b69275ca8a36", 
//             hostId: "68844853b4c35a50a4de2830"
//         });
//     };

//     const testBackendFormatNotification = () => {
//         debugLog('info', 'Testing BACKEND FORMAT notification', {
//             screenKey: 'Review & Confirm Schedule',
//             actualRouteName: ROUTES.cleaner_schedule_review
//         });
        
//         sendTestNotification('Review & Confirm Schedule', {
//             scheduleId: "6929d646534802ebd8ca2d89",
//             requestId: "6929d772fea1b69275ca8a36", 
//             hostId: "68844853b4c35a50a4de2830"
//         });
//     };

//     const testAllRequestsNotification = () => {
//         debugLog('info', 'Testing cleaner_all_requests notification', {
//             screenKey: 'cleaner_all_requests',
//             actualRouteName: ROUTES.cleaner_all_requests
//         });
//         sendTestNotification('cleaner_all_requests');
//     };

//     const testChatNotification = () => {
//         debugLog('info', 'Testing chat_conversation notification', {
//             screenKey: 'chat_conversation',
//             actualRouteName: ROUTES.chat_conversation
//         });
//         sendTestNotification('chat_conversation', {
//             chatroomId: "test_chat_123",
//             selectedUser: { name: "Test User", userId: "user_123" },
//             fbaseUser: { name: "Current User", userId: "current_123" },
//             schedule: { id: "schedule_123" },
//             friendIndex: 0
//         });
//     };

//     return {
//         expoPushToken,
//         registerForPushNotificationsAsync,
//         getTestToken,
//         sendTestNotification,
//         testScheduleReviewNotification,
//         testBackendFormatNotification,
//         testAllRequestsNotification,
//         testChatNotification,
//         testAllNotificationTypes,
//         handleNotificationResponse,
//         viewDebugLogs,
//         clearDebugLogs,
//         getDebugLogsCount,
//         loading,
//         error
//     };
// }






// hooks/useNotification.js
// hooks/useNotification.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useState, useEffect, useCallback } from 'react';
import { AppState, Platform, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userService from '../services/connection/userService';
import { navigate } from './navigationService';
import ROUTES from '../constants/routes';

// Enhanced debug logger
const debugLog = async (type, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    type,
    message,
    data,
    source: 'useNotificationHook',
    platform: Platform.OS,
    device: Device.deviceName || 'Unknown',
    isDevice: Device.isDevice
  };
  
  console.log(`🔔 [${type.toUpperCase()}] ${message}`, data ? data : '');
  
  try {
    const logs = await AsyncStorage.getItem('notificationDebugLogs');
    const existingLogs = logs ? JSON.parse(logs) : [];
    existingLogs.push(logEntry);
    if (existingLogs.length > 100) existingLogs.shift();
    await AsyncStorage.setItem('notificationDebugLogs', JSON.stringify(existingLogs));
  } catch (error) {
    console.log('Failed to save debug log:', error);
  }
};

export function useNotification() {
    const [expoPushToken, setExpoPushToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [appState, setAppState] = useState(AppState.currentState);

    // ========== CORE NOTIFICATION HANDLERS ==========
    const handleNotification = useCallback((notification) => {
        debugLog('info', '📲 Notification received in foreground', {
            title: notification?.request?.content?.title,
            body: notification?.request?.content?.body,
            data: notification?.request?.content?.data,
            appState: AppState.currentState
        });
    }, []);

    const handleNotificationResponse = useCallback((response) => {
        debugLog('info', '🎯 NOTIFICATION TAPPED - Response received', {
            hasResponse: !!response,
            hasNotification: !!response?.notification,
            hasRequest: !!response?.notification?.request,
            appState: AppState.currentState
        });

        const data = response?.notification?.request?.content?.data;
        debugLog('info', '📋 Raw notification data extracted', data);

        if (data) {
            debugLog('success', '✅ Notification data found', {
                screen: data.screen,
                params: data.params,
                dataStructure: Object.keys(data)
            });

            if (data.screen === 'Review & Confirm Schedule' || data.screen === 'cleaner_schedule_review' || 
                data.screen === 'Schedule Requests' || data.screen === 'host_schedule_request' || 
                data.screen === 'Schedule Info' || data.screen ==='cleaner_schedule_details_view' || 
                data.screen === 'Payment Receipt' || data.screen ==='host_receipt_details') {
                debugLog('highlight', '🚀 SCHEDULE NOTIFICATION DETECTED', {
                    screen: data.screen,
                    params: data.params,
                    hasScheduleId: !!data.params?.scheduleId,
                    hasRequestId: !!data.params?.requestId,
                    hasHostId: !!data.params?.hostId
                });
            }

            const isWebOriginated = data.source === 'web' || data.fromWeb === true;
            
            if (isWebOriginated && data.deepLinkUrl) {
                debugLog('info', '🌐 Web-originated notification, using deep linking', {
                    deepLinkUrl: data.deepLinkUrl
                });
                handleDeepLinkNavigation(data.deepLinkUrl, data);
            } else {
                debugLog('info', '📱 Push notification, using direct navigation');
                handleDirectNavigation(data);
            }
        } else {
            debugLog('error', '❌ No data found in notification response');
        }
    }, []);

    // Track app state
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            setAppState(nextAppState);
            debugLog('info', 'App state changed', { from: appState, to: nextAppState });
        });

        return () => {
            subscription.remove();
        };
    }, [appState]);

    // ========== FIXED PUSH NOTIFICATION FUNCTIONS ==========
    const generateNewPushToken = async () => {
        try {
            debugLog('info', '🔄 Starting push token generation', {
                platform: Platform.OS,
                isDevice: Device.isDevice,
                deviceName: Device.deviceName,
                osVersion: Device.osVersion,
                appBuild: Constants.expoConfig?.version || 'unknown'
            });

            // CRITICAL: Check if running on physical device
            if (!Device.isDevice) {
                debugLog('warning', '❌ Cannot get push token on simulator/emulator');
                // Return a dummy token for simulator testing
                if (__DEV__) {
                    debugLog('info', 'Returning dummy token for simulator testing');
                    return 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
                }
                Alert.alert(
                    'Push Notifications',
                    'Push notifications work only on physical devices. Please test on a real device.',
                    [{ text: 'OK' }]
                );
                return null;
            }

            // Setup Android notification channel (required for Android 8+)
            if (Platform.OS === 'android') {
                try {
                    await Notifications.setNotificationChannelAsync('default', {
                        name: 'default',
                        importance: Notifications.AndroidImportance.MAX,
                        vibrationPattern: [0, 250, 250, 250],
                        lightColor: '#FF231F7C',
                        showBadge: true,
                        enableVibrate: true,
                        enableLights: true,
                    });
                    debugLog('info', '✅ Android notification channel configured');
                } catch (channelError) {
                    debugLog('warning', 'Could not set notification channel', { error: channelError.message });
                }
            }

            // Check existing permissions first
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            
            debugLog('info', 'Current permission status', { status: existingStatus });

            // Request permissions if not granted
            if (existingStatus !== 'granted') {
                debugLog('info', 'Requesting notification permissions...');
                const { status } = await Notifications.requestPermissionsAsync({
                    ios: {
                        allowAlert: true,
                        allowBadge: true,
                        allowSound: true,
                        allowAnnouncements: true,
                    },
                });
                finalStatus = status;
                debugLog('info', 'Permission request result', { newStatus: status });
            }

            if (finalStatus !== 'granted') {
                debugLog('error', '❌ Notification permission denied', { finalStatus });
                
                if (Platform.OS === 'ios' && finalStatus === 'undetermined') {
                    // iOS specific: Show custom alert
                    Alert.alert(
                        'Enable Notifications',
                        'Please enable notifications to get important updates about your schedules and messages.',
                        [
                            { text: 'Later', style: 'cancel' },
                            { 
                                text: 'Enable', 
                                onPress: () => {
                                    // Try requesting again
                                    Notifications.requestPermissionsAsync();
                                } 
                            }
                        ]
                    );
                } else {
                    Alert.alert(
                        'Permission Required',
                        'Push notifications permission is required. Please enable it in Settings.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { 
                                text: 'Open Settings', 
                                onPress: () => {
                                    if (Platform.OS === 'ios') {
                                        Linking.openURL('app-settings:');
                                    } else {
                                        Linking.openSettings();
                                    }
                                }
                            }
                        ]
                    );
                }
                return null;
            }

            debugLog('success', '✅ Notification permission granted');

            // Get projectId - IMPORTANT: Your app.json has the correct projectId
            const projectId = Constants.expoConfig?.extra?.eas?.projectId;
            
            debugLog('info', 'Project ID lookup', {
                hasExpoConfig: !!Constants.expoConfig,
                hasExtra: !!Constants.expoConfig?.extra,
                hasEas: !!Constants.expoConfig?.extra?.eas,
                projectIdFound: !!projectId,
                projectId: projectId || 'Not found'
            });

            if (!projectId) {
                debugLog('error', '❌ No projectId found in app configuration');
                // Fallback to your actual project ID from app.json
                const fallbackProjectId = "0a73df93-2859-4fa7-80e0-5e306a76fcc1";
                debugLog('warning', 'Using fallback projectId', { fallbackProjectId });
                
                const tokenData = await Notifications.getExpoPushTokenAsync({
                    projectId: fallbackProjectId
                });
                
                debugLog('success', '✅ Token generated with fallback projectId', { 
                    tokenLength: tokenData.data.length,
                    tokenPreview: tokenData.data.substring(0, 30) + '...'
                });
                
                return tokenData.data;
            }

            debugLog('info', 'Generating push token with projectId', { 
                projectId: projectId,
                platform: Platform.OS
            });
            
            // Generate the push token
            const tokenData = await Notifications.getExpoPushTokenAsync({
                projectId: projectId
            });
            
            debugLog('success', '✅ Token generated successfully', { 
                tokenLength: tokenData.data.length,
                tokenPreview: tokenData.data.substring(0, 30) + '...',
                fullToken: tokenData.data // For debugging
            });
            
            return tokenData.data;
            
        } catch (error) {
            debugLog('error', '❌ Error generating push token', { 
                error: error.message,
                errorCode: error.code,
                platform: Platform.OS,
                isDevice: Device.isDevice,
                stack: error.stack
            });
            
            // Check for specific errors
            if (error.message.includes('projectId') || error.code === 'E_INVALID_PUSH_TOKEN') {
                Alert.alert(
                    'Configuration Error',
                    'Push notification configuration error. Please make sure:\n1. Project ID is correctly set\n2. App is properly built with EAS\n3. Using a physical device',
                    [
                        { text: 'OK' },
                        { 
                            text: 'View Logs', 
                            onPress: () => {
                                console.log('🔍 Debug info:', {
                                    projectId: Constants.expoConfig?.extra?.eas?.projectId,
                                    appId: Constants.expoConfig?.extra?.eas?.appId,
                                    easConfig: Constants.expoConfig?.extra?.eas
                                });
                            }
                        }
                    ]
                );
            } else if (error.message.includes('permission') || error.code === 'E_NOTIFICATIONS_PERMISSION_REQUIRED') {
                Alert.alert(
                    'Permission Error',
                    'Please enable notification permissions in your device settings.',
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert(
                    'Token Generation Failed',
                    `Error: ${error.message}`,
                    [{ text: 'OK' }]
                );
            }
            
            return null;
        }
    };

    const sendTokenToBackend = async (token, userId) => {
        try {
            const deviceInfo = {
                deviceName: Device.deviceName || 'Unknown Device',
                osType: Device.osName || 'Unknown OS',
                osVersion: Device.osVersion || 'Unknown Version',
                platform: Platform.OS,
                modelName: Device.modelName || 'Unknown Model',
                deviceType: Device.deviceType || 'Unknown',
                token: token,
                userId: userId,
                projectId: Constants.expoConfig?.extra?.eas?.projectId || '0a73df93-2859-4fa7-80e0-5e306a76fcc1',
                appVersion: Constants.expoConfig?.version || '1.0.0',
                buildNumber: Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1'
            };

            debugLog('info', '📤 Sending device info to backend', {
                deviceName: deviceInfo.deviceName,
                osType: deviceInfo.osType,
                platform: deviceInfo.platform,
                userId: deviceInfo.userId,
                tokenLength: token.length,
                projectId: deviceInfo.projectId
            });

            console.log('📤 Sending token to backend:', {
                token: token.substring(0, 30) + '...',
                userId: userId,
                deviceInfo: deviceInfo
            });

            const response = await userService.storeToken(deviceInfo);
            
            debugLog('success', '✅ Token successfully sent to backend', { 
                responseStatus: response.status,
                responseData: response.data 
            });
            
            console.log('✅ Token backend response:', response.data);
            
            return response.data;
            
        } catch (error) {
            debugLog('error', '❌ Error sending token to backend', { 
                error: error.message || error,
                response: error.response?.data,
                status: error.response?.status,
                url: error.config?.url
            });
            
            // Don't throw error - we still want to save token locally even if backend fails
            console.warn('Backend token storage failed, but token saved locally:', error.message);
            return { success: false, error: error.message };
        }
    };

    const registerForPushNotificationsAsync = async (userId) => {
        debugLog('info', '=== PUSH NOTIFICATION REGISTRATION STARTED ===', {
            userId,
            platform: Platform.OS,
            isDevice: Device.isDevice,
            appVersion: Constants.expoConfig?.version,
            timestamp: new Date().toISOString()
        });
        
        if (!userId) {
            debugLog('error', '❌ User ID is required for push notifications');
            setError('User ID is required.');
            Alert.alert('Error', 'User ID is required for push notifications.');
            return null;
        }
        
        try {
            setLoading(true);
            setError(null);

            // CRITICAL CHECK: Physical device requirement
            if (!Device.isDevice) {
                const message = 'Push notifications only work on physical devices.';
                debugLog('warning', message);
                
                // For simulator, return a dummy token for testing
                if (__DEV__) {
                    const dummyToken = 'ExponentPushToken[Simulator-Test-Token-123]';
                    await AsyncStorage.setItem('expoPushToken', dummyToken);
                    setExpoPushToken(dummyToken);
                    debugLog('info', 'Simulator: Using dummy token for testing');
                    
                    Alert.alert(
                        'Simulator Detected',
                        'Using dummy token for testing. Use physical device for real push notifications.',
                        [{ text: 'OK' }]
                    );
                    
                    return dummyToken;
                }
                
                Alert.alert('Device Required', message);
                setError(message);
                return null;
            }

            debugLog('info', '🚀 Generating new push token...');
            const token = await generateNewPushToken();
            
            debugLog('info', 'Token generation result', { 
                hasToken: !!token,
                tokenLength: token?.length || 0,
                tokenPreview: token ? token.substring(0, 30) + '...' : 'No token'
            });

            if (token) {
                // Store token locally
                await AsyncStorage.setItem('expoPushToken', token);
                await AsyncStorage.setItem('pushTokenTimestamp', new Date().toISOString());
                await AsyncStorage.setItem('pushTokenUserId', userId);
                
                debugLog('info', '✅ Token stored in AsyncStorage', {
                    storageKeys: await AsyncStorage.getAllKeys()
                });

                // Send to backend (but don't fail if backend is down)
                try {
                    await sendTokenToBackend(token, userId);
                } catch (backendError) {
                    debugLog('warning', 'Backend storage failed, but continuing', {
                        error: backendError.message
                    });
                }

                // Update state
                setExpoPushToken(token);
                
                debugLog('success', '🎉 Push notification registration successful', { 
                    token: token.substring(0, 20) + '...',
                    userId,
                    timestamp: new Date().toISOString(),
                    platform: Platform.OS
                });

                // Send a local test notification to verify everything works
                // await sendLocalTestNotification();
                
                // Also log to console for easy debugging
                console.log('🎯 PUSH TOKEN GENERATED:', token);
                console.log('📱 Device:', Device.deviceName);
                console.log('📱 Platform:', Platform.OS);
                console.log('📱 Project ID:', Constants.expoConfig?.extra?.eas?.projectId);
                
                return token;
                
            } else {
                const errorMsg = 'Failed to generate push token. Please check permissions and try again.';
                debugLog('error', errorMsg);
                
                // Run diagnostics
                const diagnostics = await runPushNotificationDiagnostics();
                debugLog('info', 'Failed registration diagnostics', diagnostics);
                
                throw new Error(errorMsg);
            }
            
        } catch (error) {
            debugLog('error', '❌ Push notification registration failed', { 
                error: error.message,
                userId,
                platform: Platform.OS,
                isDevice: Device.isDevice,
                stack: error.stack
            });
            
            setError(error.message || 'Failed to register for push notifications');
            
            Alert.alert(
                'Registration Failed',
                `${error.message || 'Unable to register for push notifications.'}\n\nPlease ensure:\n1. Device has internet connection\n2. Notification permissions are granted\n3. Using a physical device`,
                [
                    { text: 'OK' },
                    { 
                        text: 'View Logs', 
                        onPress: () => viewDebugLogs()
                    }
                ]
            );
            
            return null;
            
        } finally {
            setLoading(false);
        }
    };

    // ========== NAVIGATION HELPERS ==========
    const screenNameToRouteMap = {
        'Review & Confirm Schedule': ROUTES.cleaner_schedule_review,
        'Schedule Requests': ROUTES.host_schedule_request,
        'Schedule Resquests': ROUTES.host_schedule_request,
        'Schedule Info': ROUTES.cleaner_schedule_details_view,
        'Payment Receipt': ROUTES.host_receipt_details,
        'All Requests': ROUTES.cleaner_all_requests,
        'Clock-In': ROUTES.cleaner_clock_in,
        'Clock In': ROUTES.cleaner_clock_in,
        'Attach Task Photos': ROUTES.cleaner_attach_task_photos,
        'Schedule Details': ROUTES.host_schedule_details,
        'Confirm Request': ROUTES.host_confirm,
        'Task Progress': ROUTES.host_task_progress,
        'Chat Conversation': ROUTES.chat_conversation,
        'Chat': ROUTES.chat_conversation,
        'Notification': ROUTES.notification,
        'Notifications': ROUTES.notification,
        'Home': ROUTES.cleaner_dashboard,
        'Dashboard': ROUTES.cleaner_dashboard,
        'Cleaner Dashboard': ROUTES.cleaner_dashboard,
        'Host Dashboard': ROUTES.host_dashboard,
        'Profile': ROUTES.profile,
        'Settings': ROUTES.settings,
    };
    
    const screenKeyToRouteMap = {
        'cleaner_schedule_review': ROUTES.cleaner_schedule_review,
        'host_schedule_request': ROUTES.host_schedule_request,
        'cleaner_schedule_details_view': ROUTES.cleaner_schedule_details_view,
        'host_receipt_details': ROUTES.host_receipt_details,
        'cleaner_all_requests': ROUTES.cleaner_all_requests,
        'cleaner_clock_in': ROUTES.cleaner_clock_in,
        'cleaner_attach_task_photos': ROUTES.cleaner_attach_task_photos,
        'host_schedule_details': ROUTES.host_schedule_details,
        'host_confirm': ROUTES.host_confirm,
        'host_task_progress': ROUTES.host_task_progress,
        'chat_conversation': ROUTES.chat_conversation,
        'notification': ROUTES.notification,
        'cleaner_dashboard': ROUTES.cleaner_dashboard,
        'host_dashboard': ROUTES.host_dashboard,
        'profile': ROUTES.profile,
        'settings': ROUTES.settings,
    };

    const getUserType = async () => {
        try {
            const userType = await AsyncStorage.getItem('userType');
            return userType || 'cleaner';
        } catch (error) {
            return 'cleaner';
        }
    };

    const handleDirectNavigation = async (data) => {
        let { screen, params } = data;
        
        debugLog('info', '🎯 DIRECT NAVIGATION STARTED', {
            receivedScreen: screen,
            params,
            hasScreen: !!screen,
            hasParams: !!params,
            appState: AppState.currentState
        });
    
        if (screen) {
            screen = screen.trim();
            let actualScreenName = null;
            
            // 1. Try exact match in screenNameToRouteMap
            actualScreenName = screenNameToRouteMap[screen];
            
            // 2. Try exact match in screenKeyToRouteMap
            if (!actualScreenName) {
                actualScreenName = screenKeyToRouteMap[screen];
            }
            
            // 3. Try case-insensitive match
            if (!actualScreenName) {
                const lowerScreen = screen.toLowerCase();
                for (const [key, route] of Object.entries(screenNameToRouteMap)) {
                    if (key.toLowerCase() === lowerScreen) {
                        actualScreenName = route;
                        break;
                    }
                }
            }
            
            // 4. Try partial match
            if (!actualScreenName) {
                const searchTerms = ['schedule', 'request', 'chat', 'confirm', 'task', 'clock'];
                for (const term of searchTerms) {
                    if (screen.toLowerCase().includes(term)) {
                        for (const [key, route] of Object.entries(screenNameToRouteMap)) {
                            if (key.toLowerCase().includes(term)) {
                                actualScreenName = route;
                                debugLog('info', `Partial match found for ${screen} → ${key}`);
                                break;
                            }
                        }
                        if (actualScreenName) break;
                    }
                }
            }
            
            // 5. If still no match, use the received screen as fallback
            if (!actualScreenName) {
                actualScreenName = screen;
                debugLog('warning', `No mapping found for screen: ${screen}, using direct navigation`);
            }
            
            debugLog('info', '🔄 Screen mapping result', {
                receivedScreen: screen,
                actualScreenName,
                mappingSuccess: actualScreenName !== screen
            });
    
            if (screen.includes('Schedule') || screen.includes('Request')) {
                debugLog('highlight', '🚀 SCHEDULE/REQUEST NOTIFICATION', {
                    originalScreen: screen,
                    mappedScreen: actualScreenName,
                    params: params,
                    navigationReady: true
                });
            }
    
            try {
                debugLog('success', `📱 Navigating to: ${actualScreenName}`, { 
                    originalScreen: screen,
                    params: params,
                    navigationMethod: 'direct',
                    timestamp: new Date().toISOString()
                });
                
                navigate(actualScreenName, params);
                
                debugLog('success', `✅ Navigation command sent`, {
                    screen: actualScreenName,
                    paramsCount: params ? Object.keys(params).length : 0,
                    navigationTime: new Date().toISOString()
                });
            } catch (navigationError) {
                debugLog('error', 'Navigation failed', {
                    screen: actualScreenName,
                    originalScreen: screen,
                    error: navigationError.message
                });
                
                const userType = await getUserType();
                const fallbackScreen = userType === 'cleaner' 
                    ? ROUTES.cleaner_dashboard 
                    : ROUTES.host_dashboard;
                
                debugLog('warning', `Using ultimate fallback to: ${fallbackScreen}`);
                navigate(fallbackScreen);
            }
        } else {
            debugLog('error', '❌ No screen specified in notification data');
            const userType = await getUserType();
            const fallbackScreen = userType === 'cleaner' 
                ? ROUTES.cleaner_dashboard 
                : ROUTES.host_dashboard;
            navigate(fallbackScreen);
        }
    };

    const handleDeepLinkNavigation = async (url, data) => {
        debugLog('info', '🔗 Handling deep link navigation', { 
            url, 
            appState: AppState.currentState,
            source: 'web-originated'
        });

        try {
            const canOpen = await Linking.canOpenURL(url);
            debugLog('info', 'Can open URL check', { canOpen, url });

            if (canOpen) {
                debugLog('info', 'Opening URL via Linking.openURL...');
                await Linking.openURL(url);
                debugLog('success', 'Deep link URL opened successfully', { 
                    url,
                    appState: AppState.currentState 
                });
            } else {
                debugLog('error', 'Cannot open URL, falling back to direct navigation', { url });
                handleDirectNavigation(data);
            }
        } catch (error) {
            debugLog('error', 'Error in deep link navigation', { 
                error: error.message,
                url 
            });
            debugLog('info', 'Falling back to direct navigation...');
            handleDirectNavigation(data);
        }
    };

    // ========== DIAGNOSTIC & UTILITY FUNCTIONS ==========
    const runPushNotificationDiagnostics = async () => {
        debugLog('info', '🔍 RUNNING PUSH NOTIFICATION DIAGNOSTICS');
        
        const diagnostics = {
            timestamp: new Date().toISOString(),
            platform: Platform.OS,
            isDevice: Device.isDevice,
            deviceName: Device.deviceName,
            osName: Device.osName,
            osVersion: Device.osVersion,
            appState: AppState.currentState,
            appVersion: Constants.expoConfig?.version,
            runtimeVersion: Constants.expoConfig?.runtimeVersion,
            hasConstants: !!Constants.expoConfig,
            projectId: Constants.expoConfig?.extra?.eas?.projectId,
            appId: Constants.expoConfig?.extra?.eas?.appId,
            permissions: null,
            existingToken: null,
            storedUserId: null,
            issues: []
        };

        try {
            // Check stored token
            const existingToken = await AsyncStorage.getItem('expoPushToken');
            diagnostics.existingToken = existingToken ? `${existingToken.substring(0, 20)}...` : null;
            
            // Check stored user ID
            diagnostics.storedUserId = await AsyncStorage.getItem('pushTokenUserId');

            // Check permissions
            const { status } = await Notifications.getPermissionsAsync();
            diagnostics.permissions = status;
            
            if (status !== 'granted') {
                diagnostics.issues.push(`Notification permission not granted: ${status}`);
            }

            // Check project configuration
            if (!diagnostics.projectId) {
                diagnostics.issues.push('No projectId found in app configuration');
            } else if (diagnostics.projectId !== "0a73df93-2859-4fa7-80e0-5e306a76fcc1") {
                diagnostics.issues.push(`Project ID mismatch: ${diagnostics.projectId} (expected: 0a73df93-2859-4fa7-80e0-5e306a76fcc1)`);
            }

            // Check device
            if (!diagnostics.isDevice) {
                diagnostics.issues.push('Not running on a physical device');
            }

            debugLog('info', 'Diagnostics completed', diagnostics);
            
        } catch (error) {
            diagnostics.issues.push(`Diagnostic error: ${error.message}`);
            debugLog('error', 'Diagnostics failed', { error: error.message });
        }

        return diagnostics;
    };

    const sendLocalTestNotification = async () => {
        try {
            debugLog('info', 'Sending local test notification...');
            
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '✅ Push Test Successful',
                    body: 'Push notifications are working correctly!',
                    data: { 
                        screen: 'cleaner_dashboard',
                        params: { test: true },
                        source: 'local_test'
                    },
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: { seconds: 1 },
            });
            
            debugLog('success', 'Local test notification sent');
            
        } catch (error) {
            debugLog('error', 'Failed to send local test notification', { error: error.message });
        }
    };

    const handleInitialNotification = async () => {
        try {
            debugLog('info', 'Checking for initial notification...');
            const initialNotification = await Notifications.getLastNotificationResponseAsync();
            
            if (initialNotification) {
                debugLog('success', '📱 App was opened from notification', {
                    hasData: !!initialNotification?.notification?.request?.content?.data,
                    appState: 'initial',
                    notificationContent: initialNotification?.notification?.request?.content
                });
                
                setTimeout(() => {
                    debugLog('info', 'Processing initial notification after delay...');
                    handleNotificationResponse(initialNotification);
                }, 1500);
            } else {
                debugLog('info', 'No initial notification found');
            }
        } catch (error) {
            debugLog('error', 'Error handling initial notification', { 
                error: error.message,
                stack: error.stack
            });
        }
    };

    // ========== DEBUG FUNCTIONS ==========
    const viewDebugLogs = async () => {
        try {
            const logs = await AsyncStorage.getItem('notificationDebugLogs');
            const parsedLogs = logs ? JSON.parse(logs) : [];
            
            // Create a summary
            const summary = {
                total: parsedLogs.length,
                errors: parsedLogs.filter(log => log.type === 'error').length,
                successes: parsedLogs.filter(log => log.type === 'success').length,
                warnings: parsedLogs.filter(log => log.type === 'warning').length,
                last10: parsedLogs.slice(-10).map(log => ({
                    time: log.timestamp,
                    type: log.type,
                    message: log.message,
                    data: log.data
                }))
            };
            
            // Log to console
            console.log('📊 NOTIFICATION DEBUG LOGS SUMMARY:', summary);
            console.log('📋 FULL LOGS:', parsedLogs);
            
            // Show alert with key info
            Alert.alert(
                'Debug Logs',
                `Total: ${summary.total}\n✅ Successes: ${summary.successes}\n❌ Errors: ${summary.errors}\n⚠️ Warnings: ${summary.warnings}\n\nCheck console for full logs.`,
                [
                    { text: 'OK' },
                    { 
                        text: 'Copy Latest Token', 
                        onPress: async () => {
                            const token = await AsyncStorage.getItem('expoPushToken');
                            if (token) {
                                console.log('📋 Latest Token:', token);
                                Alert.alert('Token Copied', 'Check console for token');
                            }
                        }
                    }
                ]
            );
            
            return parsedLogs;
        } catch (error) {
            console.error('Error reading debug logs:', error);
            return [];
        }
    };

    const clearDebugLogs = async () => {
        try {
            await AsyncStorage.removeItem('notificationDebugLogs');
            debugLog('info', 'Debug logs cleared by user');
            console.log('🗑️ Debug logs cleared');
            Alert.alert('Success', 'Debug logs cleared');
        } catch (error) {
            console.error('Error clearing debug logs:', error);
        }
    };

    const getDebugLogsCount = async () => {
        try {
            const logs = await AsyncStorage.getItem('notificationDebugLogs');
            const parsedLogs = logs ? JSON.parse(logs) : [];
            return parsedLogs.length;
        } catch (error) {
            console.error('Error getting logs count:', error);
            return 0;
        }
    };

    // ========== TEST FUNCTIONS ==========
    const getTestToken = async () => {
        try {
            setLoading(true);
            debugLog('info', '=== MANUAL TOKEN TEST STARTED ===');
            
            const diagnostics = await runPushNotificationDiagnostics();
            console.log('🔍 Diagnostics:', diagnostics);
            
            if (!Device.isDevice && !__DEV__) {
                Alert.alert(
                    'Simulator Detected',
                    'Push tokens require physical devices for real testing.',
                    [{ text: 'OK' }]
                );
                return null;
            }

            const token = await generateNewPushToken();
            
            if (token) {
                setExpoPushToken(token);
                
                debugLog('success', 'Manual test token generated', { 
                    token: token.substring(0, 30) + '...',
                    diagnostics
                });
                
                // Alert.alert(
                //     'Test Token Generated',
                //     `Token generated successfully!\n\nLength: ${token.length} characters\n\nCheck console for full token and diagnostics.`,
                //     [
                //         { 
                //             text: 'View in Console', 
                //             onPress: () => {
                //                 console.log('🎯 FULL TEST TOKEN:', token);
                //                 console.log('🔍 DIAGNOSTICS:', diagnostics);
                //             }
                //         },
                //         { text: 'OK' }
                //     ]
                // );
                
                return token;
            } else {
                Alert.alert('Error', 'Failed to generate test token. Check diagnostics in console.');
            }
        } catch (error) {
            debugLog('error', 'Error getting test token', { error: error.message });
            Alert.alert('Error', `Failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const sendTestNotification = async (screen = 'cleaner_schedule_review', params = {}) => {
        try {
            const testParams = {
                scheduleId: "6923d418b5c829ae8cb52670",
                requestId: "6923d545dfeb9ec7850247b0", 
                hostId: "68844853b4c35a50a4de2830",
                ...params
            };

            debugLog('info', 'Sending test notification', { 
                screen, 
                actualRouteName: ROUTES[screen] || screen,
                params: testParams,
                testType: 'manual'
            });
            
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Test Navigation",
                    body: `Testing navigation to ${ROUTES[screen] || screen}`,
                    data: { 
                        screen: screen,
                        params: testParams
                    },
                    sound: true,
                },
                trigger: null,
            });
            
            debugLog('success', `✅ Test notification sent for screen: ${screen}`, {
                screenKey: screen,
                actualRouteName: ROUTES[screen] || screen,
                params: testParams,
                notificationType: 'test'
            });
            
            Alert.alert(
                'Test Sent',
                `Test notification sent for: ${ROUTES[screen] || screen}\nCheck logs for details.`,
                [{ text: 'OK' }]
            );
            
        } catch (error) {
            debugLog('error', 'Failed to send test notification', { 
                error: error.message,
                screen,
                actualRouteName: ROUTES[screen] || screen,
                stack: error.stack
            });
            Alert.alert('Error', `Failed to send test: ${error.message}`);
        }
    };

    // ========== MAIN SETUP EFFECT ==========
    useEffect(() => {
        debugLog('info', 'useNotification hook initialized', {
            appState: AppState.currentState,
            platform: Platform.OS,
            isDevice: Device.isDevice,
            timestamp: new Date().toISOString(),
            projectId: Constants.expoConfig?.extra?.eas?.projectId
        });
        
        // Setup notification handlers
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
            }),
        });

        // Handle initial notification
        handleInitialNotification();

        // Listeners for notification events
        const notificationListener = Notifications.addNotificationReceivedListener(handleNotification);
        const responseListener = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

        debugLog('info', 'Notification listeners added', {
            hasNotificationListener: !!notificationListener,
            hasResponseListener: !!responseListener,
            device: Device.deviceName
        });

        // Clean up listeners on unmount
        return () => {
            if (notificationListener) {
                Notifications.removeNotificationSubscription(notificationListener);
            }
            if (responseListener) {
                Notifications.removeNotificationSubscription(responseListener);
            }
            debugLog('info', 'Notification listeners cleaned up');
        };
    }, [handleNotification, handleNotificationResponse]);

    // ========== RETURN VALUES ==========
    return {
        expoPushToken,
        registerForPushNotificationsAsync,
        getTestToken,
        sendTestNotification,
        runPushNotificationDiagnostics,
        handleNotificationResponse,
        viewDebugLogs,
        clearDebugLogs,
        getDebugLogsCount,
        loading,
        error,
        appState,
        platform: Platform.OS,
        isDevice: Device.isDevice,
        // Quick check functions
        checkExistingToken: async () => {
            const token = await AsyncStorage.getItem('expoPushToken');
            return token;
        },
        // Force re-registration
        reRegisterPushNotifications: async (userId) => {
            await AsyncStorage.removeItem('expoPushToken');
            return registerForPushNotificationsAsync(userId);
        }
    };
}