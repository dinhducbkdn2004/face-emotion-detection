import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Paper,
    useMediaQuery,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import {
    FaceRetouchingOff,
    Psychology,
    SentimentSatisfied,
} from '@mui/icons-material';

const MotionBox = motion.create(Box);
const MotionPaper = motion.create(Paper);

const featuresList = [
    {
        icon: <Psychology sx={{ fontSize: 40 }} />,
        title: 'Emotion Analysis',
        description: 'Recognize and analyze emotions from images and text.',
    },
    {
        icon: <FaceRetouchingOff sx={{ fontSize: 40 }} />,
        title: 'Facial Recognition',
        description:
            'Advanced facial recognition technology with high accuracy.',
    },
    {
        icon: <SentimentSatisfied sx={{ fontSize: 40 }} />,
        title: 'Detailed Reports',
        description:
            'Analyze and report emotions in real-time with detailed insights.',
    },
];

export default function Home() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Container maxWidth="lg">
            <Grid container spacing={4} sx={{ py: { xs: 4, md: 8 } }}>
                {/* Hero Section */}
                <Grid item xs={12}>
                    <MotionBox
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        sx={{
                            textAlign: 'center',
                            mb: { xs: 4, md: 8 },
                            px: { xs: 2, sm: 0 },
                        }}
                    >
                        <Typography
                            component={motion.h1}
                            variant={isMobile ? 'h3' : isTablet ? 'h2' : 'h1'}
                            fontWeight="bold"
                            gutterBottom
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            sx={{
                                lineHeight: 1.2,
                                mb: { xs: 2, md: 3 },
                            }}
                        >
                            Discover
                            <Typography
                                component="span"
                                variant={
                                    isMobile ? 'h3' : isTablet ? 'h2' : 'h1'
                                }
                                fontWeight="bold"
                                color="primary"
                                sx={{ display: 'inline' }}
                            >
                                {' '}
                                Intelligent
                            </Typography>{' '}
                            Emotions
                        </Typography>
                        <Typography
                            variant={isMobile ? 'body1' : 'h5'}
                            color="text.secondary"
                            sx={{
                                mb: { xs: 3, md: 4 },
                                maxWidth: '800px',
                                mx: 'auto',
                            }}
                            component={motion.p}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            Precise emotion analysis with cutting-edge AI
                            technology
                        </Typography>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            style={{
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row',
                                gap: '16px',
                                justifyContent: 'center',
                            }}
                        >
                            <Button
                                variant="contained"
                                size={isMobile ? 'medium' : 'large'}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    py: { xs: 1, md: 1.5 },
                                    px: { xs: 3, md: 4 },
                                    width: isMobile ? '100%' : 'auto',
                                    mb: isMobile ? 1 : 0,
                                }}
                            >
                                Get Started
                            </Button>
                            <Button
                                variant="outlined"
                                size={isMobile ? 'medium' : 'large'}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    py: { xs: 1, md: 1.5 },
                                    px: { xs: 3, md: 4 },
                                    width: isMobile ? '100%' : 'auto',
                                }}
                            >
                                Learn More
                            </Button>
                        </motion.div>
                    </MotionBox>
                </Grid>

                {/* Features Section */}
                <Grid item xs={12}>
                    <Grid container spacing={{ xs: 2, md: 4 }}>
                        {featuresList.map((feature, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <MotionPaper
                                    elevation={0}
                                    sx={{
                                        p: { xs: 3, md: 4 },
                                        height: '100%',
                                        borderRadius: 4,
                                        bgcolor: 'background.paper',
                                        border: 1,
                                        borderColor: 'divider',
                                        '&:hover': {
                                            bgcolor:
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.05)'
                                                    : 'rgba(0, 0, 0, 0.02)',
                                            transform: 'translateY(-4px)',
                                            boxShadow: theme.shadows[4],
                                        },
                                        transition: 'all 0.3s ease-in-out',
                                    }}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 * index + 0.8 }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: isMobile
                                                ? 'row'
                                                : 'column',
                                            alignItems: isMobile
                                                ? 'center'
                                                : 'center',
                                            textAlign: isMobile
                                                ? 'left'
                                                : 'center',
                                            gap: isMobile ? 2 : 0,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                mb: isMobile ? 0 : 2,
                                                color: 'primary.main',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {feature.icon}
                                        </Box>
                                        <Box>
                                            <Typography
                                                variant="h6"
                                                gutterBottom
                                                fontWeight="bold"
                                            >
                                                {feature.title}
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                color="text.secondary"
                                            >
                                                {feature.description}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </MotionPaper>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
}
