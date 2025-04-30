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
            setError('Email is required');
            return;
        }

        try {
            setLoading(true);
            await resetPassword(email);
            setSuccess(true);
            setEmail('');
        } catch (error) {
            console.error('Error sending recovery email:', error);
            setError('Unable to send recovery email. Please try again later.');
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
                        mb: 3,
                    }}
                >
                    <Typography variant="h5" fontWeight="bold">
                        Forgot Password
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
                    {window.location.search.includes('expired')
                        ? 'Your password reset link has expired or has been used. Please request a new link.'
                        : 'Enter your email address and we will send instructions to reset your password.'}
                </Typography>

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

                {success ? (
                    // Success State
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Typography
                            color="success.main"
                            sx={{ mb: 2 }}
                            variant="body1"
                        >
                            Password recovery email has been sent!
                        </Typography>
                        <Typography
                            color="text.secondary"
                            sx={{ mb: 3 }}
                            variant="body2"
                        >
                            Please check your inbox and follow the instructions.
                        </Typography>
                        <Button
                            component={Link}
                            to="/login"
                            variant="contained"
                            fullWidth
                            sx={{ py: 1 }}
                        >
                            Return to Login
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
                            {loading
                                ? 'Sending...'
                                : window.location.search.includes('expired')
                                  ? 'Send New Link'
                                  : 'Send Recovery Email'}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Link
                                to="/login"
                                style={{ textDecoration: 'none' }}
                            >
                                <Typography
                                    variant="body2"
                                    color="primary"
                                    sx={{
                                        '&:hover': {
                                            textDecoration: 'underline',
                                        },
                                    }}
                                >
                                    Back to Login
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
