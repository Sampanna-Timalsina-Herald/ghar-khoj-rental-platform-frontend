import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api/axios'
import { Search, Heart, MapPin, Bed, Bath, Ruler, Loader2, Eye, TrendingUp, ArrowRight, Zap, Shield, Clock, Sparkles } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import SearchSuggestions from '../../components/SearchSuggestions'
import { toast } from 'sonner'
import { getListingImageUrl } from '../../utils/imageUtils'

const TenantHome = () => {
  const [featuredListings, setFeaturedListings] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingRecommendations, setLoadingRecommendations] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useState(new Set())
  const [loadingFav, setLoadingFav] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // DEBUG: Check token on component mount
  useEffect(() => {
    console.log('🏠 [TENANT-HOME] Component mounted');
    console.log('🏠 [TENANT-HOME] Token in localStorage:', localStorage.getItem('token')?.substring(0, 30) + '...');
    console.log('🏠 [TENANT-HOME] Role in localStorage:', localStorage.getItem('role'));
    console.log('🏠 [TENANT-HOME] User from store:', user);
  }, []);

  useEffect(() => {
    fetchFeaturedListings()
    if (user) {
      fetchUserFavorites()
      fetchRecommendations()
    } else {
      setLoadingRecommendations(false)
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

  const fetchRecommendations = async () => {
    try {
      // CRITICAL: Check if token exists before making request
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('[TenantHome] ❌ Cannot fetch recommendations - No token in localStorage');
        setRecommendations([]);
        setLoadingRecommendations(false);
        return;
      }
      
      console.log('[TenantHome] ✅ Token exists:', token.substring(0, 30) + '...');
      console.log('[TenantHome] Making request with manual Authorization header...');
      
      setLoadingRecommendations(true)
      // Try ML recommendations first, fallback to content-based or hybrid
      console.log('[TenantHome] Fetching ML recommendations...')
      
      // MANUAL HEADER TEST - Force Authorization header
      let response = await api.get('/recommendations?algorithm=ml&limit=6', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('[TenantHome] API Response:', response.data)
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        setRecommendations(response.data.data)
        console.log('[TenantHome] ML Recommendations loaded:', response.data.data.length)
      } else {
        // If no recommendations exist, try to generate them
        console.log('[TenantHome] No recommendations found, generating...')
        try {
          console.log('[TenantHome] Calling /recommendations/generate')
          const genResponse = await api.post('/recommendations/generate', { algorithm: 'ml', limit: 6 })
          console.log('[TenantHome] Generate response:', genResponse.data)
          
          // Fetch again after generation
          console.log('[TenantHome] Fetching recommendations after generation...')
          response = await api.get('/recommendations?algorithm=ml&limit=6')
          console.log('[TenantHome] Fetched after generation:', response.data)
          
          if (response.data.success && response.data.data) {
            setRecommendations(response.data.data)
            console.log('[TenantHome] ML Recommendations generated and loaded:', response.data.data.length)
          } else {
            console.log('[TenantHome] Still no recommendations after generation')
            setRecommendations([])
          }
        } catch (genError) {
          console.error('[TenantHome] Failed to generate recommendations:', genError)
          setRecommendations([])
        }
      }
    } catch (error) {
      console.error('[TenantHome] Failed to fetch recommendations:', error)
      // Fallback to featured listings if recommendations fail
      setRecommendations([])
    } finally {
      setLoadingRecommendations(false)
    }
  }

  const handleRefreshRecommendations = async () => {
    try {
      setLoadingRecommendations(true)
      
      // First, clear old recommendations
      try {
        await api.delete('/recommendations/ml/clear')
        console.log('[TenantHome] Old recommendations cleared')
      } catch (clearError) {
        console.warn('[TenantHome] Could not clear old recommendations:', clearError)
      }
      
      // Build user profile from preferences
      await api.post('/recommendations/ml/build-profile')
      
      // Generate fresh recommendations based on current preferences
      await api.post('/recommendations/generate', { algorithm: 'ml', limit: 6 })
      
      // Fetch the new recommendations
      await fetchRecommendations()
    } catch (error) {
      console.error('[TenantHome] Failed to refresh recommendations:', error)
    } finally {
      setLoadingRecommendations(false)
    }
  }

  const handleFavoriteToggle = async (listingId, e) => {
    e.stopPropagation()
    
    if (!user) {
      toast.warning('Please log in to add favorites')
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
      toast.error(`Failed to update favorite: ${error.response?.data?.error || error.message}`)
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
          <div className="flex items-center gap-3">
            <div className="text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">AI Powered</div>
            {user && recommendations.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefreshRecommendations}
                disabled={loadingRecommendations}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {loadingRecommendations ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <TrendingUp size={14} />
                )}
                Refresh
              </motion.button>
            )}
          </div>
        </div>

        {/* Recommendation Cards Grid */}
        {loadingRecommendations ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-primary-600" />
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendations.slice(0, 6).map((property, index) => {
              // Use similarity_score or confidence_score if available, otherwise calculate from matching features
              const rawScore = property.similarity_score || property.confidence_score || 0
              const matchScore = rawScore > 0 
                ? Math.round(rawScore * 100) 
                : (property.matching_features?.matchPercentage || 75) // Fallback to matchPercentage or default
              
              const getBadgeConfig = (score) => {
                if (score >= 90) return { gradient: 'from-blue-600 to-indigo-600', icon: <Sparkles size={12} />, text: 'Top Match' }
                if (score >= 80) return { gradient: 'from-indigo-600 to-purple-600', icon: <TrendingUp size={12} />, text: 'Popular' }
                return { gradient: 'from-purple-600 to-pink-600', icon: <Zap size={12} />, text: 'New' }
              }
              
              const badge = getBadgeConfig(matchScore)
              const imageUrl = getListingImageUrl(property)
              
              // Debug logging
              if (!imageUrl || imageUrl === '/placeholder.svg') {
                console.warn('[TenantHome Recommendations] Missing or placeholder image for property:', {
                  id: property.id,
                  title: property.title,
                  images: property.images,
                  imageUrl
                })
              }

              return (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + (index * 0.05) }}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/tenant/listing/${property.id}`)}
                  className="bg-white rounded-lg overflow-hidden border border-blue-200 hover:border-blue-300 transition-all duration-300 cursor-pointer group relative"
                >
                  {/* Recommendation Badge */}
                  <div className={`absolute top-3 left-3 bg-gradient-to-r ${badge.gradient} text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 z-10 shadow-lg`}>
                    {badge.icon}
                    <span>{badge.text}</span>
                  </div>

                  {/* Image Container */}
                  <div className="relative overflow-hidden h-48 bg-gray-200">
                    <img
                      src={imageUrl}
                      alt={property.title || property.address}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        console.error('[TenantHome Recommendations] Image failed to load:', {
                          url: imageUrl,
                          propertyId: property.id,
                          error: e.message
                        })
                        e.target.src = '/placeholder.svg'
                      }}
                    />
                    
                    {/* Favorite Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleFavoriteToggle(property.id, e)}
                      disabled={loadingFav === property.id}
                      className="absolute top-3 right-3 p-2 bg-white/95 hover:bg-white rounded-full shadow flex items-center justify-center z-10 transition-all"
                    >
                      {loadingFav === property.id ? (
                        <Loader2 size={16} className="animate-spin text-gray-400" />
                      ) : (
                        <Heart 
                          size={16} 
                          className={favorites.has(property.id) ? "text-red-500 fill-red-500" : "text-gray-400"} 
                        />
                      )}
                    </motion.button>

                    {/* Match Score */}
                    <div className="absolute bottom-3 right-3 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-semibold border border-green-200">
                      {matchScore}% Match
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-text mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors text-sm">
                      {property.title || property.address}
                    </h3>
                    <p className="text-gray-500 text-xs mb-4 flex items-center gap-1">
                      <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                      {property.city}
                    </p>

                    {/* Why Recommended */}
                    {property.explanation && (
                      <div className="mb-4 p-2 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs text-blue-700 font-medium mb-1">Why this matches:</p>
                        <p className="text-xs text-gray-600 line-clamp-2">{property.explanation}</p>
                      </div>
                    )}

                    {/* Features Row */}
                    <div className="flex gap-2 mb-4 text-xs">
                      {property.bedrooms && (
                        <span className="flex items-center gap-1 text-gray-600">
                          <Bed size={12} className="text-gray-400" />
                          {property.bedrooms}
                        </span>
                      )}
                      {property.bathrooms && (
                        <span className="flex items-center gap-1 text-gray-600">
                          <Bath size={12} className="text-gray-400" />
                          {property.bathrooms}
                        </span>
                      )}
                      {property.area && (
                        <span className="flex items-center gap-1 text-gray-600">
                          <Ruler size={12} className="text-gray-400" />
                          {property.area} sq.ft
                        </span>
                      )}
                    </div>

                    {/* Price and Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-lg font-bold text-primary-600">
                          Rs. {property.rent_amount?.toLocaleString() || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-400">/month</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/tenant/listing/${property.id}`)
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : user ? (
          <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <Sparkles size={48} className="mx-auto mb-4 text-blue-400" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Recommendations Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start browsing properties to help our AI learn your preferences and provide personalized recommendations.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/tenant/browse')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse Properties
            </motion.button>
          </div>
        ) : (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <Shield size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Login for Personalized Recommendations</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Sign in to get AI-powered property recommendations tailored to your preferences.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Login Now
            </motion.button>
          </div>
        )}
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
                  <div className="relative overflow-hidden h-48 bg-gray-200">
                    <img
                      src={getListingImageUrl(listing)}
                      alt={listing.title || listing.address}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => handleViewProperty(listing.id)}
                      onError={(e) => {
                        console.error('[TenantHome Featured] Image failed to load:', {
                          url: getListingImageUrl(listing),
                          listingId: listing.id,
                          images: listing.images,
                          error: e.message
                        })
                        e.target.src = '/placeholder.svg'
                      }}
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
