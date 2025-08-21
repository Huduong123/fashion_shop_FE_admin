// src/routes/orderRoutes.jsx

import { Route } from 'react-router-dom';
import OrderManagement from '@/pages/Order/OrderManagement';
import OrderDetail from '@/pages/Order/OrderDetail/OrderDetail';

const OrderRoutes = (
  <>
    <Route path="orders" element={<OrderManagement />} />
    <Route path="orders/:id" element={<OrderDetail />} />
  </>
);

export default OrderRoutes;