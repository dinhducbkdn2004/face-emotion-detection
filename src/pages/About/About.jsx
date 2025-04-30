import {
    Box,
    Container,
    Typography,
    Grid,
    Avatar,
    Paper,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Security, Speed, Psychology, Construction } from '@mui/icons-material';

const MotionBox = motion.create(Box);
const MotionPaper = motion.create(Paper);

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
    {
        icon: <Construction sx={{ fontSize: 40 }} />,
        title: 'Continuous Updates',
        description: 'Regularly updated with new features and improvements.',
    },
];

const teamMembers = [
    {
        name: 'Dinh Duc',
        role: 'Frontend Developer',
        avatar: '/avatar_duc.jpg',
        description:
            'Expert in user interface development with over 5 years of experience in this field.',
    },
    {
        name: 'Le Duc Bao',
        role: 'Backend Developer & Model Training',
        avatar: '/avatar_ldb.webp',
        description:
            'AI expert with over 10 years of experience in machine learning.',
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
            },
        },
    };

    return (
        <Container maxWidth="lg">
            <Grid
                container
                spacing={{ xs: 3, md: 6 }}
                sx={{ py: { xs: 4, md: 8 } }}
            >
                {/* Mission Statement */}
                <Grid item xs={12}>
                    <MotionBox
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        sx={{
                            textAlign: 'center',
                            mb: { xs: 3, md: 6 },
                            px: { xs: 2, sm: 0 },
                        }}
                    >
                        <Typography
                            variant={isMobile ? 'h4' : 'h3'}
                            component="h1"
                            gutterBottom
                            fontWeight="bold"
                            sx={{ mb: { xs: 2, md: 3 } }}
                        >
                            About Us
                        </Typography>
                        <Typography
                            variant={isMobile ? 'body1' : 'h5'}
                            color="text.secondary"
                            sx={{
                                maxWidth: 800,
                                mx: 'auto',
                                mb: { xs: 2, md: 4 },
                                lineHeight: 1.8,
                            }}
                        >
                            We are a team of experts in AI and emotion analysis,
                            with a mission to help you better understand human
                            emotions through advanced technology.
                        </Typography>
                    </MotionBox>
                </Grid>

                {/* Technologies */}
                <Grid item xs={12}>
                    <Typography
                        variant={isMobile ? 'h5' : 'h4'}
                        component="h2"
                        gutterBottom
                        fontWeight="bold"
                        sx={{
                            textAlign: 'center',
                            mb: { xs: 2, md: 4 },
                            px: { xs: 2, sm: 0 },
                        }}
                    >
                        Our Technology
                    </Typography>
                    <Grid
                        container
                        spacing={{ xs: 2, md: 3 }}
                        component={motion.div}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {technologies.map((tech, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <MotionPaper
                                    variants={itemVariants}
                                    elevation={0}
                                    sx={{
                                        p: { xs: 2, md: 3 },
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
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: isMobile
                                                ? 'row'
                                                : 'column',
                                            alignItems: isMobile
                                                ? 'flex-start'
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
                </Grid>

                {/* Team Members */}
                <Grid item xs={12} sx={{ mt: { xs: 2, md: 4 } }}>
                    <Typography
                        variant={isMobile ? 'h5' : 'h4'}
                        component="h2"
                        gutterBottom
                        fontWeight="bold"
                        sx={{
                            textAlign: 'center',
                            mb: { xs: 2, md: 4 },
                            px: { xs: 2, sm: 0 },
                        }}
                    >
                        Our Team
                    </Typography>
                    <Grid
                        container
                        spacing={{ xs: 3, md: 4 }}
                        justifyContent="center"
                        component={motion.div}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {teamMembers.map((member, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <MotionPaper
                                    variants={itemVariants}
                                    elevation={0}
                                    sx={{
                                        p: { xs: 3, md: 4 },
                                        height: '100%',
                                        borderRadius: 4,
                                        bgcolor: 'background.paper',
                                        border: 1,
                                        borderColor: 'divider',
                                        display: 'flex',
                                        flexDirection: isMobile
                                            ? 'row'
                                            : 'column',
                                        alignItems: isMobile
                                            ? 'center'
                                            : 'center',
                                        textAlign: isMobile ? 'left' : 'center',
                                        gap: isMobile ? 3 : 0,
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: theme.shadows[4],
                                        },
                                        transition: 'all 0.3s ease-in-out',
                                    }}
                                >
                                    <Avatar
                                        src={member.avatar}
                                        alt={member.name}
                                        sx={{
                                            width: isMobile ? 80 : 120,
                                            height: isMobile ? 80 : 120,
                                            mx: isMobile ? 0 : 'auto',
                                            mb: isMobile ? 0 : 2,
                                            border: 3,
                                            borderColor: 'primary.main',
                                            flexShrink: 0,
                                        }}
                                    />
                                    <Box>
                                        <Typography
                                            variant="h6"
                                            gutterBottom
                                            fontWeight="bold"
                                        >
                                            {member.name}
                                        </Typography>
                                        <Typography
                                            variant="subtitle1"
                                            color="primary"
                                            gutterBottom
                                        >
                                            {member.role}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mt: isMobile ? 1 : 2 }}
                                        >
                                            {member.description}
                                        </Typography>
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
