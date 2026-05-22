import { create } from 'zustand'
import api from '../api/axios'

export const useLocationStore = create((set, get) => ({
  locations: [],
  primaryLocation: null,
  hasLocation: false,
  statusLoading: false,
  statusLoaded: false,
  error: null,

  fetchStatus: async () => {
    const { statusLoaded } = get()
    if (statusLoaded) {
      console.log('[LOCATION-STORE] Status already loaded, skipping fetch');
      return;
    }
    console.log('[LOCATION-STORE] Fetching location status...');
    set({ statusLoading: true, error: null })
    try {
      const res = await api.get('/locations/status')
      console.log('[LOCATION-STORE] Status response:', res.data);
      const data = res.data?.data || {}
      set({
        hasLocation: Boolean(data.hasLocation),
        primaryLocation: data.primaryLocation || null,
        statusLoaded: true,
        statusLoading: false,
      })
      console.log('[LOCATION-STORE] Status loaded successfully:', {
        hasLocation: Boolean(data.hasLocation),
        primaryLocation: data.primaryLocation
      });
    } catch (error) {
      console.error('[LOCATION-STORE] Failed to fetch status - Full error:', error)
      console.error('[LOCATION-STORE] Error response:', error.response?.data);
      console.error('[LOCATION-STORE] Error status:', error.response?.status);
      set({ statusLoading: false, error: error.response?.data?.error || 'Failed to load location status' })
    }
  },

  fetchLocations: async () => {
    try {
      const res = await api.get('/locations')
      const list = res.data?.data || []
      set({
        locations: list,
        primaryLocation: list.find((l) => l.isPrimary) || null,
        hasLocation: list.length > 0,
      })
      return list
    } catch (error) {
      console.error('[LocationStore] Failed to fetch locations', error)
      set({ error: error.response?.data?.error || 'Failed to load locations' })
      return []
    }
  },

  saveLocation: async (payload) => {
    const res = await api.post('/locations', payload)
    const saved = res.data?.data
    // Refresh list
    await get().fetchLocations()
    set({ hasLocation: true, primaryLocation: saved?.isPrimary ? saved : get().primaryLocation })
    return saved
  },

  updateLocation: async (locationId, payload) => {
    const res = await api.put(`/locations/${locationId}`, payload)
    await get().fetchLocations()
    return res.data?.data
  },

  setPrimary: async (locationId) => {
    const res = await api.post(`/locations/${locationId}/primary`)
    await get().fetchLocations()
    return res.data?.data
  },

  deleteLocation: async (locationId) => {
    await api.delete(`/locations/${locationId}`)
    await get().fetchLocations()
  },

  resetStatus: () => set({ statusLoaded: false, statusLoading: false }),
}))

export default useLocationStore
