// import { useEffect, useState, useCallback, useContext, useRef } from 'react';
// import { 
//   SafeAreaView, 
//   StyleSheet, 
//   Text, 
//   RefreshControl, 
//   StatusBar, 
//   FlatList, 
//   Image, 
//   View, 
//   TouchableOpacity, 
//   ActivityIndicator,
//   Animated,
//   TextInput
// } from 'react-native';
// import {
//   get,
//   ref,
//   set,
//   onValue,
//   off,
//   push,
//   update,
//   onChildAdded
// } from 'firebase/database';
// import { db } from '../../services/firebase/config';
// import COLORS from '../../constants/colors';
// import { AuthContext } from '../../context/AuthContext';
// import ROUTES from '../../constants/routes';
// import { 
//   MaterialCommunityIcons, 
//   Ionicons, 
//   AntDesign, 
//   Feather, 
//   MaterialIcons,
//   Entypo,
//   FontAwesome5
// } from '@expo/vector-icons';
// import moment from 'moment';
// import { useFocusEffect } from '@react-navigation/native';
// import { tSafe } from '../../utils/tSafe'; // added import

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
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedFilter, setSelectedFilter] = useState('all');
//   const [isSearchFocused, setIsSearchFocused] = useState(false);
  
//   const searchAnim = useRef(new Animated.Value(0)).current;
//   const filtersAnim = useRef(new Animated.Value(0)).current;
//   const unsubscribeRefs = useRef([]);

//   // Animate search bar
//   useEffect(() => {
//     Animated.timing(searchAnim, {
//       toValue: isSearchFocused ? 1 : 0,
//       duration: 200,
//       useNativeDriver: true,
//     }).start();
//   }, [isSearchFocused]);

//   // Animate filters
//   useEffect(() => {
//     Animated.spring(filtersAnim, {
//       toValue: 1,
//       tension: 50,
//       friction: 7,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   const resetUnreadCountForChat = useCallback(async (chatroomId, friendUserId) => {
//     try {
//       const unreadRef = ref(db, `unreadMessages/${chatroomId}/${currentUserId}/${friendUserId}`);
//       await set(unreadRef, 0);
      
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
//       setLoading(true);
     
//       if (!snapshot.exists()) {
//         setFriendsWithLastMessagesUnreadCount([]);
//         setTotalUnreadCount(0);
//         setLoading(false);
//         setRefreshing(false);
//         return;
//       }

//       try {
//         const friendsData = snapshot.val();
//         const friendsArray = Object.values(friendsData) || [];
//         let totalUnread = 0;

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
//         validFriends.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

//         setFriendsWithLastMessagesUnreadCount(validFriends);
//         setTotalUnreadCount(totalUnread);

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

//   // Real-time listener for new messages
//   useEffect(() => {
//     unsubscribeRefs.current.forEach(unsub => unsub && unsub());
//     unsubscribeRefs.current = [];

//     if (friendsWithLastMessagesUnread.length === 0) return;

//     const newUnsubscribes = friendsWithLastMessagesUnread.map(friend => {
//       const messagesRef = ref(db, `chatrooms/${friend.chatroomId}/messages`);
      
//       return onChildAdded(messagesRef, (snapshot) => {
//         const newMessage = snapshot.val();
//         if (!newMessage) return;

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
          
//           return updated.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
//         });
//       });
//     });

//     unsubscribeRefs.current = newUnsubscribes;

//     return () => {
//       unsubscribeRefs.current.forEach(unsub => unsub && unsub());
//       unsubscribeRefs.current = [];
//     };
//   }, [friendsWithLastMessagesUnread.length]);

//   useEffect(() => {
//     const totalUnread = friendsWithLastMessagesUnread.reduce(
//       (total, friend) => total + (friend.unreadCount || 0), 
//       0
//     );
//     setTotalUnreadCount(totalUnread);
//   }, [friendsWithLastMessagesUnread, setTotalUnreadCount]);

//   const handleChatPress = async (item, index) => {
//     await resetUnreadCountForChat(item.chatroomId, item.userId);
    
//     navigation.navigate(ROUTES.cleaner_chat_conversation, {
//       selectedUser: item,
//       fbaseUser: fbaseUser,
//       schedule: item.schedule,
//       friendIndex: index
//     });
//   };

//   const truncateString = (str) => {
//     if (!str) return '';
//     const maxLength = 30;
//     return str.length > maxLength ? str.slice(0, maxLength - 3) + '...' : str;
//   };

//   const getMessagePreview = (item) => {
//     if (item.lastmessage?.image) {
//       return tSafe('image_preview', '📷 Image');
//     }
//     return truncateString(item.lastmessage?.text || '');
//   };

//   // Filter conversations
//   const filteredConversations = friendsWithLastMessagesUnread.filter(friend => {
//     const matchesSearch = searchQuery === '' || 
//       `${friend.firstname} ${friend.lastname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       friend.schedule?.apartment_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
//     let matchesFilter = true;
//     if (selectedFilter === 'unread') {
//       matchesFilter = friend.unreadCount > 0;
//     } else if (selectedFilter === 'scheduled') {
//       matchesFilter = friend.schedule && friend.schedule.cleaning_date;
//     } else if (selectedFilter === 'today') {
//       if (!friend.schedule?.cleaning_date) return false;
//       const today = moment().format('YYYY-MM-DD');
//       matchesFilter = moment(friend.schedule.cleaning_date).format('YYYY-MM-DD') === today;
//     }
    
//     return matchesSearch && matchesFilter;
//   });

//   const getInitials = (firstName, lastName) => {
//     return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
//   };

//   const formatTime = (timestamp) => {
//     if (!timestamp) return '';
    
//     const now = moment();
//     const messageTime = moment(timestamp);
    
//     if (now.diff(messageTime, 'days') < 1) {
//       return messageTime.format('h:mm A');
//     } else if (now.diff(messageTime, 'days') < 7) {
//       return messageTime.format('ddd');
//     } else {
//       return messageTime.format('MMM D');
//     }
//   };

//   const getScheduleStatusColor = (schedule) => {
//     if (!schedule) return '#9CA3AF';
    
//     const now = moment();
//     const cleaningDate = moment(schedule.cleaning_date);
    
//     if (cleaningDate.isSame(now, 'day')) {
//       return '#10B981'; // Green for today
//     } else if (cleaningDate.isBefore(now)) {
//       return '#EF4444'; // Red for past
//     } else {
//       return '#3B82F6'; // Blue for future
//     }
//   };

//   const singleItem = ({ item, index }) => (
//     <TouchableOpacity 
//       style={[
//         styles.chatItemContainer,
//         item.unreadCount > 0 && styles.unreadChatItem
//       ]}
//       onPress={() => handleChatPress(item, index)}
//       activeOpacity={0.7}
//     >
//       <View style={styles.avatarContainer}>
//         {item.avatar ? 
//           <Image 
//             source={{uri: item.avatar}}
//             style={styles.avatar} 
//           />
//           :
//           <View style={[styles.avatar, styles.avatarFallback]}>
//             <Text style={styles.avatarText}>
//               {getInitials(item.firstname, item.lastname)}
//             </Text>
//           </View>
//         }
//         {item.unreadCount > 0 && (
//           <View style={styles.unreadIndicator} />
//         )}
//       </View>
      
