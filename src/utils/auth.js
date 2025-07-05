// Auth utility functions

/**
 * Decode JWT token (basic decoding without verification)
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
export const decodeJWT = (token) => {
  try {
    if (!token) return null
    
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    
    return JSON.parse(decoded)
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token (raw or with Bearer prefix)
 * @returns {boolean} - true if expired, false if valid
 */
export const isTokenExpired = (token) => {
  try {
    // Handle both raw token and Bearer format for backward compatibility
    const rawToken = token && token.startsWith('Bearer ') ? token.substring(7) : token
    
    const decoded = decodeJWT(rawToken)
    if (!decoded || !decoded.exp) return true
    
    const currentTime = Date.now() / 1000
    return decoded.exp < currentTime
  } catch (error) {
    return true
  }
}

/**
 * Get token expiration time
 * @param {string} token - JWT token (raw or with Bearer prefix)
 * @returns {Date|null} - Expiration date or null
 */
export const getTokenExpiration = (token) => {
  try {
    // Handle both raw token and Bearer format for backward compatibility
    const rawToken = token && token.startsWith('Bearer ') ? token.substring(7) : token
    
    const decoded = decodeJWT(rawToken)
    if (!decoded || !decoded.exp) return null
    
    return new Date(decoded.exp * 1000)
  } catch (error) {
    return null
  }
}

/**
 * Get user info from JWT token
 * @param {string} token - JWT token (raw or with Bearer prefix)
 * @returns {object|null} - User info or null
 */
export const getUserFromToken = (token) => {
  try {
    // Handle both raw token and Bearer format for backward compatibility
    const rawToken = token && token.startsWith('Bearer ') ? token.substring(7) : token
    
    const decoded = decodeJWT(rawToken)
    if (!decoded) return null
    
    return {
      username: decoded.sub,
      issuer: decoded.iss,
      issuedAt: decoded.iat ? new Date(decoded.iat * 1000) : null,
      expiresAt: decoded.exp ? new Date(decoded.exp * 1000) : null,
      ...decoded
    }
  } catch (error) {
    return null
  }
}

/**
 * Format error message for display
 * @param {Error} error - Error object
 * @returns {string} - Formatted error message
 */
export const formatAuthError = (error) => {
  if (typeof error === 'string') return error
  
  // Handle axios error response
  if (error.response && error.response.data) {
    const errorData = error.response.data
    
    // Handle different error response formats
    if (typeof errorData === 'string') {
      return errorData
    }
    
    // Handle ErrorResponse format (our backend format)
    if (errorData.message) {
      return errorData.message
    }
    
    // Handle validation errors with messages array
    if (errorData.messages && Array.isArray(errorData.messages) && errorData.messages.length > 0) {
      return errorData.messages[0] // Return first validation error
    }
    
    // Handle general error format
    if (errorData.error) {
      return errorData.error
    }
  }
  
  // Handle network errors
  if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
    return 'Cannot connect to server. Please check your connection.'
  }
  
  // Default fallback
  return error.message || 'An unexpected error occurred'
}

/**
 * Check if current session is valid
 * @returns {boolean} - true if session is valid
 */
export const isValidSession = () => {
  const token = localStorage.getItem('accessToken')
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  
  if (!token || isLoggedIn !== 'true') {
    return false
  }
  
  return !isTokenExpired(token)
}

/**
 * Clear authentication data
 */
export const clearAuthData = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('userInfo')
} 