import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { Loader, ArrowLeft } from 'lucide-react'

const CreateListing = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    location: '',
    type: 'apartment',
    furnished: 'semi',
  })
  const [images, setImages] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const submitData = new FormData()
      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key])
      })
      images.forEach((image) => {
        submitData.append('images', image)
      })

      await api.post('/api/listings', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      navigate('/landlord/listings')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/landlord/listings')}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
      >
        <ArrowLeft size={20} />
        Back to Listings
      </button>

      <div className="card">
        <h1 className="text-3xl font-bold text-text mb-8">Create New Listing</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-field"
                placeholder="Beautiful 2BHK Apartment"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Price (Monthly)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="input-field"
                placeholder="25000"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field min-h-24"
              placeholder="Describe your property..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Bedrooms</label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Bathrooms</label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Area (sqft)</label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Defense, Lahore"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Property Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="input-field"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="studio">Studio</option>
                <option value="shared">Shared Room</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Furnished</label>
              <select
                name="furnished"
                value={formData.furnished}
                onChange={handleChange}
                className="input-field"
              >
                <option value="unfurnished">Unfurnished</option>
                <option value="semi">Semi-Furnished</option>
                <option value="furnished">Fully Furnished</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Upload Images</label>
            <input
              type="file"
              multiple
              onChange={handleImageChange}
              className="block w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer"
              accept="image/*"
            />
            {images.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">{images.length} image(s) selected</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader size={20} className="animate-spin" />}
            {loading ? 'Creating Listing...' : 'Create Listing'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateListing
