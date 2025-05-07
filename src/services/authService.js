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

        ToastService.success('Đăng nhập thành công!');

        if (user) {
            try {
                await verifyTokenWithBackend();
            } catch (error) {
                console.error(
                    'Đăng nhập Firebase thành công nhưng không thể xác thực với backend:',
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

        if (user) {
            try {
                await verifyTokenWithBackend();
            } catch (error) {
                console.error(
                    'Đăng nhập Google thành công nhưng không thể xác thực với backend:',
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
        clearAuthTokens();
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

// ===== THÊM MỚI: Các hàm để tích hợp với API backend =====

/**
 * Xác thực Firebase ID Token với backend
 * @returns {Promise<Object>} Thông tin người dùng và token từ backend
 */
export const verifyTokenWithBackend = async () => {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.log('Không có người dùng Firebase đang đăng nhập');
            // Thử sử dụng chế độ khách nếu không có người dùng Firebase
            return await tryGuestMode();
        }

        // In ra thông tin user Firebase để gỡ lỗi
        console.log('Firebase user:', {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
        });

        // Bước 1: Thử không force refresh token
        try {
            console.log('Thử lấy token không refresh...');
            const idToken = await user.getIdToken(false);
            console.log('ID Token length:', idToken.length);

            // Kiểm tra xem token có định dạng JWT đúng không
            if (!idToken.includes('.') || idToken.split('.').length !== 3) {
                console.error('Token không có định dạng JWT hợp lệ');
            }

            // Thử in ra payload token
            try {
                const base64Url = idToken.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map(function (c) {
                            return (
                                '%' +
                                ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                            );
                        })
                        .join('')
                );
                console.log('Token payload:', JSON.parse(jsonPayload));
            } catch (e) {
                console.error('Không thể decode token:', e);
            }

            // Gửi yêu cầu xác thực
            console.log('Gửi ID token đến server...');
            console.log('ID token:', idToken);
            const response = await apiClient.post('/auth/verify-token', {
                id_token: idToken,
            });

            const {
                access_token,
                refresh_token,
                user: userData,
            } = response.data;

            // Lưu trữ token từ backend
            setAuthTokens(access_token, refresh_token);

            // Nếu user là guest, lưu guestId
            if (userData && userData.is_guest && userData.guest_id) {
                localStorage.setItem('guestId', userData.guest_id);
            }

            return response.data;
        } catch (initialError) {
            console.log('Lỗi khi dùng token không refresh:', initialError);

            // Bước 2: Nếu thất bại, thử force refresh token
            console.log('Thử lấy token với force refresh...');
            const idToken = await user.getIdToken(true);
            console.log('ID Token mới length:', idToken.length);

            // Gửi yêu cầu xác thực với token mới
            console.log('Gửi ID token mới đến server...');
            const response = await apiClient.post('/auth/verify-token', {
                id_token: idToken,
            });

            const {
                access_token,
                refresh_token,
                user: userData,
            } = response.data;

            // Lưu trữ token từ backend
            setAuthTokens(access_token, refresh_token);

            // Nếu user là guest, lưu guestId
            if (userData && userData.is_guest && userData.guest_id) {
                localStorage.setItem('guestId', userData.guest_id);
            }

            return response.data;
        }
    } catch (error) {
        console.error('Lỗi xác thực với backend:', error);

        // Log chi tiết lỗi để gỡ lỗi
        if (error.response) {
            console.log(
                'Phản hồi lỗi từ server:',
                error.response.status,
                error.response.data
            );
        }

        // Nếu lỗi xác thực Firebase, thử với chế độ khách
        if (error.response && error.response.status === 401) {
            ToastService.warning(
                'Không thể xác thực với máy chủ, chuyển sang chế độ khách'
            );
            return await tryGuestMode();
        }

        ToastService.error('Không thể xác thực với máy chủ');
        throw error;
    }
};

/**
 * Thử kết nối với chế độ khách
 */
const tryGuestMode = async () => {
    try {
        console.log('Thử kết nối với chế độ khách');
        // Kiểm tra guestId từ localStorage
        const guestId = localStorage.getItem('guestId');

        if (guestId) {
            console.log('Sử dụng guestId hiện có:', guestId);
            try {
                // Gửi yêu cầu profile với guestId hiện có
                const url = `/auth/profile?guest_id=${guestId}`;
                const response = await apiClient.get(url);

                console.log(
                    'Phản hồi từ profile với guestId hiện có:',
                    response.data
                );

                // Tạo response giả lập để tương thích với cấu trúc dữ liệu
                return {
                    user: response.data,
                    access_token: null, // Không có token với chế độ khách
                    refresh_token: null,
                };
            } catch (profileError) {
                console.log('Lỗi khi sử dụng guestId hiện có:', profileError);
                // Nếu lỗi, tiếp tục tạo guest mới
            }
        }

        // Trường hợp không có guestId hoặc guestId không hợp lệ: Tạo guest mới
        try {
            console.log('Tạo guest mới...');
            // Gửi yêu cầu tạo guest mới
            const createGuestResponse = await apiClient.post('/auth/guest');
            console.log('Phản hồi tạo guest mới:', createGuestResponse.data);

            // Lưu guestId mới
            if (createGuestResponse.data && createGuestResponse.data.guest_id) {
                localStorage.setItem(
                    'guestId',
                    createGuestResponse.data.guest_id
                );
                console.log(
                    'Đã lưu guestId mới:',
                    createGuestResponse.data.guest_id
                );
            }

            // Tạo response giả lập để tương thích với cấu trúc dữ liệu
            return {
                user: createGuestResponse.data,
                access_token: null,
                refresh_token: null,
            };
        } catch (createGuestError) {
            console.log('Lỗi khi tạo guest mới:', createGuestError);

            // Phương án cuối cùng: Thử truy cập không có guestId
            console.log('Thử truy cập không có guestId...');
            const response = await apiClient.get('/auth/profile');

            // Lưu guestId mới nếu có
            if (response.data && response.data.guest_id) {
                localStorage.setItem('guestId', response.data.guest_id);
                console.log(
                    'Đã lưu guestId từ profile:',
                    response.data.guest_id
                );
            }

            // Tạo response giả lập
            return {
                user: response.data,
                access_token: null,
                refresh_token: null,
            };
        }
    } catch (error) {
        console.error('Không thể kết nối chế độ khách:', error);
        // Trả về một đối tượng giả lập tối thiểu để ứng dụng vẫn hoạt động
        return {
            user: {
                is_guest: true,
                email: 'guest@example.com',
                display_name: 'Khách',
                user_id: 'guest_fallback_' + Date.now(),
            },
            access_token: null,
            refresh_token: null,
        };
    }
};

/**
 * Lấy thông tin profile người dùng từ backend
 * @returns {Promise<Object>} Thông tin người dùng
 */
export const getUserProfile = async () => {
    try {
        // Kiểm tra nếu có guestId trong localStorage
        const guestId = localStorage.getItem('guestId');

        // Nếu có guestId, thêm vào query params
        let url = '/auth/profile';
        if (guestId) {
            url += `?guest_id=${guestId}`;
        }

        const response = await apiClient.get(url);

        // Nếu response chứa guestId mới, lưu vào localStorage
        if (response.data && response.data.guest_id) {
            localStorage.setItem('guestId', response.data.guest_id);
        }

        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy thông tin profile:', error);
        throw error;
    }
};

/**
 * Lấy thông tin sử dụng của người dùng
 * @returns {Promise<Object>} Thông tin sử dụng
 */
export const getUserUsage = async () => {
    try {
        // Kiểm tra nếu có guestId trong localStorage
        const guestId = localStorage.getItem('guestId');

        // Nếu có guestId, thêm vào query params
        let url = '/auth/usage';
        if (guestId) {
            url += `?guest_id=${guestId}`;
        }

        const response = await apiClient.get(url);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy thông tin sử dụng:', error);
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
        console.error('Lỗi khi refresh token:', error);
        clearAuthTokens();
        throw error;
    }
};
