// import axios from 'axios';


// const api = axios.create({
//   // Uncomment the appropriate base URL for your needs
//   baseURL: 'http://rnzym-67-80-224-161.a.free.pinggy.link',
//   // baseURL: 'http://3.23.89.171:8000',
//   // baseURL: 'http://18.191.219.237:8000',
//   // baseURL: 'https://www.freshsweeper.com',
//   headers: {
//     'Content-type': 'application/json',
//   },
// });

// // Request Interceptor
// api.interceptors.request.use((config) => {
//   console.log('Request:', config); // Log request details
//   return config;
// }, (error) => {
//   console.error('Request Error:', error); // Log request error
//   return Promise.reject(error);
// });

// // Response Interceptor
// api.interceptors.response.use((response) => {
//   console.log('Response:', response); // Log response details
//   return response;
// }, (error) => {
//   console.error('Response Error:', error); // Log response error
//   return Promise.reject(error);
// });

// export default api;



import axios from 'axios';

// Define multiple base URLs
const BASE_URLS = {
  // local: 'http://localhost:8000',
  // local: 'http://rnzym-67-80-224-161.a.free.pinggy.link',
  local1: 'http://rnhcj-67-80-224-161.a.free.pinggy.link', // for uploading task images
  dev: 'http://3.23.89.171:8000',
  staging: 'http://18.191.219.237:8000',
  prod: 'https://www.freshsweeper.com',
  // prod: 'http://localhost:8000',
};

// Determine which environment to use (default to 'prod')
const ENV = process.env.REACT_APP_ENV || 'prod';

// Create an axios instance with dynamic baseURL
const http = axios.create({
  baseURL: BASE_URLS[ENV], // Dynamically select baseURL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Logging Interceptor
http.interceptors.request.use(
  (config) => {
    console.log('Request:', config); // Log requests
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

export default http;
