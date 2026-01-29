import React, { useEffect, useState } from 'react';
import api from '../api/api'; 
import { 
    Container, Typography, Button, Box, Skeleton 
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard'; 
import '../css/LatestProducts.css'; 

const LatestProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Logic gọi API lấy sản phẩm mới nhất (Hỗ trợ chuẩn HATEOAS)
    useEffect(() => {
        const fetchLatestProducts = async () => {
            try {
                const params = {
                    pageNumber: 0,
                    pageSize: 5, // Lấy 5 sản phẩm
                    sortBy: 'productId', 
                    sortOrder: 'desc'    
                };
                // 🔥 api.searchProducts đã được cập nhật để lấy dữ liệu từ _embedded.productDTOList
                const res = await api.searchProducts(params);
                
                if (res?.content && Array.isArray(res.content)) {
                    setProducts(res.content);
                } else {
                    setProducts([]);
                }
            } catch (error) {
                console.error("Lỗi tải sản phẩm mới:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestProducts();
    }, []);

    return (
        <Container maxWidth="xl" className="latest-products-section">
            <Box textAlign="center" mb={4}>
                <Typography variant="h4" className="section-title">
                    Sản phẩm mới nhất
                </Typography>
            </Box>

            <Box className="product-grid-5">
                {loading ? (
                    Array.from(new Array(5)).map((_, index) => (
                        <Box key={index}>
                            <Skeleton variant="rectangular" height={380} sx={{ borderRadius: 3 }} />
                            <Skeleton width="60%" sx={{ mt: 1 }} />
                            <Skeleton width="40%" />
                        </Box>
                    ))
                ) : products.length > 0 ? (
                    products.map((product, index) => (
                        <motion.div 
                            key={product.productId}
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: index * 0.1 }}
                            style={{ height: '100%' }}
                        >
                            {/* ProductCard đã cập nhật để dùng HATEOAS links cho ảnh */}
                            <ProductCard product={product} />
                        </motion.div>
                    ))
                ) : (
                    <Box sx={{ gridColumn: "1 / -1", textAlign: "center", py: 5 }}>
                        <Typography variant="h6" color="textSecondary">Chưa có sản phẩm nào!</Typography>
                    </Box>
                )}
            </Box>

            <Box textAlign="center" mt={6}>
                <Button variant="outlined" size="large" color="primary" endIcon={<ArrowForward />}>
                    Xem tất cả sản phẩm
                </Button>
            </Box>
        </Container>
    );
};

export default LatestProducts;