/**
 * Payment Service
 * Handles payment gateway operations for Khalti and eSewa
 */

import api from '../api/axios';

/**
 * Initiate a payment
 * @param {Object} paymentData - Payment details
 * @param {string} paymentData.payment_type - 'subscription' or 'commission'
 * @param {string} paymentData.reference_id - ID of subscription plan or commission transaction
 * @param {string} paymentData.gateway - 'khalti' or 'esewa'
 * @param {number} paymentData.amount - Amount in paisa/smallest unit
 * @param {Object} paymentData.customer_info - Customer details (optional for eSewa)
 * @param {string} paymentData.purchase_order_name - Description of purchase
 * @returns {Promise} Payment initiation response
 */
export const initiatePayment = async (paymentData) => {
  try {
    const response = await api.post('/payments/initiate', paymentData);
    return response.data;
  } catch (error) {
    console.error('Payment initiation failed:', error);
    throw error;
  }
};

/**
 * Verify payment after gateway callback
 * @param {Object} params - Query parameters from gateway callback
 * @returns {Promise} Payment verification response
 */
export const verifyPayment = async (params) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/payments/verify?${queryString}`);
    return response.data;
  } catch (error) {
    console.error('Payment verification failed:', error);
    throw error;
  }
};

/**
 * Get user's payment history
 * @param {Object} filters - Optional filters
 * @returns {Promise} List of payments
 */
export const getMyPayments = async (filters = {}) => {
  try {
    const queryString = new URLSearchParams(filters).toString();
    const response = await api.get(`/payments/my-payments?${queryString}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    throw error;
  }
};

/**
 * Get payment details by ID
 * @param {string} paymentId - Payment ID
 * @returns {Promise} Payment details
 */
export const getPaymentDetails = async (paymentId) => {
  try {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch payment details:', error);
    throw error;
  }
};

/**
 * Get all payments (Admin only)
 * @param {Object} filters - Optional filters
 * @returns {Promise} List of all payments
 */
export const getAllPayments = async (filters = {}) => {
  try {
    const queryString = new URLSearchParams(filters).toString();
    const response = await api.get(`/payments/admin/all?${queryString}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch all payments:', error);
    throw error;
  }
};

/**
 * Get payment analytics (Admin only)
 * @param {Object} params - Analytics parameters
 * @returns {Promise} Payment analytics data
 */
export const getPaymentAnalytics = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/payments/admin/analytics?${queryString}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch payment analytics:', error);
    throw error;
  }
};

/**
 * Refund a payment (Admin only, Khalti only)
 * @param {string} paymentId - Payment ID to refund
 * @param {Object} refundData - Refund details
 * @returns {Promise} Refund response
 */
export const refundPayment = async (paymentId, refundData) => {
  try {
    const response = await api.post(`/payments/admin/refund/${paymentId}`, refundData);
    return response.data;
  } catch (error) {
    console.error('Payment refund failed:', error);
    throw error;
  }
};

/**
 * Process Khalti payment
 * Redirects user to Khalti payment page
 * @param {Object} paymentData - Payment details
 */
export const processKhaltiPayment = async (paymentData) => {
  const response = await initiatePayment({
    ...paymentData,
    gateway: 'khalti'
  });

  if (response.success && response.data.payment_url) {
    // Redirect to Khalti payment page
    window.location.href = response.data.payment_url;
  } else {
    throw new Error('Failed to initiate Khalti payment');
  }
};

/**
 * Process eSewa payment
 * Creates and submits form to eSewa
 * @param {Object} paymentData - Payment details
 */
export const processEsewaPayment = async (paymentData) => {
  const response = await initiatePayment({
    ...paymentData,
    gateway: 'esewa'
  });

  if (response.success && response.data.form_data) {
    // Create and submit eSewa form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = response.data.payment_url;

    // Add form fields
    Object.entries(response.data.form_data).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    // Submit form
    document.body.appendChild(form);
    form.submit();
  } else {
    throw new Error('Failed to initiate eSewa payment');
  }
};

export default {
  initiatePayment,
  verifyPayment,
  getMyPayments,
  getPaymentDetails,
  getAllPayments,
  getPaymentAnalytics,
  refundPayment,
  processKhaltiPayment,
  processEsewaPayment
};
