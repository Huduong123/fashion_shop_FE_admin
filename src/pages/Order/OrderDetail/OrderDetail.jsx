import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import orderService from '@/services/orderService'
import Toast from '@/components/Toast'
import './OrderDetail.css' // We will use the new CSS

const OrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState({ show: false, type: 'success', title: '', message: '' })

  const statusOptions = [
    { value: 'PENDING', label: 'Chờ xử lý', className: 'status-pending' },
    { value: 'PAID', label: 'Đã thanh toán', className: 'status-paid' },
    { value: 'SHIPPED', label: 'Đã gửi', className: 'status-shipped' },
    { value: 'CANCELLED', label: 'Đã hủy', className: 'status-cancelled' }
  ]
  
  // --- Data Fetching and Handlers (kept from original) ---
  useEffect(() => {
    loadOrderDetail()
  }, [id])

  const loadOrderDetail = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await orderService.getOrderById(id)
      if (result.success) {
        setOrder(result.data)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    try {
      const result = await orderService.updateOrderStatus(id, newStatus)
      if (result.success) {
        showToast('success', 'Thành công', 'Cập nhật trạng thái đơn hàng thành công')
        setOrder(prev => ({ ...prev, status: newStatus }))
      } else {
        showToast('error', 'Lỗi', result.message)
      }
    } catch (error) {
      showToast('error', 'Lỗi', 'Có lỗi xảy ra khi cập nhật trạng thái')
    }
  }

  const showToast = (type, title, message = '') => {
    setToast({ show: true, type, title, message })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }))
  }

  // --- Utility Functions (kept from original) ---
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', {
      hour: '2-digit', minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0)
  }

  const getStatusInfo = (status) => {
    return statusOptions.find(opt => opt.value === status) || { label: status, className: 'status-default' }
  }

  const isStatusEditable = (status) => {
    return status !== 'PAID' && status !== 'CANCELLED'
  }

  const handlePrint = () => {
    window.print()
  }

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          <strong>Lỗi!</strong> {error || 'Không tìm thấy đơn hàng.'}
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/orders')}>
          <i className="bi bi-arrow-left me-2"></i>Quay lại
        </button>
      </div>
    )
  }

  const statusInfo = getStatusInfo(order.status)

  return (
    <div className="order-detail-page">
      {/* Page Header */}
      <header className="page-header">
        <div className="header-left">
          <button className="btn btn-light me-3" onClick={() => navigate('/orders')}>
            <i className="bi bi-arrow-left"></i>
          </button>
          <div>
            <h2 className="page-title">Chi tiết đơn hàng</h2>
            <p className="page-subtitle">Mã đơn hàng: #{order.id}</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handlePrint}>
            <i className="bi bi-printer me-2"></i>In hóa đơn
          </button>
        </div>
      </header>

      {/* Invoice Card */}
      <main className="invoice-card">
        {/* Invoice Header */}
        <section className="invoice-header">
          <div className="info-group">
            <h5 className="info-title">Thông tin khách hàng</h5>
            <p><strong>Tên:</strong> {order.userFullname || order.username}</p>
            <p><strong>Email:</strong> {order.userEmail}</p>
            <p><strong>Điện thoại:</strong> {order.userPhone || 'Chưa cập nhật'}</p>
          </div>
          <div className="info-group text-end">
            <h5 className="info-title">Thông tin đơn hàng</h5>
            <p><strong>Ngày tạo:</strong> {formatDate(order.createdAt)}</p>
            <p><strong>Cập nhật:</strong> {formatDate(order.updatedAt)}</p>
            <p><strong>Thanh toán:</strong> <span className="badge-payment-paid">ĐÃ THANH TOÁN</span></p>
          </div>
        </section>

        {/* Order Status */}
        <section className="status-section">
            <label htmlFor="status-select" className="status-label">Trạng thái đơn hàng:</label>
            <div className="status-control">
                <span className={`badge-status ${statusInfo.className}`}>{statusInfo.label}</span>
                {isStatusEditable(order.status) ? (
                  <select
                      id="status-select"
                      className="form-select status-select"
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(e.target.value)}
                  >
                      {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                              {option.label}
                          </option>
                      ))}
                  </select>
                ) : (
                  <div className="status-readonly">
                    <i className="bi bi-lock-fill me-2"></i>
                    <span className="text-muted">Không thể thay đổi trạng thái</span>
                  </div>
                )}
            </div>
        </section>


        {/* Order Items Table */}
        <section className="invoice-body">
          <h5 className="info-title">Chi tiết sản phẩm</h5>
          <div className="table-responsive">
            <table className="table order-items-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th className="text-center">Số lượng</th>
                  <th className="text-end">Đơn giá</th>
                  <th className="text-end">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.orderItems && order.orderItems.length > 0 ? (
                  order.orderItems.map(item => (
                    <tr key={item.productVariantId}>
                      <td>
                        <div className="product-cell">
                          <img src={item.imageUrl || 'https://via.placeholder.com/60'} alt={item.productName} className="product-image" />
                          <div className="product-details">
                            <p className="product-name">{item.productName}</p>
                            <p className="product-variant">
                              Màu: {item.colorName} / Size: {item.sizeName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-end">{formatCurrency(item.price)}</td>
                      <td className="text-end fw-bold">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4">Không có sản phẩm trong đơn hàng.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Invoice Footer / Summary */}
        <section className="invoice-footer">
          <div className="summary-section">
            <div className="summary-item">
              <span>Tổng số sản phẩm</span>
              <span>{order.totalItems}</span>
            </div>
            <div className="summary-item">
              <span>Phí vận chuyển</span>
              <span>{formatCurrency(0)}</span> {/* Placeholder */}
            </div>
            <div className="summary-item total">
              <strong>Tổng thanh toán</strong>
              <strong className="total-amount">{formatCurrency(order.totalPrice)}</strong>
            </div>
          </div>
        </section>
      </main>

      {/* Toast Component */}
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

export default OrderDetail