import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Checkbox,
    FormControlLabel,
    Box,
    Divider,
    Modal,
    IconButton,
} from '@mui/material';
import { Google as GoogleIcon, Close as CloseIcon } from '@mui/icons-material';
import {
    loginWithEmailAndPassword,
    loginWithGoogle,
} from '../../services/authService';
import { clearErrors } from '../../store/slices/authSlice';

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

const Login = () => {
    // ... existing state and hooks ...
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

    const from = location.state?.from?.pathname || '/dashboard';

    // ... existing useEffects and handlers ...
    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    useEffect(() => {
        return () => {
            dispatch(clearErrors());
        };
    }, [dispatch]);

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

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        try {
            await loginWithEmailAndPassword(email, password, dispatch, rememberMe);
        } catch (error) {
            console.error('Đăng nhập thất bại:', error);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle(dispatch);
        } catch (error) {
            console.error('Đăng nhập Google thất bại:', error);
        }
    };

    const handleClose = () => {
        navigate(-1);
    };

    return (
        <Modal
            open={true}
            onClose={handleClose}
            aria-labelledby="login-modal"
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
                        Đăng Nhập
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
                        <Typography variant="body2">
                            {error}
                        </Typography>
                    </Box>
                )}

                {/* Login Form */}
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

                    {/* Remember Me & Forgot Password */}
                    <Box 
                        sx={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            my: 1
                        }}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    size="small"
                                />
                            }
                            label={
                                <Typography variant="body2">
                                    Ghi nhớ đăng nhập
                                </Typography>
                            }
                        />
                        <Link
                            to="/forgot-password"
                            style={{ textDecoration: 'none' }}
                        >
                            <Typography 
                                variant="body2" 
                                color="primary"
                                sx={{ '&:hover': { textDecoration: 'underline' } }}
                            >
                                Quên mật khẩu?
                            </Typography>
                        </Link>
                    </Box>

                    {/* Login Button */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{ mt: 2, py: 1 }}
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
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
                            Hoặc đăng nhập với
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

                {/* Register Link */}
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Chưa có tài khoản?{' '}
                        <Link
                            to="/register"
                            style={{ textDecoration: 'none' }}
                        >
                            <Typography
                                component="span"
                                variant="body2"
                                color="primary"
                                fontWeight="medium"
                                sx={{ '&:hover': { textDecoration: 'underline' } }}
                            >
                                Đăng ký ngay
                            </Typography>
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Modal>
    );
};

export default Login;
