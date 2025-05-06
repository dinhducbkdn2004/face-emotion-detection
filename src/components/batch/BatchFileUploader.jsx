import { Box, Button, Typography, Stack, Paper, useTheme } from '@mui/material';
import { CloudUpload, CloudUploadOutlined } from '@mui/icons-material';

/**
 * Component tải lên nhiều file với khả năng kéo thả
 * @param {Object} props - Props của component
 * @param {Function} props.onFilesSelect - Hàm xử lý khi chọn files
 * @param {boolean} props.disabled - Trạng thái disabled của component
 */
const BatchFileUploader = ({ onFilesSelect, disabled = false }) => {
    const theme = useTheme();

    // Xử lý kéo thả file
    const handleDrag = (e) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFilesSelect(Array.from(e.dataTransfer.files));
        }
    };

    // Xử lý chọn file qua input
    const handleFileChange = (event) => {
        if (disabled) return;
        if (event.target.files && event.target.files.length > 0) {
            onFilesSelect(Array.from(event.target.files));
        }
    };

    return (
        <Paper
            variant="outlined"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            sx={{
                borderRadius: 2,
                borderStyle: 'dashed',
                borderWidth: '2px',
                borderColor: theme.palette.divider,
                p: 3,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
                bgcolor: disabled
                    ? theme.palette.action.disabledBackground
                    : 'background.paper',
                '&:hover': {
                    bgcolor: disabled
                        ? theme.palette.action.disabledBackground
                        : theme.palette.action.hover,
                },
                opacity: disabled ? 0.7 : 1,
            }}
            onClick={() => {
                if (!disabled) {
                    document.getElementById('batch-file-input').click();
                }
            }}
        >
            <input
                type="file"
                id="batch-file-input"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                disabled={disabled}
            />

            <Stack
                direction="column"
                spacing={1}
                alignItems="center"
                justifyContent="center"
            >
                <CloudUploadOutlined
                    color="primary"
                    sx={{ fontSize: 40, mb: 1, opacity: 0.8 }}
                />
                <Typography variant="h6" component="div" color="text.secondary">
                    Kéo thả nhiều ảnh vào đây
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                >
                    Hoặc click để chọn nhiều ảnh
                </Typography>
                <Button
                    variant="contained"
                    size="small"
                    disabled={disabled}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!disabled) {
                            document.getElementById('batch-file-input').click();
                        }
                    }}
                    startIcon={<CloudUpload />}
                >
                    Chọn files
                </Button>
            </Stack>
        </Paper>
    );
};

export default BatchFileUploader;
