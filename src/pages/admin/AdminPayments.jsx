import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { 
  Loader2, 
  DollarSign, 
  TrendingUp, 
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Calendar,
  Download
} from 'lucide-react';
import ReceiptDownloadButton from '../../components/ReceiptDownloadButton';

// Official payment gateway logos
const KHALTI_LOGO = 'https://web.khalti.com/static/img/logo1.png';
const ESEWA_LOGO = 'https://esewa.com.np/common/images/esewa_logo.png';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGateway, setFilterGateway] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [paymentsResponse, analyticsResponse] = await Promise.all([
        api.get('/payments/admin/all'),
        api.get('/payments/admin/analytics')
      ]);

      setPayments(paymentsResponse.data.data || []);
      setAnalytics(analyticsResponse.data.data);
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transaction_uuid?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGateway = filterGateway === 'all' || payment.gateway === filterGateway;
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesType = filterType === 'all' || payment.payment_type === filterType;
    return matchesSearch && matchesGateway && matchesStatus && matchesType;
  });

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
      refunded: 'bg-blue-100 text-blue-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-2">Monitor all payment transactions (Khalti & eSewa)</p>
        </div>

        {/* Stats Cards */}
        {analytics && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={DollarSign}
              label="Total Revenue"
              value={`NPR ${(analytics.total_amount || 0).toLocaleString()}`}
              color="green"
            />
            <StatCard
              icon={CheckCircle}
              label="Completed"
              value={analytics.completed_count || 0}
              color="green"
            />
            <StatCard
              icon={Clock}
              label="Pending"
              value={analytics.pending_count || 0}
              color="yellow"
            />
            <StatCard
              icon={XCircle}
              label="Failed"
              value={analytics.failed_count || 0}
              color="red"
            />
          </div>
        )}

        {/* Gateway Breakdown */}
        {analytics && analytics.by_gateway && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Gateway Breakdown</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {analytics.by_gateway.map((gateway) => (
                <div key={gateway.gateway} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={gateway.gateway === 'khalti' ? KHALTI_LOGO : ESEWA_LOGO} 
                        alt={`${gateway.gateway} logo`} 
                        className="w-8 h-8 rounded"
                      />
                      <h3 className="font-semibold text-gray-900 capitalize">{gateway.gateway}</h3>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-semibold text-green-600">
                        NPR {(gateway.total_amount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transactions:</span>
                      <span className="font-semibold text-gray-900">{gateway.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payments Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by user or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterGateway}
                onChange={(e) => setFilterGateway(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Gateways</option>
                <option value="khalti">Khalti</option>
                <option value="esewa">eSewa</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Types</option>
                <option value="subscription">Subscription</option>
                <option value="commission">Commission</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gateway
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipt
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">
                          {payment.transaction_uuid}
                        </div>
                        {payment.gateway_transaction_id && (
                          <div className="text-xs text-gray-500 font-mono">
                            {payment.gateway_transaction_id}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.user_name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.user_email || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded capitalize">
                          {payment.payment_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <img 
                            src={payment.gateway === 'khalti' ? KHALTI_LOGO : ESEWA_LOGO} 
                            alt={`${payment.gateway} logo`} 
                            className="w-6 h-6 rounded"
                          />
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {payment.gateway}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        NPR {(payment.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadge(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payment.status === 'completed' ? (
                          <ReceiptDownloadButton
                            transactionUuid={payment.transaction_uuid}
                            hasReceipt={!!payment.receipt_url}
                            variant="icon"
                            size="sm"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
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

export default AdminPayments;
