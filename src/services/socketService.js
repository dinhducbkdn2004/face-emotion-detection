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
        isConnected = true;
        return socket;
    }

    try {
        // Nếu đã có socket nhưng không connected, đóng kết nối cũ
        if (socket) {
            socket.disconnect();
            socket = null;
        }

        // Lấy token xác thực
        const token = localStorage.getItem('accessToken');

        // Cấu hình kết nối - sử dụng URL đơn giản hơn
        const baseURL =
            import.meta.env.VITE_API_BASE_URL || 'https://emdbe.ducbkdn.space';
        // Thêm namespace theo đúng giao thức
        const socketURL = baseURL + '/emotion-detection';

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
        socket.on('pong', () => {});

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
        ToastService.error(
            'Cannot connect to realtime server. Please try again later.'
        );
        return null;
    }
};

// Xử lý sự kiện kết nối thành công
const handleConnect = () => {
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
    }
};

// Xử lý lỗi kết nối
const handleConnectError = (error) => {
    isConnected = false;

    // Xử lý các loại lỗi cụ thể
    if (error.message && error.message.includes('xhr poll error')) {
        // Thử lại với chỉ websocket
        if (socket) {
            socket.io.opts.transports = ['websocket'];
        }
    } else if (error.message && error.message.includes('websocket error')) {
        // Thử lại với chỉ polling
        if (socket) {
            socket.io.opts.transports = ['polling'];
        }
    }
};

// Xử lý sự kiện khởi tạo thành công
const handleInitialized = (data) => {
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
    }

    // Thông báo cho các listeners
    notifyListeners('initialized', data);
};

// Xử lý kết quả nhận diện
const handleDetectionResult = (data) => {
    // Kiểm tra dữ liệu hợp lệ trước khi xử lý
    if (!data || (!data.faces && !data.face_detected === false)) {
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

    // Thông báo cho các listeners
    notifyListeners('detection_result', data);
};

// Xử lý thông báo trạng thái
const handleStatus = (data) => {
    notifyListeners('status', data);
};

// Xử lý thông báo lỗi
const handleErrorMessage = (data) => {
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
        return false;
    }

    // Nếu đã khởi tạo rồi, không cần gửi lại
    if (isInitialized) {
        return true;
    }

    // Đặt lại trạng thái initialized
    isInitialized = false;

    // Cập nhật frame rate từ config nếu có
    if (config.detection_interval) {
        frameRate = Math.round(1000 / config.detection_interval);
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
    // Clear interval nếu đang chạy
    if (processingInterval) {
        clearInterval(processingInterval);
        processingInterval = null;
    }

    // Đặt lại trạng thái
    isProcessing = false;
};

// Gửi video frame đến server
export const sendVideoFrame = (frameData) => {
    if (!socket || !isConnected || !isInitialized || !isProcessing) {
        return false;
    }

    // Tăng bộ đếm frame
    frameCounter++;

    // Trích xuất kích thước và dữ liệu từ frameData
    let width = frameData.width || 640;
    let height = frameData.height || 480;
    let data = frameData.data;

    // Gửi frame đến server
    socket.emit('video_frame', {
        frame_id: frameCounter,
        data: data,
        width: width,
        height: height,
        timestamp: Date.now() / 1000,
    });

    return true;
};

// Gửi lệnh điều khiển đến server
export const sendControl = (action, config = {}) => {
    if (!socket || !isConnected) {
        return false;
    }

    if (action === 'start') {
        // Gửi lệnh start - chỉ gửi nếu đã khởi tạo
        if (!isInitialized) {
            return false;
        }

        socket.emit('control', {
            action: 'start',
            config: {
                skipFrameProcessing: false,
                ...config,
            },
        });

        // Đảm bảo trạng thái đúng nếu không có callback
        if (!processingInterval && !config.skipFrameProcessing) {
            isProcessing = true;
        }
    } else if (action === 'stop') {
        // Gửi lệnh stop
        socket.emit('control', {
            action: 'stop',
            config: config,
        });

        // Dừng xử lý frame
        stopFrameProcessing();
    }

    return true;
};

// Đăng ký callback để nhận event
export const addEventListener = (eventName, callback) => {
    if (
        eventListeners[eventName] &&
        typeof callback === 'function' &&
        !eventListeners[eventName].includes(callback)
    ) {
        eventListeners[eventName].push(callback);
    }
};

// Hủy đăng ký callback
export const removeEventListener = (eventName, callback) => {
    if (
        eventListeners[eventName] &&
        typeof callback === 'function' &&
        eventListeners[eventName].includes(callback)
    ) {
        const index = eventListeners[eventName].indexOf(callback);
        if (index !== -1) {
            eventListeners[eventName].splice(index, 1);
        }
    }
};

// Đóng kết nối socket
export const closeConnection = () => {
    // Dừng xử lý frame
    stopFrameProcessing();

    // Đóng socket
    if (socket) {
        socket.disconnect();
        socket = null;
    }

    // Đặt lại trạng thái
    isConnected = false;
    isInitialized = false;
    sessionId = null;

    // Xóa tất cả listeners
    Object.keys(eventListeners).forEach((key) => {
        eventListeners[key] = [];
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
