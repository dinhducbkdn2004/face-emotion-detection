import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Paper,
    Typography,
    CircularProgress,
    useTheme,
    useMediaQuery,
    Stack,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    CloudUpload,
    VisibilityOutlined,
    PhotoCamera,
    Close,
    Refresh,
    CheckCircle,
} from '@mui/icons-material';
import useApi from '../hooks/useApi';
import { detectEmotion } from '../services/emotionService';
import FileUploader from './ui/FileUploader';
import EmotionResults from './emotion/EmotionResults';

const EmotionDetector = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [openCamera, setOpenCamera] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState('');
    const [capturedImage, setCapturedImage] = useState(null);
    const [isCapturing, setIsCapturing] = useState(true);

    const [detect, result, loading, error, resetApiState] = useApi(
        detectEmotion,
        {
            showSuccessToast: true,
            successMessage: 'Emotion analysis completed successfully!',
        }
    );

    // Xử lý khi người dùng chọn file
    const handleFileChange = (file) => {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    // Xóa file đã chọn
    const handleClearFile = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        // Xóa kết quả khi xóa file
        resetApiState();
    };

    // Gửi ảnh để phân tích
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFile) return;

        try {
            await detect(selectedFile);
        } catch (error) {
            console.error('Error detecting emotion:', error);
        }
    };

    // Đảm bảo kết quả được xóa khi component unmount
    useEffect(() => {
        return () => {
            // Clean up
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            if (capturedImage) {
                URL.revokeObjectURL(capturedImage);
            }
            resetApiState();
            stopCamera();
        };
    }, []);

    // Mở dialog camera
    const handleOpenCamera = async () => {
        setOpenCamera(true);
        setIsCapturing(true);
        setCapturedImage(null);
        // Xóa kết quả phân tích cảm xúc cũ
        resetApiState();
        await getCameras();
        await startCamera();
    };

    // Đóng dialog camera và dừng camera
    const handleCloseCamera = () => {
        setOpenCamera(false);
        stopCamera();
        if (capturedImage) {
            URL.revokeObjectURL(capturedImage);
            setCapturedImage(null);
        }
        setIsCapturing(true);
    };

    // Lấy danh sách camera
    const getCameras = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(
                (device) => device.kind === 'videoinput'
            );
            setCameras(videoDevices);
            if (videoDevices.length > 0) {
                setSelectedCamera(videoDevices[0].deviceId);
            }
        } catch (error) {
            console.error('Error getting cameras:', error);
        }
    };

    // Khởi động camera
    const startCamera = async () => {
        try {
            const constraints = {
                video: {
                    deviceId: selectedCamera
                        ? { exact: selectedCamera }
                        : undefined,
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user',
                },
            };

            const mediaStream = await navigator.mediaDevices.getUserMedia(
                constraints
            );
            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                await videoRef.current.play();
            }
        } catch (error) {
            console.error('Error starting camera:', error);
        }
    };

    // Dừng camera
    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        }
    };

    // Chụp ảnh từ webcam
    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            // Thiết lập kích thước canvas bằng với kích thước video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Vẽ frame từ video lên canvas
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Tạo URL cho ảnh đã chụp để preview
            const imageUrl = canvas.toDataURL('image/jpeg', 0.95);
            setCapturedImage(imageUrl);
            setIsCapturing(false);

            // Tạm dừng camera sau khi chụp
            if (stream) {
                stopCamera();
            }
        }
    };

    // Chụp lại ảnh
    const handleRetake = async () => {
        if (capturedImage) {
            URL.revokeObjectURL(capturedImage);
            setCapturedImage(null);
        }
        setIsCapturing(true);
        await startCamera();
    };

    // Sử dụng ảnh đã chụp
    const handleUsePhoto = () => {
        if (capturedImage) {
            // Chuyển đổi dataURL thành Blob
            fetch(capturedImage)
                .then((res) => res.blob())
                .then((blob) => {
                    // Tạo file từ blob
                    const file = new File([blob], 'webcam-capture.jpg', {
                        type: 'image/jpeg',
                    });

                    // Sử dụng file như một file được tải lên
                    handleFileChange(file);

                    // Đóng dialog sau khi sử dụng ảnh
                    setOpenCamera(false);
                });
        }
    };

    return (
        <Box>
            <Paper
                component="form"
                variant="outlined"
                sx={{
                    p: 3,
                    borderRadius: 2,
                    boxShadow: theme.shadows[1],
                }}
                onSubmit={handleSubmit}
            >
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight="medium" gutterBottom>
                        Emotion Detection
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Upload an image containing a face to detect emotions.
                        Supports JPG, PNG and JPEG formats, maximum size 5MB.
                    </Typography>
                </Box>

                <FileUploader
                    onFileSelect={handleFileChange}
                    onClearFile={handleClearFile}
                    accept="image/*"
                    maxSize={5 * 1024 * 1024}
                    previewUrl={previewUrl}
                />

                <Box
                    sx={{
                        mt: 3,
                        display: 'flex',
                        gap: 2,
                        flexWrap: 'wrap',
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'flex-end',
                    }}
                >
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleOpenCamera}
                        startIcon={<PhotoCamera />}
                    >
                        Capture Image
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/history')}
                        startIcon={<VisibilityOutlined />}
                    >
                        View History
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={!selectedFile || loading}
                        startIcon={
                            loading ? (
                                <CircularProgress size={20} color="inherit" />
                            ) : (
                                <CloudUpload />
                            )
                        }
                    >
                        {loading ? 'Processing...' : 'Detect Emotion'}
                    </Button>
                </Box>
            </Paper>

            {/* Hiển thị kết quả */}
            {(result || loading || error) && (
                <Paper
                    variant="outlined"
                    sx={{
                        p: 3,
                        mt: 3,
                        borderRadius: 2,
                        boxShadow: theme.shadows[1],
                    }}
                >
                    <EmotionResults
                        result={result}
                        loading={loading}
                        error={error}
                        previewUrl={previewUrl}
                    />
                </Paper>
            )}

            {/* Dialog chụp ảnh từ webcam */}
            <Dialog
                open={openCamera}
                onClose={handleCloseCamera}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {isCapturing
                        ? 'Capture Image from Webcam'
                        : 'Preview Image'}
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseCamera}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box
                        sx={{
                            position: 'relative',
                            width: '100%',
                            height: 'auto',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        {isCapturing ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: '8px',
                                }}
                            />
                        ) : (
                            <img
                                src={capturedImage}
                                alt="Captured"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '70vh',
                                    borderRadius: '8px',
                                }}
                            />
                        )}
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    {isCapturing ? (
                        <>
                            <Button onClick={handleCloseCamera} color="inherit">
                                Cancel
                            </Button>
                            <Button
                                onClick={capturePhoto}
                                color="primary"
                                variant="contained"
                                startIcon={<PhotoCamera />}
                            >
                                Capture Image
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={handleCloseCamera} color="inherit">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleRetake}
                                color="secondary"
                                startIcon={<Refresh />}
                            >
                                Retake
                            </Button>
                            <Button
                                onClick={handleUsePhoto}
                                color="primary"
                                variant="contained"
                                startIcon={<CheckCircle />}
                            >
                                Use this image
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EmotionDetector;
