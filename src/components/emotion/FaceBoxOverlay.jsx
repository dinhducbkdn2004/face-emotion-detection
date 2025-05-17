import React, {
    useEffect,
    useRef,
    useState,
    useMemo,
    useCallback,
} from 'react';
import { Box, Typography, useTheme } from '@mui/material';

/**
 * Component hiển thị ảnh với đường viền và số thứ tự cho khuôn mặt
 * @param {Object} props
 * @param {string} props.imageUrl - URL của ảnh (có thể là blob URL)
 * @param {Array} props.faces - Mảng các khuôn mặt với thông tin box
 * @param {Function} props.onFaceClick - Hàm xử lý khi click vào khuôn mặt
 */
const FaceBoxOverlay = ({ imageUrl, faces, onFaceClick }) => {
    const theme = useTheme();
    const containerRef = useRef(null);
    const imageRef = useRef(null);
    const [imageDimensions, setImageDimensions] = useState({
        width: 0,
        height: 0,
    });
    const [originalDimensions, setOriginalDimensions] = useState({
        width: 0,
        height: 0,
    });
    const [containerDimensions, setContainerDimensions] = useState({
        width: 0,
        height: 0,
    });
    const [loaded, setLoaded] = useState(false);
    const [highlightedFace, setHighlightedFace] = useState(null);

    // Các màu sắc không bị ảnh hưởng bởi theme
    const COLORS = useMemo(
        () => ({
            boxColor: '#2196f3',
            hoverBoxShadow: '0 0 0 2px #2196f3, 0 0 10px #2196f3',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            tooltipBg: 'rgba(0,0,0,0.75)',
        }),
        []
    );

    // Tính toán màu nền dựa trên theme
    const backgroundColor = useMemo(
        () =>
            theme.palette.mode === 'dark'
                ? 'rgba(0,0,0,0.7)'
                : 'rgba(240,240,240,0.7)',
        [theme.palette.mode]
    );

    // Cập nhật kích thước khi ảnh được tải hoặc kích thước thay đổi
    const updateDimensions = useCallback(() => {
        if (imageRef.current && containerRef.current) {
            // Kích thước thực tế của ảnh đã được render
            setImageDimensions({
                width: imageRef.current.offsetWidth,
                height: imageRef.current.offsetHeight,
            });

            // Kích thước gốc của ảnh
            setOriginalDimensions({
                width: imageRef.current.naturalWidth,
                height: imageRef.current.naturalHeight,
            });

            // Kích thước của container
            setContainerDimensions({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight,
            });

            setLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (!imageUrl) return;

        const image = new Image();
        image.src = imageUrl;
        image.onload = updateDimensions;

        // Cập nhật ngay lập tức nếu ảnh đã được tải
        if (imageRef.current?.complete) {
            updateDimensions();
        }

        // Thêm listener cho sự kiện resize
        window.addEventListener('resize', updateDimensions);

        return () => {
            window.removeEventListener('resize', updateDimensions);
        };
    }, [imageUrl, updateDimensions]);

    // Thêm listener cho theme change để đảm bảo cập nhật khi chuyển theme
    useEffect(() => {
        // Chờ một chút để theme áp dụng xong rồi cập nhật lại dimensions
        const timeoutId = setTimeout(() => {
            updateDimensions();
        }, 50);

        return () => clearTimeout(timeoutId);
    }, [theme.palette.mode, updateDimensions]);

    // Tính toán tỷ lệ thu phóng - chỉ tính lại khi cần thiết
    const { scaleX, scaleY } = useMemo(() => {
        if (!loaded || !faces?.length || !originalDimensions.width || !originalDimensions.height) 
            return { scaleX: 1, scaleY: 1 };

        // Tính tỷ lệ thu phóng dựa trên kích thước ảnh gốc
        const scaleX = imageDimensions.width / originalDimensions.width;
        const scaleY = imageDimensions.height / originalDimensions.height;

        return { scaleX, scaleY };
    }, [loaded, faces, imageDimensions, originalDimensions]);

    // Xử lý khi nhấp vào bounding box
    const handleFaceClick = useCallback(
        (index) => {
            if (onFaceClick) {
                onFaceClick(index);
            }
        },
        [onFaceClick]
    );

    // Xử lý hover khuôn mặt
    const handleFaceHover = useCallback((index) => {
        setHighlightedFace(index);
    }, []);

    const handleFaceLeave = useCallback(() => {
        setHighlightedFace(null);
    }, []);

    // Tạo box styling trước để tối ưu render
    const containerStyle = useMemo(
        () => ({
            position: 'relative',
            width: '100%',
            mb: 2,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            bgcolor: backgroundColor,
            height: { xs: 250, sm: 300, md: 350 },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'background-color 0.2s ease',
        }),
        [backgroundColor]
    );

    const imageStyle = useMemo(
        () => ({
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
        }),
        []
    );

    // Render face boxes chỉ khi needed
    const renderFaceBoxes = () => {
        if (!loaded || !faces) return null;

        return faces.map((face, index) => {
            if (
                !face.box ||
                !Array.isArray(face.box) ||
                face.box.length !== 4
            ) {
                console.error(
                    `FaceBoxOverlay: Không tìm thấy box hợp lệ cho face #${index}`,
                    face
                );
                return null;
            }

            const [x, y, width, height] = face.box;

            // Tính offset từ cạnh container đến cạnh ảnh
            const offsetLeft =
                (containerDimensions.width - imageDimensions.width) / 2;
            const offsetTop =
                (containerDimensions.height - imageDimensions.height) / 2;

            return (
                <React.Fragment key={index}>
                    {/* Box khuôn mặt */}
                    <Box
                        sx={{
                            position: 'absolute',
                            left: `${offsetLeft + x * scaleX}px`,
                            top: `${offsetTop + y * scaleY}px`,
                            width: `${width * scaleX}px`,
                            height: `${height * scaleY}px`,
                            border: `2px solid ${COLORS.boxColor}`,
                            borderRadius: '4px',
                            transition: 'all 0.3s ease',
                            zIndex: 1,
                            cursor: 'pointer',
                            boxShadow:
                                highlightedFace === index
                                    ? COLORS.hoverBoxShadow
                                    : 'none',
                            '&:hover': {
                                boxShadow: COLORS.hoverBoxShadow,
                            },
                        }}
                        onClick={() => handleFaceClick(index)}
                        onMouseEnter={() => handleFaceHover(index)}
                        onMouseLeave={handleFaceLeave}
                    />

                    {/* Số thứ tự */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: `${offsetTop + y * scaleY - 14}px`,
                            left: `${offsetLeft + x * scaleX + 2}px`,
                            minWidth: '24px',
                            height: '24px',
                            backgroundColor: COLORS.boxColor,
                            color: '#fff',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            boxShadow: COLORS.boxShadow,
                            zIndex: 2,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                        }}
                        onClick={() => handleFaceClick(index)}
                        onMouseEnter={() => handleFaceHover(index)}
                        onMouseLeave={handleFaceLeave}
                    >
                        {index + 1}
                    </Box>

                    {/* Thông tin cảm xúc chính khi hover */}
                    {highlightedFace === index &&
                        face.emotions &&
                        face.emotions.length > 0 && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: `${
                                        offsetTop + (y + height) * scaleY + 5
                                    }px`,
                                    left: `${offsetLeft + x * scaleX}px`,
                                    backgroundColor: COLORS.tooltipBg,
                                    color: '#fff',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    zIndex: 2,
                                    whiteSpace: 'nowrap',
                                    boxShadow: COLORS.boxShadow,
                                }}
                            >
                                {face.emotions[0].emotion
                                    .charAt(0)
                                    .toUpperCase() +
                                    face.emotions[0].emotion.slice(1)}
                                : {face.emotions[0].percentage.toFixed(1)}%
                            </Box>
                        )}
                </React.Fragment>
            );
        });
    };

    return (
        <Box ref={containerRef} sx={containerStyle}>
            <Box
                component="img"
                ref={imageRef}
                src={imageUrl}
                alt="Ảnh phân tích"
                sx={imageStyle}
                onLoad={() => setLoaded(true)}
            />

            {/* Vẽ box và số thứ tự cho từng khuôn mặt */}
            {renderFaceBoxes()}
        </Box>
    );
};

export default React.memo(FaceBoxOverlay);
