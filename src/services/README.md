# Authentication System Documentation

## Tổng quan
Hệ thống authentication sử dụng JWT token để xác thực người dùng với backend Java Spring Boot.

## Cấu trúc Files

### 1. `api.js`
- Cấu hình axios với base URL
- Interceptors tự động thêm JWT token vào headers
- Xử lý token expiration và redirect về login

### 2. `authService.js`
- **login(credentials)**: Đăng nhập với username/password
- **logout()**: Đăng xuất và xóa token
- **isAuthenticated()**: Kiểm tra trạng thái đăng nhập
- **getCurrentUser()**: Lấy thông tin user hiện tại
- **getAccessToken()**: Lấy JWT token
- **verifyToken()**: Verify token với backend

### 3. `../utils/auth.js`
- **decodeJWT(token)**: Decode JWT token
- **isTokenExpired(token)**: Kiểm tra token hết hạn
- **getUserFromToken(token)**: Lấy user info từ token
- **isValidSession()**: Kiểm tra session hợp lệ

### 4. `../components/ProtectedRoute.jsx`
- Component bảo vệ routes cần authentication
- Tự động redirect về login nếu chưa đăng nhập

## Cách sử dụng

### Đăng nhập
```javascript
import authService from '@/services/authService'

const handleLogin = async () => {
  try {
    const result = await authService.login({
      username: 'admin',
      password: 'password123'
    })
    
    if (result.success) {
      // Redirect to dashboard
      navigate('/dashboard')
    }
  } catch (error) {
    console.error('Login failed:', error.message)
  }
}
```

### Đăng xuất
```javascript
const handleLogout = () => {
  authService.logout()
  navigate('/login')
}
```

### Kiểm tra authentication
```javascript
if (authService.isAuthenticated()) {
  // User is logged in
} else {
  // Redirect to login
}
```

## API Endpoints

### Login
- **URL**: `POST /api/admin/login`
- **Body**: 
```json
{
  "username": "admin",
  "password": "password123"
}
```
- **Response Success**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "username": "admin",
    "role": "ADMIN"
  }
}
```

### Verify Token (Optional)
- **URL**: `GET /api/admin/verify-token`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 200 OK nếu token hợp lệ

## Local Storage Keys
- `accessToken`: JWT token
- `isLoggedIn`: Boolean flag
- `userInfo`: User information JSON

## Error Handling
- 401: Token expired/invalid → Auto logout + redirect
- 403: Access denied
- 404: Service not available
- 500: Server error
- Network error: Connection failed

## Security Features
- JWT token tự động expire
- Token validation trước khi API calls
- Secure token storage
- Auto logout khi token expired
- CORS protection 