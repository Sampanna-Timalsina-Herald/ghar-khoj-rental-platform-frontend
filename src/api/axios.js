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
  withCredentials: true, // Enable cookies in requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach access token from memory or localStorage
api.interceptors.request.use(
  async (config) => {
    console.log('[AXIOS-REQUEST] Outgoing request:', config.url);
    
    // Skip token attachment for public endpoints
    const url = config.url || '';
    const isPublicEndpoint = url.includes('public') || 
                             url.includes('login') ||
                             url.includes('register') ||
                             url.includes('forgot-password') ||
                             url.includes('reset-password');
    
    console.log('[AXIOS-REQUEST] Is public endpoint?', isPublicEndpoint, 'URL:', url);
    
    if (!isPublicEndpoint) {
      // Always try localStorage first as it's the source of truth
      let token = localStorage.getItem('token');
      
      // If not in localStorage, try store
      if (!token) {
        const authStore = useAuthStore.getState();
        token = authStore.accessToken || authStore.token;
      }

      if (token) {
        // Ensure token doesn't have "Bearer " prefix already
        const cleanToken = token.replace(/^Bearer\s+/i, '');
        config.headers.Authorization = `Bearer ${cleanToken}`;
        console.log('[AXIOS-REQUEST] ✅ Token attached to request:', config.url);
        console.log('[AXIOS-REQUEST] Token preview:', cleanToken.substring(0, 30) + '...');
        console.log('[AXIOS-REQUEST] Authorization header:', config.headers.Authorization.substring(0, 40) + '...');
      } else {
        console.error('[AXIOS-REQUEST] ❌ NO TOKEN AVAILABLE for:', config.url);
        console.error('[AXIOS-REQUEST] localStorage token:', localStorage.getItem('token'));
        console.error('[AXIOS-REQUEST] Store token:', useAuthStore.getState().token);
      }
    } else {
      console.log('[AXIOS-REQUEST] Skipping token for public endpoint:', url);
    }

    // Don't set Content-Type for FormData - let browser handle it
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    } else {
      // Remove Content-Type header for FormData so browser sets it with boundary
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 (access token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore.getState();
    const originalRequest = error.config;

    // CRITICAL ERROR LOGGING - Display in alert for debugging
    const errorDetails = {
      status: error.response?.status,
      url: originalRequest?.url,
      role: authStore.role,
      hasToken: !!localStorage.getItem('token'),
      errorMessage: error.response?.data?.error || error.message,
      fullError: error.response?.data
    };
    
    console.error('🔴 [AXIOS-INTERCEPTOR] ERROR CAUGHT:', errorDetails);
    
    // If this is a tenant and there's an error, show alert
    if (authStore.role === 'tenant' && error.response?.status === 401) {
      console.error('🚨 TENANT 401 ERROR - DETAILS:', JSON.stringify(errorDetails, null, 2));
      // Store error for display
      window.TENANT_LOGIN_ERROR = errorDetails;
    }

    // Only retry if:
    // 1. Status is 401
    // 2. Not retried yet
    // 3. Not login or public endpoint
    const isLoginOrPublic = originalRequest.url.includes("/auth/login") || 
                           originalRequest.url.includes("/auth/register") ||
                           originalRequest.url.includes("/auth/forgot-password") ||
                           originalRequest.url.includes("/auth/reset-password") ||
                           originalRequest.url.includes("/auth/refresh-token") ||
                           originalRequest.url.includes("/public/");

    // Skip refresh for /auth/me to prevent infinite loops
    const isAuthMe = originalRequest.url.includes("/auth/me");

    if (error.response?.status === 401 && !originalRequest._retry && !isLoginOrPublic && !isAuthMe) {
      console.log('[AXIOS-INTERCEPTOR] 401 detected');
      console.log('[AXIOS-INTERCEPTOR] Original request URL:', originalRequest.url);
      console.log('[AXIOS-INTERCEPTOR] Token in localStorage:', !!localStorage.getItem('token'));
      
      // For cross-origin deployments, refresh tokens via cookies don't work
      // Instead of trying to refresh, just logout and redirect to login
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      if (token) {
        console.error('[AXIOS-INTERCEPTOR] Token exists but request failed');
        console.error('[AXIOS-INTERCEPTOR] This usually means:');
        console.error('  1. Token expired (access token has short lifetime)');
        console.error('  2. Refresh token cookies not working (cross-origin issue)');
        console.error('  3. Backend not recognizing the token');
        
        // Store detailed error for display
        window.TENANT_TOKEN_ERROR = {
          message: 'Token authentication failed - Session expired',
          token: token.substring(0, 30) + '...',
          url: originalRequest.url,
          role: role,
          suggestion: 'Your session has expired. This happens because refresh tokens via cookies do not work across different domains. You need to login again.'
        };
        
        // For tenant, delay logout to show error
        if (role === 'tenant') {
          console.error('⏰ Waiting 5 seconds before logout to allow error inspection...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
        authStore.logout();
        if (!window.location.pathname.includes('/login')) {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
      
      // If no token at all, just reject
      return Promise.reject(error);
    }
    
    // For other errors or if already retried, just return the error
    return Promise.reject(error);
  }
);

export default api;
