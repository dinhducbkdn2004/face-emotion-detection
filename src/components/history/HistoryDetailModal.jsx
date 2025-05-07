import React, { useState, useEffect } from 'react';
import {
    Modal,
    Box,
    Typography,
    IconButton,
    Card,
    CardMedia,
    List,
    ListSubheader,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    Grid,
    CardContent,
    Chip,
    Button,
    Skeleton,
    Divider,
    Alert,
    LinearProgress,
    useTheme,
    useMediaQuery,
    Fade,
    Backdrop,
    Tooltip,
} from '@mui/material';
import {
    Close as CloseIcon,
    Mood as MoodIcon,
    AccessTime as AccessTimeIcon,
    Face as FaceIcon,
    Delete as DeleteIcon,
    ImageNotSupported,
    ArrowBack as ArrowBackIcon,
    SentimentSatisfiedAlt,
    ExpandLess,
    ExpandMore,
} from '@mui/icons-material';
import { format } from 'date-fns';
import useApi from '../../hooks/useApi';
import { getEmotionDetectionById } from '../../services/emotionService';
import ConfirmDeleteModal from './ConfirmDeleteModal';

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

const HistoryDetailModal = ({ open, onClose, item, onDelete }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isSmall = useMediaQuery(theme.breakpoints.down('md'));

    // State for face details expansion
    const [expandedFaces, setExpandedFaces] = useState({});
    // State for delete confirmation
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    // Use API hook to fetch detailed data
    const [fetchDetail, detailData, loading, error] = useApi(
        getEmotionDetectionById
    );

    // Fetch detailed data when modal opens
    useEffect(() => {
        if (open && item?.detection_id) {
            fetchDetail(item.detection_id);
            setExpandedFaces({}); // Reset expanded state
        }
    }, [open, item?.detection_id, fetchDetail]);

    // Handle delete confirmation
    const handleDeleteClick = () => {
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = () => {
        setDeleteConfirmOpen(false);
        if (onDelete) {
            onDelete(item?.detection_id);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
    };

    // Toggle face details
    const handleFaceClick = (faceIndex) => {
        setExpandedFaces((prev) => ({
            ...prev,
            [faceIndex]: !prev[faceIndex],
        }));
    };

    // Render skeleton loading
    const renderSkeleton = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
                <Grid container spacing={2}>
                    {[0, 1].map((item) => (
                        <Grid item xs={12} sm={6} key={item}>
                            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                <CardContent>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            mb: 2,
                                        }}
                                    >
                                        <Skeleton
                                            variant="circular"
                                            width={40}
                                            height={40}
                                            sx={{ mr: 1.5 }}
                                        />
                                        <Box>
                                            <Skeleton
                                                variant="text"
                                                width={100}
                                            />
                                            <Skeleton
                                                variant="text"
                                                width={80}
                                            />
                                        </Box>
                                    </Box>
                                    {[0, 1, 2].map((i) => (
                                        <Box key={i} sx={{ mb: 1.5 }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    mb: 0.5,
                                                }}
                                            >
                                                <Skeleton
                                                    variant="text"
                                                    width={80}
                                                />
                                                <Skeleton
                                                    variant="text"
                                                    width={40}
                                                />
                                            </Box>
                                            <Skeleton
                                                variant="rectangular"
                                                height={6}
                                                sx={{ borderRadius: 3 }}
                                            />
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Grid>
        </Grid>
    );

    // Render emotion analysis results
    const renderEmotionResults = () => {
        if (!detailData?.detection_results?.face_detected) {
            return (
                <Alert
                    severity="info"
                    sx={{
                        borderRadius: 2,
                        mt: 2,
                        '& .MuiAlert-icon': {
                            fontSize: '2rem',
                        },
                    }}
                    icon={<SentimentSatisfiedAlt sx={{ fontSize: '2rem' }} />}
                >
                    No faces detected in this image
                </Alert>
            );
        }

        return (
            <List
                sx={{
                    width: '100%',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    '& .MuiListItemButton-root': {
                        borderRadius: 2,
                        mb: 1,
                        '&:last-child': {
                            mb: 0,
                        },
                    },
                }}
                component="nav"
                aria-labelledby="emotion-detection-results"
            >
                {detailData.detection_results.faces.map((face, faceIndex) => {
                    const primaryEmotion = face.emotions[0];
                    const primaryEmotionColor =
                        emotionColors[primaryEmotion.emotion] ||
                        theme.palette.primary.main;
                    const isExpanded = expandedFaces[faceIndex] || false;

                    return (
                        <Box key={faceIndex}>
                            <ListItemButton
                                onClick={() => handleFaceClick(faceIndex)}
                                sx={{
                                    bgcolor:
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(255,255,255,0.05)'
                                            : 'rgba(0,0,0,0.02)',
                                    borderLeft: `4px solid ${primaryEmotionColor}`,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor:
                                            theme.palette.mode === 'dark'
                                                ? 'rgba(255,255,255,0.08)'
                                                : 'rgba(0,0,0,0.04)',
                                    },
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
                                            justifyContent: 'center',
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
                                                fontWeight: 'medium',
                                            }}
                                        >
                                            {primaryEmotion.emotion
                                                .charAt(0)
                                                .toUpperCase() +
                                                primaryEmotion.emotion.slice(
                                                    1
                                                )}{' '}
                                            (
                                            {primaryEmotion.percentage.toFixed(
                                                1
                                            )}
                                            %)
                                        </Typography>
                                    }
                                />
                                {isExpanded ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>
                            <Collapse
                                in={isExpanded}
                                timeout="auto"
                                unmountOnExit
                            >
                                <List component="div" disablePadding>
                                    {face.emotions.map((emotion, index) => (
                                        <ListItemButton
                                            key={index}
                                            sx={{
                                                pl: 4,
                                                py: 0.5,
                                            }}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                flex: 1,
                                                                color:
                                                                    index === 0
                                                                        ? emotionColors[
                                                                              emotion
                                                                                  .emotion
                                                                          ]
                                                                        : 'text.primary',
                                                                fontWeight:
                                                                    index === 0
                                                                        ? 'bold'
                                                                        : 'normal',
                                                            }}
                                                        >
                                                            {emotion.emotion
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                emotion.emotion.slice(
                                                                    1
                                                                )}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color:
                                                                    index === 0
                                                                        ? emotionColors[
                                                                              emotion
                                                                                  .emotion
                                                                          ]
                                                                        : 'text.secondary',
                                                                fontWeight:
                                                                    index === 0
                                                                        ? 'bold'
                                                                        : 'normal',
                                                                ml: 2,
                                                            }}
                                                        >
                                                            {emotion.percentage.toFixed(
                                                                1
                                                            )}
                                                            %
                                                        </Typography>
                                                        <Box
                                                            sx={{
                                                                ml: 2,
                                                                flex: 1,
                                                                height: 4,
                                                                borderRadius: 2,
                                                                bgcolor:
                                                                    theme
                                                                        .palette
                                                                        .mode ===
                                                                    'dark'
                                                                        ? 'rgba(255,255,255,0.12)'
                                                                        : 'rgba(0,0,0,0.05)',
                                                                overflow:
                                                                    'hidden',
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    width: `${emotion.percentage}%`,
                                                                    height: '100%',
                                                                    bgcolor:
                                                                        emotionColors[
                                                                            emotion
                                                                                .emotion
                                                                        ],
                                                                    transition:
                                                                        'width 1s ease-in-out',
                                                                }}
                                                            />
                                                        </Box>
                                                    </Box>
                                                }
                                            />
                                        </ListItemButton>
                                    ))}
                                </List>
                            </Collapse>
                        </Box>
                    );
                })}
            </List>
        );
    };

    // Modal content
    const modalContent = () => {
        if (!item) return null;

        return (
            <>
                <Box
                    sx={{
                        position: 'relative',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 3,
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                            p: 2,
                            borderRadius: 3,
                        }}
                    >
                        <Typography
                            variant="h5"
                            fontWeight="bold"
                            sx={{
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '0.5px',
                            }}
                        >
                            Emotion Detection Details
                        </Typography>

                        <IconButton
                            onClick={onClose}
                            size="small"
                            sx={{
                                bgcolor: 'background.paper',
                                boxShadow: theme.shadows[2],
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: 'background.default',
                                    transform: 'scale(1.1)',
                                },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Loading indicator */}
                    {loading && (
                        <Box sx={{ width: '100%', mb: 2 }}>
                            <LinearProgress
                                sx={{
                                    borderRadius: 1,
                                    height: 6,
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 1,
                                    },
                                }}
                            />
                        </Box>
                    )}

                    {/* Error message */}
                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                borderRadius: 2,
                                '& .MuiAlert-icon': {
                                    fontSize: '1.5rem',
                                },
                            }}
                        >
                            Unable to load details. Please try again later.
                        </Alert>
                    )}

                    {/* Main Content */}
                    {loading ? (
                        renderSkeleton()
                    ) : detailData ? (
                        <Box
                            sx={{
                                flex: 1,
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', md: 'row' },
                                    gap: 3,
                                    mb: 3,
                                }}
                            >
                                {/* Image */}
                                <Box
                                    sx={{
                                        flex: { xs: 'none', md: 1 },
                                        maxWidth: { xs: '100%', md: '50%' },
                                        position: 'relative',
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                        height: { xs: 250, sm: 300, md: 350 },
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        bgcolor: 'black',
                                    }}
                                >
                                    {detailData.image_url ? (
                                        <Box
                                            component="img"
                                            src={detailData.image_url}
                                            alt="Detection result"
                                            sx={{
                                                maxWidth: '100%',
                                                maxHeight: '100%',
                                                objectFit: 'contain',
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

                                {/* Info */}
                                <Box sx={{ flex: 1 }}>
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            bgcolor:
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(255,255,255,0.05)'
                                                    : 'rgba(0,0,0,0.02)',
                                            mb: 2,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                mb: 1,
                                            }}
                                        >
                                            <AccessTimeIcon
                                                fontSize="small"
                                                sx={{
                                                    mr: 1,
                                                    color: theme.palette.primary
                                                        .main,
                                                }}
                                            />
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                fontWeight="medium"
                                            >
                                                Detection Time
                                            </Typography>
                                        </Box>
                                        <Typography
                                            variant="body1"
                                            fontWeight="medium"
                                        >
                                            {format(
                                                new Date(detailData.timestamp),
                                                'dd/MM/yyyy HH:mm:ss'
                                            )}
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={handleDeleteClick}
                                        sx={{
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            mb: 3,
                                        }}
                                        fullWidth={isMobile}
                                    >
                                        Delete Result
                                    </Button>
                                </Box>
                            </Box>

                            {/* Results */}
                            <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
                                <Typography
                                    variant={isMobile ? 'h6' : 'h5'}
                                    fontWeight="bold"
                                    sx={{
                                        mb: 2,
                                        color: theme.palette.primary.main,
                                    }}
                                >
                                    Emotion Detection Results
                                </Typography>

                                {detailData.detection_results && (
                                    <Box>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                mb: 2,
                                                p: 2,
                                                borderRadius: 2,
                                                bgcolor:
                                                    theme.palette.mode ===
                                                    'dark'
                                                        ? 'rgba(255,255,255,0.05)'
                                                        : 'rgba(0,0,0,0.02)',
                                            }}
                                        >
                                            <FaceIcon
                                                sx={{
                                                    mr: 1,
                                                    color: theme.palette.primary
                                                        .main,
                                                }}
                                            />
                                            <Typography
                                                variant="body1"
                                                fontWeight="medium"
                                            >
                                                {detailData.detection_results
                                                    .face_detected
                                                    ? `${detailData.detection_results.faces.length} faces detected`
                                                    : 'No faces detected'}
                                            </Typography>
                                        </Box>

                                        {renderEmotionResults()}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    ) : null}
                </Box>
            </>
        );
    };

    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
                aria-labelledby="history-detail-modal"
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={open}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: isSmall ? '95%' : '90%',
                            maxWidth: 1000,
                            maxHeight: '90vh',
                            height: '90vh',
                            bgcolor: 'background.paper',
                            borderRadius: 4,
                            boxShadow: theme.shadows[8],
                            p: { xs: 2, sm: 3, md: 4 },
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {modalContent()}
                    </Box>
                </Fade>
            </Modal>

            <ConfirmDeleteModal
                open={deleteConfirmOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
            />
        </>
    );
};

export default HistoryDetailModal;
