import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import categoryService from '@/services/categoryService'
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal'
import Toast from '@/components/Toast'
import './Category.css'

const CategoryManagement = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [categoriesPerPage, setCategoriesPerPage] = useState(10)
  
  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  
  // Toast states
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await categoryService.getAllCategories()
      
      if (result.success) {
        setCategories(result.data || [])
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError('Failed to load categories')
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Toast functions
  const showToast = useCallback((type, title, message = '') => {
    setToast({
      show: true,
      type,
      title,
      message
    })
  }, [])

  const hideToast = useCallback(() => {
    setToast(prev => ({
      ...prev,
      show: false
    }))
  }, [])

  // Delete functions
  const handleDeleteClick = useCallback((category) => {
    setCategoryToDelete(category)
    setShowDeleteModal(true)
  }, [])

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteModal(false)
    setCategoryToDelete(null)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!categoryToDelete) return

    setDeleting(true)
    try {
      const result = await categoryService.deleteCategory(categoryToDelete.id)
      
      if (result.success) {
        // Remove category from state immediately for better UX
        setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id))
        
        // Show success toast
        showToast('success', 'Thành công', `Đã xóa danh mục "${categoryToDelete.name}"`)
        
        // Hide modal
        setShowDeleteModal(false)
        setCategoryToDelete(null)
        
        // Reload to get updated data
        loadCategories()
      } else {
        showToast('error', 'Lỗi', result.message || 'Không thể xóa danh mục')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      showToast('error', 'Lỗi', 'Có lỗi xảy ra khi xóa danh mục')
    } finally {
      setDeleting(false)
    }
  }, [categoryToDelete, showToast, loadCategories])

  // Pagination logic
  const paginationData = useMemo(() => {
    const indexOfLastCategory = currentPage * categoriesPerPage
    const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage
    const currentCategories = categories.slice(indexOfFirstCategory, indexOfLastCategory)
    const totalPages = Math.ceil(categories.length / categoriesPerPage)

    return {
      indexOfFirstCategory,
      indexOfLastCategory: Math.min(indexOfLastCategory, categories.length),
      currentCategories,
      totalPages,
      totalElements: categories.length
    }
  }, [categories, currentPage, categoriesPerPage])

  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber)
  }, [])

  const handleCategoriesPerPageChange = useCallback((newPerPage) => {
    setCategoriesPerPage(newPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }, [])

  const getPaginationItems = useMemo(() => {
    if (!paginationData) return []
    
    const items = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(paginationData.totalPages, startPage + maxVisiblePages - 1)
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(i)
    }
    
    return items
  }, [currentPage, paginationData])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="w-100">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 px-3">
        <div>
          <h2 className="mb-0">
            <i className="bi bi-tags me-2 text-primary"></i>
            Quản lý Danh mục
          </h2>
          <small className="text-muted">
            Tổng số: {categories.length} danh mục
          </small>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/categories/add')}>
          <i className="bi bi-plus-lg me-2"></i>
          Thêm Danh mục
        </button>
      </div>

      {/* Categories Table */}
      <div className="category-table-wrapper">
        {categories.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-tags fs-1 text-muted mb-3 d-block"></i>
            <h4 className="text-muted">Chưa có danh mục nào</h4>
            <p className="text-muted">
              Tạo danh mục đầu tiên để bắt đầu quản lý sản phẩm.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/categories/add')}>
              <i className="bi bi-plus-lg me-2"></i>
              Tạo Danh mục đầu tiên
            </button>
          </div>
        ) : (
          <>
            <div className="table-responsive w-100">
              <table className="table align-middle categories-table w-100">
                <thead className="table-primary">
                  <tr>
                    <th scope="col" className="text-center" style={{ width: '60px' }}>
                      STT
                    </th>
                    <th scope="col" style={{ minWidth: '200px' }}>
                      <i className="bi bi-tag text-primary"></i> Tên danh mục
                    </th>
                    <th scope="col" style={{ minWidth: '300px' }}>
                      <i className="bi bi-file-text text-primary"></i> Mô tả
                    </th>
                    <th scope="col" className="text-center" style={{ width: '130px' }}>
                      <i className="bi bi-calendar-plus text-primary"></i> Ngày tạo
                    </th>
                    <th scope="col" className="text-center" style={{ width: '130px' }}>
                      <i className="bi bi-arrow-clockwise text-primary"></i> Cập nhật
                    </th>
                    <th scope="col" className="text-center" style={{ width: '160px' }}>
                      <i className="bi bi-gear text-primary"></i> Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginationData.currentCategories.map((category, index) => (
                    <tr key={category.id} className="category-row">
                      <td className="text-center">
                        <span className="fw-bold">
                          {paginationData.indexOfFirstCategory + index + 1}
                        </span>
                      </td>
                      <td>
                        <div className="category-info">
                          <h6 className="category-name mb-0">{category.name}</h6>
                        </div>
                      </td>
                      <td>
                        <div className="category-description">
                          {category.description || 'Không có mô tả'}
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="date-container">
                          <span className="date-value fw-medium">
                            {new Date(category.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                          <small className="d-block text-muted">
                            {new Date(category.createdAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </small>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="date-container">
                          <span className="date-value fw-medium">
                            {new Date(category.updatedAt).toLocaleDateString('vi-VN')}
                          </span>
                          <small className="d-block text-muted">
                            {new Date(category.updatedAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {category.updatedAt !== category.createdAt && (
                              <i className="bi bi-arrow-clockwise text-warning ms-1" title="Đã cập nhật"></i>
                            )}
                          </small>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="action-buttons">
                          <button 
                            className="btn btn-outline-info btn-sm action-btn me-1"
                            title="Xem sản phẩm"
                            onClick={() => {
                              navigate(`/products/category/${category.id}`)
                            }}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button 
                            className="btn btn-outline-warning btn-sm action-btn me-1"
                            title="Chỉnh sửa"
                            onClick={() => {
                              navigate(`/categories/edit/${category.id}`)
                            }}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-outline-danger btn-sm action-btn"
                            title="Xóa"
                            onClick={() => handleDeleteClick(category)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {paginationData && paginationData.totalPages > 1 && (
              <div className="pagination-container">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="pagination-status">
                    <div className="text-muted">
                      Hiển thị {paginationData.indexOfFirstCategory + 1} - {paginationData.indexOfLastCategory} của {paginationData.totalElements} danh mục
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <label htmlFor="categoriesPerPage" className="form-label mb-0 text-muted small">
                        Hiển thị:
                      </label>
                      <select
                        id="categoriesPerPage"
                        className="form-select form-select-sm"
                        style={{ width: 'auto' }}
                        value={categoriesPerPage}
                        onChange={(e) => handleCategoriesPerPageChange(parseInt(e.target.value))}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-muted small">mục/trang</span>
                    </div>
                  </div>
                  
                  <div className="pagination-controls">
                    {/* Page Info */}
                    <div className="pagination-info">
                      Trang {currentPage} / {paginationData.totalPages}
                    </div>
                    
                    {/* Navigation */}
                    <nav aria-label="Category pagination">
                      <ul className="pagination pagination-sm mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            title="Trang đầu"
                          >
                            <i className="bi bi-chevron-double-left"></i>
                          </button>
                        </li>
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            title="Trang trước"
                          >
                            <i className="bi bi-chevron-left"></i>
                          </button>
                        </li>
                        
                        {getPaginationItems.map((page) => (
                          <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </li>
                        ))}
                        
                        <li className={`page-item ${currentPage === paginationData.totalPages ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === paginationData.totalPages}
                            title="Trang sau"
                          >
                            <i className="bi bi-chevron-right"></i>
                          </button>
                        </li>
                        <li className={`page-item ${currentPage === paginationData.totalPages ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => handlePageChange(paginationData.totalPages)}
                            disabled={currentPage === paginationData.totalPages}
                            title="Trang cuối"
                          >
                            <i className="bi bi-chevron-double-right"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={categoryToDelete?.name || ''}
        type="category"
        loading={deleting}
      />

      {/* Toast Notification */}
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

export default CategoryManagement
