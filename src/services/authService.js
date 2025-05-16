import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged,
    setPersistence,
    browserSessionPersistence,
    browserLocalPersistence,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import {
    loginStart,
    loginSuccess,
    loginFailure,
    logout as logoutAction,
} from '../store/slices/authSlice';
import ToastService from '../toasts/ToastService';
import apiClient, { setAuthTokens, clearAuthTokens } from './apiClient';

// Đăng nhập với email và mật khẩu
export const loginWithEmailAndPassword = async (
    email,
    password,
    dispatch,
    rememberMe = false
) => {
    try {
        dispatch(loginStart());

        // Thiết lập persistence dựa vào rememberMe
        const persistence = rememberMe
            ? browserLocalPersistence
            : browserSessionPersistence;
        await setPersistence(auth, persistence);

        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );
        const user = userCredential.user;

        dispatch(
            loginSuccess({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified,
            })
        );

        ToastService.success('Login successfully!');

        if (user) {
            try {
                await verifyTokenWithBackend();
            } catch (error) {
                console.error(
                    'Login Firebase successfully but cannot verify with backend:',
                    error
                );
            }
        }

        return user;
    } catch (error) {
        console.error('Login error:', error.code, error.message);
        dispatch(loginFailure(error.message));

        // Hiển thị thông báo lỗi thân thiện
        if (
            error.code === 'auth/user-not-found' ||
            error.code === 'auth/wrong-password'
        ) {
            ToastService.error('Email or password is incorrect');
        } else if (error.code === 'auth/too-many-requests') {
            ToastService.error(
                'Too many login attempts. Please try again later'
            );
        } else if (error.code === 'auth/network-request-failed') {
            ToastService.error(
                'Network error. Please check your internet connection'
            );
        } else {
            ToastService.error('Login failed: ' + error.message);
        }

        throw error;
    }
};

// Đăng nhập với Google
export const loginWithGoogle = async (dispatch) => {
    try {
        dispatch(loginStart());
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account', // Luôn hiện hộp thoại chọn tài khoản
        });

        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        dispatch(
            loginSuccess({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified,
            })
        );

        ToastService.success('Login with Google successfully!');

        if (user) {
            try {
                await verifyTokenWithBackend();
            } catch (error) {
                console.error(
                    'Login with Google successfully but cannot verify with backend:',
                    error
                );
            }
        }

        return user;
    } catch (error) {
        console.error('Google login error:', error.code, error.message);
        // Bỏ qua lỗi cancel popup
        if (error.code !== 'auth/popup-closed-by-user') {
            dispatch(loginFailure(error.message));
            ToastService.error('Login with Google failed');
        }
        throw error;
    }
};

// Đăng ký người dùng mới
export const registerWithEmailAndPassword = async (
    email,
    password,
    dispatch
) => {
    try {
        dispatch(loginStart());
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        const user = userCredential.user;

        dispatch(
            loginSuccess({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified,
            })
        );

        ToastService.success('Register successfully!');
        return user;
    } catch (error) {
        console.error('Register error:', error.code, error.message);
        dispatch(loginFailure(error.message));

        if (error.code === 'auth/email-already-in-use') {
            ToastService.error('This email is already in use');
        } else if (error.code === 'auth/invalid-email') {
            ToastService.error('Invalid email');
        } else if (error.code === 'auth/weak-password') {
            ToastService.error('Password is too weak');
        } else {
            ToastService.error('Register failed');
        }

        throw error;
    }
};

// Đăng xuất
export const logout = async (dispatch) => {
    try {
        await signOut(auth);
        dispatch(logoutAction());
        clearAuthTokens();
        ToastService.success('Logged out successfully!');
    } catch (error) {
        console.error('Logout error:', error);
        ToastService.error('Logout failed');
        throw error;
    }
};

// Yêu cầu đặt lại mật khẩu
export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        ToastService.success(
            'Password reset email has been sent. Please check your email.'
        );
    } catch (error) {
        console.error('Reset password error:', error.code, error.message);

        if (error.code === 'auth/user-not-found') {
            ToastService.error('No account found with this email');
        } else if (error.code === 'auth/invalid-email') {
            ToastService.error('Invalid email');
        } else if (error.code === 'auth/expired-action-code') {
            ToastService.error('Password reset link has expired');
            window.location.href = '/forgot-password?expired=true';
        } else if (error.code === 'auth/invalid-action-code') {
            ToastService.error(
                'Invalid or already used password reset link'
            );
            window.location.href = '/forgot-password?expired=true';
        } else {
            ToastService.error('Cannot send password reset email');
        }

        throw error;
    }
};

// Theo dõi trạng thái xác thực
export const onAuthStateChange = (dispatch) => {
    return onAuthStateChanged(auth, (user) => {
        if (user) {
            dispatch(
                loginSuccess({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    emailVerified: user.emailVerified,
                })
            );
        } else {
            dispatch(logoutAction());
        }
    });
};

// ===== THÊM MỚI: Các hàm để tích hợp với API backend =====

/**
 * Xác thực Firebase ID Token với backend
 * @returns {Promise<Object>} Thông tin người dùng và token từ backend
 */
export const verifyTokenWithBackend = async () => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.error('No logged in user');
            return null;
        }

        // Lấy ID token từ Firebase
        const idToken = await currentUser.getIdToken(true);
        console.log('Firebase ID token has been fetched');

        // Gửi ID token đến backend để xác minh
        const response = await apiClient.post('/auth/verify-token', {
            id_token: idToken,
        });

        console.log('Backend verified token successfully:', response.data);

        // Lưu JWT token từ backend vào localStorage
        if (response.data.access_token && response.data.refresh_token) {
            setAuthTokens(
                response.data.access_token,
                response.data.refresh_token
            );
        }

        return response.data;
    } catch (error) {
        console.error('Error verifying token with backend:', error);
        if (error.response?.status === 401) {
            ToastService.error(
                'Session expired, please login again.'
            );
            clearAuthTokens();
        } else {
            ToastService.error(
                'Cannot verify with server. Please try again later.'
            );
        }
        return null;
    }
};

/**
 * Lấy thông tin profile người dùng từ backend
 * @returns {Promise<Object>} Thông tin người dùng
 */
export const getUserProfile = async () => {
    try {
        let url = '/auth/profile';

        const response = await apiClient.get(url);

        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
};

/**
 * Lấy thông tin số lần sử dụng của người dùng
 * @returns {Promise<Object>} Thông tin sử dụng
 */
export const getUserUsage = async () => {
    try {
        const response = await apiClient.get('/auth/usage');
        return response.data;
    } catch (error) {
        console.error('Error fetching usage:', error);
        throw error;
    }
};

/**
 * Refresh token
 * @param {string} refreshTokenStr - JWT refresh token
 * @returns {Promise<Object>} Access token mới
 */
export const refreshTokenWithBackend = async (refreshTokenStr) => {
    try {
        const response = await apiClient.post('/auth/refresh-token', {
            refresh_token: refreshTokenStr,
        });

        const { access_token } = response.data;
        setAuthTokens(access_token, refreshTokenStr);

        return response.data;
    } catch (error) {
        console.error('Error refreshing token:', error);
        clearAuthTokens();
        throw error;
    }
};
