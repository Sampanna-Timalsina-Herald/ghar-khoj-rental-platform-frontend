/**
 * Favorites API utility functions
 * Centralized functions for managing favorites across the application
 */

import api from '../api/axios'

/**
 * Add a listing to user's favorites
 * @param {number} listingId - The listing ID to add
 * @returns {Promise<object>} API response
 */
export const addToFavorites = async (listingId) => {
  try {
    const response = await api.post('/favorites', { listing_id: listingId })
    console.log('Added to favorites:', response.data)
    return response
  } catch (error) {
    console.error('Error adding to favorites:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Remove a listing from user's favorites
 * @param {number} listingId - The listing ID to remove
 * @returns {Promise<object>} API response
 */
export const removeFromFavorites = async (listingId) => {
  try {
    const response = await api.delete(`/favorites/${listingId}`)
    console.log('Removed from favorites:', response.data)
    return response
  } catch (error) {
    console.error('Error removing from favorites:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Toggle favorite status of a listing
 * @param {number} listingId - The listing ID to toggle
 * @param {boolean} isFavorited - Current favorite status
 * @returns {Promise<object>} API response
 */
export const toggleFavorite = async (listingId, isFavorited) => {
  try {
    if (isFavorited) {
      return await removeFromFavorites(listingId)
    } else {
      return await addToFavorites(listingId)
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    throw error
  }
}

/**
 * Get all user's favorite listings
 * @returns {Promise<object>} API response with favorites array
 */
export const getFavorites = async () => {
  try {
    const response = await api.get('/favorites')
    console.log('Fetched favorites:', response.data)
    return response
  } catch (error) {
    console.error('Error fetching favorites:', error.response?.data || error.message)
    throw error
  }
}

export default {
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  getFavorites,
}
