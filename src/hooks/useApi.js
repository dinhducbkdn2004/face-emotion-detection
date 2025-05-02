import { useState, useCallback } from 'react';
import ToastService from '../toasts/ToastService';

/**
 * Hook tùy chỉnh để gọi API với xử lý loading, error và thông báo
 * @param {Function} apiFunction - Hàm API cần gọi
 * @param {Object} options - Tùy chọn
 * @returns {Array} - [execute, data, loading, error, reset]
 */
const useApi = (apiFunction, options = {}) => {
    const {
        showSuccessToast = false,
        showErrorToast = true,
        successMessage = 'Thao tác thành công',
        defaultErrorMessage = 'Đã xảy ra lỗi',
        onSuccess = null,
        onError = null,
    } = options;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(
        async (...args) => {
            try {
                setLoading(true);
                setError(null);

                const result = await apiFunction(...args);
                setData(result);

                if (showSuccessToast) {
                    ToastService.success(successMessage);
                }

                if (onSuccess && typeof onSuccess === 'function') {
                    onSuccess(result);
                }

                return result;
            } catch (err) {
                console.error('API Error:', err);
                setError(err);

                if (showErrorToast) {
                    const errorMessage =
                        err.response?.data?.message ||
                        err.message ||
                        defaultErrorMessage;
                    ToastService.error(errorMessage);
                }

                if (onError && typeof onError === 'function') {
                    onError(err);
                }

                throw err;
            } finally {
                setLoading(false);
            }
        },
        [
            apiFunction,
            showSuccessToast,
            showErrorToast,
            successMessage,
            defaultErrorMessage,
            onSuccess,
            onError,
        ]
    );

    const reset = useCallback(() => {
        setData(null);
        setLoading(false);
        setError(null);
    }, []);

    return [execute, data, loading, error, reset];
};

export default useApi;
