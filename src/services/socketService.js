import { io } from 'socket.io-client';
import { auth } from '../config/firebase';
import ToastService from '../toasts/ToastService';

// Lưu instance socket.io
let socket = null;
let sessionId = null;
let isConnected = false;
let isInitialized = false;

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

        // Kiểm tra môi trường trình duyệt
        const userAgent = navigator.userAgent || '';
        const isEdge =
            userAgent.indexOf('Edge') > -1 || userAgent.indexOf('Edg/') > -1;
        // Sử dụng chỉ websocket cho Edge, cả hai cho các trình duyệt khác
        const initialTransports = isEdge
            ? ['websocket']
            : ['websocket', 'polling'];

        console.log(
            `Browser detected: ${isEdge ? 'Microsoft Edge' : 'Other browser'}`
        );
        console.log(`Using transports:`, initialTransports);

        // Khởi tạo kết nối Socket.IO với namespace và token xác thực
        socket = io(socketURL, {
            path: '/socket.io',
            auth: {
                token: token,
            },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 10, // Tăng số lần thử kết nối lại
            transports: initialTransports, // Sử dụng transports dựa vào trình duyệt
            timeout: 20000, // Tăng timeout lên 20s
            forceNew: true, // Luôn tạo kết nối mới
            autoConnect: true,
            withCredentials: true,
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

        // Đợi socket kết nối hoặc lỗi
        return new Promise((resolve, reject) => {
            // Set timeout 20 giây
            const timeoutId = setTimeout(() => {
                console.error('Socket connection timeout after 20 seconds');
                // Không reject kết nối, chỉ cảnh báo
                console.log(
                    'Continuing despite timeout, socket may connect later'
                );

                // Thử kết nối lại
                if (socket && !socket.connected) {
                    console.log(
                        'Attempting to reconnect manually after timeout'
                    );
                    socket.connect();
                }

                resolve(socket);
            }, 20000);

            // Handler khi kết nối thành công
            const onConnect = () => {
                clearTimeout(timeoutId);
                socket.off('connect', onConnect);
                socket.off('connect_error', onError);

                // Đánh dấu là đã connected
                isConnected = true;

                resolve(socket);
            };

            // Handler khi có lỗi kết nối
            const onError = (err) => {
                clearTimeout(timeoutId);
                socket.off('connect', onConnect);
                socket.off('connect_error', onError);

                console.error('Socket connection error:', err);

                // Thêm thông tin chi tiết lỗi
                if (err.message) console.error('Error message:', err.message);
                if (err.description)
                    console.error('Error description:', err.description);
                if (err.stack) console.error('Error stack:', err.stack);

                // Thử chuyển sang transport khác nếu websocket bị từ chối
                if (err.message && err.message.includes('websocket')) {
                    console.log(
                        'WebSocket connection failed, switching to polling'
                    );
                    socket.io.opts.transports = ['polling'];
                    socket.connect();
                }

                // Không reject, chỉ trả về socket (có thể connect sau)
                console.log(
                    'Continuing despite connection error, socket may connect later'
                );
                resolve(socket);
            };

            // Đăng ký các event handlers tạm thời
            socket.once('connect', onConnect);
            socket.once('connect_error', onError);

            // Nếu socket đã kết nối rồi, resolve ngay
            if (socket.connected) {
                clearTimeout(timeoutId);
                resolve(socket);
            }
        });
    } catch (error) {
        console.error('Error initializing socket:', error);
        ToastService.error(
            'Không thể kết nối đến máy chủ realtime. Vui lòng thử lại sau.'
        );
        return null;
    }
};

// Xử lý sự kiện kết nối thành công
const handleConnect = () => {
    console.log('Socket connected:', socket.id);
    isConnected = true;

    // Gửi thông báo đến UI
    ToastService.info('Đã kết nối đến máy chủ realtime.');

    // Cập nhật trạng thái
    console.log('Connection state updated: isConnected =', isConnected);

    // Gửi yêu cầu khởi tạo ngay
    console.log('Automatically sending initialize event');
    socket.emit('initialize', {
        client_id: `web_client_${Date.now()}`,
        config: {
            video_source: 'webcam',
            detection_interval: 5,
            min_face_size: 64,
            return_face_landmarks: false,
        },
    });

    // Thiết lập ping interval để giữ kết nối
    setupPingInterval();
};

// Thiết lập ping interval để giữ kết nối sống
let pingInterval = null;
const setupPingInterval = () => {
    // Xóa interval cũ nếu có
    if (pingInterval) {
        clearInterval(pingInterval);
    }

    // Thiết lập ping mỗi 20 giây
    pingInterval = setInterval(() => {
        if (socket && socket.connected) {
            console.log('Sending ping to keep connection alive');
            socket.emit('ping');
        } else {
            clearInterval(pingInterval);
            pingInterval = null;
        }
    }, 20000);
};

// Xử lý sự kiện kết nối bị ngắt
const handleDisconnect = (reason) => {
    console.log('Socket disconnected:', reason);
    isConnected = false;

    // Nếu bị ngắt kết nối bởi server, thông báo cho người dùng
    if (reason === 'io server disconnect') {
        ToastService.error('Máy chủ đã ngắt kết nối. Vui lòng thử lại sau.');
    } else if (reason === 'transport close') {
        console.log('Transport closed (network issue)');
        // Có thể là do mạng, socket.io sẽ tự động kết nối lại
        ToastService.warning(
            'Kết nối mạng không ổn định, đang thử kết nối lại...'
        );
    } else if (reason === 'ping timeout') {
        console.log('Ping timeout - server không phản hồi');
        ToastService.warning('Máy chủ không phản hồi, đang thử kết nối lại...');
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
        ToastService.error(
            'Lỗi kết nối: Không thể thiết lập polling. Đang thử kết nối lại...'
        );

        // Thử lại với chỉ websocket
        if (socket) {
            console.log('Switching to WebSocket only transport');
            socket.io.opts.transports = ['websocket'];
            // Không cần gọi connect vì socket.io sẽ tự kết nối lại
        }
    } else if (error.message && error.message.includes('websocket error')) {
        ToastService.error(
            'Lỗi kết nối: WebSocket không khả dụng. Đang thử phương thức khác...'
        );

        // Thử lại với chỉ polling
        if (socket) {
            console.log('Switching to polling only transport');
            socket.io.opts.transports = ['polling'];
            // Không cần gọi connect vì socket.io sẽ tự kết nối lại
        }
    } else {
        ToastService.error(
            `Không thể kết nối đến máy chủ realtime: ${error.message || 'Lỗi không xác định'}`
        );
    }
};

// Xử lý sự kiện khởi tạo thành công
const handleInitialized = (data) => {
    console.log('Session initialized:', data);
    sessionId = data.session_id;
    isInitialized = true;

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

    // Chỉ log khi gửi frame đầu tiên và sau đó mỗi 50 frame
    if (frameData.frame_id === 1 || frameData.frame_id % 50 === 0) {
        console.log(
            `Sending video frame #${frameData.frame_id}, resolution: ${frameData.resolution[0]}x${frameData.resolution[1]}`
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
    if (socket) {
        // Xóa ping interval
        if (pingInterval) {
            clearInterval(pingInterval);
            pingInterval = null;
        }

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
};
