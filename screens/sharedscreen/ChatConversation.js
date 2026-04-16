// import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
// import {
//   SafeAreaView, StyleSheet, StatusBar, Platform, Modal, Image, Text, View,
//   TouchableOpacity, ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView,
//   TextInput, FlatList, Dimensions,
// } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import moment from 'moment';
// import * as ImagePicker from 'expo-image-picker';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import ImageViewing from 'react-native-image-viewing';
// import EmojiSelector from 'react-native-emoji-selector';
// import { AuthContext } from '../../context/AuthContext';
// import { useWebSocket } from '../../context/WebsocketContext';
// import { getMessages, markConversationRead, uploadImage } from '../../services/connection/chatApi';
// import COLORS from '../../constants/colors';
// import { LanguageContext } from '../../context/LanguageContext';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// export default function ChatConversation({ navigation, route }) {
//   const { conversation } = route.params;

//   const { currentUser, currentUserId } = useContext(AuthContext);
//   const { language } = useContext(LanguageContext); // 'en', 'es', 'fr', etc.

//   const { sendMessage, addMessageHandler, removeMessageHandler } = useWebSocket();

//   const [messages, setMessages] = useState([]);
//   const [flatData, setFlatData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState(false);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [text, setText] = useState('');
//   const [imageViewerVisible, setImageViewerVisible] = useState(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [imagesForViewing, setImagesForViewing] = useState([]);
//   const [keyboardHeight, setKeyboardHeight] = useState(0);
//   const [inputHeight, setInputHeight] = useState(44);
//   const [showCamera, setShowCamera] = useState(false);
//   const [cameraType, setCameraType] = useState('back');
//   const [isCameraReady, setIsCameraReady] = useState(false);
//   const [permission, requestPermission] = useCameraPermissions();
//   const [isSimulator, setIsSimulator] = useState(false);
//   const [currentHeader, setCurrentHeader] = useState('');

//   const flatListRef = useRef(null);
//   const textInputRef = useRef(null);
//   const cameraRef = useRef(null);
//   const fetchInProgressRef = useRef(false);
//   const oldestIdRef = useRef(null);
//   const isNearBottomRef = useRef(true);
//   const loadingOlderRef = useRef(false);
//   const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

//   const [hasMore, setHasMore] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);

//   // Keyboard listeners
//   useEffect(() => {
//     const show = Keyboard.addListener('keyboardWillShow', (e) => setKeyboardHeight(e.endCoordinates.height));
//     const hide = Keyboard.addListener('keyboardWillHide', () => setKeyboardHeight(0));
//     return () => { show.remove(); hide.remove(); };
//   }, []);

//   useEffect(() => {
//     if (Platform.OS === 'ios') {
//       const checkSimulator = async () => {
//         try { if (permission?.granted) setIsSimulator(false); } catch (error) { setIsSimulator(true); }
//       };
//       checkSimulator();
//     }
//   }, [permission]);

//   // Inside the component, after other useEffect hooks
// useEffect(() => {
//   const handleTranslationUpdate = (data) => {
//     if (data.type === 'translation_update') {
//       // Update the specific message in the state
//       setMessages(prevMessages => 
//         prevMessages.map(msg => 
//           msg.id === data.message_id 
//             ? { ...msg, translations: data.translations } 
//             : msg
//         )
//       );
//       // Also update flatData (the flattened array used for rendering)
//       setFlatData(prevFlat => 
//         prevFlat.map(item => 
//           item.type === 'message' && item.id === data.message_id
//             ? { ...item, translations: data.translations }
//             : item
//         )
//       );
//     }
//   };
//   addMessageHandler(handleTranslationUpdate);
//   return () => removeMessageHandler(handleTranslationUpdate);
// }, [addMessageHandler, removeMessageHandler]); 

//   const getDisplayDate = (date) => {
//     const msgDate = moment(date);
//     const today = moment().startOf('day');
//     const yesterday = moment().subtract(1, 'days').startOf('day');
//     if (msgDate.isSame(today, 'day')) return 'Today';
//     if (msgDate.isSame(yesterday, 'day')) return 'Yesterday';
//     if (msgDate.isSame(moment(), 'week')) return msgDate.format('dddd');
//     return msgDate.format('MMMM D, YYYY');
//   };

//   const flattenWithHeaders = (msgs) => {
//     if (!msgs.length) return [];
//     const sorted = [...msgs].sort((a, b) => a.createdAt - b.createdAt);
//     const grouped = {};
//     sorted.forEach(msg => {
//       const displayDate = getDisplayDate(msg.createdAt);
//       if (!grouped[displayDate]) grouped[displayDate] = [];
//       grouped[displayDate].push(msg);
//     });
//     const flat = [];
//     Object.keys(grouped).forEach(title => {
//       flat.push({ type: 'header', title });
//       flat.push(...grouped[title].map(msg => ({ type: 'message', ...msg })));
//     });
//     return flat;
//   };

//   const fetchMessages = async (loadMore = false) => {
//     if (fetchInProgressRef.current) return;
//     if (loadMore && (!hasMore || loadingMore)) return;

//     if (loadMore) loadingOlderRef.current = true;

//     fetchInProgressRef.current = true;
//     loadMore ? setLoadingMore(true) : setLoading(true);

//     try {
//       const params = { limit: 20 };
//       if (loadMore && oldestIdRef.current) {
//         params.last_id = oldestIdRef.current;
//       }
//       const data = await getMessages(conversation.id, currentUserId, params);

//       if (!data || !Array.isArray(data)) {
//         if (loadMore) setHasMore(false);
//         return;
//       }

//       const transformed = data.map(msg => ({
//         id: msg.id,
//         createdAt: new Date(msg.createdAt),
//         text: msg.text,
//         image: msg.image,
//         sender: msg.senderId,
//         isMe: msg.senderId === currentUserId,
//         translations: msg.translations || {},   // <-- ADD THIS LINE
//         user: {
//           _id: msg.senderId,
//           name: msg.senderId === currentUserId ? currentUser.name : conversation.otherUser.name,
//           avatar: msg.senderId === currentUserId ? currentUser.avatar : conversation.otherUser.avatar,
//         },
//       }));

//       // const transformed = data.map(msg => ({
//       //   id: msg.id,
//       //   createdAt: new Date(msg.createdAt),
//       //   text: msg.text,
//       //   image: msg.image,
//       //   sender: msg.senderId,
//       //   isMe: msg.senderId === currentUserId,
//       //   user: {
//       //     _id: msg.senderId,
//       //     name: msg.senderId === currentUserId ? currentUser.name : conversation.otherUser.name,
//       //     avatar: msg.senderId === currentUserId ? currentUser.avatar : conversation.otherUser.avatar,
//       //   },
//       // }));
//       transformed.sort((a, b) => a.createdAt - b.createdAt);

//       if (loadMore) {
//         const existingIds = new Set(messages.map(m => m.id));
//         const newMessages = transformed.filter(m => !existingIds.has(m.id));
//         if (newMessages.length === 0) {
//           setHasMore(false);
//         } else {
//           const newList = [...newMessages, ...messages];
//           setMessages(newList);
//           setFlatData(flattenWithHeaders(newList));
//           oldestIdRef.current = newMessages[0].id;
//           if (newMessages.length < 20) setHasMore(false);
//         }
//       } else {
//         setMessages(transformed);
//         setFlatData(flattenWithHeaders(transformed));
//         if (transformed.length > 0) oldestIdRef.current = transformed[0].id;
//         setHasMore(transformed.length === 20);
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert('Error', 'Could not load messages');
//     } finally {
//       if (loadMore) {
//         setLoadingMore(false);
//         setTimeout(() => { loadingOlderRef.current = false; }, 500);
//       } else {
//         setLoading(false);
//       }
//       fetchInProgressRef.current = false;
//     }
//   };

//   useEffect(() => {
//     markConversationRead(conversation.id, currentUserId).catch(console.error);
//     fetchMessages();
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       fetchMessages();
//     }, [])
//   );

//   const containsContactInfo = (text) => {
//     const patterns = [
//       /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, // email
//       /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/, // phone
//       /@[A-Za-z0-9_]+/, // social handle
//       /\b\d{1,5}\s\w+\s(street|st|avenue|ave|road|rd|lane|ln|drive|dr|court|ct|boulevard|blvd)\b/i // address
//     ];
//     return patterns.some(pattern => pattern.test(text));
//   };



//   useEffect(() => {
//     const handleIncoming = (data) => {
//       // Ignore translation update events (they are handled separately)
//       if (data.type === 'translation_update') return;
//       if (data.conversation_id === conversation.id) {
//         fetchMessages();
//       }
//     };
//     addMessageHandler(handleIncoming);
//     return () => removeMessageHandler(handleIncoming);
//   }, [addMessageHandler, removeMessageHandler, conversation.id]);

//   // Scroll to bottom only when near bottom and not loading older messages
//   useEffect(() => {
//     if (!loading && flatData.length > 0 && flatListRef.current && !loadingMore && !loadingOlderRef.current && isNearBottomRef.current) {
//       setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
//     }
//   }, [flatData, loading, loadingMore]);

//   const onScroll = (e) => {
//     const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
//     const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
//     isNearBottomRef.current = distanceFromBottom < 100;
//   };

//   useEffect(() => {
//     const handleError = (data) => {
//       if (data.type === 'error') {
//         Alert.alert("Error", data.message);
//       }
//     };
//     addMessageHandler(handleError);
//     return () => removeMessageHandler(handleError);
//   }, [addMessageHandler, removeMessageHandler]);
  
//   const onViewableItemsChanged = useCallback(({ viewableItems }) => {
//     if (viewableItems && viewableItems.length > 0) {
//       const topItem = viewableItems[0];
//       if (topItem.item && topItem.item.type === 'header') {
//         setCurrentHeader(topItem.item.title);
//       } else {
//         // Find the nearest header above this message
//         const index = topItem.index;
//         for (let i = index; i >= 0; i--) {
//           if (flatData[i] && flatData[i].type === 'header') {
//             setCurrentHeader(flatData[i].title);
//             break;
//           }
//         }
//       }
//     }
//   }, [flatData]);

//   const uploadAndSendImage = async (uri) => {
//     setUploading(true);
//     try {
//       const imageUrl = await uploadImage(uri);
//       sendMessage(conversation.otherUser.id, '', conversation.id, imageUrl);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to upload image');
//     } finally {
//       setUploading(false);
//     }
//   };

//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsMultipleSelection: true,
//       quality: 0.8,
//     });
//     if (!result.canceled && result.assets) {
//       for (const asset of result.assets) await uploadAndSendImage(asset.uri);
//     }
//   };

//   const openCamera = () => setShowCamera(true);
//   const closeCamera = () => setShowCamera(false);
//   const toggleCameraType = () => setCameraType(prev => prev === 'back' ? 'front' : 'back');
//   const onCameraReady = () => setIsCameraReady(true);

//   const takePhoto = async () => {
//     if (isSimulator || !permission?.granted) {
//       await pickImageFromLibrary();
//       return;
//     }
//     if (cameraRef.current && isCameraReady) {
//       try {
//         const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, skipProcessing: true });
//         if (photo.uri) {
//           closeCamera();
//           await uploadAndSendImage(photo.uri);
//         }
//       } catch (error) {
//         Alert.alert('Error', 'Failed to take photo');
//       }
//     } else {
//       await pickImageFromLibrary();
//     }
//   };

//   const pickImageFromLibrary = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.8,
//     });
//     if (!result.canceled && result.assets) await uploadAndSendImage(result.assets[0].uri);
//   };


//   const handleSend = () => {
//     const trimmed = text.trim();
//     if (!trimmed) return;
//     if (containsContactInfo(trimmed)) {
//       Alert.alert("Warning", "Contact information (email, phone, address, social media) is not allowed.");
//       return;
//     }
//     sendMessage(conversation.otherUser.id, trimmed, conversation.id);
//     setText('');
//   };

//   const toggleEmojiPicker = () => {
//     setShowEmojiPicker(!showEmojiPicker);
//     if (!showEmojiPicker) Keyboard.dismiss();
//   };
//   const onEmojiSelected = (emoji) => setText(prev => prev + emoji);

//   const openImageViewer = (imageUrl, allImages = []) => {
//     let images = allImages.length ? allImages : [{ uri: imageUrl }];
//     let initialIndex = allImages.findIndex(img => img.uri === imageUrl);
//     setImagesForViewing(images);
//     setCurrentImageIndex(initialIndex >= 0 ? initialIndex : 0);
//     setImageViewerVisible(true);
//   };
//   const closeImageViewer = () => setImageViewerVisible(false);
//   const getAllImages = () => messages.filter(m => m.image).map(m => ({ uri: m.image }));

//   const shouldShowAvatar = (current, prevMessage, nextMessage) => {
//     if (current.isMe) return false;
//     if (!prevMessage || prevMessage.isMe) return true;
//     if (moment(current.createdAt).diff(moment(prevMessage.createdAt), 'minutes') > 5) return true;
//     if (!nextMessage || nextMessage.isMe) return true;
//     return false;
//   };

//   // const renderItem = ({ item, index }) => {
//   //   if (item.type === 'header') return null; // we use floating header instead
//   //   const msg = item;
//   //   const prevItem = index > 0 && flatData[index - 1].type === 'message' ? flatData[index - 1] : null;
//   //   const nextItem = index < flatData.length - 1 && flatData[index + 1].type === 'message' ? flatData[index + 1] : null;
//   //   const showAvatar = shouldShowAvatar(msg, prevItem, nextItem);

//   //   return (
//   //     <View style={[styles.messageRow, msg.isMe ? styles.messageRowRight : styles.messageRowLeft]}>
//   //       {!msg.isMe && (showAvatar ? (
//   //         <Image source={{ uri: conversation.otherUser.avatar || 'https://via.placeholder.com/40' }} style={styles.avatar} />
//   //       ) : <View style={styles.avatarSpacer} />)}

