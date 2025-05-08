import { useState } from 'react';
import {
    Box,
    Typography,
    Alert,
    useTheme,
    useMediaQuery,
    Chip,
    Paper,
    Fade,
} from '@mui/material';
import { InfoOutlined, Face as FaceIcon } from '@mui/icons-material';
import EmotionResultSkeleton from './EmotionResultSkeleton';
import FaceBoxOverlay from './FaceBoxOverlay';
import EmotionResultsList from './EmotionResultsList';

/**
 * Component to display emotion analysis results
 * @param {Object} props - Component props
 * @param {Object} props.result - Emotion detection result
 * @param {boolean} props.loading - Loading state
 * @param {Object} props.error - Error (if any)
 * @param {string} props.previewUrl - Preview image URL
 */
const EmotionResults = ({ result, loading, error, previewUrl }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (loading) {
        return <EmotionResultSkeleton />;
    }

    if (error) {
        return (
            <Alert
                severity="error"
                sx={{
                    borderRadius: 3,
                    mt: 2,
                    boxShadow: '0 4px 20px rgba(255,0,0,0.1)',
                }}
                variant="filled"
            >
                An error occurred while analyzing emotions. Please try again.
            </Alert>
        );
    }

    if (!result) {
        return null;
    }

    // Trường hợp không phát hiện khuôn mặt
    if (!result.detection_results.face_detected) {
        return (
            <Alert
                severity="info"
                sx={{
                    borderRadius: 3,
                    mt: 2,
                    boxShadow: '0 4px 20px rgba(0,0,255,0.1)',
                }}
                variant="filled"
            >
                No faces detected in this image
            </Alert>
        );
    }

    return (
        <Box>
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 3,
                    background:
                        theme.palette.mode === 'dark'
                            ? 'linear-gradient(145deg, #1a1a1a, #2d2d2d)'
                            : 'linear-gradient(145deg, #ffffff, #f8f9fa)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FaceIcon
                            sx={{
                                mr: 1,
                                color: theme.palette.primary.main,
                                fontSize: 28,
                            }}
                        />
                        <Typography variant="h6" fontWeight="bold">
                            Detection Results
                        </Typography>
                    </Box>

                    <Chip
                        icon={<InfoOutlined />}
                        label={`${result.detection_results.faces.length} face(s) detected`}
                        color="primary"
                        variant="outlined"
                        sx={{
                            borderRadius: 3,
                            px: 1,
                        }}
                    />
                </Box>
            </Paper>

            {/* Preview image with bounding boxes */}
            {previewUrl && (
                <Fade in={true} timeout={500}>
                    <Paper
                        elevation={0}
                        sx={{
                            mb: 3,
                            overflow: 'hidden',
                            borderRadius: 3,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        }}
                    >
                        <FaceBoxOverlay
                            imageUrl={previewUrl}
                            faces={result.detection_results.faces}
                            
                        />
                    </Paper>
                </Fade>
            )}

            {/* Results list */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}
            >
                <EmotionResultsList faces={result.detection_results.faces} />
            </Paper>
        </Box>
    );
};

export default EmotionResults;
