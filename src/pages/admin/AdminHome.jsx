import React, { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Users, Home, AlertCircle, TrendingUp } from 'lucide-react'

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

const AdminHome = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    pendingListings: 0,
    totalConversations: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('admin/analytics')
        setStats(response.data.data)
      } catch (error) {
        console.error('Failed to fetch statistics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your platform overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users size={24} className="text-white" />}
          color="bg-primary-600"
        />
        <StatCard
          title="Total Listings"
          value={stats.totalListings}
          icon={<Home size={24} className="text-white" />}
          color="bg-secondary"
        />
        <StatCard
          title="Pending Approval"
          value={stats.pendingListings}
          icon={<AlertCircle size={24} className="text-white" />}
          color="bg-accent"
        />
        <StatCard
          title="Conversations"
          value={stats.totalConversations}
          icon={<TrendingUp size={24} className="text-white" />}
          color="bg-green-500"
        />
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-text mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium">
            Review Pending Listings
          </button>
          <button className="p-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium">
            Manage Users
          </button>
          <button className="p-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium">
            View Reports
          </button>
          <button className="p-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium">
            System Analytics
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminHome
