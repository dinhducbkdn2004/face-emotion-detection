import React, { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { onAuthStateChange, logout } from '../../services/authService';

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
    const dispatch = useDispatch();

    useEffect(() => {
        const unsubscribe = onAuthStateChange(dispatch);
        return () => unsubscribe();
    }, [dispatch]);

    // Hàm đăng xuất
    const signOut = async () => {
        try {
            await logout(dispatch);
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
        signOut,
    };

    return (
        <UserContext.Provider value={value}>{children}</UserContext.Provider>
    );
};

export default UserContext;
