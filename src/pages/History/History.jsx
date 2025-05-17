import { useState, useCallback, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    Card,
    CardContent,
    Alert,
    TextField,
    Button,
    IconButton,
    TablePagination,
    Stack,
    Divider,
    Chip,
    useTheme,
    useMediaQuery,
    InputAdornment,
    FormControl,
    MenuItem,
    Select,
    InputLabel,
    LinearProgress,
    Tooltip,
    Badge,
    Fade,
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    FilterAlt as FilterIcon,
    ViewList as ViewListIcon,
    ViewModule as ViewModuleIcon,
    CalendarMonth as CalendarIcon,
} from '@mui/icons-material';

// Date picker
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { enUS } from 'date-fns/locale';

import useHistoryData from '../../hooks/useHistoryData';
import { deleteEmotionDetection } from '../../services/emotionService';
import HistoryItem from '../../components/history/HistoryItem';
import HistoryItemSkeleton from '../../components/history/HistoryItemSkeleton';
import HistoryDetailModal from '../../components/history/HistoryDetailModal';
import ConfirmDeleteModal from '../../components/history/ConfirmDeleteModal';
import ToastService from '../../toasts/ToastService';

const History = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // State for modal display
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // State for filters
    const [fromDateInput, setFromDateInput] = useState(null);
    const [toDateInput, setToDateInput] = useState(null);

    // Use enhanced useHistoryData hook
    const {
        data,
        loading,
        error,
        totalCount,
        totalPages,
        page,
        limit,
        fromDate,
        toDate,
        refresh,
        handlePageChange,
        handleLimitChange,
        handleDateFilterChange,
    } = useHistoryData({
        initialLimit: 12,
    });

    // Đồng bộ giá trị filter từ hook khi component mount
    useEffect(() => {
        setFromDateInput(fromDate);
        setToDateInput(toDate);
    }, [fromDate, toDate]);

    // Handle date filter changes
    const applyDateFilter = () => {
        handleDateFilterChange(fromDateInput, toDateInput);
    };

    const handleDeleteConfirmation = (detectionId) => {
        setItemToDelete(detectionId);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
        setItemToDelete(null);
    };

    const handleDelete = useCallback(
        async (detectionId) => {
            try {
                await deleteEmotionDetection(detectionId);
                // Close modal if the viewed item is being deleted
                if (
                    modalOpen &&
                    selectedItem &&
                    selectedItem.detection_id === detectionId
                ) {
                    setModalOpen(false);
                    setSelectedItem(null);
                }

                refresh(); // Refresh data after deletion
                setDeleteConfirmOpen(false);
            } catch (error) {
                console.error('Error when deleting:', error);
                ToastService.error(
                    'Could not delete detection result. Please try again.'
                );
            }
        },
        [modalOpen, selectedItem, refresh]
    );

    // Handle view detail click
    const handleViewDetail = useCallback((item) => {
        setSelectedItem(item);
        setModalOpen(true);
    }, []);

    // Close modal
    const handleCloseModal = () => {
        setModalOpen(false);
    };

    // Xử lý thay đổi trang cho TablePagination
    const handleChangePage = (event, newPage) => {
        // Chỉ thay đổi trang mà không reset các bộ lọc
        handlePageChange(newPage + 1); // TablePagination sử dụng index bắt đầu từ 0
    };

    // Xử lý thay đổi số dòng mỗi trang
    const handleChangeRowsPerPage = (event) => {
        handleLimitChange(parseInt(event.target.value, 10));
    };

    return (
        <Container
            maxWidth="lg"
            sx={{
                py: { xs: 1.5, md: 4 },
                width: { xs: '90%', sm: '95%', md: '100%', lg: '100%' },
                mx: 'auto',
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 1.5, sm: 2, md: 3 },
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    boxShadow: theme.shadows[1],
                    mb: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: theme.shadows[3],
                    },
                }}
            >
                {/* Header with title */}
                <Typography
                    variant={isMobile ? 'h6' : isTablet ? 'h5' : 'h4'}
                    fontWeight="bold"
                    sx={{
                        mb: { xs: 1.5, md: 2 },
                        textAlign: 'center',
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '0.5px',
                        fontSize: {
                            xs: '1.25rem',
                            sm: '1.5rem',
                            md: '2rem',
                        },
                    }}
                >
                    Emotion Detection History
                </Typography>

                <Divider sx={{ mb: { xs: 2, md: 3 } }} />

                {/* Filter section */}
                <Box
                    sx={{
                        mb: { xs: 2, md: 3 },
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        flexWrap: 'wrap',
                        gap: { xs: 1, md: 2 },
                        alignItems: { xs: 'stretch', md: 'center' },
                    }}
                >
                    <LocalizationProvider
                        dateAdapter={AdapterDateFns}
                        adapterLocale={enUS}
                    >
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={{ xs: 1, sm: 2 }}
                            sx={{ flexGrow: 1 }}
                        >
                            <DatePicker
                                label="From Date"
                                value={fromDateInput}
                                onChange={(newValue) =>
                                    setFromDateInput(newValue)
                                }
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: 'small',
                                        variant: 'outlined',
                                        sx: {
                                            bgcolor:
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(255,255,255,0.03)'
                                                    : 'rgba(0,0,0,0.02)',
                                        },
                                    },
                                }}
                            />
                            <DatePicker
                                label="To Date"
                                value={toDateInput}
                                onChange={(newValue) =>
                                    setToDateInput(newValue)
                                }
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: 'small',
                                        variant: 'outlined',
                                        sx: {
                                            bgcolor:
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(255,255,255,0.03)'
                                                    : 'rgba(0,0,0,0.02)',
                                        },
                                    },
                                }}
                            />
                        </Stack>
                    </LocalizationProvider>

                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            justifyContent: {
                                xs: 'space-between',
                                md: 'center',
                            },
                            mt: { xs: 1, md: 0 },
                            width: { xs: '100%', md: 'auto' },
                        }}
                    >
                        <Button
                            variant="outlined"
                            startIcon={<FilterIcon />}
                            onClick={applyDateFilter}
                            size="small"
                            sx={{ flex: { xs: 1, md: 'none' } }}
                        >
                            Filter
                        </Button>
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                                justifyContent: 'flex-end',
                            }}
                        >
                            <Tooltip title="List view">
                                <IconButton
                                    color={
                                        viewMode === 'list'
                                            ? 'primary'
                                            : 'default'
                                    }
                                    onClick={() => setViewMode('list')}
                                    size="small"
                                >
                                    <ViewListIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Grid view">
                                <IconButton
                                    color={
                                        viewMode === 'grid'
                                            ? 'primary'
                                            : 'default'
                                    }
                                    onClick={() => setViewMode('grid')}
                                    size="small"
                                >
                                    <ViewModuleIcon />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Stack>
                </Box>

                {/* Loading progress */}
                {loading && (
                    <LinearProgress
                        sx={{
                            mb: 2,
                            borderRadius: 1,
                            height: 6,
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 1,
                                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            },
                        }}
                    />
                )}

                {/* Items list */}
                <Box
                    sx={{
                        minHeight: { xs: '300px', md: '400px' },
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        width: '100%',
                        mx: 'auto',
                    }}
                >
                    {data?.length === 0 ? (
                        <Alert severity="info" sx={{ borderRadius: 2, mt: 2 }}>
                            No results match your filters. Please change filters
                            and try again.
                        </Alert>
                    ) : (
                        <Fade in={!loading} timeout={800}>
                            <Grid
                                container
                                spacing={isMobile ? 1 : 2}
                                justifyContent="center"
                            >
                                {data?.map((item) => (
                                    <Grid item key={item.detection_id}>
                                        <HistoryItem
                                            item={item}
                                            onDelete={handleDeleteConfirmation}
                                            onView={handleViewDetail}
                                            viewMode={viewMode}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Fade>
                    )}
                </Box>

                {/* Pagination */}
                {!loading && data?.length > 0 && (
                    <TablePagination
                        component="div"
                        count={totalCount}
                        page={page - 1} // TablePagination sử dụng index bắt đầu từ 0
                        onPageChange={handleChangePage}
                        rowsPerPage={limit}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={
                            isMobile ? [6, 12, 24] : [6, 12, 24, 48]
                        }
                        labelRowsPerPage={isTablet ? 'Rows:' : 'Rows per page:'}
                        sx={{
                            mt: 2,
                            '.MuiTablePagination-toolbar': {
                                fontSize: '0.85rem',
                                flexWrap: 'wrap',
                                gap: 0.5,
                                justifyContent: isMobile
                                    ? 'center'
                                    : 'flex-end',
                            },
                            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows':
                                {
                                    fontSize: '0.85rem',
                                    margin: isMobile ? 0 : undefined,
                                },
                            '.MuiTablePagination-select': {
                                paddingLeft: isMobile ? '0.25rem' : undefined,
                                paddingRight: isMobile ? '1.5rem' : undefined,
                            },
                            '.MuiSelect-select': {
                                minWidth: isMobile ? '1.5rem' : undefined,
                            },
                            '.MuiTablePagination-actions': {
                                marginLeft: isMobile ? 0 : undefined,
                            },
                        }}
                    />
                )}
            </Paper>

            {/* Detail modal */}
            <HistoryDetailModal
                open={modalOpen}
                onClose={handleCloseModal}
                item={selectedItem}
                onDelete={handleDelete}
            />

            {/* Confirm Delete */}
            <ConfirmDeleteModal
                open={deleteConfirmOpen}
                onClose={handleDeleteCancel}
                onConfirm={() => handleDelete(itemToDelete)}
                item={
                    data?.find((item) => item.detection_id === itemToDelete) ||
                    null
                }
            />
        </Container>
    );
};

export default History;
