import React from 'react';
import {
    Box,
    Skeleton,
    Card,
    useTheme,
    useMediaQuery,
    CardContent,
    Stack,
} from '@mui/material';

const HistoryItemSkeleton = ({ viewMode = 'grid' }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Card
            variant="outlined"
            sx={{
                height: '100%',
                width: '100%',
                maxWidth: viewMode === 'list' ? '100%' : '280px',
                display: 'flex',
                flexDirection: viewMode === 'list' ? 'row' : 'column',
                borderRadius: 3,
                overflow: 'hidden',
                borderColor: theme.palette.divider,
                position: 'relative',
            }}
        >
            {/* Image area */}
            <Box
                sx={{
                    position: 'relative',
                    width:
                        viewMode === 'list'
                            ? isMobile
                                ? '120px'
                                : '200px'
                            : '100%',
                    height:
                        viewMode === 'list'
                            ? isMobile
                                ? '120px'
                                : '180px'
                            : isMobile
                              ? '160px'
                              : '180px',
                    flexShrink: 0,
                }}
            >
                <Skeleton
                    variant="rectangular"
                    width="100%"
                    height="100%"
                    animation="wave"
                    sx={{
                        bgcolor: theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(0,0,0,0.04)',
                    }}
                />
                
                {/* Top badges skeleton */}
                <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                    <Skeleton 
                        variant="rounded" 
                        width={isMobile ? 40 : 50} 
                        height={isMobile ? 18 : 24} 
                        animation="wave"
                    />
                </Box>
                
                {/* Action buttons skeleton */}
                <Stack 
                    direction="row" 
                    spacing={0.5} 
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                    <Skeleton 
                        variant="circular" 
                        width={isMobile ? 24 : 28} 
                        height={isMobile ? 24 : 28} 
                        animation="wave" 
                    />
                    <Skeleton 
                        variant="circular" 
                        width={isMobile ? 24 : 28} 
                        height={isMobile ? 24 : 28} 
                        animation="wave" 
                    />
                </Stack>
            </Box>

            {/* Content area */}
            <CardContent
                sx={{
                    p: viewMode === 'grid' ? { xs: 1.5, sm: 2 } : { xs: 1, sm: 2 },
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: viewMode === 'list' ? 'center' : 'space-between',
                    '&:last-child': { pb: viewMode === 'list' ? 1 : 2 },
                    overflow: 'hidden',
                }}
            >
                {viewMode === 'list' ? (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            overflow: 'hidden',
                        }}
                    >
                        <Box sx={{ flex: 1, overflow: 'hidden', mr: 1 }}>
                            <Skeleton
                                variant="text"
                                width="70%"
                                height={isMobile ? 20 : 24}
                                animation="wave"
                                sx={{ mb: 1 }}
                            />
                            <Skeleton
                                variant="text"
                                width="40%"
                                height={16}
                                animation="wave"
                            />
                            
                            {/* Date skeleton */}
                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                                <Skeleton
                                    variant="circular"
                                    width={16}
                                    height={16}
                                    animation="wave"
                                    sx={{ mr: 0.5 }}
                                />
                                <Skeleton
                                    variant="text"
                                    width={80}
                                    height={16}
                                    animation="wave"
                                />
                            </Box>
                        </Box>
                        
                        {/* Chips skeleton */}
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
                            <Skeleton
                                variant="rounded"
                                width={60}
                                height={24}
                                animation="wave"
                            />
                        </Stack>
                    </Box>
                ) : (
                    <Box sx={{ overflow: 'hidden' }}>
                        <Skeleton
                            variant="text"
                            width="85%"
                            height={isMobile ? 20 : 24}
                            animation="wave"
                            sx={{ mb: 1 }}
                        />
                        
                        {/* Date skeleton */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Skeleton
                                variant="circular"
                                width={16}
                                height={16}
                                animation="wave"
                                sx={{ mr: 0.5 }}
                            />
                            <Skeleton
                                variant="text"
                                width={80}
                                height={16}
                                animation="wave"
                            />
                        </Box>
                        
                        {/* Emotion chip skeleton */}
                        <Skeleton
                            variant="rounded"
                            width={70}
                            height={28}
                            animation="wave"
                        />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default HistoryItemSkeleton;
