import userService from "../services/connection/userService";
// Utility function for sending push notifications
const push_url = "https://exp.host/--/api/v2/push/send"

export  const sendPushNotification = async (expoPushToken, notificationData) => {

  console.log(expoPushToken)
  console.log("My notificationssssss", notificationData)
  try {
    // Construct the push notification payload
    const expo_pn = {
      to: expoPushToken, // Receiver's expo push token
      title: notificationData.title || "Notification", // Notification title
      body: notificationData.body || "You have a new notification", // Notification body
      data: notificationData.data || {}, // Additional data
    };

    console.log("Preparing to send push notification...");
    console.log(JSON.stringify(expo_pn, null, 2));

    // Send push notification via user service
    const response = await userService.sendChatMessagePushNotification(expo_pn);

    console.log("Push notification response:", response.data);
    console.log("Push notification sent successfully.");
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};


export const sendCleaningRequestPushNotification = async(expoPushToken, title, body, data = {}) => {
    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: expoPushToken,  // Receiver's Expo Push Token
            title,              // Notification title
            body,               // Notification body
            data,               // Additional data
          }),
        });
    
        const result = await response.json();
        console.log("Push notification response:", result);
      } catch (error) {
        console.error("Error sending push notification:", error);
      }
}

export const acceptCleaningRequestPushNotification = async(expoPushToken, title, body, data = {}) => {
    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: expoPushToken,  // Receiver's Expo Push Token
            title,              // Notification title
            body,               // Notification body
            data,               // Additional data
          }),
        });
    
        const result = await response.json();
        console.log("Push notification response:", result);
      } catch (error) {
        console.error("Error sending push notification:", error);
      }
}

export const successfullPaymentPushNotification = async(expoPushToken, title, body, data = {}) => {
    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: expoPushToken,  // Receiver's Expo Push Token
            title,              // Notification title
            body,               // Notification body
            data,               // Additional data
          }),
        });
    
        const result = await response.json();
        console.log("Push notification response:", result);
      } catch (error) {
        console.error("Error sending push notification:", error);
      }
}

export const sendExpoPushNotification = async(expoPushToken, title, body, data = {}) => {
    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: expoPushToken,  // Receiver's Expo Push Token
            title,              // Notification title
            body,               // Notification body
            data,               // Additional data
          }),
        });
    
        const result = await response.json();
        console.log("Push notification response:", result);
      } catch (error) {
        console.error("Error sending push notification:", error);
      }
}




// export const sendPushNotifications = async (tokens, title, body) => {
//   try {
//       const messages = tokens.map((tokenData) => ({
//           to: tokenData.token,
//           sound: 'default',
//           title: title,
//           body: body,
//       }));

//       // Send notifications to Expo push service
//       const response = await axios.post(push_url, messages);
//       console.log('Push notifications sent:', response.data);
//   } catch (error) {
//       console.error('Error sending push notifications:', error);
//   }
// };

export const sendPushNotifications = async (tokens, title, body, { screen, params }) => {
  try {
    const messages = tokens.map((tokenData) => ({
      to: tokenData.token,
      sound: 'default',
      title: title,
      body: body,
      data: {
        screen: screen,  // Navigate to this screen when the notification is tapped
        params: params,  // Additional parameters to pass for navigation
      },
    }));

   

    // Send notifications to Expo push service
    const response = await fetch(push_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      throw new Error(`Failed to send push notifications: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Push notifications sent:', data);
  } catch (error) {
    console.error('Error sending push notifications:', error);
  }
};