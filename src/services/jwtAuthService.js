import axiosInstance from '../config/axios';
import { loginStart, loginSuccess, loginFailure, logout as logoutAction } from '../store/slices/authSlice';
import ToastService from '../toasts/ToastService';

// Đăng nhập với JWT
export const loginWithJWT = async (email, password, dispatch) => {
    try {
        dispatch(loginStart());

        const response = await axiosInstance.post('/auth/login', {
            email,
            password,
        });

        const { user, accessToken, refreshToken } = response.data;

        // Lưu tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        dispatch(loginSuccess({
            ...user,
            accessToken,
        }));

        ToastService.success('Đăng nhập thành công!');
        return user;
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        dispatch(loginFailure(error.response?.data?.message || error.message));

        if (error.response?.status === 401) {
            ToastService.error('Email hoặc mật khẩu không chính xác');
        } else if (error.response?.status === 429) {
            ToastService.error('Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau');
        } else {
            ToastService.error('Đăng nhập thất bại: ' + (error.response?.data?.message || error.message));
        }

        throw error;
    }
};

// Đăng ký tài khoản mới với JWT
export const registerWithJWT = async (email, password, dispatch) => {
    try {
        dispatch(loginStart());

        const response = await axiosInstance.post('/auth/register', {
            email,
            password,
        });

        const { user, accessToken, refreshToken } = response.data;

        // Lưu tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        dispatch(loginSuccess({
            ...user,
            accessToken,
        }));

        ToastService.success('Đăng ký tài khoản thành công!');
        return user;
    } catch (error) {
        console.error('Register error:', error.response?.data || error.message);
        dispatch(loginFailure(error.response?.data?.message || error.message));

        if (error.response?.status === 409) {
            ToastService.error('Email này đã được sử dụng');
        } else if (error.response?.status === 400) {
            ToastService.error(error.response.data.message || 'Thông tin đăng ký không hợp lệ');
        } else {
            ToastService.error('Đăng ký tài khoản thất bại');
        }

        throw error;
    }
};

// Đăng xuất
export const logout = async (dispatch) => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            // Gọi API để vô hiệu hóa refresh token
            await axiosInstance.post('/auth/logout', { refreshToken });
        }

        // Xóa tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        dispatch(logoutAction());
        ToastService.success('Đăng xuất thành công!');
    } catch (error) {
        console.error('Logout error:', error.response?.data || error.message);
        ToastService.error('Đăng xuất thất bại');
        // Vẫn xóa tokens ở client side ngay cả khi API thất bại
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        dispatch(logoutAction());
        throw error;
    }
};

// Kiểm tra trạng thái xác thực
export const checkAuthStatus = async (dispatch) => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            dispatch(logoutAction());
            return null;
        }

        const response = await axiosInstance.get('/auth/me');
        const user = response.data;

        dispatch(loginSuccess({
            ...user,
            accessToken,
        }));

        return user;
    } catch (error) {
        console.error('Auth check error:', error.response?.data || error.message);
        dispatch(logoutAction());
        return null;
    }
};

// Yêu cầu đặt lại mật khẩu
export const resetPassword = async (email) => {
    try {
        await axiosInstance.post('/auth/reset-password', { email });
        ToastService.success('Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.');
    } catch (error) {
        console.error('Reset password error:', error.response?.data || error.message);

        if (error.response?.status === 404) {
            ToastService.error('Không tìm thấy tài khoản với email này');
        } else if (error.response?.status === 400) {
            ToastService.error('Email không hợp lệ');
        } else {
            ToastService.error('Không thể gửi email đặt lại mật khẩu');
        }

        throw error;
    }
};