import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api/axios'

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
  const [currentPage, setCurrentPage] = useState(1)
  const listingsPerPage = 15

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

  const indexOfLastListing = currentPage * listingsPerPage
  const indexOfFirstListing = indexOfLastListing - listingsPerPage
  const currentListings = filteredListings.slice(indexOfFirstListing, indexOfLastListing)
  const totalPages = Math.ceil(filteredListings.length / listingsPerPage)

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Listings</h1>
        <p className="text-gray-600 mt-1">Review, edit, and manage all property listings</p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Search Bar */}
      <div className="flex gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search listings by title, address, or city..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Bedrooms</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentListings.map((listing) => (
                <tr key={listing.id} className="border-b hover:bg-gray-50 transition">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{listing.title}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    <div className="text-sm">{listing.address}</div>
                    <div className="text-xs text-gray-500">{listing.city}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-900 font-semibold">
                    Rs. {Number(listing.rent_amount || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {listing.bedrooms || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(listing.status, listing.is_verified)}`}>
                      {listing.status === 'active' && !listing.is_verified && 'Pending'}
                      {listing.status === 'active' && listing.is_verified && 'Active'}
                      {listing.status === 'inactive' && 'Inactive'}
                      {listing.status === 'rented' && 'Rented'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 justify-center flex-wrap">
                      <button
                        onClick={() => setViewingListing(listing)}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition"
                      >
                        View
                      </button>
                      {listing.status === 'active' && !listing.is_verified && (
                        <>
                          <button
                            onClick={() => handleApprove(listing.id)}
                            disabled={actionLoading[listing.id]}
                            className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded transition disabled:opacity-50"
                          >
                            {actionLoading[listing.id] ? 'Loading...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => setRejectModal(listing.id)}
                            disabled={actionLoading[listing.id]}
                            className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition disabled:opacity-50"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => setRequestChangesModal(listing.id)}
                            disabled={actionLoading[listing.id]}
                            className="px-3 py-1 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded transition disabled:opacity-50"
                          >
                            Request Changes
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setDeleteConfirm(listing.id)}
                        className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {indexOfFirstListing + 1}-{Math.min(indexOfLastListing, filteredListings.length)} of {filteredListings.length} listings
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {filteredListings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No listings found</p>
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
                <h3 className="text-2xl font-bold text-gray-900">Listing Details</h3>
                <button
                  onClick={() => setViewingListing(null) }
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Close
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
                      <p className="text-gray-900 mt-1">
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
                      <p className="text-gray-900 mt-1">
                        {viewingListing.bedrooms || 0} Beds
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Bathrooms:</span>
                      <p className="text-gray-900 mt-1">
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
                    <button
                      onClick={() => {
                        setRejectModal(viewingListing.id)
                        setViewingListing(null)
                      }}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        setRequestChangesModal(viewingListing.id)
                        setViewingListing(null)
                      }}
                      className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                    >
                      Request Changes
                    </button>
                    <button
                      onClick={() => {
                        handleApprove(viewingListing.id)
                        setViewingListing(null)
                      }}
                      disabled={actionLoading[viewingListing.id]}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {actionLoading[viewingListing.id] ? 'Approving...' : 'Approve'}
                    </button>
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
                  {actionLoading[requestChangesModal] ? 'Sending...' : 'Request Changes'}
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
                  {actionLoading[rejectModal] ? 'Rejecting...' : 'Reject'}
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
                  {saving ? 'Deleting...' : 'Delete'}
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
