import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { Trash2, MapPin, Bed, Bath, Ruler } from 'lucide-react'

const TenantFavorites = () => {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/api/favorites')
      setFavorites(response.data.data)
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (id) => {
    try {
      await api.delete(`/api/favorites/${id}`)
      setFavorites((prev) => prev.filter((fav) => fav.id !== id))
    } catch (error) {
      console.error('Failed to remove favorite:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading favorites...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text">My Favorites</h1>
        <p className="text-gray-600 mt-2">Your saved property listings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.length > 0 ? (
          favorites.map((favorite) => (
            <div key={favorite.id} className="card overflow-hidden hover:shadow-xl transition-shadow">
              <img
                src={favorite.listing?.images?.[0] || '/placeholder.svg'}
                alt={favorite.listing?.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />

              <h3 className="text-lg font-bold text-text mb-2">{favorite.listing?.title}</h3>
              <p className="text-gray-600 text-sm mb-3 flex items-center gap-1">
                <MapPin size={16} />
                {favorite.listing?.location}
              </p>

              <div className="flex gap-4 mb-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Bed size={16} />
                  {favorite.listing?.bedrooms}
                </span>
                <span className="flex items-center gap-1">
                  <Bath size={16} />
                  {favorite.listing?.bathrooms}
                </span>
                <span className="flex items-center gap-1">
                  <Ruler size={16} />
                  {favorite.listing?.area}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <p className="text-2xl font-bold text-primary-600">
                  Rs. {favorite.listing?.price.toLocaleString()}
                </p>
                <button
                  onClick={() => handleRemove(favorite.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600">No favorites yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TenantFavorites
