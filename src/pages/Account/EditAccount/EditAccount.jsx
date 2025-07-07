import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import accountService from '@/services/accountService';
import Toast from '@/components/Toast';
import withAuthorization from '@/components/HOC/withAuthorization.jsx'; // <<< THÊM IMPORT
import './EditAccount.css';

// Component gốc giữ nguyên
const EditAccount = () => {
    // ... toàn bộ code của component EditAccount của bạn giữ nguyên ...
    const navigate = useNavigate()
    const { id } = useParams()
    const [formData, setFormData] = useState({
      id: '',
      email: '',
      fullname: '',
      phone: '',
      gender: '',
      birthday: '',
      password: '',
      confirmPassword: '',
      enabled: true
    })
  
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [errors, setErrors] = useState({})
    const [originalData, setOriginalData] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    
    // Toast states
    const [toast, setToast] = useState({
      show: false,
      type: 'success',
      title: '',
      message: ''
    })
  
    // Load account data
    useEffect(() => {
      if (id) {
        loadAccountData()
      }
    }, [id])
  
    const loadAccountData = async () => {
      setLoadingData(true)
      try {
        const result = await accountService.getAccount(id)
        if (result.success) {
          const accountData = result.data
          const formattedData = {
            id: accountData.id,
            email: accountData.email,
            fullname: accountData.fullname || '',
            phone: accountData.phone || '',
            gender: accountData.gender || '',
            birthday: formatDateForInput(accountData.birthday || accountData.birth_day), // Handle both possible field names
            password: '', // Always start empty for security
            confirmPassword: '', // Always start empty for security
            enabled: accountData.enabled
          }
          setFormData(formattedData)
          setOriginalData(formattedData)
        } else {
          showToast('error', 'Lỗi', result.message || 'Không thể tải thông tin tài khoản')
        }
      } catch (error) {
        console.error('Error loading account:', error)
        showToast('error', 'Lỗi', 'Có lỗi xảy ra khi tải thông tin tài khoản')
      } finally {
        setLoadingData(false)
      }
    }
  
    // Format date from backend to input format (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
      if (!dateString) return ''
      
      // Handle DD/MM/YYYY format from backend
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/')
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }
      
      // Handle ISO date format
      const date = new Date(dateString)
      return date.toISOString().split('T')[0]
    }
  
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
  
      // Password validation (optional - only validate if provided)
      if (formData.password && formData.password.trim()) {
        if (formData.password.length < 6) {
          newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
        } else if (!/^[A-Z]/.test(formData.password)) {
          newErrors.password = 'Mật khẩu phải bắt đầu bằng chữ hoa'
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
          newErrors.password = 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt'
        } else if (/\s/.test(formData.password)) {
          newErrors.password = 'Mật khẩu không được chứa khoảng trắng'
        }
  
        // Confirm Password validation (only if password is provided)
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu'
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Xác nhận mật khẩu không khớp'
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
        
        // Only include password if it's provided
        if (!formattedData.password || !formattedData.password.trim()) {
          delete formattedData.password
        }
  
        const result = await accountService.updateAccount(id, formattedData)
        
        if (result.success) {
          showToast('success', 'Thành công', 'Tài khoản đã được cập nhật thành công')
          setTimeout(() => {
            navigate('/account')
          }, 1500)
        } else {
          showToast('error', 'Lỗi', result.message || 'Không thể cập nhật tài khoản')
        }
      } catch (error) {
        console.error('Error updating account:', error)
        showToast('error', 'Lỗi', 'Có lỗi xảy ra khi cập nhật tài khoản')
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
  
    const hasChanges = () => {
      // Compare non-password fields
      const { password, confirmPassword, ...formDataWithoutPassword } = formData
      const { password: origPassword, confirmPassword: origConfirm, ...originalDataWithoutPassword } = originalData;
      const hasRegularChanges = JSON.stringify(formDataWithoutPassword) !== JSON.stringify(originalDataWithoutPassword)
      
      // Check if password is being changed
      const hasPasswordChange = password && password.trim()
      
      return hasRegularChanges || hasPasswordChange
    }
  
    if (loadingData) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )
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
                  Chỉnh sửa tài khoản
                </li>
              </ol>
            </nav>
            <h2 className="mb-0">Chỉnh sửa tài khoản</h2>
            {formData.id && (
              <small className="text-muted">ID: {formData.id}</small>
            )}
          </div>
        </div>
  
        {/* Form */}
        <div className="w-100 px-3">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-4">
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
  
                  {/* Password Section */}
                  <div className="col-12">
                    <hr className="my-4" />
                    <h5 className="mb-3">
                      <i className="bi bi-shield-lock me-2"></i>
                      Thay đổi mật khẩu (tùy chọn)
                    </h5>
                    <p className="text-muted small mb-4">
                      Để trống nếu không muốn thay đổi mật khẩu hiện tại
                    </p>
                  </div>
  
                  {/* Password */}
                  <div className="col-md-6">
                    <label htmlFor="password" className="form-label">
                      Mật khẩu mới
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Nhập mật khẩu mới (để trống để không đổi)"
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
  
                  {/* Confirm Password */}
                  <div className="col-md-6">
                    <label htmlFor="confirmPassword" className="form-label">
                      Xác nhận mật khẩu mới
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
                        placeholder="Nhập lại mật khẩu mới để xác nhận"
                        disabled={!formData.password}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                        disabled={!formData.password}
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
  
                  {/* Submit Buttons */}
                  <div className="col-12">
                    <div className="d-flex gap-3 pt-3">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || !hasChanges()}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Đang cập nhật...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-lg me-2"></i>
                            Cập nhật tài khoản
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
                      {hasChanges() && (
                        <small className="text-warning align-self-center ms-2">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          Có thay đổi chưa lưu
                        </small>
                      )}
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
export default withAuthorization(EditAccount, ['SYSTEM']);