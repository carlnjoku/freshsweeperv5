// // contexts/WebSocketContext.js
// import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
// import { connectWebSocket, disconnectWebSocket, sendWebSocketMessage, addMessageHandler, removeMessageHandler } from '../services/connection/websocket';
// import { AuthContext } from './AuthContext';

// const WebSocketContext = createContext();

// export const WebSocketProvider = ({ children }) => {
//   const { userToken, isLoggedIn, currentUserId } = useContext(AuthContext);
//   const [isConnected, setIsConnected] = useState(false);

//   useEffect(() => {
//     if (isLoggedIn && userToken && currentUserId) {
//       connectWebSocket(userToken, currentUserId, () => setIsConnected(true));
//     } else {
//       disconnectWebSocket();
//       setIsConnected(false);
//     }
//     return () => disconnectWebSocket();
//   }, [isLoggedIn, userToken, currentUserId]);

//   const sendMessage = (recipientId, text, conversationId, imageUrl = null) => {
//     return sendWebSocketMessage(recipientId, text, conversationId, imageUrl);
//   };

//   return (
//     <WebSocketContext.Provider value={{ isConnected, sendMessage, addMessageHandler, removeMessageHandler }}>
//       {children}
//     </WebSocketContext.Provider>
//   );
// };

// export const useWebSocket = () => useContext(WebSocketContext);



// // contexts/WebSocketContext.js// contexts/WebSocketContext.js
// import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
// import { connectWebSocket, disconnectWebSocket, sendWebSocketMessage, addMessageHandler, removeMessageHandler } from '../services/connection/websocket';
// import { AuthContext } from './AuthContext';

// const WebSocketContext = createContext();

// export const WebSocketProvider = ({ children }) => {
//   const { userToken, isLoggedIn, currentUserId, setTotalUnreadCount } = useContext(AuthContext);
//   const [isConnected, setIsConnected] = useState(false);
//   const handlerAddedRef = useRef(false);

//   // Global handler to increment total unread count on incoming messages
//   useEffect(() => {
//     if (!isConnected || !currentUserId) return;
//     if (handlerAddedRef.current) return;

//     const handleNewMessage = (data) => {
//       console.log('🔔 Global WS handler received:', data);
//       // Only increment for real messages (not translation_update, ping, etc.)
//       if (data.conversation_id && data.sender_id && data.sender_id !== currentUserId && !data.type) {
//         console.log('✅ Incrementing totalUnreadCount');
//         setTotalUnreadCount(prev => prev + 1);
//       } else {
//         console.log('❌ Not incrementing: conditions not met', {
//           hasConvId: !!data.conversation_id,
//           hasSenderId: !!data.sender_id,
//           isOther: data.sender_id !== currentUserId,
//           noType: !data.type
//         });
//       }
//     };
//     addMessageHandler(handleNewMessage);
//     handlerAddedRef.current = true;
//     console.log('✅ Global WebSocket handler added');

//     return () => {
//       removeMessageHandler(handleNewMessage);
//       handlerAddedRef.current = false;
//     };
//   }, [isConnected, currentUserId, setTotalUnreadCount]);

//   useEffect(() => {
//     if (isLoggedIn && userToken && currentUserId) {
//       console.log('Connecting WebSocket for user', currentUserId);
//       connectWebSocket(userToken, currentUserId, () => setIsConnected(true));
//     } else {
//       disconnectWebSocket();
//       setIsConnected(false);
//     }
//     return () => disconnectWebSocket();
//   }, [isLoggedIn, userToken, currentUserId]);

//   const sendMessage = (recipientId, text, conversationId, imageUrl = null) => {
//     return sendWebSocketMessage(recipientId, text, conversationId, imageUrl);
//   };

//   return (
//     <WebSocketContext.Provider value={{ isConnected, sendMessage, addMessageHandler, removeMessageHandler }}>
//       {children}
//     </WebSocketContext.Provider>
//   );
// };

// export const useWebSocket = () => useContext(WebSocketContext);



