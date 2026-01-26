import { useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Drawer,
    FormControl,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Tab,
    Tabs,
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
import { Add as AddIcon, Refresh as RefreshIcon, ArrowForward as ArrowIcon } from '@mui/icons-material';
import {
    createAdminPayout,
    getAdminEscrowTransactions,
    getAdminPayouts,
    getAdminRefunds,
    releaseAdminEscrow,
    updateAdminPayoutStatus,
    updateAdminRefundStatus,
} from '../../api/admin';
import type { AdminPayout, EscrowTransaction, RefundRequest } from '../../api/admin';
import { useAuthStore } from '../../stores/authStore';

const payoutStatuses: AdminPayout['status'][] = ['requested', 'processing', 'paid', 'failed', 'cancelled'];
const refundStatuses: RefundRequest['status'][] = ['requested', 'approved', 'rejected', 'processed'];
const escrowTypes: EscrowTransaction['type'][] = ['hold', 'release', 'refund'];

const PayoutsPage = () => {
    const token = useAuthStore((s) => s.token);
    const [activeTab, setActiveTab] = useState<'payouts' | 'refunds' | 'escrow'>('payouts');

    // Shared notifications
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Payouts state
    const [payouts, setPayouts] = useState<AdminPayout[]>([]);
    const [payoutsPage, setPayoutsPage] = useState(1);
    const [payoutsTotal, setPayoutsTotal] = useState(0);
    const [payoutsPerPage, setPayoutsPerPage] = useState(20);
    const [payoutsLoading, setPayoutsLoading] = useState(false);
    const [payoutStatusFilter, setPayoutStatusFilter] = useState<AdminPayout['status'] | 'all'>('all');

    // Refunds state
    const [refunds, setRefunds] = useState<RefundRequest[]>([]);
    const [refundsPage, setRefundsPage] = useState(1);
    const [refundsTotal, setRefundsTotal] = useState(0);
    const [refundsPerPage, setRefundsPerPage] = useState(20);
    const [refundsLoading, setRefundsLoading] = useState(false);
    const [refundStatusFilter, setRefundStatusFilter] = useState<RefundRequest['status'] | 'all'>('all');

    // Escrow state
    const [escrow, setEscrow] = useState<EscrowTransaction[]>([]);
    const [escrowPage, setEscrowPage] = useState(1);
    const [escrowTotal, setEscrowTotal] = useState(0);
    const [escrowPerPage, setEscrowPerPage] = useState(20);
    const [escrowLoading, setEscrowLoading] = useState(false);
    const [escrowTypeFilter, setEscrowTypeFilter] = useState<EscrowTransaction['type'] | 'all'>('all');

    const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
    const [releaseDrawerOpen, setReleaseDrawerOpen] = useState(false);
    const [drawerSubmitting, setDrawerSubmitting] = useState(false);

    const [newPayout, setNewPayout] = useState({ seller_id: '', amount: '', currency: 'USD', notes: '' });
    const [releasePayload, setReleasePayload] = useState({ order_id: '', amount: '', currency: 'USD', notes: '' });

    const payoutPageCount = useMemo(() => Math.ceil(payoutsTotal / payoutsPerPage) || 1, [payoutsTotal, payoutsPerPage]);
    const refundPageCount = useMemo(() => Math.ceil(refundsTotal / refundsPerPage) || 1, [refundsTotal, refundsPerPage]);
    const escrowPageCount = useMemo(() => Math.ceil(escrowTotal / escrowPerPage) || 1, [escrowTotal, escrowPerPage]);

    const loadPayouts = async () => {
        if (!token) return;
        setPayoutsLoading(true);
        try {
            const response = await getAdminPayouts(token, {
                page: payoutsPage,
                status: payoutStatusFilter === 'all' ? undefined : payoutStatusFilter,
            });
            setPayouts(response.data);
            setPayoutsPerPage(response.per_page);
            setPayoutsTotal(response.total);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to load payouts');
        } finally {
            setPayoutsLoading(false);
        }
    };

    const loadRefunds = async () => {
        if (!token) return;
        setRefundsLoading(true);
        try {
            const response = await getAdminRefunds(token, {
                page: refundsPage,
                status: refundStatusFilter === 'all' ? undefined : refundStatusFilter,
            });
            setRefunds(response.data);
            setRefundsPerPage(response.per_page);
            setRefundsTotal(response.total);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to load refunds');
        } finally {
            setRefundsLoading(false);
        }
    };

    const loadEscrow = async () => {
        if (!token) return;
        setEscrowLoading(true);
        try {
            const response = await getAdminEscrowTransactions(token, {
                page: escrowPage,
                type: escrowTypeFilter === 'all' ? undefined : escrowTypeFilter,
            });
            setEscrow(response.data);
            setEscrowPerPage(response.per_page);
            setEscrowTotal(response.total);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to load escrow transactions');
        } finally {
            setEscrowLoading(false);
        }
    };

    useEffect(() => {
        loadPayouts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, payoutsPage, payoutStatusFilter]);

    useEffect(() => {
        loadRefunds();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, refundsPage, refundStatusFilter]);

    useEffect(() => {
        loadEscrow();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, escrowPage, escrowTypeFilter]);

    const handlePayoutStatusChange = async (payout: AdminPayout, status: AdminPayout['status']) => {
        if (!token || payout.status === status) return;
        setError(null);
        setSuccess(null);
        try {
            const response = await updateAdminPayoutStatus(token, payout.id, { status });
            setPayouts((prev) => prev.map((p) => (p.id === payout.id ? response.payout : p)));
            setSuccess(`Payout #${payout.id} updated`);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to update payout');
        }
    };

    const handleRefundStatusChange = async (refund: RefundRequest, status: RefundRequest['status']) => {
        if (!token || refund.status === status) return;
        setError(null);
        setSuccess(null);
        try {
            const response = await updateAdminRefundStatus(token, refund.id, { status });
            setRefunds((prev) => prev.map((r) => (r.id === refund.id ? response.refund : r)));
            setSuccess(`Refund #${refund.id} updated`);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to update refund');
        }
    };

    const handleCreatePayout = async () => {
        if (!token) return;
        setDrawerSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            const payload = {
                seller_id: Number(newPayout.seller_id),
                amount: Number(newPayout.amount),
                currency: newPayout.currency,
                notes: newPayout.notes || undefined,
            };
            const response = await createAdminPayout(token, payload);
            setPayouts((prev) => [response.payout, ...prev]);
            setSuccess('Payout request created');
            setCreateDrawerOpen(false);
            setNewPayout({ seller_id: '', amount: '', currency: 'USD', notes: '' });
        } catch (err: any) {
            setError(err?.message ?? 'Failed to create payout');
        } finally {
            setDrawerSubmitting(false);
        }
    };

    const handleReleaseEscrow = async () => {
        if (!token) return;
        setDrawerSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            const payload = {
                order_id: Number(releasePayload.order_id),
                amount: Number(releasePayload.amount),
                currency: releasePayload.currency,
                notes: releasePayload.notes || undefined,
            };
            const response = await releaseAdminEscrow(token, payload);
            setEscrow((prev) => [response.transaction, ...prev]);
            setSuccess('Escrow released');
            setReleaseDrawerOpen(false);
            setReleasePayload({ order_id: '', amount: '', currency: 'USD', notes: '' });
        } catch (err: any) {
            setError(err?.message ?? 'Failed to release escrow');
        } finally {
            setDrawerSubmitting(false);
        }
    };

    const renderStatusChip = (status: string, palette: 'primary' | 'success' | 'warning' | 'default') => (
        <Chip size="small" color={palette} label={status} />
    );

    return (
        <Box>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        Disbursements & Risk
                    </Typography>
                    <Typography color="text.secondary">Manage payouts, refunds, and escrow releases.</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => {
                        loadPayouts();
                        loadRefunds();
                        loadEscrow();
                    }}>
                        Sync data
                    </Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDrawerOpen(true)}>
                        New payout
                    </Button>
                    <Button variant="outlined" startIcon={<ArrowIcon />} onClick={() => setReleaseDrawerOpen(true)}>
                        Release escrow
                    </Button>
                </Stack>
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

            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={(_: SyntheticEvent, value: typeof activeTab) => setActiveTab(value)}
                    variant="scrollable"
                    allowScrollButtonsMobile
                >
                    <Tab label="Payouts" value="payouts" />
                    <Tab label="Refunds" value="refunds" />
                    <Tab label="Escrow" value="escrow" />
                </Tabs>
            </Paper>

            {activeTab === 'payouts' ? (
                <Paper sx={{ p: 2 }}>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel id="payout-status-label">Status</InputLabel>
                                <Select
                                    labelId="payout-status-label"
                                    label="Status"
                                    value={payoutStatusFilter}
                                    onChange={(event: SelectChangeEvent) => setPayoutStatusFilter(event.target.value as AdminPayout['status'] | 'all')}
                                >
                                    <MenuItem value="all">All statuses</MenuItem>
                                    {payoutStatuses.map((status) => (
                                        <MenuItem key={status} value={status}>
                                            {status}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {payoutsLoading ? (
                        <Box sx={{ py: 6, textAlign: 'center' }}>
                            <CircularProgress />
                        </Box>
                    ) : payouts.length === 0 ? (
                        <Typography color="text.secondary">No payouts found.</Typography>
                    ) : (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Seller</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Notes</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {payouts.map((payout) => (
                                    <TableRow key={payout.id}>
                                        <TableCell>#{payout.id}</TableCell>
                                        <TableCell>
                                            <Typography fontWeight={600}>{payout.seller?.name ?? 'Unknown'}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {payout.seller?.email ?? '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {payout.currency} {payout.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell sx={{ minWidth: 160 }}>
                                            <Select
                                                size="small"
                                                value={payout.status}
                                                onChange={(event: SelectChangeEvent) =>
                                                    handlePayoutStatusChange(payout, event.target.value as AdminPayout['status'])
                                                }
                                            >
                                                {payoutStatuses.map((status) => (
                                                    <MenuItem key={status} value={status}>
                                                        {status}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </TableCell>
                                        <TableCell>{payout.notes || '—'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 2 }}>
                        <Button variant="outlined" disabled={payoutsPage === 1} onClick={() => setPayoutsPage((prev) => prev - 1)}>
                            Previous
                        </Button>
                        <Button
                            variant="contained"
                            disabled={payoutsPage === payoutPageCount}
                            onClick={() => setPayoutsPage((prev) => prev + 1)}
                        >
                            Next
                        </Button>
                    </Stack>
                </Paper>
            ) : null}

            {activeTab === 'refunds' ? (
                <Paper sx={{ p: 2 }}>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel id="refund-status-label">Status</InputLabel>
                                <Select
                                    labelId="refund-status-label"
                                    label="Status"
                                    value={refundStatusFilter}
                                    onChange={(event: SelectChangeEvent) => setRefundStatusFilter(event.target.value as RefundRequest['status'] | 'all')}
                                >
                                    <MenuItem value="all">All statuses</MenuItem>
                                    {refundStatuses.map((status) => (
                                        <MenuItem key={status} value={status}>
                                            {status}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {refundsLoading ? (
                        <Box sx={{ py: 6, textAlign: 'center' }}>
                            <CircularProgress />
                        </Box>
                    ) : refunds.length === 0 ? (
                        <Typography color="text.secondary">No refund requests.</Typography>
                    ) : (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Order</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Reason</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {refunds.map((refund) => (
                                    <TableRow key={refund.id}>
                                        <TableCell>#{refund.id}</TableCell>
                                        <TableCell>
                                            <Typography fontWeight={600}>Order #{refund.order?.id ?? refund.order_id}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {refund.order?.buyer?.name ?? 'Buyer'} → {refund.order?.seller?.name ?? 'Seller'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {refund.currency} {refund.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell sx={{ minWidth: 160 }}>
                                            <Select
                                                size="small"
                                                value={refund.status}
                                                onChange={(event: SelectChangeEvent) =>
                                                    handleRefundStatusChange(refund, event.target.value as RefundRequest['status'])
                                                }
                                            >
                                                {refundStatuses.map((status) => (
                                                    <MenuItem key={status} value={status}>
                                                        {status}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={refund.details ?? ''}>
                                                <span>{refund.reason}</span>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 2 }}>
                        <Button variant="outlined" disabled={refundsPage === 1} onClick={() => setRefundsPage((prev) => prev - 1)}>
                            Previous
                        </Button>
                        <Button
                            variant="contained"
                            disabled={refundsPage === refundPageCount}
                            onClick={() => setRefundsPage((prev) => prev + 1)}
                        >
                            Next
                        </Button>
                    </Stack>
                </Paper>
            ) : null}

            {activeTab === 'escrow' ? (
                <Paper sx={{ p: 2 }}>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel id="escrow-type-label">Type</InputLabel>
                                <Select
                                    labelId="escrow-type-label"
                                    label="Type"
                                    value={escrowTypeFilter}
                                    onChange={(event: SelectChangeEvent) => setEscrowTypeFilter(event.target.value as EscrowTransaction['type'] | 'all')}
                                >
                                    <MenuItem value="all">All types</MenuItem>
                                    {escrowTypes.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {escrowLoading ? (
                        <Box sx={{ py: 6, textAlign: 'center' }}>
                            <CircularProgress />
                        </Box>
                    ) : escrow.length === 0 ? (
                        <Typography color="text.secondary">No escrow transactions.</Typography>
                    ) : (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Order</TableCell>
                                    <TableCell>Seller</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {escrow.map((txn) => (
                                    <TableRow key={txn.id}>
                                        <TableCell>#{txn.id}</TableCell>
                                        <TableCell>
                                            <Typography fontWeight={600}>Order #{txn.order?.id ?? txn.order_id}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {txn.order?.buyer?.name ?? 'Buyer'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography fontWeight={600}>{txn.seller?.name ?? '—'}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {txn.seller?.email ?? '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{renderStatusChip(txn.type, 'primary')}</TableCell>
                                        <TableCell>{renderStatusChip(txn.status, txn.status === 'completed' ? 'success' : 'warning')}</TableCell>
                                        <TableCell>
                                            {txn.currency} {txn.amount.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 2 }}>
                        <Button variant="outlined" disabled={escrowPage === 1} onClick={() => setEscrowPage((prev) => prev - 1)}>
                            Previous
                        </Button>
                        <Button
                            variant="contained"
                            disabled={escrowPage === escrowPageCount}
                            onClick={() => setEscrowPage((prev) => prev + 1)}
                        >
                            Next
                        </Button>
                    </Stack>
                </Paper>
            ) : null}

            <Drawer anchor="right" open={createDrawerOpen} onClose={() => setCreateDrawerOpen(false)}>
                <Box sx={{ width: { xs: 320, sm: 400 }, p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                        New Payout Request
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Issue a manual payout to a seller. Amounts will be logged in audit trail.
                    </Typography>

                    <Stack spacing={2}>
                        <TextField
                            label="Seller ID"
                            value={newPayout.seller_id}
                            onChange={(event) => setNewPayout((prev) => ({ ...prev, seller_id: event.target.value }))}
                            type="number"
                            fullWidth
                            required
                        />
                        <TextField
                            label="Amount"
                            value={newPayout.amount}
                            onChange={(event) => setNewPayout((prev) => ({ ...prev, amount: event.target.value }))}
                            type="number"
                            fullWidth
                            required
                            InputProps={{
                                startAdornment: <InputAdornment position="start">{newPayout.currency}</InputAdornment>,
                            }}
                        />
                        <TextField
                            label="Currency"
                            value={newPayout.currency}
                            onChange={(event) => setNewPayout((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))}
                            inputProps={{ maxLength: 3 }}
                            fullWidth
                        />
                        <TextField
                            label="Notes"
                            value={newPayout.notes}
                            onChange={(event) => setNewPayout((prev) => ({ ...prev, notes: event.target.value }))}
                            multiline
                            minRows={3}
                            placeholder="Optional reasoning"
                        />
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ mt: 4 }}>
                        <Button fullWidth variant="outlined" onClick={() => setCreateDrawerOpen(false)} disabled={drawerSubmitting}>
                            Cancel
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleCreatePayout}
                            disabled={drawerSubmitting || !newPayout.seller_id || !newPayout.amount}
                        >
                            {drawerSubmitting ? 'Saving…' : 'Create' }
                        </Button>
                    </Stack>
                </Box>
            </Drawer>

            <Drawer anchor="right" open={releaseDrawerOpen} onClose={() => setReleaseDrawerOpen(false)}>
                <Box sx={{ width: { xs: 320, sm: 400 }, p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                        Release Escrow Funds
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Unlock escrowed balance to the seller once delivery is confirmed.
                    </Typography>

                    <Stack spacing={2}>
                        <TextField
                            label="Order ID"
                            value={releasePayload.order_id}
                            onChange={(event) => setReleasePayload((prev) => ({ ...prev, order_id: event.target.value }))}
                            type="number"
                            fullWidth
                            required
                        />
                        <TextField
                            label="Amount"
                            value={releasePayload.amount}
                            onChange={(event) => setReleasePayload((prev) => ({ ...prev, amount: event.target.value }))}
                            type="number"
                            fullWidth
                            required
                            InputProps={{
                                startAdornment: <InputAdornment position="start">{releasePayload.currency}</InputAdornment>,
                            }}
                        />
                        <TextField
                            label="Currency"
                            value={releasePayload.currency}
                            onChange={(event) => setReleasePayload((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))}
                            inputProps={{ maxLength: 3 }}
                            fullWidth
                        />
                        <TextField
                            label="Notes"
                            value={releasePayload.notes}
                            onChange={(event) => setReleasePayload((prev) => ({ ...prev, notes: event.target.value }))}
                            multiline
                            minRows={3}
                            placeholder="Reference or instructions"
                        />
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ mt: 4 }}>
                        <Button fullWidth variant="outlined" onClick={() => setReleaseDrawerOpen(false)} disabled={drawerSubmitting}>
                            Cancel
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleReleaseEscrow}
                            disabled={drawerSubmitting || !releasePayload.order_id || !releasePayload.amount}
                        >
                            {drawerSubmitting ? 'Releasing…' : 'Release' }
                        </Button>
                    </Stack>
                </Box>
            </Drawer>
        </Box>
    );
};

export default PayoutsPage;
