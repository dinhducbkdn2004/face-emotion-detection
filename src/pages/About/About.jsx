import { Box, Container, Typography, Grid, Avatar, Paper, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { Security, Speed, Psychology, Construction } from '@mui/icons-material';

const MotionBox = motion.create(Box);
const MotionPaper = motion.create(Paper);

const technologies = [
    {
        icon: <Security sx={{ fontSize: 40 }} />,
        title: 'Bảo mật',
        description: 'Ứng dụng của chúng tôi đảm bảo an toàn dữ liệu với tiêu chuẩn bảo mật cao nhất.',
    },
    {
        icon: <Speed sx={{ fontSize: 40 }} />,
        title: 'Hiệu suất',
        description: 'Tốc độ xử lý nhanh chóng với công nghệ tối ưu hóa hiện đại.',
    },
    {
        icon: <Psychology sx={{ fontSize: 40 }} />,
        title: 'AI Tiên tiến',
        description: 'Sử dụng các mô hình AI tiên tiến nhất trong việc phân tích cảm xúc.',
    },
    {
        icon: <Construction sx={{ fontSize: 40 }} />,
        title: 'Liên tục cập nhật',
        description: 'Thường xuyên cập nhật với các tính năng mới và cải tiến.',
    },
];

const teamMembers = [
    {
        name: 'Nguyễn Văn A',
        role: 'Founder & CEO',
        avatar: 'https://i.pravatar.cc/150?img=1',
        description: 'Chuyên gia về AI với hơn 10 năm kinh nghiệm trong lĩnh vực machine learning.',
    },
    {
        name: 'Trần Thị B',
        role: 'Lead Developer',
        avatar: 'https://i.pravatar.cc/150?img=2',
        description: 'Full-stack developer với kinh nghiệm phát triển các ứng dụng AI quy mô lớn.',
    },
    {
        name: 'Lê Văn C',
        role: 'AI Engineer',
        avatar: 'https://i.pravatar.cc/150?img=3',
        description: 'Nghiên cứu sinh về Deep Learning, chuyên gia về xử lý ngôn ngữ tự nhiên.',
    },
];

export default function About() {
    const theme = useTheme();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
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
            <Grid container spacing={6} sx={{ py: 8 }}>
                {/* Mission Statement */}
                <Grid item xs={12}>
                    <MotionBox
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        sx={{ textAlign: 'center', mb: 6 }}
                    >
                        <Typography
                            variant="h3"
                            component="h1"
                            gutterBottom
                            fontWeight="bold"
                            sx={{ mb: 3 }}
                        >
                            Về Chúng Tôi
                        </Typography>
                        <Typography
                            variant="h5"
                            color="text.secondary"
                            sx={{ 
                                maxWidth: 800, 
                                mx: 'auto', 
                                mb: 4,
                                lineHeight: 1.8
                            }}
                        >
                            Chúng tôi là đội ngũ chuyên gia về AI và phân tích cảm xúc,
                            với sứ mệnh giúp bạn hiểu rõ hơn về cảm xúc con người
                            thông qua công nghệ tiên tiến.
                        </Typography>
                    </MotionBox>
                </Grid>

                {/* Technologies */}
                <Grid item xs={12}>
                    <Typography
                        variant="h4"
                        component="h2"
                        gutterBottom
                        fontWeight="bold"
                        sx={{ textAlign: 'center', mb: 4 }}
                    >
                        Công nghệ của chúng tôi
                    </Typography>
                    <Grid container spacing={3} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
                        {technologies.map((tech, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <MotionPaper
                                    variants={itemVariants}
                                    elevation={0}
                                    sx={{
                                        p: 3,
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
                                            {tech.icon}
                                        </Box>
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
                                </MotionPaper>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>

                {/* Team Members */}
                <Grid item xs={12} sx={{ mt: 4 }}>
                    <Typography
                        variant="h4"
                        component="h2"
                        gutterBottom
                        fontWeight="bold"
                        sx={{ textAlign: 'center', mb: 4 }}
                    >
                        Đội ngũ của chúng tôi
                    </Typography>
                    <Grid container spacing={4} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
                        {teamMembers.map((member, index) => (
                            <Grid item xs={12} md={4} key={index}>
                                <MotionPaper
                                    variants={itemVariants}
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        height: '100%',
                                        borderRadius: 4,
                                        bgcolor: 'background.paper',
                                        border: 1,
                                        borderColor: 'divider',
                                        textAlign: 'center',
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
                                            width: 120,
                                            height: 120,
                                            mx: 'auto',
                                            mb: 2,
                                            border: 3,
                                            borderColor: 'primary.main',
                                        }}
                                    />
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
                                        sx={{ mt: 2 }}
                                    >
                                        {member.description}
                                    </Typography>
                                </MotionPaper>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
}
