import { useState, useEffect } from 'react';
import sizeService from '@/services/sizeService';
import Toast from './Toast';
import './ColorManagementModal.css'; // Reuse the same CSS

const SizeManagementModal = ({ show, onHide, onSizeAdded }) => {
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingSize, setEditingSize] = useState(null);
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

  // Helper function to sort sizes alphabetically
  const sortSizesByName = (sizesArray) => {
    return sizesArray.sort((a, b) => 
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

  // Load sizes when modal opens
  useEffect(() => {
    if (show) {
      loadSizes();
    }
  }, [show]);

  const loadSizes = async () => {
    setLoading(true);
    try {
      const result = await sizeService.getAllSizes();
      if (result.success) {
        // Sắp xếp theo chữ cái
        const sortedSizes = sortSizesByName(result.data);
        setSizes(sortedSizes);
      }
    } catch (error) {
      // Error loading sizes
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
      showToast('error', 'Lỗi nhập liệu', 'Vui lòng nhập tên kích thước');
      return;
    }

    if (formData.name.trim().length > 20) {
      showToast('error', 'Lỗi nhập liệu', 'Tên kích thước không được vượt quá 20 ký tự');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        name: formData.name.trim()
      };

      let result;
      if (editingSize) {
        result = await sizeService.updateSize(editingSize.id, submitData);
      } else {
        result = await sizeService.createSize(submitData);
      }

      if (result.success) {
        showToast('success', 
          editingSize ? 'Cập nhật thành công!' : 'Thêm thành công!',
          editingSize ? 'Kích thước đã được cập nhật' : 'Kích thước đã được thêm mới'
        );
        resetForm();
        loadSizes();
        if (onSizeAdded) {
          onSizeAdded();
        }
      } else {
        showToast('error', 'Thao tác thất bại', result.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error in size operation:', error);
      showToast('error', 
        'Lỗi hệ thống', 
        'Có lỗi xảy ra khi ' + (editingSize ? 'cập nhật' : 'thêm') + ' kích thước'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (size) => {
    setEditingSize(size);
    setFormData({
      name: size.name
    });
  };

  const resetForm = () => {
    setFormData({ name: '' });
    setEditingSize(null);
  };

  const handleDelete = async (sizeId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa kích thước này?')) {
      return;
    }

    setLoading(true);
    try {
      const result = await sizeService.deleteSize(sizeId);
      if (result.success) {
        showToast('success', 'Xóa thành công!', 'Kích thước đã được xóa khỏi hệ thống');
        loadSizes();
        if (onSizeAdded) {
          onSizeAdded();
        }
      } else {
        // Hiển thị thông báo lỗi chi tiết hơn
        const errorMessage = result.message || 'Không thể xóa kích thước';
        if (errorMessage.includes('foreign key constraint') || errorMessage.includes('sản phẩm sử dụng')) {
          showToast('error', 
            'Không thể xóa kích thước!', 
            'Kích thước đang được sử dụng bởi sản phẩm. Vui lòng xóa các sản phẩm liên quan trước.'
          );
        } else {
          showToast('error', 'Xóa thất bại', errorMessage);
        }
      }
    } catch (error) {
      // Xử lý lỗi chi tiết hơn
      console.error('Delete size error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xóa kích thước';
      if (errorMessage.includes('foreign key constraint') || errorMessage.includes('sản phẩm sử dụng')) {
        showToast('error', 
          'Không thể xóa kích thước!', 
          'Kích thước đang được sử dụng bởi sản phẩm. Vui lòng xóa các sản phẩm liên quan trước.'
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
              <i className="bi bi-rulers me-2"></i>
              Quản lý kích thước
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onHide}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body p-3">
            {/* Add/Edit Size Form */}
            <div className="color-form-section mb-3">
              <div className="form-header">
                <h6 className="mb-2">
                  <i className="bi bi-plus-circle me-1"></i>
                  {editingSize ? 'Sửa kích thước' : 'Thêm kích thước mới'}
                </h6>
                {editingSize && (
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
                      Tên kích thước <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="VD: S, M, L, XL, XXL..."
                      maxLength={20}
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
                      {editingSize ? 'Cập nhật' : 'Thêm'}
                    </button>
                  </div>
                </div>
                {editingSize && (
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

            {/* Sizes List */}
            <div className="color-list-section">
              <div className="list-header">
                <h6 className="mb-2">
                  <i className="bi bi-list me-1"></i>
                  Danh sách kích thước ({sizes.length})
                </h6>
              </div>
              <div className="color-list-container">
                {loading ? (
                  <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : sizes.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '15%' }}>STT</th>
                          <th style={{ width: '55%' }}>Tên kích thước</th>
                          <th style={{ width: '30%' }}>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sizes.map((size, index) => (
                          <tr key={size.id}>
                            <td>{index + 1}</td>
                            <td><span className="badge bg-info">{size.name}</span></td>
                            <td>
                              <div className="btn-group" role="group">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleEdit(size)}
                                  disabled={loading}
                                  title="Sửa"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(size.id)}
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
                    <p className="text-muted mb-0 mt-2">Chưa có kích thước nào</p>
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

export default SizeManagementModal; 