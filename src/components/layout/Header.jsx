import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '@/store/slices/authSlice';
import Button from '@/components/ui/Button';

const Header = () => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/login');
    };

    return (
        <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex">
                        <Link
                            to="/"
                            className="text-xl font-bold text-gray-800"
                        >
                            My App
                        </Link>
                    </div>
                    <nav className="flex space-x-4 items-center">
                        <Link
                            to="/"
                            className="text-gray-700 hover:text-gray-900"
                        >
                            Trang chủ
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="text-gray-700 hover:text-gray-900"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/about"
                                    className="text-gray-700 hover:text-gray-900"
                                >
                                    Giới thiệu
                                </Link>
                                <div className="flex items-center ml-4">
                                    <span className="text-sm text-gray-700 mr-2">
                                        {user?.email}
                                    </span>
                                    <Button
                                        variant="outline"
                                        onClick={handleLogout}
                                    >
                                        Đăng xuất
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/login')}
                                >
                                    Đăng nhập
                                </Button>
                                <Button onClick={() => navigate('/register')}>
                                    Đăng ký
                                </Button>
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
