import { toast } from 'react-toastify';

// Kiểu toast
export const ToastType = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
};

// Tùy chọn mặc định
const defaultOptions = {
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
};

/**
 * Hiển thị toast thành công
 * @param {string} message - Nội dung thông báo
 * @param {object} options - Tùy chọn cho toast
 */
export const showSuccess = (message, options = {}) => {
    toast.success(message, { ...defaultOptions, ...options });
};

/**
 * Hiển thị toast lỗi
 * @param {string} message - Nội dung thông báo
 * @param {object} options - Tùy chọn cho toast
 */
export const showError = (message, options = {}) => {
    toast.error(message, { ...defaultOptions, ...options });
};

/**
 * Hiển thị toast cảnh báo
 * @param {string} message - Nội dung thông báo
 * @param {object} options - Tùy chọn cho toast
 */
export const showWarning = (message, options = {}) => {
    toast.warning(message, { ...defaultOptions, ...options });
};

/**
 * Hiển thị toast thông tin
 * @param {string} message - Nội dung thông báo
 * @param {object} options - Tùy chọn cho toast
 */
export const showInfo = (message, options = {}) => {
    toast.info(message, { ...defaultOptions, ...options });
};

/**
 * Hiển thị toast tùy chỉnh
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Kiểu toast (success, error, warning, info)
 * @param {object} options - Tùy chọn cho toast
 */
export const showToast = (message, type = ToastType.INFO, options = {}) => {
    switch (type) {
        case ToastType.SUCCESS:
            showSuccess(message, options);
            break;
        case ToastType.ERROR:
            showError(message, options);
            break;
        case ToastType.WARNING:
            showWarning(message, options);
            break;
        case ToastType.INFO:
        default:
            showInfo(message, options);
            break;
    }
};

/**
 * Dịch vụ quản lý các thông báo toast toàn cục
 */
class ToastService {
    /**
     * Hiển thị thông báo thành công
     * @param {string} message - Nội dung thông báo
     * @param {object} options - Tùy chọn thêm
     */
    static success(message, options = {}) {
        toast.success(message, {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            ...options,
        });
    }

    /**
     * Hiển thị thông báo lỗi
     * @param {string} message - Nội dung thông báo
     * @param {object} options - Tùy chọn thêm
     */
    static error(message, options = {}) {
        toast.error(message, {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            ...options,
        });
    }

    /**
     * Hiển thị thông báo cảnh báo
     * @param {string} message - Nội dung thông báo
     * @param {object} options - Tùy chọn thêm
     */
    static warning(message, options = {}) {
        toast.warning(message, {
            position: 'top-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            ...options,
        });
    }

    /**
     * Hiển thị thông báo thông tin
     * @param {string} message - Nội dung thông báo
     * @param {object} options - Tùy chọn thêm
     */
    static info(message, options = {}) {
        toast.info(message, {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            ...options,
        });
    }

    /**
     * Hiển thị thông báo tùy chỉnh
     * @param {string} message - Nội dung thông báo
     * @param {object} options - Tùy chọn thêm
     */
    static custom(message, options = {}) {
        toast(message, {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            ...options,
        });
    }

    /**
     * Đóng tất cả thông báo đang hiển thị
     */
    static dismiss() {
        toast.dismiss();
    }
}

export default ToastService;
