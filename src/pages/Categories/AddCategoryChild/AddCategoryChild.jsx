import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import categoryService from '@/services/categoryService';
import Toast from '@/components/Toast';
import './AddCategoryChild.css';

const AddCategoryChild = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { parentId } = useParams();
  
  // Get parent category from state or fetch it
  const [parentCategory, setParentCategory] = useState(location.state?.parentCategory || null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'DROPDOWN',
    status: 'ACTIVE',
    parentId: parentId
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Toast states
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });

  useEffect(() => {
    const loadParentCategory = async () => {
      if (!parentCategory && parentId) {
        setInitialLoading(true);
        try {
          const result = await categoryService.getCategoryById(parentId);
          if (result.success) {
            setParentCategory(result.data);
          } else {
            showToast('error', 'Lỗi', 'Không thể tải thông tin danh mục cha');
            navigate('/categories');
          }
        } catch (error) {
          console.error('Error loading parent category:', error);
          showToast('error', 'Lỗi', 'Có lỗi xảy ra khi tải thông tin danh mục cha');
          navigate('/categories');
        } finally {
          setInitialLoading(false);
        }
      }
    };

    loadParentCategory();
  }, [parentId, parentCategory, navigate]);

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
      newErrors.name = 'Tên danh mục con phải có ít nhất 3 ký tự';
    } else if (!/.*[a-zA-Z]+.*/.test(formData.name)) {
      newErrors.name = 'Tên danh mục con phải chứa ít nhất một ký tự chữ';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Tên danh mục con không được vượt quá 100 ký tự';
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
        parentId: parentId
      };

      const result = await categoryService.createCategory(submitData);

      if (result.success) {
        showToast('success', 'Thành công', 'Đã tạo danh mục con mới');
        
        // Navigate back after a short delay to show toast
        setTimeout(() => {
          navigate(`/categories/${parentId}/children`, {
            state: { parentCategory }
          });
        }, 1500);
      } else {
        showToast('error', 'Lỗi', result.message || 'Có lỗi xảy ra khi tạo danh mục con');
      }
    } catch (error) {
      console.error('Error creating category child:', error);
      showToast('error', 'Lỗi', 'Có lỗi xảy ra khi tạo danh mục con');
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
      parentId: parentId
    });
    setErrors({});
  };

  const handleBack = () => {
    navigate(`/categories/${parentId}/children`, {
      state: { parentCategory }
    });
  };

  if (initialLoading) {
    return (
      <div className="add-category-child-page">
        <div className="loading-container">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="loading-text">Đang tải thông tin danh mục cha...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-category-child-page">
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
              <li className="breadcrumb-item">
                <button
                  className="btn btn-link p-0 text-decoration-none"
                  onClick={handleBack}
                >
                  {parentCategory?.name || 'Danh mục con'}
                </button>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Thêm danh mục con
              </li>
            </ol>
          </nav>
          <h1 className="page-title">
            <i className="bi bi-diagram-3 me-2 text-success"></i>
            Thêm danh mục con cho "{parentCategory?.name}"
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

      {/* Parent Category Info */}
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
              Thông tin danh mục con
            </h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} noValidate>
              {/* Category Name */}
              <div className="mb-4">
                <label htmlFor="name" className="form-label">
                  Tên danh mục con <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-diagram-3"></i>
                  </span>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="VD: Áo polo, Quần jean, Giày thể thao..."
                    maxLength={100}
                  />
                </div>
                {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
                <div className="form-text">
                  Tên danh mục con thuộc "{parentCategory?.name || 'danh mục cha'}"
                </div>
              </div>

              {/* Category Description */}
              <div className="mb-4">
                <label htmlFor="description" className="form-label">
                  Mô tả <span className="text-muted">(tùy chọn)</span>
                </label>
                <textarea
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  id="description"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Mô tả ngắn gọn về danh mục con này..."
                />
                {errors.description && <div className="invalid-feedback d-block">{errors.description}</div>}
                <div className="form-text">
                  Mô tả chi tiết giúp khách hàng hiểu rõ hơn về nhóm sản phẩm này.
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
                    className="btn btn-success"
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
                        Tạo danh mục con
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

export default AddCategoryChild;
