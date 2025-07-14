// AddCategory.jsx
// Cập nhật để hỗ trợ tạo category con

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import categoryService from '@/services/categoryService';
import Toast from '@/components/Toast';
import './AddCategory.css'; // Chúng ta sẽ thay thế nội dung file này

const AddCategory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get parent category from state (if creating child category)
  const parentCategory = location.state?.parentCategory || null;
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    type: 'DROPDOWN',
    status: 'ACTIVE',
    parentId: parentCategory?.id || null
  });

  // Utility function to generate slug from Vietnamese text
  const generateSlug = (text) => {
    if (!text) return '';
    
    // Convert Vietnamese characters to ASCII
    const vietnameseMap = {
      'á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ': 'a',
      'Á|À|Ả|Ã|Ạ|Ă|Ắ|Ằ|Ẳ|Ẵ|Ặ|Â|Ấ|Ầ|Ẩ|Ẫ|Ậ': 'A',
      'é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ': 'e',
      'É|È|Ẻ|Ẽ|Ẹ|Ê|Ế|Ề|Ể|Ễ|Ệ': 'E',
      'í|ì|ỉ|ĩ|ị': 'i',
      'Í|Ì|Ỉ|Ĩ|Ị': 'I',
      'ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ': 'o',
      'Ó|Ò|Ỏ|Õ|Ọ|Ô|Ố|Ồ|Ổ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ở|Ỡ|Ợ': 'O',
      'ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự': 'u',
      'Ú|Ù|Ủ|Ũ|Ụ|Ư|Ứ|Ừ|Ử|Ữ|Ự': 'U',
      'ý|ỳ|ỷ|ỹ|ỵ': 'y',
      'Ý|Ỳ|Ỷ|Ỹ|Ỵ': 'Y',
      'đ': 'd',
      'Đ': 'D'
    };

    let slug = text.trim().toLowerCase();
    
    // Replace Vietnamese characters
    Object.keys(vietnameseMap).forEach(pattern => {
      const regex = new RegExp(`[${pattern}]`, 'g');
      slug = slug.replace(regex, vietnameseMap[pattern]);
    });
    
    // Replace spaces with hyphens and remove special characters
    slug = slug
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-z0-9\-]/g, '') // Remove special characters
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    return slug;
  };

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
    
    // Auto-generate slug when name changes
    if (name === 'name') {
      const generatedSlug = generateSlug(value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        slug: generatedSlug
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

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
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Tên danh mục phải có ít nhất 2 ký tự';
    } else if (!/.*[a-zA-Z]+.*/.test(formData.name)) {
      newErrors.name = 'Tên danh mục phải chứa ít nhất một ký tự chữ';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Tên danh mục không được vượt quá 100 ký tự';
    }

    // Validate description (optional for child categories)
    if (formData.description && formData.description.trim().length > 0) {
      if (formData.description.trim().length < 10) {
        newErrors.description = 'Mô tả phải có ít nhất 10 ký tự';
      } else if (!/.*[a-zA-Z]+.*/.test(formData.description)) {
        newErrors.description = 'Mô tả phải chứa ít nhất một ký tự chữ';
      }
    }

    // Validate type
    if (!formData.type) {
      newErrors.type = 'Vui lòng chọn kiểu danh mục';
    }

    // Validate status
    if (!formData.status) {
      newErrors.status = 'Vui lòng chọn trạng thái danh mục';
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
        description: formData.description.trim(),
        type: formData.type,
        status: formData.status,
        parentId: formData.parentId
      };

      const result = await categoryService.createCategory(submitData);

      if (result.success) {
        const categoryType = parentCategory ? 'danh mục con' : 'danh mục cha';
        showToast('success', 'Thành công', `Đã tạo ${categoryType} mới`);
        
        // Navigate back after a short delay to show toast
        setTimeout(() => {
          if (parentCategory) {
            // Go back to children list if creating child category
            navigate(`/categories/${parentCategory.id}/children`, {
              state: { parentCategory }
            });
          } else {
            // Go back to categories list if creating root category
            navigate('/categories');
          }
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
      description: '',
      type: 'DROPDOWN',
      status: 'ACTIVE',
      parentId: parentCategory?.id || null
    });
    setErrors({});
  };

  const handleBack = () => {
    if (parentCategory) {
      navigate(`/categories/${parentCategory.id}/children`, {
        state: { parentCategory }
      });
    } else {
      navigate('/categories');
    }
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
                  onClick={() => navigate('/categories')}
                >
                  Danh mục
                </button>
              </li>
              {parentCategory && (
                <li className="breadcrumb-item">
                  <button
                    className="btn btn-link p-0 text-decoration-none"
                    onClick={() => navigate(`/categories/${parentCategory.id}/children`, {
                      state: { parentCategory }
                    })}
                  >
                    {parentCategory.name}
                  </button>
                </li>
              )}
              <li className="breadcrumb-item active" aria-current="page">
                {parentCategory ? 'Thêm danh mục con' : 'Thêm danh mục cha'}
              </li>
            </ol>
          </nav>
          <h1 className="page-title">
            {parentCategory ? `Thêm danh mục con cho "${parentCategory.name}"` : 'Thêm danh mục cha mới'}
          </h1>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handleBack}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Quay lại
        </button>
      </header>

      {/* Parent Category Info (if creating child) */}
      {parentCategory && (
        <div className="card mb-4">
          <div className="card-body">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <h6 className="card-title mb-1">
                  <i className="bi bi-tag-fill text-primary me-2"></i>
                  Danh mục cha: {parentCategory.name}
                </h6>
                <p className="card-text text-muted mb-0">
                  {parentCategory.description || 'Không có mô tả'}
                </p>
              </div>
              <span className="badge bg-primary rounded-pill">
                Danh mục cha
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="form-container">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">
              <i className="bi bi-info-circle me-2"></i>
              Thông tin {parentCategory ? 'danh mục con' : 'danh mục cha'}
            </h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} noValidate>
              {/* Category Name */}
              <div className="mb-4">
                <label htmlFor="name" className="form-label">
                  Tên {parentCategory ? 'danh mục con' : 'danh mục cha'} <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className={`bi ${parentCategory ? 'bi-diagram-3' : 'bi-tag-fill'}`}></i>
                  </span>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={parentCategory 
                      ? "VD: Áo polo, Quần jean..." 
                      : "VD: Thời trang nam, Đồ điện tử..."
                    }
                    maxLength={100}
                  />
                </div>
                {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
                <div className="form-text">
                  {parentCategory 
                    ? `Tên danh mục con thuộc "${parentCategory.name}"`
                    : 'Tên danh mục cha cần rõ ràng, dễ hiểu.'
                  }
                </div>
              </div>

              {/* Category Slug */}
              <div className="mb-4">
                <label htmlFor="slug" className="form-label">
                  URL Slug (Đường dẫn thân thiện)
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fas fa-link"></i>
                  </span>
                  <input
                    type="text"
                    className={`form-control ${errors.slug ? 'is-invalid' : ''}`}
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="ao-polo-nam"
                    maxLength={120}
                  />
                </div>
                {errors.slug && <div className="invalid-feedback d-block">{errors.slug}</div>}
                <div className="form-text">
                  URL slug được tự động tạo từ tên danh mục. VD: "Áo Polo Nam" → "ao-polo-nam"
                </div>
              </div>

              {/* Category Description */}
              <div className="mb-4">
                <label htmlFor="description" className="form-label">
                  Mô tả {!parentCategory && <span className="text-danger">*</span>}
                </label>
                <textarea
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  id="description"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={parentCategory 
                    ? "Mô tả ngắn gọn về danh mục con này (tùy chọn)"
                    : "Mô tả chi tiết về danh mục cha này"
                  }
                />
                {errors.description && <div className="invalid-feedback d-block">{errors.description}</div>}
                <div className="form-text">
                  {parentCategory 
                    ? 'Mô tả chi tiết giúp khách hàng hiểu rõ hơn về nhóm sản phẩm này.'
                    : 'Mô tả chi tiết về danh mục cha và các sản phẩm thuộc nhóm này.'
                  }
                </div>
              </div>

              {/* Category Type */}
              <div className="mb-4">
                <label htmlFor="type" className="form-label">
                  Kiểu danh mục <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-gear"></i>
                  </span>
                  <select
                    className={`form-select ${errors.type ? 'is-invalid' : ''}`}
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="DROPDOWN">
                      <i className="bi bi-folder me-2"></i>
                      Thư mục (chỉ phân nhóm)
                    </option>
                    <option value="LINK">
                      <i className="bi bi-link me-2"></i>
                      Liên kết (có thể chứa sản phẩm)
                    </option>
                  </select>
                </div>
                {errors.type && <div className="invalid-feedback d-block">{errors.type}</div>}
                <div className="form-text">
                  <strong>Thư mục:</strong> Chỉ để phân nhóm, không thể chứa sản phẩm trực tiếp.<br/>
                  <strong>Liên kết:</strong> Có thể chứa sản phẩm trực tiếp.
                </div>
              </div>

              {/* Category Status */}
              <div className="mb-4">
                <label htmlFor="status" className="form-label">
                  Trạng thái <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-toggle-on"></i>
                  </span>
                  <select
                    className={`form-select ${errors.status ? 'is-invalid' : ''}`}
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="ACTIVE">
                      <i className="bi bi-check-circle me-2"></i>
                      Hoạt động
                    </option>
                    <option value="INACTIVE">
                      <i className="bi bi-x-circle me-2"></i>
                      Vô hiệu hóa
                    </option>
                  </select>
                </div>
                {errors.status && <div className="invalid-feedback d-block">{errors.status}</div>}
                <div className="form-text">
                  <strong>Hoạt động:</strong> Danh mục hiển thị và có thể sử dụng.<br/>
                  <strong>Vô hiệu hóa:</strong> Danh mục bị ẩn và không thể sử dụng.
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <div className="d-flex gap-3">
                  <button
                    type="submit"
                    className={`btn ${parentCategory ? 'btn-success' : 'btn-primary'}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>
                        Tạo {parentCategory ? 'danh mục con' : 'danh mục cha'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleReset}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Làm mới
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={handleBack}
                    disabled={loading}
                  >
                    <i className="bi bi-x-lg me-2"></i>
                    Hủy
                  </button>
                </div>
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