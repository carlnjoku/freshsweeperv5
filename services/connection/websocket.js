
// import { Platform } from 'react-native';

// let ws = null;
// let reconnectAttempts = 0;
// const MAX_RECONNECT = 5;
// let reconnectTimeout = null;
// let messageHandlers = [];
// let pendingMessages = [];
// let currentToken = null;
// let currentCallback = null;

// export const connectWebSocket = (token, userId, onMessageCallback = null) => {
//   if (ws && ws.readyState === WebSocket.OPEN && currentToken === token) return;
//   if (ws) disconnectWebSocket();

//   currentToken = token;
//   currentCallback = onMessageCallback;
//   const wsUrl = `wss://www.freshsweeper.com/ws/chat?debug_user_id=${userId}`;
//   console.log(`Connecting WebSocket: ${wsUrl}`);

//   ws = new WebSocket(wsUrl);

//   ws.onopen = () => {
//     console.log('WebSocket connected');
//     reconnectAttempts = 0;
//     if (reconnectTimeout) clearTimeout(reconnectTimeout);
//     while (pendingMessages.length) {
//       const msg = pendingMessages.shift();
//       sendWebSocketMessage(msg.recipientId, msg.text, msg.conversationId, msg.image);
//     }
//   };

//   // ws.onmessage = (event) => {
//   //   try {
//   //     const data = JSON.parse(event.data);
//   //     // Ignore any ping/pong messages (if any)
//   //     if (data.type === 'ping' || data.type === 'pong') return;
//   //     messageHandlers.forEach(handler => handler(data));
//   //     if (currentCallback) currentCallback(data);
//   //   } catch (err) {
//   //     console.error('WebSocket parse error:', err);
//   //   }
//   // };

//   ws.onmessage = (event) => {
//     try {
//       const data = JSON.parse(event.data);
//       console.log('📨 Raw WebSocket message:', data);  // ADD THIS
//       if (data.type === 'ping' || data.type === 'pong') return;
//       messageHandlers.forEach(handler => handler(data));
//       if (currentCallback) currentCallback(data);
//     } catch (err) {
//       console.error('WebSocket parse error:', err);
//     }
//   };

//   ws.onerror = (error) => console.error('WebSocket error:', error);

//   ws.onclose = (event) => {
//     console.log(`WebSocket closed: ${event.code} - ${event.reason}`);
//     if (reconnectAttempts < MAX_RECONNECT && event.code !== 1000) {
//       reconnectTimeout = setTimeout(() => {
//         reconnectAttempts++;
//         console.log(`Reconnecting attempt ${reconnectAttempts}...`);
//         connectWebSocket(token, userId, onMessageCallback);
//       }, 2000 * reconnectAttempts);
//     }
//   };
// };

// export const disconnectWebSocket = () => {
//   if (reconnectTimeout) clearTimeout(reconnectTimeout);
//   if (ws) {
//     ws.close(1000, 'Normal closure');
//     ws = null;
//   }
//   currentToken = null;
//   currentCallback = null;
//   messageHandlers = [];
//   pendingMessages = [];
// };

// export const sendWebSocketMessage = (recipientId, text, conversationId = null, image = null) => {
//   console.log('📤 sendWebSocketMessage called', { recipientId, text, conversationId, image, wsReadyState: ws?.readyState });
//   const message = { to: recipientId, text: text || '', conversation_id: conversationId, image: image };
//   if (ws && ws.readyState === WebSocket.OPEN) {
//     ws.send(JSON.stringify(message));
//     console.log('✅ Message sent');
//     return true;
//   } else {
//     console.warn('WebSocket not open, message queued');
//     pendingMessages.push({ recipientId, text, conversationId, image });
//     return false;
//   }
// };

// export const addMessageHandler = (handler) => {
//   if (typeof handler === 'function') messageHandlers.push(handler);
// };
// export const removeMessageHandler = (handler) => {
//   messageHandlers = messageHandlers.filter(h => h !== handler);
// };
// export const isWebSocketConnected = () => ws && ws.readyState === WebSocket.OPEN;






