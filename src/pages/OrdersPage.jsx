import React, { useState, useEffect } from 'react';
import { 
    Container, Grid, Typography, Box, Button, CircularProgress, 
    Divider, Chip, Collapse, Paper
} from '@mui/material';
import { LocalMall, CalendarMonth, Payment, ReceiptLong, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import orderApi from '../api/orderApi';
import '../css/OrdersPage.css';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null); // Để đóng/mở chi tiết đơn hàng
    const userEmail = localStorage.getItem('userEmail');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await orderApi.getOrdersByUser(userEmail);
                setOrders(data);
            } catch (error) {
                console.error("Lỗi tải đơn hàng:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [userEmail]);

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    const toggleOrder = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    if (loading) return (
        <div className="orders-page-root flex-center">
            <CircularProgress sx={{ color: '#fff' }} />
        </div>
    );

    return (
        <div className="orders-page-root">
            <div className="fog-layer"></div>
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, py: 8 }}>
                <Typography variant="h4" className="page-title">
                    <LocalMall sx={{ mr: 2, fontSize: 35 }} /> LỊCH SỬ ĐƠN HÀNG
                </Typography>

                <AnimatePresence>
                    {orders.length === 0 ? (
                        <Box className="empty-orders-card">
                            <ReceiptLong sx={{ fontSize: 80, opacity: 0.2, mb: 2 }} />
                            <Typography variant="h6">Bạn chưa có đơn hàng nào!</Typography>
                        </Box>
                    ) : (
                        orders.map((order, index) => (
                            <motion.div 
                                key={order.orderId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="order-glass-card"
                            >
                                {/* Header của mỗi đơn hàng */}
                                <Box className="order-header" onClick={() => toggleOrder(order.orderId)}>
                                    <Grid container alignItems="center">
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle1" fontWeight="900" sx={{ color: '#00ff88' }}>
                                                MÃ ĐƠN: #ORD-{order.orderId}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#aaa' }}>
                                                Trạng thái: <Chip label={order.orderStatus} size="small" className="status-chip" />
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' }, mt: { xs: 2, sm: 0 } }}>
                                            <Typography variant="h6" fontWeight="900">
                                                {formatCurrency(order.totalAmount)}
                                            </Typography>
                                            <Button size="small" endIcon={expandedOrder === order.orderId ? <KeyboardArrowUp /> : <KeyboardArrowDown />}>
                                                Chi tiết
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>

                                {/* Chi tiết đơn hàng (Sản phẩm + Thông tin thanh toán) */}
                                <Collapse in={expandedOrder === order.orderId}>
                                    <Box className="order-details-body">
                                        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                                        
                                        {/* Thông tin meta */}
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} mb={3}>
                                            <Box className="meta-item">
                                                <CalendarMonth sx={{ fontSize: 18, mr: 1, color: '#00ccff' }} />
                                                <Typography variant="body2">Ngày đặt: <b>{order.orderDate}</b></Typography>
                                            </Box>
                                            <Box className="meta-item">
                                                <Payment sx={{ fontSize: 18, mr: 1, color: '#00ccff' }} />
                                                <Typography variant="body2">Thanh toán: <b>{order.payment?.paymentMethod || 'Tiền mặt'}</b></Typography>
                                            </Box>
                                        </Stack>

                                        {/* Danh sách sản phẩm trong đơn */}
                                        <Typography variant="subtitle2" sx={{ mb: 2, opacity: 0.7 }}>SẢN PHẨM ĐÃ MUA:</Typography>
                                        {order.orderItems.map((item) => (
                                            <Box key={item.orderItemId} className="product-row-item">
                                                <img src={`http://localhost:8080/api/products/image/${item.product.image}`} alt="" className="order-item-img" />
                                                <Box flexGrow={1}>
                                                    <Typography variant="body1" fontWeight="700">{item.product.productName}</Typography>
                                                    <Typography variant="caption" sx={{ color: '#888' }}>Số lượng: {item.quantity}</Typography>
                                                </Box>
                                                <Box textAlign="right">
                                                    <Typography variant="body2" fontWeight="700" color="#00ff88">
                                                        {formatCurrency(item.orderedProductPrice)}
                                                    </Typography>
                                                    {item.discount > 0 && (
                                                        <Typography variant="caption" sx={{ textDecoration: 'line-through', opacity: 0.5 }}>
                                                            {formatCurrency(item.orderedProductPrice / (1 - item.discount/100))}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Collapse>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </Container>
        </div>
    );
};

// Helper components cho layout
const Stack = ({ children, direction = 'row', spacing = 0, mb = 0 }) => (
    <Box sx={{ display: 'flex', flexDirection: direction, gap: spacing, mb: mb }}>{children}</Box>
);

export default OrdersPage;