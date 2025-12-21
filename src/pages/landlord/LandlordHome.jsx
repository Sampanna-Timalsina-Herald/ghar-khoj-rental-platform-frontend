import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../../api/axios'
import { Home, Eye, MessageSquare, TrendingUp, Loader2, MapPin, Bed, Bath } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const StatCard = ({ title, value, icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-text mt-2">{value || 0}</p>
      </div>
      <div className={`p-4 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  </motion.div>
)

const LandlordHome = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    activeListings: 0,
    totalViews: 0,
    unreadMessages: 0,
    totalInquiries: 0,
  })
  const [recentListings, setRecentListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
      const [statsRes, listingsRes] = await Promise.all([
        api.get('/listings').catch(() => ({ data: { data: [] } })),
        api.get('/listings').catch(() => ({ data: { data: [] } })),
      ])

      const allListings = listingsRes.data.data || [];
      const myListings = allListings.filter(listing => listing.landlord_id === userId);
      
      // Calculate stats from listings
      const calculatedStats = {
        activeListings: myListings.filter(l => l.status === 'active').length,
        totalViews: myListings.reduce((sum, l) => sum + (l.views || 0), 0),
        unreadMessages: 0, // TODO: Implement message count
        totalInquiries: 0, // TODO: Implement inquiry count
      };
      
      setStats(calculatedStats);
      setRecentListings(myListings.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
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
      >
        <h1 className="text-3xl font-bold text-text">Landlord Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your properties and inquiries</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Listings"
          value={stats.activeListings}
          icon={<Home size={24} className="text-white" />}
          color="bg-primary-600"
          delay={0.1}
        />
        <StatCard
          title="Total Views"
          value={stats.totalViews}
          icon={<Eye size={24} className="text-white" />}
          color="bg-blue-500"
          delay={0.2}
        />
        <StatCard
          title="Unread Messages"
          value={stats.unreadMessages}
          icon={<MessageSquare size={24} className="text-white" />}
          color="bg-green-500"
          delay={0.3}
        />
        <StatCard
          title="Total Inquiries"
          value={stats.totalInquiries}
          icon={<TrendingUp size={24} className="text-white" />}
          color="bg-purple-500"
          delay={0.4}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text">Recent Listings</h2>
          <button
            onClick={() => navigate('/landlord/listings')}
            className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
          >
            View All →
          </button>
        </div>
        <div className="space-y-4">
          {recentListings.length > 0 ? (
            recentListings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                onClick={() => navigate(`/landlord/listings`)}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors group"
              >
                <div className="flex-1">
                  <p className="font-semibold text-text group-hover:text-primary-600 transition-colors">
                    {listing.title || listing.address}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {listing.city || listing.address || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bed size={14} />
                      {listing.bedrooms || 0} Beds
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath size={14} />
                      {listing.bathrooms || 0} Baths
                    </span>
                  </div>
                  <p className="text-lg font-bold text-primary-600 mt-2">
                    Rs. {(listing.rent_amount || listing.price || 0).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-xs font-semibold ${
                    listing.status === 'active' || listing.is_verified
                      ? 'bg-green-100 text-green-700'
                      : listing.status === 'inactive'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {listing.status || 'Pending'}
                </span>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <Home size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-4">No listings yet</p>
              <button
                onClick={() => navigate('/landlord/listings/create')}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
              >
                Create Your First Listing
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default LandlordHome
