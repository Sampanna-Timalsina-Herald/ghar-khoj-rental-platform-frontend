import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, ChevronLeft, ChevronRight, MapPin, Bed, Bath, Ruler, X, Loader2, Share2, Flag } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '../stores/authStore'
import api from '../api/axios'
import { getImageUrl } from '../utils/imageUtils'

const PropertyDetailModal = ({ listing, isOpen, onClose }) => {
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuthStore()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [loadingFavorite, setLoadingFavorite] = useState(false)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)

  if (!isOpen || !listing) return null

  const images = listing.images && listing.images.length > 0 ? listing.images : ['/placeholder.svg']



  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleFavoriteClick = async (e) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      setShowAuthPrompt(true)
      return
    }

    setLoadingFavorite(true)
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${listing.id}`)
        setIsFavorite(false)
      } else {
        try {
          await api.post(`/favorites/${listing.id}`)
          setIsFavorite(true)
        } catch (postError) {
          // If already in favorites error, treat as already favorited
          if (postError.response?.status === 400 && postError.response?.data?.error?.includes('already')) {
            setIsFavorite(true)
          } else {
            throw postError
          }
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite - Full Error:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)
      console.error('Error data:', error.response?.data)
      toast.error(`Failed to update favorite: ${error.response?.data?.error || error.message}`)
    } finally {
      setLoadingFavorite(false)
    }
  }

  const handleContactClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: 'property', listingId: listing.id } })
      onClose()
      return
    }

    // If authenticated, initiate conversation
    navigate(`/tenant/messages?listing=${listing.id}`, { state: { listing } })
    onClose()
  }

  const handleBookClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: 'property', listingId: listing.id } })
      onClose()
      return
    }

    // If authenticated, go to detailed contact page
    navigate(`/listing/${listing.id}`, { state: { listing } })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>

            {/* Image Gallery */}
            <div className="relative bg-gray-200 h-96 overflow-hidden">
              <img
                src={getImageUrl(images[currentImageIndex])}
                alt={listing.title}
                className="w-full h-full object-cover"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors z-10"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors z-10"
                  >
                    <ChevronRight size={24} />
                  </button>
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-4 bg-gradient-to-t from-black/50 to-transparent overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                        idx === currentImageIndex ? 'border-blue-500' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={getImageUrl(img)}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h2>
                  <div className="flex items-center text-gray-600 text-lg">
                    <MapPin size={20} className="mr-2 text-blue-600" />
                    {listing.address}, {listing.city}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFavoriteClick}
                  disabled={loadingFavorite}
                  className="p-3 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
                >
                  {loadingFavorite ? (
                    <Loader2 size={24} className="animate-spin text-gray-400" />
                  ) : (
                    <Heart
                      size={24}
                      className={`${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                    />
                  )}
                </motion.button>
              </div>

              {/* Price */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  Rs. {listing.rent_amount?.toLocaleString() || 'N/A'}
                  <span className="text-lg text-gray-600 ml-2">/ month</span>
                </div>
                {listing.deposit_amount && (
                  <p className="text-gray-600">
                    Deposit: Rs. {listing.deposit_amount.toLocaleString()}
                  </p>
                )}
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b border-gray-200">
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                  <Bed size={20} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Bedrooms</p>
                    <p className="text-lg font-bold text-gray-900">{listing.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                  <Bath size={20} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Bathrooms</p>
                    <p className="text-lg font-bold text-gray-900">{listing.bathrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                  <Ruler size={20} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Area</p>
                    <p className="text-lg font-bold text-gray-900">{listing.area || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                  <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold">F</div>
                  <div>
                    <p className="text-xs text-gray-600">Furnished</p>
                    <p className="text-lg font-bold text-gray-900 capitalize">{listing.furnished || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {listing.description && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">About This Property</h3>
                  <p className="text-gray-600 leading-relaxed line-clamp-4">{listing.description}</p>
                </div>
              )}

              {/* Amenities */}
              {listing.amenities && listing.amenities.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {listing.amenities.slice(0, 6).map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-gray-700 bg-gray-50 p-2 rounded">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Auth Prompt - shown when not authenticated */}
              {showAuthPrompt && !isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4"
                >
                  <p className="text-sm text-blue-900 font-semibold">
                    Sign in to add to favorites and contact property owner
                  </p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleContactClick}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  <MessageCircle size={20} />
                  {isAuthenticated ? 'Contact Owner' : 'Sign In & Contact'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBookClick}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  {isAuthenticated ? 'Full Details' : 'Sign In to Book'}
                </motion.button>
              </div>

              {/* Share and Report */}
              <div className="mt-4 flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
                  <Share2 size={18} />
                  Share
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
                  <Flag size={18} />
                  Report
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PropertyDetailModal
