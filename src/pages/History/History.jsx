import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Button,
    Pagination,
    Skeleton,
    Alert,
    IconButton,
    Tooltip,
    Chip,
    Divider,
    Avatar,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    ImageNotSupported,
    SentimentSatisfiedAlt,
    AccessTime,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import {
    getEmotionHistory,
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

const History = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [page, setPage] = useState(1);
    const [skip, setSkip] = useState(0);
    const limit = 12; // Tăng số lượng hiển thị trên mỗi trang

    const [fetchHistory, historyData, loading, error, refreshHistory] =
        useApi(getEmotionHistory);
    const [deleteDetection] = useApi(deleteEmotionDetection, {
        showSuccessToast: true,
        successMessage: 'Đã xóa kết quả phát hiện thành công',
        onSuccess: () => {
            fetchHistory(skip, limit);
        },
    });

    // Lấy dữ liệu lịch sử khi trang được tải
    useEffect(() => {
        fetchHistory(skip, limit);
    }, [skip]);

    // Xử lý khi thay đổi trang
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
        setSkip((newPage - 1) * limit);
    };

    // Xử lý khi xóa một kết quả phát hiện
    const handleDelete = async (detectionId, event) => {
        event.stopPropagation();
        if (
            window.confirm('Bạn có chắc chắn muốn xóa kết quả phát hiện này?')
        ) {
            try {
                await deleteDetection(detectionId);
            } catch (error) {
                console.error('Lỗi khi xóa kết quả phát hiện:', error);
            }
        }
    };

    // Xử lý khi xem chi tiết một kết quả phát hiện
    const handleView = (detectionId) => {
        navigate(`/history/${detectionId}`);
    };

    const renderItemSkeleton = (key) => (
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


    // Render skeleton loading grid
    const renderSkeletons = () => {
        return [...Array(limit)].map((_, index) =>
            renderItemSkeleton(`skeleton-${index}`)
        );
    };

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 3, md: 4 },
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    boxShadow: theme.shadows[2],
                    mb: 4,
                    maxWidth: '100%',
                    overflow: 'hidden',
                }}
            >
                <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    fontWeight="bold"
                    sx={{
                        mb: 3,
                        textAlign: 'center',
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Lịch sử phát hiện cảm xúc
                </Typography>

                <Divider sx={{ mb: 4 }} />

                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            boxShadow: theme.shadows[1],
                        }}
                    >
                        Không thể tải lịch sử phát hiện cảm xúc. Vui lòng thử
                        lại sau.
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {loading ? (
                        renderSkeletons()
                    ) : historyData?.length > 0 ? (
                        historyData.map((item) => (
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                lg={3}
                                key={item.detection_id}
                            >
                                <Card
                                    sx={{
                                        height: '100%',
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: theme.shadows[1],
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: theme.shadows[4],
                                        },
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                    onClick={() =>
                                        handleView(item.detection_id)
                                    }
                                >
                                    <Box sx={{ position: 'relative' }}>
                                        {item.image_url ? (
                                            <CardMedia
                                                component="img"
                                                height={140}
                                                image={item.image_url}
                                                alt="Face detection"
                                                sx={{
                                                    objectFit: 'cover',
                                                    borderRadius: '8px 8px 0 0',
                                                }}
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    height: 140,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    bgcolor: 'action.hover',
                                                    borderRadius: '8px 8px 0 0',
                                                }}
                                            >
                                                <ImageNotSupported
                                                    sx={{
                                                        fontSize: 40,
                                                        color: 'text.secondary',
                                                        opacity: 0.5,
                                                    }}
                                                />
                                            </Box>
                                        )}

                                        {/* Chip hiển thị số khuôn mặt */}
                                        {item.detection_results
                                            .face_detected && (
                                            <Chip
                                                label={`${item.detection_results.faces.length} khuôn mặt`}
                                                size="small"
                                                color="primary"
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 8,
                                                    left: 8,
                                                    fontWeight: 'medium',
                                                }}
                                            />
                                        )}
                                    </Box>

                                    <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                mb: 1.5,
                                            }}
                                        >
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight="medium"
                                                noWrap
                                                sx={{ maxWidth: '80%' }}
                                            >
                                                {format(
                                                    new Date(item.timestamp),
                                                    'dd/MM/yyyy HH:mm'
                                                )}
                                            </Typography>

                                            <Box>
                                                <Tooltip title="Xem chi tiết">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleView(
                                                                item.detection_id
                                                            );
                                                        }}
                                                        sx={{ mr: 0.5 }}
                                                    >
                                                        <ViewIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Xóa">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={(e) =>
                                                            handleDelete(
                                                                item.detection_id,
                                                                e
                                                            )
                                                        }
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>

                                        {!item.detection_results
                                            .face_detected ? (
                                            <Alert
                                                severity="info"
                                                icon={false}
                                                sx={{
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    fontSize: '0.8rem',
                                                }}
                                            >
                                                Không phát hiện khuôn mặt
                                            </Alert>
                                        ) : (
                                            item.detection_results.faces
                                                .length > 0 && (
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        mt: 0.5,
                                                    }}
                                                >
                                                    <SentimentSatisfiedAlt
                                                        fontSize="small"
                                                        sx={{
                                                            mr: 1,
                                                            color:
                                                                emotionColors[
                                                                    item
                                                                        .detection_results
                                                                        .faces[0]
                                                                        .emotions[0]
                                                                        .emotion
                                                                ] ||
                                                                'primary.main',
                                                        }}
                                                    />
                                                    <Typography variant="body2">
                                                        Cảm xúc chính:{' '}
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            fontWeight="bold"
                                                            sx={{
                                                                color:
                                                                    emotionColors[
                                                                        item
                                                                            .detection_results
                                                                            .faces[0]
                                                                            .emotions[0]
                                                                            .emotion
                                                                    ] ||
                                                                    'text.primary',
                                                            }}
                                                        >
                                                            {item.detection_results.faces[0].emotions[0].emotion
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                item.detection_results.faces[0].emotions[0].emotion.slice(
                                                                    1
                                                                )}
                                                        </Typography>
                                                    </Typography>
                                                </Box>
                                            )
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Alert
                                severity="info"
                                sx={{
                                    borderRadius: 2,
                                    boxShadow: theme.shadows[1],
                                    p: 2,
                                }}
                            >
                                Bạn chưa có dữ liệu lịch sử phát hiện cảm xúc
                                nào.
                            </Alert>
                        </Grid>
                    )}
                </Grid>

                {/* Phân trang */}
                {!loading && historyData?.length > 0 && (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mt: 4,
                        }}
                    >
                        <Pagination
                            count={10} // Sẽ cần tính toán dựa trên tổng số bản ghi và limit
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            shape="rounded"
                            size={isMobile ? 'small' : 'medium'}
                        />
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default History;
