import React, { useState } from 'react';
import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    Box,
    Typography,
    Paper,
    Chip,
    LinearProgress,
    useTheme,
    IconButton,
    Fade,
    Avatar,
} from '@mui/material';
import {
    ExpandLess,
    ExpandMore,
    Face as FaceIcon,
    Mood as MoodIcon,
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

const EmotionResultItem = ({ face, faceIndex }) => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();
    const primaryEmotion = face.emotions[0];
    const mainColor =
        emotionColors[primaryEmotion.emotion] || theme.palette.primary.main;
    const sortedEmotions = [...face.emotions].sort((a, b) => b.score - a.score);

    const handleClick = () => {
        setOpen(!open);
    };

    return (
        <Fade in={true} timeout={200}>
            <Box sx={{ mb: 1 }}>
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
                                bgcolor: `${mainColor}22`,
                                color: mainColor,
                            }}
                        >
                            <FaceIcon />
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
                                    Face #{faceIndex + 1}
                                </Typography>
                                <Chip
                                    size="small"
                                    label={
                                        emotionLabels[primaryEmotion.emotion]
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
                                            theme.palette.mode === 'dark'
                                                ? 'rgba(255,255,255,0.05)'
                                                : 'rgba(0,0,0,0.05)',
                                    }}
                                />
                            </Box>
                        }
                    />
                    {open ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>

                <Collapse in={open} timeout="auto" unmountOnExit>
                    <Box
                        sx={{
                            pl: 9,
                            pr: 2,
                            pb: 2,
                        }}
                    >
                        {sortedEmotions.map((emotion, index) => (
                            <Box key={index} sx={{ mb: 1.5 }}>
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
                                        fontWeight="medium"
                                    >
                                        {Math.round(emotion.percentage)}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={emotion.percentage}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        bgcolor:
                                            theme.palette.mode === 'dark'
                                                ? 'rgba(255,255,255,0.05)'
                                                : 'rgba(0,0,0,0.05)',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor:
                                                emotionColors[emotion.emotion],
                                            borderRadius: 3,
                                            background: `linear-gradient(90deg, ${emotionColors[emotion.emotion]}dd, ${emotionColors[emotion.emotion]}99)`,
                                        },
                                    }}
                                />
                            </Box>
                        ))}
                    </Box>
                </Collapse>
            </Box>
        </Fade>
    );
};

const EmotionResultsList = ({ faces }) => {
    return (
        <List sx={{ width: '100%', bgcolor: 'transparent' }}>
            {faces.map((face, index) => (
                <EmotionResultItem key={index} face={face} faceIndex={index} />
            ))}
        </List>
    );
};

export default EmotionResultsList;
