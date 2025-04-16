import axios from 'axios';

// Tạo instance axios với config mặc định
const axiosInstance = axios.create({
    baseURL: process.env.VITE_API_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor cho request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor cho response
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 (Unauthorized) và chưa thử refresh token
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Lấy refresh token từ localStorage
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Gọi API để lấy token mới
                const response = await axios.post('/auth/refresh-token', {
                    refreshToken,
                });

                const { accessToken } = response.data;

                // Lưu token mới
                localStorage.setItem('accessToken', accessToken);

                // Cập nhật Authorization header
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                // Thử lại request ban đầu
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // Nếu refresh token thất bại, logout user
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;