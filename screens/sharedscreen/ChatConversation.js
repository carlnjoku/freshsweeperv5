// import {getDatabase, get, set, push, ref, onValue, off, orderByKey, update} from 'firebase/database';
// import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
// import { 
//   SafeAreaView, 
//   StyleSheet, 
//   Pressable, 
//   StatusBar, 
//   Platform, 
//   Linking, 
//   ScrollView, 
//   Modal, 
//   Image, 
//   Text, 
//   View, 
//   TouchableOpacity, 
//   ActivityIndicator, 
//   Alert, 
//   Keyboard, 
//   KeyboardAvoidingView,
//   Dimensions
// } from 'react-native';
// import COLORS from '../../constants/colors';
// import { GiftedChat, SystemMessage, Send, Bubble, Avatar, MessageText, InputToolbar, Composer, Actions } from 'react-native-gifted-chat';
// import moment from 'moment';
// import ROUTES from '../../constants/routes';
// import { Ionicons } from '@expo/vector-icons';
// import { AuthContext } from '../../context/AuthContext';
// import * as ImagePicker from 'expo-image-picker';
// import userService from '../../services/connection/userService';
// import EmojiSelector from 'react-native-emoji-selector';
// import ImageViewing from 'react-native-image-viewing';
// import { useFocusEffect } from '@react-navigation/native';

// export default function ChatConversation({navigation, route}) {
//     const PAGE_SIZE = 20;
//     const {updateMessageList} = useContext(AuthContext);
//     const {currentUser, currentUserId} = useContext(AuthContext);
//     const {fbaseUser, selectedUser, schedule, friendIndex} = route.params;

//     const [keyboardOpen, setKeyboardOpen] = useState(false);
//     const [keyboardHeight, setKeyboardHeight] = useState(0);
//     const [messages, setMessages] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [page, setPage] = useState(1);
//     const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [selectedUserExpoToken, setSelectedUserExpoToken] = useState("");
//     const [uploading, setUploading] = useState(false);
//     const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//     const [text, setText] = useState('');
//     const [imageViewerVisible, setImageViewerVisible] = useState(false);
//     const [currentImageIndex, setCurrentImageIndex] = useState(0);
//     const [imagesForViewing, setImagesForViewing] = useState([]);
//     const [inputHeight, setInputHeight] = useState(44);

//     const giftedChatRef = useRef(null);
//     const database = getDatabase();
//     const storage = getStorage();
//     const scrollViewRef = useRef(null);

//     useEffect(() => {
//         const showSubscription = Keyboard.addListener('keyboardWillShow', (e) => {
//             setKeyboardHeight(e.endCoordinates.height);
//             setKeyboardOpen(true);
//         });
//         const hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
//             setKeyboardHeight(0);
//             setKeyboardOpen(false);
//         });

//         return () => {
//             showSubscription.remove();
//             hideSubscription.remove();
//         };
//     }, []);

//     useFocusEffect(
//       useCallback(() => {
//         StatusBar.setBarStyle('light-content');
//         if (Platform.OS === 'android') {
//           StatusBar.setBackgroundColor(COLORS.primary);
//         }
//       }, [])
//     );

//     // Request permissions when component mounts
//     useEffect(() => {
//         (async () => {
//             const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//             if (status !== 'granted') {
//                 Alert.alert('Sorry, we need camera roll permissions to make this work!');
//             }
//         })();
//     }, []);

//     const uploadImageAsync = async (uri) => {
//         const blob = await new Promise((resolve, reject) => {
//             const xhr = new XMLHttpRequest();
//             xhr.onload = function() {
//                 resolve(xhr.response);
//             };
//             xhr.onerror = function(e) {
//                 console.log(e);
//                 reject(new TypeError('Network request failed'));
//             };
//             xhr.responseType = 'blob';
//             xhr.open('GET', uri, true);
//             xhr.send(null);
//         });

//         const fileRef = storageRef(storage, `chat_images/${selectedUser.chatroomId}/${Date.now()}`);

//         await uploadBytes(fileRef, blob);

//         blob.close();

//         return await getDownloadURL(fileRef);
//     };

//     // Emoji Picker Functions
//     const toggleEmojiPicker = () => {
//         setShowEmojiPicker(!showEmojiPicker);
//         if (!showEmojiPicker) {
//             Keyboard.dismiss();
//         }
//     };

//     const onEmojiSelected = (emoji) => {
//         setText(prevText => prevText + emoji);
//     };

//     // Image Viewer Functions
//     const openImageViewer = (imageUrl, imageArray = []) => {
//         let images = imageArray;
//         let initialIndex = 0;
        
//         if (imageArray.length === 0) {
//             images = [{ uri: imageUrl }];
//         } else {
//             initialIndex = imageArray.findIndex(img => img.uri === imageUrl);
//             if (initialIndex === -1) initialIndex = 0;
//         }
        
//         setImagesForViewing(images);
//         setCurrentImageIndex(initialIndex);
//         setImageViewerVisible(true);
//     };

//     const closeImageViewer = () => {
//         setImageViewerVisible(false);
//         setImagesForViewing([]);
//         setCurrentImageIndex(0);
//     };

//     // Get all images from messages for gallery view
//     const getAllImagesFromMessages = () => {
//         return messages
//             .filter(message => message.image)
//             .map(message => ({ uri: message.image }));
//     };

//     const pickImage = async () => {
//       try {
//         let result = await ImagePicker.launchImageLibraryAsync({
//             mediaTypes: ImagePicker.MediaTypeOptions.Images,
//             allowsEditing: false,
//             allowsMultipleSelection: true,
//             aspect: [4, 3],
//             quality: 0.8,
//         });

//         if (!result.canceled && result.assets) {
//             setUploading(true);
//             try {
//                 const uploadPromises = result.assets.map(asset => uploadImageAsync(asset.uri));
//                 const imageUrls = await Promise.all(uploadPromises);
                
//                 const imageMessages = imageUrls.map((imageUrl, index) => ({
//                     _id: Math.random().toString(36).substring(7) + index,
//                     createdAt: new Date(),
//                     user: {
//                         _id: fbaseUser.userId,
//                         name: fbaseUser.firstname,
//                         avatar: fbaseUser.avatar,
//                     },
//                     image: imageUrl,
//                 }));
                
//                 onSend(imageMessages);
//             } catch (error) {
//                 console.log('Error uploading images:', error);
//                 Alert.alert('Error', 'Failed to upload images');
//             } finally {
//                 setUploading(false);
//             }
//         }
//       } catch (error) {
//           console.log('Error picking images:', error);
//           Alert.alert('Error', 'Failed to pick images');
//           setUploading(false);
//       }
//     };

//     const takePhoto = async () => {
//         try {
//             const { status } = await ImagePicker.requestCameraPermissionsAsync();
//             if (status !== 'granted') {
//                 Alert.alert('Sorry, we need camera permissions to take photos!');
//                 return;
//             }

//             let result = await ImagePicker.launchCameraAsync({
//                 allowsEditing: true,
//                 aspect: [4, 3],
//                 quality: 0.8,
//             });

//             if (!result.canceled && result.assets && result.assets[0]) {
//                 const imageUri = result.assets[0].uri;
//                 setUploading(true);
//                 try {
//                     const imageUrl = await uploadImageAsync(imageUri);
//                     const imageMessage = {
//                         _id: Math.random().toString(36).substring(7),
//                         createdAt: new Date(),
//                         user: {
//                             _id: fbaseUser.userId,
//                             name: fbaseUser.firstname,
//                             avatar: fbaseUser.avatar,
//                         },
//                         image: imageUrl,
//                     };
//                     onSend([imageMessage]);
//                 } catch (error) {
//                     console.log('Error uploading image:', error);
//                     Alert.alert('Error', 'Failed to upload image');
//                 } finally {
//                     setUploading(false);
//                 }
//             }
//         } catch (error) {
//             console.log('Error taking photo:', error);
//             Alert.alert('Error', 'Failed to take photo');
//             setUploading(false);
//         }
//     };

//     const fetchMessages = useCallback(async () => {
//         const snapshot = await get(
//             ref(database, `chatrooms/${selectedUser.chatroomId}`),
//         );
//         return snapshot.val();
//     }, [selectedUser.chatroomId]);

//     const renderMessages = useCallback((msgs) => {
//         return msgs
//             ? msgs.reverse().map((msg, index) => {
//                 return {
//                     ...msg,
//                     _id: index,
//                     user: {
//                         _id: msg.sender === fbaseUser.userId ? fbaseUser.firstname : selectedUser.firstname,
//                         avatar: msg.sender === fbaseUser.userId ? fbaseUser.avatar : selectedUser.avatar,
//                         name: msg.sender === fbaseUser.userId ? fbaseUser.userId : selectedUser.userId,
//                     },
//                     sent: msg.sender === fbaseUser.userId,
//                 };
//             })
//             : [];
//     }, [fbaseUser.userId, fbaseUser.firstname, fbaseUser.avatar, selectedUser.firstname, selectedUser.avatar, selectedUser.userId]);

//     const renderMessageImage = (props) => {
//       const { currentMessage } = props;
      
//       return (
//           <TouchableOpacity 
//             style={styles.imageContainer}
//             onPress={() => openImageViewer(currentMessage.image, getAllImagesFromMessages())}
//             activeOpacity={0.7}
//           >
//               <Image
//                   source={{ uri: currentMessage.image }}
//                   style={styles.chatImage}
//                   resizeMode="cover"
//               />
//               <View style={styles.zoomIndicator}>
//                   <Ionicons name="expand" size={16} color="white" />
//               </View>
//           </TouchableOpacity>
//       );
//     };

//     useEffect(() => {
//         const loadData = async () => {
//             const myChatroom = await fetchMessages();
//             setMessages(renderMessages(myChatroom.messages));

//             resetUnreadCount({
//                 chatroomId: selectedUser.chatroomId,
//                 userId: fbaseUser.userId || "",
//                 friendId: selectedUser.userId,
//             });
//         };

//         loadData();

//         const chatroomRef = ref(database, `chatrooms/${selectedUser.chatroomId}`);

//         const unsubscribe = onValue(chatroomRef, (snapshot) => {
//             const data = snapshot.val();
//             if (data && data.messages) {
//                 const messages = Object.values(data.messages);
//                 const sortedMessages = messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//                 const lastMessage = sortedMessages[0];
//                 setMessages(renderMessages(data.messages));
//                 console.log("Last Message:", lastMessage);
//             }
//             fetchUser();
//         });

//         return () => {
//             off(chatroomRef);
//         };
//     }, [fetchMessages, renderMessages, selectedUser.chatroomId, fbaseUser.userId, selectedUser.userId]);

//     const incrementUnreadCount = (chatroomId, userId, friendId) => {
//         const unreadRef = ref(database, `unreadMessages/${chatroomId}/${friendId}/${userId}`);

//         get(unreadRef)
//             .then((snapshot) => {
//                 const currentCount = snapshot.val() || 0;
//                 const newCount = currentCount + 1;
//                 return set(unreadRef, newCount);
//             })
//             .then(() => {
//                 console.log("Unread count incremented successfully!");
//             })
//             .catch((error) => {
//                 console.error("Error incrementing unread count:", error);
//             });
//     };

//     const resetUnreadCount = (chatroomId, userId, friendId) => {
//         const unreadRef = ref(database, `unreadMessages/${chatroomId}/${userId}/${friendId}`);
//         set(unreadRef, 0)
//             .then(() => {
//                 console.log("Unread count reset to zero successfully!");
//             })
//             .catch((error) => {
//                 console.error("Error resetting unread count:", error);
//             });
//     };

//     const fetchUser = async () => {
//         try {
//             await userService.getUser(selectedUser.userId).then((response) => {
//                 const res = response.data;
//                 setSelectedUserExpoToken(res.expo_push_token);
//             });
//         } catch (e) {
//             console.log(e);
//         }
//     };

//     const onSend = useCallback(async (msg = []) => {
//         const currentChatroom = await fetchMessages();
//         const lastMessages = currentChatroom.messages || [];

//         const messageData = {
//             sender: fbaseUser.userId,
//             createdAt: new Date(),
//         };

//         if (msg[0].text) {
//             messageData.text = msg[0].text;
//         }

//         if (msg[0].image) {
//             messageData.image = msg[0].image;
//         }

//         update(ref(database, `chatrooms/${selectedUser.chatroomId}`), {
//             messages: [
//                 ...lastMessages,
//                 messageData,
//             ],
//         });

//         const lastMessageText = msg[0].text ? msg[0].text : (msg[0].image ? "📷 Sent an image" : "Sent a message");
        
//         const friendRef = ref(database, `users/${selectedUser.userId}/friends/${friendIndex}`);
//         update(friendRef, {
//             lastmessage: {
//                 text: lastMessageText,
//                 createdAt: new Date()
//             },
//             unreadCount: 0,
//         })
//         .then(() => console.log("Last message updated successfully"))
//         .catch((error) => console.error("Error updating last message:", error));

//         const friendRefCurrentUser = ref(database, `users/${fbaseUser.userId}/friends/${friendIndex}`);
//         update(friendRefCurrentUser, {
//             lastmessage: {
//                 text: lastMessageText,
//                 createdAt: new Date()
//             },
//             unreadCount: 0,
//         })
//         .then(() => console.log("Last message updated successfully"))
//         .catch((error) => console.error("Error updating last message:", error));

//         incrementUnreadCount(selectedUser.chatroomId, fbaseUser.userId, selectedUser.userId);
//         updateMessageList(selectedUser.userId);
//         setMessages(prevMessages => GiftedChat.append(prevMessages, msg));

//         setText('');

//         const sendExpoPushNotification = async (expoPushToken, title, body, data = {}) => {
//             try {
//                 const response = await fetch('https://exp.host/--/api/v2/push/send', {
//                     method: 'POST',
//                     headers: {
//                         'Accept': 'application/json',
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({
//                         to: expoPushToken,
//                         title,
//                         body,
//                         data,
//                     }),
//                 });
//                 const result = await response.json();
//                 console.log("Push notification response:", result);
//             } catch (error) {
//                 console.error("Error sending push notification:", error);
//             }
//         };

//         const notificationBody = msg[0].text ? msg[0].text : "📷 Sent an image";
//         sendExpoPushNotification(
//             selectedUserExpoToken,
//             currentUser.firstname + " " + currentUser.lastname,
//             notificationBody,
//             {
//                 screen: ROUTES.host_messages,
//                 params: {
//                     selectedUser: selectedUser,
//                     fbaseUser: fbaseUser,
//                     schedule: schedule,
//                     friendIndex: friendIndex
//                 },
//             }
//         );
//     }, [fetchMessages, fbaseUser.userId, selectedUser.chatroomId, selectedUser.userId, friendIndex, updateMessageList, selectedUserExpoToken, currentUser.firstname, currentUser.lastname, schedule]);

//     const renderActions = (props) => {
//       return (
//           <Actions
//               {...props}
//               containerStyle={styles.actionsContainer}
//               icon={() => (
//                   <View style={styles.cameraButton}>
//                       <Ionicons name="camera" size={24} color={COLORS.primary} />
//                   </View>
//               )}
//               options={{
//                   'Choose From Library': pickImage,
//                   'Take Photo': takePhoto,
//                   'Cancel': () => {},
//               }}
//               optionTintColor={COLORS.primary}
//           />
//       );
//     };

//     const CustomBubble = (props) => {
//         const { position, currentMessage } = props;
//         const isSent = position === 'right';

//         return (
//             <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: '100%' }}>
//                 <Bubble
//                     {...props}
//                     wrapperStyle={{
//                         right: {
//                             backgroundColor: '#DCF8C6',
//                             flexDirection: 'row',
//                         },
//                         left: {
//                             backgroundColor: '#FFFFFF',
//                             flexDirection: 'row',
//                         },
//                     }}
//                 >
//                     <View style={{ marginLeft: 5, alignSelf: 'flex-end' }}>
//                         <Ionicons name="checkmark-done" size={20} color="green" />
//                     </View>
//                 </Bubble>
//             </View>
//         );
//     };

//     // Custom Composer
//     const renderComposer = (props) => {
//         return (
//             <Composer
//                 {...props}
//                 text={text}
//                 onTextChanged={setText}
//                 textInputStyle={styles.composer}
//                 placeholder="Type a message..."
//                 multiline={true}
//                 onContentSizeChange={(e) => {
//                     setInputHeight(Math.max(44, Math.min(100, e.nativeEvent.contentSize.height)));
//                 }}
//             />
//         );
//     };

//     const renderCustomMessage = ({ currentMessage }) => {
//         if (currentMessage.system) {
//             return (
//                 <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
//                     <Image source={require('../../assets/images/logo.png')} style={styles.avatar} />
//                     <View style={styles.automated}>
//                         <Text bold style={{ fontSize: 16, fontWeight: '500' }}>Freshsweeper</Text>
//                         <Text style={{ fontStyle: 'italic', color: '#777', marginLeft: 0 }}>
//                             {currentMessage.text}
//                         </Text>
//                         {currentMessage.status === 'payment_completed' &&
//                             <View>
//                                 <View style={styles.details}>
//                                     <Text style={{ fontSize: 14, fontWeight: '600' }}>{currentMessage.details.selected_schedule.apartment_name}</Text>
//                                     <Text style={{ fontSize: 12 }}>{currentMessage.details.selected_schedule.address}</Text>
//                                     <Text style={{ fontSize: 12, color: COLORS.gray }}>{currentMessage.details.selected_schedule.cleaning_date} @ {currentMessage.details.selected_schedule.cleaning_time}</Text>
//                                     <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
//                                         <Text style={{ fontSize: 16 }}>Cleaning Fees:</Text>
//                                         <Text style={{ fontSize: 16, fontWeight: '600' }}>${currentMessage.cleaning_fee}</Text>
//                                     </View>
//                                 </View>
//                                 {schedule.userId !== currentMessage.details?.cleanerId ?
//                                     <>
//                                         <View>
//                                             <Text style={{ color: COLORS.gray, fontStyle: 'italic' }}>
//                                                 The cleaner has been notified and will arrive as scheduled. If you need to communicate any specific details, feel free to chat here. Thank you for using Freshsweeper
//                                             </Text>
//                                         </View>
//                                         <TouchableOpacity
//                                             style={styles.button}
//                                             onPress={() => navigation.navigate(ROUTES.host_schedule_details, {
//                                                 scheduleId: currentMessage.details.selected_scheduleId,
//                                                 item: currentMessage.details,
//                                                 chatroomId: selectedUser.chatroomId,
//                                             })}
//                                         >
//                                             <Text style={styles.button_text}>View Details</Text>
//                                         </TouchableOpacity>
//                                     </>
//                                     :
//                                     <TouchableOpacity
//                                         style={styles.button}
//                                         onPress={() => navigation.navigate(ROUTES.cleaner_schedule_details_view, {
//                                             item: currentMessage.details,
//                                             chatroomId: selectedUser.chatroomId,
//                                             scheduleId: currentMessage.details.selected_scheduleId
//                                         })}
//                                     >
//                                         <Text style={styles.button_text}>View Details</Text>
//                                     </TouchableOpacity>
//                                 }
//                                 <Text style={{ fontSize: 10, color: COLORS.light_gray }}>{moment(currentMessage.createdAt).format('h:mm A')}</Text>
//                             </View>
//                         }
//                         {currentMessage.status === 'Accepted' &&
//                             <View>
//                                 <View style={styles.details}>
//                                     <Text style={{ fontSize: 14, fontWeight: '600' }}>{currentMessage.details.selected_schedule.apartment_name}</Text>
//                                     <Text>{currentMessage.details.selected_schedule.address}</Text>
//                                     <Text style={{ fontSize: 12, color: COLORS.gray }}>{currentMessage.details.selected_schedule.cleaning_date} @ {currentMessage.details.selected_schedule.cleaning_time}</Text>
//                                     <Text style={{ fontSize: 16 }}>$ {currentMessage.details.selected_schedule.total_cleaning_fee}</Text>
//                                 </View>
//                                 <TouchableOpacity
//                                     style={styles.button}
//                                     onPress={() => navigation.navigate(ROUTES.host_confirm, {
//                                         item: currentMessage.details,
//                                         chatroomId: selectedUser.chatroomId,
//                                         selectedUser: selectedUser,
//                                         selectedSchedule: currentMessage.details.selected_schedule,
//                                         totalPrice: currentMessage.details.selected_schedule.totalPrice,
//                                         selected_scheduleId: currentMessage.details.selected_scheduleId,
//                                         assigned_to: currentMessage.details.assigned_to
//                                     })}
//                                 >
//                                     <Text style={styles.button_text}>Confirm</Text>
//                                 </TouchableOpacity>
//                                 <Text style={{ fontSize: 10, color: COLORS.light_gray }}>{moment(currentMessage.createdAt).format('h:mm A')}</Text>
//                             </View>
//                         }
//                     </View>
//                 </View>
//             );
//         } else {
//             return (
//                 <GiftedChat.Message
//                     {...currentMessage}
//                 />
//             );
//         }
//     };

//     const renderSend = (props) => {
//         return (
//             <Send {...props} text={text}>
//                 <View style={styles.sendButton}>
//                     <Ionicons name="send" size={24} color={COLORS.primary} />
//                 </View>
//             </Send>
//         );
//     };

//     const renderInputToolbar = (props) => {
//         return (
//             <View>
//                 <InputToolbar
//                     {...props}
//                     containerStyle={[
//                         styles.inputToolbar,
//                         showEmojiPicker && styles.inputToolbarWithEmoji
//                     ]}
//                     primaryStyle={styles.inputPrimary}
//                 />
//                 {showEmojiPicker && (
//                     <EmojiSelector
//                         onEmojiSelected={onEmojiSelected}
//                         visible={showEmojiPicker}
//                         columns={8}
//                         showSearchBar={true}
//                         showHistory={true}
//                         showSectionTitles={true}
//                         category="all"
//                         style={styles.emojiSelector}
//                     />
//                 )}
//             </View>
//         );
//     };

//     return (
//         <>
//             <StatusBar
//                 barStyle="light-content"
//                 backgroundColor={COLORS.primary}
//                 translucent={false}
//             />
//             <SafeAreaView style={styles.safeArea} edges={['top']}>
//                 <View style={styles.container}>
//                     <GiftedChat
//                         ref={giftedChatRef}
//                         key={selectedUser.chatroomId}
//                         messages={messages}
//                         onSend={newMessage => onSend(newMessage)}
//                         user={{
//                             _id: fbaseUser.userId,
//                         }}
//                         text={text}
//                         onInputTextChanged={setText}
//                         renderSend={renderSend}
//                         renderActions={renderActions}
//                         renderComposer={renderComposer}
//                         renderSystemMessage={renderCustomMessage}
//                         renderMessageImage={renderMessageImage}
//                         renderBubble={props => <CustomBubble {...props} />}
//                         renderInputToolbar={renderInputToolbar}
//                         inverted={true}
//                         minInputToolbarHeight={inputHeight}
//                         bottomOffset={0}
//                         animateTextInput={false}
//                         isLoadingEarlier={false}
//                         alwaysShowSend={true}
//                         keyboardShouldPersistTaps="handled"
//                         isKeyboardInternallyHandled={false} // CRITICAL: Set to false
//                         listViewProps={{
//                             style: { 
//                                 flex: 1,
//                                 backgroundColor: '#f5f5f5',
//                             },
//                             contentContainerStyle: {
//                                 flexGrow: 1,
//                                 justifyContent: 'flex-end',
//                                 paddingBottom: keyboardHeight > 0 ? keyboardHeight + inputHeight : inputHeight + 20,
//                             }
//                         }}
//                         scrollToBottom
//                         scrollToBottomOffset={300}
//                         scrollToBottomComponent={() => (
//                             <Ionicons name="chevron-down" size={24} color={COLORS.primary} />
//                         )}
//                         placeholder="Type a message..."
//                         minComposerHeight={inputHeight}
//                         maxComposerHeight={100}
//                     />
                    
//                     {/* Fixed Input Container (alternative approach) */}
//                     {Platform.OS === 'ios' && (
//                         <View style={[styles.fixedInputContainer, { bottom: keyboardHeight }]}>
//                             {/* This is a backup - usually not needed but helps in extreme cases */}
//                         </View>
//                     )}
//                 </View>
                
//                 {/* Image Viewer Modal */}
//                 <ImageViewing
//                     images={imagesForViewing}
//                     imageIndex={currentImageIndex}
//                     visible={imageViewerVisible}
//                     onRequestClose={closeImageViewer}
//                     backgroundColor="rgba(0, 0, 0, 0.95)"
//                     swipeToCloseEnabled={true}
//                     doubleTapToZoomEnabled={true}
//                     HeaderComponent={({ imageIndex }) => (
//                         <View style={styles.imageViewerHeader}>
//                             <Text style={styles.imageViewerText}>
//                                 {imageIndex + 1} / {imagesForViewing.length}
//                             </Text>
//                             <TouchableOpacity onPress={closeImageViewer} style={styles.closeButton}>
//                                 <Ionicons name="close" size={28} color="white" />
//                             </TouchableOpacity>
//                         </View>
//                     )}
//                 />

//                 {uploading && (
//                     <View style={styles.uploadingContainer}>
//                         <ActivityIndicator size="large" color={COLORS.primary} />
//                         <Text style={styles.uploadingText}>Uploading image...</Text>
//                     </View>
//                 )}
//             </SafeAreaView>
//         </>
//     );
// }

// const styles = StyleSheet.create({
//     safeArea: {
//         flex: 1,
//         backgroundColor: COLORS.primary,
//     },
//     container: {
//         flex: 1,
//         backgroundColor: '#f5f5f5',
//     },
//     fixedInputContainer: {
//         position: 'absolute',
//         left: 0,
//         right: 0,
//         backgroundColor: 'transparent',
//         height: 50,
//     },
//     actionBar: {
//         backgroundColor: '#cacaca',
//         height: 41,
//         width: '100%',
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     avatar: {
//         width: 36,
//         height: 36,
//         borderRadius: 18,
//         marginLeft: 6
//     },
//     automated: {
//         width: '80%',
//         padding: 10,
//         backgroundColor: COLORS.white,
//         marginLeft: 10,
//         borderTopRightRadius: 10,
//         borderBottomRightRadius: 10,
//         borderBottomLeftRadius: 3,
//         borderTopLeftRadius: 3,
//         marginBottom: 2
//     },
//     button: {
//         borderRadius: 50,
//         paddingVertical: 10,
//         backgroundColor: COLORS.primary,
//         paddingHorizontal: 10,
//         marginVertical: 20
//     },
//     button_text: {
//         color: COLORS.white,
//         fontSize: 16,
//         textAlign: 'center'
//     },
//     details: {
//         marginVertical: 10,
//         backgroundColor: COLORS.primary_light_1,
//         padding: 20,
//         borderRadius: 5
//     },
//     inputToolbar: {
//         borderTopWidth: 1,
//         borderTopColor: '#e0e0e0',
//         backgroundColor: 'white',
//         paddingHorizontal: 8,
//         paddingBottom: Platform.OS === 'ios' ? 4 : 0,
//         minHeight: 44,
//         marginBottom: 0,
//     },
//     inputToolbarWithEmoji: {
//         borderTopWidth: 0,
//         marginBottom: 0,
//     },
//     inputPrimary: {
//         alignItems: 'center',
//         minHeight: 44,
//     },
//     actionsContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         height: 44,
//         paddingBottom: Platform.OS === 'ios' ? 4 : 0,
//     },
//     cameraButton: {
//         padding: 8,
//     },
//     composer: {
//         borderWidth: 1,
//         borderColor: '#e0e0e0',
//         borderRadius: 20,
//         paddingHorizontal: 12,
//         paddingVertical: Platform.OS === 'ios' ? 8 : 6,
//         marginHorizontal: 5,
//         maxHeight: 100,
//         minHeight: 36,
//         fontSize: 16,
//         lineHeight: 20,
//         backgroundColor: 'white',
//     },
//     sendButton: {
//         height: 44,
//         justifyContent: 'center',
//         paddingHorizontal: 8,
//         paddingBottom: Platform.OS === 'ios' ? 4 : 0,
//     },
//     emojiSelector: {
//         height: 250,
//         backgroundColor: '#f0f0f0',
//     },
//     uploadingContainer: {
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         backgroundColor: 'rgba(0,0,0,0.7)',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     uploadingText: {
//         color: 'white',
//         marginTop: 10,
//         fontSize: 16,
//     },
//     imageContainer: {
//       margin: 3,
//       borderRadius: 10,
//       overflow: 'hidden',
//       position: 'relative',
//     },
//     chatImage: {
//       width: 200,
//       height: 150,
//       borderRadius: 10,
//     },
//     zoomIndicator: {
//         position: 'absolute',
//         top: 8,
//         right: 8,
//         backgroundColor: 'rgba(0, 0, 0, 0.5)',
//         borderRadius: 12,
//         width: 24,
//         height: 24,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     imageViewerHeader: {
//         position: 'absolute',
//         top: 40,
//         left: 0,
//         right: 0,
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingHorizontal: 20,
//         paddingVertical: 10,
//         zIndex: 1,
//     },
//     imageViewerText: {
//         color: 'white',
//         fontSize: 16,
//         fontWeight: '600',
//     },
//     closeButton: {
//         padding: 5,
//     },
// });



import {getDatabase, get, set, push, ref, onValue, off, orderByKey, update} from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import { 
  SafeAreaView, 
  StyleSheet, 
  Pressable, 
  StatusBar, 
  Platform, 
  Linking, 
  ScrollView, 
  Modal, 
  Image, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Keyboard, 
  KeyboardAvoidingView,
  TextInput,
  FlatList,
  Dimensions,
  SectionList
} from 'react-native';
import COLORS from '../../constants/colors';
import moment from 'moment';
import ROUTES from '../../constants/routes';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera'; // UPDATED: Use CameraView instead of Camera
import userService from '../../services/connection/userService';
import EmojiSelector from 'react-native-emoji-selector';
import ImageViewing from 'react-native-image-viewing';
import { useFocusEffect } from '@react-navigation/native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ChatConversation({navigation, route}) {
    const {updateMessageList} = useContext(AuthContext);
    const {currentUser, currentUserId} = useContext(AuthContext);
    const {fbaseUser, selectedUser, schedule, friendIndex} = route.params;

    const [messages, setMessages] = useState([]);
    const [groupedMessages, setGroupedMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUserExpoToken, setSelectedUserExpoToken] = useState("");
    const [uploading, setUploading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [text, setText] = useState('');
    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imagesForViewing, setImagesForViewing] = useState([]);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [inputHeight, setInputHeight] = useState(44);
    
    // Camera states - use the same pattern as ReportIncident
    const [showCamera, setShowCamera] = useState(false);
    const [cameraType, setCameraType] = useState('back'); // Use string 'back' or 'front'
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [permission, requestPermission] = useCameraPermissions(); // Use hook for permissions
    const [isSimulator, setIsSimulator] = useState(false);

    const sectionListRef = useRef(null);
    const textInputRef = useRef(null);
    const cameraRef = useRef(null);
    const database = getDatabase();
    const storage = getStorage();

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardWillShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height);
            scrollToBottom();
        });
        const hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    useEffect(() => {
        // Check if we're likely on a simulator
        if (Platform.OS === 'ios') {
            // This is a common check for simulator
            const checkSimulator = async () => {
                try {
                    // Try to access camera - if it fails, we might be on simulator
                    if (permission?.granted) {
                        setIsSimulator(false);
                    }
                } catch (error) {
                    setIsSimulator(true);
                }
            };
            checkSimulator();
        }
    }, [permission]);

    useEffect(() => {
        // Group messages by date whenever messages change
        groupMessagesByDate();
    }, [messages]);

    useFocusEffect(
      useCallback(() => {
        StatusBar.setBarStyle('light-content');
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor(COLORS.primary);
        }
      }, [])
    );

    // Request permissions when component mounts
    useEffect(() => {
        (async () => {
            // Request camera roll permissions for library
            const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (libraryStatus !== 'granted') {
                Alert.alert('Sorry, we need camera roll permissions to make this work!');
            }
            
            // Request camera permissions using the hook
            if (permission && !permission.granted) {
                await requestPermission();
            }
        })();
    }, [permission, requestPermission]);



    const scrollToBottom = () => {
        if (sectionListRef.current && groupedMessages.length > 0) {
            const lastSection = groupedMessages[groupedMessages.length - 1];
            const lastItemIndex = lastSection.data.length - 1;
            
            // Use setTimeout to ensure the list is ready
            setTimeout(() => {
                sectionListRef.current?.scrollToLocation({
                    sectionIndex: groupedMessages.length - 1,
                    itemIndex: lastItemIndex,
                    animated: true,
                    viewPosition: 0, // 0 = top, 0.5 = middle, 1 = bottom
                    viewOffset: 0
                });
            }, 100);
        }
    };

    const groupMessagesByDate = () => {
        if (!messages || messages.length === 0) {
            setGroupedMessages([]);
            return;
        }

        // Sort messages by date (oldest first)
        const sortedMessages = [...messages].sort((a, b) => 
            new Date(a.createdAt) - new Date(b.createdAt)
        );

        const grouped = {};
        
        sortedMessages.forEach(message => {
            const date = moment(message.createdAt).format('YYYY-MM-DD');
            const displayDate = getDisplayDate(message.createdAt);
            
            if (!grouped[displayDate]) {
                grouped[displayDate] = {
                    title: displayDate,
                    data: [],
                    rawDate: date
                };
            }
            
            grouped[displayDate].data.push(message);
        });

        // Convert to array and sort by date
        const sections = Object.values(grouped).sort((a, b) => 
            new Date(a.rawDate) - new Date(b.rawDate)
        );

        setGroupedMessages(sections);
    };

    const getDisplayDate = (date) => {
        const messageDate = moment(date);
        const today = moment().startOf('day');
        const yesterday = moment().subtract(1, 'days').startOf('day');
        
        if (messageDate.isSame(today, 'day')) {
            return 'Today';
        } else if (messageDate.isSame(yesterday, 'day')) {
            return 'Yesterday';
        } else if (messageDate.isSame(moment(), 'week')) {
            return messageDate.format('dddd');
        } else {
            return messageDate.format('MMMM D, YYYY');
        }
    };

    const uploadImageAsync = async (uri) => {
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function() {
                resolve(xhr.response);
            };
            xhr.onerror = function(e) {
                console.log(e);
                reject(new TypeError('Network request failed'));
            };
            xhr.responseType = 'blob';
            xhr.open('GET', uri, true);
            xhr.send(null);
        });

        const fileRef = storageRef(storage, `chat_images/${selectedUser.chatroomId}/${Date.now()}`);

        await uploadBytes(fileRef, blob);

        blob.close();

        return await getDownloadURL(fileRef);
    };

    // Emoji Picker Functions
    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
        if (!showEmojiPicker) {
            Keyboard.dismiss();
        }
    };

    const onEmojiSelected = (emoji) => {
        setText(prevText => prevText + emoji);
        if (textInputRef.current) {
            textInputRef.current.focus();
        }
    };

    // Image Viewer Functions
    const openImageViewer = (imageUrl, imageArray = []) => {
        let images = imageArray;
        let initialIndex = 0;
        
        if (imageArray.length === 0) {
            images = [{ uri: imageUrl }];
        } else {
            initialIndex = imageArray.findIndex(img => img.uri === imageUrl);
            if (initialIndex === -1) initialIndex = 0;
        }
        
        setImagesForViewing(images);
        setCurrentImageIndex(initialIndex);
        setImageViewerVisible(true);
    };

    const closeImageViewer = () => {
        setImageViewerVisible(false);
        setImagesForViewing([]);
        setCurrentImageIndex(0);
    };

    // Get all images from messages for gallery view
    const getAllImagesFromMessages = () => {
        return messages
            .filter(message => message.image)
            .map(message => ({ uri: message.image }));
    };

    // const pickImage = async () => {
    //   try {
    //     let result = await ImagePicker.launchImageLibraryAsync({
    //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //         allowsEditing: false,
    //         allowsMultipleSelection: true,
    //         aspect: [4, 3],
    //         quality: 0.8,
    //     });

    //     if (!result.canceled && result.assets) {
    //         setUploading(true);
    //         try {
    //             const uploadPromises = result.assets.map(asset => uploadImageAsync(asset.uri));
    //             const imageUrls = await Promise.all(uploadPromises);
                
    //             const imageMessages = imageUrls.map((imageUrl, index) => ({
    //                 _id: Date.now() + index,
    //                 createdAt: new Date(),
    //                 text: '',
    //                 image: imageUrl,
    //                 sender: fbaseUser.userId,
    //                 user: {
    //                     _id: fbaseUser.userId,
    //                     name: fbaseUser.firstname,
    //                     avatar: fbaseUser.avatar,
    //                 },
    //             }));
                
    //             imageMessages.forEach(message => {
    //                 handleSendMessage(message);
    //             });
    //         } catch (error) {
    //             console.log('Error uploading images:', error);
    //             Alert.alert('Error', 'Failed to upload images');
    //         } finally {
    //             setUploading(false);
    //         }
    //     }
    //   } catch (error) {
    //       console.log('Error picking images:', error);
    //       Alert.alert('Error', 'Failed to pick images');
    //       setUploading(false);
    //   }
    // };

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                allowsMultipleSelection: true,
                aspect: [4, 3],
                quality: 0.8,
            });
    
            if (!result.canceled && result.assets && result.assets.length > 0) {
                setUploading(true);
                try {
                    // Upload all images first
                    const uploadPromises = result.assets.map(asset => uploadImageAsync(asset.uri));
                    const imageUrls = await Promise.all(uploadPromises);
                    
                    // Create messages for each image
                    const imageMessages = imageUrls.map((imageUrl, index) => ({
                        _id: Date.now() + index,
                        createdAt: new Date(),
                        text: '',
                        image: imageUrl,
                        sender: fbaseUser.userId,
                        user: {
                            _id: fbaseUser.userId,
                            name: fbaseUser.firstname,
                            avatar: fbaseUser.avatar,
                        },
                    }));
                    
                    // Send all messages
                    await Promise.all(imageMessages.map(message => handleSendMessage(message)));
                    
                } catch (error) {
                    console.log('Error uploading images:', error);
                    Alert.alert('Error', 'Failed to upload images');
                } finally {
                    setUploading(false);
                }
            }
        } catch (error) {
            console.log('Error picking images:', error);
            Alert.alert('Error', 'Failed to pick images');
            setUploading(false);
        }
    };

    const openCamera = () => {
        setShowCamera(true);
    };

    const closeCamera = () => {
        setShowCamera(false);
    };

    const takePhoto = async () => {
        // On simulator or when camera fails, use image picker
        if (isSimulator || !permission?.granted) {
            await pickImageFromLibrary();
            return;
        }

        if (cameraRef.current && isCameraReady) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: false,
                    exif: false,
                    skipProcessing: true
                });

                if (photo.uri) {
                    closeCamera();
                    setUploading(true);
                    try {
                        const imageUrl = await uploadImageAsync(photo.uri);
                        const imageMessage = {
                            _id: Date.now(),
                            createdAt: new Date(),
                            text: '',
                            image: imageUrl,
                            sender: fbaseUser.userId,
                            user: {
                                _id: fbaseUser.userId,
                                name: fbaseUser.firstname,
                                avatar: fbaseUser.avatar,
                            },
                        };
                        handleSendMessage(imageMessage);
                    } catch (error) {
                        console.log('Error uploading image:', error);
                        Alert.alert('Error', 'Failed to upload image');
                    } finally {
                        setUploading(false);
                    }
                }
            } catch (error) {
                console.log('Error taking photo:', error);
                Alert.alert('Error', 'Failed to take photo');
                // Fallback to image picker
                await pickImageFromLibrary();
            }
        } else {
            // Camera not ready, use image picker
            await pickImageFromLibrary();
        }
    };

    // const pickImageFromLibrary = async () => {
    //     try {
    //         const result = await ImagePicker.launchImageLibraryAsync({
    //             mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //             allowsEditing: false,
    //             aspect: [4, 3],
    //             quality: 0.8,
    //             allowsMultipleSelection: true,
    //             selectionLimit: 10 // Allow multiple selection
    //         });

    //         if (!result.canceled && result.assets) {
    //             setUploading(true);
    //             try {
    //                 const uploadPromises = result.assets.map(asset => uploadImageAsync(asset.uri));
    //                 const imageUrls = await Promise.all(uploadPromises);
                    
    //                 const imageMessages = imageUrls.map((imageUrl, index) => ({
    //                     _id: Date.now() + index,
    //                     createdAt: new Date(),
    //                     text: '',
    //                     image: imageUrl,
    //                     sender: fbaseUser.userId,
    //                     user: {
    //                         _id: fbaseUser.userId,
    //                         name: fbaseUser.firstname,
    //                         avatar: fbaseUser.avatar,
    //                     },
    //                 }));
                    
    //                 imageMessages.forEach(message => {
    //                     handleSendMessage(message);
    //                 });
    //             } catch (error) {
    //                 console.log('Error uploading images:', error);
    //                 Alert.alert('Error', 'Failed to upload images');
    //             } finally {
    //                 setUploading(false);
    //             }
    //         }
    //     } catch (error) {
    //         console.log('Error picking images:', error);
    //         Alert.alert('Error', 'Failed to pick images');
    //         setUploading(false);
    //     }
    // };


    const pickImageFromLibrary = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                allowsMultipleSelection: true, // This is key
                aspect: [4, 3],
                quality: 0.8,
            });
    
            if (!result.canceled && result.assets && result.assets.length > 0) {
                setUploading(true);
                try {
                    // Upload all images
                    const uploadPromises = result.assets.map(asset => uploadImageAsync(asset.uri));
                    const imageUrls = await Promise.all(uploadPromises);
                    
                    // Create messages for each image
                    const imageMessages = imageUrls.map((imageUrl, index) => ({
                        _id: Date.now() + index,
                        createdAt: new Date(),
                        text: '',
                        image: imageUrl,
                        sender: fbaseUser.userId,
                        user: {
                            _id: fbaseUser.userId,
                            name: fbaseUser.firstname,
                            avatar: fbaseUser.avatar,
                        },
                    }));
                    
                    // Send all messages
                    await Promise.all(imageMessages.map(message => handleSendMessage(message)));
                    
                } catch (error) {
                    console.log('Error uploading images:', error);
                    Alert.alert('Error', 'Failed to upload images');
                } finally {
                    setUploading(false);
                }
            }
        } catch (error) {
            console.log('Error picking images:', error);
            Alert.alert('Error', 'Failed to pick images');
            setUploading(false);
        }
    };

    const toggleCameraType = () => {
        setCameraType(current => 
            current === 'back' ? 'front' : 'back'
        );
    };

    const onCameraReady = () => {
        setIsCameraReady(true);
    };

    const fetchMessages = useCallback(async () => {
        const snapshot = await get(
            ref(database, `chatrooms/${selectedUser.chatroomId}`),
        );
        return snapshot.val();
    }, [selectedUser.chatroomId]);

    const renderMessages = useCallback((msgs) => {
        return msgs
            ? msgs.map((msg, index) => {
                const isMe = msg.sender === fbaseUser.userId;
                return {
                    ...msg,
                    _id: msg._id || index,
                    user: {
                        _id: msg.sender,
                        name: isMe ? fbaseUser.firstname : selectedUser.firstname,
                        avatar: isMe ? fbaseUser.avatar : selectedUser.avatar,
                    },
                    createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
                    isMe,
                };
            })
            : [];
    }, [fbaseUser.userId, fbaseUser.firstname, fbaseUser.avatar, selectedUser.firstname, selectedUser.avatar, selectedUser.userId]);

    const resetUnreadCount = (chatroomId, userId, friendId) => {
        const unreadRef = ref(database, `unreadMessages/${chatroomId}/${userId}/${friendId}`);
        set(unreadRef, 0)
            .then(() => {
                console.log("Unread count reset to zero successfully!");
            })
            .catch((error) => {
                console.error("Error resetting unread count:", error);
            });
    };

    useEffect(() => {
        const loadData = async () => {
            const myChatroom = await fetchMessages();
            if (myChatroom && myChatroom.messages) {
                setMessages(renderMessages(myChatroom.messages));
            }

            resetUnreadCount({
                chatroomId: selectedUser.chatroomId,
                userId: fbaseUser.userId || "",
                friendId: selectedUser.userId,
            });
        };

        loadData();

        const chatroomRef = ref(database, `chatrooms/${selectedUser.chatroomId}`);

        const unsubscribe = onValue(chatroomRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.messages) {
                setMessages(renderMessages(data.messages));
            }
            fetchUser();
        });

        return () => {
            off(chatroomRef);
        };
    }, [fetchMessages, renderMessages, selectedUser.chatroomId, fbaseUser.userId, selectedUser.userId]);

    const incrementUnreadCount = (chatroomId, userId, friendId) => {
        const unreadRef = ref(database, `unreadMessages/${chatroomId}/${friendId}/${userId}`);

        get(unreadRef)
            .then((snapshot) => {
                const currentCount = snapshot.val() || 0;
                const newCount = currentCount + 1;
                return set(unreadRef, newCount);
            })
            .then(() => {
                console.log("Unread count incremented successfully!");
            })
            .catch((error) => {
                console.error("Error incrementing unread count:", error);
            });
    };

    const fetchUser = async () => {
        try {
            await userService.getUser(selectedUser.userId).then((response) => {
                const res = response.data;
                setSelectedUserExpoToken(res.expo_push_token);
            });
        } catch (e) {
            console.log(e);
        }
    };

    const handleSendMessage = async (message) => {
        const currentChatroom = await fetchMessages();
        const lastMessages = currentChatroom?.messages || [];

        const messageData = {
            sender: fbaseUser.userId,
            createdAt: new Date(),
        };

        if (message.text) {
            messageData.text = message.text;
        }

        if (message.image) {
            messageData.image = message.image;
        }

        update(ref(database, `chatrooms/${selectedUser.chatroomId}`), {
            messages: [
                ...lastMessages,
                messageData,
            ],
        });

        const lastMessageText = message.text ? message.text : (message.image ? "📷 Sent an image" : "Sent a message");
        
        const friendRef = ref(database, `users/${selectedUser.userId}/friends/${friendIndex}`);
        update(friendRef, {
            lastmessage: {
                text: lastMessageText,
                createdAt: new Date()
            },
            unreadCount: 0,
        })
        .then(() => console.log("Last message updated successfully"))
        .catch((error) => console.error("Error updating last message:", error));

        const friendRefCurrentUser = ref(database, `users/${fbaseUser.userId}/friends/${friendIndex}`);
        update(friendRefCurrentUser, {
            lastmessage: {
                text: lastMessageText,
                createdAt: new Date()
            },
            unreadCount: 0,
        })
        .then(() => console.log("Last message updated successfully"))
        .catch((error) => console.error("Error updating last message:", error));

        incrementUnreadCount(selectedUser.chatroomId, fbaseUser.userId, selectedUser.userId);
        updateMessageList(selectedUser.userId);

        // Send push notification
        const sendExpoPushNotification = async (expoPushToken, title, body, data = {}) => {
            try {
                const response = await fetch('https://exp.host/--/api/v2/push/send', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        to: expoPushToken,
                        title,
                        body,
                        data,
                    }),
                });
                const result = await response.json();
                console.log("Push notification response:", result);
            } catch (error) {
                console.error("Error sending push notification:", error);
            }
        };

        const notificationBody = message.text ? message.text : "📷 Sent an image";
        sendExpoPushNotification(
            selectedUserExpoToken,
            currentUser.firstname + " " + currentUser.lastname,
            notificationBody,
            {
                screen: ROUTES.host_messages,
                params: {
                    selectedUser: selectedUser,
                    fbaseUser: fbaseUser,
                    schedule: schedule,
                    friendIndex: friendIndex
                },
            }
        );
    };

    const handleSend = () => {
        if (!text.trim()) return;

        const newMessage = {
            _id: Date.now(),
            createdAt: new Date(),
            text: text.trim(),
            sender: fbaseUser.userId,
            user: {
                _id: fbaseUser.userId,
                name: fbaseUser.firstname,
                avatar: fbaseUser.avatar,
            },
        };

        handleSendMessage(newMessage);
        setText('');
        scrollToBottom();
    };

    // Check if we should show avatar for a message
    const shouldShowAvatar = (currentMessage, previousMessage, nextMessage) => {
        if (currentMessage.isMe) return false; // Don't show avatar for my messages
        
        // Show avatar if:
        // 1. It's the first message of the day, OR
        // 2. Previous message was from me, OR
        // 3. Previous message was from them but was more than 5 minutes ago, OR
        // 4. Next message is from me or doesn't exist
        
        if (!previousMessage || previousMessage.isMe) return true;
        
        const timeDiff = moment(currentMessage.createdAt).diff(
            moment(previousMessage.createdAt), 
            'minutes'
        );
        
        if (timeDiff > 5) return true;
        
        if (!nextMessage || nextMessage.isMe) return true;
        
        return false;
    };

    // Check if we should show timestamp for a message
    const shouldShowTimestamp = (currentMessage, previousMessage) => {
        if (!previousMessage) return true;
        
        const timeDiff = moment(currentMessage.createdAt).diff(
            moment(previousMessage.createdAt), 
            'minutes'
        );
        
        return timeDiff > 5;
    };

    const renderMessageItem = ({ item, index, section }) => {
        const isMe = item.isMe;
        const isSystem = item.system;
        const previousMessage = index > 0 ? section.data[index - 1] : null;
        const nextMessage = index < section.data.length - 1 ? section.data[index + 1] : null;
        const showAvatar = shouldShowAvatar(item, previousMessage, nextMessage);
        const showTimestamp = shouldShowTimestamp(item, previousMessage);

        if (isSystem) {
            return (
                <View style={styles.systemMessageContainer}>
                    <View style={styles.systemMessageBubble}>
                        <Text style={styles.systemMessageText}>{item.text}</Text>
                        {item.status === 'payment_completed' && (
                            <View style={styles.systemMessageDetails}>
                                <Text style={styles.systemMessageTitle}>Freshsweeper</Text>
                                <Text style={styles.detailsText}>{item.details?.selected_schedule?.apartment_name}</Text>
                                <Text style={styles.detailsSubText}>{item.details?.selected_schedule?.address}</Text>
                                <Text style={styles.detailsTime}>
                                    {item.details?.selected_schedule?.cleaning_date} @ {item.details?.selected_schedule?.cleaning_time}
                                </Text>
                                <View style={styles.priceContainer}>
                                    <Text style={styles.priceLabel}>Cleaning Fees:</Text>
                                    <Text style={styles.priceValue}>${item.cleaning_fee}</Text>
                                </View>
                                <TouchableOpacity style={styles.detailsButton}>
                                    <Text style={styles.detailsButtonText}>View Details</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            );
        }

        return (
            <View style={[
                styles.messageRow,
                isMe ? styles.messageRowRight : styles.messageRowLeft
            ]}>
                {/* Avatar for other person's messages */}
                {!isMe && showAvatar && (
                    <Image 
                        source={{ uri: selectedUser.avatar || 'https://via.placeholder.com/40' }} 
                        style={styles.avatar} 
                    />
                )}
                
                {!isMe && !showAvatar && (
                    <View style={styles.avatarSpacer} />
                )}

                <View style={[
                    styles.messageContainer,
                    isMe ? styles.myMessageContainer : styles.otherMessageContainer,
                    !showAvatar && styles.messageWithoutAvatar
                ]}>
                    {item.image ? (
                        <TouchableOpacity 
                            onPress={() => openImageViewer(item.image, getAllImagesFromMessages())}
                            activeOpacity={0.7}
                        >
                            <Image 
                                source={{ uri: item.image }} 
                                style={styles.messageImage} 
                                resizeMode="cover"
                            />
                            <View style={styles.imageOverlay}>
                                <Ionicons name="expand" size={16} color="white" />
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <View style={[
                            styles.messageBubble,
                            isMe ? styles.myMessageBubble : styles.otherMessageBubble
                        ]}>
                            <Text style={[
                                styles.messageText,
                                isMe ? styles.myMessageText : styles.otherMessageText
                            ]}>
                                {item.text}
                            </Text>
                        </View>
                    )}
                    
                    {/* Timestamp and status */}
                    <View style={[
                        styles.messageFooter,
                        isMe ? styles.myMessageFooter : styles.otherMessageFooter
                    ]}>
                        {showTimestamp && (
                            <Text style={[
                                styles.messageTime,
                                isMe ? styles.myMessageTime : styles.otherMessageTime
                            ]}>
                                {moment(item.createdAt).format('h:mm A')}
                            </Text>
                        )}
                        {isMe && (
                            <View style={styles.statusContainer}>
                                <MaterialIcons 
                                    name="done-all" 
                                    size={14} 
                                    color="#4CAF50" 
                                    style={styles.deliveryIcon}
                                />
                            </View>
                        )}
                    </View>
                </View>

                {/* Avatar for my messages (right side) */}
                {isMe && showAvatar && (
                    <Image 
                        source={{ uri: fbaseUser.avatar || 'https://via.placeholder.com/40' }} 
                        style={[styles.avatar, styles.myAvatar]} 
                    />
                )}
                
                {isMe && !showAvatar && (
                    <View style={styles.avatarSpacer} />
                )}
            </View>
        );
    };

    const renderSectionHeader = ({ section: { title } }) => (
        <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLine} />
            <Text style={styles.sectionHeaderText}>{title}</Text>
            <View style={styles.sectionHeaderLine} />
        </View>
    );

    const renderMessageOptions = () => {
        Alert.alert(
            "Send Media",
            "Choose an option",
            [
                { text: "Choose from Library", onPress: pickImage },
                { text: "Take Photo", onPress: openCamera },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    // Camera modal content
    const renderCameraModal = () => {
        if (isSimulator) {
            return (
                <View style={styles.cameraContainer}>
                    <View style={styles.cameraHeader}>
                        <TouchableOpacity 
                            style={styles.cameraCloseButton}
                            onPress={closeCamera}
                        >
                            <Ionicons name="close" size={30} color="white" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.simulatorContainer}>
                        <Ionicons name="camera-off" size={64} color="white" />
                        <Text style={styles.simulatorText}>Camera not available in simulator</Text>
                        <Text style={styles.simulatorSubtext}>
                            Use "Pick from Library" button to add photos
                        </Text>
                        
                        <TouchableOpacity 
                            style={styles.libraryButton}
                            onPress={pickImageFromLibrary}
                        >
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
                        <TouchableOpacity 
                            style={styles.cameraCloseButton}
                            onPress={closeCamera}
                        >
                            <Ionicons name="close" size={30} color="white" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.permissionContainer}>
                        <Ionicons name="camera-off" size={48} color="white" />
                        <Text style={styles.permissionText}>No access to camera</Text>
                        <TouchableOpacity 
                            style={styles.permissionButton}
                            onPress={() => {
                                closeCamera();
                                Alert.alert(
                                    'Permission Required',
                                    'Please enable camera permissions in your device settings.',
                                    [{ text: 'OK' }]
                                );
                            }}
                        >
                            <Text style={styles.permissionButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.cameraContainer}>
                <CameraView 
                    style={styles.camera}
                    facing={cameraType}
                    ref={cameraRef}
                    onCameraReady={onCameraReady}
                >
                    <View style={styles.cameraHeader}>
                        <TouchableOpacity 
                            style={styles.cameraCloseButton}
                            onPress={closeCamera}
                        >
                            <Ionicons name="close" size={30} color="white" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.flipButton}
                            onPress={toggleCameraType}
                        >
                            <Ionicons name="camera-reverse" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.cameraControls}>
                        <TouchableOpacity 
                            style={styles.captureButton}
                            onPress={takePhoto}
                        >
                            <View style={styles.captureButtonOuter}>
                                <View style={styles.captureButtonInner} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </CameraView>
            </View>
        );
    };

    return (
        <>
            <StatusBar
                barStyle="light-content"
                backgroundColor={COLORS.primary}
                translucent={false}
            />
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                {/* <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Image 
                            source={{ uri: selectedUser.avatar || 'https://via.placeholder.com/40' }} 
                            style={styles.headerAvatar} 
                        />
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerName}>
                                {selectedUser.firstname} {selectedUser.lastname}
                            </Text>
                            <Text style={styles.headerStatus}>Online</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="ellipsis-vertical" size={24} color="white" />
                    </TouchableOpacity>
                </View> */}

                {/* Messages List */}
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                >
                    <SectionList
                        ref={sectionListRef}
                        sections={groupedMessages}
                        renderItem={renderMessageItem}
                        renderSectionHeader={renderSectionHeader}
                        keyExtractor={(item) => item._id.toString()}
                        contentContainerStyle={[
                            styles.messagesList,
                            { paddingBottom: keyboardHeight > 0 ? keyboardHeight + inputHeight : inputHeight + 20 }
                        ]}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        onContentSizeChange={() => scrollToBottom()}
                        onLayout={() => scrollToBottom()}
                        inverted={false}
                        initialNumToRender={20}
                        windowSize={10}
                        // Add this callback to handle scroll failures
                        onScrollToIndexFailed={(error) => {
                            const wait = new Promise(resolve => setTimeout(resolve, 500));
                            wait.then(() => {
                                if (sectionListRef.current) {
                                    sectionListRef.current.scrollToLocation({
                                        sectionIndex: Math.max(0, error.index - 1),
                                        itemIndex: 0,
                                        animated: true,
                                        viewPosition: 0
                                    });
                                }
                            });
                        }}
                    />

                    {/* Input Toolbar - ALWAYS AT BOTTOM */}
                    <View style={[
                        styles.inputToolbar,
                        { bottom: keyboardHeight > 0 ? keyboardHeight : 0 }
                    ]}>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={toggleEmojiPicker}
                        >
                            <Ionicons 
                                name={showEmojiPicker ? "close" : "happy"} 
                                size={26} 
                                color={showEmojiPicker ? COLORS.error : COLORS.primary} 
                            />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={renderMessageOptions}
                        >
                            <Ionicons name="camera" size={26} color={COLORS.primary} />
                        </TouchableOpacity>

                        <View style={styles.inputContainer}>
                            <TextInput
                                ref={textInputRef}
                                style={[
                                    styles.textInput,
                                    { height: Math.max(44, Math.min(100, inputHeight)) }
                                ]}
                                value={text}
                                onChangeText={setText}
                                placeholder="Type a message..."
                                placeholderTextColor="#999"
                                multiline
                                maxLength={1000}
                                onContentSizeChange={(e) => {
                                    setInputHeight(e.nativeEvent.contentSize.height);
                                }}
                            />
                        </View>

                        <TouchableOpacity 
                            style={[
                                styles.sendButton,
                                !text.trim() && styles.sendButtonDisabled
                            ]}
                            onPress={handleSend}
                            disabled={!text.trim()}
                        >
                            <Ionicons 
                                name="send" 
                                size={24} 
                                color={text.trim() ? COLORS.primary : '#ccc'} 
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                        <View style={[
                            styles.emojiPickerContainer,
                            { bottom: keyboardHeight > 0 ? keyboardHeight + 50 : 50 }
                        ]}>
                            <EmojiSelector
                                onEmojiSelected={onEmojiSelected}
                                visible={showEmojiPicker}
                                columns={8}
                                showSearchBar={true}
                                showHistory={true}
                                showSectionTitles={true}
                                category="all"
                                style={styles.emojiSelector}
                            />
                        </View>
                    )}
                </KeyboardAvoidingView>

                {/* Camera Modal */}
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={showCamera}
                    onRequestClose={closeCamera}
                    statusBarTranslucent={true}
                >
                    {renderCameraModal()}
                </Modal>

                {/* Image Viewer Modal */}
                <ImageViewing
                    images={imagesForViewing}
                    imageIndex={currentImageIndex}
                    visible={imageViewerVisible}
                    onRequestClose={closeImageViewer}
                    backgroundColor="rgba(0, 0, 0, 0.95)"
                    swipeToCloseEnabled={true}
                    doubleTapToZoomEnabled={true}
                    HeaderComponent={({ imageIndex }) => (
                        <View style={styles.imageViewerHeader}>
                            <Text style={styles.imageViewerText}>
                                {imageIndex + 1} / {imagesForViewing.length}
                            </Text>
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
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.primary,
    },
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.primary,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    headerName: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    headerStatus: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
        marginTop: 2,
    },
    headerButton: {
        padding: 8,
    },
    messagesList: {
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 16,
    },
    sectionHeaderLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 8,
    },
    sectionHeaderText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 4,
    },
    messageRowLeft: {
        justifyContent: 'flex-start',
    },
    messageRowRight: {
        justifyContent: 'flex-end',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginHorizontal: 8,
        marginBottom: 4,
    },
    myAvatar: {
        marginLeft: 8,
        marginRight: 0,
    },
    avatarSpacer: {
        width: 32,
        marginHorizontal: 8,
    },
    messageContainer: {
        maxWidth: '87%',
        marginBottom: 4,
    },
    myMessageContainer: {
        alignItems: 'flex-end',
    },
    otherMessageContainer: {
        alignItems: 'flex-start',
    },
    messageWithoutAvatar: {
        marginLeft: 48,
    },
    messageBubble: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        maxWidth: '100%',
    },
    myMessageBubble: {
        backgroundColor: '#DCF8C6',
        borderBottomRightRadius: 4,
    },
    otherMessageBubble: {
        backgroundColor: 'white',
        borderBottomLeftRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    myMessageText: {
        color: '#000',
    },
    otherMessageText: {
        color: '#000',
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        paddingHorizontal: 8,
    },
    myMessageFooter: {
        justifyContent: 'flex-end',
    },
    otherMessageFooter: {
        justifyContent: 'flex-start',
    },
    messageTime: {
        fontSize: 11,
        color: '#666',
    },
    myMessageTime: {
        color: '#666',
    },
    otherMessageTime: {
        color: '#666',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 4,
    },
    deliveryIcon: {
        marginLeft: 2,
    },
    messageImage: {
        width: 200,
        height: 150,
        borderRadius: 12,
        overflow: 'hidden',
    },
    imageOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    systemMessageContainer: {
        alignItems: 'center',
        marginVertical: 16,
    },
    systemMessageBubble: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        maxWidth: '80%',
    },
    systemMessageText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    systemMessageDetails: {
        marginTop: 12,
    },
    systemMessageTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    detailsText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    detailsSubText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
    },
    detailsTime: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
        textAlign: 'center',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
    },
    priceLabel: {
        fontSize: 14,
        marginRight: 8,
    },
    priceValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    detailsButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
        marginTop: 16,
    },
    detailsButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    inputToolbar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingHorizontal: 12,
        paddingVertical: 10,
        position: 'absolute',
        left: 0,
        right: 0,
        minHeight: 60,
    },
    inputContainer: {
        flex: 1,
        marginHorizontal: 8,
    },
    textInput: {
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        maxHeight: 100,
        minHeight: 40,
    },
    actionButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    emojiPickerContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 250,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    emojiSelector: {
        flex: 1,
    },
    // Camera Styles (using same pattern as ReportIncident)
    cameraContainer: {
        flex: 1,
        backgroundColor: 'black',
    },
    camera: {
        flex: 1,
    },
    cameraHeader: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    cameraCloseButton: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        padding: 8,
    },
    flipButton: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        padding: 8,
    },
    cameraControls: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
    },
    captureButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureButtonOuter: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
    },
    simulatorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        paddingHorizontal: 20,
    },
    simulatorText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 20,
        textAlign: 'center',
    },
    simulatorSubtext: {
        color: '#ccc',
        fontSize: 14,
        marginTop: 10,
        textAlign: 'center',
        marginBottom: 30,
    },
    libraryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 20,
    },
    libraryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    permissionText: {
        color: 'white',
        fontSize: 16,
        marginTop: 16,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    permissionButton: {
        marginTop: 20,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    uploadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadingText: {
        color: 'white',
        marginTop: 10,
        fontSize: 16,
    },
    imageViewerHeader: {
        position: 'absolute',
        top: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        zIndex: 1,
    },
    imageViewerText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    closeButton: {
        padding: 5,
    },
});







