import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api/axios'
import { Heart, MapPin, Bed, Bath, Ruler, Filter, Loader2 } from 'lucide-react'

const TenantBrowse = () => {
  const [searchParams] = useSearchParams()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    location: searchParams.get('search') || '',
    furnished: 'all',
    type: 'all',
  })
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    fetchListings()
  }, [filters])

  const fetchListings = async () => {
    try {
      const queryParams = new URLSearchParams()
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice)
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice)
      if (filters.bedrooms) queryParams.append('bedrooms', filters.bedrooms)
      if (filters.location) queryParams.append('location', filters.location)
      if (filters.furnished !== 'all') queryParams.append('furnished', filters.furnished)
      if (filters.type !== 'all') queryParams.append('type', filters.type)

      const response = await api.get(`/listings?${queryParams}`)
      setListings(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-primary-600" />
      </div>
    )
  }

  const handleFavoriteToggle = async (listingId, e) => {
    e.stopPropagation()
    // TODO: Implement favorite toggle
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-text">Browse Listings</h1>
          <p className="text-gray-600 mt-1">Find your perfect rental property</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="lg:hidden p-3 border-2 border-primary-600 text-primary-600 rounded-lg flex items-center gap-2 font-semibold"
        >
          <Filter size={20} />
          Filters
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${filtersOpen ? 'block' : 'hidden'} lg:block col-span-1`}
        >
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <h3 className="font-bold text-text">Filters</h3>

            <div>
              <label className="block text-sm font-medium text-text mb-2">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="input-field text-sm"
                placeholder="Enter location"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-text mb-2">Min Price</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="input-field text-sm"
                  placeholder="Min"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">Max Price</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="input-field text-sm"
                  placeholder="Max"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">Bedrooms</label>
              <select
                value={filters.bedrooms}
                onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                className="input-field text-sm"
              >
                <option value="">All Bedrooms</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="input-field text-sm"
              >
                <option value="all">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="studio">Studio</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">Furnished</label>
              <select
                value={filters.furnished}
                onChange={(e) => handleFilterChange('furnished', e.target.value)}
                className="input-field text-sm"
              >
                <option value="all">All</option>
                <option value="unfurnished">Unfurnished</option>
                <option value="semi">Semi-Furnished</option>
                <option value="furnished">Fully Furnished</option>
              </select>
            </div>
              </div>
            </motion.div>

        {/* Listings */}
        <div className="lg:col-span-3 space-y-4">
          <AnimatePresence mode="wait">
            {listings.length > 0 ? (
              listings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-md p-6 flex gap-4 hover:shadow-xl transition-all duration-300"
                >
                <img
                  src={listing.images?.[0] || '/placeholder.svg'}
                  alt={listing.title}
                  className="w-48 h-32 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-text line-clamp-1">{listing.title || listing.address || 'Property Listing'}</h3>
                      <p className="text-gray-600 text-sm flex items-center gap-1">
                        <MapPin size={16} className="text-primary-600" />
                        {listing.city || listing.address || listing.location || 'Location not specified'}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleFavoriteToggle(listing.id, e)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Heart size={20} className="text-red-500" />
                    </motion.button>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {listing.description || 'No description available'}
                  </p>

                  <div className="flex gap-4 mb-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Bed size={16} />
                      {listing.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath size={16} />
                      {listing.bathrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Ruler size={16} />
                      {listing.area}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary-600">
                        Rs. {(listing.rent_amount || listing.price || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">per month</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                    >
                      Contact Owner
                    </motion.button>
                  </div>
                </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-600 text-lg">No listings found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default TenantBrowse
