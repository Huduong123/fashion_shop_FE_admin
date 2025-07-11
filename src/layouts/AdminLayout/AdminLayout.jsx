import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import authService from '@/services/authService'
import { decodeJWT } from '@/utils/auth'
import './AdminLayout.css'

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [hasSystemRole, setHasSystemRole] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Get current user info
    const userInfo = authService.getCurrentUser()
    setCurrentUser(userInfo)
    // Check SYSTEM role from JWT
    const token = localStorage.getItem('accessToken')
    if (token) {
      const decoded = decodeJWT(token)
      // Roles may be in decoded.authorities or decoded.roles or decoded.role
      // Accept both array or string
      let roles = []
      if (decoded) {
        if (Array.isArray(decoded.authorities)) roles = decoded.authorities
        else if (Array.isArray(decoded.roles)) roles = decoded.roles
        else if (typeof decoded.authorities === 'string') roles = [decoded.authorities]
        else if (typeof decoded.roles === 'string') roles = [decoded.roles]
        else if (decoded.role) roles = [decoded.role]
      }
      setHasSystemRole(roles.some(r => r === 'ROLE_SYSTEM' || r === 'SYSTEM'))
    } else {
      setHasSystemRole(false)
    }
  }, [])

  const handleLogout = () => {
    authService.logout()
    navigate('/login', { replace: true })
  }

  const menuItems = [
    {
      title: 'GENERAL',
      items: [
        { name: 'Dashboard', icon: 'bi-speedometer2', path: '/dashboard' },
        { name: 'Products', icon: 'bi-box-seam', path: '/products' },
        { name: 'Category', icon: 'bi-folder', path: '/categories' },
        { name: 'Inventory', icon: 'bi-clipboard-data', path: '/inventory' },
        { name: 'Orders', icon: 'bi-cart3', path: '/orders' },
        { name: 'Purchases', icon: 'bi-cash-coin', path: '/purchases' },
        { name: 'Attributes', icon: 'bi-tags', path: '/attributes' },
        { name: 'Invoices', icon: 'bi-file-earmark-text', path: '/invoices' },
        { name: 'Settings', icon: 'bi-gear', path: '/settings' }
      ]
    },
    {
      title: 'USERS',
      items: [
        ...(hasSystemRole ? [{ name: 'Account', icon: 'bi-person', path: '/account' }] : []),
        { name: 'Roles', icon: 'bi-people', path: '/roles' },
        { name: 'Permissions', icon: 'bi-shield-lock', path: '/permissions' },
        { name: 'Customers', icon: 'bi-person-badge', path: '/customers' },
        { name: 'Sellers', icon: 'bi-shop', path: '/sellers' }
      ]
    },
    {
      title: 'OTHER',
      items: [
        { name: 'Coupons', icon: 'bi-ticket-perforated', path: '/coupons' },
        { name: 'Reviews', icon: 'bi-star', path: '/reviews' }
      ]
    }
  ]

  return (
    <div className="d-flex admin-layout-bootstrap">
      {/* Sidebar */}
      <nav className={`sidebar-bootstrap ${sidebarCollapsed ? 'collapsed' : ''} bg-white border-end shadow-sm`}>
        {/* Logo Section */}
        <div className="sidebar-header-bootstrap d-flex align-items-center p-3 border-bottom bg-primary">
          <div className="d-flex align-items-center w-100">
            <div className={`logo-icon-bootstrap ${!sidebarCollapsed ? 'me-3' : ''}`}>
              <img src="/src/assets/images/logo/logo1.jpg" alt="Logo" className="logo-image-bootstrap" />
            </div>
                         {!sidebarCollapsed && (
               <h5 className="text-white mb-0 fw-bold logo-text-clear">NTA GROUP</h5>
             )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="sidebar-nav-bootstrap p-2">
          {menuItems.map((section, index) => (
            <div key={index} className="nav-section-bootstrap mb-4">
              {!sidebarCollapsed && (
                <h6 className="nav-section-title text-muted text-uppercase fw-bold px-3 mb-2" style={{fontSize: '0.75rem', letterSpacing: '1px'}}>
                  {section.title}
                </h6>
              )}
              <ul className="list-unstyled mb-0">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="nav-item-bootstrap mb-1">
                    {/* Main menu item */}
                    <button 
                      className={`btn nav-link-bootstrap d-flex align-items-center w-100 text-start border-0 rounded-2 ${location.pathname === item.path || location.pathname.startsWith(item.path + '/') ? 'active bg-primary text-white' : 'text-dark'}`}
                      onClick={() => navigate(item.path)}
                    >
                      <i className={`${item.icon} me-3`} style={{fontSize: '1.1rem'}}></i>
                      {!sidebarCollapsed && (
                        <span className="nav-text-bootstrap">{item.name}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content-bootstrap flex-grow-1 d-flex flex-column">
        {/* Header */}
        <header className="header-bootstrap bg-white border-bottom shadow-sm px-4 py-3" style={{overflow: 'visible', zIndex: 100}}>
          <div className="d-flex justify-content-between align-items-center">
            {/* Left Side */}
            <div className="d-flex align-items-center">
              <button 
                className="btn btn-outline-secondary me-4 border-0"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <i className="bi-list" style={{fontSize: '1.2rem'}}></i>
              </button>
              
              <div className="search-container-bootstrap">
                <div className="input-group" style={{width: '350px'}}>
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi-search text-muted"></i>
                  </span>
                  <input 
                    type="text" 
                    className="form-control border-start-0 bg-light" 
                    placeholder="Search..."
                    style={{boxShadow: 'none'}}
                  />
                </div>
              </div>
            </div>

            {/* Right Side */}
            <div className="d-flex align-items-center position-relative">
              <button className="btn btn-outline-secondary me-2 border-0 position-relative">
                <i className="bi-moon" style={{fontSize: '1.1rem'}}></i>
              </button>
              
              <button className="btn btn-outline-secondary me-2 border-0 position-relative">
                <i className="bi-bell" style={{fontSize: '1.1rem'}}></i>
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize: '0.6rem'}}>
                  1
                </span>
              </button>
              
              <button className="btn btn-outline-secondary me-2 border-0">
                <i className="bi-gear" style={{fontSize: '1.1rem'}}></i>
              </button>
              
              <button className="btn btn-outline-secondary me-3 border-0">
                <i className="bi-question-circle" style={{fontSize: '1.1rem'}}></i>
              </button>
              
                             {/* User Dropdown */}
               <div className="dropdown position-relative user-dropdown-container">
                <button 
                  className="btn p-0 border-0"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  data-bs-toggle="dropdown"
                >
                  <img 
                    src="https://via.placeholder.com/40" 
                    alt="User" 
                    className="rounded-circle"
                    style={{width: '40px', height: '40px'}}
                  />
                </button>
                <ul className={`dropdown-menu dropdown-menu-start user-dropdown-custom ${userDropdownOpen ? 'show' : ''}`}>
                  <li><h6 className="dropdown-header">{currentUser?.username || 'Admin User'}</h6></li>
                  <li><button className="dropdown-item" onClick={() => navigate('/profile')}><i className="bi-person me-2"></i>Profile</button></li>
                  <li><button className="dropdown-item" onClick={() => navigate('/settings')}><i className="bi-gear me-2"></i>Settings</button></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content-bootstrap flex-grow-1 p-4 bg-light">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout 