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
  DollarSign,
  MapPin,
  Bed,
  Bath,
  Eye
} from 'lucide-react'

const AdminListings = () => {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingListing, setEditingListing] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [actionLoading, setActionLoading] = useState({})
  const [message, setMessage] = useState({ type: '', text: '' })
  const [saving, setSaving] = useState(false)

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
      const response = await api.put(`/admin/listings/${id}/reject`)
      if (response.data.success) {
        setListings(prev =>
          prev.map(listing =>
            listing.id === id ? { ...listing, status: 'inactive' } : listing
          )
        )
        setMessage({ type: 'success', text: 'Listing rejected' })
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    } catch (error) {
      console.error('Failed to reject listing:', error)
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to reject listing' })
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

      {/* Search Bar */}
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
      </motion.div>

      {/* Listings Table */}
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
                          <div className="flex items-center gap-1 font-semibold text-text">
                            <DollarSign size={16} />
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
                              onClick={() => handleEdit(listing)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
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
