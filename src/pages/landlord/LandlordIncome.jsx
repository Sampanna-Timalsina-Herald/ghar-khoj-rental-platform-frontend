import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  DollarSign, TrendingUp, Calendar, Download, Filter, 
  Search, Eye, CheckCircle, Clock, Home, User, CreditCard, Grid3X3, List, X, Building, MapPin
} from 'lucide-react'
import api from '../../api/axios'
import ReceiptViewerModal from '../../components/ReceiptViewerModal'
import { getEarningsByProperty } from '../../services/landlordService'

const LandlordIncome = () => {
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])
  const [bookings, setBookings] = useState([])
  const [propertyEarnings, setPropertyEarnings] = useState([])
  const [earningsSummary, setEarningsSummary] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMonth, setFilterMonth] = useState('all')
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [viewMode, setViewMode] = useState('card')
  const [activeTab, setActiveTab] = useState('payments') // 'payments' or 'properties'
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [payments, searchQuery, filterStatus, filterMonth])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [paymentsRes, bookingsRes, earningsRes] = await Promise.all([
        api.get('/payments/landlord/my-payments'),
        api.get('/bookings/my-bookings'),
        getEarningsByProperty().catch(err => {
          console.warn('Could not fetch earnings by property:', err.message)
          return { success: false, data: { summary: null, properties: [] } }
        })
      ])

      const paymentsData = Array.isArray(paymentsRes.data) 
        ? paymentsRes.data 
        : paymentsRes.data?.data || []
      
      const bookingsData = Array.isArray(bookingsRes.data)
        ? bookingsRes.data
        : bookingsRes.data?.data || []

      setPayments(paymentsData)
      setBookings(bookingsData)
      
      if (earningsRes.success) {
        setEarningsSummary(earningsRes.data.summary)
        setPropertyEarnings(earningsRes.data.properties || [])
      }
    } catch (error) {
      console.error('Failed to fetch income data:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...payments]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(payment =>
        payment.tenant_name?.toLowerCase().includes(query) ||
        payment.listing_title?.toLowerCase().includes(query) ||
        payment.transaction_uuid?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(payment => payment.status === filterStatus)
    }

    // Month filter
    if (filterMonth !== 'all') {
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.created_at)
        const month = paymentDate.getMonth()
        return month === parseInt(filterMonth)
      })
    }

    setFilteredPayments(filtered)
  }

  const calculateStats = () => {
    const completedPayments = payments.filter(p => p.status === 'completed')
    const totalIncome = completedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    const thisMonthPayments = completedPayments.filter(p => {
      const date = new Date(p.created_at)
      const now = new Date()
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    })
    const thisMonthIncome = thisMonthPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    const activeRentals = bookings.filter(b => b.status === 'active').length

    return {
      totalIncome,
      thisMonthIncome,
      totalPayments: completedPayments.length,
      activeRentals
    }
  }

  const stats = calculateStats()

  const getStatusBadge = (status) => {
    const badges = {
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' }
    }
    const badge = badges[status] || badges.pending
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  const downloadReport = () => {
    const csvContent = [
      ['Date', 'Tenant', 'Property', 'Amount', 'Status', 'Transaction ID'],
      ...filteredPayments.map(p => [
        new Date(p.created_at).toLocaleDateString(),
        p.tenant_name || 'N/A',
        p.listing_title || 'N/A',
        `Rs. ${Number(p.amount || 0).toLocaleString()}`,
        p.status,
        p.transaction_uuid || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `income-report-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Income & Payments</h1>
          <p className="text-sm text-gray-600 mt-1">Track all rent payments and income</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            title="Card view"
          >
            <Grid3X3 size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            title="List view"
          >
            <List size={18} />
          </button>
          <button
            onClick={downloadReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
          >
            <Download size={16} />
            Download Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={20} className="text-green-600" />
          </div>
          <p className="text-xs text-gray-600">Total Income</p>
          <p className="text-xl font-bold text-gray-900 mt-1">Rs. {stats.totalIncome.toLocaleString()}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar size={20} className="text-blue-600" />
          </div>
          <p className="text-xs text-gray-600">This Month</p>
          <p className="text-xl font-bold text-gray-900 mt-1">Rs. {stats.thisMonthIncome.toLocaleString()}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle size={20} className="text-purple-600" />
          </div>
          <p className="text-xs text-gray-600">Total Payments</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{stats.totalPayments}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Home size={20} className="text-orange-600" />
          </div>
          <p className="text-xs text-gray-600">Active Rentals</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{stats.activeRentals}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'payments' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <CreditCard size={16} />
          All Payments
        </button>
        <button
          onClick={() => setActiveTab('properties')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'properties' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Building size={16} />
          By Property
        </button>
      </div>

      {/* Property Earnings View */}
      {activeTab === 'properties' && (
        <div className="space-y-4 mb-6">
          {propertyEarnings.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <Building size={48} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-semibold text-gray-700">No Property Earnings Yet</h3>
              <p className="text-sm text-gray-500 mt-1">
                Earnings will appear here once tenants start paying rent
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {propertyEarnings.map((property) => (
                <motion.div
                  key={property.listing_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                    <h3 className="font-bold text-white truncate">{property.listing_title || 'Property'}</h3>
                    <div className="flex items-center gap-1 text-white/80 text-sm mt-1">
                      <MapPin size={14} />
                      <span className="truncate">{property.listing_address || property.listing_city}</span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Total Earned</p>
                        <p className="text-lg font-bold text-green-600">
                          Rs. {Number(property.total_earned || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Pending</p>
                        <p className="text-lg font-bold text-orange-600">
                          Rs. {Number(property.pending_amount || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-3">
                      <span>{property.total_payments || 0} payments received</span>
                      <button 
                        onClick={() => {
                          setActiveTab('payments')
                          setSearchQuery(property.listing_title)
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        View Details <Eye size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters - Only show for payments tab */}
      {activeTab === 'payments' && (
        <>
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} className="text-gray-600" />
          <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Months</option>
            <option value="0">January</option>
            <option value="1">February</option>
            <option value="2">March</option>
            <option value="3">April</option>
            <option value="4">May</option>
            <option value="5">June</option>
            <option value="6">July</option>
            <option value="7">August</option>
            <option value="8">September</option>
            <option value="9">October</option>
            <option value="10">November</option>
            <option value="11">December</option>
          </select>
        </div>

        {(searchQuery || filterStatus !== 'all' || filterMonth !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('')
              setFilterStatus('all')
              setFilterMonth('all')
            }}
            className="mt-3 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-xs font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Payments Display */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <CreditCard size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No payments found</p>
          <p className="text-xs mt-1 text-gray-400">Payments will appear here once tenants start paying rent</p>
        </div>
      ) : viewMode === 'card' ? (
        /* CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPayments.map((payment, idx) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-white border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-semibold">TENANT</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{payment.tenant_name || 'N/A'}</p>
                  </div>
                  {getStatusBadge(payment.status)}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Property</p>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-1">{payment.listing_title || 'N/A'}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="text-lg font-bold text-green-600">Rs. {Number(payment.amount || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-xs font-medium text-gray-900">
                      {new Date(payment.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {payment.transaction_uuid && (
                  <div>
                    <p className="text-xs text-gray-500">Transaction ID</p>
                    <p className="text-xs font-mono text-gray-700 truncate">{payment.transaction_uuid.substring(0, 20)}...</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => setSelectedPayment(payment)}
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 flex items-center justify-center gap-1.5"
                >
                  <Eye size={14} /> Details
                </button>
                <button
                  onClick={() => {
                    setSelectedReceipt(payment.transaction_uuid)
                    setShowReceiptModal(true)
                  }}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center justify-center gap-1.5"
                >
                  <Eye size={14} /> Receipt
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Tenant</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Property</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-gray-900">
                      {new Date(payment.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        <span className="text-xs font-medium text-gray-900">
                          {payment.tenant_name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-900">
                      {payment.listing_title || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-green-600">
                        Rs. {Number(payment.amount || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1"
                        >
                          <Eye size={14} />
                          Details
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReceipt(payment.transaction_uuid)
                            setShowReceiptModal(true)
                          }}
                          className="text-green-600 hover:text-green-700 text-xs font-medium flex items-center gap-1"
                        >
                          <Eye size={14} />
                          Receipt
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </>
      )}

      {/* Payment Detail Modal */}
      <AnimatePresence>
        {selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPayment(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-gray-500">Transaction ID</p>
                  <p className="text-sm font-medium text-gray-900">{selectedPayment.transaction_uuid || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(selectedPayment.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tenant</p>
                  <p className="text-sm font-medium text-gray-900">{selectedPayment.tenant_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Property</p>
                  <p className="text-sm font-medium text-gray-900">{selectedPayment.listing_title || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="text-lg font-bold text-green-600">
                    Rs. {Number(selectedPayment.amount || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Gateway</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {selectedPayment.gateway || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Mode</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {selectedPayment.payment_mode || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedReceipt(selectedPayment.transaction_uuid)
                    setShowReceiptModal(true)
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  View Receipt
                </button>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                >
                  Close
                </button>
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
    </div>
  )
}

export default LandlordIncome