// import { Platform } from 'react-native';

// let ws = null;
// let reconnectAttempts = 0;
// const MAX_RECONNECT = 5;
// let reconnectTimeout = null;
// let messageHandlers = [];
// let pendingMessages = [];
// let currentToken = null;
// let currentCallback = null;
// let heartbeatInterval = null;
// let isClosing = false;
// let connectionStatus = 'disconnected'; // 'connecting', 'open', 'closing', 'closed'

// const startHeartbeat = () => {
//   if (heartbeatInterval) clearInterval(heartbeatInterval);
//   heartbeatInterval = setInterval(() => {
//     if (ws && ws.readyState === WebSocket.OPEN && !isClosing && connectionStatus === 'open') {
//       console.log('💓 Sending ping');
//       ws.send(JSON.stringify({ type: 'ping' }));
//     }
//   }, 25000);
// };

// const stopHeartbeat = () => {
//   if (heartbeatInterval) {
//     clearInterval(heartbeatInterval);
//     heartbeatInterval = null;
//   }
// };

// export const connectWebSocket = (token, userId, onMessageCallback = null) => {
//   if (ws && ws.readyState === WebSocket.OPEN && currentToken === token) {
//     console.log('WebSocket already open');
//     return;
//   }
//   if (ws) disconnectWebSocket();

//   currentToken = token;
//   currentCallback = onMessageCallback;
//   const wsUrl = `wss://www.freshsweeper.com/ws/chat?debug_user_id=${userId}`;
//   console.log(`Connecting WebSocket: ${wsUrl}`);

//   ws = new WebSocket(wsUrl);
//   isClosing = false;
//   connectionStatus = 'connecting';

//   ws.onopen = () => {
//     console.log('WebSocket connected and open');
//     connectionStatus = 'open';
//     reconnectAttempts = 0;
//     if (reconnectTimeout) clearTimeout(reconnectTimeout);
//     startHeartbeat();
    
//     // Send any pending messages that were queued while connecting
//     console.log(`Sending ${pendingMessages.length} pending messages...`);
//     while (pendingMessages.length) {
//       const msg = pendingMessages.shift();
//       sendWebSocketMessage(msg.recipientId, msg.text, msg.conversationId, msg.image);
//     }
//   };

//   ws.onmessage = (event) => {
//     try {
//       const data = JSON.parse(event.data);
//       console.log('📨 Raw WebSocket message:', data);
      
//       if (data.type === 'ping') {
//         console.log('💓 Received ping, sending pong');
//         ws.send(JSON.stringify({ type: 'pong' }));
//         return;
//       }
//       if (data.type === 'pong') {
//         console.log('💓 Received pong');
//         return;
//       }
      
//       messageHandlers.forEach(handler => handler(data));
//       if (currentCallback) currentCallback(data);
//     } catch (err) {
//       console.error('WebSocket parse error:', err);
//     }
//   };

//   ws.onerror = (error) => {
//     console.error('WebSocket error:', error);
//     connectionStatus = 'error';
//   };

//   ws.onclose = (event) => {
//     console.log(`WebSocket closed: ${event.code} - ${event.reason}`);
//     connectionStatus = 'closed';
//     isClosing = true;
//     stopHeartbeat();
    
//     if (reconnectAttempts < MAX_RECONNECT && event.code !== 1000) {
//       reconnectTimeout = setTimeout(() => {
//         reconnectAttempts++;
//         console.log(`Reconnecting attempt ${reconnectAttempts}...`);
//         connectWebSocket(token, userId, onMessageCallback);
//       }, 2000 * reconnectAttempts);
//     }
//   };
// };

// export const disconnectWebSocket = () => {
//   isClosing = true;
//   connectionStatus = 'closing';
//   stopHeartbeat();
//   if (reconnectTimeout) clearTimeout(reconnectTimeout);
//   if (ws) {
//     ws.close(1000, 'Normal closure');
//     ws = null;
//   }
//   currentToken = null;
//   currentCallback = null;
//   messageHandlers = [];
//   pendingMessages = [];
//   connectionStatus = 'disconnected';
// };

