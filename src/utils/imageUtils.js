/**
 * Image Utility Functions
 * Handles image URL construction for different environments
 */

/**
 * Get the API base URL without /api suffix
 * @returns {string} Base URL for assets
 */
export const getAssetBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  // Remove /api suffix to get base URL
  return apiUrl.replace(/\/api\/?$/, '');
};

/**
 * Convert a relative or absolute image path to a full URL
 * @param {string} imagePath - Image path from API (can be relative or absolute)
 * @param {string} fallback - Fallback image path
 * @returns {string} Full image URL
 */
export const getImageUrl = (imagePath, fallback = '/placeholder.svg') => {
  if (!imagePath) return fallback;
  
  // If already a full URL (http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a Cloudinary URL pattern, return as is
  if (imagePath.includes('cloudinary.com') || imagePath.includes('res.cloudinary')) {
    return imagePath.startsWith('//') ? `https:${imagePath}` : imagePath;
  }
  
  // If it's a relative path, prepend the asset base URL
  const baseUrl = getAssetBaseUrl();
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * Get image URL from an array of images
 * @param {Array} images - Array of image paths
 * @param {number} index - Index of image to get (default: 0)
 * @param {string} fallback - Fallback image path
 * @returns {string} Full image URL
 */
export const getImageFromArray = (images, index = 0, fallback = '/placeholder.svg') => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return fallback;
  }
  
  const imagePath = images[index] || images[0];
  return getImageUrl(imagePath, fallback);
};

/**
 * Get listing image URL (handles both single image and array)
 * @param {Object} listing - Listing object
 * @param {number} index - Index of image to get (default: 0)
 * @returns {string} Full image URL
 */
export const getListingImageUrl = (listing, index = 0) => {
  if (!listing) return '/placeholder.svg';
  
  // Handle images array
  if (listing.images && Array.isArray(listing.images)) {
    return getImageFromArray(listing.images, index);
  }
  
  // Handle single image field
  if (listing.image) {
    return getImageUrl(listing.image);
  }
  
  // Handle image_url field
  if (listing.image_url) {
    return getImageUrl(listing.image_url);
  }
  
  return '/placeholder.svg';
};

export default {
  getAssetBaseUrl,
  getImageUrl,
  getImageFromArray,
  getListingImageUrl
};
