import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import AdminLayout from './layouts/AdminLayout/AdminLayout'
import ImageDemo from './components/ImageDemo'
import ProtectedRoute from './components/ProtectedRoute'
import ProductsManagement from './pages/Products/ProductsManagement'
import ProductsByCategory from './pages/Products/ProductsByCategory'
import AddProduct from './pages/Products/AddProduct/AddProduct'
import EditProduct from './pages/Products/EditProduct/EditProduct'
import ProductDetail from './pages/Products/ProductDetail/ProductDetail'
import CategoryManagement from './pages/Categories/CategoryManagement'
import CategoryChild from './pages/Categories/CategoryChild'
import AddCategory from './pages/Categories/AddCategory/AddCategory'
import EditCategory from './pages/Categories/EditCategory/EditCategory'
import AddCategoryChild from './pages/Categories/AddCategoryChild/AddCategoryChild'
import EditCategoryChild from './pages/Categories/EditCategoryChild/EditCategoryChild'
import AccountsManagement from './pages/Account/AccountsManagement'
import AddAccount from './pages/Account/AddAccount/AddAccount'
import EditAccount from './pages/Account/EditAccount/EditAccount'
import AccountDetail from './pages/Account/AccountDetail/AccountDetail'
import OrderManagement from './pages/Order/OrderManagement'
import OrderDetail from './pages/Order/OrderDetail/OrderDetail'
import authService from '@/services/authService'
import AccessDenied from './pages/AccessDenied'
import NotFound from './pages/NotFound/NotFound'
import PaymentMethodManagement from './pages/PaymentMethod/PaymentMethodManagement'
import AddPaymentMethod from './pages/PaymentMethod/AddPaymentMethod/AddPaymentMethod'
import EditPaymentMethod from './pages/PaymentMethod/EditPaymentMethod/EditPaymentMethod'
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
          <Route path="products" element={<ProductsManagement />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:productId" element={<EditProduct />} />
          <Route path="products/detail/:id" element={<ProductDetail />} />
          <Route path="products/category/:categoryId" element={<ProductsByCategory />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="categories/:parentId/children" element={<CategoryChild />} />
          <Route path="categories/:parentId/children/add" element={<AddCategoryChild />} />
          <Route path="categories/:parentId/children/edit/:id" element={<EditCategoryChild />} />
          <Route path="categories/add" element={<AddCategory />} />
          <Route path="categories/edit/:id" element={<EditCategory />} />
          <Route path="account" element={<AccountsManagement />} />
          <Route path="account/add" element={<AddAccount />} />
          <Route path="account/edit/:id" element={<EditAccount />} />
          <Route path="account/detail/:id" element={<AccountDetail />} />
          <Route path="inventory" element={<div>Inventory Page (Coming Soon)</div>} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="orders/:id" element={<OrderDetail />} />
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
          <Route path="payment-methods" element={<PaymentMethodManagement />} />
          <Route path="payment-methods/add" element={<AddPaymentMethod />} />
          <Route path="payment-methods/edit/:id" element={<EditPaymentMethod />} />
          <Route path="image-demo" element={<ImageDemo />} />
        </Route>

        {/* Access Denied Route */}
        <Route path="/access-denied" element={<AccessDenied />} />

        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
