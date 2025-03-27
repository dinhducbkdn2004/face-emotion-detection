import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    // Thêm các reducer khác ở đây khi cần
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false, // Cho phép các đối tượng không serializable (như từ Firebase)
    }),
});

export default store;
