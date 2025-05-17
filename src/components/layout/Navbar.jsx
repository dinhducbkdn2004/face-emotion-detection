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
    Typography,
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
                    width: { xs: '100%', sm: '95%', md: '90%', lg: '85%' },
                    mx: 'auto',
                    mt: { xs: 0, sm: 1 },
                    left: { xs: 0, sm: '2.5%', md: '5%', lg: '7.5%' },
                    right: { xs: 0, sm: '2.5%', md: '5%', lg: '7.5%' },
                    borderRadius: { xs: 0, sm: 1.5, md: 2 },
                    bgcolor: (theme) =>
                        theme.palette.mode === 'light'
                            ? 'rgba(255, 255, 255, 0.8)'
                            : 'rgba(18, 18, 18, 0.8)',
                    backdropFilter: 'blur(8px)',
                    color: 'text.primary',
                    borderBottom: 1,
                    borderColor: 'divider',
                    transition: 'all 0.3s ease-in-out',
                    zIndex: 1200,
                    boxShadow: (theme) =>
                        theme.palette.mode === 'light'
                            ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            : '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.12)',
                }}
            >
                <Toolbar
                    sx={{
                        px: { xs: 1, sm: 2 },
                        justifyContent: 'space-between',
                        minHeight: { xs: '48px', sm: '56px', md: '60px' },
                    }}
                >
                    {/* Logo - Luôn ở bên trái */}
                    <Link
                        to="/"
                        style={{
                            color: 'inherit',
                            textDecoration: 'none',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                position: 'relative',
                            }}
                        >
                            <img
                                src="/logo-duc-bao.svg"
                                alt="Đức-Bảo Logo"
                                style={{
                                    marginRight: '8px',
                                    filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))',
                                    transition: 'all 0.3s ease',
                                    height: '32px',
                                    width: '32px',
                                }}
                            />
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 'bold',
                                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                                    display: { xs: 'none', sm: 'block' }
                                }}
                            >
                                Emotions Detection
                            </Typography>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    display: { xs: 'block', sm: 'none' }
                                }}
                            >
                                Emotions
                            </Typography>
                        </Box>
                    </Link>

                    {/* Menu chính - Hiển thị trên màn hình lớn */}
                    <Box
                        sx={{
                            display: { xs: 'none', sm: 'flex' },
                            ml: { sm: 2, md: 4 },
                            gap: { sm: 0.5, md: 1 },
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
                                                : item.highlight
                                                  ? 'success'
                                                  : 'inherit'
                                        }
                                        startIcon={item.icon}
                                        sx={{
                                            minWidth: 'unset',
                                            borderRadius: 2,
                                            px: { sm: 0.75, md: 1, lg: 2 },
                                            py: { sm: 0.5 },
                                            fontSize: { sm: '0.75rem', md: '0.875rem' },
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
                            gap: { xs: 0.5, sm: 1 },
                        }}
                    >
                        <ThemeToggle />

                        {isAuthenticated ? (
                            <Account />
                        ) : (
                            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                <Button
                                    component={Link}
                                    to="/login"
                                    color="primary"
                                    variant="text"
                                    startIcon={<LoginIcon />}
                                    sx={{ borderRadius: 2, ml: 1, fontSize: { sm: '0.75rem', md: '0.875rem' } }}
                                >
                                    <Box
                                        component="span"
                                        sx={{ display: { xs: 'none', md: 'inline' } }}
                                    >
                                        Login
                                    </Box>
                                </Button>

                                <Button
                                    component={Link}
                                    to="/register"
                                    color="primary"
                                    variant="text"
                                    startIcon={<RegisterIcon />}
                                    sx={{ borderRadius: 2, ml: 1, fontSize: { sm: '0.75rem', md: '0.875rem' } }}
                                >
                                    <Box
                                        component="span"
                                        sx={{
                                            display: { xs: 'none', md: 'inline' },
                                        }}
                                    >
                                        Register
                                    </Box>
                                </Button>
                            </Box>
                        )}

                        {/* Mobile menu button */}
                        <IconButton
                            color="inherit"
                            aria-label="menu"
                            onClick={toggleMobileMenu}
                            sx={{
                                display: { sm: 'none' },
                                ml: 0.5,
                                p: 0.5,
                            }}
                        >
                            <MenuIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                anchor="right"
                open={mobileMenuOpen}
                onClose={handleMenuClose}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: '70%',
                        maxWidth: 280,
                        pt: 1,
                    },
                }}
            >
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                        src="/logo-duc-bao.svg"
                        alt="Logo"
                        style={{
                            height: '28px',
                            width: '28px',
                            marginRight: '8px',
                        }}
                    />
                    <Typography variant="subtitle1" fontWeight="bold">
                        Emotions Detection
                    </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />

                <List sx={{ pt: 0 }}>
                    {navItems
                        .filter(
                            (item) => !item.requiredAuth || isAuthenticated
                        )
                        .map((item) => (
                            <ListItem key={item.path} disablePadding>
                                <ListItemButton
                                    component={Link}
                                    to={item.path}
                                    onClick={handleMenuClose}
                                    selected={isActive(item.path)}
                                    sx={{
                                        py: 1,
                                        borderRadius: 1,
                                        mx: 1,
                                        mb: 0.5,
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.name}
                                        primaryTypographyProps={{
                                            fontSize: '0.875rem',
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                </List>
                <Divider sx={{ my: 1 }} />
                <List>
                    {accountItems.map((item, index) => (
                        <ListItem key={index} disablePadding>
                            <ListItemButton
                                component={Link}
                                to={item.path}
                                onClick={item.onClick}
                                sx={{
                                    py: 1,
                                    borderRadius: 1,
                                    mx: 1,
                                    mb: 0.5,
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.name}
                                    primaryTypographyProps={{
                                        fontSize: '0.875rem',
                                        color: item.name === 'Logout' ? 'error.main' : 'inherit',
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

                <Box sx={{ p: 2, mt: 'auto' }}>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        align="center"
                        display="block"
                    >
                        &copy; 2023 Emotions Detection App
                    </Typography>
                </Box>
            </Drawer>
        </>
    );
};

export default Navbar;
