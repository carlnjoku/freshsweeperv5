// services/axiosInstance.js
import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../../utils/tokenManager';


const API_BASE = 'https://www.freshsweeper.com';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});



api.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    console.log('🔑 Token from storage:', token ? `${token.substring(0, 20)}...` : 'null');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Header set:', config.headers.Authorization);
    } else {
      console.warn('⚠️ No token found');
    }
    return config;
  });

// Response interceptor: handle 401 by refreshing token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request while refresh is ongoing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');
        const response = await axios.post(`${API_BASE}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        const newAccessToken = response.data.access_token;
        // Store the new access token (keep refresh token unchanged)
        await setTokens(newAccessToken, refreshToken);
        // Update default header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        // Retry queued requests
        processQueue(null, newAccessToken);
        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed – clear tokens and logout
        await clearTokens();
        // Optionally trigger a global logout event
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;