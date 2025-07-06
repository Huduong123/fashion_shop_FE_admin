import { useState, useRef } from 'react'
import fileUploadService from '@/services/fileUploadService'

const ImageUpload = ({ value, onChange, label = "Hình ảnh", id = '', error = null, required = false }) => {
  const [uploadMode, setUploadMode] = useState('url') // 'url' hoặc 'file'
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(value || '')
  const [urlInput, setUrlInput] = useState(value || '')
  const fileInputRef = useRef(null)
  const uniqueId = id || Math.random().toString(36).substr(2, 9)

  const handleModeChange = (mode) => {
    setUploadMode(mode)
    if (mode === 'url') {
      setPreviewUrl(urlInput)
      onChange(urlInput)
    } else {
      setPreviewUrl('')
      onChange('')
    }
  }

  const handleUrlChange = (e) => {
    const url = e.target.value
    setUrlInput(url)
    setPreviewUrl(url)
    onChange(url)
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Chỉ chấp nhận file hình ảnh!')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 5MB!')
      return
    }

    setUploading(true)
    try {
      const result = await fileUploadService.uploadFile(file)
      
      if (result.success) {
        const uploadedUrl = result.data.fileUrl
        setPreviewUrl(uploadedUrl)
        onChange(uploadedUrl)
      } else {
        alert(result.message || 'Lỗi khi upload file')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Có lỗi xảy ra khi upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl('')
    onChange('')
    if (uploadMode === 'url') {
      setUrlInput('')
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="image-upload-container">
      <label className="form-label">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      
      {/* Mode Selection */}
      <div className="mb-3">
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name={`uploadMode-${uniqueId}`}
            id={`urlMode-${uniqueId}`}
            value="url"
            checked={uploadMode === 'url'}
            onChange={() => handleModeChange('url')}
          />
          <label className="form-check-label" htmlFor={`urlMode-${uniqueId}`}>
            <i className="bi bi-link-45deg me-1"></i>
            Nhập URL
          </label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name={`uploadMode-${uniqueId}`}
            id={`fileMode-${uniqueId}`}
            value="file"
            checked={uploadMode === 'file'}
            onChange={() => handleModeChange('file')}
          />
          <label className="form-check-label" htmlFor={`fileMode-${uniqueId}`}>
            <i className="bi bi-cloud-upload me-1"></i>
            Upload file
          </label>
        </div>
      </div>

      {/* URL Input Mode */}
      {uploadMode === 'url' && (
        <div className="mb-3">
          <input
            type="url"
            className={`form-control ${error ? 'is-invalid' : ''}`}
            value={urlInput}
            onChange={handleUrlChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      )}

      {/* File Upload Mode */}
      {uploadMode === 'file' && (
        <div className="mb-3">
          <input
            ref={fileInputRef}
            type="file"
            className={`form-control ${error ? 'is-invalid' : ''}`}
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          {uploading && (
            <div className="mt-2">
              <span className="spinner-border spinner-border-sm me-2"></span>
              <small className="text-muted">Đang upload...</small>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="invalid-feedback d-block">
          {error}
        </div>
      )}

      {/* Image Preview */}
      {previewUrl && (
        <div className="image-preview mt-3">
          <div className="position-relative d-inline-block">
            <img
              src={previewUrl}
              alt="Preview"
              className="img-thumbnail"
              style={{ maxWidth: '200px', maxHeight: '200px' }}
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'block'
              }}
            />
            <div 
              className="alert alert-warning d-none" 
              style={{ maxWidth: '200px', fontSize: '0.8rem' }}
            >
              <i className="bi bi-exclamation-triangle me-1"></i>
              Không thể tải ảnh
            </div>
            <button
              type="button"
              className="btn btn-danger position-absolute"
              style={{ 
                top: '5px', 
                right: '5px',
                width: '24px',
                height: '24px',
                padding: '0',
                fontSize: '12px',
                lineHeight: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={handleRemoveImage}
              title="Xóa ảnh"
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
          <div className="mt-2">
            <small className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              {uploadMode === 'url' ? 'URL: ' : 'File: '}
              {previewUrl.length > 50 ? previewUrl.substring(0, 50) + '...' : previewUrl}
            </small>
          </div>
        </div>
      )}

      {/* Upload Tips */}
      <div className="mt-2">
        <small className="text-muted">
          <i className="bi bi-info-circle me-1"></i>
          {uploadMode === 'url' 
            ? 'Nhập URL của hình ảnh từ internet'
            : 'Chọn file ảnh từ máy tính (tối đa 5MB)'
          }
        </small>
      </div>
    </div>
  )
}

export default ImageUpload 