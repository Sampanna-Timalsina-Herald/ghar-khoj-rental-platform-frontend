import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Clock, CheckCircle, AlertCircle, X, Send, ThumbsUp, Download, Trash2 } from 'lucide-react'
import api from '../../api/axios'
import { toast } from 'sonner'

const TenantAgreements = () => {
  const navigate = useNavigate()
  const [agreements, setAgreements] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAgreement, setSelectedAgreement] = useState(null)
  const [approving, setApproving] = useState(false)
  const [downloadingPDF, setDownloadingPDF] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    fetchAgreements()
  }, [])

  const fetchAgreements = async () => {
    try {
      setLoading(true)
      const response = await api.get('/agreements')
      const allAgreements = Array.isArray(response.data) ? response.data : response.data.data || []
      // Filter only tenant agreements
      setAgreements(allAgreements)
      if (allAgreements.length === 0) {
        toast.info('No agreements found')
      }
    } catch (error) {
      console.error('Failed to fetch agreements:', error)
      toast.error(error.response?.data?.message || 'Failed to load agreements')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />
      case 'for_review':
        return <FileText className="text-blue-500" size={20} />
      case 'pending_approval':
        return <AlertCircle className="text-orange-500" size={20} />
      case 'accepted':
        return <AlertCircle className="text-orange-500" size={20} />
      case 'tenant_accepted':
        return <Clock className="text-blue-500" size={20} />
      case 'approved':
        return <CheckCircle className="text-green-500" size={20} />
      case 'active':
        return <CheckCircle className="text-green-500" size={20} />
      case 'rejected':
        return <X className="text-red-500" size={20} />
      default:
        return <FileText className="text-gray-500" size={20} />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200'
      case 'for_review':
        return 'bg-blue-50 border-blue-200'
      case 'pending_approval':
        return 'bg-orange-50 border-orange-200'
      case 'accepted':
        return 'bg-orange-50 border-orange-200'
      case 'tenant_accepted':
        return 'bg-sky-50 border-sky-200'
      case 'approved':
        return 'bg-green-50 border-green-200'
      case 'active':
        return 'bg-green-50 border-green-200'
      case 'rejected':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Waiting for Landlord'
      case 'for_review':
        return 'Ready for Your Review'
      case 'pending_approval':
        return 'Ready to Accept'
      case 'accepted':
        return 'Ready to Accept'
      case 'tenant_accepted':
        return 'Waiting Landlord Verification'
      case 'approved':
        return 'Approved & Confirmed'
      case 'active':
        return 'Active Rental'
      case 'rejected':
        return 'Rejected'
      default:
        return status
    }
  }

  const handleRequestApproval = async (agreementId) => {
    setApproving(true)
    try {
      await api.put(`/agreements/${agreementId}/request-approval`)
      toast.success('✅ Approval requested! Landlord will review soon.')
      fetchAgreements()
      setSelectedAgreement(null)
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to request approval'
      toast.error(errorMsg)
      console.error('Request approval error:', error)
    } finally {
      setApproving(false)
    }
  }

  const handleAcceptAgreement = async (agreementId) => {
    try {
      const agreement = agreements.find(a => a.id === agreementId)
      if (!agreement) {
        throw new Error('Agreement not found')
      }

      const bookingsResponse = await api.get('/bookings/my-bookings')
      const booking = bookingsResponse.data.data?.find(
        b => b.listing_id === agreement.listing_id && ['approved', 'tenant_accepted', 'active'].includes(b.status)
      )

      if (!booking) {
        throw new Error('No approved booking found for this agreement')
      }

      navigate(`/tenant/rent-flow/${booking.id}`)
      setSelectedAgreement(null)
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to accept agreement'
      toast.error(errorMsg)
      console.error('Accept agreement error:', error)
    }
  }

  const handleDownloadPDF = async (agreementId) => {
    setDownloadingPDF(true)
    try {
      const response = await api.post(`/agreements/${agreementId}/generate-pdf`, {}, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `agreement-${agreementId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('📄 PDF downloaded successfully')
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to download PDF'
      toast.error(errorMsg)
      console.error('Download PDF error:', error)
    } finally {
      setDownloadingPDF(false)
    }
  }

  const handleDeleteAgreement = async (agreementId) => {
    setDeleting(true)
    try {
      await api.delete(`/agreements/${agreementId}`)
      toast.success('✅ Agreement deleted successfully')
      fetchAgreements()
      setSelectedAgreement(null)
      setShowDeleteConfirm(false)
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete agreement'
      toast.error(errorMsg)
      console.error('Delete agreement error:', error)
    } finally {
      setDeleting(false)
    }
  }

  const confirmDelete = () => {
    toast.info('⚠️ Click "Confirm Delete" button to permanently delete this agreement')
    setShowDeleteConfirm(true)
    setTimeout(() => setShowDeleteConfirm(false), 5000) // Reset after 5 seconds
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (agreements.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <FileText size={40} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Agreements Yet</h3>
        <p className="text-gray-600">Request a rental agreement when you find a property you like.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rental Agreements</h2>
          <p className="text-gray-600 text-sm mt-1">
            {agreements.length} {agreements.length === 1 ? 'agreement' : 'agreements'}
          </p>
        </div>
      </div>
      
      <div className="grid gap-4">
        {agreements.map((agreement) => (
          <motion.div
            key={agreement.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${getStatusColor(agreement.status)}`}
            onClick={() => setSelectedAgreement(agreement)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getStatusIcon(agreement.status)}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{agreement.listing?.title || 'Property'}</h3>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Move-in:</span> {agreement.start_date}
                    </div>
                    <div>
                      <span className="font-medium">Move-out:</span> {agreement.end_date}
                    </div>
                    <div>
                      <span className="font-medium">Rent:</span> Rs. {agreement.monthly_rent}/month
                    </div>
                    <div>
                      <span className="font-medium">Deposit:</span> Rs. {agreement.deposit}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-white bg-opacity-70 rounded-full text-sm font-medium text-gray-700">
                  {getStatusText(agreement.status)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Agreement Detail Modal */}
      <AnimatePresence>
        {selectedAgreement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Agreement Details</h2>
                <button
                  onClick={() => setSelectedAgreement(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Property Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Property</span>
                      <p className="font-medium text-gray-900">{selectedAgreement.listing?.title || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status</span>
                      <p className="font-medium text-gray-900">{getStatusText(selectedAgreement.status)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Move-in Date</span>
                      <p className="font-medium text-gray-900">{selectedAgreement.start_date}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Move-out Date</span>
                      <p className="font-medium text-gray-900">{selectedAgreement.end_date}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Monthly Rent</span>
                      <p className="font-medium text-gray-900">Rs. {selectedAgreement.monthly_rent}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Security Deposit</span>
                      <p className="font-medium text-gray-900">Rs. {selectedAgreement.deposit}</p>
                    </div>
                  </div>
                </div>

                {selectedAgreement.terms && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h4>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{selectedAgreement.terms}</p>
                  </div>
                )}

                {selectedAgreement.rejection_reason && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-900 mb-2">Rejection Reason</h4>
                    <p className="text-red-700 text-sm">{selectedAgreement.rejection_reason}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end flex-wrap">
                <button
                  onClick={() => setSelectedAgreement(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Close
                </button>

                {selectedAgreement.status === 'rejected' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => showDeleteConfirm ? handleDeleteAgreement(selectedAgreement.id) : confirmDelete()}
                    disabled={deleting}
                    className={`px-4 py-2 ${showDeleteConfirm ? 'bg-red-700 animate-pulse' : 'bg-red-600'} text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2 disabled:opacity-50`}
                  >
                    <Trash2 size={18} />
                    {deleting ? 'Deleting...' : showDeleteConfirm ? 'Confirm Delete?' : 'Delete Agreement'}
                  </motion.button>
                )}

                {selectedAgreement.status !== 'pending' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDownloadPDF(selectedAgreement.id)}
                    disabled={downloadingPDF}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    <Download size={18} />
                    {downloadingPDF ? 'Downloading...' : 'Download PDF'}
                  </motion.button>
                )}
                
                {selectedAgreement.status === 'for_review' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRequestApproval(selectedAgreement.id)}
                    disabled={approving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send size={18} />
                    {approving ? 'Requesting...' : 'Request Approval'}
                  </motion.button>
                )}

                {(selectedAgreement.status === 'pending_approval' || selectedAgreement.status === 'accepted') && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAcceptAgreement(selectedAgreement.id)}
                    disabled={approving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    <ThumbsUp size={18} />
                    Accept Agreement
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TenantAgreements
