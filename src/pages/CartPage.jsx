import React, { useState, useEffect } from 'react';
import { 
    Grid, Typography, Box, Button, IconButton, TextField, Divider, 
    Radio, RadioGroup, FormControlLabel, CircularProgress, Checkbox, Container, Snackbar, Alert
} from '@mui/material';
import { Add, Remove, Delete, LocalShipping, CheckCircle, ShoppingBag } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import cartApi from '../api/cartApi';
import axios from 'axios'; 
import '../css/CartPage.css'; 

const CartPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [showSuccess, setShowSuccess] = useState(false);
    
    // Snackbar thông báo lỗi/hủy
    const [errorMsg, setErrorMsg] = useState({ open: false, text: '' });

    const isLoggedIn = !!localStorage.getItem('token');

    // --- LOGIC XỬ LÝ KẾT QUẢ VNPAY TỪ URL ---
    useEffect(() => {
        const vnpayStatus = searchParams.get('vnpay');
        
        if (vnpayStatus === 'success') {
            // Hiển thị Overlay Xanh -> Đợi 3s -> Về Home
            setShowSuccess(true);
            window.dispatchEvent(new Event("cartUpdated"));
            setTimeout(() => {
                setShowSuccess(false);
                setSearchParams({}); // Dọn URL
                navigate('/'); // Về trang chủ
            }, 3500);
        } else if (vnpayStatus === 'cancel') {
            // Hiển thị Alert Đỏ -> Ở lại trang Cart
            setErrorMsg({ open: true, text: 'Bạn đã hủy thanh toán hoặc giao dịch thất bại!' });
            setSearchParams({}); // Dọn URL
        }
    }, [searchParams, navigate, setSearchParams]);

    useEffect(() => {
        if (!isLoggedIn) { navigate('/login'); return; }
        loadCart();
    }, [isLoggedIn]);

    const loadCart = async () => {
        try {
            setPageLoading(true);
            const data = await cartApi.getCart();
            setCart(data);
        } catch (error) { 
            if (error.response?.status === 401) navigate('/login');
        } finally { setPageLoading(false); }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedProductIds(cart.products.map(p => p.productId));
        } else {
            setSelectedProductIds([]);
        }
    };

    const handleToggleSelect = (productId) => {
        setSelectedProductIds(prev => 
            prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
        );
    };

    const calculateSelectedTotal = () => {
        if (!cart || !cart.products) return 0;
        return cart.products
            .filter(p => selectedProductIds.includes(p.productId))
            .reduce((sum, p) => sum + (p.specialPrice || p.price) * p.quantity, 0);
    };

    const handleUpdateQuantity = async (productId, currentQty, change) => {
        const newQty = currentQty + change;
        if (newQty <= 0) return;
        try {
            await cartApi.updateCartProduct(productId, newQty);
            loadCart();
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (error) { alert("Lỗi!"); }
    };

    const handleRemoveItem = async (productId) => {
        if (!window.confirm("Xóa sản phẩm?")) return;
        try {
            await cartApi.deleteCartProduct(productId);
            loadCart();
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (error) { console.error(error); }
    };

    // --- LOGIC THANH TOÁN ---
    const handleCheckout = async () => {
        if (selectedProductIds.length === 0) return;
        setLoading(true);
        try {
            // BƯỚC 1: Tạo đơn hàng bên Java
            const orderRes = await cartApi.placeOrder(paymentMethod, selectedProductIds);
            
            if (paymentMethod === 'VNPay') {
                // BƯỚC 2: Gọi Node.js lấy link thanh toán (Gửi số tiền thật)
                const amount = calculateSelectedTotal();
                const vnpRes = await axios.post('http://localhost:3000/payment', {
                    amount: amount, // Node.js sẽ tự nhân 100
                    orderId: orderRes.orderId
                });

                if (vnpRes.data.url) {
                    window.location.href = vnpRes.data.url; // Nhảy sang VNPay
                }
            } else {
                // Tiền mặt (Cash)
                setShowSuccess(true);
                window.dispatchEvent(new Event("cartUpdated"));
                setTimeout(() => {
                    setShowSuccess(false);
                    navigate('/');
                }, 3000);
            }
        } catch (error) { 
            setErrorMsg({ open: true, text: 'Không thể tạo đơn hàng (Có thể do hết hàng)!' });
        } finally { setLoading(false); }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    if (pageLoading) return <Box className="flex-center" height="100vh"><CircularProgress color="inherit" /></Box>;

    return (
        <div className="cart-page-root">
            <div className="fog-layer"></div>
            
            {/* THÀNH CÔNG OVERLAY */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="success-overlay" style={{ zIndex: 9999 }}>
                        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="success-card">
                            <CheckCircle sx={{ fontSize: 80, color: '#00ff88', mb: 2 }} />
                            <Typography variant="h4" fontWeight="900">THANH TOÁN THÀNH CÔNG!</Typography>
                            <Typography sx={{ color: '#aaa', mt: 1 }}>Hệ thống đang đưa bạn về trang chủ...</Typography>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HỦY/LỖI SNACKBAR */}
            <Snackbar open={errorMsg.open} autoHideDuration={4000} onClose={() => setErrorMsg({ ...errorMsg, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity="error" variant="filled" sx={{ width: '100%' }}>{errorMsg.text}</Alert>
            </Snackbar>

            <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10, py: 8 }}>
                <Grid container spacing={3}>
                    {/* Danh sách sản phẩm */}
                    <Grid item xs={12} lg={9}>
                        <Box className="cart-glass-card">
                            <Box className="table-header-custom">
                                <Box className="col-check"><Checkbox size="small" checked={selectedProductIds.length > 0 && selectedProductIds.length === cart?.products?.length} onChange={handleSelectAll} /></Box>
                                <Box className="col-product">Sản Phẩm</Box>
                                <Box className="col-price">Đơn Giá</Box>
                                <Box className="col-qty">Số Lượng</Box>
                                <Box className="col-total">Số Tiền</Box>
                                <Box className="col-action">Thao Tác</Box>
                            </Box>
                            <Box className="table-content">
                                {cart?.products?.length > 0 ? cart.products.map((item) => (
                                    <div key={item.productId} className="cart-row-custom">
                                        <Box className="col-check"><Checkbox size="small" checked={selectedProductIds.includes(item.productId)} onChange={() => handleToggleSelect(item.productId)} /></Box>
                                        <Box className="col-product flex-align-center">
                                            <img src={`http://localhost:8080/api/products/image/${item.image}`} alt="" className="item-img-compact" />
                                            <Typography className="item-name-compact">{item.productName}</Typography>
                                        </Box>
                                        <Box className="col-price">{formatCurrency(item.specialPrice || item.price)}</Box>
                                        <Box className="col-qty">
                                            <div className="qty-picker-mini">
                                                <button onClick={() => handleUpdateQuantity(item.productId, item.quantity, -1)}><Remove fontSize="inherit" /></button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => handleUpdateQuantity(item.productId, item.quantity, 1)}><Add fontSize="inherit" /></button>
                                            </div>
                                        </Box>
                                        <Box className="col-total highlight-text">{formatCurrency((item.specialPrice || item.price) * item.quantity)}</Box>
                                        <Box className="col-action"><IconButton onClick={() => handleRemoveItem(item.productId)}><Delete fontSize="small" color="error" /></IconButton></Box>
                                    </div>
                                )) : <Typography align="center" sx={{ py: 10, opacity: 0.5 }}>Giỏ hàng trống</Typography>}
                            </Box>
                        </Box>
                    </Grid>

                    {/* Thanh toán bên phải */}
                    <Grid item xs={12} lg={3}>
                        <Box className="cart-glass-card summary-sticky">
                            <Typography variant="h6" fontWeight="bold" mb={2}><LocalShipping sx={{ mr: 1 }} /> THANH TOÁN</Typography>
                            <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                <FormControlLabel value="Cash" control={<Radio size="small" />} label="Tiền mặt (COD)" />
                                <FormControlLabel value="VNPay" control={<Radio size="small" />} label="Cổng VNPay" />
                            </RadioGroup>
                            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2">Tạm tính:</Typography>
                                <Typography variant="h6" fontWeight="bold" color="primary">{formatCurrency(calculateSelectedTotal())}</Typography>
                            </Box>
                            <Button fullWidth variant="contained" className="btn-login-style" sx={{ mt: 3, height: 50 }} onClick={handleCheckout} disabled={loading || selectedProductIds.length === 0}>
                                {loading ? <CircularProgress size={24} color="inherit" /> : "XÁC NHẬN ĐẶT HÀNG"}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </div>
    );
};

export default CartPage;