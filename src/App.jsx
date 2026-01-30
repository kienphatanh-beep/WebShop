import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// Import Layout
import MainLayout from './layouts/MainLayout';
import OrdersPage from './pages/OrdersPage';
// Import Pages
import ShopPage from './pages/ShopPage';                
import ProductDetailPage from './pages/ProductDetailPage'; 
import LoginPage from './pages/LoginPage';              
import RegisterPage from './pages/RegisterPage';        
import CartPage from './pages/CartPage'; // <--- Hệ thống sẽ tự tìm CartPage.jsx
import Shop from './pages/Shop';
import ProfilePage from './pages/ProfilePage'; // Import trang mới

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    background: { default: '#f4f6f8' },
  },
  typography: { fontFamily: '"Inter", sans-serif' },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<ShopPage />} />
            <Route path="products/:productId" element={<ProductDetailPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            
            {/* Đường dẫn giỏ hàng */}
            <Route path="cart" element={<CartPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="shop" element={<Shop />} />
            <Route path="profile" element={<ProfilePage />} />
            

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;