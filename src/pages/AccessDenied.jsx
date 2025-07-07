import React from 'react'
import { useNavigate } from 'react-router-dom'

const AccessDenied = () => {
  const navigate = useNavigate()
  return (
    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div style={{ fontSize: 80, color: '#e53e3e' }}>
        <i className="bi bi-shield-lock"></i>
      </div>
      <h2 className="mt-3 mb-2 text-danger">Access Denied</h2>
      <p className="mb-4 text-muted">Bạn không có quyền truy cập vào trang này.</p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>Về trang chủ</button>
    </div>
  )
}

export default AccessDenied 