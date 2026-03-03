// import { useEffect, useState, useCallback, useContext, useRef } from 'react';
// import { SafeAreaView, StyleSheet, StatusBar, Text, RefreshControl, Linking, FlatList, ScrollView, Modal, Image, View, TouchableOpacity, ActivityIndicator } from 'react-native';
// import {
//   get,
//   ref,
//   set,
//   off,
//   onValue,
//   push,
//   update,
//   onChildAdded
// } from 'firebase/database';
// import { db } from '../../services/firebase/config';
// import COLORS from '../../constants/colors';
// import { AuthContext } from '../../context/AuthContext';
// import ROUTES from '../../constants/routes';
// import moment from 'moment';
// import { MaterialCommunityIcons, Ionicons, AntDesign } from '@expo/vector-icons';

// const Messages = ({navigation}) => {
//   const {
//     currentUserId,
//     fbaseUser,
//     setTotalUnreadCount,
//     totalUnreadCount
//   } = useContext(AuthContext);

//   const [friendsWithLastMessagesUnread, setFriendsWithLastMessagesUnreadCount] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
  
//   // Use refs to track values without causing re-renders
//   const friendsRef = useRef([]);
//   const unsubscribeRefs = useRef([]);

//   // Function to remove duplicate conversations
//   const getUniqueConversations = (conversations) => {
//     const seen = new Set();
//     return conversations.filter(conversation => {
//       // Use chatroomId as the unique identifier since it's unique per conversation
//       const key = conversation.chatroomId;
//       if (seen.has(key)) {
//         console.log('Removing duplicate conversation with chatroomId:', key);
//         return false;
//       }
//       seen.add(key);
//       return true;
//     });
//   };

//   console.log("Greatness..........host");
//   console.log("Total unread count:", totalUnreadCount);

//   // Reset unread count when entering a chat
//   const resetUnreadCountForChat = useCallback(async (chatroomId, friendUserId) => {
//     try {
//       const unreadRef = ref(db, `unreadMessages/${chatroomId}/${currentUserId}/${friendUserId}`);
//       await set(unreadRef, 0);
      
//       // Update local state immediately for better UX
//       setFriendsWithLastMessagesUnreadCount(prev => 
//         prev.map(friend => 
//           friend.userId === friendUserId 
//             ? { ...friend, unreadCount: 0 }
//             : friend
//         )
//       );

//     } catch (error) {
//       console.error("Error resetting unread count:", error);
//     }
//   }, [currentUserId]);

//   const fetchData = async () => {
//     setRefreshing(true);
//     const friendsRef = ref(db, `users/${currentUserId}/friends`);
    
//     const handleFriendsUpdate = async (snapshot) => {
//       console.log("🔥 handleFriendsUpdate triggered:", snapshot.exists());
//       setLoading(true);
     
//       if (!snapshot.exists()) {
//         console.log("⚠️ No friends data found for user:", currentUserId);
//         setFriendsWithLastMessagesUnreadCount([]);
//         setTotalUnreadCount(0);
//         setLoading(false);
//         setRefreshing(false);
//         return;
//       }

//       try {
//         const friendsData = snapshot.val();
//         const friendsArray = Object.values(friendsData) || [];
//         const updatedFriendsWithMessages = [];
//         let totalUnread = 0;

//         // Process friends in parallel for better performance
//         const friendPromises = friendsArray.map(async (friend) => {
//           const chatroomId = friend.chatroomId;
//           const chatroomRef = ref(db, `chatrooms/${chatroomId}`);
//           const chatroomSnapshot = await get(chatroomRef);
//           const chatroomData = chatroomSnapshot.val();

//           if (chatroomData && chatroomData.messages) {
//             const messages = chatroomData.messages;
//             const lastMsg = messages[messages.length - 1];
            
//             const lastmessage = {
//               text: lastMsg?.text || null,
//               sender: lastMsg?.sender || null,
//               createdAt: lastMsg?.createdAt || null,
//               image: lastMsg?.image || null,
//             };

