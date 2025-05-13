import { io } from 'socket.io-client';
import { auth } from '../config/firebase';
import ToastService from '../toasts/ToastService';

// Lưu instance socket.io
let socket = null;
let sessionId = null;
let isConnected = false;
let isInitialized = false;

// Biến theo dõi quá trình xử lý frame
let frameCounter = 0;
let processingInterval = null;
let isProcessing = false;
let frameRate = 3; // FPS mặc định, giảm xuống 3

// Danh sách callback để xử lý event từ server
const eventListeners = {
    detection_result: [],
    status: [],
    error_message: [],
    initialized: [],
};

// Tạo kết nối Socket.IO
export const initializeSocket = async () => {
    // Nếu socket đã tồn tại và đang kết nối, không tạo mới
    if (socket && socket.connected) {
        console.log('Socket already connected');
        isConnected = true;
        return socket;
    }

    try {
        // Nếu đã có socket nhưng không connected, đóng kết nối cũ
        if (socket) {
            console.log(
                'Closing existing socket connection before creating new one'
            );
            socket.disconnect();
            socket = null;
        }

        // Lấy token xác thực
        const token = localStorage.getItem('accessToken');

        // Log token (không hiển thị toàn bộ)
        if (token) {
            console.log('Using token:', token.substring(0, 10) + '...');
        } else {
            console.warn('No authentication token found!');
        }

        // Cấu hình kết nối - sử dụng URL đơn giản hơn
        const baseURL =
            import.meta.env.VITE_API_BASE_URL || 'https://ped.ldblckrs.id.vn';
        // Thêm namespace theo đúng giao thức
        const socketURL = baseURL + '/emotion-detection';

        console.log('Connecting to Socket.IO at:', socketURL);

        // Khởi tạo kết nối Socket.IO với namespace và token xác thực - cấu hình giống client.js
        socket = io(socketURL, {
            path: '/socket.io',
            auth: {
                token: token,
            },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
            transports: ['websocket', 'polling'],
        });

        // Đăng ký các event handlers
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('connect_error', handleConnectError);
        socket.on('initialized', handleInitialized);
        socket.on('detection_result', handleDetectionResult);
        socket.on('status', handleStatus);
        socket.on('error_message', handleErrorMessage);
        socket.on('pong', () => console.log('Received pong from server'));

        // Đợi socket kết nối hoặc lỗi - đơn giản hóa bằng cách không dùng timeout
        return new Promise((resolve) => {
            // Handler khi kết nối thành công
            const onConnect = () => {
                socket.off('connect', onConnect);
                socket.off('connect_error', onError);
                isConnected = true;
                resolve(socket);
            };

            // Handler khi có lỗi kết nối
            const onError = (err) => {
                socket.off('connect', onConnect);
                socket.off('connect_error', onError);
                console.error('Socket connection error:', err);
                resolve(socket); // Vẫn resolve socket để xử lý sau
            };

            // Đăng ký các event handlers tạm thời
            socket.once('connect', onConnect);
            socket.once('connect_error', onError);

            // Nếu socket đã kết nối rồi, resolve ngay
            if (socket.connected) {
                resolve(socket);
            }
        });
    } catch (error) {
        console.error('Error initializing socket:', error);
        ToastService.error(
            'Cannot connect to realtime server. Please try again later.'
        );
        return null;
    }
};

// Xử lý sự kiện kết nối thành công
const handleConnect = () => {
    console.log('Socket connected:', socket.id);
    isConnected = true;

    // Gửi thông báo đến UI
    ToastService.info('Connected to realtime server.');


    // Gửi yêu cầu khởi tạo ngay
    socket.emit('initialize', {
        client_id: `web_client_${Date.now()}`,
        config: {
            video_source: 'webcam',
            detection_interval: 5,
            min_face_size: 64,
            return_face_landmarks: false,
        },
    });
};

// Xử lý sự kiện kết nối bị ngắt
const handleDisconnect = (reason) => {
    isConnected = false;

    // Dừng xử lý frame nếu đang chạy
    stopFrameProcessing();

    // Nếu bị ngắt kết nối bởi server, thông báo cho người dùng
    if (reason === 'io server disconnect') {
        ToastService.error('Server disconnected. Please try again later.');
    } else if (reason === 'transport close') {
        console.log('Transport closed (network issue)');
    } else if (reason === 'ping timeout') {
        console.log('Ping timeout - server not responding');
    }
};

// Xử lý lỗi kết nối
const handleConnectError = (error) => {
    console.error('Socket connect error:', error);
    isConnected = false;

    // Log chi tiết lỗi
    if (error.message) {
        console.error('Error message:', error.message);
    }
    if (error.description) {
        console.error('Error description:', error.description);
    }
    if (error.type) {
        console.error('Error type:', error.type);
    }

    // Xử lý các loại lỗi cụ thể
    if (error.message && error.message.includes('xhr poll error')) {
        // Thử lại với chỉ websocket
        if (socket) {
            console.log('Switching to WebSocket only transport');
            socket.io.opts.transports = ['websocket'];
        }
    } else if (error.message && error.message.includes('websocket error')) {
        // Thử lại với chỉ polling
        if (socket) {
            console.log('Switching to polling only transport');
            socket.io.opts.transports = ['polling'];
        }
    }
};

