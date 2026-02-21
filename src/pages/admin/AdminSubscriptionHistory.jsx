import React, { useEffect, useState } from 'react';
import { Loader2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';

const AdminSubscriptionHistory = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', '500');

      const response = await api.get(`/subscriptions/admin/history?${params.toString()}`);
      setRows(response.data.data || []);
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      addToast(error.response?.data?.error || 'Failed to fetch subscription history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-10 text-center text-gray-500">No subscription history found</td>
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptionHistory;
