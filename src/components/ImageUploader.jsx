import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Stack,
    IconButton,
    Alert,
    useTheme,
    Paper,
} from '@mui/material';
import {
    CloudUpload,
    Delete,
    PhotoCamera,
    Backup,
    ImageSearch,
} from '@mui/icons-material';
import { detectEmotion } from '../services/emotionService';
import { styled } from '@mui/material/styles';
import EmotionDisplay from './EmotionDisplay';

// Styled component cho khu vực kéo thả
const DropArea = styled(Paper)(({ theme, isDragActive, isError }) => ({
    padding: theme.spacing(4),
    textAlign: 'center',
    border: '2px dashed',
    borderColor: isError
        ? theme.palette.error.main
        : isDragActive
          ? theme.palette.primary.main
          : theme.palette.divider,
    borderRadius: theme.shape.borderRadius,
    cursor: 'pointer',
    backgroundColor: isDragActive
        ? theme.palette.mode === 'dark'
            ? 'rgba(25, 118, 210, 0.08)'
            : 'rgba(25, 118, 210, 0.04)'
        : isError
          ? theme.palette.mode === 'dark'
              ? 'rgba(211, 47, 47, 0.08)'
              : 'rgba(211, 47, 47, 0.04)'
          : theme.palette.background.paper,
    transition: 'all 0.3s ease',
    '&:hover': {
        borderColor: isDragActive
            ? theme.palette.primary.main
            : theme.palette.primary.light,
        backgroundColor:
            theme.palette.mode === 'dark'
                ? 'rgba(25, 118, 210, 0.08)'
                : 'rgba(25, 118, 210, 0.04)',
    },
}));

/**
 * Component để tải lên hình ảnh và phát hiện cảm xúc
 * @param {Object} props
 * @param {function} props.onDetectionComplete - Callback khi phát hiện cảm xúc hoàn tất
 */
export default function ImageUploader({ onDetectionComplete }) {
    const theme = useTheme();
    const [previewFile, setPreviewFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [detectionResult, setDetectionResult] = useState(null);

    // Xử lý khi thả file
    const onDrop = useCallback((acceptedFiles) => {
        // Reset trạng thái
        setError('');
        setDetectionResult(null);

        // Kiểm tra số lượng file
        if (acceptedFiles.length === 0) {
            return;
        }

        const file = acceptedFiles[0];

        // Kiểm tra loại file
        if (!file.type.startsWith('image/')) {
            setError('Only image files are accepted');
            return;
        }

        // Kiểm tra kích thước file (tối đa 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size is too large (max 5MB)');
            return;
        }

        setPreviewFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    }, []);

    // Cấu hình dropzone
    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragReject,
        fileRejections,
    } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp'],
        },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024, // 5MB
    });

    // Kiểm tra lỗi từ dropzone
    const isError = !!error || fileRejections.length > 0;

    // Xóa file đã chọn
    const handleClearFile = () => {
        setPreviewFile(null);
        setPreviewUrl('');
        setDetectionResult(null);
        setError('');
    };

    // Phát hiện cảm xúc từ file đã chọn
    const handleDetectEmotion = async () => {
        if (!previewFile) {
            setError('Please select an image');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Gọi API phát hiện cảm xúc
            const result = await detectEmotion(previewFile);

            // Lưu kết quả
            setDetectionResult(result);

            // Gọi callback nếu có
            if (onDetectionComplete) {
                onDetectionComplete(result);
            }
        } catch (error) {
            console.error('Error detecting emotions:', error);
            setError(
                'An error occurred while detecting emotions. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack spacing={3}>
            {/* Khu vực kéo thả file */}
            {!previewFile ? (
                <DropArea
                    {...getRootProps()}
                    isDragActive={isDragActive}
                    isError={isError}
                >
                    <input {...getInputProps()} />

                    <Stack
                        spacing={2}
                        alignItems="center"
                        justifyContent="center"
                    >
                        {isDragActive ? (
                            <>
                                <Backup
                                    sx={{
                                        fontSize: 60,
                                        color: theme.palette.primary.main,
                                    }}
                                />
                                <Typography variant="h6">
                                    {' '}
                                    Drop image here...{' '}
                                </Typography>
                            </>
                        ) : (
                            <>
                                <CloudUpload
                                    sx={{
                                        fontSize: 60,
                                        color: isError
                                            ? theme.palette.error.main
                                            : theme.palette.text.secondary,
                                    }}
                                />
                                <Typography variant="h6">
                                    {' '}
                                    Drag & drop image or click to select{' '}
                                </Typography>{' '}
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {' '}
                                    Supports JPG, PNG, GIF (max 5MB){' '}
                                </Typography>
                            </>
                        )}
                    </Stack>
                </DropArea>
            ) : (
                // Hiển thị xem trước
                <Paper sx={{ p: 2 }}>
                    <Stack spacing={2}>
                        <Box sx={{ position: 'relative' }}>
                            <Box
                                component="img"
                                src={previewUrl}
                                alt="Preview"
                                sx={{
                                    width: '100%',
                                    maxHeight: '400px',
                                    objectFit: 'contain',
                                    borderRadius: theme.shape.borderRadius,
                                }}
                            />
                            <IconButton
                                aria-label="xóa ảnh"
                                onClick={handleClearFile}
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                                    },
                                }}
                            >
                                <Delete />
                            </IconButton>
                        </Box>

                        <Typography variant="body2">
                            {previewFile.name} (
                            {(previewFile.size / 1024).toFixed(1)} KB)
                        </Typography>

                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={
                                loading ? (
                                    <CircularProgress
                                        size={20}
                                        color="inherit"
                                    />
                                ) : (
                                    <ImageSearch />
                                )
                            }
                            onClick={handleDetectEmotion}
                            disabled={loading}
                            fullWidth
                        >
                            {loading ? 'Processing...' : 'Detect Emotions'}
                        </Button>
                    </Stack>
                </Paper>
            )}

            {/* Hiển thị lỗi */}
            {error && (
                <Alert severity="error" onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Hiển thị kết quả phát hiện cảm xúc */}
            {detectionResult && (
                <EmotionDisplay
                    detectionData={detectionResult}
                    loading={loading}
                    error={error}
                />
            )}
        </Stack>
    );
}
