import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './components/account/UserContext';
import Navbar from './components/layout/Navbar';
import LoginPage from './pages/Login/Login';
import RegisterPage from './pages/Register/Register';
import ForgotPasswordPage from './pages/ForgotPassword/ForgotPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import './App.css';

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
        <div className=" min-h-screen bg-gray-50">
            <Navbar />
            <div className="w-full h-full pt-20">
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

                    {/* Fallback route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
