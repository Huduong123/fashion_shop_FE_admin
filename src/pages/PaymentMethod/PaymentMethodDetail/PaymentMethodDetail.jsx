// src/pages/admin/payment-method/PaymentMethodDetail.jsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import paymentMethodService from '@/services/paymentMethodService';
import './PaymentMethodDetail.css'; // File CSS mới

const PaymentMethodDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await paymentMethodService.getById(id);
    if (result.success) {
      setPaymentMethod(result.data);
    } else {
      setError(result.message || `Không tìm thấy phương thức thanh toán với ID: ${id}`);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    return status ? 'bg-success-subtle text-success-emphasis' : 'bg-secondary-subtle text-secondary-emphasis';
  };

  const getStatusLabel = (status) => {
    return status ? 'Đang hoạt động' : 'Đã tắt';
  };

  const handleBack = () => navigate('/payment-methods');

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger" role="alert">{error}</div>
      </div>
    );
  }

  if (!paymentMethod) return null;

  return (
    <div className="payment-method-detail-page">
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
                Chi tiết
              </li>
            </ol>
          </nav>
          <h1 className="page-title">Chi tiết: {paymentMethod.name}</h1>
        </div>
        <button type="button" className="btn btn-outline-secondary" onClick={handleBack}>
          <i className="bi bi-arrow-left me-2"></i> Quay lại
        </button>
      </header>

      <div className="row">
        <div className="col-lg-8">
          <div className="card detail-card">
            <div className="card-header">
              <h5 className="card-title mb-0"><i className="bi bi-info-circle-fill me-2"></i>Thông tin chung</h5>
            </div>
            <div className="card-body">
              <dl className="detail-list">
                <div className="detail-item">
                  <dt>ID</dt>
                  <dd>#{paymentMethod.id}</dd>
                </div>
                <div className="detail-item">
                  <dt>Mã (Code)</dt>
                  <dd><code>{paymentMethod.code}</code></dd>
                </div>
                <div className="detail-item">
                  <dt>Tên phương thức</dt>
                  <dd>{paymentMethod.name}</dd>
                </div>
                <div className="detail-item">
                  <dt>Mô tả</dt>
                  <dd>{paymentMethod.description}</dd>
                </div>
                <div className="detail-item">
                  <dt>Loại</dt>
                  <dd>{paymentMethod.type === 'ONLINE_REDIRECT' ? 'Online (Chuyển hướng)' : 'Offline'}</dd>
                </div>
                <div className="detail-item">
                  <dt>Trạng thái</dt>
                  <dd>
                    <span className={`badge ${getStatusBadgeClass(paymentMethod.enabled)}`}>
                      {getStatusLabel(paymentMethod.enabled)}
                    </span>
                  </dd>
                </div>
                <div className="detail-item">
                  <dt>Ngày tạo</dt>
                  <dd>{formatDate(paymentMethod.createdAt)}</dd>
                </div>
                <div className="detail-item">
                  <dt>Cập nhật lần cuối</dt>
                  <dd>{formatDate(paymentMethod.updatedAt)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card detail-card">
            <div className="card-header">
                <h5 className="card-title mb-0"><i className="bi bi-image-fill me-2"></i>Ảnh đại diện</h5>
            </div>
            <div className="card-body text-center">
              <img 
                src={paymentMethod.imageUrl || 'https://via.placeholder.com/200x100?text=No+Image'} 
                alt={paymentMethod.name} 
                className="detail-image img-fluid"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodDetail;