import React, { useState, useEffect, useRef } from 'react';
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
    Grid,
    Avatar,
    LinearProgress,
    ButtonGroup,
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
    Mood,
    KeyboardArrowDown,
    ViewWeekOutlined,
    VideocamOutlined,
    ExpandMoreOutlined,
    FiberManualRecord,
} from '@mui/icons-material';
import socketService from '../services/socketService';
import ToastService from '../toasts/ToastService';
import { alpha } from '@mui/material/styles';

// Thêm ánh xạ màu sắc cho các loại cảm xúc
const emotionColors = {
    happy: '#4caf50', // xanh lá
    sad: '#5c6bc0', // tím nhạt
    angry: '#f44336', // đỏ
    surprise: '#ff9800', // cam
    fear: '#9c27b0', // tím đậm
    disgust: '#795548', // nâu
    neutral: '#607d8b', // xám xanh
    contempt: '#795548', // nâu
};

// Lấy màu tương ứng với loại cảm xúc
const getEmotionColor = (emotionName) => {
    return emotionColors[emotionName.toLowerCase()] || '#607d8b';
};

// Chuyển đổi dữ liệu cảm xúc thành dạng dễ hiển thị
const formatEmotions = (emotions) => {
    if (!emotions || emotions.length === 0) return [];

    return emotions.map((emotion) => ({
        name: emotion.emotion,
        percentage: emotion.percentage || emotion.score * 100,
    }));
};

// React memo để tránh render không cần thiết cho các thành phần con
const EmotionProgressBar = React.memo(({ emotion, percentage, color }) => {
    const theme = useTheme();

    return (
        <Box sx={{ mb: 1 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 0.5,
                    alignItems: 'center',
                }}
            >
                <Typography
                    variant="caption"
                    fontWeight="medium"
                    sx={{ textTransform: 'capitalize' }}
                >
                    {emotion}
                </Typography>
                <Typography variant="caption" fontWeight="bold">
                    {Math.round(percentage)}%
                </Typography>
            </Box>
            <Box
                sx={{
                    position: 'relative',
                    height: 6,
                    borderRadius: 3,
                    overflow: 'hidden',
                    bgcolor: alpha(color, 0.1),
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: `${percentage}%`,
                        background: `linear-gradient(90deg, ${alpha(
                            color,
                            0.7
                        )} 0%, ${color} 100%)`,
                        borderRadius: 3,
                    }}
                />
            </Box>
        </Box>
    );
});

// Thành phần hiển thị một khuôn mặt được phát hiện
const FaceCard = React.memo(({ face, index, formatEmotions }) => {
    const theme = useTheme();
    const emotions = formatEmotions(face.emotions);
    const mainEmotion = emotions[0] || {};
    const mainEmotionColor = getEmotionColor(mainEmotion.name || 'neutral');
    const [expanded, setExpanded] = useState(false);

    return (
        <Box
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                border: `1px solid ${alpha(mainEmotionColor, 0.3)}`,
                transition: 'all 0.2s ease',
                mb: 2,
                '&:hover': {
                    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    background: alpha(mainEmotionColor, 0.05),
                    borderBottom: expanded
                        ? `1px solid ${alpha(mainEmotionColor, 0.2)}`
                        : 'none',
                    cursor: 'pointer',
                }}
                onClick={() => setExpanded(!expanded)}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        sx={{
                            width: 32,
                            height: 32,
                            mr: 1.5,
                            bgcolor: mainEmotionColor,
                            fontSize: 14,
                            fontWeight: 'bold',
                        }}
                    >
                        {index + 1}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                            {mainEmotion.name || 'Unknown'}
                        </Typography>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block' }}
                        >
                            Face #{index + 1}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                            color: mainEmotionColor,
                            mr: 1,
                        }}
                    >
                        {Math.round(mainEmotion.percentage || 0)}%
                    </Typography>
                    <IconButton
                        size="small"
                        sx={{
                            transition: 'transform 0.3s',
                            transform: expanded ? 'rotate(180deg)' : 'none',
                        }}
                    >
                        <KeyboardArrowDown fontSize="small" />
                    </IconButton>
                </Box>
            </Box>

            <Collapse in={expanded}>
                <Box sx={{ p: 1.5 }}>
                    {emotions.map((emotion) => (
                        <EmotionProgressBar
                            key={emotion.name}
                            emotion={emotion.name}
                            percentage={emotion.percentage}
                            color={getEmotionColor(emotion.name)}
                        />
                    ))}
                </Box>
            </Collapse>
        </Box>
    );
});

