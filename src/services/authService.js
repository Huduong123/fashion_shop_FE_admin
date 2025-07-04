import api from './api'

class AuthService {
  // Login function
  async login(credentials) {
    try {
      const response = await api.post('/admin/login', {
        username: credentials.username,
        password: credentials.password
      })

      const { data } = response
      
      // Backend now returns: { token: "jwt_token", username: "...", message: "..." }
      if (data && data.token) {
        // Store JWT token with Bearer prefix if not already included
        const token = data.token.startsWith('Bearer ') ? data.token : `Bearer ${data.token}`
        
        localStorage.setItem('accessToken', token)
        localStorage.setItem('isLoggedIn', 'true')
        
        // Store user info
        const userInfo = {
          username: data.username || credentials.username,
          message: data.message
        }
        localStorage.setItem('userInfo', JSON.stringify(userInfo))

        return {
          success: true,
          token: token,
          user: userInfo,
          message: data.message
        }
      } else {
        throw new Error('Token not received from server')
      }
    } catch (error) {
      // Clear any existing auth data on login failure
      this.logout()
      
      // Handle different error scenarios
      if (error.response) {
        const status = error.response.status
        const errorData = error.response.data
        let message = 'Login failed'
        
        // Handle different response formats
        if (typeof errorData === 'string') {
          message = errorData
        } else if (errorData?.message) {
          message = errorData.message
        } else if (errorData?.error) {
          message = errorData.error
        }
        
        switch (status) {
          case 400:
            throw new Error(message || 'Invalid request. Please check your input')
          case 401:
            throw new Error(message || 'Invalid username or password')
          case 403:
            throw new Error(message || 'Access denied')
          case 404:
            throw new Error('Login service not available')
          case 500:
            throw new Error('Server error. Please try again later')
          default:
            throw new Error(message || 'Login failed. Please try again')
        }
      } else if (error.request) {
        throw new Error('Cannot connect to server. Please check your connection')
      } else {
        throw new Error(error.message || 'An unexpected error occurred')
      }
    }
  }

  // Logout function
  logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userInfo')
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('accessToken')
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    return !!(token && isLoggedIn === 'true')
  }

  // Get current user info
  getCurrentUser() {
    const userInfo = localStorage.getItem('userInfo')
    return userInfo ? JSON.parse(userInfo) : null
  }

  // Get access token
  getAccessToken() {
    return localStorage.getItem('accessToken')
  }

  // Verify token (checking token validity with backend)
  async verifyToken() {
    try {
      const token = this.getAccessToken()
      if (!token) {
        return false
      }

      const response = await api.get('/admin/verify-token')
      
      // Check both status and response data
      if (response.status === 200 && response.data?.valid === true) {
        return true
      }
      
      return false
    } catch (error) {
      // If verification fails, clear auth data
      if (error.response?.status === 401) {
        this.logout()
      }
      return false
    }
  }
}

export default new AuthService() 