//   //       <View style={[styles.messageContainer, msg.isMe ? styles.myMessageContainer : styles.otherMessageContainer, !showAvatar && styles.messageWithoutAvatar]}>
//   //         {msg.image ? (
//   //           <TouchableOpacity onPress={() => openImageViewer(msg.image, getAllImages())} activeOpacity={0.7}>
//   //             <Image source={{ uri: msg.image }} style={styles.messageImage} resizeMode="cover" />
//   //             <View style={styles.imageOverlay}><Ionicons name="expand" size={16} color="white" /></View>
//   //           </TouchableOpacity>
//   //         ) : (
//   //           <View style={[styles.messageBubble, msg.isMe ? styles.myMessageBubble : styles.otherMessageBubble]}>
//   //             <Text style={[styles.messageText, msg.isMe ? styles.myMessageText : styles.otherMessageText]}>{msg.text}</Text>
//   //           </View>
//   //         )}
//   //         <View style={[styles.messageFooter, msg.isMe ? styles.myMessageFooter : styles.otherMessageFooter]}>
//   //           <Text style={[styles.messageTime, msg.isMe ? styles.myMessageTime : styles.otherMessageTime]}>{moment(msg.createdAt).format('h:mm A')}</Text>
//   //           {msg.isMe && <MaterialIcons name="done-all" size={14} color="#4CAF50" style={styles.deliveryIcon} />}
//   //         </View>
//   //       </View>

//   //       {msg.isMe && (showAvatar ? (
//   //         <Image source={{ uri: currentUser.avatar || 'https://via.placeholder.com/40' }} style={[styles.avatar, styles.myAvatar]} />
//   //       ) : <View style={styles.avatarSpacer} />)}
//   //     </View>
//   //   );
//   // };

//   const renderItem = ({ item, index }) => {
//     if (item.type === 'header') return null;
//     const msg = item;
//     const prevItem = index > 0 && flatData[index - 1].type === 'message' ? flatData[index - 1] : null;
//     const nextItem = index < flatData.length - 1 && flatData[index + 1].type === 'message' ? flatData[index + 1] : null;
//     const showAvatar = shouldShowAvatar(msg, prevItem, nextItem);
  
//     // Determine display text for incoming messages (translated if available)
//     let displayText = msg.text;
//     let isTranslated = false;
//     if (!msg.isMe && msg.translations && msg.translations[language]) {
//       displayText = msg.translations[language];
//       isTranslated = true;
//     }
  
//     return (
//       <View style={[styles.messageRow, msg.isMe ? styles.messageRowRight : styles.messageRowLeft]}>
//         {!msg.isMe && (showAvatar ? (
//           <Image source={{ uri: conversation.otherUser.avatar || 'https://via.placeholder.com/40' }} style={styles.avatar} />
//         ) : <View style={styles.avatarSpacer} />)}
  
//         <View style={[styles.messageContainer, msg.isMe ? styles.myMessageContainer : styles.otherMessageContainer, !showAvatar && styles.messageWithoutAvatar]}>
//           {msg.image ? (
//             <TouchableOpacity onPress={() => openImageViewer(msg.image, getAllImages())} activeOpacity={0.7}>
//               <Image source={{ uri: msg.image }} style={styles.messageImage} resizeMode="cover" />
//               <View style={styles.imageOverlay}><Ionicons name="expand" size={16} color="white" /></View>
//             </TouchableOpacity>
//           ) : (
//             <View style={[styles.messageBubble, msg.isMe ? styles.myMessageBubble : styles.otherMessageBubble]}>
//               <Text style={[styles.messageText, msg.isMe ? styles.myMessageText : styles.otherMessageText]}>
//                 {displayText}
//               </Text>
//               {isTranslated && (
//                 <Text style={styles.translatedHint}>📝 Translated from {msg.text}</Text>
//               )}
//             </View>
//           )}
//           <View style={[styles.messageFooter, msg.isMe ? styles.myMessageFooter : styles.otherMessageFooter]}>
//             <Text style={[styles.messageTime, msg.isMe ? styles.myMessageTime : styles.otherMessageTime]}>{moment(msg.createdAt).format('h:mm A')}</Text>
//             {msg.isMe && <MaterialIcons name="done-all" size={14} color="#4CAF50" style={styles.deliveryIcon} />}
//           </View>
//         </View>
  
//         {msg.isMe && (showAvatar ? (
//           <Image source={{ uri: currentUser.avatar || 'https://via.placeholder.com/40' }} style={[styles.avatar, styles.myAvatar]} />
//         ) : <View style={styles.avatarSpacer} />)}
//       </View>
//     );
//   };

//   const renderMessageOptions = () => {
//     Alert.alert('Send Media', 'Choose an option', [
//       { text: 'Choose from Library', onPress: pickImage },
//       { text: 'Take Photo', onPress: openCamera },
//       { text: 'Cancel', style: 'cancel' },
//     ]);
//   };

//   const renderCameraModal = () => {
//     if (isSimulator) {
//       return (
//         <View style={styles.cameraContainer}>
//           <View style={styles.cameraHeader}>
//             <TouchableOpacity style={styles.cameraCloseButton} onPress={closeCamera}>
//               <Ionicons name="close" size={30} color="white" />
//             </TouchableOpacity>
//           </View>
//           <View style={styles.simulatorContainer}>
//             <Ionicons name="camera-off" size={64} color="white" />
//             <Text style={styles.simulatorText}>Camera not available in simulator</Text>
//             <TouchableOpacity style={styles.libraryButton} onPress={pickImageFromLibrary}>
//               <Ionicons name="images" size={24} color="white" />
//               <Text style={styles.libraryButtonText}>Pick from Library</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       );
//     }
//     if (!permission) {
//       return (
//         <View style={styles.cameraContainer}>
//           <View style={styles.permissionContainer}>
//             <ActivityIndicator size="large" color="white" />
//             <Text style={styles.permissionText}>Requesting camera permission...</Text>
//           </View>
//         </View>
//       );
//     }
//     if (!permission.granted) {
//       return (
//         <View style={styles.cameraContainer}>
//           <View style={styles.cameraHeader}>
//             <TouchableOpacity style={styles.cameraCloseButton} onPress={closeCamera}>
//               <Ionicons name="close" size={30} color="white" />
//             </TouchableOpacity>
//           </View>
//           <View style={styles.permissionContainer}>
//             <Ionicons name="camera-off" size={48} color="white" />
//             <Text style={styles.permissionText}>No access to camera</Text>
//             <TouchableOpacity style={styles.permissionButton} onPress={() => requestPermission()}>
//               <Text style={styles.permissionButtonText}>Grant Permission</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       );
//     }
//     return (
//       <View style={styles.cameraContainer}>
//         <CameraView style={styles.camera} facing={cameraType} ref={cameraRef} onCameraReady={onCameraReady}>
//           <View style={styles.cameraHeader}>
//             <TouchableOpacity style={styles.cameraCloseButton} onPress={closeCamera}>
//               <Ionicons name="close" size={30} color="white" />
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
//               <Ionicons name="camera-reverse" size={24} color="white" />
//             </TouchableOpacity>
//           </View>
//           <View style={styles.cameraControls}>
//             <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
//               <View style={styles.captureButtonOuter}>
//                 <View style={styles.captureButtonInner} />
//               </View>
//             </TouchableOpacity>
//           </View>
//         </CameraView>
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       </View>
//     );
//   }

//   return (
//     <>
//       <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
//       <SafeAreaView style={styles.safeArea}>
//         <KeyboardAvoidingView
//           style={styles.container}
//           behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//           keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
//         >
//           {/* Floating header chip */}
//           {currentHeader !== '' && flatData.length > 0 && (
//             <View style={styles.floatingHeader}>
//               <View style={styles.dateChip}>
//                 <Text style={styles.dateChipText}>{currentHeader}</Text>
//               </View>
//             </View>
//           )}

//           <FlatList
//             ref={flatListRef}
//             data={flatData}
//             renderItem={renderItem}
//             keyExtractor={(item, index) => item.type === 'header' ? `header-${item.title}` : item.id}
//             contentContainerStyle={[
//               styles.messagesList,
//               { paddingBottom: keyboardHeight > 0 ? keyboardHeight + inputHeight : inputHeight + 20 }
//             ]}
//             showsVerticalScrollIndicator={false}
//             keyboardShouldPersistTaps="handled"
//             onScroll={onScroll}
//             onViewableItemsChanged={onViewableItemsChanged}
//             viewabilityConfig={viewabilityConfig}
//             ListHeaderComponent={
//               loadingMore ? (
//                 <View style={styles.loadingMoreContainer}>
//                   <ActivityIndicator size="small" color={COLORS.primary} />
//                   <Text style={styles.loadingMoreText}>Loading older messages...</Text>
//                 </View>
//               ) : hasMore ? (
//                 <TouchableOpacity
//                   onPress={() => fetchMessages(true)}
//                   style={styles.loadMoreButton}
//                   disabled={loadingMore}
//                 >
//                   <Text style={styles.loadMoreText}>Load Older Messages</Text>
//                 </TouchableOpacity>
//               ) : null
//             }
//           />

//           <View style={[styles.inputToolbar, { bottom: keyboardHeight }]}>
//             <TouchableOpacity style={styles.actionButton} onPress={toggleEmojiPicker}>
//               <Ionicons name={showEmojiPicker ? 'close' : 'happy'} size={26} color={showEmojiPicker ? COLORS.error : COLORS.primary} />
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionButton} onPress={renderMessageOptions}>
//               <Ionicons name="camera" size={26} color={COLORS.primary} />
//             </TouchableOpacity>
//             <View style={styles.inputContainer}>
//               <TextInput
//                 ref={textInputRef}
//                 style={[styles.textInput, { height: Math.max(44, Math.min(100, inputHeight)) }]}
//                 value={text}
//                 onChangeText={setText}
//                 placeholder="Type a message..."
//                 placeholderTextColor="#999"
//                 multiline
//                 maxLength={1000}
//                 onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
//               />
//             </View>
//             <TouchableOpacity
//               style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
//               onPress={handleSend}
//               disabled={!text.trim()}
//             >
//               <Ionicons name="send" size={24} color={text.trim() ? COLORS.primary : '#ccc'} />
//             </TouchableOpacity>
//           </View>
//           {showEmojiPicker && (
//             <View style={[styles.emojiPickerContainer, { bottom: keyboardHeight > 0 ? keyboardHeight + 50 : 50 }]}>
//               <EmojiSelector
//                 onEmojiSelected={onEmojiSelected}
//                 columns={8}
//                 showSearchBar
//                 showHistory
//                 showSectionTitles
//                 style={styles.emojiSelector}
//               />
//             </View>
//           )}
//         </KeyboardAvoidingView>

//         <Modal animationType="slide" transparent={false} visible={showCamera} onRequestClose={closeCamera}>
//           {renderCameraModal()}
//         </Modal>

//         <ImageViewing
//           images={imagesForViewing}
//           imageIndex={currentImageIndex}
//           visible={imageViewerVisible}
//           onRequestClose={closeImageViewer}
//           backgroundColor="rgba(0, 0, 0, 0.95)"
//           swipeToCloseEnabled
//           doubleTapToZoomEnabled
//           HeaderComponent={({ imageIndex }) => (
//             <View style={styles.imageViewerHeader}>
//               <Text style={styles.imageViewerText}>{imageIndex + 1} / {imagesForViewing.length}</Text>
//               <TouchableOpacity onPress={closeImageViewer} style={styles.closeButton}>
//                 <Ionicons name="close" size={28} color="white" />
//               </TouchableOpacity>
//             </View>
//           )}
//         />
//         {uploading && (
//           <View style={styles.uploadingContainer}>
//             <ActivityIndicator size="large" color={COLORS.primary} />
//             <Text style={styles.uploadingText}>Uploading image...</Text>
//           </View>
//         )}
//       </SafeAreaView>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: COLORS.primary },
//   container: { flex: 1, backgroundColor: '#f0f0f0' },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
//   messagesList: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8 },
  
//   floatingHeader: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     zIndex: 10,
//     alignItems: 'center',
//     paddingTop: 12,
//     pointerEvents: 'none',
//   },
//   dateChip: {
//     backgroundColor: 'rgba(0, 0, 0, 0.8)',
//     paddingHorizontal: 16,
//     paddingVertical: 6,
//     borderRadius: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   dateChipText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#FFFFFF',
//     letterSpacing: 0.3,
//   },
  
//   messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4 },
//   messageRowLeft: { justifyContent: 'flex-start' },
//   messageRowRight: { justifyContent: 'flex-end' },
//   avatar: { width: 32, height: 32, borderRadius: 16, marginHorizontal: 8, marginBottom: 4 },
//   myAvatar: { marginLeft: 8, marginRight: 0 },
//   avatarSpacer: { width: 32, marginHorizontal: 8 },
//   messageContainer: { maxWidth: '87%', marginBottom: 4 },
//   myMessageContainer: { alignItems: 'flex-end' },
//   otherMessageContainer: { alignItems: 'flex-start' },
//   messageWithoutAvatar: { marginLeft: 48 },
//   messageBubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, maxWidth: '100%' },
//   myMessageBubble: { backgroundColor: '#DCF8C6', borderBottomRightRadius: 4 },
//   otherMessageBubble: { backgroundColor: 'white', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
//   messageText: { fontSize: 16, lineHeight: 22 },
//   myMessageText: { color: '#000' },
//   otherMessageText: { color: '#000' },
//   messageFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 4, paddingHorizontal: 8 },
//   myMessageFooter: { justifyContent: 'flex-end' },
//   otherMessageFooter: { justifyContent: 'flex-start' },
//   messageTime: { fontSize: 11, color: '#666' },
//   myMessageTime: { color: '#666' },
//   otherMessageTime: { color: '#666' },
//   deliveryIcon: { marginLeft: 2 },
  
//   messageImage: { width: 200, height: 150, borderRadius: 12, overflow: 'hidden' },
//   imageOverlay: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  
//   inputToolbar: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e0e0e0', paddingHorizontal: 12, paddingVertical: 10, position: 'absolute', left: 0, right: 0, minHeight: 60 },
//   inputContainer: { flex: 1, marginHorizontal: 8 },
//   textInput: { backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, maxHeight: 100, minHeight: 40 },
//   actionButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
//   sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
//   sendButtonDisabled: { opacity: 0.5 },
  
//   emojiPickerContainer: { position: 'absolute', left: 0, right: 0, height: 250, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
//   emojiSelector: { flex: 1 },
  
//   cameraContainer: { flex: 1, backgroundColor: 'black' },
//   camera: { flex: 1 },
//   cameraHeader: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 30, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
//   cameraCloseButton: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 8 },
//   flipButton: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 8 },
//   cameraControls: { position: 'absolute', bottom: 40, alignSelf: 'center' },
//   captureButton: { alignItems: 'center', justifyContent: 'center' },
//   captureButtonOuter: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'white' },
//   captureButtonInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'white' },
  
