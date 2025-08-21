// src/pages/admin/payment-method/EditPaymentMethod.jsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import paymentMethodService from '@/services/paymentMethodService';
import Toast from '@/components/Toast';
// Tái sử dụng CSS của trang Add
import './EditPaymentMethod.css'; 

const EditPaymentMethod = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy ID từ URL

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'ONLINE_REDIRECT',
    enabled: true,
  });
  const [originalCode, setOriginalCode] = useState(''); // State để lưu code gốc
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, type: 'success', title: '', message: '' });

  // Load dữ liệu của payment method cần sửa
  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await paymentMethodService.getById(id);
    if (result.success) {
      const methodToEdit = result.data;
      setFormData({
        name: methodToEdit.name,
        description: methodToEdit.description,
        type: methodToEdit.type,
        enabled: methodToEdit.enabled,
      });
      setOriginalCode(methodToEdit.code); // Lưu lại code gốc
      setImagePreview(methodToEdit.imageUrl);
    } else {
      showToast('error', 'Lỗi', `Không tìm thấy phương thức thanh toán với ID: ${id}`);
      setTimeout(() => navigate('/payment-methods'), 2000);
    }
    setLoading(false);
  }, [id, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);


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
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else if (file) {
      showToast('error', 'Lỗi', 'Vui lòng chọn một file ảnh hợp lệ.');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Tên không được để trống';
    if (!formData.description.trim()) newErrors.description = 'Mô tả không được để trống';
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
      const result = await paymentMethodService.updateMethod(id, formData, imageFile);
      if (result.success) {
        showToast('success', 'Thành công', 'Đã cập nhật phương thức thanh toán');
        setTimeout(() => navigate('/payment-methods'), 1500);
      } else {
        showToast('error', 'Lỗi', result.message || 'Có lỗi xảy ra khi cập nhật');
      }
    } catch (error) {
      showToast('error', 'Lỗi', 'Có lỗi xảy ra khi cập nhật');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate('/payment-methods');

  if (loading && !formData.name) {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
            <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
        </div>
    );
  }

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
                Chỉnh sửa "{formData.name}"
              </li>
            </ol>
          </nav>
          <h1 className="page-title">Chỉnh sửa phương thức thanh toán</h1>
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
                  {/* Code (Read-only) */}
                  <div className="mb-4">
                    <label htmlFor="code" className="form-label">Mã (Code)</label>
                    <input type="text" className="form-control" id="code" name="code" value={originalCode} readOnly disabled/>
                    <div className="form-text">Mã không thể thay đổi sau khi tạo.</div>
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
                    <textarea className={`form-control ${errors.description ? 'is-invalid' : ''}`} id="description" name="description" rows="4" value={formData.description} onChange={handleInputChange} placeholder="Mô tả ngắn gọn..."/>
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
                  <div className="mb-4">
                    <label htmlFor="image" className="form-label">Ảnh đại diện</label>
                    <div className="image-upload-box">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Xem trước" className="image-preview"/>
                      ) : (
                        <div className="upload-placeholder"><i className="bi bi-image"></i><span>Tải ảnh lên</span></div>
                      )}
                      <input type="file" id="image" accept="image/*" onChange={handleImageChange} className="image-input"/>
                    </div>
                    <div className="form-text">Bỏ trống nếu không muốn thay đổi ảnh hiện tại.</div>
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <div className="d-flex gap-3">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (<><span className="spinner-border spinner-border-sm me-2"></span> Đang lưu...</>) : (<><i className="bi bi-check-lg me-2"></i> Lưu thay đổi</>)}
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

export default EditPaymentMethod;