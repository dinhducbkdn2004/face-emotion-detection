import React from 'react';
import { Box, Skeleton, Card, useTheme, useMediaQuery } from '@mui/material';

const HistoryItemSkeleton = ({ viewMode = 'grid' }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Card
            variant="outlined"
            sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                overflow: 'hidden',
                borderColor: theme.palette.divider,
                maxWidth: isMobile ? '100%' : 'auto',
            }}
        >
            {/* Image area - luôn nằm trên cùng */}
            <Skeleton
                variant="rectangular"
                width="100%"
                height={isMobile ? 160 : 200}
            />

            {/* Content area - luôn nằm dưới */}
            <Box
                sx={{
                    p: isMobile ? 1.5 : 2,
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                }}
            >
                {/* Nếu ở chế độ list, hiển thị theo kiểu list */}
                {viewMode === 'list' && !isMobile ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ flex: 1 }}>
                            <Skeleton width="80%" />
                            <Skeleton width="50%" />
                        </Box>
                        <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
                            <Skeleton
                                variant="circular"
                                width={30}
                                height={30}
                            />
                            <Skeleton
                                variant="circular"
                                width={30}
                                height={30}
                            />
                        </Box>
                    </Box>
                ) : (
                    // Hiển thị theo kiểu grid hoặc mobile list
                    <Box sx={{ pt: 0.5 }}>
                        <Skeleton width="100%" />
                        <Skeleton width="60%" />
                    </Box>
                )}
            </Box>
        </Card>
    );
};

export default HistoryItemSkeleton;
