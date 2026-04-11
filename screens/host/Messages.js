// screens/Messages.js
// import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
// import {
//   SafeAreaView, StyleSheet, StatusBar, Text, RefreshControl,
//   FlatList, View, TouchableOpacity, ActivityIndicator,
//   Animated, TextInput, Image
// } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import moment from 'moment';
// import { Ionicons, MaterialIcons, Feather, Entypo } from '@expo/vector-icons';
// import { AuthContext } from '../../context/AuthContext';
// import { useWebSocket } from '../../context/WebsocketContext';
// import { getConversations, markConversationRead } from '../../services/connection/chatApi';
// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';
// import { tSafe } from '../../utils/tSafe';
// import { LanguageContext } from '../../context/LanguageContext';

// export default function Messages({ navigation }) {
//   const { currentUserId, fbaseUser, setTotalUnreadCount } = useContext(AuthContext);
 
//   const { language } = useContext(LanguageContext);
//   const { isConnected, addMessageHandler, removeMessageHandler } = useWebSocket();

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

//   useEffect(() => {
//     Animated.spring(filtersAnim, {
//       toValue: 1,
//       tension: 50,
//       friction: 7,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   // Fetch conversations from backend
//   // const fetchConversations = async () => {
//   //   setLoading(true);
//   //   try {
//   //     const data = await getConversations(currentUserId, language);
//   //     // data is assumed to be an array of conversation objects with fields:
//   //     // id, otherUser: { id, name, avatar }, lastMessage, unreadCount, updatedAt, schedule, etc.
//   //     const sorted = data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
//   //     setConversations(sorted);
//   //     const totalUnread = sorted.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
//   //     setTotalUnreadCount(totalUnread);
//   //   } catch (error) {
//   //     console.error('Failed to fetch conversations', error);
//   //   } finally {
//   //     setLoading(false);
//   //     setRefreshing(false);
//   //   }
//   // };

//   const fetchConversations = async () => {
//     if (!currentUserId) return;
//     setLoading(true);
//     try {
//       const data = await getConversations(currentUserId, language);
//       // ✅ Check if data is an array
//       if (!data || !Array.isArray(data)) {
//         console.error('Expected array, received:', data);
//         setConversations([]);
//         setTotalUnreadCount(0);
//         return;
//       }
//       const sorted = data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
//       setConversations(sorted);
//       const totalUnread = sorted.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
//       setTotalUnreadCount(totalUnread);
//     } catch (error) {
//       console.error('Failed to fetch conversations', error);
//       setConversations([]);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   // Refresh on focus
//   useFocusEffect(
//     useCallback(() => {
//       fetchConversations();
//     }, [])
//   );

//   // WebSocket handler to update conversations in real time
//   useEffect(() => {
//     const handleWebSocketMessage = (data) => {
//       // Assume data is a new message object (e.g., { sender_id, text, image, conversation_id, created_at, ... })
//       if (data.conversation_id) {
//         setConversations(prev => {
//           const updated = prev.map(conv => {
//             if (conv.id === data.conversation_id) {
//               // Update last message
//               const newLastMessage = {
//                 text: data.text || (data.image ? '📷 Image' : ''),
//                 sender: data.sender_id,
//                 createdAt: data.created_at,
//                 image: data.image,
//               };
//               const unreadIncrement = (data.sender_id !== currentUserId && !inCurrentConversation(data.conversation_id))
//                 ? 1 : 0;
//               return {
//                 ...conv,
//                 lastMessage: newLastMessage,
//                 updatedAt: data.created_at,
//                 unreadCount: (conv.unreadCount || 0) + unreadIncrement,
//               };
//             }
//             return conv;
//           });
//           // Re-sort by updatedAt
//           updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
//           // Update total unread count
//           const totalUnread = updated.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
//           setTotalUnreadCount(totalUnread);
//           return updated;
//         });
//       }
//     };

//     // Helper to know if this conversation is currently open
//     const inCurrentConversation = (convId) => {
//       const route = navigation.getState().routes.find(r => r.name === ROUTES.chat_conversation);
//       return route && route.params?.conversation?.id === convId;
//     };
//     addMessageHandler(handleWebSocketMessage);
//     return () => removeMessageHandler(handleWebSocketMessage);
//   }, [addMessageHandler, removeMessageHandler, currentUserId, navigation, setTotalUnreadCount]);

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchConversations();
//   };

//   const handleChatPress = async (conversation) => {
//     // Mark as read on backend (optional, can be done when conversation screen loads)
//     await markConversationRead(conversation.id, currentUserId);
//     navigation.navigate(ROUTES.chat_conversation, { 
//       conversation
//     });
//     // navigation.navigate(ROUTES.chat_conversation, { 
//     //   selectedUser: conversation,
//     //   // fbaseUser: fbaseUser,
//     //   schedule: conversation.schedule,
//     //   friendIndex: index
//     // });
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

