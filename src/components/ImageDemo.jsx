import React from 'react'

// Import image using ES6 modules (recommended for src/assets)
import logo from '@/assets/images/logo/logo1.jpg'

const ImageDemo = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>🖼️ Hướng dẫn sử dụng Images trong React + Vite</h2>
      
      <div style={{ marginBottom: '30px' }}>
        <h3>1. Sử dụng từ src/assets (Recommended) ✅</h3>
        <p>Import ES6 modules - Vite sẽ optimize và hash filename:</p>
        <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px', margin: '10px 0' }}>
          <code>import logo from '@/assets/images/logo/logo1.jpg'</code>
        </div>
        <img 
          src={logo} 
          alt="Logo from assets" 
          style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>2. Sử dụng từ public folder 🔗</h3>
        <p>Direct path - file phải có trong public/ folder:</p>
        <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px', margin: '10px 0' }}>
          <code>&lt;img src="/vite.svg" /&gt;</code>
        </div>
        <img 
          src="/vite.svg" 
          alt="Vite logo from public" 
          style={{ width: '50px', height: '50px' }}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>3. Các cách khác 📝</h3>
        
        <h4>Sử dụng từ src/assets với path trực tiếp:</h4>
        <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px', margin: '10px 0' }}>
          <code>&lt;img src="/src/assets/images/logo/logo1.jpg" /&gt;</code>
        </div>
        <img 
          src="/src/assets/images/logo/logo1.jpg" 
          alt="Logo direct path" 
          style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
        />

        <h4>Sử dụng new URL() (Dynamic imports):</h4>
        <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px', margin: '10px 0' }}>
          <code>new URL('@/assets/images/logo/logo1.jpg', import.meta.url).href</code>
        </div>
        <img 
          src={new URL('@/assets/images/logo/logo1.jpg', import.meta.url).href} 
          alt="Logo via URL" 
          style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
        />
      </div>

      <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px' }}>
        <h3>💡 Best Practices:</h3>
        <ul>
          <li><strong>src/assets/</strong> - Cho images được import trong components (được optimize bởi Vite)</li>
          <li><strong>public/</strong> - Cho static assets không thay đổi (favicon, manifest, etc.)</li>
          <li><strong>Alias @</strong> - Đã được config trong vite.config.js để import dễ dàng</li>
          <li><strong>Formats</strong> - Hỗ trợ: .jpg, .jpeg, .png, .gif, .svg, .webp</li>
        </ul>
      </div>

      <div style={{ background: '#f3e5f5', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
        <h3>📁 Cấu trúc thư mục hiện tại:</h3>
        <pre style={{ background: '#fff', padding: '10px', borderRadius: '4px' }}>
{`src/
  assets/
    images/
      logo/
        logo1.jpg ✅
      a/
    fonts/
    styles/
public/
  vite.svg ✅`}
        </pre>
      </div>
    </div>
  )
}

export default ImageDemo 