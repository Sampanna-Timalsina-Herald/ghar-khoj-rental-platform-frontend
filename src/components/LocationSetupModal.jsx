import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MapPin, Loader2, Crosshair, Navigation, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import LocationPicker from './LocationPicker'
import { useLocationStore } from '../stores/locationStore'

const LocationSetupModal = ({ isOpen, onClose, onCompleted, force = false }) => {
  const { saveLocation } = useLocationStore()
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [label, setLabel] = useState('Home')
  const [radiusKm, setRadiusKm] = useState(20)
  const [detecting, setDetecting] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleGeoDetect = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported in this browser')
      return
    }

    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const resolved = await reverseGeocode(latitude, longitude)
        setSelectedLocation(resolved)
        setDetecting(false)
      },
      (err) => {
        console.error('Geolocation error', err)
        toast.error('Unable to detect your location. Please pick it manually on the map.')
        setDetecting(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      )
      const data = await response.json()
      return {
        lat,
        lng,
        latitude: lat,
        longitude: lng,
        address: data.display_name,
        formatted: data.display_name,
        city: data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.state || '',
      }
    } catch (error) {
      console.error('Reverse geocode failed', error)
      return { lat, lng, latitude: lat, longitude: lng }
    }
  }

  const handleSave = async () => {
    if (!selectedLocation) {
      toast.warning('Please select a location on the map or use auto-detect.')
      return
    }

    setSaving(true)
    try {
      await saveLocation({
        label,
        city: selectedLocation.city,
        fullAddress: selectedLocation.address || selectedLocation.formatted,
        latitude: selectedLocation.lat ?? selectedLocation.latitude,
        longitude: selectedLocation.lng ?? selectedLocation.longitude,
        radiusKm: Number(radiusKm) || 20,
        isPrimary: true,
      })
      toast.success('Location saved. You can now continue.')
      onCompleted?.()
      if (!force) {
        onClose?.()
      }
    } catch (error) {
      console.error('Failed to save location', error)
      toast.error(error.response?.data?.error || 'Failed to save location')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin size={24} />
              <div>
                <p className="text-sm uppercase tracking-wide opacity-80">Location required</p>
                <h2 className="text-2xl font-bold">Set your preferred location</h2>
              </div>
            </div>
            {!force && (
              <button
                onClick={onClose}
                className="text-sm font-medium px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 transition"
              >
                Close
              </button>
            )}
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto flex-1">
            <div className="space-y-4 lg:col-span-1">
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2 text-gray-800 mb-2">
                  <ShieldCheck size={18} />
                  <p className="font-semibold">Why we ask for location</p>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Better recommendations near you</li>
                  <li>Faster search results within your radius</li>
                  <li>Accurate distance and map previews</li>
                </ul>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-800">Label</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Home, Work, Campus"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-800">Proximity radius (km)</label>
                <input
                  type="number"
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(e.target.value)}
                />
                <p className="text-xs text-gray-500">Recommendations will prioritize listings inside this radius.</p>
              </div>

              <button
                onClick={handleGeoDetect}
                disabled={detecting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {detecting ? <Loader2 size={18} className="animate-spin" /> : <Crosshair size={18} />}
                {detecting ? 'Detecting...' : 'Use my current location'}
              </button>

              {selectedLocation && (
                <div className="p-3 rounded-lg border border-green-200 bg-green-50 text-sm text-green-800">
                  <p className="font-semibold mb-1">Selected</p>
                  <p>{selectedLocation.formatted || selectedLocation.address}</p>
                  <p className="text-xs text-green-700">
                    {selectedLocation.city ? `${selectedLocation.city} • ` : ''}
                    {Number(selectedLocation.lat ?? selectedLocation.latitude)?.toFixed(5)}, {Number(selectedLocation.lng ?? selectedLocation.longitude)?.toFixed(5)}
                  </p>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-gray-800">
                  <Navigation size={18} />
                  <span className="font-semibold">Pick location on map</span>
                </div>
              </div>

              <LocationPicker
                initialLocation={selectedLocation}
                onLocationSelect={(loc) => setSelectedLocation(loc)}
              />

              <div className="flex justify-end gap-3 flex-wrap">
                {!force && (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold inline-flex items-center gap-2 hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
                  {saving ? 'Saving...' : 'Save location'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default LocationSetupModal
