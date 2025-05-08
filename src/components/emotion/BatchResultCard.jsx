import React, { useState, useRef } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    useTheme,
    Alert,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Collapse,
} from '@mui/material';
import { Face as FaceIcon, ExpandMore, ExpandLess } from '@mui/icons-material';
import EmotionResultCard from './EmotionResultCard';
import FaceBoxOverlay from './FaceBoxOverlay';

/**
 * Component hiển thị kết quả phân tích cảm xúc cho một ảnh trong batch
 * @param {Object} props - Props của component
 * @param {Object} props.result - Kết quả phân tích cảm xúc
 */
const BatchResultCard = ({ result }) => {
    const theme = useTheme();
    const [imageUrl, setImageUrl] = useState(null);
    const [expandedFaces, setExpandedFaces] = useState({});
    const facesListRef = useRef({});

    // Toggle face details
    const handleFaceClick = (faceIndex) => {
        setExpandedFaces((prev) => ({
            ...prev,
            [faceIndex]: !prev[faceIndex],
        }));

        // Cuộn đến kết quả tương ứng
        scrollToFace(faceIndex);
    };

    // Cuộn đến kết quả khi click vào bounding box
    const scrollToFace = (faceIndex) => {
        if (facesListRef.current[faceIndex]) {
            facesListRef.current[faceIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });

            // Tự động mở rộng nếu chưa mở
            if (!expandedFaces[faceIndex]) {
                setExpandedFaces((prev) => ({
                    ...prev,
                    [faceIndex]: true,
                }));
            }
        }
    };

    // Kiểm tra kỹ kết quả để tránh lỗi
    if (!result) {
        console.error('BatchResultCard: Kết quả không hợp lệ (null/undefined)');
        return null;
    }

    console.log('BatchResultCard nhận kết quả:', result);

    if (!result.detection_results) {
        console.error(
            'BatchResultCard: Không có detection_results trong:',
            result
        );
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                    {result.filename || 'Ảnh không xác định'}
                </Typography>
                <Typography variant="body2">
                    Không có kết quả phân tích
                </Typography>
            </Alert>
        );
    }

    if (
        !result.detection_results.faces ||
        !Array.isArray(result.detection_results.faces)
    ) {
        console.error(
            'BatchResultCard: Không có faces hoặc faces không phải là mảng trong:',
            result
        );
        return (
            <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                    {result.filename || 'Ảnh không xác định'}
                </Typography>
                <Typography variant="body2">
                    Không tìm thấy thông tin khuôn mặt
                </Typography>
            </Alert>
        );
    }

    const { faces } = result.detection_results;

    // Tạo URL cho ảnh từ File object hoặc sử dụng image_url từ API
    React.useEffect(() => {
        if (result.file instanceof File) {
            const url = URL.createObjectURL(result.file);
            setImageUrl(url);
            return () => URL.revokeObjectURL(url);
        } else if (result.image_url) {
            setImageUrl(result.image_url);
        }
    }, [result.file, result.image_url]);

    // Cảnh báo màu sắc theo cảm xúc
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

    // Log để debug
    console.log(
        'BatchResultCard: Hiển thị kết quả cho',
        result.filename,
        'với',
        faces.length,
        'khuôn mặt'
    );

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: theme.shadows[1],
                mb: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                    boxShadow: theme.shadows[3],
                },
            }}
        >
            <CardContent sx={{ p: 2 }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                    }}
                >
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                            {result.filename || 'Ảnh không xác định'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {result.timestamp
                                ? new Date(result.timestamp).toLocaleString()
                                : 'Đang xử lý...'}
                        </Typography>
                    </Box>
                    <Chip
                        label={`${faces.length} khuôn mặt`}
                        color="primary"
                        size="small"
                    />
                </Box>

                {/* Hiển thị ảnh với bounding box */}
                {imageUrl && (
                    <FaceBoxOverlay
                        imageUrl={imageUrl}
                        faces={faces}
                        onFaceClick={scrollToFace}
                    />
                )}

                {/* Danh sách khuôn mặt dạng list */}
                <List
                    sx={{
                        width: '100%',
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: theme.palette.divider,
                        mt: 2,
                        mb: 2,
                    }}
                >
                    {faces.map((face, idx) => {
                        const primaryEmotion = face.emotions[0];
                        const primaryEmotionColor =
                            emotionColors[primaryEmotion.emotion] ||
                            theme.palette.primary.main;
                        const isExpanded = expandedFaces[idx] || false;

                        return (
                            <Box
                                key={idx}
                                ref={(el) => (facesListRef.current[idx] = el)}
                            >
                                <ListItemButton
                                    onClick={() => handleFaceClick(idx)}
                                    sx={{
                                        borderLeft: `4px solid ${primaryEmotionColor}`,
                                        transition: 'all 0.2s ease',
                                        borderRadius: isExpanded
                                            ? '8px 8px 0 0'
                                            : 2,
                                        mb: isExpanded ? 0 : 1,
                                    }}
                                >
                                    <ListItemIcon>
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: `${primaryEmotionColor}15`,
                                                color: primaryEmotionColor,
                                            }}
                                        >
                                            <FaceIcon />
                                        </Box>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight="medium"
                                            >
                                                Face #{idx + 1}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: primaryEmotionColor,
                                                    fontWeight: 'medium',
                                                }}
                                            >
                                                {primaryEmotion.emotion
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    primaryEmotion.emotion.slice(
                                                        1
                                                    )}{' '}
                                                (
                                                {primaryEmotion.percentage.toFixed(
                                                    1
                                                )}
                                                %)
                                            </Typography>
                                        }
                                    />
                                    {isExpanded ? (
                                        <ExpandLess />
                                    ) : (
                                        <ExpandMore />
                                    )}
                                </ListItemButton>
                                <Collapse
                                    in={isExpanded}
                                    timeout="auto"
                                    unmountOnExit
                                >
                                    <Box
                                        sx={{
                                            p: 2,
                                            bgcolor:
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(255,255,255,0.03)'
                                                    : 'rgba(0,0,0,0.01)',
                                            borderRadius: '0 0 8px 8px',
                                            mb: 1,
                                        }}
                                    >
                                        <EmotionResultCard
                                            face={face}
                                            faceIndex={idx}
                                        />
                                    </Box>
                                </Collapse>
                            </Box>
                        );
                    })}
                </List>
            </CardContent>
        </Card>
    );
};

export default BatchResultCard;
