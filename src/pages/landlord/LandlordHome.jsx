import React from 'react'
import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Home, Eye, MessageSquare, TrendingUp } from 'lucide-react'

const StatCard = ({ title, value, icon, color }) => (
  <div className="card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-text mt-2">{value || 0}</p>
      </div>
      <div className={`p-4 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  </div>
)

const LandlordHome = () => {
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
      const [statsRes, listingsRes] = await Promise.all([
        api.get('/api/landlord/statistics'),
        api.get('/api/listings?limit=5'),
      ])

      setStats(statsRes.data.data)
      setRecentListings(listingsRes.data.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text">Landlord Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your properties and inquiries</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Listings"
          value={stats.activeListings}
          icon={<Home size={24} className="text-white" />}
          color="bg-primary-600"
        />
        <StatCard
          title="Total Views"
          value={stats.totalViews}
          icon={<Eye size={24} className="text-white" />}
          color="bg-secondary"
        />
        <StatCard
          title="Unread Messages"
          value={stats.unreadMessages}
          icon={<MessageSquare size={24} className="text-white" />}
          color="bg-accent"
        />
        <StatCard
          title="Total Inquiries"
          value={stats.totalInquiries}
          icon={<TrendingUp size={24} className="text-white" />}
          color="bg-green-500"
        />
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-text mb-4">Recent Listings</h2>
        <div className="space-y-4">
          {recentListings.length > 0 ? (
            recentListings.map((listing) => (
              <div
                key={listing.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-text">{listing.title}</p>
                  <p className="text-sm text-gray-600">Rs. {listing.price.toLocaleString()}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    listing.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : listing.status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {listing.status}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center py-8">No listings yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default LandlordHome
