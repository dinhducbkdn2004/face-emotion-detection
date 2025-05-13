import axios from 'axios';
import { auth } from '../config/firebase';
import ToastService from '../toasts/ToastService';

// Tạo một instance axios với cấu hình cơ bản
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://ped.ldblckrs.id.vn',
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
let apiServerStatus = {
    isChecking: false,
    isOnline: true,
    lastChecked: null
};

// Hàm kiểm tra server có online không
const checkServerStatus = async (force = false) => {
    // Nếu đã kiểm tra trong 5 phút qua và không bắt buộc kiểm tra lại
    if (!force && apiServerStatus.lastChecked && 
        (Date.now() - apiServerStatus.lastChecked) < 5 * 60 * 1000) {
        return apiServerStatus.isOnline;
    }
    
    if (apiServerStatus.isChecking) {
        // Đợi kết quả kiểm tra hiện tại
        let checkCount = 0;
        while (apiServerStatus.isChecking && checkCount < 10) {
            await new Promise(resolve => setTimeout(resolve, 500));
            checkCount++;
        }
        return apiServerStatus.isOnline;
    }
    
    apiServerStatus.isChecking = true;
    
    try {
        // Sử dụng /healthz để kiểm tra trạng thái server
        const baseUrl = apiClient.defaults.baseURL;
        const response = await fetch(`${baseUrl}/healthz`, { 
            method: 'GET',
            timeout: 5000,
            headers: { 'Cache-Control': 'no-cache' }
        });
        
        apiServerStatus.isOnline = response.ok;
        apiServerStatus.lastChecked = Date.now();
        console.log(`API Server status: ${apiServerStatus.isOnline ? 'Online' : 'Offline'}`);
        
        if (!apiServerStatus.isOnline && response.status >= 500) {
            ToastService.error('Server hiện đang gặp sự cố. Vui lòng thử lại sau.');
        }
    } catch (error) {
        console.error('Không thể kết nối đến server:', error);
        apiServerStatus.isOnline = false;
        apiServerStatus.lastChecked = Date.now();
        ToastService.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại sau.');
    } finally {
        apiServerStatus.isChecking = false;
    }
    
    return apiServerStatus.isOnline;
};

// Interceptor để thêm token vào header
apiClient.interceptors.request.use(
    async (config) => {
        // Kiểm tra server status trước khi gửi request
        if (!config.url.includes('/healthz')) {
            const isOnline = await checkServerStatus();
            if (!isOnline && !config._retryServerCheck) {
                // Nếu server offline, reject request
                return Promise.reject(new Error('API server is currently unavailable'));
            }
        }

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

        // Retry logic cho timeout và network errors
        if (error.code === 'ECONNABORTED' || error.message.includes('Network Error')) {
            if (!originalRequest._retryCount) {
                originalRequest._retryCount = 0;
            }
            
            if (originalRequest._retryCount < 2) {
                originalRequest._retryCount++;
                console.log(`Thử lại request lần ${originalRequest._retryCount} sau khi gặp lỗi: ${error.message}`);
                
                // Đặt flag để kiểm tra lại server status
                originalRequest._retryServerCheck = true;
                
                // Chờ 2 giây trước khi thử lại
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Kiểm tra server status trước khi retry
                const serverOnline = await checkServerStatus(true);
                if (!serverOnline) {
                    return Promise.reject(new Error('Không thể kết nối đến server. Vui lòng thử lại sau.'));
                }
                
                return apiClient(originalRequest);
            }
        }

        // Kiểm tra token hết hạn và có refresh token
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

// Xuất hàm kiểm tra server status để sử dụng bên ngoài
export const checkApiServerStatus = checkServerStatus;

export default apiClient;
