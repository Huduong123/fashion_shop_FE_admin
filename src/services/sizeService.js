import api from './api'

const sizeService = {
  // Get all sizes
  getAllSizes: async () => {
    try {
      const response = await api.get('/admin/sizes')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      // Error fetching sizes
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch sizes'
      }
    }
  },

  // Get single size
  getSize: async (sizeId) => {
    try {
      const response = await api.get(`/admin/sizes/${sizeId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      // Error fetching size
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch size'
      }
    }
  },

  // Create size
  createSize: async (sizeData) => {
    try {
      const response = await api.post('/admin/sizes', sizeData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      // Error creating size
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create size'
      }
    }
  },

  // Update size
  updateSize: async (sizeId, sizeData) => {
    try {
      const response = await api.put(`/admin/sizes/${sizeId}`, sizeData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      // Error updating size
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update size'
      }
    }
  },

  // Delete size
  deleteSize: async (sizeId) => {
    try {
      await api.delete(`/admin/sizes/${sizeId}`)
      return {
        success: true
      }
    } catch (error) {
      // Error deleting size
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete size'
      }
    }
  }
}

export default sizeService 