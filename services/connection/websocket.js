
import { Platform } from 'react-native';

let ws = null;
let reconnectAttempts = 0;
const MAX_RECONNECT = 5;
let reconnectTimeout = null;
let messageHandlers = [];
let pendingMessages = [];
let currentToken = null;
let currentCallback = null;

export const connectWebSocket = (token, userId, onMessageCallback = null) => {
  if (ws && ws.readyState === WebSocket.OPEN && currentToken === token) return;
  if (ws) disconnectWebSocket();

  currentToken = token;
  currentCallback = onMessageCallback;
  const wsUrl = `wss://www.freshsweeper.com/ws/chat?debug_user_id=${userId}`;
  console.log(`Connecting WebSocket: ${wsUrl}`);

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('WebSocket connected');
    reconnectAttempts = 0;
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    while (pendingMessages.length) {
      const msg = pendingMessages.shift();
      sendWebSocketMessage(msg.recipientId, msg.text, msg.conversationId, msg.image);
    }
  };

  // ws.onmessage = (event) => {
  //   try {
  //     const data = JSON.parse(event.data);
  //     // Ignore any ping/pong messages (if any)
  //     if (data.type === 'ping' || data.type === 'pong') return;
  //     messageHandlers.forEach(handler => handler(data));
  //     if (currentCallback) currentCallback(data);
  //   } catch (err) {
  //     console.error('WebSocket parse error:', err);
  //   }
  // };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('📨 Raw WebSocket message:', data);  // ADD THIS
      if (data.type === 'ping' || data.type === 'pong') return;
      messageHandlers.forEach(handler => handler(data));
      if (currentCallback) currentCallback(data);
    } catch (err) {
      console.error('WebSocket parse error:', err);
    }
  };

  ws.onerror = (error) => console.error('WebSocket error:', error);

  ws.onclose = (event) => {
    console.log(`WebSocket closed: ${event.code} - ${event.reason}`);
    if (reconnectAttempts < MAX_RECONNECT && event.code !== 1000) {
      reconnectTimeout = setTimeout(() => {
        reconnectAttempts++;
        console.log(`Reconnecting attempt ${reconnectAttempts}...`);
        connectWebSocket(token, userId, onMessageCallback);
      }, 2000 * reconnectAttempts);
    }
  };
};

export const disconnectWebSocket = () => {
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  if (ws) {
    ws.close(1000, 'Normal closure');
    ws = null;
  }
  currentToken = null;
  currentCallback = null;
  messageHandlers = [];
  pendingMessages = [];
};

export const sendWebSocketMessage = (recipientId, text, conversationId = null, image = null) => {
  console.log('📤 sendWebSocketMessage called', { recipientId, text, conversationId, image, wsReadyState: ws?.readyState });
  const message = { to: recipientId, text: text || '', conversation_id: conversationId, image: image };
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
    console.log('✅ Message sent');
    return true;
  } else {
    console.warn('WebSocket not open, message queued');
    pendingMessages.push({ recipientId, text, conversationId, image });
    return false;
  }
};

export const addMessageHandler = (handler) => {
  if (typeof handler === 'function') messageHandlers.push(handler);
};
export const removeMessageHandler = (handler) => {
  messageHandlers = messageHandlers.filter(h => h !== handler);
};
export const isWebSocketConnected = () => ws && ws.readyState === WebSocket.OPEN;