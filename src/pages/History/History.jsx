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
        refresh,
        handlePageChange,
        handleLimitChange,
        handleDateFilterChange,
    } = useHistoryData({
        initialLimit: 12,
    });

    // Handle date filter changes
    const applyDateFilter = () => {
        handleDateFilterChange(fromDateInput, toDateInput);
    };

    // Clear all filters
    const clearAllFilters = () => {
        setFromDateInput(null);
        setToDateInput(null);
        handleDateFilterChange(null, null);
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

    // Render loading skeletons
    const renderSkeletons = () => {
        return (
            <Grid container spacing={2}>
                {[...Array(limit)].map((_, index) => (
                    <Grid
                        item
                        xs={12}
                        sm={viewMode === 'grid' ? 6 : 12}
                        md={viewMode === 'grid' ? 4 : 12}
                        lg={viewMode === 'grid' ? 3 : 12}
                        key={index}
                    >
                        <HistoryItemSkeleton />
                    </Grid>
                ))}
            </Grid>
        );
    };

    // Render items list
    const renderItems = () => {
        if (data?.length === 0) {
            return (
                <Alert severity="info" sx={{ borderRadius: 2, mt: 2 }}>
                    No results match your filters. Please change filters and try
                    again.
                </Alert>
            );
        }

        return (
            <Grid container spacing={2}>
                {data?.map((item) => (
                    <Grid
                        item
                        xs={12}
                        sm={viewMode === 'grid' ? 6 : 12}
                        md={viewMode === 'grid' ? 4 : 12}
                        lg={viewMode === 'grid' ? 3 : 12}
                        key={item.detection_id}
                    >
                        <HistoryItem
                            item={item}
                            onDelete={handleDeleteConfirmation}
                            onView={handleViewDetail}
                            viewMode={viewMode}
                        />
                    </Grid>
                ))}
            </Grid>
        );
    };

    // Xử lý thay đổi trang cho TablePagination
    const handleChangePage = (event, newPage) => {
        console.log('Chuyển trang:', newPage + 1);
        handlePageChange(newPage + 1); // TablePagination sử dụng index bắt đầu từ 0
    };

    // Xử lý thay đổi số dòng mỗi trang
    const handleChangeRowsPerPage = (event) => {
        console.log('Thay đổi số dòng:', event.target.value);
        handleLimitChange(parseInt(event.target.value, 10));
    };

    return (
        <Fade in={true}>
            <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, sm: 3, md: 4 },
                        borderRadius: 4,
                        bgcolor: 'background.paper',
                        boxShadow: theme.shadows[2],
                        mb: 4,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            boxShadow: theme.shadows[4],
                        },
                    }}
                >
                    {/* Header with title */}
                    <Typography
                        variant={isMobile ? 'h5' : 'h4'}
                        fontWeight="bold"
                        sx={{
                            mb: 3,
                            textAlign: 'center',
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '0.5px',
                        }}
                    >
                        Emotion Detection History
                    </Typography>

                    <Divider sx={{ mb: 4 }} />

                    {/* Filter section */}
                    <Box
                        sx={{
                            mb: 4,
                            p: 2,
                            bgcolor:
                                theme.palette.mode === 'dark'
                                    ? 'rgba(255,255,255,0.05)'
                                    : 'rgba(0,0,0,0.02)',
                            borderRadius: 3,
                        }}
                    >
                        <LocalizationProvider
                            dateAdapter={AdapterDateFns}
                            adapterLocale={enUS}
                        >
                            <Grid container spacing={2} alignItems="center">
                                {/* Date filters */}
                                <Grid item xs={12} sm={6} md={4}>
                                    <DatePicker
                                        label="From Date"
                                        value={fromDateInput}
                                        onChange={(newValue) =>
                                            setFromDateInput(newValue)
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                size="small"
                                                sx={{
                                                    '& .MuiOutlinedInput-root':
                                                        {
                                                            borderRadius: 2,
                                                        },
                                                }}
                                            />
                                        )}
                                        maxDate={toDateInput || undefined}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={4}>
                                    <DatePicker
                                        label="To Date"
                                        value={toDateInput}
                                        onChange={(newValue) =>
                                            setToDateInput(newValue)
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                size="small"
                                                sx={{
                                                    '& .MuiOutlinedInput-root':
                                                        {
                                                            borderRadius: 2,
                                                        },
                                                }}
                                            />
                                        )}
                                        minDate={fromDateInput || undefined}
                                    />
                                </Grid>

                                {/* Filter and refresh buttons */}
                                <Grid item xs={12} md={4}>
                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={applyDateFilter}
                                            startIcon={<FilterIcon />}
                                            fullWidth
                                            sx={{
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                boxShadow: 'none',
                                                '&:hover': {
                                                    boxShadow: theme.shadows[2],
                                                },
                                            }}
                                        >
                                            {isMobile ? '' : 'Filter'}
                                        </Button>

                                        <Button
                                            variant="outlined"
                                            onClick={clearAllFilters}
                                            startIcon={<RefreshIcon />}
                                            fullWidth
                                            sx={{
                                                borderRadius: 2,
                                                textTransform: 'none',
                                            }}
                                        >
                                            {isMobile ? '' : 'Reset'}
                                        </Button>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </LocalizationProvider>
                    </Box>

                    {/* Toolbar with result count and view mode toggle */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            mb: 3,
                            p: 2,
                            borderRadius: 3,
                            bgcolor:
                                theme.palette.mode === 'dark'
                                    ? 'rgba(255,255,255,0.05)'
                                    : 'rgba(0,0,0,0.02)',
                        }}
                    >
                        {/* Statistics */}
                        <Box sx={{ mb: { xs: 2, sm: 0 } }}>
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                            >
                                <Chip
                                    label={`Total: ${totalCount || 0} results`}
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        borderRadius: 2,
                                        bgcolor:
                                            theme.palette.primary.main + '10',
                                        borderColor:
                                            theme.palette.primary.main + '50',
                                        color: theme.palette.primary.main,
                                        fontWeight: 500,
                                    }}
                                />
                            </Stack>
                        </Box>

                        {/* View mode */}
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    bgcolor: theme.palette.background.paper,
                                    borderRadius: 2,
                                    p: 0.5,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <Tooltip title="List View">
                                    <IconButton
                                        size="small"
                                        color={
                                            viewMode === 'list'
                                                ? 'primary'
                                                : 'default'
                                        }
                                        onClick={() => setViewMode('list')}
                                    >
                                        <ViewListIcon />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Grid View">
                                    <IconButton
                                        size="small"
                                        color={
                                            viewMode === 'grid'
                                                ? 'primary'
                                                : 'default'
                                        }
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <ViewModuleIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Stack>
                    </Box>

                    {/* Error message */}
                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                borderRadius: 2,
                                '& .MuiAlert-icon': {
                                    fontSize: '1.5rem',
                                },
                            }}
                        >
                            Could not load detection history. Please try again
                            later.
                        </Alert>
                    )}

                    {/* Content - List or skeleton */}
                    <Box sx={{ mb: 3, minHeight: '50vh' }}>
                        <div>{loading ? renderSkeletons() : renderItems()}</div>
                    </Box>

                    {/* Pagination */}
                    {!loading && (
                        <Box
                            sx={{
                                mt: 4,
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <TablePagination
                                component="div"
                                count={totalCount || 0}
                                page={(page || 1) - 1} // TablePagination sử dụng index bắt đầu từ 0
                                onPageChange={handleChangePage}
                                rowsPerPage={limit}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                rowsPerPageOptions={[12, 24, 36, 48]}
                                labelRowsPerPage="Số dòng:"
                                labelDisplayedRows={({ from, to, count }) =>
                                    `${from}-${to} của ${
                                        count !== -1 ? count : `hơn ${to}`
                                    }`
                                }
                                // Luôn hiển thị nút next/previous
                                nextIconButtonProps={{
                                    disabled: loading || data.length < limit,
                                }}
                                showFirstButton
                                showLastButton
                            />
                        </Box>
                    )}
                </Paper>

                {/* Detail Modal */}
                {selectedItem && (
                    <HistoryDetailModal
                        open={modalOpen}
                        onClose={handleCloseModal}
                        item={selectedItem}
                        onDelete={handleDeleteConfirmation}
                    />
                )}

                {/* Confirm Delete Modal */}
                <ConfirmDeleteModal
                    open={deleteConfirmOpen}
                    onClose={handleDeleteCancel}
                    onConfirm={() => itemToDelete && handleDelete(itemToDelete)}
                />
            </Container>
        </Fade>
    );
};

export default History;
