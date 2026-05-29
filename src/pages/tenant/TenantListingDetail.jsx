import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, MapPin, Bed, Bath, Ruler, Heart, MessageCircle, Loader2, 
  ChevronLeft, ChevronRight, Phone, Mail, User, Calendar, CheckCircle,
  FileText, Send, X, Maximize2, Grid3x3, Zap, Shield, Home, Sofa, Clock, XCircle, Navigation
} from 'lucide-react'
import api from '../../api/axios'
import { useAuthStore } from '../../stores/authStore'
import TenantMessages from '../../components/TenantMessages.jsx'
import { getImageUrl } from '../../utils/imageUtils'
import { toast } from 'sonner'

const TenantListingDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [loadingFav, setLoadingFav] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showMessaging, setShowMessaging] = useState(false)
  const [contactMessage, setContactMessage] = useState('')
  const [sendingContact, setSendingContact] = useState(false)
  const [sendingBooking, setSendingBooking] = useState(false)
  const [showImageGallery, setShowImageGallery] = useState(false)
  const [gallerViewMode, setGalleryViewMode] = useState('main') // 'main' or 'grid'
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState({ type: '', title: '', message: '' })
  
  // ML Engagement tracking
  const [engagementData, setEngagementData] = useState({
    viewStartTime: Date.now(),
    viewedImages: false,
    clickedContact: false,
    addedToFavorites: false
  })
  
  const [bookingForm, setBookingForm] = useState({
    full_name: '',
    permanent_address: '',
    current_address: '',
    phone_number: '',
    email: '',
    citizenship_number: '',
    occupation: '',
    emergency_contact_person: '',
    emergency_contact_phone: '',
    start_date: '',
    end_date: '',
    message: '',
    citizenship_front_image: null,
    citizenship_back_image: null
  })

  useEffect(() => {
    fetchListing()
    if (isAuthenticated) {
      checkIfFavorited()
    }
  }, [id, isAuthenticated])

  const fetchListing = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/listings/${id}`)
      setListing(response.data.data || response.data)
      
      // Track property view for ML recommendations
      if (isAuthenticated) {
        trackPropertyView(id)
      }
    } catch (err) {
      console.error('Failed to fetch listing:', err)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to allow only numbers in input
  const handleNumberOnlyChange = (value) => {
    return value.replace(/[^0-9]/g, '')
  }

  const trackPropertyView = async (propertyId) => {
    try {
      await api.post('/recommendations/ml/track-view', {
        property_id: propertyId,
        engagement: {
          duration_seconds: 0,
          viewed_images: false,
          clicked_contact: false,
          added_to_favorites: false
        }
      })
      console.log('[TenantListingDetail] Property view tracked for ML')
    } catch (error) {
      console.error('[TenantListingDetail] Failed to track property view:', error)
    }
  }

  const updateEngagementTracking = async () => {
    if (!isAuthenticated) return
    
    try {
      const durationSeconds = Math.floor((Date.now() - engagementData.viewStartTime) / 1000)
      await api.put(`/recommendations/ml/update-engagement/${id}`, {
        duration_seconds: durationSeconds,
        viewed_images: engagementData.viewedImages,
        clicked_contact: engagementData.clickedContact,
        added_to_favorites: engagementData.addedToFavorites
      })
      console.log('[TenantListingDetail] Engagement updated:', { durationSeconds, ...engagementData })
    } catch (error) {
      console.error('[TenantListingDetail] Failed to update engagement:', error)
    }
  }

  const checkIfFavorited = async () => {
    try {
      const response = await api.get('/favorites')
      const favoriteIds = new Set(response.data.data?.map(fav => fav.id) || [])
      setIsFavorite(favoriteIds.has(id))
    } catch (error) {
      console.error('Failed to check favorite:', error)
    }
  }

  // Track image viewing
  useEffect(() => {
    if (currentImageIndex > 0 && !engagementData.viewedImages) {
      setEngagementData(prev => ({ ...prev, viewedImages: true }))
      updateEngagementTracking()
    }
  }, [currentImageIndex])

  // Update engagement every 15 seconds and on unmount
  useEffect(() => {
    if (!isAuthenticated) return
    
    const interval = setInterval(() => {
      updateEngagementTracking()
    }, 15000) // Update every 15 seconds

    return () => {
      clearInterval(interval)
      updateEngagementTracking() // Final update on unmount
    }
  }, [engagementData, isAuthenticated])

  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setLoadingFav(true)
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${id}`)
        setIsFavorite(false)
        setEngagementData(prev => ({ ...prev, addedToFavorites: false }))
      } else {
        try {
          await api.post(`/favorites/${id}`)
          setIsFavorite(true)
          setEngagementData(prev => ({ ...prev, addedToFavorites: true }))
          updateEngagementTracking()
        } catch (postError) {
          if (postError.response?.status === 400) {
            setIsFavorite(true)
            setEngagementData(prev => ({ ...prev, addedToFavorites: true }))
          } else {
            throw postError
          }
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    } finally {
      setLoadingFav(false)
    }
  }

  const showToastMessage = (type, title, message) => {
    setToastMessage({ type, title, message })
    setShowToast(true)
    setTimeout(() => setShowToast(false), 5000)
  }

  const handleBookProperty = async () => {
    // Validate required tenant/legal details
    const requiredFieldMap = {
      full_name: 'Full name',
      permanent_address: 'Permanent address',
      current_address: 'Current address',
      phone_number: 'Phone number',
      email: 'Email',
      citizenship_number: 'Citizenship number',
      occupation: 'Occupation',
      emergency_contact_person: 'Emergency contact person',
      emergency_contact_phone: 'Emergency contact phone number',
      start_date: 'Preferred start date',
      end_date: 'Preferred end date'
    }

    const missingEntry = Object.entries(requiredFieldMap).find(([key]) => !bookingForm[key])
    if (missingEntry) {
      toast.error(`${missingEntry[1]} is required`)
      return
    }

    if (!bookingForm.citizenship_front_image || !bookingForm.citizenship_back_image) {
      toast.error('Please upload both citizenship front and back images')
      return
    }

    // Validate date range
    const startDate = new Date(bookingForm.start_date)
    const endDate = new Date(bookingForm.end_date)
    if (endDate <= startDate) {
      toast.error('Move-out date must be after move-in date')
      return
    }

    if (sendingBooking) return

    setSendingBooking(true)
    try {
      const formData = new FormData()
      formData.append('listing_id', listing.id)
      formData.append('preferred_start_date', bookingForm.start_date)
      formData.append('preferred_end_date', bookingForm.end_date)
      formData.append('start_date', bookingForm.start_date)
      formData.append('end_date', bookingForm.end_date)
      formData.append('message', bookingForm.message || '')
      formData.append('full_name', bookingForm.full_name)
      formData.append('permanent_address', bookingForm.permanent_address)
      formData.append('current_address', bookingForm.current_address)
      formData.append('phone_number', bookingForm.phone_number)
      formData.append('email', bookingForm.email)
      formData.append('citizenship_number', bookingForm.citizenship_number)
      formData.append('occupation', bookingForm.occupation)
      formData.append('emergency_contact_person', bookingForm.emergency_contact_person)
      formData.append('emergency_contact_phone', bookingForm.emergency_contact_phone)
      formData.append('citizenship_front_image', bookingForm.citizenship_front_image)
      formData.append('citizenship_back_image', bookingForm.citizenship_back_image)

      // Log FormData for debugging
      console.log('[TenantListingDetail] Booking FormData:', {
        listing_id: listing.id,
        full_name: bookingForm.full_name,
        citizenship_front_image: bookingForm.citizenship_front_image?.name,
        citizenship_back_image: bookingForm.citizenship_back_image?.name,
        start_date: bookingForm.start_date,
        end_date: bookingForm.end_date
      })

      await api.post('/bookings', formData)

      toast.success('Booking request sent successfully! The landlord will review your request.')
      setShowBookingForm(false)
      setBookingForm({
        full_name: '',
        permanent_address: '',
        current_address: '',
        phone_number: '',
        email: '',
        citizenship_number: '',
        occupation: '',
        emergency_contact_person: '',
        emergency_contact_phone: '',
        start_date: '',
        end_date: '',
        message: '',
        citizenship_front_image: null,
        citizenship_back_image: null
      })
      // Refresh listing to get updated booking status
      fetchListing()
    } catch (error) {
      console.error('Failed to send booking:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send booking request. Please try again.'
      toast.error(errorMessage)
    } finally {
      setSendingBooking(false)
    }
  }

  const nextImage = () => {
    if (listing?.images?.length) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length)
    }
  }

  const prevImage = () => {
    if (listing?.images?.length) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getBookingStatusBadge = () => {
    const status = listing.booking_status || 'available'
    
    if (status === 'rented') {
      return (
        <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <Home size={18} />
            <span className="font-bold text-sm">Currently Rented</span>
          </div>
          {listing.rent_end_date && (
            <p className="text-red-700 text-xs">
              Available after: <span className="font-semibold">{formatDate(listing.rent_end_date)}</span>
            </p>
          )}
        </div>
      )
    }
    
    if (status === 'pending') {
      return (
        <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <Clock size={18} />
            <span className="font-bold text-sm">Booking Under Review</span>
          </div>
          <p className="text-yellow-700 text-xs mt-1">
            This property has a pending booking request
          </p>
        </div>
      )
    }
    
    return (
      <div className="bg-green-100 border-2 border-green-300 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 text-green-800">
          <CheckCircle size={18} />
          <span className="font-bold text-sm">Available for Booking</span>
        </div>
      </div>
    )
  }

  const canBook = () => {
    const status = listing.booking_status || 'available'
    return status === 'available'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={32} className="animate-spin text-primary-600" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600 mb-4">Property not found</p>
        <button
          onClick={() => navigate('/tenant/browse')}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Back to Browse
        </button>
      </div>
    )
  }

  const fullAddress = listing.full_address || listing.fullAddress || listing.address || listing.city || ''
  const mapQuery = listing.latitude && listing.longitude
    ? `${listing.latitude},${listing.longitude}`
    : fullAddress
  const mapUrl = mapQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}` : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft size={24} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">Back</span>
          </motion.button>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavoriteClick}
              disabled={loadingFav}
              className="p-3 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 hover:from-red-50 hover:to-pink-50 transition-all duration-300 shadow-sm"
            >
              {loadingFav ? (
                <Loader2 size={20} className="animate-spin text-gray-400" />
              ) : (
                <Heart
                  size={20}
                  className={`transition-all duration-300 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Top Section - Images & Quick Info Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Gallery - Compact */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group"
          >
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 sticky top-24">
              {/* Main Image Viewer - Compact */}
              <div className="relative bg-black aspect-square flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    src={getImageUrl(listing.images?.[currentImageIndex])}
                    alt={`Property ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </AnimatePresence>

                {/* Image Counter */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/20"
                >
                  {currentImageIndex + 1}/{listing.images?.length || 0}
                </motion.div>

                {/* Navigation buttons - Smaller */}
                {listing.images?.length > 1 && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1, x: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full transition-all duration-300 shadow-lg"
                    >
                      <ChevronLeft size={20} className="text-gray-900" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, x: 2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full transition-all duration-300 shadow-lg"
                    >
                      <ChevronRight size={20} className="text-gray-900" />
                    </motion.button>
                  </>
                )}

                {/* Fullscreen toggle */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowImageGallery(true)}
                  className="absolute bottom-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full transition-all duration-300 shadow-lg"
                >
                  <Maximize2 size={18} className="text-gray-900" />
                </motion.button>
              </div>

              {/* Thumbnail Strip - Compact */}
              {listing.images?.length > 1 && (
                <div className="p-2 bg-gradient-to-r from-gray-50 to-white flex gap-2 overflow-x-auto scrollbar-hide">
                  {listing.images.map((image, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      whileHover={{ scale: 1.05 }}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex 
                          ? 'border-blue-500 ring-2 ring-blue-300/50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Info - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Property Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-3xl font-bold text-gray-900 mb-2"
              >
                {listing.title || listing.address}
              </motion.h1>
              <p className="text-gray-600 flex items-center gap-2 text-base">
                <MapPin size={20} className="text-blue-500 flex-shrink-0" />
                {listing.city || listing.address}
              </p>
              {fullAddress && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl flex flex-wrap items-center gap-3">
                  <div className="flex items-start gap-2 text-gray-800">
                    <MapPin size={18} className="text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Full Address</p>
                      <p className="font-medium leading-relaxed">{fullAddress}</p>
                    </div>
                  </div>
                  {mapUrl && (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-sm"
                    >
                      <Navigation size={16} />
                      View on Map
                    </a>
                  )}
                </div>
              )}
              {listing.is_verified && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200 mt-3 w-fit">
                  <CheckCircle size={16} />
                  <span className="text-sm font-medium">Verified</span>
                </div>
              )}
            </div>

            {/* Price & Features */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <p className="text-gray-600 text-sm font-medium mb-2 uppercase tracking-wide">Monthly Rent</p>
              <p className="text-4xl font-bold text-blue-600 mb-4">
                Rs. {(listing.rent_amount || 0).toLocaleString()}
              </p>

              {/* Quick Features */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-200">
                  <Bed size={24} className="text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{listing.bedrooms || 0}</p>
                  <p className="text-xs text-gray-600 mt-1">Beds</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200">
                  <Bath size={24} className="text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{listing.bathrooms || 0}</p>
                  <p className="text-xs text-gray-600 mt-1">Baths</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg text-center border border-purple-200">
                  <Ruler size={24} className="text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{listing.area || 'N/A'}</p>
                  <p className="text-xs text-gray-600 mt-1">Sq.ft</p>
                </div>
              </div>
            </div>

            {/* Landlord Card */}
            <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
              <h3 className="font-bold text-sm text-gray-600 mb-3 uppercase">Landlord</h3>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                  <User size={24} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{listing.name || 'Landlord'}</p>
                  <p className="text-xs text-gray-600">Property Owner</p>
                </div>
              </div>
            </div>

            {/* Booking Status */}
            {getBookingStatusBadge()}

            {/* Action Buttons */}
            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowMessaging(!showMessaging)
                  if (!engagementData.clickedContact) {
                    setEngagementData(prev => ({ ...prev, clickedContact: true }))
                    updateEngagementTracking()
                  }
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all"
              >
                <MessageCircle size={18} />
                Chat with Landlord
              </motion.button>

              {canBook() ? (
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowBookingForm(!showBookingForm)}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                >
                  <Calendar size={18} />
                  Book Now
                </motion.button>
              ) : (
                <div className="w-full bg-gray-300 text-gray-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                  <Calendar size={18} />
                  {listing.booking_status === 'rented' ? 'Currently Rented' : 'Booking Unavailable'}
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <span className="text-xs text-gray-600 font-medium">Security Deposit</span>
                  <span className="font-bold text-gray-900 text-sm">Rs. {Math.round((listing.rent_amount || 0) * 2).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <span className="text-xs text-gray-600 font-medium">Available</span>
                  <span className="font-bold text-gray-900 text-sm">Immediately</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        {/* Bottom Section - Detailed Information */}
        <div className="space-y-6">
          {/* About Property */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Home size={28} className="text-blue-600" />
              About this Property
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {listing.description || 'No description available'}
            </p>
          </motion.div>

          {/* Amenities */}
          {listing.amenities && listing.amenities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Zap size={28} className="text-yellow-500" />
                Amenities
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {listing.amenities.map((amenity, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all"
                  >
                    <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium text-sm">{amenity}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Property Details Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Shield size={28} className="text-indigo-600" />
              Property Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <span className="text-gray-600 font-medium text-sm">Furnishing</span>
                <p className="font-bold text-gray-900 mt-2 capitalize bg-blue-100 text-blue-700 px-3 py-1 rounded inline-block text-sm">{listing.furnished || 'N/A'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <span className="text-gray-600 font-medium text-sm">Type</span>
                <p className="font-bold text-gray-900 mt-2 capitalize bg-purple-100 text-purple-700 px-3 py-1 rounded inline-block text-sm">{listing.type || 'N/A'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <span className="text-gray-600 font-medium text-sm">Status</span>
                <p className="font-bold text-gray-900 mt-2 capitalize bg-green-100 text-green-700 px-3 py-1 rounded inline-block text-sm">{listing.status || 'N/A'}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Fullscreen Image Gallery Modal */}
        <AnimatePresence>
          {showImageGallery && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4"
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ rotate: 90, scale: 1.1 }}
                onClick={() => setShowImageGallery(false)}
                className="absolute top-4 right-4 p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm z-10"
              >
                <X size={28} className="text-white" />
              </motion.button>

              {/* Main Image */}
              <div className="relative w-full h-[80vh] flex items-center justify-center mb-4">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    src={getImageUrl(listing.images?.[currentImageIndex])}
                    alt={`Property ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                </AnimatePresence>

                {/* Navigation */}
                {listing.images?.length > 1 && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={prevImage}
                      className="absolute left-4 p-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
                    >
                      <ChevronLeft size={32} className="text-white" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={nextImage}
                      className="absolute right-4 p-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
                    >
                      <ChevronRight size={32} className="text-white" />
                    </motion.button>
                  </>
                )}
              </div>

              {/* Thumbnail Strip */}
              <div className="w-full flex justify-center gap-2 overflow-x-auto pb-4">
                {listing.images?.map((image, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    whileHover={{ scale: 1.08 }}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex 
                        ? 'border-white ring-2 ring-white/50' 
                        : 'border-white/30 hover:border-white/50'
                    }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>

              {/* Counter */}
              <div className="text-white/80 text-center">
                {currentImageIndex + 1} / {listing.images?.length || 0}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booking Form Modal */}
        <AnimatePresence>
          {showBookingForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-100"
              >
                <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">Book This Property</h3>
                    <p className="text-sm text-gray-500">Fields marked with <span className="text-red-500">*</span> are required.</p>
                  </div>
                </div>
                
                {/* Property Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl mb-6 border border-blue-200">
                  <p className="font-bold text-gray-900 text-lg">{listing.title}</p>
                  <p className="text-blue-600 font-bold text-2xl mt-2">Rs. {listing.rent_amount || listing.price}/month</p>
                  <p className="text-gray-600 text-sm mt-3">Security Deposit: <span className="font-bold">Rs. {Math.round((listing.rent_amount || listing.price) * 2)}</span></p>
                </div>

                <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-900 font-semibold">
                    Provide complete tenant details and legal documents before sending your request.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={bookingForm.full_name}
                      onChange={(e) => setBookingForm({ ...bookingForm, full_name: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 transition-colors font-medium"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Permanent Address <span className="text-red-500">*</span></label>
                    <textarea
                      value={bookingForm.permanent_address}
                      onChange={(e) => setBookingForm({ ...bookingForm, permanent_address: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 h-20 resize-none focus:outline-none focus:border-blue-500 transition-colors font-medium text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Current Address <span className="text-red-500">*</span></label>
                    <textarea
                      value={bookingForm.current_address}
                      onChange={(e) => setBookingForm({ ...bookingForm, current_address: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 h-20 resize-none focus:outline-none focus:border-blue-500 transition-colors font-medium text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="98xxxxxxxxxx"
                      value={bookingForm.phone_number}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone_number: handleNumberOnlyChange(e.target.value) })}
                      maxLength="10"
                      className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 transition-colors font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 transition-colors font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Citizenship Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter citizenship number"
                      value={bookingForm.citizenship_number}
                      onChange={(e) => setBookingForm({ ...bookingForm, citizenship_number: handleNumberOnlyChange(e.target.value) })}
                      maxLength="15"
                      className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 transition-colors font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Occupation <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={bookingForm.occupation}
                      onChange={(e) => setBookingForm({ ...bookingForm, occupation: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 transition-colors font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Emergency Contact Person <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={bookingForm.emergency_contact_person}
                      onChange={(e) => setBookingForm({ ...bookingForm, emergency_contact_person: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 transition-colors font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Emergency Contact Phone Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="98xxxxxxxxxx"
                      value={bookingForm.emergency_contact_phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, emergency_contact_phone: handleNumberOnlyChange(e.target.value) })}
                      maxLength="10"
                      className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 transition-colors font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Citizenship Front Image <span className="text-red-500">*</span></label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBookingForm({ ...bookingForm, citizenship_front_image: e.target.files?.[0] || null })}
                      className="w-full border-2 border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-blue-500 transition-colors font-medium text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Citizenship Back Image <span className="text-red-500">*</span></label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBookingForm({ ...bookingForm, citizenship_back_image: e.target.files?.[0] || null })}
                      className="w-full border-2 border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-blue-500 transition-colors font-medium text-sm"
                    />
                  </div>
                </div>

                {/* Move-in Date */}
                <div className="mb-5">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Preferred Start Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={bookingForm.start_date}
                    onChange={(e) => setBookingForm({ ...bookingForm, start_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 transition-colors font-medium"
                  />
                </div>

                {/* Move-out Date */}
                <div className="mb-5">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Preferred End Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={bookingForm.end_date}
                    onChange={(e) => setBookingForm({ ...bookingForm, end_date: e.target.value })}
                    min={bookingForm.start_date || new Date().toISOString().split('T')[0]}
                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 transition-colors font-medium"
                  />
                </div>

                {/* Duration Display */}
                {bookingForm.start_date && bookingForm.end_date && (
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl mb-5 border border-green-200">
                    <p className="text-gray-700 font-medium">
                      Duration: <span className="font-bold text-green-700 text-lg">{Math.ceil((new Date(bookingForm.end_date) - new Date(bookingForm.start_date)) / (1000 * 60 * 60 * 24))} days</span>
                    </p>
                    <p className="text-gray-700 font-medium mt-2">
                      Total Rent: <span className="font-bold text-green-700 text-lg">Rs. {Math.round((Math.ceil((new Date(bookingForm.end_date) - new Date(bookingForm.start_date)) / (1000 * 60 * 60 * 24)) / 30) * (listing.rent_amount || listing.price)).toLocaleString()}</span>
                    </p>
                  </div>
                )}

                {/* Message to Landlord */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Message to Landlord (Optional)</label>
                  <textarea
                    value={bookingForm.message}
                    onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                    placeholder="Tell the landlord about yourself..."
                    className="w-full border-2 border-gray-200 rounded-xl p-3 h-24 resize-none focus:outline-none focus:border-blue-500 transition-colors font-medium text-sm"
                  />
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-bold text-gray-700"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBookProperty}
                    disabled={sendingBooking || !bookingForm.start_date || !bookingForm.end_date}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {sendingBooking ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    Send Request
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messaging Modal */}
        <AnimatePresence>
          {showMessaging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col border border-gray-100 overflow-hidden"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100">
                  <h3 className="text-2xl font-bold text-gray-900">Chat with Landlord</h3>
                  <motion.button
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowMessaging(false)}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                  >
                    <X size={24} className="text-gray-600" />
                  </motion.button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <TenantMessages
                    landlordId={listing?.landlord_id}
                    listingId={id}
                    landlordName={listing?.name}
                    onBack={() => setShowMessaging(false)}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modern Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: -100, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -100, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="fixed top-6 right-6 z-[100] max-w-md"
            >
              <div className={`rounded-2xl shadow-2xl overflow-hidden border-2 ${
                toastMessage.type === 'success' 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' 
                  : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-300'
              }`}>
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      toastMessage.type === 'success' 
                        ? 'bg-green-500' 
                        : 'bg-red-500'
                    }`}>
                      {toastMessage.type === 'success' ? (
                        <CheckCircle size={28} className="text-white" />
                      ) : (
                        <XCircle size={28} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-lg font-bold mb-1 ${
                        toastMessage.type === 'success' ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {toastMessage.title}
                      </h4>
                      <p className={`text-sm leading-relaxed ${
                        toastMessage.type === 'success' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {toastMessage.message}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowToast(false)}
                      className={`flex-shrink-0 p-1 rounded-lg transition-colors ${
                        toastMessage.type === 'success' 
                          ? 'hover:bg-green-200 text-green-700' 
                          : 'hover:bg-red-200 text-red-700'
                      }`}
                    >
                      <X size={20} />
                    </motion.button>
                  </div>
                </div>
                {/* Progress bar */}
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className={`h-1 ${
                    toastMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default TenantListingDetail
