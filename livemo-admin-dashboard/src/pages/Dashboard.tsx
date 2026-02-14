import React, { useEffect, useMemo, useState } from 'react';
import { Paper, Typography, Box, Alert, List, ListItem, ListItemText, Chip, Divider, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
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
    getAdminUserGrowth,
    getAdminMarketplaceActivity,
    getAdminListings,
    getAdminCategories,
} from '../api/admin';
import type { AdminFinanceSummary, RevenueTrend, AuditLog, UserGrowth, MarketplaceActivity, AdminListing, AdminCategory } from '../api/admin';
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

const LineChart = ({ title, subtitle, points, valueKey }: { title: string; subtitle?: string; points: any[]; valueKey: string }) => {
    const width = 560;
    const height = 180;
    const padding = 20;

    const values = points.map((p) => Number(p?.[valueKey] ?? 0));
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 1);
    const range = Math.max(max - min, 1);

    const path = points
        .map((p, idx) => {
            const x = padding + (idx * (width - padding * 2)) / Math.max(points.length - 1, 1);
            const y = height - padding - ((Number(p?.[valueKey] ?? 0) - min) * (height - padding * 2)) / range;
            return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(' ');

    const last = values[values.length - 1] ?? 0;

    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ mb: 1 }}>
                <Typography variant="h6" fontWeight="bold">{title}</Typography>
                {subtitle ? <Typography variant="body2" color="text.secondary">{subtitle}</Typography> : null}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                <Typography variant="h5" fontWeight="bold">{Number.isFinite(last) ? last.toLocaleString() : '—'}</Typography>
                <Typography variant="caption" color="text.secondary">Last point</Typography>
            </Box>
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                    <path d={path} fill="none" stroke="#1976d2" strokeWidth="3" />
                </svg>
            </Box>
        </Paper>
    );
};

const CombinedBarChart = ({
    title,
    subtitle,
    listings,
    orders,
}: {
    title: string;
    subtitle?: string;
    listings: any[];
    orders: any[];
}) => {
    const width = 1140;
    const height = 220;
    const padding = 24;

    const map = new Map<string, { day: string; listings_created: number; orders_completed: number }>();
    for (const r of listings ?? []) {
        const day = String((r as any).day ?? '');
        if (!day) continue;
        map.set(day, {
            day,
            listings_created: Number((r as any).listings_created ?? 0),
            orders_completed: map.get(day)?.orders_completed ?? 0,
        });
    }
    for (const r of orders ?? []) {
        const day = String((r as any).day ?? '');
        if (!day) continue;
        map.set(day, {
            day,
            listings_created: map.get(day)?.listings_created ?? 0,
            orders_completed: Number((r as any).orders_completed ?? 0),
        });
    }

    const points = Array.from(map.values()).sort((a, b) => a.day.localeCompare(b.day));
    const maxValue = Math.max(1, ...points.map((p) => Math.max(p.listings_created, p.orders_completed)));
    const barAreaHeight = height - padding * 2;
    const barAreaWidth = width - padding * 2;
    const groupWidth = points.length ? barAreaWidth / points.length : barAreaWidth;
    const barWidth = Math.max(4, Math.min(18, groupWidth / 3));

    return (
        <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold">
                {title}
            </Typography>
            {subtitle ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {subtitle}
                </Typography>
            ) : null}

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Box sx={{ width: 10, height: 10, bgcolor: 'primary.main', borderRadius: 0.5 }} />
                    <Typography variant="caption" color="text.secondary">Listings</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Box sx={{ width: 10, height: 10, bgcolor: 'success.main', borderRadius: 0.5 }} />
                    <Typography variant="caption" color="text.secondary">Orders</Typography>
                </Box>
            </Box>

            <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ maxHeight: height }}>
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e0e0e0" />

                {points.map((p, i) => {
                    const xCenter = padding + i * groupWidth + groupWidth / 2;
                    const listingsH = (p.listings_created / maxValue) * barAreaHeight;
                    const ordersH = (p.orders_completed / maxValue) * barAreaHeight;
                    const gap = Math.max(2, barWidth / 2);

                    const xListings = xCenter - gap;
                    const xOrders = xCenter + gap - barWidth;

                    return (
                        <g key={p.day}>
                            <rect
                                x={xListings}
                                y={height - padding - listingsH}
                                width={barWidth}
                                height={listingsH}
                                fill="#1976d2"
                                rx="2"
                            />
                            <rect
                                x={xOrders}
                                y={height - padding - ordersH}
                                width={barWidth}
                                height={ordersH}
                                fill="#2e7d32"
                                rx="2"
                            />

                            {i % Math.ceil(points.length / 6 || 1) === 0 ? (
                                <text x={xCenter} y={height - 6} textAnchor="middle" fontSize="10" fill="#888">
                                    {p.day.slice(5)}
                                </text>
                            ) : null}
                        </g>
                    );
                })}
            </svg>
        </Paper>
    );
};

