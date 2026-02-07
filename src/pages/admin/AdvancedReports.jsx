/**
 * Advanced Analytics & Reports Dashboard
 * Comprehensive analytics page with real-time data visualization
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Users, Home, DollarSign, MapPin, 
  Calendar, Activity, Download, RefreshCw, BarChart3, PieChart as PieChartIcon,
  FileText, Eye, Filter, Search
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer
} from 'recharts';
import api from '../../api/axios';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const AdvancedReports = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState(6);

  useEffect(() => {
    fetchDashboardData();

    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchDashboardData();
      }, 60000); // Refresh every minute
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, selectedTimeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/analytics/dashboard');
      if (response.data.success) {
        setDashboardData(response.data.data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await api.get(`/admin/analytics/export?format=${format}`, {
        responseType: format === 'csv' ? 'blob' : 'json'
      });

      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `analytics-report-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        console.log('JSON Report:', response.data);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, prefix = '' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <div className="flex items-end gap-2 mt-2">
            <p className="text-3xl font-bold text-gray-900">
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {trendValue && (
              <div className={`flex items-center gap-1 text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {trendValue}%
              </div>
            )}
          </div>
        </div>
        <div className={`p-4 rounded-lg ${color} text-white`}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { overallStats, monthlyTrends, categoryDistribution, listingStats, topCities, revenueStats, bookingStats } = dashboardData || {};

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive platform insights and performance metrics
            <span className="ml-2 text-xs text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
              autoRefresh
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <RefreshCw size={18} className={autoRefresh ? 'animate-spin' : ''} />
            {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
          </button>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 font-semibold"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-semibold"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 font-semibold"
          >
            <FileText size={18} />
            Export JSON
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={overallStats.total_users}
            icon={Users}
            color="bg-blue-500"
            trend="up"
            trendValue={12}
          />
          <StatCard
            title="Active Listings"
            value={overallStats.active_listings}
            icon={Home}
            color="bg-green-500"
            trend="up"
            trendValue={8}
          />
          <StatCard
            title="Total Revenue"
            value={overallStats.total_revenue}
            icon={DollarSign}
            color="bg-purple-500"
            prefix="NPR "
            trend="up"
            trendValue={15}
          />
          <StatCard
            title="Total Bookings"
            value={overallStats.total_bookings}
            icon={Calendar}
            color="bg-orange-500"
            trend="up"
            trendValue={10}
          />
        </div>
      )}

      {/* Additional Stats */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Pending Listings"
            value={overallStats.pending_listings}
            icon={Eye}
            color="bg-amber-500"
          />
          <StatCard
            title="Active Conversations"
            value={overallStats.total_conversations}
            icon={Activity}
            color="bg-pink-500"
          />
          <StatCard
            title="Cities Covered"
            value={overallStats.cities_count}
            icon={MapPin}
            color="bg-teal-500"
          />
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        {monthlyTrends && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Monthly Growth Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} name="Users" />
                <Line type="monotone" dataKey="listings" stroke="#10B981" strokeWidth={2} name="Listings" />
                <Line type="monotone" dataKey="conversations" stroke="#8B5CF6" strokeWidth={2} name="Conversations" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category Distribution */}
        {categoryDistribution && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Listing Categories</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Revenue Chart */}
      {monthlyTrends && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} name="Revenue (NPR)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Cities */}
      {topCities && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Top Cities by Listings</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCities}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="city" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="listing_count" fill="#3B82F6" name="Listings" radius={[8, 8, 0, 0]} />
              <Bar dataKey="landlord_count" fill="#10B981" name="Landlords" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Statistics Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listing Stats */}
        {listingStats && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Listing Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Average Rent</span>
                <span className="font-bold text-gray-900">NPR {Number(listingStats.avg_rent).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Min - Max Rent</span>
                <span className="font-bold text-gray-900">
                  NPR {Number(listingStats.min_rent).toLocaleString()} - {Number(listingStats.max_rent).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Total Landlords</span>
                <span className="font-bold text-gray-900">{listingStats.landlords_count}</span>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Stats */}
        {revenueStats && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-green-600 font-medium">Paid</span>
                <span className="font-bold text-green-900">NPR {Number(revenueStats.total_paid).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-yellow-600 font-medium">Pending</span>
                <span className="font-bold text-yellow-900">NPR {Number(revenueStats.total_pending).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-red-600 font-medium">Overdue</span>
                <span className="font-bold text-red-900">NPR {Number(revenueStats.total_overdue).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedReports;