// import {getDatabase, get, set, push, ref, onValue, off, orderByKey, update, remove, query, limitToLast, startAfter} from 'firebase/database';
// import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
// import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
// import { SafeAreaView, StyleSheet, Pressable, StatusBar, Linking, ScrollView, Modal, Image, Text, View, TouchableOpacity, ActivityIndicator, Alert, Keyboard, Animated } from 'react-native';
// import COLORS from '../../constants/colors';
// import { GiftedChat, SystemMessage, Send, Bubble, Avatar, MessageText, InputToolbar, Composer, Actions } from 'react-native-gifted-chat';
// import moment from 'moment';
// import ROUTES from '../../constants/routes';
// import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import { AuthContext } from '../../context/AuthContext';
// import * as ImagePicker from 'expo-image-picker';
// import userService from '../../services/connection/userService';
// import EmojiSelector from 'react-native-emoji-selector';
// import ImageViewing from 'react-native-image-viewing';

// export default function ChatConversation({navigation, route}) {
//     const PAGE_SIZE = 20;
//     const {updateMessageList} = useContext(AuthContext);
//     const {currentUser, currentUserId} = useContext(AuthContext);
//     const {fbaseUser, selectedUser, schedule, friendIndex} = route.params;
    
//     const [messages, setMessages] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [page, setPage] = useState(1);
//     const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [selectedUserExpoToken, setSelectedUserExpoToken] = useState("");
//     const [uploading, setUploading] = useState(false);
//     const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//     const [text, setText] = useState('');
//     const [imageViewerVisible, setImageViewerVisible] = useState(false);
//     const [currentImageIndex, setCurrentImageIndex] = useState(0);
//     const [imagesForViewing, setImagesForViewing] = useState([]);
//     const [deleting, setDeleting] = useState(false);
//     const [showScrollToBottom, setShowScrollToBottom] = useState(false);
//     const [allMessagesLoaded, setAllMessagesLoaded] = useState(false);
//     const [oldestMessageKey, setOldestMessageKey] = useState(null);

