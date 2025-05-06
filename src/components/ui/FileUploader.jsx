import { useState, useRef } from 'react';
import {
    Box,
    Button,
    Typography,
    useTheme,
    Paper,
    Stack,
    IconButton,
} from '@mui/material';
import { CloudUpload, Delete, CloudUploadOutlined } from '@mui/icons-material';

/**
 * Component tải lên file với khả năng kéo thả
 * @param {Object} props - Props của component
 * @param {Function} props.onFileSelect - Hàm xử lý khi chọn file
 * @param {Function} props.onClearFile - Hàm xử lý khi xóa file
 * @param {string} props.accept - Các loại file chấp nhận (default: "image/*")
 * @param {number} props.maxSize - Kích thước tối đa của file tính bằng byte (default: 5MB)
 * @param {boolean} props.multiple - Cho phép chọn nhiều file (default: false)
 * @param {string} props.previewUrl - URL xem trước của file (nếu là ảnh)
 */
const FileUploader = ({
    onFileSelect,
    onClearFile,
    accept = 'image/*',
    maxSize = 5 * 1024 * 1024,
    multiple = false,
    previewUrl = null,
}) => {
    const theme = useTheme();
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    // Xử lý kéo thả file
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(
                multiple
                    ? Array.from(e.dataTransfer.files)
                    : e.dataTransfer.files[0]
            );
        }
    };

    // Xử lý chọn file qua input
    const handleFileChange = (event) => {
        if (multiple) {
            if (event.target.files && event.target.files.length > 0) {
                handleFiles(Array.from(event.target.files));
            }
        } else {
            if (event.target.files && event.target.files[0]) {
                handleFiles(event.target.files[0]);
            }
        }
    };

    // Validate và xử lý files
    const handleFiles = (files) => {
        if (multiple) {
            // Lọc files hợp lệ
            const validFiles = files.filter((file) => {
                if (file.size > maxSize) {
                    console.warn(
                        `File "${file.name}" vượt quá kích thước cho phép (${maxSize / 1024 / 1024}MB)`
                    );
                    return false;
                }

                // Kiểm tra định dạng nếu có yêu cầu
                if (
                    accept !== '*' &&
                    !file.type.match(accept.replace('*', '.*'))
                ) {
                    console.warn(`File "${file.name}" không đúng định dạng`);
                    return false;
                }

                return true;
            });

            if (validFiles.length !== files.length) {
                alert('Một số file không hợp lệ và đã bị loại bỏ');
            }

            if (validFiles.length > 0) {
                onFileSelect(validFiles);
            }
        } else {
            const file = files;

            // Kiểm tra kích thước file
            if (file.size > maxSize) {
                alert(
                    `Kích thước file không được vượt quá ${maxSize / 1024 / 1024}MB`
                );
                return;
            }

            // Kiểm tra định dạng nếu có yêu cầu
            if (accept !== '*' && !file.type.match(accept.replace('*', '.*'))) {
                alert('Định dạng file không hợp lệ');
                return;
            }

            onFileSelect(file);
        }
    };

    // Xóa file đã chọn
    const handleClear = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
        }
        onClearFile();
    };

    // Kích hoạt click vào input
    const handleButtonClick = () => {
        inputRef.current.click();
    };

    return (
        <Box>
            <input
                type="file"
                ref={inputRef}
                onChange={handleFileChange}
                accept={accept}
                style={{ display: 'none' }}
                multiple={multiple}
            />

            {previewUrl ? (
                <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        position: 'relative',
                        mb: 2,
                    }}
                >
                    <img
                        src={previewUrl}
                        alt="Preview"
                        style={{
                            width: '100%',
                            maxHeight: '250px',
                            objectFit: 'contain',
                        }}
                    />
                    <IconButton
                        size="small"
                        onClick={handleClear}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                        }}
                    >
                        <Delete fontSize="small" />
                    </IconButton>
                </Paper>
            ) : (
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
                        borderColor: dragActive
                            ? theme.palette.primary.main
                            : theme.palette.divider,
                        bgcolor: dragActive
                            ? theme.palette.action.hover
                            : 'background.paper',
                        p: 3,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'center',
                        '&:hover': {
                            bgcolor: theme.palette.action.hover,
                        },
                    }}
                    onClick={handleButtonClick}
                >
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
                        <Typography
                            variant="h6"
                            component="div"
                            color="text.secondary"
                        >
                            Kéo thả file vào đây
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                        >
                            Hoặc click để chọn file
                        </Typography>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleButtonClick();
                            }}
                            startIcon={<CloudUpload />}
                        >
                            Chọn file
                        </Button>
                    </Stack>
                </Paper>
            )}
        </Box>
    );
};

export default FileUploader;
