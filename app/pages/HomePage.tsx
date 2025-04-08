import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/common/Modal";
import LoginForm from "../components/auth/LoginForm";
import SignupForm from "../components/auth/SignupForm";

export default function HomePage() {
    const { currentUser } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

    const openLoginModal = () => {
      setIsLoginModalOpen(true);
      setIsSignupModalOpen(false);
    };

    const openSignupModal = () => {
      setIsSignupModalOpen(true);
      setIsLoginModalOpen(false);
    };

    return (
      <div className="container p-4 mx-auto">
        <div className="mt-12 text-center">
          <h1 className="text-4xl font-bold text-gray-800">Face Emotion Detection</h1>
          <p className="mt-4 text-xl text-gray-600">
            Phát hiện và phân tích cảm xúc khuôn mặt dễ dàng
          </p>
        </div>
  
        <div className="grid grid-cols-1 gap-8 mt-16 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Phân tích Cảm xúc</h2>
            <p className="mt-2 text-gray-600">
              Phân tích cảm xúc từ khuôn mặt với độ chính xác cao
            </p>
          </div>
  
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Thời gian thực</h2>
            <p className="mt-2 text-gray-600">
              Theo dõi cảm xúc theo thời gian thực thông qua webcam
            </p>
          </div>
  
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Bảng điều khiển</h2>
            <p className="mt-2 text-gray-600">
              Xem thống kê và phân tích dữ liệu cảm xúc
            </p>
          </div>
        </div>
  
        <div className="mt-16 text-center">
          {currentUser ? (
            <p className="text-gray-600">
              Chào mừng trở lại, {currentUser.email}! <a href="/dashboard" className="text-indigo-600 hover:underline">Đi đến Dashboard</a>
            </p>
          ) : (
            <p className="text-gray-600">
              <button 
                onClick={openLoginModal} 
                className="text-indigo-600 hover:underline"
              >
                Đăng nhập
              </button> 
              {' '}hoặc{' '} 
              <button 
                onClick={openSignupModal} 
                className="text-indigo-600 hover:underline"
              >
                đăng ký
              </button> 
              {' '}để trải nghiệm đầy đủ các tính năng
            </p>
          )}
        </div>

        {/* Login Modal */}
        <Modal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
          title="Đăng nhập"
        >
          <LoginForm onClose={() => setIsLoginModalOpen(false)} />
          <div className="mt-4 text-center text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <button 
              className="text-indigo-600 hover:underline" 
              onClick={() => {
                setIsLoginModalOpen(false);
                setIsSignupModalOpen(true);
              }}
            >
              Đăng ký ngay
            </button>
          </div>
        </Modal>

        {/* Signup Modal */}
        <Modal 
          isOpen={isSignupModalOpen} 
          onClose={() => setIsSignupModalOpen(false)} 
          title="Đăng ký"
        >
          <SignupForm onClose={() => setIsSignupModalOpen(false)} />
          <div className="mt-4 text-center text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <button 
              className="text-indigo-600 hover:underline" 
              onClick={() => {
                setIsSignupModalOpen(false);
                setIsLoginModalOpen(true);
              }}
            >
              Đăng nhập
            </button>
          </div>
        </Modal>
      </div>
    );
  }

