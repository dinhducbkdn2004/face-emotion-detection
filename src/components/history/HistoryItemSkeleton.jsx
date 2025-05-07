import React from 'react';
import { Card, CardContent, Skeleton, Box, useTheme } from '@mui/material';

const HistoryItemSkeleton = () => {
    const theme = useTheme();

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor:
                    theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,0,0,0.1)',
                height: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
            }}
        >
            <Skeleton
                variant="rectangular"
                width={80}
                height={80}
                animation="wave"
                sx={{
                    bgcolor:
                        theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(0,0,0,0.05)',
                    flexShrink: 0,
                }}
            />

            <CardContent sx={{ p: 1.5, flex: 1 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        mb: 0.5,
                    }}
                >
                    <Skeleton
                        variant="circular"
                        width={16}
                        height={16}
                        animation="wave"
                    />
                    <Skeleton
                        variant="text"
                        width={60}
                        height={20}
                        animation="wave"
                    />
                </Box>
                <Skeleton
                    variant="text"
                    width={40}
                    height={16}
                    animation="wave"
                    sx={{ opacity: 0.5 }}
                />
            </CardContent>

            <Box sx={{ display: 'flex', gap: 0.5, pr: 1, pl: 0.5 }}>
                <Skeleton
                    variant="circular"
                    width={24}
                    height={24}
                    animation="wave"
                />
                <Skeleton
                    variant="circular"
                    width={24}
                    height={24}
                    animation="wave"
                />
            </Box>
        </Card>
    );
};

export default HistoryItemSkeleton;