// export const sendWebSocketMessage = (recipientId, text, conversationId = null, image = null) => {
//   console.log('📤 sendWebSocketMessage called', { 
//     recipientId, text, conversationId, image, 
//     wsReadyState: ws?.readyState, 
//     connectionStatus 
//   });
  
//   const message = { to: recipientId, text: text || '', conversation_id: conversationId, image: image };
  
//   if (ws && ws.readyState === WebSocket.OPEN && connectionStatus === 'open') {
//     ws.send(JSON.stringify(message));
//     console.log('✅ Message sent immediately');
//     return true;
//   } else {
//     console.warn(`WebSocket not open (state: ${ws?.readyState}, status: ${connectionStatus}), message queued`);
//     pendingMessages.push({ recipientId, text, conversationId, image });
    
//     // Try to reconnect if not already trying
//     if (connectionStatus !== 'connecting' && (!ws || ws.readyState !== WebSocket.CONNECTING)) {
//       console.log('Attempting to reconnect...');
//       connectWebSocket(currentToken, recipientId, currentCallback);
//     }
//     return false;
//   }
// };

// export const addMessageHandler = (handler) => {
//   if (typeof handler === 'function') messageHandlers.push(handler);
// };

// export const removeMessageHandler = (handler) => {
//   messageHandlers = messageHandlers.filter(h => h !== handler);
// };

// export const isWebSocketConnected = () => {
//   return ws && ws.readyState === WebSocket.OPEN && connectionStatus === 'open';
// };

// export const getConnectionStatus = () => connectionStatus;













// import { Platform } from 'react-native';

// let ws = null;
// let reconnectAttempts = 0;
// const MAX_RECONNECT = 5;
// let reconnectTimeout = null;
// let messageHandlers = [];
// let pendingMessages = [];
// let currentUserId = null;
// let currentToken = null;
// let currentCallback = null;
// let heartbeatInterval = null;
// let isClosing = false;
// let connectionStatus = 'disconnected';

// const startHeartbeat = () => {
//   if (heartbeatInterval) clearInterval(heartbeatInterval);
//   heartbeatInterval = setInterval(() => {
//     if (ws && ws.readyState === WebSocket.OPEN && !isClosing && connectionStatus === 'open') {
//       console.log('💓 Sending ping');
//       ws.send(JSON.stringify({ type: 'ping' }));
//     }
//   }, 25000);
// };

// const stopHeartbeat = () => {
//   if (heartbeatInterval) {
//     clearInterval(heartbeatInterval);
//     heartbeatInterval = null;
//   }
// };

// export const connectWebSocket = (token, userId, onConnectCallback = null, onDisconnectCallback = null) => {
//   if (!userId) {
//     console.error('Cannot connect WebSocket: No user ID provided');
//     return;
//   }
  
//   currentUserId = userId;
//   currentToken = token;
//   currentCallback = onConnectCallback;
  
//   if (ws && ws.readyState === WebSocket.OPEN) {
//     console.log('WebSocket already open for user:', userId);
//     if (onConnectCallback) onConnectCallback();
//     return;
//   }
  
//   if (ws) disconnectWebSocket();

//   // Use debug_user_id parameter (matching your backend logs)
//   const wsUrl = `wss://www.freshsweeper.com/ws/chat?debug_user_id=${userId}`;
//   console.log(`Connecting WebSocket with debug_user_id: ${userId}`);

//   ws = new WebSocket(wsUrl);
//   isClosing = false;
//   connectionStatus = 'connecting';

//   ws.onopen = () => {
//     console.log('✅ WebSocket connected and open for user:', currentUserId);
//     connectionStatus = 'open';
//     reconnectAttempts = 0;
//     if (reconnectTimeout) clearTimeout(reconnectTimeout);
//     startHeartbeat();
    
