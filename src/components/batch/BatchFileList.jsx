import {
    List,
    Typography,
    Paper,
    Box,
    Button,
    Divider,
    Stack,
    useTheme,
} from '@mui/material';
import { Delete, PhotoLibrary } from '@mui/icons-material';
import BatchFileItem from './BatchFileItem';

/**
 * Component hiển thị danh sách các file đã chọn để xử lý batch
 * @param {Object} props - Props của component
 * @param {Array} props.files - Danh sách các file
 * @param {Array} props.results - Kết quả xử lý (nếu có)
 * @param {Function} props.onRemoveFile - Callback khi xóa một file
 * @param {Function} props.onClearFiles - Callback khi xóa tất cả files
 * @param {boolean} props.isProcessing - Đang trong quá trình xử lý
 */
const BatchFileList = ({
    files = [],
    results = [],
    onRemoveFile,
    onClearFiles,
    isProcessing = false,
}) => {
    const theme = useTheme();

    // Không hiển thị gì nếu không có file
    if (!files.length) {
        return null;
    }

    // Lấy trạng thái xử lý cho từng file
    const getFileStatus = (file, index) => {
        // Nếu đang xử lý batch
        if (isProcessing) {
            // Kiểm tra xem file có trong kết quả không
            const foundResult = results.find((r) => r.filename === file.name);

            if (foundResult) {
                if (foundResult.error) return 'error';
                return 'completed';
            }

            return 'pending';
        }

        return 'pending';
    };

    return (
        <Paper
            variant="outlined"
            sx={{
                borderRadius: 2,
                p: 2,
                mt: 2,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhotoLibrary
                        color="primary"
                        fontSize="small"
                        sx={{ mr: 1 }}
                    />
                    <Typography variant="subtitle1" fontWeight="medium">
                        Danh sách file ({files.length})
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    onClick={onClearFiles}
                    disabled={isProcessing}
                >
                    Xóa tất cả
                </Button>
            </Box>

            <Divider sx={{ my: 1 }} />

            <List sx={{ py: 0 }}>
                {files.map((file, index) => (
                    <BatchFileItem
                        key={index}
                        file={file}
                        status={getFileStatus(file, index)}
                        onDelete={() => onRemoveFile(index)}
                    />
                ))}
            </List>

            {files.length > 5 && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                        {files.length} files được chọn (
                        {
                            files.filter(
                                (f) => getFileStatus(f) === 'completed'
                            ).length
                        }{' '}
                        hoàn thành)
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

export default BatchFileList;
