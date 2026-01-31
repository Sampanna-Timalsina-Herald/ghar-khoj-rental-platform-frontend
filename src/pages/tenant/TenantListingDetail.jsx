import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, MapPin, Bed, Bath, Ruler, Heart, MessageCircle, Loader2, 
  ChevronLeft, ChevronRight, Phone, Mail, User, Calendar, CheckCircle,
  FileText, Send, X, Maximize2, Grid3x3, Zap, Shield, Home, Sofa
} from 'lucide-react'
import api from '../../api/axios'
import { useAuthStore } from '../../stores/authStore'
import TenantMessages from '../../components/TenantMessages.jsx'

const TenantListingDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [loadingFav, setLoadingFav] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showContactForm, setShowContactForm] = useState(false)
  const [showAgreementForm, setShowAgreementForm] = useState(false)
  const [showMessaging, setShowMessaging] = useState(false)
  const [contactMessage, setContactMessage] = useState('')
  const [sendingContact, setSendingContact] = useState(false)
  const [sendingAgreement, setSendingAgreement] = useState(false)
  const [showImageGallery, setShowImageGallery] = useState(false)
  const [gallerViewMode, setGalleryViewMode] = useState('main') // 'main' or 'grid'
  
  // ML Engagement tracking
  const [engagementData, setEngagementData] = useState({
    viewStartTime: Date.now(),
    viewedImages: false,
    clickedContact: false,
    addedToFavorites: false
  })
  
  const [agreementForm, setAgreementForm] = useState({
    start_date: '',
    end_date: '',
    terms: ''
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

  const trackPropertyView = async (propertyId) => {
    try {
      await api.post('/recommendations/ml/track-view', {
        property_id: propertyId,
        duration_seconds: 0,
        viewed_images: false,
        clicked_contact: false,
        added_to_favorites: false
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

  const handleSendMessage = async () => {
    if (!contactMessage.trim()) {
      alert('Please enter a message')
      return
    }

    setSendingContact(true)
    try {
      // Send message to landlord
      await api.post('/messages', {
        receiver_id: listing.landlord_id,
        listing_id: listing.id,
        message: contactMessage,
      })
      alert('Message sent successfully!')
      setContactMessage('')
      setShowContactForm(false)
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message')
    } finally {
      setSendingContact(false)
    }
  }

  const handleRequestAgreement = async () => {
    // Validate form fields
    if (!agreementForm.start_date) {
      alert('Please select a move-in date')
      return
    }
    if (!agreementForm.end_date) {
      alert('Please select a move-out date')
      return
    }

    // Validate date range
    const startDate = new Date(agreementForm.start_date)
    const endDate = new Date(agreementForm.end_date)
    if (endDate <= startDate) {
      alert('Move-out date must be after move-in date')
      return
    }

    if (sendingAgreement) return

    setSendingAgreement(true)
    try {
      const monthlyRent = listing.rent_amount || listing.price
      const deposit = Math.round(monthlyRent * 2) // 2 months deposit

      const response = await api.post('/agreements/request-rent', {
        listing_id: listing.id,
        start_date: agreementForm.start_date,
        end_date: agreementForm.end_date,
        monthly_rent: monthlyRent,
        deposit: deposit,
        terms: agreementForm.terms || ''
      })

      alert('Agreement request sent successfully!')
      setShowAgreementForm(false)
      setAgreementForm({ start_date: '', end_date: '', terms: '' })
    } catch (error) {
      console.error('Failed to send agreement:', error)
      alert(error.response?.data?.message || 'Failed to send agreement request')
    } finally {
      setSendingAgreement(false)
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

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder.svg'
    return imagePath.startsWith('http') ? imagePath : `http://localhost:5000${imagePath}`
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
                Chat
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAgreementForm(!showAgreementForm)}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all"
              >
                <FileText size={18} />
                Agreement
              </motion.button>
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

        {/* Contact Form Modal */}
        <AnimatePresence>
          {showContactForm && (
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
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-100"
              >
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Send Message</h3>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Tell the landlord about yourself and ask any questions..."
                  className="w-full border-2 border-gray-200 rounded-xl p-4 mb-6 h-32 resize-none focus:outline-none focus:border-blue-500 transition-colors font-medium"
                />
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowContactForm(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-bold text-gray-700"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendMessage}
                    disabled={sendingContact}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {sendingContact ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    Send
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Agreement Form Modal */}
        <AnimatePresence>
          {showAgreementForm && (
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
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-100"
              >
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Request Rent Agreement</h3>
                
                {/* Property Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl mb-6 border border-blue-200">
                  <p className="font-bold text-gray-900 text-lg">{listing.title}</p>
                  <p className="text-blue-600 font-bold text-2xl mt-2">Rs. {listing.rent_amount || listing.price}/month</p>
                  <p className="text-gray-600 text-sm mt-3">Security Deposit: <span className="font-bold">Rs. {Math.round((listing.rent_amount || listing.price) * 2)}</span></p>
                </div>

                {/* Move-in Date */}
                <div className="mb-5">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Move-in Date</label>
                  <input
                    type="date"
                    value={agreementForm.start_date}
                    onChange={(e) => setAgreementForm({ ...agreementForm, start_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 transition-colors font-medium"
                  />
                </div>

                {/* Move-out Date */}
                <div className="mb-5">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Move-out Date</label>
                  <input
                    type="date"
                    value={agreementForm.end_date}
                    onChange={(e) => setAgreementForm({ ...agreementForm, end_date: e.target.value })}
                    min={agreementForm.start_date || new Date().toISOString().split('T')[0]}
                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 transition-colors font-medium"
                  />
                </div>

                {/* Duration Display */}
                {agreementForm.start_date && agreementForm.end_date && (
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl mb-5 border border-green-200">
                    <p className="text-gray-700 font-medium">
                      Duration: <span className="font-bold text-green-700 text-lg">{Math.ceil((new Date(agreementForm.end_date) - new Date(agreementForm.start_date)) / (1000 * 60 * 60 * 24))} days</span>
                    </p>
                  </div>
                )}

                {/* Additional Terms */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Additional Terms (Optional)</label>
                  <textarea
                    value={agreementForm.terms}
                    onChange={(e) => setAgreementForm({ ...agreementForm, terms: e.target.value })}
                    placeholder="Any special conditions or requirements..."
                    className="w-full border-2 border-gray-200 rounded-xl p-3 h-24 resize-none focus:outline-none focus:border-blue-500 transition-colors font-medium text-sm"
                  />
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAgreementForm(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-bold text-gray-700"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRequestAgreement}
                    disabled={sendingAgreement || !agreementForm.start_date || !agreementForm.end_date}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {sendingAgreement ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    Send
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
      </div>
    </div>
  )
}

export default TenantListingDetail