// Update your WebSocketContext.js
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { 
  connectWebSocket, 
  disconnectWebSocket, 
  sendWebSocketMessage, 
  addMessageHandler, 
  removeMessageHandler,
  getConnectionStats,
  isWebSocketConnected,
  clearPendingMessages
} from '../services/connection/websocket';
import { sendRawWebSocketMessage } from '../services/connection/websocket';
import { AuthContext } from './AuthContext';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const { userToken, isLoggedIn, currentUserId, setTotalUnreadCount } = useContext(AuthContext);
  const [isConnected, setIsConnected] = useState(false);
  const handlerAddedRef = useRef(false);
  const reconnectAttemptRef = useRef(0);
  

  // Global handler for incoming messages
  useEffect(() => {
    if (!isConnected || !currentUserId) return;
    if (handlerAddedRef.current) return;

    const handleNewMessage = (data) => {
      console.log('🔔 Global handler received:', data);
      
      // Check if this is a new message
      if (data.type === 'message' || (data.conversation_id && (data.text || data.image))) {
        const senderId = data.sender_id || data.senderId;
        const isFromOtherUser = senderId && senderId !== currentUserId;
        
        if (isFromOtherUser) {
          console.log('📬 New message from other user, incrementing unread count');
          setTotalUnreadCount(prev => prev + 1);
        }
      }
      
      // Handle connection errors
      if (data.type === 'error') {
        console.error('WebSocket error received:', data.message);
      }
    };
    
    addMessageHandler(handleNewMessage);
    handlerAddedRef.current = true;
    console.log('✅ Global message handler registered');

    return () => {
      removeMessageHandler(handleNewMessage);
      handlerAddedRef.current = false;
    };
  }, [isConnected, currentUserId, setTotalUnreadCount]);

  // Connect/disconnect WebSocket
  useEffect(() => {
    if (isLoggedIn && currentUserId) {
      console.log('🔌 Initializing WebSocket connection for user:', currentUserId);
      
      connectWebSocket(
        userToken,
        currentUserId,
        () => {
          console.log('✅ WebSocket connected');
          setIsConnected(true);
          reconnectAttemptRef.current = 0;
          // Clear any pending messages on successful connection
          clearPendingMessages();
        },
        () => {
          console.log('❌ WebSocket disconnected');
          setIsConnected(false);
        }
      );
    } else {
      if (isConnected) {
        console.log('🔌 User logged out, disconnecting WebSocket');
        disconnectWebSocket();
        setIsConnected(false);
      }
    }
    
    return () => {
      disconnectWebSocket();
      setIsConnected(false);
    };
  }, [isLoggedIn, currentUserId, userToken]);

  // Monitor connection and try to keep it alive
  useEffect(() => {
    if (!isConnected && isLoggedIn && currentUserId) {
      const timer = setTimeout(() => {
        console.log('🔄 Connection lost, attempting to reconnect...');
        connectWebSocket(
          userToken,
          currentUserId,
          () => {
            console.log('✅ WebSocket reconnected');
            setIsConnected(true);
          },
          () => {
            console.log('❌ WebSocket disconnected');
            setIsConnected(false);
          }
        );
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isConnected, isLoggedIn, currentUserId, userToken]);

  // Periodic connection health check
  useEffect(() => {
    if (!isConnected) return;
    
    const interval = setInterval(() => {
      const stats = getConnectionStats();
      if (!stats.isConnected && isConnected) {
        console.warn('⚠️ Connection health check failed, updating state');
        setIsConnected(false);
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [isConnected]);

  const sendMessage = (recipientId, text, conversationId, imageUrl = null) => {
    if (!recipientId) {
      console.error('❌ Cannot send message: No recipient ID');
      return false;
    }
    
    if (!conversationId) {
      console.error('❌ Cannot send message: No conversation ID');
      return false;
    }
    
    console.log('📤 Sending message via WebSocket:', { recipientId, conversationId, textLength: text?.length });
    const result = sendWebSocketMessage(recipientId, text, conversationId, imageUrl);
    
    // If not connected, the message is queued and will be sent when reconnected
    if (!result) {
      console.log('📦 Message queued for later delivery');
    }
    
    return result;
  };

  

  // Inside WebSocketProvider, add this function
  const sendRawMessage = (message) => {
    if (!isConnected) {
      console.warn('⚠️ Cannot send raw message: WebSocket not connected');
      return false;
    }
    return sendRawWebSocketMessage(message);
  };

  const value = {
    isConnected,
    sendMessage,
    addMessageHandler,
    sendRawMessage,
    removeMessageHandler,
    getConnectionStats
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};