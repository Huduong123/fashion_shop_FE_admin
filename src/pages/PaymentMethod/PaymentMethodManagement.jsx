// src/pages/admin/payment-method/PaymentMethodManagement.jsx

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import paymentMethodService from '@/services/paymentMethodService' 
import Toast from '@/components/Toast'
import './PaymentMethod.css'
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal'
const PaymentMethodManagement = () => {
  const navigate = useNavigate()
  // BƯỚC 2: KHỞI TẠO STATE RỖNG
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true) // Bắt đầu với trạng thái loading
  const [error, setError] = useState(null)
  
  // Các state khác giữ nguyên
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchInputs, setSearchInputs] = useState({ name: '', enabled: '' })
  const [appliedFilters, setAppliedFilters] = useState(null)
  const [toast, setToast] = useState({ show: false, type: 'success', title: '', message: '' })
  
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const enabledOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'true', label: 'Đang bật' },
    { value: 'false', label: 'Đã tắt' }
  ]

  // BƯỚC 3: CẬP NHẬT HÀM GỌI API THẬT
  const loadPaymentMethods = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // API backend hiện tại trả về một danh sách đầy đủ, không phân trang.
      // Chúng ta sẽ xử lý filter và pagination ở phía client.
      const result = await paymentMethodService.getAll()

      if (result.success) {
        setPaymentMethods(result.data || [])
      } else {
        setError(result.message)
        setPaymentMethods([])
      }
    } catch (err) {
      setError('Không thể tải dữ liệu phương thức thanh toán.')
    } finally {
      setLoading(false)
    }
  }, []) // Dependency rỗng vì hàm này không phụ thuộc state nào

  // BƯỚC 4: GỌI HÀM loadPaymentMethods KHI COMPONENT MOUNT
  useEffect(() => {
    loadPaymentMethods()
  }, [loadPaymentMethods])

  // Xử lý filter và pagination phía client
  const filteredData = useMemo(() => {
    if (!appliedFilters) return paymentMethods

    return paymentMethods.filter(method => {
      const nameMatch = appliedFilters.name ? 
        method.name.toLowerCase().includes(appliedFilters.name.toLowerCase()) || 
        method.code.toLowerCase().includes(appliedFilters.name.toLowerCase()) : true
      
      const enabledMatch = appliedFilters.enabled ? 
        String(method.enabled) === appliedFilters.enabled : true
      
      return nameMatch && enabledMatch
    })
  }, [paymentMethods, appliedFilters])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredData.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredData, currentPage, itemsPerPage])
  
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    setAppliedFilters(searchInputs)
  }

  const handleClearSearch = () => {
    setCurrentPage(1)
    setSearchInputs({ name: '', enabled: '' })
    setAppliedFilters(null)
  }

  const formatDate = useCallback((dateString) => {
    if (!dateString) return { date: 'N/A', time: '' };
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  }, [])

  const showToast = useCallback((type, title, message = '') => {
    setToast({ show: true, type, title, message })
  }, [])

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }))
  }, [])

  // BƯỚC 5: CẬP NHẬT HÀM XÓA VỚI API THẬT
  const handleDeleteClick = (method) => {
    setItemToDelete(method)
    setShowDeleteModal(true)
  }
  const confirmDelete = async () => {
    if (!itemToDelete) return

    setIsDeleting(true)
    try {
      const result = await paymentMethodService.deleteMethod(itemToDelete.id)
      if (result.success) {
        showToast('success', 'Thành công', `Đã xóa phương thức "${itemToDelete.name}".`)
        loadPaymentMethods()
      } else {
        showToast('error', 'Lỗi', result.message)
      }
    } catch (error) {
      showToast('error', 'Lỗi', 'Có lỗi xảy ra khi xóa.')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
      setItemToDelete(null)
    }
  }
  const getStatusBadgeClass = (status) => {
    return status ? 'bg-success-subtle text-success-emphasis' : 'bg-secondary-subtle text-secondary-emphasis';
  }

  const getStatusLabel = (status) => {
    return status ? 'Đang bật' : 'Đã tắt';
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    )
  }

  // Giao diện JSX giữ nguyên, chỉ cần thay đổi nguồn dữ liệu map
  return (
    <div className="w-100">
      <div className="d-flex justify-content-between align-items-center mb-4 px-3">
        <div>
          <h2 className="mb-0">Quản lý phương thức thanh toán</h2>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/payment-methods/add')}>
            <i className="bi bi-plus-circle me-2"></i>
            Thêm mới
        </button>
      </div>

      <div className="w-100 px-3 mb-4">
        {/* ... Search Form giữ nguyên ... */}
        <div className="card search-form-container">
          <div className="card-body">
            <form onSubmit={handleSearchSubmit}>
              <div className="row g-3">
                <div className="col-md-5">
                  <label htmlFor="name" className="form-label">Tên phương thức</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={searchInputs.name}
                    onChange={(e) => setSearchInputs(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Tìm theo tên hoặc code..."
                  />
                </div>
                <div className="col-md-5">
                  <label htmlFor="enabled" className="form-label">Trạng thái</label>
                  <select
                    className="form-select"
                    id="enabled"
                    value={searchInputs.enabled}
                    onChange={(e) => setSearchInputs(prev => ({ ...prev, enabled: e.target.value }))}
                  >
                    {enabledOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2 d-flex align-items-end gap-2">
                  <button type="submit" className="btn btn-primary search-btn-large w-100">
                    <i className="bi bi-search me-1"></i>
                    Tìm
                  </button>
                  <button type="button" className="btn btn-outline-secondary search-btn-large w-100" onClick={handleClearSearch}>
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Reset
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="w-100">
        {paginatedData.length === 0 && !loading ? (
          <div className="text-center py-5">
            <i className="bi bi-credit-card-2-front-fill fs-1 text-muted mb-3 d-block"></i>
            <h4 className="text-muted">Không có phương thức thanh toán</h4>
            {appliedFilters 
             ? <p className="text-muted">Không tìm thấy kết quả phù hợp.</p>
             : <p className="text-muted">Hãy bắt đầu bằng cách thêm một phương thức thanh toán mới.</p>
            }
          </div>
        ) : (
          <div className="payment-method-table-wrapper">
            <div className="table-responsive w-100">
              <table className="table align-middle main-table w-100">
                <thead className="table-primary">
                <tr>
                    <th scope="col" className="text-center" style={{ width: '60px' }}>STT</th>
                    <th scope="col" style={{ width: '120px' }}>Ảnh</th>
                    <th scope="col" style={{ minWidth: '150px' }}>Code</th>
                    <th scope="col" style={{ minWidth: '200px' }}>Tên phương thức</th>
                    <th scope="col" style={{ minWidth: '150px' }}>Loại</th>
                    <th scope="col" className="text-center" style={{ width: '120px' }}>Trạng thái</th>
                    <th scope="col" className="text-center" style={{ width: '140px' }}>Ngày tạo</th>
                    <th scope="col" className="text-center" style={{ width: '100px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {/* BƯỚC 6: SỬ DỤNG DỮ LIỆU ĐÃ PHÂN TRANG */}
                  {paginatedData.map((method, index) => {
                    const createdDate = formatDate(method.createdAt)
                    const itemIndex = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <tr key={method.id || index} className="data-row">
                        <td className="text-center"><span className="fw-bold">{itemIndex}</span></td>
                        <td>
                          <img src={method.imageUrl || 'https://via.placeholder.com/80x40?text=No+Image'} alt={method.name} className="payment-method-image" />
                        </td>
                        <td><code className="fw-bold">{method.code}</code></td>
                        <td><span className="fw-medium">{method.name}</span></td>
                        <td>{method.type}</td>
                        <td className="text-center">
                          <span className={`badge ${getStatusBadgeClass(method.enabled)}`}>
                            {getStatusLabel(method.enabled)}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="date-container">
                            <span className="date-value fw-medium">{createdDate.date}</span>
                            <small className="d-block text-muted">{createdDate.time}</small>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="action-buttons-inline">
                            <button 
                              className="btn btn-outline-warning btn-sm action-btn" 
                              title="Chỉnh sửa"
                              onClick={() => navigate(`/payment-methods/edit/${method.id}`)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                              className="btn btn-outline-danger btn-sm action-btn" 
                              title="Xóa"
                              onClick={() => handleDeleteClick(method)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            
            {/* TODO: Thêm Pagination component ở đây nếu cần */}

          </div>
        )}
      </div>

      <Toast 
        show={toast.show} 
        onHide={hideToast} 
        type={toast.type} 
        title={toast.title} 
        message={toast.message} 
      />
       <DeleteConfirmationModal 
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        itemName={itemToDelete?.name}
        type="payment-method"
        loading={isDeleting}
      />
    </div>
  )
}

export default PaymentMethodManagement