//     const giftedChatRef = useRef(null);
//     const scrollToBottomButtonOpacity = useRef(new Animated.Value(0)).current;
//     const database = getDatabase();
//     const storage = getStorage();

//     // Request permissions when component mounts
//     useEffect(() => {
//         (async () => {
//             const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//             if (status !== 'granted') {
//                 Alert.alert('Sorry, we need camera roll permissions to make this work!');
//             }
//         })();
//     }, []);

//     const uploadImageAsync = async (uri) => {
//         const blob = await new Promise((resolve, reject) => {
//             const xhr = new XMLHttpRequest();
//             xhr.onload = function() {
//                 resolve(xhr.response);
//             };
//             xhr.onerror = function(e) {
//                 console.log(e);
//                 reject(new TypeError('Network request failed'));
//             };
//             xhr.responseType = 'blob';
//             xhr.open('GET', uri, true);
//             xhr.send(null);
//         });

//         const fileRef = storageRef(storage, `chat_images/${selectedUser.chatroomId}/${Date.now()}`);

//         await uploadBytes(fileRef, blob);

//         blob.close();

//         return await getDownloadURL(fileRef);
//     };

//     // Emoji Picker Functions
//     const toggleEmojiPicker = () => {
//         setShowEmojiPicker(!showEmojiPicker);
//         if (!showEmojiPicker) {
//             Keyboard.dismiss();
//         }
//     };

