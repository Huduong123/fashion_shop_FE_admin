import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import accountService from '@/services/accountService';
import Toast from '@/components/Toast';
import AddRoleModal from '@/components/AddRoleModal';
import withAuthorization from '@/components/HOC/withAuthorization.jsx'; // <<< THÊM IMPORT
import './AccountDetail.css';

// Component gốc giữ nguyên
const AccountDetail = () => {
  // ... toàn bộ code của component AccountDetail của bạn giữ nguyên ...
  // ... từ const { id } = useParams() đến hết ...
  const { id } = useParams()
  const navigate = useNavigate()
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Toast states
  const [toast, setToast] = useState({ show: false, type: 'success', title: '', message: '' })

  // Modal states
  const [showAddRoleModal, setShowAddRoleModal] = useState(false)
  const [addingRole, setAddingRole] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState(null)
  const [removingRole, setRemovingRole] = useState(null)

  useEffect(() => {
    if (id) {
      loadAccountDetail()
    }
  }, [id])

  const loadAccountDetail = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await accountService.getAccount(id)
      if (result.success) {
        setAccount(result.data)
      } else {
        setError(result.message || 'Không thể tải thông tin tài khoản')
      }
    } catch (err) {
      console.error('Error loading account detail:', err)
      setError('Có lỗi xảy ra khi tải thông tin tài khoản')
    } finally {
      setLoading(false)
    }
  }

  // Helper functions (same as before, no changes needed)
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật'
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const formatBirthday = (dateString) => {
    if (!dateString) return 'Chưa cập nhật'
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  }
  
  const getInitials = (fullname, username) => {
    if (fullname) return fullname.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    return username?.charAt(0)?.toUpperCase() || '?'
  }

  const getRoleDisplayName = (roleName) => ({
    'ROLE_ADMIN': 'Quản trị viên', 'ROLE_USER': 'Người dùng', 'ROLE_MANAGER': 'Quản lý', 'ROLE_STAFF': 'Nhân viên', 'ROLE_SYSTEM': 'Quản trị hệ thống'
  }[roleName] || roleName)

  const getRoleDescription = (roleName) => ({
    'ROLE_ADMIN': 'Quản lí admin.', 'ROLE_USER': 'Quyền hạn người dùng cơ bản.', 'ROLE_MANAGER': 'Quản lý hoạt động và nhân viên.', 'ROLE_STAFF': 'Quyền hạn của nhân viên.', 'ROLE_SYSTEM': 'Quản trị hệ thống .'
  }[roleName] || 'Vai trò người dùng trong hệ thống.')

  const getRoleIcon = (roleName) => ({
    'ROLE_ADMIN': 'bi-person-gear', 'ROLE_USER': 'bi-person-fill', 'ROLE_MANAGER': 'bi-person-gear', 'ROLE_STAFF': 'bi-person-badge', 'ROLE_SYSTEM': 'bi-shield-fill-check'
  }[roleName] || 'bi-person')

  // Handler functions (same as before, no changes needed)
  const showToast = (type, title, message = '') => setToast({ show: true, type, title, message })
  const hideToast = () => setToast(prev => ({ ...prev, show: false }))

  const handleToggleStatus = async () => {
    try {
      const result = await accountService.toggleAccountStatus(account.id, !account.enabled)
      if (result.success) {
        setAccount(prev => ({ ...prev, enabled: !prev.enabled }))
        showToast('success', 'Thành công', `Đã ${account.enabled ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản "${account.username}"`)
      } else {
        showToast('error', 'Lỗi', result.message || 'Không thể thay đổi trạng thái')
      }
    } catch (err) {
      showToast('error', 'Lỗi', 'Có lỗi xảy ra khi đổi trạng thái tài khoản')
    }
  }

  const handleAddRole = async (roleName) => {
    setAddingRole(true)
    try {
      const result = await accountService.addRoleToUser(account.id, roleName)
      if (result.success) {
        setAccount(result.data)
        setShowAddRoleModal(false)
        showToast('success', 'Thành công', `Đã thêm quyền "${getRoleDisplayName(`ROLE_${roleName}`)}"`)
      } else {
        showToast('error', 'Lỗi', result.message || 'Không thể thêm quyền')
      }
    } catch (err) {
      showToast('error', 'Lỗi', 'Có lỗi xảy ra khi thêm quyền hạn')
    } finally {
      setAddingRole(false)
    }
  }

  const handleRemoveRole = (authority) => {
    setRoleToDelete(authority)
    setShowDeleteConfirmation(true)
  }

  const confirmRemoveRole = async () => {
    if (!roleToDelete) return
    setRemovingRole(roleToDelete.name)
    try {
      const roleName = roleToDelete.name.replace('ROLE_', '')
      const result = await accountService.removeRoleFromUser(account.id, roleName)
      if (result.success) {
        setAccount(result.data)
        showToast('success', 'Thành công', `Đã xóa quyền "${getRoleDisplayName(roleToDelete.name)}"`)
      } else {
        showToast('error', 'Lỗi', result.message || 'Không thể xóa quyền')
      }
    } catch (err) {
      showToast('error', 'Lỗi', 'Có lỗi xảy ra khi xóa quyền hạn')
    } finally {
      setRemovingRole(null)
      setShowDeleteConfirmation(false)
      setRoleToDelete(null)
    }
  }
  
  const cancelRemoveRole = () => {
    setShowDeleteConfirmation(false)
    setRoleToDelete(null)
  }

  // --- RENDER LOGIC ---
  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>
  }

  if (error) {
    return <div className="account-detail-container"><div className="alert alert-danger"><i className="bi bi-exclamation-triangle me-2"></i>{error}</div><button className="btn btn-primary" onClick={() => navigate('/account')}><i className="bi bi-arrow-left me-2"></i>Quay lại</button></div>
  }

  if (!account) {
    return <div className="account-detail-container"><div className="alert alert-warning"><i className="bi bi-info-circle me-2"></i>Không tìm thấy thông tin tài khoản.</div></div>
  }

  return (
    <div className="account-detail-container">
      <div className="account-detail-wrapper">
        {/* --- NEW INTEGRATED HEADER --- */}
        <div className="account-detail-header-integrated">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/account">Quản lý tài khoản</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Chi tiết tài khoản</li>
            </ol>
          </nav>
          <h1><i className="bi bi-person-vcard"></i>Chi tiết tài khoản</h1>
        </div>
        
        <div className="account-detail-body">
          {/* --- NEW 2-COLUMN GRID LAYOUT --- */}
          <div className="account-detail-grid">

            {/* --- LEFT COLUMN: PROFILE SUMMARY --- */}
            <div className="profile-summary-card">
              <div className="profile-avatar">{getInitials(account.fullname, account.username)}</div>
              <div className="profile-name">{account.fullname || account.username}</div>
              <div className="profile-username">@{account.username}</div>
              <div className="profile-status">
                <span className={`status-badge ${account.enabled ? 'active' : 'inactive'}`}>
                  <i className={`bi ${account.enabled ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                  {account.enabled ? 'Hoạt động' : 'Tạm dừng'}
                </span>
              </div>
              <div className="detail-action-buttons">
                <Link to={`/account/edit/${account.id}`} className="detail-action-btn primary">
                  <i className="bi bi-pencil-square"></i> Chỉnh sửa
                </Link>
                <button className={`detail-action-btn ${account.enabled ? 'danger' : 'primary'}`} onClick={handleToggleStatus}>
                  <i className={`bi ${account.enabled ? 'bi-pause-circle' : 'bi-play-circle'}`}></i>
                  {account.enabled ? 'Vô hiệu hóa' : 'Kích hoạt'}
                </button>
                <button className="detail-action-btn secondary" onClick={() => navigate('/account')}>
                  <i className="bi bi-arrow-left"></i> Quay lại
                </button>
              </div>
            </div>

            {/* --- RIGHT COLUMN: DETAILED INFO --- */}
            <div className="d-flex flex-column gap-4">
              {/* Personal Information Card */}
              <div className="info-card">
                <div className="info-card-header">
                  <h3 className="info-card-title"><i className="bi bi-person-lines-fill"></i>Thông tin cá nhân</h3>
                </div>
                <div className="info-card-body">
                  <div className="personal-info-grid">
                    <div className="info-item"><div className="info-label"><i className="bi bi-envelope"></i>Email</div><div className={`info-value ${!account.email && 'empty'}`}>{account.email || 'Chưa cập nhật'}</div></div>
                    <div className="info-item"><div className="info-label"><i className="bi bi-telephone"></i>Số điện thoại</div><div className={`info-value ${!account.phone && 'empty'}`}>{account.phone || 'Chưa cập nhật'}</div></div>
                    <div className="info-item"><div className="info-label"><i className="bi bi-gender-ambiguous"></i>Giới tính</div><div className={`info-value ${!account.gender && 'empty'}`}>{account.gender?.toLowerCase() === 'male' ? 'Nam' : account.gender?.toLowerCase() === 'female' ? 'Nữ' : account.gender?.toLowerCase() === 'other' ? 'Khác' : 'Chưa cập nhật'}</div></div>
                    <div className="info-item"><div className="info-label"><i className="bi bi-calendar-heart"></i>Ngày sinh</div><div className={`info-value ${!account.birthday && 'empty'}`}>{formatBirthday(account.birthday)}</div></div>
                    <div className="info-item"><div className="info-label"><i className="bi bi-calendar-plus"></i>Ngày tạo</div><div className="info-value">{formatDate(account.createdAt)}</div></div>
                    <div className="info-item"><div className="info-label"><i className="bi bi-arrow-clockwise"></i>Cập nhật</div><div className="info-value">{formatDate(account.updatedAt)}</div></div>
                  </div>
                </div>
              </div>

              {/* Roles and Permissions Card */}
              <div className="info-card">
                <div className="info-card-header">
                  <h3 className="info-card-title"><i className="bi bi-shield-check"></i>Vai trò và quyền hạn</h3>
                  <button className="add-role-btn" onClick={() => setShowAddRoleModal(true)} title="Thêm quyền hạn">
                    <i className="bi bi-plus-circle"></i> Thêm quyền
                  </button>
                </div>
                <div className="info-card-body">
                  {account.authorities && account.authorities.length > 0 ? (
                    <div className="roles-grid">
                      {account.authorities.map((authority) => (
                        <div key={authority.id} className="role-card">
                          <div className="role-icon-wrapper"><i className={getRoleIcon(authority.name)}></i></div>
                          <div className="role-info">
                            <div className="role-name">{getRoleDisplayName(authority.name)}</div>
                            <div className="role-description">{getRoleDescription(authority.name)}</div>
                          </div>
                          {account.authorities.length > 1 && (
                            <button className="remove-role-btn" onClick={() => handleRemoveRole(authority)} disabled={removingRole === authority.name} title={`Xóa quyền ${getRoleDisplayName(authority.name)}`}>
                              {removingRole === authority.name ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-x"></i>}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-roles">
                      <i className="bi bi-shield-x"></i>
                      <h5>Chưa được phân quyền</h5>
                      <p>Tài khoản này chưa có vai trò nào trong hệ thống.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS & TOASTS (UNCHANGED LOGIC) --- */}
      <AddRoleModal show={showAddRoleModal} onHide={() => setShowAddRoleModal(false)} onAddRole={handleAddRole} userRoles={account.authorities || []} loading={addingRole} />
      {showDeleteConfirmation && roleToDelete && (
        <div className="modal-overlay" onClick={cancelRemoveRole}>
          <div className="delete-confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h4 className="modal-title"><i className="bi bi-exclamation-triangle me-2 text-warning"></i>Xác nhận xóa quyền</h4></div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa quyền <strong>"{getRoleDisplayName(roleToDelete.name)}"</strong> khỏi tài khoản <strong>"{account.username}"</strong>?</p>
              <p className="text-muted mb-0">Hành động này không thể hoàn tác.</p>
            </div>
            <div className="modal-footer">
              <button className="modal-btn modal-btn-secondary" onClick={cancelRemoveRole} disabled={removingRole === roleToDelete.name}>Hủy</button>
              <button className="modal-btn modal-btn-danger" onClick={confirmRemoveRole} disabled={removingRole === roleToDelete.name}>
                {removingRole === roleToDelete.name ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang xóa...</> : <><i className="bi bi-trash me-2"></i>Xóa quyền</>}
              </button>
            </div>
          </div>
        </div>
      )}
      <Toast show={toast.show} onHide={hideToast} type={toast.type} title={toast.title} message={toast.message} />
    </div>
  )
};

// <<< THAY ĐỔI: Bọc component bằng HOC và export
export default withAuthorization(AccountDetail, ['SYSTEM']);