//   const filteredConversations = conversations.filter(conv => {
//     const name = `${conv.otherUser.firstname} ${conv.otherUser.lastname}`;
//     const matchesSearch = searchQuery === '' ||
//       name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (conv.schedule?.apartment_name || '').toLowerCase().includes(searchQuery.toLowerCase());

//     let matchesFilter = true;
//     if (selectedFilter === 'unread') matchesFilter = conv.unreadCount > 0;
//     else if (selectedFilter === 'scheduled') matchesFilter = !!conv.schedule?.cleaning_date;

//     return matchesSearch && matchesFilter;
//   });

//   const getInitials = (firstName, lastName) => {
//     return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
//   };

//   const formatTime = (timestamp) => {
//     if (!timestamp) return '';
//     const now = moment();
//     const msgTime = moment(timestamp);
//     if (now.diff(msgTime, 'days') < 1) return msgTime.format('h:mm A');
//     if (now.diff(msgTime, 'days') < 7) return msgTime.format('ddd');
//     return msgTime.format('MMM D');
//   };

//   const renderItem = ({ item }) => (
//     <TouchableOpacity
//       style={[styles.chatItemContainer, item.unreadCount > 0 && styles.unreadChatItem]}
//       onPress={() => handleChatPress(item)}
//       activeOpacity={0.7}
//     >
//       <View style={styles.avatarContainer}>
//         {item.otherUser.avatar ? (
//           <Image source={{ uri: item.otherUser.avatar }} style={styles.avatar} />
//         ) : (
//           <View style={[styles.avatar, styles.avatarFallback]}>
//             <Text style={styles.avatarText}>
//               {getInitials(item.otherUser.firstname, item.otherUser.lastname)}
//             </Text>
//           </View>
//         )}
//         {item.unreadCount > 0 && <View style={styles.unreadIndicator} />}
//       </View>

//       <View style={styles.chatContent}>
//         <View style={styles.chatHeader}>
//           <Text style={[styles.userName, item.unreadCount > 0 && styles.unreadUserName]}>
//             {item.otherUser.firstname} {item.otherUser.lastname}
//           </Text>
//           <Text style={styles.timeText}>{formatTime(item.lastMessage?.createdAt)}</Text>
//         </View>

//         <View style={styles.chatDetails}>
//           <View style={styles.propertyInfo}>
//             <MaterialIcons name="location-on" size={14} color="#6B7280" />
//             <Text style={styles.propertyText} numberOfLines={1}>
//               {item.schedule?.apartment_name || 'No property assigned'}
//             </Text>
//           </View>
//           <View style={styles.scheduleInfo}>
//             <Ionicons name="calendar-outline" size={14} color="#6B7280" />
//             <Text style={styles.scheduleText}>
//               {item.schedule?.cleaning_date
//                 ? `${moment(item.schedule.cleaning_date).format('MMM D')} • ${moment(item.schedule.cleaning_time, 'h:mm:ss A').format('h:mm A')}`
//                 : 'No schedule'}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.messagePreview}>
//           <View style={styles.messageTextContainer}>
//             {item.lastMessage?.sender === currentUserId && (
//               <Ionicons name="checkmark-done" size={16} color="#10B981" style={styles.readIndicator} />
//             )}
//             <Text style={[styles.messageText, item.unreadCount > 0 && styles.unreadMessageText]} numberOfLines={1}>
//               {getMessagePreview(item)}
//             </Text>
//           </View>
//           {item.unreadCount > 0 && (
//             <View style={styles.unreadBadge}>
//               <Text style={styles.unreadCount}>{item.unreadCount > 99 ? '99+' : item.unreadCount}</Text>
//             </View>
//           )}
//         </View>
//       </View>
//       <Entypo name="chevron-right" size={20} color="#D1D5DB" style={styles.chevron} />
//     </TouchableOpacity>
//   );

//   const renderHeader = () => (
//     <View style={styles.header}>
//       <View style={styles.headerTop}>
//         <View>
//           <Text style={styles.headerTitle}>Messages</Text>
//           <Text style={styles.headerSubtitle}>
//             {conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0) > 0
//               ? `${conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)} unread message(s)`
//               : 'All caught up!'}
//           </Text>
//         </View>
//         <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate(ROUTES.notification)}>
//           <Ionicons name="notifications-outline" size={24} color="#1C1C1E" />
//           {/* optionally show notification badge */}
//         </TouchableOpacity>
//       </View>

//       <Animated.View style={[styles.searchContainer, { transform: [{ scale: searchAnim }] }]}>
//         <Feather name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search conversations..."
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

