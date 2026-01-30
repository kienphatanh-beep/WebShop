import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api'; 
import { Container, Typography, Button, Box, Skeleton, Stack } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard'; 
import '../css/LatestProducts.css'; 

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 15 } }
};

const LatestProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatestProducts = async () => {
            try {
                const params = { pageNumber: 0, pageSize: 5, sortBy: 'productId', sortOrder: 'desc' };
                const res = await api.searchProducts(params);
                setProducts(res.content || []);
            } catch (error) {
                console.error("Lỗi tải sản phẩm:", error);
            } finally { setLoading(false); }
        };
        fetchLatestProducts();
    }, []);

    return (
        <Box component="section" className="latest-section-root">
            <Container maxWidth="xl">
                <motion.div 
                    className="glass-main-card"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }} 
                    transition={{ duration: 0.8 }}
                >
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mb={5} spacing={2}>
                        <Box>
                            <Typography className="tag-new">LATEST COLLECTION</Typography>
                            <Typography variant="h4" fontWeight="800" color="#1d1d1f">Sản phẩm mới nhất</Typography>
                        </Box>
                        <Button component={Link} to="/shop" endIcon={<ArrowForward />} className="btn-apple-link">
                            Xem tất cả
                        </Button>
                    </Stack>

                    <Box sx={{ width: '100%' }}>
                        {loading ? (
                            <Box className="latest-grid-5">
                                {Array.from(new Array(5)).map((_, i) => (
                                    <Skeleton key={i} variant="rectangular" height={320} sx={{ borderRadius: '16px' }} />
                                ))}
                            </Box>
                        ) : (
                            /* SỬA TẠI ĐÂY: Biến motion.div thành lưới Grid chính */
                            <motion.div 
                                className="latest-grid-5" 
                                variants={containerVariants}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true }}
                            >
                                {products.slice(0, 5).map((product) => (
                                    <motion.div key={product.productId} variants={itemVariants}>
                                        <ProductCard product={product} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </Box>
                </motion.div>
            </Container>
        </Box>
    );
};

export default LatestProducts;