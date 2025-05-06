import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Skeleton,
    useTheme,
} from '@mui/material';

/**
 * Component hiển thị skeleton loading cho kết quả phân tích cảm xúc
 */
const EmotionResultSkeleton = () => {
    const theme = useTheme();

    const FaceSkeleton = () => (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: theme.shadows[1],
                mb: 2,
            }}
        >
            <Box
                sx={{
                    height: 6,
                    width: '100%',
                    bgcolor: theme.palette.primary.main,
                }}
            />

            <CardContent sx={{ p: 2 }}>
                <Box sx={{ mb: 2 }}>
                    <Skeleton variant="text" width={120} height={24} />
                    <Skeleton variant="text" width={180} height={32} />
                </Box>

                <Box sx={{ mt: 3 }}>
                    {[...Array(5)].map((_, i) => (
                        <Box key={i} sx={{ mb: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Skeleton variant="text" width={100} height={20} />
                                <Skeleton variant="text" width={40} height={20} />
                            </Box>
                            <Skeleton
                                variant="rectangular"
                                height={8}
                                width="100%"
                                sx={{ borderRadius: 4 }}
                            />
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Box>
            <Skeleton variant="text" width={200} height={24} sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <FaceSkeleton />
                <FaceSkeleton />
            </Box>
        </Box>
    );
};

export default EmotionResultSkeleton;
