// services/addFriend.js
import { Alert } from 'react-native';
// import { createConversation } from './chatApi';
import { createConversation } from '../services/connection/chatApi';

const addFriend = async (cleanerId, currentUser, schedule, scheduleId, fee, token) => {
  try {
    const initialMessage = {
      text: 'The cleaning job has been successfully paid for and confirmed!',
      details: {
        selected_schedule: schedule,
        selected_scheduleId: scheduleId,
        hostId: currentUser.userId,
        hostFname: currentUser.firstname,
        hostLname: currentUser.lastname,
      },
      cleaning_fee: fee,
      status: 'payment_completed',
      createdAt: new Date().toISOString(),
      system: true,
    };

    // Call the backend to create the conversation
    const conversation = await createConversation(
      currentUser.userId,    // currentUserId (used as debug_user_id)
      cleanerId,             // otherUserId
      schedule,
      scheduleId,
      fee,
      initialMessage
    );

    console.log('Conversation created:', conversation);
    return conversation;
  } catch (error) {
    console.error('Error adding friend:', error);
    if (error.response) {
      const { status } = error.response;
      if (status === 409) {
        Alert.alert('Already Connected', 'You already have a conversation with this cleaner for this schedule.');
        return null;
      } else {
        Alert.alert('Error', 'Failed to create conversation. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Network error. Please check your connection.');
    }
    throw error;
  }
};

export default addFriend;