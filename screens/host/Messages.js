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


import React, {
  useEffect,
  useState,
  useCallback,
  useContext,
  useRef,
} from 'react';

import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Text,
  RefreshControl,
  FlatList,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  TextInput,
  Image,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';

import {
  Ionicons,
  MaterialIcons,
  Feather,
  Entypo,
} from '@expo/vector-icons';

import { AuthContext } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebsocketContext';

import {
  getConversations,
  markConversationRead,
} from '../../services/connection/chatApi';

import ROUTES from '../../constants/routes';
import { LanguageContext } from '../../context/LanguageContext';
import { useTheme } from '../../theme';

export default function Messages({
  navigation,
}) {
  const {
    currentUserId,
    setTotalUnreadCount,
  } = useContext(AuthContext);

  const { language } =
    useContext(LanguageContext);

  const {
    isConnected,
    addMessageHandler,
    removeMessageHandler,
  } = useWebSocket();

  const {
    theme,
    isDark,
  } = useTheme();

  const styles = createStyles(theme);

  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------

  const [
    conversations,
    setConversations,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState('all');

  const [
    isSearchFocused,
    setIsSearchFocused,
  ] = useState(false);

  // ---------------------------------------------------------------------------
  // ANIMATION
  // ---------------------------------------------------------------------------

  const searchAnim =
    useRef(new Animated.Value(1))
      .current;

  const filtersAnim =
    useRef(new Animated.Value(0))
      .current;

  const conversationsRef =
    useRef(conversations);

  useEffect(() => {
    conversationsRef.current =
      conversations;
  }, [conversations]);

  // ---------------------------------------------------------------------------
  // SEARCH ANIMATION
  // ---------------------------------------------------------------------------

  useEffect(() => {
    Animated.timing(searchAnim, {
      toValue: isSearchFocused
        ? 1
        : 0.98,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [
    isSearchFocused,
    searchAnim,
  ]);

  // ---------------------------------------------------------------------------
  // FILTER ANIMATION
  // ---------------------------------------------------------------------------

  useEffect(() => {
    Animated.spring(filtersAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [filtersAnim]);

  // ---------------------------------------------------------------------------
  // FETCH CONVERSATIONS
  // ---------------------------------------------------------------------------

  const fetchConversations =
    useCallback(async () => {
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const data =
          await getConversations(
            currentUserId,
            language
          );

        if (
          !data ||
          !Array.isArray(data)
        ) {
          console.error(
            'Expected conversations array, received:',
            data
          );

          setConversations([]);

          setTotalUnreadCount(0);

          return;
        }

        const sorted = [...data].sort(
          (a, b) =>
            new Date(
              b.updatedAt || 0
            ) -
            new Date(
              a.updatedAt || 0
            )
        );

        setConversations(sorted);

        const totalUnread =
          sorted.reduce(
            (sum, conversation) =>
              sum +
              Number(
                conversation.unreadCount ||
                  0
              ),
            0
          );

        setTotalUnreadCount(
          totalUnread
        );
      } catch (error) {
        console.error(
          'Failed to fetch conversations:',
          error
        );

        setConversations([]);

        setTotalUnreadCount(0);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, [
      currentUserId,
      language,
      setTotalUnreadCount,
    ]);

  // ---------------------------------------------------------------------------
  // REFRESH WHEN SCREEN GETS FOCUS
  // ---------------------------------------------------------------------------

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [fetchConversations])
  );

  // ---------------------------------------------------------------------------
  // REFRESH WHEN LANGUAGE CHANGES
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    fetchConversations();
  }, [
    language,
    currentUserId,
  ]);

  // ---------------------------------------------------------------------------
  // WEBSOCKET REAL-TIME UPDATES
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const handleWebSocketMessage =
      (data) => {
        if (
          !data?.conversation_id
        ) {
          return;
        }

        setConversations((prev) => {
          const updated = [...prev];

          let found = false;

          for (
            let i = 0;
            i < updated.length;
            i++
          ) {
            if (
              updated[i].id ===
              data.conversation_id
            ) {
              found = true;

              let displayText =
                data.text ||
                (data.image
                  ? '📷 Image'
                  : '');

              if (
                data.translations &&
                data.translations[
                  language
                ]
              ) {
                displayText =
                  data.translations[
                    language
                  ];
              }

              const newLastMessage = {
                text: displayText,

                originalText:
                  data.text,

                sender:
                  data.sender_id,

                createdAt:
                  data.created_at,

                image:
                  data.image,
              };

              const isFromOther =
                data.sender_id !==
                currentUserId;

              const unreadIncrement =
                isFromOther ? 1 : 0;

              updated[i] = {
                ...updated[i],

                lastMessage:
                  newLastMessage,

                updatedAt:
                  data.created_at,

                unreadCount:
                  Number(
                    updated[i]
                      .unreadCount ||
                      0
                  ) +
                  unreadIncrement,
              };

              break;
            }
          }

          if (!found) {
            fetchConversations();

            return prev;
          }

          updated.sort(
            (a, b) =>
              new Date(
                b.updatedAt || 0
              ) -
              new Date(
                a.updatedAt || 0
              )
          );

          const totalUnread =
            updated.reduce(
              (
                sum,
                conversation
              ) =>
                sum +
                Number(
                  conversation.unreadCount ||
                    0
                ),
              0
            );

          setTotalUnreadCount(
            totalUnread
          );

          return updated;
        });
      };

    addMessageHandler(
      handleWebSocketMessage
    );

    return () =>
      removeMessageHandler(
        handleWebSocketMessage
      );
  }, [
    addMessageHandler,
    removeMessageHandler,
    currentUserId,
    language,
    setTotalUnreadCount,
    fetchConversations,
  ]);

  // ---------------------------------------------------------------------------
  // PULL TO REFRESH
  // ---------------------------------------------------------------------------

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  // ---------------------------------------------------------------------------
  // OPEN CONVERSATION
  // ---------------------------------------------------------------------------

  const handleChatPress =
    async (conversation) => {
      const previousUnread =
        Number(
          conversation.unreadCount ||
            0
        );

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id ===
          conversation.id
            ? {
                ...conv,
                unreadCount: 0,
              }
            : conv
        )
      );

      setTotalUnreadCount(
        (prevTotal) =>
          Math.max(
            0,
            Number(prevTotal || 0) -
              previousUnread
          )
      );

      try {
        await markConversationRead(
          conversation.id,
          currentUserId
        );
      } catch (error) {
        console.error(
          'Failed to mark conversation read:',
          error
        );
      }

      navigation.navigate(
        ROUTES.chat_conversation,
        {
          conversation,
        }
      );
    };

  // ---------------------------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------------------------

  const truncateString = (
    value
  ) => {
    if (!value) {
      return '';
    }

    const maxLength = 30;

    return value.length > maxLength
      ? `${value.slice(
          0,
          maxLength - 3
        )}...`
      : value;
  };

  const getMessagePreview =
    (item) => {
      if (item.lastMessage?.image) {
        return '📷 Image';
      }

      return truncateString(
        item.lastMessage?.text ||
          ''
      );
    };

  const getInitials = (
    firstName,
    lastName
  ) => {
    return `${firstName?.charAt(0) || ''}${
      lastName?.charAt(0) || ''
    }`.toUpperCase();
  };

  const formatTime = (
    timestamp
  ) => {
    if (!timestamp) {
      return '';
    }

    const now = moment();

    const msgTime =
      moment(timestamp);

    if (
      now.diff(
        msgTime,
        'days'
      ) < 1
    ) {
      return msgTime.format(
        'h:mm A'
      );
    }

    if (
      now.diff(
        msgTime,
        'days'
      ) < 7
    ) {
      return msgTime.format(
        'ddd'
      );
    }

    return msgTime.format(
      'MMM D'
    );
  };

  // ---------------------------------------------------------------------------
  // UNREAD COUNT
  // ---------------------------------------------------------------------------

  const totalUnread =
    conversations.reduce(
      (sum, conversation) =>
        sum +
        Number(
          conversation.unreadCount ||
            0
        ),
      0
    );

  // ---------------------------------------------------------------------------
  // FILTERING
  // ---------------------------------------------------------------------------

  const filteredConversations =
    conversations.filter(
      (conversation) => {
        const firstName =
          conversation.otherUser
            ?.firstname || '';

        const lastName =
          conversation.otherUser
            ?.lastname || '';

        const name =
          `${firstName} ${lastName}`.trim();

        const apartment =
          conversation.schedule
            ?.apartment_name || '';

        const normalizedSearch =
          searchQuery
            .trim()
            .toLowerCase();

        const matchesSearch =
          normalizedSearch === '' ||
          name
            .toLowerCase()
            .includes(
              normalizedSearch
            ) ||
          apartment
            .toLowerCase()
            .includes(
              normalizedSearch
            );

        let matchesFilter = true;

        if (
          selectedFilter ===
          'unread'
        ) {
          matchesFilter =
            Number(
              conversation.unreadCount ||
                0
            ) > 0;
        } else if (
          selectedFilter ===
          'scheduled'
        ) {
          matchesFilter =
            !!conversation.schedule
              ?.cleaning_date;
        }

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );

  // ---------------------------------------------------------------------------
  // RENDER CONVERSATION
  // ---------------------------------------------------------------------------

  const renderItem = ({
    item,
  }) => {
    const firstName =
      item.otherUser?.firstname ||
      '';

    const lastName =
      item.otherUser?.lastname ||
      '';

    const unread =
      Number(
        item.unreadCount || 0
      );

    const cleaningDate =
      item.schedule
        ?.cleaning_date;

    const cleaningTime =
      item.schedule
        ?.cleaning_time;

    let scheduleText =
      'No schedule';

    if (cleaningDate) {
      const formattedDate =
        moment(
          cleaningDate
        ).format('MMM D');

      let formattedTime = '';

      if (cleaningTime) {
        const parsedTime =
          moment(
            cleaningTime,
            [
              'HH:mm:ss',
              'H:mm:ss',
              'h:mm:ss A',
              'h:mm A',
            ],
            true
          );

        formattedTime =
          parsedTime.isValid()
            ? parsedTime.format(
                'h:mm A'
              )
            : '';
      }

      scheduleText =
        formattedTime
          ? `${formattedDate} • ${formattedTime}`
          : formattedDate;
    }

    return (
      <TouchableOpacity
        style={[
          styles.chatItemContainer,
          unread > 0 &&
            styles.unreadChatItem,
        ]}
        onPress={() =>
          handleChatPress(item)
        }
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View
          style={
            styles.avatarContainer
          }
        >
          {item.otherUser?.avatar ? (
            <Image
              source={{
                uri:
                  item.otherUser.avatar,
              }}
              style={styles.avatar}
            />
          ) : (
            <View
              style={[
                styles.avatar,
                styles.avatarFallback,
              ]}
            >
              <Text
                style={
                  styles.avatarText
                }
              >
                {getInitials(
                  firstName,
                  lastName
                )}
              </Text>
            </View>
          )}

          {unread > 0 && (
            <View
              style={
                styles.unreadIndicator
              }
            />
          )}
        </View>

        {/* Conversation */}
        <View
          style={styles.chatContent}
        >
          {/* Name + time */}
          <View
            style={
              styles.chatHeader
            }
          >
            <Text
              style={[
                styles.userName,
                unread > 0 &&
                  styles.unreadUserName,
              ]}
              numberOfLines={1}
            >
              {firstName}{' '}
              {lastName}
            </Text>

            <Text
              style={
                styles.timeText
              }
            >
              {formatTime(
                item.lastMessage
                  ?.createdAt
              )}
            </Text>
          </View>

          {/* Property + schedule */}
          <View
            style={
              styles.chatDetails
            }
          >
            <View
              style={
                styles.propertyInfo
              }
            >
              <MaterialIcons
                name="location-on"
                size={14}
                color={
                  theme.icon.muted
                }
              />

              <Text
                style={
                  styles.propertyText
                }
                numberOfLines={1}
              >
                {item.schedule
                  ?.apartment_name ||
                  'No property assigned'}
              </Text>
            </View>

            <View
              style={
                styles.scheduleInfo
              }
            >
              <Ionicons
                name="calendar-outline"
                size={14}
                color={
                  theme.icon.muted
                }
              />

              <Text
                style={
                  styles.scheduleText
                }
                numberOfLines={1}
              >
                {scheduleText}
              </Text>
            </View>
          </View>

          {/* Message preview */}
          <View
            style={
              styles.messagePreview
            }
          >
            <View
              style={
                styles.messageTextContainer
              }
            >
              {item.lastMessage
                ?.sender ===
                currentUserId && (
                <Ionicons
                  name="checkmark-done"
                  size={16}
                  color={
                    theme.status.success
                  }
                  style={
                    styles.readIndicator
                  }
                />
              )}

              <Text
                style={[
                  styles.messageText,
                  unread > 0 &&
                    styles.unreadMessageText,
                ]}
                numberOfLines={1}
              >
                {getMessagePreview(
                  item
                )}
              </Text>
            </View>

            {unread > 0 && (
              <View
                style={
                  styles.unreadBadge
                }
              >
                <Text
                  style={
                    styles.unreadCount
                  }
                >
                  {unread > 99
                    ? '99+'
                    : unread}
                </Text>
              </View>
            )}
          </View>
        </View>

        <Entypo
          name="chevron-right"
          size={20}
          color={theme.icon.muted}
          style={styles.chevron}
        />
      </TouchableOpacity>
    );
  };

  // ---------------------------------------------------------------------------
  // HEADER
  // ---------------------------------------------------------------------------

  const renderHeader =
    () => (
      <View
        style={styles.header}
      >
        {/* Header title */}
        <View
          style={styles.headerTop}
        >
          <View
            style={
              styles.headerTitleContainer
            }
          >
            <Text
              style={
                styles.headerTitle
              }
            >
              Messages
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }
            >
              {totalUnread > 0
                ? `${totalUnread} unread message${
                    totalUnread === 1
                      ? ''
                      : 's'
                  }`
                : 'All caught up!'}
            </Text>
          </View>

          <TouchableOpacity
            style={
              styles.notificationButton
            }
            onPress={() =>
              navigation.navigate(
                ROUTES.notification
              )
            }
            activeOpacity={0.7}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={
                theme.icon.default
              }
            />

            {totalUnread > 0 && (
              <View
                style={
                  styles.notificationBadge
                }
              >
                <Text
                  style={
                    styles.notificationBadgeText
                  }
                >
                  {totalUnread > 99
                    ? '99+'
                    : totalUnread}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search */}
        <Animated.View
          style={[
            styles.searchContainer,
            {
              transform: [
                {
                  scale:
                    searchAnim,
                },
              ],
            },
          ]}
        >
          <Feather
            name="search"
            size={20}
            color={
              isSearchFocused
                ? theme.brand.primary
                : theme.icon.muted
            }
            style={
              styles.searchIcon
            }
          />

          <TextInput
            style={
              styles.searchInput
            }
            placeholder="Search conversations..."
            placeholderTextColor={
              theme.input.placeholder
            }
            value={searchQuery}
            onChangeText={
              setSearchQuery
            }
            onFocus={() =>
              setIsSearchFocused(
                true
              )
            }
            onBlur={() =>
              setIsSearchFocused(
                false
              )
            }
            returnKeyType="search"
            autoCorrect={false}
          />

          {searchQuery.length >
            0 && (
            <TouchableOpacity
              onPress={() =>
                setSearchQuery(
                  ''
                )
              }
              hitSlop={{
                top: 8,
                bottom: 8,
                left: 8,
                right: 8,
              }}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={
                  theme.icon.muted
                }
              />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Filters */}
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          style={[
            styles.filtersContainer,
            {
              opacity:
                filtersAnim,

              transform: [
                {
                  translateY:
                    filtersAnim.interpolate(
                      {
                        inputRange: [
                          0,
                          1,
                        ],
                        outputRange: [
                          20,
                          0,
                        ],
                      }
                    ),
                },
              ],
            },
          ]}
          contentContainerStyle={
            styles.filtersContent
          }
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter ===
                'all' &&
                styles.filterButtonActive,
            ]}
            onPress={() =>
              setSelectedFilter(
                'all'
              )
            }
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter ===
                  'all' &&
                  styles.filterTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter ===
                'unread' &&
                styles.filterButtonActive,
            ]}
            onPress={() =>
              setSelectedFilter(
                'unread'
              )
            }
          >
            <View
              style={
                styles.filterBadge
              }
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter ===
                    'unread' &&
                    styles.filterTextActive,
                ]}
              >
                Unread
              </Text>

              {totalUnread > 0 && (
                <View
                  style={
                    styles.filterNotification
                  }
                >
                  <Text
                    style={
                      styles.filterNotificationText
                    }
                  >
                    {totalUnread >
                    99
                      ? '99+'
                      : totalUnread}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter ===
                'scheduled' &&
                styles.filterButtonActive,
            ]}
            onPress={() =>
              setSelectedFilter(
                'scheduled'
              )
            }
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter ===
                  'scheduled' &&
                  styles.filterTextActive,
              ]}
            >
              Scheduled
            </Text>
          </TouchableOpacity>
        </Animated.ScrollView>
      </View>
    );

  // ---------------------------------------------------------------------------
  // EMPTY STATE
  // ---------------------------------------------------------------------------

  const emptyList = () => (
    <View
      style={styles.emptyContainer}
    >
      <View
        style={
          styles.emptyIllustration
        }
      >
        <Ionicons
          name="chatbubbles-outline"
          size={64}
          color={theme.icon.muted}
        />
      </View>

      <Text
        style={styles.emptyTitle}
      >
        {searchQuery ||
        selectedFilter !== 'all'
          ? 'No conversations found'
          : 'No messages yet'}
      </Text>

      <Text
        style={
          styles.emptyMessage
        }
      >
        {searchQuery ||
        selectedFilter !== 'all'
          ? 'Try adjusting your search or filter to find what you’re looking for.'
          : 'When you start chatting with cleaners or hosts, your conversations will appear here.'}
      </Text>

      {!searchQuery &&
        selectedFilter ===
          'all' && (
          <TouchableOpacity
            style={
              styles.emptyButton
            }
            onPress={() =>
              navigation.navigate(
                ROUTES.cleaner_dashboard
              )
            }
            activeOpacity={0.8}
          >
            <Text
              style={
                styles.emptyButtonText
              }
            >
              Find Cleaners
            </Text>
          </TouchableOpacity>
        )}
    </View>
  );

  // ---------------------------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <>
        <StatusBar
          barStyle={
            isDark
              ? 'light-content'
              : 'dark-content'
          }
          backgroundColor={
            theme.background.default
          }
        />

        <SafeAreaView
          style={styles.container}
        >
          {renderHeader()}

          <View
            style={
              styles.loaderContainer
            }
          >
            <ActivityIndicator
              size="large"
              color={
                theme.brand.primary
              }
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Loading your
              conversations...
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN
  // ---------------------------------------------------------------------------

  return (
    <>
      <StatusBar
        barStyle={
          isDark
            ? 'light-content'
            : 'dark-content'
        }
        backgroundColor={
          theme.background.default
        }
      />

      <SafeAreaView
        style={styles.container}
      >
        {renderHeader()}

        <FlatList
          data={
            filteredConversations
          }
          renderItem={renderItem}
          ListEmptyComponent={
            emptyList
          }
          keyExtractor={(item) =>
            String(item.id)
          }
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={[
            styles.listContent,
            filteredConversations.length ===
              0 &&
              styles.emptyListContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={onRefresh}
              colors={[
                theme.brand.primary,
              ]}
              tintColor={
                theme.brand.primary
              }
              progressBackgroundColor={
                theme.surface.elevated
              }
            />
          }
        />
      </SafeAreaView>
    </>
  );
}

