import {
    Box,
    Container,
    Typography,
    Grid,
    Avatar,
    Paper,
    useTheme,
    useMediaQuery,
    Card,
    CardContent,
    Divider,
    IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
    Security,
    Speed,
    Psychology,
    Construction,
    GitHub,
    LinkedIn,
} from '@mui/icons-material';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineDot,
    TimelineConnector,
    TimelineContent,
} from '@mui/lab';
import { AccessTime } from '@mui/icons-material';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionCard = motion(Card);

const technologies = [
    {
        icon: <Security sx={{ fontSize: 40 }} />,
        title: 'Security',
        description:
            'Our application ensures data security with the highest security standards.',
    },
    {
        icon: <Speed sx={{ fontSize: 40 }} />,
        title: 'Performance',
        description: 'Fast processing speed with optimized modern technology.',
    },
    {
        icon: <Psychology sx={{ fontSize: 40 }} />,
        title: 'Advanced AI',
        description: 'Using the most advanced AI models for emotion analysis.',
    },
];

const teamMembers = [
    {
        name: 'Dinh Duc',
        role: 'Frontend Developer',
        avatar: '/avatar_duc.jpg',
        description:
            'Using React, MUI, and Framer Motion to create interactive interface.',
        socialLinks: [
            { icon: 'GitHub', url: 'https://github.com/' },
            { icon: 'LinkedIn', url: 'https://linkedin.com/' },
        ],
    },
    {
        name: 'Le Duc Bao',
        role: 'Backend Developer',
        avatar: '/avatar_ldb.webp',
        description:
            'AI expert with over 10 years of experience in machine learning.',
        socialLinks: [
            { icon: 'GitHub', url: 'https://github.com/' },
            { icon: 'LinkedIn', url: 'https://linkedin.com/' },
        ],
    },
];

const milestones = [
    {
        year: '02/2025',
        title: 'Project Started',
        description:
            'The initial concept for the emotion detection system was developed.',
    },
    {
        year: '02/2025',
        title: 'First Model',
        description:
            'Trained and deployed the first version of our emotion detection model with 70% accuracy.',
    },
    {
        year: '06/2025',
        title: 'Platform Launch',
        description:
            'Officially launched our emotion detection platform with an improved model offering 95% accuracy.',
    },
];

