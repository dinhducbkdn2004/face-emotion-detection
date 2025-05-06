import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    Card,
    CardContent,
    Skeleton,
    Alert,
    Button,
    Chip,
    Avatar,
    IconButton,
    Divider,
    Breadcrumbs,
    Link,
    useTheme,
    useMediaQuery,
    Tooltip,
    LinearProgress,
} from '@mui/material';
import {
    ArrowBack,
    Mood as MoodIcon,
    CalendarToday,
    Home as HomeIcon,
    History as HistoryIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import useApi from '../../hooks/useApi';
import {
    getEmotionDetectionById,
    deleteEmotionDetection,
} from '../../services/emotionService';
import { format } from 'date-fns';

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

const HistoryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const [fetchDetail, detectionData, loading, error] = useApi(
        getEmotionDetectionById
    );
    const [deleteDetection, , deleteLoading] = useApi(deleteEmotionDetection, {
        showSuccessToast: true,
        successMessage: 'Đã xóa kết quả phát hiện thành công',
        onSuccess: () => {
            navigate('/history');
        },
    });

    useEffect(() => {
        fetchDetail(id);
    }, [id]);

    const handleDelete = async () => {
        if (
            window.confirm('Bạn có chắc chắn muốn xóa kết quả phát hiện này?')
        ) {
            try {
                await deleteDetection(id);
            } catch (error) {
                console.error('Lỗi khi xóa kết quả phát hiện:', error);
            }
        }
    };

    // Render skeleton cho chi tiết
    const renderDetailSkeleton = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
                <Skeleton
                    variant="rectangular"
                    height={300}
                    sx={{
                        borderRadius: 2,
                        mb: 2,
                    }}
                />
                <Skeleton variant="text" height={30} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="60%" />
            </Grid>
            <Grid item xs={12} md={7}>
                <Box sx={{ mb: 3 }}>
                    <Skeleton
                        variant="text"
                        height={40}
                        width="50%"
                        sx={{ mb: 1 }}
                    />
                    <Skeleton variant="text" width="30%" />
                </Box>
                <Grid container spacing={2}>
                    {[0, 1].map((item) => (
                        <Grid item xs={12} sm={6} key={item}>
                            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                <CardContent>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            mb: 2,
                                        }}
                                    >
                                        <Skeleton
                                            variant="circular"
                                            width={40}
                                            height={40}
                                            sx={{ mr: 1.5 }}
                                        />
                                        <Box>
                                            <Skeleton
                                                variant="text"
                                                width={100}
                                            />
                                            <Skeleton
                                                variant="text"
                                                width={80}
                                            />
                                        </Box>
                                    </Box>
                                    {[0, 1, 2].map((i) => (
                                        <Box key={i} sx={{ mb: 1.5 }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    mb: 0.5,
                                                }}
                                            >
                                                <Skeleton
                                                    variant="text"
                                                    width={80}
                                                />
                                                <Skeleton
                                                    variant="text"
                                                    width={40}
                                                />
                                            </Box>
                                            <Skeleton
                                                variant="rectangular"
                                                height={6}
                                                sx={{ borderRadius: 3 }}
                                            />
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Grid>
        </Grid>
    );

    // Hiển thị kết quả phân tích cảm xúc
    const renderEmotionResults = () => {
        if (!detectionData?.detection_results?.face_detected) {
            return (
                <Alert severity="info" sx={{ borderRadius: 2, mt: 2 }}>
                    Không phát hiện khuôn mặt trong ảnh này
                </Alert>
            );
        }

        return (
            <Grid container spacing={2}>
                {detectionData.detection_results.faces.map(
                    (face, faceIndex) => {
                        // Lấy cảm xúc với điểm cao nhất
                        const primaryEmotion = face.emotions[0];
                        const primaryEmotionColor =
                            emotionColors[primaryEmotion.emotion] ||
                            theme.palette.primary.main;

                        return (
                            <Grid item xs={12} sm={6} key={faceIndex}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        borderRadius: 2,
                                        transition: 'all 0.3s ease',
                                        borderColor: theme.palette.divider,
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: `0 4px 20px 0 ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)'}`,
                                            borderColor: primaryEmotionColor,
                                        },
                                    }}
                                >
                                    <CardContent>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                mb: 2,
                                            }}
                                        >
                                            <Avatar
                                                sx={{
                                                    bgcolor:
                                                        primaryEmotionColor,
                                                    color: '#fff',
                                                    mr: 1.5,
                                                }}
                                            >
                                                {faceIndex + 1}
                                            </Avatar>
                                            <Box>
                                                <Typography
                                                    fontWeight="bold"
                                                    variant="subtitle1"
                                                >
                                                    Khuôn mặt #{faceIndex + 1}
                                                </Typography>
                                                <Chip
                                                    label={`${primaryEmotion.emotion.charAt(0).toUpperCase() + primaryEmotion.emotion.slice(1)} (${primaryEmotion.percentage.toFixed(1)}%)`}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: `${primaryEmotionColor}20`,
                                                        color: primaryEmotionColor,
                                                        fontWeight: 'medium',
                                                    }}
                                                />
                                            </Box>
                                        </Box>

                                        {face.emotions.map((item, index) => {
                                            // Kiểm tra xem có phải cảm xúc chính không
                                            const isMainEmotion = index === 0;
                                            const emotionColor =
                                                emotionColors[item.emotion] ||
                                                theme.palette.primary.main;

                                            return (
                                                <Box
                                                    key={index}
                                                    sx={{ mb: 1.5 }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
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
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems:
                                                                    'center',
                                                                color: isMainEmotion
                                                                    ? emotionColor
                                                                    : 'text.primary',
                                                            }}
                                                        >
                                                            {item.emotion
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                item.emotion.slice(
                                                                    1
                                                                )}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight={
                                                                isMainEmotion
                                                                    ? 'bold'
                                                                    : 'normal'
                                                            }
                                                            sx={{
                                                                color: isMainEmotion
                                                                    ? emotionColor
                                                                    : 'text.secondary',
                                                            }}
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
                                                                theme.palette
                                                                    .mode ===
                                                                'dark'
                                                                    ? 'rgba(255,255,255,0.12)'
                                                                    : 'rgba(0,0,0,0.05)',
                                                            mt: 0.5,
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                width: `${item.percentage}%`,
                                                                height: '100%',
                                                                borderRadius: 3,
                                                                bgcolor:
                                                                    emotionColor,
                                                                transition:
                                                                    'width 1s ease-in-out',
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    }
                )}
            </Grid>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 3, md: 4 },
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    boxShadow: theme.shadows[2],
                    mb: 4,
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                {deleteLoading && (
                    <LinearProgress
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                        }}
                    />
                )}

                {/* Breadcrumbs */}
                <Breadcrumbs
                    aria-label="breadcrumb"
                    sx={{
                        mb: 3,
                        '& .MuiBreadcrumbs-li': {
                            display: 'flex',
                            alignItems: 'center',
                        },
                    }}
                >
                    <Link
                        underline="hover"
                        color="inherit"
                        href="/"
                        sx={{ display: 'flex', alignItems: 'center' }}
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/');
                        }}
                    >
                        <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
                        {!isMobile && 'Trang chủ'}
                    </Link>
                    <Link
                        underline="hover"
                        color="inherit"
                        href="/history"
                        sx={{ display: 'flex', alignItems: 'center' }}
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/history');
                        }}
                    >
                        <HistoryIcon sx={{ mr: 0.5, fontSize: 20 }} />
                        Lịch sử
                    </Link>
                    <Typography
                        color="text.primary"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            fontWeight: 'medium',
                        }}
                    >
                        <MoodIcon sx={{ mr: 0.5, fontSize: 20 }} />
                        Chi tiết phát hiện
                    </Typography>
                </Breadcrumbs>

                {loading ? (
                    renderDetailSkeleton()
                ) : error ? (
                    <Alert
                        severity="error"
                        sx={{
                            borderRadius: 2,
                            mb: 2,
                        }}
                    >
                        Không thể tải dữ liệu chi tiết. Vui lòng thử lại.
                    </Alert>
                ) : detectionData ? (
                    <>
                        <Grid container spacing={3}>
                            {/* Thông tin ảnh bên trái */}
                            <Grid item xs={12} md={5}>
                                <Box
                                    sx={{
                                        position: 'relative',
                                        mb: 2,
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        height: { xs: 250, sm: 300, md: 350 },
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        bgcolor: 'black',
                                    }}
                                >
                                    {detectionData.image_url ? (
                                        <Box
                                            component="img"
                                            src={detectionData.image_url}
                                            alt="Detection result"
                                            sx={{
                                                maxWidth: '100%',
                                                maxHeight: '100%',
                                                objectFit: 'contain',
                                            }}
                                        />
                                    ) : (
                                        <MoodIcon
                                            sx={{
                                                fontSize: 60,
                                                color: 'text.secondary',
                                                opacity: 0.5,
                                            }}
                                        />
                                    )}
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            mb: 1,
                                        }}
                                    >
                                        <CalendarToday
                                            fontSize="small"
                                            sx={{
                                                mr: 1,
                                                color: 'text.secondary',
                                            }}
                                        />
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Thời gian phát hiện:
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="body1"
                                        fontWeight="medium"
                                    >
                                        {format(
                                            new Date(detectionData.timestamp),
                                            'dd/MM/yyyy HH:mm:ss'
                                        )}
                                    </Typography>
                                </Box>

                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={handleDelete}
                                    disabled={deleteLoading}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                    }}
                                >
                                    Xóa kết quả phát hiện
                                </Button>
                            </Grid>

                            {/* Kết quả phát hiện bên phải */}
                            <Grid item xs={12} md={7}>
                                <Typography
                                    variant={isMobile ? 'h6' : 'h5'}
                                    fontWeight="bold"
                                    sx={{ mb: 2 }}
                                >
                                    Kết quả phát hiện cảm xúc
                                </Typography>

                                {detectionData.detection_results && (
                                    <Box>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                mb: 3,
                                            }}
                                        >
                                            <Typography
                                                variant="body1"
                                                fontWeight="medium"
                                            >
                                                {detectionData.detection_results
                                                    .face_detected
                                                    ? `Đã phát hiện ${detectionData.detection_results.faces.length} khuôn mặt`
                                                    : 'Không phát hiện khuôn mặt nào'}
                                            </Typography>
                                        </Box>

                                        {renderEmotionResults()}
                                    </Box>
                                )}
                            </Grid>
                        </Grid>

                        <Box
                            sx={{
                                mt: 4,
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBack />}
                                onClick={() => navigate('/history')}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                }}
                            >
                                Quay lại danh sách
                            </Button>
                        </Box>
                    </>
                ) : null}
            </Paper>
        </Container>
    );
};

export default HistoryDetail;
