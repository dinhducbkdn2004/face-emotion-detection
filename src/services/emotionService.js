import apiClient, { checkApiServerStatus } from './apiClient';
import ToastService from '../toasts/ToastService';

/**
 * Gửi ảnh để phát hiện cảm xúc
 * @param {File} imageFile - File ảnh cần phân tích
 * @returns {Promise<Object>} Kết quả phát hiện cảm xúc
 */
export const detectEmotion = async (imageFile) => {
    // Kiểm tra server trước khi gửi request
    const isServerOnline = await checkApiServerStatus();
    if (!isServerOnline) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại sau.');
    }

    try {
        const formData = new FormData();
        formData.append('file', imageFile);

        // Thêm guestId vào URL nếu người dùng là khách
        const guestId = localStorage.getItem('guestId');
        let url = '/api/detect';
        if (guestId) {
            url += `?guest_id=${guestId}`;
        }

        // Hiển thị thông báo đang xử lý
        ToastService.info('Đang phân tích cảm xúc, vui lòng đợi...');

        const response = await apiClient.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            // Giảm timeout của singe request để có thể retry sớm hơn
            timeout: 30000,
        });

        // Lưu guestId mới nếu có
        if (response.data && response.data.guest_id) {
            localStorage.setItem('guestId', response.data.guest_id);
        }

        return response.data;
    } catch (error) {
        console.error('Lỗi phát hiện cảm xúc:', error);

        if (error.code === 'ECONNABORTED') {
            ToastService.error('Quá thời gian xử lý. Máy chủ đang bận, vui lòng thử lại sau.');
        } else if (error.message.includes('Network Error') || error.message.includes('connect')) {
            ToastService.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng của bạn.');
        } else if (error.response?.status === 429) {
            ToastService.error(
                'Bạn đã vượt quá giới hạn sử dụng. Vui lòng đăng nhập hoặc thử lại sau.'
            );
        } else if (error.response?.status === 403) {
            ToastService.error(
                'Bạn đã hết lượt dùng thử. Vui lòng đăng nhập hoặc đăng ký tài khoản để tiếp tục.'
            );
        } else if (error.response?.status === 400) {
            ToastService.error(
                error.response.data?.message ||
                    'File không hợp lệ. Vui lòng thử lại với file khác.'
            );
        } else if (error.response?.status >= 500) {
            ToastService.error('Máy chủ đang gặp sự cố. Vui lòng thử lại sau.');
        } else {
            ToastService.error('Có lỗi xảy ra khi phân tích cảm xúc. Vui lòng thử lại.');
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
            // Thêm tên file để dễ dàng mapping kết quả
            formData.append('filenames', file.name);

            // Lưu tên file theo index để mapping sau này
            fileNameMap[index] = file.name;
        });

        // Thêm guestId vào URL nếu người dùng là khách
        const guestId = localStorage.getItem('guestId');
        let url = `${apiClient.defaults.baseURL}/api/detect/batch`;
        if (guestId) {
            url += `?guest_id=${guestId}`;
        }

        // Lấy token từ localStorage hoặc apiClient
        let headers = {};
        const token = localStorage.getItem('accessToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

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
                `Lỗi HTTP ${response.status}: ${errorText || response.statusText}`
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
                        console.log('Nhận dữ liệu SSE:', jsonData);

                        // Lưu guestId mới nếu có
                        if (jsonData && jsonData.guest_id) {
                            localStorage.setItem('guestId', jsonData.guest_id);
                        }

                        // Thêm filename vào kết quả nếu chưa có
                        if (!jsonData.filename && jsonData.detection_results) {
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
                            'Lỗi parsing SSE data:',
                            e,
                            line.slice(6)
                        );
                        // Thông báo lỗi parsing nếu cần
                        if (onProgress && typeof onProgress === 'function') {
                            onProgress({
                                error: 'Lỗi xử lý dữ liệu từ server',
                                filename: 'Không xác định',
                                status: 'error',
                            });
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Lỗi phát hiện cảm xúc batch:', error);

        // Hiển thị toast thông báo lỗi
        ToastService.error('Không thể xử lý các file ảnh. Vui lòng thử lại.');

        // Gọi callback với thông tin lỗi
        if (onProgress && typeof onProgress === 'function') {
            // Tạo thông báo lỗi cho tất cả các file
            imageFiles.forEach((file) => {
                onProgress({
                    error: error.message || 'Lỗi khi xử lý file',
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
            console.error(`Lỗi xử lý file ${file.name}:`, error);

            const errorResult = {
                filename: file.name,
                error: error.message || 'Lỗi không xác định',
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
        // Thêm guestId vào URL nếu người dùng là khách
        const guestId = localStorage.getItem('guestId');
        let url = `/api/detect/status/${detectionId}`;
        if (guestId) {
            url += `?guest_id=${guestId}`;
        }

        const response = await apiClient.get(url);
        return response.data;
    } catch (error) {
        console.error(
            `Lỗi khi kiểm tra trạng thái xử lý #${detectionId}:`,
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
        // Thêm guestId vào URL nếu người dùng là khách
        const guestId = localStorage.getItem('guestId');
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

        // Thêm guest_id nếu có
        if (guestId) {
            url += `&guest_id=${guestId}`;
        }

        console.log('Gọi API:', url);
        const response = await apiClient.get(url);

        // In log cấu trúc phản hồi để debug
        console.log('API phản hồi:', response);

        // Cấu trúc phản hồi API có thể là:
        // 1. { data: [...items], totalCount: number }
        // 2. [...items] (với metadata trong header hoặc item đầu tiên)

        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử phát hiện:', error);

        if (error.response?.status !== 401) {
            ToastService.error('Không thể tải lịch sử phát hiện cảm xúc');
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
        // Thêm guestId vào URL nếu người dùng là khách
        const guestId = localStorage.getItem('guestId');
        let url = `/api/history/${detectionId}`;
        if (guestId) {
            url += `?guest_id=${guestId}`;
        }

        const response = await apiClient.get(url);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi lấy chi tiết phát hiện #${detectionId}:`, error);

        if (error.response?.status === 404) {
            ToastService.error('Không tìm thấy kết quả phát hiện này');
        } else if (error.response?.status === 403) {
            ToastService.error('Bạn không có quyền xem kết quả phát hiện này');
        } else {
            ToastService.error('Không thể tải chi tiết phát hiện');
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
        // Thêm guestId vào URL nếu người dùng là khách
        const guestId = localStorage.getItem('guestId');
        let url = `/api/history/${detectionId}`;
        if (guestId) {
            url += `?guest_id=${guestId}`;
        }

        await apiClient.delete(url);
        ToastService.success('Đã xóa kết quả phát hiện thành công');
    } catch (error) {
        console.error(`Lỗi khi xóa phát hiện #${detectionId}:`, error);

        if (error.response?.status === 404) {
            ToastService.error('Không tìm thấy kết quả phát hiện này');
        } else if (error.response?.status === 403) {
            ToastService.error('Bạn không có quyền xóa kết quả phát hiện này');
        } else {
            ToastService.error('Không thể xóa kết quả phát hiện');
        }

        throw error;
    }
};
