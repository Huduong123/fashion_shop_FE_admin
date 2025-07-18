import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import productService from '@/services/productService'
import categoryService from '@/services/categoryService'
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal'
import ProductSearchForm from '@/components/ProductSearchForm'
import Toast from '@/components/Toast'
import './Products.css'

const ProductsByCategory = () => {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imageErrors, setImageErrors] = useState(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage, setProductsPerPage] = useState(10)
  
  // Search states
  const [searchFilters, setSearchFilters] = useState({})
  const [isSearchMode, setIsSearchMode] = useState(false)
  
  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  
  // Toast states
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  })
  
  // Backend pagination data
  const [paginationInfo, setPaginationInfo] = useState({
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    first: true,
    last: true
  })

  useEffect(() => {
    loadProductsByCategory()
    loadCategoryInfo()
  }, [categoryId])

  // Reload when pagination changes
  useEffect(() => {
    const params = isSearchMode ? searchFilters : null
    loadProductsByCategory(params)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, productsPerPage, isSearchMode, searchFilters])

  const loadProductsByCategory = useCallback(async (searchParams = null) => {
    if (!categoryId) return
    
    setLoading(true)
    setError(null)
    
    try {
      let result
      
      if (searchParams && Object.keys(searchParams).length > 0) {
        // Search mode: use search API with category filter
        const searchFiltersWithCategory = {
          ...searchParams,
          categoryId: parseInt(categoryId)
        }
        result = await productService.searchProducts(searchFiltersWithCategory)
        
        if (result.success) {
          // For search mode, we don't use pagination from backend
          // Instead, we'll handle pagination on frontend
          const allProducts = result.data || []
          const startIndex = (currentPage - 1) * productsPerPage
          const endIndex = startIndex + productsPerPage
          const paginatedProducts = allProducts.slice(startIndex, endIndex)
          
          setProducts(paginatedProducts)
          setPaginationInfo({
            totalElements: allProducts.length,
            totalPages: Math.ceil(allProducts.length / productsPerPage),
            size: productsPerPage,
            number: currentPage - 1,
            first: currentPage === 1,
            last: currentPage >= Math.ceil(allProducts.length / productsPerPage)
          })
        }
      } else {
        // Normal mode: use pagination API
        result = await productService.getProductsByCategoryWithPagination(
          categoryId, 
          currentPage - 1, // Backend uses 0-based indexing
          productsPerPage,
          'createdAt',
          'desc'
        )
        
        if (result.success) {
          const pageData = result.data
          setProducts(pageData.content || [])
          setPaginationInfo({
            totalElements: pageData.totalElements || 0,
            totalPages: pageData.totalPages || 0,
            size: pageData.size || productsPerPage,
            number: pageData.number || 0,
            first: pageData.first || true,
            last: pageData.last || true
          })
        }
      }
      
      if (!result.success) {
        setError(result.message)
      }
    } catch (error) {
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [categoryId, currentPage, productsPerPage])

  const handleSearch = useCallback(async (filters) => {
    setSearchFilters(filters)
    const hasFilters = Object.keys(filters).length > 0
    setIsSearchMode(hasFilters)
    setCurrentPage(1) // Reset to first page when searching
    
    await loadProductsByCategory(hasFilters ? filters : null)
  }, [loadProductsByCategory])

  const loadCategoryInfo = useCallback(async () => {
    if (!categoryId) return
    
    try {
      const result = await categoryService.getAllCategories()
      if (result.success) {
        const currentCategory = result.data.find(cat => cat.id === parseInt(categoryId))
        setCategory(currentCategory)
      }
    } catch (error) {
      console.error('Error loading category info:', error)
    }
  }, [categoryId])

  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }, [])

  const getLowestPrice = useCallback((variants) => {
    if (!variants || variants.length === 0) return 0
    
    // Use minPrice from each variant and find the minimum among all variants
    const prices = variants
      .map(variant => variant.minPrice)
      .filter(price => price != null && price > 0)
    
    return prices.length > 0 ? Math.min(...prices) : 0
  }, [])

  const getTotalQuantity = useCallback((variants) => {
    if (!variants || variants.length === 0) return 0
    
    // Sum up totalQuantity from all variants
    return variants.reduce((total, variant) => {
      return total + (variant.totalQuantity || 0)
    }, 0)
  }, [])

  const handleImageError = useCallback((productId, e) => {
    if (!imageErrors.has(productId)) {
      setImageErrors(prev => new Set([...prev, productId]))
      e.target.src = 'https://via.placeholder.com/60x60?text=No+Image'
    }
  }, [imageErrors])

  const getImageSrc = useCallback((product) => {
    if (imageErrors.has(product.id)) {
      return 'https://via.placeholder.com/60x60?text=No+Image'
    }
    
    const firstVariant = product.productVariants[0]
    if (!firstVariant) {
      return 'https://via.placeholder.com/60x60?text=No+Image'
    }
    
    // Try to get primary image from images array first
    if (firstVariant.images && firstVariant.images.length > 0) {
      const primaryImage = firstVariant.images.find(img => img.isPrimary)
      if (primaryImage) {
        return primaryImage.imageUrl
      }
      // If no primary image, use first image
      return firstVariant.images[0].imageUrl
    }
    
    // Fallback to legacy imageUrl field
    return firstVariant.imageUrl || 'https://via.placeholder.com/60x60?text=No+Image'
  }, [imageErrors])

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
  const handleDeleteClick = useCallback((product) => {
    setProductToDelete(product)
    setShowDeleteModal(true)
  }, [])

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteModal(false)
    setProductToDelete(null)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!productToDelete) return

    setDeleting(true)
    try {
      const result = await productService.deleteProduct(productToDelete.id)
      
      if (result.success) {
        // Remove product from state immediately for better UX
        setProducts(prev => prev.filter(p => p.id !== productToDelete.id))
        
        // Update pagination info
        setPaginationInfo(prev => ({
          ...prev,
          totalElements: prev.totalElements - 1
        }))
        
        // Show success toast
        showToast('success', 'Thành công', `Đã xóa sản phẩm "${productToDelete.name}"`)
        
        // Hide modal
        setShowDeleteModal(false)
        setProductToDelete(null)
        
        // Reload current page to get updated data
        const params = isSearchMode ? searchFilters : null
        loadProductsByCategory(params)
      } else {
        showToast('error', 'Lỗi', result.message || 'Không thể xóa sản phẩm')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      showToast('error', 'Lỗi', 'Có lỗi xảy ra khi xóa sản phẩm')
    } finally {
      setDeleting(false)
    }
  }, [productToDelete, showToast, loadProductsByCategory])

  // Backend pagination data
  const paginationData = useMemo(() => {
    return {
      indexOfFirstProduct: paginationInfo.number * paginationInfo.size,
      indexOfLastProduct: Math.min((paginationInfo.number * paginationInfo.size) + paginationInfo.size, paginationInfo.totalElements),
      currentProducts: products,
      totalPages: paginationInfo.totalPages,
      totalElements: paginationInfo.totalElements
    }
  }, [products, paginationInfo])

  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber)
  }, [])

  const handleProductsPerPageChange = useCallback((newPerPage) => {
    setProductsPerPage(newPerPage)
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
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <button 
                  className="btn btn-link p-0 text-decoration-none"
                  onClick={() => navigate('/products')}
                >
                  Products
                </button>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {category?.name || 'Category'}
              </li>
            </ol>
          </nav>
          <h2 className="mb-0">
            {category?.name ? `${category.name} Products` : 'Products by Category'}
          </h2>
          {isSearchMode && (
            <small className="text-muted">
              <i className="bi bi-search me-1"></i>
              Kết quả tìm kiếm: {paginationInfo.totalElements} sản phẩm
            </small>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/products/add')}>
          <i className="bi bi-plus-lg me-2"></i>
          Add Product
        </button>
      </div>

      {/* Search Form */}
      <div className="w-100 px-3">
        <ProductSearchForm 
          onSearch={handleSearch}
          loading={loading}
          initialFilters={searchFilters}
          hideCategoryFilter={true}
        />
      </div>

      {/* Products Table */}
      <div className="w-100">
        {products.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-box-seam fs-1 text-muted mb-3 d-block"></i>
            <h4 className="text-muted">No products found</h4>
            <p className="text-muted">
              There are no products in this category yet.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/products/add')}>
              <i className="bi bi-plus-lg me-2"></i>
              Add First Product
            </button>
          </div>
        ) : (
          <>
            <div className="table-responsive w-100">
              <table className="table align-middle products-table w-100">
                <thead className="table-primary">
                  <tr>
                    <th scope="col" className="text-center" style={{ width: '60px' }}>
                      STT
                    </th>
                    <th scope="col" className="text-center" style={{ width: '90px' }}>
                      <i className="bi bi-image text-primary"></i> Ảnh
                    </th>
                    <th scope="col" style={{ minWidth: '200px' }}>
                      <i className="bi bi-box-seam text-primary"></i> Tên sản phẩm
                    </th>
                    <th scope="col" className="text-center" style={{ width: '130px' }}>
                      <i className="bi bi-currency-dollar text-primary"></i> Giá từ
                    </th>
                    <th scope="col" className="text-center" style={{ width: '100px' }}>
                      <i className="bi bi-boxes text-primary"></i> Kho
                    </th>
                    <th scope="col" className="text-center" style={{ width: '150px' }}>
                      <i className="bi bi-check-circle text-primary"></i>Trạng thái
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
                  {products.map((product, index) => (
                    <tr key={product.id} className="product-row">
                      <td className="text-center">
                        <span className="fw-bold">
                          {paginationData.indexOfFirstProduct + index + 1}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="product-image-container">
                          <img
                            src={getImageSrc(product)}
                            alt={product.name}
                            className="product-image-thumb"
                            onError={(e) => handleImageError(product.id, e)}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="product-info">
                          <h6 className="product-name mb-0">{product.name}</h6>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="price-container">
                          <span className="price-value text-success fw-bold">
                            {formatPrice(getLowestPrice(product.productVariants))}
                          </span>
                          {product.productVariants.length > 1 && (
                            <small className="d-block text-muted mt-1">
                              {product.productVariants.length} mức giá
                            </small>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-info-subtle text-info-emphasis px-3 py-2 rounded-pill">
                          <i className="bi bi-boxes me-1"></i>
                          {getTotalQuantity(product.productVariants)}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={`badge status-badge ${product.enabled ? 'bg-success-subtle text-success-emphasis' : 'bg-danger-subtle text-danger-emphasis'} px-3 py-2 rounded-pill`}>
                          <i className={`bi ${product.enabled ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                          {product.enabled ? 'Hoạt động' : 'Tạm dừng'}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="date-container">
                          <span className="date-value fw-medium">
                            {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                          <small className="d-block text-muted">
                            {new Date(product.createdAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </small>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="date-container">
                          <span className="date-value fw-medium">
                            {new Date(product.updatedAt).toLocaleDateString('vi-VN')}
                          </span>
                          <small className="d-block text-muted">
                            {new Date(product.updatedAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {product.updatedAt !== product.createdAt && (
                              <i className="bi bi-arrow-clockwise text-warning ms-1" title="Đã cập nhật"></i>
                            )}
                          </small>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="action-buttons">
                          <button 
                            className="btn btn-outline-info btn-sm action-btn me-1"
                            title="Xem chi tiết"
                            onClick={() => {
                              navigate(`/products/detail/${product.id}`)
                            }}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button 
                            className="btn btn-outline-warning btn-sm action-btn me-1"
                            title="Chỉnh sửa"
                            onClick={() => {
                              navigate(`/products/edit/${product.id}`)
                            }}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-outline-danger btn-sm action-btn"
                            title="Xóa"
                            onClick={() => handleDeleteClick(product)}
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
            {paginationData && (
              <div className="pagination-container">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="pagination-status">
                    <div className="text-muted">
                      Hiển thị {paginationData.indexOfFirstProduct + 1} - {paginationData.indexOfLastProduct} của {paginationData.totalElements} sản phẩm
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <label htmlFor="productsPerPage" className="form-label mb-0 text-muted small">
                        Hiển thị:
                      </label>
                      <select
                        id="productsPerPage"
                        className="form-select form-select-sm"
                        style={{ width: 'auto' }}
                        value={productsPerPage}
                        onChange={(e) => handleProductsPerPageChange(parseInt(e.target.value))}
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
                    
                    {/* Navigation - Only show when multiple pages */}
                    {paginationData.totalPages > 1 && (
                      <nav aria-label="Product pagination">
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
                    )}
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
        itemName={productToDelete?.name || ''}
        type="product"
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

export default ProductsByCategory 