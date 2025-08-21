// src/routes/productRoutes.jsx

import { Route } from 'react-router-dom';
import ProductsManagement from '@/pages/Products/ProductsManagement';
import ProductsByCategory from '@/pages/Products/ProductsByCategory';
import AddProduct from '@/pages/Products/AddProduct/AddProduct';
import EditProduct from '@/pages/Products/EditProduct/EditProduct';
import ProductDetail from '@/pages/Products/ProductDetail/ProductDetail';

const ProductRoutes = (
  <>
    <Route path="products" element={<ProductsManagement />} />
    <Route path="products/add" element={<AddProduct />} />
    <Route path="products/edit/:productId" element={<EditProduct />} />
    <Route path="products/detail/:id" element={<ProductDetail />} />
    <Route path="products/category/:categoryId" element={<ProductsByCategory />} />
  </>
);

export default ProductRoutes;