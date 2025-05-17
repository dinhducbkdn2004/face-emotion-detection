import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    onAuthStateChange,
    logout,
    verifyTokenWithBackend,
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
                    const response = await verifyTokenWithBackend();

                    // Kiểm tra nếu có phản hồi từ server
                    if (response) {
                        setBackendVerified(true);

                        // Lưu thông tin hồ sơ từ backend
                        if (response.user) {
                            setBackendProfile(response.user);
                        }
                    }
                } catch (error) {
                    console.error('Lỗi khi xác thực với backend:', error);
                    setBackendVerified(false);
                }
            } else {
                setBackendVerified(false);
                setBackendProfile(null);
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
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
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
        signOut,
    };

    return (
        <UserContext.Provider value={value}>{children}</UserContext.Provider>
    );
};

export default UserContext;