//       <View style={styles.chatContent}>
//         <View style={styles.chatHeader}>
//           <View style={styles.nameContainer}>
//             <Text style={[
//               styles.userName,
//               item.unreadCount > 0 && styles.unreadUserName
//             ]}>
//               {item.firstname} {item.lastname}
//             </Text>
//             {item.schedule?.property_type === 'host' && (
//               <View style={styles.hostBadge}>
//                 <FontAwesome5 name="crown" size={10} color="#FBBF24" />
//                 <Text style={styles.hostBadgeText}>{tSafe('host', 'Host')}</Text>
//               </View>
//             )}
//           </View>
//           <Text style={styles.timeText}>
//             {formatTime(item.lastmessage?.createdAt)}
//           </Text>
//         </View>
        
//         <View style={styles.chatDetails}>
//           <View style={styles.propertyInfo}>
//             <MaterialIcons name="location-on" size={14} color="#6B7280" />
//             <Text style={styles.propertyText} numberOfLines={1}>
//               {item.schedule?.apartment_name || tSafe('no_property_assigned', 'No property assigned')}
//             </Text>
//           </View>
          
//           {item.schedule && (
//             <View style={styles.scheduleInfo}>
//               <MaterialCommunityIcons 
//                 name="calendar-clock" 
//                 size={14} 
//                 color={getScheduleStatusColor(item.schedule)} 
//               />
//               <Text style={[
//                 styles.scheduleText,
//                 { color: getScheduleStatusColor(item.schedule) }
//               ]}>
//                 {moment(item.schedule.cleaning_date).format('MMM D')} • 
//                 {moment(item.schedule.cleaning_time, 'h:mm:ss A').format('h:mm A')}
//               </Text>
//               <View style={[
//                 styles.scheduleStatusDot,
//                 { backgroundColor: getScheduleStatusColor(item.schedule) }
//               ]} />
//             </View>
//           )}
//         </View>
        
//         <View style={styles.messagePreview}>
//           <View style={styles.messageTextContainer}>
//             {item.lastmessage?.sender === currentUserId && (
//               <Ionicons 
//                 name="checkmark-done" 
//                 size={16} 
//                 color={item.lastmessage?.read ? '#10B981' : '#9CA3AF'} 
//                 style={styles.readIndicator}
//               />
//             )}
//             <Text 
//               style={[
//                 styles.messageText,
//                 item.unreadCount > 0 && styles.unreadMessageText
//               ]}
//               numberOfLines={1}
//             >
//               {item.lastmessage?.sender === currentUserId 
//                 ? tSafe('you_prefix', 'You:') + ' ' + getMessagePreview(item)
//                 : getMessagePreview(item)
//               }
//             </Text>
//           </View>
          
//           {item.unreadCount > 0 && (
//             <View style={styles.unreadBadge}>
//               <Text style={styles.unreadCount}>
//                 {item.unreadCount > 99 ? '99+' : item.unreadCount}
//               </Text>
//             </View>
//           )}
//         </View>
//       </View>
      
//       <Entypo 
//         name="chevron-right" 
//         size={20} 
//         color="#D1D5DB" 
//         style={styles.chevron}
//       />
//     </TouchableOpacity>
//   );

//   const renderHeader = () => (
//     <View style={styles.header}>
//       <View style={styles.headerTop}>
//         <View>
//           <Text style={styles.headerTitle}>{tSafe('messages_title', 'Messages')}</Text>
//           <Text style={styles.headerSubtitle}>
//             {totalUnreadCount > 0 
//               ? tSafe('unread_messages_count', '{count} unread message{s}', { count: totalUnreadCount, s: totalUnreadCount > 1 ? 's' : '' })
//               : tSafe('all_messages_read', 'All messages read')
//             }
//           </Text>
//         </View>
//         <View style={styles.headerIcons}>
//           <TouchableOpacity style={styles.headerIconButton}>
//             <MaterialCommunityIcons name="bell-outline" size={22} color="#6B7280" />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.profileButton}>
//             <Image
//               source={fbaseUser?.avatar ? { uri: fbaseUser.avatar } : require('../../assets/images/default_avatar.png')}
//               style={styles.profileImage}
//             />
//           </TouchableOpacity>
//         </View>
//       </View>
      
//       <Animated.View 
//         style={[
//           styles.searchContainer,
//           {
//             transform: [{
//               scale: searchAnim.interpolate({
//                 inputRange: [0, 1],
//                 outputRange: [1, 1.02]
//               })
//             }]
//           }
//         ]}
//       >
//         <Feather 
//           name="search" 
//           size={20} 
//           color="#9CA3AF" 
//           style={styles.searchIcon}
//         />
//         <TextInput
//           style={styles.searchInput}
//           placeholder={tSafe('search_placeholder', 'Search hosts or properties...')}
//           placeholderTextColor="#9CA3AF"
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//           onFocus={() => setIsSearchFocused(true)}
//           onBlur={() => setIsSearchFocused(false)}
//         />
//         {searchQuery.length > 0 && (
//           <TouchableOpacity onPress={() => setSearchQuery('')}>
//             <Ionicons name="close-circle" size={20} color="#9CA3AF" />
//           </TouchableOpacity>
//         )}
//       </Animated.View>
      
//       <Animated.ScrollView 
//         horizontal 
//         showsHorizontalScrollIndicator={false}
//         style={[
//           styles.filtersContainer,
//           {
//             opacity: filtersAnim,
//             transform: [{
//               translateY: filtersAnim.interpolate({
//                 inputRange: [0, 1],
//                 outputRange: [20, 0]
//               })
//             }]
//           }
//         ]}
//       >
//         <TouchableOpacity 
//           style={[
//             styles.filterButton,
//             selectedFilter === 'all' && styles.filterButtonActive
//           ]}
//           onPress={() => setSelectedFilter('all')}
//         >
//           <Feather 
//             name="message-square" 
//             size={16} 
//             color={selectedFilter === 'all' ? '#FFF' : '#6B7280'} 
//             style={styles.filterIcon}
//           />
//           <Text style={[
//             styles.filterText,
//             selectedFilter === 'all' && styles.filterTextActive
//           ]}>
//             {tSafe('filter_all', 'All')}
//           </Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity 
//           style={[
//             styles.filterButton,
//             selectedFilter === 'unread' && styles.filterButtonActive
//           ]}
//           onPress={() => setSelectedFilter('unread')}
//         >
//           <View style={styles.filterBadgeContainer}>
//             <Feather 
//               name="mail" 
//               size={16} 
//               color={selectedFilter === 'unread' ? '#FFF' : '#6B7280'} 
//               style={styles.filterIcon}
//             />
//             <Text style={[
//               styles.filterText,
//               selectedFilter === 'unread' && styles.filterTextActive
//             ]}>
//               {tSafe('filter_unread', 'Unread')}
//             </Text>
//             {totalUnreadCount > 0 && (
//               <View style={styles.filterNotification}>
//                 <Text style={styles.filterNotificationText}>
//                   {totalUnreadCount}
//                 </Text>
//               </View>
//             )}
//           </View>
//         </TouchableOpacity>
        
