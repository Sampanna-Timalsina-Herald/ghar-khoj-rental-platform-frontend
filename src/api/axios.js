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
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // send cookies automatically
});

// Request interceptor: attach access token from memory
api.interceptors.request.use(
  async (config) => {
    const authStore = useAuthStore.getState();
    const token = authStore.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    const isLoginOrPublic = originalRequest.url.includes("/auth/login") || originalRequest.url.includes("/auth/register");

    if (error.response?.status === 401 && !originalRequest._retry && !isLoginOrPublic) {
      originalRequest._retry = true;

      try {
        // Call refresh token endpoint (cookie automatically sent)
        const res = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {}, // no body needed
          { withCredentials: true }
        );

        // Update access token in store (memory)
        authStore.setAccessToken(res.data.accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Logout if refresh fails
        authStore.logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
