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
    description: ''
  });

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
        navigate('/category');
        return;
      }

      setInitialLoading(true);
      try {
        const result = await categoryService.getCategoryById(id);
        
        if (result.success) {
          setFormData({
            name: result.data.name || '',
            description: result.data.description || ''
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

      const result = await categoryService.updateCategory(id, submitData);

      if (result.success) {
        showToast('success', 'Thành công', 'Đã cập nhật danh mục');
        // Navigate back after a short delay to show toast
        setTimeout(() => {
          navigate('/category');
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
          description: result.data.description || ''
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
                onClick={() => navigate('/category')}
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
                  onClick={() => navigate('/category')}
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
