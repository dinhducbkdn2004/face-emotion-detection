import { useState, useEffect, useRef } from 'react';
import {
    Box,
    Button,
    Paper,
    Typography,
    CircularProgress,
    useTheme,
    useMediaQuery,
    Stack,
    Chip,
    Alert,
    Collapse,
    IconButton,
    Slider,
    Tooltip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Switch,
    FormControlLabel,
} from '@mui/material';
import {
    PlayArrow,
    Stop,
    Settings,
    MeetingRoom,
    CloseOutlined,
    SpeedOutlined,
    CameraAlt,
    SwitchCamera,
    BugReport,
} from '@mui/icons-material';
import socketService from '../services/socketService';
import ToastService from '../toasts/ToastService';

// Dữ liệu giả lập để demo khi không có server
const mockResult = {
    frame_id: 1,
    timestamp: Date.now() / 1000,
    processing_time: 0.05,
    faces: [
        {
            box: [100, 100, 200, 200],
            tracking_id: 'face_1',
            emotions: [
                { emotion: 'neutral', score: 0.95, percentage: 95 },
                { emotion: 'happy', score: 0.03, percentage: 3 },
                { emotion: 'sad', score: 0.01, percentage: 1 },
                { emotion: 'surprise', score: 0.01, percentage: 1 },
            ],
        },
    ],
    face_detected: true,
};