// Xử lý sự kiện khởi tạo thành công
const handleInitialized = (data) => {
    console.log('Session initialized:', data);
    sessionId = data.session_id;
    isInitialized = true;

    // Nếu server gửi về thông tin max_frame_rate, cập nhật giá trị
    if (data.config && data.config.max_frame_rate) {
        // Giới hạn max_frame_rate trong khoảng 1-5
        const serverFrameRate = Math.min(
            Math.max(data.config.max_frame_rate, 1),
            5
        );
        frameRate = Math.min(frameRate, serverFrameRate);
        console.log(
            `Adjusted frame rate to ${frameRate} FPS from server config`
        );
    }

    // Thông báo cho các listeners
    notifyListeners('initialized', data);
};

// Xử lý kết quả nhận diện
const handleDetectionResult = (data) => {
    // Kiểm tra dữ liệu hợp lệ trước khi xử lý
    if (!data || (!data.faces && !data.face_detected === false)) {
        console.warn('Received invalid detection result:', data);
        return;
    }

    // Nếu không có faces nhưng face_detected = false, tạo một kết quả trống
    if (!data.faces && data.face_detected === false) {
        data.faces = [];
    }

    // Đảm bảo mỗi face có dữ liệu emotions
    if (data.faces) {
        data.faces.forEach((face) => {
            // Đảm bảo emotions tồn tại
            if (
                !face.emotions ||
                !Array.isArray(face.emotions) ||
                face.emotions.length === 0
            ) {
                face.emotions = [
                    { emotion: 'unknown', score: 1, percentage: 100 },
                ];
            }

            // Sắp xếp emotions theo thứ tự giảm dần
            face.emotions.sort((a, b) => {
                const scoreA = a.percentage || a.score * 100;
                const scoreB = b.percentage || b.score * 100;
                return scoreB - scoreA;
            });
        });
    }

    console.log(
        `Received detection result for frame #${data.frame_id}, faces: ${data.faces?.length || 0}`
    );

    // Thông báo cho các listeners
    notifyListeners('detection_result', data);
};

// Xử lý thông báo trạng thái
const handleStatus = (data) => {
    console.log('Status update:', data);
    notifyListeners('status', data);
};

// Xử lý thông báo lỗi
const handleErrorMessage = (data) => {
    console.error('Error from server:', data);

    // Hiển thị thông báo lỗi nếu cần
    if (data.message) {
        ToastService.error(`Lỗi: ${data.message}`);
    }

    // Điều chỉnh frame rate nếu server báo quá tải
    if (data.code === 429 && data.recommended_value) {
        // Giới hạn recommended_value trong khoảng 1-5
        const recommendedRate = Math.min(
            Math.max(data.recommended_value, 1),
            5
        );
        frameRate = recommendedRate;
        console.log(
            `Adjusting frame rate to ${frameRate} FPS (server recommended)`
        );

        // Khởi động lại quy trình xử lý frame với tốc độ mới
        if (isProcessing) {
            stopFrameProcessing();
            startFrameProcessing();
        }
    }

    notifyListeners('error_message', data);
};

