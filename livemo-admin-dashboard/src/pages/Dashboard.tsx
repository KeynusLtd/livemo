import React, { useEffect, useMemo, useState } from 'react';
import { Grid, Paper, Typography, Box, Alert, List, ListItem, ListItemText, Chip, Divider } from '@mui/material';
import {
    People as PeopleIcon,
    AttachMoney as MoneyIcon,
    Store as StoreIcon,
    TrendingUp,
} from '@mui/icons-material';
import {
    getAdminHealth,
    getAdminStats,
    getAdminFinanceSummary,
    getAdminRevenueTrend,
    getAdminAuditLogs,
} from '../api/admin';
import type { AdminFinanceSummary, RevenueTrend, AuditLog } from '../api/admin';
import { useAuthStore } from '../stores/authStore';

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
    const token = useAuthStore((s) => s.token);
    const [stats, setStats] = useState<any | null>(null);
    const [health, setHealth] = useState<any | null>(null);
    const [finance, setFinance] = useState<AdminFinanceSummary | null>(null);
    const [trend, setTrend] = useState<RevenueTrend | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [error, setError] = useState<string | null>(null);

    const healthLabel = useMemo(() => {
        if (!health) return '—';
        return health.status === 'ok' ? 'Healthy' : 'Degraded';
    }, [health]);

    const revenueTrendLabel = useMemo(() => {
        if (!trend || trend.points.length < 2) return 'Last 30 days';
        const first = trend.points[0]?.revenue ?? 0;
        const last = trend.points[trend.points.length - 1]?.revenue ?? 0;
        if (first === 0 && last === 0) return 'Stable';
        if (first === 0) return 'Up';
        const change = ((last - first) / Math.abs(first)) * 100;
        const rounded = Math.round(change);
        if (rounded > 0) return `+${rounded}% vs start of period`;
        if (rounded < 0) return `${rounded}% vs start of period`;
        return 'No change vs start of period';
    }, [trend]);

    useEffect(() => {
        if (!token) return;
        let cancelled = false;

        Promise.all([
            getAdminStats(token),
            getAdminHealth(token),
            getAdminFinanceSummary(token),
            getAdminRevenueTrend(token, 30),
            getAdminAuditLogs(token, 10),
        ])
            .then(([s, h, f, rt, logs]) => {
                if (cancelled) return;
                setStats(s);
                setHealth(h);
                setFinance(f);
                setTrend(rt);
                setAuditLogs(logs.data ?? []);
            })
            .catch((e: any) => {
                if (cancelled) return;
                setError(e?.message ?? 'Failed to load dashboard data');
            });

        return () => {
            cancelled = true;
        };
    }, [token]);

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">Hello, Admin</Typography>
                <Typography variant="body1" color="text.secondary">Here's what's happening in your marketplace today.</Typography>
            </Box>

            {error ? (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            ) : null}

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Users"
                        value={stats ? stats.total_users : '—'}
                        trend="—"
                        icon={<PeopleIcon />}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Revenue"
                        value={stats ? `$${Number(stats.revenue).toFixed(2)}` : '—'}
                        trend={revenueTrendLabel}
                        icon={<MoneyIcon />}
                        color="secondary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Listings"
                        value={stats ? stats.active_listings : '—'}
                        trend={finance ? `${finance.orders_count} orders in range` : 'Last 30 days'}
                        icon={<StoreIcon />}
                        color="warning"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="System Health"
                        value={healthLabel}
                        trend="—"
                        icon={<PeopleIcon />}
                        color="info"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={7}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Recent Activity
                    </Typography>
                    <Paper sx={{ p: 2 }}>
                        {auditLogs.length === 0 ? (
                            <Box sx={{ py: 4, textAlign: 'center' }}>
                                <Typography color="text.secondary">No recent admin activity yet.</Typography>
                            </Box>
                        ) : (
                            <List dense>
                                {auditLogs.slice(0, 10).map((log) => (
                                    <React.Fragment key={log.id}>
                                        <ListItem>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Chip size="small" label={log.action} variant="outlined" />
                                                        {log.entity_type ? (
                                                            <Typography variant="body2" color="text.secondary">
                                                                {log.entity_type}#{log.entity_id ?? '-'}
                                                            </Typography>
                                                        ) : null}
                                                    </Box>
                                                }
                                                secondary={new Date(log.created_at).toLocaleString()}
                                            />
                                        </ListItem>
                                        <Divider component="li" />
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={5}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Pending Actions
                    </Typography>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Listings awaiting review
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                    {stats ? stats.pending_listings : '—'}
                                </Typography>
                            </Box>
                            <Chip label="Listings" color="warning" variant="outlined" />
                        </Box>

                        {finance && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Revenue in range
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold">
                                        ${finance.revenue_total.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Chip label={`${finance.orders_count} orders`} color="primary" variant="outlined" />
                            </Box>
                        )}

                        {finance && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Estimated commission
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold">
                                        ${finance.estimated_commission_total.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={`${(finance.commission_rate * 100).toFixed(1)}% rate`}
                                    color="success"
                                    variant="outlined"
                                />
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
