import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import orderService from '@/services/orderService'
import Toast from '@/components/Toast'
import './Order.css'

const OrderManagement = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [ordersPerPage, setOrdersPerPage] = useState(10)
  
  // State cho các input trên form, người dùng có thể gõ tự do
  const [searchInputs, setSearchInputs] = useState({
    username: '',
    status: '',
    startDate: '',
    endDate: ''
  })

  // State cho các filter đã được áp dụng sau khi nhấn nút "Tìm kiếm"
  const [appliedFilters, setAppliedFilters] = useState(null)
  
  const [toast, setToast] = useState({ show: false, type: 'success', title: '', message: '' })
  
  const [paginationInfo, setPaginationInfo] = useState({ 
    totalElements: 0, 
    totalPages: 0, 
    size: 10, 
    number: 0, 
    first: true, 
    last: true 
  })

  // Order status options
  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'PENDING', label: 'Chờ xử lý' },
    { value: 'PAID', label: 'Đã thanh toán' },
    { value: 'SHIPPED', label: 'Đã gửi' },
    { value: 'CANCELLED', label: 'Đã hủy' }
  ]

  // Load orders function
  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = {
        page: currentPage - 1, // Backend sử dụng 0-based indexing
        size: ordersPerPage,
        sort: 'createdAt,desc'
      }

      // Chỉ thêm filter khi có appliedFilters
      if (appliedFilters) {
        Object.entries(appliedFilters).forEach(([key, value]) => {
          if (value !== '') {
            params[key] = value
          }
        })
      }

      const result = await orderService.getAllOrders(params)
      if (result.success) {
        const responseData = result.data
        setOrders(responseData.content || [])
        setPaginationInfo({
          totalElements: responseData.totalElements || 0,
          totalPages: responseData.totalPages || 0,
          size: responseData.size || ordersPerPage,
          number: responseData.number || 0,
          first: responseData.first || true,
          last: responseData.last || true,
        })
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [currentPage, ordersPerPage, appliedFilters])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  // Khi nhấn nút "Tìm kiếm"
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setCurrentPage(1) // Reset về trang 1 khi tìm kiếm mới
    setAppliedFilters(searchInputs) // Áp dụng filter từ input
  }

  // Khi nhấn nút "Reset"
  const handleClearSearch = () => {
    setCurrentPage(1)
    setSearchInputs({ username: '', status: '', startDate: '', endDate: '' })
    setAppliedFilters(null) // Xóa filter đã áp dụng
  }

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }, [])

  const showToast = useCallback((type, title, message = '') => {
    setToast({
      show: true,
      type,
      title,
      message
    })
  }, [])

  const hideToast = useCallback(() => {
    setToast(prev => ({
      ...prev,
      show: false
    }))
  }, [])

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const result = await orderService.updateOrderStatus(orderId, newStatus)
      if (result.success) {
        showToast('success', 'Thành công', 'Cập nhật trạng thái đơn hàng thành công')
        loadOrders() // Refresh the list
      } else {
        showToast('error', 'Lỗi', result.message)
      }
    } catch (error) {
      showToast('error', 'Lỗi', 'Có lỗi xảy ra khi cập nhật trạng thái')
    }
  }

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      try {
        const result = await orderService.deleteOrder(orderId)
        if (result.success) {
          showToast('success', 'Thành công', 'Đã xóa đơn hàng')
          loadOrders() // Refresh the list
        } else {
          showToast('error', 'Lỗi', result.message)
        }
      } catch (error) {
        showToast('error', 'Lỗi', 'Có lỗi xảy ra khi xóa đơn hàng')
      }
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-warning-subtle text-warning-emphasis'
      case 'PAID': return 'bg-success-subtle text-success-emphasis'
      case 'SHIPPED': return 'bg-primary text-white'
      case 'CANCELLED': return 'bg-danger-subtle text-danger-emphasis'
      default: return 'bg-secondary text-white'
    }
  }

  const getStatusLabel = (status) => {
    const option = statusOptions.find(opt => opt.value === status)
    return option ? option.label : status
  }

  const isStatusEditable = (status) => {
    return status !== 'PAID' && status !== 'CANCELLED'
  }

  const paginationData = useMemo(() => {
    return {
      indexOfFirstOrder: paginationInfo.number * paginationInfo.size,
      indexOfLastOrder: Math.min((paginationInfo.number * paginationInfo.size) + paginationInfo.size, paginationInfo.totalElements),
      currentOrders: orders,
      totalPages: paginationInfo.totalPages,
      totalElements: paginationInfo.totalElements
    }
  }, [orders, paginationInfo])

  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber)
  }, [])

  const handleOrdersPerPageChange = useCallback((newPerPage) => {
    setOrdersPerPage(newPerPage)
    setCurrentPage(1)
  }, [])

  const getPaginationItems = useMemo(() => {
    if (!paginationData) return []
    const items = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(paginationData.totalPages, startPage + maxVisiblePages - 1)
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }
    for (let i = startPage; i <= endPage; i++) {
      items.push(i)
    }
    return items
  }, [currentPage, paginationData])

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

  return (
    <div className="w-100">
      <div className="d-flex justify-content-between align-items-center mb-4 px-3">
        <div>
          <h2 className="mb-0">Quản lý đơn hàng</h2>
          {appliedFilters && (
            <small className="text-muted">
              <i className="bi bi-search me-1"></i>
              Kết quả tìm kiếm: {paginationInfo.totalElements} đơn hàng
            </small>
          )}
        </div>
      </div>

      {/* Search Form */}
      <div className="w-100 px-3 mb-4">
        <div className="card search-form-container">
          <div className="card-body">
            <form onSubmit={handleSearchSubmit}>
              <div className="row g-3">
                <div className="col-md-3">
                  <label htmlFor="username" className="form-label">Tên khách hàng</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    value={searchInputs.username}
                    onChange={(e) => setSearchInputs(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Tìm theo tên khách hàng..."
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="status" className="form-label">Trạng thái</label>
                  <select
                    className="form-select"
                    id="status"
                    value={searchInputs.status}
                    onChange={(e) => setSearchInputs(prev => ({ ...prev, status: e.target.value }))}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label htmlFor="startDate" className="form-label">Từ ngày</label>
                  <input
                    type="date"
                    className="form-control"
                    id="startDate"
                    value={searchInputs.startDate}
                    onChange={(e) => setSearchInputs(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="col-md-2">
                  <label htmlFor="endDate" className="form-label">Đến ngày</label>
                  <input
                    type="date"
                    className="form-control"
                    id="endDate"
                    value={searchInputs.endDate}
                    onChange={(e) => setSearchInputs(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end gap-2">
                  <button type="submit" className="btn btn-primary search-btn-large">
                    <i className="bi bi-search me-1"></i>
                    Tìm kiếm
                  </button>
                  <button type="button" className="btn btn-outline-secondary search-btn-large" onClick={handleClearSearch}>
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Reset
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="w-100">
        {orders.length === 0 && !loading ? (
          <div className="text-center py-5">
            <i className="bi bi-cart-x fs-1 text-muted mb-3 d-block"></i>
            <h4 className="text-muted">Không tìm thấy đơn hàng</h4>
            <p className="text-muted">
              Không có đơn hàng nào được tìm thấy với tiêu chí này.
            </p>
          </div>
        ) : (
          <div className="order-table-wrapper">
            <div className="table-responsive w-100">
              <table className="table align-middle orders-table w-100">
                <thead className="table-primary">
                  <tr>
                    <th scope="col" className="text-center" style={{ width: '60px' }}>STT</th>
                    <th scope="col" style={{ minWidth: '110px' }}><i className="bi bi-hash text-primary"></i> Mã ĐH</th>
                    <th scope="col" style={{ minWidth: '150px' }}><i className="bi bi-person text-primary"></i> Khách hàng</th>
                    <th scope="col" style={{ minWidth: '140px' }}><i className="bi bi-envelope text-primary"></i> Email</th>
                    <th scope="col" style={{ minWidth: '120px' }}><i className="bi bi-telephone text-primary"></i> Số ĐT</th>
                    <th scope="col" className="text-end" style={{ minWidth: '130px' }}><i className="bi bi-currency-dollar text-primary"></i> Tổng tiền</th>
                    <th scope="col" className="text-center" style={{ width: '80px' }}><i className="bi bi-box text-primary" style={{ fontSize: '0.875rem' }}></i> SL</th>
                    <th scope="col" className="text-center" style={{ width: '120px' }}><i className="bi bi-check-circle text-primary"></i> Trạng thái</th>
                    <th scope="col" className="text-center" style={{ width: '140px' }}><i className="bi bi-calendar-plus text-primary"></i> Ngày tạo</th>
                    <th scope="col" className="text-center" style={{ width: '130px' }}><i className="bi bi-gear text-primary"></i> Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => {
                    const createdDate = formatDate(order.createdAt)
                    
                    return (
                      <tr key={order.id} className="order-row">
                        <td className="text-center"><span className="fw-bold">{paginationData.indexOfFirstOrder + index + 1}</span></td>
                        <td>
                          <div className="order-info">
                            <h6 className="order-id mb-0">#{order.id}</h6>
                          </div>
                        </td>
                        <td>
                          <div className="customer-info">
                            <h6 className="customer-name mb-0">{order.userFullname || order.username}</h6>
                          </div>
                        </td>
                        <td>
                          <div className="customer-email">
                            <span className="email-value">{order.userEmail}</span>
                          </div>
                        </td>
                        <td>
                          <span className="phone-value">{order.userPhone || 'N/A'}</span>
                        </td>
                        <td className="text-end">
                          <span className="currency-value fw-bold">{formatCurrency(order.totalPrice)}</span>
                        </td>
                        <td className="text-center">
                          <span className="items-count">{order.totalItems}</span>
                        </td>
                        <td className="text-center">
                          {isStatusEditable(order.status) ? (
                            <select
                              className={`form-select form-select-sm status-badge ${getStatusBadgeClass(order.status)}`}
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                              style={{ minWidth: '110px', fontSize: '0.75rem', fontWeight: '600' }}
                            >
                              <option value="PENDING">Chờ xử lý</option>
                              <option value="PAID">Đã thanh toán</option>
                              <option value="SHIPPED">Đã gửi</option>
                              <option value="CANCELLED">Đã hủy</option>
                            </select>
                          ) : (
                            <span className={`badge ${getStatusBadgeClass(order.status)}`} style={{ fontSize: '0.75rem', fontWeight: '600' }}>
                              {getStatusLabel(order.status)}
                            </span>
                          )}
                        </td>
                        <td className="text-center">
                          <div className="date-container">
                            <span className="date-value fw-medium">{createdDate.date}</span>
                            <small className="d-block text-muted">{createdDate.time}</small>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="action-buttons">
                            <button 
                              className="btn btn-outline-info btn-sm action-btn" 
                              title="Xem chi tiết"
                              onClick={() => navigate(`/orders/${order.id}`)}
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button 
                              className="btn btn-outline-primary btn-sm action-btn" 
                              title="In hóa đơn"
                              onClick={() => {/* TODO: Print invoice */}}
                            >
                              <i className="bi bi-printer"></i>
                            </button>
                            <button 
                              className="btn btn-outline-warning btn-sm action-btn" 
                              title="Chỉnh sửa"
                              onClick={() => {/* TODO: Edit order */}}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                              className="btn btn-outline-danger btn-sm action-btn" 
                              title="Xóa"
                              onClick={() => handleDeleteOrder(order.id)}
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
            
            {/* Pagination */}
            {paginationData && paginationData.totalPages > 0 && (
              <div className="pagination-container">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="pagination-status">
                    <div className="text-muted">Hiển thị {paginationData.indexOfFirstOrder + 1} - {paginationData.indexOfLastOrder} của {paginationData.totalElements} đơn hàng</div>
                    <div className="d-flex align-items-center gap-2">
                      <label htmlFor="ordersPerPage" className="form-label mb-0 text-muted small">Hiển thị:</label>
                      <select 
                        id="ordersPerPage" 
                        className="form-select form-select-sm" 
                        style={{ width: 'auto' }} 
                        value={ordersPerPage} 
                        onChange={(e) => handleOrdersPerPageChange(parseInt(e.target.value))}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-muted small">mục/trang</span>
                    </div>
                  </div>
                  
                  <div className="pagination-controls">
                    <div className="pagination-info">Trang {currentPage} / {paginationData.totalPages}</div>
                    {paginationData.totalPages > 1 && (
                      <nav aria-label="Order pagination">
                        <ul className="pagination pagination-sm mb-0">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => handlePageChange(1)} 
                              disabled={currentPage === 1} 
                              title="Trang đầu"
                            >
                              <i className="bi bi-chevron-double-left"></i>
                            </button>
                          </li>
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => handlePageChange(currentPage - 1)} 
                              disabled={currentPage === 1} 
                              title="Trang trước"
                            >
                              <i className="bi bi-chevron-left"></i>
                            </button>
                          </li>
                          {getPaginationItems.map((page) => (
                            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                              <button 
                                className="page-link" 
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </button>
                            </li>
                          ))}
                          <li className={`page-item ${currentPage === paginationData.totalPages ? 'disabled' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => handlePageChange(currentPage + 1)} 
                              disabled={currentPage === paginationData.totalPages} 
                              title="Trang sau"
                            >
                              <i className="bi bi-chevron-right"></i>
                            </button>
                          </li>
                          <li className={`page-item ${currentPage === paginationData.totalPages ? 'disabled' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => handlePageChange(paginationData.totalPages)} 
                              disabled={currentPage === paginationData.totalPages} 
                              title="Trang cuối"
                            >
                              <i className="bi bi-chevron-double-right"></i>
                            </button>
                          </li>
                        </ul>
                      </nav>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      <Toast 
        show={toast.show} 
        onHide={hideToast} 
        type={toast.type} 
        title={toast.title} 
        message={toast.message} 
      />
    </div>
  )
}

export default OrderManagement
