import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import AdminLayout from './layouts/AdminLayout/AdminLayout'
import ImageDemo from './components/ImageDemo'
import ProtectedRoute from './components/ProtectedRoute'
import authService from '@/services/authService'
import './App.css'

// Public Route Component (redirect to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

function App() {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize the app (you can add any startup logic here)
    setIsInitialized(true)
  }, [])

  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        {/* Protected Routes with Admin Layout */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Nested routes that will render inside AdminLayout */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<div>Products Page (Coming Soon)</div>} />
          <Route path="category" element={<div>Category Page (Coming Soon)</div>} />
          <Route path="inventory" element={<div>Inventory Page (Coming Soon)</div>} />
          <Route path="orders" element={<div>Orders Page (Coming Soon)</div>} />
          <Route path="purchases" element={<div>Purchases Page (Coming Soon)</div>} />
          <Route path="attributes" element={<div>Attributes Page (Coming Soon)</div>} />
          <Route path="invoices" element={<div>Invoices Page (Coming Soon)</div>} />
          <Route path="settings" element={<div>Settings Page (Coming Soon)</div>} />
          <Route path="profile" element={<div>Profile Page (Coming Soon)</div>} />
          <Route path="roles" element={<div>Roles Page (Coming Soon)</div>} />
          <Route path="permissions" element={<div>Permissions Page (Coming Soon)</div>} />
          <Route path="customers" element={<div>Customers Page (Coming Soon)</div>} />
          <Route path="sellers" element={<div>Sellers Page (Coming Soon)</div>} />
          <Route path="coupons" element={<div>Coupons Page (Coming Soon)</div>} />
          <Route path="reviews" element={<div>Reviews Page (Coming Soon)</div>} />
          <Route path="image-demo" element={<ImageDemo />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
