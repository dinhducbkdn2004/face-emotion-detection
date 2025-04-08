import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1', // indigo-600
      light: '#818cf8', // indigo-400
      dark: '#4f46e5', // indigo-700
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8b5cf6', // violet-500
      light: '#a78bfa', // violet-400
      dark: '#7c3aed', // violet-600
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444', // red-500
    },
    warning: {
      main: '#f59e0b', // amber-500
    },
    info: {
      main: '#3b82f6', // blue-500
    },
    success: {
      main: '#10b981', // emerald-500
    },
    background: {
      default: '#f9fafb', // gray-50
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937', // gray-800
      secondary: '#4b5563', // gray-600
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

export default theme; 