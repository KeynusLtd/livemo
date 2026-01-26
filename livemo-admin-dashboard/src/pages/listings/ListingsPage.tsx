    const toggleFeatured = async (listing: AdminListing) => {
        if (!token) return;
        setDrawerSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await updateAdminListingFeature(token, listing.id, !listing.featured);
            setListings((prev) => prev.map((l) => (l.id === response.listing.id ? response.listing : l)));
            setSelectedListing(response.listing);
            setSuccess(response.listing.featured ? 'Listing marked as featured' : 'Listing removed from featured');
        } catch (err: any) {
            setError(err?.message ?? 'Failed to update featured state');
        } finally {
            setDrawerSubmitting(false);
        }
    };

    const removeListing = async (listing: AdminListing) => {
        if (!token) return;
        if (!window.confirm(`Remove listing "${listing.title}"? This cannot be undone.`)) return;
        setDrawerSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            await deleteAdminListing(token, listing.id);
            setListings((prev) => prev.filter((l) => l.id !== listing.id));
            setSuccess('Listing removed');
            handleCloseDrawer();
        } catch (err: any) {
            setError(err?.message ?? 'Failed to delete listing');
        } finally {
            setDrawerSubmitting(false);
        }
    };

import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Drawer,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Switch,
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
import { Check as ApproveIcon, Block as RejectIcon, Refresh as RefreshIcon, Visibility as VisibilityIcon, Search as SearchIcon } from '@mui/icons-material';
import {
    deleteAdminListing,
    getAdminListings,
    updateAdminListingFeature,
    updateAdminListingStatus,
} from '../../api/admin';
import type { AdminListing } from '../../api/admin';
import { useAuthStore } from '../../stores/authStore';

