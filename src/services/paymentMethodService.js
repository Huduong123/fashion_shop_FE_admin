import api from './api'

const ENDPOINT = '/admin/payment-methods'

const getAll = async (params) => {
  try {
    const response = await api.get(ENDPOINT, { params })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return { success: false, message: error.response?.data?.message || error.message }
  }
}
// Hàm lấy chi tiết một phương thức thanh toán bằng ID
const getById = async (id) => {
    try {
      const response = await api.get(`${ENDPOINT}/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error fetching payment method ${id}:`, error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }
// Hàm xóa một phương thức thanh toán
const deleteMethod = async (id) => {
  try {
    const response = await api.delete(`${ENDPOINT}/${id}`)
    return { success: true, data: response.data }
  } catch (error) {
    console.error(`Error deleting payment method ${id}:`, error)
    return { success: false, message: error.response?.data?.message || error.message }
  }
}
const createMethod = async (paymentMethodData, imageFile) => {
    try {
      // Tạo đối tượng FormData để gửi cả dữ liệu JSON và file
      const formData = new FormData();
      
      // 1. Thêm dữ liệu JSON vào part 'data'
      // Cần chuyển object thành chuỗi JSON và tạo một Blob với type application/json
      const jsonData = JSON.stringify(paymentMethodData);
      const jsonBlob = new Blob([jsonData], { type: 'application/json' });
      formData.append('data', jsonBlob);
  
      // 2. Thêm file ảnh vào part 'file'
      if (imageFile) {
        formData.append('file', imageFile);
      }
      
      // Gửi request với header multipart/form-data
      const response = await api.post(ENDPOINT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating payment method:', error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }
  // Hàm cập nhật một phương thức thanh toán
const updateMethod = async (id, paymentMethodData, imageFile) => {
    try {
      const formData = new FormData();
      const jsonData = JSON.stringify(paymentMethodData);
      const jsonBlob = new Blob([jsonData], { type: 'application/json' });
      formData.append('data', jsonBlob);
  
      // File ảnh là không bắt buộc khi cập nhật
      if (imageFile) {
        formData.append('file', imageFile);
      }
      
      // Gửi request PUT
      const response = await api.put(`${ENDPOINT}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error updating payment method ${id}:`, error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }
const paymentMethodService = {
  getAll,
  deleteMethod,
  createMethod,
  getById,
  updateMethod
}

export default paymentMethodService