import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { Check as ApproveIcon, Block as RejectIcon, Refresh as RefreshIcon, Search as SearchIcon } from '@mui/icons-material';
import { getAdminUsers, updateAdminUserStatus } from '../../api/admin';
import type { AdminUser } from '../../api/admin';
import { useAuthStore } from '../../stores/authStore';

const roleOptions = [
    { label: 'All roles', value: 'all' },
    { label: 'Admins', value: 'admin' },
    { label: 'Farmers', value: 'farmer' },
    { label: 'Buyers', value: 'buyer' },
];

const verificationSteps = [
    { title: 'Review profile', description: 'Confirm name, email, and role match registration documents.' },
    { title: 'Check activity', description: 'Scan listings and orders for suspicious behaviour.' },
    { title: 'Approve or escalate', description: 'Verify the account, suspend it, or request more information.' },
];

const UserVerificationPage = () => {
    const token = useAuthStore((s) => s.token);
    const [queue, setQueue] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const loadQueue = async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const response = await getAdminUsers(token, {
                verification: 'pending',
                search: search.trim() || undefined,
                role: roleFilter,
            });
            setQueue(response.data);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to load verification queue');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadQueue();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, roleFilter, search]);

    const handleRoleChange = (event: SelectChangeEvent) => {
        setRoleFilter(event.target.value);
    };

    const approveUser = async (user: AdminUser) => {
        if (!token) return;
        setActionLoading(user.id);
        setError(null);
        setSuccess(null);
        try {
            const response = await updateAdminUserStatus(token, user.id, { is_verified: true, status: 'active' });
            setQueue((prev) => prev.filter((u) => u.id !== response.user.id));
            setSuccess(`${response.user.name || response.user.email} verified`);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to verify user');
        } finally {
            setActionLoading(null);
        }
    };

    const suspendUser = async (user: AdminUser) => {
        if (!token) return;
        setActionLoading(user.id);
        setError(null);
        setSuccess(null);
        try {
            const response = await updateAdminUserStatus(token, user.id, { status: 'suspended', is_verified: false });
            setQueue((prev) => prev.filter((u) => u.id !== response.user.id));
            setSuccess(`${response.user.name || response.user.email} suspended`);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to update user');
        } finally {
            setActionLoading(null);
        }
    };

    const pendingCount = queue.length;

    const highlightStats = useMemo(
        () => [
            { label: 'Awaiting review', value: pendingCount },
            { label: 'Farmers', value: queue.filter((u) => u.role === 'farmer').length },
            { label: 'Buyers', value: queue.filter((u) => u.role === 'buyer').length },
        ],
        [pendingCount, queue],
    );

    return (
        <Box>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        User Verification Queue
                    </Typography>
                    <Typography color="text.secondary">
                        Review pending accounts, confirm compliance, and approve or suspend with one click.
                    </Typography>
                </Box>
                <Button variant="text" startIcon={<RefreshIcon />} onClick={loadQueue} disabled={loading}>
                    Refresh
                </Button>
            </Stack>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                {highlightStats.map((stat) => (
                    <Grid item xs={12} md={4} key={stat.label}>
                        <Card sx={{ borderLeft: '4px solid', borderColor: 'primary.main' }}>
                            <CardContent>
                                <Typography variant="overline" color="text.secondary">
                                    {stat.label}
                                </Typography>
                                <Typography variant="h5" fontWeight="bold">
                                    {stat.value}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                        fullWidth
                        placeholder="Search applicants"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <FormControl fullWidth sx={{ maxWidth: 220 }}>
                        <InputLabel id="verification-role-filter">Role</InputLabel>
                        <Select labelId="verification-role-filter" label="Role" value={roleFilter} onChange={handleRoleChange}>
                            {roleOptions.map((role) => (
                                <MenuItem key={role.value} value={role.value}>
                                    {role.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </Paper>

            {error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            ) : null}

            {success ? (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            ) : null}

            <Paper sx={{ width: '100%', overflow: 'auto', mb: 4 }}>
                {loading ? (
                    <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : queue.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                        <Typography color="text.secondary">No pending verifications 🎉</Typography>
                    </Box>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Applicant</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Joined</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {queue.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>
                                        <Box>
                                            <Typography fontWeight={600}>{user.name || 'Unnamed user'}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {user.email}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={user.role} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={user.status} size="small" color={user.status === 'active' ? 'success' : 'warning'} />
                                    </TableCell>
                                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                            <Tooltip title="Approve and verify">
                                                <span>
                                                    <IconButton
                                                        color="success"
                                                        disabled={actionLoading === user.id}
                                                        onClick={() => approveUser(user)}
                                                    >
                                                        <ApproveIcon />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Suspend account">
                                                <span>
                                                    <IconButton
                                                        color="warning"
                                                        disabled={actionLoading === user.id}
                                                        onClick={() => suspendUser(user)}
                                                    >
                                                        <RejectIcon />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Paper>

            <Grid container spacing={2}>
                {verificationSteps.map((step, index) => (
                    <Grid item xs={12} md={4} key={step.title}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="overline" color="text.secondary">
                                    Step {index + 1}
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                    {step.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {step.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default UserVerificationPage;
