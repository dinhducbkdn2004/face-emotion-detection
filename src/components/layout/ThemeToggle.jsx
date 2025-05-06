import React from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeContext } from '../theme/ThemeContext';

/**
 * Component nút chuyển đổi giữa chế độ sáng và tối
 */
const ThemeToggle = () => {
    const theme = useTheme();
    const { mode, toggleMode } = useThemeContext();
    const isDarkMode = mode === 'dark';

    return (
        <Tooltip
            title={
                isDarkMode
                    ? 'Chuyển sang chế độ sáng'
                    : 'Chuyển sang chế độ tối'
            }
        >
            <IconButton
                onClick={toggleMode}
                color="inherit"
                aria-label="toggle dark mode"
                size="large"
                sx={{
                    transition: theme.transitions.create(['transform'], {
                        duration: theme.transitions.duration.shorter,
                    }),
                    '&:hover': {
                        transform: 'rotate(30deg)',
                    },
                }}
            >
                {isDarkMode ? (
                    <Brightness7 fontSize="small" />
                ) : (
                    <Brightness4 fontSize="small" />
                )}
            </IconButton>
        </Tooltip>
    );
};

export default ThemeToggle;
