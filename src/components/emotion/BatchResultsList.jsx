import React, { useState } from 'react';
import {
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    Box,
    Typography,
    Chip,
    LinearProgress,
    useTheme,
    Avatar,
    Fade,
    Alert,
} from '@mui/material';
import {
    ExpandLess,
    ExpandMore,
    Image as ImageIcon,
    Error as ErrorIcon,
    CheckCircle,
    Info as InfoIcon,
} from '@mui/icons-material';

// Emotion color mapping with updated modern colors
const emotionColors = {
    happy: '#00C853', // Bright green
    sad: '#5C6BC0', // Indigo
    angry: '#FF5252', // Red
    surprise: '#FFB300', // Amber
    fear: '#8E24AA', // Purple
    disgust: '#795548', // Brown
    neutral: '#78909C', // Blue Grey
    contempt: '#795548', // Brown
};

// Map emotion labels to English
const emotionLabels = {
    happy: 'Happy',
    sad: 'Sad',
    angry: 'Angry',
    surprise: 'Surprised',
    fear: 'Fearful',
    disgust: 'Disgusted',
    neutral: 'Neutral',
    contempt: 'Contempt',
};

const BatchResultItem = ({ result, index }) => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    const handleClick = () => {
        setOpen(!open);
    };

    // Handle error case
    if (result.status === 'error') {
        return (
            <Alert severity="error" sx={{ mb: 2 }} icon={<ErrorIcon />}>
                <Typography variant="subtitle2">
                    {result.filename || `Image #${index + 1}`}
                </Typography>
                <Typography variant="body2">
                    {result.errorMessage || 'Error analyzing emotions'}
                </Typography>
            </Alert>
        );
    }

    // Handle case when no face is detected
    if (!result.detection_results?.face_detected) {
        return (
            <Alert severity="info" sx={{ mb: 2 }} icon={<InfoIcon />}>
                <Typography variant="subtitle2">
                    {result.filename || `Image #${index + 1}`}
                </Typography>
                <Typography variant="body2">
                    No faces detected in this image
                </Typography>
            </Alert>
        );
    }

    // Get faces data
    const faces = result.detection_results.faces;
    const faceCount = faces.length;

    return (
        <Fade in={true} timeout={200}>
            <Box sx={{ mb: 2 }}>
                <ListItemButton
                    onClick={handleClick}
                    sx={{
                        borderRadius: 2,
                        mb: 1,
                        bgcolor:
                            theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.03)'
                                : 'rgba(0,0,0,0.02)',
                        '&:hover': {
                            bgcolor:
                                theme.palette.mode === 'dark'
                                    ? 'rgba(255,255,255,0.08)'
                                    : 'rgba(0,0,0,0.05)',
                        },
                    }}
                >
                    <ListItemIcon>
                        <Avatar
                            sx={{
                                bgcolor: theme.palette.primary.main + '22',
                                color: theme.palette.primary.main,
                            }}
                        >
                            <ImageIcon />
                        </Avatar>
                    </ListItemIcon>
                    <ListItemText
                        primary={
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <Typography
                                    variant="subtitle1"
                                    fontWeight="medium"
                                >
                                    {result.filename || `Image #${index + 1}`}
                                </Typography>
                                <Chip
                                    size="small"
                                    icon={<CheckCircle sx={{ fontSize: 16 }} />}
                                    label={`${faceCount} face${faceCount > 1 ? 's' : ''} detected`}
                                    color="primary"
                                    variant="outlined"
                                    sx={{ borderRadius: 2 }}
                                />
                            </Box>
                        }
                    />
                    {open ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>

                <Collapse in={open} timeout="auto" unmountOnExit>
                    <Box sx={{ pl: 9, pr: 2, pb: 2 }}>
                        {faces.map((face, faceIndex) => {
                            const primaryEmotion = face.emotions[0];
                            const mainColor =
                                emotionColors[primaryEmotion.emotion] ||
                                theme.palette.primary.main;
                            const sortedEmotions = [...face.emotions].sort(
                                (a, b) => b.score - a.score
                            );

                            return (
                                <Box key={faceIndex} sx={{ mb: 3 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            mb: 2,
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle2"
                                            fontWeight="medium"
                                        >
                                            Face #{faceIndex + 1}
                                        </Typography>
                                        <Chip
                                            size="small"
                                            label={
                                                emotionLabels[
                                                    primaryEmotion.emotion
                                                ]
                                            }
                                            sx={{
                                                bgcolor: `${mainColor}22`,
                                                color: mainColor,
                                                fontWeight: 'medium',
                                            }}
                                        />
                                        <Chip
                                            size="small"
                                            label={`${Math.round(primaryEmotion.percentage)}%`}
                                            sx={{
                                                bgcolor:
                                                    theme.palette.mode ===
                                                    'dark'
                                                        ? 'rgba(255,255,255,0.05)'
                                                        : 'rgba(0,0,0,0.05)',
                                            }}
                                        />
                                    </Box>

                                    {sortedEmotions.map(
                                        (emotion, emotionIndex) => (
                                            <Box
                                                key={emotionIndex}
                                                sx={{ mb: 1 }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent:
                                                            'space-between',
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: emotionColors[
                                                                emotion.emotion
                                                            ],
                                                            fontWeight:
                                                                'medium',
                                                        }}
                                                    >
                                                        {
                                                            emotionLabels[
                                                                emotion.emotion
                                                            ]
                                                        }
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight="medium"
                                                    >
                                                        {Math.round(
                                                            emotion.percentage
                                                        )}
                                                        %
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={emotion.percentage}
                                                    sx={{
                                                        height: 6,
                                                        borderRadius: 3,
                                                        bgcolor:
                                                            theme.palette
                                                                .mode === 'dark'
                                                                ? 'rgba(255,255,255,0.05)'
                                                                : 'rgba(0,0,0,0.05)',
                                                        '& .MuiLinearProgress-bar':
                                                            {
                                                                bgcolor:
                                                                    emotionColors[
                                                                        emotion
                                                                            .emotion
                                                                    ],
                                                                borderRadius: 3,
                                                                background: `linear-gradient(90deg, ${emotionColors[emotion.emotion]}dd, ${emotionColors[emotion.emotion]}99)`,
                                                            },
                                                    }}
                                                />
                                            </Box>
                                        )
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                </Collapse>
            </Box>
        </Fade>
    );
};

const BatchResultsList = ({ results }) => {
    return (
        <List sx={{ width: '100%', bgcolor: 'transparent' }}>
            {results.map((result, index) => (
                <BatchResultItem key={index} result={result} index={index} />
            ))}
        </List>
    );
};

export default BatchResultsList;
