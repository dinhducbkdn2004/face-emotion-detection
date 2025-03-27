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

// Xuất đối tượng service với tất cả các phương thức
const ToastService = {
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    show: showToast,
    dismiss: toast.dismiss, // Ẩn toast
    isActive: toast.isActive, // Kiểm tra toast có đang hiển thị
};

export default ToastService;
