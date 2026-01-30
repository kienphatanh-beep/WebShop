import React, { useEffect, useState, useCallback } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { 
    AppBar, Toolbar, Container, Box, InputBase, 
    IconButton, Button, Grid, Divider, Typography,
    Menu, MenuItem, Avatar, Badge, Tooltip 
} from '@mui/material';
import { 
    Search, ShoppingCart, Person, Facebook, Logout, Login, AppRegistration, AccountCircle
} from '@mui/icons-material';

import api from '../api/api'; 
import cartApi from '../api/cartApi'; 
import ChatAI from '../components/ChatAI'; // 🔥 Đã thêm: Import ChatAI
import '../css/MainLayout.css'; 

// --- HEADER ---
const Header = () => {
    const [categories, setCategories] = useState([]);
    const [cartCount, setCartCount] = useState(0); 
    const [searchTerm, setSearchTerm] = useState(""); 
    const navigate = useNavigate();
    
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

    const isLoggedIn = !!localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');

    // 1. Tải danh mục (Hỗ trợ HATEOAS)
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.getAllCategories();
                const categoryList = res._embedded ? res._embedded.categoryDTOList : (res.content || res);
                setCategories(Array.isArray(categoryList) ? categoryList : []);
            } catch (error) {
                console.error("Lỗi tải danh mục:", error);
            }
        };
        fetchCategories();
    }, []);

    // 2. Fetch Cart Count theo chuẩn HATEOAS
    const fetchCartCount = useCallback(async () => {
        if (isLoggedIn) {
            try {
                const cartData = await cartApi.getCart();
                const products = cartData.products || (cartData._embedded ? cartData._embedded.productDTOList : []);
                const totalQty = products.reduce((acc, item) => acc + item.quantity, 0) || 0;
                setCartCount(totalQty);
            } catch (error) {
                console.error("Lỗi đồng bộ Badge giỏ hàng:", error);
                if (error.response?.status === 401) setCartCount(0);
            }
        } else {
            setCartCount(0);
        }
    }, [isLoggedIn]);

    // 3. Lắng nghe sự kiện cập nhật giỏ hàng
    useEffect(() => {
        fetchCartCount(); 
        window.addEventListener("cartUpdated", fetchCartCount);
        return () => {
            window.removeEventListener("cartUpdated", fetchCartCount);
        };
    }, [fetchCartCount]);

    // 4. Xử lý tìm kiếm khi nhấn Enter
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter' && searchTerm.trim() !== "") {
            navigate(`/shop?keyword=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    const handleAccountClick = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleLogout = () => {
        handleMenuClose();
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            localStorage.clear();
            setCartCount(0);
            navigate('/');
            window.location.reload(); 
        }
    };

    return (
        <AppBar position="sticky" className="header-appbar">
            <Container maxWidth={false}>
                <Toolbar disableGutters className="header-toolbar">
                    <Link to="/" className="logo-text">
                        <span className="logo-icon">SD</span>
                        SHOPDUNK
                    </Link>

                    {/* Ô TÌM KIẾM */}
                    <Box className="search-container">
                        <div className="search-wrapper">
                            <IconButton 
                                sx={{ p: '10px' }} 
                                onClick={() => searchTerm && navigate(`/shop?keyword=${searchTerm}`)}
                            > 
                                <Search sx={{ color: '#666' }} /> 
                            </IconButton>
                            <InputBase 
                                placeholder="Bạn tìm gì..." 
                                className="search-input"
                                fullWidth
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                            />
                        </div>
                    </Box>

                    <Box className="header-actions">
                        {/* NÚT GIỎ HÀNG */}
                        <Button className="action-btn" onClick={() => navigate('/cart')}>
                            <Badge badgeContent={cartCount} color="error" showZero={false}>
                                <ShoppingCart />
                            </Badge>
                            <span className="action-text">Giỏ hàng</span>
                        </Button>
                        
                        {/* NÚT TÀI KHOẢN / AVATAR */}
                        <Tooltip title={isLoggedIn ? userEmail : "Tài khoản"}>
                            <IconButton 
                                onClick={handleAccountClick}
                                sx={{ 
                                    p: 0, 
                                    ml: 1, 
                                    border: isLoggedIn ? '2px solid #e0e0e0' : 'none',
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'scale(1.05)' }
                                }}
                            >
                                {isLoggedIn ? (
                                    <Avatar 
                                        sx={{ 
                                            width: 35, 
                                            height: 35, 
                                            bgcolor: '#1d1d1f', 
                                            fontSize: 14,
                                            fontWeight: 700
                                        }}
                                    >
                                        {userEmail?.charAt(0).toUpperCase()}
                                    </Avatar>
                                ) : (
                                    <Avatar sx={{ width: 35, height: 35, bgcolor: 'transparent' }}>
                                        <Person sx={{ color: '#1d1d1f', fontSize: 28 }} />
                                    </Avatar>
                                )}
                            </IconButton>
                        </Tooltip>

                        <Menu
                            anchorEl={anchorEl}
                            open={openMenu}
                            onClose={handleMenuClose}
                            PaperProps={{
                                elevation: 4,
                                sx: { 
                                    mt: 1.5, 
                                    minWidth: 220, 
                                    borderRadius: '16px',
                                    padding: '8px' 
                                }
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            {isLoggedIn ? [
                                <Box key="user-info" sx={{ px: 2, py: 1.5 }}>
                                    <Typography variant="subtitle2" noWrap fontWeight="bold">
                                        {userEmail?.split('@')[0]}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                        {userEmail}
                                    </Typography>
                                </Box>,
                                <Divider key="divider-1" sx={{ my: 1 }} />,
                                <MenuItem key="profile" onClick={() => { handleMenuClose(); navigate('/profile'); }} sx={{ borderRadius: '8px' }}>
                                    <AccountCircle sx={{ mr: 1.5, color: '#666' }} /> Thông tin cá nhân
                                </MenuItem>,
                                <MenuItem key="orders" onClick={() => { handleMenuClose(); navigate('/orders'); }} sx={{ borderRadius: '8px' }}>
                                    <ShoppingCart sx={{ mr: 1.5, color: '#666' }} /> Đơn hàng đã đặt
                                </MenuItem>,
                                <Divider key="divider-2" sx={{ my: 1 }} />,
                                <MenuItem key="logout" onClick={handleLogout} sx={{ color: 'error.main', borderRadius: '8px' }}>
                                    <Logout sx={{ mr: 1.5 }} /> Đăng xuất
                                </MenuItem>
                            ] : [
                                <MenuItem key="login" onClick={() => { handleMenuClose(); navigate('/login'); }} sx={{ borderRadius: '8px' }}>
                                    <Login sx={{ mr: 1.5, color: '#0066cc' }} /> Đăng nhập
                                </MenuItem>,
                                <MenuItem key="register" onClick={() => { handleMenuClose(); navigate('/register'); }} sx={{ borderRadius: '8px' }}>
                                    <AppRegistration sx={{ mr: 1.5, color: '#28a745' }} /> Đăng ký
                                </MenuItem>
                            ]}
                        </Menu>

                        <Box sx={{ ml: 2, fontSize: 18, fontWeight: 600, color: '#86868b', cursor: 'default' }}>2026 🇻🇳</Box>
                    </Box>
                </Toolbar>

                <Box className="menu-container">
                    <Link to="/shop" className="menu-link">Tất cả</Link>
                    {categories.length > 0 && categories.map((cat) => (
                        <Link 
                            key={cat.categoryId} 
                            to={`/shop?categoryId=${cat.categoryId}`} 
                            className="menu-link"
                        >
                            {cat.categoryName}
                        </Link>
                    ))}
                </Box>
            </Container>
        </AppBar>
    );
};

// --- FOOTER ---
const Footer = () => {
    return (
        <Box className="footer-container">
            <Container maxWidth={false}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" className="footer-title">SHOPDUNK</Typography>
                        <Typography variant="body2" paragraph>
                            Đại lý ủy quyền của Apple tại Việt Nam năm 2026.
                        </Typography>
                        <Facebook fontSize="large" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" className="footer-title">Liên hệ</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            Mua hàng: <span className="highlight-text">1900.6626</span>
                        </Typography>
                        <Typography variant="body2">
                            Khiếu nại: <span className="highlight-text">0888.888.888</span>
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}></Grid>
                </Grid>
                <Divider sx={{ my: 4, bgcolor: '#333' }} />
                <Typography variant="body2" align="center">
                    © 2026 Công ty Cổ Phần HESMAN Việt Nam.
                </Typography>
            </Container>
        </Box>
    );
};

// --- MAIN LAYOUT ---
const MainLayout = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
            <Header />
            <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f5f5f7', width: '100%' }}>
                <Outlet />
            </Box>
            <Footer />
            
            {/* 🔥 THÀNH PHẦN CHAT AI LUÔN HIỆN DIỆN */}
            <ChatAI />
        </Box>
    );
};

export default MainLayout;