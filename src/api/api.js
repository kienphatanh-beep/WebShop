import axios from 'axios';

const BASE_URL = "http://localhost:8080/api";

const api = {
    // --- 1. TÌM KIẾM TỔNG HỢP (HATEOAS Version) ---
    searchProducts: async (params) => {
        try {
            const response = await axios.get(`${BASE_URL}/public/products/search`, { params });
            
            // 🔥 TRÍCH XUẤT HATEOAS: Dữ liệu nằm trong _embedded.productDTOList
            const products = response.data._embedded ? response.data._embedded.productDTOList : [];
            
            return { 
                content: products, 
                // Lấy thông tin phân trang nếu Backend có trả về (PagedModel)
                totalPages: response.data.page?.totalPages || 1,
                totalElements: response.data.page?.totalElements || products.length
            }; 
        } catch (error) {
            console.error("Lỗi searchProducts:", error);
            return { content: [], totalPages: 0 };
        }
    },

    // --- 2. LẤY TẤT CẢ SẢN PHẨM ---
    getAllProducts: async (params) => {
        try {
            const response = await axios.get(`${BASE_URL}/products`, { params });
            const products = response.data._embedded ? response.data._embedded.productDTOList : [];
            return { content: products };
        } catch (error) {
            console.error("Lỗi getAllProducts:", error);
            return { content: [] };
        }
    },

    // --- 3. CHI TIẾT SẢN PHẨM ---
    getProductById: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/products/${id}`);
            // HATEOAS trả về object đơn lẻ kèm các link điều hướng
            return response.data;
        } catch (error) {
            console.error("Lỗi getProductById:", error);
            return null;
        }
    },

    // --- 4. LẤY DANH MỤC ---
    getAllCategories: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/public/categories`);
            return response.data; 
        } catch (error) {
            console.error("Lỗi getAllCategories:", error);
            return { content: [] };
        }
    }
};

export default api;