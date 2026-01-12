import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../api/axios'
import { Loader2, ArrowLeft, Upload, X, CheckCircle2 } from 'lucide-react'
import CollegeSelect from '../../components/CollegeSelect'

const EditListing = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rent_amount: '',
    bedrooms: '',
    bathrooms: '',
    address: '',
    city: '',
    college_name: '',
    deposit_amount: '',
    furnished: 'semi',
    type: 'apartment',
  })
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchListing()
  }, [id])

  const fetchListing = async () => {
    try {
      const response = await api.get(`/listings/${id}`)
      const listing = response.data.data
      
      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        rent_amount: listing.rent_amount || '',
        bedrooms: listing.bedrooms || '',
        bathrooms: listing.bathrooms || '',
        address: listing.address || '',
        city: listing.city || '',
        college_name: listing.college_name || '',
        deposit_amount: listing.deposit_amount || '',
        furnished: listing.furnished || 'semi',
        type: listing.type || 'apartment',
      })
      
      if (listing.images && Array.isArray(listing.images)) {
        setExistingImages(listing.images)
      }
    } catch (err) {
      console.error('Failed to fetch listing:', err)
      setError(err.response?.data?.error || 'Failed to load listing')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setImages(files)
    
    // Create previews
    const previews = files.map(file => URL.createObjectURL(file))
    setImagePreviews(previews)
  }

  const removeNewImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setUpdating(true)

    try {
      const submitData = new FormData()
      
      // Add form fields
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          submitData.append(key, formData[key])
        }
      })
      
      // Add new images
      images.forEach((image) => {
        submitData.append('images', image)
      })
      
      // Add existing images to keep
      existingImages.forEach((imageUrl) => {
        submitData.append('existingImages', imageUrl)
      })

      await api.put(`/listings/${id}`, submitData)

      setSuccess(true)
      setTimeout(() => {
        navigate('/landlord/listings')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to update listing')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={32} className="animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/landlord/listings')}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 font-semibold"
      >
        <ArrowLeft size={20} />
        Back to Listings
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 md:p-8"
      >
        <h1 className="text-3xl font-bold text-text mb-8">Edit Listing</h1>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
          >
            <CheckCircle2 size={24} className="text-green-600" />
            <span className="text-green-700 font-semibold">Listing updated successfully!</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-text">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="title"
                placeholder="Property Title"
                value={formData.title}
                onChange={handleChange}
                required
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
              />
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
              >
                <option value="apartment">Apartment</option>
                <option value="room">Room</option>
                <option value="studio">Studio</option>
                <option value="house">House</option>
                <option value="shared">Shared</option>
              </select>
            </div>

            <textarea
              name="description"
              placeholder="Property Description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
            />
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-text">Location Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="address"
                placeholder="Full Address"
                value={formData.address}
                onChange={handleChange}
                required
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                required
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
              />
              <CollegeSelect
                value={formData.college_name}
                onChange={(collegeName) => setFormData(prev => ({ ...prev, college_name: collegeName }))}
                label="Near College/University"
                placeholder="Select nearby college (Optional)"
                showLocation={true}
              />
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-text">Property Details</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <input
                type="number"
                name="bedrooms"
                placeholder="Bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                min="1"
                required
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
              />
              <input
                type="number"
                name="bathrooms"
                placeholder="Bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                min="1"
                required
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
              />
              <select
                name="furnished"
                value={formData.furnished}
                onChange={handleChange}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
              >
                <option value="unfurnished">Unfurnished</option>
                <option value="semi">Semi-furnished</option>
                <option value="furnished">Furnished</option>
              </select>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-text">Pricing Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                name="rent_amount"
                placeholder="Monthly Rent"
                value={formData.rent_amount}
                onChange={handleChange}
                min="0"
                required
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
              />
              <input
                type="number"
                name="deposit_amount"
                placeholder="Security Deposit (Optional)"
                value={formData.deposit_amount}
                onChange={handleChange}
                min="0"
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
              />
            </div>
          </div>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-text">Current Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingImages.map((image, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="relative rounded-lg overflow-hidden"
                  >
                    <img
                      src={
                        image.startsWith('http')
                          ? image
                          : `http://localhost:5000${image}`
                      }
                      alt={`Listing ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Images Upload */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-text">
              {existingImages.length > 0 ? 'Add More Images' : 'Upload Images'}
            </h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-600 transition-colors"
              onClick={() => document.getElementById('imageInput').click()}
            >
              <Upload size={32} className="mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600">Click to upload images or drag and drop</p>
              <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB each</p>
              <input
                id="imageInput"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="relative rounded-lg overflow-hidden"
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/landlord/listings')}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={updating}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updating ? <Loader2 size={20} className="animate-spin" /> : null}
              {updating ? 'Updating...' : 'Update Listing'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default EditListing
