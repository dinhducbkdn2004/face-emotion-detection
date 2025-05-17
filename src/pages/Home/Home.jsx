import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Paper,
    useMediaQuery,
    Card,
    CardContent,
    Avatar,
    Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import {
    FaceRetouchingOff,
    Psychology,
    SentimentSatisfied,
    Analytics,
    Security,
    BarChart,
    TouchApp,
    Login,
    HowToReg,
    Speed,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../components/account/UserContext';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionCard = motion(Card);

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

const benefitsList = [
    {
        icon: <Analytics sx={{ fontSize: 40 }} />,
        title: 'Data-Driven Insights',
        description:
            'Make informed decisions based on emotional analysis data and reports.',
    },
    {
        icon: <Security sx={{ fontSize: 40 }} />,
        title: 'Secure Processing',
        description:
            'Your data is processed securely with the highest encryption standards.',
    },
    {
        icon: <BarChart sx={{ fontSize: 40 }} />,
        title: 'Visual Reports',
        description:
            'Get comprehensive visual reports about emotional patterns and trends.',
    },
    {
        icon: <TouchApp sx={{ fontSize: 40 }} />,
        title: 'User-Friendly',
        description:
            'Intuitive interface that makes emotion detection accessible to everyone.',
    },
];

const testimonials = [
    {
        name: 'Lê Văn Huy',
        company: 'Marketing Expert',
        avatar: '/testimonial2.jpg',
        text: 'The accuracy of emotion detection has helped us create better targeting strategies.',
    },
    {
        name: 'Nguyễn Văn An',
        company: 'Research Lab',
        avatar: '/testimonial3.jpg',
        text: 'As a researcher, I appreciate the detailed emotional analysis this platform provides.',
    },
];

export default function Home() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { isAuthenticated } = useUser();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const [typedText, setTypedText] = useState('');
    const fullText = 'Intelligent';

    useEffect(() => {
        let typingTimeout;
        let delay = 150;
        let currentIndex = 0;
        let isErasing = false;

        const typeWriter = () => {
            // When typing forward
            if (!isErasing) {
                if (currentIndex < fullText.length) {
                    setTypedText(fullText.slice(0, currentIndex + 1));
                    currentIndex++;
                    typingTimeout = setTimeout(typeWriter, delay);
                } else {
                    // Pause before erasing
                    isErasing = true;
                    typingTimeout = setTimeout(typeWriter, 1500);
                }
            }
            // When erasing
            else {
                if (currentIndex > 0) {
                    setTypedText(fullText.slice(0, currentIndex - 1));
                    currentIndex--;
                    typingTimeout = setTimeout(typeWriter, delay / 2);
                } else {
                    // Pause before typing again
                    isErasing = false;
                    typingTimeout = setTimeout(typeWriter, 800);
                }
            }
        };

        // Start the typing effect
        typingTimeout = setTimeout(typeWriter, 500);

        return () => clearTimeout(typingTimeout);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: 'easeOut',
            },
        },
    };

    // Thêm keyframes cho animation shimmer và typing
    const shimmerKeyframes = `
        @keyframes shimmer {
            0% {
                transform: translateX(-100%);
            }
            100% {
                transform: translateX(100%);
            }
        }
        
        @keyframes float {
            0% {
                transform: translateY(0px);
            }
            50% {
                transform: translateY(-10px);
            }
            100% {
                transform: translateY(0px);
            }
        }
        
        @keyframes blink {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0;
            }
        }
    `;

    return (
        <Box
            sx={{
                background:
                    theme.palette.mode === 'dark'
                        ? 'linear-gradient(to bottom, #121212, #1e1e1e)'
                        : 'linear-gradient(to bottom, #f9fafb, #f5f5f5)',
                minHeight: 'calc(100vh - 70px)',
                py: { xs: 3, md: 4 },
            }}
        >
            <style>{shimmerKeyframes}</style>
            <Container maxWidth="lg" sx={{ width: '85%', mx: 'auto' }}>
                {/* Hero Section */}
                <MotionBox
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    sx={{
                        textAlign: 'center',
                        mb: { xs: 4, md: 6 },
                        px: { xs: 2, sm: 0 },
                    }}
                >
                    <Typography
                        component={motion.h1}
                        variant={isMobile ? 'h4' : isTablet ? 'h3' : 'h2'}
                        fontWeight="bold"
                        gutterBottom
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        sx={{
                            lineHeight: 1.2,
                            mb: { xs: 1, md: 2 },
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mr: 1,
                            display: 'inline-block',
                        }}
                    >
                        Discover
                        <Box
                            component="span"
                            sx={{
                                display: 'inline-block',
                                position: 'relative',
                                mx: 1,
                                minWidth: isMobile
                                    ? '100px'
                                    : isTablet
                                      ? '150px'
                                      : '180px',
                            }}
                        >
                            <Typography
                                component="span"
                                variant={
                                    isMobile ? 'h4' : isTablet ? 'h3' : 'h2'
                                }
                                fontWeight="bold"
                                sx={{
                                    display: 'inline',
                                    color: theme.palette.primary.main,
                                    WebkitTextFillColor: 'initial',
                                    position: 'relative',
                                }}
                            >
                                {typedText}
                                <Box
                                    component="span"
                                    sx={{
                                        display: 'inline-block',
                                        width: '3px',
                                        height: '1em',
                                        ml: 0.5,
                                        bgcolor: theme.palette.primary.main,
                                        verticalAlign: 'text-bottom',
                                        animation: 'blink 1s step-end infinite',
                                    }}
                                />
                            </Typography>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '3px',
                                    bottom: -3,
                                    left: 0,
                                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    borderRadius: '2px',
                                }}
                            />
                        </Box>
                    </Typography>
                    <Typography
                        component={motion.h1}
                        variant={isMobile ? 'h4' : isTablet ? 'h3' : 'h2'}
                        fontWeight="bold"
                        gutterBottom
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        sx={{
                            lineHeight: 1.2,
                            mb: { xs: 2, md: 2 },
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            display: 'block',
                            mt: 0.5,
                        }}
                    >
                        Emotions
                    </Typography>

                    <Typography
                        variant={isMobile ? 'body2' : 'body1'}
                        color="text.secondary"
                        sx={{
                            maxWidth: '700px',
                            mx: 'auto',
                            lineHeight: 1.6,
                        }}
                        component={motion.p}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        Precise emotion analysis with cutting-edge AI technology
                        for businesses and individuals. Try it now in guest mode
                        with 5 free detections or sign up for unlimited access.
                    </Typography>
                    {isAuthenticated && (
                        <Box
                            sx={{
                                mt: 4,
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row',
                                gap: 2,
                                justifyContent: 'center',
                            }}
                        >
                            <Button
                                variant="contained"
                                size="large"
                                color="primary"
                                onClick={() => navigate('/dashboard')}
                                sx={{
                                    py: 1.5,
                                    px: 4,
                                    borderRadius: 2,
                                    fontWeight: 'bold',
                                    boxShadow: 4,
                                }}
                            >
                                Go to Dashboard
                            </Button>
                        </Box>
                    )}

                    {/* Guest Mode Description - Visible Only for Non-Authenticated Users */}
                    {!isAuthenticated && (
                        <MotionPaper
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            sx={{
                                mt: 4,
                                p: 2.5,
                                maxWidth: '700px',
                                width: '85%',
                                mx: 'auto',
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: 2,
                                bgcolor:
                                    theme.palette.mode === 'dark'
                                        ? 'rgba(37, 37, 37, 0.9)'
                                        : 'rgba(255, 255, 255, 0.9)',
                            }}
                        >
                            <Typography
                                variant="h6"
                                color="primary"
                                fontWeight="bold"
                                gutterBottom
                            >
                                Guest mode
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                You can try the emotion detection feature
                                without creating an account! Each device is
                                provided with 5 free detections.
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    mt: 1.5,
                                }}
                            >
                                <Button
                                    variant="outlined"
                                    size="medium"
                                    startIcon={<Speed />}
                                    onClick={() => navigate('/guest')}
                                    sx={{
                                        py: 1,
                                        px: 3,
                                        borderRadius: 2,
                                        fontWeight: 'medium',
                                        borderColor: theme.palette.success.main,
                                        color: theme.palette.success.main,
                                        '&:hover': {
                                            borderColor:
                                                'gray',
                                            backgroundColor:
                                                theme.palette.success.light,
                                            color: 'white',
                                        },
                                    }}
                                >
                                    Try it now
                                </Button>
                            </Box>
                        </MotionPaper>
                    )}
                </MotionBox>

                {/* Features Section */}
                <Box sx={{ mb: { xs: 6, md: 8 } }}>
                    <MotionBox
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true, margin: '-100px' }}
                        sx={{ textAlign: 'center', mb: 4 }}
                    >
                        <Typography
                            variant={isMobile ? 'h5' : 'h4'}
                            component="h2"
                            gutterBottom
                            fontWeight="bold"
                            sx={{
                                mb: 1.5,
                                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Key Features
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                maxWidth: 600,
                                mx: 'auto',
                                mb: 3,
                            }}
                        >
                            Our platform provides cutting-edge emotion detection
                            capabilities with these powerful features
                        </Typography>
                    </MotionBox>

                    <Grid
                        container
                        spacing={{ xs: 2, md: 3 }}
                        component={motion.div}
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        sx={{
                            justifyContent: 'center',
                        }}
                    >
                        {featuresList.map((feature, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <MotionPaper
                                    variants={itemVariants}
                                    elevation={0}
                                    whileHover={{
                                        scale: 1.02,
                                        boxShadow: theme.shadows[8],
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 15,
                                    }}
                                    sx={{
                                        p: 3,
                                        height: '100%',
                                        borderRadius: 3,
                                        bgcolor: 'background.paper',
                                        border: 1,
                                        borderColor: 'divider',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&:after': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                                            opacity: 0,
                                            transition: 'opacity 0.5s ease',
                                            zIndex: 0,
                                        },
                                        '&:before': {
                                            content: '""',
                                            position: 'absolute',
                                            width: '100%',
                                            height: '3px',
                                            bottom: 0,
                                            left: 0,
                                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                            transform: 'scaleX(0)',
                                            transformOrigin: 'left',
                                            transition: 'transform 0.3s ease',
                                            zIndex: 1,
                                        },
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            '&:before': {
                                                transform: 'scaleX(1)',
                                            },
                                            '&:after': {
                                                opacity: 1,
                                            },
                                            '& .feature-icon': {
                                                transform:
                                                    'scale(1.1) rotateY(180deg)',
                                                color: theme.palette.secondary
                                                    .main,
                                            },
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            zIndex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            width: '100%',
                                        }}
                                    >
                                        <Box
                                            className="feature-icon"
                                            sx={{
                                                mb: 2,
                                                color: theme.palette.primary
                                                    .main,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                p: 1.5,
                                                bgcolor:
                                                    theme.palette.mode ===
                                                    'dark'
                                                        ? 'rgba(255,255,255,0.05)'
                                                        : 'rgba(0,0,0,0.02)',
                                                borderRadius: '50%',
                                                width: 60,
                                                height: 60,
                                                transition: 'all 0.5s ease',
                                                boxShadow:
                                                    '0 4px 12px rgba(0,0,0,0.05)',
                                            }}
                                        >
                                            {feature.icon}
                                        </Box>
                                        <Typography
                                            variant="h6"
                                            gutterBottom
                                            fontWeight="bold"
                                            sx={{ mb: 1 }}
                                        >
                                            {feature.title}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {feature.description}
                                        </Typography>
                                    </Box>
                                </MotionPaper>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Benefits Section */}
                <Box sx={{ mb: { xs: 6, md: 8 }, py: { xs: 3, md: 4 } }}>
                    <MotionBox
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true, margin: '-100px' }}
                        sx={{ textAlign: 'center', mb: 4 }}
                    >
                        <Typography
                            variant={isMobile ? 'h5' : 'h4'}
                            component="h2"
                            gutterBottom
                            fontWeight="bold"
                            sx={{
                                mb: 1.5,
                                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Why Choose Us
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                maxWidth: 600,
                                mx: 'auto',
                                mb: 3,
                            }}
                        >
                            Our emotion detection platform offers numerous
                            benefits for organizations and individuals
                        </Typography>
                    </MotionBox>

                    <Grid
                        container
                        spacing={2}
                        sx={{
                            mb: 6,
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                        }}
                        component={motion.div}
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        {benefitsList.map((benefit, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <MotionPaper
                                    variants={itemVariants}
                                    elevation={0}
                                    sx={{
                                        p: 2.5,
                                        height: '100%',
                                        borderRadius: 3,
                                        bgcolor: 'background.paper',
                                        border: 1,
                                        borderColor: 'divider',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: theme.shadows[3],
                                            '& .benefit-icon': {
                                                animation:
                                                    'float 3s ease infinite',
                                            },
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: '100%',
                                        }}
                                    >
                                        <Box
                                            className="benefit-icon"
                                            sx={{
                                                color: theme.palette.primary
                                                    .main,
                                                mb: 1.5,
                                                fontSize: '0.9em',
                                            }}
                                        >
                                            {benefit.icon}
                                        </Box>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="bold"
                                            gutterBottom
                                        >
                                            {benefit.title}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ fontSize: '0.85rem' }}
                                        >
                                            {benefit.description}
                                        </Typography>
                                    </Box>
                                </MotionPaper>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Testimonials Section */}
                <Box sx={{ mb: { xs: 6, md: 8 } }}>
                    <MotionBox
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true, margin: '-100px' }}
                        sx={{ textAlign: 'center', mb: 4 }}
                    >
                        <Typography
                            variant={isMobile ? 'h5' : 'h4'}
                            component="h2"
                            gutterBottom
                            fontWeight="bold"
                            sx={{
                                mb: 1.5,
                                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            What Our Users Say
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                maxWidth: 600,
                                mx: 'auto',
                                mb: 3,
                            }}
                        >
                            Here's what professionals and businesses are saying
                            about our emotion detection technology
                        </Typography>
                    </MotionBox>

                    <Grid
                        spacing={3}
                        justifyContent="center"
                        component={motion.div}
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        sx={{
                            justifyContent: 'center',
                            margin: '0 auto',
                            gap: 3,
                        }}
                    >
                        {testimonials.map((testimonial, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <MotionCard
                                    variants={itemVariants}
                                    elevation={0}
                                    whileHover={{
                                        y: -8,
                                        boxShadow: theme.shadows[6],
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 15,
                                    }}
                                    sx={{
                                        height: '100%',
                                        borderRadius: 3,
                                        border: 1,
                                        marginBottom: 2.5,
                                        borderColor: 'divider',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease',
                                        '&:before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '4px',
                                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                            opacity: 0,
                                            transition: 'opacity 0.3s ease',
                                        },
                                        '&:hover': {
                                            '&:before': {
                                                opacity: 1,
                                            },
                                            '& .testimonial-quote': {
                                                transform: 'scale(1.15)',
                                                opacity: 0.1,
                                            },
                                        },
                                    }}
                                >
                                    <CardContent
                                        sx={{ p: 3, position: 'relative' }}
                                    >
                                        <Typography
                                            className="testimonial-quote"
                                            sx={{
                                                position: 'absolute',
                                                right: 15,
                                                top: 15,
                                                fontFamily: 'Georgia, serif',
                                                fontSize: '4rem',
                                                lineHeight: 1,
                                                color: 'rgba(0,0,0,0.06)',
                                                fontWeight: 'bold',
                                                userSelect: 'none',
                                                transition: 'all 0.5s ease',
                                                transform: 'scale(1)',
                                                opacity: 0.06,
                                                zIndex: 0,
                                            }}
                                        >
                                            "
                                        </Typography>

                                        <Box
                                            sx={{
                                                position: 'relative',
                                                zIndex: 1,
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                paragraph
                                                sx={{
                                                    fontStyle: 'italic',
                                                    mb: 2,
                                                }}
                                            >
                                                {testimonial.text}
                                            </Typography>

                                            <Divider sx={{ my: 1.5 }} />

                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Avatar
                                                    src={testimonial.avatar}
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        mr: 1.5,
                                                        border: 2,
                                                        borderColor:
                                                            'primary.main',
                                                    }}
                                                />
                                                <Box>
                                                    <Typography
                                                        variant="subtitle2"
                                                        fontWeight="bold"
                                                    >
                                                        {testimonial.name}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {testimonial.company}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </MotionCard>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* CTA Section */}
                <MotionBox
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                    sx={{
                        textAlign: 'center',
                        py: { xs: 4, md: 6 },
                        px: { xs: 2, md: 6 },
                        mb: { xs: 3, md: 4 },
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}30)`,
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                    }}
                >
                    <Typography
                        variant={isMobile ? 'h5' : 'h4'}
                        fontWeight="bold"
                        gutterBottom
                        sx={{
                            mb: 1.5,
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Ready to Get Started?
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            maxWidth: 600,
                            mx: 'auto',
                            mb: 3,
                        }}
                    >
                        Join thousands of professionals and businesses who are
                        already using our emotion detection technology
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            gap: 2,
                            justifyContent: 'center',
                        }}
                    >
                        <Button
                            variant="contained"
                            size="medium"
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                py: 1,
                                px: 3,
                                fontWeight: 'bold',
                                boxShadow: '0 6px 12px rgba(0,0,0,0.08)',
                            }}
                            component={motion.button}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Sign Up Now
                        </Button>
                        <Button
                            variant="outlined"
                            size="medium"
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                py: 1,
                                px: 3,
                                fontWeight: 'bold',
                                borderWidth: 1.5,
                                bgcolor: 'background.paper',
                                '&:hover': {
                                    borderWidth: 1.5,
                                    bgcolor: 'background.paper',
                                },
                            }}
                            component={motion.button}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Contact Sales
                        </Button>
                    </Box>
                </MotionBox>
            </Container>
        </Box>
    );
}
