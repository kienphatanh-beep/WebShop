import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Grid, Box, CircularProgress, Pagination } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import ProductCard from '../components/ProductCard';
import ShopFilters from '../components/ShopFilters';
import '../css/Shop.css';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

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
            keyword, categoryId: categoryId || null,
            minPrice: priceRange[0], maxPrice: priceRange[1],
            pageNumber: page - 1, pageSize: 15, // Hiển thị 15 để chia hết cho 5 cột
            sortBy, sortOrder
        };
        try {
            const res = await api.searchProducts(params);
            setProducts(res.content || []);
            setTotalPages(res.totalPages || 1);
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    }, [keyword, categoryId, priceRange, sortBy, sortOrder, page]);

    useEffect(() => { fetchShopData(); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [fetchShopData]);

    const handleCategoryClick = (id) => {
        setPage(1);
        if (id === "all") navigate('/shop');
        else navigate(`/shop?categoryId=${id}${keyword ? `&keyword=${keyword}` : ""}`);
    };

    return (
        <Box className="light-shop-root">
            {/* THANH LỌC DẠNG NỔI (Floating section) */}
            <Box className="sticky-filter-section">
                <Container maxWidth="xl">
                    <ShopFilters 
                        categories={categories} categoryId={categoryId} keyword={keyword}
                        priceRange={priceRange} setPriceRange={setPriceRange}
                        sortBy={sortBy} setSortBy={setSortBy}
                        sortOrder={sortOrder} setSortOrder={setSortOrder}
                        handleReset={() => navigate('/shop')} 
                        handleCategoryClick={handleCategoryClick}
                        onApply={() => setPage(1)}
                    />
                </Container>
            </Box>

            {/* DANH SÁCH SẢN PHẨM */}
            <Container maxWidth={false} sx={{ px: { xs: 2, md: 6, xl: 10 }, pb: 8 }}>
                <AnimatePresence mode="wait">
                    {loading ? (
                        <Box className="flex-center" height="45vh">
                            <CircularProgress sx={{ color: '#000' }} size={50} thickness={4} />
                        </Box>
                    ) : (
                        <motion.div variants={containerVariants} initial="hidden" animate="show">
                            <Grid container spacing={3.5}>
                                {products.map((item) => (
                                    /* 🔥 xl={2.4} tạo 5 cột đều nhau trên màn hình Desktop lớn */
                                    <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={item.productId}>
                                        <motion.div variants={itemVariants}>
                                            <ProductCard product={item} />
                                        </motion.div>
                                    </Grid>
                                ))}
                            </Grid>
                            
                            {/* PHÂN TRANG HIỆN ĐẠI */}
                            {totalPages > 1 && (
                                <Box display="flex" justifyContent="center" mt={12}>
                                    <Pagination 
                                        count={totalPages} 
                                        page={page} 
                                        onChange={(e, v) => setPage(v)} 
                                        className="modern-pagination" 
                                        size="large" 
                                    />
                                </Box>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </Container>
        </Box>
    );
};

export default Shop;