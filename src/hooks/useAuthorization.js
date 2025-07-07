import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { decodeJWT } from '@/utils/auth';

/**
 * Custom Hook để kiểm tra quyền truy cập của người dùng.
 * @param {string[]} requiredRoles - Mảng các quyền yêu cầu để truy cập.
 * @returns {string} Trạng thái ủy quyền: 'checking', 'authorized', 'unauthorized'.
 */
const useAuthorization = (requiredRoles = []) => {
  const navigate = useNavigate();
  const [permissionStatus, setPermissionStatus] = useState('checking');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      setPermissionStatus('unauthorized');
      return;
    }

    const decoded = decodeJWT(token);
    let userRoles = [];
    if (decoded) {
      // Chuẩn hóa việc lấy roles từ các trường khác nhau trong token
      if (Array.isArray(decoded.authorities)) userRoles = decoded.authorities;
      else if (Array.isArray(decoded.roles)) userRoles = decoded.roles;
      else if (typeof decoded.authorities === 'string') userRoles = [decoded.authorities];
      else if (typeof decoded.roles === 'string') userRoles = [decoded.roles];
      else if (decoded.role) userRoles = [decoded.role];
    }
    
    // Kiểm tra xem người dùng có ít nhất một trong các quyền yêu cầu không
    const hasPermission = requiredRoles.some(requiredRole => 
        userRoles.some(userRole => userRole === requiredRole || userRole === `ROLE_${requiredRole}`)
    );
    
    if (hasPermission) {
      setPermissionStatus('authorized');
    } else {
      setPermissionStatus('unauthorized');
    }
  }, [requiredRoles]); // Hook sẽ chạy lại nếu requiredRoles thay đổi

  useEffect(() => {
    if (permissionStatus === 'unauthorized') {
      navigate('/access-denied', { replace: true });
    }
  }, [permissionStatus, navigate]);

  return permissionStatus;
};

export default useAuthorization;