//   simulatorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', paddingHorizontal: 20 },
//   simulatorText: { color: 'white', fontSize: 18, fontWeight: '600', marginTop: 20, textAlign: 'center' },
//   libraryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, marginTop: 20 },
//   libraryButtonText: { color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 10 },
//   permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
//   permissionText: { color: 'white', fontSize: 16, marginTop: 16, textAlign: 'center', paddingHorizontal: 20 },
//   permissionButton: { marginTop: 20, backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
//   permissionButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  
//   uploadingContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
//   uploadingText: { color: 'white', marginTop: 10, fontSize: 16 },
  
//   imageViewerHeader: { position: 'absolute', top: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, zIndex: 1 },
//   imageViewerText: { color: 'white', fontSize: 16, fontWeight: '600' },
//   closeButton: { padding: 5 },
  
//   loadingMoreContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 10,
//   },
//   loadingMoreText: {
//     marginLeft: 8,
//     fontSize: 12,
//     color: '#666',
//   },
//   loadMoreButton: {
//     backgroundColor: '#007AFF',
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     alignSelf: 'center',
//     marginVertical: 10,
//   },
//   loadMoreText: {
//     color: 'white',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   translatedHint: {
//     fontSize: 10,
//     color: '#888',
//     marginTop: 4,
//     fontStyle: 'italic',
//   },
// });


// import React, { useEffect, useState, useContext, useRef } from 'react';
// import {
//   SafeAreaView, FlatList, Text, View, TextInput, TouchableOpacity,
//   ActivityIndicator, Alert, StyleSheet, KeyboardAvoidingView, Platform
// } from 'react-native';
// import { AuthContext } from '../../context/AuthContext';
// import { useWebSocket } from '../../context/WebsocketContext';
// import { getMessages, markConversationRead } from '../../services/connection/chatApi';
// import moment from 'moment';

// export default function ChatMinimal({ route }) {
//   const { conversation } = route.params;
//   const { currentUserId } = useContext(AuthContext);
//   const { sendMessage, addMessageHandler, removeMessageHandler } = useWebSocket();

//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [inputText, setInputText] = useState('');
//   const flatListRef = useRef(null);

//   const fetchMessages = async () => {
//     try {
//       const data = await getMessages(conversation.id, currentUserId, { limit: 50 });
//       if (data && Array.isArray(data)) {
//         const formatted = data.map(msg => ({
//           id: msg.id,
//           text: msg.text,
//           createdAt: new Date(msg.createdAt),
//           isMe: msg.senderId === currentUserId,
//         }));
//         formatted.sort((a, b) => a.createdAt - b.createdAt);
//         setMessages(formatted);
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert('Error', 'Failed to load messages');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     markConversationRead(conversation.id, currentUserId).catch(console.error);
//     fetchMessages();
//   }, []);

//   useEffect(() => {
//     const handleIncoming = (data) => {
//       if (data.conversation_id === conversation.id && data.text) {
//         console.log('Received message:', data);
//         const newMsg = {
//           id: data._id,
//           text: data.text,
//           createdAt: new Date(data.createdAt),
//           isMe: data.senderId === currentUserId,
//         };
//         setMessages(prev => [...prev, newMsg]);
//         // Scroll to bottom after adding
//         setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
//       }
//     };
//     addMessageHandler(handleIncoming);
//     return () => removeMessageHandler(handleIncoming);
//   }, [conversation.id, currentUserId]);

//   const handleSend = () => {
//     if (!inputText.trim()) return;
//     sendMessage(conversation.otherUser.id, inputText, conversation.id);
//     setInputText('');
//   };

//   const renderItem = ({ item }) => (
//     <View style={[styles.msg, item.isMe ? styles.myMsg : styles.otherMsg]}>
//       <Text>{item.text}</Text>
//       <Text style={styles.time}>{moment(item.createdAt).format('h:mm:ss A')}</Text>
//     </View>
//   );

//   if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
//         <FlatList
//           ref={flatListRef}
//           data={messages}
//           renderItem={renderItem}
//           keyExtractor={item => item.id}
//           contentContainerStyle={{ padding: 12 }}
//         />
//         <View style={styles.inputBar}>
//           <TextInput
//             style={styles.input}
//             value={inputText}
//             onChangeText={setInputText}
//             placeholder="Type a message..."
//             multiline
//           />
//           <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
//             <Text style={styles.sendText}>Send</Text>
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   msg: { padding: 8, marginBottom: 8, borderRadius: 8, maxWidth: '80%' },
//   myMsg: { backgroundColor: '#DCF8C6', alignSelf: 'flex-end' },
//   otherMsg: { backgroundColor: 'white', alignSelf: 'flex-start' },
//   time: { fontSize: 10, color: '#666', marginTop: 4 },
//   inputBar: { flexDirection: 'row', padding: 8, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#ddd' },
//   input: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, maxHeight: 100 },
//   sendButton: { marginLeft: 8, backgroundColor: '#007AFF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
//   sendText: { color: 'white', fontWeight: 'bold' },
// });





// Everything works but after refesh show server time.
// import React, { useEffect, useState, useContext, useRef } from 'react';
// import {
//   SafeAreaView, FlatList, Text, View, TextInput, TouchableOpacity,
//   ActivityIndicator, Alert, StyleSheet, KeyboardAvoidingView, Platform
// } from 'react-native';
// import { AuthContext } from '../../context/AuthContext';
// import { useWebSocket } from '../../context/WebsocketContext';
// import { getMessages, markConversationRead } from '../../services/connection/chatApi';
// import moment from 'moment';

// export default function ChatMinimal({ route }) {
//   const { conversation } = route.params;
//   const { currentUserId } = useContext(AuthContext);
//   const { sendMessage, addMessageHandler, removeMessageHandler } = useWebSocket();

//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [inputText, setInputText] = useState('');
//   const flatListRef = useRef(null);

//   const fetchMessages = async () => {
//     try {
//       const data = await getMessages(conversation.id, currentUserId, { limit: 50 });
//       if (data && Array.isArray(data)) {
//         const formatted = data.map(msg => ({
//           id: msg.id,
//           text: msg.text,
//           createdAt: new Date(msg.createdAt),
//           isMe: msg.senderId === currentUserId,
//         }));
//         formatted.sort((a, b) => a.createdAt - b.createdAt);
//         setMessages(formatted);
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert('Error', 'Failed to load messages');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     markConversationRead(conversation.id, currentUserId).catch(console.error);
//     fetchMessages();
//   }, []);

//   useEffect(() => {
//     const handleIncoming = (data) => {
//       if (data.conversation_id === conversation.id && data.text) {
//         const newMsg = {
//           id: data._id,
//           text: data.text,
//           createdAt: new Date(data.createdAt),
//           isMe: data.senderId === currentUserId,
//         };
//         setMessages(prev => {
//           // ✅ Prevent duplicate messages
//           if (prev.some(msg => msg.id === newMsg.id)) return prev;
//           // ✅ Append to end – newest message stays at bottom
//           return [...prev, newMsg];
//         });
//         // Scroll to bottom after adding
//         setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
//       }
//     };
//     addMessageHandler(handleIncoming);
//     return () => removeMessageHandler(handleIncoming);
//   }, [conversation.id, currentUserId]);

//   const handleSend = () => {
//     if (!inputText.trim()) return;
//     sendMessage(conversation.otherUser.id, inputText, conversation.id);
//     setInputText('');
//   };

//   const renderItem = ({ item }) => (
//     <View style={[styles.msg, item.isMe ? styles.myMsg : styles.otherMsg]}>
//       <Text>{item.text}</Text>
//       <Text style={styles.time}>{moment(item.createdAt).format('h:mm:ss A')}</Text>
//     </View>
//   );

//   if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
//         <FlatList
//           ref={flatListRef}
//           data={messages}
//           renderItem={renderItem}
//           keyExtractor={item => item.id}
//           contentContainerStyle={{ padding: 12 }}
//         />
//         <View style={styles.inputBar}>
//           <TextInput
//             style={styles.input}
//             value={inputText}
//             onChangeText={setInputText}
//             placeholder="Type a message..."
//             multiline
//           />
//           <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
//             <Text style={styles.sendText}>Send</Text>
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   msg: { padding: 8, marginBottom: 8, borderRadius: 8, maxWidth: '80%' },
//   myMsg: { backgroundColor: '#DCF8C6', alignSelf: 'flex-end' },
//   otherMsg: { backgroundColor: 'white', alignSelf: 'flex-start' },
//   time: { fontSize: 10, color: '#666', marginTop: 4 },
//   inputBar: { flexDirection: 'row', padding: 8, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#ddd' },
//   input: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, maxHeight: 100 },
//   sendButton: { marginLeft: 8, backgroundColor: '#007AFF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
//   sendText: { color: 'white', fontWeight: 'bold' },
// });



// import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
// import {
//   SafeAreaView, FlatList, Text, View, TextInput, TouchableOpacity,
//   ActivityIndicator, Alert, StyleSheet, KeyboardAvoidingView, Platform
// } from 'react-native';
// import { AuthContext } from '../../context/AuthContext';
// import { useWebSocket } from '../../context/WebsocketContext';
// import { getMessages, markConversationRead } from '../../services/connection/chatApi';
// import moment from 'moment';

// export default function ChatMinimal({ route }) {
//   const { conversation } = route.params;
//   const { currentUserId } = useContext(AuthContext);
//   const { sendMessage, addMessageHandler, removeMessageHandler } = useWebSocket();

//   const [messages, setMessages] = useState([]);
//   const [flatData, setFlatData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [inputText, setInputText] = useState('');
//   const flatListRef = useRef(null);

//   // Pagination
//   const [hasMore, setHasMore] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const oldestIdRef = useRef(null);
//   const fetchingRef = useRef(false);

//   // Floating header
//   const [currentHeader, setCurrentHeader] = useState('');
//   const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

//   // Duplicate prevention cache (message IDs received recently)
//   const recentMessageIds = useRef(new Set());

//   const getDisplayDate = (date) => {
//     const msgDate = moment(date);
//     const today = moment().startOf('day');
//     const yesterday = moment().subtract(1, 'days').startOf('day');
//     if (msgDate.isSame(today, 'day')) return 'Today';
//     if (msgDate.isSame(yesterday, 'day')) return 'Yesterday';
//     if (msgDate.isSame(moment(), 'week')) return msgDate.format('dddd');
//     return msgDate.format('MMMM D, YYYY');
//   };

//   const flattenWithHeaders = (msgs) => {
//     if (!msgs.length) return [];
//     const sorted = [...msgs].sort((a, b) => a.createdAt - b.createdAt);
//     const grouped = {};
//     sorted.forEach(msg => {
//       const displayDate = getDisplayDate(msg.createdAt);
//       if (!grouped[displayDate]) grouped[displayDate] = [];
//       grouped[displayDate].push(msg);
//     });
//     const flat = [];
//     Object.keys(grouped).forEach(title => {
//       flat.push({ type: 'header', title });
//       flat.push(...grouped[title].map(msg => ({ type: 'message', ...msg })));
//     });
//     return flat;
//   };

//   const appendMessageToFlatData = (currentFlat, newMsg) => {
//     const newDate = getDisplayDate(newMsg.createdAt);
//     let headerIndex = currentFlat.findIndex(item => item.type === 'header' && item.title === newDate);
//     if (headerIndex === -1) {
//       return [...currentFlat, { type: 'header', title: newDate }, { type: 'message', ...newMsg }];
//     } else {
//       let lastIndex = headerIndex + 1;
//       while (lastIndex < currentFlat.length && currentFlat[lastIndex].type !== 'header') {
//         lastIndex++;
//       }
//       const newFlat = [...currentFlat];
//       newFlat.splice(lastIndex, 0, { type: 'message', ...newMsg });
//       return newFlat;
//     }
//   };

//   const fetchMessages = async (loadMore = false) => {
//     if (fetchingRef.current) return;
//     if (loadMore && (!hasMore || loadingMore)) return;

//     fetchingRef.current = true;
//     if (loadMore) setLoadingMore(true);
//     else setLoading(true);

//     try {
//       const params = { limit: 20 };
//       if (loadMore && oldestIdRef.current) params.last_id = oldestIdRef.current;
//       const data = await getMessages(conversation.id, currentUserId, params);
//       if (!data || !Array.isArray(data)) {
//         if (loadMore) setHasMore(false);
//         return;
//       }
//       const formatted = data.map(msg => ({
//         id: msg.id,
//         text: msg.text,
//         createdAt: new Date(msg.createdAt),
//         isMe: msg.senderId === currentUserId,
//       }));
//       formatted.sort((a, b) => a.createdAt - b.createdAt);

//       if (loadMore) {
//         const existingIds = new Set(messages.map(m => m.id));
//         const newMessages = formatted.filter(m => !existingIds.has(m.id));
//         if (newMessages.length === 0) {
//           setHasMore(false);
//         } else {
//           const newList = [...newMessages, ...messages];
//           setMessages(newList);
//           setFlatData(flattenWithHeaders(newList));
//           oldestIdRef.current = newMessages[0].id;
//           if (newMessages.length < 20) setHasMore(false);
//         }
//       } else {
//         setMessages(formatted);
//         setFlatData(flattenWithHeaders(formatted));
//         if (formatted.length > 0) oldestIdRef.current = formatted[0].id;
//         setHasMore(formatted.length === 20);
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert('Error', 'Could not load messages');
//     } finally {
//       if (loadMore) setLoadingMore(false);
//       else setLoading(false);
//       fetchingRef.current = false;
//     }
//   };

//   useEffect(() => {
//     markConversationRead(conversation.id, currentUserId).catch(console.error);
//     fetchMessages();
//   }, []);

//   // WebSocket incoming – append new message to bottom with duplicate prevention
//   useEffect(() => {
//     const handleIncoming = (data) => {
//       if (data.conversation_id === conversation.id && data.text) {
//         // Ignore if we've seen this message ID recently
//         if (recentMessageIds.current.has(data._id)) return;
//         recentMessageIds.current.add(data._id);
//         setTimeout(() => recentMessageIds.current.delete(data._id), 2000);

