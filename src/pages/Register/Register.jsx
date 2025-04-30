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
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'Invalid email format';
        }

        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (!confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (confirmPassword !== password) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (!termsAccepted) {
            errors.terms = 'You must agree to the terms and conditions';
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
            console.error('Registration failed:', error);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle(dispatch);
            navigate('/dashboard');
        } catch (error) {
            console.error('Google registration failed:', error);
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
                        mb: 3,
                    }}
                >
                    <Typography variant="h5" fontWeight="bold">
                        Register
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
                            color: 'error.main',
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
                        label="Password"
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
                        label="Confirm Password"
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
                                    onChange={(e) =>
                                        setTermsAccepted(e.target.checked)
                                    }
                                    size="small"
                                    color={
                                        formErrors.terms ? 'error' : 'primary'
                                    }
                                />
                            }
                            label={
                                <Typography variant="body2">
                                    I agree to the{' '}
                                    <Link
                                        to="/terms"
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <Typography
                                            component="span"
                                            variant="body2"
                                            color="primary"
                                            sx={{
                                                '&:hover': {
                                                    textDecoration: 'underline',
                                                },
                                            }}
                                        >
                                            Terms
                                        </Typography>
                                    </Link>{' '}
                                    and{' '}
                                    <Link
                                        to="/privacy"
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <Typography
                                            component="span"
                                            variant="body2"
                                            color="primary"
                                            sx={{
                                                '&:hover': {
                                                    textDecoration: 'underline',
                                                },
                                            }}
                                        >
                                            Privacy Policy
                                        </Typography>
                                    </Link>
                                </Typography>
                            }
                        />
                        {formErrors.terms && (
                            <Typography
                                variant="caption"
                                color="error"
                                sx={{ ml: 2 }}
                            >
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
                        {loading ? 'Registering...' : 'Register'}
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
                            Or register with
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
                        Already have an account?{' '}
                        <Link to="/login" style={{ textDecoration: 'none' }}>
                            <Typography
                                component="span"
                                variant="body2"
                                color="primary"
                                fontWeight="medium"
                                sx={{
                                    '&:hover': { textDecoration: 'underline' },
                                }}
                            >
                                Login
                            </Typography>
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Modal>
    );
};

export default Register;
