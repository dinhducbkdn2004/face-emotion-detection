import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  TextField,
  Button,
  Alert,
  Box,
  Divider,
  Typography,
  CircularProgress
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface LoginFormProps {
  onClose: () => void;
}

const GoogleButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderColor: theme.palette.grey[300],
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
    borderColor: theme.palette.grey[400],
  },
  textTransform: 'none',
}));

const LoginButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  textTransform: 'none',
}));

const DividerWithText = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  margin: theme.spacing(2, 0),
  '&::before, &::after': {
    content: '""',
    flex: 1,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '& > *': {
    margin: theme.spacing(0, 2),
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
  },
}));

export default function LoginForm({ onClose }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { logIn, googleSignIn } = useAuth();
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await logIn(email, password);
      onClose();
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setError('');
      setLoading(true);
      await googleSignIn();
      onClose();
    } catch (err) {
      setError('Đăng nhập Google thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email"
        name="email"
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Mật khẩu"
        type="password"
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      
      <LoginButton
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={loading}
        sx={{ mt: 3, mb: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Đăng nhập'}
      </LoginButton>

      <DividerWithText>
        <Typography variant="body2">hoặc</Typography>
      </DividerWithText>

      <GoogleButton
        fullWidth
        variant="outlined"
        startIcon={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.79-1.677-4.184-2.702-6.735-2.702-5.522 0-10 4.478-10 10s4.478 10 10 10c8.396 0 10.189-7.839 9.436-11.65l-9.436 0.016z"
                fill="#4285F4"
              />
              <path
                d="M12.545 10.239l-9.436 0.016c-0.178 1.125 0 2.375 0.49 3.49l8.946-0.005v-3.501z"
                fill="#34A853"
              />
              <path
                d="M7.036 14.278l-4.998 4.998c1.098 2.175 3.385 3.666 6.007 3.666 2.313 0 4.256-0.763 5.668-2.045l-4.677-3.619c-0.735 0.487-1.654 0.769-2.61 0.748-1.874-0.038-3.51-1.148-4.39-2.748z"
                fill="#FBBC05"
              />
              <path
                d="M12.545 8.255c1.522-0.018 2.866 0.543 4.007 1.589l2.713-2.713c-1.893-1.768-4.366-2.827-6.72-2.827-2.622 0-4.909 1.491-6.007 3.666l4.998 4.998c0.88-1.6 2.516-2.71 4.39-2.748l0.619 0.035z"
                fill="#EA4335"
              />
            </svg>
          </Box>
        }
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        Đăng nhập với Google
      </GoogleButton>
    </Box>
  );
} 