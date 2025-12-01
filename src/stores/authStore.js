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
  token: localStorage.getItem('token'),
  role: localStorage.getItem('role'),
  isAuthenticated: !!localStorage.getItem('token'),
  authLoaded: false, // ✅ add this flag

  login: (userData, token, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('user', JSON.stringify(userData));

    set({
      user: userData,
      token,
      role,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');

    set({
      user: null,
      token: null,
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

    if (token && role && user) {
      set({
        user: JSON.parse(user),
        token,
        role,
        isAuthenticated: true,
        authLoaded: true, // ✅ mark as loaded
      });
    } else {
      // No user/token → still mark authLoaded true
      set({
        authLoaded: true,
      });
    }
  },
}));

