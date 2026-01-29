import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Container, Grid, Box, Typography, MenuItem, Select, 
    FormControl, InputLabel, Slider, Button, Pagination, 
    CircularProgress, Divider, List, ListItemButton, ListItemText 
} from '@mui/material';
import { FilterAltOff, RestartAlt } from '@mui/icons-material';
import api from '../api/api';
import ProductCard from '../components/ProductCard';
import '../css/Shop.css';

const Shop = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);

    const keyword = queryParams.get('keyword') || "";
    const categoryId = queryParams.get('categoryId') || "";

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [priceRange, setPriceRange] = useState([0, 50000000]);
    const [sortBy, setSortBy] = useState("price");
    const [sortOrder, setSortOrder] = useState("asc");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchCats = async () => {
            const res = await api.getAllCategories();
            setCategories(res.content || []);
        };
        fetchCats();
    }, []);

    const fetchShopData = useCallback(async () => {
        setLoading(true);
        const params = {
            keyword: keyword,
            categoryId: categoryId || null,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            pageNumber: page - 1,
            pageSize: 12, // Tăng lên 12 để khớp với hàng 3 hoặc 4 sản phẩm
            sortBy: sortBy,
            sortOrder: sortOrder
        };

        try {
            const res = await api.searchProducts(params);
            setProducts(res.content || []);
            setTotalPages(res.totalPages || 1);
        } catch (error) {
            console.error("Lỗi fetch shop:", error);
        } finally {
            setLoading(false);
        }
    }, [keyword, categoryId, priceRange, sortBy, sortOrder, page]);

    useEffect(() => {
        fetchShopData();
        window.scrollTo(0, 0);
    }, [fetchShopData]);

    const handleCategoryClick = (id) => {
        setPage(1);
        if (id === "all") {
            navigate('/shop');
        } else {
            navigate(`/shop?categoryId=${id}${keyword ? `&keyword=${keyword}` : ""}`);
        }
    };

    const handleReset = () => {
        setPriceRange([0, 50000000]);
        setSortBy("price");
        setSortOrder("asc");
        setPage(1);
        navigate('/shop');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + " đ";
    };

    return (
        /* maxWidth={false} giúp trang rộng hết cỡ, disableGutters loại bỏ padding mặc định nếu cần */
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4, lg: 6 }, py: 4 }}>
            <Grid container spacing={4}>
                
                {/* SIDEBAR: Thu hẹp lại còn 2 cột trên màn hình lớn */}
                <Grid item xs={12} md={3} lg={2.5} xl={2}>
                    <Box className="shop-sidebar">
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" fontWeight="bold">Bộ lọc</Typography>
                            <Button size="small" startIcon={<RestartAlt />} onClick={handleReset} sx={{ textTransform: 'none' }}>
                                Reset
                            </Button>
                        </Box>
                        
                        {keyword && (
                            <Typography variant="body2" sx={{ color: '#0066cc', mb: 2, bgcolor: '#eef6ff', p: 1, borderRadius: 1 }}>
                                Tìm kiếm: <b>"{keyword}"</b>
                            </Typography>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Danh mục</Typography>
                        <List sx={{ mb: 2 }}>
                            <ListItemButton selected={!categoryId} onClick={() => handleCategoryClick("all")}>
                                <ListItemText primary="Tất cả sản phẩm" primaryTypographyProps={{ fontSize: 14 }} />
                            </ListItemButton>
                            {categories.map((cat) => (
                                <ListItemButton 
                                    key={cat.categoryId} 
                                    selected={categoryId === String(cat.categoryId)}
                                    onClick={() => handleCategoryClick(cat.categoryId)}
                                >
                                    <ListItemText primary={cat.categoryName} primaryTypographyProps={{ fontSize: 14 }} />
                                </ListItemButton>
                            ))}
                        </List>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Khoảng giá</Typography>
                        <Box px={1}>
                            <Slider
                                value={priceRange}
                                onChange={(e, val) => setPriceRange(val)}
                                valueLabelDisplay="auto"
                                min={0}
                                max={50000000}
                                step={1000000}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="caption">{formatCurrency(priceRange[0])}</Typography>
                                <Typography variant="caption">{formatCurrency(priceRange[1])}</Typography>
                            </Box>
                        </Box>

                        <Button 
                            fullWidth 
                            variant="contained" 
                            className="apply-filter-btn"
                            onClick={() => setPage(1)}
                        >
                            Áp dụng
                        </Button>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Sắp xếp theo</Typography>
                        <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                            <Select 
                                value={`${sortBy}-${sortOrder}`} 
                                onChange={(e) => {
                                    const [by, order] = e.target.value.split('-');
                                    setSortBy(by);
                                    setSortOrder(order);
                                    setPage(1);
                                }}
                            >
                                <MenuItem value="price-asc">Giá: Thấp đến cao</MenuItem>
                                <MenuItem value="price-desc">Giá: Cao đến thấp</MenuItem>
                                <MenuItem value="productName-asc">Tên: A - Z</MenuItem>
                                <MenuItem value="productId-desc">Mới nhất</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>

                {/* DANH SÁCH SẢN PHẨM: Mở rộng ra */}
                <Grid item xs={12} md={9} lg={9.5} xl={10}>
                    {loading ? (
                        <Box display="flex" flexDirection="column" alignItems="center" py={10}>
                            <CircularProgress sx={{ color: '#0066cc', mb: 2 }} />
                            <Typography color="textSecondary">Đang tải sản phẩm...</Typography>
                        </Box>
                    ) : (
                        <>
                            <Grid container spacing={3}>
                                {products.length > 0 ? products.map((item) => (
                                    /* lg={3} là 4 card/hàng, xl={2.4} là 5 card/hàng trên màn hình siêu lớn */
                                    <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={item.productId}>
                                        <ProductCard product={item} />
                                    </Grid>
                                )) : (
                                    <Box sx={{ width: '100%', textAlign: 'center', py: 10 }}>
                                        <FilterAltOff sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                                        <Typography variant="h6" color="textSecondary">
                                            Không tìm thấy sản phẩm phù hợp!
                                        </Typography>
                                        <Button onClick={handleReset} sx={{ mt: 2 }}>Thử lại</Button>
                                    </Box>
                                )}
                            </Grid>

                            {totalPages > 1 && (
                                <Box display="flex" justifyContent="center" mt={8}>
                                    <Pagination 
                                        count={totalPages} 
                                        page={page} 
                                        onChange={(e, val) => setPage(val)} 
                                        color="primary" 
                                        size="large"
                                    />
                                </Box>
                            )}
                        </>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
};

export default Shop;