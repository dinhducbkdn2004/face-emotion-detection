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
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import {
    getEmotionHistory,
    deleteEmotionDetection,
} from '../../services/emotionService';
import { format } from 'date-fns';

const History = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [skip, setSkip] = useState(0);
    const limit = 10;

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

    // Render skeleton loading
    const renderSkeletons = () => {
        return Array(3)
            .fill(0)
            .map((_, index) => (
                <Grid item xs={12} md={6} lg={4} key={`skeleton-${index}`}>
                    <Card sx={{ height: '100%', borderRadius: 2 }}>
                        <Skeleton variant="rectangular" height={140} />
                        <CardContent>
                            <Skeleton variant="text" height={30} />
                            <Skeleton variant="text" />
                            <Skeleton variant="text" width="60%" />
                        </CardContent>
                    </Card>
                </Grid>
            ));
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    mb={4}
                    textAlign="center"
                >
                    Lịch sử phát hiện cảm xúc
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        Không thể tải lịch sử phát hiện cảm xúc. Vui lòng thử
                        lại sau.
                    </Alert>
                )}

                {loading ? (
                    <Grid container spacing={3}>
                        {renderSkeletons()}
                    </Grid>
                ) : historyData?.length > 0 ? (
                    <>
                        <Grid container spacing={3}>
                            {historyData.map((item) => (
                                <Grid
                                    item
                                    xs={12}
                                    md={6}
                                    lg={4}
                                    key={item.detection_id}
                                >
                                    <Card
                                        sx={{
                                            height: '100%',
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s ease',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                            },
                                        }}
                                        onClick={() =>
                                            handleView(item.detection_id)
                                        }
                                    >
                                        {item.image_url && (
                                            <CardMedia
                                                component="img"
                                                height="140"
                                                image={item.image_url}
                                                alt="Face detection"
                                                sx={{ objectFit: 'cover' }}
                                            />
                                        )}

                                        <CardContent>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    alignItems: 'flex-start',
                                                }}
                                            >
                                                <Typography
                                                    variant="h6"
                                                    gutterBottom
                                                >
                                                    {item.detection_results
                                                        .face_detected
                                                        ? `${item.detection_results.faces.length} khuôn mặt`
                                                        : 'Không phát hiện khuôn mặt'}
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
                                                        >
                                                            <ViewIcon />
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
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Box>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                gutterBottom
                                            >
                                                {format(
                                                    new Date(item.timestamp),
                                                    'dd/MM/yyyy HH:mm'
                                                )}
                                            </Typography>

                                            {item.detection_results
                                                .face_detected &&
                                                item.detection_results.faces
                                                    .length > 0 && (
                                                    <Typography variant="body2">
                                                        Cảm xúc chính:{' '}
                                                        <strong>
                                                            {item.detection_results.faces[0].emotions[0].emotion
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                item.detection_results.faces[0].emotions[0].emotion.slice(
                                                                    1
                                                                )}
                                                        </strong>
                                                    </Typography>
                                                )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Phân trang */}
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
                            />
                        </Box>
                    </>
                ) : (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            textAlign: 'center',
                            borderRadius: 2,
                            bgcolor: 'background.default',
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Không có dữ liệu lịch sử
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            paragraph
                        >
                            Bạn chưa có bất kỳ phát hiện cảm xúc nào trong lịch
                            sử.
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/dashboard')}
                            sx={{ mt: 2 }}
                        >
                            Phát hiện cảm xúc ngay
                        </Button>
                    </Paper>
                )}
            </Box>
        </Container>
    );
};

export default History;
