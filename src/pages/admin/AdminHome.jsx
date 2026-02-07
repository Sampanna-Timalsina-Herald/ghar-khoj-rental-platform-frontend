import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { Users, Home, AlertCircle, TrendingUp, ArrowUp, ArrowDown, MessageSquare, Eye, Loader2, RefreshCw } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

const StatCard = ({ title, value, icon, color, trend, trendValue }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <div className="flex items-end gap-2 mt-2">
          <p className="text-3xl font-bold text-gray-900">{value || 0}</p>
          {trendValue && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              {trendValue}%
            </div>
          )}
        </div>
      </div>
      <div className={`p-4 rounded-lg ${color} text-white`}>
        {icon}
      </div>
    </div>
  </div>
)

const QuickActionButton = ({ label, icon, color, onClick }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault()
      onClick?.()
    }}
    className={`p-4 rounded-lg font-medium text-white transition-all hover:shadow-lg hover:scale-105 ${color}`}
  >
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white bg-opacity-20 rounded-lg">
        {icon}
      </div>
      <span>{label}</span>
    </div>
  </button>
)

const AdminHome = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    pendingListings: 0,
    totalConversations: 0,
    totalBookings: 0,
    totalRevenue: 0,
  })
  const [chartData, setChartData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    fetchAllData()
    
    // Set up real-time polling every 30 seconds
    const interval = setInterval(() => {
      fetchAllData()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [statsResponse, chartResponse, categoryResponse] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/analytics/trends?months=6'),
        api.get('/admin/analytics/categories')
      ])

      // Update statistics
      if (statsResponse.data?.success && statsResponse.data.data) {
        setStats(statsResponse.data.data)
      }

      // Update chart data (monthly trends)
      if (chartResponse.data?.success && chartResponse.data.data) {
        setChartData(chartResponse.data.data)
      }

      // Update category data
      if (categoryResponse.data?.success && categoryResponse.data.data) {
        // Map the data to use percentage if available
        setCategoryData(categoryResponse.data.data.map(cat => ({
          name: cat.name,
          value: cat.percentage || cat.value
        })))
      }

      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
      // Only show error in console - don't fallback to mock data
      // This ensures we always show real data or nothing
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's your platform overview.
            <span className="ml-2 text-xs text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          </p>
        </div>
        <button
          onClick={fetchAllData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading && chartData.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-blue-500" size={48} />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={<Users size={24} />}
              color="bg-blue-500"
              trend="up"
              trendValue={12}
            />
            <StatCard
              title="Total Listings"
              value={stats.totalListings}
              icon={<Home size={24} />}
              color="bg-green-500"
              trend="up"
              trendValue={8}
            />
            <StatCard
              title="Pending Approval"
              value={stats.pendingListings}
              icon={<AlertCircle size={24} />}
              color="bg-amber-500"
              trend="down"
              trendValue={3}
            />
            <StatCard
              title="Active Conversations"
              value={stats.totalConversations}
              icon={<MessageSquare size={24} />}
              color="bg-purple-500"
              trend="up"
              trendValue={15}
            />
          </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionButton
            label="Review Listings"
            icon={<Eye size={20} />}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            onClick={() => navigate('/admin/listings')}
          />
          <QuickActionButton
            label="Manage Users"
            icon={<Users size={20} />}
            color="bg-gradient-to-r from-green-500 to-green-600"
            onClick={() => navigate('/admin/users')}
          />
          <QuickActionButton
            label="View Reports"
            icon={<TrendingUp size={20} />}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            onClick={() => navigate('/admin/reports')}
          />
          <QuickActionButton
            label="System Settings"
            icon={<AlertCircle size={20} />}
            color="bg-gradient-to-r from-orange-500 to-orange-600"
            onClick={() => navigate('/admin/settings')}
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart - Growth Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Growth Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
              <Line type="monotone" dataKey="listings" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
              <Line type="monotone" dataKey="conversations" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Listing Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart - Monthly Comparison */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Monthly Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Bar dataKey="users" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="listings" fill="#10B981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="conversations" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
        </>
      )}
    </div>
  )
}

export default AdminHome
