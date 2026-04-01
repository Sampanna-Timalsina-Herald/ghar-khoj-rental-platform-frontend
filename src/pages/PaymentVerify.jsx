import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { verifyPayment } from '../services/paymentService';

/**
 * PaymentVerify Component
 * Handles payment verification callback from Khalti and eSewa
 */
const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, failed, error
  const [message, setMessage] = useState('Verifying your payment...');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    verifyPaymentCallback();
  }, []);

  useEffect(() => {
    // Auto redirect after successful payment
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      handleRedirect();
    }
  }, [status, countdown]);

  const verifyPaymentCallback = async () => {
    try {
      // Get all query parameters
      const params = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      // Call verification API
      const response = await verifyPayment(params);

      const payment = response?.data?.payment || response?.data;

      if (!payment || !payment.status) {
        setStatus('error');
        setMessage('Payment verification response is invalid. Please contact support.');
        return;
      }

      if (response.success && payment.status === 'completed') {
        setStatus('success');
        setMessage('Payment successful!');
        setPaymentDetails(payment);
      } else if (payment.status === 'failed') {
        setStatus('failed');
        setMessage('Payment failed. Please try again.');
        setPaymentDetails(payment);
      } else {
        setStatus('failed');
        setMessage('Payment could not be completed.');
        setPaymentDetails(payment);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setStatus('error');
      setMessage(
        err.response?.data?.error || 
        'An error occurred while verifying your payment. Please contact support.'
      );
    }
  };

  const handleRedirect = () => {
    if (paymentDetails && status === 'success') {
      const rentMeta = paymentDetails.gateway_response?.metadata;
      if (rentMeta?.purpose === 'rent' && rentMeta?.booking_id) {
        // Redirect back to rent flow page for first payment
        if (rentMeta?.payment_mode === 'first') {
          navigate(`/tenant/rent-flow/${rentMeta.booking_id}?payment_success=true`);
          return;
        }
        // Redirect to rent tracker for monthly/full payments
        navigate('/tenant/rent-tracker?payment_success=true');
        return;
      }
      // Redirect to success page with payment details
      const params = new URLSearchParams({
        payment_type: paymentDetails.payment_type,
        amount: paymentDetails.amount,
        transaction_id: paymentDetails.transaction_uuid || paymentDetails.gateway_transaction_id || 'N/A',
        gateway: paymentDetails.gateway,
        reference_id: paymentDetails.reference_id || ''
      });
      navigate(`/payment/success?${params.toString()}`);
    } else {
      // On failure or error, stay on verify page or go home
      if (status === 'failed' || status === 'error') {
        // User can retry from here
      } else {
        navigate('/');
      }
    }
  };

  const formatAmount = (amount) => {
    // Amount is in NPR, display directly
    return `Rs. ${parseFloat(amount).toLocaleString('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return <Loader2 className="w-20 h-20 animate-spin text-indigo-600" />;
      case 'success':
        return <CheckCircle className="w-20 h-20 text-green-600" />;
      case 'failed':
        return <XCircle className="w-20 h-20 text-red-600" />;
      case 'error':
        return <AlertCircle className="w-20 h-20 text-yellow-600" />;
      default:
        return <Loader2 className="w-20 h-20 animate-spin text-indigo-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'from-green-500 to-emerald-600';
      case 'failed':
        return 'from-red-500 to-rose-600';
      case 'error':
        return 'from-yellow-500 to-orange-600';
      default:
        return 'from-indigo-500 to-purple-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${getStatusColor()} p-8 text-white text-center`}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="flex justify-center mb-4"
          >
            {getStatusIcon()}
          </motion.div>
          <h1 className="text-2xl font-bold mb-2">
            {status === 'verifying' && 'Processing Payment'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'failed' && 'Payment Failed'}
            {status === 'error' && 'Payment Error'}
          </h1>
          <p className="text-white/90">{message}</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Payment Details */}
          {paymentDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4 mb-6"
            >
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-sm text-gray-900">
                    {paymentDetails.transaction_uuid}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-gray-900">
                    {formatAmount(paymentDetails.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gateway:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {paymentDetails.gateway}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Type:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {paymentDetails.payment_type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                    paymentDetails.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {paymentDetails.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Success Message with Auto Redirect */}
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-6"
            >
              <p className="text-gray-600 mb-2">
                Payment verified successfully!
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to success page in <span className="font-bold text-green-600">{countdown}</span> seconds...
              </p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === 'success' && (
              <button
                onClick={handleRedirect}
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}

            {(status === 'failed' || status === 'error') && (
              <>
                <button
                  onClick={() => navigate(-1)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Go to Home
                </button>
              </>
            )}
          </div>

          {/* Support Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Need help? {' '}
              <a href="/contact" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentVerify;