//         <TouchableOpacity 
//           style={[
//             styles.filterButton,
//             selectedFilter === 'scheduled' && styles.filterButtonActive
//           ]}
//           onPress={() => setSelectedFilter('scheduled')}
//         >
//           <MaterialCommunityIcons 
//             name="calendar-check" 
//             size={16} 
//             color={selectedFilter === 'scheduled' ? '#FFF' : '#6B7280'} 
//             style={styles.filterIcon}
//           />
//           <Text style={[
//             styles.filterText,
//             selectedFilter === 'scheduled' && styles.filterTextActive
//           ]}>
//             {tSafe('filter_scheduled', 'Scheduled')}
//           </Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity 
//           style={[
//             styles.filterButton,
//             selectedFilter === 'today' && styles.filterButtonActive
//           ]}
//           onPress={() => setSelectedFilter('today')}
//         >
//           <MaterialIcons 
//             name="today" 
//             size={16} 
//             color={selectedFilter === 'today' ? '#FFF' : '#6B7280'} 
//             style={styles.filterIcon}
//           />
//           <Text style={[
//             styles.filterText,
//             selectedFilter === 'today' && styles.filterTextActive
//           ]}>
//             {tSafe('filter_today', 'Today')}
//           </Text>
//         </TouchableOpacity>
//       </Animated.ScrollView>
//     </View>
//   );

//   const emptyListing = () => (
//     <View style={styles.emptyContainer}>
//       <View style={styles.emptyIllustration}>
//         <MaterialCommunityIcons 
//           name="chat-processing-outline"
//           size={80}
//           color="#E5E7EB"
//         />
//       </View>
//       <Text style={styles.emptyTitle}>
//         {searchQuery 
//           ? tSafe('no_conversations_found', 'No conversations found')
//           : tSafe('no_active_conversations', 'No active conversations')
//         }
//       </Text>
//       <Text style={styles.emptyMessage}>
//         {searchQuery 
//           ? tSafe('try_adjusting_search', 'Try adjusting your search to find what you\'re looking for.')
//           : tSafe('waiting_for_messages', 'When you receive messages from hosts, they will appear here.')
//         }
//       </Text>
//       {/* {!searchQuery && (
//         <TouchableOpacity 
//           style={styles.emptyButton}
//           onPress={() => navigation.navigate(ROUTES.cleaner_available_jobs)}
//         >
//           <MaterialCommunityIcons name="briefcase-search-outline" size={18} color="#FFF" />
//           <Text style={styles.emptyButtonText}>{tSafe('find_jobs', 'Find Jobs')}</Text>
//         </TouchableOpacity>
//       )} */}
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
//       {renderHeader()}
      
