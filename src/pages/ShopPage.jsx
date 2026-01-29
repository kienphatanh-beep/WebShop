import React, { useEffect, useState } from 'react';
import { Typography, Button, Box } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Import Component con
import LatestProducts from '../components/LatestProducts'; 

// CSS trang Home (chỉ còn giữ style của Banner)
import '../css/Home.css'; 

// Danh sách Banner
const banners = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1556656793-02715d8dd6f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80",
        title: "Chào mừng đến với ShopDunk",
        subtitle: "Công nghệ chính hãng - Giá tốt nhất thị trường"
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80",
        title: "Sản phẩm công nghệ mới",
        subtitle: "Cập nhật xu hướng công nghệ hàng đầu thế giới"
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80",
        title: "Ưu đãi mùa hè",
        subtitle: "Giảm giá lên đến 50% cho các phụ kiện"
    }
];

const Home = () => {
    const [currentBanner, setCurrentBanner] = useState(0);

    // Logic Banner tự chạy
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // Scroll lên đầu trang khi vào Home
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <Box className="home-container">
            
            {/* --- PHẦN 1: BANNER SLIDER --- */}
            <Box className="banner-container">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentBanner}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        style={{ width: '100%', height: '100%', position: 'absolute' }}
                    >
                        <img 
                            src={banners[currentBanner].image} 
                            alt="Banner" 
                            className="banner-image" 
                        />
                        <div className="banner-overlay"></div>
                        <div className="banner-content">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
                                    {banners[currentBanner].title}
                                </Typography>
                                <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
                                    {banners[currentBanner].subtitle}
                                </Typography>
                                <Button variant="contained" color="primary" size="large" endIcon={<ArrowForward />}>
                                    Xem ngay
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </Box>

            {/* --- PHẦN 2: SẢN PHẨM MỚI NHẤT (Component riêng) --- */}
            <LatestProducts />

        </Box>
    );
};

export default Home;