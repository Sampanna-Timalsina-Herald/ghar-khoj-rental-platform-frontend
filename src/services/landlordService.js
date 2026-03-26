/**
 * Landlord Service
 * API service for landlord-specific operations including payment settings
 */

import api from '../api/axios';

/**
 * Get landlord's payment settings
 * @returns {Promise} Payment settings data
 */
export const getPaymentSettings = async () => {
  try {
    const response = await api.get('/landlord/payment-settings');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch payment settings:', error);
    throw error;
  }
};

/**
 * Update landlord's payment settings
 * @param {Object} settings - Payment settings to update
 * @param {string} settings.esewa_id - eSewa wallet phone number
 * @param {string} settings.khalti_id - Khalti wallet phone number
 * @param {string} settings.preferred_payment_method - 'khalti', 'esewa', or 'bank'
 * @param {string} settings.bank_name - Bank name (if bank is selected)
 * @param {string} settings.bank_account_name - Account holder name
 * @param {string} settings.bank_account_number - Bank account number
 * @returns {Promise} Updated payment settings
 */
export const updatePaymentSettings = async (settings) => {
  try {
    const response = await api.put('/landlord/payment-settings', settings);
    return response.data;
  } catch (error) {
    console.error('Failed to update payment settings:', error);
    throw error;
  }
};

/**
 * Get landlord's earnings grouped by property
 * @returns {Promise} Earnings data with summary and property breakdown
 */
export const getEarningsByProperty = async () => {
  try {
    const response = await api.get('/landlord/earnings');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch earnings:', error);
    throw error;
  }
};

export default {
  getPaymentSettings,
  updatePaymentSettings,
  getEarningsByProperty
};
