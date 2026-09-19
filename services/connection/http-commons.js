// // import axios from 'axios';


// // const api = axios.create({
// //   // Uncomment the appropriate base URL for your needs
// //   baseURL: 'http://rnzym-67-80-224-161.a.free.pinggy.link',
// //   // baseURL: 'http://3.23.89.171:8000',
// //   // baseURL: 'http://18.191.219.237:8000',
// //   // baseURL: 'https://www.freshsweeper.com',
// //   headers: {
// //     'Content-type': 'application/json',
// //   },
// // });

// // // Request Interceptor
// // api.interceptors.request.use((config) => {
// //   console.log('Request:', config); // Log request details
// //   return config;
// // }, (error) => {
// //   console.error('Request Error:', error); // Log request error
// //   return Promise.reject(error);
// // });

// // // Response Interceptor
// // api.interceptors.response.use((response) => {
// //   console.log('Response:', response); // Log response details
// //   return response;
// // }, (error) => {
// //   console.error('Response Error:', error); // Log response error
// //   return Promise.reject(error);
// // });

// // export default api;



// import axios from 'axios';

// // Define multiple base URLs
// const BASE_URLS = {
//   // local: 'http://localhost:8000',
//   // local: 'http://rnzym-67-80-224-161.a.free.pinggy.link',
//   local1: 'http://rnhcj-67-80-224-161.a.free.pinggy.link', // for uploading task images
//   dev: 'http://3.23.89.171:8000',
//   staging: 'http://18.191.219.237:8000',
//   prod: 'https://www.freshsweeper.com',
//   // prod: 'http://localhost:8000',
// };

// // Determine which environment to use (default to 'prod')
// const ENV = process.env.REACT_APP_ENV || 'prod';

// // Create an axios instance with dynamic baseURL
// const http = axios.create({
//   baseURL: BASE_URLS[ENV], // Dynamically select baseURL
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Logging Interceptor
// http.interceptors.request.use(
//   (config) => {
//     console.log('Request:', config); // Log requests
//     return config;
//   },
//   (error) => {
//     console.error('Request Error:', error);
//     return Promise.reject(error);
//   }
// );

// export default http;



// 


// http-commons.js
// http-commons.js
import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../../utils/tokenManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URLS = {
  local1: 'http://rnhcj-67-80-224-161.a.free.pinggy.link',
  local: 'http://localhost:8000',
  dev: 'http://3.23.89.171:8000',
  staging: 'http://18.191.219.237:8000',
  prod: 'https://www.freshsweeper.com',
};

const ENV = process.env.REACT_APP_ENV || 'local';

const http = axios.create({
  baseURL: BASE_URLS[ENV],
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ---- Request Interceptor ----
http.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🚀 Request:', config.url, config.method);
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response Interceptor with Refresh ----
// http.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       if (isRefreshing) {
//         // If a refresh is already in progress, queue this request
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then((token) => {
//             originalRequest.headers.Authorization = `Bearer ${token}`;
//             return http(originalRequest);
//           })
//           .catch((err) => Promise.reject(err));
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         const refreshToken = await getRefreshToken();
//         if (!refreshToken) {
//           throw new Error('No refresh token available');
//         }

//         // Call refresh endpoint
//         const response = await axios.post(
//           `${BASE_URLS[ENV]}/api/auth/refresh`,
//           { refresh_token: refreshToken }
//         );

//         console.log('🔄 Refresh response:', response.data);

//         const newAccessToken = response.data.access_token;
//         if (!newAccessToken) {
//           throw new Error('No access token in refresh response');
//         }

//         // Store the new access token (keep refresh token unchanged)
//         await setTokens(newAccessToken, refreshToken);
//         console.log('✅ Tokens stored');

//         // Verify we can retrieve it again
//         const retrieved = await getAccessToken();
//         console.log('🔍 Retrieved token after storage:', retrieved ? retrieved.substring(0, 30) + '...' : 'null');

//         // Update the failed request with new token
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//         console.log('📤 Retry headers:', originalRequest.headers);

//         // Process queued requests
//         processQueue(null, newAccessToken);

//         // Retry the original request
//         return http(originalRequest);
//       } catch (refreshError) {
//         console.error('Refresh failed:', refreshError);
//         // Clear all tokens and force logout
//         await clearTokens();
//         await AsyncStorage.removeItem('@storage_Key'); // clear user data too
//         processQueue(refreshError, null);
//         // You can navigate to login screen here using a navigation ref
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   }
// );

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ Skip refresh for login, signup, and google auth endpoints
    if (originalRequest.url.includes('/auth/login') ||
        originalRequest.url.includes('/auth/google_auth') ||
        originalRequest.url.includes('/auth/signup')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            const newConfig = {
              ...originalRequest,
              headers: {
                ...originalRequest.headers,
                Authorization: `Bearer ${token}`,
              },
            };
            return http(newConfig);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        console.log('🔄 Refresh token:', refreshToken ? 'present' : 'null');

        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(
          `${BASE_URLS[ENV]}/api/auth/refresh`,
          { refresh_token: refreshToken }
        );

        const newAccessToken = response.data.access_token;
        console.log('🔑 New access token:', newAccessToken ? newAccessToken.substring(0, 30) + '...' : 'null');

        if (!newAccessToken) throw new Error('No access token in refresh response');

        // Store the new access token
        await setTokens(newAccessToken, refreshToken);
        console.log('✅ Tokens stored');

        // Verify retrieval
        const storedToken = await getAccessToken();
        console.log('🔍 Retrieved token after storage:', storedToken ? storedToken.substring(0, 30) + '...' : 'null');

        // Create a new config with the updated token
        const newConfig = {
          ...originalRequest,
          headers: {
            ...originalRequest.headers,
            Authorization: `Bearer ${newAccessToken}`,
          },
        };
        console.log('📤 Retry headers:', newConfig.headers);

        processQueue(null, newAccessToken);
        return http(newConfig);
      } catch (refreshError) {
        console.error('❌ Refresh failed:', refreshError);
        await clearTokens();
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default http;



