import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Tabs,
    Tab,
    useTheme,
    useMediaQuery,
    Fade,
    Divider,
    Grid,
    Skeleton,
} from '@mui/material';
import { PhotoCamera, PhotoLibrary } from '@mui/icons-material';
import EmotionDetector from '../../components/EmotionDetector';
import BatchEmotionDetector from '../../components/BatchEmotionDetector';

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`emotion-tabpanel-${index}`}
            aria-labelledby={`emotion-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Fade in={value === index} timeout={500}>
                    <Box sx={{ p: { xs: 1, sm: 2 } }}>{children}</Box>
                </Fade>
            )}
        </div>
    );
}

const Dashboard = () => {
    const [tabValue, setTabValue] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [loading, setLoading] = useState(false);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Skeleton loader cho tiêu đề
    const TitleSkeleton = () => (
        <Box sx={{ width: '100%', textAlign: 'center', mb: 3 }}>
            <Skeleton
                variant="text"
                width="60%"
                height={60}
                sx={{ mx: 'auto' }}
            />
            <Skeleton
                variant="text"
                width="40%"
                height={30}
                sx={{ mx: 'auto' }}
            />
        </Box>
    );

    return (
        <Container
            maxWidth="lg"
            sx={{
                py: { xs: 3, sm: 5 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: 'calc(100vh - 80px)',
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 3, md: 4 },
                    borderRadius: 4,
                    background:
                        theme.palette.mode === 'dark'
                            ? 'linear-gradient(145deg, #1e1e1e, #282828)'
                            : 'linear-gradient(145deg, #fefefe, #f5f5f5)',
                    boxShadow:
                        theme.palette.mode === 'dark'
                            ? '0 8px 32px rgba(0, 0, 0, 0.2)'
                            : '0 8px 32px rgba(0, 0, 0, 0.05)',
                    overflow: 'hidden',
                    maxWidth: '100%',
                    width: '100%',
                }}
            >
                {loading ? (
                    <TitleSkeleton />
                ) : (
                    <>
                        <Typography
                            variant={isMobile ? 'h5' : 'h4'}
                            fontWeight="bold"
                            sx={{
                                mb: 3,
                                textAlign: 'center',
                                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '0.5px',
                            }}
                        >
                            Phát hiện cảm xúc khuôn mặt
                        </Typography>

                        <Divider sx={{ mb: 3 }} />
                    </>
                )}

                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        overflow: 'hidden',
                        bgcolor: theme.palette.background.paper,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    }}
                >
                    <Box sx={{ px: { xs: 1, sm: 2 } }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            aria-label="emotion detection tabs"
                            variant="fullWidth"
                            textColor="primary"
                            indicatorColor="primary"
                            sx={{
                                '& .MuiTab-root': {
                                    fontWeight: 'medium',
                                    fontSize: {
                                        xs: '0.9rem',
                                        sm: '1rem',
                                    },
                                    py: 2,
                                    transition: 'all 0.3s ease',
                                    color: theme.palette.text.secondary,
                                    '&.Mui-selected': {
                                        color: theme.palette.primary.main,
                                        fontWeight: 'bold',
                                    },
                                },
                                '& .MuiTabs-indicator': {
                                    height: 3,
                                    borderRadius: '3px 3px 0 0',
                                },
                            }}
                        >
                            <Tab
                                label={
                                    isMobile ? 'Một ảnh' : 'Phát hiện một ảnh'
                                }
                                id="emotion-tab-0"
                                aria-controls="emotion-tabpanel-0"
                                icon={<PhotoCamera />}
                                iconPosition="start"
                            />
                            <Tab
                                label={
                                    isMobile
                                        ? 'Nhiều ảnh'
                                        : 'Phát hiện nhiều ảnh'
                                }
                                id="emotion-tab-1"
                                aria-controls="emotion-tabpanel-1"
                                icon={<PhotoLibrary />}
                                iconPosition="start"
                            />
                        </Tabs>
                    </Box>

                    <Box sx={{ mt: 1 }}>
                        <CustomTabPanel value={tabValue} index={0}>
                            <EmotionDetector />
                        </CustomTabPanel>
                        <CustomTabPanel value={tabValue} index={1}>
                            <BatchEmotionDetector />
                        </CustomTabPanel>
                    </Box>
                </Paper>
            </Paper>
        </Container>
    );
};

export default Dashboard;
