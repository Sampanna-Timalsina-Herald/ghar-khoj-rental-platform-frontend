import React, { useState, useEffect } from 'react'
import { Download, Filter, Calendar, TrendingUp, Users, Home, MessageSquare } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'

const monthlyData = [
  { month: 'January', activeUsers: 450, newListings: 120, conversations: 80 },
  { month: 'February', activeUsers: 520, newListings: 140, conversations: 95 },
  { month: 'March', activeUsers: 680, newListings: 180, conversations: 130 },
  { month: 'April', activeUsers: 780, newListings: 200, conversations: 160 },
  { month: 'May', activeUsers: 920, newListings: 250, conversations: 190 },
  { month: 'June', activeUsers: 1050, newListings: 300, conversations: 240 },
]

const userActivityData = [
  { date: '1', signups: 45, active: 320, inactive: 80 },
  { date: '2', signups: 52, active: 340, inactive: 90 },
  { date: '3', signups: 48, active: 360, inactive: 100 },
  { date: '4', signups: 61, active: 410, inactive: 110 },
  { date: '5', signups: 55, active: 420, inactive: 105 },
  { date: '6', signups: 67, active: 450, inactive: 120 },
  { date: '7', signups: 72, active: 480, inactive: 130 },
]

const reportTypes = [
  { id: 'users', title: 'User Report', description: 'User activity, signups, and engagement', count: 1050 },
  { id: 'listings', title: 'Listings Report', description: 'Listings by category, status, and location', count: 520 },
  { id: 'conversations', title: 'Conversations Report', description: 'Chat activity and user interactions', count: 410 },
  { id: 'revenue', title: 'Revenue Report', description: 'Platform revenue and transactions', count: 15200 },
]

const ReportCard = ({ title, description, count, icon, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-lg p-6 border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-blue-100 rounded-lg">{icon}</div>
      <span className="text-2xl font-bold text-gray-900">{count.toLocaleString()}</span>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
)

const AdminReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('6months')
  const [selectedReport, setSelectedReport] = useState(null)
  const [exportFormat, setExportFormat] = useState('pdf')

  const handleExport = () => {
    console.log(`Exporting report as ${exportFormat}`)
    // Implement export logic
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-2">Comprehensive platform analytics and reporting tools</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
          >
            <Download size={20} />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-gray-600" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="1week">Last Week</option>
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="pdf">PDF Format</option>
              <option value="csv">CSV Format</option>
              <option value="excel">Excel Format</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <ReportCard
            key={report.id}
            title={report.title}
            description={report.description}
            count={report.count}
            icon={
              report.id === 'users' ? <Users size={24} className="text-blue-600" /> :
              report.id === 'listings' ? <Home size={24} className="text-blue-600" /> :
              report.id === 'conversations' ? <MessageSquare size={24} className="text-blue-600" /> :
              <TrendingUp size={24} className="text-blue-600" />
            }
            onClick={() => setSelectedReport(report.id)}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {/* Monthly Trend */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Monthly Trends</h2>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorListings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend />
              <Area type="monotone" dataKey="activeUsers" stroke="#3B82F6" fillOpacity={1} fill="url(#colorUsers)" />
              <Area type="monotone" dataKey="newListings" stroke="#10B981" fillOpacity={1} fill="url(#colorListings)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User Activity */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">User Activity Distribution</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={userActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="signups" stackId="a" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="active" stackId="a" fill="#10B981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="inactive" stackId="a" fill="#EF4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-500" />
              Conversion Rate
            </h3>
            <p className="text-3xl font-bold text-gray-900">24.5%</p>
            <p className="text-green-600 text-sm mt-2">↑ 3.2% from last month</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users size={20} className="text-green-500" />
              Avg Session Time
            </h3>
            <p className="text-3xl font-bold text-gray-900">4m 32s</p>
            <p className="text-green-600 text-sm mt-2">↑ 45s from last month</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Home size={20} className="text-purple-500" />
              Bounce Rate
            </h3>
            <p className="text-3xl font-bold text-gray-900">32.8%</p>
            <p className="text-red-600 text-sm mt-2">↑ 2.1% from last month</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminReports
