import React from 'react';
import { Box, Typography, Button, Paper, useTheme, Alert } from '@mui/material';
import { Replay, Error as ErrorIcon, Warning } from '@mui/icons-material';

/**
 * Component hiển thị thông báo lỗi với nút thử lại
 *
 * @param {Object} props - Component props
 * @param {string} props.message - Thông báo lỗi
 * @param {string} props.type - Loại lỗi ('error', 'warning', 'connection')
 * @param {function} props.onRetry - Callback khi nhấn nút thử lại
 * @param {React.ReactNode} props.children - Nội dung bổ sung
 */
const ErrorMessage = ({
    message = 'Có lỗi xảy ra',
    type = 'error',
    onRetry,
    children,
}) => {
    const theme = useTheme();

    const icons = {
        error: <ErrorIcon fontSize="large" color="error" />,
        warning: <Warning fontSize="large" color="warning" />,
        connection: <ErrorIcon fontSize="large" color="error" />,
    };

    const titles = {
        error: 'An error occurred',
        warning: 'Warning',
        connection: 'Connection error',
    };

    const colors = {
        error: theme.palette.error.main,
        warning: theme.palette.warning.main,
        connection: theme.palette.error.main,
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor:
                    type === 'error'
                        ? 'rgba(211, 47, 47, 0.04)'
                        : type === 'warning'
                          ? 'rgba(237, 108, 2, 0.04)'
                          : 'rgba(211, 47, 47, 0.04)',
                textAlign: 'center',
                maxWidth: '100%',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Box sx={{ mb: 1 }}>{icons[type] || icons.error}</Box>

                <Typography
                    variant="h6"
                    fontWeight="medium"
                    color={colors[type] || colors.error}
                    gutterBottom
                >
                    {titles[type] || titles.error}
                </Typography>

                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                >
                    {message}
                </Typography>

                {children}

                {onRetry && (
                    <Button
                        variant="contained"
                        color={type === 'warning' ? 'warning' : 'primary'}
                        startIcon={<Replay />}
                        onClick={onRetry}
                        sx={{ mt: 1 }}
                    >
                        Try again
                    </Button>
                )}
            </Box>
        </Paper>
    );
};

export default ErrorMessage;
