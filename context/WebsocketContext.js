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



// contexts/WebSocketContext.js// contexts/WebSocketContext.js
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { connectWebSocket, disconnectWebSocket, sendWebSocketMessage, addMessageHandler, removeMessageHandler } from '../services/connection/websocket';
import { AuthContext } from './AuthContext';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const { userToken, isLoggedIn, currentUserId, setTotalUnreadCount } = useContext(AuthContext);
  const [isConnected, setIsConnected] = useState(false);
  const handlerAddedRef = useRef(false);

  // Global handler to increment total unread count on incoming messages
  useEffect(() => {
    if (!isConnected || !currentUserId) return;
    if (handlerAddedRef.current) return;

    const handleNewMessage = (data) => {
      console.log('🔔 Global WS handler received:', data);
      // Only increment for real messages (not translation_update, ping, etc.)
      if (data.conversation_id && data.sender_id && data.sender_id !== currentUserId && !data.type) {
        console.log('✅ Incrementing totalUnreadCount');
        setTotalUnreadCount(prev => prev + 1);
      } else {
        console.log('❌ Not incrementing: conditions not met', {
          hasConvId: !!data.conversation_id,
          hasSenderId: !!data.sender_id,
          isOther: data.sender_id !== currentUserId,
          noType: !data.type
        });
      }
    };
    addMessageHandler(handleNewMessage);
    handlerAddedRef.current = true;
    console.log('✅ Global WebSocket handler added');

    return () => {
      removeMessageHandler(handleNewMessage);
      handlerAddedRef.current = false;
    };
  }, [isConnected, currentUserId, setTotalUnreadCount]);

  useEffect(() => {
    if (isLoggedIn && userToken && currentUserId) {
      console.log('Connecting WebSocket for user', currentUserId);
      connectWebSocket(userToken, currentUserId, () => setIsConnected(true));
    } else {
      disconnectWebSocket();
      setIsConnected(false);
    }
    return () => disconnectWebSocket();
  }, [isLoggedIn, userToken, currentUserId]);

  const sendMessage = (recipientId, text, conversationId, imageUrl = null) => {
    return sendWebSocketMessage(recipientId, text, conversationId, imageUrl);
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, sendMessage, addMessageHandler, removeMessageHandler }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);