import { useState } from 'react';
import {
    Container,
    Box,
    Typography,
    Paper,
    Stack,
    Divider,
} from '@mui/material';
import { Outlet } from 'react-router-dom';
import ImageUploader from '../../components/ImageUploader';
import GuestUsageInfo from '../../components/GuestUsageInfo';

export default function GuestDetection() {
    const [detectionResult, setDetectionResult] = useState(null);

    // Xử lý khi phát hiện cảm xúc hoàn tất
    const handleDetectionComplete = (result) => {
        setDetectionResult(result);
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Phát hiện cảm xúc
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Tải lên hình ảnh và phát hiện cảm xúc trên khuôn mặt
                </Typography>
            </Box>

            {/* Hiển thị thông tin sử dụng cho guest */}
            <GuestUsageInfo />

            {/* Paper cho toàn bộ khu vực nội dung */}
            <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Stack spacing={3}>
                    {/* Phần upload ảnh */}
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Tải lên ảnh
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            paragraph
                        >
                            Hãy chọn một ảnh có chứa khuôn mặt rõ ràng để phát
                            hiện cảm xúc tốt nhất
                        </Typography>
                        <ImageUploader
                            onDetectionComplete={handleDetectionComplete}
                        />
                    </Box>

                    {/* Nếu không có kết quả detection thì hiển thị lời hướng dẫn */}
                    {!detectionResult && (
                        <Box
                            sx={{
                                mt: 4,
                                p: 3,
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                            }}
                        >
                            <Stack spacing={2}>
                                <Typography variant="h6" gutterBottom>
                                    Hướng dẫn sử dụng
                                </Typography>
                                <Box>
                                    <Typography variant="body2" paragraph>
                                        <strong>1. Chọn ảnh:</strong> Tải lên
                                        một ảnh có chứa khuôn mặt
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        <strong>2. Phát hiện:</strong> Nhấn nút
                                        "Phát hiện cảm xúc" để bắt đầu phân tích
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        <strong>3. Xem kết quả:</strong> Hệ
                                        thống sẽ hiển thị các cảm xúc được phát
                                        hiện trên khuôn mặt
                                    </Typography>
                                </Box>
                                <Divider />
                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Lưu ý: Người dùng khách chỉ được phát
                                        hiện tối đa 5 lần. Để sử dụng không giới
                                        hạn, vui lòng đăng ký tài khoản.
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                    )}
                </Stack>
            </Paper>
            <Outlet />
        </Container>
    );
}
