import { useState } from 'react'

const DeleteConfirmationModal = ({ 
  show, 
  onHide, 
  onConfirm, 
  itemName, 
  type = 'product', // 'product' | 'category'
  loading = false 
}) => {
  if (!show) return null

  const getConfig = () => {
    switch (type) {
      case 'category':
        return {
          title: 'Xác nhận xóa danh mục',
          icon: 'bi-tag-fill',
          question: 'Bạn có chắc chắn muốn xóa danh mục này?',
          warning: 'Hành động này không thể hoàn tác. Tất cả sản phẩm thuộc danh mục này sẽ không còn danh mục.',
          buttonText: 'Xóa danh mục',
          buttonIcon: 'bi-tag',
          loadingText: 'Đang xóa...'
        }
      case 'product':
      default:
        return {
          title: 'Xác nhận xóa sản phẩm',
          icon: 'bi-trash3-fill',
          question: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
          warning: 'Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến sản phẩm sẽ bị xóa vĩnh viễn.',
          buttonText: 'Xóa sản phẩm',
          buttonIcon: 'bi-trash3',
          loadingText: 'Đang xóa...'
        }
    }
  }

  const config = getConfig()

  return (
    <>
      {/* Backdrop */}
      <div 
        className="modal-backdrop fade show" 
        onClick={onHide}
        style={{ zIndex: 1040 }}
      ></div>
      
      {/* Modal */}
      <div 
        className="modal fade show d-block" 
        style={{ zIndex: 1050 }}
        tabIndex="-1"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill text-danger me-2 fs-4"></i>
                {config.title}
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={onHide}
                disabled={loading}
              ></button>
            </div>
            
            <div className="modal-body py-4">
              <div className="text-center mb-4">
                <div className="bg-danger bg-opacity-10 rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" 
                     style={{ width: '80px', height: '80px' }}>
                  <i className={`bi ${config.icon} text-danger fs-1`}></i>
                </div>
                
                <h6 className="mb-3">{config.question}</h6>
                
                <div className="alert alert-warning bg-warning bg-opacity-10 border-warning border-opacity-50">
                  <strong className="text-danger">"{itemName}"</strong>
                </div>
                
                <p className="text-muted mb-0">
                  <i className="bi bi-info-circle me-1"></i>
                  {config.warning}
                </p>
              </div>
            </div>
            
            <div className="modal-footer border-0 pt-0">
              <button 
                type="button" 
                className="btn btn-outline-secondary me-2" 
                onClick={onHide}
                disabled={loading}
              >
                <i className="bi bi-x-circle me-1"></i>
                Hủy bỏ
              </button>
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </span>
                    {config.loadingText}
                  </>
                ) : (
                  <>
                    <i className={`bi ${config.buttonIcon} me-1`}></i>
                    {config.buttonText}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DeleteConfirmationModal 