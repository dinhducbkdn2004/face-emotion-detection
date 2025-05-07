import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Box,
    Typography,
    useTheme,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

const ConfirmDeleteModal = ({ open, onClose, onConfirm }) => {
    const theme = useTheme();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    p: 1,
                },
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                    }}
                >
                    <WarningIcon
                        sx={{
                            fontSize: 40,
                            color: theme.palette.warning.main,
                            mr: 1,
                        }}
                    />
                </Box>
                <Typography variant="h6" component="div" fontWeight="bold">
                    Confirm Delete
                </Typography>
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ textAlign: 'center' }}>
                    Are you sure you want to delete this detection result? This
                    action cannot be undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 1 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        textTransform: 'none',
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        textTransform: 'none',
                    }}
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDeleteModal;
