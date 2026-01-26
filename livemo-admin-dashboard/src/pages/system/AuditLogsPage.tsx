import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Grid,
    InputAdornment,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Chip,
} from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { getAdminAuditLogs } from '../../api/admin';
import type { AuditLog } from '../../api/admin';
import { useAuthStore } from '../../stores/authStore';

const AuditLogsPage = () => {
    const token = useAuthStore((s) => s.token);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(50);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({ q: '', action: '', entity_type: '', admin_id: '' });

    const pageCount = useMemo(() => Math.ceil(total / perPage) || 1, [total, perPage]);

    const loadLogs = async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const response = await getAdminAuditLogs(token, {
                page,
                q: filters.q || undefined,
                action: filters.action || undefined,
                entity_type: filters.entity_type || undefined,
                admin_id: filters.admin_id ? Number(filters.admin_id) : undefined,
                limit: perPage,
            });
            setLogs(response.data ?? []);
            setPerPage(response.per_page ?? perPage);
            setTotal(response.total ?? response.data?.length ?? 0);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, page, filters]);

    const handleFilterChange = (field: keyof typeof filters) => (value: string) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
        setPage(1);
    };

    return (
        <Box>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        Audit Logs
                    </Typography>
                    <Typography color="text.secondary">Trace every admin action across the platform.</Typography>
                </Box>
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadLogs} disabled={loading}>
                    Refresh
                </Button>
            </Stack>

            {error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            ) : null}

            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            label="Search"
                            placeholder="Action, entity, IP"
                            value={filters.q}
                            onChange={(event) => handleFilterChange('q')(event.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <TextField
                            label="Action"
                            value={filters.action}
                            onChange={(event) => handleFilterChange('action')(event.target.value)}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <TextField
                            label="Entity type"
                            value={filters.entity_type}
                            onChange={(event) => handleFilterChange('entity_type')(event.target.value)}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <TextField
                            label="Admin ID"
                            type="number"
                            value={filters.admin_id}
                            onChange={(event) => handleFilterChange('admin_id')(event.target.value)}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <TextField
                            label="Per page"
                            type="number"
                            value={String(perPage)}
                            onChange={(event) => {
                                const value = Math.max(10, Number(event.target.value) || 10);
                                setPerPage(value);
                                setPage(1);
                            }}
                            inputProps={{ min: 10, step: 10 }}
                            fullWidth
                        />
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ width: '100%', overflow: 'auto' }}>
                {loading ? (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : logs.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                        <Typography color="text.secondary">No audit events match your filters.</Typography>
                    </Box>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Action</TableCell>
                                <TableCell>Entity</TableCell>
                                <TableCell>Admin</TableCell>
                                <TableCell>IP</TableCell>
                                <TableCell>Timestamp</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id} hover>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Chip label={log.action} size="small" color="primary" variant="outlined" />
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight={600}>{log.entity_type ?? 'N/A'}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            #{log.entity_id ?? '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight={600}>{log.admin_id ?? '—'}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            ID
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{log.ip_address ?? '—'}</TableCell>
                                    <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Paper>

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Page {page} of {pageCount}
                </Typography>
                <Stack direction="row" spacing={1}>
                    <Button variant="outlined" disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
                        Previous
                    </Button>
                    <Button variant="contained" disabled={page === pageCount} onClick={() => setPage((prev) => prev + 1)}>
                        Next
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default AuditLogsPage;
