import { useState } from 'react'
import './AddRoleModal.css'

const AddRoleModal = ({ show, onHide, onAddRole, userRoles = [], loading = false }) => {
  const [selectedRole, setSelectedRole] = useState('')
  
  // All available roles
  const allRoles = [
    { value: 'USER', label: 'Người dùng', description: 'Quyền cơ bản cho người dùng thông thường' },
    { value: 'ADMIN', label: 'Quản trị viên', description: 'Toàn quyền quản lý hệ thống' },
    { value: 'SYSTEM', label: 'Hệ thống', description: 'Quyền đặc biệt cho các tác vụ hệ thống' }
  ]
  
  // Filter out roles that user already has
  const availableRoles = allRoles.filter(role => {
    const fullRoleName = `ROLE_${role.value}`
    return !userRoles.some(userRole => userRole.name === fullRoleName)
  })
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedRole && onAddRole) {
      onAddRole(selectedRole)
    }
  }
  
  const handleClose = () => {
    setSelectedRole('')
    onHide()
  }
  
  if (!show) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="add-role-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h4 className="modal-title">
            <i className="bi bi-plus-circle me-2"></i>
            Thêm quyền hạn
          </h4>
          <button 
            type="button" 
            className="btn-close" 
            onClick={handleClose}
            disabled={loading}
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
        
        <div className="modal-body">
          {availableRoles.length === 0 ? (
            <div className="no-roles-available">
              <i className="bi bi-info-circle text-info"></i>
              <h5>Không còn quyền để thêm</h5>
              <p>Người dùng này đã có tất cả các quyền hạn có sẵn trong hệ thống.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Chọn quyền hạn:</label>
                <div className="roles-options">
                  {availableRoles.map((role) => (
                    <div 
                      key={role.value}
                      className={`role-option ${selectedRole === role.value ? 'selected' : ''}`}
                      onClick={() => setSelectedRole(role.value)}
                    >
                      <div className="role-option-header">
                        <input
                          type="radio"
                          name="role"
                          value={role.value}
                          checked={selectedRole === role.value}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="role-radio"
                        />
                        <span className="role-label">{role.label}</span>
                      </div>
                      <div className="role-description">
                        {role.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>
        
        {availableRoles.length > 0 && (
          <div className="modal-footer">
            <button 
              type="button" 
              className="add-role-btn add-role-btn-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              type="button" 
              className="add-role-btn add-role-btn-primary"
              onClick={handleSubmit}
              disabled={!selectedRole || loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Đang thêm...
                </>
              ) : (
                <>
                  <i className="bi bi-plus me-2"></i>
                  Thêm quyền
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddRoleModal 