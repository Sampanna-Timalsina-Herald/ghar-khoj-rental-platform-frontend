import api from '../api/axios'
import { useAuthStore } from '../stores/authStore'

let refreshInterval = null

/**
 * Start automatic token refresh
 * Refreshes token every 1.5 hours (before 2h expiration)
 */
export const startTokenRefresh = () => {
  // Clear any existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }

  console.log('[TOKEN-REFRESH] Starting automatic token refresh (every 90 minutes)')

  // Refresh token every 1.5 hours (before 2h expiration)
  refreshInterval = setInterval(async () => {
    const authStore = useAuthStore.getState()
    
    if (authStore.isAuthenticated && authStore.accessToken) {
      try {
        console.log('[TOKEN-REFRESH] Attempting to refresh token...')
        
        const response = await api.post('/auth/refresh-token', {}, {
          withCredentials: true // Important: send cookies
        })
        
        if (response.data.accessToken) {
          authStore.setAccessToken(response.data.accessToken)
          console.log('[TOKEN-REFRESH] Token refreshed successfully')
        }
      } catch (error) {
        console.error('[TOKEN-REFRESH] Auto-refresh failed:', error.message)
        // Don't logout on refresh failure - let normal requests handle it
        // This prevents unnecessary logouts if there's a temporary network issue
      }
    } else {
      console.log('[TOKEN-REFRESH] User not authenticated, stopping refresh')
      stopTokenRefresh()
    }
  }, 90 * 60 * 1000) // 90 minutes (1.5 hours)
}

/**
 * Stop automatic token refresh
 */
export const stopTokenRefresh = () => {
  if (refreshInterval) {
    console.log('[TOKEN-REFRESH] Stopping automatic token refresh')
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

/**
 * Manually refresh token
 * Useful for refreshing token on user activity
 */
export const refreshTokenNow = async () => {
  const authStore = useAuthStore.getState()
  
  if (!authStore.isAuthenticated) {
    return false
  }

  try {
    console.log('[TOKEN-REFRESH] Manual token refresh...')
    
    const response = await api.post('/auth/refresh-token', {}, {
      withCredentials: true
    })
    
    if (response.data.accessToken) {
      authStore.setAccessToken(response.data.accessToken)
      console.log('[TOKEN-REFRESH] Manual refresh successful')
      return true
    }
    
    return false
  } catch (error) {
    console.error('[TOKEN-REFRESH] Manual refresh failed:', error.message)
    return false
  }
}