//             // Get unread count
//             const unreadRef = ref(db, `unreadMessages/${chatroomId}/${currentUserId}/${friend.userId}`);
//             const unreadSnapshot = await get(unreadRef);
//             const unreadCount = unreadSnapshot.val() || 0;
            
//             totalUnread += unreadCount;

//             return {
//               ...friend,
//               lastmessage,
//               unreadCount,
//               chatroomId,
//               lastMessageTime: lastMsg?.createdAt ? new Date(lastMsg.createdAt).getTime() : 0
//             };
//           }
//           return null;
//         });

//         const results = await Promise.all(friendPromises);
//         const validFriends = results.filter(friend => friend !== null);

//         // Remove duplicates before setting state
//         const uniqueFriends = getUniqueConversations(validFriends);

//         // Sort by last message time (newest first)
//         uniqueFriends.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

//         setFriendsWithLastMessagesUnreadCount(uniqueFriends);
//         setTotalUnreadCount(totalUnread);
        
//         // Update the ref with current friends for real-time updates
//         friendsRef.current = uniqueFriends;

//       } catch (error) {
//         console.error("Error processing friends data:", error);
//       } finally {
//         setLoading(false);
//         setRefreshing(false);
//       }
//     };

//     const unsubscribe = onValue(friendsRef, handleFriendsUpdate);
//     return () => unsubscribe();
//   };

//   useEffect(() => {
//     fetchData();
//   }, [currentUserId, setTotalUnreadCount]);

//   // Real-time listener for new messages - FIXED VERSION
//   useEffect(() => {
//     // Clean up previous listeners
//     unsubscribeRefs.current.forEach(unsub => unsub && unsub());
//     unsubscribeRefs.current = [];

//     if (friendsWithLastMessagesUnread.length === 0) return;

//     // Set up listeners for each chatroom
//     const newUnsubscribes = friendsWithLastMessagesUnread.map(friend => {
//       const messagesRef = ref(db, `chatrooms/${friend.chatroomId}/messages`);
      
//       return onChildAdded(messagesRef, (snapshot) => {
//         const newMessage = snapshot.val();
//         if (!newMessage) return;

//         // Update the state with the new message
//         setFriendsWithLastMessagesUnreadCount(prev => {
//           const updated = prev.map(f => {
//             if (f.chatroomId === friend.chatroomId) {
//               return {
//                 ...f,
//                 lastmessage: {
//                   text: newMessage.text,
//                   sender: newMessage.sender,
//                   createdAt: newMessage.createdAt,
//                   image: newMessage.image
//                 },
//                 lastMessageTime: new Date(newMessage.createdAt).getTime()
//               };
//             }
//             return f;
//           });
          
//           // Sort by last message time
//           return updated.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
//         });
//       });
//     });

//     unsubscribeRefs.current = newUnsubscribes;

//     // Cleanup function
//     return () => {
//       unsubscribeRefs.current.forEach(unsub => unsub && unsub());
//       unsubscribeRefs.current = [];
//     };
//   }, [friendsWithLastMessagesUnread.length]); // Only depend on length, not the full array

//   // Separate useEffect to calculate total unread count
//   useEffect(() => {
//     const totalUnread = friendsWithLastMessagesUnread.reduce(
//       (total, friend) => total + (friend.unreadCount || 0), 
//       0
//     );
//     setTotalUnreadCount(totalUnread);
//   }, [friendsWithLastMessagesUnread, setTotalUnreadCount]);

//   const handleChatPress = async (item, index) => {
//     // Reset unread count for this chat
//     await resetUnreadCountForChat(item.chatroomId, item.userId);
    
//     // Navigate to chat
//     navigation.navigate(ROUTES.chat_conversation, {
//       selectedUser: item,
//       fbaseUser: fbaseUser,
//       schedule: item,
//       friendIndex: index
//     });
//   };

//   const truncateString = (str) => {
//     if (!str) return '';
//     const maxLength = 40;
//     return str.length > maxLength ? str.slice(0, maxLength - 3) + '...' : str;
//   };

