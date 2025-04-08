import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
  type UserCredential,
  type Auth
} from "firebase/auth";
import { auth } from "../config/firebase";

// Định nghĩa kiểu dữ liệu cho context
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  logIn: (email: string, password: string) => Promise<UserCredential>;
  logOut: () => Promise<void>;
  googleSignIn: () => Promise<UserCredential>;
  error: string | null;
  clearError: () => void;
}

// Giá trị mặc định cho context với các phương thức giả
const defaultValue: AuthContextType = {
  currentUser: null,
  loading: true,
  signUp: () => Promise.reject(new Error("Context chưa được khởi tạo")),
  logIn: () => Promise.reject(new Error("Context chưa được khởi tạo")),
  logOut: () => Promise.reject(new Error("Context chưa được khởi tạo")),
  googleSignIn: () => Promise.reject(new Error("Context chưa được khởi tạo")),
  error: null,
  clearError: () => {}
};

const AuthContext = createContext<AuthContextType>(defaultValue);

// Hook để sử dụng Authentication Context
export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

// Kiểm tra và lấy đối tượng auth không null
function getAuthInstance(): Auth {
  if (!auth) {
    throw new Error("Firebase Auth không được khởi tạo");
  }
  return auth;
}

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Đăng ký tài khoản mới
  const signUp = useCallback(async (email: string, password: string) => {
    try {
      clearError();
      return await createUserWithEmailAndPassword(getAuthInstance(), email, password);
    } catch (err: any) {
      console.error("Lỗi trong quá trình đăng ký:", err);
      setError(err.message || "Đăng ký thất bại");
      throw err;
    }
  }, [clearError]);

  // Đăng nhập với email và password
  const logIn = useCallback(async (email: string, password: string) => {
    try {
      clearError();
      return await signInWithEmailAndPassword(getAuthInstance(), email, password);
    } catch (err: any) {
      console.error("Lỗi trong quá trình đăng nhập:", err);
      setError(err.message || "Đăng nhập thất bại");
      throw err;
    }
  }, [clearError]);

  // Đăng xuất
  const logOut = useCallback(async () => {
    try {
      clearError();
      await signOut(getAuthInstance());
    } catch (err: any) {
      console.error("Lỗi trong quá trình đăng xuất:", err);
      setError(err.message || "Đăng xuất thất bại");
      throw err;
    }
  }, [clearError]);

  // Đăng nhập với Google
  const googleSignIn = useCallback(async () => {
    try {
      clearError();
      const googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      return await signInWithPopup(getAuthInstance(), googleProvider);
    } catch (err: any) {
      console.error("Lỗi trong quá trình đăng nhập với Google:", err);
      setError(err.message || "Đăng nhập Google thất bại");
      throw err;
    }
  }, [clearError]);

  // Lắng nghe thay đổi trạng thái đăng nhập
  useEffect(() => {
    // Chỉ chạy ở client-side
    if (typeof window === 'undefined') return;
    
    const startTime = performance.now();
    
    try {
      const unsubscribe = onAuthStateChanged(getAuthInstance(), (user) => {
        setCurrentUser(user);
        setLoading(false);
        setAuthInitialized(true);
        
        const loadTime = performance.now() - startTime;
        console.log(`Auth state initialized in ${loadTime.toFixed(2)}ms`);
      }, (error) => {
        console.error("Lỗi trạng thái xác thực:", error);
        setError(error.message || "Lỗi xác thực người dùng");
        setLoading(false);
        setAuthInitialized(true);
      });
  
      return unsubscribe;
    } catch (error: any) {
      console.error("Lỗi khi thiết lập auth listener:", error);
      setError(error.message || "Lỗi khi theo dõi trạng thái xác thực");
      setLoading(false);
      setAuthInitialized(true);
      return () => {};
    }
  }, []);

  // Sử dụng useMemo để tránh tạo lại giá trị context mỗi lần render
  const value = useMemo(() => ({
    currentUser,
    loading,
    signUp,
    logIn,
    logOut,
    googleSignIn,
    error,
    clearError
  }), [currentUser, loading, signUp, logIn, logOut, googleSignIn, error, clearError]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}