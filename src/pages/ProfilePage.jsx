import React, { useState, useEffect, useCallback } from 'react';
import { 
    Container, Grid, Box, Typography, TextField, Button, Avatar, 
    Paper, Tabs, Tab, IconButton, CircularProgress, Snackbar, Alert, Divider, InputAdornment
} from '@mui/material';
import { 
    PhotoCamera, Person, Lock, Home, Save, Edit, VerifiedUser, AddLocation,
    Visibility, VisibilityOff 
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import userApi from '../api/userApi';
import '../css/ProfilePage.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [tabIndex, setTabIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ open: false, text: '', type: 'success' });

    // Quản lý ẩn hiện mật khẩu cho từng ô
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    // Form states
    const [formData, setFormData] = useState({ firstName: '', lastName: '', mobileNumber: '' });
    const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });

    const fetchUserData = useCallback(async () => {
        const email = localStorage.getItem('userEmail');
        if (!email || email === 'null') { navigate('/login'); return; }
        try {
            setLoading(true);
            const data = await userApi.getUserByEmail(email);
            setUser(data);
            setFormData({ 
                firstName: data.firstName || '', 
                lastName: data.lastName || '', 
                mobileNumber: data.mobileNumber || '' 
            });
            localStorage.setItem('userId', data.userId);
        } catch (error) {
            setMsg({ open: true, text: 'Hết phiên đăng nhập!', type: 'error' });
            navigate('/login');
        } finally { setLoading(false); }
    }, [navigate]);

    useEffect(() => { fetchUserData(); }, [fetchUserData]);

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSaving(true);
        try {
            const userId = user?.userId || localStorage.getItem('userId');
            await userApi.uploadAvatar(userId, file);
            setMsg({ open: true, text: 'Đã cập nhật ảnh đại diện!', type: 'success' });
            fetchUserData();
        } catch (error) {
            setMsg({ open: true, text: 'Lỗi upload ảnh!', type: 'error' });
        } finally { setSaving(false); }
    };

    const handleUpdateProfile = async () => {
        setSaving(true);
        try {
            const userId = user?.userId || localStorage.getItem('userId');
            // 🔥 FIX LỖI 403/NULL: Luôn gửi kèm email hiện tại của User
            const payload = {
                ...formData,
                email: user.email 
            };
            await userApi.updateUser(userId, payload);
            setMsg({ open: true, text: 'Lưu thông tin thành công!', type: 'success' });
            fetchUserData();
        } catch (error) {
            setMsg({ open: true, text: 'Cập nhật thất bại!', type: 'error' });
        } finally { setSaving(false); }
    };

    const handleUpdatePassword = async () => {
        if (!passData.new || passData.new !== passData.confirm) {
            setMsg({ open: true, text: 'Mật khẩu xác nhận không khớp!', type: 'error' });
            return;
        }
        setSaving(true);
        try {
            const userId = user?.userId || localStorage.getItem('userId');
            await userApi.updateUser(userId, { password: passData.new });
            setMsg({ open: true, text: 'Đổi mật khẩu thành công!', type: 'success' });
            setPassData({ current: '', new: '', confirm: '' });
        } catch (error) {
            setMsg({ open: true, text: 'Lỗi khi đổi mật khẩu!', type: 'error' });
        } finally { setSaving(false); }
    };

    if (loading) return <Box className="profile-view flex-center"><CircularProgress sx={{color: '#00c6ff'}}/></Box>;

    return (
        <div className="profile-view">
            <div className="fog-layer"></div>
            <div className="fog-layer fog-layer-2"></div>

            <Container maxWidth="lg" className="profile-main-container">
                <div className="profile-flex-layout">
                    
                    {/* BÊN TRÁI: SIDEBAR */}
                    <div className="sidebar-wrapper">
                        <Paper className="profile-glass-card sidebar-box">
                            <div className="avatar-anim-container">
                                <div className="neon-ring"></div>
                                <div className="avatar-relative">
                                    <Avatar 
                                        src={user?.image ? `http://localhost:8080/api/public/users/image/${user.image}` : ""} 
                                        className="main-avt"
                                    >{user?.firstName?.charAt(0)}</Avatar>
                                    
                                    <label htmlFor="avt-file" className="cam-label">
                                        <input accept="image/*" id="avt-file" type="file" onChange={handleAvatarChange} style={{ display: 'none' }} />
                                        <IconButton component="span" className="cam-btn"><PhotoCamera fontSize="small"/></IconButton>
                                    </label>
                                </div>
                            </div>
                            <Typography variant="h6" fontWeight="900" mt={3}>{user?.firstName} {user?.lastName}</Typography>
                            <Box className="vip-badge">VIP MEMBER 2026</Box>
                            <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.05)' }} />
                            <Tabs orientation="vertical" value={tabIndex} onChange={(e, v) => setTabIndex(v)} className="profile-tabs-custom">
                                <Tab icon={<Person />} iconPosition="start" label="Hồ sơ" />
                                <Tab icon={<Lock />} iconPosition="start" label="Bảo mật" />
                                <Tab icon={<Home />} iconPosition="start" label="Địa chỉ" />
                            </Tabs>
                        </Paper>
                    </div>

                    {/* BÊN PHẢI: NỘI DUNG FORM */}
                    <div className="content-wrapper">
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={tabIndex} 
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="full-height"
                            >
                                <Paper className="profile-glass-card content-box">
                                    {tabIndex === 0 && (
                                        <Box>
                                            <Typography variant="h6" className="highlight-text" sx={{mb: 4, letterSpacing: '1px'}}>
                                                <Edit sx={{mr:1, verticalAlign:'middle'}}/> THÔNG TIN TÀI KHOẢN
                                            </Typography>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12}><TextField fullWidth label="HỌ" value={formData.firstName} onChange={(e)=>setFormData({...formData, firstName:e.target.value})} className="dark-field"/></Grid>
                                                <Grid item xs={12}><TextField fullWidth label="TÊN" value={formData.lastName} onChange={(e)=>setFormData({...formData, lastName:e.target.value})} className="dark-field"/></Grid>
                                                <Grid item xs={12}><TextField fullWidth label="SỐ ĐIỆN THOẠI" value={formData.mobileNumber} onChange={(e)=>setFormData({...formData, mobileNumber:e.target.value})} className="dark-field"/></Grid>
                                                <Grid item xs={12}><TextField fullWidth label="EMAIL" value={user?.email} disabled className="dark-field disabled-box"/></Grid>
                                                <Grid item xs={12} mt={1}>
                                                    <Button fullWidth className="btn-modern" onClick={handleUpdateProfile} disabled={saving}>
                                                        {saving ? <CircularProgress size={24}/> : "LƯU THAY ĐỔI"}
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    )}

                                    {tabIndex === 1 && (
                                        <Box>
                                            <Typography variant="h6" className="highlight-text" sx={{mb: 4}}>
                                                <Lock sx={{mr:1, verticalAlign:'middle'}}/> THIẾT LẬP MẬT KHẨU
                                            </Typography>
                                            <Grid container spacing={3}>
                                                {/* Ô MẬT KHẨU HIỆN TẠI - ẨN NỘI DUNG */}
                                                <Grid item xs={12}>
                                                    <TextField 
                                                        fullWidth 
                                                        type={showCurrentPass ? "text" : "password"} 
                                                        label="MẬT KHẨU HIỆN TẠI" 
                                                        className="dark-field"
                                                        value={passData.current}
                                                        onChange={(e) => setPassData({...passData, current: e.target.value})}
                                                        autoComplete="new-password"
                                                        InputProps={{
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <IconButton onClick={() => setShowCurrentPass(!showCurrentPass)} edge="end" sx={{color: 'rgba(255,255,255,0.3)'}}>
                                                                        {showCurrentPass ? <VisibilityOff /> : <Visibility />}
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />
                                                </Grid>
                                                
                                                <Grid item xs={12}>
                                                    <TextField 
                                                        fullWidth 
                                                        type={showNewPass ? "text" : "password"} 
                                                        label="MẬT KHẨU MỚI" 
                                                        className="dark-field"
                                                        value={passData.new}
                                                        onChange={(e) => setPassData({...passData, new: e.target.value})}
                                                        InputProps={{
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <IconButton onClick={() => setShowNewPass(!showNewPass)} edge="end" sx={{color: 'rgba(255,255,255,0.3)'}}>
                                                                        {showNewPass ? <VisibilityOff /> : <Visibility />}
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />
                                                </Grid>
                                                
                                                <Grid item xs={12}>
                                                    <TextField 
                                                        fullWidth 
                                                        type={showConfirmPass ? "text" : "password"} 
                                                        label="XÁC NHẬN MẬT KHẨU" 
                                                        className="dark-field"
                                                        value={passData.confirm}
                                                        onChange={(e) => setPassData({...passData, confirm: e.target.value})}
                                                        InputProps={{
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <IconButton onClick={() => setShowConfirmPass(!showConfirmPass)} edge="end" sx={{color: 'rgba(255,255,255,0.3)'}}>
                                                                        {showConfirmPass ? <VisibilityOff /> : <Visibility />}
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />
                                                </Grid>
                                                
                                                <Grid item xs={12} mt={2}>
                                                    <Button fullWidth className="btn-modern" onClick={handleUpdatePassword} disabled={saving}>
                                                        {saving ? <CircularProgress size={24}/> : "ĐỔI MẬT KHẨU NGAY"}
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    )}

                                    {tabIndex === 2 && (
                                        <Box>
                                            <Box className="flex-between" sx={{mb: 4}}>
                                                <Typography variant="h6" className="highlight-text">
                                                    <Home sx={{mr:1, verticalAlign:'middle'}}/> SỔ ĐỊA CHỈ
                                                </Typography>
                                                <Button startIcon={<AddLocation/>} sx={{color: '#00c6ff'}}>Thêm mới</Button>
                                            </Box>
                                            <Box className="flex-center" sx={{py: 8, flexDirection:'column', opacity: 0.3}}>
                                                <Home sx={{fontSize: 60, mb: 2}}/>
                                                <Typography>Chưa có địa chỉ nào được lưu</Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </Paper>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </Container>

            <Snackbar open={msg.open} autoHideDuration={3000} onClose={() => setMsg({...msg, open: false})} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity={msg.type} variant="filled" sx={{borderRadius: '12px'}}>{msg.text}</Alert>
            </Snackbar>
        </div>
    );
};

export default ProfilePage;