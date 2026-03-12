import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { 
  Loader2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Calendar,
  Search,
  Filter,
  Download,
  FileText,
  X,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import ReceiptDownloadButton from '../../components/ReceiptDownloadButton';

const AdminSubscriptions = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [cancelModal, setCancelModal] = useState(null);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const { addToast } = useToast();
  const [cancelReason, setCancelReason] = useState('');
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsResponse, subsResponse] = await Promise.all([
        api.get('/subscriptions/admin/stats'),
        api.get('/subscriptions/admin/all')
      ]);

      setStats(statsResponse.data.data);
      setSubscriptions(subsResponse.data.data);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (type) => {
    try {
      setShowReportMenu(false);
      const response = await api.get(`/admin/reports/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-income-report-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      addToast('Report downloaded successfully', 'success');
    } catch (error) {
      console.error('Error downloading report:', error);
      addToast('Failed to download report', 'error');
    }
  };

  const handleCancelSubscription = async () => {
    if (!cancelModal) return;
    
    setCanceling(true);
    try {
      const response = await api.put(`/subscriptions/admin/cancel/${cancelModal.id}`, {
        reason: cancelReason || 'Cancelled by admin'
      });
      
      if (response.data.success) {
        addToast('Subscription cancelled successfully', 'success');
        fetchData();
        setCancelModal(null);
        setCancelReason('');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      addToast(error.response?.data?.error || 'Failed to cancel subscription', 'error');
    } finally {
      setCanceling(false);
    }
  };
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'all' || sub.plan_name === filterPlan;
    return matchesSearch && matchesPlan;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
            <p className="text-gray-600 mt-2">Monitor and manage all subscriptions</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/subscriptions/history')}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Calendar className="w-5 h-5 mr-2" />
              View History
            </button>
            <div className="relative">
              <button
                onClick={() => setShowReportMenu(!showReportMenu)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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
                    onClick={() => downloadReport('subscription')}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
                  >
                    <Download className="w-4 h-4" />
                    Subscription Report
                  </button>
                  <button
                    onClick={() => downloadReport('commission')}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Commission Report
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

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            label="Total Subscribers"
            value={stats?.totals?.total_subscribers || 0}
            color="blue"
          />
          <StatCard
            icon={TrendingUp}
            label="Active"
            value={stats?.totals?.active_subscribers || 0}
            color="green"
          />
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={`NPR ${(stats?.totals?.total_revenue || 0).toLocaleString()}`}
            color="purple"
          />
          <StatCard
            icon={Package}
            label="Plans Available"
            value={stats?.plans?.length || 0}
            color="indigo"
          />
        </div>

        {/* Plan Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Plan Breakdown</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {stats?.plans?.map((plan) => (
              <div key={plan.plan_name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{plan.display_name}</h3>
                  <span className={`px-3 py-1 rounded-md text-xs font-bold ${
                    plan.tier === 1 ? 'bg-amber-100 text-amber-700' :
                    plan.tier === 2 ? 'bg-blue-100 text-blue-700' : 
                    'bg-purple-100 text-purple-700'
                  }`}>
                    TIER {plan.tier}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subscribers:</span>
                    <span className="font-semibold text-gray-900">
                      {plan.subscriber_count || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Revenue:</span>
                    <span className="font-semibold text-green-600">
                      NPR {(plan.monthly_revenue || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Annual Revenue:</span>
                    <span className="font-semibold text-green-600">
                      NPR {(plan.annual_revenue || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Plans</option>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="business">Business</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Properties
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Billing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                      No subscriptions found
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {sub.user_name}
                          </div>
                          <div className="text-sm text-gray-500">{sub.user_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            sub.plan_tier === 1 ? 'bg-amber-100 text-amber-700' :
                            sub.plan_tier === 2 ? 'bg-blue-100 text-blue-700' : 
                            'bg-purple-100 text-purple-700'
                          }`}>
                            T{sub.plan_tier}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {sub.plan_display_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          sub.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : sub.status === 'cancelled'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sub.active_listings} / {sub.max_properties}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {sub.billing_cycle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(sub.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        NPR {(sub.amount_paid || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {(sub.transaction_uuid || sub.payment_reference) ? (
                          <ReceiptDownloadButton
                            transactionUuid={sub.transaction_uuid || sub.payment_reference}
                            hasReceipt={!!sub.receipt_url}
                            variant="secondary"
                            size="sm"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {sub.status === 'active' && (
                          <button
                            onClick={() => setCancelModal(sub)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        <AnimatePresence>
          {cancelModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={() => !canceling && setCancelModal(null)}
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              >
                <button
                  onClick={() => !canceling && setCancelModal(null)}
                  disabled={canceling}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Cancel Subscription</h3>
                </div>

                <p className="text-gray-600 mb-4">
                  Are you sure you want to cancel this subscription for <strong>{cancelModal.user_name}</strong>?
                  This action cannot be undone.
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (optional):
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    disabled={canceling}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows="3"
                    placeholder="Enter reason for cancellation..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setCancelModal(null)}
                    disabled={canceling}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    No, Keep It
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={canceling}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {canceling ? 'Cancelling...' : 'Yes, Cancel'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

export default AdminSubscriptions;
