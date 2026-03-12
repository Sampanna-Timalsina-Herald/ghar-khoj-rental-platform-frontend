/**
 * Admin Commission Dashboard
 * Complete revenue management interface for administrators
 */

import React, { useState, useEffect } from 'react';
import {
  DollarSign, Clock, AlertCircle, CheckCircle,
  Download, FileText, Search,
  CreditCard, Eye, RefreshCw, Power, ChevronDown
} from 'lucide-react';
import api from '../../api/axios';

const AdminCommissionDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [filters, setFilters] = useState({
    payment_status: '',
    from_date: '',
    to_date: ''
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    payment_method: 'bank_transfer',
    payment_reference: '',
    notes: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [commissionEnabled, setCommissionEnabled] = useState(true);
  const [togglingCommission, setTogglingCommission] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/commissions/dashboard');
      if (response.data.success) {
        setSummary(response.data.data.summary);
        setTransactions(response.data.data.recentTransactions);
        setMonthlyTrends(response.data.data.monthlyTrends);
        setCommissionEnabled(response.data.data.commission_enabled !== false);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      showMessage('error', 'Failed to load commission dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredTransactions = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.payment_status) params.append('payment_status', filters.payment_status);
      if (filters.from_date) params.append('from_date', filters.from_date);
      if (filters.to_date) params.append('to_date', filters.to_date);

      const response = await api.get(`/admin/commissions/transactions?${params.toString()}`);
      if (response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showMessage('error', 'Failed to load transactions');
    }
  };

  const handleMarkAsPaid = async (transactionId) => {
    if (!paymentData.payment_reference.trim()) {
      showMessage('error', 'Payment reference is required');
      return;
    }

    try {
      const response = await api.put(`/admin/commissions/transactions/${transactionId}/mark-paid`, paymentData);
      if (response.data.success) {
        showMessage('success', 'Payment marked as paid successfully');
        setShowPaymentModal(false);
        setPaymentData({ payment_method: 'bank_transfer', payment_reference: '', notes: '' });
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error marking payment:', error);
      showMessage('error', 'Failed to mark payment as paid');
    }
  };

  const downloadReport = async (type) => {
    try {
      setShowReportMenu(false);
      const params = new URLSearchParams();
      if (filters.from_date) params.append('from_date', filters.from_date);
      if (filters.to_date) params.append('to_date', filters.to_date);

      const response = await api.get(`/admin/reports/${type}?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-income-report-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showMessage('success', 'Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      showMessage('error', 'Failed to download report');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleToggleCommission = async () => {
    try {
      setTogglingCommission(true);
      const newState = !commissionEnabled;
      const response = await api.put('/admin/commissions/toggle', { enabled: newState });
      if (response.data.success) {
        setCommissionEnabled(newState);
        showMessage('success', `Commission system ${newState ? 'enabled' : 'disabled'} successfully`);
      }
    } catch (error) {
      console.error('Error toggling commission:', error);
      showMessage('error', 'Failed to toggle commission status');
    } finally {
      setTogglingCommission(false);
    }
  };

  const formatCurrency = (amount) => {
    return `NPR ${parseFloat(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      paid: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, text: 'Paid' },
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, text: 'Pending' },
      overdue: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle, text: 'Overdue' },
      waived: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: CheckCircle, text: 'Waived' }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
        <Icon size={14} />
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Commission Management</h1>
          <p className="text-gray-600 mt-2">Track and manage platform revenue</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Commission Toggle */}
          <div className="flex items-center gap-3">
            <span className={`text-sm font-semibold ${commissionEnabled ? 'text-green-700' : 'text-red-700'}`}>
              {togglingCommission ? 'Updating...' : commissionEnabled ? 'Commission ON' : 'Commission OFF'}
            </span>
            <button
              onClick={handleToggleCommission}
              disabled={togglingCommission}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                commissionEnabled ? 'bg-green-500' : 'bg-red-400'
              }`}
              title={commissionEnabled ? 'Click to disable commission' : 'Click to enable commission'}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  commissionEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="relative">
            <button
              onClick={() => setShowReportMenu(!showReportMenu)}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <FileText className="w-5 h-5 mr-2" />
              Income Reports
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            {showReportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowReportMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <button
                  onClick={() => downloadReport('commission')}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
                >
                  <Download className="w-4 h-4" />
                  Commission Report
                </button>
                <button
                  onClick={() => downloadReport('subscription')}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Subscription Report
                </button>
                <div className="border-t border-gray-100" />
                <button
                  onClick={() => downloadReport('combined')}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-indigo-700 hover:bg-indigo-50 flex items-center gap-2 rounded-b-lg"
                >
                  <Download className="w-4 h-4" />
                  Combined Report
                </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Commission Disabled Banner */}
      {!commissionEnabled && (
        <div className="p-4 rounded-lg border border-amber-300 bg-amber-50 flex items-center gap-3">
          <Power size={20} className="text-amber-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-800">Commission System is Disabled</p>
            <p className="text-sm text-amber-700">
              Landlords are not being charged commission on new rentals. Existing pending commissions remain unaffected.
            </p>
          </div>
          <button
            onClick={handleToggleCommission}
            disabled={togglingCommission}
            className="ml-auto px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm disabled:opacity-50 whitespace-nowrap"
          >
            Enable Commission
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.total_revenue)}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.pending_revenue)}</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Overdue Payments</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.overdue_revenue)}</p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{summary?.total_transactions || 0}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Filter Transactions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
            <select
              value={filters.payment_status}
              onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="waived">Waived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={filters.from_date}
              onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={filters.to_date}
              onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={fetchFilteredTransactions}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
          >
            <Search size={18} />
            Apply Filters
          </button>
          <button
            onClick={() => {
              setFilters({ payment_status: '', from_date: '', to_date: '' });
              fetchDashboardData();
            }}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Commission Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Landlord</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    No commission transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((transaction, index) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{transaction.invoice_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{transaction.landlord_name}</div>
                        <div className="text-xs text-gray-500">{transaction.landlord_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{transaction.listing_title}</div>
                      <div className="text-xs text-gray-500">{transaction.city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(transaction.rent_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency(transaction.commission_amount)}
                      </div>
                      <div className="text-xs text-gray-500">{transaction.commission_rate}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transaction.payment_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.due_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {transaction.payment_status !== 'paid' && (
                          <button
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowPaymentModal(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Mark as Paid"
                          >
                            <CreditCard size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedTransaction(transaction)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowPaymentModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Mark Payment as Paid</h3>
            
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Invoice Number</p>
                <p className="font-semibold text-gray-900">{selectedTransaction.invoice_number}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Commission Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(selectedTransaction.commission_amount)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select
                  value={paymentData.payment_method}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="online">Online Payment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Reference *
                </label>
                <input
                  type="text"
                  value={paymentData.payment_reference}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_reference: e.target.value })}
                  placeholder="Transaction ID, Cheque #, etc."
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentData({ payment_method: 'bank_transfer', payment_reference: '', notes: '' });
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMarkAsPaid(selectedTransaction.id)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                Mark as Paid
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminCommissionDashboard;