//   const getMessagePreview = (item) => {
//     if (item.lastmessage?.image) {
//       return '📷 Image';
//     }
//     return truncateString(item.lastmessage?.text || '');
//   };

//   const singleItem = (item, index) => (
//     <TouchableOpacity 
//       style={styles.categoryBtn} 
//       onPress={() => handleChatPress(item, index)}
//     >
//       <View style={styles.chatItemContainer}>
//         <View style={styles.avatarContainer}>
//           {item.avatar ? 
//             <Image 
//               source={{uri: item.avatar}}
//               style={styles.avatar} 
//             />
//             :
//             <Image
//               source={require('../../assets/images/default_avatar.png')}
//               style={styles.avatar} 
//             />
//           }
//         </View>
        
//         <View style={styles.messageContent}>
//           <Text style={styles.userName}>{item.firstname} {item.lastname}</Text>
//           <Text style={styles.scheduleText}>
//             <AntDesign name="home" size={14} color={COLORS.gray}/> 
//             {item.schedule?.apartment_name}
//           </Text>
//           <Text style={styles.scheduleText}>
//             <MaterialCommunityIcons name="calendar" size={14} color={COLORS.gray} /> 
//             {moment(item.schedule?.cleaning_date).format('ddd MMM D')}  
//             {moment(item.schedule?.cleaning_time, 'h:mm:ss A').format('h:mm A')}
//           </Text>
          
//           {item.lastmessage && (
//             <View style={styles.messagePreview}>
//               {item.lastmessage.sender === currentUserId && (
//                 <Ionicons 
//                   name="checkmark-done" 
//                   size={16} 
//                   color={item.unreadCount < 1 ? COLORS.primary : COLORS.gray} 
//                 />
//               )}
//               <Text 
//                 style={[
//                   styles.messageText,
//                   item.unreadCount > 0 && styles.unreadMessageText
//                 ]}
//                 numberOfLines={1}
//               >
//                 {getMessagePreview(item)}
//               </Text>
//             </View>
//           )}
//         </View>
    
