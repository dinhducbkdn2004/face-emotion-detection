import { useState, useCallback } from 'react';

/**
 * Hook tùy chỉnh để gọi API với trạng thái loading và error
 * @param {Function} apiFunction - Hàm API cần gọi
 * @returns {Array} - [execute, data, loading, error, reset]
 */
const useApi = (apiFunction) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Hàm thực thi API call
    const execute = useCallback(async (...args) => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiFunction(...args);
            setData(result);
            return result;
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Có lỗi xảy ra');
            return null;
        } finally {
            setLoading(false);
        }
    }, [apiFunction]);

    // Hàm reset trạng thái
    const reset = useCallback(() => {
        setData(null);
        setLoading(false);
        setError(null);
    }, []);

    return [execute, data, loading, error, reset];
};

export default useApi;