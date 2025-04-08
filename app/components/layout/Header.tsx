import { Link } from "react-router";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Modal from "../common/Modal";
import LoginForm from "../auth/LoginForm";
import SignupForm from "../auth/SignupForm";

export default function Header() {
  const { currentUser, logOut, loading } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsSignupModalOpen(false);
  };

  const openSignupModal = () => {
    setIsSignupModalOpen(true);
    setIsLoginModalOpen(false);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container flex items-center justify-between px-4 py-4 mx-auto">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          Face Emotion Detection
        </Link>

        <nav className="flex items-center space-x-4">
          <Link to="/" className="text-gray-700 hover:text-indigo-600">
            Trang chủ
          </Link>
          
          { currentUser ? (
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600">
                Dashboard
              </Link>
              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-700">{currentUser.email}</span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={openLoginModal}
                className="px-3 py-1 text-sm text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50"
              >
                Đăng nhập
              </button>
              <button
                onClick={openSignupModal}
                className="px-3 py-1 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700"
              >
                Đăng ký
              </button>
            </div>
          )}
        </nav>
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
    </header>
  );
} 