//         <View style={styles.timeAndBadge}>
//           <Text style={styles.timeText}>
//             {moment(item.lastmessage?.createdAt).format('h:mm A')}
//           </Text>
//           {item.unreadCount > 0 && (
//             <View style={[
//               styles.unreadBadge,
//               item.unreadCount > 9 && styles.largeUnreadBadge
//             ]}>
//               <Text style={styles.unreadCount}>
//                 {item.unreadCount > 99 ? '99+' : item.unreadCount}
//               </Text>
//             </View>
//           )}
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   const itemSeparator = () => (
//     <View style={styles.item_separator}></View>
//   );

//   const emptyListing = () => (
//     <View style={styles.emptyContainer}>
//       <MaterialCommunityIcons 
//         name="email-outline"
//         size={54}
//         color="#ccc"
//         style={styles.emptyIcon}
//       />
//       <Text style={styles.emptyMessage}>
//         You have no messages yet. Please check back later or refresh to load the latest messages.
//       </Text>
//     </View>
//   );

//   return (
//     <View style={{ flex: 1, padding:10 }}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
//       {loading ? (
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text style={styles.loadingText}>Loading messages...</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={friendsWithLastMessagesUnread}
//           renderItem={({ item, index }) => singleItem(item, index)}
//           ListEmptyComponent={emptyListing}
//           ItemSeparatorComponent={itemSeparator}
//           keyExtractor={(item) => item.chatroomId} // Use chatroomId as it's unique
//           numColumns={1}
//           showsVerticalScrollIndicator={false}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={fetchData}
//               colors={[COLORS.primary]}
//               tintColor={COLORS.primary}
//             />
//           }
//         />
//       )}
//     </View>
//   );
// };

// export default Messages;

// // ... your styles remain the same

// const styles = StyleSheet.create({
//   container: {
//     margin: 15
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     color: COLORS.gray,
//     fontSize: 16,
//   },
//   chatItemContainer: {
//     flexDirection: 'row',
//     paddingVertical: 10,
//     paddingHorizontal: 10,
//     alignItems: 'center'
//   },
//   avatarContainer: {
//     position: 'relative',
//     marginRight: 12,
//   },
//   avatar: {
//     height: 50,
//     width: 50,
//     borderRadius: 25,
//     borderWidth: 2,
//     borderColor: COLORS.light_gray_1,
//   },
//   messageContent: {
//     flex: 1,
//   },
//   userName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: COLORS.secondary,
//     marginBottom: 2,
//   },
//   scheduleText: {
//     fontSize: 13,
//     color: COLORS.gray,
//     marginBottom: 2,
//   },
//   messagePreview: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 4,
//   },
//   messageText: {
//     fontSize: 14,
//     color: COLORS.gray,
//     marginLeft: 4,
//     flex: 1,
//   },
//   unreadMessageText: {
//     color: COLORS.secondary,
//     fontWeight: '500',
//   },
//   timeAndBadge: {
//     alignItems: 'flex-end',
//     justifyContent: 'space-between',
//     minHeight: 50,
//   },
//   timeText: {
//     fontSize: 11,
//     color: COLORS.gray,
//     marginBottom: 4,
//   },
//   unreadBadge: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 12,
//     minWidth: 20,
//     height: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 6,
//   },
//   largeUnreadBadge: {
//     minWidth: 24,
//     height: 20,
//   },
//   unreadCount: {
//     fontSize: 11,
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   item_separator: {
//     marginTop: 5,
//     marginBottom: 5,
//     height: 1,
//     width: "100%",
//     backgroundColor: "#E4E4E4",
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: '65%',
//     marginHorizontal: 20
//   },
//   emptyIcon: {
//     marginBottom: 12,
//   },
//   emptyMessage: {
//     fontSize: 16,
//     color: '#555',
//     textAlign: 'center',
//     lineHeight: 24,
//   },
//   categoryBtn: {
//     backgroundColor: 'white',
//     marginHorizontal: 8,
//     borderRadius: 8,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 1,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
// });



import { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { 
  SafeAreaView, 
  StyleSheet, 
  StatusBar, 
  Text, 
  RefreshControl, 
  Linking, 
  FlatList, 
  ScrollView, 
  Modal, 
  Image, 
  View, 
  TouchableOpacity, 
  ActivityIndicator,
  Animated,
  TextInput
} from 'react-native';
import {
  get,
  ref,
  set,
  off,
  onValue,
  push,
  update,
  onChildAdded
} from 'firebase/database';
import { db } from '../../services/firebase/config';
import COLORS from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import ROUTES from '../../constants/routes';
import moment from 'moment';
import { 
  MaterialCommunityIcons, 
  Ionicons, 
  AntDesign, 
  Feather, 
  FontAwesome5,
  MaterialIcons,
  Entypo 
} from '@expo/vector-icons';

const Messages = ({navigation}) => {
  const {
    currentUserId,
    fbaseUser,
    setTotalUnreadCount,
    totalUnreadCount,
    notificationUnreadCount
  } = useContext(AuthContext);

  const [friendsWithLastMessagesUnread, setFriendsWithLastMessagesUnreadCount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'unread', 'scheduled'
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const searchAnim = useRef(new Animated.Value(0)).current;
  const filtersAnim = useRef(new Animated.Value(0)).current;
  
  const friendsRef = useRef([]);
  const unsubscribeRefs = useRef([]);

  // Animate search bar
  useEffect(() => {
    Animated.timing(searchAnim, {
      toValue: isSearchFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isSearchFocused]);

  // Animate filters
  useEffect(() => {
    Animated.spring(filtersAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const getUniqueConversations = (conversations) => {
    const seen = new Set();
    return conversations.filter(conversation => {
      const key = conversation.chatroomId;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const resetUnreadCountForChat = useCallback(async (chatroomId, friendUserId) => {
    try {
      const unreadRef = ref(db, `unreadMessages/${chatroomId}/${currentUserId}/${friendUserId}`);
      await set(unreadRef, 0);
      
      setFriendsWithLastMessagesUnreadCount(prev => 
        prev.map(friend => 
          friend.userId === friendUserId 
            ? { ...friend, unreadCount: 0 }
            : friend
        )
      );
    } catch (error) {
      console.error("Error resetting unread count:", error);
    }
  }, [currentUserId]);

  const fetchData = async () => {
    setRefreshing(true);
    const friendsRef = ref(db, `users/${currentUserId}/friends`);
    
    const handleFriendsUpdate = async (snapshot) => {
      setLoading(true);
     
      if (!snapshot.exists()) {
        setFriendsWithLastMessagesUnreadCount([]);
        setTotalUnreadCount(0);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        const friendsData = snapshot.val();
        const friendsArray = Object.values(friendsData) || [];
        let totalUnread = 0;

        const friendPromises = friendsArray.map(async (friend) => {
          const chatroomId = friend.chatroomId;
          const chatroomRef = ref(db, `chatrooms/${chatroomId}`);
          const chatroomSnapshot = await get(chatroomRef);
          const chatroomData = chatroomSnapshot.val();

          if (chatroomData && chatroomData.messages) {
            const messages = chatroomData.messages;
            const lastMsg = messages[messages.length - 1];
            
            const lastmessage = {
              text: lastMsg?.text || null,
              sender: lastMsg?.sender || null,
              createdAt: lastMsg?.createdAt || null,
              image: lastMsg?.image || null,
            };

            const unreadRef = ref(db, `unreadMessages/${chatroomId}/${currentUserId}/${friend.userId}`);
            const unreadSnapshot = await get(unreadRef);
            const unreadCount = unreadSnapshot.val() || 0;
            
            totalUnread += unreadCount;

            return {
              ...friend,
              lastmessage,
              unreadCount,
              chatroomId,
              lastMessageTime: lastMsg?.createdAt ? new Date(lastMsg.createdAt).getTime() : 0
            };
          }
          return null;
        });

        const results = await Promise.all(friendPromises);
        const validFriends = results.filter(friend => friend !== null);
        const uniqueFriends = getUniqueConversations(validFriends);
        uniqueFriends.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

        setFriendsWithLastMessagesUnreadCount(uniqueFriends);
        setTotalUnreadCount(totalUnread);
        friendsRef.current = uniqueFriends;

      } catch (error) {
        console.error("Error processing friends data:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    const unsubscribe = onValue(friendsRef, handleFriendsUpdate);
    return () => unsubscribe();
  };

  useEffect(() => {
    fetchData();
  }, [currentUserId, setTotalUnreadCount]);

  // Real-time listener for new messages
  useEffect(() => {
    unsubscribeRefs.current.forEach(unsub => unsub && unsub());
    unsubscribeRefs.current = [];

    if (friendsWithLastMessagesUnread.length === 0) return;

    const newUnsubscribes = friendsWithLastMessagesUnread.map(friend => {
      const messagesRef = ref(db, `chatrooms/${friend.chatroomId}/messages`);
      
      return onChildAdded(messagesRef, (snapshot) => {
        const newMessage = snapshot.val();
        if (!newMessage) return;

        setFriendsWithLastMessagesUnreadCount(prev => {
          const updated = prev.map(f => {
            if (f.chatroomId === friend.chatroomId) {
              return {
                ...f,
                lastmessage: {
                  text: newMessage.text,
                  sender: newMessage.sender,
                  createdAt: newMessage.createdAt,
                  image: newMessage.image
                },
                lastMessageTime: new Date(newMessage.createdAt).getTime()
              };
            }
            return f;
          });
          
          return updated.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
        });
      });
    });

    unsubscribeRefs.current = newUnsubscribes;

    return () => {
      unsubscribeRefs.current.forEach(unsub => unsub && unsub());
      unsubscribeRefs.current = [];
    };
  }, [friendsWithLastMessagesUnread.length]);

  useEffect(() => {
    const totalUnread = friendsWithLastMessagesUnread.reduce(
      (total, friend) => total + (friend.unreadCount || 0), 
      0
    );
    setTotalUnreadCount(totalUnread);
  }, [friendsWithLastMessagesUnread, setTotalUnreadCount]);

  const handleChatPress = async (item, index) => {
    await resetUnreadCountForChat(item.chatroomId, item.userId);
    
    navigation.navigate(ROUTES.chat_conversation, {
      selectedUser: item,
      fbaseUser: fbaseUser,
      schedule: item,
      friendIndex: index
    });
  };

  const truncateString = (str) => {
    if (!str) return '';
    const maxLength = 30;
    return str.length > maxLength ? str.slice(0, maxLength - 3) + '...' : str;
  };

  const getMessagePreview = (item) => {
    if (item.lastmessage?.image) {
      return '📷 Image';
    }
    return truncateString(item.lastmessage?.text || '');
  };

  // Filter conversations based on search and filter
  const filteredConversations = friendsWithLastMessagesUnread.filter(friend => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      `${friend.firstname} ${friend.lastname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.schedule?.apartment_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    let matchesFilter = true;
    if (selectedFilter === 'unread') {
      matchesFilter = friend.unreadCount > 0;
    } else if (selectedFilter === 'scheduled') {
      matchesFilter = friend.schedule && friend.schedule.cleaning_date;
    }
    
    return matchesSearch && matchesFilter;
  });

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = moment();
    const messageTime = moment(timestamp);
    
    if (now.diff(messageTime, 'days') < 1) {
      return messageTime.format('h:mm A');
    } else if (now.diff(messageTime, 'days') < 7) {
      return messageTime.format('ddd');
    } else {
      return messageTime.format('MMM D');
    }
  };

  const singleItem = ({ item, index }) => (
    <TouchableOpacity 
      style={[
        styles.chatItemContainer,
        item.unreadCount > 0 && styles.unreadChatItem
      ]}
      onPress={() => handleChatPress(item, index)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {item.avatar ? 
          <Image 
            source={{uri: item.avatar}}
            style={styles.avatar} 
          />
          :
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarText}>
              {getInitials(item.firstname, item.lastname)}
            </Text>
          </View>
        }
        {item.unreadCount > 0 && (
          <View style={styles.unreadIndicator} />
        )}
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={[
            styles.userName,
            item.unreadCount > 0 && styles.unreadUserName
          ]}>
            {item.firstname} {item.lastname}
          </Text>
          <Text style={styles.timeText}>
            {formatTime(item.lastmessage?.createdAt)}
          </Text>
        </View>
        
        <View style={styles.chatDetails}>
          <View style={styles.propertyInfo}>
            <MaterialIcons name="location-on" size={14} color="#6B7280" />
            <Text style={styles.propertyText} numberOfLines={1}>
              {item.schedule?.apartment_name || 'No property assigned'}
            </Text>
          </View>
          
          <View style={styles.scheduleInfo}>
            <MaterialCommunityIcons name="calendar-clock" size={14} color="#6B7280" />
            <Text style={styles.scheduleText}>
              {item.schedule?.cleaning_date ? 
                moment(item.schedule.cleaning_date).format('MMM D') + ' • ' + 
                moment(item.schedule.cleaning_time, 'h:mm:ss A').format('h:mm A')
                : 'No schedule'
              }
            </Text>
          </View>
        </View>
        
        <View style={styles.messagePreview}>
          <View style={styles.messageTextContainer}>
            {item.lastmessage?.sender === currentUserId && (
              <Ionicons 
                name="checkmark-done" 
                size={16} 
                color={item.lastmessage?.read ? '#10B981' : '#9CA3AF'} 
                style={styles.readIndicator}
              />
            )}
            <Text 
              style={[
                styles.messageText,
                item.unreadCount > 0 && styles.unreadMessageText
              ]}
              numberOfLines={1}
            >
              {getMessagePreview(item)}
            </Text>
          </View>
          
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <Entypo 
        name="chevron-right" 
        size={20} 
        color="#D1D5DB" 
        style={styles.chevron}
      />
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSubtitle}>
            {totalUnreadCount > 0 
              ? `${totalUnreadCount} unread message${totalUnreadCount > 1 ? 's' : ''}`
              : 'All caught up!'
            }
          </Text>
        </View>
        {/* <TouchableOpacity style={styles.newChatButton}>
          <Feather name="edit-3" size={20} color="#FFF" />
        </TouchableOpacity> */}

        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate(ROUTES.notification)}
        >
          <MaterialCommunityIcons name="bell-outline" size={24} color="#1C1C1E" />
          {notificationUnreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{notificationUnreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

      </View>
      
      <Animated.View 
        style={[
          styles.searchContainer,
          {
            transform: [{
              scale: searchAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.02]
              })
            }]
          }
        ]}
      >
        <Feather 
          name="search" 
          size={20} 
          color="#9CA3AF" 
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </Animated.View>
      
      <Animated.ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={[
          styles.filtersContainer,
          {
            opacity: filtersAnim,
            transform: [{
              translateY: filtersAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })
            }]
          }
        ]}
      >
        <TouchableOpacity 
          style={[
            styles.filterButton,
            selectedFilter === 'all' && styles.filterButtonActive
          ]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[
            styles.filterText,
            selectedFilter === 'all' && styles.filterTextActive
          ]}>
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton,
            selectedFilter === 'unread' && styles.filterButtonActive
          ]}
          onPress={() => setSelectedFilter('unread')}
        >
          <View style={styles.filterBadge}>
            <Text style={[
              styles.filterText,
              selectedFilter === 'unread' && styles.filterTextActive
            ]}>
              Unread
            </Text>
            {totalUnreadCount > 0 && (
              <View style={styles.filterNotification}>
                <Text style={styles.filterNotificationText}>
                  {totalUnreadCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton,
            selectedFilter === 'scheduled' && styles.filterButtonActive
          ]}
          onPress={() => setSelectedFilter('scheduled')}
        >
          <Text style={[
            styles.filterText,
            selectedFilter === 'scheduled' && styles.filterTextActive
          ]}>
            Scheduled
          </Text>
        </TouchableOpacity>
      </Animated.ScrollView>
    </View>
  );

  const emptyListing = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIllustration}>
        <MaterialCommunityIcons 
          name="chat-outline"
          size={80}
          color="#E5E7EB"
        />
      </View>
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No conversations found' : 'No messages yet'}
      </Text>
      <Text style={styles.emptyMessage}>
        {searchQuery 
          ? 'Try adjusting your search or filter to find what you\'re looking for.'
          : 'When you start chatting with cleaners or hosts, your conversations will appear here.'
        }
      </Text>
      {!searchQuery && (
        <TouchableOpacity 
          style={styles.emptyButton}
          onPress={() => navigation.navigate(ROUTES.cleaner_dashboard)}
        >
          <Text style={styles.emptyButtonText}>Find Cleaners</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {renderHeader()}
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your conversations...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={singleItem}
          ListEmptyComponent={emptyListing}
          keyExtractor={(item) => item.chatroomId}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchData}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
              progressBackgroundColor="#F9FAFB"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default Messages;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#F9FAFB',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  newChatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    padding: 0,
  },
  filtersContainer: {
    marginBottom: 10,
  },
  filterButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFF',
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterNotification: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    paddingHorizontal: 4,
  },
  filterNotificationText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  chatItemContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  unreadChatItem: {
    borderColor: COLORS.primary + '20',
    backgroundColor: COLORS.primary + '08',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  unreadUserName: {
    color: '#111827',
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  chatDetails: {
    marginBottom: 10,
  },
  propertyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  propertyText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
  },
  messagePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  readIndicator: {
    marginRight: 6,
  },
  messageText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  unreadMessageText: {
    color: '#111827',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  chevron: {
    marginLeft: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 60,
  },
  emptyIllustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 8,
    borderColor: '#F3F4F6',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
});