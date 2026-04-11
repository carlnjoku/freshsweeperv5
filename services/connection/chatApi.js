// services/chatApi.js
import React, { useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import api from './axiosInstance'; // import the configured axios instance



// const { currentUserId, userToken } = useContext(AuthContext);

// Set token (this is now handled by the interceptor, but you can keep it for manual override)
export const setChatAuthToken = (token) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Fetch all conversations
// export const getConversations = async (currentUserId) => {
    
// //   const res = await api.get('/api/conversations/get_messages');
//   const res = await api.get(`/api/conversations/get_messages?debug_user_id=${currentUserId}`);
//   return res.data;
// };

export const getConversations = async (currentUserId, lang = 'en') => {
    const response = await api.get(`/api/conversations/get_messages?debug_user_id=${currentUserId}&lang=${lang}`);
  return response.data;
};


// Create a new conversation
export const createConversation = async (currentUserId, otherUserId, schedule, scheduleId, cleaningFee, initialMessage) => {
    const res = await api.post(`/api/conversations?debug_user_id=${currentUserId}`, {
      otherUserId: otherUserId,
      schedule: schedule,
      scheduleId: scheduleId,
      cleaningFee: cleaningFee,
      initialMessage: initialMessage,
    });
    return res.data;
  };


// Fetch messages for a specific conversation
// export const getMessages = async (conversationId, currentUserId) => {
//     const res = await api.get(`/api/conversations/get_conversations/${conversationId}/messages?debug_user_id=${currentUserId}`);
//     return res.data;
//   };



  export const getMessages = async (conversationId, currentUserId, queryParams = {}) => {
    const params = new URLSearchParams({ debug_user_id: currentUserId, ...queryParams });
    const response = await api.get(`/api/conversations/get_conversations/${conversationId}/messages?${params.toString()}`);
    return response.data;
  };
  
  // Mark a conversation as read
  export const markConversationRead = async (conversationId, currentUserId) => {
    await api.post(`/api/conversations/mark_conversation_as_read/${conversationId}/read?debug_user_id=${currentUserId}`);
  };

  

// Upload an image
export const uploadImage = async (uri) => {
  const formData = new FormData();
  formData.append('image', {
    uri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  });
  const res = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.url;
};