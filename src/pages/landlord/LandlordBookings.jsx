import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { 
  Calendar, User, Mail, Phone, DollarSign, FileText,
  CheckCircle, XCircle, Loader2, MessageSquare
} from 'lucide-react';

const LandlordBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings/my-bookings');
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setMessage({ type: 'error', text: 'Failed to load bookings' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      setActionLoading(bookingId);
      const response = await api.put(`/bookings/${bookingId}/approve`);
      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: 'Booking approved! Waiting for tenant to review and accept the agreement.' 
        });
        fetchBookings();
      }
    } catch (error) {
      console.error('Failed to approve booking:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to approve booking' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const handleReject = async () => {
    if (!selectedBooking || !rejectionReason.trim()) {
      setMessage({ type: 'error', text: 'Please provide a reason for rejection' });
      return;
    }

    try {
      setActionLoading(selectedBooking.id);
      const response = await api.put(`/bookings/${selectedBooking.id}/reject`, {
        rejection_reason: rejectionReason
      });
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Booking rejected' });
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedBooking(null);
        fetchBookings();
      }
    } catch (error) {
      console.error('Failed to reject booking:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to reject booking' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending Review' },
      approved: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Awaiting Tenant Acceptance' },
      active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active Rental' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
      expired: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Expired' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelled' }
    };

    const badge = badges[status] || badges.pending;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={40} className="animate-spin text-primary-600" />
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
        <h1 className="text-3xl font-bold text-gray-900">Booking Requests</h1>
        <p className="text-gray-600 mt-1">Manage tenant booking requests</p>
      </motion.div>

      {/* Message */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-md p-12 text-center"
        >
          <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No booking requests</h3>
          <p className="text-gray-500">You don't have any booking requests yet</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{booking.listing_title}</h3>
                      {getStatusBadge(booking.status)}
                    </div>
                    <p className="text-gray-600 text-sm">{booking.listing_address}, {booking.listing_city}</p>
                  </div>
                  {booking.listing_images && booking.listing_images.length > 0 && (
                    <img
                      src={
                        booking.listing_images[0].startsWith('http')
                          ? booking.listing_images[0]
                          : `http://localhost:5000${booking.listing_images[0]}`
                      }
                      alt={booking.listing_title}
                      className="w-24 h-24 object-cover rounded-lg"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  {/* Tenant Info */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <User size={18} className="text-primary-600" />
                      Tenant Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <User size={14} />
                        <span>{booking.tenant_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail size={14} />
                        <span>{booking.tenant_email}</span>
                      </div>
                      {booking.tenant_phone && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone size={14} />
                          <span>{booking.tenant_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar size={18} className="text-primary-600" />
                      Booking Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar size={14} />
                        <span>Start: {formatDate(booking.start_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar size={14} />
                        <span>End: {formatDate(booking.end_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <DollarSign size={14} />
                        <span>Rent: Rs. {booking.monthly_rent?.toLocaleString()}/month</span>
                      </div>
                      {booking.security_deposit && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <DollarSign size={14} />
                          <span>Deposit: Rs. {booking.security_deposit?.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tenant Message */}
                {booking.message && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                      <MessageSquare size={16} className="text-primary-600" />
                      Message from Tenant
                    </h4>
                    <p className="text-gray-700 text-sm">{booking.message}</p>
                  </div>
                )}

                {/* Rejection Reason */}
                {booking.status === 'rejected' && booking.rejection_reason && (
                  <div className="bg-red-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-red-900 flex items-center gap-2 mb-2">
                      <XCircle size={16} />
                      Rejection Reason
                    </h4>
                    <p className="text-red-700 text-sm">{booking.rejection_reason}</p>
                  </div>
                )}

                {/* Actions */}
                {booking.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleApprove(booking.id)}
                      disabled={actionLoading === booking.id}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {actionLoading === booking.id ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          Approve Booking
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowRejectModal(true);
                      }}
                      disabled={actionLoading === booking.id}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      Reject
                    </motion.button>
                  </div>
                )}

                {/* Waiting for Tenant Acceptance */}
                {booking.status === 'approved' && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 text-sm font-medium">
                        ⏳ Waiting for tenant to review and accept the agreement
                      </p>
                    </div>
                  </div>
                )}

                {/* View Agreement for Active Bookings */}
                {booking.status === 'active' && (
                  <div className="pt-4 border-t border-gray-200">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/landlord/agreements')}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <FileText size={18} />
                      View Agreement
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Reject Booking</h2>
              <p className="text-gray-600 mb-4">Please provide a reason for rejecting this booking request:</p>
              
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedBooking(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    'Reject Booking'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandlordBookings;
