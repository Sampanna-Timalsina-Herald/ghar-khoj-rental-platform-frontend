import React,{ useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { Search, Heart, MapPin, Bed, Bath, Ruler } from 'lucide-react'

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
      const response = await api.get('/api/listings?limit=6&sort=trending')
      setFeaturedListings(response.data.data)
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
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Find Your Perfect Home</h1>
        <p className="text-primary-100 mb-6">Search through thousands of rental listings</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by location..."
            className="flex-1 px-4 py-3 rounded-lg text-text outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-accent text-text px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all font-semibold flex items-center gap-2"
          >
            <Search size={20} />
            Search
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text">Trending Properties</h2>
            <p className="text-gray-600">Most viewed listings in your area</p>
          </div>
          <button
            onClick={() => navigate('/tenant/browse')}
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredListings.map((listing) => (
            <div key={listing.id} className="card overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
              <div className="relative">
                <img
                  src={listing.images?.[0] || '/placeholder.svg'}
                  alt={listing.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                  <Heart size={20} className="text-red-500" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-text mb-2">{listing.title}</h3>
              <p className="text-gray-600 text-sm mb-3 flex items-center gap-1">
                <MapPin size={16} />
                {listing.location}
              </p>

              <div className="flex gap-4 mb-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Bed size={16} />
                  {listing.bedrooms} Beds
                </span>
                <span className="flex items-center gap-1">
                  <Bath size={16} />
                  {listing.bathrooms} Baths
                </span>
                <span className="flex items-center gap-1">
                  <Ruler size={16} />
                  {listing.area} sqft
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <p className="text-2xl font-bold text-primary-600">
                  Rs. {listing.price.toLocaleString()}
                </p>
                <button className="btn-primary text-sm">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TenantHome
