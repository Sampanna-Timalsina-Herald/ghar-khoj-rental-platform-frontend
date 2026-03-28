import React, { useEffect, useState } from 'react';
import { Loader2, Calendar, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'sonner';
import ReceiptDownloadButton from '../../components/ReceiptDownloadButton';

const AdminSubscriptionHistory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', '500');

      const response = await api.get(`/subscriptions/admin/history?${params.toString()}`);
      setRows(response.data.data || []);
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch subscription history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (subscriptionId, userName) => {
    setConfirmDelete({ id: subscriptionId, userName });
  };

  const confirmDeleteAction = async () => {
    const subscriptionId = confirmDelete.id;
    setDeletingId(subscriptionId);
    setConfirmDelete(null);

    try {
      await api.delete(`/subscriptions/admin/${subscriptionId}`);
      toast.success('Subscription deleted successfully');
      // Remove from local state
      setRows(rows.filter(row => row.id !== subscriptionId));
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast.error(error.response?.data?.error || 'Failed to delete subscription');
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription History</h1>
            <p className="text-gray-600 mt-2">View all subscriptions (active, cancelled, expired)</p>
          </div>
          <button
            onClick={() => navigate('/admin/subscriptions')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Back to Subscriptions
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billing</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latest Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-10 text-center text-gray-500">No subscription history found</td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{row.user_name}</div>
                          <div className="text-sm text-gray-500">{row.user_email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{row.plan_display_name}</div>
                          <div className="text-xs text-gray-500 uppercase">{row.plan_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                            row.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : row.status === 'cancelled'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{row.billing_cycle}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">NPR {(Number(row.amount_paid) || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(row.start_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(row.end_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="font-medium">{row.latest_action || '-'}</div>
                          <div className="text-xs text-gray-500">{row.latest_note || '-'}</div>
                          {row.latest_action_at && (
                            <div className="text-xs text-gray-400 mt-1 inline-flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(row.latest_action_at).toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(row.transaction_uuid || row.payment_reference) ? (
                            <ReceiptDownloadButton
                              transactionUuid={row.transaction_uuid || row.payment_reference}
                              hasReceipt={!!row.receipt_url}
                              variant="icon"
                              size="sm"
                            />
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDelete(row.id, row.user_name)}
                            disabled={deletingId === row.id}
                            className={`p-2 rounded-md transition-colors ${
                              deletingId === row.id
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                            }`}
                            title="Delete subscription"
                          >
                            {deletingId === row.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Subscription</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700">
                  Are you sure you want to delete the subscription for{' '}
                  <span className="font-semibold text-gray-900">{confirmDelete.userName}</span>?
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  ⚠️ This will permanently delete the subscription and all its history.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAction}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubscriptionHistory;
