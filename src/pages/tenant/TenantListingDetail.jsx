import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, MapPin, Bed, Bath, Ruler, Heart, MessageCircle, Loader2, 
  ChevronLeft, ChevronRight, Phone, Mail, User, Calendar, CheckCircle,
  FileText, Send, X
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
  const [agreementMessage, setAgreementMessage] = useState('')
  const [sendingContact, setSendingContact] = useState(false)
  const [sendingAgreement, setSendingAgreement] = useState(false)

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
    } catch (err) {
      console.error('Failed to fetch listing:', err)
    } finally {
      setLoading(false)
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
      } else {
        try {
          await api.post(`/favorites/${id}`)
          setIsFavorite(true)
        } catch (postError) {
          if (postError.response?.status === 400) {
            setIsFavorite(true)
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
    if (!agreementMessage.trim()) {
      alert('Please enter a message')
      return
    }

    setSendingAgreement(true)
    try {
      // Send agreement request
      await api.post('/agreements', {
        listing_id: listing.id,
        landlord_id: listing.landlord_id,
        tenant_id: user.id,
        message: agreementMessage,
        status: 'pending',
      })
      alert('Agreement request sent successfully!')
      setAgreementMessage('')
      setShowAgreementForm(false)
    } catch (error) {
      console.error('Failed to send agreement:', error)
      alert('Failed to send agreement request')
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-white shadow-sm"
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={24} />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavoriteClick}
              disabled={loadingFav}
              className="p-3 rounded-full bg-gray-100 hover:bg-red-50 transition-colors"
            >
              {loadingFav ? (
                <Loader2 size={20} className="animate-spin text-gray-400" />
              ) : (
                <Heart
                  size={20}
                  className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}
                />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative bg-black aspect-video flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    src={getImageUrl(listing.images?.[currentImageIndex])}
                    alt={`Property ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Image counter */}
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {listing.images?.length || 0}
                </div>

                {/* Navigation buttons */}
                {listing.images?.length > 1 && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
                    >
                      <ChevronLeft size={24} className="text-gray-900" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
                    >
                      <ChevronRight size={24} className="text-gray-900" />
                    </motion.button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {listing.images?.length > 1 && (
                <div className="p-4 bg-gray-50 flex gap-2 overflow-x-auto">
                  {listing.images.map((image, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      whileHover={{ scale: 1.05 }}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex ? 'border-primary-600' : 'border-gray-200'
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

          {/* Sidebar - Details & Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Property Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {listing.title || listing.address}
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <MapPin size={18} className="text-primary-600" />
                  {listing.city || listing.address}
                </p>
              </div>

              {/* Price */}
              <div className="border-t border-b py-4">
                <p className="text-gray-600 text-sm mb-1">Monthly Rent</p>
                <p className="text-3xl font-bold text-primary-600">
                  Rs. {(listing.rent_amount || 0).toLocaleString()}
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Bed size={24} className="text-primary-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold">{listing.bedrooms || 0}</p>
                  <p className="text-xs text-gray-600">Bedrooms</p>
                </div>
                <div className="text-center">
                  <Bath size={24} className="text-primary-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold">{listing.bathrooms || 0}</p>
                  <p className="text-xs text-gray-600">Bathrooms</p>
                </div>
                <div className="text-center">
                  <Ruler size={24} className="text-primary-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold">{listing.area || 'N/A'}</p>
                  <p className="text-xs text-gray-600">Area</p>
                </div>
              </div>

              {/* Verification Badge */}
              {listing.is_verified && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                  <CheckCircle size={18} />
                  <span className="text-sm font-medium">Verified Listing</span>
                </div>
              )}
            </div>

            {/* Landlord Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Landlord Information</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User size={24} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{listing.name || 'Landlord'}</p>
                  <p className="text-sm text-gray-600">Property Owner</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowMessaging(!showMessaging)}
                className="w-full bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                Chat with Landlord
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAgreementForm(!showAgreementForm)}
                className="w-full bg-accent text-white py-3 rounded-xl hover:bg-opacity-90 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <FileText size={20} />
                Request Agreement
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Description & Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About this Property</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {listing.description || 'No description available'}
            </p>

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Amenities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {listing.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle size={18} className="text-green-500" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Property Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Furnishing</span>
                <span className="font-semibold text-gray-900 capitalize">{listing.furnished || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type</span>
                <span className="font-semibold text-gray-900 capitalize">{listing.type || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="font-semibold text-gray-900 capitalize">{listing.status || 'N/A'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Form Modal */}
        <AnimatePresence>
          {showContactForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 mt-16"
            >
              <motion.div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Send Message</h3>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Tell the landlord about yourself and ask any questions..."
                  className="w-full border border-gray-300 rounded-lg p-3 mb-4 h-32 resize-none focus:outline-none focus:border-primary-600"
                />
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowContactForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendMessage}
                    disabled={sendingContact}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 mt-16"
            >
              <motion.div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Request Agreement</h3>
                <textarea
                  value={agreementMessage}
                  onChange={(e) => setAgreementMessage(e.target.value)}
                  placeholder="Mention your requirements, move-in date, and any specific terms..."
                  className="w-full border border-gray-300 rounded-lg p-3 mb-4 h-32 resize-none focus:outline-none focus:border-primary-600"
                />
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAgreementForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRequestAgreement}
                    disabled={sendingAgreement}
                    className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {sendingAgreement ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    Send
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Messaging Modal */}
          {showMessaging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-xl font-bold text-gray-900">Chat with Landlord</h3>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    onClick={() => setShowMessaging(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={24} className="text-gray-600" />
                  </motion.button>
                </div>
                <TenantMessages
                  landlordId={listing?.landlord_id}
                  listingId={id}
                  landlordName={listing?.name}
                  onBack={() => setShowMessaging(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default TenantListingDetail
