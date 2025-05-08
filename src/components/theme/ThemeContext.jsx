import React, {
    createContext,
    useContext,
    useState,
    useMemo,
    useEffect,
    useCallback,
} from 'react';
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';

// Khởi tạo theme trước để giảm tính toán
const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#3f51b5',
            light: '#6573c3',
            dark: '#2c387e',
        },
        secondary: {
            main: '#f50057',
            light: '#f73378',
            dark: '#ab003c',
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
    },
});

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#5c6bc0',
            light: '#8e99f3',
            dark: '#26418f',
        },
        secondary: {
            main: '#f06292',
            light: '#ff94c2',
            dark: '#ba2d65',
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
    },
});

// Tạo context lưu trữ theme
const ThemeContext = createContext({
    mode: 'light',
    toggleMode: () => {},
    theme: lightTheme,
});

// Provider Component
export const ThemeProvider = ({ children }) => {
    // Kiểm tra preference từ localStorage hoặc người dùng
    const getInitialMode = () => {
        const savedMode = localStorage.getItem('themeMode');
        if (savedMode) {
            return savedMode;
        }
        // Kiểm tra prefers-color-scheme của hệ thống
        const prefersDarkMode = window.matchMedia(
            '(prefers-color-scheme: dark)'
        ).matches;
        return prefersDarkMode ? 'dark' : 'light';
    };

    const [mode, setMode] = useState(getInitialMode);
    
    // Chọn theme dựa trên mode hiện tại
    const theme = useMemo(
        () => (mode === 'light' ? lightTheme : darkTheme),
        [mode]
    );

    // Lưu trạng thái theme vào localStorage
    useEffect(() => {
        localStorage.setItem('themeMode', mode);
        
        // Thêm một class vào body để có thể styling ngoài MUI
        document.body.classList.remove('light-mode', 'dark-mode');
        document.body.classList.add(`${mode}-mode`);
        
        // Cập nhật color-scheme cho các element khác  
        document.documentElement.style.colorScheme = mode;
    }, [mode]);

    // Tạo hàm chuyển đổi theme với useCallback
    const toggleMode = useCallback(() => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    }, []);

    // Tạo giá trị context với useMemo
    const contextValue = useMemo(
        () => ({
            mode,
            toggleMode,
            theme,
        }),
        [mode, toggleMode, theme]
    );

    return (
        <ThemeContext.Provider value={contextValue}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

// Custom hook để sử dụng ThemeContext
export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
