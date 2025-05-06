import { useState } from 'react';
import {
    Box,
    Grid,
    Typography,
    Alert,
    Tooltip,
    useTheme,
    useMediaQuery,
    Zoom,
} from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import EmotionResultCard from './EmotionResultCard';
import EmotionResultSkeleton from './EmotionResultSkeleton';

/**
 * Component hiển thị kết quả phân tích cảm xúc
 * @param {Object} props - Props của component
 * @param {Object} props.result - Kết quả phát hiện cảm xúc
 * @param {boolean} props.loading - Trạng thái đang tải
 * @param {Object} props.error - Lỗi (nếu có)
 */
const EmotionResults = ({ result, loading, error }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (loading) {
        return <EmotionResultSkeleton />;
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ borderRadius: 2, mt: 2 }}>
                Có lỗi xảy ra khi phân tích cảm xúc. Vui lòng thử lại.
            </Alert>
        );
    }

    if (!result) {
        return null;
    }

    // Trường hợp không phát hiện khuôn mặt
    if (!result.detection_results.face_detected) {
        return (
            <Alert severity="info" sx={{ borderRadius: 2, mt: 2 }}>
                Không phát hiện khuôn mặt trong ảnh này
            </Alert>
        );
    }

    return (
        <Box>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                }}
            >
                <Typography variant="body1" fontWeight="medium">
                    Đã phát hiện {result.detection_results.faces.length} khuôn mặt
                </Typography>
                <Tooltip title="Kết quả đã được phân tích dựa trên các đặc điểm khuôn mặt">
                    <InfoOutlined
                        fontSize="small"
                        sx={{
                            ml: 1,
                            color: 'text.secondary',
                            cursor: 'help',
                        }}
                    />
                </Tooltip>
            </Box>

            <Grid container spacing={2}>
                {result.detection_results.faces.map((face, faceIndex) => (
                    <Grid
                        item
                        xs={12}
                        sm={isMobile ? 12 : 6}
                        key={faceIndex}
                    >
                        <Zoom
                            in={true}
                            style={{
                                transitionDelay: `${100 * faceIndex}ms`,
                            }}
                        >
                            <Box>
                                <EmotionResultCard 
                                    face={face} 
                                    faceIndex={faceIndex} 
                                />
                            </Box>
                        </Zoom>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default EmotionResults; 