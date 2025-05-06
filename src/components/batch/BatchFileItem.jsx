import {
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Typography,
    CircularProgress,
    Box,
    Chip,
    Tooltip,
    useTheme,
} from '@mui/material';
import {
    Delete,
    CheckCircle,
    Error as ErrorIcon,
    PendingOutlined,
} from '@mui/icons-material';

/**
 * Component hiển thị một file trong danh sách batch
 * @param {Object} props - Props của component
 * @param {Object} props.file - File cần hiển thị
 * @param {string} props.status - Trạng thái xử lý ('pending', 'completed', 'error')
 * @param {function} props.onDelete - Callback khi xóa file
 */
const BatchFileItem = ({ file, status = 'pending', onDelete }) => {
    const theme = useTheme();

    // Hiển thị trạng thái file
    const renderStatus = () => {
        switch (status) {
            case 'completed':
                return (
                    <Chip
                        icon={<CheckCircle />}
                        label="Hoàn thành"
                        size="small"
                        color="success"
                        variant="outlined"
                    />
                );
            case 'error':
                return (
                    <Chip
                        icon={<ErrorIcon />}
                        label="Lỗi"
                        size="small"
                        color="error"
                        variant="outlined"
                    />
                );
            case 'pending':
            default:
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress
                            size={16}
                            thickness={5}
                            sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                            Đang xử lý
                        </Typography>
                    </Box>
                );
        }
    };

    // Format kích thước file
    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };

    return (
        <ListItem
            sx={{
                borderRadius: 1,
                mb: 1,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: theme.palette.divider,
            }}
        >
            <ListItemText
                primary={
                    <Tooltip title={file.name} placement="top">
                        <Typography
                            variant="body2"
                            noWrap
                            sx={{ maxWidth: '70%' }}
                        >
                            {file.name}
                        </Typography>
                    </Tooltip>
                }
                secondary={formatFileSize(file.size)}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                {renderStatus()}
            </Box>
            <ListItemSecondaryAction>
                <IconButton
                    edge="end"
                    size="small"
                    onClick={onDelete}
                    disabled={status !== 'pending'}
                >
                    <Delete fontSize="small" />
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    );
};

export default BatchFileItem;
