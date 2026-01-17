import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api/axios'
import { 
  Home, 
  Edit2, 
  Trash2, 
  Search, 
  X, 
  Save, 
  Loader2,
  CheckCircle2,
  XCircle,
  Check,
  MapPin,
  Bed,
  Bath,
  Eye,
  Grid3X3,
  List
} from 'lucide-react'

const AdminListings = () => {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingListing, setEditingListing] = useState(null)
  const [viewingListing, setViewingListing] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [requestChangesModal, setRequestChangesModal] = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [actionLoading, setActionLoading] = useState({})
  const [message, setMessage] = useState({ type: '', text: '' })
  const [saving, setSaving] = useState(false)
  const [viewMode, setViewMode] = useState('table') // 'table' or 'card'

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      const response = await api.get('/admin/listings')
      setListings(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch listings:', error)
      setMessage({ type: 'error', text: 'Failed to load listings' })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: true }))
    try {
      const response = await api.put(`/admin/listings/${id}/approve`)
      if (response.data.success) {
        setListings(prev =>
          prev.map(listing =>
            listing.id === id ? { ...listing, status: 'active', is_verified: true } : listing
          )
        )
        setMessage({ type: 'success', text: 'Listing approved successfully' })
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    } catch (error) {
      console.error('Failed to approve listing:', error)
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to approve listing' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  const handleReject = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: true }))
    try {
      const response = await api.put(`/admin/listings/${id}/reject`, { reason: feedbackMessage })
      if (response.data.success) {
        setListings(prev =>
          prev.map(listing =>
            listing.id === id ? { ...listing, status: 'inactive', admin_notes: feedbackMessage } : listing
          )
        )
        setMessage({ type: 'success', text: 'Listing rejected' })
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
        setRejectModal(null)
        setFeedbackMessage('')
      }
    } catch (error) {
      console.error('Failed to reject listing:', error)
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to reject listing' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  const handleRequestChanges = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: true }))
    try {
      const response = await api.put(`/admin/listings/${id}/request-changes`, { message: feedbackMessage })
      if (response.data.success) {
        setListings(prev =>
          prev.map(listing =>
            listing.id === id ? { ...listing, is_verified: false, admin_notes: feedbackMessage } : listing
          )
        )
        setMessage({ type: 'success', text: 'Correction request sent to landlord' })
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
        setRequestChangesModal(null)
        setFeedbackMessage('')
      }
    } catch (error) {
      console.error('Failed to request changes:', error)
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to request changes' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  const handleEdit = (listing) => {
    setEditingListing({ ...listing })
    setDeleteConfirm(null)
  }

  const handleCancelEdit = () => {
    setEditingListing(null)
  }

  const handleSaveEdit = async () => {
    if (!editingListing) return
    
    setSaving(true)
    try {
      const response = await api.put(`/admin/listings/${editingListing.id}`, editingListing)
      if (response.data.success) {
        setListings(listings.map(l => l.id === editingListing.id ? response.data.data : l))
        setEditingListing(null)
        setMessage({ type: 'success', text: 'Listing updated successfully' })
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    } catch (error) {
      console.error('Failed to update listing:', error)
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update listing' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (listingId) => {
    setSaving(true)
    try {
      const response = await api.delete(`/admin/listings/${listingId}`)
      if (response.data.success) {
        setListings(listings.filter(l => l.id !== listingId))
        setDeleteConfirm(null)
        setMessage({ type: 'success', text: 'Listing deleted successfully' })
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    } catch (error) {
      console.error('Failed to delete listing:', error)
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to delete listing' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } finally {
      setSaving(false)
    }
  }

  const updateEditingListing = (field, value) => {
    setEditingListing(prev => ({ ...prev, [field]: value }))
  }

  const filteredListings = listings.filter(listing =>
    listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.city?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status, isVerified) => {
    if (status === 'active' && isVerified) return 'bg-green-100 text-green-700'
    if (status === 'active' && !isVerified) return 'bg-yellow-100 text-yellow-700'
    if (status === 'inactive') return 'bg-red-100 text-red-700'
    if (status === 'rented') return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-700'
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
      >
        <div className="flex items-center gap-3 mb-2">
          <Home size={32} className="text-primary-600" />
          <h1 className="text-3xl font-bold text-text">Manage Listings</h1>
        </div>
        <p className="text-gray-600">Review, edit, and manage all property listings</p>
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
          {message.type === 'success' ? (
            <CheckCircle2 size={20} />
          ) : (
            <XCircle size={20} />
          )}
          <span>{message.text}</span>
        </motion.div>
      )}

      {/* Search Bar & View Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-4"
      >
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search listings by title, address, or city..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="flex gap-2 bg-white rounded-lg border border-gray-300 p-1">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded transition-all ${viewMode === 'table' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:text-gray-900'}`}
            title="Table View"
          >
            <List size={20} />
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded transition-all ${viewMode === 'card' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:text-gray-900'}`}
            title="Card View"
          >
            <Grid3X3 size={20} />
          </button>
        </div>
      </motion.div>

      {/* Listings View */}
      {viewMode === 'table' ? (
        /* Table View */
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Details</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredListings.map((listing, index) => (
                  <motion.tr
                    key={listing.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    {editingListing?.id === listing.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editingListing.title || ''}
                            onChange={(e) => updateEditingListing('title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editingListing.address || ''}
                            onChange={(e) => updateEditingListing('address', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={editingListing.rent_amount || editingListing.price || ''}
                            onChange={(e) => updateEditingListing('rent_amount', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="Beds"
                              value={editingListing.bedrooms || ''}
                              onChange={(e) => updateEditingListing('bedrooms', e.target.value)}
                              className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                            />
                            <input
                              type="number"
                              placeholder="Baths"
                              value={editingListing.bathrooms || ''}
                              onChange={(e) => updateEditingListing('bathrooms', e.target.value)}
                              className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={editingListing.status || 'active'}
                            onChange={(e) => updateEditingListing('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="rented">Rented</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={handleSaveEdit}
                              disabled={saving}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                            >
                              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={handleCancelEdit}
                              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              <X size={16} />
                            </motion.button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <div className="font-medium text-text">{listing.title}</div>
                          {listing.description && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {listing.description.substring(0, 50)}...
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin size={14} />
                            <span>{listing.city || listing.address || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-text">
                            Rs. {(listing.rent_amount || listing.price || 0).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 text-sm text-gray-600">
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
                          <div className="flex flex-col gap-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${getStatusColor(listing.status, listing.is_verified)}`}>
                              {listing.status || 'active'}
                            </span>
                            {!listing.is_verified && listing.status === 'active' && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold w-fit bg-yellow-100 text-yellow-700">
                                Pending Verification
                              </span>
                            )}
                            {listing.admin_notes && listing.admin_changes_seen && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold w-fit bg-green-100 text-green-700">
                                ✓ Seen
                              </span>
                            )}
                            {listing.admin_notes && !listing.admin_changes_seen && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold w-fit bg-orange-100 text-orange-700">
                                ⏳ Pending
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
                            {listing.status === 'active' && !listing.is_verified && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleApprove(listing.id)}
                                disabled={actionLoading[listing.id]}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                {actionLoading[listing.id] ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Check size={16} />
                                )}
                              </motion.button>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setViewingListing(listing)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setDeleteConfirm(listing.id)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          </div>
                        </td>
                      </>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Home size={48} className="mx-auto mb-4 opacity-50" />
            <p>No listings found</p>
          </div>
        )}
      </motion.div>
      ) : (
        /* Card View */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredListings.map((listing) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
              >
                {/* Card Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white">
                  <Home size={48} opacity={0.5} />
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{listing.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                    <MapPin size={16} />
                    <span>{listing.city || listing.address || 'N/A'}</span>
                  </div>

                  {/* Price */}
                  <div className="text-lg font-bold text-gray-900 mb-4">
                    Rs. {(listing.rent_amount || listing.price || 0).toLocaleString()}
                  </div>

                  {/* Details */}
                  <div className="flex gap-4 mb-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Bed size={16} />
                      {listing.bedrooms || 0} Beds
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath size={16} />
                      {listing.bathrooms || 0} Baths
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(listing.status, listing.is_verified)}`}>
                      {listing.status || 'active'}
                    </span>
                    {!listing.is_verified && listing.status === 'active' && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                        Pending
                      </span>
                    )}
                    {listing.admin_notes && listing.admin_changes_seen && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1">
                        ✓ Changes Seen
                      </span>
                    )}
                    {listing.admin_notes && !listing.admin_changes_seen && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 flex items-center gap-1">
                        ⏳ Awaiting Review
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {listing.status === 'active' && !listing.is_verified && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleApprove(listing.id)}
                        disabled={actionLoading[listing.id]}
                        className="flex-1 p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 font-medium text-sm"
                      >
                        {actionLoading[listing.id] ? <Loader2 size={16} className="animate-spin mx-auto" /> : <Check size={16} className="mx-auto" />}
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewingListing(listing)}
                      className="flex-1 p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm"
                    >
                      <Eye size={16} className="mx-auto" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDeleteConfirm(listing.id)}
                      className="flex-1 p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                    >
                      <Trash2 size={16} className="mx-auto" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {filteredListings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Home size={48} className="mx-auto mb-4 opacity-50" />
          <p>No listings found</p>
        </div>
      )}

      {/* View Details Modal */}
      <AnimatePresence>
        {viewingListing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setViewingListing(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
                <h3 className="text-2xl font-bold text-text">Listing Details</h3>
                <button
                  onClick={() => setViewingListing(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Images */}
                {viewingListing.images && viewingListing.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {viewingListing.images.map((image, index) => (
                      <img
                        key={index}
                        src={image.startsWith('http') ? image : `http://localhost:5000${image}`}
                        alt={`Property ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

                {/* Basic Info */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-text mb-4">{viewingListing.title}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 font-medium">Location:</span>
                      <p className="text-text flex items-center gap-2 mt-1">
                        <MapPin size={16} className="text-primary-600" />
                        {viewingListing.city}, {viewingListing.address}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Monthly Rent:</span>
                      <p className="text-2xl font-bold text-primary-600 mt-1">
                        Rs. {(viewingListing.rent_amount || viewingListing.price || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Bedrooms:</span>
                      <p className="text-text flex items-center gap-2 mt-1">
                        <Bed size={16} />
                        {viewingListing.bedrooms || 0} Beds
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Bathrooms:</span>
                      <p className="text-text flex items-center gap-2 mt-1">
                        <Bath size={16} />
                        {viewingListing.bathrooms || 0} Baths
                      </p>
                    </div>
                    {viewingListing.college_name && (
                      <div className="md:col-span-2">
                        <span className="text-gray-600 font-medium">Nearby College:</span>
                        <p className="text-text mt-1">{viewingListing.college_name}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600 font-medium">Property Type:</span>
                      <p className="text-text mt-1 capitalize">{viewingListing.type || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Furnished:</span>
                      <p className="text-text mt-1 capitalize">{viewingListing.furnished || 'N/A'}</p>
                    </div>
                    {viewingListing.deposit_amount && (
                      <div>
                        <span className="text-gray-600 font-medium">Security Deposit:</span>
                        <p className="text-text mt-1">Rs. {viewingListing.deposit_amount.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {viewingListing.description && (
                  <div>
                    <h4 className="text-lg font-semibold text-text mb-2">Description</h4>
                    <p className="text-gray-700 leading-relaxed">{viewingListing.description}</p>
                  </div>
                )}

                {/* Amenities */}
                {viewingListing.amenities && viewingListing.amenities.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-text mb-3">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingListing.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Badge */}
                <div className="flex gap-3">
                  <span
                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                      viewingListing.status === 'active' && viewingListing.is_verified
                        ? 'bg-green-100 text-green-700'
                        : viewingListing.status === 'active' && !viewingListing.is_verified
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {viewingListing.status === 'active' && viewingListing.is_verified
                      ? 'Active & Verified'
                      : viewingListing.status === 'active' && !viewingListing.is_verified
                      ? 'Pending Approval'
                      : viewingListing.status || 'Inactive'}
                  </span>
                </div>

                {/* Admin Change Request Status */}
                {viewingListing.admin_notes && (
                  <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-orange-900 mb-2 flex items-center gap-2">
                          📝 Admin Change Request
                          {viewingListing.admin_changes_seen && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                              ✓ Seen by Landlord
                            </span>
                          )}
                          {!viewingListing.admin_changes_seen && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                              ⏳ Pending
                            </span>
                          )}
                        </h4>
                        <div className="bg-white rounded p-3 mb-2">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{viewingListing.admin_notes}</p>
                        </div>
                        {viewingListing.admin_changes_details && (
                          <div className="text-xs text-gray-600 space-y-1">
                            {viewingListing.admin_changes_details.adminName && (
                              <p>
                                <span className="font-semibold">Requested by:</span>{' '}
                                {viewingListing.admin_changes_details.adminName}
                              </p>
                            )}
                            {viewingListing.admin_changes_details.requestedAt && (
                              <p>
                                <span className="font-semibold">Requested at:</span>{' '}
                                {new Date(viewingListing.admin_changes_details.requestedAt).toLocaleString()}
                              </p>
                            )}
                            {viewingListing.admin_changes_seen_at && (
                              <p className="text-green-700">
                                <span className="font-semibold">Seen at:</span>{' '}
                                {new Date(viewingListing.admin_changes_seen_at).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer - Actions */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-4 justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewingListing(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Close
                </motion.button>
                {viewingListing.status === 'active' && !viewingListing.is_verified && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setRejectModal(viewingListing.id)
                        setViewingListing(null)
                      }}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <XCircle size={16} />
                      Reject
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setRequestChangesModal(viewingListing.id)
                        setViewingListing(null)
                      }}
                      className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                    >
                      <Edit2 size={16} />
                      Request Changes
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        handleApprove(viewingListing.id)
                        setViewingListing(null)
                      }}
                      disabled={actionLoading[viewingListing.id]}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {actionLoading[viewingListing.id] ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                      Approve
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request Changes Modal */}
      <AnimatePresence>
        {requestChangesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => { setRequestChangesModal(null); setFeedbackMessage(''); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-bold text-text mb-4">Request Changes</h3>
              <p className="text-gray-600 mb-4">
                Please provide feedback about what needs to be corrected in this listing. The landlord will be able to view your message.
              </p>
              <textarea
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="E.g., Please update the property images and add more details about amenities..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-primary-600 mb-4"
              />
              <div className="flex gap-4 justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setRequestChangesModal(null); setFeedbackMessage(''); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRequestChanges(requestChangesModal)}
                  disabled={!feedbackMessage.trim() || actionLoading[requestChangesModal]}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading[requestChangesModal] ? <Loader2 size={16} className="animate-spin" /> : null}
                  Send Request
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => { setRejectModal(null); setFeedbackMessage(''); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-bold text-text mb-4">Reject Listing</h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejecting this listing. The landlord will be able to view your message.
              </p>
              <textarea
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="E.g., This listing violates our terms of service..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-primary-600 mb-4"
              />
              <div className="flex gap-4 justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setRejectModal(null); setFeedbackMessage(''); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleReject(rejectModal)}
                  disabled={!feedbackMessage.trim() || actionLoading[rejectModal]}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading[rejectModal] ? <Loader2 size={16} className="animate-spin" /> : null}
                  Reject Listing
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setDeleteConfirm(null)}
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
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={saving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}
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

export default AdminListings
