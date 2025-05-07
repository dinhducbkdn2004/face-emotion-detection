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
    Pagination,
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
    Search as SearchIcon,
    FilterAlt as FilterIcon,
    ViewList as ViewListIcon,
    ViewModule as ViewModuleIcon,
    CalendarMonth as CalendarIcon,
    Clear as ClearIcon,
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
import ToastService from '../../toasts/ToastService';

const History = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // State for modal display
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
    const [rowsPerPageOptions] = useState([12, 24, 36, 48]);

    // State for filters
    const [searchInput, setSearchInput] = useState('');
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
        handleKeywordChange,
    } = useHistoryData({
        initialLimit: 12,
    });

    // Handle search form submission
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleKeywordChange(searchInput);
    };

    // Handle date filter changes
    const applyDateFilter = () => {
        handleDateFilterChange(fromDateInput, toDateInput);
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSearchInput('');
        setFromDateInput(null);
        setToDateInput(null);
        handleKeywordChange('');
        handleDateFilterChange(null, null);
    };

    // Handle delete detection result
    const handleDelete = useCallback(
        async (detectionId) => {
            if (
                window.confirm(
                    'Are you sure you want to delete this detection result?'
                )
            ) {
                try {
                    await deleteEmotionDetection(detectionId);
                    ToastService.success(
                        'Detection result deleted successfully'
                    );

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
                } catch (error) {
                    console.error('Error when deleting:', error);
                    ToastService.error(
                        'Could not delete detection result. Please try again.'
                    );
                }
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
                            onDelete={handleDelete}
                            onView={handleViewDetail}
                            viewMode={viewMode}
                        />
                    </Grid>
                ))}
            </Grid>
        );
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
                                <Grid item xs={12} sm={6} md={3}>
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

                                <Grid item xs={12} sm={6} md={3}>
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

                                {/* Search form */}
                                <Grid item xs={12} md={4}>
                                    <form
                                        onSubmit={handleSearchSubmit}
                                        style={{ width: '100%' }}
                                    >
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Search by emotion, date..."
                                            value={searchInput}
                                            onChange={(e) =>
                                                setSearchInput(e.target.value)
                                            }
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                },
                                            }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon
                                                            fontSize="small"
                                                            sx={{
                                                                color: 'text.secondary',
                                                            }}
                                                        />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: searchInput && (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                setSearchInput(
                                                                    ''
                                                                );
                                                                if (searchInput)
                                                                    handleKeywordChange(
                                                                        ''
                                                                    );
                                                            }}
                                                        >
                                                            <ClearIcon fontSize="small" />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </form>
                                </Grid>

                                {/* Filter and refresh buttons */}
                                <Grid item xs={12} md={2}>
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

                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.secondary',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                    }}
                                >
                                    <CalendarIcon fontSize="small" />
                                    Page {page}/{totalPages || 1}
                                </Typography>
                            </Stack>
                        </Box>

                        {/* View mode and rows per page */}
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

                            <FormControl
                                size="small"
                                variant="outlined"
                                sx={{
                                    minWidth: 120,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    },
                                }}
                            >
                                <InputLabel id="rows-per-page-label">
                                    Rows
                                </InputLabel>
                                <Select
                                    labelId="rows-per-page-label"
                                    value={limit}
                                    onChange={(e) =>
                                        handleLimitChange(e.target.value)
                                    }
                                    label="Rows"
                                >
                                    {rowsPerPageOptions.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>
                    </Box>

                    {/* Loading indicator */}
                    {loading && (
                        <Box sx={{ width: '100%', mb: 2 }}>
                            <LinearProgress
                                sx={{
                                    borderRadius: 1,
                                    height: 6,
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 1,
                                    },
                                }}
                            />
                        </Box>
                    )}

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
                        <Fade in={!loading} timeout={500}>
                            <div>
                                {loading ? renderSkeletons() : renderItems()}
                            </div>
                        </Fade>
                    </Box>

                    {/* Pagination */}
                    {!loading && data?.length > 0 && (
                        <Box
                            sx={{
                                mt: 4,
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <Pagination
                                count={totalPages || 1}
                                page={page}
                                onChange={(_, newPage) =>
                                    handlePageChange(newPage)
                                }
                                color="primary"
                                shape="rounded"
                                showFirstButton
                                showLastButton
                                size={isMobile ? 'small' : 'medium'}
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        borderRadius: 2,
                                    },
                                }}
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
                        onDelete={handleDelete}
                    />
                )}
            </Container>
        </Fade>
    );
};

export default History;
