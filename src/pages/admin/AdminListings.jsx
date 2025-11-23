import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Check, X, Loader } from 'lucide-react'

const AdminListings = () => {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      const response = await api.get('/api/listings')
      setListings(response.data.data)
    } catch (error) {
      console.error('Failed to fetch listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }))
    try {
      await api.put(`/api/admin/listings/${id}/approve`, {
        status: 'approved',
      })
      setListings((prev) =>
        prev.map((listing) =>
          listing.id === id ? { ...listing, status: 'approved' } : listing
        )
      )
    } catch (error) {
      console.error('Failed to approve listing:', error)
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }))
    }
  }

  const handleReject = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }))
    try {
      await api.put(`/api/admin/listings/${id}/reject`, {
        status: 'rejected',
      })
      setListings((prev) =>
        prev.map((listing) =>
          listing.id === id ? { ...listing, status: 'rejected' } : listing
        )
      )
    } catch (error) {
      console.error('Failed to reject listing:', error)
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }))
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading listings...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text">Manage Listings</h1>
        <p className="text-gray-600 mt-2">Review and approve property listings</p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text">Title</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text">Owner</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text">Price</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-text font-medium">{listing.title}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{listing.owner?.name}</td>
                <td className="px-6 py-4 text-sm font-semibold text-text">
                  Rs. {listing.price.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      listing.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : listing.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {listing.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {listing.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(listing.id)}
                        disabled={actionLoading[listing.id]}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                      >
                        {actionLoading[listing.id] ? (
                          <Loader size={16} className="animate-spin" />
                        ) : (
                          <Check size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(listing.id)}
                        disabled={actionLoading[listing.id]}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        {actionLoading[listing.id] ? (
                          <Loader size={16} className="animate-spin" />
                        ) : (
                          <X size={16} />
                        )}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminListings
