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

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  accessToken: null,
  role: null,
  isAuthenticated: false,
  authLoaded: false,

  login: (userData, token, role) => {
    console.log('[AuthStore] Login: Saving token and user data');
    
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
    });
    
    // Verify persistence
    const savedToken = localStorage.getItem('token');
    console.log('[AuthStore] Token persisted:', savedToken ? 'YES' : 'NO');
  },

  setAccessToken: (token) => {
    localStorage.setItem('token', token);
    set({ accessToken: token, token });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');

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
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const user = localStorage.getItem('user');

    console.log('[AuthStore] LoadFromStorage:', {
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 30) + '...' : 'NONE',
      hasRole: !!role,
      hasUser: !!user,
    });

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

