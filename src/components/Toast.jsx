import { useEffect, useState } from 'react'
import './Toast.css'

const Toast = ({ 
  show, 
  onHide, 
  type = 'success', // 'success', 'error', 'warning', 'info'
  title,
  message,
  duration = 5000 
}) => {
  const [isHiding, setIsHiding] = useState(false)

  useEffect(() => {
    if (show) {
      setIsHiding(false)
      const timer = setTimeout(() => {
        setIsHiding(true)
        // Wait for animation to complete before calling onHide
        setTimeout(() => {
          onHide()
        }, 300)
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [show, duration, onHide])

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

  const handleClose = () => {
    setIsHiding(true)
    setTimeout(() => {
      onHide()
    }, 300)
  }

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
        {!isHiding && (
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