//         const newMsg = {
//           id: data._id,
//           text: data.text,
//           createdAt: new Date(data.createdAt),
//           isMe: data.senderId === currentUserId,
//         };
//         setMessages(prev => {
//           if (prev.some(msg => msg.id === newMsg.id)) return prev;
//           return [...prev, newMsg];
//         });
//         setFlatData(prevFlat => {
//           if (prevFlat.some(item => item.type === 'message' && item.id === newMsg.id)) return prevFlat;
//           return appendMessageToFlatData(prevFlat, newMsg);
//         });
//         setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
//       }
//     };
//     addMessageHandler(handleIncoming);
//     return () => removeMessageHandler(handleIncoming);
//   }, [conversation.id, currentUserId]);

//   const handleSend = () => {
//     if (!inputText.trim()) return;
//     sendMessage(conversation.otherUser.id, inputText, conversation.id);
//     setInputText('');
//   };

//   const onViewableItemsChanged = useCallback(({ viewableItems }) => {
//     if (viewableItems && viewableItems.length > 0) {
//       const topItem = viewableItems[0];
//       if (topItem.item && topItem.item.type === 'header') {
//         setCurrentHeader(topItem.item.title);
//       } else {
//         const index = topItem.index;
//         for (let i = index; i >= 0; i--) {
//           if (flatData[i] && flatData[i].type === 'header') {
//             setCurrentHeader(flatData[i].title);
//             break;
//           }
//         }
//       }
//     }
//   }, [flatData]);

//   const renderItem = ({ item }) => {
//     if (item.type === 'header') {
//       return (
//         <View style={styles.headerContainer}>
//           <View style={styles.headerLine} />
//           <Text style={styles.headerText}>{item.title}</Text>
//           <View style={styles.headerLine} />
//         </View>
//       );
//     }
//     // Log only for message items
//     console.log('Server UTC:', item.createdAt.toISOString(), 'Local:', moment.utc(item.createdAt).local().format('h:mm:ss A'));
//     return (
//       <View style={[styles.msg, item.isMe ? styles.myMsg : styles.otherMsg]}>
//         <Text>{item.text}</Text>
//         <Text style={styles.time}>
//           {moment.utc(item.createdAt).local().format('h:mm:ss A')}
//         </Text>
//       </View>
//     );
//   };

//   if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
//         {currentHeader !== '' && flatData.length > 0 && (
//           <View style={styles.floatingHeader}>
//             <View style={styles.dateChip}>
//               <Text style={styles.dateChipText}>{currentHeader}</Text>
//             </View>
//           </View>
//         )}
//         <FlatList
//           ref={flatListRef}
//           data={flatData}
//           renderItem={renderItem}
//           keyExtractor={(item, index) => 
//             item.type === 'header' 
//               ? `header-${item.title}-${index}` 
//               : `${item.id}-${item.createdAt.getTime()}`
//           }
//           contentContainerStyle={{ padding: 12 }}
//           onViewableItemsChanged={onViewableItemsChanged}
//           viewabilityConfig={viewabilityConfig}
//           ListHeaderComponent={
//             loadingMore ? (
//               <ActivityIndicator size="small" style={{ marginVertical: 10 }} />
//             ) : hasMore ? (
//               <TouchableOpacity onPress={() => fetchMessages(true)} style={styles.loadMoreButton}>
//                 <Text style={styles.loadMoreText}>Load Older Messages</Text>
//               </TouchableOpacity>
//             ) : null
//           }
//         />
//         <View style={styles.inputBar}>
//           <TextInput
//             style={styles.input}
//             value={inputText}
//             onChangeText={setInputText}
//             placeholder="Type a message..."
//             multiline
//           />
//           <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
//             <Text style={styles.sendText}>Send</Text>
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   msg: { padding: 8, marginBottom: 8, borderRadius: 8, maxWidth: '80%' },
//   myMsg: { backgroundColor: '#DCF8C6', alignSelf: 'flex-end' },
//   otherMsg: { backgroundColor: 'white', alignSelf: 'flex-start' },
//   time: { fontSize: 10, color: '#666', marginTop: 4 },
//   inputBar: { flexDirection: 'row', padding: 8, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#ddd' },
//   input: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, maxHeight: 100 },
//   sendButton: { marginLeft: 8, backgroundColor: '#007AFF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
//   sendText: { color: 'white', fontWeight: 'bold' },
//   loadMoreButton: {
//     backgroundColor: '#007AFF',
//     padding: 10,
//     borderRadius: 8,
//     marginVertical: 10,
//     alignItems: 'center',
//   },
//   loadMoreText: { color: 'white', fontWeight: 'bold' },
//   floatingHeader: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     zIndex: 10,
//     alignItems: 'center',
//     paddingTop: 12,
//     pointerEvents: 'none',
//   },
//   dateChip: {
//     backgroundColor: 'rgba(0, 0, 0, 0.8)',
//     paddingHorizontal: 16,
//     paddingVertical: 6,
//     borderRadius: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   dateChipText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#FFFFFF',
//     letterSpacing: 0.3,
//   },
//   headerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginVertical: 16,
//   },
//   headerLine: {
//     flex: 1,
//     height: 1,
//     backgroundColor: '#e0e0e0',
//     marginHorizontal: 8,
//   },
//   headerText: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '500',
//     backgroundColor: '#f0f0f0',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
// });



// import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
// import {
//   SafeAreaView, StyleSheet, StatusBar, Platform, Modal, Image, Text, View,
//   TouchableOpacity, ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView,
//   TextInput, FlatList, Dimensions,
// } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import moment from 'moment';
// import * as ImagePicker from 'expo-image-picker';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import ImageViewing from 'react-native-image-viewing';
// import EmojiSelector from 'react-native-emoji-selector';
// import { AuthContext } from '../../context/AuthContext';
// import { useWebSocket } from '../../context/WebsocketContext';
// import { getMessages, markConversationRead, uploadImage } from '../../services/connection/chatApi';
// import COLORS from '../../constants/colors';
// import { LanguageContext } from '../../context/LanguageContext';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// export default function ChatConversation({ navigation, route }) {
//   const { conversation } = route.params;
//   const { currentUser, currentUserId } = useContext(AuthContext);
//   const { language } = useContext(LanguageContext);
//   const { sendMessage, addMessageHandler, removeMessageHandler } = useWebSocket();

//   const [messages, setMessages] = useState([]);
//   const [flatData, setFlatData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState(false);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [text, setText] = useState('');
//   const [imageViewerVisible, setImageViewerVisible] = useState(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [imagesForViewing, setImagesForViewing] = useState([]);
//   const [keyboardHeight, setKeyboardHeight] = useState(0);
//   const [inputHeight, setInputHeight] = useState(44);
//   const [showCamera, setShowCamera] = useState(false);
//   const [cameraType, setCameraType] = useState('back');
//   const [isCameraReady, setIsCameraReady] = useState(false);
//   const [permission, requestPermission] = useCameraPermissions();
//   const [isSimulator, setIsSimulator] = useState(false);
//   const [currentHeader, setCurrentHeader] = useState('');

//   const flatListRef = useRef(null);
//   const textInputRef = useRef(null);
//   const cameraRef = useRef(null);
//   const fetchInProgressRef = useRef(false);
//   const oldestIdRef = useRef(null);
//   const isNearBottomRef = useRef(true);
//   const loadingOlderRef = useRef(false);
//   const needsScrollRef = useRef(false);
//   const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;
//   const recentMessageIds = useRef(new Set());

//   const [hasMore, setHasMore] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);

//   // Keyboard listeners
//   useEffect(() => {
//     const show = Keyboard.addListener('keyboardWillShow', (e) => setKeyboardHeight(e.endCoordinates.height));
//     const hide = Keyboard.addListener('keyboardWillHide', () => setKeyboardHeight(0));
//     return () => { show.remove(); hide.remove(); };
//   }, []);

//   useEffect(() => {
//     if (Platform.OS === 'ios') {
//       const checkSimulator = async () => {
//         try { if (permission?.granted) setIsSimulator(false); } catch (error) { setIsSimulator(true); }
//       };
//       checkSimulator();
//     }
//   }, [permission]);

//   // Translation update handler
//   useEffect(() => {
//     const handleTranslationUpdate = (data) => {
//       if (data.type === 'translation_update') {
//         setMessages(prev => prev.map(msg =>
//           msg.id === data.message_id ? { ...msg, translations: data.translations } : msg
//         ));
//         setFlatData(prev => prev.map(item =>
//           item.type === 'message' && item.id === data.message_id
//             ? { ...item, translations: data.translations }
//             : item
//         ));
//       }
//     };
//     addMessageHandler(handleTranslationUpdate);
//     return () => removeMessageHandler(handleTranslationUpdate);
//   }, [addMessageHandler, removeMessageHandler]);

//   const getDisplayDate = (date) => {
//     const msgDate = moment(date);
//     const today = moment().startOf('day');
//     const yesterday = moment().subtract(1, 'days').startOf('day');
//     if (msgDate.isSame(today, 'day')) return 'Today';
//     if (msgDate.isSame(yesterday, 'day')) return 'Yesterday';
//     if (msgDate.isSame(moment(), 'week')) return msgDate.format('dddd');
//     return msgDate.format('MMMM D, YYYY');
//   };

//   const flattenWithHeaders = (msgs) => {
//     if (!msgs.length) return [];
//     const sorted = [...msgs].sort((a, b) => a.createdAt - b.createdAt);
//     const grouped = {};
//     sorted.forEach(msg => {
//       const displayDate = getDisplayDate(msg.createdAt);
//       if (!grouped[displayDate]) grouped[displayDate] = [];
//       grouped[displayDate].push(msg);
//     });
//     const flat = [];
//     Object.keys(grouped).forEach(title => {
//       flat.push({ type: 'header', title });
//       flat.push(...grouped[title].map(msg => ({ type: 'message', ...msg })));
//     });
//     return flat;
//   };

//   const appendMessageToFlatData = (currentFlat, newMsg) => {
//     const newDate = getDisplayDate(newMsg.createdAt);
//     let headerIndex = currentFlat.findIndex(item => item.type === 'header' && item.title === newDate);
//     if (headerIndex === -1) {
//       return [...currentFlat, { type: 'header', title: newDate }, { type: 'message', ...newMsg }];
//     } else {
//       let lastIndex = headerIndex + 1;
//       while (lastIndex < currentFlat.length && currentFlat[lastIndex].type !== 'header') {
//         lastIndex++;
//       }
//       const newFlat = [...currentFlat];
//       newFlat.splice(lastIndex, 0, { type: 'message', ...newMsg });
//       return newFlat;
//     }
//   };

//   const fetchMessages = async (loadMore = false) => {
//     if (fetchInProgressRef.current) return;
//     if (loadMore && (!hasMore || loadingMore)) return;

//     if (loadMore) loadingOlderRef.current = true;

//     fetchInProgressRef.current = true;
//     loadMore ? setLoadingMore(true) : setLoading(true);

//     try {
//       const params = { limit: 20 };
//       if (loadMore && oldestIdRef.current) {
//         params.last_id = oldestIdRef.current;
//       }
//       const data = await getMessages(conversation.id, currentUserId, params);
//       if (!data || !Array.isArray(data)) {
//         if (loadMore) setHasMore(false);
//         return;
//       }

//       const transformed = data.map(msg => ({
//         id: msg.id,
//         createdAt: new Date(msg.createdAt),
//         text: msg.text,
//         image: msg.image,
//         sender: msg.senderId,
//         isMe: msg.senderId === currentUserId,
//         translations: msg.translations || {},
//         user: {
//           _id: msg.senderId,
//           name: msg.senderId === currentUserId ? currentUser.name : conversation.otherUser.name,
//           avatar: msg.senderId === currentUserId ? currentUser.avatar : conversation.otherUser.avatar,
//         },
//       }));
//       transformed.sort((a, b) => a.createdAt - b.createdAt);

//       if (loadMore) {
//         const existingIds = new Set(messages.map(m => m.id));
//         const newMessages = transformed.filter(m => !existingIds.has(m.id));
//         if (newMessages.length === 0) {
//           setHasMore(false);
//         } else {
//           const newList = [...newMessages, ...messages];
//           setMessages(newList);
//           setFlatData(flattenWithHeaders(newList));
//           oldestIdRef.current = newMessages[0].id;
//           if (newMessages.length < 20) setHasMore(false);
//         }
//       } else {
//         setMessages(transformed);
//         setFlatData(flattenWithHeaders(transformed));
//         if (transformed.length > 0) oldestIdRef.current = transformed[0].id;
//         setHasMore(transformed.length === 20);
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert('Error', 'Could not load messages');
//     } finally {
//       if (loadMore) {
//         setLoadingMore(false);
//         setTimeout(() => { loadingOlderRef.current = false; }, 500);
//       } else {
//         setLoading(false);
//       }
//       fetchInProgressRef.current = false;
//     }
//   };

//   useEffect(() => {
//     markConversationRead(conversation.id, currentUserId).catch(console.error);
//     fetchMessages();
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       fetchMessages();
//     }, [])
//   );

//   // WebSocket incoming – append new message with duplicate prevention
//   useEffect(() => {
//     const handleIncoming = (data) => {
//       if (data.type === 'translation_update') return;
//       if (data.type === 'error') {
//         Alert.alert("Error", data.message);
//         return;
//       }
//       if (data.conversation_id === conversation.id && data.text) {
//         if (recentMessageIds.current.has(data._id)) return;
//         recentMessageIds.current.add(data._id);
//         setTimeout(() => recentMessageIds.current.delete(data._id), 2000);

//         const newMsg = {
//           id: data._id,
//           createdAt: new Date(data.createdAt),
//           text: data.text,
//           image: data.image,
//           sender: data.senderId,
//           isMe: data.senderId === currentUserId,
//           translations: data.translations || {},
//           user: {
//             _id: data.senderId,
//             name: data.senderId === currentUserId ? currentUser.name : conversation.otherUser.name,
//             avatar: data.senderId === currentUserId ? currentUser.avatar : conversation.otherUser.avatar,
//           },
//         };
//         // setMessages(prev => {
//         //   if (prev.some(msg => msg.id === newMsg.id)) return prev;
//         //   return [...prev, newMsg];
//         // });
//         // setFlatData(prevFlat => {
//         //   if (prevFlat.some(item => item.type === 'message' && item.id === newMsg.id)) return prevFlat;
//         //   return appendMessageToFlatData(prevFlat, newMsg);
//         // });
//         // setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);

