import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import accountService from '@/services/accountService';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import Toast from '@/components/Toast';
import withAuthorization from '@/components/HOC/withAuthorization.jsx';
import './Account.css';

const AccountsManagement = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [accountsPerPage, setAccountsPerPage] = useState(10);
  
  // <<< State cho các input trên form, người dùng có thể gõ tự do
  const [searchInputs, setSearchInputs] = useState({
    username: '',
    email: '',
    enabled: '',
    role: '',
  });

  // <<< State cho các filter đã được áp dụng sau khi nhấn nút "Tìm kiếm"
  const [appliedFilters, setAppliedFilters] = useState(null);

  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  
  const [toast, setToast] = useState({ show: false, type: 'success', title: '', message: '' });
  
  const [paginationInfo, setPaginationInfo] = useState({ totalElements: 0, totalPages: 0, size: 10, number: 0, first: true, last: true });

  // <<< Hàm loadAccounts giờ chỉ phụ thuộc vào phân trang và filter đã áp dụng
  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      // Chỉ tìm kiếm khi có filter đã được áp dụng
      if (appliedFilters) {
        result = await accountService.searchAccounts(appliedFilters);
      } else {
        result = await accountService.getAllAccounts();
      }

      if (result.success) {
        const allAccounts = result.data || [];
        // Phân trang luôn được thực hiện ở client để đơn giản hóa logic
        const startIndex = (currentPage - 1) * accountsPerPage;
        const endIndex = startIndex + accountsPerPage;
        const paginatedAccounts = allAccounts.slice(startIndex, endIndex);
        
        setAccounts(paginatedAccounts);
        setPaginationInfo({
          totalElements: allAccounts.length,
          totalPages: Math.ceil(allAccounts.length / accountsPerPage),
          size: accountsPerPage,
          number: currentPage - 1,
          first: currentPage === 1,
          last: currentPage >= Math.ceil(allAccounts.length / accountsPerPage),
        });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, [currentPage, accountsPerPage, appliedFilters]); // <<< Chỉ phụ thuộc vào các giá trị này

  // <<< useEffect chính chỉ lắng nghe sự thay đổi của các dependency này
  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]); // loadAccounts đã chứa đủ dependency cần thiết


  // <<< Khi nhấn nút "Tìm kiếm"
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm mới
    setAppliedFilters(searchInputs); // Áp dụng filter từ input
  };

  // <<< Khi nhấn nút "Reset"
  const handleClearSearch = () => {
    setCurrentPage(1);
    setSearchInputs({ username: '', email: '', enabled: '', role: '' });
    setAppliedFilters(null); // Xóa filter đã áp dụng
  };

  // --- Các hàm xử lý còn lại giữ nguyên ---
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }, [])

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

  const handleDeleteClick = useCallback((account) => {
    setAccountToDelete(account)
    setShowDeleteModal(true)
  }, [])

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteModal(false)
    setAccountToDelete(null)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!accountToDelete) return

    setDeleting(true)
    try {
      const result = await accountService.deleteAccount(accountToDelete.id)
      
      if (result.success) {
        showToast('success', 'Thành công', `Đã xóa tài khoản "${accountToDelete.username}"`)
        loadAccounts(); // Tải lại dữ liệu sau khi xóa
      } else {
        showToast('error', 'Lỗi', result.message || 'Không thể xóa tài khoản')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      showToast('error', 'Lỗi', 'Có lỗi xảy ra khi xóa tài khoản')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
      setAccountToDelete(null)
    }
  }, [accountToDelete, showToast, loadAccounts])

  const handleToggleStatus = useCallback(async (account) => {
    try {
      const result = await accountService.toggleAccountStatus(account.id, !account.enabled)
      if (result.success) {
        setAccounts(prev => prev.map(acc => 
          acc.id === account.id 
            ? { ...acc, enabled: !acc.enabled }
            : acc
        ))
        showToast('success', 'Thành công', 
          `Đã ${account.enabled ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản "${account.username}"`
        )
      } else {
        showToast('error', 'Lỗi', result.message || 'Không thể thay đổi trạng thái tài khoản')
      }
    } catch (error) {
      let errorMessage = 'Có lỗi xảy ra khi thay đổi trạng thái tài khoản'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      showToast('error', 'Lỗi', errorMessage)
    }
  }, [showToast])

  const paginationData = useMemo(() => {
    return {
      indexOfFirstAccount: paginationInfo.number * paginationInfo.size,
      indexOfLastAccount: Math.min((paginationInfo.number * paginationInfo.size) + paginationInfo.size, paginationInfo.totalElements),
      currentAccounts: accounts,
      totalPages: paginationInfo.totalPages,
      totalElements: paginationInfo.totalElements
    }
  }, [accounts, paginationInfo])

  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber)
  }, [])

  const handleAccountsPerPageChange = useCallback((newPerPage) => {
    setAccountsPerPage(newPerPage)
    setCurrentPage(1)
  }, [])

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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-100">
      <div className="d-flex justify-content-between align-items-center mb-4 px-3">
        <div>
          <h2 className="mb-0">Quản lý tài khoản</h2>
          {appliedFilters && ( // <<< Hiển thị thông báo khi đang ở chế độ tìm kiếm
            <small className="text-muted">
              <i className="bi bi-search me-1"></i>
              Kết quả tìm kiếm: {paginationInfo.totalElements} tài khoản
            </small>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/account/add')}>
          <i className="bi bi-plus-lg me-2"></i>
          Thêm tài khoản
        </button>
      </div>

      <div className="w-100 px-3 mb-4">
        <div className="card">
          <div className="card-body">
            {/* <<< form onSubmit giờ gọi handleSearchSubmit */}
            <form onSubmit={handleSearchSubmit}>
              <div className="row g-3">
                <div className="col-md-3">
                  <label htmlFor="username" className="form-label">Tên đăng nhập</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    value={searchInputs.username} // <<< Sử dụng state searchInputs
                    onChange={(e) => setSearchInputs(prev => ({ ...prev, username: e.target.value }))} // <<< Cập nhật state searchInputs
                    placeholder="Tìm theo tên đăng nhập..."
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={searchInputs.email} // <<< Sử dụng state searchInputs
                    onChange={(e) => setSearchInputs(prev => ({ ...prev, email: e.target.value }))} // <<< Cập nhật state searchInputs
                    placeholder="Tìm theo email..."
                  />
                </div>
                <div className="col-md-2">
                  <label htmlFor="enabled" className="form-label">Trạng thái</label>
                  <select
                    className="form-select"
                    id="enabled"
                    value={searchInputs.enabled} // <<< Sử dụng state searchInputs
                    onChange={(e) => setSearchInputs(prev => ({ ...prev, enabled: e.target.value }))} // <<< Cập nhật state searchInputs
                  >
                    <option value="">Tất cả</option>
                    <option value="true">Hoạt động</option>
                    <option value="false">Tạm dừng</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label htmlFor="role" className="form-label">Vai trò</label>
                  <input
                    type="text"
                    className="form-control"
                    id="role"
                    value={searchInputs.role} // <<< Sử dụng state searchInputs
                    onChange={(e) => setSearchInputs(prev => ({ ...prev, role: e.target.value }))} // <<< Cập nhật state searchInputs
                    placeholder="Vai trò..."
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end gap-2">
                  <button type="submit" className="btn btn-primary search-btn-large">
                    <i className="bi bi-search me-1"></i>
                    Tìm kiếm
                  </button>
                  <button type="button" className="btn btn-outline-secondary search-btn-large" onClick={handleClearSearch}>
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Reset
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* ...Phần còn lại của JSX giữ nguyên... */}
      <div className="w-100">
        {accounts.length === 0 && !loading ? (
          <div className="text-center py-5">
            <i className="bi bi-person-x fs-1 text-muted mb-3 d-block"></i>
            <h4 className="text-muted">Không tìm thấy tài khoản</h4>
            <p className="text-muted">
              Không có tài khoản nào được tìm thấy với tiêu chí này.
            </p>
          </div>
        ) : (
          <>
            <div className="table-responsive w-100">
              <table className="table align-middle accounts-table w-100">
                <thead className="table-primary">
                  <tr>
                    <th scope="col" className="text-center" style={{ width: '60px' }}>STT</th>
                    <th scope="col" style={{ minWidth: '120px' }}><i className="bi bi-person text-primary"></i> Tên đăng nhập</th>
                    <th scope="col" style={{ minWidth: '140px' }}><i className="bi bi-envelope text-primary"></i> Email</th>
                    <th scope="col" className="text-center" style={{ width: '110px' }}><i className="bi bi-check-circle text-primary"></i> Trạng thái</th>
                    <th scope="col" className="text-center" style={{ width: '140px' }}><i className="bi bi-calendar-plus text-primary"></i> Ngày tạo</th>
                    <th scope="col" className="text-center" style={{ width: '140px' }}><i className="bi bi-arrow-clockwise text-primary"></i> Cập nhật</th>
                    <th scope="col" className="text-center" style={{ width: '140px' }}><i className="bi bi-gear text-primary"></i> Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account, index) => {
                    const createdDate = formatDate(account.createdAt);
                    const updatedDate = formatDate(account.updatedAt);
                    
                    return (
                      <tr key={account.id} className="account-row">
                        <td className="text-center"><span className="fw-bold">{paginationData.indexOfFirstAccount + index + 1}</span></td>
                        <td><div className="account-info"><h6 className="account-username mb-0">{account.username}</h6></div></td>
                        <td><div className="account-email"><span className="email-value">{account.email}</span></div></td>
                        <td className="text-center"><span className={`badge status-badge ${account.enabled ? 'bg-success-subtle text-success-emphasis' : 'bg-danger-subtle text-danger-emphasis'} px-3 py-2 rounded-pill`}><i className={`bi ${account.enabled ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>{account.enabled ? 'Hoạt động' : 'Tạm dừng'}</span></td>
                        <td className="text-center"><div className="date-container"><span className="date-value fw-medium">{createdDate.date}</span><small className="d-block text-muted">{createdDate.time}</small></div></td>
                        <td className="text-center"><div className="date-container"><span className="date-value fw-medium">{updatedDate.date}</span><small className="d-block text-muted">{updatedDate.time}{account.updatedAt !== account.createdAt && (<i className="bi bi-arrow-clockwise text-warning ms-1" title="Đã cập nhật"></i>)}</small></div></td>
                        <td className="text-center">
                          <div className="action-buttons">
                            <button className="btn btn-outline-info btn-sm action-btn" title="Xem chi tiết" onClick={() => {navigate(`/account/detail/${account.id}`)}}><i className="bi bi-eye"></i></button>
                            <button className="btn btn-outline-warning btn-sm action-btn" title="Chỉnh sửa" onClick={() => {navigate(`/account/edit/${account.id}`)}}><i className="bi bi-pencil"></i></button>
                            <button className={`btn btn-outline-${account.enabled ? 'secondary' : 'success'} btn-sm action-btn`} title={account.enabled ? 'Vô hiệu hóa' : 'Kích hoạt'} onClick={() => handleToggleStatus(account)}><i className={`bi ${account.enabled ? 'bi-pause' : 'bi-play'}`}></i></button>
                            <button className="btn btn-outline-danger btn-sm action-btn" title="Xóa" onClick={() => handleDeleteClick(account)}><i className="bi bi-trash"></i></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            
            {paginationData && paginationData.totalPages > 0 && (
              <div className="pagination-container">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="pagination-status">
                    <div className="text-muted">Hiển thị {paginationData.indexOfFirstAccount + 1} - {paginationData.indexOfLastAccount} của {paginationData.totalElements} tài khoản</div>
                    <div className="d-flex align-items-center gap-2">
                      <label htmlFor="accountsPerPage" className="form-label mb-0 text-muted small">Hiển thị:</label>
                      <select id="accountsPerPage" className="form-select form-select-sm" style={{ width: 'auto' }} value={accountsPerPage} onChange={(e) => handleAccountsPerPageChange(parseInt(e.target.value))}>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-muted small">mục/trang</span>
                    </div>
                  </div>
                  
                  <div className="pagination-controls">
                    <div className="pagination-info">Trang {currentPage} / {paginationData.totalPages}</div>
                    {paginationData.totalPages > 1 && (
                      <nav aria-label="Account pagination">
                        <ul className="pagination pagination-sm mb-0">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => handlePageChange(1)} disabled={currentPage === 1} title="Trang đầu"><i className="bi bi-chevron-double-left"></i></button></li>
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} title="Trang trước"><i className="bi bi-chevron-left"></i></button></li>
                          {getPaginationItems.map((page) => (<li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}><button className="page-link" onClick={() => handlePageChange(page)}>{page}</button></li>))}
                          <li className={`page-item ${currentPage === paginationData.totalPages ? 'disabled' : ''}`}><button className="page-link" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === paginationData.totalPages} title="Trang sau"><i className="bi bi-chevron-right"></i></button></li>
                          <li className={`page-item ${currentPage === paginationData.totalPages ? 'disabled' : ''}`}><button className="page-link" onClick={() => handlePageChange(paginationData.totalPages)} disabled={currentPage === paginationData.totalPages} title="Trang cuối"><i className="bi bi-chevron-double-right"></i></button></li>
                        </ul>
                      </nav>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <DeleteConfirmationModal show={showDeleteModal} onHide={handleDeleteCancel} onConfirm={handleDeleteConfirm} itemName={accountToDelete?.username || ''} type="account" loading={deleting} />
      <Toast show={toast.show} onHide={hideToast} type={toast.type} title={toast.title} message={toast.message} />
    </div>
  );
};

export default withAuthorization(AccountsManagement, ['SYSTEM']);