import React, { useEffect, useState, useCallback } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { 
    AppBar, Toolbar, Container, Box, InputBase, 
    IconButton, Button, Grid, Divider, Typography,
    Menu, MenuItem, Avatar, Badge 
} from '@mui/material';
import { 
    Search, ShoppingCart, Person, Facebook, Logout, Login, AppRegistration, AccountCircle
} from '@mui/icons-material';

import api from '../api/api'; 
import cartApi from '../api/cartApi'; 
import '../css/MainLayout.css'; 

// --- HEADER ---
const Header = () => {
    const [categories, setCategories] = useState([]);
    const [cartCount, setCartCount] = useState(0); 
    const [searchTerm, setSearchTerm] = useState(""); // 🔥 Thêm state tìm kiếm
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
                // 🔥 Trích xuất từ _embedded theo file api.js của bạn
                const categoryList = res._embedded ? res._embedded.categoryDTOList : (res.content || res);
                setCategories(Array.isArray(categoryList) ? categoryList : []);
            } catch (error) {
                console.error("Lỗi tải danh mục:", error);
            }
        };
        fetchCategories();
    }, []);

    // 2. 🔥 Fetch Cart Count theo chuẩn HATEOAS (Giữ nguyên logic của bạn)
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

    // 3. Lắng nghe sự kiện cập nhật giỏ hàng (Giữ nguyên logic của bạn)
    useEffect(() => {
        fetchCartCount(); 
        window.addEventListener("cartUpdated", fetchCartCount);
        return () => {
            window.removeEventListener("cartUpdated", fetchCartCount);
        };
    }, [fetchCartCount]);

    // 4. 🔥 Xử lý tìm kiếm khi nhấn Enter
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter' && searchTerm.trim() !== "") {
            navigate(`/shop?keyword=${encodeURIComponent(searchTerm.trim())}`);
            // setSearchTerm(""); // Có thể xóa hoặc giữ lại tùy UX bạn muốn
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

    const handleNavigate = (path) => {
        handleMenuClose();
        navigate(path);
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
                                onKeyDown={handleSearchKeyDown} // 🔥 Kích hoạt tìm kiếm
                            />
                        </div>
                    </Box>

                    <Box className="header-actions">
                        <Button className="action-btn" onClick={() => navigate('/cart')}>
                            <Badge badgeContent={cartCount} color="error" showZero={false}>
                                <ShoppingCart />
                            </Badge>
                            <span style={{ marginLeft: '8px' }}>Giỏ hàng</span>
                        </Button>
                        
                        <Button 
                            startIcon={isLoggedIn ? <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>{userEmail?.charAt(0).toUpperCase()}</Avatar> : <Person />} 
                            className="action-btn"
                            onClick={handleAccountClick}
                        >
                            {isLoggedIn ? (userEmail ? userEmail.split('@')[0] : "Tài khoản") : "Tài khoản"}
                        </Button>

                        <Menu
                            anchorEl={anchorEl}
                            open={openMenu}
                            onClose={handleMenuClose}
                            PaperProps={{
                                elevation: 3,
                                sx: { mt: 1.5, minWidth: 200, borderRadius: '12px' }
                            }}
                        >
                            {isLoggedIn ? [
                                <MenuItem key="profile" onClick={handleMenuClose}>
                                    <AccountCircle sx={{ mr: 1.5, color: '#666' }} /> Thông tin cá nhân
                                </MenuItem>,
                                <MenuItem key="orders" onClick={() => { handleMenuClose(); navigate('/orders'); }}>
                                    <ShoppingCart sx={{ mr: 1.5, color: '#666' }} /> Đơn hàng đã đặt
                                </MenuItem>,
                                <Divider key="divider" />,
                                <MenuItem key="logout" onClick={handleLogout} sx={{ color: 'error.main' }}>
                                    <Logout sx={{ mr: 1.5 }} /> Đăng xuất
                                </MenuItem>
                            ] : [
                                <MenuItem key="login" onClick={() => { handleMenuClose(); navigate('/login'); }}>
                                    <Login sx={{ mr: 1.5, color: '#0066cc' }} /> Đăng nhập
                                </MenuItem>,
                                <MenuItem key="register" onClick={() => { handleMenuClose(); navigate('/register'); }}>
                                    <AppRegistration sx={{ mr: 1.5, color: '#28a745' }} /> Đăng ký
                                </MenuItem>
                            ]}
                        </Menu>

                        <Box sx={{ ml: 1, fontSize: 20, cursor: 'default' }}>2026 🇻🇳</Box>
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

const MainLayout = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
            <Header />
            <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f5f5f7', width: '100%' }}>
                <Outlet />
            </Box>
            <Footer />
        </Box>
    );
};

export default MainLayout;