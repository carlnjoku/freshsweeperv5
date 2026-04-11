// ChatConversation.js (simplified)
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
import { CameraView, useCameraPermissions } from 'expo-camera';
import userService from '../../services/connection/userService';
import EmojiSelector from 'react-native-emoji-selector';
import ImageViewing from 'react-native-image-viewing';
import { useFocusEffect } from '@react-navigation/native';
import { connectWebSocket, sendMessage, disconnectWebSocket } from '../services/websocket';

export default function ChatConversation({ navigation, route }) {
  const { selectedUser, currentUser } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    // Load historical messages from your REST API
    loadHistory();

    // Connect WebSocket
    const token =  AsyncStorage.getItem('token'); // or from context
    const ws = connectWebSocket(token, handleIncomingMessage);

    return () => {
      disconnectWebSocket();
    };
  }, []);

  const handleIncomingMessage = (message) => {
    // Add message to state
    setMessages(prev => [...prev, message]);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    // Optionally check for contact info as before
    if (containsContactInfo(inputText)) {
      Alert.alert('Contact info not allowed');
      return;
    }

    const newMessage = {
      _id: Date.now(),
      text: inputText,
      sender: currentUser.userId,
      createdAt: new Date(),
    };

    // Send via WebSocket
    sendMessage(selectedUser.userId, inputText, conversationId);

    // Also update UI optimistically (or wait for server echo)
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primary}
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea}>
        {/* Header - commented out but preserved */}
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