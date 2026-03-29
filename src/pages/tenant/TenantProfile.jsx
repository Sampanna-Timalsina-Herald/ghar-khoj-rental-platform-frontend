import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import api from '../../api/axios'
import { useAuthStore } from '../../stores/authStore'
import { useLocationStore } from '../../stores/locationStore'
import { 
  User, Mail, Phone, MapPin, GraduationCap, Loader2, Lock, Eye, EyeOff, 
  Pencil, ChevronRight, X, Wifi, Car, Snowflake, Droplets, UtensilsCrossed, Trees, Dumbbell, Shield, Shirt, Tv, ThermometerSun
} from 'lucide-react'
import CollegeSelect from '../../components/CollegeSelect'
import PreferencesModal from '../../components/PreferencesModal'

// Amenities list with icons - matching CreateListing
const AMENITIES_OPTIONS = [
  { value: 'wifi', label: 'WiFi', icon: Wifi },
  { value: 'parking', label: 'Parking', icon: Car },
  { value: 'ac', label: 'AC', icon: Snowflake },
  { value: 'hot_water', label: 'Hot Water', icon: Droplets },
  { value: 'kitchen', label: 'Kitchen', icon: UtensilsCrossed },
  { value: 'balcony', label: 'Balcony', icon: Trees },
  { value: 'gym', label: 'Gym', icon: Dumbbell },
  { value: 'security', label: 'Security', icon: Shield },
  { value: 'laundry', label: 'Laundry', icon: Shirt },
  { value: 'tv', label: 'TV', icon: Tv },
  { value: 'heater', label: 'Heater', icon: ThermometerSun },
  { value: 'garden', label: 'Garden', icon: Trees },
]

// Property types - matching CreateListing
const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'room', label: 'Room' },
]

// Preferred locations for tenant preferences
const PREFERRED_LOCATIONS = [
  { value: 'Kathmandu', label: 'Kathmandu' },
  { value: 'Bhaktapur', label: 'Bhaktapur' },
  { value: 'Lalitpur', label: 'Lalitpur' },
]

