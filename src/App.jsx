// src/App.jsx

import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AppRoutes from './routes'; // Import component routes chính
import './App.css';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Logic khởi tạo ứng dụng (nếu có)
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;