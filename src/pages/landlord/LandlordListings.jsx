import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api/axios'
import { 
  Plus, Edit2, Trash2, Loader2, MapPin, Bed, Bath, Eye, X, Search, Grid3X3, List,
  Home, Calendar, User, Clock, Filter, CheckCircle, XCircle, AlertCircle, DollarSign
} from 'lucide-react'

const LandlordListings = () => {
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [filteredListings, setFilteredListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterBookingStatus, setFilterBookingStatus] = useState('') // New: for booking status filter
  const [viewMode, setViewMode] = useState('card')

  useEffect(() => {
    fetchListings()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [listings, searchQuery, filterCity, filterStatus, filterBookingStatus])

  const fetchListings = async () => {
    try {
      // Fetch current user's listings
      console.log('[LISTINGS] Fetching landlord listings...')
      const response = await api.get('/listings/landlord/my-listings')
      console.log('[LISTINGS] Response:', response.data)
      setListings(response.data.data || [])
      console.log('[LISTINGS] Loaded', (response.data.data || []).length, 'listings')
    } catch (error) {
      console.error('[LISTINGS] Failed to fetch listings:', error)
      console.error('[LISTINGS] Error response:', error.response?.data)
      setMessage({ type: 'error', text: 'Failed to load listings' })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...listings]

    // Filter by search query (title, description, address)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(listing =>
        (listing.title?.toLowerCase().includes(query)) ||
        (listing.description?.toLowerCase().includes(query)) ||
        (listing.address?.toLowerCase().includes(query))
      )
    }

    // Filter by city
    if (filterCity) {
      filtered = filtered.filter(listing =>
        listing.city?.toLowerCase().includes(filterCity.toLowerCase())
      )
    }

    // Filter by status
    if (filterStatus) {
      filtered = filtered.filter(listing => listing.status === filterStatus)
    }

    // Filter by booking status
    if (filterBookingStatus) {
      filtered = filtered.filter(listing => listing.booking_status === filterBookingStatus)
    }

    setFilteredListings(filtered)
  }

  const getStatusBadge = (listing) => {
    const status = listing.booking_status || 'available'
    
    const badges = {
      available: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: CheckCircle,
        label: 'Available'
      },
      rented: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        icon: Home,
        label: 'Rented'
      },
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        icon: Clock,
        label: 'Pending Booking'
      }
    }

    const badge = badges[status] || badges.available
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        <Icon size={14} />
        {badge.label}
      </span>
    )
  }

  const getRemainingDays = (listing) => {
    if (listing.booking_status !== 'rented' || !listing.days_remaining) return null
    
    const days = Math.floor(listing.days_remaining)
    
    if (days < 0) return null
    
    return (
      <div className={`flex items-center gap-2 text-xs ${days <= 7 ? 'text-red-600' : 'text-gray-600'}`}>
        <Clock size={14} />
        <span className="font-semibold">{days} days remaining</span>
      </div>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const stats = {
    total: listings.length,
    available: listings.filter(l => l.booking_status === 'available' || !l.booking_status).length,
    rented: listings.filter(l => l.booking_status === 'rented').length,
    pending: listings.filter(l => l.booking_status === 'pending').length
  }

  const handleDelete = async (id) => {
    setDeleting(true)
    try {
      await api.delete(`/listings/${id}`)
      setListings((prev) => prev.filter((listing) => listing.id !== id))
      setDeleteConfirm(null)
      setMessage({ type: 'success', text: 'Listing deleted successfully' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Failed to delete listing:', error)
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to delete listing' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } finally {
      setDeleting(false)
    }
  }

  const handleDismissAdminNotes = async (id, e) => {
    e.stopPropagation() // Prevent navigation
    try {
      await api.put(`/listings/${id}/mark-admin-changes-seen`)
      // Update the listing in state to hide the banner
      setListings((prev) =>
        prev.map((listing) =>
          listing.id === id ? { ...listing, admin_changes_seen: true } : listing
        )
      )
      setMessage({ type: 'success', text: 'Admin notification dismissed' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Failed to dismiss admin notes:', error)
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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-text">My Listings</h1>
          <p className="text-gray-600 mt-2">Manage your property listings</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/landlord/listings/create')}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-lg"
        >
          <Plus size={20} />
          Create Listing
        </motion.button>
      </motion.div>

      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Properties</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <Home size={40} className="opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Available</p>
              <p className="text-3xl font-bold mt-1">{stats.available}</p>
            </div>
            <CheckCircle size={40} className="opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Rented</p>
              <p className="text-3xl font-bold mt-1">{stats.rented}</p>
            </div>
            <User size={40} className="opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending</p>
              <p className="text-3xl font-bold mt-1">{stats.pending}</p>
            </div>
            <Clock size={40} className="opacity-80" />
          </div>
        </motion.div>
      </div>

      {/* Search and Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h2 className="text-lg font-semibold text-text">Filters</h2>
        </div>

        {/* Booking Status Filter Buttons */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {['all', 'available', 'rented', 'pending'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilterBookingStatus(filterOption === 'all' ? '' : filterOption)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                (filterOption === 'all' && !filterBookingStatus) || filterBookingStatus === filterOption
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
            />
          </div>
          
          <input
            type="text"
            placeholder="Filter by city"
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
          />
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="rented">Rented</option>
          </select>

          {(searchQuery || filterCity || filterStatus || filterBookingStatus) && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSearchQuery('')
                setFilterCity('')
                setFilterStatus('')
                setFilterBookingStatus('')
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Clear Filters
            </motion.button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 bg-gray-100 rounded-lg border border-gray-300 p-1 w-fit">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('card')}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              viewMode === 'card'
                ? 'bg-white text-primary-600 shadow-md'
                : 'text-gray-700 hover:text-primary-600'
            }`}
          >
            <Grid3X3 size={18} />
            Card
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              viewMode === 'table'
                ? 'bg-white text-primary-600 shadow-md'
                : 'text-gray-700 hover:text-primary-600'
            }`}
          >
            <List size={18} />
            List
          </motion.button>
        </div>
      </motion.div>

      {/* Listings Grid/Table */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredListings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {listing.images && listing.images[0] && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={
                        listing.images[0].startsWith('http')
                          ? listing.images[0]
                          : `http://localhost:5000${listing.images[0]}`
                      }
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      {getStatusBadge(listing)}
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-text mb-2 line-clamp-1">
                    {listing.title || listing.address}
                  </h3>
                  
                  {/* Admin Feedback Alert */}
                  {listing.admin_notes && !listing.admin_changes_seen && (
                    <div className={`mb-3 p-3 rounded-lg border-2 relative ${
                      listing.status === 'inactive' 
                        ? 'bg-red-50 border-red-300' 
                        : 'bg-orange-50 border-orange-300'
                    }`}>
                      <button
                        onClick={(e) => handleDismissAdminNotes(listing.id, e)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Dismiss notification"
                      >
                        <X size={16} />
                      </button>
                      <p className={`text-xs font-semibold mb-1 pr-6 ${
                        listing.status === 'inactive' ? 'text-red-800' : 'text-orange-800'
                      }`}>
                        {listing.status === 'inactive' ? '❌ Rejected' : '⚠️ Changes Requested'}
                      </p>
                      <p className={`text-xs line-clamp-2 ${
                        listing.status === 'inactive' ? 'text-red-700' : 'text-orange-700'
                      }`}>
                        {listing.admin_notes}
                      </p>
                    </div>
                  )}
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {listing.description?.substring(0, 100) || 'No description'}
                    {listing.description?.length > 100 ? '...' : ''}
                  </p>
                  
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {listing.city || listing.address || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bed size={14} />
                      {listing.bedrooms || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath size={14} />
                      {listing.bathrooms || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <p className="text-2xl font-bold text-primary-600">
                      Rs. {(listing.rent_amount || listing.price || 0).toLocaleString()}
                    </p>
                    {listing.views && (
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Eye size={14} />
                        {listing.views} views
                      </span>
                    )}
                  </div>

                  {/* Rental Info */}
                  {listing.booking_status === 'rented' && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4 space-y-2 border border-blue-200">
                      <div className="flex items-center gap-2 text-blue-900">
                        <User size={14} />
                        <span className="font-semibold text-sm">Tenant: {listing.tenant_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-700 text-xs">
                        <Calendar size={12} />
                        <span>Start: {formatDate(listing.rent_start_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-700 text-xs">
                        <Calendar size={12} />
                        <span>End: {formatDate(listing.rent_end_date)}</span>
                      </div>
                      {getRemainingDays(listing)}
                    </div>
                  )}

                  {listing.booking_status === 'pending' && (
                    <div className="bg-yellow-50 rounded-lg p-3 mb-4 border border-yellow-200">
                      <div className="flex items-center gap-2 text-yellow-900">
                        <AlertCircle size={14} />
                        <span className="font-semibold text-sm">Booking request pending</span>
                      </div>
                      <button
                        onClick={() => navigate('/landlord/bookings')}
                        className="text-xs text-yellow-700 hover:text-yellow-900 mt-1 underline"
                      >
                        Review request
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/landlord/listings/edit/${listing.id}`)}
                      className="flex-1 px-4 py-2 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors flex items-center justify-center gap-1 text-sm font-semibold"
                    >
                      <Edit2 size={16} />
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDeleteConfirm(listing.id)}
                      className="flex-1 px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-1 text-sm font-semibold"
                    >
                      <Trash2 size={16} />
                      Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredListings.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 bg-white rounded-xl shadow-lg col-span-full"
            >
              <Plus size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-4 text-lg">
                {listings.length === 0 ? 'No listings yet' : 'No listings match your search'}
              </p>
              {listings.length === 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/landlord/listings/create')}
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold shadow-lg"
                >
                  Create Your First Listing
                </motion.button>
              )}
            </motion.div>
          )}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                  <th className="px-6 py-4 text-left font-semibold">Title</th>
                  <th className="px-6 py-4 text-left font-semibold">Location</th>
                  <th className="px-6 py-4 text-left font-semibold">Price</th>
                  <th className="px-6 py-4 text-left font-semibold">Details</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Views</th>
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredListings.map((listing, index) => (
                    <motion.tr
                      key={listing.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`border-t border-gray-200 hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-text line-clamp-1">{listing.title || listing.address}</p>
                        <p className="text-sm text-gray-600 line-clamp-1">{listing.description?.substring(0, 50)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-text flex items-center gap-2">
                          <MapPin size={14} className="text-primary-600" />
                          {listing.city || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-primary-600">
                          Rs. {(listing.rent_amount || listing.price || 0).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Bed size={14} />
                            {listing.bedrooms || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bath size={14} />
                            {listing.bathrooms || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            listing.status === 'active' && listing.is_verified
                              ? 'bg-green-100 text-green-700'
                              : listing.status === 'active' && !listing.is_verified
                              ? 'bg-yellow-100 text-yellow-700'
                              : listing.status === 'inactive'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {listing.status === 'active' && listing.is_verified ? 'Active' : 
                           listing.status === 'active' && !listing.is_verified ? 'Pending Approval' :
                           listing.status || 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Eye size={14} />
                          {listing.views || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/landlord/listings/edit/${listing.id}`)}
                            className="px-3 py-1 text-sm border border-primary-600 text-primary-600 rounded hover:bg-primary-50 transition-colors"
                          >
                            <Edit2 size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setDeleteConfirm(listing.id)}
                            className="px-3 py-1 text-sm border border-red-600 text-red-600 rounded hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-12">
              <Plus size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-4 text-lg">
                {listings.length === 0 ? 'No listings yet' : 'No listings match your search'}
              </p>
              {listings.length === 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/landlord/listings/create')}
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold shadow-lg"
                >
                  Create Your First Listing
                </motion.button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => !deleting && setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-bold text-text mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this listing? This action cannot be undone.
              </p>
              <div className="flex gap-4 justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : null}
                  Delete Listing
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LandlordListings
