import React, { useState, useRef } from 'react';
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
    Divider,
} from '@mui/material';
import {
    ExpandLess,
    ExpandMore,
    Image as ImageIcon,
    Error as ErrorIcon,
    CheckCircle,
    Info as InfoIcon,
    Face as FaceIcon,
} from '@mui/icons-material';
import FaceBoxOverlay from './FaceBoxOverlay';

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
    const [expandedFaces, setExpandedFaces] = useState({});
    const facesListRef = useRef({});
    const [imageUrl, setImageUrl] = useState(null);

    // Toggle main result
    const handleClick = () => {
        setOpen(!open);
    };

    // Toggle face details
    const handleFaceClick = (faceIndex) => {
        setExpandedFaces((prev) => ({
            ...prev,
            [faceIndex]: !prev[faceIndex],
        }));
    };

    // Scroll to face when clicking on bounding box
    const scrollToFace = (faceIndex) => {
        if (facesListRef.current[faceIndex]) {
            facesListRef.current[faceIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });

            // Tự động mở rộng nếu chưa mở
            if (!expandedFaces[faceIndex]) {
                setExpandedFaces((prev) => ({
                    ...prev,
                    [faceIndex]: true,
                }));
            }
        }
    };

    // Set image URL
    React.useEffect(() => {
        if (result.file instanceof File) {
            const url = URL.createObjectURL(result.file);
            setImageUrl(url);
            return () => URL.revokeObjectURL(url);
        } else if (result.image_url) {
            setImageUrl(result.image_url);
        }
    }, [result.file, result.image_url]);

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
                        {/* Thêm FaceBoxOverlay để hiển thị bounding box */}
                        {imageUrl && (
                            <FaceBoxOverlay
                                imageUrl={imageUrl}
                                faces={faces}
                                onFaceClick={scrollToFace}
                            />
                        )}

                        {/* Danh sách khuôn mặt dạng list */}
                        <List
                            sx={{
                                width: '100%',
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: theme.palette.divider,
                                mt: 2,
                                mb: 2,
                            }}
                        >
                            {faces.map((face, faceIndex) => {
                                const primaryEmotion = face.emotions[0];
                                const primaryEmotionColor =
                                    emotionColors[primaryEmotion.emotion] ||
                                    theme.palette.primary.main;
                                const isExpanded =
                                    expandedFaces[faceIndex] || false;

                                return (
                                    <Box
                                        key={faceIndex}
                                        ref={(el) =>
                                            (facesListRef.current[faceIndex] =
                                                el)
                                        }
                                    >
                                        <ListItemButton
                                            onClick={() =>
                                                handleFaceClick(faceIndex)
                                            }
                                            sx={{
                                                borderLeft: `4px solid ${primaryEmotionColor}`,
                                                transition: 'all 0.2s ease',
                                                borderRadius: isExpanded
                                                    ? '8px 8px 0 0'
                                                    : 2,
                                                mb: isExpanded ? 0 : 1,
                                            }}
                                        >
                                            <ListItemIcon>
                                                <Box
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent:
                                                            'center',
                                                        bgcolor: `${primaryEmotionColor}15`,
                                                        color: primaryEmotionColor,
                                                    }}
                                                >
                                                    <FaceIcon />
                                                </Box>
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Typography
                                                        variant="subtitle1"
                                                        fontWeight="medium"
                                                    >
                                                        Face #{faceIndex + 1}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: primaryEmotionColor,
                                                            fontWeight:
                                                                'medium',
                                                        }}
                                                    >
                                                        {
                                                            emotionLabels[
                                                                primaryEmotion
                                                                    .emotion
                                                            ]
                                                        }{' '}
                                                        (
                                                        {primaryEmotion.percentage.toFixed(
                                                            1
                                                        )}
                                                        %)
                                                    </Typography>
                                                }
                                            />
                                            {isExpanded ? (
                                                <ExpandLess />
                                            ) : (
                                                <ExpandMore />
                                            )}
                                        </ListItemButton>
                                        <Collapse
                                            in={isExpanded}
                                            timeout="auto"
                                            unmountOnExit
                                        >
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    bgcolor:
                                                        theme.palette.mode ===
                                                        'dark'
                                                            ? 'rgba(255,255,255,0.03)'
                                                            : 'rgba(0,0,0,0.01)',
                                                    borderRadius: '0 0 8px 8px',
                                                    mb: 1,
                                                }}
                                            >
                                                {face.emotions.map(
                                                    (emotion, emotionIndex) => (
                                                        <Box
                                                            key={emotionIndex}
                                                            sx={{ mb: 1 }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    display:
                                                                        'flex',
                                                                    justifyContent:
                                                                        'space-between',
                                                                    mb: 0.5,
                                                                }}
                                                            >
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        color: emotionColors[
                                                                            emotion
                                                                                .emotion
                                                                        ],
                                                                        fontWeight:
                                                                            'medium',
                                                                    }}
                                                                >
                                                                    {
                                                                        emotionLabels[
                                                                            emotion
                                                                                .emotion
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
                                                                value={
                                                                    emotion.percentage
                                                                }
                                                                sx={{
                                                                    height: 6,
                                                                    borderRadius: 3,
                                                                    bgcolor:
                                                                        theme
                                                                            .palette
                                                                            .mode ===
                                                                        'dark'
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
                                        </Collapse>
                                    </Box>
                                );
                            })}
                        </List>
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
