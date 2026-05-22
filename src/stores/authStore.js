// import { create } from 'zustand'

// export const useAuthStore = create((set) => ({
//   user: null,
//   token: localStorage.getItem('token'),
//   role: localStorage.getItem('role'),
//   isAuthenticated: !!localStorage.getItem('token'),

//   login: (userData, token, role) => {
//     localStorage.setItem('token', token)
//     localStorage.setItem('role', role)
//     localStorage.setItem('user', JSON.stringify(userData))
//     set({
//       user: userData,
//       token,
//       role,
//       isAuthenticated: true,
//     })
//     Navigate()
//   },

//   logout: () => {
//     localStorage.removeItem('token')
//     localStorage.removeItem('role')
//     localStorage.removeItem('user')
//     set({
//       user: null,
//       token: null,
//       role: null,
//       isAuthenticated: false,
//     })
//   },

//   setUser: (userData) => {
//     localStorage.setItem('user', JSON.stringify(userData))
//     set({ user: userData })
//   },

//   loadFromStorage: () => {
//     const token = localStorage.getItem('token')
//     const role = localStorage.getItem('role')
//     const user = localStorage.getItem('user')
//     if (token && role && user) {
//       set({
//         user: JSON.parse(user),
//         token,
//         role,
//         isAuthenticated: true,
//       })
//     }
//   },
// }))

import { create } from 'zustand';
import { useLocationStore } from './locationStore';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  accessToken: null,
  role: null,
  isAuthenticated: false,
  authLoaded: false,

  login: (userData, token, role) => {
    // Save to localStorage first
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('user', JSON.stringify(userData));

    // Then update state
    set({
      user: userData,
      token,
      accessToken: token,
      role,
      isAuthenticated: true,
      authLoaded: true,
    });
  },

  setAccessToken: (token) => {
    localStorage.setItem('token', token);
    set({ accessToken: token, token });
  },

  logout: () => {
    console.log('[AUTH-STORE] LOGOUT CALLED - Stack trace:', new Error().stack);
    console.log('[AUTH-STORE] Current role:', get().role);
    console.log('[AUTH-STORE] Current user:', get().user);
    
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');

    // Reset any location gating state
    try {
      const resetStatus = useLocationStore.getState().resetStatus;
      resetStatus?.();
    } catch (error) {
      console.warn('[AuthStore] Failed to reset location store on logout', error);
    }

    set({
      user: null,
      token: null,
      accessToken: null,
      role: null,
      isAuthenticated: false,
    });
  },

  setUser: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData });
  },

  loadFromStorage: () => {
    // Guard: Only load once
    if (get().authLoaded) {
      return;
    }

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const user = localStorage.getItem('user');

    if (token && role && user) {
      set({
        user: JSON.parse(user),
        token,
        accessToken: token,
        role,
        isAuthenticated: true,
        authLoaded: true,
      });
    } else {
      set({
        authLoaded: true,
      });
    }
  },
}));

