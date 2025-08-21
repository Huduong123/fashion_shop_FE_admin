// src/routes/categoryRoutes.jsx

import { Route } from 'react-router-dom';
import CategoryManagement from '@/pages/Categories/CategoryManagement';
import CategoryChild from '@/pages/Categories/CategoryChild';
import AddCategory from '@/pages/Categories/AddCategory/AddCategory';
import EditCategory from '@/pages/Categories/EditCategory/EditCategory';
import AddCategoryChild from '@/pages/Categories/AddCategoryChild/AddCategoryChild';
import EditCategoryChild from '@/pages/Categories/EditCategoryChild/EditCategoryChild';

const CategoryRoutes = (
  <>
    <Route path="categories" element={<CategoryManagement />} />
    <Route path="categories/add" element={<AddCategory />} />
    <Route path="categories/edit/:id" element={<EditCategory />} />
    <Route path="categories/:parentId/children" element={<CategoryChild />} />
    <Route path="categories/:parentId/children/add" element={<AddCategoryChild />} />
    <Route path="categories/:parentId/children/edit/:id" element={<EditCategoryChild />} />
  </>
);

export default CategoryRoutes;