//     const onEmojiSelected = (emoji) => {
//         setText(prevText => prevText + emoji);
//     };

//     // Image Viewer Functions
//     const openImageViewer = (imageUrl, imageArray = []) => {
//         let images = imageArray;
//         let initialIndex = 0;
        
//         // If no array provided, create one with the single image
//         if (imageArray.length === 0) {
//             images = [{ uri: imageUrl }];
//         } else {
//             // Find the index of the current image
//             initialIndex = imageArray.findIndex(img => img.uri === imageUrl);
//             if (initialIndex === -1) initialIndex = 0;
//         }
        
//         setImagesForViewing(images);
//         setCurrentImageIndex(initialIndex);
//         setImageViewerVisible(true);
//     };

//     const closeImageViewer = () => {
//         setImageViewerVisible(false);
//         setImagesForViewing([]);
//         setCurrentImageIndex(0);
//     };

//     // Get all images from messages for gallery view
//     const getAllImagesFromMessages = () => {
//         return messages
//             .filter(message => message.image)
//             .map(message => ({ 
//                 uri: message.image,
//                 messageId: message._id,
//                 sender: message.user._id
//             }));
//     };

//     // Delete image from Firebase Storage and message from database
//     const deleteImage = async (imageUri, messageId) => {
//         if (!imageUri || !messageId) {
//             Alert.alert('Error', 'Cannot delete image: Missing information');
//             return;
//         }

