// Import các service khác
import * as emotionService from './emotionServices';
import * as authService from './authService';
// ... import các service khác

// Tạo object chứa tất cả các dịch vụ API
const apiServices = {
    auth: authService,
    emotions: emotionService,
    // ... các dịch vụ khác
};

export default apiServices;