//       {loading ? (
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text style={styles.loadingText}>{tSafe('loading_conversations', 'Loading conversations...')}</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={filteredConversations}
//           renderItem={singleItem}
//           ListEmptyComponent={emptyListing}
//           keyExtractor={(item) => item.chatroomId}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.listContent}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={fetchData}
//               colors={[COLORS.primary]}
//               tintColor={COLORS.primary}
//               progressBackgroundColor="#F9FAFB"
//             />
//           }
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// export default Messages;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F9FAFB',
//   },
//   header: {
//     backgroundColor: '#F9FAFB',
//     paddingTop: 20,
//     paddingHorizontal: 20,
//     paddingBottom: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F3F4F6',
//   },
//   headerTop: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#111827',
//     letterSpacing: -0.5,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginTop: 4,
//   },
//   headerIcons: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   headerIconButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#FFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   profileButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     overflow: 'hidden',
//     borderWidth: 2,
//     borderColor: '#FFF',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   profileImage: {
//     width: '100%',
//     height: '100%',
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF',
//     borderRadius: 12,
//     paddingHorizontal: 15,
//     paddingVertical: 12,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   searchIcon: {
//     marginRight: 10,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     color: '#111827',
//     padding: 0,
//   },
//   filtersContainer: {
//     marginBottom: 10,
//   },
//   filterButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     backgroundColor: '#FFF',
//     borderRadius: 20,
//     marginRight: 10,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   filterButtonActive: {
//     backgroundColor: COLORS.primary,
//     borderColor: COLORS.primary,
//   },
//   filterIcon: {
//     marginRight: 6,
//   },
//   filterText: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#6B7280',
//   },
//   filterTextActive: {
//     color: '#FFF',
//   },
//   filterBadgeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   filterNotification: {
//     backgroundColor: '#EF4444',
//     borderRadius: 8,
//     minWidth: 18,
//     height: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 6,
//     paddingHorizontal: 4,
//   },
//   filterNotificationText: {
//     fontSize: 10,
//     fontWeight: '600',
//     color: '#FFF',
//   },
//   listContent: {
//     paddingHorizontal: 20,
//     paddingBottom: 30,
//   },
//   chatItemContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#FFF',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#F3F4F6',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     elevation: 1,
//   },
//   unreadChatItem: {
//     borderColor: COLORS.primary + '20',
//     backgroundColor: COLORS.primary + '08',
//   },
//   avatarContainer: {
//     position: 'relative',
//     marginRight: 16,
//   },
//   avatar: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//   },
//   avatarFallback: {
//     backgroundColor: COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   avatarText: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#FFF',
//   },
//   unreadIndicator: {
//     position: 'absolute',
//     top: 0,
//     right: 0,
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     backgroundColor: '#10B981',
//     borderWidth: 2,
//     borderColor: '#FFF',
//   },
//   chatContent: {
//     flex: 1,
//   },
//   chatHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 8,
//   },
//   nameContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   userName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#111827',
//     marginRight: 8,
//   },
//   unreadUserName: {
//     color: '#111827',
//   },
//   hostBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FEF3C7',
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   hostBadgeText: {
//     fontSize: 10,
//     fontWeight: '600',
//     color: '#92400E',
//     marginLeft: 4,
//   },
//   timeText: {
//     fontSize: 12,
//     color: '#9CA3AF',
//     fontWeight: '500',
//   },
//   chatDetails: {
//     marginBottom: 10,
//   },
//   propertyInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   propertyText: {
//     fontSize: 13,
//     color: '#6B7280',
//     marginLeft: 6,
//     flex: 1,
//   },
//   scheduleInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   scheduleText: {
//     fontSize: 13,
//     marginLeft: 6,
//     fontWeight: '500',
//   },
//   scheduleStatusDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     marginLeft: 8,
//   },
//   messagePreview: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   messageTextContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   readIndicator: {
//     marginRight: 6,
//   },
//   messageText: {
//     fontSize: 14,
//     color: '#6B7280',
//     flex: 1,
//   },
//   unreadMessageText: {
//     color: '#111827',
//     fontWeight: '500',
//   },
//   unreadBadge: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 12,
//     minWidth: 24,
//     height: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     marginLeft: 8,
//   },
//   unreadCount: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#FFF',
//   },
//   chevron: {
//     marginLeft: 8,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F9FAFB',
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: '#6B7280',
//     fontWeight: '500',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 40,
//     marginTop: 60,
//   },
//   emptyIllustration: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: '#FFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 24,
//     borderWidth: 8,
//     borderColor: '#F3F4F6',
//   },
//   emptyTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#111827',
//     textAlign: 'center',
//     marginBottom: 8,
//   },
//   emptyMessage: {
//     fontSize: 15,
//     color: '#6B7280',
//     textAlign: 'center',
//     lineHeight: 22,
//     marginBottom: 24,
//   },
//   emptyButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 12,
//   },
//   emptyButtonText: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#FFF',
//     marginLeft: 8,
//   },
// });

// screens/Messages.js
// import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   RefreshControl,
//   StatusBar,
//   FlatList,
//   Image,
//   View,
//   TouchableOpacity,
//   ActivityIndicator,
//   Animated,
//   TextInput
// } from 'react-native';
// import COLORS from '../../constants/colors';
// import { AuthContext } from '../../context/AuthContext';
// import { useWebSocket } from '../../context/WebsocketContext';
// import { getConversations, markConversationRead } from '../../services/connection/chatApi';
// import ROUTES from '../../constants/routes';
// import {
//   MaterialCommunityIcons,
//   Ionicons,
//   Feather,
//   MaterialIcons,
//   Entypo,
//   FontAwesome5
// } from '@expo/vector-icons';
// import moment from 'moment';
// import { useFocusEffect } from '@react-navigation/native';
// import { tSafe } from '../../utils/tSafe';
// import { LanguageContext } from '../../context/LanguageContext';



// const Messages = ({ navigation }) => {
//   const {
//     currentUserId,
//     fbaseUser,
//     setTotalUnreadCount,
//     totalUnreadCount,
//     userType
//   } = useContext(AuthContext);

//   const { addMessageHandler, removeMessageHandler, isConnected } = useWebSocket();
//   const { language } = useContext(LanguageContext);
//   const [conversations, setConversations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedFilter, setSelectedFilter] = useState('all');
//   const [isSearchFocused, setIsSearchFocused] = useState(false);

//   const searchAnim = useRef(new Animated.Value(0)).current;
//   const filtersAnim = useRef(new Animated.Value(0)).current;

//   // Animate search bar
//   useEffect(() => {
//     Animated.timing(searchAnim, {
//       toValue: isSearchFocused ? 1 : 0,
//       duration: 200,
//       useNativeDriver: true,
//     }).start();
//   }, [isSearchFocused]);

//   // Animate filters
//   useEffect(() => {
//     Animated.spring(filtersAnim, {
//       toValue: 1,
//       tension: 50,
//       friction: 7,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   // useEffect(() => {
//   //   const translateLastMessages = async () => {
//   //     if (!conversations.length) return;
//   //     const updated = await Promise.all(conversations.map(async (conv) => {
//   //       const lastMsg = conv.lastMessage;
//   //       if (!lastMsg || !lastMsg.text) return conv;
//   //       // If the message is from the current user, no need to translate (it's already in their language)
//   //       if (lastMsg.sender === currentUserId) return conv;
//   //       // If the message is already in the user's language (detect simple – you can skip)
//   //       // For simplicity, we translate all incoming messages.
//   //       // You can cache to avoid repeated calls.
//   //       try {
//   //         const response = await fetch('http://your-libretranslate-url/translate', {
//   //           method: 'POST',
//   //           headers: { 'Content-Type': 'application/json' },
//   //           body: JSON.stringify({
//   //             q: lastMsg.text,
//   //             source: 'auto',
//   //             target: userLanguage, // from your LanguageContext
//   //             format: 'text'
//   //           })
//   //         });
//   //         const data = await response.json();
//   //         const translated = data.translatedText;
//   //         return {
//   //           ...conv,
//   //           lastMessage: { ...lastMsg, text: translated }
//   //         };
//   //       } catch (err) {
//   //         console.error('Translation error:', err);
//   //         return conv;
//   //       }
//   //     }));
//   //     setConversations(updated);
//   //   };
//   //   translateLastMessages();
//   // }, [conversations, currentUserId, userLanguage]);

//   // Fetch conversations from backend
//   const fetchConversations = async () => {
//     if (!currentUserId) return;
//     setLoading(true);
//     try {
//       const data = await getConversations(currentUserId, language);
//       // data is array of conversation objects: { id, otherUser, lastMessage, unreadCount, updatedAt, schedule, ... }
//       const sorted = data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
//       setConversations(sorted);
//       const totalUnread = sorted.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
//       setTotalUnreadCount(totalUnread);
//     } catch (error) {
//       console.error('Failed to fetch conversations', error);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   // Refresh on focus
//   useFocusEffect(
//     useCallback(() => {
//       fetchConversations();
//     }, [currentUserId])
//   );

//   // WebSocket real‑time updates
//   useEffect(() => {
//     const handleNewMessage = (data) => {
//       alert("Say something")
//       console.log('📨 WebSocket message received in Messages:', data);
//       if (data.conversation_id) {
//         setConversations(prev => {
//           console.log('Current conversations IDs:', prev.map(c => c.id));
//           const updated = prev.map(conv => {
//             if (conv.id === data.conversation_id) {
//               console.log('✅ Found matching conversation:', conv.id);
//               const newLastMessage = {
//                 text: data.text || (data.image ? '📷 Image' : ''),
//                 sender: data.sender_id,
//                 createdAt: data.created_at,
//                 image: data.image,
//               };
//               const unreadIncrement = (data.sender_id !== currentUserId && !isConversationOpen(data.conversation_id)) ? 1 : 0;
//               console.log(`unreadIncrement: ${unreadIncrement}, currentUnread: ${conv.unreadCount}, newUnread: ${(conv.unreadCount || 0) + unreadIncrement}`);
//               return {
//                 ...conv,
//                 lastMessage: newLastMessage,
//                 updatedAt: data.created_at,
//                 unreadCount: (conv.unreadCount || 0) + unreadIncrement,
//               };
//             }
//             return conv;
//           });
//           // Check if conversation was not found
//           if (!updated.some(conv => conv.id === data.conversation_id)) {
//             console.warn('⚠️ Conversation not found in state, cannot update unread count');
//           }
//           // Resort by updatedAt
//           updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
//           const totalUnread = updated.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
//           setTotalUnreadCount(totalUnread);
//           return updated;
//         });
//       }
//     };

//     const isConversationOpen = (convId) => {
//       const route = navigation.getState().routes.find(r => r.name === ROUTES.chat_conversation);
//       return route && route.params?.conversation?.id === convId;
//     };

    

//     addMessageHandler(handleNewMessage);
//     return () => removeMessageHandler(handleNewMessage);
//   }, [addMessageHandler, removeMessageHandler, isConnected, currentUserId, navigation, setTotalUnreadCount]);

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchConversations();
//   };

//   // const handleChatPress = async (item) => {
//   //   await markConversationRead(item.id, currentUserId);
//   //   console.log('Navigating with route:', ROUTES.cleaner_chat_conversation, 'conversation:', item);
//   //   navigation.navigate(ROUTES.cleaner_chat_conversation, { conversation: item });
//   // };

//   const handleChatPress = async (item) => {
//     // Optimistically set unreadCount to 0 for this conversation
//     setConversations(prev =>
//       prev.map(conv =>
//         conv.id === item.id ? { ...conv, unreadCount: 0 } : conv
//       )
//     );
//     // Recalculate total unread count
//     setTotalUnreadCount(prevTotal => Math.max(0, prevTotal - (item.unreadCount || 0)));
  
//     // Actually mark as read on the backend
//     await markConversationRead(item.id, currentUserId);
    
//     console.log('Navigating with route:', ROUTES.cleaner_chat_conversation, 'conversation:', item);
//     navigation.navigate(ROUTES.cleaner_chat_conversation, { conversation: item });
//   };

//   const truncateString = (str) => {
//     if (!str) return '';
//     const maxLength = 30;
//     return str.length > maxLength ? str.slice(0, maxLength - 3) + '...' : str;
//   };

//   const getMessagePreview = (item) => {
//     if (item.lastMessage?.image) return '📷 Image';
//     return truncateString(item.lastMessage?.text || '');
//   };

//   // Filter conversations
//   const filteredConversations = conversations.filter(conv => {
//     const otherName = conv.otherUser?.name || '';
//     const matchesSearch = searchQuery === '' ||
//       otherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (conv.schedule?.apartment_name || '').toLowerCase().includes(searchQuery.toLowerCase());

//     let matchesFilter = true;
//     if (selectedFilter === 'unread') {
//       matchesFilter = conv.unreadCount > 0;
//     } else if (selectedFilter === 'scheduled') {
//       matchesFilter = !!conv.schedule?.cleaning_date;
//     } else if (selectedFilter === 'today') {
//       if (!conv.schedule?.cleaning_date) return false;
//       const today = moment().format('YYYY-MM-DD');
//       matchesFilter = moment(conv.schedule.cleaning_date).format('YYYY-MM-DD') === today;
//     }
//     return matchesSearch && matchesFilter;
//   });

//   const getInitials = (firstName, lastName) => {
//     return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
//   };

//   const formatTime = (timestamp) => {
//     if (!timestamp) return '';
//     const now = moment();
//     const messageTime = moment(timestamp);
//     if (now.diff(messageTime, 'days') < 1) {
//       return messageTime.format('h:mm A');
//     } else if (now.diff(messageTime, 'days') < 7) {
//       return messageTime.format('ddd');
//     } else {
//       return messageTime.format('MMM D');
//     }
//   };

//   const getScheduleStatusColor = (schedule) => {
//     if (!schedule) return '#9CA3AF';
//     const now = moment();
//     const cleaningDate = moment(schedule.cleaning_date);
//     if (cleaningDate.isSame(now, 'day')) {
//       return '#10B981';
//     } else if (cleaningDate.isBefore(now)) {
//       return '#EF4444';
//     } else {
//       return '#3B82F6';
//     }
//   };

//   const renderItem = ({ item }) => {
//     const otherUser = item.otherUser || {};
//     const schedule = item.schedule || {};
//     return (
//       <TouchableOpacity
//         style={[
//           styles.chatItemContainer,
//           item.unreadCount > 0 && styles.unreadChatItem
//         ]}
//         onPress={() => handleChatPress(item)}
//         activeOpacity={0.7}
//       >
//         <View style={styles.avatarContainer}>
//           {otherUser.avatar ? (
//             <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
//           ) : (
//             <View style={[styles.avatar, styles.avatarFallback]}>
//               <Text style={styles.avatarText}>
//                 {getInitials(otherUser.firstname, otherUser.lastname)}
//               </Text>
//             </View>
//           )}
//           {item.unreadCount > 0 && <View style={styles.unreadIndicator} />}
//         </View>

//         <View style={styles.chatContent}>
//           <View style={styles.chatHeader}>
//             <View style={styles.nameContainer}>
//               <Text style={[styles.userName, item.unreadCount > 0 && styles.unreadUserName]}>
//                 {otherUser.name || `${otherUser.firstname || ''} ${otherUser.lastname || ''}`.trim() || 'Unknown'}
//               </Text>
//               {userType === 'cleaner' && schedule.property_type === 'host' && (
//                 <View style={styles.hostBadge}>
//                   <FontAwesome5 name="crown" size={10} color="#FBBF24" />
//                   <Text style={styles.hostBadgeText}>Host</Text>
//                 </View>
//               )}
//             </View>
//             <Text style={styles.timeText}>
//               {formatTime(item.lastMessage?.createdAt)}
//             </Text>
//           </View>

//           <View style={styles.chatDetails}>
//             <View style={styles.propertyInfo}>
//               <MaterialIcons name="location-on" size={14} color="#6B7280" />
//               <Text style={styles.propertyText} numberOfLines={1}>
//                 {schedule.apartment_name || 'No property assigned'}
//               </Text>
//             </View>
//             {schedule.cleaning_date && (
//               <View style={styles.scheduleInfo}>
//                 <MaterialCommunityIcons
//                   name="calendar-clock"
//                   size={14}
//                   color={getScheduleStatusColor(schedule)}
//                 />
//                 <Text style={[styles.scheduleText, { color: getScheduleStatusColor(schedule) }]}>
//                   {moment(schedule.cleaning_date).format('MMM D')} •
//                   {moment(schedule.cleaning_time, 'h:mm:ss A').format('h:mm A')}
//                 </Text>
//                 <View style={[styles.scheduleStatusDot, { backgroundColor: getScheduleStatusColor(schedule) }]} />
//               </View>
//             )}
//           </View>

//           <View style={styles.messagePreview}>
//             <View style={styles.messageTextContainer}>
//               {item.lastMessage?.sender === currentUserId && (
//                 <Ionicons
//                   name="checkmark-done"
//                   size={16}
//                   color={item.lastMessage?.read ? '#10B981' : '#9CA3AF'}
//                   style={styles.readIndicator}
//                 />
//               )}
//               <Text
//                 style={[styles.messageText, item.unreadCount > 0 && styles.unreadMessageText]}
//                 numberOfLines={1}
//               >
//                 {item.lastMessage?.sender === currentUserId
//                   ? `You: ${getMessagePreview(item)}`
//                   : getMessagePreview(item)}
//               </Text>
//             </View>
//             {item.unreadCount > 0 && (
//               <View style={styles.unreadBadge}>
//                 <Text style={styles.unreadCount}>{item.unreadCount > 99 ? '99+' : item.unreadCount}</Text>
//               </View>
//             )}
//           </View>
//         </View>

//         <Entypo name="chevron-right" size={20} color="#D1D5DB" style={styles.chevron} />
//       </TouchableOpacity>
//     );
//   };

//   const renderHeader = () => (
//     <View style={styles.header}>
//       <View style={styles.headerTop}>
//         <View>
//           <Text style={styles.headerTitle}>Messages</Text>
//           <Text style={styles.headerSubtitle}>
//             {totalUnreadCount > 0
//               ? `${totalUnreadCount} unread message${totalUnreadCount > 1 ? 's' : ''}`
//               : 'All messages read'}
//           </Text>
//         </View>
//         <View style={styles.headerIcons}>
//           <TouchableOpacity style={styles.headerIconButton}>
//             <MaterialCommunityIcons name="bell-outline" size={22} color="#6B7280" />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.profileButton}>
//             <Image
//               source={fbaseUser?.avatar ? { uri: fbaseUser.avatar } : require('../../assets/images/default_avatar.png')}
//               style={styles.profileImage}
//             />
//           </TouchableOpacity>
//         </View>
//       </View>

//       <Animated.View
//         style={[
//           styles.searchContainer,
//           {
//             transform: [{
//               scale: searchAnim.interpolate({
//                 inputRange: [0, 1],
//                 outputRange: [1, 1.02]
//               })
//             }]
//           }
//         ]}
//       >
//         <Feather name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search hosts or properties..."
//           placeholderTextColor="#9CA3AF"
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//           onFocus={() => setIsSearchFocused(true)}
//           onBlur={() => setIsSearchFocused(false)}
//         />
//         {searchQuery.length > 0 && (
//           <TouchableOpacity onPress={() => setSearchQuery('')}>
//             <Ionicons name="close-circle" size={20} color="#9CA3AF" />
//           </TouchableOpacity>
//         )}
//       </Animated.View>

//       <Animated.ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         style={[
//           styles.filtersContainer,
//           {
//             opacity: filtersAnim,
//             transform: [{
//               translateY: filtersAnim.interpolate({
//                 inputRange: [0, 1],
//                 outputRange: [20, 0]
//               })
//             }]
//           }
//         ]}
//       >
//         <TouchableOpacity
//           style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
//           onPress={() => setSelectedFilter('all')}
//         >
//           <Feather name="message-square" size={16} color={selectedFilter === 'all' ? '#FFF' : '#6B7280'} style={styles.filterIcon} />
//           <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>All</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.filterButton, selectedFilter === 'unread' && styles.filterButtonActive]}
//           onPress={() => setSelectedFilter('unread')}
//         >
//           <View style={styles.filterBadgeContainer}>
//             <Feather name="mail" size={16} color={selectedFilter === 'unread' ? '#FFF' : '#6B7280'} style={styles.filterIcon} />
//             <Text style={[styles.filterText, selectedFilter === 'unread' && styles.filterTextActive]}>Unread</Text>
//             {totalUnreadCount > 0 && (
//               <View style={styles.filterNotification}>
//                 <Text style={styles.filterNotificationText}>{totalUnreadCount}</Text>
//               </View>
//             )}
//           </View>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.filterButton, selectedFilter === 'scheduled' && styles.filterButtonActive]}
//           onPress={() => setSelectedFilter('scheduled')}
//         >
//           <MaterialCommunityIcons name="calendar-check" size={16} color={selectedFilter === 'scheduled' ? '#FFF' : '#6B7280'} style={styles.filterIcon} />
//           <Text style={[styles.filterText, selectedFilter === 'scheduled' && styles.filterTextActive]}>Scheduled</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.filterButton, selectedFilter === 'today' && styles.filterButtonActive]}
//           onPress={() => setSelectedFilter('today')}
//         >
//           <MaterialIcons name="today" size={16} color={selectedFilter === 'today' ? '#FFF' : '#6B7280'} style={styles.filterIcon} />
//           <Text style={[styles.filterText, selectedFilter === 'today' && styles.filterTextActive]}>Today</Text>
//         </TouchableOpacity>
//       </Animated.ScrollView>
//     </View>
//   );

//   const emptyListing = () => (
//     <View style={styles.emptyContainer}>
//       <View style={styles.emptyIllustration}>
//         <MaterialCommunityIcons name="chat-processing-outline" size={80} color="#E5E7EB" />
//       </View>
//       <Text style={styles.emptyTitle}>
//         {searchQuery ? 'No conversations found' : 'No active conversations'}
//       </Text>
//       <Text style={styles.emptyMessage}>
//         {searchQuery
//           ? 'Try adjusting your search to find what you\'re looking for.'
//           : 'When you receive messages from hosts, they will appear here.'}
//       </Text>
//       {/* You can uncomment the button below if you want to navigate to job search */}
//       {/* {!searchQuery && userType === 'cleaner' && (
//         <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate(ROUTES.cleaner_available_jobs)}>
//           <MaterialCommunityIcons name="briefcase-search-outline" size={18} color="#FFF" />
//           <Text style={styles.emptyButtonText}>Find Jobs</Text>
//         </TouchableOpacity>
//       )} */}
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
//       {renderHeader()}
//       {loading ? (
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text style={styles.loadingText}>Loading conversations...</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={filteredConversations}
//           renderItem={renderItem}
//           ListEmptyComponent={emptyListing}
//           keyExtractor={(item) => item.id}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.listContent}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               colors={[COLORS.primary]}
//               tintColor={COLORS.primary}
//               progressBackgroundColor="#F9FAFB"
//             />
//           }
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// export default Messages;

// // ========================
// // Styles (exactly as in your original file)
// // ========================
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F9FAFB',
//   },
//   header: {
//     backgroundColor: '#F9FAFB',
//     paddingTop: 20,
//     paddingHorizontal: 20,
//     paddingBottom: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F3F4F6',
//   },
//   headerTop: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#111827',
//     letterSpacing: -0.5,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginTop: 4,
//   },
//   headerIcons: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   headerIconButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#FFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   profileButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     overflow: 'hidden',
//     borderWidth: 2,
//     borderColor: '#FFF',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   profileImage: {
//     width: '100%',
//     height: '100%',
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF',
//     borderRadius: 12,
//     paddingHorizontal: 15,
//     paddingVertical: 12,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   searchIcon: {
//     marginRight: 10,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     color: '#111827',
//     padding: 0,
//   },
//   filtersContainer: {
//     marginBottom: 10,
//   },
//   filterButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     backgroundColor: '#FFF',
//     borderRadius: 20,
//     marginRight: 10,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   filterButtonActive: {
//     backgroundColor: COLORS.primary,
//     borderColor: COLORS.primary,
//   },
//   filterIcon: {
//     marginRight: 6,
//   },
//   filterText: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#6B7280',
//   },
//   filterTextActive: {
//     color: '#FFF',
//   },
//   filterBadgeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   filterNotification: {
//     backgroundColor: '#EF4444',
//     borderRadius: 8,
//     minWidth: 18,
//     height: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 6,
//     paddingHorizontal: 4,
//   },
//   filterNotificationText: {
//     fontSize: 10,
//     fontWeight: '600',
//     color: '#FFF',
//   },
//   listContent: {
//     paddingHorizontal: 20,
//     paddingBottom: 30,
//   },
//   chatItemContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#FFF',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#F3F4F6',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     elevation: 1,
//   },
//   unreadChatItem: {
//     borderColor: COLORS.primary + '20',
//     backgroundColor: COLORS.primary + '08',
//   },
//   avatarContainer: {
//     position: 'relative',
//     marginRight: 16,
//   },
//   avatar: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//   },
//   avatarFallback: {
//     backgroundColor: COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   avatarText: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#FFF',
//   },
//   unreadIndicator: {
//     position: 'absolute',
//     top: 0,
//     right: 0,
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     backgroundColor: '#10B981',
//     borderWidth: 2,
//     borderColor: '#FFF',
//   },
//   chatContent: {
//     flex: 1,
//   },
//   chatHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 8,
//   },
//   nameContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   userName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#111827',
//     marginRight: 8,
//   },
//   unreadUserName: {
//     color: '#111827',
//   },
//   hostBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FEF3C7',
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   hostBadgeText: {
//     fontSize: 10,
//     fontWeight: '600',
//     color: '#92400E',
//     marginLeft: 4,
//   },
//   timeText: {
//     fontSize: 12,
//     color: '#9CA3AF',
//     fontWeight: '500',
//   },
//   chatDetails: {
//     marginBottom: 10,
//   },
//   propertyInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   propertyText: {
//     fontSize: 13,
//     color: '#6B7280',
//     marginLeft: 6,
//     flex: 1,
//   },
//   scheduleInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   scheduleText: {
//     fontSize: 13,
//     marginLeft: 6,
//     fontWeight: '500',
//   },
//   scheduleStatusDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     marginLeft: 8,
//   },
//   messagePreview: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   messageTextContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   readIndicator: {
//     marginRight: 6,
//   },
//   messageText: {
//     fontSize: 14,
//     color: '#6B7280',
//     flex: 1,
//   },
//   unreadMessageText: {
//     color: '#111827',
//     fontWeight: '500',
//   },
//   unreadBadge: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 12,
//     minWidth: 24,
//     height: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     marginLeft: 8,
//   },
//   unreadCount: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#FFF',
//   },
//   chevron: {
//     marginLeft: 8,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F9FAFB',
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: '#6B7280',
//     fontWeight: '500',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 40,
//     marginTop: 60,
//   },
//   emptyIllustration: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: '#FFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 24,
//     borderWidth: 8,
//     borderColor: '#F3F4F6',
//   },
//   emptyTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#111827',
//     textAlign: 'center',
//     marginBottom: 8,
//   },
//   emptyMessage: {
//     fontSize: 15,
//     color: '#6B7280',
//     textAlign: 'center',
//     lineHeight: 22,
//     marginBottom: 24,
//   },
//   emptyButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 12,
//   },
//   emptyButtonText: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#FFF',
//     marginLeft: 8,
//   },
// });



import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  RefreshControl,
  StatusBar,
  FlatList,
  Image,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  TextInput
} from 'react-native';
import COLORS from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebsocketContext';
import { getConversations, markConversationRead } from '../../services/connection/chatApi';
import ROUTES from '../../constants/routes';
import {
  MaterialCommunityIcons,
  Ionicons,
  Feather,
  MaterialIcons,
  Entypo,
  FontAwesome5
} from '@expo/vector-icons';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import { LanguageContext } from '../../context/LanguageContext';

const Messages = ({ navigation }) => {
  const {
    currentUserId,
    fbaseUser,
    setTotalUnreadCount,
    totalUnreadCount,
    userType
  } = useContext(AuthContext);

  const { addMessageHandler, removeMessageHandler, isConnected } = useWebSocket();
  const { language } = useContext(LanguageContext);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchAnim = useRef(new Animated.Value(0)).current;
  const filtersAnim = useRef(new Animated.Value(0)).current;

  const conversationsRef = useRef(conversations);

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

  // Fetch conversations from backend
  const fetchConversations = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const data = await getConversations(currentUserId, language);
      if (!data || !Array.isArray(data)) {
        console.error('Expected array, received:', data);
        setConversations([]);
        setTotalUnreadCount(0);
        return;
      }
      const sorted = data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setConversations(sorted);
      const totalUnread = sorted.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      setTotalUnreadCount(totalUnread);
    } catch (error) {
      console.error('Failed to fetch conversations', error);
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };



  // Refresh on focus (important to sync unread counts after returning from chat)
  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [currentUserId, language])
  );

  // WebSocket real‑time updates
  // useEffect(() => {
  //   const handleNewMessage = (data) => {
  //     console.log('📨 WebSocket message received in Messages:', data);
  //     if (!data.conversation_id) return;

  //     setConversations(prev => {
  //       const updated = prev.map(conv => {
  //         if (conv.id === data.conversation_id) {
  //           // Determine translated text for last message
  //           let displayText = data.text || (data.image ? '📷 Image' : '');
  //           if (data.translations && data.translations[language]) {
  //             displayText = data.translations[language];
  //           }

  //           const newLastMessage = {
  //             text: displayText,
  //             originalText: data.text,
  //             sender: data.sender_id,
  //             createdAt: data.created_at,
  //             image: data.image,
  //           };
  //           // Always increment unread if message is from other user (we are on the list screen, not inside chat)
  //           const isFromOther = data.sender_id !== currentUserId;
  //           const unreadIncrement = isFromOther ? 1 : 0;

  //           console.log(`Conversation ${conv.id}: isFromOther=${isFromOther}, unreadIncrement=${unreadIncrement}, oldUnread=${conv.unreadCount}`);
  //           return {
  //             ...conv,
  //             lastMessage: newLastMessage,
  //             updatedAt: data.created_at,
  //             unreadCount: (conv.unreadCount || 0) + unreadIncrement,
  //           };
  //         }
  //         return conv;
  //       });

  //       // If conversation not found, we could add it (but unlikely)
  //       if (!updated.some(conv => conv.id === data.conversation_id)) {
  //         console.warn('⚠️ Conversation not found in state, cannot update unread count');
  //       }

  //       // Resort by updatedAt
  //       updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  //       const totalUnread = updated.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  //       setTotalUnreadCount(totalUnread);
  //       return updated;
  //     });
  //   };

  //   if (isConnected) {
  //     addMessageHandler(handleNewMessage);
  //     return () => removeMessageHandler(handleNewMessage);
  //   }
  // }, [addMessageHandler, removeMessageHandler, isConnected, currentUserId, language, setTotalUnreadCount]);

  
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);
  useEffect(() => {
    const handleNewMessage = (data) => {
      if (!data.conversation_id) return;
  
      setConversations(prev => {
        let updated = [...prev];
        let found = false;
  
        for (let i = 0; i < updated.length; i++) {
          if (updated[i].id === data.conversation_id) {
            found = true;
            // Determine display text (translated if available)
            let displayText = data.text || (data.image ? '📷 Image' : '');
            if (data.translations && data.translations[language]) {
              displayText = data.translations[language];
            }
            const newLastMessage = {
              text: displayText,
              originalText: data.text,
              sender: data.sender_id,
              createdAt: data.created_at,
              image: data.image,
            };
            const isFromOther = data.sender_id !== currentUserId;
            const unreadIncrement = isFromOther ? 1 : 0;
            updated[i] = {
              ...updated[i],
              lastMessage: newLastMessage,
              updatedAt: data.created_at,
              unreadCount: (updated[i].unreadCount || 0) + unreadIncrement,
            };
            break;
          }
        }
  
        if (!found) {
          // Conversation not in local list – maybe new or not yet loaded; refetch all
          console.log('Conversation not found, refetching conversations');
          fetchConversations(); // async, will update state
          return prev; // don't modify state now
        }
  
        // Resort by updatedAt
        updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        const totalUnread = updated.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        setTotalUnreadCount(totalUnread);
        return updated;
      });
    };
  
    addMessageHandler(handleNewMessage);
    return () => removeMessageHandler(handleNewMessage);
  }, [addMessageHandler, removeMessageHandler, currentUserId, language, setTotalUnreadCount, fetchConversations]);


  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const handleChatPress = async (item) => {
    // Optimistically set unreadCount to 0 for this conversation
    setConversations(prev =>
      prev.map(conv =>
        conv.id === item.id ? { ...conv, unreadCount: 0 } : conv
      )
    );
    // Recalculate total unread count
    setTotalUnreadCount(prevTotal => Math.max(0, prevTotal - (item.unreadCount || 0)));

    // Actually mark as read on the backend
    await markConversationRead(item.id, currentUserId);

    navigation.navigate(ROUTES.cleaner_chat_conversation, { conversation: item });
  };

  const truncateString = (str) => {
    if (!str) return '';
    const maxLength = 30;
    return str.length > maxLength ? str.slice(0, maxLength - 3) + '...' : str;
  };

  const getMessagePreview = (item) => {
    if (item.lastMessage?.image) return '📷 Image';
    return truncateString(item.lastMessage?.text || '');
  };

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const otherName = conv.otherUser?.name || '';
    const matchesSearch = searchQuery === '' ||
      otherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conv.schedule?.apartment_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (selectedFilter === 'unread') {
      matchesFilter = conv.unreadCount > 0;
    } else if (selectedFilter === 'scheduled') {
      matchesFilter = !!conv.schedule?.cleaning_date;
    } else if (selectedFilter === 'today') {
      if (!conv.schedule?.cleaning_date) return false;
      const today = moment().format('YYYY-MM-DD');
      matchesFilter = moment(conv.schedule.cleaning_date).format('YYYY-MM-DD') === today;
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

  const getScheduleStatusColor = (schedule) => {
    if (!schedule) return '#9CA3AF';
    const now = moment();
    const cleaningDate = moment(schedule.cleaning_date);
    if (cleaningDate.isSame(now, 'day')) {
      return '#10B981';
    } else if (cleaningDate.isBefore(now)) {
      return '#EF4444';
    } else {
      return '#3B82F6';
    }
  };

  const renderItem = ({ item }) => {
    const otherUser = item.otherUser || {};
    const schedule = item.schedule || {};
    return (
      <TouchableOpacity
        style={[
          styles.chatItemContainer,
          item.unreadCount > 0 && styles.unreadChatItem
        ]}
        onPress={() => handleChatPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {otherUser.avatar ? (
            <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarText}>
                {getInitials(otherUser.firstname, otherUser.lastname)}
              </Text>
            </View>
          )}
          {item.unreadCount > 0 && <View style={styles.unreadIndicator} />}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <View style={styles.nameContainer}>
              <Text style={[styles.userName, item.unreadCount > 0 && styles.unreadUserName]}>
                {otherUser.name || `${otherUser.firstname || ''} ${otherUser.lastname || ''}`.trim() || 'Unknown'}
              </Text>
              {userType === 'cleaner' && schedule.property_type === 'host' && (
                <View style={styles.hostBadge}>
                  <FontAwesome5 name="crown" size={10} color="#FBBF24" />
                  <Text style={styles.hostBadgeText}>Host</Text>
                </View>
              )}
            </View>
            <Text style={styles.timeText}>
              {formatTime(item.lastMessage?.createdAt)}
            </Text>
          </View>

          <View style={styles.chatDetails}>
            <View style={styles.propertyInfo}>
              <MaterialIcons name="location-on" size={14} color="#6B7280" />
              <Text style={styles.propertyText} numberOfLines={1}>
                {schedule.apartment_name || 'No property assigned'}
              </Text>
            </View>
            {schedule.cleaning_date && (
              <View style={styles.scheduleInfo}>
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={14}
                  color={getScheduleStatusColor(schedule)}
                />
                <Text style={[styles.scheduleText, { color: getScheduleStatusColor(schedule) }]}>
                  {moment(schedule.cleaning_date).format('MMM D')} •
                  {moment(schedule.cleaning_time, 'h:mm:ss A').format('h:mm A')}
                </Text>
                <View style={[styles.scheduleStatusDot, { backgroundColor: getScheduleStatusColor(schedule) }]} />
              </View>
            )}
          </View>

          <View style={styles.messagePreview}>
            <View style={styles.messageTextContainer}>
              {item.lastMessage?.sender === currentUserId && (
                <Ionicons
                  name="checkmark-done"
                  size={16}
                  color={item.lastMessage?.read ? '#10B981' : '#9CA3AF'}
                  style={styles.readIndicator}
                />
              )}
              <Text
                style={[styles.messageText, item.unreadCount > 0 && styles.unreadMessageText]}
                numberOfLines={1}
              >
                {item.lastMessage?.sender === currentUserId
                  ? `You: ${getMessagePreview(item)}`
                  : getMessagePreview(item)}
              </Text>
            </View>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{item.unreadCount > 99 ? '99+' : item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>

        <Entypo name="chevron-right" size={20} color="#D1D5DB" style={styles.chevron} />
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSubtitle}>
            {totalUnreadCount > 0
              ? `${totalUnreadCount} unread message${totalUnreadCount > 1 ? 's' : ''}`
              : 'All messages read'}
          </Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIconButton}>
            <MaterialCommunityIcons name="bell-outline" size={22} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton}>
            <Image
              source={fbaseUser?.avatar ? { uri: fbaseUser.avatar } : require('../../assets/images/default_avatar.png')}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
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
        <Feather name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search hosts or properties..."
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
          style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('all')}
        >
          <Feather name="message-square" size={16} color={selectedFilter === 'all' ? '#FFF' : '#6B7280'} style={styles.filterIcon} />
          <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'unread' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('unread')}
        >
          <View style={styles.filterBadgeContainer}>
            <Feather name="mail" size={16} color={selectedFilter === 'unread' ? '#FFF' : '#6B7280'} style={styles.filterIcon} />
            <Text style={[styles.filterText, selectedFilter === 'unread' && styles.filterTextActive]}>Unread</Text>
            {totalUnreadCount > 0 && (
              <View style={styles.filterNotification}>
                <Text style={styles.filterNotificationText}>{totalUnreadCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'scheduled' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('scheduled')}
        >
          <MaterialCommunityIcons name="calendar-check" size={16} color={selectedFilter === 'scheduled' ? '#FFF' : '#6B7280'} style={styles.filterIcon} />
          <Text style={[styles.filterText, selectedFilter === 'scheduled' && styles.filterTextActive]}>Scheduled</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'today' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('today')}
        >
          <MaterialIcons name="today" size={16} color={selectedFilter === 'today' ? '#FFF' : '#6B7280'} style={styles.filterIcon} />
          <Text style={[styles.filterText, selectedFilter === 'today' && styles.filterTextActive]}>Today</Text>
        </TouchableOpacity>
      </Animated.ScrollView>
    </View>
  );

  const emptyListing = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIllustration}>
        <MaterialCommunityIcons name="chat-processing-outline" size={80} color="#E5E7EB" />
      </View>
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No conversations found' : 'No active conversations'}
      </Text>
      <Text style={styles.emptyMessage}>
        {searchQuery
          ? 'Try adjusting your search to find what you\'re looking for.'
          : 'When you receive messages from hosts, they will appear here.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      {renderHeader()}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderItem}
          ListEmptyComponent={emptyListing}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
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

// ========================
// Styles (exactly as in your original file)
// ========================
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
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImage: {
    width: '100%',
    height: '100%',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
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
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFF',
  },
  filterBadgeContainer: {
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  unreadUserName: {
    color: '#111827',
  },
  hostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  hostBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 4,
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
    marginBottom: 6,
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
    marginLeft: 6,
    fontWeight: '500',
  },
  scheduleStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
});