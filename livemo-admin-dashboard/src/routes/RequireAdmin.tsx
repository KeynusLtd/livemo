import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuthStore } from '../stores/authStore';

const RequireAdmin = () => {
    const location = useLocation();
    const { token, user, hydrated, hydrate, fetchMe, logout } = useAuthStore();

    useEffect(() => {
        if (!hydrated) hydrate();
    }, [hydrate, hydrated]);

    useEffect(() => {
        if (hydrated && token && !user) {
            fetchMe().catch(() => {
                logout();
            });
        }
    }, [fetchMe, hydrated, logout, token, user]);

    if (!hydrated) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!token) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (!user) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (user.role !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default RequireAdmin;
