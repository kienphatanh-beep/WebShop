import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LocalOffer } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import '../css/ProductCard.css';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();

    const imageUrl = product._links?.image?.href || "https://via.placeholder.com/300";

    const originalPrice = (product.discount > 0)
        ? product.price / (1 - product.discount / 100)
        : null;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(amount).replace(/\s₫/, 'đ');
    };

    const handleCardClick = () => {
        navigate(`/products/${product.productId}`);
    };

    return (
        <Card className="product-card" onClick={handleCardClick}>
            {/* BADGE GIẢM GIÁ */}
            {product.discount > 0 && (
                <Box className="discount-badge">Giảm {product.discount}%</Box>
            )}

            {/* BADGE TRẠNG THÁI */}
            <Box className="new-badge">
                <LocalOffer sx={{ fontSize: 12 }} /> Mới
            </Box>

            {/* KHUNG CHỨA ẢNH - Fix tỷ lệ 1:1 */}
            <Box className="card-image-wrapper">
                <img 
                    src={imageUrl} 
                    alt={product.productName}
                    className="card-image"
                />
            </Box>

            {/* NỘI DUNG CHỮ */}
            <CardContent className="card-content">
                <Typography variant="subtitle1" className="product-title" title={product.productName}>
                    {product.productName}
                </Typography>

                <Box className="price-section">
                    <Typography className="current-price">
                        {formatCurrency(product.price)}
                    </Typography>
                    
                    {/* Luôn render Box này để giữ khoảng cách (layout ổn định) */}
                    <Box className="original-price-container">
                        {product.discount > 0 && originalPrice ? (
                            <Typography className="original-price">
                                {formatCurrency(originalPrice)}
                            </Typography>
                        ) : (
                            <Typography className="original-price-placeholder">&nbsp;</Typography>
                        )}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ProductCard;