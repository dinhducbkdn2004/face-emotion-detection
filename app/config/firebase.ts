// Tối ưu import để giảm kích thước bundle
import { initializeApp, getApps, getApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";

// Định nghĩa cấu hình Firebase mặc định
const DEFAULT_CONFIG = {
  apiKey: "AIzaSyDJipDxHXRs38BAm4vI9DT7qwKxtwio5qM",
  authDomain: "emotion-recognition-24574.firebaseapp.com",
  projectId: "emotion-recognition-24574",
  storageBucket: "emotion-recognition-24574.firebasestorage.app",
  messagingSenderId: "888562982653",
  appId: "1:888562982653:web:c8012dd0fa9cf410c2a894",
  measurementId: "G-FR8SDYEBRH"
};

// Cấu hình Firebase từ biến môi trường hoặc giá trị mặc định
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_CONFIG.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_CONFIG.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_CONFIG.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_CONFIG.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || DEFAULT_CONFIG.measurementId
};

// Tắt ghi log trong môi trường production để tối ưu hiệu suất
if (import.meta.env.PROD) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

// Khởi tạo Firebase (sử dụng memoization để tránh khởi tạo lại)
let app: FirebaseApp | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
const startTime = performance.now();

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  
  // Cấu hình persistence
  if (typeof window !== 'undefined' && auth) {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error("Lỗi khi đặt chế độ duy trì phiên:", error);
    });
  }
  
  const initTime = performance.now() - startTime;
  console.log(`Firebase initialized in ${initTime.toFixed(2)}ms`);
} catch (error) {
  console.error('Lỗi khi khởi tạo Firebase:', error);
}

// Lazy load Analytics khi cần để tăng tốc khởi động
const loadAnalytics = async () => {
  if (typeof window !== 'undefined' && app) {
    try {
      const { getAnalytics, isSupported } = await import('firebase/analytics');
      if (await isSupported()) {
        const analytics = getAnalytics(app);
        return analytics;
      }
    } catch (error) {
      console.error("Không thể khởi tạo Analytics:", error);
    }
  }
  return null;
};

// Prefetch auth domain để cải thiện hiệu suất đăng nhập
if (typeof window !== 'undefined') {
  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = firebaseConfig.authDomain;
  document.head.appendChild(link);
}

export { auth, loadAnalytics };
export default app;
