import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import productService from '@/services/productService'
import categoryService from '@/services/categoryService'
import './Products.css'

const ProductsManagement = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [imageErrors, setImageErrors] = useState(new Set())

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [productsResult, categoriesResult] = await Promise.all([
        productService.getAllProducts(),
        categoryService.getAllCategories()
      ])

      if (productsResult.success) {
        setProducts(productsResult.data)
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
  }

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

  // Memoize expensive calculations
  const categoryProductCounts = useMemo(() => {
    return categories.reduce((counts, category) => {
      counts[category.id] = products.filter(p => p.categoryId === category.id).length
      return counts
    }, {})
  }, [categories, products])

  const recentProducts = useMemo(() => {
    return products.slice(0, 8)
  }, [products])

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
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/products/add')}>
          <i className="bi bi-plus-lg me-2"></i>
          Add Product
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="card mb-4 mx-3">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <h6 className="mb-0 me-3">Filter by Category:</h6>
            <div className="btn-group" role="group">
              <button
                className={`btn ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleCategoryFilter('all')}
              >
                All Products ({products.length})
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`btn ${selectedCategory === category.id ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleCategoryFilter(category.id)}
                >
                  {category.name} ({categoryProductCounts[category.id] || 0})
                </button>
              ))}
            </div>
          </div>
          
          <div className="row g-3">
            {categories.map((category) => {
              const productCount = categoryProductCounts[category.id] || 0
              return (
                <div key={category.id} className="col-md-4">
                  <div 
                    className="card h-100 border-0 shadow-sm cursor-pointer"
                    onClick={() => navigate(`/products/category/${category.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-body text-center">
                      <i className="bi bi-folder-fill fs-1 text-primary mb-3 d-block"></i>
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
        </div>
      </div>

      {/* Recent Products Table */}
      <div className="w-100">
        {products.length === 0 ? (
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
              <h5 className="mb-0">Recent Products</h5>
              <small className="text-muted">Showing {recentProducts.length} of {products.length} products</small>
            </div>
            <div className="table-responsive w-100">
              <table className="table align-middle products-table w-100">
                <thead className="table-primary">
                  <tr>
                    <th scope="col" className="text-center" style={{ width: '60px' }}>
                      # STT
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
                  {recentProducts.map((product, index) => (
                    <tr key={product.id} className="product-row">
                      <td className="text-center">
                        <span className="fw-bold">{index + 1}</span>
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
                              console.log('View details for product:', product.id)
                            }}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button 
                            className="btn btn-outline-warning btn-sm action-btn me-1"
                            title="Chỉnh sửa"
                            onClick={() => {
                              console.log('Edit product:', product.id)
                            }}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-outline-danger btn-sm action-btn"
                            title="Xóa"
                            onClick={() => {
                              if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) {
                                console.log('Delete product:', product.id)
                              }
                            }}
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
          </>
        )}
      </div>
    </div>
  )
}

export default ProductsManagement 