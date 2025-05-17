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

    const getCacheKey = useCallback(() => {
        const skip = (page - 1) * limit;
        return `${skip}-${limit}-${fromDate?.toISOString() || ''}-${toDate?.toISOString() || ''}-${keyword}`;
    }, [page, limit, fromDate, toDate, keyword]);

    const isCacheValid = useCallback((key) => {
        const timestamp = cache.current.timestamp[key];
        return timestamp && Date.now() - timestamp < CACHE_TIME;
    }, []);

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
            // Giả sử API đã được cập nhật để hỗ trợ các tham số filter
            const response = await getEmotionHistory(skip, limit, {
                fromDate,
                toDate,
                keyword,
            });

            // Xử lý cấu trúc phản hồi từ API
            let responseData = [];
            let count = 0;

            if (Array.isArray(response)) {
                // Nếu response là mảng, API trả về trực tiếp danh sách bản ghi
                responseData = response;

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

                // Nếu có trường totalCount, sử dụng nó
                if (
                    response.totalCount !== undefined ||
                    response.total_count !== undefined ||
                    response.total !== undefined
                ) {
                    count =
                        response.totalCount ||
                        response.total_count ||
                        response.total;
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
    }, [page, limit, fromDate, toDate, keyword, getCacheKey, isCacheValid]);

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
    const handlePageChange = useCallback((newPage) => {
        setPage(newPage);
        // Không đặt lại fromDate và toDate khi chuyển trang
    }, []);

    const handleLimitChange = useCallback((newLimit) => {
        setLimit(newLimit);
        setPage(1); // Reset về trang đầu tiên khi thay đổi limit
    }, []);

    const handleDateFilterChange = useCallback((newFromDate, newToDate) => {
        setFromDate(newFromDate);
        setToDate(newToDate);
        setPage(1); // Reset về trang đầu tiên khi thay đổi filter
    }, []);

    const handleKeywordChange = useCallback((newKeyword) => {
        setKeyword(newKeyword);
        setPage(1); // Reset về trang đầu tiên khi thay đổi keyword
    }, []);

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
