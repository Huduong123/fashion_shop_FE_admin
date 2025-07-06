import { useState, useEffect } from 'react';
import colorService from '@/services/colorService';
import Toast from './Toast';
import './ColorManagementModal.css';

const ColorManagementModal = ({ show, onHide, onColorAdded }) => {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingColor, setEditingColor] = useState(null);
  const [formData, setFormData] = useState({
    name: ''
  });

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Helper function to sort colors alphabetically
  const sortColorsByName = (colorsArray) => {
    return colorsArray.sort((a, b) => 
      a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
    );
  };

  // Toast helper functions
  const showToast = (type, title, message = '') => {
    setToast({
      show: true,
      type,
      title,
      message
    });
  };

  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      show: false
    }));
  };

  // Load colors when modal opens
  useEffect(() => {
    if (show) {
      loadColors();
    }
  }, [show]);

  const loadColors = async () => {
    setLoading(true);
    try {
      const result = await colorService.getAllColors();
      if (result.success) {
        // Sắp xếp theo chữ cái
        const sortedColors = sortColorsByName(result.data);
        setColors(sortedColors);
      }
    } catch (error) {
      console.error('Error loading colors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || formData.name.trim().length === 0) {
      showToast('error', 'Lỗi nhập liệu', 'Vui lòng nhập tên màu');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        name: formData.name.trim()
      };

      let result;
      if (editingColor) {
        result = await colorService.updateColor(editingColor.id, submitData);
      } else {
        result = await colorService.createColor(submitData);
      }

      if (result.success) {
        showToast('success', 
          editingColor ? 'Cập nhật thành công!' : 'Thêm thành công!',
          editingColor ? 'Màu sắc đã được cập nhật' : 'Màu sắc đã được thêm mới'
        );
        resetForm();
        loadColors();
        if (onColorAdded) {
          onColorAdded();
        }
      } else {
        showToast('error', 'Thao tác thất bại', result.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error in color operation:', error);
      showToast('error', 
        'Lỗi hệ thống', 
        'Có lỗi xảy ra khi ' + (editingColor ? 'cập nhật' : 'thêm') + ' màu sắc'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (color) => {
    setEditingColor(color);
    setFormData({
      name: color.name
    });
  };

  const resetForm = () => {
    setFormData({ name: '' });
    setEditingColor(null);
  };

  const handleDelete = async (colorId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa màu sắc này?')) {
      return;
    }

    setLoading(true);
    try {
      const result = await colorService.deleteColor(colorId);
      if (result.success) {
        showToast('success', 'Xóa thành công!', 'Màu sắc đã được xóa khỏi hệ thống');
        loadColors();
        if (onColorAdded) {
          onColorAdded();
        }
      } else {
        // Hiển thị thông báo lỗi chi tiết hơn
        const errorMessage = result.message || 'Không thể xóa màu sắc';
        if (errorMessage.includes('foreign key constraint') || errorMessage.includes('sản phẩm sử dụng')) {
          showToast('error', 
            'Không thể xóa màu!', 
            'Màu đang được sử dụng bởi sản phẩm. Vui lòng xóa các sản phẩm liên quan trước.'
          );
        } else {
          showToast('error', 'Xóa thất bại', errorMessage);
        }
      }
    } catch (error) {
      // Xử lý lỗi chi tiết hơn
      console.error('Delete color error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xóa màu sắc';
      if (errorMessage.includes('foreign key constraint') || errorMessage.includes('sản phẩm sử dụng')) {
        showToast('error', 
          'Không thể xóa màu!', 
          'Màu đang được sử dụng bởi sản phẩm. Vui lòng xóa các sản phẩm liên quan trước.'
        );
      } else {
        showToast('error', 'Lỗi hệ thống', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div 
      className="modal fade show d-block color-modal-overlay" 
      tabIndex="-1" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog modal-dialog-centered color-modal-dialog">
        <div className="modal-content">
          <div className="modal-header py-2">
            <h5 className="modal-title mb-0">
              <i className="bi bi-palette me-2"></i>
              Quản lý màu sắc
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onHide}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body p-3">
            {/* Add/Edit Color Form */}
            <div className="color-form-section mb-3">
              <div className="form-header">
                <h6 className="mb-2">
                  <i className="bi bi-plus-circle me-1"></i>
                  {editingColor ? 'Sửa màu sắc' : 'Thêm màu sắc mới'}
                </h6>
                {editingColor && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={resetForm}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
              <form onSubmit={handleSubmit} className="compact-form">
                <div className="row g-2 align-items-end">
                  <div className="col-8">
                    <label htmlFor="name" className="form-label form-label-sm">
                      Tên màu <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="VD: Đỏ, Xanh, Vàng..."
                      required
                    />
                  </div>
                  <div className="col-4">
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm w-100"
                      disabled={loading}
                    >
                      {loading ? 
                        <span className="spinner-border spinner-border-sm me-1"></span> : 
                        <i className="bi bi-check me-1"></i>
                      }
                      {editingColor ? 'Cập nhật' : 'Thêm'}
                    </button>
                  </div>
                </div>
                {editingColor && (
                  <div className="mt-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={resetForm}
                    >
                      <i className="bi bi-x me-1"></i>
                      Hủy
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Colors List */}
            <div className="color-list-section">
              <div className="list-header">
                <h6 className="mb-2">
                  <i className="bi bi-list me-1"></i>
                  Danh sách màu sắc ({colors.length})
                </h6>
              </div>
              <div className="color-list-container">
                {loading ? (
                  <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : colors.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '15%' }}>STT</th>
                          <th style={{ width: '55%' }}>Tên màu</th>
                          <th style={{ width: '30%' }}>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {colors.map((color, index) => (
                          <tr key={color.id}>
                            <td>{index + 1}</td>
                            <td>
                              <span className="badge bg-primary">{color.name}</span>
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleEdit(color)}
                                  disabled={loading}
                                  title="Sửa"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(color.id)}
                                  disabled={loading}
                                  title="Xóa"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <i className="bi bi-inbox text-muted" style={{ fontSize: '2rem' }}></i>
                    <p className="text-muted mb-0 mt-2">Chưa có màu sắc nào</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer py-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onHide}
            >
              <i className="bi bi-x me-1"></i>
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        onHide={hideToast}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        duration={4000}
      />
    </div>
  );
};

export default ColorManagementModal; 