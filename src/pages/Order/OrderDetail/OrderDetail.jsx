// OrderDetail.jsx

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import orderService from '@/services/orderService'
import Toast from '@/components/Toast'
import './OrderDetail.css'

const OrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState({ show: false, type: 'success', title: '', message: '' })
  
  const [isUpdating, setIsUpdating] = useState(false)

  // Định nghĩa các trạng thái cho OrderStatus
  const orderStatusOptions = [
    { value: 'PENDING', label: 'Chờ xử lý', className: 'status-pending' },
    { value: 'CONFIRMED', label: 'Đã xác nhận', className: 'status-confirmed' },
    { value: 'SHIPPED', label: 'Đang giao hàng', className: 'status-shipped' },
    { value: 'DELIVERED', label: 'Đã giao', className: 'status-delivered' },
    { value: 'COMPLETED', label: 'Hoàn thành', className: 'status-completed' },
    { value: 'CANCELLED', label: 'Đã hủy', className: 'status-cancelled' }
  ]

  // Định nghĩa các trạng thái cho PaymentStatus
  const paymentStatusOptions = [
    { value: 'UNPAID', label: 'Chưa thanh toán', className: 'payment-unpaid' },
    { value: 'PAID', label: 'Đã thanh toán', className: 'payment-paid' },
    { value: 'FAILED', label: 'Thanh toán thất bại', className: 'payment-failed' },
    { value: 'REFUNDED', label: 'Đã hoàn tiền', className: 'payment-refunded' }
  ]

  useEffect(() => {
    const loadOrderDetail = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await orderService.getOrderById(id)
        if (result.success) {
          setOrder(result.data)
        } else {
          setError(result.message)
          showToast('error', 'Lỗi', result.message || 'Không thể tải chi tiết đơn hàng.')
        }
      } catch (err) {
        setError('Failed to load order details')
        showToast('error', 'Lỗi', 'Có lỗi xảy ra khi tải dữ liệu.')
      } finally {
        setLoading(false)
      }
    }
    loadOrderDetail()
  }, [id])
  
  // Hàm xử lý chung để cập nhật trạng thái
  const handleUpdateStatus = async (newStatus, successMessage) => {
    setIsUpdating(true)
    try {
      const result = await orderService.updateOrderStatus(id, newStatus)
      if (result.success) {
        setOrder(prevOrder => ({ ...prevOrder, status: newStatus }))
        showToast('success', 'Thành công', successMessage)
      } else {
        showToast('error', 'Lỗi', result.message || 'Cập nhật trạng thái thất bại.')
      }
    } catch (error) {
      showToast('error', 'Lỗi', 'Có lỗi xảy ra khi kết nối tới máy chủ.')
    } finally {
      setIsUpdating(false)
    }
  }

  // Hàm cụ thể cho từng hành động
  const handleAcceptOrder = () => {
    handleUpdateStatus('SHIPPED', 'Đã nhận đơn và chuyển sang trạng thái giao hàng.')
  }

  const handleMarkAsDelivered = () => {
    handleUpdateStatus('DELIVERED', 'Đơn hàng đã được cập nhật trạng thái đã giao.')
  }

  const showToast = (type, title, message = '') => {
    setToast({ show: true, type, title, message })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }))
  }

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

  const getOrderStatusInfo = (status) => {
    return orderStatusOptions.find(opt => opt.value === status) || { label: status, className: 'status-default' }
  }

  const getPaymentStatusInfo = (status) => {
    return paymentStatusOptions.find(opt => opt.value === status) || { label: status, className: 'payment-default' }
  }

  const handlePrint = () => {
    window.print()
  }

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

  const orderStatusInfo = getOrderStatusInfo(order.status)
  const paymentStatusInfo = getPaymentStatusInfo(order.paymentStatus)

  return (
    <div className="order-detail-page">
      {/* Header trang */}
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
          {/* Nút Nhận đơn */}
          {order.status === 'PENDING' && (
            <button 
              className="btn btn-success ms-2" 
              onClick={handleAcceptOrder} 
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Nhận đơn
                </>
              )}
            </button>
          )}

          {/* == THÊM NÚT "ĐÃ GIAO" VỚI ĐIỀU KIỆN HIỂN THỊ == */}
          {order.status === 'SHIPPED' && (
            <button 
              className="btn btn-info ms-2" 
              onClick={handleMarkAsDelivered} 
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <i className="bi bi-truck me-2"></i>
                  Đã giao
                </>
              )}
            </button>
          )}

          <button className="btn btn-primary" onClick={handlePrint}>
            <i className="bi bi-printer me-2"></i>In hóa đơn
          </button>
        </div>
      </header>

      {/* Thẻ hóa đơn */}
      <main className="invoice-card">
        {/* Header hóa đơn */}
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
            <p>
              <strong>Thanh toán:</strong>
              <span className={`badge-payment ${paymentStatusInfo.className}`}>
                {paymentStatusInfo.label}
              </span>
            </p>
          </div>
        </section>

        {/* Trạng thái đơn hàng */}
        <section className="status-section">
          <label className="status-label">Trạng thái đơn hàng:</label>
          <div className="status-control">
            <span className={`badge-status ${orderStatusInfo.className}`}>{orderStatusInfo.label}</span>
          </div>
        </section>

        {/* Bảng sản phẩm */}
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

        {/* Footer hóa đơn / Tổng kết */}
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