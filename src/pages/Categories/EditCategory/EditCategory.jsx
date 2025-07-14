import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import categoryService from '@/services/categoryService';
import Toast from '@/components/Toast';
import './EditCategory.css';

const EditCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    type: 'DROPDOWN',
    status: 'ACTIVE'
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
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [categoryNotFound, setCategoryNotFound] = useState(false);

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

  // Load category data on component mount
  useEffect(() => {
    const loadCategory = async () => {
      if (!id) {
        navigate('/categories');
        return;
      }

      setInitialLoading(true);
      try {
        const result = await categoryService.getCategoryById(id);
        
        if (result.success) {
          setFormData({
            name: result.data.name || '',
            slug: result.data.slug || '',
            description: result.data.description || '',
            type: result.data.type || 'DROPDOWN',
            status: result.data.status || 'ACTIVE'
          });
        } else {
          setCategoryNotFound(true);
          showToast('error', 'Lỗi', 'Không tìm thấy danh mục');
        }
      } catch (error) {
        console.error('Error loading category:', error);
        setCategoryNotFound(true);
        showToast('error', 'Lỗi', 'Có lỗi xảy ra khi tải thông tin danh mục');
      } finally {
        setInitialLoading(false);
      }
    };

    loadCategory();
  }, [id, navigate]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    
    // For edit form, only regenerate slug if slug field is empty or unchanged from generated value
    if (name === 'name') {
      const currentSlug = formData.slug;
      const expectedSlug = generateSlug(formData.name);
      
      // Only auto-update slug if it's empty or matches the expected generated slug
      if (!currentSlug || currentSlug === expectedSlug) {
        const newSlug = generateSlug(value);
        setFormData(prev => ({
          ...prev,
          [name]: value,
          slug: newSlug
        }));
      } else {
        // User has manually edited slug, don't override
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
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

    // Validate description
    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = 'Mô tả phải có ít nhất 10 ký tự';
    } else if (!/.*[a-zA-Z]+.*/.test(formData.description)) {
      newErrors.description = 'Mô tả phải chứa ít nhất một ký tự chữ';
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
        status: formData.status
      };

      const result = await categoryService.updateCategory(id, submitData);

      if (result.success) {
        showToast('success', 'Thành công', 'Đã cập nhật danh mục');
        // Navigate back after a short delay to show toast
        setTimeout(() => {
          navigate('/categories');
        }, 1500);
      } else {
        showToast('error', 'Lỗi', result.message || 'Có lỗi xảy ra khi cập nhật danh mục');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      showToast('error', 'Lỗi', 'Có lỗi xảy ra khi cập nhật danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    // Reset to original data by reloading from server
    setInitialLoading(true);
    try {
      const result = await categoryService.getCategoryById(id);
      
      if (result.success) {
        setFormData({
          name: result.data.name || '',
          description: result.data.description || '',
          type: result.data.type || 'DROPDOWN',
          status: result.data.status || 'ACTIVE'
        });
        setErrors({});
        showToast('info', 'Đã khôi phục', 'Dữ liệu đã được khôi phục về trạng thái ban đầu');
      }
    } catch (error) {
      console.error('Error resetting form:', error);
      showToast('error', 'Lỗi', 'Có lỗi xảy ra khi khôi phục dữ liệu');
    } finally {
      setInitialLoading(false);
    }
  };

  // Show loading state
  if (initialLoading) {
    return (
      <div className="edit-category-page">
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="loading-text">Đang tải thông tin danh mục...</div>
        </div>
      </div>
    );
  }

  // Show not found state
  if (categoryNotFound) {
    return (
      <div className="edit-category-page">
        <div className="form-container">
          <div className="card">
            <div className="card-body text-center">
              <i className="bi bi-exclamation-triangle fs-1 text-warning mb-3"></i>
              <h4>Không tìm thấy danh mục</h4>
              <p className="text-muted">Danh mục bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/categories')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Quay lại danh sách
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-category-page">
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
              <li className="breadcrumb-item active" aria-current="page">
                Chỉnh sửa danh mục
              </li>
            </ol>
          </nav>
          <h1 className="page-title">Chỉnh sửa danh mục</h1>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary"
            onClick={() => navigate('/categories')}
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
              <i className="bi bi-pencil-square me-2"></i>
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
                    required
                  />
                </div>
                {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
                <div className="form-text">Tên danh mục cần rõ ràng, dễ hiểu.</div>
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
                  URL slug tự động tạo từ tên danh mục. Bạn có thể chỉnh sửa thủ công nếu cần.
                </div>
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
                  required
                />
                {errors.description && (
                  <div className="invalid-feedback d-block">{errors.description}</div>
                )}
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

              {/* Action Buttons */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleReset}
                  disabled={loading || initialLoading}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Khôi phục
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading || initialLoading}>
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-2"></i>
                      Cập nhật danh mục
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

export default EditCategory;
