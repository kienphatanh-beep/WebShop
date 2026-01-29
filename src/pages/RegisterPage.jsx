import React, { useState, useRef } from 'react';
import { 
    Button, TextField, Typography, Box, 
    InputAdornment, Link, Grid 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Person, Email, Lock, Phone, HowToReg, CloudUpload 
} from '@mui/icons-material';

import authApi from '../api/authApi';
import '../css/RegisterPage.css'; 

const RegisterPage = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '', 
        password: '', avatar: null, avatarName: ''
    });
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ 
                ...formData, 
                avatar: file, // Lưu file object vào state
                avatarName: file.name 
            });
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Tạo FormData để gửi file
        const data = new FormData();
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('firstName', formData.firstName);
        data.append('lastName', formData.lastName);
        data.append('phone', formData.phone); // Gửi SĐT với key 'phone' khớp backend
        
        // [QUAN TRỌNG] Đổi tên key từ 'avatar' thành 'image' để khớp với @RequestParam("image") ở Java
        if (formData.avatar) {
            data.append('image', formData.avatar); 
        }

        try {
            await authApi.register(data);
            alert("Đăng ký thành công! Vui lòng đăng nhập.");
            navigate('/login');
        } catch (err) {
            console.error(err);
            // Hiển thị lỗi chi tiết từ backend nếu có
            const msg = err.response?.data?.message || "Đăng ký thất bại! Vui lòng kiểm tra lại.";
            setError(msg);
            setLoading(false);
        }
    };

    const formVariant = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } }
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
                    background: 'rgba(30, 30, 30, 0.8)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    padding: '30px 40px',
                    width: '95%',
                    maxWidth: '700px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    zIndex: 10
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                    <motion.div
                        initial={{ rotate: -10 }} animate={{ rotate: 0 }}
                        transition={{ repeat: Infinity, duration: 2, repeatType: "reverse", ease: "easeInOut" }}
                        style={{
                            width: 60, height: 60, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #00c6ff, #0072ff)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '10px', boxShadow: '0 0 15px rgba(0, 198, 255, 0.5)'
                        }}
                    >
                        <HowToReg sx={{ color: '#fff', fontSize: 30 }} />
                    </motion.div>

                    <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                        Create Account
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                        Tham gia ngay để trải nghiệm
                    </Typography>
                </Box>

                <form onSubmit={handleRegister}>
                    <Grid container spacing={2} justifyContent="center">
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth name="firstName" placeholder="Họ" className="custom-textfield"
                                value={formData.firstName} onChange={handleChange}
                                InputProps={{ startAdornment: (<InputAdornment position="start"><Person sx={{ color: '#aaa', fontSize: 20 }} /></InputAdornment>) }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth name="lastName" placeholder="Tên" className="custom-textfield"
                                value={formData.lastName} onChange={handleChange}
                                InputProps={{ startAdornment: (<InputAdornment position="start"><Person sx={{ color: '#aaa', fontSize: 20 }} /></InputAdornment>) }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth name="email" placeholder="Email" className="custom-textfield"
                                value={formData.email} onChange={handleChange}
                                InputProps={{ startAdornment: (<InputAdornment position="start"><Email sx={{ color: '#aaa', fontSize: 20 }} /></InputAdornment>) }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth name="phone" placeholder="Số điện thoại" className="custom-textfield"
                                value={formData.phone} onChange={handleChange}
                                InputProps={{ startAdornment: (<InputAdornment position="start"><Phone sx={{ color: '#aaa', fontSize: 20 }} /></InputAdornment>) }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth name="password" type="password" 
                                placeholder="Mật khẩu" className="custom-textfield"
                                value={formData.password} onChange={handleChange}
                                InputProps={{
                                    startAdornment: (<InputAdornment position="start"><Lock sx={{ color: '#aaa', fontSize: 20 }} /></InputAdornment>)
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                            <TextField fullWidth 
                                placeholder="Chọn ảnh đại diện..." 
                                className="custom-textfield"
                                value={formData.avatarName}
                                onClick={() => fileInputRef.current.click()}
                                InputProps={{
                                    readOnly: true,
                                    startAdornment: (<InputAdornment position="start"><CloudUpload sx={{ color: '#aaa', fontSize: 20 }} /></InputAdornment>),
                                    style: { cursor: 'pointer' }
                                }}
                            />
                        </Grid>
                    </Grid>

                    {error && <Typography color="error" align="center" variant="caption" sx={{ display: 'block', mt: 2 }}>{error}</Typography>}

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                disabled={loading}
                                sx={{
                                    py: 1, px: 5, minWidth: '180px', borderRadius: '8px',
                                    background: '#fff', color: '#000', fontSize: '1rem', fontWeight: 'bold', textTransform: 'none',
                                    boxShadow: '0 4px 10px rgba(255, 255, 255, 0.2)',
                                    '&:hover': { background: '#f0f0f0', boxShadow: '0 6px 15px rgba(255, 255, 255, 0.3)' }
                                }}
                            >
                                {loading ? 'Đang xử lý...' : 'Đăng Ký'}
                            </Button>
                        </motion.div>
                    </Box>

                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Typography variant="caption" sx={{ color: '#ccc' }}>
                            Đã có tài khoản?{' '}
                            <Link component="button" onClick={() => navigate('/login')} sx={{ color: '#fff', fontWeight: 'bold', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                Đăng nhập ngay
                            </Link>
                        </Typography>
                    </Box>
                </form>
            </motion.div>
        </div>
    );
};

export default RegisterPage;