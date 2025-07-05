import { useState, useEffect, useCallback } from 'react'
import categoryService from '@/services/categoryService'

const ProductSearchForm = ({ onSearch, loading = false, initialFilters = {}, hideCategoryFilter = false }) => {
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    minPrice: '',
    maxPrice: '',
    minQuantity: '',
    maxQuantity: '',
    enabled: '',
    categoryId: '',
    createdAt: '',
    updatedAt: '',
    ...initialFilters
  })

  const [categories, setCategories] = useState([])
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    if (!hideCategoryFilter) {
      loadCategories()
    }
  }, [hideCategoryFilter])

  const loadCategories = async () => {
    try {
      const result = await categoryService.getAllCategories()
      if (result.success) {
        setCategories(result.data)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleInputChange = useCallback((field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const handleSearch = useCallback((e) => {
    e.preventDefault()
    
    const cleanedFilters = Object.entries(searchFilters).reduce((acc, [key, value]) => {
      if (hideCategoryFilter && key === 'categoryId') {
        return acc
      }
      
      if (value !== '' && value !== null && value !== undefined) {
        if (['minPrice', 'maxPrice', 'minQuantity', 'maxQuantity', 'categoryId'].includes(key)) {
          const numValue = parseFloat(value)
          if (!isNaN(numValue) && numValue >= 0) {
            acc[key] = numValue
          }
        } else if (key === 'enabled') {
          acc[key] = value === 'true'
        } else if (typeof value === 'string' && value.trim()) {
          acc[key] = value.trim()
        } else if (value instanceof Date || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value))) {
          acc[key] = value
        }
      }
      return acc
    }, {})

    onSearch(cleanedFilters)
  }, [searchFilters, onSearch, hideCategoryFilter])

  const handleReset = useCallback(() => {
    const resetFilters = {
      name: '', minPrice: '', maxPrice: '', minQuantity: '', maxQuantity: '',
      enabled: '', categoryId: '', createdAt: '', updatedAt: ''
    }
    setSearchFilters(resetFilters)
    onSearch({}) // Gửi một object rỗng để reset kết quả tìm kiếm
  }, [onSearch])

  return (
    <div className="card mb-3">
      <div className="card-body py-3">
        <form onSubmit={handleSearch}>
          {/* Nút bật/tắt bộ lọc nâng cao */}
          <div className="d-flex justify-content-end mb-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary btn-sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <i className={`bi bi-sliders me-1`}></i>
              {showAdvanced ? 'Ẩn bộ lọc nâng cao' : 'Hiện bộ lọc nâng cao'}
            </button>
          </div>

          {/* Các trường tìm kiếm */}
          <div className="row g-2">
            {/* --- BỘ LỌC CƠ BẢN --- */}
            <div className={hideCategoryFilter ? "col-md-6" : "col-md-5"}>
              <label htmlFor="searchName" className="form-label small fw-bold mb-1">
                Tên sản phẩm
              </label>
              <input
                type="text"
                id="searchName"
                className="form-control form-control-sm"
                placeholder="Nhập tên sản phẩm..."
                value={searchFilters.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            {!hideCategoryFilter && (
              <div className="col-md-4">
                <label htmlFor="searchCategory" className="form-label small fw-bold mb-1">
                  Danh mục
                </label>
                <select
                  id="searchCategory"
                  className="form-select form-select-sm"
                  value={searchFilters.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className={hideCategoryFilter ? "col-md-6" : "col-md-3"}>
              <label htmlFor="searchStatus" className="form-label small fw-bold mb-1">
                Trạng thái
              </label>
              <select
                id="searchStatus"
                className="form-select form-select-sm"
                value={searchFilters.enabled}
                onChange={(e) => handleInputChange('enabled', e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="true">Hoạt động</option>
                <option value="false">Tạm dừng</option>
              </select>
            </div>

            {/* --- BỘ LỌC NÂNG CAO --- */}
            {showAdvanced && (
              <>
                <div className="col-md-6">
                  <label className="form-label small fw-bold mb-1">
                    Khoảng giá (VNĐ)
                  </label>
                  <div className="input-group input-group-sm">
                    <input
                      type="number" className="form-control" placeholder="Giá từ" min="0"
                      value={searchFilters.minPrice}
                      onChange={(e) => handleInputChange('minPrice', e.target.value)}
                    />
                    <span className="input-group-text">-</span>
                    <input
                      type="number" className="form-control" placeholder="Giá đến" min="0"
                      value={searchFilters.maxPrice}
                      onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold mb-1">
                    Khoảng số lượng
                  </label>
                  <div className="input-group input-group-sm">
                    <input
                      type="number" className="form-control" placeholder="Từ" min="0"
                      value={searchFilters.minQuantity}
                      onChange={(e) => handleInputChange('minQuantity', e.target.value)}
                    />
                    <span className="input-group-text">-</span>
                    <input
                      type="number" className="form-control" placeholder="Đến" min="0"
                      value={searchFilters.maxQuantity}
                      onChange={(e) => handleInputChange('maxQuantity', e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label htmlFor="searchCreatedAt" className="form-label small fw-bold mb-1">
                    Ngày tạo
                  </label>
                  <input
                    type="date" id="searchCreatedAt" className="form-control form-control-sm"
                    value={searchFilters.createdAt}
                    onChange={(e) => handleInputChange('createdAt', e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="searchUpdatedAt" className="form-label small fw-bold mb-1">
                    Ngày cập nhật
                  </label>
                  <input
                    type="date" id="searchUpdatedAt" className="form-control form-control-sm"
                    value={searchFilters.updatedAt}
                    onChange={(e) => handleInputChange('updatedAt', e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          {/* Nút hành động */}
          <div className="border-top mt-3 pt-2 d-flex justify-content-end gap-2">
            {showAdvanced && (
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleReset}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Đặt lại
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Đang tìm...
                </>
              ) : (
                <>
                  <i className="bi bi-search me-1"></i>
                  Tìm kiếm
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductSearchForm