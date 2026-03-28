/**
 * Comprehensive Admin Analytics Dashboard
 * Complete reporting system with all analytics features
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Users, Home, DollarSign, 
  Calendar, Activity, Download, RefreshCw, BarChart3, PieChart as PieChartIcon,
  FileText, Eye, Filter, Search, Building2, Percent, Clock, Target,
  AlertCircle, CheckCircle, XCircle, Award
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter
} from 'recharts';
import api from '../../api/axios';
import { toast } from 'sonner';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

const ComprehensiveAnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedPropertyType, setSelectedPropertyType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [dateRange, setDateRange] = useState('30'); // days
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Date range options
  const dateRangeOptions = [
    { label: 'All Time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 Days', value: '7' },
    { label: 'Last 15 Days', value: '15' },
    { label: 'Last 30 Days', value: '30' },
    { label: 'This Month', value: 'this_month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'Custom', value: 'custom' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'listings', label: 'Listings', icon: Home },
    { id: 'rental', label: 'Rental Activity', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'advanced', label: 'Advanced', icon: Target }
  ];

  // Nepal cities list - Priority cities first
  const nepalCities = [
    'Kathmandu',
    'Lalitpur',
    'Bhaktapur'
  ];

  // Get unique cities combining database cities and static list
  const getAvailableCities = () => {
    const dbCities = data?.locations?.by_city?.map(c => c.city) || [];
    const allCities = [...new Set([...nepalCities, ...dbCities])];
    // Sort to keep priority cities (Kathmandu, Lalitpur, Bhaktapur) at top
    return allCities.sort((a, b) => {
      const priority = ['Kathmandu', 'Lalitpur', 'Bhaktapur'];
      const aIndex = priority.indexOf(a);
      const bIndex = priority.indexOf(b);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.localeCompare(b);
    });
  };

  useEffect(() => {
    fetchComprehensiveData();
  }, [dateRange, selectedCity, selectedPropertyType, selectedStatus, selectedRole, selectedPaymentStatus, customStartDate, customEndDate]);

  const fetchComprehensiveData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Date range handling
      if (dateRange === 'all') {
        // Don't add any date filters - fetch all data
      } else if (dateRange === 'custom' && customStartDate && customEndDate) {
        params.append('startDate', new Date(customStartDate).toISOString());
        params.append('endDate', new Date(customEndDate).toISOString());
      } else if (dateRange && !isNaN(dateRange)) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(dateRange));
        params.append('startDate', startDate.toISOString());
        params.append('endDate', endDate.toISOString());
      } else if (dateRange === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        params.append('startDate', today.toISOString());
        params.append('endDate', new Date().toISOString());
      } else if (dateRange === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);
        params.append('startDate', yesterday.toISOString());
        params.append('endDate', yesterdayEnd.toISOString());
      }

      // Other filters
      if (selectedCity !== 'all') params.append('city', selectedCity);
      if (selectedPropertyType !== 'all') params.append('propertyType', selectedPropertyType);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedRole !== 'all') params.append('role', selectedRole);
      if (selectedPaymentStatus !== 'all') params.append('paymentStatus', selectedPaymentStatus);

      const response = await api.get(`/admin/analytics/comprehensive?${params.toString()}`);
      
      if (response.data.success) {
        setData(response.data.data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format, reportType = 'comprehensive') => {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      params.append('reportType', reportType);
      
      // Date range
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        params.append('startDate', new Date(customStartDate).toISOString());
        params.append('endDate', new Date(customEndDate).toISOString());
      } else if (dateRange && !isNaN(dateRange)) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(dateRange));
        params.append('startDate', startDate.toISOString());
        params.append('endDate', endDate.toISOString());
      }

      // Other filters
      if (selectedCity !== 'all') params.append('city', selectedCity);
      if (selectedPropertyType !== 'all') params.append('propertyType', selectedPropertyType);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedRole !== 'all') params.append('role', selectedRole);
      if (selectedPaymentStatus !== 'all') params.append('paymentStatus', selectedPaymentStatus);

      const response = await api.get(`/admin/analytics/export?${params.toString()}`, {
        responseType: format === 'json' ? 'json' : 'blob'
      });

      if (format === 'json') {
        const jsonStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `gharkhoj-${reportType}-${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else if (format === 'csv' || format === 'pdf') {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `gharkhoj-${reportType}-${Date.now()}.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report. Please try again.');
    }
  };

  // ==================== COMPONENTS ====================

  const StatCard = ({ title, value, icon: Icon, color = 'blue', trend, trendValue, prefix = '', suffix = '' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg bg-${color}-50`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <p className="text-gray-600 text-sm font-medium">{title}</p>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-gray-900">
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </p>
            {trendValue !== undefined && (
              <div className={`flex items-center gap-1 text-sm font-semibold mb-1 ${
                trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {trend === 'up' ? <TrendingUp size={14} /> : trend === 'down' ? <TrendingDown size={14} /> : null}
                {Math.abs(trendValue)}%
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const SectionHeader = ({ title, subtitle, action }) => (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );

  // ==================== TAB CONTENT ====================

  const OverviewTab = () => {
    if (!data?.listing_overview || !data?.user_stats) return null;

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Listings"
            value={data.listing_overview.total_listings}
            icon={Home}
            color="blue"
          />
          <StatCard
            title="Active Listings"
            value={data.listing_overview.active_listings}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Total Users"
            value={data.user_stats?.overall?.total_users || 0}
            icon={Users}
            color="purple"
          />
          <StatCard
            title="Total Revenue"
            value={parseFloat(data.financial_reports?.overall?.total_revenue || 0).toFixed(0)}
            icon={DollarSign}
            color="yellow"
            prefix="Rs. "
          />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Rented Properties"
            value={data.listing_overview.rented_listings}
            icon={Activity}
            color="green"
          />
          <StatCard
            title="Vacancy Rate"
            value={parseFloat(data.vacancy_rate?.overall?.overall_vacancy_rate || 0).toFixed(1)}
            icon={Percent}
            color="orange"
            suffix="%"
          />
          <StatCard
            title="Verified Listings"
            value={data.listing_overview.verified_listings}
            icon={Award}
            color="blue"
          />
          <StatCard
            title="New Users (30d)"
            value={data.user_stats?.last_30_days?.new_users || 0}
            icon={Users}
            color="purple"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Type Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Type Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.property_types?.distribution || []}
                  dataKey="count"
                  nameKey="property_type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.property_type}: ${entry.percentage}%`}
                >
                  {(data.property_types?.distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* City Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Listings by City</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.locations?.by_city || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="city" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3B82F6" name="Total Listings" />
                <Bar dataKey="rented_count" fill="#10B981" name="Rented" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const ListingsTab = () => {
    if (!data?.listing_overview) return null;

    return (
      <div className="space-y-6">
        <SectionHeader 
          title="Listing Analytics" 
          subtitle="Comprehensive listing statistics and trends"
        />

        {/* Listing Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard title="Total" value={data.listing_overview.total_listings} icon={Home} color="blue" />
          <StatCard title="Active" value={data.listing_overview.active_listings} icon={CheckCircle} color="green" />
          <StatCard title="Inactive" value={data.listing_overview.inactive_listings} icon={XCircle} color="gray" />
          <StatCard title="Rented" value={data.listing_overview.rented_listings} icon={Activity} color="purple" />
          <StatCard title="Expired" value={data.listing_overview.expired_listings} icon={Clock} color="orange" />
        </div>

        {/* Verification Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Verified Listings" 
            value={data.listing_overview.verified_listings} 
            icon={Award} 
            color="green"
          />
          <StatCard 
            title="Unverified Listings" 
            value={data.listing_overview.unverified_listings} 
            icon={AlertCircle} 
            color="yellow"
          />
          <StatCard 
            title="Reported Listings" 
            value={data.listing_overview.reported_listings} 
            icon={AlertCircle} 
            color="red"
          />
        </div>

        {/* Property Type Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Types Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Property Type</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Count</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Percentage</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Avg Rent</th>
                </tr>
              </thead>
              <tbody>
                {(data.property_types?.distribution || []).map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 capitalize">{item.property_type}</td>
                    <td className="py-3 px-4 text-right font-semibold">{item.count}</td>
                    <td className="py-3 px-4 text-right">{item.percentage}%</td>
                    <td className="py-3 px-4 text-right">Rs. {parseFloat(item.avg_rent).toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Price Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rent Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.price_reports?.price_ranges || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="price_range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3B82F6" name="Properties" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const RentalActivityTab = () => {
    if (!data?.rental_activity) return null;

    return (
      <div className="space-y-6">
        <SectionHeader 
          title="Rental Activity" 
          subtitle="Rented properties and booking statistics"
        />

        {/* Rental Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Rented (Last 15 Days)" 
            value={data.rental_activity.last_15_days} 
            icon={Activity} 
            color="green"
          />
          <StatCard 
            title="Vacancy Rate" 
            value={parseFloat(data.vacancy_rate?.overall?.overall_vacancy_rate || 0).toFixed(1)}
            icon={Percent} 
            color="orange"
            suffix="%"
          />
          <StatCard 
            title="Avg Time to Rent" 
            value={parseFloat(data.time_to_rent?.overall?.overall_avg_days || 0).toFixed(0)}
            icon={Clock} 
            color="blue"
            suffix=" days"
          />
        </div>

        {/* Booking Stats */}
        {data.rental_activity.bookings && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              title="Total Bookings" 
              value={data.rental_activity.bookings.total_bookings} 
              icon={FileText} 
              color="blue"
            />
            <StatCard 
              title="Confirmed" 
              value={data.rental_activity.bookings.confirmed} 
              icon={CheckCircle} 
              color="green"
            />
            <StatCard 
              title="Pending" 
              value={data.rental_activity.bookings.pending} 
              icon={Clock} 
              color="yellow"
            />
            <StatCard 
              title="Cancelled" 
              value={data.rental_activity.bookings.cancelled} 
              icon={XCircle} 
              color="red"
            />
          </div>
        )}

        {/* Rentals by Property Type */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Rentals by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.rental_activity.this_month || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="property_type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rented_count" fill="#10B981" name="Rented This Month" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Vacancy Analysis Table */}
        {data.vacancy_rate?.by_location_and_type && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vacancy Rate by Location & Type</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">City</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Property Type</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Available</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Rented</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Vacancy %</th>
                  </tr>
                </thead>
                <tbody>
                  {data.vacancy_rate.by_location_and_type.slice(0, 15).map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{item.city}</td>
                      <td className="py-3 px-4 capitalize">{item.property_type}</td>
                      <td className="py-3 px-4 text-right">{item.total_listings}</td>
                      <td className="py-3 px-4 text-right">{item.available}</td>
                      <td className="py-3 px-4 text-right">{item.rented}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-semibold ${
                          parseFloat(item.vacancy_rate) > 70 ? 'text-red-600' : 
                          parseFloat(item.vacancy_rate) > 40 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {item.vacancy_rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const UsersTab = () => {
    if (!data?.user_stats) return null;

    const stats = data.user_stats.overall;
    const tenantPercent = ((stats.total_tenants / stats.total_users) * 100).toFixed(1);
    const landlordPercent = ((stats.total_landlords / stats.total_users) * 100).toFixed(1);

    return (
      <div className="space-y-6">
        <SectionHeader 
          title="User Analytics" 
          subtitle="Registration, activity, and engagement metrics"
        />

        {/* User Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={stats.total_users} icon={Users} color="blue" />
          <StatCard title="Tenants" value={stats.total_tenants} icon={Users} color="green" />
          <StatCard title="Landlords" value={stats.total_landlords} icon={Building2} color="purple" />
          <StatCard title="Verified Users" value={stats.verified_users} icon={Award} color="yellow" />
        </div>

        {/* User Role Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Tenants', value: stats.total_tenants },
                    { name: 'Landlords', value: stats.total_landlords },
                    { name: 'Admins', value: stats.total_admins }
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  <Cell fill="#3B82F6" />
                  <Cell fill="#10B981" />
                  <Cell fill="#F59E0B" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">New User Registration</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Last 7 Days</span>
                  <span className="font-semibold">{data.user_stats.last_7_days?.new_users || 0} users</span>
                </div>
                <div className="text-sm text-gray-500">
                  Tenants: {data.user_stats.last_7_days?.new_tenants || 0} | 
                  Landlords: {data.user_stats.last_7_days?.new_landlords || 0}
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Last 30 Days</span>
                  <span className="font-semibold">{data.user_stats.last_30_days?.new_users || 0} users</span>
                </div>
                <div className="text-sm text-gray-500">
                  Tenants: {data.user_stats.last_30_days?.new_tenants || 0} | 
                  Landlords: {data.user_stats.last_30_days?.new_landlords || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard 
            title="Active Last 7 Days" 
            value={stats.active_last_7_days} 
            icon={Activity} 
            color="green"
          />
          <StatCard 
            title="Active Last 30 Days" 
            value={stats.active_last_30_days} 
            icon={Activity} 
            color="blue"
          />
        </div>

        {/* Most Active Landlords */}
        {data.user_activity?.most_active_landlords && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Landlords</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Landlord</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Listings</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Active</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Rented</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Views</th>
                  </tr>
                </thead>
                <tbody>
                  {data.user_activity.most_active_landlords.slice(0, 10).map((landlord, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-semibold">{landlord.name}</div>
                          <div className="text-sm text-gray-500">{landlord.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">{landlord.total_listings}</td>
                      <td className="py-3 px-4 text-right">{landlord.active_listings}</td>
                      <td className="py-3 px-4 text-right">{landlord.rented_listings}</td>
                      <td className="py-3 px-4 text-right">{landlord.total_views || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ML Recommendation Stats */}
        {data.user_activity?.ml_recommendation_stats && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ML Recommendation Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {data.user_activity.ml_recommendation_stats.total_recommendations}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Recommendations</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {data.user_activity.ml_recommendation_stats.users_received}
                </div>
                <div className="text-sm text-gray-600 mt-1">Users Reached</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {parseFloat(data.user_activity.ml_recommendation_stats.click_through_rate || 0).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 mt-1">Click-Through Rate</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const FinancialTab = () => {
    if (!data?.financial_reports) return null;

    const stats = data.financial_reports.overall;

    return (
      <div className="space-y-6">
        <SectionHeader 
          title="Financial Reports" 
          subtitle="Revenue, commissions, and transaction analysis"
        />

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard 
            title="Total Revenue" 
            value={parseFloat(stats.total_revenue || 0).toFixed(0)}
            icon={DollarSign} 
            color="green"
            prefix="Rs. "
          />
          <StatCard 
            title="Collected Revenue" 
            value={parseFloat(stats.collected_revenue || 0).toFixed(0)}
            icon={CheckCircle} 
            color="blue"
            prefix="Rs. "
          />
          <StatCard 
            title="Pending Revenue" 
            value={parseFloat(stats.pending_revenue || 0).toFixed(0)}
            icon={Clock} 
            color="yellow"
            prefix="Rs. "
          />
        </div>

        {/* Transaction Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Total Transactions" 
            value={stats.total_transactions}
            icon={FileText} 
            color="blue"
          />
          <StatCard 
            title="Completed" 
            value={stats.completed_transactions}
            icon={CheckCircle} 
            color="green"
          />
          <StatCard 
            title="Avg Commission" 
            value={parseFloat(stats.avg_commission || 0).toFixed(0)}
            icon={DollarSign} 
            color="purple"
            prefix="Rs. "
          />
        </div>

        {/* Periodic Revenue */}
        {data.financial_reports.periodic && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-sm text-gray-600 mb-2">Last 7 Days</h4>
              <div className="text-2xl font-bold text-gray-900">
                Rs. {parseFloat(data.financial_reports.periodic.last_7_days || 0).toFixed(0)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {data.financial_reports.periodic.trans_7_days} transactions
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-sm text-gray-600 mb-2">Last 15 Days</h4>
              <div className="text-2xl font-bold text-gray-900">
                Rs. {parseFloat(data.financial_reports.periodic.last_15_days || 0).toFixed(0)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {data.financial_reports.periodic.trans_15_days} transactions
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-sm text-gray-600 mb-2">Last 30 Days</h4>
              <div className="text-2xl font-bold text-gray-900">
                Rs. {parseFloat(data.financial_reports.periodic.last_30_days || 0).toFixed(0)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {data.financial_reports.periodic.trans_30_days} transactions
              </div>
            </div>
          </div>
        )}

        {/* Revenue by Property Type */}
        {data.financial_reports.by_property_type && data.financial_reports.by_property_type.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Property Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.financial_reports.by_property_type}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="property_type" />
                <YAxis />
                <Tooltip formatter={(value) => `Rs. ${parseFloat(value).toFixed(0)}`} />
                <Legend />
                <Bar dataKey="total_revenue" fill="#10B981" name="Revenue" />
                <Bar dataKey="transaction_count" fill="#3B82F6" name="Transactions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Monthly Trend */}
        {data.financial_reports.monthly_trend && data.financial_reports.monthly_trend.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (Last 12 Months)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.financial_reports.monthly_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })} />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value) => [`Rs. ${parseFloat(value).toFixed(0)}`, 'Revenue']}
                />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Earning Landlords */}
        {data.financial_reports.by_landlord && data.financial_reports.by_landlord.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Revenue Generating Landlords</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Landlord</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Commission</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Transactions</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Rent Collected</th>
                  </tr>
                </thead>
                <tbody>
                  {data.financial_reports.by_landlord.slice(0, 15).map((landlord, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-semibold">{landlord.name}</div>
                          <div className="text-sm text-gray-500">{landlord.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        Rs. {parseFloat(landlord.total_commission || 0).toFixed(0)}
                      </td>
                      <td className="py-3 px-4 text-right">{landlord.transaction_count}</td>
                      <td className="py-3 px-4 text-right">
                        Rs. {parseFloat(landlord.total_rent_collected || 0).toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };



  const AdvancedTab = () => {
    const [viewMode, setViewMode] = useState('analytics'); // 'analytics' or 'properties'
    const [currentPage, setCurrentPage] = useState(1);
    const [propertiesPerPage] = useState(20);
    const [allProperties, setAllProperties] = useState([]);
    const [loadingProperties, setLoadingProperties] = useState(false);

    // Fetch all properties when switching to properties view
    useEffect(() => {
      if (viewMode === 'properties' && allProperties.length === 0) {
        fetchAllProperties();
      }
    }, [viewMode]);

    const fetchAllProperties = async () => {
      try {
        setLoadingProperties(true);
        const params = new URLSearchParams();
        
        // Apply filters
        if (selectedCity !== 'all') params.append('city', selectedCity);
        if (selectedPropertyType !== 'all') params.append('propertyType', selectedPropertyType);
        if (selectedStatus !== 'all') params.append('status', selectedStatus);
        if (dateRange === 'custom' && customStartDate && customEndDate) {
          params.append('startDate', new Date(customStartDate).toISOString());
          params.append('endDate', new Date(customEndDate).toISOString());
        } else if (dateRange && !isNaN(dateRange)) {
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - parseInt(dateRange));
          params.append('startDate', startDate.toISOString());
          params.append('endDate', endDate.toISOString());
        }

        const response = await api.get(`/admin/listings?${params.toString()}`);
        if (response.data.success) {
          setAllProperties(response.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoadingProperties(false);
      }
    };

    // Pagination calculations
    const indexOfLastProperty = currentPage * propertiesPerPage;
    const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
    const currentProperties = allProperties.slice(indexOfFirstProperty, indexOfLastProperty);
    const totalPages = Math.ceil(allProperties.length / propertiesPerPage);

    if (!data?.demand_supply && !data?.price_elasticity) return null;

    return (
      <div className="space-y-6">
        <SectionHeader 
          title="Advanced Analytics" 
          subtitle="Demand-supply analysis, price elasticity, market insights, and property details"
          action={
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('analytics')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  viewMode === 'analytics'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📊 Analytics View
              </button>
              <button
                onClick={() => setViewMode('properties')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  viewMode === 'properties'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🏠 Properties View
              </button>
            </div>
          }
        />

        {viewMode === 'analytics' ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="text-red-600" size={24} />
                  <span className="text-xs font-semibold text-red-700 bg-red-200 px-2 py-1 rounded">HIGH DEMAND</span>
                </div>
                <div className="text-3xl font-bold text-red-900">
                  {data.demand_supply?.filter(d => d.market_status === 'High Demand - Low Supply').length || 0}
                </div>
                <div className="text-sm text-red-700 mt-1">High Demand Zones</div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <TrendingDown className="text-blue-600" size={24} />
                  <span className="text-xs font-semibold text-blue-700 bg-blue-200 px-2 py-1 rounded">LOW DEMAND</span>
                </div>
                <div className="text-3xl font-bold text-blue-900">
                  {data.demand_supply?.filter(d => d.market_status === 'Low Demand - High Supply').length || 0}
                </div>
                <div className="text-sm text-blue-700 mt-1">Oversupply Zones</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="text-green-600" size={24} />
                  <span className="text-xs font-semibold text-green-700 bg-green-200 px-2 py-1 rounded">BALANCED</span>
                </div>
                <div className="text-3xl font-bold text-green-900">
                  {data.demand_supply?.filter(d => d.market_status === 'Balanced Market').length || 0}
                </div>
                <div className="text-sm text-green-700 mt-1">Balanced Markets</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <Target className="text-purple-600" size={24} />
                  <span className="text-xs font-semibold text-purple-700 bg-purple-200 px-2 py-1 rounded">TOTAL</span>
                </div>
                <div className="text-3xl font-bold text-purple-900">
                  {data.demand_supply?.length || 0}
                </div>
                <div className="text-sm text-purple-700 mt-1">Market Segments</div>
              </div>
            </div>

            {/* Demand vs Supply Chart */}
            {data.demand_supply && data.demand_supply.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Demand vs Supply Analysis</h3>
                    <p className="text-sm text-gray-600 mt-1">Market balance across different segments</p>
                  </div>
                </div>

                {/* Top insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-red-600 mt-1" size={20} />
                      <div>
                        <div className="font-semibold text-red-900 mb-1">🔥 High Demand - Low Supply</div>
                        <div className="text-sm text-red-700">
                          Priority zones for new listings. High rental potential with limited competition.
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-blue-600 mt-1" size={20} />
                      <div>
                        <div className="font-semibold text-blue-900 mb-1">⚠️ Low Demand - High Supply</div>
                        <div className="text-sm text-blue-700">
                          Oversaturated markets. Consider competitive pricing or enhanced marketing.
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="text-green-600 mt-1" size={20} />
                      <div>
                        <div className="font-semibold text-green-900 mb-1">✅ Balanced Market</div>
                        <div className="text-sm text-green-700">
                          Healthy equilibrium. Maintain current strategy and monitor trends.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visualization */}
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={data.demand_supply.slice(0, 15)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="city" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                              <p className="font-semibold text-gray-900 mb-2">
                                {data.city || 'All'} - {data.property_type || 'All Types'}
                              </p>
                              <p className="text-sm text-blue-600">Supply: {data.supply}</p>
                              <p className="text-sm text-green-600">Demand: {data.demand}</p>
                              <p className="text-sm text-purple-600">D/S Ratio: {data.demand_supply_ratio?.toFixed(2) || 'N/A'}</p>
                              <p className="text-sm text-gray-700 mt-2">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  data.market_status === 'High Demand - Low Supply' ? 'bg-red-100 text-red-700' :
                                  data.market_status === 'Low Demand - High Supply' ? 'bg-blue-100 text-blue-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {data.market_status}
                                </span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="supply" fill="#3B82F6" name="Supply" />
                    <Bar dataKey="demand" fill="#10B981" name="Demand" />
                  </BarChart>
                </ResponsiveContainer>

                {/* Detailed table */}
                <div className="mt-6 overflow-x-auto">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">📋 Detailed Market Analysis</h4>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">City</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Property Type</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Supply</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Demand</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Searchers</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">D/S Ratio</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Market Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.demand_supply.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50 transition">
                          <td className="py-3 px-4 font-medium">{item.city || 'All Cities'}</td>
                          <td className="py-3 px-4 capitalize">{item.property_type || 'All Types'}</td>
                          <td className="py-3 px-4 text-right font-semibold text-blue-600">{item.supply}</td>
                          <td className="py-3 px-4 text-right font-semibold text-green-600">{item.demand}</td>
                          <td className="py-3 px-4 text-right text-gray-600">{item.unique_searchers || 0}</td>
                          <td className="py-3 px-4 text-right font-bold text-purple-600">
                            {item.demand_supply_ratio ? parseFloat(item.demand_supply_ratio).toFixed(2) : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap inline-flex items-center gap-1 ${
                              item.market_status === 'High Demand - Low Supply' ? 'bg-red-100 text-red-700' :
                              item.market_status === 'Low Demand - High Supply' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {item.market_status === 'High Demand - Low Supply' ? '🔥' :
                               item.market_status === 'Low Demand - High Supply' ? '⚠️' : '✅'}
                              {item.market_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Price Elasticity */}
            {data.price_elasticity && data.price_elasticity.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">💰 Price Elasticity Analysis</h3>
                  <p className="text-gray-600 mt-1">Correlation between pricing and rental velocity</p>
                </div>

                {/* Chart */}
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="avg_price" 
                      name="Avg Price" 
                      label={{ value: 'Average Price (Rs.)', position: 'bottom' }}
                      tickFormatter={(value) => `Rs.${(value/1000).toFixed(0)}k`}
                    />
                    <YAxis 
                      dataKey="avg_days_to_rent" 
                      name="Days to Rent"
                      label={{ value: 'Days to Rent', angle: -90, position: 'left' }}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                              <p className="font-semibold text-gray-900 mb-2 capitalize">
                                {data.type} - {data.city}
                              </p>
                              <p className="text-sm text-gray-700">Avg Price: Rs. {parseFloat(data.avg_price).toFixed(0)}</p>
                              <p className="text-sm text-gray-700">Median Price: Rs. {parseFloat(data.median_price).toFixed(0)}</p>
                              <p className="text-sm text-purple-600 font-semibold">Days to Rent: {parseFloat(data.avg_days_to_rent).toFixed(0)}</p>
                              <p className="text-sm text-gray-600">Rentals: {data.rental_count}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter data={data.price_elasticity} fill="#8B5CF6" />
                  </ScatterChart>
                </ResponsiveContainer>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Property Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">City</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Avg Price</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Median Price</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Avg Days to Rent</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Rentals</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Speed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.price_elasticity.map((item, index) => {
                        const daysToRent = parseFloat(item.avg_days_to_rent);
                        const speed = daysToRent < 15 ? 'Fast' : daysToRent < 30 ? 'Average' : 'Slow';
                        const speedColor = speed === 'Fast' ? 'bg-green-100 text-green-700' : 
                                         speed === 'Average' ? 'bg-yellow-100 text-yellow-700' : 
                                         'bg-red-100 text-red-700';
                        return (
                          <tr key={index} className="border-b hover:bg-gray-50 transition">
                            <td className="py-3 px-4 capitalize font-medium">{item.type}</td>
                            <td className="py-3 px-4">{item.city}</td>
                            <td className="py-3 px-4 text-right">Rs. {parseFloat(item.avg_price).toFixed(0)}</td>
                            <td className="py-3 px-4 text-right">Rs. {parseFloat(item.median_price).toFixed(0)}</td>
                            <td className="py-3 px-4 text-right font-semibold text-purple-600">
                              {daysToRent.toFixed(0)} days
                            </td>
                            <td className="py-3 px-4 text-right">{item.rental_count}</td>
                            <td className="py-3 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${speedColor}`}>
                                {speed === 'Fast' ? '⚡' : speed === 'Average' ? '📊' : '🐌'} {speed}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <p className="text-sm text-purple-900">
                    <strong>💡 Key Insight:</strong> Properties priced below market average (median) typically rent 2-3x faster. 
                    A strategic 5-10% price reduction can significantly decrease vacancy period and attract quality tenants.
                  </p>
                </div>
              </div>
            )}

            {/* Price Trend */}
            {data.price_reports?.monthly_trend && data.price_reports.monthly_trend.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Average Rent Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.price_reports.monthly_trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })} 
                    />
                    <YAxis tickFormatter={(value) => `Rs. ${value}`} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value) => [`Rs. ${parseFloat(value).toFixed(0)}`, 'Avg Rent']}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="avg_rent" stroke="#3B82F6" strokeWidth={2} name="Average Rent" />
                  </LineChart>
                </ResponsiveContainer>
                {data.price_reports.comparisons && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-sm text-gray-600">Last 15 Days</div>
                      <div className="text-xl font-bold text-gray-900">
                        Rs. {parseFloat(data.price_reports.comparisons.last_15_days).toFixed(0)}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-sm text-gray-600">Last 30 Days</div>
                      <div className="text-xl font-bold text-gray-900">
                        Rs. {parseFloat(data.price_reports.comparisons.last_30_days).toFixed(0)}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-sm text-gray-600">Monthly Growth</div>
                      <div className={`text-xl font-bold ${
                        data.price_reports.comparisons.monthly_growth_rate > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {data.price_reports.comparisons.monthly_growth_rate > 0 ? '+' : ''}
                        {data.price_reports.comparisons.monthly_growth_rate}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Properties View */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">🏠 All Properties</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Showing {indexOfFirstProperty + 1}-{Math.min(indexOfLastProperty, allProperties.length)} of {allProperties.length} properties
                  </p>
                </div>
                <button
                  onClick={fetchAllProperties}
                  disabled={loadingProperties}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw size={16} className={loadingProperties ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>

              {loadingProperties ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
                    <p className="text-gray-600">Loading properties...</p>
                  </div>
                </div>
              ) : allProperties.length === 0 ? (
                <div className="text-center py-20">
                  <Home className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-600">No properties found matching the selected filters</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b-2 border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Rent</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Landlord</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Views</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentProperties.map((property, index) => (
                          <tr key={property.listing_id || index} className="border-b hover:bg-gray-50 transition">
                            <td className="py-3 px-4 text-sm font-mono text-gray-600">#{property.listing_id}</td>
                            <td className="py-3 px-4">
                              <div className="max-w-xs">
                                <div className="font-medium text-gray-900 truncate">{property.title || 'Untitled'}</div>
                                {property.description && (
                                  <div className="text-xs text-gray-500 truncate">{property.description.substring(0, 50)}...</div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold capitalize">
                                {property.property_type || 'N/A'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">{property.city || 'N/A'}</div>
                                <div className="text-xs text-gray-500">{property.area || 'N/A'}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-green-600">
                              Rs. {parseFloat(property.rent_amount || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                property.status === 'active' ? 'bg-green-100 text-green-700' :
                                property.status === 'rented' ? 'bg-purple-100 text-purple-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {property.status || 'N/A'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">{property.landlord_name || 'Unknown'}</div>
                                <div className="text-xs text-gray-500">{property.landlord_email || ''}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Eye size={14} className="text-gray-400" />
                                <span className="text-sm font-medium">{property.total_views || 0}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {property.created_at ? new Date(property.created_at).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ← Previous
                        </button>
                        
                        {/* Page numbers */}
                        <div className="flex gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`px-3 py-2 rounded-lg transition ${
                                  currentPage === pageNum
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  // ==================== MAIN RENDER ====================

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading comprehensive analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Comprehensive Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Real-time insights and comprehensive reporting • Updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => fetchComprehensiveData()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              <button
                onClick={() => handleExport('csv', activeTab)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Download size={16} />
                Export CSV
              </button>
              <button
                onClick={() => handleExport('pdf', activeTab)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <FileText size={16} />
                Export PDF
              </button>
              <button
                onClick={() => handleExport('json', activeTab)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
              >
                <FileText size={16} />
                Export JSON
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="text-gray-600" size={18} />
              <h3 className="font-semibold text-gray-900">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range Filter - Always visible */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {dateRangeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Custom Date Range */}
              {dateRange === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              {/* City Filter - For listings, rental tabs */}
              {(['overview', 'listings', 'rental'].includes(activeTab)) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Cities</option>
                    {getAvailableCities().map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Property Type Filter - For listings, rental tabs */}
              {(['overview', 'listings', 'rental', 'advanced'].includes(activeTab)) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                  <select
                    value={selectedPropertyType}
                    onChange={(e) => setSelectedPropertyType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="flat">Flat</option>
                    <option value="room">Room</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="hostel">Hostel</option>
                  </select>
                </div>
              )}

              {/* Status Filter - For listings tab */}
              {activeTab === 'listings' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="rented">Rented</option>
                  </select>
                </div>
              )}

              {/* User Role Filter - For users tab */}
              {activeTab === 'users' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="tenant">Tenant</option>
                    <option value="landlord">Landlord</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}

              {/* Payment Status Filter - For financial tab */}
              {activeTab === 'financial' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                  <select
                    value={selectedPaymentStatus}
                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                    <option value="waived">Waived</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 border-b">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'listings' && <ListingsTab />}
            {activeTab === 'rental' && <RentalActivityTab />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'financial' && <FinancialTab />}
            {activeTab === 'advanced' && <AdvancedTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ComprehensiveAnalyticsDashboard;
