import React, { useEffect, useState, useCallback, useContext, useRef, useLayoutEffect } from 'react';
import {
  SafeAreaView, StyleSheet, StatusBar, Platform, Modal, Image, Text, View,
  TouchableOpacity, ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView,
  TextInput, FlatList, Dimensions, AppState
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import ImageViewing from 'react-native-image-viewing';
import { AuthContext } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebsocketContext';
import { getMessages, markConversationRead, getConversations } from '../../services/connection/chatApi';
import COLORS from '../../constants/colors';
import { LanguageContext } from '../../context/LanguageContext';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ChatConversation({ navigation, route }) {
  const { currentUser, currentUserId } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const { sendMessage, addMessageHandler, removeMessageHandler, isConnected, sendRawMessage } = useWebSocket();

  // Conversation state – either from route.params.conversation or fetched by ID
  const [conversation, setConversation] = useState(() => {
    const conv = route.params?.conversation;
    if (conv && !conv.schedule) conv.schedule = {};
    return conv || null;
  });
  const [loadingConversation, setLoadingConversation] = useState(!conversation && !!route.params?.conversationId);

  // Chat messages state
  const [messages, setMessages] = useState([]);
  const [flatData, setFlatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [text, setText] = useState('');
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesForViewing, setImagesForViewing] = useState([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [inputHeight, setInputHeight] = useState(44);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState('back');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [isSimulator, setIsSimulator] = useState(false);
  const [currentHeader, setCurrentHeader] = useState('');

  // Typing indicator state
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const lastTypingSentRef = useRef(0);
  const TYPING_DEBOUNCE_MS = 1000;

  const flatListRef = useRef(null);
  const textInputRef = useRef(null);
  const cameraRef = useRef(null);
  const fetchInProgressRef = useRef(false);
  const oldestIdRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const loadingOlderRef = useRef(false);
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;
  const recentMessageIds = useRef(new Set());

  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const initialLoadRef = useRef(false);

  const storage = getStorage();

  // ----- Helper: getConversationById -----
  const getConversationById = async (conversationId, userId, lang) => {
    const allConvs = await getConversations(userId, lang);
    const found = allConvs.find(c => c.id === conversationId);
    if (!found) throw new Error('Conversation not found');
    if (!found.schedule) found.schedule = {};
    return found;
  };

  // Fetch conversation by ID if only an ID was provided (deep link)
  useEffect(() => {
    const fetchConversation = async () => {
      if (!route.params?.conversationId) return;
      try {
        const data = await getConversationById(route.params.conversationId, currentUserId, language);
        setConversation(data);
      } catch (error) {
        console.error('Failed to fetch conversation:', error);
        Alert.alert('Error', 'Could not load conversation');
        navigation.goBack();
      } finally {
        setLoadingConversation(false);
      }
    };
    if (!conversation && route.params?.conversationId) {
      fetchConversation();
    }
  }, [route.params?.conversationId, currentUserId, language]);

  // ----- Set placeholder header immediately (prevents "schedule of undefined" error) -----
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Chat',
    });
  }, [navigation]);

  // Update header when conversation loads
  useEffect(() => {
    if (conversation) {
      navigation.setOptions({
        headerTitle: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={{ uri: conversation.otherUser?.avatar || 'https://via.placeholder.com/40' }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
            <View style={{ marginLeft: 10 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{conversation.otherUser?.firstname || 'User'}</Text>
              <Text style={{ fontSize: 14, color: 'white' }}>
                {conversation.schedule?.apartment_name || conversation.property_name || 'Property'}
              </Text>
            </View>
          </View>
        ),
      });
    }
  }, [conversation, navigation]);

  // Handle incoming typing events
  useEffect(() => {
    if (!conversation) return;
    const handleTypingEvent = (data) => {
      if (data.type === 'typing_start' && data.sender_id === conversation.otherUser?.id) {
        setIsOtherUserTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsOtherUserTyping(false);
        }, 3000);
      }
      if (data.type === 'typing_stop' && data.sender_id === conversation.otherUser?.id) {
        setIsOtherUserTyping(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      }
    };
    addMessageHandler(handleTypingEvent);
    return () => removeMessageHandler(handleTypingEvent);
  }, [conversation, addMessageHandler, removeMessageHandler]);

  // Initial load of messages
  useEffect(() => {
    if (!conversation) return;
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      markConversationRead(conversation.id, currentUserId).catch(console.error);
      fetchMessages();
    }
  }, [conversation]);

  // Keyboard listeners
  useEffect(() => {
    const show = Keyboard.addListener('keyboardWillShow', (e) => setKeyboardHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardWillHide', () => setKeyboardHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      const checkSimulator = async () => {
        try { if (permission?.granted) setIsSimulator(false); } catch (error) { setIsSimulator(true); }
      };
      checkSimulator();
    }
  }, [permission]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') console.log('App came to foreground');
    });
    return () => subscription.remove();
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (isConnected && conversation?.otherUser?.id) {
        sendRawMessage?.({
          type: 'typing_stop',
          recipient_id: conversation.otherUser.id,
          conversation_id: conversation.id,
        });
      }
    };
  }, [isConnected, conversation]);

  const getDisplayDate = (date) => {
    const msgDate = moment(date);
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'days').startOf('day');
    if (msgDate.isSame(today, 'day')) return 'Today';
    if (msgDate.isSame(yesterday, 'day')) return 'Yesterday';
    if (msgDate.isSame(moment(), 'week')) return msgDate.format('dddd');
    return msgDate.format('MMMM D, YYYY');
  };

  const flattenWithHeaders = (msgs) => {
    if (!msgs.length) return [];
    const sorted = [...msgs].sort((a, b) => a.createdAt - b.createdAt);
    const grouped = {};
    sorted.forEach(msg => {
      const displayDate = getDisplayDate(msg.createdAt);
      if (!grouped[displayDate]) grouped[displayDate] = [];
      grouped[displayDate].push(msg);
    });
    const flat = [];
    Object.keys(grouped).forEach(title => {
      flat.push({ type: 'header', title });
      flat.push(...grouped[title].map(msg => ({ type: 'message', ...msg })));
    });
    return flat;
  };

  const fetchMessages = async (loadMore = false) => {
    if (!conversation) return;
    if (fetchInProgressRef.current) return;
    if (loadMore && (!hasMore || loadingMore)) return;
    if (loadMore) loadingOlderRef.current = true;

    fetchInProgressRef.current = true;
    loadMore ? setLoadingMore(true) : setLoading(true);

    try {
      const params = { limit: 20 };
      if (loadMore && oldestIdRef.current) params.last_id = oldestIdRef.current;
      const data = await getMessages(conversation.id, currentUserId, params);

      if (!data || !Array.isArray(data)) {
        if (loadMore) setHasMore(false);
        return;
      }

      const transformed = data.map(msg => ({
        id: msg.id,
        createdAt: new Date(msg.createdAt),
        text: msg.text,
        image: msg.image,
        sender: msg.senderId,
        isMe: msg.senderId === currentUserId,
        translations: msg.translations || {},
        user: {
          _id: msg.senderId,
          name: msg.senderId === currentUserId ? currentUser?.name : conversation.otherUser?.name,
          avatar: msg.senderId === currentUserId ? currentUser?.avatar : conversation.otherUser?.avatar,
        },
      }));
      transformed.sort((a, b) => a.createdAt - b.createdAt);

      if (loadMore) {
        const existingIds = new Set(messages.map(m => m.id));
        const newMessages = transformed.filter(m => !existingIds.has(m.id));
        if (newMessages.length === 0) setHasMore(false);
        else {
          const newList = [...newMessages, ...messages];
          setMessages(newList);
          setFlatData(flattenWithHeaders(newList));
          oldestIdRef.current = newMessages[0]?.id;
          if (newMessages.length < 20) setHasMore(false);
        }
      } else {
        setMessages(transformed);
        setFlatData(flattenWithHeaders(transformed));
        if (transformed.length > 0) oldestIdRef.current = transformed[0].id;
        setHasMore(transformed.length === 20);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      Alert.alert('Error', 'Could not load messages');
    } finally {
      if (loadMore) {
        setLoadingMore(false);
        setTimeout(() => { loadingOlderRef.current = false; }, 500);
      } else setLoading(false);
      fetchInProgressRef.current = false;
    }
  };

  // Mark as read when conversation loads
  useEffect(() => {
    if (conversation) {
      markConversationRead(conversation.id, currentUserId).catch(console.error);
      fetchMessages();
    }
  }, [conversation]);

  // Translation update handler
  useEffect(() => {
    const handleTranslationUpdate = (data) => {
      if (data.type === 'translation_update') {
        setMessages(prev => {
          const updated = prev.map(msg =>
            msg.id === data.message_id ? { ...msg, translations: data.translations } : msg
          );
          setFlatData(flattenWithHeaders(updated));
          return updated;
        });
      }
    };
    addMessageHandler(handleTranslationUpdate);
    return () => removeMessageHandler(handleTranslationUpdate);
  }, [addMessageHandler, removeMessageHandler]);

  // WebSocket incoming message handler
  useEffect(() => {
    if (!conversation) return;
    const handleIncoming = (data) => {
      if (data.type === 'translation_update') return;
      if (data.type === 'typing_start' || data.type === 'typing_stop') return;
      if (data.type === 'error') {
        Alert.alert('Error', data.message);
        return;
      }

      const messageConversationId = data.conversation_id || data.conversationId;
      if (messageConversationId !== conversation.id) return;

      const messageId = data._id || data.id;
      if (messageId && recentMessageIds.current.has(messageId)) return;

      if (messageId) {
        recentMessageIds.current.add(messageId);
        setTimeout(() => recentMessageIds.current.delete(messageId), 2000);
      }

      if (!data.text && !data.image) return;

      let newTimestamp = data.createdAt ? new Date(data.createdAt) : new Date();
      if (messages.length > 0 && newTimestamp <= messages[messages.length - 1]?.createdAt) {
        newTimestamp = new Date(messages[messages.length - 1].createdAt.getTime() + 1);
      }

      const senderId = data.sender_id || data.senderId;
      const isMe = senderId === currentUserId;

      const newMsg = {
        id: messageId || Date.now().toString(),
        createdAt: newTimestamp,
        text: data.text || '',
        image: data.image || null,
        sender: senderId,
        isMe,
        translations: data.translations || {},
        user: {
          _id: senderId,
          name: isMe ? currentUser?.name : conversation.otherUser?.name,
          avatar: isMe ? currentUser?.avatar : conversation.otherUser?.avatar,
        },
      };

      setMessages(prev => {
        if (prev.some(msg => msg.id === newMsg.id)) return prev;
        const newList = [...prev, newMsg];
        setFlatData(flattenWithHeaders(newList));
        setTimeout(() => {
          if (flatListRef.current && isNearBottomRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
        return newList;
      });
    };

    addMessageHandler(handleIncoming);
    return () => removeMessageHandler(handleIncoming);
  }, [conversation, currentUserId, currentUser, addMessageHandler, removeMessageHandler, messages.length]);

  // Scroll to bottom when near bottom and not loading older
  useEffect(() => {
    if (!loading && flatData.length > 0 && flatListRef.current && !loadingMore && !loadingOlderRef.current && isNearBottomRef.current) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
    }
  }, [flatData, loading, loadingMore]);

  const onScroll = (e) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    isNearBottomRef.current = contentSize.height - (contentOffset.y + layoutMeasurement.height) < 100;
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      const topItem = viewableItems[0];
      if (!topItem.item) return;
      if (topItem.item.type === 'header') setCurrentHeader(topItem.item.title);
      else {
        const index = topItem.index;
        for (let i = index; i >= 0; i--) {
          if (flatData[i] && flatData[i].type === 'header') {
            setCurrentHeader(flatData[i].title);
            break;
          }
        }
      }
    }
  }, [flatData]);

  const handleTextChange = (newText) => {
    setText(newText);
    if (!isConnected) return;
    const now = Date.now();
    const isTyping = newText.length > 0;
    if (isTyping) {
      if (now - lastTypingSentRef.current > TYPING_DEBOUNCE_MS) {
        lastTypingSentRef.current = now;
        sendRawMessage?.({
          type: 'typing_start',
          recipient_id: conversation.otherUser.id,
          conversation_id: conversation.id,
          sender_name: currentUser?.name || 'Someone',
        });
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendRawMessage?.({
          type: 'typing_stop',
          recipient_id: conversation.otherUser.id,
          conversation_id: conversation.id,
        });
        lastTypingSentRef.current = 0;
      }, 2000);
    } else {
      if (lastTypingSentRef.current > 0) {
        sendRawMessage?.({
          type: 'typing_stop',
          recipient_id: conversation.otherUser.id,
          conversation_id: conversation.id,
        });
        lastTypingSentRef.current = 0;
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  const containsContactInfo = (text) => {
    const patterns = [
      /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
      /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/,
      /@[A-Za-z0-9_]+/,
      /\b\d{1,5}\s\w+\s(street|st|avenue|ave|road|rd|lane|ln|drive|dr|court|ct|boulevard|blvd)\b/i,
    ];
    return patterns.some(pattern => pattern.test(text));
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (containsContactInfo(trimmed)) {
      Alert.alert('Warning', 'Contact information is not allowed.');
      return;
    }
    if (!isConnected) {
      Alert.alert('Error', 'Not connected to chat server');
      return;
    }
    console.log('Sending message:', trimmed);
    if (sendMessage(conversation.otherUser.id, trimmed, conversation.id, null)) {
      setText('');
      if (lastTypingSentRef.current > 0) {
        sendRawMessage?.({
          type: 'typing_stop',
          recipient_id: conversation.otherUser.id,
          conversation_id: conversation.id,
        });
        lastTypingSentRef.current = 0;
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  // Image functions
  const uploadImageAsync = async (uri) => {
    try {
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => resolve(xhr.response);
        xhr.onerror = (e) => {
          console.log(e);
          reject(new TypeError('Network request failed'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });
      const filename = `chat_images/${conversation.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const fileRef = storageRef(storage, filename);
      await uploadBytes(fileRef, blob);
      blob.close();
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const uploadAndSendImage = async (uri) => {
    setUploading(true);
    try {
      const imageUrl = await uploadImageAsync(uri);
      sendMessage(conversation.otherUser.id, '', conversation.id, imageUrl);
    } catch (error) {
      console.error('Failed to upload image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      for (const asset of result.assets) await uploadAndSendImage(asset.uri);
    }
  };

  const openCamera = () => setShowCamera(true);
  const closeCamera = () => setShowCamera(false);
  const toggleCameraType = () => setCameraType(prev => (prev === 'back' ? 'front' : 'back'));
  const onCameraReady = () => setIsCameraReady(true);

  const takePhoto = async () => {
    if (isSimulator || !permission?.granted) {
      await pickImageFromLibrary();
      return;
    }
    if (cameraRef.current && isCameraReady) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, skipProcessing: true });
        if (photo.uri) {
          closeCamera();
          await uploadAndSendImage(photo.uri);
        }
      } catch (error) {
        console.error('Failed to take photo:', error);
        Alert.alert('Error', 'Failed to take photo');
      }
    } else {
      await pickImageFromLibrary();
    }
  };

  const pickImageFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets) await uploadAndSendImage(result.assets[0].uri);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
    if (!showEmojiPicker) Keyboard.dismiss();
  };

  const onEmojiSelected = (emoji) => setText(prev => prev + emoji);

  const openImageViewer = (imageUrl, allImages = []) => {
    let images = allImages.length ? allImages : [{ uri: imageUrl }];
    let initialIndex = allImages.findIndex(img => img.uri === imageUrl);
    setImagesForViewing(images);
    setCurrentImageIndex(initialIndex >= 0 ? initialIndex : 0);
    setImageViewerVisible(true);
  };

  const closeImageViewer = () => setImageViewerVisible(false);
  const getAllImages = () => messages.filter(m => m.image).map(m => ({ uri: m.image }));

  const shouldShowAvatar = (current, prevMessage, nextMessage) => {
    if (current.isMe) return false;
    if (!prevMessage || prevMessage.isMe) return true;
    if (moment(current.createdAt).diff(moment(prevMessage.createdAt), 'minutes') > 5) return true;
    if (!nextMessage || nextMessage.isMe) return true;
    return false;
  };

  const renderItem = ({ item }) => {
    if (!item || item.type === 'header') return null;
    const msg = item;
    const showAvatar = shouldShowAvatar(msg, null, null);
    let displayText = msg.text;
    let isTranslated = false;
    if (!msg.isMe && msg.translations && msg.translations[language]) {
      displayText = msg.translations[language];
      isTranslated = true;
    }
    const timeString = moment(msg.createdAt).format('h:mm A');

    return (
      <View style={[styles.messageRow, msg.isMe ? styles.messageRowRight : styles.messageRowLeft]}>
        {!msg.isMe && (showAvatar ? (
          <Image source={{ uri: conversation.otherUser?.avatar || 'https://via.placeholder.com/40' }} style={styles.avatar} />
        ) : <View style={styles.avatarSpacer} />)}
        <View style={[styles.messageContainer, msg.isMe ? styles.myMessageContainer : styles.otherMessageContainer, !showAvatar && styles.messageWithoutAvatar]}>
          {msg.image ? (
            <TouchableOpacity onPress={() => openImageViewer(msg.image, getAllImages())} activeOpacity={0.7}>
              <Image source={{ uri: msg.image }} style={styles.messageImage} resizeMode="cover" />
              <View style={styles.imageOverlay}><Ionicons name="expand" size={16} color="white" /></View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.messageBubble, msg.isMe ? styles.myMessageBubble : styles.otherMessageBubble]}>
              <Text style={[styles.messageText, msg.isMe ? styles.myMessageText : styles.otherMessageText]}>
                {displayText}
              </Text>
              {isTranslated && <Text style={styles.translatedHint}>📝 Translated from {msg.text}</Text>}
            </View>
          )}
          <View style={[styles.messageFooter, msg.isMe ? styles.myMessageFooter : styles.otherMessageFooter]}>
            <Text style={[styles.messageTime, msg.isMe ? styles.myMessageTime : styles.otherMessageTime]}>
              {timeString}
            </Text>
            {msg.isMe && <MaterialIcons name="done-all" size={14} color="#4CAF50" style={styles.deliveryIcon} />}
          </View>
        </View>
        {msg.isMe && (showAvatar ? (
          <Image source={{ uri: currentUser?.avatar || 'https://via.placeholder.com/40' }} style={[styles.avatar, styles.myAvatar]} />
        ) : <View style={styles.avatarSpacer} />)}
      </View>
    );
  };

  const renderMessageOptions = () => {
    Alert.alert('Send Media', 'Choose an option', [
      { text: 'Choose from Library', onPress: pickImage },
      { text: 'Take Photo', onPress: openCamera },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const renderCameraModal = () => {
    if (isSimulator) {
      return (
        <View style={styles.cameraContainer}>
          <View style={styles.cameraHeader}>
            <TouchableOpacity style={styles.cameraCloseButton} onPress={closeCamera}>
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.simulatorContainer}>
            <Ionicons name="camera-off" size={64} color="white" />
            <Text style={styles.simulatorText}>Camera not available in simulator</Text>
            <TouchableOpacity style={styles.libraryButton} onPress={pickImageFromLibrary}>
              <Ionicons name="images" size={24} color="white" />
              <Text style={styles.libraryButtonText}>Pick from Library</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    if (!permission) {
      return (
        <View style={styles.cameraContainer}>
          <View style={styles.permissionContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.permissionText}>Requesting camera permission...</Text>
          </View>
        </View>
      );
    }
    if (!permission.granted) {
      return (
        <View style={styles.cameraContainer}>
          <View style={styles.cameraHeader}>
            <TouchableOpacity style={styles.cameraCloseButton} onPress={closeCamera}>
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.permissionContainer}>
            <Ionicons name="camera-off" size={48} color="white" />
            <Text style={styles.permissionText}>No access to camera</Text>
            <TouchableOpacity style={styles.permissionButton} onPress={() => requestPermission()}>
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={cameraType} ref={cameraRef} onCameraReady={onCameraReady}>
          <View style={styles.cameraHeader}>
            <TouchableOpacity style={styles.cameraCloseButton} onPress={closeCamera}>
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
              <Ionicons name="camera-reverse" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
              <View style={styles.captureButtonOuter}>
                <View style={styles.captureButtonInner} />
              </View>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  };

  // Loading states
  if (loadingConversation) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    );
  }
  if (!conversation) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Conversation not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {currentHeader !== '' && flatData.length > 0 && (
            <View style={styles.floatingHeader}>
              <View style={styles.dateChip}>
                <Text style={styles.dateChipText}>{currentHeader}</Text>
              </View>
            </View>
          )}

          <FlatList
            ref={flatListRef}
            data={flatData}
            renderItem={renderItem}
            keyExtractor={(item, index) => {
              if (!item) return `empty-${index}`;
              if (item.type === 'header') return `header-${item.title}-${index}`;
              return `msg-${item.id}-${item.createdAt?.getTime() || index}`;
            }}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScroll={onScroll}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            ListHeaderComponent={
              loadingMore ? (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.loadingMoreText}>Loading older messages...</Text>
                </View>
              ) : hasMore ? (
                <TouchableOpacity onPress={() => fetchMessages(true)} style={styles.loadMoreButton} disabled={loadingMore}>
                  <Text style={styles.loadMoreText}>Load Older Messages</Text>
                </TouchableOpacity>
              ) : null
            }
            ListFooterComponent={<View style={{ height: 10 }} />}
          />

          {isOtherUserTyping && (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>{conversation.otherUser?.name} is typing...</Text>
            </View>
          )}

          <View style={styles.inputToolbar}>
            <TouchableOpacity style={styles.actionButton} onPress={toggleEmojiPicker}>
              <Ionicons name={showEmojiPicker ? 'close' : 'happy'} size={26} color={showEmojiPicker ? COLORS.error : COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={renderMessageOptions}>
              <Ionicons name="camera" size={26} color={COLORS.primary} />
            </TouchableOpacity>
            <View style={styles.inputContainer}>
              <TextInput
                ref={textInputRef}
                style={[styles.textInput, { height: Math.max(44, Math.min(100, inputHeight)) }]}
                value={text}
                onChangeText={handleTextChange}
                placeholder="Type a message..."
                placeholderTextColor="#999"
                multiline
                maxLength={1000}
                onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
              />
            </View>
            <TouchableOpacity style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]} onPress={handleSend} disabled={!text.trim()}>
              <Ionicons name="send" size={24} color={text.trim() ? COLORS.primary : '#ccc'} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        <Modal animationType="slide" transparent={false} visible={showCamera} onRequestClose={closeCamera}>
          {renderCameraModal()}
        </Modal>
        <ImageViewing
          images={imagesForViewing}
          imageIndex={currentImageIndex}
          visible={imageViewerVisible}
          onRequestClose={closeImageViewer}
          backgroundColor="rgba(0,0,0,0.95)"
          swipeToCloseEnabled
          doubleTapToZoomEnabled
          HeaderComponent={({ imageIndex }) => (
            <View style={styles.imageViewerHeader}>
              <Text style={styles.imageViewerText}>{imageIndex + 1} / {imagesForViewing.length}</Text>
              <TouchableOpacity onPress={closeImageViewer} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>
          )}
        />
        {uploading && (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.uploadingText}>Uploading image...</Text>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.primary },
  container: { flex: 1, backgroundColor: '#f0f0f0', paddingTop:26 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: COLORS.gray },
  errorText: { fontSize: 18, color: COLORS.error, marginBottom: 20 },
  backButtonText: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
  messagesList: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 80 },
  floatingHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, alignItems: 'center', paddingTop: 12, pointerEvents: 'none' },
  dateChip: { backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  dateChipText: { fontSize: 14, fontWeight: '600', color: '#FFF', letterSpacing: 0.3 },
  typingIndicator: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f0f0f0', borderTopWidth: 1, borderTopColor: '#e0e0e0', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  typingText: { fontSize: 12, color: '#666', fontStyle: 'italic' },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4 },
  messageRowLeft: { justifyContent: 'flex-start' },
  messageRowRight: { justifyContent: 'flex-end' },
  avatar: { width: 32, height: 32, borderRadius: 16, marginHorizontal: 8, marginBottom: 4 },
  myAvatar: { marginLeft: 8, marginRight: 0 },
  avatarSpacer: { width: 32, marginHorizontal: 8 },
  messageContainer: { maxWidth: '87%', marginBottom: 4 },
  myMessageContainer: { alignItems: 'flex-end' },
  otherMessageContainer: { alignItems: 'flex-start' },
  messageWithoutAvatar: { marginLeft: 48 },
  messageBubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, maxWidth: '100%' },
  myMessageBubble: { backgroundColor: '#DCF8C6', borderBottomRightRadius: 4 },
  otherMessageBubble: { backgroundColor: 'white', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  messageText: { fontSize: 16, lineHeight: 22 },
  myMessageText: { color: '#000' },
  otherMessageText: { color: '#000' },
  messageFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 4, paddingHorizontal: 8 },
  myMessageFooter: { justifyContent: 'flex-end' },
  otherMessageFooter: { justifyContent: 'flex-start' },
  messageTime: { fontSize: 11, color: '#666' },
  myMessageTime: { color: '#666' },
  otherMessageTime: { color: '#666' },
  deliveryIcon: { marginLeft: 2 },
  messageImage: { width: 200, height: 150, borderRadius: 12, overflow: 'hidden' },
  imageOverlay: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  inputToolbar: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e0e0e0', paddingHorizontal: 12, paddingVertical: 10, minHeight: 60 },
  inputContainer: { flex: 1, marginHorizontal: 8 },
  textInput: { backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, maxHeight: 100, minHeight: 40 },
  actionButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendButtonDisabled: { opacity: 0.5 },
  cameraContainer: { flex: 1, backgroundColor: 'black' },
  camera: { flex: 1 },
  cameraHeader: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 30, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
  cameraCloseButton: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 8 },
  flipButton: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 8 },
  cameraControls: { position: 'absolute', bottom: 40, alignSelf: 'center' },
  captureButton: { alignItems: 'center', justifyContent: 'center' },
  captureButtonOuter: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'white' },
  captureButtonInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'white' },
  simulatorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', paddingHorizontal: 20 },
  simulatorText: { color: 'white', fontSize: 18, fontWeight: '600', marginTop: 20, textAlign: 'center' },
  libraryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, marginTop: 20 },
  libraryButtonText: { color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 10 },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  permissionText: { color: 'white', fontSize: 16, marginTop: 16, textAlign: 'center', paddingHorizontal: 20 },
  permissionButton: { marginTop: 20, backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  permissionButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  uploadingContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  uploadingText: { color: 'white', marginTop: 10, fontSize: 16 },
  imageViewerHeader: { position: 'absolute', top: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, zIndex: 1 },
  imageViewerText: { color: 'white', fontSize: 16, fontWeight: '600' },
  closeButton: { padding: 5 },
  loadingMoreContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10 },
  loadingMoreText: { marginLeft: 8, fontSize: 12, color: '#666' },
  loadMoreButton: { backgroundColor: '#007AFF', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, alignSelf: 'center', marginVertical: 10 },
  loadMoreText: { color: 'white', fontWeight: '600', fontSize: 14 },
  translatedHint: { fontSize: 10, color: '#888', marginTop: 4, fontStyle: 'italic' },
});



