import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../../api/axios'
import { AlertCircle, Loader2, Edit2, Check } from 'lucide-react'

const LandlordAgreementVerification = ({ agreementId, onApprove, onCancel }) => {
  const [agreement, setAgreement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState(null)
  const [editedData, setEditedData] = useState({})

  useEffect(() => {
    fetchAgreement()
  }, [agreementId])

  const fetchAgreement = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/rent-agreements/draft/${agreementId}`)
      setAgreement(response.data.agreement)
      setEditedData({
        start_date: response.data.agreement.start_date,
        end_date: response.data.agreement.end_date,
        monthly_rent: response.data.agreement.monthly_rent,
        terms: response.data.agreement.terms || ''
      })
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load agreement')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    setApproving(true)
    try {
      const response = await api.post(`/rent-agreements/${agreementId}/landlord-approve`, 
        editing ? editedData : {}
      )
      
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

  const startDate = new Date(editedData.start_date)
  const endDate = new Date(editedData.end_date)
  const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24 * 30))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-text mb-2">Verify & Approve Rental Agreement</h2>
        <p className="text-gray-600">Review tenant details and verify the agreement terms. You can edit terms if needed.</p>
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

      {/* Agreement Details */}
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        {/* Tenant Information */}
        <div>
          <h3 className="text-xl font-bold text-text mb-4 pb-3 border-b border-gray-200 flex items-center gap-2">
            <span>👤 Tenant Information</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium">Name</p>
              <p className="text-lg font-semibold text-text mt-2">{agreement.tenant_name}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium">Email</p>
              <p className="text-lg font-semibold text-text mt-2">{agreement.tenant_email}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium">Phone</p>
              <p className="text-lg font-semibold text-text mt-2">{agreement.tenant_phone || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Property Information */}
        <div>
          <h3 className="text-xl font-bold text-text mb-4 pb-3 border-b border-gray-200 flex items-center gap-2">
            <span>🏠 Property Information</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">Property</p>
              <p className="text-lg font-semibold text-text mt-1">{agreement.listing_title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Address</p>
              <p className="text-lg font-semibold text-text mt-1">
                {agreement.property_address}, {agreement.city}
              </p>
            </div>
          </div>
        </div>

        {/* Rental Terms - Editable */}
        <div>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
            <h3 className="text-xl font-bold text-text">📋 Rental Terms</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditing(!editing)}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                editing
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Edit2 size={16} />
              {editing ? 'Done Editing' : 'Edit Terms'}
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
            <div className={`rounded-lg p-4 ${editing ? 'bg-yellow-50' : 'bg-blue-50'}`}>
              <label className="text-sm text-gray-600 font-medium block mb-2">Start Date</label>
              {editing ? (
                <input
                  type="date"
                  value={editedData.start_date}
                  onChange={(e) => setEditedData({ ...editedData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
                />
              ) : (
                <p className="text-2xl font-bold text-primary-600 mt-2">
                  {startDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              )}
            </div>

            {/* End Date */}
            <div className={`rounded-lg p-4 ${editing ? 'bg-yellow-50' : 'bg-green-50'}`}>
              <label className="text-sm text-gray-600 font-medium block mb-2">End Date</label>
              {editing ? (
                <input
                  type="date"
                  value={editedData.end_date}
                  onChange={(e) => setEditedData({ ...editedData, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
                />
              ) : (
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {endDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              )}
            </div>

            {/* Duration */}
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium">Duration</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">{duration} months</p>
            </div>

            {/* Monthly Rent */}
            <div className={`rounded-lg p-4 ${editing ? 'bg-yellow-50' : 'bg-orange-50'}`}>
              <label className="text-sm text-gray-600 font-medium block mb-2">Monthly Rent</label>
              {editing ? (
                <input
                  type="number"
                  value={editedData.monthly_rent}
                  onChange={(e) => setEditedData({ ...editedData, monthly_rent: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
                />
              ) : (
                <p className="text-2xl font-bold text-orange-600 mt-2">
                  Rs. {Number(editedData.monthly_rent).toLocaleString()}
                </p>
              )}
            </div>

            {/* Deposit */}
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium">Security Deposit</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                Rs. {Number(agreement.deposit).toLocaleString()}
              </p>
            </div>

            {/* Total */}
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium">Total Payment</p>
              <p className="text-2xl font-bold text-indigo-600 mt-2">
                Rs. {(Number(editedData.monthly_rent) * duration + Number(agreement.deposit)).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Terms */}
        {editing || agreement.terms ? (
          <div>
            <h3 className="text-lg font-bold text-text mb-3">Additional Terms & Conditions</h3>
            {editing ? (
              <textarea
                value={editedData.terms}
                onChange={(e) => setEditedData({ ...editedData, terms: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600 min-h-[150px]"
                placeholder="Add any special terms or conditions..."
              />
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{agreement.terms || 'No additional terms'}</p>
              </div>
            )}
          </div>
        ) : null}

        {/* Checklist */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-green-900 mb-3">✓ Verification Checklist</h3>
          <label className="flex items-center gap-3 text-green-800">
            <input type="checkbox" defaultChecked className="w-5 h-5" />
            <span>Tenant details verified</span>
          </label>
          <label className="flex items-center gap-3 text-green-800">
            <input type="checkbox" defaultChecked className="w-5 h-5" />
            <span>Rental terms are acceptable</span>
          </label>
          <label className="flex items-center gap-3 text-green-800">
            <input type="checkbox" defaultChecked className="w-5 h-5" />
            <span>Property availability confirmed</span>
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
          disabled={approving}
          className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {approving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Approving...
            </>
          ) : (
            <>
              <Check size={18} />
              Approve & Send to Admin
            </>
          )}
        </motion.button>
      </div>

      {/* Status Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>ℹ️ Next Step:</strong> After you approve, this agreement will be sent to KHOJGHAR admin 
          team for final verification and confirmation.
        </p>
      </div>
    </motion.div>
  )
}

export default LandlordAgreementVerification
