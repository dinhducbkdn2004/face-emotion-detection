import React from 'react';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    Chip,
    IconButton,
    Tooltip,
    useTheme,
    Stack,
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Delete as DeleteIcon,
    Face as FaceIcon,
    AccessTime as AccessTimeIcon,
    ImageNotSupported,
} from '@mui/icons-material';
import { format } from 'date-fns';

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

const HistoryItem = ({ item, onDelete, onView, viewMode = 'grid' }) => {
    const theme = useTheme();

    const mainEmotion = item.main_emotion?.toLowerCase() || 'neutral';
    const emotionColor =
        emotionColors[mainEmotion] || theme.palette.primary.main;
    const faceCount = item.face_count || 1;

    return (
        <Card
            variant="outlined"
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: viewMode === 'list' ? 'row' : 'column',
                borderRadius: 3,
                overflow: 'hidden',
                borderColor: 'divider',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 4px 20px 0 ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.15)'}`,
                    borderColor: emotionColor,
                },
                userSelect: 'none',
                cursor: 'default',
            }}
        >
            {/* Image Container */}
            <Box
                sx={{
                    position: 'relative',
                    width: viewMode === 'list' ? 200 : '100%',
                    height: viewMode === 'list' ? 200 : 200,
                    bgcolor: 'black',
                    flexShrink: 0,
                }}
            >
                <Box
                    onClick={() => onView(item)}
                    sx={{
                        width: '100%',
                        height: '100%',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    {item.image_url ? (
                        <CardMedia
                            component="img"
                            image={item.image_url}
                            alt="Detection result"
                            sx={{
                                height: '100%',
                                width: '100%',
                                objectFit: 'cover',
                                bgcolor:
                                    theme.palette.mode === 'dark'
                                        ? theme.palette.background.paper
                                        : theme.palette.background.default,
                            }}
                        />
                    ) : (
                        <ImageNotSupported
                            sx={{
                                fontSize: 60,
                                color: 'text.secondary',
                                opacity: 0.5,
                            }}
                        />
                    )}
                </Box>

                {/* Face count badge */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        bgcolor:
                            theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.1)'
                                : 'rgba(0,0,0,0.1)',
                        borderRadius: 2,
                        px: 1,
                        py: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                    }}
                >
                    <FaceIcon sx={{ color: 'white', fontSize: '1rem' }} />
                    <Typography
                        variant="caption"
                        sx={{ color: 'white', fontWeight: 'medium' }}
                    >
                        {faceCount}
                    </Typography>
                </Box>

                {/* Action buttons */}
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                    }}
                >
                    <Tooltip title="View Details">
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onView(item);
                            }}
                            sx={{
                                bgcolor:
                                    theme.palette.mode === 'dark'
                                        ? theme.palette.background.paper
                                        : theme.palette.background.default,
                                '&:hover': {
                                    bgcolor:
                                        theme.palette.mode === 'dark'
                                            ? theme.palette.background.paper
                                            : theme.palette.background.default,
                                },
                            }}
                        >
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(item.detection_id);
                            }}
                            sx={{
                                bgcolor:
                                    theme.palette.mode === 'dark'
                                        ? theme.palette.background.paper
                                        : theme.palette.background.default,
                                '&:hover': {
                                    bgcolor:
                                        theme.palette.mode === 'dark'
                                            ? theme.palette.background.paper
                                            : theme.palette.background.default,
                                },
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>

            <CardContent
                sx={{
                    flexGrow: 1,
                    p: 2,
                    '&:last-child': { pb: 2 },
                }}
            >
                <Stack spacing={1.5}>
                    {/* Timestamp */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon
                            fontSize="small"
                            sx={{ color: theme.palette.primary.main }}
                        />
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                display: 'block',
                                fontWeight: 'medium',
                            }}
                        >
                            {format(
                                new Date(item.timestamp),
                                'dd/MM/yyyy HH:mm:ss'
                            )}
                        </Typography>
                    </Box>

                    {/* Main emotion */}
                    <Box>
                        <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom
                            sx={{ mb: 0.5 }}
                        >
                            Main Emotion
                        </Typography>
                        <Chip
                            label={
                                mainEmotion.charAt(0).toUpperCase() +
                                mainEmotion.slice(1)
                            }
                            size="small"
                            sx={{
                                bgcolor: `${emotionColor}15`,
                                color: emotionColor,
                                fontWeight: 'medium',
                                borderRadius: 1.5,
                            }}
                        />
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default HistoryItem;
