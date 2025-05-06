import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    IconButton,
    Button,
    Box,
    Tooltip,
    Badge,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Home as HomeIcon,
    Info as InfoIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
    Login as LoginIcon,
    Logout as LogoutIcon,
    AppRegistration as RegisterIcon,
    History as HistoryIcon,
} from '@mui/icons-material';
import { useUser } from '../account/UserContext';
import { useThemeContext } from '../theme/ThemeContext';
import Account from '../account/Account';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const { isAuthenticated, signOut } = useUser();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const handleMenuClose = () => {
        setMobileMenuOpen(false);
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const navItems = [
        { name: 'Home', path: '/', icon: <HomeIcon />, requiredAuth: false },
        {
            name: 'About',
            path: '/about',
            icon: <InfoIcon />,
            requiredAuth: false,
        },
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: <DashboardIcon />,
            requiredAuth: true,
        },
        {
            name: 'History',
            path: '/history',
            icon: <HistoryIcon />,
            requiredAuth: true,
        },
    ];

    const accountItems = isAuthenticated
        ? [
              {
                  name: 'Profile',
                  path: '/profile',
                  icon: <PersonIcon />,
                  onClick: handleMenuClose,
              },
              {
                  name: 'Settings',
                  path: '/settings',
                  icon: <SettingsIcon />,
                  onClick: handleMenuClose,
              },
              {
                  name: 'Logout',
                  path: '/login',
                  icon: <LogoutIcon color="error" />,
                  onClick: async () => {
                      await signOut();
                      handleMenuClose();
                  },
                  divider: true,
              },
          ]
        : [
              {
                  name: 'Login',
                  path: '/login',
                  icon: <LoginIcon color="primary" />,
                  onClick: handleMenuClose,
              },
              {
                  name: 'Register',
                  path: '/register',
                  icon: <RegisterIcon color="primary" />,
                  onClick: handleMenuClose,
                  highlight: true,
              },
          ];

    return (
        <>
            <AppBar
                position="fixed"
                elevation={1}
                sx={{
                    width: { xs: '95%', sm: '90%', md: '83.333333%' },
                    mx: 'auto',
                    mt: 1.5,
                    left: { xs: '2.5%', sm: '5%', md: '8.333333%' },
                    right: { xs: '2.5%', sm: '5%', md: '8.333333%' },
                    borderRadius: { xs: 1.5, sm: 2 },
                    bgcolor: (theme) =>
                        theme.palette.mode === 'light'
                            ? 'rgba(255, 255, 255, 0.8)'
                            : 'rgba(18, 18, 18, 0.8)',
                    backdropFilter: 'blur(8px)',
                    color: (theme) =>
                        theme.palette.mode === 'light'
                            ? 'text.primary'
                            : 'text.primary',
                    borderBottom: 1,
                    borderColor: 'divider',
                    transition: 'all 0.3s ease-in-out',
                    zIndex: 1200,
                }}
            >
                <Toolbar
                    sx={{
                        px: { xs: 1, sm: 2 },
                        justifyContent: 'space-between',
                    }}
                >
                    {/* Logo - Luôn ở bên trái */}
                    <Link
                        to="/"
                        style={{
                            color: 'inherit',
                            textDecoration: 'none',
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <Badge
                            badgeContent="AI"
                            color="primary"
                            sx={{
                                '& .MuiBadge-badge': {
                                    fontSize: '0.6rem',
                                    height: '16px',
                                    minWidth: '16px',
                                    top: -2,
                                    right: -15,
                                },
                            }}
                        >
                            Emotion Detect
                        </Badge>
                    </Link>

                    {/* Menu chính - Hiển thị trên màn hình lớn */}
                    <Box
                        sx={{
                            display: { xs: 'none', sm: 'flex' },
                            ml: 4,
                            gap: 1,
                            flexGrow: 1,
                        }}
                    >
                        {navItems.map((item) => {
                            if (item.requiredAuth && !isAuthenticated)
                                return null;

                            return (
                                <Tooltip key={item.path} title={item.name}>
                                    <Button
                                        component={Link}
                                        to={item.path}
                                        color={
                                            isActive(item.path)
                                                ? 'primary'
                                                : 'inherit'
                                        }
                                        startIcon={item.icon}
                                        sx={{
                                            minWidth: 'unset',
                                            borderRadius: 2,
                                            px: { sm: 1, md: 2 },
                                            '&:hover': {
                                                backgroundColor: (theme) =>
                                                    theme.palette.mode ===
                                                    'light'
                                                        ? 'rgba(0, 0, 0, 0.04)'
                                                        : 'rgba(255, 255, 255, 0.08)',
                                            },
                                        }}
                                    >
                                        <Box
                                            component="span"
                                            sx={{
                                                display: {
                                                    sm: 'none',
                                                    md: 'block',
                                                },
                                            }}
                                        >
                                            {item.name}
                                        </Box>
                                    </Button>
                                </Tooltip>
                            );
                        })}
                    </Box>

                    {/* Các nút và tài khoản ở bên phải */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: { xs: 1, sm: 2 },
                            ml: { xs: 'auto', sm: 0 }, // Đẩy sang phải trên mobile
                        }}
                    >
                        {/* Nút chuyển đổi theme */}
                        <ThemeToggle />

                        {/* Tài khoản người dùng */}
                        <Account />

                        {/* Nút menu trên mobile */}
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="end"
                            onClick={toggleMobileMenu}
                            sx={{ display: { sm: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Menu trên mobile */}
            <Drawer
                anchor="right"
                open={mobileMenuOpen}
                onClose={handleMenuClose}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: 260,
                        mt: 7, // Space for AppBar
                        bgcolor: 'background.paper',
                    },
                }}
            >
                <List sx={{ pt: 2 }}>
                    {/* Danh sách menu chính */}
                    {navItems.map((item) => {
                        if (item.requiredAuth && !isAuthenticated) return null;

                        return (
                            <ListItem key={item.path} disablePadding>
                                <ListItemButton
                                    component={Link}
                                    to={item.path}
                                    selected={isActive(item.path)}
                                    onClick={handleMenuClose}
                                    sx={{
                                        borderRadius: 2,
                                        mx: 1,
                                        mb: 0.5,
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            color: isActive(item.path)
                                                ? 'primary.main'
                                                : 'inherit',
                                            minWidth: 40,
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.name} />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}

                    <Divider sx={{ my: 1 }} />

                    {/* Danh sách menu tài khoản */}
                    {accountItems.map((item) => (
                        <div key={item.name}>
                            {item.divider && <Divider sx={{ my: 1 }} />}
                            <ListItem disablePadding>
                                <ListItemButton
                                    component={Link}
                                    to={item.path}
                                    onClick={item.onClick || handleMenuClose}
                                    sx={{
                                        borderRadius: 2,
                                        mx: 1,
                                        mb: 0.5,
                                        bgcolor: item.highlight
                                            ? 'primary.main'
                                            : 'transparent',
                                        color: item.highlight
                                            ? 'primary.contrastText'
                                            : 'inherit',
                                        '&:hover': {
                                            bgcolor: item.highlight
                                                ? 'primary.dark'
                                                : undefined,
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            color: item.highlight
                                                ? 'primary.contrastText'
                                                : undefined,
                                            minWidth: 40,
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.name} />
                                </ListItemButton>
                            </ListItem>
                        </div>
                    ))}
                </List>
            </Drawer>
        </>
    );
};

export default Navbar;