//         Alert.alert(
//             "Delete Image",
//             "Are you sure you want to delete this image? This action cannot be undone.",
//             [
//                 {
//                     text: "Cancel",
//                     style: "cancel"
//                 },
//                 { 
//                     text: "Delete", 
//                     onPress: async () => {
//                         setDeleting(true);
//                         try {
//                             // Extract the file path from the URL to delete from storage
//                             const urlParts = imageUri.split('/o/');
//                             if (urlParts.length > 1) {
//                                 const filePath = decodeURIComponent(urlParts[1].split('?')[0]);
//                                 const imageRef = storageRef(storage, filePath);
                                
//                                 // Delete from Firebase Storage
//                                 await deleteObject(imageRef);
//                                 console.log('Image deleted from storage');
//                             }

//                             // Delete message from Firebase Database
//                             const currentChatroom = await fetchMessages();
//                             const updatedMessages = currentChatroom.messages.filter((msg, index) => index !== messageId);
                            
//                             await update(ref(database, `chatrooms/${selectedUser.chatroomId}`), {
//                                 messages: updatedMessages
//                             });

//                             // Update local state
//                             setMessages(prevMessages => prevMessages.filter(msg => msg._id !== messageId));
                            
//                             // Update images for viewing if the image viewer is open
//                             setImagesForViewing(prev => prev.filter(img => img.uri !== imageUri));
                            
//                             // Close image viewer if no images left or adjust index
//                             if (imagesForViewing.length <= 1) {
//                                 closeImageViewer();
//                             } else {
//                                 setCurrentImageIndex(prev => 
//                                     prev >= imagesForViewing.length - 1 ? imagesForViewing.length - 2 : prev
//                                 );
//                             }

//                             Alert.alert('Success', 'Image deleted successfully');
                            
//                         } catch (error) {
//                             console.error('Error deleting image:', error);
//                             Alert.alert('Error', 'Failed to delete image');
//                         } finally {
//                             setDeleting(false);
//                         }
//                     }
//                 }
//             ]
//         );
//     };

//     // Infinite Scroll Functions
//     const loadEarlierMessages = async () => {
//         if (isLoadingEarlier || allMessagesLoaded) return;

//         setIsLoadingEarlier(true);
//         try {
//             const currentChatroom = await fetchMessages();
//             const allMessages = currentChatroom.messages || [];
            
//             // Calculate how many more messages we can load
//             const currentLength = messages.length;
//             const totalMessages = allMessages.length;
            
//             if (currentLength >= totalMessages) {
//                 setAllMessagesLoaded(true);
//                 return;
//             }

//             // Load next page of messages
//             const nextPageStart = currentLength;
//             const nextPageEnd = Math.min(currentLength + PAGE_SIZE, totalMessages);
//             const newMessages = allMessages.slice(nextPageStart, nextPageEnd);
            
//             if (newMessages.length > 0) {
//                 const renderedNewMessages = renderMessages(newMessages);
//                 setMessages(prevMessages => [...renderedNewMessages, ...prevMessages]);
//             }

//             // Check if all messages are loaded
//             if (currentLength + newMessages.length >= totalMessages) {
//                 setAllMessagesLoaded(true);
//             }
//         } catch (error) {
//             console.error('Error loading earlier messages:', error);
//         } finally {
//             setIsLoadingEarlier(false);
//         }
//     };

//     // Scroll to bottom function
//     const scrollToBottom = () => {
//         if (giftedChatRef.current) {
//             giftedChatRef.current.scrollToBottom(true);
//         }
//         hideScrollToBottomButton();
//     };

//     // Show/hide scroll to bottom button with animation
//     const showScrollToBottomButton = () => {
//         setShowScrollToBottom(true);
//         Animated.timing(scrollToBottomButtonOpacity, {
//             toValue: 1,
//             duration: 300,
//             useNativeDriver: true,
//         }).start();
//     };

//     const hideScrollToBottomButton = () => {
//         Animated.timing(scrollToBottomButtonOpacity, {
//             toValue: 0,
//             duration: 300,
//             useNativeDriver: true,
//         }).start(() => {
//             setShowScrollToBottom(false);
//         });
//     };

//     // Handle scroll events to show/hide scroll to bottom button
//     const onScroll = ({ nativeEvent }) => {
//         const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
//         const isCloseToBottom = contentOffset.y < -100; // Inverted list, so negative values
        
//         if (isCloseToBottom && !showScrollToBottom) {
//             showScrollToBottomButton();
//         } else if (!isCloseToBottom && showScrollToBottom) {
//             hideScrollToBottomButton();
//         }
//     };

//     const pickImage = async () => {
//       try {
//         let result = await ImagePicker.launchImageLibraryAsync({
//             mediaTypes: ImagePicker.MediaTypeOptions.Images,
//             allowsEditing: false,
//             allowsMultipleSelection: true,
//             aspect: [4, 3],
//             quality: 0.8,
//         });

//         if (!result.canceled && result.assets) {
//             setUploading(true);
//             try {
//                 const uploadPromises = result.assets.map(asset => uploadImageAsync(asset.uri));
//                 const imageUrls = await Promise.all(uploadPromises);
                
//                 const imageMessages = imageUrls.map((imageUrl, index) => ({
//                     _id: Math.random().toString(36).substring(7) + index,
//                     createdAt: new Date(),
//                     user: {
//                         _id: fbaseUser.userId,
//                         name: fbaseUser.firstname,
//                         avatar: fbaseUser.avatar,
//                     },
//                     image: imageUrl,
//                 }));
                
//                 onSend(imageMessages);
//             } catch (error) {
//                 console.log('Error uploading images:', error);
//                 Alert.alert('Error', 'Failed to upload images');
//             } finally {
//                 setUploading(false);
//             }
//         }
//       } catch (error) {
//           console.log('Error picking images:', error);
//           Alert.alert('Error', 'Failed to pick images');
//           setUploading(false);
//       }
//     };

//     const takePhoto = async () => {
//         try {
//             const { status } = await ImagePicker.requestCameraPermissionsAsync();
//             if (status !== 'granted') {
//                 Alert.alert('Sorry, we need camera permissions to take photos!');
//                 return;
//             }

//             let result = await ImagePicker.launchCameraAsync({
//                 allowsEditing: true,
//                 aspect: [4, 3],
//                 quality: 0.8,
//             });

