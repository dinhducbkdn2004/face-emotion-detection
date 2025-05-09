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
    const canvasRef = useRef(null);
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
    const lastFrameTimeRef = useRef(0);
    const frameIntervalRef = useRef(100); // 10 FPS mặc định
    const [fps, setFps] = useState(10);
    const [showSettings, setShowSettings] = useState(false);
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState('');
    const [useMockData, setUseMockData] = useState(false);
    const mockIntervalRef = useRef(null);

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
        setDetectionResult(data);
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
                ToastService.success('Đã kết nối lại thành công');
            }
        } catch (error) {
            console.error('Lỗi khi kết nối lại:', error);
            setError('Không thể kết nối lại. Vui lòng thử lại sau.');
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
            console.error('Lỗi khi lấy danh sách camera:', error);
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
            console.error('Lỗi khi truy cập camera:', err);
            setError(
                'Không thể truy cập camera. Vui lòng đảm bảo bạn đã cấp quyền truy cập camera.'
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
                console.log('Sử dụng dữ liệu giả lập, bỏ qua kết nối socket');

                if (!stream) {
                    console.log('Khởi tạo camera cho chế độ giả lập...');
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

                return;
            }

            // Tiếp tục với xử lý thông thường
            if (!socketState.isConnected) {
                console.log('Socket chưa kết nối, đang thử kết nối...');
                await socketService.initializeSocket();
                updateSocketState();
            }

            if (!stream) {
                console.log('Chưa có video stream, đang khởi tạo camera...');
                await initializeCamera();

                // Đợi một chút để camera khởi động hoàn toàn
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            // Gửi lại trạng thái kết nối
            updateSocketState();
            console.log(
                'Trạng thái kết nối hiện tại:',
                socketService.getSocketState()
            );

            // Khởi tạo session với server
            if (socketState.isConnected) {
                console.log('Đang khởi tạo session trên server...');
                socketService.initializeSession({
                    video_source: 'webcam',
                    detection_interval: 5,
                    min_face_size: 64,
                });

                // Đợi server phản hồi initialized (khoảng 1s)
                console.log('Đang đợi server xác nhận khởi tạo...');
                await new Promise((resolve) => setTimeout(resolve, 1000));
                updateSocketState();
            } else {
                setError(
                    'Không thể kết nối đến máy chủ. Vui lòng thử lại hoặc sử dụng chế độ demo.'
                );
                return;
            }

            // Gửi lệnh bắt đầu xử lý
            console.log('Gửi lệnh start đến server...');
            socketService.sendControl('start');

            // Bắt đầu gửi frames
            console.log('Bắt đầu gửi video frames...');
            setIsProcessing(true);
            setFrameCounter(0);
            startSendingFrames();

            // Tạo một timeout để đảm bảo có kết quả
            setTimeout(() => {
                if (isProcessing && !detectionResult) {
                    console.log(
                        'Không nhận được kết quả sau 5s, kiểm tra lại...'
                    );

                    // Kiểm tra server đã phản hồi chưa
                    socketService.sendControl('status', {
                        check: true,
                        timestamp: Date.now() / 1000,
                    });
                }
            }, 5000);
        } catch (error) {
            console.error('Lỗi khi bắt đầu xử lý:', error);
            setError(`Lỗi khi bắt đầu: ${error.message}`);
        }
    };

    // Dừng xử lý
    const stopProcessing = () => {
        try {
            console.log('Dừng xử lý...');

            // Dừng giả lập dữ liệu nếu đang dùng
            if (useMockData && mockIntervalRef.current) {
                clearInterval(mockIntervalRef.current);
                mockIntervalRef.current = null;
            }

            // Tiếp tục xử lý thông thường
            if (socketState.isConnected) {
                console.log('Gửi lệnh stop đến server');
                socketService.sendControl('stop');
            }

            setIsProcessing(false);

            // Dừng vòng lặp animation
            if (animationRef.current) {
                console.log('Dừng animation frame');
                window.cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        } catch (error) {
            console.error('Lỗi khi dừng xử lý:', error);
        }
    };

    // Bắt đầu gửi frames
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

    // Chụp và gửi frame
    const captureAndSendFrame = () => {
        if (!canvasRef.current || !videoRef.current) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');

        // Đảm bảo canvas có kích thước phù hợp
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        // Vẽ frame từ video lên canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Chuyển canvas thành base64 (JPEG)
        try {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            const base64Data = dataUrl.split(',')[1];

            // Tăng bộ đếm frame
            const currentFrame = frameCounter + 1;
            setFrameCounter(currentFrame);

            // Gửi frame đến server
            socketService.sendVideoFrame({
                frame_id: currentFrame,
                timestamp: Date.now() / 1000,
                resolution: [canvas.width, canvas.height],
                data: base64Data,
            });
        } catch (error) {
            console.error('Lỗi khi chụp frame:', error);
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
    };

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
    };

    // Vẽ hộp nhận diện khuôn mặt lên video
    useEffect(() => {
        // Nếu không có video hoặc canvas, thoát
        if (!canvasRef.current || !videoRef.current) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');

        // Đảm bảo canvas có kích thước phù hợp với video
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        // Clear canvas trước khi vẽ
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Vẽ frame video lên canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Nếu có kết quả nhận diện, vẽ thêm hộp và thông tin
        if (detectionResult && detectionResult.faces) {
            detectionResult.faces.forEach((face) => {
                const [x, y, width, height] = face.box;

                // Vẽ hộp
                ctx.strokeStyle = '#4caf50';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, width, height);

                // Vẽ cảm xúc chính
                if (face.emotions && face.emotions.length > 0) {
                    const mainEmotion = face.emotions[0];

                    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    ctx.fillRect(x, y - 25, width, 25);

                    ctx.fillStyle = '#ffffff';
                    ctx.font = '14px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(
                        `${mainEmotion.emotion}: ${Math.round(mainEmotion.percentage || mainEmotion.score * 100)}%`,
                        x + width / 2,
                        y - 8
                    );
                }
            });
        }
    }, [
        detectionResult,
        videoRef.current?.videoWidth,
        videoRef.current?.videoHeight,
    ]);

    // Render canvas mỗi khi video có frame mới (ngay cả khi không có kết quả nhận diện)
    useEffect(() => {
        if (!canvasRef.current || !videoRef.current) return;

        const renderVideo = () => {
            if (!isProcessing) return;

            const canvas = canvasRef.current;
            const video = videoRef.current;
            if (canvas && video && video.readyState >= 2) {
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            }

            animationRef.current = requestAnimationFrame(renderVideo);
        };

        if (isProcessing) {
            animationRef.current = requestAnimationFrame(renderVideo);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isProcessing]);

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
                        Nhận diện cảm xúc Realtime
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Sử dụng webcam để nhận diện cảm xúc theo thời gian thực.
                        Hãy đảm bảo bạn đã cấp quyền truy cập camera cho trang
                        web.
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
                                        Dùng chế độ Demo
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
                        Đang kết nối đến máy chủ. Vui lòng đợi...
                    </Alert>
                )}

                {/* Hiển thị thông báo khi dùng chế độ demo */}
                {useMockData && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Đang sử dụng chế độ Demo. Dữ liệu nhận diện được tạo
                        ngẫu nhiên.
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
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        onLoadedMetadata={() => {
                            if (canvasRef.current && videoRef.current) {
                                canvasRef.current.width =
                                    videoRef.current.videoWidth || 640;
                                canvasRef.current.height =
                                    videoRef.current.videoHeight || 480;
                            }
                        }}
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            zIndex: 1,
                        }}
                    />
                    <canvas
                        ref={canvasRef}
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            zIndex: 2,
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
                                ? `Khuôn mặt: ${detectionResult.faces?.length || 0}`
                                : isProcessing
                                  ? 'Đang phân tích...'
                                  : 'Chưa phân tích'}
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
                                Tốc độ khung hình (FPS): {fps}
                            </Typography>
                        </Box>
                        <Slider
                            value={fps}
                            onChange={handleFpsChange}
                            aria-label="FPS"
                            min={1}
                            max={30}
                            step={1}
                            marks={[
                                { value: 1, label: '1' },
                                { value: 10, label: '10' },
                                { value: 20, label: '20' },
                                { value: 30, label: '30' },
                            ]}
                            disabled={isProcessing}
                        />

                        {cameras.length > 1 && (
                            <Box sx={{ mt: 2 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="camera-select-label">
                                        Chọn Camera
                                    </InputLabel>
                                    <Select
                                        labelId="camera-select-label"
                                        value={selectedCamera}
                                        label="Chọn Camera"
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
                                            Chế độ demo (không cần server)
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
                                    Chế độ này giả lập dữ liệu nhận diện khi
                                    không có server.
                                </Typography>
                            )}
                        </Box>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            fontSize="0.8rem"
                        >
                            Lưu ý: Tốc độ càng cao càng tiêu tốn nhiều tài
                            nguyên máy chủ và mạng. Server có thể yêu cầu giảm
                            FPS nếu quá tải.
                        </Typography>
                    </Paper>
                </Collapse>

                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Chip
                        label={
                            socketState.isConnected
                                ? 'Đã kết nối'
                                : 'Chưa kết nối'
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
                            label="Đang nhận diện"
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
                        {showSettings ? 'Ẩn cài đặt' : 'Cài đặt'}
                    </Button>

                    {cameras.length > 1 && !showSettings && (
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={getCameras}
                            startIcon={<SwitchCamera />}
                            disabled={isProcessing}
                        >
                            Đổi Camera
                        </Button>
                    )}

                    {!socketState.isConnected && !useMockData && (
                        <Button
                            variant="outlined"
                            color="warning"
                            onClick={reconnectSocket}
                            startIcon={<MeetingRoom />}
                        >
                            Kết nối lại Server
                        </Button>
                    )}

                    <Button
                        variant="outlined"
                        onClick={initializeCamera}
                        startIcon={<MeetingRoom />}
                        disabled={isProcessing}
                    >
                        {stream ? 'Làm mới Camera' : 'Kết nối Camera'}
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
                            Bắt đầu nhận diện
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="error"
                            onClick={stopProcessing}
                            startIcon={<Stop />}
                        >
                            Dừng nhận diện
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
                            Kết quả nhận diện realtime
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
                                                Khuôn mặt #{index + 1}
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
                                                Phân tích cảm xúc:
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
