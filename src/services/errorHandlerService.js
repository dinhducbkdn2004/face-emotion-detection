import axios from 'axios';
import axiosInstance from '../config/axios';

/**
 * Service cung cấp các phương thức xử lý lỗi từ API
 */
const errorHandlerService = {
    /**
     * Xử lý lỗi từ API và trả về thông báo lỗi phù hợp
     * @param {Error} error - Lỗi từ Axios request
     * @returns {string} - Thông báo lỗi phù hợp
     */
    getErrorMessage: (error) => {
        if (error.response) {
            // Lỗi từ server (status code không phải 2xx)
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    return data.message || 'Yêu cầu không hợp lệ';
                case 401:
                    return 'Bạn cần đăng nhập để thực hiện chức năng này';
                case 403:
                    return 'Bạn không có quyền thực hiện chức năng này';
                case 404:
                    return 'Không tìm thấy tài nguyên yêu cầu';
                case 422:
                    return data.message || 'Dữ liệu gửi lên không hợp lệ';
                case 500:
                    return 'Lỗi máy chủ nội bộ';
                default:
                    return data.message || `Lỗi không xác định (${status})`;
            }
        } else if (error.request) {
            // Lỗi không nhận được response từ server
            return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng';
        } else {
            // Lỗi trong quá trình thiết lập request
            return error.message || 'Đã xảy ra lỗi không xác định';
        }
    },

    /**
     * Xử lý lỗi và hiển thị thông báo lỗi (có thể sử dụng với toast notification)
     * @param {Error} error - Lỗi từ Axios request
     * @param {Function} showToast - Hàm hiển thị toast notification
     */
    handleError: (error, showToast) => {
        const errorMessage = errorHandlerService.getErrorMessage(error);

        // Sử dụng hàm hiển thị toast nếu được cung cấp
        if (showToast && typeof showToast === 'function') {
            showToast(errorMessage, 'error');
        }

        // Log lỗi cho dev
        console.error('API Error:', error);

        return errorMessage;
    },
};

export default errorHandlerService;
