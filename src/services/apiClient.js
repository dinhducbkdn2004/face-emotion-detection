import axios from 'axios';
import { auth } from '../config/firebase';
import ToastService from '../toasts/ToastService';

// Tạo một instance axios với cấu hình cơ bản
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://ped.ldblckrs.id.vn',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    // Xóa withCredentials để tránh lỗi CORS khi máy chủ trả về Access-Control-Allow-Origin: *
    withCredentials: false,
});

// Biến lưu trữ JWT token khi xác thực với backend
let accessToken = null;
let refreshToken = null;

// Interceptor để thêm token vào header
apiClient.interceptors.request.use(
    async (config) => {
        // Kiểm tra có accessToken trong biến hoặc localStorage
        const token = accessToken || localStorage.getItem('accessToken');

        // Log để debug
        console.log('Request URL:', config.url);
        console.log('Authorization Token:', token ? 'Có' : 'Không');

        if (token) {
            // Đảm bảo headers tồn tại
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
        } else {
            // Kiểm tra guestId
            const guestId = localStorage.getItem('guestId');

            // Chỉ log để kiểm tra
            if (guestId) {
                console.log('Sử dụng guestId:', guestId);

                // Nếu URL không chứa guest_id, thêm vào
                if (config.url.indexOf('guest_id=') === -1) {
                    config.url += config.url.includes('?') ? '&' : '?';
                    config.url += `guest_id=${guestId}`;
                }
            } else {
                console.log('Không có guestId');
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor để xử lý response
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Log để debug
        console.log('Lỗi từ server:', {
            status: error.response?.status,
            data: error.response?.data,
            url: originalRequest?.url,
        });

        // Nếu token hết hạn (status 401) và có refresh token
        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry &&
            refreshToken
        ) {
            originalRequest._retry = true;
            console.log('Token hết hạn, thử làm mới token...');

            try {
                // Làm mới token
                const response = await apiClient.post('/auth/refresh-token', {
                    refresh_token: refreshToken,
                });

                // Lưu token mới
                const { access_token, refresh_token: new_refresh_token } =
                    response.data;
                setAuthTokens(access_token, new_refresh_token || refreshToken);

                // Cập nhật header của request gốc với token mới
                originalRequest.headers['Authorization'] =
                    `Bearer ${access_token}`;

                // Thử lại request gốc
                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error('Không thể làm mới token:', refreshError);

                // Xóa token
                clearAuthTokens();

                // Nếu không thể refresh token, thử sử dụng guestId nếu có
                const guestId = localStorage.getItem('guestId');
                if (
                    guestId &&
                    originalRequest.url.indexOf('guest_id=') === -1
                ) {
                    console.log('Thử lại với guestId...');
                    originalRequest.url += originalRequest.url.includes('?')
                        ? '&'
                        : '?';
                    originalRequest.url += `guest_id=${guestId}`;
                    return apiClient(originalRequest);
                }
            }
        }

        return Promise.reject(error);
    }
);

// Hàm lưu trữ token từ backend
export const setAuthTokens = (access, refresh) => {
    accessToken = access;
    refreshToken = refresh;

    // Lưu accessToken vào localStorage để sử dụng cho các yêu cầu fetch
    if (access) {
        localStorage.setItem('accessToken', access);
    } else {
        localStorage.removeItem('accessToken');
    }
};

// Hàm xóa token
export const clearAuthTokens = () => {
    accessToken = null;
    refreshToken = null;
    localStorage.removeItem('accessToken');
};

export default apiClient;
