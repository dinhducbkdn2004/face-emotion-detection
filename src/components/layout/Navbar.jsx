import { Link } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Button, Box } from '@mui/material';
import { Menu as MenuIcon, LightMode, DarkMode } from '@mui/icons-material';
import { useUser } from '../account/UserContext';
import { useTheme } from '../theme/ThemeContext';
import Account from '../account/Account';

const Navbar = () => {
    const { isAuthenticated } = useUser();
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <AppBar
            position="fixed"
            elevation={1}
            sx={{
                width: '83.333333%', // w-5/6
                mx: 'auto',
                mt: 1.5,
                left: '8.333333%', // (100% - 83.333333%) / 2
                right: '8.333333%',
                borderRadius: 2,
                bgcolor: theme => theme.palette.mode === 'light' ? 'background.paper' : 'background.paper',
                color: theme => theme.palette.mode === 'light' ? 'text.primary' : 'text.primary',
                borderBottom: 1,
                borderColor: 'divider'
            }}
        >
            <Toolbar>
                <Link
                    to="/"
                    style={{
                        color: 'inherit',
                        textDecoration: 'none',
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                    }}
                >
                    Emotion Detection
                </Link>

                <Box
                    sx={{
                        display: { xs: 'none', sm: 'flex' },
                        ml: 4,
                        gap: 2,
                        flexGrow: 1,
                    }}
                >
                    <Button
                        component={Link}
                        to="/"
                        color="inherit"
                        sx={{
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            }
                        }}
                    >
                        Trang chủ
                    </Button>
                    <Button
                        component={Link}
                        to="/about"
                        color="inherit"
                        sx={{
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            }
                        }}
                    >
                        Giới thiệu
                    </Button>
                    {isAuthenticated && (
                        <Button
                            component={Link}
                            to="/dashboard"
                            color="inherit"
                            sx={{
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: theme =>
                                        theme.palette.mode === 'light'
                                            ? 'rgba(0, 0, 0, 0.04)'
                                            : 'rgba(255, 255, 255, 0.08)'
                                }
                            }}
                        >
                            Dashboard
                        </Button>
                    )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton
                        onClick={toggleTheme}
                        color="inherit"
                        sx={{
                            ml: 1,
                            '&:hover': {
                                backgroundColor: theme =>
                                    theme.palette.mode === 'light'
                                        ? 'rgba(0, 0, 0, 0.04)'
                                        : 'rgba(255, 255, 255, 0.08)'
                            }
                        }}
                    >
                        {isDarkMode ? <LightMode /> : <DarkMode />}
                    </IconButton>

                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <Account />
                    </Box>

                    <IconButton
                        color="inherit"
                        sx={{
                            display: { sm: 'none' },
                            '&:hover': {
                                backgroundColor: theme =>
                                    theme.palette.mode === 'light'
                                        ? 'rgba(0, 0, 0, 0.04)'
                                        : 'rgba(255, 255, 255, 0.08)'
                            }
                        }}
                        aria-label="menu"
                    >
                        <MenuIcon />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
