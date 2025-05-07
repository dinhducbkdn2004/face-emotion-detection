/**
 * Component to display emotion analysis results for a face
 */
const EmotionResultCard = ({ face, faceIndex }) => {
    const theme = useTheme();
    const primaryEmotion = face.emotions[0];

    // Sort emotions by percentage in descending order
    const sortedEmotions = [...face.emotions].sort((a, b) => b.score - a.score);

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: theme.shadows[1],
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: theme.shadows[3],
                },
                border: `1px solid ${theme.palette.divider}`,
            }}
        >
            <Box
                sx={{
                    height: 6,
                    width: '100%',
                    bgcolor:
                        emotionColors[primaryEmotion.emotion] ||
                        theme.palette.primary.main,
                }}
            />

            <CardContent sx={{ p: 2 }}>
                <Box sx={{ mb: 2 }}>
                    <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        gutterBottom
                    >
                        Face #{faceIndex + 1}
                    </Typography>
                    <Typography
                        variant="h6"
                        color="primary"
                        fontWeight="medium"
                    >
                        {emotionLabels[primaryEmotion.emotion] ||
                            primaryEmotion.emotion}{' '}
                        <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                        >
                            ({Math.round(primaryEmotion.percentage)}%)
                        </Typography>
                    </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                    {sortedEmotions.map((emotion, index) => (
                        <Box key={index} sx={{ mb: 1 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    mb: 0.5,
                                }}
                            >
                                <Typography variant="body2">
                                    {emotionLabels[emotion.emotion] ||
                                        emotion.emotion}
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
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
                                            ? 'rgba(255,255,255,0.08)'
                                            : 'rgba(0,0,0,0.08)',
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor:
                                            emotionColors[emotion.emotion] ||
                                            theme.palette.primary.main,
                                        borderRadius: 4,
                                    },
                                }}
                            />
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
};

export default EmotionResultCard; 