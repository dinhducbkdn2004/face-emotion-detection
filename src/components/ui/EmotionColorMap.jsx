import { Mood as MoodIcon } from '@mui/icons-material';

/**
 * Map cảm xúc với màu sắc tương ứng
 */
export const emotionColors = {
    happy: '#4caf50',
    sad: '#5c6bc0',
    angry: '#f44336',
    surprise: '#ff9800',
    fear: '#9c27b0',
    disgust: '#795548',
    neutral: '#607d8b',
    contempt: '#795548',
};

/**
 * Hàm lấy icon cho cảm xúc
 * @param {string} emotion - Loại cảm xúc
 * @returns {JSX.Element} Icon tương ứng
 */
export const getEmotionIcon = (emotion) => {
    return <MoodIcon />;
};

// Component mặc định export để import dễ dàng
const EmotionColorMap = { emotionColors, getEmotionIcon };

export default EmotionColorMap;
