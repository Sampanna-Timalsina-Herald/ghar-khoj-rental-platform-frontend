import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, DollarSign, Home, Sparkles, Check } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment', icon: '🏢' },
  { value: 'house', label: 'House', icon: '🏠' },
  { value: 'room', label: 'Room', icon: '🚪' },
];

const AMENITIES = [
  { value: 'Wifi', label: 'WiFi', icon: '📶' },
  { value: 'Parking', label: 'Parking', icon: '🚗' },
  { value: 'Balcony', label: 'Balcony', icon: '🌿' },
  { value: 'Garden', label: 'Garden', icon: '🌳' },
  { value: 'AC', label: 'AC', icon: '❄️' },
];

const LOCATIONS = [
  'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Baneshwor', 'Thamel',
  'Patan', 'Kirtipur', 'Balaju', 'Koteshwor', 'Chabahil'
];

const PreferencesModal = ({ isOpen, onClose, onSave, isFirstTime = false }) => {
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    locations: [],
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    propertyTypes: [],
    amenities: [],
  });

  const handleLocationToggle = (location) => {
    setPreferences(prev => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter(l => l !== location)
        : [...prev.locations, location]
    }));
  };

  const handlePropertyTypeToggle = (type) => {
    setPreferences(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type]
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setPreferences(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (preferences.locations.length === 0) {
      addToast('Please select at least one location', 'warning', 4000);
      return;
    }

    if (preferences.minPrice && preferences.maxPrice) {
      const min = parseInt(preferences.minPrice);
      const max = parseInt(preferences.maxPrice);
      if (min > max) {
        addToast('Minimum price cannot be greater than maximum price', 'error', 4000);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await api.post('/preferences', {
        ...preferences,
        minPrice: preferences.minPrice ? parseInt(preferences.minPrice) : null,
        maxPrice: preferences.maxPrice ? parseInt(preferences.maxPrice) : null,
        bedrooms: preferences.bedrooms ? parseInt(preferences.bedrooms) : null,
        hasSetPreferences: true
      });

      if (response.data.success) {
        addToast('Preferences saved successfully! You\'ll receive email notifications for matching properties.', 'success', 5000);
        onSave?.();
        onClose();
      } else {
        addToast(response.data.message || 'Failed to save preferences', 'error', 4000);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      
      // Handle different error types
      if (error.response) {
        // Server responded with error
        const errorMessage = error.response.data?.error || error.response.data?.message || 'Failed to save preferences';
        addToast(errorMessage, 'error', 5000);
      } else if (error.request) {
        // Request made but no response
        addToast('Network error. Please check your connection and try again.', 'error', 5000);
      } else {
        // Something else happened
        addToast('An unexpected error occurred. Please try again.', 'error', 4000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">
                    {isFirstTime ? 'Welcome! Set Your Preferences' : 'Update Your Preferences'}
                  </h2>
                </div>
                {!isFirstTime && (
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition"
                  >
                    <X size={24} />
                  </button>
                )}
              </div>
              <p className="text-white/90">
                {isFirstTime 
                  ? "Tell us what you're looking for, and we'll notify you when matching properties are listed!"
                  : "Update your preferences to get better property recommendations"}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Step 1: Locations */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="text-indigo-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Preferred Locations</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {LOCATIONS.map(location => (
                  <motion.button
                    key={location}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleLocationToggle(location)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      preferences.locations.includes(location)
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                        : 'border-gray-200 hover:border-indigo-300 text-gray-700'
                    }`}
                  >
                    {preferences.locations.includes(location) && (
                      <Check size={16} className="inline mr-1" />
                    )}
                    {location}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Step 2: Price Range */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="text-green-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Price Range (Monthly)</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Price (Rs.)
                  </label>
                  <input
                    type="number"
                    value={preferences.minPrice}
                    onChange={(e) => setPreferences(prev => ({ ...prev, minPrice: e.target.value }))}
                    placeholder="e.g., 10000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price (Rs.)
                  </label>
                  <input
                    type="number"
                    value={preferences.maxPrice}
                    onChange={(e) => setPreferences(prev => ({ ...prev, maxPrice: e.target.value }))}
                    placeholder="e.g., 50000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Bedrooms */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Home className="text-blue-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Minimum Bedrooms</h3>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(num => (
                  <motion.button
                    key={num}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPreferences(prev => ({ ...prev, bedrooms: num.toString() }))}
                    className={`p-4 rounded-xl border-2 transition-all font-semibold ${
                      preferences.bedrooms === num.toString()
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300 text-gray-700'
                    }`}
                  >
                    {num}+ BHK
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Step 4: Property Types */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Property Types</h3>
              <div className="grid grid-cols-3 gap-3">
                {PROPERTY_TYPES.map(type => (
                  <motion.button
                    key={type.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePropertyTypeToggle(type.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      preferences.propertyTypes.includes(type.value)
                        ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold'
                        : 'border-gray-200 hover:border-purple-300 text-gray-700'
                    }`}
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <div className="text-sm">{type.label}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Step 5: Amenities */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Preferred Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AMENITIES.map(amenity => (
                  <motion.button
                    key={amenity.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAmenityToggle(amenity.value)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      preferences.amenities.includes(amenity.value)
                        ? 'border-pink-600 bg-pink-50 text-pink-700 font-semibold'
                        : 'border-gray-200 hover:border-pink-300 text-gray-700'
                    }`}
                  >
                    <span className="text-xl mr-2">{amenity.icon}</span>
                    {amenity.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-between gap-4">
            {isFirstTime && (
              <button
                onClick={handleSkip}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition"
              >
                Skip for now
              </button>
            )}
            <div className="flex gap-3 ml-auto">
              {!isFirstTime && (
                <button
                  onClick={onClose}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PreferencesModal;