const statusFilters = [
    { label: 'Pending review', value: 'pending_review' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Draft', value: 'draft' },
    { label: 'All statuses', value: 'all' },
];

const typeFilters = [
    { label: 'All types', value: 'all' },
    { label: 'Livestock', value: 'livestock' },
    { label: 'Products', value: 'product' },
    { label: 'Services', value: 'service' },
];

const ListingsPage = () => {
    const token = useAuthStore((s) => s.token);

    const [listings, setListings] = useState<AdminListing[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [perPage, setPerPage] = useState(20);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending_review');
    const [typeFilter, setTypeFilter] = useState('all');

    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedListing, setSelectedListing] = useState<AdminListing | null>(null);
    const [drawerSubmitting, setDrawerSubmitting] = useState(false);

    const pageCount = useMemo(() => Math.ceil(total / perPage) || 1, [total, perPage]);

    const loadListings = async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const response = await getAdminListings(token, {
                page,
                status: statusFilter,
                type: typeFilter,
                search: search.trim() || undefined,
            });
            setListings(response.data);
            setTotal(response.total);
            setPerPage(response.per_page);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to load listings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadListings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, page, statusFilter, typeFilter, search]);

    const handleStatusChange = (event: SelectChangeEvent) => {
        setStatusFilter(event.target.value);
        setPage(1);
    };

    const handleTypeChange = (event: SelectChangeEvent) => {
        setTypeFilter(event.target.value);
        setPage(1);
    };

    const approveListing = async (listing: AdminListing) => {
        if (!token) return;
        setActionLoading(listing.id);
        setError(null);
        setSuccess(null);
        try {
            const response = await updateAdminListingStatus(token, listing.id, 'active');
            setListings((prev) => prev.filter((l) => l.id !== response.listing.id));
            setSuccess(`${response.listing.title} approved and published`);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to approve listing');
        } finally {
            setActionLoading(null);
        }
    };

    const rejectListing = async (listing: AdminListing) => {
        if (!token) return;
        setActionLoading(listing.id);
        setError(null);
        setSuccess(null);
        try {
            const response = await updateAdminListingStatus(token, listing.id, 'inactive');
            setListings((prev) => prev.filter((l) => l.id !== response.listing.id));
            setSuccess(`${response.listing.title} moved to inactive`);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to update listing');
        } finally {
            setActionLoading(null);
        }
    };

    const pendingCount = useMemo(() => listings.filter((l) => l.status === 'pending_review').length, [listings]);

    const highlightStats = useMemo(
        () => [
            { label: 'Pending review', value: statusFilter === 'pending_review' ? total : pendingCount },
            { label: 'Featured', value: listings.filter((l) => l.featured).length },
            { label: 'High-value (>$5k)', value: listings.filter((l) => Number(l.price ?? 0) > 5000).length },
        ],
        [listings, pendingCount, statusFilter, total],
    );

    const handleOpenDrawer = (listing: AdminListing) => {
        setSelectedListing(listing);
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setSelectedListing(null);
        setDrawerOpen(false);
    };

    return (
        <Box>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        Listings Approval Queue
                    </Typography>
                    <Typography color="text.secondary">
                        Review, approve, or reject marketplace submissions before they go live.
                    </Typography>
                </Box>
                <Button variant="text" startIcon={<RefreshIcon />} disabled={loading} onClick={loadListings}>
                    Refresh
                </Button>
            </Stack>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                {highlightStats.map((stat) => (
                    <Grid item xs={12} md={4} key={stat.label}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography variant="overline" color="text.secondary">
                                {stat.label}
                            </Typography>
                            <Typography variant="h5" fontWeight="bold">
                                {stat.value}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                        fullWidth
                        placeholder="Search listings"
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
                        <InputLabel id="status-filter-label">Status</InputLabel>
                        <Select labelId="status-filter-label" label="Status" value={statusFilter} onChange={handleStatusChange}>
                            {statusFilters.map((status) => (
                                <MenuItem key={status.value} value={status.value}>
                                    {status.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ maxWidth: 220 }}>
                        <InputLabel id="type-filter-label">Type</InputLabel>
                        <Select labelId="type-filter-label" label="Type" value={typeFilter} onChange={handleTypeChange}>
                            {typeFilters.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                    {type.label}
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

            <Paper sx={{ width: '100%', overflow: 'auto' }}>
                {loading ? (
                    <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : listings.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                        <Typography color="text.secondary">No listings match the current filters.</Typography>
                    </Box>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Listing</TableCell>
                                <TableCell>Seller</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Submitted</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {listings.map((listing) => (
                                <TableRow key={listing.id} hover>
                                    <TableCell>
                                        <Box>
                                            <Typography fontWeight={600}>{listing.title}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {listing.type ?? '—'} · #{listing.id}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Stack spacing={0.5}>
                                            <Typography fontWeight={500}>{listing.seller?.name ?? 'Unknown'}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {listing.seller?.email ?? '—'}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={listing.status}
                                            size="small"
                                            color={listing.status === 'pending_review' ? 'warning' : listing.status === 'active' ? 'success' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {listing.price != null ? `${listing.currency ?? '$'}${Number(listing.price).toLocaleString()}` : '—'}
                                    </TableCell>
                                    <TableCell>{new Date(listing.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                            <Tooltip title="Preview details">
                                                <IconButton onClick={() => handleOpenDrawer(listing)}>
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Approve listing">
                                                <span>
                                                    <IconButton
                                                        color="success"
                                                        disabled={actionLoading === listing.id || listing.status === 'active'}
                                                        onClick={() => approveListing(listing)}
                                                    >
                                                        <ApproveIcon />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Reject / deactivate">
                                                <span>
                                                    <IconButton
                                                        color="warning"
                                                        disabled={actionLoading === listing.id || listing.status === 'inactive'}
                                                        onClick={() => rejectListing(listing)}
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

            <Drawer anchor="right" open={drawerOpen} onClose={handleCloseDrawer} PaperProps={{ sx: { width: 420 } }}>
                {selectedListing ? (
                    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" fontWeight="bold">
                            {selectedListing.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Listing #{selectedListing.id} · {selectedListing.status}
                        </Typography>

                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                            <Chip label={selectedListing.type ?? '—'} size="small" variant="outlined" />
                            {selectedListing.featured ? <Chip label="Featured" size="small" color="primary" /> : null}
                        </Stack>

                        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3 }}>
                            Seller
                        </Typography>
                        <Typography fontWeight={600}>{selectedListing.seller?.name ?? 'Unknown'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {selectedListing.seller?.email ?? '—'}
                        </Typography>

                        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3 }}>
                            Pricing
                        </Typography>
                        <Typography>
                            {selectedListing.price != null
                                ? `${selectedListing.currency ?? '$'}${Number(selectedListing.price).toLocaleString()}`
                                : 'Not provided'}
                        </Typography>

                        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3 }}>
                            Description
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {selectedListing.description || 'No description provided.'}
                        </Typography>

                        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3 }}>
                            Location
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {selectedListing.location || '—'}
                        </Typography>

                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 3 }}>
                            <Typography>Featured</Typography>
                            <Switch
                                checked={!!selectedListing.featured}
                                onChange={() => toggleFeatured(selectedListing)}
                                disabled={drawerSubmitting}
                            />
                        </Stack>

                        <Stack direction="row" spacing={1.5} sx={{ mt: 'auto' }}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="success"
                                disabled={actionLoading === selectedListing.id}
                                onClick={() => approveListing(selectedListing)}
                            >
                                Approve
                            </Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="warning"
                                disabled={actionLoading === selectedListing.id}
                                onClick={() => rejectListing(selectedListing)}
                            >
                                Reject
                            </Button>
                        </Stack>

                        <Button
                            sx={{ mt: 1 }}
                            fullWidth
                            color="error"
                            variant="text"
                            onClick={() => removeListing(selectedListing)}
                            disabled={drawerSubmitting}
                        >
                            Remove listing
                        </Button>
                    </Box>
                ) : null}
            </Drawer>
        </Box>
    );
};

export default ListingsPage;
