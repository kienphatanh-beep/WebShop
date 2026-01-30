import React, { useEffect, useState } from 'react';
import { Grid, Typography, Box, Button, CircularProgress } from '@mui/material';
import { ArrowForwardIos } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import ProductCard from './ProductCard';

const RelatedProducts = ({ categoryId, currentProductId }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRelated = async () => {
            if (!categoryId) return;
            try {
                setLoading(true);
                // Lấy 9 sản phẩm để trừ đi sản phẩm hiện tại, còn lại tối đa 8 (2 dòng x 4)
                const res = await api.searchProducts({ 
                    categoryId: categoryId, 
                    pageSize: 9, 
                    sortBy: 'productId', 
                    sortOrder: 'desc' 
                });
                
                // Lọc bỏ sản phẩm đang xem khỏi danh sách liên quan
                const filtered = (res.content || []).filter(p => p.productId !== currentProductId).slice(0, 8);
                setProducts(filtered);
            } catch (error) {
                console.error("Lỗi lấy sản phẩm liên quan:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRelated();
    }, [categoryId, currentProductId]);

    if (loading) return <Box sx={{ textAlign: 'center', py: 5 }}><CircularProgress size={30} /></Box>;
    if (products.length === 0) return null;

    return (
        <Box sx={{ mt: 10, mb: 5 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h5" fontWeight="800" sx={{ color: '#1d1d1f' }}>
                    Sản phẩm tương tự
                </Typography>
                <Button 
                    onClick={() => navigate(`/shop?categoryId=${categoryId}`)}
                    endIcon={<ArrowForwardIos sx={{ fontSize: '12px !important' }} />}
                    sx={{ color: '#0066cc', fontWeight: 700, textTransform: 'none' }}
                >
                    Xem thêm
                </Button>
            </Box>

            <Grid container spacing={3}>
                {products.map((item) => (
                    <Grid item xs={12} sm={6} md={3} key={item.productId}>
                        <ProductCard product={item} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default RelatedProducts;