import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    Alert,
    Divider,
    Fade,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { Login, HowToReg, CloudUpload } from '@mui/icons-material';
import { useUser } from '../../components/account/UserContext';
import FileUploader from '../../components/ui/FileUploader';
import EmotionResults from '../../components/emotion/EmotionResults';
import { detectEmotion } from '../../services/emotionService';
import useApi from '../../hooks/useApi';

const Guest = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { isAuthenticated, isGuest, usageCount, maxUsage } = useUser();
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [remainingUsage, setRemainingUsage] = useState(5);

    const [detect, result, loading, error, resetApiState] = useApi(
        detectEmotion,
        {
            showSuccessToast: true,
            successMessage: 'Phân tích cảm xúc thành công!',
        }
    );

    // Chuyển hướng nếu đã đăng nhập
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    // Cập nhật số lần sử dụng còn lại
    useEffect(() => {
        if (maxUsage !== null && usageCount !== undefined) {
            setRemainingUsage(Math.max(0, maxUsage - usageCount));
        } else {
            setRemainingUsage(5); // Mặc định là 5 lần
        }
    }, [maxUsage, usageCount]);

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
            console.error('Lỗi phát hiện cảm xúc:', error);
        }
    };

    // Xử lý khi người dùng nhấn thử lại
    const handleRetry = () => {
        if (selectedFile) {
            // Reset trạng thái và thử lại
            resetApiState();
            handleSubmit({ preventDefault: () => {} });
        }
    };

    // Đảm bảo kết quả được xóa khi component unmount
    useEffect(() => {
        return () => {
            // Clean up
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            resetApiState();
        };
    }, []);

    return (
        <Container
            maxWidth="lg"
            sx={{
                py: { xs: 3, sm: 5 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: 'calc(100vh - 80px)',
            }}
        >
            <Fade in={true} timeout={800}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, sm: 3, md: 4 },
                        borderRadius: 4,
                        background:
                            theme.palette.mode === 'dark'
                                ? 'linear-gradient(145deg, #1e1e1e, #282828)'
                                : 'linear-gradient(145deg, #fefefe, #f5f5f5)',
                        boxShadow:
                            theme.palette.mode === 'dark'
                                ? '0 8px 32px rgba(0, 0, 0, 0.2)'
                                : '0 8px 32px rgba(0, 0, 0, 0.05)',
                        overflow: 'hidden',
                        maxWidth: '100%',
                        width: '100%',
                    }}
                >
                    <Typography
                        variant={isMobile ? 'h5' : 'h4'}
                        fontWeight="bold"
                        sx={{
                            mb: 1,
                            textAlign: 'center',
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '0.5px',
                        }}
                    >
                        Guest mode
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 3, textAlign: 'center' }}
                    >
                        Try the emotion detection feature
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    <Alert severity="info" variant="outlined" sx={{ mb: 3 }}>
                        You are in guest mode. You have {remainingUsage}{' '}
                        detections left. Login or register to use unlimited and
                        save your detection history.
                    </Alert>

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
                            <Typography
                                variant="h6"
                                fontWeight="medium"
                                gutterBottom
                            >
                                Detect emotions
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Upload an image with a face to detect emotions.
                                Supports JPG, PNG, and JPEG formats, up to 5MB.
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
                                flexDirection: isMobile ? 'column' : 'row',
                                justifyContent: 'flex-end',
                            }}
                        >
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={
                                    !selectedFile ||
                                    loading ||
                                    remainingUsage <= 0
                                }
                                startIcon={<CloudUpload />}
                                sx={{
                                    backgroundColor: theme.palette.primary.main,
                                    '&:hover': {
                                        backgroundColor:
                                            theme.palette.primary.dark,
                                    },
                                }}
                            >
                                {loading ? 'Processing...' : 'Detect emotions'}
                            </Button>
                        </Box>
                    </Paper>

                    {/* Hiển thị cảnh báo giới hạn */}
                    {remainingUsage <= 0 && (
                        <Alert
                            severity="warning"
                            variant="filled"
                            sx={{ mt: 3 }}
                        >
                            You have used all your free detections. Please login
                            or register to continue.
                        </Alert>
                    )}

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
                                onRetry={handleRetry}
                            />
                        </Paper>
                    )}
                </Paper>
            </Fade>
        </Container>
    );
};

export default Guest;
