import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { Check, X, Loader2, CreditCard, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PaymentGatewayModal from '../../components/PaymentGatewayModal';
import UpgradeConfirmationModal from '../../components/UpgradeConfirmationModal';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../context/ToastContext';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' or 'annual'
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToast();

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
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

  const fetchCurrentSubscription = async () => {
    try {
      const response = await api.get('/subscriptions/my-subscription');
      if (response.data.success && response.data.data.has_subscription) {
        const subscription = response.data.data.subscription;
        setCurrentSubscription(subscription);
        // Sync billing cycle display with user's actual subscription
        if (subscription.billing_cycle) {
          setBillingCycle(subscription.billing_cycle);
        }
      }
    } catch (error) {
      console.log('No active subscription');
    }
  };

  const handleSelectPlan = (plan) => {
    // Check if user has an active subscription
    if (currentSubscription) {
      const currentTier = currentSubscription.plan_tier;
      const newTier = plan.tier;
      
      // Prevent downgrade
      if (newTier < currentTier) {
        addToast(`You cannot downgrade from ${currentSubscription.plan_display_name} (Tier ${currentTier}) to ${plan.display_name} (Tier ${newTier}). Please cancel your current subscription first if you wish to downgrade.`, 'error', 5000);
        return;
      }
      
      // Check if this is an upgrade
      if (newTier > currentTier) {
        // Show upgrade confirmation modal
        setSelectedPlan(plan);
        setShowUpgradeModal(true);
        return;
      }
    }
    
    // Direct to payment (new subscription or same tier)
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handleUpgradeConfirm = () => {
    // User confirmed upgrade, close upgrade modal and show payment modal
    setShowUpgradeModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    // Payment verification will be handled by the PaymentVerify page
    // This is just a placeholder for future enhancements
    setShowPaymentModal(false);
  };

  const getPlanIcon = (tier) => {
    const tierConfig = {
      1: { label: 'BASIC', color: 'bg-amber-100 text-amber-700 border-amber-300' },
      2: { label: 'PRO', color: 'bg-blue-100 text-blue-700 border-blue-300' },
      3: { label: 'BUSINESS', color: 'bg-purple-100 text-purple-700 border-purple-300' }
    };
    const config = tierConfig[tier] || { label: 'PLAN', color: 'bg-gray-100 text-gray-700 border-gray-300' };
    return (
      <div className={`inline-flex items-center justify-center px-4 py-2 rounded-lg font-bold text-sm border-2 ${config.color}`}>
        {config.label}
      </div>
    );
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

        {/* Active Subscription Notice */}
        {currentSubscription && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto mb-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  <strong>You have an active subscription:</strong> {currentSubscription.plan_display_name}
                  <br />
                  <span className="text-xs">
                    Expires on {new Date(currentSubscription.end_date).toLocaleDateString()}. 
                    You cannot purchase the same plan again while it's active. To upgrade, select a different plan.
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        )}

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
            const isCurrentPlan = currentSubscription && currentSubscription.plan_id === plan.id;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${
                  isPro ? 'ring-2 ring-indigo-600 scale-105' : ''
                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {isPro && !isCurrentPlan && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 text-xs font-semibold rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute top-0 right-0 bg-green-600 text-white px-4 py-1 text-xs font-semibold rounded-bl-lg">
                    CURRENT PLAN
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className="mb-3 flex justify-center">{getPlanIcon(plan.tier)}</div>
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
                    disabled={isCurrentPlan}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                      isCurrentPlan
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : isPro
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {isCurrentPlan ? 'Current Plan' : 'Get Started'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Upgrade Confirmation Modal */}
        {showUpgradeModal && selectedPlan && currentSubscription && (
          <UpgradeConfirmationModal
            isOpen={showUpgradeModal}
            onClose={() => {
              setShowUpgradeModal(false);
              setSelectedPlan(null);
            }}
            onConfirm={handleUpgradeConfirm}
            currentPlan={currentSubscription}
            newPlan={selectedPlan}
            billingCycle={billingCycle}
          />
        )}

        {/* Payment Gateway Modal */}
        {showPaymentModal && selectedPlan && (
          <PaymentGatewayModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            paymentData={{
              payment_type: 'subscription',
              reference_id: selectedPlan.id,
              amount: Math.round(getPrice(selectedPlan)), // Amount should already be in NPR
              billing_cycle: billingCycle, // Add billing cycle
              auto_renew: false, // Default to false, can be made configurable
              customer_info: {
                name: user?.name || 'User',
                email: user?.email || 'user@example.com',
                phone: user?.phone || '9800000000'
              },
              purchase_order_name: `${selectedPlan.display_name} - ${billingCycle === 'annual' ? 'Annual' : 'Monthly'} Subscription`
            }}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default SubscriptionPlans;