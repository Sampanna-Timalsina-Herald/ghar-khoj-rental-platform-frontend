import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Receipt, Calendar, CreditCard, User, Download } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { downloadPaymentReceipt } from '../services/receiptService';

/**
 * PaymentSuccess Component
 * Shows payment success and redirects to appropriate dashboard
 */
const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { role } = useAuthStore();
  const [countdown, setCountdown] = useState(5);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  useEffect(() => {
    // Get payment info from URL params
    const paymentType = searchParams.get('payment_type');
    const amount = searchParams.get('amount');
    const transactionId = searchParams.get('transaction_id');
    const gateway = searchParams.get('gateway');
    const referenceId = searchParams.get('reference_id');

    if (paymentType && amount && transactionId) {
      setPaymentInfo({
        payment_type: paymentType,
        amount: parseFloat(amount),
        transaction_id: transactionId,
        gateway: gateway || 'N/A',
        reference_id: referenceId
      });
    }
  }, [searchParams]);

  useEffect(() => {
    // Countdown timer
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      handleRedirect();
    }
  }, [countdown]);

  const handleRedirect = () => {
    if (!paymentInfo) {
      // If no payment info, redirect to home
      navigate('/');
      return;
    }

    // Redirect based on payment type and user role
    if (paymentInfo.payment_type === 'subscription') {
      if (role === 'landlord') {
        navigate('/landlord/subscription-dashboard');
      } else {
        navigate('/landlord/home'); // Default landlord home
      }
    } else if (paymentInfo.payment_type === 'commission') {
      if (role === 'landlord') {
        navigate('/landlord/billing');
      } else {
        navigate('/landlord/home');
      }
    } else {
      // Default redirect based on role
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'landlord') {
        navigate('/landlord/home');
      } else if (role === 'tenant') {
        navigate('/tenant/home');
      } else {
        navigate('/');
      }
    }
  };

  const handleDownloadReceipt = async () => {
    if (!paymentInfo || !paymentInfo.transaction_id) {
      alert('Receipt not available');
      return;
    }

    try {
      setDownloadingReceipt(true);
      await downloadPaymentReceipt(paymentInfo.transaction_id);
    } catch (error) {
      console.error('Failed to download receipt:', error);
      alert('Failed to download receipt. Please try again or contact support.');
    } finally {
      setDownloadingReceipt(false);
    }
  };

  const formatAmount = (amount) => {
    return `Rs. ${parseFloat(amount).toLocaleString('en-NP', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const getPaymentTypeDisplay = (type) => {
    if (type === 'subscription') return 'Subscription Payment';
    if (type === 'commission') return 'Commission Payment';
    return 'Payment';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
      >
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: 'spring', 
              stiffness: 200, 
              damping: 15,
              delay: 0.2 
            }}
            className="relative z-10 flex justify-center mb-4"
          >
            <div className="bg-white rounded-full p-4 shadow-lg">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative z-10 text-3xl font-bold mb-2"
          >
            Payment Successful! 🎉
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative z-10 text-green-50 text-lg"
          >
            Your payment has been processed successfully
          </motion.p>
        </div>

        {/* Payment Details */}
        <div className="p-8">
          {paymentInfo ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              {/* Summary Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                <div className="text-center mb-6">
                  <p className="text-gray-600 text-sm mb-2">Amount Paid</p>
                  <p className="text-4xl font-bold text-gray-900">
                    {formatAmount(paymentInfo.amount)}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 rounded-lg p-2">
                        <Receipt className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                        <p className="text-sm font-mono font-semibold text-gray-900 truncate">
                          {paymentInfo.transaction_id}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 rounded-lg p-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Payment Gateway</p>
                        <p className="text-sm font-semibold text-gray-900 capitalize">
                          {paymentInfo.gateway}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 rounded-lg p-2">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Payment Type</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {getPaymentTypeDisplay(paymentInfo.payment_type)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="bg-orange-100 rounded-lg p-2">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date().toLocaleString('en-NP', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-blue-50 border border-blue-200 rounded-xl p-4"
              >
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 rounded-full p-2 mt-0.5">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      What's Next?
                    </p>
                    <p className="text-sm text-blue-700">
                      {paymentInfo.payment_type === 'subscription' 
                        ? 'Your subscription has been activated. You can now enjoy all premium features!'
                        : paymentInfo.payment_type === 'commission'
                        ? 'Your commission payment has been recorded. Thank you for your payment!'
                        : 'Your payment has been processed successfully. You can now continue using our services!'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Auto Redirect Notice */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-center bg-gray-50 rounded-xl p-4 border border-gray-200"
              >
                <p className="text-gray-600 mb-2">
                  Redirecting to your dashboard in{' '}
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full font-bold text-lg mx-1">
                    {countdown}
                  </span>
                  {countdown === 1 ? 'second' : 'seconds'}...
                </p>
                <p className="text-sm text-gray-500">
                  You will be automatically redirected, or click the button below
                </p>
              </motion.div>

              {/* Receipt Download Notice */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.95 }}
                className="bg-green-50 border border-green-200 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Receipt className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-semibold text-green-900">
                        Receipt Available
                      </p>
                      <p className="text-xs text-green-700">
                        Your receipt has been emailed to you
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadReceipt}
                    disabled={downloadingReceipt}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingReceipt ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Action Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                onClick={handleRedirect}
                className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payment details...</p>
            </div>
          )}

          {/* Support Link */}
          <div className="mt-8 text-center border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-500 mb-2">
              Need assistance with your payment?
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center text-green-600 hover:text-green-700 font-medium text-sm"
            >
              Contact Support
              <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
