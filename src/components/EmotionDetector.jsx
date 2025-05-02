import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Paper,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Grid,
} from '@mui/material';
import { UploadFile, Close, CloudUpload, Delete } from '@mui/icons-material';
import useApi from '../hooks/useApi';
import { detectEmotion } from '../services/emotionService';
import { useTheme } from '@mui/material/styles';

const EmotionDetector = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [detect, result, loading, error] = useApi(detectEmotion, {
        showSuccessToast: true,
        successMessage: 'Phân tích cảm xúc thành công!',
    });

    // Xử lý khi người dùng chọn file
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Kiểm tra kích thước file (giới hạn 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Kích thước file không được vượt quá 5MB');
            return;
        }

        // Kiểm tra loại file (chỉ chấp nhận ảnh)
        if (!file.type.match('image.*')) {
            alert('Vui lòng chọn file ảnh');
            return;
        }

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
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
            <Typography
                variant="h5"
                gutterBottom
                fontWeight="bold"
                textAlign="center"
                mb={3}
            >
                Phát hiện cảm xúc khuôn mặt
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error.response?.data?.message ||
                        'Không thể phân tích cảm xúc. Vui lòng thử lại.'}
                </Alert>
            )}

            <Paper
                elevation={3}
                sx={{
                    p: 3,
                    borderRadius: 2,
                    mb: 4,
                    background:
                        theme.palette.mode === 'dark'
                            ? 'linear-gradient(145deg, #1e1e1e, #2d2d2d)'
                            : 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                }}
            >
                <form onSubmit={handleSubmit}>
                    {!previewUrl ? (
                        <Box
                            sx={{
                                border: '2px dashed',
                                borderColor: 'primary.main',
                                borderRadius: 2,
                                p: 4,
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                    transform: 'translateY(-4px)',
                                },
                            }}
                            onClick={() =>
                                document.getElementById('upload-image').click()
                            }
                        >
                            <input
                                accept="image/*"
                                id="upload-image"
                                type="file"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                            <CloudUpload
                                sx={{
                                    fontSize: 60,
                                    color: 'primary.main',
                                    mb: 2,
                                }}
                            />
                            <Typography variant="h6" gutterBottom>
                                Kéo thả ảnh hoặc nhấn để chọn
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Hỗ trợ: JPG, PNG, GIF (Tối đa 5MB)
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ position: 'relative', mb: 3 }}>
                            <Box
                                component="img"
                                src={previewUrl}
                                alt="Preview"
                                sx={{
                                    width: '100%',
                                    maxHeight: 400,
                                    objectFit: 'contain',
                                    borderRadius: 2,
                                    boxShadow: 3,
                                }}
                            />
                            <Button
                                variant="contained"
                                color="error"
                                size="small"
                                onClick={handleClearFile}
                                startIcon={<Delete />}
                                sx={{
                                    position: 'absolute',
                                    top: 16,
                                    right: 16,
                                    borderRadius: 8,
                                }}
                            >
                                Xóa
                            </Button>
                        </Box>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={!selectedFile || loading}
                        sx={{
                            mt: 3,
                            py: 1.5,
                            borderRadius: 2,
                            boxShadow: 2,
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Phát hiện cảm xúc'
                        )}
                    </Button>
                </form>
            </Paper>

            {result && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Kết quả phát hiện:
                    </Typography>

                    {result.detection_results.face_detected ? (
                        <>
                            <Typography variant="body1" gutterBottom>
                                Đã phát hiện{' '}
                                {result.detection_results.faces.length} khuôn
                                mặt
                            </Typography>

                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                {result.detection_results.faces.map(
                                    (face, faceIndex) => (
                                        <Grid
                                            item
                                            xs={12}
                                            sm={6}
                                            key={faceIndex}
                                        >
                                            <Card
                                                variant="outlined"
                                                sx={{
                                                    borderRadius: 2,
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        transform:
                                                            'translateY(-4px)',
                                                        boxShadow: 3,
                                                    },
                                                }}
                                            >
                                                <CardContent>
                                                    <Typography
                                                        fontWeight="bold"
                                                        gutterBottom
                                                    >
                                                        Khuôn mặt #
                                                        {faceIndex + 1}
                                                    </Typography>

                                                    {face.emotions.map(
                                                        (item, index) => {
                                                            // Tìm cảm xúc chính (điểm cao nhất)
                                                            const isMainEmotion =
                                                                index === 0;

                                                            return (
                                                                <Box
                                                                    key={index}
                                                                    sx={{
                                                                        mb: 1,
                                                                    }}
                                                                >
                                                                    <Box
                                                                        sx={{
                                                                            display:
                                                                                'flex',
                                                                            justifyContent:
                                                                                'space-between',
                                                                            alignItems:
                                                                                'center',
                                                                        }}
                                                                    >
                                                                        <Typography
                                                                            variant="body2"
                                                                            fontWeight={
                                                                                isMainEmotion
                                                                                    ? 'bold'
                                                                                    : 'normal'
                                                                            }
                                                                        >
                                                                            {item.emotion
                                                                                .charAt(
                                                                                    0
                                                                                )
                                                                                .toUpperCase() +
                                                                                item.emotion.slice(
                                                                                    1
                                                                                )}
                                                                            :
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="body2"
                                                                            fontWeight={
                                                                                isMainEmotion
                                                                                    ? 'bold'
                                                                                    : 'normal'
                                                                            }
                                                                        >
                                                                            {item.percentage.toFixed(
                                                                                1
                                                                            )}
                                                                            %
                                                                        </Typography>
                                                                    </Box>

                                                                    {/* Progress bar */}
                                                                    <Box
                                                                        sx={{
                                                                            width: '100%',
                                                                            height: 6,
                                                                            borderRadius: 3,
                                                                            bgcolor:
                                                                                'background.paper',
                                                                            mt: 0.5,
                                                                        }}
                                                                    >
                                                                        <Box
                                                                            sx={{
                                                                                width: `${item.percentage}%`,
                                                                                height: '100%',
                                                                                borderRadius: 3,
                                                                                bgcolor:
                                                                                    isMainEmotion
                                                                                        ? 'primary.main'
                                                                                        : 'primary.light',
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                </Box>
                                                            );
                                                        }
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    )
                                )}
                            </Grid>

                            <Box
                                sx={{
                                    mt: 3,
                                    display: 'flex',
                                    justifyContent: 'center',
                                }}
                            >
                                <Button
                                    variant="outlined"
                                    onClick={() =>
                                        navigate(
                                            `/history/${result.detection_id}`
                                        )
                                    }
                                    sx={{ borderRadius: 2 }}
                                >
                                    Xem chi tiết
                                </Button>
                            </Box>
                        </>
                    ) : (
                        <Alert severity="info">
                            Không phát hiện khuôn mặt nào trong ảnh
                        </Alert>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default EmotionDetector;
