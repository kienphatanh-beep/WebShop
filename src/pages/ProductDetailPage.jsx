import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import cartApi from '../api/cartApi';
import { 
    Container, Grid, Typography, Box, Button, Stack, 
    Divider, IconButton, CircularProgress 
} from '@mui/material';
import { CheckCircle, AddShoppingCart, Description, Add, Remove } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion'; 
import '../css/ProductDetailPage.css';

const API_BASE_URL = 'http://localhost:8080/api';

const STORAGE_OPTIONS = ["256GB", "512GB", "1TB", "2TB"];
const COLOR_OPTIONS = [
    { name: "Titan Tự Nhiên", code: "#8e8e8d" },
    { name: "Titan Xanh", code: "#2f3848" },
    { name: "Titan Trắng", code: "#f2f2f2" },
    { name: "Titan Đen", code: "#1c1c1e" }
];

const ProductDetailPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false); // Trạng thái khi đang bấm nút thêm
    const [showSuccess, setShowSuccess] = useState(false); 

    const [selectedStorage, setSelectedStorage] = useState("256GB");
    const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
    const [quantity, setQuantity] = useState(1);

    // Kiểm tra đăng nhập
    const isLoggedIn = !!localStorage.getItem('token');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await api.getProductById(productId);
                setProduct(data);
            } catch (error) {
                console.error("Lỗi lấy chi tiết sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
        window.scrollTo(0, 0);
    }, [productId]);

    const handleQuantityChange = (change) => {
        const newQty = quantity + change;
        if (newQty >= 1) setQuantity(newQty);
    };

    // 🔥 HÀM THÊM GIỎ HÀNG ĐÃ CẬP NHẬT (BẢO MẬT TOKEN)
    const handleAddToCart = async (isBuyNow = false) => {
        if (!isLoggedIn) {
            alert("Vui lòng đăng nhập để mua hàng!");
            navigate('/login');
            return;
        }

        try {
            setAdding(true);
            // Gọi API mới: Chỉ truyền productId và quantity
            // Backend tự lấy Email từ Token để tìm Cart
            await cartApi.addToCart(product.productId, quantity);
            
            // Bắn sự kiện cập nhật Badge trên Header
            window.dispatchEvent(new Event("cartUpdated"));
            
            if (isBuyNow) {
                navigate('/cart');
            } else {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000); 
            }
        } catch (error) {
            console.error("Lỗi thêm giỏ hàng:", error);
            if (error.response?.status === 401) {
                alert("Phiên đăng nhập hết hạn!");
                navigate('/login');
            } else {
                alert("Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.");
            }
        } finally {
            setAdding(false);
        }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <CircularProgress color="inherit" />
            <Typography sx={{ ml: 2 }}>Đang tải sản phẩm...</Typography>
        </Box>
    );

    if (!product) return (
        <Box sx={{ pt: 10, textAlign: 'center' }}>
            <Typography variant="h5">Không tìm thấy sản phẩm!</Typography>
            <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>Quay lại trang chủ</Button>
        </Box>
    );

    return (
        <Container maxWidth="lg" className="detail-container" sx={{ position: 'relative', bgcolor: '#fff', py: 4, borderRadius: 2, mt: 4 }}>
            
            {/* --- THÔNG BÁO THÀNH CÔNG --- */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.3 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="success-modal-overlay"
                        style={{
                            position: 'fixed', top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)', x: '-50%', y: '-50%',
                            zIndex: 9999, background: 'rgba(255, 255, 255, 0.98)',
                            padding: '40px', borderRadius: '24px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            textAlign: 'center', border: '2px solid #28a745',
                            backdropFilter: 'blur(10px)', minWidth: '320px'
                        }}
                    >
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1.2 }} transition={{ type: "spring", stiffness: 200 }}>
                            <CheckCircle sx={{ fontSize: 80, color: '#28a745', mb: 2 }} />
                        </motion.div>
                        <Typography variant="h5" sx={{ color: '#000', fontWeight: 'bold', mb: 1 }}>THÀNH CÔNG!</Typography>
                        <Typography variant="body1" sx={{ color: '#555', mb: 3 }}>Sản phẩm đã được thêm vào giỏ.</Typography>
                        <Button 
                            variant="contained" 
                            onClick={() => navigate('/cart')}
                            sx={{ bgcolor: '#000', color: '#fff', borderRadius: '10px', px: 4, '&:hover': { bgcolor: '#333' } }}
                        >
                            Xem giỏ hàng
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <Grid container spacing={4} justifyContent="center"> 
                {/* --- CỘT TRÁI: ẢNH --- */}
                <Grid item xs={12} md={5}>
                    <Box className="detail-image-wrapper" sx={{ border: '1px solid #eee', borderRadius: 4, overflow: 'hidden', p: 2 }}>
                        <img 
                            src={product.image ? `${API_BASE_URL}/products/image/${product.image}` : "https://via.placeholder.com/500"} 
                            alt={product.productName} 
                            className="detail-image"
                            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                        />
                    </Box>
                    
                    <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
                        {[1, 2, 3].map((item) => (
                             <Box key={item} sx={{ width: 70, height: 70, border: '1px solid #eee', borderRadius: 2, p: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src={product.image ? `${API_BASE_URL}/products/image/${product.image}` : ""} alt="" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
                             </Box>
                        ))}
                    </Stack>

                    <Box className="product-description-box" sx={{ mt: 4, p: 3, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gutterBottom sx={{ color: '#000', fontSize: '1.1rem' }}>
                            <Description sx={{ mr: 1, color: '#0066cc' }} /> Đặc điểm nổi bật
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="body2" sx={{ color: '#444', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                            {product.description || "Thông tin sản phẩm đang được cập nhật..."}
                        </Typography>
                    </Box>
                </Grid>

                {/* --- CỘT PHẢI: CHI TIẾT --- */}
                <Grid item xs={12} md={6}>
                    <Box className="right-column-content">
                        <Typography variant="h4" fontWeight="900" sx={{ color: '#000', mb: 2 }}>
                            {product.productName}
                        </Typography>

                        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                            <Typography variant="h4" sx={{ color: '#d70018', fontWeight: 'bold' }}>
                                {formatCurrency(product.specialPrice || product.price)}
                            </Typography>
                            {product.discount > 0 && (
                                <Typography sx={{ color: '#888', textDecoration: 'line-through', fontSize: '1.2rem' }}>
                                    {formatCurrency(product.price)}
                                </Typography>
                            )}
                        </Stack>

                        <Divider sx={{ mb: 3 }} />

                        {/* DUNG LƯỢNG */}
                        <Typography variant="subtitle2" fontWeight="bold" mb={1.5} sx={{ color: '#000' }}>Dung lượng:</Typography>
                        <Stack direction="row" spacing={1.5} mb={3} flexWrap="wrap" useFlexGap>
                            {STORAGE_OPTIONS.map((storage) => (
                                <button 
                                    key={storage}
                                    className={`option-btn ${selectedStorage === storage ? 'selected' : ''}`}
                                    onClick={() => setSelectedStorage(storage)}
                                >
                                    {storage}
                                </button>
                            ))}
                        </Stack>

                        {/* MÀU SẮC */}
                        <Typography variant="subtitle2" fontWeight="bold" mb={1.5} sx={{ color: '#000' }}>Màu sắc: {selectedColor.name}</Typography>
                        <Stack direction="row" spacing={2} mb={3}>
                            {COLOR_OPTIONS.map((color) => (
                                <Box 
                                    key={color.code}
                                    onClick={() => setSelectedColor(color)}
                                    sx={{ 
                                        backgroundColor: color.code,
                                        width: 38, height: 38, borderRadius: '50%', cursor: 'pointer',
                                        border: selectedColor.code === color.code ? '3px solid #0066cc' : '1px solid #ddd',
                                        transition: '0.2s'
                                    }}
                                />
                            ))}
                        </Stack>

                        {/* SỐ LƯỢNG */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mr: 3, color: '#000' }}>Số lượng:</Typography>
                            <Stack direction="row" alignItems="center" sx={{ border: '1px solid #ddd', borderRadius: '8px' }}>
                                <IconButton size="small" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} sx={{ color: '#000' }}>
                                    <Remove />
                                </IconButton>
                                <Typography sx={{ mx: 2, minWidth: '40px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                    {quantity}
                                </Typography>
                                <IconButton size="small" onClick={() => handleQuantityChange(1)} sx={{ color: '#000' }}>
                                    <Add />
                                </IconButton>
                            </Stack>
                        </Box>

                        {/* ƯU ĐÃI */}
                        <Box sx={{ p: 2, border: '1px solid #ffeeba', borderRadius: 2, mb: 4, bgcolor: '#fffcf0' }}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#856404', mb: 1 }}>🎁 Khuyến mãi hấp dẫn</Typography>
                            <Stack spacing={1}>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: '#555' }}>
                                    <CheckCircle sx={{ fontSize: 16, mr: 1, color: '#28a745' }} /> Miễn phí giao hàng cho đơn hàng từ 1 triệu.
                                </Typography>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: '#555' }}>
                                    <CheckCircle sx={{ fontSize: 16, mr: 1, color: '#28a745' }} /> Bảo hành 12 tháng chính hãng Apple Việt Nam.
                                </Typography>
                            </Stack>
                        </Box>

                        {/* BUTTONS */}
                        <Stack direction="row" spacing={2}>
                            <Button 
                                variant="contained" size="large" fullWidth 
                                disabled={adding}
                                onClick={() => handleAddToCart(true)}
                                sx={{ bgcolor: '#0066cc', color: '#fff', height: 60, fontSize: '1.1rem', fontWeight: 'bold', borderRadius: 2, '&:hover': { bgcolor: '#004499' } }}
                            >
                                MUA NGAY
                            </Button>
                            
                            <Button 
                                variant="outlined" size="large" 
                                disabled={adding}
                                onClick={() => handleAddToCart(false)}
                                sx={{ height: 60, minWidth: 80, borderColor: '#0066cc', color: '#0066cc', borderRadius: 2, '&:hover': { bgcolor: '#f0f7ff' } }}
                            >
                                {adding ? <CircularProgress size={24} /> : <AddShoppingCart fontSize="large" />}
                            </Button>
                        </Stack>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default ProductDetailPage;