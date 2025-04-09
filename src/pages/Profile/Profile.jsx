import { useState } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Avatar,
    Button,
    TextField,
    Box,
    Tab,
    Tabs,
    IconButton,
    Divider,
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { useUser } from '../../components/account/UserContext';

const MotionPaper = motion.create(Paper);
const MotionBox = motion.create(Box);

function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`profile-tabpanel-${index}`}
            aria-labelledby={`profile-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export default function Profile() {
    const theme = useTheme();
    const { user } = useUser();
    const [tab, setTab] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        displayName: user?.displayName || '',
        email: user?.email || '',
        phone: '',
        bio: '',
    });

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        // TODO: Implement save functionality
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset form data
        setProfileData({
            displayName: user?.displayName || '',
            email: user?.email || '',
            phone: '',
            bio: '',
        });
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Grid container spacing={4}>
                {/* Profile Header */}
                <Grid item xs={12}>
                    <MotionPaper
                        elevation={0}
                        sx={{
                            p: 4,
                            borderRadius: 4,
                            border: 1,
                            borderColor: 'divider',
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Grid container alignItems="center" spacing={4}>
                            <Grid item>
                                <Box sx={{ position: 'relative' }}>
                                    <Avatar
                                        src={user?.photoURL}
                                        alt={user?.displayName}
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            border: 3,
                                            borderColor: 'primary.main',
                                        }}
                                    />
                                    <IconButton
                                        sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            right: 0,
                                            backgroundColor: 'background.paper',
                                            '&:hover': { backgroundColor: 'background.default' },
                                        }}
                                    >
                                        <PhotoCameraIcon />
                                    </IconButton>
                                </Box>
                            </Grid>
                            <Grid item xs>
                                <Typography variant="h4" gutterBottom fontWeight="bold">
                                    {user?.displayName || 'Người dùng'}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {user?.email}
                                </Typography>
                            </Grid>
                        </Grid>
                    </MotionPaper>
                </Grid>

                {/* Profile Content */}
                <Grid item xs={12}>
                    <MotionPaper
                        elevation={0}
                        sx={{
                            borderRadius: 4,
                            border: 1,
                            borderColor: 'divider',
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Tabs
                            value={tab}
                            onChange={handleTabChange}
                            sx={{
                                borderBottom: 1,
                                borderColor: 'divider',
                                px: 2,
                            }}
                        >
                            <Tab label="Thông tin cá nhân" />
                            <Tab label="Bảo mật" />
                            <Tab label="Thông báo" />
                        </Tabs>

                        <TabPanel value={tab} index={0}>
                            <Box sx={{ position: 'relative' }}>
                                {!isEditing && (
                                    <Button
                                        startIcon={<EditIcon />}
                                        onClick={handleEdit}
                                        sx={{ position: 'absolute', right: 0, top: 0 }}
                                    >
                                        Chỉnh sửa
                                    </Button>
                                )}

                                {isEditing ? (
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Họ và tên"
                                                value={profileData.displayName}
                                                onChange={(e) =>
                                                    setProfileData({
                                                        ...profileData,
                                                        displayName: e.target.value,
                                                    })
                                                }
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Email"
                                                value={profileData.email}
                                                disabled
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Số điện thoại"
                                                value={profileData.phone}
                                                onChange={(e) =>
                                                    setProfileData({
                                                        ...profileData,
                                                        phone: e.target.value,
                                                    })
                                                }
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Giới thiệu"
                                                multiline
                                                rows={4}
                                                value={profileData.bio}
                                                onChange={(e) =>
                                                    setProfileData({
                                                        ...profileData,
                                                        bio: e.target.value,
                                                    })
                                                }
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<CancelIcon />}
                                                    onClick={handleCancel}
                                                >
                                                    Hủy
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    startIcon={<SaveIcon />}
                                                    onClick={handleSave}
                                                >
                                                    Lưu thay đổi
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                ) : (
                                    <Box>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle1" color="text.secondary">
                                                    Họ và tên
                                                </Typography>
                                                <Typography variant="body1">
                                                    {profileData.displayName || 'Chưa cập nhật'}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle1" color="text.secondary">
                                                    Email
                                                </Typography>
                                                <Typography variant="body1">{profileData.email}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle1" color="text.secondary">
                                                    Số điện thoại
                                                </Typography>
                                                <Typography variant="body1">
                                                    {profileData.phone || 'Chưa cập nhật'}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle1" color="text.secondary">
                                                    Giới thiệu
                                                </Typography>
                                                <Typography variant="body1">
                                                    {profileData.bio || 'Chưa cập nhật'}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                )}
                            </Box>
                        </TabPanel>

                        <TabPanel value={tab} index={1}>
                            <Typography variant="h6" gutterBottom>
                                Bảo mật tài khoản
                            </Typography>
                            <Box sx={{ mb: 3 }}>
                                <Button variant="outlined" color="primary">
                                    Đổi mật khẩu
                                </Button>
                            </Box>
                            <Divider sx={{ my: 3 }} />
                            <Typography variant="h6" gutterBottom>
                                Xác thực hai yếu tố
                            </Typography>
                            <Button variant="outlined" color="primary">
                                Thiết lập xác thực hai yếu tố
                            </Button>
                        </TabPanel>

                        <TabPanel value={tab} index={2}>
                            <Typography variant="h6" gutterBottom>
                                Cài đặt thông báo
                            </Typography>
                            {/* Add notification settings here */}
                        </TabPanel>
                    </MotionPaper>
                </Grid>
            </Grid>
        </Container>
    );
}