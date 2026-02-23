/**
 * Receipt Viewer Modal Component
 * Displays payment receipts with download option
 */

import React, { useState, useEffect } from 'react';
import { X, Download, Loader2, FileText } from 'lucide-react';
import api from '../api/axios';

const ReceiptViewerModal = ({ transactionUuid, isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (isOpen && transactionUuid) {
      loadReceipt();
    }

    return () => {
      // Cleanup blob URL when component unmounts  
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [isOpen, transactionUuid]);

  const loadReceipt = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/payments/${transactionUuid}/receipt/view`, {
        responseType: 'blob'
      });

      // Create blob URL for PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error('Error loading receipt:', err);
      const errorMsg = err.response?.data?.error || err.response?.statusText || 'Failed to load receipt';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReceipt = async () => {
    try {
      setGenerating(true);
      setError(null);

      // Call regenerate endpoint
      await api.post(`/payments/${transactionUuid}/regenerate-receipt`, {
        send_email: false
      });

      // Reload the receipt
      await loadReceipt();
    } catch (err) {
      console.error('Error generating receipt:', err);
      setError(err.response?.data?.error || 'Failed to generate receipt');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await api.get(`/payments/${transactionUuid}/receipt`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt_${transactionUuid}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading receipt:', err);
      alert('Failed to download receipt. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Payment Receipt</h3>
            <div className="flex items-center gap-2">
              {!loading && !error && (
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="relative" style={{ height: 'calc(100vh - 200px)' }}>
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading receipt...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-red-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Receipt Not Available</h4>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleGenerateReceipt}
                      disabled={generating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          Generate Receipt
                        </>
                      )}
                    </button>
                    <button
                      onClick={loadReceipt}
                      disabled={generating}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && pdfUrl && (
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title="Payment Receipt"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptViewerModal;
