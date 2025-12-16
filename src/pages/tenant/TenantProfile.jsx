import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../../api/axios'
import { useAuthStore } from '../../stores/authStore'
import { User, Mail, Phone, MapPin, GraduationCap, Camera, Save, Loader2, CheckCircle2, XCircle } from 'lucide-react'

const TenantProfile = () => {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    college: '',
    profileImage: '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        college: user.college || '',
        profileImage: user.profileImage || '',
      })
    }
    
    // Only fetch if user is authenticated
    const { isAuthenticated } = useAuthStore.getState()
    if (isAuthenticated) {
      fetchProfile()
    } else {
      setLoading(false)
      setMessage({ type: 'error', text: 'Please log in to view your profile.' })
    }
  }, [user])

  const fetchProfile = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })
    
    try {
      // Check if we have a token before making the request
      const { accessToken, isAuthenticated } = useAuthStore.getState()
      if (!isAuthenticated || !accessToken) {
        setMessage({ type: 'error', text: 'Session expired. Please log in again.' })
        setLoading(false)
        return
      }

      const response = await api.get('/auth/me')
      if (response.data.success) {
        const userData = response.data.user
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          city: userData.city || '',
          college: userData.college || '',
          profileImage: userData.profileImage || userData.profile_image || '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      // Don't logout on profile fetch error - just show message
      if (error.response?.status === 401) {
        setMessage({ 
          type: 'error', 
          text: 'Session expired. Please refresh the page or log in again.' 
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await api.put('/auth/profile', formData)
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        // Update auth store with new user data
        useAuthStore.setState({ user: { ...user, ...response.data.user } })
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update profile' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } finally {
      setSaving(false)
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
        <h1 className="text-3xl font-bold text-text">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
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
        className="bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6"
      >
        {/* Profile Image Section */}
        <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} className="text-primary-600" />
              )}
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors"
            >
              <Camera size={16} />
            </button>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-text">{formData.name || 'Your Name'}</h3>
            <p className="text-gray-600">{formData.email}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              <User size={16} className="inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              <Mail size={16} className="inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              placeholder="Your email"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              <Phone size={16} className="inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="+977 9999999999"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              <MapPin size={16} className="inline mr-2" />
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter your city"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-text mb-2">
              <GraduationCap size={16} className="inline mr-2" />
              College/University
            </label>
            <input
              type="text"
              name="college"
              value={formData.college}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter your college or university"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-200">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={saving}
            className="w-full md:w-auto px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </motion.button>
        </div>
      </motion.form>
    </div>
  )
}

export default TenantProfile

