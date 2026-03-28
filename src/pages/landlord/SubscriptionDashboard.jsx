import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { 
  Loader2, 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Package, 
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowUpRight,
  History,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ReceiptDownloadButton from '../../components/ReceiptDownloadButton';

const SubscriptionDashboard = () => {
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    setLoading(true);
    try {
      const [subResponse, usageResponse, historyResponse] = await Promise.all([
        api.get('/subscriptions/my-subscription'),
        api.get('/subscriptions/usage'),
        api.get('/subscriptions/history')
      ]);

      setSubscription(subResponse.data.data);
      setUsage(usageResponse.data.data);
      setHistory(historyResponse.data.data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cancellation disabled - subscriptions cannot be cancelled once purchased

  const handleToggleAutoRenew = async () => {
    try {
      const newValue = !subscription.subscription.auto_renew;
      const response = await api.put(
        `/subscriptions/${subscription.subscription.id}/auto-renew`,
        { auto_renew: newValue }
      );
      
      if (response.data.success) {
        toast.success(`Auto-renew ${newValue ? 'enabled' : 'disabled'} successfully`);
        fetchSubscriptionData();
      }
    } catch (error) {
      console.error('Error toggling auto-renew:', error);
      toast.error('Failed to update auto-renew setting');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!subscription || !subscription.has_subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center"
        >
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Subscription</h2>
          <p className="text-gray-600 mb-6">
            Subscribe to a plan to start listing your properties
          </p>
          <button
            onClick={() => navigate('/landlord/subscription-plans')}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            View Subscription Plans
          </button>
        </motion.div>
      </div>
    );
  }

  const sub = subscription.subscription;
  const daysRemaining = Math.ceil((new Date(sub.end_date) - new Date()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysRemaining <= 7;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your subscription and view usage</p>
        </div>

        {/* Alert for Expiring Soon */}
        {isExpiringSoon && sub.status === 'active' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg"
          >
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-yellow-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Your subscription expires in {daysRemaining} days
                </p>
                <button
                  onClick={() => navigate('/landlord/subscription-plans')}
                  className="text-sm text-yellow-700 underline hover:text-yellow-900 mt-1"
                >
                  Renew now
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Current Plan Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-indigo-200 text-sm mb-2">Current Plan</p>
                <h2 className="text-3xl font-bold">{sub.plan_display_name}</h2>
                <p className="text-indigo-200 mt-2">Tier {sub.plan_tier}</p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                sub.status === 'active' ? 'bg-green-400 text-green-900' :
                sub.status === 'cancelled' ? 'bg-yellow-400 text-yellow-900' :
                'bg-red-400 text-red-900'
              }`}>
                {sub.status.toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-indigo-200 text-sm mb-1">Billing Cycle</p>
                <p className="text-2xl font-semibold capitalize">{sub.billing_cycle}</p>
              </div>
              <div>
                <p className="text-indigo-200 text-sm mb-1">Amount Paid</p>
                <p className="text-2xl font-semibold">NPR {sub.amount_paid?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-indigo-200 text-sm mb-1">Start Date</p>
                <p className="text-lg font-semibold">
                  {new Date(sub.start_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-indigo-200 text-sm mb-1">End Date</p>
                <p className="text-lg font-semibold">
                  {new Date(sub.end_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {sub.auto_renew && (
              <div className="flex items-center bg-indigo-600 bg-opacity-50 rounded-lg px-4 py-2">
                <RefreshCw className="w-5 h-5 mr-2" />
                <span className="text-sm">Auto-renewal enabled</span>
              </div>
            )}
          </motion.div>

          {/* Usage Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage</h3>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Properties</span>
                <span className="text-sm font-semibold text-gray-900">
                  {usage.properties_used} / {usage.properties_limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${(usage.properties_used / usage.properties_limit) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {usage.properties_remaining} slots remaining
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Listing Duration</span>
                <span className="font-semibold text-gray-900">
                  {sub.listing_duration_days} days
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Auto-renew Listings</span>
                {sub.auto_renew_enabled ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-300" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Export Leads</span>
                {sub.export_leads ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-300" />
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate('/landlord/subscription-plans')}
            className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowUpRight className="w-5 h-5 mr-2" />
            Upgrade Plan
          </button>
          
          {sub.auto_renew_enabled && (
            <button
              onClick={handleToggleAutoRenew}
              className="flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Settings className="w-5 h-5 mr-2" />
              {sub.auto_renew ? 'Disable' : 'Enable'} Auto-Renew
            </button>
          )}
        </div>

        {/* Auto-Renew Explanation */}
        {sub.auto_renew_enabled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-lg"
          >
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  <strong>Auto-Renew:</strong> {sub.auto_renew ? 'Enabled' : 'Disabled'}
                </p>
                <p className="text-sm text-blue-800">
                  When enabled, your subscription will automatically renew at the end of the billing period 
                  ({new Date(sub.end_date).toLocaleDateString()}) and you'll be charged {sub.billing_cycle === 'annual' ? 'NPR ' + sub.annual_price : 'NPR ' + sub.monthly_price} 
                  for the next {sub.billing_cycle === 'annual' ? 'year' : 'month'}. This ensures uninterrupted service and prevents your listings from expiring.
                </p>
                {!sub.auto_renew && (
                  <p className="text-sm text-blue-900 mt-2 font-medium">
                    ⚠️ Your subscription will expire on {new Date(sub.end_date).toLocaleDateString()} and your listings will be deactivated.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Subscription History */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <History className="w-5 h-5 mr-2" />
              Subscription History
            </h3>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              {showHistory ? 'Hide' : 'Show'}
            </button>
          </div>

          {showHistory && (
            <div className="p-6">
              {history.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No history available</p>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.plan_display_name}</p>
                        <p className="text-sm text-gray-600 capitalize">
                          {item.billing_cycle} • {item.status}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
                        </p>
                        {item.payment_reference && (
                          <p className="text-xs text-gray-400 mt-1 font-mono">
                            Txn: {item.transaction_uuid || item.payment_reference}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            NPR {item.amount_paid?.toLocaleString()}
                          </p>
                        </div>
                        {(item.transaction_uuid || item.payment_reference) && (
                          <ReceiptDownloadButton
                            transactionUuid={item.transaction_uuid || item.payment_reference}
                            hasReceipt={!!item.receipt_url}
                            variant="secondary"
                            size="sm"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDashboard;
