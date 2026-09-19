// // services/addFriend.js
// import { Alert } from 'react-native';
// // import { createConversation } from './chatApi';
// import { createConversation } from '../services/connection/chatApi';

// const addFriend = async (currentUser,cleanerId, schedule, scheduleId, fee, token) => {
//   try {
//     const initialMessage = {
//       text: 'The cleaning job has been successfully paid for and confirmed!',
//       details: {
//         selected_schedule: schedule,
//         selected_scheduleId: scheduleId,
//         hostId: currentUser.userId,
//         hostFname: currentUser.firstname,
//         hostLname: currentUser.lastname,
//       },
//       cleaning_fee: fee,
//       status: 'payment_completed',
//       createdAt: new Date().toISOString(),
//       system: true,
//     };

//     // Call the backend to create the conversation
//     const conversation = await createConversation(
//       currentUser._id,    // currentUserId (used as debug_user_id)
//       cleanerId,             // otherUserId
//       schedule,
//       scheduleId,
//       fee,
//       initialMessage
//     );

//     console.log('Conversation created:', conversation);
//     return conversation;
//   } catch (error) {
//     console.error('Error adding friend:', error);
//     if (error.response) {
//       const { status } = error.response;
//       if (status === 409) {
//         Alert.alert('Already Connected', 'You already have a conversation with this cleaner for this schedule.');
//         return null;
//       } else {
//         Alert.alert('Error', 'Failed to create conversation. Please try again.');
//       }
//     } else {
//       Alert.alert('Error', 'Network error. Please check your connection.');
//     }
//     throw error;
//   }
// };

// export default addFriend;









// services/addFriend.js
// import { Alert } from 'react-native';
// import { createConversation } from '../services/connection/chatApi';

// const addFriend = async (hostId, cleanerId, currentUser, schedule, scheduleId, fee, token) => {
//   try {
//     const initialMessage = {
//       text: 'The cleaning job has been successfully paid for and confirmed!',
//       details: {
//         selected_schedule: schedule,
//         selected_scheduleId: scheduleId,
//         hostId: hostId,
//         hostFname: currentUser.firstname,
//         hostLname: currentUser.lastname,
//       },
//       cleaning_fee: fee,
//       status: 'payment_completed',
//       createdAt: new Date().toISOString(),
//       system: true,
//     };

//     const conversation = await createConversation(
//       hostId,          // currentUserId
//       cleanerId,       // otherUserId
//       schedule,
//       scheduleId,
//       fee,
//       initialMessage
//     );

//     console.log('✅ Conversation created:', conversation);
//     return conversation;
//   } catch (error) {
//     console.error('❌ Error adding friend:', error);
//     if (error.response) {
//       const { status, data } = error.response;
//       console.error('Server error details:', status, data);
//       if (status === 409) {
//         Alert.alert('Already Connected', 'You already have a conversation with this cleaner for this schedule.');
//         return null;
//       } else {
//         Alert.alert('Error', data?.message || 'Failed to create conversation. Please try again.');
//       }
//     } else {
//       Alert.alert('Error', 'Network error. Please check your connection.');
//     }
//     throw error;
//   }
// };

// export default addFriend;




// services/addFriend.js
import { Alert } from 'react-native';
import { createConversation } from '../services/connection/chatApi';

const addFriend = async (hostId, cleanerId, currentUser, schedule, scheduleId, fee, token) => {
  try {
    const initialMessage = {
      text: 'The cleaning job has been successfully paid for and confirmed!',
      details: {
        selected_schedule: schedule,
        selected_scheduleId: scheduleId,
        hostId: hostId,
        hostFname: currentUser.firstname,
        hostLname: currentUser.lastname,
      },
      cleaning_fee: fee,
      status: 'payment_completed',
      createdAt: new Date().toISOString(),
      system: true,
    };

    const conversation = await createConversation(
      hostId,          // currentUserId
      cleanerId,       // otherUserId
      schedule,
      scheduleId,
      fee,
      initialMessage
    );

    console.log('✅ Conversation created for cleaner:', cleanerId);
    return conversation;
  } catch (error) {
    console.error('❌ Error adding friend for cleaner:', cleanerId, error);
    if (error.response) {
      const { status, data } = error.response;
      console.error('Server error details:', status, data);
      if (status === 409) {
        Alert.alert('Already Connected', 'You already have a conversation with this cleaner for this schedule.');
        return null;
      } else {
        Alert.alert('Error', data?.detail || data?.message || 'Failed to create conversation. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Network error. Please check your connection.');
    }
    throw error;
  }
};

export default addFriend;