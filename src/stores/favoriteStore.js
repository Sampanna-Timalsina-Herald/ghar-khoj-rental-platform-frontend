import { create } from 'zustand'

export const useFavoriteStore = create((set) => ({
  favorites: [],
  
  setFavorites: (favorites) => set({ favorites }),
  
  addFavorite: (listingId) => set((state) => ({
    favorites: [...state.favorites, listingId],
  })),
  
  removeFavorite: (listingId) => set((state) => ({
    favorites: state.favorites.filter((id) => id !== listingId),
  })),
  
  isFavorite: (listingId) => (state) => state.favorites.includes(listingId),
}))
