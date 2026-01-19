import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const PlaceholderPage = ({ title }: { title: string }) => {
    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
                {title}
            </Typography>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                    {title} Module
                </Typography>
                <Typography variant="body2" color="text.disabled">
                    This feature is currently under development.
                </Typography>
            </Paper>
        </Box>
    );
};

export default PlaceholderPage;
