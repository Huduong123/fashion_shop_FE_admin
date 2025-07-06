import api from './api'

class CategoryService {
  /**
   * Get all categories
   * @returns {Promise} Promise with categories data
   */
  async getAllCategories() {
    try {
      const response = await api.get('/admin/categories')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch categories'
      }
    }
  }

  /**
   * Get category by ID
   * @param {number} id - Category ID
   * @returns {Promise} Promise with category data
   */
  async getCategoryById(id) {
    try {
      const response = await api.get(`/admin/categories/${id}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch category'
      }
    }
  }

  /**
   * Create new category
   * @param {Object} categoryData - Category data to create
   * @returns {Promise} Promise with created category data
   */
  async createCategory(categoryData) {
    try {
      const response = await api.post('/admin/categories', categoryData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create category'
      }
    }
  }

  /**
   * Update category
   * @param {number} id - Category ID
   * @param {Object} categoryData - Category data to update
   * @returns {Promise} Promise with updated category data
   */
  async updateCategory(id, categoryData) {
    try {
      const response = await api.put(`/admin/categories/${id}`, categoryData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update category'
      }
    }
  }

  /**
   * Delete category
   * @param {number} id - Category ID
   * @returns {Promise} Promise with deletion result
   */
  async deleteCategory(id) {
    try {
      await api.delete(`/admin/categories/${id}`)
      return {
        success: true,
        message: 'Category deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete category'
      }
    }
  }
}

export default new CategoryService() 