// =============================================================================
// THEME-AWARE STYLES
// =============================================================================

const createStyles = (theme) =>
  StyleSheet.create({
    // -------------------------------------------------------------------------
    // SCREEN
    // -------------------------------------------------------------------------

    container: {
      flex: 1,
      backgroundColor:
        theme.background.default,
    },

    // -------------------------------------------------------------------------
    // HEADER
    // -------------------------------------------------------------------------

    header: {
      backgroundColor:
        theme.background.default,

      paddingTop: 20,
      paddingHorizontal: 20,
      paddingBottom: 15,

      borderBottomWidth: 1,
      borderBottomColor:
        theme.divider,
    },

    headerTop: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },

    headerTitleContainer: {
      flex: 1,
    },

    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.text.primary,
      letterSpacing: -0.5,
    },

    headerSubtitle: {
      fontSize: 14,
      color: theme.text.secondary,
      marginTop: 4,
    },

    notificationButton: {
      width: 44,
      height: 44,
      borderRadius: 22,

      backgroundColor:
        theme.surface.elevated,

      justifyContent: 'center',
      alignItems: 'center',

      borderWidth: 1,
      borderColor:
        theme.border.default,

      position: 'relative',
    },

    notificationBadge: {
      position: 'absolute',
      top: -3,
      right: -3,

      minWidth: 18,
      height: 18,
      paddingHorizontal: 4,

      borderRadius: 9,

      backgroundColor:
        theme.status.error,

      justifyContent: 'center',
      alignItems: 'center',

      borderWidth: 2,
      borderColor:
        theme.background.default,
    },

    notificationBadgeText: {
      color: theme.text.inverse,
      fontSize: 9,
      fontWeight: '700',
    },

    // -------------------------------------------------------------------------
    // SEARCH
    // -------------------------------------------------------------------------

    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',

      backgroundColor:
        theme.input.background,

      borderRadius: 14,

      paddingHorizontal: 15,
      paddingVertical: 11,

      marginBottom: 15,

      borderWidth: 1,
      borderColor:
        theme.input.border,
    },

    searchIcon: {
      marginRight: 10,
    },

    searchInput: {
      flex: 1,

      fontSize: 16,
      color: theme.input.text,

      padding: 0,

      minHeight: 24,
    },

    // -------------------------------------------------------------------------
    // FILTERS
    // -------------------------------------------------------------------------

    filtersContainer: {
      marginBottom: 2,
    },

    filtersContent: {
      paddingRight: 10,
    },

    filterButton: {
      paddingHorizontal: 18,
      paddingVertical: 8,

      backgroundColor:
        theme.surface.elevated,

      borderRadius: 20,

      marginRight: 10,

      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    filterButtonActive: {
      backgroundColor:
        theme.brand.primary,

      borderColor:
        theme.brand.primary,
    },

    filterText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.text.secondary,
    },

    filterTextActive: {
      color: theme.text.inverse,
      fontWeight: '600',
    },

    filterBadge: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    filterNotification: {
      backgroundColor:
        theme.status.error,

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
      color: theme.text.inverse,
    },

    // -------------------------------------------------------------------------
    // LIST
    // -------------------------------------------------------------------------

    listContent: {
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 30,
    },

    emptyListContent: {
      flexGrow: 1,
    },

    // -------------------------------------------------------------------------
    // CHAT CARD
    // -------------------------------------------------------------------------

    chatItemContainer: {
      flexDirection: 'row',

      backgroundColor:
        theme.card.background,

      borderRadius: 16,

      padding: 16,
      marginBottom: 12,

      alignItems: 'center',

      borderWidth: 1,
      borderColor:
        theme.card.border,

      shadowColor:
        theme.shadow?.color ||
        '#000000',

      shadowOffset: {
        width: 0,
        height: 1,
      },

      shadowOpacity:
        theme.shadow?.opacity ||
        0.05,

      shadowRadius: 6,

      elevation: 1,
    },

    unreadChatItem: {
      borderColor:
        theme.brand.primary,

      backgroundColor:
        theme.surface.selected,
    },

    // -------------------------------------------------------------------------
    // AVATAR
    // -------------------------------------------------------------------------

    avatarContainer: {
      position: 'relative',
      marginRight: 16,
    },

    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,

      backgroundColor:
        theme.surface.elevated,
    },

    avatarFallback: {
      backgroundColor:
        theme.brand.primary,

      justifyContent: 'center',
      alignItems: 'center',
    },

    avatarText: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.text.inverse,
    },

    unreadIndicator: {
      position: 'absolute',

      top: 0,
      right: 0,

      width: 12,
      height: 12,

      borderRadius: 6,

      backgroundColor:
        theme.status.success,

      borderWidth: 2,
      borderColor:
        theme.card.background,
    },

    // -------------------------------------------------------------------------
    // CONTENT
    // -------------------------------------------------------------------------

    chatContent: {
      flex: 1,
      minWidth: 0,
    },

    chatHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',

      marginBottom: 8,
    },

    userName: {
      flex: 1,

      fontSize: 16,
      fontWeight: '600',

      color: theme.text.primary,

      marginRight: 8,
    },

    unreadUserName: {
      fontWeight: '700',
    },

    timeText: {
      fontSize: 12,
      color: theme.text.muted,
      fontWeight: '500',
    },

    // -------------------------------------------------------------------------
    // PROPERTY / SCHEDULE
    // -------------------------------------------------------------------------

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
      color: theme.text.secondary,

      marginLeft: 6,
      flex: 1,
    },

    scheduleInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    scheduleText: {
      fontSize: 13,
      color: theme.text.secondary,

      marginLeft: 6,

      flex: 1,
    },

    // -------------------------------------------------------------------------
    // MESSAGE PREVIEW
    // -------------------------------------------------------------------------

    messagePreview: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
    },

    messageTextContainer: {
      flexDirection: 'row',
      alignItems: 'center',

      flex: 1,
      minWidth: 0,
    },

    readIndicator: {
      marginRight: 6,
    },

    messageText: {
      fontSize: 14,
      color: theme.text.secondary,

      flex: 1,
    },

    unreadMessageText: {
      color: theme.text.primary,
      fontWeight: '600',
    },

    unreadBadge: {
      backgroundColor:
        theme.brand.primary,

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
      color: theme.text.inverse,
    },

    chevron: {
      marginLeft: 8,
    },

    // -------------------------------------------------------------------------
    // LOADING
    // -------------------------------------------------------------------------

    loaderContainer: {
      flex: 1,

      justifyContent: 'center',
      alignItems: 'center',

      backgroundColor:
        theme.background.default,
    },

    loadingText: {
      marginTop: 16,

      fontSize: 16,

      color: theme.text.secondary,

      fontWeight: '500',
    },

    // -------------------------------------------------------------------------
    // EMPTY STATE
    // -------------------------------------------------------------------------

    emptyContainer: {
      flex: 1,

      justifyContent: 'center',
      alignItems: 'center',

      paddingHorizontal: 40,
      paddingTop: 60,
      paddingBottom: 40,
    },

    emptyIllustration: {
      width: 120,
      height: 120,

      borderRadius: 60,

      backgroundColor:
        theme.surface.elevated,

      justifyContent: 'center',
      alignItems: 'center',

      marginBottom: 24,

      borderWidth: 8,
      borderColor:
        theme.background.sunken,
    },

    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',

      color: theme.text.primary,

      textAlign: 'center',

      marginBottom: 8,
    },

    emptyMessage: {
      fontSize: 15,

      color: theme.text.secondary,

      textAlign: 'center',

      lineHeight: 22,

      marginBottom: 24,
    },

    emptyButton: {
      backgroundColor:
        theme.button.primaryBackground,

      paddingHorizontal: 24,
      paddingVertical: 12,

      borderRadius: 12,
    },

    emptyButtonText: {
      fontSize: 15,
      fontWeight: '600',

      color:
        theme.button.primaryText,
    },
  });