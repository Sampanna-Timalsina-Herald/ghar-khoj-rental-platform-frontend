import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { processKhaltiPayment, processEsewaPayment } from '../services/paymentService';
import khaltiLogo from '../assets/Khalti-logo.png';
import esewaLogo from '../assets/Esewa-logo.png';

/**
 * PaymentGatewayModal Component
 * Modal for selecting and processing payments via Khalti or eSewa
 */
const PaymentGatewayModal = ({ 
  isOpen, 
  onClose, 
  paymentData,
  onSuccess 
}) => {
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const gateways = [
    {
      id: 'khalti',
      name: 'Khalti',
      description: 'Pay with Khalti Digital Wallet',
      color: 'purple',
      bgColor: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
      logo: khaltiLogo
    },
    {
      id: 'esewa',
      name: 'eSewa',
      description: 'Pay with eSewa Digital Wallet',
      color: 'green',
      bgColor: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
      logo: esewaLogo
    }
  ];

  const handlePayment = async () => {
    if (!selectedGateway) {
      setError('Please select a payment gateway');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Prepare payment data
      const paymentRequest = {
        ...paymentData,
        gateway: selectedGateway
      };

      // Process payment based on selected gateway
      if (selectedGateway === 'khalti') {
        await processKhaltiPayment(paymentRequest);
      } else if (selectedGateway === 'esewa') {
        await processEsewaPayment(paymentRequest);
      }

      // The page will redirect to payment gateway
      // So this won't execute unless there's an error
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.error || err.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  const formatAmount = (amount) => {
    // Amount is in NPR, display directly
    return `Rs. ${parseFloat(amount).toLocaleString('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative">
            <button
              onClick={onClose}
              disabled={processing}
              className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <CreditCard className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Complete Payment</h2>
                <p className="text-indigo-100 text-sm">Choose your payment method</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Payment Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Amount to Pay:</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatAmount(paymentData.amount)}
                </span>
              </div>
              {paymentData.purchase_order_name && (
                <div className="text-sm text-gray-500 text-center">
                  {paymentData.purchase_order_name}
                </div>
              )}
            </div>

            {/* Gateway Selection */}
            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Payment Gateway
              </label>
              {gateways.map((gateway) => (
                <button
                  key={gateway.id}
                  onClick={() => setSelectedGateway(gateway.id)}
                  disabled={processing}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    selectedGateway === gateway.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${processing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center bg-white shadow-md p-1">
                      <img src={gateway.logo} alt={`${gateway.name} logo`} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900">{gateway.name} Payment</div>
                      <div className="text-sm text-gray-600">{gateway.description}</div>
                    </div>
                    {selectedGateway === gateway.id && (
                      <CheckCircle className="w-6 h-6 text-indigo-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Payment Error</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Security Notice */}
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Your payment is secured with 256-bit encryption. You will be redirected to the payment gateway to complete your transaction.</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={processing}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={!selectedGateway || processing}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Pay Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentGatewayModal;
