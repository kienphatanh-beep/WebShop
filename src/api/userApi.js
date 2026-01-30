import axios from 'axios';

const BASE_URL = "http://localhost:8080/api";
const getAuthHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}` });

const userApi = {
    // Lấy user theo email (Lưu ý: Bạn cần đảm bảo Backend đã có hàm này)
    getUserByEmail: async (email) => {
        const response = await axios.get(`${BASE_URL}/public/users/email/${email}`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Cập nhật thông tin cơ bản
    updateUser: async (userId, userData) => {
        const response = await axios.put(`${BASE_URL}/public/users/${userId}`, userData, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Upload ảnh đại diện
    uploadAvatar: async (userId, file) => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await axios.post(`${BASE_URL}/public/users/${userId}/image`, formData, {
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};

export default userApi;