import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import categoryService from '@/services/categoryService'
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal'
import Toast from '@/components/Toast'
import './Category.css'

const CategoryChild = () => {
  const { parentId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get parent category from state or fetch it
  const [parentCategory, setParentCategory] = useState(location.state?.parentCategory || null)
  const [categoryPath, setCategoryPath] = useState([])
  const [childCategories, setChildCategories] = useState([])
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
    loadData()
  }, [parentId])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Load parent category if not available
      let currentParent = parentCategory
      if (!currentParent) {
        const parentResult = await categoryService.getCategoryById(parentId)
        if (parentResult.success) {
          currentParent = parentResult.data
          setParentCategory(currentParent)
        } else {
          setError('Không thể tải thông tin danh mục cha')
          return
        }
      }

      // Load category path for breadcrumb navigation
      const pathResult = await categoryService.getCategoryPath(parentId)
      if (pathResult.success) {
        setCategoryPath(pathResult.data || [])
      }

      // Load child categories
      const childResult = await categoryService.getChildrenByParentId(parentId)
      
      if (childResult.success) {
        setChildCategories(childResult.data || [])
      } else {
        setError(childResult.message)
      }
    } catch (error) {
      setError('Failed to load categories')
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }, [parentId, parentCategory])

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

  // Navigation functions
  const handleAddChild = useCallback(() => {
    navigate(`/categories/${parentId}/children/add`, {
      state: { parentCategory: parentCategory }
    })
  }, [navigate, parentId, parentCategory])

  const handleBackToParent = useCallback(() => {
    // Use category path to determine where to go back
    if (categoryPath.length > 1) {
      // If there's a parent in the path, go to parent's children page
      const grandParent = categoryPath[categoryPath.length - 2]
      navigate(`/categories/${grandParent.id}/children`)
    } else {
      // Go to root categories page
      navigate('/categories')
    }
  }, [navigate, categoryPath])

  const handleViewSubChildren = useCallback((category) => {
    navigate(`/categories/${category.id}/children`, {
      state: { parentCategory: category }
    })
  }, [navigate])

  // Delete functions
  const handleDeleteClick = useCallback(async (category) => {
    // Check if category can be deleted first
    try {
      const canDeleteResult = await categoryService.canDeleteCategory(category.id)
      
      if (canDeleteResult.success && !canDeleteResult.data) {
        showToast('warning', 'Không thể xóa', 
          `Danh mục "${category.name}" đang chứa sản phẩm hoặc danh mục con. Vui lòng xóa tất cả sản phẩm và danh mục con trước.`)
        return
      }
    } catch (error) {
      console.error('Error checking delete permission:', error)
    }

    setCategoryToDelete(category)
    setShowDeleteModal(true)
  }, [showToast])

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
        setChildCategories(prev => prev.filter(c => c.id !== categoryToDelete.id))
        
        // Show success toast
        showToast('success', 'Thành công', `Đã xóa danh mục "${categoryToDelete.name}"`)
        
        // Hide modal
        setShowDeleteModal(false)
        setCategoryToDelete(null)
        
        // Reload to get updated data
        loadData()
      } else {
        showToast('error', 'Lỗi', result.message || 'Không thể xóa danh mục')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      showToast('error', 'Lỗi', 'Có lỗi xảy ra khi xóa danh mục')
    } finally {
      setDeleting(false)
    }
  }, [categoryToDelete, showToast, loadData])

  // Pagination logic
  const paginationData = useMemo(() => {
    const indexOfLastCategory = currentPage * categoriesPerPage
    const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage
    const currentCategories = childCategories.slice(indexOfFirstCategory, indexOfLastCategory)
    const totalPages = Math.ceil(childCategories.length / categoriesPerPage)

    return {
      indexOfFirstCategory,
      indexOfLastCategory: Math.min(indexOfLastCategory, childCategories.length),
      currentCategories,
      totalPages,
      totalElements: childCategories.length
    }
  }, [childCategories, currentPage, categoriesPerPage])

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
        <button className="btn btn-secondary" onClick={handleBackToParent}>
          <i className="bi bi-arrow-left me-2"></i>
          Quay lại danh sách danh mục cha
        </button>
      </div>
    )
  }

  return (
    <div className="w-100">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <button 
              className="btn btn-link p-0 text-decoration-none"
              onClick={() => navigate('/categories')}
            >
              <i className="bi bi-house me-1"></i>
              Danh mục gốc
            </button>
          </li>
          {categoryPath.length > 1 && categoryPath.slice(0, -1).map((category, index) => (
            <li key={category.id} className="breadcrumb-item">
              <button 
                className="btn btn-link p-0 text-decoration-none"
                onClick={() => navigate(`/categories/${category.id}/children`)}
              >
                <i className="bi bi-diagram-2 me-1"></i>
                {category.name}
              </button>
            </li>
          ))}
          <li className="breadcrumb-item active" aria-current="page">
            <i className="bi bi-diagram-3 me-1"></i>
            {parentCategory?.name || 'Danh mục con'}
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 px-3">
        <div>
          <h2 className="mb-0">
            <i className="bi bi-diagram-3 me-2 text-success"></i>
            Danh mục con của "{parentCategory?.name}"
          </h2>
          <small className="text-muted">
            Tổng số: {childCategories.length} danh mục con
          </small>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-secondary" onClick={handleBackToParent}>
            <i className="bi bi-arrow-left me-2"></i>
            Quay lại
          </button>
          <button className="btn btn-success" onClick={handleAddChild}>
            <i className="bi bi-plus-lg me-2"></i>
            Thêm Danh mục Con
          </button>
        </div>
      </div>

      {/* Parent Category Info */}
      {parentCategory && (
        <div className="card mb-4">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h5 className="card-title mb-1">
                  <i className="bi bi-tag-fill text-primary me-2"></i>
                  {parentCategory.name}
                </h5>
                <p className="card-text text-muted mb-0">
                  {parentCategory.description || 'Không có mô tả'}
                </p>
              </div>
              <div className="col-md-4 text-end">
                <span className="badge bg-primary rounded-pill">
                  Danh mục cha
                </span>
                <div className="mt-2">
                  <small className="text-muted">
                    Tạo: {new Date(parentCategory.createdAt).toLocaleDateString('vi-VN')}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Child Categories Table */}
      <div className="category-table-wrapper">
        {childCategories.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-diagram-3 fs-1 text-muted mb-3 d-block"></i>
            <h4 className="text-muted">Chưa có danh mục con nào</h4>
            <p className="text-muted">
              Tạo danh mục con đầu tiên cho "{parentCategory?.name}".
            </p>
            <button className="btn btn-success" onClick={handleAddChild}>
              <i className="bi bi-plus-lg me-2"></i>
              Tạo Danh mục con đầu tiên
            </button>
          </div>
        ) : (
          <>
            <div className="table-responsive w-100">
              <table className="table align-middle categories-table w-100">
                <thead className="table-success">
                  <tr>
                    <th scope="col" className="text-center" style={{ width: '60px' }}>
                      STT
                    </th>
                    <th scope="col" style={{ minWidth: '200px' }}>
                      <i className="bi bi-tag text-success"></i> Tên danh mục con
                    </th>
                    <th scope="col" style={{ minWidth: '250px' }}>
                      <i className="bi bi-file-text text-success"></i> Mô tả
                    </th>
                    <th scope="col" className="text-center" style={{ width: '100px' }}>
                      <i className="bi bi-gear text-success"></i> Kiểu
                    </th>
                    <th scope="col" className="text-center" style={{ width: '100px' }}>
                      <i className="bi bi-toggle-on text-success"></i> Trạng thái
                    </th>
                    <th scope="col" className="text-center" style={{ width: '120px' }}>
                      <i className="bi bi-calendar-plus text-success"></i> Ngày tạo
                    </th>
                    <th scope="col" className="text-center" style={{ width: '220px' }}>
                      <i className="bi bi-gear text-success"></i> Thao tác
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
                          <small className="text-muted">
                            <i className="bi bi-arrow-down-right-circle me-1"></i>
                            Danh mục con
                          </small>
                        </div>
                      </td>
                      <td>
                        <div className="category-description">
                          {category.description || 'Không có mô tả'}
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="category-type">
                          {category.type === 'LINK' ? (
                            <span className="badge bg-success">
                              <i className="bi bi-link me-1"></i>
                              Liên kết
                            </span>
                          ) : (
                            <span className="badge bg-secondary">
                              <i className="bi bi-folder me-1"></i>
                              Thư mục
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="category-status">
                          {category.status === 'ACTIVE' ? (
                            <span className="badge bg-success">
                              <i className="bi bi-check-circle me-1"></i>
                              Hoạt động
                            </span>
                          ) : (
                            <span className="badge bg-danger">
                              <i className="bi bi-x-circle me-1"></i>
                              Vô hiệu hóa
                            </span>
                          )}
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
                        <div className="action-buttons">
                          {category.type === 'DROPDOWN' && (
                            <button 
                              className="btn btn-outline-success btn-sm action-btn me-1"
                              title="Xem danh mục con"
                              onClick={() => handleViewSubChildren(category)}
                            >
                              <i className="bi bi-diagram-3"></i>
                            </button>
                          )}
                          {category.type === 'LINK' && (
                            <button 
                              className="btn btn-outline-info btn-sm action-btn me-1"
                              title="Xem sản phẩm"
                              onClick={() => {
                                navigate(`/products/category/${category.id}`)
                              }}
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                          )}
                          <button 
                            className="btn btn-outline-warning btn-sm action-btn me-1"
                            title="Chỉnh sửa"
                            onClick={() => {
                              navigate(`/categories/${parentId}/children/edit/${category.id}`, {
                                state: { parentCategory: parentCategory }
                              })
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
                      Hiển thị {paginationData.indexOfFirstCategory + 1} - {paginationData.indexOfLastCategory} của {paginationData.totalElements} danh mục con
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

export default CategoryChild
