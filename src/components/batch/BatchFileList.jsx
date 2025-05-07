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
 * Component to display list of selected files for batch processing
 * @param {Object} props - Component props
 * @param {Array} props.files - List of files
 * @param {Array} props.results - Processing results (if any)
 * @param {Function} props.onRemoveFile - Callback when removing a file
 * @param {Function} props.onClearFiles - Callback when clearing all files
 * @param {boolean} props.isProcessing - Whether batch processing is in progress
 */
const BatchFileList = ({
    files = [],
    results = [],
    onRemoveFile,
    onClearFiles,
    isProcessing = false,
}) => {
    const theme = useTheme();

    // Don't display anything if there are no files
    if (!files.length) {
        return null;
    }

    // Get processing status for each file
    const getFileStatus = (file, index) => {
        // If batch processing is in progress
        if (isProcessing) {
            // Check if file is in results
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
                        File List ({files.length})
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
                    Clear All
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
                        {files.length} files selected (
                        {
                            files.filter(
                                (f) => getFileStatus(f) === 'completed'
                            ).length
                        }{' '}
                        completed)
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

export default BatchFileList;