const RealtimeEmotionDetector = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const videoRef = useRef(null);
    const canvasRef = useRef(null); // Canvas để chụp frame
    const overlayCanvasRef = useRef(null); // Canvas để hiển thị bounding box
    const [stream, setStream] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [socketState, setSocketState] = useState({
        isConnected: false,
        isInitialized: false,
    });
    const [error, setError] = useState(null);
    const [detectionResult, setDetectionResult] = useState(null);
    const [frameCounter, setFrameCounter] = useState(0);
    const animationRef = useRef(null);
    const boundingBoxAnimationRef = useRef(null); // Ref cho animation frame của bounding box
    const lastFrameTimeRef = useRef(0);
    const frameIntervalRef = useRef(200); // 5 FPS mặc định
    const [fps, setFps] = useState(3); // Giá trị FPS mặc định là 3
    const [showSettings, setShowSettings] = useState(false);
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState('');
    const [useMockData, setUseMockData] = useState(false);
    const mockIntervalRef = useRef(null);
    const lastDetectionResultRef = useRef(null); // Lưu trữ kết quả mới nhất

    // Thêm biến để lưu trữ vị trí bounding box trước đó và hiện tại
    const previousBoxesRef = useRef({});
    const currentBoxesRef = useRef({});
    const lastUpdateTimeRef = useRef(0);

    // Thêm biến để lưu trữ vận tốc của mỗi khuôn mặt
    const facesVelocityRef = useRef({});

    // Kết nối socket.io khi component mount
    useEffect(() => {
        const initSocket = async () => {
            try {
                // Khởi tạo kết nối Socket.IO
                await socketService.initializeSocket();

                // Đăng ký lắng nghe sự kiện
                socketService.addEventListener(
                    'initialized',
                    handleInitialized
                );
                socketService.addEventListener(
                    'detection_result',
                    handleDetectionResult
                );
                socketService.addEventListener(
                    'error_message',
                    handleErrorMessage
                );
                socketService.addEventListener('status', handleStatusUpdate);

                // Cập nhật trạng thái
                updateSocketState();
            } catch (error) {
                console.error('Không thể kết nối đến máy chủ:', error);
                setError(
                    'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.'
                );
            }
        };

        initSocket();

        // Cleanup khi unmount
        return () => {
            cleanupResources();
        };
    }, []);

    // Cập nhật trạng thái socket
    const updateSocketState = () => {
        const state = socketService.getSocketState();
        console.log('Socket state updated:', state);
        setSocketState(state);
    };

    // Xử lý sự kiện khởi tạo thành công
    const handleInitialized = (data) => {
        console.log('Socket initialized:', data);
        updateSocketState();
    };

    // Xử lý kết quả nhận diện
    const handleDetectionResult = (data) => {
        // Cập nhật state cho UI
        setDetectionResult(data);

        // Lưu trữ kết quả mới nhất
        lastDetectionResultRef.current = data;

        // Cập nhật ngay lập tức cho hệ thống nội suy
        const now = performance.now();

        // Lưu trữ vị trí hiện tại vào previousBoxes khi có kết quả mới
        if (data && data.faces && data.faces.length > 0) {
            previousBoxesRef.current = { ...currentBoxesRef.current };
            currentBoxesRef.current = {
                result: data,
                faces: data.faces.map((face) => ({
                    id: face.tracking_id || Math.random().toString(),
                    box: [...face.box],
                    emotions: face.emotions,
                    timestamp: now,
                })),
                timestamp: now,
            };
            lastUpdateTimeRef.current = now;
        }
    };

    // Xử lý thông báo lỗi
    const handleErrorMessage = (data) => {
        console.error('Lỗi từ server:', data);

        // Nếu server báo quá tải, giảm frame rate
        if (data.code === 429 && data.recommended_value) {
            const recommendedFps = data.recommended_value;
            frameIntervalRef.current = 1000 / recommendedFps;
            setFps(recommendedFps);
            console.log(`Điều chỉnh frame rate xuống ${recommendedFps} FPS`);
        }

        // Hiển thị lỗi
        if (data.message) {
            setError(data.message);
        }
    };

    // Xử lý cập nhật trạng thái
    const handleStatusUpdate = (data) => {
        console.log('Cập nhật trạng thái:', data);
        // Có thể hiển thị trạng thái nếu cần
    };

    // Kết nối lại Socket.IO
    const reconnectSocket = async () => {
        try {
            await socketService.closeConnection();
            const socket = await socketService.initializeSocket();
            if (socket) {
                updateSocketState();
                ToastService.success('Reconnected successfully');
            }
        } catch (error) {
            console.error('Error reconnecting:', error);
            setError('Cannot reconnect. Please try again later.');
        }
    };

    // Lấy danh sách camera
    const getCameras = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(
                (device) => device.kind === 'videoinput'
            );
            console.log('Available cameras:', videoDevices);
            setCameras(videoDevices);

            // Nếu có camera và chưa chọn camera nào, chọn camera đầu tiên
            if (videoDevices.length > 0 && !selectedCamera) {
                setSelectedCamera(videoDevices[0].deviceId);
            }
        } catch (error) {
            console.error('Error getting camera list:', error);
        }
    };

    // Gọi lấy danh sách camera khi component mount
    useEffect(() => {
        getCameras();
    }, []);

    // Khởi tạo webcam
    const initializeCamera = async () => {
        try {
            // Nếu đã có stream trước đó, dừng nó
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }

            // Cấu hình camera
            const constraints = {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    deviceId: selectedCamera
                        ? { exact: selectedCamera }
                        : undefined,
                },
            };

            console.log('Using camera constraints:', constraints);

            // Yêu cầu quyền truy cập camera
            const mediaStream =
                await navigator.mediaDevices.getUserMedia(constraints);

            // Gán stream vào video element
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
                setError(null);

                // Log để debug
                console.log('Camera connected successfully');
                mediaStream.getTracks().forEach((track) => {
                    console.log(
                        'Video track:',
                        track.label,
                        'enabled:',
                        track.enabled
                    );
                });
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            setError(
                'Cannot access camera. Please ensure you have granted camera access.'
            );
        }
    };

    // Xử lý khi chọn camera khác
    const handleCameraChange = (event) => {
        const newCameraId = event.target.value;
        setSelectedCamera(newCameraId);

        // Nếu đang có stream, khởi tạo lại với camera mới
        if (stream) {
            initializeCamera();
        }
    };

    // Tạo dữ liệu giả lập ngẫu nhiên
    const generateMockResult = () => {
        const emotions = [
            'neutral',
            'happy',
            'sad',
            'angry',
            'surprise',
            'fear',
            'disgust',
        ];
        const mainEmotion = emotions[Math.floor(Math.random() * 3)]; // Chủ yếu là neutral, happy, sad
        const mainScore = 0.7 + Math.random() * 0.25; // 70-95%

        // Tính tọa độ box dựa trên kích thước canvas
        let boxX = 50,
            boxY = 50,
            boxWidth = 200,
            boxHeight = 200;
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            boxX = Math.floor(
                canvas.width * 0.2 + Math.random() * canvas.width * 0.3
            );
            boxY = Math.floor(
                canvas.height * 0.1 + Math.random() * canvas.height * 0.3
            );
            boxWidth = Math.floor(
                canvas.width * 0.3 + Math.random() * canvas.width * 0.1
            );
            boxHeight = Math.floor(
                canvas.height * 0.3 + Math.random() * canvas.height * 0.1
            );
        }

        // Tạo kết quả giả lập
        return {
            frame_id: frameCounter,
            timestamp: Date.now() / 1000,
            processing_time: 0.01 + Math.random() * 0.05,
            faces: [
                {
                    box: [boxX, boxY, boxWidth, boxHeight],
                    tracking_id: 'face_1',
                    emotions: [
                        {
                            emotion: mainEmotion,
                            score: mainScore,
                            percentage: mainScore * 100,
                        },
                        {
                            emotion:
                                emotions[
                                    Math.floor(Math.random() * emotions.length)
                                ],
                            score: (1 - mainScore) * 0.5,
                            percentage: (1 - mainScore) * 50,
                        },
                        {
                            emotion:
                                emotions[
                                    Math.floor(Math.random() * emotions.length)
                                ],
                            score: (1 - mainScore) * 0.3,
                            percentage: (1 - mainScore) * 30,
                        },
                        {
                            emotion:
                                emotions[
                                    Math.floor(Math.random() * emotions.length)
                                ],
                            score: (1 - mainScore) * 0.2,
                            percentage: (1 - mainScore) * 20,
                        },
                    ],
                },
            ],
            face_detected: true,
        };
    };

    // Bắt đầu xử lý
    const startProcessing = async () => {
        try {
            // Nếu sử dụng dữ liệu giả lập
            if (useMockData) {
                if (!stream) {
                    await initializeCamera();
                }

                // Bắt đầu giả lập dữ liệu
                setIsProcessing(true);
                setFrameCounter(0);
                startSendingFrames();

                // Tạo interval để giả lập kết quả nhận diện
                if (mockIntervalRef.current) {
                    clearInterval(mockIntervalRef.current);
                }

                mockIntervalRef.current = setInterval(() => {
                    const mockData = generateMockResult();
                    setDetectionResult(mockData);
                }, 200); // Cập nhật kết quả mỗi 200ms

                // Bắt đầu vòng lặp render bounding box
                window.requestAnimationFrame(renderBoundingBoxes);

                return;
            }

            // Tiếp tục với xử lý thông thường
            if (!socketState.isConnected) {
                await socketService.initializeSocket();
                updateSocketState();
            }

            if (!stream) {
                await initializeCamera();

                // Đợi một chút để camera khởi động hoàn toàn
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            // Gửi lại trạng thái kết nối
            updateSocketState();

            // Nếu vẫn không kết nối được, chuyển sang chế độ giả lập
            if (!socketState.isConnected) {
                setUseMockData(true);
                setError(null);
                startProcessing(); // Gọi lại hàm với chế độ giả lập
                return;
            }

            // Khởi tạo session với server
            if (socketState.isConnected) {
                socketService.initializeSession({
                    video_source: 'webcam',
                    detection_interval: Math.round(1000 / fps), // Chuyển FPS thành ms
                    min_face_size: 64,
                });

                // Đợi server phản hồi initialized (khoảng 1s)
                await new Promise((resolve) => setTimeout(resolve, 1000));
                updateSocketState();
            }

            // Gửi lệnh bắt đầu xử lý
            socketService.sendControl('start', { skipFrameProcessing: true });

            // Bắt đầu gửi frames sử dụng socketService
            setIsProcessing(true);
            setFrameCounter(0);
            setError(null);

            // Bắt đầu vòng lặp render bounding box
            window.requestAnimationFrame(renderBoundingBoxes);

            // Sử dụng hàm xử lý frame mới từ socketService
            socketService.startFrameProcessing(captureAndSendFrame);
        } catch (error) {
            // Chuyển sang chế độ giả lập
            setUseMockData(true);
            setError(null);
            startProcessing(); // Gọi lại hàm với chế độ giả lập
        }
    };

    // Dừng xử lý
    const stopProcessing = () => {
        try {
            // Dừng giả lập dữ liệu nếu đang dùng
            if (useMockData && mockIntervalRef.current) {
                clearInterval(mockIntervalRef.current);
                mockIntervalRef.current = null;
            }

            // Tiếp tục xử lý thông thường
            if (socketState.isConnected) {
                socketService.sendControl('stop');
                // socketService.stopFrameProcessing() sẽ được gọi tự động từ sendControl('stop')
            }

            setIsProcessing(false);

            // Dừng vòng lặp animation
            if (animationRef.current) {
                window.cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }

            // Dừng vòng lặp animation cho bounding box
            if (boundingBoxAnimationRef.current) {
                window.cancelAnimationFrame(boundingBoxAnimationRef.current);
                boundingBoxAnimationRef.current = null;
            }
        } catch (error) {
            console.error('Error stopping processing:', error);
        }
    };

    // Bắt đầu gửi frames - chỉ sử dụng cho mock data
    const startSendingFrames = () => {
        // Đặt thời gian bắt đầu
        lastFrameTimeRef.current = performance.now();

        // Hàm gửi frame
        const sendFrame = (timestamp) => {
            if (!isProcessing) return;

            // Tính thời gian đã trôi qua
            const elapsed = timestamp - lastFrameTimeRef.current;

            // Nếu đã đến thời điểm gửi frame tiếp theo
            if (elapsed >= frameIntervalRef.current) {
                // Cập nhật thời gian frame cuối
                lastFrameTimeRef.current = timestamp;

                // Gửi frame nếu video đã sẵn sàng
                if (
                    videoRef.current &&
                    videoRef.current.readyState ===
                        videoRef.current.HAVE_ENOUGH_DATA
                ) {
                    captureAndSendFrame();
                }
            }

            // Tiếp tục vòng lặp
            animationRef.current = window.requestAnimationFrame(sendFrame);
        };

        // Bắt đầu vòng lặp
        animationRef.current = window.requestAnimationFrame(sendFrame);
    };

    // Chụp và gửi frame - được gọi bởi socketService.startFrameProcessing
    const captureAndSendFrame = () => {
        if (!canvasRef.current || !videoRef.current) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');

        // Đảm bảo canvas có kích thước phù hợp
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        // Vẽ frame từ video lên canvas để chụp ảnh
        try {
            // Xóa canvas và vẽ video
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Chuyển canvas thành base64 (JPEG)
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            const base64Data = dataUrl.split(',')[1];

            // Tăng bộ đếm frame và cập nhật UI
            setFrameCounter((prev) => prev + 1);

            // Gửi frame đến server hoặc xử lý giả lập
            if (useMockData) {
                // Không cần gửi frame nếu đang giả lập
                return;
            }

            socketService.sendVideoFrame({
                timestamp: Date.now() / 1000,
                resolution: [canvas.width, canvas.height],
                data: base64Data,
            });
        } catch (error) {
            console.error('Error capturing frame:', error);
        }
    };

    // Hàm vẽ bounding boxes từ kết quả mới nhất với animation mượt mà và dự đoán vị trí
    const renderBoundingBoxes = () => {
        if (!overlayCanvasRef.current || !videoRef.current) return;

        const canvas = overlayCanvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d', {
            alpha: true,
            desynchronized: true,
        });

        // Đảm bảo overlay canvas có kích thước phù hợp với video
        if (
            canvas.width !== video.videoWidth ||
            canvas.height !== video.videoHeight
        ) {
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
        }

        // Xóa canvas trước khi vẽ
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const now = performance.now();

        // Tính tỷ lệ thu phóng nếu kích thước video và canvas khác nhau
        const scaleX = canvas.width / (video.videoWidth || 640);
        const scaleY = canvas.height / (video.videoHeight || 480);

        // Nếu có dữ liệu để hiển thị
        if (
            currentBoxesRef.current.faces &&
            currentBoxesRef.current.faces.length > 0
        ) {
            const elapsed = now - lastUpdateTimeRef.current;
            const duration = 100; // Thời gian chuyển tiếp (ms)
            const progress = Math.min(1, elapsed / duration); // Giá trị từ 0-1

            // Kiểm tra xem đã quá lâu kể từ lần cập nhật cuối cùng hay chưa
            const isStale = elapsed > 500; // Nếu quá 500ms không có cập nhật mới

            currentBoxesRef.current.faces.forEach((face, index) => {
                let x, y, boxWidth, boxHeight;

                // Nếu có dữ liệu trước đó và cùng ID, thực hiện nội suy
                const prevFace = previousBoxesRef.current.faces?.find(
                    (pf) => pf.id === face.id
                );

                if (prevFace && progress < 1) {
                    // Nội suy tuyến tính giữa vị trí cũ và mới
                    const [prevX, prevY, prevWidth, prevHeight] = prevFace.box;
                    const [newX, newY, newWidth, newHeight] = face.box;

                    x = prevX + (newX - prevX) * progress;
                    y = prevY + (newY - prevY) * progress;
                    boxWidth = prevWidth + (newWidth - prevWidth) * progress;
                    boxHeight =
                        prevHeight + (newHeight - prevHeight) * progress;

                    // Tính toán vận tốc di chuyển của khuôn mặt nếu có đủ dữ liệu
                    if (prevFace && face.timestamp && prevFace.timestamp) {
                        const dt = face.timestamp - prevFace.timestamp;
                        if (dt > 0) {
                            // Vận tốc = khoảng cách / thời gian
                            const vx = (newX - prevX) / dt;
                            const vy = (newY - prevY) / dt;

                            // Lưu vận tốc cho mỗi khuôn mặt
                            facesVelocityRef.current[face.id] = {
                                vx,
                                vy,
                                timestamp: now,
                            };
                        }
                    }
                } else if (isStale && facesVelocityRef.current[face.id]) {
                    // Nếu không có dữ liệu mới trong thời gian dài, dự đoán vị trí dựa trên vận tốc
                    const velocity = facesVelocityRef.current[face.id];
                    const timeSinceLastUpdate =
                        (now - lastUpdateTimeRef.current) / 1000; // Đổi sang giây

                    // Giới hạn thời gian dự đoán để tránh dự đoán quá xa
                    const maxPredictionTime = 0.5; // Tối đa 0.5 giây
                    const predictionTime = Math.min(
                        timeSinceLastUpdate,
                        maxPredictionTime
                    );

                    // Dự đoán vị trí mới dựa trên vận tốc
                    [x, y, boxWidth, boxHeight] = face.box;
                    x += velocity.vx * predictionTime;
                    y += velocity.vy * predictionTime;

                    // Giới hạn vị trí trong canvas
                    x = Math.max(0, Math.min(x, canvas.width - boxWidth));
                    y = Math.max(0, Math.min(y, canvas.height - boxHeight));
                } else {
                    // Nếu không có dữ liệu trước đó hoặc đã hoàn thành nội suy
                    [x, y, boxWidth, boxHeight] = face.box;
                }

                // Áp dụng tỷ lệ thu phóng
                const scaledX = x * scaleX;
                const scaledY = y * scaleY;
                const scaledWidth = boxWidth * scaleX;
                const scaledHeight = boxHeight * scaleY;

                // Vẽ hộp với hiệu ứng mượt mà hơn
                ctx.strokeStyle = '#4caf50';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.rect(scaledX, scaledY, scaledWidth, scaledHeight);
                ctx.stroke();

                // Thêm hiệu ứng shadow nhẹ để nổi bật
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;

                // Vẽ cảm xúc chính
                if (face.emotions && face.emotions.length > 0) {
                    const mainEmotion = face.emotions[0];

                    // Nền cho text
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    ctx.fillRect(scaledX, scaledY - 25, scaledWidth, 25);

                    // Text cảm xúc
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 14px Arial';
                    ctx.textAlign = 'center';
                    ctx.shadowColor = 'transparent'; // Xóa shadow cho text
                    ctx.fillText(
                        `${mainEmotion.emotion}: ${Math.round(
                            mainEmotion.percentage || mainEmotion.score * 100
                        )}%`,
                        scaledX + scaledWidth / 2,
                        scaledY - 8
                    );
                }
            });
        }

        // Yêu cầu render liên tục để bounding box mượt mà
        if (isProcessing) {
            boundingBoxAnimationRef.current =
                window.requestAnimationFrame(renderBoundingBoxes);
        }
    };

    // Dọn dẹp tài nguyên
    const cleanupResources = () => {
        // Dừng xử lý
        stopProcessing();

        // Dừng stream video
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }

        // Đóng kết nối socket
        socketService.closeConnection();

        // Dừng animation nếu đang chạy
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }

        // Dừng animation cho bounding box nếu đang chạy
        if (boundingBoxAnimationRef.current) {
            cancelAnimationFrame(boundingBoxAnimationRef.current);
            boundingBoxAnimationRef.current = null;
        }
    };

    // Khởi tạo video và đảm bảo kích thước canvas được cập nhật
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
                if (overlayCanvasRef.current && videoRef.current) {
                    overlayCanvasRef.current.width =
                        videoRef.current.videoWidth || 640;
                    overlayCanvasRef.current.height =
                        videoRef.current.videoHeight || 480;
                }

                if (canvasRef.current && videoRef.current) {
                    canvasRef.current.width =
                        videoRef.current.videoWidth || 640;
                    canvasRef.current.height =
                        videoRef.current.videoHeight || 480;
                }
            };
        }
    }, [videoRef.current, stream]);

    // Cập nhật bounding box khi có kết quả nhận diện mới
    useEffect(() => {
        if (detectionResult && overlayCanvasRef.current && videoRef.current) {
            renderBoundingBoxes();
        }
    }, [detectionResult]);

    // Clean up khi component unmount
    useEffect(() => {
        return () => {
            cleanupResources();
            // Dừng giả lập dữ liệu nếu đang dùng
            if (mockIntervalRef.current) {
                clearInterval(mockIntervalRef.current);
                mockIntervalRef.current = null;
            }
        };
    }, []);

    // Chuyển đổi dữ liệu cảm xúc thành dạng dễ hiển thị
    const formatEmotions = (emotions) => {
        if (!emotions || emotions.length === 0) return [];

        return emotions.map((emotion) => ({
            name: emotion.emotion,
            percentage: emotion.percentage || emotion.score * 100,
        }));
    };

    // Cập nhật FPS
    const handleFpsChange = (event, newValue) => {
        setFps(newValue);
        frameIntervalRef.current = 1000 / newValue;

        // Cập nhật frame rate trong socketService nếu đang kết nối
        if (socketState.isConnected) {
            socketService.setFrameRate(newValue);
        }
    };

    return (
        <Box>
            <Paper
                variant="outlined"
                sx={{
                    p: 3,
                    borderRadius: 2,
                    boxShadow: theme.shadows[1],
                    mb: 3,
                }}
            >
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight="medium" gutterBottom>
                        Real-time emotion detection
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Use webcam to detect emotions in real-time. Ensure you
                        have granted camera access to the web page.
                    </Typography>
                </Box>

                <Collapse in={!!error}>
                    <Alert
                        severity="error"
                        action={
                            <>
                                {!useMockData && (
                                    <Button
                                        color="inherit"
                                        size="small"
                                        onClick={() => {
                                            setShowSettings(true);
                                            setUseMockData(true);
                                            setError(null);
                                        }}
                                        sx={{ mr: 1 }}
                                    >
                                        Use Demo mode
                                    </Button>
                                )}
                                <IconButton
                                    size="small"
                                    onClick={() => setError(null)}
                                >
                                    <CloseOutlined fontSize="small" />
                                </IconButton>
                            </>
                        }
                        sx={{ mb: 2 }}
                    >
                        {error}
                    </Alert>
                </Collapse>

                {/* Hiển thị loading khi đang kết nối */}
                {!socketState.isConnected && !useMockData && !error && (
                    <Alert
                        severity="info"
                        sx={{ mb: 2 }}
                        icon={<CircularProgress size={20} />}
                    >
                        Connecting to server. Please wait...
                    </Alert>
                )}

                {/* Hiển thị thông báo khi dùng chế độ demo */}
                {useMockData && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Using Demo mode. The recognition data is randomly
                        generated.
                    </Alert>
                )}

                <Box
                    sx={{
                        position: 'relative',
                        width: '100%',
                        height: 0,
                        paddingBottom: '75%', // Tỷ lệ 4:3
                        backgroundColor: '#000',
                        borderRadius: 1,
                        overflow: 'hidden',
                        mb: 2,
                        border: `2px solid ${theme.palette.divider}`,
                    }}
                >
                    {/* Video Stream */}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            zIndex: 1,
                        }}
                    />

                    {/* Canvas cho việc chụp frame (ẩn) */}
                    <canvas
                        ref={canvasRef}
                        style={{
                            display: 'none', // Ẩn canvas này vì chỉ dùng để chụp frame
                        }}
                    />

                    {/* Canvas overlay cho bounding box */}
                    <canvas
                        ref={overlayCanvasRef}
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            zIndex: 2,
                            pointerEvents: 'none', // Cho phép tương tác với video bên dưới
                        }}
                    />

                    {/* Overlay thông tin */}
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            color: 'white',
                            padding: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            zIndex: 3,
                        }}
                    >
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {detectionResult
                                ? `Face: ${detectionResult.faces?.length || 0}`
                                : isProcessing
                                  ? 'Analyzing...'
                                  : 'Not analyzed'}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            FPS: {fps}
                        </Typography>
                    </Box>
                </Box>

                {/* Cài đặt FPS */}
                <Collapse in={showSettings}>
                    <Paper
                        variant="outlined"
                        sx={{ p: 2, mb: 2, borderRadius: 1 }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 1,
                            }}
                        >
                            <SpeedOutlined sx={{ mr: 1 }} />
                            <Typography variant="body2">
                                Frame rate (FPS): {fps}
                            </Typography>
                        </Box>
                        <Slider
                            value={fps}
                            onChange={handleFpsChange}
                            aria-label="FPS"
                            min={1}
                            max={5}
                            step={1}
                            marks={[
                                { value: 1, label: '1' },
                                { value: 2, label: '2' },
                                { value: 3, label: '3' },
                                { value: 4, label: '4' },
                                { value: 5, label: '5' },
                            ]}
                            disabled={isProcessing}
                        />

                        {cameras.length > 1 && (
                            <Box sx={{ mt: 2 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="camera-select-label">
                                        Select Camera
                                    </InputLabel>
                                    <Select
                                        labelId="camera-select-label"
                                        value={selectedCamera}
                                        label="Select Camera"
                                        onChange={handleCameraChange}
                                        disabled={isProcessing}
                                        startAdornment={
                                            <CameraAlt
                                                sx={{ mr: 1, ml: -0.5 }}
                                            />
                                        }
                                    >
                                        {cameras.map((camera) => (
                                            <MenuItem
                                                key={camera.deviceId}
                                                value={camera.deviceId}
                                            >
                                                {camera.label ||
                                                    `Camera ${camera.deviceId.substring(0, 5)}...`}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        )}

                        {/* Thêm tùy chọn giả lập dữ liệu */}
                        <Box sx={{ mt: 2 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={useMockData}
                                        onChange={(e) =>
                                            setUseMockData(e.target.checked)
                                        }
                                        disabled={isProcessing}
                                        color="warning"
                                    />
                                }
                                label={
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <BugReport
                                            sx={{
                                                mr: 0.5,
                                                fontSize: 20,
                                                color: 'warning.main',
                                            }}
                                        />
                                        <Typography variant="body2">
                                            Demo mode (no server required)
                                        </Typography>
                                    </Box>
                                }
                            />
                            {useMockData && (
                                <Typography
                                    variant="caption"
                                    color="warning.main"
                                    sx={{ mt: 1, display: 'block' }}
                                >
                                    This mode simulates data recognition when
                                    there is no server.
                                </Typography>
                            )}
                        </Box>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            fontSize="0.8rem"
                        >
                            Note: The frame rate is limited from 1-5 FPS to
                            ensure the best performance.
                        </Typography>
                    </Paper>
                </Collapse>

                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Chip
                        label={
                            socketState.isConnected
                                ? 'Connected'
                                : 'Not connected'
                        }
                        color={socketState.isConnected ? 'success' : 'error'}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                    />
                    <Chip
                        label={`Frames: ${frameCounter}`}
                        color="primary"
                        size="small"
                    />
                    {isProcessing && (
                        <Chip
                            label="Analyzing"
                            color="warning"
                            size="small"
                            icon={
                                <CircularProgress size={16} color="inherit" />
                            }
                        />
                    )}
                </Stack>

                <Box
                    sx={{
                        display: 'flex',
                        gap: 2,
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'flex-end',
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={() => setShowSettings(!showSettings)}
                        startIcon={<Settings />}
                    >
                        {showSettings ? 'Hide settings' : 'Settings'}
                    </Button>

                    {cameras.length > 1 && !showSettings && (
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={getCameras}
                            startIcon={<SwitchCamera />}
                            disabled={isProcessing}
                        >
                            Change Camera
                        </Button>
                    )}

                    {!socketState.isConnected && !useMockData && (
                        <Button
                            variant="outlined"
                            color="warning"
                            onClick={reconnectSocket}
                            startIcon={<MeetingRoom />}
                        >
                            Reconnect Server
                        </Button>
                    )}

                    <Button
                        variant="outlined"
                        onClick={initializeCamera}
                        startIcon={<MeetingRoom />}
                        disabled={isProcessing}
                    >
                        {stream ? 'Refresh Camera' : 'Connect Camera'}
                    </Button>

                    {!isProcessing ? (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={startProcessing}
                            startIcon={<PlayArrow />}
                            disabled={
                                (!socketState.isConnected && !useMockData) ||
                                !stream
                            }
                        >
                            Start recognition
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="error"
                            onClick={stopProcessing}
                            startIcon={<Stop />}
                        >
                            Stop recognition
                        </Button>
                    )}
                </Box>
            </Paper>

            {/* Hiển thị chi tiết kết quả */}
            {detectionResult &&
                detectionResult.faces &&
                detectionResult.faces.length > 0 && (
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            boxShadow: theme.shadows[1],
                        }}
                    >
                        <Typography
                            variant="h6"
                            fontWeight="medium"
                            gutterBottom
                            sx={{ display: 'flex', alignItems: 'center' }}
                        >
                            <Box
                                component="span"
                                sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    backgroundColor: 'success.main',
                                    display: 'inline-block',
                                    mr: 1,
                                }}
                            />
                            Real-time recognition result
                        </Typography>

                        <Stack spacing={2}>
                            {detectionResult.faces.map((face, index) => {
                                // Tìm cảm xúc chính
                                const mainEmotion = formatEmotions(
                                    face.emotions
                                )[0];
                                return (
                                    <Box
                                        key={face.tracking_id || index}
                                        sx={{
                                            p: 2,
                                            border: `1px solid ${theme.palette.divider}`,
                                            borderRadius: 1,
                                            background:
                                                theme.palette.background
                                                    .default,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                mb: 1,
                                            }}
                                        >
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight="bold"
                                            >
                                                Face #{index + 1}
                                            </Typography>
                                            <Chip
                                                label={`${mainEmotion?.name || 'unknown'}: ${Math.round(mainEmotion?.percentage || 0)}%`}
                                                color="primary"
                                                size="small"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </Box>

                                        <Box sx={{ mb: 1 }}>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mb: 0.5 }}
                                            >
                                                Emotion analysis:
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: 1,
                                                }}
                                            >
                                                {formatEmotions(
                                                    face.emotions
                                                ).map((emotion) => (
                                                    <Chip
                                                        key={emotion.name}
                                                        label={`${emotion.name}: ${Math.round(emotion.percentage)}%`}
                                                        color={
                                                            emotion.percentage >
                                                            50
                                                                ? 'primary'
                                                                : 'default'
                                                        }
                                                        size="small"
                                                        variant={
                                                            emotion.percentage >
                                                            50
                                                                ? 'filled'
                                                                : 'outlined'
                                                        }
                                                        sx={{
                                                            fontWeight:
                                                                emotion.percentage >
                                                                50
                                                                    ? 'bold'
                                                                    : 'normal',
                                                            opacity: Math.max(
                                                                0.5,
                                                                emotion.percentage /
                                                                    100
                                                            ),
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Stack>
                    </Paper>
                )}
        </Box>
    );
};

export default RealtimeEmotionDetector;
