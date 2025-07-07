import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import accountService from '@/services/accountService';
import Toast from '@/components/Toast';
import withAuthorization from '@/components/HOC/withAuthorization.jsx'; // <<< THÊM IMPORT
import './AddAccount.css';

// Component gốc giữ nguyên
const AddAccount = () => {
  // ... toàn bộ code của component AddAccount của bạn giữ nguyên ...
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    fullname: '',
    phone: '',
    gender: '',
    birthday: '',
    enabled: true
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Toast states
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  })

  // Toast functions
  const showToast = (type, title, message = '') => {
    setToast({
      show: true,
      type,
      title,
      message
    })
  }

  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      show: false
    }))
  }

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }))
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }

    // Real-time validation for confirm password
    if (name === 'confirmPassword') {
      if (newValue && formData.password && newValue !== formData.password) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: 'Xác nhận mật khẩu không khớp'
        }))
      } else if (newValue === formData.password) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: null
        }))
      }
    }

    // Also check confirm password when password changes
    if (name === 'password') {
      if (formData.confirmPassword && newValue !== formData.confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: 'Xác nhận mật khẩu không khớp'
        }))
      } else if (formData.confirmPassword && newValue === formData.confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: null
        }))
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Username validation
    if (!formData.username || formData.username.trim().length < 6) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 6 ký tự'
    } else if (/\s/.test(formData.username)) {
      newErrors.username = 'Tên đăng nhập không được chứa khoảng trắng'
    }

    // Password validation
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    } else if (!/^[A-Z]/.test(formData.password)) {
      newErrors.password = 'Mật khẩu phải bắt đầu bằng chữ hoa'
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      newErrors.password = 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt'
    } else if (/\s/.test(formData.password)) {
      newErrors.password = 'Mật khẩu không được chứa khoảng trắng'
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không khớp'
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email không được để trống'
    } else if (!/^[\w.+\-]+@gmail\.com$/.test(formData.email)) {
      newErrors.email = 'Email phải đúng định dạng @gmail.com'
    }

    // Fullname validation
    if (!formData.fullname || formData.fullname.trim().length < 6) {
      newErrors.fullname = 'Họ và tên phải có ít nhất 6 ký tự'
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Số điện thoại không được để trống'
    } else if (!/^0\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại phải đúng định dạng 0xxxxxxxxx'
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Vui lòng chọn giới tính'
    }

    // Birthday validation
    if (!formData.birthday) {
      newErrors.birthday = 'Ngày sinh không được để trống'
    } else {
      const birthDate = new Date(formData.birthday)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      if (age < 16 || age > 100) {
        newErrors.birthday = 'Tuổi phải từ 16 đến 100'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      showToast('error', 'Lỗi', 'Vui lòng kiểm tra lại thông tin')
      return
    }

    setLoading(true)
    try {
      // Format birthday to DD/MM/YYYY format for backend
      const formattedData = {
        ...formData,
        birth_day: formatDateForBackend(formData.birthday)
      }
      delete formattedData.birthday // Remove the original birthday field
      delete formattedData.confirmPassword // Remove confirmPassword field (not needed for backend)

      const result = await accountService.createAccount(formattedData)
      
      if (result.success) {
        showToast('success', 'Thành công', 'Tài khoản đã được tạo thành công')
        setTimeout(() => {
          navigate('/account')
        }, 1500)
      } else {
        showToast('error', 'Lỗi', result.message || 'Không thể tạo tài khoản')
      }
    } catch (error) {
      console.error('Error creating account:', error)
      showToast('error', 'Lỗi', 'Có lỗi xảy ra khi tạo tài khoản')
    } finally {
      setLoading(false)
    }
  }

  const formatDateForBackend = (dateString) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const handleCancel = () => {
    navigate('/account')
  }

  return (
    <div className="w-100">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 px-3">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <button 
                  className="btn btn-link p-0 text-decoration-none"
                  onClick={() => navigate('/account')}
                >
                  Quản lý tài khoản
                </button>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Thêm tài khoản
              </li>
            </ol>
          </nav>
          <h2 className="mb-0">Thêm tài khoản mới</h2>
        </div>
      </div>

      {/* Form */}
      <div className="w-100 px-3">
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                {/* Username */}
                <div className="col-md-6">
                  <label htmlFor="username" className="form-label">
                    Tên đăng nhập <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Nhập tên đăng nhập (tối thiểu 6 ký tự)"
                  />
                  {errors.username && (
                    <div className="invalid-feedback">{errors.username}</div>
                  )}
                </div>

                {/* Fullname */}
                <div className="col-md-6">
                  <label htmlFor="fullname" className="form-label">
                    Họ và tên <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.fullname ? 'is-invalid' : ''}`}
                    id="fullname"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên đầy đủ (tối thiểu 6 ký tự)"
                  />
                  {errors.fullname && (
                    <div className="invalid-feedback">{errors.fullname}</div>
                  )}
                </div>

                {/* Password */}
                <div className="col-md-6">
                  <label htmlFor="password" className="form-label">
                    Mật khẩu <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Nhập mật khẩu (bắt đầu với chữ hoa, có ký tự đặc biệt)"
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={togglePasswordVisibility}
                      title={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                  {errors.password && (
                    <div className="invalid-feedback d-block">{errors.password}</div>
                  )}
                </div>

                {/* Phone */}
                <div className="col-md-6">
                  <label htmlFor="phone" className="form-label">
                    Số điện thoại <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại (0xxxxxxxxx)"
                  />
                  {errors.phone && (
                    <div className="invalid-feedback">{errors.phone}</div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="col-md-6">
                  <label htmlFor="confirmPassword" className="form-label">
                    Xác nhận mật khẩu <span className="text-danger">*</span>
                    {formData.confirmPassword && formData.password && formData.confirmPassword === formData.password && (
                      <span className="text-success ms-2">
                        <i className="bi bi-check-circle"></i> Khớp
                      </span>
                    )}
                  </label>
                  <div className="input-group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={`form-control ${
                        errors.confirmPassword 
                          ? 'is-invalid password-mismatch' 
                          : formData.confirmPassword && formData.password && formData.confirmPassword === formData.password
                          ? 'password-match'
                          : formData.confirmPassword && formData.password && formData.confirmPassword !== formData.password
                          ? 'password-mismatch'
                          : ''
                      }`}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Nhập lại mật khẩu để xác nhận"
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                    >
                      <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="invalid-feedback d-block">{errors.confirmPassword}</div>
                  )}
                  {!errors.confirmPassword && formData.confirmPassword && formData.password && formData.confirmPassword === formData.password && (
                    <div className="text-success small mt-1">
                      <i className="bi bi-check-circle me-1"></i>
                      Mật khẩu xác nhận chính xác
                    </div>
                  )}
                </div>

                {/* Gender */}
                <div className="col-md-6">
                  <label htmlFor="gender" className="form-label">
                    Giới tính <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${errors.gender ? 'is-invalid' : ''}`}
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                  {errors.gender && (
                    <div className="invalid-feedback">{errors.gender}</div>
                  )}
                </div>

                {/* Email */}
                <div className="col-md-6">
                  <label htmlFor="email" className="form-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Nhập email (@gmail.com)"
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                {/* Birthday */}
                <div className="col-md-6">
                  <label htmlFor="birthday" className="form-label">
                    Ngày sinh <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className={`form-control ${errors.birthday ? 'is-invalid' : ''}`}
                    id="birthday"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleInputChange}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]}
                  />
                  {errors.birthday && (
                    <div className="invalid-feedback">{errors.birthday}</div>
                  )}
                </div>

                {/* Enabled */}
                <div className="col-md-6">
                  <div className="form-check d-flex align-items-center" style={{ marginTop: '32px' }}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="enabled"
                      name="enabled"
                      checked={formData.enabled}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label ms-2" htmlFor="enabled">
                      Kích hoạt tài khoản
                    </label>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="col-12">
                  <div className="d-flex gap-3 pt-3">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Đang tạo...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg me-2"></i>
                          Tạo tài khoản
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      <i className="bi bi-x-lg me-2"></i>
                      Hủy
                    </button>
                  </div>
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
  )
};

// <<< THAY ĐỔI: Bọc component bằng HOC và export
export default withAuthorization(AddAccount, ['SYSTEM']);