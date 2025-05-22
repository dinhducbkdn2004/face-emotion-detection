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

                {/* Filter section - Redesigned layout */}
                <Box
                    sx={{
                        mb: { xs: 2, md: 3 },
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'stretch', sm: 'center' },
                        gap: { xs: 2, sm: 2 },
                    }}
                >
                    {/* Date pickers section */}
                    <LocalizationProvider
                        dateAdapter={AdapterDateFns}
                        adapterLocale={enUS}
                    >
                        <Stack
                            direction="row"
                            spacing={2}
                            sx={{
                                flex: { xs: '1', sm: '0.7' },
                                maxWidth: { sm: '60%', md: '50%' },
                            }}
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

                    {/* Action buttons section */}
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 2,
                            alignItems: 'center',
                            justifyContent: {
                                xs: 'space-between',
                                sm: 'flex-end',
                            },
                        }}
                    >
                        <Button
                            variant="outlined"
                            startIcon={<FilterIcon />}
                            onClick={applyDateFilter}
                            size="small"
                        >
                            Filter
                        </Button>

                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 1,
                                p: '2px',
                                bgcolor:
                                    theme.palette.mode === 'dark'
                                        ? 'rgba(255,255,255,0.03)'
                                        : 'rgba(0,0,0,0.02)',
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
                                    <ViewListIcon fontSize="small" />
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
                                    <ViewModuleIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Box>
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
                    {data?.length === 0 && !loading ? (
                        <Alert severity="info" sx={{ borderRadius: 2, mt: 2 }}>
                            No results match your filters. Please change filters
                            and try again.
                        </Alert>
                    ) : (
                        <Grid
                            container
                            spacing={isMobile ? 1 : 2}
                            justifyContent={
                                viewMode === 'list' ? 'space-between' : 'center'
                            }
                            sx={{
                                '& .MuiGrid-item': {
                                    display: 'flex',
                                    justifyContent: 'center',
                                },
                            }}
                        >
                            {loading
                                ? // Skeleton loading
                                  Array.from(new Array(limit)).map(
                                      (_, index) => (
                                          <Grid
                                              item
                                              key={`skeleton-${index}`}
                                              xs={12}
                                              sm={viewMode === 'list' ? 6 : 6}
                                              md={viewMode === 'list' ? 6 : 4}
                                              lg={viewMode === 'list' ? 6 : 3}
                                              sx={{
                                                  width: '100%',
                                                  maxWidth:
                                                      viewMode === 'list'
                                                          ? '100%'
                                                          : {
                                                                xs: '100%',
                                                                sm: '320px',
                                                                md: '300px',
                                                                lg: '280px',
                                                            },
                                              }}
                                          >
                                              <HistoryItemSkeleton
                                                  viewMode={viewMode}
                                              />
                                          </Grid>
                                      )
                                  )
                                : data?.map((item) => (
                                      <Grid
                                          item
                                          key={item.detection_id}
                                          xs={12}
                                          sm={viewMode === 'list' ? 6 : 6}
                                          md={viewMode === 'list' ? 6 : 4}
                                          lg={viewMode === 'list' ? 6 : 3}
                                          sx={{
                                              width: '100%',
                                              maxWidth:
                                                  viewMode === 'list'
                                                      ? '100%'
                                                      : {
                                                            xs: '100%',
                                                            sm: '320px',
                                                            md: '300px',
                                                            lg: '280px',
                                                        },
                                          }}
                                      >
                                          <HistoryItem
                                              item={item}
                                              onDelete={
                                                  handleDeleteConfirmation
                                              }
                                              onView={handleViewDetail}
                                              viewMode={viewMode}
                                          />
                                      </Grid>
                                  ))}
                        </Grid>
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
