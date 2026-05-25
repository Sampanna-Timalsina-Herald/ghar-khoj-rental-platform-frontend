// import axios from 'axios'
// import { useAuthStore } from '../stores/authStore'

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// export const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// })

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token')
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`
//     }
//     return config
//   },
//   (error) => Promise.reject(error)
// )

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       useAuthStore.getState().logout()
//       window.location.href = '/login'
//     }
//     return Promise.reject(error)
//   }
// )

// export default api
import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach access token from memory or localStorage
api.interceptors.request.use(
  (config) => {
    const url = config.url || '';
    
    // Skip token for auth endpoints
    const isAuthEndpoint = url.includes('login') || url.includes('register') || 
                          url.includes('forgot-password') || url.includes('reset-password') ||
                          url.includes('public');
    
    if (!isAuthEndpoint) {
      const token = localStorage.getItem('token');
      if (token) {
        // Remove any existing Bearer prefix and add it fresh
        const cleanToken = token.replace(/^Bearer\s+/i, '');
        config.headers['Authorization'] = `Bearer ${cleanToken}`;
        console.log('[AXIOS] Token attached to:', url);
      } else {
        console.error('[AXIOS] NO TOKEN for:', url);
      }
    }

    // For FormData requests, let the browser set the Content-Type header automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      console.log('[AXIOS] FormData detected - Content-Type header removed for auto-detection');
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and not already retried, logout user
    if (error.response?.status === 401 && !originalRequest._isRetry) {
      originalRequest._isRetry = true;
      
      const authStore = useAuthStore.getState();
      
      // Don't logout for login/register endpoints
      const isAuthEndpoint = originalRequest.url?.includes('login') || 
                            originalRequest.url?.includes('register');
      
      if (!isAuthEndpoint) {
        console.error('[AXIOS] 401 Unauthorized - Logging out');
        authStore.logout();
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
