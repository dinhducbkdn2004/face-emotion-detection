import { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    Stack,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const EmotionChip = styled(Chip)(({ theme, emotion, isHighest }) => {
    const getEmotionColor = (emotion) => {
        const colors = {
            happy: '#4caf50',
            sad: '#2196f3',
            angry: '#f44336',
            fear: '#ff9800',
            surprise: '#9c27b0',
            disgust: '#795548',
            neutral: '#9e9e9e',
            contempt: '#607d8b',
            default: '#757575',
        };
        return colors[emotion] || colors.default;
    };

    return {
        backgroundColor: isHighest
            ? getEmotionColor(emotion)
            : theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.08)',
        color: isHighest ? '#fff' : theme.palette.text.primary,
        borderRadius: '16px',
        fontWeight: isHighest ? 'bold' : 'normal',
        '& .MuiChip-label': {
            padding: '0 12px',
        },
    };
});

const FaceBox = styled(Box)(({ theme }) => ({
    position: 'absolute',
    border: `2px solid ${theme.palette.primary.main}`,
    boxSizing: 'border-box',
    pointerEvents: 'none',
    borderRadius: '4px',
    transition: 'all 0.3s ease',
    '&:hover': {
        borderColor: theme.palette.secondary.main,
        borderWidth: '3px',
    },
}));

/**
 * Component để hiển thị kết quả phát hiện cảm xúc
 * @param {Object} props
 * @param {Object} props.detectionData - Dữ liệu phát hiện từ API
 * @param {boolean} props.loading - Trạng thái đang tải
 * @param {string} props.error - Thông báo lỗi
 */
