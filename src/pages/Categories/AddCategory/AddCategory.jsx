// AddCategory.jsx
// Không cần thay đổi gì trong file này. Cấu trúc hiện tại đã rất tốt
// để áp dụng CSS mới.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import categoryService from '@/services/categoryService';
import Toast from '@/components/Toast';
import './AddCategory.css'; // Chúng ta sẽ thay thế nội dung file này

const AddCategory = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Toast states
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });

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

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Tên danh mục phải có ít nhất 3 ký tự';
    } else if (!/.*[a-zA-Z]+.*/.test(formData.name)) {
      newErrors.name = 'Tên danh mục phải chứa ít nhất một ký tự chữ';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Tên danh mục không được vượt quá 100 ký tự';
    }

    // Validate description
    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = 'Mô tả phải có ít nhất 10 ký tự';
    } else if (!/.*[a-zA-Z]+.*/.test(formData.description)) {
      newErrors.description = 'Mô tả phải chứa ít nhất một ký tự chữ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('error', 'Lỗi', 'Vui lòng kiểm tra lại thông tin');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim()
      };

      const result = await categoryService.createCategory(submitData);

      if (result.success) {
        showToast('success', 'Thành công', 'Đã tạo danh mục mới');
        // Navigate back after a short delay to show toast
        setTimeout(() => {
          navigate('/category');
        }, 1500);
      } else {
        showToast('error', 'Lỗi', result.message || 'Có lỗi xảy ra khi tạo danh mục');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      showToast('error', 'Lỗi', 'Có lỗi xảy ra khi tạo danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      description: ''
    });
    setErrors({});
  };

  return (
    <div className="add-category-page">
      {/* Header */}
      <header className="page-header">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <button
                  className="btn btn-link p-0 text-decoration-none"
                  onClick={() => navigate('/category')}
                >
                  Danh mục
                </button>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Thêm danh mục
              </li>
            </ol>
          </nav>
          <h1 className="page-title">Thêm danh mục mới</h1>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate('/category')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Quay lại
        </button>
      </header>

      {/* Form */}
      <div className="form-container">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">
              <i className="bi bi-info-circle me-2"></i>
              Thông tin danh mục
            </h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} noValidate>
              {/* Category Name */}
              <div className="mb-4">
                <label htmlFor="name" className="form-label">
                  Tên danh mục <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-tag-fill"></i>
                  </span>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="VD: Thời trang nam, Đồ điện tử..."
                    maxLength={100}
                  />
                </div>
                {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
                <div className="form-text">Tên danh mục cần rõ ràng, dễ hiểu.</div>
              </div>

              {/* Category Description */}
              <div className="mb-4">
                <label htmlFor="description" className="form-label">
                  Mô tả <span className="text-danger">*</span>
                </label>
                <textarea
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  id="description"
                  name="description"
                  rows={5}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Mô tả chi tiết về danh mục này..."

                />
                {errors.description && (
                  <div className="invalid-feedback d-block">{errors.description}</div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleReset}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Nhập lại
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-2"></i>
                      Tạo danh mục
                    </>
                  )}
                </button>
              </div>
            </form>
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
      />
    </div>
  );
};

export default AddCategory;