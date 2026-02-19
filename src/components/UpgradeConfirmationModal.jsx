import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, TrendingUp, Calendar, DollarSign } from 'lucide-react';

/**
 * UpgradeConfirmationModal Component
 * Shows confirmation dialog when user wants to upgrade their subscription plan
 */
const UpgradeConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  currentPlan, 
  newPlan, 
  billingCycle 
}) => {
  if (!isOpen || !currentPlan || !newPlan) return null;

  const getPrice = (plan) => {
    return billingCycle === 'annual' ? plan.annual_price : plan.monthly_price;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Content */}
          <div className="p-8">
            {/* Icon */}
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Confirm Plan Upgrade
            </h2>
            <p className="text-gray-600 text-center mb-6">
              You're about to upgrade your subscription plan
            </p>

            {/* Plan Comparison */}
            <div className="space-y-4 mb-6">
              {/* Current Plan */}
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Current Plan</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    currentPlan.tier === 1 ? 'bg-amber-100 text-amber-700' :
                    currentPlan.tier === 2 ? 'bg-blue-100 text-blue-700' : 
                    'bg-purple-100 text-purple-700'
                  }`}>
                    TIER {currentPlan.tier}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {currentPlan.display_name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    NPR {getPrice(currentPlan).toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-600">
                    per {billingCycle === 'annual' ? 'year' : 'month'}
                  </span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-1" />
                  Expires: {new Date(currentPlan.end_date).toLocaleDateString()}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>

              {/* New Plan */}
              <div className="bg-indigo-50 rounded-lg p-4 border-2 border-indigo-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-indigo-600">New Plan</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    newPlan.tier === 1 ? 'bg-amber-100 text-amber-700' :
                    newPlan.tier === 2 ? 'bg-blue-100 text-blue-700' : 
                    'bg-purple-100 text-purple-700'
                  }`}>
                    TIER {newPlan.tier}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {newPlan.display_name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-indigo-900">
                    NPR {getPrice(newPlan).toLocaleString()}
                  </span>
                  <span className="text-sm text-indigo-700">
                    per {billingCycle === 'annual' ? 'year' : 'month'}
                  </span>
                </div>
                <div className="mt-2 flex items-center text-sm text-indigo-700">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Up to {newPlan.max_properties} properties
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Important:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Your current <strong>{currentPlan.display_name}</strong> plan will be replaced</li>
                    <li>Remaining time on current plan will be forfeited</li>
                    <li>New plan starts immediately after payment</li>
                    <li>You will be charged <strong>NPR {getPrice(newPlan).toLocaleString()}</strong> now</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Confirm Upgrade
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UpgradeConfirmationModal;