//       <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.filtersContainer, { opacity: filtersAnim, transform: [{ translateY: filtersAnim.interpolate({ inputRange: [0,1], outputRange: [20,0] }) }] }]}>
//         <TouchableOpacity style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]} onPress={() => setSelectedFilter('all')}>
//           <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>All</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={[styles.filterButton, selectedFilter === 'unread' && styles.filterButtonActive]} onPress={() => setSelectedFilter('unread')}>
//           <View style={styles.filterBadge}>
//             <Text style={[styles.filterText, selectedFilter === 'unread' && styles.filterTextActive]}>Unread</Text>
//             {conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0) > 0 && (
//               <View style={styles.filterNotification}>
//                 <Text style={styles.filterNotificationText}>{conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)}</Text>
//               </View>
//             )}
//           </View>
//         </TouchableOpacity>
//         <TouchableOpacity style={[styles.filterButton, selectedFilter === 'scheduled' && styles.filterButtonActive]} onPress={() => setSelectedFilter('scheduled')}>
//           <Text style={[styles.filterText, selectedFilter === 'scheduled' && styles.filterTextActive]}>Scheduled</Text>
//         </TouchableOpacity>
//       </Animated.ScrollView>
//     </View>
//   );

//   const emptyList = () => (
//     <View style={styles.emptyContainer}>
//       <View style={styles.emptyIllustration}>
//         <Ionicons name="chatbubbles-outline" size={80} color="#E5E7EB" />
//       </View>
//       <Text style={styles.emptyTitle}>
//         {searchQuery ? 'No conversations found' : 'No messages yet'}
//       </Text>
//       <Text style={styles.emptyMessage}>
//         {searchQuery
//           ? 'Try adjusting your search or filter to find what you\'re looking for.'
//           : 'When you start chatting with cleaners or hosts, your conversations will appear here.'}
//       </Text>
//       {!searchQuery && (
//         <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate(ROUTES.cleaner_dashboard)}>
//           <Text style={styles.emptyButtonText}>Find Cleaners</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
//       {renderHeader()}
//       {loading ? (
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text style={styles.loadingText}>Loading your conversations...</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={filteredConversations}
//           renderItem={renderItem}
//           ListEmptyComponent={emptyList}
//           keyExtractor={(item) => item.id}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.listContent}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
//           }
//         />
//       )}
//     </SafeAreaView>
//   );
// }


