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

            // Giả định response có cấu trúc { data: [...], totalCount: number }
            // Nếu API chỉ trả về mảng dữ liệu, bạn cần điều chỉnh đoạn code này
            const responseData = response.data || response;
            const count = response.totalCount || responseData.length;

            // Cập nhật cache
            cache.current.data[key] = responseData;
            cache.current.timestamp[key] = Date.now();
            cache.current.totalCount = count;

            setData(responseData);
            setTotalCount(count);
            setTotalPages(Math.ceil(count / limit));
            setHasMore(
                responseData.length === limit &&
                    skip + responseData.length < count
            );
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
