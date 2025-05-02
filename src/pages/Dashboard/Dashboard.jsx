import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import EmotionDetector from '../../components/EmotionDetector';

const Dashboard = () => {
    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    mb={4}
                    textAlign="center"
                >
                    Dashboard
                </Typography>

                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, md: 3 },
                        borderRadius: 3,
                        bgcolor: 'transparent',
                    }}
                >
                    <EmotionDetector />
                </Paper>
            </Box>
        </Container>
    );
};

export default Dashboard;
