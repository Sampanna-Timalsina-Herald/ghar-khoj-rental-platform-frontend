import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api/axios'
import { useAuthStore } from '../../stores/authStore'
import { Heart, MapPin, Bed, Bath, Ruler, Filter, Loader2, ChevronRight, Grid3X3, List, ChevronDown, X, Settings2, Search as SearchIcon } from 'lucide-react'
import SearchSuggestions from '../../components/SearchSuggestions'

const TenantBrowse = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const searchInputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const filterDebounceTimerRef = useRef(null)
  const [searchBarValue, setSearchBarValue] = useState(searchParams.get('search') || '')
  
  // Local filter states for controlled inputs
  const [localFilters, setLocalFilters] = useState({
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    location: searchParams.get('location') || '',
    propertyType: searchParams.get('type') || '',
    amenities: searchParams.get('amenities') ? searchParams.get('amenities').split(',') : [],
    searchText: searchParams.get('search') || '',
  })
  
  // Actual filters for API calls (debounced)
  const [filters, setFilters] = useState(localFilters)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [favorites, setFavorites] = useState(new Set())
  const [loadingFav, setLoadingFav] = useState(null)
  const [viewMode, setViewMode] = useState('list')
  const [sortBy, setSortBy] = useState('newest')
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    price: true,
    bedrooms: false,
    bathrooms: false,
    type: false,
    amenities: false,
  })

  // Load initial data once on mount
  useEffect(() => {
    fetchListings()
    if (isAuthenticated) {
      fetchUserFavorites()
    }
  }, [])

  // Debounced filter effect - fetch when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListings()
      // Track search for ML recommendations
      if (isAuthenticated && (filters.location || filters.minPrice || filters.maxPrice || filters.bedrooms || filters.propertyType)) {
        trackSearchForML(filters)
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [filters, isAuthenticated])

  // Track search for ML when filters are applied
  const trackSearchForML = useCallback(async (searchFilters) => {
    try {
      await api.post('/recommendations/ml/track-search', {
        city: searchFilters.location || null,
        min_rent: searchFilters.minPrice ? parseInt(searchFilters.minPrice) : null,
        max_rent: searchFilters.maxPrice ? parseInt(searchFilters.maxPrice) : null,
        bedrooms: searchFilters.bedrooms ? parseInt(searchFilters.bedrooms) : null,
        bathrooms: searchFilters.bathrooms ? parseInt(searchFilters.bathrooms) : null,
        property_type: searchFilters.propertyType || null,
        amenities: searchFilters.amenities.length > 0 ? searchFilters.amenities : null,
      })
      console.log('[TenantBrowse] Search tracked for ML')
    } catch (error) {
      console.error('[TenantBrowse] Failed to track search:', error)
    }
  }, [])

  const fetchUserFavorites = useCallback(async () => {
    try {
      const response = await api.get('/favorites')
      const favoriteIds = new Set(response.data.data?.map(listing => listing.id) || [])
      setFavorites(favoriteIds)
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
    }
  }, [])

  const fetchListings = useCallback(async () => {
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
      // Add search text parameter for global search
      if (filters.searchText) queryParams.append('search', filters.searchText)

      const url = `/listings?${queryParams}`
      console.log('[TenantBrowse] Fetching listings with filters:', { filters, url })
      const response = await api.get(url)
      console.log('[TenantBrowse] Listings fetched:', response.data.data?.length || 0, 'items')
      setListings(response.data.data || response.data || [])
    } catch (err) {
      console.error('Failed to fetch listings:', err)
      setError('Failed to load listings. Please try again.')
      setListings([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Handle local filter changes with debounce
  const handleFilterChange = useCallback((name, value) => {
    // Update local state immediately for UI feedback
    setLocalFilters(prev => ({
      ...prev,
      [name]: value,
    }))

    // Debounce actual filter update
    clearTimeout(filterDebounceTimerRef.current)
    filterDebounceTimerRef.current = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        [name]: value,
      }))
    }, 500)
  }, [])

  const handleAmenityChange = useCallback((amenity) => {
    // Update local state immediately
    const newAmenities = localFilters.amenities.includes(amenity)
      ? localFilters.amenities.filter(a => a !== amenity)
      : [...localFilters.amenities, amenity]
    
    setLocalFilters(prev => ({
      ...prev,
      amenities: newAmenities,
    }))

    // Debounce actual filter update
    clearTimeout(filterDebounceTimerRef.current)
    filterDebounceTimerRef.current = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        amenities: newAmenities,
      }))
    }, 500)
  }, [localFilters.amenities])

  const toggleFilterSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.location) count++
    if (filters.minPrice || filters.maxPrice) count++
    if (filters.bedrooms) count++
    if (filters.bathrooms) count++
    if (filters.propertyType) count++
    if (filters.amenities.length > 0) count++
    return count
  }

  const removeFilter = (filterName) => {
    if (filterName === 'amenities') {
      setFilters(prev => ({ ...prev, amenities: [] }))
    } else {
      setFilters(prev => ({ ...prev, [filterName]: '' }))
    }
  }

  const removeAmenity = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      location: '',
      propertyType: '',
      amenities: [],
    })
    setSortBy('newest')
  }

  const appliedPresets = {
    budget: filters.maxPrice && parseInt(filters.maxPrice) <= 20000,
    luxury: filters.minPrice && parseInt(filters.minPrice) >= 50000,
    studio: filters.bedrooms === '1' && filters.bathrooms === '1',
    family: filters.bedrooms && parseInt(filters.bedrooms) >= 3,
  }

  const setSortedListings = (sortType) => {
    let sorted = [...listings]
    switch(sortType) {
      case 'price-low':
        sorted.sort((a, b) => (a.rent_amount || a.price) - (b.rent_amount || b.price))
        break
      case 'price-high':
        sorted.sort((a, b) => (b.rent_amount || b.price) - (a.rent_amount || a.price))
        break
      case 'area-large':
        sorted.sort((a, b) => (parseInt(b.area) || 0) - (parseInt(a.area) || 0))
        break
      case 'newest':
      default:
        sorted.sort((a, b) => (new Date(b.created_at) || 0) - (new Date(a.created_at) || 0))
    }
    return sorted
  }

  const handleContactOwner = (listingId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: 'browse', listingId } })
    } else {
      navigate(`/tenant/listing/${listingId}`)
    }
  }

  const handleFavoriteToggle = async (listingId, e) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      navigate('/login', { state: { from: 'browse', listingId } })
      return
    }
    
    setLoadingFav(listingId)
    try {
      if (favorites.has(listingId)) {
        // Remove from favorites
        await api.delete(`/favorites/${listingId}`)
        const newFavorites = new Set(favorites)
        newFavorites.delete(listingId)
        setFavorites(newFavorites)
      } else {
        // Add to favorites - use correct endpoint with listingId in URL
        try {
          await api.post(`/favorites/${listingId}`)
          const newFavorites = new Set(favorites)
          newFavorites.add(listingId)
          setFavorites(newFavorites)
        } catch (postError) {
          // If already in favorites error, treat as already favorited
          if (postError.response?.status === 400 && postError.response?.data?.error?.includes('already')) {
            const newFavorites = new Set(favorites)
            newFavorites.add(listingId)
            setFavorites(newFavorites)
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

  if (loading && listings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text">Search Properties</h1>
            <p className="text-gray-600 mt-1">
              {listings.length > 0 ? `Found ${listings.length} properties` : 'Find your perfect rental property'}
            </p>
          </div>
        </div>

        {/* YouTube-Style Search Bar */}
        <div className="max-w-2xl">
          <SearchSuggestions
            value={searchBarValue}
            onChange={setSearchBarValue}
            onSelect={(selected) => {
              console.log('[TenantBrowse] onSelect called with:', selected, 'type:', typeof selected)
              if (typeof selected === 'string') {
                // Search text entered - IMMEDIATE search without debounce
                console.log('[TenantBrowse] Setting search bar value to string:', selected, 'length:', selected.length)
                setSearchBarValue(selected)
                // Immediate filter update for search (no debounce for search action)
                clearTimeout(filterDebounceTimerRef.current)
                setFilters(prev => ({ ...prev, searchText: selected }))
              } else if (selected && selected.id) {
                // Property selected from dropdown
                console.log('[TenantBrowse] Setting search bar value to title:', selected.title)
                setSearchBarValue(selected.title || '')
                // Show only the selected property
                clearTimeout(filterDebounceTimerRef.current)
                setListings([selected])
              }
            }}
            placeholder="Search properties by name, location..."
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-3 justify-end">
          <div className="flex items-center gap-3">
            {/* Sorting Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-primary-600 outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="area-large">Largest Area</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-gray-100 rounded-lg border border-gray-300 p-1 w-fit">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-primary-600 shadow-md'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                <Grid3X3 size={18} />
                Grid
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-primary-600 shadow-md'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                <List size={18} />
                List
              </motion.button>
            </div>

            {/* Filters Button with Badge */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="lg:hidden p-3 border-2 border-primary-600 text-primary-600 rounded-lg flex items-center gap-2 font-semibold relative"
            >
              <Filter size={20} />
              {getActiveFiltersCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {getActiveFiltersCount()}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Active Filters Display */}
      <AnimatePresence>
        {(getActiveFiltersCount() > 0 || Object.values(appliedPresets).some(v => v)) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 size={18} className="text-blue-600" />
                <span className="font-semibold text-blue-900">Active Filters ({getActiveFiltersCount()})</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearAllFilters}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 transition-all"
              >
                Clear All
              </motion.button>
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.location && (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 bg-white border border-blue-300 rounded-full px-3 py-1 text-sm"
                >
                  <MapPin size={14} className="text-blue-600" />
                  <span className="font-medium">{filters.location}</span>
                  <button
                    onClick={() => removeFilter('location')}
                    className="hover:bg-blue-100 rounded p-0.5 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              )}

              {(filters.minPrice || filters.maxPrice) && (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 bg-white border border-blue-300 rounded-full px-3 py-1 text-sm"
                >
                  <span className="font-medium">
                    Rs. {filters.minPrice || '0'} - {filters.maxPrice || '∞'}
                  </span>
                  <button
                    onClick={() => { setFilters(prev => ({ ...prev, minPrice: '', maxPrice: '' })) }}
                    className="hover:bg-blue-100 rounded p-0.5 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              )}

              {filters.bedrooms && (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 bg-white border border-blue-300 rounded-full px-3 py-1 text-sm"
                >
                  <Bed size={14} className="text-blue-600" />
                  <span className="font-medium">{filters.bedrooms}+ Beds</span>
                  <button
                    onClick={() => removeFilter('bedrooms')}
                    className="hover:bg-blue-100 rounded p-0.5 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              )}

              {filters.bathrooms && (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 bg-white border border-blue-300 rounded-full px-3 py-1 text-sm"
                >
                  <Bath size={14} className="text-blue-600" />
                  <span className="font-medium">{filters.bathrooms}+ Baths</span>
                  <button
                    onClick={() => removeFilter('bathrooms')}
                    className="hover:bg-blue-100 rounded p-0.5 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              )}

              {filters.propertyType && (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 bg-white border border-blue-300 rounded-full px-3 py-1 text-sm"
                >
                  <span className="font-medium capitalize">{filters.propertyType}</span>
                  <button
                    onClick={() => removeFilter('propertyType')}
                    className="hover:bg-blue-100 rounded p-0.5 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              )}

              {filters.amenities.map(amenity => (
                <motion.div
                  key={amenity}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 bg-white border border-blue-300 rounded-full px-3 py-1 text-sm"
                >
                  <span className="font-medium">{amenity}</span>
                  <button
                    onClick={() => removeAmenity(amenity)}
                    className="hover:bg-blue-100 rounded p-0.5 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Enhanced Filters Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${filtersOpen ? 'block' : 'hidden'} lg:block col-span-1`}
        >
          <div className="bg-white rounded-lg shadow p-6 space-y-4 sticky top-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-text flex items-center gap-2">
                <Filter size={20} /> Advanced Filters
              </h3>
              {getActiveFiltersCount() > 0 && (
                <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded-full">
                  {getActiveFiltersCount()}
                </span>
              )}
            </div>

            {/* Location */}
            <div className="border-b pb-4">
              <button
                onClick={() => toggleFilterSection('location')}
                className="w-full flex items-center justify-between text-sm font-semibold text-text hover:text-primary-600 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <MapPin size={16} />
                  Location / Area
                </span>
                <motion.div
                  animate={{ rotate: expandedSections.location ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} />
                </motion.div>
              </button>
              <AnimatePresence>
                {expandedSections.location && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3"
                  >
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={localFilters.location}
                      onChange={(e) => {
                        // Update local state for immediate UI feedback, but don't trigger search
                        setLocalFilters(prev => ({ ...prev, location: e.target.value }))
                      }}
                      onKeyDown={(e) => {
                        // Only trigger search on Enter
                        if (e.key === 'Enter') {
                          setFilters(prev => ({ ...prev, location: localFilters.location }))
                        }
                      }}
                      placeholder="Enter area name (press Enter to search)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 outline-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Price Range */}
            <div className="border-b pb-4">
              <button
                onClick={() => toggleFilterSection('price')}
                className="w-full flex items-center justify-between text-sm font-semibold text-text hover:text-primary-600 transition-colors"
              >
                <span>Price Range (Monthly)</span>
                <motion.div
                  animate={{ rotate: expandedSections.price ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} />
                </motion.div>
              </button>
              <AnimatePresence>
                {expandedSections.price && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 space-y-2"
                  >
                    <input
                      type="number"
                      value={localFilters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 outline-none"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={localFilters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 outline-none"
                      placeholder="Max"
                    />
                    {/* Quick Presets */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button
                        onClick={() => { setFilters(prev => ({ ...prev, minPrice: '', maxPrice: '20000' })) }}
                        className="text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded transition-colors"
                      >
                        Budget
                      </button>
                      <button
                        onClick={() => { setFilters(prev => ({ ...prev, minPrice: '50000', maxPrice: '' })) }}
                        className="text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 py-2 rounded transition-colors"
                      >
                        Luxury
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bedrooms */}
            <div className="border-b pb-4">
              <button
                onClick={() => toggleFilterSection('bedrooms')}
                className="w-full flex items-center justify-between text-sm font-semibold text-text hover:text-primary-600 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Bed size={16} />
                  Bedrooms
                </span>
                <motion.div
                  animate={{ rotate: expandedSections.bedrooms ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} />
                </motion.div>
              </button>
              <AnimatePresence>
                {expandedSections.bedrooms && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3"
                  >
                    <select
                      value={localFilters.bedrooms}
                      onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 outline-none bg-white"
                    >
                      <option value="">All Bedrooms</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bathrooms */}
            <div className="border-b pb-4">
              <button
                onClick={() => toggleFilterSection('bathrooms')}
                className="w-full flex items-center justify-between text-sm font-semibold text-text hover:text-primary-600 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Bath size={16} />
                  Bathrooms
                </span>
                <motion.div
                  animate={{ rotate: expandedSections.bathrooms ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} />
                </motion.div>
              </button>
              <AnimatePresence>
                {expandedSections.bathrooms && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3"
                  >
                    <select
                      value={localFilters.bathrooms}
                      onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 outline-none bg-white"
                    >
                      <option value="">All Bathrooms</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Property Type */}
            <div className="border-b pb-4">
              <button
                onClick={() => toggleFilterSection('type')}
                className="w-full flex items-center justify-between text-sm font-semibold text-text hover:text-primary-600 transition-colors"
              >
                <span>Property Type</span>
                <motion.div
                  animate={{ rotate: expandedSections.type ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} />
                </motion.div>
              </button>
              <AnimatePresence>
                {expandedSections.type && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3"
                  >
                    <select
                      value={localFilters.propertyType}
                      onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 outline-none bg-white"
                    >
                      <option value="">All Types</option>
                      <option value="flat">Flat / Apartment</option>
                      <option value="house">House</option>
                      <option value="room">Single Room</option>
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Amenities */}
            <div>
              <button
                onClick={() => toggleFilterSection('amenities')}
                className="w-full flex items-center justify-between text-sm font-semibold text-text hover:text-primary-600 transition-colors"
              >
                <span>Amenities</span>
                <motion.div
                  animate={{ rotate: expandedSections.amenities ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} />
                </motion.div>
              </button>
              <AnimatePresence>
                {expandedSections.amenities && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 space-y-2"
                  >
                    {['Wifi', 'Parking', 'Balcony', 'Garden', 'AC'].map((amenity) => (
                      <label key={amenity} className="flex items-center gap-2 text-gray-600 text-sm cursor-pointer hover:text-primary-600 transition-colors">
                        <input
                          type="checkbox"
                          checked={localFilters.amenities.includes(amenity)}
                          onChange={() => handleAmenityChange(amenity)}
                          className="rounded text-primary-600 focus:ring-primary-600"
                        />
                        {amenity}
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Listings */}
        <div className="lg:col-span-3 space-y-4">
          {viewMode === 'list' ? (
            <AnimatePresence mode="wait">
              {listings.length > 0 ? (
                setSortedListings(sortBy).map((listing, index) => (
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
                          <h3 className="text-lg font-bold text-text line-clamp-1 group-hover:text-primary-600 transition-colors">
                            {listing.title || listing.address || 'Property Listing'}
                          </h3>
                          <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                            <MapPin size={16} className="text-primary-600 flex-shrink-0" />
                            {listing.address}, {listing.city || 'Location not specified'}
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleFavoriteToggle(listing.id, e)}
                          className="p-2 hover:bg-red-50 rounded-lg flex-shrink-0 transition-colors"
                        >
                          {loadingFav === listing.id ? (
                            <Loader2 size={20} className="animate-spin text-gray-400" />
                          ) : (
                            <Heart 
                              size={20} 
                              className={favorites.has(listing.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                            />
                          )}
                        </motion.button>
                      </div>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {listing.description || 'No description available'}
                      </p>

                      {/* Property Features */}
                      <div className="flex gap-3 mb-4 text-xs text-gray-600 font-semibold flex-wrap">
                        <span className="flex items-center gap-1 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1 rounded-lg border border-blue-200">
                          <Bed size={14} className="text-blue-600" /> {listing.bedrooms || '0'} Bed{listing.bedrooms !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1 bg-gradient-to-r from-green-50 to-green-100 px-3 py-1 rounded-lg border border-green-200">
                          <Bath size={14} className="text-green-600" /> {listing.bathrooms || '0'} Bath{listing.bathrooms !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1 bg-gradient-to-r from-purple-50 to-purple-100 px-3 py-1 rounded-lg border border-purple-200">
                          <Ruler size={14} className="text-purple-600" /> {listing.area || 'N/A'} sqft
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
                          className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                        >
                          View <ChevronRight size={16} />
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
          ) : (
            /* GRID VIEW */
            <AnimatePresence mode="wait">
              {listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {setSortedListings(sortBy).map((listing, index) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                      onClick={() => navigate(`/listing/${listing.id}`)}
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
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
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleFavoriteToggle(listing.id, e)}
                          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
                        >
                          {loadingFav === listing.id ? (
                            <Loader2 size={20} className="animate-spin text-gray-400" />
                          ) : (
                            <Heart 
                              size={20} 
                              className={favorites.has(listing.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                            />
                          )}
                        </motion.button>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-text line-clamp-1 group-hover:text-primary-600 transition-colors mb-1">
                          {listing.title || listing.address || 'Property Listing'}
                        </h3>
                        <p className="text-gray-600 text-sm flex items-center gap-1 mb-3">
                          <MapPin size={14} className="text-primary-600 flex-shrink-0" />
                          {listing.city || 'Location not specified'}
                        </p>

                        <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                          {listing.description || 'No description available'}
                        </p>

                        {/* Property Features */}
                        <div className="flex gap-2 mb-4 text-xs font-semibold flex-wrap">
                          <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            <Bed size={12} /> {listing.bedrooms || '0'}
                          </span>
                          <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded">
                            <Bath size={12} /> {listing.bathrooms || '0'}
                          </span>
                          <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            <Ruler size={12} /> {listing.area || 'N/A'}
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-lg font-bold text-primary-600">
                              Rs. {(listing.rent_amount || listing.price || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">per month</p>
                          </div>
                        </div>

                        {/* Action Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleContactOwner(listing.id)
                          }}
                          className="w-full px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                        >
                          View Details
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 bg-white rounded-xl col-span-full"
                >
                  <p className="text-gray-600 text-lg font-semibold">No listings found</p>
                  <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms</p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}

export default TenantBrowse
