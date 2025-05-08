import React from 'react';
import { ToastContainer } from 'react-toastify';
import { useTheme } from '@mui/material';

/**
 * Component wrapper cho ToastContainer với cấu hình phù hợp với theme
 * @param {Object} props - Props của component
 * @param {React.ReactNode} props.children - Các component con
 */
const ToastWrapper = ({ children }) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    return (
        <>
            {children}

            <ToastContainer
                position="bottom-left"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={isDarkMode ? 'dark' : 'light'}
                style={{ zIndex: theme.zIndex.snackbar }}
            />
        </>
    );
};

export default ToastWrapper;
