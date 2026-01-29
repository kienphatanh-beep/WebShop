import axios from 'axios';

const BASE_URL = "http://localhost:8080/api";

// Hàm bổ trợ để lấy Header chứa Token
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { 'Authorization': `Bearer ${token}` };
};

const cartApi = {
    // 1. Lấy giỏ hàng của chính người dùng đang đăng nhập
    getCart: async () => {
        const response = await axios.get(`${BASE_URL}/carts`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // 2. Thêm sản phẩm vào giỏ (Không cần cartId)
    addToCart: async (productId, quantity) => {
        const response = await axios.post(
            `${BASE_URL}/carts/products/${productId}/quantity/${quantity}`,
            {}, // Body trống
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // 3. Cập nhật số lượng (Không cần cartId)
    updateCartProduct: async (productId, quantity) => {
        const response = await axios.put(
            `${BASE_URL}/carts/products/${productId}/quantity/${quantity}`,
            {},
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // 4. Xóa sản phẩm khỏi giỏ (Không cần cartId)
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
            `${BASE_URL}/carts/payments/${paymentMethod}/order`, // Endpoint này bạn cần đồng bộ với Backend Order
            productIds, 
            { headers: getAuthHeader() }
        );
        return response.data;
    }
};

export default cartApi;