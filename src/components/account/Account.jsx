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
    ListItemIcon,
    Tooltip,
    Button,
} from '@mui/material';
import {
    KeyboardArrowDown as ArrowDownIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    Login as LoginIcon,
    PersonAdd as RegisterIcon,
    AccountCircleOutlined,
} from '@mui/icons-material';

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

    // If not logged in
    if (!isAuthenticated || !user) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Login">
                    <IconButton
                        color="primary"
                        onClick={() => navigate('/login')}
                        sx={{
                            display: { xs: 'flex', sm: 'none' },
                            bgcolor: 'transparent',
                            p: 1,
                        }}
                    >
                        <LoginIcon />
                    </IconButton>
                </Tooltip>

                <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
                    <Button
                        variant="text"
                        color="primary"
                        startIcon={<LoginIcon />}
                        onClick={() => navigate('/login')}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            '&:hover': { opacity: 0.8 },
                        }}
                    >
                        Login
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<RegisterIcon />}
                        onClick={() => navigate('/register')}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            boxShadow: 2,
                            '&:hover': {
                                boxShadow: 4,
                                transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.2s ease-in-out',
                        }}
                    >
                        Register
                    </Button>
                </Box>
            </Box>
        );
    }

    // Get the first letter of the user's name
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
            <Tooltip title="Account">
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        p: 0.5,
                        borderRadius: 2,
                        '&:hover': {
                            bgcolor: 'action.hover',
                        },
                        transition: 'all 0.2s ease',
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
                            fontSize: '1rem',
                            boxShadow: 1,
                        }}
                    >
                        {userInitials}
                    </Avatar>
                    <Typography
                        sx={{
                            ml: 1,
                            display: { xs: 'none', md: 'block' },
                            color: 'text.primary',
                            fontWeight: 500,
                        }}
                        variant="body2"
                    >
                        {user.displayName || user.email.split('@')[0]}
                    </Typography>
                    <IconButton
                        size="small"
                        sx={{
                            ml: { xs: 0, md: 0.5 },
                            color: 'text.primary',
                            p: 0.2,
                            '&:hover': { bgcolor: 'transparent' },
                        }}
                    >
                        <ArrowDownIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    elevation: 3,
                    sx: {
                        minWidth: 200,
                        mt: 1.5,
                        borderRadius: 2,
                        overflow: 'visible',
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                        {user.displayName || 'User'}
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
                    sx={{
                        py: 1.5,
                        '&:hover': {
                            bgcolor: 'action.hover',
                            '& .MuiListItemIcon-root': {
                                color: 'primary.main',
                            },
                        },
                        transition: 'all 0.2s',
                    }}
                >
                    <ListItemIcon>
                        <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="body2">My Profile</Typography>
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        handleClose();
                        navigate('/settings');
                    }}
                    sx={{
                        py: 1.5,
                        '&:hover': {
                            bgcolor: 'action.hover',
                            '& .MuiListItemIcon-root': {
                                color: 'primary.main',
                            },
                        },
                        transition: 'all 0.2s',
                    }}
                >
                    <ListItemIcon>
                        <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="body2">Settings</Typography>
                </MenuItem>

                <Divider />

                <MenuItem
                    onClick={handleLogout}
                    sx={{
                        py: 1.5,
                        '&:hover': {
                            '& .MuiListItemIcon-root': {
                                color: 'error.main',
                            },
                            color: 'error.main',
                        },
                        transition: 'all 0.2s',
                    }}
                >
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <Typography variant="body2">Logout</Typography>
                </MenuItem>
            </Menu>
        </>
    );
};

export default Account;
