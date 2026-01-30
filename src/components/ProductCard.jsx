import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const API_BASE_URL = 'http://localhost:8080/api';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN').format(val) + "đ";

    return (
        <Card 
            component={motion.div}
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3 }}
            className="premium-product-card"
            onClick={() => navigate(`/products/${product.productId}`)}
            sx={{ opacity: 1 }} // Đảm bảo luôn hiện
        >
            <Box className="card-image-container">
                <CardMedia
                    component="img"
                    image={product.image ? `${API_BASE_URL}/products/image/${product.image}` : "https://via.placeholder.com/300"}
                    alt={product.productName}
                    className="card-image-main"
                />
            </Box>
            
            <CardContent sx={{ p: 3, textAlign: 'center', background: '#fff' }}>
                <Typography className="product-title-main" variant="h6">
                    {product.productName}
                </Typography>
                
                <Box className="price-stack">
                    <Typography className="special-price-text">
                        {formatCurrency(product.specialPrice || product.price)}
                    </Typography>
                    {product.discount > 0 && (
                        <Typography className="original-price-text">
                            {formatCurrency(product.price)}
                        </Typography>
                    )}
                </Box>

                <Button fullWidth className="view-detail-btn">
                    Xem chi tiết
                </Button>
            </CardContent>
        </Card>
    );
};

export default ProductCard;