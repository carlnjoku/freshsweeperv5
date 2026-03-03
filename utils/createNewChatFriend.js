import { db } from "../services/firebase/config";
import { ref, push, set, update, get } from "firebase/database";


// Utility function to retrieve user data
const findUserById = async (uid) => {
  const userRef = ref(db, `users/${uid}`);
  const snapshot = await get(userRef);
  return snapshot.exists() ? snapshot.val() : null;
};

// Utility function to create a new chatroom
const createChatroom = async (db, firstUserId, secondUserId, thirdUserId = "automatedUserId") => {
  const chatroomRef = push(ref(db, 'chatrooms'), {
    firstUser: firstUserId,
    secondUser: secondUserId,
    thirdUser: thirdUserId,
    messages: [],
  });
  return chatroomRef.key; // Returns the new chatroom ID
};

// Utility function to set unread messages
const initializeUnreadMessages = async (db, chatroomId, firstUserId, secondUserId) => {
  const unreadMessagesRef = ref(db, `unreadMessages/${chatroomId}/${secondUserId}/${firstUserId}`);
  await set(unreadMessagesRef, 1);
};

// Utility function to update a user's friends list
const updateFriendsList = async (db, userId, friendDetails) => {
  const userFriendsRef = ref(db, `users/${userId}/friends`);
  const snapshot = await get(userFriendsRef);
  const existingFriends = snapshot.val() || [];
  const updatedFriendsList = [...existingFriends, friendDetails];
  await update(ref(db, `users/${userId}`), { friends: updatedFriendsList });
};

// Main function to add a friend
const onAddFriend = async (uid, fbaseUser, schedule, scheduleId, fee) => {
  try {
    // Fetch the user to be added
    const user = await findUserById(uid);
    if (!user) return;
    console.log("firbaseUseruser----TMT", user)
    // Prevent user from adding themselves
    if (user.userId === fbaseUser.userId) return;
    
    // Check existing friends for this schedule
    const userFriendsRef = ref(db, `users/${fbaseUser.userId}/friends`);
    const snapshot = await get(userFriendsRef);
    const friends = snapshot.exists() ? Object.values(snapshot.val()) : [];
    const isAlreadyFriend = friends.some(
      friend => friend.userId === user.userId && friend.scheduleId === scheduleId
    );
    if (isAlreadyFriend) return;

    // Create chatroom
    const newChatroomId = await createChatroom(db, fbaseUser.userId, user.userId);

    // Automated system message with cleaner fee
    const automatedMessage = {
      _id: Math.random().toString(36).substring(7),
      text: 'The cleaning job has been successfully paid for and confirmed!',
      details: {
        selected_schedule: schedule,
        selected_scheduleId: scheduleId,
        hostId: fbaseUser.userId,
        hostFname: fbaseUser.firstname,
        hostLname: fbaseUser.lastname,
      },
      cleaning_fee: fee, // <--- use the individual cleaner fee here
      cleanerId: uid,
      status: 'payment_completed',
      createdAt: new Date().getTime(),
      system: true,
    };

    // Update chatroom with the message
    await update(ref(db, `chatrooms/${newChatroomId}`), {
      messages: [automatedMessage],
    });

    // Initialize unread messages
    await initializeUnreadMessages(db, newChatroomId, fbaseUser.userId, user.userId);

    // Update friends lists
    const friendDetailsForCurrentUser = {
      userId: user.userId,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      avatar: user.avatar,
      schedule,
      scheduleId,
      chatroomId: newChatroomId,
    };

    const friendDetailsForUser = {
      userId: fbaseUser.userId,
      firstname: fbaseUser.firstname,
      lastname: fbaseUser.lastname,
      email: fbaseUser.email,
      avatar: fbaseUser.avatar,
      schedule,
      scheduleId,
      chatroomId: newChatroomId,
    };

    await updateFriendsList(db, fbaseUser.userId, friendDetailsForCurrentUser);
    await updateFriendsList(db, user.userId, friendDetailsForUser);

  } catch (error) {
    console.error("Error adding friend:", error);
  }
};

export default onAddFriend;