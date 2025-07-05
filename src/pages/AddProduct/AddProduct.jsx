import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import productService from '@/services/productService'
import categoryService from '@/services/categoryService'
import colorService from '@/services/colorService'
import sizeService from '@/services/sizeService'
import ImageUpload from '@/components/ImageUpload'
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
  const [error, setError] = useState(null)

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const [categoriesResult, colorsResult, sizesResult] = await Promise.all([
        categoryService.getAllCategories(),
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
      console.error('Error loading initial data:', error)
      setError('Failed to load form data')
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
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
          imageUrl: ''
        }
      ]
    }))
  }

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      productVariants: prev.productVariants.filter((_, i) => i !== index)
    }))
  }

  const handleVariantChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      productVariants: prev.productVariants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }))
  }

  const validateForm = () => {
    if (!formData.name || formData.name.trim().length < 3) {
      setError('Tên sản phẩm phải có ít nhất 3 ký tự')
      return false
    }
    if (!formData.description || formData.description.trim().length < 10) {
      setError('Mô tả phải có ít nhất 10 ký tự')
      return false
    }
    if (!formData.categoryId) {
      setError('Vui lòng chọn danh mục')
      return false
    }
    if (formData.productVariants.length === 0) {
      setError('Sản phẩm phải có ít nhất 1 biến thể')
      return false
    }

    for (let i = 0; i < formData.productVariants.length; i++) {
      const variant = formData.productVariants[i]
      if (!variant.colorId || !variant.sizeId || !variant.price || !variant.quantity) {
        setError(`Biến thể ${i + 1}: Vui lòng điền đầy đủ thông tin`)
        return false
      }
      if (parseFloat(variant.price) <= 0) {
        setError(`Biến thể ${i + 1}: Giá phải lớn hơn 0`)
        return false
      }
      if (parseInt(variant.quantity) < 0) {
        setError(`Biến thể ${i + 1}: Số lượng không thể âm`)
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

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
          sizeId: parseInt(variant.sizeId),
          price: parseFloat(variant.price),
          quantity: parseInt(variant.quantity),
          imageUrl: variant.imageUrl || null
        }))
      }

      const result = await productService.createProduct(submitData)
      
      if (result.success) {
        navigate('/products')
      } else {
        setError(result.message || 'Có lỗi xảy ra khi tạo sản phẩm')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      setError('Có lỗi xảy ra khi tạo sản phẩm')
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
                  onClick={() => navigate('/products')}
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
            onClick={() => navigate('/products')}
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
            {error && (
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
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
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Nhập tên sản phẩm"
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="categoryId" className="form-label">
                      Danh mục <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12">
                    <label htmlFor="description" className="form-label">
                      Mô tả <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows="4"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Nhập mô tả sản phẩm"
                      required
                    />
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
                      <div key={index} className="col-lg-6 col-xl-4 mb-4">
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
                                <select
                                  className="form-select"
                                  value={variant.colorId}
                                  onChange={(e) => handleVariantChange(index, 'colorId', e.target.value)}
                                  required
                                >
                                  <option value="">Chọn màu</option>
                                  {colors.map(color => (
                                    <option key={color.id} value={color.id}>
                                      {color.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-12">
                                <label className="form-label">
                                  Kích thước <span className="text-danger">*</span>
                                </label>
                                <select
                                  className="form-select"
                                  value={variant.sizeId}
                                  onChange={(e) => handleVariantChange(index, 'sizeId', e.target.value)}
                                  required
                                >
                                  <option value="">Chọn size</option>
                                  {sizes.map(size => (
                                    <option key={size.id} value={size.id}>
                                      {size.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-6">
                                <label className="form-label">
                                  Giá <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={variant.price}
                                  onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                  required
                                />
                              </div>
                              <div className="col-6">
                                <label className="form-label">
                                  Số lượng <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={variant.quantity}
                                  onChange={(e) => handleVariantChange(index, 'quantity', e.target.value)}
                                  placeholder="0"
                                  min="0"
                                  required
                                />
                              </div>
                              <div className="col-12">
                                <ImageUpload
                                  label="Hình ảnh biến thể"
                                  value={variant.imageUrl}
                                  onChange={(url) => handleVariantChange(index, 'imageUrl', url)}
                                  id={`variant-${index}`}
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
                    onClick={() => navigate('/products')}
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
    </div>
  )
}

export default AddProduct 