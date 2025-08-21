// src/routes/accountRoutes.jsx

import { Route } from 'react-router-dom';
import AccountsManagement from '@/pages/Account/AccountsManagement';
import AddAccount from '@/pages/Account/AddAccount/AddAccount';
import EditAccount from '@/pages/Account/EditAccount/EditAccount';
import AccountDetail from '@/pages/Account/AccountDetail/AccountDetail';

const AccountRoutes = (
  <>
    <Route path="account" element={<AccountsManagement />} />
    <Route path="account/add" element={<AddAccount />} />
    <Route path="account/edit/:id" element={<EditAccount />} />
    <Route path="account/detail/:id" element={<AccountDetail />} />
  </>
);

export default AccountRoutes;