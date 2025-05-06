import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { CloudUpload, VisibilityOutlined } from '@mui/icons-material';
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

    const [detect, result, loading, error] = useApi(detectEmotion, {
        showSuccessToast: true,
        successMessage: 'Phân tích cảm xúc thành công!',
    });

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
    };

    // Gửi ảnh để phân tích
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFile) return;

        try {
            await detect(selectedFile);
        } catch (error) {
            console.error('Lỗi khi phát hiện cảm xúc:', error);
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
                        Phát hiện cảm xúc
                                                                </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Tải lên một ảnh có khuôn mặt để nhận diện cảm xúc. Hỗ
                        trợ các định dạng JPG, PNG và JPEG, kích thước tối đa
                        5MB.
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
                                variant="outlined"
                        onClick={() => navigate('/history')}
                                startIcon={<VisibilityOutlined />}
                            >
                        Xem lịch sử
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
                        {loading ? 'Đang xử lý...' : 'Phát hiện cảm xúc'}
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
                    <Typography variant="h6" gutterBottom fontWeight="medium">
                        Kết quả phát hiện
                    </Typography>

                    <EmotionResults
                        result={result}
                        loading={loading}
                        error={error}
                    />
                </Paper>
            )}
        </Box>
    );
};

export default EmotionDetector;