//             if (!result.canceled && result.assets && result.assets[0]) {
//                 const imageUri = result.assets[0].uri;
//                 setUploading(true);
//                 try {
//                     const imageUrl = await uploadImageAsync(imageUri);
//                     const imageMessage = {
//                         _id: Math.random().toString(36).substring(7),
//                         createdAt: new Date(),
//                         user: {
//                             _id: fbaseUser.userId,
//                             name: fbaseUser.firstname,
//                             avatar: fbaseUser.avatar,
//                         },
//                         image: imageUrl,
//                     };
//                     onSend([imageMessage]);
//                 } catch (error) {
//                     console.log('Error uploading image:', error);
//                     Alert.alert('Error', 'Failed to upload image');
//                 } finally {
//                     setUploading(false);
//                 }
//             }
//         } catch (error) {
//             console.log('Error taking photo:', error);
//             Alert.alert('Error', 'Failed to take photo');
//             setUploading(false);
//         }
//     };

//     const fetchMessages = useCallback(async () => {
//         const snapshot = await get(
//             ref(database, `chatrooms/${selectedUser.chatroomId}`),
//         );
//         return snapshot.val();
//     }, [selectedUser.chatroomId]);

//     const renderMessages = useCallback((msgs) => {
//         return msgs
//             ? msgs.reverse().map((msg, index) => {
//                 return {
//                     ...msg,
//                     _id: index,
//                     user: {
//                         _id: msg.sender === fbaseUser.userId ? fbaseUser.firstname : selectedUser.firstname,
//                         avatar: msg.sender === fbaseUser.userId ? fbaseUser.avatar : selectedUser.avatar,
//                         name: msg.sender === fbaseUser.userId ? fbaseUser.userId : selectedUser.userId,
//                     },
//                     sent: msg.sender === fbaseUser.userId,
//                 };
//             })
//             : [];
//     }, [fbaseUser.userId, fbaseUser.firstname, fbaseUser.avatar, selectedUser.firstname, selectedUser.avatar, selectedUser.userId]);

//     const renderMessageImage = (props) => {
//       const { currentMessage } = props;
      
//       // Check if current user sent this message (for delete option)
//       const isCurrentUser = currentMessage.user._id === fbaseUser.userId;
      
//       return (
//           <TouchableOpacity 
//             style={styles.imageContainer}
//             onPress={() => openImageViewer(currentMessage.image, getAllImagesFromMessages())}
//             activeOpacity={0.7}
//             onLongPress={() => {
//                 if (isCurrentUser) {
//                     Alert.alert(
//                         "Delete Image",
//                         "Do you want to delete this image?",
//                         [
//                             {
//                                 text: "Cancel",
//                                 style: "cancel"
//                             },
//                             { 
//                                 text: "Delete", 
//                                 onPress: () => deleteImage(currentMessage.image, currentMessage._id),
//                                 style: "destructive"
//                             }
//                         ]
//                     );
//                 }
//             }}
//           >
//               <Image
//                   source={{ uri: currentMessage.image }}
//                   style={styles.chatImage}
//                   resizeMode="cover"
//               />
//               {/* Add a zoom indicator */}
//               <View style={styles.zoomIndicator}>
//                   <Ionicons name="expand" size={16} color="white" />
//               </View>
//               {/* Add delete indicator for user's own images */}
//               {isCurrentUser && (
//                   <View style={styles.deleteIndicator}>
//                       <Ionicons name="trash-outline" size={14} color="white" />
//                   </View>
//               )}
//           </TouchableOpacity>
//       );
//     };

//     useEffect(() => {
//         const loadData = async () => {
//             setLoading(true);
//             try {
//                 const myChatroom = await fetchMessages();
//                 const allMessages = myChatroom.messages || [];
                
//                 // Load initial page of messages (most recent ones)
//                 const initialMessages = allMessages.slice(-PAGE_SIZE);
//                 setMessages(renderMessages(initialMessages));
                
//                 // Check if all messages are loaded
//                 if (initialMessages.length >= allMessages.length) {
//                     setAllMessagesLoaded(true);
//                 }

//                 resetUnreadCount({
//                     chatroomId: selectedUser.chatroomId,
//                     userId: fbaseUser.userId || "",
//                     friendId: selectedUser.userId,
//                 });
//             } catch (error) {
//                 console.error('Error loading messages:', error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         loadData();

//         const chatroomRef = ref(database, `chatrooms/${selectedUser.chatroomId}`);

//         const unsubscribe = onValue(chatroomRef, (snapshot) => {
//             const data = snapshot.val();
//             if (data && data.messages) {
//                 const messages = Object.values(data.messages);
//                 const sortedMessages = messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//                 const lastMessage = sortedMessages[0];
                
//                 // Update messages but keep the infinite scroll state
//                 const allMessages = data.messages || [];
//                 const currentMessagesCount = messages.length;
//                 const newMessages = allMessages.slice(-currentMessagesCount);
                
//                 setMessages(renderMessages(newMessages));
//                 console.log("Last Message:", lastMessage);
                
//                 // Auto scroll to bottom when new message arrives and user is at bottom
//                 if (!showScrollToBottom) {
//                     setTimeout(() => {
//                         scrollToBottom();
//                     }, 100);
//                 }
//             }
//             fetchUser();
//         });

//         return () => {
//             off(chatroomRef);
//         };
//     }, [fetchMessages, renderMessages, selectedUser.chatroomId, fbaseUser.userId, selectedUser.userId]);

//     const incrementUnreadCount = (chatroomId, userId, friendId) => {
//         const unreadRef = ref(database, `unreadMessages/${chatroomId}/${friendId}/${userId}`);

//         get(unreadRef)
//             .then((snapshot) => {
//                 const currentCount = snapshot.val() || 0;
//                 const newCount = currentCount + 1;
//                 return set(unreadRef, newCount);
//             })
//             .then(() => {
//                 console.log("Unread count incremented successfully!");
//             })
//             .catch((error) => {
//                 console.error("Error incrementing unread count:", error);
//             });
//     };

//     const resetUnreadCount = (chatroomId, userId, friendId) => {
//         const unreadRef = ref(database, `unreadMessages/${chatroomId}/${userId}/${friendId}`);
//         set(unreadRef, 0)
//             .then(() => {
//                 console.log("Unread count reset to zero successfully!");
//             })
//             .catch((error) => {
//                 console.error("Error resetting unread count:", error);
//             });
//     };

//     const fetchUser = async () => {
//         try {
//             await userService.getUser(selectedUser.userId).then((response) => {
//                 const res = response.data;
//                 setSelectedUserExpoToken(res.expo_push_token);
//             });
//         } catch (e) {
//             console.log(e);
//         }
//     };

//     const onSend = useCallback(async (msg = []) => {
//         const currentChatroom = await fetchMessages();
//         const lastMessages = currentChatroom.messages || [];

//         const messageData = {
//             sender: fbaseUser.userId,
//             createdAt: new Date(),
//         };

//         if (msg[0].text) {
//             messageData.text = msg[0].text;
//         }

//         if (msg[0].image) {
//             messageData.image = msg[0].image;
//         }

//         update(ref(database, `chatrooms/${selectedUser.chatroomId}`), {
//             messages: [
//                 ...lastMessages,
//                 messageData,
//             ],
//         });

//         const lastMessageText = msg[0].text ? msg[0].text : (msg[0].image ? "📷 Sent an image" : "Sent a message");
        
//         const friendRef = ref(database, `users/${selectedUser.userId}/friends/${friendIndex}`);
//         update(friendRef, {
//             lastmessage: {
//                 text: lastMessageText,
//                 createdAt: new Date()
//             },
//             unreadCount: 0,
//         })
//         .then(() => console.log("Last message updated successfully"))
//         .catch((error) => console.error("Error updating last message:", error));

//         const friendRefCurrentUser = ref(database, `users/${fbaseUser.userId}/friends/${friendIndex}`);
//         update(friendRefCurrentUser, {
//             lastmessage: {
//                 text: lastMessageText,
//                 createdAt: new Date()
//             },
//             unreadCount: 0,
//         })
//         .then(() => console.log("Last message updated successfully"))
//         .catch((error) => console.error("Error updating last message:", error));

//         incrementUnreadCount(selectedUser.chatroomId, fbaseUser.userId, selectedUser.userId);
//         updateMessageList(selectedUser.userId);
//         setMessages(prevMessages => GiftedChat.append(prevMessages, msg));

//         setText('');

