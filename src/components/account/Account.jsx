import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import {
    Avatar,
    Box,
    Menu,
    MenuItem,
    Typography,
    IconButton,
    Divider,
} from '@mui/material';
import { KeyboardArrowDown as ArrowDownIcon } from '@mui/icons-material';

const Account = () => {
    const { user, isAuthenticated, signOut } = useUser();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        const success = await signOut();
        if (success) {
            handleClose();
            navigate('/login');
        }
    };

    // Nếu chưa đăng nhập
    if (!isAuthenticated || !user) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                    component="button"
                    onClick={() => navigate('/login')}
                    sx={{
                        color: 'inherit',
                        textTransform: 'none',
                        bgcolor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 },
                    }}
                >
                    Đăng nhập
                </Typography>
                <Typography
                    component="button"
                    onClick={() => navigate('/register')}
                    sx={{
                        color: 'inherit',
                        bgcolor: 'primary.main',
                        border: 'none',
                        borderRadius: 1,
                        px: 2,
                        py: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'primary.dark' },
                    }}
                >
                    Đăng ký
                </Typography>
            </Box>
        );
    }

    // Lấy chữ cái đầu của tên người dùng
    const userInitials = user.displayName
        ? user.displayName
            .split(' ')
            .map((name) => name[0])
            .join('')
            .toUpperCase()
        : user.email
            ? user.email[0].toUpperCase()
            : 'U';

    return (
        <>
            <Box 
                sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                }}
                onClick={handleClick}
            >
                <Avatar
                    src={user.photoURL || undefined}
                    alt={user.displayName || user.email}
                    sx={{ 
                        width: 36,
                        height: 36,
                        bgcolor: 'primary.main',
                        fontSize: '1rem'
                    }}
                >
                    {userInitials}
                </Avatar>
                <Typography
                    sx={{
                        ml: 1,
                        display: { xs: 'none', md: 'block' },
                        color: 'text.primary'
                    }}
                    variant="body2"
                >
                    {user.displayName || user.email}
                </Typography>
                <IconButton 
                    size="small"
                    sx={{ 
                        ml: 0.5,
                        color: 'text.primary',
                        '&:hover': { bgcolor: 'transparent' }
                    }}
                >
                    <ArrowDownIcon fontSize="small" />
                </IconButton>
            </Box>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    elevation: 2,
                    sx: {
                        minWidth: 200,
                        mt: 1.5,
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle2">
                        {user.displayName || 'Người dùng'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                        {user.email}
                    </Typography>
                </Box>

                <Divider />

                <MenuItem 
                    onClick={() => {
                        handleClose();
                        navigate('/profile');
                    }}
                >
                    <Typography variant="body2">Hồ sơ của tôi</Typography>
                </MenuItem>
                <MenuItem 
                    onClick={() => {
                        handleClose();
                        navigate('/settings');
                    }}
                >
                    <Typography variant="body2">Cài đặt</Typography>
                </MenuItem>
                
                <Divider />

                <MenuItem 
                    onClick={handleLogout}
                    sx={{ color: 'error.main' }}
                >
                    <Typography variant="body2">Đăng xuất</Typography>
                </MenuItem>
            </Menu>
        </>
    );
};

export default Account;
