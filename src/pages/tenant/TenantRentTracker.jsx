import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, CreditCard, Loader2, Wallet, Clock, CheckCircle, AlertCircle, History, TrendingUp, Home, Eye } from 'lucide-react'
import api from '../../api/axios'
import { processEsewaPayment, processKhaltiPayment } from '../../services/paymentService'
import ReceiptViewerModal from '../../components/ReceiptViewerModal'
import khaltiLogo from '../../assets/khalti-logo.svg'
import esewaLogo from '../../assets/esewa-logo.svg'

const addMonths = (date, months) => {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return next
}

const monthsBetween = (start, end) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  let months = (endDate.getFullYear() - startDate.getFullYear()) * 12
  months += endDate.getMonth() - startDate.getMonth()
  return Math.max(1, months + 1)
}

const TenantRentTracker = () => {
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState([])
  const [payments, setPayments] = useState([])
  const [processing, setProcessing] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showPaymentHistory, setShowPaymentHistory] = useState(false)
  const [showGatewayModal, setShowGatewayModal] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setMessage({ type: '', text: '' })
      
      console.log('[RENT TRACKER] Fetching data...')
      
      const [bookingResponse, paymentsResponse] = await Promise.all([
        api.get('/bookings/my-bookings'),
        api.get('/payments/tenant/rent-payments').catch(err => {
          console.warn('[RENT TRACKER] Payments endpoint failed:', err.message)
          return { data: { data: [] } }
        })
      ])

      const bookingsData = bookingResponse.data?.data || []
      const paymentsData = Array.isArray(paymentsResponse.data?.data) 
        ? paymentsResponse.data.data 
        : (Array.isArray(paymentsResponse.data?.payments) ? paymentsResponse.data.payments : [])

      console.log('[RENT TRACKER] Fetched:')
      console.log('  - Bookings:', bookingsData.length)
      console.log('  - Payments:', paymentsData.length)
      
      setBookings(bookingsData)
      setPayments(paymentsData)
    } catch (error) {
      console.error('[RENT TRACKER] Error:', error)
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || error.message || 'Failed to load rent tracker' 
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Refresh data when user returns to this page (e.g., after payment)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[RENT TRACKER] Page became visible, refreshing data...')
        fetchData()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const activeRentals = useMemo(() => {
    const bookingsArray = Array.isArray(bookings) ? bookings : []
    return bookingsArray.filter((b) => ['active', 'tenant_accepted'].includes(b.status))
  }, [bookings])

  const getCompletedPaymentsForBooking = (bookingId) => {
    // Ensure payments is an array
    const paymentsArray = Array.isArray(payments) ? payments : []
    
    if (paymentsArray.length === 0) {
      console.log('[RENT TRACKER] No payments available')
      return []
    }
    
    const bookingIdStr = String(bookingId).toLowerCase()
    const filtered = paymentsArray.filter((payment) => {
      const paymentRefId = String(payment.reference_id || '').toLowerCase()
      const isCompleted = payment.status === 'completed'
      
      if (paymentRefId === bookingIdStr && isCompleted) {
        console.log('[RENT TRACKER] ✓ Found matching payment for booking:', bookingId)
        return true
      }
      return false
    })
    
    console.log(`[RENT TRACKER] For booking ${bookingId}: Found ${filtered.length} completed payments`)
    return filtered
  }

  const computeNextDue = (booking, paidCount) => {
    const startDate = new Date(booking.start_date)
    return addMonths(startDate, paidCount)
  }

  const handlePay = async (booking, mode) => {
    const paidCount = getCompletedPaymentsForBooking(booking.id).length
    const totalMonths = monthsBetween(booking.start_date, booking.end_date)
    const remainingMonths = Math.max(1, totalMonths - paidCount)

    const amount = mode === 'full'
      ? Number(booking.monthly_rent || 0) * remainingMonths
      : Number(booking.monthly_rent || 0)

    // Store payment details and show gateway selection modal
    setPaymentDetails({
      booking,
      mode,
      amount,
      paidCount
    })
    setShowGatewayModal(true)
  }

  const handleGatewaySelect = async (gateway) => {
    if (!paymentDetails) return

    try {
      setProcessing(paymentDetails.booking.id)
      setShowGatewayModal(false)

      const payload = {
        payment_type: 'commission',
        reference_id: paymentDetails.booking.id,
        amount: paymentDetails.amount,
        gateway: gateway,
        purchase_order_name: paymentDetails.mode === 'full'
          ? `Full Rent Payment - ${paymentDetails.booking.listing_title || 'Property'}`
          : `Monthly Rent Payment - ${paymentDetails.booking.listing_title || 'Property'}`,
        purpose: 'rent',
        booking_id: paymentDetails.booking.id,
        payment_mode: paymentDetails.mode,
        customer_info: {
          name: paymentDetails.booking.tenant_name || 'Tenant',
          email: paymentDetails.booking.tenant_email || 'tenant@example.com',
          phone: paymentDetails.booking.tenant_phone || '9800000000'
        }
      }

      if (gateway === 'khalti') {
        await processKhaltiPayment(payload)
      } else {
        await processEsewaPayment(payload)
      }

      setMessage({ type: 'success', text: `Redirecting to ${gateway === 'khalti' ? 'Khalti' : 'eSewa'} payment...` })
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to initiate payment' })
      setProcessing(null)
    }
  }

  const handleSendReminder = async (booking, dueDate) => {
    try {
      await api.post(`/bookings/${booking.id}/send-rent-reminder`, {
        due_date: dueDate.toISOString()
      })
      setMessage({ type: 'success', text: 'Reminder sent.' })
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to send reminder' })
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="animate-spin text-primary-600" size={40} />
        <p className="text-gray-600">Loading rent tracker...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rent Tracker</h1>
          <p className="text-sm text-gray-600 mt-1">Track your rental payments, history, and upcoming dues</p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <Calendar size={16} /> Refresh
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'} border rounded-lg p-4 text-sm`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Stats Overview */}
      {activeRentals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs">Active Rentals</p>
                <p className="text-2xl font-bold mt-1">{activeRentals.length}</p>
              </div>
              <Home size={32} className="opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs">Total Payments</p>
                <p className="text-2xl font-bold mt-1">{Array.isArray(payments) ? payments.filter(p => p.status === 'completed').length : 0}</p>
              </div>
              <CheckCircle size={32} className="opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs">Total Paid</p>
                <p className="text-2xl font-bold mt-1">
                  Rs. {Array.isArray(payments) ? payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString() : '0'}
                </p>
              </div>
              <TrendingUp size={32} className="opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-xs">Upcoming Dues</p>
                <p className="text-2xl font-bold mt-1">
                  {activeRentals.filter(b => {
                    const completedPayments = getCompletedPaymentsForBooking(b.id)
                    const nextDue = computeNextDue(b, completedPayments.length)
                    const daysUntilDue = Math.ceil((nextDue - new Date()) / (1000 * 60 * 60 * 24))
                    return daysUntilDue <= 7 && daysUntilDue >= 0
                  }).length}
                </p>
              </div>
              <Clock size={32} className="opacity-80" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Active Rentals */}
      {activeRentals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-gray-200 rounded-xl p-12 text-center"
        >
          <Home size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Rentals</h3>
          <p className="text-gray-600">You don't have any active rental agreements yet.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Active Rentals</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeRentals.map((booking, index) => {
              const completedPayments = getCompletedPaymentsForBooking(booking.id)
              const nextDue = computeNextDue(booking, completedPayments.length)
              const daysUntilDue = Math.ceil((nextDue - new Date()) / (1000 * 60 * 60 * 24))
              const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0
              const isOverdue = daysUntilDue < 0
              const totalMonths = monthsBetween(booking.start_date, booking.end_date)
              const remainingMonths = Math.max(0, totalMonths - completedPayments.length)
              const progressPercentage = (completedPayments.length / totalMonths) * 100

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Property Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{booking.listing_title || 'Property'}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {booking.listing_address}, {booking.listing_city}
                      </p>
                    </div>
                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      {booking.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Rental Period */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Start Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(booking.start_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="font-semibold text-gray-900">{totalMonths} months</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">End Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(booking.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Payment Progress</span>
                      <span className="font-semibold text-gray-900">
                        {completedPayments.length} / {totalMonths} months
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-600 font-medium">Next Due Date</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {nextDue.toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {daysUntilDue > 0 ? `in ${daysUntilDue} days` : isOverdue ? 'Overdue!' : 'Today'}
                      </p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs text-green-600 font-medium">Monthly Rent</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        Rs. {Number(booking.monthly_rent || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">per month</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-xs text-purple-600 font-medium">Total Paid</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        Rs. {(completedPayments.length * Number(booking.monthly_rent || 0)).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{completedPayments.length} payments</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs text-amber-600 font-medium">Remaining</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        Rs. {(remainingMonths * Number(booking.monthly_rent || 0)).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{remainingMonths} months</p>
                    </div>
                  </div>

                  {/* Alert for Due/Overdue */}
                  {(isDueSoon || isOverdue) && (
                    <div className={`rounded-lg p-3 mb-4 flex items-start gap-2 ${
                      isOverdue 
                        ? 'bg-red-50 text-red-700 border border-red-200' 
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">
                          {isOverdue ? 'Payment Overdue!' : 'Payment Due Soon'}
                        </p>
                        <p className="text-xs mt-1">
                          {isOverdue 
                            ? 'Please pay immediately to avoid penalties.' 
                            : `Payment due in ${daysUntilDue} day(s). Pay now to avoid late fees.`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handlePay(booking, 'monthly')}
                      disabled={processing === booking.id}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CreditCard size={16} /> Pay Monthly
                    </button>
                    <button
                      onClick={() => handlePay(booking, 'full')}
                      disabled={processing === booking.id}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Wallet size={16} /> Pay Full
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBooking(booking)
                        setShowPaymentHistory(true)
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <History size={16} /> History
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      <AnimatePresence>
        {showPaymentHistory && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPaymentHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Payment History</h3>
                <button
                  onClick={() => setShowPaymentHistory(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">{selectedBooking.listing_title}</p>
                <p className="text-xs text-gray-500">{selectedBooking.listing_address}</p>
              </div>

              <div className="space-y-3">
                {getCompletedPaymentsForBooking(selectedBooking.id).length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No payment history yet</p>
                ) : (
                  getCompletedPaymentsForBooking(selectedBooking.id).map((payment, index) => (
                    <div
                      key={payment.id || index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle size={20} className="text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              Rs. {Number(payment.amount || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            {payment.status || 'completed'}
                          </span>
                          {payment.transaction_uuid && (
                            <p className="text-xs text-gray-500 mt-1">
                              Txn: {payment.transaction_uuid.substring(0, 8)}...
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedReceipt(payment.transaction_uuid)
                          setShowReceiptModal(true)
                        }}
                        className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye size={16} />
                        View Receipt
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receipt Viewer Modal */}
      <ReceiptViewerModal
        transactionUuid={selectedReceipt}
        isOpen={showReceiptModal}
        onClose={() => {
          setShowReceiptModal(false)
          setSelectedReceipt(null)
        }}
      />

      {/* Gateway Selection Modal */}
      <AnimatePresence>
        {showGatewayModal && paymentDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowGatewayModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Payment Gateway</h3>
                <p className="text-sm text-gray-600">Choose your preferred payment method</p>
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Amount to Pay:</span> Rs. {paymentDetails.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {paymentDetails.mode === 'full' ? 'Full Payment' : 'Monthly Payment'} for {paymentDetails.booking.listing_title}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Khalti Option */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleGatewaySelect('khalti')}
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg p-4 hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1">
                      <img src={khaltiLogo} alt="Khalti logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg">Khalti</p>
                      <p className="text-xs text-purple-100">Digital Wallet</p>
                    </div>
                  </div>
                  <div className="text-white group-hover:translate-x-1 transition-transform">→</div>
                </motion.button>

                {/* eSewa Option */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleGatewaySelect('esewa')}
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-4 hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1">
                      <img src={esewaLogo} alt="eSewa logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg">eSewa</p>
                      <p className="text-xs text-green-100">Digital Payment</p>
                    </div>
                  </div>
                  <div className="text-white group-hover:translate-x-1 transition-transform">→</div>
                </motion.button>
              </div>

              <button
                onClick={() => setShowGatewayModal(false)}
                className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TenantRentTracker
