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
    if (statusLoaded) return
    set({ statusLoading: true, error: null })
    try {
      const res = await api.get('/locations/status')
      const data = res.data?.data || {}
      set({
        hasLocation: Boolean(data.hasLocation),
        primaryLocation: data.primaryLocation || null,
        statusLoaded: true,
        statusLoading: false,
      })
    } catch (error) {
      console.error('[LocationStore] Failed to fetch status', error)
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
