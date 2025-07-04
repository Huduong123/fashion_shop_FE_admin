import React, { useState, useEffect } from 'react'
import authService from '@/services/authService'
import './Dashboard.css'

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const userInfo = authService.getCurrentUser()
    setCurrentUser(userInfo)
  }, [])
  return (
    <div className="dashboard-bootstrap">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2 fw-bold text-primary">
                Welcome back, {currentUser?.username || 'Admin'}! 👋
              </h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <a href="#" className="text-decoration-none">Fashion Shop</a>
                  </li>
                  <li className="breadcrumb-item active text-primary" aria-current="page">
                    Dashboard
                  </li>
                </ol>
              </nav>
              <p className="text-muted mb-0">Here's what's happening with your store today.</p>
            </div>
            <button className="btn btn-primary">
              <i className="bi-plus-circle me-2"></i>New Report
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="card stat-card-bootstrap border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="stat-icon-bootstrap bg-primary bg-gradient rounded-3 me-3">
                  <i className="bi-cart3 text-white fs-4"></i>
                </div>
                <div className="flex-grow-1">
                  <h6 className="text-muted text-uppercase mb-1 fw-bold" style={{fontSize: '0.75rem', letterSpacing: '1px'}}>
                    Total Orders
                  </h6>
                  <h3 className="mb-0 fw-bold text-dark">15,432</h3>
                  <small className="text-success fw-semibold">
                    <i className="bi-arrow-up"></i> +12.5%
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="card stat-card-bootstrap border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="stat-icon-bootstrap bg-success bg-gradient rounded-3 me-3">
                  <i className="bi-graph-up text-white fs-4"></i>
                </div>
                <div className="flex-grow-1">
                  <h6 className="text-muted text-uppercase mb-1 fw-bold" style={{fontSize: '0.75rem', letterSpacing: '1px'}}>
                    New Leads
                  </h6>
                  <h3 className="mb-0 fw-bold text-dark">12,983</h3>
                  <small className="text-success fw-semibold">
                    <i className="bi-arrow-up"></i> +8.2%
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="card stat-card-bootstrap border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="stat-icon-bootstrap bg-warning bg-gradient rounded-3 me-3">
                  <i className="bi-handshake text-white fs-4"></i>
                </div>
                <div className="flex-grow-1">
                  <h6 className="text-muted text-uppercase mb-1 fw-bold" style={{fontSize: '0.75rem', letterSpacing: '1px'}}>
                    Deals
                  </h6>
                  <h3 className="mb-0 fw-bold text-dark">1,283</h3>
                  <small className="text-danger fw-semibold">
                    <i className="bi-arrow-down"></i> -2.1%
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="card stat-card-bootstrap border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="stat-icon-bootstrap bg-info bg-gradient rounded-3 me-3">
                  <i className="bi-currency-dollar text-white fs-4"></i>
                </div>
                <div className="flex-grow-1">
                  <h6 className="text-muted text-uppercase mb-1 fw-bold" style={{fontSize: '0.75rem', letterSpacing: '1px'}}>
                    Revenue
                  </h6>
                  <h3 className="mb-0 fw-bold text-dark">$234.8k</h3>
                  <small className="text-success fw-semibold">
                    <i className="bi-arrow-up"></i> +15.3%
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Performance */}
      <div className="row g-4 mb-4">
        {/* Chart Section */}
        <div className="col-xl-8 col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0 fw-bold text-dark">Product Performance</h5>
                <div className="btn-group" role="group">
                  <input type="radio" className="btn-check" name="chartFilter" id="all" autoComplete="off" defaultChecked />
                  <label className="btn btn-outline-primary btn-sm" htmlFor="all">ALL</label>

                  <input type="radio" className="btn-check" name="chartFilter" id="1m" autoComplete="off" />
                  <label className="btn btn-outline-primary btn-sm" htmlFor="1m">1M</label>

                  <input type="radio" className="btn-check" name="chartFilter" id="6m" autoComplete="off" />
                  <label className="btn btn-outline-primary btn-sm" htmlFor="6m">6M</label>

                  <input type="radio" className="btn-check" name="chartFilter" id="1y" autoComplete="off" />
                  <label className="btn btn-outline-primary btn-sm" htmlFor="1y">1Y</label>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="chart-placeholder-bootstrap d-flex align-items-end justify-content-center p-4 bg-light rounded">
                <div className="d-flex align-items-end gap-2" style={{height: '200px'}}>
                  {[60, 80, 45, 90, 70, 55, 85, 75, 65, 95, 50, 88].map((height, index) => (
                    <div 
                      key={index}
                      className="bar-bootstrap bg-primary rounded-top"
                      style={{
                        width: '20px',
                        height: `${height}%`,
                        transition: 'all 0.3s ease'
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance by Country */}
        <div className="col-xl-4 col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="card-title mb-0 fw-bold text-dark">Performance by Country</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="btn-group w-100" role="group">
                  <input type="radio" className="btn-check" name="countryFilter" id="allCountries" autoComplete="off" defaultChecked />
                  <label className="btn btn-primary btn-sm" htmlFor="allCountries">ALL</label>

                  <input type="radio" className="btn-check" name="countryFilter" id="1mCountries" autoComplete="off" />
                  <label className="btn btn-outline-primary btn-sm" htmlFor="1mCountries">1M</label>

                  <input type="radio" className="btn-check" name="countryFilter" id="6mCountries" autoComplete="off" />
                  <label className="btn btn-outline-primary btn-sm" htmlFor="6mCountries">6M</label>

                  <input type="radio" className="btn-check" name="countryFilter" id="1yCountries" autoComplete="off" />
                  <label className="btn btn-outline-primary btn-sm" htmlFor="1yCountries">1Y</label>
                </div>
              </div>

              <div className="country-stats-bootstrap">
                <div className="country-item-bootstrap d-flex align-items-center mb-3">
                  <span className="flag-bootstrap me-3 fs-5">🇺🇸</span>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-semibold">United States</span>
                      <span className="text-muted fw-bold">65%</span>
                    </div>
                    <div className="progress" style={{height: '8px'}}>
                      <div className="progress-bar bg-primary" style={{width: '65%'}}></div>
                    </div>
                  </div>
                </div>

                <div className="country-item-bootstrap d-flex align-items-center mb-3">
                  <span className="flag-bootstrap me-3 fs-5">🇷🇺</span>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-semibold">Russia</span>
                      <span className="text-muted fw-bold">48%</span>
                    </div>
                    <div className="progress" style={{height: '8px'}}>
                      <div className="progress-bar bg-primary" style={{width: '48%'}}></div>
                    </div>
                  </div>
                </div>

                <div className="country-item-bootstrap d-flex align-items-center mb-3">
                  <span className="flag-bootstrap me-3 fs-5">🇨🇳</span>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-semibold">China</span>
                      <span className="text-muted fw-bold">35%</span>
                    </div>
                    <div className="progress" style={{height: '8px'}}>
                      <div className="progress-bar bg-danger" style={{width: '35%'}}></div>
                    </div>
                  </div>
                </div>

                <div className="country-item-bootstrap d-flex align-items-center">
                  <span className="flag-bootstrap me-3 fs-5">🇨🇦</span>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-semibold">Canada</span>
                      <span className="text-muted fw-bold">20%</span>
                    </div>
                    <div className="progress" style={{height: '8px'}}>
                      <div className="progress-bar bg-success" style={{width: '20%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Products */}
      <div className="row g-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0 fw-bold text-dark">Trending Products</h5>
                <button className="btn btn-primary btn-sm">
                  <i className="bi-eye me-1"></i>View All
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {[
                  { name: 'Nike Air Force 1', status: 'hot', color: 'primary' },
                  { name: 'Adidas Ultraboost', status: 'trending', color: 'success' },
                  { name: 'Converse All Star', status: 'hot', color: 'primary' },
                  { name: 'Vans Old Skool', status: 'new', color: 'info' },
                  { name: 'Puma Suede Classic', status: 'trending', color: 'success' },
                  { name: 'New Balance 574', status: 'normal', color: 'secondary' },
                  { name: 'Jordan 1 Retro', status: 'hot', color: 'primary' },
                  { name: 'Reebok Classic', status: 'normal', color: 'secondary' },
                  { name: 'ASICS Gel-Kayano', status: 'trending', color: 'success' },
                  { name: 'Under Armour', status: 'new', color: 'info' }
                ].map((product, index) => (
                  <div key={index} className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
                    <div className={`card product-card-bootstrap border-0 bg-${product.color} bg-opacity-10 h-100`}>
                      <div className="card-body text-center p-3">
                        <div className={`badge bg-${product.color} mb-2`}>
                          {product.status.toUpperCase()}
                        </div>
                        <h6 className="card-title mb-0 fw-semibold" style={{fontSize: '0.875rem'}}>
                          {product.name}
                        </h6>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 