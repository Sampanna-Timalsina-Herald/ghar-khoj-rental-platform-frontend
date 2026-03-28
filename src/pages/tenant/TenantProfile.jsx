import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import api from '../../api/axios'
import { useAuthStore } from '../../stores/authStore'
import { useLocationStore } from '../../stores/locationStore'
import { User, Mail, Phone, MapPin, GraduationCap, Camera, Save, Loader2, Lock, Eye, EyeOff, Users, Settings } from 'lucide-react'
import CollegeSelect from '../../components/CollegeSelect'
import PreferencesModal from '../../components/PreferencesModal'
import LocationSetupModal from '../../components/LocationSetupModal'

const TenantProfile = () => {
  const { user } = useAuthStore()
  const { locations, primaryLocation, fetchLocations, setPrimary, deleteLocation } = useLocationStore()
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false)
  const [preferences, setPreferences] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [originalFormData, setOriginalFormData] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    college: '',
    profileImage: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    // Only fetch if user is authenticated
    const { isAuthenticated } = useAuthStore.getState()
    if (isAuthenticated) {
      fetchProfile()
      fetchPreferences()
      fetchLocations()
    } else {
      setLoading(false)
      toast.error('Please log in to view your profile.')
    }
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    
    try {
      // Check if we have a token before making the request
      const { accessToken, isAuthenticated } = useAuthStore.getState()
      if (!isAuthenticated || !accessToken) {
        toast.error('Session expired. Please log in again.')
        setLoading(false)
        return
      }

      const response = await api.get('/auth/me')
      if (response.data.success) {
        const userData = response.data.user
        let profileImageUrl = userData.profileImage || userData.profile_image || ''
        
        // If profile image is a relative path (starts with /uploads), prepend API base URL
        if (profileImageUrl && profileImageUrl.startsWith('/uploads')) {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
          profileImageUrl = API_URL.replace('/api', '') + profileImageUrl
        }
        
        const fetchedFormData = {
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          city: userData.city || '',
          college: userData.college || '',
          profileImage: profileImageUrl,
        }
        setFormData(fetchedFormData)
        setOriginalFormData(fetchedFormData)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      // Don't logout on profile fetch error - just show message
      if (error.response?.status === 401) {
        toast.error('Session expired. Please refresh the page or log in again.')
      } else {
        toast.error(error.response?.data?.error || 'Failed to load profile. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchPreferences = async () => {
    try {
      const response = await api.get('/preferences')
      if (response.data.success) {
        setPreferences(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error)
    }
  }

  const handleSetPrimaryLocation = async (locationId) => {
    try {
      await setPrimary(locationId)
      toast.success('Primary location updated.')
    } catch (error) {
      console.error('Failed to set primary location:', error)
      toast.error(error.response?.data?.error || 'Failed to set primary location')
    }
  }

  const handleDeleteLocation = async (locationId) => {
    try {
      await deleteLocation(locationId)
      toast.success('Location removed.')
    } catch (error) {
      console.error('Failed to delete location:', error)
      toast.error(error.response?.data?.error || 'Failed to delete location')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    // Validate file size (max 2MB original)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB')
      return
    }

    setUploadingImage(true)

    try {
      // Compress and convert image
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = async () => {
        // Calculate new dimensions (max 1200px width/height)
        let width = img.width
        let height = img.height
        const maxDim = 1200

        if (width > maxDim || height > maxDim) {
          const scale = Math.min(maxDim / width, maxDim / height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to base64 with reduced quality
        const base64String = canvas.toDataURL('image/jpeg', 0.8)

        try {
          const response = await api.post('/auth/upload-profile-image', {
            profileImage: base64String,
          })

          if (response.data.success) {
            let imageUrl = response.data.profileImage
            
            // If profile image is a relative path, prepend API base URL
            if (imageUrl && imageUrl.startsWith('/uploads')) {
              const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
              imageUrl = API_URL.replace('/api', '') + imageUrl
            }
            
            setFormData(prev => ({
              ...prev,
              profileImage: imageUrl,
            }))
            useAuthStore.setState({ user: { ...user, profileImage: imageUrl } })
            toast.success('Profile image uploaded successfully!')
          }
        } catch (error) {
          console.error('Failed to upload image:', error)
          toast.error(error.response?.data?.error || 'Failed to upload image')
        } finally {
          setUploadingImage(false)
        }
      }

      img.onerror = () => {
        toast.error('Failed to load image. Please try a different file.')
        setUploadingImage(false)
      }

      // Read file as data URL
      const reader = new FileReader()
      reader.onload = (event) => {
        img.src = event.target?.result
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Failed to process image:', error)
      toast.error('Failed to process image')
      setUploadingImage(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setSaving(true)

    try {
      const response = await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      if (response.data.success) {
        toast.success('Password changed successfully!')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setShowPasswordModal(false)
      }
    } catch (error) {
      console.error('Failed to change password:', error)
      toast.error(error.response?.data?.error || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalFormData)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await api.put('/auth/profile', formData)
      if (response.data.success) {
        toast.success('Profile updated successfully!')
        // Update auth store with new user data
        useAuthStore.setState({ user: { ...user, ...response.data.user } })
        setOriginalFormData(formData)
        setIsEditMode(false)
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error(error.response?.data?.error || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    // Reset form data to original values
    fetchProfile()
  }

  const handleClearPreferences = async () => {
    try {
      const response = await api.delete('/preferences')
      if (response.data.success) {
        setPreferences(null)
        setShowClearConfirmModal(false)
        toast.success('Preferences cleared successfully!')
      }
    } catch (error) {
      console.error('Failed to clear preferences:', error)
      setShowClearConfirmModal(false)
      toast.error(error.response?.data?.error || 'Failed to clear preferences')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <Users size={32} className="text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold text-text">Tenant Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account information</p>
          </div>
        </div>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Modern Profile Header with Gradient */}
        <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 px-6 md:px-8 pt-8 pb-24">
          <div className="absolute inset-0 bg-black opacity-5"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-white/95 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-2xl ring-4 ring-white/30 transition-transform group-hover:scale-105">
                  {formData.profileImage ? (
                    <img
                      src={formData.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={48} className="text-primary-600" />
                  )}
                </div>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="absolute -bottom-2 -right-2 p-3 bg-white text-primary-600 rounded-xl shadow-xl hover:shadow-2xl hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-primary-100"
                  >
                    {uploadingImage ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Camera size={18} />
                    )}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </div>
              <div className="text-white">
                <h3 className="text-2xl md:text-3xl font-bold drop-shadow-lg">{formData.name || 'Your Name'}</h3>
                <p className="text-white/90 mt-1 text-sm md:text-base">{formData.email}</p>
                <span className="inline-flex items-center mt-3 px-4 py-1.5 bg-white/20 backdrop-blur-md text-white rounded-full text-xs font-semibold border border-white/30">
                  <Users size={14} className="mr-1.5" />
                  Tenant Account
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card - Now positioned overlapping the header */}
        <div className="relative px-6 md:px-8 -mt-16 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
            <div className="flex flex-wrap gap-3 justify-center">
              {!isEditMode ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setIsEditMode(true)}
                    className="group relative overflow-hidden px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all min-w-[140px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative flex items-center justify-center gap-1.5">
                      <User size={16} />
                      <span>Edit Profile</span>
                    </div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowPasswordModal(true)}
                    className="group relative overflow-hidden px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all min-w-[160px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative flex items-center justify-center gap-1.5">
                      <Lock size={16} />
                      <span>Change Password</span>
                    </div>
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-1.5 min-w-[100px]"
                  >
                    <XCircle size={16} />
                    <span>Cancel</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={saving || !hasChanges}
                    className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 min-w-[140px]"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Form Fields - Personal Information */}
        <div className="px-6 md:px-8 pb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-primary-500 rounded-full"></div>
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User size={16} className="text-primary-500" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditMode}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed hover:border-gray-300"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Mail size={16} className="text-primary-500" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                placeholder="Your email"
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Lock size={12} />
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Phone size={16} className="text-primary-500" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditMode}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed hover:border-gray-300"
                placeholder="+977 9999999999"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-primary-500" />
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!isEditMode}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed hover:border-gray-300"
                placeholder="Enter your city"
              />
            </div>

            <div className="md:col-span-2">
              <CollegeSelect
                value={formData.college}
                onChange={(collegeName) => setFormData(prev => ({ ...prev, college: collegeName }))}
                label="College/University"
                placeholder="Select your college or university"
                showLocation={true}
                disabled={!isEditMode}
              />
            </div>
          </div>
        </div>
      </motion.form>

      {/* Location Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MapPin size={24} className="text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-text">Saved Locations</h2>
              <p className="text-gray-600 text-sm">Used for distance, maps, and location-aware recommendations.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowLocationModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              {locations.length > 0 ? 'Add Another' : 'Add Location'}
            </motion.button>
          </div>
        </div>

        {primaryLocation ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2 p-4 rounded-xl border border-blue-200 bg-blue-50">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-full border border-blue-200">
                  <MapPin className="text-blue-600" size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-blue-700 font-semibold mb-1">Primary location</p>
                  <h3 className="text-lg font-semibold text-blue-900">{primaryLocation.label || 'Primary'}</h3>
                  <p className="text-sm text-blue-800">{primaryLocation.fullAddress || primaryLocation.city}</p>
                  <p className="text-xs text-blue-700 mt-1">{primaryLocation.latitude.toFixed(5)}, {primaryLocation.longitude.toFixed(5)} • {primaryLocation.radiusKm || primaryLocation.radius_km || 20} km radius</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700">
              <p className="font-semibold mb-1">How it is used</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Filters recommendations within your radius</li>
                <li>Shows distance on property maps</li>
                <li>Can be changed anytime</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-600">
            <p>No location saved yet. Add one to unlock location-based suggestions.</p>
          </div>
        )}

        {locations.length > 0 && (
          <div className="overflow-x-auto border border-gray-100 rounded-xl">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Label</th>
                  <th className="text-left px-4 py-3">Address</th>
                  <th className="text-left px-4 py-3">Radius</th>
                  <th className="text-left px-4 py-3">Primary</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc) => (
                  <tr key={loc.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-semibold text-gray-800">{loc.label || 'Location'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <p className="truncate max-w-xs">{loc.fullAddress || loc.city}</p>
                      <p className="text-xs text-gray-500">{loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{loc.radiusKm || loc.radius_km || 20} km</td>
                    <td className="px-4 py-3 text-gray-600">{loc.isPrimary ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {!loc.isPrimary && (
                        <button
                          onClick={() => handleSetPrimaryLocation(loc.id)}
                          className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          Make primary
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteLocation(loc.id)}
                        className="px-3 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Preferences Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6 md:p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Settings size={24} className="text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-text">Property Preferences</h2>
              <p className="text-gray-600 text-sm">Get notified when properties matching your preferences are listed</p>
            </div>
          </div>
          <div className="flex gap-2">
            {preferences?.has_set_preferences && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowClearConfirmModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 hover:shadow-lg transition"
              >
                Clear
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPreferencesModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              {preferences?.has_set_preferences ? 'Update' : 'Set'} Preferences
            </motion.button>
          </div>
        </div>

        {preferences?.has_set_preferences ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {preferences.locations && preferences.locations.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Preferred Locations</h3>
                <div className="flex flex-wrap gap-2">
                  {preferences.locations.map((loc, idx) => (
                    <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                      {loc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(preferences.min_price || preferences.max_price) && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Price Range</h3>
                <p className="text-gray-600">
                  Rs. {preferences.min_price?.toLocaleString() || '0'} - Rs. {preferences.max_price?.toLocaleString() || '∞'}
                </p>
              </div>
            )}

            {preferences.bedrooms && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Minimum Bedrooms</h3>
                <p className="text-gray-600">{preferences.bedrooms}+ BHK</p>
              </div>
            )}

            {preferences.property_types && preferences.property_types.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Property Types</h3>
                <div className="flex flex-wrap gap-2">
                  {preferences.property_types.map((type, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm capitalize">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {preferences.amenities && preferences.amenities.length > 0 && (
              <div className="md:col-span-2">
                <h3 className="font-semibold text-gray-700 mb-2">Preferred Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {preferences.amenities.map((amenity, idx) => (
                    <span key={idx} className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't set your property preferences yet.</p>
            <p className="text-sm text-gray-400">Set your preferences to receive email notifications when matching properties are listed!</p>
          </div>
        )}
      </motion.div>

      {/* Location Setup Modal */}
      <LocationSetupModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        force={false}
        onCompleted={() => {
          fetchLocations()
          setShowLocationModal(false)
          toast.success('Location saved successfully!')
        }}
      />

      {/* Preferences Modal */}
      <PreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        onSave={() => {
          setShowPreferencesModal(false)
          fetchPreferences()
          toast.success('Preferences updated successfully!')
        }}
        isFirstTime={false}
      />

      {/* Password Change Modal */}
      {showPasswordModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPasswordModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center gap-2 mb-6">
              <Lock size={24} className="text-primary-600" />
              <h2 className="text-2xl font-bold text-text">Change Password</h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-3 text-gray-500"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-gray-500"
                  >
                    {showNewPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-500"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Clear Preferences Confirmation Modal */}
      {showClearConfirmModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowClearConfirmModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle size={24} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-text">Clear Preferences?</h2>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to clear all your property preferences? You will no longer receive email notifications for matching properties. This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleClearPreferences}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle size={20} />
                Clear Preferences
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default TenantProfile