export default function About() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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

    const shimmerKeyframes = `
        @keyframes shimmer {
            0% {
                transform: translateX(-100%);
            }
            100% {
                transform: translateX(100%);
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
                minHeight: 'calc(100vh - 80px)',
                py: { xs: 4, md: 6 },
            }}
        >
            <style>{shimmerKeyframes}</style>
            <Container maxWidth="lg">
                {/* Hero Section */}
                <MotionBox
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    sx={{
                        textAlign: 'center',
                        mb: { xs: 6, md: 8 },
                        px: { xs: 2, sm: 0 },
                    }}
                >
                    <Typography
                        variant={isMobile ? 'h3' : 'h2'}
                        component="h1"
                        gutterBottom
                        fontWeight="bold"
                        sx={{
                            mb: { xs: 2, md: 3 },
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        About Us
                    </Typography>
                    <Typography
                        variant={isMobile ? 'body1' : 'h6'}
                        color="text.secondary"
                        sx={{
                            maxWidth: 800,
                            mx: 'auto',
                            mb: { xs: 4, md: 5 },
                            lineHeight: 1.8,
                        }}
                    >
                        We are a team of experts in AI and emotion analysis,
                        with a mission to help you better understand human
                        emotions through advanced technology.
                    </Typography>

                    <Divider sx={{ width: '60%', mx: 'auto', mb: 6 }} />
                </MotionBox>

                {/* Company Timeline */}
                <Box sx={{ mb: { xs: 6, md: 8 } }}>
                    <MotionPaper
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        elevation={0}
                        sx={{
                            p: { xs: 2, md: 4 },
                            borderRadius: 3,
                            bgcolor:
                                theme.palette.mode === 'dark'
                                    ? 'rgba(255,255,255,0.05)'
                                    : 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                        }}
                    >
                        <Timeline position={isMobile ? 'right' : 'alternate'}>
                            {milestones.map((milestone, index) => (
                                <TimelineItem key={index}>
                                    <TimelineSeparator>
                                        <TimelineDot
                                            color="primary"
                                            variant="outlined"
                                            sx={{
                                                p: 1,
                                                border: 2,
                                            }}
                                        >
                                            <AccessTime />
                                        </TimelineDot>
                                        {index < milestones.length - 1 && (
                                            <TimelineConnector />
                                        )}
                                    </TimelineSeparator>
                                    <TimelineContent sx={{ py: '12px', px: 2 }}>
                                        <MotionBox
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.5,
                                                delay: index * 0.1,
                                            }}
                                            viewport={{ once: true }}
                                        >
                                            <Typography
                                                variant="overline"
                                                color="primary"
                                                fontWeight="bold"
                                            >
                                                {milestone.year}
                                            </Typography>
                                            <Typography
                                                variant="h6"
                                                fontWeight="bold"
                                            >
                                                {milestone.title}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {milestone.description}
                                            </Typography>
                                        </MotionBox>
                                    </TimelineContent>
                                </TimelineItem>
                            ))}
                        </Timeline>
                    </MotionPaper>
                </Box>

                <Box
                    sx={{
                        maxWidth: 1200,
                        mx: 'auto',
                    }}
                >
                    <Grid
                        container
                        spacing={{ xs: 2, md: 3 }}
                        component={motion.div}
                        initial="hidden"
                        animate="visible"
                        sx={{
                            width: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        {technologies.map((tech, index) => (
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                md={3}
                                key={index}
                                sx={{
                                    display: 'flex',
                                    width: {
                                        xs: '100%',
                                        sm: '50%',
                                        md: '25%',
                                    },
                                }}
                            >
                                <MotionPaper
                                    variants={itemVariants}
                                    elevation={0}
                                    sx={{
                                        p: { xs: 2, md: 3 },
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
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
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            textAlign: 'center',
                                            height: '100%',
                                            minHeight: {
                                                xs: 150,
                                                sm: 180,
                                                md: 200,
                                            },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                mb: 2,
                                                color: 'primary.main',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {tech.icon}
                                        </Box>
                                        <Box>
                                            <Typography
                                                variant="h6"
                                                gutterBottom
                                                fontWeight="bold"
                                            >
                                                {tech.title}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {tech.description}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </MotionPaper>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Team Members Section */}
                <Box sx={{ mb: { xs: 8, md: 12 }, mt: { xs: 6, md: 10 } }}>
                    <MotionBox
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true, margin: '-100px' }}
                    >
                        <Typography
                            variant={isMobile ? 'h4' : 'h3'}
                            component="h2"
                            gutterBottom
                            fontWeight="bold"
                            textAlign="center"
                            sx={{
                                mb: { xs: 4, md: 6 },
                                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Our Team
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            textAlign="center"
                            sx={{
                                maxWidth: 700,
                                mx: 'auto',
                                mb: 6,
                            }}
                        >
                            Our talented team brings together expertise in AI,
                            machine learning, and frontend development to create
                            a seamless emotion detection experience.
                        </Typography>
                    </MotionBox>

                    <Grid
                        container
                        spacing={4}
                        justifyContent="center"
                        component={motion.div}
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        {teamMembers.map((member, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <MotionPaper
                                    variants={itemVariants}
                                    elevation={0}
                                    whileHover={{
                                        scale: 1.03,
                                        boxShadow: theme.shadows[10],
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 15,
                                    }}
                                    sx={{
                                        p: 4,
                                        borderRadius: 4,
                                        bgcolor: 'background.paper',
                                        border: 1,
                                        borderColor: 'divider',
                                        textAlign: 'center',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
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
                                            height: '4px',
                                            bottom: 0,
                                            left: 0,
                                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                            transform: 'scaleX(0)',
                                            transformOrigin: 'left',
                                            transition: 'transform 0.3s ease',
                                            zIndex: 1,
                                        },
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: theme.shadows[10],
                                            '& .member-social': {
                                                opacity: 1,
                                                transform: 'translateY(0)',
                                            },
                                            '&:before': {
                                                transform: 'scaleX(1)',
                                            },
                                            '&:after': {
                                                opacity: 1,
                                            },
                                            '& .member-avatar': {
                                                borderColor:
                                                    theme.palette.secondary
                                                        .main,
                                                transform: 'scale(1.05)',
                                            },
                                            '& .member-badge': {
                                                transform:
                                                    'translateY(0) rotate(0)',
                                                opacity: 1,
                                            },
                                        },
                                    }}
                                >
                                    <Box
                                        className="member-badge"
                                        sx={{
                                            position: 'absolute',
                                            top: 20,
                                            right: 0,
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            py: 0.5,
                                            px: 2,
                                            borderTopLeftRadius: 12,
                                            borderBottomLeftRadius: 12,
                                            fontWeight: 'bold',
                                            fontSize: '0.75rem',
                                            zIndex: 2,
                                            transform:
                                                'translateY(-50px) rotate(-90deg)',
                                            opacity: 0,
                                            transition: 'all 0.4s ease',
                                            boxShadow:
                                                '0 2px 8px rgba(0,0,0,0.2)',
                                        }}
                                    >
                                        {index === 0 ? 'Frontend' : 'Backend'}
                                    </Box>

                                    <Box
                                        sx={{ position: 'relative', zIndex: 1 }}
                                    >
                                        <Avatar
                                            className="member-avatar"
                                            src={member.avatar}
                                            sx={{
                                                width: 120,
                                                height: 120,
                                                mb: 2,
                                                border: 3,
                                                borderColor: 'primary.main',
                                                boxShadow:
                                                    '0 8px 20px rgba(0,0,0,0.1)',
                                                transition: 'all 0.3s ease',
                                            }}
                                        />

                                        <Typography
                                            variant="h5"
                                            gutterBottom
                                            fontWeight="bold"
                                            sx={{ mb: 0.5 }}
                                        >
                                            {member.name}
                                        </Typography>

                                        <Typography
                                            variant="subtitle1"
                                            color="primary"
                                            sx={{
                                                mb: 2,
                                                fontWeight: 'medium',
                                                pb: 1,
                                                borderBottom: '2px solid',
                                                borderColor: 'divider',
                                                width: '60%',
                                            }}
                                        >
                                            {member.role}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mb: 3 }}
                                        >
                                            {member.description}
                                        </Typography>
                                    </Box>

                                    <Box
                                        className="member-social"
                                        sx={{
                                            mt: 'auto',
                                            display: 'flex',
                                            gap: 2,
                                            opacity: 0.9,
                                            transform: 'translateY(10px)',
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        {member.socialLinks.map(
                                            (social, idx) => (
                                                <IconButton
                                                    key={idx}
                                                    color="primary"
                                                    aria-label={social.icon}
                                                    component={motion.button}
                                                    whileHover={{
                                                        scale: 1.2,
                                                        color: theme.palette
                                                            .secondary.main,
                                                    }}
                                                    sx={{
                                                        bgcolor:
                                                            'background.paper',
                                                        boxShadow:
                                                            '0 4px 10px rgba(0,0,0,0.05)',
                                                        '&:hover': {
                                                            bgcolor:
                                                                'background.paper',
                                                        },
                                                    }}
                                                    href={social.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {social.icon ===
                                                    'GitHub' ? (
                                                        <GitHub />
                                                    ) : (
                                                        <LinkedIn />
                                                    )}
                                                </IconButton>
                                            )
                                        )}
                                    </Box>
                                </MotionPaper>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
}
