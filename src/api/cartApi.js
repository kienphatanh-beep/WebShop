import axios from 'axios';

const BASE_URL = "http://localhost:8080/api";

// Hàm lấy Header chứa Token chuẩn xác
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    
    if (!token || token === 'null' || token === 'undefined') {
        console.error("LỖI: Không tìm thấy Token hợp lệ trong LocalStorage!");
        return {}; // Trả về header trống
    }
    
    return { 'Authorization': `Bearer ${token}` }; // Gửi đúng định dạng Bearer
};

const cartApi = {
    // 1. Lấy giỏ hàng
    getCart: async () => {
        const response = await axios.get(`${BASE_URL}/carts`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // 2. Thêm sản phẩm vào giỏ (Hàm bạn đang bị lỗi 403)
    addToCart: async (productId, quantity) => {
        const header = getAuthHeader();
        
        // Kiểm tra chặn trước khi gửi yêu cầu
        if (!header.Authorization) {
            throw new Error("Bạn chưa đăng nhập hoặc phiên làm việc hết hạn!");
        }

        const response = await axios.post(
            `${BASE_URL}/carts/products/${productId}/quantity/${quantity}`,
            {}, // Body trống
            { headers: header } // 🔥 QUAN TRỌNG: Gửi Token ở đây
        );
        return response.data;
    },

    // 3. Cập nhật số lượng
    updateCartProduct: async (productId, quantity) => {
        const response = await axios.put(
            `${BASE_URL}/carts/products/${productId}/quantity/${quantity}`,
            {},
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // 4. Xóa sản phẩm khỏi giỏ
    deleteCartProduct: async (productId) => {
        const response = await axios.delete(
            `${BASE_URL}/carts/product/${productId}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // 5. Đặt hàng
    placeOrder: async (paymentMethod, productIds) => {
        const response = await axios.post(
            `${BASE_URL}/carts/payments/${paymentMethod}/order`, 
            productIds, 
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // 6. Cập nhật trạng thái đơn hàng (Dành cho VNPay)
    updateOrderStatus: async (email, orderId, status) => {
        const response = await axios.put(
            `${BASE_URL}/admin/users/${email}/orders/${orderId}/orderStatus/${status}`,
            {},
            { headers: getAuthHeader() }
        );
        return response.data;
    }
};

export default cartApi;