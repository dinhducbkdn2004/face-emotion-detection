import React from 'react';
import { useSelector } from 'react-redux';
import ToastService from '../../toasts/ToastService';
import CustomToast from '../../components/toasts/CustomToast';
import Button from '../../components/ui/Button';

const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);

    // Hàm hiển thị các dạng toast thông thường
    const showDefaultToasts = () => {
        ToastService.success('Thành công!', { autoClose: 3000 });
        setTimeout(() => {
            ToastService.error('Đã xảy ra lỗi!', { autoClose: 3000 });
        }, 1000);
        setTimeout(() => {
            ToastService.warning('Cảnh báo!', { autoClose: 3000 });
        }, 2000);
        setTimeout(() => {
            ToastService.info('Thông tin!', { autoClose: 3000 });
        }, 3000);
    };

    // Hàm hiển thị các dạng toast tùy chỉnh
    const showCustomToasts = () => {
        CustomToast.success(
            'Thao tác thành công',
            'Dữ liệu đã được lưu vào hệ thống'
        );
        setTimeout(() => {
            CustomToast.error('Lỗi kết nối', 'Không thể kết nối đến máy chủ');
        }, 1000);
        setTimeout(() => {
            CustomToast.warning(
                'Cảnh báo bảo mật',
                'Phiên làm việc sắp hết hạn'
            );
        }, 2000);
        setTimeout(() => {
            CustomToast.info(
                'Cập nhật mới',
                'Ứng dụng vừa được cập nhật lên phiên bản mới'
            );
        }, 3000);
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Bảng điều khiển
            </h1>

            <div className="bg-blue-50 rounded-md p-6 mb-6">
                <div className="flex items-center">
                    {user?.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt={user.displayName || 'User profile'}
                            className="h-16 w-16 rounded-full mr-4"
                        />
                    ) : (
                        <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold mr-4">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    )}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            {user?.displayName || 'Người dùng'}
                        </h2>
                        <p className="text-gray-600">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Phần demo toast */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    Demo thông báo Toast
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-medium mb-3">
                            Toast thông thường
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Hiển thị các thông báo mặc định từ react-toastify
                        </p>
                        <Button onClick={showDefaultToasts}>
                            Hiển thị toast thông thường
                        </Button>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-medium mb-3">
                            Toast tùy chỉnh
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Hiển thị các thông báo với giao diện tùy chỉnh
                        </p>
                        <Button onClick={showCustomToasts} variant="outline">
                            Hiển thị toast tùy chỉnh
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-blue-500 text-xl mb-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    </div>
                    <h3 className="font-medium text-lg text-gray-800">
                        Báo cáo của tôi
                    </h3>
                    <p className="text-gray-600 mt-1">
                        Xem các báo cáo phân tích cảm xúc của bạn
                    </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-green-500 text-xl mb-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    <h3 className="font-medium text-lg text-gray-800">
                        Lịch sử phân tích
                    </h3>
                    <p className="text-gray-600 mt-1">
                        Xem lịch sử các phân tích cảm xúc trước đây
                    </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-purple-500 text-xl mb-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="font-medium text-lg text-gray-800">
                        Cài đặt tài khoản
                    </h3>
                    <p className="text-gray-600 mt-1">
                        Quản lý cài đặt và thông tin tài khoản của bạn
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
