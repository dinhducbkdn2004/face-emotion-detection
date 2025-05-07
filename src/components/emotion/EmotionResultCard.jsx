import React from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    LinearProgress,
    useTheme,
    Avatar,
    Chip,
    Fade,
} from '@mui/material';
import { Mood as MoodIcon } from '@mui/icons-material';

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

/**
 * Component to display emotion analysis results for a face
 */
const EmotionResultCard = ({ face, faceIndex }) => {
    const theme = useTheme();
    const primaryEmotion = face.emotions[0];
    const sortedEmotions = [...face.emotions].sort((a, b) => b.score - a.score);
    const mainColor =
        emotionColors[primaryEmotion.emotion] || theme.palette.primary.main;

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                },
                border: 'none',
                background:
                    theme.palette.mode === 'dark'
                        ? 'linear-gradient(145deg, #1a1a1a, #2d2d2d)'
                        : 'linear-gradient(145deg, #ffffff, #f8f9fa)',
            }}
        >
            <Box
                sx={{
                    height: 8,
                    width: '100%',
                    background: `linear-gradient(90deg, ${mainColor}dd, ${mainColor}99)`,
                }}
            />

            <CardContent sx={{ p: 3 }}>
                <Box
                    sx={{
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                            sx={{
                                bgcolor: `${mainColor}22`,
                                color: mainColor,
                                mr: 2,
                            }}
                        >
                            <MoodIcon />
                        </Avatar>
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{
                                background: `linear-gradient(90deg, ${mainColor}, ${mainColor}99)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Face #{faceIndex + 1}
                        </Typography>
                    </Box>
                    <Chip
                        label={`${Math.round(primaryEmotion.percentage)}%`}
                        size="small"
                        sx={{
                            bgcolor: `${mainColor}22`,
                            color: mainColor,
                            fontWeight: 'bold',
                            borderRadius: '8px',
                        }}
                    />
                </Box>

                <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                    {emotionLabels[primaryEmotion.emotion]}
                </Typography>

                <Box sx={{ mt: 3 }}>
                    {sortedEmotions.map((emotion, index) => (
                        <Fade in={true} timeout={500 + index * 100} key={index}>
                            <Box sx={{ mb: 2 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        mb: 0.5,
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: emotionColors[
                                                emotion.emotion
                                            ],
                                            fontWeight: 'medium',
                                        }}
                                    >
                                        {emotionLabels[emotion.emotion]}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        fontWeight="bold"
                                        sx={{
                                            color:
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(255,255,255,0.9)'
                                                    : 'rgba(0,0,0,0.7)',
                                        }}
                                    >
                                        {Math.round(emotion.percentage)}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={emotion.percentage}
                                    sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        bgcolor:
                                            theme.palette.mode === 'dark'
                                                ? 'rgba(255,255,255,0.05)'
                                                : 'rgba(0,0,0,0.05)',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor:
                                                emotionColors[emotion.emotion],
                                            borderRadius: 4,
                                            background: `linear-gradient(90deg, ${emotionColors[emotion.emotion]}dd, ${emotionColors[emotion.emotion]}99)`,
                                        },
                                    }}
                                />
                            </Box>
                        </Fade>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
};

export default EmotionResultCard;
