/**
 * Payment Receipt Service
 * Handles receipt download operations
 */

import api from '../api/axios';

/**
 * Download payment receipt
 * @param {string} paymentId - Payment ID or transaction UUID
 * @returns {Promise<void>}
 */
export const downloadPaymentReceipt = async (paymentId) => {
  try {
    const response = await api.get(`/payments/${paymentId}/receipt`, {
      responseType: 'blob' // Important for file download
    });

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `receipt_${paymentId}.pdf`);
    
    // Append to html link element page
    document.body.appendChild(link);
    
    // Start download
    link.click();
    
    // Clean up and remove the link
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading receipt:', error);
    throw error;
  }
};

/**
 * Regenerate payment receipt
 * @param {string} paymentId - Payment ID or transaction UUID
 * @param {boolean} sendEmail - Whether to send receipt via email
 * @returns {Promise<Object>}
 */
export const regeneratePaymentReceipt = async (paymentId, sendEmail = false) => {
  try {
    const response = await api.post(
      `/payments/${paymentId}/regenerate-receipt`,
      null,
      {
        params: { send_email: sendEmail }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error regenerating receipt:', error);
    throw error;
  }
};

/**
 * Get payment details with receipt information
 * @param {string} paymentId - Payment ID or transaction UUID
 * @returns {Promise<Object>}
 */
export const getPaymentWithReceipt = async (paymentId) => {
  try {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw error;
  }
};

export default {
  downloadPaymentReceipt,
  regeneratePaymentReceipt,
  getPaymentWithReceipt
};
