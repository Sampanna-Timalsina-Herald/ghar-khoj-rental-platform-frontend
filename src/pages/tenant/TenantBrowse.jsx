import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api/axios'
import { useAuthStore } from '../../stores/authStore'
import { Heart, MapPin, Bed, Bath, Ruler, Filter, Loader2, ChevronRight } from 'lucide-react'

const TenantBrowse = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    location: searchParams.get('location') || '',
    propertyType: searchParams.get('type') || '',
    amenities: searchParams.get('amenities') ? searchParams.get('amenities').split(',') : [],
  })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [favorites, setFavorites] = useState(new Set())

  useEffect(() => {
    fetchListings()
  }, [filters])

  const fetchListings = async () => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams()
      
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice)
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice)
      if (filters.bedrooms) queryParams.append('bedrooms', filters.bedrooms)
      if (filters.bathrooms) queryParams.append('bathrooms', filters.bathrooms)
      if (filters.location) queryParams.append('location', filters.location)
      if (filters.propertyType) queryParams.append('type', filters.propertyType)
      if (filters.amenities.length > 0) queryParams.append('amenities', filters.amenities.join(','))

      const response = await api.get(`/listings?${queryParams}`)
      setListings(response.data.data || response.data || [])
    } catch (err) {
      console.error('Failed to fetch listings:', err)
      setError('Failed to load listings. Please try again.')
      setListings([])
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

  const handleAmenityChange = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleContactOwner = (listingId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: 'browse', listingId } })
    } else {
      navigate(`/listing/${listingId}`)
    }
  }

  const handleFavoriteToggle = async (listingId, e) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      navigate('/login', { state: { from: 'browse', listingId } })
      return
    }
    
    const newFavorites = new Set(favorites)
    if (newFavorites.has(listingId)) {
      newFavorites.delete(listingId)
    } else {
      newFavorites.add(listingId)
    }
    setFavorites(newFavorites)
    
    // TODO: Implement favorite toggle API call
  }

  if (loading && listings.length === 0) {
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
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-text">Search Properties</h1>
          <p className="text-gray-600 mt-1">
            {listings.length > 0 ? `Found ${listings.length} properties matching your criteria` : 'Find your perfect rental property'}
          </p>
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${filtersOpen ? 'block' : 'hidden'} lg:block col-span-1`}
        >
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 sticky top-6">
            <h3 className="font-bold text-lg text-text flex items-center gap-2">
              <Filter size={20} /> Filters
            </h3>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">Location / Area</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 outline-none"
                placeholder="Enter area name"
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">Price Range (Monthly)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 outline-none"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 outline-none"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">Bedrooms</label>
              <select
                value={filters.bedrooms}
                onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 outline-none bg-white"
              >
                <option value="">All Bedrooms</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">Bathrooms</label>
              <select
                value={filters.bathrooms}
                onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 outline-none bg-white"
              >
                <option value="">All Bathrooms</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
              </select>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">Property Type</label>
              <select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 outline-none bg-white"
              >
                <option value="">All Types</option>
                <option value="flat">Flat / Apartment</option>
                <option value="house">House</option>
                <option value="room">Single Room</option>
              </select>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">Amenities</label>
              <div className="space-y-2">
                {['Wifi', 'Parking', 'Balcony', 'Garden', 'AC'].map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2 text-gray-600 text-sm cursor-pointer hover:text-primary-600">
                    <input
                      type="checkbox"
                      checked={filters.amenities.includes(amenity)}
                      onChange={() => handleAmenityChange(amenity)}
                      className="rounded text-primary-600 focus:ring-primary-600"
                    />
                    {amenity}
                  </label>
                ))}
              </div>
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
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-md p-6 flex gap-4 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(`/listing/${listing.id}`)}
                >
                  {/* Image */}
                  <div className="relative w-48 h-32 flex-shrink-0 overflow-hidden rounded-lg">
                    <img
                      src={
                        listing.images && listing.images.length > 0
                          ? (listing.images[0].startsWith('http') ? listing.images[0] : `http://localhost:5000${listing.images[0]}`)
                          : '/placeholder.svg'
                      }
                      alt={listing.title || 'Property'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = '/placeholder.svg' }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-text line-clamp-1">
                          {listing.title || listing.address || 'Property Listing'}
                        </h3>
                        <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                          <MapPin size={16} className="text-primary-600" />
                          {listing.address}, {listing.city || 'Location not specified'}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleFavoriteToggle(listing.id, e)}
                        className="p-2 hover:bg-red-50 rounded-lg flex-shrink-0"
                      >
                        <Heart 
                          size={20} 
                          className={favorites.has(listing.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                        />
                      </motion.button>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {listing.description || 'No description available'}
                    </p>

                    {/* Property Features */}
                    <div className="flex gap-4 mb-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                        <Bed size={16} /> {listing.bedrooms || '0'} Bed{listing.bedrooms !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                        <Bath size={16} /> {listing.bathrooms || '0'} Bath{listing.bathrooms !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                        <Ruler size={16} /> {listing.area || 'N/A'} sqft
                      </span>
                    </div>

                    {/* Price and Action */}
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
                        onClick={(e) => {
                          e.stopPropagation()
                          handleContactOwner(listing.id)
                        }}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2"
                      >
                        Contact <ChevronRight size={16} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-white rounded-xl"
              >
                <p className="text-gray-600 text-lg font-semibold">No listings found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default TenantBrowse