// Thông báo cho các listeners
const notifyListeners = (eventName, data) => {
    if (eventListeners[eventName]) {
        eventListeners[eventName].forEach((callback) => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in ${eventName} listener:`, error);
            }
        });
    }
};

// Khởi tạo session với server
export const initializeSession = (config = {}) => {
    if (!socket || !isConnected) {
        console.error('Socket not connected');
        return false;
    }

    // Nếu đã khởi tạo rồi, không cần gửi lại
    if (isInitialized) {
        console.log('Session already initialized');
        return true;
    }

    console.log('Initializing session with config:', config);

    // Đặt lại trạng thái initialized
    isInitialized = false;
    console.log('Resetting initialized state before sending initialize event');

    // Cập nhật frame rate từ config nếu có
    if (config.detection_interval) {
        frameRate = Math.round(1000 / config.detection_interval);
        console.log(`Set frame rate to ${frameRate} FPS from config`);
    }

    // Gửi event initialize theo đúng giao thức
    socket.emit('initialize', {
        client_id: `web_client_${Date.now()}`,
        config: {
            video_source: 'webcam',
            detection_interval: 5,
            min_face_size: 64,
            return_face_landmarks: false,
            ...config,
        },
    });

    // Thiết lập timeout đơn giản (không cần retry phức tạp)
    setTimeout(() => {
        if (!isInitialized) {
            console.log(
                'No initialized event received after 5s, forcing initialized state'
            );
            isInitialized = true;
            notifyListeners('initialized', {
                session_id: socket.id,
                timestamp: Date.now() / 1000,
                config: {
                    max_frame_rate: 10,
                    max_resolution: [640, 480],
                },
            });
        }
    }, 5000);

    return true;
};

// Bắt đầu xử lý video frames - dựa theo socket-client.js
export const startFrameProcessing = (captureFrameCallback) => {
    if (!socket || !isConnected || !isInitialized) {
        console.error('Socket not ready for frame processing');
        return false;
    }

    // Nếu đang xử lý, dừng trước khi bắt đầu lại
    if (isProcessing && processingInterval) {
        stopFrameProcessing();
    }

    // Đảm bảo frameRate trong khoảng 1-5
    frameRate = Math.min(Math.max(frameRate, 1), 5);

    // Đánh dấu đang xử lý và reset bộ đếm
    isProcessing = true;
    frameCounter = 0;

    // Tính toán khoảng thời gian dựa trên frame rate
    const interval = Math.floor(1000 / frameRate);
    console.log(
        `Starting frame processing at ${frameRate} FPS (interval: ${interval}ms)`
    );

    // Thiết lập interval để gửi frames
    processingInterval = setInterval(() => {
        if (
            isProcessing &&
            captureFrameCallback &&
            typeof captureFrameCallback === 'function'
        ) {
            // Gọi callback để chụp frame và gửi
            captureFrameCallback();
        }
    }, interval);

    return true;
};

// Dừng xử lý video frames
export const stopFrameProcessing = () => {
    if (processingInterval) {
        clearInterval(processingInterval);
        processingInterval = null;
    }
    isProcessing = false;
    console.log('Stopped frame processing');
    return true;
};

// Gửi video frame để xử lý
export const sendVideoFrame = (frameData) => {
    if (!socket || !isConnected) {
        console.error('Socket not connected, cannot send frame');
        return false;
    }

    if (!isInitialized) {
        console.error('Socket not initialized, cannot send frame');
        return false;
    }

    // Cập nhật frameCounter nếu chưa được đặt trong frameData
    if (!frameData.frame_id) {
        frameData.frame_id = ++frameCounter;
    }

    // Chỉ log khi gửi frame đầu tiên và sau đó mỗi 50 frame
    if (frameData.frame_id === 1 || frameData.frame_id % 50 === 0) {
        console.log(
            `Sending video frame #${frameData.frame_id}, resolution: ${frameData.resolution?.[0]}x${frameData.resolution?.[1]}`
        );
    }

    socket.emit('video_frame', frameData);
    return true;
};

// Gửi yêu cầu điều khiển
export const sendControl = (action, config = {}) => {
    if (!socket || !isConnected) {
        console.error('Socket not connected, cannot send control action');
        return false;
    }

    console.log('Sending control action:', action, config);

    socket.emit('control', {
        action: action,
        timestamp: Date.now() / 1000,
        ...config,
    });

    // Nếu action là start, tự động bắt đầu xử lý frames
    if (action === 'start' && !config.skipFrameProcessing) {
        console.log(
            'Control action "start" sent - frame processing will be managed separately'
        );
    }

    // Nếu action là stop, dừng xử lý frames
    if (action === 'stop') {
        stopFrameProcessing();
    }

    return true;
};

// Đăng ký lắng nghe event
export const addEventListener = (eventName, callback) => {
    if (!eventListeners[eventName]) {
        console.warn(`Unknown event: ${eventName}`);
        return false;
    }

    eventListeners[eventName].push(callback);
    return true;
};

// Hủy đăng ký lắng nghe event
export const removeEventListener = (eventName, callback) => {
    if (!eventListeners[eventName]) {
        return false;
    }

    const index = eventListeners[eventName].indexOf(callback);
    if (index !== -1) {
        eventListeners[eventName].splice(index, 1);
        return true;
    }

    return false;
};

// Đóng kết nối
export const closeConnection = () => {
    // Dừng xử lý frames nếu đang chạy
    stopFrameProcessing();

    if (socket) {
        socket.disconnect();
        socket = null;
        isConnected = false;
        isInitialized = false;
        sessionId = null;
        console.log('Socket connection closed');
    }

    // Xóa tất cả event listeners
    Object.keys(eventListeners).forEach((event) => {
        eventListeners[event] = [];
    });
};

// Thiết lập frame rate mới
export const setFrameRate = (newFrameRate) => {
    // Giới hạn frameRate trong khoảng 1-5
    const limitedFrameRate = Math.min(Math.max(newFrameRate, 1), 5);

    if (limitedFrameRate !== newFrameRate) {
        console.log(
            `Requested frame rate ${newFrameRate} FPS, but limited to ${limitedFrameRate} FPS`
        );
    }

    frameRate = limitedFrameRate;
    console.log(`Frame rate set to ${frameRate} FPS`);

    // Nếu đang xử lý, khởi động lại với frame rate mới
    if (isProcessing) {
        stopFrameProcessing();
        startFrameProcessing();
    }

    return frameRate;
};

// Lấy trạng thái frame processing
export const getFrameProcessingState = () => ({
    isProcessing,
    frameRate,
    frameCounter,
});

// Export các trạng thái
export const getSocketState = () => ({
    isConnected,
    isInitialized,
    sessionId,
});

export default {
    initializeSocket,
    initializeSession,
    sendVideoFrame,
    sendControl,
    addEventListener,
    removeEventListener,
    closeConnection,
    getSocketState,
    startFrameProcessing,
    stopFrameProcessing,
    setFrameRate,
    getFrameProcessingState,
};
