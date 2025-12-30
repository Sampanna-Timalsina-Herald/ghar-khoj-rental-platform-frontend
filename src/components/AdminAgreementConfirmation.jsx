import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../../api/axios'
import { AlertCircle, Loader2, CheckCircle, XCircle, Download } from 'lucide-react'

const AdminAgreementConfirmation = ({ agreementId, onConfirm, onReject }) => {
  const [agreement, setAgreement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState(null)
  const [checked, setChecked] = useState({
    ownership: false,
    availability: false,
    duration: false,
    noConflict: false
  })

  useEffect(() => {
    fetchAgreement()
  }, [agreementId])

  const fetchAgreement = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/rent-agreements/draft/${agreementId}`)
      setAgreement(response.data.agreement)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load agreement')
    } finally {
      setLoading(false)
    }
  }

  const allChecked = Object.values(checked).every(v => v)

  const handleConfirm = async () => {
    if (!allChecked) {
      setError('Please complete all verification checks')
      return
    }

    setConfirming(true)
    try {
      const response = await api.post(`/rent-agreements/${agreementId}/admin-confirm`)
      
      if (onConfirm) {
        onConfirm(response.data.agreement)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to confirm agreement')
    } finally {
      setConfirming(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    )
  }

  if (!agreement) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="mx-auto mb-3 text-red-600" size={32} />
        <p className="text-red-700 font-semibold">Agreement not found</p>
      </div>
    )
  }

  const startDate = new Date(agreement.start_date)
  const endDate = new Date(agreement.end_date)
  const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24 * 30))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">🔐 Admin Agreement Confirmation</h2>
        <p>Final verification before activating the rental agreement</p>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700"
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        {/* Status Badge */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">⏳</div>
          <div>
            <p className="font-semibold text-yellow-900">Awaiting Final Confirmation</p>
            <p className="text-sm text-yellow-800">Once confirmed, this agreement will be activated and both parties notified</p>
          </div>
        </div>

        {/* Parties Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tenant */}
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <h3 className="font-bold text-blue-900 mb-3">👤 Tenant</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {agreement.tenant_name}</p>
              <p><strong>Email:</strong> {agreement.tenant_email}</p>
              <p><strong>Status:</strong> <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Approved</span></p>
            </div>
          </div>

          {/* Landlord */}
          <div className="border border-green-200 rounded-lg p-4 bg-green-50">
            <h3 className="font-bold text-green-900 mb-3">🏠 Landlord</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {agreement.landlord_name}</p>
              <p><strong>Email:</strong> {agreement.landlord_email}</p>
              <p><strong>Status:</strong> <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Approved</span></p>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
          <h3 className="font-bold text-purple-900 mb-3">📋 Property Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <p><strong>Property:</strong> {agreement.listing_title}</p>
            <p><strong>Address:</strong> {agreement.property_address}, {agreement.city}</p>
            <p><strong>Start Date:</strong> {startDate.toLocaleDateString()}</p>
            <p><strong>End Date:</strong> {endDate.toLocaleDateString()}</p>
            <p><strong>Duration:</strong> {duration} months</p>
            <p><strong>Monthly Rent:</strong> Rs. {Number(agreement.monthly_rent).toLocaleString()}</p>
          </div>
        </div>

        {/* Verification Checklist */}
        <div>
          <h3 className="text-lg font-bold text-text mb-4">✓ Verification Checklist</h3>
          <div className="space-y-3">
            {/* Property Ownership */}
            <label className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={checked.ownership}
                onChange={(e) => setChecked({ ...checked, ownership: e.target.checked })}
                className="mt-1 w-5 h-5 accent-primary-600 cursor-pointer"
              />
              <div className="flex-1">
                <p className="font-semibold text-text">Property Ownership Verified</p>
                <p className="text-sm text-gray-600">Confirm landlord owns/manages this property</p>
              </div>
              {checked.ownership && <CheckCircle className="text-green-600 flex-shrink-0" size={20} />}
            </label>

            {/* Availability */}
            <label className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={checked.availability}
                onChange={(e) => setChecked({ ...checked, availability: e.target.checked })}
                className="mt-1 w-5 h-5 accent-primary-600 cursor-pointer"
              />
              <div className="flex-1">
                <p className="font-semibold text-text">Property Availability Confirmed</p>
                <p className="text-sm text-gray-600">Property is available for the requested period</p>
              </div>
              {checked.availability && <CheckCircle className="text-green-600 flex-shrink-0" size={20} />}
            </label>

            {/* Duration */}
            <label className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={checked.duration}
                onChange={(e) => setChecked({ ...checked, duration: e.target.checked })}
                className="mt-1 w-5 h-5 accent-primary-600 cursor-pointer"
              />
              <div className="flex-1">
                <p className="font-semibold text-text">Agreement Duration Valid</p>
                <p className="text-sm text-gray-600">Start and end dates are reasonable and valid</p>
              </div>
              {checked.duration && <CheckCircle className="text-green-600 flex-shrink-0" size={20} />}
            </label>

            {/* No Conflict */}
            <label className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={checked.noConflict}
                onChange={(e) => setChecked({ ...checked, noConflict: e.target.checked })}
                className="mt-1 w-5 h-5 accent-primary-600 cursor-pointer"
              />
              <div className="flex-1">
                <p className="font-semibold text-text">No Booking Conflicts</p>
                <p className="text-sm text-gray-600">Property has no overlapping rental agreements</p>
              </div>
              {checked.noConflict && <CheckCircle className="text-green-600 flex-shrink-0" size={20} />}
            </label>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <strong>📧 Notification:</strong> Once confirmed, both the tenant and landlord will receive 
            email notifications about the activated agreement. The property status will be updated to "Rented".
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReject}
          disabled={confirming}
          className="px-6 py-3 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <XCircle className="inline mr-2" size={18} />
          Reject Agreement
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleConfirm}
          disabled={!allChecked || confirming}
          className={`px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
            allChecked
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {confirming ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Confirming...
            </>
          ) : (
            <>
              <CheckCircle size={18} />
              Confirm & Activate Agreement
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}

export default AdminAgreementConfirmation
