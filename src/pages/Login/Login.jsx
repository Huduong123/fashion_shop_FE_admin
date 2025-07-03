import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      console.log('Login attempt:', formData)
      setLoading(false)
      
      // Simulate successful login
      if (formData.username && formData.password) {
        // Save login status to localStorage
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('username', formData.username)
        
        // Navigate to dashboard
        navigate('/dashboard')
      } else {
        alert('Please enter both username and password!')
      }
    }, 2000)
  }

  return (
    <div className="login-container">
      <div className="login-background-elements">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>
      
      <div className="login-wrapper">
        <div className="login-center">
          <div className="login-form-container">
            <div className="form-header">
              <div className="logo-container">
                <div className="logo-wrapper">
                  <img src="/src/assets/images/logo/logo1.jpg" alt="NTA GROUP" className="logo-image" />
                </div>
                <h1 className="welcome-title">Welcome Back</h1>
                <p className="welcome-subtitle">Sign in to your account to continue</p>
              </div>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    className="form-input"
                    required
                  />
                  <div className="input-focus-border"></div>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <div className="password-input">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="form-input"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {showPassword ? (
                          <>
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </>
                        ) : (
                          <>
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                  <div className="input-focus-border"></div>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  <span className="remember-text">Remember me</span>
                </label>
                <a href="#" className="recovery-link">Forgot password?</a>
              </div>
              
              <button type="submit" className="signin-button" disabled={loading}>
                {loading ? (
                  <span className="loading">
                    <div className="spinner"></div>
                    <span>Signing in...</span>
                  </span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <svg className="signin-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login 