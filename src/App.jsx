import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useUser } from './components/account/UserContext';
import { useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import LoginPage from './pages/Login/Login';
import RegisterPage from './pages/Register/Register';
import ForgotPasswordPage from './pages/ForgotPassword/ForgotPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import History from './pages/History/History';
import HistoryDetail from './pages/History/HistoryDetail';
import Guest from './pages/Guest/Guest';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useUser();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

const PublicOnlyRoute = ({ children }) => {
    const { isAuthenticated } = useUser();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    useEffect(() => {
        fetch('https://ped.ldblckrs.id.vn/auth/profile', {
            method: 'GET',
            credentials: 'include',
        });
    }, []);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: (theme) =>
                    theme.palette.mode === 'dark'
                        ? 'linear-gradient(to bottom, #121212, #1e1e1e)'
                        : 'linear-gradient(to bottom, #f9fafb, #f5f5f5)',
                color: 'text.primary',
            }}
        >
            <Navbar />
            <Box
                component="main"
                sx={{
                    width: '85%',
                    maxWidth: '1100px',
                    mx: 'auto',
                    height: '100%',
                    pt: '70px', // Giảm từ 80px xuống còn 70px
                }}
            >
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />

                    {/* Guest route - Chỉ hiển thị khi chưa đăng nhập */}
                    <Route
                        path="/guest"
                        element={
                            <PublicOnlyRoute>
                                <Guest />
                            </PublicOnlyRoute>
                        }
                    />

                    {/* Auth routes - chỉ hiển thị khi chưa đăng nhập */}
                    <Route
                        path="/login"
                        element={
                            <PublicOnlyRoute>
                                <LoginPage />
                            </PublicOnlyRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <PublicOnlyRoute>
                                <RegisterPage />
                            </PublicOnlyRoute>
                        }
                    />
                    <Route
                        path="/forgot-password"
                        element={<ForgotPasswordPage />}
                    />

                    {/* Protected routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* History routes */}
                    <Route
                        path="/history"
                        element={
                            <ProtectedRoute>
                                <History />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/history/:id"
                        element={
                            <ProtectedRoute>
                                <HistoryDetail />
                            </ProtectedRoute>
                        }
                    />

                    {/* Profile and Settings routes */}
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <Settings />
                            </ProtectedRoute>
                        }
                    />

                    {/* Fallback route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Box>
        </Box>
    );
}

export default App;
