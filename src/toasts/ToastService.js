import { toast } from 'react-toastify';

// Toast types
export const ToastType = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
};

// Default options
const defaultOptions = {
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
};

/**
 * Display a success toast
 * @param {string} message - Message content
 * @param {object} options - Toast options
 */
export const showSuccess = (message, options = {}) => {
    toast.success(message, { ...defaultOptions, ...options });
};

/**
 * Display an error toast
 * @param {string} message - Message content
 * @param {object} options - Toast options
 */
export const showError = (message, options = {}) => {
    toast.error(message, { ...defaultOptions, ...options });
};

/**
 * Display a warning toast
 * @param {string} message - Message content
 * @param {object} options - Toast options
 */
export const showWarning = (message, options = {}) => {
    toast.warning(message, { ...defaultOptions, ...options });
};

/**
 * Display an info toast
 * @param {string} message - Message content
 * @param {object} options - Toast options
 */
export const showInfo = (message, options = {}) => {
    toast.info(message, { ...defaultOptions, ...options });
};

/**
 * Display a custom toast
 * @param {string} message - Message content
 * @param {string} type - Toast type (success, error, warning, info)
 * @param {object} options - Toast options
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
 * Global toast notification service
 */
class ToastService {
    /**
     * Display a success toast
     * @param {string} message - Message content
     * @param {object} options - Additional options
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
     * Display an error toast
     * @param {string} message - Message content
     * @param {object} options - Additional options
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
     * Display a warning toast
     * @param {string} message - Message content
     * @param {object} options - Additional options
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
     * Display an info toast
     * @param {string} message - Message content
     * @param {object} options - Additional options
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
     * Display a custom toast
     * @param {string} message - Message content
     * @param {object} options - Additional options
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
     * Dismiss all currently displayed toasts
     */
    static dismiss() {
        toast.dismiss();
    }
}

export default ToastService;
