import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import cartApi from '../api/cartApi';
import { 
    Container, Grid, Typography, Box, Button, Stack, 
    Divider, IconButton, CircularProgress, Paper, Breadcrumbs
} from '@mui/material';
import { 
    CheckCircle, AddShoppingCart, Description, Add, Remove, 
    NavigateNext, LocalOffer 
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion'; 
import RelatedProducts from '../components/RelatedProducts'; 
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
    const [adding, setAdding] = useState(false); 
    const [showSuccess, setShowSuccess] = useState(false); 

    const [selectedStorage, setSelectedStorage] = useState("256GB");
    const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
    const [quantity, setQuantity] = useState(1);

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
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }, [productId]);

    const handleQuantityChange = (change) => {
        const newQty = quantity + change;
        if (newQty >= 1) setQuantity(newQty);
    };

    const handleAddToCart = async (isBuyNow = false) => {
        if (!isLoggedIn) {
            alert("Vui lòng đăng nhập!");
            navigate('/login');
            return;
        }
        try {
            setAdding(true);
            await cartApi.addToCart(product.productId, quantity);
            window.dispatchEvent(new Event("cartUpdated"));
            if (isBuyNow) navigate('/cart');
            else {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000); 
            }
        } catch (error) {
            if (error.response?.status === 403 || error.response?.status === 401) {
                localStorage.clear(); 
                navigate('/login');
            }
        } finally {
            setAdding(false);
        }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    if (loading) return (
        <Box className="loader-container">
            <CircularProgress size={40} sx={{ color: '#0066cc' }} />
        </Box>
    );

    if (!product) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <Container maxWidth="lg" className="detail-compact-container">
                
                {/* --- BREADCRUMBS: Theo ảnh image_d39627 --- */}
                <Breadcrumbs 
                    separator={<NavigateNext fontSize="small" sx={{ color: '#86868b' }} />} 
                    className="breadcrumb-area"
                >
                    <Link to="/" className="b-link">Trang chủ</Link>
                    <Link to="/shop" className="b-link">Sản phẩm</Link>
                    <Link to={`/shop?categoryId=${product.categoryId}`} className="b-link">
                        {product.categoryName || "Danh mục"}
                    </Link>
                    <Typography className="b-current">{product.productName}</Typography>
                </Breadcrumbs>

                <Paper elevation={0} className="detail-glass-card">
                    
                    <AnimatePresence>
                        {showSuccess && (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="compact-toast-msg">
                                <CheckCircle sx={{ color: '#28a745', mr: 1, fontSize: 20 }} />
                                <Typography variant="caption" fontWeight="bold">Đã thêm vào giỏ hàng!</Typography>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Grid container spacing={5}> 
                        {/* --- TRÁI: ẢNH --- */}
                        <Grid item xs={12} md={5.5}>
                            <Box className="compact-img-box">
                                <img 
                                    src={product.image ? `${API_BASE_URL}/products/image/${product.image}` : "https://via.placeholder.com/400"} 
                                    alt={product.productName} 
                                    className="img-main-comp"
                                />
                            </Box>
                            
                            <Stack direction="row" spacing={1} justifyContent="center" mt={2}>
                                {[1, 2, 3].map((i) => (
                                     <Box key={i} className="mini-thumb-item">
                                        <img src={product.image ? `${API_BASE_URL}/products/image/${product.image}` : ""} alt="thumb" />
                                     </Box>
                                ))}
                            </Stack>

                            <Box className="desc-box-compact">
                                <Typography className="desc-label">
                                    <Description sx={{ fontSize: 18, mr: 0.5, color: '#1d1d1f' }} /> ĐẶC ĐIỂM NỔI BẬT
                                </Typography>
                                <Typography className="desc-body">{product.description}</Typography>
                            </Box>
                        </Grid>

                        {/* --- PHẢI: INFO --- */}
                        <Grid item xs={12} md={6.5}>
                            <Box className="info-area-compact">
                                <Typography variant="h5" className="comp-title">{product.productName}</Typography>

                                <Stack direction="row" alignItems="baseline" spacing={2} my={1}>
                                    <Typography variant="h5" className="comp-price-now">
                                        {formatCurrency(product.specialPrice || product.price)}
                                    </Typography>
                                    {product.discount > 0 && (
                                        <Typography className="comp-price-old">{formatCurrency(product.price)}</Typography>
                                    )}
                                </Stack>

                                <Divider className="comp-divider" />

                                <Typography className="comp-label">Dung lượng:</Typography>
                                <Stack direction="row" spacing={1} mb={2.5}>
                                    {STORAGE_OPTIONS.map((s) => (
                                        <button 
                                            key={s} 
                                            className={`chip-btn-comp ${selectedStorage === s ? 'active' : ''}`}
                                            onClick={() => setSelectedStorage(s)}
                                        >{s}</button>
                                    ))}
                                </Stack>

                                <Typography className="comp-label">Màu sắc: <span>{selectedColor.name}</span></Typography>
                                <Stack direction="row" spacing={1.5} mb={3}>
                                    {COLOR_OPTIONS.map((c) => (
                                        <Box 
                                            key={c.code} 
                                            onClick={() => setSelectedColor(c)}
                                            className={`dot-comp ${selectedColor.code === c.code ? 'active' : ''}`}
                                            sx={{ bgcolor: c.code }}
                                        />
                                    ))}
                                </Stack>

                                {/* --- KHUNG ƯU ĐÃI: Theo image_d39627 --- */}
                                <Box className="promo-container-comp">
                                    <Box className="promo-header">
                                        <LocalOffer sx={{ fontSize: 16, mr: 1 }} /> Ưu đãi
                                    </Box>
                                    <Box className="promo-content">
                                        <Typography variant="caption" color="textSecondary" display="block" mb={1} fontStyle="italic">
                                            ( Khuyến mãi dự kiến áp dụng đến 23h59 | 31/1/2026 )
                                        </Typography>
                                        <Stack spacing={1}>
                                            <Box className="promo-item">
                                                <CheckCircle className="check-icon" />
                                                <Typography variant="caption" fontWeight="600">Ưu đãi thanh toán</Typography>
                                            </Box>
                                            <Typography variant="caption" sx={{ml: 3, display: 'block', color: '#444'}}>
                                                • Giảm 5% tối đa 200.000đ khi thanh toán qua Kredivo. <br/>
                                                • Bảo hành 12 tháng chính hãng Apple Việt Nam.
                                            </Typography>
                                        </Stack>
                                    </Box>
                                </Box>

                                {/* --- NHÓM NÚT BẤM: Sửa lỗi đè layout --- */}
                                <Box className="action-buttons-group">
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box className="qty-box-comp">
                                            <IconButton size="small" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}><Remove fontSize="inherit"/></IconButton>
                                            <Typography className="qty-val-comp">{quantity}</Typography>
                                            <IconButton size="small" onClick={() => handleQuantityChange(1)}><Add fontSize="inherit"/></IconButton>
                                        </Box>
                                        
                                        <Button 
                                            variant="outlined" 
                                            disabled={adding} 
                                            onClick={() => handleAddToCart(false)} 
                                            className="btn-add-comp"
                                            startIcon={adding ? <CircularProgress size={16} /> : <AddShoppingCart fontSize="small" />}
                                        >
                                            Thêm giỏ hàng
                                        </Button>
                                    </Stack>

                                    <Button 
                                        variant="contained" 
                                        fullWidth 
                                        disabled={adding} 
                                        onClick={() => handleAddToCart(true)} 
                                        className="btn-buy-comp"
                                    >
                                        MUA NGAY
                                    </Button>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>

                    <RelatedProducts categoryId={product.categoryId} currentProductId={product.productId} />
                </Paper>
            </Container>
        </motion.div>
    );
};

export default ProductDetailPage;