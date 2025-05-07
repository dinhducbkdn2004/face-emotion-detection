import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Grid,
    Paper,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    LinearProgress,
    useTheme,
    useMediaQuery,
    Tooltip,
    Zoom,
    Fade,
    Avatar,
    Chip,
    Badge,
    Stack,
    Skeleton,
} from '@mui/material';
import {
    CloudUpload,
    Delete,
    CheckCircle,
    Error as ErrorIcon,
    PendingOutlined,
    PhotoLibrary,
    VisibilityOutlined,
    CloudUploadOutlined,
    AddPhotoAlternateOutlined,
    Mood as MoodIcon,
    InfoOutlined,
} from '@mui/icons-material';
import {
    detectEmotionBatch,
    detectEmotionBatchFallback,
} from '../services/emotionService';
import ToastService from '../toasts/ToastService';
import BatchResultsList from './emotion/BatchResultsList';

// Emotion color mapping
const emotionColors = {
    happy: '#4caf50',
    sad: '#5c6bc0',
    angry: '#f44336',
    surprise: '#ff9800',
    fear: '#9c27b0',
    disgust: '#795548',
    neutral: '#607d8b',
    contempt: '#795548',
};

const BatchEmotionDetector = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [results, setResults] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [processedCount, setProcessedCount] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [useSSE, setUseSSE] = useState(true); // Default to using SSE
    const [fileThumbUrls, setFileThumbUrls] = useState({});

    // Handle drag and drop
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files);
            handleFiles(files);
        }
    };

    // Validate file
    const validateFile = (file) => {
        // Check file size (limit 5MB)
                if (file.size > 5 * 1024 * 1024) {
            return {
                valid: false,
                error: `File "${file.name}" exceeds the size limit (5MB)`,
            };
                }

        // Check file format
                if (!file.type.match('image.*')) {
            return {
                valid: false,
                error: `File "${file.name}" is not an image`,
            };
        }

        return { valid: true };
    };

    // Handle file list
    const handleFiles = (files) => {
        // List of errors to display
        const errors = [];
        const validFiles = [];

        files.forEach((file) => {
            const validation = validateFile(file);
            if (validation.valid) {
                validFiles.push(file);
            } else {
                errors.push(validation.error);
            }
        });

        if (errors.length > 0) {
            ToastService.warning(
                `${errors.length} invalid files: ${errors.slice(0, 2).join(', ')}${errors.length > 2 ? ',...' : ''}`
            );
        }

        if (validFiles.length > 0) {
            // Create temporary URLs for new files
            const newThumbUrls = {};
            validFiles.forEach((file) => {
                newThumbUrls[file.name] = URL.createObjectURL(file);
            });

            setFileThumbUrls((prev) => ({ ...prev, ...newThumbUrls }));
            setSelectedFiles((prev) => [...prev, ...validFiles]);
        }
    };

    // Handle file selection
    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        if (!files.length) return;
        handleFiles(files);
    };

    // Remove a file from the list
    const handleRemoveFile = (index) => {
        const fileToRemove = selectedFiles[index];
        if (fileToRemove && fileThumbUrls[fileToRemove.name]) {
            URL.revokeObjectURL(fileThumbUrls[fileToRemove.name]);
            setFileThumbUrls((prev) => {
                const newUrls = { ...prev };
                delete newUrls[fileToRemove.name];
                return newUrls;
            });
        }
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // Clear all files
    const handleClearFiles = () => {
        // Remove all temporary URLs
        Object.values(fileThumbUrls).forEach((url) => {
            URL.revokeObjectURL(url);
        });
        setFileThumbUrls({});
        setSelectedFiles([]);
        setResults([]);
        setProcessedCount(0);
        setError(null);
    };

    // Xử lý kết quả mới từ SSE hoặc API
    const handleNewResult = (result) => {
        console.log('Received new result:', result);

        if (!result) {
            console.error('Empty result');
            return;
        }

        setResults((prev) => {
            // Deep copy của mảng kết quả hiện tại
            const updatedResults = [...prev];

            // Xử lý kết quả có lỗi
            if (result.error) {
                console.log(
                    'Xử lý kết quả lỗi:',
                    result.filename,
                    result.error
                );
                const existingIndex = updatedResults.findIndex(
                    (r) => r.filename === result.filename
                );

                if (existingIndex >= 0) {
                    updatedResults[existingIndex] = {
                        ...updatedResults[existingIndex],
                        ...result,
                        status: 'error',
                        errorMessage: result.error,
                    };
                } else {
                    updatedResults.push({
                        filename:
                            result.filename ||
                            `File không rõ #${updatedResults.length + 1}`,
                        status: 'error',
                        errorMessage: result.error,
                    });
                }

                return updatedResults;
            }

            // Xử lý kết quả thành công
            console.log(
                'Xử lý kết quả thành công:',
                result.filename,
                result.detection_id
            );

            // Tìm file gốc tương ứng
            const originalFile = selectedFiles.find(
                (file) => file.name === result.filename
            );

            // Tìm dựa trên filename hoặc detection_id
            const existingIndex = updatedResults.findIndex(
                (r) =>
                    (result.filename && r.filename === result.filename) ||
                    (result.detection_id &&
                        r.detection_id === result.detection_id)
            );

            if (existingIndex >= 0) {
                console.log(
                    'Cập nhật kết quả cho:',
                    result.filename || updatedResults[existingIndex].filename
                );
                updatedResults[existingIndex] = {
                    ...updatedResults[existingIndex],
                    ...result,
                    file: originalFile, // Thêm file gốc vào kết quả
                    status: 'completed',
                };
            } else {
                console.log(
                    'Thêm kết quả mới:',
                    result.filename || `File #${updatedResults.length + 1}`
                );
                updatedResults.push({
                    ...result,
                    filename:
                        result.filename || `File #${updatedResults.length + 1}`,
                    file: originalFile, // Thêm file gốc vào kết quả
                    status: 'completed',
                });
            }

            console.log('Kết quả đã cập nhật:', updatedResults);
            return updatedResults;
        });

        setProcessedCount((prev) => prev + 1);
    };

    // Bắt đầu xử lý batch
    const handleSubmit = async (event) => {
        if (event) event.preventDefault();
        if (!selectedFiles.length) return;

        try {
            setError(null);
            setIsProcessing(true);
            setResults([]);
            setProcessedCount(0);

            // Tạo danh sách tạm thời hiển thị trạng thái "đang xử lý"
            const initialResults = selectedFiles.map((file) => ({
                filename: file.name,
                status: 'pending',
            }));
            setResults(initialResults);

            // Gọi API để xử lý batch
            if (useSSE) {
                try {
            await detectEmotionBatch(selectedFiles, handleNewResult);
        } catch (error) {
                    console.error(
                        'SSE not available, switching to fallback:',
                        error
                    );
                    setUseSSE(false);
                    await detectEmotionBatchFallback(
                        selectedFiles,
                        handleNewResult
                    );
                }
            } else {
                await detectEmotionBatchFallback(
                    selectedFiles,
                    handleNewResult
                );
            }
        } catch (error) {
            console.error('Error processing batch:', error);
            setError(error);
            ToastService.error(
                'An error occurred while processing images. Please try again later.'
            );
        } finally {
            setIsProcessing(false);
        }
    };

    // Xử lý URL tạm thời khi component unmount
    useEffect(() => {
        return () => {
            // Xóa tất cả URL khi component unmount
            Object.values(fileThumbUrls).forEach((url) => {
                URL.revokeObjectURL(url);
            });
        };
    }, [fileThumbUrls]);

    // Hiển thị trạng thái của mỗi file
    const renderFileStatus = (file, index) => {
        // Tìm kết quả tương ứng
        const result = results.find((r) => r.filename === file.name);

        let statusIcon;
        let statusColor;
        let statusText = '';

        if (isProcessing) {
            if (result) {
                if (result.status === 'completed') {
                    statusIcon = <CheckCircle fontSize="small" />;
                    statusColor = 'success';
                    statusText = 'Completed';
                } else if (result.status === 'error') {
                    statusIcon = <ErrorIcon fontSize="small" />;
                    statusColor = 'error';
                    statusText = 'Error';
                } else {
                    statusIcon = <CircularProgress size={16} />;
                    statusColor = 'primary';
                    statusText = 'Processing';
            }
        } else {
                statusIcon = <CircularProgress size={16} />;
                statusColor = 'primary';
                statusText = 'Processing';
            }
        }

        // Sử dụng URL tạm thời từ state thay vì tạo mới
        const thumbUrl = fileThumbUrls[file.name];

        return (
            <ListItem
                key={index}
                divider
                sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        bgcolor:
                            theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.05)'
                                : 'rgba(0,0,0,0.02)',
                    },
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    <Box
                        sx={{
                            position: 'relative',
                            width: 40,
                            height: 40,
                            mr: 2,
                        }}
                    >
                        {isProcessing && !result?.status ? (
                            <Skeleton
                                variant="rectangular"
                                animation="wave"
                                width={40}
                                height={40}
                                sx={{
                                    borderRadius: 1,
                                }}
                            />
                        ) : (
                <Box
                    component="img"
                    src={thumbUrl}
                    alt={file.name}
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                                    objectFit: 'cover',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                />
                        )}
                        {isProcessing && !result?.status && (
                            <CircularProgress
                                size={24}
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-12px',
                                    marginLeft: '-12px',
                                }}
                            />
                        )}
                    </Box>

                <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / 1024).toFixed(1)} KB`}
                    primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: 'medium',
                            sx: {
                            overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            },
                        }}
                        secondaryTypographyProps={{
                            variant: 'caption',
                        }}
                        sx={{ mr: 2 }}
                    />

                    <Box
                        sx={{
                            ml: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {statusText && (
                <Chip
                    icon={statusIcon}
                    label={statusText}
                    size="small"
                    color={statusColor}
                                sx={{ mr: 1 }}
                            />
                        )}
                        <IconButton
                            size="small"
                            onClick={() => handleRemoveFile(index)}
                            disabled={isProcessing}
                            color="error"
                            sx={{
                                visibility: isProcessing ? 'hidden' : 'visible',
                            }}
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
            </ListItem>
        );
    };

    // Component hiển thị trạng thái xử lý batch
    const BatchProcessingStatus = () => {
        const progress =
            selectedFiles.length > 0
                ? Math.round((processedCount / selectedFiles.length) * 100)
                            : 0;

                        return (
            <Box sx={{ mt: 2, mb: 3 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                        justifyContent: 'space-between',
                                            alignItems: 'center',
                        mb: 1,
                    }}
                >
                    <Typography variant="subtitle1">
                        Processing {processedCount}/{selectedFiles.length}{' '}
                        images
                                        </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {progress}%
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ height: 8, borderRadius: 4 }}
                />
                                    </Box>
        );
    };

    // Hiển thị kết quả phân tích
    const renderResults = () => {
        if (!results.length) return null;

                                                        return (
            <Box sx={{ mt: 3 }}>
                <Paper
                    elevation={0}
                                                                    sx={{
                        p: 3,
                        borderRadius: 3,
                        background:
                            theme.palette.mode === 'dark'
                                ? 'linear-gradient(145deg, #1a1a1a, #2d2d2d)'
                                : 'linear-gradient(145deg, #ffffff, #f8f9fa)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    }}
                >
                                                                        <Box
                                                                            sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 2,
                            mb: 3,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PhotoLibrary
                                                                                sx={{
                                                                                    mr: 1,
                                    color: theme.palette.primary.main,
                                    fontSize: 28,
                                }}
                            />
                            <Typography variant="h6" fontWeight="bold">
                                Detection Results ({processedCount}/
                                {selectedFiles.length})
                                                                            </Typography>
                                                                        </Box>

                        {isProcessing && (
                            <Chip
                                icon={<PendingOutlined />}
                                label={`Processing... ${Math.round((processedCount / selectedFiles.length) * 100)}%`}
                                color="primary"
                                sx={{ borderRadius: 3 }}
                            />
                        )}
                                            </Box>

                    <BatchResultsList results={results} />
                                </Paper>
            </Box>
        );
    };

    return (
        <Box>
            {/* Phần tải lên */}
                <Paper
                variant="outlined"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                    sx={{
                        borderRadius: 2,
                    borderStyle: 'dashed',
                    borderWidth: '2px',
                                    borderColor: dragActive
                        ? theme.palette.primary.main
                        : theme.palette.divider,
                    bgcolor: dragActive
                        ? theme.palette.action.hover
                        : 'background.paper',
                    p: 3,
                                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    position: 'relative',
                                    '&:hover': {
                        bgcolor: theme.palette.action.hover,
                    },
                }}
                            >
                                <input
                                    type="file"
                    id="file-upload"
                                    multiple
                    accept="image/*"
                                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />

                <label
                    htmlFor="file-upload"
                    style={{ width: '100%', cursor: 'pointer' }}
                >
                    <Box
                                    sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {isProcessing ? (
                            <>
                                <CircularProgress
                                    variant="determinate"
                                    value={
                                        processedCount / selectedFiles.length
                                    }
                                    size={48}
                                    thickness={4}
                                    sx={{ mb: 2, opacity: 0.8 }}
                                />
                                <Typography variant="h6" gutterBottom>
                                    Processing...{' '}
                                    {Math.round(
                                        (processedCount /
                                            selectedFiles.length) *
                                            100
                                    )}
                                    %
                                </Typography>
                            </>
                        ) : (
                            <>
                                <PhotoLibrary
                                    color="primary"
                                    sx={{ fontSize: 48, mb: 2, opacity: 0.8 }}
                                />
                                <Typography variant="h6" gutterBottom>
                                    Drag and drop images here
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 2 }}
                                >
                                    Or click to select images from your device
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddPhotoAlternateOutlined />}
                                    component="span"
                                >
                                    Select Images
                                </Button>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ mt: 2 }}
                                >
                                    Supported formats: JPG, PNG, JPEG. Max size:
                                    5MB
                                </Typography>
                            </>
                        )}
                    </Box>
                </label>
            </Paper>

                        {/* Hiển thị danh sách files đã chọn */}
                        {selectedFiles.length > 0 && (
                <Paper variant="outlined" sx={{ p: 2, mt: 2, borderRadius: 2 }}>
                    {/* Files đã chọn */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 2,
                                    }}
                                >
                        <Typography variant="subtitle1" fontWeight="medium">
                            {selectedFiles.length} files selected
                        </Typography>
                                            <Button
                                                size="small"
                                                color="error"
                                                variant="outlined"
                            onClick={handleClearFiles}
                            startIcon={<Delete />}
                            disabled={isProcessing}
                                            >
                            Clear All
                                            </Button>
                                </Box>

                    {/* Danh sách files */}
                    <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
                        {selectedFiles.map((file, index) =>
                            renderFileStatus(file, index)
                        )}
                    </List>

                    {/* Buttons */}
                                <Box
                                    sx={{
                            mt: 2,
                                        display: 'flex',
                            gap: 2,
                            justifyContent: 'flex-end',
                        }}
                    >
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/history')}
                            startIcon={<VisibilityOutlined />}
                            disabled={isProcessing}
                        >
                            View History
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={isProcessing || !selectedFiles.length}
                            startIcon={
                                isProcessing ? (
                                    <CircularProgress
                                        size={20}
                                        color="inherit"
                                    />
                                ) : (
                                    <CloudUploadOutlined />
                                )
                            }
                        >
                            {isProcessing ? 'Processing...' : 'Detect Emotions'}
                        </Button>
                    </Box>
                </Paper>
            )}

            {/* Hiển thị trạng thái đang xử lý */}
            {isProcessing && <BatchProcessingStatus />}

            {/* Hiển thị kết quả */}
                            {renderResults()}

            {/* Hiển thị lỗi nếu có */}
            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    Error:{' '}
                    {error.message ||
                        'An error occurred while processing images'}
                </Alert>
            )}
        </Box>
    );
};

export default BatchEmotionDetector;
