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
    useMediaQuery,
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Delete as DeleteIcon,
    Face as FaceIcon,
    AccessTime as AccessTimeIcon,
    ImageNotSupported,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { alpha } from '@mui/material/styles';

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

// Hàm tính toán main emotion từ mảng emotions
const calculateMainEmotion = (faces) => {
    if (!faces || faces.length === 0) return 'neutral';

    // Lấy emotions của khuôn mặt đầu tiên
    const emotions = faces[0].emotions;
    if (!emotions || emotions.length === 0) return 'neutral';

    // Tìm emotion có percentage cao nhất
    const mainEmotion = emotions.reduce((prev, current) => {
        return prev.percentage > current.percentage ? prev : current;
    });

    return mainEmotion.emotion;
};

const HistoryItem = ({ item, onDelete, onView, viewMode = 'grid' }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Tính toán main emotion từ detection_results
    const mainEmotion =
        calculateMainEmotion(item?.detection_results?.faces)?.toLowerCase() ||
        'neutral';
    const emotionColor =
        emotionColors[mainEmotion] || theme.palette.primary.main;
    const faceCount = item?.detection_results?.faces?.length || 0;

    return (
        <Card
            variant="outlined"
            sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: viewMode === 'list' ? 'row' : 'column',
                borderRadius: 3,
                overflow: 'hidden',
                borderColor: 'divider',
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: `0 4px 20px 0 ${
                        theme.palette.mode === 'dark'
                            ? 'rgba(0,0,0,0.3)'
                            : 'rgba(0,0,0,0.15)'
                    }`,
                    borderColor: emotionColor,
                    transform: 'translateY(-2px)',
                },
                userSelect: 'none',
                cursor: 'default',
                maxWidth:
                    viewMode === 'list' ? '100%' : isMobile ? '100%' : '320px',
            }}
        >
            {/* Image Container */}
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
                                : '200px'
                            : isMobile
                            ? '160px'
                            : '200px',
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
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            '& img': {
                                transform: 'scale(1.05)',
                                filter: 'brightness(1.1)',
                            },
                        },
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
                                transition:
                                    'transform 0.3s ease, filter 0.3s ease',
                            }}
                        />
                    ) : (
                        <ImageNotSupported
                            sx={{
                                fontSize: isMobile ? 40 : 60,
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
                        top: 8,
                        left: 8,
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
                    <FaceIcon
                        sx={{
                            color: 'white',
                            fontSize: isMobile ? '0.8rem' : '1rem',
                        }}
                    />
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'white',
                            fontWeight: 'medium',
                            fontSize: isMobile ? '0.7rem' : '0.8rem',
                        }}
                    >
                        {faceCount}
                    </Typography>
                </Box>

                {/* Action buttons */}
                <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                    }}
                >
                    <Tooltip title="View Details">
                        <IconButton
                            size={isMobile ? 'small' : 'medium'}
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
                                            ? alpha(
                                                  theme.palette.primary.main,
                                                  0.2
                                              )
                                            : alpha(
                                                  theme.palette.primary.main,
                                                  0.1
                                              ),
                                    transform: 'scale(1.1)',
                                },
                                padding: isMobile ? '4px' : '8px',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <VisibilityIcon
                                fontSize={isMobile ? 'small' : 'small'}
                                sx={{ color: theme.palette.primary.main }}
                            />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton
                            size={isMobile ? 'small' : 'medium'}
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
                                            ? alpha(
                                                  theme.palette.error.main,
                                                  0.2
                                              )
                                            : alpha(
                                                  theme.palette.error.main,
                                                  0.1
                                              ),
                                    transform: 'scale(1.1)',
                                },
                                padding: isMobile ? '4px' : '8px',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <DeleteIcon
                                fontSize={isMobile ? 'small' : 'small'}
                                sx={{ color: theme.palette.error.main }}
                            />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>

            <CardContent
                sx={{
                    flexGrow: 1,
                    p: isMobile ? 1.5 : 2,
                    '&:last-child': { pb: isMobile ? 1.5 : 2 },
                }}
            >
                <Stack spacing={1.5}>
                    {/* Timestamp */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon
                            fontSize="small"
                            sx={{
                                color: theme.palette.primary.main,
                                fontSize: isMobile ? '0.9rem' : '1.25rem',
                            }}
                        />
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                display: 'block',
                                fontWeight: 'medium',
                                fontSize: isMobile ? '0.7rem' : '0.8rem',
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
                            sx={{
                                mb: 0.5,
                                fontSize: isMobile ? '0.75rem' : '0.8rem',
                            }}
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
                                height: isMobile ? '22px' : '28px',
                                '& .MuiChip-label': {
                                    px: 1,
                                    fontSize: isMobile ? '0.65rem' : '0.75rem',
                                },
                            }}
                        />
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default HistoryItem;
