// AddProduct.jsx (Giữ nguyên, không cần sửa)
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import productService from '@/services/productService'
import categoryService from '@/services/categoryService'
import colorService from '@/services/colorService'
import sizeService from '@/services/sizeService'
import ImageUpload from '@/components/ImageUpload'
import VariantImageManager from '@/components/VariantImageManager'
import ColorManagementModal from '@/components/ColorManagementModal'
import SizeManagementModal from '@/components/SizeManagementModal'
import Toast from '@/components/Toast'
import { PRODUCT_VARIANT_STATUS, PRODUCT_VARIANT_STATUS_OPTIONS } from '@/utils/constants'
// Đảm bảo bạn đã import file CSS mới
import './AddProduct.css'

const AddProduct = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    enabled: true,
    categoryId: '',
    productVariants: []
  })

  const [categories, setCategories] = useState([])
  const [colors, setColors] = useState([])
  const [sizes, setSizes] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Change from single error to errors object for each field
  const [errors, setErrors] = useState({})
  const [showColorModal, setShowColorModal] = useState(false)
  const [showSizeModal, setShowSizeModal] = useState(false)
  
  // Toast states
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  })

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const [categoriesResult, colorsResult, sizesResult] = await Promise.all([
        categoryService.getCategoriesByType('LINK'), // Only get LINK type categories
        colorService.getAllColors(),
        sizeService.getAllSizes()
      ])

      if (categoriesResult.success) {
        setCategories(categoriesResult.data)
      }
      if (colorsResult.success) {
        setColors(colorsResult.data)
      }
      if (sizesResult.success) {
        setSizes(sizesResult.data)
      }
    } catch (error) {
      setErrors({ general: 'Failed to load form data' })
    }
  }

  const handleColorUpdated = async () => {
    try {
      const colorsResult = await colorService.getAllColors()
      if (colorsResult.success) {
        setColors(colorsResult.data)
      }
    } catch (error) {
      // Error refreshing colors
    }
  }

  const handleSizeUpdated = async () => {
    try {
      const sizesResult = await sizeService.getAllSizes()
      if (sizesResult.success) {
        setSizes(sizesResult.data)
      }
    } catch (error) {
      // Error refreshing sizes
    }
  }

  // Toast functions
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      productVariants: [
        ...prev.productVariants,
        {
          colorId: '',
          sizeId: '',
          price: '',
          quantity: '',
          imageUrl: '', // Keep for backward compatibility
          images: [], // New field for multiple images
          status: PRODUCT_VARIANT_STATUS.ACTIVE
        }
      ]
    }))
  }

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      productVariants: prev.productVariants.filter((_, i) => i !== index)
    }))
    
    // Clear errors for this variant
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[`variant_${index}_colorId`]
      delete newErrors[`variant_${index}_price`]
      delete newErrors[`variant_${index}_quantity`]
      delete newErrors[`variant_${index}_images`]
      return newErrors
    })
  }

  const handleVariantChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      productVariants: prev.productVariants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }))
    
    // Clear error for this variant field when user starts typing
    const errorKey = `variant_${index}_${field}`
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: null
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validate basic fields
    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Tên sản phẩm phải có ít nhất 3 ký tự'
    }
    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = 'Mô tả phải có ít nhất 10 ký tự'
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Vui lòng chọn danh mục'
    }
    if (formData.productVariants.length === 0) {
      newErrors.variants = 'Sản phẩm phải có ít nhất 1 biến thể'
    }

    // Validate variants
    for (let i = 0; i < formData.productVariants.length; i++) {
      const variant = formData.productVariants[i]
      
      if (!variant.colorId) {
        newErrors[`variant_${i}_colorId`] = 'Vui lòng chọn màu sắc'
      }
      if (!variant.price) {
        newErrors[`variant_${i}_price`] = 'Vui lòng nhập giá'
      } else if (parseFloat(variant.price) <= 0) {
        newErrors[`variant_${i}_price`] = 'Giá phải lớn hơn 0'
      }
      if (!variant.quantity) {
        newErrors[`variant_${i}_quantity`] = 'Vui lòng nhập số lượng'
      } else if (parseInt(variant.quantity) < 0) {
        newErrors[`variant_${i}_quantity`] = 'Số lượng không thể âm'
      }
      if (!variant.images || variant.images.length === 0) {
        newErrors[`variant_${i}_images`] = 'Vui lòng thêm ít nhất một ảnh cho biến thể'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const submitData = {
        ...formData,
        categoryId: parseInt(formData.categoryId),
        productVariants: formData.productVariants.map(variant => ({
          colorId: parseInt(variant.colorId),
          sizeId: variant.sizeId ? parseInt(variant.sizeId) : null,
          price: parseFloat(variant.price),
          quantity: parseInt(variant.quantity),
          imageUrl: variant.imageUrl || null, // Keep for backward compatibility
          images: variant.images || [], // New multiple images field
          status: variant.status || PRODUCT_VARIANT_STATUS.ACTIVE
        }))
      }

      const result = await productService.createProduct(submitData)
      
      if (result.success) {
        // Show success toast
        showToast('success', 'Thành công', `Đã thêm sản phẩm "${formData.name}" thành công`)
        
        // Delay redirect to show toast
        setTimeout(() => {
          navigate(`/products/category/${formData.categoryId}`)
        }, 1500)
      } else {
        setErrors({ general: result.message || 'Có lỗi xảy ra khi tạo sản phẩm' })
      }
    } catch (error) {
      setErrors({ general: 'Có lỗi xảy ra khi tạo sản phẩm' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-product-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <button 
                  className="btn btn-link p-0 text-decoration-none"
                  onClick={() => navigate(-1)}
                >
                  Products
                </button>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Add Product
              </li>
            </ol>
          </nav>
          <h2 className="mb-0">
            <i className="bi bi-plus-circle me-2"></i>
            Thêm sản phẩm mới
          </h2>
        </div>
        <div>
          <button 
            type="button" 
            className="btn btn-outline-secondary me-2"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Quay lại
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-12">
            {/* General error message */}
            {errors.general && (
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {errors.general}
              </div>
            )}

            {/* Basic Information */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Thông tin cơ bản</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-8">
                    <label htmlFor="name" className="form-label">
                      Tên sản phẩm <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Nhập tên sản phẩm"
                    />
                    {errors.name && (
                      <div className="invalid-feedback d-block">
                        {errors.name}
                      </div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="categoryId" className="form-label">
                      Danh mục <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${errors.categoryId ? 'is-invalid' : ''}`}
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <div className="invalid-feedback d-block">
                        {errors.categoryId}
                      </div>
                    )}
                  </div>
                  <div className="col-12">
                    <label htmlFor="description" className="form-label">
                      Mô tả <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                      id="description"
                      name="description"
                      rows="4"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Nhập mô tả sản phẩm"
                    />
                    {errors.description && (
                      <div className="invalid-feedback d-block">
                        {errors.description}
                      </div>
                    )}
                  </div>
                  <div className="col-12">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="enabled"
                        name="enabled"
                        checked={formData.enabled}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="enabled">
                        Kích hoạt sản phẩm
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Variants */}
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Biến thể sản phẩm</h5>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={addVariant}
                >
                  <i className="bi bi-plus me-2"></i>
                  Thêm biến thể
                </button>
              </div>
              <div className="card-body">
                {errors.variants && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {errors.variants}
                  </div>
                )}
                
                {formData.productVariants.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-box-seam fs-1 text-muted mb-3 d-block"></i>
                    <h5 className="text-muted">Chưa có biến thể nào</h5>
                    <p className="text-muted">Thêm biến thể để hoàn thành sản phẩm</p>
                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      onClick={addVariant}
                    >
                      <i className="bi bi-plus me-2"></i>
                      Thêm biến thể đầu tiên
                    </button>
                  </div>
                ) : (
                  <div className="row">
                    {formData.productVariants.map((variant, index) => (
                      <div key={index} className="col-md-6 mb-4">
                        <div className="card h-100">
                          <div className="card-header d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">
                              <i className="bi bi-box-seam me-2"></i>
                              Biến thể {index + 1}
                            </h6>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeVariant(index)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                          <div className="card-body">
                            <div className="row g-3">
                              <div className="col-12">
                                <label className="form-label">
                                  Màu sắc <span className="text-danger">*</span>
                                </label>
                                <div className="input-group">
                                  <select
                                    className={`form-select ${errors[`variant_${index}_colorId`] ? 'is-invalid' : ''}`}
                                    value={variant.colorId}
                                    onChange={(e) => handleVariantChange(index, 'colorId', e.target.value)}
                                  >
                                    <option value="">Chọn màu</option>
                                    {colors.map(color => (
                                      <option key={color.id} value={color.id}>
                                        {color.name}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowColorModal(true)}
                                    title="Thêm màu mới"
                                  >
                                    <i className="bi bi-plus"></i>
                                  </button>
                                </div>
                                {errors[`variant_${index}_colorId`] && (
                                  <div className="invalid-feedback d-block">
                                    {errors[`variant_${index}_colorId`]}
                                  </div>
                                )}
                              </div>
                              <div className="col-12">
                                <label className="form-label">
                                  Kích thước <span className="text-muted">(Tùy chọn)</span>
                                </label>
                                <div className="input-group">
                                  <select
                                    className="form-select"
                                    value={variant.sizeId}
                                    onChange={(e) => handleVariantChange(index, 'sizeId', e.target.value)}
                                  >
                                    <option value="">Chọn size (không bắt buộc)</option>
                                    {sizes.map(size => (
                                      <option key={size.id} value={size.id}>
                                        {size.name}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowSizeModal(true)}
                                    title="Thêm kích thước mới"
                                  >
                                    <i className="bi bi-plus"></i>
                                  </button>
                                </div>
                              </div>
                              <div className="col-6">
                                <label className="form-label">
                                  Giá <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="number"
                                  className={`form-control ${errors[`variant_${index}_price`] ? 'is-invalid' : ''}`}
                                  value={variant.price}
                                  onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                />
                                {errors[`variant_${index}_price`] && (
                                  <div className="invalid-feedback d-block">
                                    {errors[`variant_${index}_price`]}
                                  </div>
                                )}
                              </div>
                              <div className="col-6">
                                <label className="form-label">
                                  Số lượng <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="number"
                                  className={`form-control ${errors[`variant_${index}_quantity`] ? 'is-invalid' : ''}`}
                                  value={variant.quantity}
                                  onChange={(e) => handleVariantChange(index, 'quantity', e.target.value)}
                                  placeholder="0"
                                  min="0"
                                />
                                {errors[`variant_${index}_quantity`] && (
                                  <div className="invalid-feedback d-block">
                                    {errors[`variant_${index}_quantity`]}
                                  </div>
                                )}
                              </div>
                              <div className="col-6">
                                <label className="form-label">
                                  Trạng thái <span className="text-danger">*</span>
                                </label>
                                <select
                                  className="form-select"
                                  value={variant.status || PRODUCT_VARIANT_STATUS.ACTIVE}
                                  onChange={(e) => handleVariantChange(index, 'status', e.target.value)}
                                >
                                  {PRODUCT_VARIANT_STATUS_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-12">
                                <VariantImageManager
                                  label={`Ảnh biến thể ${index + 1}`}
                                  images={variant.images || []}
                                  onChange={(images) => handleVariantChange(index, 'images', images)}
                                  maxImages={5}
                                  required={true}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-end gap-2">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => navigate(-1)}
                  >
                    <i className="bi bi-x me-2"></i>
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check me-2"></i>
                        Tạo sản phẩm
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Color Management Modal */}
      <ColorManagementModal 
        show={showColorModal}
        onHide={() => setShowColorModal(false)}
        onColorAdded={handleColorUpdated}
      />

      {/* Size Management Modal */}
      <SizeManagementModal 
        show={showSizeModal}
        onHide={() => setShowSizeModal(false)}
        onSizeAdded={handleSizeUpdated}
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

export default AddProduct