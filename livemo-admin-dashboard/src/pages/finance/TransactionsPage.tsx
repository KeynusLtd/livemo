import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
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
} from '@mui/material';
import { Refresh as RefreshIcon, Search as SearchIcon } from '@mui/icons-material';
import { getAdminFinanceSummary, getAdminTransactions } from '../../api/admin';
import type { AdminFinanceSummary, AdminOrder } from '../../api/admin';
import { useAuthStore } from '../../stores/authStore';

const TransactionsPage = () => {
    const token = useAuthStore((s) => s.token);
    const [transactions, setTransactions] = useState<AdminOrder[]>([]);
    const [summary, setSummary] = useState<AdminFinanceSummary | null>(null);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState('');

    const filteredTransactions = useMemo(() => {
        if (!search.trim()) return transactions;
        const term = search.toLowerCase();
        return transactions.filter((txn) => {
            const buyer = txn.buyer?.name ?? txn.buyer?.email ?? '';
            const seller = txn.seller?.name ?? txn.seller?.email ?? '';
            return buyer.toLowerCase().includes(term) || seller.toLowerCase().includes(term) || String(txn.id).includes(term);
        });
    }, [search, transactions]);

    const pageCount = useMemo(() => Math.ceil(total / perPage) || 1, [total, perPage]);

    const loadTransactions = async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const response = await getAdminTransactions(token, { page });
            setTransactions(response.data);
            setPerPage(response.per_page);
            setTotal(response.total);
            const summaryResponse = await getAdminFinanceSummary(token);
            setSummary(summaryResponse);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, page]);

    return (
        <Box>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        Transaction History
                    </Typography>
                    <Typography color="text.secondary">Audit payments flowing through the marketplace.</Typography>
                </Box>
                <Button startIcon={<RefreshIcon />} onClick={loadTransactions} disabled={loading}>
                    Refresh
                </Button>
            </Stack>

            {summary ? (
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
                    <Paper sx={{ p: 2, flex: 1 }}>
                        <Typography variant="overline" color="text.secondary">
                            Revenue ({summary.range.from} → {summary.range.to})
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                            ${summary.revenue_total.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {summary.orders_count} orders
                        </Typography>
                    </Paper>
                    <Paper sx={{ p: 2, flex: 1 }}>
                        <Typography variant="overline" color="text.secondary">
                            Commission (rate {Math.round(summary.commission_rate * 100)}%)
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                            ${summary.estimated_commission_total.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Projected earnings</Typography>
                    </Paper>
                    <Paper sx={{ p: 2, flex: 1 }}>
                        <Typography variant="overline" color="text.secondary">
                            Payouts
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                            ${summary.payouts_total.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Released to sellers</Typography>
                    </Paper>
                </Stack>
            ) : null}

            <Paper sx={{ p: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Search by order #, buyer, or seller"
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
            </Paper>

            {error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            ) : null}

            <Paper sx={{ width: '100%', overflow: 'auto' }}>
                {loading ? (
                    <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : filteredTransactions.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                        <Typography color="text.secondary">No transactions found.</Typography>
                    </Box>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Order</TableCell>
                                <TableCell>Buyer</TableCell>
                                <TableCell>Seller</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Payment</TableCell>
                                <TableCell align="right">Amount</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredTransactions.map((txn) => (
                                <TableRow key={txn.id}>
                                    <TableCell>#{txn.id}</TableCell>
                                    <TableCell>
                                        <Typography fontWeight={600}>{txn.buyer?.name ?? '—'}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {txn.buyer?.email ?? '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight={600}>{txn.seller?.name ?? '—'}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {txn.seller?.email ?? '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip size="small" label={txn.status} color={txn.status === 'completed' ? 'success' : 'default'} />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            variant="outlined"
                                            label={txn.payment_status ?? '—'}
                                            color={txn.payment_status === 'completed' ? 'success' : 'warning'}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        {txn.currency ?? '$'}
                                        {txn.total.toLocaleString()}
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
        </Box>
    );
};

export default TransactionsPage;
