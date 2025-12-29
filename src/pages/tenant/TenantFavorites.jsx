import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api/axios'
import { Trash2, MapPin, Bed, Bath, Ruler, Heart, Loader2, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const TenantFavorites = () => {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState(null)

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/favorites')
      setFavorites(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (id, e) => {
    e.stopPropagation()
    setRemoving(id)
    try {
      await api.delete(`/favorites/${id}`)
      setFavorites((prev) => prev.filter((fav) => fav.id !== id))
    } catch (error) {
      console.error('Failed to remove favorite:', error)
    } finally {
      setRemoving(null)
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
        <div className="flex items-center gap-3 mb-2">
          <Heart size={32} className="text-primary-600" />
          <h1 className="text-3xl font-bold text-text">My Favorites</h1>
        </div>
        <p className="text-gray-600">Your saved property listings</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite, index) => (
              <motion.div
                key={favorite.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/tenant/browse?id=${favorite.listing?.id || favorite.listing_id}`)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={
                      favorite.listing?.images && favorite.listing.images.length > 0
                        ? (favorite.listing.images[0].startsWith('http') ? favorite.listing.images[0] : `http://localhost:5000${favorite.listing.images[0]}`)
                        : '/placeholder.svg'
                    }
                    alt={favorite.listing?.title || favorite.listing?.address}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleRemove(favorite.id, e)}
                    disabled={removing === favorite.id}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors z-10 disabled:opacity-50"
                  >
                    {removing === favorite.id ? (
                      <Loader2 size={20} className="animate-spin text-red-500" />
                    ) : (
                      <Trash2 size={20} className="text-red-500" />
                    )}
                  </motion.button>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-text mb-2 line-clamp-1">
                    {favorite.listing?.title || favorite.listing?.address || 'Property Listing'}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 flex items-center gap-1">
                    <MapPin size={16} className="text-primary-600" />
                    {favorite.listing?.city || favorite.listing?.address || favorite.listing?.location || 'Location not specified'}
                  </p>

                  <div className="flex gap-4 mb-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Bed size={16} className="text-primary-600" />
                      {favorite.listing?.bedrooms || 0} Beds
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath size={16} className="text-primary-600" />
                      {favorite.listing?.bathrooms || 0} Baths
                    </span>
                    {favorite.listing?.area && (
                      <span className="flex items-center gap-1">
                        <Ruler size={16} className="text-primary-600" />
                        {favorite.listing.area} sqft
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-2xl font-bold text-primary-600">
                        Rs. {(favorite.listing?.rent_amount || favorite.listing?.price || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">per month</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold text-sm flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/tenant/browse?id=${favorite.listing?.id || favorite.listing_id}`)
                      }}
                    >
                      <Eye size={16} />
                      View
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white rounded-xl shadow-lg"
          >
            <Heart size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 text-lg mb-2">No favorites yet</p>
            <p className="text-gray-400 text-sm mb-6">Start browsing and save your favorite properties!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/tenant/browse')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Browse Listings
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TenantFavorites
