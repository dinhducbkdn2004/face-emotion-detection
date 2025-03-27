import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../../services/authService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            return;
        }

        try {
            setLoading(true);
            await resetPassword(email);
            setEmail('');
        } catch (error) {
            console.error('Lỗi khi gửi email khôi phục:', error);
            // Không cần xử lý lỗi ở đây vì đã được xử lý trong service
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-8">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    Quên mật khẩu
                </h2>

                <p className="text-gray-600 mb-6">
                    Nhập địa chỉ email của bạn, chúng tôi sẽ gửi hướng dẫn để
                    đặt lại mật khẩu.
                </p>

                <form onSubmit={handleSubmit}>
                    <Input
                        id="email"
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Nhập địa chỉ email của bạn"
                        required
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        disabled={loading}
                        className="mt-4"
                    >
                        {loading ? 'Đang gửi...' : 'Gửi email khôi phục'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="text-sm text-blue-600 hover:text-blue-500"
                    >
                        Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
