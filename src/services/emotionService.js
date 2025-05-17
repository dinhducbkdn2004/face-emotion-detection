import ToastService from '../toasts/ToastService';
import apiClient from './apiClient';

/**
 * Gửi ảnh để phát hiện cảm xúc
 * @param {File} imageFile - File ảnh cần phân tích
 * @returns {Promise<Object>} Kết quả phát hiện cảm xúc
 */
export const detectEmotion = async (imageFile) => {
    try {
        const formData = new FormData();
        formData.append('file', imageFile);
        let url = '/api/detect';

        // Hiển thị thông báo đang xử lý
        ToastService.info('Analyzing emotions, please wait...');

        const response = await apiClient.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            // Giảm timeout của singe request để có thể retry sớm hơn
            timeout: 30000,
        });

        return response.data;
    } catch (error) {
        console.error('Error detecting emotions:', error);

        if (error.code === 'ECONNABORTED') {
            ToastService.error(
                'Processing timeout. The server is busy, please try again later.'
            );
        } else if (
            error.message.includes('Network Error') ||
            error.message.includes('connect')
        ) {
            ToastService.error(
                'Cannot connect to server. Please check your network connection.'
            );
        } else if (error.response?.status === 429) {
            ToastService.error(
                'You have exceeded the usage limit. Please login or try again later.'
            );
        } else if (error.response?.status === 403) {
            ToastService.error(
                'You have reached the trial limit. Please login or register an account to continue.'
            );
        } else if (error.response?.status === 400) {
            ToastService.error(
                error.response.data?.message ||
                    'Invalid file. Please try again with a different file.'
            );
        } else if (error.response?.status >= 500) {
            ToastService.error(
                'The server is experiencing an issue. Please try again later.'
            );
        } else {
            ToastService.error(
                'An error occurred while analyzing emotions. Please try again.'
            );
        }

        throw error;
    }
};

/**
 * Gửi nhiều ảnh để phát hiện cảm xúc (streaming response)
 * @param {File[]} imageFiles - Mảng các file ảnh
 * @param {function} onProgress - Callback khi có kết quả mới
 * @returns {Promise<void>}
 */
export const detectEmotionBatch = async (imageFiles, onProgress) => {
    try {
        const formData = new FormData();

        // Tạo map để lưu trữ tên file theo ID
        const fileNameMap = {};

        imageFiles.forEach((file, index) => {
            formData.append('files', file);
            // Lưu tên file theo index để mapping sau này
            fileNameMap[index] = file.name;
        });

        // Lấy token từ localStorage hoặc apiClient
        let headers = {};
        const token = localStorage.getItem('accessToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Kiểm tra môi trường
        const isDevelopment =
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1';

        // Trong môi trường development, sử dụng URL tương đối để đi qua proxy
        const baseUrl = isDevelopment
            ? ''
            : import.meta.env.VITE_API_BASE_URL || 'https://ped.ldblckrs.id.vn';
        const url = `${baseUrl}/api/detect/batch`;

        // Sử dụng fetch API để xử lý SSE
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: headers,
        });

        if (!response.ok) {
            // Xử lý lỗi HTTP
            const errorText = await response.text();
            throw new Error(
                `HTTP Error ${response.status}: ${errorText || response.statusText}`
            );
        }

        // Xử lý SSE (Server-Sent Events)
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let processedCount = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Xử lý dữ liệu nhận được
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const jsonData = JSON.parse(line.slice(6));

                        // Thêm filename vào kết quả nếu chưa có
                        if (!jsonData.filename && jsonData.detection_id) {
                            // Dùng index hoặc detection_id để mapping tên file
                            if (processedCount < imageFiles.length) {
                                jsonData.filename =
                                    fileNameMap[processedCount] ||
                                    imageFiles[processedCount].name;
                                processedCount++;
                            }
                        }

                        // Gọi callback với dữ liệu nhận được
                        if (onProgress && typeof onProgress === 'function') {
                            onProgress(jsonData);
                        }
                    } catch (e) {
                        console.error(
                            'Error parsing SSE data:',
                            e,
                            line.slice(6)
                        );
                        // Thông báo lỗi parsing nếu cần
                        if (onProgress && typeof onProgress === 'function') {
                            onProgress({
                                error: 'Error processing data from server',
                                filename: 'Unknown',
                                status: 'error',
                            });
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error in batch emotion detection:', error);

        // Hiển thị toast thông báo lỗi
        ToastService.error('Unable to process image files. Please try again.');

        // Gọi callback với thông tin lỗi
        if (onProgress && typeof onProgress === 'function') {
            // Tạo thông báo lỗi cho tất cả các file
            imageFiles.forEach((file) => {
                onProgress({
                    error: error.message || 'Error processing file',
                    filename: file.name,
                    status: 'error',
                });
            });
        }

        throw error;
    }
};

/**
 * Phát hiện cảm xúc nhiều ảnh dùng API thông thường (fallback)
 * @param {File[]} imageFiles - Mảng các file ảnh
 * @param {Function} onProgress - Callback khi có kết quả
 * @returns {Promise<Array>} - Mảng kết quả
 */
export const detectEmotionBatchFallback = async (imageFiles, onProgress) => {
    const results = [];

    for (const file of imageFiles) {
        try {
            const result = await detectEmotion(file);
            const resultWithFilename = {
                ...result,
                filename: file.name,
                status: 'completed',
            };

            results.push(resultWithFilename);

            if (onProgress && typeof onProgress === 'function') {
                onProgress(resultWithFilename);
            }
        } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);

            const errorResult = {
                filename: file.name,
                error: error.message || 'Unknown error',
                status: 'error',
            };

            results.push(errorResult);

            if (onProgress && typeof onProgress === 'function') {
                onProgress(errorResult);
            }
        }
    }

    return results;
};

/**
 * Kiểm tra trạng thái xử lý detection
 * @param {string} detectionId - ID của lần phát hiện
 * @returns {Promise<Object>} Trạng thái xử lý
 */
export const checkDetectionStatus = async (detectionId) => {
    try {
        let url = `/api/detect/status/${detectionId}`;

        const response = await apiClient.get(url);
        return response.data;
    } catch (error) {
        console.error(
            `Error checking detection status #${detectionId}:`,
            error
        );
        throw error;
    }
};

/**
 * Lấy lịch sử phát hiện cảm xúc
 * @param {number} skip - Số bản ghi bỏ qua (phân trang)
 * @param {number} limit - Số bản ghi tối đa trả về
 * @param {Object} filters - Các bộ lọc bổ sung (fromDate, toDate, keyword)
 * @returns {Promise<Object>} Danh sách kết quả phát hiện kèm metadata
 */
export const getEmotionHistory = async (skip = 0, limit = 10, filters = {}) => {
    try {
        let url = `/api/history?skip=${skip}&limit=${limit}`;

        // Thêm các tham số lọc vào URL
        const { fromDate, toDate, keyword } = filters;
        if (fromDate) {
            url += `&from_date=${fromDate.toISOString()}`;
        }
        if (toDate) {
            url += `&to_date=${toDate.toISOString()}`;
        }
        if (keyword) {
            url += `&keyword=${encodeURIComponent(keyword)}`;
        }

        const response = await apiClient.get(url);

        // Cấu trúc phản hồi API có thể là:
        // 1. { data: [...items], totalCount: number }
        // 2. [...items] (với metadata trong header hoặc item đầu tiên)

        return response.data;
    } catch (error) {
        console.error('Error retrieving detection history:', error);

        if (error.response?.status !== 401) {
            ToastService.error('Unable to load emotion detection history');
        }

        throw error;
    }
};

/**
 * Lấy chi tiết một lần phát hiện cảm xúc
 * @param {string} detectionId - ID của lần phát hiện
 * @returns {Promise<Object>} Chi tiết kết quả phát hiện
 */
export const getEmotionDetail = async (detectionId) => {
    try {
        let url = `/api/history/${detectionId}`;

        const response = await apiClient.get(url);
        return response.data;
    } catch (error) {
        console.error(
            `Error retrieving detection details #${detectionId}:`,
            error
        );

        if (error.response?.status === 404) {
            ToastService.error('Detection result not found');
        } else if (error.response?.status === 403) {
            ToastService.error(
                'You do not have permission to view this detection result'
            );
        } else {
            ToastService.error('Unable to load detection details');
        }

        throw error;
    }
};

/**
 * Lấy chi tiết một lần phát hiện cảm xúc theo ID
 * @param {string} detectionId - ID của lần phát hiện
 * @returns {Promise<Object>} Chi tiết kết quả phát hiện
 */
export const getEmotionDetectionById = async (detectionId) => {
    return getEmotionDetail(detectionId);
};

/**
 * Xóa một lần phát hiện cảm xúc
 * @param {string} detectionId - ID của lần phát hiện
 * @returns {Promise<void>}
 */
export const deleteEmotionDetection = async (detectionId) => {
    try {
        let url = `/api/history/${detectionId}`;

        await apiClient.delete(url);
        ToastService.success('Detection result deleted successfully');
    } catch (error) {
        console.error(`Error deleting detection #${detectionId}:`, error);

        if (error.response?.status === 404) {
            ToastService.error('Detection result not found');
        } else if (error.response?.status === 403) {
            ToastService.error(
                'You do not have permission to delete this detection result'
            );
        } else {
            ToastService.error('Unable to delete detection result');
        }

        throw error;
    }
};
