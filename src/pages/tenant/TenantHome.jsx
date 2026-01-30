import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api/axios'
import { Search, Heart, MapPin, Bed, Bath, Ruler, Loader2, Eye, TrendingUp, ArrowRight, Zap, Shield, Clock, Sparkles } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import SearchSuggestions from '../../components/SearchSuggestions'

const TenantHome = () => {
  const [featuredListings, setFeaturedListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useState(new Set())
  const [loadingFav, setLoadingFav] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchFeaturedListings()
    if (user) {
      fetchUserFavorites()
    }
  }, [user])

  const fetchUserFavorites = async () => {
    try {
      const response = await api.get('/favorites')
      // Response returns full listing objects, so map the id field
      const favoriteIds = new Set(response.data.data?.map(listing => listing.id) || [])
      setFavorites(favoriteIds)
      console.log('[TenantHome] Favorites loaded:', Array.from(favoriteIds))
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
    }
  }

  const fetchFeaturedListings = async () => {
    try {
      const response = await api.get('/listings?limit=6')
      setFeaturedListings(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFavoriteToggle = async (listingId, e) => {
    e.stopPropagation()
    
    if (!user) {
      alert('Please log in to add favorites')
      navigate('/login')
      return
    }
    
    setLoadingFav(listingId)
    try {
      if (favorites.has(listingId)) {
        // Remove from favorites
        await api.delete(`/favorites/${listingId}`)
        const newFav = new Set(favorites)
        newFav.delete(listingId)
        setFavorites(newFav)
      } else {
        // Add to favorites - use the correct endpoint
        try {
          await api.post(`/favorites/${listingId}`)
          const newFav = new Set(favorites)
          newFav.add(listingId)
          setFavorites(newFav)
        } catch (postError) {
          // If already in favorites error, treat as already favorited
          if (postError.response?.status === 400 && postError.response?.data?.error?.includes('already')) {
            const newFav = new Set(favorites)
            newFav.add(listingId)
            setFavorites(newFav)
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
      alert(`Failed to update favorite: ${error.response?.data?.error || error.message}`)
    } finally {
      setLoadingFav(null)
    }
  }

  const handleViewProperty = (listingId, e) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    navigate(`/tenant/listing/${listingId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Minimal Header & Search Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-text">
            Welcome back, <span className="text-primary-600">{user?.first_name || 'Tenant'}</span>
          </h1>
          <p className="text-gray-500 mt-2 text-lg">Find your perfect home in Kathmandu Valley</p>
        </div>

        {/* YouTube-Style Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl"
        >
          <SearchSuggestions
            value={searchQuery}
            onChange={setSearchQuery}
            onSelect={(selected) => {
              if (typeof selected === 'string') {
                // Search text entered
                console.log('[TenantHome] Search text:', selected)
                navigate(`/tenant/browse?search=${encodeURIComponent(selected)}`)
              } else if (selected?.id) {
                // Property selected from dropdown
                console.log('[TenantHome] Property selected:', selected)
                navigate(`/tenant/listing/${selected.id}`)
              }
            }}
            placeholder="Search by location, area, or price..."
            className="w-full"
          />
        </motion.div>
      </motion.div>

      {/* Minimal Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="hidden md:grid grid-cols-3 gap-4"
      >
        <div className="bg-white rounded-lg p-5 border border-gray-100 hover:border-gray-300 transition-all">
          <Zap size={20} className="text-primary-600 mb-3" />
          <h3 className="font-semibold text-text text-sm mb-1">Smart Filters</h3>
          <p className="text-gray-500 text-xs leading-relaxed">Advanced filters for price, location, amenities</p>
        </div>

        <div className="bg-white rounded-lg p-5 border border-gray-100 hover:border-gray-300 transition-all">
          <Shield size={20} className="text-primary-600 mb-3" />
          <h3 className="font-semibold text-text text-sm mb-1">Verified Listings</h3>
          <p className="text-gray-500 text-xs leading-relaxed">All properties verified by our team</p>
        </div>

        <div className="bg-white rounded-lg p-5 border border-gray-100 hover:border-gray-300 transition-all">
          <Clock size={20} className="text-primary-600 mb-3" />
          <h3 className="font-semibold text-text text-sm mb-1">Instant Messaging</h3>
          <p className="text-gray-500 text-xs leading-relaxed">Direct contact with property owners</p>
        </div>
      </motion.div>

      {/* AI Recommendations Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-text">Recommended For You</h2>
              <p className="text-gray-500 text-sm mt-1">Personalized based on your preferences</p>
            </div>
          </div>
          <div className="text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">AI Powered</div>
        </div>

        {/* Recommendation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Sample Recommendation Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-lg overflow-hidden border border-blue-200 hover:border-blue-300 transition-all duration-300 cursor-pointer group relative"
          >
            {/* Recommendation Badge */}
            <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 z-10 shadow-lg">
              <Sparkles size={12} />
              <span>Top Match</span>
            </div>

            {/* Image Container */}
            <div className="relative overflow-hidden h-48">
              <img
                src="/placeholder.svg"
                alt="Recommended Property"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Favorite Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-3 right-3 p-2 bg-white/95 hover:bg-white rounded-full shadow flex items-center justify-center z-10 transition-all"
              >
                <Heart size={16} className="text-gray-400" />
              </motion.button>

              {/* Match Score */}
              <div className="absolute bottom-3 right-3 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-semibold border border-green-200">
                95% Match
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-semibold text-text mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors text-sm">
                Modern Apartment in Baneshwor
              </h3>
              <p className="text-gray-500 text-xs mb-4 flex items-center gap-1">
                <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                Baneshwor, Kathmandu
              </p>

              {/* Why Recommended */}
              <div className="mb-4 p-2 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700 font-medium mb-1">Why this matches:</p>
                <p className="text-xs text-gray-600">✓ Within your budget • ✓ Preferred location • ✓ 2 bedrooms</p>
              </div>

              {/* Features Row */}
              <div className="flex gap-2 mb-4 text-xs">
                <span className="flex items-center gap-1 text-gray-600">
                  <Bed size={12} className="text-gray-400" />
                  2
                </span>
                <span className="flex items-center gap-1 text-gray-600">
                  <Bath size={12} className="text-gray-400" />
                  1
                </span>
                <span className="flex items-center gap-1 text-gray-600">
                  <Ruler size={12} className="text-gray-400" />
                  800 sq.ft
                </span>
              </div>

              {/* Price and Button */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-lg font-bold text-primary-600">Rs. 25,000</p>
                  <p className="text-xs text-gray-400">/month</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                  View Details
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Sample Recommendation Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-lg overflow-hidden border border-blue-200 hover:border-blue-300 transition-all duration-300 cursor-pointer group relative"
          >
            {/* Recommendation Badge */}
            <div className="absolute top-3 left-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 z-10 shadow-lg">
              <TrendingUp size={12} />
              <span>Popular</span>
            </div>

            {/* Image Container */}
            <div className="relative overflow-hidden h-48">
              <img
                src="/placeholder.svg"
                alt="Recommended Property"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Favorite Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-3 right-3 p-2 bg-white/95 hover:bg-white rounded-full shadow flex items-center justify-center z-10 transition-all"
              >
                <Heart size={16} className="text-gray-400" />
              </motion.button>

              {/* Match Score */}
              <div className="absolute bottom-3 right-3 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-semibold border border-green-200">
                88% Match
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-semibold text-text mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors text-sm">
                Spacious Flat in Lazimpat
              </h3>
              <p className="text-gray-500 text-xs mb-4 flex items-center gap-1">
                <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                Lazimpat, Kathmandu
              </p>

              {/* Why Recommended */}
              <div className="mb-4 p-2 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700 font-medium mb-1">Why this matches:</p>
                <p className="text-xs text-gray-600">✓ Popular area • ✓ Great amenities • ✓ Near transit</p>
              </div>

              {/* Features Row */}
              <div className="flex gap-2 mb-4 text-xs">
                <span className="flex items-center gap-1 text-gray-600">
                  <Bed size={12} className="text-gray-400" />
                  3
                </span>
                <span className="flex items-center gap-1 text-gray-600">
                  <Bath size={12} className="text-gray-400" />
                  2
                </span>
                <span className="flex items-center gap-1 text-gray-600">
                  <Ruler size={12} className="text-gray-400" />
                  1200 sq.ft
                </span>
              </div>

              {/* Price and Button */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-lg font-bold text-primary-600">Rs. 35,000</p>
                  <p className="text-xs text-gray-400">/month</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                  View Details
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Sample Recommendation Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-lg overflow-hidden border border-blue-200 hover:border-blue-300 transition-all duration-300 cursor-pointer group relative"
          >
            {/* Recommendation Badge */}
            <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 z-10 shadow-lg">
              <Zap size={12} />
              <span>New</span>
            </div>

            {/* Image Container */}
            <div className="relative overflow-hidden h-48">
              <img
                src="/placeholder.svg"
                alt="Recommended Property"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Favorite Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-3 right-3 p-2 bg-white/95 hover:bg-white rounded-full shadow flex items-center justify-center z-10 transition-all"
              >
                <Heart size={16} className="text-gray-400" />
              </motion.button>

              {/* Match Score */}
              <div className="absolute bottom-3 right-3 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-semibold border border-green-200">
                92% Match
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-semibold text-text mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors text-sm">
                Cozy Room in Thamel
              </h3>
              <p className="text-gray-500 text-xs mb-4 flex items-center gap-1">
                <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                Thamel, Kathmandu
              </p>

              {/* Why Recommended */}
              <div className="mb-4 p-2 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700 font-medium mb-1">Why this matches:</p>
                <p className="text-xs text-gray-600">✓ Affordable • ✓ Central location • ✓ Just listed</p>
              </div>

              {/* Features Row */}
              <div className="flex gap-2 mb-4 text-xs">
                <span className="flex items-center gap-1 text-gray-600">
                  <Bed size={12} className="text-gray-400" />
                  1
                </span>
                <span className="flex items-center gap-1 text-gray-600">
                  <Bath size={12} className="text-gray-400" />
                  1
                </span>
                <span className="flex items-center gap-1 text-gray-600">
                  <Ruler size={12} className="text-gray-400" />
                  500 sq.ft
                </span>
              </div>

              {/* Price and Button */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-lg font-bold text-primary-600">Rs. 18,000</p>
                  <p className="text-xs text-gray-400">/month</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                  View Details
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Trending Properties Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-text">Featured Listings</h2>
            <p className="text-gray-500 text-sm mt-1">Popular properties available now</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/tenant/browse')}
            className="hidden md:flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm px-4 py-2 rounded-lg border border-primary-200 hover:bg-primary-50 transition-all"
          >
            View All
            <ArrowRight size={16} />
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {featuredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredListings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-all duration-300 cursor-pointer group"
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={
                        listing.images && listing.images.length > 0
                          ? (listing.images[0].startsWith('http') ? listing.images[0] : `http://localhost:5000${listing.images[0]}`)
                          : '/placeholder.svg'
                      }
                      alt={listing.title || listing.address}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => handleViewProperty(listing.id)}
                    />
                    
                    {/* Favorite Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleFavoriteToggle(listing.id, e)}
                      className="absolute top-3 right-3 p-2 bg-white/95 hover:bg-white rounded-full shadow flex items-center justify-center z-10 transition-all"
                    >
                      {loadingFav === listing.id ? (
                        <Loader2 size={16} className="animate-spin text-gray-400" />
                      ) : (
                        <Heart 
                          size={16} 
                          className={favorites.has(listing.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'} 
                        />
                      )}
                    </motion.button>

                    {/* Verified Badge */}
                    {listing.is_verified && (
                      <div className="absolute bottom-3 left-3 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 border border-green-200">
                        <span>✓</span> Verified
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-text mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors text-sm">
                      {listing.title || listing.address || 'Property Listing'}
                    </h3>
                    <p className="text-gray-500 text-xs mb-4 flex items-center gap-1">
                      <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                      {listing.city || listing.address || listing.location || 'Location not specified'}
                    </p>

                    {/* Features Row */}
                    <div className="flex gap-2 mb-4 text-xs">
                      {listing.bedrooms && (
                        <span className="flex items-center gap-1 text-gray-600">
                          <Bed size={12} className="text-gray-400" />
                          {listing.bedrooms}
                        </span>
                      )}
                      {listing.bathrooms && (
                        <span className="flex items-center gap-1 text-gray-600">
                          <Bath size={12} className="text-gray-400" />
                          {listing.bathrooms}
                        </span>
                      )}
                      {listing.area && (
                        <span className="flex items-center gap-1 text-gray-600">
                          <Ruler size={12} className="text-gray-400" />
                          {listing.area}
                        </span>
                      )}
                    </div>

                    {/* Price and Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-lg font-bold text-primary-600">
                          Rs. {(listing.rent_amount || listing.price || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">/month</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewProperty(listing.id)
                        }}
                        className="px-3 py-2 bg-primary-600 text-white rounded text-xs font-semibold hover:bg-primary-700 transition-colors"
                      >
                        View
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200"
            >
              <Search size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600 font-medium">No listings available</p>
              <p className="text-gray-400 text-sm">Check back later for new properties</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/tenant/browse')}
          className="w-full md:hidden mt-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
        >
          View All Listings
          <ArrowRight size={18} />
        </motion.button>
      </motion.div>
    </div>
  )
}

export default TenantHome