//         setMessages(prev => {
//           if (prev.some(msg => msg.id === newMsg.id)) return prev;
//           return [...prev, newMsg];
//         });
//         setFlatData(prevFlat => {
//           if (prevFlat.some(item => item.type === 'message' && item.id === newMsg.id)) return prevFlat;
//           return appendMessageToFlatData(prevFlat, newMsg);
//         });
//         needsScrollRef.current = true;
//         // Scroll to bottom after the list has rendered
//         setTimeout(() => {
//           flatListRef.current?.scrollToEnd({ animated: true });
//           setTimeout(() => {
//             flatListRef.current?.scrollToEnd({ animated: true });
//           }, 150);
//         }, 300);
        
//       }
//     };
//     addMessageHandler(handleIncoming);
//     return () => removeMessageHandler(handleIncoming);
//   }, [conversation.id, currentUserId, currentUser, conversation.otherUser]);

//   // Scroll to bottom only when near bottom and not loading older messages
//   useEffect(() => {
//     if (!loading && flatData.length > 0 && flatListRef.current && !loadingMore && !loadingOlderRef.current && isNearBottomRef.current) {
//       setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
//     }
//   }, [flatData, loading, loadingMore]);

//   const onScroll = (e) => {
//     const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
//     const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
//     isNearBottomRef.current = distanceFromBottom < 100;
//   };

//   const onViewableItemsChanged = useCallback(({ viewableItems }) => {
//     if (viewableItems && viewableItems.length > 0) {
//       const topItem = viewableItems[0];
//       if (topItem.item && topItem.item.type === 'header') {
//         setCurrentHeader(topItem.item.title);
//       } else {
//         const index = topItem.index;
//         for (let i = index; i >= 0; i--) {
//           if (flatData[i] && flatData[i].type === 'header') {
//             setCurrentHeader(flatData[i].title);
//             break;
//           }
//         }
//       }
//     }
//   }, [flatData]);

//   // ---- Image and camera functions ----
//   const uploadAndSendImage = async (uri) => {
//     setUploading(true);
//     try {
//       const imageUrl = await uploadImage(uri);
//       sendMessage(conversation.otherUser.id, '', conversation.id, imageUrl);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to upload image');
//     } finally {
//       setUploading(false);
//     }
//   };

//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsMultipleSelection: true,
//       quality: 0.8,
//     });
//     if (!result.canceled && result.assets) {
//       for (const asset of result.assets) await uploadAndSendImage(asset.uri);
//     }
//   };

//   const openCamera = () => setShowCamera(true);
//   const closeCamera = () => setShowCamera(false);
//   const toggleCameraType = () => setCameraType(prev => prev === 'back' ? 'front' : 'back');
//   const onCameraReady = () => setIsCameraReady(true);

//   const takePhoto = async () => {
//     if (isSimulator || !permission?.granted) {
//       await pickImageFromLibrary();
//       return;
//     }
//     if (cameraRef.current && isCameraReady) {
//       try {
//         const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, skipProcessing: true });
//         if (photo.uri) {
//           closeCamera();
//           await uploadAndSendImage(photo.uri);
//         }
//       } catch (error) {
//         Alert.alert('Error', 'Failed to take photo');
//       }
//     } else {
//       await pickImageFromLibrary();
//     }
//   };

//   const pickImageFromLibrary = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.8,
//     });
//     if (!result.canceled && result.assets) await uploadAndSendImage(result.assets[0].uri);
//   };

//   // Contact info detection (simple version)
//   const containsContactInfo = (text) => {
//     const patterns = [
//       /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
//       /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/,
//       /@[A-Za-z0-9_]+/,
//       /\b\d{1,5}\s\w+\s(street|st|avenue|ave|road|rd|lane|ln|drive|dr|court|ct|boulevard|blvd)\b/i
//     ];
//     return patterns.some(pattern => pattern.test(text));
//   };

//   const handleSend = () => {
//     const trimmed = text.trim();
//     if (!trimmed) return;
//     if (containsContactInfo(trimmed)) {
//       Alert.alert("Warning", "Contact information (email, phone, address, social media) is not allowed.");
//       return;
//     }
//     sendMessage(conversation.otherUser.id, trimmed, conversation.id);
//     setText('');
//   };

//   // const handleSend = () => {
//   //   const trimmed = text.trim();
//   //   if (!trimmed) return;
//   //   if (containsContactInfo(trimmed)) {
//   //     Alert.alert("Warning", "Contact information (email, phone, address, social media) is not allowed.");
//   //     return;
//   //   }
//   //   sendMessage(conversation.otherUser.id, trimmed, conversation.id);
//   //   setText('');
//   //   Keyboard.dismiss(); // 👈 close keyboard after sending
//   // };

//   const toggleEmojiPicker = () => {
//     setShowEmojiPicker(!showEmojiPicker);
//     if (!showEmojiPicker) Keyboard.dismiss();
//   };
//   const onEmojiSelected = (emoji) => setText(prev => prev + emoji);

//   const openImageViewer = (imageUrl, allImages = []) => {
//     let images = allImages.length ? allImages : [{ uri: imageUrl }];
//     let initialIndex = allImages.findIndex(img => img.uri === imageUrl);
//     setImagesForViewing(images);
//     setCurrentImageIndex(initialIndex >= 0 ? initialIndex : 0);
//     setImageViewerVisible(true);
//   };
//   const closeImageViewer = () => setImageViewerVisible(false);
//   const getAllImages = () => messages.filter(m => m.image).map(m => ({ uri: m.image }));

//   const shouldShowAvatar = (current, prevMessage, nextMessage) => {
//     if (current.isMe) return false;
//     if (!prevMessage || prevMessage.isMe) return true;
//     if (moment(current.createdAt).diff(moment(prevMessage.createdAt), 'minutes') > 5) return true;
//     if (!nextMessage || nextMessage.isMe) return true;
//     return false;
//   };

//   const renderItem = ({ item, index }) => {
//     if (item.type === 'header') return null;
//     const msg = item;
//     const prevItem = index > 0 && flatData[index - 1].type === 'message' ? flatData[index - 1] : null;
//     const nextItem = index < flatData.length - 1 && flatData[index + 1].type === 'message' ? flatData[index + 1] : null;
//     const showAvatar = shouldShowAvatar(msg, prevItem, nextItem);

//     let displayText = msg.text;
//     let isTranslated = false;
//     if (!msg.isMe && msg.translations && msg.translations[language]) {
//       displayText = msg.translations[language];
//       isTranslated = true;
//     }

//     return (
//       <View style={[styles.messageRow, msg.isMe ? styles.messageRowRight : styles.messageRowLeft]}>
//         {!msg.isMe && (showAvatar ? (
//           <Image source={{ uri: conversation.otherUser.avatar || 'https://via.placeholder.com/40' }} style={styles.avatar} />
//         ) : <View style={styles.avatarSpacer} />)}

//         <View style={[styles.messageContainer, msg.isMe ? styles.myMessageContainer : styles.otherMessageContainer, !showAvatar && styles.messageWithoutAvatar]}>
//           {msg.image ? (
//             <TouchableOpacity onPress={() => openImageViewer(msg.image, getAllImages())} activeOpacity={0.7}>
//               <Image source={{ uri: msg.image }} style={styles.messageImage} resizeMode="cover" />
//               <View style={styles.imageOverlay}><Ionicons name="expand" size={16} color="white" /></View>
//             </TouchableOpacity>
//           ) : (
//             <View style={[styles.messageBubble, msg.isMe ? styles.myMessageBubble : styles.otherMessageBubble]}>
//               <Text style={[styles.messageText, msg.isMe ? styles.myMessageText : styles.otherMessageText]}>
//                 {displayText}
//               </Text>
//               {isTranslated && (
//                 <Text style={styles.translatedHint}>📝 Translated from {msg.text}</Text>
//               )}
//             </View>
//           )}
//           <View style={[styles.messageFooter, msg.isMe ? styles.myMessageFooter : styles.otherMessageFooter]}>
//             <Text style={[styles.messageTime, msg.isMe ? styles.myMessageTime : styles.otherMessageTime]}>
//               {moment.utc(msg.createdAt).local().format('h:mm A')}
//             </Text>
//             {msg.isMe && <MaterialIcons name="done-all" size={14} color="#4CAF50" style={styles.deliveryIcon} />}
//           </View>
//         </View>

//         {msg.isMe && (showAvatar ? (
//           <Image source={{ uri: currentUser.avatar || 'https://via.placeholder.com/40' }} style={[styles.avatar, styles.myAvatar]} />
//         ) : <View style={styles.avatarSpacer} />)}
//       </View>
//     );
//   };

//   const renderMessageOptions = () => {
//     Alert.alert('Send Media', 'Choose an option', [
//       { text: 'Choose from Library', onPress: pickImage },
//       { text: 'Take Photo', onPress: openCamera },
//       { text: 'Cancel', style: 'cancel' },
//     ]);
//   };

//   const renderCameraModal = () => {
//     if (isSimulator) {
//       return (
//         <View style={styles.cameraContainer}>
//           <View style={styles.cameraHeader}>
//             <TouchableOpacity style={styles.cameraCloseButton} onPress={closeCamera}>
//               <Ionicons name="close" size={30} color="white" />
//             </TouchableOpacity>
//           </View>
//           <View style={styles.simulatorContainer}>
//             <Ionicons name="camera-off" size={64} color="white" />
//             <Text style={styles.simulatorText}>Camera not available in simulator</Text>
//             <TouchableOpacity style={styles.libraryButton} onPress={pickImageFromLibrary}>
//               <Ionicons name="images" size={24} color="white" />
//               <Text style={styles.libraryButtonText}>Pick from Library</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       );
//     }
//     if (!permission) {
//       return (
//         <View style={styles.cameraContainer}>
//           <View style={styles.permissionContainer}>
//             <ActivityIndicator size="large" color="white" />
//             <Text style={styles.permissionText}>Requesting camera permission...</Text>
//           </View>
//         </View>
//       );
//     }
//     if (!permission.granted) {
//       return (
//         <View style={styles.cameraContainer}>
//           <View style={styles.cameraHeader}>
//             <TouchableOpacity style={styles.cameraCloseButton} onPress={closeCamera}>
//               <Ionicons name="close" size={30} color="white" />
//             </TouchableOpacity>
//           </View>
//           <View style={styles.permissionContainer}>
//             <Ionicons name="camera-off" size={48} color="white" />
//             <Text style={styles.permissionText}>No access to camera</Text>
//             <TouchableOpacity style={styles.permissionButton} onPress={() => requestPermission()}>
//               <Text style={styles.permissionButtonText}>Grant Permission</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       );
//     }
//     return (
//       <View style={styles.cameraContainer}>
//         <CameraView style={styles.camera} facing={cameraType} ref={cameraRef} onCameraReady={onCameraReady}>
//           <View style={styles.cameraHeader}>
//             <TouchableOpacity style={styles.cameraCloseButton} onPress={closeCamera}>
//               <Ionicons name="close" size={30} color="white" />
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
//               <Ionicons name="camera-reverse" size={24} color="white" />
//             </TouchableOpacity>
//           </View>
//           <View style={styles.cameraControls}>
//             <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
//               <View style={styles.captureButtonOuter}>
//                 <View style={styles.captureButtonInner} />
//               </View>
//             </TouchableOpacity>
//           </View>
//         </CameraView>
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       </View>
//     );
//   }

//   return (
//     <>
//       <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
//       <SafeAreaView style={styles.safeArea}>
//         <KeyboardAvoidingView
//           style={styles.container}
//           behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//           keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
//         >
//           {currentHeader !== '' && flatData.length > 0 && (
//             <View style={styles.floatingHeader}>
//               <View style={styles.dateChip}>
//                 <Text style={styles.dateChipText}>{currentHeader}</Text>
//               </View>
//             </View>
//           )}

//           <FlatList
//             ref={flatListRef}
//             data={flatData}
//             renderItem={renderItem}
//             keyExtractor={(item, index) => 
//               item.type === 'header' 
//                 ? `header-${item.title}-${index}` 
//                 : `msg-${item.id}-${item.createdAt.getTime()}`
//             }
//             // contentContainerStyle={[
//             //   styles.messagesList,
//             //   { paddingBottom: keyboardHeight > 0 ? keyboardHeight + inputHeight : inputHeight + 20 }
              
//             // ]}
//             contentContainerStyle={[
//               styles.messagesList,
//               { paddingBottom: keyboardHeight > 0 ? keyboardHeight + inputHeight + 80 : inputHeight + 20 }
//             ]}
//             showsVerticalScrollIndicator={false}
//             keyboardShouldPersistTaps="handled"
//             onScroll={onScroll}
//             onViewableItemsChanged={onViewableItemsChanged}
//             viewabilityConfig={viewabilityConfig}
//             ListHeaderComponent={
//               loadingMore ? (
//                 <View style={styles.loadingMoreContainer}>
//                   <ActivityIndicator size="small" color={COLORS.primary} />
//                   <Text style={styles.loadingMoreText}>Loading older messages...</Text>
//                 </View>
//               ) : hasMore ? (
//                 <TouchableOpacity
//                   onPress={() => fetchMessages(true)}
//                   style={styles.loadMoreButton}
//                   disabled={loadingMore}
//                 >
//                   <Text style={styles.loadMoreText}>Load Older Messages</Text>
//                 </TouchableOpacity>
//               ) : null
//             }
//           />

//           <View style={[styles.inputToolbar, { bottom: keyboardHeight }]}>
//             <TouchableOpacity style={styles.actionButton} onPress={toggleEmojiPicker}>
//               <Ionicons name={showEmojiPicker ? 'close' : 'happy'} size={26} color={showEmojiPicker ? COLORS.error : COLORS.primary} />
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionButton} onPress={renderMessageOptions}>
//               <Ionicons name="camera" size={26} color={COLORS.primary} />
//             </TouchableOpacity>
//             <View style={styles.inputContainer}>
//               <TextInput
//                 ref={textInputRef}
//                 style={[styles.textInput, { height: Math.max(44, Math.min(100, inputHeight)) }]}
//                 value={text}
//                 onChangeText={setText}
//                 placeholder="Type a message..."
//                 placeholderTextColor="#999"
//                 multiline
//                 maxLength={1000}
//                 onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
//               />
//             </View>
//             <TouchableOpacity
//               style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
//               onPress={handleSend}
//               disabled={!text.trim()}
//             >
//               <Ionicons name="send" size={24} color={text.trim() ? COLORS.primary : '#ccc'} />
//             </TouchableOpacity>
//           </View>
//           {showEmojiPicker && (
//             <View style={[styles.emojiPickerContainer, { bottom: keyboardHeight > 0 ? keyboardHeight + 50 : 50 }]}>
//               <EmojiSelector
//                 onEmojiSelected={onEmojiSelected}
//                 columns={8}
//                 showSearchBar
//                 showHistory
//                 showSectionTitles
//                 style={styles.emojiSelector}
//               />
//             </View>
//           )}
//         </KeyboardAvoidingView>

