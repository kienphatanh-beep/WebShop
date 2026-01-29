import axios from 'axios';

const BASE_URL = "http://localhost:8080/api";

const getHeaders = () => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
});

const orderApi = {
    // Lấy tất cả đơn hàng của User đang đăng nhập
    getOrdersByUser: async (email) => {
        const response = await axios.get(`${BASE_URL}/public/users/${email}/orders`, getHeaders());
        return response.data;
    }
};

export default orderApi;