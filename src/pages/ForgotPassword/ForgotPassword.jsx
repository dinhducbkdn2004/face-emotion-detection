import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    TextField,
    Button,
    Typography,
    Box,
    Modal,
    IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { resetPassword } from '../../services/authService';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 450 },
    maxHeight: '90vh',
    overflow: 'auto',
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 3,
};

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('Email là bắt buộc');
            return;
        }

        try {
            setLoading(true);
            await resetPassword(email);
            setSuccess(true);
            setEmail('');
        } catch (error) {
            console.error('Lỗi khi gửi email khôi phục:', error);
            setError('Không thể gửi email khôi phục. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        navigate(-1);
    };

    return (
        <Modal
            open={true}
            onClose={handleClose}
            aria-labelledby="forgot-password-modal"
        >
            <Box sx={modalStyle}>
                {/* Header */}
                <Box 
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3
                    }}
                >
                    <Typography variant="h5" fontWeight="bold">
                        Quên mật khẩu
                    </Typography>
                    <IconButton 
                        onClick={handleClose}
                        size="small"
                        sx={{ color: 'text.secondary' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Description */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                >
                    {window.location.search.includes('expired') ?
                        'Liên kết đặt lại mật khẩu của bạn đã hết hạn hoặc đã được sử dụng. Vui lòng yêu cầu một liên kết mới.' :
                        'Nhập địa chỉ email của bạn, chúng tôi sẽ gửi hướng dẫn để đặt lại mật khẩu.'}
                </Typography>

                {/* Error Message */}
                {error && (
                    <Box 
                        sx={{ 
                            mb: 2,
                            p: 1.5,
                            bgcolor: 'error.light',
                            borderRadius: 1,
                            color: 'error.main'
                        }}
                    >
                        <Typography variant="body2">{error}</Typography>
                    </Box>
                )}

                {success ? (
                    // Success State
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Typography 
                            color="success.main" 
                            sx={{ mb: 2 }}
                            variant="body1"
                        >
                            Email khôi phục mật khẩu đã được gửi!
                        </Typography>
                        <Typography 
                            color="text.secondary" 
                            sx={{ mb: 3 }}
                            variant="body2"
                        >
                            Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn.
                        </Typography>
                        <Button
                            component={Link}
                            to="/login"
                            variant="contained"
                            fullWidth
                            sx={{ py: 1 }}
                        >
                            Quay lại đăng nhập
                        </Button>
                    </Box>
                ) : (
                    // Form State
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            margin="normal"
                            required
                            size="small"
                            error={!!error}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2, py: 1 }}
                        >
                            {loading ? 'Đang gửi...' : window.location.search.includes('expired') ? 'Gửi liên kết mới' : 'Gửi email khôi phục'}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Link
                                to="/login"
                                style={{ textDecoration: 'none' }}
                            >
                                <Typography
                                    variant="body2"
                                    color="primary"
                                    sx={{ '&:hover': { textDecoration: 'underline' } }}
                                >
                                    Quay lại đăng nhập
                                </Typography>
                            </Link>
                        </Box>
                    </form>
                )}
            </Box>
        </Modal>
    );
};

export default ForgotPassword;