//     // Send authentication with user_id
//     const authMessage = {
//       type: 'auth',
//       user_id: currentUserId
//     };
//     ws.send(JSON.stringify(authMessage));
//     console.log('🔐 Sent authentication');
    
//     // Send any pending messages
//     console.log(`📦 Sending ${pendingMessages.length} pending messages...`);
//     while (pendingMessages.length) {
//       const msg = pendingMessages.shift();
//       sendWebSocketMessage(msg.recipientId, msg.text, msg.conversationId, msg.image);
//     }
    
//     if (onConnectCallback) onConnectCallback();
//   };

//   ws.onmessage = (event) => {
//     try {
//       const data = JSON.parse(event.data);
//       console.log('📨 Raw WebSocket message:', data);
      
//       if (data.type === 'ping') {
//         ws.send(JSON.stringify({ type: 'pong' }));
//         return;
//       }
//       if (data.type === 'pong') {
//         return;
//       }
//       if (data.type === 'auth_success') {
//         console.log('✅ Authentication successful');
//         return;
//       }
//       if (data.type === 'error') {
//         console.error('❌ WebSocket error:', data.message);
//         messageHandlers.forEach(handler => handler(data));
//         if (currentCallback) currentCallback(data);
//         return;
//       }
      
//       // Normalize message format
//       const normalizedData = {
//         ...data,
//         conversation_id: data.conversation_id || data.conversationId,
//         conversationId: data.conversationId || data.conversation_id,
//         sender_id: data.sender_id || data.senderId,
//         senderId: data.senderId || data.sender_id,
//         _id: data._id || data.id,
//         id: data.id || data._id,
//       };
      
//       messageHandlers.forEach(handler => {
//         try {
//           handler(normalizedData);
//         } catch (err) {
//           console.error('Error in message handler:', err);
//         }
//       });
      
//       if (currentCallback) currentCallback(normalizedData);
//     } catch (err) {
//       console.error('WebSocket parse error:', err, event.data);
//     }
//   };

//   ws.onerror = (error) => {
//     console.error('❌ WebSocket error:', error);
//     connectionStatus = 'error';
//   };

//   ws.onclose = (event) => {
//     console.log(`🔌 WebSocket closed: ${event.code} - ${event.reason || 'No reason'}`);
//     connectionStatus = 'closed';
//     isClosing = true;
//     stopHeartbeat();
    
//     if (onDisconnectCallback) onDisconnectCallback();
    
//     if (reconnectAttempts < MAX_RECONNECT && event.code !== 1000 && event.code !== 1001) {
//       const delay = Math.min(30000, 2000 * Math.pow(2, reconnectAttempts));
//       console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1})...`);
      
//       reconnectTimeout = setTimeout(() => {
//         reconnectAttempts++;
//         connectWebSocket(currentToken, currentUserId, currentCallback, onDisconnectCallback);
//       }, delay);
//     } else {
//       console.log('Max reconnection attempts reached');
//       reconnectAttempts = 0;
//     }
//   };
// };

// export const disconnectWebSocket = () => {
//   console.log('Disconnecting WebSocket...');
//   isClosing = true;
//   connectionStatus = 'closing';
//   stopHeartbeat();
//   if (reconnectTimeout) {
//     clearTimeout(reconnectTimeout);
//     reconnectTimeout = null;
//   }
//   if (ws) {
//     ws.close(1000, 'Normal closure');
//     ws = null;
//   }
//   currentUserId = null;
//   currentToken = null;
//   currentCallback = null;
//   messageHandlers = [];
//   pendingMessages = [];
//   connectionStatus = 'disconnected';
//   reconnectAttempts = 0;
//   console.log('WebSocket disconnected');
// };

// export const sendWebSocketMessage = (recipientId, text, conversationId = null, image = null) => {
//   console.log('📤 sendWebSocketMessage called', { 
//     recipientId, 
//     text: text?.substring(0, 50), 
//     conversationId, 
//     image: image ? 'present' : null,
//     wsReadyState: ws?.readyState, 
//     connectionStatus,
//     currentUserId
//   });
  
