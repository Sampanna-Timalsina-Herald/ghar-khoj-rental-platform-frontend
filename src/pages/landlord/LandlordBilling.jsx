/**
 * Landlord Billing Dashboard
 * Shows commission owed, payment history, and invoices for landlords
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, FileText, Clock, CheckCircle, AlertCircle,
  Download, Calendar, Home, Eye, Info, CreditCard
} from 'lucide-react';
import api from '../../api/axios';
import jsPDF from 'jspdf';

const LandlordBillingDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [policy, setPolicy] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // pending, paid, all
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, policyRes] = await Promise.all([
        api.get('/landlord/commissions/dashboard'),
        api.get('/landlord/commissions/policy')
      ]);

      if (dashboardRes.data.success) {
        setSummary(dashboardRes.data.data.summary);
        setTransactions(dashboardRes.data.data.transactions);
      }

      if (policyRes.data.success) {
        setPolicy(policyRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceDetails = async (invoiceId) => {
    try {
      console.log('[BILLING] Fetching invoice details for ID:', invoiceId);
      const response = await api.get(`/landlord/commissions/invoice/${invoiceId}`);
      console.log('[BILLING] Invoice response:', response.data);
      
      if (response.data.success) {
        setSelectedInvoice(response.data.data);
        setShowInvoiceModal(true);
      } else {
        console.error('[BILLING] Failed to fetch invoice:', response.data.error);
        alert('Failed to load invoice: ' + response.data.error);
      }
    } catch (error) {
      console.error('[BILLING] Error fetching invoice:', error);
      console.error('[BILLING] Error response:', error.response?.data);
      alert('Failed to load invoice. Please try again.');
    }
  };

  const downloadInvoicePDF = (invoice) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Header with clean design
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('KHOJGHAR', margin, 22);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Property Rental Platform', margin, 29);

    // Invoice title (right aligned)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - margin, 22, { align: 'right' });

    // Top separator line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, 36, pageWidth - margin, 36);

    // Invoice meta info (right aligned)
    let yPos = 46;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('Invoice Number', pageWidth - margin, yPos, { align: 'right' });
    yPos += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(invoice.invoice_number || 'N/A', pageWidth - margin, yPos, { align: 'right' });
    
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text('Issue Date', pageWidth - margin, yPos, { align: 'right' });
    yPos += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(formatDate(invoice.created_at), pageWidth - margin, yPos, { align: 'right' });

    // Bill To section
    yPos = 76;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('BILL TO', margin, yPos);
    
    yPos += 7;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.landlord_name || 'Landlord', margin, yPos);
    yPos += 6;
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(invoice.landlord_email || '', margin, yPos);

    // Booking Details Section
    yPos = 104;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('BOOKING DETAILS', margin, yPos);
    
    yPos += 8;
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 6;

    const details = [
      ['Property', invoice.listing_title || 'N/A'],
      ['Location', `${invoice.address || ''}, ${invoice.city || ''}`],
      ['Rental Period', `${formatDate(invoice.start_date)} - ${formatDate(invoice.end_date)}`],
      ['Tenant', invoice.tenant_name || 'N/A'],
      ['Tenant Email', invoice.tenant_email || 'N/A']
    ];

    doc.setFontSize(9);
    details.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60, 60, 60);
      doc.text(label + ':', margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(value, margin + 35, yPos);
      yPos += 5;
    });

    // Commission Breakdown
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('COMMISSION BREAKDOWN', margin, yPos);
    
    yPos += 8;
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 2;

    // Table header with subtle background
    yPos += 8;
    doc.setFillColor(248, 248, 248);
    doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
    doc.setDrawColor(210, 210, 210);
    doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'S');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('DESCRIPTION', margin + 2, yPos);
    doc.text('AMOUNT', pageWidth - margin - 2, yPos, { align: 'right' });
    yPos += 8;

    // Table rows
    doc.setFont('helvetica', 'normal');
    const monthlyRent = invoice.monthly_rent || invoice.rent_amount;
    const rentalMonths = invoice.calculated_rental_months || 1;
    const totalRent = invoice.total_rent_amount || invoice.rent_amount;

    const rows = [
      ['Monthly Rent', formatCurrency(monthlyRent)],
      ['Rental Period', `${rentalMonths} month(s)`],
      ['Total Rent Amount', formatCurrency(totalRent)],
      ['Commission Rate', `${invoice.commission_rate}%`]
    ];

    rows.forEach(([desc, amount]) => {
      doc.setTextColor(60, 60, 60);
      doc.text(desc, margin + 2, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(amount, pageWidth - margin - 2, yPos, { align: 'right' });
      yPos += 6;
    });

    // Separator before total
    yPos += 3;
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Total section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('TOTAL COMMISSION DUE', margin + 2, yPos);
    doc.setFontSize(13);
    doc.text(formatCurrency(invoice.commission_amount), pageWidth - margin - 2, yPos, { align: 'right' });
    
    yPos += 4;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    // Payment Information
    yPos += 18;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('PAYMENT INFORMATION', margin, yPos);
    
    yPos += 8;
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 6;

    const paymentInfo = [
      ['Status', invoice.payment_status.toUpperCase()],
      ['Due Date', formatDate(invoice.due_date)]
    ];

    if (invoice.payment_date) {
      paymentInfo.push(['Payment Date', formatDate(invoice.payment_date)]);
      paymentInfo.push(['Payment Method', invoice.payment_method || 'N/A']);
      if (invoice.payment_reference) {
        paymentInfo.push(['Reference', invoice.payment_reference]);
      }
    }

    doc.setFontSize(9);
    paymentInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60, 60, 60);
      doc.text(label + ':', margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(value, margin + 35, yPos);
      yPos += 5;
    });

    // Footer
    yPos = pageHeight - 22;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    
    yPos += 5;
    doc.setFontSize(8);
    doc.setTextColor(110, 110, 110);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for using KHOJGHAR Platform', margin, yPos);
    
    yPos += 4;
    doc.text('For inquiries, please contact: support@khojghar.com', margin, yPos);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, yPos, { align: 'right' });

    // Save PDF
    doc.save(`Invoice-${invoice.invoice_number || 'KHOJGHAR'}.pdf`);
  };

  const formatCurrency = (amount) => {
    return `Rs. ${parseFloat(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      paid: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, text: 'Paid' },
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, text: 'Pending' },
      overdue: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle, text: 'Overdue' }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
        <Icon size={14} />
        {badge.text}
      </span>
    );
  };

  const getFilteredTransactions = () => {
    if (activeTab === 'pending') {
      return transactions.filter(t => t.payment_status === 'pending' || t.payment_status === 'overdue');
    } else if (activeTab === 'paid') {
      return transactions.filter(t => t.payment_status === 'paid');
    }
    return transactions;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Billing & Commissions</h1>
        <p className="text-gray-600 mt-1">Manage your commission payments and view invoices</p>
      </motion.div>

      {/* Commission Policy Info */}
      {policy && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-2">Commission Policy</h3>
              <p className="text-sm text-blue-800 mb-3">{policy.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/50 p-3 rounded-lg">
                  <p className="text-blue-600 font-medium">Commission Rate</p>
                  <p className="text-blue-900 font-bold text-lg">{policy.commission_rate}%</p>
                </div>
                <div className="bg-white/50 p-3 rounded-lg">
                  <p className="text-blue-600 font-medium">Minimum Commission</p>
                  <p className="text-blue-900 font-bold text-lg">{formatCurrency(policy.minimum_commission)}</p>
                </div>
                <div className="bg-white/50 p-3 rounded-lg">
                  <p className="text-blue-600 font-medium">Payment Terms</p>
                  <p className="text-blue-900 font-semibold">{policy.payment_terms}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <AlertCircle size={24} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-red-100">Amount Owed</h3>
          <p className="text-3xl font-bold mt-2">
            {formatCurrency(parseFloat(summary?.pending_amount || 0) + parseFloat(summary?.overdue_amount || 0))}
          </p>
          <p className="text-xs text-red-100 mt-2">
            {(summary?.pending_count || 0) + (summary?.overdue_count || 0)} unpaid invoice(s)
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <CheckCircle size={24} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-green-100">Total Paid</h3>
          <p className="text-3xl font-bold mt-2">{formatCurrency(summary?.paid_amount)}</p>
          <p className="text-xs text-green-100 mt-2">{summary?.paid_count || 0} paid transaction(s)</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Clock size={24} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-yellow-100">Pending</h3>
          <p className="text-3xl font-bold mt-2">{formatCurrency(summary?.pending_amount)}</p>
          <p className="text-xs text-yellow-100 mt-2">{summary?.pending_count || 0} pending</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <FileText size={24} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-blue-100">Total Commissions</h3>
          <p className="text-3xl font-bold mt-2">{formatCurrency(summary?.total_commission_amount)}</p>
          <p className="text-xs text-blue-100 mt-2">{summary?.total_commissions || 0} transaction(s)</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'pending'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Pending Payments ({(summary?.pending_count || 0) + (summary?.overdue_count || 0)})
            </button>
            <button
              onClick={() => setActiveTab('paid')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'paid'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Payment History ({summary?.paid_count || 0})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Transactions ({summary?.total_commissions || 0})
            </button>
          </div>
        </div>

        {/* Transaction List */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {getFilteredTransactions().length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No transactions found</p>
                </div>
              ) : (
                getFilteredTransactions().map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900 text-lg">{transaction.listing_title}</h3>
                          {getStatusBadge(transaction.payment_status)}
                        </div>
                        <p className="text-sm text-gray-600">{transaction.address}, {transaction.city}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(transaction.commission_amount)}
                        </p>
                        <p className="text-xs text-gray-500">{transaction.commission_rate}% commission</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Invoice Number</p>
                        <p className="text-sm font-semibold text-gray-900">{transaction.invoice_number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Rent Amount</p>
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(transaction.rent_amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Due Date</p>
                        <p className="text-sm font-semibold text-gray-900">{formatDate(transaction.due_date)}</p>
                      </div>
                      {transaction.payment_date && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Payment Date</p>
                          <p className="text-sm font-semibold text-green-600">{formatDate(transaction.payment_date)}</p>
                        </div>
                      )}
                    </div>

                    {transaction.payment_method && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 text-green-800">
                          <CreditCard size={16} />
                          <span className="text-sm font-semibold">
                            Payment Method: {transaction.payment_method?.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        {transaction.payment_reference && (
                          <p className="text-xs text-green-700 mt-1">
                            Reference: {transaction.payment_reference}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fetchInvoiceDetails(transaction.id)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1.5"
                      >
                        <Eye size={14} />
                        View
                      </motion.button>
                      {transaction.payment_status === 'pending' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                          <p className="text-xs text-yellow-800 font-medium">
                            Payment due in {Math.ceil((new Date(transaction.due_date) - new Date()) / (1000 * 60 * 60 * 24))} days
                          </p>
                        </div>
                      )}
                      {transaction.payment_status === 'overdue' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                          <p className="text-xs text-red-800 font-medium">
                            Overdue by {Math.ceil((new Date() - new Date(transaction.due_date)) / (1000 * 60 * 60 * 24))} days
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Invoice Details</h3>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-2">KHOJGHAR Platform</h4>
                <p className="text-sm text-gray-600">Commission Invoice</p>
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600">Invoice Number</p>
                  <p className="font-bold text-gray-900">{selectedInvoice.invoice_number}</p>
                  <p className="text-xs text-gray-600 mt-2">Issue Date</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedInvoice.created_at)}</p>
                </div>
              </div>

              {/* Property & Booking Details */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Booking Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property:</span>
                    <span className="font-semibold text-gray-900">{selectedInvoice.listing_title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-semibold text-gray-900">{selectedInvoice.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rental Period:</span>
                    <span className="font-semibold text-gray-900">
                      {formatDate(selectedInvoice.start_date)} - {formatDate(selectedInvoice.end_date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tenant:</span>
                    <span className="font-semibold text-gray-900">{selectedInvoice.tenant_name}</span>
                  </div>
                </div>
              </div>

              {/* Commission Breakdown */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-bold text-gray-900 mb-3">Commission Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monthly Rent:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(selectedInvoice.monthly_rent || selectedInvoice.rent_amount)}
                    </span>
                  </div>
                  {selectedInvoice.calculated_rental_months && selectedInvoice.calculated_rental_months > 1 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Rental Period:</span>
                        <span className="font-semibold text-gray-900">
                          {selectedInvoice.calculated_rental_months} months
                        </span>
                      </div>
                      <div className="flex justify-between text-sm bg-blue-50 p-2 rounded">
                        <span className="text-gray-600">Total Rent (Full Period):</span>
                        <span className="font-semibold text-blue-900">
                          {formatCurrency(selectedInvoice.total_rent_amount || selectedInvoice.rent_amount)}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Commission Rate:</span>
                    <span className="font-semibold text-gray-900">{selectedInvoice.commission_rate}%</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="font-bold text-gray-900">Total Commission Due:</span>
                    <span className="font-bold text-red-600 text-xl">
                      {formatCurrency(selectedInvoice.commission_amount)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 italic mt-2">
                    Commission calculated on total rental amount for {selectedInvoice.calculated_rental_months || 1} month(s)
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 mb-2">Payment Information</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-blue-800">
                    <span className="font-semibold">Status:</span> {selectedInvoice.payment_status.toUpperCase()}
                  </p>
                  <p className="text-blue-800">
                    <span className="font-semibold">Due Date:</span> {formatDate(selectedInvoice.due_date)}
                  </p>
                  {selectedInvoice.payment_date && (
                    <>
                      <p className="text-blue-800">
                        <span className="font-semibold">Payment Date:</span> {formatDate(selectedInvoice.payment_date)}
                      </p>
                      <p className="text-blue-800">
                        <span className="font-semibold">Payment Method:</span> {selectedInvoice.payment_method}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {selectedInvoice.notes && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => downloadInvoicePDF(selectedInvoice)}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Download PDF
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowInvoiceModal(false)}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LandlordBillingDashboard;
