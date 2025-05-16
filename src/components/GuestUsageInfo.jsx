import { useState, useEffect } from 'react';
import { Box, Typography, Alert, LinearProgress, Button } from '@mui/material';
import { Person, Login } from '@mui/icons-material';
import { getUserUsage } from '../services/authService';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Component hiển thị thông tin số lần sử dụng của người dùng khách
 */
export default function GuestUsageInfo() {
    const [usageInfo, setUsageInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Lấy thông tin sử dụng khi component mount
    useEffect(() => {
        const fetchUsageInfo = async () => {
            try {
                setLoading(true);
                const data = await getUserUsage();
                setUsageInfo(data);
                setError('');
            } catch (error) {
                console.error('Error fetching usage info:', error);
                setError('Unable to get usage information');
            } finally {
                setLoading(false);
            }
        };

        fetchUsageInfo();
    }, []);

    // Nếu đang tải
    if (loading) {
        return (
            <Box sx={{ my: 2 }}>
                <LinearProgress />
            </Box>
        );
    }

    // Nếu có lỗi
    if (error) {
        return (
            <Alert severity="error" sx={{ my: 2 }}>
                {error}
            </Alert>
        );
    }

    // Nếu không phải là guest user
    if (usageInfo && !usageInfo.is_guest) {
        return null;
    }

    // Tính toán lượt dùng còn lại
    const remainingUsage = usageInfo
        ? usageInfo.max_usage - usageInfo.usage_count
        : 0;
    const usagePercentage = usageInfo
        ? (usageInfo.usage_count / usageInfo.max_usage) * 100
        : 0;

    return (
        <Box
            sx={{
                p: 2,
                bgcolor: 'info.light',
                color: 'info.contrastText',
                borderRadius: 1,
                mb: 3,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Person sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="medium">
                    Guest Mode
                </Typography>
            </Box>

            <Typography variant="body2" sx={{ mb: 1 }}>
                You have used {usageInfo?.usage_count || 0}/
                {usageInfo?.max_usage || 5} emotion detection attempts.
            </Typography>

            <LinearProgress
                variant="determinate"
                value={usagePercentage}
                sx={{
                    mb: 2,
                    height: 8,
                    borderRadius: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                }}
            />

            {remainingUsage <= 1 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    You only have {remainingUsage} attempt(s) left. Register an
                    account for unlimited usage!
                </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                    component={RouterLink}
                    to="/login"
                    variant="contained"
                    color="secondary"
                    startIcon={<Login />}
                    size="small"
                >
                    Login
                </Button>
                <Button
                    component={RouterLink}
                    to="/register"
                    variant="outlined"
                    color="secondary"
                    size="small"
                >
                    Register
                </Button>
            </Box>
        </Box>
    );
}
