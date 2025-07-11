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
   * Get categories by type
   * @param {string} type - Category type (LINK or DROPDOWN)
   * @returns {Promise} Promise with categories data
   */
  async getCategoriesByType(type) {
    try {
      const response = await api.get('/admin/categories', {
        params: { type }
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch categories by type'
      }
    }
  }

  /**
   * Get root categories (categories without parent)
   * @returns {Promise} Promise with root categories data
   */
  async getRootCategories() {
    try {
      const response = await api.get('/admin/categories/root')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch root categories'
      }
    }
  }

  /**
   * Get category hierarchy (tree structure)
   * @returns {Promise} Promise with hierarchy data
   */
  async getCategoryHierarchy() {
    try {
      const response = await api.get('/admin/categories/hierarchy')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch category hierarchy'
      }
    }
  }

  /**
   * Get children categories by parent ID
   * @param {number} parentId - Parent category ID
   * @returns {Promise} Promise with children categories data
   */
  async getChildrenByParentId(parentId) {
    try {
      const response = await api.get(`/admin/categories/${parentId}/children`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch children categories'
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
   * Get category path (from category to root)
   * @param {number} id - Category ID
   * @returns {Promise} Promise with category path data
   */
  async getCategoryPath(id) {
    try {
      const response = await api.get(`/admin/categories/${id}/path`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch category path'
      }
    }
  }

  /**
   * Check if category can be deleted
   * @param {number} id - Category ID
   * @returns {Promise} Promise with can delete status
   */
  async canDeleteCategory(id) {
    try {
      const response = await api.get(`/admin/categories/${id}/can-delete`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to check delete status'
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