import api from './api'

const productService = {
  // Get all products
  getAllProducts: async () => {
    try {
      const response = await api.get('/admin/products')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch products'
      }
    }
  },

  // Search products with filters
  searchProducts: async (searchParams = {}) => {
    try {
      const params = new URLSearchParams()
      
      // Add search parameters if they exist and are not empty
      if (searchParams.name && searchParams.name.trim()) {
        params.append('name', searchParams.name.trim())
      }
      if (searchParams.minPrice && searchParams.minPrice > 0) {
        params.append('minPrice', searchParams.minPrice)
      }
      if (searchParams.maxPrice && searchParams.maxPrice > 0) {
        params.append('maxPrice', searchParams.maxPrice)
      }
      if (searchParams.minQuantity && searchParams.minQuantity >= 0) {
        params.append('minQuantity', searchParams.minQuantity)
      }
      if (searchParams.maxQuantity && searchParams.maxQuantity >= 0) {
        params.append('maxQuantity', searchParams.maxQuantity)
      }
      if (searchParams.enabled !== null && searchParams.enabled !== undefined && searchParams.enabled !== '') {
        params.append('enabled', searchParams.enabled)
      }
      if (searchParams.categoryId && searchParams.categoryId > 0) {
        params.append('categoryId', searchParams.categoryId)
      }
      if (searchParams.createdAt) {
        params.append('createdAt', searchParams.createdAt)
      }
      if (searchParams.updatedAt) {
        params.append('updatedAt', searchParams.updatedAt)
      }

      const queryString = params.toString()
      const url = queryString ? `/admin/products?${queryString}` : '/admin/products'
      
      const response = await api.get(url)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error searching products:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to search products'
      }
    }
  },

  // Get products by category
  getProductsByCategory: async (categoryId) => {
    try {
      const response = await api.get(`/admin/products/category/${categoryId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error fetching products by category:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch products by category'
      }
    }
  },

  // Get products by category with pagination
  getProductsByCategoryWithPagination: async (categoryId, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') => {
    try {
      const response = await api.get(`/admin/products/category/${categoryId}/paginated`, {
        params: {
          page,
          size,
          sortBy,
          sortDir
        }
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error fetching paginated products by category:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch paginated products by category'
      }
    }
  },

  // Get single product
  getProduct: async (productId) => {
    try {
      const response = await api.get(`/admin/products/${productId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch product'
      }
    }
  },

  // Create product
  createProduct: async (productData) => {
    try {
      const response = await api.post('/admin/products', productData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error creating product:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create product'
      }
    }
  },

  // Update product
  updateProduct: async (productId, productData) => {
    try {
      const response = await api.put(`/admin/products/${productId}`, productData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error updating product:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update product'
      }
    }
  },

  // Delete product
  deleteProduct: async (productId) => {
    try {
      await api.delete(`/admin/products/${productId}`)
      return {
        success: true
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete product'
      }
    }
  }
}

// Add alias for convenience
productService.getProductById = productService.getProduct

export default productService 