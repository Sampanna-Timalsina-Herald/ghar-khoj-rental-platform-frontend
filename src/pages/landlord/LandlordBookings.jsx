import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api/axios'
import { 
  Calendar, CheckCircle, Eye, FileText, Loader2, XCircle, Grid3X3, List, 
  User, MapPin, DollarSign, Clock, AlertCircle, Search, X, Plus 
} from 'lucide-react'

const LandlordBookings = () => {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [landlordSignature, setLandlordSignature] = useState('')
  const [previewImage, setPreviewImage] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [viewMode, setViewMode] = useState('card')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [bookings, filterStatus, searchQuery])

  const applyFilters = () => {
    let filtered = [...bookings]

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => b.status === filterStatus)
    }

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(b =>
        (b.listing_title?.toLowerCase().includes(q)) ||
        (b.full_name?.toLowerCase().includes(q)) ||
        (b.tenant_name?.toLowerCase().includes(q)) ||
        (b.listing_city?.toLowerCase().includes(q))
      )
    }

    setFilteredBookings(filtered)
  }

  const getStats = () => {
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      approved: bookings.filter(b => b.status === 'approved').length,
      accepted: bookings.filter(b => b.status === 'tenant_accepted').length,
      active: bookings.filter(b => b.status === 'active').length
    }
  }

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await api.get('/bookings/my-bookings')
      if (response.data.success) {
        setBookings(response.data.data)
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to load bookings' })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-blue-100 text-blue-700',
      tenant_accepted: 'bg-indigo-100 text-indigo-700',
      active: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700'
    }
    const labels = {
      pending: 'Pending Review',
      approved: 'Waiting Tenant Payment/Accept',
      tenant_accepted: 'Waiting Your Verification',
      active: 'Rent Active',
      rejected: 'Rejected',
      cancelled: 'Cancelled'
    }

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badges[status] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status] || status}
      </span>
    )
  }

  const getAssetUrl = (assetPath) => {
    if (!assetPath) return ''
    if (assetPath.startsWith('http://') || assetPath.startsWith('https://')) return assetPath
    const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')
    return `${apiBase}${assetPath}`
  }

  const formatDate = (value) => new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  const handleApprove = async (bookingId) => {
    try {
      setActionLoading(bookingId)
      const response = await api.put(`/bookings/${bookingId}/approve`)
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Booking approved. Tenant must pay and accept first.' })
        fetchBookings()
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to approve booking' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!selectedBooking || !rejectionReason.trim()) {
      setMessage({ type: 'error', text: 'Please provide rejection reason' })
      return
    }

    try {
      setActionLoading(selectedBooking.id)
      const response = await api.put(`/bookings/${selectedBooking.id}/reject`, { rejection_reason: rejectionReason })
      if (response.data.success) {
        setShowRejectModal(false)
        setRejectionReason('')
        setMessage({ type: 'success', text: 'Booking rejected.' })
        fetchBookings()
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to reject booking' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleVerifyStart = async (bookingId) => {
    if (!landlordSignature.trim()) {
      setMessage({ type: 'error', text: 'Digital signature is required for verification' })
      return
    }

    try {
      setActionLoading(bookingId)
      const response = await api.put(`/bookings/${bookingId}/landlord-verify-start`, {
        landlord_signature: landlordSignature.trim()
      })

      if (response.data.success) {
        setLandlordSignature('')
        setSelectedBooking(null)
        setMessage({ type: 'success', text: 'Verified successfully. Rent is now active.' })
        fetchBookings()
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to verify and start rent' })
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    )
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-600 mt-1">Manage and review booking requests</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('card')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'card' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            title="Card view"
          >
            <Grid3X3 size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            title="List view"
          >
            <List size={18} />
          </motion.button>
        </div>
      </div>

      {/* Message Alert */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`border rounded-xl p-4 flex items-start gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-medium flex-1">{message.text}</p>
            <button onClick={() => setMessage({ type: '', text: '' })} className="text-current hover:opacity-70">
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'blue' },
          { label: 'Pending', value: stats.pending, color: 'yellow' },
          { label: 'Approved', value: stats.approved, color: 'indigo' },
          { label: 'Awaiting Verify', value: stats.accepted, color: 'purple' },
          { label: 'Active', value: stats.active, color: 'green' }
        ].map(stat => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br from-${stat.color}-50 to-white border-2 border-${stat.color}-100 rounded-xl p-4`}
          >
            <p className={`text-xs font-semibold text-${stat.color}-600 uppercase tracking-wide`}>{stat.label}</p>
            <p className={`text-2xl font-bold text-${stat.color}-700 mt-1`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by property, tenant name, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Waiting Payment/Accept</option>
          <option value="tenant_accepted">Waiting Verification</option>
          <option value="active">Rent Active</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Empty State */}
      {bookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-gray-200 rounded-xl p-12 text-center"
        >
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 text-lg font-medium">No booking requests yet</p>
          <p className="text-gray-500 text-sm mt-1">You'll see booking requests here once tenants start booking.</p>
        </motion.div>
      ) : filteredBookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-gray-200 rounded-xl p-12 text-center"
        >
          <Search size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 text-lg font-medium">No bookings match your search</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search query.</p>
        </motion.div>
      ) : viewMode === 'card' ? (
        /* CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredBookings.map((booking, idx) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Header */}
                <div className={`px-5 py-4 border-b border-gray-100 bg-gradient-to-r ${
                  booking.status === 'pending' ? 'from-yellow-50 to-white' :
                  booking.status === 'approved' ? 'from-blue-50 to-white' :
                  booking.status === 'tenant_accepted' ? 'from-purple-50 to-white' :
                  booking.status === 'active' ? 'from-green-50 to-white' :
                  'from-gray-50 to-white'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 line-clamp-1">{booking.listing_title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{booking.listing_city || 'Location N/A'}</p>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  {/* Tenant Info */}
                  <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                    <User size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 font-semibold">TENANT</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{booking.full_name || booking.tenant_name}</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} className="text-primary-600 flex-shrink-0" />
                    <span className="text-gray-600 line-clamp-1">
                      {formatDate(booking.start_date)} → {formatDate(booking.end_date)}
                    </span>
                  </div>

                  {/* Rent */}
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign size={14} className="text-green-600 flex-shrink-0" />
                    <span className="font-semibold text-gray-900">Rs. {Number(booking.monthly_rent || 0).toLocaleString()}/mo</span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={14} className="text-orange-600 flex-shrink-0" />
                    <span className="text-gray-600">
                      {Math.ceil((new Date(booking.end_date) - new Date(booking.start_date)) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedBooking(booking)}
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 flex items-center justify-center gap-1.5"
                  >
                    <Eye size={14} /> View
                  </motion.button>
                  {booking.status === 'pending' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleApprove(booking.id)}
                      disabled={actionLoading === booking.id}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading === booking.id ? '⏳' : 'Approve'}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-3">
          <AnimatePresence>
            {filteredBookings.map((booking, idx) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow p-4"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Left: Property & Tenant Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{booking.listing_title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">📍 {booking.listing_city || 'Location N/A'}</p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      <span className="text-gray-700">👤 {booking.full_name || booking.tenant_name}</span>
                      <span className="text-gray-700">📅 {formatDate(booking.start_date)} → {formatDate(booking.end_date)}</span>
                      <span className="text-gray-700 font-semibold">💰 Rs. {Number(booking.monthly_rent || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap gap-2 md:flex-wrap md:justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedBooking(booking)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 flex items-center gap-1.5"
                    >
                      <Eye size={14} /> View
                    </motion.button>
                    {booking.status === 'pending' && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApprove(booking.id)}
                          disabled={actionLoading === booking.id}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading === booking.id ? 'Approving...' : 'Approve'}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedBooking(booking)
                            setShowRejectModal(true)
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
                        >
                          Reject
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBooking(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className={`sticky top-0 z-10 px-6 py-5 border-b border-gray-200 bg-gradient-to-r ${
                selectedBooking.status === 'pending' ? 'from-yellow-50 to-white' :
                selectedBooking.status === 'approved' ? 'from-blue-50 to-white' :
                selectedBooking.status === 'tenant_accepted' ? 'from-purple-50 to-white' :
                selectedBooking.status === 'active' ? 'from-green-50 to-white' :
                'from-gray-50 to-white'
              } flex items-center justify-between`}>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedBooking.listing_title}</h2>
                  <p className="text-sm text-gray-600 mt-1">📍 {selectedBooking.listing_address}, {selectedBooking.listing_city}</p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedBooking.status)}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedBooking(null)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <XCircle size={24} className="text-gray-500" />
                  </motion.button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Key Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <p className="text-xs font-semibold text-blue-600 uppercase">Start Date</p>
                    <p className="text-lg font-bold text-blue-900 mt-1">{formatDate(selectedBooking.start_date)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <p className="text-xs font-semibold text-purple-600 uppercase">End Date</p>
                    <p className="text-lg font-bold text-purple-900 mt-1">{formatDate(selectedBooking.end_date)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <p className="text-xs font-semibold text-green-600 uppercase">Monthly Rent</p>
                    <p className="text-lg font-bold text-green-900 mt-1">Rs. {Number(selectedBooking.monthly_rent || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                    <p className="text-xs font-semibold text-orange-600 uppercase">Deposit</p>
                    <p className="text-lg font-bold text-orange-900 mt-1">Rs. {Number(selectedBooking.security_deposit || 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Tenant Info Section */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={20} className="text-primary-600" />
                    Tenant Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 font-semibold uppercase">Full Name</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{selectedBooking.full_name || selectedBooking.tenant_name}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 font-semibold uppercase">Email</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{selectedBooking.email || selectedBooking.tenant_email}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 font-semibold uppercase">Phone</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{selectedBooking.phone_number || selectedBooking.tenant_phone || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 font-semibold uppercase">Occupation</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{selectedBooking.occupation || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 font-semibold uppercase">Citizenship #</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{selectedBooking.citizenship_number || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 font-semibold uppercase">Emergency Contact</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{selectedBooking.emergency_contact_person || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin size={20} className="text-primary-600" />
                    Address Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <p className="text-xs text-blue-600 font-semibold uppercase mb-2">Current Address</p>
                      <p className="text-sm text-gray-900">{selectedBooking.current_address || 'N/A'}</p>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                      <p className="text-xs text-indigo-600 font-semibold uppercase mb-2">Permanent Address</p>
                      <p className="text-sm text-gray-900">{selectedBooking.permanent_address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                {(selectedBooking.citizenship_front_image || selectedBooking.citizenship_back_image) && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText size={20} className="text-primary-600" />
                      Citizenship Documents
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedBooking.citizenship_front_image && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setPreviewImage(getAssetUrl(selectedBooking.citizenship_front_image))}
                          className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
                        >
                          <p className="text-sm font-semibold text-blue-700">📄 Front Side</p>
                          <p className="text-xs text-blue-600 mt-2">Click to view</p>
                        </motion.button>
                      )}
                      {selectedBooking.citizenship_back_image && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setPreviewImage(getAssetUrl(selectedBooking.citizenship_back_image))}
                          className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
                        >
                          <p className="text-sm font-semibold text-orange-700">📄 Back Side</p>
                          <p className="text-xs text-orange-600 mt-2">Click to view</p>
                        </motion.button>
                      )}
                    </div>
                  </div>
                )}

                {/* Tenant Message */}
                {selectedBooking.message && (
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 rounded-xl p-5">
                    <p className="text-sm font-bold text-amber-900 mb-2">💬 Message from Tenant</p>
                    <p className="text-sm text-amber-900">{selectedBooking.message}</p>
                  </div>
                )}

                {/* Payment Status - Show for approved, tenant_accepted, and active */}
                {(selectedBooking.status === 'approved' || selectedBooking.status === 'tenant_accepted' || selectedBooking.status === 'active') && (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-5">
                    <h3 className="text-sm font-bold text-green-900 mb-3 flex items-center gap-2">
                      <CheckCircle size={16} />
                      Payment Status
                    </h3>
                    {selectedBooking.status === 'approved' ? (
                      <p className="text-sm text-green-800">⏳ Waiting for tenant to complete first payment (Rent + Deposit)</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-green-900 font-semibold">✅ First payment completed</p>
                        <p className="text-xs text-green-800">Amount: Rs. {(Number(selectedBooking.monthly_rent || 0) + Number(selectedBooking.security_deposit || 0)).toLocaleString()}</p>
                        {selectedBooking.tenant_signature && (
                          <p className="text-xs text-green-800">✅ Digital signature received</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Verification Section */}
                {selectedBooking.status === 'tenant_accepted' && (
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-300 rounded-xl p-5">
                    <p className="text-sm font-bold text-indigo-900 mb-2">🎯 Action Required</p>
                    <p className="text-sm text-indigo-800 mb-4">Tenant has completed payment and signed the agreement. Please verify and start the rental.</p>
                    <label className="block text-xs font-semibold text-indigo-900 mb-2">Your Digital Signature (Type your full legal name)</label>
                    <input
                      type="text"
                      value={landlordSignature}
                      onChange={(e) => setLandlordSignature(e.target.value)}
                      placeholder="e.g., Ram Kumar Shrestha"
                      className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleVerifyStart(selectedBooking.id)}
                      disabled={actionLoading === selectedBooking.id || !landlordSignature.trim()}
                      className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {actionLoading === selectedBooking.id ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          Verify & Start Rent
                        </>
                      )}
                    </motion.button>
                  </div>
                )}

                {/* Active State */}
                {selectedBooking.status === 'active' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/landlord/agreements')}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 flex items-center justify-center gap-2 transition-colors"
                  >
                    <FileText size={16} /> View Active Agreement
                  </motion.button>
                )}

                {/* Rejection Modal for Pending Bookings */}
                {selectedBooking.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleApprove(selectedBooking.id)}
                      disabled={actionLoading === selectedBooking.id}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading === selectedBooking.id ? '⏳ Approving...' : '✓ Approve'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowRejectModal(true)
                      }}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700"
                    >
                      ✕ Reject
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="text-center mb-5">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-3">
                  <AlertCircle size={24} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Reject Booking?</h3>
                <p className="text-sm text-gray-600 mt-1">Please provide a reason for rejection</p>
              </div>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Write rejection reason (e.g., tenant profile, location preference, etc.)"
                rows={4}
                className="w-full border-2 border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none mb-4"
              />

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReject}
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? '⏳ Rejecting...' : '✕ Reject'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
            onClick={() => setPreviewImage('')}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={previewImage} alt="Document preview" className="max-w-full max-h-full rounded-xl shadow-2xl" />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPreviewImage('')}
                className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-lg"
              >
                <X size={24} />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LandlordBookings
