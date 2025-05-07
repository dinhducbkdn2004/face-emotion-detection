import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    useTheme,
    Alert,
} from '@mui/material';
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
                    <FaceBoxOverlay imageUrl={imageUrl} faces={faces} />
                )}

                <Grid container spacing={2}>
                    {faces.map((face, idx) => (
                        <Grid
                            item
                            xs={12}
                            md={6}
                            lg={4}
                            key={`${result.detection_id || result.filename}-face-${idx}`}
                        >
                            <EmotionResultCard face={face} faceIndex={idx} />
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default BatchResultCard;
