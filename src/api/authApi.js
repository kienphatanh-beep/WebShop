import axios from 'axios';

const BASE_URL = "http://localhost:8080/api";

const authApi = {
    // --- ĐĂNG NHẬP ---
    login: async (email, password) => {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        // API của bạn dùng @RequestParam nên gửi dạng FormData hoặc x-www-form-urlencoded là chuẩn nhất
        const response = await axios.post(`${BASE_URL}/login`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' } 
        });
        return response.data; 
    },

    // --- ĐĂNG KÝ ---
    register: async (userData) => {
        // userData là FormData chứa: email, password, firstName, lastName, image...
        const response = await axios.post(`${BASE_URL}/register`, userData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};

export default authApi;