const TenantProfile = () => {
  const { user } = useAuthStore()
  const { locations, fetchLocations } = useLocationStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    college: '',
    profileImage: '',
  })
  const [originalFormData, setOriginalFormData] = useState(null)
  const fileInputRef = useRef(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [isEditingPreferences, setIsEditingPreferences] = useState(false)
  const [preferences, setPreferences] = useState(null)
  const [preferencesFormData, setPreferencesFormData] = useState({
    locations: [],
    min_price: '',
    max_price: '',
    bedrooms: '',
    property_types: [],
    amenities: [],
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const preferencesFormRef = useRef(null)

  useEffect(() => {
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
        
        if (profileImageUrl && profileImageUrl.startsWith('/uploads')) {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
          profileImageUrl = API_URL.replace('/api', '') + profileImageUrl
        }
        
        const fetchedData = {
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          city: userData.city || '',
          college: userData.college || '',
          profileImage: profileImageUrl,
        }
        setFormData(fetchedData)
        setOriginalFormData(fetchedData)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      if (error.response?.status === 401) {
        toast.error('Session expired. Please refresh the page or log in again.')
      } else {
        toast.error(error.response?.data?.error || 'Failed to load profile.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchPreferences = async () => {
    try {
      const response = await api.get('/preferences')
      if (response.data.success) {
        const prefs = response.data.data
        setPreferences(prefs)
        setPreferencesFormData({
          locations: prefs?.locations || [],
          min_price: prefs?.min_price || '',
          max_price: prefs?.max_price || '',
          bedrooms: prefs?.bedrooms || '',
          property_types: prefs?.property_types || [],
          amenities: prefs?.amenities || [],
        })
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error)
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

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB')
      return
    }

    setUploadingImage(true)

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = async () => {
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

        const base64String = canvas.toDataURL('image/jpeg', 0.8)

        try {
          const response = await api.post('/auth/upload-profile-image', {
            profileImage: base64String,
          })

          if (response.data.success) {
            let imageUrl = response.data.profileImage
            
            if (imageUrl && imageUrl.startsWith('/uploads')) {
              const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
              imageUrl = API_URL.replace('/api', '') + imageUrl
            }
            
            setFormData(prev => ({ ...prev, profileImage: imageUrl }))
            setOriginalFormData(prev => ({ ...prev, profileImage: imageUrl }))
            useAuthStore.setState({ user: { ...user, profileImage: imageUrl } })
            toast.success('Profile image uploaded!')
          }
        } catch (error) {
          console.error('Failed to upload image:', error)
          toast.error(error.response?.data?.error || 'Failed to upload image')
        } finally {
          setUploadingImage(false)
        }
      }

      img.onerror = () => {
        toast.error('Failed to load image.')
        setUploadingImage(false)
      }

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await api.put('/auth/profile', formData)
      if (response.data.success) {
        toast.success('Profile updated successfully!')
        useAuthStore.setState({ user: { ...user, ...response.data.user } })
        setOriginalFormData({ ...formData })
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
    if (originalFormData) {
      setFormData({ ...originalFormData })
    }
  }

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalFormData)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 relative font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Profile
              {activeTab === 'profile' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`py-4 px-1 relative font-medium text-sm transition-colors ${
                activeTab === 'preferences'
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Preferences
              {activeTab === 'preferences' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left Sidebar - Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  {/* Profile Image Section */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex flex-col items-center">
                    <div className="relative">
                      <div className="w-28 h-28 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden ring-4 ring-white">
                        {formData.profileImage ? (
                          <img
                            src={formData.profileImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={48} className="text-slate-400" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="absolute bottom-0 right-0 p-2 bg-white text-slate-600 rounded-full shadow-lg hover:bg-slate-50 transition-all disabled:opacity-50 border border-slate-200"
                      >
                        {uploadingImage ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Pencil size={16} />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-slate-800">
                      {formData.name || 'Your Name'}
                    </h2>
                    <p className="text-slate-500 text-sm">{formData.email}</p>
                  </div>

                  {/* Contact Info */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail size={18} className="text-blue-500" />
                      <span className="text-slate-600">Email address</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone size={18} className="text-green-500" />
                      <span className="text-slate-700 font-medium">
                        {formData.phone || 'Not provided'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <User size={18} className="text-orange-500" />
                      <span className="text-slate-600">Phone Number</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin size={18} className="text-red-500" />
                      <span className="text-slate-700">
                        {formData.city || 'Location not set'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <GraduationCap size={18} className="text-purple-500" />
                      <span className="text-slate-700">
                        {formData.college || 'College not set'}
                      </span>
                    </div>
                  </div>

                  {/* Edit Profile Button */}
                  <div className="p-5 pt-0">
                    {!isEditMode ? (
                      <button
                        onClick={() => setIsEditMode(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                      >
                        <Pencil size={18} />
                        Edit Profile
                        <ChevronRight size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={handleCancelEdit}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                      >
                        <X size={18} />
                        Cancel Editing
                      </button>
                    )}
                  </div>
                </div>

                {/* Change Password Card */}
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="mt-4 w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Lock size={20} className="text-slate-600" />
                    </div>
                    <span className="font-medium text-slate-700">Change Password</span>
                  </div>
                  <ChevronRight size={20} className="text-slate-400" />
                </button>
              </div>

              {/* Right Side - Edit Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h3 className="text-xl font-semibold text-slate-800 mb-6">
                    Edit Your Profile
                  </h3>

                  <div className="space-y-5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditMode}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-3 bg-cyan-50 border border-cyan-200 rounded-xl text-slate-600 cursor-not-allowed"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditMode}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500"
                        placeholder="+977 9999999999"
                      />
                    </div>

                    {/* Address / Location */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Address / Location
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        disabled={!isEditMode}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500"
                        placeholder="Kathmandu, Metropolitan City"
                      />
                    </div>

                    {/* College */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        College / University
                      </label>
                      <CollegeSelect
                        value={formData.college}
                        onChange={(value) => setFormData(prev => ({ ...prev, college: value }))}
                        disabled={!isEditMode}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditMode && (
                    <div className="flex justify-end gap-3 mt-8">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving || !hasChanges}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {saving ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            Save Changes
                            <ChevronRight size={18} />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left Sidebar - Preferences Info Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6">
                    <h3 className="text-lg font-semibold text-slate-800">Your Preferences</h3>
                    <p className="text-slate-600 text-sm mt-1">Manage your rental preferences</p>
                  </div>

                  <div className="p-5 space-y-4">
                    {preferences && (preferencesFormData.locations?.length > 0 || preferencesFormData.property_types?.length > 0) ? (
                      <>
                        {preferencesFormData.locations?.length > 0 && (
                          <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Preferred Locations</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {preferencesFormData.locations.map(location => (
                                <span key={location} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                  {location}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {preferencesFormData.min_price || preferencesFormData.max_price ? (
                          <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Budget Range</label>
                            <p className="text-slate-700 font-medium mt-2">
                              Rs. {preferencesFormData.min_price || '—'} - Rs. {preferencesFormData.max_price || '—'}
                            </p>
                          </div>
                        ) : null}
                        {preferencesFormData.bedrooms && (
                          <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Minimum Bedrooms</label>
                            <p className="text-slate-700 font-medium mt-2">
                              {preferencesFormData.bedrooms}+ BHK
                            </p>
                          </div>
                        )}
                        {preferencesFormData.property_types?.length > 0 && (
                          <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Property Types</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {preferencesFormData.property_types.map(type => {
                                const typeObj = PROPERTY_TYPES.find(t => t.value === type)
                                return (
                                  <span key={type} className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                    {typeObj?.label || type}
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        {preferencesFormData.amenities?.length > 0 && (
                          <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Preferred Amenities</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {preferencesFormData.amenities.map(amenity => {
                                const amenityObj = AMENITIES_OPTIONS.find(a => a.value === amenity)
                                return (
                                  <span key={amenity} className="px-3 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">
                                    {amenityObj?.label || amenity}
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-slate-600 text-sm">No preferences set yet</p>
                    )}
                  </div>

                  {/* Edit Button */}
                  <div className="p-5 pt-0">
                    {!isEditingPreferences ? (
                      <button
                        onClick={() => {
                           setIsEditingPreferences(true)
                           setTimeout(() => {
                             preferencesFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                           }, 100)
                         }}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors"
                      >
                        <Pencil size={18} />
                        Edit Preferences
                        <ChevronRight size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsEditingPreferences(false)}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                      >
                        <X size={18} />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side - Edit Preferences Form */}
              <div className="lg:col-span-2">
                {isEditingPreferences ? (
                   <form ref={preferencesFormRef} onSubmit={async (e) => {
                     e.preventDefault()
                     setSaving(true)
                     try {
                       const response = await api.post('/preferences', {
                         locations: preferencesFormData.locations,
                         min_price: preferencesFormData.min_price ? parseInt(preferencesFormData.min_price) : null,
                         max_price: preferencesFormData.max_price ? parseInt(preferencesFormData.max_price) : null,
                         bedrooms: preferencesFormData.bedrooms ? parseInt(preferencesFormData.bedrooms) : null,
                         property_types: preferencesFormData.property_types,
                         amenities: preferencesFormData.amenities,
                       })
                       if (response.data.success) {
                         toast.success('Preferences updated successfully!')
                         setPreferences(response.data.data)
                         setIsEditingPreferences(false)
                       }
                     } catch (error) {
                       console.error('Failed to save preferences:', error)
                       toast.error('Failed to save preferences')
                     } finally {
                       setSaving(false)
                     }
                   }} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                     <h3 className="text-xl font-semibold text-slate-800 mb-6">
                       Edit Your Preferences
                     </h3>

                     <div className="space-y-6">
                       {/* Locations */}
                       <div>
                         <label className="block text-sm font-semibold text-slate-700 mb-3">
                           Preferred Locations
                         </label>
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                           {PREFERRED_LOCATIONS.map(location => (
                             <motion.button
                               key={location.value}
                               type="button"
                               whileHover={{ scale: 1.05 }}
                               whileTap={{ scale: 0.95 }}
                               onClick={() => setPreferencesFormData(prev => ({
                                 ...prev,
                                 locations: prev.locations.includes(location.value)
                                   ? prev.locations.filter(l => l !== location.value)
                                   : [...prev.locations, location.value]
                               }))}
                               className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                                 preferencesFormData.locations.includes(location.value)
                                   ? 'border-blue-600 bg-blue-50 text-blue-700'
                                   : 'border-slate-200 hover:border-blue-300 text-slate-700'
                               }`}
                             >
                               {location.label}
                             </motion.button>
                           ))}
                         </div>
                       </div>

                       {/* Price Range */}
                       <div>
                         <label className="block text-sm font-semibold text-slate-700 mb-3">
                           Budget Range (Monthly)
                         </label>
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="block text-xs text-slate-600 mb-2">Min Price (Rs.)</label>
                             <input
                               type="number"
                               value={preferencesFormData.min_price}
                               onChange={(e) => setPreferencesFormData(prev => ({ ...prev, min_price: e.target.value }))}
                               placeholder="e.g., 5000"
                               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                             />
                           </div>
                           <div>
                             <label className="block text-xs text-slate-600 mb-2">Max Price (Rs.)</label>
                             <input
                               type="number"
                               value={preferencesFormData.max_price}
                               onChange={(e) => setPreferencesFormData(prev => ({ ...prev, max_price: e.target.value }))}
                               placeholder="e.g., 25000"
                               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                             />
                           </div>
                         </div>
                       </div>

                       {/* Bedrooms */}
                       <div>
                         <label className="block text-sm font-semibold text-slate-700 mb-3">
                           Minimum Bedrooms
                         </label>
                         <div className="grid grid-cols-4 gap-2">
                           {[1, 2, 3, 4].map(num => (
                             <motion.button
                               key={num}
                               type="button"
                               whileHover={{ scale: 1.05 }}
                               whileTap={{ scale: 0.95 }}
                               onClick={() => setPreferencesFormData(prev => ({ ...prev, bedrooms: num.toString() }))}
                               className={`p-3 rounded-xl border-2 transition-all font-semibold text-sm ${
                                 preferencesFormData.bedrooms === num.toString()
                                   ? 'border-blue-600 bg-blue-50 text-blue-700'
                                   : 'border-slate-200 hover:border-blue-300 text-slate-700'
                               }`}
                             >
                               {num}+ BHK
                             </motion.button>
                           ))}
                         </div>
                       </div>

                       {/* Property Types */}
                       <div>
                         <label className="block text-sm font-semibold text-slate-700 mb-3">
                           Property Types
                         </label>
                         <div className="grid grid-cols-3 gap-3">
                           {PROPERTY_TYPES.map(type => (
                             <motion.button
                               key={type.value}
                               type="button"
                               whileHover={{ scale: 1.05 }}
                               whileTap={{ scale: 0.95 }}
                               onClick={() => setPreferencesFormData(prev => ({
                                 ...prev,
                                 property_types: prev.property_types.includes(type.value)
                                   ? prev.property_types.filter(t => t !== type.value)
                                   : [...prev.property_types, type.value]
                               }))}
                               className={`p-3 rounded-xl border-2 transition-all font-medium text-sm ${
                                 preferencesFormData.property_types.includes(type.value)
                                   ? 'border-purple-600 bg-purple-50 text-purple-700'
                                   : 'border-slate-200 hover:border-purple-300 text-slate-700'
                               }`}
                             >
                               {type.label}
                             </motion.button>
                           ))}
                         </div>
                       </div>

                       {/* Amenities */}
                       <div>
                         <label className="block text-sm font-semibold text-slate-700 mb-3">
                           Preferred Amenities
                         </label>
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                           {AMENITIES_OPTIONS.map(amenity => {
                             const IconComponent = amenity.icon
                             return (
                               <motion.button
                                 key={amenity.value}
                                 type="button"
                                 whileHover={{ scale: 1.05 }}
                                 whileTap={{ scale: 0.95 }}
                                 onClick={() => setPreferencesFormData(prev => ({
                                   ...prev,
                                   amenities: prev.amenities.includes(amenity.value)
                                     ? prev.amenities.filter(a => a !== amenity.value)
                                     : [...prev.amenities, amenity.value]
                                 }))}
                                 className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 text-sm font-medium ${
                                   preferencesFormData.amenities.includes(amenity.value)
                                     ? 'border-pink-600 bg-pink-50 text-pink-700'
                                     : 'border-slate-200 hover:border-pink-300 text-slate-700'
                                 }`}
                               >
                                 <IconComponent size={16} />
                                 <span>{amenity.label}</span>
                               </motion.button>
                             )
                           })}
                         </div>
                       </div>
                     </div>

                     {/* Action Buttons */}
                     <div className="flex justify-end gap-3 mt-8">
                       <button
                         type="button"
                         onClick={() => setIsEditingPreferences(false)}
                         className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                       >
                         Cancel
                       </button>
                       <button
                         type="submit"
                         disabled={saving}
                         className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                       >
                         {saving ? (
                           <>
                             <Loader2 size={18} className="animate-spin" />
                             Saving...
                           </>
                         ) : (
                           <>
                             Save Preferences
                             <ChevronRight size={18} />
                           </>
                         )}
                       </button>
                     </div>
                   </form>

                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex items-center justify-center min-h-[300px]">
                    <div className="text-center">
                      <p className="text-slate-600">Click "Edit Preferences" to manage your rental preferences</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-800">Change Password</h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-3 text-slate-500"
                    >
                      {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-slate-500"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-500"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Changing...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TenantProfile
