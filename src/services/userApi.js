import ApiFactory from './api/ApiFactory';

/**
 * API Client cho các chức năng liên quan đến User
 */
const userApi = ApiFactory.create('/users');

/**
 * Thêm các phương thức tùy chỉnh cho User API
 */
userApi.login = (credentials) => {
    return userApi.endpoint('login').post(credentials);
};

userApi.register = (userData) => {
    return userApi.endpoint('register').post(userData);
};

userApi.changePassword = (userId, passwordData) => {
    return userApi.endpoint(`${userId}/change-password`).post(passwordData);
};

userApi.updateProfile = (userId, profileData) => {
    return userApi.endpoint(`${userId}/profile`).put(profileData);
};

userApi.uploadAvatar = (userId, formData) => {
    return userApi.endpoint(`${userId}/avatar`).post(formData);
};

userApi.resetPassword = (email) => {
    return userApi.endpoint('reset-password').post({ email });
};

userApi.verifyEmail = (token) => {
    return userApi.endpoint('verify-email').get({ token });
};

export default userApi;
