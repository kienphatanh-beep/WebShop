import React, { useState, useEffect, useCallback } from 'react';
import { 
    Grid, Typography, Box, Button, IconButton, TextField, Divider, 
    Radio, RadioGroup, FormControlLabel, CircularProgress, Checkbox, Container, Snackbar, Alert
} from '@mui/material';
import { Add, Remove, Delete, LocalShipping, CheckCircle, Cancel, ShoppingBag } from '@mui/icons-material';
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
    
    // Trạng thái hiển thị Overlay Animation
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    
    // Thông báo nhanh (Snackbar)
    const [snackbar, setSnackbar] = useState({ open: false, text: '', severity: 'error' });

    const isLoggedIn = !!localStorage.getItem('token');

    // --- HÀM TẢI DỮ LIỆU GIỎ HÀNG ---
    const loadCart = useCallback(async () => {
        try {
            setPageLoading(true);
            const data = await cartApi.getCart();
            setCart(data);
        } catch (error) { 
            console.error("Lỗi tải giỏ hàng:", error);
            if (error.response?.status === 401) navigate('/login');
        } finally { setPageLoading(false); }
    }, [navigate]);

    // --- LOGIC LẮNG NGHE KẾT QUẢ TỪ VNPAY URL ---
    useEffect(() => {
        const vnpayStatus = searchParams.get('vnpay');
        const orderId = searchParams.get('orderId');
        
        if (vnpayStatus === 'success' && orderId) {
            const finalize = async () => {
                try {
                    // Gọi Java để chốt đơn (trừ kho + xóa giỏ hàng)
                    const email = localStorage.getItem('email');
                    await cartApi.updateOrderStatus(email, orderId, 'Order Accepted!');
                    
                    setShowSuccess(true);
                    window.dispatchEvent(new Event("cartUpdated")); 
                    setTimeout(() => {
                        setShowSuccess(false);
                        setSearchParams({}); 
                        navigate('/'); 
                    }, 3500);
                } catch (e) { console.error("Lỗi chốt đơn:", e); }
            };
            finalize();
        } 
        else if (vnpayStatus === 'cancel') {
            setShowError(true); // Hiển thị Overlay Thất bại
            setTimeout(() => {
                setShowError(false);
                setSearchParams({}); // Dọn URL
                loadCart(); // Tải lại giỏ hàng (hàng vẫn còn trong giỏ vì Java chưa xóa)
            }, 3500);
        }
    }, [searchParams, navigate, setSearchParams, loadCart]);

    useEffect(() => {
        if (!isLoggedIn) { navigate('/login'); return; }
        loadCart();
    }, [isLoggedIn, loadCart]);

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
        } catch (error) { 
            setSnackbar({ open: true, text: 'Lỗi cập nhật số lượng!', severity: 'error' });
        }
    };

    const handleRemoveItem = async (productId) => {
        if (!window.confirm("Xóa sản phẩm khỏi giỏ?")) return;
        try {
            await cartApi.deleteCartProduct(productId);
            loadCart();
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (error) { 
            console.error("Lỗi xóa sản phẩm:", error); 
        }
    };

    // --- LOGIC THANH TOÁN ---
    const handleCheckout = async () => {
        if (selectedProductIds.length === 0) {
            setSnackbar({ open: true, text: 'Vui lòng chọn sản phẩm!', severity: 'warning' });
            return;
        }
        setLoading(true);
        try {
            // BƯỚC 1: Tạo đơn hàng bên Java
            const orderRes = await cartApi.placeOrder(paymentMethod, selectedProductIds);
            
            if (paymentMethod === 'VNPay') {
                // BƯỚC 2: Gọi Node.js lấy link VNPay
                const amount = calculateSelectedTotal();
                const vnpRes = await axios.post('http://localhost:3000/payment', {
                    amount: amount, 
                    orderId: orderRes.orderId
                });

                if (vnpRes.data.url) {
                    window.location.href = vnpRes.data.url; // Nhảy sang cổng thanh toán
                }
            } else {
                // Thanh toán tiền mặt (Cash)
                setShowSuccess(true);
                window.dispatchEvent(new Event("cartUpdated"));
                setTimeout(() => {
                    setShowSuccess(false);
                    navigate('/');
                }, 3000);
            }
        } catch (error) { 
            const errorText = error.response?.data?.message || 'Không thể tạo đơn hàng (Hết hàng)!';
            setSnackbar({ open: true, text: errorText, severity: 'error' });
        } finally { setLoading(false); }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    if (pageLoading) return <Box className="flex-center" height="100vh"><CircularProgress sx={{ color: '#1976d2' }} /></Box>;

    return (
        <div className="cart-page-root">
            <div className="fog-layer"></div>
            
            {/* --- 1. OVERLAY THÀNH CÔNG --- */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="success-overlay" style={{ zIndex: 9999 }}>
                        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="success-card">
                            <CheckCircle sx={{ fontSize: 80, color: '#00ff88', mb: 2 }} />
                            <Typography variant="h4" fontWeight="900">THÀNH CÔNG!</Typography>
                            <Typography sx={{ color: '#aaa', mt: 1 }}>Đơn hàng của bạn đã được xác nhận.</Typography>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- 2. OVERLAY THẤT BẠI / HỦY (THEO YÊU CẦU) --- */}
            <AnimatePresence>
                {showError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="success-overlay" style={{ zIndex: 9999, background: 'rgba(20,0,0,0.95)' }}>
                        <motion.div initial={{ scale: 0.5, rotate: -5 }} animate={{ scale: 1, rotate: 0 }} className="success-card" style={{ borderColor: '#ff4444' }}>
                            <Cancel sx={{ fontSize: 80, color: '#ff4444', mb: 2 }} />
                            <Typography variant="h4" fontWeight="900" color="#ff4444">THANH TOÁN THẤT BẠI</Typography>
                            <Typography sx={{ color: '#ccc', mt: 1 }}>Giao dịch đã bị hủy. Sản phẩm vẫn còn trong giỏ.</Typography>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>{snackbar.text}</Alert>
            </Snackbar>

            <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10, py: 8 }}>
                <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={12} lg={9.5}>
                        <Box className="cart-glass-card">
                            <Box className="table-header-custom">
                                <Box className="col-check">
                                    <Checkbox 
                                        size="small"
                                        checked={cart?.products?.length > 0 && selectedProductIds.length === cart.products.length}
                                        onChange={handleSelectAll}
                                    />
                                </Box>
                                <Box className="col-product">Sản Phẩm</Box>
                                <Box className="col-price">Đơn Giá</Box>
                                <Box className="col-qty">Số Lượng</Box>
                                <Box className="col-total">Số Tiền</Box>
                                <Box className="col-action">Thao Tác</Box>
                            </Box>

                            <Box className="table-content">
                                {!cart?.products?.length ? (
                                    <Box sx={{ textAlign: 'center', py: 10, opacity: 0.3 }}>
                                        <ShoppingBag sx={{ fontSize: 60, mb: 2 }} />
                                        <Typography>Giỏ hàng đang trống</Typography>
                                    </Box>
                                ) : (
                                    cart.products.map((item) => (
                                        <motion.div layout key={item.productId} className="cart-row-custom">
                                            <Box className="col-check">
                                                <Checkbox 
                                                    size="small"
                                                    checked={selectedProductIds.includes(item.productId)} 
                                                    onChange={() => handleToggleSelect(item.productId)} 
                                                />
                                            </Box>
                                            <Box className="col-product flex-align-center">
                                                <img src={`http://localhost:8080/api/products/image/${item.image}`} alt="" className="item-img-compact" />
                                                <Typography className="item-name-compact">{item.productName}</Typography>
                                            </Box>
                                            <Box className="col-price">{formatCurrency(item.specialPrice || item.price)}</Box>
                                            <Box className="col-qty">
                                                <div className="qty-picker-mini">
                                                    <button onClick={() => handleUpdateQuantity(item.productId, item.quantity, -1)}>-</button>
                                                    <span>{item.quantity}</span>
                                                    <button onClick={() => handleUpdateQuantity(item.productId, item.quantity, 1)}>+</button>
                                                </div>
                                            </Box>
                                            <Box className="col-total highlight-text">{formatCurrency((item.specialPrice || item.price) * item.quantity)}</Box>
                                            <Box className="col-action">
                                                <IconButton onClick={() => handleRemoveItem(item.productId)} className="trash-btn">
                                                    <Delete fontSize="small" color="error" />
                                                </IconButton>
                                            </Box>
                                        </motion.div>
                                    ))
                                )}
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12} lg={2.5}>
                        <Box className="cart-glass-card summary-sticky">
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                                <LocalShipping sx={{ mr: 1, fontSize: 20 }} /> Thanh toán
                            </Typography>
                            
                            <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                <FormControlLabel value="Cash" control={<Radio size="small" />} label={<Typography variant="caption">Tiền mặt (COD)</Typography>} />
                                <FormControlLabel value="VNPay" control={<Radio size="small" />} label={<Typography variant="caption">Cổng VNPay</Typography>} />
                            </RadioGroup>

                            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                            <Box className="summary-row flex-between">
                                <Typography variant="caption" sx={{ color: '#888' }}>Tạm tính:</Typography>
                                <Typography variant="body1" fontWeight="700" color="primary">{formatCurrency(calculateSelectedTotal())}</Typography>
                            </Box>

                            <Button 
                                fullWidth disabled={loading || selectedProductIds.length === 0} 
                                onClick={handleCheckout} 
                                className="btn-login-style"
                                sx={{ mt: 3, height: 45 }}
                            >
                                {loading ? <CircularProgress size={20} color="inherit" /> : "XÁC NHẬN"}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </div>
    );
};

export default CartPage;