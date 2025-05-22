import { useState, useEffect, useCallback, useRef } from 'react';
import { getEmotionHistory } from '../services/emotionService';

const CACHE_TIME = 5 * 60 * 1000; // 5 phút

const useHistoryData = (options = {}) => {
    const {
        initialPage = 1,
        initialLimit = 12,
        initialFromDate = null,
        initialToDate = null,
        initialKeyword = '',
    } = options;

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Trạng thái filter và phân trang
    const [page, setPage] = useState(initialPage);
    const [limit, setLimit] = useState(initialLimit);
    const [fromDate, setFromDate] = useState(initialFromDate);
    const [toDate, setToDate] = useState(initialToDate);
    const [keyword, setKeyword] = useState(initialKeyword);

    // Cache management
    const cache = useRef({
        data: {},
        timestamp: {},
        totalCount: 0,
    });

    // Debounce timer
    const debounceTimer = useRef(null);

    // Tạo key cache dựa trên tất cả các tham số
    const getCacheKey = useCallback(() => {
        const skip = (page - 1) * limit;
        return `${skip}-${limit}-${fromDate ? fromDate.getTime() : ''}-${
            toDate ? toDate.getTime() : ''
        }-${keyword}`;
    }, [page, limit, fromDate, toDate, keyword]);

    const isCacheValid = useCallback((key) => {
        const timestamp = cache.current.timestamp[key];
        return timestamp && Date.now() - timestamp < CACHE_TIME;
    }, []);

    // Kiểm tra xem một record có nằm trong khoảng thời gian đã chọn hay không
    const isRecordInDateRange = useCallback(
        (record) => {
            if (!fromDate && !toDate) return true;

            // Chuyển đổi ngày của record thành đối tượng Date
            let recordDate;
            if (record.created_at) {
                recordDate = new Date(record.created_at);
            } else if (record.created_date) {
                recordDate = new Date(record.created_date);
            } else if (record.timestamp) {
                recordDate = new Date(record.timestamp);
            } else if (record.date) {
                recordDate = new Date(record.date);
            } else {
                // Không tìm thấy trường ngày hợp lệ
                return true; // Vẫn hiển thị bản ghi nếu không có thông tin ngày
            }

            // Kiểm tra nằm trong khoảng fromDate-toDate
            if (fromDate && toDate) {
                return recordDate >= fromDate && recordDate <= toDate;
            } else if (fromDate) {
                return recordDate >= fromDate;
            } else if (toDate) {
                return recordDate <= toDate;
            }

            return true;
        },
        [fromDate, toDate]
    );

    const fetchData = useCallback(async () => {
        const skip = (page - 1) * limit;
        const key = getCacheKey();

        // Kiểm tra cache
        if (isCacheValid(key)) {
            setData(cache.current.data[key]);
            setTotalCount(cache.current.totalCount);
            setTotalPages(Math.ceil(cache.current.totalCount / limit));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Chuẩn bị tham số fromDate và toDate đúng định dạng
            let fromDateParam = null;
            let toDateParam = null;

            if (fromDate) {
                // Đảm bảo fromDate bắt đầu từ 00:00:00
                fromDateParam = new Date(fromDate);
                fromDateParam.setHours(0, 0, 0, 0);
            }

            if (toDate) {
                // Đảm bảo toDate kết thúc vào 23:59:59
                toDateParam = new Date(toDate);
                toDateParam.setHours(23, 59, 59, 999);
            }

            // Gọi API với các tham số đã chuẩn hóa
            const response = await getEmotionHistory(skip, limit, {
                fromDate: fromDateParam,
                toDate: toDateParam,
                keyword,
            });

            // Xử lý cấu trúc phản hồi từ API
            let responseData = [];
            let count = 0;

            if (Array.isArray(response)) {
                // Nếu response là mảng, API trả về trực tiếp danh sách bản ghi
                responseData = response;

                // Lọc kết quả để đảm bảo chỉ hiển thị bản ghi trong khoảng thời gian đã chọn
                responseData = responseData.filter(isRecordInDateRange);

                // Nếu độ dài mảng bằng limit, giả định còn thêm bản ghi
                if (responseData.length >= limit) {
                    // Với mảng đầy đủ, giả định còn thêm ít nhất 1 trang nữa
                    count = skip + responseData.length + 1;
                } else {
                    // Nếu không đủ limit, tổng số bản ghi là skip + số bản ghi hiện tại
                    count = skip + responseData.length;
                }

                // Nếu API có trả về tổng số bản ghi trong header hoặc item đầu tiên, ưu tiên sử dụng
                if (
                    response.length > 0 &&
                    (response[0]?.total_count ||
                        response[0]?.totalCount ||
                        response[0]?.total)
                ) {
                    count =
                        response[0]?.total_count ||
                        response[0]?.totalCount ||
                        response[0]?.total;
                }
            } else if (response && typeof response === 'object') {
                // Nếu response là object với cấu trúc { data, totalCount }
                responseData = response.data || response.items || [];

                // Lọc kết quả để đảm bảo chỉ hiển thị bản ghi trong khoảng thời gian đã chọn
                responseData = responseData.filter(isRecordInDateRange);

                // Nếu có trường totalCount, sử dụng nó
                if (
                    response.totalCount !== undefined ||
                    response.total_count !== undefined ||
                    response.total !== undefined
                ) {
                    // Sử dụng totalCount từ API, nhưng phải điều chỉnh theo số lượng bản ghi thực tế sau khi lọc
                    const apiTotalCount =
                        response.totalCount ||
                        response.total_count ||
                        response.total;

                    // Nếu số lượng bản ghi sau khi lọc ít hơn số lượng ban đầu, điều chỉnh lại totalCount
                    if (
                        responseData.length <
                        (response.data?.length || response.items?.length || 0)
                    ) {
                        // Tính tỷ lệ giữa số lượng bản ghi sau lọc và trước lọc
                        const filterRatio =
                            responseData.length /
                            (response.data?.length ||
                                response.items?.length ||
                                1);
                        // Ước tính tổng số bản ghi sau khi lọc
                        count = Math.max(
                            skip + responseData.length,
                            Math.ceil(apiTotalCount * filterRatio)
                        );
                    } else {
                        count = apiTotalCount;
                    }
                } else if (responseData.length >= limit) {
                    // Nếu độ dài bằng limit, giả định còn thêm ít nhất 1 trang nữa
                    count = skip + responseData.length + 1;
                } else {
                    count = skip + responseData.length;
                }
            }

            // Đảm bảo totalCount luôn lớn hơn hoặc bằng số lượng bản ghi đã tải
            if (count < skip + responseData.length) {
                count = skip + responseData.length;
            }

            // Đảm bảo luôn có thể chuyển trang nếu số bản ghi bằng limit
            if (responseData.length === limit && count === skip + limit) {
                // Tăng count thêm 1 để enable nút Next
                count += 1;
            }

            // Cập nhật cache
            cache.current.data[key] = responseData;
            cache.current.timestamp[key] = Date.now();
            cache.current.totalCount = count;

            setData(responseData);
            setTotalCount(count);
            setTotalPages(Math.ceil(count / limit));
            setHasMore(responseData.length === limit);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [
        page,
        limit,
        fromDate,
        toDate,
        keyword,
        getCacheKey,
        isCacheValid,
        isRecordInDateRange,
    ]);

    const debouncedFetch = useCallback(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            fetchData();
        }, 300); // 300ms debounce
    }, [fetchData]);

    // Fetch data khi các param thay đổi
    useEffect(() => {
        debouncedFetch();

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [page, limit, fromDate, toDate, keyword, debouncedFetch]);

    // Xóa cache khi có thay đổi
    const invalidateCache = useCallback(() => {
        cache.current = {
            data: {},
            timestamp: {},
            totalCount: 0,
        };
    }, []);

    // Refresh data và cache
    const refresh = useCallback(() => {
        invalidateCache();
        debouncedFetch();
    }, [invalidateCache, debouncedFetch]);

    // Handle filter changes
    const handlePageChange = useCallback(
        (newPage) => {
            setPage(newPage);
            // Reset cache khi chuyển trang với filter đang hoạt động
            if (fromDate || toDate || keyword) {
                invalidateCache();
            }
        },
        [fromDate, toDate, keyword, invalidateCache]
    );

    const handleLimitChange = useCallback(
        (newLimit) => {
            setLimit(newLimit);
            setPage(1); // Reset về trang đầu tiên khi thay đổi limit
            invalidateCache(); // Luôn xóa cache khi thay đổi limit
        },
        [invalidateCache]
    );

    const handleDateFilterChange = useCallback(
        (newFromDate, newToDate) => {
            // Xử lý trường hợp ngày không hợp lệ
            if (newFromDate && newToDate) {
                // Chuyển đổi thành đối tượng Date để so sánh
                const fromDateObj = new Date(newFromDate);
                fromDateObj.setHours(0, 0, 0, 0); // Đảm bảo fromDate bắt đầu từ 00:00:00

                const toDateObj = new Date(newToDate);
                toDateObj.setHours(23, 59, 59, 999); // Đảm bảo toDate kết thúc vào 23:59:59.999

                // Đảm bảo toDate không sớm hơn fromDate
                if (fromDateObj > toDateObj) {
                    // Nếu fromDate > toDate, đặt toDate = fromDate + 23:59:59
                    const adjustedToDate = new Date(fromDateObj);
                    adjustedToDate.setHours(23, 59, 59, 999);
                    setFromDate(fromDateObj);
                    setToDate(adjustedToDate);
                } else {
                    setFromDate(fromDateObj);
                    setToDate(toDateObj);
                }
            } else if (newFromDate) {
                // Chỉ có fromDate
                const fromDateObj = new Date(newFromDate);
                fromDateObj.setHours(0, 0, 0, 0);
                setFromDate(fromDateObj);
                setToDate(newToDate);
            } else if (newToDate) {
                // Chỉ có toDate
                const toDateObj = new Date(newToDate);
                toDateObj.setHours(23, 59, 59, 999);
                setFromDate(newFromDate);
                setToDate(toDateObj);
            } else {
                // Cả hai đều null
                setFromDate(null);
                setToDate(null);
            }

            setPage(1); // Reset về trang đầu tiên khi thay đổi filter
            invalidateCache(); // Xóa cache khi thay đổi filter ngày
        },
        [invalidateCache]
    );

    const handleKeywordChange = useCallback(
        (newKeyword) => {
            setKeyword(newKeyword);
            setPage(1); // Reset về trang đầu tiên khi thay đổi keyword
            invalidateCache(); // Xóa cache khi thay đổi keyword
        },
        [invalidateCache]
    );

    return {
        data,
        loading,
        error,
        hasMore,
        totalCount,
        totalPages,
        page,
        limit,
        fromDate,
        toDate,
        keyword,
        refresh,
        invalidateCache,
        handlePageChange,
        handleLimitChange,
        handleDateFilterChange,
        handleKeywordChange,
    };
};

export default useHistoryData;
