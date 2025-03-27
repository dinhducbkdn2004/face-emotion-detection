import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    loginWithEmailAndPassword,
    loginWithGoogle,
} from '../../services/authService';
import { clearErrors } from '../../store/slices/authSlice';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

    // Lấy redirect path từ query string (nếu có)
    const from = location.state?.from?.pathname || '/dashboard';

    // Kiểm tra xem có thông tin đăng nhập được lưu không
    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    // Nếu đã đăng nhập, chuyển hướng
    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    // Clear errors khi unmount
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

        // Lưu email nếu chọn rememberMe
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        try {
            await loginWithEmailAndPassword(email, password, dispatch, rememberMe);
            // Không cần navigate ở đây vì useEffect sẽ xử lý
        } catch (error) {
            console.error('Đăng nhập thất bại:', error);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle(dispatch);
            // Không cần navigate ở đây vì useEffect sẽ xử lý
        } catch (error) {
            console.error('Đăng nhập Google thất bại:', error);
        }
    };

    // Maps Firebase error messages to user-friendly messages
    const getErrorMessage = (errorMessage) => {
        if (errorMessage.includes('auth/user-not-found') || errorMessage.includes('auth/wrong-password')) {
            return 'Email hoặc mật khẩu không đúng';
        }
        if (errorMessage.includes('auth/too-many-requests')) {
            return 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau';
        }
        if (errorMessage.includes('auth/network-request-failed')) {
            return 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet';
        }
        return errorMessage;
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-8">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    Đăng Nhập
                </h2>

                {error && (
                    <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {getErrorMessage(error)}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <Input
                        id="email"
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Nhập địa chỉ email"
                        error={formErrors.email}
                        required
                    />

                    <Input
                        id="password"
                        label="Mật khẩu"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu"
                        error={formErrors.password}
                        required
                    />

                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <input
                                id="remember"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label
                                htmlFor="remember"
                                className="ml-2 block text-sm text-gray-700"
                            >
                                Ghi nhớ đăng nhập
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link
                                to="/forgot-password"
                                className="text-blue-600 hover:text-blue-500"
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        disabled={loading}
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">
                                Hoặc đăng nhập với
                            </span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            fullWidth
                            onClick={handleGoogleLogin}
                            disabled={loading}
                        >
                            <div className="flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 mr-2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                                    />
                                </svg>
                                Google
                            </div>
                        </Button>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Chưa có tài khoản?{' '}
                        <Link
                            to="/register"
                            className="text-blue-600 hover:text-blue-500 font-medium"
                        >
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
