import React from 'react';
import { toast } from 'react-toastify';

/**
 * Component hiển thị nội dung toast với style tùy chỉnh
 */
const CustomToast = ({ icon, message, description, color, closeToast }) => {
    return (
        <div className="flex items-start">
            <div
                className={`flex-shrink-0 w-8 h-8 rounded-full ${color} flex items-center justify-center text-white mr-3`}
            >
                {icon}
            </div>
            <div className="flex-1">
                <div className="font-semibold">{message}</div>
                {description && (
                    <div className="text-sm opacity-80">{description}</div>
                )}
            </div>
            <button
                onClick={closeToast}
                className="ml-4 text-gray-400 hover:text-gray-600"
            >
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                    ></path>
                </svg>
            </button>
        </div>
    );
};

/**
 * Hiển thị toast thành công với style tùy chỉnh
 */
export const showCustomSuccess = (message, description = '') => {
    return toast(
        (props) => (
            <CustomToast
                icon={
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                        ></path>
                    </svg>
                }
                message={message}
                description={description}
                color="bg-green-500"
                {...props}
            />
        ),
        {
            className: 'custom-toast-success',
        }
    );
};

/**
 * Hiển thị toast lỗi với style tùy chỉnh
 */
export const showCustomError = (message, description = '') => {
    return toast(
        (props) => (
            <CustomToast
                icon={
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        ></path>
                    </svg>
                }
                message={message}
                description={description}
                color="bg-red-500"
                {...props}
            />
        ),
        {
            className: 'custom-toast-error',
        }
    );
};

/**
 * Hiển thị toast cảnh báo với style tùy chỉnh
 */
export const showCustomWarning = (message, description = '') => {
    return toast(
        (props) => (
            <CustomToast
                icon={
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        ></path>
                    </svg>
                }
                message={message}
                description={description}
                color="bg-yellow-500"
                {...props}
            />
        ),
        {
            className: 'custom-toast-warning',
        }
    );
};

/**
 * Hiển thị toast thông tin với style tùy chỉnh
 */
export const showCustomInfo = (message, description = '') => {
    return toast(
        (props) => (
            <CustomToast
                icon={
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                    </svg>
                }
                message={message}
                description={description}
                color="bg-blue-500"
                {...props}
            />
        ),
        {
            className: 'custom-toast-info',
        }
    );
};

export default {
    success: showCustomSuccess,
    error: showCustomError,
    warning: showCustomWarning,
    info: showCustomInfo,
};
