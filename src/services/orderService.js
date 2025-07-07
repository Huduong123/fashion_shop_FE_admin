import api from './api'

class OrderService {
  /**
   * Get all orders with filtering and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise} Promise with orders data
   */
  async getAllOrders(params = {}) {
    try {
      const response = await api.get('/admin/orders', { params })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch orders'
      }
    }
  }

  /**
   * Get order by ID
   * @param {number} id - Order ID
   * @returns {Promise} Promise with order data
   */
  async getOrderById(id) {
    try {
      const response = await api.get(`/admin/orders/${id}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch order'
      }
    }
  }

  /**
   * Update order status
   * @param {number} id - Order ID
   * @param {string} status - New status
   * @returns {Promise} Promise with response
   */
  async updateOrderStatus(id, status) {
    try {
      const response = await api.put(`/admin/orders/${id}/status`, null, {
        params: { status }
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update order status'
      }
    }
  }

  /**
   * Delete order
   * @param {number} id - Order ID
   * @returns {Promise} Promise with deletion result
   */
  async deleteOrder(id) {
    try {
      await api.delete(`/admin/orders/${id}`)
      return {
        success: true,
        message: 'Order deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete order'
      }
    }
  }
}

export default new OrderService() 