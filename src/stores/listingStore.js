import { create } from 'zustand'

export const useListingStore = create((set) => ({
  listings: [],
  selectedListing: null,
  filters: {
    location: '',
    minPrice: null,
    maxPrice: null,
    bedrooms: null,
    type: 'all',
    furnished: 'all',
  },

  setListings: (listings) => set({ listings }),
  setSelectedListing: (listing) => set({ selectedListing: listing }),
  setFilters: (filters) => set({ filters }),

  addListing: (listing) => set((state) => ({
    listings: [listing, ...state.listings],
  })),

  updateListing: (id, updates) => set((state) => ({
    listings: state.listings.map((listing) =>
      listing.id === id ? { ...listing, ...updates } : listing
    ),
  })),

  removeListing: (id) => set((state) => ({
    listings: state.listings.filter((listing) => listing.id !== id),
  })),
}))