//         <Modal animationType="slide" transparent={false} visible={showCamera} onRequestClose={closeCamera}>
//           {renderCameraModal()}
//         </Modal>

//         <ImageViewing
//           images={imagesForViewing}
//           imageIndex={currentImageIndex}
//           visible={imageViewerVisible}
//           onRequestClose={closeImageViewer}
//           backgroundColor="rgba(0, 0, 0, 0.95)"
//           swipeToCloseEnabled
//           doubleTapToZoomEnabled
//           HeaderComponent={({ imageIndex }) => (
//             <View style={styles.imageViewerHeader}>
//               <Text style={styles.imageViewerText}>{imageIndex + 1} / {imagesForViewing.length}</Text>
//               <TouchableOpacity onPress={closeImageViewer} style={styles.closeButton}>
//                 <Ionicons name="close" size={28} color="white" />
//               </TouchableOpacity>
//             </View>
//           )}
//         />
//         {uploading && (
//           <View style={styles.uploadingContainer}>
//             <ActivityIndicator size="large" color={COLORS.primary} />
//             <Text style={styles.uploadingText}>Uploading image...</Text>
//           </View>
//         )}
//       </SafeAreaView>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: COLORS.primary },
//   container: { flex: 1, backgroundColor: '#f0f0f0' },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
//   messagesList: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8 },
  
//   floatingHeader: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     zIndex: 10,
//     alignItems: 'center',
//     paddingTop: 12,
//     pointerEvents: 'none',
//   },
//   dateChip: {
//     backgroundColor: 'rgba(0, 0, 0, 0.8)',
//     paddingHorizontal: 16,
//     paddingVertical: 6,
//     borderRadius: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   dateChipText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#FFFFFF',
//     letterSpacing: 0.3,
//   },
  
//   messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4 },
//   messageRowLeft: { justifyContent: 'flex-start' },
//   messageRowRight: { justifyContent: 'flex-end' },
//   avatar: { width: 32, height: 32, borderRadius: 16, marginHorizontal: 8, marginBottom: 4 },
//   myAvatar: { marginLeft: 8, marginRight: 0 },
//   avatarSpacer: { width: 32, marginHorizontal: 8 },
//   messageContainer: { maxWidth: '87%', marginBottom: 4 },
//   myMessageContainer: { alignItems: 'flex-end' },
//   otherMessageContainer: { alignItems: 'flex-start' },
//   messageWithoutAvatar: { marginLeft: 48 },
//   messageBubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, maxWidth: '100%' },
//   myMessageBubble: { backgroundColor: '#DCF8C6', borderBottomRightRadius: 4 },
//   otherMessageBubble: { backgroundColor: 'white', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
//   messageText: { fontSize: 16, lineHeight: 22 },
//   myMessageText: { color: '#000' },
//   otherMessageText: { color: '#000' },
//   messageFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 4, paddingHorizontal: 8 },
//   myMessageFooter: { justifyContent: 'flex-end' },
//   otherMessageFooter: { justifyContent: 'flex-start' },
//   messageTime: { fontSize: 11, color: '#666' },
//   myMessageTime: { color: '#666' },
//   otherMessageTime: { color: '#666' },
//   deliveryIcon: { marginLeft: 2 },
  
//   messageImage: { width: 200, height: 150, borderRadius: 12, overflow: 'hidden' },
//   imageOverlay: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  
//   inputToolbar: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e0e0e0', paddingHorizontal: 12, paddingVertical: 10, position: 'absolute', left: 0, right: 0, minHeight: 60 },
//   inputContainer: { flex: 1, marginHorizontal: 8 },
//   textInput: { backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, maxHeight: 100, minHeight: 40 },
//   actionButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
//   sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
//   sendButtonDisabled: { opacity: 0.5 },
  
//   emojiPickerContainer: { position: 'absolute', left: 0, right: 0, height: 250, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
//   emojiSelector: { flex: 1 },
  
//   cameraContainer: { flex: 1, backgroundColor: 'black' },
//   camera: { flex: 1 },
//   cameraHeader: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 30, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
//   cameraCloseButton: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 8 },
//   flipButton: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 8 },
//   cameraControls: { position: 'absolute', bottom: 40, alignSelf: 'center' },
//   captureButton: { alignItems: 'center', justifyContent: 'center' },
//   captureButtonOuter: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'white' },
//   captureButtonInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'white' },
  
//   simulatorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', paddingHorizontal: 20 },
//   simulatorText: { color: 'white', fontSize: 18, fontWeight: '600', marginTop: 20, textAlign: 'center' },
//   libraryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, marginTop: 20 },
//   libraryButtonText: { color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 10 },
//   permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
//   permissionText: { color: 'white', fontSize: 16, marginTop: 16, textAlign: 'center', paddingHorizontal: 20 },
//   permissionButton: { marginTop: 20, backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
//   permissionButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  
//   uploadingContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
//   uploadingText: { color: 'white', marginTop: 10, fontSize: 16 },
  
//   imageViewerHeader: { position: 'absolute', top: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, zIndex: 1 },
//   imageViewerText: { color: 'white', fontSize: 16, fontWeight: '600' },
//   closeButton: { padding: 5 },
  
//   loadingMoreContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 10,
//   },
//   loadingMoreText: {
//     marginLeft: 8,
//     fontSize: 12,
//     color: '#666',
//   },
//   loadMoreButton: {
//     backgroundColor: '#007AFF',
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     alignSelf: 'center',
//     marginVertical: 10,
//   },
//   loadMoreText: {
//     color: 'white',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   translatedHint: {
//     fontSize: 10,
//     color: '#888',
//     marginTop: 4,
//     fontStyle: 'italic',
//   },
// });


// import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
// import {
//   SafeAreaView, StyleSheet, StatusBar, Platform, Modal, Image, Text, View,
//   TouchableOpacity, ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView,
//   TextInput, FlatList, Dimensions, AppState
// } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import moment from 'moment';
// import * as ImagePicker from 'expo-image-picker';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import ImageViewing from 'react-native-image-viewing';
// import EmojiSelector from 'react-native-emoji-selector';
// import { AuthContext } from '../../context/AuthContext';
// import { useWebSocket } from '../../context/WebsocketContext';
// import { getMessages, markConversationRead, uploadImage } from '../../services/connection/chatApi';
// import COLORS from '../../constants/colors';
// import { LanguageContext } from '../../context/LanguageContext';


// export default function ChatConversation({ navigation, route }) {
//   const { conversation } = route.params;
//   console.log(conversation)
//   const { currentUser, currentUserId } = useContext(AuthContext);
//   const { language } = useContext(LanguageContext);
//   const { sendMessage, addMessageHandler, removeMessageHandler } = useWebSocket();

//   const [messages, setMessages] = useState([]);
//   const [flatData, setFlatData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState(false);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [text, setText] = useState('');
//   const [imageViewerVisible, setImageViewerVisible] = useState(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [imagesForViewing, setImagesForViewing] = useState([]);
//   const [keyboardHeight, setKeyboardHeight] = useState(0);
//   const [inputHeight, setInputHeight] = useState(44);
//   const [showCamera, setShowCamera] = useState(false);
//   const [cameraType, setCameraType] = useState('back');
//   const [isCameraReady, setIsCameraReady] = useState(false);
//   const [permission, requestPermission] = useCameraPermissions();
//   const [isSimulator, setIsSimulator] = useState(false);
//   const [currentHeader, setCurrentHeader] = useState('');

//   const flatListRef = useRef(null);
//   const textInputRef = useRef(null);
//   const cameraRef = useRef(null);
//   const fetchInProgressRef = useRef(false);
//   const oldestIdRef = useRef(null);
//   const isNearBottomRef = useRef(true);
//   const loadingOlderRef = useRef(false);
//   const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;
//   const recentMessageIds = useRef(new Set());

//   const [hasMore, setHasMore] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);

//   const initialLoadRef = useRef(false);

// useEffect(() => {
//   if (!initialLoadRef.current) {
//     initialLoadRef.current = true;
//     markConversationRead(conversation.id, currentUserId).catch(console.error);
//     fetchMessages();
//   }
// }, []);

//   // Keyboard listeners
//   useEffect(() => {
//     const show = Keyboard.addListener('keyboardWillShow', (e) => setKeyboardHeight(e.endCoordinates.height));
//     const hide = Keyboard.addListener('keyboardWillHide', () => setKeyboardHeight(0));
//     return () => { show.remove(); hide.remove(); };
//   }, []);

//   useEffect(() => {
//     if (Platform.OS === 'ios') {
//       const checkSimulator = async () => {
//         try { if (permission?.granted) setIsSimulator(false); } catch (error) { setIsSimulator(true); }
//       };
//       checkSimulator();
//     }
//   }, [permission]);



// useEffect(() => {
//   const subscription = AppState.addEventListener('change', (nextAppState) => {
//     if (nextAppState === 'active') {
//       // Reconnect or refresh connection
//       console.log('App came to foreground');
//     }
//   });
//   return () => subscription.remove();
// }, []);

//   const getDisplayDate = (date) => {
//     const msgDate = moment(date);
//     const today = moment().startOf('day');
//     const yesterday = moment().subtract(1, 'days').startOf('day');
//     if (msgDate.isSame(today, 'day')) return 'Today';
//     if (msgDate.isSame(yesterday, 'day')) return 'Yesterday';
//     if (msgDate.isSame(moment(), 'week')) return msgDate.format('dddd');
//     return msgDate.format('MMMM D, YYYY');
//   };

//   const flattenWithHeaders = (msgs) => {
//     if (!msgs.length) return [];
//     const sorted = [...msgs].sort((a, b) => a.createdAt - b.createdAt);
//     const grouped = {};
//     sorted.forEach(msg => {
//       const displayDate = getDisplayDate(msg.createdAt);
//       if (!grouped[displayDate]) grouped[displayDate] = [];
//       grouped[displayDate].push(msg);
//     });
//     const flat = [];
//     Object.keys(grouped).forEach(title => {
//       flat.push({ type: 'header', title });
//       flat.push(...grouped[title].map(msg => ({ type: 'message', ...msg })));
//     });
//     return flat;
//   };

//   const fetchMessages = async (loadMore = false) => {

//     console.log('fetchMessages called, loadMore:', loadMore);
//     console.trace(); // This will show the call stack

//     console.log('🔍 fetchMessages called, loadMore:', loadMore);
//     console.trace(); // This will print the call stack 

//     if (fetchInProgressRef.current) return;
//     if (loadMore && (!hasMore || loadingMore)) return;
//     if (loadMore) loadingOlderRef.current = true;

//     fetchInProgressRef.current = true;
//     loadMore ? setLoadingMore(true) : setLoading(true);

//     try {
//       const params = { limit: 20 };
//       if (loadMore && oldestIdRef.current) params.last_id = oldestIdRef.current;
//       const data = await getMessages(conversation.id, currentUserId, params);
//       if (!data || !Array.isArray(data)) {
//         if (loadMore) setHasMore(false);
//         return;
//       }

//       const transformed = data.map(msg => ({
//         id: msg.id,
//         createdAt: new Date(msg.createdAt),
//         text: msg.text,
//         image: msg.image,
//         sender: msg.senderId,
//         isMe: msg.senderId === currentUserId,
//         translations: msg.translations || {},
//         user: {
//           _id: msg.senderId,
//           name: msg.senderId === currentUserId ? currentUser.name : conversation.otherUser.name,
//           avatar: msg.senderId === currentUserId ? currentUser.avatar : conversation.otherUser.avatar,
//         },
//       }));
//       transformed.sort((a, b) => a.createdAt - b.createdAt);

//       if (loadMore) {
//         const existingIds = new Set(messages.map(m => m.id));
//         const newMessages = transformed.filter(m => !existingIds.has(m.id));
//         if (newMessages.length === 0) setHasMore(false);
//         else {
//           const newList = [...newMessages, ...messages];
//           setMessages(newList);
//           setFlatData(flattenWithHeaders(newList));
//           oldestIdRef.current = newMessages[0].id;
//           if (newMessages.length < 20) setHasMore(false);
//         }
//       } else {
//         setMessages(transformed);
//         setFlatData(flattenWithHeaders(transformed));
//         if (transformed.length > 0) oldestIdRef.current = transformed[0].id;
//         setHasMore(transformed.length === 20);
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert('Error', 'Could not load messages');
//     } finally {
//       if (loadMore) {
//         setLoadingMore(false);
//         setTimeout(() => { loadingOlderRef.current = false; }, 500);
//       } else setLoading(false);
//       fetchInProgressRef.current = false;
//     }
//   };

//   useEffect(() => {
//     markConversationRead(conversation.id, currentUserId).catch(console.error);
//     fetchMessages();
//   }, []);

//   // useFocusEffect(useCallback(() => { fetchMessages(); }, []));

//   // Translation update handler
//   useEffect(() => {
//     const handleTranslationUpdate = (data) => {
//       if (data.type === 'translation_update') {
//         setMessages(prev => {
//           const updated = prev.map(msg =>
//             msg.id === data.message_id ? { ...msg, translations: data.translations } : msg
//           );
//           setFlatData(flattenWithHeaders(updated));
//           return updated;
//         });
//       }
//     };
//     addMessageHandler(handleTranslationUpdate);
//     return () => removeMessageHandler(handleTranslationUpdate);
//   }, [addMessageHandler, removeMessageHandler]);

//   // WebSocket incoming – append new message and regenerate flatData
//   useEffect(() => {
//     const handleIncoming = (data) => {
//       if (data.type === 'translation_update') return;
//       if (data.type === 'error') {
//         Alert.alert("Error", data.message);
//         return;
//       }
//       if (data.conversation_id === conversation.id && data.text) {
//         if (recentMessageIds.current.has(data._id)) return;
//         recentMessageIds.current.add(data._id);
//         setTimeout(() => recentMessageIds.current.delete(data._id), 2000);

