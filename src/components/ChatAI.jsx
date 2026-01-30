import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Typography, Avatar, Paper, Stack, CircularProgress, Fab, Card, CardMedia, CardContent, Button } from '@mui/material';
import { Send, SmartToy, Close, Chat, DeleteSweep } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // 🔥 Thêm để chuyển hướng
import axios from 'axios';
import '../css/ChatAI.css';

const ChatAI = () => {
    const navigate = useNavigate(); // 🔥 Hook điều hướng
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState([]); 
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Xin chào! Tôi là DunkAssistant. Bạn cần hỗ trợ gì về sản phẩm ShopDunk không?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, loading]);

    // 🔥 Hàm render nội dung tin nhắn và danh sách sản phẩm trượt ngang
    const renderMessageContent = (msg) => {
        // Tìm tất cả các khối JSON sản phẩm trong tin nhắn
        const productMatches = [...msg.text.matchAll(/FORMAT_PRODUCT:({.*?})/g)];
        let cleanText = msg.text;
        
        const products = productMatches.map(match => {
            cleanText = cleanText.replace(match[0], ""); // Xóa phần JSON khỏi text hiển thị
            try {
                return JSON.parse(match[1]);
            } catch (e) {
                return null;
            }
        }).filter(p => p !== null);

        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                className={`msg-bubble msg-${msg.role}`}
            >
                <Typography variant="body2">{cleanText.trim()}</Typography>
                
                {products.length > 0 && (
                    <Box className="product-slider"> {/* 🔥 Thanh trượt ngang */}
                        {products.map((pd, idx) => (
                            <Card key={idx} className="product-card-mini">
                                <CardMedia
                                    component="img"
                                    image={pd.image}
                                    alt={pd.name}
                                    className="product-img-full"
                                    onClick={() => navigate(`/product/${pd.id}`)} // 🔥 Chuyển hướng
                                />
                                <CardContent sx={{ p: 1 }}>
                                    <Typography 
                                        variant="caption" 
                                        className="product-name-link"
                                        onClick={() => navigate(`/product/${pd.id}`)}
                                    >
                                        {pd.name}
                                    </Typography>
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <Typography variant="caption" color="error" fontWeight="700" sx={{ fontSize: '0.7rem' }}>
                                            {pd.discountPrice?.toLocaleString()}đ
                                        </Typography>
                                        <Typography variant="caption" sx={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '0.6rem' }}>
                                            {pd.price?.toLocaleString()}đ
                                        </Typography>
                                    </Stack>
                                    <Button 
                                        fullWidth size="small" variant="contained" className="buy-btn-small"
                                        onClick={() => setInput(`Thêm ${pd.name} vào giỏ hàng`)}
                                    >
                                        Mua
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}
            </motion.div>
        );
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const userText = input;
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setInput('');
        setLoading(true);

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('message', userText);
        formData.append('history', JSON.stringify(history)); 

        try {
            const res = await axios.post('http://localhost:8080/api/chat/ask', formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
            const aiReply = data.reply || "Tôi chưa hiểu ý bạn lắm...";

            setMessages(prev => [...prev, { role: 'ai', text: aiReply }]);
            setHistory(prev => [
                ...prev,
                { role: 'user', parts: [{ text: userText }] },
                { role: 'model', parts: [{ text: aiReply }] }
            ]);

            if (aiReply.toLowerCase().includes("giỏ hàng") || aiReply.toLowerCase().includes("đã thêm")) {
                window.dispatchEvent(new Event("cartUpdated"));
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', text: 'AI bận rồi, thử lại sau nhé!' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className="chat-ai-fixed">
            <Fab className="chat-fab" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <Close /> : <Chat />}
            </Fab>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        style={{ position: 'absolute', bottom: 70, right: 0 }}
                    >
                        <Paper className="chat-window">
                            <Box className="chat-header">
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Avatar sx={{ width: 28, height: 28, bgcolor: '#fff' }}>
                                            <SmartToy sx={{ color: '#1d1d1f', fontSize: 18 }} />
                                        </Avatar>
                                        <Typography variant="subtitle2" fontWeight="700">DunkAssistant</Typography>
                                    </Stack>
                                    <IconButton size="small" onClick={() => {setMessages([]); setHistory([]);}} sx={{ color: '#fff' }}>
                                        <DeleteSweep fontSize="small" />
                                    </IconButton>
                                </Stack>
                            </Box>

                            <Box className="chat-body" ref={scrollRef}>
                                {messages.map((msg, i) => (
                                    <Box key={i} sx={{ display: 'flex', flexDirection: 'column' }}>
                                        {renderMessageContent(msg)}
                                    </Box>
                                ))}
                                {loading && (
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 1 }}>
                                        <CircularProgress size={12} color="inherit" />
                                        <Typography variant="caption" color="textSecondary">Đang soạn...</Typography>
                                    </Box>
                                )}
                            </Box>

                            <Box className="chat-footer">
                                <Stack direction="row" spacing={1}>
                                    <TextField
                                        fullWidth size="small"
                                        placeholder="Hỏi ShopDunk..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        sx={{ "& .MuiInputBase-root": { fontSize: '0.85rem', borderRadius: '20px' } }}
                                    />
                                    <IconButton 
                                        onClick={handleSend} 
                                        size="small"
                                        sx={{ bgcolor: '#0071e3', color: '#fff' }}
                                    >
                                        <Send fontSize="inherit" />
                                    </IconButton>
                                </Stack>
                            </Box>
                        </Paper>
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
};

export default ChatAI;