const Dashboard = () => {
    const token = useAuthStore((s) => s.token);
    const [stats, setStats] = useState<any | null>(null);
    const [health, setHealth] = useState<any | null>(null);
    const [finance, setFinance] = useState<AdminFinanceSummary | null>(null);
    const [trend, setTrend] = useState<RevenueTrend | null>(null);
    const [userGrowth, setUserGrowth] = useState<UserGrowth | null>(null);
    const [activity, setActivity] = useState<MarketplaceActivity | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [latestListings, setLatestListings] = useState<AdminListing[]>([]);
    const [latestCategories, setLatestCategories] = useState<AdminCategory[]>([]);
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
            getAdminUserGrowth(token, 30),
            getAdminMarketplaceActivity(token, 30),
            getAdminAuditLogs(token, { limit: 10 }),
            getAdminListings(token, { page: 1 }),
            getAdminCategories(token, { page: 1 }),
        ])
            .then(([s, h, f, rt, ug, ma, logs, listings, categories]) => {
                if (cancelled) return;
                setStats(s);
                setHealth(h);
                setFinance(f);
                setTrend(rt);
                setUserGrowth(ug);
                setActivity(ma);
                setAuditLogs(logs.data ?? []);
                setLatestListings((listings.data ?? []).slice(0, 6));
                setLatestCategories((categories.data ?? []).slice(0, 6));
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

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                    gap: 3,
                }}
            >
                <StatCard
                    title="Total Users"
                    value={stats ? stats.total_users : '—'}
                    trend="—"
                    icon={<PeopleIcon />}
                    color="primary"
                />
                <StatCard
                    title="Total Revenue"
                    value={stats ? `$${Number(stats.revenue).toFixed(2)}` : '—'}
                    trend={revenueTrendLabel}
                    icon={<MoneyIcon />}
                    color="secondary"
                />
                <StatCard
                    title="Active Listings"
                    value={stats ? stats.active_listings : '—'}
                    trend={finance ? `${finance.orders_count} orders in range` : 'Last 30 days'}
                    icon={<StoreIcon />}
                    color="warning"
                />
                <StatCard
                    title="System Health"
                    value={healthLabel}
                    trend="—"
                    icon={<PeopleIcon />}
                    color="info"
                />
            </Box>

            <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                <LineChart
                    title="User Growth"
                    subtitle="New users per day (last 30 days)"
                    points={userGrowth?.points ?? []}
                    valueKey="count"
                />
                <LineChart
                    title="Revenue Trends"
                    subtitle="Revenue per day (completed payments)"
                    points={trend?.points ?? []}
                    valueKey="revenue"
                />
            </Box>

            <Box sx={{ mt: 3 }}>
                <CombinedBarChart
                    title="Marketplace Activity"
                    subtitle="Listings created vs orders completed (per day)"
                    listings={activity?.listings ?? []}
                    orders={activity?.orders ?? []}
                />
            </Box>

            <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Latest Listings
                    </Typography>
                    <Paper sx={{ p: 2, overflow: 'auto' }}>
                        {latestListings.length === 0 ? (
                            <Typography color="text.secondary">No listings found.</Typography>
                        ) : (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Title</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Price</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {latestListings.map((l) => (
                                        <TableRow key={l.id} hover>
                                            <TableCell>
                                                <Typography fontWeight={600}>{l.title}</Typography>
                                                <Typography variant="body2" color="text.secondary">#{l.id}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip size="small" label={l.status} variant="outlined" />
                                            </TableCell>
                                            <TableCell align="right">
                                                {l.currency ?? '$'}{l.price != null ? Number(l.price).toLocaleString() : '—'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Paper>
                </Box>

                <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Latest Categories
                    </Typography>
                    <Paper sx={{ p: 2, overflow: 'auto' }}>
                        {latestCategories.length === 0 ? (
                            <Typography color="text.secondary">No categories found.</Typography>
                        ) : (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Active</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {latestCategories.map((c) => (
                                        <TableRow key={c.id} hover>
                                            <TableCell>
                                                <Typography fontWeight={600}>{c.name}</Typography>
                                                <Typography variant="body2" color="text.secondary">{c.slug}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip size="small" label={c.type} variant="outlined" />
                                            </TableCell>
                                            <TableCell>
                                                <Chip size="small" label={c.is_active ? 'Active' : 'Inactive'} color={c.is_active ? 'success' : 'default'} variant="outlined" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Paper>
                </Box>
            </Box>

            <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 3 }}>
                <Box>
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
                </Box>

                <Box>
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
                </Box>
            </Box>
        </Box>
    );
};

export default Dashboard;
