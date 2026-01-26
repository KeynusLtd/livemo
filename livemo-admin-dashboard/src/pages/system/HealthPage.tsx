import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, Grid, Paper, Stack, Typography } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { getAdminHealth } from '../../api/admin';
import type { AdminHealth } from '../../api/admin';
import { useAuthStore } from '../../stores/authStore';

const HealthPage = () => {
    const token = useAuthStore((s) => s.token);
    const [health, setHealth] = useState<AdminHealth | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadHealth = async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const response = await getAdminHealth(token);
            setHealth(response);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to fetch health status');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHealth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const statusColor = (ok: boolean) => (ok ? 'success' : 'warning');

    return (
        <Box>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        System Health
                    </Typography>
                    <Typography color="text.secondary">Monitor backend services powering the marketplace.</Typography>
                </Box>
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadHealth} disabled={loading}>
                    Refresh
                </Button>
            </Stack>

            {error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            ) : null}

            {loading && !health ? (
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                    <CircularProgress />
                </Paper>
            ) : null}

            {health ? (
                <Stack spacing={3}>
                    <Paper sx={{ p: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <Typography variant="overline" color="text.secondary">
                                    Overall status
                                </Typography>
                                <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip label={health.status === 'ok' ? 'Healthy' : 'Degraded'} color={health.status === 'ok' ? 'success' : 'warning'} />
                                    <Typography component="span" variant="body2" color="text.secondary">
                                        Last checked {new Date(health.timestamp).toLocaleString()}
                                    </Typography>
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={8}>
                                <Typography variant="overline" color="text.secondary">
                                    Database
                                </Typography>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Chip label={health.database.ok ? 'Connected' : 'Issue'} color={statusColor(health.database.ok)} />
                                    {health.database.error ? (
                                        <Typography variant="body2" color="error.main">
                                            {health.database.error}
                                        </Typography>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            All queries responding
                                        </Typography>
                                    )}
                                </Stack>
                            </Grid>
                        </Grid>
                    </Paper>
                </Stack>
            ) : null}
        </Box>
    );
};

export default HealthPage;
