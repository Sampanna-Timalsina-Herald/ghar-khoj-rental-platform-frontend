import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api/axios'
import { CheckCircle, AlertCircle, Loader2, Download, Eye } from 'lucide-react'

const TenantAgreementReview = ({ agreementId, onApprove, onCancel }) => {
  const [agreement, setAgreement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const [read, setRead] = useState(false)
  const [error, setError] = useState(null)

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

  const handleApprove = async () => {
    if (!read) {
      setError('Please confirm you have read and understood the agreement')
      return
    }

    setApproving(true)
    try {
      const response = await api.post(`/rent-agreements/${agreementId}/tenant-approve`)
      
      if (onApprove) {
        onApprove(response.data.agreement)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve agreement')
    } finally {
      setApproving(false)
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
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-text mb-2">Rental Agreement Review</h2>
        <p className="text-gray-600">Please carefully review the terms below before confirming.</p>
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

      {/* Agreement Details Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        {/* Property Information */}
        <div>
          <h3 className="text-xl font-bold text-text mb-4 pb-3 border-b border-gray-200">
            Property Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">Property Name</p>
              <p className="text-lg font-semibold text-text mt-1">{agreement.listing_title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Address</p>
              <p className="text-lg font-semibold text-text mt-1">
                {agreement.property_address}, {agreement.city}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Landlord Name</p>
              <p className="text-lg font-semibold text-text mt-1">{agreement.landlord_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Landlord Email</p>
              <p className="text-lg font-semibold text-text mt-1">{agreement.landlord_email}</p>
            </div>
          </div>
        </div>

        {/* Rental Terms */}
        <div>
          <h3 className="text-xl font-bold text-text mb-4 pb-3 border-b border-gray-200">
            Rental Terms
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium">Start Date</p>
              <p className="text-2xl font-bold text-primary-600 mt-2">
                {startDate.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium">End Date</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {endDate.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium">Duration</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {duration} months
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium">Monthly Rent</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">
                Rs. {Number(agreement.monthly_rent).toLocaleString()}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium">Security Deposit</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                Rs. {Number(agreement.deposit).toLocaleString()}
              </p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium">Total Payment</p>
              <p className="text-2xl font-bold text-indigo-600 mt-2">
                Rs. {(Number(agreement.monthly_rent) * duration + Number(agreement.deposit)).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        {agreement.terms && (
          <div>
            <h3 className="text-xl font-bold text-text mb-4 pb-3 border-b border-gray-200">
              Additional Terms & Conditions
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-wrap">{agreement.terms}</p>
            </div>
          </div>
        )}

        {/* Confirmation Checkbox */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-4">
          <label className="flex items-start gap-4 cursor-pointer">
            <input
              type="checkbox"
              checked={read}
              onChange={(e) => setRead(e.target.checked)}
              className="mt-1 w-5 h-5 border-2 border-primary-600 rounded cursor-pointer accent-primary-600"
            />
            <span className="text-gray-700">
              <strong>I have read and understood the rental agreement</strong>
              <p className="text-sm text-gray-600 mt-1">
                By checking this box, you confirm that you have carefully reviewed all terms and conditions 
                and agree to proceed with this rental arrangement.
              </p>
            </span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCancel}
          disabled={approving}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleApprove}
          disabled={!read || approving}
          className={`px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
            read
              ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {approving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Approving...
            </>
          ) : (
            <>
              <CheckCircle size={18} />
              I Have Read & Agree
            </>
          )}
        </motion.button>
      </div>

      {/* Status Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>ℹ️ Status:</strong> Once approved, this agreement will be sent to your landlord 
          for verification. You will be notified when the landlord approves it.
        </p>
      </div>
    </motion.div>
  )
}

export default TenantAgreementReview
