import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { Check, X, Loader2, CreditCard, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' or 'annual'
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/subscriptions/plans');
      setPlans(response.data.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handleSubscribe = async (paymentData) => {
    setProcessing(true);
    try {
      const response = await api.post('/subscriptions/subscribe', {
        plan_id: selectedPlan.id,
        billing_cycle: billingCycle,
        payment_method: paymentData.payment_method,
        payment_reference: paymentData.payment_reference,
        auto_renew: paymentData.auto_renew || false
      });

      if (response.data.success) {
        alert('Subscription activated successfully!');
        navigate('/landlord/subscription-dashboard');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      alert(error.response?.data?.error || 'Failed to activate subscription');
    } finally {
      setProcessing(false);
      setShowPaymentModal(false);
    }
  };

  const getPlanIcon = (tier) => {
    switch(tier) {
      case 1: return '🥉';
      case 2: return '🥈';
      case 3: return '🥇';
      default: return '📦';
    }
  };

  const getPrice = (plan) => {
    return billingCycle === 'annual' ? plan.annual_price : plan.monthly_price;
  };

  const getSavings = (plan) => {
    const monthlyTotal = plan.monthly_price * 12;
    const savings = monthlyTotal - plan.annual_price;
    const percentage = Math.round((savings / monthlyTotal) * 100);
    return { amount: savings, percentage };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Choose Your Plan
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600"
          >
            Simple, transparent pricing. All plans include 3% commission on bookings.
          </motion.p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="relative inline-flex h-8 w-14 items-center rounded-full bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>
            Annual
          </span>
          {billingCycle === 'annual' && (
            <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <TrendingUp className="w-3 h-3 mr-1" />
              Save up to 17%
            </span>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const savings = getSavings(plan);
            const isPro = plan.tier === 2;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${
                  isPro ? 'ring-2 ring-indigo-600 scale-105' : ''
                }`}
              >
                {isPro && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 text-xs font-semibold rounded-bl-lg">
                    POPULAR
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-2">{getPlanIcon(plan.tier)}</div>
                    <h3 className="text-2xl font-bold text-gray-900">{plan.display_name.replace(/🥉|🥈|🥇/g, '').trim()}</h3>
                    <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-sm text-gray-500 mr-1">NPR</span>
                      <span className="text-5xl font-bold text-gray-900">
                        {getPrice(plan).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      per {billingCycle === 'annual' ? 'year' : 'month'}
                    </p>
                    {billingCycle === 'annual' && savings.amount > 0 && (
                      <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        Save NPR {savings.amount.toLocaleString()} ({savings.percentage}%)
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">
                        List up to <strong>{plan.max_properties}</strong> properties
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">
                        Listing active for <strong>{plan.listing_duration_days} days</strong>
                      </span>
                    </li>
                    <li className="flex items-start">
                      {plan.auto_renew_enabled ? (
                        <>
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">Auto-renew option</span>
                        </>
                      ) : (
                        <>
                          <X className="w-5 h-5 text-gray-300 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-400">Manual renewal only</span>
                        </>
                      )}
                    </li>
                    {plan.export_leads ? (
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">Export leads (CSV)</span>
                      </li>
                    ) : (
                      <li className="flex items-start">
                        <X className="w-5 h-5 text-gray-300 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-400">No lead export</span>
                      </li>
                    )}
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">
                        <strong>3%</strong> commission on bookings
                      </span>
                    </li>
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                      isPro
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && selectedPlan && (
          <PaymentModal
            plan={selectedPlan}
            billingCycle={billingCycle}
            price={getPrice(selectedPlan)}
            onClose={() => setShowPaymentModal(false)}
            onSubmit={handleSubscribe}
            processing={processing}
          />
        )}
      </div>
    </div>
  );
};

// Payment Modal Component
const PaymentModal = ({ plan, billingCycle, price, onClose, onSubmit, processing }) => {
  const [paymentData, setPaymentData] = useState({
    payment_method: 'bank_transfer',
    payment_reference: '',
    auto_renew: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!paymentData.payment_reference.trim()) {
      alert('Please enter payment reference');
      return;
    }
    onSubmit(paymentData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Payment</h2>
        
        <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
          <p className="text-sm text-gray-600">Plan: <strong>{plan.display_name}</strong></p>
          <p className="text-sm text-gray-600">Billing: <strong>{billingCycle}</strong></p>
          <p className="text-2xl font-bold text-indigo-600 mt-2">NPR {price.toLocaleString()}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={paymentData.payment_method}
              onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="online">Online Payment</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Reference / Transaction ID
            </label>
            <input
              type="text"
              value={paymentData.payment_reference}
              onChange={(e) => setPaymentData({ ...paymentData, payment_reference: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter transaction ID"
              required
            />
          </div>

          {plan.auto_renew_enabled && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="auto_renew"
                checked={paymentData.auto_renew}
                onChange={(e) => setPaymentData({ ...paymentData, auto_renew: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="auto_renew" className="ml-2 text-sm text-gray-700">
                Enable auto-renewal
              </label>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Confirm Payment
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SubscriptionPlans;
