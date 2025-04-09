import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import ToastService from '../../toasts/ToastService';

/**
 * Component hiển thị thông tin tài khoản người dùng
 */
const Account = () => {
    const { user, isAuthenticated, signOut } = useUser();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        const success = await signOut();
        if (success) {
            navigate('/login');
        }
    };

    // Nếu chưa đăng nhập
    if (!isAuthenticated || !user) {
        return (
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                    Đăng nhập
                </button>
                <button
                    onClick={() => navigate('/register')}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                    Đăng ký
                </button>
            </div>
        );
    }

    // Lấy chữ cái đầu của tên người dùng
    const userInitials = user.displayName
        ? user.displayName
              .split(' ')
              .map((name) => name[0])
              .join('')
              .toUpperCase()
        : user.email
          ? user.email[0].toUpperCase()
          : 'U';

    return (
        <div className="relative">
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 focus:outline-none"
            >
                {user.photoURL ? (
                    <img
                        src={user.photoURL}
                        alt={user.displayName || user.email}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                        {userInitials}
                    </div>
                )}
                <span className="text-sm font-medium text-gray-700 hidden md:block">
                    {user.displayName || user.email}
                </span>
                <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                    ></path>
                </svg>
            </button>

            {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-lg z-20">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <div className="font-medium">
                            {user.displayName || 'Người dùng'}
                        </div>
                        <div className="text-gray-500 text-xs truncate">
                            {user.email}
                        </div>
                    </div>
                    <a
                        href="#profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Hồ sơ của tôi
                    </a>
                    <a
                        href="#settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Cài đặt
                    </a>
                    <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                        Đăng xuất
                    </button>
                </div>
            )}
        </div>
    );
};

export default Account;
