import { useState, useEffect, useCallback } from 'react';
import errorHandlerService from './errorHandlerService';
import ToastService from '../toasts/ToastService';

/**
 * Custom hook để gọi API với xử lý loading và error state
 * @param {Function} apiFunction - Hàm API cần gọi
 * @param {Array} dependencies - Mảng các dependencies để hook re-run
 * @param {Object} options - Các tùy chọn bổ sung
 * @returns {Object} - Kết quả, trạng thái loading và error
 */
export const useApi = (apiFunction, dependencies = [], options = {}) => {
    const {
        initialData = null,
        showErrorToast = true,
        showSuccessToast = false,
        successMessage = 'Operation completed successfully',
        transformData = (data) => data,
        onSuccess = () => {},
        onError = () => {},
    } = options;

    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(
        async (...args) => {
            try {
                setLoading(true);
                setError(null);

                const response = await apiFunction(...args);
                const transformedData = transformData(response.data);

                setData(transformedData);

                if (showSuccessToast) {
                    ToastService.success(successMessage);
                }

                onSuccess(transformedData);
                return transformedData;
            } catch (err) {
                const errorMessage = errorHandlerService.getErrorMessage(err);
                setError(errorMessage);

                if (showErrorToast) {
                    ToastService.error(errorMessage);
                }

                onError(err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [
            apiFunction,
            showErrorToast,
            showSuccessToast,
            successMessage,
            transformData,
            onSuccess,
            onError,
        ]
    );

    // Để tự động gọi khi hook được mount
    useEffect(() => {
        if (dependencies.length > 0 || dependencies.length === 0) {
            execute();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    // Reset state khi dependencies thay đổi
    useEffect(() => {
        return () => {
            setData(initialData);
            setLoading(false);
            setError(null);
        };
    }, dependencies);

    return { data, loading, error, execute, setData };
};

/**
 * Custom hook để quản lý form state
 * @param {Object} initialValues - Giá trị ban đầu của form
 * @param {Function} onSubmit - Hàm xử lý khi submit form
 * @param {Function} validate - Hàm validate form
 * @returns {Object} - Form state và handlers
 */
export const useForm = (
    initialValues = {},
    onSubmit = () => {},
    validate = () => ({})
) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues({
            ...values,
            [name]: value,
        });

        // Re-validate field khi giá trị thay đổi
        if (touched[name]) {
            const validationErrors = validate(values);
            setErrors((previousErrors) => ({
                ...previousErrors,
                [name]: validationErrors[name] || '',
            }));
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched({
            ...touched,
            [name]: true,
        });

        // Validate field khi blur
        const validationErrors = validate(values);
        setErrors((previousErrors) => ({
            ...previousErrors,
            [name]: validationErrors[name] || '',
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields
        const validationErrors = validate(values);
        setErrors(validationErrors);

        // Mark all fields as touched
        const touchedFields = {};
        Object.keys(values).forEach((key) => {
            touchedFields[key] = true;
        });
        setTouched(touchedFields);

        // Submit if no errors
        if (Object.keys(validationErrors).length === 0) {
            setIsSubmitting(true);
            try {
                await onSubmit(values);
            } catch (error) {
                console.error('Form submission error:', error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const resetForm = () => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    };

    return {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        resetForm,
        setValues,
    };
};

export default {
    useApi,
    useForm,
};
