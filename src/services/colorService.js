import api from './api'

const colorService = {
  // Get all colors
  getAllColors: async () => {
    try {
      const response = await api.get('/admin/colors')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      // Error fetching colors
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch colors'
      }
    }
  },

  // Get single color
  getColor: async (colorId) => {
    try {
      const response = await api.get(`/admin/colors/${colorId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      // Error fetching color
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch color'
      }
    }
  },

  // Create color
  createColor: async (colorData) => {
    try {
      const response = await api.post('/admin/colors', colorData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      // Error creating color
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create color'
      }
    }
  },

  // Update color
  updateColor: async (colorId, colorData) => {
    try {
      const response = await api.put(`/admin/colors/${colorId}`, colorData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      // Error updating color
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update color'
      }
    }
  },

  // Delete color
  deleteColor: async (colorId) => {
    try {
      await api.delete(`/admin/colors/${colorId}`)
      return {
        success: true
      }
    } catch (error) {
      // Error deleting color
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete color'
      }
    }
  }
}

export default colorService 