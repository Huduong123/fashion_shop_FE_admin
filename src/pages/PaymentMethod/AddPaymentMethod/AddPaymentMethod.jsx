// src/pages/admin/payment-method/AddPaymentMethod.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import paymentMethodService from '@/services/paymentMethodService';
import Toast from '@/components/Toast';
import './AddPaymentMethod.css'; // File CSS mới, sẽ tạo ở bước sau

const AddPaymentMethod = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'ONLINE_REDIRECT',
    enabled: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, type: 'success', title: '', message: '' });

  const showToast = (type, title, message = '') => {
    setToast({ show: true, type, title, message });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: '' }));
      }
    } else {
      setImageFile(null);
      setImagePreview('');
      showToast('error', 'Lỗi', 'Vui lòng chọn một file ảnh hợp lệ.');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.code.trim()) newErrors.code = 'Mã không được để trống';
    if (!formData.name.trim()) newErrors.name = 'Tên không được để trống';
    if (!formData.description.trim()) newErrors.description = 'Mô tả không được để trống';
    if (!imageFile) newErrors.image = 'Vui lòng tải lên ảnh đại diện';
    
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
      const result = await paymentMethodService.createMethod(formData, imageFile);
      if (result.success) {
        showToast('success', 'Thành công', 'Đã tạo phương thức thanh toán mới');
        setTimeout(() => navigate('/payment-methods'), 1500);
      } else {
        showToast('error', 'Lỗi', result.message || 'Có lỗi xảy ra khi tạo mới');
      }
    } catch (error) {
      console.error('Error creating payment method:', error);
      showToast('error', 'Lỗi', 'Có lỗi xảy ra khi tạo mới');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate('/payment-methods');

  return (
    <div className="add-payment-method-page">
      <header className="page-header">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <button className="btn btn-link p-0 text-decoration-none" onClick={handleBack}>
                  Phương thức thanh toán
                </button>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Thêm mới
              </li>
            </ol>
          </nav>
          <h1 className="page-title">Thêm phương thức thanh toán mới</h1>
        </div>
        <button type="button" className="btn btn-outline-secondary" onClick={handleBack}>
          <i className="bi bi-arrow-left me-2"></i>
          Quay lại
        </button>
      </header>

      <div className="form-container">
        <div className="card">
          <div className="card-header"><h5 className="card-title">Thông tin chi tiết</h5></div>
          <div className="card-body">
            <form onSubmit={handleSubmit} noValidate>
              <div className="row">
                <div className="col-md-8">
                  {/* Code */}
                  <div className="mb-4">
                    <label htmlFor="code" className="form-label">Mã (Code) <span className="text-danger">*</span></label>
                    <input type="text" className={`form-control ${errors.code ? 'is-invalid' : ''}`} id="code" name="code" value={formData.code} onChange={handleInputChange} placeholder="VD: momo-e-wallet"/>
                    {errors.code && <div className="invalid-feedback d-block">{errors.code}</div>}
                    <div className="form-text">Mã định danh duy nhất, không dấu, không khoảng trắng.</div>
                  </div>

                  {/* Name */}
                  <div className="mb-4">
                    <label htmlFor="name" className="form-label">Tên phương thức <span className="text-danger">*</span></label>
                    <input type="text" className={`form-control ${errors.name ? 'is-invalid' : ''}`} id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="VD: Ví điện tử Momo"/>
                    {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label htmlFor="description" className="form-label">Mô tả <span className="text-danger">*</span></label>
                    <textarea className={`form-control ${errors.description ? 'is-invalid' : ''}`} id="description" name="description" rows="4" value={formData.description} onChange={handleInputChange} placeholder="Mô tả ngắn gọn về phương thức thanh toán..."/>
                    {errors.description && <div className="invalid-feedback d-block">{errors.description}</div>}
                  </div>

                  {/* Type */}
                  <div className="mb-4">
                    <label htmlFor="type" className="form-label">Loại <span className="text-danger">*</span></label>
                    <select className="form-select" id="type" name="type" value={formData.type} onChange={handleInputChange}>
                      <option value="ONLINE_REDIRECT">Online (Chuyển hướng)</option>
                      <option value="OFFLINE">Offline (Thanh toán sau)</option>
                    </select>
                  </div>

                  {/* Enabled */}
                  <div className="form-check form-switch mb-4">
                    <input className="form-check-input" type="checkbox" role="switch" id="enabled" name="enabled" checked={formData.enabled} onChange={handleInputChange}/>
                    <label className="form-check-label" htmlFor="enabled">Kích hoạt</label>
                  </div>
                </div>

                <div className="col-md-4">
                  {/* Image Upload */}
                  <div className="mb-4">
                    <label htmlFor="image" className="form-label">Ảnh đại diện <span className="text-danger">*</span></label>
                    <div className={`image-upload-box ${errors.image ? 'is-invalid' : ''}`}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="Xem trước" className="image-preview"/>
                      ) : (
                        <div className="upload-placeholder">
                          <i className="bi bi-image"></i>
                          <span>Tải ảnh lên</span>
                        </div>
                      )}
                      <input type="file" id="image" accept="image/*" onChange={handleImageChange} className="image-input"/>
                    </div>
                    {errors.image && <div className="invalid-feedback d-block">{errors.image}</div>}
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <div className="d-flex gap-3">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (<><span className="spinner-border spinner-border-sm me-2"></span> Đang tạo...</>) : (<><i className="bi bi-check-lg me-2"></i> Tạo mới</>)}
                  </button>
                  <button type="button" className="btn btn-outline-danger" onClick={handleBack} disabled={loading}>
                    <i className="bi bi-x-lg me-2"></i> Hủy
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Toast show={toast.show} onHide={hideToast} type={toast.type} title={toast.title} message={toast.message}/>
    </div>
  );
};

export default AddPaymentMethod;