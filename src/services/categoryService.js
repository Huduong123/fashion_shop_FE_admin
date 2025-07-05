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
        error: error.response?.data?.message || 'Failed to fetch categories'
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
        error: error.response?.data?.message || 'Failed to fetch category'
      }
    }
  }
}

export default new CategoryService() 