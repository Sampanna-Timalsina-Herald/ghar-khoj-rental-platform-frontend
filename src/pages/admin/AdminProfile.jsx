import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import api from '../../api/axios'
import { useAuthStore } from '../../stores/authStore'
import { User, Mail, Phone, MapPin, Camera, Save, Loader2, CheckCircle2, XCircle, Shield, Lock, Eye, EyeOff } from 'lucide-react'

const AdminProfile = () => {
  const { user } = useAuthStore()
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
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
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    // Only fetch if user is authenticated
    const { isAuthenticated, accessToken, token } = useAuthStore.getState()
    const hasToken = accessToken || token
    
    if (isAuthenticated && hasToken) {
      fetchProfile()
    } else {
      setLoading(false)
      if (!isAuthenticated) {
        setMessage({ type: 'error', text: 'Please log in to view your profile.' })
      }
    }
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })
    
    try {
      // Check actual values at time of fetch
      const tokenFromLS = localStorage.getItem('token')
      const authState = useAuthStore.getState()
      
      console.log('[AdminProfile] Fetch Profile Debug:', {
        localStorageToken: tokenFromLS ? tokenFromLS.substring(0, 30) + '...' : 'MISSING',
        storeAccessToken: authState.accessToken ? authState.accessToken.substring(0, 30) + '...' : 'MISSING',
        storeToken: authState.token ? authState.token.substring(0, 30) + '...' : 'MISSING',
        isAuthenticated: authState.isAuthenticated,
        user: authState.user ? authState.user.email : 'NO USER',
      })

      if (!tokenFromLS && !authState.accessToken && !authState.token) {
        console.error('[AdminProfile] No token found anywhere!')
        setMessage({ type: 'error', text: 'Session expired. Please log in again.' })
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
        
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          city: userData.city || '',
          profileImage: profileImageUrl,
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.config?.headers,
      })
      
      // Don't logout on profile fetch error - just show message
      if (error.response?.status === 401) {
        setMessage({ 
          type: 'error', 
          text: 'Session expired. Please refresh the page or log in again.' 
        })
      } else if (error.code === 'ERR_NETWORK') {
        setMessage({ 
          type: 'error', 
          text: 'Network error. Please check your connection and try again.' 
        })
      } else {
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.error || 'Failed to load profile. Please try again.' 
        })
      }
    } finally {
      setLoading(false)
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
      setMessage({ type: 'error', text: 'Please select a valid image file' })
      return
    }

    // Validate file size (max 2MB original)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 2MB' })
      return
    }

    setUploadingImage(true)
    setMessage({ type: '', text: '' })

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
            setMessage({ type: 'success', text: '✅ Profile image uploaded successfully!' })
            setTimeout(() => setMessage({ type: '', text: '' }), 3000)
          }
        } catch (error) {
          console.error('Failed to upload image:', error)
          setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to upload image' })
        } finally {
          setUploadingImage(false)
        }
      }

      img.onerror = () => {
        setMessage({ type: 'error', text: 'Failed to load image. Please try a different file.' })
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
      setMessage({ type: 'error', text: 'Failed to process image' })
      setUploadingImage(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }

    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' })
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setShowPasswordModal(false)
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    } catch (error) {
      console.error('Failed to change password:', error)
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to change password' })
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await api.put('/auth/profile', formData)
      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: '✅ Profile updated successfully!' 
        })
        useAuthStore.setState({ user: { ...user, ...response.data.user } })
        setIsEditMode(false)
        setTimeout(() => setMessage({ type: '', text: '' }), 4000)
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update profile' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    // Reset form data to original values
    fetchProfile()
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
          <Shield size={32} className="text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold text-text">Admin Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account information</p>
          </div>
        </div>
      </motion.div>

      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 size={20} />
          ) : (
            <XCircle size={20} />
          )}
          <span>{message.text}</span>
        </motion.div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Modern Profile Header with Gradient */}
        <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 px-6 md:px-8 pt-8 pb-24">
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
                    <Shield size={48} className="text-purple-600" />
                  )}
                </div>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="absolute -bottom-2 -right-2 p-3 bg-white text-purple-600 rounded-xl shadow-xl hover:shadow-2xl hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-purple-100"
                    title="Upload profile image"
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
                  <Shield size={14} className="mr-1.5" />
                  Admin Account
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="relative px-6 md:px-8 -mt-16 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {!isEditMode ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setIsEditMode(true)}
                    className="group relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-purple-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
                    className="group relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
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
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-1.5"
                  >
                    <XCircle size={16} />
                    <span>Cancel</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
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
            <div className="w-2 h-6 bg-purple-600 rounded-full"></div>
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User size={16} className="text-purple-600" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditMode}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed hover:border-gray-300"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Mail size={16} className="text-purple-600" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Lock size={12} />
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Phone size={16} className="text-purple-600" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditMode}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed hover:border-gray-300"
                placeholder="+977 9999999999"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-purple-600" />
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!isEditMode}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed hover:border-gray-300"
                placeholder="Enter your city"
              />
            </div>
          </div>
        </div>
      </motion.form>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
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
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-3 text-gray-500"
                  >
                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

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
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter new password (min 8 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-gray-500"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-500"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
    </div>
  )
}

export default AdminProfile

