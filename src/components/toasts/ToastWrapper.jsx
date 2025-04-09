import { ToastContainer } from 'react-toastify';
import { useTheme } from '@mui/material/styles';

const ToastWrapper = ({ children }) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    return (
        <>
            {children}
            <ToastContainer
                position="bottom-left"
                theme={isDarkMode ? 'dark' : 'light'}
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                toastStyle={{
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                }}
            />
        </>
    );
};

export default ToastWrapper;