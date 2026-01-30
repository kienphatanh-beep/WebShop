import React, { useState } from 'react';
import { 
    Button, TextField, Typography, Box, 
    InputAdornment, IconButton, Link, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    AccountCircle, Lock, Visibility, VisibilityOff, 
    Login as LoginIcon, CheckCircleOutline 
} from '@mui/icons-material';

import authApi from '../api/authApi'; 
import '../css/LoginPage.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState(''); 
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            const data = await authApi.login(email, password);

            // 1. Kiểm tra và lấy Token (Hỗ trợ cả 'jwt-token' và 'jwtToken')
            const token = data['jwt-token'] || data.jwtToken || data.token;
            // 2. Lấy email và userId từ dữ liệu Backend trả về
            const userEmail = data.email || email; 
            const userId = data.userId;

            if (token) {
                setSuccessMsg(data.message || "Đăng nhập thành công!");
                
                // 🔥 LƯU ĐỒNG BỘ VÀO LOCAL STORAGE (Rất quan trọng cho trang Profile)
                localStorage.setItem('token', token);
                localStorage.setItem('userEmail', userEmail); 
                if (userId) localStorage.setItem('userId', userId);
                localStorage.setItem('userRoles', JSON.stringify(data.roles || []));

                // Chờ 1 chút để user thấy thông báo thành công
                setTimeout(() => {
                    navigate('/');
                    window.location.reload(); 
                }, 1000);
            } else {
                throw new Error("Thông tin xác thực không hợp lệ!");
            }

        } catch (err) {
            console.error("Login Error:", err);
            const backendError = err.response?.data?.message || "Sai tài khoản hoặc mật khẩu!";
            setError(backendError);
            setLoading(false);
        }
    };

    const formVariant = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { 
            opacity: 1, scale: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
        <div className="login-container">
            <div className="fog-layer"></div>
            <div className="fog-layer fog-layer-2"></div>

            <motion.div
                variants={formVariant}
                initial="hidden"
                animate="visible"
                style={{
                    background: 'rgba(30, 30, 30, 0.75)', 
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    padding: '35px 30px',
                    width: '90%',
                    maxWidth: '380px',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    zIndex: 10,
                    margin: '20px'
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                    <motion.div
                        initial={{ y: -10 }} animate={{ y: 0 }}
                        transition={{ repeat: Infinity, duration: 2, repeatType: "reverse", ease: "easeInOut" }}
                        style={{
                            width: 60, height: 60,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #ffffff, #b0b0b0)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '15px',
                            boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
                        }}
                    >
                        <LoginIcon sx={{ color: '#1a1a1a', fontSize: 30 }} />
                    </motion.div>

                    <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, letterSpacing: '1px' }}>
                        WELCOME BACK
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>
                        Đăng nhập để tiếp tục mua sắm
                    </Typography>
                </Box>

                <form onSubmit={handleLogin}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <TextField
                            fullWidth size="small"
                            placeholder="Email của bạn"
                            variant="outlined"
                            className="custom-textfield"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AccountCircle sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 22 }} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth size="small"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Mật khẩu"
                            variant="outlined"
                            className="custom-textfield"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 22 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end" size="small"
                                            sx={{ color: 'rgba(255,255,255,0.4)' }}
                                        >
                                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Link sx={{ color: '#aaa', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'none', '&:hover': { color: '#fff' } }}>
                                Quên mật khẩu?
                            </Link>
                        </Box>

                        <AnimatePresence>
                            {error && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                    <Alert severity="error" sx={{ bgcolor: 'rgba(211, 47, 47, 0.2)', color: '#ff8a80', borderRadius: '8px', fontSize: '0.8rem' }}>
                                        {error}
                                    </Alert>
                                </motion.div>
                            )}
                            
                            {successMsg && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                                    <Alert 
                                        icon={<CheckCircleOutline fontSize="inherit" />} 
                                        severity="success" 
                                        sx={{ bgcolor: 'rgba(76, 175, 80, 0.2)', color: '#b9f6ca', borderRadius: '8px', fontSize: '0.8rem' }}
                                    >
                                        {successMsg}
                                    </Alert>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    py: 1.2,
                                    borderRadius: '10px',
                                    background: loading ? '#555' : '#fff', 
                                    color: '#000',
                                    fontSize: '0.95rem',
                                    fontWeight: 'bold',
                                    textTransform: 'none',
                                    '&:hover': { background: '#f0f0f0' },
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                                }}
                            >
                                {loading ? 'Đang xác thực...' : 'Đăng nhập ngay'}
                            </Button>
                        </motion.div>

                        <Box sx={{ textAlign: 'center', mt: 1 }}>
                            <Typography variant="caption" sx={{ color: '#777' }}>
                                Bạn là người mới?{' '}
                                <Link 
                                    component="button"
                                    onClick={() => navigate('/register')}
                                    sx={{ color: '#fff', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.75rem', '&:hover': { textDecoration: 'underline' } }}
                                >
                                    Tạo tài khoản
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </form>
            </motion.div>
        </div>
    );
};

export default LoginPage;