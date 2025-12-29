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
    // Always try localStorage first as it's the source of truth
    let token = localStorage.getItem('token');
    
    // If not in localStorage, try store
    if (!token) {
      const authStore = useAuthStore.getState();
      token = authStore.accessToken || authStore.token;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

    // Only retry if:
    // 1. Status is 401
    // 2. Not retried yet
    // 3. Not login or public endpoint
    const isLoginOrPublic = originalRequest.url.includes("/auth/login") || 
                           originalRequest.url.includes("/auth/register") ||
                           originalRequest.url.includes("/auth/forgot-password") ||
                           originalRequest.url.includes("/auth/reset-password") ||
                           originalRequest.url.includes("/auth/refresh-token");

    // Skip refresh for /auth/me to prevent infinite loops
    const isAuthMe = originalRequest.url.includes("/auth/me");

    if (error.response?.status === 401 && !originalRequest._retry && !isLoginOrPublic && !isAuthMe) {
      originalRequest._retry = true;

      try {
        // Check if user is authenticated before trying to refresh
        if (!authStore.isAuthenticated || !authStore.accessToken) {
          return Promise.reject(error);
        }

        // Call refresh token endpoint
        const res = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {}
        );

        // Update access token in store (memory)
        if (res.data.accessToken) {
          authStore.setAccessToken(res.data.accessToken);
          // Also update localStorage token
          localStorage.setItem('token', res.data.accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear auth and redirect only if not on auth/me
        if (!isAuthMe) {
          authStore.logout();
          // Only redirect if not already on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = "/login";
          }
        }
        return Promise.reject(refreshError);
      }
    }
    
    // For 401 errors, return the error (don't retry if already retried or if auth/me)
    return Promise.reject(error);
  }
);

export default api;
