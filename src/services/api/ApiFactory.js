import axiosInstance from '../../config/axios';

/**
 * Class factory để tạo các client API tự động
 */
class ApiFactory {
    /**
     * Tạo một API client với prefix cho endpoint
     * @param {string} prefix - Prefix của endpoint (ví dụ: '/users')
     * @returns {Object} - API client đã cấu hình
     */
    static create(prefix) {
        return {
            /**
             * Lấy tất cả dữ liệu
             * @param {Object} params - Tham số query
             * @returns {Promise} - Promise chứa kết quả
             */
            getAll: (params = {}) => {
                return axiosInstance.get(`${prefix}`, { params });
            },

            /**
             * Lấy chi tiết một bản ghi theo ID
             * @param {string|number} id - ID của bản ghi
             * @param {Object} params - Tham số query bổ sung
             * @returns {Promise} - Promise chứa kết quả
             */
            getDetail: (id, params = {}) => {
                return axiosInstance.get(`${prefix}/${id}`, { params });
            },

            /**
             * Lấy tất cả chi tiết (có thể tùy chỉnh theo nhu cầu)
             * @param {Object} params - Tham số query
             * @returns {Promise} - Promise chứa kết quả
             */
            getAllDetail: (params = {}) => {
                return axiosInstance.get(`${prefix}/all-details`, { params });
            },

            /**
             * Tạo mới một bản ghi
             * @param {Object} data - Dữ liệu để tạo
             * @returns {Promise} - Promise chứa kết quả
             */
            create: (data) => {
                return axiosInstance.post(`${prefix}`, data);
            },

            /**
             * Cập nhật một bản ghi
             * @param {string|number} id - ID của bản ghi
             * @param {Object} data - Dữ liệu cần cập nhật
             * @returns {Promise} - Promise chứa kết quả
             */
            update: (id, data) => {
                return axiosInstance.put(`${prefix}/${id}`, data);
            },

            /**
             * Cập nhật một phần của bản ghi
             * @param {string|number} id - ID của bản ghi
             * @param {Object} data - Dữ liệu cần cập nhật
             * @returns {Promise} - Promise chứa kết quả
             */
            patch: (id, data) => {
                return axiosInstance.patch(`${prefix}/${id}`, data);
            },

            /**
             * Xóa một bản ghi
             * @param {string|number} id - ID của bản ghi
             * @returns {Promise} - Promise chứa kết quả
             */
            delete: (id) => {
                return axiosInstance.delete(`${prefix}/${id}`);
            },

            /**
             * Tạo một custom endpoint
             * @param {string} action - Tên action/endpoint
             * @returns {Object} - Các phương thức HTTP cho endpoint tùy chỉnh
             */
            endpoint: (action) => {
                return {
                    get: (params = {}) =>
                        axiosInstance.get(`${prefix}/${action}`, { params }),
                    post: (data = {}) =>
                        axiosInstance.post(`${prefix}/${action}`, data),
                    put: (data = {}) =>
                        axiosInstance.put(`${prefix}/${action}`, data),
                    delete: (params = {}) =>
                        axiosInstance.delete(`${prefix}/${action}`, { params }),
                };
            },
        };
    }
}

export default ApiFactory;
