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

        ToastService.success('Đăng nhập thành công!');
        return user;
    } catch (error) {
        console.error('Login error:', error.code, error.message);
        dispatch(loginFailure(error.message));

        // Hiển thị thông báo lỗi thân thiện
        if (
            error.code === 'auth/user-not-found' ||
            error.code === 'auth/wrong-password'
        ) {
            ToastService.error('Email hoặc mật khẩu không chính xác');
        } else if (error.code === 'auth/too-many-requests') {
            ToastService.error(
                'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau'
            );
        } else if (error.code === 'auth/network-request-failed') {
            ToastService.error(
                'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet'
            );
        } else {
            ToastService.error('Đăng nhập thất bại: ' + error.message);
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

        ToastService.success('Đăng nhập với Google thành công!');
        return user;
    } catch (error) {
        console.error('Google login error:', error.code, error.message);
        // Bỏ qua lỗi cancel popup
        if (error.code !== 'auth/popup-closed-by-user') {
            dispatch(loginFailure(error.message));
            ToastService.error('Đăng nhập với Google thất bại');
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

        ToastService.success('Đăng ký tài khoản thành công!');
        return user;
    } catch (error) {
        console.error('Register error:', error.code, error.message);
        dispatch(loginFailure(error.message));

        if (error.code === 'auth/email-already-in-use') {
            ToastService.error('Email này đã được sử dụng');
        } else if (error.code === 'auth/invalid-email') {
            ToastService.error('Email không hợp lệ');
        } else if (error.code === 'auth/weak-password') {
            ToastService.error('Mật khẩu quá yếu');
        } else {
            ToastService.error('Đăng ký tài khoản thất bại');
        }

        throw error;
    }
};

// Đăng xuất
export const logout = async (dispatch) => {
    try {
        await signOut(auth);
        dispatch(logoutAction());
        ToastService.success('Đăng xuất thành công!');
    } catch (error) {
        console.error('Lỗi khi đăng xuất:', error);
        ToastService.error('Đăng xuất thất bại');
        throw error;
    }
};

// Yêu cầu đặt lại mật khẩu
export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        ToastService.success(
            'Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.'
        );
    } catch (error) {
        console.error('Reset password error:', error.code, error.message);

        if (error.code === 'auth/user-not-found') {
            ToastService.error('Không tìm thấy tài khoản với email này');
        } else if (error.code === 'auth/invalid-email') {
            ToastService.error('Email không hợp lệ');
        } else if (error.code === 'auth/expired-action-code') {
            ToastService.error('Liên kết đặt lại mật khẩu đã hết hạn');
            window.location.href = '/forgot-password?expired=true';
        } else if (error.code === 'auth/invalid-action-code') {
            ToastService.error(
                'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng'
            );
            window.location.href = '/forgot-password?expired=true';
        } else {
            ToastService.error('Không thể gửi email đặt lại mật khẩu');
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