export default function EmotionDisplay({ detectionData, loading, error }) {
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [imageElement, setImageElement] = useState(null);
    const containerRef = useRef(null);

    // Xử lý khi hình ảnh được tải
    const handleImageLoad = (e) => {
        setImageElement(e.target);
        setImageSize({
            width: e.target.offsetWidth,
            height: e.target.offsetHeight,
        });
    };

    // Vẽ lại khung khuôn mặt khi kích thước thay đổi hoặc có dữ liệu mới
    useEffect(() => {
        const handleResize = () => {
            if (imageElement) {
                setImageSize({
                    width: imageElement.offsetWidth,
                    height: imageElement.offsetHeight,
                });
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [imageElement]);

    // Hiển thị trạng thái loading
    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    minHeight: '200px',
                    gap: 2,
                }}
            >
                <CircularProgress />
                <Typography>Analyzing emotions...</Typography>
            </Box>
        );
    }

    // Hiển thị lỗi
    if (error) {
        return (
            <Paper
                sx={{
                    p: 3,
                    textAlign: 'center',
                    backgroundColor: 'error.light',
                    color: 'error.contrastText',
                }}
            >
                <Typography>{error}</Typography>
            </Paper>
        );
    }

    // Nếu không có dữ liệu
    if (!detectionData || !detectionData.detection_results) {
        return null;
    }

    // Lấy thông tin kết quả phát hiện
    const { detection_results, image_url } = detectionData;
    const { faces, face_detected, processing_time } = detection_results;

    // Hiển thị khi không phát hiện khuôn mặt
    if (!face_detected || !faces || faces.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="error">
                    No faces detected in the image
                </Typography>
                {image_url && (
                    <Box sx={{ mt: 2 }}>
                        <img
                            src={image_url}
                            alt="Uploaded"
                            style={{ maxWidth: '100%', maxHeight: '400px' }}
                            onLoad={handleImageLoad}
                        />
                    </Box>
                )}
            </Paper>
        );
    }

    // Tính tỷ lệ hiển thị box tương ứng với kích thước ảnh hiển thị
    const calculateBoxPosition = (box) => {
        const [x, y, width, height] = box;

        // Nếu chưa có kích thước image thì trả về giá trị mặc định
        if (imageSize.width === 0)
            return { left: 0, top: 0, width: 0, height: 0 };

        // Tỷ lệ khung ảnh hiển thị / ảnh gốc (giả định tỷ lệ bằng nhau theo chiều rộng)
        const ratio = imageSize.width / imageElement.naturalWidth;

        return {
            left: x * ratio,
            top: y * ratio,
            width: width * ratio,
            height: height * ratio,
        };
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
                {/* Hiển thị thời gian xử lý */}
                <Typography variant="body2" color="text.secondary">
                    Processing time:{' '}
                    {processing_time ? processing_time.toFixed(3) : '?'} seconds
                </Typography>

                {/* Khung chứa ảnh và các box khuôn mặt */}
                <Box
                    ref={containerRef}
                    sx={{
                        position: 'relative',
                        display: 'inline-block',
                        maxWidth: '100%',
                    }}
                >
                    {image_url ? (
                        <img
                            src={image_url}
                            alt="Detected"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '500px',
                                display: 'block',
                            }}
                            onLoad={handleImageLoad}
                        />
                    ) : (
                        <Box
                            sx={{
                                bgcolor: 'grey.200',
                                width: '100%',
                                height: '300px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Typography color="text.secondary">
                                No image available
                            </Typography>
                        </Box>
                    )}

                    {/* Vẽ box cho từng khuôn mặt */}
                    {imageSize.width > 0 &&
                        faces.map((face, index) => {
                            const { left, top, width, height } =
                                calculateBoxPosition(face.box);
                            // Tìm cảm xúc có điểm cao nhất
                            const highestEmotion = face.emotions.reduce(
                                (prev, current) =>
                                    prev.score > current.score ? prev : current,
                                { emotion: '', score: 0 }
                            );

                            return (
                                <Tooltip
                                    key={index}
                                    title={
                                        <Box sx={{ p: 1 }}>
                                            <Typography variant="subtitle2">
                                                Face #{index + 1}
                                            </Typography>
                                            <Stack
                                                direction="column"
                                                spacing={0.5}
                                                sx={{ mt: 1 }}
                                            >
                                                {face.emotions.map(
                                                    (emotion) => (
                                                        <Typography
                                                            key={
                                                                emotion.emotion
                                                            }
                                                            variant="body2"
                                                        >
                                                            {emotion.emotion}:{' '}
                                                            {emotion.percentage.toFixed(
                                                                1
                                                            )}
                                                            %
                                                        </Typography>
                                                    )
                                                )}
                                            </Stack>
                                        </Box>
                                    }
                                >
                                    <FaceBox
                                        sx={{
                                            left: `${left}px`,
                                            top: `${top}px`,
                                            width: `${width}px`,
                                            height: `${height}px`,
                                        }}
                                    />
                                </Tooltip>
                            );
                        })}
                </Box>

                {/* Hiển thị danh sách khuôn mặt và cảm xúc */}
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Detection Results ({faces.length}{' '}
                        {faces.length === 1 ? 'face' : 'faces'})
                    </Typography>

                    <Stack spacing={2}>
                        {faces.map((face, faceIndex) => (
                            <Paper
                                key={faceIndex}
                                sx={{ p: 2, bgcolor: 'background.paper' }}
                            >
                                <Typography variant="subtitle1" gutterBottom>
                                    Face #{faceIndex + 1}
                                </Typography>

                                <Stack
                                    direction="row"
                                    spacing={1}
                                    flexWrap="wrap"
                                    useFlexGap
                                    sx={{ mb: 1 }}
                                >
                                    {face.emotions
                                        .sort((a, b) => b.score - a.score)
                                        .map((emotion) => (
                                            <EmotionChip
                                                key={emotion.emotion}
                                                label={`${emotion.emotion}: ${emotion.percentage.toFixed(1)}%`}
                                                emotion={emotion.emotion}
                                                isHighest={
                                                    emotion.emotion ===
                                                    face.emotions.reduce(
                                                        (prev, curr) =>
                                                            prev.score >
                                                            curr.score
                                                                ? prev
                                                                : curr,
                                                        {
                                                            emotion: '',
                                                            score: 0,
                                                        }
                                                    ).emotion
                                                }
                                            />
                                        ))}
                                </Stack>
                            </Paper>
                        ))}
                    </Stack>
                </Box>
            </Stack>
        </Paper>
    );
}
