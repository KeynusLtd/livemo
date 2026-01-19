import React from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Outlet } from 'react-router-dom';
import theme from '../theme/theme';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';

const AdminLayout = () => {
    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <Header />
                <Sidebar />
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        bgcolor: 'background.default',
                        p: 3,
                        minHeight: '100vh',
                        width: { sm: `calc(100% - 240px)` }, // Adjust this if drawer is different width
                    }}
                >
                    <Toolbar /> {/* Spacer for fixed appbar */}
                    <Outlet />
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default AdminLayout;
