import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Bed, Bath, Ruler, Heart, MessageCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../api/axios'
import SmartNav from '../components/SmartNav'

const ListingDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    fetchListing()
  }, [id])

  const fetchListing = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Try to get from location state first
      if (location.state?.listing) {
        setListing(location.state.listing)
      } else {
        // Otherwise fetch from API
        const response = await api.get(`/listings/${id}`)
        setListing(response.data.data || response.data)
      }
    } catch (err) {
      console.error('Failed to fetch listing:', err)
      setError('Failed to load listing details')
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder.svg'
    return imagePath.startsWith('http') ? imagePath : `http://localhost:5000${imagePath}`
  }

  const nextImage = () => {
    if (listing?.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length)
    }
  }

  const prevImage = () => {
    if (listing?.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SmartNav />
        <div className="max-w-6xl mx-auto px-4 py-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-semibold"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-red-600 font-semibold">{error || 'Listing not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  const images = listing.images && listing.images.length > 0 ? listing.images : ['/placeholder.svg']

  return (
    <div className="min-h-screen bg-gray-50">
      <SmartNav />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-semibold"
        >
          <ArrowLeft size={20} />
          Go Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
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
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
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
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
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
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                <div className="flex items-center text-gray-600 text-lg">
                  <MapPin size={20} className="mr-2 text-blue-600" />
                  {listing.address}, {listing.city}
                </div>
              </div>
              <button className="p-3 rounded-full hover:bg-red-50 transition-colors">
                <Heart
                  size={28}
                  className={`${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                />
              </button>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Bed size={24} className="text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Bedrooms</p>
                  <p className="text-2xl font-bold text-gray-900">{listing.bedrooms}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Bath size={24} className="text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Bathrooms</p>
                  <p className="text-2xl font-bold text-gray-900">{listing.bathrooms}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Ruler size={24} className="text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="text-2xl font-bold text-gray-900 capitalize">{listing.type || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded text-blue-600 flex items-center justify-center bg-blue-100 text-sm font-bold">F</div>
                <div>
                  <p className="text-sm text-gray-600">Furnished</p>
                  <p className="text-2xl font-bold text-gray-900 capitalize">{listing.furnished || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Property</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            </div>

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {listing.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-700">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Section */}
            <div className="bg-blue-50 rounded-lg p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Interested in this property?</p>
                <p className="text-xl font-semibold text-gray-900">Contact the landlord</p>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                <MessageCircle size={20} />
                Send Message
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ListingDetail
