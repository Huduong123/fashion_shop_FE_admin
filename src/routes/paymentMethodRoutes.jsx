// src/routes/paymentMethodRoutes.jsx

import { Route } from 'react-router-dom';
import PaymentMethodManagement from '@/pages/PaymentMethod/PaymentMethodManagement';
import AddPaymentMethod from '@/pages/PaymentMethod/AddPaymentMethod/AddPaymentMethod';
import EditPaymentMethod from '@/pages/PaymentMethod/EditPaymentMethod/EditPaymentMethod';
import PaymentMethodDetail from '@/pages/PaymentMethod/PaymentMethodDetail/PaymentMethodDetail';

const PaymentMethodRoutes = (
  <>
    <Route path="payment-methods" element={<PaymentMethodManagement />} />
    <Route path="payment-methods/add" element={<AddPaymentMethod />} />
    <Route path="payment-methods/edit/:id" element={<EditPaymentMethod />} />
    <Route path="payment-methods/detail/:id" element={<PaymentMethodDetail />} />
  </>
);

export default PaymentMethodRoutes;