//         let newTimestamp = new Date(data.createdAt);
//         if (messages.length > 0 && newTimestamp <= messages[messages.length-1].createdAt) {
//           newTimestamp = new Date(messages[messages.length-1].createdAt.getTime() + 1);
//         }

//         const newMsg = {
//           id: data._id,
//           createdAt: newTimestamp,
//           text: data.text,
//           image: data.image,
//           sender: data.senderId,
//           isMe: data.senderId === currentUserId,
//           translations: data.translations || {},
//           user: {
//             _id: data.senderId,
//             name: data.senderId === currentUserId ? currentUser.name : conversation.otherUser.name,
//             avatar: data.senderId === currentUserId ? currentUser.avatar : conversation.otherUser.avatar,
//           },
//         };

//         setMessages(prev => {
//           if (prev.some(msg => msg.id === newMsg.id)) return prev;
//           const newList = [...prev, newMsg];
//           setFlatData(flattenWithHeaders(newList));
//           return newList;
//         });

//         setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
//       }
//     };
//     addMessageHandler(handleIncoming);
//     return () => removeMessageHandler(handleIncoming);
//   }, [conversation.id, currentUserId, currentUser, conversation.otherUser, messages]);

//   // Scroll to bottom when near bottom and not loading older
//   useEffect(() => {
//     if (!loading && flatData.length > 0 && flatListRef.current && !loadingMore && !loadingOlderRef.current && isNearBottomRef.current) {
//       setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
//     }
//   }, [flatData, loading, loadingMore]);

//   const onScroll = (e) => {
//     const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
//     isNearBottomRef.current = contentSize.height - (contentOffset.y + layoutMeasurement.height) < 100;
//   };

//   const onViewableItemsChanged = useCallback(({ viewableItems }) => {
//     if (viewableItems && viewableItems.length > 0) {
//       const topItem = viewableItems[0];
//       if (!topItem.item) return;
//       if (topItem.item.type === 'header') setCurrentHeader(topItem.item.title);
//       else {
//         const index = topItem.index;
//         for (let i = index; i >= 0; i--) {
//           if (flatData[i] && flatData[i].type === 'header') {
//             setCurrentHeader(flatData[i].title);
//             break;
//           }
//         }
//       }
//     }
//   }, [flatData]);

//   // ---- Image and camera functions ----
//   const uploadAndSendImage = async (uri) => {
//     setUploading(true);
//     try {
//       const imageUrl = await uploadImage(uri);
//       sendMessage(conversation.otherUser.id, '', conversation.id, imageUrl);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to upload image');
//     } finally {
//       setUploading(false);
//     }
//   };
//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsMultipleSelection: true,
//       quality: 0.8,
//     });
//     if (!result.canceled && result.assets) {
//       for (const asset of result.assets) await uploadAndSendImage(asset.uri);
//     }
//   };
//   const openCamera = () => setShowCamera(true);
//   const closeCamera = () => setShowCamera(false);
//   const toggleCameraType = () => setCameraType(prev => prev === 'back' ? 'front' : 'back');
//   const onCameraReady = () => setIsCameraReady(true);
//   const takePhoto = async () => {
//     if (isSimulator || !permission?.granted) {
//       await pickImageFromLibrary();
//       return;
//     }
//     if (cameraRef.current && isCameraReady) {
//       try {
//         const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, skipProcessing: true });
//         if (photo.uri) {
//           closeCamera();
//           await uploadAndSendImage(photo.uri);
//         }
//       } catch (error) {
//         Alert.alert('Error', 'Failed to take photo');
//       }
//     } else {
//       await pickImageFromLibrary();
//     }
//   };
//   const pickImageFromLibrary = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.8,
//     });
//     if (!result.canceled && result.assets) await uploadAndSendImage(result.assets[0].uri);
//   };

//   const containsContactInfo = (text) => {
//     const patterns = [
//       /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
//       /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/,
//       /@[A-Za-z0-9_]+/,
//       /\b\d{1,5}\s\w+\s(street|st|avenue|ave|road|rd|lane|ln|drive|dr|court|ct|boulevard|blvd)\b/i
//     ];
//     return patterns.some(pattern => pattern.test(text));
//   };
//   const handleSend = () => {
//     const trimmed = text.trim();
//     if (!trimmed) return;
//     if (containsContactInfo(trimmed)) {
//       Alert.alert("Warning", "Contact information is not allowed.");
//       return;
//     }
//     sendMessage(conversation.otherUser.id, trimmed, conversation.id);
//     setText('');
//   };
//   const toggleEmojiPicker = () => {
//     setShowEmojiPicker(!showEmojiPicker);
//     if (!showEmojiPicker) Keyboard.dismiss();
//   };
//   const onEmojiSelected = (emoji) => setText(prev => prev + emoji);
//   const openImageViewer = (imageUrl, allImages = []) => {
//     let images = allImages.length ? allImages : [{ uri: imageUrl }];
//     let initialIndex = allImages.findIndex(img => img.uri === imageUrl);
//     setImagesForViewing(images);
//     setCurrentImageIndex(initialIndex >= 0 ? initialIndex : 0);
//     setImageViewerVisible(true);
//   };
//   const closeImageViewer = () => setImageViewerVisible(false);
//   const getAllImages = () => messages.filter(m => m.image).map(m => ({ uri: m.image }));
//   const shouldShowAvatar = (current, prevMessage, nextMessage) => {
//     if (current.isMe) return false;
//     if (!prevMessage || prevMessage.isMe) return true;
//     if (moment(current.createdAt).diff(moment(prevMessage.createdAt), 'minutes') > 5) return true;
//     if (!nextMessage || nextMessage.isMe) return true;
//     return false;
//   };

//   const renderItem = ({ item }) => {
//     if (!item || item.type === 'header') return null;
//     const msg = item;
//     const prevItem = null;
//     const nextItem = null;
//     const showAvatar = shouldShowAvatar(msg, prevItem, nextItem);
//     let displayText = msg.text;
//     let isTranslated = false;
//     if (!msg.isMe && msg.translations && msg.translations[language]) {
//       displayText = msg.translations[language];
//       isTranslated = true;
//     }
//     // Use plain moment as in minimal code
//     const timeString = moment(msg.createdAt).format('h:mm A');

//     return (
//       <View style={[styles.messageRow, msg.isMe ? styles.messageRowRight : styles.messageRowLeft]}>
//         {!msg.isMe && (showAvatar ? (
//           <Image source={{ uri: conversation.otherUser.avatar || 'https://via.placeholder.com/40' }} style={styles.avatar} />
//         ) : <View style={styles.avatarSpacer} />)}
//         <View style={[styles.messageContainer, msg.isMe ? styles.myMessageContainer : styles.otherMessageContainer, !showAvatar && styles.messageWithoutAvatar]}>
//           {msg.image ? (
//             <TouchableOpacity onPress={() => openImageViewer(msg.image, getAllImages())} activeOpacity={0.7}>
//               <Image source={{ uri: msg.image }} style={styles.messageImage} resizeMode="cover" />
//               <View style={styles.imageOverlay}><Ionicons name="expand" size={16} color="white" /></View>
//             </TouchableOpacity>
//           ) : (
//             <View style={[styles.messageBubble, msg.isMe ? styles.myMessageBubble : styles.otherMessageBubble]}>
//               <Text style={[styles.messageText, msg.isMe ? styles.myMessageText : styles.otherMessageText]}>
//                 {displayText}
//               </Text>
//               {isTranslated && <Text style={styles.translatedHint}>📝 Translated from {msg.text}</Text>}
//             </View>
//           )}
//           <View style={[styles.messageFooter, msg.isMe ? styles.myMessageFooter : styles.otherMessageFooter]}>
//             <Text style={[styles.messageTime, msg.isMe ? styles.myMessageTime : styles.otherMessageTime]}>
//               {timeString}
//             </Text>
//             {msg.isMe && <MaterialIcons name="done-all" size={14} color="#4CAF50" style={styles.deliveryIcon} />}
//           </View>
//         </View>
//         {msg.isMe && (showAvatar ? (
//           <Image source={{ uri: currentUser.avatar || 'https://via.placeholder.com/40' }} style={[styles.avatar, styles.myAvatar]} />
//         ) : <View style={styles.avatarSpacer} />)}
//       </View>
//     );
//   };

//   const renderMessageOptions = () => {
//     Alert.alert('Send Media', 'Choose an option', [
//       { text: 'Choose from Library', onPress: pickImage },
//       { text: 'Take Photo', onPress: openCamera },
//       { text: 'Cancel', style: 'cancel' },
//     ]);
//   };

//   const renderCameraModal = () => {
//     if (isSimulator) {
//       return (
//         <View style={styles.cameraContainer}>
//           <View style={styles.cameraHeader}>
//             <TouchableOpacity style={styles.cameraCloseButton} onPress={closeCamera}>
//               <Ionicons name="close" size={30} color="white" />
//             </TouchableOpacity>
//           </View>
//           <View style={styles.simulatorContainer}>
//             <Ionicons name="camera-off" size={64} color="white" />
//             <Text style={styles.simulatorText}>Camera not available in simulator</Text>
//             <TouchableOpacity style={styles.libraryButton} onPress={pickImageFromLibrary}>
//               <Ionicons name="images" size={24} color="white" />
//               <Text style={styles.libraryButtonText}>Pick from Library</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       );
//     }
//     if (!permission) {
//       return (
//         <View style={styles.cameraContainer}>
//           <View style={styles.permissionContainer}>
//             <ActivityIndicator size="large" color="white" />
//             <Text style={styles.permissionText}>Requesting camera permission...</Text>
//           </View>
//         </View>
//       );
//     }
//     if (!permission.granted) {
//       return (
//         <View style={styles.cameraContainer}>
//           <View style={styles.cameraHeader}>
//             <TouchableOpacity style={styles.cameraCloseButton} onPress={closeCamera}>
//               <Ionicons name="close" size={30} color="white" />
//             </TouchableOpacity>
//           </View>
//           <View style={styles.permissionContainer}>
//             <Ionicons name="camera-off" size={48} color="white" />
//             <Text style={styles.permissionText}>No access to camera</Text>
//             <TouchableOpacity style={styles.permissionButton} onPress={() => requestPermission()}>
//               <Text style={styles.permissionButtonText}>Grant Permission</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       );
//     }
//     return (
//       <View style={styles.cameraContainer}>
//         <CameraView style={styles.camera} facing={cameraType} ref={cameraRef} onCameraReady={onCameraReady}>
//           <View style={styles.cameraHeader}>
//             <TouchableOpacity style={styles.cameraCloseButton} onPress={closeCamera}>
//               <Ionicons name="close" size={30} color="white" />
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
//               <Ionicons name="camera-reverse" size={24} color="white" />
//             </TouchableOpacity>
//           </View>
//           <View style={styles.cameraControls}>
//             <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
//               <View style={styles.captureButtonOuter}>
//                 <View style={styles.captureButtonInner} />
//               </View>
//             </TouchableOpacity>
//           </View>
//         </CameraView>
//       </View>
//     );
//   };

//   if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

