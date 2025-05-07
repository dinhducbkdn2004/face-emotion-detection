import React from 'react';
import {
    Modal,
    Box,
    Typography,
    IconButton,
    Card,
    CardMedia,
    Grid,
    Stack,
    Chip,
    Divider,
    useTheme,
} from '@mui/material';
import {
    Close as CloseIcon,
    Mood as MoodIcon,
    Face as FaceIcon,
    AccessTime as AccessTimeIcon,
} from '@mui/icons-material';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 1000,
    maxHeight: '90vh',
    overflow: 'auto',
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 3,
};

const emotionColors = {
    happy: '#00C853',
    sad: '#5C6BC0',
    angry: '#FF5252',
    surprise: '#FFB300',
    fear: '#8E24AA',
    disgust: '#795548',
    neutral: '#78909C',
    contempt: '#795548',
};

const EmotionDetailModal = ({ open, onClose, detection }) => {
    const theme = useTheme();

    if (!detection) return null;

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleString('vi-VN', {
            dateStyle: 'long',
            timeStyle: 'medium',
        });
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="emotion-detail-modal"
        >
            <Box sx={style}>
                {/* Header */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3,
                    }}
                >
                    <Typography variant="h5" component="h2">
                        Emotion Detection Details
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Grid container spacing={3}>
                    {/* Left side - Image */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                            <CardMedia
                                component="img"
                                image={detection.image_url}
                                alt="Detection result"
                                sx={{
                                    width: '100%',
                                    height: 'auto',
                                    minHeight: 300,
                                    objectFit: 'contain',
                                }}
                            />
                        </Card>
                    </Grid>

                    {/* Right side - Details */}
                    <Grid item xs={12} md={6}>
                        {/* Metadata */}
                        <Stack spacing={2}>
                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                    gutterBottom
                                >
                                    <AccessTimeIcon
                                        sx={{
                                            fontSize: '1rem',
                                            mr: 1,
                                            verticalAlign: 'text-bottom',
                                        }}
                                    />
                                    Thời gian
                                </Typography>
                                <Typography variant="body1">
                                    {formatDate(detection.timestamp)}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                    gutterBottom
                                >
                                    <FaceIcon
                                        sx={{
                                            fontSize: '1rem',
                                            mr: 1,
                                            verticalAlign: 'text-bottom',
                                        }}
                                    />
                                    Số khuôn mặt phát hiện được
                                </Typography>
                                <Typography variant="body1">
                                    {detection.detection_results.faces.length}{' '}
                                    khuôn mặt
                                </Typography>
                            </Box>

                            <Divider />

                            {/* Faces and their emotions */}
                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 500 }}
                            >
                                Chi tiết từng khuôn mặt:
                            </Typography>

                            <Stack spacing={2}>
                                {detection.detection_results.faces.map(
                                    (face, faceIndex) => {
                                        // Sort emotions by percentage
                                        const sortedEmotions = [
                                            ...face.emotions,
                                        ].sort(
                                            (a, b) =>
                                                b.percentage - a.percentage
                                        );
                                        const primaryEmotion =
                                            sortedEmotions[0];

                                        return (
                                            <Card
                                                key={faceIndex}
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 2,
                                                    border: '1px solid',
                                                    borderColor:
                                                        theme.palette.mode ===
                                                        'dark'
                                                            ? 'rgba(255,255,255,0.1)'
                                                            : 'rgba(0,0,0,0.1)',
                                                }}
                                            >
                                                <Typography
                                                    variant="subtitle2"
                                                    gutterBottom
                                                >
                                                    Face #{faceIndex + 1}
                                                </Typography>

                                                <Stack spacing={1}>
                                                    {/* Primary emotion */}
                                                    <Box>
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            Main emotion:
                                                        </Typography>
                                                        <Chip
                                                            icon={<MoodIcon />}
                                                            label={`${primaryEmotion.emotion} (${primaryEmotion.percentage.toFixed(1)}%)`}
                                                            sx={{
                                                                ml: 1,
                                                                bgcolor: `${emotionColors[primaryEmotion.emotion.toLowerCase()]}22`,
                                                                color: emotionColors[
                                                                    primaryEmotion.emotion.toLowerCase()
                                                                ],
                                                                '& .MuiChip-icon':
                                                                    {
                                                                        color: emotionColors[
                                                                            primaryEmotion.emotion.toLowerCase()
                                                                        ],
                                                                    },
                                                            }}
                                                        />
                                                    </Box>

                                                    {/* Other emotions */}
                                                    <Box>
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            display="block"
                                                            gutterBottom
                                                        >
                                                            Other emotions:
                                                        </Typography>
                                                        <Stack
                                                            direction="row"
                                                            spacing={1}
                                                            flexWrap="wrap"
                                                            useFlexGap
                                                        >
                                                            {sortedEmotions
                                                                .slice(1)
                                                                .map(
                                                                    (
                                                                        emotion,
                                                                        index
                                                                    ) => (
                                                                        <Chip
                                                                            key={
                                                                                index
                                                                            }
                                                                            size="small"
                                                                            label={`${emotion.emotion} (${emotion.percentage.toFixed(1)}%)`}
                                                                            sx={{
                                                                                mb: 1,
                                                                                bgcolor: `${emotionColors[emotion.emotion.toLowerCase()]}22`,
                                                                                color: emotionColors[
                                                                                    emotion.emotion.toLowerCase()
                                                                                ],
                                                                            }}
                                                                        />
                                                                    )
                                                                )}
                                                        </Stack>
                                                    </Box>

                                                    {/* Face location */}
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Location: [
                                                        {face.box.join(', ')}]
                                                    </Typography>
                                                </Stack>
                                            </Card>
                                        );
                                    }
                                )}
                            </Stack>

                            {/* Processing time */}
                            <Box sx={{ mt: 2 }}>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Processing time:{' '}
                                    {detection.detection_results.processing_time.toFixed(
                                        2
                                    )}
                                    s
                                </Typography>
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>
        </Modal>
    );
};

export default EmotionDetailModal;