//   if (!currentUserId) {
//     console.error('Cannot send message: No current user ID');
//     return false;
//   }
  
//   const message = { 
//     type: 'message',
//     recipient_id: recipientId,
//     sender_id: currentUserId,
//     text: text || '', 
//     conversation_id: conversationId,
//     image: image || null,
//     timestamp: new Date().toISOString()
//   };
  
//   if (ws && ws.readyState === WebSocket.OPEN && connectionStatus === 'open') {
//     try {
//       const messageStr = JSON.stringify(message);
//       ws.send(messageStr);
//       console.log('✅ Message sent:', messageStr);
//       return true;
//     } catch (error) {
//       console.error('Error sending message:', error);
//       return false;
//     }
//   } else {
//     console.warn(`⚠️ WebSocket not open, queuing message`);
//     pendingMessages.push({ recipientId, text, conversationId, image });
//     return false;
//   }
// };

// export const addMessageHandler = (handler) => {
//   if (typeof handler === 'function') {
//     messageHandlers.push(handler);
//     console.log('➕ Message handler added, total:', messageHandlers.length);
//   }
// };

// export const removeMessageHandler = (handler) => {
//   messageHandlers = messageHandlers.filter(h => h !== handler);
//   console.log('➖ Message handler removed, total:', messageHandlers.length);
// };

// export const isWebSocketConnected = () => {
//   return ws && ws.readyState === WebSocket.OPEN && connectionStatus === 'open';
// };

// export const getConnectionStatus = () => connectionStatus;

// export const clearPendingMessages = () => {
//   const count = pendingMessages.length;
//   pendingMessages = [];
//   console.log(`Cleared ${count} pending messages`);
//   return count;
// };

// export const getConnectionStats = () => ({
//   isConnected: isWebSocketConnected(),
//   status: connectionStatus,
//   readyState: ws?.readyState,
//   pendingMessages: pendingMessages.length,
//   reconnectAttempts,
//   handlersCount: messageHandlers.length,
//   currentUserId
// });








import { Platform } from 'react-native';
import { AppState } from 'react-native';

let ws = null;
let reconnectAttempts = 0;
const MAX_RECONNECT = 20;
let reconnectTimeout = null;
let messageHandlers = [];
let pendingMessages = [];
let currentUserId = null;
let currentToken = null;
let onConnectCallback = null;
let onDisconnectCallback = null;
let heartbeatInterval = null;
let isClosing = false;
let connectionStatus = 'disconnected';
let appStateSubscription = null;
let forcedClose = false;

const startHeartbeat = () => {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  heartbeatInterval = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN && !isClosing && connectionStatus === 'open') {
      console.log('💓 Sending ping');
      try {
        ws.send(JSON.stringify({ type: 'ping' }));
      } catch (err) {
        console.error('Error sending ping:', err);
      }
    }
  }, 25000);
};

const stopHeartbeat = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
};

// Handle app state changes
const setupAppStateListener = () => {
  if (appStateSubscription) return;
  
  appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active' && currentUserId && !forcedClose) {
      console.log('📱 App came to foreground, checking WebSocket connection...');
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.log('🔄 Reconnecting WebSocket...');
        connectWebSocket(currentToken, currentUserId, onConnectCallback, onDisconnectCallback);
      }
    }
  });
};

const cleanupAppStateListener = () => {
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
};