//   return (
//     <>
//       <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
//       <SafeAreaView style={styles.safeArea}>
//         <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
//           {currentHeader !== '' && flatData.length > 0 && (
//             <View style={styles.floatingHeader}>
//               <View style={styles.dateChip}>
//                 <Text style={styles.dateChipText}>{currentHeader}</Text>
//               </View>
//             </View>
//           )}
//           <FlatList
//             ref={flatListRef}
//             data={flatData}
//             renderItem={renderItem}
//             keyExtractor={(item, index) => {
//               if (!item) return `empty-${index}`;
//               if (item.type === 'header') return `header-${item.title}-${index}`;
//               return `msg-${item.id}-${item.createdAt.getTime()}`;
//             }}
//             contentContainerStyle={[styles.messagesList, { paddingBottom: keyboardHeight > 0 ? keyboardHeight + inputHeight + 80 : inputHeight + 20 }]}
//             showsVerticalScrollIndicator={false}
//             keyboardShouldPersistTaps="handled"
//             onScroll={onScroll}
//             onViewableItemsChanged={onViewableItemsChanged}
//             viewabilityConfig={viewabilityConfig}
//             ListHeaderComponent={
//               loadingMore ? (
//                 <View style={styles.loadingMoreContainer}>
//                   <ActivityIndicator size="small" color={COLORS.primary} />
//                   <Text style={styles.loadingMoreText}>Loading older messages...</Text>
//                 </View>
//               ) : hasMore ? (
//                 <TouchableOpacity onPress={() => fetchMessages(true)} style={styles.loadMoreButton} disabled={loadingMore}>
//                   <Text style={styles.loadMoreText}>Load Older Messages</Text>
//                 </TouchableOpacity>
//               ) : null
//             }
//           />
//           <View style={[styles.inputToolbar, { bottom: keyboardHeight }]}>
//             <TouchableOpacity style={styles.actionButton} onPress={toggleEmojiPicker}>
//               <Ionicons name={showEmojiPicker ? 'close' : 'happy'} size={26} color={showEmojiPicker ? COLORS.error : COLORS.primary} />
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionButton} onPress={renderMessageOptions}>
//               <Ionicons name="camera" size={26} color={COLORS.primary} />
//             </TouchableOpacity>
//             <View style={styles.inputContainer}>
//               <TextInput
//                 ref={textInputRef}
//                 style={[styles.textInput, { height: Math.max(44, Math.min(100, inputHeight)) }]}
//                 value={text}
//                 onChangeText={setText}
//                 placeholder="Type a message..."
//                 placeholderTextColor="#999"
//                 multiline
//                 maxLength={1000}
//                 onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
//               />
//             </View>
//             <TouchableOpacity style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]} onPress={handleSend} disabled={!text.trim()}>
//               <Ionicons name="send" size={24} color={text.trim() ? COLORS.primary : '#ccc'} />
//             </TouchableOpacity>
//           </View>
//           {showEmojiPicker && (
//             <View style={[styles.emojiPickerContainer, { bottom: keyboardHeight > 0 ? keyboardHeight + 50 : 50 }]}>
//               <EmojiSelector onEmojiSelected={onEmojiSelected} columns={8} showSearchBar showHistory showSectionTitles style={styles.emojiSelector} />
//             </View>
//           )}
//         </KeyboardAvoidingView>
//         <Modal animationType="slide" transparent={false} visible={showCamera} onRequestClose={closeCamera}>
//           {renderCameraModal()}
//         </Modal>
//         <ImageViewing
//           images={imagesForViewing}
//           imageIndex={currentImageIndex}
//           visible={imageViewerVisible}
//           onRequestClose={closeImageViewer}
//           backgroundColor="rgba(0,0,0,0.95)"
//           swipeToCloseEnabled
//           doubleTapToZoomEnabled
//           HeaderComponent={({ imageIndex }) => (
//             <View style={styles.imageViewerHeader}>
//               <Text style={styles.imageViewerText}>{imageIndex+1} / {imagesForViewing.length}</Text>
//               <TouchableOpacity onPress={closeImageViewer} style={styles.closeButton}>
//                 <Ionicons name="close" size={28} color="white" />
//               </TouchableOpacity>
//             </View>
//           )}
//         />
//         {uploading && (
//           <View style={styles.uploadingContainer}>
//             <ActivityIndicator size="large" color={COLORS.primary} />
//             <Text style={styles.uploadingText}>Uploading image...</Text>
//           </View>
//         )}
//       </SafeAreaView>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: COLORS.primary },
//   container: { flex: 1, backgroundColor: '#f0f0f0' },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
//   messagesList: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8 },
//   floatingHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, alignItems: 'center', paddingTop: 12, pointerEvents: 'none' },
//   dateChip: { backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
//   dateChipText: { fontSize: 14, fontWeight: '600', color: '#FFF', letterSpacing: 0.3 },
//   messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4 },
//   messageRowLeft: { justifyContent: 'flex-start' },
//   messageRowRight: { justifyContent: 'flex-end' },
//   avatar: { width: 32, height: 32, borderRadius: 16, marginHorizontal: 8, marginBottom: 4 },
//   myAvatar: { marginLeft: 8, marginRight: 0 },
//   avatarSpacer: { width: 32, marginHorizontal: 8 },
//   messageContainer: { maxWidth: '87%', marginBottom: 4 },
//   myMessageContainer: { alignItems: 'flex-end' },
//   otherMessageContainer: { alignItems: 'flex-start' },
//   messageWithoutAvatar: { marginLeft: 48 },
//   messageBubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, maxWidth: '100%' },
//   myMessageBubble: { backgroundColor: '#DCF8C6', borderBottomRightRadius: 4 },
//   otherMessageBubble: { backgroundColor: 'white', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
//   messageText: { fontSize: 16, lineHeight: 22 },
//   myMessageText: { color: '#000' },
//   otherMessageText: { color: '#000' },
//   messageFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 4, paddingHorizontal: 8 },
//   myMessageFooter: { justifyContent: 'flex-end' },
//   otherMessageFooter: { justifyContent: 'flex-start' },
//   messageTime: { fontSize: 11, color: '#666' },
//   myMessageTime: { color: '#666' },
//   otherMessageTime: { color: '#666' },
//   deliveryIcon: { marginLeft: 2 },
//   messageImage: { width: 200, height: 150, borderRadius: 12, overflow: 'hidden' },
//   imageOverlay: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
//   inputToolbar: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e0e0e0', paddingHorizontal: 12, paddingVertical: 10, position: 'absolute', left: 0, right: 0, minHeight: 60 },
//   inputContainer: { flex: 1, marginHorizontal: 8 },
//   textInput: { backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, maxHeight: 100, minHeight: 40 },
//   actionButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
//   sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
//   sendButtonDisabled: { opacity: 0.5 },
//   emojiPickerContainer: { position: 'absolute', left: 0, right: 0, height: 250, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
//   emojiSelector: { flex: 1 },
//   cameraContainer: { flex: 1, backgroundColor: 'black' },
//   camera: { flex: 1 },
//   cameraHeader: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 30, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
//   cameraCloseButton: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 8 },
//   flipButton: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 8 },
//   cameraControls: { position: 'absolute', bottom: 40, alignSelf: 'center' },
//   captureButton: { alignItems: 'center', justifyContent: 'center' },
//   captureButtonOuter: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'white' },
//   captureButtonInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'white' },
//   simulatorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', paddingHorizontal: 20 },
//   simulatorText: { color: 'white', fontSize: 18, fontWeight: '600', marginTop: 20, textAlign: 'center' },
//   libraryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, marginTop: 20 },
//   libraryButtonText: { color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 10 },
//   permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
//   permissionText: { color: 'white', fontSize: 16, marginTop: 16, textAlign: 'center', paddingHorizontal: 20 },
//   permissionButton: { marginTop: 20, backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
//   permissionButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
//   uploadingContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
//   uploadingText: { color: 'white', marginTop: 10, fontSize: 16 },
//   imageViewerHeader: { position: 'absolute', top: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, zIndex: 1 },
//   imageViewerText: { color: 'white', fontSize: 16, fontWeight: '600' },
//   closeButton: { padding: 5 },
//   loadingMoreContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10 },
//   loadingMoreText: { marginLeft: 8, fontSize: 12, color: '#666' },
//   loadMoreButton: { backgroundColor: '#007AFF', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, alignSelf: 'center', marginVertical: 10 },
//   loadMoreText: { color: 'white', fontWeight: '600', fontSize: 14 },
//   translatedHint: { fontSize: 10, color: '#888', marginTop: 4, fontStyle: 'italic' },
// });



import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
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
import EmojiSelector from 'react-native-emoji-selector';
import { AuthContext } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebsocketContext';
import { getMessages, markConversationRead, uploadImage } from '../../services/connection/chatApi';
import COLORS from '../../constants/colors';
import { LanguageContext } from '../../context/LanguageContext';


export default function ChatConversation({ navigation, route }) {
  const { conversation } = route.params;
  console.log('Conversation:', conversation);
  const { currentUser, currentUserId } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const { sendMessage, addMessageHandler, removeMessageHandler, isConnected } = useWebSocket();





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

  

  // Initial load
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      markConversationRead(conversation.id, currentUserId).catch(console.error);
      fetchMessages();
    }
  }, []);

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
      if (nextAppState === 'active') {
        console.log('App came to foreground');
        // Refresh messages when app comes to foreground
        fetchMessages();
      }
    });
    return () => subscription.remove();
  }, []);

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
    console.log('fetchMessages called, loadMore:', loadMore);
    
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

  // Mark as read when component mounts
  useEffect(() => {
    markConversationRead(conversation.id, currentUserId).catch(console.error);
    fetchMessages();
  }, []);

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

  // FIXED: WebSocket incoming message handler
  useEffect(() => {
    const handleIncoming = (data) => {
      console.log('📨 WebSocket message received:', data);
      
      // Skip translation updates as they're handled separately
      if (data.type === 'translation_update') return;
      
      // Handle error messages
      if (data.type === 'error') {
        Alert.alert("Error", data.message);
        return;
      }
      
      // Check if message belongs to this conversation
      // IMPORTANT: Compare conversation IDs correctly
      const messageConversationId = data.conversation_id || data.conversationId;
      
      if (messageConversationId !== conversation.id) {
        console.log('Message for different conversation, ignoring:', messageConversationId);
        return;
      }
      
      // Check for duplicate messages
      const messageId = data._id || data.id;
      if (messageId && recentMessageIds.current.has(messageId)) {
        console.log('Duplicate message detected, ignoring:', messageId);
        return;
      }
      
      // Add to recent messages set to prevent duplicates
      if (messageId) {
        recentMessageIds.current.add(messageId);
        setTimeout(() => recentMessageIds.current.delete(messageId), 2000);
      }
      
      // Check if message has content (text OR image)
      if (!data.text && !data.image) {
        console.log('Message has no content, ignoring');
        return;
      }
      
      // Create timestamp
      let newTimestamp = data.createdAt ? new Date(data.createdAt) : new Date();
      if (messages.length > 0 && newTimestamp <= messages[messages.length - 1]?.createdAt) {
        newTimestamp = new Date(messages[messages.length - 1].createdAt.getTime() + 1);
      }
      
      // Determine sender info
      const senderId = data.senderId || data.sender_id;
      const isMe = senderId === currentUserId;
      
      const newMsg = {
        id: messageId || Date.now().toString(),
        createdAt: newTimestamp,
        text: data.text || '',
        image: data.image || null,
        sender: senderId,
        isMe: isMe,
        translations: data.translations || {},
        user: {
          _id: senderId,
          name: isMe ? currentUser?.name : conversation.otherUser?.name,
          avatar: isMe ? currentUser?.avatar : conversation.otherUser?.avatar,
        },
      };
      
      console.log('✅ Adding new message to state:', newMsg);
      
      // Add message to state
      setMessages(prev => {
        // Check if message already exists
        if (prev.some(msg => msg.id === newMsg.id)) {
          console.log('Message already exists in state');
          return prev;
        }
        
        const newList = [...prev, newMsg];
        setFlatData(flattenWithHeaders(newList));
        
        // Scroll to bottom for new messages
        setTimeout(() => {
          if (flatListRef.current && isNearBottomRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
        
        return newList;
      });
    };
    
    // Register the handler
    addMessageHandler(handleIncoming);
    console.log('✅ WebSocket message handler registered');
    
    // Cleanup
    return () => {
      console.log('🧹 Cleaning up WebSocket message handler');
      removeMessageHandler(handleIncoming);
    };
  }, [conversation.id, currentUserId, currentUser, conversation.otherUser, addMessageHandler, removeMessageHandler, messages.length]);

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

  // ---- Image and camera functions ----
  const uploadAndSendImage = async (uri) => {
    setUploading(true);
    try {
      console.log('Uploading image:', uri);
      const imageUrl = await uploadImage(uri);
      console.log('Image uploaded, URL:', imageUrl);
      
      // Send message with image
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
  const toggleCameraType = () => setCameraType(prev => prev === 'back' ? 'front' : 'back');
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

  const containsContactInfo = (text) => {
    const patterns = [
      /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
      /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/,
      /@[A-Za-z0-9_]+/,
      /\b\d{1,5}\s\w+\s(street|st|avenue|ave|road|rd|lane|ln|drive|dr|court|ct|boulevard|blvd)\b/i
    ];
    return patterns.some(pattern => pattern.test(text));
  };
  
  // const handleSend = () => {
  //   const trimmed = text.trim();
  //   if (!trimmed) return;
  //   if (containsContactInfo(trimmed)) {
  //     Alert.alert("Warning", "Contact information is not allowed.");
  //     return;
  //   }
  //   console.log('Sending message:', trimmed);
  //   sendMessage(conversation.otherUser.id, trimmed, conversation.id);
  //   setText('');
  // };

  const handleSend = () => {
    const trimmed = text.trim();
    
    // Check if message is empty
    if (!trimmed) {
      return;
    }
    
    // Check for contact information
    if (containsContactInfo(trimmed)) {
      Alert.alert(
        "Warning", 
        "Contact information (email, phone, address, social media) is not allowed.",
        [{ text: "OK" }]
      );
      return;
    }
    
    // Check WebSocket connection
    if (!isConnected) {
      Alert.alert(
        "Error", 
        "Not connected to chat server. Please check your connection.",
        [{ text: "OK" }]
      );
      return;
    }
    
    // Send the message
    console.log('Sending message:', trimmed);
    const success = sendMessage(
      conversation.otherUser.id,  // recipient ID
      trimmed,                     // message text
      conversation.id,            // conversation ID
      null                        // image URL (optional)
    );
    
    // Clear the input field if message was sent successfully
    if (success) {
      setText('');
    } else {
      Alert.alert(
        "Error", 
        "Failed to send message. Please try again.",
        [{ text: "OK" }]
      );
    }
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
    const prevItem = null;
    const nextItem = null;
    const showAvatar = shouldShowAvatar(msg, prevItem, nextItem);
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

  // Add WebSocket connection status indicator
  useEffect(() => {
    console.log('WebSocket connection status:', isConnected);
  }, [isConnected]);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
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
            contentContainerStyle={[styles.messagesList, { paddingBottom: keyboardHeight > 0 ? keyboardHeight + inputHeight + 80 : inputHeight + 20 }]}
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
          />
          <View style={[styles.inputToolbar, { bottom: keyboardHeight }]}>
            <TouchableOpacity style={styles.actionButton} onPress={toggleEmojiPicker}>
              <Ionicons name={showEmojiPicker ? 'close' : 'happy'} size={26} color={showEmojiPicker ? COLORS.error : COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={renderMessageOptions}>
              <Ionicons name="camera" size={26} color={COLORS.primary} />
            </TouchableOpacity>
            {/* // Add this to your render */}
            

            {__DEV__ && !isConnected && (
              <View style={styles.connectionWarning}>
                <Ionicons name="warning" size={16} color="#fff" />
                <Text style={styles.connectionWarningText}>
                  Debug: Reconnecting to chat...
                </Text>
              </View>
            )}
            <View style={styles.inputContainer}>
              <TextInput
                ref={textInputRef}
                style={[styles.textInput, { height: Math.max(44, Math.min(100, inputHeight)) }]}
                value={text}
                onChangeText={setText}
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
          {showEmojiPicker && (
            <View style={[styles.emojiPickerContainer, { bottom: keyboardHeight > 0 ? keyboardHeight + 50 : 50 }]}>
              <EmojiSelector onEmojiSelected={onEmojiSelected} columns={8} showSearchBar showHistory showSectionTitles style={styles.emojiSelector} />
            </View>
          )}
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
              <Text style={styles.imageViewerText}>{imageIndex+1} / {imagesForViewing.length}</Text>
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
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
  messagesList: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8 },
  floatingHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, alignItems: 'center', paddingTop: 12, pointerEvents: 'none' },
  dateChip: { backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  dateChipText: { fontSize: 14, fontWeight: '600', color: '#FFF', letterSpacing: 0.3 },
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
  inputToolbar: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e0e0e0', paddingHorizontal: 12, paddingVertical: 10, position: 'absolute', left: 0, right: 0, minHeight: 60 },
  inputContainer: { flex: 1, marginHorizontal: 8 },
  textInput: { backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, maxHeight: 100, minHeight: 40 },
  actionButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendButtonDisabled: { opacity: 0.5 },
  emojiPickerContainer: { position: 'absolute', left: 0, right: 0, height: 250, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  emojiSelector: { flex: 1 },
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

  connectionWarning: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ff9800',
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  connectionWarningText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 12,
  },
});