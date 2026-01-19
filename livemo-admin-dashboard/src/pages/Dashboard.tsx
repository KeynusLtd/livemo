import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import {
    People as PeopleIcon,
    AttachMoney as MoneyIcon,
    Store as StoreIcon,
    TrendingUp
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color, trend }: any) => (
    <Paper sx={{ p: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', height: '100%' }}>
        <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                {value}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUp sx={{ color: 'success.main', fontSize: 16 }} />
                <Typography variant="caption" color="success.main" fontWeight="600">
                    {trend}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    vs last month
                </Typography>
            </Box>
        </Box>
        <Box sx={{
            p: 1.5,
            borderRadius: '12px',
            bgcolor: `${color}.light`,
            color: 'white',
            display: 'flex'
        }}>
            {icon}
        </Box>
    </Paper>
);

const Dashboard = () => {
    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">Hello, Admin 👋</Typography>
                <Typography variant="body1" color="text.secondary">Here's what's happening in your marketplace today.</Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Users"
                        value="12,345"
                        trend="+12%"
                        icon={<PeopleIcon />}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Revenue"
                        value="$45,678"
                        trend="+8%"
                        icon={<MoneyIcon />}
                        color="secondary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Listings"
                        value="1,234"
                        trend="+24%"
                        icon={<StoreIcon />}
                        color="warning"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="New Signups"
                        value="125"
                        trend="+4%"
                        icon={<PeopleIcon />}
                        color="info"
                    />
                </Grid>
            </Grid>

            {/* Placeholder for Recent Activity */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Recent Activity</Typography>
                <Paper sx={{ p: 3, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary">Detailed activity chart/table to be implemented.</Typography>
                </Paper>
            </Box>
        </Box>
    );
};

export default Dashboard;
