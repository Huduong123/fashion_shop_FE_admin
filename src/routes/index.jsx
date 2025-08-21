// src/routes/index.jsx

import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts and Route Guards
import AdminLayout from '@/layouts/AdminLayout/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import PublicRoute from './PublicRoute'; // Ta sẽ tạo file này ở bước sau

// Top-level Pages
import Login from '@/pages/Login/Login';
import Dashboard from '@/pages/Dashboard/Dashboard';
import AccessDenied from '@/pages/AccessDenied';
import NotFound from '@/pages/NotFound/NotFound';
import ImageDemo from '@/components/ImageDemo';

// Import các nhóm routes đã chia nhỏ
import ProductRoutes from './productRoutes';
import CategoryRoutes from './categoryRoutes';
import AccountRoutes from './accountRoutes';
import OrderRoutes from './orderRoutes';
import PaymentMethodRoutes from './paymentMethodRoutes';

const AppRoutes = () => {
  return (
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
        {/* Nested routes will render inside AdminLayout's <Outlet /> */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* --- Tích hợp các nhóm routes --- */}
        {ProductRoutes}
        {CategoryRoutes}
        {AccountRoutes}
        {OrderRoutes}
        {PaymentMethodRoutes}
        {/* ----------------------------- */}
        
        {/* Các routes còn lại */}
        <Route path="inventory" element={<div>Inventory Page (Coming Soon)</div>} />
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

      {/* Access Denied Route */}
      <Route path="/access-denied" element={<AccessDenied />} />

      {/* Catch-all route for 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;