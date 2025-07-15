import api from './api'

const productVariantImageService = {
  // Get all images for a variant
  getVariantImages: async (variantId) => {
    try {
      const response = await api.get(`/admin/product-variants/${variantId}/images`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi tải danh sách ảnh'
      }
    }
  },

  // Get primary image for a variant
  getPrimaryImage: async (variantId) => {
    try {
      const response = await api.get(`/admin/product-variants/${variantId}/images/primary`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi tải ảnh chính'
      }
    }
  },

  // Add new image to variant
  addImageToVariant: async (variantId, imageData) => {
    try {
      const response = await api.post(`/admin/product-variants/${variantId}/images`, imageData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi thêm ảnh'
      }
    }
  },

  // Update an existing image
  updateImage: async (imageId, imageData) => {
    try {
      const response = await api.put(`/admin/product-variants/images/${imageId}`, imageData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi cập nhật ảnh'
      }
    }
  },

  // Delete an image
  deleteImage: async (imageId) => {
    try {
      const response = await api.delete(`/admin/product-variants/images/${imageId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi xóa ảnh'
      }
    }
  },

  // Set image as primary
  setPrimaryImage: async (imageId) => {
    try {
      const response = await api.put(`/admin/product-variants/images/${imageId}/set-primary`);
      return {
        success: true,
        // API này trả về danh sách ảnh đã được cập nhật của variant đó
        data: response.data 
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi đặt ảnh chính'
      };
    }
  },

  // Reorder images
  reorderImages: async (variantId, imageIds) => {
    try {
      const response = await api.put(`/admin/product-variants/${variantId}/images/reorder`, imageIds)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi sắp xếp lại ảnh'
      }
    }
  },

  // Delete all images of a variant
  deleteAllVariantImages: async (variantId) => {
    try {
      const response = await api.delete(`/admin/product-variants/${variantId}/images`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi xóa tất cả ảnh'
      }
    }
  }
}

export default productVariantImageService 