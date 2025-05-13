import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    onAuthStateChange,
    logout,
    verifyTokenWithBackend,
    getUserProfile,
} from '../../services/authService';

// Tạo context
const UserContext = createContext();

/**
 * Hook để sử dụng UserContext
 */
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser phải được sử dụng trong UserProvider');
    }
    return context;
};

/**
 * Provider cung cấp thông tin người dùng và các hàm xác thực
 */
export const UserProvider = ({ children }) => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [backendProfile, setBackendProfile] = useState(null);
    const [backendVerified, setBackendVerified] = useState(false);
    const [isGuest, setIsGuest] = useState(false);
    const [usageCount, setUsageCount] = useState(0);
    const [maxUsage, setMaxUsage] = useState(null);
    const dispatch = useDispatch();

    // Lắng nghe sự thay đổi trạng thái xác thực từ Firebase
    useEffect(() => {
        const unsubscribe = onAuthStateChange(dispatch);
        return () => unsubscribe();
    }, [dispatch]);

    // Xác thực với backend khi đăng nhập Firebase thành công
    useEffect(() => {
        const verifyWithBackend = async () => {
            if (isAuthenticated && user) {
                try {
                    console.log(
                        'Đang xác thực với backend cho user Firebase',
                        user.uid
                    );
                    const response = await verifyTokenWithBackend();

                    // Thêm log để theo dõi phản hồi
                    console.log('Phản hồi từ backend:', response);

                    // Kiểm tra nếu có phản hồi từ server
                    if (response) {
                        setBackendVerified(true);

                        // Lưu thông tin hồ sơ từ backend
                        if (response.user) {
                            setBackendProfile(response.user);
                            setIsGuest(response.user.is_guest || false);
                            setUsageCount(response.user.usage_count || 0);
                            setMaxUsage(response.user.max_usage || null);
                        }
                    }
                } catch (error) {
                    console.error('Lỗi khi xác thực với backend:', error);
                    setBackendVerified(false);
                }
            } else {
                console.log('Không có user Firebase, thử chế độ khách');
                setBackendVerified(false);
                setBackendProfile(null);

                // Thử lấy thông tin khách
                try {
                    // Dùng hàm getUserProfile để lấy thông tin guest
                    const profile = await getUserProfile();

                    if (profile) {
                        setIsGuest(profile.is_guest || false);
                        setUsageCount(profile.usage_count || 0);
                        setMaxUsage(profile.max_usage || null);
                        // Thêm ghi nhận thông tin profile
                        setBackendProfile(profile);
                    }
                } catch (error) {
                    console.error(
                        'Lỗi khi kiểm tra thông tin người dùng khách:',
                        error
                    );
                    // Reset trạng thái nếu không lấy được thông tin người dùng khách
                    setIsGuest(false);
                    setUsageCount(0);
                    setMaxUsage(null);
                    setBackendProfile(null);
                }
            }
        };

        verifyWithBackend();
    }, [isAuthenticated, user]);

    // Hàm đăng xuất
    const signOut = async () => {
        try {
            await logout(dispatch);
            setBackendVerified(false);
            setBackendProfile(null);
            // Xóa guestId khi đăng xuất
            localStorage.removeItem('guestId');
            localStorage.removeItem('accessToken');
            return true;
        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
            return false;
        }
    };

    // Giá trị được cung cấp cho context
    const value = {
        user,
        isAuthenticated,
        backendProfile,
        backendVerified,
        isGuest,
        usageCount,
        maxUsage,
        signOut,
    };

    return (
        <UserContext.Provider value={value}>{children}</UserContext.Provider>
    );
};

export default UserContext;
