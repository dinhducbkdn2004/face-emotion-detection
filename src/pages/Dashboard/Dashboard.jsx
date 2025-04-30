import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    Avatar,
    IconButton,
    Divider,
    Skeleton,
    useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
    Notifications as NotificationsIcon,
    Settings as SettingsIcon,
    Favorite as FavoriteIcon,
    Person as PersonIcon,
    Psychology as PsychologyIcon,
    Autorenew as AutorenewIcon,
} from '@mui/icons-material';

const MotionPaper = motion.create(Paper);
const MotionCard = motion.create(Card);

const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // Simulate data loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

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
            transition: { duration: 0.5 },
        },
    };

    const statCards = [
        {
            title: 'Total Analyses',
            value: loading ? null : '28',
            icon: <PsychologyIcon sx={{ fontSize: 40 }} />,
            color: theme.palette.primary.main,
        },
        {
            title: 'Recent Activity',
            value: loading ? null : '5',
            icon: <AutorenewIcon sx={{ fontSize: 40 }} />,
            color: theme.palette.info.main,
        },
        {
            title: 'Saved Items',
            value: loading ? null : '12',
            icon: <FavoriteIcon sx={{ fontSize: 40 }} />,
            color: theme.palette.error.main,
        },
    ];

    const recentActivities = [
        {
            id: 1,
            type: 'Face Analysis',
            date: '2025-04-28',
            time: '14:30',
            result: 'Happy (92%)',
        },
        {
            id: 2,
            type: 'Text Analysis',
            date: '2025-04-27',
            time: '09:15',
            result: 'Neutral (78%)',
        },
        {
            id: 3,
            type: 'Face Analysis',
            date: '2025-04-25',
            time: '16:45',
            result: 'Surprised (85%)',
        },
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box
                component={motion.div}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Welcome Section */}
                <MotionPaper
                    variants={itemVariants}
                    elevation={0}
                    sx={{
                        p: { xs: 3, md: 4 },
                        mb: 4,
                        borderRadius: 4,
                        border: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            src={user?.photoURL}
                            alt={user?.displayName}
                            sx={{
                                width: { xs: 60, md: 70 },
                                height: { xs: 60, md: 70 },
                                border: 3,
                                borderColor: 'primary.main',
                            }}
                        >
                            {user?.displayName?.charAt(0) ||
                                user?.email?.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography
                                variant={isMobile ? 'h5' : 'h4'}
                                fontWeight="bold"
                                gutterBottom
                            >
                                Welcome back,{' '}
                                {user?.displayName?.split(' ')[0] || 'User'}!
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Today is{' '}
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </Typography>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1,
                            ml: { xs: 0, sm: 'auto' },
                            mt: { xs: 2, sm: 0 },
                        }}
                    >
                        <IconButton
                            color="primary"
                            sx={{
                                bgcolor: 'action.hover',
                                '&:hover': { bgcolor: 'action.selected' },
                            }}
                        >
                            <NotificationsIcon />
                        </IconButton>
                        <IconButton
                            color="primary"
                            sx={{
                                bgcolor: 'action.hover',
                                '&:hover': { bgcolor: 'action.selected' },
                            }}
                        >
                            <SettingsIcon />
                        </IconButton>
                        <IconButton
                            color="primary"
                            sx={{
                                bgcolor: 'action.hover',
                                '&:hover': { bgcolor: 'action.selected' },
                            }}
                        >
                            <PersonIcon />
                        </IconButton>
                    </Box>
                </MotionPaper>

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {statCards.map((card, index) => (
                        <Grid item xs={12} sm={4} key={card.title}>
                            <MotionCard
                                variants={itemVariants}
                                sx={{
                                    borderRadius: 4,
                                    height: '100%',
                                    boxShadow: 'none',
                                    border: 1,
                                    borderColor: 'divider',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: 8,
                                        height: '100%',
                                        backgroundColor: card.color,
                                    },
                                }}
                            >
                                <CardContent sx={{ pl: 4 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Box>
                                            <Typography
                                                color="text.secondary"
                                                gutterBottom
                                                variant="subtitle1"
                                            >
                                                {card.title}
                                            </Typography>
                                            {loading ? (
                                                <Skeleton
                                                    width={60}
                                                    height={40}
                                                    variant="text"
                                                />
                                            ) : (
                                                <Typography
                                                    variant="h3"
                                                    fontWeight="bold"
                                                >
                                                    {card.value}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Box
                                            sx={{
                                                backgroundColor: 'action.hover',
                                                borderRadius: '50%',
                                                width: 60,
                                                height: 60,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: card.color,
                                            }}
                                        >
                                            {card.icon}
                                        </Box>
                                    </Box>
                                </CardContent>
                            </MotionCard>
                        </Grid>
                    ))}
                </Grid>

                {/* Recent Activity & Quick Actions */}
                <Grid container spacing={4}>
                    {/* Recent Activity */}
                    <Grid item xs={12} md={7}>
                        <MotionPaper
                            variants={itemVariants}
                            elevation={0}
                            sx={{
                                p: { xs: 2, md: 3 },
                                borderRadius: 4,
                                border: 1,
                                borderColor: 'divider',
                                height: '100%',
                            }}
                        >
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                sx={{ mb: 3 }}
                            >
                                Recent Activity
                            </Typography>

                            {loading
                                ? Array.from(new Array(3)).map((_, index) => (
                                      <Box key={index} sx={{ mb: 2 }}>
                                          <Skeleton
                                              variant="text"
                                              width="60%"
                                              height={30}
                                          />
                                          <Skeleton
                                              variant="text"
                                              width="40%"
                                              height={20}
                                          />
                                          <Skeleton
                                              variant="text"
                                              width="25%"
                                              height={20}
                                          />
                                          {index < 2 && (
                                              <Divider sx={{ my: 2 }} />
                                          )}
                                      </Box>
                                  ))
                                : recentActivities.map((activity, index) => (
                                      <Box key={activity.id}>
                                          <Box
                                              sx={{
                                                  display: 'flex',
                                                  justifyContent:
                                                      'space-between',
                                                  flexWrap: 'wrap',
                                              }}
                                          >
                                              <Typography fontWeight="medium">
                                                  {activity.type}
                                              </Typography>
                                              <Typography
                                                  color="text.secondary"
                                                  variant="body2"
                                              >
                                                  {activity.date},{' '}
                                                  {activity.time}
                                              </Typography>
                                          </Box>
                                          <Typography
                                              color="primary"
                                              sx={{ mt: 0.5 }}
                                          >
                                              Result: {activity.result}
                                          </Typography>
                                          {index <
                                              recentActivities.length - 1 && (
                                              <Divider sx={{ my: 2 }} />
                                          )}
                                      </Box>
                                  ))}
                        </MotionPaper>
                    </Grid>

                    {/* Quick Actions */}
                    <Grid item xs={12} md={5}>
                        <MotionPaper
                            variants={itemVariants}
                            elevation={0}
                            sx={{
                                p: { xs: 2, md: 3 },
                                borderRadius: 4,
                                border: 1,
                                borderColor: 'divider',
                                height: '100%',
                            }}
                        >
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                sx={{ mb: 3 }}
                            >
                                Quick Actions
                            </Typography>

                            {/* Add your quick action buttons/cards here */}
                            <Typography color="text.secondary">
                                Coming soon! Quick action buttons will be
                                available in the next update.
                            </Typography>
                        </MotionPaper>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default Dashboard;
