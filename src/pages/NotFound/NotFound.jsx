import React from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SentimentDissatisfied } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useUser } from '../../components/account/UserContext';

const NotFound = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const { isAuthenticated } = useUser();

    // Xử lý khi người dùng bấm nút Quay lại
    const handleGoBack = () => {
        // Kiểm tra xem có trang trước đó không
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            // Nếu không có trang trước đó, chuyển hướng về trang chủ hoặc trang đăng nhập
            if (isAuthenticated) {
                navigate('/dashboard');
            } else {
                navigate('/');
            }
        }
    };

    return (
        <Container maxWidth="md">
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    mt: 4,
                    borderRadius: 3,
                    textAlign: 'center',
                    background:
                        theme.palette.mode === 'dark'
                            ? 'linear-gradient(145deg, #1e1e1e, #282828)'
                            : 'linear-gradient(145deg, #fefefe, #f5f5f5)',
                    boxShadow:
                        theme.palette.mode === 'dark'
                            ? '0 6px 24px rgba(0, 0, 0, 0.2)'
                            : '0 6px 24px rgba(0, 0, 0, 0.05)',
                }}
            >
                <SentimentDissatisfied
                    sx={{
                        fontSize: 80,
                        color: theme.palette.primary.main,
                        mb: 2,
                    }}
                />
                <Typography
                    variant="h3"
                    component="h1"
                    gutterBottom
                    sx={{
                        fontWeight: 'bold',
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    404 - Không tìm thấy trang
                </Typography>
                <Typography
                    variant="h6"
                    color="text.secondary"
                    paragraph
                    sx={{ mb: 4 }}
                >
                    Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() =>
                            navigate(isAuthenticated ? '/dashboard' : '/')
                        }
                    >
                        Về trang chủ
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={handleGoBack}
                    >
                        Quay lại
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default NotFound;
