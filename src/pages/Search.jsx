import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import { useAuthStore } from '../stores/authStore'
import { Heart, MapPin, Bed, Bath, Ruler, Filter, Loader2, ChevronRight, X, ArrowLeft } from 'lucide-react'
import SmartNav from '../components/SmartNav'
import { toast } from 'sonner'

const Search = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    location: searchParams.get('location') || '',
    propertyType: searchParams.get('type') || '',
    amenities: searchParams.get('amenities') ? searchParams.get('amenities').split(',') : [],
  })
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [favorites, setFavorites] = useState(new Set())

  useEffect(() => {
    fetchListings()
  }, [filters])

  const fetchListings = async () => {
    try {
      setLoading(true)
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
      toast.error('Failed to load listings. Please try again.')
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

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      location: '',
      propertyType: '',
      amenities: [],
    })
  }

  const handleContactOwner = (listingId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: 'search', listingId } })
    } else {
      navigate(`/listing/${listingId}`)
    }
  }

  const handleFavoriteToggle = async (listingId, e) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      navigate('/login', { state: { from: 'search', listingId } })
      return
    }
    
    const newFavorites = new Set(favorites)
    if (newFavorites.has(listingId)) {
      newFavorites.delete(listingId)
    } else {
      newFavorites.add(listingId)
    }
    setFavorites(newFavorites)
  }

  const hasActiveFilters = Object.values(filters).some(val => 
    val !== '' && (Array.isArray(val) ? val.length > 0 : val)
  )

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <SmartNav />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Find Your Perfect Home</h1>
          <p className="text-gray-600 mt-2">
            {listings.length > 0 ? `Found ${listings.length} properties matching your criteria` : 'Refine your search to find properties'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 sticky top-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <Filter size={20} /> Filters
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Location / Area</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter area name"
                />
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Price Range (Monthly)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Bedrooms</label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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
                <label className="block text-sm font-medium text-gray-900 mb-2">Bathrooms</label>
                <select
                  value={filters.bathrooms}
                  onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">All Bathrooms</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Property Type</label>
                <select
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">All Types</option>
                  <option value="flat">Flat / Apartment</option>
                  <option value="house">House</option>
                  <option value="room">Single Room</option>
                </select>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Amenities</label>
                <div className="space-y-2">
                  {['Wifi', 'Parking', 'Balcony', 'Garden', 'AC'].map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2 text-gray-600 text-sm cursor-pointer hover:text-blue-600">
                      <input
                        type="checkbox"
                        checked={filters.amenities.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      {amenity}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Listings */}
          <div className="lg:col-span-3">
            {loading && listings.length === 0 ? (
              <div className="flex items-center justify-center min-h-[600px]">
                <Loader2 size={40} className="animate-spin text-blue-600" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {listings.length > 0 ? (
                  <div className="space-y-4">
                    {listings.map((listing, index) => (
                      <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                        onClick={() => navigate(`/listing/${listing.id}`)}
                      >
                        <div className="flex flex-col md:flex-row gap-6 p-6">
                          {/* Image */}
                          <div className="relative w-full md:w-64 h-56 md:h-auto flex-shrink-0 overflow-hidden rounded-xl">
                            <img
                              src={
                                listing.images && listing.images.length > 0
                                  ? (listing.images[0].startsWith('http') ? listing.images[0] : `http://localhost:5000${listing.images[0]}`)
                                  : '/placeholder.svg'
                              }
                              alt={listing.title || 'Property'}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => { e.target.src = '/placeholder.svg' }}
                            />
                            <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                              Featured
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-2xl font-bold text-gray-900 line-clamp-1">
                                    {listing.title || listing.address || 'Property Listing'}
                                  </h3>
                                  <p className="text-gray-600 text-sm flex items-center gap-1 mt-2">
                                    <MapPin size={16} className="text-blue-600" />
                                    {listing.address}, {listing.city || 'Location not specified'}
                                  </p>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => handleFavoriteToggle(listing.id, e)}
                                  className="p-2 hover:bg-red-50 rounded-lg flex-shrink-0"
                                >
                                  <Heart 
                                    size={24} 
                                    className={favorites.has(listing.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                                  />
                                </motion.button>
                              </div>

                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                {listing.description || 'No description available'}
                              </p>

                              {/* Property Features */}
                              <div className="flex flex-wrap gap-3 mb-4">
                                <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium">
                                  <Bed size={18} /> {listing.bedrooms || '0'} Bed{listing.bedrooms !== 1 ? 's' : ''}
                                </span>
                                <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium">
                                  <Bath size={18} /> {listing.bathrooms || '0'} Bath{listing.bathrooms !== 1 ? 's' : ''}
                                </span>
                                <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium">
                                  <Ruler size={18} /> {listing.area || 'N/A'} sqft
                                </span>
                              </div>
                            </div>

                            {/* Price and Action */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                              <div>
                                <p className="text-3xl font-bold text-blue-600">
                                  Rs. {(listing.rent_amount || listing.price || 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">per month</p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleContactOwner(listing.id)
                                }}
                                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                              >
                                Contact Landlord <ChevronRight size={18} />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-24 bg-white rounded-2xl shadow-lg"
                  >
                    <p className="text-gray-600 text-xl font-semibold">No properties found</p>
                    <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
                      Try adjusting your filters or searching for a different location
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Search
