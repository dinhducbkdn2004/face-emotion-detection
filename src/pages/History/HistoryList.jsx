import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Button,
    Stack,
    Chip,
    TablePagination,
    Tooltip,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    VisibilityOutlined,
    DeleteOutline,
    InfoOutlined,
    EmojiFlagsOutlined,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import {
    getEmotionHistory,
    deleteEmotionDetection,
} from '../../services/emotionService';
import ToastService from '../../toasts/ToastService';

export default function HistoryList() {
    const navigate = useNavigate();
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Tải dữ liệu lịch sử
    const loadHistoryData = async () => {
        try {
            setLoading(true);
            setError('');
            const skip = page * rowsPerPage;
            const data = await getEmotionHistory(skip, rowsPerPage);
            setHistoryData(data);
        } catch (error) {
            console.error('Lỗi khi tải lịch sử:', error);
            setError('Không thể tải dữ liệu lịch sử. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    // Tải dữ liệu khi trang thay đổi
    useEffect(() => {
        loadHistoryData();
    }, [page, rowsPerPage]);

    // Xử lý thay đổi trang
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Xử lý thay đổi số lượng hàng mỗi trang
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Xem chi tiết một detection
    const handleViewDetail = (detectionId) => {
        navigate(`/history/${detectionId}`);
    };

    // Xóa một detection
    const handleDelete = async (detectionId) => {
        if (
            !window.confirm('Bạn có chắc chắn muốn xóa kết quả phát hiện này?')
        ) {
            return;
        }

        try {
            setDeleteLoading(true);
            await deleteEmotionDetection(detectionId);

            // Cập nhật lại danh sách
            setHistoryData((prevData) =>
                prevData.filter((item) => item.detection_id !== detectionId)
            );

            ToastService.success('Đã xóa thành công');
        } catch (error) {
            console.error('Lỗi khi xóa detection:', error);
            ToastService.error('Không thể xóa. Vui lòng thử lại sau.');
        } finally {
            setDeleteLoading(false);
        }
    };

    // Hàm lấy biểu tượng cảm xúc dựa trên cảm xúc chính
    const getEmotionIcon = (detectionResult) => {
        if (
            !detectionResult ||
            !detectionResult.faces ||
            !detectionResult.faces[0]
        ) {
            return <InfoOutlined color="disabled" />;
        }

        const face = detectionResult.faces[0];
        const emotions = face.emotions || [];

        // Sắp xếp emotions theo score giảm dần và lấy cảm xúc cao nhất
        const sortedEmotions = [...emotions].sort((a, b) => b.score - a.score);
        const topEmotion = sortedEmotions[0]?.emotion || '';

        // Trả về biểu tượng tương ứng với cảm xúc
        return <EmojiFlagsOutlined color="info" />;
    };

    // Lấy tên cảm xúc chính từ kết quả phát hiện
    const getPrimaryEmotion = (detectionResult) => {
        if (
            !detectionResult ||
            !detectionResult.faces ||
            !detectionResult.faces[0]
        ) {
            return 'Không xác định';
        }

        const face = detectionResult.faces[0];
        const emotions = face.emotions || [];

        if (emotions.length === 0) {
            return 'Không xác định';
        }

        // Sắp xếp emotions theo score giảm dần và lấy cảm xúc cao nhất
        const sortedEmotions = [...emotions].sort((a, b) => b.score - a.score);
        return sortedEmotions[0]?.emotion || 'Không xác định';
    };

    // Lấy số khuôn mặt phát hiện được
    const getFaceCount = (detectionResult) => {
        return detectionResult && detectionResult.faces
            ? detectionResult.faces.length
            : 0;
    };

    // Định dạng ngày giờ
    const formatDateTime = (dateTimeStr) => {
        try {
            const date = new Date(dateTimeStr);
            return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
        } catch (error) {
            return dateTimeStr || 'Không rõ';
        }
    };

    // Hiển thị trạng thái loading
    if (loading && historyData.length === 0) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '400px',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    // Hiển thị lỗi
    if (error) {
        return (
            <Alert severity="error" sx={{ my: 2 }}>
                {error}
            </Alert>
        );
    }

    // Hiển thị thông báo khi không có dữ liệu
    if (historyData.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                    Bạn chưa có lịch sử phát hiện cảm xúc nào
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/detect')}
                    sx={{ mt: 2 }}
                >
                    Phát hiện cảm xúc ngay
                </Button>
            </Paper>
        );
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Lịch sử phát hiện cảm xúc
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Danh sách các lần phát hiện cảm xúc trước đây của bạn
            </Typography>

            <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table aria-label="Bảng lịch sử phát hiện">
                    <TableHead>
                        <TableRow>
                            <TableCell>Thời gian</TableCell>
                            <TableCell>Ảnh</TableCell>
                            <TableCell align="center">Số khuôn mặt</TableCell>
                            <TableCell>Cảm xúc chính</TableCell>
                            <TableCell align="right">Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {historyData.map((item) => (
                            <TableRow key={item.detection_id}>
                                <TableCell>
                                    {formatDateTime(item.timestamp)}
                                </TableCell>
                                <TableCell>
                                    {item.image_url ? (
                                        <Box
                                            component="img"
                                            src={item.image_url}
                                            alt="Ảnh phát hiện"
                                            sx={{
                                                width: 60,
                                                height: 60,
                                                objectFit: 'cover',
                                                borderRadius: 1,
                                            }}
                                        />
                                    ) : (
                                        <Box
                                            sx={{
                                                width: 60,
                                                height: 60,
                                                bgcolor: 'grey.200',
                                                borderRadius: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Không có ảnh
                                            </Typography>
                                        </Box>
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    <Chip
                                        label={getFaceCount(
                                            item.detection_results
                                        )}
                                        size="small"
                                        color={
                                            getFaceCount(
                                                item.detection_results
                                            ) > 0
                                                ? 'primary'
                                                : 'default'
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        icon={getEmotionIcon(
                                            item.detection_results
                                        )}
                                        label={getPrimaryEmotion(
                                            item.detection_results
                                        )}
                                        size="small"
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        justifyContent="flex-end"
                                    >
                                        <Tooltip title="Xem chi tiết">
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() =>
                                                    handleViewDetail(
                                                        item.detection_id
                                                    )
                                                }
                                            >
                                                <VisibilityOutlined fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Xóa">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() =>
                                                    handleDelete(
                                                        item.detection_id
                                                    )
                                                }
                                                disabled={deleteLoading}
                                            >
                                                <DeleteOutline fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={-1}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Số hàng mỗi trang:"
                    labelDisplayedRows={({ from, to }) => `${from}-${to}`}
                    nextIconButtonProps={{
                        disabled: historyData.length < rowsPerPage,
                    }}
                />
            </TableContainer>
        </Box>
    );
}
