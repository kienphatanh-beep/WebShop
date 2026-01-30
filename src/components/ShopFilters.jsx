import React from 'react';
import { 
    Box, Typography, MenuItem, Select, FormControl, 
    Slider, Button, Stack, Chip, Popover, IconButton, Tooltip
} from '@mui/material';
import { RestartAlt, KeyboardArrowDown, SearchOff, Tune } from '@mui/icons-material';
import { motion } from 'framer-motion';

const ShopFilters = ({ 
    categories, categoryId, keyword, priceRange, setPriceRange, 
    sortBy, sortOrder, setSortBy, setSortOrder, handleReset, handleCategoryClick, onApply 
}) => {
    const [priceAnchor, setPriceAnchor] = React.useState(null);
    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN').format(val) + "đ";

    return (
        <motion.div 
            initial={{ y: -50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="horizontal-filter-bar"
        >
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
                
                {/* 1. DANH MỤC DẠNG CHIPS (Trượt ngang) */}
                <Box className="category-scroll-container" sx={{ width: { xs: '100%', lg: '58%' } }}>
                    <Stack direction="row" spacing={1.5}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Chip 
                                label="Tất cả" 
                                onClick={() => handleCategoryClick("all")}
                                className={`modern-chip ${!categoryId ? 'active' : ''}`}
                            />
                        </motion.div>
                        {categories.map((cat, index) => (
                            <motion.div 
                                key={cat.categoryId}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Chip 
                                    label={cat.categoryName}
                                    onClick={() => handleCategoryClick(cat.categoryId)}
                                    className={`modern-chip ${categoryId === String(cat.categoryId) ? 'active' : ''}`}
                                />
                            </motion.div>
                        ))}
                    </Stack>
                </Box>

                {/* 2. CÁC NÚT ĐIỀU KHIỂN */}
                <Stack direction="row" spacing={2} alignItems="center">
                    <Button 
                        variant="outlined" 
                        sx={{ borderRadius: '14px', textTransform: 'none', color: '#1d1d1f', borderColor: '#d2d2d7', px: 2, height: '40px' }}
                        startIcon={<Tune sx={{ fontSize: 18 }} />}
                        endIcon={<KeyboardArrowDown />}
                        onClick={(e) => setPriceAnchor(e.currentTarget)}
                    >
                        Khoảng giá
                    </Button>

                    <FormControl size="small" sx={{ minWidth: 170 }}>
                        <Select 
                            value={`${sortBy}-${sortOrder}`} 
                            onChange={(e) => {
                                const [by, order] = e.target.value.split('-');
                                setSortBy(by); setSortOrder(order); onApply();
                            }}
                            sx={{ borderRadius: '14px', height: '40px', bgcolor: '#fff' }}
                        >
                            <MenuItem value="price-asc">Giá: Thấp đến cao</MenuItem>
                            <MenuItem value="price-desc">Giá: Cao đến thấp</MenuItem>
                            <MenuItem value="productName-asc">Tên: A - Z</MenuItem>
                            <MenuItem value="productId-desc">Mới nhất</MenuItem>
                        </Select>
                    </FormControl>

                    <Tooltip title="Xóa tất cả bộ lọc">
                        <IconButton onClick={handleReset} sx={{ bgcolor: 'rgba(0,0,0,0.04)', borderRadius: '12px', width: '40px', height: '40px' }}>
                            <RestartAlt />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>

            {/* POPOVER LỌC GIÁ */}
            <Popover
                open={Boolean(priceAnchor)}
                anchorEl={priceAnchor}
                onClose={() => setPriceAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                PaperProps={{ className: 'filter-popover-paper' }}
            >
                <Box sx={{ p: 4, width: 320 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight="700" color="#000">
                        PHẠM VI GIÁ
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
                        {formatCurrency(priceRange[0])} — {formatCurrency(priceRange[1])}
                    </Typography>
                    <Slider
                        value={priceRange}
                        onChange={(e, val) => setPriceRange(val)}
                        min={0} max={50000000} step={1000000}
                        sx={{ color: '#000', mb: 3 }}
                    />
                    <Button 
                        fullWidth 
                        variant="contained" 
                        sx={{ bgcolor: '#000', borderRadius: '12px', py: 1.2, fontWeight: 700, '&:hover': { bgcolor: '#333' } }}
                        onClick={() => { onApply(); setPriceAnchor(null); }}
                    >
                        ÁP DỤNG
                    </Button>
                </Box>
            </Popover>

            {keyword && (
                <Box sx={{ mt: 2 }}>
                    <Chip 
                        icon={<SearchOff sx={{ fontSize: '1rem !important' }} />}
                        label={`Kết quả cho: "${keyword}"`}
                        onDelete={handleReset}
                        sx={{ borderRadius: '10px', fontWeight: 500, bgcolor: 'rgba(0,0,0,0.05)' }}
                    />
                </Box>
            )}
        </motion.div>
    );
};

export default ShopFilters;