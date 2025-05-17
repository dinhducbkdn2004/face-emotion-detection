import axios from 'axios';

// Kiểm tra xem có đang ở môi trường development không (sử dụng localhost)
const isDevelopment =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

// Tạo một instance axios với cấu hình cơ bản
const apiClient = axios.create({
    // Trong môi trường development, sử dụng URL tương đối để đi qua proxy
    baseURL: isDevelopment
        ? ''
        : import.meta.env.VITE_API_BASE_URL || 'https://ped.ldblckrs.id.vn',
    timeout: 60000, // Tăng timeout lên 60 giây
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

        if (token) {
            // Đảm bảo headers tồn tại
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
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

        // Check token expired
        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry &&
            refreshToken
        ) {
            originalRequest._retry = true;

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
        localStorage.setItem('refreshToken', refresh);
    } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
};

// Hàm xóa token
export const clearAuthTokens = () => {
    accessToken = null;
    refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

export default apiClient;
