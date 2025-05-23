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
            'Using Python, FastAPI, and SocketIO to create a backend server.',
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
        title: 'Train Model',
        description:
            'Trained and deployed the first version of our emotion detection model with 70% accuracy.',
    },
    {
        year: '03-04/2025',
        title: 'Build a Website',
        description: 'Build a website to display the emotion detection model.',
    },
    {
        year: '05/2025',
        title: 'Deploy Model & Website',
        description:
            'Deploy the emotion detection model and website to the cloud.',
    },
    {
        year: '06/2025',
        title: 'Platform Launch',
        description:
            'First version of the platform was launched with a simple interface and limited features.',
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
                        variant={isMobile ? 'h4' : 'h3'}
                        component="h1"
                        gutterBottom
                        fontWeight="bold"
                        sx={{
                            mb: { xs: 1.5, md: 2 },
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        About Us
                    </Typography>
                    <Typography
                        variant={isMobile ? 'body2' : 'body1'}
                        color="text.secondary"
                        sx={{
                            maxWidth: 700,
                            mx: 'auto',
                            mb: { xs: 3, md: 4 },
                            lineHeight: 1.6,
                        }}
                    >
                        We are a team of students from Da Nang University of
                        Technology, with a passion for creating innovative
                        solutions. We are currently working on a project to
                        detect emotions from images.
                    </Typography>

                    <Divider sx={{ width: '50%', mx: 'auto', mb: 4 }} />
                </MotionBox>

                {/* Company Timeline */}
                <Box sx={{ mb: { xs: 4, md: 6 } }}>
                    <MotionPaper
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        elevation={0}
                        sx={{
                            p: { xs: 2, md: 3 },
                            borderRadius: 3,
                            bgcolor:
                                theme.palette.mode === 'dark'
                                    ? 'rgba(255,255,255,0.05)'
                                    : 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
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
                        maxWidth: 1000,
                        mx: 'auto',
                        width: '100%',
                    }}
                >
                    <MotionBox
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true, margin: '-100px' }}
                        sx={{ mb: 4 }}
                    >
                        <Typography
                            variant={isMobile ? 'h5' : 'h4'}
                            component="h2"
                            gutterBottom
                            fontWeight="bold"
                            textAlign="center"
                            sx={{
                                mb: { xs: 2, md: 3 },
                                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Our Technologies
                        </Typography>
                    </MotionBox>
                    <Grid
                        container
                        spacing={{ xs: 2, md: 2 }}
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
                                md={4}
                                key={index}
                                sx={{
                                    display: 'flex',
                                    width: {
                                        xs: '100%',
                                        sm: '50%',
                                        md: 'calc(100% / 3)',
                                    },
                                }}
                            >
                                <MotionPaper
                                    variants={itemVariants}
                                    elevation={0}
                                    sx={{
                                        p: { xs: 2, md: 2.5 },
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        borderRadius: 3,
                                        bgcolor: 'background.paper',
                                        border: 1,
                                        borderColor: 'divider',
                                        '&:hover': {
                                            bgcolor:
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.05)'
                                                    : 'rgba(0, 0, 0, 0.02)',
                                            transform: 'translateY(-3px)',
                                            boxShadow: theme.shadows[3],
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
                                                xs: 120,
                                                sm: 150,
                                                md: 170,
                                            },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                mb: 1.5,
                                                color: 'primary.main',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                '& svg': {
                                                    fontSize: '30px',
                                                },
                                            }}
                                        >
                                            {tech.icon}
                                        </Box>
                                        <Box>
                                            <Typography
                                                variant="subtitle1"
                                                gutterBottom
                                                fontWeight="bold"
                                            >
                                                {tech.title}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ fontSize: '0.85rem' }}
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
                <Box sx={{ mb: { xs: 5, md: 8 }, mt: { xs: 4, md: 5 } }}>
                    <MotionBox
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true, margin: '-100px' }}
                    >
                        <Typography
                            variant={isMobile ? 'h5' : 'h4'}
                            component="h2"
                            gutterBottom
                            fontWeight="bold"
                            textAlign="center"
                            sx={{
                                mb: { xs: 2, md: 3 },
                                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Our Team
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            textAlign="center"
                            sx={{
                                maxWidth: 600,
                                mx: 'auto',
                                mb: 4,
                            }}
                        >
                            Our talented team brings together expertise in AI,
                            machine learning, and frontend development to create
                            a seamless emotion detection experience.
                        </Typography>
                    </MotionBox>

                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            gap: 3,
                            flexWrap: { xs: 'wrap', sm: 'nowrap' },
                            width: '100%',
                            maxWidth: '1000px',
                            mx: 'auto',
                            px: { xs: 2, sm: 3 },
                        }}
                        component={motion.div}
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        {teamMembers.map((member, index) => (
                            <MotionPaper
                                key={index}
                                variants={itemVariants}
                                elevation={0}
                                whileHover={{
                                    scale: 1.02,
                                    boxShadow: theme.shadows[5],
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 15,
                                }}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    bgcolor: 'background.paper',
                                    border: 1,
                                    borderColor: 'divider',
                                    textAlign: 'center',
                                    flex: {
                                        xs: '1 1 100%',
                                        sm: '1 1 calc(50% - 1.5rem)',
                                    },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Avatar
                                    src={member.avatar}
                                    sx={{
                                        width: 90,
                                        height: 90,
                                        mx: 'auto',
                                        mb: 2,
                                        border: 3,
                                        borderColor: 'primary.main',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    gutterBottom
                                >
                                    {member.name}
                                </Typography>
                                <Typography
                                    variant="subtitle2"
                                    color="primary"
                                    gutterBottom
                                >
                                    {member.role}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 2 }}
                                >
                                    {member.description}
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 1,
                                        justifyContent: 'center',
                                        mt: 'auto',
                                    }}
                                >
                                    {member.socialLinks.map((link, i) => (
                                        <IconButton
                                            key={i}
                                            href={link.url}
                                            target="_blank"
                                            size="small"
                                            sx={{
                                                color: 'primary.main',
                                                '&:hover': {
                                                    color: 'primary.dark',
                                                    transform: 'scale(1.1)',
                                                },
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            {link.icon === 'GitHub' ? (
                                                <GitHub />
                                            ) : (
                                                <LinkedIn />
                                            )}
                                        </IconButton>
                                    ))}
                                </Box>
                            </MotionPaper>
                        ))}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
