import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import productService from '@/services/productService'
import Toast from '@/components/Toast'
import { PRODUCT_VARIANT_STATUS_LABELS, PRODUCT_VARIANT_STATUS_COLORS } from '@/utils/constants'
import './ProductDetail.css'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [imageErrors, setImageErrors] = useState(new Set())
  
  // Toast states
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  })

  useEffect(() => {
    loadProductDetail()
  }, [id])

  const loadProductDetail = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await productService.getProductById(id)
      
      if (result.success) {
        setProduct(result.data)
        // Set first variant as selected by default
        if (result.data.productVariants && result.data.productVariants.length > 0) {
          setSelectedVariant(result.data.productVariants[0])
        }
      } else {
        setError(result.message || 'Không thể tải thông tin sản phẩm')
      }
    } catch (error) {
      console.error('Error loading product detail:', error)
      setError('Có lỗi xảy ra khi tải thông tin sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleImageError = (variantId, e) => {
    if (!imageErrors.has(variantId)) {
      setImageErrors(prev => new Set([...prev, variantId]))
      e.target.src = 'https://via.placeholder.com/150x150?text=No+Image'
    }
  }

  const getImageSrc = (variant) => {
    if (imageErrors.has(variant.id)) {
      return 'https://via.placeholder.com/150x150?text=No+Image'
    }
    
    // Try to get primary image from images array first
    if (variant.images && variant.images.length > 0) {
      const primaryImage = variant.images.find(img => img.isPrimary)
      if (primaryImage) {
        return primaryImage.imageUrl
      }
      // If no primary image, use first image
      return variant.images[0].imageUrl
    }
    
    // Fallback to legacy imageUrl field
    return variant.imageUrl || 'https://via.placeholder.com/150x150?text=No+Image'
  }

  const showToast = (type, title, message = '') => {
    setToast({
      show: true,
      type,
      title,
      message
    })
  }

  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      show: false
    }))
  }

  const getTotalQuantity = () => {
    if (!product?.productVariants) return 0
    
    // Sum up totalQuantity from all variants
    return product.productVariants.reduce((total, variant) => {
      return total + (variant.totalQuantity || 0)
    }, 0)
  }

  const getLowestPrice = () => {
    if (!product?.productVariants || product.productVariants.length === 0) return 0
    
    // Use minPrice from each variant and find the minimum among all variants
    const prices = product.productVariants
      .map(variant => variant.minPrice)
      .filter(price => price != null && price > 0)
    
    return prices.length > 0 ? Math.min(...prices) : 0
  }

  const getHighestPrice = () => {
    if (!product?.productVariants || product.productVariants.length === 0) return 0
    
    // Use maxPrice from each variant and find the maximum among all variants
    const prices = product.productVariants
      .map(variant => variant.maxPrice)
      .filter(price => price != null && price > 0)
    
    return prices.length > 0 ? Math.max(...prices) : 0
  }

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
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-2"></i>
          Quay lại danh sách
        </button>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container-fluid">
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-info-circle me-2"></i>
          Không tìm thấy sản phẩm
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-2"></i>
          Quay lại danh sách
        </button>
      </div>
    )
  }

  return (
    <div className="product-detail-container">
      {/* Header */}
      <div className="product-detail-header">
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-2"></i>
          Quay lại danh sách
        </button>
        <div className="header-actions">
          <button 
            className="btn btn-primary me-2" 
            onClick={() => navigate(`/products/edit/${product.id}`)}
          >
            <i className="bi bi-pencil me-2"></i>
            Chỉnh sửa
          </button>
          <span className={`badge ${product.enabled ? 'bg-success' : 'bg-danger'} fs-6`}>
            {product.enabled ? 'Hoạt động' : 'Không hoạt động'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="row">
        {/* Product Info */}
        <div className="col-lg-8">
          <div className="card product-info-card">
            <div className="card-header">
              <h4 className="mb-0">
                <i className="bi bi-box me-2"></i>
                Thông tin sản phẩm
              </h4>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="info-group">
                    <label>Tên sản phẩm:</label>
                    <p className="info-value">{product.name}</p>
                  </div>
                  <div className="info-group">
                    <label>Danh mục:</label>
                    <p className="info-value">
                      <span className="badge bg-primary">{product.categoryName || 'Chưa phân loại'}</span>
                    </p>
                  </div>
                  <div className="info-group">
                    <label>Trạng thái:</label>
                    <p className="info-value">
                      <span className={`badge ${product.enabled ? 'bg-success' : 'bg-danger'}`}>
                        {product.enabled ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="info-group">
                    <label>Ngày tạo:</label>
                    <p className="info-value">{formatDateTime(product.createdAt)}</p>
                  </div>
                  <div className="info-group">
                    <label>Ngày cập nhật:</label>
                    <p className="info-value">{formatDateTime(product.updatedAt)}</p>
                  </div>
                  <div className="info-group">
                    <label>ID sản phẩm:</label>
                    <p className="info-value">#{product.id}</p>
                  </div>
                </div>
              </div>
              <div className="info-group">
                <label>Mô tả:</label>
                <div className="description-content">
                  {product.description ? (
                    <p className="info-value">{product.description}</p>
                  ) : (
                    <p className="text-muted">Chưa có mô tả</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="col-lg-4">
          <div className="card summary-card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-bar-chart me-2"></i>
                Tổng quan
              </h5>
            </div>
            <div className="card-body">
              <div className="summary-item">
                <div className="summary-label">Tổng số biến thể:</div>
                <div className="summary-value">{product.productVariants?.length || 0}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Tổng số lượng:</div>
                <div className="summary-value">{getTotalQuantity()}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Giá thấp nhất:</div>
                <div className="summary-value text-success">{formatPrice(getLowestPrice())}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Giá cao nhất:</div>
                <div className="summary-value text-danger">{formatPrice(getHighestPrice())}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Variants */}
      <div className="card variants-card mt-4">
        <div className="card-header">
          <h4 className="mb-0">
            <i className="bi bi-palette me-2"></i>
            Biến thể sản phẩm ({product.productVariants?.length || 0})
          </h4>
        </div>
        <div className="card-body">
          {product.productVariants && product.productVariants.length > 0 ? (
            <div className="variants-grid">
              {product.productVariants.map((variant, index) => (
                <div 
                  key={variant.id} 
                  className={`variant-card ${selectedVariant?.id === variant.id ? 'selected' : ''}`}
                  onClick={() => setSelectedVariant(variant)}
                >
                  <div className="variant-image">
                    <img
                      src={getImageSrc(variant)}
                      alt={`${product.name} - ${variant.colorName}`}
                      onError={(e) => handleImageError(variant.id, e)}
                    />
                    {/* Image count badge */}
                    {variant.images && variant.images.length > 1 && (
                      <span className="image-count-badge">
                        <i className="bi bi-images me-1"></i>
                        {variant.images.length}
                      </span>
                    )}
                  </div>
                  <div className="variant-info">
                    <h6 className="variant-title">Biến thể #{index + 1}</h6>
                    <div className="variant-details">
                      <div className="detail-row">
                        <span className="detail-label">Màu sắc:</span>
                        <span className="detail-value">{variant.colorName}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Kích thước:</span>
                        <span className="detail-value">
                          {variant.sizes && variant.sizes.length > 0 
                            ? variant.sizes.map(size => size.sizeName).join(', ')
                            : 'Không có'
                          }
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Giá:</span>
                        <span className="detail-value price">
                          {variant.minPrice && variant.maxPrice 
                            ? (variant.minPrice === variant.maxPrice 
                                ? formatPrice(variant.minPrice)
                                : `${formatPrice(variant.minPrice)} - ${formatPrice(variant.maxPrice)}`
                              )
                            : 'Chưa có giá'
                          }
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Số lượng:</span>
                        <span className={`detail-value quantity ${(variant.totalQuantity || 0) === 0 ? 'out-of-stock' : ''}`}>
                          {variant.totalQuantity || 0}
                          {(variant.totalQuantity || 0) === 0 && <span className="stock-status"> (Hết hàng)</span>}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Trạng thái:</span>
                        <span className="detail-value">
                          <span className={`badge bg-${PRODUCT_VARIANT_STATUS_COLORS[variant.status || 'ACTIVE']}-subtle text-${PRODUCT_VARIANT_STATUS_COLORS[variant.status || 'ACTIVE']}-emphasis`}>
                            {PRODUCT_VARIANT_STATUS_LABELS[variant.status || 'ACTIVE']}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <i className="bi bi-box-seam text-muted" style={{ fontSize: '3rem' }}></i>
              <p className="text-muted mt-3">Chưa có biến thể nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Variant Detail */}
      {selectedVariant && (
        <div className="card variant-detail-card mt-4">
          <div className="card-header">
            <h4 className="mb-0">
              <i className="bi bi-eye me-2"></i>
              Chi tiết biến thể: {selectedVariant.colorName} 
              {selectedVariant.sizeName && ` - ${selectedVariant.sizeName}`}
            </h4>
          </div>
          <div className="card-body">
            <div className="row">
              {/* Variant Info */}
              <div className="col-lg-4">
                <div className="variant-detail-info">
                  <div className="info-group">
                    <label>ID biến thể:</label>
                    <p className="info-value">#{selectedVariant.id}</p>
                  </div>
                  <div className="info-group">
                    <label>Màu sắc:</label>
                    <p className="info-value">
                      <span className="badge bg-primary">{selectedVariant.colorName}</span>
                    </p>
                  </div>
                  <div className="info-group">
                    <label>Kích thước:</label>
                    <p className="info-value">
                      {selectedVariant.sizes && selectedVariant.sizes.length > 0 
                        ? selectedVariant.sizes.map(size => (
                            <span key={size.id} className="badge bg-secondary me-1">
                              {size.sizeName}
                            </span>
                          ))
                        : <span className="badge bg-secondary">Không có</span>
                      }
                    </p>
                  </div>
                  <div className="info-group">
                    <label>Giá bán:</label>
                    <p className="info-value">
                      <span className="price-highlight">
                        {selectedVariant.minPrice && selectedVariant.maxPrice 
                          ? (selectedVariant.minPrice === selectedVariant.maxPrice 
                              ? formatPrice(selectedVariant.minPrice)
                              : `${formatPrice(selectedVariant.minPrice)} - ${formatPrice(selectedVariant.maxPrice)}`
                            )
                          : 'Chưa có giá'
                        }
                      </span>
                    </p>
                  </div>
                  <div className="info-group">
                    <label>Số lượng tồn kho:</label>
                    <p className="info-value">
                      <span className={`quantity-badge ${(selectedVariant.totalQuantity || 0) === 0 ? 'out-of-stock' : (selectedVariant.totalQuantity || 0) < 10 ? 'low-stock' : 'in-stock'}`}>
                        {selectedVariant.totalQuantity || 0}
                        {(selectedVariant.totalQuantity || 0) === 0 && ' (Hết hàng)'}
                        {(selectedVariant.totalQuantity || 0) > 0 && (selectedVariant.totalQuantity || 0) < 10 && ' (Sắp hết)'}
                      </span>
                    </p>
                  </div>
                  <div className="info-group">
                    <label>Trạng thái:</label>
                    <p className="info-value">
                      <span className={`badge bg-${PRODUCT_VARIANT_STATUS_COLORS[selectedVariant.status || 'ACTIVE']}`}>
                        {PRODUCT_VARIANT_STATUS_LABELS[selectedVariant.status || 'ACTIVE']}
                      </span>
                    </p>
                  </div>
                  
                  {/* Size Details */}
                  {selectedVariant.sizes && selectedVariant.sizes.length > 0 && (
                    <div className="info-group">
                      <label>Chi tiết theo kích thước:</label>
                      <div className="sizes-detail">
                        {selectedVariant.sizes.map(size => (
                          <div key={size.id} className="size-detail-item">
                            <div className="size-header">
                              <span className="size-name">{size.sizeName}</span>
                              <span className={`size-availability ${size.available ? 'available' : 'unavailable'}`}>
                                {size.available ? 'Có sẵn' : 'Hết hàng'}
                              </span>
                            </div>
                            <div className="size-info">
                              <span className="size-price">{formatPrice(size.price)}</span>
                              <span className="size-quantity">SL: {size.quantity}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Variant Images Gallery */}
              <div className="col-lg-8">
                <div className="variant-images-section">
                  <h5 className="section-title">
                    <i className="bi bi-images me-2"></i>
                    Thư viện ảnh ({selectedVariant.images?.length || 0})
                  </h5>
                  
                  {selectedVariant.images && selectedVariant.images.length > 0 ? (
                    <div className="images-gallery">
                      <div className="row g-3">
                        {selectedVariant.images
                          .sort((a, b) => a.displayOrder - b.displayOrder)
                          .map((image, index) => (
                          <div key={image.id || index} className="col-md-6 col-lg-4">
                            <div className="gallery-item">
                              <div className="image-container">
                                <img
                                  src={image.imageUrl}
                                  alt={image.altText || `${product.name} - Ảnh ${index + 1}`}
                                  className="gallery-image"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/300x300?text=Error'
                                  }}
                                />
                                
                                {/* Primary badge */}
                                {image.isPrimary && (
                                  <div className="primary-badge">
                                    <i className="bi bi-star-fill me-1"></i>
                                    Ảnh chính
                                  </div>
                                )}
                                
                                {/* Image order */}
                                <div className="image-order">
                                  #{image.displayOrder + 1}
                                </div>

                                {/* Image actions */}
                                <div className="image-actions">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-light"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      window.open(image.imageUrl, '_blank')
                                    }}
                                    title="Xem ảnh gốc"
                                  >
                                    <i className="bi bi-arrows-fullscreen"></i>
                                  </button>
                                </div>
                              </div>
                              
                              <div className="image-info">
                                <div className="image-url">
                                  <small className="text-muted">
                                    <i className="bi bi-link-45deg me-1"></i>
                                    {image.imageUrl.length > 50 
                                      ? `${image.imageUrl.substring(0, 50)}...` 
                                      : image.imageUrl
                                    }
                                  </small>
                                </div>
                                {image.altText && (
                                  <div className="image-alt">
                                    <small className="text-muted">
                                      <i className="bi bi-text-left me-1"></i>
                                      {image.altText}
                                    </small>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="no-images-placeholder">
                      <div className="text-center py-4">
                        <i className="bi bi-image text-muted" style={{ fontSize: '3rem' }}></i>
                        <p className="text-muted mt-3">
                          Biến thể này chưa có ảnh nào
                          {selectedVariant.imageUrl && (
                            <span>
                              <br />
                              <small>Chỉ có ảnh legacy: </small>
                              <a href={selectedVariant.imageUrl} target="_blank" rel="noopener noreferrer">
                                Xem ảnh
                              </a>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={hideToast}
        />
      )}
    </div>
  )
}

export default ProductDetail 