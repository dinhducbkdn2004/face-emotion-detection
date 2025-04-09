import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { FaceRetouchingOff, Psychology, SentimentSatisfied } from '@mui/icons-material';

const MotionBox = motion.create(Box);
const MotionPaper = motion.create(Paper);

const featuresList = [
    {
        icon: <Psychology sx={{ fontSize: 40 }} />,
        title: 'Phân tích cảm xúc',
        description: 'Nhận diện và phân tích cảm xúc từ hình ảnh và văn bản.',
    },
    {
        icon: <FaceRetouchingOff sx={{ fontSize: 40 }} />,
        title: 'Nhận diện khuôn mặt',
        description: 'Công nghệ nhận diện khuôn mặt tiên tiến với độ chính xác cao.',
    },
    {
        icon: <SentimentSatisfied sx={{ fontSize: 40 }} />,
        title: 'Báo cáo chi tiết',
        description: 'Phân tích và báo cáo chi tiết về cảm xúc theo thời gian thực.',
    },
];

export default function Home() {
    const theme = useTheme();

    return (
        <Container maxWidth="lg">
            <Grid container spacing={4} sx={{ py: 8 }}>
                {/* Hero Section */}
                <Grid item xs={12}>
                    <MotionBox
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        sx={{
                            textAlign: 'center',
                            mb: 8
                        }}
                    >
                        <Typography
                            component={motion.h1}
                            variant="h2"
                            fontWeight="bold"
                            gutterBottom
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            Khám phá Cảm xúc
                            <Typography
                                component="span"
                                variant="h2"
                                fontWeight="bold"
                                color="primary"
                            >
                                {' '}Thông minh
                            </Typography>
                        </Typography>
                        <Typography
                            variant="h5"
                            color="text.secondary"
                            sx={{ mb: 4 }}
                            component={motion.p}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            Phân tích cảm xúc chính xác với công nghệ AI tiên tiến
                        </Typography>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Button
                                variant="contained"
                                size="large"
                                sx={{
                                    mr: 2,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    py: 1.5,
                                    px: 4,
                                }}
                            >
                                Bắt đầu ngay
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    py: 1.5,
                                    px: 4,
                                }}
                            >
                                Tìm hiểu thêm
                            </Button>
                        </motion.div>
                    </MotionBox>
                </Grid>

                {/* Features Section */}
                <Grid item xs={12}>
                    <Grid container spacing={4}>
                        {featuresList.map((feature, index) => (
                            <Grid item xs={12} md={4} key={index}>
                                <MotionPaper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        height: '100%',
                                        borderRadius: 4,
                                        bgcolor: 'background.paper',
                                        border: 1,
                                        borderColor: 'divider',
                                        '&:hover': {
                                            bgcolor: theme.palette.mode === 'dark' 
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
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
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
                                            {feature.icon}
                                        </Box>
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
                                </MotionPaper>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
}