//         const sendExpoPushNotification = async (expoPushToken, title, body, data = {}) => {
//             try {
//                 const response = await fetch('https://exp.host/--/api/v2/push/send', {
//                     method: 'POST',
//                     headers: {
//                         'Accept': 'application/json',
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({
//                         to: expoPushToken,
//                         title,
//                         body,
//                         data,
//                     }),
//                 });
//                 const result = await response.json();
//                 console.log("Push notification response:", result);
//             } catch (error) {
//                 console.error("Error sending push notification:", error);
//             }
//         };

//         const notificationBody = msg[0].text ? msg[0].text : "📷 Sent an image";
//         sendExpoPushNotification(
//             selectedUserExpoToken,
//             currentUser.firstname + " " + currentUser.lastname,
//             notificationBody,
//             {
//                 screen: ROUTES.host_messages,
//                 params: {
//                     selectedUser: selectedUser,
//                     fbaseUser: fbaseUser,
//                     schedule: schedule,
//                     friendIndex: friendIndex
//                 },
//             }
//         );
//     }, [fetchMessages, fbaseUser.userId, selectedUser.chatroomId, selectedUser.userId, friendIndex, updateMessageList, selectedUserExpoToken, currentUser.firstname, currentUser.lastname, schedule]);

//     // Custom Actions for Image Picker and Emoji
//     const renderActions = (props) => {
//         return (
//             <View style={styles.actionsContainer}>
                
//                 <Actions
//                     {...props}
//                     options={{
//                         'Choose From Library': pickImage,
//                         'Take Photo': takePhoto,
//                         'Cancel': () => {},
//                     }}
//                     icon={() => (
//                         <MaterialCommunityIcons name="camera" size={24} color={COLORS.primary} style={styles.cameraIcon} />
//                     )}
//                     onSend={args => console.log(args)}
//                 />
//                 <TouchableOpacity onPress={toggleEmojiPicker} style={styles.emojiButton}>
//                     <Ionicons 
//                         name={showEmojiPicker ? "close" : "happy"} 
//                         size={24} 
//                         color={showEmojiPicker ? COLORS.error : COLORS.primary} 
//                     />
//                 </TouchableOpacity>
//             </View>
//         );
//     };

//     const CustomBubble = (props) => {
//         const { position, currentMessage } = props;
//         const isSent = position === 'right';

//         return (
//             <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: '100%' }}>
//                 <Bubble
//                     {...props}
//                     wrapperStyle={{
//                         right: {
//                             backgroundColor: '#DCF8C6',
//                             flexDirection: 'row',
//                         },
//                         left: {
//                             backgroundColor: '#FFFFFF',
//                             flexDirection: 'row',
//                         },
//                     }}
//                 >
//                     <View style={{ marginLeft: 5, alignSelf: 'flex-end' }}>
//                         <Ionicons name="checkmark-done" size={20} color="green" />
//                     </View>
//                 </Bubble>
//             </View>
//         );
//     };

//     // Custom Composer to handle text input with emoji support
//     const renderComposer = (props) => {
//         return (
//             <Composer
//                 {...props}
//                 text={text}
//                 onTextChanged={setText}
//                 textInputStyle={styles.composer}
//                 placeholder="Type a message..."
//                 multiline={true}
//             />
//         );
//     };

//     const renderCustomMessage = ({ currentMessage }) => {
//         if (currentMessage.system) {
//             return (
//                 <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
//                     <Image source={require('../../assets/images/logo.png')} style={styles.avatar} />
//                     <View style={styles.automated}>
//                         <Text bold style={{ fontSize: 16, fontWeight: '500' }}>Freshsweeper</Text>
//                         <Text style={{ fontStyle: 'italic', color: '#777', marginLeft: 0 }}>
//                             {currentMessage.text}
//                         </Text>
//                         {currentMessage.status === 'payment_completed' &&
//                             <View>
//                                 <View style={styles.details}>
//                                     <Text style={{ fontSize: 14, fontWeight: '600' }}>{currentMessage.details.selected_schedule.apartment_name}</Text>
//                                     <Text style={{ fontSize: 12 }}>{currentMessage.details.selected_schedule.address}</Text>
//                                     <Text style={{ fontSize: 12, color: COLORS.gray }}>{currentMessage.details.selected_schedule.cleaning_date} @ {currentMessage.details.selected_schedule.cleaning_time}</Text>
//                                     <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
//                                         <Text style={{ fontSize: 16 }}>Cleaning Fees:</Text>
//                                         <Text style={{ fontSize: 16, fontWeight: '600' }}>${currentMessage.cleaning_fee}</Text>
//                                     </View>
//                                 </View>
//                                 {schedule.userId !== currentMessage.details?.cleanerId ?
//                                     <>
//                                         <View>
//                                             <Text style={{ color: COLORS.gray, fontStyle: 'italic' }}>
//                                                 The cleaner has been notified and will arrive as scheduled. If you need to communicate any specific details, feel free to chat here. Thank you for using Freshsweeper
//                                             </Text>
//                                         </View>
//                                         <TouchableOpacity
//                                             style={styles.button}
//                                             onPress={() => navigation.navigate(ROUTES.host_schedule_details, {
//                                                 scheduleId: currentMessage.details.selected_scheduleId,
//                                                 item: currentMessage.details,
//                                                 chatroomId: selectedUser.chatroomId,
//                                             })}
//                                         >
//                                             <Text style={styles.button_text}>View Details</Text>
//                                         </TouchableOpacity>
//                                     </>
//                                     :
//                                     <TouchableOpacity
//                                         style={styles.button}
//                                         onPress={() => navigation.navigate(ROUTES.cleaner_schedule_details_view, {
//                                             item: currentMessage.details,
//                                             chatroomId: selectedUser.chatroomId,
//                                             scheduleId: currentMessage.details.selected_scheduleId
//                                         })}
//                                     >
//                                         <Text style={styles.button_text}>View Details</Text>
//                                     </TouchableOpacity>
//                                 }
//                                 <Text style={{ fontSize: 10, color: COLORS.light_gray }}>{moment(currentMessage.createdAt).format('h:mm A')}</Text>
//                             </View>
//                         }
//                         {currentMessage.status === 'Accepted' &&
//                             <View>
//                                 <View style={styles.details}>
//                                     <Text style={{ fontSize: 14, fontWeight: '600' }}>{currentMessage.details.selected_schedule.apartment_name}</Text>
//                                     <Text>{currentMessage.details.selected_schedule.address}</Text>
//                                     <Text style={{ fontSize: 12, color: COLORS.gray }}>{currentMessage.details.selected_schedule.cleaning_date} @ {currentMessage.details.selected_schedule.cleaning_time}</Text>
//                                     <Text style={{ fontSize: 16 }}>$ {currentMessage.details.selected_schedule.total_cleaning_fee}</Text>
//                                 </View>
//                                 <TouchableOpacity
//                                     style={styles.button}
//                                     onPress={() => navigation.navigate(ROUTES.host_confirm, {
//                                         item: currentMessage.details,
//                                         chatroomId: selectedUser.chatroomId,
//                                         selectedUser: selectedUser,
//                                         selectedSchedule: currentMessage.details.selected_schedule,
//                                         totalPrice: currentMessage.details.selected_schedule.totalPrice,
//                                         selected_scheduleId: currentMessage.details.selected_scheduleId,
//                                         assigned_to: currentMessage.details.assigned_to
//                                     })}
//                                 >
//                                     <Text style={styles.button_text}>Confirm</Text>
//                                 </TouchableOpacity>
//                                 <Text style={{ fontSize: 10, color: COLORS.light_gray }}>{moment(currentMessage.createdAt).format('h:mm A')}</Text>
//                             </View>
//                         }
//                     </View>
//                 </View>
//             );
//         } else {
//             return (
//                 <GiftedChat.Message
//                     {...currentMessage}
//                 />
//             );
//         }
//     };

//     const renderSend = (props) => {
//         return (
//             <Send {...props} text={text}>
//                 <View style={styles.sendButton}>
//                     <Ionicons name="send" size={24} color={COLORS.primary} />
//                 </View>
//             </Send>
//         );
//     };

//     const renderInputToolbar = (props) => {
//         return (
//             <View>
//                 <InputToolbar
//                     {...props}
//                     containerStyle={[
//                         styles.inputToolbar,
//                         showEmojiPicker && styles.inputToolbarWithEmoji
//                     ]}
//                     primaryStyle={styles.inputPrimary}
//                 />
//                 {showEmojiPicker && (
//                     <EmojiSelector
//                         onEmojiSelected={onEmojiSelected}
//                         visible={showEmojiPicker}
//                         columns={8}
//                         showSearchBar={true}
//                         showHistory={true}
//                         showSectionTitles={true}
//                         category="all"
//                         style={styles.emojiSelector}
//                     />
//                 )}
//             </View>
//         );
//     };

//     // Custom header for image viewer with delete button
//     const ImageViewerHeader = ({ imageIndex }) => {
//         const currentImage = imagesForViewing[imageIndex];
//         const isCurrentUserImage = currentImage && messages.some(msg => 
//             msg.image === currentImage.uri && msg.user._id === fbaseUser.userId
//         );

//         return (
//             <View style={styles.imageViewerHeader}>
//                 <Text style={styles.imageViewerText}>
//                     {imageIndex + 1} / {imagesForViewing.length}
//                 </Text>
//                 <View style={styles.headerButtons}>
//                     {isCurrentUserImage && (
//                         <TouchableOpacity 
//                             onPress={() => {
//                                 const message = messages.find(msg => msg.image === currentImage.uri);
//                                 if (message) {
//                                     deleteImage(currentImage.uri, message._id);
//                                 }
//                             }} 
//                             style={styles.deleteButton}
//                             disabled={deleting}
//                         >
//                             {deleting ? (
//                                 <ActivityIndicator size="small" color="white" />
//                             ) : (
//                                 <Ionicons name="trash" size={24} color="white" />
//                             )}
//                         </TouchableOpacity>
//                     )}
//                     <TouchableOpacity onPress={closeImageViewer} style={styles.closeButton}>
//                         <Ionicons name="close" size={28} color="white" />
//                     </TouchableOpacity>
//                 </View>
//             </View>
//         );
//     };

//     return (
//         <>
//             <StatusBar
//                 barStyle="light-content"
//                 backgroundColor={COLORS.primary}
//                 translucent={false}
//             />
//             <GiftedChat
//                 ref={giftedChatRef}
//                 key={selectedUser.chatroomId}
//                 messages={messages}
//                 onSend={newMessage => onSend(newMessage)}
//                 user={{
//                     _id: fbaseUser.userId,
//                 }}
//                 text={text}
//                 onInputTextChanged={setText}
//                 renderSend={renderSend}
//                 renderActions={renderActions}
//                 renderComposer={renderComposer}
//                 renderSystemMessage={renderCustomMessage}
//                 renderMessageImage={renderMessageImage}
//                 renderBubble={props => <CustomBubble {...props} />}
//                 renderInputToolbar={renderInputToolbar}
//                 inverted={true}
//                 minInputToolbarHeight={44}
//                 animateTextInput={false}
//                 isLoadingEarlier={isLoadingEarlier}
//                 loadEarlier={!allMessagesLoaded}
//                 onLoadEarlier={loadEarlierMessages}
//                 alwaysShowSend={true}
//                 placeholder="Type a message..."
//                 listViewProps={{
//                     onScroll: onScroll,
//                     scrollEventThrottle: 16,
//                 }}
//                 infiniteScroll
//             />
            
//             {/* Floating Scroll to Bottom Button */}
//             {showScrollToBottom && (
//                 <Animated.View style={[styles.scrollToBottomButton, { opacity: scrollToBottomButtonOpacity }]}>
//                     <TouchableOpacity onPress={scrollToBottom} style={styles.scrollToBottomTouchable}>
//                         <Ionicons name="chevron-down" size={24} color="white" />
//                     </TouchableOpacity>
//                 </Animated.View>
//             )}
            
//             {/* Image Viewer Modal */}
//             <ImageViewing
//                 images={imagesForViewing}
//                 imageIndex={currentImageIndex}
//                 visible={imageViewerVisible}
//                 onRequestClose={closeImageViewer}
//                 backgroundColor="rgba(0, 0, 0, 0.95)"
//                 swipeToCloseEnabled={true}
//                 doubleTapToZoomEnabled={true}
//                 HeaderComponent={ImageViewerHeader}
//             />

//             {uploading && (
//                 <View style={styles.uploadingContainer}>
//                     <ActivityIndicator size="large" color={COLORS.primary} />
//                     <Text style={styles.uploadingText}>Uploading image...</Text>
//                 </View>
//             )}

//             {loading && (
//                 <View style={styles.loadingContainer}>
//                     <ActivityIndicator size="large" color={COLORS.primary} />
//                     <Text style={styles.loadingText}>Loading messages...</Text>
//                 </View>
//             )}
//         </>
//     );
// }

// const styles = StyleSheet.create({
//     actionBar: {
//         backgroundColor: '#cacaca',
//         height: 41,
//         width: '100%',
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     avatar: {
//         width: 36,
//         height: 36,
//         borderRadius: 18,
//         marginLeft: 6
//     },
//     automated: {
//         width: '80%',
//         padding: 10,
//         backgroundColor: COLORS.white,
//         marginLeft: 10,
//         borderTopRightRadius: 10,
//         borderBottomRightRadius: 10,
//         borderBottomLeftRadius: 3,
//         borderTopLeftRadius: 3,
//         marginBottom: 2
//     },
//     button: {
//         borderRadius: 50,
//         paddingVertical: 10,
//         backgroundColor: COLORS.primary,
//         paddingHorizontal: 10,
//         marginVertical: 20
//     },
//     button_text: {
//         color: COLORS.white,
//         fontSize: 16,
//         textAlign: 'center'
//     },
//     details: {
//         marginVertical: 10,
//         backgroundColor: COLORS.primary_light_1,
//         padding: 20,
//         borderRadius: 5
//     },
//     inputToolbar: {
//         borderTopWidth: 1,
//         borderTopColor: '#e0e0e0',
//         backgroundColor: 'white',
//         paddingHorizontal: 8,
//     },
//     inputToolbarWithEmoji: {
//         marginBottom: 0,
//     },
//     inputPrimary: {
//         alignItems: 'center',
//     },
//     actionsContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     emojiButton: {
//         padding: 8,
//         marginLeft: 5,
//     },
//     cameraIcon: {
//         marginLeft: 5,
//         marginRight: 15,
//     },
//     composer: {
//         borderWidth: 1,
//         borderColor: '#e0e0e0',
//         borderRadius: 20,
//         paddingHorizontal: 12,
//         paddingVertical: 8,
//         marginHorizontal: 5,
//         maxHeight: 100,
//     },
//     sendButton: {
//         marginRight: 10,
//         marginBottom: 8,
//         padding: 4,
//     },
//     emojiSelector: {
//         height: 250,
//         backgroundColor: '#f0f0f0',
//     },
//     uploadingContainer: {
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         backgroundColor: 'rgba(0,0,0,0.7)',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     uploadingText: {
//         color: 'white',
//         marginTop: 10,
//         fontSize: 16,
//     },
//     loadingContainer: {
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         backgroundColor: 'rgba(255,255,255,0.8)',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     loadingText: {
//         color: COLORS.primary,
//         marginTop: 10,
//         fontSize: 16,
//     },
//     imageContainer: {
//       margin: 3,
//       borderRadius: 10,
//       overflow: 'hidden',
//       position: 'relative',
//     },
//     chatImage: {
//       width: 200,
//       height: 150,
//       borderRadius: 10,
//     },
//     zoomIndicator: {
//         position: 'absolute',
//         top: 8,
//         right: 8,
//         backgroundColor: 'rgba(0, 0, 0, 0.5)',
//         borderRadius: 12,
//         width: 24,
//         height: 24,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     deleteIndicator: {
//         position: 'absolute',
//         top: 8,
//         left: 8,
//         backgroundColor: 'rgba(255, 0, 0, 0.7)',
//         borderRadius: 10,
//         width: 20,
//         height: 20,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     imageViewerHeader: {
//         position: 'absolute',
//         top: 40,
//         left: 0,
//         right: 0,
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingHorizontal: 20,
//         paddingVertical: 10,
//         zIndex: 1,
//     },
//     headerButtons: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     deleteButton: {
//         padding: 5,
//         marginRight: 15,
//     },
//     closeButton: {
//         padding: 5,
//     },
//     imageViewerText: {
//         color: 'white',
//         fontSize: 16,
//         fontWeight: '600',
//     },
//     scrollToBottomButton: {
//         position: 'absolute',
//         bottom: 100,
//         right: 20,
//         backgroundColor: COLORS.primary,
//         borderRadius: 25,
//         width: 50,
//         height: 50,
//         justifyContent: 'center',
//         alignItems: 'center',
//         shadowColor: '#000',
//         shadowOffset: {
//             width: 0,
//             height: 2,
//         },
//         shadowOpacity: 0.25,
//         shadowRadius: 3.84,
//         elevation: 5,
//     },
//     scrollToBottomTouchable: {
//         width: '100%',
//         height: '100%',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
// });