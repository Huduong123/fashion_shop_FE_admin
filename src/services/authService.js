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
        // Store raw JWT token (remove Bearer prefix if present)
        const token = data.token.startsWith('Bearer ') ? data.token.substring(7) : data.token
        
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
        throw new Error('Không nhận được token từ máy chủ')
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
            throw new Error(message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin')
          case 401:
            throw new Error(message || 'Tài khoản hoặc mật khẩu không chính xác')
          case 403:
            throw new Error(message || 'Không có quyền truy cập')
          case 404:
            throw new Error('Dịch vụ đăng nhập không khả dụng')
          case 500:
            throw new Error('Lỗi máy chủ. Vui lòng thử lại sau')
          default:
            throw new Error(message || 'Đăng nhập thất bại. Vui lòng thử lại')
        }
              } else if (error.request) {
        throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng')
      } else {
        throw new Error(error.message || 'Đã xảy ra lỗi không mong muốn')
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