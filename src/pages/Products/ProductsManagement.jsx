import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import productService from '@/services/productService'
import categoryService from '@/services/categoryService'
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal'
import ProductSearchForm from '@/components/ProductSearchForm'
import Toast from '@/components/Toast'
import './Products.css'

const ProductsManagement = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [allProducts, setAllProducts] = useState([]) // Store all products for pagination
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [imageErrors, setImageErrors] = useState(new Set())
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage, setProductsPerPage] = useState(10)
  
  // Search states
  const [searchFilters, setSearchFilters] = useState({})
  const [isSearchMode, setIsSearchMode] = useState(false)
  
  // Category pagination states
  const [currentCategoryPage, setCurrentCategoryPage] = useState(0)
  const categoriesPerPage = 4
  
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

  useEffect(() => {
    loadAllData()
  }, [])

  // Reset category page when categories change
  useEffect(() => {
    setCurrentCategoryPage(0)
  }, [categories.length])

  // Update products when pagination changes
  useEffect(() => {
    updateDisplayedProducts()
  }, [currentPage, productsPerPage, allProducts, isSearchMode])

  const loadAllData = useCallback(async (searchParams = null) => {
    setLoading(true)
    setError(null)
    
    try {
      const [productsResult, categoriesResult] = await Promise.all([
        searchParams ? productService.searchProducts(searchParams) : productService.getAllProducts(),
        categoryService.getAllCategories()
      ])

      if (productsResult.success) {
        setAllProducts(productsResult.data)
        // Reset to first page when loading new data
        setCurrentPage(1)
      } else {
        setError(productsResult.message)
      }

      if (categoriesResult.success) {
        setCategories(categoriesResult.data)
      }
    } catch (error) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateDisplayedProducts = useCallback(() => {
    const startIndex = (currentPage - 1) * productsPerPage
    const endIndex = startIndex + productsPerPage
    const displayedProducts = allProducts.slice(startIndex, endIndex)
    setProducts(displayedProducts)
  }, [currentPage, productsPerPage, allProducts])

  const handleSearch = useCallback(async (filters) => {
    setSearchFilters(filters)
    const hasFilters = Object.keys(filters).length > 0
    setIsSearchMode(hasFilters)
    
    await loadAllData(hasFilters ? filters : null)
  }, [loadAllData])

  const handleCategoryFilter = useCallback((categoryId) => {
    setSelectedCategory(categoryId)
    if (categoryId !== 'all') {
      navigate(`/products/category/${categoryId}`)
    }
  }, [navigate])

  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }, [])

  const getLowestPrice = useCallback((variants) => {
    if (!variants || variants.length === 0) return 0
    return Math.min(...variants.map(variant => variant.price))
  }, [])

  const getTotalQuantity = useCallback((variants) => {
    if (!variants || variants.length === 0) return 0
    return variants.reduce((total, variant) => total + variant.quantity, 0)
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
    return product.productVariants[0]?.imageUrl || 'https://via.placeholder.com/60x60?text=No+Image'
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
        // Remove product from both displayed and all products
        setAllProducts(prev => prev.filter(p => p.id !== productToDelete.id))
        setProducts(prev => prev.filter(p => p.id !== productToDelete.id))
        
        // Show success toast
        showToast('success', 'Thành công', `Đã xóa sản phẩm "${productToDelete.name}"`)
        
        // Hide modal
        setShowDeleteModal(false)
        setProductToDelete(null)
      } else {
        showToast('error', 'Lỗi', result.message || 'Không thể xóa sản phẩm')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      showToast('error', 'Lỗi', 'Có lỗi xảy ra khi xóa sản phẩm')
    } finally {
      setDeleting(false)
    }
  }, [productToDelete, showToast])

  // Pagination functions
  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber)
  }, [])

  const handleProductsPerPageChange = useCallback((newPerPage) => {
    setProductsPerPage(newPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }, [])

  // Memoize expensive calculations
  const categoryProductCounts = useMemo(() => {
    return categories.reduce((counts, category) => {
      counts[category.id] = allProducts.filter(p => p.categoryId === category.id).length
      return counts
    }, {})
  }, [categories, allProducts])

  // Pagination data
  const paginationData = useMemo(() => {
    const totalProducts = allProducts.length
    const totalPages = Math.ceil(totalProducts / productsPerPage)
    const indexOfFirstProduct = (currentPage - 1) * productsPerPage
    const indexOfLastProduct = Math.min(indexOfFirstProduct + productsPerPage, totalProducts)
    
    return {
      totalElements: totalProducts,
      totalPages,
      indexOfFirstProduct,
      indexOfLastProduct,
      currentPage,
      productsPerPage
    }
  }, [allProducts.length, currentPage, productsPerPage])

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

  // Category pagination logic
  const totalCategoryPages = useMemo(() => {
    return Math.ceil(categories.length / categoriesPerPage)
  }, [categories.length, categoriesPerPage])

  const currentPageCategories = useMemo(() => {
    const startIndex = currentCategoryPage * categoriesPerPage
    const endIndex = startIndex + categoriesPerPage
    return categories.slice(startIndex, endIndex)
  }, [categories, currentCategoryPage, categoriesPerPage])

  const handleCategoryPageChange = useCallback((pageIndex) => {
    setCurrentCategoryPage(pageIndex)
  }, [])

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
          <h2 className="mb-0">Products Management</h2>
          {isSearchMode && (
            <small className="text-muted">
              <i className="bi bi-search me-1"></i>
              Kết quả tìm kiếm: {allProducts.length} sản phẩm
            </small>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/products/add')}>
          <i className="bi bi-plus-lg me-2"></i>
          Add Product
        </button>
      </div>

      {/* Search Form */}
      <div className="px-3">
        <ProductSearchForm 
          onSearch={handleSearch}
          loading={loading}
          initialFilters={searchFilters}
        />
      </div>

      {/* Category Filter Tabs */}
      <div className="card mb-4 mx-3 category-section">
        <div className="card-body">
          {/* Category Title */}
          <div className="mb-2">
            <h5 className="card-title mb-0">
              <i className="bi bi-folder2-open me-2 text-primary"></i>
              Danh sách danh mục
            </h5>
          </div>
          
          <div className="row category-grid">
            {currentPageCategories.map((category) => {
              const productCount = categoryProductCounts[category.id] || 0
              return (
                <div key={category.id} className="col-md-3">
                  <div 
                    className="card h-100 border-0 shadow-sm cursor-pointer"
                    onClick={() => navigate(`/products/category/${category.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-body text-center">
                      <i className="bi bi-folder-fill text-primary mb-3 d-block"></i>
                      <h5 className="card-title">{category.name}</h5>
                      <p className="card-text text-muted">
                        {productCount} product{productCount !== 1 ? 's' : ''}
                      </p>
                      <button className="btn btn-outline-primary btn-sm">
                        View Products
                        <i className="bi bi-arrow-right ms-1"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Category Pagination */}
          {totalCategoryPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <div className="category-pagination">
                {Array.from({ length: totalCategoryPages }, (_, index) => (
                  <button
                    key={index}
                    className={`pagination-dot ${currentCategoryPage === index ? 'active' : ''}`}
                    onClick={() => handleCategoryPageChange(index)}
                    title={`Trang ${index + 1}`}
                  >
                    <span className="visually-hidden">Trang {index + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Category pagination info - moved to bottom right */}
          {categories.length > 0 && (
            <div className="d-flex justify-content-end pagination-info">
              <div className="text-muted">
                <small>
                  {totalCategoryPages > 1 ? (
                    <>
                      Trang {currentCategoryPage + 1} / {totalCategoryPages} 
                      <span className="mx-1">•</span>
                    </>
                  ) : null}
                  {categories.length} danh mục
                </small>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="w-100">
        {allProducts.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-box-seam fs-1 text-muted mb-3 d-block"></i>
            <h4 className="text-muted">No products found</h4>
            <p className="text-muted">
              Start by adding your first product to the catalog.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/products/add')}>
              <i className="bi bi-plus-lg me-2"></i>
              Add First Product
            </button>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3 px-3">
              <h5 className="mb-0">
                {isSearchMode ? 'Kết quả tìm kiếm' : 'Danh sách sản phẩm'}
              </h5>
              <small className="text-muted">
                {isSearchMode 
                  ? `Hiển thị ${products.length} trong số ${allProducts.length} sản phẩm tìm thấy`
                  : `Hiển thị ${products.length} trong số ${allProducts.length} sản phẩm`
                }
              </small>
            </div>
            
            {/* Wrap table and pagination in product-table-wrapper */}
            <div className="product-table-wrapper mx-3">
              <div className="table-responsive w-100">
                <table className="table align-middle products-table w-100">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center" style={{ width: '60px' }}>
                        STT
                      </th>
                      <th scope="col" className="text-center" style={{ width: '90px' }}>
                        <i className="bi bi-image"></i> Ảnh
                      </th>
                      <th scope="col" style={{ minWidth: '200px' }}>
                        <i className="bi bi-box-seam"></i> Tên sản phẩm
                      </th>
                      <th scope="col" className="text-center" style={{ width: '130px' }}>
                        <i className="bi bi-currency-dollar"></i> Giá từ
                      </th>
                      <th scope="col" className="text-center" style={{ width: '100px' }}>
                        <i className="bi bi-boxes"></i> Kho
                      </th>
                      <th scope="col" className="text-center" style={{ width: '150px' }}>
                        <i className="bi bi-check-circle"></i> Trạng thái
                      </th>
                      <th scope="col" className="text-center" style={{ width: '130px' }}>
                        <i className="bi bi-calendar-plus"></i> Ngày tạo
                      </th>
                      <th scope="col" className="text-center" style={{ width: '130px' }}>
                        <i className="bi bi-arrow-clockwise"></i> Cập nhật
                      </th>
                      <th scope="col" className="text-center" style={{ width: '160px' }}>
                        <i className="bi bi-gear"></i> Thao tác
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
                            {product.canDelete ? (
                              <button 
                                className="btn btn-outline-danger btn-sm action-btn"
                                title="Xóa"
                                onClick={() => handleDeleteClick(product)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            ) : (
                              <button 
                                className="btn btn-outline-secondary btn-sm action-btn"
                                title="Không thể xóa - Sản phẩm đã có đơn hàng hoặc đánh giá"
                                disabled
                              >
                                <i className="bi bi-lock"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {paginationData.totalPages > 1 && (
                <div className="pagination-container">
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
                    
                    {/* Navigation */}
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
                  </div>
                </div>
              )}
            </div>
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

export default ProductsManagement 