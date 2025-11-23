import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { Plus, Edit2, Trash2 } from 'lucide-react'

const LandlordListings = () => {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return

    try {
      await api.delete(`/api/listings/${id}`)
      setListings((prev) => prev.filter((listing) => listing.id !== id))
    } catch (error) {
      console.error('Failed to delete listing:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading listings...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">My Listings</h1>
          <p className="text-gray-600 mt-2">Manage your property listings</p>
        </div>
        <button
          onClick={() => navigate('/landlord/listings/create')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Create Listing
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div key={listing.id} className="card overflow-hidden">
            {listing.images && listing.images[0] && (
              <img
                src={listing.images[0] || "/placeholder.svg"}
                alt={listing.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <h3 className="text-lg font-bold text-text mb-2">{listing.title}</h3>
            <p className="text-gray-600 text-sm mb-2">{listing.description?.substring(0, 100)}...</p>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xl font-bold text-primary-600">Rs. {listing.price.toLocaleString()}</p>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  listing.status === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : listing.status === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {listing.status}
              </span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 p-2 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors flex items-center justify-center gap-1 text-sm">
                <Edit2 size={16} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(listing.id)}
                className="flex-1 p-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-1 text-sm"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {listings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No listings yet</p>
          <button
            onClick={() => navigate('/landlord/listings/create')}
            className="btn-primary"
          >
            Create Your First Listing
          </button>
        </div>
      )}
    </div>
  )
}

export default LandlordListings
