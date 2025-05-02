import apiClient from './apiClient';
import ToastService from '../toasts/ToastService';

/**
 * Gửi ảnh để phát hiện cảm xúc
 * @param {File} imageFile - File ảnh cần phân tích
 * @returns {Promise<Object>} Kết quả phát hiện cảm xúc
 */
export const detectEmotion = async (imageFile) => {
    try {
        const formData = new FormData();
        formData.append('file', imageFile);
        
        // Thêm guestId vào URL nếu người dùng là khách
        const guestId = localStorage.getItem('guestId');
        let url = '/api/detect';
        if (guestId) {
            url += `?guest_id=${guestId}`;
        }

        const response = await apiClient.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        // Lưu guestId mới nếu có
        if (response.data && response.data.guest_id) {
            localStorage.setItem('guestId', response.data.guest_id);
        }

        return response.data;
    } catch (error) {
        console.error('Lỗi phát hiện cảm xúc:', error);

        if (error.response?.status === 429) {
            ToastService.error(
                'Bạn đã vượt quá giới hạn sử dụng. Vui lòng đăng nhập hoặc thử lại sau.'
            );
        } else if (error.response?.status === 400) {
            ToastService.error(
                error.response.data?.message ||
                    'File không hợp lệ. Vui lòng thử lại với file khác.'
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
        imageFiles.forEach((file) => {
            formData.append('files', file);
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

        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: headers,
            // Không sử dụng credentials 'include' vì we đã tắt withCredentials
        });

        if (!response.ok) {
            throw new Error(`Lỗi HTTP: ${response.status}`);
        }

        // Xử lý SSE (Server-Sent Events)
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

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
                        
                        // Lưu guestId mới nếu có
                        if (jsonData && jsonData.guest_id) {
                            localStorage.setItem('guestId', jsonData.guest_id);
                        }
                        
                        onProgress(jsonData);
                    } catch (e) {
                        console.error('Lỗi parsing SSE data:', e);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Lỗi phát hiện cảm xúc batch:', error);
        ToastService.error('Không thể xử lý các file ảnh. Vui lòng thử lại.');
        throw error;
    }
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
 * @returns {Promise<Array>} Danh sách kết quả phát hiện
 */
export const getEmotionHistory = async (skip = 0, limit = 10) => {
    try {
        // Thêm guestId vào URL nếu người dùng là khách
        const guestId = localStorage.getItem('guestId');
        let url = `/api/history?skip=${skip}&limit=${limit}`;
        if (guestId) {
            url += `&guest_id=${guestId}`;
        }
        
        const response = await apiClient.get(url);
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
