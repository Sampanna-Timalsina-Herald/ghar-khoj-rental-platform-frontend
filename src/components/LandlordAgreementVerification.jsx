import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../../api/axios'
import { 
  AlertCircle, Loader2, Edit2, Check, X, 
  Home, User, Calendar, DollarSign, FileText,
  CheckCircle, Clock, Shield, Briefcase, Eye, EyeOff
} from 'lucide-react'

const LandlordAgreementVerification = ({ agreementId, onApprove, onCancel }) => {
  const [agreement, setAgreement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState(null)
  const [editedData, setEditedData] = useState({})
  const [requirements, setRequirements] = useState({
    noticePeriod: 30,
    maintenanceFee: 5,
    parkingFee: 0,
    allowPets: false,
    guestPolicy: 'Limited - weekend only',
    renewalTerms: 'Month-to-month after initial term'
  })
  const [editingRequirements, setEditingRequirements] = useState(false)

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
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <FileText size={32} />
              <h1 className="text-3xl font-bold">Agreement Request Review</h1>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-blue-100">Tenant has submitted a rental agreement for your review and approval</p>
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Agreement Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tenant Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                <User className="text-blue-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Tenant Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-sm text-gray-600 font-medium mb-2">Full Name</p>
                  <p className="text-lg font-semibold text-gray-900">{agreement.tenant_name}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-sm text-gray-600 font-medium mb-2">Email Address</p>
                  <p className="text-lg font-semibold text-gray-900">{agreement.tenant_email}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-sm text-gray-600 font-medium mb-2">Phone Number</p>
                  <p className="text-lg font-semibold text-gray-900">{agreement.tenant_phone || 'Not provided'}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-sm text-gray-600 font-medium mb-2">Member Since</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {agreement.tenant_created_at ? new Date(agreement.tenant_created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Property Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                <Home className="text-green-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Property Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 bg-green-50 rounded-lg p-4 border border-green-100">
                  <p className="text-sm text-gray-600 font-medium mb-2">Property Name</p>
                  <p className="text-lg font-semibold text-gray-900">{agreement.listing_title}</p>
                </div>
                <div className="md:col-span-2 bg-green-50 rounded-lg p-4 border border-green-100">
                  <p className="text-sm text-gray-600 font-medium mb-2">Full Address</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {agreement.property_address}, {agreement.city}, {agreement.state} {agreement.postal_code}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <p className="text-sm text-gray-600 font-medium mb-2">Property Type</p>
                  <p className="text-lg font-semibold text-gray-900">{agreement.property_type || '2 BHK Apartment'}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <p className="text-sm text-gray-600 font-medium mb-2">Built-up Area</p>
                  <p className="text-lg font-semibold text-gray-900">{agreement.property_area || '800 sqft'}</p>
                </div>
              </div>
            </motion.div>

            {/* Rental Terms Card - Editable */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Calendar className="text-orange-600" size={24} />
                  <h3 className="text-xl font-bold text-gray-900">Rental Terms</h3>
                </div>
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
                  {editing ? 'Done' : 'Edit'}
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div className={`rounded-lg p-4 border ${editing ? 'bg-yellow-50 border-yellow-200' : 'bg-orange-50 border-orange-100'}`}>
                  <label className="text-sm text-gray-600 font-medium block mb-2">Move-in Date</label>
                  {editing ? (
                    <input
                      type="date"
                      value={editedData.start_date}
                      onChange={(e) => setEditedData({ ...editedData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-orange-600 mt-2">
                      {startDate.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                </div>

                {/* End Date */}
                <div className={`rounded-lg p-4 border ${editing ? 'bg-yellow-50 border-yellow-200' : 'bg-purple-50 border-purple-100'}`}>
                  <label className="text-sm text-gray-600 font-medium block mb-2">Move-out Date</label>
                  {editing ? (
                    <input
                      type="date"
                      value={editedData.end_date}
                      onChange={(e) => setEditedData({ ...editedData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-purple-600 mt-2">
                      {endDate.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                  <p className="text-sm text-gray-600 font-medium mb-2">Lease Duration</p>
                  <p className="text-2xl font-bold text-indigo-600 mt-2">{duration} months</p>
                </div>

                {/* Monthly Rent */}
                <div className={`rounded-lg p-4 border ${editing ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-100'}`}>
                  <label className="text-sm text-gray-600 font-medium block mb-2">Monthly Rent</label>
                  {editing ? (
                    <input
                      type="number"
                      value={editedData.monthly_rent}
                      onChange={(e) => setEditedData({ ...editedData, monthly_rent: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-red-600 mt-2">
                      Rs. {Number(editedData.monthly_rent).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Security Deposit */}
                <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
                  <p className="text-sm text-gray-600 font-medium mb-2">Security Deposit</p>
                  <p className="text-2xl font-bold text-pink-600 mt-2">
                    Rs. {Number(agreement.deposit).toLocaleString()}
                  </p>
                </div>

                {/* Total Amount */}
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                  <p className="text-sm text-gray-600 font-medium mb-2">Total Payment</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-2">
                    Rs. {(Number(editedData.monthly_rent) * duration + Number(agreement.deposit)).toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Additional Terms */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                <FileText className="text-teal-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Additional Terms & Conditions</h3>
              </div>
              {editing ? (
                <textarea
                  value={editedData.terms}
                  onChange={(e) => setEditedData({ ...editedData, terms: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600 min-h-[150px] font-medium text-gray-700"
                  placeholder="Add or edit any special terms or conditions..."
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 min-h-[150px] border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    {agreement.terms || 'No additional terms specified by tenant'}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Verification Checklist */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-green-50 border-2 border-green-200 rounded-xl p-6"
            >
              <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2 text-lg">
                <CheckCircle size={20} />
                Before You Approve - Verification Checklist
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-green-800 cursor-pointer hover:bg-green-100 p-2 rounded-lg transition">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                  <span className="font-medium">Tenant identity and contact details verified</span>
                </label>
                <label className="flex items-center gap-3 text-green-800 cursor-pointer hover:bg-green-100 p-2 rounded-lg transition">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                  <span className="font-medium">Rental terms are acceptable</span>
                </label>
                <label className="flex items-center gap-3 text-green-800 cursor-pointer hover:bg-green-100 p-2 rounded-lg transition">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                  <span className="font-medium">Property availability confirmed for this period</span>
                </label>
                <label className="flex items-center gap-3 text-green-800 cursor-pointer hover:bg-green-100 p-2 rounded-lg transition">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                  <span className="font-medium">Deposit and rent amount finalized</span>
                </label>
                <label className="flex items-center gap-3 text-green-800 cursor-pointer hover:bg-green-100 p-2 rounded-lg transition">
                  <input type="checkbox" className="w-5 h-5 rounded" />
                  <span className="font-medium">No existing disputes or issues with tenant</span>
                </label>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Landlord Requirements */}
          <div className="space-y-6">
            {/* Landlord Requirements Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-md p-6 sticky top-8"
            >
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Shield className="text-primary-600" size={24} />
                  <h3 className="text-lg font-bold text-gray-900">Your Requirements</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditingRequirements(!editingRequirements)}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-1 transition-all ${
                    editingRequirements
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  <Edit2 size={14} />
                  {editingRequirements ? 'Save' : 'Edit'}
                </motion.button>
              </div>

              <div className="space-y-4">
                {/* Notice Period */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <label className="text-sm text-gray-600 font-semibold block mb-2">Notice Period (days)</label>
                  {editingRequirements ? (
                    <input
                      type="number"
                      value={requirements.noticePeriod}
                      onChange={(e) => setRequirements({ ...requirements, noticePeriod: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                    />
                  ) : (
                    <p className="text-lg font-bold text-blue-700">{requirements.noticePeriod} days</p>
                  )}
                  <p className="text-xs text-gray-600 mt-1">Minimum notice for termination</p>
                </div>

                {/* Maintenance Fee */}
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                  <label className="text-sm text-gray-600 font-semibold block mb-2">Maintenance Fee (%)</label>
                  {editingRequirements ? (
                    <input
                      type="number"
                      step="0.1"
                      value={requirements.maintenanceFee}
                      onChange={(e) => setRequirements({ ...requirements, maintenanceFee: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-600"
                    />
                  ) : (
                    <p className="text-lg font-bold text-amber-700">{requirements.maintenanceFee}% of rent</p>
                  )}
                  <p className="text-xs text-gray-600 mt-1">Additional charge for upkeep</p>
                </div>

                {/* Parking Fee */}
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                  <label className="text-sm text-gray-600 font-semibold block mb-2">Parking Fee (monthly)</label>
                  {editingRequirements ? (
                    <input
                      type="number"
                      value={requirements.parkingFee}
                      onChange={(e) => setRequirements({ ...requirements, parkingFee: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                    />
                  ) : (
                    <p className="text-lg font-bold text-purple-700">Rs. {requirements.parkingFee}</p>
                  )}
                  <p className="text-xs text-gray-600 mt-1">If applicable</p>
                </div>

                {/* Pet Policy */}
                <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                  <label className="text-sm text-gray-600 font-semibold block mb-2 flex items-center gap-2">
                    <span>Pets Allowed</span>
                  </label>
                  {editingRequirements ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setRequirements({ ...requirements, allowPets: true })}
                        className={`flex-1 px-3 py-2 rounded-lg font-semibold transition-all ${
                          requirements.allowPets
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setRequirements({ ...requirements, allowPets: false })}
                        className={`flex-1 px-3 py-2 rounded-lg font-semibold transition-all ${
                          !requirements.allowPets
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <p className={`text-lg font-bold ${requirements.allowPets ? 'text-green-700' : 'text-red-700'}`}>
                      {requirements.allowPets ? '✓ Yes' : '✗ No'}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 mt-1">Policy for pets in property</p>
                </div>

                {/* Guest Policy */}
                <div className="bg-cyan-50 rounded-lg p-3 border border-cyan-100">
                  <label className="text-sm text-gray-600 font-semibold block mb-2">Guest Policy</label>
                  {editingRequirements ? (
                    <textarea
                      value={requirements.guestPolicy}
                      onChange={(e) => setRequirements({ ...requirements, guestPolicy: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-600 min-h-[60px] text-sm"
                      placeholder="Describe your guest policy..."
                    />
                  ) : (
                    <p className="text-sm font-medium text-cyan-900">{requirements.guestPolicy}</p>
                  )}
                  <p className="text-xs text-gray-600 mt-1">Rules for guest visits</p>
                </div>

                {/* Renewal Terms */}
                <div className="bg-teal-50 rounded-lg p-3 border border-teal-100">
                  <label className="text-sm text-gray-600 font-semibold block mb-2">Renewal Terms</label>
                  {editingRequirements ? (
                    <textarea
                      value={requirements.renewalTerms}
                      onChange={(e) => setRequirements({ ...requirements, renewalTerms: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-600 min-h-[60px] text-sm"
                      placeholder="Describe renewal terms..."
                    />
                  ) : (
                    <p className="text-sm font-medium text-teal-900">{requirements.renewalTerms}</p>
                  )}
                  <p className="text-xs text-gray-600 mt-1">Terms after initial lease ends</p>
                </div>
              </div>

              {/* Summary Box */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mt-4 border border-blue-200">
                <p className="text-xs text-gray-600 font-medium mb-2">💡 TIP:</p>
                <p className="text-sm text-gray-700">
                  Your requirements will be included in the final agreement. Make sure they are clearly defined before approving.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-between max-w-5xl mx-auto"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            disabled={approving}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <X size={18} />
            Review Later
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleApprove}
            disabled={approving}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {approving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing Approval...
              </>
            ) : (
              <>
                <Check size={18} />
                Approve Agreement & Send to Admin
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Information Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 rounded-lg p-6 max-w-5xl mx-auto"
        >
          <p className="text-sm text-blue-900">
            <strong className="block mb-2">ℹ️ Next Steps After Approval:</strong>
            <span className="block mb-2">1. The agreement will be forwarded to KHOJGHAR admin team for final verification</span>
            <span className="block mb-2">2. Admin will confirm the lease agreement with both parties</span>
            <span className="block">3. Both you and the tenant will receive confirmation emails with the finalized agreement</span>
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default LandlordAgreementVerification
