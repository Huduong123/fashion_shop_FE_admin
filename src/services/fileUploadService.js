import api from './api'

const fileUploadService = {
  // Upload file
  uploadFile: async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/admin/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload file'
      }
    }
  },

  // Delete file
  deleteFile: async (fileName) => {
    try {
      const response = await api.delete('/admin/files/delete', {
        params: { fileName }
      })

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete file'
      }
    }
  }
}

export default fileUploadService 