import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import {
  SafeAreaView, StyleSheet, StatusBar, Text, RefreshControl,
  FlatList, View, TouchableOpacity, ActivityIndicator,
  Animated, TextInput, Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import { Ionicons, MaterialIcons, Feather, Entypo } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebsocketContext';
import { getConversations, markConversationRead } from '../../services/connection/chatApi';
import COLORS from '../../constants/colors';
import ROUTES from '../../constants/routes';
import { LanguageContext } from '../../context/LanguageContext';

export default function Messages({ navigation }) {
  const { currentUserId, fbaseUser, setTotalUnreadCount } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const { isConnected, addMessageHandler, removeMessageHandler } = useWebSocket();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchAnim = useRef(new Animated.Value(0)).current;
  const filtersAnim = useRef(new Animated.Value(0)).current;
  const conversationsRef = useRef(conversations);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // Animate search bar
  useEffect(() => {
    Animated.timing(searchAnim, {
      toValue: isSearchFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isSearchFocused]);

  useEffect(() => {
    Animated.spring(filtersAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  // Fetch conversations from backend
  const fetchConversations = useCallback(async () => {
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
  }, [currentUserId, language, setTotalUnreadCount]);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [fetchConversations])
  );

  // Refetch when language changes (to update last message translation)
  useEffect(() => {
    fetchConversations();
  }, [language]);

  // WebSocket handler to update conversations in real time
  useEffect(() => {
    const handleWebSocketMessage = (data) => {
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
            // On the list screen, no conversation is open, so always increment if from other
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
          console.log('Conversation not found, refetching conversations');
          fetchConversations(); // async, will update state
          return prev;
        }

        // Resort by updatedAt
        updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        const totalUnread = updated.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        setTotalUnreadCount(totalUnread);
        return updated;
      });
    };

    addMessageHandler(handleWebSocketMessage);
    return () => removeMessageHandler(handleWebSocketMessage);
  }, [addMessageHandler, removeMessageHandler, currentUserId, language, setTotalUnreadCount, fetchConversations]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const handleChatPress = async (conversation) => {
    // Optimistically set unreadCount to 0 for this conversation
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
      )
    );
    // Recalculate total unread count
    setTotalUnreadCount(prevTotal => Math.max(0, prevTotal - (conversation.unreadCount || 0)));

    await markConversationRead(conversation.id, currentUserId);
    navigation.navigate(ROUTES.chat_conversation, { conversation });
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

  const filteredConversations = conversations.filter(conv => {
    const name = `${conv.otherUser.firstname} ${conv.otherUser.lastname}`;
    const matchesSearch = searchQuery === '' ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conv.schedule?.apartment_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (selectedFilter === 'unread') matchesFilter = conv.unreadCount > 0;
    else if (selectedFilter === 'scheduled') matchesFilter = !!conv.schedule?.cleaning_date;

    return matchesSearch && matchesFilter;
  });

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const now = moment();
    const msgTime = moment(timestamp);
    if (now.diff(msgTime, 'days') < 1) return msgTime.format('h:mm A');
    if (now.diff(msgTime, 'days') < 7) return msgTime.format('ddd');
    return msgTime.format('MMM D');
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.chatItemContainer, item.unreadCount > 0 && styles.unreadChatItem]}
      onPress={() => handleChatPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {item.otherUser.avatar ? (
          <Image source={{ uri: item.otherUser.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarText}>
              {getInitials(item.otherUser.firstname, item.otherUser.lastname)}
            </Text>
          </View>
        )}
        {item.unreadCount > 0 && <View style={styles.unreadIndicator} />}
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={[styles.userName, item.unreadCount > 0 && styles.unreadUserName]}>
            {item.otherUser.firstname} {item.otherUser.lastname}
          </Text>
          <Text style={styles.timeText}>{formatTime(item.lastMessage?.createdAt)}</Text>
        </View>

        <View style={styles.chatDetails}>
          <View style={styles.propertyInfo}>
            <MaterialIcons name="location-on" size={14} color="#6B7280" />
            <Text style={styles.propertyText} numberOfLines={1}>
              {item.schedule?.apartment_name || 'No property assigned'}
            </Text>
          </View>
          <View style={styles.scheduleInfo}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.scheduleText}>
              {item.schedule?.cleaning_date
                ? `${moment(item.schedule.cleaning_date).format('MMM D')} • ${moment(item.schedule.cleaning_time, 'h:mm:ss A').format('h:mm A')}`
                : 'No schedule'}
            </Text>
          </View>
        </View>

        <View style={styles.messagePreview}>
          <View style={styles.messageTextContainer}>
            {item.lastMessage?.sender === currentUserId && (
              <Ionicons name="checkmark-done" size={16} color="#10B981" style={styles.readIndicator} />
            )}
            <Text style={[styles.messageText, item.unreadCount > 0 && styles.unreadMessageText]} numberOfLines={1}>
              {getMessagePreview(item)}
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

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSubtitle}>
            {conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0) > 0
              ? `${conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)} unread message(s)`
              : 'All caught up!'}
          </Text>
        </View>
        <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate(ROUTES.notification)}>
          <Ionicons name="notifications-outline" size={24} color="#1C1C1E" />
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.searchContainer, { transform: [{ scale: searchAnim }] }]}>
        <Feather name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
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

      <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.filtersContainer, { opacity: filtersAnim, transform: [{ translateY: filtersAnim.interpolate({ inputRange: [0,1], outputRange: [20,0] }) }] }]}>
        <TouchableOpacity style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]} onPress={() => setSelectedFilter('all')}>
          <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, selectedFilter === 'unread' && styles.filterButtonActive]} onPress={() => setSelectedFilter('unread')}>
          <View style={styles.filterBadge}>
            <Text style={[styles.filterText, selectedFilter === 'unread' && styles.filterTextActive]}>Unread</Text>
            {conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0) > 0 && (
              <View style={styles.filterNotification}>
                <Text style={styles.filterNotificationText}>{conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, selectedFilter === 'scheduled' && styles.filterButtonActive]} onPress={() => setSelectedFilter('scheduled')}>
          <Text style={[styles.filterText, selectedFilter === 'scheduled' && styles.filterTextActive]}>Scheduled</Text>
        </TouchableOpacity>
      </Animated.ScrollView>
    </View>
  );

  const emptyList = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIllustration}>
        <Ionicons name="chatbubbles-outline" size={80} color="#E5E7EB" />
      </View>
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No conversations found' : 'No messages yet'}
      </Text>
      <Text style={styles.emptyMessage}>
        {searchQuery
          ? 'Try adjusting your search or filter to find what you\'re looking for.'
          : 'When you start chatting with cleaners or hosts, your conversations will appear here.'}
      </Text>
      {!searchQuery && (
        <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate(ROUTES.cleaner_dashboard)}>
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
          renderItem={renderItem}
          ListEmptyComponent={emptyList}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
          }
        />
      )}
    </SafeAreaView>
  );
}

// Styles remain exactly as in your original Messages.js (just copy them)
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