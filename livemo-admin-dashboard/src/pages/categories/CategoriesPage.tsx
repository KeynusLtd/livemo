import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Drawer,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Switch,
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
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Refresh as RefreshIcon, Search as SearchIcon } from '@mui/icons-material';
import {
    createAdminCategory,
    deleteAdminCategory,
    getAdminCategories,
    updateAdminCategory,
} from '../../api/admin';
import type { AdminCategory } from '../../api/admin';
import { useAuthStore } from '../../stores/authStore';

const typeOptions = [
    { label: 'All types', value: 'all' },
    { label: 'Products', value: 'product' },
    { label: 'Services', value: 'service' },
];

const statusOptions = [
    { label: 'All statuses', value: 'all' },
    { label: 'Active', value: '1' },
    { label: 'Inactive', value: '0' },
];

const emptyForm: Omit<AdminCategory, 'id' | 'created_at'> & { id?: number } = {
    id: undefined,
    parent_id: null,
    name: '',
    slug: '',
    description: '',
    icon: '',
    type: 'product',
    order: 0,
    is_active: true,
    updated_at: undefined,
};

const CategoriesPage = () => {
    const token = useAuthStore((s) => s.token);
    const [categories, setCategories] = useState<AdminCategory[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [perPage, setPerPage] = useState(20);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [formState, setFormState] = useState(emptyForm);
    const [formSubmitting, setFormSubmitting] = useState(false);

    const pageCount = useMemo(() => Math.ceil(total / perPage) || 1, [total, perPage]);

    const loadCategories = async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const response = await getAdminCategories(token, {
                page,
                type: typeFilter as 'product' | 'service' | 'all',
                is_active: statusFilter === 'all' ? undefined : statusFilter,
                search: search.trim() || undefined,
            });
            setCategories(response.data);
            setTotal(response.total);
            setPerPage(response.per_page);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, page, typeFilter, statusFilter, search]);

    const openCreateDrawer = () => {
        setFormState(emptyForm);
        setDrawerOpen(true);
    };

    const openEditDrawer = (category: AdminCategory) => {
        setFormState({ ...category });
        setDrawerOpen(true);
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        setFormSubmitting(false);
    };

    const handleTypeFilterChange = (event: SelectChangeEvent) => {
        setTypeFilter(event.target.value);
        setPage(1);
    };

    const handleStatusFilterChange = (event: SelectChangeEvent) => {
        setStatusFilter(event.target.value);
        setPage(1);
    };

    const handleFormChange = (field: keyof typeof formState, value: unknown) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!token) return;
        setFormSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            if (formState.id) {
                const response = await updateAdminCategory(token, formState.id, {
                    ...formState,
                    description: formState.description || null,
                    icon: formState.icon || null,
                });
                setCategories((prev) => prev.map((c) => (c.id === response.category.id ? response.category : c)));
                setSuccess('Category updated');
            } else {
                const response = await createAdminCategory(token, {
                    ...formState,
                    description: formState.description || null,
                    icon: formState.icon || null,
                });
                setCategories((prev) => [response.category, ...prev]);
                setSuccess('Category created');
            }
            closeDrawer();
        } catch (err: any) {
            setError(err?.message ?? 'Failed to save category');
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleDelete = async (category: AdminCategory) => {
        if (!token) return;
        if (!window.confirm(`Delete category "${category.name}"?`)) return;
        setError(null);
        setSuccess(null);
        try {
            await deleteAdminCategory(token, category.id);
            setCategories((prev) => prev.filter((c) => c.id !== category.id));
            setSuccess('Category deleted');
        } catch (err: any) {
            setError(err?.message ?? 'Failed to delete category');
        }
    };

    return (
        <Box>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        Category Management
                    </Typography>
                    <Typography color="text.secondary">Organize marketplace categories for listings and storefront navigation.</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Button variant="outlined" startIcon={<RefreshIcon />} disabled={loading} onClick={loadCategories}>
                        Refresh
                    </Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDrawer}>
                        Add category
                    </Button>
                </Stack>
            </Stack>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="overline" color="text.secondary">
                            Total categories
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                            {total}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="overline" color="text.secondary">
                            Active
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                            {categories.filter((c) => c.is_active).length}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="overline" color="text.secondary">
                            Product vs Service
                        </Typography>
                        <Typography variant="body2">
                            {categories.filter((c) => c.type === 'product').length} products · {categories.filter((c) => c.type === 'service').length} services
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                        fullWidth
                        placeholder="Search categories"
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
                        <InputLabel id="type-filter-label">Type</InputLabel>
                        <Select labelId="type-filter-label" label="Type" value={typeFilter} onChange={handleTypeFilterChange}>
                            {typeOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ maxWidth: 220 }}>
                        <InputLabel id="status-filter-label">Status</InputLabel>
                        <Select labelId="status-filter-label" label="Status" value={statusFilter} onChange={handleStatusFilterChange}>
                            {statusOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
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
                ) : categories.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                        <Typography color="text.secondary">No categories match your filters.</Typography>
                    </Box>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Order</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category.id} hover>
                                    <TableCell>
                                        <Typography fontWeight={600}>{category.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {category.slug}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={category.type} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={category.is_active ? 'Active' : 'Inactive'}
                                            size="small"
                                            color={category.is_active ? 'success' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>{category.order}</TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                                            <Tooltip title="Edit">
                                                <IconButton onClick={() => openEditDrawer(category)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton color="error" onClick={() => handleDelete(category)}>
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

            <Drawer anchor="right" open={drawerOpen} onClose={closeDrawer} PaperProps={{ sx: { width: 420 } }}>
                <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                        {formState.id ? 'Edit Category' : 'Create Category'}
                    </Typography>
                    <TextField
                        label="Name"
                        value={formState.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        required
                    />
                    <TextField
                        label="Slug"
                        value={formState.slug ?? ''}
                        onChange={(e) => handleFormChange('slug', e.target.value)}
                        helperText="Leave blank to auto-generate from name"
                    />
                    <TextField
                        label="Description"
                        value={formState.description ?? ''}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        multiline
                        minRows={2}
                    />
                    <TextField
                        label="Icon"
                        value={formState.icon ?? ''}
                        onChange={(e) => handleFormChange('icon', e.target.value)}
                        helperText="Optional icon class or emoji"
                    />
                    <FormControl fullWidth>
                        <InputLabel id="drawer-type-label">Type</InputLabel>
                        <Select
                            labelId="drawer-type-label"
                            label="Type"
                            value={formState.type}
                            onChange={(e) => handleFormChange('type', e.target.value)}
                        >
                            <MenuItem value="product">Product</MenuItem>
                            <MenuItem value="service">Service</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Order"
                        type="number"
                        value={formState.order}
                        onChange={(e) => handleFormChange('order', Number(e.target.value))}
                    />
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography>Active</Typography>
                        <Switch
                            checked={formState.is_active}
                            onChange={(e) => handleFormChange('is_active', e.target.checked)}
                        />
                    </Stack>
                    <Divider />
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleSubmit}
                            disabled={formSubmitting}
                        >
                            {formState.id ? 'Save changes' : 'Create category'}
                        </Button>
                        <Button variant="outlined" fullWidth onClick={closeDrawer}>
                            Cancel
                        </Button>
                    </Stack>
                </Box>
            </Drawer>
        </Box>
    );
};

export default CategoriesPage;
