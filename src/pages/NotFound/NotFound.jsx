import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css'; // Chúng ta sẽ tạo file CSS này ngay sau đây

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Trang không tồn tại</h2>
        <p className="error-message">
          Rất tiếc, chúng tôi không thể tìm thấy trang bạn yêu cầu. Có vẻ như đường dẫn đã bị sai hoặc trang đã được di chuyển.
        </p>
        <div className="button-group">
          <button 
            className="btn btn-primary btn-lg" 
            onClick={() => navigate('/')}
          >
            <i className="bi bi-house-door-fill me-2"></i>
            Về trang chủ
          </button>
          <button 
            className="btn btn-outline-secondary btn-lg" 
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Quay lại trang trước
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;