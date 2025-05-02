import axios from 'axios';
import { auth } from './firebase';

// Tạo một instance của axios với cấu hình mặc định
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    async (config) => {
        const token = await auth.currentUser.getIdToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const status = error.response.status;
            if (status === 401) {
                window.location.href = '/login';
            }

            if (status === 403) {
                window.location.href = '/unauthorized';
            }

            if (status === 404) {
                window.location.href = '/not-found';
            }

            if (status === 500) {
                window.location.href = '/server-error';
            }
        } else if (error.request) {
            window.location.href = '/network-error';
        } else {
            window.location.href = '/unknown-error';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
