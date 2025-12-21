import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../api/axios'
import { Search, Heart, MapPin, Bed, Bath, Ruler, Loader2, Eye, TrendingUp } from 'lucide-react'

const TenantHome = () => {
  const [featuredListings, setFeaturedListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchFeaturedListings()
  }, [])

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-8 md:p-12 text-white shadow-xl"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Home</h1>
          <p className="text-primary-100 mb-8 text-lg">Search through thousands of rental listings</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row gap-3"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by location, city, or area..."
            className="flex-1 px-6 py-4 rounded-xl text-gray-900 outline-none text-lg shadow-lg"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            className="bg-accent text-text px-8 py-4 rounded-xl hover:bg-opacity-90 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg text-lg"
          >
            <Search size={24} />
            Search
          </motion.button>
        </motion.div>
      </motion.div>

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
            <p className="text-gray-600 mt-2">Most viewed listings in your area</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/tenant/browse')}
            className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2"
          >
            View All
            <span>→</span>
          </motion.button>
        </div>

        {featuredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/tenant/browse?id=${listing.id}`)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={listing.images?.[0] || listing.images || '/placeholder.svg'}
                    alt={listing.title || listing.address}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors z-10"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Handle favorite toggle
                    }}
                  >
                    <Heart size={20} className="text-red-500" />
                  </motion.button>
                  <div className="absolute bottom-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    {listing.is_verified ? 'Verified' : 'New'}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-text mb-2 line-clamp-1">
                    {listing.title || listing.address || 'Property Listing'}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 flex items-center gap-1">
                    <MapPin size={16} className="text-primary-600" />
                    {listing.city || listing.address || listing.location || 'Location not specified'}
                  </p>

                  <div className="flex gap-4 mb-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Bed size={16} className="text-primary-600" />
                      {listing.bedrooms || 0} Beds
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath size={16} className="text-primary-600" />
                      {listing.bathrooms || 0} Baths
                    </span>
                    {listing.area && (
                      <span className="flex items-center gap-1">
                        <Ruler size={16} className="text-primary-600" />
                        {listing.area} sqft
                      </span>
                    )}
                  </div>

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
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold text-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/tenant/browse?id=${listing.id}`)
                      }}
                    >
                      View Details
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
            className="text-center py-16 bg-white rounded-xl shadow-lg"
          >
            <Search size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 text-lg mb-2">No listings available</p>
            <p className="text-gray-400 text-sm">Check back later for new properties</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default TenantHome
