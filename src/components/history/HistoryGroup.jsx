import React from 'react';
import { Box, Typography, List, ListItem, Divider } from '@mui/material';
import HistoryItem from './HistoryItem';

const HistoryGroup = ({ date, items, onView, onDelete }) => {
    return (
        <Box sx={{ mb: 3 }}>
            <Typography
                variant="h6"
                sx={{
                    mb: 2,
                    color: 'text.secondary',
                    fontSize: '1rem',
                    fontWeight: 500,
                }}
            >
                {date}
            </Typography>
            <List
                sx={{
                    display: 'grid',
                    gridTemplateColumns:
                        'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: 2,
                    p: 0,
                }}
            >
                {items.map((item, index) => (
                    <ListItem
                        key={item.id}
                        sx={{
                            p: 0,
                            display: 'block',
                            width: '100%',
                        }}
                    >
                        <HistoryItem
                            item={item}
                            onView={() => onView(item)}
                            onDelete={() => onDelete(item)}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default HistoryGroup;
