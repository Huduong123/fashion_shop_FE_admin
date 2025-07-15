import { useState, useRef } from 'react'
import fileUploadService from '@/services/fileUploadService'
import productVariantImageService from '@/services/productVariantImageService'
import Toast from './Toast'
import './VariantImageManager.css'

const VariantImageManager = ({ 
  images = [], 
  onChange, 
  variantId,
  label = "Ảnh biến thể", 
  maxImages = 10,
  required = false 
}) => {
  const [uploadMode, setUploadMode] = useState('url')
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [draggedIndex, setDraggedIndex] = useState(null)
  const fileInputRef = useRef(null)
  
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  })

  const showToast = (type, title, message = '') => {
    setToast({ show: true, type, title, message })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }))
  }

  const handleAddFromUrl = () => {
    if (!urlInput.trim()) {
      showToast('error', 'Lỗi', 'Vui lòng nhập URL ảnh')
      return
    }

    if (images.length >= maxImages) {
      showToast('error', 'Lỗi', `Chỉ được phép tối đa ${maxImages} ảnh`)
      return
    }

    const newImage = {
      id: Date.now(),
      imageUrl: urlInput.trim(),
      altText: '',
      isPrimary: images.length === 0, // First image is primary
      displayOrder: images.length
    }

    const updatedImages = [...images, newImage]
    onChange(updatedImages)
    setUrlInput('')
    showToast('success', 'Thành công', 'Đã thêm ảnh từ URL')
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    if (images.length + files.length > maxImages) {
      showToast('error', 'Lỗi', `Chỉ được phép tối đa ${maxImages} ảnh`)
      return
    }

    // Validate all files
    for (let file of files) {
      if (!file.type.startsWith('image/')) {
        showToast('error', 'Lỗi', 'Chỉ chấp nhận file hình ảnh!')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'Lỗi', 'Kích thước file không được vượt quá 5MB!')
        return
      }
    }

    setUploading(true)
    try {
      const uploadPromises = files.map(file => fileUploadService.uploadFile(file))
      const results = await Promise.all(uploadPromises)
      
      const newImages = results.map((result, index) => {
        if (result.success) {
          return {
            id: Date.now() + index,
            imageUrl: result.data.fileUrl,
            altText: '',
            isPrimary: images.length === 0 && index === 0,
            displayOrder: images.length + index
          }
        }
        return null
      }).filter(Boolean)

      if (newImages.length > 0) {
        const updatedImages = [...images, ...newImages]
        onChange(updatedImages)
        showToast('success', 'Thành công', `Đã upload ${newImages.length} ảnh`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      showToast('error', 'Lỗi', 'Có lỗi xảy ra khi upload file')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = (imageId) => {
    const imageToRemove = images.find(img => img.id === imageId)
    const updatedImages = images.filter(img => img.id !== imageId)
    
    // If removed image was primary, set another as primary
    if (imageToRemove?.isPrimary && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true
    }
    
    // Reorder display indices
    updatedImages.forEach((img, index) => {
      img.displayOrder = index
    })

    onChange(updatedImages)
    showToast('success', 'Thành công', 'Đã xóa ảnh')
  }


  const handleSetPrimary = async (imageId) => {
    // --- BƯỚC 1: CẬP NHẬT GIAO DIỆN NGAY LẬP TỨC (OPTIMISTIC UPDATE) ---
    // Logic này đảm bảo giao diện phản hồi nhanh và xử lý đúng cho trang "Thêm mới".
    
    // Kiểm tra ảnh có tồn tại không
    const imageExists = images.some(img => img.id === imageId);
    if (!imageExists) {
      showToast('error', 'Lỗi', `Ảnh không tồn tại.`);
      return;
    }

    // Tạo mảng ảnh mới với trạng thái isPrimary được cập nhật
    const updatedImagesForUi = images.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    }));
    
    // Cập nhật state ở component cha ngay lập tức
    onChange(updatedImagesForUi);

    // --- BƯỚC 2: ĐỒNG BỘ VỚI SERVER NẾU ĐANG Ở CHẾ ĐỘ CHỈNH SỬA ---
    // Nếu `variantId` tồn tại, nghĩa là chúng ta đang sửa một variant đã có.
    if (variantId) {
      try {
        // Gọi API để cập nhật thay đổi.
        // LƯU Ý: Lệnh gọi này sẽ thất bại (báo lỗi 404 Not Found) nếu `imageId`
        // là của một ảnh vừa được tải lên và chưa được lưu. Đây là hành vi mong muốn.
        const result = await productVariantImageService.setPrimaryImage(imageId);

        if (result.success) {
          // API thành công: server đã cập nhật và trả về danh sách ảnh mới nhất.
          // Ta đồng bộ lại state của client với dữ liệu từ server.
          onChange(result.data);
          showToast('success', 'Thành công', 'Đã cập nhật ảnh chính trên máy chủ.');
        } else {
          // API báo lỗi nhưng không phải lỗi mạng (ví dụ: ảnh mới chưa có ID).
          // Giao diện đã đúng, ta chỉ cần thông báo nhẹ nhàng.
          // Thay đổi sẽ được lưu khi người dùng bấm nút "Lưu" toàn bộ sản phẩm.
          showToast('info', 'Lưu ý', 'Ảnh chính đã được chọn. Thay đổi sẽ được lưu khi cập nhật sản phẩm.');
          console.warn(`API không thể đặt ảnh chính (ID: ${imageId}): ${result.message}.`);
        }
      } catch (error) {
        // Bắt lỗi (thường là lỗi 404 khi ID ảnh chưa có trong DB).
        // Giao diện người dùng đã được cập nhật ở Bước 1, nên ta không cần làm gì thêm.
        // Trạng thái isPrimary đúng sẽ được gửi lên khi lưu toàn bộ form.
        showToast('info', 'Lưu ý', 'Ảnh chính đã được chọn. Thay đổi sẽ được lưu khi cập nhật sản phẩm.');
        console.error(`Lỗi khi gọi API setPrimaryImage (ID: ${imageId}):`, error);
      }
    } else {
      // Nếu không có variantId, ta đang ở trang "Thêm mới".
      // Việc cập nhật giao diện ở Bước 1 là đủ.
      showToast('success', 'Thành công', 'Đã đặt làm ảnh chính.');
    }
  }

  const handleUpdateAltText = (imageId, altText) => {
    const updatedImages = images.map(img => 
      img.id === imageId ? { ...img, altText } : img
    )
    onChange(updatedImages)
  }

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    const updatedImages = [...images]
    const draggedImage = updatedImages[draggedIndex]
    
    // Remove dragged image
    updatedImages.splice(draggedIndex, 1)
    
    // Insert at new position
    updatedImages.splice(dropIndex, 0, draggedImage)
    
    // Update display orders
    updatedImages.forEach((img, index) => {
      img.displayOrder = index
    })

    onChange(updatedImages)
    setDraggedIndex(null)
    showToast('success', 'Thành công', 'Đã sắp xếp lại thứ tự ảnh')
  }

  const primaryImage = images.find(img => img.isPrimary)

  return (
    <div className="variant-image-manager">
      <label className="form-label">
        {label}
        {required && <span className="text-danger"> *</span>}
        <span className="text-muted ms-2">({images.length}/{maxImages})</span>
      </label>

      {/* Upload Section */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="mb-3">
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="uploadMode"
                id="urlMode"
                value="url"
                checked={uploadMode === 'url'}
                onChange={() => setUploadMode('url')}
              />
              <label className="form-check-label" htmlFor="urlMode">
                <i className="bi bi-link-45deg me-1"></i>
                Nhập URL
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="uploadMode"
                id="fileMode"
                value="file"
                checked={uploadMode === 'file'}
                onChange={() => setUploadMode('file')}
              />
              <label className="form-check-label" htmlFor="fileMode">
                <i className="bi bi-cloud-upload me-1"></i>
                Upload file
              </label>
            </div>
          </div>

          {uploadMode === 'url' && (
            <div className="input-group">
              <input
                type="url"
                className="form-control"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleAddFromUrl}
                disabled={images.length >= maxImages}
              >
                <i className="bi bi-plus me-1"></i>
                Thêm
              </button>
            </div>
          )}

          {uploadMode === 'file' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                className="form-control"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                disabled={uploading || images.length >= maxImages}
              />
              {uploading && (
                <div className="mt-2">
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  <small className="text-muted">Đang upload...</small>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="bi bi-images me-2"></i>
              Danh sách ảnh
              {primaryImage && (
                <small className="text-muted ms-2">
                  (Ảnh chính: {primaryImage.imageUrl.substring(0, 30)}...)
                </small>
              )}
            </h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {images.map((image, index) => (
                <div key={image.id} className="col-6">
                  <div
                    className={`image-item ${image.isPrimary ? 'primary' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <div className="image-container">
                      <img
                        src={image.imageUrl}
                        alt={image.altText || `Image ${index + 1}`}
                        className="img-thumbnail"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150x150?text=Error'
                        }}
                      />
                      
                      {image.isPrimary && (
                        <div className="primary-badge">
                          <i className="bi bi-star-fill"></i>
                          Chính
                        </div>
                      )}
                      
                      <div className="image-controls">
                        {!image.isPrimary && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => handleSetPrimary(image.id)}
                            title="Đặt làm ảnh chính"
                          >
                            <i className="bi bi-star"></i>
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveImage(image.id)}
                          title="Xóa ảnh"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Mô tả ảnh (tùy chọn)"
                        value={image.altText}
                        maxLength={255}
                        onChange={(e) => handleUpdateAltText(image.id, e.target.value)}
                      />
                      <small className="text-muted">
                        Thứ tự: {index + 1} | {image.altText.length}/255 ký tự
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-3">
              <small className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                Kéo thả để sắp xếp lại thứ tự ảnh. Ảnh đầu tiên sẽ là ảnh chính mặc định.
              </small>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="text-center py-4 border rounded bg-light">
          <i className="bi bi-images fs-1 text-muted mb-3 d-block"></i>
          <h6 className="text-muted">Chưa có ảnh nào</h6>
          <p className="text-muted mb-0">
            Thêm ảnh để hiển thị biến thể sản phẩm
          </p>
        </div>
      )}

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

export default VariantImageManager 