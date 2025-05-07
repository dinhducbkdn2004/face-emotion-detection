import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Component hiển thị ảnh với đường viền và số thứ tự cho khuôn mặt
 * @param {Object} props
 * @param {string} props.imageUrl - URL của ảnh (có thể là blob URL)
 * @param {Array} props.faces - Mảng các khuôn mặt với thông tin box
 */
const FaceBoxOverlay = ({ imageUrl, faces }) => {
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [scale, setScale] = useState(1);

    useEffect(() => {
        if (!imageUrl) return;

        const image = new Image();
        image.src = imageUrl;

        image.onload = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const imageAspectRatio = image.width / image.height;

                // Tính toán kích thước ảnh để vừa với container
                let newWidth = containerWidth;
                let newHeight = containerWidth / imageAspectRatio;

                // Giới hạn chiều cao tối đa
                const maxHeight = 500;
                if (newHeight > maxHeight) {
                    newHeight = maxHeight;
                    newWidth = maxHeight * imageAspectRatio;
                }

                // Tính tỷ lệ scale để vẽ box chính xác
                setScale(newWidth / image.width);
                setDimensions({ width: newWidth, height: newHeight });
            }
        };
    }, [imageUrl]);

    return (
        <Box
            ref={containerRef}
            sx={{
                position: 'relative',
                width: '100%',
                mb: 2,
                '& img': {
                    width: dimensions.width,
                    height: dimensions.height,
                    objectFit: 'contain',
                },
            }}
        >
            <img src={imageUrl} alt="Ảnh phân tích" />

            {/* Vẽ box và số thứ tự cho từng khuôn mặt */}
            {faces &&
                faces.map((face, index) => {
                    const [x, y, width, height] = face.box;
                    return (
                        <React.Fragment key={index}>
                            {/* Box khuôn mặt */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    left: x * scale,
                                    top: y * scale,
                                    width: width * scale,
                                    height: height * scale,
                                    border: '2px solid #2196f3',
                                    borderRadius: '4px',
                                    pointerEvents: 'none',
                                }}
                            />

                            {/* Số thứ tự */}
                            <Typography
                                sx={{
                                    position: 'absolute',
                                    left: x * scale,
                                    top: y * scale - 24,
                                    backgroundColor: '#2196f3',
                                    color: 'white',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.875rem',
                                    fontWeight: 'bold',
                                }}
                            >
                                {index + 1}
                            </Typography>
                        </React.Fragment>
                    );
                })}
        </Box>
    );
};

export default FaceBoxOverlay;
