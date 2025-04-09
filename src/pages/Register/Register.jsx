import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    TextField,
    Button,
    Typography,
    Box,
    Divider,
    Modal,
    IconButton,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import { Google as GoogleIcon, Close as CloseIcon } from '@mui/icons-material';
import {
    registerWithEmailAndPassword,
    loginWithGoogle,
} from '../../services/authService';

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

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [termsAccepted, setTermsAccepted] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);

    const validateForm = () => {
        const errors = {};

        if (!email.trim()) {
            errors.email = 'Email là bắt buộc';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'Email không hợp lệ';
        }

        if (!password) {
            errors.password = 'Mật khẩu là bắt buộc';
        } else if (password.length < 6) {
            errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!confirmPassword) {
            errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (confirmPassword !== password) {
            errors.confirmPassword = 'Mật khẩu không khớp';
        }

        if (!termsAccepted) {
            errors.terms = 'Bạn phải đồng ý với điều khoản và chính sách';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await registerWithEmailAndPassword(email, password, dispatch);
            navigate('/dashboard');
        } catch (error) {
            console.error('Đăng ký thất bại:', error);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle(dispatch);
            navigate('/dashboard');
        } catch (error) {
            console.error('Đăng ký Google thất bại:', error);
        }
    };

    const handleClose = () => {
        navigate(-1);
    };

    return (
        <Modal
            open={true}
            onClose={handleClose}
            aria-labelledby="register-modal"
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
                        Đăng Ký
                    </Typography>
                    <IconButton 
                        onClick={handleClose}
                        size="small"
                        sx={{ color: 'text.secondary' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

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

                {/* Register Form */}
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={!!formErrors.email}
                        helperText={formErrors.email}
                        margin="normal"
                        required
                        size="small"
                    />

                    <TextField
                        fullWidth
                        label="Mật khẩu"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={!!formErrors.password}
                        helperText={formErrors.password}
                        margin="normal"
                        required
                        size="small"
                    />

                    <TextField
                        fullWidth
                        label="Xác nhận mật khẩu"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={!!formErrors.confirmPassword}
                        helperText={formErrors.confirmPassword}
                        margin="normal"
                        required
                        size="small"
                    />

                    {/* Terms and Conditions */}
                    <Box sx={{ mt: 1 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    size="small"
                                    color={formErrors.terms ? 'error' : 'primary'}
                                />
                            }
                            label={
                                <Typography variant="body2">
                                    Tôi đồng ý với{' '}
                                    <Link
                                        to="/terms"
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <Typography
                                            component="span"
                                            variant="body2"
                                            color="primary"
                                            sx={{ '&:hover': { textDecoration: 'underline' } }}
                                        >
                                            Điều khoản
                                        </Typography>
                                    </Link>
                                    {' '}và{' '}
                                    <Link
                                        to="/privacy"
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <Typography
                                            component="span"
                                            variant="body2"
                                            color="primary"
                                            sx={{ '&:hover': { textDecoration: 'underline' } }}
                                        >
                                            Chính sách
                                        </Typography>
                                    </Link>
                                </Typography>
                            }
                        />
                        {formErrors.terms && (
                            <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                                {formErrors.terms}
                            </Typography>
                        )}
                    </Box>

                    {/* Register Button */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{ mt: 2, py: 1 }}
                    >
                        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </Button>
                </form>

                {/* Divider */}
                <Box sx={{ my: 2.5 }}>
                    <Divider>
                        <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ px: 1 }}
                        >
                            Hoặc đăng ký với
                        </Typography>
                    </Divider>
                </Box>

                {/* Google Login */}
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    startIcon={<GoogleIcon />}
                    sx={{ mb: 2.5, py: 1 }}
                >
                    Google
                </Button>

                {/* Login Link */}
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Đã có tài khoản?{' '}
                        <Link
                            to="/login"
                            style={{ textDecoration: 'none' }}
                        >
                            <Typography
                                component="span"
                                variant="body2"
                                color="primary"
                                fontWeight="medium"
                                sx={{ '&:hover': { textDecoration: 'underline' } }}
                            >
                                Đăng nhập
                            </Typography>
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Modal>
    );
};

export default Register;
