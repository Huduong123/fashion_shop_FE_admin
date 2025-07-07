import React from 'react';
import useAuthorization from '@/hooks/useAuthorization';

/**
 * Higher-Order Component để bọc các trang yêu cầu quyền truy cập.
 * @param {React.Component} WrappedComponent - Component cần được bảo vệ.
 * @param {string[]} requiredRoles - Mảng các quyền yêu cầu.
 */
const withAuthorization = (WrappedComponent, requiredRoles) => {
  const AuthorizedComponent = (props) => {
    const permissionStatus = useAuthorization(requiredRoles);

    if (permissionStatus === 'checking') {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    if (permissionStatus === 'authorized') {
      return <WrappedComponent {...props} />;
    }

    // Nếu là 'unauthorized', hook đã xử lý chuyển trang, trả về null để không render gì cả.
    return null;
  };

  return AuthorizedComponent;
};

export default withAuthorization;