const RealtimeEmotionDetector = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const overlayCanvasRef = useRef(null);
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
    const boundingBoxAnimationRef = useRef(null);
    const lastFrameTimeRef = useRef(0);
    const frameIntervalRef = useRef(200);
    const [fps, setFps] = useState(3);
    const [showSettings, setShowSettings] = useState(false);
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState('');
    const [layout, setLayout] = useState('split');
    const [serverStatus, setServerStatus] = useState({});
    const [visibleFacesCount, setVisibleFacesCount] = useState(3);

    // Thêm refs cho animation và tracking
    const previousBoxesRef = useRef({});
    const currentBoxesRef = useRef({});
    const lastUpdateTimeRef = useRef(0);

    // Thêm hàm handleLoadMoreFaces
    const handleLoadMoreFaces = () => {
        setVisibleFacesCount((prev) => prev + 3);
    };

    // Cập nhật hàm handleStatusUpdate
    const handleStatusUpdate = (data) => {
        setServerStatus(data);
    };

    // Cập nhật hàm handleDetectionResult
    const handleDetectionResult = (data) => {
        setDetectionResult(data);

        const now = performance.now();

        // Cập nhật vị trí boxes
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

    // Thêm ref để theo dõi trạng thái camera
    const cameraInitializingRef = useRef(false);

    // Thêm lại hàm startProcessing và stopProcessing
    const startProcessing = async () => {
        try {
            if (!socketState.isConnected) {
                await socketService.initializeSocket();
                updateSocketState();
            }

            if (!stream) {
                await initializeCamera();
                // Đợi camera khởi động
                await new Promise((resolve) => setTimeout(resolve, 500));
            }

            // Khởi tạo session với server
            if (socketState.isConnected) {
                socketService.initializeSession({
                    video_source: 'webcam',
                    detection_interval: Math.round(1000 / fps),
                    min_face_size: 64,
                });

                // Đợi server phản hồi
                await new Promise((resolve) => setTimeout(resolve, 500));
                updateSocketState();
            }

            // Bắt đầu xử lý
            socketService.sendControl('start', { skipFrameProcessing: true });
            setIsProcessing(true);
            setFrameCounter(0);
            setError(null);

            // Bắt đầu vòng lặp render bounding box
            window.requestAnimationFrame(renderBoundingBoxes);

            // Bắt đầu gửi frames
            socketService.startFrameProcessing(captureAndSendFrame);
        } catch (error) {
            console.error('Error starting processing:', error);
            setError('Failed to start processing. Please try again.');
        }
    };

    const stopProcessing = () => {
        try {
            if (socketState.isConnected) {
                socketService.sendControl('stop');
            }

            setIsProcessing(false);

            // Dừng các animation
            if (animationRef.current) {
                window.cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }

            if (boundingBoxAnimationRef.current) {
                window.cancelAnimationFrame(boundingBoxAnimationRef.current);
                boundingBoxAnimationRef.current = null;
            }
        } catch (error) {
            console.error('Error stopping processing:', error);
        }
    };

    // Thêm lại hàm captureAndSendFrame
    const captureAndSendFrame = () => {
        if (!canvasRef.current || !videoRef.current) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');

        // Đảm bảo canvas có kích thước phù hợp
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        try {
            // Vẽ frame từ video lên canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Chuyển canvas thành base64
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            const base64Data = dataUrl.split(',')[1];

            // Tăng bộ đếm frame
            setFrameCounter((prev) => prev + 1);

            // Gửi frame đến server
            socketService.sendVideoFrame({
                timestamp: Date.now() / 1000,
                resolution: [canvas.width, canvas.height],
                data: base64Data,
            });
        } catch (error) {
            console.error('Error capturing frame:', error);
        }
    };

    // Thêm lại hàm renderBoundingBoxes
    const renderBoundingBoxes = () => {
        if (!overlayCanvasRef.current || !videoRef.current || !detectionResult)
            return;

        const canvas = overlayCanvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');

        // Cập nhật kích thước canvas
        if (
            canvas.width !== video.videoWidth ||
            canvas.height !== video.videoHeight
        ) {
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
        }

        // Xóa canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Vẽ bounding boxes
        if (detectionResult.faces && detectionResult.faces.length > 0) {
            detectionResult.faces.forEach((face) => {
                const [x, y, width, height] = face.box;

                // Vẽ box
                ctx.strokeStyle = '#4caf50';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, width, height);

                // Vẽ nhãn cảm xúc
                if (face.emotions && face.emotions.length > 0) {
                    const mainEmotion = face.emotions[0];
                    const text = `${mainEmotion.emotion}: ${Math.round(
                        mainEmotion.percentage || mainEmotion.score * 100
                    )}%`;

                    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    ctx.fillRect(x, y - 25, width, 25);

                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 14px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(text, x + width / 2, y - 8);
                }
            });
        }

        // Tiếp tục vòng lặp nếu đang xử lý
        if (isProcessing) {
            boundingBoxAnimationRef.current =
                requestAnimationFrame(renderBoundingBoxes);
        }
    };

    // Khởi tạo kết nối camera với xử lý chống nháy
    const initializeCamera = async () => {
        if (cameraInitializingRef.current) return; // Ngăn việc khởi tạo trùng lặp

        try {
            cameraInitializingRef.current = true;

            if (stream) {
                const tracks = stream.getTracks();
                tracks.forEach((track) => track.stop());
            }

            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { max: 30 },
                    deviceId: selectedCamera
                        ? { exact: selectedCamera }
                        : undefined,
                },
            };

            const newStream = await navigator.mediaDevices.getUserMedia(
                constraints
            );

            // Đợi một chút để camera ổn định
            await new Promise((resolve) => setTimeout(resolve, 100));

            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
                setStream(newStream);
                setError(null);
            }
        } catch (err) {
            setError(
                'Cannot access camera. Please ensure you have granted camera access.'
            );
        } finally {
            cameraInitializingRef.current = false;
        }
    };

    // Xử lý thay đổi layout
    const handleLayoutChange = (newLayout) => {
        setLayout(newLayout);
    };

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

    // Hàm cập nhật trạng thái socket
    const updateSocketState = () => {
        const state = socketService.getSocketState();
        setSocketState(state);
    };

    // Xử lý sự kiện socket được khởi tạo
    const handleInitialized = (data) => {
        // Cập nhật state
        updateSocketState();
    };

    // Xử lý phản hồi từ server về FPS
    const handleErrorMessage = (data) => {
        // Nếu server khuyến nghị giảm FPS
        if (data.code === 429 && data.recommended_value) {
            // Giới hạn FPS trong khoảng 1-5
            const recommendedFps = Math.min(
                Math.max(Math.round(data.recommended_value), 1),
                5
            );
            setFps(recommendedFps);
        }
    };

    // Kết nối lại Socket.IO
    const reconnectSocket = async () => {
        try {
            await socketService.initializeSocket();
            // Cập nhật trạng thái
            updateSocketState();
            return true;
        } catch (error) {
            setError('Failed to connect to server. Please try again.');
            return false;
        }
    };

    // Lấy danh sách camera
    const getCameras = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(
                (device) => device.kind === 'videoinput'
            );
            setCameras(videoDevices);

            if (videoDevices.length > 0 && !selectedCamera) {
                // Nếu chưa chọn camera nào, chọn camera đầu tiên
                setSelectedCamera(videoDevices[0].deviceId);
            }
        } catch (error) {
            setError('Error getting camera list. Please refresh the page.');
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
        };
    }, []);

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
        <Box
            sx={{
                width: '100%',
                maxWidth: '100%',
                height: 'calc(100vh - 48px)',
                minHeight: '600px',
                maxHeight: '800px',
                overflow: 'hidden',
                position: 'relative',
                bgcolor: theme.palette.background.default,
                mx: 'auto',
            }}
        >
            <Paper
                variant="outlined"
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                {/* Main content container */}
                <Box
                    sx={{
                        display: 'flex',
                        flexGrow: 1,
                        overflow: 'hidden',
                        position: 'relative',
                        gap: 2,
                        p: 2,
                    }}
                >
                    {/* Camera Container */}
                    <Box
                        className="camera-container"
                        sx={{
                            flexGrow: 1,
                            width: layout === 'split' ? '70%' : '100%',
                            transition: 'all 0.3s ease-in-out',
                            position: 'relative',
                            borderRadius: 2,
                            overflow: 'hidden',
                            bgcolor: 'black',
                            height: '100%',
                            '&:hover': {
                                '& > .MuiBox-root': {
                                    opacity: 1,
                                },
                            },
                        }}
                    >
                        {/* Video Stream Container */}
                        <Box
                            sx={{
                                position: 'relative',
                                width: '100%',
                                height: '100%',
                                minHeight: '400px',
                                maxHeight: '600px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />

                            {/* Canvas cho việc chụp frame (ẩn) */}
                            <canvas
                                ref={canvasRef}
                                style={{ display: 'none' }}
                            />

                            {/* Canvas overlay cho bounding box */}
                            <canvas
                                ref={overlayCanvasRef}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />

                            {/* Camera Controls */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 16,
                                    right: 16,
                                    zIndex: 10,
                                    display: 'flex',
                                    gap: 1,
                                    opacity: 0,
                                    transition: 'opacity 0.3s ease-in-out',
                                    '.camera-container:hover &': {
                                        opacity: 1,
                                    },
                                }}
                            >
                                <ButtonGroup
                                    size="small"
                                    sx={{
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                        borderRadius: 1,
                                        '& .MuiButton-root': {
                                            color: 'white',
                                            borderColor:
                                                'rgba(255,255,255,0.2)',
                                            '&:hover': {
                                                backgroundColor:
                                                    'rgba(255,255,255,0.1)',
                                            },
                                        },
                                    }}
                                >
                                    <Tooltip title="Split View">
                                        <Button
                                            variant={
                                                layout === 'split'
                                                    ? 'contained'
                                                    : 'outlined'
                                            }
                                            onClick={() =>
                                                handleLayoutChange('split')
                                            }
                                        >
                                            <ViewWeekOutlined fontSize="small" />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="Camera Only">
                                        <Button
                                            variant={
                                                layout === 'camera'
                                                    ? 'contained'
                                                    : 'outlined'
                                            }
                                            onClick={() =>
                                                handleLayoutChange('camera')
                                            }
                                        >
                                            <VideocamOutlined fontSize="small" />
                                        </Button>
                                    </Tooltip>
                                </ButtonGroup>
                            </Box>

                            {/* Overlay khi chưa có camera */}
                            {!stream && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'rgba(0,0,0,0.7)',
                                        zIndex: 4,
                                    }}
                                >
                                    <CameraAlt
                                        sx={{
                                            fontSize: 60,
                                            mb: 2,
                                            color: 'white',
                                            opacity: 0.7,
                                        }}
                                    />
                                    <Typography
                                        variant="h6"
                                        color="white"
                                        textAlign="center"
                                        gutterBottom
                                    >
                                        Camera Not Connected
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="white"
                                        textAlign="center"
                                        sx={{ opacity: 0.7, mb: 3 }}
                                    >
                                        Click the "Connect Camera" button below
                                        to start
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={initializeCamera}
                                        sx={{
                                            borderColor: 'white',
                                            color: 'white',
                                        }}
                                    >
                                        Connect Camera
                                    </Button>
                                </Box>
                            )}

                            {/* Status Bar */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background:
                                        'linear-gradient(transparent, rgba(0,0,0,0.8))',
                                    color: 'white',
                                    padding: 2,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    zIndex: 3,
                                    opacity: 0,
                                    transition: 'opacity 0.3s ease-in-out',
                                    '.camera-container:hover &': {
                                        opacity: 1,
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    {isProcessing ? (
                                        <CircularProgress
                                            size={16}
                                            color="inherit"
                                            sx={{ mr: 1 }}
                                        />
                                    ) : (
                                        <FiberManualRecord
                                            sx={{
                                                fontSize: 12,
                                                mr: 1,
                                                color: stream
                                                    ? 'success.main'
                                                    : 'error.main',
                                            }}
                                        />
                                    )}
                                    <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 'bold' }}
                                    >
                                        {detectionResult
                                            ? `Faces Detected: ${
                                                  detectionResult.faces
                                                      ?.length || 0
                                              }`
                                            : isProcessing
                                            ? 'Analyzing...'
                                            : stream
                                            ? 'Camera Ready'
                                            : 'No Camera'}
                                    </Typography>
                                </Box>

                                <Stack direction="row" spacing={1}>
                                    {socketState.isConnected && (
                                        <Chip
                                            label="Connected"
                                            size="small"
                                            color="success"
                                            variant="outlined"
                                            sx={{
                                                fontWeight: 'bold',
                                                bgcolor: 'rgba(0,0,0,0.5)',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                height: 24,
                                            }}
                                        />
                                    )}
                                </Stack>
                            </Box>
                        </Box>

                        {/* Control buttons */}
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 80,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                gap: 2,
                                zIndex: 10,
                                opacity: 0,
                                transition: 'opacity 0.3s ease-in-out',
                                '.camera-container:hover &': {
                                    opacity: 1,
                                },
                            }}
                        >
                            {!isProcessing ? (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={startProcessing}
                                    startIcon={<PlayArrow />}
                                    disabled={
                                        !socketState.isConnected || !stream
                                    }
                                    sx={{
                                        px: 3,
                                        background:
                                            'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                        boxShadow:
                                            '0 3px 5px 2px rgba(33, 203, 243, .3)',
                                    }}
                                >
                                    Start Recognition
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={stopProcessing}
                                    startIcon={<Stop />}
                                    sx={{
                                        px: 3,
                                        background:
                                            'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                                        boxShadow:
                                            '0 3px 5px 2px rgba(255, 105, 135, .3)',
                                    }}
                                >
                                    Stop Recognition
                                </Button>
                            )}

                            {/* Camera Switch Button */}
                            {stream && cameras.length > 1 && (
                                <Tooltip title="Change Camera">
                                    <IconButton
                                        onClick={getCameras}
                                        disabled={isProcessing}
                                        sx={{
                                            bgcolor: 'rgba(0,0,0,0.5)',
                                            color: 'white',
                                            '&:hover': {
                                                bgcolor: 'rgba(0,0,0,0.7)',
                                            },
                                        }}
                                    >
                                        <SwitchCamera />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    </Box>

                    {/* Results Panel */}
                    <Box
                        sx={{
                            width: layout === 'split' ? '30%' : '0%',
                            opacity: layout === 'split' ? 1 : 0,
                            visibility:
                                layout === 'split' ? 'visible' : 'hidden',
                            transition: 'all 0.3s ease-in-out',
                            overflow: 'hidden',
                            bgcolor: theme.palette.background.paper,
                            borderRadius: 2,
                            border: `1px solid ${theme.palette.divider}`,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Box
                            sx={{
                                p: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderBottom: `1px solid ${theme.palette.divider}`,
                            }}
                        >
                            <Typography
                                variant="subtitle1"
                                fontWeight="medium"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <Box
                                    component="span"
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: isProcessing
                                            ? 'success.main'
                                            : 'text.disabled',
                                        display: 'inline-block',
                                        mr: 1,
                                        transition: 'all 0.3s ease',
                                    }}
                                />
                                Analysis Results
                            </Typography>

                            <Chip
                                label={`Frames: ${frameCounter}`}
                                size="small"
                                color="primary"
                                sx={{ height: 24 }}
                            />
                        </Box>

                        <Box
                            sx={{
                                flexGrow: 1,
                                overflowY: 'auto',
                                p: 2,
                            }}
                        >
                            {detectionResult &&
                            detectionResult.faces &&
                            detectionResult.faces.length > 0 ? (
                                <>
                                    {detectionResult.faces
                                        .slice(0, visibleFacesCount)
                                        .map((face, index) => (
                                            <FaceCard
                                                key={
                                                    face.tracking_id ||
                                                    `face-${index}`
                                                }
                                                face={face}
                                                index={index}
                                                formatEmotions={formatEmotions}
                                            />
                                        ))}

                                    {detectionResult.faces.length >
                                        visibleFacesCount && (
                                        <Button
                                            variant="text"
                                            color="primary"
                                            fullWidth
                                            onClick={handleLoadMoreFaces}
                                            startIcon={<ExpandMoreOutlined />}
                                        >
                                            Show{' '}
                                            {Math.min(
                                                3,
                                                detectionResult.faces.length -
                                                    visibleFacesCount
                                            )}{' '}
                                            more faces
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                        color: 'text.secondary',
                                        p: 3,
                                    }}
                                >
                                    {isProcessing ? (
                                        <>
                                            <CircularProgress
                                                size={40}
                                                sx={{ mb: 2 }}
                                                thickness={4}
                                            />
                                            <Typography
                                                variant="body1"
                                                textAlign="center"
                                                gutterBottom
                                            >
                                                Scanning for faces...
                                            </Typography>
                                        </>
                                    ) : (
                                        <>
                                            <Mood
                                                sx={{
                                                    fontSize: 60,
                                                    mb: 2,
                                                    opacity: 0.6,
                                                    color: theme.palette.primary
                                                        .main,
                                                }}
                                            />
                                            <Typography
                                                variant="body1"
                                                textAlign="center"
                                                gutterBottom
                                            >
                                                No emotion data
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                textAlign="center"
                                            >
                                                Start recognition to see results
                                            </Typography>
                                        </>
                                    )}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default RealtimeEmotionDetector;
