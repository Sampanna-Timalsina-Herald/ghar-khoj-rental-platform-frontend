import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api/axios'
import { Search, Heart, MapPin, Bed, Bath, Ruler, Loader2, Eye, TrendingUp, ArrowRight, Zap, Shield, Clock } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/tenant/browse?search=${encodeURIComponent(searchQuery)}`)
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
    <div className="space-y-8">
      {/* Welcome Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48"></div>
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Welcome, {user?.first_name || 'Tenant'}! 👋
            </h1>
            <p className="text-primary-100 mb-8 text-xl leading-relaxed max-w-2xl">
              Find your perfect rental home in Kathmandu Valley with verified listings. Start your search now!
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col md:flex-row gap-3 max-w-2xl"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by location, area, or city..."
              className="flex-1 px-6 py-4 rounded-xl text-gray-900 outline-none text-lg shadow-lg font-medium"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              className="bg-accent text-text px-8 py-4 rounded-xl hover:bg-opacity-90 transition-all font-bold flex items-center justify-center gap-2 shadow-lg text-lg whitespace-nowrap"
            >
              <Search size={24} />
              Search
            </motion.button>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-4 mt-8"
          >
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-primary-100 text-sm font-semibold">Active Listings</p>
              <p className="text-3xl font-bold text-white">2.5K+</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-primary-100 text-sm font-semibold">Verified Owners</p>
              <p className="text-3xl font-bold text-white">500+</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-primary-100 text-sm font-semibold">Happy Tenants</p>
              <p className="text-3xl font-bold text-white">1K+</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:border-primary-300 transition-all">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Zap className="text-blue-600" size={24} />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Smart Filters</h3>
          <p className="text-gray-600 text-sm">Find homes using advanced filters for price, location, and amenities</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:border-primary-300 transition-all">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Shield className="text-green-600" size={24} />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Verified Listings</h3>
          <p className="text-gray-600 text-sm">All properties are verified by our team for authenticity</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:border-primary-300 transition-all">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Clock className="text-purple-600" size={24} />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Instant Messaging</h3>
          <p className="text-gray-600 text-sm">Direct contact with property owners for quick inquiries</p>
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
            <h2 className="text-3xl font-bold text-text flex items-center gap-2">
              <TrendingUp size={28} className="text-primary-600" />
              Trending Properties
            </h2>
            <p className="text-gray-600 mt-2">Most viewed and popular listings this week</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/tenant/browse')}
            className="hidden md:flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold bg-primary-50 px-6 py-3 rounded-xl transition-all"
          >
            View All
            <ArrowRight size={20} />
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {featuredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-primary-300"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden h-56">
                    <img
                      src={
                        listing.images && listing.images.length > 0
                          ? (listing.images[0].startsWith('http') ? listing.images[0] : `http://localhost:5000${listing.images[0]}`)
                          : '/placeholder.svg'
                      }
                      alt={listing.title || listing.address}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                      onClick={() => handleViewProperty(listing.id)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    {/* Badge */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleFavoriteToggle(listing.id, e)}
                      className="absolute top-4 right-4 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center z-10 transition-all"
                    >
                      {loadingFav === listing.id ? (
                        <Loader2 size={18} className="animate-spin text-gray-400" />
                      ) : (
                        <Heart 
                          size={18} 
                          className={favorites.has(listing.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'} 
                        />
                      )}
                    </motion.button>

                    <div className="absolute bottom-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      {listing.is_verified ? '✓ Verified' : 'New'}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-text mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                      {listing.title || listing.address || 'Property Listing'}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 flex items-center gap-1">
                      <MapPin size={16} className="text-primary-600 flex-shrink-0" />
                      {listing.city || listing.address || listing.location || 'Location not specified'}
                    </p>

                    {/* Features */}
                    <div className="flex gap-3 mb-4 text-xs text-gray-600 font-semibold">
                      <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                        <Bed size={14} className="text-primary-600" />
                        {listing.bedrooms || 0}
                      </span>
                      <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                        <Bath size={14} className="text-primary-600" />
                        {listing.bathrooms || 0}
                      </span>
                      {listing.area && (
                        <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                          <Ruler size={14} className="text-primary-600" />
                          {listing.area}
                        </span>
                      )}
                    </div>

                    {/* Price and Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-2xl font-bold text-primary-600">
                          Rs. {(listing.rent_amount || listing.price || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">per month</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewProperty(listing.id)
                        }}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold text-sm"
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
              className="text-center py-16 bg-white rounded-2xl shadow-lg"
            >
              <Search size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 text-lg mb-2 font-semibold">No listings available</p>
              <p className="text-gray-400 text-sm">Check back later for new properties</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/tenant/browse')}
          className="w-full md:hidden mt-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
        >
          View All Listings
          <ArrowRight size={20} />
        </motion.button>
      </motion.div>
    </div>
  )
}

export default TenantHome
