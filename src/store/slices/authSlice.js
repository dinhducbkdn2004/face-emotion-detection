import { createSlice } from '@reduxjs/toolkit';

// Kiểm tra xem có dữ liệu đăng nhập được lưu trong localStorage không
const getStoredAuth = () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return {
        user: JSON.parse(storedUser),
        isAuthenticated: true,
        loading: false,
        error: null
      };
    }
  } catch (error) {
    console.error('Lỗi khi đọc dữ liệu đăng nhập từ localStorage:', error);
  }
  return {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  };
};

const initialState = getStoredAuth();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      
      // Lưu thông tin người dùng vào localStorage
      try {
        localStorage.setItem('user', JSON.stringify(action.payload));
      } catch (error) {
        console.error('Lỗi khi lưu dữ liệu đăng nhập vào localStorage:', error);
      }
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      
      // Xóa thông tin người dùng từ localStorage
      try {
        localStorage.removeItem('user');
      } catch (error) {
        console.error('Lỗi khi xóa dữ liệu đăng nhập từ localStorage:', error);
      }
    },
    clearErrors: (state) => {
      state.error = null;
    }
  }
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout,
  clearErrors 
} = authSlice.actions;

export default authSlice.reducer;
