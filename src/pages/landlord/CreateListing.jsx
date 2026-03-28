import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api/axios'
import { Loader2, ArrowLeft, Upload, X, CheckCircle2, Home, MapPin, DollarSign, Image, Info, AlertCircle, AlertTriangle, Package } from 'lucide-react'
import CollegeSelect from '../../components/CollegeSelect'
import LocationPicker from '../../components/LocationPicker'

const CreateListing = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [eligibility, setEligibility] = useState(null)
  const [checkingEligibility, setCheckingEligibility] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rent_amount: '',
    bedrooms: '',
    bathrooms: '',
    address: '',
    city: '',
    college_name: '',
    deposit_amount: '',
    furnished: 'semi',
    type: 'apartment',
    latitude: null,
    longitude: null,
  })
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [imageError, setImageError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Check subscription eligibility on mount
  useEffect(() => {
    const checkEligibility = async () => {
      try {
        const response = await api.get('/subscriptions/check-eligibility')
        setEligibility(response.data.data)
      } catch (error) {
        console.error('Error checking eligibility:', error)
        setEligibility({ can_create: false, message: 'Failed to check subscription status' })
      } finally {
        setCheckingEligibility(false)
      }
    }
    checkEligibility()
  }, [])

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Property title is required'
        if (value.length < 5) return 'Title must be at least 5 characters'
        if (value.length > 100) return 'Title must not exceed 100 characters'
        return ''
      case 'description':
        if (!value.trim()) return 'Description is required'
        if (value.length < 20) return 'Description must be at least 20 characters'
        if (value.length > 1000) return 'Description must not exceed 1000 characters'
        return ''
      case 'address':
        if (!value.trim()) return 'Address is required'
        if (value.length < 3) return 'Address must be at least 3 characters'
        return ''
      case 'city':
        if (!value.trim()) return 'City is required'
        return ''
      case 'rent_amount':
        if (!value) return 'Rent amount is required'
        if (isNaN(value) || value <= 0) return 'Rent amount must be a positive number'
        if (value > 999999999) return 'Rent amount is too high'
        return ''
      case 'bedrooms':
        if (!value) return 'Number of bedrooms is required'
        if (isNaN(value) || value < 1) return 'Bedrooms must be at least 1'
        return ''
      case 'bathrooms':
        if (!value) return 'Number of bathrooms is required'
        if (isNaN(value) || value < 1) return 'Bathrooms must be at least 1'
        return ''
      case 'deposit_amount':
        if (value && (isNaN(value) || value < 0)) return 'Deposit amount must be a valid number'
        if (value > 999999999) return 'Deposit amount is too high'
        return ''
      default:
        return ''
    }
  }

  const validateForm = () => {
    const errors = {}
    const requiredFields = ['title', 'description', 'address', 'city', 'rent_amount', 'bedrooms', 'bathrooms']
    
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field])
      if (error) errors[field] = error
    })

    return errors
  }

  // Validate specific step
  const validateStep = (step) => {
    const errors = {}
    let stepFields = []

    switch (step) {
      case 0: // Basic Info
        stepFields = ['title', 'description']
        break
      case 1: // Location
        stepFields = ['address', 'city']
        break
      case 2: // Property Details & Pricing
        stepFields = ['bedrooms', 'bathrooms', 'rent_amount']
        break
      case 3: // Photos
        if (images.length === 0) {
          setImageError('Please add at least one image')
          return false
        }
        return true
      default:
        return true
    }

    stepFields.forEach(field => {
      const error = validateField(field, formData[field])
      if (error) errors[field] = error
    })

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return false
    }

    setFieldErrors({})
    setError('')
    return true
  }

  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(activeStep + 1)
      setImageError('')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (activeStep !== 3) {
      setError('Please fill all required fields in this section')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Real-time validation
    const error = validateField(name, value)
    setFieldErrors((prev) => ({
      ...prev,
      [name]: error,
    }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    addImages(files)
  }

  const addImages = (files) => {
    setImageError('')
    
    // Validation checks
    const MAX_FILES = 10
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

    if (images.length + files.length > MAX_FILES) {
      setImageError(`Maximum ${MAX_FILES} images allowed. You already have ${images.length} images.`)
      return
    }

    let hasError = false
    const validFiles = files.filter(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setImageError(`Invalid file type: ${file.name}. Only JPG, PNG, WebP, and GIF are allowed.`)
        hasError = true
        return false
      }
      if (file.size > MAX_FILE_SIZE) {
        setImageError(`File too large: ${file.name}. Maximum file size is 10MB.`)
        hasError = true
        return false
      }
      return true
    })

    if (!validFiles.length && hasError) return

    setImages(prev => [...prev, ...validFiles])
    
    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreviews(prev => [...prev, reader.result])
      }
      reader.onerror = () => {
        setImageError(`Failed to read file: ${file.name}`)
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    addImages(Array.from(files))
  }

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const steps = [
    { label: 'Basic Info', icon: Info },
    { label: 'Location', icon: MapPin },
    { label: 'Details', icon: Home },
    { label: 'Photos', icon: Image },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate all fields
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      const firstErrorField = Object.keys(errors)[0]
      const stepMap = {
        title: 0, description: 0,
        address: 1, city: 1, college_name: 1,
        bedrooms: 2, bathrooms: 2, type: 2, furnished: 2, rent_amount: 2, deposit_amount: 2,
      }
      setActiveStep(stepMap[firstErrorField] || 0)
      setError('Please fix the highlighted errors before continuing')
      return
    }

    // Validate images
    if (images.length === 0) {
      setActiveStep(3)
      setImageError('Please add at least one image')
      return
    }

    setLoading(true)

    try {
      const submitData = new FormData()
      
      // Add form fields
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          submitData.append(key, formData[key])
        }
      })
      
      // Add images
      if (images.length === 0) {
        throw new Error('At least one image is required')
      }

      console.log('[CREATE-LISTING] Uploading listing with', images.length, 'images')
      images.forEach((image, index) => {
        console.log(`[CREATE-LISTING] Appending image ${index}:`, image.name, image.size, image.type)
        submitData.append('images', image)
      })

      const response = await api.post('/listings', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log('[CREATE-LISTING] Success:', response.data)
      setSuccess(true)
      setFieldErrors({})
      
      setTimeout(() => {
        navigate('/landlord/listings')
      }, 2000)
    } catch (err) {
      console.error('[CREATE-LISTING] Error:', err)
      
      let errorMessage = 'Failed to create listing'
      
      if (err.response) {
        // Server responded with error
        if (err.response.status === 400) {
          errorMessage = err.response.data?.error || err.response.data?.message || 'Invalid input. Please check your details.'
        } else if (err.response.status === 401) {
          errorMessage = 'You are not authenticated. Please login again.'
          setTimeout(() => navigate('/login'), 2000)
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to create listings.'
        } else if (err.response.status === 413) {
          errorMessage = 'Images are too large. Please use smaller files.'
        } else if (err.response.status === 500) {
          errorMessage = 'Server error. Please try again later.'
        } else {
          errorMessage = err.response.data?.error || err.response.data?.message || `Error: ${err.response.status}`
        }
      } else if (err.request) {
        // Request made but no response
        errorMessage = 'No response from server. Check your internet connection.'
      } else if (err.message) {
        // Error in request setup
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const isLocationReady = Boolean(
    formData.latitude &&
    formData.longitude &&
    (formData.address || '').trim() &&
    (formData.city || '').trim()
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-12">
      {/* Checking Eligibility */}
      {checkingEligibility && (
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      )}

      {/* No Subscription or Limit Reached */}
      {!checkingEligibility && eligibility && !eligibility.can_create && (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Cannot Create Listing</h2>
            <p className="text-gray-600 mb-6">{eligibility.message}</p>
            {eligibility.current_count !== undefined && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Properties Used:</span> {eligibility.current_count} / {eligibility.max_allowed}
                </p>
              </div>
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/landlord/subscription-plans')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                View Plans
              </button>
              <button
                onClick={() => navigate('/landlord')}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Form - Only show if eligible */}
      {!checkingEligibility && eligibility && eligibility.can_create && (
        <>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/landlord/listings')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Back
          </motion.button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Create Listing</h1>
          <p className="text-slate-600">Fill in your property details to get started</p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="flex items-center flex-1">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold transition-all cursor-pointer ${
                      index <= activeStep
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                    onClick={() => setActiveStep(index)}
                  >
                    <Icon size={20} />
                  </motion.div>
                  <p className={`ml-3 text-sm font-medium hidden sm:block ${
                    index <= activeStep ? 'text-slate-900' : 'text-slate-500'
                  }`}>
                    {step.label}
                  </p>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 sm:mx-4 rounded-full transition-all ${
                      index < activeStep ? 'bg-blue-600' : 'bg-slate-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-3 shadow-md"
          >
            <CheckCircle2 size={20} className="flex-shrink-0" />
            <span className="font-medium">Listing created successfully! Redirecting...</span>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md flex items-start gap-3"
          >
            <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Information */}
          <AnimatePresence mode="wait">
            {activeStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Info size={20} className="text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>
              </div>

              <div className="space-y-4">
                <motion.div whileHover={{ scale: 1.01 }}>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Property Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none transition-all bg-slate-50 hover:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Cozy 2BHK Apartment in Thamel"
                  />
                  <AnimatePresence>
                    {fieldErrors.title && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-1 text-red-600 text-sm flex items-center gap-1"
                      >
                        <AlertCircle size={14} />
                        {fieldErrors.title}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div whileHover={{ scale: 1.01 }}>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none transition-all resize-none bg-slate-50 hover:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your property, amenities, and special features..."
                  />
                  <div className="flex items-center justify-between mt-1">
                    <AnimatePresence>
                      {fieldErrors.description && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-red-600 text-sm flex items-center gap-1"
                        >
                          <AlertCircle size={14} />
                          {fieldErrors.description}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <span className="text-xs text-slate-500 ml-auto">
                      {formData.description.length}/1000
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 2: Location */}
          <AnimatePresence mode="wait">
            {activeStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <MapPin size={20} className="text-green-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Location</h2>
              </div>

              {/* Interactive Map */}
              <div className="mb-6">
                <LocationPicker
                  onLocationSelect={(location) => {
                    setFormData(prev => ({
                      ...prev,
                      address: location.formatted || location.address,
                      city: location.city,
                      latitude: location.lat,
                      longitude: location.lng
                    }));
                    // Clear errors when location is selected
                    setFieldErrors(prev => ({
                      ...prev,
                      address: '',
                      city: ''
                    }));
                  }}
                  initialLocation={
                    formData.latitude && formData.longitude
                      ? { lat: formData.latitude, lng: formData.longitude }
                      : null
                  }
                />
              </div>

              <div className="space-y-4">
                <motion.div whileHover={{ scale: 1.01 }}>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none transition-all bg-slate-50 hover:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Auto-filled from map or enter manually"
                  />
                  <AnimatePresence>
                    {fieldErrors.address && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-1 text-red-600 text-sm flex items-center gap-1"
                      >
                        <AlertCircle size={14} />
                        {fieldErrors.address}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div whileHover={{ scale: 1.01 }}>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none transition-all bg-slate-50 hover:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Auto-filled from map"
                    />
                    <AnimatePresence>
                      {fieldErrors.city && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-1 text-red-600 text-sm flex items-center gap-1"
                        >
                          <AlertCircle size={14} />
                          {fieldErrors.city}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.01 }}>
                    <CollegeSelect
                      value={formData.college_name}
                      onChange={(collegeName) => setFormData(prev => ({ ...prev, college_name: collegeName }))}
                      label="Near College/University"
                      placeholder="Select nearby college or university"
                      showLocation={true}
                    />
                  </motion.div>
                </div>
              </div>
            </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 3: Property Details */}
          <AnimatePresence mode="wait">
            {activeStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Home size={20} className="text-purple-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Property Details</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <motion.div whileHover={{ scale: 1.01 }}>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Bedrooms <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none transition-all bg-slate-50 hover:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5+</option>
                    </select>
                    <AnimatePresence>
                      {fieldErrors.bedrooms && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-1 text-red-600 text-sm flex items-center gap-1"
                        >
                          <AlertCircle size={14} />
                          {fieldErrors.bedrooms}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.01 }}>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Bathrooms <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none transition-all bg-slate-50 hover:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4+</option>
                    </select>
                    <AnimatePresence>
                      {fieldErrors.bathrooms && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-1 text-red-600 text-sm flex items-center gap-1"
                        >
                          <AlertCircle size={14} />
                          {fieldErrors.bathrooms}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.01 }}>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-slate-50 hover:bg-white"
                    >
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="studio">Studio</option>
                      <option value="shared">Shared Room</option>
                    </select>
                  </motion.div>
                </div>

                <motion.div whileHover={{ scale: 1.01 }}>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Furnished Status
                  </label>
                  <select
                    name="furnished"
                    value={formData.furnished}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-slate-50 hover:bg-white"
                  >
                    <option value="unfurnished">Unfurnished</option>
                    <option value="semi">Semi-Furnished</option>
                    <option value="furnished">Fully Furnished</option>
                  </select>
                </motion.div>
              </div>
            </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 3.5: Pricing */}
          <AnimatePresence mode="wait">
            {activeStep === 2 && (
              <motion.div
                key="pricing"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <DollarSign size={20} className="text-amber-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Pricing</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div whileHover={{ scale: 1.01 }}>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Monthly Rent <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-slate-500 font-semibold">₨</span>
                    <input
                      type="number"
                      name="rent_amount"
                      value={formData.rent_amount}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pl-8 border border-slate-200 rounded-lg outline-none transition-all bg-slate-50 hover:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="25000"
                    />
                    <AnimatePresence>
                      {fieldErrors.rent_amount && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-1 text-red-600 text-sm flex items-center gap-1"
                        >
                          <AlertCircle size={14} />
                          {fieldErrors.rent_amount}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.01 }}>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Security Deposit
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-slate-500 font-semibold">₨</span>
                    <input
                      type="number"
                      name="deposit_amount"
                      value={formData.deposit_amount}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pl-8 border border-slate-200 rounded-lg outline-none transition-all bg-slate-50 hover:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Optional"
                    />
                    <AnimatePresence>
                      {fieldErrors.deposit_amount && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-1 text-red-600 text-sm flex items-center gap-1"
                        >
                          <AlertCircle size={14} />
                          {fieldErrors.deposit_amount}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
            </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 4: Images */}
          <AnimatePresence mode="wait">
            {activeStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <Image size={20} className="text-cyan-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Add Photos <span className="text-red-500">*</span>
                </h2>
              </div>
              
              <p className="text-sm text-slate-600 mb-4">
                Upload at least one image of your property (required)
              </p>

              <motion.div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                whileHover={{ scale: 1.01 }}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  imageError
                    ? 'border-red-500 bg-red-50'
                    : dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-300 bg-slate-50 hover:border-blue-400'
                }`}
              >
                <Upload size={40} className={`mx-auto mb-3 ${
                  imageError ? 'text-red-400' : 'text-slate-400'
                }`} />
                <input
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                  accept="image/*"
                />
                <label
                  htmlFor="image-upload"
                  className="block cursor-pointer"
                >
                  <span className={`font-semibold text-lg ${
                    imageError ? 'text-red-600' : 'text-blue-600 hover:text-blue-700'
                  }`}>
                    Click to upload
                  </span>
                  <p className="text-sm text-slate-500 mt-2">or drag and drop</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP, GIF up to 10MB each (Max 10 images)</p>
                </label>
              </motion.div>

              <AnimatePresence>
                {imageError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2"
                  >
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{imageError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Image Gallery */}
              {imagePreviews.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6"
                >
                  <p className="text-sm font-semibold text-slate-700 mb-4">
                    {imagePreviews.length}/{10} image{imagePreviews.length !== 1 ? 's' : ''} added
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        className="relative group rounded-lg overflow-hidden"
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                            title="Remove image"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-2 pb-3 px-4 flex gap-3 shadow-lg border-t border-slate-200"
          >
            <div className="max-w-5xl mx-auto w-full flex gap-3 justify-center">
              <motion.button
                type="button"
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={activeStep === 0 || loading || success}
                className="px-6 py-2 border-2 border-slate-300 text-slate-700 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Previous
              </motion.button>

              {activeStep < steps.length - 1 ? (
                <motion.button
                  type="button"
                  onClick={handleNextStep}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading || success || (activeStep === 1 && !isLocationReady)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  Next
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || success}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 size={16} />
                      Created!
                    </>
                  ) : (
                    'Create'
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Spacer to prevent content overlap with sticky buttons */}
          <div className="h-16" />
        </form>
      </div>
        </>
      )}
    </div>
  )
}

export default CreateListing
