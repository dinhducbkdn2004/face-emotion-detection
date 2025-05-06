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
import { detectEmotionBatch } from '../services/emotionService';

// Map cảm xúc với màu sắc
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

    // Xử lý kéo thả file
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

            // Lọc files hợp lệ
            const validFiles = files.filter((file) => {
                // Kiểm tra kích thước file (giới hạn 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    return false;
                }
                // Kiểm tra loại file (chỉ chấp nhận ảnh)
                if (!file.type.match('image.*')) {
                    return false;
                }
                return true;
            });

            if (validFiles.length !== files.length) {
                alert(
                    'Một số file không hợp lệ. Chỉ chấp nhận ảnh và kích thước dưới 5MB.'
                );
            }

            setSelectedFiles((prev) => [...prev, ...validFiles]);
        }
    };

    // Xử lý khi người dùng chọn files
    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        if (!files.length) return;

        // Lọc files hợp lệ
        const validFiles = files.filter((file) => {
            // Kiểm tra kích thước file (giới hạn 5MB)
            if (file.size > 5 * 1024 * 1024) {
                return false;
            }
            // Kiểm tra loại file (chỉ chấp nhận ảnh)
            if (!file.type.match('image.*')) {
                return false;
            }
            return true;
        });

        if (validFiles.length !== files.length) {
            alert(
                'Một số file không hợp lệ. Chỉ chấp nhận ảnh và kích thước dưới 5MB.'
            );
        }

        setSelectedFiles((prev) => [...prev, ...validFiles]);
    };

    // Xóa một file từ danh sách
    const handleRemoveFile = (index) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // Xóa tất cả files
    const handleClearFiles = () => {
        setSelectedFiles([]);
    };

    // Xử lý kết quả mới từ SSE
    const handleNewResult = (result) => {
        setResults((prev) => {
            // Kiểm tra xem kết quả đã tồn tại chưa
            const existingIndex = prev.findIndex(
                (r) =>
                    r.filename === result.filename ||
                    r.detection_id === result.detection_id
            );

            if (existingIndex >= 0) {
                // Cập nhật kết quả hiện có
                const updatedResults = [...prev];
                updatedResults[existingIndex] = {
                    ...updatedResults[existingIndex],
                    ...result,
                    status: 'completed',
                };
                return updatedResults;
            } else {
                // Thêm kết quả mới
                return [...prev, { ...result, status: 'completed' }];
            }
        });

        setProcessedCount((prev) => prev + 1);
    };

    // Bắt đầu xử lý batch
    const handleSubmit = async (event) => {
        event.preventDefault();
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
            await detectEmotionBatch(selectedFiles, handleNewResult);
        } catch (error) {
            console.error('Lỗi khi xử lý batch:', error);
            setError(error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Hiển thị trạng thái của mỗi file
    const renderFileStatus = (file, index) => {
        // Tìm kết quả tương ứng
        const result = results.find((r) => r.filename === file.name);

        let statusIcon;
        let statusColor;
        let statusText = 'Đang chờ';

        if (isProcessing) {
            if (result) {
                if (result.status === 'completed') {
                    statusIcon = <CheckCircle fontSize="small" />;
                    statusColor = 'success';
                    statusText = 'Hoàn thành';
                } else if (result.status === 'error') {
                    statusIcon = <ErrorIcon fontSize="small" />;
                    statusColor = 'error';
                    statusText = 'Lỗi';
                } else {
                    statusIcon = <CircularProgress size={16} />;
                    statusColor = 'primary';
                    statusText = 'Đang xử lý';
                }
            }
        } else {
            statusIcon = <PendingOutlined fontSize="small" />;
            statusColor = 'default';
        }

        // Tạo URL tạm thời để hiển thị ảnh thu nhỏ
        const thumbUrl = URL.createObjectURL(file);

        // Xóa URL khi component unmount hoặc được render lại
        useEffect(() => {
            return () => URL.revokeObjectURL(thumbUrl);
        }, [thumbUrl]);

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
                    component="img"
                    src={thumbUrl}
                    alt={file.name}
                    sx={{
                        width: 40,
                        height: 40,
                        objectFit: 'cover',
                        borderRadius: 1,
                        mr: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                />
                <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / 1024).toFixed(1)} KB`}
                    primaryTypographyProps={{
                        noWrap: true,
                        sx: {
                            fontWeight:
                                isProcessing && result?.status === 'completed'
                                    ? 'medium'
                                    : 'normal',
                        },
                    }}
                    sx={{
                        mr: 2,
                        '& .MuiListItemText-primary': {
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            maxWidth: { xs: '120px', sm: '200px', md: '300px' },
                        },
                    }}
                />
                <Chip
                    icon={statusIcon}
                    label={statusText}
                    size="small"
                    color={statusColor}
                    variant={statusColor === 'default' ? 'outlined' : 'filled'}
                    sx={{
                        minWidth: 100,
                        ml: 'auto',
                    }}
                />
                <ListItemSecondaryAction>
                    <Tooltip title="Xóa">
                        <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleRemoveFile(index)}
                            disabled={isProcessing}
                            size="small"
                            sx={{ ml: 1 }}
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </ListItemSecondaryAction>
            </ListItem>
        );
    };

    // Hiển thị kết quả nhận diện cho mỗi ảnh
    const renderResults = () => {
        const completedResults = results.filter(
            (r) => r.status === 'completed' && r.detection_results
        );

        if (!completedResults.length) return null;

        return (
            <Box>
                <Typography
                    variant="h6"
                    fontWeight="medium"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    Kết quả phát hiện
                    <Tooltip title="Các kết quả được sắp xếp theo thứ tự hoàn thành">
                        <InfoOutlined
                            fontSize="small"
                            sx={{
                                ml: 1,
                                color: 'text.secondary',
                                cursor: 'help',
                            }}
                        />
                    </Tooltip>
                </Typography>

                <Stack spacing={2} sx={{ mt: 1 }}>
                    {completedResults.map((result, index) => {
                        const hasFaces = result.detection_results.face_detected;
                        const faceCount = hasFaces
                            ? result.detection_results.faces.length
                            : 0;

                        return (
                            <Zoom
                                in={true}
                                key={index}
                                style={{ transitionDelay: `${index * 150}ms` }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: { xs: 2, sm: 3 },
                                        borderRadius: 2,
                                        bgcolor: 'background.paper',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            boxShadow:
                                                '0 4px 20px rgba(0,0,0,0.05)',
                                            transform: 'translateY(-2px)',
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            mb: 2,
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="medium"
                                            sx={{
                                                maxWidth: '85%',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {result.filename}
                                        </Typography>

                                        {hasFaces && (
                                            <Chip
                                                label={`${faceCount} khuôn mặt`}
                                                color="primary"
                                                size="small"
                                                variant="outlined"
                                                sx={{ ml: 'auto' }}
                                            />
                                        )}
                                    </Box>

                                    {hasFaces ? (
                                        <>
                                            <Grid
                                                container
                                                spacing={2}
                                                sx={{ mt: 1 }}
                                            >
                                                {result.detection_results.faces.map(
                                                    (face, faceIndex) => {
                                                        const primaryEmotion =
                                                            face.emotions[0];
                                                        const emotionColor =
                                                            emotionColors[
                                                                primaryEmotion
                                                                    .emotion
                                                            ] ||
                                                            theme.palette
                                                                .primary.main;

                                                        return (
                                                            <Grid
                                                                item
                                                                xs={12}
                                                                sm={6}
                                                                md={4}
                                                                key={faceIndex}
                                                            >
                                                                <Card
                                                                    variant="outlined"
                                                                    sx={{
                                                                        borderRadius: 2,
                                                                        borderColor:
                                                                            'divider',
                                                                        transition:
                                                                            'all 0.2s ease',
                                                                        '&:hover':
                                                                            {
                                                                                borderColor:
                                                                                    emotionColor,
                                                                                boxShadow: `0 4px 12px rgba(0,0,0,0.08)`,
                                                                            },
                                                                    }}
                                                                >
                                                                    <CardContent>
                                                                        <Box
                                                                            sx={{
                                                                                display:
                                                                                    'flex',
                                                                                alignItems:
                                                                                    'center',
                                                                                mb: 2,
                                                                            }}
                                                                        >
                                                                            <Avatar
                                                                                sx={{
                                                                                    bgcolor:
                                                                                        emotionColor,
                                                                                    width: 32,
                                                                                    height: 32,
                                                                                    fontSize:
                                                                                        '0.9rem',
                                                                                    mr: 1,
                                                                                }}
                                                                            >
                                                                                {faceIndex +
                                                                                    1}
                                                                            </Avatar>
                                                                            <Typography
                                                                                fontWeight="medium"
                                                                                variant="body2"
                                                                            >
                                                                                Khuôn
                                                                                mặt
                                                                                #
                                                                                {faceIndex +
                                                                                    1}
                                                                            </Typography>
                                                                        </Box>

                                                                        {face.emotions
                                                                            .slice(
                                                                                0,
                                                                                3
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    item,
                                                                                    emotionIndex
                                                                                ) => {
                                                                                    const isMain =
                                                                                        emotionIndex ===
                                                                                        0;
                                                                                    const color =
                                                                                        emotionColors[
                                                                                            item
                                                                                                .emotion
                                                                                        ] ||
                                                                                        theme
                                                                                            .palette
                                                                                            .primary
                                                                                            .main;

                                                                                    return (
                                                                                        <Box
                                                                                            key={
                                                                                                emotionIndex
                                                                                            }
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
                                                                                                    fontSize="0.8rem"
                                                                                                    fontWeight={
                                                                                                        isMain
                                                                                                            ? 'medium'
                                                                                                            : 'normal'
                                                                                                    }
                                                                                                    color={
                                                                                                        isMain
                                                                                                            ? color
                                                                                                            : 'text.primary'
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
                                                                                                </Typography>
                                                                                                <Typography
                                                                                                    variant="body2"
                                                                                                    fontSize="0.8rem"
                                                                                                    fontWeight={
                                                                                                        isMain
                                                                                                            ? 'medium'
                                                                                                            : 'normal'
                                                                                                    }
                                                                                                    color={
                                                                                                        isMain
                                                                                                            ? color
                                                                                                            : 'text.secondary'
                                                                                                    }
                                                                                                >
                                                                                                    {item.percentage.toFixed(
                                                                                                        1
                                                                                                    )}
                                                                                                    %
                                                                                                </Typography>
                                                                                            </Box>

                                                                                            <Box
                                                                                                sx={{
                                                                                                    width: '100%',
                                                                                                    height: 4,
                                                                                                    borderRadius: 3,
                                                                                                    bgcolor:
                                                                                                        theme
                                                                                                            .palette
                                                                                                            .mode ===
                                                                                                        'dark'
                                                                                                            ? 'rgba(255,255,255,0.1)'
                                                                                                            : 'rgba(0,0,0,0.05)',
                                                                                                    mt: 0.5,
                                                                                                    overflow:
                                                                                                        'hidden',
                                                                                                }}
                                                                                            >
                                                                                                <Box
                                                                                                    sx={{
                                                                                                        width: `${item.percentage}%`,
                                                                                                        height: '100%',
                                                                                                        borderRadius: 3,
                                                                                                        bgcolor:
                                                                                                            color,
                                                                                                        transition:
                                                                                                            'width 1s ease-in-out',
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
                                                        );
                                                    }
                                                )}
                                            </Grid>

                                            <Box
                                                sx={{
                                                    mt: 2,
                                                    display: 'flex',
                                                    justifyContent: 'flex-end',
                                                }}
                                            >
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() =>
                                                        navigate(
                                                            `/history/${result.detection_id}`
                                                        )
                                                    }
                                                    startIcon={
                                                        <VisibilityOutlined fontSize="small" />
                                                    }
                                                    sx={{
                                                        borderRadius: 6,
                                                        textTransform: 'none',
                                                    }}
                                                >
                                                    Chi tiết
                                                </Button>
                                            </Box>
                                        </>
                                    ) : (
                                        <Alert
                                            severity="info"
                                            variant="filled"
                                            sx={{ mt: 1, borderRadius: 2 }}
                                        >
                                            Không phát hiện khuôn mặt nào trong
                                            ảnh này
                                        </Alert>
                                    )}
                                </Paper>
                            </Zoom>
                        );
                    })}
                </Stack>
            </Box>
        );
    };

    return (
        <Grid container spacing={3}>
            {/* Phần upload files bên trái */}
            <Grid item xs={12} md={5}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        height: '100%',
                        boxShadow:
                            theme.palette.mode === 'dark'
                                ? '0 2px 10px rgba(0,0,0,0.2)'
                                : '0 2px 10px rgba(0,0,0,0.05)',
                    }}
                >
                    <Typography variant="h6" fontWeight="medium" gutterBottom>
                        Tải lên nhiều ảnh
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        {/* Khu vực kéo thả */}
                        {selectedFiles.length === 0 && (
                            <Box
                                sx={{
                                    border: '2px dashed',
                                    borderColor: dragActive
                                        ? 'primary.main'
                                        : 'divider',
                                    borderRadius: 2,
                                    p: 4,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    mb: 3,
                                    backgroundColor: dragActive
                                        ? theme.palette.mode === 'dark'
                                            ? 'rgba(30, 136, 229, 0.08)'
                                            : 'rgba(25, 118, 210, 0.04)'
                                        : 'transparent',
                                    '&:hover': {
                                        backgroundColor:
                                            theme.palette.mode === 'dark'
                                                ? 'rgba(30, 136, 229, 0.08)'
                                                : 'rgba(25, 118, 210, 0.04)',
                                        transform: 'translateY(-4px)',
                                    },
                                }}
                                onClick={() =>
                                    document
                                        .getElementById(
                                            'upload-multiple-images'
                                        )
                                        .click()
                                }
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input
                                    accept="image/*"
                                    id="upload-multiple-images"
                                    type="file"
                                    multiple
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                    disabled={isProcessing}
                                />
                                <PhotoLibrary
                                    sx={{
                                        fontSize: 48,
                                        color: 'primary.main',
                                        mb: 2,
                                        opacity: 0.8,
                                    }}
                                />
                                <Typography
                                    variant="h6"
                                    gutterBottom
                                    fontWeight="medium"
                                >
                                    Kéo thả hoặc nhấn để chọn nhiều ảnh
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Hỗ trợ: JPG, PNG, GIF (Tối đa 5MB/ảnh)
                                </Typography>
                            </Box>
                        )}

                        {/* Hiển thị danh sách files đã chọn */}
                        {selectedFiles.length > 0 && (
                            <>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 2,
                                    }}
                                >
                                    <Chip
                                        icon={<PhotoLibrary fontSize="small" />}
                                        label={`${selectedFiles.length} ảnh đã chọn`}
                                        color="primary"
                                        variant="outlined"
                                        size="small"
                                    />
                                    <Box>
                                        <Tooltip title="Thêm ảnh">
                                            <Button
                                                size="small"
                                                startIcon={
                                                    <AddPhotoAlternateOutlined />
                                                }
                                                onClick={() =>
                                                    document
                                                        .getElementById(
                                                            'upload-multiple-images'
                                                        )
                                                        .click()
                                                }
                                                disabled={isProcessing}
                                                sx={{ mr: 1 }}
                                            >
                                                {!isMobile && 'Thêm'}
                                            </Button>
                                        </Tooltip>
                                        <input
                                            accept="image/*"
                                            id="upload-multiple-images"
                                            type="file"
                                            multiple
                                            style={{ display: 'none' }}
                                            onChange={handleFileChange}
                                            disabled={isProcessing}
                                        />
                                        <Tooltip title="Xóa tất cả">
                                            <Button
                                                size="small"
                                                startIcon={<Delete />}
                                                onClick={handleClearFiles}
                                                disabled={isProcessing}
                                                color="error"
                                                variant="outlined"
                                            >
                                                {!isMobile && 'Xóa tất cả'}
                                            </Button>
                                        </Tooltip>
                                    </Box>
                                </Box>

                                <Paper
                                    variant="outlined"
                                    sx={{
                                        mb: 3,
                                        borderRadius: 2,
                                        borderColor: 'divider',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <List
                                        sx={{
                                            maxHeight: 300,
                                            overflow: 'auto',
                                            bgcolor: 'background.paper',
                                            p: 0,
                                        }}
                                    >
                                        {selectedFiles.map(renderFileStatus)}
                                    </List>
                                </Paper>
                            </>
                        )}

                        {/* Hiển thị progress */}
                        {isProcessing && (
                            <Box sx={{ mb: 3 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        mb: 1,
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                        color="primary"
                                    >
                                        Đang xử lý {processedCount}/
                                        {selectedFiles.length} ảnh
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {Math.round(
                                            (processedCount /
                                                selectedFiles.length) *
                                                100
                                        )}
                                        %
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={
                                        (processedCount /
                                            selectedFiles.length) *
                                        100
                                    }
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                    }}
                                />
                            </Box>
                        )}

                        {error && (
                            <Alert
                                severity="error"
                                sx={{ mb: 3, borderRadius: 2 }}
                                variant="filled"
                            >
                                {error.message ||
                                    'Lỗi khi xử lý ảnh. Vui lòng thử lại.'}
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={
                                selectedFiles.length === 0 || isProcessing
                            }
                            sx={{
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 'medium',
                                fontSize: '1rem',
                                textTransform: 'none',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
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
                            {isProcessing
                                ? 'Đang xử lý...'
                                : 'Phát hiện cảm xúc'}
                            {isProcessing && (
                                <LinearProgress
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: 4,
                                    }}
                                />
                            )}
                        </Button>
                    </form>
                </Paper>
            </Grid>

            {/* Phần hiển thị kết quả bên phải */}
            <Grid item xs={12} md={7}>
                {isProcessing && results.length === 0 ? (
                    // Hiển thị skeleton khi đang tải
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            height: '100%',
                            boxShadow:
                                theme.palette.mode === 'dark'
                                    ? '0 2px 10px rgba(0,0,0,0.2)'
                                    : '0 2px 10px rgba(0,0,0,0.05)',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 2,
                            }}
                        >
                            <Typography variant="h6" fontWeight="medium">
                                Đang xử lý...
                            </Typography>
                            <CircularProgress size={20} sx={{ ml: 2 }} />
                        </Box>
                        <LinearProgress
                            sx={{ mb: 3, borderRadius: 3, height: 6 }}
                        />

                        <Stack spacing={2}>
                            {[1, 2].map((i) => (
                                <Paper key={i} sx={{ p: 2, borderRadius: 2 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            mb: 2,
                                        }}
                                    >
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Box
                                                sx={{
                                                    width: '80%',
                                                    height: 20,
                                                    bgcolor: 'divider',
                                                    borderRadius: 1,
                                                    mb: 1,
                                                }}
                                            />
                                            <Box
                                                sx={{
                                                    width: '40%',
                                                    height: 16,
                                                    bgcolor: 'divider',
                                                    borderRadius: 1,
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                    <LinearProgress
                                        sx={{
                                            mb: 2,
                                            borderRadius: 3,
                                            height: 8,
                                        }}
                                    />
                                </Paper>
                            ))}
                        </Stack>
                    </Paper>
                ) : results.length === 0 ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            bgcolor: theme.palette.background.paper,
                            minHeight: 300,
                            boxShadow:
                                theme.palette.mode === 'dark'
                                    ? '0 2px 10px rgba(0,0,0,0.2)'
                                    : '0 2px 10px rgba(0,0,0,0.05)',
                        }}
                    >
                        <PhotoLibrary
                            sx={{
                                fontSize: 60,
                                color: 'text.secondary',
                                opacity: 0.3,
                                mb: 2,
                            }}
                        />
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            align="center"
                        >
                            Kết quả phát hiện sẽ hiển thị ở đây
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            align="center"
                            sx={{ mt: 1 }}
                        >
                            Hãy tải lên một hoặc nhiều ảnh để bắt đầu
                        </Typography>
                    </Paper>
                ) : (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            height: '100%',
                            boxShadow:
                                theme.palette.mode === 'dark'
                                    ? '0 2px 10px rgba(0,0,0,0.2)'
                                    : '0 2px 10px rgba(0,0,0,0.05)',
                        }}
                    >
                        <Box sx={{ maxHeight: 600, overflow: 'auto', pr: 1 }}>
                            {renderResults()}
                        </Box>
                    </Paper>
                )}
            </Grid>
        </Grid>
    );
};

export default BatchEmotionDetector;
