import { useState } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Switch,
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Language as LanguageIcon,
    Palette as PaletteIcon,
    Security as SecurityIcon,
    Storage as StorageIcon,
    Smartphone as SmartphoneIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';

const MotionPaper = motion.create(Paper);

const settingsSections = [
    {
        title: 'Giao diện',
        items: [
            {
                icon: <PaletteIcon />,
                title: 'Giao diện tối',
                description: 'Bật/tắt chế độ tối',
                type: 'switch',
            },
        ],
    },
    {
        title: 'Thông báo',
        items: [
            {
                icon: <NotificationsIcon />,
                title: 'Thông báo ứng dụng',
                description: 'Nhận thông báo từ ứng dụng',
                type: 'switch',
            },
            {
                icon: <SmartphoneIcon />,
                title: 'Thông báo qua email',
                description: 'Nhận thông báo qua email',
                type: 'switch',
            },
        ],
    },
    {
        title: 'Ngôn ngữ & Khu vực',
        items: [
            {
                icon: <LanguageIcon />,
                title: 'Ngôn ngữ',
                description: 'Chọn ngôn ngữ hiển thị',
                type: 'select',
                options: [
                    { value: 'vi', label: 'Tiếng Việt' },
                    { value: 'en', label: 'English' },
                ],
            },
        ],
    },
    {
        title: 'Bảo mật',
        items: [
            {
                icon: <SecurityIcon />,
                title: 'Xác thực hai yếu tố',
                description: 'Bảo mật tài khoản với xác thực hai yếu tố',
                type: 'button',
                buttonText: 'Thiết lập',
            },
        ],
    },
    {
        title: 'Dữ liệu',
        items: [
            {
                icon: <StorageIcon />,
                title: 'Xóa dữ liệu',
                description: 'Xóa tất cả dữ liệu cá nhân',
                type: 'button',
                buttonText: 'Xóa dữ liệu',
                buttonColor: 'error',
            },
        ],
    },
];

export default function Settings() {
    const theme = useTheme();
    const [settings, setSettings] = useState({
        darkMode: theme.palette.mode === 'dark',
        appNotifications: true,
        emailNotifications: true,
        language: 'vi',
    });

    const handleSettingChange = (setting, value) => {
        setSettings(prev => ({
            ...prev,
            [setting]: value
        }));
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
                    Cài đặt
                </Typography>

                {settingsSections.map((section, sectionIndex) => (
                    <MotionPaper
                        key={section.title}
                        variants={itemVariants}
                        elevation={0}
                        sx={{
                            mb: 3,
                            borderRadius: 4,
                            border: 1,
                            borderColor: 'divider',
                            overflow: 'hidden',
                        }}
                    >
                        <Box sx={{ px: 3, py: 2, bgcolor: 'background.default' }}>
                            <Typography variant="h6" fontWeight="medium">
                                {section.title}
                            </Typography>
                        </Box>
                        <Divider />
                        <List>
                            {section.items.map((item, itemIndex) => (
                                <ListItem
                                    key={item.title}
                                    sx={{
                                        py: 2,
                                        '&:hover': {
                                            bgcolor: theme.palette.mode === 'dark'
                                                ? 'rgba(255, 255, 255, 0.05)'
                                                : 'rgba(0, 0, 0, 0.02)',
                                        },
                                    }}
                                >
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText
                                        primary={item.title}
                                        secondary={item.description}
                                        primaryTypographyProps={{
                                            fontWeight: 'medium',
                                        }}
                                    />
                                    <ListItemSecondaryAction>
                                        {item.type === 'switch' && (
                                            <Switch
                                                edge="end"
                                                checked={settings[Object.keys(settings)[itemIndex]]}
                                                onChange={(e) =>
                                                    handleSettingChange(
                                                        Object.keys(settings)[itemIndex],
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                        )}
                                        {item.type === 'select' && (
                                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                                <Select
                                                    value={settings.language}
                                                    onChange={(e) =>
                                                        handleSettingChange('language', e.target.value)
                                                    }
                                                >
                                                    {item.options.map((option) => (
                                                        <MenuItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        )}
                                        {item.type === 'button' && (
                                            <Button
                                                variant="outlined"
                                                color={item.buttonColor || 'primary'}
                                                size="small"
                                            >
                                                {item.buttonText}
                                            </Button>
                                        )}
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </MotionPaper>
                ))}
            </motion.div>
        </Container>
    );
}