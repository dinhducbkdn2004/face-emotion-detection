import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useUser } from './components/account/UserContext';
import Navbar from './components/layout/Navbar';
import LoginPage from './pages/Login/Login';
import RegisterPage from './pages/Register/Register';
import ForgotPasswordPage from './pages/ForgotPassword/ForgotPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useUser();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Public Only Route - chuyển hướng nếu đã đăng nhập
const PublicOnlyRoute = ({ children }) => {
    const { isAuthenticated } = useUser();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: 'background.default',
                color: 'text.primary',
            }}
        >
            <Navbar />
            <Box
                component="main"
                sx={{
                    width: '100%',
                    height: '100%',
                    pt: '80px', // 20 * 4 = 80px (equivalent to pt-20)
                }}
            >
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />

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