export const connectWebSocket = (token, userId, onConnect = null, onDisconnect = null) => {
  if (!userId) {
    console.error('❌ Cannot connect WebSocket: No user ID provided');
    return;
  }
  
  currentUserId = userId;
  currentToken = token;
  onConnectCallback = onConnect;
  onDisconnectCallback = onDisconnect;
  forcedClose = false;
  
  // Check if already connected
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log('✅ WebSocket already open for user:', userId);
    if (onConnectCallback) onConnectCallback();
    return;
  }
  
  // Check if connection is in progress
  if (ws && ws.readyState === WebSocket.CONNECTING) {
    console.log('⏳ WebSocket connection already in progress');
    return;
  }
  
  // Close existing connection
  if (ws) {
    try {
      ws.close();
    } catch (err) {
      console.error('Error closing existing WebSocket:', err);
    }
    ws = null;
  }

  // Connect with debug_user_id
  const wsUrl = `wss://www.freshsweeper.com/ws/chat?debug_user_id=${userId}`;
  console.log(`🔌 Connecting WebSocket for user: ${userId}`);

  try {
    ws = new WebSocket(wsUrl);
    isClosing = false;
    connectionStatus = 'connecting';

    ws.onopen = () => {
      console.log('✅ WebSocket connected successfully');
      connectionStatus = 'open';
      reconnectAttempts = 0;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      startHeartbeat();
      setupAppStateListener();
      
      // Send authentication
      // const authMessage = {
      //   type: 'auth',
      //   user_id: currentUserId
      // };
      // try {
      //   ws.send(JSON.stringify(authMessage));
      //   console.log('🔐 Authentication sent');
      // } catch (err) {
      //   console.error('Error sending auth:', err);
      // }
      
      // Send any pending messages
      if (pendingMessages.length > 0) {
        console.log(`📦 Sending ${pendingMessages.length} pending messages...`);
        const messagesToSend = [...pendingMessages];
        pendingMessages = [];
        for (const msg of messagesToSend) {
          setTimeout(() => {
            sendWebSocketMessage(msg.recipientId, msg.text, msg.conversationId, msg.image);
          }, 100);
        }
      }
      
      if (onConnectCallback) onConnectCallback();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Received:', JSON.stringify(data));
        
        // Handle different message types
        if (data.type === 'ping') {
          try {
            ws.send(JSON.stringify({ type: 'pong' }));
          } catch (err) {
            console.error('Error sending pong:', err);
          }
          return;
        }
        if (data.type === 'pong') {
          return;
        }
        if (data.type === 'auth_success') {
          console.log('✅ Authentication successful');
          return;
        }
        if (data.type === 'error') {
          console.error('❌ Server error:', data.message);
          // Broadcast error to handlers
          messageHandlers.forEach(handler => {
            try {
              handler({ type: 'error', message: data.message });
            } catch (err) {
              console.error('Error in error handler:', err);
            }
          });
          return;
        }
        
        // Handle regular messages
        if (data.conversation_id || data.message) {
          console.log('💬 Processing message:', data);
        }
        
        // Notify all handlers
        messageHandlers.forEach(handler => {
          try {
            handler(data);
          } catch (err) {
            console.error('Error in message handler:', err);
          }
        });
        
      } catch (err) {
        console.error('WebSocket parse error:', err, event.data);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      connectionStatus = 'error';
      // Don't disconnect on error, let onclose handle it
    };

    ws.onclose = (event) => {
      console.log(`🔌 WebSocket closed: ${event.code} - ${event.reason || 'No reason'}`);
      connectionStatus = 'closed';
      stopHeartbeat();
      
      if (onDisconnectCallback && !forcedClose) onDisconnectCallback();
      
      // Attempt to reconnect if not manually closed
      if (!forcedClose && reconnectAttempts < MAX_RECONNECT && currentUserId) {
        const delay = Math.min(30000, 1000 * Math.pow(1.5, reconnectAttempts));
        console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${MAX_RECONNECT})...`);
        
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(() => {
          reconnectAttempts++;
          connectWebSocket(currentToken, currentUserId, onConnectCallback, onDisconnectCallback);
        }, delay);
      } else if (!forcedClose) {
        console.log('❌ Max reconnection attempts reached, will retry on app focus');
        reconnectAttempts = 0;
      }
    };
  } catch (error) {
    console.error('Error creating WebSocket:', error);
    connectionStatus = 'error';
  }
};

export const disconnectWebSocket = () => {
  console.log('🔌 Disconnecting WebSocket...');
  forcedClose = true;
  isClosing = true;
  connectionStatus = 'closing';
  stopHeartbeat();
  cleanupAppStateListener();
  
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  
  if (ws) {
    try {
      ws.close(1000, 'Normal closure');
    } catch (err) {
      console.error('Error closing WebSocket:', err);
    }
    ws = null;
  }
  
  currentUserId = null;
  currentToken = null;
  onConnectCallback = null;
  onDisconnectCallback = null;
  connectionStatus = 'disconnected';
  reconnectAttempts = 0;
  console.log('✅ WebSocket disconnected');
};

export const sendWebSocketMessage = (recipientId, text, conversationId = null, image = null) => {
  console.log('📤 Sending message:', { 
    recipientId, 
    text: text?.substring(0, 50), 
    conversationId, 
    hasImage: !!image,
    wsState: ws?.readyState,
    connectionStatus,
    currentUserId
  });
  
  if (!currentUserId) {
    console.error('❌ Cannot send: No user ID');
    return false;
  }
  
  if (!recipientId) {
    console.error('❌ Cannot send: No recipient ID');
    return false;
  }
  
  if (!conversationId) {
    console.error('❌ Cannot send: No conversation ID');
    return false;
  }
  
  const message = {
    to: recipientId,
    text: text || '',
    conversation_id: conversationId
  };
  
  if (image) {
    message.image = image;
  }
  
  // Try to send immediately if connected
  if (ws && ws.readyState === WebSocket.OPEN && connectionStatus === 'open') {
    try {
      const messageStr = JSON.stringify(message);
      ws.send(messageStr);
      console.log('✅ Message sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      // Queue the message on error
      pendingMessages.push({ recipientId, text, conversationId, image });
      return false;
    }
  } else {
    console.warn(`⚠️ WebSocket not open (state: ${ws?.readyState}), queueing message`);
    pendingMessages.push({ recipientId, text, conversationId, image });
    
    // Try to reconnect immediately
    if (connectionStatus !== 'connecting' && (!ws || ws.readyState !== WebSocket.CONNECTING) && currentUserId && !forcedClose) {
      console.log('🔄 Attempting immediate reconnect...');
      connectWebSocket(currentToken, currentUserId, onConnectCallback, onDisconnectCallback);
    }
    return false;
  }
};

export const addMessageHandler = (handler) => {
  if (typeof handler === 'function') {
    messageHandlers.push(handler);
    console.log(`➕ Message handler added (total: ${messageHandlers.length})`);
  }
};

export const removeMessageHandler = (handler) => {
  const initialLength = messageHandlers.length;
  messageHandlers = messageHandlers.filter(h => h !== handler);
  console.log(`➖ Message handler removed (${initialLength - messageHandlers.length} removed, ${messageHandlers.length} remaining)`);
};

export const isWebSocketConnected = () => {
  return ws && ws.readyState === WebSocket.OPEN && connectionStatus === 'open';
};

export const getConnectionStatus = () => connectionStatus;

export const clearPendingMessages = () => {
  const count = pendingMessages.length;
  pendingMessages = [];
  console.log(`🧹 Cleared ${count} pending messages`);
  return count;
};

export const getConnectionStats = () => ({
  isConnected: isWebSocketConnected(),
  status: connectionStatus,
  readyState: ws?.readyState,
  pendingMessages: pendingMessages.length,
  reconnectAttempts,
  handlersCount: messageHandlers.length,
  currentUserId
});

export const sendRawWebSocketMessage = (message) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn('⚠️ Cannot send raw message: WebSocket not open');
    return false;
  }
  
  try {
    const messageStr = JSON.stringify(message);
    ws.send(messageStr);
    console.log('✅ Raw message sent:', message);
    return true;
  } catch (error) {
    console.error('Error sending raw message:', error);
    return false;
  }
};