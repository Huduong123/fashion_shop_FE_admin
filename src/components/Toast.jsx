import { useEffect, useState, useRef, useCallback } from 'react'
import './Toast.css'

const Toast = ({ 
  show, 
  onHide, 
  type = 'success', // 'success', 'error', 'warning', 'info'
  title,
  message,
  duration = 3000 
}) => {
  const [isHiding, setIsHiding] = useState(false)
  const onHideRef = useRef(onHide)
  
  // Luôn cập nhật ref với callback onHide mới nhất từ props
  // để tránh stale closure mà không cần đưa onHide vào dependency array của effect chính.
  useEffect(() => {
    onHideRef.current = onHide
  }, [onHide])

  // Sử dụng useCallback để đóng gói logic đóng toast.
  // Điều này giúp tách biệt và tái sử dụng logic.
  const handleClose = useCallback(() => {
    // Nếu đang trong tiến trình ẩn thì không làm gì cả
    if (isHiding) return;

    setIsHiding(true)
    // Đợi animation kết thúc (300ms) rồi mới gọi onHide từ component cha
    const hideTimer = setTimeout(() => {
      onHideRef.current()
    }, 300) // Thời gian này phải khớp với animation duration trong CSS

    // Không cần cleanup timer này vì nó chỉ chạy một lần và có thời gian rất ngắn.
  }, [isHiding]);

  // Effect chính để xử lý việc tự động ẩn toast
  useEffect(() => {
    if (show) {
      // Reset trạng thái `isHiding` mỗi khi toast được hiển thị lại
      setIsHiding(false);
      
      const autoHideTimer = setTimeout(() => {
        handleClose()
      }, duration)
      
      // Quan trọng: Cleanup function để xóa timer nếu component unmount
      // hoặc `show`, `duration` thay đổi trước khi timer chạy xong.
      return () => clearTimeout(autoHideTimer)
    }
  }, [show, duration, handleClose])

  // Chỉ render khi `show` là true hoặc đang trong tiến trình ẩn (để chạy animation)
  if (!show && !isHiding) return null

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          bgClass: 'bg-success',
          iconClass: 'bi-check-circle-fill',
          textClass: 'text-white'
        }
      case 'error':
        return {
          bgClass: 'bg-danger',
          iconClass: 'bi-x-circle-fill',
          textClass: 'text-white'
        }
      case 'warning':
        return {
          bgClass: 'bg-warning',
          iconClass: 'bi-exclamation-triangle-fill',
          textClass: 'text-dark'
        }
      case 'info':
        return {
          bgClass: 'bg-info',
          iconClass: 'bi-info-circle-fill',
          textClass: 'text-white'
        }
      default:
        return {
          bgClass: 'bg-success',
          iconClass: 'bi-check-circle-fill',
          textClass: 'text-white'
        }
    }
  }

  const config = getToastConfig()

  return (
    <div className="toast-container">
      <div 
        className={`toast show toast-custom ${config.bgClass} ${config.textClass} ${isHiding ? 'hiding' : ''}`}
        role="alert"
      >
        <div className="toast-header">
          <i className={`bi ${config.iconClass} me-2`}></i>
          <strong className="me-auto">{title}</strong>
          <button 
            type="button" 
            className={`btn-close ${config.textClass === 'text-dark' ? '' : 'btn-close-white'}`}
            onClick={handleClose}
          ></button>
        </div>
        {message && (
          <div className="toast-body">
            {message}
          </div>
        )}
        
        {/* Progress bar để hiển thị thời gian còn lại */}
        {!isHiding && show && (
          <div 
            className="toast-progress-bar animating"
            style={{
              animationDuration: `${duration}ms`
            }}
          ></div>
        )}
      </div>
    </div>
  )
}

export default Toast