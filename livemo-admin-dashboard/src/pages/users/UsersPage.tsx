import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Drawer,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    Link as MuiLink,
    List,
    ListItem,
    ListItemText,
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
import {
    Refresh as RefreshIcon,
    Search as SearchIcon,
    CheckCircle as CheckCircleIcon,
    Block as BlockIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
} from '@mui/icons-material';
import {
    deleteAdminUser,
    getAdminAuditLogs,
    getAdminUserActivity,
    getAdminUsers,
    updateAdminUserStatus,
} from '../../api/admin';
import type { AdminUser, AuditLog, UserActivity } from '../../api/admin';
import { API_BASE_URL } from '../../api/client';
import { useAuthStore } from '../../stores/authStore';

const roleOptions = [
    { label: 'All roles', value: 'all' },
    { label: 'Admins', value: 'admin' },
    { label: 'Farmers', value: 'farmer' },
    { label: 'Buyers', value: 'buyer' },
];

const statusOptions = [
    { label: 'All statuses', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Suspended', value: 'suspended' },
];

const UsersPage = () => {
    const token = useAuthStore((s) => s.token);

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [perPage, setPerPage] = useState(20);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [activity, setActivity] = useState<UserActivity | null>(null);
    const [activityLoading, setActivityLoading] = useState(false);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [auditLoading, setAuditLoading] = useState(false);

    const pageCount = useMemo(() => Math.ceil(total / perPage) || 1, [total, perPage]);

    const loadUsers = async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const response = await getAdminUsers(token, {
                page,
                role: roleFilter,
                status: statusFilter,
                search: search.trim() || undefined,
            });
            setUsers(response.data);
            setTotal(response.total);
            setPerPage(response.per_page);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [roleFilter, statusFilter, search]);

    useEffect(() => {
        loadUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, roleFilter, statusFilter, search, token]);

    const handleRoleChange = (event: SelectChangeEvent) => {
        setRoleFilter(event.target.value);
    };

    const handleStatusChange = (event: SelectChangeEvent) => {
        setStatusFilter(event.target.value);
    };

    const handleVerifyToggle = async (user: AdminUser) => {
        if (!token) return;
        setActionLoading(user.id);
        setError(null);
        setSuccess(null);
        try {
            const response = await updateAdminUserStatus(token, user.id, { is_verified: !user.is_verified });
            setUsers((prev) => prev.map((u) => (u.id === user.id ? response.user : u)));
            setSuccess(
                response.user.is_verified ? `${response.user.name} is now verified` : `${response.user.name} verification removed`,
            );
        } catch (err: any) {
            setError(err?.message ?? 'Failed to update user');
        } finally {
            setActionLoading(null);
        }
    };

    const handleStatusUpdate = async (user: AdminUser, status: 'active' | 'suspended') => {
        if (!token) return;
        setActionLoading(user.id);
        setError(null);
        setSuccess(null);
        try {
            const response = await updateAdminUserStatus(token, user.id, { status });
            setUsers((prev) => prev.map((u) => (u.id === user.id ? response.user : u)));
            setSuccess(`${response.user.name} is now ${response.user.status}`);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to update user');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (user: AdminUser) => {
        if (!token) return;
        if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;
        setActionLoading(user.id);
        setError(null);
        setSuccess(null);
        try {
            await deleteAdminUser(token, user.id);
            setUsers((prev) => prev.filter((u) => u.id !== user.id));
            setSuccess(`${user.name} deleted`);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to delete user');
        } finally {
            setActionLoading(null);
        }
    };

    const loadDrawerData = async (user: AdminUser) => {
        if (!token) return;
        setActivityLoading(true);
        setAuditLoading(true);
        setActivity(null);
        setAuditLogs([]);
        try {
            const [activityResponse, logsResponse] = await Promise.all([
                getAdminUserActivity(token, user.id),
                getAdminAuditLogs(token, { entity_type: 'user', entity_id: user.id, limit: 5 }),
            ]);
            setActivity(activityResponse);
            setAuditLogs(logsResponse.data);
        } catch (err) {
            setActivity(null);
            setAuditLogs([]);
        } finally {
            setActivityLoading(false);
            setAuditLoading(false);
        }
    };

    const handleOpenDrawer = (user: AdminUser) => {
        setSelectedUser(user);
        setDrawerOpen(true);
        loadDrawerData(user);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedUser(null);
        setActivity(null);
    };

    const summaryChips = useMemo(
        () => [
            { label: 'Total users', value: total },
            { label: 'Verified', value: users.filter((u) => u.is_verified).length },
            { label: 'Admins', value: users.filter((u) => u.role === 'admin').length },
            { label: 'Suspended', value: users.filter((u) => u.status === 'suspended').length },
        ],
        [total, users],
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        User Management
                    </Typography>
                    <Typography color="text.secondary">Search, verify, and take action on users across the platform.</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadUsers} disabled={loading}>
                        Refresh
                    </Button>
                </Stack>
            </Box>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Search by name or email"
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
                <FormControl fullWidth sx={{ maxWidth: 200 }}>
                    <InputLabel id="role-filter-label">Role</InputLabel>
                    <Select labelId="role-filter-label" label="Role" value={roleFilter} onChange={handleRoleChange}>
                        {roleOptions.map((role) => (
                            <MenuItem key={role.value} value={role.value}>
                                {role.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth sx={{ maxWidth: 200 }}>
                    <InputLabel id="status-filter-label">Status</InputLabel>
                    <Select labelId="status-filter-label" label="Status" value={statusFilter} onChange={handleStatusChange}>
                        {statusOptions.map((status) => (
                            <MenuItem key={status.value} value={status.value}>
                                {status.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 2 }}>
                {summaryChips.map((chip) => (
                    <Chip key={chip.label} label={`${chip.label}: ${chip.value}`} variant="outlined" />
                ))}
            </Stack>

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

            <Paper sx={{ width: '100%', overflow: 'auto' }}>
                {loading ? (
                    <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : users.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                        <Typography color="text.secondary">No users match your filters.</Typography>
                    </Box>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Verified</TableCell>
                                <TableCell>Joined</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow hover key={user.id}>
                                    <TableCell>
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                {user.name?.[0]?.toUpperCase() ?? user.email[0]?.toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography fontWeight={600}>{user.name || 'Unnamed user'}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {user.email}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.role}
                                            size="small"
                                            color={user.role === 'admin' ? 'primary' : user.role === 'farmer' ? 'success' : 'default'}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.status}
                                            size="small"
                                            color={user.status === 'active' ? 'success' : 'warning'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            color={user.is_verified ? 'success' : 'default'}
                                            onClick={() => handleVerifyToggle(user)}
                                            disabled={actionLoading === user.id}
                                        >
                                            <CheckCircleIcon />
                                        </IconButton>
                                    </TableCell>
                                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                                            <Tooltip title="View activity">
                                                <IconButton onClick={() => handleOpenDrawer(user)}>
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={user.status === 'suspended' ? 'Activate' : 'Suspend'}>
                                                <IconButton
                                                    color={user.status === 'suspended' ? 'success' : 'warning'}
                                                    onClick={() =>
                                                        handleStatusUpdate(user, user.status === 'suspended' ? 'active' : 'suspended')
                                                    }
                                                    disabled={actionLoading === user.id}
                                                >
                                                    <BlockIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete user">
                                                <IconButton color="error" onClick={() => handleDelete(user)} disabled={actionLoading === user.id}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
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

            <Drawer anchor="right" open={drawerOpen} onClose={handleCloseDrawer} PaperProps={{ sx: { width: 400 } }}>
                <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                            {selectedUser?.name?.[0]?.toUpperCase() ?? selectedUser?.email?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="h6">{selectedUser?.name || 'User detail'}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {selectedUser?.email}
                            </Typography>
                        </Box>
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                        <Chip
                            label={selectedUser?.status}
                            color={selectedUser?.status === 'active' ? 'success' : 'warning'}
                            size="small"
                        />
                        <Chip
                            label={selectedUser?.is_verified ? 'Verified' : 'Unverified'}
                            color={selectedUser?.is_verified ? 'success' : 'default'}
                            size="small"
                        />
                    </Stack>

                    <Divider sx={{ my: 3 }} />

                    {activityLoading ? (
                        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CircularProgress />
                        </Box>
                    ) : activity ? (
                        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                Recent listings
                            </Typography>
                            {activity.recent.listings.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    No listings yet.
                                </Typography>
                            ) : (
                                activity.recent.listings.map((listing) => (
                                    <Box key={listing.id} sx={{ mb: 1 }}>
                                        <Typography fontWeight={600}>Listing #{listing.id}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {listing.status} · {listing.created_at ? new Date(listing.created_at).toLocaleDateString() : '—'}
                                        </Typography>
                                    </Box>
                                ))
                            )}

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                Recent purchases
                            </Typography>
                            {activity.recent.purchases.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    No purchases yet.
                                </Typography>
                            ) : (
                                activity.recent.purchases.map((purchase) => (
                                    <Box key={purchase.id} sx={{ mb: 1 }}>
                                        <Typography fontWeight={600}>Order #{purchase.id}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {purchase.status} · ${purchase.total_amount ?? 0}
                                        </Typography>
                                    </Box>
                                ))
                            )}

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                Recent sales
                            </Typography>
                            {activity.recent.sales.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    No sales yet.
                                </Typography>
                            ) : (
                                activity.recent.sales.map((sale) => (
                                    <Box key={sale.id} sx={{ mb: 1 }}>
                                        <Typography fontWeight={600}>Order #{sale.id}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {sale.status} · ${sale.total_amount ?? 0}
                                        </Typography>
                                    </Box>
                                ))
                            )}

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                Recent conversations
                            </Typography>
                            {activity.recent.conversations.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    No conversations recorded.
                                </Typography>
                            ) : (
                                <List dense>
                                    {activity.recent.conversations.map((conversation) => (
                                        <ListItem key={conversation.id} disableGutters>
                                            <ListItemText
                                                primary={`Conversation #${conversation.id}`}
                                                secondary={
                                                    conversation.last_message_at
                                                        ? new Date(conversation.last_message_at).toLocaleString()
                                                        : '—'
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Box>
                    ) : (
                        <Typography color="text.secondary">Select a user to load their activity.</Typography>
                    )}

                    <Divider sx={{ my: 3 }} />

                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Audit trail
                        </Typography>
                        {auditLoading ? (
                            <Box sx={{ py: 2, textAlign: 'center' }}>
                                <CircularProgress size={20} />
                            </Box>
                        ) : auditLogs.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No audit entries for this user yet.
                            </Typography>
                        ) : (
                            <List dense>
                                {auditLogs.map((log) => (
                                    <ListItem key={log.id} disableGutters>
                                        <ListItemText
                                            primary={log.action}
                                            secondary={new Date(log.created_at).toLocaleString()}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}

                        {selectedUser ? (
                            <Box sx={{ mt: 1 }}>
                                <MuiLink
                                    href={`${API_BASE_URL}/admin/audit-logs?entity_type=user&entity_id=${selectedUser.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="body2"
                                    underline="hover"
                                >
                                    Open full audit log (JSON)
                                </MuiLink>
                            </Box>
                        ) : null}
                    </Box>

                    <Divider sx={{ my: 3 }} />
                    <Button fullWidth variant="contained" onClick={handleCloseDrawer}>
                        Close
                    </Button>
                </Box>
            </Drawer>
        </Box>
    );
};

export default UsersPage;
