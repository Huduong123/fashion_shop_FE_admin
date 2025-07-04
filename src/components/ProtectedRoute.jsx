import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import authService from '@/services/authService'
import { isValidSession } from '@/utils/auth'

const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user has valid session locally
        const hasValidSession = isValidSession()
        
        if (hasValidSession) {
          // Verify token with backend for additional security
          try {
            const isTokenValid = await authService.verifyToken()
            setIsAuthenticated(isTokenValid)
          } catch (error) {
            setIsAuthenticated(false)
            authService.logout()
          }
        } else {
          setIsAuthenticated(false)
          // Clear invalid session data
          authService.logout()
        }
      } catch (error) {
        setIsAuthenticated(false)
        authService.logout()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Render protected content
  return children
}

export default ProtectedRoute 