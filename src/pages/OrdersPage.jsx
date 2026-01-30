import React, { useState, useEffect } from 'react';
import { 
    Container, Grid, Typography, Box, CircularProgress, 
    Divider, Chip, Collapse, Paper, Stack, Breadcrumbs
} from '@mui/material'; // ✅ Đã thêm Grid vào đây để sửa lỗi ReferenceError
import { 
    LocalMall, CalendarMonth, Payment, ReceiptLong, 
    KeyboardArrowDown, KeyboardArrowUp, NavigateNext, FiberManualRecord 
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import orderApi from '../api/orderApi';
import '../css/OrdersPage.css';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const userEmail = localStorage.getItem('userEmail');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const data = await orderApi.getOrdersByUser(userEmail);
                // 🔥 Sắp xếp đơn hàng mới nhất lên đầu
                const sortedData = data.sort((a, b) => b.orderId - a.orderId);
                setOrders(sortedData);
            } catch (error) {
                console.error("Lỗi tải đơn hàng:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [userEmail]);

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    const getStatusInfo = (status) => {
        switch (status) {
            case 'DELIVERED': return { color: '#00ff88', label: 'Hoàn tất' };
            case 'SHIPPED': return { color: '#00ccff', label: 'Đang giao' };
            case 'CANCELLED': return { color: '#ff4444', label: 'Đã hủy' };
            default: return { color: '#ffaa00', label: 'Chờ xử lý' };
        }
    };

    if (loading) return (
        <div className="orders-page-root flex-center">
            <CircularProgress thickness={4} size={50} sx={{ color: '#00c6ff' }} />
        </div>
    );

    return (
        <div className="orders-page-root">
            {/* Hiệu ứng chiều sâu 4D */}
            <div className="glow-orb-top"></div>
            <div className="fog-layer"></div>
            <div className="fog-layer fog-layer-2"></div>

            <Container maxWidth="md" sx={{ position: 'relative', zIndex: 10, pt: 4, pb: 10 }}>
                
                {/* --- BREADCRUMBS --- */}
                <Breadcrumbs separator={<NavigateNext fontSize="small" sx={{ color: '#aaa' }} />} sx={{ mb: 4 }}>
                    <Link to="/" className="breadcrumb-link-modern">Trang chủ</Link>
                    <Typography variant="caption" sx={{ color: '#fff', fontWeight: 800, letterSpacing: 1.5 }}>LỊCH SỬ ĐƠN HÀNG</Typography>
                </Breadcrumbs>

                <Box display="flex" alignItems="center" mb={5}>
                    <LocalMall sx={{ mr: 2, fontSize: 38, color: '#00c6ff', filter: 'drop-shadow(0 0 10px #00c6ff)' }} />
                    <Typography variant="h4" className="orders-title-4d">ĐƠN HÀNG CỦA TÔI</Typography>
                </Box>

                <AnimatePresence>
                    {orders.length === 0 ? (
                        <Box className="empty-orders-view-modern">
                            <ReceiptLong sx={{ fontSize: 80, color: '#222', mb: 2 }} />
                            <Typography variant="h6" sx={{ color: '#555' }}>Chưa có dữ liệu giao dịch</Typography>
                        </Box>
                    ) : (
                        orders.map((order, index) => {
                            const status = getStatusInfo(order.orderStatus);
                            return (
                                <motion.div 
                                    key={order.orderId}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <Paper elevation={0} className={`order-card-4d ${expandedOrder === order.orderId ? 'active' : ''}`}>
                                        {/* HEADER TÓM TẮT */}
                                        <Box className="order-summary-header" onClick={() => setExpandedOrder(expandedOrder === order.orderId ? null : order.orderId)}>
                                            <Grid container alignItems="center">
                                                <Grid item xs={6} sm={4}>
                                                    <Typography className="order-id-text">#ORD-{order.orderId}</Typography>
                                                    <Typography className="order-date-text">{order.orderDate}</Typography>
                                                </Grid>

                                                <Grid item xs={6} sm={3} textAlign="center">
                                                    <Box className="status-pill-modern">
                                                        <FiberManualRecord sx={{ fontSize: 10, color: status.color, mr: 1, filter: `drop-shadow(0 0 5px ${status.color})` }} />
                                                        <Typography sx={{ color: status.color, fontWeight: 900, fontSize: '0.7rem' }}>{status.label.toUpperCase()}</Typography>
                                                    </Box>
                                                </Grid>

                                                <Grid item xs={12} sm={5} textAlign={{ xs: 'left', sm: 'right' }} sx={{ mt: { xs: 2, sm: 0 } }}>
                                                    <Typography variant="h6" className="order-amount-text">
                                                        {formatCurrency(order.totalAmount)}
                                                    </Typography>
                                                    <Typography className="toggle-detail-label">
                                                        {expandedOrder === order.orderId ? 'THU GỌN' : 'XEM CHI TIẾT'} 
                                                        {expandedOrder === order.orderId ? <KeyboardArrowUp fontSize="small"/> : <KeyboardArrowDown fontSize="small"/>}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        {/* CHI TIẾT SẢN PHẨM */}
                                        <Collapse in={expandedOrder === order.orderId}>
                                            <Box className="order-details-body">
                                                <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.08)' }} />
                                                
                                                <Stack spacing={2}>
                                                    {order.orderItems.map((item) => (
                                                        <Box key={item.orderItemId} className="product-item-4d-row">
                                                            <div className="product-img-wrapper-4d">
                                                                <img src={`http://localhost:8080/api/products/image/${item.product.image}`} alt="p" />
                                                            </div>
                                                            <Box flexGrow={1}>
                                                                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{item.product.productName}</Typography>
                                                                <Typography sx={{ color: '#888', fontSize: '0.8rem' }}>Số lượng: <b>{item.quantity}</b></Typography>
                                                            </Box>
                                                            <Typography sx={{ color: '#fff', fontWeight: 800 }}>{formatCurrency(item.orderedProductPrice)}</Typography>
                                                        </Box>
                                                    ))}
                                                </Stack>

                                                <Box className="order-footer-meta">
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12} sm={6}>
                                                            <Box display="flex" alignItems="center" sx={{ opacity: 0.8 }}>
                                                                <Payment sx={{ fontSize: 16, mr: 1, color: '#00c6ff' }} />
                                                                <Typography sx={{ fontSize: '0.75rem', color: '#eee' }}>Thanh toán: <b>{order.payment?.paymentMethod || 'Tiền mặt'}</b></Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={12} sm={6}>
                                                            <Box display="flex" alignItems="center" sx={{ opacity: 0.8 }}>
                                                                <CalendarMonth sx={{ fontSize: 16, mr: 1, color: '#00c6ff' }} />
                                                                <Typography sx={{ fontSize: '0.75rem', color: '#eee' }}>Giao hàng: <b>2 - 4 ngày làm việc</b></Typography>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            </Box>
                                        </Collapse>
                                    </Paper>
                                </motion.div>
                            )
                        })
                    )}
                </AnimatePresence>
            </Container>
        </div>
    );
};

export default OrdersPage;